import { cloneExpr } from "./expr.js";

export const createState = (levels) => {
  const first = levels[0];
  return {
    levels,
    currentLevel: first,
    expression: cloneExpr(first.initialExpr),
    history: [],
    availableTools: [],
    recommendedToolId: null
  };
};

export const setLevel = (state, levelId) => {
  const next = state.levels.find((level) => level.id === levelId) || state.levels[0];
  state.currentLevel = next;
  state.expression = cloneExpr(next.initialExpr);
  state.history = [];
};

export const resetLevel = (state) => {
  state.expression = cloneExpr(state.currentLevel.initialExpr);
  state.history = [];
};
