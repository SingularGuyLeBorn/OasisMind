---
title: "01 · FlexOlmo 对照译稿"
category: "模型技术报告"
tags: ["OLMo", "对照译稿"]
published: true
excerpt: "FlexOlmo 让各数据拥有者以冻结的公共模型为锚独立训练 MoE 专家, 再用域嵌入拼成路由, 推理时按许可增删专家; 本稿逐段对照全文并附读稿时的疑问块."
---
<!-- page 1 of 26 -->

# FlexOlmo: Open Language Models for Flexible Data Use

Weijia Shi∗aw Akshita Bhagia∗a Kevin Farhat∗a Niklas Muennighoffas Pete Walsha

Jacob Morrisonaw Dustin Schwenka Shayne Longprem Jake Poznanskia

Allyson Ettingera Daogao Liuw Margaret Liw Dirk Groenevelda Mike Lewisw

Wen-tau Yihw Luca Soldainia Kyle Loa Noah A. Smitha Luke Zettlemoyerw

Pang Wei Kohaw Hannaneh Hajishirziaw Ali Farhadiaw Sewon Min∗ab

aAllen Institute for AI wUniversity of Washington bUniversity of California, Berkeley sStanford University mMIT

swj0419@uw.edu akshitab@allenai.org sewonm@berkeley.edu

Model [hf.co/allenai/FlexOlmo-7x7B-1T](https://huggingface.co/allenai/FlexOlmo-7x7B-1T) Code [github.com/allenai/FlexOlmo](https://github.com/allenai/FlexOlmo) Blog [allenai.org/blog/flexolmo](https://allenai.org/blog/flexolmo)

arXiv:2507.07024v4 [cs.CL] 23 Aug 2025

## Abstract

We introduce FlexOlmo, a new class of language models (LMs) that supports (1) distributed training without data sharing, where different model parameters are independently trained on closed datasets, and (2) data-flexible inference, where these parameters along with their associated data can be flexibly included or excluded from model inferences with no further training. FlexOlmo employs a mixture-of-experts (MoE) architecture where each expert is trained independently on closed datasets and later integrated through a new domain-informed routing without any joint training. FlexOlmo is trained on FlexMix, a corpus we curate comprising publicly available datasets alongside seven domain-specific sets, representing realistic approximations of closed sets. We evaluate models with up to 37 billion parameters (20 billion active) on 31 diverse downstream tasks. We show that a general expert trained on public data can be effectively combined with independently trained experts from other data owners, leading to an average 41% relative improvement while allowing users to opt out of certain data based on data licensing or permission requirements. Our approach also outperforms prior model merging methods by 10.1% on average and surpasses the standard MoE trained without data restrictions using the same training FLOPs. Altogether, this research presents a solution for both data owners and researchers in regulated industries with sensitive or protected data. FlexOlmo enables benefiting from closed data while respecting data owners' preferences by keeping their data local and supporting fine-grained control of data access during inference.

我们提出 FlexOlmo, 一类新的语言模型 (LM), 支持两件事: (1) 不共享数据的分布式训练, 不同的模型参数各自在封闭数据集上独立训练; (2) 数据可选的推理, 这些参数连同它们对应的数据, 可以在不做任何额外训练的情况下灵活地纳入或排除出推理. FlexOlmo 采用 MoE 架构, 每个专家在封闭数据集上独立训练, 之后通过一种新的域感知路由整合, 全程没有联合训练. FlexOlmo 在我们整理的 FlexMix 语料上训练, FlexMix 由公开数据集和七个特定领域数据集组成, 后者是对封闭数据集的贴近现实的近似. 我们在 31 个多样的下游任务上评测了最多 370 亿参数 (200 亿激活) 的模型. 结果表明, 在公开数据上训练的通用专家可以和其他数据拥有者独立训练的专家有效组合, 平均带来 41% 的相对提升, 同时允许用户依据数据许可或权限要求退出 (opt out) 某些数据. 我们的方法平均比已有的模型融合方法高 10.1%, 在相同训练 FLOPs 下也超过了不受数据限制训练的标准 MoE. 总的来说, 这项工作为受监管行业里持有敏感或受保护数据的数据拥有者和研究者提供了一种方案. FlexOlmo 让数据留在本地, 并在推理时支持细粒度的数据访问控制, 从而在尊重数据拥有者意愿的前提下用上封闭数据.

## 1 Introduction

Pretraining language models (LMs) typically requires centralized access to all data during training and does not have any mechanism to track or control the influence of specific data points on model parameters. Model developers must therefore make a one-time decision on which data sources to

*Core contributors.

Preprint. Under review.

<!-- page 2 of 26 -->

![](images/teaser.png)

Figure 1: An overview of FlexOlmo. Data owners can contribute without sharing the data by training their own expert modules (FFNs and router embeddings) with a shared public model as an anchor point. At inference, these modules are integrated into a MoE model via a novel router embedding concatenation. This design enables flexible inclusion or exclusion of experts and strict opt-out guarantees, e.g., Github data can be excluded at no cost (blurred) during inference.

include, with limited ability to remove the effect of certain data after training [1, 2, 3]. Moreover, this centralized approach precludes the use of closed data that data owners cannot share with model developers for confidentiality, regulatory, or other reasons. Although solutions have been proposed to allow training without sharing the data, such as federated learning [4, 5], their practical adoption remains limited due to performance degradation and the high cost of synchronized training [6, 7].

语言模型 (LM) 的预训练通常要求训练时集中访问全部数据, 而且没有任何机制追踪或控制某个数据点对模型参数的影响. 因此模型开发者只能一次性决定纳入哪些数据源, 训练结束后很难再移除某些数据的影响 [1, 2, 3]. 此外, 这种集中式做法排除了封闭数据: 数据拥有者出于保密, 监管或其他原因无法把这些数据交给模型开发者. 已有一些不共享数据也能训练的方案, 例如联邦学习 [4, 5], 但由于性能下降和同步训练的高昂成本, 实际采用仍然有限 [6, 7].

*核心贡献者. 预印本, 审稿中.

We introduce FlexOlmo, a new class of LMs that enables distributed training on locally maintained datasets while enabling flexible opt-in and opt-out during inference. FlexOlmo (Figure 1) employs a mixture-of-experts (MoE) architecture [8, 9], where each expert is trained independently on closed datasets and later integrated into an MoE. This design allows data owners to contribute asynchronously without sharing their data, while also enabling continual updates with new data and providing strong guarantees for data opt-out during inference. Our approach can be seen as an instance of model merging [10], which merges different models into a unified one [11, 12]. However, our model is designed to address the unique challenges in our problem setup—combining models pre-trained on completely disjoint datasets with different distributions—which makes prior model merging techniques like ensembling output probabilities [11] or merging model weights [12] suboptimal.

我们提出 FlexOlmo, 这类 LM 能在本地维护的数据集上做分布式训练, 同时在推理时灵活地选择加入 (opt-in) 或退出 (opt-out). FlexOlmo (图 1) 采用 MoE 架构 [8, 9], 每个专家在封闭数据集上独立训练, 之后整合进一个 MoE. 这种设计让数据拥有者不共享数据也能异步贡献, 还支持用新数据持续更新, 并在推理时为数据退出提供强保证. 我们的方法可以看作模型融合 [10] 的一个实例, 即把不同模型合并成一个统一模型 [11, 12]. 不过, 我们的模型针对的是本问题设定特有的困难: 要组合的模型在完全不相交, 分布各异的数据集上预训练. 这使得已有的融合技术, 如对输出概率做集成 [11] 或对权重做合并 [12], 都不够理想.

A key challenge in training FlexOlmo is ensuring the merging of independently trained experts without joint training. We introduce a training algorithm where each data owner independently trains an expert module using the frozen public model as a shared anchor (Figure 1). This approach teaches independently trained experts to coordinate with the same public model and, by extension, with each other. Additionally, the router, a module that determines which experts process each token, typically requires joint training. We address this by assigning each expert a router embedding, initialized from its domain embedding using an off-the-shelf embedder [13] and further finetuned on its corresponding data during individual expert training. These embeddings are then concatenated to form the router during merging, removing the need for joint training.

训练 FlexOlmo 的关键难点, 是在没有联合训练的情况下让独立训练的专家能合并起来. 我们提出一种训练算法: 每个数据拥有者以冻结的公共模型为共享锚点, 独立训练一个专家模块 (图 1). 这样, 独立训练的专家都学会与同一个公共模型协作, 进而彼此协作. 另外, 路由器 (决定每个 token 由哪些专家处理的模块) 通常需要联合训练. 我们的做法是给每个专家分配一个路由嵌入, 用现成的嵌入模型 [13] 从该专家的域嵌入初始化, 再在单独训练专家时用对应数据微调. 合并时把这些嵌入拼接起来就构成路由器, 不再需要联合训练.

To validate FlexOlmo, we curate a data mixture called FlexMix, which includes a public training set along with seven domain-specific sets (e.g., news, educational text, and Reddit). These domains are chosen to simulate scenarios where high-quality data that can benefit LM training is not publicly available.

为了验证 FlexOlmo, 我们整理了名为 FlexMix 的数据混合, 包括一个公开训练集和七个特定领域数据集 (例如新闻, 教育文本和 Reddit). 选这些领域, 是为了模拟对 LM 训练有益的高质量数据不公开的场景.

We train FlexOlmo first on public data, then extend it by merging expert modules trained independently on our simulated closed sets. While continued pretraining on these sets improves some downstream tasks, it suffers from catastrophic forgetting and inconsistent performance. In contrast, FlexOlmo improves upon the public model by 41% and also outperforms prior merging techniques such as model soup and ensembling by 10.1% across 31 downstream tasks. We observe the largest improvements on tasks related to closed sets. Notably, even on benchmarks where no individual

2

<!-- page 3 of 26 -->

closed set improved performance over the public model, combining multiple experts yielded significant gains, demonstrating synergies among independently trained modules. Our qualitative analysis demonstrates that sparse expert activation across layers through the MoE architecture is key to these gains. Our qualitative analysis shows that the MoE architecture's ability to selectively activate different experts per layer per token is crucial to these gains by combining the strengths of each specialized expert.

我们先在公开数据上训练 FlexOlmo, 再合并在模拟封闭集上独立训练的专家模块来扩展它. 在这些数据集上继续预训练能改善部分下游任务, 但会出现灾难性遗忘, 表现也不稳定. 相比之下, 在 31 个下游任务上, FlexOlmo 比公共模型提升 41%, 比 model soup 和集成等已有融合技术高 10.1%. 提升最大的是与封闭集相关的任务. 值得一提的是, 即使在没有任何单个封闭集能超过公共模型的基准上, 组合多个专家也带来了显著增益, 说明独立训练的模块之间存在协同. 定性分析显示, MoE 架构在各层上的稀疏专家激活是这些增益的关键: MoE 能按层, 按 token 选择性地激活不同专家, 从而把各个专门化专家的长处组合起来.

We hope our work enables research with a broader range of closed datasets for LM training, particularly for organizations interested in collaborating on scientific research through the new features that FlexOlmo provides.

我们希望这项工作让更多封闭数据集能用于 LM 训练研究, 尤其是希望借助 FlexOlmo 的新特性开展科研合作的机构.

## 2 Background & Related Work · 背景与相关工作

### 2.1 Background: Data Restrictions · 背景: 数据限制

The standard LM training practice requires model developers to aggregate all data centrally and make a one-time decision on which data source to include and exclude. But many real-world data come with sharing and usage restrictions and necessitates (1) model training without data pooling and (2) model inference that can flexibly select different data sources based on use case and access privileges.

标准的 LM 训练做法要求模型开发者把全部数据集中起来, 并一次性决定纳入和排除哪些数据源. 但现实中很多数据带有共享和使用限制, 需要 (1) 不汇集数据的模型训练, 以及 (2) 能按用途和访问权限灵活选择数据源的模型推理.

**Data Sharing Constraints** Organizations in regulated industries require LMs that can leverage their closed datasets while maintaining strict data privacy and access controls. Healthcare institutions, financial firms, and other entities possess valuable domain-specific data but cannot share it externally due to HIPAA, GDPR [14, 15], data sovereignty laws [16], and intellectual property (IP) protections. These organizations need training paradigms that enable AI improvement on their sensitive data while ensuring such sensitive data never leaves certain environments and can be removed from the model after training, e.g., when data usage rights expire. In such settings, modular training approaches, where individual experts are trained independently and asynchronously on locally maintained data, are essential.

**数据共享约束** 受监管行业的机构需要能利用其封闭数据集的 LM, 同时保持严格的数据隐私与访问控制. 医疗机构, 金融公司等持有有价值的领域数据, 但受 HIPAA, GDPR [14, 15], 数据主权法 [16] 和知识产权 (IP) 保护的约束, 不能对外共享. 这些机构需要一种训练范式: 既能在敏感数据上改进 AI, 又保证敏感数据不离开特定环境, 并能在训练后从模型中移除, 比如数据使用权到期时. 在这类场景里, 各专家在本地数据上独立, 异步训练的模块化方式必不可少.

**Data Use Constraints** The inclusion of certain data depends on specific use cases and end users. *Privileged access*: User-facing applications often involve closed data restricted to specific, authorized users [17]. For example, GitHub Copilot must tailor code suggestions to reflect internal repositories based on an engineer's role and access rights [18]. *Copyright and data consent*: Legal and ethical considerations on training data for AI are evolving and uncertain [19, 20, 21, 22, 23, 24], and often depend on the data's intended use, e.g., licenses may prohibit commercial use or limit certain query types [25, 26]. *Model control*: Training data often include sensitive content [27, 28, 29] which may be beneficial in certain contexts but harmful in others. For instance, one may want to activate the use of toxic content for toxicity classification in a research setting, but deactivate it in applications presented to a general audience.

**数据使用约束** 是否纳入某些数据, 取决于具体用途和终端用户. *特权访问*: 面向用户的应用常涉及只对特定授权用户开放的封闭数据 [17]. 例如 GitHub Copilot 需要依据工程师的角色和访问权限, 让代码建议反映内部仓库 [18]. *版权与数据同意*: 关于 AI 训练数据的法律和伦理考量仍在演变, 并不确定 [19, 20, 21, 22, 23, 24], 而且常取决于数据的预期用途, 例如许可证可能禁止商用或限制某些查询类型 [25, 26]. *模型控制*: 训练数据常含敏感内容 [27, 28, 29], 在某些场景有用, 在另一些场景有害. 比如在研究场景里, 可能想为毒性分类启用有毒内容, 而在面向大众的应用里关掉它.

These real-world scenarios demonstrate the value of a new class of LM and accompanying training methods that address restrictions in data sharing and usage.

这些现实场景说明, 需要一类新的 LM 及配套训练方法, 来应对数据共享与使用上的限制.

### 2.2 Related Work · 相关工作

**Federated Learning** Federated Learning (FL) trains a single model over distributed datasets by synchronously aggregating client updates [5, 4, 30]. FL methods range from classical approaches that iteratively aggregate parameter updates from local clients [5, 31] to parameter-efficient techniques which have been adapted for LMs [32, 33, 34]. FL can guarantee data privacy using techniques such as homomorphic encryption [35] and differential privacy (DP) [36]. However, FL has seen limited adoption in LM training due to the high cost of synchronization and performance degradation [6, 7], and remains susceptible to privacy attacks due to inter-client communication [37, 38].

**联邦学习** 联邦学习 (FL) 通过同步聚合各客户端的更新, 在分布式数据集上训练单个模型 [5, 4, 30]. FL 方法从迭代聚合本地客户端参数更新的经典做法 [5, 31], 到已经适配 LM 的参数高效技术 [32, 33, 34] 都有. FL 可以借助同态加密 [35] 和差分隐私 (DP) [36] 等技术保证数据隐私. 但由于同步成本高和性能下降 [6, 7], FL 在 LM 训练中采用有限; 而且客户端之间要通信, 仍容易遭受隐私攻击 [37, 38].

Similar to [39], our approach also avoids data sharing but differs fundamentally by supporting independent, asynchronous training without costly inter-client communication, and allowing real-time opt-in and opt-out. Like FL, our model allows data owners to optionally apply DP training locally for privacy guarantees. Because DP is orthogonal to our architecture, each contributor can independently choose whether to apply it, providing flexibility without compromising the overall design.

与 [39] 类似, 我们的方法也不共享数据, 但根本区别在于: 它支持独立, 异步的训练, 不需要代价高昂的客户端间通信, 并允许实时加入和退出. 和 FL 一样, 我们的模型允许数据拥有者在本地可选地使用 DP 训练以获得隐私保证. DP 与我们的架构正交, 每个贡献者可以独立决定是否使用, 灵活且不影响整体设计.

3

<!-- page 4 of 26 -->

**Model Merging** Our work builds on recent efforts [40, 10] that advocate for developing machine learning models like open-source softwares, where sub-parts of the model can be trained independently and subsequently merged into unified systems. This can be achieved through various methods, including weight merging, output ensembling, and expert routing. Model soup—merging model weights trained on different datasets from the same initialization—can boost performance [41, 12, 42, 43, 44], especially with weighted combinations [45, 46, 47, 48, 49, 50, 51]. Weighted output ensembling (e.g., BTM [52, 53]) is also effective when models are trained on distinct datasets initialized from the same seed model. These approaches can be applied to our setting, where each expert is independently trained starting from the same public model then merged into a unified one. Our experiments (§5) show that these methods are less effective, primarily because they lack learned connections between different modules, which constrains the expressivity of the resulting models.

**模型融合** 我们的工作建立在近期一些主张 [40, 10] 之上: 像开发开源软件那样开发机器学习模型, 模型的各个子部分可以独立训练, 再合并成统一的系统. 实现方式有多种, 包括权重合并, 输出集成和专家路由. Model soup 把从同一初始化出发, 在不同数据集上训练得到的权重合并起来, 能提升性能 [41, 12, 42, 43, 44], 加权组合时尤其明显 [45, 46, 47, 48, 49, 50, 51]. 当模型从同一种子模型初始化, 在不同数据集上训练时, 加权输出集成 (如 BTM [52, 53]) 也有效. 这些方法都能套用到我们的设定: 每个专家从同一个公共模型出发独立训练, 再合并成一个模型. 我们的实验 (§5) 表明这些方法效果较差, 主要原因是不同模块之间没有学到的连接, 限制了合并后模型的表达力.

An alternative line of work focuses on expert routing methods, such as DEMix [54], BTX [55] and its extensions [56, 57, 58], which merge dense, independently trained experts into a mixture-of-experts (MoE) framework. We draw inspiration from this work, as we also integrate independently trained models into a MoE. However, these methods require joint training on a union of all datasets used in expert training after merging. By contrast, FlexOlmo removes the need for joint data access to enable training on locally maintained datasets. Our work is also related to ModuleFormer [59], which induces sparse modularity from uncurated data using novel load balancing and concentration losses.

另一条路线关注专家路由, 如 DEMix [54], BTX [55] 及其扩展 [56, 57, 58], 它们把独立训练的 dense 专家合并进 MoE 框架. 我们受这条路线启发, 同样把独立训练的模型整合进 MoE. 但这些方法在合并之后, 需要在专家训练所用全部数据集的并集上联合训练. FlexOlmo 则去掉了联合访问数据的需求, 从而能在本地维护的数据集上训练. 我们的工作也与 ModuleFormer [59] 有关, 后者用新的负载均衡损失和集中损失从未整理的数据中诱导出稀疏模块化.

Related efforts in parameter-efficient training have explored merging LoRA adapter weights trained on separate datasets [60, 61, 62, 63], particularly to reduce communication overhead in collaborative settings and support fine-grained data access control and opt-out use cases [64, 65]. Unlike these methods, which focus on merging lightweight adapters, our approach merges full expert models into a standard MoE architecture.

参数高效训练方向的相关工作研究了合并在不同数据集上训练的 LoRA 适配器权重 [60, 61, 62, 63], 主要用于降低协作场景中的通信开销, 并支持细粒度数据访问控制和退出场景 [64, 65]. 这些方法合并的是轻量适配器, 我们的方法则把完整的专家模型合并进标准 MoE 架构.

**Mixture-of-Experts (MoE)** MoE models [8, 9, 66], consisting of many small feedforward networks called experts, have gained popularity for their training and inference efficiency. Our work leverages the MoE architecture; however, our motivation and training method are fundamentally different as our primarily goal is to support modularity rather than efficiency.

**MoE** MoE 模型 [8, 9, 66] 由许多被称为专家的小型前馈网络组成, 因训练和推理效率而流行. 我们用的是 MoE 架构, 但动机和训练方法根本不同: 我们的首要目标是支持模块化, 而并非效率.

## 3 FlexOlmo: LMs with Flexible Data Use · FlexOlmo: 数据可灵活使用的 LM

### 3.1 Problem Setup · 问题设定

Let $M_\text{pub}$ be a model trained on a publicly available dataset $D_\text{pub}$, and $\mathcal{D} = \{D_1, D_2, ..., D_n\}$ represent a collection of locally maintained datasets with separate owners. Our objective is a single model $M_\text{final}$, which is constructed via composing $M_\text{pub}$ and a set of modules $\{M_1, M_2, \ldots, M_n\}$, where each $M_i$ is independently trained by the owner of $D_i$, who also has access to $M_\text{pub}$.

设 $M_\text{pub}$ 是在公开数据集 $D_\text{pub}$ 上训练的模型, $\mathcal{D} = \{D_1, D_2, ..., D_n\}$ 是一组各有所属, 在本地维护的数据集. 我们的目标是得到单个模型 $M_\text{final}$, 它由 $M_\text{pub}$ 和一组模块 $\{M_1, M_2, \ldots, M_n\}$ 组合而成, 其中每个 $M_i$ 由 $D_i$ 的拥有者独立训练, 该拥有者也能拿到 $M_\text{pub}$.

This model satisfies two requirements: (1) training $M_\text{final}$ does not require anyone to have joint access to the full dataset collection $\mathcal{D}$, as each $M_i$ is trained independently by the owner of dataset $D_i$; (2) removing any module $M_i$ from $M_\text{final}$ guarantees complete removal of its associated data $D_i$.

这个模型满足两项要求: (1) 训练 $M_\text{final}$ 不需要任何人联合访问整个数据集合 $\mathcal{D}$, 因为每个 $M_i$ 都由数据集 $D_i$ 的拥有者独立训练; (2) 从 $M_\text{final}$ 中移除任一模块 $M_i$, 就保证完全移除了与之关联的数据 $D_i$.

The key modeling challenges are: (1) to develop an algorithm that creates $M_i$ using $D_i$ and $M_\text{pub}$, and (2) to design the merging algorithm that combines $M_\text{pub}, M_1, M_2, \ldots, M_n$ into $M_\text{final}$.

建模上的关键难点有两个: (1) 设计一个用 $D_i$ 和 $M_\text{pub}$ 产出 $M_i$ 的算法; (2) 设计把 $M_\text{pub}, M_1, M_2, \ldots, M_n$ 合并成 $M_\text{final}$ 的融合算法.

### 3.2 Model Architecture · 模型架构

FlexOlmo follows the standard MoE architecture: it replaces the feedforward network (FFN) in each transformer block with a router and $n$ small FFNs called expert modules $\{M_\text{pub}, M_1, ..., M_n\}$. Note that we omit the layer index for each expert in our notation for simplicity. Given a processed input token embedding $\mathbf{x} \in \mathbb{R}^{h}$, the MoE module computes output representation $\mathbf{y}$:

$$\mathbf{y} = \sum_{i \in \text{Top}k(r(\mathbf{x}))}\mathrm{softmax}(r(\mathbf{x})_i)M_i(\mathbf{x}),$$

where the router function $r$ computes the expert probabilities from $\mathbf{x}$. Unlike standard MoEs where experts are trained jointly, our experts are trained asynchronously on distinct datasets $\{D_1, ..., D_n\}$.

FlexOlmo 沿用标准 MoE 架构: 把每个 Transformer 块里的前馈网络 (FFN) 换成一个路由器和 $n$ 个称为专家模块的小 FFN $\{M_\text{pub}, M_1, ..., M_n\}$. 为简洁起见, 记号里省略了每个专家的层下标. 给定处理后的输入 token 表示 $\mathbf{x} \in \mathbb{R}^{h}$, MoE 模块按上式计算输出表示 $\mathbf{y}$, 其中路由函数 $r$ 由 $\mathbf{x}$ 算出各专家的概率. 与专家联合训练的标准 MoE 不同, 我们的专家在不同的数据集 $\{D_1, ..., D_n\}$ 上异步训练.

4

<!-- page 5 of 26 -->

### 3.3 Training Algorithm · 训练算法

Standard MoEs train all experts and the router jointly on all data. In contrast, FlexOlmo trains experts independently by teaching them to coordinate (§3.3.1) and merges them at inference using a domain-informed router (§3.3.2). Optional router tuning can further improve performance (§3.3.3).

标准 MoE 在全部数据上联合训练所有专家和路由器. FlexOlmo 则通过教专家彼此协调 (§3.3.1) 来独立训练它们, 推理时用域感知路由器把它们合并 (§3.3.2). 可选的路由器微调还能进一步提升性能 (§3.3.3).

#### 3.3.1 Training Experts to Coordinate · 训练专家彼此协调

A straightforward way to train each expert would be to directly continue to train each expert $M_i$ on its own data $D_i$ [52]. We found that this method causes the experts to diverge too much from one another and from the original seed model, which makes merging after isolated training difficult.

训练每个专家最直接的办法, 是让每个专家 $M_i$ 直接在自己的数据 $D_i$ 上继续训练 [52]. 我们发现这样会让专家彼此之间, 以及与原始种子模型之间偏离太远, 隔离训练之后很难合并.

To prevent such divergence, we train experts independently while teaching them to coordinate (Figure 1). We use $M_\text{pub}$ as an anchor that teaches experts to coordinate with $M_\text{pub}$ and, by extension, with each other. Specifically, during training, for dataset $D_i$, we construct a MoE model with two expert modules—both initialized from the same FFNs from $M_\text{pub}$. During training, we freeze $M_\text{pub}$ expert and the shared attention layer, while the other expert ($M_i$) is trained on $D_i$. As each data owner updates only their own FFNs while keeping all other parameters (those inherited from $M_\text{pub}$ such as attention layer) frozen, the learned FFNs are designed to naturally coordinate with each other later during merging at inference time. Importantly, with this approach, a router is learned so that each expert can be integrated into a MoE architecture without additional training (details in §3.3.2).

为防止这种偏离, 我们在独立训练专家的同时教它们协调 (图 1). 我们把 $M_\text{pub}$ 当作锚点, 让专家学会与 $M_\text{pub}$ 协作, 进而彼此协作. 具体来说, 训练时针对数据集 $D_i$ 构造一个含两个专家模块的 MoE, 两个专家都从 $M_\text{pub}$ 的同一组 FFN 初始化. 训练中冻结 $M_\text{pub}$ 专家和共享的注意力层, 只在 $D_i$ 上训练另一个专家 ($M_i$). 由于每个数据拥有者只更新自己的 FFN, 其余参数 (注意力层等从 $M_\text{pub}$ 继承的参数) 全部冻结, 学到的 FFN 在推理时合并后能自然地彼此协作. 重要的是, 这种做法同时学出一个路由器, 使每个专家无需额外训练就能整合进 MoE 架构 (细节见 §3.3.2).

#### 3.3.2 Domain-Informed Router · 域感知路由器

The router plays a critical role in MoE: the router function $r$ maps an input vector $\mathbf{x}$ to a distribution over expert modules, including the public model as one of the experts:

$$r(\mathbf{x}) = \mathbf{W}_r\mathbf{x},\quad \mathbf{W}_r\in\mathbb{R}^{(n+1)\times h}$$

路由器在 MoE 中很关键: 路由函数 $r$ 把输入向量 $\mathbf{x}$ 映射为各专家模块上的分布, 公共模型也是其中一个专家, 见上式.

In typical MoEs, $\mathbf{W}_r$ is trained end-to-end alongside all expert modules, using access to the full training dataset. Instead, we decompose $\mathbf{W}_r$ into individual expert-specific router embeddings, where each row $\mathbf{r}_i$ represents the router embedding for expert $M_i$, learned only from $D_i$:

$$\mathbf{W}_r = \begin{bmatrix} \mathbf{r}_\text{pub} \\ \mathbf{r}_1 \\ \vdots \\ \mathbf{r}_n \end{bmatrix}, \quad \text{where}\ \mathbf{r}_i = \frac{1}{|S_i|}\sum_{d_k \in S_i}\mathbf{E}(d_k)\in\mathbb{R}^h,\quad S_i \subset D_i.$$

在常见 MoE 里, $\mathbf{W}_r$ 借助完整训练集与全部专家模块一起端到端训练. 我们则把 $\mathbf{W}_r$ 拆成各专家专属的路由嵌入, 每一行 $\mathbf{r}_i$ 是专家 $M_i$ 的路由嵌入, 只从 $D_i$ 学得, 见上式.

These router embeddings can be initialized by averaging domain-specific embeddings of samples from each $D_i$, obtained by encoding subsets of data using an off-the-shelf embedder $\mathbf{E}$ [67] that maps a document into an $h$-dimensional vector. This method is motivated by prior model merging work that leverages domain embeddings for routing [68, 42, 69, 70, 71, 72, 73].

这些路由嵌入可以这样初始化: 用现成的嵌入模型 $\mathbf{E}$ [67] 把文档映射为 $h$ 维向量, 对每个 $D_i$ 的一部分样本编码, 再把这些域嵌入取平均. 这种做法受到已有模型融合工作中用域嵌入做路由的启发 [68, 42, 69, 70, 71, 72, 73].

During coordinated training of experts (§3.3.1), we learn the router embeddings in pairs: $[\mathbf{r}_\text{pub}, \mathbf{r}_i]$. The public embedding $\mathbf{r}_\text{pub}$ remains frozen across all experts, while $\mathbf{r}_i$ is finetuned separately alongside the parameters of $M_i$. At inference time, merging the expert embeddings into the complete router matrix $\mathbf{W}_r$ directly integrates all expert modules into one unified MoE. Furthermore, experts can be flexibly added or removed by simply adding or removing their corresponding router embedding.

在专家的协调训练中 (§3.3.1), 路由嵌入成对学习: $[\mathbf{r}_\text{pub}, \mathbf{r}_i]$. 公共嵌入 $\mathbf{r}_\text{pub}$ 对所有专家都保持冻结, $\mathbf{r}_i$ 则与 $M_i$ 的参数一起单独微调. 推理时把各专家的嵌入合并成完整的路由矩阵 $\mathbf{W}_r$, 就直接把所有专家模块整合成一个统一的 MoE. 此外, 只要增删对应的路由嵌入, 就能灵活地增删专家.

**Adding a Bias Term** Unlike standard router learning that is learned among all experts jointly, coordinated training of experts only learns pairwise routing decisions between one expert and the public model. This means the model never directly compares experts $M_1$ and $M_2$ during training, potentially limiting generalization during inference. To alleviate this issue, we add a negative bias term $b_i$ for each independent trained expert $\{M_1, M_2, \ldots, M_n\}$. We select expert $M_i$ when:

$$\mathbf{r}_i \cdot \mathbf{x} + b_i > \mathbf{r}_\text{pub} \cdot \mathbf{x} \quad \forall i \in \{1, 2, ..., n\}$$

Otherwise default to $M_\text{pub}$. This helps the later merging process, where each expert competes not just with the public model but with all other experts. Further details and justifications are provided in §D.

**加入偏置项** 标准路由器在全部专家之间联合学习, 而专家的协调训练只学一个专家与公共模型之间的两两路由决策. 也就是说, 训练中模型从不直接比较专家 $M_1$ 和 $M_2$, 这可能限制推理时的泛化. 为缓解这一点, 我们给每个独立训练的专家 $\{M_1, M_2, \ldots, M_n\}$ 加一个负偏置项 $b_i$, 满足上式时选择专家 $M_i$, 否则默认用 $M_\text{pub}$. 这有助于后续合并, 因为那时每个专家不只和公共模型竞争, 还要和所有其他专家竞争. 更多细节和理由见 §D.

并非. 仓库 `scripts/train_expert_model.sh` 把两专家 MoE 的 `router.top_k` 设为 2, 两个专家每个 token 都参与计算, 偏置只改变 softmax 后的权重. `MoERouterWithExpertBias` 里 $b_i$ 是可学习参数, 前向时取 `torch.minimum(b, 0)` 保证非正; 文中没有说 $b_i$ 可学习, 也没有给初值或终值. 同一脚本实际构建的是 `olmoe_nx7b` 路由器, 带偏置的那一行被注释掉, HF 发布的 `FlexOlmoTopKRouter` 同样没有偏置.

#### 3.3.3 Optional Router Training on Proxy Data · 可选: 在代理数据上训练路由器

With our proposed model design, expert modules can be merged without any additional training. However, if data owners are willing to identify proxy samples within the public dataset $M_\text{pub}$ that

5

<!-- page 6 of 26 -->

resemble their closed data, we can optionally perform a lightweight router tuning step after merging, using only public data from $D_\text{pub}$. Specifically, we assume each data owner selects a small proxy set $\hat{D}_i \subseteq D_\text{pub}$, where $|\hat{D}_i| \ll 0.01 \times |D_i|$, chosen to approximate the distribution of their closed dataset $D_i$. While $\hat{D}_i$ is too small to train expert modules, it still provides useful signals for improving router quality. To construct $\hat{D}_i$, we train a binary classifier to distinguish $D_i$ from $D_\text{pub}$ and select public samples with the highest predicted likelihood of belonging to $D_i$. After merging, we tune the router embeddings $\mathbf{r}_1, \cdots, \mathbf{r}_n, \mathbf{r}_\text{pub}$ on the combined set $\hat{D}_1, \cdots, \hat{D}_n$, and $D_\text{pub}$, sampled uniformly.

按我们的模型设计, 专家模块无需任何额外训练就能合并. 不过, 如果数据拥有者愿意在公开数据集中找出与自己封闭数据相似的代理样本 (原文此处写作 $M_\text{pub}$, 应为 $D_\text{pub}$), 合并后就可以只用 $D_\text{pub}$ 的公开数据做一步轻量的路由器微调. 具体来说, 假设每个数据拥有者选出一个小的代理集 $\hat{D}_i \subseteq D_\text{pub}$, $|\hat{D}_i| \ll 0.01 \times |D_i|$, 用来近似其封闭数据集 $D_i$ 的分布. $\hat{D}_i$ 太小, 训练不了专家模块, 但仍能为提升路由质量提供有用信号. 构造 $\hat{D}_i$ 的方法是训练一个区分 $D_i$ 与 $D_\text{pub}$ 的二分类器, 选出被预测为属于 $D_i$ 的可能性最高的公开样本. 合并后, 在均匀采样的 $\hat{D}_1, \cdots, \hat{D}_n$ 与 $D_\text{pub}$ 的并集上微调路由嵌入 $\mathbf{r}_1, \cdots, \mathbf{r}_n, \mathbf{r}_\text{pub}$.

不能严格满足. 代理集由在 $D_i$ 上训练的分类器挑出, 微调后的 $\mathbf{r}_\text{pub}$ 与各 $\mathbf{r}_j$ 都带上了 $D_i$ 的间接信号; `src/scripts/train/OLMoE-4x7B.py` 只冻结专家参数, 路由器整体可训. 删掉 $M_i$ 后, 留下的路由行仍是 RT 之后的值. 只有不做 RT 的版本 (表 1, 表 2 的 no RT 行) 才符合 §3.1 的第 (2) 条.

## 4 Experimental Setup · 实验设置

### 4.1 Training Data: FlexMix · 训练数据: FlexMix

Our corpus comprises a single Public Mix and seven closed sets—either real or simulated—which are designed to be disjoint from each other and from the Public Mix. Figure 5 in §B provides the statistics.

我们的语料由一个 Public Mix 和七个封闭集 (真实的或模拟的) 组成, 这些集合彼此不相交, 也与 Public Mix 不相交. 统计数据见 §B 的图 5.

- **Public Mix** represents general web text based on Common Crawl (CC).¹ Specifically, we took the Baseline version of DCLM [74], excluding news and creative writing content (described below). This represents a public dataset that can be used without restrictions.
- **News** includes news content from DCLM-Baseline, obtained by applying the classifier from [75] and selecting documents classified as News Articles. While included in CC when downloaded, many of the original sources are subject to closed access [20].
- **Creative Writing** includes creative content from DCLM-Baseline, obtained by applying the classifier from [75] and selecting documents classified as Creative Writing.
- **Code** includes code repositories from Starcoder [76, 77] with additional quality filtering as in [78].
- **Academic** includes open-access academic papers obtained from [79]; these are papers from [80, 81] but re-processed using olmOCR [79] for cleaner plain text.

- **Public Mix**: 基于 Common Crawl (CC)¹ 的通用网页文本. 具体是 DCLM [74] 的 Baseline 版本, 去掉了新闻和创意写作内容 (见下). 它代表可以不受限制使用的公开数据集.
- **News**: DCLM-Baseline 中的新闻内容, 用 [75] 的分类器筛出被判为 News Articles 的文档. 下载时它们包含在 CC 中, 但很多原始来源是封闭访问的 [20].
- **Creative Writing**: DCLM-Baseline 中的创意内容, 用 [75] 的分类器筛出被判为 Creative Writing 的文档.
- **Code**: 来自 Starcoder [76, 77] 的代码仓库, 并按 [78] 做了额外质量过滤.
- **Academic**: 来自 [79] 的开放获取学术论文, 即 [80, 81] 中的论文, 用 olmOCR [79] 重新处理得到更干净的纯文本.

- **Educational Text** includes educational text from digitized PDFs, converted to plain text using olmOCR [79].
- **Math** includes math-relevant content, including web pages about or using math and math problem sets, obtained by combining Dolmino Math Mix [78] and FineMath4+ [82].
- **Reddit** contains posts and comments originally sourced and released by Dolma [83], further filtered and processed to improve quality (details in Appendix B). As of this writing, this Reddit data is no longer unrestrictedly downloadable due to Reddit's 2023 policy change.²

- **Educational Text**: 数字化 PDF 中的教育文本, 用 olmOCR [79] 转为纯文本.
- **Math**: 数学相关内容, 包括讨论或使用数学的网页和数学习题集, 由 Dolmino Math Mix [78] 与 FineMath4+ [82] 合并而成.
- **Reddit**: 最初由 Dolma [83] 收集发布的帖子和评论, 经过进一步过滤和处理以提升质量 (细节见附录 B). 截至本文写作时, 由于 Reddit 2023 年的政策变化, 这份 Reddit 数据已不能不受限制地下载.²

These seven sets are designed to represent datasets with at least one of the following characteristics: (1) historically closed and not publicly available; (2) previously publicly available but now closed; or (3) domains with scarce high-quality public data.

这七个集合用来代表至少具备以下一种特征的数据集: (1) 一直封闭, 从未公开; (2) 曾经公开, 现在封闭; (3) 高质量公开数据稀缺的领域.

### 4.2 Evaluation · 评测

We evaluate our models and baselines on a large and diverse collection of well-established benchmarks, consisting of 31 tasks across 10 categories, broadly grouped into (1) general-purpose LM benchmarks and (2) domain-specific evaluations. More details are provided in §C.

我们在一大批多样且成熟的基准上评测我们的模型和基线, 共 31 个任务, 分属 10 个类别, 大体分为 (1) 通用 LM 基准和 (2) 特定领域评测. 更多细节见 §C.

**General-purpose Evaluation** We report results on (1) MC9, nine multiple-choice datasets including ARC-Easy [84], ARC-Challenge [84], BoolQ [85], CSQA [86], HellaSwag [87], OpenBookQA [88], PIQA [89], SocialIQa [90], and WinoGrande [91], (2) GEN5, five generative tasks including CoQA [92], SQuAD [93], Natural Questions [94], TriviaQA [95], and DROP [96], as well as (3) MMLU [97], (4) MMLU-Pro [98], (5) AGIEval [99] consisting of 20 tasks from college admission tasks, and (6) BBH [100] consisting of 23 challenging BIG-Bench tasks.

**通用评测** 我们报告以下结果: (1) MC9, 九个多选数据集, 包括 ARC-Easy [84], ARC-Challenge [84], BoolQ [85], CSQA [86], HellaSwag [87], OpenBookQA [88], PIQA [89], SocialIQa [90] 和 WinoGrande [91]; (2) GEN5, 五个生成任务, 包括 CoQA [92], SQuAD [93], Natural Questions [94], TriviaQA [95] 和 DROP [96]; 以及 (3) MMLU [97], (4) MMLU-Pro [98], (5) 由 20 个升学考试任务组成的 AGIEval [99], (6) 由 23 个高难 BIG-Bench 任务组成的 BBH [100].

**Domain-specific Evaluation** While general-purpose evaluation benchmarks already include some math assessment, we further evaluate math ability using (6) Math2, which encompasses two specialized math benchmarks: GSM8K [101] and MATH [102]. To evaluate coding capabilities, we use (7)

¹https://commoncrawl.org ²Reddit's 2023 policy change restricts third-party access and use of its data, including for language model development; see nytimes.com/2023/04/18/technology/reddit-ai-openai-google.html.

¹ https://commoncrawl.org ² Reddit 2023 年的政策变化限制第三方访问和使用其数据, 包括用于语言模型开发; 见 nytimes.com/2023/04/18/technology/reddit-ai-openai-google.html.

6

<!-- page 7 of 26 -->

Code4, 4 coding benchmarks including MBPP [103], MBPPPLUS [104], HUMANEVAL [105], and HUMANEVALPLUS [104]. To measure scientific literature understanding, we report on (8) SciRIFF5: comprising 5 subtasks from SciRIFF [106]. Finally, we include (9) NewsG: news generation and (10) PoemG: poem generation tasks, both evaluated using an LM judge.

**特定领域评测** 通用评测基准已经包含一些数学考查, 我们再用 (6) Math2 进一步评测数学能力, 它包括两个专门的数学基准: GSM8K [101] 和 MATH [102]. 评测编程能力用 (7) Code4, 即 MBPP [103], MBPPPLUS [104], HUMANEVAL [105] 和 HUMANEVALPLUS [104] 四个编程基准. 衡量科学文献理解用 (8) SciRIFF5, 由 SciRIFF [106] 的 5 个子任务组成. 末尾还有 (9) NewsG 新闻生成和 (10) PoemG 诗歌生成, 两者都用 LM 评审打分.

### 4.3 Baselines · 基线

We compare our method against several baselines, either taken directly from prior work or minimally adapted to our problem setting. All baselines, except for 'Unrestricted training,' train a set of dense models independently by continuing pretraining from the public model $M_\text{pub}$ on each simulated closed set, without architectural changes, and merge them using model merging techniques.

我们把方法与若干基线比较, 这些基线或直接取自已有工作, 或针对本问题设定做了最小改动. 除「Unrestricted training」外, 所有基线都从公共模型 $M_\text{pub}$ 出发, 在每个模拟封闭集上不改架构地继续预训练, 独立得到一组 dense 模型, 再用模型融合技术合并.

**Prompt-based Routing** We use an LM-based domain classifier via prompting to route each query to the most suitable model, which is then used exclusively. We use Llama-3.1-8B-Instruct [107] and OLMo-2-1124-7B-Instruct [78] as classifiers. More details are in §A.1.

**基于提示的路由** 我们通过提示, 用一个基于 LM 的领域分类器把每个查询路由到最合适的模型, 之后只用这个模型. 分类器用 Llama-3.1-8B-Instruct [107] 和 OLMo-2-1124-7B-Instruct [78]. 更多细节见 §A.1.

**Model Soup** We apply both average and weighted parameter averaging across all models, following [12]. The weights are derived by applying a softmax over the log-likelihoods of each model on the test example input.

**Model Soup** 按 [12], 我们对全部模型做等权和加权两种参数平均. 权重由各模型在测试样例输入上的对数似然经 softmax 得到.

**Branch-Train-Merge (BTM)** We follow BTM [11], which ensembles models by computing a weighted average of their output probabilities. Weights are obtained via a softmax over the log-likelihoods of the test example input of each model. As in the original BTM, ensembling can be restricted to the top-k models by zeroing the weights of all other models and renormalizing. See §A.1 for full details.

**Branch-Train-Merge (BTM)** 按 BTM [11], 对各模型的输出概率做加权平均来集成. 权重由各模型在测试样例输入上的对数似然经 softmax 得到. 与原始 BTM 一样, 可以把其余模型的权重置零再重新归一化, 只集成 top-k 个模型. 完整细节见 §A.1.

**BTX** We follow BTX [55], which upcycles an MoE from independently trained dense models. It copies the dense model parameters to the corresponding experts in MoE while averaging non-expert parameters such as attention layers for merging. The original BTX requires training all model parameters on combined datasets after merging. To approximate it as closely as possible while adhering to our setting, we perform this post-merge training on the public set only.

**BTX** 按 BTX [55], 把独立训练的 dense 模型升级改造 (upcycle) 成一个 MoE: 把各 dense 模型的参数复制到 MoE 中对应的专家, 注意力层等非专家参数取平均来合并. 原始 BTX 要求合并后在全部数据的并集上训练所有参数. 为了在遵守本设定的前提下尽量贴近它, 我们只在公开集上做这一步合并后训练.

**Unrestricted MoE** To assess how closely our method approaches the benefits of full data access while preserving data separation, we construct an upper-bound reference model: a sparse MoE initialized from the public-only dense model and trained on the combined dataset, including all closed sets and Public Mix. As MoE training incurs roughly 2× the FLOPs of our approach for the same data size, we report both compute-controlled (1× FLOPs, 0.5× data) and data-controlled (2× FLOPs, 1× data) comparisons.

**Unrestricted MoE** 为了衡量我们的方法在保持数据隔离的同时, 离完全数据访问的收益有多近, 我们构造一个上界参考模型: 从仅用公开数据训练的 dense 模型初始化一个稀疏 MoE, 在包括全部封闭集和 Public Mix 的合并数据上训练. 由于同样数据量下 MoE 训练的 FLOPs 约为我们方法的 2 倍, 我们同时报告控制算力 (1× FLOPs, 0.5× 数据) 和控制数据 (2× FLOPs, 1× 数据) 两种对比.

### 4.4 Training Setup · 训练设置

For the public model $M_\text{pub}$, we use a dense model with 7 billion parameters following the OLMo 2 architecture [78]. This model contains 32 layers with hidden dimension 4,096 and is trained on our public mix for 1 trillion tokens. Following [78], we use a learning rate of 0.0009 and the AdamW optimizer with parameters $\beta_1 = 0.9$ and $\beta_2 = 0.95$ and a cosine learning rate scheduler. The public model is pretrained using 512 H100 GPUs with a global batch size of 4 million tokens for three days.

公共模型 $M_\text{pub}$ 是一个遵循 OLMo 2 架构 [78] 的 70 亿参数 dense 模型, 共 32 层, 隐藏维度 4,096, 在我们的 public mix 上训练 1 万亿 token. 按 [78], 学习率 0.0009, 优化器 AdamW ($\beta_1 = 0.9$, $\beta_2 = 0.95$), 余弦学习率调度. 公共模型用 512 张 H100, 全局 batch 400 万 token, 预训练三天.

Each data owner then takes this checkpoint and performs continued-pretraining for 50 billion tokens on their own data (totaling 400B tokens across all experts). For the optional router training, we use 5 billion tokens in total. The final FlexOlmo, trained on 8 sets, has 37 billion total parameters with 20 billion active (4 active experts out of 8). More details can be found in §A.2.

随后每个数据拥有者拿这个 checkpoint, 在自己的数据上继续预训练 500 亿 token (全部专家合计 4000 亿 token). 可选的路由器训练共用 50 亿 token. 最终在 8 个集合上训练的 FlexOlmo 总参数 370 亿, 激活 200 亿 (8 个专家中激活 4 个). 更多细节见 §A.2.

只有把公共专家也算进去才是 $8\times 50\text{B}=400\text{B}$. 仓库 `scripts/train_public_model.sh` 在 1T token (step 238419) 之后另有一段在 public mix 上的 50B 退火 (`OLMoE-2x7B-anneal.py`, step 11921, 每步约 4.19M token), 本节没有交代这一步. 另外, 预训练的余弦调度按 5T 设定, 在 1T 处截停, 学习率并未衰减到底.

## 5 Results and Analysis · 结果与分析

We conduct ablation studies and compare against a comprehensive set of baselines at a small scale with four experts—Public mix, math, educational text, and code (Table 1). We then evaluate our final model on the full setup including the Public mix and all seven simulated closed sets (Table 2). Finally, we present an in-depth analysis to illustrate the behavior and effectiveness of FlexOlmo.

我们先在四专家 (Public mix, 数学, 教育文本, 代码) 的小规模设定下做消融, 并与一整套基线比较 (表 1). 然后在包含 Public mix 和全部七个模拟封闭集的完整设定下评测最终模型 (表 2). 末尾做深入分析, 说明 FlexOlmo 的行为和效果.

7

<!-- page 8 of 26 -->

Table 1: Evaluation of FlexOlmo trained on four sets (public mix, math, educational text and code), tested on 24 tasks with 100 samples per subtask.

| Group | Model | MC9 | GEN5 | MMLU | MMLU Pro | AGI Eval | BBH | Math2 | Code4 | Avg. |
|---|---|---|---|---|---|---|---|---|---|---|
| Prev. | Public model | 68.4 | 58.8 | 57.0 | 27.1 | 39.0 | 35.6 | 8.1 | 1.0 | 36.9 |
| Individual experts | Math | 63.8 | 46.3 | 51.1 | 24.0 | 40.7 | 45.4 | 50.4 | 18.1 | 42.5 |
| | Code | 38.7 | 41.4 | 30.0 | 14.6 | 29.0 | 38.2 | 6.0 | 22.4 | 27.5 |
| | Educational Text | 63.0 | 52.8 | 57.7 | 26.8 | 39.6 | 40.0 | 13.1 | 4.3 | 37.2 |
| Prior model merging work | Model soup (average) | 70.6 | 53.8 | 54.7 | 28.4 | 41.4 | 42.4 | 17.5 | 8.2 | 39.6 |
| | Model soup (weighted) | 69.6 | 56.3 | 58.6 | 30.5 | 45.4 | 43.5 | 18.5 | 14.8 | 42.2 |
| | BTM | 69.0 | 58.5 | 59.6 | 29.0 | 43.6 | 43.6 | 21.2 | 22.3 | 43.4 |
| | Prompt-based routing (router: OLMo) | 59.9 | 48.8 | 50.0 | 25.4 | 38.7 | 41.3 | 41.5 | 20.7 | 40.8 |
| | Prompt-based routing (router: Llama) | 64.2 | 53.4 | 57.7 | 26.4 | 39.9 | 39.8 | 21.5 | 17.3 | 40.0 |
| | BTX | 69.6 | 57.9 | 56.2 | 28.5 | 43.1 | 41.3 | 16.8 | 6.4 | 40.0 |
| Ours | FlexOlmo (no optional router training) | 71.1 | 58.6 | 58.1 | 28.4 | 44.8 | 43.4 | 51.5 | 18.2 | 46.7 |
| | no bias | 67.9 | 55.6 | 57.5 | 28.6 | 43.9 | 45.5 | 50.0 | 17.6 | 45.8 |
| | no domain embedding init, no bias | 70.0 | 55.4 | 56.1 | 25.9 | 41.1 | 44.9 | 44.9 | 16.6 | 44.4 |
| | no training to coordinate | 64.4 | 51.5 | 55.5 | 24.7 | 43.1 | 41.2 | 19.3 | 10.3 | 38.8 |
| | FlexOlmo | 71.0 | 59.8 | 59.9 | 30.8 | 45.8 | 47.1 | 50.7 | 17.3 | 47.8 |
| Reference model (upperbound) | Unrestricted MoE (1× FLOPs, 0.5× Data) | 68.0 | 53.8 | 57.8 | 28.9 | 41.5 | 48.6 | 49.4 | 22.2 | 46.3 |
| | Unrestricted MoE (2× FLOPs, 1× Data) | 73.3 | 60.2 | 63.1 | 32.5 | 48.1 | 54.4 | 53.4 | 27.0 | 51.5 |

Table 2: Evaluation of FlexOlmo trained on eight sets (public mix and seven simulated closed sets) on 31 tasks across 10 categories, tested with 1,000 samples per subtask. "no RT" indicates no optional router training on proxy data (§3.3.3).

| Group | Model | MC9 | GEN5 | MMLU | MMLU Pro | AGIEval | BBH | Math2 | NewsG | PoemG | SciRIFF5 | Code4 | Avg. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Prev. | Public model | 68.7 | 58.8 | 55.9 | 26.2 | 39.9 | 35.7 | 8.2 | 76.0 | 47.8 | 48.1 | 1.1 | 42.4 |
| Individual experts | Math | 62.5 | 44.3 | 50.6 | 24.1 | 42.0 | 45.6 | 53.1 | 42.6 | 28.0 | 50.7 | 15.8 | 41.8 |
| | Code | 40.5 | 39.4 | 29.5 | 14.5 | 27.4 | 38.1 | 6.0 | 45.1 | 28.2 | 48.0 | 21.0 | 30.7 |
| | Educational Text | 64.3 | 52.1 | 56.5 | 27.0 | 39.7 | 40.3 | 13.6 | 57.6 | 51.8 | 51.7 | 3.0 | 41.6 |
| | News | 46.5 | 48.6 | 36.4 | 15.2 | 25.7 | 30.9 | 2.5 | 77.7 | 26.9 | 47.0 | 0.0 | 32.5 |
| | Creative Writing | 42.7 | 43.9 | 31.5 | 11.6 | 23.3 | 27.6 | 1.7 | 56.9 | 67.5 | 42.4 | 0.0 | 31.7 |
| | Academic | 41.0 | 45.2 | 33.8 | 14.8 | 24.1 | 32.4 | 6.5 | 51.8 | 23.0 | 52.0 | 0.0 | 29.5 |
| | Reddit | 64.7 | 36.5 | 56.1 | 25.5 | 35.5 | 19.7 | 2.5 | 54.1 | 8.6 | 32.7 | 1.7 | 30.7 |
| Combined model | BTM (top-2) | 68.7 | 57.7 | 59.4 | 28.3 | 43.2 | 44.3 | 23.1 | 73.6 | 54.4 | 46.3 | 24.0 | 47.6 |
| | FlexOlmo (no RT) | 69.2 | 53.2 | 58.8 | 34.0 | 43.4 | 42.1 | 52.1 | 78.2 | 60.1 | 54.4 | 18.6 | 51.3 |
| | FlexOlmo | 70.8 | 59.8 | 60.4 | 30.9 | 45.1 | 46.4 | 48.5 | 80.7 | 62.2 | 54.3 | 17.2 | 52.4 |

### 5.1 Main Results · 主要结果

**Individual experts excel at their specialized tasks** As shown in Table 1, experts trained on each domain-specific set demonstrate strong performance in their specialized domains: the Math expert achieves the highest scores on math tasks, while the Code expert performs the best on coding benchmarks. However, these experts exhibit considerable performance degradation when evaluated on tasks outside their domains. Notably, the Code expert performs poorly on general benchmarks.

**单个专家擅长各自的专门任务** 如表 1 所示, 在各特定领域集上训练的专家在本领域表现很强: 数学专家在数学任务上得分最高, 代码专家在编程基准上最好. 但这些专家在领域外的任务上明显退化. 尤其是代码专家, 在通用基准上表现很差.

**FlexOlmo outperforms individual experts** FlexOlmo outperforms individual experts in most cases. It improves upon the model trained solely on public data, achieving an average 41% relative gain. Largest improvements appear on benchmarks where closed data significantly boosts individual expert performance, e.g., 35.6 → 47.1 on BBH, 8.1 → 50.7 on math, and 1.0 → 17.3 on coding. Notably, FlexOlmo even matches or exceeds the performance of specialized experts on their respective tasks (e.g., on BBH and Math2).

**FlexOlmo 优于单个专家** 多数情况下 FlexOlmo 优于单个专家. 相比只用公开数据训练的模型, 它平均取得 41% 的相对提升. 提升最大的是那些封闭数据能显著拉高单个专家表现的基准, 例如 BBH 从 35.6 到 47.1, 数学从 8.1 到 50.7, 编程从 1.0 到 17.3. FlexOlmo 在专门任务上甚至追平或超过了对应专家 (如 BBH 和 Math2).

用表 1 的 Avg. 列复算, $47.8/36.9-1\approx 29.5\%$ (no RT 行为 $46.7/36.9-1\approx 26.6\%$); 用表 2 复算为 $52.4/42.4-1\approx 23.6\%$. 改用逐类别相对提升取平均, 表 1 约 279%, 表 2 约 189%, 都被 Code4 从 1.0 左右涨到 17 左右这一项主导; 几何平均分别约 95% 和 67%. 文中没有给出 41% 的算法, 以上几种口径都得不到 41%. 同表里 no RT 行八项平均为 46.76, 印成 46.7.

**FlexOlmo achieves more effective merging than baselines** We also compare FlexOlmo with baseline merging methods (§4.3). All baselines outperform the model trained on Public Mix

8

<!-- page 9 of 26 -->

Table 3: Impact of embedding initialization methods on model performance. The GRIT embedder [67] consistently outperforms public model embeddings across most benchmarks.

| Model | Embed Init. | MC9 | GEN5 | MMLU | MMLU Pro | AGI Eval | BBH | Math2 | Code4 | Avg. |
|---|---|---|---|---|---|---|---|---|---|---|
| FlexOlmo | Public | 70.5 | 55.5 | 58.3 | 26.5 | 40.2 | 40.1 | 48.4 | 8.7 | 43.5 |
| FlexOlmo | GRIT | 71.1 | 58.6 | 58.1 | 28.4 | 44.8 | 43.4 | 51.5 | 18.2 | 46.7 |

![](images/router.png)

Figure 2: Routing pattern analysis. We visualize how text from different domains activate experts (four experts activated). The horizontal gray lines indicate uniform routing.

only. However, their performance is inconsistent: model soup and BTX are generally weak,³ while prompt-based routing is highly unstable: it performs well when the classifier selects the correct expert, but degrades sharply when it does not. Among the baselines, BTM yields the best performance. Nonetheless, FlexOlmo outperforms all prior model merging methods, beating the best baseline BTM by 10.1% relative on average. We attribute this to the MoE-based design of our model, which selectively activates different experts per layer, effectively combining the complementary strengths of each specialized model (see further analysis in §5.2).

**FlexOlmo 的合并比基线更有效** 我们还把 FlexOlmo 与基线融合方法 (§4.3) 比较. 所有基线都优于只在 Public Mix 上训练的模型, 但表现不稳定: model soup 和 BTX 总体偏弱³, 基于提示的路由则极不稳定, 分类器选对专家时表现好, 选错时急剧退化. 基线中 BTM 最好. 尽管如此, FlexOlmo 优于所有已有融合方法, 平均比最好的基线 BTM 相对高 10.1%. 我们把这归因于模型基于 MoE 的设计: 它在每层选择性地激活不同专家, 有效组合了各专门模型的互补长处 (进一步分析见 §5.2).

**Comparison to the unrestricted MoE** Compared to the unrestricted MoE trained without considering data restrictions (§4.3), FlexOlmo outperforms the FLOP-controlled setting (1× FLOPs, 0.5× Data). It slightly underperforms the data-controlled model (2× FLOPs, 1× Data). This indicates that FlexOlmo enables training without direct access to the data (requiring only model sharing) and flexible opt-in and opt-out functions while retaining strong performance.

**与不受限 MoE 的对比** 与不考虑数据限制训练的 unrestricted MoE (§4.3) 相比, FlexOlmo 优于控制 FLOPs 的设定 (1× FLOPs, 0.5× 数据), 略逊于控制数据的模型 (2× FLOPs, 1× 数据). 这说明 FlexOlmo 能在不直接访问数据 (只需共享模型) 的情况下训练, 提供灵活的加入和退出功能, 同时保持很强的性能.

**Ablations on FlexOlmo** We further evaluate FlexOlmo by removing different components introduced in §3.3: learning to coordinate, router initialization, and the bias term. Our results show that each component plays an important role, with the removal of any one leading to performance drop. In particular, we observe that randomly initializing router embeddings leads to the final learned router embeddings being very similar to each other, making the later merging of multiple experts harder. Furthermore, we confirm that FlexOlmo benefits from additional router training (§3.3.3) and using external embedders for router initialization, compared to using the public model's hidden states as the initialization (Table 3).

**FlexOlmo 的消融** 我们进一步去掉 §3.3 引入的各个组件来评测 FlexOlmo: 学习协调, 路由器初始化和偏置项. 结果表明每个组件都很重要, 去掉任何一个都会掉点. 尤其是随机初始化路由嵌入时, 最终学到的各路由嵌入彼此高度相似, 让之后合并多个专家更难. 此外我们确认, FlexOlmo 能从额外的路由器训练 (§3.3.3) 中获益; 用外部嵌入模型初始化路由器, 也比用公共模型的隐藏状态初始化更好 (表 3).

**Final FlexOlmo in the full setup** Finally, we evaluate FlexOlmo in the full eight-expert setup and compare it against the public-only model, individual experts trained on closed datasets, and BTM (top-2), the strongest baseline from Table 1. This was done by simply adding four additional experts, benefiting from FlexOlmo's flexibility in easily adding new datasets. Consistent with earlier findings, FlexOlmo outperforms all individual models (the public baseline and individual experts), demonstrating the synergistic effect of combining independently trained modules. Compared to the strongest baseline BTM, it achieves a 10% relative improvement on average (Table 2). FlexOlmo excels on benchmarks where specialized experts perform well (BBH, Math2, NewsG, PoemG, SciRIFF5, Code4), matching or surpassing the experts, and also shows strong results on tasks where no single dataset suffices (e.g., MC9, Gen5, MMLU, MMLU Pro, AGI Eval).

**完整设定下的最终 FlexOlmo** 末尾, 我们在完整的八专家设定下评测 FlexOlmo, 并与仅公开数据的模型, 在封闭数据集上训练的单个专家, 以及表 1 中最强的基线 BTM (top-2) 比较. 得益于 FlexOlmo 便于加入新数据集的灵活性, 这只需再加四个专家即可. 与前面的发现一致, FlexOlmo 优于所有单个模型 (公开基线和各专家), 体现了组合独立训练模块的协同效应. 与最强基线 BTM 相比, 它平均相对提升 10% (表 2). FlexOlmo 在专门专家表现好的基准上 (BBH, Math2, NewsG, PoemG, SciRIFF5, Code4) 表现突出, 追平或超过这些专家; 在单个数据集都不够用的任务上 (如 MC9, Gen5, MMLU, MMLU Pro, AGI Eval) 也表现很强.

³This is likely because training on disjoint datasets causes experts to diverge from each other and from the seed model, making model soup limited, and training BTX on the public data only is not optimal.

³ 可能的原因是: 在不相交的数据集上训练让专家彼此之间以及与种子模型之间发生偏离, 限制了 model soup; 而 BTX 只在公开数据上训练也非最优的.

9

<!-- page 10 of 26 -->

![](images/active_expert.png)

Figure 3: Effect of active expert count on MMLU performance. Model performance stabilizes after activating four experts.

![](images/opt_out.png)

Figure 4: Opting out of news data. Removing the news expert reduces performance on NewsG with minimal impact on other tasks.

### 5.2 Model Behavior Analysis · 模型行为分析

**Routing patterns** Figure 2 visualizes the router's token distribution across experts for various domain inputs. The router tends to activate the corresponding domain expert (e.g., math inputs activate the math expert), demonstrating its ability to identify the most relevant module. We also observe frequent activation of the public expert, likely due to our coordinated training strategy, where each expert is designed to complement the public expert. Also, different combinations of experts are activated at different layers. This highlights the model's layer-specific specialization and its greater expressivity than approaches that route inputs to a single expert (e.g., prompt-based routing).

**路由模式** 图 2 可视化了不同领域输入下路由器把 token 分给各专家的分布. 路由器倾向于激活对应领域的专家 (例如数学输入激活数学专家), 说明它能识别最相关的模块. 我们还观察到公共专家被频繁激活, 这可能来自协调训练策略: 每个专家都被设计成对公共专家的补充. 另外, 不同层激活的专家组合不同. 这凸显了模型按层的专门化, 也说明它比把输入路由给单个专家的做法 (如基于提示的路由) 表达力更强.

**Number of active experts** We further analyze how the number of active experts affects downstream task performance. As shown in Figure 3, performance consistently improves as more experts are activated, up to four experts, after which it plateaus. This suggests that the final model can operate efficiently as a sparse model by activating only four experts per input during inference.

**激活专家数** 我们进一步分析激活专家数对下游任务表现的影响. 如图 3 所示, 激活的专家越多性能越好, 到四个专家为止, 之后趋于平稳. 这说明最终模型推理时每个输入只激活四个专家, 就能作为稀疏模型高效运行.

**Data opt-out** FlexOlmo offers a straightforward mechanism for opting out of specific datasets by removing the corresponding expert module at inference time. In Figure 4, we evaluate the model's performance after excluding the news expert. As expected, performance drops on in-domain tasks such as news generation. However, on unrelated tasks, performance remains largely unaffected.

**数据退出** FlexOlmo 提供了一种直接的退出机制: 推理时移除对应的专家模块, 即可退出特定数据集. 图 4 评测了排除新闻专家后的模型表现. 不出所料, 新闻生成等领域内任务掉点; 而在无关任务上, 表现基本不受影响.

### 5.3 Data Extraction Analysis · 数据提取分析

FlexOlmo enables data owners to contribute to the model without sharing their data by instead sharing model weights trained locally on their data. A natural and important concern is whether their data can be extracted from these shared weights [108, 109, 110]. This risk is particularly relevant when training data includes private or confidential information.

FlexOlmo 让数据拥有者不共享数据, 改为共享在本地数据上训练的模型权重, 来为模型做贡献. 一个自然而重要的担忧是, 能否从这些共享的权重中提取出他们的数据 [108, 109, 110]. 训练数据包含隐私或机密信息时, 这个风险尤为相关.

We empirically assess this risk by implementing training data extraction attacks following prior work [108]. Specifically, we sample 10,000 documents from the math data.⁴ From each document, we extract a 32-token prefix and use it to generate 256-token continuation using top-k sampling ($k = 50$), top-p sampling ($p = 0.95$), and a temperature of 1.0. We sample 10 times per prefix, and if any of the generated outputs achieves a normalized Levenshtein similarity of 0.9 or higher with the original document, we consider that document to be extracted. To validate our implementation, we apply it to a model overfitted on a small dataset (trained for 100 epochs), and observe a 60% extraction rate.

我们按已有工作 [108] 实现训练数据提取攻击, 实证评估这一风险. 具体来说, 从数学数据中采样 10,000 篇文档⁴, 从每篇文档取 32 token 的前缀, 用 top-k 采样 ($k = 50$), top-p 采样 ($p = 0.95$), 温度 1.0 生成 256 token 的续写. 每个前缀采样 10 次, 只要有一个生成结果与原文档的归一化 Levenshtein 相似度达到 0.9 或以上, 就认为该文档被提取. 为验证实现, 我们把它用在一个在小数据集上过拟合 (训练 100 个 epoch) 的模型上, 观察到 60% 的提取率.

Our results are as follows:

1. A public model that has not seen any math data yields an extraction rate of 0.1%.⁵
2. A dense model trained on the math dataset (i.e., math expert) yields 1.6%.
3. FlexOlmo with the math expert included yields 0.7%.

结果如下:

1. 没见过任何数学数据的公共模型, 提取率为 0.1%.⁵
2. 在数学数据集上训练的 dense 模型 (即数学专家), 提取率为 1.6%.
3. 包含数学专家的 FlexOlmo, 提取率为 0.7%.

对不上. 图 5 中 Reddit 为 9.9B token, 小于 Math 的 20.3B; 按 §4.4 每个专家训 50B token, Math 约为 $50/20.3\approx 2.46$ 个 epoch, Reddit 约为 $50/9.9\approx 5.1$ 个 epoch. 另外 `src/scripts/utils/extraction_analysis.py` 从文档内随机位置取 32 token 前缀, 比对窗口是含前缀的 256 token, `generate(max_length=256)` 实际只新生成 224 token, 与正文「生成 256 token 续写」的口径不同.

⁴We chose the math data because it is the smallest among our simulated closed sets and the math expert is trained for three epochs (instead of one), making it more susceptible to extraction. Therefore, the extraction rates with the math data likely represent an upper bound.

⁵Manual inspection suggests that the prefix prompts a deterministic continuation, causing the model to generate text that matches the target data even if the model has never seen that data during training, aligning with findings from previous research [111].

⁴ 选数学数据, 是因为它是模拟封闭集中最小的, 数学专家训了三个 epoch (而并非一个), 更容易被提取. 因此数学数据上的提取率很可能是一个上界.

⁵ 人工检查表明, 前缀会引出确定性的续写, 即使模型训练时从没见过该数据, 也会生成与目标数据吻合的文本, 这与已有研究 [111] 的发现一致.

10

<!-- page 11 of 26 -->

Table 4: Scaling up FlexOlmo (§5.4): We applied the FlexOlmo recipe to a 4T token pretrained public model (Pre-anneal model used in OLMo-2 7B) by incorporating two additional experts focused on math and code. The resulting modeling shows better performance compared to OLMo-2 7B, with equivalent training FLOPs. Evaluation is done with 1,000 samples per subtasks. As FlexOlmo with 3 active experts which makes the inference FLOPs 2.5× more than the dense models like OLMo-2 7B.

| Model | Inf. FLOPs | MC9 | GEN5 | MMLU | MMLU Pro | AGI Eval | BBH | Math2 | Code4 | Avg. |
|---|---|---|---|---|---|---|---|---|---|---|
| Pre-anneal model | 1× | 74.8 | 62.8 | 63.1 | 32.1 | 46.8 | 38.2 | 17.4 | 8.7 | 43.1 |
| OLMo-2 7B | 1× | 77.8 | 70.2 | 63.7 | 31.0 | 50.4 | 49.8 | 42.6 | 13.3 | 49.8 |
| FlexOlmo | 2.5× | 77.8 | 71.0 | 65.2 | 33.5 | 51.9 | 53.1 | 51.0 | 18.9 | 52.8 |

These results lead to the following conclusions. First, in practice, it is difficult to extract a substantial portion of the training data, which is in line with previous findings [108]. However, if a model includes any weights trained on the data, nonzero (though small) fraction of the data may be extractable. If data owners are comfortable with this minimal leakage, as long as a meaningful fraction of the data remains not extractable, we believe that FlexOlmo, in its current form, is a viable solution. If the owners' data includes any private or sensitive information, we recommend training experts using differentially private (DP) learning methods before contributing them to the model, which provides formal privacy guarantees. Applying DP is largely orthogonal to our architecture, and different data owners can make independent decisions on whether to apply DP or not, providing flexibility without compromising the overall design.

由这些结果可以得出以下结论. 第一步, 实践中很难提取出训练数据的相当一部分, 这与已有发现 [108] 一致. 但只要模型包含任何在该数据上训练的权重, 就可能有一小部分 (虽然很小, 但不为零) 数据可被提取. 如果数据拥有者能接受这种极小的泄露, 只要大部分数据仍不可提取, 我们认为当前形态的 FlexOlmo 是可行的方案. 如果拥有者的数据含有任何隐私或敏感信息, 我们建议在把专家贡献给模型之前, 用差分隐私 (DP) 学习方法训练专家, 以获得形式化的隐私保证. 应用 DP 与我们的架构基本正交, 不同数据拥有者可以各自决定是否使用 DP, 灵活且不影响整体设计.

### 5.4 Scaling FlexOlmo Further · 进一步扩展 FlexOlmo

§4 and §5.1 present controlled experiments showing that FlexOlmo performs competitively even againsts models trained without data restrictions. Motivated by this, we evaluate whether the FlexOlmo recipe can further improve an already strong model trained on the same datasets.

§4 和 §5.1 的对照实验表明, 即便与不受数据限制训练的模型相比, FlexOlmo 也有竞争力. 受此启发, 我们评估 FlexOlmo 的配方能否进一步提升一个在相同数据集上训练过的强模型.

We adopt the OLMo-2 7B setup [78], starting from a a checkpoint pre-trained on 4T tokens and annealed for 50B tokens to produce a public expert. We then train two additional experts on math and code, each for 50B tokens, and combine them with the public expert to form a three-expert version of FlexOlmo. We compare this model to the released version of OLMo-2,⁶ which was also continued from the same 4T-token checkpoint using an equivalent compute budget (3×50B-token training).

我们采用 OLMo-2 7B 的设置 [78], 从一个预训练了 4T token 的 checkpoint 出发, 退火 50B token 得到公共专家. 然后在数学和代码上各训一个专家, 各 50B token, 与公共专家组合成三专家版 FlexOlmo. 我们把它与发布版 OLMo-2⁶ 比较, 后者同样从这个 4T token 的 checkpoint 继续训练, 计算预算相当 (3×50B token 的训练).

As shown in Table 4, FlexOlmo consistently outperforms OLMo-2, with especially large gains on math and code tasks (BBH, Math2, Code4). This suggests that expert specialization with selective activation enhances performance without catastrophic forgetting or forcing diverse capabilities to compete for fixed model capacity. The results align with BTX [55], which similarly trains modular models to improve performance, even without data constraints.

如表 4 所示, FlexOlmo 稳定优于 OLMo-2, 在数学和代码相关任务 (BBH, Math2, Code4) 上提升尤其大. 这说明专家专门化加选择性激活能提升性能, 既没有灾难性遗忘, 也不必让多种能力争抢固定的模型容量. 这一结果与 BTX [55] 一致, 后者同样通过训练模块化模型提升性能, 即使没有数据约束.

## 6 Conclusion

We introduce FlexOlmo, a new class of LMs that solves real-world data constraint challenges with (1) modular, distributed training, where different model parameters are independently trained on disjoint and locally maintained datasets, and (2) data-flexible inference, where data can be selectively included at inference-time, with guarantees. We show that FlexOlmo significantly outperforms competitive baselines, while providing the benefits of distributed training and flexible inference. We hope this work broadens access to diverse datasets for LM training—datasets that would otherwise remain inaccessible because standard LM training requires centralized data pooling and offers no opt-out mechanism for data use based on proposed use cases or other data limitations.

我们提出 FlexOlmo, 一类新的 LM, 用两点解决现实中的数据约束问题: (1) 模块化的分布式训练, 不同模型参数在不相交且本地维护的数据集上独立训练; (2) 数据可选的推理, 推理时可以有保证地选择纳入哪些数据. 我们表明 FlexOlmo 显著优于有竞争力的基线, 同时带来分布式训练和灵活推理的好处. 标准 LM 训练要求集中汇集数据, 也没有按用途或其他数据限制退出的机制, 很多数据集因此用不上. 我们希望这项工作能让 LM 训练用上更多样的数据集.

## Acknowledgements

We thank Preston Jiang, Colin Raffel, Percy Liang, Matei Zaharia, Peter Henderson, David Q. Sun, Kevin Kuo, Virginia Smith, and Ai2 members for valuable discussion and feedback.

⁶https://huggingface.co/allenai/OLMo-2-1124-7B

⁶ https://huggingface.co/allenai/OLMo-2-1124-7B

11

<!-- page 12 of 26 -->

SM was supported in part by a grant from DARPA to the Simons Institute for the Theory of Computing. PWK was supported by the Singapore National Research Foundation and the National AI Group in the Singapore Ministry of Digital Development and Information under the AI Visiting Professorship Programme (award number AIVP-2024-001), and by the AI2050 program at Schmidt Sciences.

## References

[1] Pratyush Maini, Zhili Feng, Avi Schwarzschild, Zachary Chase Lipton, and J Zico Kolter.

TOFU: A task of fictitious unlearning for LLMs. In First Conference on Language Modeling, 2024.

[2] Weijia Shi, Jaechan Lee, Yangsibo Huang, Sadhika Malladi, Jieyu Zhao, Ari Holtzman, Daogao

Liu, Luke Zettlemoyer, Noah A Smith, and Chiyuan Zhang. Muse: Machine unlearning six- way evaluation for language models. arXiv preprint arXiv:2407.06460, 2024.

[3] A Feder Cooper, Christopher A Choquette-Choo, Miranda Bogen, Matthew Jagielski, Katja

Filippova, Ken Ziyu Liu, Alexandra Chouldechova, Jamie Hayes, Yangsibo Huang, Niloofar Mireshghallah, et al. Machine unlearning doesn’t do what you think: Lessons for generative ai policy, research, and practice. arXiv preprint arXiv:2412.06966, 2024.

[4] Jakub Konecn`y, H Brendan McMahan, X Yu Felix, Peter Richtárik, Ananda Theertha Suresh,

and Dave Bacon. Federated learning: Strategies for improving communication efficiency. CoRR, 2016.

[5] Brendan McMahan, Eider Moore, Daniel Ramage, Seth Hampson, and Blaise Aguera y Arcas.

Communication-Efficient Learning of Deep Networks from Decentralized Data. In Aarti Singh and Jerry Zhu, editors, Proceedings of the 20th International Conference on Artificial Intelligence and Statistics, volume 54 of Proceedings of Machine Learning Research, pages 1273–1282. PMLR, 20–22 Apr 2017.

[6] Kang Wei, Jun Li, Ming Ding, Chuan Ma, Howard Hua Yang, Farokhi Farhad, Shi Jin, Tony

Q. S. Quek, and H. Vincent Poor. Federated learning with differential privacy: Algorithms and performance analysis. IEEE Transactions on Information Forensics and Security, 15:3454– 3469, 2019.

[7] Xiaojin Zhang, Yan Kang, Kai Chen, Lixin Fan, and Qiang Yang. Trading off privacy, utility,

and efficiency in federated learning. ACM Transactions on Intelligent Systems and Technology, 14:1 – 32, 2022.

[8] Noam Shazeer, Azalia Mirhoseini, Krzysztof Maziarz, Andy Davis, Quoc Le, Geoffrey Hinton,

and Jeff Dean. Outrageously large neural networks: The sparsely-gated mixture-of-experts layer. arXiv preprint arXiv:1701.06538, 2017.

[9] Niklas Muennighoff, Luca Soldaini, Dirk Groeneveld, Kyle Lo, Jacob Morrison, Sewon Min,

Weijia Shi, Pete Walsh, Oyvind Tafjord, Nathan Lambert, et al. Olmoe: Open mixture-of- experts language models. arXiv preprint arXiv:2409.02060, 2024.

[10] Prateek Yadav, Colin Raffel, Mohammed Muqeeth, Lucas Caccia, Haokun Liu, Tianlong Chen,

Mohit Bansal, Leshem Choshen, and Alessandro Sordoni. A survey on model moerging: Recycling and routing among specialized experts for collaborative learning. CoRR, 2024.

[11] Margaret Li, Suchin Gururangan, Tim Dettmers, Mike Lewis, Tim Althoff, Noah A. Smith, and

Luke Zettlemoyer. Branch-train-merge: Embarrassingly parallel training of expert language models, 2022.

[12] Mitchell Wortsman, Gabriel Ilharco, Samir Ya Gadre, Rebecca Roelofs, Raphael Gontijo-

Lopes, Ari S Morcos, Hongseok Namkoong, Ali Farhadi, Yair Carmon, Simon Kornblith, et al. Model soups: averaging weights of multiple fine-tuned models improves accuracy without increasing inference time. In International conference on machine learning, pages 23965–23998. PMLR, 2022.

[13] Niklas Muennighoff, Hongjin Su, Liang Wang, Nan Yang, Furu Wei, Tao Yu, Amanpreet

Singh, and Douwe Kiela. Generative representational instruction tuning, 2024.

12

<!-- page 13 of 26 -->

[14] BIS Innovation Hub Nordic Centre. Project aurora: the power of data, technology and

collaboration to combat money laundering across institutions and borders. Technical report. Occasional publication No. 66.

[15] Chen Zhang, Yu Xie, Hang Bai, Bin Yu, Weihong Li, and Yuan Gao. A survey on federated

learning. Knowledge-Based Systems, 216:106775, 2021.

[16] Patrik Hummel, Matthias Braun, Max Tretter, and Peter Dabrock. Data sovereignty: A review.

Big Data & Society, 8(1):2053951720982012, 2021.

[17] Martin Grund, Stefania Leone, Herman van Hövell, Sven Wagner-Boysen, Sebastian Hillig,

Hyukjin Kwon, David Lewis, Jakob Mund, Polo-Francois Poli, Lionel Montrieux, et al. Databricks lakeguard: Supporting fine-grained access control and multi-user capabilities for apache spark workloads. In Companion of the 2025 International Conference on Management of Data, pages 418–430, 2025.

[18] Albert Ziegler, Eirini Kalliamvakou, X Alice Li, Andrew Rice, Devon Rifkin, Shawn Simis-

ter, Ganesh Sittampalam, and Edward Aftandilian. Productivity assessment of neural code completion. In Proceedings of the 6th ACM SIGPLAN International Symposium on Machine Programming, pages 21–29, 2022.

[19] Peter Henderson, Xuechen Li, Dan Jurafsky, Tatsunori Hashimoto, Mark A Lemley, and Percy

Liang. Foundation models and fair use. Journal of Machine Learning Research, 24(400):1–79, 2023.

[20] Shayne Longpre, Robert Mahari, Ariel Lee, Campbell Lund, Hamidah Oderinwale, William

Brannon, Nayan Saxena, Naana Obeng-Marnu, Tobin South, Cole Hunter, et al. Consent in crisis: The rapid decline of the ai data commons. Advances in Neural Information Processing Systems, 37:108042–108087, 2024.

[21] Ziv Epstein, Aaron Hertzmann, Investigators of Human Creativity, Memo Akten, Hany Farid,

Jessica Fjeld, Morgan R Frank, Matthew Groh, Laura Herman, Neil Leach, et al. Art and the science of generative ai. Science, 380(6650):1110–1111, 2023.

[22] Rishi Bommasani, Kevin Klyman, Shayne Longpre, Sayash Kapoor, Nestor Maslej, Betty

Xiong, Daniel Zhang, and Percy Liang. The foundation model transparency index. arXiv preprint arXiv:2310.12941, 2023.

[23] Peter Henderson, Xuechen Li, Dan Jurafsky, Tatsunori Hashimoto, Mark A Lemley, and Percy

Liang. Foundation models and copyright questions, 2023.

[24] Shayne Longpre, Robert Mahari, Anthony Chen, Naana Obeng-Marnu, Damien Sileo, William

Brannon, Niklas Muennighoff, Nathan Khazam, Jad Kabbara, Kartik Perisetla, Xinyi Wu, Enrico Shippole, Kurt D. Bollacker, Tongshuang Wu, Luis Villa, Sandy Pentland, and Sara Hooker. A large-scale audit of dataset licensing and attribution in ai. Nat. Mac. Intell., 6(8):975–987, 2024.

[25] Rishi Bommasani, Drew A Hudson, Ehsan Adeli, Russ Altman, Simran Arora, Sydney von

Arx, Michael S Bernstein, Jeannette Bohg, Antoine Bosselut, Emma Brunskill, et al. On the opportunities and risks of foundation models. arXiv preprint arXiv:2108.07258, 2021.

[26] Shayne Longpre, Robert Mahari, Anthony Chen, Naana Obeng-Marnu, Damien Sileo, William

Brannon, Niklas Muennighoff, Nathan Khazam, Jad Kabbara, Kartik Perisetla, et al. The data provenance initiative: A large scale audit of dataset licensing & attribution in ai. arXiv preprint arXiv:2310.16787, 2023.

[27] Abeba Birhane, Sanghyun Han, Vishnu Boddeti, Sasha Luccioni, et al. Into the laion’s den:

Investigating hate in multimodal datasets. Advances in neural information processing systems, 36:21268–21284, 2023.

[28] Jesse Dodge, Maarten Sap, Ana Marasovi´c, William Agnew, Gabriel Ilharco, Dirk Groeneveld,

Margaret Mitchell, and Matt Gardner. Documenting large webtext corpora: A case study on the colossal clean crawled corpus. In Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing, pages 1286–1305, 2021.

13

<!-- page 14 of 26 -->

[29] Weijia Shi, Anirudh Ajith, Mengzhou Xia, Yangsibo Huang, Daogao Liu, Terra Blevins, Danqi

Chen, and Luke Zettlemoyer. Detecting pretraining data from large language models. In The Twelfth International Conference on Learning Representations.

[30] Peter Kairouz, H Brendan McMahan, Brendan Avent, Aurélien Bellet, Mehdi Bennis, Ar-

jun Nitin Bhagoji, Kallista Bonawitz, Zachary Charles, Graham Cormode, Rachel Cummings, et al. Advances and open problems in federated learning. Foundations and trends® in machine learning, 14(1–2):1–210, 2021.

[31] Tian Li, Anit Kumar Sahu, Manzil Zaheer, Maziar Sanjabi, Ameet Talwalkar, and Virginia

Smith. Federated optimization in heterogeneous networks. Proceedings of Machine learning and systems, 2:429–450, 2020.

[32] Xinghao Wu, Xuefeng Liu, Jianwei Niu, Haolin Wang, Shaojie Tang, and Guogang Zhu.

Fedlora: When personalized federated learning meets low-rank adaptation. 2024.

[33] Haodong Zhao, Wei Du, Fangqi Li, Peixuan Li, and Gongshen Liu. Fedprompt: Communication-efficient and privacy-preserving prompt tuning in federated learning. In ICASSP 2023-2023 IEEE International Conference on Acoustics, Speech and Signal Process- ing (ICASSP), pages 1–5. IEEE, 2023.

[34] Kevin Kuo, Arian Raje, Kousik Rajesh, and Virginia Smith. Federated lora with sparse

communication. arXiv preprint arXiv:2406.05233, 2024.

[35] Pascal Paillier. Public-key cryptosystems based on composite degree residuosity classes. In

Proceedings of the 17th International Conference on Theory and Application of Cryptographic Techniques, EUROCRYPT’99, page 223–238, Berlin, Heidelberg, 1999. Springer-Verlag.

[36] Cynthia Dwork, Aaron Roth, et al. The algorithmic foundations of differential privacy. Foundations and Trends® in Theoretical Computer Science, 9(3–4):211–407, 2014.

[37] Hongyi Wang, Kartik Sreenivasan, Shashank Rajput, Harit Vishwakarma, Saurabh Agarwal,

Jy-yong Sohn, Kangwook Lee, and Dimitris Papailiopoulos. Attack of the tails: Yes, you really can backdoor federated learning. In H. Larochelle, M. Ranzato, R. Hadsell, M.F. Balcan, and H. Lin, editors, Advances in Neural Information Processing Systems, volume 33, pages 16070–16084. Curran Associates, Inc., 2020.

[38] Erfan Darzi, Florian Dubost, Nanna M Sijtsema, and Peter MA van Ooijen. Exploring

adversarial attacks in federated learning for medical imaging. IEEE Transactions on Industrial Informatics, 2024.

[39] John Nguyen, Kshitiz Malik, Hongyuan Zhan, Ashkan Yousefpour, Mike Rabbat, Mani

Malek, and Dzmitry Huba. Federated learning with buffered asynchronous aggregation. In International conference on artificial intelligence and statistics, pages 3581–3607. PMLR, 2022.

[40] Colin Raffel. Building machine learning models like open source software. Communications

of the ACM, 66(2):38–40, 2023.

[41] Shangbin Feng, Zifeng Wang, Palash Goyal, Yike Wang, Weijia Shi, Huang Xia, Hamid

Palangi, Luke Zettlemoyer, Yulia Tsvetkov, Chen-Yu Lee, and Tomas Pfister. Heterogeneous swarms: Jointly optimizing model roles and weights for multi-llm systems, 2025.

[42] Alexandra Chronopoulou, Matthew E Peters, Alexander Fraser, and Jesse Dodge. Adaptersoup:

Weight averaging to improve generalization of pretrained language models. arXiv preprint arXiv:2302.07027, 2023.

[43] Jyothish Pari, Samy Jelassi, and Pulkit Agrawal. Collective model intelligence requires

compatible specialization. ArXiv, abs/2411.02207, 2024.

[44] Shangbin Feng, Zifeng Wang, Yike Wang, Sayna Ebrahimi, Hamid Palangi, Lesly Miculicich,

Achin Kulshrestha, Nathalie Rauschmayr, Yejin Choi, Yulia Tsvetkov, et al. Model swarms: Collaborative search to adapt llm experts via swarm intelligence. arXiv e-prints, pages arXiv–2410, 2024.

14

<!-- page 15 of 26 -->

[45] Prateek Yadav, Derek Tam, Leshem Choshen, Colin A Raffel, and Mohit Bansal. Ties-

merging: Resolving interference when merging models. In A. Oh, T. Naumann, A. Globerson, K. Saenko, M. Hardt, and S. Levine, editors, Advances in Neural Information Processing Systems, volume 36, pages 7093–7115. Curran Associates, Inc., 2023.

[46] Michael S Matena and Colin A Raffel. Merging models with fisher-weighted averaging. In

S. Koyejo, S. Mohamed, A. Agarwal, D. Belgrave, K. Cho, and A. Oh, editors, Advances in Neural Information Processing Systems, volume 35, pages 17703–17716. Curran Associates, Inc., 2022.

[47] Gabriel Ilharco, Marco Tulio Ribeiro, Mitchell Wortsman, Ludwig Schmidt, Hannaneh Ha-

jishirzi, and Ali Farhadi. Editing models with task arithmetic. In The Eleventh International Conference on Learning Representations, 2023.

[48] Takuya Akiba, Makoto Shing, Yujin Tang, Qi Sun, and David Ha. Evolutionary optimization

of model merging recipes. arXiv preprint arXiv:2403.13187, 2024.

[49] Enneng Yang, Zhenyi Wang, Li Shen, Shiwei Liu, Guibing Guo, Xingwei Wang, and Dacheng

Tao. Adamerging: Adaptive model merging for multi-task learning. In The Twelfth Interna- tional Conference on Learning Representations, 2024.

[50] Jacob Morrison, Noah A. Smith, Hannaneh Hajishirzi, Pang Wei Koh, Jesse Dodge, and

Pradeep Dasigi. Merge to learn: Efficiently adding skills to language models with model merging, 2024.

[51] Shangbin Feng, Wenxuan Ding, Alisa Liu, Zifeng Wang, Weijia Shi, Yike Wang, Zejiang Shen,

Xiaochuang Han, Hunter Lang, Chen-Yu Lee, Tomas Pfister, Yejin Choi, and Yulia Tsvetkov. When one llm drools, multi-llm collaboration rules, 2025.

[52] Margaret Li, Suchin Gururangan, Tim Dettmers, Mike Lewis, Tim Althoff, Noah A Smith, and

Luke Zettlemoyer. Branch-train-merge: Embarrassingly parallel training of expert language models. arXiv preprint arXiv:2208.03306, 2022.

[53] Suchin Gururangan, Margaret Li, Mike Lewis, Weijia Shi, Tim Althoff, Noah A Smith, and

Luke Zettlemoyer. Scaling expert language models with unsupervised domain discovery. arXiv preprint arXiv:2303.14177, 2023.

[54] Suchin Gururangan, Mike Lewis, Ari Holtzman, Noah A Smith, and Luke Zettlemoyer. Demix

layers: Disentangling domains for modular language modeling. In Proceedings of the 2022 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, pages 5557–5576, 2022.

[55] Sainbayar Sukhbaatar, Olga Golovneva, Vasu Sharma, Hu Xu, Xi Victoria Lin, Baptiste

Rozière, Jacob Kahn, Daniel Li, Wen-tau Yih, Jason Weston, et al. Branch-train-mix: Mixing expert llms into a mixture-of-experts llm. arXiv preprint arXiv:2403.07816, 2024.

[56] Peter Schafhalter, Shun Liao, Yanqi Zhou, Chih-Kuan Yeh, Arun Kandoor, and James Laudon.

Scalable multi-domain adaptation of language models using modular experts. arXiv preprint arXiv:2410.10181, 2024.

[57] Qizhen Zhang, Prajjwal Bhargava, Chloe Bi, Chris X Cai, Jakob Foerster, Jeremy Fu,

Punit Singh Koura, Ruan Silva, Sheng Shen, Emily Dinan, et al. Bts: Harmonizing spe- cialized experts into a generalist llm. arXiv preprint arXiv:2502.00075, 2025.

[58] Qizhen Zhang, Nikolas Gritsch, Dwaraknath Gnaneshwar, Simon Guo, David Cairuz, Bharat

Venkitesh, Jakob Foerster, Phil Blunsom, Sebastian Ruder, A. Ustun, and Acyr F. Locatelli. Bam! just like that: Simple and efficient parameter upcycling for mixture of experts. ArXiv, abs/2408.08274, 2024.

[59] Yikang Shen, Zheyu Zhang, Tianyou Cao, Shawn Tan, Zhenfang Chen, and Chuang Gan. Mod-

uleformer: Modularity emerges from mixture-of-experts. arXiv preprint arXiv:2306.04640, 2023.

15

<!-- page 16 of 26 -->

[60] Ted Zadouri, Ahmet Üstün, Arash Ahmadian, Beyza Ermi¸s, Acyr Locatelli, and Sara Hooker.

Pushing mixture of experts to the limit: Extremely parameter efficient moe for instruction tuning. arXiv preprint arXiv:2309.05444, 2023.

[61] Yun Zhu, Nevan Wichers, Chu-Cheng Lin, Xinyi Wang, Tianlong Chen, Lei Shu, Han Lu,

Canoee Liu, Liangchen Luo, Jindong Chen, and Lei Meng. Sira: Sparse mixture of low rank adaptation, 2023.

[62] Shihan Dou, Enyu Zhou, Yan Liu, Songyang Gao, Wei Shen, Limao Xiong, Yuhao Zhou,

Xiao Wang, Zhiheng Xi, Xiaoran Fan, Shiliang Pu, Jiang Zhu, Rui Zheng, Tao Gui, Qi Zhang, and Xuanjing Huang. LoRAMoE: Alleviating world knowledge forgetting in large language models via MoE-style plugin. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar, editors, Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1932–1945, Bangkok, Thailand, August 2024. Association

for Computational Linguistics.

[63] Jonas Pfeiffer, Aishwarya Kamath, Andreas Rücklé, Kyunghyun Cho, and Iryna Gurevych.

Adapterfusion: Non-destructive task composition for transfer learning. arXiv preprint arXiv:2005.00247, 2020.

[64] William Fleshman, Aleem Khan, Marc Marone, and Benjamin Van Durme. Adapterswap:

Continuous training of llms with data removal and access-control guarantees. CoRR, 2024.

[65] Kevin Kuo, Amrith Setlur, Kartik Srinivas, Aditi Raghunathan, and Virginia Smith. Exact

unlearning of finetuning data via model merging at scale. arXiv preprint arXiv:2504.04626, 2025.

[66] Damai Dai, Chengqi Deng, Chenggang Zhao, RX Xu, Huazuo Gao, Deli Chen, Jiashi Li,

Wangding Zeng, Xingkai Yu, Yu Wu, et al. Deepseekmoe: Towards ultimate expert specializa- tion in mixture-of-experts language models. arXiv preprint arXiv:2401.06066, 2024.

[67] Niklas Muennighoff, Hongjin SU, Liang Wang, Nan Yang, Furu Wei, Tao Yu, Amanpreet

Singh, and Douwe Kiela. Generative representational instruction tuning. In The Thirteenth International Conference on Learning Representations, 2025.

[68] Nikolas Gritsch, Qizhen Zhang, Acyr Locatelli, Sara Hooker, and Ahmet Üstün. Nexus:

Specialization meets adaptability for efficiently training mixture of experts. arXiv preprint arXiv:2408.15901, 2024.

[69] Ziyu Zhao, Leilei Gan, Guoyin Wang, Wangchunshu Zhou, Hongxia Yang, Kun Kuang, and

Fei Wu. Loraretriever: Input-aware lora retrieval and composition for mixed tasks in the wild. arXiv preprint arXiv:2402.09997, 2024.

[70] Joel Jang, Seungone Kim, Seonghyeon Ye, Doyoung Kim, Lajanugen Logeswaran, Moontae

Lee, Kyungjae Lee, and Minjoon Seo. Exploring the benefits of training expert language models over instruction tuning. In International Conference on Machine Learning, pages 14702–14729. PMLR, 2023.

[71] Feng Cheng, Ziyang Wang, Yi-Lin Sung, Yan-Bo Lin, Mohit Bansal, and Gedas Bertasius.

Dam: Dynamic adapter merging for continual video qa learning. In 2025 IEEE/CVF Winter Conference on Applications of Computer Vision (WACV), pages 6805–6817. IEEE, 2025.

[72] Hyunji Lee, Luca Soldaini, Arman Cohan, Minjoon Seo, and Kyle Lo. Routerretriever:

Routing over a mixture of expert embedding models. arXiv preprint arXiv:2409.02685, 2024.

[73] Joshua Belofsky. Token-level adaptation of lora adapters for downstream task generalization.

In Proceedings of the 2023 6th Artificial Intelligence and Cloud Computing Conference, pages 168–172, 2023.

[74] Jeffrey Li, Alex Fang, Georgios Smyrnis, Maor Ivgi, Matt Jordan, Samir Gadre, Hritik

Bansal, Etash Guha, Sedrick Keh, Kushal Arora, Saurabh Garg, Rui Xin, Niklas Muennighoff, Reinhard Heckel, Jean Mercat, Mayee Chen, Suchin Gururangan, Mitchell Wortsman, Alon Albalak, Yonatan Bitton, Marianna Nezhurina, Amro Abbas, Cheng-Yu Hsieh, Dhruba Ghosh,

16

<!-- page 17 of 26 -->

Josh Gardner, Maciej Kilian, Hanlin Zhang, Rulin Shao, Sarah Pratt, Sunny Sanyal, Gabriel Ilharco, Giannis Daras, Kalyani Marathe, Aaron Gokaslan, Jieyu Zhang, Khyathi Chandu, Thao Nguyen, Igor Vasiljevic, Sham Kakade, Shuran Song, Sujay Sanghavi, Fartash Faghri, Sewoong Oh, Luke Zettlemoyer, Kyle Lo, Alaaeldin El-Nouby, Hadi Pouransari, Alexander Toshev, Stephanie Wang, Dirk Groeneveld, Luca Soldaini, Pang Wei Koh, Jenia Jitsev, Thomas Kollar, Alexandros G. Dimakis, Yair Carmon, Achal Dave, Ludwig Schmidt, and Vaishaal Shankar. Datacomp-lm: In search of the next generation of training sets for language models, 2025.

[75] Alexander Wettig, Kyle Lo, Sewon Min, Hannaneh Hajishirzi, Danqi Chen, and Luca Soldaini.

Organize the web: Constructing domains enhances pre-training data curation, 2025.

[76] Raymond Li, Loubna Ben Allal, Yangtian Zi, Niklas Muennighoff, Denis Kocetkov, Chenghao

Mou, Marc Marone, Christopher Akiki, Jia Li, Jenny Chim, Qian Liu, Evgenii Zheltonozhskii, Terry Yue Zhuo, Thomas Wang, Olivier Dehaene, Mishig Davaadorj, Joel Lamy-Poirier, João Monteiro, Oleh Shliazhko, Nicolas Gontier, Nicholas Meade, Armel Zebaze, Ming-Ho Yee, Logesh Kumar Umapathi, Jian Zhu, Benjamin Lipkin, Muhtasham Oblokulov, Zhiruo Wang, Rudra Murthy, Jason Stillerman, Siva Sankalp Patel, Dmitry Abulkhanov, Marco Zocca, Manan Dey, Zhihan Zhang, Nour Fahmy, Urvashi Bhattacharyya, Wenhao Yu, Swayam Singh, Sasha Luccioni, Paulo Villegas, Maxim Kunakov, Fedor Zhdanov, Manuel Romero, Tony Lee, Nadav Timor, Jennifer Ding, Claire Schlesinger, Hailey Schoelkopf, Jan Ebert, Tri Dao, Mayank Mishra, Alex Gu, Jennifer Robinson, Carolyn Jane Anderson, Brendan Dolan-Gavitt, Danish Contractor, Siva Reddy, Daniel Fried, Dzmitry Bahdanau, Yacine Jernite, Carlos Muñoz Ferrandis, Sean Hughes, Thomas Wolf, Arjun Guha, Leandro von Werra, and Harm de Vries. Starcoder: may the source be with you!, 2023.

[77] Denis Kocetkov, Raymond Li, Loubna Ben Allal, Jia Li, Chenghao Mou, Carlos Muñoz

Ferrandis, Yacine Jernite, Margaret Mitchell, Sean Hughes, Thomas Wolf, Dzmitry Bahdanau, Leandro von Werra, and Harm de Vries. The stack: 3 tb of permissively licensed source code, 2022.

[78] Team OLMo, Pete Walsh, Luca Soldaini, Dirk Groeneveld, Kyle Lo, Shane Arora, Akshita

Bhagia, Yuling Gu, Shengyi Huang, Matt Jordan, Nathan Lambert, Dustin Schwenk, Oyvind Tafjord, Taira Anderson, David Atkinson, Faeze Brahman, Christopher Clark, Pradeep Dasigi, Nouha Dziri, Michal Guerquin, Hamish Ivison, Pang Wei Koh, Jiacheng Liu, Saumya Malik, William Merrill, Lester James V. Miranda, Jacob Morrison, Tyler Murray, Crystal Nam, Valentina Pyatkin, Aman Rangapur, Michael Schmitz, Sam Skjonsberg, David Wadden, Christopher Wilhelm, Michael Wilson, Luke Zettlemoyer, Ali Farhadi, Noah A. Smith, and Hannaneh Hajishirzi. 2 olmo 2 furious, 2025.

[79] Jake Poznanski, Jon Borchardt, Jason Dunkelberger, Regan Huff, Daniel Lin, Aman Rangapur,

Christopher Wilhelm, Kyle Lo, and Luca Soldaini. olmocr: Unlocking trillions of tokens in pdfs with vision language models, 2025.

[80] Luca Soldaini and Kyle Lo. peS2o (Pretraining Efficiently on S2ORC) Dataset. Technical re-

port, Allen Institute for AI, 2023. ODC-By, https://github.com/allenai/pes2o.

[81] Kyle Lo, Lucy Lu Wang, Mark Neumann, Rodney Kinney, and Daniel Weld. S2ORC: The

semantic scholar open research corpus. In Dan Jurafsky, Joyce Chai, Natalie Schluter, and Joel Tetreault, editors, Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics, pages 4969–4983, Online, July 2020. Association for Computational Linguistics.

[82] Loubna Ben Allal, Anton Lozhkov, Elie Bakouch, Gabriel Martín Blázquez, Guilherme

Penedo, Lewis Tunstall, Andrés Marafioti, Hynek Kydlíˇcek, Agustín Piqueres Lajarín, Vaibhav Srivastav, Joshua Lochner, Caleb Fahlgren, Xuan-Son Nguyen, Clémentine Fourrier, Ben Burtenshaw, Hugo Larcher, Haojun Zhao, Cyril Zakka, Mathieu Morlon, Colin Raffel, Leandro von Werra, and Thomas Wolf. Smollm2: When smol goes big – data-centric training of a small language model, 2025.

[83] Luca Soldaini, Rodney Kinney, Akshita Bhagia, Dustin Schwenk, David Atkinson, Russell

Authur, Ben Bogin, Khyathi Chandu, Jennifer Dumas, Yanai Elazar, Valentin Hofmann, Ananya Harsh Jha, Sachin Kumar, Li Lucy, Xinxi Lyu, Nathan Lambert, Ian Magnusson, Jacob

17

<!-- page 18 of 26 -->

Morrison, Niklas Muennighoff, Aakanksha Naik, Crystal Nam, Matthew E. Peters, Abhilasha Ravichander, Kyle Richardson, Zejiang Shen, Emma Strubell, Nishant Subramani, Oyvind Tafjord, Pete Walsh, Luke Zettlemoyer, Noah A. Smith, Hannaneh Hajishirzi, Iz Beltagy, Dirk Groeneveld, Jesse Dodge, and Kyle Lo. Dolma: an open corpus of three trillion tokens for language model pretraining research, 2024.

[84] Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick,

and Oyvind Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. arXiv:1803.05457v1, 2018.

[85] Christopher Clark, Kenton Lee, Ming-Wei Chang, Tom Kwiatkowski, Michael Collins, and

Kristina Toutanova. Boolq: Exploring the surprising difficulty of natural yes/no questions, 2019.

[86] Amrita Saha, Vardaan Pahuja, Mitesh M. Khapra, Karthik Sankaranarayanan, and Sarath

Chandar. Complex sequential question answering: Towards learning to converse over linked question answer pairs with a knowledge graph, 2018.

[87] Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. Hellaswag: Can a

machine really finish your sentence?, 2019.

[88] Todor Mihaylov, Peter Clark, Tushar Khot, and Ashish Sabharwal. Can a suit of armor conduct

electricity? a new dataset for open book question answering. In EMNLP, 2018.

[89] Yonatan Bisk, Rowan Zellers, Ronan Le Bras, Jianfeng Gao, and Yejin Choi. Piqa: Reasoning

about physical commonsense in natural language, 2019.

[90] Maarten Sap, Hannah Rashkin, Derek Chen, Ronan LeBras, and Yejin Choi. Socialiqa:

Commonsense reasoning about social interactions, 2019.

[91] Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. Winogrande: An

adversarial winograd schema challenge at scale. arXiv preprint arXiv:1907.10641, 2019.

[92] Siva Reddy, Danqi Chen, and Christopher D. Manning. Coqa: A conversational question

answering challenge, 2019.

[93] Pranav Rajpurkar, Jian Zhang, Konstantin Lopyrev, and Percy Liang. Squad: 100,000+

questions for machine comprehension of text, 2016.

[94] Tom Kwiatkowski, Jennimaria Palomaki, Olivia Redfield, Michael Collins, Ankur Parikh,

Chris Alberti, Danielle Epstein, Illia Polosukhin, Jacob Devlin, Kenton Lee, Kristina Toutanova, Llion Jones, Matthew Kelcey, Ming-Wei Chang, Andrew M. Dai, Jakob Uszkoreit, Quoc Le, and Slav Petrov. Natural questions: A benchmark for question answering research. Transactions of the Association for Computational Linguistics, 7:452–466, 2019.

[95] Mandar Joshi, Eunsol Choi, Daniel S. Weld, and Luke Zettlemoyer. Triviaqa: A large scale

distantly supervised challenge dataset for reading comprehension, 2017.

[96] Dheeru Dua, Yizhong Wang, Pradeep Dasigi, Gabriel Stanovsky, Sameer Singh, and Matt

Gardner. Drop: A reading comprehension benchmark requiring discrete reasoning over paragraphs, 2019.

[97] Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and

Jacob Steinhardt. Measuring massive multitask language understanding. Proceedings of the International Conference on Learning Representations (ICLR), 2021.

[98] Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo,

Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, Tianle Li, Max Ku, Kai Wang, Alex Zhuang, Rongqi Fan, Xiang Yue, and Wenhu Chen. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark, 2024.

[99] Wanjun Zhong, Ruixiang Cui, Yiduo Guo, Yaobo Liang, Shuai Lu, Yanlin Wang, Amin Saied,

Weizhu Chen, and Nan Duan. Agieval: A human-centric benchmark for evaluating foundation models, 2023.

18

<!-- page 19 of 26 -->

[100] Mirac Suzgun, Nathan Scales, Nathanael Schärli, Sebastian Gehrmann, Yi Tay, Hyung Won

Chung, Aakanksha Chowdhery, Quoc V. Le, Ed H. Chi, Denny Zhou, and Jason Wei. Chal- lenging big-bench tasks and whether chain-of-thought can solve them, 2022.

[101] Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser,

Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. Training verifiers to solve math word problems, 2021.

[102] Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn

Song, and Jacob Steinhardt. Measuring mathematical problem solving with the math dataset, 2021.

[103] Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David

Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, and Charles Sutton. Program synthesis with large language models, 2021.

[104] Jiawei Liu, Chunqiu Steven Xia, Yuyao Wang, and LINGMING ZHANG. Is your code

generated by chatGPT really correct? rigorous evaluation of large language models for code generation. In Thirty-seventh Conference on Neural Information Processing Systems, 2023.

[105] Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde de Oliveira Pinto,

Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, Alex Ray, Raul Puri, Gretchen Krueger, Michael Petrov, Heidy Khlaaf, Girish Sastry, Pamela Mishkin, Brooke Chan, Scott Gray, Nick Ryder, Mikhail Pavlov, Alethea Power, Lukasz Kaiser, Mohammad Bavarian, Clemens Winter, Philippe Tillet, Felipe Petroski Such, Dave Cummings, Matthias Plappert, Fotios Chantzis, Elizabeth Barnes, Ariel Herbert-Voss, William Hebgen Guss, Alex Nichol, Alex Paino, Nikolas Tezak, Jie Tang, Igor Babuschkin, Suchir Balaji, Shantanu Jain, William Saunders, Christopher Hesse, Andrew N. Carr, Jan Leike, Josh Achiam, Vedant Misra, Evan Morikawa, Alec Radford, Matthew Knight, Miles Brundage, Mira Murati, Katie Mayer, Peter Welinder, Bob McGrew, Dario Amodei, Sam McCandlish, Ilya Sutskever, and Wojciech Zaremba. Evaluating large language models trained on code, 2021.

[106] David Wadden, Kejian Shi, Jacob Morrison, Aakanksha Naik, Shruti Singh, Nitzan Barzi-

lay, Kyle Lo, Tom Hope, Luca Soldaini, Shannon Zejiang Shen, Doug Downey, Hannaneh Hajishirzi, and Arman Cohan. Sciriff: A resource to enhance language model instruction- following over scientific literature, 2024.

[107] Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle,

Aiesha Letman, Akhil Mathur, Alan Schelten, Amy Yang, Angela Fan, Anirudh Goyal, Anthony S. Hartshorn, Aobo Yang, Archi Mitra, Archie Sravankumar, Artem Korenev, Arthur Hinsvark, Arun Rao, Aston Zhang, Aur’elien Rodriguez, Austen Gregerson, Ava Spataru, Bap tiste Rozière, Bethany Biron, Binh Tang, Bobbie Chern, Charlotte Caucheteux, Chaya Nayak, Chloe Bi, Chris Marra, Chris McConnell, Christian Keller, Christophe Touret, Chunyang Wu, Corinne Wong, Cris tian Cantón Ferrer, Cyrus Nikolaidis, Damien Allonsius, Daniel Song, Danielle Pintz, Danny Livshits, David Esiobu, Dhruv Choudhary, Dhruv Mahajan, Diego Garcia-Olano, Diego Perino, Dieuwke Hupkes, Egor Lakomkin, Ehab A. AlBadawy, Elina Lobanova, Emily Dinan, Eric Michael Smith, Filip Radenovic, Frank Zhang, Gabriele Synnaeve, Gabrielle Lee, Georgia Lewis Anderson, Graeme Nail, Grégoire Mialon, Guanglong Pang, Guillem Cucurell, Hailey Nguyen, Hannah Korevaar, Hu Xu, Hugo Touvron, Iliyan Zarov, Imanol Arrieta Ibarra, Isabel M. Kloumann, Ishan Misra, Ivan Evtimov, Jade Copet, Jaewon Lee, Jan Geffert, Jana Vranes, Jason Park, Jay Mahadeokar, Jeet Shah, Jelmer van der Linde, Jennifer Billock, Jenny Hong, Jenya Lee, Jeremy Fu, Jianfeng Chi, Jianyu Huang, Jiawen Liu, Jie Wang, Jiecao Yu, Joanna Bitton, Joe Spisak, Jongsoo Park, Joseph Rocca, Joshua Johnstun, Joshua Saxe, Ju-Qing Jia, Kalyan Vasuden Alwala, K. Upasani, Kate Plawiak, Keqian Li, Ken-591 neth Heafield, Kevin R. Stone, Khalid El-Arini, Krithika Iyer, Kshitiz Malik, Kuen ley Chiu, Kunal Bhalla, Lauren Rantala-Yeary, Laurens van der Maaten, Lawrence Chen, Liang Tan, Liz Jenkins, Louis Martin, Lovish Madaan, Lubo Malo, Lukas Blecher, Lukas Landzaat, Luke de Oliveira, Madeline Muzzi, Mahesh Pasupuleti, Mannat Singh, Manohar Paluri, Marcin Kardas, Mathew Oldham, Mathieu Rita, Maya Pavlova, Melissa Hall Melanie Kambadur, Mike Lewis, (...), Yu Wang, Yuchen Hao, Yundi Qian, Yuzi He, Zach Rait, Zachary DeVito, Zef Rosnbrick, Zhaoduo Wen, Zhenyu Yang, and Zhiwei Zhao. The llama 3 herd of models. ArXiv, abs/2407.21783, 2024.

19

<!-- page 20 of 26 -->

[108] Nicholas Carlini, Florian Tramer, Eric Wallace, Matthew Jagielski, Ariel Herbert-Voss, Kather-

ine Lee, Adam Roberts, Tom Brown, Dawn Song, Ulfar Erlingsson, et al. Extracting training data from large language models. In 30th USENIX security symposium (USENIX Security 21), pages 2633–2650, 2021.

[109] Nicolas Carlini, Jamie Hayes, Milad Nasr, Matthew Jagielski, Vikash Sehwag, Florian Tramer,

Borja Balle, Daphne Ippolito, and Eric Wallace. Extracting training data from diffusion models. In 32nd USENIX Security Symposium (USENIX Security 23), pages 5253–5270, 2023.

[110] A Feder Cooper, Aaron Gokaslan, Amy B Cyphert, Christopher De Sa, Mark A Lemley,

Daniel E Ho, and Percy Liang. Extracting memorized pieces of (copyrighted) books from open-weight language models. arXiv preprint arXiv:2505.12546, 2025.

[111] Ken Liu, Christopher A. Choquette-Choo, Matthew Jagielski, Peter Kairouz, Sanmi Koyejo,

Percy Liang, and Nicolas Papernot. Language models may verbatim complete text they were not explicitly trained on. In Forty-second International Conference on Machine Learning, 2025.

[112] Luke Merrick, Danmei Xu, Gaurav Nuti, and Daniel Campos. Arctic-embed: Scalable,

efficient, and accurate text embedding models. arXiv preprint arXiv:2405.05374, 2024.

[113] Jason Baumgartner, Savvas Zannettou, Brian Keegan, Megan Squire, and Jeremy Blackburn.

The pushshift reddit dataset. In Proceedings of the international AAAI conference on web and social media, volume 14, pages 830–839, 2020.

[114] Dirk Groeneveld, Iz Beltagy, Evan Walsh, Akshita Bhagia, Rodney Kinney, Oyvind Tafjord,

Ananya Jha, Hamish Ivison, Ian Magnusson, Yizhong Wang, Shane Arora, David Atkin- son, Russell Authur, Khyathi Chandu, Arman Cohan, Jennifer Dumas, Yanai Elazar, Yul- ing Gu, Jack Hessel, Tushar Khot, William Merrill, Jacob Morrison, Niklas Muennighoff, Aakanksha Naik, Crystal Nam, Matthew Peters, Valentina Pyatkin, Abhilasha Ravichander, Dustin Schwenk, Saurabh Shah, William Smith, Emma Strubell, Nishant Subramani, Mitchell Wortsman, Pradeep Dasigi, Nathan Lambert, Kyle Richardson, Luke Zettlemoyer, Jesse Dodge, Kyle Lo, Luca Soldaini, Noah Smith, and Hannaneh Hajishirzi. OLMo: Accelerating the science of language models. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar, editors, Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 15789–15809, Bangkok, Thailand, August 2024. Association

for Computational Linguistics.

[115] Cody Blakeney, Mansheej Paul, Brett W. Larsen, Sean Owen, and Jonathan Frankle. Does

your data spark joy? performance gains from domain upsampling at the end of training, 2024.

[116] Tomáš Koˇciský, Jonathan Schwarz, Phil Blunsom, Chris Dyer, Karl Moritz Hermann, Gábor

Melis, and Edward Grefenstette. The narrativeqa reading comprehension challenge, 2017.

[117] Yuling Gu, Oyvind Tafjord, Bailey Kuehl, Dany Haddad, Jesse Dodge, and Hannaneh Ha-

jishirzi. Olmes: A standard for language model evaluations, 2025.

[118] Aitor Lewkowycz, Anders Andreassen, David Dohan, Ethan Dyer, Henryk Michalewski,

Vinay Ramasesh, Ambrose Slone, Cem Anil, Imanol Schlag, Theo Gutman-Solo, Yuhuai Wu, Behnam Neyshabur, Guy Gur-Ari, and Vedant Misra. Solving quantitative reasoning problems with language models, 2022.

[119] Weijia Shi, Jaechan Lee, Yangsibo Huang, Sadhika Malladi, Jieyu Zhao, Ari Holtzman, Daogao

Liu, Luke Zettlemoyer, Noah A. Smith, and Chiyuan Zhang. Muse: Machine unlearning six-way evaluation for language models, 2024.

20

<!-- page 21 of 26 -->

## Appendix

## A Model Details · 模型细节

### A.1 Baseline Details · 基线细节

**Prompt-based routing** We implemented a domain-specific classifier where each input query is categorized into exactly one of n domains using the prompts shown below. Once classified, the query is routed exclusively to the corresponding expert model for processing. In particular, the following prompt was used for our primary experimental setup:

**基于提示的路由** 我们实现了一个领域分类器, 用下面的提示把每个输入查询归入 n 个领域中的恰好一个. 分类后, 查询只交给对应的专家模型处理. 主实验设定用的是下面这条提示:

```text
"""Classify the given text into one of the following domains:
- 0: Math
- 1: Code
- 2: General science and educational content
- 3: News
- 4: Creative writing and literature
- 5: Reddit
- 6: Research and academic content
- 7: Other

Provide the number between 0 and 7."""
```

For ablations with four datasets instead of eight, we used the following prompting.

在四个数据集 (而非八个) 的消融里, 我们用下面这条提示.

```text
"""Classify the given text into one of the following domains:
- 0: Math
- 1: Code
- 2: General science and academic content
- 3: Other

Provide the number between 0 and 3."""
```

**Branch–Train–Merge (BTM)** BTM [11] first assigns a weight to each expert and then combines their predictions through ensembling.

**Branch–Train–Merge (BTM)** BTM [11] 先给每个专家分配一个权重, 再通过集成组合它们的预测.

Formally, for a test instance $x$ and the expert $i$ we compute the negative-log-likelihood loss $\mathcal{L}_i(x)$ and convert it to a weight with a temperature-controlled softmax:

$$w_i(x) = \frac{\exp\left(-\mathcal{L}_i(x)/\tau\right)}{\sum_{j=1}^M \exp\left(-\mathcal{L}_j(x)/\tau\right)},$$

where $\tau > 0$ sharpens ($\tau < 1$) or flattens ($\tau > 1$) the distribution over the $M$ experts. We optionally retain only the $k$ largest-weight experts $S_k(x)$ ($k < M$) and renormalize:

$$\tilde{w}_i(x) = \frac{w_i(x)\,\mathbb{1}[\,i \in S_k(x)\,]}{\sum_{j \in S_k(x)} w_j(x)}.$$

形式上, 对测试样例 $x$ 和专家 $i$, 计算负对数似然损失 $\mathcal{L}_i(x)$, 再用带温度的 softmax 转成权重, 见第一个式子. 其中 $\tau > 0$ 让 $M$ 个专家上的分布变尖 ($\tau < 1$) 或变平 ($\tau > 1$). 可选地只保留权重最大的 $k$ 个专家 $S_k(x)$ ($k < M$) 并重新归一化, 见第二个式子.

At inference time, let $z_{i,t} \in \mathbb{R}^{|V|}$ be the logit vector produced by the expert $i$ at generation step $t$. We combine logits token-by-token:

$$z_t(v) = \sum_{i\in S_k(x)}\tilde{w}_i(x)\,z_{i,t}(v), \quad v \in V.$$

推理时, 设 $z_{i,t} \in \mathbb{R}^{|V|}$ 是专家 $i$ 在生成第 $t$ 步给出的 logit 向量, 按上式逐 token 组合 logit.

### A.2 Training Details · 训练细节

In FlexOlmo, to initialize router embeddings with domain embeddings, we sample 1,000 documents from each data source, process them through GritLM/GritLM-7B [13] to obtain document embeddings, and then average these embeddings.

在 FlexOlmo 中, 为了用域嵌入初始化路由嵌入, 我们从每个数据源采样 1,000 篇文档, 用 GritLM/GritLM-7B [13] 得到文档嵌入, 再取平均.

To obtain proxy data $\hat{D}_i$, we train a binary classifier to distinguish $D_i$ from $D_\text{pub}$ and select public samples with the highest predicted likelihood of belonging to $D_i$. Specifically, we finetune Snowflake/snowflake-arctic-embed-xs [112], which contains 22M parameters, using a learning rate of $3 \times 10^{-6}$. The classifier is trained on a balanced dataset of 500,000 samples (250,000 documents from each source - public and private). The classifier quickly achieved an accuracy above 95% across all datasets considered.

为得到代理数据 $\hat{D}_i$, 我们训练一个区分 $D_i$ 与 $D_\text{pub}$ 的二分类器, 选出被预测为属于 $D_i$ 的可能性最高的公开样本. 具体是以 $3 \times 10^{-6}$ 的学习率微调含 2200 万参数的 Snowflake/snowflake-arctic-embed-xs [112]. 分类器在 500,000 个样本的平衡数据集上训练 (公开与私有两个来源各 250,000 篇文档), 在考察的所有数据集上都很快达到 95% 以上的准确率.

21

<!-- page 22 of 26 -->

## B Data Details · 数据细节

Figure 5: Statistics of our data mix (descriptions in §4.1).

| Name | # Tokens (B) |
|---|---|
| Public Mix | $2.37 \times 10^3$ |
| News | 158.0 |
| Creative Writing | 201.9 |
| Math | 20.3 |
| StarCoder | 83.0 |
| Academic | 58.6 |
| Educational text | 102.2 |
| Reddit | 9.9 |

Table 5 presents the statistics of our training data described in Section 4.1.

表 5 给出了 4.1 节所述训练数据的统计 (原文如此; 统计实际在上方的图 5 中, 表 5 是评测基准表).

### B.1 Reddit Data Processing · Reddit 数据处理

The construction of this dataset involved three major phases.

这个数据集的构建分三个主要阶段.

**1. Reddit data filtering** A dataset of submission/comment pairs was derived from the PushShift Reddit dataset [113] (bulk dump as of March 2023) – the same dump used for Dolma Reddit (https://huggingface.co/datasets/allenai/dolma).

**1. Reddit 数据过滤** 从 PushShift Reddit 数据集 [113] (2023 年 3 月的批量转储) 得到一个「帖子/评论」对数据集, 与 Dolma Reddit 用的是同一份转储 (https://huggingface.co/datasets/allenai/dolma).

To derive our initial dataset, we extracted each submission and concatenated it with its top-scoring, top-level comment. We then performed further rule-based filtering with the following constraints:

- Filter out deleted/removed content.
- Filter out content marked as over_18.
- Filter out all posts from a list of 26,123 banned or NSFW subreddits.
- Filter out posts from likely bot authors (drawn from https://botrank.pastimes.eu/ as of Sept 2024).
- Filter out posts containing non-text media.

- Perform document-level text deduplication via Bloom filter.

为得到初始数据集, 我们取出每个帖子, 与其得分最高的顶层评论拼接, 再按以下约束做基于规则的过滤: 去掉已删除或被移除的内容; 去掉标记为 `over_18` 的内容; 去掉 26,123 个被封禁或 NSFW 子版块中的全部帖子; 去掉疑似机器人作者的帖子 (名单取自 https://botrank.pastimes.eu/, 2024 年 9 月版); 去掉含非文本媒体的帖子; 用 Bloom filter 做文档级文本去重.

**2. Retrieval-based subreddit selection** Dense retrieval was then used to identify academically-relevant subreddits for further filtering. We adapted search queries from MMLU test questions, and performed dense retrieval with these queries on the filtered Reddit data from Step #2, retaining the top 5 hits for each query. Based on these retrieved outputs, we selected 151 subreddits meeting the following criteria:

- Subreddit has >= 20 *unique* retrieved items for queries within a given MMLU category; OR
- Subreddit has >=100 retrieved items for queries across all MMLU categories.

**2. 基于检索的子版块选择** 接着用稠密检索找出与学术相关的子版块, 做进一步过滤. 我们由 MMLU 测试题改写出检索查询, 在第 2 步 (原文如此, 按上下文应为第 1 步) 过滤后的 Reddit 数据上做稠密检索, 每个查询保留前 5 条命中. 根据检索结果, 选出满足下列条件之一的 151 个子版块: 在某个 MMLU 类别的查询中检索到至少 20 条*不重复*条目; 或者在全部 MMLU 类别的查询中检索到至少 100 条条目.

We then filtered the dataset from Step #1 to retain only documents from subreddits on this list of 151 subreddits.

随后过滤第 1 步的数据集, 只保留来自这 151 个子版块的文档.

**3. Format rewriting** Finally, the data from Step #2 was input to a synthetic rewriting pipeline to generate academic QA items with coverage of diverse question formats. We defined 7 categories of question format inspired by variation observed in MMLU, and used these to construct prompts for QA text generation. The format categories are as follows:

1. open-ended
2. statement completion
3. fill-in-the-blank
4. statement truth verification
5. which-of-following-has-property-X

6. which-of-following-is-true
7. in-question options

**3. 格式改写** 末尾, 把第 2 步的数据送入合成改写流水线, 生成覆盖多种题型的学术问答条目. 参照 MMLU 中观察到的题型变化, 我们定义了 7 类题型 (开放式, 陈述补全, 填空, 陈述真伪判断, 「下列哪项具有性质 X」, 「下列哪项正确」, 题内选项), 并据此构造生成问答文本的提示.

For each format category we constructed a prompt for generating questions of that category given an input text. Below is an example prompt, for the "in-question-options" category. Prompts for other categories differ in 1) the content of the "For format ..." paragraph and 2) the in-context examples (1-3 examples per prompt).

对每类题型, 我们构造一条提示, 给定输入文本生成该类题目. 下面是「in-question-options」类的示例提示. 其他类别的提示有两处不同: 1)「For format ...」一段的内容; 2) 上下文示例 (每条提示 1 到 3 个).

22

<!-- page 23 of 26 -->

```text
I will ask you to convert a text into multiple-choice questions. Here is the text:

"{text}"

Instructions: Convert the information in the text into academic multiple choice questions. ONLY include questions that are academic. DONOT reference the text in the question.

For format, use questions that provide options within the question and give choices for which options are true. Examples:

Dogs have which of the following properties?

I. They are mammals II. They have five legs. III. They have a tail.

A. I only B. II only C. III only D. I and III

Answer: D

%%%%

Which of the following are cities in the US?

I. Paris II. Athens III. Chicago

A. I only B. II only C. III only D. I, II and III

Answer: C

Separate ALL questions with "\n%%%%\n".
```

For generating our rewritten QA data, we prompted GPT-4o mini (Jan 2025 version). We iterated over the submission/comment pairs in the data from Step #2, and for each of these texts we sampled a format category and prompted the GPT-4o mini to generate QA pairs for that text and format category. For longer input texts, format categories were resampled and prompted for again, a number of times proportional to the length of the text.

生成改写后的问答数据时, 我们调用 GPT-4o mini (2025 年 1 月版). 遍历第 2 步数据中的「帖子/评论」对, 对每段文本采样一个题型, 让 GPT-4o mini 为该文本和题型生成问答对. 对较长的输入文本, 会重新采样题型再次调用, 次数与文本长度成正比.

Finally, GPT-4o mini outputs were parsed into separate QA items based on the "%%%%" separator, and 50% of items were prepended with the prefix "Question: ".

末尾, 按「%%%%」分隔符把 GPT-4o mini 的输出拆成单独的问答条目, 并给其中 50% 的条目加上前缀「Question: 」.

We validated these rewritten data in experiments with OLMo 7B [114] models trained to 2T tokens, carrying out continued pretraining on a 50-50 mix of DCLM and Reddit data while annealing the learning rate to zero, a strategy used in [115, 78, 107]. We run this continued pretraining with two versions of Reddit data: the filtered data from Step #2, and the rewritten data from Step #3. We find that the rewriting improves over the non-rewritten data in both MC9 and MMLU: MC9 improves from 0.74 to 0.76 and MMLU improves from 0.62 to 0.66.

我们用训练到 2T token 的 OLMo 7B [114] 模型验证改写数据: 在 DCLM 与 Reddit 各占一半的混合上继续预训练, 同时把学习率退火到零, 这是 [115, 78, 107] 用过的策略. 继续预训练分别用两版 Reddit 数据: 第 2 步过滤后的数据, 以及第 3 步改写后的数据. 结果改写版在 MC9 和 MMLU 上都优于未改写版: MC9 从 0.74 升到 0.76, MMLU 从 0.62 升到 0.66.

23

<!-- page 24 of 26 -->

Table 5: Evaluation benchmarks. . Benchmarks are divided into general-purpose and domain-specific categories. Original dataset citations are listed at right. †SCIRIFF spans several subtasks (BioASQ factoid, general, and yes/no questions, COVID DeepSet QA, and PubMedQA) evaluated with different metrics. MATH† includes seven subsets: algebra, counting and probability, geometry, intermediate algebra, number theory, prealgebra, and precalculus.

| Benchmark (General) | Metric | Citation | Benchmark (Domain-specific) | Metric | Citation |
|---|---|---|---|---|---|
| ARC-EASY | Acc raw | [84] | HUMANEVAL | Pass@1 | [105] |
| ARC-CHALLENGE | Acc raw | [84] | HUMANEVALPLUS | Pass@1 | [104] |
| BOOLQ | Acc raw | [85] | MBPP | Pass@1 | [103] |
| CSQA | Acc raw | [86] | MBPPPLUS | Pass@1 | [104] |
| HELLASWAG | Acc raw | [87] | SCIRIFF† | — | [106] |
| OPENBOOKQA | Acc raw | [88] | MATH† | Exact Match | [102] |
| PIQA | Acc raw | [89] | NEWS GENERATION | LM-as-judge | |
| SOCIAL IQA | Acc raw | [90] | POEM GENERATION | LM-as-judge | |
| WINOGRANDE | Acc raw | [91] | GSM8K | Exact Match | [101] |
| MMLU | Acc raw | [97] | | | |
| MMLU-PRO | Acc raw | [98] | | | |
| AGIEVAL (English) | Acc raw | [99] | | | |
| BIG-BENCH HARD (BBH) | Exact Match | [100] | | | |
| COQA | F1 | [92] | | | |
| DROP | F1 | [96] | | | |
| NATURAL QUESTIONS (NQ) | F1 | [94] | | | |
| SQUAD | F1 | [93] | | | |
| TRIVIAQA | F1 | [95] | | | |
| NARRATIVEQA | F1 | [116] | | | |

Aggregate scores (averages of individual benchmarks) GEN5: COQA, SQUAD, NATURAL QUESTIONS, TRIVIAQA, DROP MC9: ARC-EASY, ARC-CHALLENGE, BOOLQ, CSQA, HELLASWAG, OPENBOOKQA, PIQA, SOCIAL IQA, WINOGRANDE CODE4: MBPP, MBPPPLUS, HUMANEVAL, HUMANEVALPLUS

## C Evaluation Details · 评测细节

All evaluations are done using the OLMES evaluation standard introduced by [117], following key metrics from the OLMo 2 framework [78]. Table 5 presents a detailed breakdown of our evaluation datasets and metrics. General description is provided in §4.2; here, we provide more details.

所有评测都按 [117] 提出的 OLMES 评测标准进行, 沿用 OLMo 2 框架 [78] 的主要指标. 表 5 列出了评测数据集和指标的明细. 概述见 §4.2, 这里补充更多细节.

**SciRiFF** We select five subtasks that do not require structured prediction: BioASQ-Factoid, BioASQ-Yes/No, BioASQ-General, PubMedQA, and COVID-QA. , with our tables reporting the average performance across all five tasks.

**SciRiFF** 我们选了五个不需要结构化预测的子任务: BioASQ-Factoid, BioASQ-Yes/No, BioASQ-General, PubMedQA 和 COVID-QA, 表中报告五个任务的平均表现.

**MATH** We assess solution correctness through exact matching with ground truth answers, following the methodology established in [118].

**MATH** 按 [118] 确立的方法, 通过与标准答案精确匹配来判定解答是否正确.

**News Generation** We use the muse-bench/MUSE-News dataset from [119], selecting articles containing between 64 and 128 tokens. Models are prompted to continue an article given a prefix of the first 32 tokens, using a sampling temperature of 0.8. A Llama-3.3-70B-Instruct model serves as the judge, evaluating each completion based on journalistic quality (2 points), topical coherence (2 points), and clarity/fluency (1 point), for a total score between 0 and 5, which is then normalized to a 0–100 scale. To reduce variance, we generate five completions per prompt and report the average score.

**新闻生成** 使用 [119] 的 muse-bench/MUSE-News 数据集, 选取长度在 64 到 128 token 之间的文章. 给模型文章前 32 token 作为前缀, 以采样温度 0.8 续写. 由 Llama-3.3-70B-Instruct 担任评审, 按新闻写作质量 (2 分), 主题连贯 (2 分), 清晰流畅 (1 分) 给每个续写打 0 到 5 分, 再换算到 0 到 100. 为降低方差, 每条提示生成五个续写, 报告平均分.

**Poem Generation** We employ the merve/poetry dataset⁷, filtering poems to those containing 64–128 tokens. From a total of 176 poems (147 Renaissance, 29 Modern), we reserve five poems (three Renaissance, two Modern) for few-shot examples and use 100 for testing. Models continue each poem from its first four lines, following the same prompting and evaluation settings as in NewsGen. A genre-aware Llama-3.3-70B-Instruct judge evaluates each completion based on poetic craftsmanship (2 points), thematic coherence (2 points), and clarity/fluency (1 point), with

⁷https://www.kaggle.com/datasets/ishnoor/poetry-analysis-with-machine-learning/data

24

<!-- page 25 of 26 -->

scores normalized to a 0–100 scale. As with news generation, five completions are generated per prompt, and we report the average score across all instances.

**诗歌生成** 使用 merve/poetry 数据集⁷, 只保留 64 到 128 token 的诗. 在共 176 首诗 (文艺复兴时期 147 首, 现代 29 首) 中, 留出五首 (文艺复兴三首, 现代两首) 作少样本示例, 用 100 首测试. 模型从每首诗的前四行开始续写, 提示和评测设置与 NewsGen 相同. 由一个区分体裁的 Llama-3.3-70B-Instruct 评审按诗艺 (2 分), 主题连贯 (2 分), 清晰流畅 (1 分) 打分, 再换算到 0 到 100. 与新闻生成一样, 每条提示生成五个续写, 报告全部实例的平均分.

⁷ https://www.kaggle.com/datasets/ishnoor/poetry-analysis-with-machine-learning/data

## D Methodology Intuition · 方法直觉

### D.1 Problem Setup · 问题设定

Given an input data $\mathbf{x}\in\mathbb{R}^h$, the router learning can be viewed as a multi-class classification problem with $n+1$ classes: a public class $C_\text{pub}$ and $n$ closed classes $\{C_i\}_{i=1}^n$. The scoring function $s_i: \mathbb{R}^h \rightarrow \mathbb{R}$ such that $s_i(\mathbf{x}) = \mathbf{r}_i \cdot \mathbf{x}$ represents the score for class $C_i$, where $\mathbf{r}_i$ is the router embedding and the higher scores indicate higher class membership likelihood.

给定输入 $\mathbf{x}\in\mathbb{R}^h$, 路由学习可以看作一个 $n+1$ 类的多分类问题: 一个公共类 $C_\text{pub}$ 和 $n$ 个封闭类 $\{C_i\}_{i=1}^n$. 打分函数 $s_i: \mathbb{R}^h \rightarrow \mathbb{R}$, $s_i(\mathbf{x}) = \mathbf{r}_i \cdot \mathbf{x}$ 表示类 $C_i$ 的得分, 其中 $\mathbf{r}_i$ 是路由嵌入, 得分越高表示属于该类的可能性越大.

**Training: Pairwise Binary Classification** In training experts to coordinate (§3.3.1), we learn $n$ binary classifiers $\{f_i\}_{i=1}^n$, where each $f_i: \mathbb{R}^h \rightarrow \{C_\text{pub}, C_i\}$ discriminates between $C_\text{pub}$ and $C_i$:

$$f_i(\mathbf{x}) = \begin{cases} C_i & \text{if } s_i(\mathbf{x}) > s_\text{pub}(\mathbf{x}) \\ C_\text{pub} & \text{otherwise.} \end{cases}$$

The decision boundary $h_i$ between $C_\text{pub}$ and $C_i$ is defined as:

$$h_i := \{\mathbf{x} \in \mathbb{R}^h : s_\text{pub}(\mathbf{x}) = s_i(\mathbf{x})\}.$$

**训练: 两两二分类** 在训练专家彼此协调时 (§3.3.1), 我们学习 $n$ 个二分类器 $\{f_i\}_{i=1}^n$, 每个 $f_i: \mathbb{R}^h \rightarrow \{C_\text{pub}, C_i\}$ 区分 $C_\text{pub}$ 与 $C_i$, 见第一个式子. $C_\text{pub}$ 与 $C_i$ 之间的决策边界 $h_i$ 由第二个式子定义.

**Inference: Multiclass Classification** At inference time (§3.3.2), these $n$ binary classifiers are combined into a unified multi-class classifier that maps from $\mathbb{R}^h$ to the complete class space $C_\text{pub}, C_1, \ldots, C_n$. The final classification decision is determined by:

$$F(\mathbf{x}) = \arg\max_{i \in \{\text{pub}, 1, \cdots, n\}} s_i(\mathbf{x}).$$

**推理: 多分类** 推理时 (§3.3.2), 这 $n$ 个二分类器组合成一个统一的多分类器, 把 $\mathbb{R}^h$ 映射到完整类空间 $C_\text{pub}, C_1, \ldots, C_n$, 最终分类由上式决定.

The key question is: how could we make the ensemble of binary classifiers $\{f_i\}_{i=1}^n$ route inputs as close to if we had trained one unified multiclass classifier $F$ end-to-end on all data?

关键问题是: 怎样让二分类器集合 $\{f_i\}_{i=1}^n$ 的路由结果, 尽量接近在全部数据上端到端训练一个统一多分类器 $F$ 的结果?

Our intuition is if each binary classifier $f_i$ learns the decision boundary "$C_i$ vs. not $C_i$" rather than just "$C_i$ vs. $C_\text{pub}$", this could make decision boundary that tightly encircles $C_i$ which leads to better multi-class classification.

我们的直觉是: 如果每个二分类器 $f_i$ 学到的是「$C_i$ 与非 $C_i$」的决策边界, 而不只是「$C_i$ 与 $C_\text{pub}$」, 边界就会紧紧围住 $C_i$, 多分类效果也就更好.

### D.2 Anchor Point and Negative Bias · 锚点与负偏置

To ensure each classifier $f_i$ learns a better decision boundary $h_i$, we propose two key techniques:

为确保每个分类器 $f_i$ 学到更好的决策边界 $h_i$, 我们提出两项关键技术:

**Freezing $\mathbf{r}_\text{pub}$ and $M_\text{pub}$ as anchor points** During training of each binary classifier $f_i$, we fix the public expert $M_\text{pub}$ and router embedding $\mathbf{r}_\text{pub}$ to ensure all classifiers share a common coordinate system by maintaining:

$$s_\text{pub}(\mathbf{x}) = \mathbf{r}_\text{pub} \cdot \mathbf{x}, \quad \forall i \in \{1, \cdots, n\}.$$

**冻结 $\mathbf{r}_\text{pub}$ 和 $M_\text{pub}$ 作为锚点** 训练每个二分类器 $f_i$ 时, 固定公共专家 $M_\text{pub}$ 和路由嵌入 $\mathbf{r}_\text{pub}$, 让上式对所有 $i$ 成立, 从而保证所有分类器共享同一个坐标系.

![](images/negative_bias.png)

Figure 6: During training, the negative bias shifts the decision boundary. So that a more selective subset of data will be used to train the expert corresponding to $C_1$.

Without this constraint, each binary classifier would optimize both $\mathbf{r}_\text{pub}$ and $\mathbf{r}_i$ independently, resulting in inconsistent coordinate systems where $\mathbf{r}_\text{pub}^{(i)} \neq \mathbf{r}_\text{pub}^{(j)}$ for $i \neq j$ during the training of binary classifiers $f_i$ and $f_j$. Such inconsistency would invalidate the multi-class classifier $F(\mathbf{x})$, as it would attempt to compare scores computed in incompatible embedding spaces. By maintaining a fixed reference point, we ensure all decision boundaries $h_i$ are defined relative to the same coordinate system, enabling their meaningful composition during inference without additional training.

没有这个约束, 每个二分类器会各自同时优化 $\mathbf{r}_\text{pub}$ 和 $\mathbf{r}_i$, 训练 $f_i$ 与 $f_j$ 时得到 $\mathbf{r}_\text{pub}^{(i)} \neq \mathbf{r}_\text{pub}^{(j)}$ ($i \neq j$), 坐标系不一致. 这种不一致会让多分类器 $F(\mathbf{x})$ 失效, 因为它要比较在互不兼容的嵌入空间里算出的得分. 保持一个固定的参照点, 就保证所有决策边界 $h_i$ 都相对同一坐标系定义, 推理时无需额外训练就能有意义地组合起来.

25

<!-- page 26 of 26 -->

**Adding a negative bias** During training of $f_i$, each binary classifier only needs to satisfy $\mathbf{r}_i \cdot \mathbf{x} > \mathbf{r}_\text{pub} \cdot \mathbf{x}$ for $\mathbf{x} \in C_i$. When $C_\text{pub}$ and $C_i$ is separable, many possible $\mathbf{r}_i$ vectors (no bias boundary in Figure 6) can satisfy this constraint without precisely characterizing the specialized region of $C_i$. We refine this by adding a negative bias term to each expert:

$$\mathbf{r}_i \cdot \mathbf{x} + b_i > \mathbf{r}_\text{pub} \cdot \mathbf{x} \quad \forall i \in \{1, 2, ..., n\}$$

**加入负偏置** 训练 $f_i$ 时, 每个二分类器只需对 $\mathbf{x} \in C_i$ 满足 $\mathbf{r}_i \cdot \mathbf{x} > \mathbf{r}_\text{pub} \cdot \mathbf{x}$. 当 $C_\text{pub}$ 与 $C_i$ 可分时, 很多 $\mathbf{r}_i$ (图 6 中无偏置的边界) 都能满足这个约束, 却没有准确刻画 $C_i$ 的专属区域. 我们给每个专家加一个负偏置项来改进, 见上式.

As Figure 6 illustrates, the negative bias term could help move the decision boundary $h_i$ closer to $C_i$'s data points. This means, during training, a more selective subset of data will be used to train the local expert. This facilitates merging, where experts compete not only with $C_\text{pub}$ but with each other.

如图 6 所示, 负偏置项能把决策边界 $h_i$ 推向 $C_i$ 的数据点. 也就是说, 训练时只有更有选择性的一部分数据用来训练本地专家. 这有利于合并, 因为那时专家不只与 $C_\text{pub}$ 竞争, 还要彼此竞争.

26
