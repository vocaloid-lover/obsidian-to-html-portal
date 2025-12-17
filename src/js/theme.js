// ============================================
// 主题切换管理脚本
// ============================================

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'theme-preference';
    this.DARK_THEME = 'dark';
    this.LIGHT_THEME = 'light';
    this.SYSTEM = 'system';
    
    this.init();
  }

  /**
   * 初始化主题管理器
   */
  init() {
    // 从 localStorage 获取用户偏好
    const savedTheme = this.getSavedTheme();
    
    // 确定应该使用的主题
    const themeToUse = savedTheme || this.getSystemPreference();
    
    // 应用主题
    this.setTheme(themeToUse);
    
    // 设置系统主题变化监听
    this.watchSystemTheme();
  }

  /**
   * 从 localStorage 获取已保存的主题
   */
  getSavedTheme() {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('localStorage 不可用:', e);
      return null;
    }
  }

  /**
   * 获取系统主题偏好
   */
  getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return this.DARK_THEME;
    }
    return this.LIGHT_THEME;
  }

  /**
   * 设置主题
   */
  setTheme(theme) {
    if (theme === this.DARK_THEME) {
      document.documentElement.setAttribute('data-theme', this.DARK_THEME);
      this.updateToggleButton(true);
    } else {
      document.documentElement.removeAttribute('data-theme');
      this.updateToggleButton(false);
    }

    // 保存到 localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (e) {
      console.warn('无法保存主题偏好:', e);
    }

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  /**
   * 切换主题
   */
  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || this.LIGHT_THEME;
    const newTheme = current === this.DARK_THEME ? this.LIGHT_THEME : this.DARK_THEME;
    this.setTheme(newTheme);
  }

  /**
   * 更新切换按钮状态
   */
  updateToggleButton(isDark) {
    const button = document.getElementById('theme-toggle');
    if (button) {
      button.setAttribute('aria-pressed', isDark);
      button.classList.toggle('active', isDark);

      // 更新按钮文本或图标
      const icon = button.querySelector('.theme-icon');
      if (icon) {
        icon.textContent = isDark ? '☀️' : '🌙';
      }
    }
  }

  /**
   * 监听系统主题变化
   */
  watchSystemTheme() {
    if (!window.matchMedia) return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 使用 addEventListener 以支持旧浏览器
    darkModeQuery.addEventListener('change', (e) => {
      const savedTheme = this.getSavedTheme();
      
      // 只在用户没有手动设置主题时才自动改变
      if (!savedTheme) {
        const newTheme = e.matches ? this.DARK_THEME : this.LIGHT_THEME;
        this.setTheme(newTheme);
      }
    });
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || this.LIGHT_THEME;
  }

  /**
   * 强制使用系统主题
   */
  useSystemTheme() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('无法清除主题偏好:', e);
    }
    const systemTheme = this.getSystemPreference();
    this.setTheme(systemTheme);
  }
}

// ============================================
// 初始化和事件绑定
// ============================================

// 创建全局实例
window.themeManager = new ThemeManager();

// DOMContentLoaded 时设置事件监听
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupThemeToggleButton();
  });
} else {
  // DOM 已加载完毕
  setupThemeToggleButton();
}

/**
 * 设置主题切换按钮
 */
function setupThemeToggleButton() {
  const button = document.getElementById('theme-toggle');
  
  if (!button) return;

  // 点击按钮时切换主题
  button.addEventListener('click', (e) => {
    e.preventDefault();
    window.themeManager.toggleTheme();
  });

  // 右键菜单支持更多选项
  button.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showThemeMenu(e);
  });

  // 键盘支持
  button.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      window.themeManager.toggleTheme();
    }
  });
}

/**
 * 显示主题切换菜单
 */
function showThemeMenu(event) {
  // 移除已存在的菜单
  const existingMenu = document.getElementById('theme-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  // 创建菜单
  const menu = document.createElement('div');
  menu.id = 'theme-menu';
  menu.className = 'theme-menu';
  menu.innerHTML = `
    <div class="theme-menu__item" data-theme="light">
      <span class="theme-menu__icon">☀️</span>
      <span class="theme-menu__label">浅色</span>
    </div>
    <div class="theme-menu__item" data-theme="dark">
      <span class="theme-menu__icon">🌙</span>
      <span class="theme-menu__label">深色</span>
    </div>
    <div class="theme-menu__divider"></div>
    <div class="theme-menu__item" data-theme="system">
      <span class="theme-menu__icon">⚙️</span>
      <span class="theme-menu__label">跟随系统</span>
    </div>
  `;

  // 定位菜单
  menu.style.position = 'absolute';
  menu.style.top = (event.clientY) + 'px';
  menu.style.left = (event.clientX) + 'px';

  document.body.appendChild(menu);

  // 菜单项点击
  menu.querySelectorAll('.theme-menu__item').forEach(item => {
    item.addEventListener('click', () => {
      const theme = item.getAttribute('data-theme');
      if (theme === 'system') {
        window.themeManager.useSystemTheme();
      } else {
        window.themeManager.setTheme(theme);
      }
      menu.remove();
    });
  });

  // 点击其他地方关闭菜单
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (e.target !== button && !menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 0);
}

// 导出以供外部使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
