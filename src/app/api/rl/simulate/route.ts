import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadAgent, saveAgent } from "@/lib/rl/q-table-store";
import { calculateReward } from "@/lib/rl/reward";
import {
  discretizeAccuracy,
  discretizeHint,
  discretizeSkill,
  discretizeStreak,
  stateToKey,
} from "@/lib/rl/state";
import type { AttemptOutcome, RLState } from "@/lib/rl/types";

interface SimulationProfile {
  name: string;
  initial_skill: number;
  solve_probability_curve: (skill: number, difficulty: number) => number;
}

const PROFILES: Record<string, SimulationProfile> = {
  pemula: {
    name: "Pemula",
    initial_skill: 0.2,
    solve_probability_curve: (skill, difficulty) => {
      const match = 1 - Math.abs(skill - (difficulty - 1) / 4);
      return clamp(match * 0.8 + 0.1, 0.1, 0.9);
    },
  },
  reguler: {
    name: "Reguler",
    initial_skill: 0.5,
    solve_probability_curve: (skill, difficulty) => {
      const match = 1 - Math.abs(skill - (difficulty - 1) / 4) * 0.7;
      return clamp(match * 0.85 + 0.1, 0.2, 0.95);
    },
  },
  mahir: {
    name: "Mahir",
    initial_skill: 0.7,
    solve_probability_curve: (skill, difficulty) => {
      const match = 1 - Math.abs(skill - (difficulty - 1) / 4) * 0.5;
      return clamp(match * 0.9 + 0.05, 0.3, 0.98);
    },
  },
};

interface SimulationRequest {
  module_id?: string;
  profile?: keyof typeof PROFILES;
  num_attempts?: number;
  reset_q_table?: boolean;
}

interface SimulationStep {
  step: number;
  state_key: string;
  action: number;
  difficulty: number;
  reward: number;
  solved: boolean;
  q_before: number;
  q_after: number;
  epsilon: number;
  skill_after: number;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as SimulationRequest;
    const moduleId = body.module_id;
    const profileKey = body.profile ?? "pemula";
    const profileConfig = PROFILES[profileKey];
    const safeAttempts = clampInt(body.num_attempts ?? 60, 10, 100);

    if (!moduleId) {
      return NextResponse.json(
        { error: "module_id required" },
        { status: 400 },
      );
    }

    if (!profileConfig) {
      return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
    }

    if (body.reset_q_table) {
      const admin = createAdminClient();
      const { error } = await admin
        .from("q_tables")
        .update({
          q_values: {},
          total_updates: 0,
          total_episodes: 0,
          epsilon: 1,
          updated_at: new Date().toISOString(),
        })
        .eq("module_id", moduleId);

      if (error) {
        throw error;
      }
    }

    const agent = await loadAgent(moduleId);

    let currentSkill = profileConfig.initial_skill;
    let recentResults: boolean[] = [];
    let recentHints: number[] = [];
    let streak = 0;
    const steps: SimulationStep[] = [];

    for (let index = 0; index < safeAttempts; index += 1) {
      const accuracy =
        recentResults.length > 0
          ? recentResults.filter((result) => result).length /
            recentResults.length
          : 0.5;
      const avgHints =
        recentHints.length > 0
          ? recentHints.reduce((sum, value) => sum + value, 0) /
            recentHints.length
          : 0;

      const state: RLState = {
        skill_bin: discretizeSkill(currentSkill),
        accuracy_bin: discretizeAccuracy(accuracy),
        streak_bin: discretizeStreak(streak),
        hint_bin: discretizeHint(avgHints),
      };

      const decision = agent.selectAction(state);
      const difficulty =
        decision.action === 1 ? 1.5 : decision.action === 2 ? 3 : 4.5;
      const solveProbability = profileConfig.solve_probability_curve(
        currentSkill,
        difficulty,
      );
      const solved = Math.random() < solveProbability;
      const progressScore = solved ? 1 : Math.random() * 0.6;

      const skillBefore = currentSkill;
      currentSkill = clamp(currentSkill + (solved ? 0.03 : -0.015), 0, 1);

      const hintsUsed = Math.random() < 0.3 ? Math.floor(Math.random() * 3) : 0;
      const timeRatio = 0.5 + Math.random() * 1.5;
      const outcome: AttemptOutcome = {
        solved,
        progress_score: progressScore,
        time_ratio: timeRatio,
        hints_used: hintsUsed,
        gave_up: false,
        difficulty_taken: Math.round(difficulty),
        skill_before: skillBefore,
        skill_after: currentSkill,
      };

      const reward = calculateReward(outcome).total;

      const nextRecentResults = [solved, ...recentResults].slice(0, 5);
      const nextRecentHints = [hintsUsed, ...recentHints].slice(0, 5);
      const nextStreak = solved
        ? streak >= 0
          ? streak + 1
          : 1
        : streak <= 0
          ? streak - 1
          : -1;

      const nextAccuracy =
        nextRecentResults.length > 0
          ? nextRecentResults.filter((result) => result).length /
            nextRecentResults.length
          : 0.5;
      const nextAvgHints =
        nextRecentHints.length > 0
          ? nextRecentHints.reduce((sum, value) => sum + value, 0) /
            nextRecentHints.length
          : 0;

      const nextState: RLState = {
        skill_bin: discretizeSkill(currentSkill),
        accuracy_bin: discretizeAccuracy(nextAccuracy),
        streak_bin: discretizeStreak(nextStreak),
        hint_bin: discretizeHint(nextAvgHints),
      };

      const update = agent.update(state, decision.action, reward, nextState);
      agent.decayEpsilon();

      recentResults = nextRecentResults;
      recentHints = nextRecentHints;
      streak = nextStreak;

      steps.push({
        step: index + 1,
        state_key: stateToKey(state),
        action: decision.action,
        difficulty: Math.round(difficulty),
        reward,
        solved,
        q_before: update.q_value_before,
        q_after: update.q_value_after,
        epsilon: decision.epsilon_at_decision,
        skill_after: currentSkill,
      });
    }

    await saveAgent(agent);

    return NextResponse.json({
      profile: profileConfig.name,
      total_steps: steps.length,
      final_skill: currentSkill,
      final_epsilon: agent.getMetadata().epsilon,
      final_q_table: agent.getQValues(),
      steps,
      summary: {
        total_solved: steps.filter((step) => step.solved).length,
        avg_reward:
          steps.reduce((sum, step) => sum + step.reward, 0) / steps.length,
        action_distribution: {
          1: steps.filter((step) => step.action === 1).length,
          2: steps.filter((step) => step.action === 2).length,
          3: steps.filter((step) => step.action === 3).length,
        },
      },
    });
  } catch (error) {
    console.error("RL simulation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.floor(value)));
}
