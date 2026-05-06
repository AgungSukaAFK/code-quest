import type { Action, QState } from "./types";
import { serializeState } from "./state";

const LEARNING_RATE = 0.1;
const DISCOUNT_FACTOR = 0.9;
const EPSILON = 0.2; // exploration rate
const ACTIONS: Action[] = ["easier", "same", "harder"];

export class QLearning {
  private qTable: Map<string, Map<Action, number>> = new Map();

  private getQValue(state: QState, action: Action): number {
    const stateKey = serializeState(state);
    return this.qTable.get(stateKey)?.get(action) ?? 0;
  }

  private setQValue(state: QState, action: Action, value: number): void {
    const stateKey = serializeState(state);
    if (!this.qTable.has(stateKey)) {
      this.qTable.set(stateKey, new Map());
    }
    this.qTable.get(stateKey)!.set(action, value);
  }

  chooseAction(state: QState): Action {
    // Epsilon-greedy exploration
    if (Math.random() < EPSILON) {
      return ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    }
    // Exploit: pick best known action
    let bestAction: Action = "same";
    let bestValue = -Infinity;
    for (const action of ACTIONS) {
      const value = this.getQValue(state, action);
      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    }
    return bestAction;
  }

  update(
    state: QState,
    action: Action,
    reward: number,
    nextState: QState,
  ): void {
    const currentQ = this.getQValue(state, action);
    const maxNextQ = Math.max(
      ...ACTIONS.map((a) => this.getQValue(nextState, a)),
    );
    const newQ =
      currentQ +
      LEARNING_RATE * (reward + DISCOUNT_FACTOR * maxNextQ - currentQ);
    this.setQValue(state, action, newQ);
  }

  exportTable(): Record<string, Record<Action, number>> {
    const result: Record<string, Record<Action, number>> = {};
    for (const [stateKey, actions] of this.qTable.entries()) {
      result[stateKey] = Object.fromEntries(actions) as Record<Action, number>;
    }
    return result;
  }

  importTable(data: Record<string, Record<Action, number>>): void {
    for (const [stateKey, actions] of Object.entries(data)) {
      const map = new Map<Action, number>();
      for (const [action, value] of Object.entries(actions)) {
        map.set(action as Action, value);
      }
      this.qTable.set(stateKey, map);
    }
  }
}
