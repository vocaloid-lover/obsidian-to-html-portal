import { levels } from "./data/levels.js";
import { createState, setLevel, resetLevel } from "./state.js";
import { computeAvailableTools, applyTool } from "./engine.js";
import { createRenderer } from "./renderer.js";

const root = document.getElementById("integral-lab-app");

if (root) {
  const state = createState(levels);
  state.availableTools = computeAvailableTools(state.expression);
  state.recommendedToolId = state.availableTools[0]?.id || null;

  const renderer = createRenderer(root);
  renderer.render(state);

  renderer.refs.levelSelect.addEventListener("change", (event) => {
    const levelId = event.target.value;
    setLevel(state, levelId);
    state.availableTools = computeAvailableTools(state.expression);
    state.recommendedToolId = state.availableTools[0]?.id || null;
    renderer.render(state);
  });

  renderer.refs.resetButton.addEventListener("click", () => {
    resetLevel(state);
    state.availableTools = computeAvailableTools(state.expression);
    state.recommendedToolId = state.availableTools[0]?.id || null;
    renderer.render(state);
  });

  renderer.refs.tools.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-tool-id]");
    if (!button) return;
    const toolId = button.dataset.toolId;
    const changed = applyTool(state, toolId);
    if (changed) {
      renderer.render(state);
    }
  });
}
