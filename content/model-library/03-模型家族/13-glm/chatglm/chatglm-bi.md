---
title: "ChatGLM-6B 仓库首页 · 对照译稿"
category: "模型库"
tags: ["GLM", "对照译稿"]
published: true
excerpt: "ChatGLM-6B 仓库首页 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 10 -->

![Image block](images/p01-main.png)

(图: 一个灰色线条小图标, 两个前后叠着的对话气泡, 没有文字, 没有数据.)

> **回看:** 文件名叫 p01-main.png, 图里画的是 main 分支吗?
> 不是. 画面只有两个叠放的对话气泡, 是 GitHub 页面角落的一个小图标. MinerU 给图起名时取了图片附近的一行字, 这一行正好是分支下拉框上的 「main」, 于是图标挂上了分支名. 这一页没有一张和模型有关的图.

**main**

**main** (当前所在的分支.)

Go to file

跳转到文件 (GitHub 仓库页上的文件搜索按钮.)

Latest commit: duzx16, "Merge pull request #1485 from zRzRzRzRzRzR/main", 401bf3a, 2 years ago.

| Path | Last commit message | When |
| --- | --- | --- |
| .github/ISSUE_TEMPLATE | Update feature request template | 3 years ago |
| examples | Update example description | 3 years ago |
| improve | Update README | 3 years ago |
| limitations | Update limitations | 3 years ago |
| ptuning | Fix typo: removing duplicate imports of Aut... | 3 years ago |
| resources | Add webglm photo | 3 years ago |
| .gitignore | Update README | 3 years ago |
| FAQ.md | Update for MacOS | 3 years ago |
| LICENSE | Add License | 3 years ago |
| MODEL_LICENSE | update license | 3 years ago |
| PROJECT.md | Update project | 3 years ago |
| README.md | GLM-4更新 | 2 years ago |
| README_en.md | fix | 2 years ago |
| UPDATE.md | Update README | 3 years ago |
| api.py | Fix typos | 3 years ago |
| cli_demo.py | fix input unicodedecodererror | 3 years ago |
| cli_demo_vision.py | Update cli demo | 3 years ago |
| requirements.txt | Merge branch 'dev' into dev_multi_gpu | 3 years ago |
| utils.py | Fix multi-gpu loading | 3 years ago |
| web_demo.py | Add multi-gpu deployment | 3 years ago |
| web_demo2.py | Update web_demo2.py | 3 years ago |
| web_demo_old.py | Use chatbot web demo | 3 years ago |
| web_demo_vision.py | Add vision demo | 3 years ago |

最近一次提交: duzx16 合并了 zRzRzRzRzRzR/main 发来的第 1485 号 PR, 提交号 401bf3a, 时间是两年前. (源文把用户名写成 「.duzx16」, 开头那个点是抓取时头像位置留下的残点.)

| 路径 | 最后一次提交说明 | 时间 |
| --- | --- | --- |
| .github/ISSUE_TEMPLATE | 更新功能请求模板 | 三年前 |
| examples | 更新示例说明 | 三年前 |
| improve | 更新 README | 三年前 |
| limitations | 更新局限性 | 三年前 |
| ptuning | 修正笔误: 删掉重复导入的 Aut... (原页截断) | 三年前 |
| resources | 加入 WebGLM 图片 | 三年前 |
| .gitignore | 更新 README | 三年前 |
| FAQ.md | 补充 MacOS 相关内容 | 三年前 |
| LICENSE | 加入 License | 三年前 |
| MODEL_LICENSE | 更新 license | 三年前 |
| PROJECT.md | 更新项目列表 | 三年前 |
| README.md | GLM-4 更新 | 两年前 |
| README_en.md | 修正 | 两年前 |
| UPDATE.md | 更新 README | 三年前 |
| api.py | 修正笔误 | 三年前 |
| cli_demo.py | 修复输入时的 UnicodeDecodeError | 三年前 |
| cli_demo_vision.py | 更新命令行 demo | 三年前 |
| requirements.txt | 把 dev 分支合并进 dev_multi_gpu | 三年前 |
| utils.py | 修复多卡加载 | 三年前 |
| web_demo.py | 加入多卡部署 | 三年前 |
| web_demo2.py | 更新 web_demo2.py | 三年前 |
| web_demo_old.py | 改用 chatbot 形式的网页 demo | 三年前 |
| web_demo_vision.py | 加入视觉 demo | 三年前 |

> **问:** README.md 最后一次提交写的是 「GLM-4更新」, GLM-4 在这个仓库里吗?
> 从文件列表看不在. 根目录的脚本只有 api.py, cli_demo 两个, utils.py 和 web_demo 四个, 名字里没有一个带 GLM-4; requirements.txt 和 utils.py 的最后提交都是三年前. 两年前动过的只有 README.md 和 README_en.md 两个说明文件, 外加一次 PR 合并. 第 2 页的 GLM-4 段落把 「GLM-4 开源模型」 链到 github.com/THUDM/GLM-4, 那是另一个仓库. 所以 「GLM-4 更新」 是在 ChatGLM-6B 的 README 顶上加了一段 GLM-4 公告, 代码和权重不在这里, 两者不是同一个仓库.

## ChatGLM-6B

Join us on [Discord](https://discord.gg/fK2dz4bg) and [WeChat](https://github.com/zai-org/ChatGLM-6B/blob/main/resources/WECHAT.md).

欢迎加入 [Discord](https://discord.gg/fK2dz4bg) 和 [微信群](https://github.com/zai-org/ChatGLM-6B/blob/main/resources/WECHAT.md). (微信入口是仓库 resources 目录下的 WECHAT.md.)

<!-- page 2 of 10 -->

Try and use larger-scale commercial GLM models on the [Zhipu AI Open Platform](https://open.bigmodel.cn/?utm_campaign=open&_channel_track_key=OWTVNma9).

更大规模的 GLM 商业模型可以在 [智谱 AI 开放平台](https://open.bigmodel.cn/?utm_campaign=open&_channel_track_key=OWTVNma9) 上体验和调用.

Read this in [English](https://github.com/zai-org/ChatGLM-6B/blob/main/README_en.md).

英文版在 [README_en.md](https://github.com/zai-org/ChatGLM-6B/blob/main/README_en.md). (这份抓取只有中文 README.md, README_en.md 没有抓进来. 本文件里除了 GitHub 界面文字, WebGLM 演示和代码之外, 英文行都是按中文和链接写出的英文, 不是 README_en.md 的原句. 中文行按页面事实重写.)

## GLM-4 open-source models and API (GLM-4 开源模型和 API)

We have released our latest chat LLM, **GLM-4**, which makes new breakthroughs on several metrics. You can try it through the following two channels.

智谱已经发布新一代对话大模型 **GLM-4**, 称它在多项指标上有新的突破, 可以通过下面两个渠道体验.

- [GLM-4 open-source models](https://github.com/THUDM/GLM-4): We have open-sourced the GLM-4-9B series, with clear gains across metrics. You are welcome to try it.

- [GLM-4 开源模型](https://github.com/THUDM/GLM-4): 已开源 GLM-4-9B 系列, 页上说各项指标都有明显提升. (源文这里写成 「在各项指标的ce是上」, 「ce是」 是乱码, 原字看不出来.)

[ChatGLM (Zhipu Qingyan)](https://chatglm.cn/main/detail?fr=ecology_x): try the latest GLM-4, including features such as **GLMs** and **All tools**.

[智谱清言](https://chatglm.cn/main/detail?fr=ecology_x): 可以体验最新版 GLM-4, 包括 **GLMs**, **All tools** 等功能.

[API platform](https://open.bigmodel.cn/?utm_campaign=open&_channel_track_key=OWTVNma9): the new-generation API platform is live. You can try new models there, including GLM-4-0520, GLM-4-air, GLM-4-airx, GLM-4-flash, GLM-4, GLM-3-Turbo, CharacterGLM-3, and CogView-3. Among them, GLM-4 and GLM-3-Turbo support System Prompt, Function Call, Retrieval, Web_Search, and other new features.

[API 平台](https://open.bigmodel.cn/?utm_campaign=open&_channel_track_key=OWTVNma9): 新一代 API 平台已上线, 可以直接调用 GLM-4-0520, GLM-4-air, GLM-4-airx, GLM-4-flash, GLM-4, GLM-3-Turbo, CharacterGLM-3, CogView-3 等模型. 其中 GLM-4 和 GLM-3-Turbo 支持 System Prompt, Function Call, Retrieval, Web_Search 这些新功能.

[GLM-4 API cookbook](https://github.com/MetaGLM/glm-cookbook/): tutorials and basic applications for the GLM-4 API. API questions can be raised in this cookbook, or you can ask the [GLM-4 API AI assistant](https://open.bigmodel.cn/shareapp/v1/?share_code=sQwt5qyqYVaNh1O_87p8O) for help with common questions.

[GLM-4 API 开源教程](https://github.com/MetaGLM/glm-cookbook/): GLM-4 API 的教程和基础应用. API 相关的问题可以到这个教程仓库里提, 常见问题也可以问 [GLM-4 API AI 助手](https://open.bigmodel.cn/shareapp/v1/?share_code=sQwt5qyqYVaNh1O_87p8O).

> **拆开:** 开头说 「两个渠道」, 下面列了几样?
> 列了四样: GLM-4 开源模型 (THUDM/GLM-4 仓库), 智谱清言 (chatglm.cn), API 平台 (open.bigmodel.cn), GLM-4 API 开源教程 (MetaGLM/glm-cookbook). 如果按 「开源权重」 和 「在线服务」 分, 能凑成两类, 但页上没有这样分组, 只有第一项前面带了项目符号. 四个链接落在四个不同的地方, 没有一个指回 ChatGLM-6B 仓库自己的文件. 这一段整体是 GLM-4 的广告位, 读 ChatGLM-6B 时可以跳过, 但不能拿它的指标说法去描述 ChatGLM-6B.

## Introduction (介绍)

ChatGLM-6B is an open-source, Chinese-English bilingual conversational language model based on the [General Language Model (GLM)](https://github.com/THUDM/GLM) architecture, with 6.2 billion parameters. Combined with model quantization, users can deploy it locally on consumer-grade GPUs (as little as 6GB of GPU memory at the INT4 quantization level). ChatGLM-6B uses techniques similar to ChatGPT and is optimized for Chinese question answering and dialogue. Trained on about 1T tokens of Chinese and English text, and further aided by supervised fine-tuning, 「feedback self-help」 (反馈自助, not explained on the page), and reinforcement learning from human feedback, the 6.2-billion-parameter ChatGLM-6B can already generate answers that fit human preferences fairly well. See our [blog](https://chatglm.cn/blog) for more. Larger ChatGLM models are available at [chatglm.cn](https://chatglm.cn/).

ChatGLM-6B 是开源的中英双语对话语言模型, 基于 [General Language Model (GLM)](https://github.com/THUDM/GLM) 架构, 参数量 62 亿. 配合模型量化, 可以在消费级显卡上本地部署, INT4 量化最低只要 6GB 显存. 页上说它用了和 ChatGPT 相似的技术, 专门针对中文问答和对话做过优化. 训练数据是约 1T 中英双语标识符, 之后又做了监督微调, 「反馈自助」 和人类反馈强化学习, 按页上的说法, 这个 62 亿参数的模型已经能给出相当符合人类偏好的回答. 详情见 [博客](https://chatglm.cn/blog), 更大的 ChatGLM 模型可以在 [chatglm.cn](https://chatglm.cn/) 上体验.

> **想:** 「基于 GLM 架构」 具体是什么结构, 页上给到哪一步?
> 只给到名字. 这一段有参数量 62 亿, 训练量约 1T 标识符, 三个训练阶段的名称, 外加一个 GLM 仓库链接. 层数, 隐藏维度, 注意力头数, 词表大小都没有. 全文和结构沾边的只有第 8 页一句 「采用了相对位置编码」, 以及训练长度 2048. 「和 ChatGPT 相似的技术」 指哪些技术, 页上接着列的就是后面那三个训练阶段, 没有更细的说法. 「反馈自助」 这个词没有任何解释, 看不出是自我反馈, 自举还是别的做法. 所以写 ChatGLM-6B 的结构, 这份 README 只能支撑 「GLM 架构, 62 亿参数, 相对位置编码, 训练长度 2048」 这四项, 其余要去论文或模型实现里查.

To make it easier for downstream developers to customize the model for their own applications, we also implement an efficient parameter fine-tuning method based on [P-Tuning v2](https://github.com/THUDM/P-tuning-v2) ([guide](https://github.com/zai-org/ChatGLM-6B/blob/main/ptuning/README.md)). At the INT4 quantization level, fine-tuning can start with as little as 7GB of GPU memory.

为了让下游开发者按自己的场景定制模型, 仓库还实现了基于 [P-Tuning v2](https://github.com/THUDM/P-tuning-v2) 的高效参数微调 ([使用指南](https://github.com/zai-org/ChatGLM-6B/blob/main/ptuning/README.md)), INT4 量化下最低 7GB 显存就能启动微调.

ChatGLM-6B weights are fully open for academic research, and free commercial use is also allowed after registering via a [questionnaire](https://open.bigmodel.cn/mla/form).

ChatGLM-6B 的权重对学术研究完全开放; 填写 [问卷](https://open.bigmodel.cn/mla/form) 登记之后, 也允许免费商用.

The ChatGLM-6B open-source model aims to advance large-model technology together with the open-source community. We ask developers and everyone to abide by the [open-source license](https://github.com/zai-org/ChatGLM-6B/blob/main/MODEL_LICENSE), and not to use the open-source model, code, or derivatives of the open-source project for any purpose that may harm the country or society, or for any service that has not undergone safety assessment and filing. So far, the project team has not developed any application based on **ChatGLM-6B**, including web, Android, Apple **iOS**, or **Windows App** applications.

ChatGLM-6B 开源的目的是和社区一起推动大模型技术. 团队请开发者遵守 [开源协议](https://github.com/zai-org/ChatGLM-6B/blob/main/MODEL_LICENSE), 不要把开源模型, 代码以及基于本项目做出的衍生品用于可能危害国家和社会的用途, 也不要用于没有经过安全评估和备案的服务. 到目前为止, 项目团队没有基于 **ChatGLM-6B** 开发任何应用, 网页端, 安卓, 苹果 **iOS**, **Windows App** 都没有.

> **确认:** 许可证和权重开放是不是一回事?
> 不是一回事, 页上至少分成了三层. 第一层是文件: 根目录同时有 LICENSE 和 MODEL_LICENSE 两个文件, 抓取只有文件名和提交说明, 没有正文. 第二层是权重的使用条件: 「学术研究完全开放, 登记后允许免费商用」, 这句话写在 README 里, 说的是权重. 第三层是那个 「开源协议」 链接, 它指向 MODEL_LICENSE, 可紧跟着的句子管的是 「开源模型和代码及衍生物」. LICENSE 是哪种协议, 管不管代码, 这份抓取里一个字都没有. 按文件名推, LICENSE 管代码, MODEL_LICENSE 管模型权重, 但这只是从名字推的. 回答 「ChatGLM-6B 能不能商用」 时, 能引用的只有 「权重登记后可免费商用」 这一句, 代码按什么协议, 要打开 LICENSE 才知道.

Although we have tried our best to ensure the compliance and accuracy of data at every stage of training, due to the small size of ChatGLM-6B and the influence of probabilistic randomness, the accuracy of its output cannot be guaranteed, and the model can be easily misled (see [Limitations](https://github.com/zai-org/ChatGLM-6B/blob/main/README.md#%E5%B1%80%E9%99%90%E6%80%A7)). This project assumes no responsibility for data security or public-opinion risks caused by the open-source model and code, or for any risks and liabilities arising from the model being misled, abused, disseminated, or improperly used.

训练的各个阶段都尽量保证了数据合规和准确, 但 ChatGLM-6B 规模小, 输出又受随机性影响, 内容准确性没法保证, 模型也容易被误导 (见 [局限性](https://github.com/zai-org/ChatGLM-6B/blob/main/README.md#%E5%B1%80%E9%99%90%E6%80%A7)). 开源模型和代码带来的数据安全, 舆情风险, 以及模型被误导, 滥用, 传播, 不当利用引起的风险和责任, 本项目一概不承担.

## Updates (更新信息)

[2023/07/25] Released [CodeGeeX2](https://github.com/THUDM/CodeGeeX2), a code generation model based on ChatGLM2-6B, with comprehensively improved coding ability. More features:

[2023/07/25] 发布 [CodeGeeX2](https://github.com/THUDM/CodeGeeX2), 一个基于 ChatGLM2-6B 的代码生成模型, 代码能力全面提升. 主要特性如下:

Stronger coding ability: CodeGeeX2-6B is further pretrained on 600B of code data. Compared with the first-generation CodeGeeX, its coding ability is improved across the board. All six programming languages in the [HumanEval-X](https://huggingface.co/datasets/THUDM/humaneval-x) benchmark improve substantially (Python +57%, C++ +71%, Java +54%, JavaScript +83%, Go +56%, Rust +321%). It reaches a Pass@1 of 35.9% on Python, surpassing the larger StarCoder-15B.

代码能力更强: CodeGeeX2-6B 又用 600B 代码数据做了预训练, 和第一代 CodeGeeX 相比代码能力全面提升. 在 [HumanEval-X](https://huggingface.co/datasets/THUDM/humaneval-x) 评测集的六种语言上都有大幅提升 (Python +57%, C++ +71%, Java +54%, JavaScript +83%, Go +56%, Rust +321%), Python 的 Pass@1 一次通过率达到 35.9%, 超过了规模更大的 StarCoder-15B.

More capable model features: inheriting the features of ChatGLM2-6B, CodeGeeX2-6B better supports Chinese and English input, supports a maximum sequence length of 8192, runs much faster at inference than the first generation, and needs only 6GB of GPU memory after quantization, supporting lightweight local deployment.

模型特性更好: CodeGeeX2-6B 继承了 ChatGLM2-6B 的特性, 中英文输入支持更好, 最大序列长度 8192, 推理速度比第一代快很多, 量化后 6GB 显存就能跑, 可以轻量地本地部署.

A more complete **AI** coding assistant: the backend of the CodeGeeX plugin ([VS Code](https://marketplace.visualstudio.com/items?itemName=aminer.codegeex), [Jetbrains](https://plugins.jetbrains.com/plugin/20587-codegeex)) is upgraded, supporting over 100 programming languages and adding practical features such as context-aware completion and cross-file completion. Together with the interactive AI coding assistant Ask CodeGeeX, it supports Chinese and English dialogue to solve all kinds of programming problems, including but not limited to code explanation, code translation, code correction, and documentation generation, helping programmers develop more efficiently.

**AI** 编程助手更全: CodeGeeX 插件 ([VS Code](https://marketplace.visualstudio.com/items?itemName=aminer.codegeex), [Jetbrains](https://plugins.jetbrains.com/plugin/20587-codegeex)) 后端升级, 支持 100 多种编程语言, 新增上下文补全, 跨文件补全等功能. 配合交互式编程助手 Ask CodeGeeX, 可以用中英文对话解决各种编程问题, 包括代码解释, 代码翻译, 代码纠错, 文档生成等.

> **对一下:** 这一条里的 600B, 35.9%, 8192, 6GB, 能不能记到 ChatGLM-6B 头上?
> 不能. 主语从头到尾是 CodeGeeX2-6B, 它 「基于 ChatGLM2-6B」, 和本仓库的 ChatGLM-6B 隔了一代. 六个百分比是和第一代 CodeGeeX 比, 35.9% 是 Python 的 Pass@1, 比较对象是 StarCoder-15B, 这里面没有一个数是 ChatGLM-6B 自己的. 8192 序列长度也是 CodeGeeX2 的, ChatGLM-6B 的训练长度在第 8 页, 是 2048. 最容易混的是 「量化后仅需 6GB 显存」, 它和 ChatGLM-6B 的 INT4 最低显存正好都是 6GB, 但这里的主语是 CodeGeeX2, 数字相同只是巧合, 不能互相印证.

[2023/06/25] Released [ChatGLM2-6B](https://github.com/THUDM/ChatGLM2-6B), an upgraded version of ChatGLM-6B. While keeping many good features of the first-generation model, such as fluent dialogue and a low deployment threshold, ChatGLM2-6B introduces the following new features:

[2023/06/25] 发布 [ChatGLM2-6B](https://github.com/THUDM/ChatGLM2-6B), ChatGLM-6B 的升级版. 它保留了初代对话流畅, 部署门槛低等优点, 并加入了下面几项新特性:

1. Stronger performance: building on the development experience of the first-generation ChatGLM, we fully upgraded the base model of ChatGLM2-6B. ChatGLM2-6B uses the hybrid objective function of [GLM](https://github.com/THUDM/GLM) and has undergone pretraining on 1.4T Chinese and English tokens plus human preference alignment training. Evaluation results show that, compared with the first-generation model, ChatGLM2-6B improves substantially on datasets such as MMLU (+23%), CEval (+33%), GSM8K (+571%), and BBH (+60%), making it highly competitive among open-source models of the same size.

1. 性能更强: 借鉴初代 ChatGLM 的开发经验, ChatGLM2-6B 的基座模型全面升级. 它用了 [GLM](https://github.com/THUDM/GLM) 的混合目标函数, 做了 1.4T 中英标识符的预训练和人类偏好对齐训练. 评测结果显示, 和初代相比, ChatGLM2-6B 在 MMLU (+23%), CEval (+33%), GSM8K (+571%), BBH (+60%) 等数据集上大幅提升, 在同尺寸开源模型里很有竞争力. (源文 「评测结果」 带下划线, 原页是一个链接, 地址没有抓到.)

<!-- page 3 of 10 -->

2. Longer context: based on [FlashAttention](https://github.com/HazyResearch/flash-attention), we extended the context length of the base model from 2K in ChatGLM-6B to 32K, and trained with an 8K context length in the dialogue stage, allowing more rounds of dialogue. However, the current version of ChatGLM2-6B has limited ability to understand a single ultra-long document, which we will focus on optimizing in later iterations.

2. 上下文更长: 借助 [FlashAttention](https://github.com/HazyResearch/flash-attention), 基座模型的上下文长度 (Context Length) 从 ChatGLM-6B 的 2K 扩到 32K, 对话阶段用 8K 上下文训练, 能聊更多轮. 不过当前版本的 ChatGLM2-6B 读单篇超长文档的能力有限, 团队说后续迭代会重点优化.

3. More efficient inference: based on [Multi-Query Attention](http://arxiv.org/abs/1911.02150), ChatGLM2-6B has faster inference and lower GPU memory usage. With the official model implementation, inference speed is 42% faster than the first generation, and under INT4 quantization, the dialogue length supported by 6GB of GPU memory rises from 1K to 8K.

3. 推理更高效: 借助 [Multi-Query Attention](http://arxiv.org/abs/1911.02150), ChatGLM2-6B 推理更快, 显存占用更低. 在官方模型实现下, 推理速度比初代快 42%; INT4 量化时, 6G 显存能支持的对话长度从 1K 提到 8K.

See [ChatGLM2-6B](https://github.com/THUDM/ChatGLM2-6B) for more.

更多信息见 [ChatGLM2-6B](https://github.com/THUDM/ChatGLM2-6B).

> **再看:** ChatGLM2-6B 这一条对理解 ChatGLM-6B 有没有用?
> 有一点用, 用处在它拿来对比的 「初代」 那一侧. 这一段顺带交代了 ChatGLM-6B 的两个数: 上下文长度 2K, INT4 下 6G 显存能撑约 1K 的对话长度. 前一个和第 8 页 「训练长度 2048」 对得上. 后一个在别处没有直接对应, 第 8 页只说 4-bit 量化 「进行 2 至 3 轮对话后」 约占 6GB, 没说能撑多长. 反过来, 32K, 8K, 42%, FlashAttention, Multi-Query Attention, 1.4T, 混合目标函数都属于 ChatGLM2-6B. 尤其不能从 「ChatGLM2 用了 Multi-Query Attention」 反推 ChatGLM-6B 用的是哪种注意力, 页上没写.

[2023/06/14] Released [WebGLM](https://github.com/THUDM/WebGLM), a research work accepted at KDD 2023, which uses web information to generate long answers with accurate citations.

[2023/06/14] 发布 [WebGLM](https://github.com/THUDM/WebGLM), 一项被 KDD 2023 接收的研究, 能利用网络信息生成带准确引用的长回答.

## WebGLM Demo (WebGLM 演示)

How many calories are in a banana?

一根香蕉有多少卡路里?

A medium banana contains 105 calories, per the USDA's FoodData Central database[1].It is also a good source of fiber[5], and provides 27 grams of carbohydrates, including 3 grams of fiber and 14 grams of sugar.[3]

根据美国农业部 FoodData Central 数据库, 一根中等大小的香蕉含 105 卡路里[1]. 香蕉也是膳食纤维的好来源[5], 含 27 克碳水化合物, 其中纤维 3 克, 糖 14 克[3]. (演示原文是英文, 第一句句号后缺空格, 照原样保留.)

## References (Click to Expand) (参考资料, 点击展开)

[1] How Many Calories Are In a Banana? | Cooking School >

[1] 一根香蕉有多少卡路里? | Cooking School (来源网站名.)

A medium banana contains 105 calories, per the USDA's FoodData Central database. That's about the same amount of calories in a medium sweet potato or a cup of grapes. A small banana has 90 calories, while a large banana contains 121 calories.

根据美国农业部 FoodData Central 数据库, 一根中等香蕉含 105 卡路里, 和一个中等红薯或一杯葡萄差不多. 小香蕉 90 卡路里, 大香蕉 121 卡路里.

[2] How Many Calories Are In a Banana? | Cooking School >

[2] 同上, 标题相同, 没有展开正文.

[3] How Many Calories Are In a Banana? | Cooking School >

[3] 同上, 标题相同.

A medium banana contains 27 grams of carbohydrates, including 3 grams of fiber and 14 grams of sugar. "Bananas are a great source of fuel and are very filling," says Koszyk. "The natural carbs from bananas can satisfy a sweet-tooth craving, while offering all the healthy benefits of eating fruit-such as fiber, vitamins, minerals, antioxidants and phytochemicals."

一根中等香蕉含 27 克碳水化合物, 其中纤维 3 克, 糖 14 克. Koszyk 说: 「香蕉是很好的能量来源, 也很顶饱. 香蕉里的天然碳水能满足想吃甜的念头, 同时带来吃水果的各种好处, 比如纤维, 维生素, 矿物质, 抗氧化物和植物化学物.」

[4] How Many Calories Are In a Banana? | Cooking School

[4] 同上, 标题相同, 没有展开正文.

> **核对:** 回答里的引用编号都能在参考资料里找到吗?
> 找不到全部. 回答引了 [1], [5], [3] 三处, 参考资料只列到 [4], 没有 [5]. [5] 挂在 「香蕉也是膳食纤维的好来源」 这一句后面, 这句话在 [1] 和 [3] 的展开正文里都找不到原话, [3] 只提到 「纤维 3 克」. [2] 和 [4] 只有标题没有正文, 四条标题完全一样, 都是 Cooking School 同一篇文章. 可能原页的 [5] 在折叠区更下面没抓到, 也可能演示本身就引错了号, 这份抓取判断不了. 能确认的是: 抓到的这部分里, 「带准确引用」 这个卖点有一处对不上号.

[2023/05/17] Released [VisualGLM-6B](https://github.com/THUDM/VisualGLM-6B), a multimodal conversational language model that supports image understanding.

[2023/05/17] 发布 [VisualGLM-6B](https://github.com/THUDM/VisualGLM-6B), 一个能理解图像的多模态对话语言模型.

<!-- page 4 of 10 -->

## VisualGLM (VisualGLM 演示)

![Image block](images/p04-image.png)

(图: 俯拍的浅色木桌. 右边一本摊开的空白笔记本, 左边一把黑柄剪刀, 十来支削尖的铅笔围着笔记本摆成扇形, 桌上散着几枚回形针, 笔记本上夹着一个铜色长尾夹, 右上角有一把木尺, 笔记本下方露出一小块红色.)

Describe this image.

描述这张图片.

On the table there is an open notebook, a pencil and a pair of scissors, and a wooden table. These items seem to be quietly waiting for their owner. The notebook is an important tool for students to take notes, plan projects, or write. It is made of paper, easy to carry and durable. The pencil is a common writing tool for writing, drawing, or other content in the notebook. The scissors are used to cut paper or paper materials, such as books or articles. The wooden table is a comfortable place where people can relax and enjoy the passing of time. This scene shows a space full of creativity, allowing students to freely use their creative thinking and explore all kinds of ideas and inspiration.

桌上有一本打开的笔记本, 一支铅笔和一把剪刀, 还有一张木桌. 这些东西好像在安静地等主人回来. 笔记本是学生记笔记, 做计划, 写东西的重要工具, 纸做的, 便于携带, 也耐用. 铅笔是常用的书写工具, 可以在笔记本上写字, 画画. 剪刀用来剪纸或者书页, 文章这类纸质材料. 木桌是让人放松, 享受时光的舒服地方. 整个场景像一个充满创造力的空间, 学生可以在这里自由发挥, 探索各种想法和灵感. (这是 VisualGLM-6B 的回答原文, 中文只改了标点和个别语序.)

Where might this picture have been taken?

这张图片可能是在什么地方拍的?

Based on the background of the photo, the scene seems to have been taken in a school or a studio. Such places usually provide students with a place to study, letting them focus on learning and creating in a quiet environment.

从照片背景看, 这个场景像是在学校或工作室里拍的. 这类地方一般给学生提供学习场所, 让他们在安静的环境里专心学习和创作.

> **想:** VisualGLM 的描述和图对得上吗?
> 大体对得上, 细节有出入. 图里的铅笔是十来支, 围成扇形, 回答说 「一支铅笔」. 回形针, 长尾夹, 木尺, 那一小块红色, 回答一个都没提. 回答里的 「木桌」 被当成桌上的一件物品和笔记本, 铅笔并列, 后面还发挥了一句 「让人放松身心, 享受时间的流逝」, 图里看不出这层意思. 第二问 「学校或者工作室」 是推测, 图是俯拍的纯木纹桌面, 没有能判断场所的背景. README 放这张图是想展示 VisualGLM-6B 的图像理解, 页上没有说明它是挑过的样例还是随手一次的结果, 所以这个样例只能说明模型能认出主要物件, 数量和小物件会漏.

You can run the command-line and web demos with [cli\_demo\_vision.py](https://github.com/zai-org/ChatGLM-6B/blob/main/cli_demo_vision.py) and [web\_demo\_vision.py](https://github.com/zai-org/ChatGLM-6B/blob/main/web_demo_vision.py) in this repository. Note that VisualGLM-6B additionally requires [SwissArmyTransformer](https://github.com/THUDM/SwissArmyTransformer/) and torchvision. See [VisualGLM-6B](https://github.com/THUDM/VisualGLM-6B) for more.

本仓库里的 [cli\_demo\_vision.py](https://github.com/zai-org/ChatGLM-6B/blob/main/cli_demo_vision.py) 和 [web\_demo\_vision.py](https://github.com/zai-org/ChatGLM-6B/blob/main/web_demo_vision.py) 分别是命令行和网页版 demo. VisualGLM-6B 还要额外装 [SwissArmyTransformer](https://github.com/THUDM/SwissArmyTransformer/) 和 torchvision. 更多信息见 [VisualGLM-6B](https://github.com/THUDM/VisualGLM-6B).

[2023/05/15] Updated the v1.1 checkpoint. English instruction fine-tuning data were added to the training data to balance the ratio of Chinese and English data, fixing the issue of Chinese words mixed into English answers.

[2023/05/15] 更新 v1.1 版 checkpoint. 训练数据里加了英文指令微调数据, 用来平衡中英文比例, 解决英文回答里夹杂中文词的问题.

The following is a comparison of English questions before and after the update:

下面是更新前后英文问题的对比:

> **停一下:** 冒号后面的对比在哪里?
> 这份抓取里没有. 冒号下一行直接跳到 「更多更新信息参见 UPDATE.md」. 原页这里多半是一组截图或折叠表格, MinerU 没抓到, 图片目录里也没有对应的文件. 这意味着 「v1.1 解决了英文回答夹中文」 在本文件里只有一句声明, 没有样例可对. 第 9 页局限性里又写着 「英文能力不足, 出现中英夹杂」, 两处放在一起读, 分不清局限性那段写于 v1.1 之前还是之后.

See [UPDATE.md](https://github.com/zai-org/ChatGLM-6B/blob/main/UPDATE.md) for more updates.

更多更新记录见 [UPDATE.md](https://github.com/zai-org/ChatGLM-6B/blob/main/UPDATE.md).

## Related projects (友情链接)

Open-source projects that accelerate ChatGLM:

给 ChatGLM 做加速的开源项目:

[lyraChatGLM](https://huggingface.co/TMElyralab/lyraChatGLM): inference acceleration for ChatGLM-6B, reaching up to 9000+ tokens/s.

[lyraChatGLM](https://huggingface.co/TMElyralab/lyraChatGLM): 给 ChatGLM-6B 做推理加速, 最高能到 9000+ tokens/s.

[ChatGLM-MNN](https://github.com/wangzhaode/ChatGLM-MNN): a C++ inference implementation of ChatGLM-6B based on MNN, which automatically splits computation between GPU and CPU according to available GPU memory.

[ChatGLM-MNN](https://github.com/wangzhaode/ChatGLM-MNN): 基于 MNN 的 ChatGLM-6B C++ 推理实现, 能按显存大小自动把计算分给 GPU 和 CPU.

[JittorLLMs](https://github.com/Jittor/JittorLLMs): runs ChatGLM-6B FP16 with as little as 3GB of GPU memory, or even without a GPU; supports deployment on Linux, Windows, and Mac.

[JittorLLMs](https://github.com/Jittor/JittorLLMs): 最低 3G 显存, 甚至没有显卡也能跑 ChatGLM-6B FP16, 支持 Linux, Windows, Mac 部署.

[InferLLM](https://github.com/MegEngine/InferLLM): lightweight C++ inference enabling real-time chat on local x86 and Arm processors, and also on mobile phones, with only 4GB of RAM.

[InferLLM](https://github.com/MegEngine/InferLLM): 轻量级 C++ 推理, 能在本地 x86, Arm 处理器上实时聊天, 手机上也能实时跑, 运行内存只要 4G.

Open-source projects built on or using ChatGLM-6B:

基于或用到 ChatGLM-6B 的开源项目:

[langchain-ChatGLM](https://github.com/imClumsyPanda/langchain-ChatGLM): a langchain-based ChatGLM application for question answering over an extensible knowledge base.

[langchain-ChatGLM](https://github.com/imClumsyPanda/langchain-ChatGLM): 基于 langchain 的 ChatGLM 应用, 做可扩展知识库上的问答.

[Wenda](https://github.com/l15y/wenda): a large language model calling platform that implements ChatPDF-like features based on ChatGLM-6B.

[闻达](https://github.com/l15y/wenda): 大语言模型调用平台, 基于 ChatGLM-6B 做了类似 ChatPDF 的功能.

[glm-bot](https://github.com/initialencounter/glm-bot): connects ChatGLM to Koishi so it can be called on major chat platforms.

[glm-bot](https://github.com/initialencounter/glm-bot): 把 ChatGLM 接进 Koishi, 在各大聊天平台上都能调用.

[Chuanhu Chat](https://github.com/GaiZhenbiao/ChuanhuChatGPT): a good-looking, easy-to-use, feature-rich, quickly deployable UI for various LLMs and online model APIs, with ChatGLM-6B support.

[川虎 Chat](https://github.com/GaiZhenbiao/ChuanhuChatGPT): 给各种大语言模型和在线模型 API 做的界面, 好看好用, 功能多, 部署快, 支持 ChatGLM-6B.

Example projects supporting online training of ChatGLM-6B and related applications:

支持在线训练 ChatGLM-6B 及相关应用的示例项目:

[ChatGLM-6B deployment and fine-tuning tutorial](https://www.heywhale.com/mw/project/6436d82948f7da1fee2be59e)

[ChatGLM-6B 的部署与微调教程](https://www.heywhale.com/mw/project/6436d82948f7da1fee2be59e)

<!-- page 5 of 10 -->

```txt
2. Create a comfortable sleep environment: make sure it is comfortable, quiet, dark, and at a suitable temperature. You can use comfortable bedding and keep the room ventilated.
```

```txt
2. 营造舒适的睡眠环境: 保证安静, 黑暗, 温度合适. 床上用品选舒服的, 房间保持通风.
```

(源文这一句写成 「可以使用舒适在床上用品」, 「在」 是 「的」 的错字.)

```txt
5. Avoid doing things unrelated to sleep in bed: doing unrelated things in bed, such as watching movies, playing games, or working, may interfere with your sleep.
```

```txt
5. 别在床上做和睡觉无关的事: 在床上看电影, 玩游戏, 工作, 都可能影响睡眠.
```

```txt
- ChatGLM-6B with langchain for a local knowledge-base QA bot
```

```txt
- ChatGLM-6B 结合 langchain 实现本地知识库问答机器人
```

> **回看:** 这几段 「2. 营造舒适的睡眠环境」, 「5. 别在床上做...」 为什么出现在友情链接和第三方评测之间?
> 它们是第 5 页 「晚上睡不着应该怎么办」 那段模型回答的碎片, 被抓取挪了位置. 回答的开头和第 3 条, 结尾一句在后面的代码块下面, 第 2 条和第 5 条却跑到了代码块前面, 第 1 条和第 4 条整份抓取里都找不到. 原页这段回答多半是一个很长的代码块, MinerU 按版面切成了几块, 顺序也乱了. 紧跟着的 「ChatGLM-6B 结合 langchain 实现本地知识库 QA Bot」 也是一条孤立的列表项, 看位置像部署与微调教程下的子条目, 同一张列表的其他条目没有抓到. 所以模型对这个问题的完整回答没法从抓取还原, 只能看到五条里的三条.

## Third-party evaluations (第三方评测)

```txt
• Measuring Massive Multitask Chinese Understanding
```

```txt
• Measuring Massive Multitask Chinese Understanding (一篇衡量大规模多任务中文理解的评测, 页上只有这个标题, 没有链接和分数.)
```

See [PROJECT.md](https://github.com/zai-org/ChatGLM-6B/blob/main/PROJECT.md) for more open-source projects.

更多开源项目见 [PROJECT.md](https://github.com/zai-org/ChatGLM-6B/blob/main/PROJECT.md).

## Usage: hardware requirements (使用方式: 硬件需求)

(源文 「使用方式」 和 「硬件需求」 是两个相连的空标题, 这里合成一行.)

| Quantization level | Min GPU memory (inference) | Min GPU memory (efficient parameter fine-tuning) |
| --- | --- | --- |
| FP16 (no quantization) | 13 GB | 14 GB |
| INT8 | 8 GB | 9 GB |
| INT4 | 6 GB | 7 GB |

| 量化等级 | 最低 GPU 显存 (推理) | 最低 GPU 显存 (高效参数微调) |
| --- | --- | --- |
| FP16 (不量化) | 13 GB | 14 GB |
| INT8 | 8 GB | 9 GB |
| INT4 | 6 GB | 7 GB |

> **看表:** 这张表和全文其他地方的显存, 内存数字对得上吗?
> 按页面原文把所有数字排在一起:

| 出处 | 条件 | 数字 |
| --- | --- | --- |
| 第 2 页介绍 | INT4 推理最低显存 | 6GB |
| 第 2 页介绍 | INT4 启动微调最低显存 | 7GB |
| 第 5 页本表 | FP16 / INT8 / INT4 推理 | 13 / 8 / 6 GB |
| 第 5 页本表 | FP16 / INT8 / INT4 高效参数微调 | 14 / 9 / 7 GB |
| 第 8 页量化 | FP16 默认加载 | 约 13GB 显存 |
| 第 8 页量化 | 2 至 3 轮对话后, 8-bit / 4-bit | 约 10GB / 6GB 显存 |
| 第 8 页量化 | 量化过程先载入 FP16 | 约 13GB 内存 |
| 第 8 页量化 | 直接加载 INT4 模型 | 约 5.2GB 内存 |
| 第 8 页 CPU | FP32 (.float()) 推理 | 约 32GB 内存 |
| 第 8 页 Mac | 半精度加载 | 约 13GB 内存 |

> 介绍和表格一致. 容易看错的是 INT8: 表里最低 8GB, 第 8 页却说 8-bit 聊两三轮后约 10GB, 差出来的 2GB 是对话历史占的, 两个数的条件不同, 一个是起步门槛, 一个是用了一会儿之后. 4-bit 在两处都是 6GB, 说明表里的 「最低」 已经算上了几轮对话, 或者 4-bit 的增长没被写出来, 页上没区分. 另外要分清 「显存」 和 「内存」: 5.2GB, 13GB (量化过程), 32GB 都是内存, 不能拿来和表里的显存比.

## Environment setup (环境安装)

Install the dependencies with pip: `pip install -r requirements.txt`. The recommended version of the transformers library is 4.27.1, but in theory any version no lower than 4.23.1 works.

用 pip 安装依赖: `pip install -r requirements.txt`. transformers 推荐 4.27.1, 理论上不低于 4.23.1 就行.

In addition, to run the quantized model on CPU, you also need gcc and openmp. Most Linux distributions have them installed by default. On Windows, check openmp when installing [TDM-GCC](https://jmeubank.github.io/tdm-gcc/). The Windows test environment uses TDM-GCC 10.3.0, and Linux uses gcc 11.3.0. On MacOS, see [Q1](https://github.com/zai-org/ChatGLM-6B/blob/main/FAQ.md#q1).

如果要在 CPU 上跑量化模型, 还要装 gcc 和 openmp. 大多数 Linux 发行版默认就有. Windows 上装 [TDM-GCC](https://jmeubank.github.io/tdm-gcc/) 时勾上 openmp 即可. 团队的 Windows 环境用的是 TDM-GCC 10.3.0, Linux 是 gcc 11.3.0. MacOS 见 FAQ 的 [Q1](https://github.com/zai-org/ChatGLM-6B/blob/main/FAQ.md#q1).

## Calling the model in code (代码调用)

You can call the ChatGLM-6B model to generate dialogue with the following code:

用下面的代码调用 ChatGLM-6B 生成对话 (代码块里模型回复的中文标点统一换成了半角):

```python
>>> from transformers import AutoTokenizer, AutoModel
>>> tokenizer = AutoTokenizer.from_pretrained("THUDM/chatglm-6b", trust_remote_code=True)
>>> model = AutoModel.from_pretrained("THUDM/chatglm-6b", trust_remote_code=True).half().cuda()
>>> model = model.eval()
>>> response, history = model.chat(tokenizer, 「你好」, history=[])
>>> print(response)
你好👍!我是人工智能助手 ChatGLM-6B,很高兴见到你,欢迎问我任何问题.
>>> response, history = model.chat(tokenizer, 「晚上睡不着应该怎么办」, history=history)
>>> print(response)
晚上睡不着可能会让你感到焦虑或不舒服,但以下是一些可以帮助你入睡的方法:
```

```txt
3. Relax your body and mind: do something relaxing before bed, such as taking a hot bath, listening to soft music, or reading an interesting book. This helps relieve tension and anxiety and makes it easier to fall asleep.
```

```txt
3. 放松身心: 睡前做点放松的事, 比如泡个热水澡, 听点轻音乐, 读本有意思的书, 能缓解紧张和焦虑, 更容易睡着.
```

```txt
If these methods do not help you fall asleep, you may consider consulting a doctor or sleep specialist for further advice.
```

```txt
如果这些办法都不管用, 可以考虑去看医生或者找睡眠专家, 听听进一步的建议.
```

The model implementation is still changing. If you want to pin the model implementation for compatibility, add the `revision="v1.1.0"` argument to the `from_pretrained` call. v1.1.0 is the latest version number; see the [Change Log](https://huggingface.co/THUDM/chatglm-6b#change-log) for the full list of versions.

模型实现还在变动. 想固定实现以保证兼容, 可以在 `from_pretrained` 调用里加 `revision="v1.1.0"`. v1.1.0 是当时最新的版本号, 完整版本列表见 Hugging Face 上的 [Change Log](https://huggingface.co/THUDM/chatglm-6b#change-log).

## Loading the model locally (从本地加载模型)

The code above downloads the model implementation and parameters automatically via transformers. The full model implementation is available on the [Hugging Face Hub](https://huggingface.co/THUDM/chatglm-6b). If your network is poor, downloading the model parameters may take a long time or even fail. In that case, download the model locally first and load it from there.

上面的代码会由 transformers 自动下载模型实现和参数, 完整的模型实现在 [Hugging Face Hub](https://huggingface.co/THUDM/chatglm-6b) 上. 网络差的话, 下载参数可能很慢甚至失败, 这时可以先把模型下载到本地, 再从本地加载.

To download from the Hugging Face Hub, first [install Git LFS](https://docs.github.com/zh/repositories/working-with-files/managing-large-files/installing-git-large-file-storage), then run

从 Hugging Face Hub 下载要先 [安装 Git LFS](https://docs.github.com/zh/repositories/working-with-files/managing-large-files/installing-git-large-file-storage), 然后运行

```txt
git clone https://huggingface.co/THUDM/chatglm-6b
```

If downloading the checkpoint from the Hugging Face Hub is slow, you can download only the model implementation

如果从 Hugging Face Hub 下 checkpoint 很慢, 可以只下载模型实现

<!-- page 6 of 10 -->

```txt
GIT_LFS_SKIP_SMUDGE=1 git clone https://huggingface.co/THUDM/chatglm-6b
```

Then manually download the model parameter files from [here](https://cloud.tsinghua.edu.cn/d/fb9f16d6dc8f482596c2/), and replace the files in your local chatglm-6b directory with them.

然后从 [这里](https://cloud.tsinghua.edu.cn/d/fb9f16d6dc8f482596c2/) (清华云盘) 手动下载参数文件, 替换到本地的 chatglm-6b 目录里.

After downloading the model locally, replace `THUDM/chatglm-6b` in the code above with the path to your local chatglm-6b folder to load the model locally.

模型下到本地以后, 把上面代码里的 `THUDM/chatglm-6b` 换成本地 chatglm-6b 文件夹的路径, 就能从本地加载.

**Optional** The model implementation is still changing. If you want to pin the model implementation for compatibility, you can run

**可选** 模型实现还在变动. 想固定实现以保证兼容, 可以执行

```txt
git checkout v1.1.0
```

(源文这里和下面 git clone 之后各有一个孤零零的 「凸」 字, 是代码块右上角复制按钮被识别成了汉字, 这里去掉.)

## Demo & API (Demo 与 API)

We provide a [Gradio](https://gradio.app/)-based web demo and a command-line demo. To use them, first download this repository:

仓库提供一个基于 [Gradio](https://gradio.app/) 的网页版 demo 和一个命令行 demo. 使用前先把本仓库下载下来:

```txt
git clone https://github.com/THUDM/ChatGLM-6B
cd ChatGLM-6B
```

> **再看:** 源文这一行写成 「git clone https://github.com/THUDM/ChatGLM-6Bcd ChatGLM-6B」, 能照抄吗?
> 不能. 原页是两行命令, clone 和 cd 之间的换行在抓取时丢了, 照抄会去 clone 一个叫 ChatGLM-6Bcd 的仓库. 还有一处地址不一致: 这里的 clone 地址是 THUDM/ChatGLM-6B, 页上其余仓库内链接几乎都写 zai-org/ChatGLM-6B, 只有这一行和第 7 页 Streamlit 那条 PR #117 的链接用 THUDM. 两个组织名指向的是不是同一个仓库 (比如改过名, GitHub 自动跳转), 页上没交代. 同理, 上面两处 `v1.1.0` 一个是 Hugging Face 的 revision 参数, 一个是在 Hugging Face 克隆下来的模型目录里 git checkout, 两者都是模型仓库的标签, 和这个 GitHub 代码仓库的版本无关.

## Web demo (网页版 Demo)

ChatGLM

ChatGLM (网页 demo 顶部的页面标题, 源文把它抓成了一个二级标题.)

![Image block](images/p06-gradio-pip-install-gradio-web-demo-py-https-github-com.png)

(图: Gradio 网页 demo 的界面截图. 顶部是标着 「Chatbot」 的空对话框; 左边是写着 「Input...」 的大输入框, 下面一个橙色 「Submit」 按钮; 右边是 「Clear History」 按钮和三个滑块: Maximum length 2048, Top P 0.7, Temperature 0.95.)

> **对一下:** 这张图的文件名 「gradio-pip-install-gradio-web-demo-py-https-github-com」 和画面对得上吗?
> 碰巧对得上一半. 文件名取自图片下方那句 「首先安装 Gradio: pip install gradio, 然后运行仓库中的 web_demo.py」, 画面恰好是 Gradio 网页 demo, 主题一致. 但文件名里的 pip install, https-github-com 都是那句话里的命令和链接, 图里没有. 反过来, 图里最有用的信息, 三个滑块的默认值 (最大长度 2048, Top P 0.7, Temperature 0.95), 正文一个字都没写, 只存在截图里. 其中 2048 和第 8 页 「训练长度 2048」 是同一个数.

First install Gradio: `pip install gradio`, then run [web\_demo.py](https://github.com/zai-org/ChatGLM-6B/blob/main/web_demo.py) in the repository:

先装 Gradio: `pip install gradio`, 再运行仓库里的 [web\_demo.py](https://github.com/zai-org/ChatGLM-6B/blob/main/web_demo.py):

```txt
python web_demo.py
```

<!-- page 7 of 10 -->

```json
{
    「response」:「你好👍!我是人工智能助手 ChatGLM-6B,很高兴见到你,欢迎问我任何问题.」,
```

(这个 JSON 片段是后面 API 部署的返回值开头, 被抓取提前放到了这里, 后半截在第 8 页. 中文标点已换成半角.)

The program starts a web server and prints its address. Open that address in a browser to use it. The latest demo implements a typewriter effect, which greatly improves the perceived speed. Note that because network access to Gradio from mainland China is slow, enabling `demo.queue().launch(share=True, inbrowser=True)` routes all traffic through Gradio's servers and greatly degrades the typewriter experience. The default launch mode has therefore been changed to `share=False`. If you need public network access, you can change it back to `share=True`.

程序会起一个 Web Server 并打印地址, 在浏览器里打开这个地址就能用. 最新版 demo 做了打字机效果, 体感快了很多. 要注意, 国内访问 Gradio 比较慢, 如果启用 `demo.queue().launch(share=True, inbrowser=True)`, 所有流量都会经 Gradio 的服务器转发, 打字机效果会大打折扣, 所以默认启动方式已经改成 `share=False`. 需要公网访问的话, 可以改回 `share=True`.

Thanks to [@AdamBear](https://github.com/AdamBear) for implementing a Streamlit-based web demo; see [#117](https://github.com/THUDM/ChatGLM-6B/pull/117) for how to run it.

感谢 [@AdamBear](https://github.com/AdamBear) 做了基于 Streamlit 的网页版 demo, 运行方法见 [#117](https://github.com/THUDM/ChatGLM-6B/pull/117).

**Command-line Demo**

**命令行 Demo**

Run [cli\_demo.py](https://github.com/zai-org/ChatGLM-6B/blob/main/cli_demo.py) in the repository:

运行仓库里的 [cli\_demo.py](https://github.com/zai-org/ChatGLM-6B/blob/main/cli_demo.py):

```txt
python cli_demo.py
```

The program runs an interactive dialogue in the command line. Type an instruction and press Enter to generate a reply; type `clear` to clear the dialogue history and `stop` to terminate the program.

程序会在命令行里进行交互式对话: 输入指令回车就生成回复, 输入 `clear` 清空对话历史, 输入 `stop` 退出程序.

**API deployment**

**API 部署**

First install the extra dependencies with `pip install fastapi uvicorn`, then run [api.py](https://github.com/zai-org/ChatGLM-6B/blob/main/api.py) in the repository:

先装额外依赖 `pip install fastapi uvicorn`, 再运行仓库里的 [api.py](https://github.com/zai-org/ChatGLM-6B/blob/main/api.py):

```txt
python api.py
```

![Image block](images/p07-8000-post.png)

(图: 灰色线条的复制按钮图标, 两个叠放的方框, 没有文字.)

By default it is deployed on local port 8000 and called via the POST method:

默认部署在本机 8000 端口, 用 POST 方法调用:

```shell
curl -X POST "http://127.0.0.1:8000" \
-H 'Content-Type: application/json' \
-d '{「prompt」: 「你好」, 「history」: []}'
```

The return value is

得到的返回值是

<!-- page 8 of 10 -->

![Image block](images/p08-json.png)

(图: 同样是灰色的复制按钮图标, 没有文字.)

> **回看:** 从第 7 页到第 9 页一共 8 张小图, 文件名分别带着 「8000-post」, 「json」, 「2-3-8-bit-gpu-10gb」, 「https-cloud-tsinghua」, 「image」, 「could-not-find-module-nvcuda-dll」, 「chatglm-6b-13gb-16gb-macbook-pro」, 「cpu-openmp」, 它们画的是这些内容吗?
> 都不是. 8 张图画面相同, 都是一个很小的灰色复制按钮, 两个叠放的方框, 文件只有五百字节左右. 原页每个代码块右上角都有一个复制按钮, MinerU 把按钮当成图片存下来, 再拿按钮附近的一行正文起名, 所以 「10gb」, 「macbook-pro」, 「nvcuda-dll」 这些词说的是旁边的段落, 和画面无关. 加上第 1 页的对话气泡图标, 12 张图里有 9 张是界面图标, 真正有内容的只有第 4 页的 VisualGLM 样例图, 第 6 页的 Gradio 截图和第 10 页的贡献者头像. 按文件名检索这些图会被误导.

```json
「history」:[[「你好」,「你好 👍! 我是人工智能助手 ChatGLM-6B, 很高兴见到你, 欢迎问我任何问题.」]],
    "status":200,
    "time":"2023-03-23 21:38:40"
}
```

(返回值的后半截: history 字段带着这一轮问答, status 是 200, time 是 2023-03-23 21:38:40. 和第 7 页的前半截拼起来才是完整的 JSON.)

## Low-cost deployment: model quantization (低成本部署: 模型量化)

(源文 「低成本部署」 和 「模型量化」 是两个相连的标题, 这里合成一行.)

By default, the model is loaded in FP16 precision, and running the code above requires about 13GB of GPU memory. If your GPU memory is limited, you can try loading the model with quantization, as follows:

默认情况下模型以 FP16 精度加载, 跑上面的代码要大约 13GB 显存. 显存不够的话, 可以用量化方式加载:

```python
# 按需修改, 目前只支持 4/8 bit 量化
model = AutoModel.from_pretrained("THUDM/chatglm-6b", trust_remote_code=True).quantize(8).half().cuda()
```

![Image block](images/p08-2-3-8-bit-gpu-10gb-4-bit-6gb-chatglm-6b-context-length.png)

(图: 灰色复制按钮图标, 没有文字.)

After 2 to 3 rounds of dialogue, GPU memory usage is about 10GB under 8-bit quantization and only 6GB under 4-bit quantization. As the number of rounds grows, memory consumption grows accordingly. Because relative position encoding is used, ChatGLM-6B in theory supports an unlimited context length, but performance gradually degrades once the total length exceeds 2048 (the training length).

聊 2 到 3 轮之后, 8-bit 量化的显存占用约 10GB, 4-bit 只要 6GB. 轮数越多显存占得越多. 因为用的是相对位置编码, ChatGLM-6B 理论上支持无限长的 context-length, 但总长度超过训练长度 2048 以后, 效果会逐渐变差.

Model quantization brings some performance loss. In our tests, ChatGLM-6B can still generate naturally and fluently under 4-bit quantization. Quantization schemes such as [GPT-Q](https://arxiv.org/abs/2210.17323) can further compress the quantization precision or improve model performance at the same precision. Pull requests are welcome.

量化会损失一些效果. 按团队的测试, ChatGLM-6B 在 4-bit 下仍能自然流畅地生成. 用 [GPT-Q](https://arxiv.org/abs/2210.17323) 这类方案还能进一步压低量化位数, 或者在同样位数下提升效果, 欢迎提 Pull Request.

The quantization process first loads the FP16 model into memory, consuming about 13GB of RAM. If you do not have enough RAM, you can load the already-quantized model directly. The INT4-quantized model needs only about 5.2GB of RAM:

量化时要先把 FP16 模型读进内存, 大约占 13GB 内存. 内存不够的话, 可以直接加载已经量化好的模型, INT4 模型只要大约 5.2GB 内存:

```python
# INT8 量化的模型将「THUDM/chatglm-6b-int4」改为「THUDM/chatglm-6b-int8」
model = AutoModel.from_pretrained("THUDM/chatglm-6b-int4", trust_remote_code=True).half().cuda()
```

![Image block](images/p08-https-cloud-tsinghua-edu-cn-d-674208019e314311ab5c.png)

(图: 灰色复制按钮图标, 没有文字.)

The parameter files of the quantized models can also be downloaded manually from [here](https://cloud.tsinghua.edu.cn/d/674208019e314311ab5c/).

量化模型的参数文件也可以从 [这里](https://cloud.tsinghua.edu.cn/d/674208019e314311ab5c/) (清华云盘) 手动下载.

> **核对:** 页上的 「显存」 和 「内存」 有没有混用?
> 这一节分得还算清楚, 但数字很密, 容易串. 「13GB」 出现了三次, 意思各不相同: FP16 推理的显存, 量化过程载入 FP16 时的内存, 以及 Mac 上半精度加载的内存. 「5.2GB」 是直接加载 INT4 模型的内存, 不是显存; 表里 INT4 推理最低显存是 6GB, 两者差 0.8GB, 页上没解释这个差, 可能是推理时的激活和对话历史. CPU 部署那里的 「32GB」 也是内存, 对应 `.float()`, 也就是 FP32, 正好是 FP16 的 13GB 翻一倍再多一点. 另外 「目前只支持 4/8 bit 量化」 和 INT4, INT8 两个预量化模型名对得上, 2-bit, 3-bit 都没有, 文件名里的 「2-3」 指的是 「2 至 3 轮对话」, 不是位数.

## CPU deployment (CPU 部署)

If you have no GPU hardware, you can also run inference on CPU, but it will be slower. Usage is as follows (requires about 32GB of RAM):

没有 GPU 也可以在 CPU 上推理, 只是更慢. 用法如下 (需要大约 32GB 内存):

```python
model = AutoModel.from_pretrained("THUDM/chatglm-6b", trust_remote_code=True).float()
```

![Image block](images/p08-image.png)

(图: 灰色复制按钮图标, 没有文字.)

If you do not have enough RAM, you can load the quantized model directly:

内存不够的话, 可以直接加载量化好的模型:

```python
# INT8 量化的模型将「THUDM/chatglm-6b-int4」改为「THUDM/chatglm-6b-int8」
model = AutoModel.from_pretrained("THUDM/chatglm-6b-int4",trust_remote_code=True).float()
```

(源文把这两段 Python 标成了 hcl, 是 MinerU 的语言识别错误, 这里改为 python.)

![Image block](images/p08-could-not-find-module-nvcuda-dll-runtimeerror-unknown.png)

(图: 灰色复制按钮图标, 没有文字.)

If you encounter the error `Could not find module 'nvcuda.dll'` or `RuntimeError: Unknown platform: darwin` (MacOS), please [load the model locally](https://github.com/zai-org/ChatGLM-6B/blob/main/README.md#%E4%BB%8E%E6%9C%AC%E5%9C%B0%E5%8A%A0%E8%BD%BD%E6%A8%A1%E5%9E%8B).

如果报 `Could not find module 'nvcuda.dll'` 或 `RuntimeError: Unknown platform: darwin` (MacOS), 请改成 [从本地加载模型](https://github.com/zai-org/ChatGLM-6B/blob/main/README.md#%E4%BB%8E%E6%9C%AC%E5%9C%B0%E5%8A%A0%E8%BD%BD%E6%A8%A1%E5%9E%8B).

## Mac deployment (Mac 部署)

For Macs with Apple Silicon or AMD GPUs, you can use the MPS backend to run ChatGLM-6B on the GPU. Install PyTorch-Nightly following Apple's [official instructions](https://developer.apple.com/metal/pytorch) (the correct version number should be 2.1.0.dev2023xxxx, not 2.0.0).

搭载 Apple Silicon 或 AMD GPU 的 Mac, 可以用 MPS 后端在 GPU 上跑 ChatGLM-6B. 要按 Apple 的 [官方说明](https://developer.apple.com/metal/pytorch) 装 PyTorch-Nightly, 版本号应该是 2.1.0.dev2023xxxx, 不是 2.0.0.

Currently, MacOS only supports [loading the model locally](https://github.com/zai-org/ChatGLM-6B/blob/main/README.md#%E4%BB%8E%E6%9C%AC%E5%9C%B0%E5%8A%A0%E8%BD%BD%E6%A8%A1%E5%9E%8B). Change the model loading in the code to load locally and use the mps backend:

目前 MacOS 上只支持 [从本地加载模型](https://github.com/zai-org/ChatGLM-6B/blob/main/README.md#%E4%BB%8E%E6%9C%AC%E5%9C%B0%E5%8A%A0%E8%BD%BD%E6%A8%A1%E5%9E%8B). 把代码里的加载改成本地路径, 并使用 mps 后端:

```python
model = AutoModel.from_pretrained("your local path", trust_remote_code=True).half().to('mps')
```

![Image block](images/p08-chatglm-6b-13gb-16gb-macbook-pro-chatglm-6b-int4-gpu.png)

(图: 灰色复制按钮图标, 没有文字.)

Loading the half-precision ChatGLM-6B model requires about 13GB of RAM. On machines with less memory (such as a MacBook Pro with 16GB of RAM), when free memory is insufficient, virtual memory on disk will be used, making inference extremely slow. In that case you can use a quantized model such as chatglm-6b-int4. Because the quantized GPU kernels are written in CUDA, they cannot be used on MacOS, and inference can only run on the CPU.

加载半精度的 ChatGLM-6B 大约要 13GB 内存. 内存小的机器 (比如 16GB 内存的 MacBook Pro), 空闲内存不够时会用上硬盘上的虚拟内存, 推理会慢得厉害. 这时可以换成 chatglm-6b-int4 这类量化模型. 不过 GPU 上的量化 kernel 是用 CUDA 写的, MacOS 上用不了, 量化模型只能用 CPU 推理.

```python
# INT8 量化的模型将「THUDM/chatglm-6b-int4」改为「THUDM/chatglm-6b-int8」
model = AutoModel.from_pretrained("THUDM/chatglm-6b-int4",trust_remote_code=True).float()
```

<!-- page 9 of 10 -->

![Image block](images/p09-cpu-openmp-https-github-com-zai-org-chatglm-6b-blob.png)

(图: 灰色复制按钮图标, 没有文字.)

To make full use of CPU parallelism, you also need to [install OpenMP separately](https://github.com/zai-org/ChatGLM-6B/blob/main/FAQ.md#q1).

想把 CPU 并行用足, 还要 [单独安装 OpenMP](https://github.com/zai-org/ChatGLM-6B/blob/main/FAQ.md#q1).

## Multi-GPU deployment (多卡部署)

If you have multiple GPUs but none of them has enough memory to hold the full model, you can split the model across several GPUs. First install accelerate with `pip install accelerate`, then load the model as follows:

如果有好几张 GPU, 但每张的显存都装不下整个模型, 可以把模型切到多张卡上. 先装 accelerate: `pip install accelerate`, 再这样加载:

```python
from utils import load_model_on_gpus
model = load_model_on_gpus("THUDM/chatglm-6b", num_gpus=2)
```

This deploys the model on two GPUs for inference. You can change `num_gpus` to the number of GPUs you want to use. The split is even by default; you can also pass a `device_map` argument to specify it yourself.

这样模型就部署在两张 GPU 上推理. `num_gpus` 可以改成想用的卡数. 默认均匀切分, 也可以传 `device_map` 参数自己指定. (源文这一句是 「传入 device_map数来自 己指定」, 漏了 「参」 字, 还多了一个空格.)

## Efficient parameter fine-tuning (高效参数微调)

Efficient parameter fine-tuning based on [P-tuning v2](https://github.com/THUDM/P-tuning-v2). See [ptuning/README.md](https://github.com/zai-org/ChatGLM-6B/blob/main/ptuning/README.md) for details.

基于 [P-tuning v2](https://github.com/THUDM/P-tuning-v2) 的高效参数微调, 用法见 [ptuning/README.md](https://github.com/zai-org/ChatGLM-6B/blob/main/ptuning/README.md).

## ChatGLM-6B examples (ChatGLM-6B 示例)

Below are some example screenshots obtained with web\_demo.py. More possibilities of ChatGLM-6B are waiting for you to explore!

下面是用 web\_demo.py 得到的一些示例截图. ChatGLM-6B 还能做什么, 等你自己去试.

Self-cognition

自我认知

Outline writing

提纲写作

Copywriting

文案写作

Email writing assistant

邮件写作助手

Information extraction

信息抽取

Role play

角色扮演

Comment comparison

评论比较

Travel guide

旅游向导

(八个小标题下原本各有一张截图, 这份抓取里一张都没有, 只剩标题.)

## Limitations (局限性)

Due to its small scale, ChatGLM-6B still has many limitations. Here are some of the problems we have found so far:

ChatGLM-6B 规模小, 能力上还有不少局限. 下面是团队目前发现的几类问题:

Small model capacity: the small 6B capacity determines its relatively weak model memory and language ability. On many factual knowledge tasks, ChatGLM-6B may generate incorrect information; it is also not good at logical problems (such as math and programming).

模型容量小: 6B 的容量决定了它的记忆和语言能力相对弱. 碰到很多事实性知识任务时, ChatGLM-6B 可能给出错误信息; 数学, 编程这类逻辑题它也不擅长.

Click to see examples

点击查看例子 (折叠区, 内容没有抓到.)

Generating harmful instructions or biased content: ChatGLM-6B is only a language model preliminarily aligned with human intent, and may generate harmful or biased content. (The content may be offensive and is not shown here.)

可能产生有害说明或带偏见的内容: ChatGLM-6B 只是初步对齐了人类意图的语言模型, 可能生成有害, 有偏见的内容. (内容可能冒犯人, 原页没有展示.)

Insufficient English ability: most of the instructions and answers used in training ChatGLM-6B are in Chinese, with only a very small portion in English. Therefore, with English instructions, reply quality is far below that of Chinese, may even contradict the content under Chinese instructions, and Chinese and English may be mixed.

英文能力不足: ChatGLM-6B 训练用的指令和回答大部分是中文, 英文只占极小一部分. 所以用英文提问时, 回复质量远不如中文, 甚至会和中文提问时的回答相互矛盾, 还会中英夹杂.

Easily misled, weak dialogue ability: ChatGLM-6B's dialogue ability is still weak, its "self-cognition" has problems, and it is easily misled into making false statements. For example, when misled, the current version of the model shows deviations in self-cognition.

容易被误导, 对话能力弱: ChatGLM-6B 的对话能力还比较弱, 「自我认知」 有问题, 很容易被带偏说出错误的话. 比如当前版本的模型被误导时, 对自己身份的认知会跑偏.

Click to see examples

点击查看例子 (折叠区, 内容没有抓到.)

> **拆开:** 「英文能力不足」 和第 4 页 v1.1 的更新说明是什么关系?
> 两处说的是同一个问题的两个时间点. 第 4 页写 2023/05/15 的 v1.1 checkpoint 加了英文指令微调数据, 「解决英文回答中夹杂中文词语的现象」. 这里的局限性却仍写着 「英文只占极小一部分」, 「出现中英夹杂」, 还有 「当前版本的模型」 这种说法. 局限性这一段没有日期, 第 1 页文件列表里 limitations 目录的最后提交是三年前, README.md 是两年前改的, 从提交时间也判断不出这段话写于 v1.1 之前还是之后. 稳妥的读法是: 初版训练数据英文占比极小, v1.1 做过补救, 补救到什么程度, 页上没有对比样例 (第 4 页那组对比没抓到), 局限性这段也没更新措辞.

[**Releases**](https://github.com/zai-org/ChatGLM-6B/releases)

[**发布版本**](https://github.com/zai-org/ChatGLM-6B/releases)

No releases published

这个仓库还没有发布过任何 Release.

> **问:** 仓库没有 Release, 那文中的 v1.1.0 和 v1.1 版 checkpoint 是什么?
> 是模型仓库那边的版本. `revision="v1.1.0"` 是传给 transformers 的参数, 指向 Hugging Face 上 THUDM/chatglm-6b 的标签, 完整列表也链到 Hugging Face 的 Change Log; `git checkout v1.1.0` 是在从 Hugging Face 克隆下来的 chatglm-6b 目录里执行的. 这个 GitHub 仓库放的是 demo, API, 微调脚本和说明文件, 自己没有打过 Release. 所以 「ChatGLM-6B v1.1」 说的是权重和模型实现的版本, 和这里的代码版本是两套编号, 代码这边没有编号.

<!-- page 10 of 10 -->

[Contributors](https://github.com/zai-org/ChatGLM-6B/graphs/contributors) 46

[贡献者](https://github.com/zai-org/ChatGLM-6B/graphs/contributors) 46 人

![Image block](images/p10-32-contributors-https-github-com-zai-org-chatglm-6b.png)

(图: 一排 13 个圆形头像, 有动漫人物, 素描, 猫, 表情包, 一张真人照片和几个抽象图案, 没有名字.)

[+ 32 contributors](https://github.com/zai-org/ChatGLM-6B/graphs/contributors)

[另外还有 32 位贡献者](https://github.com/zai-org/ChatGLM-6B/graphs/contributors)

> **确认:** 贡献者人数对得上吗?
> 差一个. 标题写 46 人, 图里能数出 13 个头像, 下面写 「+ 32 contributors」, 13 加 32 是 45. 可能最右边还有一个头像被截图裁掉了, 也可能两个数的计数口径不同, 抓取看不出来. 文件名 「p10-32-contributors」 里的 32 来自下面那行 「+ 32」, 不是图里的头像数. 这张图除了证明有人参与, 没有别的信息.

**Languages**

**语言**

[**Python** 98.5%](https://github.com/zai-org/ChatGLM-6B/search?l=python) [**Shell** 1.5%](https://github.com/zai-org/ChatGLM-6B/search?l=shell)

[**Python** 98.5%](https://github.com/zai-org/ChatGLM-6B/search?l=python), [**Shell** 1.5%](https://github.com/zai-org/ChatGLM-6B/search?l=shell). (根目录文件列表里没有 .sh 文件, 这 1.5% 的 Shell 应该在 ptuning 之类的子目录里, 抓取没有展开子目录.)
