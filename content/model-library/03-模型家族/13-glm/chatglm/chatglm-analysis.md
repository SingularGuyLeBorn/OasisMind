---
title: "ChatGLM-6B 仓库首页: 分析"
category: "模型库"
tags: ["GLM", "技术解析"]
published: true
excerpt: "整份 README 的重心在 「怎么跑起来」. 从第 5 页的硬件需求开始, 到第 9 页的多卡部署, 一共五页半都在讲安装, 调用, 本地加载, 网页 demo, 命令行 demo, API, 量化, CPU, Mac, 多卡."
---
源文是仓库首页和部署说明.

源文是 GitHub 上 zai-org/ChatGLM-6B 仓库首页的抓取, 10 页, 12 张图. 前面是根目录文件列表, 后面是中文 README.md, 中间夹着一段英文的 WebGLM 演示. 它不是技术报告, 没有论文作者, 没有结构图, 没有评测表. 下文只按页面上的字, 数字, 文件名和链接写, 不从外部补.

# ChatGLM-6B 仓库首页: 分析

## 1. 这是一份部署说明, 不是技术报告

整份 README 的重心在 「怎么跑起来」. 从第 5 页的硬件需求开始, 到第 9 页的多卡部署, 一共五页半都在讲安装, 调用, 本地加载, 网页 demo, 命令行 demo, API, 量化, CPU, Mac, 多卡. 讲模型本身的只有第 2 页 「介绍」 一段, 外加第 8 页量化一节里顺带的一句 「由于采用了相对位置编码」. 剩下的篇幅分给了 GLM-4 的公告, 四个兄弟项目的更新记录, 友情链接和局限性.

这决定了能从这页读出什么. 想知道 ChatGLM-6B 要多少显存, 用哪个 transformers 版本, 怎么绕开 Hugging Face 下载慢, 这页答得很细. 想知道它的层数, 注意力形式, 训练数据的构成, 各阶段的超参数, 这页一个都答不了, 连一张评测分数表都没有. 第 5 页有一个 「第三方评测」 标题, 下面只抓到一行英文标题 「Measuring Massive Multitask Chinese Understanding」, 没有链接, 没有分数.

## 2. 文件列表: 代码三年没动, 说明文件两年前改过

第 1 页的文件列表有 23 行. 目录有 .github/ISSUE_TEMPLATE, examples, improve, limitations, ptuning, resources 六个; 说明类文件有 FAQ.md, PROJECT.md, README.md, README_en.md, UPDATE.md; 许可类有 LICENSE 和 MODEL_LICENSE; 代码有 api.py, cli_demo.py, cli_demo_vision.py, utils.py 和四个 web_demo 脚本, 外加 requirements.txt. 这和 README 后文对得上: api.py 对应 API 部署, cli_demo.py 对应命令行 demo, web_demo.py 对应 Gradio demo, utils.py 里有多卡部署用的 load_model_on_gpus, 两个 vision 脚本对应 VisualGLM-6B, ptuning 目录对应 P-Tuning v2 微调.

时间线很清楚. 除了 README.md, README_en.md 和最新一次 PR 合并是 「2 years ago」, 其余每一行都是 「3 years ago」. 提交说明里能看出仓库后期的工作: 「Fix multi-gpu loading」, 「Add multi-gpu deployment」, 「Merge branch 'dev' into dev_multi_gpu」 是多卡支持, 「Add vision demo」 是 VisualGLM, 「Add webglm photo」 是 WebGLM 演示用的图. 这些都停在三年前. 两年前唯一改的实质内容, 是 README.md 的 「GLM-4更新」. 页尾写着 「No releases published」, 仓库没打过 Release; 语言统计 Python 98.5%, Shell 1.5%, 根目录却没有 .sh 文件, Shell 脚本应该在子目录里, 抓取没展开.

## 3. ChatGLM-6B 和 GLM-4 不是同一个仓库

README 顶上的 「GLM-4 开源模型和 API」 一段, 很容易让人以为这个仓库后来升级成了 GLM-4. 从页面能看到的证据都指向相反方向. 「GLM-4 开源模型」 的链接去 github.com/THUDM/GLM-4, 是另一个仓库, 里面放的是 GLM-4-9B 系列. 智谱清言去 chatglm.cn, API 平台去 open.bigmodel.cn, 教程去 MetaGLM/glm-cookbook. 四个入口没有一个指回 ChatGLM-6B 仓库的文件. 根目录的代码最后一次提交在三年前, 比 「GLM-4更新」 那次早一年, 文件名里也没有任何 GLM-4 的痕迹.

所以这一段只是公告. 它的指标说法 (「在多个指标上有了新的突破」, 「各项指标明显提升」) 说的是 GLM-4, 不能拿来描述 ChatGLM-6B. 这段里还有一处小矛盾: 开头说 「可以在以下两个渠道体验」, 下面列了四项, 只有第一项带项目符号. 另有一处乱码, 「在各项指标的ce是上」, 「ce是」 原本是什么字看不出. 同理, 页上 「更大规模的 GLM 商业模型」, 「更大规模的 ChatGLM 模型」, 都指向智谱的在线服务, 和本仓库的 62 亿参数模型不是一回事. 第 2 页还专门写了一句, 项目团队 「未基于 ChatGLM-6B 开发任何应用」, 网页端, 安卓, iOS, Windows App 都没有, 这句话把 chatglm.cn 和 ChatGLM-6B 划开了.

## 4. 模型本身: 页上给了四项, 其余都没有

关于 ChatGLM-6B 这个模型, 页面能支撑的事实只有这些: 开源, 中英双语, 对话模型; 基于 GLM 架构; 62 亿参数; 训练约 1T 中英双语标识符; 训练过程包括监督微调, 「反馈自助」 和人类反馈强化学习; 采用相对位置编码, 训练长度 2048, 超过以后效果逐渐下降. 第 3 页 ChatGLM2-6B 的更新说明里, 拿初代做对比时又透露了一个数: ChatGLM-6B 的上下文长度是 2K, 和训练长度 2048 一致.

没有的部分更多. 层数, 隐藏维度, 注意力头数, 词表大小, 训练用了多少卡, 数据配比, 都没写. 「使用了和 ChatGPT 相似的技术」 没展开, 紧接着列的就是那三个训练阶段. 「反馈自助」 这个词全文只出现一次, 没有解释, 看不出是自我反馈, 自举还是别的做法. 相对位置编码具体是哪一种, 也没写. 第 3 页 ChatGLM2-6B 用了 Multi-Query Attention 和 FlashAttention, 用了 GLM 的混合目标函数, 这些都是二代的新特性, 反过来说明不了初代用的是什么. 写 ChatGLM-6B 的结构时, 这页能引用的就是 「GLM 架构, 62 亿参数, 相对位置编码, 训练长度 2048」 四项, 别的要去论文或 Hugging Face 上的模型实现里找.

## 5. 许可证和权重是两件事

这一点页面给的线索分三层. 第一层是文件. 根目录同时放着 LICENSE 和 MODEL_LICENSE, 提交说明一个是 「Add License」, 一个是 「update license」, 抓取只有文件名, 没有正文. 两个文件分开放, 说明仓库的作者自己也把 「代码」 和 「模型」 当成两样东西在授权, 但 LICENSE 具体是哪种协议, 这份抓取里没有.

第二层是权重的使用条件, 写在 README 正文里: 「ChatGLM-6B 权重对学术研究完全开放, 在填写问卷进行登记后亦允许免费商业使用」. 主语是 「权重」. 第三层是紧接着的一段, 请大家遵守 「开源协议」, 这个链接指向 MODEL_LICENSE, 可同一句话约束的对象是 「开源模型和代码及基于开源项目产生的衍生物」, 把代码也带上了. 所以页面自身有一点含糊: 链接指向模型许可, 措辞却覆盖代码. 引用时能说的是: 权重对学术研究开放, 商用要先填问卷登记, 登记后免费; 使用要遵守 MODEL_LICENSE; 代码的许可条款在 LICENSE 里, 本页没有给出内容. 「开源」 两个字在这里不能直接理解成某个标准开源协议下的自由使用, 权重的商用前面还有一道登记手续.

## 6. 显存和内存: 同一个数字, 三种含义

第 5 页的硬件表是全文最干净的一组数据: FP16 推理最低 13GB 显存, 微调 14GB; INT8 推理 8GB, 微调 9GB; INT4 推理 6GB, 微调 7GB. 第 2 页介绍里的 「INT4 最低只需 6GB 显存」, 「INT4 最低只需 7GB 显存即可启动微调」 和表完全一致. 每一档微调都比推理多 1GB, 这个规律页上没解释, 表里的 「高效参数微调」 指的就是 P-Tuning v2.

麻烦出在第 8 页. 那里的数字很密, 而且显存和内存交替出现. FP16 默认加载 「大概 13GB 显存」; 聊两三轮后 8-bit 约 10GB, 4-bit 约 6GB, 这是显存; 量化过程要先把 FP16 模型读进内存, 「大概 13GB 的内存」; 直接加载 INT4 模型 「仅需大概 5.2GB 的内存」; CPU 上 `.float()` 推理 「需要大概 32GB 内存」; Mac 上半精度加载 「大概 13GB 内存」. 13GB 一个数出现三次, 分别是 FP16 推理显存, 量化过程的内存, Mac 半精度的内存. INT8 的 8GB 和 10GB 也要分开读: 8GB 是起步门槛, 10GB 是聊过两三轮之后, 多出来的部分随对话轮数增长. 4-bit 在两处都写 6GB, 页上没说明为什么没有涨. 5.2GB 是内存里模型本身的大小, 和表里 INT4 推理 6GB 显存差 0.8GB, 页上也没交代这部分去了哪里.

## 7. 部署路径: 一条主线, 几条岔路

主线是 transformers. `AutoTokenizer` 和 `AutoModel` 都带 `trust_remote_code=True`, 模型实现不在 transformers 库里, 而是跟着权重从 Hugging Face 的 THUDM/chatglm-6b 下载. 所以 README 提醒 「模型的实现仍然处在变动中」, 想固定就加 `revision="v1.1.0"`. 这个版本号是 Hugging Face 模型仓库的标签, 完整列表在那边的 Change Log 里, 和这个 GitHub 仓库无关, GitHub 这边连 Release 都没有. 网络差时的办法也围着 Hugging Face 转: 先装 Git LFS 整个克隆; 嫌慢就用 `GIT_LFS_SKIP_SMUDGE=1` 只克隆模型实现, 参数文件从清华云盘手动下, 再把代码里的 `THUDM/chatglm-6b` 换成本地路径.

岔路按硬件分. 显存不够走 `.quantize(8)` 或 `.quantize(4)`, 「目前只支持 4/8 bit 量化」; 内存也不够就直接加载 chatglm-6b-int4 或 chatglm-6b-int8 两个预量化模型. 没有 GPU 走 CPU, `.float()` 加载, 要 32GB 内存, 跑量化模型还得装 gcc 和 openmp. Mac 走 MPS 后端, 需要 PyTorch-Nightly 2.1.0.dev 版本, 而且只支持从本地加载; 量化 kernel 是 CUDA 写的, Mac 上的量化模型只能退回 CPU. 多张小卡走 utils.py 里的 `load_model_on_gpus`, 依赖 accelerate, 默认均匀切分, 也能传 `device_map`. 外部项目里 JittorLLMs 说最低 3G 显存甚至无显卡能跑 FP16, InferLLM 说手机上 4G 内存能实时跑, lyraChatGLM 说推理最高 9000+ tokens/s, 这些是第三方项目的自述, README 只是转引.

## 8. demo 和 API: 默认参数藏在截图里

三种交互方式对应三个脚本. web_demo.py 基于 Gradio, 做了打字机效果; 国内访问 Gradio 慢, `share=True` 会让流量绕 Gradio 服务器转发, 默认已改成 `share=False`. 另有社区贡献的 Streamlit 版, 链到 PR #117. cli_demo.py 是命令行对话, 输入 `clear` 清历史, `stop` 退出. api.py 基于 fastapi 和 uvicorn, 默认监听本机 8000 端口, POST 一个带 `prompt` 和 `history` 的 JSON, 返回 `response`, `history`, `status`, `time` 四个字段, 样例时间是 2023-03-23 21:38:40.

有一组数字正文没写, 只在第 6 页的 Gradio 截图里: Maximum length 2048, Top P 0.7, Temperature 0.95. 这是网页 demo 滑块的默认位置, 其中 2048 和训练长度相同. 引用 demo 默认采样参数时, 出处只能写 「README 中的 demo 截图」. API 的返回样例被页面切成了两半, `response` 在第 7 页, 其余三个字段在第 8 页, 中间隔着一个复制按钮的图片和两段正文, 要拼起来才完整. 源文还有一处命令粘连: 「git clone https://github.com/THUDM/ChatGLM-6Bcd ChatGLM-6B」 实际是 clone 和 cd 两行.

## 9. 更新信息里的数字大多属于别的模型

「更新信息」 一节有五条, 只有一条是 ChatGLM-6B 自己的. 2023/07/25 的 CodeGeeX2 基于 ChatGLM2-6B, 600B 代码预训练, HumanEval-X 六种语言的提升百分比, Python Pass@1 35.9%, 最大序列长度 8192, 量化后 6GB, 全是 CodeGeeX2 的. 2023/06/25 的 ChatGLM2-6B 有 1.4T 预训练, MMLU +23%, CEval +33%, GSM8K +571%, BBH +60%, 上下文 32K, 对话阶段 8K, 推理快 42%, INT4 下 6G 显存对话长度从 1K 到 8K, 这些都是二代的数. 2023/06/14 的 WebGLM 是 KDD 2023 的研究工作, 2023/05/17 的 VisualGLM-6B 是多模态模型, 需要额外装 SwissArmyTransformer 和 torchvision.

真正属于 ChatGLM-6B 的是 2023/05/15 那条: 更新 v1.1 版 checkpoint, 加了英文指令微调数据, 平衡中英比例, 解决英文回答夹中文的问题. 可冒号后面的 「更新前后的英文问题对比」 没抓到, 这条只剩一句声明. 另外, ChatGLM2 那段拿初代做对照时说出了 ChatGLM-6B 的两个数, 上下文 2K 和 INT4 下 6G 显存约 1K 对话长度, 这是全文少有的从侧面补充初代参数的地方. 两个演示也值得看细节: WebGLM 的回答引了 [5], 参考资料只列到 [4]; VisualGLM 说图里有 「一支铅笔」, 图上是十来支, 回形针, 长尾夹, 木尺都没提.

## 10. 局限性和 v1.1 之间有一段没对齐的时间

局限性一节列了四条: 模型容量小, 事实性知识会出错, 不擅长数学和编程; 可能生成有害或有偏见的内容, 原页没展示; 英文能力不足, 训练用的指令和回答英文 「仅有极小一部分」, 英文提问质量远不如中文, 甚至和中文回答矛盾, 并且中英夹杂; 容易被误导, 「自我认知」 会跑偏. 两处 「点击查看例子」 是折叠区, 抓取里没有内容.

第三条和第 4 页的 v1.1 更新放在一起读就有问题. v1.1 专门说 「解决英文回答中夹杂中文词语的现象」, 局限性却仍写着中英夹杂, 还用了 「当前版本的模型」 这种说法. 局限性这段没有日期; 文件列表里 limitations 目录最后提交在三年前, README.md 在两年前改过, 从提交时间判断不出它写于 v1.1 之前还是之后. 比较稳妥的读法是: 初版训练数据英文很少, v1.1 做了补救, 效果如何页上没有样例能对, 局限性的措辞没随 v1.1 改. 第 9 页的八个示例 (自我认知, 提纲写作, 文案写作, 邮件写作助手, 信息抽取, 角色扮演, 评论比较, 旅游向导) 也只剩标题, 截图一张都没抓到, 没法拿来和局限性互相印证.

## 11. 12 张图里只有 3 张有内容

![Image block](images/p04-image.png)

![Image block](images/p06-gradio-pip-install-gradio-web-demo-py-https-github-com.png)

![Image block](images/p10-32-contributors-https-github-com-zai-org-chatglm-6b.png)

有内容的三张是: 第 4 页 VisualGLM 的样例照片, 俯拍木桌, 一本摊开的空白笔记本, 一把剪刀, 十来支铅笔, 几枚回形针, 一个长尾夹, 一把木尺; 第 6 页 Gradio 网页 demo 的截图, 有 Chatbot 对话框, Input 输入框, Submit 按钮, Clear History 按钮和三个参数滑块; 第 10 页一排 13 个贡献者头像. 贡献者一栏写 46 人, 13 个头像加 「+ 32 contributors」 是 45, 差一个, 可能截图裁掉了一个头像.

![Image block](images/p01-main.png)

![Image block](images/p07-8000-post.png)

![Image block](images/p08-json.png)

![Image block](images/p08-2-3-8-bit-gpu-10gb-4-bit-6gb-chatglm-6b-context-length.png)

![Image block](images/p08-https-cloud-tsinghua-edu-cn-d-674208019e314311ab5c.png)

![Image block](images/p08-image.png)

![Image block](images/p08-could-not-find-module-nvcuda-dll-runtimeerror-unknown.png)

![Image block](images/p08-chatglm-6b-13gb-16gb-macbook-pro-chatglm-6b-int4-gpu.png)

![Image block](images/p09-cpu-openmp-https-github-com-zai-org-chatglm-6b-blob.png)

其余九张是界面图标, 每个文件只有五百字节左右. p01-main.png 是一对叠放的对话气泡, 另外八张全是代码块右上角的复制按钮. MinerU 给图起名的规则是取图片附近的一行字, 所以文件名跟的是旁边的正文: 「10gb」, 「4-bit-6gb」, 「macbook-pro」, 「nvcuda-dll」, 「cloud-tsinghua」 都是相邻段落里的词, 图里一个字都没有. p08-2-3-8-bit 里的 「2-3」 是 「2 至 3 轮对话」, 不是 2-bit 和 3-bit. 就连主题对得上的 p06, 文件名里的 「pip install」, 「https-github-com」 也来自下方那句安装说明, 截图里没有这些. 按文件名找图会被误导, 这批图只能看画面.

## 12. MinerU 抓取留下的错

结构上的问题最多. 「晚上睡不着应该怎么办」 那段模型回答被切成几块: 第 2 条和第 5 条跑到了友情链接和第三方评测之间, 第 3 条和结尾一句在代码块后面, 第 1 条和第 4 条整份抓取里找不到. 一条 「ChatGLM-6B 结合 langchain 实现本地知识库 QA Bot」 孤零零地夹在中间, 同一张列表的其他条目没抓到. API 返回的 JSON 被页边界切成两半. 连着的空标题出现了两次, 「使用方式」 后面紧跟 「硬件需求」, 「低成本部署」 后面紧跟 「模型量化」. Gradio 截图顶上的页面标题 「ChatGLM」 被抓成了二级标题. 几段 Python 被标成 hcl 或 txt.

字面上的问题相对少, 但会影响照抄. 复制按钮在两处被识别成汉字 「凸」; clone 和 cd 两行命令粘成了 「ChatGLM-6Bcd」; 「device_map数来自 己指定」 漏了 「参」 字还多一个空格; 「为了方便下游开发者针对自 己的应用场景」 里也多了空格; 「可以使用舒适在床上用品」 的 「在」 应为 「的」; GLM-4 段落里的 「ce是」 是乱码; 首行用户名多了一个点, 写成 「.duzx16」. 仓库链接混用 zai-org 和 THUDM 两个组织名, clone 地址和 PR #117 用 THUDM, 其余内链用 zai-org, 页上没说明两者关系. 这些都不改变事实, 但直接复制源文会把错带走, 双语稿在对应位置逐一做了说明.

## 13. 能从这页引用什么

能引用的是: ChatGLM-6B 是开源中英双语对话模型, 基于 GLM 架构, 62 亿参数, 约 1T 中英标识符训练, 经过监督微调, 「反馈自助」, 人类反馈强化学习; 相对位置编码, 训练长度 2048; 硬件表里三档量化的推理和微调最低显存; 权重学术研究开放, 登记后可免费商用, 使用须遵守 MODEL_LICENSE; 支持 4/8 bit 量化, 另有 int4, int8 预量化模型; CPU, Mac MPS, 多卡三种部署方式及各自的内存要求; P-Tuning v2 微调; v1.1 checkpoint 补了英文指令数据; 四条局限性. demo 的默认采样参数只能引到截图.

不能从这页引用的是: 任何超出上面四项的结构细节; 任何评测分数, 因为页上属于 ChatGLM-6B 的分数一个都没有; CodeGeeX2, ChatGLM2-6B, WebGLM, VisualGLM-6B, GLM-4 的任何数字, 它们只是在这份 README 里出现; LICENSE 的具体条款; v1.1 相对 v1.0 的对比样例; 八个示例和两处 「点击查看例子」 的内容. 还有一点要留意: README 顶上的 GLM-4 公告是两年前加的, 代码停在三年前, 这份抓取展示的是一个停止更新的仓库, 不能当作 GLM 家族的现状.
