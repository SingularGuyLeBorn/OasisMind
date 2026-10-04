---
title: "GLM-5.3: 基座不变, 后训练把长程编程推上去"
category: "模型库"
tags: ["GLM", "技术解析"]
published: true
excerpt: "GLM-5.3 和 GLM-5.2 用同一个基座, 提升全部来自后训练: 合成的长程任务环境更多, 强化学习沿用 SAO, slime 在训推一致性和吞吐上又升了一级. Terminal Bench 3.0 从 4.6 涨到 28.3, 漏洞利用类基准比 GLM-5.2 翻倍以上."
---
# GLM-5.3: 基座不变, 后训练把长程编程推上去

材料是 Z.ai 2026-08-14 的发布博客, 加上 HuggingFace 上 `zai-org/GLM-5.3` 的模型卡. 博客开头一句是 「Scaling post-training is all we did for GLM-5.3」: 预训练不动, 能动的只有后训练用什么数据, 什么环境, 什么算法, 多少算力, 问题是这几样在 GLM-5.2 搭好的栈上还能把长程编程推多远.

## 1. 基座与后训练栈

### 1.1. 和 GLM-5.2 同一个基座

博客原话是 「It uses the same base model as GLM-5.2 — every gain comes from post-training」. 基座相同, 结构和预训练权重就相同. GLM-5.2 的 `config.json` 给出的结构是: 78 层 (3 个稠密层加 75 个 MoE 层), 隐藏维 6144, 64 头 MLA, 潜在 KV 512 维加 64 维 RoPE 部分, 256 个路由专家加 1 个共享专家, 每 token 激活 8 个; 稀疏注意力是 DSA, 每个查询选 2048 个 token, indexer 按 IndexShare 每 4 层共用一个, 78 层里 21 层有自己的 indexer. 这些细节和来源见 [GLM-5.2 解读](../glm-5-2/glm-5-2-analysis.md). 这套维度又和 GLM-5 技术报告 (arXiv 2602.15763) 的表 10 一致.

参数量博客和模型卡正文都没写. 模型卡页面的 Safetensors 栏显示 753B, SAO 论文把 GLM-5.2 写作 750B-A40B, GLM-5 报告是 744B 总参数, 40B 激活. 预训练数据量也没写, 能确定的只是它和 GLM-5.2 相同. 窗口方面, NL2Repo, ALE, PostTrainBench, SWE-Marathon 的脚注都写 1M 上下文, 实际评测用到了 1M.

### 1.2. GLM-5.2 搭好的三件东西

博客把 GLM-5.2 时搭好的栈列为三项, 每项都挂了链接. 第一是 IndexShare (arXiv 2603.12201, 论文名 IndexCache): 相邻层的 top-k 下标高度重合, 所以只让少数层算 indexer, 其余层直接继承下标, 1M 处单 token FLOPs 降到约 1/2.9. 第二是 SAO (arXiv 2607.07508): 每个提示只采一条 rollout, 跑完立刻进训练, 用 critic 估 token 级优势, 用 rollout 引擎记下的对数概率做双侧屏蔽的重要性采样, GAE 跳过环境反馈 token. SAO 论文摘要明说它部署在 GLM-5.2 的智能体 RL 流水线里, GLM-5.2 博客里「从按组优化改成基于 critic 的 PPO」讲的就是它. 第三是 slime, 下面第 3 节单讲.

GLM-5.3 博客说沿用了 GLM-5.2 的 RL 策略, 「including SAO with compaction」, 理由是让收益在长程任务上也站得住, 不只体现在短任务上. compaction 是长程轨迹的压缩: 一条长轨迹被切成几段子轨迹, 每段都当作可训练样本. 按组比较奖励的算法在这种情况下没法对齐同一提示下的多条 rollout, SAO 不需要分组, 所以能直接接上. 两种算法的推导分别见 [PPO](../../../../llm-guide/4-后训练/4.4-强化学习基础/04-PPO/04-PPO.md) 和 [GRPO](../../../../llm-guide/4-后训练/4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md).

### 1.3. SAO 的几个关键部件

SAO 去掉分组以后, 优势全靠价值模型估计, 价值模型不准, 单条 rollout 的梯度方差就压不住. 论文为此做了三件事, 消融表 (Qwen3-30B-A3B, AIME2025 和 BeyondAIME) 逐项给了代价:

| 配置 | AIME2025 | BeyondAIME |
|---|---|---|
| SAO | 97.3 | 74.8 |
| 去掉 critic 加速更新 | 95.0 | 69.8 |
| 去掉 critic 冻结注意力 | 90.6 | 74.5 |
| 原版 VAPO (无 DIS) | 91.3 | 69.0 |
| 滑动均值基线代替 critic | 79.8 | 55.3 |

critic 加速更新是策略每更新 1 次, critic 更新 2 次; 论文用解释方差 $EV=1-\mathrm{Var}(R-V)/\mathrm{Var}(R)$ 衡量价值预测和真实回报的吻合程度, 约 400 步之后 SAO 的 EV 明显更高. 冻结注意力是训练 critic 时只调 MoE 投影, 注意力层不动, 全参数训练时 critic 的梯度范数大得多, 也更抖. 另外, 价值模型预训练的数据规模要做大, 论文说 critic 的冷启动是主要瓶颈. 滑动均值基线那一行最低, 说明单条 rollout 下, 不用一个学出来的 critic, 优势估计就太粗.

论文还做了一个在线学习的模拟: 写作任务的奖励偏好按阶段切换 (可爱, 中二, 古典三种文风), 每个提示只有一条轨迹的反馈. SAO 在每次切换后很快转向新风格, 滑动均值基线因为窗口里残留旧奖励, 恢复明显更慢. 对 GLM-5.3 来说, 环境和任务一直在加, 训练分布本身就在变, 这一点比静态基准上的几分更相关.

## 2. 环境合成: 后训练的难处挪到了环境

### 2.1. 任务长什么样

博客对任务的要求是 「less like coding exercises and more like real units of expert work」, 有的相当于资深工程师好几天的工作量. 举的例子是机器学习基础设施任务: 模型拿到和工程师一样的环境, 可以访问计算集群, 存储, 内部文档, 代码库和实验结果, 要诊断训练栈的瓶颈, 做优化, 跑实验, 最后交付端到端的加速, 同时保证结果正确. 这种任务没有标准答案, 也很难写一个固定的单元测试来判对错.

博客的判断是, 智能体能力上去以后, 后训练的难处从模型转到了环境. 环境要满足四个条件: 能执行, 能验证, 贴近真实工作, 而且数量要大. 靠人工一个个搭, 规模上不去. GLM-5.2 时已经有积累下来的长程任务环境, 这一版要把环境的生产本身自动化.

环境的规模和奖励的可靠性互相牵制. 环境越多越杂, 越难给每个任务手写验证逻辑; 验证器一旦有漏洞, RL 会把漏洞当成捷径放大, 模型学到的就是钻空子而不是做任务. SAO 用的又是二值结果奖励加 critic 估优势, 奖励错一次, 误差会经 critic 传到整条轨迹的每个 token 上. 所以流水线的重点放在验证器的合成和检查上, 环境本身反而交给研究型智能体批量生产.

### 2.2. 流水线与验证器

流水线分几步. 研究型智能体从真实工作里收集任务模式, 做成可运行的长程环境, 带多步依赖和隐藏状态. 评判智能体逐个去做这些任务, 确认它们确实可解. 验证器在看不到参考解的情况下合成, 避免验证器只认参考解那一种写法. 求解轨迹则拿来找奖励捷径, 找到就堵上. 部分任务连 RL 的奖励信号也是合成的.

验证器要过三道检查才能用: oracle, no-op, 未解状态. 博客没逐条解释, 按检查的名字, 可以读成三个方向: 正确的解应当判过 (oracle), 什么都不做应当判不过 (no-op), 环境初始的未解状态应当判不过. 三道都过, 验证器给出的二值奖励就 「reliable enough to train on directly」. 博客也承认这条流水线仍要大量人工参与, 让环境生成和验证更自主是下一步.

### 2.3. 和防作弊是同一个问题的两头

GLM-5.2 时的防作弊模块在每次工具调用上在线检查, 规则过滤加 LLM 判别, 发现作弊就拦下调用, 返回假信息, rollout 继续. 那是在 rollout 里堵. GLM-5.3 的流水线在验证器上线之前就用求解轨迹找奖励捷径, 是在环境里堵. 两者针对的都是 RL 里模型学会钻奖励空子. GLM-5.2 博客承认它比 GLM-5.1 表现出更多潜在的作弊行为, 能力越强, 这个问题越要从环境一侧处理.

评测里也能看到这条线. NL2Repo 的脚注写着用规则加 LLM 判别拦未经许可的 pip 或 curl; CyberGym 去掉了所有 Git 相关信息, 并设域名白名单, 只放行 pypi.org 和 deb.debian.org 这类装基础工具用的域名; SWE-Marathon 的 strip-clone 任务原来的反作弊检查对 import 检测过宽, 会误杀合法实现, 改成 LLM 检查. PostTrainBench 原本按模式匹配防第三方 API, 本地 vLLM 端点经 OpenAI SDK 访问时会误报, 也改成 LLM 智能体检查.

## 3. slime 的两条升级

### 3.1. 算法侧: 采样控制与训推一致

新加的能力有三类. 一是 top-p mask, 二是 top-k 和全词表两种 OPD, 三是提高训练和 rollout 一致性的配置, 包括 R3 式设置和两条路径的完全数值对齐. 博客说这些让采样, 训练和教师信号能更细地控制, 受控对比实验也跑得快.

这几项博客都没展开定义, 但都对应 RL 里已知的问题. rollout 用 top-p 采样时, 低概率 token 根本不会被采到, 训练端若在全词表上算对数概率, 两边的分布就不一样; top-p mask 处理的是这类差异, MiMo-V2.6 的做法是记下 top-p 的候选集, 训练端在同一候选集内重新归一化. R3 是小米 MiMo 团队提出的 Rollout Routing Replay (Ma 等, 2025): 记下推理引擎里每个 token 选中的专家, 训练时重放同一组专家, 解决 MoE 在两套引擎下因数值差异翻转少量专家选择的问题, 见 [MiMo-V2-Flash 解读](../../05-mimo/mimo-v2-flash/mimo-v2-flash-analysis.md). OPD 的 top-k 和全词表两种版本, 差别在学生对齐教师分布时只看教师概率最高的 $k$ 个 token, 还是整个词表; 多教师 OPD 的原理见 [MOPD](../../../../llm-guide/4-后训练/4.9-OPD/4.9.1-OPD方法与落地/09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md).

训推一致给出了数字. 在他们的一致性评估里, 训练路径和 rollout 路径对同一 token 算出的对数概率, 平均差异压到 1e-7 量级, 比之前的设置降低 99.99% 以上 (按这两个数反推, 之前在 1e-3 量级). 这个差异直接进入重要性采样比值. SAO 的比值是

$$
r_t(\theta)=\exp\left(\log\pi_\theta(a_t\mid s_t)-\log\pi_{\mathrm{rollout}}(a_t\mid s_t)\right)
\tag{1}
$$

当训练端参数还没更新时, $\pi_\theta$ 和 $\pi_{\mathrm{rollout}}$ 本应是同一个分布, $r_t$ 应等于 1. 对数概率差 $\Delta$ 会让 $r_t\approx 1+\Delta$. 单个 token 上 1e-3 的偏差远小于 SAO 的屏蔽区间, 不会触发屏蔽, 它的影响是给本应同策略的梯度带上系统偏差; 序列级的对数概率是逐 token 相加的, 长轨迹上偏差会累积. 差异压到 1e-7 后, 比值偏离 1 的部分基本只剩策略更新和异步延迟带来的那一块. 训推不一致的来源和其它处理办法见 [训练稳定性与训推不一致](../../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致/6.1.7-训练稳定性与训推不一致.md).

### 3.2. 系统侧: 一条数据流, 缓存, 多教师与调度

系统侧的出发点是 slime 本身. slime 是 THUDM 开源的后训练框架 (github.com/THUDM/slime), 训练侧用 Megatron, rollout 侧用 SGLang. 设计要点是训练, rollout 和数据缓冲区走同一条数据流, 数学, 代码, 沙箱, 验证器和长程智能体环境都以「数据生成」的形式接进来, 不改训练循环. 博客说, 这正是从 GLM-5.2 到 GLM-5.3 能一直加环境, 不用每次重搭训练栈的原因. GLM-5.2 博客里列过它的 rollout 组织方式 (白盒, 黑盒, 压缩轨迹, 子智能体工作流), 以及用它做并行 OPD, 两天合并十多个专家模型.

在这条数据流上, 系统方面新加了四项. 本地存储当额外一层缓存, 分层存放原本要占主机内存的模型状态和数据. 这一项主要服务多教师 OPD: 训练侧能动态切换教师并预取, 同时用上几个教师, 不必给每个教师常驻一套推理服务, 开销有限, 资源消耗低得多. 对智能体和异步负载, router 和 slime 联合调度并做负载均衡, 让长度和完成时间相差很大的 rollout 请求更好地利用推理资源. 最后是按负载自动配置: 根据每个 rollout 环境的特点, 推出 prefill/decode 资源配比, 并发设置等影响吞吐的参数.

合起来的结果是长程编程 RL 任务的端到端训练吞吐提高 2.3 倍以上. 基线是哪一版没说, 也没给绝对吞吐. 联合调度这一项和 SAO 的单条 rollout 是配套的: SAO 每条轨迹跑完就进训练, 轨迹长短差得越多, 推理侧越需要按请求而不是按批次调度. GLM-5 报告里的 DP 感知路由用一致性哈希把同一 rollout 的请求固定到同一 DP rank 复用前缀 KV, 是同一方向更早的一步.

RL 训练的端到端时间主要花在 rollout 上, Bebop 论文 (arXiv 2606.12370) 的引言也是这个判断, 异步框架只能缓解长尾, 改变不了 rollout 是瓶颈. 所以 GLM 这条线上加速 rollout 的手段是叠在一起用的: IndexShare 降低长上下文每个 token 的计算, MTP 的投机解码 (GLM-5.2 改成拒绝采样加 TV 损失) 提高每次前向落地的 token 数, slime 的调度和 P/D 配比让推理资源少空转. 2.3 倍是系统层这一项单独的数, 前两项的收益不在里面.

## 4. 评测: 编程, 智能体与网络安全

### 4.1. 主表

模型卡的完整表有 16 行 (编程 8 行, 网络安全 3 行, 智能体 5 行) 和 8 个模型列. 下面挑与长程编程和智能体相关的几行:

| 基准 | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Opus 4.8 | Fable 5 (w/ fallback) | GPT-5.6 Sol |
|---|---|---|---|---|---|---|---|
| Terminal Bench 2.1 | 88.2 | 81.0 | 88.3 | 87.9 | 85.0 | 88.0 | 88.8 |
| Terminal Bench 3.0 | 28.3 | 4.6 | 17.4 | - | 21.1 | 33.7 | 34.6 |
| DeepSWE (v1.1) | 66.9 | 46.2 | 67.5 | 62.7 | 58.0 | 69.7 | 72.7 |
| SWE-Marathon (v1.1) | 42.5 | 19.4 | 48.1 | - | 48.8 | 33.1 | 42.5 |
| Toolathlon Verified | 73.0 | 59.9 | 76.5 | 74.1 | 76.2 | 74.7 | 74.9 |
| AutomationBench (v1.0.6) | 48.2 | 26.2 | 46.7 | 43.2 | 41.0 | 46.2 | 45.8 |
| Agents' Last Exam (CLI) | 28.5 | 23.8 | 27.6 | 25.7 | 25.7 | 23.8 | 28.6 |
| HLE w/ Tools | 62.5 | 54.7 | 59.8 | 60.0 | 57.9 | 63.9 | 64.5 |

16 行里 GLM-5.3 全部高于 GLM-5.2, 涨幅最大的是最长程的几项: Terminal Bench 3.0 高 23.7, SWE-Marathon 高 23.1, AutomationBench 高 22.0, DeepSWE 高 20.7. 和 Kimi K3, DeepSeek-V4 Pro-0813, Qwen3.8-Max 三列比, Kimi K3 在 Terminal Bench 2.1, DeepSWE, SWE-Marathon, Toolathlon 四行更高, NL2Repo 上 DeepSeek-V4 Pro-0813 是 61.1 对 58.0; 博客点名 「open-source SOTA」 的 Terminal Bench 3.0 和 Agents' Last Exam 两行, GLM-5.3 确实领先这三列.

Terminal Bench 3.0 的设置值得单看, 它是最能体现「长程」的一项: Claude Code 2.1.207 框架, max 档, 400K 上下文, 128K 最大输出, 每题跑 3 次取平均, 每次最多 600 轮, 10 小时超时, 由各任务官方的独立验证器给分. GLM-5.2 在这里只有 4.6, GLM-5.3 是 28.3, 已经超过 Opus 4.8 的 21.1, 但离 GPT-5.6 Sol 的 34.6 和 Fable 5 的 33.7 还差五六分. Agents' Last Exam 是 105 个任务, 默认 4 小时超时, 部分任务最长 8 小时.

表里没放的几行也有信息. FrontierSWE 由第三方 Proximal 在 1M 上下文下评, GLM-5.3 78.1, Opus 4.8 66.5, Fable 5 88.2. PostTrainBench 是让智能体用一块 H100 对小模型做后训练, 按提升幅度计分, GLM-5.3 39.8, 高于 Opus 4.8 的 32.9 和 GPT-5.6 Sol 的 36.2; 跑不出分的运行按官方零样本基座分兜底, 报 3 次加权平均. ProgramBench 换成 「Almost Solved」 指标后, GLM-5.3 19.0, Fable 5 33.0. GDPval-AA v2 由 Artificial Analysis 评, GLM-5.3 1769, 全表最高. Toolathlon Verified 走官方评测服务, 报 3 次独立运行的 pass@1 平均. 和闭源列比, 差距最大的是 Terminal Bench 3.0, ProgramBench, FrontierSWE 这几项长程编程任务, Fable 5 仍领先 5 到 14 分; GDPval 和 ALE 这类偏办公和通用智能体的任务, GLM-5.3 已经和闭源列持平或略高.

### 4.2. GLM-5.2 一列的口径

读涨幅时要注意 GLM-5.2 这一列的来源. 拿 GLM-5.2 博客对照, 有四格数字完全相同, 评测设置却变了. Terminal Bench 2.1 的 81.0 在 GLM-5.2 博客里是 Terminus-2 框架的分, 这里脚注写在 Claude Code 2.1.207 里评; DeepSWE 的 46.2 当时是 2 小时超时, temperature 1.0, 这里是 6 小时, 0.95, 行名多了 v1.1; NL2Repo 的 48.9 当时是 400K 上下文, 这里是 1M; HLE w/ Tools 的 54.7 当时不用上下文管理, 评审是 GPT-5.5, 这里用上下文管理, 评审换成 GPT-5.6-luna. 博客没说这四格是不是按新设置重跑过. 如果没有重跑, 像 DeepSWE 的 20.7 分涨幅里, 就混着后训练的收益和超时从 2 小时放宽到 6 小时的收益.

另有四格和 GLM-5.2 博客不同, 原因能从脚注找到. ProgramBench 从 63.7 变成 9.5, 行名多了 「Almost Solved」, 换了指标. FrontierSWE 从 74.4 变成 67.5, 它报的是 Dominance 分, 一个截至 2026/06/16, 一个截至 2026/08/14, 参评模型变了, 同一个模型的相对分也跟着变. PostTrainBench 从 34.3 变成 31.7, SWE-Marathon 从 13.0 变成 19.4, 这两项 GLM-5.2 博客由第三方评测, 这次的脚注写的是 Z.ai 自己用 Claude Code 2.1.207 评 GLM-5.3, 并改了反作弊检查; GLM-5.2 的新数是谁按什么设置跑的, 脚注没写.

### 4.3. Z.ai Code Bench 与档位

Z.ai Code Bench 是内部私有基准, v1.0, 在 Claude Code 2.1.207 上评. 它把智能体放进复杂的本地开发环境, 从端到端完成率和细粒度检查清单准确率两个维度打分; 私有的好处是降低公开测试集的污染风险, 代价是外部无法复现. 图的纵轴只写 Accuracy (%), 没说是两个维度里的哪一个.

图上正文给了五个点: GLM-5.3 Max 34.5%, 平均输出约 75K; GLM-5.2 Max 23.4%, 96K; GLM-5.3 High 31.4%, 约 50K; Claude Opus 4.8 Max 29.5%, 120K; Claude Fable 5 Max 39.5%. Max 档按比例算是 $34.5/23.4\approx1.47$, 博客写作 「50% improvement」. 同为 Max 档, GLM-5.3 的分更高, 输出却从 96K 降到约 75K, 后训练同时提高了成功率和 token 效率. GLM-5.3 的 High 档以约 50K 输出拿到 31.4%, 超过 Opus 4.8 Max 档的 29.5%, 后者用了 120K. 这张图里没有其它开放权重模型, 「编程最强的开放权重模型」 这句话在图上没有直接对照.

档位对读公开基准也有影响. 脚注里写了档位的公开基准, 一律是 max, 而 API 不传参数时默认也是 max. Max 档的输出量明显更大: Code Bench 上 GLM-5.3 Max 比 High 多花约 25K 输出, 换 3.1 分. 用户按默认设置调用, 拿到的是评测同款档位, token 消耗也是评测同款; 想省 token 要显式传 high 或 low.

### 4.4. 网络安全基准

博客把网络安全能力叫作 「emergent」. 后训练的数据里加了漏洞发现类的数据和环境, 原本预期的是模型更会找漏洞; 意外的是训练做大以后, 能力涨得比预期快, 模型不只是能认出孤立的缺陷, 还开始跨多个利用阶段推理, 给出完整利用链的计划. 具体用了哪些数据, 环境有多少, 博客没写. 三个基准按漏洞分析和利用的不同阶段排: CyberGym 从白盒源码出发, 看模型能否通过触发故障来识别并验证漏洞; ExploitBench 要求对真实漏洞及其利用做更深的推理; ExploitGym 数的是按时间折算的预算内能完成多少个利用任务.

| 基准 | GLM-5.3 | GLM-5.2 | Kimi K3 | Opus 4.8 | Fable 5 (w/ fallback) | GPT-5.6 Sol |
|---|---|---|---|---|---|---|
| CyberGym | 84.5 | 77.2 | 80.0 | 78.1 | 83.8 | 83.6 |
| ExploitBench | 54.4 | 24.4 | 32.2 | 40.0 | 78.0 | 76.5 |
| ExploitGym (2h / 6h) | 105 / 130 | 29 / 39 | 36 / 70 | 80 / 120 | 181 / 247 | 216 / 293 |

CyberGym 只高 7.3 分, 但已是全表最高; 越往利用链后段走, 相对 GLM-5.2 的倍数越大 (ExploitBench 约 2.2 倍, ExploitGym 2 小时约 3.6 倍), 离闭源两列的差距也越大. 博客自己的总结也是这个形态, 原话是 「Capability is growing fastest exactly where we are furthest behind」.

评分口径来自脚注. CyberGym 是 1,507 个任务的单次 Pass@1, 不限时, 智能体放在任务容器里. ExploitGym 是 869 个任务的单次 Pass@1, 预算按 API 推理时间乘以各模型的 TPS 折算, 再加非 API 开销, TPS 取自 Artificial Analysis: GLM-5.3 115, Kimi K3 40, Qwen3.8 Max 47. 脚注只写了这三个模型是 Z.ai 自己评的, 其余各列的来源和折算方式没写, 不同来源的格子能否直接比要打个问号. ExploitBench 是 41 个任务在 3 个 revision 上的平均覆盖分, 交互上限 300 轮, 每个任务的覆盖结果取三个 revision 上达成能力的并集. 三项 GLM-5.3 都在 Claude Code 2.1.207 里跑, max 档, 不给联网工具, temperature 1.0, 最大输出 128,000 token. 和编程表一样, 能横向比的只有同一套设置下跑出来的几列; 闭源两列的分数从哪来, 脚注没写. 博客另有一节真实代码库上的测试和公开披露台账 (cvd.z.ai), 属于案例, 不在基准表里.

## 5. 接入与结论

### 5.1. API, 套餐与权重

API 有 low, high, max 三档 `reasoning_effort`, 不传或传其它值都按 max, 复现基准要保持默认 max, 博客也推荐编程任务用 max. 思考不能再关: `thinking.type` 只支持 enabled, 原来用 disabled 的应用要改成 enabled 并把档位设成 low, 否则请求失败. 聊天模板里 `clear_thinking` 默认 false, 普通聊天场景模型卡建议显式传 true.

GLM Coding Plan 改成积分制: 输入, 缓存输入, 输出 token 分开计; 高峰是周一到周五 14:00 到 18:00 (UTC+8), 其余时间按标准积分的 50% 计. GLM-5.2 时的规则是高峰 3 倍, 非高峰 2 倍, 两代计量方式不同, 用量没法直接换算. 博客另推自家的 ZCode: 缓存命中率 98% 以上, 重复上下文按缓存价计费, 有效 token 多出约 30%; 到 8 月 31 日有 1.5 倍限时额度, 和缓存节省叠加最多到标准额度的 180%; 另有规划, 编码, 测试, 验证一路做到目标达成的 Goal 模式, 以及经微信或飞书在手机上监控长任务的远程控制. 发布当天权重尚未放出, 博客说两周后完成安全评估和加固再放; 模型卡现已上线, 支持 SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth, 昇腾平台上支持 vLLM-Ascend, xLLM 和 SGLang.

### 5.2. 结论与边界

GLM-5.3 是「基座不动, 只加后训练」的一次完整实验. 结构, 窗口, 推理成本都和 GLM-5.2 相同, 分数的变化来自三处: 合成的长程环境和验证器让可训练的任务变多, SAO 让长轨迹能逐条训练, slime 的数值对齐和调度让训练更稳更快. 涨幅集中在最长程的基准上 (Terminal Bench 3.0, SWE-Marathon, AutomationBench), 网络安全能力随之大涨, 这和后训练的投入方向一致.

边界有三条. 第一, 博客没有消融, 环境, 算法和算力三者各贡献多少分无从拆分. 第二, GLM-5.2 一列有四格可能沿用旧设置的分数, 涨幅要按行看口径. 第三, Z.ai Code Bench 是私有基准, 网络安全三项里只有三个模型是 Z.ai 自己按统一设置跑的.

## 参考文献

1. Z.ai. 「GLM-5.3」 发布博客. Z.ai 官网, 2026-08-14. 中英对照见 [glm-5-3-bi](./glm-5-3-bi.md).
2. Z.ai. `zai-org/GLM-5.3` 模型卡. HuggingFace, https://huggingface.co/zai-org/GLM-5.3.
3. Zhenyu Hou, Yujiang Li, Jie Tang, Yuxiao Dong. 「Single-Rollout Asynchronous Optimization for Agentic Reinforcement Learning」. arXiv:2607.07508, 2026.
4. Yushi Bai, Qian Dong, Ting Jiang, et al. 「IndexCache: Accelerating Sparse Attention via Cross-Layer Index Reuse」. arXiv:2603.12201, 2026.
5. Aohan Zeng, Xin Lv, et al. 「GLM-5: from Vibe Coding to Agentic Engineering」. arXiv:2602.15763, 2026.
6. THUDM. slime: an LLM post-training framework for RL Scaling. https://github.com/THUDM/slime.
7. Bangjun Xiao, et al. 「MiMo-V2-Flash Technical Report」. arXiv:2601.02780, 2026.
