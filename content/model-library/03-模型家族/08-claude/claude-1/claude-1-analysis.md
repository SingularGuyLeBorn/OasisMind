# Claude (2023): 一份发布公告和它背后的 HHH 路线

> **[OM-FREEPLAY] 材料不够 5000.** 源文是 Anthropic 在 2023 年 3 月 14 日发布的产品公告 「Introducing Claude」, 属于博客式发布页, 不是技术报告. 全文没有公式, 没有表格, 没有参数量, 训练数据, 训练方法, 上下文长度, 价格或评测分数. 下文把公告里的说法归类, 再对到 Anthropic 在 2021 到 2023 年公开过的对齐研究上; 公告没说用了哪种方法的地方, 一律写 「本页没有」, 不替它补配方.

来源: 同目录 `claude-1.md` 与 `claude-1.pdf`, 共 10 页, 配图 4 张 (均在 `images/`). 对照译稿和逐段疑问见 `claude-1-bi.md`. 引用的原文和链接以源 md 为准.

## 1. 材料与发布

### 1.1. 材料性质: 前半篇是公告, 后半篇是 2026 年的页脚

这份 PDF 分成两块. 第 1 页到第 5 页是 2023 年 3 月 14 日的公告正文: 宣布结束封闭 alpha, 介绍 Claude 和 Claude Instant 两个版本, 再用六家伙伴的引语说明用途. 第 5 页末尾到第 10 页是抓取网页时一并存下来的推荐文章, 站点导航和页脚, 版权行是 2026 年. 后半部分出现的 Mythos, Fable 等模型名和 Claude Code 等产品名, 都不是 2023 年那次发布的内容.

正文大约十几段: 两段发布说明, 两段能力和版本介绍, 「Partner Testimonials」 一节按 Quora/Poe, Juni Learning, Notion, DuckDuckGo, Robin AI, AssemblyAI 排开, 最后一段号召申请使用. 它的写作目的是招揽客户. 按 「数据, 架构, 算法, 预训练, 后训练, 评测」 去对, 这篇只在后训练一面留了一个口号 「helpful, honest, and harmless」, 在评测一面留了客户的定性反馈, 其余各面全空.

### 1.2. 发布动作: 从封闭 alpha 到申请制

第 1 页交代了发布前的状态: 过去几个月, Claude 以封闭 alpha 的形式只给 Notion, Quora, DuckDuckGo 等重点伙伴使用. 公告当天的变化是 「ready to offer Claude more broadly」, 入口是一个 early access 链接; 最后一段又请企业 「request access to Claude」. 所以这次是从少数伙伴扩大到申请制, 不是开放注册.

使用渠道是聊天界面和开发者控制台里的 API. 能力描述是 「a wide variety of conversational and text processing tasks」, 同时强调 「a high degree of reliability and predictability」. 第 2 页列出的用例有摘要, 搜索, 创意写作与协作写作, 问答, 编程, 全是文本任务, 没有图像, 音频或工具调用. AssemblyAI 那段出现的音频业务, 转写由 AssemblyAI 自己的 API 负责, Claude 只处理文字. 先在伙伴那里跑几个月再放量, 这个节奏本身就是一种部署前评测: 真实流量里的失败样本比内部测试集更能暴露问题, 但公告没说 alpha 期间收集了什么, 也没说这些反馈是否回流进训练.

### 1.3. 两个版本: 产品分档的起点

第 2 页说今天提供两个版本. Claude 是 「state-of-the-art high-performance model」, Claude Instant 是 「lighter, less expensive, and much faster option」. 差别只用了几个比较级, 没有参数量, 延迟或单价. 同一页链接了一份价格 PDF, 本页没有转录其中数字.

「大模型加轻量模型」 的两档结构后来一直延续: Claude 2 时代是 Claude 2 与 Claude Instant 1.2, Claude 3 起变成 Opus, Sonnet, Haiku 三档, 同级目录各有一篇. Instant 是单独训练的小模型, 还是由大模型蒸馏而来, 这页没有, Anthropic 后来的公开资料也没有交代. 蒸馏的一般做法见 [知识蒸馏](../../../../llm-guide/6-训练与推理优化/6.3-模型压缩/6.3.3-知识蒸馏/6.3.3-知识蒸馏.md), 不能拿来推断 Instant 的来历.

## 2. HHH 与伙伴评测

### 2.1. HHH 与 steerable: 口号背后能对上的研究

「helpful, honest, and harmless」 在全文出现两次, 一次在第 1 页的产品定义里, 一次在第 2 页的后续计划里. 这三个词不是营销新造的: Anthropic 2021 年的 「A General Language Assistant as a Laboratory for Alignment」 就把 HHH 当作助手对齐的目标, 2022 年 4 月的 HH-RLHF 论文用人类偏好比较训练偏好模型, 再用 RL 优化策略, 并公开了一部分 helpful 与 harmless 的比较数据; 2022 年 12 月的 **Constitutional AI** 论文把 harmless 一侧的人类标注换成 AI 按一组书面原则给出的偏好, 即 RLAIF. 公告发布两个月后, Anthropic 在 2023 年 5 月的 「Claude's Constitution」 一文里明确说 Claude 用这套宪法训练. 这条时间线来自公开论文和博客, 本公告自己没有提任何一种方法.

公告里最具体的质量说法来自客户: 早期客户反馈 Claude 更不容易产生有害输出, 更好交谈, 也更 steerable, 用更少的力气就能拿到想要的结果. Anthropic 自己补了一句: Claude 能按指示调整个性, 语气和行为. 把这两句放回上面那条研究线, 「更少有害输出而不过度回避」 正是 Constitutional AI 论文追求的 harmless 且 non-evasive; 但公告没有给任何有害率, 拒答率或对比数据, 所以这只能算方向一致, 算不上证据. **RLHF** 与 RLAIF 的机制见 [基于奖励模型的RL-RLHF-PPO](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/4.4.1-基于奖励模型的RL-RLHF-PPO.md), [Constitutional AI 宪法对齐](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.3-RLAIF/01-Constitutional-AI-宪法对齐/01-Constitutional-AI-宪法对齐.md) 和 [RLAIF](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.3-RLAIF/4.4.3-RLAIF.md).

### 2.2. 六家伙伴: 定性评测和检索接入

Quora 通过 Poe 提供 Claude, Autumn Besselman 转述用户评价: 回答详细, 好懂, 像自然对话; 后面接三条 Poe 用户的引语, 说 Claude 比 ChatGPT 更像聊天, 讲故事更有互动感, 答案深入但表达简单. Juni Learning 把 Claude 用在 Discord 上的 Juni Tutor Bot, CEO Vivian Shen 说评估过竞争对手后选了 Claude, 举了数学题和批判性阅读两个例子. Notion 的 Akshay Kothari 说 Claude 的创意写作和摘要能力用在 Notion AI 上. Robin AI 用 Claude 评估合同条款并给出替代措辞, CEO 说部署后用户参与度, 反馈和成单都有提升. AssemblyAI 说合作帮他们更快交付基于 LLM 的生成式 AI 能力.

这些引语是公告里唯一的 「评测」. 它们全是定性描述, 样本由 Anthropic 挑选, 没有一个数字; Juni 说 「evaluated Anthropic against competitors」, 评估方法和指标都没给. 另一处值得单独看的是 DuckDuckGo: DuckAssist 依据 Wikipedia 和其他来源生成答案, Anthropic 在这一段前面写 「正与伙伴合作, 把 Claude 接入可靠, 实时的信息源」. 模型本身没有联网, 实时性靠伙伴侧检索后塞进上下文, 属于检索增强生成的用法, 见 [RAG](../../../../llm-guide/7-LLM应用开发/7.2-RAG/7.2-RAG.md). 这也说明在 2023 年初, 「知识截止」 的问题是在产品层用检索绕开的, 不是在训练层解决的.

## 3. 配图与边界

### 3.1. 四张配图

第 1 页是装饰插画: 橙色圆点连成的网络, 旁边是手绘的人脸侧影和手, 不承载信息. 第 3 页是 Poe 的界面截图, 左边写 「Fast, helpful AI chat.」, 两部手机展示一次关于东京赏樱地点的问答, 回答下方有点赞, 点踩, 分享按钮和追问建议. 点赞点踩按钮是收集偏好信号的常见入口, 但公告没说 Poe 上的反馈是否回到 Anthropic.

第 5 页开头是合同审阅界面. 左边是合同条文, 第 8 条关于协议在两周年终止的句子被高亮; 右边是针对 Term 的建议, 把两周年改为一周年或更早的最终文件签署日, 写明问题是协议期限应在 1 年后届满. 这张图配合法律场景, 展示了 「评估条款, 提出替代措辞」 的样子. 第 6 页的配图是页脚截图, 黑底白字列出 Products 栏 14 项, 属于 2026 年快照.

### 3.2. 材料边界

这篇公告回答的是 「Claude 什么时候对外开放, 有哪两个版本, 谁在用, 用来做什么」. 模型规模, 架构, 预训练语料, 上下文长度, 对齐流程和评测结果, 本页一样都没有. 第 2.1 节列出的 HH-RLHF, Constitutional AI 和宪法博客是能对上号的公开研究, 引用时要把 「Anthropic 同期公开的方法」 和 「Claude 1 的实际配方」 分开写: 前者有论文, 后者 Anthropic 只在方向上确认过, 没有给出比例和细节.

读同级目录后续几篇时, 可以拿这页当基线: Claude 2 的发布页开始给出评测分数和上下文长度, Claude 3 有了正式模型卡和训练数据说明, Claude 3.7 起改叫系统卡, 并把思考模式本身纳入安全评测. 这篇是这条线里信息最少的一篇, 它的价值在于确定了起点: 两档产品, HHH 目标, 伙伴先行的部署节奏.
