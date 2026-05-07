import type {
  QTableData,
  QTableMetadata,
  RLAction,
  RLDecision,
  RLState,
} from "./types";
import { getAllStateKeys, stateToKey } from "./state";

export class QLearningAgent {
  private qValues: QTableData;
  private metadata: QTableMetadata;

  constructor(qValues: QTableData, metadata: QTableMetadata) {
    this.qValues = this.ensureAllStatesInitialized(qValues);
    this.metadata = metadata;
  }

  private ensureAllStatesInitialized(qValues: QTableData): QTableData {
    const initialized = { ...qValues };

    for (const key of getAllStateKeys()) {
      if (!initialized[key]) {
        initialized[key] = { 1: 0, 2: 0, 3: 0 };
      }
    }

    return initialized;
  }

  selectAction(state: RLState): RLDecision {
    const stateKey = stateToKey(state);
    const stateQValues = this.qValues[stateKey];
    const willExplore = Math.random() < this.metadata.epsilon;

    let action: RLAction;
    if (willExplore) {
      const actions: RLAction[] = [1, 2, 3];
      action = actions[Math.floor(Math.random() * actions.length)];
    } else {
      action = this.argMaxAction(stateQValues);
    }

    return {
      action,
      was_exploration: willExplore,
      q_value_before: stateQValues[action],
      state_key: stateKey,
      epsilon_at_decision: this.metadata.epsilon,
    };
  }

  private argMaxAction(stateQValues: { [action: number]: number }): RLAction {
    const values = [
      { action: 1, q: stateQValues[1] },
      { action: 2, q: stateQValues[2] },
      { action: 3, q: stateQValues[3] },
    ];

    const maxQ = Math.max(...values.map((value) => value.q));
    const tied = values.filter((value) => value.q === maxQ);
    const chosen = tied[Math.floor(Math.random() * tied.length)];
    return chosen.action as RLAction;
  }

  update(
    state: RLState,
    action: RLAction,
    reward: number,
    nextState: RLState,
  ): {
    q_value_before: number;
    q_value_after: number;
    td_error: number;
  } {
    const stateKey = stateToKey(state);
    const nextStateKey = stateToKey(nextState);

    const qBefore = this.qValues[stateKey][action];
    const nextQValues = this.qValues[nextStateKey];
    const maxNextQ = Math.max(nextQValues[1], nextQValues[2], nextQValues[3]);

    const tdError =
      reward + this.metadata.discount_factor * maxNextQ - qBefore;
    const qAfter = qBefore + this.metadata.learning_rate * tdError;

    this.qValues[stateKey][action] = qAfter;
    this.metadata.total_updates += 1;

    return {
      q_value_before: qBefore,
      q_value_after: qAfter,
      td_error: tdError,
    };
  }

  incrementEpisode() {
    this.metadata.total_episodes += 1;
  }

  decayEpsilon() {
    this.metadata.epsilon = Math.max(
      this.metadata.epsilon_min,
      this.metadata.epsilon * this.metadata.epsilon_decay,
    );
  }

  getQValues(): QTableData {
    return this.qValues;
  }

  getMetadata(): QTableMetadata {
    return this.metadata;
  }

  getSnapshot() {
    return {
      qValues: { ...this.qValues },
      metadata: { ...this.metadata },
    };
  }
}
