# HySparse2 图文复核

## 已核对的来源与正文

官方论文：https://arxiv.org/html/2609.26368v1 。读取 §3.2、§3.3、§3.5 与 §4.1。

- Bridge 的来源是 self full layer 的输入 hidden states。cross full layer 保留自己的 K/V 投影，query 从自己的输入产生；共享来源不等于共享投影。
- 固定最近窗口，再从窗口外选择 global top-k。论文实验为 128 个 local 与 1024 个 global；长历史共有 1152 个不同位置。
- Full attention 为当前 query 产生 oracle，随后 sparse layers 在组内复用该 query 的 indices 与 global KV。历史 KV 可持续追加，indices 不能跨新 query 当作不变 cache。
- Prefill 节点执行 self-decoder 与 bridge 投影，投影后的 cross KV 传到 decode 节点。论文的配置包含 self-decoder 25 层和 cross-decoder 24 层。
- 全局候选与 recent window 读取同一共享 KV。取消的是 cross sparse layer 的独立 SWA 分支，不是 self-decoder 的 SWA 层。

## 当前图片的实际检查

已查看正文引用的 `content/SparseAttention/2-动态路由/2.3-跨层共享/images/hysparse2-two-level-sharing.png`。

图中只有 Local、Full、Sparse 大框和 Bridge/Reuse 连线。Bridge 箭头从 Full 框边缘出发，无法判断是层输入还是层输出；没有表示层专属 K/V 投影、本层 query、候选窗口、oracle 更新或 Prefill/Decode 路径差异。因此该图保留原文件，但不能作为完整机制图通过验收。重制应直接展开输入表示、投影、持久 KV、当前 query 的 oracle 以及 sparse 消费者。

## 手算验证

配套 `sparse-hysparse2-verify.cjs` 用零起点 toy 序列，固定最近窗口后仅从窗口外排序；验证短历史、并列分数、候选互斥和全历史最高分位于 recent window 的情形。实际预算以 1,048,576 个位置计算：1152/1048576=0.10986328125%。16-token 页且窗口对齐时，recent 占 8 页，全局候选最分散时最多增加 1024 页；集中对齐时总共只需 72 页。

本记录仅对应这篇文章的正文与旧图复核，不代表 SparseAttention 全库完成。

## 第四版机制图

实际查看论文 v1 第 4 页 Figure 2 后，通过内置生图及三次局部编辑形成第四版。已复核输入源、各消费层投影、黑色串行层链、蓝色桥接 KV、cache 到 gather 的读取、当前 query 的 indices、独立 SA query 与八位置表。新版进入正文，旧图及全部候选保留。图中主干省略 MLP/残差，图注明确这一粒度；实际网页重建与两种宽度验收尚未完成。
