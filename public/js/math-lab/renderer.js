import { toLatex } from "./latex.js";
import { typesetMath } from "./mathjax.js";

export const createRenderer = (root) => {
  const refs = {
    levelSelect: root.querySelector("#lab-level-select"),
    resetButton: root.querySelector("#lab-reset"),
    problemTitle: root.querySelector("#lab-problem-title"),
    problemMeta: root.querySelector("#lab-problem-meta"),
    problemHints: root.querySelector("#lab-problem-hints"),
    expression: root.querySelector("#lab-expression"),
    tools: root.querySelector("#lab-tools"),
    history: root.querySelector("#lab-history")
  };

  const renderLevels = (state) => {
    const options = state.levels
      .map((level) => {
        const selected = level.id === state.currentLevel.id ? "selected" : "";
        return `<option value="${level.id}" ${selected}>${level.title}</option>`;
      })
      .join("");
    refs.levelSelect.innerHTML = options;
  };

  const renderMeta = (state) => {
    const { difficulty, tags, description } = state.currentLevel;
    const tagsText = tags && tags.length ? `标签：${tags.join(" / ")}` : "";
    refs.problemMeta.innerHTML = [
      `<span>难度：${difficulty}</span>`,
      tagsText ? `<span>${tagsText}</span>` : "",
      description ? `<span>${description}</span>` : ""
    ]
      .filter(Boolean)
      .join("<span class=\"lab-divider\"></span>");
  };

  const renderExpression = (state) => {
    const latex = toLatex(state.expression);
    refs.expression.innerHTML = `$$${latex}$$`;
  };

  const renderTools = (state) => {
    if (!state.availableTools.length) {
      refs.tools.innerHTML = `<div class="lab-empty">当前没有可用工具。</div>`;
      return;
    }

    refs.tools.innerHTML = state.availableTools
      .map((tool) => {
        const isRecommended = tool.id === state.recommendedToolId;
        const recClass = isRecommended ? "is-recommended" : "";
        const recBadge = isRecommended ? "<span class=\"lab-badge\">推荐</span>" : "";
        return `
          <div class="lab-tool ${recClass}">
            <div>
              <h3>${tool.name} ${recBadge}</h3>
              <p>${tool.description}</p>
            </div>
            <button class="btn btn--primary" data-tool-id="${tool.id}" type="button">应用</button>
          </div>
        `;
      })
      .join("");
  };

  const renderHistory = (state) => {
    if (!state.history.length) {
      refs.history.innerHTML = `<div class="lab-empty">暂无操作记录。</div>`;
      return;
    }

    refs.history.innerHTML = state.history
      .map((entry) => {
        return `
          <div class="lab-history-item">
            <strong>步骤 ${entry.step} · ${entry.toolName}</strong>
            <span>${entry.explanation}</span>
            <div class="lab-history-math">$$${entry.beforeLatex}$$</div>
            <div class="lab-history-math">$$${entry.afterLatex}$$</div>
          </div>
        `;
      })
      .join("");
  };

  const renderHints = (state) => {
    refs.problemHints.textContent = state.currentLevel.hint || "";
  };

  const renderTitle = (state) => {
    refs.problemTitle.textContent = state.currentLevel.title || "题目";
  };

  const renderAll = (state) => {
    renderTitle(state);
    renderLevels(state);
    renderMeta(state);
    renderHints(state);
    renderExpression(state);
    renderTools(state);
    renderHistory(state);

    typesetMath(root);
  };

  return {
    refs,
    render: renderAll
  };
};
