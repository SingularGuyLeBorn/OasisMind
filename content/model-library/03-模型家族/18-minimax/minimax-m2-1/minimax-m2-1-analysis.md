> **[OM-FREEPLAY] 材料不够 5000.** 源文是 MiniMax-M2.1 的 Hugging Face 模型卡快照, 共 11 页, 大半是站点界面, 正文只有一段发布词, 五张评测表, 一组评测说明和部署参数, 没有架构, 训练数据和训练方法. 本稿只就这页印出来的数展开, 不注水, 不从 MiniMax-01 或 M2 论文搬参数.

# MiniMax-M2.1: 模型卡精读

来源: 同目录 `minimax-m2-1.md` 与 `minimax-m2-1.pdf` (页标 `page 1 of 11` 到 `page 11 of 11`), 对照译稿见 `minimax-m2-1-bi.md`. 文中凡自己算出的差值, 均值, 存储量都标了 「估算」.

| 项 | 本页印的内容 | 页 |
| --- | --- | --- |
| 发布方 / 仓库 | MiniMaxAI / MiniMax-M2.1 | 1 |
| 许可证 | modified-mit (修改版 MIT) | 1, 3 |
| 模型大小 | 229B params (Safetensors 栏, 本页的数) | 1 |
| 张量类型 | F32, BF16, F8_E4M3 | 1 |
| 标签 | Text Generation, Transformers, Safetensors, minimax_m2, conversational, custom_code, Eval Results, fp8 | 1 |
| 挂靠论文 | arXiv 2509.06501, 即 WebExplorer, 不是 M2.1 技术报告 | 1, 2 |
| 社区数据 | 1.36k 赞, 上月下载 20,300, 适配器 1, 微调 12, 量化 37, Space 100 | 1, 2 |
| 推荐框架 | SGLang, vLLM, Transformers, KTransformers, MLX-LM | 9 |
| 推荐采样 | temperature=1.0, top_p=0.95, top_k=40 | 10 |
| 没印的 | 激活参数, 层数, 专家数, 上下文长度, 训练 token 数, 训练方法 | 全页 |

## 1. 这页是什么

这是 Hugging Face 上 MiniMax-M2.1 仓库首页的打印件. 第 1 到 3 页是站点栏目: 标签, 下载量, Safetensors 统计, 推理服务商, 模型树, 引用它的 Space 和合集, 挂靠论文, 一篇博客, 以及 Hugging Face 的评测挂件. 真正由 MiniMax 写的内容从第 3 页 「Meet MiniMax-M2.1」 开始, 到第 10 页联系邮箱结束, 中间是三段发布词, 使用入口, 五张评测表, 十条评测说明, 部署框架和推理参数.

所以这页能回答的问题很集中: M2.1 在哪些基准上比 M2 高多少, 和几个闭源模型差多少, 这些分数是怎么测的, 拿到权重以后怎么跑. 它回答不了 「M2.1 在结构上改了什么」 和 「训练上做了什么」. 发布词里唯一和训练沾边的一句是 「optimized the model specifically for robustness in coding, tool use, instruction following, and long-horizon planning」, 只说了优化方向, 没说手段. 这页没出现 MoE, MLA, RoPE, GQA, SFT, GRPO 等任何结构或训练术语.

## 2. 谱系: 这页能证明的只有 「同一条线」

这页里指向 M2 的线索有四处. 第 1 页标签里的 `minimax_m2` 是架构代码名; 第 2 页 M2.1 被收进 「MiniMax-M2 Collection」; 发布词说这次 「more than just a parameter update」; 所有评测表都把 MiniMax-M2 放在第二列当基线. 这四处加起来能说明 M2.1 是 M2 产品线上的一次迭代, 在 Transformers 里走的是同一个 `minimax_m2` 模型类.

同一条线不等于同一组参数. 这页自己只印了一个规模数 229B, 它来自 Hugging Face 对 Safetensors 文件的统计, 这页没有写它和 M2 的规模是否相同. 合集附的 arXiv 2605.26494 页面上没有标题, 标签里的 arXiv 2509.06501 是 WebExplorer, 二者都不是 M2.1 本身的技术报告. 因此, 本稿不把 M2 的激活参数, 专家配置或上下文长度写进 M2.1 的条目; 需要这些数时应回 M2 目录, 并注明出处是 M2 而不是这一页.

## 3. 规模与精度

229B params 是这页唯一的参数量. 按 Hugging Face 的统计口径, 它是权重文件里所有张量元素的总数, 与 「每个 token 实际参与计算的参数」 是两回事, 后者这页没给. 张量类型同时有 F32, BF16 和 F8_E4M3, 加上 fp8 标签, 能确定仓库里的主体权重以 FP8 存放, 另有一部分张量保留在更高精度. 哪些张量是 BF16 或 F32, 这页没拆.

拿 229B 可以粗算存储. 如果全部按 FP8 每参数 1 字节计, 约 229 GB, 折合约 213 GiB (估算); 真实仓库里还有 BF16 和 F32 张量, 实际体积只会更大, 所以这是下限. 若整体转成 BF16, 约 458 GB (估算). 这解释了为什么第 2 页模型树里量化版本多达 37 个, 远多于 12 个微调和 1 个适配器: 对多数本地用户来说, 先要解决的是装不装得下.

## 4. 软件工程主表: 升幅集中在多语言和终端

主表跨第 4, 5 两页, 共四行. M2.1 相对 M2 的升幅: SWE-bench Verified 69.4 到 74.0, 涨 4.6; Multi-SWE-bench 36.2 到 49.4, 涨 13.2; SWE-bench Multilingual 56.5 到 72.5, 涨 16.0; Terminal-bench 2.0 30.0 到 47.9, 涨 17.9 (均为估算). 单一语言的 Verified 涨得最少, 多语言和终端两类涨得最多, 和博客标题 「Multilingual and Multi-Task Coding」 的主打方向一致.

横向看, 发布词说多语言场景 「outperforms Claude Sonnet 4.5 and closely approaches Claude Opus 4.5」. 分行核对: Multi-SWE-bench 49.4 对 Sonnet 44.3 领先 5.1, 对 Opus 50.0 只差 0.6; SWE-bench Multilingual 72.5 对 Sonnet 68 领先 4.5, 对 Opus 77.5 差 5.0 (估算). 前一行确实逼近, 后一行离 Opus 和离 Sonnet 的距离差不多. SWE-bench Verified 上 M2.1 的 74.0 低于表里四个闭源模型, 只比 DeepSeek V3.2 的 73.1 高 0.9; Terminal-bench 2.0 的 47.9 也低于 Sonnet 的 50.0. 主表的亮点在 「相对 M2」, 不在 「相对闭源」.

## 5. 跨框架与专项: 宣传句要逐行核对

第 5 页用三种脚手架测 SWE-bench Verified. M2.1 在 Claude Code, Droid, mini-swe-agent 下分别是 74.0, 71.3, 67.0, 最高最低差 7.0; 同一口径下 Sonnet 差 6.6, Opus 差 6.5, M2 差 8.4, DeepSeek V3.2 差 13.1 (均为估算). M2.1 的跨框架波动比 M2 小, 比 DeepSeek 小得多, 和两个 Claude 相当. 说 「exceptional framework generalization」 可以理解为相对开源对手而言; 和 Claude 比并不突出, 而且三种脚手架下它都低于 Sonnet.

专项四行是测试用例生成 (SWT-bench), 代码性能优化 (SWE-Perf), 代码审查 (SWE-Review) 和指令遵循 (OctoCodingbench). 相对 M2 的升幅都大: SWT-bench 涨 36.5, 是全页最大的单项升幅之一; SWE-Review 从 3.4 到 8.9; OctoCodingbench 从 13.3 到 26.1 (估算). 但 「consistently matches or exceeds Claude Sonnet 4.5」 一句不完全成立: SWE-Review 8.9 对 10.5 落后 1.6, SWT-bench 69.3 对 69.5 只是持平. SWE-Perf 的单位这页没交代, 3.1 对 3.0 只能在同一行里比较.

## 6. VIBE: 自建基准, 图表互补

VIBE 是 MiniMax 这次新建的全栈应用基准, 分 Web, Simulation, Android, iOS, Backend 五个子集, 用 Agent-as-a-Verifier 在真实运行环境里判交互逻辑和视觉效果, 第 8 页说已经开源. M2.1 平均 88.6, 比 M2 的 67.5 高 21.1; 单项里 iOS 从 39.5 跳到 88.0, 涨 48.5, 是全页最大的一处跃升 (估算). 发布词点名的两个子集里, Web 的 91.5 是全表最高, Android 的 89.7 则低于 Opus 的 92.2; Backend 的 86.7 落后 Sonnet 4.1 分, 落后 Opus 11.3 分 (估算).

平均分和子集的关系值得核对. 按五项简单平均估算, M2.1 是 88.6, Sonnet 85.18, Opus 90.66, Gemini 82.38, 都与表里一致; 只有 M2 的简单平均是 66.78, 表里印 67.5, 差 0.72, 页面没说明平均分的算法. 另外, 第 4 页柱状图里有 DeepSeek-V3.2 的 VIBE 六项 (平均 76.4, 五项简单平均估算 76.36), 正文表里没有这一列; 表里的 Opus 列图里又没有. 引用 VIBE 对比时要注明数字出自图还是表. 还有一点: VIBE 是 3 次运行的平均, 其它内部基准都是 4 次.

## 7. 工具使用与综合智能: 九升两降一平

第 7 页的表有 12 行. 相对 M2, 九行上升, 两行下降, 一行持平: LCB 从 83.0 降到 81.0, IFBench 从 72.0 降到 70.0, τ²-Bench Telecom 都是 87.0. 发布词说这一块是 「steady improvements」, 放在总体上说得通, 落到单行就有例外, 尤其 LCB 是编程类指标, 和 M2.1 主打编程的定位方向相反. 升幅最大的是 Toolathlon, 16.7 到 43.5, 涨 26.8, 与 Opus 并列全表第一; HLE 不用工具从 12.5 到 22.2, 涨 9.7, 恰好与 DeepSeek V3.2 同分 (估算).

BrowseComp 两行可以放在一起读. 不做上下文管理时 M2.1 是 47.4, 低于 GPT-5.2 的 65.8 和 DeepSeek V3.2 的 51.4; 打开上下文管理后到 62.0, 涨 14.6. 同样的开关给 Opus 加了 20.8, 给 Gemini 加了 21.4, 给 Sonnet 只加 6.5 (均为估算), 说明这个策略对不同模型的收益差得很远. 上下文管理的规则是 token 用量超过最大上下文窗口 30% 时, 只留第一条和最后五条 AI 回复以及工具输出; 由于这页没印上下文长度, 触发点无法换算成 token 数. 学科类几行 (AIME25 83.0, GPQA-D 83.0, SciCode 41.0) M2.1 都落在表的下半段, 这一块本来也不是它的主攻方向.

## 8. 评测口径: 内部设置与挂件分数

第 7 到 9 页的说明透露了几件影响读数的事. SWE 系列和 Terminal-bench 都在 MiniMax 内部基础设施上跑, 脚手架默认是 Claude Code, 并且替换了 Claude Code 的默认系统提示; Terminal-bench 2.0 还修过环境问题, 去掉了超时限制. SWE Review 和 OctoCodingbench 是尚未开源的内部基准, OctoCodingbench 按 「一次违规即失败」 计分. AIME25 到 τ²-Bench Telecom 九行是参照 Artificial Analysis 方法的内部测试, 这几行的分数多为整数. 这些说明写的都是 M2.1 怎么测, 没写表里闭源模型和 DeepSeek 的分数是自己复测还是引用外部榜单.

同一页上还有 Hugging Face 评测挂件给出的另一组数, 可以当旁证. SWE-bench Verified 74, MMLU-Pro 88, HLE 22.2 和表里一致; GPQA Diamond 80.81* 对表里 83.0, 差 2.19; Terminal-bench 2.0 29.2* 对表里 47.9, 差 18.7 (估算). 挂件的 Terminal-bench 来源是 tbench.ai 官方榜, 与 「去掉超时限制」 的内部设置对照, 差距的方向说得通, 但星号含义页面没解释. 挂件另有 SWE-bench Pro 36.81 和 EvasionBench 71.31, 正文各表都没有这两项.

## 9. 部署与使用

使用入口有三条: MiniMax 开放平台 API, 基于 M2.1 的 MiniMax Agent 产品, 以及 Hugging Face 上的开源权重. 本地部署推荐 SGLang, vLLM, Transformers, KTransformers 四个框架, 各附一份部署指南; 「其它推理引擎」 下只列了 MLX-LM 的名字, 没有链接. 第 1 页 Inference Providers 栏只有 Novita 一家. 标签里有 custom_code, 按 Hugging Face 的惯例, 这通常意味着用 Transformers 加载时要允许执行仓库自带的模型代码.

推荐采样参数是 temperature=1.0, top_p=0.95, top_k=40. 这页没解释为什么温度取 1.0, 也没给思考过程长度或最大输出长度的建议值. 默认系统提示在 「Your name is MiniMax-M2.1 and is built by」 处截断, PDF 文本层也是这样, 完整句子要去仓库的对话模板里看. 工具调用另有一份指南, 这页只给了链接, 没有列格式.

## 10. 本页对不上的数字

下面几处都是这页内部互相对不上, 或说法与表格不符的地方, 不涉及外部材料.

- Terminal-bench 2.0: 挂件 29.2*, 第 5 页表 47.9.
- GPQA Diamond: 挂件 80.81*, 第 7 页表 83.0.
- VIBE (Average) 的 M2 列: 表里 67.5, 五个子集简单平均 66.78 (估算).
- VIBE 的 DeepSeek-V3.2 列只在第 4 页图里有, Opus 列只在表里有.
- 「consistently matches or exceeds Claude Sonnet 4.5」: SWE-Review 8.9 低于 10.5.
- 「steady improvements over M2」: LCB 81.0 低于 83.0, IFBench 70.0 低于 72.0.
- 「closely approaches Claude Opus 4.5」: SWE-bench Multilingual 差 5.0 (估算).
- BrowseComp 的说明写的是 「103-sample GAIA text-only validation subset」, 与 BrowseComp 本身对不上.

这些不一致大多来自口径不同: 挂件取外部榜单, 表格取内部设置; 宣传句按总体说, 表格按单行记. 读这张卡时, 把数字和它所在的表, 说明一起引用, 比直接转述宣传句可靠.
