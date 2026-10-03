> 源文 `glm.md` 是 Z.AI 文档站 「New Released」 页面的 MinerU 抓取, 6 页, 1 张图. 它是一张模型发布列表, 每一条只有日期, 名字, 两三句介绍和一个文档链接, 不是技术报告, 没有结构图, 训练配方和评测表.

# GLM 发布列表: 17 个日期, 17 个名字, md 在分页处丢了三个条目头

来源: 同目录 `glm.md` (页标记 `page 1 of 6` 到 `page 6 of 6`). 对照译稿和逐条疑点见 `glm-bi.md`. 凡是只在同目录 `glm.pdf` 里出现, md 没有抓到的句子, 下文都注明 「PDF 里」.

## 1. 材料性质: 文档站上的一张发布列表

页面标题是 「New Released」, 副标题 「Follow along with updates across Z.AI’s models」, 标题旁边有一个 「Copy page」 按钮, 下面只有一个分类 「Models」. 每个条目的格式都一样: 一行日期, 一行名字, 一到三段介绍, 最后一句 「Learn more in our documentation」 链到 `docs.z.ai/guides/` 下的某个页面. md 里每个链接前都多了一个 `.\*`, 对照 PDF, 那是链接图标被识别成了字符, 不是正文.

这份材料能回答的问题是: 2025 年 7 月到 2026 年 8 月, Z.AI 在文档站上登记了哪些发布, 每一条怎么介绍自己. 它回答不了 GLM 任何一代的层数, 训练数据, 训练算力和完整评测结果. 页面上带数字的句子不多, 第 5 节逐条列出; 要技术细节, 得顺着各条的文档链接去读, 或者看同家族目录下其他条目的源文.

## 2. 按时间排一遍

md 里有 16 个日期, 能和日期配上的名字只有 14 个. 对照 PDF 补齐后是 17 条, 按页面顺序 (从新到旧) 依次是: 2026-08-26 GLM-5.3-Flash, 2026-08-18 GLM-5.3, 2026-06-16 GLM-5.2 (日期和名字在 PDF 里), 2026-04-07 GLM-5.1, 2026-02-12 GLM-5, 2026-02-03 GLM-OCR, 2026-01-19 GLM-4.7-Flash, 2026-01-14 GLM-Image, 2025-12-22 GLM-4.7, 2025-12-11 AutoGLM-Phone-Multilingual, 2025-12-10 GLM-ASR-2512, 2025-12-08 GLM-4.6V, 2025-09-30 GLM-4.6 (名字在 PDF 里), 2025-08-11 GLM-4.5V, 2025-08-08 GLM Slide/Poster Agent(beta), 2025-07-28 GLM-4.5 Series, 2025-07-15 CogVideoX-3 (名字在 PDF 里).

没有哪一天挂了两个名字, 名字和日期在 PDF 里是一一对应的. 最密的一段在 2025 年 12 月: 8 日, 10 日, 11 日, 22 日各一条, 其中 10 日和 11 日只隔一天. 最长的空档是 2026-04-07 GLM-5.1 到 2026-06-16 GLM-5.2, 隔 70 天; 其次是 2025-09-30 GLM-4.6 到 2025-12-08 GLM-4.6V, 隔 69 天. 如果只看 md, GLM-5.2 没有日期, 5.1 之后的下一条就成了 2026-08-18, 空档会被误读成 133 天.

17 条里, 名字是 「GLM-数字」 这种主线编号的有 7 条 (4.5, 4.6, 4.7, 5, 5.1, 5.2, 5.3), 带后缀的衍生型号 6 条 (4.5V, 4.6V, 4.7-Flash, 5.3-Flash, OCR, ASR-2512), 其余 4 条是 GLM-Image, AutoGLM-Phone-Multilingual, Slide/Poster Agent 和 CogVideoX-3. 页面没有按类别分组, 全部挤在 「Models」 一个标签下, 只能按日期往下看.

## 3. 主线编号: 从 GLM-4.5 到 GLM-5.3

主线七条的自我介绍, 按时间顺序是这样的. GLM-4.5 Series (2025-07-28) 说自己是 「native agentic LLM」, 参数效率翻倍, 能一键兼容 Claude Code. GLM-4.6 (2025-09-30, 正文在 PDF 里) 说自己是 「the flagship coding model」, 上下文扩到 200K. GLM-4.7 (2025-12-22) 是 「foundation model」, 编程, 推理和智能体能力提升; PDF 里还有一段讲开源 SOTA, 目标驱动的多步编程任务, 以及前端和文档生成质量. GLM-5 (2026-02-12) 面向复杂系统工程和长程 Agent 任务, 原话是 「shifts the paradigm from coding to engineering」, 对标 Claude Opus 4.5, 并集成 DeepSeek Sparse Attention.

后三条接着往长任务和安全方向走. GLM-5.1 (2026-04-07) 单次运行可以独立工作 8 小时, 与 Claude Opus 4.6 「comprehensive capability alignment」, 训练方法只提了 multi-turn SFT, RL 和 process-quality evaluation framework 三个名词. GLM-5.2 (2026-06-16) 在 PDF 里有一条 「Supports 1M lossless context」, md 只留下开源 SOTA 和开发体验两句. GLM-5.3 (2026-08-18) 在 Z.ai Code Bench 上比 GLM-5.2 高 50%, 在 Terminal Bench 3.0 等公开基准上开源 SOTA; 另一半篇幅给了网络安全: 白盒代码审查和漏洞发现上与 Mythos 5 持平, 实际找到 2,436 个漏洞, 其中中危和高危 1,097 个.

把七条连起来看, 卖点的关键词一路在变: agentic, coding, foundation, engineering, long-horizon, 最后是 cybersecurity. 参照对象也在变: 5 对 Opus 4.5, 5.1 对 Opus 4.6, 5.3 对 Mythos 5, 动词分别是 「benchmarks against」, 「alignment」 和 「matches」. 这些比较都没有给分数, 只能当作官方的定位说法引用, 不能当成评测结论.

## 4. 主线之外: 视觉, 语音, 图像, 视频和智能体

两个 Flash 的写法差别很大. GLM-4.7-Flash (2026-01-19) 明说是 GLM-4.7 的免费版, 讲低延迟和高吞吐, 文档链接直接借用 GLM-4.7 的页面. GLM-5.3-Flash (2026-08-26) 没说自己和 GLM-5.3 是什么关系, 反而给了整页最具体的一组结构信息: 线性注意力和稀疏注意力混合, 总参数 320B, 激活 18B, 降低算力和 KV-cache 需求; 另外它有原生视觉能力, 能做办公文档和金融研究类工作流, 文档路径在 `guides/vlm/`.

视觉理解这一支有三条. GLM-4.5V (2025-08-11) 是 「100B-scale」 的开源视觉推理模型, 支持视频理解, 视觉定位, GUI 智能体, 并新增思考模式. GLM-4.6V (2025-12-08) 在图文任务上达到 SOTA, 上下文 128K. GLM-OCR (2026-02-03) 在 md 里只剩 「for fast inference」 半句; PDF 里写它由自研 CogViT 和 GLM-0.5B 组成编码器-解码器结构, 用十亿级图文对做 CLIP 预训练. 生成这一支: GLM-Image (2026-01-14) 用自回归做语义理解, 用扩散做解码, 完全在国产芯片上训练, 强调图内文字渲染; CogVideoX-3 (2025-07-15, 只在 PDF 里) 是视频生成模型的增量升级, 支持首尾帧合成.

剩下三条不是通常意义上的模型. GLM-ASR-2512 (2025-12-10) 是语音识别模型, 字错误率 0.0717, 增强了自定义词典和专业术语识别. AutoGLM-Phone-Multilingual (2025-12-11) 自称 「mobile automation framework」, 通过 ADB 操作 50 多个主流 App, 多语言指英文和中文两种. GLM Slide/Poster Agent (2025-08-08) 带 beta 标记, 是生成幻灯片和海报的创作智能体. 从文档路径看, 页面其实有分类: `llm` 下有 7 个地址, 正好对应主线七条, 其中 `glm-4.7` 这个地址在 md 里挂在 GLM-4.7-Flash 条目上, `vlm` 放 5.3-Flash, OCR, AutoGLM, 4.6V, 4.5V, `image` 放 GLM-Image, `audio` 放 ASR, `agents` 放 Slide/Poster; 但列表本身没把这些分类显示出来.

## 5. 页面上的数字

md 里能找到的数字, 连同原句的语境如下. 320B 总参数和 18B 激活 (GLM-5.3-Flash). 50% 提升 (GLM-5.3 对 GLM-5.2, Z.ai Code Bench). 2,436 个漏洞, 其中 1,097 个中高危 (GLM-5.3). 8 小时单次运行 (GLM-5.1). 字错误率 0.0717 (GLM-ASR-2512). 50+ 主流 App (AutoGLM). 128K 上下文 (GLM-4.6V). 100B 量级 (GLM-4.5V). 参数效率 「doubled」 (GLM-4.5). PDF 里另有三处: GLM-5.2 的 1M 无损上下文, GLM-4.6 的 200K 上下文, GLM-OCR 的 GLM-0.5B 和 「billions of image-text pairs」.

这些数字大多缺口径. 50% 只说了是自家基准, 没说基准内容和绝对分; 0.0717 没带单位, 也没说数据集; 「100B-scale」 没区分总参数和激活; 「doubled parameter efficiency」 没说和谁比. 1,097 约占 2,436 的 45%, 但中危和高危各多少没有拆. 上下文窗口的三个数放在一起也不单调: GLM-4.6 是 200K, 两个多月后的 GLM-4.6V 是 128K, 到 GLM-5.2 是 1M, 前两者一个是文本模型一个是视觉模型, 页面没解释差异. 引用时只能原样照抄, 不要换算, 也不要补口径.

## 6. md 在分页处丢了什么

源文 6 页, 共 5 个分页处, 每一处都丢了内容. 第 1 到 2 页之间丢了 GLM-5.2 的日期, 名字和第一条卖点 (1M 无损上下文). 第 2 到 3 页之间丢了 GLM-OCR 的两句介绍, 只剩句尾 「for fast inference」. 第 3 到 4 页之间丢了 GLM-4.7 的第二段和它的文档链接. 第 4 到 5 页之间丢了 GLM-4.6 的名字和一段半正文, 只剩 「complex agent tasks」. 第 5 到 6 页之间丢了 CogVideoX-3 的名字和全部正文, 只剩孤零零一个 2025-07-15.

除了分页丢失, 还有几处小问题. 行尾连字符被吞掉: 「real-world」 成了 「real world」, 「high-severity」 成了 「high severity」. 页脚的 「Yes」 和 「No」 两个按钮字样没抓到. 每页顶端多了一个 「Z」, 第 6 页图下多了一个 「g」, PDF 文字层里都找不到对应. 唯一那张图 `images/p06-g.png` 是页脚的四个社交图标 (X, GitHub, Discord, LinkedIn), 不是 「Copy page」 复制按钮, 文件名里的 「g」 取自图下那个孤立字母. 所以只按 md 统计, 会得出 「14 个模型」 的错误结论; 按 PDF 才是 17 条.

## 7. 这页能回答什么, 不能回答什么

能稳定回答的: Z.AI 文档站 「New Released」 列表在 2025-07-15 到 2026-08-26 之间登记了哪 17 条发布, 各自的日期, 名字和文档链接; 每一条官方怎么定位自己, 拿谁做参照; 少数几个带数字的说法, 比如 GLM-5.3-Flash 的 320B 总参数和 18B 激活, GLM-5.3 的 2,436 个漏洞, GLM-5.1 的 8 小时, GLM-ASR-2512 的 0.0717. 这些都停留在发布简介的层面, 抄的时候带上原文和链接就不会错.

不能回答的: 任何一代 GLM 的层数, 注意力具体怎么排布, 训练数据和训练算力; GLM-5.3-Flash 和 GLM-5.3 的关系; GLM-5.3-Flash 的稀疏注意力和 GLM-5 的 DeepSeek Sparse Attention 是不是一回事; Mythos 5 是谁; 各项比较的具体分数. `glm-bi.md` 里一共记了 20 处疑点, 集中在分页丢失, 名字和日期的对应, 链接路径, 数字口径和那张图上. 需要技术细节时, 应顺着各条文档链接去读, 或看同家族目录下有正文的条目.
