---
title: llm-guide 可信参考源（覆盖面与讲法，禁止抄袭）
date: 2026-08-30
tags: [ops, sources, llm-guide]
published: false
excerpt: Goal 开工必读。课表只体检覆盖面，不是最新真相。禁止抄袭。
category: LLM 指南
---

# 可信参考源

给续写代理用。数字和公式仍以 **原论文 / 官方报告 / model card** 为准（见 Skill `research.md`）。本文件只解决两件事：

1. **覆盖面**：主题树 0.2 是不是漏了整块。
2. **讲法**：有数学基础、但还没学过这个概念的人，别人怎么拆问题。

## 死命令（违反 = 本篇不合格）

- **禁止抄袭**：不要复述、改写、翻译、拼接他人正文；不要移植别人的章节树当本库目录；不要下载或临摹其配图（含语雀/知乎/论文 PDF 截图）。
- **知乎当讲法参考，不当事实源。** 顶刊顶会读完后，可用本机 `pnpm --filter @oasismind/server zhihu -- search/read` 看高质量专栏/回答：学拆问题的方式、工程口碑、争议点。冲突时仍以原论文 / 官方报告为准。不要把知乎正文搬进花园。
- **课程与公开课不是金科玉律。** LLM 按月变。CS336 / CS224N / 李宏毅 / HF Course / d2l 只是**某一学期的覆盖面快照**：用来发现「整块主题是不是漏了」。它们的默认假设、SOTA 名单、GPU 代际、框架默认值**经常已经过时**。课上没有的 2026 报告 trick 必须写；课上有但已被后文打脸的，用勘误接到今天，不要把讲义当年的「最新」抄进正文当现在。
- 事实冲突时的排序：**2026 原论文 / 官方技术报告 / model card / 官方 blog** ≫ 本库已读过的一手台账 ≫ 课程与二次博客。课程赢不了报告。
- 本仓库兄弟花园（`knowledge/cs336`、`classic-papers`、`diffusion-llm`、`llm-interview`）**只链不抄**，同样不当 2026 真相。
- 发现「别人也有这篇」只说明该写专文，不说明可以复述。自己读一手、自绘图、用本库 MoE/MHA 节奏写。
- 中文自媒体、面试背诵站、带水印公众号：**只当「有没有这个词」**，不当时事实。
- 打开过的 URL 记入 `notes/live/PROCESS.md`。

## 本仓（先对这里）

| 路径 | 当什么用 |
|------|----------|
| `content/knowledge/cs336/` | 课程序列：tokenizer → 架构 → GPU/kernel → 并行 → scaling → 数据 → 对齐 |
| `content/classic-papers/` | 积木从哪来（Attention、ResNet、MoE…） |
| `content/diffusion-llm/`、`content/llm-interview/` | 指针；不并进 llm-guide 再写一套 |

## 课表（只体检覆盖面，不当最新）

学期大纲滞后于报告。对完「有没有这块」就合上，去搜 2026 一手。不要按课表裁掉本库已有的专文，也不要把讲义里的「最新 GPU / 默认优化器 / 对齐算法」写进 2026-08 正文。

| 源 | URL | 当什么用 |
|----|-----|----------|
| Stanford CS336 2026 | https://cs336.stanford.edu/ | 第 2/6/9 章对照：MoE、GPU、Triton、并行、Muon/SOAP、数据、RLVR |
| CS336 讲义仓库 | https://github.com/stanford-cs336/lectures | 大纲条目；不要搬 lecture 正文进花园 |
| Stanford CS224N | https://web.stanford.edu/class/cs224n/ | 注意力/编码的课表粒度，不当 2026 前沿 |
| 李宏毅 生成式/LLM | 搜课程主页与 YouTube | 中文口播：问题先于名词；不搬幻灯片 |

缺课上有、本库没有的块 → 先 WebSearch 2026 一手，再决定开专文还是章索引加节。课上没有、本库已有的专文 → 留下。课上写「最新」但报告已改 → 勘误，不要跟着课。

## 讲法（有数学、不懂这个概念）

| 源 | URL | 学什么（学完合上） |
|----|-----|-------------------|
| 科学空间 | https://spaces.ac.cn/ | 问题 → 已有差在哪 → 公式；本库文风锚 |
| 知乎专栏/回答 | 本机 `zhihu search` → `zhihu read` | 中文工程口吻、争议、实现分叉的线索；数字回论文核对 |
| Lil'Log | https://lilianweng.github.io/ | 一篇一个机制；公式 + 图 + 失效 |
| Illustrated Transformer | https://jalammar.github.io/illustrated-transformer/ | 图嵌在论证里；图必须自绘 |
| Ahead of AI（Raschka） | https://sebastianraschka.com/blog/ | 报告拆成积木的拆法（对应 brief 0.4） |
| Transformer Circuits | https://transformer-circuits.pub/ | 机制可检验；不当科普模板 |
| Transformer Math 101 | https://blog.eleuther.ai/transformer-math/ | FLOPs / 显存数量级；对第 6/9 章 |

## 查漏（不当目录模板）

| 源 | URL | 当什么用 |
|----|-----|----------|
| Hugging Face LLM Course | https://huggingface.co/learn/llm-course | tokenizer / 数据 / 推理这几块有没有 |
| d2l.ai | https://d2l.ai/ | 注意力/优化器符号习惯 |
| 各家技术报告 | DeepSeek / Qwen / Kimi / Llama 等官方 PDF 或 arXiv | 拆技术进体系章；模型文只写捆法 |

## 讲法 Skill（可选，写一篇卡住时再读）

不是知识库。不要把它们的英文范文搬进 `content/llm-guide/`。

- 几何先、公式后：https://github.com/lyndonkl/claude （`math-intuition-coach` / `geometric-algebraic-bridge`）
- 公式不许跳步：https://github.com/gyy0592/claude-config/blob/main/skills/math-explain/SKILL.md
- 机制先于名字：https://github.com/guicortei/feynman-technique
