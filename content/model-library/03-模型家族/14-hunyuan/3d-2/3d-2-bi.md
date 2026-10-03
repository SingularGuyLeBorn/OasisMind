---
title: "Hunyuan3D 2.0 · 对照译稿"
category: "模型库"
tags: ["Hunyuan", "对照译稿"]
published: true
excerpt: "Hunyuan3D 2.0 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 28 -->

arXiv:2501.12202v5 [cs.CV] 14 May 2026

arXiv 编号 2501.12202 的第 5 版，分类 cs.CV，日期 2026 年 5 月 14 日。这是 arXiv 印在 PDF 左侧页边的版本戳。

> **停一下：** 14 May 2026 能不能当 Hunyuan3D 2.0 的首发日？
> 不能。这行戳记的是 v5 这一版的日期。编号前缀 2501 是 arXiv 按首版提交年月分配的，说明首版在 2025 年 1 月，具体哪一天本文没有印。正文也能看出这一版改过：第 17 页第 6 节把 Hunyuan3D-Studio 链到参考文献 [90]，那是 arXiv:2509.12815，一篇 2025 年的另一份报告，2025 年 1 月的首版不可能引用它；图 1 右下的 Studio 面板（Low Poly, Sketch to 3D, Animation）也要按 v5 的描述来读。引用时首发只能写 「2025 年 1 月（据编号）」，14 May 2026 只能写成 v5 的日期。这份报告也不是 Hunyuan3D-1.0，后者是参考文献 [107]，编号 arXiv:2411.02293。

# Hunyuan3D 2.0: Scaling Diffusion Models for High Resolution Textured 3D Assets Generation

Hunyuan3D 2.0：缩放扩散模型，生成高分辨率带纹理的 3D 资产

“ Living out everyone’s imagination on creating and manipulating 3D assets.”

题记：让每个人对创造和操控 3D 资产的想象都能成真。

**Hunyuan3D Team** ∗

**混元 3D 团队** ∗（星号指向页脚，贡献者名单在报告末尾。）

## Abstract

We present Hunyuan3D 2.0, an advanced large-scale 3D synthesis system for generating high-resolution textured 3D assets. This system includes two foundation components: a large-scale shape generation model – Hunyuan3D-DiT, and a largescale texture synthesis model – Hunyuan3D-Paint. The shape generative model, built on a scalable flow-based diffusion transformer, aims to create geometry that properly aligns with a given condition image, laying a solid foundation for downstream applications. The texture synthesis model, benefiting from strong geometric and diffusion priors, produces high-resolution and vibrant texture maps for either generated or hand-crafted meshes. Furthermore, we build Hunyuan3D-Studio – a versatile, user-friendly production platform that simplifies the re-creation process of 3D assets. It allows both professional and amateur users to manipulate or even animate their meshes efficiently. We systematically evaluate our models, showing that Hunyuan3D 2.0 outperforms previous state-of-the-art models, including the open-source models and closed-source models in geometry details, condition alignment, texture quality, and etc. Hunyuan3D 2.0 is publicly released in order to fill the gaps in the open-source 3D community for large-scale foundation generative models. The code and pre-trained weights of our models are available at: [https://github.com/Tencent/Hunyuan3D-2.](https://github.com/Tencent/Hunyuan3D-2)

![Image block](images/p01-image.png)

上面这张是首页题图，一幅由多个 3D 渲染资产拼成的场景：左上一艘飞艇，左边骑红马的古装女子，中间骑摩托的狐狸，几枚升空的火箭和爆炸火光，右边的城堡和龙，扛着棍子的猴子，举着 「HY3D」 牌子的企鹅，持剑持盾的金甲骑士。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">∗ Hunyuan3D team contributors are listed in the end of report.</span></small>

页脚：∗ 混元 3D 团队的贡献者名单列在报告末尾（第 21 页第 9 节）。

<!-- page 2 of 28 -->

![Image block](images/p02-hunyuan3d-dit-generated-shape-generation.png)

上面这张是图 1 左上的面板：紫色的模型套件板上挂着一排素模，有马，佛龛，小屋，机器人，飞机，宇航员，汽车，马车，狐狸，火车头，螃蟹，剑。左上角有一个标签 「1.1B LDM」，左中有一个标签 「High Resolution」。

Hunyuan3D-DiT Generated Shape Generation

Hunyuan3D-DiT 生成的形状。

![Image block](images/p02-hunyuan3d-paint-generated-texture-synthesis.png)

上面这张是图 1 右上的面板：16 格带纹理的资产，有火箭爆炸场景，跑车，树，石山，龙，云朵，持斧的鳄鱼战士，粉色城堡，鳄鱼，蓝色花朵，乌龟，戴墨镜的企鹅，宝箱，红叶盆景，城堡，骑电动车的战士，中间一栏写着 「Hunyuan3D-Paint Generated Texture Synthesis」。

Hunyuan3D-Paint Generated Texture Synthesis

Hunyuan3D-Paint 生成的纹理。

![Image block](images/p02-figure-1-an-overall-of-hunyuan3d-2-0-system.png)

上面这张文件名带着图 1 的图注，画面其实是图 1 左下的低多边形场景：飞艇，蘑菇状的树，路牌，仙人掌，硬币，一只低面数的怪兽，全部是带网格线的白模。MinerU 按下一行文字给它起名，所以名字和内容对不上。

Figure 1: An overall of Hunyuan3D 2.0 system.

图 1: Hunyuan3D 2.0 系统总览。

> **核对：** 图 1 左上角印着 「1.1B LDM」，这是 Hunyuan3D-DiT 的参数量吗？
> 全文只有这一处参数量，而且只在图里。它印在图 1 「Hunyuan3D-DiT Generated Shape Generation」 面板左上的标签上，旁边另一个标签是 「High Resolution」；正文 28 页没有一句话给出任何模块的参数量，摘要里的 「large-scale」 也不带数字。从面板归属看，1.1B 说的是形状生成用的潜扩散模型（LDM），但它是否包含 ShapeVAE 和 DINOv2 图像编码器，本文没说。图 4 标了双流块 ×16，单流块 ×32，却没有给宽度和头数，也推不出 1.1B. Hunyuan3D-Paint，去光照模型，ShapeVAE 各自多大，全文都没有印。引用时只能写 「图 1 标注 1.1B LDM」，不能展开成各模块的参数表。

![Image block](images/p02-hunyuan3d-studio-low-poly-sketch-to-3d-animation.png)

上面这张是图 1 右下的面板：左边画架上是一张男孩线稿，右边是生成的金发蓝衣男孩的三个视角，下面一排穿西装的卡通人物在做翻滚动作，是动画的连续帧。底部深绿色栏写着 Studio 的功能名。

Hunyuan3D-Studio Low Poly, Sketch to 3D, Animation…

Hunyuan3D-Studio：低多边形，草图转 3D，动画等。

<!-- page 3 of 28 -->

## 1 Introduction（引言）

Digital 3D assets have woven themselves into the very fabric of modern life and production. In the realms of gaming and film, these assets are vibrant expressions of creators’ imaginations, spreading joy and crafting immersive experiences for players and audiences alike. In the fields of physical simulation and embodied AI, 3D assets serve as essential building blocks, enabling machines and robots to mimic and comprehend the real world. Yet, the journey of creating 3D assets is anything but straightforward; it is often a complex, time-consuming, and costly endeavor. A typical production pipeline may involve stages like sketch design, digital modeling, and 3D texture mapping, each demanding high expertise and proficiency in digital content creation software. As a result, the automated generation of high-resolution digital 3D assets has emerged as one of the most exciting and sought-after topics in recent years.

数字 3D 资产已经深深织进现代生活和生产。在游戏和影视领域，这些资产生动地表达了创作者的想象，给玩家和观众带来快乐和沉浸式体验。在物理仿真和具身智能领域，3D 资产是基本构件，让机器和机器人能够模仿和理解真实世界。然而创建 3D 资产的过程一点也不简单，往往复杂，耗时，成本高。一条典型的生产管线可能包括草图设计，数字建模，3D 纹理贴图等阶段，每个阶段都要求对数字内容创作软件有很高的专业度和熟练度。因此，自动生成高分辨率数字 3D 资产成了近年最令人兴奋，最受追捧的课题之一。

Despite the importance of automated 3D generation and rapid development in image and video generation fueled by the rise of diffusion models [33, 74, 24, 50, 43], the field of 3D generation appears to be relatively stagnant in the era of large models and big data, with only a handful of works making gradual progress [112, 119, 49]. Building on the 3DShape2Vectset [112], Michelangelo [119] and CLAY [114] gradually enhance shape generation performance, where CLAY is the first work to demonstrate the unprecedented potential of diffusion models in 3D asset generation. Nevertheless, progress in the 3D domain remains limited. As evidenced in other fields [115, 4, 3], the prosperity of a domain in the era of large models usually relies on a strong open-source foundational model, such as Stable Diffusion [74, 69, 24] for image generation, LLaMA [91, 92, 22] for language models, and HunyuanVideo [43] for video generation. To this end, we present Hunyuan3D 2.0, a 3D asset creation system with two strong open-sourced 3D foundation models: Hunyuan3D-DiT for generative shape creation and Hunyuan3D-Paint for generative texture synthesis.

尽管自动 3D 生成很重要，图像和视频生成也在扩散模型兴起的推动下飞速发展 [33, 74, 24, 50, 43]，但在大模型和大数据时代，3D 生成领域显得相对停滞，只有少数工作在逐步推进 [112, 119, 49]。在 3DShape2Vectset [112] 的基础上，Michelangelo [119] 和 CLAY [114] 逐步提升了形状生成的表现，其中 CLAY 是第一个展示扩散模型在 3D 资产生成上空前潜力的工作。尽管如此，3D 领域的进展仍然有限。正如其他领域所表明的 [115, 4, 3]，一个领域在大模型时代的繁荣通常依赖一个强大的开源基础模型，例如图像生成的 Stable Diffusion [74, 69, 24]，语言模型的 LLaMA [91, 92, 22]，视频生成的 HunyuanVideo [43]。为此，我们推出 Hunyuan3D 2.0，一个 3D 资产创作系统，包含两个强大的开源 3D 基础模型：负责生成式形状创建的 Hunyuan3D-DiT，以及负责生成式纹理合成的 Hunyuan3D-Paint。

Hunyuan3D 2.0 features a two-stage generation pipeline, starting with the creation of a bare mesh, followed by the synthesis of a texture map for that mesh. This strategy is effective for decoupling the difficulties of shape and texture generation [34, 107, 46, 47] and also provides flexibility for texturing either generated or handcrafted meshes. With this architecture, our shape creation model – Hunyuan3D-DiT, is designed as a large-scale flow-based diffusion model. As a prerequisite, we first train an autoencoder – Hunyuan3D-ShapeVAE using advanced techniques such as mesh surface importance sampling and variational token length to capture fine-grained details on the meshes. Then, we build up a dual-single stream transformer [45] on the latent space of our VAE with the flow-matching [53, 24] objective. Our texture generation model – Hunyuan3D-Paint is made of a novel mesh-conditioned multi-view generation pipeline and a number of sophisticated techniques for preprocessing and baking multi-view images into high-resolution texture maps.

Hunyuan3D 2.0 采用两阶段生成管线：先生成素模（bare mesh），再为这个网格合成纹理贴图。这种策略能有效解耦形状生成和纹理生成的难点 [34, 107, 46, 47]，也让系统可以灵活地给生成的网格或手工制作的网格上纹理。在这个架构下，形状创建模型 Hunyuan3D-DiT 被设计成一个大规模的基于流的扩散模型。作为前提，我们先训练一个自编码器 Hunyuan3D-ShapeVAE，用网格表面重要性采样和可变 token 长度等技术捕捉网格上的细粒度细节。然后在 VAE 的潜空间上搭建一个双流-单流 transformer [45]，用 flow matching [53, 24] 目标训练。纹理生成模型 Hunyuan3D-Paint 由一条新的网格条件多视图生成管线，以及一系列把多视图图像预处理并烘焙成高分辨率纹理贴图的精细技术组成。

We performed an in-depth comparison of Hunyuan3D 2.0 in relation to leading 3D generation models worldwide, including three commercial closed-source end-to-end products, an end-to-end open-sourced model Trellis [101], and several separate models [9, 37, 99, 111, 55, 59] for shape and texture generation. We report visual and quantitative evaluation results across three dimensions: generated textured mesh, bare mesh, and texture map. We also provided user study results on 300 test cases involving 50 participants. The comparison shows the superiority of Hunyuan3D 2.0 in alignment between conditional images and generated meshes, generation of fine-grained details, and human preference ratings.

我们把 Hunyuan3D 2.0 和全球领先的 3D 生成模型做了深入比较，包括三个商业闭源的端到端产品，一个端到端开源模型 Trellis [101]，以及若干分别做形状和纹理生成的模型 [9, 37, 99, 111, 55, 59]。我们从三个维度报告视觉和定量评估结果：带纹理的网格，素模，纹理贴图。我们还提供了 50 名参与者在 300 个测试样例上的用户研究结果。比较显示，Hunyuan3D 2.0 在条件图像与生成网格的对齐，细粒度细节的生成，以及人类偏好评分上都更好。

## 2 Hunyuan3D 2.0 Architecture（Hunyuan3D 2.0 架构）

In this section, we elaborate on the model architecture of Hunyuan3D 2.0, focusing on two main components: the shape generation model and the texture generation model. Fig. 2 illustrates the pipeline of Hunyuan3D 2.0 for creating a high-resolution textured 3D asset. Given an input image, Hunyuan3D-DiT initially generates a high-fidelity bare mesh via the shape generation model. This model comprises a Hunyuan3D-ShapeVAE and a Hunyuan3D-DiT, which will be discussed in Sec. 3. Subsequently, by leveraging strong geometric priors and the input image, we introduce Hunyuan3D-Paint as our texture generation model in Sec. 4. This model produces self-consistent multi-view outputs, which are used for baking high-definition texture maps.

本节详细介绍 Hunyuan3D 2.0 的模型架构，重点是两个主要组件：形状生成模型和纹理生成模型。图 2 展示了 Hunyuan3D 2.0 生成高分辨率带纹理 3D 资产的管线。给定一张输入图像，Hunyuan3D-DiT 先通过形状生成模型生成一个高保真素模。这个模型由 Hunyuan3D-ShapeVAE 和 Hunyuan3D-DiT 组成，在第 3 节讨论。随后，借助强几何先验和输入图像，我们在第 4 节介绍纹理生成模型 Hunyuan3D-Paint。这个模型产出自洽的多视图结果，用来烘焙高清纹理贴图。

<!-- page 4 of 28 -->

![Image block](images/p04-figure-2-an-overall-of-hunyuan3d-2-0-architecture-for.png)

上面这张是图 2。左上 「Hunyuan3D-ShapeVAE」：Uniform 和 Importance 两团点云经 FPS 得到查询 Q，点云本身作 KV，进 Cross Attention，再过 Self Attention x 8 得到 Latent Tokens；解码端过 Self Attention x 16，由 Grid Queries 做 Cross Attention，经 Marching Cube 得到 Decoded Mesh。左下 「Hunyuan3D-DiT」：Latent Tokens 进 Denoising Transformer，以 Image 为条件，虚线回环标着 「Steps x N」。中间 「Hunyuan3D-Paint」：Input Image 经 Image Delighting 得到 Delighted Image，进 Reference Branch；Normal 和 Position 两组四视图进 Generation Branch；两支之间是 Multi-Task Attention；输出的四视图经 Single Image Super-Resolution，再 Baking。右侧四行是成品：戴猫耳帽的女孩，穿背带裤的小猪，驮着亭子的大象，带线框的小鸟。

Figure 2: An overall of Hunyuan3D 2.0 architecture for 3D generation. It consists of two main components: Hunyuan3D-DiT for generating bare mesh from a given input image and Hunyuan3D-Paint for generating a textured map for the generated bare mesh. Hunyuan3D-Paint takes geometry conditions – normal maps and position maps of generated mesh as inputs and generates multi-view images for texture baking.

图 2: Hunyuan3D 2.0 的 3D 生成架构总览。它由两个主要组件构成：Hunyuan3D-DiT 从给定输入图像生成素模，Hunyuan3D-Paint 为生成的素模生成纹理贴图。Hunyuan3D-Paint 以几何条件，即生成网格的法线图和位置图为输入，生成多视图图像用于纹理烘焙。

## 3 Generative 3D Shape Generation（生成式 3D 形状生成）

Hunyuan3D 2.0 employs the architecture of the latent diffusion model [74, 112, 119, 114] for shape generation. This design is driven by the successful applications of latent diffusion models in image and video generation. Specifically, our shape generation model consists of (1) an autoencoder – Hunyuan3D-ShapeVAE (Sec. 3.1) that compresses the shape of a 3D asset represented by polygon mesh into a sequence of continuous tokens in the latent space; (2) a flow-based diffusion model – Hunyuan3D-DiT (Sec. 3.2), trained on the latent space of ShapeVAE for predicting object token sequences from a user-provided image. The predicted tokens are further decoded into a polygon mesh with VAE decoder. The details of these models are illustrated below.

Hunyuan3D 2.0 的形状生成采用潜扩散模型的架构 [74, 112, 119, 114]。这个设计源于潜扩散模型在图像和视频生成中的成功应用。具体来说，我们的形状生成模型包括（1）自编码器 Hunyuan3D-ShapeVAE（3.1 节），把用多边形网格表示的 3D 资产形状压缩成潜空间里的一串连续 token; (2) 基于流的扩散模型 Hunyuan3D-DiT（3.2 节），在 ShapeVAE 的潜空间上训练，根据用户提供的图像预测物体的 token 序列。预测出的 token 再由 VAE 解码器解码成多边形网格。这些模型的细节如下。

## 3.1 Hunyuan3D-ShapeVAE

Hunyuan3D-ShapeVAE employs vector sets, a compact neural representation for 3D shapes proposed by 3DShape2VecSet [112], which has also been leveraged in the recent work Dora [11]. Followed by Michelangelo [119], we use a variational encoder-decoder transformer for shape compression and decoding. Besides, we choose 3D coordinates and the normal vector of point cloud sampled from the surface of 3D shapes as inputs for the encoder and instruct the decoder to predict the Signed Distance Function (SDF) of the 3D shape, which can be further decoded into triangle mesh via the marching cube algorithm. The overall network architecture is illustrated in Fig. 3.

Hunyuan3D-ShapeVAE 采用向量集（vector set），这是 3DShape2VecSet [112] 提出的一种紧凑的 3D 形状神经表示，近期的 Dora [11] 也用了它。沿用 Michelangelo [119] 的做法，我们用一个变分编码器-解码器 transformer 做形状压缩和解码。此外，我们把从 3D 形状表面采样的点云的 3D 坐标和法向量作为编码器输入，让解码器预测 3D 形状的有符号距离函数（SDF），SDF 再经 marching cube 算法解码成三角网格。整体网络结构见图 3。

**Importance Sampled Point-Query Encoder.** The encoder $\mathcal { E } _ { s }$ aims to extract representative features to characterize 3D shapes. To achieve this, our first design utilizes an attention-based encoder to encode point clouds uniformly sampled from the surface of a 3D shape. However, this design usually fails to reconstruct the details of complex objects. We attribute this difficulty to the variations in the complexity of regions on the shape surface. Therefore, in addition to uniformly sampled point clouds, we designed an importance sampling method∗that samples more points on the edges and corners of the mesh, which provides more complete information for describing complex regions.

**重要性采样的点查询编码器。** 编码器 $\mathcal{E}_s$ 的目标是提取有代表性的特征来刻画 3D 形状。为此，我们的第一版设计用一个基于注意力的编码器，编码从 3D 形状表面均匀采样的点云。但这种设计通常重建不出复杂物体的细节。我们把这个困难归因于形状表面各区域复杂度的差异。因此，除了均匀采样的点云，我们还设计了一种重要性采样方法∗，在网格的边和角上多采点，为描述复杂区域提供更完整的信息。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">∗ Concurrent work [11] also proposes similar importance sampling to improve the VAE reconstruction performance based on similar observations.</span></small>

页脚：∗ 同期工作 [11] 基于类似的观察，也提出了类似的重要性采样来提升 VAE 重建效果。

<!-- page 5 of 28 -->

In detail, for an input mesh, we first collect uniformly sampled surface point clouds $P _ { u } \in \mathbb { R } ^ { M \times 3 }$ and importance sampled surface point clouds $P _ { i }   \in   \mathbb { R } ^ { N \times 3 }$ We use a layer of cross attention, to compress the input point clouds into a set of continuous tokens via a set of point queries [112]. To obtain point queries, we apply Farthest Point Sampling (FPS) separately to $P _ { u }$ and $P _ { i }$ to obtain the uniform point query $Q _ { u } \overset { \mathrm { T T } } { \in } \mathbb { R } ^ { M ^ { \prime } \times 3 }$ and the importance point query $Q _ { i } \in \mathbb { R } ^ { N ^ { \prime } \times 3 }$ . The final point cloud $P \in \mathbb { R } ^ { ( M + N ) \times 3 }$ and point query $Q   \in   \mathbb { R } ^ { ( M ^ { \prime } + N ^ { \prime } ) \times 3 }$ for the cross attention are constructed by concatenating both sources. Then, we encode the point clouds $P$ and point queries $Q$ with Fourier positional encoding followed by a linear projection, resulting $X _ { p } \in \hat { \mathbb { R } ^ { ( M + \hat { N } ) \times d } }$ and $X _ { q } \in$ $\mathbb { R } ^ { ( M ^ { \prime } + \bar { N ^ { \prime } } ) \times d }$ , where d is the width of the transformer. The encoded point cloud and point query are sent to the cross attention followed by a number of self-attention layers, which helps improve the feature representation, to obtain the hidden shape representation $H _ { s } \in \mathbb { R } ^ { ( M ^ { \prime } + N ^ { \prime } ) \times d }$ . Since we adopt the design of variational autoencoder [41], an additional linear projection is applied on $H _ { s }$ to predict the mean $\operatorname { E } ( Z _ { s } ) \in \mathbb { R } ^ { ( M ^ { \prime } + N ^ { \prime } ) \times d _ { 0 } }$ and variance $\mathrm { V a r } ( Z _ { s } ) \in \mathbb { R } ^ { \widetilde { ( M ^ { \prime } + N ^ { \prime } ) } }$ ×d0 of the final latent shape embedding in a token sequence, where $d _ { 0 }$ is the dimension of latent shape embedding.

具体来说，对一个输入网格，我们先采集均匀采样的表面点云 $P_u \in \mathbb{R}^{M\times 3}$ 和重要性采样的表面点云 $P_i \in \mathbb{R}^{N\times 3}$。我们用一层 cross attention，借助一组点查询 [112] 把输入点云压缩成一组连续 token。为了得到点查询，我们对 $P_u$ 和 $P_i$ 分别做最远点采样（FPS），得到均匀点查询 $Q_u \in \mathbb{R}^{M'\times 3}$ 和重要性点查询 $Q_i \in \mathbb{R}^{N'\times 3}$。用于 cross attention 的最终点云 $P \in \mathbb{R}^{(M+N)\times 3}$ 和点查询 $Q \in \mathbb{R}^{(M'+N')\times 3}$ 由两路拼接而成。然后，我们用傅里叶位置编码加一层线性投影编码点云 $P$ 和点查询 $Q$，得到 $X_p \in \mathbb{R}^{(M+N)\times d}$ 和 $X_q \in \mathbb{R}^{(M'+N')\times d}$，其中 d 是 transformer 的宽度。编码后的点云和点查询送入 cross attention，后接若干层 self-attention 来增强特征表示，得到隐藏形状表示 $H_s \in \mathbb{R}^{(M'+N')\times d}$。由于我们采用变分自编码器 [41] 的设计，在 $H_s$ 上再加一层线性投影，预测 token 序列形式的最终潜形状嵌入的均值 $\mathrm{E}(Z_s) \in \mathbb{R}^{(M'+N')\times d_0}$ 和方差 $\mathrm{Var}(Z_s) \in \mathbb{R}^{(M'+N')\times d_0}$，其中 $d_0$ 是潜形状嵌入的维度。（md 这段公式有识别噪声：$Q_u$ 的属于号上多了 「TT」，$X_p$ 和 $X_q$ 的上标多了帽子和横线，方差的 「×d0」 被挤到公式外面。以上按 PDF 文字层写。）

**Decoder.** The decoder $\mathcal { D } _ { s }$ reconstructs the 3D neural field from the latent shape embedding $Z _ { s }$ from the encoder. $\mathcal { D } _ { s }$ starts from a projection layer to transform the latent embedding from dimension $d _ { 0 }$ back to the width of transformer d. Then, a number of self-attention layers further process the hidden embeddings, after which is another point perceiver that takes 3D grid $Q _ { g } \in \mathbb { R } ^ { ( H \times W \times \mathbf { \hat { \mathit { D } } } ) \times 3 }$ as queries to obtain 3D neural field $F _ { g } \in \mathbb { R } ^ { ( F _ { n } \times W \times D ) \times d }$ from the hidden embeddings. We use another linear projection on the neural field to obtain the Sign Distance Function (SDF) $F _ { s d f } \in \mathbb { R } ^ { ( F _ { o } \times W \times D ) \times 1 }$ , which can be decoded into triangle mesh with marching cube algorithms.

**解码器。** 解码器 $\mathcal{D}_s$ 从编码器给出的潜形状嵌入 $Z_s$ 重建 3D 神经场。$\mathcal{D}_s$ 先用一个投影层把潜嵌入从维度 $d_0$ 变回 transformer 宽度 d. 然后若干层 self-attention 进一步处理隐藏嵌入，之后是另一个点感知器（point perceiver），以 3D 网格点 $Q_g \in \mathbb{R}^{(H\times W\times D)\times 3}$ 为查询，从隐藏嵌入得到 3D 神经场 $F_g$。再用一层线性投影把神经场变成有符号距离函数（SDF）$F_{sdf}$，它可以用 marching cube 算法解码成三角网格。

> **对一下：** 解码器的神经场写成 $F_g \in \mathbb{R}^{(F_n\times W\times D)\times d}$，SDF 写成 $(F_o\times W\times D)\times 1$，$F_n$ 和 $F_o$ 是什么？
> 是原文的笔误，不是 MinerU 识别错，PDF 文字层里同样是 「Fn×W×D」 和 「Fo×W×D」。同一句里查询网格写作 $Q_g \in \mathbb{R}^{(H\times W\times D)\times 3}$，神经场和 SDF 是在这些查询点上逐点算出来的，行数必须和 $Q_g$ 相同，所以两处都应是 $H\times W\times D$。图 3 右半边也是这样画的：竖排的 Grid Queries 作为 Q 进 Cross Attention，输出直接去做 Marching Cube，中间没有别的维度变换。$H$，$W$，$D$ 的具体分辨率本文没有给。

**Training Strategy & Implementation.** We employ multiple losses to supervise the model training, including (1) the reconstruction loss that computes MSE loss between predicted SDF $\mathcal { D } _ { s } ( x | Z _ { s } )$ and ground truth $\operatorname { S D F } ( x )$ , and (2) the KL-divergence loss $\mathcal { L } _ { K L }$ to make the latent space compact and con tinuous, which facilitates the training of diffusion models. Due to the dense computation required by complete SDF, the reconstruction loss is calculated as the expectation of losses on randomly sampled points in the space and shape surface. The overall training loss $\mathcal { L } _ { r }$ can be written as,

**训练策略与实现。** 我们用多个损失监督模型训练，包括（1）重建损失，计算预测 SDF $\mathcal{D}_s(x|Z_s)$ 与真值 $\mathrm{SDF}(x)$ 之间的 MSE; (2) KL 散度损失 $\mathcal{L}_{KL}$，让潜空间紧凑且连续，方便扩散模型训练。由于完整 SDF 的计算太密集，重建损失按空间中和形状表面上随机采样点的损失期望来算。总训练损失 $\mathcal{L}_r$ 可以写成：

![Image block](images/p05-figure-3-the-overall-architecture-of-hunyuan3d-shapevae.png)

上面这张是图 3。左边编码端：上方 Uniform 和 Importance 两团点云，分别做 FPS 后拼成查询 Q（蓝色方块来自均匀点云，绿色方块来自重要性点云），两团点云本身拼起来作为 KV，进 Cross Attention，再过 Self Attention x 8，输出 Latent Tokens。右边解码端：Latent Tokens 过 Self Attention x 16 后作为 KV，竖排的 Grid Queries 作为 Q，进 Cross Attention，经 Marching Cube 得到 Decoded Mesh，画面是一个细节很多的机械零件。

Figure 3: The overall architecture of Hunyuan3D-ShapeVAE. Instead of only using uniform sampling on mesh surface, We have developed an importance sampling strategy to extract high-frequency detail information from the input mesh surface, such as edges and corners. This allows the model to better capture and represent the intricate details of 3D shapes. Note that during the point query construction, the Farthest Point Sampling (FPS) operation is performed separately for the uniform point cloud and the importance sampling point cloud.

图 3: Hunyuan3D-ShapeVAE 的整体架构。我们不只在网格表面做均匀采样，还设计了一种重要性采样策略，从输入网格表面提取边，角这类高频细节信息。这让模型能更好地捕捉和表示 3D 形状的精细细节。注意在构造点查询时，最远点采样（FPS）对均匀点云和重要性采样点云分别进行。

$$
\mathcal {L} _ {r} = \mathbb {E} _ {x \in \mathbb {R} ^ {3}} [ \operatorname{MSE} \left(\mathcal {D} _ {s} (x \mid Z _ {s}), \operatorname{SDF} (x)\right) ] + \gamma \mathcal {L} _ {K L} \tag {1}
$$

式（1）：总损失等于空间采样点 x 上解码器预测 SDF 与真值 SDF 的 MSE 的期望，加上 γ 倍的 KL 损失。

where $\gamma$ is the loss weight of KL loss. During training, we also utilize a multi-resolution strategy to

其中 γ 是 KL 损失的权重。训练中我们还使用了多分辨率策略来（句子在 PDF 里接下一行，md 把它断成了两段。）

speed up model convergence, where the length of the latent token sequence is randomly sampled from a predefined set. A shorter sequence reduces the computation cost, and a longer sequence facilitates the reconstruction quality. The longest sequence length is 3072 in our released version, which could support high-resolution shape generation with fine-grained and sharp details.

（接上行）加快模型收敛：潜 token 序列的长度从一个预定义集合里随机采样。序列短则计算成本低，序列长则有利于重建质量。我们发布版本里的最长序列是 3072，可以支持带细粒度，锐利细节的高分辨率形状生成。

> **拆开：** 潜码的长度由什么决定，3072 和表 1 的 1024 是什么关系？
> 按上面的维度，编码器输出 $H_s$ 的行数是 $M'+N'$，也就是两路 FPS 取出的点查询个数之和；原始点数 $M+N$ 只作为 cross attention 的 KV，不决定 token 数。所以 「可变 token 长度」 就是改变 FPS 取点的个数，多分辨率训练时这个数从一个集合里抽。集合里有哪些值，$M'$ 和 $N'$ 怎么分配，本文都没写，只给了上限 3072。第 10 页表 1 的重建对比统一用 1024 个 token（Direct3D 例外，用 3072），所以表 1 的 93.6% 和 89.16% 是 ShapeVAE 在 1024 长度下的成绩，不是发布版 3072 长度下的成绩。式（1）里 γ 的取值也没给。

## 3.2 Hunyuan3D-DiT

Hunyuan3D-DiT is a flow-based diffusion model aimed at producing high-fidelity and high-resolution 3D shapes according to given image prompts.

Hunyuan3D-DiT 是一个基于流的扩散模型，目标是按给定的图像提示生成高保真，高分辨率的 3D 形状。

**Network Structure.** Inspired by FLUX [45], we adopt a dual- and single-stream network structure as in Fig. 4. In dual-stream blocks, latent tokens and condition tokens are processed with separate QKV projections, MLP, and $e t c .$ , but interact within an attention operation. In single-stream blocks,

**网络结构。** 受 FLUX [45] 启发，我们采用双流加单流的网络结构，见图 4。在双流块中，潜 token 和条件 token 各用独立的 QKV 投影，MLP 等处理，但在一次注意力运算中交互。在单流块中，（句子接到下一页。）

<!-- page 6 of 28 -->

![Image block](images/p06-figure-4-overview-of-hunyuan3d-dit-it-adopts-a.png)

上面这张是图 4，分三栏。左栏 「Hunyuan3D-DiT」 总图：Timestep 经 PE 和 MLP 得到调制向量 y；Input Image 经 DINO 和 Linear；Noisy Shape Latent Tokens 经 Linear；两路进 Double Stream Block (×16)，再进 Single Stream Block (×32)，最后经 LayerNorm，Scale & Shift，Linear 输出。中栏 「Double Stream Block」：Shape Tokens 和 Image Tokens 各自有 LayerNorm，Scale & Shift，Linear，QK-Norm，在中间一个共用的 Attention 汇合，之后各自经 Linear，Gate，再各自经 LayerNorm，Scale & Shift，MLP，Gate，分别输出 Shape Output 和 Image Output。右栏 「Single Stream Block」：LayerNorm，Scale & Shift 之后分成两支，一支是 Linear，QK-Norm，Attention，另一支是 Linear，GELU，两支合并后经 Linear，Gate 输出。橙色块有 PE，DINO，Scale & Shift，Attention，Gate，GELU；蓝色块有 MLP, Linear, LayerNorm, QK-Norm, Mod。

Figure 4: Overview of Hunyuan3D-DiT. It adopts a transformer architecture with both double- and single-stream blocks. This design benefits the interaction between modalities of shape and image, helping our model to generate bare meshes with exceptional quality. (Note that the orange blocks have no learnable parameters, the blue blocks contain trainable parameters, and the gray blocks indicate a module composed of more details.)

图 4: Hunyuan3D-DiT 总览。它采用同时包含双流块和单流块的 transformer 架构。这种设计有利于形状和图像两种模态之间的交互，帮助模型生成质量出色的素模。（注：橙色块没有可学习参数，蓝色块含可训练参数，灰色块表示由更多细节组成的模块。）

latent tokens and condition tokens are concatenated and processed by spatial attention and channel attention in parallel. We only use the embedding of the timestep for the modulation modules. Besides, we omit the positional embedding of the latent sequence as the specific latent token of our ShapeVAE in the sequence does not correspond to a fixed location in the 3D grid. Instead, the content of our 3D latent tokens themselves is responsible for figuring out the position/occupancy of the generated shape in the 3D grid, which is different from image/video generation where their tokens are responsible for predicting content in a specific location in 2D/spatial-temporal grid.

（接上页）潜 token 和条件 token 拼接在一起，并行地经过空间注意力和通道注意力处理。调制模块只用时间步的嵌入。此外，我们省去了潜序列的位置编码，因为 ShapeVAE 的某个潜 token 在序列里并不对应 3D 网格中的固定位置。相反，是 3D 潜 token 本身的内容负责确定生成形状在 3D 网格中的位置和占据情况；这和图像/视频生成不同，那里的 token 负责预测 2D 网格或时空网格中某个特定位置的内容。

> **想：** 位置编码去掉以后，模型靠什么区分这些 token?
> 靠内容本身。回到第 5 页的编码器：token 来自 FPS 在表面上取的点查询，每个查询带着傅里叶编码后的 3D 坐标进入 cross attention，坐标信息已经写进了 token 的内容里。这些点查询是一个无序集合，换一个 FPS 起点，同一个形状的 token 顺序就会变，给序列下标加位置编码反而会引入一个没有意义的顺序。图 3 的解码端也不依赖顺序：网格查询 $Q_g$ 对全部潜 token 做 cross attention，前面的 self-attention 也不带位置编码时，任何一种排列得到的 SDF 都一样。图 4 与此一致，PE 只出现在 Timestep 那一路，Noisy Shape Latent Tokens 只过一层 Linear 就进双流块。

**Condition Injection.** We employ a pre-trained image encoder to extract conditional image tokens of the patch sequence including the head token at the last layer. To capture the fine-grained details in the image, we utilize a large image encoder – DINOv2 Gaint [64] and large input image size $5 1 8 \times 5 1 8$ . Besides, we also remove the background of the input image, resize the object to a unified size, reposition the object to the center, and fill the background with white, which helps to remove the negative impact of the background and increase the effective resolution of the input image.

**条件注入。** 我们用一个预训练图像编码器提取条件图像 token，取最后一层的 patch 序列，包括头 token。为了捕捉图像中的细粒度细节，我们用大尺寸图像编码器 DINOv2 Giant [64] 和较大的输入尺寸 518 × 518。此外，我们还去掉输入图像的背景，把物体缩放到统一大小，移到中心，背景填成白色，这样能消除背景的负面影响，并提高输入图像的有效分辨率。（原文把 Giant 拼成了 「Gaint」。）

> **问：** DINOv2 在训练中更新吗？单流块里的 「channel attention」 又是哪一块？
> 正文只说 「pre-trained image encoder」，没说冻结。图 4 的配色给了线索：图注说橙色块没有可学习参数，而 DINO 画成橙色，和 PE，Attention，Gate 同色，紧跟其后的 Linear 是蓝色。按图注读，DINO 在 DiT 训练里不更新，可学的是它后面的线性投影。第二问也看图 4 右栏：单流块在 Scale & Shift 之后分成两支，一支是 Linear，QK-Norm，Attention，一支是 Linear，GELU，两支并行后再合并。正文的 「spatial attention and channel attention in parallel」 对应的就是这两支，所谓通道注意力其实是逐 token 按通道计算的 MLP 分支，不是另一种注意力。图 4 左栏还标了块数：双流块 ×16，单流块 ×32。

**Training & Inference.** We utilize flow matching objective [53, 24] for training our model. Specifically, flow matching first defines a probability density path between Gaussian distribution and data distribution, then, the model is trained to predict the velocity field $\begin{array} { r } { u _ { t } = \frac { x _ { t } } { d _ { t } } } \end{array}$ that drifting sample xt towards data $x _ { 1 }$ . In our case, we adopt the affine path with the conditional optimal transport schedule specified in [54], where $x _ { t } = ( 1 - t ) \times x _ { 0 } + t \times x _ { 1 } , u _ { t } = x _ { 1 } - x _ { 0 }$ . Therefore, the training loss is formulated as,

**训练与推理。** 我们用 flow matching 目标 [53, 24] 训练模型。具体来说，flow matching 先在高斯分布和数据分布之间定义一条概率密度路径，然后训练模型预测速度场 $u_t = \frac{dx_t}{dt}$，它把样本 $x_t$ 推向数据 $x_1$。我们采用 [54] 中带条件最优传输调度的仿射路径，其中 $x_t = (1-t)\times x_0 + t\times x_1$, $u_t = x_1 - x_0$。因此训练损失写成：

$$
\mathcal {L} = \mathbb {E} _ {t, x _ {0}, x _ {1}} [ \| u _ {\theta} (x _ {t}, c, t) - u _ {t} \| _ {2} ^ {2} ],\tag{2}
$$

式（2）：对随机的 t，噪声 $x_0$ 和数据 $x_1$ 取期望，网络预测的速度 $u_\theta(x_t, c, t)$ 与目标速度 $u_t$ 之间的平方 L2 距离。

where $t \sim \mathbb { U } ( 0 , 1 )$ and c denotes model condition. During the inference phase, we first randomly sample a start point $x _ { 0 } \sim \mathbb { N } ( 0 , 1 )$ and employ a first-order Euler ordinary differential equation (ODE) solver to solve $x _ { 1 }$ with our diffusion model $u _ { \theta } ( x _ { t } , c , t )$

其中 $t \sim \mathcal{U}(0,1)$，c 表示模型条件。推理阶段，我们先随机采样一个起点 $x_0 \sim \mathcal{N}(0,1)$，再用一阶 Euler 常微分方程（ODE）求解器，借助扩散模型 $u_\theta(x_t, c, t)$ 解出 $x_1$。

> **回看：** md 把速度场印成 $u_t = \frac{x_t}{d_t}$，PDF 文字层也是 x_t 在上，dt 在下，这个分式对吗？
> 不对，分子少了一个 d. 按同段给的仿射路径 $x_t = (1-t)x_0 + t x_1$ 对 t 求导，得到 $\frac{dx_t}{dt} = x_1 - x_0$，正好是式（2）里的回归目标 $u_t$。所以速度场应是 $\frac{dx_t}{dt}$。推理时反过来用：从 $x_0 \sim \mathcal{N}(0,1)$ 出发，按一阶 Euler 的 $x_{t+\Delta t} = x_t + \Delta t\, u_\theta(x_t, c, t)$ 一步步走到 $t=1$。走多少步本文没写，图 2 左下 DiT 的回环只标了 「Steps x N」；是否用了 classifier-free guidance，正文也没提。

## 4 Generative Texture Map Synthesis（生成式纹理贴图合成）

Given a 3D mesh without texture and an image prompt, we aim to generate a high-resolution and seamless texture map. The texture map should closely conform to the image prompt in the visible region, exhibit multi-view consistency, and maintain harmonious with the input mesh.

给定一个没有纹理的 3D 网格和一个图像提示，我们的目标是生成高分辨率，无缝的纹理贴图。纹理贴图在可见区域要紧贴图像提示，多视图之间要一致，并且和输入网格协调。

<!-- page 7 of 28 -->

Hunyuan3D-Paint

（图 5 版面上方的标题文字。）

![Image block](images/p07-figure-5-overview-of-hunyuan3d-paint-we-leverage-an.png)

上面这张是图 5。左半 「Training & Inference Pipeline」：Input Image 经 Image Delighting 得到 Delighted Image，通过带雪花（冻结）的 Conv-In 进 Reference Branch；Normal 和 Position 两组四视图经带火焰（可训练）的 Conv-In 进 Generation Branch；两支之间标着 Multi-Task Attention；Generation Branch 经带火焰的 Conv-Out 输出右侧 「Dense View Inference」 的 8 张猴子视图。Input Mesh 经 Viewpoint Selection 决定渲染哪些视角的法线图和位置图。右半 「Multi-Task Attention」：Generation Block 里左边的 ResBlock 带火焰，中间三路并行，Multiview Attention 带火焰，输入 Camera Embeddings 和 Other Views Latent；Self Attention 带雪花；Reference Attention 带火焰；三路相加后进右边带雪花的 ResBlock。下方 Reference Block 全部带雪花，标着 Timestep=0，依次是 ResBlock，Self Attention，Cross Attention，在 ResBlock 之后引出一条线接到 Reference Attention。

Figure 5: Overview of Hunyuan3D-Paint. We leverage an image delighting module to convert the input image to an unlit state to produce light-invariant texture maps. The system features a double stream image conditioning reference-net, which provides faithfully conditional image features to the model. Furthermore, it facilitates the production of texture maps that conform closely to the input image. The multi-task attention module ensures that the model synthesizes multi-view consistent images. This module maintains the coherence of all generated images while adhering to the input.

图 5: Hunyuan3D-Paint 总览。我们用一个图像去光照模块把输入图像转成无光照状态，以生成与光照无关的纹理贴图。系统采用双流图像条件 reference-net，为模型提供忠实的条件图像特征，也让生成的纹理贴图紧贴输入图像。多任务注意力模块保证模型合成多视图一致的图像。这个模块在遵循输入的同时，维持所有生成图像之间的一致。

To achieve these objectives, we employ a three-stage framework, including a pre-processing stage (Sec. 4.1), a multi-view image synthesis stage (Sec. 4.2, Hunyuan3D-Paint), and a texture baking stage based on dense multi-view inference (Sec. 4.3). Other details related to model training and textand image-to-texture pipeline are provided in Sec. 4.4. Fig. 5 illustrates the complete pipeline of our texture map synthesis method.

为达成这些目标，我们采用三阶段框架：预处理阶段（4.1 节），多视图图像合成阶段（4.2 节，Hunyuan3D-Paint），以及基于密集多视图推理的纹理烘焙阶段（4.3 节）。模型训练以及文本/图像到纹理管线的其他细节见 4.4 节。图 5 展示了纹理贴图合成方法的完整管线。

## 4.1 Pre-processing（预处理）

**Image Delighting Module.** The reference image typically exhibits pronounced and varied illumination and shadow, whether collected by the user or generated by T2I models. Directly inputting such images into the multi-view generation framework can cause illumination and shadows to be baked into the texture maps. To address this issue, we leverage a delighting procedure on the input image via an image-to-image approach [6] before multi-view generation. Specifically, to train such an image delighting model, we collect a large-scale 3D dataset and render it under the illumination of a random HDRI environmental map and an even white light to form the corresponding pair-wise image data. Benefiting from this image delighting model, our multi-view generation model can be fully trained on white-light illuminated images, enabling an illumination-invariant texture synthesis.

**图像去光照模块。** 参考图像不论是用户收集的还是 T2I 模型生成的，通常都带有明显且多变的光照和阴影。把这样的图像直接输入多视图生成框架，会让光照和阴影被烘焙进纹理贴图。为解决这个问题，我们在多视图生成之前，用一种图像到图像的方法 [6] 对输入图像做去光照。具体来说，为训练这个去光照模型，我们收集了一个大规模 3D 数据集，分别在随机 HDRI 环境贴图光照和均匀白光下渲染，构成成对的图像数据。有了这个去光照模型，多视图生成模型可以完全在白光照明的图像上训练，实现与光照无关的纹理合成。

**View Selection Strategy.** In practical applications, to reduce the costs of texture generation (i.e., generate the largest area of texture with the minimum number of viewpoints), we employ a geometryaware viewpoint selection strategy to support effective texture synthesis. By considering the coverage of the geometric surface, we heuristically select 8 to 12 viewpoints for inference. Initially, we fix 4 orthogonal viewpoints as basis since they cover most parts of the geometry. Subsequently, we iteratively add novel viewpoints using a greedy search approach. The specific process is illustrated in Algorithm 1, and the coverage function in the algorithm is defined as:

**视角选择策略。** 实际应用中，为了降低纹理生成成本（即用最少的视角生成最大面积的纹理），我们采用几何感知的视角选择策略来支持有效的纹理合成。考虑几何表面的覆盖情况，我们启发式地选 8 到 12 个视角做推理。先固定 4 个正交视角作为基础，因为它们覆盖了几何体的大部分。随后用贪心搜索迭代加入新视角。具体过程见算法 1，算法中的覆盖函数定义为：

$$
\mathcal {F} (v _ {i}, \mathbb {V} _ {s}, \mathbf {M}) = \mathcal {A} _ {\text {area}} \left\{\mathcal {U V} _ {\text {cover}} (v _ {i}, \mathbf {M}) \setminus \left[ \mathcal {U V} _ {\text {cover}} (v _ {i}, \mathbf {M}) \cap \left(\bigcup_ {s \in \mathbb {V} _ {s}} \mathcal {U V} _ {\text {cover}} (v _ {s}, \mathbf {M})\right) \right] \right\}\tag{3}
$$

式（3）：候选视角 $v_i$ 的得分，是它覆盖的 UV texel 集合减去已选视角集合 $\mathbb{V}_s$ 已经覆盖的部分之后剩下的面积，也就是这个视角新增的覆盖面积。

where $\mathcal { U V } _ { \mathrm { c o v e r } } ( v , \mathbf { M } )$ is a function that returns the set of covering texels in UV space based on the input view v and mesh geometry M, and $\mathcal { A } _ { a r e a } ( \cdot \cdot \cdot )$ is a function that calculates the coverage area according to the given set of covering texels. This approach encourages the multi-view generation

其中 $\mathcal{UV}_{cover}(v, \mathbf{M})$ 根据输入视角 v 和网格几何 M 返回 UV 空间中被覆盖的 texel 集合，$\mathcal{A}_{area}(\cdots)$ 根据给定的 texel 集合计算覆盖面积。这种做法促使多视图生成（句子接到下一页。）

<!-- page 8 of 28 -->

model to focus on viewpoints with more unseen regions, together with the dense-view inference, alleviating the burden of post-processing (i.e., texture inpainting).

（接上页）模型把注意力放在未见区域更多的视角上，再配合密集视图推理，减轻后处理（即纹理补洞）的负担。

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Algorithm 1 View Selection Algorithm
Input:
    Initialize a selected viewpoint set $\mathbb{V}_s$, a reference viewpoint set $\mathbb{V}_r$, a coverage function $\mathcal{F}$, and a mesh $\mathbf{M}$.
    Set $N_{max} = 12$ as the maximum number of iterative searches, and $N_{fixed} = 4$ as the initial fixed number of viewpoints.
    for $i = N_{fixed}$ to $N_{max} - 1$ do
        Set $c_{max} = -1$
        Set $v_{max} = -1$
        for $v_i \in \mathbb{V}_r$ do
            Set $c_{cur} = \mathcal{F}(v_i, \mathbb{V}_s, \mathbf{M})$
            if $c_{cur} &gt; c_{max}$ then
                $c_{max} = c_{cur}$
                $v_{max} = v_i$
            end if
        end for
        $\mathbb{V}_r \leftarrow \mathbb{V}_r \setminus \{v_{max}\}$
        $\mathbb{V}_s \leftarrow \mathbb{V}_s \cup \{v_{max}\}$
    end for
</div>

算法 1 视角选择算法。输入：已选视角集 $\mathbb{V}_s$，候选参考视角集 $\mathbb{V}_r$，覆盖函数 $\mathcal{F}$，网格 $\mathbf{M}$。设最大搜索次数 $N_{max}=12$，初始固定视角数 $N_{fixed}=4$。外层循环 i 从 $N_{fixed}$ 到 $N_{max}-1$；每轮先把 $c_{max}$ 和 $v_{max}$ 置为 -1，遍历 $\mathbb{V}_r$ 里的每个候选，用式（3）算新增覆盖，记下最大的那个；一轮结束后把它从 $\mathbb{V}_r$ 移到 $\mathbb{V}_s$.（md 把大于号转义成了 「&gt;」。）

> **核对：** 正文说选 8 到 12 个视角，算法 1 会不会停在 8 个？
> 按算法 1 原样执行不会。外层循环从 $i=N_{fixed}=4$ 跑到 $N_{max}-1=11$，共 8 轮，每轮无条件往 $\mathbb{V}_s$ 里加一个视角。式（3）是面积，最小为 0，而 $c_{max}$ 的初值是 -1，所以即使新增覆盖为 0，第一个候选也会被选中。于是只要候选集够大，输出总是 4 + 8 = 12 个视角。正文的 「8 to 12」 需要一个提前停止条件，比如新增覆盖低于某个阈值就退出，但算法 1 里没有这一步，阈值也没给。引用时可以说 「上限 12，前 4 个固定」，下限 8 在本文里找不到来源。

## 4.2 Hunyuan3D-Paint

Geometry-conditioned multi-view image generation is a key component in the texture synthesis framework. In the context of image-guided texture synthesis, the design of the multi-view image generation must be meticulously crafted to achieve image alignment, geometric following, and multi-view consistency. These functionalities are realized in Hunyuan3D-Paint according to a bunch of techniques containing a double-stream image conditioning reference-net, a multi-task attention mechanism, and a strategy for geometry and view conditioning.

几何条件的多视图图像生成是纹理合成框架里的关键组件。在图像引导的纹理合成中，多视图图像生成必须精心设计，才能做到图像对齐，几何遵循和多视图一致。Hunyuan3D-Paint 用一系列技术实现这些功能，包括双流图像条件 reference-net，多任务注意力机制，以及几何与视角条件策略。

**Double-stream Image Conditioning Reference-Net.** In the aim of the image following, Hunyuan3D-Paint implements a reference-net conditioning approach [116], upon which we develop a series of alternative solutions. Specifically, rather than a noisy feature synchronized with the generation branch, we directly feed the original VAE feature of the reference image into the reference branch to maintain image details as much as possible. Since the feature is noiseless, we set the timestep of the reference branch to 0 to maintain the input image information faithfully. On the other hand, to regularize potential style bias introduced by the 3D rendering dataset, we abandon the shared-weight reference-net as in [88, 78] and freeze the weights of the original SD2.1 weights (which serves as the base model for our multi-view generation). We have found that the fixed-weights reference-net serves as a soft regularization that anchors the generated image distribution, preventing it from drifting away towards the rendered image distribution, significantly improving the performance on real-world image conditioning. Together, these two schemes form the double-stream image conditioning strategy. We leverage the zero-noised double-stream image conditioning reference-net by capturing a feature cache prior to each self-attention module. This cache is then fed into the multi-view diffusion model via a reference attention module.

**双流图像条件 Reference-Net.** 为了遵循图像，Hunyuan3D-Paint 采用 reference-net 条件方法 [116]，并在此基础上发展出一系列替代方案。具体来说，我们不用和生成分支同步加噪的特征，而是把参考图像原始的 VAE 特征直接送入参考分支，尽可能保留图像细节。由于这个特征不带噪声，我们把参考分支的时间步设为 0，忠实保留输入图像信息。另一方面，为了约束 3D 渲染数据集可能带来的风格偏差，我们放弃 [88, 78] 那种共享权重的 reference-net，冻结原始 SD2.1 的权重（SD2.1 也是我们多视图生成的基座模型）。我们发现，固定权重的 reference-net 起到一种软正则的作用，把生成图像的分布锚住，防止它向渲染图像的分布漂移，显著提升了在真实图像条件下的表现。这两个方案合在一起，就是双流图像条件策略。我们在每个 self-attention 模块之前抓取一份特征缓存，以此使用零噪声的双流图像条件 reference-net。这份缓存再经参考注意力模块送入多视图扩散模型。

**Multi-task Attention Mechanism.** We introduce two additional attention modules alongside the original self-attention to enable the image diffusion model to generate multi-view images guided by a reference image. The reference attention module integrates the reference image into the multi-view diffusion process. In contrast, the multi-view attention module ensures consistency across the generated views. To mitigate potential conflicts arising from these multi-functionalities, we design the additional two distinct attention modules in a parallel structure (illustrated in Fig. 5), which can be expressed as:

**多任务注意力机制。** 为了让图像扩散模型在参考图像引导下生成多视图图像，我们在原有 self-attention 旁边引入两个额外的注意力模块。参考注意力模块把参考图像整合进多视图扩散过程。多视图注意力模块则保证生成视图之间的一致。为了缓解这些功能之间可能的冲突，我们把这两个额外的注意力模块设计成并行结构（见图 5），可以写成：

$$
Z _ {M V A} = Z _ {S A} + \lambda_ {r e f} \cdot \operatorname{Softmax} \left(\frac {Q _ {r e f} K _ {r e f} ^ {T}}{\sqrt {d}}\right) V _ {r e f} + \lambda_ {m v} \cdot \operatorname{Softmax} \left(\frac {Q _ {m v} K _ {m v} ^ {T}}{\sqrt {d}}\right) V _ {m v}\tag{4}
$$

式（4）：多任务注意力的输出，等于冻结的原始 self-attention 输出 $Z_{SA}$，加上 $\lambda_{ref}$ 倍的参考注意力输出，再加上 $\lambda_{mv}$ 倍的多视图注意力输出。

<!-- page 9 of 28 -->

where $Z _ { S A }$ represents the feature calculated by the original frozen-weight self-attention, and $Q _ { r e f } , K _ { r e f } , V _ { r e f }$ and $Q _ { m v } , K _ { m v } , V _ { m v }$ are the Query, Key, and Value projected features of reference attention and multi-view attention, respectively.

其中 $Z_{SA}$ 是原始冻结权重的 self-attention 算出的特征，$Q_{ref}, K_{ref}, V_{ref}$ 和 $Q_{mv}, K_{mv}, V_{mv}$ 分别是参考注意力和多视图注意力投影出的 Query，Key，Value 特征。

> **拆开：** 式（4）的三项里哪些在训练，$\lambda_{ref}$ 和 $\lambda_{mv}$ 取多少？
> 两个系数本文没给，也没说是固定常数还是可学习。哪些在训练要看图 5 右半的雪花和火焰：生成块里 Self Attention 带雪花，对应式（4）的 $Z_{SA}$ 「frozen-weight」；Multiview Attention 和 Reference Attention 带火焰，是新加且可训练的两项；下方 Reference Block 整块带雪花，标着 Timestep=0，对应正文冻结的 SD2.1 参考分支。图里生成块左边的 ResBlock 带火焰，右边的 ResBlock 带雪花，图 5 左半生成分支一侧的 Conv-In 和 Conv-Out 也带火焰。所以可训练部分不只两个新注意力，还包括输入输出卷积和部分 ResBlock，正文没有把这些写出来。三项是相加关系，参考和多视图两路互不嵌套，这就是正文说的 「parallel structure」。

**Geometry and View Conditioning.** Following geometry is another unique feature in texture map synthesis. To enable effective training, we opt for an easy implementation of directly concatenating the geometry conditions with noise. Specifically, we first input the multi-view canonical normal maps and canonical coordinate maps (CCM)—two view-invariant geometry conditions we utilize—into a pre-trained Variational Autoencoder (VAE) to obtain geometric features. These features are then concatenated with latent noise and fed into the channel-extended input convolution layer of the diffusion model.

**几何与视角条件。** 遵循几何是纹理贴图合成的另一个独特要求。为了训练有效，我们选了一种简单的实现：把几何条件直接和噪声拼接。具体来说，我们先把多视图的规范法线图和规范坐标图（CCM），也就是我们使用的两种与视角无关的几何条件，输入一个预训练的变分自编码器（VAE）得到几何特征。这些特征再和潜噪声拼接，送入扩散模型通道扩展后的输入卷积层。

Other than geometry conditioning, we adopt a learnable camera embedding in our pipeline to boost the viewpoint clue for the multi-view diffusion model. Specifically, we assign a unique unsigned integer to each pre-defined viewpoint and set up a learnable view embedding layer to map the integer to a feature vector, which is then injected into the multi-view Diffusion model. We have found in our experiments that combining the geometry conditioning with a learnable camera embedding yields the best performance.

除了几何条件，我们在管线中还采用可学习的相机嵌入，加强多视图扩散模型的视角线索。具体来说，我们给每个预定义视角分配一个唯一的无符号整数，并设置一个可学习的视角嵌入层，把这个整数映射成特征向量，再注入多视图扩散模型。我们在实验中发现，几何条件和可学习相机嵌入结合效果最好。

## 4.3 Texture Baking（纹理烘焙）

**Dense-view inference.** Potential self-occlusion is a significant challenge in the context of texture synthesis within a multi-view image generation framework, particularly when handling irregular geometries produced by shape generative models. This issue necessitates modeling texture synthesis as a two-stage framework. The first stage focuses on multi-view image generation, while the second stage involves non-trivial inpainting to fill the holes caused by self-occlusion. In our texture-map synthesis framework, we alleviate the burden on the second stage of inpainting by facilitating denseview inference during the multi-view generation stage. To enable effective dense-view inference, a view dropout strategy is introduced as a flexible training mechanism that allows the model to encounter all of the pre-set viewpoints, thereby enhancing its 3D perception capabilities and generalization. Specifically, we randomly select 6 viewpoints from a total of 44 pre-set viewpoints to serve as a batch input to the multi-view diffusion backbone network. During the inference phase, our framework is able to output the images of any specified viewpoints, supporting dense-view inference.

**密集视图推理。** 在多视图图像生成框架里做纹理合成，潜在的自遮挡是一大难题，处理形状生成模型产出的不规则几何时尤其如此。这个问题使纹理合成必须建模成两阶段框架：第一阶段做多视图图像生成，第二阶段做并不简单的补洞，填补自遮挡造成的空洞。在我们的纹理贴图合成框架中，我们在多视图生成阶段支持密集视图推理，以此减轻第二阶段补洞的负担。为了实现有效的密集视图推理，我们引入视角 dropout 策略，作为一种灵活的训练机制，让模型能接触到所有预设视角，从而增强 3D 感知能力和泛化能力。具体来说，我们从总共 44 个预设视角中随机选 6 个，作为一个批次输入多视图扩散主干网络。推理阶段，框架能输出任意指定视角的图像，支持密集视图推理。

**Single Image Super-resolution.** To enhance texture quality, we apply a pre-trained single-image super-resolution model [96] to each generated image from different viewpoints. Experiments have demonstrated that this single-image super-resolution approach maintains consistency among multi-views, as it does not introduce significant variations to the images.

**单图超分辨率。** 为提升纹理质量，我们对每个视角生成的图像分别用一个预训练的单图超分辨率模型 [96] 处理。实验表明这种单图超分辨率方法能保持多视图之间的一致，因为它不会给图像带来明显变化。

**Texture Inpainting.** After unwrapping the synthesized dense multi-view images into a texture map, a small set of patches in the UV texture remain that are not fully covered. To address this issue, we employ an intuitive inpainting approach. First, we project the existing UV texture into vertex texture. Then, we query each UV texel’s texture by computing a weighted sum of the textures from the connected, textured vertices. The weights are set to be the reciprocal of the geometric distances between the texels and the vertices.

**纹理补洞。** 把合成的密集多视图图像展开到纹理贴图之后，UV 纹理里仍有一小部分区域没有被完全覆盖。为解决这个问题，我们采用一种直观的补洞方法。先把已有的 UV 纹理投影到顶点纹理上。然后对每个 UV texel，用与之相连且已有纹理的顶点的纹理加权求和作为它的纹理。权重取 texel 与顶点之间几何距离的倒数。

## 4.4 Implementation Details（实现细节）

**Model Training.** For training the multi-view image generation framework, we start by inheriting the ZSNR checkpoint of the Stable Diffusion 2 v-model [52]. We train our multi-view diffusion model using a self-collected large-scale 3D dataset. Multi-view images are rendered under the illumination of an even white light to accommodate our delighting model. Specifically, we render the reference image with a random azimuth and a fixed range of elevation from -20 to 20 degrees. This variation disrupts the consistency between the reference and generated images, thereby increasing the robustness of our texture generation framework. We directly train on $5 1 \bar { 1 2 } \times 5 1 2$ resolution with a total of 80,000 steps, a batch size of 48, and a learning rate of ${ 5 \times 1 0 ^ { - 5 } }$ . We use 1000 warm-up steps and the "trailing" scheduler proposed by ZSNR.

**模型训练。** 训练多视图图像生成框架时，我们从 Stable Diffusion 2 v-model 的 ZSNR 检查点 [52] 起步。多视图扩散模型用自采集的大规模 3D 数据集训练。多视图图像在均匀白光照明下渲染，以配合去光照模型。具体来说，参考图像按随机方位角渲染，俯仰角取 -20 到 20 度的固定范围。这种变化打破了参考图像和生成图像之间的一致性，从而增强纹理生成框架的鲁棒性。我们直接在 512 × 512 分辨率上训练，共 80,000 步，批大小 48，学习率 $5\times 10^{-5}$。使用 1000 步预热，以及 ZSNR 提出的 「trailing」 调度器。（md 的 「5 1 \bar{12}」 是 512 的识别噪声。）

> **确认：** 训练时每个物体一次只见 6 个视角，推理时却要出 8 到 12 个，这两个数怎么衔接？
> 靠视角嵌入和 44 个预设视角。上面 「Geometry and View Conditioning」 一段说每个预定义视角对应一个整数，经可学习嵌入注入网络；图 5 右上的 Camera Embeddings 进的正是 Multiview Attention。训练时每批从 44 个里随机抽 6 个，多视图注意力学到的是 「任意几个视角之间互相看」，不绑定固定的 6 个位置，推理时就能换成更多视角。图 5 左侧 「Dense View Inference」 画的是 8 张猴子视图，落在 8 到 12 之间。本文没说批大小 48 数的是物体还是图像，也没说推理视角是否必须取自这 44 个预设视角；如果必须，算法 1 的候选集 $\mathbb{V}_r$ 最多就是这 44 个。

**General Text- and Image-to-Texture.** It is worth noting that Hunyuan3D-Paint not only generates high-quality texture maps for generated meshes but also supports arbitrary texture generation guided by any text or image input provided by the user for any geometric model. To achieve this, we leverage

**通用的文本/图像到纹理。** 值得一提的是，Hunyuan3D-Paint 不只为生成的网格生成高质量纹理贴图，也支持在用户给出的任意文本或图像引导下，为任意几何模型生成纹理。为此，我们借助（句子接到下一页。）

<!-- page 10 of 28 -->

|  | 3DShape2VecSet [112] | Michelangelo [119] | Direct3D [99] | Hunyuan3D-ShapeVAE (Ours) |
| --- | --- | --- | --- | --- |
| V-IoU(↑) | 87.88% | 84.93% | 88.43% | 93.6% |
| S-IoU(↑) | 80.66% | 76.27% | 81.55% | 89.16% |

表 1 两行两个指标，四列四个 VAE，箭头朝上表示越高越好。V-IoU: 3DShape2VecSet 87.88%, Michelangelo 84.93%, Direct3D 88.43%, Hunyuan3D-ShapeVAE 93.6%. S-IoU: 80.66%, 76.27%, 81.55%, 89.16%.

Table 1: Numerical comparisons. We evaluate the reconstruction performance of Hunyuan3D-ShapeVAE and baselines based on volume IoU (V-IoU) and Surface (S-IoU). The results indicate Hunyuan3D-ShapeVAE overwhelms all baselines in the reconstruction performance.

表 1：数值比较。我们用体积 IoU (V-IoU) 和表面 IoU (S-IoU) 评估 Hunyuan3D-ShapeVAE 和各基线的重建性能。结果表明 Hunyuan3D-ShapeVAE 的重建性能压倒所有基线。

advanced T2I models and corresponding conditional generation modules, such as ControlNet [115] and IP-Adapter [108], to generate input images that align with geometric shapes based on userprovided text or image prompts. Benefitting from this paradigm, we are capable of texturing any specified geometry with arbitrary images, whether they are matched or mismatched. An application of using different images to texture the same geometry, dubbed as re-skinning, is illustrated in Fig. 9.

（接上页）先进的 T2I 模型和相应的条件生成模块，如 ControlNet [115] 和 IP-Adapter [108]，根据用户提供的文本或图像提示，生成与几何形状对齐的输入图像。得益于这种范式，我们能用任意图像给任意指定几何上纹理，不论图像和几何是否匹配。用不同图像给同一个几何上纹理的应用称为换肤（re-skinning），见图 9。

## 5 Evaluations（评估）

To thoroughly evaluate the performance of Hunyuan3D 2.0, we conducted experiments from three perspectives: (1) 3D Shape Generation (including Shape Reconstruction and Shape Generation), (2) Texture map synthesis, and (3) Textured 3D assets generation.

为全面评估 Hunyuan3D 2.0 的性能，我们从三个角度做实验：（1）3D 形状生成（包括形状重建和形状生成），（2）纹理贴图合成，（3）带纹理 3D 资产生成。

## 5.1 3D Shape Generation（3D 形状生成）

Shape generation is crucial for 3D generation, as high-fidelity and high-resolution bare meshes form the foundation for downstream tasks. In this section, we compare and evaluate the capability of 3D shape generation in Hunyuan3D 2.0 from two perspectives: shape reconstruction and shape generation.

形状生成对 3D 生成至关重要，高保真，高分辨率的素模是下游任务的基础。本节从形状重建和形状生成两个角度比较评估 Hunyuan3D 2.0 的 3D 形状生成能力。

**Baselines.** We compare the reconstruction performance of Hunyuan3D-ShapeVAE with 3DShape2VecSet [112], Michelangelo [119], and Direct3D [99]. The mentioned methods represent the state-of-the-art ShapeVAE architecture, and the core differences are neural representations, where 3DShape2VecSet uses a downsampled vector set, point query; Michelangelo utilizes a learnable vector set, learnable query; Direct3D leverages learnable triplane; Hunyuan3D-ShapeVAE employees point query with importance sampling. Note that, except Direct3D, which requires a 3072 token length (suffering significant performance degeneration when reducing token length), all VAE models compare by 1024 token length. Hunyuan3D-DiT is compared with several state-of-the-art baselines. Open-source baselines are Michelangelo [119], Craftsman 1.5 [49], and Trellis [101]. Closed-source baselines are Shape Model 1, Shape Model 2, and Shape Model 3.

**基线。** 我们把 Hunyuan3D-ShapeVAE 的重建性能和 3DShape2VecSet [112]，Michelangelo [119]，Direct3D [99] 比较。这些方法代表最先进的 ShapeVAE 架构，核心差别在神经表示：3DShape2VecSet 用下采样的向量集和点查询；Michelangelo 用可学习的向量集和可学习查询；Direct3D 用可学习的三平面（triplane）；Hunyuan3D-ShapeVAE 用带重要性采样的点查询。注意除 Direct3D 需要 3072 的 token 长度外（缩短 token 长度会明显掉点），其余 VAE 都在 1024 的 token 长度下比较。Hunyuan3D-DiT 与若干最先进基线比较。开源基线是 Michelangelo [119]，Craftsman 1.5 [49] 和 Trellis [101]。闭源基线是 Shape Model 1，Shape Model 2 和 Shape Model 3.（原文把 employs 写成了 「employees」。）

**Metrics.** We employ the Intersection of Union (IoU) to measure the reconstruction performance. Specifically, we compute randomly sampled volume points IoU (V-IoU) and near-surface region IoU (S-IoU) to reflect the reconstruction performance comprehensively. To evaluate shape generative performance, we employ ULIP [105] and Uni3D [122] to compute the similarity between the generated mesh and input images (ULIP-I and Uni3D-I) and the similarity between the generated mesh and images prompt synthesizing by the vision language model [13] (ULIP-T and Uni3D-T).

**指标。** 我们用交并比（IoU）衡量重建性能。具体来说，我们计算随机采样体积点的 IoU (V-IoU) 和近表面区域的 IoU (S-IoU)，全面反映重建性能。评估形状生成性能时，我们用 ULIP [105] 和 Uni3D [122] 计算生成网格与输入图像的相似度（ULIP-I 和 Uni3D-I），以及生成网格与视觉语言模型 [13] 根据图像合成的文本提示之间的相似度（ULIP-T 和 Uni3D-T）。

**Shape Reconstruction Comparisons.** The Numerical comparison of shape reconstruction is shown in Tab. 1. According to the table, Hunyuan3D-ShapeVAE overwhelms all baselines. Comparisons among Hunyuan3D-ShapeVAE, 3DShape2VecSet, and Michelangelo demonstrate the effectiveness of the importance sampling strategies. Fig. 6 illustrates the visual comparison of shape reconstruction, which shows that Hunyuan3D-ShapeVAE could faithfully recover the shape with fine-grained details and produce neat space without any floaters.

**形状重建比较。** 形状重建的数值比较见表 1。按表格，Hunyuan3D-ShapeVAE 压倒所有基线。Hunyuan3D-ShapeVAE，3DShape2VecSet 和 Michelangelo 三者的比较证明了重要性采样策略的有效性。图 6 展示形状重建的视觉比较，显示 Hunyuan3D-ShapeVAE 能忠实恢复带细粒度细节的形状，并产生干净的空间，没有任何漂浮物。

> **看表：** 表 1 能证明重要性采样有效吗？
> 表 1 只能说明一部分。按上一段的 Baselines，3DShape2VecSet 用下采样的点查询，Hunyuan3D-ShapeVAE 用 「点查询 + 重要性采样」，两者都在 1024 个 token 下比，表示方式相近，差别主要在采样上。V-IoU 从 87.88% 到 93.6%，高 5.72 个点；S-IoU 从 80.66% 到 89.16%，高 8.50 个点。近表面的 S-IoU 涨得更多，和重要性采样专门往边角加点的方向一致。但这不是严格消融：两者的训练数据，模型宽度，训练步数本文都没对齐说明，表里也没有一行 「去掉重要性采样」 的对照。Direct3D 用了 3 倍的 token (3072) 仍然只有 88.43% 和 81.55%。表里 93.6% 只保留一位小数，其余都是两位，原文如此。

**Shape Generation Comparisons.** Tab. 2 shows the numerical comparison between Hunyuan3D-DiT and competing methods, which indicates that Hunyuan3D-DiT produces the most condition following results. Furthermore, according to the visual comparison in Fig. 7, results from Hunyuan3D-DiT follow the image prompt most, including clear human faces, surface bumps, logo texts, and layouts. Meanwhile, the generated bare mesh is holeless, which supports a solid basis for downstream tasks.

**形状生成比较。** 表 2 给出 Hunyuan3D-DiT 与竞争方法的数值比较，表明 Hunyuan3D-DiT 生成的结果最遵循条件。此外，按图 7 的视觉比较，Hunyuan3D-DiT 的结果最贴合图像提示，包括清晰的人脸，表面凹凸，logo 文字和布局。同时生成的素模没有孔洞，为下游任务提供了坚实基础。

<!-- page 11 of 28 -->

![Image block](images/p11-figure-6-visual-comparisons-we-illustrate-the.png)

上面这张是图 6，五行五列，全部涂成蓝色。列从左到右：Ground Truth, Michelangelo, 3DShape2Vectset, Direct3D, Hunyuan3D-ShapeVAE。行从上到下：带浮雕的彩蛋，摆着茶具和花瓶的圆台，自行车，带网罩的台扇，布满小方块凸起的 L 形板。最后一行的小方块阵列上，Michelangelo 和 3DShape2Vectset 的表面发糊，最右一列最接近真值。（图下标签把 VecSet 拼成了 「Vectset」。）

Figure 6: Visual comparisons. We illustrate the reconstructed mesh (blue paint aims to show more details) in the figure, which showcases that only Hunyuan3D-ShapeVAE reconstructs mesh with fine-grained surface details and neat space. (Better viewed by zooming in.)

图 6：视觉比较。图中展示重建出的网格（涂成蓝色是为了显示更多细节），可以看到只有 Hunyuan3D-ShapeVAE 重建出了带细粒度表面细节和干净空间的网格。（放大查看更清楚。）

<!-- page 12 of 28 -->

|  | ULIP-T(↑) | ULIP-I(↑) | Uni3D-T(↑) | Uni3D-I(↑) |
| --- | --- | --- | --- | --- |
| Michelangelo [119] | 0.0752 | 0.1152 | 0.2133 | 0.2611 |
| Craftsman 1.5 [49] | 0.0745 | 0.1296 | 0.2375 | 0.2987 |
| Trellis [101] | 0.0769 | 0.1267 | 0.2496 | 0.3116 |
| Shape Model 1 | 0.0799 | 0.1181 | 0.2469 | 0.3064 |
| Shape Model 2 | 0.0741 | 0.1308 | 0.2464 | 0.3106 |
| Shape Model 3 | 0.0746 | 0.1284 | 0.2516 | 0.3131 |
| Hunyuan3D-DiT (Ours) | 0.0771 | 0.1303 | 0.2519 | 0.3151 |

表 2 七行四列，四个指标都是越高越好。各列最高分：ULIP-T 是 Shape Model 1 的 0.0799，ULIP-I 是 Shape Model 2 的 0.1308，Uni3D-T 是 Hunyuan3D-DiT 的 0.2519，Uni3D-I 是 Hunyuan3D-DiT 的 0.3151. Hunyuan3D-DiT 在 ULIP-T 上是 0.0771，ULIP-I 上是 0.1303。

Table 2: Numerical comparisons. By evaluating the shape generation performance on ULIP-T/I, Uni3D-T/I, demostrating Hunyuan3D-DiT could produce the most condition followed results.

表 2：数值比较。通过在 ULIP-T/I 和 Uni3D-T/I 上评估形状生成性能，表明 Hunyuan3D-DiT 能生成最遵循条件的结果。（原文 「demostrating」 拼错。）

> **再看：** 表 2 真的是 Hunyuan3D-DiT 四项全胜吗？
> 不是。表 2 四列里它只拿下 Uni3D 的两列：Uni3D-T 0.2519 比第二名 Shape Model 3 的 0.2516 高 0.0003，Uni3D-I 0.3151 比 Shape Model 3 的 0.3131 高 0.0020. ULIP-T 第一是 Shape Model 1 的 0.0799，Hunyuan3D-DiT 的 0.0771 排第二，只比 Trellis 的 0.0769 高 0.0002；ULIP-I 第一是 Shape Model 2 的 0.1308，Hunyuan3D-DiT 的 0.1303 也排第二。表注和第 10 页正文的 「the most condition following results」 只在 Uni3D 两列上成立。所有差距都在小数点后第三，四位，本文没给方差或样本数，看不出这些差距是否超出重复评估的波动。

![Image block](images/p12-figure-7-visual-comparisons-we-display-the-input-image.png)

上面这张是图 7，六行八列，素模涂成蓝色。列从左到右：Input, Michelangelo, Craftsman 1.5, Trellis, Shape Model 1, Shape Model 2, Shape Model 3, Hunyuan3D-DiT。行从上到下：穿夹克，手扶额头的男子；粉色口风琴盒；一盘寿司；带绿植的山石；一片古镇建筑群；圆环里三个汉字的书法 logo。最后一行 Michelangelo 的字已经认不出，最右一列的笔画最完整。

Figure 7: Visual comparisons. We display the input image and the generated bare mesh (blue paint aims to show more details) from all methods in the figure. The human faces and piano keys show that Hunyuan3D-DiT could synthesize detailed surface bumps, maintaining completeness. Several scenes or logos demonstrate that Hunyuan3D-DiT could generate intricate details. (Better viewed by zooming in.)

图 7：视觉比较。图中展示输入图像和所有方法生成的素模（涂成蓝色是为了显示更多细节）。人脸和琴键表明 Hunyuan3D-DiT 能合成细致的表面凹凸，并保持完整。若干场景和 logo 表明 Hunyuan3D-DiT 能生成复杂细节。（放大查看更清楚。）

<!-- page 13 of 28 -->

|  | CMMD(↓) | FID<sub>CLIP</sub>(↓) | CLIP-score(↑) | LPIPS(↓) |
| --- | --- | --- | --- | --- |
| TEXTure [73] | 3.047 | 35.75 | 0.8499 | 0.0076 |
| Text2Tex [9] | 2.811 | 31.72 | 0.8680 | 0.0071 |
| SyncMVD [59] | 2.584 | 29.93 | 0.8751 | 0.0063 |
| Paint3D [111] | 2.810 | 30.29 | 0.8724 | 0.0063 |
| TexPainter [113] | 2.483 | 28.83 | 0.8789 | 0.0062 |
| Hunyuan3D-Paint (Ours) | 2.318 | 26.44 | 0.8893 | 0.0059 |

表 3 六行四列，CMMD，FID_CLIP，LPIPS 越低越好，CLIP-score 越高越好。Hunyuan3D-Paint 四列都是最好：CMMD 2.318, FID_CLIP 26.44, CLIP-score 0.8893, LPIPS 0.0059。四列的次好都是 TexPainter: 2.483, 28.83, 0.8789, 0.0062。

Table 3: Numerical comparisons. We compare Hunyuan3D-Paint with baselines on various metrics, and the results indicate that our model could produce the most condition-conforming texture maps.

表 3：数值比较。我们在多个指标上比较 Hunyuan3D-Paint 与各基线，结果表明我们的模型生成的纹理贴图最符合条件。

## 5.2 Texture Map Synthesis（纹理贴图合成）

As texture maps directly influence the visual appeal of textured 3D assets, we conduct comprehensive text-conditioned texture map synthesis experiments to validate the performance of Hunyuan3D-Paint.

纹理贴图直接影响带纹理 3D 资产的视觉效果，因此我们做了全面的文本条件纹理贴图合成实验，验证 Hunyuan3D-Paint 的性能。

**Baselines.** We compare Hunyuan3D-Paint with the following texture generation methods, including TEXTure [73], Text2Tex [9], SyncMVD [59], Paint3D [111], and TexPainter [113]. All the baselines leverage geometric and diffusion priors to facilitate the overall generation quality of texture maps.

**基线。** 我们把 Hunyuan3D-Paint 和以下纹理生成方法比较：TEXTure [73], Text2Tex [9], SyncMVD [59], Paint3D [111], TexPainter [113]。所有基线都借助几何先验和扩散先验提升纹理贴图的整体生成质量。

**Metrics.** We apply several frequently used image-level metrics to enable a fair comparison of texture map generation. Specifically, we leverage a CLIP-version of Fréchet Inception Distance $F I D _ { C L I P }$ to compute the distance between the rendering of the generated textured map in semantic perspectives. We use the implementation of Clean-FID [66]. Besides, the recently introduced CLIP Maximum-Mean Discrepancy (CMMD) [38] is utilized to serve as another important criterion, which is a more accurate measurement of images with rich details. In addition to these two metrics, we also use CLIP-score [71] to validate semantic alignment between renderings of the generated texture map and given prompt and LPIPS [117] to estimate the consistency between renderings of the generated texture map and ground-truth images.

**指标。** 为了公平比较纹理贴图生成，我们采用几个常用的图像级指标。具体来说，我们用 CLIP 版本的 Fréchet Inception Distance $FID_{CLIP}$，从语义角度计算生成纹理贴图渲染图之间的距离，实现采用 Clean-FID [66]。此外，近期提出的 CLIP 最大均值差异（CMMD）[38] 作为另一个重要标准，对细节丰富的图像测量更准确。除这两个指标外，我们还用 CLIP-score [71] 验证生成纹理贴图的渲染图与给定提示之间的语义对齐，用 LPIPS [117] 估计生成纹理贴图的渲染图与真值图像之间的一致性。

**Comparisons.** The numerical comparison of text-to-texturing is shown in Tab. 3, showcasing that Hunyuan3D-Paint achieves the best generative quality and semantic following. The visual comparison refers to Fig. 8. The fish and rabbit show that our model produces the most condition-following results. And the football demonstrates the ability of Hunyuan3D-Paint to produce clear texture maps. The texture map of the castle and bear contains rich texture patterns, showcasing that our model can produce intricate details.

**比较。** 文本到纹理的数值比较见表 3，显示 Hunyuan3D-Paint 的生成质量和语义遵循都最好。视觉比较见图 8。鱼和兔子显示我们的模型生成的结果最遵循条件。足球展示了 Hunyuan3D-Paint 生成清晰纹理贴图的能力。城堡和熊的纹理贴图包含丰富的纹理图案，显示我们的模型能生成复杂细节。

> **问：** 表 3 是文本条件实验，而 Hunyuan3D-Paint 的输入是图像，这一行分数是怎么来的？LPIPS 的真值图像又是什么？
> 第一问的答案在第 9 到 10 页 4.4 节 「General Text- and Image-to-Texture」：文本先经 T2I 模型，配合 ControlNet 和 IP-Adapter 生成和几何对齐的图像，再走图 5 的图像到纹理管线。所以表 3 里 Hunyuan3D-Paint 这一行测的是 「T2I + Paint」 整条链路，其余五个基线是直接以文本为条件的方法；用的是哪个 T2I 模型，本文没点名。第二问本文没交代：文本到纹理没有天然的真值图像，Metrics 段只说 LPIPS 比的是渲染图和 「ground-truth images」，真值来自原始带纹理资产的渲染还是 T2I 生成的参考图，没有写。表 3 的 LPIPS 从 0.0076 到 0.0059，各方法差距都在千分位上。

**Applications.** All generated texture maps are seamless and lighting-invariant. Moreover, Hunyuan3D-Paint is flexible to produce various texture maps for bare mesh or hand-crafted mesh according to different prompts. As shown in the Fig. 9, our model produces different texture maps for a mesh with seamless and intricate details.

**应用。** 所有生成的纹理贴图都是无缝的，与光照无关。此外，Hunyuan3D-Paint 能根据不同提示，灵活地为素模或手工网格生成各种纹理贴图。如图 9 所示，我们的模型为同一个网格生成了不同的纹理贴图，无缝且细节复杂。

## 5.3 Textured 3D Assets Generation（带纹理 3D 资产生成）

In this section, we evaluate the generated textured 3D assets for reflecting the end-to-end generation capabilities of Hunyuan3D 2.0.

本节评估生成的带纹理 3D 资产，以反映 Hunyuan3D 2.0 的端到端生成能力。

**Baselines.** We compare Hunyuan3D 2.0 against leading models in the field, including open-source model Trellis [101] and closed-source models Model 1, Model 2, and Model 3.

**基线。** 我们把 Hunyuan3D 2.0 和领域内的领先模型比较，包括开源模型 Trellis [101] 和闭源模型 Model 1, Model 2, Model 3。

**Metrics.** We mainly measure the generative quality of textured 3D assets by their renderings. Similar to Sec. 5.2, we employ $F I D _ { C L I P }$ to compute the image content distance, CLIP-score to reflect semantic alignment, CMMD to measure the similarity in the image details, and LPIPS to evaluate the consistency between rendering from generated textured 3D assets and given image prompts.

**指标。** 我们主要通过渲染图衡量带纹理 3D 资产的生成质量。和 5.2 节类似，我们用 $FID_{CLIP}$ 计算图像内容距离，用 CLIP-score 反映语义对齐，用 CMMD 衡量图像细节的相似度，用 LPIPS 评估生成的带纹理 3D 资产的渲染图与给定图像提示之间的一致性。

**Comparisons.** The numerical results reported in the Tab. 4 indicate that Hunyuan3D 2.0 surpasses all baselines in the quality of generated textured 3D assets and the condition following ability. The illustration in the Fig. 11 demonstrates that Hunyuan3D 2.0 produces the textured 3D assets with the highest quality. Even for the text in the image prompt, our model can produce the correct bumps on the shape surface and an accurate texture map according to the geometric conditions. The rest of the cases demonstrate the ability of our model to generate high-resolution and high-fidelity results with complex actions or scenes.

**比较。** 表 4 报告的数值结果表明，Hunyuan3D 2.0 在生成的带纹理 3D 资产质量和条件遵循能力上都超过所有基线。图 11 的展示表明 Hunyuan3D 2.0 生成的带纹理 3D 资产质量最高。即使是图像提示里的文字，我们的模型也能在形状表面生成正确的凹凸，并按几何条件生成准确的纹理贴图。其余案例展示了模型在复杂动作或场景下生成高分辨率，高保真结果的能力。

<!-- page 14 of 28 -->

A fish with orange and pink scales

提示词：一条长着橙色和粉色鳞片的鱼。

![Image block](images/p14-a-bunny-crafted-from-colorful-hand-painted-ceramic-tiles.png)

上面这张是图 8 第一行，鱼的六个结果，最左两条颜色杂乱，最右一条橙粉渐变。MinerU 按图下方的文字给它起名，所以文件名是兔子那一行的提示。

A bunny crafted from colorful, hand-painted ceramic tiles

提示词：一只用彩色手绘瓷砖拼成的兔子。

![Image block](images/p14-a-futuristic-dragon-with-sleek-metallic-blue-and-silver.png)

上面这张是图 8 第二行，兔子的六个结果，最右一只是一块块彩色瓷砖拼出来的。

A futuristic dragon with sleek, metallic blue and silver surfaces

提示词：一条表面光滑，带金属蓝和银色的未来感的龙。

![Image block](images/p14-a-photo-of-a-soccer-ball-showing-a-pentagon-shaped.png)

上面这张是图 8 第三行，六条蓝色的盘龙。

A photo of a soccer ball showing a **pentagon-shaped black section** surrounded **by white panels**

提示词：一张足球的照片，一块五边形的黑色区域被白色面板包围。（加粗是 PDF 里的强调，标出提示中的关键属性。）

![Image block](images/p14-a-castle-with-a-central-tower-and-four-turrets.png)

上面这张是图 8 第四行，足球。第三列是一个灰色的细纹球，看不出五边形；最右一列是标准的黑白足球。

A castle with a central tower and four turrets, featuring a mix of **dark and light stone textures**

提示词：一座有中央塔楼和四个角楼的城堡，深浅两种石材纹理混搭。

![Image block](images/p14-a-teddy-bear-wearing-a-striped-scarf-standing-on-a.png)

上面这张是图 8 第五行，六座城堡。

A teddy bear wearing a **striped scarf**, standing on a **wooden base with grass trim**

提示词：一只围着条纹围巾的泰迪熊，站在带草边的木底座上。

![Image block](images/p14-texture.png)

上面这张是图 8 第六行，六只泰迪熊，最右一只穿黑白条纹，底座是木头。文件名 「texture」 取自下一行的列标签 TEXTure。

TEXTure

Text2Tex

SyncMVD

Paint3D

Ours

TexPainter

六个列标签，md 里的顺序是 TEXTure, Text2Tex, SyncMVD, Paint3D, Ours, TexPainter。

> **对一下：** md 里 Ours 排在 TexPainter 前面，图 8 最右一列到底是谁？
> 是 Ours. PDF 第 14 页图下的标签从左到右是 TEXTure，Text2Tex，SyncMVD，Paint3D，TexPainter，Ours，PDF 文字层也是这个顺序，md 把最后两个换了位。这和表 3 的行序一致，表 3 最后一行也是 Hunyuan3D-Paint。另外图 8 的六张行图文件名整体错了一行：每张图都按它下方那行文字起名，所以名为 bunny 的文件画的是鱼，名为 dragon 的是兔子，名为 soccer 的是龙，名为 castle 的是足球，名为 teddy 的是城堡，名为 texture 的是泰迪熊。读图以画面为准。

Figure 8: Visual comparisons. We demonstrate several generated texture maps on different bare meshes. The fish and rabbit texture map showcases that Hunyuan3D-Paint produces the most textconforming results. The football indicates that our model could synthesize seamless and clean texture maps. Moreover, Hunyuan3D-Paint could generate complex texture maps, like the castle and bear. (Better viewed by zooming in.)

图 8：视觉比较。我们在不同素模上展示若干生成的纹理贴图。鱼和兔子的纹理贴图显示 Hunyuan3D-Paint 的结果最符合文本。足球表明我们的模型能合成无缝，干净的纹理贴图。此外，Hunyuan3D-Paint 能生成复杂的纹理贴图，如城堡和熊。（放大查看更清楚。）

<!-- page 15 of 28 -->

![Image block](images/p15-figure-9-visual-results-we-generate-different-texture.png)

上面这张是图 9。左边一组是同一个双肩包几何配六种纹理：卡其帆布，浅色拼接，花卉，彩虹渐变，深灰，棕色皮革。右边一组是同一个茶壶几何配六种纹理：青花，描金棕漆，琥珀色釉，锦鲤图案，白底梅花，金色叶纹。

Figure 9: Visual results. We generate different texture maps for two meshes, and the results validate the performance of Hunyuan3D-Paint on texture reskinning. (Better viewed by zooming in.)

图 9：视觉结果。我们为两个网格生成了不同的纹理贴图，结果验证了 Hunyuan3D-Paint 在纹理换肤上的表现。（放大查看更清楚。）

|  | CMMD(↓) | FID<sub>CLIP</sub>(↓) | FID<sub>Incept</sub>(↓) | CLIP-score(↑) |
| --- | --- | --- | --- | --- |
| Trellis [101] | 3.591 | 54.639 | 289.287 | 0.787 |
| Model 1 | 3.600 | 55.866 | 305.922 | 0.779 |
| Model 2 | 3.368 | 49.744 | 294.628 | 0.806 |
| Model 3 | 3.218 | 51.574 | 295.691 | 0.799 |
| Hunyuan3D 2.0 (Ours) | 3.193 | 49.165 | 282.429 | 0.809 |

表 4 五行四列，CMMD，FID_CLIP，FID_Incept 越低越好，CLIP-score 越高越好。Hunyuan3D 2.0 四列都是最好：3.193, 49.165, 282.429, 0.809。各列次好：CMMD 是 Model 3 的 3.218，FID_CLIP 是 Model 2 的 49.744，FID_Incept 是 Trellis 的 289.287，CLIP-score 是 Model 2 的 0.806。

Table 4: Numerical comparison. According to the results, Hunyuan3D-Paint produces the most condition-following texture maps.

表 4：数值比较。按结果，Hunyuan3D-Paint 生成的纹理贴图最遵循条件。

> **看表：** 表 4 的表注和列名，与第 13 页 5.3 节的正文对得上吗？
> 有两处对不上。第一，表 4 的行是 Hunyuan3D 2.0 整个系统（Hunyuan3D-DiT 出形状，Hunyuan3D-Paint 上纹理），5.3 节比的也是端到端资产，表注却写成 「Hunyuan3D-Paint produces the most condition-following texture maps」，像是沿用了表 3 的表注。第二，5.3 节 Metrics 段列的是 $FID_{CLIP}$，CLIP-score，CMMD，LPIPS 四个指标，表 4 实际的四列是 CMMD，$FID_{CLIP}$，$FID_{Incept}$，CLIP-score，没有 LPIPS，多了一列 $FID_{Incept}$，正文对它没有任何说明。$FID_{Incept}$ 的数值在 282 到 306 之间，比 $FID_{CLIP}$ 大一个数量级；这类 FID 的绝对值受样本数影响很大，本文没给样本数，只能看相对顺序。

**User Study.** In addition, we conducted a user study by randomly inviting 50 volunteers to evaluate 300 unselected results generated by Hunyuan3D 2.0 subjectively. The evaluation criteria included 1) overall visual quality, 2) adherence to image conditions, and 3) overall satisfaction (dissatisfaction in either 1 or 2 results in overall dissatisfaction). The user study results in Fig. 10 indicate that Hunyuan3D 2.0 outperforms comparative methods, particularly in its ability to adhere to image conditions.

**用户研究。** 此外，我们做了一项用户研究，随机邀请 50 名志愿者，主观评价 Hunyuan3D 2.0 生成的 300 个未经挑选的结果。评价标准包括 1) 整体视觉质量，2) 对图像条件的遵循，3) 整体满意度（1 或 2 任一项不满意即整体不满意）。图 10 的用户研究结果表明 Hunyuan3D 2.0 优于对比方法，在遵循图像条件的能力上尤其明显。

![Chart block](images/p15-figure-10-the-results-of-user-study.png)

上面这张是图 10，分组柱状图，标题 「User Study」，纵轴 Percentage (%)。三组是 Overall Satisfy，3D Assets Quality，Image Following，每组五根柱：trellis, Model 1, Model 2, Model 3, Hunyuan3D 2.0。图上没有标数字，按网格线目测：Overall Satisfy 约 58, 30, 69, 60, 79; 3D Assets Quality 约 61, 37, 76, 72, 80；Image Following 约 70, 33, 75, 69, 83. Hunyuan3D 2.0 三组都最高，Model 1 三组都最低。

Figure 10: The results of user study.

图 10：用户研究结果。

> **想：** 按 「1 或 2 任一项不满意即整体不满意」 的定义，图 10 的三组柱子之间应该满足什么关系？
> 整体满意要求两项同时满意，所以每个方法的 Overall Satisfy 不能超过它在 3D Assets Quality 和 Image Following 两组里较低的那个。按图 10 目测：Hunyuan3D 2.0 是 79 对 min(80, 83)，Trellis 是 58 对 min(61, 70)，Model 1 是 30 对 min(37, 33)，Model 2 是 69 对 min(76, 75)，Model 3 是 60 对 min(72, 69)，五个方法都满足。这说明柱高是 「给出满意评价的比例」，三组共用一个口径。两个细节本文没交代：300 个结果是否每个都由 50 人全部评过；正文说评的是 「results generated by Hunyuan3D 2.0」，其他四个方法的结果从哪来，数量是否也是 300。

<!-- page 16 of 28 -->

![Image block](images/p16-image.png)

上面这张是图 11 第六行：山峰的另一个视角，五个方法各一个结果，没有输入图。MinerU 把这一行排到了报告该页最前面。

![Image block](images/p16-hy3d.png)

上面这张是图 11 第一行：最左一格加框的是输入图，一只举着 「HY3D」 牌子的企鹅，后面依次是 Trellis，Model 1，Model 2，Model 3，Ours 的结果。前几列牌子上的字母变形，最右一列的字母清楚。文件名 「hy3d」 取自下一行。

# HY3D

这一行不是标题，是 MinerU 把图 11 第二行牌子上的字识别成了一级标题。

> **回看：** 图 11 印了几行，md 里为什么只有五张图？
> PDF 第 16 页的图 11 是六行：举牌企鹅正面（带输入图），举牌企鹅背面，滑板企鹅正面（带输入图），滑板企鹅背面，山峰正面（带输入图），山峰另一面。md 只切出五张，第二行举牌背面没有成图，它牌子上印的 「HY3D」 被当成文字抽出来，成了上面那行 「# HY3D」。其余五张的位置也乱了：第六行排在最前，文件名 p16-image；第一行叫 p16-hy3d；第三，四行叫 p16-image-2 和 p16-image-3；第五行按下面的列标签叫 p16-trellis。图注说 「The first case」，「The second penguin」，「The last mountain」，对应三组，每组两行，不是六个独立案例。

![Image block](images/p16-image-2.png)

上面这张是图 11 第三行：最左加框的是输入图，一只黄黑配色，系红围巾的企鹅单手撑在滑板上倒立，后面是五个方法的结果。

![Image block](images/p16-image-3.png)

上面这张是图 11 第四行：同一只滑板企鹅从背后看的视角，五个结果，没有输入图。

![Image block](images/p16-trellis.png)

上面这张是图 11 第五行：最左加框的是输入图，一座带绿植和石阶的山峰，后面是五个方法的结果。文件名取自下一行的列标签 Trellis。

Trellis

Model 1

Model 2

Model 3

Ours

列标签：Trellis, Model 1, Model 2, Model 3, Ours（本文方法）。

Figure 11: Visual comparisons. The first case reflects that Hunyuan3D 2.0 could synthesize detailed surface bumps and correct texture maps. The second penguin showcases our model’s ability to handle complex actions. The last mountain demonstrates that Hunyuan3D-DiT could produce intricate structures, and Hunyuan3D-Paint can synthesize vivid texture maps. (Better viewed by zooming in.)

图 11：视觉比较。第一个案例反映 Hunyuan3D 2.0 能合成细致的表面凹凸和正确的纹理贴图。第二只企鹅展示模型处理复杂动作的能力。最后的山峰表明 Hunyuan3D-DiT 能生成复杂结构，Hunyuan3D-Paint 能合成生动的纹理贴图。（放大查看更清楚。）

<!-- page 17 of 28 -->

## 6 Hunyuan3D-Studio

We have developed [Hunyuan3D-Studio](https://arxiv.org/abs/2509.12815) [90]. This platform includes a comprehensive set of tools for the 3D production pipeline, as illustrated in Fig. 1. Hunyuan3D-Studio aims to provide experts and novices with a no-frills way to engage in 3D generation production and research. In this section, we highlight several features of Hunyuan3D-Studio, including Sketch-to-3D, Low-polygon Stylization, and Autonomous Character Animator. These features aim to streamline the 3D creation process and make it accessible to a broader audience.

我们开发了 Hunyuan3D-Studio [90]（链接指向 arXiv:2509.12815）。这个平台包含一整套面向 3D 生产管线的工具，如图 1 所示。Hunyuan3D-Studio 的目标是给专家和新手提供一种朴素直接的方式，参与 3D 生成的生产与研究。本节重点介绍 Hunyuan3D-Studio 的几项功能，包括草图转 3D，低多边形风格化和自动角色动画。这些功能旨在简化 3D 创作流程，让更多人能用上。

## 6.1 Sketch-to-3D（草图转 3D）

In game development and content creation, converting 2D sketches into 3D assets is a crucial technology that significantly enhances digital artistry design efficiency and flexibility. Previous methods [1, 121, 118, 32] suffer from the lack of the generative foundation model. They tackle this by training a small-scale generative or reconstruction model with sketch images as input directly on a limited dataset, significantly limiting the model’s capabilities.

在游戏开发和内容创作中，把 2D 草图转成 3D 资产是一项关键技术，能显著提升数字艺术设计的效率和灵活性。以往的方法 [1, 121, 118, 32] 苦于缺少生成式基础模型。它们的做法是以草图为输入，直接在有限的数据集上训练一个小规模的生成或重建模型，这极大限制了模型能力。

Benefitting from Hunyuan3D 2.0, we could convert sketches to images with rich details as input to the foundation 3D generative model. Specifically, the Hunyuan3D-Studio has developed the Sketch-to-3D module, which first converts sketches to images with rich details, maintaining original contours. Then, synthesize high-resolution and high-fidelity textured 3D assets, significantly reducing the barrier for users to engage in content creation.

得益于 Hunyuan3D 2.0，我们可以把草图转成细节丰富的图像，作为 3D 生成基础模型的输入。具体来说，Hunyuan3D-Studio 开发了草图转 3D 模块，先把草图转成细节丰富，保持原始轮廓的图像，然后合成高分辨率，高保真的带纹理 3D 资产，大幅降低用户参与内容创作的门槛。

As shown in Fig. 1, the Sketch-to-3D module can generate highly detailed and realistic 3D assets while maintaining close consistency with the original sketches. With this technology, users can synthesize 3D content with a simple sketch, providing a powerful tool for game developers and digital artists and a low-barrier creation platform for ordinary users.

如图 1 所示，草图转 3D 模块能生成细节丰富，逼真的 3D 资产，同时和原始草图保持高度一致。有了这项技术，用户只用一张简单的草图就能合成 3D 内容，为游戏开发者和数字艺术家提供了有力的工具，也为普通用户提供了低门槛的创作平台。

## 6.2 Low-polygon Stylization（低多边形风格化）

Low-polygon stylization is critical in many computer graphics (CG) pipelines, as the face count of a mesh significantly impacts the application of 3D assets. Low-polygon stylization can significantly reduce computational costs, making it an essential process in 3D asset management. To address this, we have established a low-polygon stylization module that efficiently converts the dense meshes generated by Hunyuan3D 2.0 into low-polygon meshes. This module operates in two steps: geometric editing and texture preserving.

低多边形风格化在很多计算机图形（CG）管线中都很关键，因为网格的面数显著影响 3D 资产的应用。低多边形风格化能大幅降低计算成本，是 3D 资产管理中必不可少的环节。为此，我们建立了一个低多边形风格化模块，高效地把 Hunyuan3D 2.0 生成的稠密网格转成低多边形网格。这个模块分两步：几何编辑和纹理保持。

For geometric editing, we employ a faster and more robust traditional method [28, 35], despite the recent auto-regressive transformer-based polygon-generation approaches [97, 104, 86, 12]. By setting an optimization criterion, we merge the vertices of the mesh to transform the dense mesh into a low-polygon mesh. As shown at the top-right of Fig. 1, each 3D model can be represented by only dozens of triangles after geometric editing. The change in the face count of the mesh causes significant deviations in the vertices and faces of the low-polygon mesh compared to the dense mesh. Therefore, to preserve the texture patterns of the textured 3D assets, we construct a KD-tree for the input dense mesh. We then use the nearest-neighbor search within the KD tree to query the texture colors for the vertices of the low-polygon mesh. Finally, we obtain the texture map for the low-polygon mesh by performing texture baking on the low-polygon mesh with vertex colors. This process ensures that the visual quality of the textures is maintained while optimizing the mesh structure for production-level textured 3D assets.

几何编辑方面，尽管近来有基于自回归 transformer 的多边形生成方法 [97, 104, 86, 12]，我们仍采用更快，更稳健的传统方法 [28, 35]。通过设定一个优化准则，我们合并网格顶点，把稠密网格变成低多边形网格。如图 1 右上所示，几何编辑后每个 3D 模型只用几十个三角形就能表示（按 PDF 第 2 页的版面，低多边形场景其实在图 1 左下，右上是 Paint 面板）。网格面数的变化导致低多边形网格的顶点和面相对稠密网格有明显偏移。因此，为了保留带纹理 3D 资产的纹理图案，我们为输入的稠密网格建一棵 KD 树，用 KD 树里的最近邻搜索查询低多边形网格各顶点的纹理颜色。最后，在带顶点颜色的低多边形网格上做纹理烘焙，得到低多边形网格的纹理贴图。这个过程在优化网格结构的同时保持纹理的视觉质量，得到生产级的带纹理 3D 资产。

## 6.3 3D Character Animation（3D 角色动画）

Hunyuan3D 2.0 generates static 3D assets with high-resolution shapes and texture maps. However, drivable 3D models yet have broad requirements [82, 81, 84, 83, 57], such as game development and animation production. To extend the range of applications of Hunyuan3D 2.0, we develop a 3D character animation function in Hunyuan3D-Studio. The animation algorithm inputs the generated character and extracts features from mesh vertices and edges. Then, we utilize the Graph Neural Network (GNN) to detect skeleton key points and assign skinning weights to the mesh surface. Finally, based on the predicted skeleton skinning and motion templates, the algorithm utilizes motion

Hunyuan3D 2.0 生成的是带高分辨率形状和纹理贴图的静态 3D 资产。然而，可驱动的 3D 模型在游戏开发，动画制作等场景有广泛需求 [82, 81, 84, 83, 57]。为了扩展 Hunyuan3D 2.0 的应用范围，我们在 Hunyuan3D-Studio 中开发了 3D 角色动画功能。动画算法以生成的角色为输入，从网格顶点和边提取特征。然后用图神经网络（GNN）检测骨骼关键点，并给网格表面分配蒙皮权重。最后，基于预测的骨骼蒙皮和动作模板，算法用动作（句子接到下一页。）

<!-- page 18 of 28 -->

retargeting to drive the character. Some frames are displayed in Fig. 1. With 3D character animation, the generated results from Hunyuan3D 2.0 can come to life.

（接上页）重定向来驱动角色。部分帧见图 1。有了 3D 角色动画，Hunyuan3D 2.0 生成的结果就能动起来。

## 7 Related Work（相关工作）

## 7.1 3D Shape Generation（3D 形状生成）

**Representations.** The field of shape generation has undergone significant advancements, driven by the unique challenges associated with the 3D modality. Unlike other modalities, 3D data lacks a universal storage and representation format, leading to diverse approaches in shape generation research. The primary 3D representations include voxels, point clouds, polygon meshes, and implicit functions. With the advent of seminal works such as 3D ShapeNets [100], IF-Net [14], and 3D Gaussian Splatting [40], implicit functions, and 3D Gaussian Splitting have become prevalent in shape generation. However, even lightweight and flexible representations like implicit functions impose substantial modeling and computational burdens on deep neural networks. As a result, neural representations of 3D shapes have emerged as a new research focus, aiming to enhance efficiency. Pioneering methods such as 3DShape2VecSet [112], Michelangelo [119], CLAY [114], and Dora [11] represent 3D shapes using vector sets (one-dimensional latent token sequences proposed by 3DShape2VecSet [112]), significantly improving representation efficiency. Another approach involves structured representations (e.g., triplane [68, 7, 26] or sparse volume [63, 120, 72]) to encode 3D shapes, which better preserve spatial priors but are less efficient than vector sets. Inspired by recent advances in Latent Diffusion Models, Hunyuan3D 2.0 employs vector sets to represent 3D shapes’ implicit functions, alleviating the compression and fitting demands on neural networks and achieving a breakthrough in shape generation performance.

**表示。** 形状生成领域进展显著，推动力来自 3D 模态特有的挑战。和其他模态不同，3D 数据没有通用的存储和表示格式，这导致形状生成研究的做法五花八门。主要的 3D 表示包括体素，点云，多边形网格和隐式函数。随着 3D ShapeNets [100]，IF-Net [14]，3D Gaussian Splatting [40] 等开创性工作的出现，隐式函数和 3D 高斯溅射在形状生成中流行起来。然而，即使是隐式函数这样轻量灵活的表示，也给深度神经网络带来很大的建模和计算负担。因此，3D 形状的神经表示成为新的研究热点，目标是提高效率。3DShape2VecSet [112]，Michelangelo [119]，CLAY [114]，Dora [11] 等先驱方法用向量集（3DShape2VecSet [112] 提出的一维潜 token 序列）表示 3D 形状，显著提高了表示效率。另一类方法用结构化表示（如三平面 [68, 7, 26] 或稀疏体素 [63, 120, 72]）编码 3D 形状，更好地保留了空间先验，但效率不如向量集。受潜扩散模型近期进展的启发，Hunyuan3D 2.0 用向量集表示 3D 形状的隐式函数，减轻了神经网络的压缩和拟合负担，在形状生成性能上取得突破。（原文第二次写成 「3D Gaussian Splitting」，是 Splatting 的笔误。）

**Shape Generative models.** The evolution of generative model paradigms has continually influenced shape generation research. Early works [98, 76, 106, 110] based on Variational Auto-encoder [41], generative adversarial networks (GANs) [29], normalizing flow [65], and auto-regressive modeling [31] demonstrated strong generative capabilities within several specific categories. The success of diffusion models [33] and their variants [58, 53] in text-conditioned image [74, 45] generation has spurred the popularity of diffusion-based shape generative models, with notable works [16, 119] achieving stable cross-category shape generation. Additionally, advancements in network architectures have propelled shape-generation research. The transition from early 3D Convolutional Neural Networks [30] to the now-common Transformer architectures [94, 67] has led to the development of classic shape generation networks, enhancing performance. Building on these advancements, Hunyuan3D 2.0 employs a flow-based scalable transformer, further improving the model’s shape generation capabilities.

**形状生成模型。** 生成模型范式的演进一直影响着形状生成研究。早期基于变分自编码器 [41]，生成对抗网络（GAN）[29]，归一化流 [65] 和自回归建模 [31] 的工作 [98, 76, 106, 110] 在若干特定类别内展示了很强的生成能力。扩散模型 [33] 及其变体 [58, 53] 在文本条件图像生成 [74, 45] 上的成功，带动了基于扩散的形状生成模型的流行，代表性工作 [16, 119] 实现了稳定的跨类别形状生成。此外，网络架构的进步也推动了形状生成研究。从早期的 3D 卷积神经网络 [30] 到如今常见的 Transformer 架构 [94, 67]，这种转变催生了经典的形状生成网络，提升了性能。在这些进展的基础上，Hunyuan3D 2.0 采用基于流的可扩展 transformer，进一步提升模型的形状生成能力。

**Large-scale Dataset.** Large-scale datasets are the cornerstone of scaling laws. However, the scale of 3D data is much smaller than that in large language models and image generation fields. From 3Dscanrep [18, 44, 93] to ShapeNet [8], the growth of 3D datasets has been gradual [85, 123, 25, 77, 103, 21, 17]. The release of objaverse [20] and objaverse-xl [19] has been a significant driver in realizing the scaling law for shape generation. Leveraging these open-source 3D datasets, Hunyuan3D-2.0 can generate high-fidelity and high-resolution 3D assets.

**大规模数据集。** 大规模数据集是 scaling law 的基石。然而 3D 数据的规模远小于大语言模型和图像生成领域。从 3Dscanrep [18, 44, 93] 到 ShapeNet [8]，3D 数据集的增长一直很缓慢 [85, 123, 25, 77, 103, 21, 17]. objaverse [20] 和 objaverse-xl [19] 的发布，是在形状生成上实现 scaling law 的重要推动力。借助这些开源 3D 数据集，Hunyuan3D-2.0 能生成高保真，高分辨率的 3D 资产。

Benefiting from these open-source algorithms and 3D datasets, Hunyuan3D 2.0 is capable of generating high-fidelity and high-resolution 3D assets. Therefore, we have released Hunyuan3D 2.0 to contribute to the open-source 3D generation community and further advanced 3D generation algorithms.

得益于这些开源算法和 3D 数据集，Hunyuan3D 2.0 能生成高保真，高分辨率的 3D 资产。因此，我们发布 Hunyuan3D 2.0，为开源 3D 生成社区做贡献，并推进 3D 生成算法。

## 7.2 Texture Map Synthesis（纹理贴图合成）

High-quality texture-map synthesis has been a long-standing topic within the computer graphics community. Its significance has only increased with the growing demand for end-to-end 3D generation techniques, where it plays a crucial role for appearance modeling.

高质量纹理贴图合成一直是计算机图形学界的长期课题。随着对端到端 3D 生成技术的需求增长，它在外观建模中扮演关键角色，重要性有增无减。

**Text to Texture.** Given a plain mesh, text/image to texture aims to generate a high-quality texture that aligns well with the given geometry according to a guided text and image. Early attempts tried to approach texture synthesis by harnessing the categorical information and train a generative model on a specified dataset [10, 5, 23, 80, 26, 27]. While achieving plausible texturing results, these

**文本到纹理。** 给定一个素网格，文本/图像到纹理的目标是按引导文本和图像，生成与给定几何良好对齐的高质量纹理。早期尝试利用类别信息，在指定数据集上训练生成模型来做纹理合成 [10, 5, 23, 80, 26, 27]。这些方法虽然得到了看得过去的纹理结果，但（句子接到下一页。）

<!-- page 19 of 28 -->

methods failed to generalize to objects of other categories, limiting their applicability in production environments.

（接上页）无法泛化到其他类别的物体，限制了它们在生产环境中的适用性。

More recently, Stable Diffusion [74], owing to its impressive text-guided image generation capability and flexible structure, has spawned a plethora of text-to-texture research. To take full advantage of pre-trained image diffusion models, most subsequent works have approached the texture synthesis problem as a geometry-conditioned multi-view images generation problem.

近来，Stable Diffusion [74] 凭借出色的文本引导图像生成能力和灵活的结构，催生了大量文本到纹理研究。为了充分利用预训练图像扩散模型，后续大多数工作把纹理合成问题当作几何条件的多视图图像生成问题。

Initially, score distillation was adopted to harness the generation power of image diffusion models for 3D content (texture) synthesis [87, 51, 62, 70]. However, these methods are often limited by the over-saturated colors and misalignment with geometry.

最初，人们用分数蒸馏（score distillation）借助图像扩散模型的生成能力做 3D 内容（纹理）合成 [87, 51, 62, 70]。然而这些方法常常受限于颜色过饱和以及与几何不对齐。

Subsequently, optimization-free approaches pioneered by TEXTure [73] have been introduced [102, 15, 56, 113, 111, 59, 9]. To ensure consistency across multi-view images, these methods either adopt an inpainting framework by specifying viewpoint-related masks or employ a "synchronizing" operation during the denoising process. However, since Stable Diffusion is trained on a dataset with a noticeable forward-facing viewpoint bias [55], these training-free methods are limited and often suffer from severe performance issues, such as the Janus problem and multi-view inconsistency, which result in textures with significant artifacts.

随后，以 TEXTure [73] 为先导的免优化方法相继出现 [102, 15, 56, 113, 111, 59, 9]。为保证多视图图像之间的一致，这些方法要么采用补洞框架，指定与视角相关的掩码，要么在去噪过程中做 「同步」 操作。然而，由于 Stable Diffusion 的训练数据有明显的正面视角偏差 [55]，这些免训练方法能力有限，常常出现严重问题，如 Janus 问题（多面问题）和多视图不一致，导致纹理带有明显瑕疵。

With the development of extensive 3D datasets, training multi-view diffusion models has become a prevailing direction for texture generation [61, 2], exhibiting more powerful capabilities on texture consistency than the training-free approaches.

随着大规模 3D 数据集的发展，训练多视图扩散模型成了纹理生成的主流方向 [61, 2]，在纹理一致性上比免训练方法能力更强。

**Image to Texture.** In a related direction, image-guided texture generation has garnered attention in recent months, aligning closely with our research focus. This relatively unexplored area of image-guided texture synthesis demonstrates significant potential for further development since images provide more diverse information than text prompts, and text-to-texture generation can be fully replaced by a text-to-image and image-to-texture pipeline. Unfortunately, most of the existing works focus on semantic alignment with the reference image rather than precise alignment. FlexiTex [39] and EASI-Tex [42] both utilize an IP-Adapter [108] for image prompt injection. While TextureDreamer [109] employs a DreamBooth-like [75] approach to facilitate texture transfer across different objects.

**图像到纹理。** 在相关方向上，图像引导的纹理生成近几个月受到关注，和我们的研究重点高度契合。图像引导的纹理合成这个相对未被探索的领域有很大发展潜力，因为图像比文本提示提供更丰富的信息，而且文本到纹理的生成完全可以被 「文本到图像 + 图像到纹理」 的管线取代。遗憾的是，现有工作大多关注与参考图像的语义对齐，而不是精确对齐。FlexiTex [39] 和 EASI-Tex [42] 都用 IP-Adapter [108] 注入图像提示。TextureDreamer [109] 则用类似 DreamBooth [75] 的方法，实现跨物体的纹理迁移。

However, we argue that there are two explicit advantages to exactly following every detail of the reference image. First, as part of an end-to-end image-guided 3D generation process, the geometry generated in the first stage strives to align with the reference image, while the appearance details are left for texture synthesis stage. Thus, one of the main objectives of our texture generation framework is to enhance the geometry with more detailed appearance features from the well-aligned reference image. Second, with the rapid development of image diffusion techniques, more exquisite reference images are now available. Carefully adhering to these details can significantly improve the quality of the generated textures. Based on these advantages, Hunyuan3D-Paint is designed with a detailed preserving image injection module according to the philosophy of aligning the reference image not only semantically but also following the details as closely as possible.

但我们认为，精确遵循参考图像的每个细节有两个明确的好处。第一，作为端到端图像引导 3D 生成流程的一部分，第一阶段生成的几何力求与参考图像对齐，外观细节则留给纹理合成阶段。因此，我们纹理生成框架的主要目标之一，就是用对齐良好的参考图像里更细致的外观特征来增强几何。第二，随着图像扩散技术的快速发展，现在可以获得更精美的参考图像。仔细遵循这些细节能显著提升生成纹理的质量。基于这两点，Hunyuan3D-Paint 设计了一个保留细节的图像注入模块，理念是不仅在语义上对齐参考图像，还要尽可能贴近地遵循细节。

**Multi-view Images Generation.** Due to the viewpoint bias and multi-view inconsistency inherent in training-free image diffusion models, multi-view image diffusion was developed to alleviate these issues by utilizing large-scale 3D datasets, such as objaverse and objaverse-xl [20, 19].

**多视图图像生成。** 由于免训练图像扩散模型固有的视角偏差和多视图不一致，人们开发了多视图图像扩散，借助 objaverse 和 objaverse-xl [20, 19] 等大规模 3D 数据集缓解这些问题。

Most works force the multi-view generated latents to communicate with each other by manipulating the self-attention layers with 3D-aware masks [36, 48, 88, 60, 95, 79, 78, 55]. For example, Zero123++ [78] first treats the multi-view attention as a self-attention on a large image, which is the spatial concatenation of six multi-view images. MVDiffusion [89] applies a correspondence-aware attention (CAA) to inform the model to focus only on the correlation among the spatially-close pixels. MVAdapter [36], following Era3D [48] implements a simpler but effective row-wise and column-wise attention to alleviate the computational burden of CAA and achieves comparable performance.

大多数工作通过用 3D 感知的掩码操纵 self-attention 层，迫使多视图生成的潜变量相互通信 [36, 48, 88, 60, 95, 79, 78, 55]。例如，Zero123++ [78] 先把多视图注意力当作一张大图上的 self-attention，这张大图是六张多视图图像的空间拼接。MVDiffusion [89] 用对应感知注意力（CAA）让模型只关注空间上相近的像素之间的相关性。MVAdapter [36] 沿用 Era3D [48]，实现了更简单但有效的按行和按列注意力，减轻 CAA 的计算负担，并取得相当的性能。

Inspired by these works, we propose a multi-view generation framework equipped with a multi-task attention mechanism to achieve both multi-view consistency and image alignment simultaneously. Benefiting from this careful design and being trained on a large 3D rendering dataset, Hunyuan3D-Paint is able to achieve high-quality, consistent textures with strong alignment to the reference image.

受这些工作启发，我们提出一个配备多任务注意力机制的多视图生成框架，同时实现多视图一致和图像对齐。得益于这一设计以及在大规模 3D 渲染数据集上的训练，Hunyuan3D-Paint 能生成高质量，一致，且与参考图像高度对齐的纹理。

<!-- page 20 of 28 -->

## 8 Conclusion（结论）

In this report, we introduce an open-source 3D creation system—Hunyuan3D 2.0 —for generating textured meshes from images. We present Hunyuan3D-ShapeVAE, which is trained using a novel importance sampling method. This approach compresses each 3D object into a few latent tokens while minimizing reconstruction losses. Building on our VAE, we developed Hunyuan3D-DiT, an advanced diffusion transformer capable of generating visually appealing shapes that align precisely with input images. Besides, we introduce Hunyuan3D-Paint, another diffusion model designed to create textures for both our generated meshes and user-crafted meshes. With several innovative designs, our texture generation model, in conjunction with our shape generation model, can produce high-resolution, high-fidelity textured 3D assets from a single image. As we continue to make progress, we hope that Hunyuan3D 2.0 will serve as a robust baseline for large-scale 3D foundation models within the open-source community and facilitate future research endeavors.

本报告介绍了一个开源 3D 创作系统 Hunyuan3D 2.0，用于从图像生成带纹理的网格。我们提出 Hunyuan3D-ShapeVAE，它用一种新的重要性采样方法训练。这种方法把每个 3D 物体压缩成少量潜 token，同时尽量减小重建损失。在 VAE 的基础上，我们开发了 Hunyuan3D-DiT，一个先进的扩散 transformer，能生成与输入图像精确对齐，视觉上吸引人的形状。此外，我们介绍了 Hunyuan3D-Paint，另一个扩散模型，用于为我们生成的网格和用户制作的网格创建纹理。借助几项创新设计，我们的纹理生成模型与形状生成模型结合，能从单张图像生成高分辨率，高保真的带纹理 3D 资产。随着工作继续推进，我们希望 Hunyuan3D 2.0 能成为开源社区大规模 3D 基础模型的一个稳健基线，并促进未来的研究。

<!-- page 21 of 28 -->

## 9 Contributors（贡献者）

• **Project Sponsors:** Jie Jiang, Yuhong Liu, Di Wang, Yong Yang, Tian Liu

项目发起人，共 5 位。

• **Project Leaders:** Chunchao Guo, Jingwei Huang, Zibo Zhao

项目负责人，共 3 位。

• **Core Contributors:**

核心贡献者，按方向分组如下。

**– Data:** Lifu Wang, Jihong Zhang, Meng Chen, Liang Dong, Yiwen Jia, Yulin Cai, Jiaao Yu, Yixuan Tang, Hao Zhang, Zheng Ye, Peng He, Runzhou Wu, Chao Zhang, Yonghao Tan

数据组，共 14 位。

**– Shape Generation:** Zeqiang Lai, Qingxiang Lin, Yunfei Zhao, Haolin Liu

形状生成组，共 4 位。

**– Texture Synthesis:** Shuhui Yang, Yifei Feng, Mingxin Yang, Sheng Zhang

纹理合成组，共 4 位。

**– Downstream Tasks:** Xianghui Yang, Huiwen Shi, Sicong Liu, Junta Wu, Yihang Lian, Fan Yang, Ruining Tang, Zebin He, Xinzhou Wang, Jian Liu, Xuhui Zuo, Song Zhang

下游任务组，共 12 位。

**– Studio:** Zhuo Chen, Biwen Lei, Haohan Weng, Jing Xu, Yiling Zhu, Xinhai Liu, Lixin Xu, Shaoxiong Yang, Yang Liu, Changrong Hu, Tianyu Huang, Shaoxiong Yang, Song Zhang, Yang Liu

Studio 组，列了 14 个名字，其中 Shaoxiong Yang 和 Yang Liu 各出现两次，Song Zhang 也出现在下游任务组。

• **Contributors:** Jie Xiao, Yangyu Tao, Jianchen Zhu, Jinbao Xue, Kai Liu, Chongqing Zhao, Xinming Wu, Zhichao Hu, Lei Qin, Jianbing Peng, Zhan Li, Minghui Chen, Xipeng Zhang, Lin Niu, Paige Wang, Yingkai Wang, Haozhao Kuang, Zhongyi Fan, Xu Zheng, Weihao Zhuang, YingPing He

贡献者，共 21 位。

<!-- page 22 of 28 -->

## References（参考文献）

[1] Hmrishav Bandyopadhyay, Subhadeep Koley, Ayan Das, Ayan Kumar Bhunia, Aneeshan Sain, Pinaki Nath Chowdhury, Tao Xiang, and Yi-Zhe Song. Doodle your 3d: From abstract freehand sketches to precise 3d shapes. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 9795–9805, 2024.

[2] Raphael Bensadoun, Yanir Kleiman, Idan Azuri, Omri Harosh, Andrea Vedaldi, Natalia Neverova, and Oran Gafni. Meta 3d texturegen: Fast and consistent texture generation for 3d objects. arXiv preprint arXiv:2407.02430, 2024.

[3] James Betker, Gabriel Goh, Li Jing, Tim Brooks, Jianfeng Wang, Linjie Li, Long Ouyang, Juntang Zhuang, Joyce Lee, Yufei Guo, et al. Improving image generation with better captions. Computer Science. https://cdn. openai. com/papers/dall-e-3. pdf, 2(3):8, 2023.

[4] Xiao Bi, Deli Chen, Guanting Chen, Shanhuang Chen, Damai Dai, Chengqi Deng, Honghui Ding, Kai Dong, Qiushi Du, Zhe Fu, et al. Deepseek llm: Scaling open-source language models with longtermism. arXiv preprint arXiv:2401.02954, 2024.

[5] Alexey Bokhovkin, Shubham Tulsiani, and Angela Dai. Mesh2tex: Generating mesh textures from image queries. In IEEE International Conference on Computer Vision (ICCV), October 2023.

[6] Tim Brooks, Aleksander Holynski, and Alexei A Efros. Instructpix2pix: Learning to follow image editing instructions. arXiv preprint arXiv:2211.09800, 2022.

[7] Eric R Chan, Connor Z Lin, Matthew A Chan, Koki Nagano, Boxiao Pan, Shalini De Mello, Orazio Gallo, Leonidas J Guibas, Jonathan Tremblay, Sameh Khamis, et al. Efficient geometry-aware 3d generative adversarial networks. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 16123–16133, 2022.

[8] Angel X Chang, Thomas Funkhouser, Leonidas Guibas, Pat Hanrahan, Qixing Huang, Zimo Li, Silvio Savarese, Manolis Savva, Shuran Song, Hao Su, et al. Shapenet: An information-rich 3d model repository. arXiv preprint arXiv:1512.03012, 2015.

[9] Dave Zhenyu Chen, Yawar Siddiqui, Hsin-Ying Lee, Sergey Tulyakov, and Matthias Nießner. Text2tex: Text-driven texture synthesis via diffusion models. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 18558–18568, 2023.

[10] Qimin Chen, Zhiqin Chen, Hang Zhou, and Hao Zhang. Shaddr: Interactive example-based geometry and texture generation via 3d shape detailization and differentiable rendering. In SIGGRAPH Asia 2023 Conference Papers, 2023.

[11] Rui Chen, Jianfeng Zhang, Yixun Liang, Guan Luo, Weiyu Li, Jiarui Liu, Xiu Li, Xiaoxiao Long, Jiashi Feng, and Ping Tan. Dora: Sampling and benchmarking for 3d shape variational auto-encoders. arXiv preprint arXiv:2412.17808, 2024.

[12] Yiwen Chen, Yikai Wang, Yihao Luo, Zhengyi Wang, Zilong Chen, Jun Zhu, Chi Zhang, and Guosheng Lin. Meshanything v2: Artist-created mesh generation with adjacent mesh tokenization. arXiv preprint arXiv:2408.02555, 2024.

[13] Zhe Chen, Jiannan Wu, Wenhai Wang, Weijie Su, Guo Chen, Sen Xing, Muyan Zhong, Qinglong Zhang, Xizhou Zhu, Lewei Lu, et al. Internvl: Scaling up vision foundation models and aligning for generic visual-linguistic tasks. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 24185–24198, 2024.

[14] Zhiqin Chen and Hao Zhang. Learning implicit fields for generative shape modeling. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 5939–5948, 2019.

[15] Wei Cheng, Juncheng Mu, Xianfang Zeng, Xin Chen, Anqi Pang, Chi Zhang, Zhibin Wang, Bin Fu, Gang Yu, Ziwei Liu, et al. Mvpaint: Synchronized multi-view diffusion for painting anything 3d. arXiv preprint arXiv:2411.02336, 2024.

[16] Yen-Chi Cheng, Hsin-Ying Lee, Sergey Tulyakov, Alexander G Schwing, and Liang-Yan Gui. Sdfusion: Multimodal 3d shape completion, reconstruction, and generation. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 4456–4465, 2023.

[17] Jasmine Collins, Shubham Goel, Kenan Deng, Achleshwar Luthra, Leon Xu, Erhan Gundogdu, Xi Zhang, Tomas F Yago Vicente, Thomas Dideriksen, Himanshu Arora, Matthieu Guillaumin, and Jitendra Malik. Abo: Dataset and benchmarks for real-world 3d object understanding. CVPR, 2022.

报告该页是参考文献 [1] 到 [17]，条目保留原文。其中 [6] InstructPix2Pix 是 4.1 节去光照所用的图像到图像方法，[11] Dora 是第 4 页脚注说的同期重要性采样工作，[13] InternVL 是 5.1 节为 ULIP-T 和 Uni3D-T 生成文本提示的视觉语言模型。

<!-- page 23 of 28 -->

[18] Brian Curless and Marc Levoy. A volumetric method for building complex models from range images. In Proceedings of the 23rd annual conference on Computer graphics and interactive techniques, pages 303–312, 1996.

[19] Matt Deitke, Ruoshi Liu, Matthew Wallingford, Huong Ngo, Oscar Michel, Aditya Kusupati, Alan Fan, Christian Laforte, Vikram Voleti, Samir Yitzhak Gadre, Eli VanderBilt, Aniruddha Kembhavi, Carl Vondrick, Georgia Gkioxari, Kiana Ehsani, Ludwig Schmidt, and Ali Farhadi. Objaverse-xl: A universe of 10m+ 3d objects. arXiv preprint arXiv:2307.05663, 2023.

[20] Matt Deitke, Dustin Schwenk, Jordi Salvador, Luca Weihs, Oscar Michel, Eli VanderBilt, Ludwig Schmidt, Kiana Ehsani, Aniruddha Kembhavi, and Ali Farhadi. Objaverse: A universe of annotated 3d objects. arXiv preprint arXiv:2212.08051, 2022.

[21] Laura Downs, Anthony Francis, Nate Koenig, Brandon Kinman, Ryan Hickman, Krista Reymann, Thomas B. McHugh, and Vincent Vanhoucke. Google scanned objects: A high-quality dataset of 3d scanned household items, 2022.

[22] Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman, Akhil Mathur, Alan Schelten, Amy Yang, Angela Fan, et al. The llama 3 herd of models. arXiv preprint arXiv:2407.21783, 2024.

[23] Aysegul Dundar, Jun Gao, Andrew Tao, and Bryan Catanzaro. Fine detailed texture learning for 3d meshes with generative models. IEEE Trans. Pattern Anal. Mach. Intell., 2023.

[24] Patrick Esser, Sumith Kulal, Andreas Blattmann, Rahim Entezari, Jonas Müller, Harry Saini, Yam Levi, Dominik Lorenz, Axel Sauer, Frederic Boesel, et al. Scaling rectified flow transformers for high-resolution image synthesis. In Forty-first International Conference on Machine Learning, 2024.

[25] Huan Fu, Bowen Cai, Lin Gao, Ling-Xiao Zhang, Jiaming Wang, Cao Li, Qixun Zeng, Chengyue Sun, Rongfei Jia, Binqiang Zhao, et al. 3d-front: 3d furnished rooms with layouts and semantics. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 10933–10942, 2021.

[26] Jun Gao, Tianchang Shen, Zian Wang, Wenzheng Chen, Kangxue Yin, Daiqing Li, Or Litany, Zan Gojcic, and Sanja Fidler. Get3d: A generative model of high quality 3d textured shapes learned from images. Advances In Neural Information Processing Systems, 35:31841–31854, 2022.

[27] Lin Gao, Tong Wu, Yu-Jie Yuan, Ming-Xian Lin, Yu-Kun Lai, and Hao Zhang. Tm-net: Deep generative networks for textured meshes. ACM Trans. Graph., 40(6):1–15, 2021.

[28] Michael Garland and Paul S Heckbert. Surface simplification using quadric error metrics. In Proceedings of the 24th annual conference on Computer graphics and interactive techniques, pages 209–216, 1997.

[29] Ian Goodfellow, Jean Pouget-Abadie, Mehdi Mirza, Bing Xu, David Warde-Farley, Sherjil Ozair, Aaron Courville, and Yoshua Bengio. Generative adversarial nets. Advances in neural information processing systems, 27, 2014.

[30] Ben Graham. Sparse 3d convolutional neural networks. arXiv preprint arXiv:1505.02890, 2015.

[31] Karol Gregor, Ivo Danihelka, Andriy Mnih, Charles Blundell, and Daan Wierstra. Deep autoregressive networks. In International Conference on Machine Learning, pages 1242–1250. PMLR, 2014.

[32] Benoit Guillard, Edoardo Remelli, Pierre Yvernay, and Pascal Fua. Sketch2mesh: Reconstructing and editing 3d shapes from sketches. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 13023–13032, 2021.

[33] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. Advances in neural information processing systems, 33:6840–6851, 2020.

[34] Yicong Hong, Kai Zhang, Jiuxiang Gu, Sai Bi, Yang Zhou, Difan Liu, Feng Liu, Kalyan Sunkavalli, Trung Bui, and Hao Tan. LRM: Large reconstruction model for single image to 3d. In The Twelfth International Conference on Learning Representations, 2024.

[35] Hugues Hoppe. New quadric metric for simplifying meshes with appearance attributes. In Proceedings Visualization’99 (Cat. No. 99CB37067), pages 59–510. IEEE, 1999.

[36] Zehuan Huang, Yuanchen Guo, Haoran Wang, Ran Yi, Lizhuang Ma, Yan-Pei Cao, and Lu Sheng. Mv-adapter: Multi-view consistent image generation made easy. arXiv preprint arXiv:2412.03632, 2024.

报告该页是参考文献 [18] 到 [36]，条目保留原文。其中 [24] 是 flow matching 目标引用的 rectified flow transformer 论文，[28] 和 [35] 是 6.2 节低多边形几何编辑所用的二次误差度量网格简化。

<!-- page 24 of 28 -->

[37] Ka-Hei Hui, Aditya Sanghi, Arianna Rampini, Kamal Rahimi Malekshan, Zhengzhe Liu, Hooman Shayani, and Chi-Wing Fu. Make-a-shape: a ten-million-scale 3d shape model. In Forty-first International Conference on Machine Learning, 2024.

[38] Sadeep Jayasumana, Srikumar Ramalingam, Andreas Veit, Daniel Glasner, Ayan Chakrabarti, and Sanjiv Kumar. Rethinking fid: Towards a better evaluation metric for image generation. In IEEE Computer Vision and Pattern Recognition (CVPR), pages 9307–9315, 2024.

[39] DaDong Jiang, Xianghui Yang, Zibo Zhao, Sheng Zhang, Jiaao Yu, Zeqiang Lai, Shaoxiong Yang, Chunchao Guo, Xiaobo Zhou, and Zhihui Ke. Flexitex: Enhancing texture generation with visual guidance. arXiv preprint arXiv:2409.12431, 2024.

[40] Bernhard Kerbl, Georgios Kopanas, Thomas Leimkühler, and George Drettakis. 3d gaussian splatting for real-time radiance field rendering. ACM Trans. Graph., 42(4):139–1, 2023.

[41] Diederik P Kingma. Auto-encoding variational bayes. arXiv preprint arXiv:1312.6114, 2013.

[42] Perla Sai Raj Kishore, Yizhi Wang, Ali Mahdavi-Amiri, and Hao Zhang. EASI-Tex: Edge-aware mesh texturing from single-image. ACM Transactions on Graphics (Special Issue of SIGGRAPH), 43(4), 2024.

[43] Weijie Kong, Qi Tian, Zijian Zhang, Rox Min, Zuozhuo Dai, Jin Zhou, Jiangfeng Xiong, Xin Li, Bo Wu, Jianwei Zhang, et al. Hunyuanvideo: A systematic framework for large video generative models. arXiv preprint arXiv:2412.03603, 2024.

[44] Venkat Krishnamurthy and Marc Levoy. Fitting smooth surfaces to dense polygon meshes. In Proceedings of the 23rd annual conference on Computer graphics and interactive techniques, pages 313–324, 1996.

[45] Black Forest Labs. Flux. [https://github.com/black-forest-labs/flux,](https://github.com/black-forest-labs/flux) 2024.

[46] Yushi Lan, Fangzhou Hong, Shuai Yang, Shangchen Zhou, Xuyi Meng, Bo Dai, Xingang Pan, and Chen Change Loy. Ln3diff: Scalable latent neural fields diffusion for speedy 3D generation. In European Conference on Computer Vision (ECCV), 2024.

[47] Yushi Lan, Shangchen Zhou, Zhaoyang Lyu, Fangzhou Hong, Shuai Yang, Bo Dai, Xingang Pan, and Chen Change Loy. Gaussiananything: Interactive point cloud latent diffusion for 3d generation. In ICLR, 2025.

[48] Peng Li, Yuan Liu, Xiaoxiao Long, Feihu Zhang, Cheng Lin, Mengfei Li, Xingqun Qi, Shanghang Zhang, Wenhan Luo, Ping Tan, et al. Era3d: High-resolution multiview diffusion using efficient row-wise attention. arXiv preprint arXiv:2405.11616, 2024.

[49] Weiyu Li, Jiarui Liu, Hongyu Yan, Rui Chen, Yixun Liang, Xuelin Chen, Ping Tan, and Xiaoxiao Long. Craftsman: High-fidelity mesh generation with 3d native generation and interactive geometry refiner, 2024.

[50] Zhimin Li, Jianwei Zhang, Qin Lin, Jiangfeng Xiong, Yanxin Long, Xinchi Deng, Yingfang Zhang, Xingchao Liu, Minbin Huang, Zedong Xiao, Dayou Chen, Jiajun He, Jiahao Li, Wenyue Li, Chen Zhang, Rongwei Quan, Jianxiang Lu, Jiabin Huang, Xiaoyan Yuan, Xiaoxiao Zheng, Yixuan Li, Jihong Zhang, Chao Zhang, Meng Chen, Jie Liu, Zheng Fang, Weiyan Wang, Jinbao Xue, Yangyu Tao, Jianchen Zhu, Kai Liu, Sihuan Lin, Yifu Sun, Yun Li, Dongdong Wang, Mingtao Chen, Zhichao Hu, Xiao Xiao, Yan Chen, Yuhong Liu, Wei Liu, Di Wang, Yong Yang, Jie Jiang, and Qinglin Lu. Hunyuan-dit: A powerful multi-resolution diffusion transformer with fine-grained chinese understanding, 2024.

[51] Chen-Hsuan Lin, Jun Gao, Luming Tang, Towaki Takikawa, Xiaohui Zeng, Xun Huang, Karsten Kreis, Sanja Fidler, Ming-Yu Liu, and Tsung-Yi Lin. Magic3d: High-resolution text-to-3d content creation. In IEEE Computer Vision and Pattern Recognition (CVPR), 2023.

[52] Shanchuan Lin, Bingchen Liu, Jiashi Li, and Xiao Yang. Common diffusion noise schedules and sample steps are flawed. In Proceedings of the IEEE/CVF winter conference on applications of computer vision, pages 5404–5411, 2024.

[53] Yaron Lipman, Ricky TQ Chen, Heli Ben-Hamu, Maximilian Nickel, and Matt Le. Flow matching for generative modeling. arXiv preprint arXiv:2210.02747, 2022.

[54] Yaron Lipman, Marton Havasi, Peter Holderrieth, Neta Shaul, Matt Le, Brian Karrer, Ricky T. Q. Chen, David Lopez-Paz, Heli Ben-Hamu, and Itai Gat. Flow matching guide and code, 2024.

[55] Ruoshi Liu, Rundi Wu, Basile Van Hoorick, Pavel Tokmakov, Sergey Zakharov, and Carl Vondrick. Zero-1-to-3: Zero-shot one image to 3d object. In Proceedings of the IEEE/CVF international conference on computer vision, pages 9298–9309, 2023.

报告该页是参考文献 [37] 到 [55]，条目保留原文。其中 [45] FLUX 是 Hunyuan3D-DiT 双流加单流结构的来源，[52] 是 4.4 节 ZSNR 检查点和 「trailing」 调度器的出处，[53] 和 [54] 是式（2）flow matching 与仿射路径的出处。

<!-- page 25 of 28 -->

[56] Shang Liu, Chaohui Yu, Chenjie Cao, Wen Qian, and Fan Wang. Vcd-texture: Variance alignment based 3d-2d co-denoising for text-guided texturing. In European Conference on Computer Vision, pages 373–389. Springer, 2025.

[57] Wen Liu, Zhixin Piao, Jie Min, Wenhan Luo, Lin Ma, and Shenghua Gao. Liquid warping gan: A unified framework for human motion imitation, appearance transfer and novel view synthesis. In Proceedings of the IEEE/CVF international conference on computer vision, pages 5904–5913, 2019.

[58] Xingchao Liu, Chengyue Gong, and Qiang Liu. Flow straight and fast: Learning to generate and transfer data with rectified flow. arXiv preprint arXiv:2209.03003, 2022.

[59] Yuxin Liu, Minshan Xie, Hanyuan Liu, and Tien-Tsin Wong. Text-guided texturing by synchronized multi-view diffusion. In SIGGRAPH Asia 2024 Conference Papers, pages 1–11, 2024.

[60] Xiaoxiao Long, Yuan-Chen Guo, Cheng Lin, Yuan Liu, Zhiyang Dou, Lingjie Liu, Yuexin Ma, Song-Hai Zhang, Marc Habermann, Christian Theobalt, et al. Wonder3d: Single image to 3d using cross-domain diffusion. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 9970–9980, 2024.

[61] Jiawei Lu, Yingpeng Zhang, Zengjun Zhao, He Wang, Kun Zhou, and Tianjia Shao. Genesistex2: Stable, consistent and high-quality text-to-texture generation. arXiv preprint arXiv:2409.18401, 2024.

[62] Gal Metzer, Elad Richardson, Or Patashnik, Raja Giryes, and Daniel Cohen-Or. Latent-nerf for shapeguided generation of 3d shapes and textures. In IEEE Computer Vision and Pattern Recognition (CVPR), pages 12663–12673, 2023.

[63] Paritosh Mittal, Yen-Chi Cheng, Maneesh Singh, and Shubham Tulsiani. Autosdf: Shape priors for 3d completion, reconstruction and generation. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 306–315, 2022.

[64] Maxime Oquab, Timothée Darcet, Theo Moutakanni, Huy V. Vo, Marc Szafraniec, Vasil Khalidov, Pierre Fernandez, Daniel Haziza, Francisco Massa, Alaaeldin El-Nouby, Russell Howes, Po-Yao Huang, Hu Xu, Vasu Sharma, Shang-Wen Li, Wojciech Galuba, Mike Rabbat, Mido Assran, Nicolas Ballas, Gabriel Synnaeve, Ishan Misra, Herve Jegou, Julien Mairal, Patrick Labatut, Armand Joulin, and Piotr Bojanowski. Dinov2: Learning robust visual features without supervision, 2023.

[65] George Papamakarios, Eric Nalisnick, Danilo Jimenez Rezende, Shakir Mohamed, and Balaji Lakshminarayanan. Normalizing flows for probabilistic modeling and inference. Journal of Machine Learning Research, 22(57):1–64, 2021.

[66] Gaurav Parmar, Richard Zhang, and Jun-Yan Zhu. On aliased resizing and surprising subtleties in gan evaluation. In IEEE Computer Vision and Pattern Recognition (CVPR), 2022.

[67] William Peebles and Saining Xie. Scalable diffusion models with transformers. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 4195–4205, 2023.

[68] Songyou Peng, Michael Niemeyer, Lars Mescheder, Marc Pollefeys, and Andreas Geiger. Convolutional occupancy networks. In Computer Vision–ECCV 2020: 16th European Conference, Glasgow, UK, August 23–28, 2020, Proceedings, Part III 16, pages 523–540. Springer, 2020.

[69] Dustin Podell, Zion English, Kyle Lacey, Andreas Blattmann, Tim Dockhorn, Jonas Müller, Joe Penna, and Robin Rombach. Sdxl: Improving latent diffusion models for high-resolution image synthesis. arXiv preprint arXiv:2307.01952, 2023.

[70] Ben Poole, Ajay Jain, Jonathan T. Barron, and Ben Mildenhall. Dreamfusion: Text-to-3d using 2d diffusion. In The Eleventh International Conference on Learning Representations, 2023.

[71] Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, et al. Learning transferable visual models from natural language supervision. In International conference on machine learning, pages 8748–8763. PMLR, 2021.

[72] Xuanchi Ren, Jiahui Huang, Xiaohui Zeng, Ken Museth, Sanja Fidler, and Francis Williams. Xcube: Large-scale 3d generative modeling using sparse voxel hierarchies. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 4209–4219, 2024.

[73] Elad Richardson, Gal Metzer, Yuval Alaluf, Raja Giryes, and Daniel Cohen-Or. Texture: Text-guided texturing of 3d shapes. In ACM SIGGRAPH 2023 conference proceedings, pages 1–11, 2023.

报告该页是参考文献 [56] 到 [73]，条目保留原文。其中 [64] DINOv2 是 Hunyuan3D-DiT 的条件图像编码器，[66] Clean-FID 是 $FID_{CLIP}$ 的实现，[71] CLIP 对应 CLIP-score，[73] TEXTure 是表 3 的第一个基线。

<!-- page 26 of 28 -->

[74] Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, and Björn Ommer. High-resolution image synthesis with latent diffusion models. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 10684–10695, 2022.

[75] Nataniel Ruiz, Yuanzhen Li, Varun Jampani, Yael Pritch, Michael Rubinstein, and Kfir Aberman. Dreambooth: Fine tuning text-to-image diffusion models for subject-driven generation. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 22500–22510, 2023.

[76] Aditya Sanghi, Hang Chu, Joseph G Lambourne, Ye Wang, Chin-Yi Cheng, Marco Fumero, and Kamal Rahimi Malekshan. Clip-forge: Towards zero-shot text-to-shape generation. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 18603–18613, 2022.

[77] Pratheba Selvaraju, Mohamed Nabail, Marios Loizou, Maria Maslioukova, Melinos Averkiou, Andreas Andreou, Siddhartha Chaudhuri, and Evangelos Kalogerakis. Buildingnet: Learning to label 3d buildings. In Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV), pages 10397–10407, October 2021.

[78] Ruoxi Shi, Hansheng Chen, Zhuoyang Zhang, Minghua Liu, Chao Xu, Xinyue Wei, Linghao Chen, Chong Zeng, and Hao Su. Zero123++: a single image to consistent multi-view diffusion base model. arXiv preprint arXiv:2310.15110, 2023.

[79] Yichun Shi, Peng Wang, Jianglong Ye, Long Mai, Kejie Li, and Xiao Yang. Mvdream: Multi-view diffusion for 3d generation. In The Twelfth International Conference on Learning Representations, 2023.

[80] Yawar Siddiqui, Justus Thies, Fangchang Ma, Qi Shan, Matthias Nießner, and Angela Dai. Texturify: Generating textures on 3d shape surfaces. In European Conference on Computer Vision (ECCV), pages 72–88. Springer, 2022.

[81] Sebastian Starke, Ian Mason, and Taku Komura. Deepphase: Periodic autoencoders for learning motion phase manifolds. ACM Transactions on Graphics (TOG), 41(4):1–13, 2022.

[82] Sebastian Starke, Paul Starke, Nicky He, Taku Komura, and Yuting Ye. Categorical codebook matching for embodied character controllers. ACM Transactions on Graphics (TOG), 43(4):1–14, 2024.

[83] Sebastian Starke, Yiwei Zhao, Taku Komura, and Kazi Zaman. Local motion phases for learning multi-contact character movements. ACM Transactions on Graphics (TOG), 39(4):54–1, 2020.

[84] Sebastian Starke, Yiwei Zhao, Fabio Zinno, and Taku Komura. Neural animation layering for synthesizing martial arts movements. ACM Transactions on Graphics (TOG), 40(4):1–16, 2021.

[85] Stefan Stojanov, Anh Thai, and James M Rehg. Using shape to categorize: Low-shot learning with an explicit shape bias. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 1798–1808, 2021.

[86] Jiaxiang Tang, Zhaoshuo Li, Zekun Hao, Xian Liu, Gang Zeng, Ming-Yu Liu, and Qinsheng Zhang. Edgerunner: Auto-regressive auto-encoder for artistic mesh generation. arXiv preprint arXiv:2409.18114, 2024.

[87] Jiaxiang Tang, Jiawei Ren, Hang Zhou, Ziwei Liu, and Gang Zeng. Dreamgaussian: Generative gaussian splatting for efficient 3d content creation. arXiv preprint arXiv:2309.16653, 2023.

[88] Shitao Tang, Jiacheng Chen, Dilin Wang, Chengzhou Tang, Fuyang Zhang, Yuchen Fan, Vikas Chandra, Yasutaka Furukawa, and Rakesh Ranjan. Mvdiffusion++: A dense high-resolution multi-view diffusion model for single or sparse-view 3d object reconstruction. In European Conference on Computer Vision, pages 175–191. Springer, 2025.

[89] Shitao Tang, Fuyang Zhang, Jiacheng Chen, Peng Wang, and Yasutaka Furukawa. Mvdiffusion: Enabling holistic multi-view image generation with correspondence-aware diffusion. arXiv, 2023.

[90] Hunyuan3D Team. Hunyuan3d studio: End-to-end ai pipeline for game-ready 3d asset generation. arXiv preprint arXiv:2509.12815, 2025.

[91] Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timothée Lacroix, Baptiste Rozière, Naman Goyal, Eric Hambro, Faisal Azhar, Aurelien Rodriguez, Armand Joulin, Edouard Grave, and Guillaume Lample. Llama: Open and efficient foundation language models. arXiv preprint arXiv:2302.13971, 2023.

[92] Hugo Touvron, Louis Martin, Kevin Stone, Peter Albert, Amjad Almahairi, Yasmine Babaei, Nikolay Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti Bhosale, et al. Llama 2: Open foundation and fine-tuned chat models. arXiv preprint arXiv:2307.09288, 2023.

报告该页是参考文献 [74] 到 [92]，条目保留原文。其中 [78] Zero123++ 和 [88] MVDiffusion++ 是 4.2 节被放弃的共享权重 reference-net 做法，[90] 是第 6 节 Hunyuan3D-Studio 链接指向的报告，arXiv:2509.12815，年份 2025。

<!-- page 27 of 28 -->

[93] Greg Turk and Marc Levoy. Zippered polygon meshes from range images. In Proceedings of the 21st annual conference on Computer graphics and interactive techniques, pages 311–318, 1994.

[94] A Vaswani. Attention is all you need. Advances in Neural Information Processing Systems, 2017.

[95] Peng Wang and Yichun Shi. Imagedream: Image-prompt multi-view diffusion for 3d generation. arXiv preprint arXiv:2312.02201, 2023.

[96] Xintao Wang, Ke Yu, Shixiang Wu, Jinjin Gu, Yihao Liu, Chao Dong, Yu Qiao, and Chen Change Loy. Esrgan: Enhanced super-resolution generative adversarial networks. In The European Conference on Computer Vision Workshops (ECCVW), September 2018.

[97] Haohan Weng, Zibo Zhao, Biwen Lei, Xianghui Yang, Jian Liu, Zeqiang Lai, Zhuo Chen, Yuhong Liu, Jie Jiang, Chunchao Guo, et al. Scaling mesh generation via compressive tokenization. arXiv preprint arXiv:2411.07025, 2024.

[98] Jiajun Wu, Chengkai Zhang, Tianfan Xue, Bill Freeman, and Josh Tenenbaum. Learning a probabilistic latent space of object shapes via 3d generative-adversarial modeling. Advances in neural information processing systems, 29, 2016.

[99] Shuang Wu, Youtian Lin, Feihu Zhang, Yifei Zeng, Jingxi Xu, Philip Torr, Xun Cao, and Yao Yao. Direct3d: Scalable image-to-3d generation via 3d latent diffusion transformer. arXiv preprint arXiv:2405.14832, 2024.

[100] Zhirong Wu, Shuran Song, Aditya Khosla, Fisher Yu, Linguang Zhang, Xiaoou Tang, and Jianxiong Xiao. 3d shapenets: A deep representation for volumetric shapes. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 1912–1920, 2015.

[101] Jianfeng Xiang, Zelong Lv, Sicheng Xu, Yu Deng, Ruicheng Wang, Bowen Zhang, Dong Chen, Xin Tong, and Jiaolong Yang. Structured 3d latents for scalable and versatile 3d generation. arXiv preprint arXiv:2412.01506, 2024.

[102] Xiaoyu Xiang, Liat Sless Gorelik, Yuchen Fan, Omri Armstrong, Forrest Iandola, Yilei Li, Ita Lifshitz, and Rakesh Ranjan. Make-a-texture: Fast shape-aware texture generation in 3 seconds. arXiv preprint arXiv:2412.07766, 2024.

[103] Jiacong Xu, Yi Zhang, Jiawei Peng, Wufei Ma, Artur Jesslen, Pengliang Ji, Qixin Hu, Jiehua Zhang, Qihao Liu, Jiahao Wang, et al. Animal3d: A comprehensive dataset of 3d animal pose and shape. arXiv preprint arXiv:2308.11737, 2023.

[104] Jingwei Xu, Chenyu Wang, Zibo Zhao, Wen Liu, Yi Ma, and Shenghua Gao. Cad-mllm: Unifying multimodality-conditioned cad generation with mllm. arXiv preprint arXiv:2411.04954, 2024.

[105] Le Xue, Mingfei Gao, Chen Xing, Roberto Martín-Martín, Jiajun Wu, Caiming Xiong, Ran Xu, Juan Carlos Niebles, and Silvio Savarese. Ulip: Learning a unified representation of language, images, and point clouds for 3d understanding. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 1179–1189, 2023.

[106] Xingguang Yan, Liqiang Lin, Niloy J Mitra, Dani Lischinski, Daniel Cohen-Or, and Hui Huang. Shapeformer: Transformer-based shape completion via sparse representation. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 6239–6249, 2022.

[107] Xianghui Yang, Huiwen Shi, Bowen Zhang, Fan Yang, Jiacheng Wang, Hongxu Zhao, Xinhai Liu, Xinzhou Wang, Qingxiang Lin, Jiaao Yu, et al. Hunyuan3d-1.0: A unified framework for text-to-3d and image-to-3d generation. arXiv preprint arXiv:2411.02293, 2024.

[108] Hu Ye, Jun Zhang, Sibo Liu, Xiao Han, and Wei Yang. Ip-adapter: Text compatible image prompt adapter for text-to-image diffusion models, 2023.

[109] Yu-Ying Yeh, Jia-Bin Huang, Changil Kim, Lei Xiao, Thu Nguyen-Phuoc, Numair Khan, Cheng Zhang, Manmohan Chandraker, Carl S Marshall, Zhao Dong, et al. Texturedreamer: Image-guided texture synthesis through geometry-aware diffusion. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 4304–4314, 2024.

[110] Fukun Yin, Xin Chen, Chi Zhang, Biao Jiang, Zibo Zhao, Jiayuan Fan, Gang Yu, Taihao Li, and Tao Chen. Shapegpt: 3d shape generation with a unified multi-modal language model. arXiv preprint arXiv:2311.17618, 2023.

报告该页是参考文献 [93] 到 [110]，条目保留原文。其中 [96] ESRGAN 是 4.3 节的单图超分模型，[99] Direct3D 是表 1 的基线，[101] Trellis 是表 2 和表 4 唯一的开源端到端基线，[105] 是 ULIP，[107] 是上一代 Hunyuan3D-1.0 的报告。

<!-- page 28 of 28 -->

[111] Xianfang Zeng, Xin Chen, Zhongqi Qi, Wen Liu, Zibo Zhao, Zhibin Wang, Bin Fu, Yong Liu, and Gang Yu. Paint3d: Paint anything 3d with lighting-less texture diffusion models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 4252–4262, 2024.

[112] Biao Zhang, Jiapeng Tang, Matthias Niessner, and Peter Wonka. 3dshape2vecset: A 3d shape representation for neural fields and generative diffusion models. ACM Transactions on Graphics (TOG), 42(4):1–16, 2023.

[113] Hongkun Zhang, Zherong Pan, Congyi Zhang, Lifeng Zhu, and Xifeng Gao. Texpainter: Generative mesh texturing with multi-view consistency. In ACM SIGGRAPH 2024 Conference Papers, pages 1–11, 2024.

[114] Longwen Zhang, Ziyu Wang, Qixuan Zhang, Qiwei Qiu, Anqi Pang, Haoran Jiang, Wei Yang, Lan Xu, and Jingyi Yu. Clay: A controllable large-scale generative model for creating high-quality 3d assets. ACM Transactions on Graphics (TOG), 43(4):1–20, 2024.

[115] Lvmin Zhang, Anyi Rao, and Maneesh Agrawala. Adding conditional control to text-to-image diffusion models, 2023.

[116] Lyumin Zhang. https://github.com/mikubill/sd-webui-controlnet/discussions/1236. https://github.com/Mikubill/sd-webui-controlnet/discussions/1236, 2023.

[117] Richard Zhang, Phillip Isola, Alexei A Efros, Eli Shechtman, and Oliver Wang. The unreasonable effectiveness of deep features as a perceptual metric. In IEEE Computer Vision and Pattern Recognition (CVPR), 2018.

[118] Song-Hai Zhang, Yuan-Chen Guo, and Qing-Wen Gu. Sketch2model: View-aware 3d modeling from single free-hand sketches. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 6012–6021, 2021.

[119] Zibo Zhao, Wen Liu, Xin Chen, Xianfang Zeng, Rui Wang, Pei Cheng, Bin Fu, Tao Chen, Gang Yu, and Shenghua Gao. Michelangelo: Conditional 3d shape generation based on shape-image-text aligned latent representation. Advances in Neural Information Processing Systems, 36, 2024.

[120] Xin-Yang Zheng, Hao Pan, Peng-Shuai Wang, Xin Tong, Yang Liu, and Heung-Yeung Shum. Locally attentional sdf diffusion for controllable 3d shape generation. ACM Transactions on Graphics (ToG), 42(4):1–13, 2023.

[121] Jie Zhou, Zhongjin Luo, Qian Yu, Xiaoguang Han, and Hongbo Fu. Ga-sketching: Shape modeling from multi-view sketching with geometry-aligned deep implicit functions. In Computer Graphics Forum. Wiley Online Library, 2023.

[122] Junsheng Zhou, Jinsheng Wang, Baorui Ma, Yu-Shen Liu, Tiejun Huang, and Xinlong Wang. Uni3d: Exploring unified 3d representation at scale. arXiv preprint arXiv:2310.06773, 2023.

[123] Qingnan Zhou and Alec Jacobson. Thingi10k: A dataset of 10,000 3d-printing models. arXiv preprint arXiv:1605.04797, 2016.

报告该页是参考文献 [111] 到 [123]，条目保留原文。其中 [112] 3DShape2VecSet 是 ShapeVAE 向量集表示的来源，[116] 是 reference-net 条件方法的出处，一个 GitHub 讨论帖，[119] Michelangelo 是 ShapeVAE 编码器-解码器结构的沿用对象，[122] 是 Uni3D。

28
