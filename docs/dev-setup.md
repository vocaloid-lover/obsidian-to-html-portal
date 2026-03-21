# Development Setup

## 1. 先回答最重要的问题

修改笔记时，应该改：

- `D:\Projects\obsidian-to-html-project\src\notes`

不应该改：

- `D:\Projects\obsidian-to-html-project\public\notes`

原因：

- `src/notes` 是笔记源文件。
- `public/notes` 是构建后生成的静态页面。
- 每次执行 `npm run build`，`public` 都会被清空并重新生成。

---

## 2. 文档导航

推荐按下面顺序阅读：

1. [内容与架构说明](./content-architecture.md)
2. [架构更新日志](./architecture-changelog.md)
3. [Integral Lab V1 Scope](./integral-lab-v1-scope.md)
4. [Integral Lab V1 Acceptance](./integral-lab-v1-acceptance.md)

---

## 3. 环境要求

- Node.js 20
- npm
- Git

---

## 4. 获取项目

```bash
git clone <your-repo-url>
cd obsidian-to-html-project
```

## 5. 安装依赖

```bash
npm install
```

---

## 6. 常用命令

```bash
# 完整生产构建
npm run build

# 仅编译样式
npm run styles

# 仅生产样式
npm run styles:prod

# 仅重新生成搜索索引
npm run preprocess:search

# 本地开发
npm run serve
```

---

## 7. 当前内容维护规则

### 内容源

- 笔记正文：`src/notes/**/*.md`
- 页面模板：`src/index.njk`、`src/notes.md`、`src/_includes/*.njk`
- 样式源：`src/scss/**/*.scss`
- 前端脚本源：`src/js/**/*.js`

### 生成产物

- 网站输出：`public/`
- 搜索索引产物：`src/search/index.json` 与 `public/search/index.json`

### 不要手改的目录

- `public/**`
- `src/search/index.json`

---

## 8. 一次标准的笔记修改流程

1. 编辑 `src/notes` 下对应的 Markdown 文件。
2. 如有需要，同时调整 front matter。
3. 运行 `npm run build`。
4. 检查 `public/index.html`、`public/notes/` 与搜索结果是否符合预期。

---

## 9. 当前状态总结

现在项目已经明确采用下面这条规则：

- `src` 负责“源”
- `public` 负责“输出”

但目录命名上仍有历史残余：

- 笔记源还放在 `src/notes`
- 模板、样式、脚本也都放在 `src`

这就是后续需要继续整理的地方，也是下一个“便于笔记修改”的功能要建立的基础。
