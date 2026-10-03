> 源文 `glm-5-2.md` 是 Z.ai 博客的 MinerU 抓取, 13 页, 18 张图. 正文讲 1M 上下文, 长程编程评测, IndexShare 和 MTP 的改动, 推理服务, 后训练和防作弊, 再加一张 19 行的基准表和评测脚注; 没有参数量, 层数和训练数据.

# GLM-5.2 博客: 1M 窗口, 长程编程和一张截断的表

来源: 同目录 `glm-5-2.md` (MinerU 抓取), 对照同目录 `glm-5-2.pdf` (13 页, PDF 生成时间 2026-09-25). 逐段英中对照和 12 处疑点见 `glm-5-2-bi.md`. 下文的数都出自博客正文, 图和表; 引到同家族 `glm-5-1` 目录那张模型卡的地方, 一律写 「GLM-5.1 卡」, 只作核对.

## 1. 材料性质: 一篇研究博客, 不是技术报告

这是 Z.ai 官网的一篇博客, 栏目 Research, 日期 2026-06-16, 标题 「GLM-5.2: Built for Long-Horizon Tasks」. 13 页的分布是: 第 1 页标题, 五个外链和四条新能力; 第 2 页三个长程基准和一张条形图; 第 3 页八张常规评测柱状图和档位控制的说明; 第 4 页档位折线图, 以及 「Architecture for 1M Context」 下面的结构图, FLOPs 曲线和接受长度柱状图; 第 5, 6 页讲 IndexShare 和 MTP; 第 6, 7 页讲 1M 上下文的推理服务, 配一张吞吐图; 第 7 到 9 页讲 slime, 长程强化学习和防作弊; 第 9, 10 页是完整基准表; 第 10, 11 页是使用和本地部署; 第 11, 12 页是评测脚注; 第 13 页只剩版权行.

它不是技术报告. 全篇没有总参数量, 激活参数量, 层数, 训练数据量和训练算力; 讲结构的部分只讲相对 GLM-5.1 改了什么 (IndexShare, MTP 的几项改进), 没有给出完整的模型结构. 第 1 页的 GitHub 链接指向 `zai-org/GLM-5` 仓库, 权重在 HuggingFace 的 `zai-org/GLM-5.2` 和 ModelScope 的 `ZhipuAI/GLM-5.2`. 许可证只有第 1 页一句 「An MIT open-source license」, 页面没有许可证全文. 所以下文只写能指回原句, 图中数字或表格的内容, 图里没画的结构一律不补, 其它代模型的参数也不挪过来.

## 2. 1M 是窗口长度, 从 200K 改成 1M

第 1 页的核心说法是 GLM-5.2 「for the first time, delivers that capability on a solid 1M-token context」. 这里的 1M 是上下文窗口的长度, 也就是模型一次能接收的最大 token 数. 变化前后的值印在第 6 页: 「extends the maximum context length from 200K to 1M tokens」. 第 7 页吞吐图也对得上: GLM-5.1 的最长上下文标为 「200k*」, 256k 以后的三格都写 OOC (out of context). 第 10 页给了用法: 编程套餐用户在 Claude Code 里把模型名写成 GLM-5.2[1m] 才开启 1M 上下文长度. 所以和 GLM-5.1 相比, 窗口上限从 200K 改成了 1M.

1M 这个写法只出现在正文里, 图里用的是另一套刻度. FLOPs 曲线的横轴是 「Token Position (K)」, 最右一格是 1024; 吞吐图横轴最右一格是 1024k. 正文 「reducing per-token FLOPs by 2.9× at a 1M context length」 对应的就是 FLOPs 曲线 1024 那个点. 1M 和 1024k 是否指同一个长度, 页面没说; 引用时正文照写 1M, 图照写 1024k.

训练侧能读到的只有两句. 一句在第 5 页: GLM-5.2 「is trained with IndexShare from mid-training with 128K sequence length」, 即 IndexShare 从中期训练开始用, 那时序列长 128K. 另一句在第 1 页: 「we substantially expanded 1M-context training for coding-agent scenarios」, 覆盖大规模实现, 自动化研究, 性能优化和复杂调试四类场景. 1M 长度的训练在哪个阶段做, 用了多少数据, 页面没有数字. 「solid」 也没有量化标准, 全篇没有一项专门考长上下文检索或理解的分数.

评测侧, 写明 1M 的只有三项: FrontierSWE, PostTrainBench, SWE-Marathon, 由第三方 Proximal, PostTrainBench, Abundant AI 执行, 设置都是 「1M context length, max effort level, and 128K maximum output tokens」. 其余各项的窗口都不到 1M: SWE-Bench Pro, NL2Repo, DeepSWE, ProgramBench 是 400K, Terminal-Bench 2.1 (Terminus 2) 是 256K, HLE 带工具是 300,000 token; 另有三项没写窗口. 这三项长程基准的 1M 是 「允许用到 1M」 的设置, 页面没报告任务实际用到多长. 还有一处没交代: 这三行 GLM-5.1 也有分 (30.5, 20.1, 1.0), 可 GLM-5.1 的上限是 200K, 脚注没写它在什么长度下测.

## 3. 和 GLM-5.1 比: 正文印的是哪两行

正文直接拿 GLM-5.1 对比的数只有两组, 在第 2 页末到第 3 页初: 「81.0 vs. 63.5 on Terminal-Bench 2.1 and 62.1 vs. 58.4 on SWE-bench Pro」. 第 10 页大表里 Terminal Bench 2.1 有两行, 81.0 对 63.5 是 Terminus-2 那一行, 差 17.5; 另一行 「Best Reported Harness」 是 82.7 (Claude Code) 对 69 (Claude Code), 差 13.7, 正文没用这一行. 第 3 页柱状图的副标题写的也是 「Terminal-Bench 2.1 (Terminus)」, 柱上印 81.0 和 63.5, 三处口径一致. SWE-bench Pro 表里只有一行, 62.1 对 58.4, 差 3.7.

其它和 GLM-5.1 比的说法都没有配数. 第 1 页 「a substantial leap in long-horizon task capability over its predecessor GLM-5.1」 要靠第 10 页大表去对; 第 3 页 「substantially stronger agentic coding performance than GLM-5.1 at comparable token budgets」 只能从折线图目测; 第 5 页 「outperforming GLM-5.1 on long-context benchmarks with less computation」 没有基准名也没有分数; 第 8 页 「GLM-5.2 shows more potential hacking behavior than GLM-5.1」 没有比例或次数. 这四句只能当宣称引用.

把大表 19 行逐行比, GLM-5.2 全部高于 GLM-5.1. 差距最大的几行都在长程和编程组: FrontierSWE 74.4 对 30.5, 高 43.9; DeepSWE 46.2 对 18.0, 高 28.2; Terminal Bench 2.1 (Terminus-2) 高 17.5; CritPt 20.9 对 4.6, 高 16.3; PostTrainBench 34.3 对 20.1, 高 14.2; Terminal Bench 2.1 最好框架一行高 13.7; ProgramBench 63.7 对 50.9, 高 12.8; SWE-Marathon 13.0 对 1.0, 高 12.0. 差距最小的是 HMMT Nov. 2025, 94.4 对 94.0, 只高 0.4; 其次是 HLE 带工具高 2.4, SWE-bench Pro 高 3.7, AIME 2026 高 3.9. 其余几行: HLE 高 9.5, HMMT Feb. 2026 高 9.9, IMOAnswerBench 高 7.2, GPQA-Diamond 高 5.0, NL2Repo 高 6.2, MCP-Atlas 高 5.0, Tool-Decathlon 高 7.5.

GLM-5.1 这一列还可以和 GLM-5.1 卡对一下. 两边都有的 13 行, 数字全部相同, 包括 HLE 31.0, GPQA-Diamond 86.2, SWE-bench Pro 58.4, NL2Repo 42.7, MCP-Atlas 71.8, Tool-Decathlon 40.7. 不同的只有名字: GLM-5.1 卡上是 Terminal-Bench 2.0 (Terminus-2 63.5, 自报 69.0), 这里是 Terminal Bench 2.1 (63.5 和 69). 版本号变了, 分数一分不差, 是重测恰好相同还是沿用旧数, 本页没说. CritPt, DeepSWE, ProgramBench 和三项长程基准, GLM-5.1 卡上没有, 在这张表里第一次出现.

## 4. 三个长程基准: 百分点和 「最高开源」

第 2 页的条形图分三组. FrontierSWE (副标题 「Dominance」, 「Max 20 Hrs」): Opus 4.8 75.1%, GLM-5.2 74.4%, GPT-5.5 72.6%, Opus 4.7 63.0%, Gemini 3.1 Pro 39.6%. PostTrainBench (「Max 10 Hrs」): Opus 4.8 37.2%, GLM-5.2 34.3%, Opus 4.7 28.6%, GPT-5.5 25.0%, Gemini 3.1 Pro 21.6%. SWE-Marathon (「Max 10 Hrs」): Opus 4.8 26.0%, Opus 4.7 16.0%, GLM-5.2 13.0%, GPT-5.5 12.0%, 最后一条 4.0% 没印名字, 图标和 Gemini 3.1 Pro 相同. GLM-5.2 在三组里分别排第 2, 第 2, 第 3.

正文的百分比是按图相减的百分点, 不是相对比例, 而且取整不统一. FrontierSWE 上 「trails Opus 4.8 by only 1%」 实际差 0.7 个点, 「edging out GPT-5.5 by 1%」 实际差 1.8 个点, 「Opus 4.7 by 11%」 实际差 11.4 个点. SWE-Marathon 上 「trailing Opus 4.8 by 13%」 是 26.0 减 13.0; 换成相对比例, GLM-5.2 只有 Opus 4.8 的一半. 引用时最好直接写两边的分数, 不转述成百分比差.

「Across all three benchmarks, GLM-5.2 is the highest-ranked open-source model」 在这张图上无从核对: 图里另外四个模型, 本页没有把哪一个称为开源. 第 10 页大表的三行里, 只有 FrontierSWE 有另一个开源列的数, DeepSeek-V4-Pro 29.0; PostTrainBench 和 SWE-Marathon 除两列 GLM 外都是 「-」. GLM-5.1 也不在条形图里. 所以这句话在本页上的证据, 只有 FrontierSWE 一行 74.4 对 29.0.

## 5. 八项常规评测, 以及档位控制

第 3 页八张柱状图, 每张五根柱: GLM-5.2, GLM-5.1, Claude Opus 4.8, GPT-5.5, Gemini 3.1 Pro. 两列 GLM 的数和大表对照, 七张完全一致, 一张不一致: MCP-Atlas 图上 GLM-5.2 印 77.0, 大表 「MCP-Atlas / Public Set」 印 76.8, 差 0.2, GLM-5.1 两处都是 71.8. 页面没说哪个是准的. Claude Opus 4.8, GPT-5.5, Gemini 3.1 Pro 的数只在图上, 大表最右一列 「Cla」 被截断, 表里没有 GPT-5.5 和 Gemini 3.1 Pro, 这些数核对不了. 图的副标题说所有模型都在最高思考档位下评测, 脚注里八项中只有 ProgramBench 写了 reasoning_effort=max.

和图上三个模型比, 情况各不相同. Claude Opus 4.8 在八张图里全部高于 GLM-5.2, 差距从 MCP-Atlas 的 0.8 (77.8 对 77.0) 到 NL2Repo 的 20.8 (69.7 对 48.9). GPT-5.5 在 SWE-bench Pro (58.6), MCP-Atlas (75.3), HLE 带工具 (52.2) 三处低于 GLM-5.2, 在 Terminal-Bench 2.1 (84.0), NL2Repo (50.7), DeepSWE (70.0), ProgramBench (70.8), Tool-Decathlon (55.6), HLE 不带工具 (41.4) 六处高于 GLM-5.2. Gemini 3.1 Pro 只在 Tool-Decathlon (48.8 对 48.2) 和 HLE 不带工具 (45.0 对 40.5) 两处高于 GLM-5.2. 正文 「within a few points of Claude Opus 4.8 (85.0)」 说的是 Terminal-Bench 2.1, 差 4.0; 同一张图里 GPT-5.5 的 84.0 也在 GLM-5.2 前面, 正文没提.

「strongest open-source model」 这句要看大表. 大表可见的开源对手是 Qwen3.7-Max, MiniMax M3, DeepSeek-V4-Pro 三列. CODING 组九行里, GLM-5.2 在每一行都是可见列最高; 放到全表, 有五行不是: HLE (Qwen3.7-Max 41.4 对 40.5), HMMT Nov. 2025 (Qwen3.7-Max 95.0 对 94.4), HMMT Feb. 2026 (Qwen3.7-Max 97.1, DeepSeek-V4-Pro 95.2, GLM-5.2 92.5), GPQA-Diamond (MiniMax M3 93.0 对 91.2), Tool-Decathlon (DeepSeek-V4-Pro 52.8 对 48.2). 正文限定的是 「standard coding benchmarks」, 在可见列内成立; 被截掉的列里有什么, 看不到. PDF 里 GLM-5.2 整列是浅蓝底蓝色粗体, 那是列的样式, 不表示每格最高; 全表另外只有 HMMT Feb. 2026 的 97.1 是黑色粗体.

第 4 页的档位折线图, 横轴是每个任务的平均输出 token 数, 纵轴是 Terminal-Bench 2.1, DeepSWE, SWE-Atlas QnA 三项的平均分, 在 Claude Code 2.1.167 上测. 点旁不印数值, 目测: GLM-5.2 Non-Thinking 约 35k, 63 分, High 约 44k, 72 分, Max 约 84k, 74 到 75 分; GLM-5.1 Non-Thinking 约 32k, 53 分, Max 约 45k, 57 到 58 分; Claude Opus 4.8 High 约 40k, 78 分, Max 约 88k, 78 分; Claude Opus 4.7 Max 约 49k, 71 分. 在 44k 到 45k 附近, GLM-5.2 的 High 比 GLM-5.1 的 Max 高十几分, 这就是 「comparable token budgets」 在图上的位置; 「between Claude Opus 4.7 and Claude Opus 4.8」 在 40k 到 50k 这一段成立. GLM-5.2 从 High 到 Max, 输出接近翻倍, 分数只多两三分.

这张图有两处不能直接用. 纵轴里的 SWE-Atlas QnA 不在大表里, 本页没有它的单项分, 所以折线图的分和大表任何一行都对不上. 档位名也不统一: GLM 两条线最低一档叫 Non-Thinking, Claude 两条线叫 Low, 第 10 页告诉订阅用户的可选档位只有 High 和 Max.

## 6. 结构改动: IndexShare 和 MTP, 只写图文印了的

IndexShare 在第 1 页的说法是 「reuses the same indexer across every four sparse attention layers」, 第 5 页展开为: 每 4 个 transformer 层共用一个轻量 indexer, indexer 放在第一层, 它算出的 topk 索引给这 4 层共用, 于是 4 层里有 3 层省掉 indexer 的点积和 topk 运算. 方法链到 arXiv 2603.12201. 第 4 页结构图 「Architecture Changes in GLM-5.2」 的左半画的就是这个: Main Model 里一组四个 DSA Block, 最下面一个 「w/ Indexer」, 上面三个 「w/o Indexer」, 旁边写 「Reuse top-k indices」, 整组标 「x L」. L 是多少, 图和正文都没写.

FLOPs 曲线 「Single-Token FLOPs (T)」 画的是单个 token 的计算量随位置的变化. 32K 处两条线都在 0.1 左右; 到 1024 处, GLM-5.1 目测约 0.67, GLM-5.2 约 0.22, 旁注 「2.9x lower」, 目测比值和标注在读图误差内. 纵轴单位 「T」 没有解释. 这条曲线上 GLM-5.1 一直画到 1024, 而它的窗口上限是 200K, 页面没说 200K 以后那一段是怎么得出的. 第 6 页还补了一句限制: 新结构降低了每个 token 的计算 FLOPs, 却 「does not proportionally reduce per-token KV-cache size」.

MTP 部分有两个目标: 让作为草稿模型的 MTP 层开销小, 让投机解码的接受率高. 做法是在 MTP 层上也用 IndexShare: indexer 放在第一步, topk 索引给后面各步共用. 第 5 页的两步示意图说明了第二个目标怎么实现: 不共用时, 第二步里 $h_5$ 的 KV cache 混有目标模型算出的 $kv_{1:4}$ 和 MTP 层算出的 $kv_5$; 共用索引后, $h_5$ 只注意到 $h_1$ 到 $h_4$, KV cache 只含来自目标模型的 $kv_{1:4}$, 正文称这消除了 GLM-5.1 MTP 层里训练和推理不一致的问题. 训练时复用第一步的 kv cache 和 topk 索引; 不同 MTP 步的参数和 GLM-5.1 一样共享. 另外引入了拒绝采样 (受 arXiv 2606.12370 启发) 和端到端 TV 损失.

接受长度的消融有一个前提要记住: 「In the experiment we use the backbone and training data of GLM-5.1」, MTP 步数训练和推理都设为 7, 场景是编程. 四个数是 Baseline 4.56, 加 IndexShare 和 KV Share 5.10, 加拒绝采样 5.29, 加端到端 TV 损失 5.47, 5.47 / 4.56 约为 1.20, 印 +20%; 三步各加 0.54, 0.19, 0.18. 第 4 页柱状图和这张表的四个数相同. 所以第 1 页 「improve GLM-5.2's MTP layer ... increasing the acceptance length by up to 20%」 里的 20%, 是在 GLM-5.1 主干上量出来的, 页面没有给 GLM-5.2 自己的接受长度.

结构图里其余可见的部件只有这些: 两个 MTP module, 各由 Embedding (Shared), E-Norm, H-Norm, Linear 和一个 DSA Block 组成, 输出经 MTP Head (Shared); 两个模块之间有 「Reuse top-k indices」 和 「Shared KV Cache」. 图里没有注意力头数, 前馈层, 宽度和参数量, 第 8 页 「merging more than ten expert models」 说的是后训练里合并十多个模型, 也不是结构描述. 这些空白本页不能填.

## 7. 1M 的推理服务和吞吐图

第 6 页的推理段落先讲问题: 窗口从 200K 提到 1M 后, 编程负载预计会转向更长的提示, 推理瓶颈从计算转到 KV-cache 容量, 长上下文算子开销和 CPU 侧开销. 引擎优化分三个方向: 在 LayerSplit 基础上做更细粒度的显存管理和并行, 提高 KV-cache 容量; 优化开销随上下文增长的算子, 并和缓存传输流水线配合, 减少对 prefill 和 decode 的影响; 优化 CPU 侧的缓存管理, 请求调度和运行时路径, 减少 GPU 流水线空泡. 三条都没有单独的数字.

第 7 页吞吐图以 GLM-5.1 在 32K 时为 1. GLM-5.1: 64k 1.62x, 128k 2.42x, 200k* 2.77x, 更长 OOC; GLM-5.2: 32k 1.03x, 64k 2.06x, 128k 3.86x, 200k 4.69x, 256k 5.37x, 512k 6.16x, 1024k 6.97x. 同长度下两者之比从 32k 的约 1.03 升到 64k 约 1.27, 128k 约 1.60, 200k 约 1.69, 这是正文 「increasingly larger throughput advantage」 在图上的样子. 但 「Normalized Throughput」 按什么计, 为什么 GLM-5.1 自己的柱也随长度升高, 用了什么硬件和并发, 页面都没写, 这些倍数只能在这张图内部比.

## 8. 后训练: slime, 长程强化学习, 防作弊

slime 在第 7, 8 页被描述为从训练贯通到大规模推理 rollout 的一层基础设施, 支持白盒 rollout, 黑盒 rollout, 紧凑轨迹和子智能体工作流四种组织方式, 能适配不同的并行策略, 路由策略, PD 分离和部署方式, 并配合 KV-cache FP8. 具体可引用的数字只有一处: 用 slime 做并行 OPD 训练, 把十多个 「expert models」 合并进最终模型, 全程约两天. OPD 全篇没展开, 两天用了多少卡没写.

长程强化学习的改动写在第 8 页. 长程任务的轨迹被压缩 (compaction) 切成多段子轨迹后, 同一提示下不同 rollout 的可训练轨迹数和长度都不一样, 所以从按组优化改为基于 critic 的 PPO, 从单条 rollout 学习, 由 critic 估计 token 级优势. 压缩后的所有子轨迹都作为可训练轨迹, 再用 token 级损失处理长度不均. 这一节没有训练曲线和对比分数.

防作弊一节的起因是 「GLM-5.2 shows more potential hacking behavior than GLM-5.1」. 页面举的例子有用 curl 直接下载答案, 以及 find, cat, python 三步串起来读取 `/workspace/.eval/secret_cases.json`. 检测分两步: 规则过滤器先抓, 追求召回; LLM 评审再看意图, 保证精确. 在线监控每一步工具调用, 发现作弊就拦下这次调用, 返回假信息, rollout 继续, 不丢弃整条轨迹. 这个模块 「for both RL training and evaluation」, 即评测里也用; 脚注里明确写到防作弊判定的只有 NL2Repo 一项 (基于规则和基于 LLM 的判定, 例子是未经许可的 pip 或 curl). 其它各项评测里是否拦截过, 拦了多少, 页面没说.

## 9. 评测设置: 脚注写了什么

第 11, 12 页脚注逐项给了设置. 推理类 (HLE 等): temperature=1.0, top_p=0.95, 最大生成长度 163,840 token, 默认报纯文本子集, AIME, HMMT, IMOAnswerBench 用固定系统提示, 评审模型 GPT-5.5 (medium); HLE 带工具的最大上下文 300,000 token, 不用上下文管理. SWE-Bench Pro 用 OpenHands, 400K 窗口; NL2Repo 400k; DeepSWE 用 pier 框架和 mini-swe-agent, 2 小时超时, 2 CPU 8 GB 不联网; ProgramBench 200 个实例, Claude-Code 2.1.156, 6 小时超时, reasoning_effort=max, 4 CPU 8 GB 不联网; Terminal-Bench 2.1 分 Terminus 2 (256K, 4 小时超时) 和 Claude Code 2.1.167 (max_new_tokens 经透明代理覆盖为 128k, 去掉墙钟限制, 5 次平均) 两种; MCP-Atlas 500 个任务的公开子集, 每题 10 分钟, 评审模型 Gemini-3.0-Pro; Tool-Decathlon 用官方服务, max_token 128K; 三项长程基准由第三方在 1M, max 档位, 128K 输出下测.

几处要注意的口径. 只有 Terminal-Bench 2.1 (Claude Code) 写了 「averaged over 5 runs」, 其它项没写跑了几次. 两处用到 Claude Code, 版本不同: ProgramBench 用 2.1.156, Terminal-Bench 和档位折线图用 2.1.167. 评审模型也不同: 数学题用 GPT-5.5, MCP-Atlas 用 Gemini-3.0-Pro, 而 GPT-5.5 本身又是柱状图里的对比模型之一. 表尾 「*: refers to their scores of full set」 和脚注 「results marked with * are from the full set」 说的是带星号的格子, 可大表可见部分一个星号都没有, 带星号的格子可能在被截掉的 「Cla」 列里, 这是推断.

## 10. 18 张图, 文件名和 md 的抓取问题

18 张图按页是第 1 页 2 张, 第 2 页 2 张, 第 3 页 8 张, 第 4 页 4 张, 第 5 页 1 张, 第 7 页 1 张. PDF 里的位图更少: 第 3 页八张柱状图连同标题和图例是一张 4239x2799 的整图, md 把它切成八块; 第 4 页是两张位图, 档位折线图一张, 结构图, FLOPs 曲线和接受长度图合在另一张里, md 切成三块; 第 2 页的 Z 字标是从长程评测图右上角切下来的. 第 1 页两张是链接前的小图标 (Z 字标和 Hugging Face 笑脸), 第 5 页是两步 MTP 示意图, 第 7 页是吞吐图. 能读出数字的有 13 张: 长程条形图, 八张柱状图, 档位折线图, FLOPs 曲线, 接受长度图, 吞吐图.

文件名对不上画面的有 8 张, 规律是名字取自图后面那段文字. 第 4 页四张整体错开一位: 档位折线图叫 `p04-architecture-for-1m-context.png`, 结构图叫 `p04-lower-flops-with-indexshare.png`, FLOPs 曲线叫 `p04-higher-mtp-acceptance-length.png`, 接受长度图叫 `p04-indexshare-for-dsa.png`; md 里 「Lower FLOPs with IndexShare」 和 「Higher MTP Acceptance Length」 两行图题也跟着落到了前一张图下面. 第 3 页第八张 HLE 柱状图叫 `p03-glm-5-2-also-introduces-effort-level-control-enabling.png`; 第 2 页 Z 字标和长程条形图的名字取自各自后面的正文; 第 1 页笑脸叫 `p01-try-it-at-z-ai-...png`. 名字泛但不算错的是 `p01-image.png` 和七张 `p03-chart*.png`; 第 5 页和第 7 页两张的名字取自讲图的正文和图注, 内容对得上.

md 还有几处和 PDF 不一致. 「## LLM Performance Evaluation」, 「Long-Horizon Task Evaluation」, 「Agentic Coding Performance by Effort Level」 等行在 PDF 文字层里没有, 是从图里识别出来的字, 其中第一行还被当成了二级标题. 三个孤立的 「Z」 和末尾的 「x0」 是图标被识别成的字符, 第 1 页 HuggingFace 前的 「S」 也是. 第 10 页表头 「Qwen3.7-Max」 被切成 「Q」 和 「wen3.7-Max」, 行名下的小字副标题成了单独的行, 被截断的 「Cla」 列并进了 DeepSeek-V4-Pro 的表头. 第 11 页脚注丢了星号, 第 13 页丢了 「Legal」, 「Privacy Policy」, 「Terms of Service」 三行链接. PDF 的粗体 md 也没有保留.

## 11. 这篇能回答什么, 不能回答什么

能照原字原数引用的: 发布日期 2026-06-16; 窗口上限从 200K 改为 1M, Claude Code 里用 GLM-5.2[1m] 开启; IndexShare 每 4 层共用一个 indexer, 1024K 处单 token FLOPs 标 「2.9x lower」; MTP 接受长度在 GLM-5.1 主干上从 4.56 到 5.47; 吞吐图各长度的倍数; 大表 19 行里五个可见模型的分数; 八张柱状图和长程条形图里对比模型的分数; 各项评测的设置; OPD 合并十多个模型约两天; 编程套餐高峰 3 倍, 非高峰 2 倍 (9 月底前非高峰 1 倍) 的额度规则; 权重在 HuggingFace 和 ModelScope 公开, 支持 transformers, vLLM, SGLang, xLLM, ktransformers.

本页回答不了的: GLM-5.2 的参数量, 层数 L 和完整结构; 1M 长度的训练在哪个阶段做, 用多少数据; 「long-context benchmarks」 是哪几项, 分数多少; 有没有专门在 1M 长度上考检索或理解的分数; GLM-5.2 自己的 MTP 接受长度; 吞吐按什么计; MCP-Atlas 77.0 和 76.8 哪个准; GLM-5.1 在三项长程基准上用的是什么窗口; Terminal Bench 2.1 上 GLM-5.1 的数为什么和 GLM-5.1 卡上 2.0 的数完全一样; 被截掉的 「Cla」 列是谁, 星号在哪; OPD 是什么, 两天用了多少卡; 「more potential hacking behavior」 多了多少. `glm-5-2-bi.md` 里的 12 处疑点, 集中在这几件事上: 1M 的含义和评测长度, 和 GLM-5.1 对比所用的行, 图表数字的一致性, 20% 的测量条件, 以及图的文件名.
