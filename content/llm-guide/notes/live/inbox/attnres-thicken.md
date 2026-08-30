# attnres-thicken 回传

租约：先 git mv 节根散文件进 `2.2.2/08-AttnRes-深度维注意力聚合/`，再加厚。本文件可写回传。未改 live 三份、未改 2.2.2 节首页、未改 06/07、未改 2.1.3 / Qwen / GR / mHC 正文。未 commit。未 Delete。

## git mv

成功。`git status` 见 `R`/`RM`：

`…/2.2.2-多头注意力变体/Kimi-Attention-Residuals-深度维注意力聚合.md`
→ `…/2.2.2-多头注意力变体/08-AttnRes-深度维注意力聚合/08-AttnRes-深度维注意力聚合.md`

节根旧图 `2.2.2/images/fig-attnres-*.png` **未删**。新图落在专文夹 `images/`。

## 新路径

- 正文：`content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/08-AttnRes-深度维注意力聚合/08-AttnRes-深度维注意力聚合.md`
- 图 1：`…/08-AttnRes-深度维注意力聚合/images/fig-attnres-fixed-vs-depth.png`（固定 +1 累积 vs 深度维 softmax）
- 图 2：`…/08-AttnRes-深度维注意力聚合/images/fig-attnres-not-g1-mhc-gr.png`（不是 $G_1$ / mHC / GR / xHC）

## 一手 URL

- abs：https://arxiv.org/abs/2603.15031
- HTML：https://arxiv.org/html/2603.15031
- PDF：https://arxiv.org/pdf/2603.15031
- HF papers：https://huggingface.co/papers/2603.15031
- 官方 GitHub：https://github.com/MoonshotAI/Attention-Residuals
- README raw（`master`，`main` 404）：https://raw.githubusercontent.com/MoonshotAI/Attention-Residuals/master/README.md
- Kimi Linear（48B 所接骨架）：https://arxiv.org/abs/2510.26692
- K3 Block 划块（另一份捆法，9 源不是 10）：https://arxiv.org/abs/2607.24653

知乎未搬正文；讲法只对照本库 06 / 03-GR。

## 汉字数

去 YAML 后 `[\u4e00-\u9fff]`：**4045**（≥4000）。式号跟 HTML：(1)–(8)、(10)。Table 1–5 跟论文；Qwen3.8 Table 6 标明是残差消融，**未**写成「Qwen3.8 用了 AttnRes」，**未**把 AttnRes 塞进 Qwen4。

## 质检看哪段

正文 **§4 + 图 2 解析**（「不是 $G_1$，不是 mHC，不是 GR，不是 xHC」）：$G_1$ 乘 SDPA 头输出、残差仍是 $x+F(x)$；mHC 是双随机 $H_{\mathrm{res}}$、深度维线性注意（式 (10)）；GR 是 $n_r=4$ 逐元素读门且丢掉 $H_{\mathrm{res}}$；xHC 仍是流混合。轴是历史层，不是 token 维 KV，也不是换一种加法。
