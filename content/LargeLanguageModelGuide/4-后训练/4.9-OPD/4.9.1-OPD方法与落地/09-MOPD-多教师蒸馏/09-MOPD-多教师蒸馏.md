---
title: "09 · MOPD: 多教师在线蒸馏"
category: "后训练"
published: true
tags: ["MOPD", "OPD", "多教师", "On-Policy Distillation", "DeepSeek-V4", "Kimi K3", "MiMo-V2-Flash"]
excerpt: "分域 RL 训出一排专家, 再让学生在自己的 rollout 上按题目找对应教师做 reverse KL, 把多份专家并进一份权重. DeepSeek-V4 用全词表 logit, Kimi K3 与 MiMo-V2-Flash 用 sampled-token 的对数比当优势. Ma 等在 Qwen3-30B-A3B 上的对照里, MOPD 归一化分 0.937, 高于 Mix-RL 的 0.882 与参数平均的 0.328."
---
# MOPD: 多教师在线蒸馏

> 相关阅读: [01 OPD 基础原理](../01-OPD基础原理/01-OPD基础原理.md) · [07 OPD 失败模式](../07-OPD-失败模式/07-OPD-失败模式.md) · [10 OPD 报告落地对照](../10-OPD-报告落地对照/10-OPD-报告落地对照.md)

本文的材料是三份技术报告和一篇方法论文: DeepSeek-V4 技术报告 §5.1-5.2, Kimi K3 技术报告 §4.1, MiMo-V2-Flash 技术报告 (arXiv:2601.02780) §4.1 与 §4.4, 以及 Xiaomi 的 Ma 等人的 *MOPD: Multi-Teacher On-Policy Distillation for Capability Integration in LLM Post-Training* (arXiv:2606.30406). 要回答的问题是: 分域 RL 已经训出一排专家之后, 怎样把它们并进一份权重而不掉分, 几家的做法在损失, 裁剪和工程上各差在哪.

记号沿用 [01](../01-OPD基础原理/01-OPD基础原理.md): 学生 $\pi_\theta$, 提示 $x$, 学生自己采样的回答 $y$, 第 $t$ 个位置的前缀 $y_{<t}$, $\mathrm{sg}[\cdot]$ 为 stop-gradient.

## 合并问题

### 已有的四类合并办法

不同任务域的 RL 流程差别很大: 数学用可验证答案的 RL, 软件工程在可执行沙箱里做 agent RL, 指令跟随和创意写作用 rubric 打分, 搜索 agent 在网页环境里训. 每条流程单独跑都能把本域推上去, 最终交付的却只能是一个模型. Ma 等把已有的合并办法归成四类, 并按三个维度对比 (原文 Table 1):

| 方法 | 稠密优化信号 | on-policy | 各域可并行开发 |
|------|------------|-----------|--------------|
| Param-Merge (权重平均或任务向量) | 否 | 不适用 | 是 |
| Off-Policy Finetune (拿教师 rollout 做 SFT) | 是 | 否 | 是 |
| Mix-RL (各域提示混进一个数据集联合 RL) | 否 | 是 | 否 |
| Cascade RL (各域按顺序 RL) | 否 | 是 | 否 |
| MOPD | 是 | 是 | 是 |

各自的问题: Mix-RL 里各域的训练信号互相干扰, 出现跷跷板效应, 联合模型低于各域专家; Cascade RL 训后面的域时前面的能力会衰退, 总训练链路长, 稳定性风险累积; Off-Policy Finetune 学的是教师写过的前缀, 推理时学生走自己的前缀, 有暴露偏差; Param-Merge 在权重空间融合, 结果不稳定, 很难同时追平所有教师. 权重合并这一支本身有不少变体: Model Soups 平均同一初始化下各自微调的权重, 任务向量算术在权重空间加减「任务向量」, TIES-Merging, DARE, AdaMerging 等后续方法处理参数冲突. 它们都不需要额外训练, 代价是结果依赖合并系数. 经典蒸馏 (Hinton 等, Kim 与 Rush 的序列级蒸馏) 在固定的教师生成语料上最小化 forward KL, 属于 off-policy; MiniLLM 与 Agarwal 等的 on-policy 蒸馏改为在学生 rollout 上由教师打分, 但只有一个教师, 一个域. MOPD 保留「学生采样, 教师打分」的模板, 把教师扩展成按提示路由的多个域教师.

**MOPD 的共同骨架**

MiMo-V2-Flash 报告 §4.1 把合并面临的问题概括为「能力失衡」(提升一项导致其他回退) 和「学习低效」(合并多个专家时没有用足训练信号).

多教师在线蒸馏 (Multi-Teacher On-Policy Distillation) 的共同骨架是三段: 通用 SFT, 从 SFT 检查点出发分域做 RL 得到教师, 最终学生 (同样从 SFT 检查点初始化) 在自己的 rollout 上接受对应域教师的逐 token 监督. 轨迹来自学生, 监督来自多个冻结的教师. 合并发生在策略空间: 每条提示路由到一位教师, 梯度在混合域的 batch 上累加到同一份参数.

名字上有一处差别. DeepSeek-V4 报告把这一步仍叫 OPD (multi-teacher OPD), Kimi K3 与 MiMo-V2-Flash 叫 MOPD. 下面分家写, 最终再并表对照.

**DeepSeek-V4: 全词表 reverse KL**

### 专家与目标

DeepSeek-V4 的后训练流程沿用 V3.2, 关键替换一处: 混合 RL 阶段整段换成 OPD. 专家训练按域进行, 每个专家先在本域数据上 SFT, 再用 GRPO 做 RL, 超参与之前的工作接近. 推理力度也通过专家区分: V4-Pro 与 V4-Flash 都支持 Non-think, Think High, Think Max 三档, 每档在 RL 时用不同的长度惩罚和上下文窗口, 以 `<think>` 与 `</think>` 标记响应格式区分; Think Max 还在 system prompt 开头加一段固定指令 (报告 Table 3). 难验证任务不训标量奖励模型, 改用 rubric 引导的数据和生成式奖励模型 (GRM) 评轨迹, 并对 GRM 本身做 RL.

给定 $N$ 个专家 $\{\pi_{E_1},\dots,\pi_{E_N}\}$, 报告式 (29) 是

$$
\mathcal L_{\mathrm{OPD}}(\theta)=\sum_{i=1}^{N}w_i\cdot D_{\mathrm{KL}}\bigl(\pi_\theta\,\|\,\pi_{E_i}\bigr) \tag{1}
$$

$w_i$ 是各专家的权重, 报告只写「通常由专家的相对重要性决定」. reverse KL 要求轨迹从学生采样. 报告的解释是统一策略按当前任务语境对齐相应专家, 数学题对数学专家, 代码题对代码专家; 在实现上, 这相当于与当前任务无关的专家权重为 0. 这一阶段用了十余个覆盖不同领域的教师.

**为什么不用 sampled-token 优势**

报告批评了先前工作的常见简化: 把全词表 KL 收成每个位置只看已采样 token 的估计, 复用 RL 框架, 把

$$
\mathrm{sg}\Bigl[\log\frac{\pi_{E_i}(y_t\mid x,y_{<t})}{\pi_\theta(y_t\mid x,y_{<t})}\Bigr] \tag{2}
$$

当作逐 token 的优势. 这样省资源, 但梯度估计方差高, 训练常常不稳. V4 因此采用全词表 logit 蒸馏, 每个位置保留完整分布计算 reverse KL. 式 (2) 正是后面 K3 与 MiMo 使用的形式 (各自再加裁剪), 两条路线的分歧就在这里. 各种 KL 估计器的方差比较见 [07](../07-OPD-失败模式/07-OPD-失败模式.md) 第 1 节.

### 让全词表可行的工程

全词表的代价在 logit 的体积. §5.2.2 的说法是, 词表 $|V|>100\mathrm{k}$ 时, 为所有教师物化 logit 即使落盘也不可行. 他们的办法:

- 教师权重卸到集中式分布式存储, 教师前向时按需加载, 用 ZeRO 式参数分片减轻 I/O 和内存压力. 教师数量实际上不设上限, 单个教师可达万亿参数.
- 前向时只把教师最终一层 hidden state 写进集中缓冲. 训练时取回, 过对应教师的预测头, 当场重建完整 logit. 重计算开销可以忽略.
- 分发数据时按教师下标给样本排序, 保证每个 mini-batch 里每个教师头只加载一次, 设备上同一时刻最多驻留一个教师头.
- 参数与 hidden state 的加载卸载都在后台异步进行, 不挡关键路径. 师生之间的精确 KL 用专门的 TileLang 内核计算.

报告 §5.1.2 没有给「蒸馏前学生 / 教师 / 蒸馏后学生」的对照表, 系列评测里的分数不能当作 OPD 的消融结果.

## Kimi K3: 九个专家, 裁剪过的对数比

### 九个专家怎么来

K3 的后训练也是三段: SFT 冷启动, 分域分推理力度的 RL, 再用 MOPD 合成一个模型. RL 不为单个任务训专门模型, 而是在三个大域上做, 每个域涵盖一串子任务:

| 域 | 子任务 |
|----|-------|
| 通用任务 | 通用体验, 视觉, 推理, 忠实性, 搜索, 知识工作 |
| 通用 agent | 长程助手任务, 深度研究, 段落级写作 |
| coding agent | 软件工程 (SWE), 编码体验, kernel 任务, Web 开发 |

三个域乘三档推理力度 $\{\mathrm{low},\mathrm{high},\mathrm{max}\}$, 共九个专家.

推理力度靠按题的 token 预算控制. 每道题 $x$ 有一个由冷启动模型估计的初始预算 $b_0(x)$, 轨迹总 token 数 $T(y)$ 超过 $\tau\cdot b_0(x)$ 时任务奖励改写为 $-1$. 通用任务的 $T(y)$ 只计 thinking token, agent 任务计累计输出 token (含推理和工具调用参数). 训练对预算乘数 $\tau$ 做分阶段课程: 先用较大的 $\tau$ 训 max 档 (仍封顶最大预算, 抑制过度思考), 再把 $\tau$ 逐步调小, 得到 high 与 low 档; $\tau$ 的调整按域配置, 有人工介入. 各档专家产生的轨迹一并收集, 用于 SFT 和多教师蒸馏.

### 奖励

训练时给定域 $d$ 与采样到的力度 $e$, 由九个专家中对应的 $\pi_{\mathrm{teacher}}^{(d,e)}$ 指导. 报告式 (15):

$$
r^{d}_{\mathrm{opd}}(y_t\mid e,x,y_{<t})=\mathrm{clip}\Bigl(\mathrm{sg}\Bigl(\log\frac{\pi_{\mathrm{teacher}}^{(d,e)}(y_t\mid x,y_{<t})}{\pi_\theta(y_t\mid e,x,y_{<t})}\Bigr),-R_{\max},R_{\max}\Bigr) \tag{3}
$$

$R_{\max}>0$ 是裁剪阈值, 用来约束极端的优势信号. 式中学生的条件里带着 $e$, 教师没有: 力度既决定选哪位教师, 也作为输入进了学生. 每个位置的奖励只依赖一位教师, 九个教师不会对同一条 $y$ 加权求和.

这是一个稠密的逐 token 奖励, 能直接接进 K3 现有的 RL 框架. 于是 RL 里的 partial rollout 也能用于蒸馏: 每轮对 $N$ 个提示各采 $K$ 条, 完成比例达到 $\lambda\in(0,1)$ 就暂停生成开始优化, 暂停的轨迹入队, 下一轮优先续跑. 长程 agent 轨迹因此会跨多轮, 数据带有陈旧性, K3 的策略优化靠 per-token 正则把更新限制在局部邻域内来容忍这种 off-policy.

报告还写了一句消融结论: 试过更细的 top-$k$ 蒸馏目标, 在他们的设定下收敛速度和最终表现都没有明显优势. K3 没有给出「MOPD 前 / 教师 / MOPD 后」的数字表.

## MiMo-V2-Flash: 裁剪训推比, 叠加结果奖励

### 三段流程

MiMo-V2-Flash 是 309B 总参数, 15B 激活的 MoE. 后训练三段 (报告 Figure 3):

1. **通用 SFT**, 在高质量指令响应对上建立指令跟随能力.
2. **分域训练**, 在聚焦任务上独立做 RL, 得到一组教师: agent 类 (搜索, 编码, 通用工具使用) 与非 agent 类 (数学推理, 通用推理, 安全对齐).
3. **MOPD**, 不合并参数, 也不从专家生成离线数据集, 而是把多教师整合写成 on-policy RL: 学生从自己正在变化的分布采样, 通过 KL 奖励接受对应域教师的 token 级监督.

报告列了这个框架的几点性质. 教师选择灵活, 可以是 RL 专家, 另一个 SFT 模型, 甚至学生自己; 接入新教师不必重构整条流程; 能与已有的结果奖励模型 (ORM) 一起用, 对复杂 agent 任务尤其方便. 还支持师生交替迭代: 蒸馏后的学生可以重新进入分域 RL, 产出更强的教师, 再监督下一代学生.

**损失**

记 $\pi_\theta$ 为训练引擎里优化的学生, $\mu_\theta$ 为推理引擎里采样的学生, $\pi_{\mathrm{domain}_x}$ 为提示 $x$ 所属域的教师. 报告式 (5) 的 reverse KL 损失

$$
\mathcal L_{\mathrm{reverse\text{-}KL}}(\theta)=-\mathbb E_{x\sim\mathcal D,\,y_t\sim\pi_\theta(\cdot\mid x,y_{<t})}\log\frac{\pi_{\mathrm{domain}_x}(y_t\mid x,y_{<t})}{\pi_\theta(y_t\mid x,y_{<t})} \tag{4}
$$

梯度 (报告式 (6)) 是对数比乘 $\nabla_\theta\log\pi_\theta(y_t\mid x,y_{<t})$, 即 REINFORCE 形式, 对数比充当优势. 实际优化的 surrogate (报告式 (7)(8)) 按 Zhao 等 (2025) 加训推重要性采样, 并丢掉训推差异过大的 token:

$$
\mathcal L_{\mathrm{MOPD}}(\theta)=-\mathbb E_{x\sim\mathcal D,\,y\sim\mu_\theta(\cdot\mid x)}\Bigl[\frac{1}{|y|}\sum_{t=1}^{|y|}w_t\,\hat A_{\mathrm{MOPD},t}\log\pi_\theta(y_t\mid x,y_{<t})\Bigr] \tag{5}
$$

$$
w_t(\theta)=\begin{cases}\mathrm{sg}\bigl[\pi_\theta(y_t\mid x,y_{<t})/\mu_\theta(y_t\mid x,y_{<t})\bigr], & \epsilon_{\mathrm{low}}\le\pi_\theta/\mu_\theta\le\epsilon_{\mathrm{high}}\\ 0, & \text{其他}\end{cases}
\qquad
\hat A_{\mathrm{MOPD},t}=\mathrm{sg}\Bigl[\log\frac{\pi_{\mathrm{domain}_x}(y_t\mid x,y_{<t})}{\pi_\theta(y_t\mid x,y_{<t})}\Bigr] \tag{6}
$$

默认再加上 ORM (含 GRPO) 算出的优势 $\hat A_{\mathrm{ORM}}$ (报告式 (9)):

$$
\hat A_{\mathrm{MOPD},t}=\mathrm{sg}\Bigl[\log\frac{\pi_{\mathrm{domain}_x}(y_t\mid x,y_{<t})}{\pi_\theta(y_t\mid x,y_{<t})}\Bigr]+\alpha\,\hat A_{\mathrm{ORM}} \tag{7}
$$

与 K3 对比, MiMo 的裁剪位置不同: $w_t$ 裁的是训练引擎与推理引擎之间的概率比, 越界的 token 权重直接为 0; 优势 $\hat A_{\mathrm{MOPD},t}$ 本身没有对称裁剪. $\epsilon_{\mathrm{low}},\epsilon_{\mathrm{high}},\alpha$ 报告没有给数值. 训推两套引擎为什么分布不一致, 见 [6.1.7](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致/6.1.7-训练稳定性与训推不一致.md). 基础设施上, MiMo 的 RL 与 MOPD 用 SGLang 做推理引擎, Megatron-LM 做训练引擎, 训推都用 FP8.

**MOPD 前后对照 (Table 7)**

报告 Table 7 给出 MOPD 前后的学生与各项最强教师. 教师类型标注为 RL, SFT 或 Self (学生自己).

| Benchmark | MOPD 前学生 | 最强教师 | MOPD 后学生 | 学生减教师 |
|-----------|------------:|---------:|-----------:|----------:|
| AIME 2025 | 89.3 | 93.9 (RL) | 94.1 | +0.2 |
| HMMT Feb. 2025 | 76.9 | 82.6 (RL) | 84.4 | +1.8 |
| LiveCodeBench | 77.5 | 82.6 (RL) | 83.2 | +0.6 |
| MMLU-Pro | 84.7 | 84.7 (Self) | 84.9 | +0.2 |
| GPQA-Diamond | 84.9 | 84.9 (Self) | 84.3 | −0.6 |
| HLE (w/o Tool) | 21.2 | 21.2 (Self) | 22.1 | +0.9 |
| Arena-Hard (Hard Prompt) | 50.0 | 50.0 (Self) | 54.1 | +4.1 |
| Arena-Hard (Creative Writing) | 90.1 | 90.1 (Self) | 86.2 | −3.9 |
| SWE-Bench Verified | 67.8 | 74.2 (RL) | 73.4 | −0.8 |
| Tau2-Bench | 75.9 | 79.6 (RL) | 80.3 | +0.7 |
| Tau2-Bench (Telecom) | 92.7 | 95.0 (RL) | 95.3 | +0.3 |
| BrowseComp | 42.5 | 51.7 (SFT) | 45.4 | −6.3 |

有 RL 教师的可验证域 (AIME, HMMT, LiveCodeBench, Tau2) 学生追平或略超教师. 四项为负: BrowseComp 相对 SFT 教师低 6.3, 创意写作低 3.9, SWE-Bench Verified 相对 RL 教师低 0.8, GPQA-Diamond 低 0.6. 报告正文说 MOPD「在所有域保留最强教师的峰值」, 表上是多数域接近, BrowseComp 和创意写作差距明显. 报告 Figure 6 在 AIME 2025 与 LiveCodeBench 上画了三条训练曲线: 带 ORM 的 RL, 不带结果奖励的 MOPD, 完整 MOPD.

**Ma 等: 方法论文与对照实验**

### 流程, 两种实现与教师服务

MiMo-V2-Flash 报告只给了 MOPD 在 Flash 上的结果. 同团队的 Ma 等把它写成独立论文, 在 Qwen3-30B-A3B 上做了与其他合并方法的受控对照, 并说明 MOPD 已部署在 Flash 的后训练中.

论文把流程分成三个阶段, 前两个阶段产出学生初始化和各域教师. 第三阶段每步: 采一批提示; 学生为每条提示生成轨迹并记录逐 token 分布; 按任务域把轨迹派给对应教师, 教师在轨迹上 prefill 得到逐 token 分布; 最小化学生与该教师沿轨迹的逐 token reverse KL:

$$
\mathcal L_{\mathrm{rev\text{-}KL}}=\mathbb E_{x,\,y\sim\pi_\theta}\Bigl[\frac{1}{|y|}\sum_t\sum_v\pi_\theta(v)\log\frac{\pi_\theta(v)}{\pi_{\phi_d}(v)}\Bigr] \tag{8}
$$

$\pi_{\phi_d}$ 是派给提示 $x$ 的教师, $\pi_\theta(v)$ 与 $\pi_{\phi_d}(v)$ 都以 $(x,y_{<t})$ 为条件.

**策略梯度实现** (原文式 (2)-(4)) 沿用 MiniLLM, 优势取 $\hat A_{\mathrm{MOPD},t}=\mathrm{sg}[\log\pi_{\phi_d}(y_t)-\log\pi_\theta(y_t)]$, 再做对称裁剪 $\mathrm{clip}(\hat A_{\mathrm{MOPD},t},-A_{\max},+A_{\max})$. 这一版的裁剪形状与 K3 式 (3) 相同, 和 Flash 报告式 (5)-(7) 写出的版本不同. 改动只在优势计算, 能直接放进现有 PPO/GRPO 框架.

**top-$k$ 实现** (原文式 (5)) 在教师 top-$k$ 集合 $\mathcal T^{d}_t$ 上算

$$
\mathcal L^{\mathrm{TopK}}_{\mathrm{MOPD}}=\mathbb E_{x,y}\Bigl[\frac{1}{|y|}\sum_t\sum_{v\in\mathcal T^d_t}\Bigl(\pi_\theta(v)\log\frac{\pi_\theta(v)}{\pi_{\phi_d}(v)}-\pi_\theta(v)+\pi_{\phi_d}(v)\Bigr)\Bigr] \tag{9}
$$

多出来的 $\pi_{\phi_d}(v)-\pi_\theta(v)$ 用来修正截断带来的偏置. 把每个 $\pi_\theta(v)$ 看成独立变量求导可以看出原因: 单项 $p\log(p/q)$ 对 $p$ 的导数是 $\log(p/q)+1$, 在 $p=q$ 处等于 1, 不为零; 加上 $-p+q$ 后导数变成 $\log(p/q)$, 在 $p=q$ 处为零. 完整词表上概率和为 1 的约束会吸收那个常数 1, 截断到 top-$k$ 后约束不再成立, 所以要显式修正. 论文还指出 top-$k$ 形式让教师 prefill 的回传量小到可以像奖励信号一样传输, 全词表蒸馏则每个 token 要传整张分布.

回传量小, 教师就可以拆成独立服务. 第三阶段相对 RL 额外的操作只有教师 prefill. 论文认为它与 RL 里的奖励计算性质相同, 于是把每个域教师部署成 RL 训练器之外的独立 prefill 服务. 学生采样器持续生成, 一条序列 rollout 结束, 训练器就向对应教师服务发异步 prefill 请求. 教师 prefill 与其他序列的采样在时间上重叠, 墙钟时间主要由采样决定. 论文报告在他们的部署里教师几乎没有可测的额外墙钟开销. 这与 DeepSeek-V4 的「缓存 hidden, 训练时重建全词表 logit」是两种不同的工程取舍: 前者传 sampled-token 或 top-$k$ 的 log 概率, 后者保留完整分布.

**Qwen3-30B-A3B 对照 (Table 2)**

所有方法从同一个 SFT 检查点出发. 三个域: 数学 (AIME25, AIME26), 指令跟随 (IFBench, IFEval), 软件工程 (SWE-bench Verified). 各域的绝对提升空间不同, 论文用归一化分: 域 $d$ 上 $\tilde s_d=(s_d-s^{\mathrm s}_d)/(s^{\mathrm t}_d-s^{\mathrm s}_d)$, SFT 学生为 0, 该域专家教师为 1, 再对三个域取平均.

| 方法 | AIME25 | AIME26 | IFBench | IFEval | SWE-bench Verified | 归一化分 |
|------|-------:|-------:|--------:|-------:|-------------------:|------:|
| Student (SFT-only) | 45.42 | 54.48 | 42.69 | 84.17 | 35.80 | 0.0000 |
| RL Teacher | 54.79 | 63.65 | 78.40 | 95.50 | 51.20 | 1.0000 |
| Mix-RL | 52.71 | 63.75 | 75.00 | 94.58 | 48.80 | 0.8818 |
| Cascade RL | 48.54 | 61.88 | 77.11 | 95.80 | 47.80 | 0.7752 |
| Off-Policy Finetune | 51.56 | 63.44 | 80.95 | 93.35 | 45.80 | 0.8241 |
| Param-Merge (Avg.) | 47.81 | 59.58 | 53.74 | 88.79 | 39.60 | 0.3280 |
| Param-Merge (Task Arith.) | 49.38 | 63.96 | 78.23 | 95.81 | 48.80 | 0.8574 |
| MOPD | 51.46 | 65.31 | 77.89 | 93.84 | 50.40 | 0.9373 |

超参按附录 A. 分域 RL 用 on-policy GRPO 加动态采样, 学习率 $3\times10^{-6}$; 数学与 IF 的 batch 144, 每题 8 条, 约 175K 条序列; SWE 的 batch 80, 每题 8 条, 约 150K 条序列, 最长 65,536 token, 最多 50 轮交互. Mix-RL 学习率 $4\times10^{-6}$, batch 256, 每题 8 条, 每个 batch 按 Math : IF : SWE $=0.35:0.35:0.3$ 混合. MOPD 不用动态采样, batch 2048, 每题只采 1 条, 域比例同 Mix-RL; 策略梯度形式的 $A_{\max}$ 默认取 5, top-$k$ 形式默认 $k=64$. 数学基准每题采 32 次取平均 (avg@32).

论文的逐域分析:

- **Cascade RL** 按 IF → Math → SWE 顺序训练. 先训的 IF 补上了 98% 的差距, 第二阶段的 Math 只补上 57%, 训练曲线 (Figure 1) 显示 Math 在随后的 SWE 阶段继续下降.
- **Off-Policy Finetune** 在 IF 上超过教师 (逐域归一化分 1.01), SWE 上只补上 65%, 离线模仿教师轨迹在不同任务类型上的迁移很不均匀.
- **Mix-RL** 是最均衡的基线 (逐域极差 0.064), 总分仍比 MOPD 低 5.5 个点.
- **MOPD** 三个域的逐域分落在 $[0.91,0.95]$, 极差 0.044, 是所有方法中最小的. 相比之下 Cascade RL 是 0.57 到 0.98, Off-Policy Finetune 是 0.65 到 1.01.
- **Param-Merge** 对合并方式很敏感: 线性平均只有 0.328; 任务向量算术回到 0.857, 但 IF 上达到教师水平 (1.00), Math 只补上 73%.

逐域分数之外还有样本效率的差别. 按每个域消耗的样本数计, MOPD 在 IF 上约 25K 样本, SWE 上约 30K 样本就到达教师水平的平台, Mix-RL 要用完每域 150K 到 180K 的预算才接近.

**MiMo-V2-Flash 上的结果 (Table 3)**

论文在 Flash 上用覆盖数学, 代码, 指令跟随, SWE, 工具使用的域教师, 全部是 RL 教师:

| | AIME25 | HMMT25 | LCB | IFBench | SWE-Bench V. | $\tau^2$-Bench | $\tau^2$-Telecom |
|---|------:|------:|----:|-------:|------------:|--------------:|----------------:|
| 学生 | 89.3 | 76.9 | 77.5 | 55.4 | 67.8 | 75.9 | 92.7 |
| 教师 | 93.9 | 82.6 | 82.6 | 68.9 | 74.2 | 79.6 | 95.0 |
| MOPD | 94.1 | 84.4 | 83.2 | 66.7 | 73.4 | 80.3 | 95.3 |
| 差值 | +0.2 | +1.8 | +0.6 | −2.2 | −0.8 | +0.7 | +0.3 |

与 Flash 报告 Table 7 重合的六项数字一致. 论文多出了 IFBench 一列 (−2.2), Flash 报告则多出了 MMLU-Pro, GPQA, HLE, Arena-Hard, BrowseComp 等以 Self 或 SFT 为教师的项目, 两张表的基准集合不同.

**分析实验与流程拆分**

**策略梯度与 top-$k$ 相当**. 同一流程下取 $k=64$, top-$k$ 在数学上相当, IF 与 SWE 略差, 归一化分 0.909 对 0.937. 两种损失的训练曲线几乎重合: 数学准确率平稳上升, 逐 token reverse KL 从本就很低的约 0.04 单调下降, 策略熵稳定在 0.30 左右. 论文的解释是师生分布接近时, 学生的 rollout 集中在教师的高概率区, 两种梯度估计拿到的信息相近. 这与 K3「top-$k$ 没有明显优势」是两家独立的消融, 设定不同.

**同源教师是稳定的前提**. 每个教师都从学生的初始化检查点出发做 RL, 师生分布接近, 初始 KL 低. 为验证这一点, 论文把数学教师换成更大, 数学更强但分布不同源的 Qwen3-235B-A22B, 其余不变. 学生的数学表现在两种损失下都下降. 初始逐 token KL 约 0.19, 是同源设定 (约 0.04) 的 5 倍左右. 策略梯度形式下数学准确率逐步下降, 熵从 0.30 收缩到 0.21, 学生收到的主要是来自教师低概率区的惩罚信号, 策略向单一模式收窄; top-$k$ 形式更糟, 约第 18 步训练发散, KL 与熵剧烈震荡. 教师与学生分布差距大时 OPD 为什么会失败, Li 等的分析见 [07](../07-OPD-失败模式/07-OPD-失败模式.md) 第 4 节.

**多轮迭代** (Table 4). 第一轮 MOPD 之后, 以学生为初始化重新训数学与 IF 教师 (SWE 本轮不训也不蒸馏), 再做第二轮 MOPD:

| 轮次 | AIME25 | AIME26 | IFBench | IFEval | SWE-bench Verified | 归一化分 |
|------|-------:|-------:|--------:|-------:|-------------------:|------:|
| 第 1 轮 MOPD | 51.46 | 65.31 | 77.89 | 93.84 | 50.40 | 0.937 |
| 第 2 轮 RL 教师 | 54.27 | 65.52 | 81.46 | 95.65 | 50.40 | 1.030 |
| 第 2 轮 MOPD | 53.44 | 64.90 | 79.76 | 95.44 | 50.20 | 0.986 |

从第一轮学生出发训出的教师更强 (1.030), 第二轮学生从 0.937 升到 0.986. 这就是 Flash 报告所说的师生交替迭代的实测.

第二轮只重训了数学与 IF 两个教师, SWE 教师原样不动, 这种做法依赖论文 §5 强调的一点: MOPD 把「产出能力」(分域 RL) 和「整合能力」(蒸馏) 拆开. 各域教师互相独立, 各团队可以同时迭代自己的奖励, 沙箱和数据, 不必排先后; 每个域可以自选 RL 算法, rollout 方式, 奖励函数和超参; RL 调参常需要重启, 联合多域 RL 重启意味着整条训练回到起点, 并行开发教师时重启只影响出问题的那个域.

### 后续: MiMo-V2.6 的 MOPD2

Xiaomi 在 MiMo-V2.6 报告 §5.6 把这条路线扩展为 MOPD2 (Multi-Prefix Multi-Teacher On-Policy Distillation), 放在混合 RL 之后, 目的是把难以验证的任务也并进来. 教师分两类: 可验证任务上用 MixRL 训出的 RL 教师, 开放域任务上用高质量合成演示训出的 SFT 教师. 有合适 RL 教师的域保留原来的做法 (Standard MOPD), 由学生自主生成完整 rollout. 另加一种前缀条件的单轮 rollout: 前缀取自教师 rollout (Teacher-Prefix OPD) 或 SFT 数据 (SFT-Prefix OPD). 一条有 $k$ 个 assistant 轮的轨迹给出 $k$ 个完整的历史前缀, 学生从每个前缀只采样新的一轮, 不重新生成之前的交互, 预先指定的教师在同一历史和学生已生成的 token 上给逐 token 监督.

SFT-Prefix 的理由与 SFT 教师的覆盖范围有关. 报告认为 SFT 教师的训练数据很少覆盖长程任务里学生反复偏离之后到达的历史, 所以从固定的演示前缀起步, 限制采样轮之前的偏离. 演示只提供上下文, 续写仍是学生自己生成的, 不是模仿固定回答. 报告把 MOPD2 用于长程游戏开发, 科研, 具身智能这类训练中难做可靠验证的场景. 这和 [4.9.3 状态分布视角](../../4.9.3-状态分布视角/4.9.3-状态分布视角.md) 讨论的问题相关: 蒸馏发生在什么状态分布上, 由前缀从哪来决定.

## 横向对照与已报告的失效

### 四种做法对照

| | DeepSeek-V4 | Kimi K3 | MiMo-V2-Flash 报告 | Ma 等 (PG 版) |
|---|------------|---------|-------------------|--------------|
| 叫法 | OPD | MOPD | MOPD | MOPD |
| 教师数 | 十余个, 覆盖多域 | 9 (3 域 × 3 档力度) | 分域, agent 与非 agent 两类 | 实验中 3 域 (Qwen3), 5 域 (Flash) |
| 信号 | 全词表 reverse KL | sampled-token 对数比 | sampled-token 对数比 + $\alpha\hat A_{\mathrm{ORM}}$ | sampled-token 对数比, 或 top-$k$ |
| 裁剪 | 无 | 优势对称裁剪 $R_{\max}$ | 训推比越界置零 | 优势对称裁剪 $A_{\max}$ |
| 工程重点 | 缓存 hidden, 按教师排序, TileLang KL | 复用 partial rollout | 训推重要性采样 | 教师作为异步 prefill 服务 |
| top-$k$ | 未用 | 试过, 无明显优势 | 未写 | $k=64$, 0.909 对 0.937 |

公开了数值的只有 Ma 等的 $A_{\max}=5$ 与 $k=64$; DeepSeek-V4 的 $w_i$, K3 的 $R_{\max}$, Flash 报告的 $(\epsilon_{\mathrm{low}},\epsilon_{\mathrm{high}},\alpha)$ 都没有给出. MOPD 每题只采 1 条 rollout, 不做组内比较, 这一点与 GRPO 的配置不同, 因为优势来自教师而不是组内相对奖励.

### 已报告的失效与边界

| 现象 | 出处 | 说明 |
|------|-----|------|
| sampled-token 优势方差大 | DeepSeek-V4 §5.1.2 | V4 改用全词表; K3, MiMo 仍用 sampled-token, 另加裁剪或丢弃离群 token |
| 全词表 logit 物化放不下 | DeepSeek-V4 §5.2.2 | 十余个教师乘以超过十万的词表, 需缓存 hidden 并按教师排序 |
| 非同源教师导致退化或发散 | Ma 等 §4.4.2 | 初始 KL 约 5 倍, 熵 0.30 → 0.21, top-$k$ 约第 18 步发散 |
| 部分域追不上教师 | Flash Table 7 | BrowseComp −6.3, Creative Writing −3.9 |
| 单轮合并留有余量 | Ma 等 Table 4 | 第二轮把归一化分从 0.937 提到 0.986 |
| 更细的 top-$k$ 不一定更好 | K3 §4.1.3, Ma 等 §4.4.1 | 两家各自的设定下与 sampled-token 版相当或略差 |

单教师 OPD, 特权上下文自蒸馏, 富反馈自蒸馏分别见 [01](../01-OPD基础原理/01-OPD基础原理.md), [02 OPSD](../02-OPSD-自蒸馏/02-OPSD-自蒸馏.md), [04 SDPO](../04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md). 顺序 RL 之后用 OPD 收尾 (如 GLM-5) 等其他发布方案见 [10](../10-OPD-报告落地对照/10-OPD-报告落地对照.md).

**参考文献**

1. DeepSeek-AI. (2026). DeepSeek-V4 技术报告. §5.1.1 专家训练, §5.1.2 式 (29), §5.2.2 教师调度. 库内: [DeepSeek-V4](../../../../../model-library/03-模型家族/01-deepseek/deepseek-v4/deepseek-v4-bi.md).
2. Moonshot AI. (2026). Kimi K3 技术报告. §4.1.2 推理力度 RL, §4.1.3 式 (15). 库内: [Kimi K3](../../../../../model-library/03-模型家族/02-kimi/kimi-k3/kimi-k3-bi.md).
3. Xiaomi LLM-Core. (2026). [MiMo-V2-Flash Technical Report.](https://arxiv.org/abs/2601.02780) *arXiv:2601.02780*. §4.1, §4.4 式 (5)-(9), Table 7, Figure 6. 库内: [MiMo-V2-Flash](../../../../../model-library/03-模型家族/05-mimo/mimo-v2-flash/mimo-v2-flash-bi.md).
4. Ma, W., Wei, J., Zhao, L., Zhang, H., Xiao, B., Li, L., Yang, Q., Gao, B., Wang, Y., Li, R., Dong, J., Sui, Z., & Luo, F. (2026). [MOPD: Multi-Teacher On-Policy Distillation for Capability Integration in LLM Post-Training.](https://arxiv.org/abs/2606.30406) *arXiv:2606.30406*. Table 1-4, §3, §4.4, §5.
5. Xiaomi LLM-Core. (2026). MiMo-V2.6 技术报告. §5.6 MOPD2, Figure 13. 库内: [MiMo-V2.6](../../../../../model-library/03-模型家族/05-mimo/mimo-v2-6/mimo-v2-6-bi.md).
6. Gu, Y., Dong, L., Wei, F., & Huang, M. (2024). [MiniLLM: Knowledge Distillation of Large Language Models.](https://arxiv.org/abs/2306.08543) *ICLR*.
7. Agarwal, R., Vieillard, N., Zhou, Y., Stanczyk, P., Ramos, S., Geist, M., & Bachem, O. (2024). [On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes.](https://arxiv.org/abs/2306.13649) *ICLR*.
8. Lu, K., & Thinking Machines Lab. (2025). [On-Policy Distillation.](https://thinkingmachines.ai/blog/on-policy-distillation/) *Thinking Machines Lab: Connectionism*.
9. Li, Y., Zuo, Y., He, B., et al. (2026). [Rethinking On-Policy Distillation of Large Language Models: Phenomenology, Mechanism, and Recipe.](https://arxiv.org/abs/2604.13016) *arXiv:2604.13016*.
