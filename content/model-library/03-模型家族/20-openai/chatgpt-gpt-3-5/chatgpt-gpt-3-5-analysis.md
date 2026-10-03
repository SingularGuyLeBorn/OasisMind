源文是 OpenAI 2022 年的 ChatGPT 发布公告, 9 页里正文不到 6 页, 没有表, 没有评测分数.

| 条目 | 这页印的内容 |
|---|---|
| 发布 | November 30, 2022, 研究预览 (research preview), 期间免费 |
| 基座 | GPT-3.5 系列中的一个模型, early 2022 完成训练 |
| 兄弟 | InstructGPT, 同一套 RLHF 方法 |
| 训练流程 | SFT, 奖励模型, PPO, 迭代若干轮 |
| 算力 | Azure AI 超算基础设施, 无规模数 |
| 前代部署 | GPT-3, Codex |
| 安全名称 | Moderation API, ChatGPT Feedback Contest |
| 反馈奖励 | 最高 $500 API 额度, 参赛须满 18 岁 |
| 致谢 | 87 人 |
| 页脚后继名 | GPT-5.4, GPT-5.5, GPT-5.6, GPT-6, 只有导航名 |

## 1. 三条边: 基座, 兄弟, 前代

这页给 ChatGPT 挂了三种不同的关系. 基座是 「a model in the GPT-3.5 series」, 这是参数继承的边, ChatGPT 从它微调而来. 兄弟是 InstructGPT, 公告用的词是 sibling, 这是方法相同的边, 两者都走 RLHF. 前代是 GPT-3 和 Codex, 它们出现在 Iterative deployment 一节, 这是部署经验的边, 公告只说它们的部署教训影响了这次的缓解措施.

三条边不能混着读. InstructGPT 在这页不是 ChatGPT 的父模型, GPT-3 也没有被写成 GPT-3.5 的直接前身. 如果把 sibling 读成 「ChatGPT 从 InstructGPT 微调」, 就会把方法边当成参数边. 这页也没有交代 InstructGPT 自己的基座是什么, 所以 「兄弟」 只能读到方法这一层.

基座那条边上一个数都没有. 型号没写, 参数量没写, 预训练 token 数没写, 只给了一个 「early 2022」 的完成时间和一个指向 3.5 系列说明的链接. 本库 20-openai 下另有 instructgpt 和 gpt-3 两个目录, 这里不去借它们的数.

## 2. 数据收集的差异是这页唯一的新配方

公告说方法和 InstructGPT 相同, 差别只在 「data collection setup」. 把这句话摊开, SFT 阶段有三处不同: AI 训练员一人写双方对话, 既当用户也当助手; 训练员写回答时能看到模型写的建议; 新的对话数据和 InstructGPT 数据混合, 后者先改成对话格式. 这三处都指向同一件事, 就是把单轮指令数据换成多轮对话数据.

比较数据的来源也变了. 奖励模型的训练数据取自训练员和聊天机器人的真实对话, 从中随机挑一条模型写的消息, 再采样几条替代回答, 让训练员排序. 这样排序的对象是当前模型在对话里写出来的东西, 而不是另起一批静态提示. 公告没有用 on-policy 这个词, 这是按流程描述的推断.

「model-written suggestions」 这一条值得多看一眼. 训练员参考模型建议写示范, 意味着 SFT 数据里混进了模型自己的影子. 这页没有说建议来自哪个模型, 也没说训练员改动了多少. 数据量, 训练员人数, 两份数据的混合比例, 全都没有印.

## 3. 三步流程图怎么读

图分三栏. 第 1 步是 SFT: 从提示数据集取一条提示, 标注员示范期望输出, 用这些数据对 GPT-3.5 做监督微调. 第 2 步是奖励模型: 同一条提示采样几个输出, 标注员从好到差排序, 用排序训练 RM. 第 3 步是 PPO: PPO 模型从第 1 步的监督策略初始化, 策略生成输出, RM 打出奖励 r_k, 奖励经 PPO 回头更新策略.

图里的示例提示是 「Explain reinforcement learning to a 6 year old.」, 四个候选 A, B, C, D, 标注员给出 D > C > A > B. 一个 4 项的全排序能拆出 6 个两两比较 (4 选 2). 公告没说 RM 是按两两比较训练还是直接吃排序, 这个 6 只是从图上的排序数出来的. 正文对比较数据的下限是 「two or more」, 所以 4 是示意数, 不是固定配置.

第 3 步的示例提示换成了 「Write a story about otters.」, 策略写出 「Once upon a time...」. 图上 r_k 的下标 k 没有定义. 流程图配合正文的 「several iterations」 和复数的 「these reward models」 一起看, 比较像每轮重新收比较数据, 重训 RM, 再跑 PPO. 这只是读法, 轮数这页没有印.

## 4. 时间线: 从 early 2022 到 November 30, 2022

基座 「finished training in early 2022」. early 没有月份, 按 1 到 3 月算, 到 11 月 30 日发布隔了大约 8 到 11 个月. 这段时间里做了什么, 公告只交代了三步流程和多轮迭代, 没有分阶段的时间.

参考文献给了另一条时间线. 文献 1 是 Stiennon 等人 2020 年的 「Learning to summarize with human feedback」, 刊在 NeurIPS 33, 页码 3008-3021, 共 14 页. 文献 2 是 Gao, Schulman, Hilton 的 「Scaling Laws for Reward Model Overoptimization」, 编号 arXiv:2210.10760. 按 arXiv 编号的年月规则, 2210 对应 2022 年 10 月, 离发布大约 1 个月. 公告在解释啰嗦问题时引了这两篇, 说明过度优化在发布时是刚被写成论文的问题.

页面本身还有抓页时间的痕迹. 相关文章是 2024 年 3 月 8 日和 13 日的公司新闻, 页脚写 © 2015–2026, 导航列到 GPT-6. 文首那行粗体也说 ChatGPT 此后变化很大. 读这页要把 2022 年的正文和 2026 年前后的站点外壳分开.

## 5. 局限清单对应到训练流程的哪一段

Limitations 列了五条, 每条都能落到流程的某一段. 第一条是一本正经说错话, 公告给了三个原因: RL 训练没有事实来源, 对应第 3 步的奖励只来自 RM; 训得更谨慎就会拒答能答对的问题, 这是奖励设计上的取舍; 监督训练会误导模型, 因为示范的人知道的和模型知道的不一样, 对应第 1 步.

第三条啰嗦和滥用固定说法, 公告自己给了两个来源. 一是训练员偏爱看起来更全面的长回答, 这是第 2 步比较数据里的偏向. 二是过度优化, 也就是 PPO 把 RM 的偏好推过了头, 这里挂了文献 1 和 2. 两个来源一个在数据, 一个在优化, 叠在一起才出现 「反复声明自己是 OpenAI 训练的语言模型」 这种现象.

第二条措辞敏感和第四条不反问而是猜, 公告没有归因到具体阶段. 第五条是安全相关, 这里只记名称 Moderation API, 没有分数. 五条里没有一条给了发生率或评测数.

## 6. 两个示例说明了什么, 又没说明什么

Fix code 示例本身就踩中了第一条局限. 用户代码第二行已经是 defer close(resultWorkerErr), ChatGPT 却说这个 channel 从来没关, 还建议在发送后再 close 一次. 在 Go 里重复关闭 channel 会 panic. 建议那一行写成 close(resultworkerErr), 小写 w 和原变量名不一致, 照抄会报未定义. 公告没有评论这两处, 把它当正面示例放了出来.

Columbus 示例是全页唯一的 ChatGPT 和 InstructGPT 并排对比. ChatGPT 指出哥伦布 1506 年已去世, 再顺着假设往下写; InstructGPT 直接接受 「2015 年来美国」 的前提. 数字自洽: 2015 减 1492 是 523, 对上 「over 500 years ago」; 2015 减 1506 是 509. 这个对比对应开头说的 「challenge incorrect premises」.

两个示例都是定性的. 示例区还有 Home security, Fermat's Little Theorem, Neighbor introduction, Violent story, Bully John Doe 五个标签, 这页没展开. 整篇没有一张分数表, 「substantial reductions in harmful and untruthful outputs」 也没有百分比.

## 7. 部署与反馈: 只记名称

发布形态是研究预览, 期间免费, 入口 chatgpt.com. 安全机制只记名称: Moderation API, 以及界面里的外部内容过滤器. 公告请用户反馈有问题的输出, 以及过滤器的误报和漏报.

反馈活动名称是 ChatGPT Feedback Contest, 奖励最高 $500 API 额度, 脚注 A 写明参赛须年满 18 岁. 文献 3 交代了这个活动的灵感来源, 只记名称: Algorithmic Justice League 2022 年 1 月的 Bug Bounties For Algorithmic Harms, Brundage 等 2020 年 4 月的 Toward Trustworthy AI Development, HackerOne 的 Twitter Algorithmic Bias, Rubinovitz 2018 年 8 月的 Bias Bounty Programs. 这页没有任何漏洞分数.

## 8. 本页对不上的数和没印的数

对不上的地方: 示例代码已有 defer close, 回答却说没关; 建议里的 resultworkerErr 和 resultWorkerErr 大小写不同; Methods 先写单数 「a reward model」, 下一段变成复数 「these reward models」; 正文比较数据下限是 「two or more」, 图里是四个候选; 文献 3 有 「2021b」, 本页没有 2021a. 源 Markdown 和 PDF 之间也有出入: Markdown 页脚只剩 GPT-6 和 GPT-5.4, PDF 是 GPT-6, GPT-5.6, GPT-5.5, GPT-5.4; Markdown 致谢从 「Uribe」 开始, 丢了前 6 人; Markdown 把上标 3 和 A 挤成 「submitted3 A」, 把 「1, 2」 放在正确位置, 而 PDF 抽出的文字把它们放到了别处.

没印的数: 基座参数量, 预训练 token 数, SFT 数据量, 比较数据量, 训练员人数, 数据混合比例, 迭代轮数, Azure 算力规模, 任何评测分数. 这页能用的硬数只有日期 (November 30, 2022, early 2022), 示例里的年份 (1492, 1506, 2015), 奖励 ($500, 18 岁), 文献卷号页码和 87 人的致谢名单.
