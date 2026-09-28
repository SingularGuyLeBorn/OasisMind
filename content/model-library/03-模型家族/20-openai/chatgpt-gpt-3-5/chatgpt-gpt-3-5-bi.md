<!-- page 1 of 9 -->

# Introducing ChatGPT (介绍 ChatGPT)

这是 OpenAI 官网 ChatGPT 发布公告的抓页, 共 9 页, 8 张图. 正文在第 1 到第 6 页, 第 7 页是脚注和参考文献, 第 8 页是致谢名单和相关文章, 第 9 页是站点页脚. 转出的 Markdown 缺了几段, 这里按 PDF 原文补齐.

OpenAI. **November 30, 2022.** Product. Try ChatGPT. Try ChatGPT for Work.

页头是 OpenAI 标志, 日期 **November 30, 2022**, 分类 Product. 下面两个按钮: Try ChatGPT (试用 ChatGPT) 和 Try ChatGPT for Work (工作版 ChatGPT).

**This post introduced ChatGPT in 2022. ChatGPT has evolved substantially since then.**

**这篇文章是 2022 年介绍 ChatGPT 时发的. 此后 ChatGPT 变化很大.**

Looking for more about ChatGPT: Release notes. Share.

想了解更多 ChatGPT, 可以看 Release notes (发布说明). 旁边是 Share (分享) 按钮.

We've trained a model called ChatGPT which interacts in a conversational way. The dialogue format makes it possible for ChatGPT to answer followup questions, admit its mistakes, challenge incorrect premises, and reject inappropriate requests.

我们训练了一个叫 ChatGPT 的模型, 它用对话的方式和人交互. 有了对话形式, ChatGPT 可以回答追问, 承认自己的错误, 质疑不成立的前提, 拒绝不恰当的请求.

> **想:** November 30, 2022 是发布日, 那页脚的 © 2015–2026 和导航里的 GPT-6 算什么?
> 发布日按标题旁的 November 30, 2022 读. 页脚, 相关文章 (2024 年 3 月) 和导航都是抓页当时的站点内容, 和这篇公告不是同一个时间, 文首那行粗体提示也承认了这一点.

ChatGPT is a sibling model to InstructGPT, which is trained to follow an instruction in a prompt and provide a detailed response.

ChatGPT 是 InstructGPT 的兄弟模型. InstructGPT 的训练目标是遵循提示里的一条指令, 给出详细的回答.

> **问:** 「sibling model」 是说 ChatGPT 从 InstructGPT 微调而来吗?
> 这页没这么说. Methods 一节写的是两者用同一套方法, ChatGPT 从 GPT-3.5 系列里的一个模型微调而来, 所以这里的兄弟更接近同一套方法做出的并列模型, 不是父子关系.

<!-- page 2 of 9 -->

We are excited to introduce ChatGPT to get users' feedback and learn about its strengths and weaknesses. During the research preview, usage of ChatGPT is free. Try it now at chatgpt.com.

我们推出 ChatGPT, 是想听用户反馈, 弄清它强在哪里, 弱在哪里. 研究预览期间 ChatGPT 免费使用. 现在就可以去 chatgpt.com 试.

## Samples (示例)

Fix code. Home security. Fermat's Little Theorem. Neighbor introduction.

示例区有四个标签: Fix code (修代码), Home security (家庭安防), Fermat's Little Theorem (费马小定理), Neighbor introduction (介绍邻居).

> **核对:** 四个标签都有对话内容吗?
> 只有 Fix code 展开了. PDF 里四个标签印了两遍, 像是宽屏和窄屏两套控件, 其余三个标签的对话这页没有印出来.

**User.** this code is not working like i expect — how do i fix it?

**用户.** 这段代码没按我预期的那样跑, 怎么修?

```txt
resultWorkerErr := make(chan error)
defer close(resultWorkerErr)
go func() {
    defer cancel()
    resultWorkerErr <- b.resultWorker(ctx)
}()
err := b.worker(ctx)
cancel()
if err == nil {
    return <-resultWorkerErr
}
return multierror.Append(err, <-resultWorkerErr)
```

用户贴的是一段 Go 代码, 原样保留.

**ChatGPT.** It's difficult to say what's wrong with the code without more context. Can you provide more information about what the code is supposed to do and what isn't working as expected? Also, is this the entire code or just a part of it?

**ChatGPT.** 没有更多上下文, 很难说这段代码哪里出了问题. 能不能多讲讲这段代码本来要做什么, 哪里和预期不一样? 另外, 这是完整代码, 还是只是其中一段?

<!-- page 3 of 9 -->

**User.** just part of it — the error never surfaces. I think there is something wrong with the channel

**用户.** 只是一部分. 错误一直冒不出来. 我觉得是 channel 有问题.

**ChatGPT.** It's difficult to say without more information about what the code is supposed to do and what's happening when it's executed. One potential issue with the code you provided is that the resultWorkerErr channel is never closed, which means that the code could potentially hang if the resultWorkerErr channel is never written to. This could happen if b.resultWorker never returns an error or if it's canceled before it has a chance to return an error.

**ChatGPT.** 不知道这段代码本来要做什么, 执行时发生了什么, 很难下结论. 你给的代码有一个可能的问题: resultWorkerErr 这个 channel 从来没有关闭. 这意味着如果 resultWorkerErr 一直没人写入, 代码可能会卡住. 如果 b.resultWorker 从不返回错误, 或者它还没来得及返回错误就被取消了, 就会出现这种情况.

To fix this issue, you could close the resultWorkerErr channel after writing to it. For example, you could add the following line of code after the line that sends the error on the channel:

要修这个问题, 可以在写入 resultWorkerErr 之后把它关掉. 比如在往 channel 发送错误的那一行后面加上这一行:

```txt
close(resultworkerErr)
```

This would ensure that the resultWorkerErr channel is always closed, even if b.resultWorker never returns an error. Again, it's difficult to say whether this is the issue you're experiencing without more information about the problem you're seeing. Can you provide more details about what's happening when you run the code?

这样就能保证 resultWorkerErr 一定会被关闭, 即使 b.resultWorker 从不返回错误. 还是那句话, 不了解你遇到的具体现象, 很难说是不是这个原因. 能不能再讲讲运行代码时发生了什么?

> **看表:** 用户代码第二行就是 defer close(resultWorkerErr), ChatGPT 为什么说这个 channel 从来没关?
> 这句诊断和贴出的代码对不上. defer 会在函数返回时关闭它. 如果再按建议在发送后加一次 close, Go 里重复关闭 channel 会 panic. 公告没有评论这一点, 这个示例本身正好是后文 「plausible-sounding but incorrect」 的样子.

> **拆开:** 建议里写的 close(resultworkerErr) 和变量名 resultWorkerErr 是同一个吗?
> 大小写不一样, w 是小写. Go 的标识符区分大小写, 照抄这一行会报未定义. PDF 渲染图和抽出的文字都是小写 w, 不是转写错误.

## Methods (方法)

We trained this model using Reinforcement Learning from Human Feedback (RLHF), using the same methods as InstructGPT, but with slight differences in the data collection setup. We trained an initial model using supervised fine-tuning: human AI trainers provided conversations in which they played both sides—the user and an AI assistant. We gave the trainers access to model-written suggestions to help them compose their responses. We mixed this new dialogue dataset with the InstructGPT dataset, which we transformed into a dialogue format.

我们用 RLHF (基于人类反馈的强化学习) 训练这个模型, 方法和 InstructGPT 相同, 只是数据收集的设置略有不同. 先用监督微调 (SFT) 训练一个初始模型: 人类 AI 训练员自己写对话, 一人分饰两角, 既当用户也当 AI 助手. 我们让训练员能看到模型写的建议, 帮他们组织回答. 这份新的对话数据集再和 InstructGPT 的数据集混在一起, 后者先被改写成对话格式.

> **确认:** 「slight differences in the data collection setup」 具体差在哪里?
> 这页能读出四处: 训练员一人写双方, 训练员能参考模型写的建议, InstructGPT 数据被改成对话格式后混入, 比较数据取自训练员和聊天机器人的对话. 数据量, 训练员人数, 混合比例一个数也没印.

To create a reward model for reinforcement learning, we needed to collect comparison data, which consisted of two or more model responses ranked by quality. To collect this data, we took conversations that AI trainers had with the chatbot. We randomly selected a model-written message, sampled several alternative completions, and had AI trainers rank them.

为了给强化学习造一个奖励模型, 我们需要收集比较数据, 也就是两个或更多按质量排好序的模型回答. 收集办法是: 拿 AI 训练员和聊天机器人的对话, 随机挑一条模型写的消息, 再采样几条替代回答, 让 AI 训练员排序.

> **回看:** 正文说 「two or more」, 图里却是四个候选 A, B, C, D, 每次到底排几个?
> 这页没给固定数. 正文只限定下限是两个, 图里的四个是示意. 「several alternative completions」 也没有写具体条数.

<!-- page 4 of 9 -->

Using these reward models, we can fine-tune the model using Proximal Policy Optimization. We performed several iterations of this process.

有了这些奖励模型, 就可以用近端策略优化 (PPO) 微调模型. 这个过程我们迭代了好几轮.

> **停一下:** 上一段写 「a reward model」 是单数, 这里变成 「these reward models」 复数, 哪个对?
> 结合 「several iterations」 读, 可能是每轮迭代各训一个奖励模型. 这页没有明说, 迭代轮数也没印.

下面是一张三栏流程图, 转出时拆成了五张图. 文字取自图中标注.

**Step 1.** Collect demonstration data and train a supervised policy. A prompt is sample from our prompt dataset. A labeler demonstrates the desired output behavior. This data is used to fine-tune GPT-3.5 with supervised learning.

**第 1 步.** 收集示范数据, 训练监督策略. 从提示数据集里采样一条提示. 标注员示范期望的输出. 这些数据用来对 GPT-3.5 做监督微调.

![第 1 步示意: 提示 "Explain reinforcement learning to a 6 year old." 由标注员写出示范回答, 再送去做 SFT](images/p04-a-prompt-and-several-model-outputs-are-sampled.png)

**Step 2.** Collect comparison data and train a reward model. A prompt and several model outputs are sampled.

**第 2 步.** 收集比较数据, 训练奖励模型. 先采样一条提示和几个模型输出.

![第 2 步采样: 同一条提示下的四个候选回答 A, B, C, D](images/p04-a-new-prompt-is-sampled-from-the-dataset.png)

A labeler ranks the outputs from best to worst.

标注员把这些输出从好到差排序.

![第 2 步排序: 标注员给出的顺序是 D > C > A > B](images/p04-this-data-is-used-to-train-our-reward-model.png)

This data is used to train our reward model.

这些排序数据用来训练奖励模型.

![第 2 步训练: 排序 D > C > A > B 输入奖励模型 RM](images/p04-the-reward-model-calculates-a-reward-for-the-output.png)

**Step 3.** Optimize a policy against the reward model using the PPO reinforcement learning algorithm. A new prompt is sampled from the dataset. The PPO model is initialized from the supervised policy. The policy generates an output. The reward model calculates a reward for the output. The reward is used to update the policy using PPO.

**第 3 步.** 用 PPO 强化学习算法, 以奖励模型为目标优化策略. 从数据集里采样一条新提示. PPO 模型从第 1 步的监督策略初始化. 策略生成一个输出. 奖励模型给这个输出算一个奖励. 奖励再经 PPO 用来更新策略.

![第 3 步循环: 提示 "Write a story about otters." 经 PPO 策略写出 "Once upon a time...", RM 算出奖励 r_k 后回传更新策略](images/p04-once-upon-a-time.png)

> **再看:** 图里写 「fine-tune GPT-3.5」, 具体是哪个模型, 多大?
> 这页只说 「a model in the GPT-3.5 series」, 没有型号, 没有参数量, 也没有 token 数. 图里的 r_k 也没有定义下标 k.

> **对一下:** 五张图的文件名和图里内容对得上吗?
> 对不上. 文件名 a-prompt-and-several-model-outputs-are-sampled 实际是第 1 步整栏, a-new-prompt-is-sampled-from-the-dataset 实际是第 2 步的四个候选. 文件名取自相邻的 OCR 文字, 这里按图的内容写说明.

ChatGPT is fine-tuned from a model in the GPT-3.5 series, which finished training in early 2022. You can learn more about the 3.5 series here. ChatGPT and GPT-3.5 were trained on an Azure AI supercomputing infrastructure.

ChatGPT 是从 GPT-3.5 系列中的一个模型微调来的, 那个模型在 2022 年初完成训练. 3.5 系列的更多信息见这里的链接. ChatGPT 和 GPT-3.5 都是在 Azure AI 超算基础设施上训练的.

> **想:** 「early 2022」 到发布日 November 30, 2022 隔了多久?
> 「early」 没有月份, 按 1 到 3 月算大约 8 到 11 个月 (估算). 这段时间里做了哪些事, 这页只交代了上面三步和多轮迭代.

## Limitations (局限)

ChatGPT sometimes writes plausible-sounding but incorrect or nonsensical answers. Fixing this issue is challenging, as: (1) during RL training, there's currently no source of truth; (2) training the model to be more cautious causes it to decline questions that it can answer correctly; and (3) supervised training misleads the model because the ideal answer depends on what the model knows, rather than what the human demonstrator knows.

ChatGPT 有时会写出听起来有道理, 实际上错误或荒谬的回答. 这个问题不好修, 原因有三: 第一, RL 训练时目前没有事实来源可对照; 第二, 把模型训得更谨慎, 它会拒答本来能答对的问题; 第三, 监督训练会误导模型, 因为理想答案取决于模型知道什么, 而不是示范的人知道什么.

> **问:** 第三条为什么说监督训练会 「mislead」 模型?
> 按原文的逻辑, 示范答案反映的是写示范的人掌握的知识. 人知道而模型不知道时, 模型学到的是照着编. 这页只给了这句话, 没有例子.

<!-- page 5 of 9 -->

ChatGPT is sensitive to tweaks to the input phrasing or attempting the same prompt multiple times. For example, given one phrasing of a question, the model can claim to not know the answer, but given a slight rephrase, can answer correctly.

ChatGPT 对输入措辞的微调很敏感, 同一个提示多试几次结果也会不同. 比如一个问题换一种问法, 模型可能说不知道, 稍微改写一下又能答对.

The model is often excessively verbose and overuses certain phrases, such as restating that it's a language model trained by OpenAI. These issues arise from biases in the training data (trainers prefer longer answers that look more comprehensive) and well-known over-optimization issues.[1, 2]

模型经常啰嗦, 还会滥用某些说法, 比如反复声明自己是 OpenAI 训练的语言模型. 这些问题来自训练数据里的偏向 (训练员偏爱看起来更全面的长回答), 以及众所周知的过度优化问题.[1, 2]

> **核对:** 脚注 1, 2 挂在哪一句后面?
> 挂在 over-optimization issues 后面. PDF 抽出的文字把 「1, 2」 放到了迭代部署那段之后, 渲染图上它是上标, 紧跟这句. 两条文献分别是 Stiennon 等 2020 和 Gao 等 2022.

Ideally, the model would ask clarifying questions when the user provided an ambiguous query. Instead, our current models usually guess what the user intended.

理想情况下, 用户的问题含糊时, 模型应该反问澄清. 但现在的模型通常直接猜用户的意图.

While we've made efforts to make the model refuse inappropriate requests, it will sometimes respond to harmful instructions or exhibit biased behavior. We're using the Moderation API to warn or block certain types of unsafe content, but we expect it to have some false negatives and positives for now. We're eager to collect user feedback to aid our ongoing work to improve this system.

安全相关只记名称: Moderation API (内容审核接口). 这一条没有分数.

## Iterative deployment (迭代部署)

Today's research release of ChatGPT is the latest step in OpenAI's iterative deployment of increasingly safe and useful AI systems. Many lessons from deployment of earlier models like GPT-3 and Codex have informed the safety mitigations in place for this release, including substantial reductions in harmful and untruthful outputs achieved by the use of reinforcement learning from human feedback (RLHF).

今天发布的 ChatGPT 研究版, 是 OpenAI 迭代部署路线上最新的一步, 目标是越来越安全, 越来越有用的 AI 系统. 早先部署 GPT-3 和 Codex 的许多经验, 都用在了这次发布的缓解措施里, 其中包括借助 RLHF 大幅减少了有害和不真实的输出.

> **看表:** 「substantial reductions」 减少了多少?
> 这页没有分数, 也没有百分比. 前代模型只点了 GPT-3 和 Codex 两个名字.

Christopher Columbus. Violent story. Bully John Doe.

对比示例区有三个标签: Christopher Columbus (哥伦布), Violent story (暴力故事), Bully John Doe (霸凌 John Doe). 后两个只留名称, 这页只展开了第一个.

<!-- page 6 of 9 -->

**User.** Tell me about when Christopher Columbus came to the US in 2015

**用户.** 讲讲哥伦布 2015 年来美国的事.

**ChatGPT.** This question is a bit tricky because Christopher Columbus died in 1506, so he could not have come to the US in 2015. But let's pretend for a moment that he did!

**ChatGPT.** 这个问题有点刁钻, 因为哥伦布 1506 年就去世了, 不可能 2015 年来美国. 不过我们暂且假装他来了!

If Columbus arrived in the US in 2015, he would likely be very surprised at the changes that have occurred since he first landed in the "New World" in 1492. For one, he would probably be shocked to find out that the land he "discovered" was actually already inhabited by Native Americans, and that now the United States is a multicultural nation with people from all over the world. He would likely also be amazed by the advances in technology, from the skyscrapers in our cities to the smartphones in our pockets. Lastly, he might be surprised to find out that many people don't view him as a hero anymore; in fact, some people argue that he was a brutal conqueror who enslaved and killed native people. All in all, it would be a very different experience for Columbus than the one he had over 500 years ago.

如果哥伦布 2015 年到了美国, 他多半会对 1492 年首次登上 「新大陆」 以来的变化大吃一惊. 首先, 他可能会震惊地发现, 他 「发现」 的土地早就住着美洲原住民, 而如今的美国是一个多元文化国家, 人来自世界各地. 他大概也会惊叹于技术进步, 从城市里的摩天大楼到口袋里的智能手机. 最后, 他可能会意外地发现, 很多人已经不把他当英雄了, 甚至有人说他是奴役和杀害原住民的残暴征服者. 总之, 这和他 500 多年前的经历会完全不同.

**InstructGPT.** Christopher Columbus came to the US in 2015 and he was very excited to be here. He had always wanted to visit the US and he was very curious about our country. He was very impressed with our country and he enjoyed his time here.

**InstructGPT.** 哥伦布 2015 年来到美国, 他很兴奋. 他一直想来美国看看, 对我们的国家很好奇. 他对我们的国家印象深刻, 在这里过得很愉快.

> **拆开:** 1506, 1492, 2015 和 「over 500 years ago」 这几个数对得上吗?
> 对得上. 2015 减 1492 等于 523 (估算), 符合 「500 多年前」. 2015 减 1506 等于 509 (估算), 说明 ChatGPT 抓住了错误前提, InstructGPT 则顺着前提编了下去.

We know that many limitations remain as discussed above and we plan to make regular model updates to improve in such areas. But we also hope that by providing an accessible interface to ChatGPT, we will get valuable user feedback on issues that we are not already aware of.

我们知道上面说的许多局限还在, 计划定期更新模型, 在这些方面改进. 同时也希望通过一个人人能用的 ChatGPT 界面, 收集到有价值的用户反馈, 找出我们还没意识到的问题.

Users are encouraged to provide feedback on problematic model outputs through the UI, as well as on false positives/negatives from the external content filter which is also part of the interface. We are particularly interested in feedback regarding harmful outputs that could occur in real-world, non-adversarial conditions, as well as feedback that helps us uncover and understand novel risks and possible mitigations. You can choose to enter the ChatGPT Feedback Contest[3] for a chance to win up to $500 in API credits.[A] Entries can be submitted via the feedback form that is linked in the ChatGPT interface.

鼓励用户通过界面反馈有问题的模型输出, 也可以反馈外部内容过滤器的误报和漏报, 这个过滤器同样是界面的一部分. 反馈活动名称是 ChatGPT Feedback Contest (ChatGPT 反馈竞赛)[3], 奖励最高 $500 的 API 额度.[A] 通过 ChatGPT 界面里链接的反馈表提交.

> **确认:** 上标 3 和 A 分别挂在哪?
> 转出的 Markdown 把两者挤成了 「submitted3 A」. 渲染图上 3 跟在 Feedback Contest 后面, 指向参考文献 3; A 跟在 API credits 后面, 指向脚注 A 的参赛条件.

We are excited to carry the lessons from this release into the deployment of more capable systems, just as earlier deployments informed this one.

我们期待把这次发布的经验带到更强系统的部署中去, 就像以前的部署为这次提供了经验一样.

<!-- page 7 of 9 -->

ChatGPT. 2022.

文章标签: ChatGPT, 2022.

## Footnotes (脚注)

**A.** No purchase necessary, void where prohibited. Must be at least 18 to enter. For contest details, see the Official Rules.

**A.** 无需购买, 法律禁止的地区无效. 参赛者须年满 18 岁. 竞赛细节见 Official Rules (官方规则).

## References

1 Stiennon, Nisan, et al. "Learning to summarize with human feedback." Advances in Neural Information Processing Systems 33 (2020): 3008-3021.

2 Gao, Leo, John Schulman, and Jacob Hilton. "Scaling Laws for Reward Model Overoptimization." arXiv preprint arXiv:2210.10760 (2022).

3 The inspiration for this contest comes in part from work by Kenway, Josh, Camille François, Sasha Costanza-Chock, Inioluwa Deborah Raji, and Joy Buolamwini. Bug Bounties For Algorithmic Harms? Lessons from Cybersecurity Vulnerability Disclosure for Algorithmic Harms Discovery, Disclosure, and Redress. Washington, DC: Algorithmic Justice League. January 2022. Available at https://ajl.org/bugs. See also work by Brundage, Miles, Avin, Shahar, Wang, Jasmine, Belfield, Haydn, and Gretchen Krueger et al. "Toward Trustworthy AI Development: Mechanisms for Supporting Verifiable Claims," April 2020. Available at https://arxiv.org/abs/2004.07213. See an earlier instance of such a competition at HackerOne. 2021b. "Twitter Algorithmic Bias." HackerOne. https://hackerone.com/twitter-algorithmic-bias?type=team. Finally, see early published work on this topic from Rubinovitz, JB, "Bias Bounty Programs as a Method of Combatting Bias in AI," August 2018. Available at https://rubinovitz.com/2018/08/01/bias-bounty-programs-as-a-method-of-combatting.

> **回看:** 文献 3 里的 「2021b」 有对应的 2021a 吗?
> 这页没有. 带 b 后缀像是从另一份参考文献表里整段搬来的写法, 本页只有这一处 HackerOne 条目.

**Author.** OpenAI

**作者.** OpenAI

<!-- page 8 of 9 -->

## Acknowledgments (致谢)

John Schulman, Barret Zoph, Christina Kim, Jacob Hilton, Jacob Menick, Jiayi Weng, Juan Felipe Ceron Uribe, Liam Fedus, Luke Metz, Michael Pokorny, Rapha Gontijo Lopes, Shengjia Zhao, Arun Vijayvergiya, Eric Sigler, Adam Perelman, Chelsea Voss, Mike Heaton, Joel Parish, Dave Cummings, Rajeev Nayak, Valerie Balcom, David Schnurr, Tomer Kaftan, Chris Hallacy, Nicholas Turley, Noah Deutsch, Vik Goel, Jonathan Ward, Aris Konstantinidis, Wojciech Zaremba, Long Ouyang, Leonard Bogdonoff, Joshua Gross, David Medina, Sarah Yoo, Teddy Lee, Ryan Lowe, Dan Mossing, Joost Huizinga, Roger Jiang, Carroll Wainwright, Diogo Almeida, Steph Lin, Marvin Zhang, Kai Xiao, Katarina Slama, Steven Bills, Alex Gray, Jan Leike, Jakub Pachocki, Phil Tillet, Shantanu Jain, Greg Brockman, Nick Ryder, Alex Paino, Qiming Yuan, Clemens Winter, Ben Wang, Mo Bavarian, Igor Babuschkin, Szymon Sidor, Ingmar Kanitscheider, Mikhail Pavlov, Matthias Plappert, Nik Tezak, Heewoo Jun, William Zhuk, Vitchyr Pong, Lukasz Kaiser, Jerry Tworek, Andrew Carr, Lilian Weng, Sandhini Agarwal, Karl Cobbe, Vineet Kosaraju, Alethea Power, Stanislas Polu, Jesse Han, Raul Puri, Shawn Jain, Benjamin Chess, Christian Gibson, Oleg Boiko, Emy Parparita, Amin Tootoonchian, Kyle Kosic, Christopher Hesse

致谢名单共 87 人, 按原文顺序列出, 人名不译.

> **停一下:** 转出的 Markdown 为什么从 「Uribe」 开始?
> 抓页时丢了开头的 Acknowledgments 标题和前 6 个名字, 第 7 个 Juan Felipe Ceron Uribe 被截得只剩 Uribe. 这里按 PDF 补齐, 数过是 87 个逗号分隔的人名.

## Related articles (相关文章)

![相关文章配图: 蓝绿色块拼成的抽象画, 对应 Le Monde 和 Prisa Media 新闻合作](images/p08-global-news-partnerships-le-monde-and-prisa-media-https.png)

Global news partnerships: Le Monde and Prisa Media. Company, Mar 13, 2024.

全球新闻合作: Le Monde 和 Prisa Media. 分类 Company, 2024 年 3 月 13 日.

![相关文章配图: 粉橙绿色的模糊渐变, 对应审查结束一文](images/p08-review-completed-altman-brockman-to-continue-to-lead.png)

Review completed & Altman, Brockman to continue to lead OpenAI. Company, Mar 8, 2024.

审查完成, Altman 和 Brockman 继续领导 OpenAI. 分类 Company, 2024 年 3 月 8 日.

![相关文章配图: 米色底上的粉色和深绿模糊渐变, 对应董事会新成员一文](images/p08-openai-announces-new-members-to-board-of-directors.png)

OpenAI announces new members to board of directors. Company, Mar 8, 2024. View all.

OpenAI 宣布董事会新成员. 分类 Company, 2024 年 3 月 8 日. 右上角是 View all (查看全部).

> **再看:** 这三篇相关文章和 ChatGPT 发布有关吗?
> 没有直接关系. 它们都是 2024 年 3 月的公司新闻, 是抓页时站点自动推荐的, 三张图也只是装饰配图, 没有数据.

<!-- page 9 of 9 -->

Research: Research Index, Research Overview, Economic Research. Latest Advancements: GPT-6, GPT-5.6, GPT-5.5, GPT-5.4. Safety: Safety Approach, Deployment Safety, Security & Privacy, Trust & Transparency. Products: ChatGPT, ChatGPT Business, ChatGPT Enterprise, ChatGPT for Education, Codex, Release Notes. API Platform: Overview, API Log In, Docs. Business: Overview, Solutions, Resources, Plugins, Customer Stories, Partner Network, Contact Sales. Developers: Apps SDK, Open Models, Docs, Resources, Developer Forum. Company: About Us, Our Charter, Careers, News. Support: Help Center. More: Stories, Academy, Supply Co., Livestreams, Podcast, RSS. Terms & Policies: Terms of Use, Privacy Policy, Other Policies. OpenAI © 2015–2026. Manage Cookies. English United States.

第 9 页是站点页脚. 导航分 Research (研究), Latest Advancements (最新进展), Safety (安全), Products (产品), API Platform, Business (企业), Developers (开发者), Company (公司), Support (支持), More (更多), Terms & Policies (条款与政策) 几栏. 最新进展一栏列了 GPT-6, GPT-5.6, GPT-5.5, GPT-5.4. 底部是 OpenAI © 2015–2026, Manage Cookies (管理 Cookie) 和语言选项 English United States.

> **对一下:** 页脚里的模型名单, Markdown 和 PDF 一致吗?
> 不一致. 转出的 Markdown 只剩 GPT-6 和 GPT-5.4, PDF 抽出的文字是 GPT-6, GPT-5.6, GPT-5.5, GPT-5.4 四个. 这里按 PDF 写. 这些都是抓页时的导航链接, 页面没有印它们的任何参数.
