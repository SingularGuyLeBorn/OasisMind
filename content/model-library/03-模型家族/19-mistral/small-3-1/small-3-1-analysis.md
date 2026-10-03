[OM-FREEPLAY] 材料不够 5000. 源文是一页官网发布稿, 能用的数字不到二十个, 基准小节在打印稿里大多空白. 下文只用这页印出来的数, 散点图坐标和所有自算结果都标了估算.

# Mistral Small 3.1 分析稿

| 项目 | 本页印出的内容 |
|---|---|
| 发布日期 | March 17, 2025 |
| 前代 | Building on Mistral Small 3 |
| 参数量 | 正文未写; 图标签 「Mistral Small 3.1 (24B)」, 仓库名 「24B-Base-2503」 |
| 上下文 | up to 128k tokens |
| 速度 | 150 tokens per second |
| 许可证 | Apache 2.0 |
| 模态 | 文本 + 多模态理解 (图像) |
| 部署 | 单张 RTX 4090, 或 32GB RAM 的 Mac |
| 发布形态 | base 和 instruct 两个 checkpoint |
| 有数据的图 | 仅 GPQA-Diamond 对每 token 延迟的散点图 |
| 空白的小节 | Text instruct, Multimodal, Multilingual, Long Context, Pretrained |

## 1. 这页印了什么, 没印什么

这份打印稿有 7 页, 真正有内容的是前 5 页. 第 1 页是标题和导语, 第 2 页是一张 GPQA-Diamond 散点图, 许可证和两段性能说明, 第 3 页是四个基准小节的标题, 第 4 页讲使用场景和特性, 第 5 页讲获取渠道. 第 6, 7 页是网站页脚. 每页左下角都压着同一个 cookie 弹窗, 第 2 页的图注前半句, 第 3 页 「Pretrained Performance」 下面的说明, 第 4 页几条特性的开头都被盖住. 幸好 PDF 文本层保留了被盖住的大部分句子, 对照稿以文本层为准.

更大的缺口在图表. 官网原页在 「Text instruct benchmarks」, 「Multimodal Instruct Benchmarks」, 「Multilingual」, 「Long Context」, 「Pretrained Performance」 下面应该各有图, 但打印稿里这些位置是空白, 大概是动态加载的图没被抓进 PDF. 于是这页能拿来做定量分析的只剩一张散点图和正文里零散的几个数. 导语里 「outperforms comparable models」 和第 2 页 「surpasses ... across all these dimensions」 这两句最强的说法, 在本页都找不到逐项证据.

## 2. 谱系: 这一代从哪来, 往哪去

页面对谱系只交代了两层. 往上一层是 「Building on Mistral Small 3」, Small 3.1 在 Small 3 基础上加了三样东西: 更好的文本能力, 多模态理解, 更长的上下文窗口 (最多 128k token). 页面没说 Small 3 的上下文是多少, 也没说多模态部分是怎么接进去的, 所以 「扩展了多少倍」, 「视觉部分多大」 这类问题本页答不了, 这里也不从别的页面搬数.

往下一层是社区衍生. 第 4 页举了 Nous Research 的 DeepHermes 24B, 说它是 「built on Mistral Small 3」 的推理模型. 注意是建在 Small 3 上, 不是 3.1. Mistral 用这个例子解释这次为什么 base 和 instruct 一起放: 社区拿 base 做推理方向的后训练, 需要一个没被指令微调改动过的起点. 所以在谱系图上, Small 3.1 的位置是 「Small 3 的多模态长上下文升级版」, 同时又是下一轮社区推理模型的候选底座. 仓库名 Mistral-Small-3.1-24B-Base-2503 和 Mistral-Small-3.1-24B-Instruct-2503 里的 2503 对应 2025 年 3 月, 和页首日期一致, 版本号, 规模, 日期三样信息都编在了名字里.

## 3. GPQA-Diamond 散点图读图

这是全页唯一有数据的图. 纵轴是 GPQA-Diamond 分数, 刻度只标了 35, 40, 45; 横轴是每个 token 的延迟毫秒数, 刻度 10 到 16. 图上四个点, 下面的坐标是按像素位置读的 (误差约 0.2 分, 0.1 毫秒):

| 模型 | 延迟 (ms/token) | GPQA-Diamond |
|---|---|---|
| Mistral Small 3.1 (24B) | 10.9 | 46.0 |
| GPT-4o Mini | 11.9 | 39.4 |
| Gemma 3-it (27B) | 13.3 | 42.4 |
| Claude-3.5 Haiku | 15.1 | 41.6 |

按这组估算值算, Mistral Small 3.1 比 Gemma 3-it (27B) 高约 3.6 分, 比 Claude-3.5 Haiku 高约 4.4 分, 比 GPT-4o Mini 高约 6.6 分. 延迟上, 它比 GPT-4o Mini 快约 8%, 比 Gemma 3-it 快约 18%, 比 Claude-3.5 Haiku 快约 28% (估算, 按 (对手 - 自己) / 对手 计). 在这张图里它在两个轴上同时占优, 其他三个点都落在它的右下方, 左上角那块浅红色三角区就是在强调这一点: 又快又准的区域里只有它一个.

也要看到这张图的局限. 纵轴从 35 起, 不从 0 起, 6.6 分的差距在视觉上被放大了. Gemma 3-it 标的是 27B, 比 24B 多约 12.5% 参数 (27 / 24), 延迟却高出约 22% (13.3 / 10.9), 这里面除了参数差, 还有实现, 部署方式的差别, 单看这张图分不开. 另外第 2 页说过, 分数有的是厂商自报, 有的是 Mistral 用统一框架自己跑的, 图上没标哪个点是哪种来源.

## 4. 150 token/s 和 10.9 ms/token 对不上

导语说推理速度 「150 tokens per second」. 散点图里 Mistral Small 3.1 的延迟约 10.9 毫秒每 token. 如果两个数描述的是同一个单流解码场景, 10.9 毫秒每 token 换算成速度约 92 token/s (1000 / 10.9), 反过来 150 token/s 对应约 6.7 毫秒每 token (1000 / 150). 两者差了六成多, 不是读图误差能解释的.

可能的解释有几种, 页面都没给依据, 只能列出来. 其一, 两个数的硬件或部署方式不同: 散点图图注的残句是 「4xH100, proprietary models measured through API」, 150 token/s 可能出自另一套配置. 其二, 统计口径不同: 一个可能是峰值或平均吞吐, 另一个是端到端延迟, 后者含首 token 时间或网络开销. 其三, 散点图的横轴本身是为了和闭源 API 对比而设计的, 闭源模型走 API 天然带网络往返, 为了公平, Mistral 这边可能也按某种接近 API 的方式测. 不管哪种, 读者拿 150 token/s 去估自己机器上的速度都需要打折扣.

## 5. 端侧部署这句话的算术

第 4 页说 Mistral Small 3.1 「can run on a single RTX 4090 or a Mac with 32GB RAM」. 页面给的 24B 来自图标签和仓库名. 按每参数 2 字节的 bf16 存储, 权重约 48GB (24 x 2); 8-bit 量化约 24GB, 4-bit 约 12GB. 32GB 的 Mac 用的是统一内存, 系统和其他程序也要占一部分, 所以 bf16 肯定放不下, 8-bit 已经比较紧, 4-bit 才留得出余量.

这意味着 「能在 32GB Mac 上跑」 默认了量化, 但页面没说用几 bit, 也没说量化后分数掉多少. RTX 4090 的显存页面没印, 这里不补数, 只能说同样的道理成立: 单卡部署几乎必然是量化版本. 另一个没法估的是长上下文的显存开销. 128k token 的 KV cache 大小取决于层数, 头数, 头维度, 这页一个都没给, 所以 「在端侧跑满 128k」 是否可行, 本页无法判断.

## 6. 空白的基准小节意味着什么

第 3 页的 「MM-MT-Bench scaled to between 0 and 100」 是唯一留下的多模态线索. 特意注明换算到 0 到 100, 说明 MM-MT-Bench 原始分不是百分制, 换算后才和其他百分制基准画在一起. 换算方法没写, 分数也没印出来, 所以连 Mistral Small 3.1 在多模态上的一个具体分数都拿不到.

「Pretrained Performance」 下只剩 「We also release the pretrained base model」 和一个被截断的 「All pretrain」. 基座模型的分数对想做后训练的人最有用, 但本页没有. 整体看, 这页的性能证据链只剩 GPQA-Diamond 一环, 其余四个维度要去看原网页的动态图或模型卡, 本分析不引用页外数据.

## 7. 许可证和分发渠道

许可证是 Apache 2.0, 写在第 2 页被弹窗盖住的位置, 文本层里完整保留. Apache 2.0 允许商用和修改, 这和第 4 页 「Fine-tuning for specialized domains」, 「Foundation for advanced reasoning」 两条是配套的: 放出 base 权重加宽松许可, 才能让企业和社区在上面继续训练.

分发渠道分两批. 当天可用的有 Hugging Face (Base 和 Instruct 两个仓库), Mistral 自家的 La Plateforme API, 以及 Google Cloud Vertex AI. 「in the coming weeks」 上线的有 NVIDIA NIM 和 Microsoft Azure AI Foundry. 企业私有化部署走 「contact us」. 渠道这部分没有数字, 唯一能核对的是仓库名里的 24B 和 2503.

## 8. 本页对不上或核不了的数字

几处数字互相对不上, 或者在本页找不到支撑. 最明显的是速度: 导语 150 token/s 和散点图约 10.9 ms/token (约 92 token/s) 差了六成多, 页面没说明测量条件. 其次是端侧部署: 24B 按 bf16 约 48GB, 超过 32GB Mac 的内存, 页面没说用了量化.

其余属于 「核不了」. 参数量 24B 只出现在图标签和仓库名里, 正文没写. 128k 的 k 是 1000 还是 1024 没交代. 「across all these dimensions」 声称在文本, 多模态, 多语言, 长上下文上全面超过小型闭源模型, 但对应四个小节在打印稿里全是空白. 散点图的纵轴刻度只有 35, 40, 45, 所有分数都是读图估算, 图注前半句被盖住, 开源模型的测量硬件只知道 「4xH100」. 页脚的 © 2026 是打印时的网站年份, 和 2025 年 3 月 17 日的发布日期不是同一件事, 不算矛盾.
