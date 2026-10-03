源文是 deepmind.google 上 Gemini 模型页的抓取, 16 页, 18 张图, 没有正文段落意义上的技术内容: 没有模型结构, 训练数据, 参数规模, 也没有作者和日期. 下文只按页面上的字, 表格和链接写, 不从外部补.

# Gemini 3.1 Deep Think 产品页: 分析

## 1. 这是家族总览页, 标题取自头图

MinerU 把第一张头图的大标题 「Gemini 3.1 Deep Think」 当成了文档标题. 往下读, 页面的主角其实是 3.8 Flash: 第二张头图的 AI Studio 按钮带 model=gemini-3.8-flash, 第 9 页的对比表, 评测方法链接, Hands-on 的游戏演示和 Loopit 的引语都围着 3.8 Flash 转. Deep Think 全页只出现两次, 一次在第 1 页头图, 一次在第 13 页的 「Gemini Ecosystem」 轮播, 每次只有一句定位 「Best for modern challenges across science, rese...」 和一个 「Learn more」.

所以读这份材料要按产品页的读法. 页面骨架是一串栏目锚点: Models, Capabilities, Performance, Hands-on, Showcase, 后面接 Get started, Safety, Gemini Ecosystem, Try Gemini 和页脚. 这些是网页的分区, 告诉读者往哪里滚动, 并不说明模型内部由哪些部分组成. 页脚的 Gemini, Gemini Robotics, Gemini Omni, Nano Banana, Gemini Audio, Genie, Lyria, Veo 也只是 DeepMind 的产品目录, 不是 Gemini 的子模块.

## 2. Models 清单: 四个名字, 各一句话

第 3 到 7 页的 Models 区列了四项. 3.8 Flash 是 「Best for tackling complex agentic tasks at scale」, 面向大规模的复杂智能体任务; 3.5 Flash-Lite 是 「Best for high-volume tasks that need efficiency and intelligence」, 面向量大, 要效率也要智能的任务; 3.1 Pro 是 「Best for complex tasks and bringing creative concepts to life」, 面向复杂任务和把创意做出来; 3.5 Pro 只有一行 「coming soon」, 没有链接, 没有定位语.

这份清单有两处要留意. 第一, 各档版本号不同步: Flash 到了 3.8, Flash-Lite 在 3.5, Pro 还是 3.1, 下一代 Pro 标 3.5. 页面没解释为什么这样排, 也没说 3.1 Pro 和 3.8 Flash 谁更强, 第 9 页的表里没有 Pro 这一列. 第二, 页标题上的 Deep Think 不在清单里. 「Discover the right model for what you need」 这一栏让读者挑的是上面四个名字, 第 11 页 Shopify 案例用的 3.5 Flash 同样不在其中.

因此 Deep Think 和其余 Gemini 的关系, 这页给不出答案. 它和 3.1 Pro 共用 3.1 这个版本号, 这是唯一的线索, 但页上没有一句话把两者连起来. 它是 3.1 Pro 多给 TestingTime 的一种用法, 还是另一套单独训练的权重, 读者要去 /models/gemini/deep-think/ 那一页或别的官方材料找, 不能从报告推出来.

## 3. 链接落点: 版本号大多只在字面上

页上的型号链接几乎都不带版本. 3.8 Flash 链到 /models/gemini/flash/, 3.5 Flash-Lite 链到 /flash-lite/, 3.1 Pro 链到 /pro/, Deep Think 链到 /deep-think/, 3.8 Flash Cyber 链到 /cyber/. 版本号只写在链接文字里. 这类路径的好处是站点换代时不用改链接, 代价是同一个 URL 过一段时间可能讲的是另一代模型, 引用时只写 URL 不够, 还要写清抓取时页面上标的是哪个版本.

带版本号的 URL 全页只有三处. 第 1 页第二张头图的 「Try in Google AI Studio」 带 model=gemini-3.8-flash; 第 9 页表下的评测方法链接是 evals-methodology/gemini-3-8-flash; 第 12 页 Safety 的 Learn more 是 fsf-reports/gemini-3-pro. 前两处指向 3.8 Flash, 第三处指向的 Gemini 3 Pro 不在本页任何一个清单里. 与之对照, 第 14 页 「Try Gemini」 区的 Google AI Studio 入口不带 model 参数, 两个 「Try in Gemini」 按钮也只是打开 Gemini 应用首页.

还有几处名字和链接对不齐. 页脚的 Nano Banana 链到 /models/gemini-image/, 说明它在站内按 「Gemini 图像」 归类; 第 14 页的 Gemini Notebook 链到 notebooklm.google 这个域名; 第 11 页两个同名的 「Build with Gemini」, 一个去 Google Cloud 控制台的 agent-platform, 另一个去 Antigravity 的介绍博客. 这些都不影响理解页面, 但照着链接文字去引用会出错.

## 4. 性能表: 8 行第一, 输的几行差得不小

第 9 页的表拿 Gemini 3.8 Flash 和五个模型比: Gemini 3.7 Flash, Claude Opus 5, Claude Sonnet 5, GPT-5.6 Sol, GPT-5.6 Terra. 去掉两行价格, 分数一共 14 行 (BioMysteryBench 分人类可解, 人类难解两行). 3.8 Flash 拿了 8 行第一: Vals Finance Agent v2 61.4%, Harvey's Legal Agent Benchmark 10.0%, Terminal-bench 2.1 89.4%, CharXiv Reasoning 86.2%, LVBench 87.8% 或 87.1%, HLE-Verified 54.9%, BioMysteryBench 人类难解 56.5%, LABBench2 86.2%. 另有 2 行第二, 2 行第三, 2 行第四.

输的几行里差距不一样. DeepSWE v1.1 只比 Claude Opus 5 低 0.3 点, BioMysteryBench 人类可解低 1.3 点, 可以算并列. GDP.PDF 落后 GPT-5.6 Sol 5 点, OSWorld-2.0 落后 Claude Opus 5 16.4 点, GDPVal-AA v2 是 1545 对 1824 Elo, Terminal-bench 4.0 是 19.1% 对 51.8%, 相差 32.7 点. 第一的几行则有好几处领先很薄: Terminal-bench 2.1 和 CharXiv 领先 0.3 点, HLE-Verified 领先 0.4 点. 大差距集中在通用智能体, 操作电脑和知识型工作这几项, 领先集中在金融, 法律, 生物和图表视频理解.

和上一代 3.7 Flash 比, 14 行全部上升. 涨得最多的是 BioMysteryBench 人类难解, 从 43.5% 到 56.5%, 多 13.0 点; DeepSWE 和 OSWorld-2.0 各多 8.4 点; Terminal-bench 4.0 从 11.2% 到 19.1%. 涨得少的是 GDP.PDF (34.0% 到 35.0%), Harvey (多 1.2 点) 和 HLE-Verified (多 1.3 点). 页面没给两代之间改了什么, 所以这些差值只能当结果读.

## 5. 表里的口径要一行行看

第二列是口径, 大半行空着, 填了的几行口径各不相同. GDPVal-AA 是 Elo, 不是百分比, 不能和别的行放在一起平均; Harvey 和 GDP.PDF 是 「All pass rate」, 全部通过才算, 所以 Harvey 最高也只有 10.0%; CharXiv 注明 「No tools」; OSWorld-2.0 注明 「Partial score batch tool enabled」, 即按部分得分计, 且开启了批量工具; BioMysteryBench 按人类可解和人类难解拆开.

LVBench 一行只有 3.8 Flash 报了两个数, agentic 87.8%, static 87.1%, 其余五列各一个数, 没写是哪种设置. 按较低的 static 算, 3.8 Flash 也高于第二名 3.7 Flash 的 85.4%, 名次不变, 但领先幅度取哪个数, 页上没交代. 空着口径的行, 以及对手模型的分数是谁跑的, 用什么设置, 都要去表下的评测方法链接核对, 本页没有抓到那一页的内容.

## 6. 价格: 推广价到 2026 年底

价格两行按每百万 token 计, 输入价注明不含缓存. 3.7 Flash 和 3.8 Flash 完全同价: 输入 $0.75, 输出 $3.75, 括号里写着常规价 $1.50 和 $7.50. 对手里 Claude Opus 5 是 $5.00 / $25.00, Claude Sonnet 5 是 $2.00 / $10.00, GPT-5.6 Sol 是 $4.00 / $20.00, GPT-5.6 Terra 是 $2.00 / $12.00.

表下脚注说明了括号的意思: 两代 Flash 的推广价 2026 年 12 月 31 日到期, 2027 年 1 月 1 日起按 $1.50 / $7.50 收. 按这个常规价算, 3.8 Flash 的输入仍低于表里最便宜的 $2.00, 输出也低于次低的 $10.00. 另一个值得记下的点是两代 Flash 同价: 对这张表的读者来说, 升级到 3.8 不涉及价格变化, 差别只在分数.

## 7. Hands-on 和 Showcase: 演示归属要逐条看

Hands-on 的标题写 「Explore what you can do with Gemini 3.8 Flash and Gemini 3.5 Flash-Lite」, 但下面只有一个演示, 属于 3.8 Flash. 那是 Chromancers 游戏: 3.8 Flash 在 Google Antigravity 里, 用一条简单提示词加一条循环指令做出来, 有谜题和环境叙事, 玩家扮演巫师在城堡里穿行. 截图里能读到关卡名 「Chapter 1: The Sealed Vestibule」 和几条任务. 游戏贴图由 Nano Banana 生成, 所以这个成品是两个模型合作的结果. 全页没有 3.5 Flash-Lite 的任何演示.

Showcase 有两段客户引语和一个视频案例. Loopit 的 CTO Haoyuan Guo 说他们把 3.8 Flash 接进 AI 游戏制作智能体, 用于写代码, 推理素材和快速视觉校验, 称赞它全面, 快, 画面精致. Glean 的 AI 产品负责人 Thai Tran 那段被截成碎片, 只剩 「excels at long-running」, 「as Gemini 3.7 Flash」 等残词, 比较的内容缺失. 视频案例是 Shopify, 用的是 Gemini 3.5 Flash, 做法是让子智能体并行, 在长时间跨度上分析复杂数据, 给全球商家做增长预测. 3.5 Flash 不在本页清单里, 这个案例不能当作 3.8 Flash 的证据.

## 8. Safety 与生态区块指向别的型号

Safety 区块只有两句表态: 以责任为核心构建, 在所有工作里优先安全与防护. 它唯一的链接指向 Gemini 3 Pro 的报告, 路径里的 fsf 对应页脚的 「Frontier safety」. 本页讲了 3.8 Flash 的分数和价格, 却没有给 3.8 Flash 的安全报告链接, 这段表态和上面的表说的不是同一个模型.

第 13 页的 「Gemini Ecosystem」 轮播放了两张卡: Gemini 3.8 Flash Cyber, 定位是快速高效地发现并修复漏洞; Gemini 3.1 Deep Think, 与第 1 页同一句定位. OCR 在这两张卡的文字里插了大量空格, 标题链接也被切成几段, 但链接目标清楚, 分别是 /cyber/ 和 /deep-think/. Cyber 名字里带 3.8 Flash, 表里没有它的分数, 它和 3.8 Flash 是不是同一套权重, 页上没有说明.

## 9. 18 张图: 大半是图标

18 张图里没有一张图表或结构图. 有内容的图是 4 张: 第 9 页和第 10 页各一张 Chromancers 截图, 第 11 页 Shopify 视频的封面 (一名男子对镜头讲话, 中间有播放键), 第 12 页 Safety 的蓝白渐变配图. 其余 14 张是图标和标志: 第 8 页 Agentic coding 卡片的代码图标, 第 10 页 Loopit 字标和一个被裁掉的字母残片, 第 14 页 Gemini, AI Mode, Gemini Notebook, Google AI Studio 四个应用图标, 第 15 页 Gemini API 和 Enterprise Agent Platform 共用的四角星, 以及 LinkedIn, X, Instagram, YouTube, GitHub 五个社交图标.

好几张图的文件名会误导人. p09-google-deepmind.png 是游戏截图, p15-google-deepmind.png 是 LinkedIn 图标, p15-sign-up-for-updates-...png 是 GitHub 图标, p10-at-loopit-...png 不是 Loopit 的标志. 这些名字是 MinerU 按图片旁边最近的文字起的, 引用图片时要看画面, 别看文件名.

## 10. 引用这页的边界

能从这页引用的是: 抓取时的型号阵容和各自一句定位, 第 9 页每一行分数连同它的口径, 两代 Flash 的价格和 2026 年 12 月 31 日的推广价到期日, Chromancers 的制作方式, 以及 Loopit 引语的原话和署名. 引分数时最好一并写上对比的五个模型和评测方法链接, 因为这张表的名次只在这六列之间成立.

不能从这页引用的是: Deep Think 与 3.1 Pro 或 3.8 Flash 的关系, 任何模型结构, 参数规模或训练数据, Shopify 的 3.5 Flash 做法作为 3.8 Flash 的能力, Gemini 3 Pro 的安全报告作为 3.8 Flash 的安全结论, 以及 Glean 那段残缺引语的含义. 页上还有几处截断, 分别在第 1 页的 「rese」, 第 8 页的 「understan」 和 「video and」, 第 11 页 Antigravity 卡片的 「t」, 第 13 页的 「ac」; 这些位置的完整句子只有第 11 页那句在第 15 页找得到.
