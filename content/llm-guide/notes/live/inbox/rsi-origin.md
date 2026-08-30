---
title: 切片 · RSI 前世今生（完全不懂的人）
date: 2026-08-30
published: false
status: running
---

# rsi-origin · 监工点评

只准改：

- `content/rsi/0-导读/`（`0-导读.md` + images）
- `content/rsi/1-坐标系与术语/01-RSI-术语辨析/`（md + images）
- 本 inbox `content/llm-guide/notes/live/inbox/rsi-origin.md`

禁止：`_garden.md`、`chapter-structure-plan.md`、其它 RSI 章、`notes/` 新专文、Delete、live 三份、commit、llm-guide 正文。

## 要写什么

用户 2026-08-30：现有 RSI 库「写得一塌糊涂」；要给 **完全不懂 RSI 的人** 讲明白前世今生。图文并茂，长但不啰嗦，公式多但不晦涩，**浅色图**。

`0-导读` 改成真正的入门长文（现有「2026 的轴」表可折进，不要双轨修订块）：

1. 一句话：RSI = 改进过后的系统，**继续当改进器**。
2. 前世：I.J. Good 智能爆炸、种子 AI、Schmidhuber Gödel machine（公式点到能读的程度，不抄讲义）、早期「自改代码」叙事。数字/年份必须能指回一手（原论文或斯坦福/百科条目 URL）。找不到就薄 + `[OM-FREEPLAY]`。
3. 今生 2024–2026：实验室叙事 vs 生产里绝大多数还不是权重递归改自己。Anthropic / OpenAI system card 把 RSI 当能力项（链第 6 章现有文，不重写安全专文）。田渊栋公司只指针到第 5 章。
4. 不是：OPD（链 llm-guide 4.6）、不是 harness 产品（链 llm-guide 13）、不是持续学习、不是 TTT。
5. 然后才是 Model / Harness / Artifact 三层地图（细节仍链 02，这里用一张浅色总图讲完）。

`01-术语辨析`：加长「什么时候能叫 RSI」判定表 + 失效模式。保留四词图；若旧图深色则**新浅色 `fig-*.png` 改引用，旧文件不删**。

配图至少 3 张浅色（时间线；递归 vs 单轮自改进；三层）。GenerateImage description 必须含整段 LIGHT THEME ONLY。禁止 mermaid 当唯一图。禁止搬 CS329A / 周星星 / 专栏正文。

成文。`as_of: 2026-08-30`。
