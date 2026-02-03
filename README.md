# 📚 知识库门户网站 - 项目总结

## 1. 网站介绍

### 网站类型与用途
本项目是一个基于 **Eleventy 静态网站生成器**构建的 Obsidian 笔记转换系统，将本地 Markdown 笔记库（Obsidian）自动转换为可交互的在线静态网站门户。

**核心功能：**
- 📝 将 Obsidian 笔记自动编译为静态 HTML 网站
- 🔍 集成全文搜索功能（Lunr.js 客户端搜索）
- 🧮 支持 MathJax 数学公式渲染（TeX/LaTeX）
- 🌓 深色/浅色主题自动切换
- 📱 响应式设计，支持移动设备访问
- 🔗 社交媒体链接集成（GitHub、Bilibili、Twitter）

### 目标用户
学术工作者、工程师、学生等需要发布个人知识库的用户

---

## 2. 站点资源组织

### 文件结构与功能表

| 目录/文件 | 功能说明 | 备注 |
|---------|---------|------|
| **src/** | 源代码根目录 | Eleventy 输入目录 |
| `src/index.njk` | 首页门户模板 | 显示最近笔记、搜索框、标签筛选 |
| `src/notes.md` | 笔记列表索引页 | 展示所有笔记索引 |
| `src/_includes/base.njk` | 主 HTML 模板 | 所有页面继承的基础模板，包含 header/footer |
| `src/_includes/navigation.njk` | 导航组件 | 页眉导航菜单 |
| `src/_includes/note.njk` | 笔记模板 | 单个笔记页面的渲染模板 |
| `src/notes/` | 笔记内容目录 | Markdown 笔记源文件（来自 Obsidian） |
| `src/scss/` | Sass 样式目录 | 全站 CSS 预处理器源文件 |
| `src/scss/variables.scss` | 设计系统变量 | 颜色系统、排版、间距、阴影定义 |
| `src/scss/base.scss` | 基础样式 | 全局 HTML 元素样式 |
| `src/scss/mixins.scss` | Sass mixin | 可复用的样式混入函数 |
| `src/scss/components/` | 组件样式 | 按钮、卡片、表单等组件 CSS |
| `src/js/` | JavaScript 脚本 | 客户端交互逻辑 |
| `src/js/main.js` | 主脚本 | 核心交互逻辑（主题切换等） |
| `src/js/search.js` | 搜索脚本 | Lunr.js 搜索实现 |
| `src/js/theme.js` | 主题脚本 | 深色/浅色主题管理 |
| `src/search/index.json` | 搜索索引 | 预生成的 Lunr 搜索索引 |
| **public/** | 网站输出目录 | Eleventy 生成的静态网站 |
| `public/index.html` | 编译后主页 | 最终交付的 HTML 首页 |
| `public/css/` | 编译后样式 | 生成的 CSS 文件 |
| `public/js/` | 复制的脚本 | JavaScript 文件副本 |
| `public/image/` | 图片资源 | Logo（白天/夜间）等静态图片 |
| **scripts/** | 预处理脚本 | 构建前的自动化处理 |
| `scripts/add-frontmatter.js` | Front Matter 统一脚本 | 为笔记添加 YAML 前置元数据 |
| `scripts/fix-mathjax.js` | 公式修复脚本 | 自动修复常见 MathJax 格式问题 |
| `scripts/convert-links.js` | 链接转换脚本 | 将 Obsidian 链接转换为 HTML 链接 |
| `scripts/validate-mathjax.js` | 公式验证脚本 | 检查并报告公式格式问题 |
| `scripts/generate-search-index.js` | 搜索索引生成 | 生成 Lunr.js 搜索索引 |
| **image/** | 网站图片资源 | 品牌 logo 等 |
| `.eleventy.js` | Eleventy 配置 | 构建系统配置、集合定义、passthrough copy |
| `package.json` | NPM 依赖管理 | 项目依赖版本声明 |
| `postcss.config.js` | PostCSS 配置 | CSS 后处理配置（自动前缀等） |
| `.sassignore` | Sass 忽略文件 | Sass 不编译的文件列表 |
| `tmp/math-backups/` | 备份目录 | fix-mathjax.js 生成的修复前备份 |

---

## 3. 模块功能详解

### 3.1 HTML 元素应用案例

#### 页眉（Header）区域
```html
<!-- Logo + 品牌 -->
<a class="site-brand" href="/">
  <img src="/image/logolight.jpg" alt="logo" class="logo logo--light">
  <img src="/image/logonight.jpg" alt="logo" class="logo logo--dark">
  <span class="site-title">我的知识库</span>
</a>

<!-- 导航菜单 -->
<nav>
  <a href="/">首页</a>
  <a href="/notes/">所有笔记</a>
</nav>

<!-- 社交媒体链接（SVG 图标） -->
<div class="social-links">
  <a href="https://github.com/vocaloid-lover/obsidian-to-html-portal" title="GitHub" target="_blank">
    <svg><!-- GitHub Icon --></svg>
  </a>
  <a href="https://space.bilibili.com/2061247367?spm_id_from=333.788.0.0" title="Bilibili" target="_blank">
    <svg><!-- Bilibili Icon --></svg>
  </a>
  <a href="https://x.com/Jiarui_f" title="X" target="_blank">
    <svg><!-- X Icon --></svg>
  </a>
</div>
```

**HTML 元素用途：**
- `<img>` - 白天/夜间 logo 双图切换显示
- `<a>` - 品牌链接到首页、导航链接、社交链接
- `<nav>` - 语义化导航元素
- `<svg>` - 内联向量图标（GitHub、Bilibili、Twitter）

#### 面包屑导航（Breadcrumb）
```html
<div class="breadcrumb">
  <a href="/">首页</a>
  &nbsp;/&nbsp;<a href="/notes/">notes</a>
  &nbsp;/&nbsp;<a href="/notes/证明2.2.1的模的平方细节/">证明2.2.1的模的平方细节</a>
</div>
```

**用途：** 三级导航路径，帮助用户理解当前位置

#### 搜索与过滤区域（首页）
```html
<!-- 搜索框 -->
<input id="search-input" type="text" placeholder="🔍 搜索笔记关键词..." />

<!-- 标签筛选 -->
<select id="tag-filter">
  <option value="">查看全部</option>
  <!-- 动态填充 -->
</select>

<!-- 主题切换按钮 -->
<button id="theme-toggle" class="theme-btn" aria-label="切换主题">
  <span class="theme-icon">🌙</span>
</button>
```

**HTML 元素：**
- `<input type="text">` - 全文搜索框
- `<select>` - 下拉菜单标签筛选
- `<button>` - 主题切换按钮

#### 笔记列表（首页最近笔记）
```html
<ul id="notes-container">
  <li class="note-item" data-tags="">
    <a href="/notes/证明2.2.1的模的平方细节/" class="note-link">
      <strong>证明2.2.1的模的平方细节</strong>
    </a>
    <div class="meta">📅 2025-09-27</div>
    <p class="excerpt">摘录文本（150 字）...</p>
  </li>
  <!-- 更多笔记项 -->
</ul>
```

**HTML 元素：**
- `<ul>` + `<li>` - 笔记列表结构
- `<a>` - 笔记标题链接
- `<strong>` - 强调笔记标题
- `<div class="meta">` - 发布日期和标签
- `<p class="excerpt">` - 笔记摘录预览

#### 页脚（Footer）- 版权与回到顶部
```html
<footer class="site-footer">
  <p>© <span id="copyright-year"></span> 我的知识库 · Chen Jiarui · All rights reserved.</p>
  <p><small>Generated from Obsidian notes · Built with Eleventy</small></p>
  <p><a href="#top">回到顶部</a></p>
</footer>
```

**HTML 元素：**
- `<footer>` - 语义化页脚
- `<span id="copyright-year">` - 动态年份（JS 填充）
- `<small>` - 较小文字说明
- `<a href="#top">` - 返回顶部链接

#### 笔记内容区域（单笔记页）
```html
<article class="note">
  <header class="note-header">
    <h1>笔记标题</h1>
    <time datetime="2025-09-27">2025-09-27</time>
    <div class="tags">标签</div>
  </header>
  
  <div class="note-content">
    <!-- Markdown 转换的 HTML 内容 -->
    <p>段落文本</p>
    <h2>二级标题</h2>
    <ul><li>列表项</li></ul>
    <!-- MathJax 公式 -->
    <p>$\mathbf{a}(t) = ...$</p>
    $$\frac{d}{dt} ... $$
  </div>
  
  <footer class="note-footer">
    <nav class="note-nav">
      <a href="/">返回首页</a>
      <a href="/notes/">所有笔记</a>
    </nav>
  </footer>
</article>
```

**HTML 元素：**
- `<article>` - 笔记内容主体
- `<header>` / `<footer>` - 笔记头尾
- `<h1>` ~ `<h6>` - 标题层级
- `<time>` - 语义化时间元素
- `<p>` / `<ul>` / `<li>` - 段落和列表
- `<nav>` - 笔记内导航

---

### 3.2 Logo 与版权设计

#### Logo 白天/夜间切换
```scss
.logo { height: 36px; display: inline-block; }
.logo--dark { display: none; }

[data-theme="dark"] .logo--light { display: none; }
[data-theme="dark"] .logo--dark { display: inline-block; }
```

**设计思路：**
- 白天模式（默认）：显示 `logolight.jpg`
- 夜间模式：隐藏浅色 logo，显示 `logonight.jpg`
- 通过 `[data-theme="dark"]` 属性选择器切换

#### 版权信息
```html
<p>© <span id="copyright-year"></span> 我的知识库 · Chen Jiarui · All rights reserved.</p>
```

**动态更新年份（JavaScript）：**
```javascript
document.getElementById('copyright-year').textContent = new Date().getFullYear();
```

- 版权所有者：陈佳锐（Chen Jiarui）
- 年份自动更新，无需手动维护

---

### 3.3 JavaScript 脚本应用

#### 3.3.1 主题切换脚本 (`src/js/theme.js`)
```javascript
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// 初始化主题
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

// 切换主题
themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeToggle.setAttribute('aria-pressed', newTheme === 'dark');
});
```

**功能：**
- 读取 `localStorage` 持久化用户主题选择
- 切换 `data-theme` 属性触发 CSS 变量更新
- logo、文字色、背景色根据主题自动切换

#### 3.3.2 搜索脚本 (`src/js/search.js`)
```javascript
(async () => {
  // 1. 加载预生成的搜索索引
  const response = await fetch('/search/index.json');
  const notes = await response.json();
  
  // 2. 建立 Lunr.js 索引
  const idx = lunr(function() {
    this.ref('id');
    this.field('title', { boost: 10 });
    this.field('tags');
    this.field('content');
    notes.forEach(note => this.add(note));
  });
  
  // 3. 搜索框输入事件
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    const results = query ? idx.search(query) : [];
    renderResults(results);
  });
  
  // 4. 标签筛选
  tagFilter.addEventListener('change', (e) => {
    const selectedTag = e.target.value;
    const filtered = selectedTag 
      ? results.filter(r => r.tags.includes(selectedTag))
      : results;
    renderResults(filtered);
  });
})();
```

**功能：**
- 全文搜索（使用 Lunr.js）
- 标签过滤
- 实时搜索结果渲染

#### 3.3.3 MathJax 初始化脚本
```javascript
// base.njk 中的 MathJax 配置
window.MathJax = {
  tex: {
    inlineMath: [['$','$'], ['\\(','\\)']],
    displayMath: [['$$','$$'], ['\\[','\\]']],
    processEscapes: true
  }
};

// 在 DOM 加载完成后触发 MathJax 渲染
document.addEventListener('DOMContentLoaded', function() {
  if (window.MathJax && window.MathJax.typesetPromise) {
    MathJax.typesetPromise([document.body]);
  }
});
```

**功能：**
- 渲染页面中的 LaTeX 公式（行内和显示模式）
- 支持 `$...$` 和 `$$...$$` 分隔符

#### 3.3.4 版权年份脚本
```javascript
document.getElementById('copyright-year').textContent = new Date().getFullYear();
```

**功能：** 自动填充当前年份，无需每年手动更新

---

## 4. 制作网页过程的心得体会

### 4.1 技术选型心得

#### Eleventy 的优势
- **简洁高效**：相比 Next.js、Hugo，Eleventy 更轻量级，学习曲线平缓
- **灵活的模板引擎**：支持 Nunjucks、Liquid、EJS 等多种选择，可根据项目需求切换
- **原生 JavaScript 集成**：不强制框架，易于集成第三方库（Lunr.js、MathJax）
- **开发体验好**：`--serve` 实时刷新，构建速度快（19 文件 0.2 秒）

#### Nunjucks 模板引擎选择
最初使用 Liquid，发现 Markdown 文件中 Liquid 语法会被转义成 HTML，破坏页面结构。切换到 Nunjucks 后完全解决。

### 4.2 MathJax vs KaTeX 的选择历程

| 对比项 | KaTeX | MathJax |
|-------|-------|---------|
| 加载速度 | 快 | 稍慢 |
| 公式覆盖 | 90% | 99%+ |
| 占用空间 | 小 | 中等 |
| 最终选择 | ❌ | ✅ |

**选择 MathJax 的原因：**
- 项目中包含大量高等数学、微分几何内容，需要完整 LaTeX 支持
- MathJax 生态成熟，社区文档完善
- CDN 加载稳定

### 4.3 颜色系统设计心得

采用**现代 Tailwind-inspired** 的设计系统：

```scss
// Teal 主色 + 中性灰色 + 语义色
--color-primary: #0d9488;        // Teal
--color-success: #059669;        // Green
--color-warning: #d97706;        // Amber
--color-error: #dc2626;          // Red
--color-info: #2563eb;           // Blue
```

**心得：**
- 使用 CSS 变量便于统一管理和主题切换
- 同时定义浅色和深色主题，提升用户体验
- 语义色的引入让界面更有层次感

### 4.4 开发流程优化

#### 自动化脚本的重要性
创建 5 个预处理脚本（`add-frontmatter.js`、`fix-mathjax.js` 等），实现：
- ✅ Front Matter 统一化（便于 Eleventy 识别元数据）
- ✅ Obsidian 链接自动转换（`[[note]]` → `/notes/note/`）
- ✅ 公式格式自动修复（去除前后空格、修复分隔符）
- ✅ 搜索索引自动生成

**心得：** 前 3 个笔记手工修改花了 2 小时，写脚本后 17 个笔记一键处理，节省时间 > 90%

### 4.5 响应式设计的实现

```scss
// 灵活的容器
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

// Flexbox 布局
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap; // 小屏幕自动换行
}
```

**心得：** 
- 使用 `gap` 替代 margin，代码更简洁
- Flexbox + Grid 搭配使用，轻松实现响应式
- CSS 变量 + 媒体查询结合，维护成本低

### 4.6 搜索功能的价值

集成 Lunr.js 提供**客户端全文搜索**，优势：
- 无需后端服务器
- 秒级搜索速度
- 完全隐私保护（搜索数据不上传）

**实现难点：**
- 需要预生成索引（JSON 文件 ~50KB）
- 中文分词需要特殊处理（使用 Lunr-languages 扩展）

### 4.7 版本控制与备份

使用 Git 管理版本，关键修改时创建备份：
- `tmp/math-backups/` - 修复前的 Markdown 备份
- Git commit 历史 - 可回滚任何修改

**心得：** 大胆修改源文件不用担心，备份 + 版本控制是安心的基础

### 4.8 协作与可维护性思考

为了让他人（或未来的自己）快速理解项目：
- ✅ 创建 `README.md`（项目说明）
- ✅ 代码注释清晰（特别是配置文件）
- ✅ 文件名含义明确（不用 `util.js` 这样的模糊名）
- ✅ Eleventy 配置中明确标注每个功能

### 4.9 性能优化的经验

**目前的优化：**
- CSS 编译时压缩（PostCSS）
- 图片使用 JPG（有损压缩，文件小）
- SVG 图标内联（减少 HTTP 请求）
- Lunr.js 索引本地存储（无需重复请求）

**未来可优化：**
- 添加图片懒加载
- 生成 WebP 格式图片
- 使用 Service Worker 缓存

### 4.10 总体收获

| 维度 | 收获 |
|-----|-----|
| 技术深度 | 掌握 Eleventy 全流程、MathJax 配置、Lunr.js 搜索实现 |
| 工程能力 | 学会编写自动化脚本，版本控制，模块化设计 |
| 前端设计 | 深入理解 CSS 变量、主题系统、响应式布局 |
| 项目管理 | 从零到一的项目完整周期体验 |

**最大的启发：** 
> 一个好的静态网站不需要复杂的后端和数据库。通过精心的前端设计和自动化脚本，可以用最少的技术栈实现功能丰富、体验优秀的网站。

---

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run serve
```
访问 `http://localhost:8080/`

### 生产构建
```bash
npm run build
```

### 预处理数据（可选）
```bash
npm run preprocess
```

---

## 技术栈总结

| 类别 | 技术 | 版本 |
|-----|------|------|
| 静态生成 | Eleventy | 3.1.2 |
| 模板引擎 | Nunjucks | - |
| 样式预处理 | Sass | - |
| CSS 后处理 | PostCSS | - |
| 搜索引擎 | Lunr.js | - |
| 公式渲染 | MathJax | 3 |
| 运行环境 | Node.js | 22.20.0 |

---

**项目完成日期：** 2025 年 12 月 21 日  
**作者：** Chen Jiarui  
**许可证：** MIT
