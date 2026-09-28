# Kimi K2.8 Preview: 更新日志里的一次原地换模型

[OM-FREEPLAY] 材料不够 5000. 源文是 Kimi Code 文档的 What's New 更新日志, 32 页里写 K2.8 Preview 的只有第 4 至 5 页的一小段: 上线日期, Model ID, thinking 档位, 上下文长度和几句定性比较. 没有架构, 数据, 训练过程和基准分数. 下文不补写这些, 用到的外部文档都标了出处.

来源: 同目录 `kimi-k2-8-preview.md`(页标记 `page 1 of 32` 到 `page 32 of 32`), 取自 Kimi Code Docs 的 What's New 页. 对照译稿见 `kimi-k2-8-preview-bi.md`. 源文没有配图.

## 1. 材料是什么, 模型段落在哪

这是一份按时间倒序排列的产品更新日志, 从 2026 年 9 月 23 日的 CLI v2.1.0 一直往回写到 5 月的初版 CLI. 绝大部分条目是 Kimi Code CLI, Web 和 Desktop 的功能: 权限模式, Remote Control, Tower 多智能体, 插件, Goal 模式, 会话管理. 标着 MODEL RELEASE 的只有三处: 9 月 11 日的 K2.8 Preview(第 4 至 5 页), 7 月 16 日的 Kimi K3(第 15 至 16 页), 6 月 12 日的 Kimi K2.7 Code(第 25 页).

所以这篇解析的对象只是一段几百词的发布说明. 其余页面里和模型有关的, 是 CLI 怎么组织送进模型的上下文: 思考内容跨轮保留, 上下文压缩, 图片降采样, 工具按需加载. 这些不是模型本身的机制, 但决定了在 Kimi Code 里用到的 K2.8 实际看到了什么, 下文第 5 节单独讲.

## 2. K2.8 Preview 这一段说了什么

9 月 11 日, K2.8 Preview 在 Kimi Code 全量上线. Model ID 没变, 仍是 `kimi-for-coding`, 客户端和第三方工具不用改配置. 能力只有定性描述: 编码和 agent 能力全面提升, 思考效率「明显高于 K2.7 Code」, 整体表现「接近 K3」. 没有对照表, 没有基准名, 没有百分比, 这些比较不能当成可复现的结论引用.

另外两条是可操作的契约. 一是 thinking 档位和 K3 相同, 分 `low`, `high`, `max` 三档, 默认 `max`. 二是上下文最高 1M, 所有会员档都能用. 对照同一份日志里的 K3 发布段, K3 的 1M 窗口要 Allegretto 及以上会员才解锁; K2.8 把 1M 放给全部会员, 说明它在产品里是面向日常编码的默认模型, 长窗口不作为高价档的卖点.

这里有一个本页解释不了的变化. K2.x 这条线, 从 K2.5 到 K2.7 Code 都是 256K 上下文, K2.7 Code 的规格表还和 K2 逐项相同; K2.8 直接到了 1M. 它是在 K2 骨架上做了长上下文扩展, 还是换成了别的底座, 日志一个字没提. 1M 和 K3 相同, 思考档位也和 K3 相同, 但这只是产品参数对齐, 不能据此推断 K2.8 用了 K3 的 KDA 或 Attention Residuals. K3 的结构见 [K3 的解析](../kimi-k3/kimi-k3-analysis.md).

## 3. ID 不变和关 thinking 的路由

「ID 不变」意味着换代发生在服务端: 同一个 `kimi-for-coding`, 9 月 11 日之前指向旧模型(6 月那条说 K2.7 Code 在 Kimi For Coding 上可用, 按此推断是 K2.7 Code), 之后指向 K2.8 Preview. 对用户是零成本升级, 对复现是个坑. 同一个 ID 在不同日期跑出的分数可能来自不同权重, 记实验时要写日期, 最好写明当时 ID 对应的模型版本. Kimi Code 的模型配置页(外部文档, 不在本页)有一张 ID 对照表, 写明 `kimi-for-coding` 当前对应 K2.8 Preview.

路由规则只有一句: 关掉 thinking 时, 发给 K3 系列和 K2.8 Preview 的请求都由不带思考的 K2.8 Preview 处理. 反过来说, 在 Kimi Code 里没有「不思考的 K3」, 选了 K3 又关 thinking, 实际跑的是 K2.8. K2.7 Code 时期的规则是关 thinking 转给 K2.6, 这次改成转给 K2.8 自己, 说明 K2.8 同时承担思考和非思考两种服务, 不再需要旁边挂一个通用模型.

档位怎么映射, 模型配置页有说明(外部文档): 工具传 `ultra`, `max`, `xhigh` 映射到 `max`; `high`, `medium` 映射到 `high`; `low`, `minimum`, `light` 映射到 `low`; `none` 等于关掉 thinking; 不认识的值返回 HTTP 400. 所以第三方工具里选 「medium」 的用户, 实际拿到的是 `high`. 这也说明三档是离散的思考预算档, 不是连续可调的长度参数.

## 4. 和 K2.7 Code, K3 的前后关系

K2.7 Code 的发布段在第 25 页: 6 月 12 日开源, 只在开 thinking 时生效; 相对 K2.6, Program-Bench +10.4%, MCP Mark Verified +11.4%, SWE Marathon +76.2%, 推理 token 少 30%. 其中 Program-Bench 的涨幅和 K2.7 Code 产品页写的 +11.0%(53.6 对 48.3)不一致, 两处差 0.6 个百分点, 可能是版本或口径不同, 本页没有解释. SWE Marathon 只出现在这里, 产品页没有这一项. 详见 [K2.7 Code 的解析](../kimi-k2-7-code/kimi-k2-7-code-analysis.md).

K3 的发布段在第 15 至 16 页: 总参 **2.8 万亿**, 用 KDA 混合线性注意力和 Attention Residuals, 原生视觉, 最高 1M 上下文; 宣称优于 Opus 4.8 和 GPT 5.5, 内核优化这类难任务上接近最强闭源模型. 这些是 K3 的参数, 不属于 K2.8.

时间顺序是: 6 月 K2.7 Code, 7 月 K3, 9 月 K2.8 Preview. K2.8 晚于 K3 两个月出现, 定位是「接近 K3 但更省」, 在 Kimi Code 里承担日常编码和非思考请求, K3 留给要求更高的任务. 两者在训练上有没有关系, 比如是否共享数据或后训练流程, 日志没有说.

## 5. CLI 怎么改变模型看到的上下文

在 Kimi Code 里评测 K2.8, 模型看到的不只是用户的消息. 7 月 2 日的 v0.22.0 起, 开 thinking 时默认跨轮保留思考内容, 模型可以接着之前的思路往下想, 设 `[thinking] keep = "off"` 可关. 这和 API 侧 K2.6 默认不保留, K2.7 Code 强制保留的规则相对应; K2.8 在 CLI 里默认保留. 同一版还加了实验性的 `select_tools`, 让模型按需加载 MCP 工具, 不在每次请求里塞全部工具定义, 以保住 prompt cache.

上下文满了怎么办, 日志也有交代: provider 返回 413 上下文溢出时先压缩再重试, 压缩输出默认封顶 128k token; 会话累计图片视频超过 20 MB 时丢掉最旧的媒体并警告; 超出模型限制的图片先降采样再送进去. 切换模型或 effort 会让现有 prompt cache 失效, `/model` 和 `/effort` 会提示改用 `/new`. 还有一条环境变量 `KIMI_CODE_PERMISSION_MODE_REMINDER`, 设为 0 后不再往模型上下文里注入自动权限模式的提醒. 思考语言也被规定为跟随用户语言, 代码和术语保持原样.

这些规则叠在一起, 意味着 CLI 里的 K2.8 和直接调 API 的 K2.8 看到的上下文可能差很多. 复现长会话任务时, 至少要记下: thinking 档位, 是否跨轮保留思考, 有没有触发压缩, 有没有丢媒体, 用的是 CLI, Desktop 还是 API. 日志没有给压缩质量或缓存命中率的任何数字.

## 6. 速度档, 额度和评测的空白

7 月 9 日上线的 HighSpeed 档, 日志说和 Standard 是同一个模型, 编码能力相同, 输出速度约 **5 至 6 倍**, 第三方工具把 ID 设为 `kimi-for-coding-highspeed`, 需要 Allegretto 及以上. 但模型配置页(外部文档)写的是 `kimi-for-coding-highspeed` 对应 K2.7 Code HighSpeed, 上下文 262,144, 额度消耗 3 倍. 也就是说, K2.8 上线后 HighSpeed 档仍停在 K2.7 Code, 标准档和高速档此时已经不是同一个模型, 日志里「同一模型」那句是 7 月的说法.

评测这一面, 本页是空的. 没有任何基准分数, 没有采样参数, 没有 harness 说明, 「接近 K3」和「思考更省」都没有量化. 能核对的只有日期, ID, 档位, 窗口, 会员门槛和路由规则. 放回家族里看, 前面几代至少有技术报告, 发布博客或产品页, K2.8 Preview 只有一条更新日志, 而且沿用旧 ID 原地替换; 要知道它是怎么训出来的, 只能等技术报告或模型卡.
