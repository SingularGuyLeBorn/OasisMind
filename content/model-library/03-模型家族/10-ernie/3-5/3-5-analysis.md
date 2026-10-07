---
title: "ERNIE-3.5-8K: 千帆文档站上的一页对话 API 说明"
category: "模型库"
tags: ["ERNIE", "技术解析"]
published: true
excerpt: "页面标题是 「ERNIE-3.5-8K」, 更新时间 2025-09-05. 正文只有一段介绍模型: ERNIE 3.5 是百度自研的旗舰级大语言模型, 覆盖海量中英文语料, 能满足绝大部分对话问答, 创作生成, 插件应用场景;"
---
# ERNIE-3.5-8K: 千帆文档站上的一页对话 API 说明

> 源文 `3-5.md` 是百度千帆大模型平台文档站 ERNIE-3.5-8K 页面的 MinerU 抓取 (12 页, 2 张图), 内容是一页对话接口说明, 夹着每页重复的顶栏, 侧栏和页内目录. 它不是论文.

来源: 同目录 `3-5.md` (页标记 `page 1 of 12` 到 `page 12 of 12`). 对照译稿见 `3-5-bi.md`. 两张图: `images/p01-image.png` 是搜索框里的放大镜图标, `images/p01-image-2.png` 是在线调试控制台截图. 参数名, 数值和 URL 一律以源 md 为准.

## 1. 材料与接口

### 1.1. 材料性质: 一页接口文档

页面标题是 「ERNIE-3.5-8K」, 更新时间 2025-09-05. 正文只有一段介绍模型: ERNIE 3.5 是百度自研的旗舰级大语言模型, 覆盖海量中英文语料, 能满足绝大部分对话问答, 创作生成, 插件应用场景; 支持自动对接百度搜索插件, 保障问答信息时效; ERNIE-3.5-8K 是这个模型的一个版本. 这段话之后, 全页都是接口: 接口描述, 在线调试, 鉴权说明, 请求结构, 请求头域, 请求参数, 响应头域, 响应参数, 七组示例, 错误码.

几乎每一页都重复出现三样东西: 顶部导航 (开放能力, 开发平台, 文心大模型, 场景应用, 客户案例, 开发与生态), 左侧文档目录 (开始使用, 模型, 平台计费 ... 相关协议), 右侧页内目录 (接口描述 ... 响应头域). 它们是文档站的导航链接, **不描述模型或服务的内部结构**. MinerU 还把导航和正文搅在了一起: 第 3, 4 页的表头被导航文字盖住, 第 8 到 12 页的顶栏里混进了代码注释和 JSON 碎片. 读的时候要先把这些版式噪声剥掉.

### 1.2. 型号名和接口地址

页面标题写 ERNIE-3.5-8K, 介绍写 ERNIE 3.5, 但示例里调用的地址是 `https://aip.baidu.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions`, 路径里没有 「3.5」 也没有 「8K」. 在线调试平台的链接参数写的是 `parent=ERNIE-Bot`, `api=rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions`. 页面没有说明这条路径和 ERNIE-3.5-8K 这个名字是怎样对应的, 也没有提到同一路径是否还服务别的版本.

这层对应可以在千帆文档站的模型列表页核对. 那张表把不带日期的 ERNIE-3.5-8K 的接口后缀写成 `/chat/completions`, 同表的 ERNIE-4.0-8K 是 `/chat/completions_pro`, 带日期的版本各有后缀, 如 `/chat/ernie-3.5-8k-0205`. 不带日期的名字会滚动指向最新的日期版本, 所以这条最早的通用路径背后的模型权重会随时间更换. 调试链接里的 `parent=ERNIE-Bot`, 是平台早期把这条接口叫 ERNIE-Bot 时留下的分类名. 列表页还写着输入字符上限 20000, 这个数报告没有.

在线调试截图 `images/p01-image-2.png` 更容易误导. 截图里的示例代码写 `url = "https://qianfan.baidubce.com/v2/app/conversation"`, Body 必填项是 `app_id`, 值 18984e58; 报告 Body 参数表里没有 app\_id 这个字段. 截图同时显示 「已鉴权」 横幅和 「检测到您的账号还未登录」 弹窗. 这张图只能说明调试控制台长什么样, **不能用来确认本接口的地址或参数**.

### 1.3. 鉴权: 两种方式, 只有一种用 Query

鉴权说明写的是两种方式: 访问凭证 access\_token, 以及基于 AK/SK 的签名计算. 不同方式调用方式不同, 请求头域和 Query 参数也不同. 请求参数一节说明, 只有 access\_token 方式需要 Query 参数, 也就是把 access\_token 挂在 URL 上; access\_token 由应用 API Key 和 Secret Key 换取. 全页示例都用 access\_token 方式, 步骤一先请求 `https://aip.baidu.com/oauth/2.0/token?grant_type=client_credentials`, 步骤二再调接口.

版式上有一处要小心: 源文把 「Body参数」 标题排在了第一张表之上, 但那张表只有 access\_token 一行, 属于 Query 参数; Body 参数从第二张表 (messages 开头) 才开始. 错误码一节给了唯一一个完整例子: access token 失效时返回 `error_code` 110, `error_msg` 为 「Access token invalid or no longer valid」, 需要重新获取 token 再请求. 其余错误码要跳到外链查.

## 2. 参数与限制

### 2.1. 长度相关的数字

型号名里的 8K, 页面没有解释. 参数表里能看到的输入上限是 5120 tokens, 出现在两处: functions 一行写 「message中的content总长度, functions和s[ystem] ... 5120 tokens」, system 一行又写了一遍. messages 一行第 (4) 条讲的是同一件事, 但在 「字段总」 处截断. 所以按表理解, **content, functions, system 三样合计不能超过 5120**.

输出由 max\_output\_tokens 控制: 设置时范围 [2, 2048], 不设置时最大 1024. 5120 加 2048 是 7168, 小于 8K; 页面没说两者是否共用一个窗口, 也没说 8K 是按 8000 还是 8192 算. 此外还有几组和长度有关但单位不同的上限: stop 每个元素不超过 20 字符, 最多 4 个元素; metadata 最多 16 个元素; functions 的数量不设上限, 但要计入 5120. 这些数各管各的, 引用时要连同所属参数一起写.

### 2.2. 采样参数的取值范围

temperature 和 top\_p 的默认值都是 0.8, 但区间不同. temperature 是 (0, 1.0], 表里明写 「不能为0」; top\_p 是 [0, 1.0], 可以取 0. 两者的说明文字都在关键处截断: temperature 只剩 「较高的数值会使输出更加随机, 而较低的数值会使其更」, top\_p 只剩 「取值越大, 生成文本的多样性」.

penalty\_score 用来对已生成的 token 加惩罚, 减少重复, 值越大惩罚越大, 默认 1.0, 范围 [1.0, 2.0]. 默认值就在下限上, 只能往更重的方向调. 把这三个参数放在一起看, 最容易出错的是照搬别家接口的习惯, 把 temperature 设为 0 求稳定输出, 在这张表里**那是区间外的值**.

### 2.3. 调用限制: 只有头的含义, 没有本型号的额度

响应头域一节列了四个限流头. X-Ratelimit-Limit-Requests 是一分钟内允许的最大请求次数, X-Ratelimit-Limit-Tokens 是一分钟内允许的最大 tokens 消耗, 输入输出都算. 两个 Remaining 头分别是达到 RPM, TPM 限制前剩下的请求数和 token 数, 用完后在 0-60s 内刷新. MinerU 把 `X-Ratelimit-Remaining-Requests` 在连字符处断成了两行, 看表时容易以为是两个头.

正文没有写 ERNIE-3.5-8K 的 RPM 和 TPM 是多少. 数值只出现在三个示例响应头里: Limit-Requests 300, Limit-Tokens 300000. 三个示例的 Remaining-Tokens 分别是 299971, 299741, 299994, Remaining-Requests 分别是 298, 299, 299. 这些示例的 Date 在 2024 年, 早于页面更新日期, 而且 Remaining 的扣减量和本次 usage 对不上号 (usage 在示例里被截断), **只能说明头的格式, 不能当作当前额度**.

### 2.4. 计费: 页面上没有价格

全页没有单价. 侧栏有一个 「平台计费」 链接, 那是导航, 内容不在材料里. 和计费直接相关的只有 usage 里的字段: prompt\_tokens, completion\_tokens, total\_tokens, prompt\_tokens\_details.search\_tokens (搜索独立计费 tokens 数) 和 search\_count (触发独立搜索计费次数).

prompt\_tokens 的定义分两种情况: 没触发独立搜索时, 是用户原始问题的 tokens 数; 触发时, 还要加上搜索相关的 tokens 数. disable\_search 默认 false, 也就是实时搜索默认开着. enable\_citation 和 enable\_trace 只控制是否返回角标和溯源信息, 不控制搜索本身; disable\_search=true 时这两个字段无效. 所以要控制账单, **管用的开关是 disable\_search, 不是 citation 或 trace**.

### 2.5. 请求体的其它开关

记忆: enable\_system\_memory 默认 false, 开启后 system\_memory\_id 必填, 这个 ID 来自 「创建系统记忆」 接口返回的 result 字段. 人设: system 字段用于设定角色, 和 functions 同时用时 「可能暂无法保证使用」 什么, 原句截断. 格式: response\_format 可选 json\_object 或 text, 默认 text, json\_object 「可能出现不满足效果情况」. 其余还有 stream (默认 false), user\_ip, user\_id, metadata.

函数调用: functions 是函数描述列表, 每个 function 有 name, description, parameters (JSON Schema, 无参数时写 `{"type": "object","properties": {}}`), 可选 responses 和 examples. examples 的类型是 List(List(example)), 可以给正例和反例; 反例里 assistant 的 function\_call name 为空, arguments 为 「{}」, thought 可填 「我不需要调用任何工具」, 旧的 List(example) 格式仍兼容. tool\_choice 提示模型选指定函数, 原文写明 「非强制」. 响应里的 function\_call 除 name 和 arguments 外还有 thoughts 字段, 请求里的 function\_call 说明表只有 name 和 arguments.

### 2.6. 响应字段和安全字段

finish\_reason 有五个取值: normal 表示完全由模型生成, stop 表示命中 stop 被截断, length 表示达到最大 token 数, content\_filter 表示内容被截断, 兜底或替换为 \*\*, function\_call 表示调用了函数. is\_truncated 标记结果是否被截断. 流式模式下多两个字段 sentence\_id 和 is\_end, 每块以 `data: {响应参数}` 发出; 同步模式返回一个完整 JSON.

安全相关有三个字段. need\_clear\_history 为 true 表示用户输入存在安全风险, 建议关闭当前会话, 清理历史. ban\_round 告诉你第几轮有敏感信息, 如果就是当前问题, 值为 -1. flag 的说明只剩 「返回flag表示触发安全」, 后半句截断, 具体取值没有.

## 3. 示例与家族位置

### 3.1. 示例本身的问题

**示例不是一次会话里抓的**. 单轮响应的 Date 是 Fri, 19 Jan 2024, created 1709711333 却是 2024-03-06 (UTC); 多轮响应 Date 是 2024-02-28, created 1709711455 是 2024-03-06; 函数调用第二次响应 Date 是 Mon, 12 Apr 2021, created 1693450180 是 2023-08-31. 只有流式示例两者一致, 都是 2024-02-28 02:02:31 UTC. 函数调用第二次响应还没有 X-Ratelimit 头, 和对话示例不同.

多轮函数调用示例前后对不上: 用户问 「上海市今天天气如何?」, 模型给的 arguments 也是 location 上海市, 但执行函数的 curl 写的是 location 北京市, 返回 temperature 「-1」, description 「大雪」. 单轮那组才一致: 上海市, temperature 「25」. 另外 messages 要求成员数为奇数, 奇数位为 user, 而多轮函数调用两次请求看得见的都只有 user, assistant 两条; 单轮函数调用第二次请求第 3 条的 role 是 function, 不是 user. 可能有截断, 页面上分不出.

### 3.2. 放回文心家族里看

放进文心家族, 这一页落在 ERNIE 3.0 论文和 ERNIE 4.5 技术报告之间的空档. 3.0 有完整论文, 交代了知识增强的预训练任务, 通用表示模块加任务表示模块的结构, 语料规模和评测协议; 4.5 有技术报告, 交代异构 [MoE](../../../../LargeLanguageModelGuide/2-核心原理与架构/2.6-MoE/2.6-MoE.md), 三段预训练, 后训练和部署. 3.5 夹在中间, 本材料只有接口文档: 没有参数量, 层数, 注意力形式, 位置编码, 没有语料规模和配比, 没有预训练日程, 没有 SFT 或 RLHF 的描述, 也没有评测表. 3.5 在架构上是否延续 3.0, 比如还保不保留 3.0 的任务表示塔, 报告给不出, 本文也不猜.

接口里能看到的, 是后训练做出来的行为, 不是后训练本身. 函数调用要求模型按 JSON Schema 产出函数名和参数, 响应里多一个 thoughts 字段, examples 支持正例和 「我不需要调用任何工具」 的反例; response_format 允许 json_object, 同时承认 「可能出现不满足效果情况」; system 和 functions 同时用时 「可能暂无法保证」. 由此看, 模型训练过工具调用和结构化输出, 而 **json_object 没有做成强约束解码**, 输出是否合法仍取决于模型自己. 用了什么数据, 是 SFT 还是 RL 训出来的, 页面没说, 这一段是按接口行为做的推测.

检索和安全更像平台侧的系统设计. 实时搜索默认开启, 搜索 token 单独计费, 返回 search\_info 和角标, 对应的是 **「检索增强」 路线**: 时效性靠外部搜索补, 不靠模型参数记住新知识. need\_clear\_history, ban\_round, flag 三个字段说明内容安全有一层独立判定, 能指出第几轮有问题; finish\_reason 里的 content\_filter 表明输出也会被截断或替换. 这层判定由模型自身完成还是外挂审核, 页面没有说.

长度上, 输入 5120 token, 输出最多 2048, 和后来的版本差得很远. 4.5 技术报告写明分三段预训练, 把 RoPE 基数从 10k 逐步调大, 上下文扩到 128K; 3.5 这一页连 8K 指什么都没解释. 千帆的模型退役表显示, ERNIE-3.5-8K 已于 2026-06-30 下线, 替代型号是 ERNIE-4.5-Turbo-128K, 所以报告描述的是一条已经停用的接口.

### 3.3. 这页能回答什么

能回答的: ERNIE-3.5-8K 对话接口的请求地址 (按报告示例), 两种鉴权方式, 全部请求参数名和类型, 以及表里给出的数: 输入合计 5120 tokens, 输出 [2, 2048] 默认 1024, temperature (0, 1.0] 默认 0.8, top\_p [0, 1.0] 默认 0.8, penalty\_score [1.0, 2.0] 默认 1.0, stop 每个 20 字符最多 4 个, metadata 最多 16 个; 限流头的含义和 0-60s 刷新; 搜索会单独计费; finish\_reason 五个取值和安全字段; 错误码 110 的例子.

不能回答的: 8K 指什么; ERNIE-3.5-8K 的 RPM, TPM 实际额度; 单价; 模型结构, 参数量, 训练数据和任何评测结果; flag 的取值; 调试截图里的 v2 app 接口和报告接口是什么关系. bi 里一共记了 10 处疑点, 集中在上下文长度, 输出上限, 采样参数区间, 限流头, 计费字段, 接口地址, 示例时间戳和函数调用示例的城市与温度. 需要额度和价格时, 应去侧栏 「平台计费」 所指的页面查, 报告给不出.
