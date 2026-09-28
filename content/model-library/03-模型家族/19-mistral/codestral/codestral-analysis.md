[OM-FREEPLAY] 材料不够 5000. 这是 Mistral AI 官网的 Codestral 发布页, 9 页, 4 张图, 不是论文. 下面只用这页印出来的数, 不补结构, 不从同家族其他模型搬参数.

- 发布: **May 29, 2024**, 署名 Mistral AI team, 官网 RESEARCH 栏.
- 定位: Mistral 的 「first-ever code model」, 开放权重, 专做代码生成.
- 规模: 22B, 只有这个取整值.
- 上下文: 32k.
- 语言: 训练覆盖 80+ 种编程语言.
- 能力: 指令和补全共用 endpoint, 支持 fill-in-the-middle; instruct 版支持 tool use (LangChain 引语).
- 许可: Mistral AI Non-Production License, 商用要另申请.
- 接入: HuggingFace 下载; codestral.mistral.ai (beta 8 周免费, waitlist, 个人 key); api.mistral.ai (按 token 计费); 自部署.
- 没印的: 精确参数量, 模型结构, 训练 token 数, 延迟, 价格.

## 1. 这页一共印了哪些数

和模型本身有关的数不多: 发布日期, 22B, 32k 上下文, 80+ 种语言, 8 周 beta. 剩下的数都在三张评测表和一条第三方引语里. Figure 1 主表 4 个模型 x 8 列, 多语言表 4 x 8, FIM 表只露出 Codestral 一整行和另外三行的末两列. 引语里有 JetBrains 的 Kotlin-HumanEval 三个分数.

页面占篇幅最多的其实是 cookie 横幅. 它在 9 页里每页都出现, 还把第 2, 3 页的表和正文挡掉一块, 转出的 Markdown 因此丢了不少字. 好在 PDF 文本层是完整的, 对照稿的英文按文本层补齐; 表格是图, 数字按页面上的表格图抄录, 被挡住的格子就是空的, 不补.

## 2. 主表: 七列分数里赢五列

Figure 1 主表有七列分数. Codestral 在 HumanEval (81.1%), CruxEval-O (51.3%), RepoBench (34.0%), HumanEvalFIM average (91.6%), HumanEval average (61.5%) 五列第一. 另外两列不是第一: MBPP 输给 DeepSeek Coder 33B (78.2% 对 80.2%), Spider 输给 Llama 3 70B (63.5% 对 67.1%). 原表的加粗也是这么标的, 页面没有回避这两处.

把 Python 组四列简单等权平均, Codestral 约 61.2, DeepSeek Coder 33B 约 58.9, Llama 3 70B 约 49.3, CodeLlama 70B 约 49.2 (估算). 这个平均页面没算, 四个基准量纲也不同, 只能看个排序. Llama 3 70B 在 CruxEval-O 只有 26.0%, 比其余三家低了二十多个点, 是它 Python 组平均垫底的主要原因.

## 3. 32k 窗口和 RepoBench

Figure 1 的图注把 RepoBench 的领先归到 32k 窗口上. 表里四个模型的窗口和 RepoBench 分数确实同序: CodeLlama 70B 4k 对 11.4%, Llama 3 70B 8k 对 18.4%, DeepSeek Coder 33B 16k 对 28.4%, Codestral 32k 对 34.0%. Codestral 比第二名高 5.6 个点, 约是 CodeLlama 的 3.0 倍 (估算).

但这四组数里, 窗口和模型一起变. 训练数据, 规模, 是否代码专用都不同, 页面没有同一个模型换窗口的消融. 所以 「窗口越大 RepoBench 越高」 是表上的排列, 不是这页证明了的因果. 图注用的 「outperforms all other models」 本身和表一致, 归因那半句要打个问号.

## 4. 多语言表: 平均值对不上

第 3 页开头那张表缺表头. 第一列和主表 HumanEval 列完全相同, 下文说另外评了 C++, bash, Java, PHP, Typescript, C# 六种语言并算平均, 所以后六列大概率按这个顺序排, 但这页没印列名. 最后一列标 Average, 和主表 「HumanEval average」 一列的四个值完全一致.

问题在于这个 Average 算不出来. 七列平均: Codestral 约 61.9, CodeLlama 约 52.3, DeepSeek 约 58.0, Llama 3 约 61.5 (估算), 表上分别印 61.5, 51.9, 57.6, 61.2, 四行都低 0.34 到 0.39 个点. 只算后六列又低太多, Codestral 约 58.7 (估算). 四行偏差几乎同幅, 更像是分母或列集合和看到的不一样, 比如切在第 2 页底的表头里还有一列; 若按八列反推, 缺的那列约为 58.8, 49.4, 55.0, 58.8 (估算). 这只是一种解释, 页面给不出答案.

## 5. FIM 表: 只有一个对手

FIM 表评 Python, JavaScript, Java 三种语言的 HumanEval pass@1. Codestral 是 89.4%, 95.1%, 90.3%, 三者平均正好 91.6%, 和表里 Average 及主表 HumanEvalFIM average 都对得上. 这是三张表里唯一能完整复算的平均.

对比对象只有 DeepSeek Coder 33B, 理由是它的 fill-in-the-middle 能力 「immediately usable」. 可见行里 Java 86.6%, 平均 78.2%, Python 和 JavaScript 两格被横幅挡住, 反推两格之和约 148.0 (估算). 另外两行全是 「-」, 对应主表里 CodeLlama 70B 和 Llama 3 70B 在 FIM 列的 「-」. 行名看不到, 这个对位是按数字推的.

## 6. 22B 放在对手中间 (估算)

页面反复强调 22B 和 「higher hardware requirements」. 按名字里的规模算, CodeLlama 70B 和 Llama 3 70B 约是 Codestral 的 3.2 倍, DeepSeek Coder 33B 约是 1.5 倍 (估算). 如果按每参数 2 字节存权重, 22B 约 44 GB (估算); 页面没写精度, 这个数只说明量级.

「sets a new standard on the performance/latency space」 这句话缺一半证据. 表里全是准确率类分数, 没有延迟, 吞吐或显存数据. 延迟方面只有 Sourcegraph 的定性引语, 说内部评测显示 Cody 自动补全延迟明显下降, 没写基线也没写毫秒数. 性能那一半有表撑着, 延迟那一半只能靠 22B 比 33B, 70B 小去推想.

## 7. 许可和接入: 开放权重不等于能商用

Codestral 权重公开, 可以从 HuggingFace 下载, 但授权是新的 Mistral AI Non-Production License, 按页面的话说就是只能用于研究和测试. 要在商业活动里用, 得联系团队按需申请商用许可. 同一页里 「open-weight」 和 「Non-Production」 并列, 读的时候要分开理解.

托管接入有两条路. codestral.mistral.ai 面向 IDE 里的 Instruct 和 Fill-In-the-Middle 路由, key 按个人管理, 不受组织限流, beta 期 8 周免费, 要排 waitlist; 若从发布日算, 8 周后约是 2024 年 7 月 24 日 (估算). api.mistral.ai 按 token 计费, 适合研究, 批量查询, 以及不需要用户自带 key 的第三方应用. 另外还有自部署方案. 这页没印任何价格.

## 8. 第三方引语里的数

七段引语里只有 JetBrains 研究员 Mikhail Evtikhiev 那段带数字: 在自家 Kotlin-HumanEval 上, T=0.2 的通过率, Codestral 73.75, GPT-4-Turbo 72.05, GPT-3.5-Turbo 54.66. Codestral 比 GPT-4-Turbo 高 1.70 分, 比 GPT-3.5-Turbo 高 19.09 分. 页面没说 T 的含义, 也没说分数是不是百分比.

这组数和 Figure 1 不在同一个基准上, 不能把 73.75 和主表的 HumanEval 81.1% 放一起比. 其余几段引语都是定性评价: Continue.dev 说速度和质量的组合前所未有, Tabnine 说尺寸紧凑却和大得多的模型持平, LlamaIndex 举了一个补全查询引擎函数的例子, LangChain 说 instruct 版支持 tool use, 配合 LangGraph 开箱可用.

## 9. 谱系: 这页能说什么

这页能确定的谱系信息很少. 第一句话说 Codestral 是 Mistral 「first-ever code model」, 所以在 Mistral 自己的产品线里它是代码模型的起点. Tabnine 的引语提到 「the previous Mistral model」, 说 Codestral 的速度和准确度比它强, 但没说那是哪个模型, 也没印它的任何参数.

至于 Codestral 从哪个基座训出来, 用什么结构, 页面一个字也没写. 页脚是 2026 年抓页时的站点导航, 列着 Vibe, Vibe Code, Studio, Forge 和 Coding 解决方案页. 页面没有把这些名字和 Codestral 连起来. 单看这一页, 谱系只能画到这里: 2024 年 5 月, Mistral 的第一个代码模型, 22B, 32k.

## 10. 本页对不上的地方

最硬的一处是多语言表的 Average: 四行都比可见七列的平均低 0.34 到 0.39 个点, 表头又不在本页, 定不了它平均的是哪几列. 第二处是 FIM 表, 下面三行的行名和前两列被 cookie 横幅挡住, DeepSeek 的 Python, JavaScript 两格只能反推和. 第三处是 「performance/latency」 的说法, 全文没有一个延迟数字.

小地方还有几处. 正文说对比对象是 「code-specific models」, 表里却有通用的 Llama 3 70B. Figure 1 图注结尾是两个句点 「generation..」, Tabnine 引语把 Mistral 拼成 「Mistal's」. 源 Markdown 有 OCR 残字, 比如 「Llamalndex」, 「Al code generation」, 还有被横幅截断的 「esign adva」; PDF 文本层里这些都是对的. 最后是时间: 页头 May 29, 2024, 页脚 © 2026, 页脚里的产品不要当成和 Codestral 同时发布.
