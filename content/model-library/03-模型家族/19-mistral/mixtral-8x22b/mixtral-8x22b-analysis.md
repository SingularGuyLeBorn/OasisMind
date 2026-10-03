> 源文是 Mistral AI 官网 Mixtral 8x22B 发布页的打印件, 共 7 页, 正文只有一段发布词, 四条长处, 三张评测表和一张散点图, 没有结构, 训练数据和训练方法.

# Mixtral 8x22B: 发布页精读

来源: 同目录 `mixtral-8x22b.md` 与 `mixtral-8x22b.pdf` (页标 `page 1 of 7` 到 `page 7 of 7`), 对照译稿见 `mixtral-8x22b-bi.md`. 三张评测表在 PDF 里是嵌入图片, 屏幕上被页顶或 cookie 横幅遮了一部分, 本稿按完整嵌入图录数. 文中凡自己算出的差值, 比值, 存储量都标了 「估算」.

| 项 | 本页印的内容 | 页 |
| --- | --- | --- |
| 发布方 / 日期 | Mistral AI team, April 17, 2024 | 1 |
| 类型 | sparse Mixture-of-Experts (SMoE) | 1 |
| 总参数 | 141B | 1 |
| 激活参数 | 39B | 1, 4, 5 |
| 上下文 | 64K tokens | 1 |
| 语言 | 英语, 法语, 意大利语, 德语, 西班牙语 | 1 |
| 许可证 | Apache 2.0 | 2 |
| 放出的版本 | 基座模型, 指令版 (instructed version) | 2, 5 |
| 指令版数学 | GSM8K maj@8 90.8%, Math maj@4 44.6% | 5 |
| 没印的 | 专家数, 每 token 路由几个专家, 层数, 隐藏维度, 词表大小, 训练 token 数, 训练方法, 推理速度 | 全页 |

## 1. 这页是什么

这是 Mistral AI 官网 RESEARCH 栏目里 Mixtral 8x22B 的发布文章, 标题 「Cheaper, Better, Faster, Stronger」, 落款 2024 年 4 月 17 日. 7 页里真正属于文章的是第 1 页到第 5 页上半: 一段定位, 四条长处, 许可证声明, 效率论述, 然后是推理与知识, 多语言, 数学与代码三块评测. 第 5 页下半到第 7 页是站点页脚, 每页左下还压着同一个 cookie 横幅.

所以这页能回答的问题很集中: Mixtral 8x22B 总共多大, 每次动用多少参数, 用什么许可证, 在哪些基准上比同期开放模型高多少. 它回答不了结构和训练上的问题. 页面提到 SMoE 这个类型名, 但没有专家数, 没有路由规则, 也没有 RoPE, GQA, SFT 这类结构或训练术语. 这些不是本稿能从页面里读出来的东西, 需要时应去别的来源找, 并注明出处.

## 2. 谱系: 这页自己给的线索

页面里指向家族关系的有三处. 第 2 页说 Mixtral 8x22B 是 「a natural continuation of our open model family」; 第 3 页图 1 的图注说 Mistral 7B, Mixtral 8x7B, Mixtral 8x22B 「all belong to a family of highly efficient models」; 三张表都把这三个模型排在一起, 放在淡橙色底的同一区块里. 这三处能说明的是产品线顺序: 7B 稠密模型, 然后两代 Mixtral.

这页给前两代印的数只有表里那些. Mistral 7B 的激活参数列是 7B, Mixtral 8x7B 是 12.9B, Mixtral 8x22B 是 39B. 从 12.9B 到 39B, 激活参数约为 3.0 倍. Mixtral 8x7B 的总参数, 专家配置, 上下文长度, 这页都没印, 本稿不补. 「natural continuation」 只能读成同一条产品线的下一款, 读不出两代在结构上保留了什么, 改了什么.

## 3. 规模: 名字和参数是两套数

名字 「8x22B」 里有 8 和 22B 两个数, 页面正文另印了 141B 总参数和 39B 激活参数. 页面没有解释名字里的 8 和 22B 各指什么. 两数相乘是 176, 和 141 不相等, 所以本稿把名字当名字读, 规模只引页面印出来的 141B 和 39B, 不从名字反推任何参数.

141B 和 39B 也要分开用. 141B 是模型的总参数, 决定要存多少权重; 39B 是激活参数, 表格里 「Active parameters」 一列用的就是它, 图 1 的横轴 「Active parameters / cost」 也按它排. 激活占总参数约 27.7%, 其余约 102B 在任一次前向里不参与计算. 页面没写权重精度, 若假定每参数 2 字节, 141B 约需 282 GB 存放; 这是存储量, 与每次计算动用 39B 是两件事.

## 4. 推理与知识: 七列里五列第一

图 2 的表有七个基准, 表头分两组: MMLU, HellaSwag, Wino Grande, Arc C (5), Arc C (25) 归 「Common sense and reasoning」, TriviaQA 和 NaturalQS 归 「Knowledge」. MMLU 被放在常识与推理组里, 和常见的 「知识类」 归法不同, 页面没解释. Mixtral 8x22B 在五列加粗: MMLU 77.75%, 两列 Arc C 都是 91.3%, TriviaQA 82.2%, NaturalQS 40.1%.

另外两列加粗的是 Command R+: HellaSwag 88.6% 对 88.5%, Wino Grande 85.4% 对 84.7%. 和 LLaMA 2 70B 比, Mixtral 8x22B 七列全高, 差距是 MMLU +7.85, HellaSwag +1.4, Wino Grande +1.5, Arc C (5) +5.3, Arc C (25) +6.2, TriviaQA +4.63, NaturalQS +4.6. 和上一代 Mixtral 8x7B 比, MMLU 高 7.12 分. 最大的差距在 MMLU 和 Arc C, HellaSwag 和 Wino Grande 几个模型已经挤在 81% 到 89% 之间, 拉不开.

## 5. 多语言: 十二格全胜, 平均高 8 分

图 3 在法, 德, 西, 意四种语言上各测 Arc-C, HellaSwag, MMLU, 共十二格, Mixtral 8x22B 十二格都加粗. 和 LLaMA 2 70B 的差距: 法语 +9.2, +6.7, +10.8; 德语 +9.8, +7.2, +9.9; 西语 +7.9, +5.4, +9.7; 意语 +5.9, +6.2, +10.7; 十二格平均约 +8.3. MMLU 一列差距最稳, 都在 10 分上下. 正文说 「strongly outperforms」, 按这组差距说得通.

同一张表里 Mixtral 8x7B 和 LLaMA 2 70B 的差距小得多, MMLU 四格只高 0.7 到 1.8 分. 换句话说, 上一代在多语言 MMLU 上和 70B 稠密模型大致打平, 这一代拉开了 10 分左右. 还要注意, 图 3 的 Arc-C 在 55% 到 59%, 远低于图 2 英文 Arc C 的 91.3%, 而 MMLU 只从 77.75% 掉到 74.1% 至 75.8%. 图 3 没写 shot 数和题目来源, 两张表的 Arc 分数不能放在一起比.

## 6. 数学与代码: 差距最大的一块

图 4 的五列里, Mixtral 8x22B 全部第一. 对 LLaMA 2 70B: HumanEval +15.8, MBPP +21.4, GSM8K maj@1 +25.0, GSM8K maj@8 +18.8, Math maj@4 +28.0; 对 Mixtral 8x7B: +4.9, +10.5, +20.2, +14.0, +13.4. Math maj@4 从 LLaMA 2 70B 的 13.8% 到 41.8%, 约 3.0 倍, 是三张表里相对涨幅最大的一处. Command R 和 R+ 只填了 GSM8K maj@1 一格, R+ 是 70.7%, 比 Mixtral 8x22B 低 7.9 分.

指令版的两个数印在正文里, 不在表中: GSM8K maj@8 90.8%, Math maj@4 44.6%, 比基座版各高 2.4 和 2.8 分. 读 GSM8K 两列时要记住, maj@1 到 maj@8 同时改了投票数和示例数 (5-shot 到 8-shot), 所以基座版 78.6% 到 88.4% 的 9.8 分 不能全算在投票上. 页面也没说指令版在其它基准上的表现.

## 7. 图 1: 横轴把激活参数当成本

图 1 纵轴是 MMLU, 横轴标 「Active parameters / cost」, 从 0 到 110. 这个标法本身是一个前提: 把每次动用的参数量直接等同于推理成本. 按这个前提, Mixtral 8x22B 落在横轴约 39 的位置, MMLU 约 78%, 位于左上角的 「Best performance/cost ratio」 三角里; Command R+ 在约 104, LLaMA 2 70B 在 70, 两者 MMLU 都更低. 图上的点与图 2 表里的 MMLU 和激活参数一致.

图里比表多三个模型: LLaMA 2 7B, LLaMA 2 13B, LLaMA 1 33B. 它们在表里没有分数, 目测 MMLU 约 44.5%, 55.7%, 56.8%, 只能看位置. 另外橙色三角的斜边是画出来的区域, 页面没给它的公式; 说哪些点 「在三角里」 是读图结论, 不是算出来的指标. 如果按常用近似 「每 token 前向计算量约为 2 倍激活参数」, Mixtral 8x22B 约 78 GFLOPs, LLaMA 2 70B 约 140 GFLOPs, 这和横轴的比例关系一致, 但页面自己没给这组数.

## 8. 宣传句逐条核对

第 2 页有两句最强的话. 「faster than any dense 70B model」: 页面没有吞吐或延迟数据, 能支撑它的只有 39B 对 70B 的激活参数比, 约 0.56. 这说明计算量更少, 实际快多少取决于部署, 页面没测. 「more capable than any other open-weight model (distributed under permissive or restrictive licenses)」: 括号明确把 CC-BY-NC 的模型也算进来, 而 Command R+ 在 HellaSwag 和 Wino Grande 两列高于 Mixtral 8x22B, 表里还加了粗. 这句在多数列上成立, 但不是每列都成立.

标题 「Cheaper, Better, Faster, Stronger」 四个词里, Better 和 Stronger 有三张表撑着, Cheaper 和 Faster 只能靠图 1 的横轴和激活参数比推出来, 页面没有价格, 没有每 token 成本, 也没有速度实测. 「64K tokens context window allows precise information recall from large documents」 同样只有一句话, 没有长文档检索评测. function calling 和受约束输出也一样, 属于功能说明, 页面没给分数.

## 9. 这页没写的

结构方面缺专家数, 每 token 路由几个专家, 层数, 隐藏维度, 注意力形式和位置编码; 训练方面缺数据量, 语料构成, 指令版怎么训出来的. 多语言表没写 shot 数, 图 2 没注 Command R 两格 Arc 分数的来源. 这些空白决定了本稿只能做 「表里谁高多少」 的比较, 做不了 「为什么高」 的归因.

还有两处是转写层面的问题, 读原件时要留意. 转出的 Markdown 把图 4 的 「CC-BY-NC license」 合并格扩成三行, 把 LLaMA 2 70B 也包了进去; 页面图里竖括号只括 Command R 和 Command R+. 转出的图 3 只剩西语和意语六列, 西语 Arc-C 首位数字丢失 (印成 1.9% 这样的形态), 完整数要看 PDF 的嵌入图.

## 10. 本页对不上的数字

下面几处是页面内部互相对不上, 或和正文说法对不上的地方:

- **Command R+ 两列.** HellaSwag 88.6% 高于 Mixtral 8x22B 的 88.5%, Wino Grande 85.4% 高于 84.7%, 和第 2 页 「more capable than any other open-weight model」 不一致.
- **Command R 的 Arc C (25).** 66.5%, 比它自己的 MMLU 68.2% 还低, 而同列其它模型在 78.1% 到 91.3%; Command R+ 的 71.0% 也偏低. 页面没注来源.
- **Arc C 5-shot 对 25-shot.** LLaMA 2 70B 是 86.0% 对 85.1%, 多给示例反而低 0.9; Mixtral 8x22B 两列都是 91.3%.
- **图 3 对图 2 的 Arc.** 同一模型英文 Arc C 91.3%, 四种语言 Arc-C 只有 55.3% 到 59.1%, 相差 32 到 36 分, 页面没说明两者设置不同.
- **图 2 图注拼写.** 「Measuring massive multitask language in understanding」 多了 「in」, 不影响数字.
