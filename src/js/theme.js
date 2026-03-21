(function () {
  const STORAGE_KEY = "theme-preference";
  const DARK_THEME = "dark";
  const LIGHT_THEME = "light";

  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Unable to read theme preference.", error);
      return null;
    }
  }

  function setSavedTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.warn("Unable to save theme preference.", error);
    }
  }

  function getSystemTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return DARK_THEME;
    }

    return LIGHT_THEME;
  }

  function getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") === DARK_THEME ? DARK_THEME : LIGHT_THEME;
  }

  function updateToggleButton() {
    const button = document.getElementById("theme-toggle");

    if (!button) {
      return;
    }

    const isDark = getCurrentTheme() === DARK_THEME;
    const icon = button.querySelector(".theme-toggle__icon");
    const label = button.querySelector(".theme-toggle__label");

    button.setAttribute("aria-pressed", String(isDark));
    button.dataset.theme = isDark ? DARK_THEME : LIGHT_THEME;

    if (icon) {
      icon.textContent = isDark ? "月" : "日";
    }

    if (label) {
      label.textContent = isDark ? "深色" : "浅色";
    }
  }

  function applyTheme(theme, options = {}) {
    const nextTheme = theme === DARK_THEME ? DARK_THEME : LIGHT_THEME;

    if (nextTheme === DARK_THEME) {
      document.documentElement.setAttribute("data-theme", DARK_THEME);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    if (options.persist) {
      setSavedTheme(nextTheme);
    }

    updateToggleButton();
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: nextTheme } }));
  }

  function toggleTheme() {
    const nextTheme = getCurrentTheme() === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    applyTheme(nextTheme, { persist: true });
  }

  function init() {
    const savedTheme = getSavedTheme();
    const initialTheme = savedTheme === DARK_THEME || savedTheme === LIGHT_THEME ? savedTheme : getSystemTheme();
    const themeToggle = document.getElementById("theme-toggle");

    applyTheme(initialTheme);

    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        toggleTheme();
      });
    }

    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleThemeChange = function (event) {
        if (!getSavedTheme()) {
          applyTheme(event.matches ? DARK_THEME : LIGHT_THEME);
        }
      };

      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", handleThemeChange);
      } else if (typeof mediaQuery.addListener === "function") {
        mediaQuery.addListener(handleThemeChange);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.themeManager = {
    getCurrentTheme,
    setTheme(theme) {
      applyTheme(theme, { persist: true });
    },
    toggleTheme,
  };
})();
