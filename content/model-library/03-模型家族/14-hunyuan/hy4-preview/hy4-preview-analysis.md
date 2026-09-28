[OM-FREEPLAY] 材料不够 5000. 源材料是 Hugging Face 上 tencent/Hy4-preview 模型卡的网页打印件, 共 13 页, 不是技术报告. 下文只整理页面印出的规格, 能力描述, 一张柱状图, 一张评测大表和部署命令, 不补结构, 不引用 DeepSeek-V3.2 或 IndexCache 论文里的配置, 也不用同家族 hy3 目录的任何内容.

# Hy4 preview 模型卡: 一张规格表, 一张 46 行的评测表

来源是同目录 `hy4-preview.md`, 由 MinerU 从 `hy4-preview.pdf` 抽出, 第 1 页到第 13 页, 引用了 10 张图. 逐段对照和疑惑在 `hy4-preview-bi.md`. md 丢字, 多空格或漏掉的段落, 按 PDF 文字层和 PDF 渲染图核对过, 源文件没有改动.

## 1. 材料是什么, 什么时候抓的

这是一张 Hugging Face 模型页, 用浏览器存成了 PDF. 每一页的页眉都印着 「2026/9/25 13:12」 和标签页标题 「tencent/Hy4-preview」, 站点名 Hugging Face, 页脚印着网址和页码. 页面上下两头是站点的界面: 搜索框, 点赞和关注按钮, Downloads last month, Inference Providers 试用框, 页脚的 Company 和 Website 两栏. 中间是仓库作者写的模型卡正文, 从 「Tencent Hy」 标题开始, 到 「Hy4 preview is developed by the Tencent Hy Team.」 结束.

2026 年 9 月 25 日 13:12 是抓取时间, 不是发布日. 13 页的页眉时间完全相同, 精确到分钟, 这是打印时刻的特征. 正文里的 News 只写 「We open-source Hy4 preview and Hy4 preview-FP8」, 没有日期. 侧面线索有两条: 合集 「Updated 9 days ago」, 按抓取时刻倒推在 9 月 16 日前后; 「Downloads last month」 已有 21,213 次. 它们只能说明权重在 9 月 25 日之前就公开了. 发布日在引用时只能写 「页面未印」.

## 2. 两篇 arxiv 标签都不是 Hy4 的报告

页面顶部挂了两个 arxiv 标签, 2512.02556 和 2603.12201. 第 2 页 「Papers for tencent/Hy4-preview」 印出了标题: 前者是 「DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models」, 后者是 「IndexCache: Accelerating Sparse Attention via Cross-Layer Index Reuse」. 第 4 页正文在讲注意力模块时各引用了一次, 一篇对应 DeepSeek Sparse Attention, 一篇对应跨层索引复用.

所以 Hy4 preview 没有自己的技术报告, 至少这 13 页里没有. 模型卡上关于结构的全部信息, 是第 4 页的两段文字和第 4 页, 第 5 页的一张规格表. 这张页面把结构名词交代了, 机制没有交代. 读这份材料时不能拿 DeepSeek-V3.2 论文里的配置去填 Hy4 preview 的空白, 两者是不同的模型.

## 3. 规格表: 770B 总参数, 49B 激活, 另有 10B 的 MTP 层

第 4 页正文说 Hy4 preview 是 MoE 旗舰模型, 总参数 770B, 每个 token 激活 49B. 主干 78 层, 第 1 层是稠密 FFN, 其余 77 层是 MoE, 每层 256 个路由专家加 1 个共享专家, 每个 token 选前 8 个路由专家, 再加上共享专家. 主干之外有 1 个原生 MTP 层, 总参数 10B, 激活 0.7B, 用于投机解码. 规格表还给了: 隐藏维度 6144, 注意力头 64, Query 压缩维度 2048, Key-Value 压缩维度 512, Indexer 32 头每头 128 维, Indexer top-k 2048, 残差流 4 条, MoE 中间维度 2048, FFN 中间维度 18432, 上下文 1M, 词表 120832.

第 1 页 Safetensors 栏写的是 「780B params」, 和 770B 差 10B. 第 4 页规格表上方有一句 「The table below lists backbone parameters only, excluding the MTP layer」, 770B 加上 MTP 层的 10B 正好是 780B. 两个数都对: 模型卡说的是主干, Hugging Face 按仓库文件统计的是全部权重. 引用时要写清口径.

计数上也能对上: 1 层稠密加 77 层 MoE 是 78 层; 每层 257 个专家里每个 token 用到 9 个, 约 3.5%; 49B/770B 约 6.4%, 比 3.5% 高, 多出来的部分只能落在每个 token 都要经过的参数上. 这些参数具体各占多少, 页面没给, 单个专家的参数量也没给, 所以只能核到比例方向一致, 核不到具体数值.

## 4. 结构名词: Gated DSA, IndexCache, iHC, 只有名字

第 4 页第二段说, 受 DeepSeek 和 GLM 启发, 注意力模块用 Gated DeepSeek Sparse Attention, 简称 Gated DSA, 并用 IndexCache 做跨层稀疏索引复用; 残差通路用 iHC (identity Hyper-Connections) 扩展层间信息流. 三个名词各带一个链接, DSA 链到 DeepSeek-V3.2 论文, IndexCache 链到它自己的论文, iHC 链到一篇知乎专栏.

「Gated」 只出现在名字里, 13 页里没有一句解释门控加在哪里. 「inspired by DeepSeek and GLM」 里 GLM 对应哪个组件, 也没说. 规格表的 「Residual Streams 4」 看上去和 iHC 有关, 「Indexer top-k 2048」 看上去和稀疏注意力有关, 但页面没有把表格行和正文名词连起来. 这一节能记下的只有名称, 链接和表里的数, 不能再多.

## 5. 柱状图和评测大表是同一套数

第 6 页 `p06-built-for-productivity.png` 是全文唯一的数据图, 12 格柱状图, 每格一个评测: Terminal Bench 2.1, DeepSWE, ProgramBench, SWE Atlas Refactoring, ALE-CLI, Toolathlon-Verified, APEX-Agents, PostTrainBench, OneMillionBench, BioMysteryBench, HLE (不带工具), HorizonMath. 每格最左是 Hy4 preview 的蓝柱, 柱里浅蓝一截是 Hy3, 对手是灰柱, 从低到高排. 图上的数和第 8 页大表一致, 大表一格两个数时, 图取带星号的那个, 例如 Terminal Bench 2.1 的 DeepSeek V4 Pro 0813 取 80.3 而不是 87.9.

按图上的数, Hy4 preview 在 12 格里没有一格是最高. 最接近的是 PostTrainBench, 35.6 对 GPT 5.6 Sol 的 36.2; 最靠后的是 ALE-CLI, 22.8 只高过 DeepSeek V4 Pro 0813 的 21.9. 大表 46 行里, Hy4 preview 严格第一的只有 SWE Atlas - Codebase Q&A 一行, 64.0 对 58.1, 这一行没有进图.

## 6. 评测大表: 46 行全部高于 Hy3

大表分五类: 智能体编程 16 行, 智能体搜索 5 行, 办公智能体 15 行, 理工科智能体 2 行, 推理 8 行, 共 46 行. 列是 Hy3, Hy4 preview, 以及 DeepSeek V4 Pro 0813, Qwen 3.8 Max, GLM 5.3, Kimi K3, GPT 5.6 Sol, Claude Opus 5 六个对手. 有 9 行标 「(Internal)」, 是腾讯内部评测集, 例如 Hy-Backend 2.0, Hy-CompanyBench V2, E-Bench, Hy-FinmodelBench v2.

Hy4 preview 对 Hy3 的 46 行全部上升. 涨得最多的是 DeepSWE, 28.0 到 64.3, 多 36.3 分; MathArena Apex 2025 多 35.5 分; SWE Atlas 代码库问答多 33.2 分. 涨得最少的是 Hy-BrowseComp-Pro2 多 1.1 分, GPQA Diamond 多 1.4 分, WideSearch 和 WorkspaceBench 各多 2.0 分. GDPval-AA V2 是 Elo 分, 从 1213 到 1678. 第 5 页 「the largest generation-over-generation gain we've measured」 这句话, 能找到的数字依据就是这两列, 但 「最大」 是和哪几代比, 页面没说.

## 7. md 漏掉的表格注释

PDF 里评测大表是一整张位图, 从第 8 页延续到第 9 页顶部, 下面还有一段灰色小字 「Notes」. MinerU 把表格识别成了 HTML, 却把 Notes 整段丢了, 所以 md 里的星号没有解释. 注释第一句是 "For each model, we evaluate and report results at the highest available reasoning setting, and results with* are from our own testing「, 带星号的是腾讯自测. 标 」(official)" 的 GDPval-AA V2 和 CritPt 整行没有星号. 一格两个数时, 斜杠后带星号的是自测, 斜杠前应是外部公布值, 后半句是按注释推出来的.

注释里还有几处影响读数. 它逐项写了评测框架, 例如 Terminal Bench 2.1 用 Claude Code 框架, 最多 500 轮, 每次 12 小时上限, 资源 16 核 32 GB; SWE-Marathon 把智能体超时设成官方值的两倍. 讲 ProgramBench 时写的是 「DeepSeek-V4-Pro-0803」, 表头和图例都是 0813, 页面没有解释这处差异. 最后一句说八项推理评测里有五项 Claude Opus 5 用 high 档, 其他模型用 max 档, 和第一句的 「highest available reasoning setting」 口径不同. 这些只在 PDF 里, bi 里按 PDF 补读, 源 md 没动.

## 8. 盲评: 2.99 分, 满分未知

第 7 页说, 他们和 CodeBuddy, WorkBuddy 等腾讯产品一起设计 Hy4 preview, 并做了一次盲评并排对比: 163 位内部专家在 203 个工程任务上打分. Hy4 preview 对 GLM 5.3 是 2.99 比 2.92, 胜 46.8%, 平 12.8%, 负 40.4%; 对 Kimi K3 是 2.99 比 2.94, 胜 51.2%, 平 7.9%, 负 40.9%. 两组胜平负加起来都是 100%.

页面没写满分是多少, 所以 0.07 和 0.05 的平均分差距是大是小无从判断, 页面自己的措辞是 「slightly ahead」. 负的比例两场都在 40% 以上. 盲评只请了 GLM 5.3 和 Kimi K3 两个对手, 大表里的 GPT 5.6 Sol, Claude Opus 5 等四家不在其中. 任务怎么选, 每位专家评多少, 都没交代.

## 9. preview 和正式版是两件事

第 9 页 Known Limitations 第一句是 「This is an early version of Hy4」, 后面又说 「it's how we will get Hy4 right」. 前一句说的是现在发布的 preview, 后一句说的是还没到来的 Hy4, 用的是将来时. 页面拿 Hy3 当先例: 先有 Hy3 preview, 用户反馈之后 「made Hy3 substantially better」. 大表的对比列写的是 「Hy3」, 不带 preview. 注释还有一句 「Certain Hy3 benchmark scores may differ from previously reported results」, 说明 Hy3 的分数前后更新过.

所以这个目录里的数字只属于 Hy4 preview. Hy4 正式版什么时候发, 权重会不会换, 分数会不会变, 页面都没说. 已知问题有两条: 复杂任务上推理时间比必要的长, 以及倾向于反复验证自己的工作, 都没有给数字. Hy4 preview-FP8 是量化版, 也属于 preview, 不是正式版.

## 10. 开源内容和部署命令

第 10 页 Model Links 表只有两行, Hy4 preview 和 Hy4 preview-FP8, 描述分别是 「Instruct model」 和 「FP8 quantized instruct model」, 在 Hugging Face, ModelScope, GitCode, CNB 四个平台都有. 13 页里没有基座模型. 推荐参数是 temperature 0.9, top_p 1.0; 推理模式默认 「high」, 想直接回答就在 extra_body 里传 reasoning_effort 为 「no_think」. md 把这几个参数识别成了 「0. 9」, 「1. 0」, 「extra\_ body」, 多了空格, PDF 文字层没有.

vLLM 和 SGLang 两段命令加载的都是 tencent/Hy4-preview-FP8, 都是 8 路张量并行, 都开了投机解码. vLLM 写 「method」:「mtp」, 3 个投机 token, 注意力后端 FLASHMLA_SPARSE, 解析器 hy_v4; SGLang 写 NEXTN, 3 步, 草稿 token 4 个. vLLM 命令 「--speculative-config」 那一行漏了续行反斜杠, PDF 文字层也一样, 照抄会断成两条命令. SGLang 命令在 md 里写成 「--model.tencent」, PDF 是 「--model tencent」, 镜像名被截成 「hy4-prev:」. 页面没写 GPU 型号和显存要求.

## 11. 十张图: 九张界面小图, 一张柱状图

第 1 页六张: `p01-2026-9-25-13-12.png` 是 Tencent 组织头像, `p01-search-models-datasets-users.png` 是 Hugging Face 笑脸标志, `p01-tencent-https-huggingface-co-tencent-hy4-preview-https.png` 是菜单按钮, `p01-community.png` 是挥手表情, `p01-downloads-last-month.png` 是 Community 标签页的讨论数徽标 13, `p01-safetensors.png` 是下载量走势小图. 第 3 页 `p03-2026-9-25-13-12.png` 是 Official Website 前的显示器表情. 第 13 页 `p13-2026-9-25-13-12.png` 是页脚 System theme 处的笔记本图标, `p13-https-huggingface-co-tencent-hy4-preview.png` 又是笑脸标志. 这九张在 340 到 7317 字节之间.

它们都是从网页截图里切下来的界面小块, 不是整页截图, 也不是结构图. 文件名是 MinerU 按上下相邻的文字取的, 三张叫 「2026-9-25-13-12」 的, 名字取自页眉时间, 画面却是头像和图标; 讨论数徽标叫 「downloads-last-month」, 走势图叫 「safetensors」, 都和画面对不上. 唯一和内容相关的是 `p06-built-for-productivity.png`, 122476 字节的 12 格柱状图, 名字取自紧跟其后的小节标题. 第 3 页的许可证和托管站点徽标在 PDF 里是十张位图, md 把上面的字转成了链接文字, 没有存成图片.

## 12. 这张页面能支撑和不能支撑的说法

能直接引用的有: Hy4 preview 是腾讯混元团队的 MoE 模型; 主干总参数 770B, 激活 49B, 78 层, 每层 256 个路由专家加 1 个共享专家, 每个 token 激活 8 个路由专家加共享专家; 另有 10B 的 MTP 层用于投机解码, 仓库总计 780B; 上下文 1M, 词表 120832; 注意力叫 Gated DSA, 配 IndexCache, 残差用 iHC; 开源 instruct 和 FP8 两个版本, Apache 2.0 许可; 评测大表 46 行全部高于 Hy3; 对 GLM 5.3 和 Kimi K3 的盲评略占上风.

不能从这张页面得出的有: 发布日期; 训练数据量和训练步数; Gated DSA 的门控形式, IndexCache 和 iHC 的具体做法; 单个专家的参数量; 盲评分数的满分; Hy4 正式版的时间和数字. 评测数字里带星号的是腾讯自测, 9 行是内部评测集, 引用时要注明. 需要这些信息时要另找来源, 并注明来源不是这张模型卡.
