# Obsidian 转 HTML 网站项目

这是一个将 Obsidian 笔记转换为具有导航功能的多页 HTML 静态网站的项目。

## 项目现状

### ✅ 已完成
- [x] 环境准备与技术选型（Node.js + npm）
- [x] Eleventy (11ty) 静态网站生成器安装
- [x] 项目目录结构创建
- [x] **统一所有笔记的 YAML front matter**
- [x] **检查并规范化内部链接格式**
- [x] **确保 MathJax 公式语法正确**

### 📋 后续计划
- [ ] 集成 Manim 动画支持
- [ ] 自定义主题和样式优化
- [ ] 生成静态 HTML 网站
- [ ] 部署到服务器

## 项目结构

```
.
├── public/                    # 输出的HTML网站
│   ├── index.html
│   ├── css/
│   └── notes/
├── src/                       # 源文件
│   ├── notes/                # Markdown笔记
│   ├── _includes/            # 11ty模板
│   └── *.md                  # 其他markdown文件
├── scripts/                   # 处理脚本
│   ├── add-frontmatter.js    # 统一front matter
│   ├── convert-links.js      # 转换Obsidian链接
│   ├── validate-mathjax.js   # 验证MathJax公式
│   ├── validate-and-report.js # 生成验证报告
│   └── fix-all-frontmatter.js # 修复所有front matter
├── package.json
└── .eleventy.js

```

## npm 脚本命令

### 预处理脚本

#### `npm run preprocess:frontmatter`
统一所有笔记的 YAML front matter，确保所有笔记都包含：
- `title`: 笔记标题
- `layout`: 使用的11ty模板
- `date`: 创建日期
- `permalink`: 输出路径
- `tags`: 标签数组

**功能:**
- 检测缺失的front matter并添加
- 规范化中文标题编码
- 自动生成 permalink（基于文件名）

#### `npm run preprocess:links`
将 Obsidian 的 `[[链接]]` 格式转换为标准 Markdown 链接 `[文本](路径)`

**功能:**
- 递归扫描所有markdown文件
- 检查链接目标文件是否存在
- 处理链接别名 `[[文件名|显示文本]]`
- 处理块引用 `[[文件名#标题]]`
- 标记断链（不存在的文件）

**输出示例:**
```
✓ 变分法与条件极值、拉格朗日乘数法的关系.md: 0 已转换, 4 断链
```

#### `npm run preprocess:math`
验证和修复 MathJax/LaTeX 公式语法

**功能:**
- 检查 `$...$` 和 `$$...$$` 配对
- 修复公式前后多余的空格
- 转换 `\(...\)` 为 `$...$`
- 转换 `\[...\]` 为 `$$...$$`
- 检查大括号匹配

**检查项:**
- ✓ $ 符号配对
- ✓ 显示模式公式格式
- ✓ LaTeX 语法规范
- ✓ 括号匹配

### 完整预处理

#### `npm run preprocess`
依次运行所有预处理脚本：
1. 统一 front matter
2. 转换链接格式
3. 验证并修复公式

#### `npm run validate`
生成详细的验证报告

**输出内容:**
- 总文件数
- front matter 完整率
- 缺失字段数
- 断链数
- 公式问题数
- 有问题文件的详细列表

**输出文件:** `validation-report.json`

### 构建和开发

#### `npm run build`
预处理 → 用 11ty 生成静态网站

#### `npm run dev`
预处理 → 11ty 开发服务器（自动监听文件变化）

#### `npm run serve`
预处理 → 11ty 服务器（不监听变化）

## 验证结果

### 当前状态 (2025-12-15)

📊 **验证统计:**
- 总笔记数: 18
- front matter 完整率: 100% (18/18)
- 缺失字段: 0
- 断链: 4
- 公式问题: 4
- 需要修复的文件: 5/18

### 已识别的问题

#### 断链 (4个)
主要在 `变分法与条件极值、拉格朗日乘数法的关系.md` 中：
- `[[欧拉-拉格朗日方程]]` → 文件不存在
- `[[庞特里亚金原理]]` → 文件不存在
- `[[约束优化]]` → 文件不存在
- `[[泛函分析基础]]` → 文件不存在

**解决方案:** 
创建缺失的笔记文件或修改链接指向现有笔记

#### 公式问题 (4个)
部分文件中公式前后有多余空格（已自动修复）：
- `平方和因子的"刚性".md`
- `微积分中关于使用模平方的使用技巧说明.md`
- `未命名.md`
- `欧拉常数 γ 3.md`

**解决方案:** 
自动修复脚本已处理，现在格式正确

## 关键技术

### YAML Front Matter 格式

所有笔记应该以标准的 YAML front matter 开头：

```yaml
---
title: "笔记标题"
layout: "note.njk"
date: "2025-09-27"
permalink: "/notes/笔记-标题/index.html"
tags: ["标签1", "标签2"]
---

# 笔记内容开始...
```

### 链接格式

**Obsidian 原始格式:**
```markdown
[[笔记名称]]
[[笔记名称|显示文本]]
[[笔记名称#标题]]
```

**转换后的 Markdown 格式:**
```markdown
[笔记名称](/notes/笔记-名称/)
[显示文本](/notes/笔记-名称/)
[笔记名称 (标题)](/notes/笔记-名称/)
```

### 公式格式

**内联公式:**
```markdown
这是内联公式 $E=mc^2$ 的例子
```

**显示公式:**
```markdown
$$
E=mc^2
$$
```

**推荐格式:**
- 使用 `$...$` 作为内联公式分界符
- 使用 `$$...$$` 作为显示公式分界符
- 显示公式的 `$$` 应该单独占据一行
- 避免在 `$` 前后使用多余空格

## 文件编码注意事项

所有脚本均使用 UTF-8 编码处理中文内容，确保：
- ✓ 中文标题正确保存
- ✓ 中文链接正确处理
- ✓ 中文注释完整保留

## 使用建议

### 第一次使用

1. 克隆项目并安装依赖:
```bash
npm install
```

2. 运行完整预处理:
```bash
npm run preprocess
```

3. 检查验证报告:
```bash
npm run validate
```

4. 解决报告中的问题，然后构建网站:
```bash
npm run build
```

### 日常开发

```bash
# 监听文件变化并自动重新生成
npm run dev

# 或使用服务器模式（不监听变化）
npm run serve
```

## 扩展和定制

### 添加新的预处理脚本

在 `scripts/` 目录中创建新脚本，然后在 `package.json` 中添加命令：

```json
"scripts": {
  "preprocess:custom": "node scripts/your-script.js"
}
```

### 修改11ty配置

编辑 `.eleventy.js` 来改变：
- 输入/输出目录
- 模板语言
- 构建过程

### 自定义模板

修改 `src/_includes/` 中的模板文件来改变网站的外观和功能。

## 故障排除

### 问题：脚本中文输出显示乱码

**原因:** PowerShell/终端编码问题（不影响文件内容）

**解决:** 使用 `chcp 65001` 或使用 Node.js 读取文件验证实际内容

### 问题：报告中显示 front matter 不完整

**解决:** 运行 `npm run preprocess:frontmatter` 来修复

### 问题：存在断链

**解决:** 
1. 查看验证报告中的具体断链
2. 创建缺失的笔记文件，或
3. 修改链接指向现有笔记

## 其他文件说明

### `fix-all-frontmatter.js`
已弃用的旧脚本，功能已集成到 `add-frontmatter.js`

## 许可证

ISC