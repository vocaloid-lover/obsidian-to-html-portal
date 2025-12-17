# 📑 项目资源索引

> 本文件帮助您快速找到需要的信息

---

## 🎯 按需求查找

### 我想...

#### 🚀 快速开始使用
```
→ QUICK_REFERENCE.md  (最快 5 分钟上手)
→ 运行: npm run preprocess
```

#### 📖 深入了解项目
```
→ SCRIPTS_GUIDE.md     (完整的技术文档)
→ PROGRESS.md          (项目进展和状态)
→ FILE_MANIFEST.md     (文件说明和架构)
```

#### 🔍 查看具体问题
```
→ 运行: npm run validate
→ 查看: validation-report.json
→ 参考: SCRIPTS_GUIDE.md § 已识别的问题
```

#### 🛠️ 修复问题
```
→ SCRIPTS_GUIDE.md § 故障排除
→ QUICK_REFERENCE.md § ⚠️ 常见问题
```

#### 📝 了解脚本工作原理
```
→ SCRIPTS_GUIDE.md § 脚本详解
→ 查看源代码: scripts/*.js
```

#### 📋 获取命令列表
```
→ QUICK_REFERENCE.md § 所有可用命令
→ package.json (npm scripts 配置)
```

---

## 📂 文件导航树

```
项目根目录/
│
├─ 📖 说明文档
│  ├─ SUMMARY.md                ← 【开始这里】完成总结
│  ├─ QUICK_REFERENCE.md        ← 【推荐】快速参考卡片
│  ├─ SCRIPTS_GUIDE.md          ← 【详细】技术文档
│  ├─ PROGRESS.md               ← 【全面】进展报告
│  ├─ FILE_MANIFEST.md          ← 【详解】文件清单
│  └─ INDEX.md                  ← 【你在这里】资源索引
│
├─ 🔧 脚本文件 (scripts/)
│  ├─ add-frontmatter.js        ← 统一 front matter
│  ├─ convert-links.js          ← 链接格式转换
│  ├─ validate-mathjax.js       ← 公式验证和修复
│  └─ validate-and-report.js    ← 生成验证报告
│
├─ 📊 数据文件
│  ├─ package.json              ← npm 配置 (含脚本命令)
│  ├─ validation-report.json    ← 最新验证报告
│  └─ .eleventy.js              ← 11ty 配置
│
├─ 📝 源文件
│  └─ src/notes/                ← 18 个 markdown 笔记
│
└─ 🌐 输出文件
   └─ public/                   ← 构建后的 HTML 网站
```

---

## 🗂️ 按文件类型查找

### 需要使用脚本？

| 脚本名 | 功能 | 何时使用 |
|--------|------|---------|
| `add-frontmatter.js` | 统一 front matter | 添加新笔记或缺少元数据 |
| `convert-links.js` | 转换 Obsidian 链接 | 修改笔记内容后 |
| `validate-mathjax.js` | 验证和修复公式 | 添加或修改数学公式后 |
| `validate-and-report.js` | 生成验证报告 | 检查整体质量 |

**快速运行:** `npm run preprocess` (运行全部)

### 需要了解文档？

| 文档 | 长度 | 何时阅读 |
|------|------|---------|
| SUMMARY.md | 3分钟 | 首次接触项目 |
| QUICK_REFERENCE.md | 5分钟 | 需要快速查询命令 |
| SCRIPTS_GUIDE.md | 20分钟 | 想深入了解细节 |
| PROGRESS.md | 15分钟 | 了解项目状态和成就 |
| FILE_MANIFEST.md | 10分钟 | 理解文件结构和架构 |

### 需要配置或修改？

| 文件 | 用途 | 修改内容 |
|------|------|---------|
| `package.json` | npm 脚本配置 | 添加新命令或修改运行方式 |
| `scripts/*.js` | 处理脚本 | 自定义处理逻辑 |
| `.eleventy.js` | 网站生成配置 | 修改输出目录、模板等 |
| `src/notes/` | 笔记内容 | 添加或编辑笔记 |

---

## 🎓 学习路径

### 路径 A: 快速使用 (15分钟)
```
1. 阅读 SUMMARY.md (3分钟)
2. 阅读 QUICK_REFERENCE.md (5分钟)
3. 运行 npm run preprocess (< 2秒)
4. 运行 npm run validate (< 2秒)
5. 阅读报告和问题列表 (5分钟)
```

### 路径 B: 标准学习 (1小时)
```
1. 阅读 SUMMARY.md (3分钟)
2. 阅读 QUICK_REFERENCE.md (5分钟)
3. 阅读 SCRIPTS_GUIDE.md (20分钟)
4. 实践: 运行各个命令 (15分钟)
5. 阅读和理解脚本源代码 (20分钟)
```

### 路径 C: 深入掌握 (2小时)
```
1. 完成路径 B
2. 阅读 PROGRESS.md (15分钟)
3. 阅读 FILE_MANIFEST.md (10分钟)
4. 修改和测试脚本 (30分钟)
5. 总结和笔记 (10分钟)
```

---

## ⚡ 常用操作速查

### 最常用的 3 个命令

```bash
# 1. 预处理所有内容 (最常用)
npm run preprocess

# 2. 生成验证报告
npm run validate

# 3. 启动开发服务器
npm run dev
```

### 单独处理特定问题

```bash
# 只修复 front matter
npm run preprocess:frontmatter

# 只转换链接
npm run preprocess:links

# 只验证公式
npm run preprocess:math
```

### 构建和部署

```bash
# 构建静态网站
npm run build

# 启动开发服务器（推荐开发时使用）
npm run dev

# 启动生产服务器
npm run serve
```

---

## 🔗 跨文件参考

### 某个文件中的特定内容

#### 断链问题
- 📄 参考: QUICK_REFERENCE.md § 🔗 链接格式
- 📄 参考: SCRIPTS_GUIDE.md § 已识别的问题
- 📄 参考: PROGRESS.md § 🔴 断链

#### 公式问题
- 📄 参考: QUICK_REFERENCE.md § 📝 公式格式
- 📄 参考: SCRIPTS_GUIDE.md § 🟡 公式问题
- 📄 参考: SCRIPTS_GUIDE.md § MathJax 公式验证脚本

#### 脚本命令
- 📄 参考: QUICK_REFERENCE.md § 📋 所有可用命令
- 📄 参考: SCRIPTS_GUIDE.md § npm 脚本命令
- 📄 参考: PROGRESS.md § 🎯 可用的 npm 脚本命令

#### 使用建议
- 📄 参考: SCRIPTS_GUIDE.md § 使用建议
- 📄 参考: PROGRESS.md § 🚀 下一步工作计划

---

## 📊 快速查询表

### 命令功能对应表

| 我想... | 运行这个命令 | 查看文档 |
|--------|------------|---------|
| 统一所有笔记的元数据 | `npm run preprocess:frontmatter` | SCRIPTS_GUIDE.md § 统一 front matter |
| 转换链接格式 | `npm run preprocess:links` | SCRIPTS_GUIDE.md § 检查并规范化链接 |
| 修复公式问题 | `npm run preprocess:math` | SCRIPTS_GUIDE.md § MathJax 公式验证 |
| 完整处理 | `npm run preprocess` | QUICK_REFERENCE.md |
| 生成报告 | `npm run validate` | SCRIPTS_GUIDE.md § 验证结果 |
| 预览网站 | `npm run dev` | QUICK_REFERENCE.md § 日常开发 |
| 构建输出 | `npm run build` | SCRIPTS_GUIDE.md § 构建和开发 |

### 问题排查对应表

| 我遇到了... | 怎么解决 | 查看这里 |
|----------|--------|---------|
| 中文显示乱码 | 使用 Node.js 读取验证实际内容 | SCRIPTS_GUIDE.md § 故障排除 |
| front matter 不完整 | 运行 `npm run preprocess:frontmatter` | SCRIPTS_GUIDE.md § Front Matter 格式 |
| 链接显示错误 | 运行 `npm run preprocess:links` | SCRIPTS_GUIDE.md § 链接格式 |
| 公式显示异常 | 运行 `npm run preprocess:math` | SCRIPTS_GUIDE.md § 公式格式 |
| 断链警告 | 创建缺失的笔记或修改链接 | PROGRESS.md § 断链 |

---

## 🎯 按需求推荐文档

### 如果你是...

#### 👤 项目经理
**推荐阅读顺序:**
1. SUMMARY.md - 快速了解完成情况
2. PROGRESS.md § 项目现状总结 - 查看数据
3. PROGRESS.md § 下一步工作计划 - 制定计划

#### 👨‍💻 开发者
**推荐阅读顺序:**
1. QUICK_REFERENCE.md - 快速查询命令
2. SCRIPTS_GUIDE.md - 深入了解脚本
3. 相关脚本源代码 - 学习实现细节

#### 🎓 新手
**推荐阅读顺序:**
1. SUMMARY.md - 理解整体
2. QUICK_REFERENCE.md - 学习基本命令
3. SCRIPTS_GUIDE.md (分章节阅读) - 逐步深入

#### 🔧 维护者
**推荐阅读顺序:**
1. PROGRESS.md - 了解全貌
2. FILE_MANIFEST.md - 理解架构
3. SCRIPTS_GUIDE.md § 扩展和定制 - 学习修改方式

---

## 💾 文件大小和更新时间

| 文件 | 大小 | 类型 | 更新 |
|------|------|------|------|
| SUMMARY.md | ~5KB | 核心 | 2025-12-15 |
| QUICK_REFERENCE.md | ~3KB | 参考 | 2025-12-15 |
| SCRIPTS_GUIDE.md | ~6KB | 详细 | 2025-12-15 |
| PROGRESS.md | ~8KB | 报告 | 2025-12-15 |
| FILE_MANIFEST.md | ~5KB | 清单 | 2025-12-15 |
| validation-report.json | ~2KB | 数据 | 动态 |
| scripts/ (4 files) | ~9KB | 代码 | 2025-12-15 |

---

## 🔗 内部链接速查

### 在 SCRIPTS_GUIDE.md 中
- 快速开始 → `## 使用建议`
- 命令说明 → `## npm 脚本命令`
- 脚本原理 → `## 脚本详解`
- 故障排查 → `## 故障排除`
- 格式规范 → `## 关键技术`

### 在 PROGRESS.md 中
- 项目状态 → `## 📈 项目现状总结`
- 数据统计 → `## 📊 验证统计数据`
- 问题清单 → `## 🔧 脚本详解` 之前的表格
- 后续计划 → `## 🚀 下一步工作计划`

### 在 QUICK_REFERENCE.md 中
- 常用命令 → `## 📋 所有可用命令`
- 快速开始 → `## 🚀 快速开始`
- 常见问题 → `## ⚠️ 常见问题`

---

## 🆘 获取帮助

### 问题排查流程

```
1. 查看 QUICK_REFERENCE.md § ⚠️ 常见问题
   ↓
2. 如果没找到，查看 SCRIPTS_GUIDE.md § 故障排除
   ↓
3. 如果仍未解决，运行 `npm run validate`
   ↓
4. 检查 validation-report.json 和 PROGRESS.md § 已识别的问题
   ↓
5. 必要时修改脚本或手动处理
```

### 快速查询方式

| 我需要找... | 用这个方式 |
|----------|----------|
| 命令功能 | 在 QUICK_REFERENCE.md 中搜索 |
| 脚本说明 | 在 SCRIPTS_GUIDE.md 中搜索 |
| 文件说明 | 在 FILE_MANIFEST.md 中搜索 |
| 问题描述 | 在 PROGRESS.md 中搜索 |
| 整体情况 | 阅读 SUMMARY.md |

---

## 🎓 最后的建议

> **如果你只有 5 分钟:** 阅读 SUMMARY.md

> **如果你有 15 分钟:** 阅读 SUMMARY.md + QUICK_REFERENCE.md

> **如果你有 1 小时:** 完成路径 B (标准学习)

> **如果你想完全掌握:** 完成路径 C (深入掌握)

---

**选择你的起点:**
- 🏃 快速使用 → [SUMMARY.md](SUMMARY.md)
- 🚶 标准学习 → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- 🧑‍🎓 深入学习 → [SCRIPTS_GUIDE.md](SCRIPTS_GUIDE.md)
- 🔍 查看进展 → [PROGRESS.md](PROGRESS.md)

---

*最后更新: 2025-12-15*  
*希望这个索引对你有帮助!*