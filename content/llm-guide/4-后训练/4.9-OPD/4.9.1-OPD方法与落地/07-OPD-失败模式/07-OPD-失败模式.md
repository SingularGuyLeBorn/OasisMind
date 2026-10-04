---
title: "07 · OPD 失败模式: 三篇诊断论文"
published: true
tags: ["OPD", "On-Policy Distillation", "Failure Analysis", "Stable-OPD", "Local Support Matching"]
excerpt: "三篇 2026 年的诊断论文分别从估计器, 长度和教师选择拆解 OPD 为何失败: sampled-token 信号失衡且在漂移前缀上失真 (Fu 等), rollout 在约 30 步内突然被重复与截断占满 (Luo 等), 教师思维模式不兼容或没有新知识时 OPD 不涨分甚至倒退 (Li 等). 对应的修复是教师 top-K 局部支持匹配, Stable-OPD, 以及 off-policy 冷启动与教师对齐的 prompt."
---
# OPD 失败模式: 三篇诊断论文

> 相关阅读: [01 OPD 基础原理](../01-OPD基础原理/01-OPD基础原理.md) · [05 G-OPD](../05-GOPD-散度光谱/05-GOPD-散度光谱.md) · [06 SCOPE](../06-SCOPE-选择性反馈/06-SCOPE-选择性反馈.md) · [4.9.3 状态分布视角](../../4.9.3-状态分布视角/4.9.3-状态分布视角.md) · [4.9.2 OPD 综述](../../4.9.2-OPD综述/4.9.2-OPD综述.md)

本文的材料是 2026 年的三篇诊断论文: Fu 等 *Revisiting On-Policy Distillation* (arXiv:2603.25562) 从梯度估计器和 sampled-token 信号入手, Luo 等 *Demystifying OPD* (arXiv:2604.08527) 研究训练中途的长度膨胀, Li 等 *Rethinking On-Policy Distillation* (arXiv:2604.13016) 研究什么样的教师能教会学生. 三篇共同的问题是: OPD 在哪些条件下不涨分, 甚至让学生变差.

## 1. 估计器: 序列级与逐 token

### 1.1 两种梯度

OPD 最小化学生到教师的 reverse KL. 对提示 $x$, 记学生 $\pi_\theta$, 教师 $q$, 前缀 $c_t=(x,y_{<t})$, 定义得分函数与逐 token 奖励 (Fu 等 §2.1):

$$
s_t=\nabla_\theta\log\pi_\theta(y_t\mid c_t),\qquad r_t=\log\frac{\pi_\theta(y_t\mid c_t)}{q(y_t\mid c_t)} \tag{1}
$$

序列级 reverse KL 的梯度展开为

$$
\hat g_{\mathrm{seq}}=\sum_{t=1}^{T}\Bigl(\sum_{t'=1}^{T}r_{t'}\Bigr)s_t \tag{2}
$$

$t'<t$ 的项期望为零, 因为 $r_{t'}$ 只依赖步 $t$ 之前的前缀, 而 $\mathbb E[s_t\mid c_t]=0$. 所以期望等于因果的 reward-to-go 形式, 每个 token 的更新与它之后的全部奖励耦合. 大模型实现中普遍只保留即时项:

$$
\hat g_{\mathrm{tok}}=\sum_{t=1}^{T}r_t\,s_t \tag{3}
$$

两者的期望差就是被丢掉的未来耦合项 $\mathbb E\bigl[\sum_t\sum_{t'>t}r_{t'}s_t\bigr]$ (Fu 等附录 D.1), 一般不为零, 所以式 (3) 相对序列级目标有偏.

另一个层面的结论不同. Li 等 §2.2 指出, 对固定状态, 若 $\hat y_t\sim p_t$, 则 $\mathbb E[\log p_t(\hat y_t)-\log q_t(\hat y_t)]=D_{\mathrm{KL}}(p_t\|q_t)$, 采样 token 的 log-ratio 是该位置 KL 数值的无偏单样本估计. 「有偏」指的是梯度相对序列级目标, 「无偏」指的是局部损失值, 两者讨论的对象不同.

### 1.2 方差上界

设 $|r_t|\le B_r$, $\|s_t\|\le B_s$. 逐 token 估计器满足 $\|\hat g_{\mathrm{tok}}\|\le TB_rB_s$, 于是

$$
\mathbb E\|\hat g_{\mathrm{tok}}\|^2\le T^2B_r^2B_s^2 \tag{4}
$$

序列级估计器可写成 $\hat g_{\mathrm{seq}}=RS$, $R=\sum_tr_t$, $S=\sum_ts_t$, 各自至多 $T$ 倍, 于是

$$
\mathbb E\|\hat g_{\mathrm{seq}}\|^2\le T^4B_r^2B_s^2 \tag{5}
$$

这是保守的最坏情况上界, 不是实际方差的增长律. 对一条 16K token 的推理轨迹, 两个上界相差 $T^2\approx2.7\times10^8$ 倍; 实际差距小得多, 但方向说明了为什么长序列上几乎都用式 (3).

两端之间可以用折扣插值 $\hat g_\gamma=\sum_t\bigl(\sum_{t'\ge t}\gamma^{t'-t}r_{t'}\bigr)s_t$, $\gamma=0$ 是逐 token, $\gamma=1$ 是序列级. Fu 等在一维连续控制的双任务玩具环境 (约 4K 参数的三层 MLP 学生, 先用 REINFORCE 训两个教师再交替蒸馏) 中扫 $\gamma\in\{0,0.25,0.5,0.75,1\}$, 三个随机种子上都是 $\gamma$ 越大梯度方差越高; 若干运行中 $\gamma=0.75$ 或 1 的方差比小 $\gamma$ 高一到几个数量级, $\gamma=1$ 的策略常常偏离目标方向, 停在次优区域.

### 1.3 均匀教师上的 reverse KL

教师分布退化成均匀分布时, reverse KL 往哪个方向推学生, 可以直接算出来. 若教师在状态 $s$ 上均匀, $q(a\mid s)=1/V$, 则

$$
D_{\mathrm{KL}}(\pi_\theta\|q)=\sum_a\pi_\theta(a\mid s)\log\frac{\pi_\theta(a\mid s)}{1/V}=\log V-H(\pi_\theta) \tag{6}
$$

最小值 0 在学生也均匀时取到; delta 分布的熵为 0, KL 为 $\log V$, 是最大值. 所以对均匀教师做 reverse KL 会把学生推向均匀. reverse KL 的 mode-seeking 出现在教师多峰且峰间低密度的情形: 学生几乎不采样的那个峰在式 (6) 的期望里权重很小, 学生可以只覆盖其中一个峰.

## 2. sampled-token 信号的失败与修复 (Fu 等)

### 2.1 信号失衡

Fu 等的观察来自数学推理上的 sampled-token OPD: 学生 Qwen2.5-7B-Instruct, 教师 OpenThinker3-7B (在 Qwen2.5-7B-Instruct 上 SFT 得到). 下面三类失败都在这组师生上观察到.

在 sampled-token OPD 里, 每一步的更新由单个采样 token 的 $\log q(y_t\mid c_t)-\log\pi_\theta(y_t\mid c_t)$ 决定. 只要学生给采样 token 的概率高于教师, 这个奖励就是负的. Figure 2 是第一轮迭代时采样 token 上师生概率的散点, 大部分点落在负奖励一侧. 结果是优化被少数局部为正的 token 主导, 高频的填充词和短续写容易拿到有利的局部分数, 对整条轨迹的质量却贡献很小.

### 2.2 漂移前缀上的教师信号

sampled-token OPD 默认教师在学生 token 上的概率是轨迹质量的代理. 在学生常见, 教师少见的前缀上, 这个代理失效: 轨迹已经陷入重复, 推理不断重来, 或者续写没有意义时, 教师概率高的 token 仍然被奖励 (Figure 3). 论文认为有两个放大因素: 教师分布尖锐时, 师生的小差异就会产生很大的 log-ratio; 长 rollout 上师生差距随位置变大. Figure 4 按位置分桶画师生 log-prob 差, 靠后的若干桶下尾更宽, 极端值更多.

附录 H 的 reward hacking 案例按时间顺序展示了这种失效. 答案已经得到之后, 局部信号仍然把质量放在「implies」这类通用推理填充词和连接词上, 鼓励继续写而不是停下; 之后出现重复的「wait」和以标点为主的续写, 仍然可以得到局部奖励; 学生进一步漂移到格式错乱的非英文文本时, 许多 token 依旧拿到较高的教师概率.

SCOPE 的预实验给了同一现象的定量版本: 教师困惑度高的错误前缀, 教师从截断处续写的恢复率更低, 前缀越长越难恢复 (见 [06](../06-SCOPE-选择性反馈/06-SCOPE-选择性反馈.md) 第 1.2 节).

### 2.3 tokenizer 与特殊 token 不一致

sampled-token 比较的是学生生成的那个 token 在教师分布下的概率. 两个模型切分不同时, 同一段文本会被切成不同的 token. 论文的例子: 学生把 `<think>` 切成 `<`, `think`, `>`, 教师期望的是 `<th`, `ink`, `>`, 于是 `<` 在教师下概率很低, 尽管两者生成的语义内容相同. 结束符等特殊 token 也会出现类似的错配 (Figure 5). 一 token 的比较把切分差异当成了语义分歧.

这一项在 Fu 等的实验中影响很大: 单任务数学上, 只给 sampled-token OPD 加上特殊 token 掩码, 平均分就从 36.4 升到 40.7 (第 2.5 节表格, 原文 Table 1).

### 2.4 修复: 教师 top-K 局部支持匹配

不再只比较采样 token, 在每个前缀上取教师 top-$K$ 集合 $S(c_{i,t})=\mathrm{TopK}_q(c_{i,t})$, 在集合内对师生分布重新归一化:

$$
\hat\pi_\theta(v\mid c_{i,t})=\frac{\pi_\theta(v\mid c_{i,t})}{\sum_{u\in S(c_{i,t})}\pi_\theta(u\mid c_{i,t})},\qquad\hat q(v\mid c_{i,t})=\frac{q(v\mid c_{i,t})}{\sum_{u\in S(c_{i,t})}q(u\mid c_{i,t})} \tag{7}
$$

局部支持匹配 (LSM) 对所有 rollout 位置平均截断的 reverse KL:

$$
\mathcal L_{\mathrm{LSM}}=\mathbb E\Bigl[\frac{1}{\sum_i|o_i|}\sum_{i=1}^{G}\sum_{t=1}^{|o_i|}\sum_{v\in S(c_{i,t})}\hat\pi_\theta(v\mid c_{i,t})\log\frac{\hat\pi_\theta(v\mid c_{i,t})}{\hat q(v\mid c_{i,t})}\Bigr] \tag{8}
$$

更新不再由单个 token 的 log-ratio 的正负与大小决定, 仍然是逐 token 的局部更新, 成本远低于全词表 KL. 集合外的 token 不从这一项得到梯度, 相对全词表 reverse KL 是有偏的.

配套的三件事:

- **集合内重新归一化**. 在集合内单独做 softmax, 否则集合内师生的概率质量不可比; 去掉这一步训练迅速崩塌.
- **top-$p$ rollout**. 无约束采样偶尔采到极低概率的 token, 制造教师信号失效的前缀. 实验取 $p=0.9$, 温度 1.
- **特殊 token 掩码**. 掩掉切分约定不兼容的特殊 token, 减少假阴性. 它对 sampled-token OPD 帮助很大, 对 LSM 影响很小.

实现在 verl-agent 上, 8 张 H100. 数学: 最大回答 16,384, 组大小 8, $K=32$, AdamW 学习率 $2\times10^{-6}$, batch 128, mini batch 64, 共 400 步.

### 2.5 局部支持匹配的结果

单任务数学 (Table 1, 训练集 DAPO-Math-17K 英文部分, pass@1):

| 方法 | Math500 | AIME24 | AIME25 | Minerva | Olympiad | 平均 |
|------|---------|--------|--------|---------|----------|-----|
| Qwen2.5-7B-Instruct | 68.2 | 13.3 | 0.0 | 26.5 | 32.9 | 28.2 |
| OpenThinker3-7B (教师) | 92.2 | 53.3 | 40.0 | 39.0 | 55.6 | 56.0 |
| sampled-token OPD | 80.0 | 10.0 | 16.7 | 32.4 | 43.1 | 36.4 |
| sampled-token + 掩码 | 81.4 | 26.7 | 16.7 | 34.2 | 44.7 | 40.7 |
| LSM 无掩码 | 80.4 | 23.3 | 26.7 | 34.2 | 43.9 | 41.7 |
| LSM + 掩码 | 82.0 | 23.3 | 23.3 | 34.9 | 43.9 | 41.5 |

掩码对 LSM 几乎无影响 (41.7 对 41.5), 说明 LSM 的增益不只来自处理 tokenizer 错配. 与教师的 56.0 相比仍有 14 个点以上的差距.

数学与 ALFWorld 交替训练 (Table 2, ALFWorld 教师是 GiGPO-Qwen2.5-7B-Instruct-ALFWorld, 400 步中两类各 200 步): sampled-token OPD 的 ALFWorld 成功率 90.6, 数学平均 34.8; LSM 无掩码 95.3 与 41.7, 数学提升 19.8%, 这就是摘要里的 +19.8%; LSM 加掩码 ALFWorld 最高 97.7, 数学降到 38.6. 拆到单项, LSM 无掩码的增益主要在 MATH500 (74.8 到 82.0) 和 AIME24 (13.3 到 33.3) 上, AIME25 和 Minerva 与 sampled-token 相差不到 4 个点. 论文的解读是局部支持匹配主要帮的是推理这一侧, 推理轨迹更长, sampled-token 信号更容易受前缀漂移影响; 掩码在这次运行里则把取舍推向了智能体任务. 附录 G.1 在 WebShop 上用 Qwen2.5-1.5B-Instruct 做学生, 成功率从 sampled-token 的 50.0 升到 57.8, 教师是 66.4.

组件消融 (Table 3, AIME24 avg@32): sampled-token 20.4, 加 top-$p$ 21.6; 只换成教师 top-$K$ 是 17.7, 反而更低; 教师 top-$K$ 加 top-$p$ 23.6. 两者要一起用. 支持集合的选法 (Table 4 与附录 G.3) 在单任务上差别不大, 在多任务上默认的教师 top-$K$ (数学平均 41.7) 远好于学生 top-$K$ 加采样 token (28.4) 和教师 top-$K$ 加采样 token (26.9); 带无偏尾部校正的 EMA-PG 变体也没有更好 (36.2 与 33.7).

## 3. 长度膨胀与重复饱和 (Luo 等)

### 3.1 两个指标

Luo 等对一批 rollout 定义:

- **截断率** TruncRate: 因用完长度预算而停止, 没有输出 EOS 的比例.
- **重复率** RepRate: 取回答最后 $L$ 个字符, 用 zlib 压缩, 压缩比 $|\mathrm{bytes}|/|c(\mathrm{bytes})|$ 超过 $\tau$ 且尾部长度超过 $L$ 的比例. 实验取 $L=10{,}000$, $\tau=10$.

压缩比衡量的是尾部的可压缩程度, 一段话反复出现时 zlib 可以压到原来的十分之一以下.

### 3.2 相变

训练数据是 OpenR1-Math-220k 的 13K 子集. 学生取 Qwen2.5-Math-1.5B 或 7B, 教师取 DeepSeek-R1-Distill-7B 或 OpenThinker3-7B, 共三组. OPD 用 GRPO 式裁剪目标, 把序列级优势换成逐 token 优势 $A_{i,t}=\log\pi_T(\hat y_{i,t}\mid\cdot)-\log\pi_\theta(\hat y_{i,t}\mid\cdot)$.

三组都有同样的轨迹 (Figure 2):

1. **稳定期**. 验证准确率逐步上升. 训练 rollout 截断率 1.5B 约 0.5, 7B 约 0.23; MATH500 验证集上分别约 0.2 和 0.1. 重复率接近 0.
2. **相变**. 在大约 30 步的窗口内, 训练 rollout 截断率冲向 1, 几乎所有生成都撞到长度上限; 重复率从接近 0 跳到 0.3-0.6. 验证集上截断率和重复率在几乎同一步跳升, 准确率同时骤降, 之后一直停在高位.

论文把它称为 abrupt truncation-repetition inflation, 并强调这一过程中教师和损失都没有变, 不稳定来自 OPD 自身的 on-policy 动力学. 它与 GRPO 式 RL 里常见的长度偏置不同: Dr.GRPO 和 DAPO 处理的是序列级的长度相关梯度缩放, 这里是重复 token 在逐 token 优势上占优.

### 3.3 机制

**rollout 层面** (Figure 3). 长度突增前后, 学生和教师的 log-prob 都变得不那么负, 教师涨得更多, 平均优势 $\log\pi_T-\log\pi_\theta$ 随之跳升. 重复内容对两个模型都容易预测, 但教师对它的确定性提高得更快.

**token 层面** (Figure 4). 重复 token 的平均优势在整个训练中都高于普通 token. 崩塌前它们很少见, 总贡献有限; 崩塌后重复 token 约占 30%, 平均优势是普通 token 的 4-9 倍.

**形式化** (§3.5). 忽略裁剪, 记 $d_{\pi_\theta}(s)$ 为学生诱导的前缀访问分布, $A(s,y)=\log\pi_T(y\mid s)-\log\pi_\theta(y\mid s)$, 则

$$
g(\theta)\propto\mathbb E_{s\sim d_{\pi_\theta},\,y\sim\pi_\theta(\cdot\mid s)}\bigl[A(s,y)\nabla_\theta\log\pi_\theta(y\mid s)\bigr] \tag{9}
$$

记 $\mathcal R$ 为重复尾部的状态集合, $\Delta(s)=\mathbb E_{y\sim\pi_\theta}[A(s,y)\nabla_\theta\log\pi_\theta(y\mid s)]$, 式 (9) 拆成

$$
g(\theta)=\mathbb E_{s\sim d_{\pi_\theta}}\bigl[\mathbf 1\{s\notin\mathcal R\}\Delta(s)\bigr]+\mathbb E_{s\sim d_{\pi_\theta}}\bigl[\mathbf 1\{s\in\mathcal R\}\Delta(s)\bigr] \tag{10}
$$

第二项的份额等于「访问频率乘优势大小」. 重复状态一旦被访问得多一些, 第二项就占更大份额, 而它的更新又进一步鼓励留在 $\mathcal R$ 里. 用论文给的数估算: 重复 token 占 30%, 优势是 4-9 倍, 第二项与第一项的优势加权比约为 $0.3\times4/0.7\approx1.7$ 到 $0.3\times9/0.7\approx3.9$, 重复部分已经在更新里占多数. 这是一个自我强化的回路, 也解释了为什么转变如此突然.

### 3.4 Stable-OPD

两个组件:

**混合蒸馏**. 维护一个高质量完整解的固定集合 $\mathcal D_{\mathrm{gold}}$, 每个 prompt 除了学生的 on-policy rollout, 再配一条 golden 解, 在同一个 minibatch 里联合优化:

$$
\mathcal L_{\mathrm{mix}}(\theta)=\mathcal L_{\mathrm{OPD}}(\theta)+\lambda_{\mathrm{gold}}\,\mathbb E_{(x,y)\sim\mathcal D_{\mathrm{gold}}}\bigl[\mathcal L_{\mathrm{SFT}}(\theta;x,y)\bigr] \tag{11}
$$

从状态分布看, 训练是在学生诱导的分布与 golden 数据诱导的固定分布的混合上进行, 即使 on-policy rollout 开始退化, 梯度里仍有一部分来自完整, 不截断, 不重复的轨迹. 论文特别区分了它与 SDPO, OPSD 中 golden 解的用法: 那里 golden 解用来改造教师信号本身, Kim 等 (2026) 指出这会压低教师在推理中的不确定性; Stable-OPD 不改 on-policy rollout 上的教师信号, golden 数据只通过辅助的 SFT 项起作用.

**参考 KL**. 以初始学生为 $\pi_{\mathrm{ref}}$, 在访问到的前缀上惩罚偏离:

$$
\mathcal L_{\text{Stable-OPD}}(\theta)=\mathcal L_{\mathrm{mix}}(\theta)+\beta_{\mathrm{KL}}\,\mathbb E_{s_t}\bigl[D_{\mathrm{KL}}(\pi_\theta(\cdot\mid s_t)\|\pi_{\mathrm{ref}}(\cdot\mid s_t))\bigr] \tag{12}
$$

混合蒸馏改的是训练分布, 不直接限制每步更新的幅度; 参考 KL 限制的是策略漂移.

### 3.5 结果

训练数据: OpenR1-Math-220k 按 Yan 等 (2025) 的流程过滤, 去掉超过 8192 token 或被 Math-Verify 判错的生成, 从 94K 剩 46K. 先在 33K 上 SFT, 再在剩下 13K 上做 OPD. rollout batch 64, 每题 4 条, 采样温度 1.0, Adam 学习率 $1\times10^{-6}$, 4 张 H200. 评测中 AIME24, AIME25, AMC 报 avg@32, 其余报 pass@1, 温度 0.6.

Qwen2.5-Math-1.5B, 教师 OpenThinker3-7B (附录 Table 3):

| 方法 | 平均 | MATH-500 | Minerva | Olympiad | AMC | AIME24 | AIME25 |
|------|-----|---------|---------|----------|-----|--------|--------|
| 基座 | 16.0 | 28.0 | 9.6 | 21.2 | 26.4 | 7.2 | 3.6 |
| Qwen2.5-Math-1.5B-Instruct | 35.7 | 77.4 | 28.7 | 39.1 | 48.1 | 12.1 | 8.9 |
| SFT | 31.9 | 70.6 | 26.8 | 31.3 | 37.8 | 11.7 | 13.2 |
| GRPO | 30.1 | 61.8 | 26.8 | 32.0 | 40.2 | 11.8 | 7.7 |
| OPD | 28.9 | 56.7 | 23.4 | 31.0 | 35.9 | 11.1 | 15.0 |
| **Stable-OPD** | **36.1** | 73.9 | 32.6 | 37.4 | 43.0 | 13.8 | 16.0 |

论文写的 +7.2 是 28.9 到 36.1 的绝对差, 单位是百分点. 标准 OPD 在这里不如 SFT 和 GRPO, 论文的解读是训练不稳定限制了它. 官方的 Qwen2.5-Math-1.5B-Instruct 平均 35.7, Stable-OPD 只高 0.4 个点, MATH-500, Olympiad, AMC 三项仍低于 Instruct, 优势集中在 Minerva 和两届 AIME 上. 换成 R1-Distill-7B 做教师 (Table 4), OPD 28.0, Stable-OPD 35.7, 在 Minerva (32.7), AIME24 (14.6), AIME25 (17.2) 上是表中最好.

Qwen2.5-Math-7B (Table 1): OPD 平均 43.8, 低于 SFT 的 44.1 和 GRPO 的 45.5; Stable-OPD 47.6, 也高于 Oat-Zero (43.8), OpenReasoner-Zero (41.0), PRIME-Zero (40.8), SimpleRL-Zero (37.4).

消融 (Table 2, 1.5B, 教师 R1-Distill-7B):

| 方法 | 平均 |
|------|-----|
| 基座 | 16.0 |
| OPD | 28.0 |
| OPD + KL | 29.7 |
| OPD + KL + 混合蒸馏 | 35.7 |

参考 KL 单独只加 1.7 个点, 混合蒸馏再加 6.0 个点. 训练动态上 (Figure 5), Stable-OPD 在 1.5B + OpenThinker3 一组截断率保持中等, 重复率接近 0; 1.5B + R1-Distill-7B 一组在训练末尾有轻微上漂, 幅度和时间都远小于 OPD.

## 4. 教师选不对 (Li 等)

### 4.1 出发点与三个动态指标

Li 等的出发点是一个反常现象: 更强的教师可能完全教不动学生, 而初始对齐更低的较弱教师反而能教会. 论文引言提到 Qwen3, MiMo, GLM-5 的后训练都用了 OPD, Thinking Machines Lab 也以远低于 RL 的算力复现了 Qwen3 的 OPD 配方, 但什么条件下 OPD 失败, 此前很少有系统研究. Li 等的实验全部在数学上, 训练集 DAPO-Math-17K, 评测 AIME24, AIME25, AMC23, 每题 16 个样本, 温度 0.7, top-p 0.95, 最长 31,744 token, 报 avg@16.

为了把「教不动」量化, 论文在学生 rollout 上跟踪三个逐步指标. 记学生与教师在步 $t$ 的 top-$k$ 集合为 $S_t^{(p)}$, $S_t^{(q)}$:

- **重合率**: $\mathcal M_{\mathrm{overlap}}=\mathbb E_t\bigl[|S_t^{(p)}\cap S_t^{(q)}|/k\bigr]$.
- **重合 token 优势**: 在交集上重新归一化得 $\bar p_t,\bar q_t$, $A_t(v)=\bar p_t(v)(\log\bar q_t(v)-\log\bar p_t(v))$, 对交集取平均. 接近 0 表示学生在教师偏好的 token 上分配了合适的质量, 大的负值表示学生在交集内比教师更自信.
- **熵差**: $\Delta H_t=|H(q_t)-H(p_t)|$, 在学生 rollout 上计算.

### 4.2 两个条件: 思维模式兼容, 有新知识

第一个条件是思维模式兼容. 学生 Qwen3-1.7B-Base, 两个教师: Qwen3-4B (Non-thinking) 与 Qwen3-4B-Base-GRPO (在 Qwen3-4B-Base 上做 zero-RL). 两个教师的分数大体相当, 后者初始重合率更高, 蒸馏效果始终更好. 两条重合率曲线后期会合, 性能差距却一直保留, 论文的解读是早期模式不匹配损失的收益后面补不回来.

第二个条件是教师要有学生没有的能力, 分数高不等于有新知识. 论文做了两组对照, 关键对比是同一流水线的教师与额外做过 RL 的教师:

- DeepSeek 家族: 学生 R1-Distill-1.5B, 教师 R1-Distill-7B 对 Skywork-OR1-Math-7B (在 R1-Distill-7B 上做 RL).
- Qwen 家族: 学生 Qwen3-1.7B (Non-thinking), 教师 Qwen3-4B (Non-thinking) 对在 DeepMath 57K 子集上做过 RL 的版本.

两个家族里, 同流水线教师的提升都有限, 做过 RL 的教师提升明显大, 差距恢复率 $(\mathrm{Acc}_{\text{OPD 后}}-\mathrm{Acc}_{\text{OPD 前}})/(\mathrm{Acc}_{\text{教师}}-\mathrm{Acc}_{\text{OPD 前}})$ 也高得多. RL 后的教师来自同一基座, 思维模式仍然兼容, 收益来自 RL 带来的新能力.

### 4.3 反向蒸馏

JustRL-1.5B 由 R1-Distill-1.5B 做 RL 得到. 把方向反过来: 以 JustRL-1.5B 为学生, 分别用 R1-Distill-1.5B (它自己 RL 前的检查点) 和 R1-Distill-7B 做教师. R1-Distill-7B 的分数略高于 JustRL-1.5B, R1-Distill-1.5B 明显更弱.

结果 (Figure 5): 两次蒸馏都把学生拉回大约 RL 前的水平, RL 学到的增益全部被抹掉, 两条训练曲线几乎重合. 由于 OPD 在学生访问的状态上最小化 reverse KL, 这说明两个尺寸的教师在这些状态上给出几乎相同的局部目标分布. 论文从中得出三点: OPD 学的是教师的思维模式并覆盖学生自己的; 教师的 benchmark 分数不能预测 OPD 的结果, 甚至可能方向相反; 同家族里大模型的高分可能只是对同样数据拟合程度不同, 不代表新能力.

### 4.4 机制: 高概率 token 上的逐步对齐

学生 R1-Distill-1.5B, 教师 JustRL-1.5B (成功) 对 R1-Distill-7B (失败), 两个教师数学能力相当, 后者略强. 成功的一组最终恢复了超过 80% 的师生差距, 失败的一组没有任何提升 (Figure 6). 成功时重合率稳步上升, 重合 token 优势向 0 靠近, 熵差收窄; 失败时三个指标从一开始就停滞. 整个训练中重合 token 都占两个模型 97%-99% 的概率质量 (附录 B.1).

进一步的消融 (Figure 7, $k=16$) 只改损失覆盖哪些 token: 学生全部 top-$k$, 只用交集, 只用对称差. 只用交集与全部 top-$k$ 的效果几乎一样, 只用对称差明显更弱. 前两者的重合率都从约 72% 升到 91% 以上, 只用对称差时重合率先降后部分回升. 机制是自我强化的: 一个 token 进入共同高概率区且被教师偏好, reverse KL 就往它上面集中更多质量, 把非重合的竞争 token 挤出学生的 top-$k$.

### 4.5 两条修复

**off-policy 冷启动** (§5.1). 学生 Qwen3-1.7B-Base, 教师 Qwen3-4B (Non-thinking). 先让教师在 OpenThoughts3-1.2M 数学子集上生成 200K 条回答, 学生在上面 SFT, 再在去重后剩下的约 30K prompt 上做 OPD. 与直接从 Base 开始 OPD 相比, 冷启动后的学生初始重合率高得多, 熵差小, 曲线平稳, 验证性能在整个训练中都更高, 最终上限也更高.

**教师对齐的 prompt** (§5.2). 两个粒度:

- 模板: 学生 R1-Distill-1.5B, 教师 JustRL-1.5B, 题目同为 DAPO-Math-17K, 只把模板从 DAPO 格式 (要求最后一行写 `Answer:`) 换成 JustRL 训练时的格式 (`Please reason step by step, and put your final answer within \boxed{}.`). 三个基准都提升, 重合率起点更高, 收敛也更高.
- 内容: 学生 Qwen3-1.7B-Base, 教师 Qwen3-4B-Base-GRPO, 对比 DAPO-Math-17K (教师 RL 用过的数据) 与等量的 DeepMath 子集. 前者下游更好, 重合率反而更低, 但学生在重合 token 上的累计质量明显更高, 学生熵也低得多. 论文建议把教师对齐的 prompt 与教师没见过的 prompt 混用, 以免熵过低, 失去探索.

### 4.6 稠密奖励的代价

**长度有甜点** (§6.1). R1-Distill-1.5B 对 JustRL-1.5B, 最大回答长度取 0.5K 到 15K 六档, 各训 200 步. 0.5K 和 1K 的监督 token 太少; 3K 和 7K 最好; 10K 和 15K 持平或下降, 后期重合率骤降, 学生熵和梯度范数出现尖峰. 15K 设定下按位置画学生熵, 高熵先出现在回答末尾, 随训练逐步向前蔓延; 教师熵也有同样的从后往前的趋势.

**教师续写随前缀变长而失效**. 从 DAPO-Math-17K 抽 2K 题, 取学生超过 16K token 的 rollout, 在多个位置截断让教师续写. 教师相对学生的准确率优势从 1K 前缀的 +0.37 单调降到 16K 前缀的 +0.02.

**全局有信息不等于局部可用** (§6.2). 对每条 rollout 算序列平均奖励 $\bar r(y)=\frac1T\sum_t[\log\pi_T-\log\pi_\theta]$, 两个教师下正确 rollout 的平均奖励都高于错误的, AUROC 分别是 0.73 (JustRL-1.5B, 成功) 和 0.75 (R1-Distill-7B, 失败). 失败的教师并没有给出更弱的全局信号. 论文观察到失败组后期重合 token 优势的幅度更大, 梯度范数却一直更小, 提出一个未经验证的假设: 7B 教师的逐 token 优势在序列内各位置方向不一致, 聚合后相互抵消.

**sampled-token 已经够用** (§6.3). Top-$k$ OPD 取 $k\in\{1,4,16,64\}$ 与 sampled-token 比较. sampled-token 与 top-$k$ 三项平均相当; 只有 Top-1 明显更差, 重合率增长不稳, 熵和梯度范数有尖峰; $k$ 超过 4 几乎没有额外收益, Top-4 后期还有一次下探, Top-16 和 Top-64 全程平滑. 论文的解释: sampled-token 每步按学生分布抽不同的 token, 长期看是对高概率区的无偏覆盖; Top-1 永远取 argmax, 小的策略变化就会让第一名换人, 奖励信号不会平均掉.

这一条与 Fu 等的结论表面上冲突. Fu 等的 sampled-token 基线没有用 top-$p$ rollout, 师生来自不同的 SFT 流水线, 还受 tokenizer 不一致影响; Li 等这组师生同属 R1-Distill-1.5B 家族, 模板也一致. 两篇的结论各自对应自己的设定.

## 5. 症状对照与局限

### 5.1 从症状对照到论文

| 症状 | 先查什么 | 依据 |
|------|---------|------|
| 训练早期正常, 某一刻截断率在几十步内冲高, 准确率骤降 | 截断率, zlib 尾部压缩比, 重复 token 的优势与占比 | Luo 等 §3 |
| 回答末尾先出现高熵, 再往前蔓延 | 最大回答长度, 教师从长前缀续写的增益 | Li 等 §6.1 |
| 学生陷入重复或乱码, 损失仍在降 | 重复 token 上的教师概率, 位置分桶的师生 log-prob 差 | Fu 等 §2.2, 附录 H |
| 换了不同家族的教师后分数不涨 | tokenizer 切分与特殊 token, 先试掩码 | Fu 等 §2.2, Table 1 |
| 强教师不如弱教师 | 初始 top-$k$ 重合率, 熵差, 教师是否有学生没见过的能力 | Li 等 §3-4 |
| 学生原本 RL 学到的能力消失 | 教师是否就是学生 RL 前的同家族模型 | Li 等 §3.3 |
| 重合率不涨, 梯度范数持续很小 | 冷启动 SFT, 换成教师训练时的模板与 prompt | Li 等 §5 |

这几类失败会互相叠加. 漂移前缀上的教师失准 (第 2.2 节) 是重复饱和 (第 3 节) 能自我强化的前提: 教师若在重复内容上给低分, 式 (10) 的第二项就不会占优. 回答越长, 学生越可能走进教师少见的前缀 (第 4.6 节), 两者又都与最大长度的设置有关.

### 5.2 局限

先看覆盖面. 三篇的主要实验都在数学上; Fu 等加了 ALFWorld 和 WebShop, Li 等明确把代码和开放式任务列为未来工作. 模型规模也偏小, 学生在 1.5B 到 7B, 教师 4B 到 7B, 更大模型上相变是否出现, 出现在第几步, 都没有数据. 三篇研究的都是独立的教师; 自蒸馏里同一个模型借助特权信息 (标准答案, 执行反馈) 充当教师, 思维模式天然一致, 新知识来自特权信息, Li 等把这种情形下 4.2 节的两个条件是否成立列为下一步.

再看结论本身的强度. Li 等关于 7B 教师逐 token 优势方向不一致的解释, 论文自己说明尚未验证; Fu 等的方差上界 (式 (4)(5)) 是最坏情况, 玩具实验只是定性的. Fu 等的 rollout 由 vLLM 以 top-$p$ 生成, 训练引擎没有对这个采样过程做校正, 论文把这列为未解决的问题. 修复之后学生离教师仍有明显距离 (Fu 等单任务 41.7 对 56.0), 更好的局部监督只解决了其中一部分.

## 参考文献

1. Fu, Y., Huang, H., Jiang, K., Liu, J., Jiang, Z., Zhu, Y., & Zhao, D. (2026). [Revisiting On-Policy Distillation: Empirical Failure Modes and Simple Fixes.](https://arxiv.org/abs/2603.25562) *arXiv:2603.25562*. §2 估计器与失败模式, §3 式 (6)-(8), Table 1-4, 附录 D-H.
2. Luo, F., Chuang, Y.-N., Wang, G., Xu, Z., Han, X., Zhang, T., & Braverman, V. (2026). [Demystifying OPD: Length Inflation and Stabilization Strategies for Large Language Models.](https://arxiv.org/abs/2604.08527) *arXiv:2604.08527*. §3 指标与机制, 式 (3)-(6), Table 1-4.
3. Li, Y., Zuo, Y., He, B., et al. (2026). [Rethinking On-Policy Distillation of Large Language Models: Phenomenology, Mechanism, and Recipe.](https://arxiv.org/abs/2604.13016) *arXiv:2604.13016*. §3-6, Figure 2-16. 代码: [thunlp/OPD](https://github.com/thunlp/OPD).
4. Zheng, B., Ma, X., et al. (2026). [SCOPE: Signal-Calibrated On-Policy Distillation Enhancement with Dual-Path Adaptive Weighting.](https://arxiv.org/abs/2604.10688) *arXiv:2604.10688*.
5. Lu, K., & Thinking Machines Lab. (2025). [On-Policy Distillation.](https://thinkingmachines.ai/blog/on-policy-distillation) *Thinking Machines Lab: Connectionism*.
6. Gu, Y., Dong, L., Wei, F., & Huang, M. (2024). [MiniLLM: Knowledge Distillation of Large Language Models.](https://arxiv.org/abs/2306.08543) *ICLR*.
7. Agarwal, R., et al. (2024). [On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes.](https://arxiv.org/abs/2306.13649) *ICLR*.
8. Zhang, L., & Ba, J. (2026). [EMA Policy Gradient: Taming Reinforcement Learning for LLMs with EMA Anchor and Top-k KL.](https://arxiv.org/abs/2602.04417) *arXiv:2602.04417*.
