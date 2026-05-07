import { createAdminClient } from "@/lib/supabase/admin";
import { QLearningAgent } from "./q-learning";
import type { QTableData, QTableMetadata } from "./types";

export async function loadAgent(moduleId: string): Promise<QLearningAgent> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("q_tables")
    .select("*")
    .eq("module_id", moduleId)
    .maybeSingle();

  if (error || !data) {
    throw new Error(`Q-Table not found for module ${moduleId}`);
  }

  const qValues = (data.q_values as QTableData) ?? {};
  const metadata: QTableMetadata = {
    module_id: data.module_id,
    total_updates: data.total_updates ?? 0,
    total_episodes: data.total_episodes ?? 0,
    learning_rate: data.learning_rate ?? 0.1,
    discount_factor: data.discount_factor ?? 0.9,
    epsilon: data.epsilon ?? 1,
    epsilon_min: data.epsilon_min ?? 0.1,
    epsilon_decay: data.epsilon_decay ?? 0.995,
  };

  return new QLearningAgent(qValues, metadata);
}

export async function saveAgent(agent: QLearningAgent): Promise<void> {
  const supabase = createAdminClient();
  const snapshot = agent.getSnapshot();

  const { error } = await supabase
    .from("q_tables")
    .update({
      q_values: snapshot.qValues,
      total_updates: snapshot.metadata.total_updates,
      total_episodes: snapshot.metadata.total_episodes,
      epsilon: snapshot.metadata.epsilon,
      updated_at: new Date().toISOString(),
    })
    .eq("module_id", snapshot.metadata.module_id);

  if (error) {
    throw error;
  }
}
