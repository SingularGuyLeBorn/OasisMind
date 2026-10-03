---
title: "Step-2 · 对照译稿"
category: "模型库"
tags: ["StepFun", "对照译稿"]
published: true
excerpt: "Step-2 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 7 -->

# WAIC | StepFun Speeds Up: Foundation Models Upgrade to "Trillion-Parameter + Multimodal," Product Ecosystem Accelerates

# WAIC｜阶跃速度! 大模型全面升级「万亿+多模」, 产品生态加速发展

Source: StepFun official WeChat · URL: https://mp.weixin.qq.com/s/zgm745w_Gk3oBngPDdLb3w

来源: 阶跃 StepFun 官方微信 · URL: https://mp.weixin.qq.com/s/zgm745w_Gk3oBngPDdLb3w

At the opening of the 2024 World Artificial Intelligence Conference and High-Level Meeting on Global AI Governance (WAIC 2024), StepFun debuted three new Step-series general models: the official release of the Step-2 trillion-parameter language model, the Step-1.5V multimodal model, and the Step-1X image generation model. Since the March announcement, the Step series has, in roughly 100 days, moved from hundred-billion to trillion-parameter scale, from language to multimodal models, and from understanding to generation.



在今天揭幕的 2024 世界人工智能大会暨人工智能全球治理高级别会议(简称「WAIC 2024」)上, 阶跃星辰首发了三款 Step 系列通用大模型新品: Step-2 万亿参数语言大模型正式版, Step-1.5V 多模态大模型, Step-1X 图像生成大模型. 自今年三月正式公布以来, Step 系列通用大模型在短短 100 天左右实现了从千亿参数到万亿参数, 从语言模型到多模态模型, 从理解到生成的全面进步.

StepFun also highlighted consumer-facing self-developed applications built on its models, and disclosed recent progress and plans in ecosystem partnerships.



同时, 阶跃星辰还重点展示了面向 C 端用户的自研大模型应用产品, 并披露了在大模型生态合作领域的最新进展与计划.

## Trillion-Parameter + Multimodal

## 万亿+多模

### Upgrading the General Model Foundation End to End

### 全面升级通用大模型底座能力

In March this year, StepFun first appeared publicly and shared R&D progress on the Step-series general models. Today it announced a full upgrade of the Step family.



今年三月, 阶跃星辰首次亮相, 公布了 Step 系列通用大模型的研发进展. 今天, 阶跃星辰宣布对 Step 系列通用大模型家族进行全面升级.

The newly released official Step-2 trillion-parameter language model uses an innovative MoE architecture. Leveraging StepFun's industry-leading systems capability, Step-2 substantially improves training efficiency and, on math, logic, coding, knowledge, creative writing, and multi-turn dialogue, feels broadly close to GPT-4. Enterprises and developers can apply for access via the **StepFun Open Platform** (https://platform.stepfun.com).



最新发布的 Step-2 万亿参数语言大模型正式版, 采用了创新的 MoE 模型架构. 同时, 基于阶跃星辰行业领先的系统能力, Step-2 大幅提升了训练效率, 在数学, 逻辑, 编程, 知识, 创作, 多轮对话等方面体感全面逼近 GPT-4, 企业和开发者可以通过**阶跃星辰开放平台** (https://platform.stepfun.com) 申请体验.

> **想:** 页 1 把 Step-2 写成「万亿参数」又写成「创新的 MoE」架构, 后文有没有再给出每 token 激活规模, 专家池大小或 top-k?
> 没有. 页 1–2 只重复「万亿参数」与 MoE 标签, 以及训练效率与体感逼近 GPT-4 的定性句. 没有激活参数字, 没有专家数 / 共享专家 / 路由公式. 读这页只能记下公开口号是万亿级 MoE 语言模型, 不能据此还原稀疏拓扑.

<!-- page 2 of 7 -->

StepFun

阶跃星辰

#### Step-2 Trillion-Parameter MoE Language Model

#### Step-2万亿参数MoE语言大模型

On math, logic, coding, knowledge, creative writing, and multi-turn dialogue evaluations, results broadly approach mainstream international models.



在数学, 逻辑, 编程, 知识, 创作, 多轮对话等方面测试, 全面逼近国际主流模型

<table><tr><td></td><td colspan="3">Overall</td><td>Arena win rate</td><td>Exams</td><td colspan="2">Logical reasoning</td><td colspan="2">Math</td><td colspan="2">Knowledge</td><td>Coding</td></tr><tr><td>Model</td><td>LIVEBENCH</td><td>ARENA_HARD</td><td>MTBENCH</td><td>VICUNA(v.s. gpt-4o)</td><td>AGIEVAL(cls avg)</td><td>BBH(3-shot)</td><td>DROP(zero-shot)</td><td>GSMBK(zero-shot)</td><td>MATH(zero-shot)</td><td>MMLU_PRO(zero-shot)</td><td>MMLU_TEST(zero-shot)</td><td>HUMANEVAL(zero-shot)</td></tr><tr><td>Step-2</td><td>44.1</td><td>68.1</td><td>8.9</td><td>48.3</td><td>69.5</td><td>89.4</td><td>86.0</td><td>94.0</td><td>68.4</td><td>63.0</td><td>82.9</td><td>84.1</td></tr><tr><td>GPT-4-1106</td><td>45.0</td><td>74.6</td><td>9.1</td><td>41.9</td><td>63.1</td><td>80.6</td><td>79.3</td><td>90.8</td><td>64.1</td><td>68.3</td><td>85.8</td><td>86.6</td></tr><tr><td>Claude 3 Opus</td><td>51.0</td><td>59.2</td><td>8.8</td><td>18.4</td><td>61.7</td><td>86.8</td><td>83.1</td><td>95.0</td><td>60.1</td><td>68.2</td><td>85.7</td><td>84.9</td></tr><tr><td>Llama3 70B Chat</td><td>37.5</td><td>58.6</td><td>8.6</td><td>44.5</td><td>59.2</td><td>78.2</td><td>85.0</td><td>93.0</td><td>50.4</td><td>57.2</td><td>80.3</td><td>78.7</td></tr></table>

<table><tr><td></td><td colspan="3">综合</td><td>对战胜率</td><td>考试</td><td colspan="2">逻辑推理</td><td colspan="2">数学</td><td colspan="2">知识</td><td>编程</td></tr><tr><td>模型</td><td>LIVEBENCH</td><td>ARENA_HARD</td><td>MTBENCH</td><td>VICUNA(v.s. gpt-4o)</td><td>AGIEVAL(cls avg)</td><td>BBH(3-shot)</td><td>DROP(zero-shot)</td><td>GSMBK(zero-shot)</td><td>MATH(zero-shot)</td><td>MMLU_PRO(zero-shot)</td><td>MMLU_TEST(zero-shot)</td><td>HUMANEVAL(zero-shot)</td></tr><tr><td>Step-2</td><td>44.1</td><td>68.1</td><td>8.9</td><td>48.3</td><td>69.5</td><td>89.4</td><td>86.0</td><td>94.0</td><td>68.4</td><td>63.0</td><td>82.9</td><td>84.1</td></tr><tr><td>GPT-4-1106</td><td>45.0</td><td>74.6</td><td>9.1</td><td>41.9</td><td>63.1</td><td>80.6</td><td>79.3</td><td>90.8</td><td>64.1</td><td>68.3</td><td>85.8</td><td>86.6</td></tr><tr><td>Claude 3 Opus</td><td>51.0</td><td>59.2</td><td>8.8</td><td>18.4</td><td>61.7</td><td>86.8</td><td>83.1</td><td>95.0</td><td>60.1</td><td>68.2</td><td>85.7</td><td>84.9</td></tr><tr><td>Llama3 70B Chat</td><td>37.5</td><td>58.6</td><td>8.6</td><td>44.5</td><td>59.2</td><td>78.2</td><td>85.0</td><td>93.0</td><td>50.4</td><td>57.2</td><td>80.3</td><td>78.7</td></tr></table>

> **看表:** 页 2 表里 Step-2 相对 GPT-4-1106, LIVEBENCH 44.1 vs 45.0, ARENA_HARD 68.1 vs 74.6, MMLU_PRO 63.0 vs 68.3, HUMANEVAL 84.1 vs 86.6; 同页标题又写「全面逼近国际主流模型」. 这句口号该按「逐格全胜」读, 还是按「多能力面接近」读?
> 应按后者. 同表 Step-2 在 VICUNA(v.s. gpt-4o) 48.3 vs GPT-4-1106 的 41.9, AGIEVAL 69.5 vs 63.1, BBH 89.4 vs 80.6, DROP 86.0 vs 79.3, GSMBK 94.0 vs 90.8, MATH 68.4 vs 64.1 上更高; 相对 Claude 3 Opus 的 LIVEBENCH 51.0 与 GSMBK 95.0 仍落后. 「全面逼近」是页 1–2 的体感/综合口径, 不能改写成每一格都超过表内三家对照.

> **问:** 表头数学列写成 **GSMBK**(zero-shot); 通稿有没有另处写成 GSM8K, 或解释 BK 指什么?
> 没有. 页 2 表头原文就是 `GSMBK(zero-shot)`, 英文块与中文表均按源文照抄. 全篇 7 页没有第二处纠错或脚注. 引用时应保留源文拼写, 不要擅自改成 GSM8K 再当已核验的官方更名.

StepFun also announced multiple advances in multimodal model R&D.



此外, 阶跃星辰还公布了其在多模态大模型研发领域的多项进展.

The upgraded Step-1.5V hundred-billion-parameter multimodal model improves image perception and understanding across the board and has strong video understanding: it can recognize objects, people, and environments in video, and grasp overall atmosphere and character emotion. With Step-2's trillion-parameter model behind it, Step-1.5V's reasoning ability rises sharply, supporting advanced tasks such as solving math problems from images, writing code, and composing poetry. The release of Step-1.5V marks a breakthrough for StepFun in multimodal models, and a fast leap from image understanding to video understanding.



新升级的 Step-1.5V 千亿参数多模态大模型, 在图像感知和理解能力上全面提升, 并具备出色的视频理解能力. 它能准确地识别视频中的物体, 人物和环境, 并理解视频的整体氛围与人物情绪. 在 Step-2 万亿参数大模型的加持下, Step-1.5V 推理能力大幅增强, 能根据图像内容进行解答数学题, 编写代码, 创作诗歌等高级推理任务. Step-1.5V 的发布, 体现出阶跃星辰在多模态大模型领域取得了突破性进展. 同时, 它标志着阶跃星辰在极短的时间内, 实现了从图像理解到视频理解的跨越升级.

> **核对:** 页 2 写 Step-1.5V 是「千亿参数」, 又写「在 Step-2 万亿参数大模型的加持下」推理增强. 原文有没有把 Step-1.5V 的语言骨干画成与 Step-2 同源, 或给出融合图 / 层位?
> 没有. 句子停在产品叙事「加持」与能力列表(识图解题, 写代码, 作诗). 没有共享权重声明, 没有视觉编码器名, 没有对齐损失. 只能记两条公开规格口号(千亿多模态 + 万亿语言加持), 不能还原多模态栈拓扑.

The newly released Step-1X image generation model marks progress on StepFun's path toward unifying multimodal understanding and generation. It uses a fully self-developed DiT (Diffusion Models with transformer) architecture, with three sizes—600M, 2B, and 8B—for different scenarios. Step-1X claims stronger semantic alignment and instruction following, with deep optimization for Chinese elements and culture. The team also demoed video generation for Chinese animation IP.



新发布的 Step-1X 图像生成大模型, 则代表了阶跃星辰在推动多模态理解和生成统一的技术路线上取得重要进展. 它采用全链路自研的 DiT(Diffusion Models with transformer)模型架构, 支持 600M, 2B, 8B 三种不同的参数量, 能够满足不同场景的需求. Step-1X 具备更加强大的语义对齐和指令跟随能力, 还针对中国元素和文化进行了深度优化, 更具中国风格. 此外, 阶跃星辰团队还针对中国动画 IP 进行了视频生成能力的技术展示.

> **拆开:** 页 2 给 Step-1X 三个档 600M / 2B / 8B, 并写「全链路自研的 DiT」. 通稿有没有指定默认档, 或披露 patch size, 采样步数, 条件注入方式?
> 没有. 三档只写成「满足不同场景的需求」. DiT 展开括号是 「Diffusion Models with transformer」, 没有 adaLN / U-Net 对照, 没有训练数据量. 选型时只能记下自研 DiT 三档口号与中文风格优化主张; 机制细节要另找材料.

<!-- page 3 of 7 -->

![Image block](images/p03-image.png)

![Image block](images/p03-image-2.png)

![Image block](images/p03-ceo-agi-agi-agi.png)

StepFun founder and CEO Dr. Jiang Daxin said: "To climb the AGI peak, 'trillion-parameter scale' and 'multimodal fusion' are both indispensable. Trillion-parameter scale is the basic threshold for AGI; multimodal large models are the necessary path to AGI. Looking ahead, we will keep making models larger and stronger, building super models, while putting models to work in jobs and life—multiplying everyone's possibilities by ten."



阶跃星辰创始人, CEO 姜大昕博士表示: 「攀登 AGI 山峰, 『万亿参数』和『多模融合』缺一不可. 万亿参数规模, 是实现 AGI 的基础门槛; 多模态大模型, 是通向 AGI 的必经之路. 面向未来, 我们会继续将模型做大做强, 打造超级模型, 同时让模型服务于工作和生活, 十倍每个人的可能.」

> **确认:** 页 3 CEO 原句把「万亿参数规模」说成「实现 AGI 的基础门槛」. 同页前后有没有给出可复核的阈值实验, 或把门槛写成某一评测分数线?
> 没有. 这是演讲定性主张, 配图是现场展板/人像. 页 2 评测表只对照 Step-2 与 GPT-4-1106 / Claude 3 Opus / Llama3 70B Chat, 并不论证「未到万亿就不可能 AGI」. 引用时应标成管理层产品叙事, 不要写成论文结论.

## Self-Developed + Ecosystem

## 自研+生态

### Accelerating Product and Application Landing

### 加速推动大模型产品应用落地

On the WAIC floor, StepFun showed consumer self-developed products and the latest results and plans with industry partners for ecosystem applications.



阶跃星辰在 WAIC 现场展示了面向 C 端用户的自研产品, 以及与行业头部公司在促进大模型生态应用方面的最新成果与计划.

![Image block](images/p03-image-3.png)

<!-- page 4 of 7 -->

![Image block](images/p04-image.png)

<!-- page 5 of 7 -->

![Image block](images/p05-image.png)

Swipe for the next image

滑动查看下一张图片

> **回看:** 页 3–5 连续四张配图(`p03-image-3`, `p04-image`, `p05-image`, 以及页 3 前三张)占了通稿大半视觉篇幅, 正文有没有把图内产品名 / 分数转录成可复制的 Markdown 表?
> 没有. 页 5 后才接「跃问」「冒泡鸭」文字段. 图是现场产品与合作展示面; 本稿不 OCR 造表. 能核对的文字命题仍以页 1–2 模型规格与页 2 评测表为准.

The intelligent assistant **"Yuewen"** (https://yuewen.cn) and the AI open-world platform **"Maopaoya"** (https://maopaoya.com) are StepFun's two consumer products. Powered by the Step series, Yuewen can accurately describe and understand text, data, and charts in images, and handle content creation, logical reasoning, and data analysis. Maopaoya builds an AI open world where users explore stories, create characters, and immerse in their own open worlds.



智能助手——**「跃问」**(https://yuewen.cn)和 AI 开放世界平台——**「冒泡鸭」**(https://maopaoya.com), 是阶跃星辰面向 C 端用户推出的两款自研产品. 基于 Step 系列通用大模型的强大能力, 「跃问」能准确地描述和理解图像中的文字, 数据, 图表等信息, 出色地完成内容创作, 逻辑推理, 数据分析等任务. 「冒泡鸭」则打造了一个全新的 AI 开放世界. 在这里, 用户可以探索故事, 创作角色, 沉浸属于自己的开放世界.

StepFun also announced deep partnerships in finance, content creation, and consumer entertainment, exploring consumer innovation. These include:



同时, 阶跃星辰宣布在金融财经, 内容创作, 消费娱乐等领域, 与众多合作伙伴达成了深度合作, 共同探索面向 C 端用户的创新应用. 这其中包括:

**Finance:** deep cooperation with Jiemian Caixin under Shanghai United Media Group, advancing AIGC financial news, intelligent investment research, and intelligent advisory. Together with Guotai Junan and Jiemian Caixin, they launched the industry's first hundred-billion-parameter multimodal securities vertical model—Junhong Lingxi—said to be the first to fully embed large-model capability into a client intelligent service system, covering advisory Q&A, research content production, and interaction modes.



**面向金融财经领域**, 阶跃星辰与上海报业旗下界面财联社达成深度合作, 双方围绕 AIGC 财经资讯, 智能投研, 智能投顾等领域推进大模型的应用落地. 同时, 阶跃星辰还联合国泰君安, 界面财联社推出业内首个千亿级参数多模态证券垂直类大模型——君弘灵犀大模型, 在行业内首个实现了将大模型能力全面融入客户智能化服务体系之中, 为客户在智能投顾问答, 投研内容生产和交互模式上带来全新体验.

> **停一下:** 页 5–6 把君弘灵犀写成「业内首个千亿级参数多模态证券垂直类大模型」. 通稿有没有给出它相对 Step-1.5V / Step-2 的参数对照表, 或独立评测分?
> 没有. 只有合作叙事与「首个」定性. 千亿级与页 2 Step-1.5V 的千亿口号量级相近, 但文中没有写清是否同干, 是否另训. 不能把君弘灵犀分数并进页 2 Step-2 表.

**Content creation:** joint exploration with Shanghai Film on "AI+IP". They launched a *Havoc in Heaven* AI interactive experience—"Guess which immortal you are"—calling Step-series models for image understanding, style transfer, image generation, and plot creation. They also demoed video generation with the *Calabash Brothers* IP. Partnerships with ChineseAll and CNKI explore applications in online literature and knowledge services.



**面向内容创作领域**, 阶跃星辰联合上海电影在「AI+IP」领域进行创新探索. 双方推出了一款 《大闹天宫》AI互动体验——「测测你是哪路神仙」, 调用了 Step 系列大模型, 融合了图像理解, 风格迁移, 图像生成, 剧情创作等多种能力. 此外, 阶跃星辰还与上海电影结合《葫芦兄弟》的 IP 进行了视频生成能力的展示. 此外, 阶跃星辰已与中文在线, 中国知网等展开合作, 共同探索大模型在网络文学, 知识服务等领域的创新应用.

<!-- page 6 of 7 -->

**Consumer entertainment:** with YAHAHA Studios, exploring an AI+3D game engine platform so more game ideas can ship via no-code and UGC.



**面向消费娱乐领域**, 阶跃星辰与 YAHAHA Studios 共同探索建立 AI+3D 游戏引擎平台, 让更多有趣的游戏创意通过无代码, UGC 的方式得以实现.

> **再看:** 页 1 时间线写「三月公布」后约 100 天到 WAIC 首发万亿; 页 6 有没有补充训练 token 量, 算力预算或中间 checkpoint 名, 好核对这 100 天到底扩了什么?
> 没有. 「100 天左右」只出现在页 1 开篇. 页 6–7 转向开放平台「繁星计划」与口号收束. 时间跨度是公关时间线, 不是可复现的训练课表.

StepFun also launched an open platform program—"Fanxing Plan"—investing resources to support outstanding multimodal startups and indie developer teams, accelerating application landing. Looking ahead, it will keep working with developers and partners on AI application innovation.



此外, 阶跃星辰宣布推出开放平台——「繁星计划」, 投入优质资源扶持多模态领域优秀的初创企业与独立开发者团队, 共同加速 AI 大模型技术在各类场景的应用落地. 面向未来, 阶跃星辰将继续与广大开发者和合作伙伴携手, 探索AI应用落地的创新与实践.

✦

With StepFun's strength, toward the sea of stars!

✦

以阶跃之力, 赴星辰大海!

> **对一下:** 页 2 VICUNA 列标题是 `VICUNA(v.s. gpt-4o)`, Step-2 填 48.3, GPT-4-1106 填 41.9, Claude 3 Opus 填 18.4. 原文有没有说明 48.3 是胜率百分比, 平局怎么计, 或评测协议版本?
> 没有. 列组名是「对战胜率」, 括号对照是 gpt-4o, 但没有样本数, 裁判模型, 温度或平局规则. 只能按表内相对高低读: Step-2 高于同表 GPT-4-1106 与 Claude 3 Opus; 不能外推成对 gpt-4o 的绝对战力证明.

<!-- page 7 of 7 -->
