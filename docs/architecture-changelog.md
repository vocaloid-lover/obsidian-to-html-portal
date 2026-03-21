# 架构更新日志

## 2026-03-21

### 本次文档更新的目的

在继续做“便于笔记修改”的功能前，先把当前项目的内容边界、构建边界和近期架构更新沉淀下来，避免继续在“源文件”和“生成产物”之间混淆。

---

## 一、当前项目已经完成的结构更新

### 1. 首页、归档页、笔记页模板重构

近期已完成：

- 首页 Hero 与控制区重构
- 搜索结果区与最近笔记区分离
- 归档页改为独立目录页
- 笔记详情页阅读态重构

影响文件包括：

- `src/index.njk`
- `src/notes.md`
- `src/_includes/base.njk`
- `src/_includes/note.njk`
- `src/_includes/navigation.njk`

### 2. 搜索交互重写

已完成：

- 去掉原先“结果直接堆在最近笔记下方”的结构问题
- 搜索与标签筛选统一进入独立结果区
- 搜索结果改为卡片化显示
- 搜索摘要清洗逻辑增强

影响文件包括：

- `src/js/search.js`
- `scripts/generate-search-index.js`
- `.eleventy.js`

### 3. 样式系统重构

已完成：

- 设计 token 重写
- 站点外壳视觉更新
- 首页/归档/正文卡片体系统一
- 深浅主题统一
- Sass 从 `@import` 迁移到 `@use`

影响文件包括：

- `src/scss/variables.scss`
- `src/scss/base.scss`
- `src/scss/styles.scss`
- `src/scss/components/*.scss`

### 4. 构建链清理

已完成：

- 引入 `clean-public.js`
- 构建前清空 `public/`
- 统一 CSS 输出为 `public/css/styles.css`
- 清理旧的重复页面产物残留

影响文件包括：

- `package.json`
- `scripts/clean-public.js`

### 5. MathJax 与 Integral Lab 修复

已完成：

- Integral Lab 页面重新纳入 MathJax 加载范围
- 修复“当前表达式”公式不渲染问题
- 修复 `MutationObserver` 递归触发导致的 `STATUS_STACK_OVERFLOW`

影响文件包括：

- `src/_includes/base.njk`
- `src/scss/components/math-lab.scss`

---

## 二、当前架构的清晰结论

### 源

下面这些是“应该维护”的源：

- `src/notes`
- `src/_includes`
- `src/index.njk`
- `src/notes.md`
- `src/scss`
- `src/js`
- `scripts`

### 输出

下面这些是“构建出来的结果”：

- `public/index.html`
- `public/notes`
- `public/css`
- `public/js`
- `public/search`

### 当前唯一正确的笔记编辑入口

- `src/notes`

---

## 三、仍然存在的历史残余

虽然近期已经完成了大量整理，但下面这些仍然是旧架构残留：

### 1. `src` 仍然是混合目录

`src` 里同时放着：

- 内容
- 模板
- 样式
- 脚本

这会让“只想改笔记”的操作不够直观。

### 2. `public/notes` 名称过于像真实内容目录

它本质是 HTML 输出，但名字又和 `src/notes` 太接近，因此天然容易让人误判。

### 3. 搜索索引中间产物仍放在 `src/search`

这不算错误，但对目录语义来说不够干净，因为它更像“构建中间结果”，而不是内容源。

---

## 四、建议的下一阶段整理目标

下一阶段最推荐做的，不是立刻堆新功能，而是先把内容目录和站点目录拆开。

推荐目标结构：

```text
content/
  notes/

site/
  _includes/
  pages/
  scss/
  js/
  tools/

build/
  scripts/

public/
```

这样会得到三个明确层次：

1. `content`
   只负责内容
2. `site`
   只负责站点实现
3. `public`
   只负责输出

---

## 五、为什么先做这份日志

因为从现在开始，后续所有“更易修改笔记”的功能设计，都应该建立在这条原则上：

> 功能应该操作内容源，而不是操作生成产物。

这份日志的作用，就是把当前状态固定下来，作为后续功能设计的共同基线。

---

## 六、当前建议的工作约定

在正式目录迁移前，建议项目内部统一采用以下约定：

- 修改笔记，只改 `src/notes`
- 检查页面，只看 `public`
- 修改模板，只改 `src/_includes` 和 `src/*.njk`
- 修改样式，只改 `src/scss`
- 修改脚本，只改 `src/js`
- 构建完成后，如果 `public` 内容变化，视为正常输出变化

---

## 七、与现有文档的关系

现有文档中：

- `README.md` 保留了项目历史说明，但其中架构部分已有明显过时内容
- `docs/dev-setup.md` 现在已更新为更适合当前状态的入口文档
- `docs/integral-lab-v1-scope.md` 与 `docs/integral-lab-v1-acceptance.md` 继续负责实验工具范围与验收说明

从现在开始，关于“当前内容源和构建边界”的说明，应优先以：

- `docs/content-architecture.md`
- `docs/architecture-changelog.md`

这两份文档为准。
