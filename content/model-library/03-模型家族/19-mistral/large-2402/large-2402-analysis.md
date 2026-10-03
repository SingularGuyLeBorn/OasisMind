---
title: "Mistral Large 技术解析"
category: "模型库"
tags: ["Mistral", "技术解析"]
published: true
excerpt: "和模型本身有关的数只有三个: 发布日期, 32K 上下文, 5 种语言. 名字 mistral-large-2402 里的 2402 也算半个数, 页面没解释它, 按发布日推是 2024 年 2 月."
---
这是 Mistral AI 官网的 Mistral Large 发布页 「Au Large」, 9 页, 8 张图, 不是论文.

- 发布: **February 26, 2024**, 署名 Mistral AI team, 官网 RESEARCH 栏.
- 定位: Mistral 「latest and most advanced language model」, 新旗舰, 文本生成.
- API 名: **mistral-large-2402**.
- 上下文: 32K token.
- 语言: 英语, 法语, 西班牙语, 德语, 意大利语 5 种 「natively fluent」.
- 能力: 原生 function calling; JSON 格式模式 (只在 mistral-small 和 mistral-large 上); 约束输出模式; 用它做了 le Chat 的系统级审核.
- 接入: la Plateforme (欧洲托管), Azure (Azure AI Studio 和 Azure Machine Learning, 第一个分发伙伴), 自部署 (可拿权重, 需联系团队), le Chat (beta).
- 同日发布: Mistral Small (mistral-small-2402).
- 评测: Figure 1 (MMLU 柱状图), Figure 2 (7 列常识推理知识), Figure 3 (西语意语可见, 法语德语被挡), Figure 4 (代码和数学, 后三行被挡).
- 没印的: 参数量, 模型结构, 训练数据和 token 数, 价格, 延迟数字.

## 1. 这页一共印了哪些数

和模型本身有关的数只有三个: 发布日期, 32K 上下文, 5 种语言. 名字 mistral-large-2402 里的 2402 也算半个数, 页面没解释它, 按发布日推是 2024 年 2 月. 剩下的数全在四张评测图表里: Figure 1 六根柱子, Figure 2 六个模型 x 七列, Figure 3 三行里露出的五列, Figure 4 前三行完整加后三行几格残数.

页面占篇幅最多的是 cookie 横幅. 它在 9 页里每页都出现, 把第 2 到第 6 页的正文和两张表挡掉一块, 转出的 Markdown 因此到处是半截字. PDF 文本层是完整的, 对照稿的英文按文本层补齐. 表格是图, 数字按页面上的表格图抄录, 被挡住的格子留空. 8 张图里只有 2 张带模型信息 (Figure 1 柱状图, Figure 4 表); 第 8 页是页脚整页截图, 其余 5 张是横幅里的开关和勾选框.

## 2. 「世界第二」 靠的是 MMLU 一列

第 1 页说 Mistral Large 是 「the world's second-ranked model generally available through an API (next to GPT-4)」. 能直接支撑这个名次的是 Figure 1: MMLU 上 GPT-4 86.4%, Mistral Large 81.2%, Claude 2 78.5%, Gemini Pro 71.8%, GPT-3.5 70.0%, LLaMA 2 70B 69.9%. 按这一列排, 它确实第二, 比第一低 5.2 个点, 比第三高 2.7 个点.

这个名次有两处要打折. 一是 Figure 1 图注写的是 「Mistral Large (pre-trained)」, 第 3 页也说报的是 「pretrained models」 的成绩, 而 「generally available through an API」 说的是上架产品, 两者是否同一份权重, 页面没交代. 二是柱状图纵轴从 40% 起画. GPT-4 和 Large 真实比值约 1.06, 按露在 40% 以上的柱高算约 1.13, 图上的落差大约放大了一倍. 换到别的列, 名次就不稳了, 下面两节会看到.

## 3. Figure 2: 七列常识推理, 和谁比都要先对齐列

Figure 2 的表头在哪一页都看不到, 列名只能按图注顺序对位: MMLU, HellaSwag (10-shot), WinoGrande (5-shot), Arc Challenge (5-shot), Arc Challenge (25-shot), TriviaQA (5-shot), TruthfulQA. 第一列六个值和 Figure 1 完全一致, 说明对位至少第一列没错. 加粗也逐列核过: 每列的粗体都是该列可见最大值, 没有自相矛盾.

这张表空格很多, 不同模型能比的列不一样, 直接看 「赢了几列」 容易误读. 按共同列做简单平均: 和 LLaMA 2 70B 七列全有, 82.6 对 76.2, 高 6.4; 和 GPT 3.5 共五列, 89.1 对 81.5, 高 7.6; 和 GPT 4 共四列 (MMLU, HellaSwag, WinoGrande, Arc 25-shot), 87.8 对 91.4, 低 3.6; 和 Claude 2 共三列 (MMLU, Arc 5-shot, TriviaQA), 86.0 对 85.7, 只高 0.4 左右; 和 Gemini Pro 1.0 共两列, 85.2 对 78.3. 和 Claude 2 基本打平, TriviaQA 还输了 4.8 个点 (82.7 对 87.5).

还有一处读着别扭. Arc Challenge 的 5-shot 分数不比 25-shot 低: Mistral Large 94.2 对 94.0, LLaMA 2 70B 86.0 对 85.1, GPT 3.5 两列都是 85.2. 示例多了分数反而持平或略降, 页面没解释. Mistral Large 在 5-shot 列拿到粗体, 是因为 GPT 4 那格是 「-」; 25-shot 列 GPT 4 有 96.3, 比它高 2.3.

## 4. Figure 3: 多语言只露出一半

正文说 Mistral Large 在法语, 德语, 西班牙语, 意大利语的 HellaSwag, Arc Challenge, MMLU 上 「strongly outperforms LLaMA 2 70B」. Figure 3 被横幅挡住一半, 能读的只有西语的 HellaSwag, MMLU 和意语三列, 西语 Arc-C 只露出 「%」 号. 行名也被挡, 只露出首字母 M, M, L, 按图注顺序读作 Mistral Large, Mixtral 8x7B, LLaMA 2 70B. 这是推断, 不是页面上看到的行名.

按可见五格算: Mistral Large 平均 75.7, Mixtral 8x7B 66.7, LLaMA 2 70B 65.2. Mistral Large 比 LLaMA 2 70B 高 6.9 到 13.8 个点, 说 「strongly」 站得住. Mixtral 8x7B 比 LLaMA 2 70B 每格都高, 但只高 0.8 到 2.0 个点. 西语 MMLU 差 13.7, 意语 MMLU 差 13.8, 都比英语 MMLU 的 11.3 大, 说明在这组数里换了语言后差距是拉大的.

拿英语 Figure 2 对照, 能看出每项降多少 (Figure 3 没写 shot 数, 设定未必相同). Mistral Large 的 MMLU 从 81.2 到西语 79.7, 意语 78.9, 只降 1.5 和 2.3; HellaSwag 从 89.2 到 81.9 和 77.8, 降 7.3 和 11.4. LLaMA 2 70B 降得更多: MMLU 降 3.9 和 4.8, HellaSwag 降 12.6 和 16.2. 最扎眼的是 Arc-C, 意语 Mistral Large 只有 60.3, 比英语 5-shot 的 94.2 低 33.9; LLaMA 2 70B 是 49.4 对 86.0. 其余两项只降几个点, Arc 却断崖, 更像是设定或数据版本不同, 这页定不了.

## 5. Figure 4: 代码和数学, 最高分藏在被挡住的行里

Figure 4 前三行完整. Mistral Large 在 MBPP (73.1%), Math maj@4 (45.0%), GSM8K maj@8 (91.21%) 三列加粗; 对 LLaMA 2 70B 五列全赢, 差距 15.8 到 31.2 个点, Math maj@4 约是它的 3.3 倍. 对 GPT 3.5, Math 高 10.9, GSM8K maj@1 高 23.9, 但 HumanEval 低 3.0 (45.1 对 48.1).

后三行的行名和前两列被横幅挡住. 从加粗能反推一些东西: HumanEval 列 45.1 和 48.1 都没加粗, 所以最高分在被挡的三行里, 且高于 48.1; GSM8K maj@1 的粗体是第 4 行的 92.0%, 比 Mistral Large 的 81.0 高 11.0; 第 6 行露出 GSM8K maj@8 86.5% 和 Math maj@4 「?2.6%」, 既然 45.0 加粗, 那格应低于 45.0. 行名是谁, 页面上看不到. 所以正文 「top performance in coding and math tasks」 在代码一半并不成立: HumanEval 至少有两个对手比它高.

GSM8K 两列的差也要小心读. Mistral Large maj@8 比 maj@1 高 10.21 个点, LLaMA 2 70B 高 16.0 个点, 但两列一个 8-shot 一个 5-shot, 投票和示例数混在一起, 拆不开. 91.21% 是全表唯一的两位小数, 页面没解释, 比较时按 91.2 看.

## 6. 能力清单: 描述多, 可核对的数少

第 2 页列了四项长处. 5 种语言有 Figure 3 撑一部分, 但 Figure 3 只比了法德西意四种, 英语另见 Figure 2, 法语德语两组还被挡住. 32K 上下文是个硬数, 可 「precise information recall from large documents」 没配任何长文检索分数. 指令遵循那一项, 证据是 Mistral 自己用它搭了 le Chat 的系统级审核, 页面没给审核相关的分数.

Function calling 和 JSON 格式模式写得最具体. JSON 模式强制输出合法 JSON; function calling 把 endpoint 接到开发者自己的工具, 内部代码, API 或数据库上. 这两项当时只在 mistral-small 和 mistral-large 上开放, 页面说 「shortly」 会推到所有 endpoint, 没给日期. 第 2 页还提到 「constrained output mode, implemented on la Plateforme」, 它和 JSON 格式模式的关系页面没讲清.

## 7. 接入: 权重可以拿到, 但不是开放权重

托管接入两条: la Plateforme 在 Mistral 位于欧洲的基础设施上, Azure 通过 Azure AI Studio 和 Azure Machine Learning 提供, 页面称 Azure 是第一个分发伙伴, beta 客户用得不错. 另外 le Chat (beta 助手演示) 也上了 Mistral Large. 第 6 页还说 la Plateforme 开放了组织管理和多币种计价, 更新了服务档位, 所有 endpoint 延迟都降了, 但一个价格或延迟数字都没印.

自部署那一条写着 「with access to our model weights」, 面向 「the most sensitive use cases」, 要联系团队. 这和开放权重是两回事: 第 6 页的 「Open-weight endpoints」 只列 open-mistral-7B 和 open-mixtral-8x7b, mistral-large-2402 在 「optimised model endpoints」 那一类. 单看这页, Mistral Large 是商业模型, 权重只在自部署合作里给.

## 8. 谱系: 这一天的 Mistral 产品线

这页给出的谱系信息集中在第 6 页的 endpoint 列表. 发布这天, Mistral 的 API 分两档: 开放权重档 open-mistral-7B 和 open-mixtral-8x7b, 主打价格; 优化档 mistral-small-2402 和 mistral-large-2402, 加上继续保留但不更新的 mistral-medium. 新加的两个 endpoint 都带 「-2402」 后缀, 老的 mistral-medium 和两个开放权重 endpoint 都没有, 按日期推, 后缀是这一批新模型的版本标记.

Mistral Small 的定位写得清楚: 介于开放权重产品和旗舰之间, 成绩超过 Mixtral 8x7B, 延迟更低, 和 Mistral Large 共享 RAG 支持与 function calling 上的新做法. 但它没进任何一张评测表, 「outperforms Mixtral 8x7B」 没有数. Mixtral 8x7B 本身只出现在 Figure 3, 作为自家参照: 它比 LLaMA 2 70B 高一两个点, Mistral Large 比 LLaMA 2 70B 高七到十四个点.

至于 Mistral Large 从哪个基座来, 用什么结构, 多少参数, 训练了多少 token, 页面一个字也没写. 谱系在这页只能画到这里: 2024 年 2 月, mistral-large-2402, 商业旗舰, 32K, 五种语言, 位于 Small 和 Medium 之上, 和 Small 同日发布.

## 9. 本页对不上的数字

最硬的一处是 Arc Challenge. Figure 2 里 5-shot 不低于 25-shot (Mistral Large 94.2 对 94.0, LLaMA 2 70B 86.0 对 85.1); Figure 3 意语 Arc-C 又只有 60.3 和 49.4, 比英语低三十多个点, 而同表 HellaSwag, MMLU 只降几个点. 页面没写 Figure 3 的 shot 数和数据版本, 这几组 Arc 数放不到同一把尺子上.

第二处是 「second-ranked」 和 「top performance in coding and math」 这两句定性话. MMLU 上它第二; 和 Claude 2 在共同三列上约 86.0 对 85.7, 基本打平, TriviaQA 还输 4.8 个点; HumanEval 上 GPT 3.5 的 48.1 比它的 45.1 高, 被挡住的行里还有更高的; GSM8K maj@1 也输给第 4 行的 92.0. 再加上 Figure 1, 2 报的是预训练版, 和 API 产品未必是同一份权重.

小地方还有几处. Figure 1 图注写 「Gemini Pro 1.0」, 柱子下标的是 「Gemini Pro」; Figure 2 图注把 MMLU 写成 「Measuring massive multitask language in understanding」, 多了一个 「in」; GSM8K maj@8 印成两位小数 91.21%; 纵轴从 40% 起, 视觉差距约放大一倍. 源 Markdown 把第 1 页第二句的主语 「Mistral Large」 丢了, 表格被横幅切碎; PDF 文本层是完整的. 最后是时间: 页头 February 26, 2024, 页眉打印时间 2026/9/25, 页脚 © 2026, 页脚里的 Vibe, Studio, Forge 等产品不要当成和 Mistral Large 同时发布.
