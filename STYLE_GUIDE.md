# 样式开发快速指南

## 🎯 快速开始

### 启动开发环境
```bash
npm run dev
```
- Sass 自动编译到 `public/css/`
- Eleventy 监听文件变化
- 浏览器访问 http://localhost:8080

### 生产构建
```bash
npm run build
```
- 优化 CSS（自动前缀 + 压缩）
- 执行预处理流程（frontmatter、links、math、search）
- 生成 Eleventy 静态网站到 `public/`

---

## 📝 样式编辑工作流

### 1️⃣ 编辑样式

修改 `src/scss/` 中的任何文件：
```
src/scss/
├── variables.scss         👈 颜色、字体、间距
├── mixins.scss           👈 Sass 函数
├── base.scss             👈 全局样式
└── components/           👈 UI 组件
    ├── button.scss
    ├── form.scss
    ├── card.scss
    ├── portal.scss
    └── theme.scss
```

### 2️⃣ 自动编译

保存文件后，Sass watch 自动编译为：
```
public/css/style.css       ← 生产 CSS（压缩）
public/css/style.css.map   ← Source map
```

### 3️⃣ 浏览器实时更新

Eleventy watch 监听 CSS 变化，浏览器实时刷新预览

---

## 🎨 常见编辑场景

### 修改品牌色（全站）

**文件**: `src/scss/variables.scss`

```scss
:root {
  --color-primary: #007acc;         // 浅色主题
  --color-primary-dark: #005a9c;    // 深色变体
  --color-primary-light: #3399ff;   // 浅色变体
}

[data-theme="dark"] {
  --color-primary-light: #5eb3ff;   // 深色主题浅色
}
```

**影响**: 所有使用 `var(--color-primary)` 的地方

### 修改间距（padding/margin）

**文件**: `src/scss/variables.scss`

```scss
:root {
  --spacing-xs: 0.25rem;   // 4px
  --spacing-sm: 0.5rem;    // 8px
  --spacing-md: 1rem;      // 16px
  --spacing-lg: 1.5rem;    // 24px
  --spacing-xl: 2rem;      // 32px
}
```

### 新增按钮样式

**文件**: `src/scss/components/button.scss`

```scss
.btn {
  @include button-base;
  
  &--gradient {
    background: linear-gradient(135deg, #007acc, #0066cc);
    color: white;
    
    &:hover:not(:disabled) {
      filter: brightness(1.1);
    }
  }
}
```

**使用**: `<button class="btn btn--gradient">梯度按钮</button>`

### 新增响应式样式

```scss
.container {
  padding: var(--spacing-md);
  
  // 平板及以上
  @include tablet-up {
    padding: var(--spacing-lg);
    display: grid;
    grid-template-columns: 2fr 1fr;
  }
  
  // 桌面及以上
  @include desktop-up {
    max-width: var(--max-width-wide);
  }
}
```

### 使用预定义 Mixin

```scss
// 水平居中
.header {
  @include flex-center;
  height: 60px;
}

// 文本截断
.title {
  @include truncate;
}

// 多行截断
.excerpt {
  @include line-clamp(3);
}

// 网格布局
.grid {
  @include grid-auto-fit(300px);
}
```

---

## 🖌️ 主题系统

### 查看当前主题

在浏览器控制台：
```javascript
// 获取当前主题
window.themeManager.getCurrentTheme()

// 切换主题
window.themeManager.toggleTheme()

// 监听主题变化
window.addEventListener('themechange', (e) => {
  console.log('New theme:', e.detail.theme)
})
```

### 深色主题特定样式

```scss
[data-theme="dark"] {
  // 深色主题专用样式
  .my-element {
    background: var(--color-bg-secondary);
    color: var(--color-text);
  }
}
```

### CSS 变量降级方案（IE 11）

```scss
.button {
  background-color: #007acc;  // IE 11 降级
  background-color: var(--color-primary);
  
  color: #fff;                // IE 11 降级
  color: var(--color-text);
}
```

---

## 🔍 调试技巧

### 检查样式是否生效

1. **打开浏览器开发工具** (F12)
2. **查看 Elements / Inspector**
3. **搜索元素** (Ctrl+Shift+C 选取元素)
4. **查看 Computed 样式**（应该看到 CSS 变量值）

### 检查 Source Map

1. **开发环境下** `npm run dev`
2. **浏览器 DevTools** → Sources
3. **应该能找到** `src/scss/*.scss` 原始文件

### Sass 编译错误

开发服务器终端会显示编译错误：
```
Error: Undefined variable
  ╷
10 │   color: $undefined-var;
   │          ^^^^^^^^^^^^^^
  ╵
    src\scss\components\button.scss 10:3
```

检查：
- ✅ 变量名拼写（区分大小写）
- ✅ 变量是否在 variables.scss 中定义
- ✅ variables.scss 是否首先被导入

---

## 📦 依赖管理

### 当前版本
- Sass v1.96.0
- PostCSS v8.5.6
- Autoprefixer v10.4.16
- cssnano v7.1.2
- Eleventy v3.1.2

### 升级依赖
```bash
npm update

# 或指定版本升级
npm install --save-dev sass@latest postcss@latest
```

### 安装新依赖
```bash
npm install --save-dev <package-name>
```

---

## 🚀 性能优化技巧

### 1. 避免深层嵌套
❌ 不好：
```scss
.container {
  .header {
    .nav {
      .link {
        color: blue;
      }
    }
  }
}
```

✅ 好：
```scss
.nav-link {
  color: blue;
}
```

### 2. 使用 Mixin 避免重复
❌ 不好：
```scss
.button, .link, .tab {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
```

✅ 好：
```scss
.button {
  @include button-base;
}
```

### 3. 利用 CSS 变量减少代码
❌ 不好：
```scss
.primary { color: #007acc; }
.secondary { color: #0066cc; }
```

✅ 好：
```scss
.primary { color: var(--color-primary); }
.secondary { color: var(--color-primary-dark); }
```

---

## 📋 检查清单

开发完成后，确保：
- [ ] Sass 编译无错误
- [ ] CSS 已复制到 `public/css/`
- [ ] 浏览器能加载新样式
- [ ] 浅色主题外观正确
- [ ] 深色主题外观正确
- [ ] 移动端响应式工作
- [ ] 未使用过时的 CSS 前缀（PostCSS 会自动添加）
- [ ] 无 console 错误

---

## 🔗 参考资源

- **Sass 文档**: https://sass-lang.com/documentation
- **CSS 变量指南**: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- **Eleventy 文档**: https://www.11ty.dev/
- **PostCSS 插件**: https://postcss.org/

---

**💡 提示**: 开发时始终运行 `npm run dev`，这样能自动编译 Sass 并实时更新浏览器。
