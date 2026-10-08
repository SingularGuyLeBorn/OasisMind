# 内核流程图候选核查

正文已分段回读并完成坐标、页数、加载mask、gather成本、online softmax与dropout修正。现有 index-to-kernel-flow.png 的 row_ptr 与物理页路径、Q到KV的gather连线和未定义输出标量会造成误解，需重制。旧资产保留。

来源：FlashInfer 0.7.0.post1 官方 sparse 文档的 indptr、indices 和块内 mask 定义 https://docs.flashinfer.ai/api/sparse.html ，以及 FlashAttention v2 Algorithm 2 https://arxiv.org/html/2205.14135v2 。本图是通用教学路径，并非某个 FlashInfer API 的内部实现逐图重绘；请求页表与块索引是分别讲解的两个映射。

内置生图 v1 已生成并查看；接口无法指定或确认 Image 2.5。indices=[0,1]、indptr=[0,2]、请求页表[41,7]与六候选位置符合正文，数值已由 sparse-kernel-numeric-verify.py 复算。候选保存在 sparse-kernel-candidate-v1.png，未替换正文。

待修正：上方实际缓存到下方K/V输入缺少连接；累计状态只强调新tile最大值更大，未讲清较小tile分子分母也需按统一最大值缩放；压缩槽位条在63之后又出现省略号，容易误解为超出页容量。必须通过局部修正并重新核查之后才可进入文章。此记录不代表图片已验收、全库已完成或云端已部署。
