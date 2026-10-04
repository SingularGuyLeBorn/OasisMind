---
title: "Step 5 Preview: 600B 总参, 27B 激活的稀疏旗舰"
category: "模型库"
tags: ["StepFun", "技术解析"]
published: true
excerpt: "阶跃星辰把旗舰从 196B 的 Flash 线拉到 600B 总参, 每 token 激活 27B, 上下文 1M, 主攻长程编程, Agent 与金融分析."
---
# Step 5 Preview: 600B 总参, 27B 激活的稀疏旗舰

材料是阶跃星辰 2026 年 9 月的 Step 5 Preview 官网发布页 (https://www.stepfun.com/step-5-preview), 带案例和一张三栏对照表, 不是技术报告, 层数, 专家数, 注意力形式和训练数据都没有公开. 这款稀疏 MoE ([MoE 总览](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md)) 总参 600B, 每 token 激活 27B, 上下文 1M, 支持视觉输入; 要看的问题是它在阶跃旗舰线上处在什么位置, 发布页给的分数和案例能支撑多少「智能效率」的主张.

## 1. 阶跃的旗舰线: 从 Step-2 到 Step 5

### 1.1. Step-2 与 Step-3: 万亿 MoE 和按 decode 成本定结构

阶跃星辰 2024 年 3 月公开露面时, 同时发了千亿参数的 Step-1, 多模态的 Step-1V, 和一个万亿 MoE 的 Step-2 预览 ([Step-1 篇](../step1/step1-analysis.md)). Step-2 在 WAIC 2024 转为正式版, 通稿只写了「万亿参数 MoE」这一句结构信息, 没有层宽, 专家池或激活量 ([Step-2 篇](../step2/step2-analysis.md)). 这一阶段的旗舰路线是先把总参做大.

Step-3 (arXiv 2507.19427, 2025-07) 是阶跃第一篇把结构写成表的技术报告, 思路也换了: 先假设 attention 和 FFN 分开部署 (AFD), 再按几款卡的算力, 带宽和单价倒推结构. 结果是 VLM 总参 321B (语言模型 316B, 视觉 5B), 每 token 激活 38B, 61 层, hidden 7168. 注意力用自家的 MFA, query 降到 2048 维, 64 个 query 头共享 1 个 K 头和 1 个 V 头, 头维 256, 8-bit KV 下算术强度 128, 夹在 GQA 的 32 和 MLA 的 512 之间. FFN 的 MoE 稀疏度约 0.08. 报告按 8K 上下文估算每百万 decode token 约 \$0.055, DeepSeek-V3 是 \$0.068 ([Step-3 篇](../step3/step3-analysis.md)). Step-3 的目标函数是 decode 成本, TestingTime 想得越久, 这个成本越要紧.

### 1.2. Step 3.5 Flash 与 3.7 Flash: 为 agent 延迟设计的 196B

Step 3.5 Flash (arXiv 2602.10604, 2026-02) 把目标从每 token 成本换成「agent 一轮交互的墙上时间」, 规模随之缩小: 总参 196B, 激活 11B (算上 MTP 为 198B / 13B), 45 层, 前 3 层 dense, 每层 288 个路由专家加 1 个共享专家, top-8 ([Step 3.5 Flash 篇](../step3-5-flash/step3-5-flash-analysis.md)). 作者给的规模理由是要能放进 128GB 统一内存的工作站.

注意力从 MFA 换成 S3F1: 每 3 层窗口 512 的 SWA 接 1 层 full GQA-8, SWA 层 96 个 query 头, 全网带 head-wise gate. 不选线性注意力的理由落在投机解码上, 线性注意力按递推更新状态, 草稿树的多个分支没法并行验证, SWA 仍是 softmax 注意力, 用 KV mask 就能一次验完整棵树. 草稿来自 3 个 MTP 头, 合计 0.81B. 附录按发布规格算过, 64k 上下文下全 full 注意力的 decode FLOPs 是 S3F1 的 1.51 倍, 256k 时 2.33 倍. 训练侧有 4,096 张 H800, 预训练约 17.6T token, 优化器 Muon, 后训练 RL 用 MIS-PO (token 级重要性比截断在 $[0.5, 2]$, 轨迹级 $[0.996, 1.001]$). 上线首周 OpenRouter 上约 170 tokens/s. 机制背景见 [多 Token 预测 MTP](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.6-多Token预测MTP/2.4.6-多Token预测MTP.md) 与 [投机解码原理与应用](../../../../llm-guide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.2-投机解码/01-投机解码原理与应用.md).

Step 3.7 Flash (2026-05-29) 在 3.5 Flash 上加了 1.8B 的 ViT, 激活仍是 11B, 页面写最高 400 TPS, 权重开放. 相对 3.5 Flash, SWE-Bench Pro 从 51.3 到 56.3, Terminal-Bench 2.1 从 53.4 到 59.6. 它主打的 Advisor Mode 让 3.7 Flash 当执行者, 只在规划或反复失败时请教更大的模型, 拿到 Claude Opus 4.6 编程表现的 97%, 单任务 \$0.19 对 \$1.76 ([Step 3.7 Flash 篇](../step3-7-flash/step3-7-flash-analysis.md)). Flash 线到这里已经同时有了视觉输入, 长上下文和低延迟.

### 1.3. Step 5 Preview 在这条线上的位置

激活比例写成

$$\rho = \frac{N_{\text{act}}}{N_{\text{total}}} \tag{1}$$

按各代公开的数算, 结果如下表. Step-2 没公开激活量, 不入表.

| 模型 | 发布 | 总参 | 每 token 激活 | $\rho$ | 上下文 | 视觉 | 主设计目标 |
|---|---|---|---|---|---|---|---|
| Step-3 | 2025-07 | 321B (语言 316B) | 38B | 约 12.0% | 报告按 8K 估成本 | 5B 视觉 | decode 成本 |
| Step 3.5 Flash | 2026-02 | 196B | 11B | 约 5.6% | 训练到 128k | 无 | agent 延迟 |
| Step 3.7 Flash | 2026-05 | 196B + 1.8B ViT | 11B | 约 5.6% | 同 3.5 | 有 | agent 效率 |
| Step 5 Preview | 2026-09 | 600B | 27B | 约 4.5% | 1M | 有 | 智能效率 |

对照组: Kimi K3 是 2.8T 总参, 104B 激活, $\rho$ 约 3.7%. Step 5 的总参是 K3 的约 21%, 激活约 26%. 和上一代 Flash 比, 总参约为 3 倍 ($600/196\approx3.1$), 激活约为 2.5 倍 ($27/11\approx2.5$), 激活比例从 5.6% 继续降到 4.5%.

这张表里能读出两件事. 一是总参在 Flash 线之后重新上调, 600B 回到 Step-3 的两倍左右, 稀疏度却比 Step-3 低一半以上, 走的是 Flash 线「专家池大, 每 token 少激活」的方向, 没有回到 Step-3 的 0.08 稀疏度. 二是上下文从 3.5 Flash 训练的 128k 一步跳到 1M. Step 3.5 Flash 能用 SWA 压住长上下文代价, 是因为只有 1/4 的层存全量 KV. 1M 下 Step 5 用什么注意力, 发布页没写, 3.5 Flash 的 S3F1 能否沿用也就无从判断.

### 1.4. 上一代留下的训练问题

规模从 196B 到 600B, 3.5 Flash 报告里记下的几类训练问题都会更突出. 第一类来自优化器: 全程用 Muon, 正交化用 Polar Express, bfloat16 下偶发不可恢复的 loss 尖峰, 最后把 Polar Express 的状态和中间量改成 float16 才压住. 第二类是专家死亡: Step-3 遇到的是路由饥饿, 某些专家长期分不到 token; 3.5 Flash 看到的是路由统计正常, 专家的激活和参数范数却一路萎缩, 诱因之一是 micro-batch 级均衡 loss 管得太严. 第三类是深层少数专家的激活爆炸, 只做权重裁剪推迟不了多久, 要在进 $W_{\text{down}}$ 之前对激活逐元素截断才压得住. 作者因此把「每专家激活范数的 max/median 比值」列为必须监控的指标. 另外, 3.5 Flash 在常规负载均衡 loss 之外, 还按 EP rank 分组加了一项组级均衡, 目的是避免专家并行时个别卡拖慢整步. 600B 的专家要摊到更多卡上, 这类拖尾只会更明显. Muon 的背景见 [MuonClip 与 Polar Express](../../../../llm-guide/6-训练与推理优化/6.5-优化器/Muon/05-MuonClip与PolarExpress.md).

后训练上, 3.5 Flash 先分领域练专家模型, 再自蒸馏回一个模型, 最后用 MIS-PO 做大规模 RL. MIS-PO 把推理引擎和训练框架之间的概率比当作二值过滤条件, 比值落在区间外的 token 或整条轨迹直接丢掉, 用来压住 MoE 上「同一 token 在两边被路由到不同专家」带来的方差. 配套的 Routing Confidence 是每个 token 被激活专家的 top-$k$ 概率之和再取平均, 低了就要 Router Replay 或严格 on-policy. 报告 §7 列的第一条局限是 token 效率, 达到 Gemini 3.0 Pro 相当的质量需要更长的生成轨迹, 下一步打算压缩思考过程. Step 5 发布页把卖点放在 Task Cost 上, 正好接着这条局限, 但页面没给 token 用量, 训练方法也一句没提, 这一代是否沿用 MIS-PO 无从核对.

## 2. 规格与部署量级

### 2.1. 600B / 27B 意味着什么

按每 token 前向约 $2N_{\text{act}}$ FLOPs 估, Step 5 每 token 约 54 GFLOPs, Step 3.5 Flash 约 22 GFLOPs, Kimi K3 约 208 GFLOPs. 单 token 计算量是 Flash 的约 2.5 倍, 不到 K3 的三成. 页面强调的 Task Cost 更低, 和这个量级是对得上的: 激活 27B 的模型和激活 104B 的模型在多数格上分数接近, 每 token 计算差约 3.9 倍.

权重内存按总参算. BF16 下 600B 约 1.2TB, FP8 约 600GB. 八卡 H100 (共 640GB) 装 FP8 权重后只剩约 40GB 给 KV 和激活, 跑 1M 上下文不现实; 八卡 H200 (共 1128GB) 装 FP8 权重绰绰有余. 这只是按字节估的下限, 页面没说发布精度, 也没说是否开放权重. 和 3.5 Flash 相比, 「放进 128GB 工作站」这个目标在 Step 5 上已经不成立, 这一代回到了数据中心部署.

### 2.2. 1M 上下文和视觉输入

1M 上下文和视觉输入, 发布页只写了能力, 没有位置编码外推方式, 长上下文评测或视觉编码器说明. 阶跃自己的前例是: Step 3.5 Flash 上下文拉长时只抬 full 层的 RoPE $\theta$ (32k 时 1,000,000, 128k 时 5,000,000), SWA 层保持 10,000; Step 3.7 Flash 的视觉是外挂 1.8B ViT. Step 5 的视觉栈是否沿用这一路, 页面没有交代.

对照表里能间接看长上下文的是 AA-LCR v1.1: Step 5 88.3, GLM-5.3 79.7, Kimi K3 88.7. 这是 Artificial Analysis 的长上下文推理评测, Step 5 和 K3 基本持平, 高出 GLM-5.3 约 8.6 分.

## 3. 编程

### 3.1. StepCodeBench 与 avg@4

StepCodeBench 是阶跃自建的编程评测, 553 个仓库, 9 类任务, 20 个领域, 33 种语言. Step 5 拿到 49.0% avg@4, 分类型图上 Bug 修复, Feature 修改和重构较突出. avg@k 和常见的 pass@k 是两种统计:

$$\text{avg@}k = \frac{1}{|T|}\sum_{t\in T}\frac{1}{k}\sum_{i=1}^{k}\mathbb{1}[\text{第 } i \text{ 次通过 } t] \tag{2}$$

$$\text{pass@}k = \frac{1}{|T|}\sum_{t\in T}\mathbb{1}[k \text{ 次中至少一次通过 } t] \tag{3}$$

avg@4 是单次成功率的估计, 只是用 4 次采样降低方差; pass@4 衡量的是多试几次的上限 (无偏估计方法见 Chen 等 2021). 49.0% avg@4 的意思是随手跑一次, 大约一半任务能过. 同表 StepCodeBench 上 GLM-5.3 是 40.2, Kimi K3 是 43.9, Step 5 领先约 5 到 9 分. 但同为自建的 StepCode-Bench-Daily 上 Step 5 是 64.9, 低于 GLM-5.3 的 69.1; StepCode-Bench-General 是 65.0, 低于 K3 的 65.2. 三个自建集只有一个领先.

### 3.2. 公开编程评测

DeepSWE v1.1 用 SWE-agent harness, `temperature=1.0`, `top_p=0.95`, Step 5 67.7, GLM-5.3 66.9, K3 67.5, 三家差距在 1 分以内. ProgramBench 拉开得最大: Step 5 80.5, K3 77.8, GLM-5.3 72.0. Terminal-Bench v2.1 Step 5 和 K3 并列 85.0. 跟上一代比, Step 3.7 Flash 的 Terminal-Bench 2.1 是 59.6, 到 Step 5 涨了 25.4 分; 两次的 harness 和推理档位页面都没对齐交代, 涨幅只能当量级看.

最弱的一格是 Terminal-Bench v4: Step 5 33.3, GLM-5.3 41.9, K3 12.6. 同一评测的新版本上三家分数散得很开, K3 只有 v2.1 分数的约 15%. 这类刚发布的评测各家适配程度不一, 单格差距的参考价值有限. SWE-Marathon v1.1 (Partial Score) 上 K3 84.4 明显领先, Step 5 72.7. MLS-Bench-Lite 也是 K3 领先 (48.3 对 40.5).

Step 5 领先的另外几格差距都小. 网络安全评测 CyberGym 上 Step 5 84.7, GLM-5.3 84.5, K3 80.0; 按 GLM-5.3 博客的脚注, 这是 1,507 个任务的单次 Pass@1, 0.2 分约合 3 个任务. SWE-Atlas 的问答和写测试两项, Step 5 分别是 63.6 和 50.8, 写测试一项三家都在 50.4 到 50.8 之间, 基本没有区分度; 问答一项 Step 5 领先约 4 分, 是这组里差距较大的一格.

### 3.3. 前端, 3D 与可编程硬件

页面的编程案例覆盖网页界面, 数据可视化, 调用 Blender 做 3D 资产并接进 Three.js 交互应用. Room Planner 案例从一张卧室照片生成可编辑的 3D 空间, 能拖动旋转家具, 再以第一人称走进去. 这些案例展示的是视觉输入加编程的组合, 没有对照协议, 只能当演示看.

可编程硬件案例更接近 agent 能力: 拿到开发文档和用户授权后, 模型直接调相机, COM 端口, 截图和模拟鼠标输入, 在设备上开发调试, 连续工作 3 小时以上, 根据设备反馈改代码. 这条路线和 Step 3.7 Flash 强调的 harness 适配一脉相承, 编程 agent 的一般问题见 [IDE 与 Coding Agent](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent.md).

## 4. 长程任务

### 4.1. 24 小时优化 MLA kernel

第一个长程实验是给 Step 5 一张 H100 和 24 小时, 从零优化一个 MLA 的 GPU kernel. 配置为 Head Dimension 512, Batch Size 1, 64 Heads, 8,192 Tokens. 每个模型独立跑 4 次取最好, Step 5 约 22 小时后做到前向加反向合计 508 TFLOPS, 是这组对比里最高的. MLA 在这里是被优化的作业对象, 页面没有说 Step 5 自己用 MLA.

头维 512 这个配置来自 MLA 的矩阵吸收形式. DeepSeek-V2 的 MLA 把 KV 压成维度 $d_c = 512$ 的潜向量 $c_t$, 另配 64 维的解耦 RoPE 分量 (arXiv 2405.04434). 推理时把 $W^{UK}$ 吸收进 query 投影, 所有头都对同一份 $c_t$ 做点积, 注意力退化成「多个 query 头, 一份 512 维 KV」的 MQA 形状, 机制推导见 [MLA: 低秩潜变量与解耦 RoPE](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/03-MLA-低秩潜变量与解耦RoPE/03-MLA-低秩潜变量与解耦RoPE.md) 与 [MLA 推理优化与工程实现](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-矩阵吸收与工程实现/04-MLA-矩阵吸收与工程实现.md). 头维 512 比常见的 128 大 4 倍, 一个 tile 的 Q, K, V 和累加器都更占共享内存和寄存器, FlashAttention 系列的默认分块直接套不上, 这正是它适合做优化作业的原因.

阶跃对 MLA 并不陌生. Step-3 报告专门拿 MLA 当 MFA 的对照: 8-bit KV 下 decode 时 MLA 的算术强度是 512, 即每读 1 字节 KV 要做约 512 次运算, MFA 是 128, Qwen3 的 GQA 是 32. 报告给的几款卡里, H800 的 roofline 是 591, H20 只有 74. 按这组数, MLA 在 H800 上接近平衡, 在 H20 上严重受算力限制; Step-3 把 MFA 定在 128, 是为了贴近 A800 (156) 和 910B (175) 的 roofline. 也就是说, MLA 在 Hopper 级卡上主要卡在算力上, kernel 写得好不好直接决定吞吐, 这和 Step 5 案例里用 TFLOPS 衡量结果是一致的.

508 TFLOPS 放在 H100 上的位置可以对一下. FlashAttention-3 论文给出 H100 SXM5 的 FP16 矩阵乘峰值 989 TFLOPS, FA3 前向最高 740 TFLOPS, 利用率 75%, 反向比 FA2 快 1.5 到 1.75 倍 (arXiv 2407.08608). 508 约为峰值的 51%, 而且是前向加反向合计; 反向有 5 次矩阵乘, 还要重算, 通常比前向难跑满. FA3 的计数口径是

$$\text{FLOPs}_{\text{fwd}} = 4\,B\,H\,N^2 d,\qquad \text{FLOPs}_{\text{bwd}} = 2.5\,\text{FLOPs}_{\text{fwd}} \tag{4}$$

带因果掩码时再除以 2. 代入 $B=1, H=64, N=8192, d=512$, 非因果前向约 8.8 TFLOP, 前向加反向约 30.8 TFLOP, 按 508 TFLOPS 算一次约 61ms; 因果情况减半. 页面没说用的是不是这套口径, 也没说是否因果, 这里的毫秒数只是量级. 从 24 小时里用了 22 小时这一点看, 优化还在往上走, 预算更长可能更高.

### 4.2. 自动化后训练: 53.3% 到 60%

第二个实验是 24 小时内通过自动化后训练提升 Qwen3-30B-A3B 基座在 AIME24 上的成绩. 模型可以调一个接生产数据的 API annotator, 自己决定怎么用 annotator, 怎么调后训练数据, 再按下游效果迭代. 结果从 53.3% 到 60%, 页面说与 Claude Opus 5 持平, 且消耗的 annotator tokens 更少.

AIME24 只有 30 题, 53.3% 是 16 题, 60% 是 18 题, 提升是 2 道题. 按二项分布, $p\approx0.57$ 时单次评测的标准误约 $\sqrt{0.57\times0.43/30}\approx 9.0$ 个百分点, 6.7 点的提升落在一个标准误以内. 页面没说 AIME24 是单次采样还是多次平均, 也没给 Opus 5 的具体分数和 token 数. 这个实验能说明 Step 5 能跑通「调数据, 训模型, 看结果」的闭环, 提升幅度本身还不足以下结论. Agentic RL 训练的一般做法见 [Agentic RL 训练](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.1-AgenticRL训练.md).

### 4.3. Pokémon Red

第三个是额外案例. 人类玩家通关《宝可梦 红》主线约 26 小时. Step 5 在没有专项优化的情况下跑了 3,000 多轮, 回放页写到 3,093 轮, 累计交互近 600 万 tokens, 第 3,082 步击败第三个道馆馆主拿到第三枚徽章, 主线进度约三分之一.

600 万 tokens 摊到约 3,093 轮, 每轮约 1,940 tokens. 1M 上下文按这个密度只装得下约 500 轮, 所以这个任务一定用了上下文压缩或外部记忆, 页面没说具体做法. 同期的 Kimi K3 报告给过一个参照: BrowseComp 在 300K token 时触发上下文压缩, 得 91.2%; 不做上下文管理, 直接用满 1M 窗口, 是 90.4%. 也就是说, 1M 窗口本身够不够用, 和任务的总 token 量有关, 到了几百万 token 的量级, 压缩和记忆是必需的. 难点在页面原话里: 记住早先的信息, 管理资源, 完成互相依赖的任务, 计划失败后重新规划, 对应 agent 的记忆与规划问题 ([记忆系统](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.1-记忆系统.md)). 这个案例没进对照表, 也没有其他模型同协议的成绩.

## 5. 专业工作与金融

### 5.1. 研究吞吐

专业工作部分是一组按领域排的制品墙: 工艺工程, 机械工程, 机器人 CNC 工作单元布局, 音乐视频情绪板, 舞台布置, 30 秒剪辑, 六西格玛 DMAIC 分析. 有数字的是一项气候研究: 1,000 个地点, 25 年, 一次 Agent Action 里完成 950 次 Web Fetch, 整理出 11 个变量, 30 万条月度记录. $1000 \times 25 \times 12 = 300{,}000$, 记录数正好是地点乘月份; 950 次抓取少于地点数, 说明部分来源一次覆盖了多个地点, 页面没展开.

另一项研究把文字分析, 可视化, 数据表, 方法说明和支撑材料合成一份交互报告, 读者可以从结论一路往下查到证据和方法. 这部分强调的是「结论可追溯」, 和下面金融评测的打分标准同源.

### 5.2. 四项金融评测

页面把金融定为这次的重点场景, 并把可靠的金融分析拆成三件事: 找到及时可信的信息, 正确使用会计, 估值和分析方法, 让结论经得起复核. 具体要求是关键结论能追溯到原始来源, 事实和假设分开, 关键计算能复现, 证据不足处和结论对假设的敏感性要保留.

「4 项金融评测」点得出名字的是: 自建 FinStepBench 的三个子项, 即 CorporateValuation (把财务数据和假设变成内部一致的预测并完成可复现估值), DeepResearch (从收集证据到写完研究报告的全流程), LiveSearch (图题出现, 正文未单独描述, 从名字看是实时信息检索); 外部评测 FrontierFinance, 由 Samaya AI 发布, 6 类投资场景, 220 道专家设计的题, 11,543 项评估标准. 四项的分数都只在图里, 正文没有转录数字, 也没有对照模型的具体值.

FrontierFinance 平均每题约 52.5 条标准. 作对照, RaR (Rubrics as Rewards, arXiv 2507.17746) 给每题配 7 到 20 条 rubric, 用加权通过率 $r=\sum_j w_j c_j / \sum_j w_j$ 当奖励. FrontierFinance 的标准密度高出约 2.6 到 7.5 倍, 意味着一道题的分数由很多细粒度检查点累加, 单个大错只扣其中一部分, 这和金融分析「过程可审计」的要求一致, 也意味着分数对「答对主结论」不那么敏感. 页面说 Step 5 在信息检索, 估值和完整研究流程上「较强」, 没给排名.

## 6. 对照总表与谱系位置

### 6.1. 表的结构

发布页末尾的总表三列是 Step 5 Preview (High), GLM-5.3 (Max) 和 Kimi K3 (Max). 表头第三列在抓取里被截成「Kim (Ma」, 同页图例写的是「Kimi K3 (Max)」, 表内多格也和 Kimi K3 自己报告的数一致 (见 6.3). 注意推理档位不对等: Step 5 用 High, 两个对手用 Max.

总表开头说覆盖 Reasoning, Coding, Agent, Finance, Multimodal 五类, 实际只有推理与知识 4 行, Coding 14 行, Agent 8 行, 共 26 行. Finance 和 Multimodal 两类没有出现在表里, 金融分数只在 5.2 的图里, 视觉评测没有任何数字.

### 6.2. 按组看胜负

逐行比较的结果:

| 分组 | 行数 | Step 5 单独第一 | 与 K3 并列第一 | K3 第一 | GLM-5.3 第一 | Step 5 高于 GLM-5.3 |
|---|---|---|---|---|---|---|
| 推理与知识 | 4 | 0 | 1 | 3 | 0 | 4 |
| Coding | 14 | 6 | 1 | 5 | 2 | 11 |
| Agent | 8 | 1 | 0 | 1 | 6 | 2 |
| 合计 | 26 | 7 | 2 | 9 | 8 | 17 |

有判断价值的几行:

| 评测 | Step 5 (High) | GLM-5.3 (Max) | Kimi K3 (Max) |
|---|---|---|---|
| HLE | 46.5 | 42.3 | 46.9 |
| AA-LCR v1.1 | 88.3 | 79.7 | 88.7 |
| ProgramBench | 80.5 | 72.0 | 77.8 |
| SWE-Marathon v1.1 (Partial) | 72.7 | 67.4 | 84.4 |
| Terminal-Bench v4 | 33.3 | 41.9 | 12.6 |
| GDPval-AA v2.1 (Elo) | 1566 | 1645 | 1524 |
| AutomationBench-AA | 51.0 | 62.2 | 58.3 |
| Toolathlon-Verified | 74.1 | 73.0 | 76.5 |

规律很清楚: 推理和编程上 Step 5 和 K3 一个梯队, 普遍高于 GLM-5.3; Agent 上 GLM-5.3 明显领先, 8 行里 Step 5 只在 Toolathlon-Verified 和 PresentBench 两行高于它, GDPval Elo 差 79, AutomationBench-AA 差 11.2 分. 页面把产品定位写成「面向真实世界 Agentic 任务」, 而表上最弱的恰好是 Agent 组. Step 5 对 K3 是 11 胜 2 平 13 负, 考虑到激活参数只有 K3 的约 26%, 这个结果和「智能效率」的主张相符.

GLM-5.3 这一列没法做同样的规模换算. Z.ai 的发布博客只说它和 GLM-5.2 共用一个基座, 主要改动在后训练, 总参和激活参数两篇博客都没给; 同家族的 GLM-5 论文给过 744B / 40B, 但那是另一个对象, 不能直接搬过来. 所以「Agent 组落后 GLM-5.3」这一条, 有多少来自规模, 多少来自后训练和环境覆盖, 这张表分不开. GLM-5.3 博客自己的表里, 它在 Toolathlon Verified 上也落后 K3 (73.0 对 76.5), 与本表一致.

### 6.3. 第三列和 Kimi K3 报告的对账

第三列有 7 格与外部材料吻合: GPQA Diamond 93.5, CritPt 23.4, DeepSWE 67.5, ProgramBench 77.8, MLS-Bench-Lite 48.3, Toolathlon-Verified 76.5 与 Kimi K3 技术报告表 2 一致, CyberGym 80.0 与 GLM-5.3 发布博客里的 K3 分数一致 ([Kimi K3 篇](../../02-kimi/kimi-k3/kimi-k3-analysis.md), [GLM-5.3 篇](../../13-glm/glm-5-3/glm-5-3-analysis.md)).

不一致的格大多能用版本解释. K3 报告的第三方分数取自 Artificial Analysis 截至 2026-07-23 的结果, 用 GDPval-AA v2 (K3 为 1686), AA-Briefcase (1548), AA-LCR (74.7); Step 5 表用 GDPval-AA v2.1 (截至 2026-09-20), AA-Briefcase v1.1, AA-LCR v1.1, 对应格是 1524, 1511, 88.7. SWE-Marathon 在 K3 报告里是 H20 标定分支上的 42.0, Step 5 表标的是 v1.1 的 Partial Score, 84.4. AutomationBench 在 K3 报告里是 600 题公开子集上的 30.8, Step 5 表里的 public 一行是 46.7. 解释不了的是 Terminal-Bench 2.1: K3 报告取跨 harness 最佳, 是 88.3, GLM-5.3 博客也引 88.3, Step 5 表写 85.0, 页面没说这格是谁跑的, 用什么 harness.

GLM-5.3 一列也可以这样对. CyberGym 84.5, DeepSWE 66.9, Toolathlon Verified 73.0 与 GLM-5.3 博客自报一致. Terminal-Bench 2.1 又对不上: GLM-5.3 博客自报 88.2, Step 5 表写 83.9. 两个对手在这一格上都比各自报告低 3 到 4 分, 方向一致, 最可能的解释是阶跃用自己的 harness 重跑了这一项, 而 K3 报告取的是多个 harness 里的最高分. 页面没写这一点, 所以 Step 5 和 K3 在这一格的「并列 85.0」只在阶跃的设置下成立.

### 6.4. Intelligence Index 与成本

发布页另给了 Artificial Analysis Intelligence Index 44 分, 并称同档智能下 Task Cost 明显更低, 配图标题是 Advancing the Pareto Frontier. 正文没给 Task Cost 的美元数, 也没列图上其他模型的坐标. 这一条的可核对部分只有 44 这个分数; 「更低」要看 Artificial Analysis 网站上的原始数据.

按 2.1 的估算, 27B 激活对 104B 激活, 每 token 计算差约 3.9 倍, 总 Task Cost 还取决于完成任务用了多少 token. Step 3.5 Flash 报告里列过的局限之一就是 token 效率, Step 5 是否改善了这一点, 页面没有给 token 用量数据.

### 6.5. 在谱系里的位置

Step 5 Preview 把阶跃的旗舰从 Flash 线的 196B / 11B 推到 600B / 27B, 激活比例降到约 4.5%, 上下文到 1M, 带视觉. 对照表上它在推理和编程上和 2.8T 的 Kimi K3 同一梯队, Agent 组明显落后 GLM-5.3, 这和它「面向 Agentic 任务」的定位之间还有距离.

长程案例里最可核的是 MLA kernel 的 508 TFLOPS, 约为 H100 稠密峰值的一半; 自动化后训练的提升只有 AIME24 上的 2 道题, Pokémon 和金融案例没有同协议对照. 层数, 专家配置, 注意力形式, 训练数据和后训练方法要等正式技术报告; 在那之前, Step 3.5 Flash 的报告是理解这条线工程取向最完整的参照.

## 参考文献

- StepFun. Step 5 Preview: One Step Forward — A New Pareto Frontier for Intelligence Efficiency. https://www.stepfun.com/step-5-preview (2026-09).
- StepFun. Step-3 is Large yet Affordable: Model-system Co-design for Cost-effective Decoding. arXiv:2507.19427 (2025).
- StepFun. Step 3.5 Flash. arXiv:2602.10604 (2026).
- Moonshot AI. Kimi K3 Technical Report. arXiv:2607.24653 (2026).
- DeepSeek-AI. DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model. arXiv:2405.04434 (2024).
- Shah, J. et al. FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision. arXiv:2407.08608 (2024).
- Chen, M. et al. Evaluating Large Language Models Trained on Code. arXiv:2107.03374 (2021).
- Gunjal, A. et al. Rubrics as Rewards: Reinforcement Learning Beyond Verifiable Domains. arXiv:2507.17746 (2025).
- Samaya AI. FrontierFinance. https://samaya.ai/blog/frontier-finance
