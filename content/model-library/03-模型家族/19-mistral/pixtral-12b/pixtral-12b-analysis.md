[OM-FREEPLAY] 材料不够 5000. 原文是一篇发布博文, 打印成 22 页, 正文英文不到 900 词, 其余是示例回答, 代码和页脚, 每页还叠着同一个 cookie 弹窗. 本稿只按这页印出来的数写, 不从 Pixtral Large, Mistral Nemo 或 Mistral 7B 搬参数.

# Pixtral 12B 发布页解读

- 原文: Mistral AI 官网博文 「Announcing Pixtral 12B」, 2024 年 9 月 17 日, 署名 Mistral AI team, 2026/9/25 打印. 页首已挂 「deprecated」 横幅.
- 定位: 原生多模态, 用图文交错数据训练; 可以直接替换 Mistral Nemo 12B.
- 结构: 视觉编码器 (400M, 从零训练) 加多模态 Transformer 解码器 (12B, 以 Mistral Nemo 为底座).
- 读图: 按原分辨率和宽高比输入, 每 16x16 像素一个图像 token, 行间插 `[IMG BREAK]`, 图末加 `[IMG END]`.
- 上下文: 128k token (页面有 128k 和 128K 两种写法), 可放任意多张图.
- 许可和入口: Apache 2.0; Le Chat, La Plateforme (`pixtral-12b-2409`), mistral-inference, vLLM, HuggingFace 仓库 `mistralai/Pixtral-12B-2409`.
- 双语对照见同目录 pixtral-12b-bi.md. 下文凡标 「估算」 的数, 都是用本页印出的数自己算的, 原文没有.

| 项 | 本页怎么写 |
| --- | --- |
| 名字里的 12B | 「12B parameter multimodal decoder」, 指解码器 |
| 视觉编码器参数 | 400M, 「trained from scratch」 |
| 总参数 | 本页未印; 12B 加 400M 约 12.4B |
| 激活参数 | 本页未印 |
| 层数, 隐藏维度, 头数, 词表大小 | 本页未印 |
| 上下文 | 128k / 128K token |
| 训练数据 | 只有一句 「interleaved image and text data」 |
| 印出的评测数 | 第 5 页表 60 格, 第 4 页表露出 24 格 |

## 1. 这是什么材料, 缺什么

这是一篇产品发布博文, 不是技术报告. 正文分四块: 开头的概要和一段总述, 「Performance」 一节 (评测协议, 对比表, 指令遵循), 「Architecture」 一节 (可变图像尺寸和最终架构), 然后是五个定性示例和四种运行方式. 第 20 页后半到第 22 页是网站页脚. 页面把细节推给了一份 「technical report」, 表注里写 「prompts will be provided in technical report」, 但这份报告本页没有链接.

每页左下角都叠着 axeptio 的 cookie 弹窗, 正文文字能从 PDF 文字层找回来, 表和图找不回. 损失最大的是三处: 第 3 页 「Instruction Following (Multimodal & Text)」 整张图只剩标题; 第 4 页闭源对比表第 3 到第 6 行的行名和前三列; 第 11 页第二张输入表的左半. 另外第 4 页的表, 第 7 页的架构图, 第 11 页的两张输入表, 第 13 页的手绘草图都没有被抽成单独的图文件, 只能从渲染页面读.

博文本来就没写的东西更多: 训练 token 数, 图文数据的比例和来源, 训练算力, 训练阶段怎么分, 视觉编码器的层数和位置编码, 解码器的任何规格, 指令版怎么微调 (有没有 SFT, 有没有偏好对齐), 都没有. 安全和漏洞方面, 22 页里没有任何名称或分数. 能核对的只有两张对比表, 第 3 页的柱状图, 以及示例回答和图之间的对应关系.

## 2. 12B, 总参数, 激活参数, 视觉编码器

名字里的 12B 在概要里有明确出处: 「12B parameter multimodal decoder based on Mistral Nemo」. 所以 12B 说的是多模态解码器, 不包括视觉编码器. 视觉编码器单列一行: 「New 400M parameter vision encoder trained from scratch」. 第 3 页又说 Pixtral 是 「a drop-in replacement for Mistral Nemo 12B」, 解码器规模和被替换的对象写的是同一个数.

总参数: 本页未印. 把两个部件相加是 12B 加 0.4B, 约 12.4B; 视觉编码器约占 3.2%. 这个加法有个前提: 页面只说了 「two components」, 没说编码器和解码器之间有没有投影层或别的连接模块, 如果有, 参数也不在这两个数里. 激活参数: 本页未印. 页面没说是稠密结构还是 MoE, 也没有给出每个 token 走多少参数, 所以这一栏只能空着.

规格层面全是空白. 解码器 「based on Mistral Nemo」, 但层数, 隐藏维度, 注意力头数, 词表大小都没写. 第 19 页代码里 tokenizer 从 `tekken.json` 加载, 这只说明 tokenizer 文件名叫 tekken, 词表多大本页没说. 同家族的 [Mistral Nemo 解读](../nemo-12b/nemo-12b-analysis.md) 记的是另一页的内容, 这里不搬数. tokenizer 的一般背景见 [分词器与 Tokenizer](../../../../llm-guide/3-预训练/3.3-分词器与Tokenizer/3.3-分词器与Tokenizer.md).

## 3. 可变分辨率: 16x16 patch 和两个特殊 token

读图规则在第 5 页写得很具体: 图像按原分辨率和宽高比直接进视觉编码器, 每个 16x16 的 patch 变成一个图像 token; token 按行展平, 行与行之间插 `[IMG BREAK]`, 整张图末尾放 `[IMG END]`. 第 6 页的示意图和规则一致: 横幅猫图切成 3 行 4 列, 展平后是 12 个图像 token, 中间 2 个 [b], 末尾 1 个 [e]; 竖幅狗图切成 5 行 3 列, 中段用省略号略去. 正文说 `[IMG BREAK]` 的作用是区分 「token 数相同但宽高比不同」 的图, 例如 3x4 和 4x3 都是 12 个图像 token, 靠换行符的位置才分得开.

按这个规则可以算成本. 一张 1024x1024 的图是 64x64 = 4096 个图像 token, 加 63 个 `[IMG BREAK]` 和 1 个 `[IMG END]`, 共 4160. 128k 如果按 128,000 算, 不放文字也只能装下约 30 张这样的图; 按 131,072 算约 31 张. 第 20 页 vLLM 示例用的是 200x300 的图, 向上补齐是 13 列 19 行, 共 266 个 token, 向下截断是 234. 页面没说边长不是 16 的倍数怎么办, 也没说有没有分辨率上限, 大图会不会先缩小. 「giving the user flexibility on the number of tokens」 这句话, 实际上把控制成本的责任交给了用户.

这种 「原分辨率切 patch」 的做法和固定分辨率编码器 (先把图缩放到统一尺寸) 是两条路, 一般性的对比见 [CLIP 与视觉编码器](../../../../llm-guide/8-多模态/8.2-CLIP与视觉编码器/8.2-CLIP与视觉编码器.md) 和 [LLaVA 架构深度解析](../../../../llm-guide/8-多模态/8.2-视觉语言模型/8.2.1-LLaVA架构深度解析.md). 可变宽高比下二维位置怎么编码, 本页一个字没提; 一般做法见 [RoPE 的视觉与多模态扩展](../../../../llm-guide/2-核心原理与架构/2.5-长上下文与外推技术/RoPE/04-视觉与多模态扩展.md), 但 Pixtral 用没用其中哪一种, 本页给不出答案. 另一条路是压缩视觉 token, 见 [QFormer 与视觉 Token 压缩](../../../../llm-guide/8-多模态/8.2-视觉语言模型/8.2.2-QFormer与视觉Token压缩.md); Pixtral 走的是不压缩, 一个 patch 一个 token.

## 4. 评测协议: 同一套框架, 同一个 prompt

第 4 页的协议有三步: 所有模型放进同一套评测框架; 每个数据集挑一个能复现 GPT-4o 和 Claude-3.5-Sonnet 已报告成绩的 prompt; 然后所有模型都用这个 prompt. 这样做的好处是口径统一, 不会出现每家各报各的数. 代价也很明显: prompt 是按两个闭源大模型调的, 对小的开源模型未必合适.

第 5 页表里有两格能说明这个代价可能存在. Qwen2-VL 7B 的 DocVQA 是全表最高的 94.5, ChartQA 却只有 38.6, 比 Phi-3 Vision 的 72.0 低 33.4 个点; Phi-3 Vision 的 VQAv2 是 42.4, 比它的后继 Phi-3.5 Vision 的 56.1 低 13.7 个点. 同一个模型在相近任务上差这么多, 可能是模型本身的短板, 也可能是统一 prompt 下输出格式没对上; 页面没解释, 这里只能标成推测. 而 prompt 本身, 页面两处都用将来时: 「All prompts will be open-sourced」 和 「prompts will be provided in technical report」, 本页核对不了.

## 5. 开源对比表: 12 列里只输一列

第 5 页表把 Pixtral 和 Qwen2-VL 7B, LLaVA-OV 7B, Phi-3 Vision, Phi-3.5 Vision 比了 12 列, 分三组: 多模态基准 5 列, 指令遵循 4 列, 文本基准 3 列. Pixtral 在 11 列最高, 唯一输的是 DocVQA, 90.7 对 Qwen2-VL 7B 的 94.5, 差 3.8 个点. 领先幅度差别很大: Math 48.1 对次高 38.6, 高 9.5 个点; ChartQA 81.8 对次高 72.0, 高 9.8 个点; MMLU 69.2 对 Qwen2-VL 7B 的 68.5, 只高 0.7 个点.

这张表支撑的是 「同量级开源模型里最强」, 不是 「全面碾压」. 第 4 页正文写 「substantially outperforms all open models around its scale」, 在 DocVQA 上不成立, 在 MMLU 上差距也谈不上 「substantially」. 概要里 「Maintains state-of-the-art performance on text-only benchmarks」 也要放在这张表的范围里读: 文本三列只和开源多模态模型比. 第 3 页的文本理解图把 Gemini Flash-8B 和 Claude-3 Haiku 画进来以后, MATH 组 Gemini Flash-8B 比 Pixtral 高, HumanEval 组两个闭源模型都比 Pixtral 高; 图没有纵轴, 具体差多少读不出.

还有一处口径要留意. 第 3 页图写 「MATH (maj@1)」, 第 5 页表写 「Math (Pass@1)」. 只取 1 个样本时两者是同一件事, 所以不算矛盾, 但页面没交代采样次数和温度. 第 3 页图的子标题还补了表里没有的数据集切分: MMMU 用 val, MathVista 用 testmini, ChartQA 和 DocVQA 用 test, VQAv2 用 val.

## 6. 闭源和大模型对比: 露出的格子和回答里的数

第 4 页表把 Pixtral 和五个闭源或更大的模型比了 6 列, 但第 3 到第 6 行的行名和前三列被弹窗盖住. 行名可以从第 12 页的示例里补: 那个示例让 Pixtral 把两张表合成一张, 它生成的表里这几行依次是 Gemini-1.5 Flash 8B (0827), LLaVA-OV 72B, GPT-4o, Claude-3.5 Sonnet, 后三列的数和第 4 页露出的格子一一对得上. 第 4 行到第 6 行在原表里是灰色字, 应该是在标记 「更大的模型」.

对 Claude-3 Haiku, Pixtral 六列全赢: MMMU 高 2.1, Mathvista 高 13.2, ChartQA 高 12.2, DocVQA 高 16.1, VQAv2 高 10.2, MM MT-Bench 高 0.59. 对 GPT-4o 和 Claude-3.5 Sonnet, 露出的列里 Pixtral 的 DocVQA (90.7) 比两者都高 (88.9, 90.3), VQAv2 (78.6) 也比两者高 (77.8, 70.7); MM MT-Bench 则明显低 (6.05 对 7.72, 7.50). 按第 12 页回答里的数, 两者的 MMMU (68.6, 68.0) 比 Pixtral 高 16 个点左右.

「Pixtral even outperforms or matches the performance of much larger models like LLaVa OneVision 72B」 这句最值得拆. 露出的格子里, LLaVA-OV 72B 的 DocVQA 91.6 高 0.9, VQAv2 83.8 高 5.2, 只有 MM MT-Bench 4.95 低于 Pixtral. 被遮的 MMMU 和 Mathvista 只能用第 12 页回答里的 54.4 和 57.2: MMMU 输 1.9, Mathvista 赢 0.8. 加上 ChartQA (66.9) 赢 14.9, 六列是三胜三负. 说 「matches」 勉强, 说 「outperforms」 不成立; 而且其中两格的依据是模型自己生成的数, 本页打印件里没有原图可以核对.

## 7. 指令遵循: 20% 是怎么来的

第 4 页说 Pixtral 「with a 20% relative improvement in text IF-Eval and MT-Bench over the nearest OSS model」. 拿第 5 页表算: Text IF-Eval 61.3 对最接近的 LLaVA-OV 7B 51.4, 相对高约 19.3%, 四舍五入算 20% 说得过去; Text MT-bench 7.68 对 LLaVA-OV 7B 6.94, 相对高约 10.7%, 离 20% 差得远. 换成多模态版本, MM IF-Eval 52.7 对 42.5 高约 24.0%, MM MT-Bench 6.05 对 5.45 高约 11.0%. 四个数里只有 IF-Eval 类的两个到了 20% 左右.

多模态的两个基准是 Mistral 在这篇博文里新造的: 「we create multimodal versions of these benchmarks: MM-IF-Eval and MM-MT-Bench」. MM-MT-Bench 写了 「We will open-source」, MM-IF-Eval 连这句承诺都没有. 自己造基准, 自己挑 prompt, 自己测, 结论可能没错, 但读者没有办法独立复核. 第 3 页那张 「Instruction Following (Multimodal & Text)」 图又整块被弹窗盖住, 连图上画了哪些模型都看不到.

## 8. 定性示例: 回答和图对不对得上

五个示例里, 有三个能拿页面上的图核对. 第 8 页的 GDP 图, 回答列出的德国 3.99, 英国 2.82, 法国 2.78, 意大利 2.07, 西班牙 1.43 (万亿美元) 和占比都和图一致. 值得一提的是俄罗斯: 图上 Russia 1.66 万亿美元, 比西班牙高, 但被涂成蓝色归在亚洲, 模型按绿色挑欧洲, 于是没收它. 这说明模型读的是图的配色, 不是地理常识; 就这道题而言, 按图回答是对的. 回答的序号是 1, 3, 5, 7, 9, 是网页渲染列表的问题, 不是模型的错.

第 10 页的 loss 曲线示例问题更大. 回答说 dark-dragon-50 在 「around the 10k step mark」 开始出问题, 图上红实线确实在约 9.5k 步有一次尖峰, 冲到 1 附近 (读图). 但约 19.5k 步还有一次更大的尖峰, 冲到接近 1e+4 的量级, 之后曲线在约 21.5k 步中止 (读图); 回答只用 「continues to spike and fluctuate」 一笔带过. 回答把原因归为 「likely overfitting」 也不对: 图标题是 train/loss, 只有训练 loss, 训练 loss 自己冲高说明训练不稳定, 过拟合要看验证 loss. 这段回答被当作正面示例登出, 页面没有更正.

另外两个示例是开放式的. 第 13 页手绘草图只写了 「Flavor」 下拉框和 「Next」 按钮, 生成的 HTML 自己补了五种口味, 页脚把草图底部的 「MistralAI」 写成 「© copyright MistralAI」, 结构还原得不错. 第 17 页比萨斜塔照片, 回答认出了错位摆拍造成的视错觉, 但最后一句说拍照目的是 「demonstrate the impressive height and size of the tower」, 这是模型加的解读, 照片里看不出来.

## 9. 部署: 四条路径和代码里的细节

页面给了四种用法: Le Chat 网页版, La Plateforme API, 本地 mistral-inference, 本地 vLLM. API 示例的模型 ID 是 `pixtral-12b-2409`, 请求里文字和图片链接放在同一条用户消息的 content 数组里, `max_tokens` 为 300. mistral-inference 示例从 `mistralai/Pixtral-12B-2409` 下载权重, 用 `tekken.json` 建 tokenizer, 生成参数 `max_tokens=256`, `temperature=0.35`. vLLM 示例 `max_tokens=8192`, `tokenizer_mode="mistral"`.

代码里有两处要小心. 第一, vLLM 示例先定义 `llm = LLM(...)`, 最后却调用 `vllm_model.model.chat(...)`, `vllm_model` 从没定义, 照抄会报名字未定义. 第二, 图片字段的写法不统一: curl 示例里 `"image_url"` 直接是一个字符串, vLLM 示例里是 `{"u...` 开头的对象 (行尾被截断, 按常见写法应是 `{"url": ...}`, 本页只露出前两个字符). 此外有七行代码在网页的代码框里超出宽度, 打印时被截断: HTML 示例的 footer 样式, curl 示例的图片链接, mistral-inference 示例的 `allow_patterns`, 图片链接, 请求构造和 `generate` 四行, 以及 vLLM 示例的 content 一行.

## 10. 谱系: 这页能画出什么

往前, 这页给了两条线索. 概要说解码器 「based on Mistral Nemo」, 第 3 页说 Pixtral 是 Mistral Nemo 12B 的 「drop-in replacement」. 两句合起来, 可以读成: Pixtral 12B 在 Nemo 12B 的解码器上接了一个新训的视觉编码器, 做成图文模型, 接口上还能替 Nemo 的位置. 至于解码器是直接从 Nemo 的权重继续训, 还是只借用同样的结构从头训, 页面没说. tokenizer 文件叫 `tekken.json`, 页面没讲它和 Nemo 的 tokenizer 是什么关系.

往后, 页首横幅说 Pixtral 12B 「has been replaced by our latest, more powerful vision and multimodal models」, 没有点名. 本库同目录还有 [Pixtral Large 解读](../pixtral-large/pixtral-large-analysis.md), 名字相近, 但本页一次都没提到 Pixtral Large, 两者的关系本页给不出. 单看这一页, 谱系是一条短线: 2024 年 9 月从 Nemo 12B 派生出来, 12B 解码器加 400M 视觉编码器, 128k 上下文, Apache 2.0, 到 2026 年 9 月打印时已被未具名的新模型接替, 中间约 738 天 (从发布日到打印日, 不是弃用日期).

视觉编码器 「trained from scratch」 这一点在谱系上也有意义. 常见做法是复用现成的 CLIP 类编码器 (一般背景见 [视觉语言模型](../../../../llm-guide/8-多模态/8.2-视觉语言模型/8.2-视觉语言模型.md)), Pixtral 自己训了一个支持可变尺寸的编码器, 这是它和 Nemo 之间唯一的新增部件. 这个编码器用什么数据, 训多久, 页面都没写.

## 11. 本页对不上的数字

先说页面自身的出入. 第 4 页 「20% relative improvement in text IF-Eval and MT-Bench」: IF-Eval 约 19.3%, MT-Bench 只有约 10.7%. 第 4 页 「outperforms or matches ... LLaVa OneVision 72B」: 六列三胜三负, VQAv2 差 5.2. 第 4 页 「substantially outperforms all open models around its scale」: DocVQA 输 Qwen2-VL 7B 3.8 个点. 第 7 页架构图里的缩略表, Pixtral 一行 DocVQA 放大后像是 92.3, 第 4, 第 5, 第 11, 第 12 页都是 90.7; 缩略图太糊, 以正式表为准. 第 3 页图写 MATH (maj@1), 第 5 页表写 Math (Pass@1). 第 10 页 loss 示例回答说 10k 步, 图上更大的尖峰在约 19.5k 步. 第 20 页 vLLM 代码 `llm` 和 `vllm_model` 对不上. 上下文长度在第 2 页概要写 128k, 同页正文和第 6 页写 128K.

再说转出的 Markdown 和 PDF 文字层的出入, 这些是 OCR 的错, 不是原文的错. 模型 ID 被识别成 「pixtral-12h-2409」, 文字层是 「pixtral-12b-2409」. 架构图缩略表被 OCR 出一整张假表: 「Picral 12B」, 「ChatQA (ESU)」, 「DocVQA (ANUS)」, 「VQA Mean」, 「Gemini-1.5 BB」, 以及 Claude-3 Haiku 的 DocVQA 78.3, GPT-4o 的 84.7, Claude-3.5 Sonnet 的 83.8, 都和正式表 (74.6, 88.9, 90.3) 不同, 缩略图根本读不出这么细的数. 第 11 页 「LLcVA QV 7B」 应为 LLaVA-OV 7B, 「Italy」 前的 「7 .」 多了空格. 第 7 页还单独冒出一句 「This table combines the data from both tables...」, 和第 12 页回答的末句一字不差, 是网页打印时叠进来的重复片段.
