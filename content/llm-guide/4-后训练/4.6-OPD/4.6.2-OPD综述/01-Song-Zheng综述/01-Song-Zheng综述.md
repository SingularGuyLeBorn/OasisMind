---
title: "01 · Song & Zheng 综述"
date: 2026-08-30
tags: [OPD, On-Policy Distillation, f-散度, MiniLLM, GKD, 综述]
as_of: 2026-08-30
category: LLM 指南
---

# 01 · Song & Zheng 综述

本库 OPD 的全称是 **On-Policy Distillation**：学生按当前策略自己采样轨迹，教师只在这些**学生前缀**上给监督。卡住的瓶颈是 off-policy 蒸馏只在教师 / 数据集前缀上教，推理却走学生自己的前缀。暴露偏差按序列长度二次复合。

本篇读 Song & Zheng（腾讯大模型部）*[A Survey of On-Policy Distillation for Large Language Models](https://arxiv.org/html/2604.00626v3)*（[arXiv:2604.00626](https://arxiv.org/abs/2604.00626) v3；附属列表 [Awesome-LLM-On-Policy-Distillation](https://github.com/nick7nlp/Awesome-LLM-On-Policy-Distillation)）。作者自称 **first comprehensive OPD survey**：把 OPD 写成学生轨迹上的 $f$-散度最小化，再按三轴（优化什么 / 信号从哪来 / 怎么稳定）收编散落在蒸馏、RLHF、模仿学习三个社区的论文。

记号与 [01](../../01-OPD-学生前缀蒸馏/01-OPD-学生前缀蒸馏.md) 的式 (1)–(3)、(6)–(9) 对齐处沿用 01，不另立一套定义。**不是** Online Preference Distillation，不是 DPO 换名，也不是把 OPD 合成 GRPO 变体。

## 1. 综述在补什么

知识蒸馏把前沿模型压进可部署学生，工业默认配方仍是 **off-policy**：在教师写好的（或数据集里的）前缀上匹配 next-token。推理时学生自回归，前缀变成自己刚吐出的 token。Ross et al. 的 DAgger 界说：若训练分布上每步误差 $\epsilon$，学习者自己走状态时，轨迹总偏差按 $O(\epsilon T^{2})$ 复合，而不是独立误差的 $O(\epsilon T)$。推理链一长，一步偏后面全是没练过的状态。综述把这叫做把蒸馏从「单次模仿」改成「对学生实际产出做迭代纠偏」。

文献却散在三个社区：知识蒸馏谈 KL 方向，RLHF 谈奖励与 KL 约束，模仿学习谈 DAgger。既有 LLM 蒸馏综述常把 on-policy / off-policy 当成可互换变体。Song & Zheng 的贡献因此很窄、也很硬：给一个共同的 $f$-散度写法，再按**设计轴**而不是按公司名分类。本库已经用另一套拆法写完了地基与变体——[01](../../01-OPD-学生前缀蒸馏/01-OPD-学生前缀蒸馏.md) 钉名字与两条梯度，[02](../../02-OPSD-参考解自蒸馏/02-OPSD-参考解自蒸馏.md) 钉 $y^\star$，[04](../../04-SDPO-环境反馈蒸馏/04-SDPO-环境反馈蒸馏.md) 钉环境 rich feedback，[07](../../07-OPD-失败模式/07-OPD-失败模式.md) 钉失败模式，[09](../../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md) / [10](../../10-OPD-各家报告对照/10-OPD-各家报告对照.md) 钉厂商捆法。本篇问的是：综述的坐标系怎么接到这些专文上，以及和 GxPO 综述的边界在哪。数字、消融表、报告超参在原专文。

![Off-policy KD trains on teacher prefixes; OPD trains on student prefixes with teacher logits](./images/fig-opd-survey-off-vs-on.png)

> 图 1：采样从哪来。左：off-policy KD，学生只在教师（或数据集）前缀上匹配。右：OPD，学生自己采样，教师在学生前缀上给密集 logits / KL。红标 **NOT**：不是 DPO，不是 Online Preference。底栏：DAgger 把复合从 $O(\epsilon T^{2})$ 收到 $O(\epsilon T)$ 的资格条件见 §2。

**图 1 解析**

- **左，青格**：token 由教师写出。学生在这些前缀上做 NLL 或 $D_{\mathrm{KL}}(p_T \Vert p_\theta)$。推理一旦自己写偏，就离开训练状态。
- **右，橙格**：token 由学生写出。教师不再重写一条满分答案，而是对同一条学生轨迹上的每个前缀打分布。这就是「dense on student states」。
- **红标**：偏好对 $(y^+,y^-)$ 没有这条「教师在学生前缀上给分布」的结构。黑盒设定里可以用 pairwise preference 当**降级接口**（综述 §5.2），那不是把 OPD 定义成 preference optimization。沿用 [01 §10.1](../../01-OPD-学生前缀蒸馏/01-OPD-学生前缀蒸馏.md)。
- **底栏**：DAgger 的 $O(\epsilon T)$ 假定专家在学习者访问的任意状态上仍接近最优。学生前缀严重 OOD 时，教师条件分布自己会坏——综述 §2.2 Remark 把这写成资格条件，不是免费定理。本库 [01 §10.5](../../01-OPD-学生前缀蒸馏/01-OPD-学生前缀蒸馏.md) 同一条。

## 2. 综述的定义：$y\sim p_\theta$，损失可以是散度也可以是奖励

综述把「是不是 on-policy」钉在**训练数据从哪来**，而不是钉在用了哪种 KL。方法是 on-policy，当且仅当学生的训练数据来自**当前**策略 $p_\theta$，而不是固定语料 $\mathcal{D}$ 或教师生成分布 $p_T$：

$$
\min_{\theta}\mathbb{E}_{x\sim\mathcal{D}}\,\mathbb{E}_{y\sim p_{\theta}(\cdot \mid x)}\bigl[\mathcal{L}(y,x;\theta,T)\bigr]. \tag{1}
$$

这与 [01 式 (6)](../../01-OPD-学生前缀蒸馏/01-OPD-学生前缀蒸馏.md) 是同一句，**沿用 01**。$\mathcal{L}$ 可以是散度、奖励或混合；关键是外层期望在学生自己的生成上。$\theta$ 一更新，$p_\theta$ 就变，每步都要重新 rollout——这是 OPD 的系统成本，不是实现细节。

记号沿用综述：小写 $p$ 是 token 级条件分布（教师 $p_T(\cdot \mid x,y_{<t})$，学生 $p_\theta$），大写 $P$ 是序列级。本库 01 用 $\pi_\theta,\pi_T$ 写策略，与这里的 $p_\theta,p_T$ 是同一对象，后文混用时以「学生 / 教师」为准，不另开第三套。

Off-policy token-KD（综述式 (4)(7)）把期望放在数据集前缀上：

$$
\mathcal{L}_{\mathrm{Off-Policy}}=\mathbb{E}_{x,y\sim p_{\mathrm{data}}}\Bigl[\sum_{t}D_{\mathrm{KL}}\bigl(p_T(\cdot \mid x,y_{<t})\parallel p_\theta(\cdot \mid x,y_{<t})\bigr)\Bigr]. \tag{2}
$$

这对应 01 式 (1) 那条 **SFT / 监督蒸馏** 的采样源（$s_t$ 来自教师或数据），**沿用 01**。Seq-KD 再把序列级 $D_{\mathrm{KL}}(P_T \Vert P_\theta)$ 收成教师 beam 上的 NLL，分布信息丢掉，采样源仍是静态的。

统一 on-policy 目标把**采样轨迹**和**局部匹配度量**拆开（综述式 (8)）：

$$
\mathcal{L}_{\mathrm{OPD}}(\theta)=\mathbb{E}_{y\sim\pi_{\mathrm{mix}}}\Bigl[\sum_{t=1}^{|y|}\mathcal{D}_{f}\bigl(p_T(\cdot \mid x,y_{<t}),\;p_\theta(\cdot \mid x,y_{<t})\bigr)\Bigr]. \tag{3}
$$

$\pi_{\mathrm{mix}}$ 控制「有多 on-policy」；$\mathcal{D}_f$ 控制「用哪把尺子」。$f$-散度（综述式 (9)）是

$$
D_f(P\parallel Q)=\mathbb{E}_{y\sim Q}\Bigl[f\Bigl(\frac{P(y)}{Q(y)}\Bigr)\Bigr], \tag{4}
$$

$f$ 凸且 $f(1)=0$。生成元决定似然比对权重：

| $f$ | 常用名 | 几何 | 综述怎么用 |
|-----|--------|------|------------|
| $u\log u$ | Forward KL | mode-covering（zero-avoiding）：学生必须覆盖教师有质量的地方，模态之间容易幻觉 | GKD 的默认写出方向之一；开放生成更常用 |
| $-\log u$ | Reverse KL | mode-seeking（zero-forcing）：学生可贴教师的一个峰 | **MiniLLM 的目标**；数学 / 代码「只有少数对的」时更贴 |
| $u\log u-(u+1)\log\frac{u+1}{2}$ | JSD | 对称、有界，在 covering / seeking 之间 | GKD 在翻译（WMT）上最好；既不是单答案也不是完全开放 |
| $\alpha$-散度 | 连续族 | $\alpha\to 1$ 前向，$\alpha\to 0$ 反向 | 给「哪一种 KL」一个旋钮，不是新定义 |

01 式 (2)(3) 是 MiniLLM 那条 reverse KL 在学生轨迹上的展开，**不是**综述对全体 OPD 的定义。GKD 默认写出的 token 级 $D_{\mathrm{KL}}(p_T \Vert p_S)$ 是 forward KL，散度本身可选 reverse / JSD，哪一种更好写成 **task-dependent**。两条梯度不是「OPD = Reverse KL」。Qwen3 只写 aligning logits to minimize KL，**未点名**正反向。沿用 [01 §10.3](../../01-OPD-学生前缀蒸馏/01-OPD-学生前缀蒸馏.md)。

三个地基方法在这个平面上的位置（综述 §2.3；公式细节回 01，这里只放坐标）：

1. **GKD**（Agarwal et al.）：$\pi_{\mathrm{mix}}=\lambda p_\theta+(1-\lambda)p_{\mathrm{data}}$。$\lambda=0$ 退回监督 KD，$\lambda=1$ 纯学生轨迹。**不对采样路径反传**（state on-policy）。$\mathcal{D}_f$ 不可知论，实验过 FKL / RKL / JSD。对应 01 式 (8)(9)，**沿用 01**。
2. **MiniLLM**（Gu et al.）：$\mathcal{D}_f=D_{\mathrm{KL}}(p_\theta \parallel p_T)$，再用 $\pi_{\mathrm{mix}}=(1-\alpha)p_\theta+\alpha p_T$（文中 $\alpha=0.2$）稳采样。学生既在期望里又在对数比里，梯度走 REINFORCE，$r_t=\log(p_T/p_\theta)$。对应 01 式 (7)，**沿用 01**。这是 action on-policy。
3. **DistiLLM**（Ko et al.）：前缀仍是学生生成，但用验证损失调度、replay buffer，目标改成对混合物 $\tilde p=\alpha p+(1-\alpha)q$ 的 skew KL，躲开 $p_\theta\approx 0$ 或 $p_T\approx 0$ 时的除零。Forward 一侧把目标密度下界钉在 $(1-\alpha)p_\theta$ 上，不必走 REINFORCE。本库没有 DistiLLM 专文；它属于轴 1 的「固定散度 + 工程稳定」，不是 MiniLLM 的实现，也不是 01 §6 那条 `F.kl_div`。

GxPO 综述把 GKD 的 forward KL 写成 $\mathbb{E}_{y\sim\pi_T}[\cdots]$，那是**监督 KD** 的经典采样源。GKD 论文的 on-policy 一项是 $y\sim p_S$ 再在学生前缀上算 token 级 KL。冲突时以 GKD 原文与 01 为准。

## 3. 三轴：优化什么、信号从哪来、怎么稳定

综述 §3 把方法按流水线里的三个连续决策分类，一篇论文只进一个主轴（核心贡献在哪）。三轴互相约束：精确的 token 级 forward KL 需要教师全词表，API-only 就走不通；RL 增强目标天然和验证器 / 奖励模型绑在一起。早期（2023–2024）挤在轴 1 的 KL 方向；2025 中起挤轴 2 的自蒸馏；2025 末–2026 挤轴 3 的 on-policy 不稳。工业系统（Qwen3、V4）是三轴一起拧，不是单轴最优。

![Three design axes of OPD: objective, signal source, dynamics](./images/fig-opd-survey-three-axes.png)

> 图 2：综述三轴地图。轴 1 优化什么（固定 $f$ / 逐 token 自适应 / RL 增强）。轴 2 信号从哪来（白盒 logits / 黑盒 API / 无外教师）。轴 3 怎么稳定（$\pi_{\mathrm{mix}}$ 与 off-policy 热身、log 比裁剪、全词表 vs 采样 token）。格子里的 01 / 02 / 04 是本库专文，不是综述原文编号。

**图 2 解析**

- **轴 1 蓝格**：固定散度 = GKD / MiniLLM / DistiLLM。自适应 = ToDi（按师生 log 比混 FKL/RKL）、EOPD（教师高熵处加 FKL）、AKL（头/尾质量差加权）。RL 增强 = G-OPD 把 OPD 写成稠密 KL 约束 RL（本库 [05](../../05-GOPD-散度光谱/05-GOPD-散度光谱.md) 是 $\lambda$ 光谱）；**GRPO-OPD hybrid** 把教师信号塞进 GRPO 的 $J(\theta)$，不是 MiniLLM 那条散度目标，见 §5。
- **轴 2 绿格**：**01** 外教师全词表 = 白盒。黑盒只看见文本或标量分。**02** 的 $y^\star$ 特权上下文、**04** 的环境 feedback，都是同一套权重的自教师，进 teacher-free。两者的特权内容不同，不是同一件事。
- **轴 3 橙格**：GKD 的 $\lambda$ 混合与「先 off-policy 热身再 on-policy」是工业常走的稳法。采样 token 上的 $\mathrm{sg}[\log\pi_T/\pi_\theta]$ 省显存、方差大；V4 改全词表 reverse KL。裁剪 / log 压缩是 Demystifying 给长度作弊的药，见 [07](../../07-OPD-失败模式/07-OPD-失败模式.md)。

轴 1 后半段（自适应、RL 增强）的论文很多，机制分叉只有两句：完美优化任意 $f$-散度，学生贴近教师、很难超过教师；要超过，得把任务奖励打进目标（G-OPD 的 $\alpha>1$ 外推，或 GRPO-OPD hybrid）。那是另一条目标，不是「OPD 换了个 KL 就变成 RL」。

综述 §3.3 的选型不是菜单，是硬约束。教师只能给 API 文本时，轴 1 的精确 token 级 FKL 直接不可行，只能走黑盒序列级（口头分、排序、rubric）。任务几何也管散度：唯一正确答案偏 reverse KL；开放生成偏 forward KL；指令跟随居中，GKD 写 $\lambda\geq 0.5$ 配 JSD。算力上，综述把「先 off-policy 热身、再 on-policy 收口」写成 $>5000$ GPU-hours 档的常见工业形状——那是选型口吻，**不是** Table 21 的 1,800 / 17,920；后两个格子只属于 Qwen3-8B、math+code，见 §7。

推理任务上，综述把式 (3) 写成对学生自己的思维链 $r^S\sim P_\theta(\cdot \mid x)$ 做 KL（他们的 CoT-OPD）。证明从「反证」起头和从「归纳」起头，后面的 token 完全不是一条路；off-policy 只覆盖教师写过的有限路径，学生推理时要走自己的死胡同与挽回。这不是新公式，是式 (1) 在路径依赖任务上的同一句。

## 4. 白盒 / 黑盒 / teacher-free：把 01、02、04 放进格子

轴 2 的密度从左到右下降、自主性上升。白盒每步给 $|V|$ 维分布（Hinton 的 dark knowledge）；黑盒往往只剩 top-1 文本或一个分数；无外教师则用同一套权重的条件不对称当教师。本库三篇专文各占一格或一格的一个槽，表在原专文。

| 格子 | 教师看得见什么 | 本库放谁 | 不是谁 |
|------|----------------|----------|--------|
| **白盒** | 学生前缀上的全词表 logits / 隐状态 | **[01](../../01-OPD-学生前缀蒸馏/01-OPD-学生前缀蒸馏.md)**：外部强教师（Qwen3 Strong-to-Weak 的 32B / 235B-A22B 压 8B 是这一格的工业例）。跨词表要对齐（综述 DSKD / ULD / SimCT），01 不覆盖 | 不是 02 的开卷 $y^\star$，不是 04 的编译器文本 |
| **黑盒** | API 文本、口头评分、成对排序、rubric | 综述 Lion / GAD / OVD / ROPD。成对偏好是 OPD 的降级接口 | 不是 DPO 本体；DPO 优化偏好对、不必在学生前缀上查教师 logits。见 01 |
| **Teacher-free** | 同一套 $\theta$，条件不对称 | **[02-OPSD](../../02-OPSD-参考解自蒸馏/02-OPSD-参考解自蒸馏.md)**：教师多看参考解 $y^\star$，学生闭卷采样，**需要 $y^\star$**。**[04-SDPO](../../04-SDPO-环境反馈蒸馏/04-SDPO-环境反馈蒸馏.md)**：教师多看环境 rich feedback（堆栈、失败单测、同组成功解），对已生成 $y$ 重算 log-prob | 02 不是「全靠自己探索、没有满分答案」——没有 $y^\star$ 时教师退化成学生，散度为 0。04 不是 02 的 golden，也不是把 reverse KL 塞进 DPO |

[03-SDFT](../../03-SDFT-示范持续学习/03-SDFT-示范持续学习.md) 与 02 同属特权上下文自教师：教师多看示范 $d$，学生仍 $\pi_\theta(\cdot \mid x)$。持续学习那张表（70.6 / 65.4 = Table 5 单任务 Tool Use）在 03。[06-SCOPE](../../06-SCOPE-置信度门控/06-SCOPE-置信度门控.md) 是轴 3：信号进损失前的门控，不改 OPD 目标。

白盒还有一条工程分叉，和 09/10 对得上：许多 RL 栈把每步 KL 收成**已采样那个** $y_t$ 上的 $\log\pi_\theta-\log\pi_T$ 当优势；V4 写这条方差大，改**全词表** reverse KL，并缓存教师 hidden、训练时过 lm_head 还原 logits。K3 / MiMo 仍走采样 token 上的 clip 对数比，官方名还叫 MOPD。捆法与超参在 [09](../../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md) / [10](../../10-OPD-各家报告对照/10-OPD-各家报告对照.md)。

轴 3 的成本来自「每步新鲜生成」。综述把 $N$ 个 token 的 off-policy 成本写成教师前向 + 学生前向后向；on-policy 还要乘上学生自回归生成 $G_{\mathrm{student}}$，以及教师监督刷新率 $\rho$。因为 $G_{\mathrm{student}}\gg F_{\mathrm{student}}$，on-policy 有一个明显乘数。他们给的 70B→7B、8×H100 示意是 off-policy 约 300 GPU-hours、on-policy 约 1,200–1,500（约 4–5×），那是**规模示意**，分母不是 Table 21，和 1,800 / 17,920 不是同一个故事。事实任务、翻译、摘要上 off-policy 天花板往往够用；推理 / 代码上静态教师轨迹盖不住组合路径，才把贵的 on-policy 留到最后一推。

黑盒格子容易被读成「所以 OPD 就是偏好学习」。综述自己把 ORPO-Distill、AlignDistil 放在「logit 拿不到、或序列级质量判断更自然」时的**替代接口**：用教师给的排序或对比 DPO 当奖励，再在学生 rollout 上优化。定义句仍是式 (1) 的 $y\sim p_\theta$，不是 DPO 的 $\sigma(\beta\log\pi_w/\pi_{\mathrm{ref}}-\cdots)$。

## 5. 和 GxPO 综述的边界：散度目标退出 $J(\theta)$，hybrid 留在框内

Shen et al. *[A Survey of LLM Policy Optimization from First Principles](https://arxiv.org/html/2606.16733)*（GxPO 综述）从 $J(\theta)=\mathbb{E}_{\tau\sim p_\theta}[R(\tau)]$ 出发。**纯散度 OPD** 被标成退出这条目标的边界：学生最小化与教师的散度，奖励因子被换掉，验证器可以不出现。他们写出的两条典型目标——MiniLLM 的 reverse KL、GKD 的 forward KL——就是 01 的两条地基，**沿用 01**。GxPO 家族专文是另一切片；本篇只借用这道墙。

**GRPO-OPD hybrid** 被留在 policy-gradient 框内：主目标仍是 $J(\theta)$，教师以稠密 $\tilde r_t$（常见 $\log\pi_T(y_t)/\pi_\theta(y_t)$）进入 GRPO 的重要性比、优势、期望内蒸馏或 KL 正则。这不是「OPD = GRPO」。MiniLLM / GKD 优化的是散度；GRPO 优化的是组相对标量奖励。hybrid 问的是：旁边已经有教师和验证器时，教师信号怎么进 GRPO，而不是把 GRPO 改名。

[04-SDPO](../../04-SDPO-环境反馈蒸馏/04-SDPO-环境反馈蒸馏.md) 换的是 **GRPO 的 token 级优势**：环境 $f$ 条件化同一套权重当自教师，KL(学生 $\parallel$ stopgrad(教师))，命题把梯度写成词表上的 $A_{i,t}$。它更靠近 hybrid（教师信号当 $A$），而不是 MiniLLM 的序列级 reverse KL + REINFORCE。LCBv6 / Qwen3-8B 的 **48.8 vs GRPO 41.2** 在 04 的表里。SDPO 没有证明「OPD 就是 GRPO」，也没有把 OPD 写成 DPO 变体——04 没有偏好对。

一张对照就够：

| | 优化什么 | 采样 | 和 GRPO 的关系 |
|--|----------|------|----------------|
| MiniLLM | reverse KL | $y\sim q_\theta$，梯度过采样 | 不是 GRPO；碰巧能写成以 $\log(p_T/q_\theta)$ 为奖的 PG |
| GKD | 前缀上的 $\mathcal{D}(p_T,p_S)$，默认可 forward | $y\sim p_S$，**stop-grad 采样** | 更像带学生状态的监督 KD |
| 纯散度 OPD（GxPO 边界） | 退出 $J(\theta)$ | 学生轨迹 | 用不上组相对 baseline、过程奖励那些奖励侧零件 |
| GRPO-OPD hybrid | 仍最大化 $R(\tau)$ | 仍 GRPO rollout | 教师 $\tilde r_t$ 进 $A$ 或正则 |
| SDPO（04） | 自教师 KL；换掉 GRPO 的 $A$ | 学生 rollout + 环境 $f$ | 不是 DPO；弱模型上还要和标量 $r$ 杂交 |

## 6. 失败模式：07 已经诊断，这里只补两篇指针

高熵处 reverse KL 捏尖峰、捷径作弊、长链蒸发，本库 [07](../../07-OPD-失败模式/07-OPD-失败模式.md) 已经按机制写过。综述 §7 另外收了 flawed prefix trap、自博弈饱和、diversity collapse（Pass@1 升 Pass@$k$ 掉）、校准–能力缺口、多轮 agent 坍缩。细节在 07。这里只把 2026 两篇诊断论文接到同一扇门上——它们处理的是「采样 token 实现」和「教师信号是否忠实」，不是再发明第三套病名。

**Demystifying**（[arXiv:2607.13399](https://arxiv.org/html/2607.13399)，Wang et al.）：把 OPD 的角色说成**探索催化剂**，不是能力天花板扩展器。Qwen3-1.7B-Base 上，低 $k$ 的 pass@$k$ 明显高于 Base / GRPO，高 $k$ 与 Base 收敛——说明它在已有可达轨迹里把对的路径提前摸到，而不是注入新能力。固定算力下，**题面多样性**比每题多采几条更值钱。问题在于信号是否忠实：师生分布差太大时，教师在学生轨迹上的偏好与对错**反相关**（他们的 Informativeness $\mathcal{I}$；最强的 4B-GRPO 教师反而教不动 1.7B-Base）。长度作弊有两种：用填充稀释负优势（Endless Exploration），或截在教师喜欢的短前缀上拿高平均优势（Abrupt Degeneration）。药是对 $\Delta\ell_t$ 硬 clip 或 $\mathrm{sgn}\cdot\log(1+|\cdot|)$，不是换更大教师。细节与图在原文；07 的高熵坍缩 / 长度病是同一家族的另一侧写。

**Revisiting**（[arXiv:2603.25562](https://arxiv.org/html/2603.25562)，Fu et al.）：token 级 OPD 相对序列级 reverse KL **有偏**，但最坏方差从 $O(T^4)$ 收到 $O(T^2)$，长链更用得上。工业常见实现却把 token 级再收成**单个采样 token** 的 log 比，于是出现三病：信号严重不平衡（多数采样 token 得负奖）、学生前缀上教师不可靠（复读循环里教师仍局部同意）、词表 / 特殊 token 错位。他们的修法是教师 top-$K$ 局部支撑上的截断 reverse KL，加上 top-$p$ rollout 与特殊 token 掩码；单任务推理上相对 sampled-token OPD 约 **+19.8%**（论文摘要；分母见原文实验设置）。这解释了 V4 为什么改全词表、以及 09 里 K3 仍走 clip 对数比时方差从哪来。机制对照在 09/10，数字不搬到 Table 21。

综述还强调：教师在学生胡写的前缀上校准会坏，无条件 token 匹配加周期性硬拷贝教师，会出现 KL 从 2.637 掉到 0.343 那种一次性坍缩（Jeong / TT-OPD）。资格条件与 01 §10.5 同一句：专家要在学习者状态上仍接近最优。没有可查询教师时，01 这套不成立，走 02。

## 7. 工业一句，Table 21 只复述分母

Qwen3 Strong-to-Weak、V4 多教师全词表 OPD、K3 / MiMo 的 MOPD（采样 token 对数比 ± clip / ORM）、GLM-5 跨阶段 checkpoint，是同一句 on-policy distillation 塞进**不同教师槽**。捆法、损失分叉、官方名对照见 [09](../../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md) 与 [10](../../10-OPD-各家报告对照/10-OPD-各家报告对照.md)。各报告超参、$R_{\max}$ / 组大小 / 专家个数不合成一套。

Table 21 的分母已经钉在 01 / 10，这里只复述格子，避免口口相传时掉分母：**Qwen3-8B**、同一个 **off-policy distilled 8B** checkpoint、**只比 math+code**；同一检查点上 RL 用 **17,920** GPU hours 把 AIME'24 推到 **67.6**，on-policy distillation 用 **1,800** GPU hours 推到 **74.4**（括号 pass@64）。1,800 / 17,920 ≈ 1/10 是这一行的算术，不是「所有后训练都用 1/10 算力超过 RL」，也安不到 V4。Qwen3 未点名正/反向 KL。150 steps / 77K prompts：01 已写未找到一手。

## 8. 失效条件

| 现象 | 原因 | 去哪 |
|------|------|------|
| 把 OPD 读成 Online Preference / DPO | 黑盒格子用了偏好接口 | §1 红标；01 §10.1 |
| 把 OPD 读成 GRPO | hybrid 与纯散度共用「on-policy + 教师」口吻 | §5；GxPO 综述 §8.1 / §9.1 |
| MiniLLM 公式套到 GKD 代码 | PyTorch `kl_div(log S, T)` 是 forward KL | 01 §10.3 |
| Table 21 安到 V4 / 通用 RL | 分母是 8B、math+code、同一 off-policy 点 | 01 / 10 |
| 07 的三种病在综述里换了名字 | 根因仍是前缀 OOD、mode-seeking、长度目标 | 见 07，加 Demystifying / Revisiting |
| 没有外教师还硬跑 01 | 式 (1) 的 $T$ 没有监督源 | 02（需要 $y^\star$） |

后面的机制仍走 4.6 各专文。GxPO 家族另写。

## 参考文献

1. Song & Zheng. *A Survey of On-Policy Distillation for Large Language Models*（[arXiv:2604.00626](https://arxiv.org/abs/2604.00626) / [HTML v3](https://arxiv.org/html/2604.00626v3)）。腾讯；[Awesome-LLM-On-Policy-Distillation](https://github.com/nick7nlp/Awesome-LLM-On-Policy-Distillation)。式 (1)(8)(9)；三轴；白盒 / 黑盒 / teacher-free；§7 失败；§8 工业。作者自称 first comprehensive OPD survey。
2. Gu et al. *MiniLLM*（[arXiv:2306.08543](https://arxiv.org/abs/2306.08543)）。沿用 01 式 (7)。
3. Agarwal et al. *GKD / On-policy Distillation of Language Models*（[arXiv:2306.13649](https://arxiv.org/abs/2306.13649)）。沿用 01 式 (8)(9)。
4. Wang et al. *Demystifying On-Policy Distillation*（[arXiv:2607.13399](https://arxiv.org/html/2607.13399)）。探索催化剂；mismatch；长度作弊。见 07。
5. Fu et al. *Revisiting On-Policy Distillation*（[arXiv:2603.25562](https://arxiv.org/html/2603.25562)）。sampled-token 三病；top-$K$ 局部支撑。见 07。
6. Shen et al. GxPO 综述（[arXiv:2606.16733](https://arxiv.org/html/2606.16733)）。纯散度 OPD 退出 $J(\theta)$；GRPO-OPD hybrid 留在 PG 框。
7. Yang et al. *Qwen3 Technical Report*（[arXiv:2505.09388](https://arxiv.org/abs/2505.09388)）Table 21。分母以 [01](../../01-OPD-学生前缀蒸馏/01-OPD-学生前缀蒸馏.md) / [10](../../10-OPD-各家报告对照/10-OPD-各家报告对照.md) 为准。

图 1、图 2 是机制示意，格子里没有准确率。
