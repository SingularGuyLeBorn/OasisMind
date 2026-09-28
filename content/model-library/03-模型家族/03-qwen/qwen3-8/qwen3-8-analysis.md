# Qwen3.8-Max: 2.4T 参数的开源 Max 和一套真实工作 RL

> **[OM-FREEPLAY] 材料不够 5000 汉字.** 公开材料是阿里云社区转载的发布博客 (2026-08-03, 33 页), 主体是案例叙述, 两张评测大表和 API 接入说明. 架构只有总参, 激活参数和 「基于 Qwen3.5 骨架」 一句, 预训练数据和训练日程没有, 后训练只写了 RL 系统的三条设计. 下文不补编这些面.

来源: `qwen3-8.md` (阿里云社区博客的 MinerU 转写). 表内数字以源文 qwen3-8.md 为准.

这篇博客宣布了两件事: Qwen3.8-Max 是目前最强的 Qwen 模型, 也是第一个开源权重的 Max 档模型 (博客说权重 「下周」 放出). 结构上只给了 2.4T 总参, 95B 激活, 以及 「Built upon the architectural foundation of Qwen 3.5」. 训练侧写得比前几代具体一些, 讲了真实工作 RL 的环境扩张, 统一奖励和在线数据均衡三件事, 但没有数量, 没有曲线数值. 其余篇幅是编程, 办公, 芯片, 电商, 多模态五类长程案例, 以及两张评测大表. 把表和 RL 描述放在一起读, 能看出这一代的强项和短板分布得很不均匀.

机制单独成篇. MoE: [01-DeepSeek-MoE](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md). Agentic RL 训练: [13.4.1-AgenticRL训练](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.1-AgenticRL训练.md). GRPO: [02-GRPO](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md). 奖励模型过优化: [07-Best-of-N-奖励模型过优化](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.4-其他对齐技术/07-Best-of-N-奖励模型过优化/07-Best-of-N-奖励模型过优化.md). 骨架对照: [qwen3-5-analysis](../qwen3-5/qwen3-5-analysis.md); 上一代旗舰: [qwen3-7-analysis](../qwen3-7/qwen3-7-analysis.md).

## 1. 规格与训练

### 1.1. 规格: 2.4T 总参, 95B 激活, 骨架沿用 Qwen3.5

博客给的规格就是 2.4T 总参和 95B 激活, 激活比例约 4.0% (按 95/2400 计算). 这个数说明它是 MoE, 但专家数, 每 token 选几个专家, 是否有共享专家, 层数, 词表, 这一页都没有. 「基于 Qwen3.5 骨架」 这句话如果按字面理解, 应当继承了 Qwen3.5 的 Gated DeltaNet 与 Gated Attention 3:1 混合结构 (推测, 骨架细节见同族 Qwen3.5 页面, 非本博客). 从 Qwen3.5 的 397B-A17B 到 2.4T-A95B, 总参大约放大 6 倍, 激活放大约 5.6 倍 (按表计算), 怎么放大的博客没说.

规格对部署的影响很直接. BF16 权重约 4.8TB, FP8 约 2.4TB (按每参数 2 字节和 1 字节估算), 单机八卡放不下, 开源后多数人只能通过 API 或多机推理使用. 每 token 计算按 95B 激活算, 比 Qwen3.5-397B 的 17B 高得多, 这和用户反馈页里 「super fast」 的评价放在一起看, 说明服务端做了相当多的推理优化, 具体手段博客没写. 上下文长度这一页也没有正式声明, 只有接入配置里写的 1,000,000.

### 1.2. 真实工作 RL: 环境三轴, 统一奖励, 在线均衡

博客的 Work 一节是全文唯一讲训练方法的地方. 核心说法是同时扩大 RL 环境和 RL 算力, 让通用工作能力在 QwenWork, Claude Code, Codex, OpenClaw, Hermes 几种 harness 上一起提升. 为此要解决三个互相耦合的问题. 第一个是环境: 沿三条独立的轴扩张, Task 从单任务到多任务再到多日任务, Workspace 从多文件到分层目录再到复杂异构目录, Harness 按类别, 版本和 skills 变化. 三轴独立, 组合起来环境数量是乘法增长, 不需要每加一个场景就写一套定制集成.

第二个是奖励. **Universal Reward System** 把三种验证方式收进同一个奖励系统: 基于执行的检查 (跑代码, 跑测试), 按 rubric 对文本和渲染出来的视觉结果打分, 以及让 agent 自己去检查产物. rubric 可以自动扩展. 社区把这类做法叫 **rubric-based reward**: 把质量拆成若干条可以单独判断的标准, 由 LLM 裁判逐条打分再合成一个标量, 这样办公, 法律, 医疗这类没有标准答案的任务也能进 RL. 博客强调 「一个奖励系统」 的理由是任务专用 verifier 之间尺度不一致, 统一之后跨环境的奖励才能直接比较. rubric 数量, 裁判模型, 怎么合成标量, 这一页没有.

第三个是数据均衡. **在线数据均衡器**让每个 batch 在任务类型, 难度, workspace, harness 四个维度上分布均衡, 目的是压低 batch 之间的梯度方差, 让 RL 算力能继续加上去而不崩. 用 GRPO 这类组内相对优势的算法时, 全对或全错的题贡献的梯度为零, 难度分布偏一点, 有效样本就大幅减少; 环境种类一多, 随机采样很容易让某几类任务扎堆. 均衡器具体怎么打分, 是否丢弃全对全错的组, 博客没写. Fig 1 声称随 RL 规模扩大, 几十个内部和公开的工作基准稳定上升; Fig 2 声称各 harness 表现接近. 两张图的数值转写里都没有 (读图也无法给出精确数).

## 2. 案例

### 2.1. 编程三案例: 过程数据比单个分数有用

第一个案例是 oh-my-cli: 从空仓库开始, 连续自主运行 10 天以上, 做一个能自我演化的 harness. 执行循环由 issue 状态机, 调度器, 监控和 watchdog 组成, 需求进 GitHub Issues 后由 agent 领取, 状态按 ready → leased → active 流转, 实现完成后跑 E2E 和 CI, 通过才合并 PR. 截至 2026-07-30, 约 16 天里累计 265 次 commit, 127 个 PR, 151 个 issue, 完整轨迹在 GitHub 上公开. 这是全文唯一能从外部完整核查的案例.

第二个案例是复现论文 「Unified Data Selection for LLM Reasoning」 再改进. 起点只有论文和 GPU, 约 125 小时里写了约 7,600 行代码, 1,100 多次操作, 33 轮 GPU 训练. 前约 37 小时复现了论文六条主要结论 (用选出的数据微调 Qwen3-8B, 论文方法在 AIME24 上比随机选数高 7.7%); 后约 88 小时跑了四轮, 共 18 个自创想法. 基线是复现出的 49.58%, 四轮最好结果依次是 50.42%, 51.67%, 51.25%, 52.29%, 最终提升 2.71 分. 第三轮比第二轮低, 说明这个过程不是每轮都进步. AIME24 只有 30 题, 2.71 分相当于不到一道题的差别 (按 30 题估算), 这个提升的统计意义要打折扣.

第三个案例是天池 WWW2025 多模态对话意图识别比赛, 526 支人类队伍, 24 小时限时. 模型用 BERT, MacBERT, RoBERTa 处理文本, Qwen2.5-VL-7B 处理截图, 主模型拿不准的图片交给 Chinese-CLIP, 最后加权投票, 权重用交叉验证定. 45 次提交里准确率从 0.60 升到 0.853, 超过 458 支队伍 (87%). 三个案例的共同点是有外部反馈可以逐轮修正: CI 结果, GPU 实验分数, 排行榜.

### 2.2. 芯片与电商: 两个长程闭环

芯片案例的目标是 GCD/RSA 加密硬件加速器. 约束是在 cocotb 随机验证下 4, 6, 8, 16 位配置都要逐位正确, 同时让 Yosys 综合后的门数尽量少, 面积按 16 位配置计. 工具链是 Iverilog, Yosys, OpenROAD, 起点只有任务描述, 空模块模板和评测脚本, 没有参考设计. 一次连续运行约 500 轮, 71 次评测, 13 个里程碑, 门数从第一个可用设计的 8,298 降到 678. 最大的一步在第 22 轮: 把 16 位硬件模除器换成迭代移位减法, 一次减掉 6,288 门, 占总降幅 80% 以上. 最后一段优化出现在第 443 到 500 轮, 从 765 降到 678, 说明到几百轮之后仍有结构性改进.

物理实现上, OpenROAD 配 Nangate45 工艺库, die 从 106×106 µm² 缩到 46×46 µm², 线长从 33,369 µm 降到 4,187 µm, 时序从 -4.46 ns 的负裕量变为在 500 MHz 下收敛 (+0.66 ns). 博客说面积减少 81%; 按边长算 (46/106)² ≈ 0.19, 和 81% 吻合 (按表计算). 博客还说 678 门 「领先所有被评模型」, 但其他模型的门数这一页没有.

电商案例叫 E-Commerce Bench, 模拟 365 天经营, 基于淘宝天猫脱敏交易数据, 有 12 种店型, 60 个品类, 近 600 个供应商, 7,000 个商品, 起始资金 ¥100,000. 供应商按博弈论设定不同性格和让步策略, 其中暗藏 152 个欺诈商户. Qwen3.8-Max 最终余额 ¥416,252 (4.16 倍), 比第二名 GLM 5.2 高 38%, 比 Qwen3.7-Max 高 152%, 交互超过 2,000 轮. 这是内部基准, 其他模型的完整成绩, 识别出多少欺诈商户, 这一页都没有.

### 2.3. 办公与量化: 展示案例和表内分数分开读

职业广度部分列了六个展示案例: 合规审查一次找出 1,284 条相关条款 (团队约需一周); 8 屏银行 App 原型零轮修改; 读一百多份供应简报出 26 道菜单, 食材成本率 33.8%; 从图纸在浏览器里重建 30 层办公楼的抗震模型; 把 2D 康复评估表做成 3D 解剖演示; 每名球员约 8,400 个回合生成战术画像. 这些案例没有对照组, 也没有评审协议, 作用是展示覆盖面. 表里对应的是 JobBench (53.4, 低于 Fable5 的 57.4) 和 CoWorkBench (74.8, 低于 Fable5 的 75.9).

量化案例用 **Dynamic Workflows** 做编排. 深度方向是单会话里做 ETF 轮动策略, 模型发现设计期和验证期指标错位 (过拟合信号) 就逐轮剪掉冗余因子, 多条路径收敛到同一组信号时加多种子验证. 广度方向是从动量, 价值, 质量, 投资, 低风险, 情绪六类因子出发, 各拆 50 个方向, 派出约 330 个子 agent, 跑约 6,000 次回测, 选出的因子超额 Sharpe 在 0.64 到 1.48 之间, IC 在 0.010 到 0.014 之间. 6,000 次回测挑出来的因子天然有多重检验偏差, 博客没有给样本外检验的结果.

## 3. 评测表

### 3.1. 文本与 agent 大表: 31 行里 6 行第一

第一张大表五列: Opus4.8, Fable5, GPT5.6 Sol (max), Qwen3.7-Max, Qwen3.8-Max; 行分 Coding Agent 12 行, General Agent 9 行, General Capabilities 10 行. Qwen3.8-Max 独占第一的只有 6 行: PaperBench (93.0), WideSearch (81.9), IFBench (82.8), HealthBench (60.2), PLawBench (73.2), PRBench-Finance (58.3); PRBench-Legal 和 Fable5, GPT5.6 三家并列 57.6 (按表计算). Fable5 独占第一的有 14 行, 集中在 coding 和 agent 组. 对上一代 Qwen3.7-Max, 31 行全部上升, DeepSWE 从 21.6 到 56.6, FrontierSWE 从 40.7 到 73.5, 涨幅最大.

Coding 组 12 行里 Qwen3.8-Max 只赢 PaperBench 一行. SWE-bench Pro 67.7, 低于 Fable5 80.0 和 Opus 69.2; DeepSWE 56.6, 低于 GPT5.6 的 73.0 和 Fable5 的 70.0; Terminal Bench 2.1 86.6, 低于 GPT5.6 的 88.8. 再看四个 Qwen 自建基准 (QwenSWEBench, QwenQoderBench, QwenReactBench, QwenSVGBench), Qwen3.8-Max 一个第一都没拿, 前三个输给 Fable5, 最后一个输给 GPT5.6. 自建基准上不偏袒自家模型, 这张表的可信度反而高一些.

几处协议细节. Agents' Last Exam 报 Pass 和 Score 两个数, Qwen3.8-Max 的 Pass 和 Opus 并列 27.0, Score 却是 52.4 对 45.1, 两个指标给出的排序不同. MLS-Bench-Lite 用 Claude Code 跑, 5 小时超时, max_tokens=131,072, 其他模型分数取自官方榜单, 双方条件不一定相同. Automation-Bench 只用 600 题公开子集. Fable5 一列在 NL2Repo, Agents' Last Exam, HealthBench, MRCR, LongBench v2 上是空格, GPT5.6 一列在 NL2Repo, FrontierSWE, WideSearch 上是空格, 这些行的第一是在缺对手的情况下拿的.

### 3.2. 跨文档核对: Qwen3.7-Max 的成绩对不上

表里 Qwen3.7-Max 一列可以和 Qwen3.7 模型卡对照. SWE-bench Pro 60.6, NL2Repo 47.2, GPQA Diamond 92.4, HLE 41.4, HLE w/ tools 53.5, IFBench 79.1, 两边一致. 有两格对不上: SkillsBench 这里是 61.2, Qwen3.7 模型卡是 59.2; CoWorkBench 这里是 64.6, 模型卡是 67.2. 两份材料都没有说明评测版本变过, 引用 Qwen3.7-Max 的这两项时要注明出处.

另有几行名字相近但口径不同, 不能直接对比. Terminal Bench 这里是 2.1 版 (Qwen3.7-Max 74.5), 模型卡是 2.0 版 (69.7); MRCR v2 这里是 256K 8-needle (86.7), 模型卡是 128k (90.4); QwenSVGBench 这里 Qwen3.7-Max 是 1499, 模型卡的 QwenSVG 是 1608, 两个 Elo 分数来自不同的对手池. Elo 这类分数只在同一张表里才有意义.

### 3.3. 多模态大表: 55 行里 36 行第一

第二张表六列: Opus4.8, Fable5, Gemini3.1-Pro, GPT5.6-Sol, Qwen3.7-Plus, Qwen3.8-Max, 共 55 行, 分六组. 按每格第一个数算, Qwen3.8-Max 独占第一的有约 36 行 (按表计算), 分布很不均匀: 文档与办公 7 行全胜, 感知与定位 10 行赢 8 行, 多模态推理 12 行赢 10 行, 真实世界与空间 4 行赢 3 行, 视频 10 行赢 5 行, 视觉 agent 与编码 12 行只赢 3 行 (OSWorld-Verified 86.1, QwenBlenderBench 69.9, Parametric CAD 91.5). 差距最大的是 Dense200, 87.0 对 Gemini 的 69.7, 以及 VLMsAreBiased, 88.3 对 Gemini 的 74.1.

两张表放在一起, 形状很清楚: 看图, 读文档, 数数, 定位这类感知任务明显领先; 需要多步操作的 agent 任务 (SWE, DeepSWE, ScreenSpot Pro, WebArena, MobileWorld, RecreationBench) 大多输给 Fable5. RecreationBench 是博客专门新提出的黑盒复刻基准, 正文说 Qwen3.8-Max 达到 「frontier-level」, 表上是 51.7, 低于 Fable5 的 56.1. OSWorld 2.0 报 binary / partial 两个数, Qwen3.8-Max 是 19.4 / 46.7, binary 低于 Opus 的 20.6, partial 低于 Fable5, GPT5.6 和 Opus. 视频组里 Opus4.8 的 MLVU 只有 53.4, 其他模型都在 84 以上, 可能是协议没对齐 (推测).

## 4. 接入与边界

### 4.1. 接入: reasoning_effort, preserve_thinking 和上下文

API 支持三档 **reasoning_effort**: **xhigh** (默认, 复杂任务), medium, low. 这是推理时多花算力换质量的旋钮, 属于 TestingTime, 和第 1.2 节 RL 阶段的环境扩张是两件事. **preserve_thinking** 对所有负载默认开启, 保留历史轮次的 thinking 内容. 但示例代码里 `"preserve_thinking": True` 一行仍是注释掉的, 结合正文的 「默认开启」, 应当理解为服务端默认打开, 客户端不必再传 (推测). 模型名是 `qwen3.8-max`, QwenCloud 同时兼容 OpenAI 和 Anthropic 两种协议.

Codex 配置里 context_window 是 1,000,000, effective_context_window_percent 是 95, 默认推理档 xhigh; OpenClaw 配置 contextWindow 1,000,000, maxTokens 65,536, 输入支持文本和图像. 表里的长上下文格子是 MRCR v2 256K (92.9, 低于 GPT5.6 的 93.8) 和 LongBench v2 (66.3, 低于 Opus 的 69.1), 百万长度上的评测这一页没有. 用户反馈页有 Qoder 负责人说双语场景 token 效率比 Opus4.8 高 60%, 等效推理速度高 28%, 这是具名引言, 没有协议说明.

### 4.2. 边界与谱系位置

能确认的: 2.4T 总参与 95B 激活; 骨架沿用 Qwen3.5 的声明; RL 系统的环境三轴, 统一奖励, 在线均衡三条设计; 各案例的过程数字; 两张大表和脚注; API 默认参数. 本页没有的: 专家配置, 层数, 上下文正式上限, 预训练数据量和配比, 是否继续预训练, SFT 与 RL 的阶段划分, RL 算法名称, rubric 与裁判细节, Fig 1 和 Fig 2 的数值. 这些要等权重和模型卡发布.

在 Qwen 谱系里, 3.5 提出 environment scaling, 3.7-Max 加了 Task/Harness/Verifier 三分, 3.8-Max 把这条线扩成 Task/Workspace/Harness 三轴, 并补上统一奖励和在线均衡, 训练方法的描述一代比一代具体. 分数上, 3.8-Max 在感知和文档上已经领先对手, 在长链 agent 编码上还落后 Fable5 一截. 开源 Max 档权重是这一代最大的变化, 但 2.4T 的规模决定了真正能本地部署的用户很少.
