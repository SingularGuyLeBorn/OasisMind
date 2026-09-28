[OM-FREEPLAY] 材料不够 5000. 源文是 Hugging Face 上 inclusionAI/Ling-plus 的模型卡页面抓取, 5 页, 4 张图, 不是技术报告. 下面只整理这 5 页自己印出来的数字, 名字和链接, 结构和评测分数页面没给, 这里也不补.

## 1. 这 5 页是什么

第 1 页是 Hugging Face 仓库页的外壳: 搜索框, 仓库名 inclusionAI/Ling-plus, 点赞 48, 组织关注数 3.07k, 一排标签, 上个月下载量 315, 右侧的 Safetensors 面板, 推理服务商栏, Model tree 和所属合集. 第 2 到 4 页是 README 正文: 论文卡片, Introduction, 下载表, Evaluation, Quickstart 代码, Deployment, License, Citation. 第 5 页是引用条目的最后两行和网站页脚.

所以这份材料的性质是模型卡, 不是论文. 能从里面拿到的硬信息很少: 一个 Safetensors 面板上的 293B 和 BF16, 一张两行的下载表, 一段示例代码, 一个 MIT 许可证. 其余篇幅是介绍性的段落和 Hugging Face 的界面元素. 读这份材料, 重点是看这些零散的数字彼此能不能对上.

## 2. 三个总参数

同一个页面上出现了三个总参数. Safetensors 面板写 Model size 293B params, 这是 Hugging Face 按权重文件统计出来的数. Introduction 写 Ling-Plus has 290 billion parameters, 下载表的 #Total Params 列也写 290B. 论文卡片的标题写 Scaling a 300B Mixture-of-Experts LING LLM.

这三个数的差距不大, 但页面没有做任何解释. 293B 比 290B 多出 3B, 页面没有说这 3B 是什么. 300B 看起来像论文题目里的取整, 页面同样没有明说. 引用这份材料时, 比较稳的写法是把出处一起带上: 面板 293B, README 290B, 论文题 300B, 不要把三者合成一个数.

## 3. 激活参数和上下文长度

激活参数只出现一个值: 28.8B, 在 Introduction 和下载表里各印一次, 两处一致. Introduction 还顺带给了 Ling-Lite 的规格: 总参数 16.8B, 激活参数 2.75B. 这些数都是这一页自己印的, 可以记在 Ling-plus 页名下.

上下文长度只在下载表里出现, 写 64K. 页面没有写这是 65536 还是 64000, 也没有写训练时用的长度和推理时允许的长度是不是同一个值. 示例代码里 max_new_tokens=512, 这是生成长度的上限, 和 64K 不是同一个概念, 不能拿来互相印证.

## 4. 下载表缺了什么

下载表有两行: Ling-plus-base 和 Ling-plus. 两行的总参数, 激活参数, 上下文长度完全相同, 都是 290B, 28.8B, 64K. 表没有说 base 和 Ling-plus 的差别在哪, 页面其他地方也没有提后训练流程. 从名字只能看出一个是 base, 另一个是示例代码里说的 chat model, 但示例代码加载的又不是 Ling-plus.

表上面那句话说大陆用户可以去 ModelScope.cn 下载. 可原表下载列每个模型占两行, 第一行印 HuggingFace, 第二行在 md 里是空单元格, PDF 上也只能看到 HuggingFace. ModelScope 的链接在抓取里没有出现. 这是正文和表格之间的一处落差.

## 5. 结构: 页面只给了两个词

关于模型结构, 这 5 页只有两处线索. 一处是 Introduction 第一句 「Ling is a MoE LLM」, 一处是第 1 页的标签 bailing_moe. 论文标题里还有 Mixture-of-Experts 一词, 但那是论文题目, 不是模型卡的结构说明.

页面没有层数, 没有隐藏维度, 没有专家个数, 没有每个 token 激活几个专家, 没有注意力类型, 也没有词表大小. Introduction 第二段说 「Their structure makes it easy to scale up and down」, 可这一页没有给出任何结构细节来支撑这句话. 28.8B 和 290B 的比值约是十分之一, 这是算出来的比例, 页面没有说这个比例怎么来的. 结构细节要看论文或配置文件, 不能从这张卡片里推.

## 6. 名字的几种写法

Introduction 写 Ling-Plus 和 Ling-Lite, P 和 L 都大写. 仓库名, 下载表, Model tree 标题都写 Ling-plus, p 小写. 论文题目写全大写的 LING. 引用条目 key 是 ling, 作者是 Ling Team. 这些写法指向同一系列, 大小写不统一.

bailing_moe 是另一个名字. 它出现在第 1 页标签里, 是 Hugging Face 的模型类型标签, 链接是 models?other=bailing_moe. 页面没有一句话说明 bailing 和 Ling 是什么关系. 这个标签能说明的只有一点: 这个仓库在 Hugging Face 上登记的模型类型叫 bailing_moe.

## 7. 示例代码的三处错位

第一处是模型名. 这是 Ling-plus 的模型卡, Quickstart 里却写 model_name = 「inclusionAI/Ling-lite」. 照原样运行, 加载的是 Ling-lite 仓库. 页面没有说明为什么这样写, 读者只能看到字符串不一致.

第二处是 custom_code. 第 1 页有 custom_code 标签, 代码里的 from_pretrained 只传了 model_name, torch_dtype=「auto」 和 device_map=「auto」, 没有 trust_remote_code. 第三处是截断: system 消息, zip 那行, batch_decode 那行都被页面宽度截掉, 行尾字符只剩半截. 所以这段代码在页面上不能原样复制运行, 截掉的部分要到原仓库去看.

## 8. 许可证, 评测, 部署都指向别处

许可证有两处. 第 1 页标签写 License: mit. 第 4 页 License 一节写 「This code repository is licensed under the MIT License」, 链接文件名拼作 LICENCE. 句子主语是 code repository, 而这个仓库里放的是 293B 的权重. 页面没有单独说权重适用什么条款.

Evaluation 一节只有一句话, 把读者引到 GitHub 上的 Ling_Technical_Report_V1.pdf. 论文卡片和引用条目指的是 arXiv 2503.05139. 页面没有说这两份是不是同一个文件. Deployment 一节也只有一句 「Please refer to Github」, 指向 inclusionAI/Ling 仓库的 README.md. 这张卡片上没有一个评测分数, 也没有一条部署命令.

## 9. 页面上的计数和时间

第 1 页的计数有: 点赞 48, 组织关注数 3.07k, 上个月下载 315, Community 3, 微调版本 2 个, 量化版本 1 个, 推理服务商请求 1 次. 合集那一行写 10 items, Updated 24 days ago, 最后跟一个 20, 这个 20 没有标单位. 论文卡片末尾也有一个 6, 同样没有单位.

时间方面, 只有论文卡片给了绝对日期: Published Mar 7, 2025. 引用条目的 year = {2025} 与之一致. 合集的 「24 days ago」 是抓取当下的相对时间, 页面没有抓取日期, 所以换算不出合集的更新日. 下载量 315 是 「last month」 的值, 同样依赖抓取日期.

## 10. 4 张图

p02-introduction 是蓝色环形标识加一行 Hugging Face 链接, 文件名取自后面的 Introduction 标题, md 里的替代文字写 Chart block, 但图里没有图表. p03 那张是标题旁的链接锚点图标, 文件名取自下一句 「You can download the following table...」.

第 5 页两张都是页脚元素. p05-system-theme 是主题切换旁的显示器小图标, p05-image 是 Hugging Face 的笑脸标识. 4 张图里没有结构图, 没有评测曲线, 也没有表格截图. 它们对理解 Ling-plus 本身没有帮助, 只说明这是一份网页抓取.

## 11. md 转写和 PDF 的差异

对照 PDF, MinerU 的 md 有几处字形错误. system 消息结尾 PDF 是 「created b」, md 成了 「created I」. zip 那行 PDF 是 「zip(model_」, md 成了 「zip(model Device)]」. skip_special_tokens 那行 PDF 是 「=Tr」, md 成了 「=T:」. 引用标题 PDF 截在 「LIN」, md 成了 「LII」.

还有几处是漏字. PDF 第 5 页顶上有 year = {2025} 和收尾的花括号, md 的第 5 页没有这两行. Community 旁的 3 在 md 里丢了. 表头 「#Total Params」 和 「#Activated Params」 在 md 里连成 「#TotalParams」 和 「#ActivatedParams」. bi 文件的代码和引用按 PDF 字形转写, 这些差异都在 bi 的最后一条里列出.
