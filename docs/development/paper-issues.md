# 论文自身问题台账

这里收的是写 bi / analysis 时发现的**论文本身**的问题：前后矛盾, 数字算不上, 和代码或配置对不上, 引用错位. 译稿, 抓取或 OCR 造成的问题不收.

每条写清楚位置, 两边各怎么说, 我们怎么算出来的. 「求证结果」一栏留给人工核对, 填 `成立` / `不成立` / `部分成立` 加一句说明. 条目来源是写稿子代理的回报, 默认未经人工核对.

新条目按库, 按论文追加. 同一篇的条目编号连续, 格式为 `<slug>-<n>`.

---

## DeepSeek 库

### DeepSeekMoE (arXiv 2401.06066)

解析: `content/deepseek/01-模型技术报告/deepseek-moe/deepseek-moe-analysis.md` §5.2. 复算口径: 嵌入与输出头不共享, 词表 102400, 注意力每层 $4d^2$, SwiGLU 为 $3\,d\,d_{\mathrm{ff}}$, 首层稠密; FLOPs 取每 token 6 倍非嵌入激活参数加 $12\,n_{\mathrm{layer}}\,d\,l_{\mathrm{seq}}$, 再乘 4096.

- **moe-1** §7.2, Table 6: 142B 半激活档激活参数写 12.2B. 按配置复算为 13.61B, 同一行 FLOPs 374.6T 与 13.6B 自洽 (12.2B 对应约 340T). 求证结果:
- **moe-2** §5.1.2, Table 3: 16B 的每 4K token FLOPs 写 74.4T, 复算 75.9T, 高 2.0%. 总参数 16.38B 与论文 16.4B 吻合, 偏差只在 FLOPs. 同口径算 DeepSeek 7B 和 LLaMA2 7B 只差约 0.5%. 交接文档里「16B 参数量差约 2%」应改为「FLOPs 差约 2%」. 求证结果:
- **moe-3** §7.2: 「145B 比 GShard 137B 大 6%」全部归因于专家中间维度对齐. 拆开算约一半来自多出的共享专家 (约 1.031 倍), 一半来自对齐 1408 对 1368 (约 1.029 倍). 145B 的专家中间维度论文没给, 1408 是由 Table 6 总参数反推. 求证结果:
- **moe-4** §3.2 式 (9) 对 §5.1.2, §7.1: 式 (9) 写共享专家从 $mN$ 个名额里划出, 16B 和 145B 实际配置是加在路由专家之外. 求证结果:
- **moe-5** §5.1.1: 词表写 100K, `config.json` 为 102400. 求证结果:
- **moe-6** §4.4: 加共享专家那一步同时把路由从 top-2 改成 top-1, 两个变量混在一次对比里; 1:3 比例的依据是 Pile loss 差 0.005. 求证结果:
- **moe-7** §4.5: 屏蔽实验按比例屏蔽, 没按参数量对齐; 屏蔽 1/16 时两模型 loss 已超过 5. 关掉共享专家后 loss 2.414 里混有输出幅度突变 (路由门控和小于 1, 顶替的是权重为 1 的那一路). 求证结果:
- **moe-8** §4.3: 「Dense×16 是上限」只在 100B token 下验证. 求证结果:
- **moe-9** 附录 B, Table 10: 13B 档层数和隐藏维度未给出. 求证结果:
- **moe-10** §5.1.2: 首层用稠密层的理由 (首层均衡收敛慢) 没有数据. 开源代码专家级损失默认按序列统计 (`seq_aux=True`), 正文没提. 求证结果:

### DeepSeek-VL (arXiv 2403.05525)

解析: `content/deepseek/01-模型技术报告/deepseek-vl/deepseek-vl-analysis.md`.

- **vl-1** Figure 4 题注: 写 multimodal:language = 70%:30%. §3.2.2 写语言与多模态约 7:3, Table 1 纯文本 70.0%, §4.4 目标比例 0.7, 三处一致, 题注方向相反. 图中也没有 70:30 曲线, §4.4 消融用的是 60:40. 求证结果:
- **vl-2** §4.4 与 Figure 8/9: projector 扩数据的结果写「见 Figure 8」, 实为 Table 8. Figure 8 题注首句讲模态预热, 图里比的是模态分组. Figure 8 有分组曲线与 Figure 9 无预热曲线逐点相同. Figure 9 题注说预热「始终持平或更好」, 前 5000 步 MMBench 不支持. 求证结果:
- **vl-3** §4.2: Pile-test 每字节比特数写在 Table 7, Table 7 里没有 Pile. 求证结果:
- **vl-4** §4.3 与 Figure 7: 说对三个开源模型都在超过 60% 样本中胜出, 对 InternLM-XComposer2-VL 是 57/99; 评测集 100 题只用了 99 个. 求证结果:
- **vl-5** Table 10 / Table 8: 平均分把 OCRBench 除以 10 参与平均, 表注未写. Table 8 步数折算样本数超过阶段 1 数据量, 正式训练又用 15000 步, 未给理由. 求证结果:
- **vl-6** §3.1: 说拼接后每 token 2048 维, 同节 adaptor 段与代码都是先各自投影再拼接, 实际 4096 维. Figure 3 把阶段 3 整个混合编码器标为可训, 与「SAM-B 冻结」矛盾. 求证结果:
- **vl-7** §3.2.2: 以「编码器设计」举 1.3B 向 7B 迁移的例子, 但 1.3B 只用 SigLIP, 没有 SAM (见发布配置, Table 4/7 表头). 全文 1B, 1.3B, 6.7B, 7B 混用. 求证结果:
- **vl-8** 代码对论文: `sam.py` 第 161-196 行有一条跨层 $\alpha$ 支路 (取第 3 层输出, 走复制的 neck, 共用下采样卷积后乘 $\alpha$ 加回主路, $\alpha$ 初值 0), 论文未写. 求证结果:

### DeepSeek-GRM (arXiv 2504.02495)

解析: `content/deepseek/02-架构与算法/deepseek-grm/deepseek-grm-analysis.md`.

- **grm-1** Table 8: BTRM 与 PairRM 子集平均分别是 87.1 和 81.65, 表中总分写 81.7 和 87.1, 两行像互换. CLoud 贪心一行子集与 LLM-as-a-Judge 一行逐位相同, 平均 83.45, 却写 82.0. 求证结果:
- **grm-2** Figure 4(b) 对附录 C.1: 671B 画在 RL 曲线上, C.1 说大于 27B 的模型没做 RL, 只做 50K 条 RFT. 236B 在 Table 8 写成 230B. 求证结果:
- **grm-3** Table 3, Table 6: 括号增量相对 Voting@1 (temperature 0.5 单次采样), 它比贪心低 2.0, 正文未交代. 以贪心为基线, 纯投票 32 次只多 1.1. 求证结果:
- **grm-4** Table 10: LLM-as-a-Judge w/ TokenProb 的 Voting@8 与普通 Voting@8 逐位相同, Table 6 里两者 Overall 是 68.1 和 67.6. 求证结果:
- **grm-5** 附录 C.1 对模型卡: 16B 的 $\beta=0.002$ 不在报告的搜索网格里. 模型卡写 RFT 采样模型 V2.5-0906, 论文写 0905. 示例代码 temperature 1.0, 实验是 0.5. 求证结果:
- **grm-6** 式 (13), (14): 下标 $i$ 同时数原则 (或采样) 和数回答. 求证结果:
- **grm-7** Table 18: 被当作失败例, 但被标为更好的 Response 2 编造了「实时价格」, 模型选 Response 1 更合理, 更像 Figure 8 里「标注与真值矛盾」一类. 求证结果:

### Insights into DeepSeek-V3 (ISCA 2025, arXiv 2505.09343)

解析: `content/deepseek/03-基础设施/deepseek-v3-insights/deepseek-v3-insights-analysis.md` §3-§5.

- **v3i-1** §5.1.1: 说两层比三层胖树延迟低「实验已证明」. 2048 卡单平面 MRFT 也只要两层, Figure 5/6, Table 4 比的都是两种两层网络, 没有三层数据. 求证结果:
- **v3i-2** Table 3: 没给单价. 用 FT2, FT3 两列联立解得交换机约 8.3 万美元, 链路约 500 美元, 代回 SF 列吻合, DF 列偏 2%. MPFT 每端点成本与 FT2 相同 (8 张 FT2 并列); 比 Slim Fly 只便宜约 1%. V3 部署两千多卡按胖树公式只需 96 台交换机, 与单平面 FT2 相同, 成本优势要超过 2048 卡才出现. 求证结果:
- **v3i-3** Figure 7: 16/32/64 卡三点即 DeepEP README 的逻辑带宽, 本节点那份也算进 RDMA 字节, 32 卡 58 GB/s 超过线速. 只有 64 卡对应 V3 的 4 节点限制; 16 卡低于 32 卡没解释. 求证结果:
- **v3i-4** Figure 8: TP=2 时 190 GB/s 超过单块 400G 网卡, 测法与口径没交代. 求证结果:
- **v3i-5** LogFMT: 「50%-100% 开销」没说相对通信时间还是整层时间. 按 §2.3.2 设定, LogFMT-10 只省约 23% 字节, 编解码让通信慢 30% 以上就抵消. 「最终没有采用」只对成稿时成立, 三个月后 DeepEP 把它作为可选开关放进 low-latency combine (提交 c5facf5), V2 重构时又删掉. 求证结果:
- **v3i-6** §2.4: 写 relative accuracy loss, V3 技术报告对同一组实验写的是相对 loss 误差. 求证结果:
- **v3i-7** Table 5: NVLink 3.33 μs 比同一 leaf 下 IB 还慢, 没给测法. 求证结果:
- **v3i-8** Table 4: 时间分解各项相加 19.90 s, 与每步 19.926 s 差 0.03 s, 未说明. §6.2 从 640 GB/s 到 1 TB/s 的系数无推导. 节点限制路由对模型质量的影响, 本文与 V3 技术报告都没有消融. 求证结果:

### Fire-Flyer AI-HPC (SC24, arXiv 2408.14158)

解析: `content/deepseek/03-基础设施/fire-flyer/fire-flyer-analysis.md` §6.2.

- **ff-1** §V-B2, Figure 9a: LLaMA-13B 从 64 卡到 512 卡写 91%, 按图中耗时算是 82.5%; 91% 只对得上 256 卡的 91.9%. 同段 DeepSeekMoE 的 92.92% 和 76.14% 能按同式复现. 求证结果:
- **ff-2** §IV-C: HFReduce with NVLink「超过 10 GB/s」只在 128 卡及以下成立, 256/512/1024 卡为 9.66, 8.56, 7.99 GB/s. 求证结果:
- **ff-3** §V-A, §V-B3: HaiScale FSDP「训练时间减少近一半」, 逐点算只降 32%-41%. VGG16「近 88%」按图是 86.7%, 对照的 NCCL 后端自己弱扩展效率 93.8%. 求证结果:
- **ff-4** §III-C, §V-C, 摘要: 「60% 成本」与「一半成本」交替出现; 前者是 Table II 单节点价格, 后者是 Table III 整集群价格. 求证结果:
- **ff-5** Table VII 对 Table VIII: 2023 年 10 月网络闪断 Table VII 为 29, Table VIII 逐日相加为 13; 按后者正文 30% 应为 26.4%. 求证结果:
- **ff-6** Table V, VI 与 Figure 10: Table V 说 Xid74 比其他硬件故障高「几个数量级」, Table VI 显示只高 20-97 倍. Figure 10 图注把 Xid79 算作显存 ECC, Table V 归在不可纠正故障. 求证结果:
- **ff-7** §VIII-D: 引用的 52.42% 应为 52.43%, 且拿故障次数占比比 Xid 消息条数占比, 分母不同. 论文把 Xid43 称非法内存访问, NVIDIA Xid 文档里非法地址访问是 Xid31. 求证结果:
- **ff-8** §VI-B2, §III-B: 「20 PiB 以上」按 2880 块 15.36TB 两副本算是 19.6 PiB. 存储节点 §III-B 写近 200 台, Table IV 是 180 台. 求证结果:
- **ff-9** §IV-B: ring 流量式写 $\frac{2n-1}{n}$, 标准 ring allreduce 为 $\frac{2(n-1)}{n}$. 求证结果:
- **ff-10** §IV-A 对 §IV-D1: GDRCopy 一处说用于 H2D, 一处说 D2H; 两处都说「读主机内存减少三倍」, 实际是 8 次降到 2 次 (四倍). 求证结果:
- **ff-11** 缺数据: 没有和 DGX 集群的端到端吞吐或 MFU 对比. 99% 利用率无口径定义 (HAI Platform 文档给节点占用率 95%, GPU 利用率 75%). 单节点 checkpoint 写 10 GiB/s, 全集群同时写会超过存储侧 9 TB/s. 求证结果:

### DSec (DeepSeek Elastic Compute)

解析: `content/deepseek/03-基础设施/dsec/dsec-analysis.md` §6.

- **dsec-1** §1 对 §4.3: 单节点 800 microVM / 3,200 容器, §1 说「最多」, §4.3 说「至少」稳定运行过. 求证结果:
- **dsec-2** §2.2 对 §3.3: 前者说容器共享宿主机内核, 后者说容器跑在 QEMU/libvirt 虚拟机里. 求证结果:
- **dsec-3** §2.4 对 Fig. 7/8: 每天约 300 万沙箱, Fig. 8 只统计 150 多万容器和 39 万 microVM, Fig. 7 只抽 3 万容器和 1 万 microVM, 抽样方法未写. 求证结果:
- **dsec-4** 摘要对 §2.4, §5.2 对 §8.4: 「超过 38 万并发」摘要读作容量, 正文是观测峰值. 「内存降 21.2%」未说明是时间积分, 到 §8.4 才写明峰值基本不变. 求证结果:
- **dsec-5** 测试集群: 10 个节点里 microVM 与容器节点各几台未写, 由图 12 内存峰值约 4 TB 推 microVM 实验至少用了三台. 求证结果:
- **dsec-6** 对 V4 报告: V4 把轨迹日志当现行设计并列了溯源与确定性回放等三个用途, 本文降为「早期版本」, 后两用途不再出现. V4 里缓解自旋锁争用的做法本文没写. 求证结果:
- **dsec-7** 对 V4.1-Flash 报告: 后者说 core scheduling「消除干扰」, 本文实测 50% 负载仍膨胀 17.3%. 后者的 2,500 是出现可测退化前的容器数, 本文 3,200 是稳定运行点. 后者的崩溃「repercussion」信号本文没写. 求证结果:
- **dsec-8** 对 V3.2 报告: V3.2 报告没提过 DSec, 本文说 V3.2 起全部沙箱负载跑在 DSec 上. 求证结果:
- **dsec-9** 无数据支撑: 每秒 5,000 次创建速率, 云端扩容「30% 溢出」, §6 的暂停恢复, worker 容器方案, 访问控制, 都没有实验. 3 GB 层合并是否跨基础镜像/工作区/工具包未说, 若跨则工具包升级的 $O(k)$ 代价不成立. 开源 AgentENV 有按页序列预取的快照恢复, 本文未提. 求证结果:

### 交接文档里已知的条目

- **nsa-1** NSA (arXiv 2502.11089) 式 (9): 下标有误. 详见 `content/deepseek/02-架构与算法/nsa/nsa-analysis.md`. 求证结果:
- **engram-1** Engram: 摘要写 MMLU +3.4, 表中为 +3.0. 详见 `content/deepseek/02-架构与算法/engram/engram-analysis.md`. 求证结果:
- **janusflow-1** JanusFlow (arXiv 2411.07975): Table 6 FID 用 MJHQ-10k, CFG 7.5; 附录 Figure 2 纵轴标 FID-30k. 求证结果:
- **vl2-1** DeepSeek-VL2 (arXiv 2412.10302): 代码选分辨率是最大化有效像素, 论文写最小化填充. 求证结果:

## rsi 库

### PEAR (arXiv 2609.35031)

解析: `content/rsi/6-自动研究与实验室/6.4-PEAR工业搜索自动研究/6.4-PEAR工业搜索自动研究.md` §3, §4, §5.3.

- **pear-1** 式 (10) 上标: $[j]$ 表示启用序列里的位置, §5.2.3 到 5.2.5 里 $(2),(3),(4)$ 是级别编号. 实验从 L2 开始, L2 推广出的集合按式 (10) 是 $\mathcal{A}^{[2]}$, 按 §5.2.4 是 $\mathcal{A}^{(3)}$. 求证结果:
- **pear-2** 图 2 标注: 写七天的 L4 反馈「重新校准 L2 代理」. §6.2 只说 L4 结果用于重新评估假设, §5.2.2 的 $R_\psi$ 是 L1, L2 共用的固定模型, 全文没有校准步骤. 全文搜 recalibrat, 只出现在图里. 求证结果:
- **pear-3** 图 2 规模: 横轴 34 次评估, L2 推广节点 4 个, 最终验证前只有 1 次 L4 反馈. 表 3 是 35 轮, 245 组, 82 个配置, 推广 8 个, 阶段 I 和 II 各有一次 L4 结果. 把表 3 三行相加, 再对比图中节点数. 求证结果:
- **pear-4** 表 5 和表 6 行名: 表 5 的 A, B 是任务 A 的两个候选, 表 6 的 A, B 是两个任务. 表 5 候选 A 的 +2.73% 等于表 6 任务 A 的 +2.7336%. 求证结果:
- **pear-5** 摘要分母: 摘要说「在两次 A/B 实验中显著提升」. 表 3 和表 5 显示至少 5 次 L4 实验, 其中至少 3 次不显著, 任务 C 的 3 个推广候选没有线上结果. 任务 A 两次, 任务 B 阶段 I, II, III 各至少一次; 5 次全是零效应时至少一次显著的概率是 $1-0.975^5\approx11.9\%$. 求证结果:
- **pear-6** 表 2 的 $G=(2,2)$ 和 $G=(3,3)$: 被当成「只改容量」和「耦合改动」两种假设比较. §6.1 定义 $q$ 是窗口内最大容量, $q=w$ 等于取消全局约束, 按字面定义两者功能等价, 第 2 到 4 轮的差异是同一配置的波动. 除非 $w$, $q$ 另有计数方式, 论文没有写明. 求证结果:
- **pear-7** 四级同一目标: §5.2 说四级对齐同一个优化目标, 表 5 三级用了三种信号: 订单代理, 观测订单, Main Order/DAU. 对照表 5 的列标题. 求证结果:
- **pear-8** 表 1 推广率口径: 题注写推广率 = L2 推广数 / 实验组数, 附录 B.3 要求每轮保留一个基线组, 题注没说分母含不含基线. A 是 133/19=7 组每轮; 2/133=1.50%, 去掉基线是 2/114=1.75%; 合并 13/454=2.86%, 去掉基线是 13/384=3.39%, 都接近零效应下的 2.5%. 求证结果:
- **pear-9** 表 6 GMV 和订单: 两个任务的主订单都显著增长, GMV/DAU 都不显著, 算出来单均 GMV 下降. A: 1.022136/1.027336−1≈−0.51%; B: 1.016633/1.032957−1≈−1.58%. 求证结果:

## OLMo 库

### OLMo 1 (arXiv 2402.00838)

解析: `content/olmo/01-模型技术报告/olmo-1/olmo-1-bi.md`.

- **olmo-1-1** Table 1 把 7B 隐藏维度 D 写成 4086, 附录 Table 5 的 Dimension 为 4096. 两张表数字不一致. 求证结果:
- **olmo-1-2** Table 6 按 LUMI 官方可再生能源口径把 MI250X 排放记为 0, A100-40GB 行约为 70 tCO₂eq; Appendix B 报告总预训练排放约 69.78 tCO₂eq, 并给出采用水电强度 0.024 时 LUMI 一侧约 3.54 tCO₂eq. 引用排放数字时必须同时注明电力强度假设. 求证结果:

### OLMoE (arXiv 2409.02060)

解析: `content/olmo/01-模型技术报告/olmoe/olmoe-bi.md`.

- **olmoe-1** Figure 6 正文称比较 「single shared and single routed」 与两个路由专家, 但题注, 组合数 $\binom{32}{4}$ 对 $\binom{31}{3}$, 以及官方配置都对应 31 个路由专家中激活 3 个再加 1 个共享专家. 正文的专家数量描述与实验设定不一致. 求证结果:
- **olmoe-2** Figure 21 题注称展示共激活最高的 32 个专家, 每张热力图坐标轴实际只列出 16 个专家 ID. 式 (6) 以 $N_{E_i}$ 为分母, 共激活矩阵也并不对称. 求证结果:

### Molmo2 (arXiv 2601.10611)

解析: `content/olmo/02-多模态与OCR/molmo2/molmo2-bi.md`.

- **molmo2-1** 摘要称发布 7 个视频数据集和 2 个多图数据集, §1 与 §2 的具体清单却是 6 个视频数据集和 3 个多图数据集, 总数均为 9. 求证结果:
- **molmo2-2** 摘要把 Gemini 3 Pro 的视频跟踪结果写成 41.1 J&F, Table 4 与 Table 5 的 Gemini 3 Pro 行均无此数字; Table 5 的 Overall 为 44.6, 41.1 出现在 SAM 3 的 Animals 分项. 求证结果:
- **molmo2-3** Token 加权正文写 $4/\sqrt{n}$, 官方代码实现为 $2/\sqrt{n}$, 并在 `root_subsegments` 下额外除以 $\sqrt{\text{标注数}}$. 常数因子和第二层归一化均未在正文说明. 求证结果:
- **molmo2-4** Table 7 中 Qwen2.5-VL-32B-Instruct 与 72B-Instruct 的五个子项及平均分逐项完全相同, 表注只称数字来自 Point-Bench 排行榜, 没有解释重复原因. 求证结果:
- **molmo2-5** Table 12 把 Molmo2-O-7B 的连接器 MLP Dim 写成 100352, 附录 A, 同表 LLM MLP Dim 与 HF adapter 配置均指向 11008; 100352 实为词表大小. 同表另把 7B/8B 参数量写成 7.3m/8.2m, 并把图像尺寸写成 384x384, 与附录 A 和 HF 配置的 378x378 不一致. 求证结果:
- **molmo2-6** Figure 36 第二个失败样例询问 waterfalls, 回答却与 Figure 34 的 national flags 计数样例逐字相同, 包括时间戳, 坐标和最终计数 10. 图注称该例为 false positive, 当前输出文本无法支持这一分析, 疑似排版复制错误. 求证结果:

### FlexOlmo (arXiv 2507.07024)

解析: `content/olmo/01-模型技术报告/flexolmo/flexolmo-analysis.md`.

- **flexolmo-1** 摘要/§1/§5.1: 比公共模型平均相对提升 41%. 表 1 Avg 47.8 vs 36.9, 表 2 52.4 vs 42.4. 47.8/36.9-1=29.5%, 52.4/42.4-1=23.6%; 逐类均值 279%/189%, 几何均值 95%/67%, 都不是 41%. 求证结果:
- **flexolmo-2** §5.3 脚注 4: 数学是最小的封闭集, 训了 3 epoch. 图 5 里 Reddit 9.9B < Math 20.3B, 50/20.3≈2.46 epoch. 求证结果:
- **flexolmo-3** §4.4: 每个拥有者 50B, 合计 400B. 封闭集只有 7 个, 代码另对公共模型退火 50B (step 11921). 7×50=350B, 400B 要算上未交代的公共退火. 求证结果:
- **flexolmo-4** §5.1 完整设定: 在 Math2/PoemG/Code4 上追平或超过专家. 表 2: 48.5<53.1, 62.2<67.5, 17.2<21.0. 求证结果:
- **flexolmo-5** §4.2 / 表 2: 31 个任务, 10 个类别. 编号 (6) 重复用于 BBH 和 Math2, 表 2 有 11 列类别. 求证结果:
- **flexolmo-6** §4.1 / 附录 B: 统计见 "Figure 5" / "Table 5 presents the statistics". 表 5 是评测基准表, 统计在图 5. 求证结果:
- **flexolmo-7** §3.3.3: 在公开数据集 $M_\text{pub}$ 中挑代理样本, 同节其余处和 A.2 用 $D_\text{pub}$. 求证结果:
- **flexolmo-8** §3.1 要求 (2): 移除 $M_i$ 即完全移除 $D_i$. §3.3.3 RT 微调 r_pub 和所有 r_j, 代理集由在 $D_i$ 上训练的分类器挑选; OLMoE-4x7B.py 只冻结专家. 只有 no RT 行满足要求 (2). 求证结果:
- **flexolmo-9** §3.3.2: 负偏置, 满足条件选 $M_i$, 否则默认 $M_\text{pub}$. train_expert_model.sh 设 top_k=2, 两个专家全激活; b_i 可学习且被截断到 ≤0. 读 router.py 的 torch.minimum(b,0) 和脚本参数. 求证结果:
- **flexolmo-10** §3.3.2 / 代码: 用了偏置 (运行名 top2_grit_learnbias). 脚本构建的是 olmoe_nx7b, with_expert_bias 那行被注释掉; HF 路由器没有偏置字段. 求证结果:
- **flexolmo-11** §3.3.2: 加负偏置 b_i, 没给可学习性, 初值和最终数值; 代码里用 torch.empty 创建. 求证结果:
- **flexolmo-12** §4.4: 最终 8 个专家, 激活 4 个, 37B/20B. HF FlexOlmo-7x7B-1T: num_experts=7, num_experts_per_tok=7, 没有 Educational, 33B. 2.97+7×4.33≈33.3B. 求证结果:
- **flexolmo-13** 表 4 注释: 3 个激活专家的推理 FLOPs 是 dense 的 2.5×, 按参数复算约 2.26×: (2.15+3×4.33+0.41)/(2.15+4.33+0.41)≈2.26. 求证结果:
- **flexolmo-14** 表 4 注释: 训练 FLOPs 相同. 专家阶段是两专家全激活的 MoE, 按 6N 近似 (41.3+2×53.5)/(3×41.3)≈1.2×, 只是 token 数相同. 求证结果:
- **flexolmo-15** 表 1 / 表 4: no-RT Avg 46.7, Pre-anneal Avg 43.1; 八项均值 46.76 / 42.99. 求证结果:
- **flexolmo-16** 图 2: 8 选 4, 均匀线在 50%, Layer 1 数学输入的 math 柱约 170%, 单个专家的选中率上限是 100%. 求证结果:
- **flexolmo-17** §5.3: 32 token 前缀, 生成 256 token, 1 万篇文档. extraction_analysis.py 前缀从随机位置截取, 比对窗口含前缀, max_length=256 实际只新生成 224 token; 脚本默认 NUM_PREFIXES=100. 求证结果:
- **flexolmo-18** §5.1 消融: 称每个组件都单独去掉过, 表 1 只有 "no init, no bias" 合并的一行, 路由初始化的效果没有被单独隔离. 求证结果:
- **flexolmo-19** §4.3: Unrestricted MoE 的 FLOPs 约为 FlexOlmo 的 2×, 没给专家数, top-k 和负载均衡设置, 无法复算. 求证结果:
- **flexolmo-20** 附录 C / 表 5: SciRIFF 报五个子任务的平均, 指标一栏是 "—"; LaTeX 里留有待补注释. 求证结果:

### Bolmo (arXiv 2512.15586)

解析: `content/olmo/01-模型技术报告/bolmo/bolmo-analysis.md`.

- **bolmo-1** §5 Bolmo 1B 段: 写「+3.3% on CoQA」. 表 2 中 Bolmo 1B 是 81.7, OLMo 2 1B 是 77.4, 81.7−77.4=4.3, v1 和 v2 都写成 3.3. 求证结果:
- **bolmo-2** 附录 A: 「fused non-causal boundary prediction of the patch end is best」. 表 3 的 Avg: NC(S) 在 oracle 下 58.2, 学到边界下 55.7 (加粗), NC(F) 分别是 57.9 和 55.6. NC(F) 只在成本上占优: L/G 为 8.8 对 9.8. 求证结果:
- **bolmo-3** §4 Evaluation: 写 7B 套件跳过了 BigCodeBench, 表 5 列出了 BigCodeBench (pass@1 (5), max toks 1280), 表 1 里却没有它. 求证结果:
- **bolmo-4** §6.3: 解码速度「∼125 bytes/s vs ∼150」. Figure 7 左图 Bolmo (c=4.4) 约 113-117, 右图选中点约 115, 约为子词模型的 77%. 求证结果:
- **bolmo-5** 表 8: 吞吐一律是 BPS = 6×TPS (59.4/9.9, 37.8/6.3, 207/34.5, 166.2/27.7), 同表 Total Bytes 按每 token 4.4 字节算 (43.1/9.8, 172.9/39.3). 6 = 24576/4096, BPS 计入了填充槽位, 有效字节吞吐约为表中数字的 4.4/6≈73%. 求证结果:
- **bolmo-6** §3.2.1 $\lambda_\mathcal{E}=1$: 脚本里 `encoder_loss_lookahead_weights=[0,0,0,4.0]`, `no_lookahead_weight=0`, 第 4 层表示损失的有效权重是 4, $n=0$ 那项不参与. 求证结果:
- **bolmo-7** §3.2.1 把 $\mathcal{L}_{\mathcal{D},\text{Distill}}$ 称为精确目标: 阶段 1 脚本开了 `do_alm_debiasing=true`, 给两侧 patch 对数概率各加一项空格类符号的 logsumexp, 公式里没有这一项. 求证结果:
- **bolmo-8** 表 1 / §5: 代码「pass@1 总体略低」, 类目均值 40.7 对 39.5. 这个均值把 pass@1 和 pass@16 共 11 个数混在一起平均 (447.4/11, 434.8/11); 只算 pass@1 时是 27.6 对 31.1, 其中 HumanEval 低 8.4. 求证结果:
- **bolmo-9** README 与论文: bolmo-core README 的 Code 是 41.0 / 40.1, 论文表 1 是 40.7 / 39.5. 求证结果:
- **bolmo-10** §6.2: 阶段 1 的成本约为 $2\times\text{FLOPs}_\mathcal{M}$. 按论文自己描述的计算路径是 $1+3n/L$, 7B 为 1.375, 1B 为 1.75; 按 2/3 补 token 后, 只做阶段 2 的一组在 7B 上多拿约 45% 算力, 结论方向不变. 求证结果:
- **bolmo-11** 脚注 2: 把多语言低效记作「problem (ii)」, 正文 (ii) 是分词偏差, 多语言效率在 (iii). 求证结果:
- **bolmo-12** §3.2.1 $\mathcal{L}_E$ 的记号: 写作 $\mathrm{Pool}(\mathcal{E}(\hat e,\mathcal{B}_\text{subword}(x)))$, 别处是 $\hat e=\mathcal{E}(e)$, $h=\mathrm{Pool}(\hat e,p)$, 括号和参数错位. 求证结果:
- **bolmo-13** Figure 5 题注: 「either ... and」应为「either ... or」, 中间面板纵轴实际是百分数. 求证结果:

### OLMoTrace (arXiv 2504.07096)

解析: `content/olmo/04-数据与评测/olmotrace/olmotrace-analysis.md`.

- **olmotrace-1** 相关性评测口径: 人工评分 1.90/1.43 来自较早超参数，最终系统的 1.82/1.50 来自 GPT-4o 裁判；两组并非同一设置和同一评审者，不能直接横向比较，也不能用最终自动裁判分数证明人类相关性感受改善. 求证结果:
- **olmotrace-2** 延迟口径: 4.46 秒是特定 64 vCPU/40 TB SSD 环境下，98 段平均 458 token 会话中步骤 1–3 的平均值；论文未报告 P95、并发压力或长尾，因此不能外推为完整线上请求的稳定延迟. 求证结果:

### OLMo-core 仓库

解析: `content/olmo/05-开源仓库/olmo-core/olmo-core-analysis.md`.

- **olmo-core-repo-1** README 的论文徽章链接与显示文字冲突: `href` 指向 arXiv `2501.00656`，徽章文字却显示 `arxiv-2402.00838`；在上游修正或说明前，不能仅凭该徽章确定它意图引用的论文版本. 求证结果:

### DataDecide (arXiv 2504.11393)

解析: `content/olmo/04-数据与评测/datadecide/datadecide-analysis.md`.

- **datadecide-1** 缩放律符号冲突: 主文 §2.3 在 FLOPs = 6ND 中定义 N 为参数量、D 为 token 数；附录 C 的五参数 (N,D) 拟合却反过来写 N 为 token 数、D 为参数量，导致同文符号含义前后不一致. 求证结果:
- **datadecide-2** 附录表 2 题注写所有模型的 sequence length 均为 2024；该数值非常规且论文未解释，需要对照发布配置确认是作者有意设置还是排版笔误. 求证结果:
- **datadecide-3** 名义 750M 配置与实际参数量口径不同: 配置标签为 750M，而表中非 embedding 参数量为 681.3M；缩放律复算应明确使用实际参数量，不能直接使用模型标签. 求证结果:

### Fluid Benchmarking (arXiv 2509.11106)

解析: `content/olmo/04-数据与评测/fluid-benchmarking/fluid-benchmarking-analysis.md`.

- **fluid-benchmarking-1** 饱和指标使用检查点序列与表现之间 Spearman 相关系数的绝对值；按该定义，表现持续下降也会获得较高“单调性”，指标没有表达期望的改进方向. 求证结果:
- **fluid-benchmarking-2** 有效性把两个被认为测量相同能力的基准之间的模型排名距离当作代理真值；如果两套基准共享偏差，高一致性并不等于对真实能力的高有效性. 求证结果:
- **fluid-benchmarking-3** IRT 参数由 102 个既有开放模型拟合；超过训练模型能力上限时，多数训练模型全错的题会被压到近似最大难度，区分力受限，论文也承认需要持续更新 IRT. 求证结果:
- **fluid-benchmarking-4** 在线评测节省了题数，但效率比较没有把构建完整响应矩阵及 MCMC 拟合的离线成本纳入统一口径，不能直接解读为端到端总成本下降. 求证结果:

### open-instruct 仓库

解析: `content/olmo/05-开源仓库/open-instruct/open-instruct-analysis.md`.

- **open-instruct-repo-1** `docs/olmo3.md` 明确记录 OLMo 3 7B Think 阶段交接时存在轻微 chat template 不一致；复现实验需要固定模板文件和 tokenizer revision，不能只记录模型名. 求证结果:
- **open-instruct-repo-2** 文档记录过 `<think>` 首 token 被错误当作 prompt 掩蔽的问题，旧 tokenizer revision 会回退到 prefix labeling；旧实验与现版本的损失掩码可能不等价. 求证结果:
- **open-instruct-repo-3** README 明确说明内置评测已不维护并推荐改用 OLMES；继续用仓库内旧评测脚本不能视为当前官方评测协议. 求证结果:
- **open-instruct-repo-4** 仓库定位为研究代码且不保证向后兼容；主分支命令、配置字段和默认值不可直接外推到历史论文实验. 求证结果:
- **open-instruct-repo-5** `chat_template.jinja` 与 `tokenizer_config.json` 可同时存在，而 Transformers 优先使用前者；两份模板不同步时，相同 tokenizer 名称可能生成不同训练序列. 求证结果:

### Infini-gram (arXiv 2401.17377)

解析: `content/olmo/04-数据与评测/infini-gram/infini-gram-analysis.md`.

- **infini-gram-1** 摘要的 47% next-token accuracy 高度依赖测试文本与 5T token 索引的重叠、tokenizer 和去污染设置，不能外推为任意新领域的普遍准确率. 求证结果:
- **infini-gram-2** `<20 ms`、`40 ms`、`200 ms` 是 RedPajama 与特定优化环境下的平均延迟；论文没有证明 5T 组合索引、P95 或高并发条件下仍保持同一延迟. 求证结果:
- **infini-gram-3** 机器文本与 infini-gram 的一致率随 suffix length 呈不规则变化，被解释为神经预训练或位置编码缺陷；但 suffix length 同时关联文本类型、重复度和成员关系，现有证据只能说明相关性，不能完成因果定位. 求证结果:
- **infini-gram-4** 插值困惑度收益在索引包含神经模型训练语料时可能体现非参数记忆增强；若参考集与索引仍有残留重叠，也会高估泛化收益，需结合严格去污染结果解释. 求证结果:
- **infini-gram-5** 论文把真实 token 的统计概率大于 0.5 定义为 agreement；这能保证真实 token 是唯一 argmax，却只是普通 top-1 命中率的下界，不能把摘要中的 47% 直接称作完整 top-1 accuracy. 求证结果:
- **infini-gram-6** 多个索引的计数可以逐项相加，但公开语料之间可能包含同一网页或近重复文档；若没有跨语料去重，合并计数表示采集多重集，不能解释为独立来源数量. 求证结果:

### Dolma 仓库

解析: `content/olmo/05-开源仓库/dolma/dolma-analysis.md`.

- **dolma-repo-1** `docs/data-format.md` 的文档格式示例在 `created` 字段后缺少逗号，按 JSON 语法该示例无效. 求证结果:
- **dolma-repo-2** `docs/data-format.md` 结尾残留编辑草稿文字 `how does your signals data look?` 及孤立的 `}`，不能作为稳定格式规范解读. 求证结果:
- **dolma-repo-3** `docs/mixer.md` 参数说明写成 `if you do not with to use jq selector pattern`，疑为 `wish` 的文字笔误. 求证结果:
- **dolma-repo-4** 去重文档明确 Bloom filter 会产生 false positive，因此最终重复标记不是精确真值，阈值及容量配置会改变误删率. 求证结果:
- **dolma-repo-5** attributes 流依赖与文档流的行数、顺序完全对齐而非按 ID join；坏行或漏行会把后续属性错配给错误文档，流水线必须额外校验对齐. 求证结果:

### OLMES 仓库

解析: `content/olmo/05-开源仓库/olmes/olmes-analysis.md`.

- **olmes-repo-1** README 的 OLMo 3 结果条目仍保留 `TBD Title ([TBD Citation](...))` 占位文本，不能据此恢复正式论文题名或引用. 求证结果:
- **olmes-repo-2** safety 命令使用 `OPEN_API_KEY`，而前文 instruct 评测使用 `OPENAI_API_KEY`；环境变量名称不一致，疑为文档笔误或未说明的不同接口. 求证结果:
- **olmes-repo-3** per-task JSON 示例把 `hellaswag` 拼成 `hellasag`，照抄示例可能导致任务查找失败. 求证结果:
- **olmes-repo-4** ARC 的 OLMES 默认同时运行 multiple-choice 与 cloze 协议并报告较高者，包含协议选择效应；跨模型比较必须固定相同协议，不能与单协议结果直接并列. 求证结果:
- **olmes-repo-5** 外部 judge/API 版本和 Hugging Face 默认 revision 没有被仓库提交号一并冻结；只固定 OLMES 代码提交仍不足以完全复现实验. 求证结果:

### Signal and Noise (arXiv 2507.13659)

解析: `content/olmo/04-数据与评测/signal-and-noise/signal-and-noise-analysis.md`.

- **signal-and-noise-1** signal 用全体模型最大值与最小值的极差定义；单个离群或失败模型会显著抬高 SNR，即使大多数候选仍近乎并列. 求证结果:
- **signal-and-noise-2** noise 的相对标准差以均值作分母，均值接近零时不稳定；末期窗口内尚存的真实趋势也会被计入噪声. 求证结果:
- **signal-and-noise-3** SNR 与 decision accuracy 的相关性约为 R=0.653、R²=0.426，只是中等相关，不能单独作为一次昂贵训练决策的充分证据. 求证结果:
- **signal-and-noise-4** 过滤低 SNR 子任务会提高预测稳定性，但同时改变能力和领域覆盖；稳定性提升不等于 construct validity 提升. 求证结果:
- **signal-and-noise-5** Decision Accuracy 对所有方案对等权；第一、第二名互换和选到最差方案在指标中的权重相同，但实际决策代价通常不同. 求证结果:

### olmOCR 仓库

解析: `content/olmo/05-开源仓库/olmocr/olmocr-analysis.md`.

- **olmocr-repo-1** README 的 demo 地址前文为 `olmocr.allenai.org`，Usage 段却写成 `olmocr.allen.ai`，域名不一致，疑为文档笔误. 求证结果:
- **olmocr-repo-2** license badge 链接指向 `allenai/OLMo` 仓库的 LICENSE，而不是 olmOCR 本仓库的 LICENSE，需要确认是有意共用还是链接错误. 求证结果:
- **olmocr-repo-3** benchmark 表中 Infinity-Parser 的总体误差写成 `±?`，不确定性数值不完整. 求证结果:
- **olmocr-repo-4** README 声称每百万页成本低于 200 美元，但相邻正文没有固定硬件、价格、页面分布及重试假设，不能解释为稳定成本保证. 求证结果:
- **olmocr-repo-5** 第三方 benchmark 表混合版本化软件和 API 服务结果；服务模型、限流与运行条件会漂移，只固定 olmOCR 仓库提交不足以复现整张表. 求证结果:

### Paloma (arXiv 2312.10523)

解析: `content/olmo/04-数据与评测/paloma/paloma-analysis.md`.

- **paloma-1** 代码来源数据明确未做去污染，因此相关结果不能直接解释为严格未见样本上的泛化能力. 求证结果:
- **paloma-2** 精确段落匹配会漏掉改写、格式差异和短段落；整篇删除又可能让不同训练语料被不均匀移除，去污染前后比较包含数据分布变化. 求证结果:
- **paloma-3** per-token 困惑度受到 tokenizer 粒度影响，BPB 只能部分缓解，跨 tokenizer 的细粒度差异仍需谨慎解释. 求证结果:
- **paloma-4** 来源等权宏平均是一种人为聚合选择，不代表任何给定的真实部署流量分布. 求证结果:
- **paloma-5** arXiv 子集上的极端差异可能主要来自 LaTeX、公式和清洗格式等预处理差异，而非模型领域知识本身. 求证结果:

### DR Tulu

解析: `content/olmo/03-后训练与奖励模型/dr-tulu/dr-tulu-analysis.md`.

- **dr-tulu-1** 训练奖励最高不必然对应最佳下游表现；论文把差异归因于任务、细则和评审设置错位，因此训练奖励不能直接作为部署质量代理. 求证结果:
- **dr-tulu-2** 演化细则只能发现当前 rollout 之间暴露的差异；所有回答共同遗漏的知识可能无法由对比生成捕捉. 求证结果:
- **dr-tulu-3** 搜索结果如果偏颇、过时或低质，会把检索误差固化进奖励；外部检索证据不等于真值. 求证结果:
- **dr-tulu-4** 开放 judge 消融与 GPT 配置的上下文不同，Qwen 因上下文限制只看最终答案而非完整轨迹，并非严格单变量对照. 求证结果:
- **dr-tulu-5** 细则分项仍由 LM judge 判定；相关或冲突细则以及权重归一化都会改变总奖励. 求证结果:
- **dr-tulu-6** 搜索次数、格式等辅助奖励可以被机械优化；无效搜索和格式正确并不等于研究质量更高. 求证结果:
- **dr-tulu-7** 约 1000 倍成本差异依赖计价时点、托管方式、搜索 API 和成本口径，不是同硬件下的严格效率实验. 求证结果:
- **dr-tulu-8** GeneticDiseasesQA 的临床结论不能替代专家审核，真实临床代表性与安全性仍有限. 求证结果:
- **dr-tulu-9** 实时搜索后端会随时间变化；若不保存检索响应快照，实验难以严格复现. 求证结果:
- **dr-tulu-10** 最终推理成本较低不表示 RLER 训练便宜，细则生成、搜索和逐项 judge 引入了额外验证成本. 求证结果:

### Dolma (arXiv 2402.00159)

解析: `content/olmo/04-数据与评测/dolma/dolma-analysis.md`.

- **dolma-1** 表 1 把 Reddit 记为 89B Llama tokens，而第 7 节标题和正文写 80B tokens；版本或取整口径未明确统一. 求证结果:
- **dolma-2** 论文主体对应 Dolma v1.6，却同时介绍后续 v1.7 的改进；v1.7 结论不能倒灌为 v1.6 的组成和处理统计. 求证结果:
- **dolma-3** 附录文本有多处明显文字错误，包括 `upsamole`、`higer`、`might be be`、`from from` 与 `not a representative sample of none of its sources`; 中文稿按语义翻译但英文原样保留. 求证结果:
- **dolma-4** 约 70% 段落被移除的描述针对 CCNet 的局部重复段落步骤，容易被误读为全量 Dolma 数据删除比例. 求证结果:
- **dolma-5** Dolma v1.6 明确没有对训练语料做完整下游基准去污染，相关评测不能视为严格未见数据上的结果. 求证结果:
- **dolma-6** PII 处理阈值口径不一致: 图例写 `PII Remove (>=5) + Mask (<5)`，正文则说含 6 个或更多 PII 才整页删除，分别对应 `>=5` 与 `>=6`. 求证结果:
- **dolma-7** 伦理说明一处要求限制数据访问者，另一处又说明通过 Hugging Face 免费公开分发；需要澄清“限制”指许可条件还是技术访问控制. 求证结果:
- **dolma-8** 图 13 题注以孤立的 `(Val)` 结束，疑似题注排版或抽取残缺. 求证结果:
- **dolma-9** 论坛格式消融的五种方案同时改变线程组织、去重、PII 和毒性过滤，多因素捆绑使曲线差异无法单独归因于“格式”. 求证结果:
- **dolma-10** 毒性过滤消融只有“不筛选 / PII+NSFW+仇恨 / NSFW+仇恨”三组，可以隔离附加 PII 的影响，却不能分别识别 NSFW 与仇恨过滤贡献. 求证结果:
- **dolma-11** 图 67–92 只展示单条训练曲线，没有误差带或随机种子方差；细小差异不宜过度解释. 求证结果:
- **dolma-12** 附录模型以 1B 参数训练至 3T token，是显著高 token/参数比设定，其趋势不能直接外推到常规算力最优训练. 求证结果:
- **dolma-13** 附录 C 对 PaLM 2、GPT-4、Llama 2 等模型的语料规模、来源、PII、质量、去重或去污染信息大量缺失，跨模型数据比较无法严格复现. 求证结果:
- **dolma-14** D.1 称实验使用 `anonymized codebase`，具体实现和公开代码之间的映射不清楚，与开放复现目标存在张力. 求证结果:
- **dolma-15** Reddit 毒性方言审计用地理 subreddit 粗略代理英语变体，并假设各地真实毒性基率相同；两个未经验证的假设限制“少或无偏差”的结论. 求证结果:
- **dolma-16** 仅以任意两地标毒比例差小于 5% 不能排除群体内误报/漏报、话题组成或样本量差异. 求证结果:
- **dolma-17** GPT-NeoX tokenizer 对代码的 fertility 为 2.45，而其他来源约 1.15–1.28；同 token 预算下代码的字符覆盖和计算成本不同，跨域 token 量不能直接等同. 求证结果:
- **dolma-18** 过滤器之间较低 Pearson 相关只说明文档级标记重叠较少，不能证明语义效果不冗余或不存在联合作用. 求证结果:
- **dolma-19** Paloma 去污染仅做长度大于 13 个 Unicode 词元的精确段落匹配，会漏掉短样本、格式变化和改写；命中一段即删除整篇又会引入假阳性及分布变化. 求证结果:
- **dolma-20** 下游污染集中在 GitHub 代码副本：六个 PromptSource 数据集为 100% 污染，HumanEval、WiC、e-SNLI、SNLI 等也超过 90%，说明公开基准进入代码语料是系统性风险. 求证结果:
- **dolma-21** 各阶段过滤比例混用 byte、document、UTF-8 character 与 paragraph 等统计分母，论文没有给出统一的阶段漏斗表，跨步骤删除率不能直接相加. 求证结果:
- **dolma-22** 毒性消融中更严格阈值表现更好，但 v1.6 为保留语料规模采用了较宽松阈值；最终配方体现规模与质量权衡，不能写成该实验的性能最优点. 求证结果:
- **dolma-23** mixture 附录明确不主张唯一混合策略，而且实验时 social 数据尚未准备完成；该附录的排序不能直接外推到最终全来源配方. 求证结果:
- **dolma-24** Bloom filter 各阶段给出理论设计与容量选择，却缺少最终负载下统一的实测误报率；误删规模因此无法从论文数字完整复算. 求证结果:

### OLMES（arXiv 2406.08446）

解析：`content/olmo/04-数据与评测/olmes/olmes-analysis.md`。

- **olmes-paper-1** 提示稳健性实验只覆盖少量轻微措辞变体，表 5 又仅含 5 个模型与 3 个任务，证据不足以支持广泛的跨提示稳健性结论. 求证结果:
- **olmes-paper-2** “不足 1% 的提升不值得约 4 倍计算量”属于成本效益判断，依赖具体硬件、预算与用途，不能当作普遍阈值. 求证结果:
- **olmes-paper-3** 报告的标准误没有纳入提示模板和示例选择带来的方差，误差范围可能低估完整评测流程的不确定性. 求证结果:
- **olmes-paper-4** CF、MCF 与归一化方案的偏好随模型和任务变化；按结果事后选择协议可能改变排名并引入乐观选择偏差. 求证结果:
- **olmes-paper-5** 最大化 MCF/CF 得分把协议选择并入指标，可能系统性抬高结果；论文没有充分探索混合形式及预注册选择规则. 求证结果:
- **olmes-paper-6** leading-space 等设置具有 tokenizer 依赖性，HellaSwag、WinoGrande 的 CF 对齐也包含任务结构混杂，不能简单外推到其他分词器和任务. 求证结果:
- **olmes-paper-7** 部分既有排行榜缺少或使用不一致的评测设置，跨榜结果无法严格比较；拟合仅有约 0.26 的 R²，解释力有限. 求证结果:
- **olmes-paper-8** 五样本示例的人工挑选、顺序与标签平衡规则可能引入选择偏差；论文只测试有限顺序，不能排除内容敏感性. 求证结果:
- **olmes-paper-9** CF 与 MCF 对比同时改变输出形式、打分空间和校准方式，单个示例不能证明性能差异只来自格式稳健性. 求证结果:

### RewardBench 2（arXiv 2506.01937）

解析：`content/olmo/03-后训练与奖励模型/rewardbench-2/rewardbench-2-analysis.md`。

- **rewardbench-2-1** Factuality 先由 GPT-4o 判断、再由 Claude Sonnet 3.7 复核，并删除约 30% 裁判不一致样本；最终集合偏向两类裁判已有共识的事实，不能覆盖全部细微或争议性事实判断. 求证结果:
- **rewardbench-2-2** 六域采用等权宏平均，但样本数从 Ties 的 102 到 Focus 的 495 不等；小域单题对总分影响更大且抽样方差更高，细小总分差异需要题级区间支持. 求证结果:
- **rewardbench-2-3** RewardBench 2 与 BoN 的 0.87 Pearson 相关绑定固定生成器、N=16 候选和所选下游任务；生成器过强时论文已观察到候选区分度与相关性下降，不能把 0.87 外推为固定常数. 求证结果:
- **rewardbench-2-4** PPO 表中使用多组超参数里的最佳中间 checkpoint；若 checkpoint 选择与最终九项评测未严格隔离，点估计可能含选择偏差，且不代表最终 checkpoint 的稳定表现. 求证结果:

### Tülu 2（arXiv 2311.10702）

解析：`content/olmo/03-后训练与奖励模型/tulu-2/tulu-2-analysis.md`。

- **tulu-2-1** DPO 使用的 UltraFeedback 含 TruthfulQA 提示，论文因此在相关模型比较中移除 TruthfulQA；该模型在此评测上的结果不能解释为严格未见泛化. 求证结果:
- **tulu-2-2** AlpacaEval 与平均回答长度的相关系数达到 0.96，DPO 后分数提升同时伴随回答变长；现有实验没有用等长人评完全分离内容质量与长度偏好. 求证结果:
- **tulu-2-3** QLoRA 与全量 SFT 对照同时改变最大长度、epoch、学习率、可训练参数和硬件实现，性能差距不能单独归因于量化或低秩约束. 求证结果:
- **tulu-2-4** LaTeX 工作文件与最终表格保留不同版本数字，且正文中的相对百分比与表中百分点容易混淆；复现和引用必须绑定最终论文表号及模型版本. 求证结果:

### Tülu 3（arXiv 2411.15124）

解析：`content/olmo/03-后训练与奖励模型/tulu-3/tulu-3-analysis.md`。

- **tulu-3-1** 附录表格含 `base-adpted`、`GSM8KP::chat-v2`、`Rationale/Rational`、`separatedby`、`parantheses` 与 “higher than than” 等明显文字或命名错误，复现实验时不能照抄. 求证结果:
- **tulu-3-2** 实际使用场景并非严格受控实验；部分模型在 DROP 或 GSM8K 上反而下降，汇总提升不能替代逐任务检查. 求证结果:
- **tulu-3-3** Qwen 结果在不同评测配置间出现巨大差异，暴露旧评测协议不一致；表 44 又同时改变 shot 数与 CoT，无法单独归因. 求证结果:
- **tulu-3-4** implicit CoT 是在同一批 MMLU 结果上选择的，存在选择偏差；它在部分 Qwen 设置上更差，且未给置信区间或多重比较校正. 求证结果:
- **tulu-3-5** DPO 的 β=0.01 出现奖励投机，β=0.1 仍可能偏好形式化表达；这说明奖励提高不必然代表回答质量提高. 求证结果:
- **tulu-3-6** 第 68 页存在 `Content truncated`，属于源文截断标记；表 46 所称系统性提升亦存在反例，不能按绝对结论理解. 求证结果:
- **tulu-3-7** 被拒样本放宽了一个约束，困难数学提示又缺少独立答案验证；judge 提示未说明量表校准、偏差控制与一致性. 求证结果:
- **tulu-3-8** instruction following、helpfulness、honesty 等分数混合多个维度，幻觉比例的单位也未清楚定义，且没有报告评审者一致性. 求证结果:
- **tulu-3-9** 图 43 的曲线不能建立因果关系，输出长度等因素可能混杂；固定结尾格式还可能影响自动解析与打分. 求证结果:
- **tulu-3-10** DeepMind 数学训练样例、IFEval 的不可验证约束及英语特有约束限制了泛化，部分约束本身含糊，定制任务覆盖又较稀疏. 求证结果:
- **tulu-3-11** CSV/TSV 命名、特殊字符定义、Napoleon 战役和欧洲首都等题目存在歧义；HREF 的 L/LH/E 标记混用，可能影响标签解析. 求证结果:
- **tulu-3-12** Llama 系列 judge 可能偏向同族模型，嵌入相似度也不等同于事实正确性；各子任务弱点没有置信区间支持. 求证结果:

### DR Tulu（直译复核补充）

- **dr-tulu-11** 表 1 混入闭源系统，但样本选择与版本来源不完全透明，模型间差异可能同时包含数据、工具和服务版本影响. 求证结果:
- **dr-tulu-12** HealthBench 的负分被并入宏平均后会改变汇总量纲，读者不能把宏平均直接解释成普通正确率. 求证结果:
- **dr-tulu-13** GeneticDiseasesQA 只有 47 个问题、24 个变体且重复次数不等，方差和代表性不足以支撑广泛临床结论. 求证结果:
- **dr-tulu-14** 无引用时把引用精确率设为 1 会奖励拒绝引用；若同时按查询次数给奖励，还可能诱导无效搜索等策略性行为. 求证结果:
- **dr-tulu-15** 训练与推理的搜索预算及后端服务并非完全一致，外部检索、闭源教师和版本漂移都会削弱严格复现. 求证结果:
- **dr-tulu-16** 定性案例只能展示机制可能如何工作，不能替代盲评、错误率与跨领域统计检验. 求证结果:

### DeepSeek-Coder 系列

解析：`content/deepseek/01-模型技术报告/deepseek-coder/deepseek-coder-analysis.md` 与 `content/deepseek/01-模型技术报告/deepseek-coder-v2/deepseek-coder-v2-analysis.md`。

- **deepseek-coder-1** DeepSeek-Coder 的主体规模写作 33B，但一处示例使用“34B”，模型规模口径前后不一致. 求证结果:
- **deepseek-coder-2** LeetCode 7–8 月题目的分数偏高，作者明确承认不能排除数据污染，因此该结果不能作为严格未见题泛化的单独证据. 求证结果:
- **deepseek-coder-3** 64K 是 RoPE 缩放给出的理论上下文范围，报告明确写出的可靠实测范围为 16K，两者不能混作同一个验证结论. 求证结果:
- **deepseek-coder-v2-1** DeepSeek-Coder-V2 对上一代支持语言数量同时出现 86 与 87 两种口径，需要按具体表格或版本注明. 求证结果:
- **deepseek-coder-v2-2** Table 7 后的解释把 V2-Instruct 写成 DeepSeek-Coder-Instruct，疑似模型名称笔误. 求证结果:
- **deepseek-coder-v2-3** exponential normalization 只被描述为造成训练不稳定和梯度尖峰，论文未提供曲线或量化消融来界定影响幅度. 求证结果:
- **deepseek-coder-v2-4** Figure 3 声称奖励模型信号优于编译器信号，但没有公开足够的可复算数值. 求证结果:
- **deepseek-coder-v2-5** 强化学习阶段没有公开组大小、KL 系数和奖励模型结构等关键参数，完整复现条件不足. 求证结果:

### DeepSeek-V3.1 系列

解析：`content/deepseek/01-模型技术报告/deepseek-v3-1/deepseek-v3-1-analysis.md` 与 `content/deepseek/01-模型技术报告/deepseek-v3-1-terminus/deepseek-v3-1-terminus-analysis.md`。

- **deepseek-v3-1-1** V3.1 只有发布说明而没有完整技术报告，网络改动、840B token 数据构成、双模式配比、CoT 压缩目标、Agent 轨迹来源和后训练算法均未披露. 求证结果:
- **deepseek-v3-1-2** Agent 评测表缺少框架、步数、采样参数和工具实现；HLE 在带工具与无工具协议下分别为 29.8 和 15.9，引用时必须注明协议. 求证结果:
- **deepseek-v3-1-3** UE8M0 只公布格式名称，没有重新声明分块布局，也没有给出独立精度消融. 求证结果:
- **deepseek-v3-1-terminus-1** Terminus 未公布语言混杂率、随机字符率或对应测试集，“no more random chars”只能作为官方定性声明. 求证结果:
- **deepseek-v3-1-terminus-2** Terminus 没有给出训练配方和完整评测协议，0.1–0.6 分的变化也缺少方差和置信区间. 求证结果:
- **deepseek-v3-1-terminus-3** BrowseComp 从 30.0 升到 38.5，但 BrowseComp-zh 从 49.2 降到 45.0，Search Agent 增益不具跨语言一致性. 求证结果:
- **deepseek-v3-1-terminus-4** Codeforces 从 2091 降到 2046，Aider-Polyglot 从 76.3 降到 76.1，“across benchmarks 更稳定可靠”不能解释为所有指标单调上涨. 求证结果:

### DeepSeekMath

解析：`content/deepseek/01-模型技术报告/deepseek-math/deepseek-math-analysis.md`。

- **deepseek-math-1** 120B 数学语料只公开了分类器迭代和领域比例，没有公开网页 URL 清单、各轮新增量与逐基准去污染结果，无法独立复建训练集。求证结果：论文只给出整体流水和抽样质量实验。
- **deepseek-math-2** 1.3B 数据消融同时改变语料来源和继续预训练过程，不能把所有提升严格归因于数学网页质量。求证结果：缺少等 token、等训练步数的完整交叉对照。
- **deepseek-math-3** SFT 混合英文、中文与工具调用三种解法，但没有公布逐类样本量、采样比例和单类消融，三类监督各自贡献无法分离。求证结果：方法段只披露合计 776K 样本。
- **deepseek-math-4** GRPO 训练的组大小、训练总步数、KL 系数日程、奖励归一化稳定性与多次随机种子方差披露不完整。求证结果：论文给出目标函数和部分超参数，缺少完整训练轨迹。
- **deepseek-math-5** 规则奖励覆盖有唯一答案的题型，开放证明题依赖奖励模型；两类奖励的错误率和冲突率没有系统报告。求证结果：论文只描述使用范围与最终消融。
- **deepseek-math-6** RL 仅在 GSM8K 与 MATH 训练问题上开展，域外增长不能直接证明获得全新的数学能力，也可能来自既有能力的概率重排。求证结果：没有报告底座在极大采样预算下的能力并集。
- **deepseek-math-7** pass@k、Maj@k 与单次准确率衡量不同性质，部分横向比较使用的采样数、温度和答案抽取规则不一致。求证结果：论文表格不能统一换算为等 token 或等计算预算。
- **deepseek-math-8** 从 DeepSeekMath 的 7B GRPO 结果外推到 R1 的长推理能力存在底座、上下文长度、规则奖励和多阶段数据流程混杂。求证结果：两篇论文共享算法骨架，但训练设置并非单变量延伸。

### DeepSeekMath-V2

解析：`content/deepseek/01-模型技术报告/deepseek-math-v2/deepseek-math-v2-analysis.md`。

- **deepseek-math-v2-1** 自动标注流程中的 $n$、$m$、$k$ 没有公开，难以复算数据生成规模和筛选强度. 求证结果:
- **deepseek-math-v2-2** meta-verifier 质量从 0.85 升到 0.96 是模型裁判评价，不是形式化正确性保证. 求证结果:
- **deepseek-math-v2-3** 最后两轮称完全替代人工标注，但只说明 quality checks 一致，没有给出样本规模和一致率. 求证结果:
- **deepseek-math-v2-4** Figure 2 的自评选择使用 Best@32，同源模型担任生成与评审可能产生共享偏差. 求证结果:
- **deepseek-math-v2-5** Heavy 搜索需要 64 份证明乘 64 次验证，最多 16 轮且每个候选有 8 份分析，但没有报告 token 或 GPU 成本. 求证结果:
- **deepseek-math-v2-6** verifier 与 generator 属于同一模型谱系，可能共享无法由互评发现的盲点. 求证结果:
- **deepseek-math-v2-7** Putnam 118/120 等成绩来自高计算搜索与专家评分，不能解释为 one-shot 解题率. 求证结果:

### JanusFlow

解析：`content/deepseek/01-模型技术报告/deepseek-janusflow/deepseek-janusflow-analysis.md`。

- **janusflow-1** §4.5 `Impact of Decoupling Visual Encoders` 后出现残句 `e efficacy...`，句首在 PDF 中已经缺失，无法从源文可靠恢复. 求证结果:
- **janusflow-2** 表 5 转成 Markdown 后多个模型及整列数字挤入单个单元格，逐行对应关系丢失，具体成绩必须回看 PDF. 求证结果:
- **janusflow-3** 因果注意力与其他 mask 只被描述为初步实验无收益，没有给出定量消融. 求证结果:
- **janusflow-4** REPA 选取第 6 层、三层 MLP 以及与 RF 损失的相对尺度均没有独立消融. 求证结果:
- **janusflow-5** 表 6 的 B/C/F 不是完整析因实验，编码器解耦与 SigLIP 预训练的贡献无法完全分离. 求证结果:
- **janusflow-6** 200 万内部图文数据及增强版 DeepSeek-LLM 扩展语料没有公开. 求证结果:
- **janusflow-7** 论文只报告约 1600 A100 GPU-days，没有给出 GPU 数、墙钟时间和训练样本或 token 总量. 求证结果:
- **janusflow-8** 256 分辨率语义分更高的成因只是作者解释，没有由独立实验隔离. 求证结果:
- **janusflow-9** 评测缺少人类偏好、安全、延迟、显存和吞吐指标. 求证结果:
- **janusflow-10** Euler 求解没有与高阶求解器比较，少步采样的外推边界不明确. 求证结果:

### Janus-Pro

解析：`content/deepseek/01-模型技术报告/deepseek-janus-pro/deepseek-janus-pro-analysis.md`。

- **janus-pro-1** 论文没有公开 7200 万合成美学图所用的生成模型、采样参数与过滤流程，生成数据无法独立复现. 求证结果:
- **janus-pro-2** 阶段 II 计划 360K 步但在 270K 步早停，论文没有给出早停指标、验证曲线或 checkpoint 选择规则. 求证结果:
- **janus-pro-3** 训练日程、理解数据、合成数据、任务比例和优化超参同时变化，缺少逐因素消融，Janus 到 Janus-Pro-1B 的增益无法拆分归因. 求证结果:
- **janus-pro-4** 生成评测没有报告 FID、人类偏好、审美分或多 seed 方差，“画质与稳定性提升”主要依赖定性样例. 求证结果:
- **janus-pro-5** GenEval 与 DPG-Bench 的采样温度、CFG、候选数量等完整推理设置没有披露，跨模型小幅差异包含未知采样因素. 求证结果:
- **janus-pro-6** 9000 万理解数据和 7200 万合成数据没有公开去重、污染检查及详细来源构成，训练集与公开评测的重合风险无法复算. 求证结果:
- **janus-pro-7** 论文只给 GPU 节点数与墙钟天数，没有 token 吞吐、packing 利用率、训练 FLOPs 或阶段级资源统计，1B/7B 的等算力效率无法比较. 求证结果:
- **janus-pro-8** 论文承认 384 分辨率限制 OCR 和小脸细节，但理解表没有 OCR 专项结果，生成表也没有按对象尺度或文字渲染分项. 求证结果:

### DeepSeek-Prover

解析：`content/deepseek/01-模型技术报告/deepseek-prover/deepseek-prover-analysis.md`。
- **deepseek-prover-1** 论文没有公开 869,659 道网络竞赛题的具体来源、清洗规则与题面级去污染结果；这些来源与 miniF2F 的 AMC、AIME、IMO 题源可能重合。求证结果：正文仅给出题目总量和宽泛类别。
- **deepseek-prover-2** miniF2F-valid 样例进入形式命题质量评分提示，同时 valid 分数仍作为实验结果报告，因此该分区不能视为完全未参与开发。求证结果：评分提示与结果表均见论文正文及附录。
- **deepseek-prover-3** 假设否决只检查声明外层前提能否推出 `False`，不能覆盖结论内部蕴含前件或量词结构中的空虚真；附录成功样例中可以找到此类退化命题。求证结果：按附录 Lean 声明代入具体值可导出内部前件矛盾。
- **deepseek-prover-4** FIMO 规模在摘要中写为 148，正文评测段写为 149。求证结果：arXiv 2405.14333v1 两处数字不一致。
- **deepseek-prover-5** 过滤后 712,073 条形式声明如何形成 8,066,621 条带证明样本没有数量分解；跨轮累积、多次形式化、同题多证明和否定证明各自占比均未报告。求证结果：论文只给出两端总数。
- **deepseek-prover-6** 双向搜索没有公开最大尝试次数、原命题与否定命题分别成功的数量以及双向均失败比例，无法量化该设计节省的验证预算。求证结果：方法段只描述并行尝试流程。
- **deepseek-prover-7** 各轮新增证明数、训练步数与新旧数据混合比例没有公开，表 4 的迭代收益无法拆分为数据规模、难度变化和训练时长的贡献。求证结果：训练设置只给出全局 batch、学习率与 warmup。
- **deepseek-prover-8** 全量 8,066,621 样本的一次性规模实验得到 40.16%，低于迭代表中的 46.3%；1,000 样本实验又低于未训练底座，论文没有解释两组设置差异。求证结果：表 4 与表 5 数值无法直接对齐。
- **deepseek-prover-9** 主结果混用固定 pass@k 与跨实验累计成功率，树搜索和整证采样也没有统一为 token、验证器调用或墙钟时间，跨方法结果不属于等计算预算比较。求证结果：表 1 只列采样或搜索次数。

### DeepSeek-Prover-V1.5

解析：`content/deepseek/01-模型技术报告/deepseek-prover-v1-5/deepseek-prover-v1-5-analysis.md`。

- **deepseek-prover-v1-5-1** 继续预训练没有公开 token 数、学习率、数据配比及 Lean/Isabelle/Metamath 各自占比，Base 增益无法按语料来源归因. 求证结果:
- **deepseek-prover-v1-5-2** CoT 注释由 DeepSeek-Coder-V2 236B 事后生成，Lean 只验证代码而不验证注释，论文没有报告注释与证明步骤的一致率. 求证结果:
- **deepseek-prover-v1-5-3** RLPAF 没有公开训练步数、总 GPU 时间、reward/entropy/KL 曲线及组内全对全错比例，RL 成本与收敛过程无法复算. 求证结果:
- **deepseek-prover-v1-5-4** 论文没有完整说明如何禁止 `sorry`、不安全公理等验证逃逸，也没有发布 theorem statement 与 Lean 3→4 手工转换的逐题语义审计. 求证结果:
- **deepseek-prover-v1-5-5** RMaxTS 的状态等价键、前缀合并细节和 $γ=0.99$ 灵敏度没有完整消融，新状态奖励对伪新奇的敏感度不明. 求证结果:
- **deepseek-prover-v1-5-6** 搜索预算主要按生成次数统计，没有报告生成 token、Lean 调用、CPU 核时、GPU 时与墙钟，整证、逐步和 CoT 模式无法等成本比较. 求证结果:
- **deepseek-prover-v1-5-7** miniF2F 的 Lean 环境与 V1 不同，ProofNet Base 的 few-shot 示例又来自 V1.5-RL 正确证明，跨模型行并非完全相同评测条件. 求证结果:
- **deepseek-prover-v1-5-8** ProofNet 某些预算下 RL 低于 SFT，miniF2F 上“RL 提升基础能力”的结论不能直接外推到本科数学分布. 求证结果:
- **deepseek-prover-v1-5-9** 表 3 中 SFT 的 non-CoT/CoT 混合 `(2+2)×6400`，单遍与 RMaxTS 两行同为 `56.1%±0.8%`，连标准差都相同，可能是巧合或表格抄录问题，论文没有说明. 求证结果:
- **deepseek-prover-v1-5-10** 主结果 63.5% 使用 CoT/non-CoT 混合与约 204800 次每题生成，且缺少同总预算纯 CoT 32×6400 对照，提示互补与额外预算贡献无法分离. 求证结果:

### DeepSeek-Prover-V2

解析：`content/deepseek/01-模型技术报告/deepseek-prover-v2/deepseek-prover-v2-analysis.md`。

- **deepseek-prover-v2-1** 初版 Putnam 结果受 Lean 4.9.0 `apply?` UI bug 影响，7B 模型还利用 `Cardinal.toNat` 与 `natCast_inj` 形成 reward hacking. 求证结果:
- **deepseek-prover-v2-2** Putnam 初报 49 题中有 2 题 statement 错构，最终修正为 47 题. 求证结果:
- **deepseek-prover-v2-3** CombiBench 初报 12 题中有 2 题 statement 错构，最终修正为 10 题. 求证结果:
- **deepseek-prover-v2-4** miniF2F 还修订了 valid 2 题和 test 1 题，benchmark statement 质量会显著改变结果. 求证结果:
- **deepseek-prover-v2-5** 88.9% 是 Pass@8192 而非单次通过率，671B 的 CoT 平均输出达到 6751.9 tokens. 求证结果:
- **deepseek-prover-v2-6** ProofNet 与 Putnam 的版本和基线分母不一致，包括 644 与 658 两种分母，不能直接按解题数横比. 求证结果:
- **deepseek-prover-v2-7** RL consistency reward 的权重、退出时点和训练成本没有公开. 求证结果:
- **deepseek-prover-v2-8** ProverBench 的 AIME 子集排除了几何、组合和计数题，15 题也不是随机样本. 求证结果:
- **deepseek-prover-v2-9** AIME 对比中 V3 负责 find-answer，而 Prover-V2 在给定正确答案后完成 formal proof，两者任务口径不同. 求证结果:
- **deepseek-prover-v2-10** Lean 编译只能保证给定 statement 内的证明正确，不能保证 formalization 忠实表达原题. 求证结果:

### DeepSeek-OCR

解析：`content/deepseek/01-模型技术报告/deepseek-ocr/deepseek-ocr-analysis.md`。

- **deepseek-ocr-1** 表 3 的指标均为 edit distance 而不是 accuracy，引用时不能把数值直接称为准确率. 求证结果:
- **deepseek-ocr-2** 表 4 把 `Gundam-M` 拼成 `Guandam-M`，疑似模型名称笔误. 求证结果:
- **deepseek-ocr-3** Figure 1 出现 `Vison Tokens`，疑似 `Vision Tokens` 的拼写错误. 求证结果:
- **deepseek-ocr-4** 20 倍压缩下约 60% 的结果受输出格式差异影响，不能只归因于视觉信息损失. 求证结果:
- **deepseek-ocr-5** 论文只用 OCR 重建间接验证光学上下文压缩，没有进行数字与光学 token 交错预训练或 needle 测试. 求证结果:
- **deepseek-ocr-6** 论文缺少编码器逐部件消融与多语言分项评测，组件贡献和跨语言稳定性仍不明确. 求证结果:

### DeepSeek-OCR 2

解析：`content/deepseek/01-模型技术报告/deepseek-ocr-2/deepseek-ocr-2-analysis.md`。

- **deepseek-ocr-2-1** 新旧模型除 encoder 外还改变了 OCR 1.0 的 3:1:1 采样和 layout 标签合并，3.73 的增益不能严格全部归因于 causal flow. 求证结果:
- **deepseek-ocr-2-2** encoder 从约 300M 参数的 CLIP 换成约 500M 参数的 Qwen2，参数量与预训练差异也是混杂变量. 求证结果:
- **deepseek-ocr-2-3** mBART cross-attention 只被描述为不收敛，没有训练曲线、超参数或重复实验. 求证结果:
- **deepseek-ocr-2-4** production 评测只使用 repetition rate，没有 ground truth 和样本量，不能代表整体准确率. 求证结果:
- **deepseek-ocr-2-5** newspaper 文本 ED 0.139 略差于 baseline 0.131，作者归因于 1120 token 上限和仅 250k 数据，但没有对应消融. 求证结果:
- **deepseek-ocr-2-6** “genuine 2D reasoning”只在文档 OCR 上验证，没有一般视觉推理证据. 求证结果:
- **deepseek-ocr-2-7** omni-modal encoder 仍是设想，没有音频或文本共享实验. 求证结果:
- **deepseek-ocr-2-8** 1120 token 与 Gemini 使用相同 token 数不代表信息量或 FLOPs 相等. 求证结果:
- **deepseek-ocr-2-9** 论文缺少速度、显存以及 mask/query 比例消融. 求证结果:

### DeepSeek-VL2

解析：`content/deepseek/01-模型技术报告/deepseek-vl2/deepseek-vl2-analysis.md`。

- **deepseek-vl2-1** 论文缺少动态切图、pixel shuffle、MLA、MoE 与数据扩充的完整组件消融，无法独立分离各项贡献. 求证结果:
- **deepseek-vl2-2** 内部数据的分项规模、人工抽检率和污染检查没有公开，训练集无法严格复现. 求证结果:
- **deepseek-vl2-3** 多图超过 2 张时关闭动态切图，但没有联合报告多图数量、tile 数和回答长度对效果的影响. 求证结果:
- **deepseek-vl2-4** 论文只给训练节点与天数，没有 GPU 利用率、有效 FLOPs、在线吞吐或延迟. 求证结果:
- **deepseek-vl2-5** grounding 坐标离散到 0–999，但没有按物体尺寸分析定位误差. 求证结果:

### Harness Composability

解析：`content/deepseek/03-基础设施/harness-composability/harness-composability-analysis.md`。

- **harness-composability-1** runtime 不验证 inverse 的正确性、coeffect 交换律或 confinement，形式性质依赖实现者满足前提. 求证结果:
- **harness-composability-2** 论文没有性能基准，也没有 notification 在大规模依赖图上的扩展性评测. 求证结果:
- **harness-composability-3** VS Code Top 100 扩展统计没有附抓取脚本与完整清单，样本构成难以复算. 求证结果:
- **harness-composability-4** Koishi 的 4000 多个插件只作为生态案例出现，没有量化兼容率、故障率或迁移成本. 求证结果:
- **harness-composability-5** HMR 对 module 顶层副作用和外部不可逆副作用的处理边界不清楚. 求证结果:
- **harness-composability-6** 分布式扩展没有覆盖消息乱序、网络分区和重复投递. 求证结果:
- **harness-composability-7** `FAILED` 状态或 inverse 抛错后的清理策略没有完整定义. 求证结果:
- **harness-composability-8** 自演化 agent 只作为未来应用提出，没有实验验证. 求证结果:

### REINFORCE

解析：`content/rl/01-基础/01.04-reinforce/01.04-reinforce.md`。

- **reinforce-1** 仓库旧附件标注为 arXiv `1807.04077`，实际对应一篇心脏异常检测论文，并非 REINFORCE 原论文。REINFORCE 的一手来源是 Ronald J. Williams 1992 年发表于 *Machine Learning* 的 *Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning*，DOI `10.1007/BF00992696`. 求证结果: 正文已改用正确论文链接，旧附件不再作为来源。

### Smallpond

解析：`content/deepseek/04-开源仓库/smallpond/smallpond-analysis.md`。

- **smallpond-1** 入门文档使用 `repartition(3, by_row=True)`，源码参数名是 `by_rows`，示例原样运行会因多余关键字参数失败. 求证结果: 对照官方仓库 `main` 分支的 DataFrame 接口确认.
- **smallpond-2** 低层 API 示例没有向 `Driver` 传入必需的 `mode` 位置参数，示例还缺少 `List` 导入；任务文档构造 `RuntimeContext` 时缺少 `job_time`. 求证结果: 对照官方仓库对应构造函数签名确认.
- **smallpond-3** `DataFrame.is_computed` 使用优化前节点查询任务映射，按当前实现会持续得到 `False`. 求证结果: 对照 `dataframe.py` 与会话中的节点到任务映射路径确认.
- **smallpond-4** 3FS 快速递归删除仅以 `/hf3fs` 路径前缀识别挂载点，按 3FS 开源部署示例挂载到其他路径时会退回逐文件删除. 求证结果: 对照 `smallpond/io/filesystem.py` 的路径判断确认.
- **smallpond-5** GraySort 命令行默认值与 `gray_sort_benchmark` 函数默认值不一致，包括排序引擎以及 shuffle CPU 设置；公开材料也没有给出 110.5 TiB 运行所用的完整命令与参数. 求证结果: 对照官方 benchmark 脚本与 README 确认.
### DSpark

解析：`content/deepseek/02-架构与算法/dspark/dspark-analysis.md`。

- **dspark-1** Gemma4-12B 上 Eagle3 的平均接受长度高于 DFlash，与正文用草稿容量解释并行模型优势的叙述方向相反；论文没有提供该模型的逐位置接受率。求证结果：表 1 可直接复算。
- **dspark-2** 论文的位置损失写为按块长 $\gamma$ 衰减，公开 Qwen3 配置却使用 `loss_decay_gamma=4.0` 且块长为 7，末位置权重相差近一倍。求证结果：论文公式与 DeepSpec 配置、损失实现不一致。
- **dspark-3** 论文没有做保持训练目标、数据和草稿深度完全一致、只加入 Markov head 的单变量消融，位置一与整体接受率增益无法全部归因于顺序头。求证结果：现有消融同时涉及结构或目标变化。
- **dspark-4** 顺序头训练使用真实前驱 token，推理使用自身采样 token，论文没有量化 teacher forcing 与推理分布之间的差距。求证结果：训练代码和采样代码的前驱来源不同。
- **dspark-5** 置信度温度在离线数据上按位置拟合，论文没有报告流量领域变化、模型更新或长上下文分布漂移后的校准稳定性。求证结果：只给出固定验证集 ECE。
- **dspark-6** 延迟消融主要在 batch 128 下报告，小 batch 时顺序采样和低秩投影占比可能上升，论文缺少低并发延迟曲线。求证结果：图 4 的延迟口径为高 batch 多上下文平均。
- **dspark-7** 线上 V4 结果同时包含生产草稿模型、变长验证、内核和批处理改造，无法从完整系统数字单独识别 DSpark 两项算法组件的贡献。求证结果：图 7 与部署章节没有完整逐项消融。
- **dspark-8** 早停对无偏调度是必要条件，但公开训练仓库与生产服务实现的调度代码边界不同，论文没有发布完整线上调度器。求证结果：DeepSpec 主要覆盖训练与离线评测。
