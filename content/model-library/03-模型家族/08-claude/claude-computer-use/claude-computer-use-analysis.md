# Claude computer use 公告: 把屏幕当接口

> **[OM-FREEPLAY] 材料不够 5000.** 源材料是 Anthropic 官网 2024 年 10 月 22 日的产品公告, 不是论文: 没有公式, 没有架构图, 没有训练细节, 可核对的只有一张基准表和正文里几组百分比. 下文围绕 computer use 与升级版 3.5 Sonnet, 把 OSWorld, SWE-bench Verified, TAU-bench 三个评测的机制, 公告的安全表态, 以及 Anthropic 同日另文 「developing computer use」 里公开过的训练思路放在一起读; 对不上的写 「本页没有」. 双语对照与逐段疑问见 [claude-computer-use-bi.md](claude-computer-use-bi.md).

来源: 同目录 `claude-computer-use.md` 与 PDF. 同族目录 `claude-3-5-haiku` 用的是同一份抓取, 那一篇以 Haiku 为主, 本篇以 **computer use** 和新 Sonnet 为主.

## 1. 材料与发布

### 1.1. 材料性质

这份 PDF 共 9 页, 属于公告的只有前 5 页, 标题 「Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku」, 日期 2024 年 10 月 22 日, 页首另有一条 2024 年 12 月 3 日补的 Haiku 调价说明. 第 5 页后半的 「Related content」 和第 6 到 9 页的导航是抓取时官网的通用页脚. 第 1 页的橙底插画是题图, 一只光标加一只手和一张侧脸的线稿, 不含数据; 第 9 页的小图是 LinkedIn 图标.

能用的定量材料就是第 2 页那张 8 行 7 列的表, 加上第 3, 4 页正文重复引用的 SWE-bench Verified, TAU-bench 和 OSWorld 数字. 按 「数据, 架构, 算法, 预训练, 后训练, 评测」 去对, 本页在评测一面有数, 在后训练一面只有一句 「we're teaching it general computer skills」, 数据, 架构和预训练全空. 训练过程被指向另一篇 「developing computer use」, 本文只借用那篇公开过的几句思路.

### 1.2. 一次发布, 三件事

这一篇同时发布三样东西: 升级版 Claude 3.5 Sonnet, 当天对所有用户开放; 新模型 Claude 3.5 Haiku, 当月晚些时候上线; computer use 公开 beta, 当天在 Anthropic API, Amazon Bedrock 和 Vertex AI 上可用, 只挂在 3.5 Sonnet 上. 第 3 页讲 Sonnet 的编程与工具使用成绩, 第 3 到 4 页讲 Haiku, 第 4 页才进入 computer use 专节.

computer use 一节只有一个 OSWorld 成绩, 其余是用途, 局限和安全表态. 数据重心在新 Sonnet 和 Haiku 的基准分数, computer use 更像能力方向的宣告. 页面列了 Asana, Canva, Cognition, DoorDash, Replit, The Browser Company 六家早期试用方, 说它们在做需要几十甚至上百步的任务; Replit 用它在构建过程中评估应用. 这些是定性描述, 没有成功率.

## 2. computer use 与评测

### 2.1. 新旧 Sonnet: 增幅集中在 agentic 任务

把表中新旧两列 Sonnet 逐行相减, 绝对增幅 (百分点): GPQA Diamond +5.6, MMLU-Pro +2.9, HumanEval +1.7, MATH +7.2, AIME 2024 +6.4, MMMU +2.1, SWE-bench Verified +15.6, TAU-bench retail +6.6, airline +10.0 (估算). 九项全部为正, 与 「across-the-board improvements」 吻合. SWE-bench Verified 从 33.4% 到 49.0%, 相对提升约 46.7% (估算); TAU-bench airline 从 36.0% 到 46.0%. 页面说价格和速度不变.

增幅最大的两项正是标为 「Agentic coding」 和 「Agentic tool use」 的两行. HumanEval 旧版已到 92.0%, 余量小; SWE-bench Verified 要在真实代码库里多步定位和修改. 同名同价的升级, 知识类只涨两三个点, agent 类涨十几个点, 这更像是在同一个基座上加强了面向多步交互的后训练, 而不是换了更大的预训练 (推测, 本页没写). 当天推出 computer use 与此方向一致: 两者要的是同一种能力, 在环境反馈下连续决策. Agent RL 的一般做法见 [AgenticRL训练](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.1-AgenticRL训练.md).

### 2.2. computer use: 用通用技能代替专用工具

第 4 页给出设计取向: 不再为每个任务造专用工具, 而是教模型通用的电脑操作技能, 直接使用为人设计的软件. 模型看到的是屏幕, 发出的是移动光标, 点击, 输入这类动作; 例子是把 「用电脑里和网上的数据填表」 拆成查电子表格, 开浏览器, 找网页, 填表几步. 公开的 API 文档显示, 实际运行是一个由开发者执行的循环: 应用截一张屏发给模型, 模型返回一个动作 (坐标点击, 键入, 滚动, 再截图), 应用在自己的机器或虚拟机里执行, 再截图回传, 直到任务结束. Anthropic 不托管这台电脑, 控制权留在开发者一侧.

这和 function calling 路线不同. 后者要求开发者先把能力包装成带 schema 的接口; computer use 把界面本身当接口, 省掉包装, 代价是模型必须从截图里理解界面状态, 每一步都可能看错或点偏. 「developing computer use」 一文公开过两点训练线索: 训练时只用了计算器, 文本编辑器这类少量简单软件, 模型却能泛化到别的应用; 让模型准确 「数像素」, 算出光标该移多少, 是做成这件事的关键, 否则它给不出可用的鼠标坐标. 训练数据规模, 是 SFT 还是 RL, 奖励怎么定, 那篇和本页都没有. 页面承认滚动, 拖拽, 缩放仍有困难, 这些恰好是需要连续空间控制的操作, 和 「数像素」 这条线索对得上. 工具路线的对比见 [工具使用与MCP](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.3-工具使用与MCP.md) 与 [工具调用演进](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.4-工具调用演进.md).

### 2.3. OSWorld: 14.9% 意味着什么

OSWorld 在完整的 Ubuntu 虚拟机里放了 369 个桌面任务, 横跨浏览器, 办公软件, 终端和多应用协作; 任务开始时从快照恢复初始状态, 结束后用脚本检查文件或配置是否达到目标. 输入可以是原始截图, 无障碍树或两者结合. 页面报的是 screenshot-only 类别: Claude 14.9%, 第二名 7.8%, 约 1.9 倍; 放宽步数后到 22.0%. 只看截图是最接近人的设定, 也是最难的, 因为模型拿不到界面元素的结构化描述.

从绝对值看, 即使放宽步数, 四分之三以上的任务仍未完成. 这与正文 「experimental」, 「cumbersome and error-prone」, 「imperfect」 的自我评价一致. 步数放宽能涨 7 个多点, 说明相当一部分失败不是 「不会」, 而是步数预算内没做完, 这属于 **TestingTime** 的另一种形态: 多给交互步数, 而不是多给思考 token. 页面没写两档的具体步数上限. 2026 年有研究指出, OSWorld 的评测脚本读取的是 agent 自己能写入的同一个虚拟机状态, 存在被钻空子的可能; 这晚于本页, 但提醒读分数时要记住评测环境的边界. 基准背景见 [Benchmark与Eval](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval.md).

## 3. 安全与读法

### 3.1. 部署姿态与安全表述

安全内容散在两处. 第 3 页针对新 Sonnet: 美英两家 AI 安全研究所做了联合部署前测试, Anthropic 自己的灾难性风险评估认为 **Responsible Scaling Policy** 下的 **ASL-2** 标准依然适用. 第 4 页针对 computer use: 它可能成为垃圾信息, 虚假信息和欺诈的新途径, 为此开发了能识别 computer use 使用场景和伤害是否发生的分类器.

两处都是结论式陈述, 没有评测数据. 部署手段主要是三条: 公开 beta 并标注实验性质; 建议从低风险任务起步; 服务端用分类器监测. 这些都是使用侧的约束, 页面没说模型本身为 computer use 做了哪些安全训练. 「developing computer use」 一文另外点名了 prompt injection: 模型读的是联网电脑的截图, 网页上的恶意文字可能被当作指令执行. 截图就是输入, 屏幕上的任何字都可能进入模型, 这是 「界面即接口」 带来的新攻击面, 也是后来各代系统卡把 computer use 场景的 prompt injection 单独评测的起点. 防护思路见 [Agent安全与对齐](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.3-Agent安全与对齐.md), 隔离环境见 [运行时环境与沙箱](../../../../llm-guide/13-Agent/13.3-Agent系统工程/13.3.4-运行时环境与沙箱.md).

### 3.2. 编程与工具评测的读法

SWE-bench Verified 是 500 道人工筛过的 GitHub issue, 用对应测试判定补丁对错; TAU-bench 让语言模型扮演用户, 被测模型按领域政策调用工具完成客服任务, retail 比 airline 容易. 两者都高度依赖脚手架和交互预算, 表里没标设置, 只有三列 Claude 有分. 按 Anthropic 之后的工程博客, 新 Sonnet 的 49.0% 用的是只给 bash 和文件编辑两个工具的极简脚手架 (公开资料, 本页没有). 客户侧的 GitLab 「up to 10%」 和 Cognition, The Browser Company 的评价都是定性的.

表格脚注说不收 o1 系列, 因为它依赖回答前的大量计算, 和常规模型不好比. 这把 TestingTime 路线单独拿了出来; 页面还说新 Sonnet 在 SWE-bench Verified 上高于 o1-preview, 等于用不带长思考的模型去比带长思考的模型, 口径上与脚注的排除理由有些矛盾. 编程 agent 的定位见 [IDE与Coding-Agent](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent.md), 基座能力为何在 agentic 任务上拉开差距见 [基座模型的Agentic能力](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.4-基座模型的Agentic能力.md).

### 3.3. 材料边界

这页能稳定回答: computer use 首次公开的时间, 渠道和定位, 屏幕加动作的交互形态, OSWorld 两档成绩, 新 Sonnet 九项增幅, 美英 AISI 联合测试和 ASL-2 结论, 以及分类器这一部署侧措施.

回答不了: computer use 的训练数据, 训练算法和奖励, 模型怎样把截图编码进上下文, 各 agent 评测的脚手架与步数上限, 分类器的指标. 第 2.2 节的循环机制与 「数像素」, 第 3.1 节的 prompt injection, 第 3.2 节的脚手架说明, 都来自 Anthropic 的 API 文档和另文, 不是本页原文.
