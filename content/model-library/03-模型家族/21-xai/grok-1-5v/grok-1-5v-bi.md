<!-- page 1 of 10 -->

[Back to news](https://x.ai/news)

[返回新闻](https://x.ai/news)

Apr 12, 2024

2024 年 4 月 12 日

# Grok-1.5 Vision Preview (Grok-1.5 Vision 预览)

Connecting the digital and physical worlds with our first multimodal model.

用我们的第一个多模态模型连接数字世界与物理世界.

Introducing Grok-1.5V, our first-generation multimodal model. In addition to its strong text capabilities, Grok can now process a wide variety of visual information, including documents, diagrams, charts, screenshots, and photographs. Grok-1.5V will be available soon to our early testers and existing Grok users.

推出 Grok-1.5V, 我们的第一代多模态模型. 除了强大的文本能力, Grok 现在还能处理多种视觉信息, 包括文档, 示意图, 统计图, 截图和照片. Grok-1.5V 很快会向我们的早期测试者和现有 Grok 用户开放.

## Capabilities (能力)

Grok-1.5V is competitive with existing frontier multimodal models in a number of domains, ranging from multi-disciplinary reasoning to understanding documents, science diagrams, charts, screenshots, and photographs. We are particularly excited about Grok’s capabilities in understanding our physical world. Grok outperforms its peers in our new RealWorldQA benchmark that measures real-world spatial understanding. For all datasets below, we evaluate Grok in a zero-shot setting without chain-of-thought prompting.

Grok-1.5V 在多个领域可以与现有的前沿多模态模型相竞争, 覆盖从多学科推理到理解文档, 科学示意图, 统计图, 截图和照片. 我们对 Grok 理解物理世界的能力尤其兴奋. 在我们新推出的, 衡量真实世界空间理解的 RealWorldQA 基准上, Grok 超过了同类模型. 下面所有数据集上, 我们都以零样本 (zero-shot) 设置评测 Grok, 不使用 CoT 提示.

> **想:**「zero-shot ... without chain-of-thought prompting」只交代了 Grok 的设置, 表里另外四家的分数也是这么测的吗?
> 本页没交代. 句子主语是「we evaluate Grok」, 对手四列没有标来源, 也没说是 xAI 重跑还是抄各家公开报告. 各家报告的提示方式和样本数未必一致, 所以同一行的差距里可能混着设置差异, 本页拆不开. RealWorldQA 是当天才发布的基准, 那一行对手分数只能是 xAI 自己跑的, 但提示词和 API 版本同样没写.

| Benchmark | Grok-1.5V | GPT-4V | Claude 3 Sonnet | Claude 3 Opus | Gemini Pro 1.5 |
| --- | --- | --- | --- | --- | --- |
| MMMU | 53.6% | 56.8% | 53.1% | 59.4% | 58.5% |
| Multi-discipline |  |  |  |  |  |

| 基准 | Grok-1.5V | GPT-4V | Claude 3 Sonnet | Claude 3 Opus | Gemini Pro 1.5 |
| --- | --- | --- | --- | --- | --- |
| MMMU | 53.6% | 56.8% | 53.1% | 59.4% | 58.5% |
| 多学科 |  |  |  |  |  |

> **问:** MMMU 这一行 Grok-1.5V 的 53.6% 排第几? 下面「Multi-discipline」那行全空, 是缺数据吗?
> 五家里排第 4: Claude 3 Opus 59.4%, Gemini Pro 1.5 58.5%, GPT-4V 56.8%, 然后才是 Grok 53.6%, 只比 Claude 3 Sonnet 的 53.1% 高 0.5 个点, 比第一名低 5.8 个点.「Multi-discipline」那行不是缺数据, 是网页上写在基准名下方的类别小字, MinerU 把它拆成了独立一行. 第 2 页的 Math, Diagrams, Text reading 等同理.

<!-- page 2 of 10 -->

| Benchmark | Grok-1.5V | GPT-4V | Claude 3 Sonnet | Claude 3 Opus | Gemini Pro 1.5 |
| --- | --- | --- | --- | --- | --- |
| Mathvista | 52.8% | 49.9% | 47.9% | 50.5% | 52.1% |
| Math |  |  |  |  |  |
| AI2D | 88.3% | 78.2% | 88.7% | 88.1% | 80.3% |
| Diagrams |  |  |  |  |  |
| TextVQA | 78.1% | 78.0% | - | - | 73.5% |
| Text reading |  |  |  |  |  |
| ChartQA | 76.1% | 78.5% | 81.1% | 80.8% | 81.3% |
| Charts |  |  |  |  |  |
| DocVQA | 85.6% | 88.4% | 89.5% | 89.3% | 86.5% |
| Documents |  |  |  |  |  |
| RealWorldQA | 68.7% | 61.4% | 51.9% | 49.8% | 67.5% |
| Real-world understanding |  |  |  |  |  |

| 基准 | Grok-1.5V | GPT-4V | Claude 3 Sonnet | Claude 3 Opus | Gemini Pro 1.5 |
| --- | --- | --- | --- | --- | --- |
| Mathvista | 52.8% | 49.9% | 47.9% | 50.5% | 52.1% |
| 数学 |  |  |  |  |  |
| AI2D | 88.3% | 78.2% | 88.7% | 88.1% | 80.3% |
| 示意图 |  |  |  |  |  |
| TextVQA | 78.1% | 78.0% | - | - | 73.5% |
| 文字识读 |  |  |  |  |  |
| ChartQA | 76.1% | 78.5% | 81.1% | 80.8% | 81.3% |
| 统计图 |  |  |  |  |  |
| DocVQA | 85.6% | 88.4% | 89.5% | 89.3% | 86.5% |
| 文档 |  |  |  |  |  |
| RealWorldQA | 68.7% | 61.4% | 51.9% | 49.8% | 67.5% |
| 真实世界理解 |  |  |  |  |  |

> **核对:** TextVQA 行两家 Claude 是「-」, Grok 78.1% 对 GPT-4V 78.0% 算领先吗?
>「-」表示没有分数, 不是 0 分; 本页没说是 Anthropic 没报, 还是 xAI 没测. 所以 TextVQA 实际只有三家可比. Grok 比 GPT-4V 高 0.1 个点, 本页没给题量和方差, 这点差距分不出高下, 只能记为持平.

> **看表:** 正文说「competitive ... in a number of domains」, 7 项里 Grok-1.5V 拿第一的有几项?
> 3 项: Mathvista 52.8% (比 Gemini Pro 1.5 高 0.7 个点), TextVQA 78.1% (高 0.1), RealWorldQA 68.7% (高 1.2). AI2D 88.3% 排第 2, 比 Claude 3 Sonnet 的 88.7% 低 0.4. 反过来, ChartQA 76.1% 和 DocVQA 85.6% 都是五家最低, 分别比最高分低 5.2 和 3.9 个点; MMMU 排第 4. 表里的「competitive」主要落在数学和真实场景, 统计图和文档是短板.

> **拆开:** DocVQA 和 ChartQA 两行的「%」是同一种准确率吗?
> 本页没说指标. DocVQA 常用的评分是 ANLS, 按编辑距离给部分分; ChartQA 常用 relaxed accuracy, 数值答案允许 5% 误差. 表格一律写成百分数, 看不出每行用的是哪一种, 也看不出五家是否用同一套打分脚本. 这两行 3.9 和 5.2 个点的差距, 有多少来自评分口径, 本页无从判断.

> **确认:** RealWorldQA 上 Grok 68.7% 对 Gemini Pro 1.5 67.5%, 1.2 个点够说「outperforms its peers」吗?
> 按第 8 页「over 700 images」且每图一题算, 1.2 个点约等于 8 道题. 以 700 题, 正确率 0.687 估二项分布的标准误, sqrt(0.687 x 0.313 / 700) 约 0.0175, 即 1.75 个点, 1.2 个点落在一个标准误以内. 对 GPT-4V (61.4%) 的 7.3 个点, 对两家 Claude (51.9%, 49.8%) 的 16.8 和 18.9 个点才算明显差距. 本页没给置信区间, 也没说是否多次采样取平均.

Example Writing code from a diagram

示例 根据示意图写代码

<!-- page 3 of 10 -->

User

用户

![Image block](images/p03-can-you-translate-this-into-python-code.png)

> **回看:** 这张图画了什么, 流程图里给没给随机数的范围?
> 是一块白板的照片, 手绘六个图形: 顶部淡化的「start」, 矩形「target = random()」, 平行四边形「Read guess」, 菱形判断「target == guess」, True 分支矩形 print「you won!」, False 分支矩形 print「Wrong guess, try again」, 后者画线连回「Read guess」. random() 括号里是空的, 没有范围; True 分支之后也没画结束框.

Can you translate this into Python code?

你能把它翻译成 Python 代码吗?

<!-- page 4 of 10 -->

[Certainly! The flowchart](https://x.ai/) you’ve provided describes a simple guessing game where the computer generates a random number, and the user has to guess it. Here’s the Python code that represents the logic in the flowchart:

[当然可以! 你提供的这张流程图](https://x.ai/)描述了一个简单的猜数游戏: 电脑生成一个随机数, 用户要猜中它. 下面是表示流程图逻辑的 Python 代码:

```python
import random
def guess_number(): # Generate a random number between 1 and 10
    target = random.randint(1, 10)
    while True:
        guess = int(input("Guess a number between 1 and 10: "))
        if guess == target:
            print("You won!")
            break
        else:
            print("Wrong guess, try again!")
if __name__ == "__main__":
    guess_number()
```

> **停一下:** 代码里「between 1 and 10」的 1 和 10 从哪来?
> 白板上没有. 流程图只写了 random(), 范围 1 到 10 是模型自己补的, 输入提示「Guess a number between 1 and 10: 」也是它加的. True 分支后的 break 对应图里没画的「结束」, 算合理推断. 下文说这段代码「as described in the flowchart」, 实际上至少有范围和 break 两处超出了图上的内容.

> **再看:** 第一行「def guess_number(): # Generate a random number between 1 and 10」注释和函数头挤在一行, 是原样吗?
> 大概率不是. 注释说明的是下一行 random.randint 在做什么, 通常应在函数体里单独占一行, 这里是网页代码块经 MinerU 抽取后丢了换行, 译稿照抄未改. 另外 int(input(...)) 遇到非数字输入会抛 ValueError, 流程图和回答都没处理, 这是示例的简化, 不影响演示意图.

This code will run the guessing game as described in the flowchart. The user will be prompted to enter their guess until they guess the correct number.

这段代码会按流程图所描述的方式运行猜数游戏. 用户会被反复提示输入猜测, 直到猜中正确的数字.

## Real-World Understanding (真实世界理解)

In order to develop useful real-world AI assistants, it is crucial to advance a model's understanding of the physical world. Towards this goal, we are introducing a new benchmark, RealWorldQA. This benchmark is designed to evaluate basic real-world spatial understanding capabilities of multimodal models. While many of the examples in the current benchmark are relatively easy for humans, they often pose a challenge for frontier models.

要开发在真实世界里有用的 AI 助手, 提升模型对物理世界的理解至关重要. 为此, 我们推出一个新基准 RealWorldQA. 它用来评测多模态模型基本的真实世界空间理解能力. 当前基准里的许多例子对人类来说相对容易, 却常常难住前沿模型.

> **对一下:**「relatively easy for humans」但「pose a challenge for frontier models」, 人类在这套题上的正确率是多少?
> 本页没有人类基线. 表里模型最高是 Grok-1.5V 68.7%, 最低是 Claude 3 Opus 49.8%, 人类做同一套题的分数, 以及「easy」按什么标准判定, 都没给. 这句只能当定性描述, 不能拿来算模型与人的差距.

<!-- page 5 of 10 -->

Which object is larger the pizza cutter or the scissors? A. The pizza cutter is larger. B. The scissors is larger. C. They are about the same size.

哪个物体更大, 披萨刀还是剪刀? A. 披萨刀更大. B. 剪刀更大. C. 两者差不多大.

> **想:** 这道披萨刀和剪刀的题, 配图在哪?
> 这一页只有题干, 没有图片, images/ 目录里也没有 p05 开头的文件. 全文 5 张图分别是第 3 页的流程图, 第 6, 7, 8 页的三张题图和第 9 页的页脚字标, 四道 RealWorldQA 示例只有这一道没图, 可能是网页轮播懒加载时没抓到. 四道题都没公布答案, 这道题图和答案都核不了.

<!-- page 6 of 10 -->

![Image block](images/p06-where-can-we-go-from-the-current-lane-a-turn-left-b-go.png)

> **问:** 这张图能看出「从当前车道能去哪」吗?
> 看不出. 图片是一片模糊的灰绿渐变, 没有车道线, 箭头或路口, 应是网页懒加载时的模糊占位图, 原图没抓下来. 选项 C「Turn left and go straight」是 A 与 B 的组合, 正确答案本页没给.

Where can we go from the current lane? A. Turn left. B. Go straight. C. Turn left and go straight. D. Turn right.

从当前车道我们可以去哪? A. 左转. B. 直行. C. 左转和直行. D. 右转.

<!-- page 7 of 10 -->

![Image block](images/p07-given-this-front-camera-view-from-our-sedan-do-we-have.png)

> **核对:**「our sedan」的前视图里, 灰色车和可绕行的空间看得到吗?
> 看不到. 这张同样是紫灰色的模糊占位图. 题干里的「our sedan」呼应第 8 页「anonymized images taken from vehicles」, 说明部分图片出自车载摄像头, 但是谁的车, 在 700 多张里占多少, 本页没写.

Given this front camera view from our sedan, do we have enough space to drive around the gray car in front of us? A. Yes. B. No.

根据我们这辆轿车的前置摄像头画面, 我们有足够空间绕过前方那辆灰色车吗? A. 有. B. 没有.

<!-- page 8 of 10 -->

![Image block](images/p08-given-the-picture-in-which-cardinal-direction-is-the.png)

> **看表:** 恐龙朝哪个方位, 图里有能判断东南西北的线索吗?
> 图是绿褐色的模糊占位图, 线索一样看不到. 这类题要靠影子, 路牌或地图朝向才能定方位, 本页没给答案, 也没说题目是否默认「图片上方为北」.

Given the picture, in which cardinal direction is the dinosaur facing? A. North. B. South. C. East. D. West.

根据这张图, 恐龙面朝哪个方位? A. 北. B. 南. C. 东. D. 西.

The initial release of the RealWorldQA consists of over 700 images, with a question and easily verifiable answer for each image. The dataset consists of anonymized images taken from vehicles, in addition to other real-world images. We are excited to release RealWorldQA to the community, and we intend to expand it as our multimodal models improve. RealWorldQA is released under [CC BY-ND 4.0](https://creativecommons.org/licenses/by-nd/4.0/?ref=chooser-v1). Click [here (677MB)](https://data.x.ai/realworldqa.zip) to download the dataset.

RealWorldQA 的首个版本包含 700 多张图片, 每张图配一个问题和一个容易核验的答案. 数据集由从车辆上拍摄的匿名化图片以及其他真实世界图片组成. 我们很高兴向社区发布 RealWorldQA, 并打算随着我们多模态模型的进步继续扩充它. RealWorldQA 以 [CC BY-ND 4.0](https://creativecommons.org/licenses/by-nd/4.0/?ref=chooser-v1) 许可发布. 点击[这里 (677MB)](https://data.x.ai/realworldqa.zip)下载数据集.

> **拆开:**「over 700 images」和「677MB」对得上吗, 题目总数是多少?
> 每图一题, 题数也就是「700 多」, 本页没给精确数. 677MB 除以约 700 张, 平均每张接近 1MB, 和车载高分辨率照片的体量相符, 这只是粗算. 许可证 CC BY-ND 4.0 允许署名再分发, 不允许发布改编版本, 想扩题或重新标注的人不能把改动后的数据集再发出来.

Into the Future

展望未来

Advancing both our multimodal understanding and generation capabilities are important steps in building beneficial AGI that can understand the universe. In the coming months, we anticipate to make significant improvements in both capabilities, across various modalities such as images, audio, and video.

同时推进多模态理解与生成能力, 是构建能理解宇宙的有益 AGI 的重要步骤. 在接下来的几个月里, 我们预计会在图像, 音频和视频等多种模态上, 让这两种能力都有显著提升.

> **确认:** 这里说要改进「understanding and generation」, Grok-1.5V 本身能生成图像吗?
> 本页没有任何生成能力的描述, 全文展示的都是理解: 读流程图, 答空间题, 跑理解类基准.「images, audio, and video」三个模态和「In the coming months」都没有时间表或指标. 同家族新闻页里, 图像生成要到 2024 年 12 月 9 日才出现, 见 [xAI 新闻页](../xai/xai-bi.md).

If you want to be a part of this journey, we are [hiring](https://x.ai/careers).

如果你想加入这段旅程, 我们正在[招聘](https://x.ai/careers).

<!-- page 9 of 10 -->

| Products | Solutions |
| --- | --- |
| Chat | Business |
| Build | Government |
| Imagine | Customer Support |
| Voice | Legal |
| Bot | Security |
| Grokipedia | Use Cases |

| 产品 | 解决方案 |
| --- | --- |
| Chat | 企业 |
| Build | 政府 |
| Imagine | 客服 |
| Voice | 法务 |
| Bot | 安全 |
| Grokipedia | 用例 |

![Image block](images/p09-2026-spacexai-llc.png)

© 2026 SpaceXAI LLC

© 2026 SpaceXAI LLC

> **回看:** 文章日期是 Apr 12, 2024, 页脚却是「© 2026 SpaceXAI LLC」, 哪个是发布时间?
> 发布时间是正文的 2024 年 4 月 12 日. 页脚是抓取当时的网站模板: xAI 在 2026 年 2 月 2 日被 SpaceX 收购, 之后对外改称 SpaceXAI (见 [xAI 新闻页](../xai/xai-bi.md)), 旧文章也就挂上了新的版权行. 同理, 页脚里的 Build 和 Bot 在 2024 年 4 月还不存在, Grok Build 2026 年 5 月 25 日, Grok Bot 2026 年 8 月 11 日才首发. 图片 p09-2026-spacexai-llc.png 只是 SPACEX 字标, 文件名取自旁边的版权行.

[Pricing](https://x.ai/pricing)

[定价](https://x.ai/pricing)

[Colossus](https://x.ai/colossus)

[Colossus](https://x.ai/colossus)

[Models](https://docs.x.ai/developers/models)

[模型](https://docs.x.ai/developers/models)

[Careers](https://x.ai/careers)

[招聘](https://x.ai/careers)

[Console](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=site-footer&utm_content=developers-console)

[控制台](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=site-footer&utm_content=developers-console)

[Changelog](https://x.ai/api/changelog)

[更新日志](https://x.ai/api/changelog)

[Contact](https://x.ai/contact)

[联系](https://x.ai/contact)

[Docs](https://docs.x.ai/)

[文档](https://docs.x.ai/)

[Status](https://status.x.ai/)

[状态](https://status.x.ai/)

Trust

信任

[Safety](https://x.ai/safety)

[安全](https://x.ai/safety)

Enterprise

企业

[Security](https://x.ai/security)

[安全防护](https://x.ai/security)

[Contact Sales](https://x.ai/contact-sales)

[联系销售](https://x.ai/contact-sales)

[DPA](https://x.ai/legal/data-processing-addendum)

[DPA (数据处理附录)](https://x.ai/legal/data-processing-addendum)

[Legal](https://x.ai/legal)

[法律](https://x.ai/legal)

<!-- page 10 of 10 -->

[Terms](https://x.ai/legal/terms-of-service)

[条款](https://x.ai/legal/terms-of-service)

Enterprise Terms

企业条款

[Privacy](https://x.ai/legal/privacy-policy)

[隐私](https://x.ai/legal/privacy-policy)

[Cookies](https://x.ai/legal/cookie-policy)

[Cookies](https://x.ai/legal/cookie-policy)

[AUP](https://x.ai/legal/acceptable-use-policy)

[AUP (可接受使用政策)](https://x.ai/legal/acceptable-use-policy)

[Brand](https://x.ai/legal/brand-guidelines)

[品牌](https://x.ai/legal/brand-guidelines)

Social

社交

[@SpaceXAI](https://x.com/spacexai)

[@SpaceXAI](https://x.com/spacexai)

[@grok](https://x.com/grok)

[@grok](https://x.com/grok)

[Discord](https://discord.com/invite/kqCc86jM55)

[Discord](https://discord.com/invite/kqCc86jM55)

[Built with Grok](https://grok.com/?referrer=website)

[用 Grok 构建](https://grok.com/?referrer=website)
