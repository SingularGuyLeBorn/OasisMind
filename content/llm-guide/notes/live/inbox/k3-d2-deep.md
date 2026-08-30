---
title: 切片 · Kimi K3 报告精读加深
date: 2026-08-30
published: false
status: running
---

# k3-d2-deep · 监工点评

只准改：`content/llm-guide/14-主流开源模型全景解析与技术报告精读/14.5-Kimi/05-Kimi-K3/` 下已有 `01-Kimi-K3-架构精译.md`、`05-Kimi-K3-Index.md`（若存在）、该夹 `images/`，以及本 inbox。

禁止：14.5 首页、KDA/AttnRes/SiTU/LatentMoE/QB 体系专文、live、commit、Delete。禁止在本夹再推一遍那些公式（链回第 2/6 章）。

## 要写什么

一手：https://arxiv.org/abs/2607.24653 与 HTML。HF `moonshotai/Kimi-K3`。现有 01 已读 §1–5.2 一部分；**把报告后半读完**（数据配比能抄的抄、后训练/QAT/MTP-EAGLE-3、评测表、局限）。

必须：

1. 仍是第 14 章精读口吻：这次发版捆了什么。三条轴（序列 KDA / 深度 AttnRes / 宽度 LatentMoE）保留，补报告里还没进 01 的表。
2. Table 1：2.78T / 104.2B vs 摘要 2.8T / 104B 继续分口径，禁止合成第三个数。
3. 评测数字只抄 README / 报告表，不从图估像素。
4. 浅色图 1–2 张补缺口（例如 QAT 训推同量化、或 MoonEP 完美均衡）——不要重画已有 `fig-kimi-k3-token-depth-width.png`。LIGHT THEME ONLY 整段。
5. 成文。篇幅长但不啰嗦：按报告章节走，跳过已写透的积木推导。

用户 2026-08-30 点名：K3 报告非常重要。
