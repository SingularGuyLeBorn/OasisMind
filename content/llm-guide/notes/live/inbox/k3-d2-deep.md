---
title: 切片 · Kimi K3 报告精读加深
date: 2026-08-30
published: false
status: done
---

# k3-d2-deep · 监工点评

只准改：`content/llm-guide/14-主流开源模型全景解析与技术报告精读/14.5-Kimi/05-Kimi-K3/` 下已有 `01-Kimi-K3-架构精译.md`、`05-Kimi-K3-Index.md`（若存在）、该夹 `images/`，以及本 inbox。

禁止：14.5 首页、KDA/AttnRes/SiTU/LatentMoE/QB 体系专文、live、commit、Delete。禁止在本夹再推一遍那些公式（链回第 2/6 章）。

## 一手 URL（本切片读过）

- https://arxiv.org/abs/2607.24653
- https://arxiv.org/html/2607.24653
- https://huggingface.co/moonshotai/Kimi-K3
- https://github.com/MoonshotAI/Kimi-K3
- https://raw.githubusercontent.com/MoonshotAI/Kimi-K3/main/README.md
- https://www.kimi.com/blog/kimi-k3
- https://github.com/MoonshotAI/MoonEP
- https://github.com/kvcache-ai/AgentENV
- https://github.com/MoonshotAI/minitriton
- https://github.com/MoonshotAI/nano-kpu

## 要写什么

一手：https://arxiv.org/abs/2607.24653 与 HTML。HF `moonshotai/Kimi-K3`。现有 01 已读 §1–5.2 一部分；**把报告后半读完**（数据配比能抄的抄、后训练/QAT/MTP-EAGLE-3、评测表、局限）。

必须：

1. 仍是第 14 章精读口吻：这次发版捆了什么。三条轴（序列 KDA / 深度 AttnRes / 宽度 LatentMoE）保留，补报告里还没进 01 的表。
2. Table 1：2.78T / 104.2B vs 摘要 2.8T / 104B 继续分口径，禁止合成第三个数。
3. 评测数字只抄 README / 报告表，不从图估像素。
4. 浅色图 1–2 张补缺口（例如 QAT 训推同量化、或 MoonEP 完美均衡）——不要重画已有 `fig-kimi-k3-token-depth-width.png`。LIGHT THEME ONLY 整段。
5. 成文。篇幅长但不啰嗦：按报告章节走，跳过已写透的积木推导。

用户 2026-08-30 点名：K3 报告非常重要。

## 本切片落地

- 成文：`01-Kimi-K3-架构精译.md`（§3.1–3.4、§4 全文、§5.2–5.4、§6–8、附录 E；配比百分数未公开 → 未公开 + `[OM-FREEPLAY]`）
- 新图：`images/fig-kimi-k3-qat-mxfp.png`、`images/fig-kimi-k3-mtp-eagle3.png`
- Index 目录句已同步
## 监工质检（2026-08-30）

合格入库。汉字约 5249（`[\u4e00-\u9fff]`，过 4000）。删了 01 里残留 GenerateImage HTML 注释。2.78T/104.2B 与摘要 2.8T/104B 分口径；$2.5\times$ 是 held-out OOD；QAT 路由专家 MXFP4 w / MXFP8 act；MTP→EAGLE-3 用 $\mathcal{L}_{\mathrm{LK}}$ 不是 KL。未改 14.5 首页。
