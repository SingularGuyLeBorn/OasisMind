# HySparse 一代双分支机制图

成图：`content/SparseAttention/2-动态路由/2.3-跨层共享/images/hysparse-v1-flow.png`。

编辑源：`docs/development/figure-production/hysparse-v1-flow.pptx`。成图由该 PPTX 导出，两个 PNG 的 SHA-256 已核对一致。最终图使用 PPT 原生对象绘制，没有生图提示词；曾生成的候选图因 Q 与 KV 的连接不准确而未采用。

结构依据：[HySparse v1 Figure 1 与 §3.2–3.3](https://arxiv.org/html/2602.03560v1#S3)。full layer 同时产出共享的 K/V 和块分数；块分数经 TopK 得到远程索引。sparse layer 的 global 分支依索引读取共享 K/V，local 分支读取本层 recent K/V，两支分别 softmax 后经门控合并。图中省略 MLP、残差及层组内其他 sparse layer；这些省略项已在正文图注标明。
