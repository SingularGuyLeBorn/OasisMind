---
title: 切片 · RSI 前世今生（完全不懂的人）
date: 2026-08-30
published: false
status: done
as_of: 2026-08-30
---

# rsi-origin · 成文

只改了：

- `content/rsi/0-导读/0-导读.md` + `images/fig-rsi-origin-timeline.png` / `fig-rsi-recursive-vs-oneshot.png` / `fig-rsi-three-layers.png`
- `content/rsi/1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md` + `images/fig-rsi-improver-operator.png`（旧 `fig-rsi-four-terms.png` 已是浅色，保留引用、不删）
- 本 inbox

未改：`_garden.md`、`chapter-structure-plan.md`、其它 RSI 章、`notes/`、llm-guide 正文、live 三份。未 Delete。未 commit。

质检员先看导读 **§1 一句话 + §2 前世（Good / 种子 / Gödel machine）+ §3 今生**，不要只扫「2026 的轴」表。

## 一手 URL（本切片读过）

### Good 1965

- DOI：https://doi.org/10.1016/S0065-2458(08)60418-0
- 重印 PDF 条目：https://vtechworks.lib.vt.edu/items/5085379d-b24c-424e-8861-e70a47b4b2fb
- bitstream：https://vtechworks.lib.vt.edu/server/api/core/bitstreams/a5e423ee-54e0-4eec-aeca-32b73f851af5/content
- 整卷 IA：https://archive.org/details/advancesincomput0006unse
- DBLP 卷 6：https://sigmod.org/publications/dblp/db/journals/ac/ac6.html （pp. 31–88）

### Schmidhuber Gödel machine

- arXiv abs：https://arxiv.org/abs/cs/0309048 （v1 2003-09-25，v5 2006-12-17）
- PDF：https://arxiv.org/pdf/cs/0309048
- 主页：https://people.idsia.ch/~juergen/goedelmachine.html

### 种子 AI / 早期自改代码叙事

- GISAI Wayback：https://web.archive.org/web/20120805130100/singularity.org/files/GISAI.html
- LessWrong 2008-12-01：https://www.lesswrong.com/posts/JBadX7rwdcRFzGuju/recursive-self-improvement
- 术语年表（二手，只用来钉 2001 年）：https://tecunningham.github.io/posts/2026-06-05-rsi-definitions.html

### OpenAI system card / PF（RSI 当能力项）

- 博客 2025-04-15：https://openai.com/index/updating-our-preparedness-framework/
- PF v2 PDF：https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf
- o3 / o4-mini system card：https://openai.com/index/o3-o4-mini-system-card/
- o3 PDF：https://cdn.openai.com/pdf/2221c875-02dc-4789-800b-e7758f3722c1/o3-and-o4-mini-system-card.pdf
- GPT-5.5 AI Self-improvement：https://deploymentsafety.openai.com/gpt-5-5/ai-self-improvement

### Anthropic（链第 5–6 章，不重写安全专文）

- When AI builds itself：https://www.anthropic.com/institute/recursive-self-improvement
- RSP 入口：https://www.anthropic.com/responsible-scaling-policy
- RSP v3.0 PDF：https://www-cdn.anthropic.com/e670587677525f28df69b59e5fb4c22cc5461a17.pdf

## 薄 + `[OM-FREEPLAY]` 处

- PF v2 Table 1 的 Critical 操作化句子：官方 PDF 抽取乱码，导读不把二手转写升格成定理，只钉 Tracked Category + High 未达 + Critical 与 recursively self-improving / 全自动 AI R&D 绑在一起。
- GISAI 精确首发年：以 Wayback 文本 + Cunningham 年表的 2001 为准，未另找 2001 纸本。

## 新图

| 文件 | 落点 |
|------|------|
| `fig-rsi-origin-timeline.png` | `0-导读/images/` 图 1 |
| `fig-rsi-recursive-vs-oneshot.png` | `0-导读/images/` 图 2 |
| `fig-rsi-three-layers.png` | `0-导读/images/` 图 3 |
| `fig-rsi-improver-operator.png` | `01-RSI-术语辨析/images/` 图 3 |

## 监工质检（2026-08-30）

- 导读汉字 **4262**；01 汉字 **4754**。先读导读 §1–§3（Good / 种子 / Gödel / 今生能力项），01 看 §2 算子 + §6 判定表。
- GISAI 2001 年、PF v2 Critical 逐句均已 `[OM-FREEPLAY]`。未 Delete、未写 `rsi/notes/`。
- 监工改 `_garden.md` 先读标题为前世今生；第 1 章地图加一句指向导读。未改第 2–6 章。
