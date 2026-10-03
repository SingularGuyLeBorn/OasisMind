---
title: "Moonshot / Kimi(moonshot-v1) · 对照译稿"
category: "模型库"
tags: ["Kimi", "对照译稿"]
published: true
excerpt: "Moonshot / Kimi(moonshot-v1) 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 8 -->

The Wayback Machine - https://web. archive. org/web/20240327151243/https://platform. moons.



The Wayback Machine - https://web. archive. org/web/20240327151243/https://platform. moons.

# Docs / User manual



# 文档 使用手册

## Key concepts ## 主要概念

### Text generation models ### 文本生成模型

Moonshot’s text generation models (specifically moonshot-v1) are trained to understand natural language and written language; given an input, they produce text as output. The input to the model is also called a “prompt. ” In practice we recommend giving clear instructions and a few examples so the model can finish the intended task-designing a prompt is essentially learning how to “train” the model. moonshot-v1 can cover many tasks, including content or code generation, summarization, dialogue, creative writing, and more.



Moonshot的文本生成模型(指moonshot-v1)是训练用于理解自然语言和书面语言的, 它可以根据输入生成文本输出. 对模型的输入也被称为「prompt」. 通常我们建议您提供明确的指令以及给出一些范例, 来让模型能够完成既定的任务, 设计 prompt 本质上就是学会如何「训练」模型. moonshot-v1模型可以用于各种任务, 包括内容或代码生成, 摘要, 对话, 创意写作等.

(「prompt」: 这里指发给模型的整段输入指令与示例, 不是单独某个系统字段名; 源文把写好 prompt 比作在用示例「训练」模型行为.)

### Language-model inference service ### 语言模型推理服务

The language-model inference service is an API built on pretrained models developed and trained by us (Moonshot AI). By design, the main external surface is a Chat Completions interface: it can generate text, but it does not support reaching the network, databases, or other external resources, and it does not execute any code.



语言模型推理服务是一个基于我们 (Moonshot AI) 开发和训练的预训练模型的 API 服务. 在设计上, 我们对外主要提供了一个 Chat Completions 接口, 它可以用于生成文本, 但是它本身是不支持访问网络, 数据库等外部资源, 也不支持执行任何代码.

(Chat Completions: 对话补全式 HTTP API; 源文强调推理服务本身是「纯文本进出」, 联网, 查库, 跑代码都不在接口能力里.)

### Token



### Token

Text generation models process text in units of tokens. A token stands for a common character sequence. For example, a single Chinese character such as 「夔」 may be split into several tokens, while a short, frequent phrase like 「中国」 may map to a single token. Roughly speaking, for ordinary Chinese text, 1 token is about 1.5–2 Chinese characters.



文本生成模型以 Token 为基本单位来处理文本. Token 代表常见的字符序列. 例如, 单个汉字「夔」可能会被分解为若干 Token 的组合, 而像「中国」这样短且常见的短语则可能会使用单个Token . 大致来说, 对于一段通常的中文文本, 1 个 Token 大约相当于 1.5-2 个汉字.

Note that for our text models, the combined length of Input and Output must not exceed the model’s maximum context length.



需要注意的是, 对于我们的文本模型, Input 和 Output 的总和长度不能超过模型的最大上下文长度.

(「最大上下文长度」: 输入消息与生成输出共用同一窗口上限; 超长会在计费与截断规则之外直接撞墙.)

### Rate limits ### 速率限制

How do these rate limits work?



这些速率限制是如何工作的?

<!-- page 2 of 8 -->

Rate limits are measured in four ways: concurrency, RPM (requests per minute), TPM (tokens per minute), and TPD (tokens per day). You can hit a limit on any of these axes, whichever comes first. For example, you might send 20 Chat Completions requests at only 100 tokens each and already hit the limit if your RPM cap is 20, even though those 20 requests never approach 200k tokens (assuming your TPM cap is 200k).



速率限制通过4种方式衡量: 并发, RPM(每分钟请求数), TPM(每分钟 Token 数), TPD(每天 Token 数). 速率限制可能会在任何一种选项中达到, 取决于哪个先发生. 例如, 你可能向ChatCompletions 发送了 20 个请求, 每个请求只有 100 个 Token , 那么你就达到了限制(如果你的 RPM 限制是 20), 即使你在这些 20 个请求中没有发满 200k 个 Token (假设你的TPM限制是 200k).

At the gateway, for convenience, we compute rate limits based on the `max_tokens` parameter in the request. That means: if the request includes `max_tokens`, we use that value for the rate-limit calculation; if it does not, we use the default `max_tokens`. After you send a request, we decide whether you have hit the rate limit from the number of tokens in your request plus the `max_tokens` budget-without looking at how many tokens were actually generated.



对网关, 出于方便考虑, 我们会基于请求中的 max\_tokens 参数来计算速率限制. 这意味着, 如果你的请求中包含了 max\_tokens 参数, 我们会使用这个参数来计算速率限制. 如果你的请求中没有包含 max\_tokens 参数, 我们会使用默认的 max\_tokens 参数来计算速率限制. 当你发出请求后, 我们会基于你请求的 token 数量加上你 max\_tokens 参数的数量来判断你是否达到了速率限制. 而不考虑实际生成的 token 数量.

In billing, by contrast, we charge based on the tokens in your request plus the tokens actually generated.



而在计费环节中, 我们会基于你请求的 token 数量加上实际生成的 token 数量来计算费用.

(网关限流按「请求 token + max_tokens 预算」预扣; 账单按「请求 token + 实际产出」结算-- 同一调用在限流与计费上用两套尺子.)

#### Other important notes: #### 其他值得注意的重要事项:

Rate limits are enforced at the user level, not the API-key level.



速率限制是在用户级别而非密钥级别上实施的.

At present we share rate limits across all models.



目前我们在所有模型中共享速率限制.

## Model list ## 模型列表

You can use our [List Models API](https://web. archive. org/web/20240327151243mp_/https://platform. moonshot. cn/docs/api-reference#list-models) to fetch the currently available models.



你可以使用我们的 [List Models API](https://web. archive. org/web/20240327151243mp_/https://platform. moonshot. cn/docs/api-reference#list-models) 来获取当前可用的模型列表.

Currently we support:



当前的, 我们支持的模型有:

<u>moonshot-v1-8k</u>: an 8k-length model, suitable for generating short text.



<u>moonshot-v1-8k</u> : 它是一个长度为 8k 的模型, 适用于生成短文本.

<u>moonshot-v1-32k</u>: a 32k-length model, suitable for generating long text.



<u>moonshot-v1-32k</u> : 它是一个长度为 32k 的模型, 适用于生成长文本.

<u>moonshot-v1-128k</u>: a 128k-length model, suitable for generating ultra-long text.



<u>moonshot-v1-128k</u> : 它是一个长度为 128k 的模型, 适用于生成超长文本.

The difference among these models is only their maximum context length (covering both input messages and generated output); there is no meaningful difference in quality. The split exists mainly so users can pick an appropriate size.



以上模型的区别在于它们的最大上下文长度, 这个长度包括了输入消息和生成的输出, 在效果上并没有什么区别. 这个主要是为了方便用户选择合适的模型.

## Usage guide ## 使用指南

<!-- page 3 of 8 -->

### Get an API key ### 获取 API 密钥

You need an API key to use our service. You can create one in our [console](https://web. archive. org/web/20240327151243mp_/https://platform. moonshot. cn/console).



你需要一个 API 密钥来使用我们的服务. 你可以在我们的[控制台](https://web. archive. org/web/20240327151243mp_/https://platform. moonshot. cn/console)中创建一个 API 密钥.

### Send a request ### 发送请求

You can send requests with our Chat Completions API. You need an API key and a model name. You may use the default `max_tokens` or set your own. See the calling methods in the [API docs](https://web. archive. org/web/20240327151243mp_/https://platform. moonshot. cn/docs/api-reference#python-%E8%B0%83%E7%94%A8%E6%96%B9%E6%B3%95).



你可以使用我们的 Chat Completions API 来发送请求. 你需要提供一个 API 密钥和一个模型名称. 你可以选择是否使用默认的 max\_tokens 参数, 或者自定义 max\_tokens 参数. 可以参考 [API文档](https://web. archive. org/web/20240327151243mp_/https://platform. moonshot. cn/docs/api-reference#python-%E8%B0%83%E7%94%A8%E6%96%B9%E6%B3%95)中的调用方法.

### Handle the response ### 处理响应

Typically we set a 5-minute timeout. If a single request exceeds that, we return a 504 error. If you exceed the rate limit, we return a 429. On success we return a JSON response.



通常的, 我们会设置一个 5 分钟的超时时间. 如果单个请求超过了这个时间, 我们会返回一个 504错误. 如果你的请求超过了速率限制, 我们会返回一个 429 错误. 如果你的请求成功了, 我们会返回一个 JSON 格式的响应.

For quick one-shot jobs you can use the Chat Completions API in non-streaming mode: one request returns the full generated text. For more control, use streaming mode: we return an SSE stream from which you can read tokens as they arrive-often a better user experience, and you can abort at any time without wasting remaining budget.



如果是为了快速处理一些任务, 你可以使用我们的 Chat Completions API 的非 streaming 模式. 这种模式下, 我们会在一次请求中返回所有的生成文本. 如果你需要更多的控制, 你可以使用streaming 模式. 在这种模式下, 我们会返回一个 SSE 流, 你可以在这个流中获取生成的文本, 这样用户体验可能会更好, 并且你也可以在任何时候中断请求, 而不会浪费资源.

(SSE: Server-Sent Events, 服务端单向推送事件流; 这里用来边生成边吐字. 504 / 429 分别是网关超时与限流状态码, 数字与源文一致.)

## FAQ ## 常见问题

### How do I top up?



### 如何充值?

Individual users: complete personal verification first, then top up online on the user recharge page. Online top-up supports WeChat / Alipay QR payment; after success, your user tier is adjusted by cumulative recharge amount.



个人用户充值: 请先进行个人认证, 然后在用户充值页面进行在线充值, 在线充值支持微信/支付宝扫码支付两种方式, 充值成功后会按照您的累积充值金额进行用户等级调整;

Enterprise users: enterprise verification is not supported yet (in development). For enterprise top-up, click to add [WeCom](https://web. archive. org/web/20240327151247/https://work. weixin. qq. com/kfid/kfcf9008f73e3e7e737); support will contact you to recharge.



企业用户充值: 企业用户暂不支持企业认证(功能开发中, 敬请期待), 如需进行企业充值请点击添加[企业微信](https://web. archive. org/web/20240327151247/https://work. weixin. qq. com/kfid/kfcf9008f73e3e7e737), 客服会联系您充值.

**Does every API call need to resend the full conversation history? Does that mean every turn is billed again? **



**每次接口调用都需要把对话历史发送是吧? 这样的话是不是每次对话需要重复计费? **

Billing follows the length of `messages`; you can shorten what you send each turn and keep only the most important context.



根据 messages 的长度需要重新计费, 用户可以调整每次发送对话历史的长度, 只保留最重要的信息.

<!-- page 4 of 8 -->

**Does the API file-parsing service include OCR? How is it priced? **



**API 文件解析的服务包含 OCR 吗? 费用是怎样计算的.**

It supports OCR for PDF and image files; the file-parsing service is free.



支持对 pdf 和图片文件的 OCR; 文件解析服务免费.

**Is there a plan to support Function Calling? **



**是否有支持 Function Calling 的计划.**

It is on the roadmap; watch our official account for release timing.



在规划中, 发布时间请留意我们公众号的更新.

**Will you open a search API like the one in the Kimi assistant product? **



**是否开放类似 Kimi 智能助手中的搜索接口? **

There is currently no plan to open search. API users can use third-party options such as [Apify](https://web. archive. org/web/20240327151247/https://apify. com/), [Crawlbase](https://web. archive. org/web/20240327151247/https://zh-cn. crawlbase. com/enterprise), or [ArchiveBox](https://web. archive. org/web/20240327151247/https://github. com/ArchiveBox/ArchiveBox).



目前并没有开放搜索的计划, API 用户可以使用例如 [Apify](https://web. archive. org/web/20240327151247/https://apify. com/), [Crawlbase](https://web. archive. org/web/20240327151247/https://zh-cn. crawlbase. com/enterprise) 或者 [ArchiveBox](https://web. archive. org/web/20240327151247/https://github. com/ArchiveBox/ArchiveBox) 等第三方解决方案.

(Function Calling: 让模型按约定 schema 发起工具/函数调用的能力; 源文写「在规划中」, 本稿快照日期为 2024-03 左右, 以当时文档为准, 不推断后来是否已上线.)

## Guide ## 指南

### How to get better outputs?



### 如何获得更好的输出?

System Prompt best practices



System Prompt最佳实践

### Write clear instructions ### 编写清晰的说明

Why give the model clear instructions?



为什么需要向模型输出清晰的说明?

The model cannot read your mind. If the output is too long, ask for a shorter reply. If it is too shallow, ask for expert-level writing. If you dislike the format, show the format you want. The less the model has to guess, the more likely you get a satisfactory result.



模型无法读懂你的想法, 如果输出内容太长, 可要求模型简短回复. 如果输出内容太简单, 可要求模型进行专家级写作. 如果你不喜欢输出的格式, 请向模型展示你希望看到的格式. 模型越少猜测你的需求, 你越有可能得到满意的结果.

#### Include more detail in the request for more relevant answers #### 在请求中包含更多细节, 可以获得更相关的回答

To get highly relevant output, put all important details and background into the request.



为了获得高度相关的输出, 请保证在输入请求中提供所有重要细节和背景

| 一般的请求 | 更好的请求 |
| --- | --- |
| 如何在Excel中增 | 我如何在Excel表对一行数字求和? 我想自动为整张表的每一行进行求 |
| 加数字? | 和, 并将所有总计放在名为「总数」的最右列中. |

(表头与单元格原文照录; 左侧是笼统问法, 右侧把「对哪一行, 自动整表, 结果列名」写具体.)

<!-- page 5 of 8 -->

| 一般的请求 | 更好的请求 |
| --- | --- |
| 工作汇报总结 | 将2023年工作记录总结为500字以内的段落. 以序列形式列出每个月的工作亮点, 并做出2023年全年工作总结. |

#### Ask the model to play a role for more accurate output #### 在请求中要求模型扮演一个角色, 可以获得更准确的输出

In the API request’s `messages` field, add a role the model should use when replying.



在API请求的'messages'字段中增加指定模型在回复中使用的角色.

```json
{
    "messages": [
        {「role」: 「system」, 「content」: 「你是 Kimi, 由 Moonshot AI 提供的人工智能助手, 你更擅长中文和英」
        {「role」: 「user」, 「content」: 「你好, 我叫李雷, 1+1等于多少?」}
    ]
}
```

(JSON 示例按源文截断形态保留; `role: system` 用来钉人设与能力边界.)

#### Use delimiters in the request to mark different parts of the input #### 在请求中使用分隔符来明确指出输入的不同部分

For example, triple quotes / XML tags / section headings as delimiters help separate text that needs different handling.



例如使用三重引号/XML标签/章节标题等定界符可以帮助区分需要不同处理的文本部分.

```json
{
    "messages": [
        {「role」: 「system」, 「content」: 「你将收到两篇相同类别的文章, 文章用XML标签分割. 首先概括每篇文章」]
        {「role」: 「user」, 「content」: "<article>在这里插入文章</article><article>在这里插入文章</article>
    ]
}
```

```json
{
    "messages": [
        {「role」: 「system」, 「content」: 「你将收到一篇论文的摘要和论文的题目. 论文的题目应该让读者对论文」
        {「role」: 「user」, 「content」: 「摘要: 在这里插入摘要. \n\n标题: 在这里插入标题」}
    ]
}
```

#### Spell out the steps needed to finish the task #### 明确完成任务所需的步骤

<!-- page 6 of 8 -->

It helps to state a clear sequence of steps. Writing those steps out makes it easier for the model to follow and usually yields better output.



任务建议明确一系列步骤. 明确写出这些步骤可以使模型更容易遵循并获得更好的输出.

```json
{
    "messages": [
        {「role」: 「system」, 「content」: 「使用以下逐步知道来回应用户输入. \n步骤一: 用户将用三重引号提供」]
        {「role」: 「user」, 「content」: 「\」\「在此处插入文本\」\\「\」}
    ]
}
```

#### Give the model output examples #### 向模型提供输出示例

Giving a general example of the desired style is usually more efficient than enumerating every permutation of the task. For instance, if you want the model to copy a hard-to-describe style when answering user queries-this is called “few-shot” prompting.



向模型提供一般指导的示例描述, 通常比展示任务的所有排列让模型的输出更加高效. 例如如果你打算让模型复制一种难以明确描述风格, 来回应用户查询. 这被称为「few-shot」提示.

(few-shot: 在提示里放少量「输入→期望输出」样例, 让模型按样例风格作答, 而不是只靠抽象文字描述.)

```json
{
    "messages": [
        {「role」: 「system」, 「content」: 「以一致的风格回答」},
        {「role」: 「user」, 「content」: 「在此处插入文本」}
    ]
}
```

#### Specify the desired output length #### 指定期望模型输出的长度

You can ask the model for a target length. Length can be specified in words/characters, sentences, paragraphs, bullet points, and so on. Note that asking for an exact word count is not high-precision; models are better at producing a given number of paragraphs or bullets.



你可以要求模型生成特定目标长度的输出. 目标输出长度可以用文数, 句子数, 段落数, 项目符号等来指定. 但请注意, 指示模型生成特定数量的文字并不具有高精度. 模型更擅长生成特定数量的段落或项目符号的输出.

```json
{
    "messages": [
        {「role」: 「user」, 「content」: 「用两句话概括三引号内的文本, 50字以内. \」\\「在此处插入文本\」\\"]
    ]
}
```

### Provide reference text ### 提供参考文本

<!-- page 7 of 8 -->

#### Instruct the model to answer using reference text #### 指导模型使用参考文本来回答问题

If you can supply trustworthy information relevant to the current query, you can instruct the model to answer from that material.



如果您可以提供一个包含与当前查询相关的可信信息的模型, 那么就可以指导模型使用所提供的信息来回答问题

```json
{
    "messages": [
        {「role」: 「system」, 「content」: 「使用提供的文章(用三引号分隔)回答问题. 如果答案在文章中找不到」}
        {「role」: 「user」, 「content」: 「<请插入文章, 每篇文章用三引号分隔>」}
    ]
}
```

### Split complex tasks ### 拆分复杂的任务

#### Classify the user query to pick the right instructions #### 通过分类来识别用户查询相关的指令

For tasks that need large, independent instruction sets for different cases, classifying the query type and using that class to decide which instructions apply can improve output.



对于需要大量独立指令集来处理不同情况的任务来说, 对查询类型进行分类, 并使用该分类来明确需要哪些指令可能会帮助输出.

```json
# 根据客户查询的分类, 可以提供一组更具体的指示给模型, 以便它处理后续步骤. 例如, 假设客户需要“故障
{
    "messages": [
        {「role」: 「system」, 「content」: "你将收到需要技术支持的用户服务咨询. 可以通过以下方式帮助用户:
    ]
}
```

#### For long multi-turn dialogue apps, summarize or filter earlier turns #### 对于轮次较长的对话应用程序, 总结或过滤之前的对话

Because the model has a fixed context-length budget, user–assistant dialogue cannot continue forever.



由于模型有固定的上下文长度显示, 所以用户与模型助手之间的对话不能无限期地继续.

One approach is to summarize the earlier turns. Once the input size hits a preset threshold, trigger a query that summarizes part of the dialogue and include that summary in the system message. Alternatively, earlier turns can be summarized asynchronously throughout the conversation.



针对这个问题, 一种解决方案是总结对话中的前几个回合. 一旦输入的大小达到预定的阈值, 这会触发一个查询来总结对话的一部分, 先前对话的摘要可以作为系统消息的一部分包含在内. 或者, 整个对话过程中的先前对话可以异步总结.

<!-- page 8 of 8 -->

#### Chunk-summarize long documents and recursively build a full summary #### 分块概括长文档, 并递归构建完整摘要

To summarize a book, you can run a series of queries that summarize each chapter. Partial summaries can then be pooled and summarized again-a summary of summaries. Repeat recursively until the whole book is covered. If later sections need earlier ones for understanding, include summaries of prior chapters when summarizing a given point in the book.



要总结一本书的内容, 我们可以使用一系列的查询来总结文档每个章节. 部分摘要可以汇总并总结, 产生摘要的摘要. 这个过程可以递归进行, 直到整本书总结. 如果需要使用前面的章节来理解后面的部分, 那么可以在总结书中给定点的内容时, 包括对先前章节的摘要

Last updated on March 26, 2024



Last updated on March 26, 2024
