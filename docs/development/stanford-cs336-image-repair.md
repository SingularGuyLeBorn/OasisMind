# StanfordCS336 图片修复来源记录（2026-10-11）

本文件记录被替换或撤下的 17 处外链图片。正式站点使用与文章同目录的 images/ 资产；原始 PDF 仅用于核对和裁图，不入库。页码均为 PDF 查看器中的页码。

1. 3.3-Gated-Activations / L3-P22.png → images/lecture3-p22-glu.png。
   来源：Stanford CS336 Spring 2025 Lecture 3，PDF 第 22 页，普通 FFN 与 ReGLU 公式。旧链接为 404；原文把它称作结构框图，替换时改为公式对照。
2. 3.3-Gated-Activations / L3-P25.png → images/lecture3-p25-glu-table.png。
   来源：同讲义 PDF 第 25 页，Narang 等人的参数量匹配实验表。旧链接为 404；原文的“所有指标稳定更好”改成按表格阅读。
3. 3.4-Normalization-Strategies / L3-P10.png → images/lecture3-p10-norm.png。
   来源：同讲义 PDF 第 10 页，Post-LN/Pre-LN 结构，讲义引自 Xiong 等人。旧链接为 404。
4. 3.4-Normalization-Strategies / L3-P12B.png → images/lecture3-p12-gradients.png。
   来源：同讲义 PDF 第 12 页右侧梯度范数曲线。旧链接为 404；图例中的 PostNorm 为紫色点线，不是旧文所写红线。
5. 3.4-Normalization-Strategies / L3-P16A.png → images/lecture3-p16-runtime.png。
   来源：同讲义 PDF 第 16 页，FLOPs 与实际运行时间表，讲义引自 Ivanov 等人。旧链接为 404；该表不是 RMSNorm 相对 LayerNorm 的加速实验。
6. 4.5-lecture4-DeepSeek-MoE / Yuque 1758964287470-2e671530-c289-4f2a-81b0-83f25c527147.png → images/deepseek-moe-figure2.png。
   来源：DeepSeekMoE 原论文 Figure 2，PDF 第 5 页；16B 实际专家配置见第 15 页。旧图及课件图均写成 Top-4，与原论文 2 shared + 64 routed、Top-6 不符。
7. 4.5-lecture4-DeepSeek-MoE / Yuque 1758964321375-9995a312-a0df-43e4-bca1-72520aca7f7b.png → images/deepseek-v2-figure2.png。
   来源：DeepSeek-V2 原论文 Figure 2，PDF 第 5 页；236B 专家配置见第 12 页。新图同时包含专家路由与 MLA，保留了所有箭头起讫。
8. 5.3-GPU-Execution-Model / static.slab.com/1oQ9_wI15wO5v-G6_Z6-r41Q.png → images/lecture5-p11-execution.png。
   来源：Stanford CS336 Spring 2025 Lecture 5，PDF 第 11 页，CUDA Grid/Block/Warp/SM 执行模型。旧链接为 404。
9. 5.3-GPU-Execution-Model / static.slab.com/wYI8z7-e-j5-M6-i_V7M-g8c.png → images/lecture5-p22-divergence.png。
   来源：同讲义 PDF 第 22 页，Warp 分歧的代码与时间线。旧链接为 404。
10. 6.1-主讲义 / miro.medium.com/1*6xoBKi5kL2dZpivFe1-zgw.jpeg → images/lecture5-p9-gpu.png。
    来源：同讲义 PDF 第 9 页，GA100 GPU 与 SM 内部布局。原外链可访问，但本站改用课程页裁图，避免外站依赖，并把图注限定到图中实际呈现的结构。
11. 6.1-主讲义 / horace.io/img/perf_intro/operator_fusion.png → images/lecture5-p27-fusion.png。
    来源：同讲义 PDF 第 27 页，未融合/融合的内存往返对比。原外链可访问；课程讲义中有同一张图，改为本地资产。
12. 6.3-Code-CUDA-GeLU / developer.download.nvidia.com/assets/cuda/files/reduction.png → images/cuda-grid-of-thread-blocks.png。
    来源：NVIDIA CUDA Programming Guide，Figure 11，Grid 中的 Thread Block。旧链接为 404；新图只说明包含关系，索引公式由正文解释，不冒充索引示意图。

撤下而未替换为另一张图片的 5 处：

13. 3.2-GQA-MQA-MLA / gnnclub-1311496010.cos.ap-beijing.myqcloud.com/.../20250213112205132-1024x459.png。
    原外链可访问，但图像内容是问答历史截断/遗忘，不是 KV Cache 的增量存储图。撤图，并修正“缓存满自动覆盖旧信息”的错误叙述。KV Cache 机制保留为正文与公式。
14. 4.5-lecture4-DeepSeek-MoE / Yuque 1758964344957-36883d4d-c179-4252-8b28-25cba1c832a4.png。
    旧图把 V3 写成 258 routed；DeepSeek-V3 原论文 PDF 第 22 页明确为 1 shared + 256 routed、Top-8。V3 路由骨架与上方 Figure 2 重复，撤图并修正正文数字。
15. 4.5-lecture4-DeepSeek-MoE / Yuque 1758964414027-d37f3c4c-a79c-4f8c-906e-3b4a5abbf5e1.png。
    MLA 已完整呈现在本地 DeepSeek-V2 Figure 2 下半部分，单独旧外链重复；撤图，正文指向图 2，并修正“V3 引入 MLA”的时间线。
16. 6.2-CPU-GPU-Asynchronicity / i.imgur.com/example-nsys-async.png。
17. 6.2-CPU-GPU-Asynchronicity / i.imgur.com/example-nsys-sync.png。
    两个 URL 都返回 HTML 而非图片，是没有原件的占位符；未找到对应同一实验的官方无同步/有同步配对图。撤图和无依据的具体时间轴结论，保留原理文字，并链接 Stanford CS336 官方交互式 Trace Viewer。

来源链接：
Lecture 3：https://stanford-cs336.github.io/spring2025-lectures/nonexecutable/2025%20Lecture%203%20-%20architecture.pdf
Lecture 5：https://stanford-cs336.github.io/spring2025-lectures/nonexecutable/2025%20Lecture%205%20-%20GPUs.pdf
DeepSeekMoE：https://aclanthology.org/2024.acl-long.70.pdf
DeepSeek-V2：https://arxiv.org/pdf/2405.04434
DeepSeek-V3：https://arxiv.org/pdf/2412.19437
NVIDIA CUDA Programming Guide：https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/writing-cuda-kernels.html
Stanford Trace Viewer：https://cs336.stanford.edu/spring2025-lectures/?trace=var/traces/lecture_06.json
