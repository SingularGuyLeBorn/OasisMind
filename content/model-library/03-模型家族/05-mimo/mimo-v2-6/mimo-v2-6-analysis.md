---
title: "MiMo-V2.6: 把 RL 算力当主轴放大, 底座和稳定性怎样跟上"
category: "模型库"
tags: ["MiMo", "技术解析"]
published: true
excerpt: "V2.6 是 MiMo 线第一篇把 「RL 花了多少钱」 写进正文的报告. 两档旗舰: Pro 总参 1.02T / 激活 42B, Flash 310B / 15B;"
---
# MiMo-V2.6: 把 RL 算力当主轴放大, 底座和稳定性怎样跟上

来源: 同目录 `mimo-v2-6.md` (*MiMo-V2.6: Scaling Reinforcement Learning Towards Self-Improvement*, 44 页, 31 图). 对照译稿见 `mimo-v2-6-bi.md`. 数字回 Abstract, Fig. 1–17, Tab. 1–7 与 §2–§7. RL 运行日志公开在 https://mimo.xiaomi.com/rl/mimo-v26.

V2.6 是 MiMo 线第一篇把 「RL 花了多少钱」 写进正文的报告. 两档旗舰: Pro 总参 1.02T / 激活 42B, Flash 310B / 15B; RL 阶段 Pro 约 \$2.6M, Flash 约 \$0.9M. 标题里的 self-improvement 落到操作层面是这样一句话: Agent = 模型 + 可交互环境, 能力的来源是大规模 agentic RL 在环境里拿到的多步反馈. 所以这篇的主角是后训练, 骨干基本沿用前代, 改动集中在三处: 让大 batch RL 训得动的优化器与精度, 让 RL 不崩的路由与一致性处理, 以及让奖励信号可信的环境清洗与 grader.

放进家族看, V2.6 的积木几乎都能找到前身. 文本骨干回指 MiMo-V2-Flash 技术报告; 视觉编码器改自 MiMo-VL-7B 的窗口注意力; 音频走 MiMo-Audio 的 tokenizer 配方; RL 的 partial rollout, dynamic sampler 与 Data Scheduler 从 Flash 延续, dynamic sampler 的出处是 DAPO (Yu et al. 2025); R3 保留; MOPD 升级为 MOPD2; 投机解码从 MTP-3 换成 DFlash block diffusion (Chen et al. 2026); 优化器在 mid-training 从 AdamW 换成 Muon 变体 Muown (Lion et al. 2026). 真正新出现的是三轴放大 RL 的框架, groupwise agentic grading (GRS / GAR), 冻结 router 的决定, 以及 MiMo-V2.6-Distill-Qwen-9B 开源套件.

两种 「变大」 在这篇里要分清. 部署前的 Scaling 是总参, 预训练 token (Flash 48T, Pro 30T) 与上下文 (32K→256K→1M). RL 算力沿 batch, 环境, grader 三轴放大, 仍属训练侧. 报告没有把推理时多花算力单列成 TestingTime 档; Fig. 9 里回答 token 随训练上涨是 RL 的训练动态, 不能读成一个可调的推理预算.

## 1. 动机与底座

### 1.1. 为什么把 RL 算力当主轴

引言从递归自我改进 (RSI) 讲起: 模型要靠持续探索和反馈扩展能力, 这需要把模型和可交互环境绑成 Agent, 在复杂 Agent 任务上放大 RL 是一条具体的路. 引言接着列了两个障碍: 一是基础模型要有合适的架构和足够大的探索空间, 二是放大 RL 要解决基础设施, 环境和 grader 三方面的问题. 前者对应第 1.2–1.3 节的骨干与 mid-training, 后者对应三轴放大. 摘要把放大拆成三条轴: 更大的 batch 与更高的吞吐 (异步训练, 每步 1,568 个 prompt, 2.7–3.7B tokens, 上下文最长 1M); 更多样, 更复杂的环境 (code, general, visual, cyber 四域, 混用多种 agent harness); 更多的 grader 算力 (groupwise agentic grading, 给长程任务更准的奖励, 并把模型推向更短的解). 三条轴对应式 (1) 里的三块计算: rollout, grading, training.

Fig. 3 给了这三块的实际占比. 右图 Pro 的成本拆分: rollout 43.8%, training 43.5%, grader 12.7%. 左图是 DeepSWE v1.1 average@3 随累计成本上升: Pro 58.4→72.6, Flash 48.7→65.7. grader 占到约八分之一, 说明判分在这套系统里已经不是附属脚本, 而是一笔需要单独规划的算力. 7B 那一代的判分是规则 Math-Verify 和单元测例, 成本低到可以忽略; 到了 V2.6, 判分本身要跑 LLM 与执行环境, 成本结构变了, 这也是 「grader 算力」 被列成独立一轴的原因.

### 1.2. 骨干沿用 Flash, 多模态在前端接入

Tab. 1 的规格与 Flash 报告一脉相承. Flash 档: 48/39/9 层 (Total/SWA/GA), hidden 4096, SWA heads 64/8, GA heads 64/4, experts 256/8, 总参 310B, 激活 15B. Pro 档: 70/60/10 层, hidden 6144, SWA / GA heads 都是 128/8, experts 384/8, 1.02T / 42B. 两档窗长都是 128, 头维 QK/V 192/128, 没有共享专家, 首层是全局注意力加稠密 FFN. Pro 的 SWA:GA 逐层数是 60:10, 即 6:1, 比 Flash 的 39:9 更激进; 这个比例与 V2.5-Pro 公开页写的 6:1 一致.

预训练分两阶段: 先只训语言骨干, 再接入自研 ViT 与音频编码器做 omni 联合训练; 上下文从 32K 起, 中途扩到 256K. Flash 共 48T tokens (26T 文本 + 22T omni), Pro 30T (27T + 3T). 这些总量与 V2.5 公开页的 48T 和 V2.5-Pro 的 27T 相同或相近, 结合相同的层数与专家配置, V2.6 很可能直接从 V2.5 系列的预训练检查点继续 (报告没有明说). 如果推断成立, V2.5 到 V2.6 的差距 (Tab. 3 里 DeepSWE 19.0→71.9) 几乎全部来自 mid-training 与后训练.

多模态前端是在 Flash 骨干上加的. ViT 把 MiMo-VL-7B 的固定非重叠窗口注意力换成 sink-augmented SWA, 局部层在行主序与列主序之间交替, 周期插入 GA 层; 规格 28/24/4 层, hidden 1280, 窗左右各 64, 参量 681M, 训练超过 4T image tokens. 音频 tokenizer 在 25 Hz 用 20 层 RVQ 编码, 训练数据约 2000 万 小时; patch encoder 每 4 帧合一个 patch, 把速率降到 6.25 Hz 再投进骨干. sink 加 SWA 从文本骨干一路用到视觉和音频编码器, 是这个家族在注意力设计上最稳定的一条线.

### 1.3. Mid-training: 为大 batch RL 换优化器, 换精度

§3.2 的 mid-training 用 agent-centric 数据混合, 轨迹覆盖 coding, general, visual, research, 再掺文本, 仓库级代码, 图像, 视频, 音频; 先在 256K 上花大部分算力, 末段扩到 1M. 这一步的作用是给 RL 准备探索空间: RL 只能强化策略已经偶尔能做对的行为, mid-training 把这类行为的覆盖面先铺开. 这与 MiMo-7B 用 pass@k 论证 「底座里有可挖的正解」 是同一个逻辑, 只是对象从数学题换成了多步 Agent 轨迹.

优化器切换是这一节最有信息量的决定. 报告说初步实验里 mixed-task RL 的 batch 变大后 AdamW 的优化效率下降. Muon 的做法是对隐藏层权重的更新矩阵做正交化 (Newton–Schulz 迭代), 让更新在各个奇异方向上步长接近; 已有工作 (Liu et al. 2025, Shah et al. 2025) 发现它在超过 critical batch size 后仍保持更好的数据效率. critical batch size 指的是再加大 batch 已不能按比例减少所需步数的那个点, RL 每步 25K 条序列, 正处在这个区间之外. **Muown** 在 Muon 上加显式 row-norm 控制, 缓解谱范数漂移; embedding, LM head 与 MoE router 仍用 AdamW. 背景见 [MuonClip 与 PolarExpress](../../../../llm-guide/6-训练与推理优化/6.5-优化器/Muon/05-MuonClip与PolarExpress.md).

文献里有 Adam 训练的模型切到 Muon 会失配的报告, V2.6 称 mid-training 全程没有 loss spike. 同期还开了 MXFP4 量化感知训练, 让专家权重适应 4 bit 计算; RL 阶段继承 SFT 检查点的 FP32 master weights 与 Muown 的 row state, 保证低精度训练不从头累积误差. 换优化器, 换精度都放在 mid-training 而不是 RL 里做, 是把风险前移: RL 一步几十亿 token, 出了问题代价远高于 mid-training.

## 2. RL 三轴放大

### 2.1. 算力轴: 异步, 有限陈旧, 按数据源调度

RL 设置 (§5.1): 1568 prompts × 16 rollouts = 25K 条轨迹, GRPO, 异步 partial rollout, staleness 4; Muown 学习率 $3\times10^{-6}$, 无 weight decay 与 warmup, grad clip 1.0. Muon 分量动量 0.95 并开 Nesterov, 每次更新做 10 次 Newton–Schulz 迭代, 再乘 0.5 的额外缩放, 即 $\Delta W=-\eta\cdot0.5\cdot\mathrm{NS}_{10}(M_t)$, $M_t$ 为 Nesterov 动量, $\mathrm{NS}_{10}$ 把矩阵推向正交因子 $UV^\top$ (奇异值压到 1 附近); Adam 分量 $\beta_1=\beta_2=0.95$, $\epsilon=10^{-8}$. Muown 的 row-norm 控制具体怎么加, 报告没写. 大 batch 的好处是 rollout 按序列并行, 训练按数据并行切分, 吞吐随 GPU 数增长; 显存大部分被 running batch 占满, 算术强度高. partial rollout 在收齐一个训练 batch 时打断未完成的序列, 下一阶段接着跑; 代价是策略更新后续跑要重建 KV 缓存 (re-prefill), 所以 batch 大小与 partial rollout 要一起选, 大 batch 才能摊薄重建成本.

陈旧样本的处理按家族时间线看最清楚. MiMo-7B 为了算法纯净拒绝异步; Flash 接入 partial rollout, 限制陈旧度与 partial 样本比例, 用 staleness-aware truncated IS 补偿; V2.6 进入全异步, 允许最多落后 4 个策略版本. 目标是式 (1):

$$
\mathcal{L}(\theta)=-\mathbb{E}_{q\sim\bigcup_d\mathcal D_d,\ \{o_i\}_{i=1}^{G}\sim\mu_{\theta_{\mathrm{old}}}}\Big[\frac{1}{\sum_{i=1}^{G}|o_i|}\sum_{i=1}^{G}\sum_{t=1}^{|o_i|}r_{i,t}\,M_{i,t}\,A_i\log\pi_\theta(o_{i,t}\mid q,o_{i,<t})\Big].
$$

$r_{i,t}=\mathrm{sg}[\pi_\theta(o_{i,t})/\mu_{\theta_{\mathrm{old}}}(o_{i,t})]$ 按 token 算, 分子是训练框架里当前模型的概率, 分母是生成该 token 时 rollout 模型给的概率, partial rollout 续跑的部分也不重算分母, 所以一个比率里同时含有最多 4 个版本的策略差和两个引擎的数值差. $M_{i,t}$ 是 token 级掩码; 裁剪另写成掩码 $\tilde M=\mathbb{1}\big[(A\ge0\wedge\epsilon_+^l\le r\le\epsilon_+^h)\vee(A<0\wedge\epsilon_-^l\le r\le\epsilon_-^h)\big]$, 四个边界初值都是 [0.2, 5.0]. 报告没写 $\tilde M$ 怎么并进式 (1) 的 $M$, 按字面应是相乘.

同一个 token 上与 MiMo-7B 的 $\min(\rho A,\mathrm{clip}(\rho)A)$ 对比: 优势为正, 比率 6 时, 7B 取到 clip 那一支, 梯度为零, V2.6 掩掉, 结果相同; 优势为正, 比率 0.1 时, 7B 的 min 取 $0.1A$, 梯度照常回传, V2.6 因为 $0.1<0.2$ 直接掩掉. **V2.6 两头都截, 7B 只截优势推动方向那一头.** 边界按熵在线调: 熵太低就放宽正边界, 收紧负边界, 熵太高反过来, 同时监控两个方向各自的 token 截断率. 这比 DAPO 的 Clip-Higher 多了一层: 不只上下界不对称, 正负优势也分开处理.

多任务混训的另一个难点是数据源之间的速度差. Fig. 15 统计 25 个数据源, 平均生成 token 与 rollout 时长分别相差 90× 与 66×. 如果按到达顺序收样本, 快的源会挤满 batch, 慢的源 (长程代码任务) 训不到. **Sample Mixer** 用四个机制维持预定配比: 按源自适应并发, 在预算内按缺口 (deficit) 挑源, 按 KV 需求预测把新 rollout 放到有余量的 rank, 启动和恢复时回放已完成的慢源样本 (启动期收集约是稳态的 1.8× 耗时). 任务配比为 agentic 与竞赛编程 68%, 通用工具 12%, 审美设计 13%, 上下文遵循 3%, 网络安全 4%.

前两个机制有公式. 源 $i$ 每步要留下 $B_i$ 组, 估计的组接收率 $r_i$, 活跃 rollout 时长 $t_i$ (含生成与环境交互, 不含训练步之间的暂停), 生成需求 $m_i=B_i/r_i$, 所需并发与 $t_im_i$ 成正比. 调度预算是 $(1+p_i)m_i$ 组, 超采比由式 (6) 定:

$$
p_i=\mathrm{clip}(c\,t_i-1,\ p_{\min},\ p_{\max}),\qquad \frac{\sum_i m_ip_i}{\sum_i m_i}=\bar p ,
$$

公共系数 $c$ 解出来让按需求加权的平均超采比等于全局 $\bar p$, 越慢的源超采越多. 预算之内按式 (7) 的权重做平滑加权轮转, $A_i$ 是本步已收下的组数:

$$
w_i=\alpha\frac{B_i}{r_i}+(1-\alpha)\frac{(B_i-A_i)^+}{r_i}.
$$

第一项维持长期需求, 第二项偏向还欠着的源. 两个源都是 $B=10$, $r=0.5$, 一个已收 6 组, 一个已收满 10 组 (数是假设的), $\alpha=0.5$ 时权重分别是 $10+4=14$ 与 $10+0=10$. Fig. 16 的仿真比了三档: $\alpha=0$ 只看缺口, 占用率不稳; $\alpha=1$ 只看目标, 各源收集进度不齐; $\alpha=0.5$ 两头都更好, 稳态启动用的就是它, 初始并发按 $t_im_i$ 比例分. $\bar p$, $p_{\min}$, $p_{\max}$ 的取值没给. 第三个机制只在 「估计 KV 需求乘安全系数后放得下」 的 rank 上接收新 rollout, 再在可行 rank 里贪心挑剩余容量最大的, 容量取可用并发槽与剩余 KV 两者的较小值, 都折成序列数.

撑起这一轴的还有一层轨迹与调度基建 (§6). Agent Loop 负责环境的生命周期, 轨迹分四级: Sample, Sequence, Context, Segment; Penalty Module 用规则加策略 (掩码, 优势整形, 只监控) 把基础设施故障从训练信号里剔除, 避免 「环境挂了」 被当成 「模型做错了」. Harness Pool 用固定数量的常驻 host actor 多租户地跑 harness, 不为每个实例起一个 Ray actor; Payload Porter 把带路由信息和多模态内容的重载荷写进分布式 KV, driver 只处理轻量元数据, 这就是引言说的控制面与数据面解耦. 训练侧在 1M 上下文下, SWA 层在 context parallel 中只交换窗内可达的 KV, 这是混合注意力给系统带来的直接好处. 报告只给了这些机制描述, 没有 MFU 或吞吐表.

**Penalty Module** 的设计值得多说一句, 它处理的是 GRPO 在 Agent 任务上的信用分配问题. 组相对算法把结果奖励平均摊到一条轨迹的所有模型 token 上, 但长程轨迹里有的轮次跑偏或退化, 有的失败与模型无关 (环境挂了). 模块把 「检测」 和 「处置」 分开: Rule 用手写逻辑或模型判断某个 segment, context 或 sequence, 比如基础设施故障, 乱码 token, 调用不存在的工具, 重复; Strategy 决定处置方式, mask 把命中内容排除出损失, advantage shaping 对命中 token 的优势做设定, 乘系数或扣减, monitor 只记指标. 处罚沿层级升级: 一个 context 没有存活的模型轮次就丢弃, 一个 sequence 没有存活的 context 就给零优势, 一个 sample 没有存活的 sequence 就整组拒收. Agent Loop 本身是 token-in, token-out 的: 每段对话同时存字符串前缀和 token 序列, 新请求靠前缀匹配找到它延续的对话, 只把新增后缀送去分词, 推理引擎的接口因此保持纯 token 进出 (按机制理解, 这能避免整段历史反复重新分词时 token 边界前后不一致). 只有模型生成的轮次计入损失, 工具结果和用户消息不计.

数据面的细节则说明大 batch 的瓶颈不止在 GPU. 每条序列除了 token id 和 log-prob, 还带 MoE 路由记录, top-p 采样索引与多模态数据, 如果都汇到一个 driver 节点, batch 大小就被这台机器的内存卡住. V2.6 在 rollout 结束时把载荷一次写入分布式 KV (Ray object store 或 TransferQueue), driver 只拿标量奖励, 各 context 长度和载荷的键做调度; groupwise grader 与 Agent Loop 完全异步, 结果允许滞后, 返回时改写组奖励; 优势全为零的组默认丢弃. 打包时每个训练 TP 组只有一个 packer, 只取本 CP 窗口会用到的行. Agent 反复截图, 读图, 一条轨迹的多模态数据可以累积到 GB 级, rollout 时只传两次请求之间的增量; 训练时视觉编码器在 TP 组内复制, 所以先按数据并行把图片均衡分到各 rank 编码, 再把 embedding 送回持有对应 token 的 rank.

### 2.2. 环境轴: 四个领域, 多种 harness

代码 Agent 环境 (§4.2.1) 的出发点是 「可执行评测不等于可靠监督」. 题目来源有五路: GitHub PR / issue, 内部真实开发请求, 规格驱动合成, 源码驱动合成 (CodeMidas), 长程软件工程任务. 监督要过三关: 规格与测例对齐 (4 次 rollout 加审计 Agent 查假阳性和假阴性), 参考补丁前后 F2P / P2P 在 8 次重跑中稳定, 轨迹审计挖 hacking. 通用 Agent 用可重置的本地环境 (真实文件加软件 mock), 任务用原子二元 rubric; 视觉分开放设计与高保真复刻; 网络安全用 OSS-Fuzz 级漏洞复现, 以 sanitizer 报告里漏洞类型与崩溃位置双匹配作为规则判定, 比 CyberGym 的 LLM 判决更确定也更便宜.

通用 Agent 的环境本身也是合成出来的, 流程比代码环境更长. 一个 planning agent 先规划工作区结构, 选工具, 规划文件与数据库内容, 用网络搜索让规划贴近真实信息, 并有意在文件之间, 文件与数据库记录之间留下关联, 供后面的多跳推理与交叉核对. 多个 Agent 按共享规划并行生成文件, 填充数据库, 再由 review agent 检查单个产物与全局一致性 (实体名, 数字对账, 时间线, 引用), 发现矛盾就迭代修复. 任务从常见职业任务归纳出种子, 由 Agent 在具体环境里改写. 判分用原子二元 rubric: 数据库取值, 交付格式这类确定性质量由代码检查, 开放内容由 LLM 检查; 对 LLM 检查项, 同一模型多次判断之间与不同判分模型之间的一致性被用来找出有歧义的 rubric.

网络安全的判分设计最能体现 「奖励必须准, 确定, 便宜」 这条要求. OSS-Fuzz 提供数万个人工确认的漏洞实例, 数量是其他安全任务比不了的; 难点在于复杂的 C/C++ 项目有几十条可达的崩溃路径, 要触发的是描述里那一个. CyberGym 的差分判定 (PoC 让漏洞版本崩, 修复版本不崩) 有两种失败: 补丁不完整会拒掉正确的 PoC, 两次提交之间的无关改动会让判定翻转; LLM 判决则同一 PoC 多次结果不同. V2.6 从 sanitizer (ASan / MSan / UBSan) 报告里取漏洞类型和最顶层项目栈帧, 双匹配才算成功, 任务描述也从同一份报告生成, 描述与判定共用一个事实源. 报告脚注说明, Tab. 3 的 CyberGym 分数是按这套方法修正评测环境后跑的, 与原版 CyberGym 的分数不能直接比.

**multi-harness** 是这一轴的新东西. harness 指包在模型外面的 Agent 框架: 系统提示, 工具集, 上下文管理. 报告没有直接用 Codex, Claude Code 这类生产 harness 训练, 理由是生产 harness 里的工程护栏会影响任务成败却不在奖励之内, credit assignment 不可靠, 模块又耦合难以控制变量. 做法是从同一个最小 agent loop 派生多种 mini-harness, 模块最小且可重组. Fig. 10 显示, 在 4 个训练 harness 与 3 个未见过的 harness (codex, claude code, mini-swe-agent) 上 DeepSWE Pass@1 都涨, held-out 均值约 50%→66% (读图). 这与 Flash 附录 C 的观察呼应: 同一份权重在不同 harness 下分数差异很大, 训练时就见过多种 harness, 部署时换框架才不掉分.

环境的可验证程度决定了奖励怎么给. 代码有可执行测例, 网络安全有 sanitizer 规则, 这两类是硬验证; 通用 Agent 的 rubric 由代码检查和 LLM 检查混合, 再用不同能力模型的 rollout 反查 rubric 是否过严或过松, 并故意构造对抗解测试 hacking, RL 中由自托管的 MiMo-V2.6-SFT 当 grader; 视觉设计靠 pointwise 加 groupwise 的审美比较, 可验证程度最弱. 引言强调放大 RL 在代码这类可验证任务和网页开发这类较难验证的任务上都有收益, Fig. 1 与 Fig. 9 里 DeepSWE, AutomationBench, MiMo Visual Coding 随训练步数一起上涨. 验证越弱的领域越依赖 grader 的质量, 这把环境轴和下一节的 grader 轴连在了一起.

### 2.3. Reward hacking: 从 git 漏洞到四层防线

Flash 报告附录 B 只记了一件事: 官方 SWE-Bench 镜像的 git 历史没清干净, 模型会学着翻出答案. V2.6 的 §4.2.6 把这类问题扩成一张表: Tab. 2 列出仓库修复任务里的五种 solution leakage 模式, 安装并读已发布的新版包, 拉取上游, 克隆上游, 查现成解, 探测版本. 这说明 hacking 不是某个镜像的偶发 bug, 而是 RL 策略在任何留有外部信息的环境里都会去找的捷径, 策略越强, 找得越好.

缓解分四层. mid-training 把早期 hacking 案例合成对齐数据, 让模型学会反思并改写; 环境准备清掉构建日志, verifier 输出, 残留补丁与字节码, Git 只保留到 base commit, 容器级断网; Hack Agent 专门探测残留泄漏, 反复清理直到找不到能成功的利用; 训练中离线审计轨迹, groupwise grader 在线把确认 hacking 的奖励置零再重算组统计. Fig. 6 显示最终 RL 中确认 hacking 的比例全程低于 2%, Flash 与 Pro 都是. 前三层在训练前把漏洞堵住, 第四层兜住训练中策略新发现的捷径, 两类手段缺一不可.

几层各有细节. mid-training 的对齐样本来自早期实验里真实出现的 hacking 案例: 模型对错误推理做反思, 改写出问题的那一轮, 再接着按任务规格行动; 改写后的推理保留原来的错误可辨认, 纠正过程写明, 报告说加入这些样本后对齐明显改善. Hack Agent 用早期实验里的例子引导搜索, 比如从缓存产物或预装的目标项目副本里恢复答案, 在检查这些已知路径的同时找新路径; 它找到了许多训练中没观察到, 现有清理流程也没覆盖的利用方式, 清理规则据此修订后再跑一轮 Hack Agent. 这是把红队测试做成了自动化的闭环, 与 Flash 那一代 「修好镜像, 确认本模型没 hack」 的一次性处理相比, 防线从静态变成了迭代.

### 2.4. Grader 轴: 在 「测例通过」 之上分出质量

测例通过是二元信号: 同一组 16 条回答全部通过时, 标准化优势全为零, 模型学不到哪种改法更好. §4.3 给代码 Agent 开了两条路. 高通过率题走 **GRS** (离线): 多条离线 rollout 一起分析, 产出方案 rubric 与行为 rubric, 训练时 grader 进执行环境打分, 式 (2) 为 $R_i=R_i^{\mathrm{test}}\cdot S_i^{\mathrm{sol}}\cdot S_i^{\mathrm{beh}}$. 乘法保证没过测例的仍是零分, 通过的再按质量分档, 组内全过也有梯度. 这和 MiMo-7B 的测例难度分层奖励处理的是同一个问题的两端: 7B 让全错的难题有部分分, GRS 让全对的题分出高下.

其余题走 **GAR** (在线): 混合结果的一组回答放进共享工作区, SFT grader 从五个维度比较通过的补丁 (方案是否合适, 精准, 最小改动, 有无副作用, 工艺), 确认泄漏的清零当失败. 式 (3) 写开如下. $R_i$ 是清除 hacking 后的二元奖励, $A_i=R_i-\bar R$ (这里不除组标准差), $\mathcal P=\{i:R_i=1\}$, 质量因子 $f_i\in(0,1]$ 由排名给出:

$$
\lambda=\frac{\sum_{j\in\mathcal P}A_j}{\sum_{j\in\mathcal P}f_jA_j},\qquad A_i'=\begin{cases}\lambda f_iA_i,& i\in\mathcal P,\\ A_i,& i\notin\mathcal P.\end{cases}
$$

算一组 $G=4$ 的例子 ($f$ 是假设的): 奖励 [1, 1, 1, 0], $\bar R=0.75$, $A=[0.25,0.25,0.25,-0.75]$; 三个通过解 $f=[1,0.5,0.5]$, $\lambda=0.75/0.5=1.5$, $A'=[0.375,0.1875,0.1875,-0.75]$. 通过集总和仍是 0.75, 最好的通过解拿到最差通过解 2 倍的正优势. 只降权不补回, 正优势总量变小而负优势不变, 报告说这会让熵涨得过快, $\lambda$ 就是为此把总量补回. 原始 $A_i$ 组内和为零, 不截断时重分配又不改通过集总和, 所以随后 「减组均值」 这一步什么也不改, 它只在 $\lambda$ 撞上上限时起作用: 若上限取 1.2 (假设), $A'_{\mathcal P}=[0.3,0.15,0.15]$, 组和变成 $-0.15$, 减去均值 $-0.0375$ 后得 $[0.3375,0.1875,0.1875,-0.7125]$, 失败解的负优势也跟着变轻. 最终的序列优势广播到整条回答的所有 token. $f_i$ 与排名的映射, $\lambda$ 的上限都没给数.

Fig. 8 在 Flash 的纯代码 RL 上对照, 关掉的只有 GAR 这一项; 两条曲线都是 batch 128, token-mean 聚合, 与主 run 的大 batch 和 prompt-mean 都不同. 不做在线判分时轮数和总 token 疯涨, 容易撞长度上限; 有 GAR 时到 step 52 仍在涨 pass rate, 轮数大致稳定. 维护者审计还发现, 没有 GAR 的策略更爱写兼容分支, 宽泛导出, 吞异常, 放松校验.

长度控制先落在损失聚合上. 式 (1) 的 $1/\sum_i|o_i|$ 放在对 $q$ 的期望里面, 每个 prompt 先按组内 token 总数平均, 再跨 prompt 平均, 这就是 prompt-mean; 全 batch 的 token-mean 则把整批 token 总数放在最外层做分母. 两者差在 prompt 之间的权重: 一批里两个 prompt, 组内 token 总数分别是 1 万与 10 万, token-mean 下后者占全部梯度权重的 10/11, prompt-mean 下两者各占一半. token-mean 里某个 prompt 的回答越写越长, 它在梯度里的份额就越大, prompt-mean 把每个 prompt 的份额固定住 (解读, 报告只写了 「防止回答长度涨得太快」). MiMo-7B 的式 (1) 写法与此相同, 分母也在期望内, 7B 报告没交代实现里按组还是按整个 batch 归一, 所以不能说两代 「换了方向」, 能确定的是 V2.6 明确不用全 batch token-mean.

另加两项行为正则. 式 (4) 的组相对长度惩罚只动成功轨迹: 组通过率 $|\mathcal P_q|/G>A$ 时, 取成功样本长度的第 $B$ 分位数为参照 $\ell_q^\star$, 改写奖励

$$
\widetilde R_i=R_i-\mathbb{1}[i\in\mathcal P_q]\,X\Big[\mathrm{clip}\Big(\frac{\ell_i/\ell_q^\star-1-\delta}{s-\delta},0,1\Big)\Big]^{\gamma},
$$

$X$ 是最大扣分, $\delta$ 是容忍的相对超出, 超出到 $s$ 时扣满, $\gamma\ge1$ 控制坡度, 优势由 $\widetilde R$ 重算. 取 $\delta=0$, $s=1$, $\gamma=1$, $X=0.5$ (假设值, 报告六个超参 $A,B,X,\delta,s,\gamma$ 都没给): 成功解长度是参照的 1.5 倍扣 0.25, 2 倍及以上扣满 0.5, 不超过参照不扣; $B=50$ 时约一半成功解会被扣. 报告说它既改善泛化又抑制生成 token 的快速增长. 按基建一节写的处理顺序, grader 改写组奖励后, sampler 先按通过率收拒整组, 然后 hook 才加长度惩罚, 算优势, 做优势整形; 全过的组此时已被拒, 所以这项惩罚实际作用在通过率介于 $A$ 与 1 之间的组. GRS 那段又说全过组靠 rubric 分仍有信号, 报告没说 GRS 任务的组是否绕开这道过滤. DAPO 的 overlong 惩罚只看是否超长, V2.6 的长度惩罚是组内相对的, 且只在题已经容易时才启动.

式 (5) 的段级惩罚对格式错误和工具调用错误打标 ($h_{i,t}=1$), 统计在整个 batch 上做, $H_\pm$ 与 $C_\pm$ 分别是正/负优势轨迹里被标与未标的 token:

$$
\widetilde A_{i,t}=\begin{cases}\alpha(1-h_{i,t})A_i,& A_i>0,\\ \big[\beta(1-h_{i,t})+\kappa h_{i,t}\big]A_i,& A_i<0,\\ 0,& A_i=0,\end{cases}\qquad \alpha=\min\Big(\alpha_{\max},1+\frac{\sum_{H_+}A_i}{\sum_{C_+}A_i}\Big),\quad \beta=\max\Big(\beta_{\min},1-\frac{(\kappa-1)\sum_{H_-}|A_i|}{\sum_{C_-}|A_i|}\Big).
$$

正优势轨迹里被标 token 的优势清零, 这部分按 $\alpha$ 补给未标 token: $\alpha\sum_{C_+}A=\sum_{C_+}A+\sum_{H_+}A$. 负优势轨迹里被标 token 乘 $\kappa>1$ 加重, 多出的 $(\kappa-1)\sum_{H_-}|A|$ 由 $\beta$ 从未标 token 上扣回: $\beta\sum_{C_-}|A|+\kappa\sum_{H_-}|A|=\sum_{C_-}|A|+\sum_{H_-}|A|$. **正负两个方向的优势总量都守恒**, 报告说这是为了不让额外的负向压力推高熵; $\alpha$, $\beta$ 撞上 $\alpha_{\max}$, $\beta_{\min}$, 或分母为零 (此时系数取 1) 时, 守恒不再成立. $\kappa$, $\alpha_{\max}$, $\beta_{\min}$ 没给数.

## 3. 稳定性与推理加速

### 3.1. 冻结 router: 一次可诊断的崩溃

§5.4 的 Fig. 11 比较了两次只差 「router 是否冻结」 的 Pro RL. 在第 9 层 decoder (384 专家) 上, 可训 router 时前 20 步三项负载指标单调上升: 变异系数 CV 0.78→2.0, 峰值负载 6×→16×, 冷专家 (负载低于均值 0.1×) 占比 0.5%→22%. 诊断做得很干净: 把 step 20 的 router 参数恢复到 RL 前, 其他参数不动, 负载恢复, 基准分不变. **结论是崩溃来自 router 漂移, 专家权重本身没坏.** 冻结 router 后 CV 约 0.7, 峰值约 5.5×, 冷专家约 1%, 基准正常上涨.

这件事要和 R3 分开看. R3 (Flash 起用, V2.6 保留) 处理的是同一份权重下, 推理引擎与训练引擎因数值差异选出不同专家; 冻结 router 处理的是 RL 更新本身让路由分布越来越偏. 前者是一致性问题, 后者是优化问题, V2.6 两个都做了. 再加上 MXFP4 专家的量化-反量化对齐, top-p 候选集回放, 训练-推理一致性这条线在 V2.6 有四层. 后两层的规则写得很具体. 每次参数更新后, 训练侧按 rollout 所用 MXFP4 Humming GEMM kernel 的数值约束对专家做一次量化-反量化, 两个引擎看到的专家权重完全相同. top-p 采样在候选集 $S_t$ 内重新归一, 推理侧概率是 $\mu(o_t)=e^{z_{o_t}}/\sum_{v\in S_t}e^{z_v}$; 训练侧若按全词表归一, 得到 $e^{z_{o_t}}/\sum_{v}e^{z_v}$, 对数上比推理侧低 $-\log P(S_t)$, $P(S_t)$ 是候选集在全词表下的质量, 比率 $r$ 因此被系统性地乘上 $P(S_t)\le1$. rollout 时记下每个 token 的 $S_t$, 训练时在同一集合内归一, 这项偏差就消掉. 传输上只有 GPU 到 CPU 这一步是稠密的, 用固定形状, 全词表宽度的 bitmap, 避免一次同步, 也不会截断覆盖全词表的集合; 之后全走稀疏表示, top-p 取 0.97 时候选集平均不到 5 个 token. 失败时间线 Fig. 12 也值得一看: GPU 双位错误, K8s 安全集群宕机, grader 网络不通, partial rollout 长度估计偏差导致 KV 池耗尽, 微批内 MoE 失衡 OOM (某个 EP rank 超均值 30×), 打包期主机内存 OOM. \$2.6M 的训练并不是一条平滑曲线.

### 3.2. 投机解码从 MTP 换成 DFlash

Flash 的 MTP 是逐层串行出草稿: 第 1 个 MTP 层猜下一个 token, 第 2 层接着猜再下一个, 草稿越长越慢, 接受率也逐层衰减. **DFlash** 用 block diffusion 的思路一次出一整块: drafter 5 层稠密 FFN, 条件在骨干隐特征与一个干净的 anchor 上, 一次预测 7 个后续 token, 块内双向注意力, 最多看 anchor 前 1024 个骨干位置. 草稿层全用 SWA 与 grouped queries, 窗扩到 1024. 投机解码的一般原理见 [投机解码原理与应用](../../../../llm-guide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.2-投机解码/01-投机解码原理与应用.md).

RL rollout 默认用 block-6 DFlash, 替代 SFT 阶段继承的 MTP-3. 架构一节的 「一次预测 7 个 token」 加上 anchor 是 8 个位置, 对应 block-8; block-6 按同样算法每步出 5 个草稿 (按块大小推算, 报告没有把两处连起来写). DFlash 先在 SFT 策略上训, 再用早期 RL rollout 日志重采样微调, 以贴合 RL 分布; 此时平均接受长度比 MTP 高 31.3%. 大 batch 下按端到端吞吐而非接受率选块大小: block-6 比 block-8 的全局平均吞吐高约 6%, 接受长度几乎不变, 因为更小的块减少了校验工作. FP8 草稿计算在长上下文负载上再带来约 10.3% 的单节点吞吐提升. 这些都是训练系统里的 rollout 加速, 延续了 Flash 「MTP 给 RL 提速」 的思路, 手段换了.

用 RL 日志微调草稿模型这一步有它的道理 (以下是按机制的解读). 投机解码的收益取决于草稿与主模型分布的吻合度, Flash 报告的 Figure 7 已经显示接受长度随任务熵变化; RL 过程中主模型的分布在持续移动, 回答风格, 工具调用习惯, 长度都会变, 只在 SFT 策略上训的草稿会逐渐对不上. 用早期 RL rollout 重采样后再微调, 是让草稿跟上策略漂移. 报告没有给 RL 后期接受长度是否下降, 也没说草稿是否在训练中多次更新, 这两点决定了 31.3% 的提升能在整个训练中维持多少.

## 4. 结果与家族位置

### 4.1. MOPD2 与主结果

**MOPD2** (Multi-Prefix Multi-Teacher On-Policy Distillation) 继承 Flash 的 MOPD, 加上前缀条件的单轮 rollout (Liao et al. 2026). 标准 MOPD 让学生从头采完整轨迹, 教师逐 token 打分; 长程 Agent 任务里学生前几步走偏, 后面的蒸馏信号就建在教师从未见过的状态上. prefix-conditioned OPD 从教师轨迹或 SFT 数据里切出 $k$ 个完整的历史前缀, 学生只采当前一轮, 教师给 token 级信号. 一条有 $k$ 个 assistant 轮的源轨迹给出 $h_1,\dots,h_k$, $h_i$ 截止在第 $i$ 轮之前; 学生从每个 $h_i$ 采一轮 $y_i$, 不重跑之前的交互, 预先指定的教师在同一个 $h_i$ 和学生已生成的 $y_{i,<t}$ 上打分. 报告没写 MOPD2 的损失式; 若沿用 Flash 式 (8), 第 $i$ 轮第 $t$ 个 token 的优势是 $\log\pi_T(y_{i,t}\mid h_i,y_{i,<t})-\log\pi_\theta(y_{i,t}\mid h_i,y_{i,<t})$ (推测). 与标准 MOPD 在同一轮上的差别只在前文: 标准 MOPD 第 $i$ 轮的前文是学生自己前 $i-1$ 轮及其工具返回, prefix-OPD 的前文是教师或示范给的 $h_i$. SFT 数据在这里只提供前文, 不当续写目标. 目标是把难以设计可靠验证器的领域 (长程游戏开发, 科研, 具身智能) 合进同一个检查点, 这是 Flash 报告里 「教师与学生迭代共进化」 的延续.

Fig. 13 给了教师的配置. 可验证领域的教师用 MixRL 训出, 也就是前面三轴放大的混合任务 RL 产物; 开放领域的教师是 SFT 模型, 并用 SFT 数据切出的前缀 (SFT-Prefix) 先把学生限制在合理的状态附近, 再做蒸馏. 与 Flash 的 MOPD 相比, 教师来源从 「每个领域单独 RL」 变成 「一次混合 RL 加若干 SFT 专家」, 这与标题里 You Only RL Once 的说法一致: 可验证的能力尽量在一次大 RL 里练出来, 剩下难验证的部分交给蒸馏. 报告没有给 MOPD2 前后的逐项对比表, 所以无法像 Flash 的 Table 7 那样量化每个领域从蒸馏里拿到了多少.

Tab. 3 的旗舰对照: DeepSWE v1.1 Pro 71.9, Flash 67.9, V2.5-Pro 19.0, Claude Opus 5 74.0, GPT-5.6 Sol 73.0, Claude Fable 5 70.0. AutomationBench Pro 53.1, Flash 52.3, 高于表中三个闭源 (50.3/45.8/46.2), V2.5-Pro 16.0. CyberGym Pro 94.0, Flash 95.1, 闭源列空缺. MiMo Visual Coding Pro 72.3, Flash 71.5. 弱项也清楚: ExploitBench Pro 47.9 对闭源 70.0–78.5, SEC Bench Pro 66.3 对 GPT-5.6 Sol 79.1, Terminal Bench 4.0 34.9 对 Claude Opus 5 49.0. 注意 Fig. 3 左图 RL 末端的 72.6 是 average@3 训练曲线读数, Tab. 3 的 71.9 是 MOPD2 之后的最终评测, 两者口径不同. MiMo Code / Cyber / Visual 是内部基准, 与公开榜分开读.

评测设置 (§5.2) 决定了这张表怎么读. 基准分四类: 代码 Agent 有 DeepSWE v1.1 (长程开发任务), ProgramBench (只给编译好的二进制和文档, 要求重建出行为一致的程序) 与 MiMo Code Bench; 网络安全有 CyberGym, SEC Bench Pro (从 bug 报告复现复杂漏洞), ExploitGym 与 ExploitBench (看能否从触发崩溃走到真正的利用及其安全影响) 与 MiMo Cyber Bench; 通用 Agent 有 AutomationBench (模拟 SaaS 环境中经 REST API 编排跨应用流程, 含 API 发现与业务规则遵循), Toolathlon-Verified (含 MCP 工具的长程多应用流程), GDPval-AA, JobBench, Agents' Last Exam, Terminal-Bench 4.0 / 2.1, OSWorld-Verified; 视觉 Agent 只有内部的 MiMo Visual Coding, 含 WebDev 与 Image2Code. 所有可配推理强度的对照模型都按最高档 (max) 评测. 按这个分类看, V2.6 在 「复现」 类安全任务 (CyberGym) 上领先, 在 「利用」 类 (ExploitBench, ExploitGym 17.8 对闭源 22.1–30.3) 上落后, 这与训练环境只覆盖漏洞复现, 不覆盖利用开发是一致的.

### 4.2. Distill-Qwen-9B: 配方能不能迁移到小模型

§7 开源 MiMo-V2.6-Distill-Qwen-9B, 连同环境, 端到端 RL 框架与 mini-harness. 做法是用 MiMo 生成的四域数据对 Qwen3.5-9B 做 SFT, 相当于把旗舰的 Agent 经验蒸进小模型; 仅 SFT 这一步, SWE-bench Pro 就从 32.0 到 44.6, AutomationBench 从 5.0 到 30.3. Tab. 4 的 SFT 混合共 77.4B tokens, 其中计损失的 27.2B; Code 23.2B, Cyber 11.0B, General 22.0B, Visual 21.2B. Tab. 5 的 RL 任务约 Code 3k, Cyber 1k, General 1k, Visual 2k, 另有约 1k 音乐生成. Tab. 6 在同一 SFT 检查点上分域 GRPO, 11 项评测全涨: SWE-bench Verified 61.1→66.2, Terminal Bench 2.1 37.1→52.8, MiMo Visual Coding (mini) 64.0→72.4, MiMo Cyber Bench (mini) 31.3→47.0, 内部音乐基准 45.7→52.5.

Tab. 7 在 7 个 harness × 3 个数据集上看 multi-harness RL: 蒸馏模型在全部 21 个组合上高于 Qwen3.5-9B, multi-harness RL 又让每个组合继续涨, MiMo Code Bench (mini) 上额外增益约 1.8–9.3 个百分点. 以 SWE-bench Verified 的 7 个 harness 均值为例, Qwen3.5-9B 53.1, 蒸馏后 62.3, multi-harness RL 后 65.7; 其中 codex, claude code, mini-swe-agent 三个 held-out harness 也都在涨. Tab. 6 里代码域用的是单 harness RL, 与 Tab. 7 是两组实验. 这条线的意义是可复现: 旗舰线的 \$M 级算力外人跑不起, 9B 这条线把同一套环境, verifier, mini-harness 与 GRPO 配方放出来, 从蒸馏初始化出发也能分域涨分. 引用时要把 Distill 与旗舰分开, Tab. 6 的分数不能回填到 Tab. 3.

### 4.3. 在家族里的位置, 以及报告没给的东西

把各面串起来: 预训练应沿用 V2.5 系列的骨干与数据量; mid-training 用 agent 轨迹铺探索空间, 同时换 Muown 与 MXFP4 为大 batch RL 做准备; RL 沿算力, 环境, grader 三轴放大, 异步 partial rollout 允许有限陈旧, Sample Mixer 维持配比; 环境清洗, Hack Agent 与在线清零把 hacking 压在 2% 以下; GRS / GAR 在测例之上给质量梯度, prompt-mean 与长度惩罚管住回答长度; 冻结 router 与 R3 分别处理路由漂移与引擎不一致; DFlash 加速 rollout; MOPD2 把难验证领域合进最终检查点. 从 MiMo-7B 算起, 同步到异步, 规则判分到 agentic grading, 单边裁剪到双边掩码, 这几条线在 V2.6 都走到了新的一端.

报告没有给的也要记下. hybrid block 内部每块的 SWA 层数只给了总数; Muown 相对 Muon 的超参扫描没有; Sample Mixer 的全局参数, GAR 质量因子 $f_i$ 的映射表没有数值; 旗舰 RL 的总步数与完整学习率日程没给; RL 系统的 MFU 与吞吐表也没有. Tab. 3 里部分闭源格为空, 无法全表对比. 这些空白意味着想复现旗舰线, 只能从 Distill-9B 的开源套件出发.

与前几代对照着读, 有几处容易混. V2.6-Flash 是 310B, 与 V2.5 同档, Flash 技术报告里的 MiMo-V2-Flash 是 309B, 层数和专家配置一样, 但预训练数据量 (48T 对 27T) 与多模态前端都不同, 不是同一个模型. V2.6-Pro 的 1.02T / 42B 与 V2.5-Pro 公开页一致, Tab. 3 里 V2.5-Pro 的 DeepSWE 只有 19.0, Terminal Bench 4.0 只有 1.5, 说明这些新基准对上一代几乎是空白区, V2.6 的涨幅有一部分是 「从不会到会」, 不宜直接当成同一能力曲线上的进步比例. Tab. 3 中 V2.5-Pro 的 OSWorld-Verified 与 Visual Coding 两格为空, 对比时也要跳过.
