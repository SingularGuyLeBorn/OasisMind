---
title: "08 · SkillEvolver：改的是技能文件，不是权重"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  SkillEvolver（arXiv:2605.10500）：冻结 CLI Agent，元技能写领域 SKILL.md。
  SkillsBench 83 题 avg@5：无技能 29.9%、人工策展 43.6%、R=2 56.8%。
  KernelBench 三题均加速 1.16→1.51。元技能自己不改自己，不是 RSI。
tags:
  - RSI
  - SkillEvolver
  - Harness
  - Agent Skill
  - SkillsBench
---

# 08 SkillEvolver：技能文件在进化

Agent 技能今天多半是一次性产物：人写一份，或模型按任务说明生成一份，然后冻住。用的时候失败了，文件不会自己长。SkillEvolver 把这件事收成**在线技能学习**：一只元技能驱动冻结的 CLI Agent，对刚到来的一道题，用有限几次训练变体试验，写出可复用的领域 `SKILL.md`（外加脚本、参考、探针），再交给另一只没见过作者上下文的 Agent 去用。学习对象是技能的散文和代码，不是 $\theta$。元技能本身也只是一份普通技能，Claude Code / Codex 一类能加载 skill 的协议 Agent 都能挂上。

本篇是 Harness 层里「技能包自改」的机制样板，和 [01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md) 同层不同刀：Argus 管**已经生成的状态凭什么入库**；SkillEvolver 管**一份可携带技能怎么从部署失败里长出来**。和 [07 ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md) 的差在「谁当 meta」：ADAS 用冻结的元 Agent 编程新 Agent；这里 Agent 冻住，meta 是技能文件，而且它**指示 Agent 去写另一份技能，并不改写自己**。一手：Zhang, Zhu, Zhou, Jia, Wang，清华 + 北京交大，[arXiv:2605.10500](https://arxiv.org/abs/2605.10500)（2026-05-11）；代码 [THU-AICosmos/skillevolver](https://github.com/THU-AICosmos/skillevolver)。主实验 **Claude Opus 4.6 + Claude Code**，Harbor 容器评测。作者写明没做全量跨模型扫描，头条数字绑在这一套配置上。

## 1. 问题：技能写完就死，离线蒸馏又太贵

Trace2Skill 一类把轨迹蒸成技能，大约每个域要挖 200 条轨迹、还要手写 Python 归并管线。SkillRL 在许多训练任务上用 RL 长技能库。覆盖面够，前提是域已经备好轨迹池或跨任务分布。真来的任务经常是一道一道来的，付得起的探索只有几次，技能就得交货。SkillEvolver 不跟它们比「谁蒸得更全」——任务级对池级，哪边都不公平——它只回答：刚到的一道题，几次试验，能不能交出下次还能用的文件。

SkillsBench（Li et al., 2026b, arXiv:2602.12670）把条件收成 A/B/C：无技能、人工策展技能、自生成技能。那篇已经报过：只靠参数知识盲生成技能，往往会伤分数。ACE 改的是上下文 playbook，还在同一只 Agent 的记忆里。SkillEvolver 要的是**另一只 Agent 也能加载**的独立目录。

污染面比普通 LLM 评测多一层：写技能的 Agent 自己可能读到训练标签，再把文件名、常数写进 `SKILL.md`。论文用两层门：训练变体 $T_{\mathrm{train}}$ 和验证 $T_{\mathrm{val}}$ 文件名、数值、有时子域都不同；策展训练技能在探索前从源删除。工作区白名单 + `PreToolUse` hook，验证目录和测试套件在前缀外。这不是对齐证明，是评测纪律。没这条纪律，56.8% 没有资格对人工策展说话。

## 2. 元技能：Agent 冻着，改的是另一份文件

Hu et al. 的 ADAS 把 meta 写成「基础模型去编程新 Agent」。SkillEvolver 借用 meta-X 这个名字，换了扮演者。CLI Agent（SkillEvolver Agent）固定。元技能告诉它：不要直接把这道题做完，去为这道题写一份领域技能。学习信号不是作者对自己轨迹的反思，而是**另一只** Domain-Skill Agent——只拿到候选技能和任务——实际怎么干、怎么失败。作者写得很死：元角色由技能承担，它指示 Agent 去写**另一份**技能，而不是修改自己。

所以文件树上有两份东西，不要收成一个「自改 Agent」。

- **元技能** `skill-evolver/SKILL.md`：Understand / Iterate / Finalize / Validate，外加写技能指南和适配 README。这份在实验里不进化。
- **领域技能** `<domain>/SKILL.md`：策略、决策规则、用法、部署备注、脚本、探针。这份才是 $v_r$。

部署表面：元技能在 $T_{\mathrm{train}}$ 上把 $v^*$ 写出来；验证时 Domain-Skill Agent 只加载 $v^*$，不再加载 SkillEvolver。交货物可以离开作者会话。这是和 Reflexion / Self-Refine 的差：那些把教训留在当前轨迹里；这里教训必须写进另一只 Agent 读得懂的文件。

## 3. 一轮：多样策略、对比、补丁、独立审计

记当前领域技能为 $v_r$，训练任务 $T_{\mathrm{train}}$。一轮交出 $v_{r+1}$。主实验探索宽度 $K=4$，迭代帽 $R=2$，验证 $V=5$。Harbor 是容器评测框架（harbor-framework/harbor）。控制组只跑 $V=5$ 次验证；Evolver 的探索也进 Harbor，所以 $R=2$ 每题 13 次试验不是「多刷了验证」，是训练变体上的部署抽样。单题 15 美元 / 200 轮是硬帽，3.92 美元均值远在帽下，不代表放开帽还能再涨 8.7 个点。

**策略多样化，不是调温度。** 第 $r$ 轮先写出策略集 $S_r=\{s_{r,i}\}_{i=1}^{K}$，每条是不同的高层方案（库选择、算法族、指令解读），再给每条派一只新的 Domain-Skill Agent。温度只改用词和工具细节，高层计划经常撞车。作者还要求：没有任何两条在所有主轴上相同；把训练常数标成不变或参数化，参数轴上至少有一条策略运行时重算，不许抄训练值。$r=0$ 还没有领域技能，部署的是「只按 $s_{0,i}$ 走」的最小技能。$r>0$ 时 $v_r$ 已经在容器里当真依赖，策略文件对准上一轮暴露的弱点。

$$
(\tau_{r,i},\, y_{r,i})=\mathrm{Trial}(v_r,\, T_{\mathrm{train}},\, s_{r,i}),\qquad i=1,\ldots,K. \tag{1}
$$

**对比更新技能，不更新策略网络。** 二值任务（SkillsBench）取过/不过；标量任务（KernelBench）取最高/最低分轨迹。对比信号

$$
\Delta_r=\phi(\tau_r^{+})\setminus\phi(\tau_r^{-}), \tag{2}
$$

$\phi$ 是用 LLM 读轨迹、抽任务相关特征，不是程序解析器。$r=0$ 问赢家会什么、输家缺什么；$r>0$ 问技能在哪误导、说少了、没能指挥 Domain-Skill Agent。ETO（Song et al., 2024）把这类对拿去 DPO 更新 Agent 权重；这里当言语强化，补丁打在文件上：

$$
\tilde v_{r+1}=\mathrm{Patch}(v_r,\,\Delta_r). \tag{3}
$$

$r=0$ 从对比里**创建** $v_1$；$r>0$ 做局部补丁，不整份重写。会进预训练就会的特征不加。脚本必须吃运行时输入，不许绑训练文件名或答案。

**独立审计。** Auditor 是另一段干净会话，只看到候选技能、任务说明、训练数据和带标签轨迹，看不到 $T_{\mathrm{val}}$，也看不到 Evolver 的私有推理。

$$
(a_r,\, E_r)=\mathrm{Audit}(\tilde v_{r+1},\, T_{\mathrm{train}},\, \{(\tau_{r,i},y_{r,i})\}_{i=1}^{K}). \tag{4}
$$

Table 3 九条机械检查。1–6 是内容过拟合：业务名词当技能名、写死文件名、超 200/400 行脚本、无来源的命令句、按列名硬索引、交叉引用训练字符串。7–9 是部署态才看得见的病：参数轴没抽象、主脚本没抬到 `SKILL.md` 头上（using-agent 先读约束再也不调脚本）、静默绕过（技能宣称有主脚本，失败轨迹里一次 Bash 都没调它）。7–9 标星，命中就强制下一轮对着这条补。干净且训练通过率够（伪代码里 $\#\mathrm{pass}(\tau_r)\ge 3K/4$）可以提前停；否则打到 $R$。Finalize 在 $\{v_j\}$ 里按训练通过率、轨迹成本、泛化风险挑一份写进部署目录，**这一步不再调 Harbor**。验证只在 $T_{\mathrm{val}}$ 上跑 $V$ 次。附录 Algorithm 1 把「部署当真依赖」写成第 7 行：从 $r=1$ 起 $v_r$ 装进试验容器的 `skills/`，第 10 行的对比才反映**使用方**被帮了还是被带偏。$v_1$ 蒸馏完会镜像一份到 `output/` 作失败安全副本。Oracle 策略是不确定度驱动：轨迹留下缺口才读 `test/outputs.py`，仍不清楚才升级到 `solve.sh`——不是开局就把标准答案灌进技能。SkillCreator-SkillsBench 相反：Eval Designer 按设计读满训练上下文，Grader / Analyzer 被禁止读技能源码。

对照基线 SkillCreator-SkillsBench 把 Anthropic 官方 skill-creator 的人接点换成 Eval-Designer / Grader / Analyzer 子 Agent，看到的训练上下文与 Evolver 相同，差只在写作机制。它的探索不走 Harbor 部署，验证才进 Harbor（每题 5 次，对 Evolver 的 13 次）。所以 33.9% 对 56.8% 比的是「同样看见 $T_{\mathrm{train}}$，一种是子 Agent 采访式写作，一种是把技能当依赖再打补丁」。ACE 的 playbook 还住在同一只 Agent 的上下文编辑里；这里交货物必须离开作者会话，另一只 Agent 冷启动加载。Trace2Skill 按域蒸约 200 条轨迹，本方法声称典型只要四次部署试验、没有域级管线。池级方法更全，任务级方法更便宜，论文把它们写成动机而不是可对打的基线。

![元技能驱动：策略多样化探索 → 对比补丁 → 独立审计；领域技能离开作者会话](./images/fig-skillevolver-loop.png)

> 图 1：实线是一轮 $v_r\to v_{r+1}$。虚线是 Auditor 的 fresh session。$T_{\mathrm{val}}$ 不进这条实线。

**图 1 解析**

- **Strategize**：写 $K$ 份高层策略，不是升温采样。
- **Explore**：Harbor 里 $K$ 只 Domain-Skill Agent；$r>0$ 时 $v_r$ 已装进容器。
- **Analyze / Synthesize**：$\Delta_r$ 变成对文件的局部补丁。
- **Auditor**：九条门。静默绕过只在「技能当依赖」时才测得到。
- **Domain skill out**：验证 Agent 不再加载元技能。

对照基线 SkillCreator-SkillsBench 把 Anthropic 官方 skill-creator 的人接点换成 Eval-Designer / Grader / Analyzer 子 Agent，看到的训练上下文与 Evolver 相同，差只在写作机制。它的探索不走 Harbor 部署，验证才进 Harbor。所以 33.9% 对 56.8% 比的是「同样看见 $T_{\mathrm{train}}$，一种是子 Agent 采访式写作，一种是把技能当依赖再打补丁」。

## 4. 数字：56.8% 从哪来，第二轮贡献了三分之二

四题剔除（付费 API、Harbor 不稳）对称作用于所有条件，剩下的 83 题才是可以和人工策展对打的范围。87 减 4 不是偷偷丢掉难例。指标 avg@5：五次里过几次，4/5 记 0.8，再对 83 题取均值。83 题跨 15 个以上专业域（Web、数据、DevOps、化学、量子、金融、音视频等），不是单域刷分，也不是只测写代码。

| 条件 | avg@5 | 相对无技能 |
|------|------:|-----------:|
| 无技能 | 29.9% | 0 |
| Self-Gen（Li et al. 盲生成） | 32.0% | +2.1 |
| SkillCreator-SkillsBench | 33.9% | +4.0 |
| 人工策展 | 43.6% | +13.7 |
| SkillEvolver $R=1$ | 48.2% | +18.3 |
| SkillEvolver $R=2$ | **56.8%**（正文 56.87，表 56.9） | +27.0 |

$R=1$ 已经比人工策展高 4.6 个点；$R=2$ 再抬 8.7 个点，相对策展变成 +13.3。作者把第二轮写成「策展优势里大约三分之二」——不是抛光。和策展逐题：赢 24/83（28.9%），平 38/83（45.8%），输 21/83（25.3%）；$\ge$ 策展的累计 62/83 = 74.7%。头条来自**可解集合变宽**，不是每题都压过手写。大约四分之一题手写仍赢，典型是强领域 DSL、惯例压过元技能散文。

域切片（Table 1，$R=2$）：科学 83.9、机器人 84.0、媒体 72.0、办公 63.8、网安 60.0、软件工程 50.4、金融 40.0。$R=1$ 在软件工程上只有 18.0，低于无技能 35.0——一趟蒸馏可以写坏；第二轮拉回 50.4。平均 56.8 会把这种回退藏起来，读表必须看域，不能只看总分。

SkillsBench 的效用分类把题切成：A 无技能就会（$n=20$）、B1 策展有帮助、B2 中性、B3 策展有害、C1/C2 策展才解锁、D 两边都不会（$n=23$）。A 桶上管线按设计不调用，柱子重复无技能：无技能 0.94，Evolver 0.89——已经会做的题，装技能可能轻微缴税。增益集中在策展最差的地方：D 从 0 拉到 0.40，$R=1$ 只有 0.20；C1 到 0.78。B1 上策展 0.64、Evolver $R=2$ 0.65，几乎持平。B3 上 $R=1$ 0.57、$R=2$ 0.47——**第二轮会回退**。迭代补丁不是免费午餐，最大可见失败会被加硬，别的坑仍在。发票欺诈那题 $R=1$ 0.6 → $R=2$ 0.4 是同一病：把最大失败当成全部问题。B2 只有两题，+60 个点方差极大，本篇不当稳定效应。

KernelBench 三题（deepnarrowmlp / shufflenet / gru），奖励是正确性 $\times$ 相对 PyTorch 的加速，H100。无技能均加速 1.16，$R=2$ 到 **1.51**。分题：1.027→1.089、1.117→1.218、1.326→**2.226**。样本只有三，作者没跑非 Evolver 基线，**不要**把它听成第二主榜。$R=1$ 对 $R=2$ 在 shufflenet 上不如第一轮稳。附录把学到的东西收成三类，而不是记一个 kernel 窍门：按架构分流（matmul 重的 MLP/CNN 对序列 RNN，不要同一套精度/编译器）；只在轨迹显示稳定时才上布局改写、融合、cuDNN、graph capture；把失败的精度和编译选择写成负约束——连续奖励里半对的点子仍拿得到非零分，负课不写进文件就会反复试。gru 增益最大，因为看起来都合理、产量却低的干预特别多；技能把死路写成约束，使用方少在那上面耗搜索。能说的只有：同一套写作环也能吃标量优化，不是只能做二值工作流。

成本（Table 2）：$R=2$ 每题 **3.92** 美元，比 $R=1$ 的 3.64 只贵 8%，换 8.7 个点；SkillCreator-SkillsBench 要 6.97。83 题扫一遍大约 300 美元量级。验证侧相对无技能：token 423.9k → 341.9k（−19.4%）、轮次 12.5 → 10.6（−15.3%）、墙钟 201s → 153s（−23.8%）。SkillCreator 写出来的技能反而更肥：525.4k token、14.6 轮、208s——添了散文，没压缩下游劳动。训练侧 $r=1$ 相对 $r=0$ 也略便宜（299.3k→281.4k，−6.0% / −8.9% / −6.9%），因为 $v_1$ 已经在。作者把这些效率信号写进对比，但没把逐步 verifier、关键路径延迟折进 $\Delta_r$；结论里把更富的过程信号列为未做。

## 5. 失效：域间隙、静默绕过、把启发式烤进下一域

附录案例比表更有用。制造 FJSP：$v_1$ 列了子任务菜谱，没把主脚本抬到文件头，试验卡在「先调哪个」；$v_2$ 抬上去，过关，后来写进检查第 8 条。论文匿名化：散文对了，发现用的 `inspect_pdf.py` 没打进 `scripts/`，试验执行不了规定策略。VirtualHome：正文对，frontmatter `description` 触发不了 Claude Code 的 Skill 工具，试验按题面例子手写 PDDL，被 `PDDLReader` 拒。这三件都是**文件形态**失败，不是 $\theta$ 不够。

反向。法庭填表：无技能 4/4，$R=1$ 和 $R=2$ 都 0/5。训练是医疗intake，验证是加州小额诉讼 SC-100。库级知识还在（43/47 子测仍过）；四条失败都是「描述没提到的默认否复选框必须主动勾上」。技能却学会了医疗表那条「只填提到的字段」。精炼对着同一份训练再烤，启发式更深。单域训练变体给不了「抽象掉域规则」的信号。PPT 参考文献格式：失败轨迹缺自动编号项目符号，技能写得很细；通过轨迹第 634 行还设了居中对齐，对比只盯失败原因，验证全死在 `algn=ctr`。这是「只分析失败、不覆盖通过轨迹」的病理。

作者自己划的剩余失败三类：管线 bug（欠抽象、丢发现脚本、静默绕过、train/val schema 漂）——7–9 条在堵；训练/验证域间隙，当成真实 in-domain shift；模型能力墙（CPU 上 whisper-large-v3 过不了说话人分离，策展 oracle 在他们硬件上也过不了）。

局限写在结论，不要漏。头条只绑 Opus 4.6 + Claude Code，GPT+Codex 只做通跑点测。$R=2$ 是算力帽，不是测过的最优，$R\ge 3$ 没扫。没有技能库：一次一道题，不去重、不维护亲子特化。和 Hermes「用满五次工具就写 SKILL.md」不是同一篇论文；产品规则以各家文档为准，本篇不把未打开的 README 数字写进来。

## 6. 这算不算 RSI

$S$ 若取「当前领域技能目录」，$v_{r+1}$ 确实来自 $v_r$ 的补丁，下次 Domain-Skill Agent 加载的是新文件。这是 **Harness 层的技能产物迭代**，和 FunSearch 搜函数、Argus 把过门的 $H_t$ 留给下一 mission 同一大类：改的是模型外面那圈可持久状态。

缺的刚好是导读式 (2) 的改进器身份。元技能——真正的 $I$——实验里不改自己。作者原句：它让 Agent 写另一份技能，而不是修改自己。$\theta$ 冻结。$T_{\mathrm{val}}$、Harbor 协议、九条审计、$\mathrm{Patch}$ 怎么写，都在墙外。混元台阶上最多蹭到「脚手架经验变成下次还能加载的文件」，到不了改进器递归，更到不了改考纲。

和邻居再钉一次。[Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md) 的门在运行时状态；$I$ 是四角色合约，也不进 $S'$。[DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md) 改自己的 Python，内环改进器在 $S$ 里，才是弱 RSI 候选。[ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md) 元 Agent 冻死，搜下游 `forward`。SkillEvolver 更像「冻元技能 + 搜领域 SKILL.md」，结构近 ADAS，交货物近 Argus 的技能文件，递归深度浅于 DGM。自进化评测环境 SEAGym（arXiv:2606.17546）问的是另一件事：harness 改完以后留出集、回放、成本会不会一起坏；机制数字不在本篇，线索在 [第 5 章 06](../../5-实验室与公司/06-实验室动态/06-实验室动态.md)。

![上排领域技能 $v_r$ 在补丁；下排元技能、$\theta$、审计条款与 $T_{\mathrm{val}}$ 仍在墙外](./images/fig-skillevolver-not-rsi.png)

> 图 2：实线只更新领域技能。虚线来自不进化的元技能、冻结 FM、独立审计和留出验证。

**图 2 解析**

- **Domain skill $v_r$**：散文 + 脚本。这是唯一进 $S'$ 的东西。
- **Meta-skill frozen**：`skill-evolver/SKILL.md` 不参与补丁。
- **FM $\theta$ frozen**：Opus 4.6 权重点不着。
- **Auditor + $T_{\mathrm{val}}$**：门和考纲在更新边界之外。没有它们，56.8% 不能对人工策展说话。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness，可加载的技能目录。权重动了吗？没有。递归在哪闭合？领域技能下次还被另一只 Agent 用；元技能没有闭合。还缺什么才敢叫 RSI？元技能或审计条款进入 $S'$，并且下一轮改进器就是升级后的那份。

**读**：$K=4$、$R=2$、83 题 29.9 / 43.6 / 56.8、KernelBench 1.16→1.51、3.92 美元、静默绕过、法庭填表负迁移。  
**不读**：把 56.8% 听成权重递归、把元技能听成已经自改、把三题 GPU 均加速听成第二主榜、用专栏 Hermes 规则补本篇数字。

下一篇同层可回 [01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md) 看门，或 [04 DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md) 看真正改自己代码的档案。产品 CLI 细节回 llm-guide 第 13 章。

## 参考文献

1. Zhang, G., Zhu, E., Zhou, J., Jia, C., & Wang, H. (2026). [SkillEvolver: Skill Learning as a Meta-Skill](https://arxiv.org/abs/2605.10500). arXiv:2605.10500. $K=4$、$R=2$、Table 1 / 2 / 3 以 HTML 为准。
2. [THU-AICosmos/skillevolver](https://github.com/THU-AICosmos/skillevolver). Apache 许可叙述以仓库 README 为准。
3. Li, X., et al. (2026). [SkillsBench](https://arxiv.org/abs/2602.12670). arXiv:2602.12670. A/B/C 框架与 83 题范围。
4. Hu, S., Lu, C., & Clune, J. (2024). [Automated Design of Agentic Systems](https://arxiv.org/abs/2408.08435). meta-X 命名来源；本园 [07 ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)。
5. Ouyang, A., et al. (2025). [KernelBench](https://arxiv.org/abs/2502.10517). arXiv:2502.10517. 三题探针，不是第二主榜。
6. 本花园：[01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)；[01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。
