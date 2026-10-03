---
title: "MiniCPM-V 4.6 · 对照译稿"
category: "模型库"
tags: ["MiniCPM", "对照译稿"]
published: true
excerpt: "MiniCPM-V 4.6 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 18 -->

arXiv:2605.08985v1 [cs.CV] 9 May 2026

arXiv 编号 2605.08985v1, 分类 cs.CV (计算机视觉), 2026 年 5 月 9 日提交.

# LLaVA-UHD v4: What Makes Efficient Visual Encoding in MLLMs? (LLaVA-UHD v4: 多模态大模型里, 高效的视觉编码靠什么?)

**Kechen Fang**<strong><sup>1</sup></strong> **Yihua Qin**<strong><sup>1</sup></strong> **Chongyi Wang**<strong><sup>2</sup></strong> **Wenshuo Ma**<strong><sup>2</sup></strong> **Tianyu Yu**<strong><sup>1</sup></strong> **Yuan Yao**<strong><sup>1</sup></strong><sup>∗ 1</sup>Tsinghua University <sup>2</sup>ModelBest

作者六人. 上标 1 是清华大学, 上标 2 是 ModelBest (面壁智能). Yuan Yao 带星号, 是通讯作者.

> **想:** 这个目录叫 minicpm-v-4-6, 这 18 页里能读到 MiniCPM-V 4.6 的参数量, 层数或评测分吗?
> 读不到. 全文没有出现 「MiniCPM-V 4.6」 这个名字, 唯一和 MiniCPM 有关的是参考文献 [47] 「Minicpm-v: A gpt-4v level mllm on your phone」, 以及第二单位 ModelBest. 论文里的系统叫 LLaVA-UHD v4, 实验用的是 SigLIP 2 加 Qwen3-8B (第 7 页), 不是某个发布型号. 所以这份对照稿里所有数字都只属于 LLaVA-UHD v4 的对照实验, 不能当成 MiniCPM-V 4.6 的规格读.

## Abstract

Visual encoding constitutes a major computational bottleneck in Multimodal Large Language Models (MLLMs), especially for high-resolution image inputs. The prevailing practice typically adopts global encoding followed by post-ViT compression. Global encoding produces massive token sequences, while post-ViT compression incurs the full quadratic attention cost of the ViT before any token reduction takes place. In this work, we revisit this convention along two dimensions: the encoding strategy and visual token compression. First, controlled experiments show that slice-based encoding outperforms global encoding across benchmarks, suggesting that preserving local details through sliced views can be more beneficial than applying global attention for fine-grained perception. Second, we introduce intra-ViT early compression, which reduces tokens in shallow ViT layers and substantially lowers visual-encoding FLOPs while preserving downstream performance. By integrating intra-ViT compression into the slice-based encoding framework, we present LLaVA-UHD v4, an efficient and compute-controllable visual encoding scheme tailored for high-resolution inputs. Across a diverse set of benchmarks covering document understanding, OCR, and general VQA, LLaVA-UHD v4 reduces visual-encoding FLOPs by 55.8% while matching or even surpassing baseline performance. These results suggest that visual-encoding efficiency can be substantially improved without sacrificing downstream performance, providing a practical design direction for efficient high-resolution MLLMs. All model weights and code will be publicly released to support further research<sup>1</sup>.

在多模态大模型 (MLLM) 里, 视觉编码是主要的算力瓶颈之一, 高分辨率图像输入时尤其明显. 通行做法是先做全局编码, 再在 ViT 之后压缩. 全局编码会产生极长的 token 序列, 而 ViT 之后的压缩要等 ViT 把完整的二次方注意力算完才开始减 token. 这篇工作从两个维度重新审视这套惯例: 编码策略和视觉 token 压缩. 第一, 对照实验表明, 切片编码在各个基准上都优于全局编码, 说明对细粒度感知来说, 用切片视图保住局部细节可能比做全局注意力更有用. 第二, 我们提出 ViT 内早压缩, 在 ViT 的浅层就减少 token, 大幅降低视觉编码 FLOPs, 同时保住下游表现. 把 ViT 内压缩接进切片编码框架, 就得到 LLaVA-UHD v4: 一套面向高分辨率输入, 高效且算力可控的视觉编码方案. 在覆盖文档理解, OCR 和通用 VQA 的一组基准上, LLaVA-UHD v4 把视觉编码 FLOPs 降低 55.8%, 表现与基线持平甚至更好. 这些结果说明, 视觉编码的效率可以大幅提升而不牺牲下游表现, 为高效的高分辨率 MLLM 提供了一个实用的设计方向. 全部模型权重和代码都将公开, 供后续研究使用<sup>1</sup>.

> **问:** 摘要写 FLOPs 降低 55.8%, 第 2 页贡献和结论写 55.75%, 还管它叫 「acceleration」, 是同一件事吗?
> 数是同一个. 第 7 页给的两端是 3555G 和 1573G, 表 4 写成 3555.1 和 1573.1, (3555.1 − 1573.1) / 3555.1 = 55.75%, 摘要四舍五入成 55.8%. 但 「acceleration」 这个词要打折扣: 全文只报了单个切片过 ViT 的 FLOPs, 没有任何一处报实际推理延迟或吞吐. FLOPs 比例是 1573.1 / 3555.1 ≈ 44.2%, 相当于少算约 2.26 倍, 实际快多少本页没有测.

## 1 Introduction

Multimodal Large Language Models (MLLMs) have made remarkable progress on a broad spectrum of vision-language tasks [25, 20, 47, 2]. As the field shifts toward fine-grained perception [31, 33, 30] and detailed image understanding [52, 43], high-resolution image inputs are rapidly becoming the default. To preserve as much visual detail as possible and sustain downstream performance, the prevailing recipe is global encoding [41, 38], which feeds the full image directly into the vision encoder. As resolution grows, this yields a token sequence that scales with image area. To relieve the downstream LLM from this token explosion, mainstream frameworks then attach a compression module after the vision encoder [47]. That is, visual tokens are reduced only after the vision encoder has already executed full global self-attention at quadratic complexity. This approach is straightforward to implement, yet its computational cost increases rapidly with resolution. Furthermore, post-ViT compression cannot mitigate the ViT’s cost, as it only operates after the full computation has already occurred. This cost is far from negligible in the high-resolution regime, making high-resolution visual encoding a central efficiency bottleneck in modern MLLMs.

多模态大模型在大量视觉语言任务上进展显著 [25, 20, 47, 2]. 随着领域转向细粒度感知 [31, 33, 30] 和细节图像理解 [52, 43], 高分辨率图像输入正在迅速成为默认. 为了尽量保住视觉细节, 维持下游表现, 通行配方是全局编码 [41, 38], 即把整张图直接送进视觉编码器. 分辨率一高, token 序列长度就随图像面积增长. 为了让下游 LLM 不被这么多 token 淹没, 主流框架在视觉编码器后面接一个压缩模块 [47]. 也就是说, 视觉 token 要等视觉编码器按二次方复杂度做完完整的全局自注意力之后才被削减. 这种做法实现起来直接, 但算力开销随分辨率快速上涨. 而且 ViT 之后的压缩减轻不了 ViT 本身的开销, 因为它只在全部计算完成后才介入. 在高分辨率区间这笔开销绝不能忽略, 高分辨率视觉编码因此成了现代 MLLM 的核心效率瓶颈.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>∗</sup>Corresponding author</span></small>

<sup>∗</sup> 通讯作者.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>Code available at [https://github.com/THUMAI-Lab/LLaVA-UHD-v4](https://github.com/THUMAI-Lab/LLaVA-UHD-v4)</span></small>

<sup>1</sup> 代码见 [https://github.com/THUMAI-Lab/LLaVA-UHD-v4](https://github.com/THUMAI-Lab/LLaVA-UHD-v4).

Preprint.

预印本.

<!-- page 2 of 18 -->

In this work, we systematically rethink this inefficient convention, beginning with the encoding paradigm. The community has widely held that global encoding is the more direct and lossless choice, since it supplies complete global context and allows arbitrary patch-to-patch interaction [41, 38]. However, our empirical evaluations across diverse benchmarks yield a surprising conclusion that slice-based encoding consistently outperforms global encoding, suggesting that slice-based strategies can already provide sufficiently informative feature representations. Moreover, by processing large images via partitioning, slice-based encoding structurally sidesteps the quadratic blow-up incurred by global encoding, making it the more efficient paradigm for ultra-high-resolution images.

这篇工作从编码范式入手, 系统地重新思考这套低效的惯例. 社区普遍认为全局编码更直接, 更无损, 因为它提供完整的全局上下文, 允许任意两个 patch 之间交互 [41, 38]. 然而我们在多种基准上的实证评测得出一个出人意料的结论: 切片编码稳定地优于全局编码, 说明切片策略本身已经能提供信息足够丰富的特征表示. 此外, 切片编码把大图分块处理, 从结构上避开了全局编码的二次方膨胀, 对超高分辨率图像是更高效的范式.

While slice-based encoding alleviates the per-forward attention explosion to some extent, high resolution still inherently produces a large number of tokens. Existing compression schemes, such as MLP-based spatial merging [41, 28], Pixel-Shuffle and various resamplers [20, 1] and token-pruning approaches [3], are almost exclusively post-ViT. They only ease the burden on the downstream LLM and do nothing about the heavy cost inside the encoder itself. To achieve truly extreme efficiency, we must strike at the root of the bottleneck: the ViT’s own compute. Intuitively, token compression must be moved inside the vision encoder and triggered as early as possible, so that the vast majority of ViT layers operate on only a small number of tokens. The vision encoder is typically a pretrained model, and inserting a randomly initialized compressor into its intermediate layers can perturb or even destroy its learned visual representations. Such modifications incur substantial additional training cost and offer no guarantee of recovering the original performance, making early in-ViT token compression a problem that demands careful design.

切片编码在一定程度上缓解了单次前向里注意力的膨胀, 但高分辨率本身仍会产生大量 token. 现有压缩方案, 如基于 MLP 的空间合并 [41, 28], Pixel-Shuffle 和各种 resampler [20, 1], 以及 token 剪枝 [3], 几乎全在 ViT 之后. 它们只减轻下游 LLM 的负担, 对编码器内部的沉重开销毫无作用. 要做到真正极致的效率, 必须直击瓶颈的根源: ViT 自身的计算. 直觉上, token 压缩必须挪进视觉编码器内部, 而且越早触发越好, 让绝大多数 ViT 层只处理少量 token. 但视觉编码器通常是预训练模型, 往它的中间层插一个随机初始化的压缩器, 可能扰乱甚至破坏它学到的视觉表示. 这类改动要付出大量额外训练, 而且不保证能恢复原有表现, 所以 ViT 内早期 token 压缩是一个需要仔细设计的问题.

To address the challenges above, we introduce a parameter-reuse early compressor: a window-attention block coupled with a downsampling MLP, both inserted into the shallow layers of the ViT and initialized by reusing the pretrained weights of their adjacent ViT layers. This warm start places the new module very close to the representation manifold of the original ViT from the very first training step, thereby avoiding any disruption to the learned visual representations. The module compresses the ViT’s tokens by 4× at a very early stage of the encoder, so that the vast majority of subsequent ViT layers operate on only a small fraction of the original token budget.

针对上述难点, 我们提出一个参数复用的早压缩器: 一个窗口注意力块加一个降采样 MLP, 两者都插在 ViT 浅层, 并用相邻 ViT 层的预训练权重初始化. 这种热启动让新模块从训练第一步起就非常贴近原 ViT 的表示流形, 从而不扰乱已学到的视觉表示. 该模块在编码器很早的阶段把 ViT 的 token 压缩 4 倍, 让后续绝大多数 ViT 层只处理原 token 预算的一小部分.

> **核对:** 「后续绝大多数 ViT 层」 到底是多少层? 能从本页算出 SigLIP 2 有几层吗?
> 插入点在第 7 页写明是 k = 6, 但全文没有给 SigLIP 2 的总层数 L, 也没写用的是哪个尺寸的 SigLIP 2. 能算的只有斜率: 表 5 里 k 从 3 到 6, 6 到 9 各多 328.0G, 9 到 15 多 655.9G, 每推后一层约多 109.3G, 这是 「一层在全分辨率跑」 和 「一层在四分之一 token 上跑」 的差价. 如果粗暴假设四分之一 token 的层正好花四分之一的算力, 全分辨率一层约 145.8G, 3555.1G 对应约 24 层; 注意力是二次方, 实际比例低于四分之一, 推出的层数会更多. 层数本页没给, 这个区间只能当量级参考.

Combining slice-based encoding with the proposed intra-ViT early compression, we obtain LLaVA-UHD v4, an efficient and compute-controllable visual encoding architecture for high-resolution MLLMs. Across eight standard benchmarks, LLaVA-UHD v4 matches or surpasses a post-ViT baseline at the same 16× compression ratio in overall downstream accuracy.

把切片编码和我们提出的 ViT 内早压缩结合, 就得到 LLaVA-UHD v4, 一个面向高分辨率 MLLM, 高效且算力可控的视觉编码架构. 在八个标准基准上, 同为 16 倍压缩率时, LLaVA-UHD v4 的整体下游准确率与 ViT 后压缩基线持平或更高.

Our main contributions are as follows: (1) We revisit the common practice of global encoding and demonstrate the advantages of slice-based encoding in preserving fine-grained details while circumventing the quadratic computational overhead. (2) Building on this insight, we identify the limitations of post-ViT token compression and propose a novel intra-ViT shallow-layer compression architecture that directly addresses the computational bottleneck of visual encoding. (3) Integrating these two designs, we propose LLaVA-UHD v4, which combines slice-based encoding with an early compressor and maintains competitive performance while achieving a 55.75% acceleration in visual encoding FLOPs.

主要贡献如下: (1) 重新审视全局编码这一常见做法, 证明切片编码在保住细粒度细节, 同时绕开二次方计算开销上的优势. (2) 在此基础上, 指出 ViT 后 token 压缩的局限, 提出一种新的 ViT 内浅层压缩架构, 直接处理视觉编码的算力瓶颈. (3) 把两项设计合在一起, 提出 LLaVA-UHD v4, 它把切片编码和早压缩器结合, 在视觉编码 FLOPs 上取得 55.75% 的加速, 同时保持有竞争力的表现.

## 2 Rethinking High-Resolution Visual Encoding (重新审视高分辨率视觉编码)

We begin with a controlled study of two design choices that are central to high-resolution MLLMs: (1) How high-resolution images are encoded before entering the ViT. (2) How visual tokens are compressed along the pipeline. For both questions, we default to SigLIP 2 [40] as the ViT backbone and Qwen3 [46] as the LLM, while fixing the training data and the total visual-token budget reaching the LLM, so that any observed difference is attributable solely to the dimension under study.

我们先对高分辨率 MLLM 的两个核心设计选择做对照研究: (1) 高分辨率图像在进入 ViT 之前怎么编码. (2) 视觉 token 在流水线上怎么压缩. 两个问题默认都用 SigLIP 2 [40] 作 ViT 主干, Qwen3 [46] 作 LLM, 并固定训练数据和到达 LLM 的视觉 token 总预算, 这样观察到的差异只能归因于被研究的那个维度.

### 2.1 Slice-based Encoding Outperforms Global Encoding (切片编码优于全局编码)

The community has converged on global encoding (GE) as the actual choice for high-resolution MLLMs [41, 28], on the intuitive grounds that feeding the full image to the ViT preserves complete global context and permits arbitrary patch-to-patch interaction. Slice-based encoding (SE) [14, 8], which partitions the image into smaller views encoded independently, is typically framed as a computational compromise, which sacrifices global context for tractable per-forward cost. In this section we test this framing directly: under matched compression and training conditions, which paradigm actually delivers better downstream accuracy?

社区已经把全局编码 (GE) 当作高分辨率 MLLM 的实际选择 [41, 28], 直觉理由是整图送进 ViT 能保住完整的全局上下文, 允许任意 patch 之间交互. 切片编码 (SE) [14, 8] 把图像切成较小的视图分别编码, 通常被看成一种算力上的妥协: 牺牲全局上下文, 换取可承受的单次前向开销. 本节直接检验这种说法: 在压缩和训练条件对齐时, 哪种范式的下游准确率真正更高?

<!-- page 3 of 18 -->

Table 1: Comparison of encoding strategies. We compare the two encoding strategies under different compression rates and data scales using SigLIP 2 as the ViT backbone. GE denotes global encoding and SE denotes slice-based encoding.

表 1: 编码策略对比. 以 SigLIP 2 作 ViT 主干, 在不同压缩率和数据规模下比较两种编码策略. GE 表示全局编码, SE 表示切片编码.

<table><tr><td>Data Scale</td><td>Method</td><td>MMMU</td><td>MathVista</td><td> $MMB_{EN}$ </td><td> $MMB_{CN}$ </td><td>MMStar</td><td>HallBench</td><td>AI2D</td><td>OCRBench</td><td>Avg.</td></tr><tr><td colspan="11">Compression Rate 4×</td></tr><tr><td rowspan="2">4M</td><td>GE</td><td>58.4</td><td>67.4</td><td>83.7</td><td>81.5</td><td>63.5</td><td>48.5</td><td>80.3</td><td>77.6</td><td>70.1</td></tr><tr><td>SE</td><td>61.9</td><td>66.7</td><td>82.9</td><td>79.5</td><td>62.3</td><td>49.1</td><td>80.5</td><td>82.0</td><td>70.6</td></tr><tr><td rowspan="2">8M</td><td>GE</td><td>60.4</td><td>71.4</td><td>84.4</td><td>83.5</td><td>65.4</td><td>49.3</td><td>82.5</td><td>80.0</td><td>72.1</td></tr><tr><td>SE</td><td>60.3</td><td>71.2</td><td>85.2</td><td>83.4</td><td>64.3</td><td>56.3</td><td>82.0</td><td>83.6</td><td>73.3</td></tr><tr><td colspan="11">Compression Rate 16×</td></tr><tr><td rowspan="2">4M</td><td>GE</td><td>58.4</td><td>62.7</td><td>80.3</td><td>81.9</td><td>60.4</td><td>47.7</td><td>78.5</td><td>72.0</td><td>67.7</td></tr><tr><td>SE</td><td>57.9</td><td>63.0</td><td>79.4</td><td>79.1</td><td>60.6</td><td>50.5</td><td>77.7</td><td>77.5</td><td>68.2</td></tr><tr><td rowspan="2">8M</td><td>GE</td><td>58.7</td><td>65.6</td><td>82.9</td><td>82.6</td><td>60.5</td><td>47.0</td><td>80.0</td><td>73.6</td><td>68.9</td></tr><tr><td>SE</td><td>58.6</td><td>67.3</td><td>83.7</td><td>82.3</td><td>62.9</td><td>51.2</td><td>79.8</td><td>79.1</td><td>70.6</td></tr></table>

> **看表:** 表 1 说 SE 「consistently」 优于 GE, 八列里每一列都是 SE 赢吗?
> 不是, 赢在平均分. 四组设置下 SE 的平均分都更高, 差距 0.5, 1.2, 0.5, 1.7, OCRBench 每组都领先 3.6 到 5.5, 和正文一致. 但 MMB<sub>CN</sub> 这一列四组全是 GE 更高: 81.5 对 79.5, 83.5 对 83.4, 81.9 对 79.1, 82.6 对 82.3. 4× 下 MathVista, MMStar 也是 GE 两组都赢. 所以 「consistently」 说的是八项平均, 单个基准有输有赢, 第 15 页 B.1 自己也写了 「individual benchmark outcomes remain mixed」.

**Setup.** The two paradigms share the ViT backbone, projector, LLM, and the post-ViT compressor, differing only in how the image is presented to the ViT. GE rescales the image to at most $N \times 448^{2}$ pixels and processes it in a single forward pass. SE decomposes the image into a thumbnail and a set of slices laid out by an aspect-ratio-aware best-grid policy. We sweep two compression ratios (4×, 16×) and two data scales (4M, 8M), and evaluate on the eight benchmarks. To comprehensively assess model performance, we conduct evaluations on a broad benchmark suite encompassing mathematics, OCR, and general VQA tasks.

**设置.** 两种范式共用 ViT 主干, 投影器, LLM 和 ViT 后压缩器, 只在图像怎样呈现给 ViT 上不同. GE 把图像等比调整到最多 $N \times 448^{2}$ 个像素, 一次前向处理完. SE 把图像拆成一张缩略图和一组切片, 切片按照一个考虑宽高比的最优网格策略排布. 我们扫两个压缩率 (4×, 16×) 和两个数据规模 (4M, 8M), 在八个基准上评测. 为了全面评估模型表现, 评测覆盖数学, OCR 和通用 VQA 等一大批基准.

> **拆开:** 「$N \times 448^{2}$」 里的 N 是什么? 是切片数吗?
> 这一处没有定义 N. md 里这个式子被 MinerU 转坏了, 对照 PDF 文字层是 「N × 448²」. 按字面读, GE 的像素上限是 N 个 448 × 448 方块, N 应是和 SE 的切片数对应的某个上限, 但本页没写 N 取多少, SE 一张图切几片也没写. 更容易混的是, 第 5, 6 页又用 N 表示 token 数 ($\frac{1}{16}N$, $\mathbf{X}_l \in \mathbb{R}^{N \times d}$), 同一个字母两种意思. 「每张图多少切片」 在全文都是空白, 这也决定了后面 「每切片 FLOPs」 换算不成 「每张图 FLOPs」.

**SE consistently outperforms GE, with larger gains at higher scales.** Table 1 reports the SigLIP-2-based comparison. Across all four settings, SE outperforms GE on average, with gains ranging from 0.5 to 1.7 points. The advantage also tends to increase with data scale, growing from 0.5 to 1.2 points under 4× compression and from 0.5 to 1.7 points under 16× compression. In the SigLIP-2 sweep, the SE margin increases from 4M to 8M under both compression ratios, suggesting that the observed benefit persists with additional supervision in this setting. In particular, the advantage is most pronounced on OCR-intensive tasks requiring fine-grained recognition, where SE leads GE by 3.6 to 5.5 points on OCRBench across the four SigLIP-2 settings.

**SE 稳定优于 GE, 规模越大优势越大.** 表 1 给出基于 SigLIP 2 的对比. 四组设置下 SE 的平均分都高于 GE, 差距 0.5 到 1.7 分. 优势还有随数据规模扩大的趋势: 4× 压缩下从 0.5 分涨到 1.2 分, 16× 压缩下从 0.5 分涨到 1.7 分. 在 SigLIP 2 这组扫描里, 两种压缩率下 SE 的领先幅度都从 4M 到 8M 变大, 说明在这个设定下, 加更多监督数据后收益依然存在. 优势在需要细粒度识别的 OCR 密集任务上最明显: 四组 SigLIP 2 设置里, OCRBench 上 SE 领先 GE 3.6 到 5.5 分.

**Robustness.** To ensure that the observed advantage of SE is not attributable to a specific backbone or slicing configuration, we conduct two stress tests under more demanding conditions, with average accuracy reported in Table 2. First, we replace SigLIP 2 with MoonViT [39, 38], a ViT explicitly pretrained on native-resolution inputs, where SE retains an average margin of approximately +1.5 points across both 8M and 16M data scales, indicating that its effectiveness generalizes across visual encoders. Second, under the 16×/8M setting, we adopt an alternative slicing schedule with a fourfold larger slice budget, which preserves higher per-image resolution and exposes the encoder to substantially more high-resolution visual tokens. Under this more demanding slicing configuration, the margin further widens to more than +2 points on average, with substantially larger gains on OCR-intensive tasks. Taken together, these results suggest that, under the resolution settings considered, the benefit of SE increases with input resolution and exhibits no evidence of saturation. Per-benchmark results for both stress tests are provided in Table A1.

**稳健性.** 为了确认 SE 的优势不是某个特定主干或切片配置带来的, 我们在更苛刻的条件下做了两项压力检验, 平均准确率见表 2. 第一, 把 SigLIP 2 换成 MoonViT [39, 38], 一个明确在原生分辨率输入上预训练的 ViT. 8M 和 16M 两个数据规模下 SE 平均仍领先约 +1.5 分, 说明它的效果能推广到其他视觉编码器. 第二, 在 16×/8M 设置下改用另一种切片方案, 切片预算扩大到四倍, 每张图保留更高分辨率, 让编码器看到多得多的高分辨率视觉 token. 在这种更苛刻的切片配置下, 平均领先进一步扩大到 +2 分以上, OCR 密集任务上的提升更大. 综合来看, 在所考察的分辨率设定内, SE 的收益随输入分辨率增加, 看不到饱和迹象. 两项压力检验的逐基准结果见表 A1.

Table 2: Robustness of slice-based encoding. Average accuracy under (i) an alternative vision encoder backbone and (ii) a higher-resolution slicing schedule, both at compression rate 16×.

表 2: 切片编码的稳健性. 在 (i) 换一个视觉编码器主干, (ii) 更高分辨率的切片方案下的平均准确率, 压缩率都是 16×.

<table><tr><td>Setting</td><td>Scale</td><td>GE</td><td>SE</td></tr><tr><td rowspan="2">MoonViT</td><td>8M</td><td>70.3</td><td>71.6</td></tr><tr><td>16M</td><td>72.2</td><td>73.6</td></tr><tr><td>Higher-Res</td><td>8M</td><td>68.8</td><td>71.0</td></tr></table>

> **确认:** MoonViT 那两行真的是 「约 +1.5」 吗?
> 按表 2 算是 71.6 − 70.3 = 1.3, 73.6 − 72.2 = 1.4, 两者平均约 1.35. 用表 A1 未四舍五入的八项平均算, 是 71.562 − 70.250 = 1.31 和 73.550 − 72.225 = 1.33. 两种算法都不到 1.5, 「approximately +1.5」 偏宽松. 高分辨率切片那一行 71.0 − 68.8 = 2.2, 「more than +2」 成立. 另外高分辨率这组只有 8M 一个规模, 「no evidence of saturation」 是从一个点推出来的.

**Finding 1.** Slice-based encoding consistently matches or outperforms global encoding across different compression rates, vision encoder backbones, and image resolutions.

**发现 1.** 在不同压缩率, 视觉编码器主干和图像分辨率下, 切片编码稳定地与全局编码持平或更好.

**Analysis.** Across different backbones and slicing schedules, slice-based encoding (SE) consistently matches or outperforms global encoding (GE). We attribute this to a difference in inductive bias: SE preserves locality by decomposing the image into spatially coherent views, allowing the encoder to focus its capacity on fine-grained patterns within each slice, whereas GE processes the entire image jointly, forcing local details to compete with global context under a fixed token budget. A more detailed analysis is provided in Appendix B.1.

**分析.** 在不同主干和切片方案下, 切片编码 (SE) 稳定地与全局编码 (GE) 持平或更好. 我们把原因归到归纳偏置的差别: SE 把图像拆成空间上连贯的视图, 保住了局部性, 让编码器把容量集中在每个切片内的细粒度模式上; GE 则把整张图一起处理, 在固定 token 预算下迫使局部细节和全局上下文互相争抢. 更详细的分析见附录 B.1.

<!-- page 4 of 18 -->

### 2.2 Compressing Visual Tokens at High Resolution (高分辨率下压缩视觉 token)

Slice-based encoding (Section 2.1) provides a stronger input pipeline, yet each high-resolution image still produces a large number of visual tokens that must be compressed before entering the LLM. These are conventionally compressed by a connector module placed between the ViT and the LLM. We address two questions about this scheme. First, which connector design performs best? Second, is this post-ViT compression sufficient enough at high resolution?

切片编码 (2.1 节) 提供了更强的输入流水线, 但每张高分辨率图像仍会产生大量视觉 token, 进入 LLM 之前必须压缩. 惯例是用 ViT 和 LLM 之间的连接器模块来压缩. 关于这个方案我们回答两个问题. 第一, 哪种连接器设计最好? 第二, 在高分辨率下, 这种 ViT 后压缩够不够?

**Setup.** Two families dominate the connector designs. Query-based resamplers [2, 1, 20] attend a small set of learnable queries to the ViT output via cross-attention. Spatial-merging MLPs [23, 8] fold neighboring patch tokens via pixel-unshuffle and project them through a lightweight feedforward network. We first compare both under matched conditions, sharing the ViT backbone, LLM, training recipe, slice-based encoding, and target token counts at 4× and 16× compression. Both are evaluated on the eight benchmarks of Section 2.1 across multiple data scales.

**设置.** 连接器设计主要有两类. 基于查询的 resampler [2, 1, 20] 用一小组可学习查询通过交叉注意力去读 ViT 输出. 空间合并 MLP [23, 8] 用 pixel-unshuffle 把相邻 patch token 折叠在一起, 再过一个轻量前馈网络投影. 我们先在对齐条件下比较两者: 共用 ViT 主干, LLM, 训练配方, 切片编码, 以及 4× 和 16× 压缩下的目标 token 数. 两者都在 2.1 节的八个基准上, 按多个数据规模评测.

Table 3: Connector comparison.

表 3: 连接器对比.

<table><tr><td>Downsampling</td><td>Scale</td><td>Resampler</td><td>MLP</td></tr><tr><td rowspan="2">4×</td><td>4M</td><td>65.51</td><td>69.10</td></tr><tr><td>8M</td><td>64.80</td><td>71.73</td></tr><tr><td rowspan="3">16×</td><td>4M</td><td>65.87</td><td>66.64</td></tr><tr><td>8M</td><td>67.66</td><td>68.84</td></tr><tr><td>16M</td><td>70.39</td><td>70.81</td></tr></table>

**MLP outperforms resampler.** Table 3 reports the comparison results. The MLP connector outscores the resampler across all configurations, with the largest margins at lower compression ratios where it leads by +3.3 to +6.7 points at 4×. We further observe that the gap narrows as the compression ratio tightens and training data scales up, falling to +0.4 points at 16× compression with 16M training data, though MLP retains its lead in every cell.

**MLP 优于 resampler.** 表 3 给出对比结果. MLP 连接器在所有配置下都高于 resampler, 压缩率较低时差距最大, 4× 下领先 +3.3 到 +6.7 分. 我们还观察到, 压缩率收紧, 训练数据增加时差距缩小, 16× 压缩配 16M 训练数据时降到 +0.4 分, 不过每一格 MLP 都保持领先.

> **回看:** 按表 3 算, 4× 下 MLP 领先 69.10 − 65.51 = 3.59 和 71.73 − 64.80 = 6.93, 正文却写 +3.3 到 +6.7, 哪个对?
> 正文的数来自第 16 页表 A4, 不是表 3. 表 A4 的平均分是 67.3 对 70.6, 66.6 对 73.3, 差 3.3 和 6.7. 两张表本该是同一批实验, 数却不一样: 表 3 的十个平均分全部比表 A4 低 1.51 到 1.80, 比如 4×/4M 的 MLP, 表 3 是 69.10, 表 A4 是 70.6, 而表 1 同一设置的 SE 也是 70.6. 我用表 A4 的八列逐个组合试过, 没有哪个基准子集能同时凑出表 3 的十个数. 表 A4, 表 1 和表 A2 互相对得上, 表 3 这套平均分的口径本页没交代. 只有 16×/16M 的 +0.4 在两张表里一致 (70.81 − 70.39 = 0.42, 72.5 − 72.1 = 0.4).

**Finding 2.** Pixel-unshuffle-based MLP downsampling provides a stronger post-ViT compression baseline than query-based resampler.

**发现 2.** 基于 pixel-unshuffle 的 MLP 降采样, 作为 ViT 后压缩基线, 比基于查询的 resampler 更强.

**Analysis.** Pixel-unshuffle strictly preserves spatial structure by mapping each k × k ViT patch group into one token with concatenated channels, maintaining a coarse 2D layout. In contrast, the resampler uses content-agnostic learnable queries with global attention, discarding explicit spatial correspondence. The decisive factor is therefore not capacity (the resampler in fact uses more parameters at lower compression yet still loses by the largest margins) but whether spatial priors are built-in or must be learned. A more detailed analysis is provided in Appendix B.2.

**分析.** Pixel-unshuffle 把每个 k × k 的 ViT patch 组映射成一个通道拼接的 token, 严格保住空间结构, 维持粗粒度的二维布局. 相比之下, resampler 用与内容无关的可学习查询做全局注意力, 丢掉了显式的空间对应. 所以决定性因素不是容量 (低压缩率下 resampler 实际参数更多, 却输得最多), 而是空间先验是内置的还是要靠学出来. 更详细的分析见附录 B.2.

> **停一下:** 括号里说低压缩率下 resampler 参数更多, 多多少?
> 本页没给. 全文没有任何一张表列出连接器的参数量, resampler 的查询数, 层数, 宽度也都没写, MLP 连接器的隐藏维度同样没写. 这句 「容量不是决定因素」 的论据只有这一句括号, 读者没法核对. 另外这里的 k × k 是 patch 分组边长, 和第 6 页插入深度的 k 是两个意思.

Together, Findings 1 and 2 establish slice-based encoding combined with an MLP connector as an effective baseline. However, because this token reduction occurs only after the vision encoder, it merely relieves the downstream LLM while leaving the ViT’s massive internal compute entirely unchanged. To overcome this structural bottleneck, compression must be shifted inside the ViT pipeline. We detail the structure of our proposed intra-ViT compressor in Section 3.

发现 1 和发现 2 合起来, 确立了 「切片编码 + MLP 连接器」 这个有效基线. 但由于 token 削减只发生在视觉编码器之后, 它只减轻了下游 LLM, ViT 内部巨大的计算量原封不动. 要突破这个结构性瓶颈, 压缩必须挪进 ViT 流水线内部. 我们在第 3 节详细介绍所提出的 ViT 内压缩器的结构.

## 3 LLaVA-UHD v4

In this section, we answer the design questions raised at the end of Section 2.2 and introduce LLaVA-UHD v4. It builds on the slice-based encoding and MLP connector established in Section 2 and adds an intra-ViT early compressor D. We describe the end-to-end architecture in Section 3.1, and introduce the design principles, structure, and parameter-reuse initialization in Section 3.2.

本节回答 2.2 节末提出的设计问题, 介绍 LLaVA-UHD v4. 它建立在第 2 节确立的切片编码和 MLP 连接器之上, 再加一个 ViT 内早压缩器 D. 3.1 节描述端到端架构, 3.2 节介绍设计原则, 结构和参数复用初始化.

### 3.1 Overview (总览)

Figure 1 shows the full pipeline. Following Finding 1, the input image is decomposed into a low-resolution thumbnail and a small set of high-resolution slices selected by an aspect-ratio-aware policy.

图 1 展示完整流水线. 按照发现 1, 输入图像被拆成一张低分辨率缩略图和一小组高分辨率切片, 切片由考虑宽高比的策略选出.

<!-- page 5 of 18 -->

![图 1: 高分辨率编码范式对比. 左栏 (a) 以往工作: 文档页和风景长图整张送进 Vision Transformer, 各层 token 数不变, 只在最后的 Connector 压缩; 中栏 (b) LLaVA-UHD v4: 图像按虚线切成网格切片加缩略图, 进入带压缩器的 ViT, 第一个 Transformer Block 之后经 4x Compressor, 后续层 token 变为四分之一, 最后 Connector 输出 1 个 token; 右栏 (c) 压缩器结构: token 按 2x2 分组, 过 Window Self-Attention & FFN, 再经 Pixel Unshuffle & MLP 每组合成 1 个 token](images/p05-figure-1-comparison-of-high-resolution-mllm-encoding.png)

Figure 1: Comparison of high-resolution MLLM encoding paradigms. (a) Previous works feed the full image into the ViT under global encoding and reduce visual tokens only at the post-ViT connector. (b) Our work, LLaVA-UHD v4, adopts slice-based encoding and introduces an intra-ViT compression module D that reduces token count early in the vision encoder. D performs local window attention followed by pixel unshuffle and MLP-based fusion, enabling later layers to operate on fewer tokens. Compared to (a), this design substantially lowers ViT-internal compute, supports more aggressive compression ratios, and incurs nearly no performance loss.

图 1: 高分辨率 MLLM 编码范式对比. (a) 以往工作用全局编码把整张图送进 ViT, 只在 ViT 后的连接器处削减视觉 token. (b) 我们的工作 LLaVA-UHD v4 采用切片编码, 并引入 ViT 内压缩模块 D, 在视觉编码器的早期就减少 token 数. D 先做局部窗口注意力, 再做 pixel unshuffle 和基于 MLP 的融合, 让后面的层处理更少的 token. 与 (a) 相比, 这种设计大幅降低 ViT 内部计算量, 支持更激进的压缩率, 且几乎没有表现损失.

> **再看:** 图 1(c) 里压缩器写的是 「Window Self-Attention & FFN」 再接 「Pixel Unshuffle & MLP」, D 里到底有没有一个单独的 FFN?
> 按正文没有. 3.2.1 节说 D 只有两步: 窗口注意力块, 然后 PixelUnshuffle 加 MLP 融合; 3.2.2 节列出的参数部件也只有三样: 窗口注意力子块, 融合 MLP, 两个 LayerNorm. 那个 MLP 是用第 k 层 FFN 的权重拼出来的, 所以 FFN 的角色其实落在 unshuffle 之后. 图 (c) 把 FFN 画在 unshuffle 之前, 像是多了一个部件. 读结构以正文和公式为准. 图 (b) 里 4x Compressor 画在第一个 Transformer Block 之后, 也只是示意, 实际插在第 6 层之后.

All views are rescaled and concatenated along the sequence dimension, and processed in a single ViT forward pass that preserves per-view attention locality.

所有视图调整尺寸后沿序列维拼接, 在一次 ViT 前向中处理, 注意力保持在各自视图内部.

We then adopt SigLIP 2 [40] as the visual backbone and insert an intra-ViT compression module D. D reduces the token sequence length via local window-attention followed by a lightweight MLP, after which the compressed sequence is processed by the remaining ViT layers at the reduced token count. The detailed design and initialization of D are described in Section 3.2.

接着我们用 SigLIP 2 [40] 作视觉主干, 插入 ViT 内压缩模块 D. D 先做局部窗口注意力, 再过一个轻量 MLP, 缩短 token 序列, 压缩后的序列以较少的 token 数交给剩下的 ViT 层处理. D 的详细设计和初始化见 3.2 节.

Following Finding 2, the compressed encoder output passes through an MLP-based connector that further reduces the token count and projects the visual features into the language model space. The two compression stages, intra-ViT D and post-ViT MLP, jointly produce a substantial token reduction from raw visual patches to LLM input.

按照发现 2, 压缩后的编码器输出再经过一个基于 MLP 的连接器, 进一步减少 token 数, 并把视觉特征投影到语言模型空间. ViT 内的 D 和 ViT 后的 MLP 两级压缩合起来, 让原始视觉 patch 到 LLM 输入之间的 token 数大幅下降.

Ultimately, this two-stage compression reduces the final LLM token count to $\frac { 1 } { 1 6 } N$ . More importantly, by inserting D early in the encoder, the majority of ViT layers process only a quarter of the raw patches, fundamentally slashing visual-encoding FLOPs. Since D is the only modification to the baseline validated in Section 2, we directly evaluate its efficiency-quality trade-off in Section 4.

最终, 两级压缩把送进 LLM 的 token 数降到 $\frac { 1 } { 1 6 } N$. 更重要的是, D 插在编码器早期, 大多数 ViT 层只处理原始 patch 的四分之一, 从根本上削减视觉编码 FLOPs. 由于 D 是相对第 2 节验证过的基线的唯一改动, 我们在第 4 节直接评估它在效率和质量之间的取舍.

### 3.2 Early In-ViT Token Compression (ViT 内早期 token 压缩)

We first focus on determining the structure and initialization of the intra-ViT compressor D. We must decide where in the ViT to insert it, how to structure its internal computation, and how to initialize it without disrupting the surrounding pretrained representation.

我们先确定 ViT 内压缩器 D 的结构和初始化. 要决定三件事: 插在 ViT 的哪里, 内部计算怎么组织, 怎么初始化才不扰乱周围的预训练表示.

Three design principles guide our answers.

三条设计原则指导我们的回答.

**(P1) Compression should reduce the ViT’s own compute, not only the LLM’s.** Post-ViT compression leaves every encoder layer’s cost unchanged, as all tokens traverse the full ViT before any reduction. We therefore embed D inside the encoder, so that all subsequent layers operate at the reduced token count.

**(P1) 压缩应减少 ViT 自身的计算, 而不只是 LLM 的.** ViT 后压缩让每个编码器层的开销保持不变, 因为所有 token 都要走完整个 ViT 才开始削减. 所以我们把 D 嵌进编码器, 让之后所有层都在减少后的 token 数上运行.

<!-- page 6 of 18 -->

**(P2) The compressor should sit as early as possible, balanced against representational depth.** Earlier insertion maximizes savings, while deeper placement retains more pretrained processing at full resolution and better aligns with the downstream representation manifold. Our ablations (Section 4.3) identify $k { = } 6$ as the best efficiency-quality trade-off.

**(P2) 压缩器应尽量靠前, 但要和表示深度权衡.** 插得越早省得越多; 插得越深, 全分辨率下保留的预训练处理越多, 也越贴合下游的表示流形. 我们的消融 (4.3 节) 表明 $k { = } 6$ 是效率和质量的最佳平衡点.

**(P3) Inserting D must not disrupt the pretrained representation manifold.** A pretrained ViT is tightly calibrated, with each layer expecting the distribution produced by its predecessor. A randomly initialized D would perturb this distribution and turn fine-tuning into the harder problem of recovering the pretrained manifold from scratch. We therefore initialize D by reusing the parameters of the preceding ViT layer (Section 3.2.2), so that fine-tuning begins on the manifold rather than searching for it.

**(P3) 插入 D 不能扰乱预训练表示流形.** 预训练的 ViT 校准得很紧, 每一层都预期前一层产生的那种分布. 随机初始化的 D 会扰乱这个分布, 把微调变成 「从零找回预训练流形」 这个更难的问题. 所以我们复用前一个 ViT 层的参数来初始化 D (3.2.2 节), 让微调从流形上出发, 而不是去找它.

Together, these three principles fix D’s placement and initialization strategy. It remains to specify the internal computation of D and the precise weight-inheritance mechanism, which we address in the rest of this section.

三条原则合起来确定了 D 的位置和初始化策略. 剩下要说明的是 D 的内部计算和精确的权重继承机制, 放在本节余下部分.

#### 3.2.1 Window-Attention Downsampling Module (窗口注意力降采样模块)

The pretrained ViT consists of L transformer layers operating on token sequences $\mathbf { X } _ { l } \in \mathbb { R } ^ { N \times d }$ . We insert a downsampling module D between layers k and $k { + } 1$ . The module takes $\mathbf { X } _ { k }$ as input and produces a compressed sequence $\widetilde { \mathbf { X } }   \in   \mathbb { R } ^ { N / 4 \times d }$ , after which the remaining layers operate at the reduced token resolution. The module D consists of two conceptual steps: (i) a window-attention block that enriches local context, and (ii) a downsample-and-fuse block that reduces spatial resolution while aggregating information.

预训练 ViT 由 L 个 transformer 层组成, 作用在 token 序列 $\mathbf { X } _ { l } \in \mathbb { R } ^ { N \times d }$ 上. 我们在第 k 层和第 $k { + } 1$ 层之间插入降采样模块 D. 它以 $\mathbf { X } _ { k }$ 为输入, 输出压缩序列 $\widetilde { \mathbf { X } }   \in   \mathbb { R } ^ { N / 4 \times d }$, 之后剩下的层在降低后的 token 分辨率上运行. D 在概念上分两步: (i) 一个丰富局部上下文的窗口注意力块; (ii) 一个降采样加融合块, 在降低空间分辨率的同时聚合信息.

**Window attention.** We first apply a window attention operator $\mathrm{WinAttn_{2 \times 2}}$ on $\mathbf { X } _ { k }$ , producing an intermediate representation Y. The attention is restricted to non-overlapping $2 \times 2$ windows, so each token interacts only with its three spatial neighbors. This design ensures that tokens exchange information exactly within the region that will be merged in the next step.

**窗口注意力.** 先对 $\mathbf { X } _ { k }$ 施加窗口注意力算子 $\mathrm{WinAttn_{2 \times 2}}$, 得到中间表示 Y. 注意力限制在互不重叠的 $2 \times 2$ 窗口里, 每个 token 只和它的三个空间邻居交互. 这样设计保证 token 恰好在下一步要合并的区域内交换信息.

**Downsample and fuse.** A $2 \times 2$ PixelUnshuffle operation directly reshapes Y into $\mathbf { Z } \in \mathbb { R } ^ { N / 4 \times 4 d }$ . An MLP then fuses these concatenated channels back to dimension $d ,$ yielding the final output $\widetilde { \mathbf { X } }$

**降采样与融合.** 一个 $2 \times 2$ 的 PixelUnshuffle 操作直接把 Y 重排成 $\mathbf { Z } \in \mathbb { R } ^ { N / 4 \times 4 d }$. 然后一个 MLP 把这些拼接的通道融合回 $d$ 维, 得到最终输出 $\widetilde { \mathbf { X } }$.

This design cleanly separates local context aggregation from information-preserving downsampling and channel fusion, while keeping the module compatible with the pretrained ViT stack.

这个设计把局部上下文聚合, 与保信息的降采样和通道融合干净地分开, 同时让模块和预训练 ViT 的层堆叠兼容.

#### 3.2.2 Parameter-Reuse Initialization (参数复用初始化)

The downsampling module D introduces three parameterized components: the window-attention sub-block, the fused MLP $(\mathbf { W } _ { 1 } , \phi , \mathbf { W } _ { 2 } )$ , and the two LayerNorms. A standard random initialization would inject substantial noise into the encoder’s intermediate representations. In practice, this perturbation lengthens fine-tuning and is not guaranteed to recover the pretrained ViT’s effective representation manifold at all.

降采样模块 D 引入三个带参数的部件: 窗口注意力子块, 融合 MLP $(\mathbf { W } _ { 1 } , \phi , \mathbf { W } _ { 2 } )$, 以及两个 LayerNorm. 标准的随机初始化会往编码器的中间表示里注入大量噪声. 实践中这种扰动会拉长微调, 而且根本不保证能找回预训练 ViT 的有效表示流形.

We instead initialize D entirely from the weights of the pretrained ViT layer k that immediately precedes it. This parameter reuse serves two purposes: it eliminates randomly-initialized parameters from the encoder’s compute path entirely, and, as we make precise below, it places D at $t = 0$ in close functional correspondence to a surrogate operation derived from layer k itself, so that fine-tuning starts on or near the pretrained representation manifold. We initialize D as follows:

我们改为完全用紧挨在 D 前面的预训练第 k 层的权重来初始化 D. 这种参数复用有两个用处: 编码器计算路径上彻底没有随机初始化的参数; 并且, 如下文所精确说明的, 它让 D 在 $t = 0$ 时在功能上紧密对应一个由第 k 层自身导出的替代运算, 于是微调从预训练表示流形上或其附近开始. D 的初始化如下:

> **对一下:** D 用第 k 层的权重初始化, 又插在第 k 层之后, 那 t = 0 时 D 等于什么都不做吗?
> 不等于恒等映射. 按下面三条, 初始的 D 相当于 「把第 k 层在 2 × 2 窗口内再跑一遍, 然后四个位置取平均」: 注意力权重照搬第 k 层, 只加了窗口掩码; MLP 相当于对四个 token 各跑一次第 k 层的 FFN 再平均; 残差是四个输入的平均池化. 所以正文说的是 「对应一个替代运算 (surrogate operation)」, 不是 「对应原网络」. 后续第 k+1 层收到的是 「第 k 层重复一次后再平均池化」 的特征, 和它预训练时见过的输入仍有分布差别, 这正是后面还要微调的原因.

**Window attention.** The attention projections, head configuration, and $\mathrm { L N _ { 1 } }$ are copied directly from layer k. The only modification is the $2 \times 2$ window mask, which restricts attention to local neighborhoods while preserving the original attention weights.

**窗口注意力.** 注意力投影, 头配置和 $\mathrm { L N _ { 1 } }$ 直接从第 k 层复制. 唯一的改动是 $2 \times 2$ 窗口掩码, 把注意力限制在局部邻域, 同时保留原来的注意力权重.

**Fused MLP.** We construct the MLP to mimic applying the FFN of layer k independently to each of the four patches within a $2 \times 2$ window, followed by averaging. Concretely,

**融合 MLP.** 我们构造的 MLP 模拟这样的运算: 对 $2 \times 2$ 窗口里的四个 patch 各自独立地套用第 k 层的 FFN, 再取平均. 具体地,

$$
\mathbf {W} _ {1} = \text {BlockDiag} (\mathbf {F} _ {1} ^ {(k)}, \mathbf {F} _ {1} ^ {(k)}, \mathbf {F} _ {1} ^ {(k)}, \mathbf {F} _ {1} ^ {(k)}), \quad \mathbf {W} _ {2} = \frac {1}{4} [ \mathbf {F} _ {2} ^ {(k)} \mid \mathbf {F} _ {2} ^ {(k)} \mid \mathbf {F} _ {2} ^ {(k)} \mid \mathbf {F} _ {2} ^ {(k)} ].
$$

The bias follows the original FFN and is not scaled, so that the fused output corresponds to averaging four FFN branches while preserving the bias magnitude.

偏置沿用原 FFN, 不乘 1/4, 这样融合输出正好对应四个 FFN 分支的平均, 同时保持偏置的量级.

> **想:** 这套构造真能让融合 MLP 的输出严格等于 「四个 FFN 各算一遍再平均」 吗?
> MLP 这一段是严格相等的: 块对角的 $\mathbf{W}_1$ 让四个 d 维片段各自乘 $\mathbf{F}_1^{(k)}$, 逐元素激活 φ 不跨片段混合, $\mathbf{W}_2$ 把四段各乘 $\mathbf{F}_2^{(k)}$ 后相加再乘 1/4, 第二层偏置加一次, 正好等于四个 (FFN 输出 + 偏置) 的平均. 不严格的是前面的 $\mathrm{LN_2}$: 下一页说它在拼接后的 4d 特征上做, 均值和方差是四个 token 合在一起算的, 而原 FFN 前的 LayerNorm 是每个 token 在自己的 d 维上算. 四个 token 统计量不同时, 两者不相等. 这是正文用 「close functional correspondence」 而不说 「equal」 的一个具体原因.

<!-- page 7 of 18 -->

![图 2 左: 平均分随训练数据规模变化的折线图, 横轴 4M 到 64M, Post-ViT 依次为 68.2, 70.6, 72.5, 74.2, 76.2, 本文方法依次为 67.4, 70.7, 73.1, 73.5, 75.6](images/p07-chart.png)

![图 2 右: FLOPs 对比柱状图, Post-ViT 为 3555.1, 本文方法为 1573.1, 纵轴未标单位](images/p07-figure-2-average-performance-and-computational-cost.png)

Figure 2: Average performance and computational cost. Left: average accuracy across training data scales, comparing LLaVA-UHD v4 and the post-ViT baseline. Right: FLOPs comparison between the two systems.

图 2: 平均表现与计算开销. 左: 不同训练数据规模下的平均准确率, 比较 LLaVA-UHD v4 和 ViT 后压缩基线. 右: 两套系统的 FLOPs 对比.

**LayerNorm and residual.** $\mathrm { L N _ { 2 } }$ is applied over the concatenated 4d features with tiled affine parameters, and the residual branch is implemented as a parameter-free $2 \times 2$ average pooling.

**LayerNorm 与残差.** $\mathrm { L N _ { 2 } }$ 作用在拼接后的 4d 特征上, 仿射参数平铺四份; 残差分支用一个无参数的 $2 \times 2$ 平均池化实现.

## 4 Experiment (实验)

We empirically validate the design of LLaVA-UHD v4 through controlled comparisons against the best-performing configuration from the pilot study (slice-based encoding with a 16× post-ViT MLP compressor, hereafter the post-ViT baseline). Section 4.1 describes the setup, Section 4.2 reports the main quality-efficiency results across training data scales, and Section 4.3 analyzes the key design choices of the intra-ViT compressor.

我们通过对照比较来实证 LLaVA-UHD v4 的设计, 对照对象是前期研究中表现最好的配置 (切片编码加 16× 的 ViT 后 MLP 压缩器, 下文称 ViT 后基线). 4.1 节描述设置, 4.2 节报告不同训练数据规模下质量与效率的主结果, 4.3 节分析 ViT 内压缩器的关键设计选择.

### 4.1 Experimental Setup (实验设置)

**Architecture.** Unless otherwise stated, LLaVA-UHD v4 uses SigLIP 2 [40] as the vision encoder and Qwen3-8B [46] as the language model. The intra-ViT compression module D is inserted after layer $k   =   6$ and reduces the per-slice token count by 4×. A post-ViT MLP compressor further downsamples by 4×, yielding an end-to-end 16× reduction. Unless otherwise stated, the FLOPs are computed for processing a single slice through the ViT, i.e., the visual-encoding cost per input slice.

**架构.** 除非另有说明, LLaVA-UHD v4 用 SigLIP 2 [40] 作视觉编码器, Qwen3-8B [46] 作语言模型. ViT 内压缩模块 D 插在第 $k = 6$ 层之后, 把每个切片的 token 数减少 4 倍. ViT 后 MLP 压缩器再降采样 4 倍, 端到端共 16 倍. 除非另有说明, FLOPs 按单个切片过一遍 ViT 计算, 即每个输入切片的视觉编码开销.

> **问:** FLOPs 按 「单个切片」 算, 那一张图, 或者整个模型一次推理省了多少?
> 本页算不出来. 一张图切几片, 缩略图算不算一片, 都没写, 所以每切片的 3555.1G 对 1573.1G 乘不出每张图的数. 更要紧的是, 两套系统最后都是 16 倍压缩, 送进 Qwen3-8B 的视觉 token 数一样, LLM 那一侧的计算完全没变. 55.75% 只是 ViT 这一段的节省, 算上 LLM 后整机节省的比例会更小, 小多少取决于 LLM 处理的总 token 数, 本页没有给.

**Training.** We follow a four-stage recipe: (i) Vision-language alignment on large-scale image-text pairs, updating only the projector and D; (ii) Knowledge injection via OCR, document, and chart data with only ViT unfrozen; (iii) Interleaved training on image-text sequences for multi-image and long-context reasoning; and (iv) Supervised instruction tuning on a diverse mixture of general VQA, math, and conversational tasks. Detailed hyperparameters are in Appendix C.

**训练.** 我们采用四阶段配方: (i) 在大规模图文对上做视觉语言对齐, 只更新投影器和 D; (ii) 用 OCR, 文档和图表数据做知识注入, 只解冻 ViT; (iii) 在图文交错序列上训练, 面向多图和长上下文推理; (iv) 在通用 VQA, 数学和对话任务的多样混合数据上做有监督指令微调. 详细超参数见附录 C.

> **核对:** 第 (i) 阶段说只更新投影器和 D, 附录表 A7 第 1 阶段的可训练模块写的是什么?
> 表 A7 (自有数据) 第 1 阶段写 「ViT / Connector」, 表 A8 (LLaVA-OneVision 数据) 第 1 阶段也是 「ViT / Connector」. D 在 ViT 里面, 所以 「ViT」 可能指的就是 D, 也可能指整个 ViT 都解冻, 表里分不出来. 第 (ii) 阶段 「只解冻 ViT」 和表 A7 的 「ViT」 一致, 但表 A8 第 2 阶段是 「Full」. 另外第 17 页附录 C 的文字说两套配方是 「warmup, 高质量图像训练, 有监督指令微调」 三段, 和这里的四阶段, 以及表里的四行对不齐, 第 (iii) 阶段交错训练在附录文字里没有出现.

**Benchmarks.** We evaluate on eight benchmarks covering three capability dimensions: (i) general VQA: MMBench<sub>EN</sub> [26], MMBench<sub>CN</sub> [26], MMStar [7]; (ii) knowledge & reasoning: MMMU [50], MathVista [29], AI2D [19], HallusionBench [13]; (iii) fine-grained perception: OCRBench [27].

**基准.** 我们在八个基准上评测, 覆盖三个能力维度: (i) 通用 VQA: MMBench<sub>EN</sub> [26], MMBench<sub>CN</sub> [26], MMStar [7]; (ii) 知识与推理: MMMU [50], MathVista [29], AI2D [19], HallusionBench [13]; (iii) 细粒度感知: OCRBench [27].

### 4.2 Main Results (主结果)

**Intra-ViT early compression matches the post-ViT baseline in accuracy while substantially reducing visual-encoding cost.** As shown in Figure 2 and Figure 3, we compare LLaVA-UHD v4 against the strongest post-ViT baseline under identical training settings and a shared end-to-end 16× compression ratio. By shifting a 4× compression stage inside the ViT, all subsequent layers operate on only 25% of the original tokens. This structurally reduces visual-encoding FLOPs from 3555G to 1573G, a massive 55.75% reduction. Despite this aggressive early compression, LLaVA-UHD v4 performs within ±0.8 points of the baseline across all five training scales, with a negligible mean deviation of only −0.29 points. This demonstrates that our intra-ViT design yields massive compute savings without compromising downstream accuracy.

**ViT 内早压缩在准确率上与 ViT 后基线持平, 同时大幅降低视觉编码开销.** 如图 2 和图 3 所示, 我们在完全相同的训练设置和共同的端到端 16× 压缩率下, 把 LLaVA-UHD v4 和最强的 ViT 后基线对比. 把一级 4× 压缩挪进 ViT 之后, 后续所有层只处理原 token 的 25%. 这从结构上把视觉编码 FLOPs 从 3555G 降到 1573G, 降幅达 55.75%. 尽管早压缩很激进, LLaVA-UHD v4 在全部五个训练规模上都与基线相差不超过 ±0.8 分, 平均偏差只有 −0.29 分, 可以忽略. 这说明我们的 ViT 内设计在不损害下游准确率的前提下省下了大量计算.

> **看表:** 平均偏差 −0.29 能从表 A2 复算出来吗? 「±0.8」 又是哪一格?
> 用表 A2 印出的一位小数平均分, 五个规模的差分别是 −0.8 (4M), +0.1 (8M), +0.6 (16M), −0.7 (32M), −0.6 (64M), 平均 −0.28, 比正文少 0.01, 可能正文是用未四舍五入的平均分算的. 「±0.8」 实际只碰到负的一侧, 就是 4M 那一格的 −0.8; 正向最大只有 +0.6. 五个规模里三个落后, 两个领先, 所以 「matches or surpasses」 更准确的读法是 「差距在 1 分以内, 略偏落后」.

<!-- page 8 of 18 -->

![图 3(a): AI2D 分数随训练数据规模变化, 4M 到 64M, Post-ViT 从 77.7 到 84.7, 本文方法从 76.6 到 84.9, 8M 和 16M 本文方法略高](images/p08-a-ai2d.png)

![图 3(b): MMBench 英文分数随训练数据规模变化, Post-ViT 从 79.4 到 87.0, 本文方法从 78.6 到 86.2, 五个规模本文方法都略低](images/p08-b-mmbench-sub-en-sub.png)

![图 3(c): MMBench 中文分数随训练数据规模变化, Post-ViT 从 79.1 到 86.4, 本文方法从 78.4 到 86.5, 16M 处本文方法标 83.3](images/p08-c-mmbench-sub-cn-sub.png)

![图 3(d): MathVista 分数随训练数据规模变化, Post-ViT 从 63.0 到 76.3, 本文方法从 61.7 到 76.9, 两条线交替领先](images/p08-d-mathvista.png)

![图 3(e): MMStar 分数随训练数据规模变化, Post-ViT 从 60.6 到 67.9, 本文方法从 60.4 到 66.9, 前四个规模几乎重合, 64M 处本文方法落后 1.0](images/p08-e-mmstar.png)

![图 3(f): OCRBench 分数随训练数据规模变化, Post-ViT 从 77.5 到 86.7, 本文方法从 75.3 到 85.9, 只有 16M 处本文方法以 83.5 对 83.2 略高](images/p08-f-ocrbench.png)

![图 3(g): HallBench 分数随训练数据规模变化, Post-ViT 从 50.5 到 56.5, 本文方法从 47.7 到 55.2, 16M 处本文方法 54.7 明显高出, 其余多数规模落后](images/p08-g-hallbench.png)

![图 3(h): MMMU 分数随训练数据规模变化, 本文方法在 4M, 8M, 16M 领先, Post-ViT 在 32M 升到 63.6, 64M 为 63.9, 本文方法 64M 为 61.9](images/p08-h-mmmu.png)

Figure 3: Benchmark trends across training data scales. We compare Post-ViT and our method on eight benchmarks across different training data scales.

图 3: 各基准随训练数据规模的变化趋势. 在八个基准上, 按不同训练数据规模比较 Post-ViT 和我们的方法. 八个子图依次是 (a) AI2D, (b) MMBench<sub>EN</sub>, (c) MMBench<sub>CN</sub>, (d) MathVista, (e) MMStar, (f) OCRBench, (g) HallBench, (h) MMMU.

> **拆开:** 平均分只差 0.29, 拆到八个基准上, 哪一项掉得最多?
> OCRBench. 按表 A2 逐格相减, 五个规模的差是 −2.2, −2.4, +0.3, −2.1, −0.8, 平均 −1.44, 是八项里最大的落后; MMB<sub>EN</sub> 五个规模全部落后 0.3 到 0.8, 平均 −0.70. 平均分能拉平, 主要靠 MMMU 在小规模领先 (+2.4, +1.0, +2.1) 和 HallBench 在 16M 的 +3.2. 这和第 2.1 节的叙事有张力: 切片编码的卖点是 OCRBench 领先 3.6 到 5.5, 而 ViT 内早压缩在同一项上最多吐回 2.4 分. 结论里 「matching or surpassing the fine-grained downstream performance」 放到 OCRBench 上并不成立.

**The proposed early-compression design preserves average scaling behavior within the tested range.** As training data increases from 4M to 64M samples, both systems improve substantially. The post-ViT baseline rises from 68.2 to 76.2 average points, while LLaVA-UHD v4 rises from 67.4 to 75.6. The average gap stays within ±0.8 points and does not widen monotonically, suggesting that intra-ViT compression does not introduce an observable average-level scaling ceiling. Individual benchmarks still show scale-dependent variation, for example, MMMU favors LLaVA-UHD v4 at smaller scales but the post-ViT baseline at larger scales, but this reversal does not indicate a systematic compression failure, since the aggregate trend remains stable across the tested range.

**在所测范围内, 所提早压缩设计保持了平均的 Scaling 行为.** 训练数据从 4M 增加到 64M 个样本时, 两套系统都大幅提升. ViT 后基线的平均分从 68.2 升到 76.2, LLaVA-UHD v4 从 67.4 升到 75.6. 平均差距保持在 ±0.8 分以内, 而且没有单调扩大, 说明 ViT 内压缩没有带来可观察到的平均层面的 Scaling 天花板. 单个基准仍有随规模变化的波动, 比如 MMMU 在小规模偏向 LLaVA-UHD v4, 在大规模偏向 ViT 后基线, 但这种反转不代表压缩系统性失效, 因为整体趋势在所测范围内保持稳定.

### 4.3 Ablations on the In-ViT Compression Module (ViT 内压缩模块的消融)

Section 4.2 shows that LLaVA-UHD v4 can match the post-ViT baseline under the same final token budget. We now ablate the design of the intra-ViT compression module D to understand why this is possible. All variants use the 8M in-house training set and an end-to-end 16× compression ratio, with D inserted at $k = 6$ by default, applying 4× reduction over 2 × 2 token windows. Average Pool and Pixel-Unshuffle are parameter-free or randomly initialized merging baselines. Cross-Attn collapses each window into one token via cross-attention with either the top-left or mean query. Win-Attn variants first apply window self-attention and then fuse tokens with a Pixel-Unshuffle MLP, either randomly initialized or reused from the preceding ViT FFN. The central question is therefore not whether early compression can reduce compute, but which compressor can preserve the pretrained ViT representation while doing so.

4.2 节表明, 在相同的最终 token 预算下, LLaVA-UHD v4 能与 ViT 后基线持平. 现在我们对 ViT 内压缩模块 D 的设计做消融, 弄清为什么能做到. 所有变体都用 8M 自有训练集和端到端 16× 压缩率, D 默认插在 $k = 6$, 在 2 × 2 的 token 窗口上做 4× 削减. Average Pool 和 Pixel-Unshuffle 分别是无参数的和随机初始化的合并基线. Cross-Attn 用交叉注意力把每个窗口收成一个 token, 查询取左上角 token 或窗口均值. Win-Attn 变体先做窗口自注意力, 再用 Pixel-Unshuffle MLP 融合 token, 这个 MLP 要么随机初始化, 要么复用前一个 ViT 层的 FFN. 所以核心问题不是早压缩能不能省计算, 而是哪种压缩器能在省计算的同时保住预训练 ViT 的表示.

Table 4: Ablations on in-ViT compression designs. All variants use the same final 16× compression ratio and insertion depth k = 6.

表 4: ViT 内压缩设计的消融. 所有变体的最终压缩率都是 16×, 插入深度都是 k = 6. 三个子表依次是朴素合并, 直接交叉注意力, 复用 MLP 与窗口注意力.

Table 4(a) Naive merging

| Method | FLOPs (G) | Avg. |
| --- | --- | --- |
| Post-ViT Base | 3555.1 | 70.6 |
| Avg Pool | 1368.7 | 69.6 |
| Pix-Unshuffle | 1401.2 | 69.8 |

Table 4(b) Direct cross-attention

| Method | FLOPs (G) | Avg. |
| --- | --- | --- |
| Post-ViT Base | 3555.1 | 70.6 |
| Cross (top-left) | 1402.0 | 70.5 |
| Cross (mean) | 1402.0 | 69.9 |

Table 4(c) Reused MLP and window attention

| Method | FLOPs (G) | Avg. |
| --- | --- | --- |
| Pix-Unshuffle | 1401.2 | 69.8 |
| Reused MLP | 1490.2 | 69.9 |
| Win w/ MLP | 1484.1 | 70.1 |
| Win w/ Reused | 1573.1 | 70.7 |

> **确认:** 表 4(c) 的 FLOPs 里, 窗口注意力和复用 MLP 各自花了多少, 能叠加吗?
> 能, 而且正好线性叠加. 以 Pix-Unshuffle 的 1401.2 为底, 加窗口注意力多 1484.1 − 1401.2 = 82.9G, 换复用 MLP 多 1490.2 − 1401.2 = 89.0G, 两者都加是 1573.1 − 1401.2 = 171.9G = 82.9 + 89.0. 复用 MLP 更贵, 是因为块对角的 $\mathbf{W}_1$ 相当于把 FFN 隐藏层扩成四份. 再往下比: 完整的 D 相对无参数的 Avg Pool (1368.7) 多 204.4G, 占最终 1573.1G 的约 13.0%. 另外正文说 ViT 内变体都是 1401.2G, 实际 Avg Pool 是 1368.7G, Cross-Attn 是 1402.0G.

**Naive in-ViT compression is efficient but not sufficient.** Table 4(a) first evaluates simple in-ViT merging strategies. Moving compression into the ViT substantially reduces computation, from 3555.1G FLOPs for the post-ViT baseline to 1401.2G FLOPs for in-ViT variants. However, this efficiency gain does not automatically recover baseline-level accuracy. Average pooling is the cheapest design, but drops the average score from 70.6 to 69.6. A learnable pixel-unshuffle MLP improves the score to 69.8, but still remains below the post-ViT baseline. These results suggest that early token reduction creates a nontrivial interface problem within the pretrained ViT, requiring the compressor to reduce sequence length while maintaining compatibility with the representational distribution expected by the remaining encoder layers.

**朴素的 ViT 内压缩高效, 但不够.** 表 4(a) 先评估简单的 ViT 内合并策略. 把压缩挪进 ViT 大幅减少计算, 从 ViT 后基线的 3555.1G FLOPs 降到 ViT 内变体的 1401.2G FLOPs. 但效率提升不会自动找回基线水平的准确率. 平均池化是最便宜的设计, 却把平均分从 70.6 拉到 69.6. 可学习的 pixel-unshuffle MLP 把分数提到 69.8, 仍低于 ViT 后基线. 这些结果说明, 早期 token 削减在预训练 ViT 内部造成了一个不简单的接口问题: 压缩器既要缩短序列, 又要和剩余编码器层所预期的表示分布保持兼容.

<!-- page 9 of 18 -->

**Window attention and reuse initialization are complementary components of the structured merger.** Table 4(c) factorizes our structured merger along two axes, whether local window attention is applied before merging, and whether the fusion MLP is initialized by reusing the preceding ViT FFN weights. Reuse alone brings only a marginal gain over a randomly initialized pixel-unshuffle MLP, improving the average score from 69.8 to 69.9. Window attention alone is more helpful, raising the score to 70.1. When the two are combined, the score reaches 70.7, exceeding both individual modifications and slightly surpassing the post-ViT baseline. The gain is super-additive because the two components together make the merger closely resemble a standard vision encoder block, with local self-attention followed by an FFN and both initialized from the preceding layer’s weights. The output of the merger therefore stays close to what the subsequent ViT layers were pretrained to consume. Neither component alone achieves this alignment. Without window attention, the reused MLP is applied to tokens that have not been locally contextualized as in pretraining, so its initialization provides little benefit. Without reuse, window attention restores local structure but the randomly initialized fusion then maps the contextualized tokens out of the pretrained input distribution.

**窗口注意力和复用初始化是结构化合并器里互补的两部分.** 表 4(c) 沿两个轴拆解我们的结构化合并器: 合并前是否先做局部窗口注意力; 融合 MLP 是否复用前一个 ViT 层的 FFN 权重来初始化. 单独复用相对随机初始化的 pixel-unshuffle MLP 只带来微小提升, 平均分从 69.8 到 69.9. 单独加窗口注意力更有用, 提到 70.1. 两者结合达到 70.7, 超过任一单项改动, 也略高于 ViT 后基线. 收益是超加性的, 因为两个部件合在一起, 让合并器非常像一个标准的视觉编码器块: 局部自注意力后接 FFN, 两者都从前一层的权重初始化. 因此合并器的输出贴近后续 ViT 层预训练时所接收的输入. 任一部件单独都做不到这种对齐. 没有窗口注意力, 复用的 MLP 作用在没有像预训练时那样做过局部上下文化的 token 上, 初始化带来的好处很少. 没有复用, 窗口注意力恢复了局部结构, 但随机初始化的融合随后把上下文化的 token 映射到预训练输入分布之外.

**Direct cross-attention merging underperforms local window attention followed by a reuse-initialized MLP.** Table 4(b) compares against a more direct alternative that collapses each 2 × 2 window into a single token through local cross-attention. This alternative is competitive when the top-left token is used as the query, reaching 70.5 average accuracy, close to both the post-ViT baseline and our final design. However, changing the query to the window mean lowers the score to 69.8 under the same FLOPs, showing that direct one-step aggregation is sensitive to how the representative query is constructed. In contrast, first updating all tokens through local window attention and then fusing the contextualized tokens with a reuse-initialized MLP achieves 70.7, the best among all ablated in-ViT compressors. As shown in Table A6, this query sensitivity persists at 16M, where the better-performing query even flips to the window mean, while Win-Attn with Reused MLP stays strongest at both scales. This suggests a structural issue rather than a tuning artifact, since no single query consistently captures what a 2 × 2 window should be summarized into, whereas updating all tokens before fusion sidesteps the question entirely.

**直接交叉注意力合并不如 「局部窗口注意力 + 复用初始化 MLP」.** 表 4(b) 和一个更直接的替代方案比较: 用局部交叉注意力把每个 2 × 2 窗口直接收成一个 token. 用左上角 token 作查询时这个方案有竞争力, 平均准确率 70.5, 和 ViT 后基线以及我们的最终设计都接近. 但把查询换成窗口均值, 同样的 FLOPs 下分数降到 69.8, 说明一步到位的直接聚合对代表性查询怎么构造很敏感. 相比之下, 先用局部窗口注意力更新所有 token, 再用复用初始化的 MLP 融合这些上下文化后的 token, 达到 70.7, 是所有消融过的 ViT 内压缩器里最好的. 如表 A6 所示, 这种查询敏感性在 16M 下依然存在, 表现更好的查询甚至翻转成了窗口均值, 而 Win-Attn 加复用 MLP 在两个规模下都最强. 这说明是结构问题, 不是调参的偶然结果: 没有哪个单一查询能稳定地概括一个 2 × 2 窗口应该被总结成什么, 而先更新所有 token 再融合, 就完全绕开了这个问题.

> **回看:** 正文说换成均值查询后分数 「降到 69.8」, 可上一页表 4(b) 的 Cross (mean) 是 69.9, 哪个是印错?
> 两张表各站一边. 表 4(b) 和第 16 页表 A3 写 69.9, 第 17 页表 A6 的 8M 行和这里的正文写 69.8. 三张表的八个分项完全相同 (61.0, 66.0, 82.2, 81.5, 61.5, 47.5, 80.6, 78.5), 算下来平均正好是 69.850, 恰在四舍五入的分界上, 所以两种写法都可能出现. 这 0.1 不改变结论, 但同一实验在同一篇里有两个平均分. PDF 文字层与 md 一致, 不是转写错误.

Table 5: Effect of insertion depth k on accuracy and compute. Evaluation for D inserted after different ViT layers, reporting average score and visual-encoding FLOPs.

表 5: 插入深度 k 对准确率和计算量的影响. 把 D 插在不同 ViT 层之后评估, 报告平均分和视觉编码 FLOPs.

| Layer (k) | FLOPs (G) | Avg. Score |
| --- | --- | --- |
| 3 | 1245.1 | 39.7 |
| 6 | 1573.1 | 70.7 |
| 9 | 1901.1 | 70.3 |
| 15 | 2557.0 | 70.4 |

> **停一下:** 表 5 里 k = 3 的平均分是 39.7, 下一段正文写 38.76, 差了快 1 分, 以哪个为准?
> 本页定不了. PDF 文字层两处分别就是 39.7 和 38.76, 不是转写问题. 两个数精度都不同 (一位小数对两位小数), 像是来自不同版本的结果. 不管哪个, 结论不变: 从 70 分左右掉到不到 40 分, 是塌陷而不是小幅下降. 这一行也没有逐基准分数, 附录里所有表都没有 k = 3 的明细, 塌在哪几项看不到.

**Effective intra-ViT compression requires an intermediate insertion depth.** As shown in Table 5, inserting D too early is highly destructive: k = 3 gives the lowest FLOPs, but drops the average score to 38.76. This indicates that the earliest ViT layers have not yet formed representations that are safe to merge. In contrast, inserting at k = 6 preserves accuracy while retaining most of the compute savings. Delaying compression to k = 9 or k = 15 brings no accuracy benefit, yielding slightly lower scores while increasing FLOPs to 1901G and 2557G, respectively. Among the non-collapsed settings in our sweep, k = 6 is therefore Pareto-favorable. It is both more accurate and more efficient than the deeper insertion depths. This suggests that effective intra-ViT compression requires an intermediate depth where tokens are no longer purely low-level visual features but have already accumulated enough semantic structure to be safely merged.

**有效的 ViT 内压缩需要中间的插入深度.** 如表 5 所示, D 插得太早破坏性很大: k = 3 的 FLOPs 最低, 平均分却跌到 38.76. 这说明最浅的几层 ViT 还没形成可以安全合并的表示. 相比之下, 插在 k = 6 保住了准确率, 又保留了大部分计算节省. 把压缩推迟到 k = 9 或 k = 15 没有准确率上的好处, 分数略低, FLOPs 分别涨到 1901G 和 2557G. 所以在扫描中没有塌陷的设置里, k = 6 是帕累托占优的: 比更深的插入位置既更准又更省. 这说明有效的 ViT 内压缩需要一个中间深度, 那里的 token 已不再是纯粹的低层视觉特征, 而是积累了足够的语义结构, 可以安全合并.

> **再看:** k = 6 比 k = 9, k = 15 「更准」, 差距有多大, 够不够说明问题?
> 70.7 对 70.3 和 70.4, 只差 0.4 和 0.3. 本页没报种子数, 方差或置信区间, 而同一篇里 「换个查询」 就能差 0.6 (表 4(b)), 同一实验的平均分还有 69.8 和 69.9 两种写法. 所以 k = 6 在准确率上 「占优」 的证据很薄, 站得住的是 FLOPs: 每推后一层约多 109.3G, k = 9 比 k = 6 多 328.0G, k = 15 多 983.9G. 更稳的说法是 「k = 6 以后准确率基本持平, 越晚越贵」.

## 5 Conclusion

In this work, we present LLaVA-UHD v4, a highly efficient visual encoding architecture that systematically re-examines high-resolution perception in MLLMs. By demonstrating the empirical advantages of slice-based encoding over the global encoding paradigm, and introducing a novel parameter-reusing intra-ViT early compression module, we substantially reduce the severe computational bottleneck inside the vision encoder. Extensive experiments validate that our approach reduces visual-encoding FLOPs by 55.75% under a 16× compression ratio, while matching or surpassing the fine-grained downstream performance of strong post-ViT baselines. While our current module operates at a fixed compression rate, exploring dynamic, content-aware token reduction mechanisms within the encoder remains an exciting direction for future research. Together, these results suggest that aggressive token reduction can be performed inside the vision encoder without sacrificing fine-grained perception, offering a practical path toward more scalable multimodal foundation models.

这篇工作提出 LLaVA-UHD v4, 一个高效的视觉编码架构, 系统地重新审视了 MLLM 中的高分辨率感知. 通过实证展示切片编码相对全局编码范式的优势, 并引入一个新的参数复用 ViT 内早压缩模块, 我们大幅缓解了视觉编码器内部严重的算力瓶颈. 大量实验验证, 在 16× 压缩率下, 我们的方法把视觉编码 FLOPs 降低 55.75%, 同时在细粒度下游表现上与强 ViT 后基线持平或更好. 目前的模块以固定压缩率运行, 在编码器内部探索动态的, 感知内容的 token 削减机制, 是未来研究中令人期待的方向. 综合来看, 这些结果说明激进的 token 削减可以在视觉编码器内部完成而不牺牲细粒度感知, 为更具扩展性的多模态基础模型提供了一条实用路径.

<!-- page 10 of 18 -->

## References

[1] Jean-Baptiste Alayrac, Jeff Donahue, Pauline Luc, Antoine Miech, Iain Barr, Yana Hasson, Karel Lenc, Arthur Mensch, Katherine Millican, Malcolm Reynolds, et al. Flamingo: a visual language model for few-shot learning. Advances in neural information processing systems, 35:23716–23736, 2022.

[2] Jinze Bai, Shuai Bai, Shusheng Yang, Shijie Wang, Sinan Tan, Peng Wang, Junyang Lin, Chang Zhou, and Jingren Zhou. Qwen-vl: A versatile vision-language model for understanding, localization, text reading, and beyond, 2023.

[3] Daniel Bolya, Cheng-Yang Fu, Xiaoliang Dai, Peizhao Zhang, Christoph Feichtenhofer, and Judy Hoffman. Token merging: Your vit but faster. arXiv preprint arXiv:2210.09461, 2022.

[4] Junbum Cha, Wooyoung Kang, Jonghwan Mun, and Byungseok Roh. Honeybee: Locality-enhanced projector for multimodal llm. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 13817–13827, 2024.

[5] Liang Chen, Haozhe Zhao, Tianyu Liu, Shuai Bai, Junyang Lin, Chang Zhou, and Baobao Chang. An image is worth 1/2 tokens after layer 2: Plug-and-play inference acceleration for large vision-language models. In European Conference on Computer Vision, pages 19–35. Springer, 2024.

[6] Lin Chen, Jinsong Li, Xiaoyi Dong, Pan Zhang, Conghui He, Jiaqi Wang, Feng Zhao, and Dahua Lin. Sharegpt4v: Improving large multi-modal models with better captions. In European Conference on Computer Vision, pages 370–387. Springer, 2024.

[7] Lin Chen, Jinsong Li, Xiaoyi Dong, Pan Zhang, Yuhang Zang, Zehui Chen, Haodong Duan, Jiaqi Wang, Yu Qiao, Dahua Lin, et al. Are we on the right way for evaluating large vision-language models? Advances in Neural Information Processing Systems, 37:27056–27087, 2024.

[8] Zhe Chen, Weiyun Wang, Hao Tian, Shenglong Ye, Zhangwei Gao, Erfei Cui, Wenwen Tong, Kongzhi Hu, Jiapeng Luo, Zheng Ma, et al. How far are we to gpt-4v? closing the gap to commercial multimodal models with open-source suites. Science China Information Sciences, 67(12):220101, 2024.

[9] Zhe Chen, Jiannan Wu, Wenhai Wang, Weijie Su, Guo Chen, Sen Xing, Muyan Zhong, Qinglong Zhang, Xizhou Zhu, Lewei Lu, et al. Internvl: Scaling up vision foundation models and aligning for generic visual-linguistic tasks. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 24185–24198, 2024.

[10] Wenliang Dai, Junnan Li, Dongxu Li, Anthony Tiong, Junqi Zhao, Weisheng Wang, Boyang Li, Pascale N Fung, and Steven Hoi. Instructblip: Towards general-purpose vision-language models with instruction tuning. Advances in neural information processing systems, 36:49250–49267, 2023.

[11] Mostafa Dehghani, Basil Mustafa, Josip Djolonga, Jonathan Heek, Matthias Minderer, Mathilde Caron, Andreas Steiner, Joan Puigcerver, Robert Geirhos, Ibrahim M Alabdulmohsin, et al. Patch n’pack: Navit, a vision transformer for any aspect ratio and resolution. Advances in Neural Information Processing Systems, 36:2252–2274, 2023.

[12] Enrico Fini, Mustafa Shukor, Xiujun Li, Philipp Dufter, Michal Klein, David Haldimann, Sai Aitharaju, Victor G Turrisi da Costa, Louis Béthune, Zhe Gan, et al. Multimodal autoregressive pre-training of large vision encoders. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 9641–9654, 2025.

[13] Tianrui Guan, Fuxiao Liu, Xiyang Wu, Ruiqi Xian, Zongxia Li, Xiaoyu Liu, Xijun Wang, Lichang Chen, Furong Huang, Yaser Yacoob, et al. Hallusionbench: an advanced diagnostic suite for entangled language hallucination and visual illusion in large vision-language models. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 14375–14385, 2024.

[14] Zonghao Guo, Ruyi Xu, Yuan Yao, Junbo Cui, Zanlin Ni, Chunjiang Ge, Tat-Seng Chua, Zhiyuan Liu, and Gao Huang. Llava-uhd: an lmm perceiving any aspect ratio and high-resolution images. In European Conference on Computer Vision, pages 390–406. Springer, 2024.

[15] Anwen Hu, Haiyang Xu, Jiabo Ye, Ming Yan, Liang Zhang, Bo Zhang, Ji Zhang, Qin Jin, Fei Huang, and Jingren Zhou. mplug-docowl 1.5: Unified structure learning for ocr-free document understanding. In Findings of the Association for Computational Linguistics: EMNLP 2024, pages 3096–3120, 2024.

<!-- page 11 of 18 -->

[16] Shaohan Huang, Li Dong, Wenhui Wang, Yaru Hao, Saksham Singhal, Shuming Ma, Tengchao Lv, Lei Cui, Owais Khan Mohammed, Barun Patra, et al. Language is not all you need: Aligning perception with language models. Advances in Neural Information Processing Systems, 36:72096–72109, 2023.

[17] Gabriel Ilharco, Mitchell Wortsman, Nicholas Carlini, Rohan Taori, Achal Dave, Vaishaal Shankar, Hongseok Namkoong, John Miller, Hannaneh Hajishirzi, Ali Farhadi, et al. Openclip. Zenodo, 2021.

[18] Siddharth Karamcheti, Suraj Nair, Ashwin Balakrishna, Percy Liang, Thomas Kollar, and Dorsa Sadigh. Prismatic VLMs: Investigating the design space of visually-conditioned language models. In International Conference on Machine Learning (ICML), 2024.

[19] Aniruddha Kembhavi, Mike Salvato, Eric Kolve, Minjoon Seo, Hannaneh Hajishirzi, and Ali Farhadi. A diagram is worth a dozen images. In European conference on computer vision, pages 235–251. Springer, 2016.

[20] Junnan Li, Dongxu Li, Silvio Savarese, and Steven Hoi. Blip-2: Bootstrapping language-image pre-training with frozen image encoders and large language models. In International conference on machine learning, pages 19730–19742. PMLR, 2023.

[21] Yanwei Li, Yuechen Zhang, Chengyao Wang, Zhisheng Zhong, Yixin Chen, Ruihang Chu, Shaoteng Liu, and Jiaya Jia. Mini-gemini: Mining the potential of multi-modality vision language models. IEEE Transactions on Pattern Analysis and Machine Intelligence, 2025.

[22] Zhihang Lin, Mingbao Lin, Luxi Lin, and Rongrong Ji. Boosting multimodal large language models with visual tokens withdrawal for rapid inference. In Proceedings of the AAAI Conference on Artificial Intelligence, volume 39, pages 5334–5342, 2025.

[23] Haotian Liu, Chunyuan Li, Yuheng Li, and Yong Jae Lee. Improved baselines with visual instruction tuning. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 26296–26306, 2024.

[24] Haotian Liu, Chunyuan Li, Yuheng Li, Bo Li, Yuanhan Zhang, Sheng Shen, and Yong Jae Lee. Llava-next: Improved reasoning, ocr, and world knowledge, January 2024.

[25] Haotian Liu, Chunyuan Li, Qingyang Wu, and Yong Jae Lee. Visual instruction tuning. Advances in neural information processing systems, 36:34892–34916, 2023.

[26] Yuan Liu, Haodong Duan, Yuanhan Zhang, Bo Li, Songyang Zhang, Wangbo Zhao, Yike Yuan, Jiaqi Wang, Conghui He, Ziwei Liu, et al. Mmbench: Is your multi-modal model an all-around player? In European conference on computer vision, pages 216–233. Springer, 2024.

[27] Yuliang Liu, Zhang Li, Mingxin Huang, Biao Yang, Wenwen Yu, Chunyuan Li, Xu-Cheng Yin, Cheng-Lin Liu, Lianwen Jin, and Xiang Bai. Ocrbench: on the hidden mystery of ocr in large multimodal models. Science China Information Sciences, 67(12):220102, 2024.

[28] Dongchen Lu, Yuyao Sun, Zilu Zhang, Leping Huang, Jianliang Zeng, Mao Shu, and Huo Cao. Internvlx: Advancing and accelerating internvl series with efficient visual token compression. arXiv preprint arXiv:2503.21307, 2025.

[29] Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. arXiv preprint arXiv:2310.02255, 2023.

[30] Ahmed Masry, Xuan Long Do, Jia Qing Tan, Shafiq Joty, and Enamul Hoque. Chartqa: A benchmark for question answering about charts with visual and logical reasoning. In Findings of the association for computational linguistics: ACL 2022, pages 2263–2279, 2022.

[31] Minesh Mathew, Dimosthenis Karatzas, and C.V. Jawahar. DocVQA: A Dataset for VQA on Document Images. In Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision (WACV), pages 2200–2209, 2021.

[32] Brandon McKinzie, Zhe Gan, Jean-Philippe Fauconnier, Sam Dodge, Bowen Zhang, Philipp Dufter, Dhruti Shah, Xianzhi Du, Futang Peng, Anton Belyi, et al. Mm1: methods, analysis and insights from multimodal llm pre-training. In European Conference on Computer Vision, pages 304–323. Springer, 2024.

[33] Linke Ouyang, Yuan Qu, Hongbin Zhou, Jiawei Zhu, Rui Zhang, Qunshu Lin, Bin Wang, Zhiyuan Zhao, Man Jiang, Xiaomeng Zhao, et al. Omnidocbench: Benchmarking diverse pdf document parsing with comprehensive annotations. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 24838–24848, 2025.

<!-- page 12 of 18 -->

[34] Zhiliang Peng, Wenhui Wang, Li Dong, Yaru Hao, Shaohan Huang, Shuming Ma, and Furu Wei. Kosmos-2: Grounding multimodal large language models to the world. arXiv preprint arXiv:2306.14824, 2023.

[35] Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, et al. Learning transferable visual models from natural language supervision. In International conference on machine learning, pages 8748–8763. PmLR, 2021.

[36] Yongming Rao, Wenliang Zhao, Benlin Liu, Jiwen Lu, Jie Zhou, and Cho-Jui Hsieh. Dynamicvit: Efficient vision transformers with dynamic token sparsification. Advances in neural information processing systems, 34:13937–13949, 2021.

[37] Quan Sun, Yuxin Fang, Ledell Wu, Xinlong Wang, and Yue Cao. Eva-clip: Improved training techniques for clip at scale. arXiv preprint arXiv:2303.15389, 2023.

[38] Kimi Team, Tongtong Bai, Yifan Bai, Yiping Bao, SH Cai, Yuan Cao, Y Charles, HS Che, Cheng Chen, Guanduo Chen, et al. Kimi k2. 5: Visual agentic intelligence. arXiv preprint arXiv:2602.02276, 2026.

[39] Kimi Team, Angang Du, Bohong Yin, Bowei Xing, Bowen Qu, Bowen Wang, Cheng Chen, Chenlin Zhang, Chenzhuang Du, Chu Wei, et al. Kimi-vl technical report. arXiv preprint arXiv:2504.07491, 2025.

[40] Michael Tschannen, Alexey Gritsenko, Xiao Wang, Muhammad Ferjad Naeem, Ibrahim Alabdulmohsin, Nikhil Parthasarathy, Talfan Evans, Lucas Beyer, Ye Xia, Basil Mustafa, et al. Siglip 2: Multilingual vision-language encoders with improved semantic understanding, localization, and dense features. arXiv preprint arXiv:2502.14786, 2025.

[41] Peng Wang, Shuai Bai, Sinan Tan, Shijie Wang, Zhihao Fan, Jinze Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, et al. Qwen2-vl: Enhancing vision-language model’s perception of the world at any resolution. arXiv preprint arXiv:2409.12191, 2024.

[42] Weihan Wang, Qingsong Lv, Wenmeng Yu, Wenyi Hong, Ji Qi, Yan Wang, Junhui Ji, Zhuoyi Yang, Lei Zhao, Xixuan Song, et al. Cogvlm: Visual expert for pretrained language models. Advances in Neural Information Processing Systems, 37:121475–121499, 2024.

[43] Penghao Wu and Saining Xie. V?: Guided visual search as a core mechanism in multimodal llms. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 13084–13094, 2024.

[44] Long Xing, Qidong Huang, Xiaoyi Dong, Jiajie Lu, Pan Zhang, Yuhang Zang, Yuhang Cao, Conghui He, Jiaqi Wang, Feng Wu, et al. Pyramiddrop: Accelerating your large vision-language models via pyramid visual redundancy reduction. arXiv preprint arXiv:2410.17247, 2024.

[45] Hu Xu, Saining Xie, Xiaoqing Ellen Tan, Po-Yao Huang, Russell Howes, Vasu Sharma, Shang-Wen Li, Gargi Ghosh, Luke Zettlemoyer, and Christoph Feichtenhofer. Demystifying clip data. arXiv preprint arXiv:2309.16671, 2023.

[46] An Yang, Anfeng Li, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Gao, Chengen Huang, Chenxu Lv, et al. Qwen3 technical report. arXiv preprint arXiv:2505.09388, 2025.

[47] Yuan Yao, Tianyu Yu, Ao Zhang, Chongyi Wang, Junbo Cui, Hongji Zhu, Tianchi Cai, Haoyu Li, Weilin Zhao, Zhihui He, et al. Minicpm-v: A gpt-4v level mllm on your phone. arXiv preprint arXiv:2408.01800, 2024.

[48] Qinghao Ye, Haiyang Xu, Guohai Xu, Jiabo Ye, Ming Yan, Yiyang Zhou, Junyang Wang, Anwen Hu, Pengcheng Shi, Yaya Shi, et al. mplug-owl: Modularization empowers large language models with multimodality. arXiv preprint arXiv:2304.14178, 2023.

[49] Hongxu Yin, Arash Vahdat, Jose M Alvarez, Arun Mallya, Jan Kautz, and Pavlo Molchanov. A-vit: Adaptive tokens for efficient vision transformer. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 10809–10818, 2022.

[50] Xiang Yue, Yuansheng Ni, Kai Zhang, Tianyu Zheng, Ruoqi Liu, Ge Zhang, Samuel Stevens, Dongfu Jiang, Weiming Ren, Yuxuan Sun, et al. Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 9556–9567, 2024.

[51] Xiaohua Zhai, Basil Mustafa, Alexander Kolesnikov, and Lucas Beyer. Sigmoid loss for language image pre-training. In Proceedings of the IEEE/CVF international conference on computer vision, pages 11975–11986, 2023.

<!-- page 13 of 18 -->

[52] Yi-Fan Zhang, Huanyu Zhang, Haochen Tian, Chaoyou Fu, Shuangqing Zhang, Junfei Wu, Feng Li, Kun Wang, Qingsong Wen, Zhang Zhang, et al. Mme-realworld: Could your multimodal llm challenge high-resolution real-world scenarios that are difficult for humans? arXiv preprint arXiv:2408.13257, 2024.

[53] Yuan Zhang, Chun-Kai Fan, Junpeng Ma, Wenzhao Zheng, Tao Huang, Kuan Cheng, Denis Gudovskiy, Tomoyuki Okuno, Yohei Nakata, Kurt Keutzer, et al. Sparsevlm: Visual token sparsification for efficient vision-language model inference. arXiv preprint arXiv:2410.04417, 2024.

[54] Deyao Zhu, Jun Chen, Xiaoqian Shen, Xiang Li, and Mohamed Elhoseiny. Minigpt-4: Enhancing vision-language understanding with advanced large language models. arXiv preprint arXiv:2304.10592, 2023.

<!-- page 14 of 18 -->

## A Related Work (相关工作)

### A.1 Vision Encoder (视觉编码器)

Language-supervised contrastive models remain the dominant choice for MLLMs due to their natural pre-alignment with language. CLIP [35] and its variants [51, 17, 45, 37] have progressively refined this paradigm through improved objectives, data curation and parameter scale. More recently, SigLIP 2 [40] unifies contrastive, captioning, self-distillation and masked prediction objectives into a single recipe, achieving broad improvements in classification, localization, and MLLM transfer. Despite their dominance, these encoders inherit a language bottleneckk: they capture only what alt-text describes and exhibit "CLIP-blind" failures on fine-grained spatial distinctions, and most operate at fixed low resolutions. To push beyond these limits, a parallel line scales the visual backbone itself, exemplified by InternViT-6B [9] and AIMv2 [12], while NaViT [11] and the native-resolution ViTs of Qwen2-VL [41], Kimi K2.5 [38] make token count scale with image area. Another major line keeps the encoder fixed and instead partitions high-resolution inputs into multiple low-resolution slices that are encoded independently, as in LLaVA-NeXT [24], Intern VL 1.5 [8], LLaVA-UHD [14] and mPLUG-DocOwl 1.5 [15]. While effective at preserving fine-grained details with off-the-shelf encoders, slicing multiplies visual tokens and fragments cross-slice spatial context. However, scaling the encoder to billions of parameters or to native high resolutions inflates visual token counts and pretraining cost, creating a tension between visual fidelity and MLLMs efficiency.

用语言监督的对比学习模型天然和语言预先对齐, 至今仍是 MLLM 的主流选择. CLIP [35] 及其变体 [51, 17, 45, 37] 通过改进目标, 数据筛选和参数规模, 一步步完善了这一范式. 更近的 SigLIP 2 [40] 把对比, 描述生成, 自蒸馏和掩码预测几个目标合进一个配方, 在分类, 定位和 MLLM 迁移上全面提升. 尽管占主导, 这些编码器继承了一个语言瓶颈 (原文拼作 「bottleneckk」): 它们只抓住 alt-text 描述到的东西, 在细粒度空间区分上会出现 「CLIP 盲」 式的失败, 而且多数在固定的低分辨率下运行. 为了突破这些限制, 一条平行路线直接做大视觉主干, 代表是 InternViT-6B [9] 和 AIMv2 [12]; NaViT [11] 以及 Qwen2-VL [41], Kimi K2.5 [38] 的原生分辨率 ViT 则让 token 数随图像面积增长. 另一条主要路线保持编码器不变, 把高分辨率输入切成多个低分辨率切片分别编码, 如 LLaVA-NeXT [24], InternVL 1.5 [8], LLaVA-UHD [14] 和 mPLUG-DocOwl 1.5 [15]. 切片在用现成编码器保住细粒度细节上很有效, 但会让视觉 token 成倍增加, 并把跨切片的空间上下文割裂开. 另一方面, 把编码器做到数十亿参数或原生高分辨率, 会让视觉 token 数和预训练开销膨胀, 在视觉保真度和 MLLM 效率之间形成张力.

### A.2 Multimodal Connector (多模态连接器)

Bridging a vision encoder to an LLM requires a connector module, and the field has converged on two dominant designs. Query-based resamplers were popularized by Flamingo [1]’s Perceiver Resampler, which compresses arbitrary spatio-temporal feature grids to a fixed 64 latent tokens via cross-attention with learned queries, and by BLIP-2 [20]’s Q-Former, a 32-query bottleneck transformer pretrained with contrastive matching and generative objectives. This recipe was widely inherited: MiniGPT-4 [54] freezes BLIP-2’s Q-Former and trains only a linear head, InstructBLIP [10] makes the queries instruction-aware, Qwen-VL [2] employs a single-layer cross-attention compressor producing 256 tokens. Kosmos-1/2 [16, 34] and mPLUG-Owl [48] all adopt Perceiver- or abstractor-style pooling, primarily for token-count efficiency. Projection-based connectors offer a competing minimalist alternative: LLaVA [25]’s single linear layer and LLaVA-1.5 [23]’s two-layer GELU MLP retain every patch token, showing that simple token-preserving projection can match or exceed resamplers trained on orders of magnitude more data, and this design has since been widely adopted by many subsequent MLLMs [24, 6, 21, 18, 42]. Yet the empirical record is contradictory: Honeybee [4] attribute large gains to locality-preserving projection, whereas MM1 [32] finds connector architecture nearly negligible relative to image resolution and visual-token count. This leaves the trade-off between information fidelity and token efficiency unresolved and motivating a direct empirical comparison between Resampler- and MLP-style connectors.

把视觉编码器接到 LLM 需要一个连接器模块, 领域里已收敛到两种主流设计. 基于查询的 resampler 由两项工作带火: Flamingo [1] 的 Perceiver Resampler, 用可学习查询做交叉注意力, 把任意时空特征网格压成固定的 64 个潜变量 token; BLIP-2 [20] 的 Q-Former, 一个 32 个查询的瓶颈 transformer, 用对比匹配和生成目标预训练. 这套配方被广泛继承: MiniGPT-4 [54] 冻结 BLIP-2 的 Q-Former, 只训练一个线性头; InstructBLIP [10] 让查询感知指令; Qwen-VL [2] 用单层交叉注意力压缩器输出 256 个 token. Kosmos-1/2 [16, 34] 和 mPLUG-Owl [48] 都采用 Perceiver 式或 abstractor 式池化, 主要为了 token 数上的效率. 基于投影的连接器提供了一个极简的竞争方案: LLaVA [25] 的单个线性层和 LLaVA-1.5 [23] 的两层 GELU MLP 保留每个 patch token, 表明简单的保 token 投影能追平甚至超过用多出几个数量级数据训练的 resampler, 这一设计此后被许多 MLLM 广泛采用 [24, 6, 21, 18, 42]. 但实证记录互相矛盾: Honeybee [4] 把大幅提升归功于保局部性的投影, 而 MM1 [32] 发现相对图像分辨率和视觉 token 数, 连接器架构几乎无关紧要. 信息保真度和 token 效率之间的取舍因此悬而未决, 这促使我们对 Resampler 式和 MLP 式连接器做直接的实证比较.

### A.3 Token Compression (token 压缩)

The hundreds to thousands of visual tokens produced make token compression a central concern for MLLM efficiency. Existing approaches operate at three points of the pipeline. Inside the LLM, a line of largely training-free methods prunes visual tokens between transformer layers, exploiting the observation that visual tokens become increasingly redundant at deeper layers. FastV [5] drops low-attention visual tokens after an early layer, while SparseVLM [53], VTW [22], and PyramidDrop [44] extend this idea with text-aware or progressive schedules. Such methods are simple to deploy but inherit whatever redundancy the encoder has already produced. Between the encoder and the LLM, a learnable compressor distills patch tokens before they enter the language model. Inside the ViT, compression directly reduces the cost of the visual backbone itself. ToMe [3] bipartite-matches and merges similar tokens at each layer without retraining; DynamicViT [36] and A-ViT [49] learn to drop uninformative tokens during the forward pass. In-encoder compression accelerates the entire backbone, but is tightly coupled to the encoder’s pretraining objective and risks discarding tokens that downstream language grounding would have relied on.

一张图产生数百到数千个视觉 token, 使 token 压缩成为 MLLM 效率的核心问题. 现有方法作用在流水线的三个位置. 在 LLM 内部, 一类大多无需训练的方法在 transformer 层之间剪掉视觉 token, 依据是视觉 token 在越深的层越冗余. FastV [5] 在较浅的一层之后丢掉注意力低的视觉 token, SparseVLM [53], VTW [22] 和 PyramidDrop [44] 用感知文本或渐进式的调度扩展了这一思路. 这类方法部署简单, 但编码器已经产生的冗余会原样继承下来. 在编码器和 LLM 之间, 一个可学习的压缩器在 patch token 进入语言模型之前做提炼. 在 ViT 内部, 压缩直接降低视觉主干本身的开销. ToMe [3] 在每一层做二分匹配, 合并相似 token, 无需重训; DynamicViT [36] 和 A-ViT [49] 学会在前向过程中丢掉没有信息量的 token. 编码器内压缩能加速整个主干, 但和编码器的预训练目标耦合很紧, 有可能丢掉下游语言对齐本来要依赖的 token.

<!-- page 15 of 18 -->

Table A1: Detailed results for the robustness study of slice-based encoding. Detailed breakdown of Table 2 across the eight benchmarks, covering both the MoonViT backbone and the higher-resolution slicing schedule under compression rate 16×.

表 A1: 切片编码稳健性研究的详细结果. 表 2 在八个基准上的逐项拆分, 包括 MoonViT 主干和更高分辨率切片方案, 压缩率均为 16×.

<table><tr><td>Data Scale</td><td>Method</td><td>MMMU</td><td>MathVista</td><td> $MMB_{EN}$ </td><td> $MMB_{CN}$ </td><td>MMStar</td><td>HallBench</td><td>AI2D</td><td>OCRBench</td><td>Avg.</td></tr><tr><td colspan="11">MoonViT (Compression Rate 16×)</td></tr><tr><td rowspan="2">8M</td><td>GE</td><td>57.8</td><td>69.0</td><td>82.9</td><td>82.2</td><td>61.3</td><td>50.7</td><td>80.1</td><td>78.0</td><td>70.3</td></tr><tr><td>SE</td><td>58.8</td><td>70.1</td><td>82.7</td><td>82.2</td><td>64.4</td><td>52.0</td><td>80.1</td><td>82.2</td><td>71.6</td></tr><tr><td rowspan="2">16M</td><td>GE</td><td>57.7</td><td>73.4</td><td>83.8</td><td>82.6</td><td>65.3</td><td>53.3</td><td>82.7</td><td>79.0</td><td>72.2</td></tr><tr><td>SE</td><td>62.4</td><td>72.2</td><td>83.6</td><td>82.9</td><td>66.3</td><td>54.1</td><td>81.8</td><td>85.1</td><td>73.6</td></tr><tr><td colspan="11">Higher-Resolution (Compression Rate 16×)</td></tr><tr><td rowspan="2">8M</td><td>GE</td><td>56.4</td><td>66.2</td><td>82.6</td><td>82.0</td><td>61.1</td><td>48.4</td><td>79.7</td><td>73.9</td><td>68.8</td></tr><tr><td>SE</td><td>59.1</td><td>68.4</td><td>84.4</td><td>83.3</td><td>62.4</td><td>49.9</td><td>79.1</td><td>81.5</td><td>71.0</td></tr></table>

Table A2: Main comparison on in-house data across training scales. Both systems share an identical architecture, training recipe, data, and end-to-end 16× compression ratio; they differ only in where compression occurs. Avg. is computed over the eight benchmarks shown. Post-ViT baseline performs all compression after the ViT. Ours performs 4× compression inside the ViT after layer 6 and another 4× after the ViT.

表 A2: 自有数据上不同训练规模的主对比. 两套系统的架构, 训练配方, 数据和端到端 16× 压缩率完全相同, 只在压缩发生的位置上不同. Avg. 是表中八个基准的平均. ViT 后基线的全部压缩都在 ViT 之后完成; 我们的方法在 ViT 第 6 层之后做 4× 压缩, ViT 之后再做 4×. (md 把数据规模单独排成空行, 这里并回每一行的第一列, 数字不变.)

| Data Scale | Method | MMMU | MathVista | MMB<sub>EN</sub> | MMB<sub>CN</sub> | MMStar | HallBench | AI2D | OCRBench | Avg. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4M | Post-ViT | 57.9 | 63.0 | 79.4 | 79.1 | 60.6 | 50.5 | 77.7 | 77.5 | 68.2 |
| 4M | Ours | 60.3 | 61.7 | 78.6 | 78.4 | 60.4 | 47.7 | 76.6 | 75.3 | 67.4 |
| 8M | Post-ViT | 58.6 | 67.3 | 83.7 | 82.3 | 62.9 | 51.2 | 79.8 | 79.1 | 70.6 |
| 8M | Ours | 59.6 | 68.6 | 83.4 | 81.6 | 62.9 | 52.0 | 80.6 | 76.7 | 70.7 |
| 16M | Post-ViT | 59.1 | 71.0 | 84.9 | 83.5 | 65.5 | 51.5 | 81.2 | 83.2 | 72.5 |
| 16M | Ours | 61.2 | 71.1 | 84.1 | 83.3 | 65.3 | 54.7 | 81.8 | 83.5 | 73.1 |
| 32M | Post-ViT | 63.6 | 72.7 | 85.5 | 84.9 | 65.9 | 53.6 | 82.5 | 84.8 | 74.2 |
| 32M | Ours | 62.3 | 72.0 | 84.7 | 85.0 | 66.2 | 52.8 | 82.4 | 82.7 | 73.5 |
| 64M | Post-ViT | 63.9 | 76.3 | 87.0 | 86.4 | 67.9 | 56.5 | 84.7 | 86.7 | 76.2 |
| 64M | Ours | 61.9 | 76.9 | 86.2 | 86.5 | 66.9 | 55.2 | 84.9 | 85.9 | 75.6 |

## B Detailed Analysis and Results (详细分析与结果)

### B.1 Detailed Analysis of Encoding Strategies (编码策略的详细分析)

Across the evaluated SigLIP 2 settings, MoonViT settings, and slicing schedules, slice-based encoding (SE) improves the average score over global encoding (GE), although individual benchmark outcomes remain mixed. The MoonViT comparison shows that this average advantage persists even with a backbone designed for native-resolution processing, and the higher-resolution slicing variant further suggests that the result is not tied to a single slicing budget. We therefore interpret SE not merely as a computational workaround, but as an encoding strategy that changes the context in which visual features are formed before compression.

在评估过的 SigLIP 2 设置, MoonViT 设置和各种切片方案下, 切片编码 (SE) 的平均分都高于全局编码 (GE), 尽管单个基准的结果有输有赢. MoonViT 的对比表明, 即使主干专为原生分辨率处理而设计, 这种平均优势依然存在; 更高分辨率的切片变体进一步说明结果不依赖某一个切片预算. 所以我们不把 SE 仅仅看成算力上的变通, 而把它看成一种编码策略: 它改变了视觉特征在压缩之前形成时所处的上下文.

The key difference lies less in the compression ratio itself than in the attention context used by the ViT. With the pixel-unshuffle MLP compressor, both GE and SE apply a locality-preserving spatial merge, so the compressor does not globally pool all visual tokens. However, the features entering this compressor have been produced under different encoding contexts. GE encodes the full image in a single ViT forward pass, where all patches interact in one global attention space. SE decomposes the image into a thumbnail and spatially coherent slices, then encodes each slice independently, so the ViT forms features within localized views before those features are spatially merged.

关键差别与其说在压缩率本身, 不如说在 ViT 所用的注意力上下文. 用 pixel-unshuffle MLP 压缩器时, GE 和 SE 做的都是保局部性的空间合并, 压缩器不会把所有视觉 token 全局池化. 但进入压缩器的特征是在不同编码上下文里产生的. GE 在一次 ViT 前向中编码整张图, 所有 patch 在同一个全局注意力空间里交互. SE 把图像拆成一张缩略图和若干空间上连贯的切片, 再分别编码每个切片, 所以 ViT 在特征被空间合并之前, 是在局部视图里形成这些特征的.

This local encoding bias is especially relevant for fine-grained perception. GE preserves unrestricted patch-to-patch interaction inside the ViT, which is useful for global context but may dilute the inductive bias toward local structure. SE sacrifices some within-ViT global interaction, yet it encourages the visual encoder to extract text, chart marks, and dense document patterns within local neighborhoods before the same type of spatial compression is applied. The largest and most stable gains on OCRBench are consistent with this interpretation: tasks that depend heavily on small local structures appear to benefit from forming visual features in localized views before compression.

这种局部编码偏置对细粒度感知尤其重要. GE 在 ViT 内部保留了不受限制的 patch 间交互, 这对全局上下文有用, 却可能冲淡对局部结构的归纳偏置. SE 牺牲了一部分 ViT 内的全局交互, 但鼓励视觉编码器在施加同一类空间压缩之前, 先在局部邻域里提取文字, 图表标记和密集的文档图样. OCRBench 上最大, 最稳定的提升与这个解释一致: 高度依赖小型局部结构的任务, 看起来受益于在压缩前先在局部视图中形成视觉特征.

<!-- page 16 of 18 -->

Table A3: Full per-benchmark results for in-ViT compression design ablations. All variants share the same end-to-end 16× compression ratio and insertion depth $k = 6 ,$ differing only in how the 4× in-ViT compression stage is realized. FLOPs are reported per slice through the ViT, and bold marks the best score in each column.

表 A3: ViT 内压缩设计消融的完整逐基准结果. 所有变体的端到端压缩率都是 16×, 插入深度都是 $k = 6$, 只在 ViT 内 4× 压缩这一级怎么实现上不同. FLOPs 按单个切片过 ViT 报告, 加粗表示每列最高分 (md 转写后加粗已丢失).

<table><tr><td>Method</td><td>FLOPs (G)</td><td>MMMU</td><td>MathVista</td><td> $MMB_{EN}$ </td><td> $MMB_{CN}$ </td><td>MMStar</td><td>HallBench</td><td>AI2D</td><td>OCRBench</td><td>Avg.</td></tr><tr><td colspan="11">Post-ViT merging</td></tr><tr><td>Post-ViT Baseline</td><td>3555.1</td><td>58.6</td><td>67.3</td><td>83.7</td><td>82.3</td><td>62.9</td><td>51.2</td><td>79.8</td><td>79.1</td><td>70.6</td></tr><tr><td colspan="11">Naive in-ViT merging</td></tr><tr><td>Average Pool</td><td>1368.7</td><td>59.2</td><td>67.2</td><td>83.6</td><td>81.5</td><td>62.4</td><td>47.1</td><td>79.8</td><td>75.7</td><td>69.6</td></tr><tr><td>Pixel-Unshuffle MLP</td><td>1401.2</td><td>58.7</td><td>66.7</td><td>82.4</td><td>81.4</td><td>61.6</td><td>49.2</td><td>80.0</td><td>78.6</td><td>69.8</td></tr><tr><td>Reused MLP</td><td>1490.2</td><td>57.6</td><td>67.0</td><td>81.8</td><td>81.3</td><td>62.3</td><td>48.8</td><td>81.0</td><td>79.5</td><td>69.9</td></tr><tr><td colspan="11">Cross-attention merging</td></tr><tr><td>Cross-Attn (top-left query)</td><td>1402.0</td><td>59.9</td><td>68.6</td><td>83.6</td><td>81.5</td><td>61.1</td><td>50.8</td><td>80.1</td><td>78.2</td><td>70.5</td></tr><tr><td>Cross-Attn (mean query)</td><td>1402.0</td><td>61.0</td><td>66.0</td><td>82.2</td><td>81.5</td><td>61.5</td><td>47.5</td><td>80.6</td><td>78.5</td><td>69.9</td></tr><tr><td colspan="11">Window-attention merging</td></tr><tr><td>Win-Attn w/ MLP</td><td>1484.1</td><td>58.8</td><td>67.4</td><td>83.5</td><td>81.7</td><td>62.7</td><td>47.3</td><td>80.5</td><td>78.9</td><td>70.1</td></tr><tr><td>Win-Attn w/ Reused MLP</td><td>1573.1</td><td>59.6</td><td>68.6</td><td>83.4</td><td>81.6</td><td>62.9</td><td>52.0</td><td>80.6</td><td>76.7</td><td>70.7</td></tr></table>

Table A4: Comparison of connector designs. We compare the MLP downsampler against the resampler under the SE setting across multiple downsampling rates. OCRBench is divided by 10, and Avg. is computed over the eight benchmarks shown.

表 A4: 连接器设计对比. 在 SE 设置下, 按多个降采样率比较 MLP 降采样器和 resampler. OCRBench 除以 10, Avg. 是表中八个基准的平均.

> **对一下:** 只有表 A4 写了 「OCRBench 除以 10」, 其他表的 OCRBench 是另一套量程吗?
> 是同一套. 表 A4 的 MLP 行和表 1 的 SE 行逐格相同 (比如 4×/4M 的 OCRBench 都是 82.0, 16×/8M 都是 79.1), 表 A3, 表 A2 的基线行也和它相同. 所以全文所有表里 OCRBench 都是除以 10 之后的数, 原始分是 0 到 1000 的计数, 82.0 对应 820. 这也是八项能直接平均的前提; 只是这条说明只写在表 A4 一处.

<table><tr><td>Data Scale</td><td>Connector</td><td>MMMU</td><td>MathVista</td><td> $MMB_{EN}$ </td><td> $MMB_{CN}$ </td><td>MMStar</td><td>HallBench</td><td>AI2D</td><td>OCRBench</td><td>Avg.</td></tr><tr><td colspan="11">Downsampling Rate 4×</td></tr><tr><td rowspan="2">4M</td><td>Resampler</td><td>57.4</td><td>62.7</td><td>80.3</td><td>78.9</td><td>60.7</td><td>46.2</td><td>78.1</td><td>73.9</td><td>67.3</td></tr><tr><td>MLP</td><td>61.9</td><td>66.7</td><td>82.9</td><td>79.5</td><td>62.3</td><td>49.1</td><td>80.5</td><td>82.0</td><td>70.6</td></tr><tr><td rowspan="2">8M</td><td>Resampler</td><td>57.9</td><td>61.7</td><td>80.4</td><td>77.9</td><td>58.9</td><td>49.1</td><td>78.2</td><td>68.7</td><td>66.6</td></tr><tr><td>MLP</td><td>60.3</td><td>71.2</td><td>85.2</td><td>83.4</td><td>64.3</td><td>56.3</td><td>82.0</td><td>83.6</td><td>73.3</td></tr><tr><td colspan="11">Downsampling Rate 16×</td></tr><tr><td rowspan="2">4M</td><td>Resampler</td><td>58.7</td><td>62.3</td><td>79.6</td><td>78.2</td><td>59.7</td><td>49.5</td><td>76.9</td><td>75.1</td><td>67.5</td></tr><tr><td>MLP</td><td>57.9</td><td>63.0</td><td>79.4</td><td>79.1</td><td>60.6</td><td>50.5</td><td>77.7</td><td>77.5</td><td>68.2</td></tr><tr><td rowspan="2">8M</td><td>Resampler</td><td>57.1</td><td>65.9</td><td>81.9</td><td>81.3</td><td>61.3</td><td>49.1</td><td>80.3</td><td>78.3</td><td>69.4</td></tr><tr><td>MLP</td><td>58.6</td><td>67.3</td><td>83.7</td><td>82.3</td><td>62.9</td><td>51.2</td><td>79.8</td><td>79.1</td><td>70.6</td></tr><tr><td rowspan="2">16M</td><td>Resampler</td><td>59.1</td><td>69.1</td><td>84.0</td><td>83.5</td><td>64.1</td><td>54.3</td><td>81.2</td><td>81.2</td><td>72.1</td></tr><tr><td>MLP</td><td>59.1</td><td>71.0</td><td>84.9</td><td>83.5</td><td>65.5</td><td>51.5</td><td>81.2</td><td>83.2</td><td>72.5</td></tr></table>

Within our tested settings, the advantage of SE therefore appears to come less from the compressor itself and more from the locality of the preceding visual encoding.

所以在我们测过的设置内, SE 的优势看起来与其说来自压缩器本身, 不如说来自前面视觉编码的局部性.

### B.2 Detailed Results of Connector Designs (连接器设计的详细结果)

The detailed results in Table A4 clarify why we use the MLP connector as the post-ViT baseline. Its largest gains appear at 4× compression, where the output sequence still preserves a relatively rich coarse layout. In this regime, pixel-unshuffle can exploit its built-in spatial structure: each output token is formed from a fixed local patch group and remains tied to a local image neighborhood. The resampler, by contrast, summarizes the ViT output through learnable queries, so its outputs no longer have fixed spatial correspondence and must learn this organization from data.

表 A4 的详细结果说明了我们为什么用 MLP 连接器作 ViT 后基线. 它最大的优势出现在 4× 压缩下, 这时输出序列仍保留相对丰富的粗粒度布局. 在这个区间, pixel-unshuffle 能利用它内置的空间结构: 每个输出 token 都由一个固定的局部 patch 组构成, 和一块局部图像邻域绑定. 相比之下, resampler 通过可学习查询来概括 ViT 输出, 输出不再有固定的空间对应, 这种组织方式必须从数据中学出来.

As compression becomes more aggressive, the gap narrows but does not reverse. At 16× compression, both connectors must discard more spatial detail, reducing the benefit of an explicitly locality-preserving merge. Even in the most favorable setting for the resampler, with 16M training samples, MLP remains slightly ahead. This suggests that the resampler can partially learn useful aggregation with enough data and a tight token budget, but it does not provide a stronger default than the simpler spatially structured connector. We therefore use the MLP connector as the strongest post-ViT baseline before asking whether part of the compression should be moved inside the ViT.

压缩越激进, 差距越小, 但不反转. 16× 压缩下, 两种连接器都得丢掉更多空间细节, 显式保局部性的合并带来的好处随之减少. 即使在对 resampler 最有利的设置, 即 16M 训练样本下, MLP 仍略微领先. 这说明数据足够, token 预算紧时, resampler 能部分学会有用的聚合, 但它并不比更简单的, 带空间结构的连接器更适合作默认选择. 所以在追问 「是否该把一部分压缩挪进 ViT」 之前, 我们先用 MLP 连接器作为最强的 ViT 后基线.

<!-- page 17 of 18 -->

Table A5: Ablation on the open-source LLaVA-OneVision setting. We evaluate different in-ViT compressor designs under the open-source dataset.

表 A5: 开源 LLaVA-OneVision 设置下的消融. 在开源数据集上评估不同的 ViT 内压缩器设计.

<table><tr><td>Method</td><td>MMMU</td><td>MathVista</td><td> $MMB_{EN}$ </td><td> $MMB_{CN}$ </td><td>MMStar</td><td>HallBench</td><td>AI2D</td><td>OCRBench</td><td>Avg.</td></tr><tr><td colspan="10">LLaVA-OneVision Open-source Setting</td></tr><tr><td>Post-ViT Baseline</td><td>46.3</td><td>62.2</td><td>74.9</td><td>71.6</td><td>56.7</td><td>40.3</td><td>79.9</td><td>64.7</td><td>62.1</td></tr><tr><td>Average Pool</td><td>47.6</td><td>62.4</td><td>75.4</td><td>73.1</td><td>56.3</td><td>40.3</td><td>81.5</td><td>62.9</td><td>62.4</td></tr><tr><td>Pixel-Unshuffle MLP</td><td>46.6</td><td>62.3</td><td>72.8</td><td>72.2</td><td>51.7</td><td>38.3</td><td>80.2</td><td>58.7</td><td>60.4</td></tr><tr><td>Reused MLP</td><td>45.3</td><td>60.4</td><td>76.1</td><td>74.1</td><td>55.3</td><td>40.7</td><td>81.2</td><td>63.7</td><td>62.1</td></tr><tr><td>Cross-Attn (top-left)</td><td>48.6</td><td>62.0</td><td>75.1</td><td>72.5</td><td>56.4</td><td>44.7</td><td>80.5</td><td>64.8</td><td>63.1</td></tr><tr><td>Cross-Attn (mean)</td><td>47.6</td><td>62.4</td><td>75.4</td><td>73.1</td><td>56.3</td><td>40.3</td><td>81.5</td><td>62.9</td><td>62.4</td></tr><tr><td>Win-Attn w/ MLP</td><td>50.9</td><td>61.4</td><td>75.4</td><td>73.9</td><td>54.7</td><td>42.7</td><td>81.8</td><td>65.0</td><td>63.2</td></tr><tr><td>Win-Attn w/ Reused MLP</td><td>48.3</td><td>63.5</td><td>76.7</td><td>73.5</td><td>57.0</td><td>42.7</td><td>81.1</td><td>64.6</td><td>63.4</td></tr></table>

> **想:** 表 A5 里 Average Pool 和 Cross-Attn (mean) 两行, 数字是不是一模一样?
> 是, 八个分项和平均分完全相同: 47.6, 62.4, 75.4, 73.1, 56.3, 40.3, 81.5, 62.9, 平均 62.4. 一个是无参数池化, 一个是带交叉注意力的可学习合并, 八项全部同分的可能性极小, 更像是复制时多粘了一行, PDF 文字层也是这样. 还要注意这张表里 Average Pool 的 62.4 高于基线 62.1, 和自有数据上 「平均池化掉 1 分」 (表 4(a)) 的方向相反; 如果这一行是误粘, 这个反差也就无从谈起. 表 A5 也没有 FLOPs 列.

Table A6: Comparison of different ViT internal downsampling strategies across training scales. All systems share an identical architecture, training recipe, data, and end-to-end 16× compression ratio. They differ only in the downsampling module design.

表 A6: 不同训练规模下几种 ViT 内降采样策略的对比. 所有系统的架构, 训练配方, 数据和端到端 16× 压缩率完全相同, 只在降采样模块的设计上不同.

<table><tr><td>Data Scale</td><td>Method</td><td>MMMU</td><td>MathVista</td><td> $MMB_{EN}$ </td><td> $MMB_{CN}$ </td><td>MMStar</td><td>HallBench</td><td>AI2D</td><td>OCRBench</td><td>Avg.</td></tr><tr><td rowspan="3">8M</td><td>Win-Attn w/ Reused MLP</td><td>59.6</td><td>68.6</td><td>83.4</td><td>81.6</td><td>62.9</td><td>52.0</td><td>80.6</td><td>76.7</td><td>70.7</td></tr><tr><td>Cross-Attn (top-left)</td><td>59.9</td><td>68.6</td><td>83.6</td><td>81.5</td><td>61.1</td><td>50.8</td><td>80.1</td><td>78.2</td><td>70.5</td></tr><tr><td>Cross-Attn (mean)</td><td>61.0</td><td>66.0</td><td>82.2</td><td>81.5</td><td>61.5</td><td>47.5</td><td>80.6</td><td>78.5</td><td>69.8</td></tr><tr><td rowspan="3">16M</td><td>Win-Attn w/ Reused MLP</td><td>61.2</td><td>71.1</td><td>84.1</td><td>83.7</td><td>65.3</td><td>54.7</td><td>81.8</td><td>83.5</td><td>73.1</td></tr><tr><td>Cross-Attn (top-left)</td><td>61.2</td><td>69.2</td><td>85.2</td><td>83.7</td><td>63.5</td><td>52.6</td><td>82.3</td><td>81.0</td><td>72.3</td></tr><tr><td>Cross-Attn (mean)</td><td>61.0</td><td>69.3</td><td>84.6</td><td>83.1</td><td>64.4</td><td>55.3</td><td>81.4</td><td>83.2</td><td>72.8</td></tr></table>

> **问:** 表 A6 的 16M Win-Attn 行应该就是主结果里 16M 的 「Ours」, 两处对得上吗?
> 差一格. 表 A2 的 16M Ours 是 61.2, 71.1, 84.1, 83.3, 65.3, 54.7, 81.8, 83.5, 平均 73.1; 表 A6 除了 MMB<sub>CN</sub> 写成 83.7, 其余七格相同. 用 83.7 算八项平均是 73.175, 应印作 73.2, 表里却是 73.1; 用 83.3 算是 73.125, 正好印 73.1. 图 3(c) 在 16M 处的数据标签也是 83.3. 所以表 A6 这一格的 83.7 应是笔误, 很可能是抄了下一行 Cross-Attn (top-left) 同列的 83.7.

### B.3 Additional Ablations on the Open-Source LLaVA-OneVision Setting (开源 LLaVA-OneVision 设置下的补充消融)

Table A5 further evaluates the same family of in-ViT downsampling designs under the open-source LLaVA-OneVision training setting. The trend is broadly consistent with the in-house ablations in the main paper: naively inserting a learnable MLP merger inside the ViT is not sufficient, as the plain MLP variant drops from the baseline average of 62.1 to 60.4. In contrast, designs that introduce local interaction before token reduction are substantially more robust. Cross-attention and window-attention variants improve over the plain MLP, suggesting that early compression benefits from first allowing the tokens within each local 2 × 2 region to exchange information.

表 A5 在开源的 LLaVA-OneVision 训练设置下, 进一步评估同一族 ViT 内降采样设计. 趋势和正文里自有数据上的消融大体一致: 在 ViT 内部朴素地插一个可学习 MLP 合并器是不够的, 普通 MLP 变体的平均分从基线的 62.1 掉到 60.4. 相比之下, 在削减 token 之前引入局部交互的设计要稳健得多. 交叉注意力和窗口注意力变体都比普通 MLP 好, 说明早压缩受益于先让每个局部 2 × 2 区域内的 token 互相交换信息.

Among all variants, Win-Attn w/ Reused MLP achieves the best average score, improving the baseline from 62.1 to 63.4. The gain is modest but consistent with the main-paper conclusion: local contextualization and parameter-reuse initialization are complementary. Compared with Win-Attn w/ MLP, reuse improves the average score from 63.2 to 63.4. This mixed per-benchmark pattern indicates that the open-source setting is somewhat noisier, but the best average performance still comes from the reused window-attention design, supporting its transfer beyond the in-house training recipe.

所有变体中, Win-Attn 加复用 MLP 的平均分最高, 把基线从 62.1 提到 63.4. 提升不大, 但和正文结论一致: 局部上下文化和参数复用初始化是互补的. 相对 Win-Attn 加普通 MLP, 复用把平均分从 63.2 提到 63.4. 逐基准的结果有输有赢, 说明开源设置噪声更大一些, 但最好的平均表现仍来自复用的窗口注意力设计, 支持它能迁移到自有训练配方之外.

## C Hyperparameters (超参数)

Table A7 and Table A8 provide the detailed optimization settings for the four-stage training recipe described in Section 4.1. Both recipes begin with a warmup stage for vision-language alignment, continue with high-quality image training, and end with supervised instruction tuning. The tables report the learning-rate schedule, training length, warmup steps, trainable modules, and packing-equivalent per-GPU batch size for the in-house data setting and the LLaVA-OneVision training setting, respectively.

表 A7 和表 A8 给出 4.1 节所述四阶段训练配方的详细优化设置. 两套配方都从一个做视觉语言对齐的 warmup 阶段开始, 接着做高质量图像训练, 最后做有监督指令微调. 两张表分别给出自有数据设置和 LLaVA-OneVision 训练设置下的学习率调度, 训练长度, warmup 步数, 可训练模块, 以及按 packing 折算的每 GPU 批大小.

## D Limitations (局限)

While LLaVA-UHD v4 significantly accelerates high-resolution visual encoding, several limitations remain for future work. First, our intra-ViT compression module applies a fixed and uniform spatial downsampling rate across all patches. It does not adapt to the varying information density within an image, making dynamic, content-aware token reduction (e.g., allocating more tokens to dense text and fewer to plain backgrounds) an important next step. Second, the optimal insertion depth for the compressor (k = 6) was empirically determined for the SigLIP 2 backbone; migrating to architecturally distinct or substantially deeper vision encoders may require re-evaluating this hyperparameter. Finally, although slice-based encoding excels at fine-grained perception, it inherently fragments high-resolution context across slice boundaries, relying primarily on the low-resolution thumbnail to bridge global interactions.

LLaVA-UHD v4 显著加速了高分辨率视觉编码, 但仍有几处局限留待后续工作. 第一, 我们的 ViT 内压缩模块对所有 patch 用固定, 统一的空间降采样率, 不随图像内部信息密度的变化而调整, 因此动态的, 感知内容的 token 削减 (比如给密集文字多分 token, 给纯背景少分) 是重要的下一步. 第二, 压缩器的最佳插入深度 (k = 6) 是针对 SigLIP 2 主干凭经验定的; 换到架构不同或深得多的视觉编码器, 可能需要重新评估这个超参数. 最后, 切片编码虽然擅长细粒度感知, 但本质上会在切片边界处割裂高分辨率上下文, 全局交互主要靠低分辨率缩略图来衔接.

<!-- page 18 of 18 -->

Table A7: Training hyperparameters on in-house data.

表 A7: 自有数据上的训练超参数.

| Stage | LR | LR<sub>min</sub> | Trainable | Batch size |
| --- | --- | --- | --- | --- |
| 1 | 1.0×10<sup>-4</sup> | 5.0×10<sup>-5</sup> | ViT / Connector | 32 |
| 2 | 1.0×10<sup>-5</sup> | 5.0×10<sup>-6</sup> | ViT | 6 |
| 3 | 5.0×10<sup>-5</sup> | 1.0×10<sup>-5</sup> | Full | 6 |
| 4 | 1.0×10<sup>-5</sup> | 1.0×10<sup>-6</sup> | Full | 9 |

Table A8: Training hyperparameters on LLaVA-OneVision data.

表 A8: LLaVA-OneVision 数据上的训练超参数.

| Stage | LR | LR<sub>min</sub> | Trainable | Batch size |
| --- | --- | --- | --- | --- |
| 1 | 1.0×10<sup>-4</sup> | 5.0×10<sup>-5</sup> | ViT / Connector | 16 |
| 2 | 1.0×10<sup>-5</sup> | 5.0×10<sup>-6</sup> | Full | 20 |
| 3 | 5.0×10<sup>-5</sup> | 1.0×10<sup>-5</sup> | Full | 34 |
| 4 | 1.0×10<sup>-5</sup> | 1.0×10<sup>-6</sup> | Full | 11 |

两张表的列依次是: 阶段, 峰值学习率, 最低学习率, 可训练模块, 每 GPU 批大小. 附录 C 文字说表里还有训练长度和 warmup 步数, 两张表实际都没有这两列.

> **核对:** 批大小在四个阶段里忽高忽低, 能看出每阶段训了多少数据吗?
> 看不出. 表里的 Batch size 是 「按 packing 折算的每 GPU 批大小」, 本页没给 GPU 数, 序列长度, 训练步数, 也没给附录 C 声称会报告的训练长度和 warmup 步数. 所以 32, 6, 6, 9 这组数既换算不成全局批大小, 也换算不成 token 数. 两套数据的学习率完全相同 (峰值 1.0×10<sup>-4</sup>, 1.0×10<sup>-5</sup>, 5.0×10<sup>-5</sup>, 1.0×10<sup>-5</sup>), 只有可训练模块和批大小不同. 正文 4M 到 64M 的 「数据规模」 指的是哪个阶段的样本数, 全文也没有说明.
