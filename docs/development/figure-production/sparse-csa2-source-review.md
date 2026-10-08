# CSA2 官方结构复核

- 官方报告：arXiv:2609.19969v1，实际下载并查看第 10 页 Figure 4；读取 §2.3.1、§2.3.2 与持久缓存章节。官方模型卡与 config.json 同时核对。
- 三种模式始终本层计算 main Q 与 SWA KV；Reindex、Reuse 不重新生成 main KV。decoder 的 Full 层从最终 encoder 状态投影全局 KV。
- 候选池由 Full 层同一次全域位置打分按块最大值选出，2048 个八位置块最多 16384 个候选。它与本层 top-512 不是同一集合。
- 修复式 (23) 重复计算 Full 池内精排的问题；它的数值例现在与式 (24) 使用相同打分口径。
- 区分持久 global KV 与当前 query 的候选池、indices；prefix 恢复不复用上一 query 的选择结果。
- 官方配置主干 40 层：纯 SWA 2、Full 4、Reindex 4、Reuse 30；2/8/14 为 encoder Full，20 为 decoder Full，24/28/32/36 为 Reindex，零起点。
- V4 CSA 的压缩步长 m 对应 2m 源 KV 且相邻区间重叠；CSA2 去掉重叠。步长与每项覆盖范围不可混用。
- 既有 ced-csa2-state-flow.png 已查看：没有区分 indexer K、main Q 与 SWA KV，多模式汇入单个 Sparse Attention，缺少状态来源和生命周期。旧文件保留，下一切片依 Figure 4/5 重制后替换引用。
