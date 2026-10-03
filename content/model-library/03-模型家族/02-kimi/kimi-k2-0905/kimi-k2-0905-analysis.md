# Kimi-K2-0905: 产品通告解析

> 公开材料是 Moonshot 平台博客的三页中文产品通告(源文约 3KB), 不是技术报告. 通告没有写 0905 的训练数据, 后训练方法和结构改动; 基准分数只来自 p2 配图, 按读图标出.

来源: 同目录 `kimi-k2-0905.md`(页标记 `page 1 of 3` 到 `page 3 of 3`). 对照译稿见 `kimi-k2-0905-bi.md`. 配图两张: `images/p01-kimi-k2-api.png`(题图), `images/p02-kimi-k2-0905-kimi-https-kimi-moonshot-cn-download-app.png`(基准柱状图). 数字与型号名以源 md 和配图为准.

## 1. 0905 在 K2 线上的位置

通告发表于 2025 年 9 月 5 日, 标签是 product 与 announcement. 口号行并列四项: Coding 能力再升级, 上下文窗口 256k, 最高 60-100 Token/s, 支持 Claude Code. 源文称它是「Kimi K2 模型的最新版本 0905」, 开放平台上架名 `kimi-k2-0905-preview`. 文末回顾初代: Kimi K2 最初发布于 7 月 11 日, 是 MoE 架构的开源基础模型, 总参数 10000 亿, 激活参数 320 亿.

所以 0905 是 0711 之后的一次版本迭代, 不是新底座. 同家族 `kimi-k2` 目录的技术报告讲的是 0711 那一代怎么做出来的: 数据改写, MuonClip 优化器, 大规模 Agent 数据合成与 RL. 0905 通告对这些面没有任何新说法. 它既没说数据换了没有, 也没说后训练加了什么, 更没说结构是否变化. 「总参 10000 亿 / 激活 320 亿」那句明确挂在「最初发布」的 K2 上, 不能直接当成 0905 的新披露. 按惯例, 同名版本号迭代多半沿用底座, 只动后训练(通告没有这样写).

## 2. 四条能力声明

正文四条卖点顺序固定. Agentic Coding: 在公开基准和真实编程任务中「均展现出更好的性能」. 前端编程: 提升代码的「美观度和实用性」. 上下文: 从 128K 升到 256K, 服务「复杂长线任务」. 高速 API: 输出「高达 60-100 Token/s」.

这四条都是官方定性或区间承诺, 没有消融, 没有训练细节, 没有采样超参. 上下文翻倍是怎么做到的, 通告没提. 初代 K2 的报告写明 128k 是在 32k 训练之后用 YaRN 频率外推得到的, 机制见 [长度外推: 从 PI 到 YaRN](../../../../llm-guide/2-核心原理与架构/2.5-长上下文与外推技术/RoPE/03-长度外推：从PI到YaRN的频率扩展.md). 0905 到 256K 是继续调外推系数, 还是补了更长序列的训练, 这页没有交代. 前端「美观度」更像后训练阶段偏好数据或奖励的调整带来的变化, 通告同样没说明. 引用时写成「官方宣称」最稳妥, 不要改写成「全面领先」或「恒定 100 Token/s」.

## 3. 基准图: 五项软件工程评测

p1 末句说在 SWE-bench Verified 等基准上「新版 Kimi K2 模型的表现如下」, 然后翻到 p2 配图. 图里有三组柱子: Kimi-K2-0905, Kimi-K2-0711, Claude Sonnet 4, 共五项评测. 下表数字全部是读图所得, 源文正文没有转录:

| 评测(读图) | K2-0905 | K2-0711 | Claude Sonnet 4 |
| --- | --- | --- | --- |
| SWE-bench Verified | 69.2 | 65.8 | 72.7 |
| SWE-bench Multilingual | 55.9 | 47.3 | 53.3 |
| Terminal-Bench | 44.5 | 37.5 | 36.4 |
| Multi-SWE-bench | 33.5 | 31.3 | 35.7 |
| SWE-Dev | 66.6 | 61.9 | 67.1 |

读图可见, 0905 在五项上都高于 0711, 其中 SWE-bench Multilingual 高 8.6 分, Terminal-Bench 高 7.0 分, 涨幅最大(按图上标注相减). 对 Claude Sonnet 4, 0905 在 SWE-bench Multilingual 和 Terminal-Bench 上领先, 在 SWE-bench Verified, Multi-SWE-bench, SWE-Dev 上仍落后. 图上没有注明评测框架, 尝试次数或是否用了多次采样, 这些条件缺失时, 分数只能当作同一方自测的相对比较.

## 4. 开放平台的五件事

p2 先写消费端: Kimi 应用和网页版「已全量升级到 0905 最新版」. 再写开放平台: 链接文案拼成 `pplatform.moonshot.cn`(源文如此), 实际 href 指向 `https://platform.moonshot.cn/`. 高速版 `kimi-k2-turbo-preview` 「已同步升级新模型」, 速度口径 60-100 Token/s. 开放平台条目有五件可核对的事: 上下文 256K; Token Enforcer 保证 toolcall 100% 格式正确; 完全兼容 Anthropic API, 支持 WebSearch Tool, 改善 K2 + Claude Code 的体验; 全自动 Context Caching, 节省 Input Token; 定价与 0711 版相同.

这里有两项属于推理侧机制. Token Enforcer 通告没解释实现, 按名字和 K2 公开的工具调用格式看, 它应是一种约束解码: 模型输出进入工具调用段后, 只允许生成符合工具名和 JSON schema 的 token. 开源社区给 vLLM 加 Kimi K2 结构化标签约束时, 用的也是这个思路. 注意「100%」只保证格式合法, 不保证选对工具或参数语义正确. Context Caching 则是前缀 KV cache 复用, 请求开头与之前请求相同的部分不再重算, 平台按缓存命中计价. 两者都不改变模型权重, 却直接影响 Agent 场景的可用性和成本.

## 5. 自托管, 接入名单与资料夹

自托管只有一句: 可在 Hugging Face, ModelScope 等平台下载. 没有许可协议, 量化档位或推荐显存. 接入名单点到 Cursor, Windsurf, Trae, Cline, RooCode, Kilo Code, 并称国内外云厂商均已部署. 这些是生态事实, 不是能力证据.

p3「Kimi K2 资料夹」列了四条链接: 技术博客, arXiv `2507.20534`, GitHub `moonshotai/kimi-K2`, 一条知乎讨论; 页脚是 2026 © Moonshot AI. 资料夹只是入口清单, 报告正文不在这三页里. 想看 K2 的数据, 优化器和后训练, 应读同家族 `kimi-k2` 目录下的报告解析; 0905 相对 0711 改了哪些训练环节, 目前公开材料里没有答案.
