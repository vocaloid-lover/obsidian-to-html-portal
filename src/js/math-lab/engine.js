import { toolList } from "./tools/index.js";
import { cloneExpr } from "./expr.js";
import { toLatex } from "./latex.js";

export const computeAvailableTools = (expression) =>
  toolList.filter((tool) => tool.isApplicable(expression));

export const applyTool = (state, toolId) => {
  const tool = toolList.find((entry) => entry.id === toolId);
  if (!tool || !tool.isApplicable(state.expression)) return false;

  const beforeExpr = cloneExpr(state.expression);
  const result = tool.apply(state.expression);
  state.expression = result.expression;

  const historyEntry = {
    step: state.history.length + 1,
    toolId: tool.id,
    toolName: tool.name,
    explanation: result.explanation,
    beforeLatex: toLatex(beforeExpr),
    afterLatex: toLatex(state.expression)
  };

  state.history.push(historyEntry);
  state.availableTools = computeAvailableTools(state.expression);
  state.recommendedToolId = state.availableTools[0]?.id || null;

  return true;
};
