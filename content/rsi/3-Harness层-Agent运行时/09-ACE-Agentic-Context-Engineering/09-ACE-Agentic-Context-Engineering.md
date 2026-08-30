---
title: "09 · ACE：playbook 在长，角色和权重都不动"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  ACE（arXiv:2510.04618）：冻 θ，三项分工写条目化 playbook。
  AppWorld 上 ReAct 42.4 → 离线有标签 59.4、在线 59.5；相对 GEPA / DC 平均约 +10.6。
  金融离线有标签均 81.9。不是 RSI。合并是非 LLM 代码。
tags:
  - RSI
  - ACE
  - Agentic Context Engineering
  - Harness
  - playbook
  - AppWorld
---

# 09 ACE：上下文当活页，不当摘要

会写 skill、会往 prompt 里塞一段「下次注意」，看起来像自进化。现成的提示优化器却经常把这段话**越改越短**：GEPA 一类把简洁当优点，领域启发式、工具失败模式被压成一句空话。另一条路更狠——每步让 LLM **整段重写**累积上下文。AppWorld 上 Dynamic Cheatsheet 的个案：第 60 步还有 18,282 token、准确率 66.7；下一步塌成 122 token，准确率 57.1，比不适应的 63.7 还差。作者把这两件事叫做 **brevity bias** 和 **context collapse**。

ACE（Agentic Context Engineering）把上下文改写成**活页 playbook**：一条条带编号的策略，只追加或就地改计数，不整本重抄。权重不动。三项分工冻死：Generator 跑轨迹，Reflector 提炼教训，Curator 写成增量条目，再由**非 LLM 逻辑**合并。宣传句是 self-improving language models。花园要钉的是：改的是 $H_t$，三项角色和合并代码都在墙外。

本篇是 Harness 层里「上下文自改」的样板，和 [08 SkillEvolver](../08-SkillEvolver-元技能/08-SkillEvolver-元技能.md) 同层不同交货：那边交出可携带的领域 `SKILL.md`，给另一只没见过作者会话的 Agent 加载；这边 playbook 住在同一只 Agent 的输入里。[01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md) 管生成的状态凭什么入库；ACE 几乎来者不拒，靠 helpful / harmful 计数和嵌入去重来长。第 6 章 [SEAGym](../../6-评测与安全/03-SEAGym-Harness评测环境/03-SEAGym-Harness评测环境.md) 把 ACE 当三条 harness 基线之一，那是另一套协议、另一只骨干，数字不和本篇 Table 1 横加。一手：Zhang, Hu 等，Stanford / SambaNova / UC Berkeley，[arXiv:2510.04618](https://arxiv.org/abs/2510.04618)；代码 [ace-agent/ace](https://github.com/ace-agent/ace)。主表骨干 **DeepSeek-V3.1**（非 thinking），Generator / Reflector / Curator **同一只模型**，避免强 Reflector 把知识偷渡给弱 Generator。数字以 HTML Table 1–4 为准。摘要里的 **+10.6% / +8.6%** 是相对「选中的强基线」的平均增益，不是相对裸 ReAct 的 +17.0。两套数都要会读。

## 1. 问题：提示优化器会变短，整本重写会塌

上下文适应 = 改输入，不改 $\theta$。系统提示、记忆、检索证据都算。优点写在引言：可解释、运行时能塞新知识、复合系统里模块能共享。长上下文模型和 KV cache 复用让「堆详细 playbook」在工程上突然显得便宜——这句是动机。本篇测定仍是 AppWorld 和金融两张表，外加附录的 DDXPlus / BIRD-SQL，不是「长上下文已经免费」的账单证明。

现成方法走自然语言反馈：模型看当前上下文和执行痕迹，写出该怎么改，再写回去。Reflexion 反思失败；TextGrad 把批评当文本梯度；GEPA 用执行痕迹做遗传 Pareto 搜提示，官方 DSPy 实现、本实验 `auto="heavy"`；Dynamic Cheatsheet 在推理时攒策略备忘。作者的诊断不是「反馈没用」，是两条失效：

- **Brevity bias。** 优化目标偏向短而通用的指令。Gao 等在单测生成上看到迭代优化收敛到几乎同一句 “Create unit tests…”。领域启发式、工具用法、失败模式被当成噪音丢掉。Agent 和知识密集任务刚好靠这些细节。
- **Context collapse。** 每步整本重写。上下文一长，模型倾向压成短摘要，累积知识一次性蒸发。上面 18,282 → 122 token 的例子挂在 Dynamic Cheatsheet 上，作者声明这不是该方法私有的病，是「让 LLM 做端到端重写」的结构风险。

ACE 把审美从人挪到模型。当前提示优化器几乎都在奖励更短、更通、更好读。人读起来干净，Agent 做题时却缺工具坑、缺失败模式、缺「上次 API 返回空列表时该怎么办」。短指令在 HotPotQA、Game of 24 上够用，作者自己把这两类任务写成反例。AppWorld 和 XBRL 金融抽取要的是另一类东西：工具片段、失败案例、领域概念。长上下文里模型自己会挑段落，人觉得啰嗦的条目对 Generator 往往更有用。上下文于是被写成带编号的 playbook，而不是压缩后的口号。

离线和在线是同一套零件、两种日程。离线：在训练题上多 epoch 优化系统提示一类的上下文，再冻住去测。在线：测试时按到来的样本改记忆。batch size 全程是 1（每个样本造一份 delta）。Reflector 最多打磨 5 轮；离线最多 5 个 epoch。warmup 可以把离线长过的书带到测试日，Table 3 把有无预热拆开报。这些帽是人钉的 $I$，不是 playbook 自己搜出来的。playbook 里不会长出「下次把 Reflector 改成 8 轮」这种条目，至少主实验没让它长。

## 2. 机制：三条角色，合并不经过 LLM

playbook 不是一整段 prompt，是条目集合。一条 bullet 至少有：唯一 id、被 Generator 标成有用 / 有害的计数、一段内容（可复用策略、领域概念、常见失败）。解题时 Generator 指出哪些条目帮了忙、哪些在误导，Reflector 拿这个反馈提议修正。

一轮可以收成

$$
H_{t+1}=\mathrm{Merge}\bigl(H_t,\;\Delta(\mathrm{Curator}(\mathrm{Reflector}(\tau_t,f_t)))\bigr). \tag{1}
$$

$\tau_t$ 是 Generator 在当前 $H_t$ 和查询 $x$ 上跑出的轨迹，$f_t$ 是环境反馈（代码成不成功、公式对不对，或——若实验允许——训练标签）。$\Delta$ 是一小撮候选条目，不是整本新书。$\mathrm{Merge}$ 是轻量、**非 LLM** 的确定性逻辑：新 id 追加，旧 id 就地改计数。因为条目化、局部化，多份 delta 可以并行合并。这是和「每步请模型重写 1.8 万 token」的全部差别。collapse 的切口在 Merge：模型再也拿不到「请把整本书缩成一段」的机会。

一条 bullet 可以写成 $(id,\;c^{+},\;c^{-},\;\mathrm{content})$。$c^{+}$ / $c^{-}$ 是 Generator 事后投票，不是形式验证。下次解题时 Generator 先读整本，再在轨迹里点名哪些 id 帮了忙、哪些在误导。Reflector 看见的是轨迹加这份投票，外加 $f_t$。Curator 只被允许交 $\Delta$：若干条新内容，或对旧 id 的计数修正。Merge 按 id 做并集。语义嵌入去重发生在追加之后，或窗口告急时：太像的两条合成一条，防止同一条失败模式换措辞进十遍。作者把这一步叫 grow-and-refine。它防的是冗余，不防有害。有害条目靠 $c^{-}$ 涨、Generator 少引用，没有「删掉这条」的证明义务。Argus 用四角色合约挡入库；这里用计数软挡。软挡在有执行器的环境里够用，在金融抽取里不够——Table 2 会给出负号。

三项分工故意拆开。Dynamic Cheatsheet 已经是 agentic 记忆；ACE 多出来的是独立 Reflector：评价和提炼不跟「往书里写什么」挤在同一只嘴里。消融 Table 3 把这句话钉成数。去掉 Reflector 和多 epoch，离线均从 59.4 掉到 55.1；只去掉多 epoch，掉到 56.8。Reflector 不是装饰，多扫几遍训练题也不是装饰。batch size 钉死为 1 的理由写在方法里：每条样本的教训局部、可并行合并；放大 batch 会把多条轨迹的 delta 搅在一次 LLM 调用里，条目化的好处就没了。

三项用同一只 LLM、同一套非 thinking 模式。这不是省钱，是防漏。若 Reflector 换成更强模型，它可能把 Generator 根本写不出的策略写进 playbook，分数涨了却说不清是上下文适应还是暗中蒸馏。换骨干时三只一起换，算法和 prompt 不改。附录在 GPT-OSS-120B、GPT-5.1、Llama-3.3-70B-Instruct 上重复了 AppWorld 或金融。弱模型增益更小，因为反思更吵——Llama 在 FiNER 上只 +2.4，同一套角色几乎空转。这是局限段自己写的：$I$ 假设了「Reflector 提得出能用的教训」。

有标签和无标签是 Reflector 看不看得见金标，不是两套算法。Agent 任务上，执行成败本身就能当 $f_t$，所以无标签仍然涨。离线无标签在 AppWorld 上仍到 57.2，和有标签的 59.4 只差 2.2 个点。金标在这里是锦上添花：执行器已经把对错写进 $f_t$。金融离线无标签均 77.1，有标签 81.9，差 4.8；在线无标签 FiNER 直接变负。同一套三角色，换掉 $f_t$ 的来源，符号都能翻。只记住「无标签也能涨」，就是把 Agent 环境的执行器偷运进了金融抽取。

![Generator 跑轨迹，Reflector 提炼，Curator 写 delta，非 LLM Merge 写回 playbook](./images/fig-ace-loop.png)

> 图 1：实线是一条样本上的适应。合并框没有模型，避免整本重写。

**图 1 解析**

- **Generator**：带着当前 $H_t$ 做题，标出哪些 bullet 有用 / 有害。
- **Reflector**：看轨迹和 $f_t$，最多 5 轮打磨教训。可以看见金标，也可以只看见执行。
- **Curator**：把教训收成 $\Delta$，一小撮条目，不是新书。
- **Merge（非 LLM）**：按 id 追加或改计数。collapse 的切口在这里被关掉。
- **$H_{t+1}$**：下次 Generator 读到的活页。这是唯一进 $S'$ 的东西。

## 3. 数字：42.4 → 59.4 是相对 ReAct；+10.6 是相对强基线

Table 1，AppWorld，DeepSeek-V3.1-671B。AppWorld 测多应用数字助手：邮件、日历、文件系统一类 API 要串起来才能完成场景。官方协议报 Task Goal Completion（TGC）和 Scenario Goal Completion（SGC），test-normal 与 test-challenge 两档。Average 是四格宏平均。全部架在官方 ReAct 上，隔离的是上下文适应，换 Agent 骨架不算进这笔账。

| 方法 | 金标 | Normal TGC / SGC | Challenge TGC / SGC | 均 |
|------|------|------------------|---------------------|----:|
| ReAct | — | 63.7 / 42.9 | 41.5 / 21.6 | 42.4 |
| ReAct + ICL 离线 | ✓ | 64.3 / 46.4 | 46.0 / 27.3 | 46.0（+3.6） |
| ReAct + GEPA 离线 | ✓ | 64.9 / 44.6 | 46.0 / 30.2 | 46.4（+4.0） |
| ReAct + ACE 离线 | ✓ | 76.2 / 64.3 | 57.3 / 39.6 | **59.4（+17.0）** |
| ReAct + ACE 离线 | ✗ | 75.0 / 64.3 | 54.4 / 35.2 | 57.2（+14.8） |
| ReAct + DC 在线 | ✗ | 65.5 / 58.9 | 52.3 / 30.8 | 51.9（+9.5） |
| ReAct + ACE 在线 | ✗ | 69.6 / 53.6 | 66.0 / 48.9 | **59.5（+17.1）** |

相对裸 ReAct，离线有标签 +17.0，在线无标签 +17.1。这就是结果节「up to 17.1%」的来源。相对 ICL / GEPA，作者算的是 12.3 / 11.9 个百分点；相对在线 DC，平均 7.6。摘要 **+10.6% on agents** 是「对选中的强基线再平均」，不要和 +17.0 收成一个数。无标签离线仍 +14.8：Agent 环境里代码成不成功够当 $f_t$。

test-challenge 上的故事和 test-normal 不完全一样。离线 ACE 有标签：normal TGC 76.2，challenge TGC 57.3；在线 ACE 无标签：normal TGC 只有 69.6，challenge TGC 反而到 66.0。作者没有把这解释成「在线专门克难」，只报了四格宏平均。读的人容易拿 59.5 对 59.4 说在线已经追上离线，但拆开看：在线在 challenge 上更猛，在 normal 的 SGC 上（53.6）还低于离线有标签的 64.3。宏平均抹平了日程差。GEPA 整张表几乎贴着 ICL（46.4 对 46.0），短指令优化在 AppWorld 这种要记工具坑的环境里，增益只比「把几条示范塞进提示」多 0.4。这是 brevity bias 的定量版：优化器在找更干净的句子，Agent 要的是更厚的书。

排行榜对照要降一档读。截至 2025-09-20，ReAct + ACE 离线均 59.4，当时榜首 IBM CUGA 60.3（GPT-4.1 生产级）。脚注写明：CUGA **不是**方法基线，内部设计和 ACE 不是同一套对照，只是「分数落在同一带」。在线 ACE 在 test-challenge 上 TGC 超 CUGA 8.4、SGC 超 0.7——这是拆开的两格，不是把 59.5 说成已经赢下整张榜。

Table 2，金融。FiNER 给 XBRL 文档的 token 标 139 种实体；Formula 做概念计算。基座均 69.1（70.7 / 67.5）。

| 方法 | 金标 | FiNER | Formula | 均 |
|------|------|------:|--------:|----:|
| 基座 | — | 70.7 | 67.5 | 69.1 |
| GEPA 离线 | ✓ | 73.5 | 71.5 | 72.5（+3.4） |
| ACE 离线 | ✓ | **78.3** | **85.5** | **81.9（+12.8）** |
| ACE 离线 | ✗ | 71.1 | 83.0 | 77.1（+8.0） |
| DC 在线 | ✓ | 74.2 | 69.5 | 71.8（+2.7） |
| DC 在线 | ✗ | 68.3 | 62.5 | 65.4（**−3.7**） |
| ACE 在线 | ✓ | 76.7 | 76.5 | 76.6（+7.5） |
| ACE 在线 | ✗ | **67.3（−3.4）** | 78.5 | 72.9（+3.8） |

离线有标签，ACE 相对 ICL / MIPROv2 / GEPA 平均约 10.9 个百分点。摘要 **+8.6% on finance** 同样是对强基线再平均，不要和 +12.8 混。Formula 和 FiNER 也不该收成一个「金融 +12.8」。离线有标签时 Formula 从 67.5 拉到 85.5，FiNER 从 70.7 到 78.3——概念计算更吃可复用公式，实体标签更吃文档惯例。无标签在线把这个差放大成符号：Formula 仍到 78.5，FiNER 掉到 67.3。没有执行器当 oracle 时，假实体标签会进书，真公式偶尔还能靠对错活下来。DC 两条都掉，说明「让 LLM 整本重写记忆」在弱反馈下更脆。ACE 的增量合并挡得住 collapse，挡不住脏信号。作者把这写进局限：适应质量绑在反馈上。Agent 侧「无标签也行」不能外推到这里。

消融 Table 3，仍是 AppWorld。去掉 Reflector 和多 epoch：离线均 55.1（+12.7）。只去掉多 epoch：56.8（+14.4）。完整离线 59.4（+17.0）。在线无预热 56.1（+13.7）；加上离线 warmup 才到 59.5（+17.1）。Reflector、多 epoch、离线预热都有分。附录 A.5 把增量更新单独拿出来：若改回整本重写，collapse 会回来。主表不给它单独一行，是因为它被当成方法定义，不是可选插件。超参在合理范围里抖得不大，附录 A.6。

附录换骨干。GPT-OSS-120B 上 ReAct 均 34.6，离线 ACE 有标签 40.5（+5.9），在线 ACE 42.2（+7.6）；同表 DC 在线 −1.5。GPT-5.1 只报 test-normal 两格平均：ReAct 54.2，离线 ACE 无标签 61.3（+7.1），在线 65.8（+11.6）。Llama-3.3-70B 金融 FiNER：基座 62.5，ACE 离线有标签 64.9（+2.4），GEPA −3.09。弱反思，增益就小。

成本 Table 4。离线 AppWorld：GEPA 53,898 秒 / 1,434 次 rollout，ACE 9,517 秒 / 357 次，延迟 −82.3%、rollout −75.1%。在线 FiNER：DC 65,104 秒 / 17.7 美元，ACE 5,503 秒 / 2.9 美元，延迟 −91.5%、token 费 −83.6%。结果节把两档延迟再平均，写成 **−86.9%**。相对 GEPA，离线输入 / 输出 token 少 80.8% / 83.6%。省的是搜索宽度：GEPA 大量 rollout 在验证候选短指令，ACE 的 357 次主要在给书追加条目，Generator 并没有突然变聪明。评测时 playbook 更长，不等于账单线性变贵：GPT-5.1 + OpenAI prompt cache 上，评测阶段 91.8% 输入 token 命中缓存，相对按原文计数少付 82.6%。缓存接得住，是因为前缀几乎不变。这是服务端实现，不是算法把 $I$ 变便宜了。

域迁移。StreamBench 非流式、离线、1,000 条训练样本：DDXPlus 医疗诊断 75.2→90.2（+15.0），GEPA 只到 76.4（+1.2）。BIRD-SQL 总均 52.9（+5.1），Simple 子集 +7.1；Moderate / Challenging 上 GEPA 更大。ACE 不是金融专用，也不在所有 SQL 难度带上压过 GEPA。

## 4. 这不是 RSI，playbook 也不是第二份技能目录

$S$ 若取当前 $H_t$，式 (1) 确实在改下次还用的脚手架。条目会进后继输入，Generator 下次还读它们。这是 Harness 层的上下文迭代，和 Reflexion 把失败写成句子、SkillEvolver 把失败写成文件同一大类。

缺的是导读式 (2) 的改进器身份。Generator / Reflector / Curator 的分工、Merge 代码、嵌入去重、5 轮 / 5 epoch / batch=1，都不进 $H_{t+1}$。模型不能改「Curator 怎么把教训收成 delta」，也不能把 Merge 换成「再请 LLM 整本重写」——那正是他们关掉的 collapse。$\theta$ 冻结。三项换骨干是人换 $I$，不是 playbook 选出了新角色。混元台阶上最多蹭到 L2：脚手架经验变成下次还能读的条目。到不了改改进器，更到不了改考纲。

若要把 ACE 推到式 (2)，至少得让下一轮的改进器身份来自本轮产物。一种写法是把三项角色的系统提示本身做成 playbook 的一章，允许 Curator 改 Reflector 怎么抽教训；另一种是把 Merge 从确定性代码改成可被改写的程序，允许系统重新打开整本重写。论文恰好把第二条路封死。无论哪一种，都还要面对 Table 2 已经给出的负号：改进器若能改自己，脏反馈也会被写进改进器。$f_t$ 的身份在这里分叉：代码成不成功是环境给的，实体标签对不对常常没有环境。没有墙外的考官，递归只是把噪声写得更勤。

和邻居钉死。[SkillEvolver](../08-SkillEvolver-元技能/08-SkillEvolver-元技能.md) 的领域技能必须离开作者会话；ACE 的活页还在同一只 Agent 的窗口里。SEAGym 里 ACE 选出的 E4 快照有 13 条执行习惯，验证只 +2.9——那是冻 $M$、Harbor 日程下的过程评测，本篇 Table 1 的 59.4 不能拿去对那张 OOD 表。两套实验共用「ACE」这个名字，骨干、日程、切分都不同，禁止横加。[Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md) 要任务原生证据和提交人才能入库；ACE 靠计数和去重，没有 campaign 级合约。[ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md) 冻元 Agent 搜 `forward` 代码；ACE 冻三项角色搜条目文本。GEPA 优化的是一条短指令，ACE 优化的是越来越厚的书。Dynamic Cheatsheet 是记忆前身；ACE 把 Reflector 拆出来，并把合并从 LLM 手里拿走。

局限按原文。Reflector 提不出有用教训，上下文就会吵，甚至有害——和 Cheatsheet 绑在底层模型策展能力上是同一类依赖。不是所有任务都需要厚书：HotPotQA 更吃短指令，Game of 24 一条可复用规则就够。ACE 适合领域知识、复杂工具、环境特定策略已经写不进权重和一句系统提示的地方。无执行器、无金标时，Table 2 已经给出负号。排行榜上的 IBM CUGA 对照是情境，不是公平对打。playbook 随任务变长本身不是失败；脏条目才是。KV cache 只让长前缀便宜，不替 $f_t$ 把关。

![上排 playbook $H_t$ 在追加；下排 $\theta$、三项角色、Merge 与超参仍在墙外](./images/fig-ace-frozen.png)

> 图 2：实线只更新条目。虚线是冻着的模型、角色提示和确定性合并。

**图 2 解析**

- **Playbook $H_t$**：带计数的 bullets。这是唯一进 $S'$ 的状态，下次 Generator 读的就是这份。
- **$\theta$ frozen**：DeepSeek-V3.1 权重点不着。
- **三角色 frozen**：同一只非 thinking 模型，prompt 人写，三项必须一起换。
- **Merge / 超参**：非 LLM；5 轮、5 epoch、batch 1。改它们等于人改 $I$，playbook 里长不出新角色。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness，条目化上下文。权重动了吗？没有。递归在哪闭合？playbook 下次还被 Generator 读；三项角色没有闭合。还缺什么才敢叫 RSI？角色定义或 Merge 进入 $S'$，并且下一轮改进器就是升级后的那份。

**读**：式 (1)、18,282→122 的 collapse、Table 1 的 42.4 / 59.4 / 59.5、无标签 +14.8、金融 81.9 与 FiNER 在线 −3.4、摘要 +10.6 对 +17.0 的分母差、GEPA 延迟 −82.3%、CUGA 只当情境。  
**不读**：把 self-improving 听成权重递归、把 59.4 听成已经赢下 IBM CUGA 方法对照、用 SEAGym 的 +2.9 替换 Table 1、用第三方文档的 +17.1 当作摘要平均、把 KV cache 命中听成算法变便宜。

同层技能文件：[08 SkillEvolver](../08-SkillEvolver-元技能/08-SkillEvolver-元技能.md)。同层门：[01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)。过程评测：[03 SEAGym](../../6-评测与安全/03-SEAGym-Harness评测环境/03-SEAGym-Harness评测环境.md)。

## 参考文献

1. Zhang, Q., Hu, C., Upasani, S., Ma, B., Hong, F., Kamanuru, V., Rainton, J., Wu, C., Ji, M., Li, H., Thakker, U., Zou, J., & Olukotun, K. (2025). [Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models](https://arxiv.org/abs/2510.04618). arXiv:2510.04618. Table 1–4 与 18,282→122 以 HTML 为准。
2. [ace-agent/ace](https://github.com/ace-agent/ace)。
3. Suzgun et al. (2025). [Dynamic Cheatsheet](https://arxiv.org/abs/2504.07952). arXiv:2504.07952. 记忆前身；collapse 个案挂在该方法的重写上。
4. Agrawal et al. (2025). [GEPA](https://arxiv.org/abs/2507.19457). arXiv:2507.19457. 短指令优化对照。
5. 本花园：[08 SkillEvolver](../08-SkillEvolver-元技能/08-SkillEvolver-元技能.md)；[03 SEAGym](../../6-评测与安全/03-SEAGym-Harness评测环境/03-SEAGym-Harness评测环境.md)；[01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。
