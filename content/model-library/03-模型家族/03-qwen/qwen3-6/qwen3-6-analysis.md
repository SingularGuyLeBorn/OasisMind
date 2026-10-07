---
title: "Qwen3.6: 两个开源 SKU 把分数押在 agentic coding 上"
category: "模型库"
tags: ["Qwen", "技术解析"]
published: true
excerpt: "这一代没有技术报告, 能看到的只有两张成绩单和一段接入说明. 数据怎么配, 架构有没有改, RL 用了什么奖励, 博客都没提."
---
# Qwen3.6: 两个开源 SKU 把分数押在 agentic coding 上

> 公开材料是阿里云社区两篇发布博客 (2026-04-17 的 Qwen3.6-35B-A3B, 2026-04-24 的 Qwen3.6-27B), 内容是评测表, 评测脚注和 API 接入示例. 两篇都没有架构参数, 预训练数据, 训练日程和后训练配方.

来源: `qwen3-6.md` (两篇博客合并的 MinerU 转写). 表内数字以源文 qwen3-6.md 为准.

这一代没有技术报告, 能看到的只有两张成绩单和一段接入说明. 数据怎么配, 架构有没有改, RL 用了什么奖励, 博客都没提. 剩下能做的是把评测协议和分数放在一起读: 哪些格子涨得多, 哪些格子没动, 脚注里评测条件怎么设, 从这些里倒推这次迭代把力气花在哪里. 结论先放在这里: 两个 SKU 的涨幅几乎都集中在 coding agent 一组, 知识类格子基本不动, 视觉格子小涨或持平.

机制单独成篇. MoE: [01-DeepSeek-MoE](../../../../LargeLanguageModelGuide/2-核心原理与架构/2.6-MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md). Gated DeltaNet 与线性注意力: [01-Kimi-Delta-Attention-KDA](../../../../LargeLanguageModelGuide/2-核心原理与架构/2.5-线性注意力与状态空间模型/2.5.1-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md). Gated Attention: [06-Gated-Attention](../../../../LargeLanguageModelGuide/2-核心原理与架构/2.2-注意力机制/2.2.2-多头注意力变体/05-Gated-Attention-SDPA输出门控/05-Gated-Attention-SDPA输出门控.md). GRPO: [02-GRPO](../../../../LargeLanguageModelGuide/4-后训练/4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md). 同族底座可对照 [qwen3-5-analysis](../qwen3-5/qwen3-5-analysis.md).

## 1. 规格与 35B-A3B

### 1.1. 两个 SKU 和博客给出的全部结构信息

第一篇博客发布 **Qwen3.6-35B-A3B**, 自述是 MoE, 35B 总参, 约 3B 激活, 同时支持 thinking 与 non-thinking 两种模式, 原生多模态. 第二篇发布 **Qwen3.6-27B**, 稠密, 27B 参数, 同样把视觉和文本放在一个 checkpoint 里, 也有两种模式. 两篇都说自己是在闭源的 Qwen3.6-Plus 之后开源的, Plus 的成绩不在这两张表里.

关于结构, 博客给的就是上面这几个数. 层数, 注意力类型, 专家数, 上下文长度都没有写. Hugging Face 上 27B 的模型卡 (非本博客) 写的是 64 层, 布局为 16 × (3 层 **Gated DeltaNet** + 1 层 Gated Attention), 原生上下文 262,144, 和 Qwen3.5 的 3:1 混合是同一套骨架; 35B-A3B 的层表这一页没有. 所以说 Qwen3.6 是在 Qwen3.5 骨架上继续做后训练, 目前只能算推测, 博客没有给出架构变更的证据.

### 1.2. 35B-A3B 对前代: 29 行里 21 行上升

语言表 29 行, 分 Coding Agent 10 行, General Agent 7 行, Knowledge 4 行, STEM & Reasoning 8 行. 拿 Qwen3.6-35B-A3B 和前代 Qwen3.5-35B-A3B 比, 21 行上升, 1 行持平 (MMLU-Redux 93.3), 7 行下降 (按表计算). 涨得最多的是 SkillsBench, 从 4.4 到 28.7; 其次是 Terminal-Bench 2.0 从 40.5 到 51.5, MCPMark 从 27.0 到 37.0, NL2Repo 从 20.5 到 29.4, SWE-bench Multilingual 从 60.3 到 67.2. QwenWebBench 从 978 升到 1397, 这一行是 Elo, 差值不能和百分比放在一起比.

下降的 7 行是 Claw-Eval Pass^3 (51.0 到 50.0), TAU3-Bench (68.9 到 67.2), Tool Decathlon (28.7 到 26.9), MMLU-Pro (85.3 到 85.2), C-Eval (90.2 到 90.0), HLE (22.4 到 21.4), HMMT Nov 25 (89.2 到 89.1). 知识类几行的变化都在 0.2 以内, 基本就是没动. 真正值得看的是 TAU3 和 Tool Decathlon: 同属通用 agent 组, MCPMark 涨了 10 分, 这两项反而退了, 说明这一轮的 agent 训练偏向代码和终端环境, 客服式多轮对话和长工具链没有跟着涨 (推测).

### 1.3. 同一行里的对手: 3B 激活追稠密 27B

表里最有信息量的对照是 Qwen3.6-35B-A3B 对 Qwen3.5-27B. 前者每个 token 只激活约 3B 参数, 后者 27B 全部参与计算. 在 coding agent 组, 35B-A3B 在 Terminal-Bench (51.5 对 41.6), Claw-Eval Avg (68.7 对 64.3), Claw-Eval Pass^3 (50.0 对 46.2), SkillsBench (28.7 对 27.2), QwenClawBench (52.6 对 52.2), NL2Repo (29.4 对 27.3), QwenWebBench (1397 对 1068) 七行领先; SWE-bench 三行都落后, Verified 73.4 对 75.0, Multilingual 67.2 对 69.3, Pro 49.5 对 51.2.

知识和推理组情况反过来. MMLU-Pro 85.2 对 86.1, SuperGPQA 64.7 对 65.6, HLE 21.4 对 24.3, 只有 GPQA 86.0 对 85.5 和 AIME26 92.7 对 92.6 两格反超. 这和 MoE 的常见现象一致: **激活参数少, 需要大量存储的知识题吃亏**, 可以靠 RL 反复练的多步操作任务追得上. Gemma4-26B-A4B 在同一张表里的 SWE-bench Verified 只有 17.4, SkillsBench 12.3, 说明同体量 MoE 并不会自动得到 agent 能力, 差别出在后训练 (推测, 博客未写后训练).

### 1.4. 评测脚注里的协议差异

SWE-bench 系列用的是内部 agent 脚手架, 工具只有 bash 和文件编辑, temp=1.0, top_p=0.95, 上下文 200K. 脚注还写了一句: SWE-bench Pro 公开集里有问题的题目被修正过, 所有基线都在修正后的版本上重跑. 这意味着 Pro 这一行和别家报告里的 Pro 分数不能直接对比, 只能在这张表内部比. Terminal-Bench 2.0 走 Harbor/Terminus-2 harness, 每题限时 3h, 资源 32 CPU / 48 GB 内存, max_tokens=80K, 上下文 256K, 取 5 次平均.

其余几项也各有口径. SkillsBench 用 OpenCode 跑 78 题 (去掉依赖外部 API 的题), 5 次平均; NL2Repo 的其他模型通过 Claude Code 跑, max_turns=900; TAU3-Bench 的用户模拟器是 gpt-5.2 (low reasoning effort), 检索用默认 BM25; VITA-Bench 原定的裁判 claude-3.7-sonnet 下线了, 换成 claude-4-sonnet; MCPMark 用 GitHub MCP v0.30.3, Playwright 返回截断到 32K token; MCP-Atlas 用公开集, 裁判是 gemini-2.5-pro. AIME26 用的是完整的 2026 年 I 和 II 两场, 脚注说明分数可能和 Qwen3.5 那份材料不一致.

Claw-Eval 同时报了 Avg 和 Pass^3 两列. **pass^k** 这个指标由 τ-bench 引入, 意思是同一题独立跑 k 次, k 次都成功才算过, 衡量的是稳定性而不是上限. 35B-A3B 的 Avg 比前代高 3.3, Pass^3 反而低 1.0, 说明平均能力涨了, 每次跑结果的一致性没有同步提高. 27B 的 Pass^3 是 60.6, 比 35B-A3B 高 10.6, 两个 SKU 最大的差距就在这一格.

## 2. 27B

### 2.1. 27B 对 397B: 编码全赢, 知识全输

第二篇博客的核心卖点是 27B 稠密模型在所有主要编码基准上超过上一代旗舰 Qwen3.5-397B-A17B. 按表核对, coding agent 组 10 行里 27B 确实全部领先: SWE-bench Verified 77.2 对 76.2, Pro 53.5 对 50.9, Multilingual 71.3 对 69.3, Terminal-Bench 59.3 对 52.5, SkillsBench 48.2 对 30.0, QwenWebBench 1487 对 1186, NL2Repo 36.2 对 32.2, Claw-Eval Avg 72.4 对 70.7, Pass^3 60.6 对 48.1, QwenClawBench 53.4 对 51.8. 博客说 397B 是 27B 的 「15x total parameter」, 按 397/27 算是 14.7 倍, 取了整.

另一半博客没有强调. Knowledge 组 4 行 27B 全部落后: MMLU-Pro 86.2 对 87.8, MMLU-Redux 93.5 对 94.9, SuperGPQA 66.0 对 70.4, C-Eval 91.4 对 93.0. STEM 组 8 行里 27B 只赢 LiveCodeBench v6 (83.9 对 83.6) 和 AIME26 (94.1 对 93.3), HLE 24.0 对 28.7 差得最多. 参数总量决定了能存多少知识, 后训练决定了能把已有的东西用得多熟, 这张表把两件事分得很清楚.

对 Claude 4.5 Opus, 27B 在 Terminal-Bench 打平 (都是 59.3), SkillsBench (48.2 对 45.3), Claw-Eval Pass^3 (60.6 对 59.6), QwenClawBench (53.4 对 52.3) 三项领先, SWE-bench 三行分别差 3.7, 3.6, 6.2 分 (按表计算). 知识组四行全输, 推理组赢 GPQA Diamond (87.8 对 87.0) 和 HMMT Feb 25 (93.8 对 92.9). 对比的是闭源旗舰, 这样的差距在 27B 这个体量上已经很近.

### 2.2. 27B 对自己的前代: 语言大涨, 视觉持平

同尺寸比, Qwen3.6-27B 对 Qwen3.5-27B 语言表 22 行里 20 行上升, HMMT Feb 26 持平在 84.3, 只有 HLE 从 24.3 降到 24.0 (按表计算). 涨幅最大的三格都在 agent 组: SkillsBench 从 27.2 到 48.2 (+21.0), Terminal-Bench 从 41.6 到 59.3 (+17.7), Claw-Eval Pass^3 从 46.2 到 60.6 (+14.4). 知识组四行涨幅都不到 1 分, 和 35B-A3B 的形状一样.

视觉表则几乎没动. DynaMath 从 87.7 降到 85.6, MathVista 87.8 到 87.4, MMBench 92.6 到 92.3, CharXiv 79.5 到 78.4, 这四行都是下降; CountBench 97.8 和 OCRBench 89.4 持平; 上升的格子大多在 1 分以内, 只有 RefSpatialBench 从 67.7 到 70.0 和 AndroidWorld 从 64.2 到 70.3 涨得明显. 视觉 agent 的 AndroidWorld 和语言侧的 agent 格子一起涨, 静态视觉题不涨, 也说明这一轮的训练信号主要来自可以交互的环境 (推测).

## 3. 视觉表与跨文档口径

### 3.1. 35B-A3B 的视觉表: 和 Claude Sonnet 4.5 比

35B-A3B 的视觉表 22 行, 对前代 Qwen3.5-35B-A3B 18 行上升, 3 行持平, 1 行下降 (MVBench 74.8 到 74.6). 持平的三行都在视频组: VideoMME 带字幕 86.6, 不带字幕 82.5, LVBench 71.4, 前后两代一模一样. 涨得多的是 ODInW13, 从 42.6 到 50.8 (+8.2), VideoMMMU 从 80.4 到 83.7, RefCOCO 从 89.2 到 92.0. 检测和定位类任务涨幅明显, 其余多数在 1 分以内.

博客的说法是 「大多数视觉基准和 Claude Sonnet 4.5 相当, 若干项超过」. 按表核对, Claude Sonnet 4.5 有分数的 17 行里, Qwen3.6-35B-A3B 全部更高, 差距最大的是 RealWorldQA (85.3 对 70.3) 和 MLVU (86.2 对 72.8). 表比正文的说法更强, 以表为准. 空格 (--) 集中在空间智能和视频组, 脚注只说 「不可用或不适用」, 所以 Claude 在 RefCOCO, ODInW13 上的水平这一页没有.

还有两处小问题. MMMU-Pro 一行 Gemma4 两列带星号 (76.9*, 73.8*), 页面没有解释这个星号; 27B 那张表里 Gemma4-31B 同一格是 76.9, 不带星号. 27B 表中 Gemma4-31B 的 RefSpatialBench 只有 4.7, 和它其他空间题的分数差得很远, 可能是格式或协议没对上 (推测).

### 3.2. 两个 SKU 的分工和跨文档口径

把两个 SKU 放在一起看, 27B 在 23 行视觉题里赢 17 行, 输 5 行 (RealWorldQA, MMBench, SimpleVQA, CC-OCR, OCRBench), AndroidWorld 一行 35B-A3B 没有分数 (按表计算). 语言侧 27B 在 coding agent 组几乎每格都高, SkillsBench 差 19.5, Claw-Eval Pass^3 差 10.6, Terminal-Bench 差 7.8. 选型逻辑很直接: 要长链 agent 稳定性选 27B, 要单 token 计算便宜选 35B-A3B. 显存方面 BF16 权重大约是 27B 约 54GB, 35B-A3B 约 70GB (按每参数 2 字节估算), MoE 省的是计算, 显存并不省.

27B 表里的 397B 一列可以和 Qwen3.5 发布材料对照. MMMU 85.0, RealWorldQA 83.9, SimpleVQA 67.1, RefCOCO 92.3 都对得上. V* 一格写的是 95.8, 而 Qwen3.5 材料的脚注说明 95.8 是开启 Code Interpreter 的成绩, 不开时是 91.1. 27B 这张表没有标注这一格用了工具, 27B 自己的 94.7 用没用工具也没写, 所以 27B 在 V* 上低于 397B 这个结论要打个问号.

## 4. 接入与边界

### 4.1. 接入说明: preserve_thinking 与上下文配置

两篇博客都写支持 **preserve_thinking**: 把之前所有轮次的 thinking 内容保留在消息里, 并推荐 agent 任务打开. 模型卡 (非本博客) 补充说默认只保留最近一条用户消息对应的 thinking, 也就是常说的 **interleaved thinking**; Qwen3.6 额外训练过读取历史 thinking, 用途是减少多轮 agent 里重复推理, 也更好复用 KV cache. 社区 agent 框架 (如 Hermes Agent) 的 issue 里记录过客户端回放历史时把 reasoning 字段删掉, 导致这个开关形同虚设, 所以打开开关的同时要确认框架把历史 reasoning 原样发回去.

博客示例代码里 `"preserve_thinking": True` 一行是注释掉的, 照抄示例等于没开. OpenClaw 配置示例把 contextWindow 设为 131072, maxTokens 16384, 而 SWE-bench 评测用的是 200K 上下文, Terminal-Bench 用 256K. 按示例配置跑长仓库任务, 上下文只有评测条件的一半左右, 复现不出表里的分数是正常的. API 名分别是 `qwen3.6-flash` 和 `qwen3.6-27b`, 博客还给了接 Qwen Code, Claude Code 和 OpenClaw 的配置片段.

### 4.2. 边界与谱系位置

这一代能确认的只有: 两个开源尺寸, 一个 MoE 一个稠密, 原生多模态, thinking/non-thinking 双模式, preserve_thinking 开关. 预训练数据量和配比, 是否继续预训练, SFT 与 RL 的阶段安排, 奖励怎么设计, 这些面本页没有. QwenWebBench 和 QwenClawBench 都是内部基准, 前者是双语 7 类前端生成, 自动渲染后由多模态裁判打分再算 BT/Elo, 后者按真实用户分布构造, 博客说即将开源; 在它们公开之前, 这两行只能当作厂商自报.

在 Qwen 谱系里, Qwen3.6 相当于 Qwen3.5 骨架上的一次后训练迭代, 目标很集中: 让中小尺寸模型在终端, 仓库, 多技能组合这类可交互环境里做得更好. 表里的形状支持这个判断: agent 格子大涨, 知识格子不动, 静态视觉格子持平. 但骨架是否真的未变, 训练用了多少环境, 博客都没有给出, 要等技术报告或模型卡里的更多细节.
