<!-- page 1 of 2 -->

# Public Disclosure of Kimi Algorithm and Model Filing Information # Kimi算法及模型备案信息公示说明

Last updated: August 24, 2026



最近更新日期: 2026年8月24日

## I. Purpose of this disclosure ## 一, 公示目的

Beijing Moonshot Technologies Co., Ltd. (hereinafter "Moonshot" or "we") operates the corresponding Kimi products and services, including but not limited to products and services we provide to you via the website (kimi. com), applications (the Kimi APP and its PC client; the Kimi Claw APP), mini programs (Kimi Intelligent Assistant), and innovative forms that may appear as technology develops (hereinafter "products and/or services"). To protect users’ right to know and to implement relevant legal requirements, we disclose the filing information for Kimi-related models and algorithms as follows.



北京月之暗面科技股份有限公司(以下简称「月之暗面」或「我们」)运营Kimi相应产品和服务, 包括但不限于我们通过网页(kimi. com), 应用程序(Kimi APP端及其PC端; Kimi Claw APP端), 小程序(Kimi 智能助手)以及随技术发展出现的创新形态方式向您提供的产品和服务(以下简称「产品和/或服务」). 为保障用户知情权, 落实相关法律要求, 我们就Kimi相关模型及算法备案信息公示如下.

(「备案」: 中国互联网信息服务语境下向主管部门登记算法/模型信息的合规公示, 不是论文式技术规格书; 下文编号与链接以公示原文为准.)

## II. Filing information ## 二, 备案信息

**(1) Model filing**



**(一)模型备案**

The models we have completed filing for are as follows:



我们已完成备案的模型如下:

**Model name:** Moonshot (Kimi large model)



**模型名称:** Moonshot(Kimi大模型)

**Filing number:** Beijing-MoonShot-20231016



**备案编号:** Beijing-MoonShot-20231016

**Model application scenarios:** Moonshot (Kimi large model) is mainly used in products and/or services such as the Kimi Intelligent Assistant (Web site, APP, WeChat mini program) for intelligent Q&A, conversational interaction, text generation, information search and content summarization, and related scenarios. Based on questions you enter and content you upload, it can generate corresponding text replies.



**模型应用场景:** Moonshot(Kimi大模型)主要应用于Kimi智能助手(Web网站, APP, 微信小程序)等产品和/或服务中的智能问答, 对话交互, 文本生成, 信息搜索与内容总结等场景, 可以根据您输入的问题和上传的内容, 生成相应的文本回复.

**Public query link:** [CAC announcement page](https://www. cac. gov. cn/2024-04/02/c_1713729983803145. htm)



**公示查询链接:** [国家网信办公告页](https://www. cac. gov. cn/2024-04/02/c_1713729983803145. htm)

**(2) Algorithm filing**



**(二)算法备案**

We have completed filing for two algorithms in total. The filing information is disclosed as follows:



我们已完成备案的算法共两项, 备案信息公示如下:

**1. Algorithm name: Moonshot Language Model Algorithm-1**



**1. 算法名称: 月之暗面Moonshot语言模型算法-1**

**Basic principle of the algorithm:** This algorithm is a pretrained language algorithm model independently developed on the Transformer architecture. It is formed by stacking multiple Transformer encoders; each encoder contains a multi-head self-attention mechanism and a feed-forward neural network. It can process long text sequences and generate natural text answers according to context.



**算法基本原理:** 该算法是基于Transformer架构自主研发的预训练语言算法模型, 由多个Transformer编码器(encoder)堆叠而成, 每个编码器包含一个多头自注意力机制(multi-head self-attention mechanism)和一个前馈神经网络(feed-forward neural network), 能够处理长文本序列, 并且能够根据上下文生成自然的文本回答.

(「Transformer 编码器堆叠」: 公示把模型写成 encoder 叠层 + 多头自注意力 + 前馈网络; 这是备案口径里的架构描述, 不等于完整开源模型卡, 也不单独声明 decoder-only 或 MoE 等变体.)

**Algorithm operating mechanism:** After the user inputs natural-language data in text form or uploads text content, the algorithm model reviews the input for illegal and harmful information. If the review fails, the user is told that service cannot be provided. If the review passes, the data is fed into the algorithm for semantic and con-



**算法运行机制:** 用户输入文本格式的自然语言数据或上传文本内容后, 算法模型对输入的数据进行违法和不良信息审核, 如审核不通过则告知用户无法服务, 审核通过则将数据输入算法, 进行语义和上

<!-- page 2 of 2 -->

textual association analysis. After a natural-language answer is generated, the output is reviewed again for illegal and harmful information; if that review passes, the answer is returned to the user.



下文关联分析, 生成自然语言形式的回答后会再次对输出数据进行违法和不良信息审核, 审核通过则将回答反馈给用户.

(「输入审核 → 生成 → 输出审核」: 源文把内容安全写成进出各审一次的流水线; 审核不通过则直接告知无法服务, 通过才把回答交给用户.)

**Algorithm application scenarios:** Applied in knowledge-base Q&A scenarios in the Kimi Intelligent Assistant Web site, APP (Android, iOS), and WeChat mini program.



**算法应用场景:** 应用在Kimi智能助手Web网站, APP(Android, iOS), 微信小程序中的知识库问答场景中.

**Purpose and intent of the algorithm:** Dedicated to improving text-processing efficiency for enterprises and individuals, and, through deep text synthesis technology, providing Q&A dialogue generation services in general scenarios, so as to enable conversational interaction, answering questions, assisting creation, and related purposes.



**算法目的意图:** 致力于提升企业和个人的文本处理效率, 通过文本深度合成技术, 向用户提供通用场景下的问答对话生成服务, 实现对话互动, 回答问题, 协助创作等目的.

**Filing number:** 网信算备110108896786101240015号



**备案编号:** 网信算备110108896786101240015号

**Public query link:** [Internet Information Service Algorithm Filing System](https://beian. cac. gov. cn/)



**公示查询链接:** [互联网信息服务算法备案系统](https://beian. cac. gov. cn/)

**2. Algorithm name: Moonshot Language Model Algorithm-2**



**2. 算法名称: 月之暗面Moonshot语言模型算法-2**

**Basic principle of the algorithm:** This algorithm is a pretrained language algorithm model independently developed on the Transformer architecture. It is formed by stacking multiple Transformer encoders; each encoder contains a multi-head self-attention mechanism and a feed-forward neural network. It can process long text sequences and generate natural text answers according to context.



**算法基本原理:** 该算法是基于Transformer架构自主研发的预训练语言算法模型, 由多个Transformer编码器(encoder)堆叠而成, 每个编码器包含一个多头自注意力机制(multi-head self-attention mechanism)和一个前馈神经网络(feed-forward neural network), 能够处理长文本序列, 并且能够根据上下文生成自然的文本回答.

**Algorithm operating mechanism:** After the user inputs natural-language data in text form or uploads text content, the algorithm model reviews the input for illegal and harmful information. If the review fails, the user is told that service cannot be provided. If the review passes, the data is fed into the algorithm for semantic and contextual association analysis. After a natural-language answer is generated, the output is reviewed again for illegal and harmful information; if that review passes, the answer is returned to the user.



**算法运行机制:** 用户输入文本格式的自然语言数据或上传文本内容后, 算法模型对输入的数据进行违法和不良信息审核, 如审核不通过则告知用户无法服务, 审核通过则将数据输入算法, 进行语义和上下文关联分析, 生成自然语言形式的回答后会再次对输出数据进行违法和不良信息审核, 审核通过则将回答反馈给用户.

**Algorithm application scenarios:** Applied to the Kimi Open Platform.



**算法应用场景:** 应用于Kimi开放平台.

**Purpose and intent of the algorithm:** Serves developers who need text generation and intelligent dialogue development; dedicated to improving text-processing efficiency for enterprises and individuals; and, by calling the algorithm model via API, provides Q&A dialogue generation services in general scenarios, so as to enable conversational interaction, answering questions, assisting creation, and related purposes.



**算法目的意图:** 服务于有文本生成, 智能化对话开发需求的开发者, 致力于提升企业和个人的文本处理效率, 通过算法模型API调用形式, 向用户提供通用场景下的问答对话生成服务, 实现对话互动, 回答问题, 协助创作等目的.

**Filing number:** 网信算备110108896786101240023号



**备案编号:** 网信算备110108896786101240023号

**Public query link:** [Internet Information Service Algorithm Filing System](https://beian. cac. gov. cn/)



**公示查询链接:** [互联网信息服务算法备案系统](https://beian. cac. gov. cn/)

## III. Version and maintenance ## 三, 版本与维护

The filing information listed in this disclosure is subject to the information published by competent authorities such as the Internet Information Service Algorithm Filing System. If related services, algorithms, model names, filing numbers, or other information change, we will update this disclosure in a timely manner in accordance with laws and regulations and with actual circumstances.



本公示所列备案信息以互联网信息服务算法备案系统等主管部门公示信息为准. 相关服务, 算法, 模型名称或备案编号等信息如发生变更, 我们将根据法律法规要求及实际情况及时更新本公示.
