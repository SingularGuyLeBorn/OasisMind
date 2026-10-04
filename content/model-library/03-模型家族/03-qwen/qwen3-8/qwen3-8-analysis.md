---
title: "Qwen3.8-Max: 2.4T 参数的开源 Max 与真实工作 RL"
category: "模型库"
tags: ["Qwen", "技术解析"]
published: true
excerpt: "Qwen3.8-Max 在 Qwen3.5 骨架上放大到 2.4T 总参, 95B 激活, 是第一个开放权重的 Max 档模型; 训练侧的新东西是 Task/Workspace/Harness 三轴环境, 统一奖励和在线数据均衡."
---
# Qwen3.8-Max: 2.4T 参数的开源 Max 与真实工作 RL

材料是阿里云社区转载的 Qwen3.8-Max 发布博客 (2026-08-03), 没有技术报告, 专家数, 层数, 预训练数据, RL 算法名称和 rubric 细节都没写. 问题是: 在 Qwen3.5 骨架上放大到 2.4T 总参的开放权重 Max 模型, 训练侧换了什么, 分数在哪些任务上领先, 在哪些任务上落后.

## 1. 从 Qwen3 到 Qwen3.8: 旗舰线怎样一路变过来

### 1.1. 架构线: 从全注意力 MoE 到 3:1 混合

要看懂「基于 Qwen3.5 骨架」这一句, 得把前面几代排开. [Qwen3](../qwen3/qwen3-analysis.md) 的旗舰 235B-A22B 是 94 层全注意力 MoE, 每层 128 个路由专家选 8 个, 取消了共享专家, 改用 global-batch 负载均衡, 预训练约 36T token. 这一代的 KV cache 随长度线性增长, 每一层都要存.

[Qwen3-Next-80B-A3B](../qwen3-next/qwen3-next-analysis.md) 换了 token 混合方式: 48 层里每 4 层是 3 层 **Gated DeltaNet** 加 1 层 Gated Attention, MoE 改成 512 个专家选 10 个, 再加 1 个共享专家, 预训练 15T token. Gated DeltaNet ([Yang 等, 2024](https://arxiv.org/abs/2412.06464)) 每层维护固定大小的状态矩阵 $S_t$, 新 token 到来时先用衰减门 $\alpha_t$ 缩小旧状态, 再按 delta rule 只把「旧状态对当前 key 的预测误差」写回去:

$$
S_t=\alpha_t\big(I-\beta_t k_t k_t^\top\big)S_{t-1}+\beta_t k_t v_t^\top \tag{1}
$$

$k_t, v_t$ 是当前 token 的 key 和 value, $\beta_t\in(0,1)$ 是写入强度. 式 (1) 说明状态大小与序列长度无关, decode 时这些层不需要随长度增长的 KV cache; 代价是前缀被压进有限的矩阵, 逐 token 的精确检索要靠剩下那 1/4 的 Gated Attention 层. Gated Attention ([Qiu 等, 2025](https://arxiv.org/abs/2505.06708)) 是在 SDPA 输出之后乘一个由 query 决定的 sigmoid 门, 再进输出投影. 两者的推导分别见 [KDA 一篇](../../../../llm-guide/2-核心原理与架构/2.5-线性注意力与状态空间模型/2.5.1-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md) 和 [Gated Attention 一篇](../../../../llm-guide/2-核心原理与架构/2.2-注意力机制/2.2.2-多头注意力变体/05-Gated-Attention-SDPA输出门控/05-Gated-Attention-SDPA输出门控.md).

[Qwen3.5](../qwen3-5/qwen3-5-analysis.md) (2026-02) 把这套混合结构搬到旗舰 397B-A17B 上, 博客写的是「基于 Qwen3-Next」, 并把词表从 150k 扩到 250k, 语言从 119 种扩到 201 种. [Qwen3.6](../qwen3-6/qwen3-6-analysis.md) 的 27B 模型卡写明 64 层, 布局 16 × (3 层 Gated DeltaNet + 1 层 Gated Attention), 和 3.5 是同一套骨架. [Qwen3.7-Max](../qwen3-7/qwen3-7-analysis.md) 只走 API, 规格没有公开. Qwen3.8-Max 回到「基于 Qwen3.5」的说法, 所以从 3.5 起, 旗舰线的 token 混合大概率一直是 3:1 混合; 3.8-Max 是否保留这个比例, 博客没有写.

| 型号 | 总参 / 激活 | 激活比例 | token 混合 | 出处 |
| --- | --- | --- | --- | --- |
| Qwen3-235B-A22B | 235B / 22B | 约 9.4% | 全注意力, 94 层, 128 选 8 | Qwen3 技术报告表 2 |
| Qwen3-Next-80B-A3B | 80B / 3B | 约 3.75% | 3:1 混合, 48 层, 512 选 10 + 1 共享 | Qwen3-Next 模型卡 |
| Qwen3.5-397B-A17B | 397B / 17B | 约 4.3% | 「基于 Qwen3-Next」 | Qwen3.5 发布博客 |
| Qwen3.8-Max | 2.4T / 95B | 约 4.0% | 「基于 Qwen3.5」 | 本篇博客 |

表里的激活比例按总参与激活两个公开数相除. 从 Qwen3 到 Qwen3-Next, 激活比例从 9.4% 掉到 3.75%, 之后三代都稳定在 4% 上下. 换句话说, 3.5 之后的放大是在同一稀疏度上把总参和激活一起放大, 3.8-Max 没有继续往更稀疏走.

### 1.2. 同代的另一条架构线: Qwen3.8-Flash-Next

Qwen3.8 这一代其实有两条架构线. 二十多天后发布的 [Qwen3.8-Flash-Next 技术报告](../qwen3-8-flash-next/qwen3-8-flash-next-analysis.md) 用 125B 总参, 6B 激活, 外加放在主机内存里的 51B n-gram embedding 表, 并在 3:1 混合骨架上做了四处改动: 继续预训练阶段把全注意力层换成 Qwen Sparse Attention, 残差流加宽成四支 Gated Residual, 加单层 n-gram embedding, 优化器换成 Muon. 那份报告的对标对象是 397B-A17B 底座 (报告 Tab. 11 标为 Qwen3.7-Plus-Base), 按 6ND 粗算训练 FLOPs 约为其 1/9.

Max 的博客只说「基于 Qwen3.5」, 没有提 QSA, Gated Residual 或 n-gram embedding. 两份材料放在一起, 能确定的是: 同一代里, 小模型用了新架构, Max 用的是 3.5 的旧骨架. 2.4T 规模的预训练要提前很久启动, 新架构在 Flash-Next 上验证完的时间点, 大概赶不上 Max 的开训 (推测, 两份材料都没讲开训时间).

### 1.3. 训练线: 从数据配比到环境扩张

后训练这条线的变化比架构更连贯. Qwen3 的旗舰后训练是四段: Long-CoT 冷启动, 推理 RL, thinking 模式融合, 通用 RL; 小模型走 strong-to-weak 蒸馏. 到 Qwen3.5, 博客把后训练增益归因于「几乎所有能想到的 RL 任务与环境都做了扩展」, 这就是后面几代反复引用的 **environment scaling**. 3.5 还写了一套训推分离的异步 RL 框架, 列出 rollout router replay, 多轮 rollout locking 等技术, 称端到端加速 3–5×.

Qwen3.7-Max 在 environment scaling 上加了一条具体设计: 每个训练实例拆成 Task, Harness, Verifier 三个正交部件, 可以自由重组. 它还把 Qwen3.7-Max 本身接进 SWE 任务的 RL 监控流程, 自主回放训练轨迹, 标出 1,618 个 reward hacking 案例. Qwen3.8-Max 的三轴改成 Task, Workspace, Harness, Verifier 从轴里拿出去, 并入一个统一奖励系统. 这一代的变化落在第 3 节.

## 2. 规格与部署

### 2.1. 2.4T 与 95B 分别决定什么

博客给的结构信息只有 2.4T 总参, 95B 激活, 以及「Built upon the architectural foundation of Qwen 3.5」一句. 专家数, 每 token 选几个专家, 有没有共享专家, 层数, 词表, 报告里都没写. 相对 Qwen3.5-397B-A17B, 总参放大约 6 倍 ($2400/397\approx6.0$), 激活放大约 5.6 倍 ($95/17\approx5.6$). 这也是 Qwen 第一次开放 Max 档权重, 博客发布时说权重「下周」放出. 总参决定权重要占多少存储, 激活参决定每 token 前向要算多少. 按每 token 前向约 $2N_{\text{act}}$ FLOPs 的粗算 ($N_{\text{act}}$ 是激活参数量, 不计注意力的长度相关项), 3.8-Max 每 token 约 190 GFLOPs, 3.5-397B 约 34 GFLOPs, 相差约 5.6 倍.

权重的存储按每参数字节数算: BF16 约 4.8TB, FP8 约 2.4TB. 一台八卡 H200 共 $8\times141=1{,}128$GB, 八卡 B200 共 $8\times192=1{,}536$GB, FP8 权重都放不下, 还没算 KV cache. 开源权重对大多数用户意味着可以审查和微调, 真要服务这个规模, 至少是两台以上八卡机做专家并行.

### 2.2. 上下文窗口

正文没有正式声明上下文上限. 接入配置里 Codex 的 `context_window` 是 1,000,000, `effective_context_window_percent` 是 95; OpenClaw 配置的 `contextWindow` 也是 1,000,000, `maxTokens` 65,536. 评测表里的长上下文格子只到 256K: MRCR v2 256K (8-needle) 92.9, 低于 GPT5.6 Sol 的 93.8; LongBench v2 66.3, 低于 Opus4.8 的 69.1. 1M 长度上的检索质量, 博客没有给分数.

如果 3.8-Max 确实沿用 3:1 混合, 那么 KV cache 只在 1/4 的层上随长度增长, 这是 1M 窗口在服务端可行的主要原因. Qwen3.5 博客给过一组 decode 吞吐: 256K 上下文下, 397B-A17B 是全注意力 Qwen3-235B-A22B 的 7.2 倍, 32K 下是 3.5 倍, 长度越长倍率越大. 3.8-Max 没有给吞吐数字, 层数和 KV 头数也没有, 无法估算 1M 时 KV cache 的字节数.

## 3. 真实工作 RL

博客的 Work 一节是全文唯一讲训练方法的地方. 目标是同时扩大 RL 环境和 RL 算力, 让通用工作能力在 QwenWork, Claude Code, Codex, OpenClaw, Hermes 几种 harness 上一起提升. 博客把它拆成三个互相耦合的问题: 环境怎么扩, 奖励怎么统一, batch 怎么配. 关于这一套 RL 的一般背景, 见 [Agentic RL 训练](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.1-AgenticRL训练/13.4.1-AgenticRL训练.md).

环境按 Task, Workspace, Harness 三条轴各自分级. Task 从单任务到多任务, 再到跨多天的任务; Workspace 从多文件到分层目录, 再到复杂的异构目录; Harness 按类别, 版本和挂载的 skills 变化. 三轴独立, 组合数是乘法: 设三轴各有 $n_T, n_W, n_H$ 个取值, 可组合出的环境数是 $n_T n_W n_H$, 每加一个 harness 版本就多出 $n_T n_W$ 个环境, 不需要为每个新场景写一套定制集成.

和 Qwen3.7 的三分对照, 改动在第二条轴. 3.7 是 Task, Harness, Verifier: 同一道题可以换不同的工具接口跑, 同一个 harness 可以配不同的验证器. 3.8 把 Workspace 单独拿出来, 说明「在什么样的目录里干活」成了一个要专门扩张的变量. 真实办公任务的难点常在于找文件, 读懂目录结构, 在几百份异构文档里定位相关内容, 第 4.3 节那个一次找出 1,284 条条款的合规案例考的就是这个. Verifier 则不再是可替换的部件, 收进了下一节的统一奖励. 每条轴有多少个取值, 环境总数多少, 博客都没给.

### 3.1. 奖励: 三种验证收进一个系统

**Universal Reward System** 收进三种验证方式: 基于执行的检查 (跑代码, 跑测试), 按 rubric 对文本和渲染出来的视觉结果打分, 以及让 agent 去检查产物 (agentic inspection). rubric 可以自动扩展. 博客给出的理由是: 维护一批任务专用 verifier 时, 各自的打分尺度不一致, 跨环境的奖励就不能直接放进同一个 batch 比较.

rubric 奖励这一类做法, [Gunjal 等 (2025) 的 Rubrics as Rewards](https://arxiv.org/abs/2507.17746) 给过一个清楚的形式. 每道题由一个强模型生成 7 到 20 条自包含的判据, 每条带权重; LLM 裁判逐条判断回答 $\hat y$ 是否满足第 $j$ 条, 记 $c_j(x,\hat y)\in\{0,1\}$, 再按权重合成:

$$
r(x,\hat y)=\frac{\sum_{j=1}^{k} w_j\, c_j(x,\hat y)}{\sum_{j=1}^{k} w_j} \tag{2}
$$

$x$ 是题目, $k$ 是判据条数, $w_j$ 是第 $j$ 条的权重. 分母做了归一化, 判据条数和权重不同的题, 奖励落在同一个 $[0,1]$ 区间里. 这正是博客说的「尺度一致」要解决的问题. 论文的另一种做法是把全部判据交给裁判, 让它直接给一个整体分 (implicit aggregation). 论文在医学和科学两个领域做实验, 最好的变体相对直接让裁判打 Likert 分的基线, 在 HealthBench 上相对提升最高 31%. 这个结果和 3.8-Max 表里 HealthBench 60.2 (全表最高) 方向一致, 但博客没有说用的是哪种聚合, 裁判是哪个模型.

agentic inspection 这一项在 Qwen 自己的材料里有前例. Qwen3.7-Max 被当作审查者接进 SWE 任务的 RL 监控, 在超过 80 小时里调用工具一万多次, 新增 13 条启发式规则. 3.8 把「让 agent 检查」写进奖励系统本身, 用途可能更宽: 检查渲染出的网页, 3D 场景, 生成的报告是否符合要求 (推测). LLM 裁判和 agent 检查都会被策略针对, 奖励模型过优化的一般机制见 [Best-of-N 与奖励模型过优化](../../../../llm-guide/4-后训练/4.7-AI反馈与奖励过优化/4.7.2-Best-of-N与奖励过优化/01-Best-of-N-奖励模型过优化/01-Best-of-N-奖励模型过优化.md). 博客没有给 hacking 率或裁判一致性的数字.

### 3.2. 在线数据均衡: batch 的组成怎样影响梯度方差

博客说在线数据均衡器让每个 batch 在任务类型, 难度, workspace, harness 四个维度上分布均衡, 目的是压低 batch 之间的梯度方差, 让 RL 算力能继续加上去. 这句话背后有两个机制.

第一个是分层抽样. 设 batch 有 $B$ 条样本, 来自 $K$ 个层 (一个层就是任务类型, 难度, workspace, harness 的一个组合), 第 $k$ 层占比 $w_k$. 把单条样本的梯度投影到某个方向上, 记第 $k$ 层内的均值 $\mu_k$, 方差 $\sigma_k^2$, 总均值 $\mu=\sum_k w_k\mu_k$. 随机抽样时, batch 平均梯度的方差是

$$
\mathrm{Var}_{\text{rand}}=\frac{1}{B}\Big[\underbrace{\sum_k w_k\sigma_k^2}_{\text{层内}}+\underbrace{\sum_k w_k(\mu_k-\mu)^2}_{\text{层间}}\Big] \tag{3}
$$

按比例分层抽样 (每个 batch 里第 $k$ 层恰好占 $w_k B$ 条) 时, 层间项消失, 只剩 $\frac{1}{B}\sum_k w_k\sigma_k^2$. 这是抽样调查里的标准结果 ([Cochran, 1977](https://www.wiley.com/en-us/Sampling+Techniques%2C+3rd+Edition-p-9780471162407)). 式 (3) 说明, 不同 harness, 不同 workspace 上的梯度方向差得越远, 层间项越大, 随机拼 batch 带来的额外方差越大. 手算一个两层的例子 (仅示意): $w_1=w_2=0.5$, $\mu_1=1$, $\mu_2=-1$, $\sigma_1=\sigma_2=1$, $B=64$; 随机抽样时方差是 $(1+1)/64\approx0.031$, 分层后是 $1/64\approx0.016$, 减半.

第二个机制在难度这一维. 博客没说用什么 RL 算法; 如果是 [GRPO](../../../../llm-guide/4-后训练/4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md) 这类组内相对优势的算法, 同一道题采 $G$ 条回答, 第 $i$ 条的优势是

$$
\hat A_i=\frac{r_i-\mathrm{mean}(r_1,\dots,r_G)}{\mathrm{std}(r_1,\dots,r_G)} \tag{4}
$$

$r_i$ 是第 $i$ 条回答的奖励. 全对或全错时分子为零, 这道题占着 batch 的位置却不贡献梯度. 一个 batch 里这类题越多, 有效样本数 $B_{\text{eff}}$ 越小, 式 (3) 里的 $1/B$ 实际变成 $1/B_{\text{eff}}$. [DAPO (Yu 等, 2025)](https://arxiv.org/abs/2503.14476) 的 Dynamic Sampling 是事后处理: 过采样, 把准确率为 0 或 1 的题滤掉, 直到 batch 填满. 按难度均衡是事前处理: 采样之前就控制每个难度档的比例. 环境种类一多, 随机采样很容易让某几类题扎堆, 事前控制的价值也就更大. 均衡器怎么估计难度, 是否同时丢弃全对全错的组, 博客都没写.

要补一句边界. 「高度均衡」如果指各层等比例, 而训练数据里各层的自然比例并不相等, 那么 batch 梯度的期望也从 $\sum_k w_k\mu_k$ 变成了各层等权平均, 优化目标本身跟着变了, 效果不只是降方差. 这是一个选择, 博客没有交代选的是哪种比例. Fig 1 说随 RL 规模扩大, 几十个内部和公开的工作基准稳定上升; Fig 2 说各 harness 上表现接近. 两张图只有曲线, 博客没有给数值.

### 3.3. MoE 上做 RL 的另一个不稳定源

batch 组成之外, MoE 的 RL 还有一个专门的不稳定源: 同一个 token 在推理引擎里和在训练框架里可能被路由到不同专家. [Ma 等 (2025)](https://arxiv.org/abs/2510.11370) 分析过这个问题: 训练和推理两侧的路由行为不一致, 即便条件完全相同, 重复前向也可能选出不同的专家; 这会放大重要性比率的偏差, 严重时 RL 训练崩溃. 他们的 Rollout Routing Replay (R3) 在推理时记录路由分布, 训练时回放, 显著降低了训推两侧策略的 KL. Qwen3.5 博客里的 rollout router replay 列在异步 RL 框架的技术清单中, 名字和用途都对得上这一类做法.

3.8-Max 有 2.4T 总参, 专家数大概比 3.5 多, 路由不一致的问题不会消失. 博客讲 RL 系统时只谈了环境, 奖励和 batch 均衡, 没有说 router replay 是否沿用, 也没给训推 KL 之类的稳定性指标. 博客把「让 RL 算力能继续加上去」归功于在线均衡器, 但 MoE 路由一致性这一面报告里没写.

## 4. 长程案例

### 4.1. 编程: 三个有外部反馈的闭环

第一个案例是 oh-my-cli: 从空仓库开始做一个能自我演化的 harness. 执行循环由 issue 状态机, 调度器, 监控和 watchdog 组成, 需求进 GitHub Issues 后由 agent 领取, 状态按 ready → leased → active 流转, 实现完成后触发 E2E 和 CI, 通过才合并 PR. 小标题写「10 天以上」, 正文给出截至 2026-07-30 约 16 天, 累计 265 次 commit, 127 个 PR, 151 个 issue, 完整轨迹在 GitHub 公开. 这是全文唯一能从外部完整核查的案例.

第二个案例是复现论文 「Unified Data Selection for LLM Reasoning」 再改进. 起点只有论文和 GPU, 约 125 小时里写了约 7,600 行代码, 1,100 多次操作, 33 轮 GPU 训练. 前约 37 小时复现了论文六条主要结论 (用选出的数据微调 Qwen3-8B, 论文方法在 AIME24 上比随机选数高 7.7%); 后约 88 小时跑了四轮, 共 18 个自创想法. 基线是复现出的 49.58%, 四轮最好结果依次是 50.42%, 51.67%, 51.25%, 52.29%, 第三轮低于第二轮.

最终提升 2.71 个百分点. AIME24 只有 30 题, 一题约 3.33 分, 2.71 分约合 0.8 题. 49.58% 不是 1/30 的整数倍, 说明分数是多次采样的平均; 多次采样能压低同一道题上的采样噪声, 却压不住「只有 30 道题」带来的题目集噪声. 按二项分布粗算, 30 题, 正确率 0.5 时单次评测的标准差约 $\sqrt{0.25/30}\approx9.1$ 个百分点 (按 30 题估算). 2.71 分的改进要放在这个量级下看.

第三个案例是天池 WWW2025 多模态对话意图识别比赛, 526 支人类队伍, 限时 24 小时. 模型用 BERT, MacBERT, RoBERTa 处理文本, 微调 Qwen2.5-VL-7B 处理截图, 主模型拿不准的图片交给 Chinese-CLIP, 最后加权投票, 权重用交叉验证定. 45 次提交里准确率从 0.60 升到 0.853, 超过 458 支队伍 (87%). 三个案例共同的条件是有外部反馈可以逐轮修正: CI 结果, GPU 实验分数, 排行榜.

### 4.2. 芯片与电商: 几百轮之后仍有结构性改进

芯片案例的目标是 GCD/RSA 加密硬件加速器, 集成模幂和模乘. 约束是在 cocotb 随机验证下 4, 6, 8, 16 位配置都要逐位正确, 同时让 Yosys 综合后的门数尽量少, 面积按 16 位配置计. 工具链是 Iverilog, Yosys, OpenROAD, 起点只有任务描述, 空模块模板和评测脚本, 没有参考设计. 一次连续运行约 500 轮, 71 次评测, 13 个里程碑, 门数从第一个可用设计的 8,298 降到 678.

| 阶段 | 轮次 | 门数 | 改了什么 |
| --- | --- | --- | --- |
| 算法改写 | 第 22 轮 | 8,298 → 2,010 | 16 位硬件模除器换成迭代移位减法 |
| 冗余消除与位宽修剪 | 35–48 | 2,010 → 1,304 | 绕过 REDUCE 级, 两个 reduction 模块合并 |
| 寄存器与 FSM 修剪 | 60–113 | 1,304 → 907 | 去掉冗余寄存器, 偶数提前退出, 减法器最高位当比较器 |
| 模块融合 | 170–425 | 907 → 765 | 乘法器内联进模幂 FSM, 全局共享一个减法器 |
| 门级精炼 | 443–500 | 765 → 678 | 共享 NOR 树, abs-sub 拆分 |

第 22 轮一步减掉 6,288 门, 占总降幅 $8{,}298-678=7{,}620$ 门的 82.5% (按表计算), 和博客说的「80% 以上」一致. 后面四个阶段加起来只减了 1,332 门, 但跨了近 480 轮, 最后一段在 443 到 500 轮之间还减了 87 门. 物理实现上, OpenROAD 配 Nangate45 工艺库, die 从 106×106 µm² 缩到 46×46 µm², $(46/106)^2\approx0.19$, 面积减少约 81%, 和博客一致; 线长从 33,369 µm 降到 4,187 µm, 时序从 −4.46 ns 的负裕量变为 500 MHz 下收敛 (+0.66 ns). 博客说 678 门「领先所有被评模型」, 其他模型的门数没有列.

电商案例叫 E-Commerce Bench, 模拟 365 天经营, 基于淘宝天猫脱敏交易数据, 12 种店型, 60 个品类, 近 600 个供应商, 7,000 个商品, 起始资金 ¥100,000. 供应商按博弈论设定不同性格和让步策略, 其中暗藏 152 个欺诈商户, 骗局类型包括会员费陷阱, 低价诱饵和货不对板. Qwen3.8-Max 最终余额 ¥416,252 (4.16 倍), 比第二名 GLM 5.2 高 38%, 比 Qwen3.7-Max 高 152%, 交互超过 2,000 轮. 按这两个百分比反推, GLM 5.2 约 ¥30.2 万, Qwen3.7-Max 约 ¥16.5 万 (按博客百分比反推). 这是内部基准, 识别出多少欺诈商户, 其他模型的完整成绩, 博客都没列.

### 4.3. 办公与量化: 展示案例和表内分数分开看

职业广度部分列了六个展示案例: 合规审查一次从数百份文档里找出 1,284 条相关条款, 不到一小时 (团队约需一周); 8 屏银行 App 原型零轮修改; 读一百多份供应简报出 26 道菜单, 食材成本率 33.8%; 从图纸在浏览器里重建 30 层办公楼的抗震模型; 把 2D 康复评估表做成 3D 解剖演示; 每名球员约 8,400 个攻防回合生成战术画像. 这些案例没有对照组, 也没有评审协议, 作用是展示覆盖面. 表里能对应上的是 JobBench (53.4, 低于 Fable5 的 57.4) 和 CoWorkBench (74.8, 低于 Fable5 的 75.9).

量化案例用 **Dynamic Workflows** 做编排, 把编排逻辑写成可复现的程序. 深度方向是单会话做 ETF 轮动策略: 设计期和验证期指标错位 (过拟合信号) 时逐轮剪掉冗余因子; 多条路径收敛到同一组信号时加多种子并集验证. 广度方向从动量, 价值, 质量, 投资, 低风险, 情绪六类因子出发, 各拆 50 个方向, 派出约 330 个子 agent, 跑约 6,000 次回测, 选出的因子超额 Sharpe 在 0.64 到 1.48 之间, IC 在 0.010 到 0.014 之间.

6,000 次回测里挑最好的, 有多重检验偏差. 假设所有候选都没有真实超额, 各自的 Sharpe 估计近似独立同分布的正态变量, 标准差为 $\sigma_{SR}$, 那么 $N$ 个里的最大值约在 $\sqrt{2\ln N}\,\sigma_{SR}$ 附近; $N=6{,}000$ 时 $\sqrt{2\ln 6000}\approx4.2$. [Bailey 和 López de Prado (2014)](https://doi.org/10.3905/jpm.2014.40.5.094) 的 deflated Sharpe ratio 就是按试验次数把这一项扣掉再判断显著性. 博客没有给回测区间长度, 也没有样本外检验, 0.64 到 1.48 扣掉选择偏差后还剩多少, 无法判断. 330 个子 agent 的方向互相相关, 实际的独立试验数小于 6,000, 偏差会比这个估计小一些.

## 5. 评测

### 5.1. 文本与 agent 表: 31 行里 6 行第一

第一张大表五列: Opus4.8, Fable5, GPT5.6 Sol (max), Qwen3.7-Max, Qwen3.8-Max; 行分 Coding Agent 12 行, General Agent 9 行, General Capabilities 10 行. 下面只摘有判断价值的行.

| 基准 | Opus4.8 | Fable5 | GPT5.6 Sol | Qwen3.7-Max | Qwen3.8-Max |
| --- | --- | --- | --- | --- | --- |
| SWE-bench Pro | 69.2 | 80.0 | 64.6 | 60.6 | 67.7 |
| DeepSWE 1.1 | 59.0 | 70.0 | 73.0 | 21.6 | 56.6 |
| FrontierSWE | 70.0 | 88.8 | -- | 40.7 | 73.5 |
| Terminal Bench 2.1 | 84.6 | 84.6 | 88.8 | 74.5 | 86.6 |
| PaperBench | 80.3 | 88.8 | 90.5 | 64.8 | 93.0 |
| JobBench | 48.4 | 57.4 | 45.4 | 31.3 | 53.4 |
| WideSearch | 72.9 | 81.2 | -- | 75.2 | 81.9 |
| IFBench | 62.2 | 63.5 | 72.7 | 79.1 | 82.8 |
| HLE | 45.7 | 53.3 | 47.2 | 41.4 | 43.6 |
| HealthBench | 52.4 | -- | 55.3 | 54.5 | 60.2 |

Qwen3.8-Max 独占第一的 6 行是 PaperBench (93.0), WideSearch (81.9), IFBench (82.8), HealthBench (60.2), PLawBench (73.2), PRBench-Finance (58.3); PRBench-Legal 和 Fable5, GPT5.6 三家并列 57.6. Fable5 独占第一的有 14 行, 集中在 coding 和 agent 组. 对 Qwen3.7-Max, 31 行全部上升, DeepSWE (+35.0) 和 FrontierSWE (+32.8) 涨得最多. 其中 WideSearch 和 HealthBench 两行的第一是在缺一个对手的情况下拿的 (GPT5.6 和 Fable5 分别空格).

Coding 组 12 行里 Qwen3.8-Max 只赢 PaperBench 一行. 四个 Qwen 自建基准 (QwenSWEBench, QwenQoderBench, QwenReactBench, QwenSVGBench) 上它一个第一都没拿, 前三个输给 Fable5, 最后一个输给 GPT5.6, 自建基准没有偏向自家模型. 知识类的 HLE 43.6, 比上一代只高 2.2, 落后 Fable5 近 10 分; 指令遵循和医疗, 法律, 金融这类 rubric 评分的专业题领先. 这个形状和第 3.1 节的统一奖励对得上: rubric 能覆盖的专业写作类任务涨得多, 长链编码 agent 仍落后 Fable5 一截.

几处协议细节影响读数. Agents' Last Exam 报 Pass 和 Score 两个数, Qwen3.8-Max 的 Pass 和 Opus 并列 27.0, Score 却是 52.4 对 45.1. MLS-Bench-Lite 用 Claude Code 跑, 5 小时超时, `max_tokens=131072`, 其他模型分数取自官方榜单, 两边条件不一定相同. Automation-Bench 只用 600 题公开子集.

### 5.2. Qwen3.7-Max 这一列与模型卡的差异

表里 Qwen3.7-Max 一列可以和 [Qwen3.7 模型卡](../qwen3-7/qwen3-7-analysis.md) 对照. SWE-bench Pro 60.6, NL2Repo 47.2, GPQA Diamond 92.4, HLE 41.4, HLE w/ tools 53.5, IFBench 79.1, 两边一致. 两格对不上: SkillsBench 这里是 61.2, 模型卡是 59.2; CoWorkBench 这里是 64.6, 模型卡是 67.2. 两份材料都没说评测版本变过, 引用 Qwen3.7-Max 这两项时要注明取自哪份材料.

另有几行名字相近, 口径不同. Terminal Bench 这里是 2.1 版 (Qwen3.7-Max 74.5), 模型卡是 2.0 版 (69.7); MRCR v2 这里是 256K 8-needle (86.7), 模型卡是 128k (90.4); QwenSVGBench 这里 Qwen3.7-Max 是 1499, 模型卡的 QwenSVG 是 1608, 两个 Elo 来自不同的对手池, 只在同一张表里才有意义.

### 5.3. 多模态表: 感知领先, 视觉 agent 落后

第二张表六列: Opus4.8, Fable5, Gemini3.1-Pro, GPT5.6-Sol, Qwen3.7-Plus, Qwen3.8-Max, 共 55 行, 分六组. 按每格第一个数算, Qwen3.8-Max 独占第一约 36 行: 文档与办公 7 行全胜, 感知与定位 10 行赢 8 行, 多模态推理 12 行赢 10 行, 真实世界与空间 4 行赢 3 行, 视频 10 行赢 5 行, 视觉 agent 与编码 12 行只赢 3 行 (OSWorld-Verified, QwenBlenderBench, Parametric CAD).

| 基准 | Opus4.8 | Fable5 | Gemini3.1-Pro | GPT5.6-Sol | Qwen3.7-Plus | Qwen3.8-Max |
| --- | --- | --- | --- | --- | --- | --- |
| Dense200 | 20.8 | 31.1 | 69.7 | 55.3 | 60.7 | 87.0 |
| VLMsAreBiased | 43.8 | 61.2 | 74.1 | 59.8 | 36.6 | 88.3 |
| OSWorld-Verified | 83.4 | 85.0 | 76.2 | 83.2 | 73.3 | 86.1 |
| ScreenSpot Pro | 82.3 | 87.3 | 68.1 | 81.3 | 79.0 | 84.5 |
| MobileWorld | 67.5 | 85.5 | 58.1 | 76.9 | 51.2 | 77.8 |
| RecreationBench | 48.0 | 56.1 | 16.2 | 47.6 | 30.2 | 51.7 |

看图, 读文档, 数数, 定位这类感知任务领先最明显, Dense200 比次高的 Gemini 高 17.3 分. 需要多步操作的 agent 任务 (ScreenSpot Pro, WebArena, MobileWorld, RecreationBench) 大多输给 Fable5. RecreationBench 是博客新提出的黑盒复刻基准: 模型只能通过交互观察一个正在运行的应用, 没有源码, 不能联网, 然后从零重建; 正文说 Qwen3.8-Max 达到「frontier-level」, 表上 51.7 低于 Fable5 的 56.1. OSWorld 2.0 报 binary / partial 两个数, binary 是拿满奖励的任务占比, Qwen3.8-Max 是 19.4 / 46.7, binary 低于 Opus 的 20.6. 视频组 Opus4.8 的 MLVU 只有 53.4, 其他有分数的模型都在 84 以上, 可能是协议没对齐 (推测).

## 6. 接入与谱系位置

### 6.1. 接入: 推理档位, 历史 thinking 与 harness

API 支持三档 **`reasoning_effort`**: xhigh (默认, 复杂任务), medium, low. 这是推理时多花算力换质量的旋钮, 属于 TestingTime, 和第 3 节 RL 阶段的环境扩张是两条轴. 表头 GPT5.6 Sol 标了 (max), 其他列没有注明推理档位, Qwen3.8-Max 的分数用的大概是默认的 xhigh (推测, 博客没写评测档位).

**`preserve_thinking`** 对所有负载默认开启, 历史轮次的 thinking 内容保留在上下文里. 这个开关在 Qwen3.6 就有, 当时要客户端显式打开, 推荐用于 agent 任务, 目的是减少多轮 agent 里的重复推理, 也更好复用 KV cache. 3.8 改成默认开启; 示例代码里 `"preserve_thinking": True` 仍是注释掉的, 说明服务端默认打开, 客户端不必再传. 和 3.6 一样, 客户端框架回放历史时如果删掉 reasoning 字段, 这个开关就不起作用.

模型名是 `qwen3.8-max`. QwenCloud 同时兼容 OpenAI 的 chat completions 和 responses 协议, 以及 Anthropic 协议, 所以 Claude Code, Codex, OpenClaw, Qwen Code, Qoder 都能直接接. 这和 RL 环境里的 Harness 轴是同一批名字: 训练时让模型在这些 harness 上一起练, 发布时给出它们的接入配置. 用户反馈页里 Qoder 负责人说双语场景 token 效率比 Opus4.8 高 60%, 等效推理速度高 28%, 这是具名引言, 没有测量协议.

### 6.2. 在谱系里的位置

Qwen 旗舰线的训练重心, 从 Qwen3 的预训练数据配比, 移到了 3.5 之后 RL 阶段能构造多少种环境. 3.5 提出 environment scaling, 3.7 用 Task/Harness/Verifier 三分组合环境, 并开始用模型监控 reward hacking; 3.8-Max 把三轴改成 Task/Workspace/Harness, 把验证收进统一奖励, 再用在线均衡控制 batch 组成. 训练方法的描述一代比一代具体, 但每一代都只给设计, 不给数量和消融.

分数上, 3.8-Max 在感知, 文档和 rubric 评分的专业题上已经领先对手, 长链编码 agent 和多步视觉 agent 仍落后 Fable5. 架构没有跟进同代 Flash-Next 的新设计, 规模放大是在 3.5 的稀疏度上做的. 开放 Max 档权重是这一代最大的变化; 2.4T 的规模决定了能本地部署它的用户很少, 开放权重更多是给研究和微调用.

## 参考文献

- Qwen Team. Qwen3.8-Max: A New Bar for Coding and Cowork. Alibaba Cloud Community, 2026-08-03. https://qwen.ai/blog?id=qwen3.8
- Qwen Team. Qwen3 Technical Report. [arXiv:2505.09388](https://arxiv.org/abs/2505.09388), 2025.
- Yang, S., Kautz, J., Hatamizadeh, A. Gated Delta Networks: Improving Mamba2 with Delta Rule. [arXiv:2412.06464](https://arxiv.org/abs/2412.06464), 2024.
- Qiu, Z. et al. Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free. [arXiv:2505.06708](https://arxiv.org/abs/2505.06708), 2025.
- Gunjal, A. et al. Rubrics as Rewards: Reinforcement Learning Beyond Verifiable Domains. [arXiv:2507.17746](https://arxiv.org/abs/2507.17746), 2025.
- Yu, Q. et al. DAPO: An Open-Source LLM Reinforcement Learning System at Scale. [arXiv:2503.14476](https://arxiv.org/abs/2503.14476), 2025.
- Ma, W. et al. Stabilizing MoE Reinforcement Learning by Aligning Training and Inference Routers. [arXiv:2510.11370](https://arxiv.org/abs/2510.11370), 2025.
- Cochran, W. G. Sampling Techniques, 3rd ed. Wiley, 1977.
- Bailey, D. H., López de Prado, M. The Deflated Sharpe Ratio: Correcting for Selection Bias, Backtest Overfitting and Non-Normality. Journal of Portfolio Management 40(5), 2014.
