源文是 Meta 博客上 Llama 3.2 的发布文章, 17 页, 17 张图, 其中 6 张是箭头和分享图标, 正文只有两张评测表和几段做法描述.

## 1. 这 17 页是什么

源文是 Meta 官方博客的一篇发布文章, 标题 「Llama 3.2: Revolutionizing edge AI and vision with open, customizable models」, 日期 2024 年 9 月 25 日, 标注 15 分钟读完. 整份材料是网页滚动截屏转成的 PDF, 17 页, md 由 MinerU 转写, 里面引用了 17 张图. 前 14 页是正文, 第 15 到 17 页是分享按钮, 订阅栏, 招聘横幅, 三篇相关文章和网站页脚.

它的口吻是产品发布: 先列 Takeaways, 再讲四个型号能干什么, 放两张评测表, 各用两三段讲视觉模型和轻量模型怎么做出来, 然后是 Llama Stack 和安全组件, 最后感谢合作方. 没有作者名单, 没有参考文献, 没有消融实验, 也没有超参数表. 这份材料能回答 「Llama 3.2 发了哪些型号, 官方怎么描述它们, 和谁比了哪些分」, 回答不了 「每个型号内部具体怎么搭」.

## 2. md 和 PDF 的差别

这份 PDF 是连续网页按页切开的, 每页顶端有一条固定的页眉 (Meta 标志和菜单按钮). 切页的位置正好压住一行正文时, 那一行在页面图像上被页眉挡住, 但 PDF 文本层里还在. MinerU 按图像识别, 于是丢了这些行. 对照 PDF 文本层, 丢掉的地方有六处: 第 2 页开头 Takeaways 第二条的前半句 (1B 和 3B 支持 128K token 上下文), 第 3 页开头一句半 (Llama 能和闭源模型竞争, 开放是正确方向), 第 4 页的小标题 「Model evaluations」 和半句引语, 第 6 页开头半句 (保住纯文本能力, 可直接替换 Llama 3.1 模型), 第 11 页开头半句 (多种环境), 第 12 页列表第 1 条 (Llama CLI). 第 17 页相关文章的标题也只剩后半截.

还有几类转写问题. 第 1 页 Takeaways 第一条被识别成页脚注释, 套进灰色小字; 第 2 页的圆点条目丢了圆点. 连字符在换行处被吞, 出现 singlenode, retrievalaugmented, tooluse. AI 两次被识别成 Al, 致谢里 Intel 和 Kaggle 之间丢了逗号. 页眉的菜单按钮被识别成汉字 「三」, 第 12 页页眉的 Meta 标志被标成了二级标题. 双语稿里这些地方都照 md 原样保留英文, 在中文里注明 PDF 文本层的写法.

## 3. 四个型号和各自的定位

页面上的 Llama 3.2 一共四个规模. 1B 和 3B 是轻量纯文本模型, 定位是端侧: 装进部分边缘设备和移动设备, 做摘要, 指令遵循, 改写和工具调用, 支持多语言文本生成. 11B 和 90B 是视觉大模型, 做图像推理: 文档级理解 (含图表), 给图片配说明, 视觉定位. 四个规模都有预训练版和指令微调版.

页面给每类都举了例子. 视觉模型的例子是看销售图表回答哪个月卖得最好, 看地图回答徒步路线哪里变陡, 某条小径多长. 轻量模型的例子是把最近 10 条消息做摘要, 提取待办, 调用工具发日历邀请. 本地运行的好处写了两条: 回复几乎即时, 数据不出设备. 应用还能自己决定哪些请求留在本地, 哪些交给云端大模型. 至于 「select edge and mobile devices」 具体是哪些设备, 需要多少内存, 页面没写, 只说发布当天支持 Qualcomm 和 MediaTek 硬件, 并针对 Arm 处理器做了优化.

## 4. 视觉模型: 页面说了什么

页面说 11B 和 90B 是第一批支持视觉任务的 Llama 模型, 需要 「entirely new model architecture」. 做法是在预训练好的语言模型上接一个预训练好的图像编码器, 中间用一组适配器权重连起来. 适配器由一串交叉注意力层组成, 把图像编码器的表示送进语言模型. 适配器在文本-图像对上训练, 训练时图像编码器的参数一起更新, 语言模型参数不动. PDF 文本层补出的半句说, 这样做保住了全部纯文本能力, 所以能直接替换 Llama 3.1 模型.

训练流程分阶段: 从预训练好的 Llama 3.1 文本模型出发, 加上图像适配器和编码器, 先在大规模, 含噪声的图文对上预训练, 再在中等规模, 高质量的领域内和知识增强图文对上训练. 后训练做几轮对齐, 每轮是监督微调, 拒绝采样, 直接偏好优化. 合成数据的做法是让 Llama 3.1 模型在领域内图像上过滤和扩充问答, 用奖励模型给候选答案排序. 最后加入安全缓解数据.

页面没有给的东西更多. 图像编码器是什么模型, 多大, 输入分辨率多少, 交叉注意力层有几层, 插在语言模型的哪些位置, 适配器有多少参数, 两个阶段各用多少图文对, 用的是哪个规模的 Llama 3.1 做合成数据, 都没写. 11B 和 90B 分别对应哪个 Llama 3.1 文本模型也没写, 页面上印出的 Llama 3.1 规模只有 8B, 70B, 405B. 这些空白在分析里不补.

## 5. 视觉评测表

视觉表叫 「Vision instruction-tuned benchmarks」, 比的是指令微调版, 对手是 Claude 3 - Haiku 和 GPT-4o-mini. 图像部分 8 行: MMMU 11B 50.7, 90B 60.3, Haiku 50.2, GPT-4o-mini 59.4; MMMU-Pro Standard 33.0, 45.2, 27.3, 42.3; MMMU-Pro Vision 23.7, 33.8, 20.1, 36.5; MathVista 51.5, 57.3, 46.4, 56.7; ChartQA 83.4, 85.5, 81.7; AI2 Diagram 91.1, 92.3, 86.7; DocVQA 88.4, 90.1, 88.8; VQAv2 只有 11B 75.2 和 90B 78.1. 文本部分 4 行: MMLU 73.0, 86.0, 75.2 (5-shot), 82.0; MATH 51.9, 68.0, 38.9, 70.2; GPQA 32.8, 46.7, 33.3, 40.2; MGSM 68.9, 86.9, 75.1, 87.0.

按行读, 90B 对 Haiku 在有数的 11 行里全部领先 (VQAv2 一行 Haiku 是空格). 对 GPT-4o-mini, 90B 在 MMMU, MMMU-Pro Standard, MathVista, MMLU, GPQA 上领先, 在 MMMU-Pro Vision, MATH, MGSM 上落后, 图表三行 GPT-4o-mini 没有数. 11B 对 Haiku 大多领先, DocVQA 88.4 对 88.8 落后, 文本部分 MMLU, GPQA, MGSM 也低于 Haiku, 不过 MMLU 两边设置不同. 所以第 4 页 「competitive」 的说法比第 2 页 「exceeding」 更贴表.

这张表还有几处读的时候要留意. ChartQA, AI2 Diagram, DocVQA 带星号, 全文找不到星号的注释. MMLU 一行 Haiku 是 5-shot, 其余三格是 0-shot CoT. 页面图像里每行最高分加粗, md 丢了加粗. 正文把对手写成 GPT4o-mini, 表头写 GPT-4o-mini.

## 6. 轻量模型: 剪枝和蒸馏

1B 和 3B 用了两种方法. 剪枝: 从 Llama 3.1 8B 出发, 一次性 (single shot) 做结构化剪枝, 有步骤地去掉网络的一部分, 调整权重和梯度的幅度, 得到更小的模型. 蒸馏: 在预训练阶段引入 Llama 3.1 8B 和 70B 的 logits, 当作 token 级的目标. 两者的顺序是先剪枝, 再用蒸馏找回性能. 页面称它们是第一批能高效装进设备, 能力又强的轻量 Llama 模型.

第 7 页的流程图把这件事画得更完整. 预训练数据混合同时喂给 Llama 3.1 8B 和 70B 预训练模型, 两者汇出 Logit Data; 8B 还有一条 「Pruning-based initialization」 的线直接连到 Llama 3.2 1B/3B Pretrained. 右边 Llama 3.1 405B Instruct 和 Synthetic Data Prompts 双向相连, 产出 Synthetic Data, 和 Collected Fine Tuning Data 一起进 1B/3B Instruct. 8B, 70B, 405B 三个框放在一条标着 「Inference Stack」 的横带里.

正文没有提 405B, 流程图有. 剪到 1B 和剪到 3B 各去掉多少参数, 去掉的是层, 注意力头还是隐藏维度, 用了多少预训练数据, logits 蒸馏的损失怎么配比, 页面都没写. 1B 和 3B 都从同一个 8B 剪出来, 这一点正文写得清楚.

## 7. 轻量评测表

轻量表没有表名, 对手是 Gemma 2 2B IT 和 Phi-3.5-mini IT, 两者都标 measured. 通用: MMLU (5-shot) 1B 49.3, 3B 63.4, Gemma 57.8, Phi 69.0; Open-rewrite eval 41.6, 40.1, 31.2, 34.5; TLDR9+ 16.8, 19.0, 13.9, 12.8; IFEval 59.5, 77.4, 61.9, 59.2. 工具使用: BFCL V2 25.7, 67.0, 27.4, 58.4; Nexus 13.5, 34.3, 21.0, 26.1. 数学: GSM8K 44.4, 77.7, 62.5, 86.2; MATH 30.6, 48.0, 23.8, 44.2. 推理: ARC Challenge 59.4, 78.6, 76.7, 87.4; GPQA 27.2, 32.8, 27.5, 31.9; Hellaswag 41.2, 69.8, 61.1, 81.4. 长上下文: InfiniteBench/En.MC 38.0, 63.3, Gemma 空, 39.2; InfiniteBench/En.QA 20.3, 19.8, 空, 11.3; NIH/Multi-needle 75.0, 84.7, 空, 52.7. 多语言: MGSM 24.5, 58.2, 40.2, 49.8.

正文的说法是 3B 在指令遵循, 摘要, 提示改写, 工具使用上胜过 Gemma 2 和 Phi 3.5-mini, 1B 和 Gemma 相当. 前半句和表对得上: IFEval, TLDR9+, Open-rewrite, BFCL V2, Nexus 五行都是 3B 在三者里最高. 可 MMLU, GSM8K, ARC Challenge, Hellaswag 四行是 Phi-3.5-mini 最高, 差距 5.6 到 11.6 分. 1B 对 Gemma 2, MMLU, GSM8K, ARC Challenge, Hellaswag 四行落后 8.5 到 19.9 分, 赢在 Open-rewrite, TLDR9+ 和 MATH.

长上下文三行里 Gemma 2 都是空格, 页面没说为什么. 整张表 1B 胜过 3B 的只有两行: InfiniteBench/En.QA 上 1B 20.3 对 3B 19.8, Open-rewrite 上 1B 41.6 对 3B 40.1. 第 9 页那张没有标题的柱状图, 四根柱子约 42, 40, 34, 31, 和 Open-rewrite 一行对得上, 顺序同样是 1B 最高.

## 8. 后训练, 128K 和权重格式

轻量模型的后训练和 Llama 3.1 做法相近: 几轮对齐, 每轮 SFT, RS, DPO. 上下文长度在后训练里扩到 128K token, 页面说质量和预训练模型保持一致. 合成数据经过处理和过滤, 各项能力的数据按摘要, 改写, 指令遵循, 语言推理, 工具使用配比.

放出的权重是 BFloat16. 量化版本还在探索, 页面说会跑得更快, 之后再分享. 第 9, 10 页两个手机演示图下都写着 「This demo is based on an unreleased quantized model」, 也就是说演示用的是没发布的量化模型. 手机顶栏印着 6011MB 和 6429MB 这样的数, 页面没解释含义, 也没说演示里是 1B 还是 3B.

128K 在页面上只和 1B, 3B 挂钩: Takeaways 第二条 (PDF 文本层) 和第 8 页都说的是轻量模型. 11B 和 90B 的上下文长度全文没写, 视觉表也没有长上下文的行. 硬件方面, 页面说和 Qualcomm, Mediatek 合作, 称它们是全球前两大移动 SoC 公司, Arm 为 99% 的移动设备提供基础计算平台, 这个 99% 挂了 Arm 官网的链接.

## 9. 四个演示框

正文里插了四个演示框. 第 6 页 「Image understanding demo」 是室内设计助手, 上传了一张有壁炉和抽象画的客厅照片, 截图里没有问答文字. 第 8 页 「Under the hood / Summarization demo」 左边是空白面板, 右边手机输入框里是一段约周六下午 1 点见面的群聊, 截图停在发送之前. 第 9 页是同一个演示框的下半截: 左边柱状图, 右边手机上把一段马德里家庭行程改写成条目. 第 10 页是一封请病假邮件的生成结果.

第 14 页小标题上方还有一个演示框的下半截, 只剩空白面板和弹出键盘的手机, 顶栏 6429MB, 标题被分页切掉了. 这些演示都是截屏里的静态画面, 看不到完整的输入输出, 也看不到延迟或吞吐的数字. 它们能说明官方想展示的用法 (摘要, 改写, 写邮件, 看图), 说明不了速度.

## 10. Llama Stack

页面说 7 月发布了 Llama Stack API 的征求意见稿, 没写年份. 这套 API 是定制 Llama 模型和搭智能体应用的标准接口, 覆盖微调, 合成数据生成等工具链组件. 之后做了推理, 工具使用, RAG 三类 API 的参考实现, 伙伴适配成 API 提供方, 再用 Llama Stack Distribution 把多个提供方打包成一个入口.

发布内容四项: Llama CLI (md 丢了, PDF 文本层有), python, node, kotlin, swift 四种语言的客户端代码, Distribution Server 和 Agents API Provider 的 Docker 容器, 多个发行版. 发行版又分四种: 单节点走 Meta 内部实现和 Ollama, 云端走 AWS, Databricks, Fireworks, Together, 端侧在 iOS 上走 PyTorch ExecuTorch, 本地机房由 Dell 支持. 第 2 页 Takeaways 另列了一份合作名单: AWS, Databricks, Dell Technologies, Fireworks, Infosys, Together AI, 比这里多了 Infosys.

两张框图给出了分层. 「Llama Stack APIs」 从上到下是智能体应用, Agentic System API (PromptStore, Assistant, Shields, Memory, Orchestrator), Model Toolchain API (批量推理, 实时推理, 量化推理, 持续预训练, 评测, 微调, 预训练, 奖励打分, 合成数据生成), 数据和模型, 硬件. 「Llama Stack Distribution」 是开发者, Llama Stack (API 和 CLI), 发行版三层, 发行版里再套伙伴 API 提供方和模型. 框图里写 Hosted, 正文写 cloud; 数据格里 Pretaining 少了一个 r.

## 11. 系统级安全

安全这一节先讲开放的好处, 然后是两个新组件. Llama Guard 3 11B Vision 配合 Llama 3.2 的图像理解能力, 过滤 「文本+图像」 的输入提示和针对这些提示的文本输出. Llama Guard 3 1B 基于 Llama 3.2 1B, 经过剪枝和量化, 体积从 2,858 MB 降到 438 MB. 这两个组件已经集成进参考实现, 演示和应用.

2,858 MB 到 438 MB 大约缩到 15%. 页面没说 2,858 MB 是什么精度; 如果按第 8 页说的 BFloat16, 每个参数 2 字节, 那是 14 亿到 15 亿个参数, 比 1B 这个名字多出不少. 438 MB 用了几比特, 剪掉多少, 过滤效果有没有下降, 全文都没给数. 11B Vision 版基于哪个模型也没写.

## 12. 页面自己对不上的地方

规模上有几处. 同一个对手 Gemma 2, 正文写 2.6B, 表头写 2B IT, 柱状图写 2.6B. Phi 3.5-mini 的 3.8B 只出现在柱状图横轴上. 「over 150 benchmark datasets」 在页面上只有 27 行, 23 个不同的名字. 「over 25 companies」 这段只点了 12 家加 3 家端侧伙伴, 致谢是 31 个名字. 视觉模型说是替换 Llama 3.1, 可 11B, 90B 和页面上的 3.1 规模 (8B, 70B, 405B) 一个也不重合. 蒸馏正文只有 8B 和 70B, 流程图多了 405B. Llama Guard 3 1B 的 2,858 MB 按 BF16 推算超过 1B.

日期上也有几处. 第 2 页说 「This year」 增长 10 倍, 第 16 页相关文章标题说 「since 2023」, 同一篇封面又说 「this year」, 两处链接地址写的是 5 月到 7 月用量翻倍. Llama 3.1 是 「two months」 前, 第一次公布 Llama 是 「a year and a half」 前, Llama Stack 征求意见是 「In July」, 都没有绝对日期. 页脚 「Meta © 2026」 和发文年份 2024 对不上, 看起来是抓取时的年份. 另外 「exceeding」 和 「competitive」 对视觉模型的定性前后不一, 第 1 页的 「fit onto edge and mobile devices」 到第 2 页变成 「fit onto select edge and mobile devices」.

## 13. 这份材料的边界

能从这 17 页记下来的是: 四个规模 1B, 3B, 11B, 90B; 视觉模型用交叉注意力适配器接图像编码器, 训练时语言模型冻结; 轻量模型从 3.1 8B 结构化剪枝, 再用 8B 和 70B 的 logits 蒸馏; 轻量模型 128K 上下文; 权重 BF16; 两张评测表的全部数字; Llama Stack 的组成; Llama Guard 3 的两个新型号和 2,858 MB, 438 MB 两个体积.

不能从这里记的是: 任何一个型号的层数, 隐藏维度, 注意力头数, 词表大小, 训练数据量, 训练算力, 图像编码器的身份和分辨率, 11B 和 90B 的上下文长度, 量化版的体积和速度. 如果别的目录写了这些数字, 它们来自别的材料, 不能算在这篇博客名下. 双语稿里的 12 条疑问都只用了这 17 页和 PDF 文本层里印出来的内容.
