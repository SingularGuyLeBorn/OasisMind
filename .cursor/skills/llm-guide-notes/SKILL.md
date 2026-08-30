---
name: llm-guide-notes
description: >-
  Writes and extends OasisMind llm-guide technical notes in the house style
  (科学空间节奏 + 本库 MoE/MHA/RoPE/GQA/MLA 样本). Use when authoring or revising
  Markdown in content/llm-guide/, filling empty shells, adding 2026-08
  勘误, generating unwatermarked figures, or continuing the llm-guide Goal.
---

# llm-guide 笔记行文 Skill

给初学者看懂、给从业者能核对数字。不是百科、不是专栏转写、不是面试提纲。

写任何 `content/llm-guide/` 正文前，按顺序 Read：

1. `content/llm-guide/notes/live/GOAL.md`
2. `content/llm-guide/notes/live/PLAN.md`
3. `content/llm-guide/notes/live/PROCESS.md`
4. 本 Skill 的 [canon.md](canon.md)（样本路径与行文骨架）
5. 对覆盖面、学讲法：`content/llm-guide/notes/trusted-sources.md`（禁止抄袭；课程不当最新）
6. 需要搜论文时再读 [research.md](research.md)

然后从 `PLAN.md`「下一步 3 件」继续。禁止每次从全库盘点重来。

细则与主题树：`content/llm-guide/notes/goal-maximize-value-extreme.md`。本 Skill 管**怎么写一篇**。若你是 Goal 父代理：再读 `content/llm-guide/notes/supervisor.md`，自己当监工、Task 派子代理。

## 硬约束

- 只改 `content/llm-guide/` 及其 `images/`、`content/uploads/llm-guide/`。不要改 `apps/`、`packages/`、Chat/SSE。
- **禁止删除**任何既有文件（mineru、pdf、unused 图、空壳在写满前）。
- **禁止** `move_agent_to_root`（会 stash + reset，未提交正文会从工作区消失）。
- 不要 push，除非用户明确说推远程。不要 `git add -A`。不要改 `git config`。
- **一篇可验收切片做完就 commit**（专文 + 图 + PLAN/PROCESS 已改）：格式 `content(llm-guide): <中文摘要>`，按路径 `git add`。不要把十几篇堆到最后。PowerShell 用 `;`，不要 `&&`。
- 预训练只允许用来**决定搜什么**。数字、架构、日期、基准必须能指回来源台账里的某一条。
- 找不到一手来源：写「未找到一手来源」+ `[OM-FREEPLAY]`，宁可薄，不要编。
- 2025 原文用 `## 2026-08 修订` / 勘误接到今天，**不删旧段落**。
- 不是商品、不是开源立项。不要售卖包装、不要 PUBLIC-SLICE。
- PowerShell 无 `&&`，用 `;`。
- 清单勾完不是停：按 brief 0.8 继续补知识点。禁止标题下只有一句话。

## 一篇合格笔记长什么样

对齐苏剑林科学空间的节奏：**具体问题 → 已有做法差在哪 → 想法和公式 → 边界**。每一节是一块完整想法（大约能读完一个机制），不要论文式十几级空标题，也不要没有小标题的墙。

### 文首（2–5 句，禁止 800 字「为什么重要」）

1. 一句话定义对象 + 它卡住的瓶颈（KV 字节、负载不均、相对位置进不了点积…）。
2. 本篇在系列里的位置（后文拿它当**度量零点**或对照）。
3. 明确「不是」什么（不是专栏转写、不是把第 14 章厂商文再抄一遍）。

金样本开头：MHA 先立 KV Cache 参照系；RoPE 先点破「相对位置在点积里自动出现」；GQA 一句话插在 MHA 与 MQA 之间。

### 节骨架（按机制拆标题，不按公司拆）

推荐编号：`## 1. …` / `### 2.1 …`。标题要能当目录读懂（`01-MHA-多头注意力的标准形式`、`03-GQA-在性能与缓存之间折中`）。

每节内部顺序：

1. 问题（带数量级更好：`32768L`、`$2bsh$`）。
2. 符号定义，再公式。编号 `\tag{n}`，上文推过的只链不重推。
3. **图嵌在该节论证里**，紧跟 `> 图 N：…（论文 Figure x）`，再写 **图 N 解析**（自下而上或按色块讲数据流，3–8 条）。
4. 工程变体 / 消融 / 和邻居算法的**不是**关系（BPT 不是 Ring、不是 FA、不是 SP）。
5. 失效模式表或局限。
6. 链到下一篇或章索引。

文末：`## 本篇来源` 或 `## 参考文献`（至少 1 条一手：arXiv / 官方 blog / model card / 顶会）。

### 公式

- 中文叙述 + LaTeX。先定义 $d_{model}$、$H$、$G$ 再写矩阵。
- 先矩阵式，需要时再坐标展开（MHA 式 (7)–(14) 是上限，不是每篇都要双求和）。
- 关键等式写「先 Top-K 再 Softmax」这类**实现分叉**，并点名谁用哪条（Qwen / DeepSeek V1–V2）。

### 配图

- 用 Cursor `GenerateImage` 自绘，或 mermaid / Markdown 表。
- description 必须含：`white academic background, no watermark, no logo, no copyright text, no website URL`。
- 落点：`./images/fig-kebab-case.png`（或 `.jpg`），正文相对路径引用。
- **禁止**语雀 CDN、Substack、微信/知乎截图、论文 PDF 截图当配图。已有水印图：保留旧文件，新生成无水印版改引用。
- 数据表用 Markdown，数字来自官方表，不要手绘假坐标曲线冒充论文 Figure。

### 系列写法（MHA→MQA→GQA→MLA 这组最重要）

同一记号贯穿。后篇开头用相对链接指回前篇，声明「沿用记号」。一篇一个主问题，扩展（长上下文、多模态、工程映射）另开 `02-…扩展`。

## 写之前 / 写之后

写之前：在 `PROCESS.md` 来源表列出将读的 URL；打开论文/HTML/`pdfs/`。  
写之后：勾「已读」；改 `PLAN.md` 对应项；新文 `as_of: 2026-08-30`；碰过的索引不要把空壳标成 completed。

一篇算完成，当且仅当能回答：解决什么瓶颈、公式或算法步骤、和前代差在哪、何时失效、至少一条一手来源。文件存在 ≠ 写完。

## 不要做

- 不要先写家谱定位长文。
- 不要「标题 + 一句话」碎片节；当场写成完整节或并进上一节。
- 不要 B 档 SKU 开空文件夹。
- 不要两个子代理改同一文件。
- 不要宣布 Goal 结束；0.8 是持续补知识点。

## 额外资源

- 样本与反例：[canon.md](canon.md)
- 一手阅读流水线：[research.md](research.md)
- Goal 编排提示词：`content/llm-guide/notes/CURSOR-GOAL-续写提示词.md`
- 过夜脚手架：`content/llm-guide/notes/live/`
