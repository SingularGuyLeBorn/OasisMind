# MiniCPM-V 2.6 模型卡分析: 8B 参数, 640 个视觉 token 的一页说明书

- 源文: 同目录 `minicpm-v-2-6.md`, 14 页, 28 张图, 抓自 Hugging Face 上的 openbmb/MiniCPM-V-2\_6 模型页.
- 对照稿: 同目录 `minicpm-v-2-6-bi.md`, 逐段英文在前, 中文在后.
- 身份: MiniCPM-V 系列当时最新的一代, 由 SigLip-400M 和 Qwen2-7B 搭成, 页面写总参数 8B, 权重 BF16.
- 输入: 单图, 多图, 视频; 单图最高约 180 万像素 (例如 1344x1344), 任意长宽比.
- 效率: 180 万像素的图只产生 640 个视觉 token, 表中 token 密度 2822.
- 单图: OpenCompass 平均 65.2, OCRBench 852, Object HalBench 8.2.
- 多图: Mantis Eval 69.1, BLINK val 54.1, Mathverse mv 84.9, Sciverse mv 74.9, MIRB 53.8.
- 视频: Video-MME 无字幕 60.9, 有字幕 63.6.
- 部署: transformers 4.40.0, int4 版约 7GB 显存, 支持 llama.cpp, ollama, vLLM, Gradio.
- 许可: 代码 Apache-2.0; 权重按 MiniCPM Model License, 学术免费, 登记问卷后可免费商用.

这一页同时是产品介绍, 评测报告和部署手册. 它给出的数字足够核对 token 密度, 逐列比较各家分数, 估算权重体积, 但给不出语言模型层数, 隐藏维度, 视觉编码器和语言模型之间的连接结构, 也没有训练数据配比.

下面先讲材料本身, 再依次读规格, token 密度, 三张评测表, 雷达图, 示例和部署, 最后整理谱系和缺口.

## 1 材料的性质

这是 Hugging Face 模型页的整页打印. 第 1, 2 页是站点侧栏和页头: 点赞 1.06k, 上月下载 31,228, 适配器 24 个, 微调版 14 个, 量化版 14 个, 使用它的 Space 45 个, 两个合集分别有 32 项和 33 项. 训练数据集一栏只挂了 openbmb/RLAIF-V-Dataset, 关联论文是 arXiv 2408.01800 「MiniCPM-V: A GPT-4V Level MLLM on Your Phone」, 发布于 2024 年 8 月 3 日. 页面还是 gated 仓库, 要登录并接受条件才能看文件.

侧栏这些数字反映的是打印那一刻的社区热度, 不是模型能力. 模型树里适配器 24 个, 多于微调版和量化版各 14 个, 说明社区更常在它上面挂轻量适配器, 而不是整模型再训. 上月下载 31,228 次, 考虑到页面上已经有了后继的 o 2.6, 这个数说明 V 2.6 仍有人在用. 这些数会随时间变化, 引用时要带上抓取日期, 本页没有印出抓取日期.

第 3 页起才是 README 正文. 开头是一条 2025 年 1 月 14 日的新闻, 宣布开源 MiniCPM-o 2.6. 这说明打印这一页时, V 2.6 已经不是这个团队最新的模型, 但 README 正文仍然写着 「the latest and most capable model in the MiniCPM-V series」. 两句话并不矛盾: o 2.6 属于另一条产品线, 名字里的字母不同, 仓库也不同. 读这一页要一直记住, 页上所有的评测数字都属于 V 2.6, o 2.6 在这里只有一句 「significant performance improvement」, 没有任何数字.

正文的信息可以分成三类. 第一类是规格和部署数字, 例如 8B, BF16, 640 个 token, 7GB, 这些可以直接引用. 第二类是评测表里的分数, 可以互相比较, 但要先弄清星号, 指标方向和闭源模型的估算口径. 第三类是宣传句, 例如 「surpasses ... Claude 3.5 Sonnet」, 「state-of-the-art on ... BLINK」, 它们需要拿表格来验, 而验的结果并不都成立.

## 2 身份: 8B 由哪两块拼成

页面对结构只写了一句: 「built on SigLip-400M and Qwen2-7B with a total of 8B parameters」. SigLip-400M 是视觉编码器, Qwen2-7B 是语言模型底座. 名义值相加是 0.4B + 7B = 7.4B (估算), 与 8B 差 0.6B. 这个差额有两个来源可以想到: 档位名本身取过整, 以及视觉特征接进语言模型需要一层连接模块. 页面对连接模块的类型和规模一个字都没写, 所以这 0.6B 拆不开. 侧栏的 「Model size 8B params」 同样是取整显示, 页面没有给到个位的精确参数量.

按 BF16 每参数 2 字节算, 8B 参数的权重约 16 GB, 合 14.9 GiB (估算). 第 12 页说 int4 量化版 「lower GPU memory (7GB)」. 如果只看权重, 8B 按 4 bit 算约 4 GB (估算), 与 7GB 之间的约 3GB 要留给激活, KV cache 和图像编码的中间结果; 页面没说视觉编码器是否也量化成 int4, 也没给测 7GB 时的输入分辨率和上下文长度. 所以 7GB 只能当 「这张卡大概够用」 的参考.

这是稠密结构. 每个 token 走完整的语言模型, 视觉部分每张图 (或每个切片) 走一次编码器. 页面没有 MoE 相关内容, 也没有给语言模型的层数, 头数, 是否用 GQA, 上下文长度. 这些在 Qwen2-7B 的资料里能查到, 但本稿只写这页印出来的数, 不从别处搬.

## 3 token 密度: 640 个 token 的来历

「Superior Efficiency」 一段的核心数字是 640: 处理一张 180 万像素的图只产生 640 个视觉 token. 表中给 MiniCPM-V 2.6 的 Token Density 是 2822, 定义为 「最大分辨率像素数 / 视觉 token 数」. 两处可以对上: 1344 × 1344 = 1,806,336 像素, 除以 640 得 2822.4. 也就是说, 正文的 「1.8M pixel」 和 「(e.g., 1344x1344)」 是同一件事, 2822 是截掉小数后的值.

「75% fewer than most models」 要仔细拆. 少 75% 意味着对方要约 2560 个 token. 用表里各家密度把 1,806,336 像素倒推成 token 数 (估算): InternVL2-8B 密度 706, 约 2559 个, 正好对上 75%; Claude 3.5 Sonnet 密度 750, 约 2408 个, 少 73.4%; Qwen-VL-Max 和 GLM-4V-9B 密度 784, 约 2304 个, 少 72.2%; GPT-4o, GPT-4o mini, GPT-4V 密度 1088, 约 1660 个, 只少 61.5%. 另一头, Cambrian-34B 密度 1820, 约 992 个, 前代 MiniCPM-Llama-V 2.5 密度 1882, 约 960 个, 对它们只少三成多. LLaVA-NeXT-Yi-34B 和 Mini-Gemini-HD-34B 密度 157, 约 11505 个, 那才是少 94%.

所以 「75%」 对应的是密度在 700 上下的一档, 大致是 InternVL2-8B, Claude 3.5 Sonnet 和 Qwen-VL-Max 所在的位置. 页面用 「most models」 概括, 没说统计范围. 另外这种倒推有个前提: 各模型的 「最大分辨率」 并不相同, 密度是在各自最大分辨率下算的, 把它们都换算到 1344x1344 只是一个思想实验, 实际模型可能会先缩放或切片.

闭源模型的密度还有一层口径问题. 表下的注写明, 闭源模型的密度是 "based on the image encoding charging strategy defined in the official API documentation, which provides an upperbound estimation", 即从 API 计费规则倒算出的上界估计. 开源模型则是真实的视觉 token 数. 因此 2822 对 1088 的 2.59 倍 (估算) 只能当量级参考. 密度高带来的好处, 页面列了四项: 推理速度, 首 token 延迟, 显存占用, 功耗, 并据此声称能在 iPad 上做实时视频理解. 这四项页面都没有给测量数字.

## 4 单图评测: 65.2 与四个闭源对手

正文说 MiniCPM-V 2.6 在单图理解上超过 GPT-4o mini, GPT-4V, Gemini 1.5 Pro 和 Claude 3.5 Sonnet. 看 OpenCompass 一列: GPT-4o mini 64.1, GPT-4V 63.5, Gemini 1.5 Pro 64.4, 都低于 65.2; Claude 3.5 Sonnet 是 67.9, 比 65.2 高 2.7 分. 按页面自己选的综合指标, 四个对手里有一个不成立. 表里排第一的是 GPT-4o 的 69.9, 正文没有把它列进 「超过」 名单, 这一点是一致的.

再逐列比 (OpenCompass 和 Token Density 之外的 11 列, 估算). 对 Claude 3.5 Sonnet, MiniCPM-V 2.6 赢 MME (2348.4 对 1920.0), OCRBench (852 对 788), AI2D (82.1 对 80.2), Object HalBench (8.2 对 13.8, 越低越好) 四项, 输 MMVet, MMMU, MathVista, MMB1.1, DocVQA, HallusionBench 六项, TextVQA 对方无数. 对 GPT-4V 是 8 胜 3 负, 对 Gemini 1.5 Pro 是 8 胜 2 负, 对 GPT-4o mini 是 7 胜 2 负. 对 GPT-4o 是 3 胜 7 负, 只赢 MME, OCRBench 和 Object HalBench.

有两列值得单独看. MMMU val 上 MiniCPM-V 2.6 是 49.8, 而且带星号, 是用 CoT 提示测出来的, 仍然低于所有列出的闭源模型 (最低的 Step-1V 是 49.9), 也低于同为 8B 的 InternVL2-8B (51.2). 这说明 8B 体量在需要大学学科知识的题上还有明显差距. OCRBench 则是它最强的一列: 852 高于表中所有模型, 包括 GPT-4o 的 736 和 InternVL2-8B 的 794, 这一项的 SOTA 说法和表格一致, 只是 852 也带着 CoT 的星号.

文字类任务要分开看. TextVQA val 上它是 80.1, 全表最高, 第二是 Qwen-VL-Max 的 79.5; DocVQA test 上它是 90.8, 排在 Claude 3.5 Sonnet (95.2), Qwen-VL-Max (93.1), GPT-4o (92.8), InternVL2-8B (91.6) 之后, 只算有数的 10 个模型是第 5. OCRBench 和场景文字问答领先, 不等于文档问答也领先. 正文用 「Strong OCR Capability」 概括, 并只拿 OCRBench 声称 SOTA, 措辞和表格是吻合的, 读者自己别把它扩大成 「文档理解第一」.

和同体量开源模型比, 对手主要是 InternVL2-8B. OpenCompass 65.2 对 64.1, MiniCPM-V 2.6 高 1.1 分; 逐列是 7 胜 4 负 (估算), 输在 MMMU, MMB1.1, AI2D, DocVQA 四项, 差距都在 1.6 分以内. 真正拉开的是 Object HalBench: 8.2 对 21.3, InternVL2-8B 的幻觉率是它的 2.6 倍. 和前代 MiniCPM-Llama-V 2.5 比, 11 列全部改进, OpenCompass 从 58.8 到 65.2, 高 6.4 分, OCRBench 从 725 到 852, 高 127.

## 5 星号, 方向和估算: 读表前要统一的三件事

第一件是星号. 单图表下有一句 「We evaluate this benchmark using chain-of-thought prompting」, 打印稿里前面的星号丢了, 按位置对应 MiniCPM-V 2.6 那一行的四个带星号分数: MME 2348.4*, OCRBench 852*, MMMU 49.8*, HallusionBench 48.1*. 这四项用 CoT 提示测, 而表里其他模型的分数页面没说是不是同样设置. 多图表下的那句是 「We evaluate the officially released checkpoint by ourselves」, 带星号的是 InternLM-XComposer-2.5 的 Mathverse mv, 以及 InternVL2-8B 的 Mantis Eval, Mathverse mv, Sciverse mv, MIRB, 意思是作者自己拿官方权重复测. 同一个符号在相邻两张表里是两种口径, 引用时要把注释一起带上.

第二件是指标方向. 表头没有标 「越高越好」 还是 「越低越好」. 正文把 Object HalBench 称作 「hallucination rates」, 所以这一列越低越好, 8.2 是全表最低. 雷达图把 Object HalBench 画成 91.8, 即 100 - 8.2, 却没有翻 HallusionBench, 可见作者把 HallusionBench 当越高越好: 它的 48.1 低于 GPT-4o 的 55.0 和 Claude 3.5 Sonnet 的 49.9. 两个名字都带 「Hallu」 的列方向相反, 只看数字大小会读反.

第三件是空格和估算. 表中 「-」 很多: Claude 3.5 Sonnet, GPT-4o, GPT-4o mini 都没有 TextVQA; Gemini 1.5 Pro 没有 Object HalBench; 闭源模型全都没有 Size. 胜负统计时这些列只能跳过. 闭源的 Token Density 是计费上界, 上一节已经说过. 另外开源组里 GLM-4V-9B 的 Size 写 13B, 与名字里的 9B 不一致, 页面没解释; 把它当成 8B 档的对手之前, 至少要知道表里是按 13B 记的.

## 6 多图评测: 高分集中在两列

正文说 MiniCPM-V 2.6 在 Mantis-Eval, BLINK, Mathverse mv, Sciverse mv 上达到 state-of-the-art. 多图表逐列看: Mantis Eval 69.1, 高于第二名 LLaVA-NeXT-Interleave-14B 的 66.4, 成立; Mathverse mv 84.9, 高于 GPT-4V 的 63.0, 成立; Sciverse mv 74.9, 高于 GPT-4V 的 66.9, 成立. BLINK val 上它是 54.1, GPT-4V 54.6, LLaVA-NeXT-Interleave-14B 54.4, 两个都比它高, 只有把范围限定在 Open-source 组, 54.1 才是第一. 所以四项里有一项要加限定词.

表的分组也有问题. LLaVA-NeXT-Interleave-14B 带着 「14B」 的 Size 被放在 Proprietary 组, 闭源模型一般不公布规模, 这一行放错组的可能性很大. 如果把它挪回开源组, BLINK 上开源第一就变成它的 54.4, MiniCPM-V 2.6 的 54.1 连开源第一也不是了. MIRB 一列, MiniCPM-V 2.6 的 53.8 低于 InternVL2-8B 复测的 56.9*, 正文的 SOTA 名单没有列 MIRB, 这一处是诚实的.

Mathverse mv 的差距需要单独提. MiniCPM-V 2.6 的 84.9 比 GPT-4V 高 21.9 分, 比其余开源模型高出一大截: InternVL2-8B 复测 30.5*, InternLM-XComposer-2.5 复测 32.1*, VPG-C 24.3, LLaVA-NeXT-Interleave-14B 32.7. 同一张表里其他列的差距通常在 10 分以内, 这一列却是 50 分以上. 页面没有给多图评测的提示格式, 子集和评分方式, 无法判断差距来自模型能力还是评测设置. 引用 84.9 时最好同时写出 「作者自测」 和 「对手部分为作者复测」 这两层背景.

规模和分数在这张表里没有对应关系. 开源组里最大的 Emu2-Chat (37B) Mantis Eval 只有 37.8, BLINK 36.2; CogVLM (17B) 是 45.2 和 41.1; 而 7B 到 8B 的 VPG-C, VILA 8B, InternLM-XComposer-2.5, InternVL2-8B 都在 51 到 59 之间. 单看这张表, 参数多并没有换来多图分数高, 差别更可能出在训练方式上, 但页面没写各家怎么训的, 这只能算推测. 表里的空格也多: MIRB 一列只有 4 个模型有分, Mathverse mv 一列 9 行里有 6 行有分, 胜负要在有数的范围里说.

「in-context learning」 这一点, 页面只说 「shows promising in-context learning capability」, 支撑材料是一个折叠起来的少样本结果链接 (TextVQA, VizWiz, VQAv2, OK-VQA) 和一段折叠的少样本代码, 打印稿里都没展开. 所以这一条在本页没有数字.

## 7 视频评测: 1 分以内的领先

视频表有两个基准. Video-MME 上 MiniCPM-V 2.6 无字幕 60.9, 有字幕 63.6, 都是表中最高. 正文说它超过 GPT-4V, Claude 3.5 Sonnet 和 LLaVA-NeXT-Video-34B. 对 GPT-4V 高 1.0 和 0.3 分, 对 Claude 3.5 Sonnet 高 0.9 和 0.7 分. 对 LLaVA-NeXT-Video 要先对上名字: 表里写的是 「LLaVA-NeXT-Video」, Size 32B, 正文写 34B. 按表里这一行比, 高 0.7 和 0.6 分. 三个对手的差距都在 1 分以内.

字幕带来的提升也可以从表里算 (估算): MiniCPM-V 2.6 加字幕后高 2.7 分, GPT-4V 高 3.4 分, Claude 3.5 Sonnet 高 2.9 分, InternVL2-8B 高 2.9 分, LLaVA-NeXT-Video 高 2.8 分, LongVA 高 1.9 分. MiniCPM-V 2.6 从字幕里得到的增益不算多, 它的领先主要来自无字幕时的底子.

Video-ChatGPT 有五个维度, 正文没有拿它做宣传. MiniCPM-V 2.6 只在 Correctness 一项第一 (3.59); Detail 3.28 低于 CogVLM2-Video 的 3.46, Context 3.93 低于 LLaVA-NeXT-Video 的 3.95, Temporal 2.73 低于 CogVLM2-Video 的 2.98, Consistency 3.62 低于 CogVLM2-Video 和 LongVA 的 3.64. 五项简单平均是 3.43, 仍是表中最高, 次高 CogVLM2-Video 3.36, 再往下是 LLaVA-NeXT-Video 3.34 (都是估算, 页面没给平均). 正文说能 「providing dense captions for spatial-temporal information」, 而 Temporal 这一项恰好不是第一, 这是读这张表时最值得记下的一点.

这张表的可比范围也很窄. 两个闭源模型只有 Video-MME 分数, 没有 Video-ChatGPT; LLaVA-NeXT-7B, LLaVA-NeXT-34B, CogVLM2-Video 只有 Video-ChatGPT; InternVL2-8B 和 InternLM-XComposer-2.5 只有 Video-MME, 后者连有字幕一栏都空着. 两个基准都有分的只有 LongVA, LLaVA-NeXT-Video 和 MiniCPM-V 2.6 三行. 所以 「视频理解全面领先」 这种说法在本页找不到依据, 能说的是: Video-MME 上小幅领先, Video-ChatGPT 上五项平均最高, 单项各有输赢.

## 8 雷达图: 同一组数的另一种画法

第 4 页的雷达图有 16 条轴, 画了五个模型: GPT-4V-20240409, Gemini 1.5 Pro, Cambrian-34B, InternVL2-8B, MiniCPM-V 2.6 8B. 每条轴印三圈刻度, 外圈是该轴最大值. 大部分外圈数和表对得上: OpenCompass 65.2, MME 2348.4, OCRBench 852.0, TextVQA 80.1, HallusionBench 48.1, MathVista 60.6, Mantis 69.1 都是 MiniCPM-V 2.6 自己的分; MMVet 67.5, MMMU 61.7, MMB-1.1 79.8 是 GPT-4V 的分; AI2D 83.6 和 DocVQA 91.6 是 InternVL2-8B 的分.

对不上的有三处. BLINK 外圈写 53.0, 紫线贴着外圈, 而表里 MiniCPM-V 2.6 是 54.1, GPT-4V 是 54.6, 两者都比 53.0 高, 可能雷达图用的是另一个版本的数. Object HalBench 外圈 91.8 = 100 - 8.2, 是把越低越好的幻觉率翻成了越高越好, 画图时合理, 引用时不能把 91.8 当成 Object HalBench 的原始分. Video-MME 外圈 81.3 和 ChartQA 外圈 83.3 在本页三张表里都找不到; 从线条看, Video-MME 的 81.3 属于 Gemini 1.5 Pro, 而视频表里根本没有 Gemini 1.5 Pro 这一行.

雷达图还有一个取舍: 它没画 GPT-4o 和 Claude 3.5 Sonnet. 这两个恰好是单图表里 OpenCompass 高于 MiniCPM-V 2.6 的闭源模型. 画面上紫线在多数轴处于最外圈, 这是选了对手之后的结果. 读图的时候应当把它当作 「和这四个模型比」 的示意, 而不是全表的缩影.

## 9 示例: 展示能力, 也露出小错

第 7, 8 页是示例. 自行车一组有三轮: 第 1 轮给一张整车照片, 问怎么调低座垫, 模型给了五步通用流程; 第 2 轮给座管夹特写, 问是扳手还是螺栓, 模型答螺栓, 和照片一致; 第 3 轮给说明书和工具箱, 模型指出说明书里标 J 的 SEAT COLLAR 要用 4mm 内六角, 并判断工具箱里应该有. 这组示例想展示多轮, 多图的连续推理. 其中第 1 轮说夹子在 「the underside of the seat」, 而第 2 轮照片里夹子套在车架立管顶端, 位置说错了, 后面也没有纠正. 说明书图在打印稿里太小, 看不清 J 和 4mm 是否真的印在上面.

啤酒一组是图文结合的算术: 照片里两瓶绿色 Magna, 酒单上 Magna 标 6, 模型答 12. 结果正确, 但算式写成 「6 units/can × 2 cans」, 前文明明说的是 bottles. 奥运奖牌一组用中文提问, 截图是 2008 年奖牌榜, 模型把前三名金牌 48, 36, 24 加成 108, 正确; 表里 15 行的金银铜之和也都等于总数. 截图表头的 「领牌」 是 「银牌」 的识别错字, 不影响结果.

调试一组给了三份代码截图和一段 NameError 报错, 模型判断原因是 privilege.py 里没有 User 类, 修法是在 privilege.py 里定义 User. 截图里其实已经有 user.py, 更直接的修法是导入, 模型的改法会让项目里出现两份 User. 漫画一组有 Shot 1, Shot 2 两格可见, 模型给出 「戴手套做饭, 收钱也戴手套」, 「环保水壶里倒瓶装水」, 「有数字钱包但店里只收现金」 这类反差描述, 打印稿没有印出完整的提问.

这些示例不是评测, 是挑选过的展示. 它们说明模型能处理多轮, 多图, 中文和代码截图, 同时也露出几处小错: 位置描述不准, 单位写错, 修法不够贴合项目结构. 用它们判断模型可靠性时, 要记得这已经是作者愿意放上首页的版本.

## 10 部署: 版本, 代码和显存

第 10 到 12 页是用法. transformers 路线在 python 3.10 上验证, 依赖锁在 Pillow 10.1.0, torch 2.1.2, torchvision 0.16.2, transformers 4.40.0, sentencepiece 0.1.99, 加上不限版本的 decord. 模型以 bfloat16 加载, 注意力实现选 sdpa, 需要 trust\_remote\_code 这类自定义代码 (侧栏标签里也有 custom\_code). 调用接口是 model.chat, 普通调用直接返回文本, 设 sampling=True 和 stream=True 时返回生成器.

打印稿里的示例代码不能照抄. from\_pretrained 两行在右边被截断, 「msgs=news」 和 「tokenizer=newizer」 是识别错字, 原意应是前面定义的 msgs 和 tokenizer. 多图, 少样本, 视频三段代码都折叠了, 页面只让读者去 GitHub 看. 所以这一页能确认的只有单图调用和流式调用两种形态.

依赖版本是锁死的, 页面只说 「Requirements tested on python 3.10」, 没说更新的 torch 或 transformers 能不能跑. 自定义代码随仓库分发, 版本一变就可能对不上接口. 想复现页面上的结果, 最稳的做法是先按这份清单建环境, 跑通以后再逐个升级.

其他部署路线: llama.cpp 和 ollama 做本地 CPU 推理, int4 和 GGUF 共 16 种量化尺寸, vLLM 做高吞吐推理, Gradio 搭本地 WebUI, 还有在线演示. llama.cpp 的链接前后不一致: 第 4 页指向 minicpmv-main 分支下的 README-minicpmv2.6.md, 第 12 页指向 minicpm-v2.5 分支, 后者像是从前代模型卡沿用下来的. 第 1 页模型树的 「Quantizations 14 models」 和 「16 sizes」 是两回事, 前者是 Hugging Face 统计的衍生仓库, 社区上传的也算.

端侧方面, 第 9 页说演示视频是 iPad Pro 上未经剪辑的原始录屏, 截图里能看到四个场景: 欢迎页配一张梗图, 啤酒和菜单的提问, 一张火车票照片, 两张柴犬截图配中文提问. 第 10 页是一段 0:41 的视频播放器, 打印时是黑屏. 页面没有给 iPad 上的 token 速度, 内存占用或功耗, 「real-time video understanding」 在本页只有录屏为证.

## 11 谱系: 这一页能讲清的前后关系

这一页直接出现的 MiniCPM 视觉系模型有三个: 前代 MiniCPM-Llama3-V 2.5, 本代 MiniCPM-V 2.6, 以及新闻里的 MiniCPM-o 2.6. 前代在评测表里写作 「MiniCPM-Llama-V 2.5」, 少了一个 「3」, 按上下文是同一个模型. 表里给了它的 Size 8B, token 密度 1882 和单图各列分数. 从名字看, 前代的语言底座带 Llama3 字样, 本代明确写 Qwen2-7B, 语言底座换了家; 视觉编码器前代用什么, 这一页没写.

本代相对前代的变化, 页面能支撑的有三条. 一是能力面扩展, 从单图扩到多图和视频, 正文用 「introduces new features for multi-image and video understanding」 表述. 二是 token 密度从 1882 提到 2822, 多 49.9% (估算), 同样像素下视觉 token 少三分之一. 三是单图各列全面提升, OpenCompass 高 6.4 分, Object HalBench 从 10.3 降到 8.2. 这些都能在表里逐项核对.

技术来源方面, 页面点了四个项目: VisCPM, RLHF-V, LLaVA-UHD, RLAIF-V, 并说可信行为 「Based on the the latest RLAIF-V and VisCPM techniques」. 侧栏唯一挂出的训练数据集 RLAIF-V-Dataset 也属于这条线. LLaVA-UHD 出现在关键技术名单里, 但页面没有说它在 V 2.6 里用在哪一步; 任意长宽比, 180 万像素, 640 个 token 这些特征和高分辨率处理有关, 可具体切图方式页面没写.

往后的 MiniCPM-o 2.6 只出现在新闻和合集名 「MiniCPM-o & MiniCPM-V Collection」 里. 新闻说它比 V 2.6 明显更强, 并支持实时语音对话和多模态直播流. 这一页没有它的规模, 结构或分数, 两者名字相近, 但在本稿里不能互相借数.

## 12 许可与声明

许可分两层. 仓库代码用 Apache-2.0; 模型权重必须遵守 MiniCPM Model License. 学术研究完全免费; 商用要先填一份问卷登记, 登记后 V 2.6 的权重也可免费商用. 仓库本身是 gated 的, 访问文件前要登录并接受条件. 这三道门槛, 代码许可, 权重许可和访问条件, 是分开的.

「免费商用」 的前提是登记, 页面没有写商用有没有用户规模或用途上的限制, 具体条款要看 MiniCPM Model License.md 原文, 本页只给了链接. 打算商用的人不能只凭这一页的一句话下结论.

声明部分是标准免责: 模型不能理解, 不能表达个人观点, 不能做价值判断; 生成内容不代表开发者立场; 因使用模型产生的数据安全, 舆论风险, 误导, 误用, 传播或滥用问题, 开发者不负责. 页面没有安全评测, 与可信相关的只有 Object HalBench 8.2 和 HallusionBench 48.1 两个分数.

## 13 这页没有的东西

结构上, 页面没给语言模型的层数, 隐藏维度, 头数, 上下文长度, 没给视觉编码器输入分辨率和切片规则, 也没给连接模块的形式和规模. 8B 与 7.4B 名义和之间的 0.6B 因此无法解释. 训练上, 页面没写多模态预训练和指令微调的数据量, 配比和阶段, 只挂了 RLAIF-V-Dataset 一个数据集.

评测上, 页面没有多图和视频评测的提示格式, 帧数和子集; 雷达图里的 Video-MME 81.3, ChartQA 83.3 在表里找不到, BLINK 53.0 和表里 54.1 不一致; 少样本结果折叠未展开. 部署上, 页面没有 iPad 上的实测速度和功耗, int4 版 7GB 的测量条件也没写.

把这些缺口和前面的核对放在一起, 这一页最可靠的数字是 token 密度 2822 (能用 1344 × 1344 / 640 自证), 单图表各列分数, Video-MME 两个分数, 以及依赖版本. 最需要加限定才能引用的是三句宣传: 单图 「超过 Claude 3.5 Sonnet」 与 OpenCompass 67.9 对 65.2 矛盾; 多图 BLINK 的 SOTA 只在开源组成立, 而且分组可疑; 视频 「超过 LLaVA-NeXT-Video-34B」 对应的是表里的 32B, 领先不到 1 分.
