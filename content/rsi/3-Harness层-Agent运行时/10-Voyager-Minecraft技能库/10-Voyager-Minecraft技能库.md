---
title: "10 · Voyager：冻 GPT-4，只长可执行技能库"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Wang 等把 Minecraft 技能写成 JavaScript，塞进向量库。
  160 步发现 63 种物品，木器快 15.3 倍，钻石工具 1/3 次跑通。
  GPT-4 黑盒查询，改进器不进 S'。不是式 (2)。
tags:
  - RSI
  - Voyager
  - Minecraft
  - skill library
  - Harness
---

# 10 Voyager：技能库会涨，GPT-4 不会

Minecraft 里一只 Agent 自己造木镐、挖铁、偶尔摸到钻石，技能以 JavaScript 函数留下，下次还能调。新闻标题常写成「终身学习、无需人类」。论文原句更窄：GPT-4 **黑盒查询**，**不微调参数**。会涨的是技能库 $H_t$，不是改进器。把「技能越写越复杂」听成花园式 (2)，[Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md) 文里点名的邻居就被升格成 RSI。

本篇是 Harness 层里「可执行技能库」的前史样板。[SkillEvolver](../08-SkillEvolver-元技能/08-SkillEvolver-元技能.md) 冻 CLI、写领域 `SKILL.md`；[ACE](../09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md) 冻 $\theta$、写 playbook。Voyager 更早：冻 `gpt-4-0314`，把过了自验证的代码提交进 Chroma。门比 Argus 弱——自验证还是 GPT-4 看背包，蜘蛛丝可以骗过「打赢了蜘蛛」。**不是** RSI：课程提示、Mineflayer API、嵌入模型、GPT-4 本身都不进 $S'$。**不是** DreamerV3 / VPT 那种改权重的 Minecraft 智能体。一手：Wang, Xie, Jiang, Mandlekar, Xiao, Zhu, Fan, Anandkumar，[arXiv:2305.16291](https://arxiv.org/abs/2305.16291)（2023-05-25）；代码 [MineDojo/Voyager](https://github.com/MineDojo/Voyager)。数字以 HTML Table 1–2 与 §3.4 消融为准。

## 1. 问题：开放世界里，技能写在哪才不会忘

经典 RL 在 Minecraft 上控的是按键。探索难、解释难、换一张图就忘。LLM Agent 会写计划，但多数实验没有**可累积的程序库**：每一轮从零生成，做对了的 `craftWoodenPickaxe` 下次还要再想一遍。Voyager 把这个问题收成三件套：自动课程出题、技能库存可执行代码、迭代提示把环境反馈和报错喂回 GPT-4。目标不是通关，是「不断发现」，提示里写 My ultimate goal is to discover as many diverse things as possible。

$S$ 取「当前这次部署」：冻结的 GPT-4 / GPT-3.5、Mineflayer 原语、课程与验证提示、外加一份会涨的 `skills.json`。$I$ 是那套提示加 API。单轮 $S'=I(S)$ 显然发生——库里多了一个函数。式 (2) 还要 $I'\subseteq S'$。下一轮出题的仍是同一份课程提示，改代码的仍是同一只 `gpt-4-0314`。技能库是 $H_t$，不是改进器。

和邻居先划线。[Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md) 把自然语言反思留下，不提交可执行函数。AutoGPT 拆子目标，论文重实现里没有技能库、没有自验证、没有开放课程。Argus 把技能、路由、合约全部过门，门在独立审计。Voyager 的门是 GPT-4 看当前背包是否像「任务完成」。DreamerV3 学世界模型去收钻石，那是 Model 层，本篇不混。

![课程出题，检索技能，GPT-4 写代码，Mineflayer 执行，自验证通过才入库](./images/fig-voyager-loop.png)

> 图 1：实线是这一轮。虚线是检索已有技能。入库只发生在自验证说 Success。

**图 1 解析**

- **自动课程**：GPT-4 看出题，温度 0.1；其余模块温度 0。
- **技能检索**：GPT-3.5 写解题建议，和盘面拼成查询，向量库取 top-5。
- **代码生成**：GPT-4 写可复用的 JavaScript，调用 Mineflayer 原语和已有技能。
- **自验证**：再问 GPT-4 当前状态算不算完成。通过才 `add_new_skill`。

## 2. 机制：程序当技能，解释器当身体

实验栈钉死。补全用 `gpt-4-0314` 与 `gpt-3.5-turbo-0301`，嵌入用 `text-embedding-ada-002`。环境在 MineDojo 上，马达是 Mineflayer。GPT-4 不看屏幕，只看文本盘面：背包字典、装备、附近方块与实体、生物群系、时间、生命与饥饿、坐标。没有视觉，3D 建筑要人当批评者或当课程。

课程是自下而上的。提示要求下一题不要太难，因为可能还缺材料和技能。已完成 / 已失败的任务列表写进提示，当作能力边界。另用 GPT-3.5 做自问自答，给 GPT-4 当额外上下文——论文写明是为了省钱。课程会幻觉：铜剑、铜胸甲在游戏里不存在。卡在一道题上，课程允许以后再试。这不是验证器，是出题器。出题器在墙外。

技能库的键是描述的嵌入，值是程序。描述由 GPT-3.5 生成。新技能要写得 generic and reusable，因为后面的函数会调前面的。检索时 top-5。同名技能会覆盖；仓库代码里存款进箱子这类一次性动作直接不入库。复杂技能靠组合简单程序，论文把这写成缓解灾难性遗忘：旧函数还在磁盘上，不会被下一轮上下文挤掉。这是 Harness 记忆，不是 CL 里的 replay 缓冲去保权重。

迭代提示有三路观察。环境反馈：合成木棍还差两块木板。执行错误：游戏里没有金合欢斧。自验证：对照任务与背包，输出 Success 与可选 Critique。循环直到自验证通过，或课程改出下一题。消融里自验证最重要：去掉之后发现物品数掉 **73%**。它决定何时换题、何时重试。论文自己写自验证会漏：打蜘蛛成功的信号是丝，模块可能不认。门和生成器是同一只 GPT-4，只是提示不同。这和 Argus 的独立审计不是同一档。

零样本迁移时，清空背包，换一张新世界。Voyager 和 AutoGPT 都用 GPT-4 把新任务拆成子目标。差别在库：Voyager 带着终身学习攒下的函数走；把同一份库塞给 AutoGPT，AutoGPT 也会涨——论文把技能库写成 plug-and-play。库可以离开原 Agent。这反而证明 $I$ 不必改：换一套编排，旧技能仍能用。

一轮可以写成：课程根据背包出「合成石镐」→ GPT-3.5 写「在 Minecraft 里怎么合成铁镐」一类建议（即使当前题是石头）→ 向量库取出 `craftWoodenPickaxe` 等五个函数 → GPT-4 生成 `async function craftStonePickaxe(bot)`，内部先检查木镐和圆石，缺了就调已有技能 → Mineflayer 跑，缺两块木板就以环境反馈回来，写成了金合欢斧就以解释器报错回来 → 自验证看背包里有没有石镐。Success 才把函数和 GPT-3.5 写的描述一并入库。失败则 Critique 进下一轮提示。附录把 ReAct / Reflexion 写成「从零生成一轮，再 refine 三轮，然后重复直到步数用完」；AutoGPT 连续三个子目标都没拿到新物品就重新分解。Voyager 的差是：过门的程序留下，下一步检索能直接调，不必把「怎么合成木板」再生成一遍。

控制原语是人写的 Mineflayer 包装，不是技能库搜出来的。Agent 能调 `exploreUntil`、`craftItem`，不能改这些函数的源码。幻觉会调用提示里没有的 API，执行报错后再改。身体在墙外，和 [Absolute Zero](../../2-Model层-训练时自改进/06-Absolute-Zero-Reasoner/06-Absolute-Zero-Reasoner.md) 的 Python 解释器是同一类：环境能验对错，但不让 Agent 改验的规则。Minecraft 合成表、矿物层级、圆石不能当燃料，全是游戏引擎的 $U$，不是 $H_t$。

GPT-3.5 在这套系统里干三件便宜的事：给技能写自然语言描述、自问自答给课程当上下文、检索前写解题建议。代码生成换成 3.5 会崩，描述和检索查询仍用 3.5。分层是成本，不是把改进器拆成两只互相改的模型。[R-Zero](../../2-Model层-训练时自改进/07-R-Zero-挑战者解题器/07-R-Zero-挑战者解题器.md) 的挑战者 / 解题器是两只可训练克隆；Voyager 的 4 与 3.5 都冻着，只是账单不同。

## 3. 数字：63 种物品，钻石只 1/3

探索主结果：160 次 prompting 内发现 **63** 种独特物品，相对对照约 **3.3×**。对照是同一套 MineDojo 上重实现的 ReAct、Reflexion、AutoGPT。ReAct / Reflexion 在开放探索这种抽象目标上几乎走不动。路程约 **2.3×**。倍数相对「counterparts / baselines」，正文没有把分母写成某一格的原始件数，本篇不反推。

科技树（Table 1，三试平均 prompting 次数，上限 160；越少越快）：

| 方法 | 木器 | 石器 | 铁器 | 钻石 |
|------|------|------|------|------|
| ReAct / Reflexion | N/A (0/3) | N/A (0/3) | N/A (0/3) | N/A (0/3) |
| AutoGPT | 92±72 (3/3) | 94±72 (3/3) | 135±103 (3/3) | N/A (0/3) |
| Voyager 无技能库 | 7±2 (3/3) | 9±4 (3/3) | 29±11 (3/3) | N/A (0/3) |
| Voyager | **6±2 (3/3)** | **11±2 (3/3)** | **21±7 (3/3)** | **102 (1/3)** |

木器相对 AutoGPT：$92/6=15.3$。石器 $94/11\approx 8.5$。铁器 $135/21\approx 6.4$。钻石只有 Voyager 摸到，而且是 **三局一胜**，次数 102，没有 ±。不要把「唯一解锁钻石」听成稳定通关。无技能库在铁器前几乎一样快，钻石级掉成 0/3——库的用处在后期组合，不在前三层工具。

零样本（Table 2，上限 50 步，新世界、空背包）：

| 方法 | 钻石镐 | 金剑 | 岩浆桶 | 指南针 |
|------|--------|------|--------|--------|
| ReAct / Reflexion / AutoGPT | 0/3 | 0/3 | 0/3 | 0/3 |
| AutoGPT + 该技能库 | 39 (1/3) | 30 (1/3) | 0/3 | 30 (2/3) |
| Voyager 无技能库 | 36 (2/3) | 30±9 (3/3) | 27±9 (3/3) | 26±3 (3/3) |
| Voyager | **19±3 (3/3)** | **18±7 (3/3)** | **21±5 (3/3)** | **18±2 (3/3)** |

正文写「对照在 50 步内解不出任何任务」指的是没带库的三家。带上 Voyager 的库，AutoGPT 也能做对一部分。无库的 Voyager 在钻石镐上 2/3，有库 3/3 且步数从 36 降到 19。库是可搬运的 $H$，不是新的 $I$。

消融（Fig. 9，探索物品数）：课程换成随机，发现量掉 **93%**——题序错了会卡死。手写课程要 Minecraft 专家知识，还跟不上现场背包，实验里不如自动课程。无技能库后期会平台。代码生成换成 GPT-3.5，独特物品只有 GPT-4 的 $1/5.7$。论文写 GPT-4 API 比 GPT-3.5 贵约 15 倍，但 3.5 和当时开源模型写不出这套代码。自验证 −73% 已在上一节。环境反馈和执行报错各有贡献，都不如自验证大。

局限按原文。卡技能、课程出不存在的物品、把圆石当燃料、调用没有的 API。没有视觉。人可以当批评者修 3D，或当课程把搭传送门拆小。这些是多模态补丁，不是把 $I$ 写进 $S'$。GPT-4 当时贵约 15 倍，论文仍说 3.5 写不出这套动作代码。三局钻石只成一局，标准差写在木器石器铁器上、钻石格写成单独的 102，样本本来就薄。160 步发现 63 种是探索曲线上的点，不是科技树每一层的保证。

和 [02 Auto-Research](../02-Karpathy-Auto-Research/02-Karpathy-Auto-Research.md) 对照：那边改 `train.py`，考官是墙外的 val_bpb；这边改的是游戏技能，考官是 GPT-4 自检加 Mineflayer 能否跑通。都冻基座。Auto-Research 的交卷是训练脚本，Voyager 的交卷是 `craftStoneShovel`。[03 CS329A](../03-CS329A-Skill入口/03-CS329A-Skill入口.md) 的 skill 是给人读的入口，不是 Minecraft 函数。不要把三篇的「skill」收成一个词。

![上排技能库在追加 JavaScript；下排 GPT-4、Mineflayer、课程提示与嵌入仍在墙外](./images/fig-voyager-frozen.png)

> 图 2：实线只更新 $H_t$。虚线是冻着的改进器零件。

**图 2 解析**

- **会变**：`skills.json` 与向量库。过门的函数留下。
- **冻 $\theta$**：`gpt-4-0314` 黑盒。论文结论原句：starting point … without tuning the model parameters。
- **冻身体**：Mineflayer 原语、MineDojo 规则。铜剑不存在，不是 Agent 改的。
- **冻 $I$**：课程提示、自验证提示、温度、top-5。改它们等于人改脚手架。

## 4. 「终身学习」不是式 (2)

论文标题和摘要反复用 lifelong。对照花园的词，它指的是：同一只冻结 GPT-4，在长时间跨度里把过门的程序累积起来，换世界还能检索。这比「上下文里记得上一句」长，比「权重在训练作业里更新」浅。持续学习通常要保的是 $\theta$ 上的旧任务；Voyager 保的是磁盘上的函数，遗忘针对的是没写进库的那次成功。标题里的 lifelong 不要翻译成「模型在进化」。

相关工作里的另一路 Minecraft 智能体，本篇只钉边界、不抄它们的钻石数。MineDojo 和 VPT 用视频预训练低层控制。DreamerV3 学世界模型去收钻石，动的是权重。Volum 等用 Codex 生成可执行策略，但要额外人类交互。Voyager 自比：LLM 当高层规划，Mineflayer 当低层，课程自下而上。它没有把 VPT 的 $\theta$ 和自己的技能库接起来。接起来会变成两层同时动，那是另一篇实验。

附录里的合成木板函数能看清组合长什么样：先在六种原木里找背包有的，没有就调 `mineWoodLog`，再按索引切对应的木板。新技能被要求 generic，是为了下一层铁器能调石头和木头，不必为每种树写一套。组合发生在 $H_t$ 内部，提示词没有因此改写。人把搭传送门拆成小步，或对着 3D 细节写批评，等价于替换课程模块或替换自验证模块——人暂时充当 $I$ 的一块。论文把这写成潜力，不是主表数字。

三局是薄样本。木器 6±2、石器 11±2 看起来稳，AutoGPT 的 92±72 已经说明对照方差极大。钻石 1/3 更不能外推成「会挖钻石」。零样本四任务全 3/3，上限 50 步，任务是钻石镐、金剑、岩浆桶、指南针——规格清楚、合成表固定。开放探索的 63 种物品和这四题不是同一难度。读 Fig. 1 的探索曲线时，不要把后期斜率听成科技树每一层都会过。

仓库里的 Skill Manager 把描述嵌入 Chroma，和 `skills.json` 必须计数一致，否则启动就断言失败。这是工程上的 $H_t$ 完整性，不是改进器自检。`resume=False` 还用旧向量库会把两套技能对不齐——那是人的操作错误，不是 RSI。存款进箱子的任务默认不入库，因为没有复用价值。这些实现细节说明：什么算技能、什么丢弃，规则写在 Python 里，Agent 改不了。

## 5. 这不是式 (2)，门也不是 Argus

$H_t$ 变了，下次检索能调到 `craftStoneShovel`。单轮成立。改进器——出题提示、验证提示、GPT-4、嵌入模型——下一轮还是同一份。$I'\subseteq S'$ 不成立。混元台阶上这是 L2 附近的脚手架切片：留下的是技能，不是提议/选择程序。L3 要改改进器；Voyager 改的是技能档案。不要用 63 种物品给 [DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md) 的「改自己的 Python」背书。DGM 的 $I$ 有一部分已经在仓库里；Voyager 的 $I$ 在 OpenAI API 后面。

和同层钉死。[SkillEvolver](../08-SkillEvolver-元技能/08-SkillEvolver-元技能.md) 的元技能冻着，领域 `SKILL.md` 可携带，门是部署失败。Voyager 的技能是游戏内 JavaScript，门是 GPT-4 自检，元提示不自改。[ACE](../09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md) 的 playbook 是条目，合并非 LLM；Voyager 的值是可执行函数，解释器是 Minecraft。[Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md) 拒绝「单靠变长上下文自评进度」；Voyager 正好走那条：自验证看文本盘面。Reflexion 是邻居里更浅的：反思自然语言，不提交函数。AutoGPT 借库能涨，说明库是资产，编排仍是人写的。

[SEAGym](../../6-评测与安全/03-SEAGym-Harness评测环境/03-SEAGym-Harness评测环境.md) 冻 $M$ 测 $H_t$ 的 OOD。Voyager 的 Table 2 是换世界、空背包的零样本，近似「新任务」，不是 Harbor 协议，数字不能和 AHE +17.1 横加。[RSIBench](../../6-评测与安全/01-RSIBench-Data/01-RSIBench-Data.md) 冻训练栈只改数据；Voyager 连 $\theta$ 都不动。[System Card](../../6-评测与安全/04-System-Card-RSI/04-System-Card-RSI.md) 的 RSI Index 是预备度代理任务；63 种物品不是 High。

摘要写 without human intervention，主实验确实没有人在回路里点下一步。同一篇 §3.5 又把人请回来当批评者和课程，专门搭传送门和房子。两句话都要留：开放探索可以无人值守，视觉任务不能。不要用摘要那句覆盖 3.5 节。STOP / Gödel Agent / DGM 改的是改进器源码或策略对象；Voyager 的 Python（Skill Manager、断言、不入库规则）人写完就冻着，Agent 只往 JSON 里追加函数。同层里它更接近 SkillEvolver 的「冻元、写领域技能」，差在技能是游戏代码、门是自验证。

迭代提示看起来像「自己改自己」，改的是这一轮的 JavaScript 草稿，不是改 GPT-4，也不是改课程模板。草稿过门才进 $H_t$。没过门的草稿丢掉，和 DGM 把失败子代留在档案里不同。开放档案能追溯作弊；Voyager 的库默认只留成功函数，失败轨迹主要留在 ckpt 的事件日志里，主文没有拿日志做可靠性审计。第 6 章要的「证据在更新边界外」，这里的边界外证据是 Mineflayer 跑没跑通，以及换世界之后 Table 2 还能否做对。自验证本身在边界内。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness，技能库。权重动了没有？没有，黑盒 GPT-4。钻石稳不稳？Table 1 里 1/3。还缺什么才叫花园 RSI？课程或验证提示进入 $S'$，并且下一轮出题/验证用的就是升级后的那份——目前是人在改提示，模型在改函数。把「技能能组合」听成改进器升级，是把 $H_t$ 内部的函数调用当成了 $I$ 被替换。组合再深，出题的还是那份温度 0.1 的课程提示。

**读**：三件套、`gpt-4-0314`、63 / 160、木器 6±2 对 AutoGPT 92±72（15.3×）、钻石 102（1/3）、Table 2 四任务全 3/3、随机课程 −93%、自验证 −73%、GPT-3.5 代码 $1/5.7$、库可插到 AutoGPT 上。  
**不读**：把终身学习听成改权重、把 1/3 钻石听成稳定通关、用 63 种物品证明式 (2)、把自验证听成独立审计、和 DreamerV3 的钻石混成一篇、用专栏里的「无需人类」覆盖论文的黑盒查询原句、把 AutoGPT 插上技能库的涨分听成 AutoGPT 自己变成了 Voyager。

同层：[01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)、[08 SkillEvolver](../08-SkillEvolver-元技能/08-SkillEvolver-元技能.md)、[09 ACE](../09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md)。判定：[01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。读完应能把「Minecraft 里越玩越强」翻译成：冻结的 GPT-4，加上一份会涨的 JavaScript 库，身体和出题规则仍在墙外。越玩越强的是 $H_t$，不是 $I$。课程提示一行不改，钻石仍可能三局里只有一局摸到。这不是失败叙事，是 Table 1 自己写在格子里的分数。请去原文核那一格。

## 参考文献

1. Wang, G., Xie, Y., Jiang, Y., Mandlekar, A., Xiao, C., Zhu, Y., Fan, L., & Anandkumar, A. (2023). [Voyager: An Open-Ended Embodied Agent with Large Language Models](https://arxiv.org/abs/2305.16291). arXiv:2305.16291. Table 1–2、§3.4 消融以 HTML 为准。
2. 代码：[MineDojo/Voyager](https://github.com/MineDojo/Voyager)。技能入库见 `voyager/agents/skill.py`。
3. 本花园：[Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)；[SkillEvolver](../08-SkillEvolver-元技能/08-SkillEvolver-元技能.md)；[ACE](../09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md)。
