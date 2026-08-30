---
title: llm-guide 监工协议（父代理拆工 · 子代理写正文）
date: 2026-08-30
tags: [ops, supervisor, llm-guide]
published: false
excerpt: Goal 父代理必读。自己当监工，Task 拉子代理写笔记。子代理不 commit。
category: LLM 指南
---

# 监工协议

父代理（贴进 Goal 的那一个）**当监工，不当唯一作者**。大块正文用 Cursor `Task` 派出去。子代理挂了就带评语重派。

薄项（一处勘误、补一句交叉链接、改索引一行）可以自己写完，不必为派而派。

## 父代理每回合

1. Read live 三份 + `trusted-sources.md` + `chapter-structure-plan.md`。从 PLAN 第 1 件拆切片；**新文路径必须能在结构规划落点表里找到唯一格，且符合文件名规范**（一夹一文同名；同一父目录 C 与 A 不混用；同级序号不重复；无空格冒号）。开夹前 `ls`，专文取 `max(NN)+1`。
2. **先写租约再派工**：在 `PLAN.md`「路径租约」表登记每个切片的**独占路径**（两两不相交）。然后 `Task` 拉 **2～5** 个 `generalPurpose`，`run_in_background: true`。brief 里只准出现租约里的路径。
3. 回收后质检。不合格重派（租约保留）。合格：把子代理回传的 URL **由你**追加进 PROCESS，改 PLAN/GOAL，**按主题 commit**，租约改 `done` 或删行。
4. 还有队列就再派。不要问用户「要不要继续」。不要输出「下一会话从…」然后停。

禁止：把能并行的大块全自己写「因为更快」；两个子代理改同一文件；`move_agent_to_root`；让子代理 commit；让子代理改 live 三份 / Skill / trusted-sources / supervisor。

## 路径租约（防冲突的办法，必须做）

并行冲突几乎都来自抢同一份 md，尤其是 `PLAN.md` / `PROCESS.md` / 章首页。

**一句话：一篇专文 + 它的 `images/` = 一个租户。共享文件只许监工改。**

| 谁 | 可以改 | 不可以改 |
|----|--------|----------|
| 子代理 A | 租约里列出的专文、该文 `images/`、该文同目录新建的 `fig-*.png` | 任何未列出的路径；live；别人的专文；章首页（除非租约明确把首页独租给 A） |
| 子代理 B | 另一组不相交路径 | 同上 |
| 监工 | live 三份、租约表、章首页交叉链接、commit | 不要在子代理还没交卷时改他们独占的专文 |

细则：

- **粒度是文件，不是章节。** 同一章里两篇专文可以并行；不要两个代理同时改 `2.3.2-稀疏与压缩注意力.md` 这种索引。需要改索引时：要么本波只派一个代理并独租该索引，要么两篇交完后**你**补链接。
- **交叉引用只读。** 子代理可以 Read 邻居文章，禁止改邻居正文。
- **来源台账不并行写。** 子代理把 URL 写在 Task 回传里（或独占文件 `notes/live/inbox/<切片ID>.md`）。你回收后合并进 `PROCESS.md`。
- **inbox 可选：** 若回传怕丢，brief 里指定唯一 `notes/live/inbox/<id>.md`，该文件也写入租约，且只给这一个代理。
- **路径字符串要比对规范化后的相对路径**（正斜杠、无 `../` 逃出租约）。
- **重叠就不要并行。** 两切片都要动同一文件 → 合成一个切片，或拆成先后两波。
- **不要给每个子代理开 worktree。** 本机 Goal 共用工作区；靠租约隔离。禁止 `move_agent_to_root`。

派工前自检：把本波所有「只准改」路径放进一个集合，`intersection` 必须为空。有交集就改租约，不许派出。

## 质检（抽查磁盘，凭记忆不算过）

- 有「本篇来源」或等价参考文献，且 PROCESS 台账有对应 URL。
- 不是空壳、不是标题下只有一句话。
- 图无水印、是 GenerateImage 或 mermaid/表，有「图 N 解析」。**必须浅色主题**（白底深字、浅色色块）。深色底 / 白字 / OLED 幻灯片风 = 不合格，重画后再收。
- 没抄 `trusted-sources.md` 里的课/博客正文，没搬兄弟花园。
- 没把课程当年的「最新」写成 2026-08 事实。
- 新专文路径能对上 `chapter-structure-plan.md` 落点表 **且过文件名规范**（夹名 = 主 md 名；无空格/冒号；同级 `{NN}` 不重复；新图 `fig-kebab.png`）。章首页不是第二份专文。

## 子代理 brief（每个 Task prompt 必须自包含，复制下列死命令）

仓库：`D:\ALL IN AI\OasisMind`。只改下面列明的 `content/llm-guide/` 路径。

- 先 Read：`.cursor/skills/llm-guide-notes/SKILL.md`、`canon.md`、与本篇同族的一篇金样本；`notes/trusted-sources.md`；`notes/chapter-structure-plan.md`（落点表 + **C/A/D 编号**：点分号是树坐标，两位 `NN` 是专文序，第 14 章的 `01`/`03`/`05` 不要搬进 1–13；本切片路径必须一夹一文同名、无空格冒号）。
- 中文正文。禁止 Delete 任何既有文件。禁止 `move_agent_to_root`。禁止 commit / push / `git add -A`。禁止改 `apps/`。
- WebSearch / WebFetch 原论文、model card、官方 blog。论文读完后可用 `pnpm --filter @oasismind/server zhihu -- search "<概念>"` 再 `zhihu -- read <url>`（`--offset` 翻页）。知乎只学讲法，数字以论文为准，禁止搬专栏正文/图。不要用 WebFetch 硬扛知乎。URL **写在回传里**（或只写进租约指定的 `notes/live/inbox/<id>.md`）。**禁止改** `notes/live/GOAL.md`、`PLAN.md`、`PROCESS.md`。没上台账的规格不准写。课程不是金科玉律。
- 找不到一手：`[OM-FREEPLAY]` + 「未找到一手来源」。
- 禁止抄袭：不搬 CS336/Lil'Log/科学空间/兄弟花园正文或图。
- 新文 `as_of: 2026-08-30`，文末「本篇来源」。图：GenerateImage，无水印，**浅色主题**（description 必须含 Skill「配图」里那整段 `LIGHT THEME ONLY: …`；禁止深色底白字）。
- 禁止标题下只有一句话。做完在回传里写：改了哪些路径、读了哪些 URL、质检员该看哪一段。

再写清：**本切片要写什么、只准动哪些文件、不要和别人的切片重叠。**
