[OM-FREEPLAY] 材料不够 5000. 公开材料是 x.ai 在 2026 年 7 月 16 日发的一篇产品公告, 共 8 页, 不是技术报告. 正文讲了训练硬件与数据筛选, 强化学习的规模与异步训练, 一个 DeepSWE 柱状图, token 效率与 80 TPS, Office 插件和定价; 参数量, 网络结构, 训练数据配比, 奖励设计, 上下文窗口页面都没有, 这里也不补.

# Grok 4.5: 一篇把「快, 省, 聪明」捆在一起卖的公告怎么读

来源: 同目录 `grok-4-5.md` (页标记 `page 1 of 8` 到 `page 8 of 8`), 对照译稿 `grok-4-5-bi.md`, 图上丢失的数值回查 `grok-4-5.pdf` 的文字层. 配图 8 张, 带可核对数据的只有第 2 页 DeepSWE 柱状图一张: `images/p02-eval-created-by-datacurve-run-with-each-model-provider.png`, 其余是「Try for free」按钮截图, Cosmos 太阳系应用截图, PowerPoint 插件演示截图, 三张入口小图标和一张月牙图标. 文件名全部取自图片旁边的文字, 和内容大多对不上, 引用时以图的内容为准.

这份材料能回答的问题是: Grok 4.5 被定位成什么, 训练用了什么硬件, 强化学习往哪个方向扩, 在 DeepSWE 上落在哪个位置, 以及 API 卖多少钱. 它回答不了模型怎么搭, 怎么训数据, 那些「2 倍效率」的图为什么读不出数值.

## 1. 页面构成: 训练两段, 一张图, 然后全是产品

第 1 页给出定位: Grok 4.5 是 SpaceXAI 「smartest model」, 面向 coding, agentic tasks 和 knowledge work, 「trained alongside Cursor」, 并且「strongest model ever」. 第 1, 2 页是全文唯一讲训练的地方: 「Real-world engineering excellence」一句带过数据覆盖, 「Training Grok 4.5」一段讲硬件, 数据筛选和强化学习. 第 2 页末尾是 DeepSWE 柱状图和两行来源小字. 第 3 页起进入演示: 一个 prompt 生成 Cosmos 太阳系应用, 接着「Faster than flash models」给出 80 TPS 和 token 效率的主张.

第 4 页是 token 效率图 (数值在抽取中丢失), 然后是 Office 能力, 定价 \$2 / \$6, 上手代码和第 6 页的安装命令, 第 7, 8 页是网站页脚. 按篇幅算, 全文没有一处讲到模型结构, 讲训练的文字不到两段, 其余是演示截图, 价格和产品入口. 它和 [Grok 4 公告](../grok-4/grok-4-bi.md) 是同一个模板: 一句最强定位, 一小段训练叙述, 几张图, 产品链接, 页脚.

## 2. 训练: 硬件换代, 数据筛选, 异步强化学习

### 2.1 硬件与数据: 从 200,000 张 H100 到数万张 GB300

公告说 Grok 4.5 「trained across tens of thousands of NVIDIA GB300 GPUs」. 对照 [Grok 4 公告](../grok-4/grok-4-bi.md) 的 Colossus 「200,000 GPU cluster」: 那次集群由 H100 组成, 这次是 GB300, 数量写法从「二十万」缩成了「数万」, 两种写法一个给的是集群总规模, 一个给的可能是本次实际占用, 口径不同, 不能直接读成「训练变小了」. GB300 是 Blackwell 一代的整机柜产品 (GB300 NVL72), 单柜算力和显存带宽比 H100 节点高出一个量级, 「数万张 GB300」的总算力未必比二十万张 H100 低, 但页面没给 FLOPs, 也没有任何换算依据.

数据侧的说法比 Grok 4 公告更具体: 除 raw token 量之外, 点名了 **deduplication**, **quality scoring** 和 **domain-focused selection** 三样筛选, 目标是让数据配比保持「high-coverage and high-signal」. 这是预训练数据的常规工序, 值得注意的不是它做了什么, 而是这次的叙述重心: Grok 4 公告把篇幅给了强化学习, 这次把数据筛选和强化学习并列, 说明在长训练 run 的稳定性之外, 数据配比被当成了卖点. 配比具体怎么定, 各域占比多少, 页面没写.

### 2.2 强化学习: 三个新词, 一个老方向

第 2 页 RL 一段有三个值得拆的说法. 一是 **per-token intelligence**: 把强化学习的规模扩张和「每个 token 更聪明」绑在一起, 对应全文的效率叙事——如果模型解同样的问题少写一半 token, 同样的输出速度下任务就更快更便宜, 这就是第 3 到 5 页 80 TPS, token efficiency, 定价三段反复强调的同一根线. 二是 **hundreds of thousands of tasks** 加 **automated and model-based grading**: 任务以多步软件工程为中心, 判分一部分能自动化 (跑测试, 核对答案), 一部分靠模型当裁判; 判分模型是谁, 和训练中的策略什么关系, 页面没写, 用模型做奖励带来的 reward hacking 风险本页也没提. 三是 **highly asynchronous training**: agentic rollout 可以跑好几个小时, 同时学习在数万张 GPU 上继续.

异步这条是全文技术上最硬的一句话, 也是最容易被滑过去的一句. 同步 RL 里所有 rollout 用同一版权重采样, 采样全部返回再更新; 一旦 rollout 时长以小时计, 同步等待会把 GPU 大量时间耗在空转上, 所以必须把采样和更新解耦, 让慢轨迹返回时训练不停车. 代价是数据变陈旧: 轨迹采样自第 n 版权重, 训练已经走到第 n+k 版, 直接用旧数据算梯度会不稳, 需要重要性采样修正, 截断或近端约束一类的手段兜住. 页面只说「built for」, 一个字没提怎么对付陈旧性. 这套问题的通用背景见 [AgenticRL 训练](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.1-AgenticRL训练.md) 和 [Off-policyness 与 Privileged Information](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.3-Off-policyness与Privileged-Information.md), RL 规模怎么随计算变见 [ScaleRL](../../../../llm-guide/4-后训练/4.8-ScaleRL-尺度定律的再发现/4.8-ScaleRL-尺度定律的再发现.md), 都是通用讨论, 不是本页的做法.

## 3. 唯一的图: DeepSWE 柱状图怎么读

### 3.1 图上实际画了什么

第 1 页末尾列了五个评测名 (DeepSWE 1.0, DeepSWE 1.1, SWE Marathon, Terminal Bench 2.1, SWE Bench Pro), 是网页的切换标签, 抓下来的图只有 DeepSWE 一张. 图题「DeepSWE score (pass@1)」, 五根柱子: **Fable (max) 66.1%**, **GPT 5.5 (xhigh) 64.31%**, **Grok 4.5 62.0%** (橙色), **Opus 4.8 (max) 55.75%**, **Opus 4.7 (max) 40.12%**. 后三个竞品名对应的厂商页面没写, 按命名惯例分别指向 Anthropic, OpenAI 和另一个 Fable 系列模型, 这是推测, 报告里没写.

DeepSWE 是 Datacurve 做的编程 agent 基准, 主打原创任务防污染: 题目是新写的长跨度工程任务, 靠测试验证行为而非比对实现. 这一点对读懂图很重要, 因为页面自己的两行小字暴露了两个口径问题. 第一行说评测「run with each model provider's harnesses」, 也就是每个模型用自家 harness 跑, 工具集, 重试和 scaffold 各不相同, 这种 pass@1 横向比柱高, 可比性有限; 第二行又说竞品数字「drawn from published system cards or leaderboards」, 即部分柱子可能不是同场跑出来的, 而是从各家发布材料里摘的. 两种来源混在一张图里, 哪个柱子是哪种来源, 页面没标.

### 3.2 图和正文对不对得上

正文说 Grok 4.5 「exceeds comparable leading models at these tasks」, 但图里 Grok 4.5 是第三名: 落后 Fable (max) 4.1 个点, 落后 GPT 5.5 (xhigh) 2.31 个点, 只领先 Opus 4.8 (max) 6.25 个点. 「comparable」要让这句话成立, 得把前两名划到「不可比」的那一类, 页面没给这个口径. 橙色柱子只给 Grok 4.5 用了, 视觉上也放大了它的存在感.

另一个缺口是 DeepSWE 之外的四个标签. 正文后面两处提到 **SWE Bench Pro**: 第 4 页 token 效率图的横轴口径是「avg. output tokens per SWE Bench Pro task」, 定价段又说「solving tasks in under half the number of steps」, 但 SWE Bench Pro 的通过分数本页一个都没给. 也就是说, 全文反复引用 SWE Bench Pro 作效率口径, 却没有任何一个该基准的分数; 五个标签里四个的图没有抓到. 评测口径的通用问题见 [Benchmark 与 Eval](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval.md).

## 4. 效率主张: 80 TPS 与 token 效率

### 4.1 两个独立的量被捆成一个卖点

第 3 页说 Grok 4.5 「served at fast-model speeds of 80 TPS」, 第 4 页给了一张 token 效率图, 两根柱子 (Grok 4.5 和 Opus 4.8 (max)) 都压在 70k tokens 量级的纵轴底部, 柱顶数值在抽取时丢失, PDF 文字层只剩两个「0」. 于是「twice greater token efficiency」这个 2 倍, 从这张图本身读不出来: 没有两个具体数字, 没有对比对象的完整名单 (图上只有 Opus 4.8 (max) 一个), 也没有运行条件.

TPS 和 token 效率是两个独立的量: TPS 是单 token 的生成速度, token 效率是完成同一任务要生成的 token 总数, 任务耗时约等于后者除以前者. 页面把「快」和「省」捆在一起, 逻辑上成立的前提是两者同时成立, 而本文两个都缺核对的数. 80 TPS 本身也没给测量口径: 是单请求解码速度还是聚合吞吐, batch 多大, 什么硬件, 推理时有没有多花 TestingTime, 页面都没写. 速度指标的口径问题见 [LLM Serving 与 PagedAttention](../../../../llm-guide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.4-LLM-Serving与PagedAttention深度解析.md).

### 4.2 定价段的三个说法互相互证不了

定价段在 \$2 / \$6 两个数字之外, 又叠了「roughly 2x the token efficiency」和「under half the number of steps」两个说法. token 数和 step 数不是一回事: agent 的一步可长可短, 步数减半推不出 token 减半, 页面却拿它们互相给同一个 2 倍背书. 单价横向比, [Grok 4.20 规格页](../grok-4-20/grok-4-20-bi.md) 是 \$1.25 / \$2.50, Grok 4.5 反而更贵, 输出价是后者的 2.4 倍; 「far lower costs」要成立, 完全押在 2 倍 token 效率上, 而这个效率只有一张数值丢失的图. 至于「highest intelligence per unit of time and cost」, 没有任何联合指标支撑, 属于宣传语.

## 5. 产品面: Cursor 共训, Grok Build, Office 插件

「trained alongside Cursor」是全篇信息量最大又最含糊的一句. 可能的形态包括 Cursor 提供真实编程场景的数据或任务分布, 提供 agentic 评测环境, 或双方共建训练管线; 页面一种都没点名, 只留了一个指向 Cursor 博客的链接. 能与它对上的事实是: Grok 4.5 发布当天即在 Cursor 全套餐上线, 之后又进 Grok Build 做默认模型, 12 天后进 GitHub Copilot. 产品与 Cursor 绑得这么紧, 和「共训」的说法方向一致, 但训练里 Cursor 到底出了什么, 本页没有.

Office 一段讲 Grok Build 能做复杂的 Excel 模型 (联网调研, 跨 sheet 公式, 留便签), 能在 PowerPoint 里用原生形状画图, 在 Word 里写文字, 页尾给出 Word, PowerPoint, Excel, Outlook 四个 Office 插件链接. 截图里是一个五页季度回顾的 PowerPoint 演示, 右侧「Draft the deck」面板, 和上面的 prompt 对应. 插件负责把模型接进 Office 宿主环境, 模型负责内容, 这个分工是合理读法, 但页面没写机制, 「留便签」这类动作是模型调插件接口还是脚本完成, 无从判断.

上手代码有两个细节. 一是端点是 `/v1/responses`, body 用 `input` 字段, 不是 chat completions 的 `messages`, 模型名就叫 `grok-4.5`, 不带日期码和 reasoning 后缀, 和 Grok 4.20 规格页里 `grok-4.20-0309-reasoning` 那套命名规则对不上, 本页没解释. 二是示例的 input 本身就是一道调试题: `function median(a){a.sort();return a[a.length/2]}` 至少有 sort 字典序, 偶数长度取上中位, 下标越界半格, 原地修改副作用四个毛病, 拿它当入口示例等于悄悄演示了模型的调试能力.

## 6. 模型本身与本文的空白

参数量, 层数, 注意力结构, 词表, 上下文窗口, 预训练数据和配比, 本页一个字都没写. 「strongest model ever」和「trained alongside Cursor」之间, 读者推不出底座是延续 [Grok 4](../grok-4/grok-4-bi.md) 的还是重训的; 推理时加了多少 TestingTime, 和 Grok 4 Heavy 那种并行 test-time compute 是什么关系, 页面也没提, 只有 80 TPS 这个数字暗示服务形态偏「快模型」而非「重推理」. 安全评测, 拒答率, 幻觉率同样不在本篇.

空白之外, 本页对不上的数字集中在这几处: 正文「exceeds comparable leading models」和图里第三名不一致; 图下两行小字一个说自己跑, 一个说摘自家发布材料, 来源混标; token 效率图数值丢失, 2 倍无从核对; 「2 倍 token 效率」和「不到一半步数」混用; 五个评测标签只抓到一张图, SWE Bench Pro 全篇无分数却被反复引用作效率口径. 另外公司名已是 SpaceXAI (2026 年 2 月 SpaceX 收购 xAI 后的新品牌), 发布日期 2026 年 7 月 16 日与页脚版权行同年, 不存在 [Grok 4 公告](../grok-4/grok-4-bi.md) 里那种模板残留问题. 按 [xAI 新闻页](../xai/xai-bi.md) 的列表, 约一个月后 Grok 4.6 以「long-running agents」为重点接续发布, 说明这次铺开的 agentic 线还在快速迭代.
