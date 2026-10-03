---
title: "Gemini Robotics · 对照译稿"
category: "模型库"
tags: ["Gemini", "对照译稿"]
published: true
excerpt: "Gemini Robotics 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 64 -->

arXiv:2503.20020v1 [cs.RO] 25 Mar 2025

Google DeepMind

# Gemini Robotics: Bringing AI into the Physical World

**Gemini Robotics：把 AI 带进物理世界。**

**Gemini Robotics Team, Google DeepMind**<sup>1</sup>

Gemini Robotics 团队，Google DeepMind。

**Recent advancements in large multimodal models have led to the emergence of remarkable generalist capabilities in digital domains, yet their translation to physical agents such as robots remains a significant challenge. Generally useful robots need to be able to make sense of the physical world around them, and interact with it competently and safely. This report introduces a new family of AI models purposefully designed for robotics and built upon the foundation of Gemini 2.0. We present Gemini Robotics, an advanced Vision-Language-Action (VLA) generalist model capable of directly controlling robots. Gemini Robotics executes smooth and reactive movements to tackle a wide range of complex manipulation tasks while also being robust to variations in object types and positions, handling unseen environments as well as following diverse, open vocabulary instructions. We show that with additional fine-tuning, Gemini Robotics can be specialized to new capabilities including solving long-horizon, highly dexterous tasks like folding an origami fox or playing a game of cards, learning new short-horizon tasks from as few as 100 demonstrations, adapting to completely novel robot embodiments including a bi-arm platform and a high degrees-of-freedom humanoid. This is made possible because Gemini Robotics builds on top of the Gemini Robotics-ER model, the second model we introduce in this work. Gemini Robotics-ER (Embodied Reasoning) extends Gemini’s multimodal reasoning capabilities into the physical world, with enhanced spatial and temporal understanding. This enables capabilities relevant to robotics including object detection, pointing, trajectory and grasp prediction, as well as 3D understanding in the form of multi-view correspondence and 3D bounding box predictions. We show how this novel combination can support a variety of robotics applications, e.g., zero-shot (via robot code generation), or few-shot (via in-context learning). We also discuss and address important safety considerations related to this new class of robotics foundation models. The Gemini Robotics family marks a substantial step towards developing general-purpose robots that realize AI’s potential in the physical world.**

大型多模态模型近来的进展，让数字领域里出现了很强的通用能力，但把这些能力搬到机器人这类物理智能体上，仍然是很大的难题。真正有用的机器人要能看懂身边的物理世界，并且能胜任且安全地和它交互。本报告介绍一个专为机器人设计，建在 Gemini 2.0 之上的新 AI 模型家族。我们提出 Gemini Robotics，一个能直接控制机器人的先进视觉-语言-动作（VLA）通用模型。它动作平滑，反应及时，能完成大量复杂的操作任务，对物体种类和位置的变化稳健，能应付没见过的环境，也能执行多样的开放词表指令。我们展示，经过额外的微调，Gemini Robotics 可以专精出新能力：完成长时程，高灵巧度的任务，比如折一只纸狐狸或打一局牌；只用 100 次示范就学会新的短时程任务；适配全新的机器人机体，包括一个双臂平台和一个高自由度人形机器人。这些之所以做得到，是因为 Gemini Robotics 建在 Gemini Robotics-ER 之上，后者是本文介绍的第二个模型。Gemini Robotics-ER（Embodied Reasoning，具身推理）把 Gemini 的多模态推理能力延伸到物理世界，空间和时间理解更强。由此得到一批和机器人相关的能力：物体检测，指点，轨迹和抓取预测，以及多视角对应和 3D 边界框预测这类 3D 理解。我们展示这种新组合能支撑多种机器人应用，例如零样本（通过生成机器人代码）或少样本（通过上下文学习）。我们还讨论并处理这类新型机器人基础模型带来的重要安全问题。Gemini Robotics 家族是朝通用机器人迈出的一大步，这类机器人能在物理世界里兑现 AI 的潜力。

## 1. Introduction

The remarkable progress of modern artificial intelligence (AI) models – with pre-training on large scale datasets – has redefined information processing, demonstrating proficiency and generalization across diverse modalities such as text, images, audio, and video. This has opened a vast landscape of opportunities for interactive and assistive systems within the digital realm, ranging from multimodal chatbots to virtual assistants. However, realizing the potential of general-purpose autonomous AI in the physical world requires a substantial shift from the digital world, where physically grounded AI agents must demonstrate robust human-level embodied reasoning: The set of world knowledge that encompasses the fundamental concepts which are critical for operating and acting in an inherently physically embodied world. While, as humans, we take for granted our embodied reasoning abilities – such as perceiving the 3D structure of environments, interpreting complex inter-object relationships, or understanding intuitive physics – these capabilities form an important basis for any embodied AI agent. Furthermore, an embodied AI agent must also go beyond passively understanding the spatial and physical concepts of the real world; it must also learn to take actions that have direct effects

现代 AI 模型在大规模数据上预训练，进步很快，重新定义了信息处理，在文本，图像，音频和视频等多种模态上都表现出熟练和泛化。这在数字领域打开了大片机会，从多模态聊天机器人到虚拟助手，都是交互式和辅助式系统。但要在物理世界里实现通用自主 AI 的潜力，需要从数字世界做一次大的转向：扎根物理世界的 AI 智能体必须具备稳健的，人类水平的具身推理。具身推理指一组世界知识，涵盖在一个本质上有物理身体的世界里操作和行动所必需的基本概念。人类把自己的具身推理能力当成理所当然，比如感知环境的 3D 结构，理解物体之间复杂的关系，懂直觉物理，而这些能力正是任何具身 AI 智能体的重要基础。此外，具身 AI 智能体不能只被动理解真实世界的空间和物理概念，它还要学会采取行动，这些行动会直接影响

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">1See Contributions and Acknowledgments section for full author list. Please send correspondence to [gemini-robotics-report@google.com](mailto:gemini-robotics-report@google.com).</span></small>

脚注 1：完整作者名单见 「贡献与致谢」 一节。通信请发往 gemini-robotics-report@google.com。

© 2025 Google DeepMind. All rights reserved

© 2025 Google DeepMind。保留所有权利。

<!-- page 2 of 64 -->

![Image block](images/p02-figure-1-overview-of-the-gemini-robotics-family-of.png)

Figure 1 | Overview of the Gemini Robotics family of embodied AI models. Gemini 2.0 already exhibits capabilities relevant to robotics such as semantic safety understanding and long contexts. The robotics-specific training and the optional specialization processes enable the Gemini Robotics models to exhibit a variety of robotics-specific capabilities. The models generate dexterous and reactive motions, can be quickly adapted to new embodiments, and use advanced visuo-spatial reasoning to inform actions.

图 1: Gemini Robotics 具身 AI 模型家族概览。Gemini 2.0 本身已有一些和机器人相关的能力，比如语义层面的安全理解和长上下文。机器人专用训练和可选的专精流程，让 Gemini Robotics 模型具备多种机器人专属能力。这些模型能生成灵巧且反应及时的动作，能快速适配新机体，并用较强的视觉-空间推理来指导动作。

on their external environment, bridging the gap between passive perception and active physical interaction.

外部环境，从而把被动感知和主动的物理交互连起来。

With the recent advancements in robotics hardware, there is exciting potential for creating embodied AI agents that can perform highly dexterous tasks. With this in mind, we ask: What would it take to endow a state-of-the-art digital AI model with the embodied reasoning capabilities needed to interact with our world in a general and dexterous manner?

随着机器人硬件近来的进展，造出能完成高灵巧任务的具身 AI 智能体已经很有希望。带着这个想法，我们问：要让一个最先进的数字 AI 模型具备具身推理能力，能以通用且灵巧的方式和我们的世界交互，需要什么？

Our thesis is predicated on harnessing the advanced multimodal understanding and reasoning capabilities inherent in frontier Vision-Language Models (VLMs), such as Gemini 2.0. The generalized comprehension afforded by these foundation models, with their ability to interpret visual inputs and complex text instructions, forms a powerful foundation for building embodied agents. This endeavor hinges on two fundamental components. First, Gemini needs to acquire robust embodied reasoning, gaining the ability to understand the rich geometric and temporal-spatial details of the physical world. Second, we must ground this embodied reasoning in the physical world by enabling Gemini to speak the language of physical actions, understanding contact physics, dynamics, and the intricacies of real-world interactions. Ultimately, these pieces must coalesce to enable fast, safe and dexterous control of robots in the real world.

我们的主张建立在利用前沿视觉语言模型（VLM）自带的多模态理解和推理能力上，Gemini 2.0 就是这样的模型。这些基础模型能解读视觉输入和复杂的文本指令，它们的通用理解力是构建具身智能体的有力基础。这件事取决于两个基本部分。第一，Gemini 要获得稳健的具身推理，能理解物理世界丰富的几何细节和时空细节。第二，我们要把这种具身推理落到物理世界里，让 Gemini 会说物理动作的语言，懂接触物理，动力学和真实交互中的各种细节。最终这些部分要合在一起，让真实世界里的机器人控制又快，又安全，又灵巧。

To this end, we introduce the Gemini Robotics family of embodied AI models, built on top of Gemini 2.0, our most advanced multimodal foundation model. We first validate the performance and generality of the base Gemini 2.0’s innate embodied reasoning capabilities with a new open-source general embodied reasoning benchmark, **ERQA**. We then introduce two models: The first model is **Gemini Robotics-ER**, a VLM with strong embodied reasoning capabilities at its core, exhibiting generalization across a wide range of embodied reasoning tasks while also maintaining its core foundation model

为此，我们推出 Gemini Robotics 具身 AI 模型家族，它建在我们最先进的多模态基础模型 Gemini 2.0 之上。我们先用一个新的开源通用具身推理基准 **ERQA**，验证基础版 Gemini 2.0 自带的具身推理能力有多强，覆盖面有多广。然后介绍两个模型。第一个是 **Gemini Robotics-ER**，一个以强具身推理为核心的 VLM，能在大量具身推理任务上泛化，同时保留其作为基础模型的核心

<!-- page 3 of 64 -->

![Image block](images/p03-gemini-robotics-bringing-ai-into-the-physical-world.png)

2D Object Detection

2D Pointing

Multi-view Correspondence

3D Object Detection

图中四个小标题：2D 物体检测，2D 指点，多视角对应，3D 物体检测。

Figure 2 | Gemini 2.0 excels at embodied reasoning capabilities — detecting objects and points in 2D, leveraging 2D pointing for grasping and trajectories, and corresponding points and detecting objects in 3D. All results shown are obtained with Gemini 2.0 Flash.

图 2: Gemini 2.0 擅长具身推理：在 2D 中检测物体和点，用 2D 指点做抓取和轨迹，在 3D 中做点对应和物体检测。图中所有结果都来自 Gemini 2.0 Flash。

capabilities. Gemini Robotics-ER exhibits strong performance on multiple capabilities critical for understanding the physical world, ranging from 3D perception to detailed pointing to robot state estimation and affordance prediction via code. The second model is **Gemini Robotics**, a state-of-the art Vision-Language-Action (VLA) model that connects strong embodied reasoning priors to dexterous low-level control of real-world robots to solve challenging manipulation tasks. As a generalist VLA, Gemini Robotics can perform a wide array of diverse and complicated tasks, while also closely following language guidance and generalizing to distribution shifts in instructions, visuals, and motions. To emphasize the flexibility and generality of the Gemini Robotics models, we also introduce an optional specialization stage, which demonstrates how Gemini Robotics can be adapted for extreme dexterity, for advanced reasoning in difficult generalization settings, and for controlling completely new robot embodiments. Finally, we discuss the safety implications of training large robotics models such as the Gemini Robotics models, and provide guidelines for how to study such challenges in the context of VLAs. Specifically, this report highlights:

能力。Gemini Robotics-ER 在多项理解物理世界的关键能力上表现很强，从 3D 感知，精细指点，到机器人状态估计和通过代码做可供性（affordance）预测。第二个模型是 **Gemini Robotics**，一个最先进的视觉-语言-动作（VLA）模型，它把强具身推理先验接到真实机器人的灵巧底层控制上，用来解决有挑战的操作任务。作为通用 VLA，Gemini Robotics 能完成大量多样而复杂的任务，同时紧跟语言指引，并能在指令，视觉和动作的分布偏移下泛化。为了突出 Gemini Robotics 模型的灵活和通用，我们还引入一个可选的专精阶段，展示 Gemini Robotics 如何适配极端灵巧的任务，困难泛化场景下的高级推理，以及全新机器人机体的控制。最后，我们讨论训练 Gemini Robotics 这类大型机器人模型的安全影响，并给出在 VLA 语境下研究这些问题的指引。具体来说，本报告的重点是：

1. **ERQA**: An open-source benchmark specifically designed to evaluate embodied reasoning capabilities of multimodal models, addressing the lack of benchmarks that go beyond assessing atomic capabilities and facilitating standardized assessment and future research.

1. **ERQA:** 一个专门评估多模态模型具身推理能力的开源基准。现有基准多半只测原子能力，ERQA 补上这块空缺，便于做标准化评估和后续研究。

2. **Gemini Robotics-ER**: A VLM demonstrating enhanced embodied reasoning capabilities.

2. **Gemini Robotics-ER:** 一个具身推理能力增强的 VLM。

3. **Gemini Robotics**: A VLA model resulting from the integration of robot action data, enabling high-frequency dexterous control, robust generalization and fast adaptation across diverse robotic tasks and embodiments.

3. **Gemini Robotics:** 融入机器人动作数据后得到的 VLA 模型，能做高频灵巧控制，泛化稳健，并能在多种机器人任务和机体间快速适配。

4. **Responsible Development**: We discuss and exercise responsible development of our family of models in alignment with Google AI Principles carefully studying the societal benefits and risks of our models, and potential risk mitigation.

4. **负责任的开发：** 我们按 Google AI 原则讨论并实践这一模型家族的负责任开发，仔细研究模型的社会收益，风险以及可能的缓解手段。

The Gemini Robotics models serve as an initial step towards more generally capable robots. We believe that, ultimately, harnessing the embodied reasoning capabilities from internet scale data,

Gemini Robotics 模型是走向能力更通用的机器人的第一步。我们相信，最终把来自互联网规模数据的具身推理能力，

<!-- page 4 of 64 -->

![Image block](images/p04-figure-3-example-questions-from-the-embodied-reasoning.png)

Figure 3 | Example questions from the Embodied Reasoning Question Answering (ERQA) benchmark, with answers in bold.

图 3：具身推理问答（ERQA）基准的示例题目，答案加粗。

grounded with action data from real world interactions, can enable robots to deeply understand the physical world and act competently. This understanding will empower them to achieve even the most challenging goals with generality and sophistication that has so far seemed out of reach for robotic systems.

用真实交互中的动作数据落地，就能让机器人深入理解物理世界并胜任地行动。有了这种理解，机器人能以通用而精巧的方式完成最难的目标，这是机器人系统至今看起来够不着的。

## 2. Embodied Reasoning with Gemini 2.0

**2. 用 Gemini 2.0 做具身推理**

Gemini 2.0 is a Vision-Language Model (VLM) that is capable of going beyond tasks that only require visual understanding and language processing. In particular, this model exhibits advanced embodied reasoning (ER) capabilities. We define ER as the ability of a Vision-Language Model to ground objects and spatial concepts in the real world, and the ability to synthesize those signals for downstream robotics applications. See some examples of such capabilities in Fig. 2. In Section 2.1, we first introduce a benchmark for evaluating a broad spectrum of ER capabilities and show that Gemini 2.0 models are state-of-the-art. In Section 2.2, we demonstrate the wide range of specific ER capabilities enabled by Gemini 2.0. Finally, in Section 2.3, we showcase how these capabilities can be put to use in robotics applications without the need for fine-tuning on robot action data, enabling use cases such as zero-shot control via code generation and few-shot robot control via in-context learning.

Gemini 2.0 是一个视觉语言模型（VLM），能做的不止是只要求视觉理解和语言处理的任务。尤其是，它有较强的具身推理（ER）能力。我们把 ER 定义为：VLM 把物体和空间概念落到真实世界的能力，以及把这些信号综合起来供下游机器人应用使用的能力。图 2 给了一些例子。2.1 节先介绍一个评估广泛 ER 能力的基准，并表明 Gemini 2.0 模型是最先进的。2.2 节展示 Gemini 2.0 的各种具体 ER 能力。2.3 节展示这些能力无需在机器人动作数据上微调，就能用于机器人应用，比如通过代码生成做零样本控制，通过上下文学习做少样本控制。

## 2.1. Embodied Reasoning Question Answering (ERQA) Benchmark

**2.1 具身推理问答（ERQA）基准**

To capture progress in embodied reasoning for VLMs, we introduce ERQA, short for Embodied Reasoning Question Answering, a benchmark that focuses specifically on capabilities likely required by an embodied agent interacting with the physical world. ERQA consists of 400 multiple choice Visual Question Answering (VQA)-style questions across a wide variety of categories, including spatial reasoning, trajectory reasoning, action reasoning, state estimation, pointing, multi-view reasoning, and task reasoning. A breakdown of the distribution of question types is in Fig. 4. Of the 400 questions 28% have more than one image in the prompt — these questions that

为了衡量 VLM 在具身推理上的进展，我们推出 ERQA (Embodied Reasoning Question Answering)，一个专门考察与物理世界交互的具身智能体大概率需要哪些能力的基准。ERQA 有 400 道视觉问答（VQA）形式的选择题，覆盖很多类别，包括空间推理，轨迹推理，动作推理，状态估计，指点，多视角推理和任务推理。题型分布见图 4. 400 道题里有 28% 的提示中不止一张图，这些题

![Chart block](images/p04-figure-4-erqa-question-categories.png)

Figure 4 | ERQA question categories.

图 4: ERQA 题目类别。

> **拆开：** 28% 多图题和图 4 的扇区能不能对上 400?
> 图 4 的八个扇区是 Spatial Reasoning 84, Action Reasoning 72, Trajectory Reasoning 66, State Estimation 55，Task Reasoning 38，Multi-view Reasoning 37，Pointing 34，Other 14，加起来正好 400. 28% 折成题数是 112 道，比 Multi-view Reasoning 的 37 道多出 75 道，说明多图题并不只在多视角那一类里，其他类别也有带多张图的题。表 1 和表 2 只给 ERQA 总分，没有按单图和多图拆开报告，所以 「多图题更难」 这句在本文里没有数字支撑。

<!-- page 5 of 64 -->

<table><tr><td rowspan="2">Benchmark</td><td colspan="4">Gemini</td><td colspan="2">GPT</td><td>Claude</td></tr><tr><td>1.5 Flash</td><td>1.5 Pro</td><td>2.0 Flash</td><td>2.0 Pro Experimental</td><td>4o-mini</td><td>4o</td><td>3.5 Sonnet</td></tr><tr><td>ERQA</td><td>42.3</td><td>41.8</td><td>46.3</td><td>48.3</td><td>37.3</td><td>47.0</td><td>35.5</td></tr><tr><td>RealworldQA (test)</td><td>69.0</td><td>64.5</td><td>71.6</td><td>74.5</td><td>65.0</td><td>71.9</td><td>61.4</td></tr><tr><td>BLINK (val)</td><td>59.2</td><td>64.4</td><td>65.0</td><td>65.2</td><td>56.9</td><td>62.3</td><td>60.2</td></tr></table>

Table 1 | Comparing VLMs on benchmarks that assess a wide range of embodied reasoning capabilities, including our new ERQA benchmark. Benchmarks are evaluated by accuracies of multiple-choice answers. Results obtained in Feb 2025.

表 1：在评估广泛具身推理能力的基准上比较各 VLM，包括新的 ERQA。各基准按选择题准确率计分，结果取于 2025 年 2 月。列依次是 Gemini 1.5 Flash, 1.5 Pro, 2.0 Flash, 2.0 Pro Experimental, GPT-4o-mini, GPT-4o, Claude 3.5 Sonnet. ERQA: 42.3, 41.8, 46.3, 48.3, 37.3, 47.0, 35.5. RealworldQA (test): 69.0, 64.5, 71.6, 74.5, 65.0, 71.9, 61.4. BLINK (val): 59.2, 64.4, 65.0, 65.2, 56.9, 62.3, 60.2.

require corresponding concepts across multiple images tend to be more challenging than single-image questions.

需要在多张图之间对应概念，往往比单图题更难。

ERQA is complementary to existing VLM benchmarks, which tend to highlight more atomic capabilities (e.g., object recognition, counting, localization), but in most cases do not take sufficient account of the broader set of capabilities needed to act in the physical world. Fig. 3 shows some example questions and answers of our ERQA. Some questions require the VLM to recognize and register objects across multiple frames; others require reasoning about objects’ affordances and 3D relationships with the rest of the scene. Full details of the benchmark can be found at [https://github.com/embodiedreasoning/ERQA](https://github.com/embodiedreasoning/ERQA).

ERQA 和现有 VLM 基准互补。现有基准偏重更原子的能力（如物体识别，计数，定位），多数情况下没有充分考虑在物理世界中行动所需的更广能力。图 3 给出 ERQA 的一些示例题目和答案。有的题要求 VLM 在多帧之间识别并配准物体，有的题要求推理物体的可供性以及它和场景其他部分的 3D 关系。基准的完整细节见 https://github.com/embodiedreasoning/ERQA.

We manually labeled all questions in ERQA to ensure correctness and quality. Images (not questions) in the benchmark are either taken by ourselves or sourced from these datasets: OXE (O’Neill et al., 2024), UMI Data (UMI-Data, 2024), MECCANO (Ragusa et al., 2021, 2022), HoloAssist (Wang et al., 2023), and EGTEA Gaze+ (Li et al., 2021). In Table 1, we report results of Gemini models and other models on ERQA, as well as on RealworldQA (XAI-org, 2024) and BLINK (Fu et al., 2024), two popular benchmarks that also measure spatial and image understanding capabilities. Specifically, we report results of Gemini 2.0 Flash, a powerful low-latency workhorse model and Gemini 2.0 Pro Experimental 02-05 (short as Gemini 2.0 Pro Experimental in the rest of the paper), the best Gemini model for complex tasks. Gemini 2.0 Flash and Pro Experimental achieve a new state-of-the-art on all three benchmarks in their respective model classes. We also note that ERQA is the most challenging benchmark across these three, making the performance here especially notable.

ERQA 的所有题目都经过人工标注，以保证正确性和质量。基准中的图像（不是题目）要么是我们自己拍的，要么取自这些数据集：OXE (O'Neill et al., 2024), UMI Data (UMI-Data, 2024), MECCANO (Ragusa et al., 2021, 2022), HoloAssist (Wang et al., 2023) 和 EGTEA Gaze+ (Li et al., 2021)。表 1 报告 Gemini 模型和其他模型在 ERQA 上的结果，以及在 RealworldQA (XAI-org, 2024) 和 BLINK (Fu et al., 2024) 上的结果，后两个是同样考察空间和图像理解的常用基准。具体来说，我们报告 Gemini 2.0 Flash 和 Gemini 2.0 Pro Experimental 02-05（下文简称 Gemini 2.0 Pro Experimental）的结果。前者是强大的低延迟主力模型，后者是处理复杂任务最好的 Gemini 模型。Gemini 2.0 Flash 和 Pro Experimental 在各自的模型档位里，三个基准上都达到新的最先进水平。我们还注意到 ERQA 是三个基准里最难的，所以在它上面的表现尤其值得一提。

> **对一下：** 「三个基准都是新的最先进」 和表 1 的数字对得上吗？
> 要看 「各自档位」 这四个字。表 1 里 2.0 Flash 的 ERQA 是 46.3，RealworldQA 是 71.6，都低于 GPT-4o 的 47.0 和 71.9。所以 Flash 只在和 4o-mini (37.3, 65.0) 比的时候是第一，跨档位就不是。2.0 Pro Experimental 的 48.3, 74.5, 65.2 在三行里都是整张表最高。这句结论只有按 Flash 对 mini，Pro 对 4o 的分组读才成立，表 1 本身没有标出这个分组。

Gemini 2.0 models are capable of advanced reasoning — we found we can significantly improve Gemini 2.0’s performance on the benchmark if we use Chain-of-Thought (CoT) prompting (Wei et al., 2022), which encourages the model to output reasoning traces to “think” about a problem before choosing the multiple choice answer, instead of directly predicting the answer. We use the following instruction as the CoT prompt appended at the end of each question: “Reason step by step about the answer, and show your work, for each step. Only after that, proceed to the final answer.” Results are shown in Table 2. With CoT prompting, Gemini 2.0 Flash’s performance exceeds that of Gemini 2.0 Pro Experimental without CoT, and CoT further improves Gemini 2.0 Pro Experimental’s performance. We highlight two such reasoning traces in Fig. 5, questions that Gemini 2.0 Pro Experimental answered incorrectly without CoT, but correctly with CoT. The reasoning traces demonstrate Gemini 2.0 is able

Gemini 2.0 模型能做较高级的推理。我们发现，用思维链（CoT）提示（Wei et al., 2022）能明显提高 Gemini 2.0 在这个基准上的成绩。CoT 鼓励模型在选答案之前先输出推理过程，把问题 「想」 一遍，而不是直接给出答案。我们在每道题末尾追加如下指令作为 CoT 提示：「Reason step by step about the answer, and show your work, for each step. Only after that, proceed to the final answer.」（逐步推理答案，每一步都写出过程，之后再给出最终答案。）结果见表 2。用了 CoT 提示后，Gemini 2.0 Flash 的成绩超过不用 CoT 的 Gemini 2.0 Pro Experimental，CoT 也进一步提高了 Gemini 2.0 Pro Experimental 的成绩。图 5 展示两条这样的推理过程，对应的题目 Gemini 2.0 Pro Experimental 不用 CoT 时答错，用 CoT 时答对。这些推理过程表明 Gemini 2.0 能够

<table><tr><td rowspan="2">Prompt Variant</td><td colspan="2">Gemini</td><td colspan="2">GPT</td><td>Claude</td></tr><tr><td>2.0 Flash</td><td>2.0 Pro Experimental</td><td>4o-mini</td><td>4o</td><td>3.5 Sonnet</td></tr><tr><td>Without CoT</td><td>46.3</td><td>48.3</td><td>37.3</td><td>47.0</td><td>35.5</td></tr><tr><td>With CoT</td><td>50.3</td><td>54.8</td><td>40.5</td><td>50.5</td><td>45.8</td></tr></table>

Table 2 | Performances on the ERQA benchmark with and without Chain-of-Thought (CoT) prompting.

表 2：有无思维链（CoT）提示时各模型在 ERQA 上的成绩。列依次是 Gemini 2.0 Flash, 2.0 Pro Experimental, GPT-4o-mini, GPT-4o, Claude 3.5 Sonnet。无 CoT: 46.3, 48.3, 37.3, 47.0, 35.5。有 CoT: 50.3, 54.8, 40.5, 50.5, 45.8。

> **核对：** CoT 带来的提升，Gemini 是不是最大的？
> 按表 2 逐列相减：2.0 Flash +4.0, 2.0 Pro Experimental +6.5, 4o-mini +3.2, 4o +3.5, Claude 3.5 Sonnet +10.3。提升最大的是 Claude，不是 Gemini。加了 CoT 以后 4o 的 50.5 仍略高于 2.0 Flash 的 50.3，和不加 CoT 时的先后顺序一样。CoT 是推理阶段多花算力的一种做法，下文记作 TestingTime。表 2 能说明的是 TestingTime 对这类题普遍有效，至于 「Flash 加 CoT 超过不加 CoT 的 Pro」 这一句，比的是两种算力下的两个模型。

<!-- page 6 of 64 -->

![Image block](images/p06-figure-5-examples-of-questions-and-reasoning-traces.png)

Figure 5 | Examples of questions and reasoning traces with Gemini 2.0 Pro Experimental. Red answers were obtained without the CoT prompt; green answers obtained with CoT prompt.

图 5: Gemini 2.0 Pro Experimental 的题目和推理过程示例。红色答案是不用 CoT 提示时得到的，绿色答案是用 CoT 提示时得到的。

to 1) precisely ground its spatial understanding in observations in the image and 2) leverage such grounding to perform complex, step-by-step embodied reasoning.

1) 把空间理解准确地落到图像观察上，2) 借助这种落地做复杂的，一步一步的具身推理。

## 2.2. Gemini 2.0’s Embodied Reasoning Capabilities

**2.2 Gemini 2.0 的具身推理能力**

In this section, we illustrate some of Gemini 2.0’s embodied reasoning capabilities in more detail. We also introduce Gemini Robotics-ER, a version of Gemini 2.0 Flash that has enhanced embodied reasoning. These can be used in robotics applications without the need for any additional robot-specific data or training. Gemini 2.0 can understand a variety of 2D spatial concepts in images.

本节更细地展示 Gemini 2.0 的一些具身推理能力。我们还介绍 Gemini Robotics-ER，它是具身推理增强过的一版 Gemini 2.0 Flash。这些能力可以直接用于机器人应用，不需要任何额外的机器人专用数据或训练。Gemini 2.0 能理解图像中的多种 2D 空间概念。

1. **Object Detection:** Gemini 2.0 can perform open-world 2D object detection, providing precise 2D bounding boxes with queries that can be explicit (e.g., describing an object name) or implicit (categories, attributes, or functions).

1. **物体检测：** Gemini 2.0 能做开放世界的 2D 物体检测，给出精确的 2D 边界框。查询可以是显式的（如直接说物体名），也可以是隐式的（类别，属性或功能）。

2. **Pointing:** Given any natural language description, the model is able to point to explicit entities like objects and object parts, as well as implicit notions such as affordances (where to grasp, where to place), free space and spatial concepts. See Table 3 for quantitative evaluations.

2. **指点：** 给定任意自然语言描述，模型能指向显式实体，如物体和物体部件，也能指向隐式概念，如可供性（在哪里抓，放在哪里），空闲区域和空间概念。定量评估见表 3。

3. **Trajectory Prediction:** Gemini 2.0 can leverage its pointing capabilities to produce 2D motion trajectories that are grounded in its observations. Trajectories can be based, for instance, on a description of the physical motion or interaction.

3. **轨迹预测：** Gemini 2.0 能借助指点能力生成落在观察上的 2D 运动轨迹。轨迹可以依据对物理运动或交互的描述来生成。

4. **Grasp Prediction:** This is a new feature introduced in Gemini Robotics-ER. It extends Gemini 2.0’s pointing capabilities to predict top-down grasps.

4. **抓取预测：** 这是 Gemini Robotics-ER 新加的功能，它把 Gemini 2.0 的指点能力扩展到预测俯视抓取。

Gemini 2.0 is also capable of 3D spatial reasoning (Chen et al., 2024; Hwang et al., 2024). With the ability to “see in 3D”，Gemini 2.0 can better understand concepts like sizes, distances, and orientations, and it can leverage such understanding to reason about the state of the scene and actions to perform.

Gemini 2.0 也能做 3D 空间推理（Chen et al., 2024; Hwang et al., 2024）。能 「看出 3D」 以后，Gemini 2.0 能更好地理解尺寸，距离和朝向这些概念，并据此推理场景状态和要执行的动作。

1. **Multi-View Correspondence:** A natural way of representing 3D information with images is through multi-view (e.g., stereo) images. Gemini 2.0 can understand 3D scenes from multi-view images and predict 2D point correspondences across multiple camera views of the same scene.

1. **多视角对应：** 用图像表示 3D 信息的一种自然方式是多视角图像（如双目图像）。Gemini 2.0 能从多视角图像理解 3D 场景，并预测同一场景多个相机视角之间的 2D 点对应。

2. **3D Bounding Box Detection:** This 3D understanding applies to single images as well - Gemini 2.0 can directly predict metric 3D bounding boxes from monocular images. Like 2D Detection and Pointing capabilities, Gemini 2.0 can detect objects by open-vocabulary descriptions.

2. **3D 边界框检测：** 这种 3D 理解对单张图像也适用：Gemini 2.0 能直接从单目图像预测带真实尺度的 3D 边界框。和 2D 检测与指点一样，Gemini 2.0 能按开放词表描述检测物体。

<!-- page 7 of 64 -->

![Image block](images/p07-image.png)

![Image block](images/p07-image-2.png)

![Image block](images/p07-figure-6-2d-detection-examples-with-gemini-2-0-flash.png)

Figure 6 | 2D Detection examples with Gemini 2.0 Flash. Left: detect by object category. Middle: detect by spatial description. Right: detect by affordance. Predicted object labels are not shown for left and middle images to reduce visual clutter.

图 6: Gemini 2.0 Flash 的 2D 检测示例。左：按物体类别检测。中：按空间描述检测。右：按可供性检测。为减少视觉干扰，左图和中图没有显示预测的物体标签。

![Image block](images/p07-figure-7-gemini-2-0-can-predict-2d-points-from-natural.png)

Figure 7 | Gemini 2.0 can predict 2D points from natural language queries. Examples are obtained with Gemini 2.0 Flash. Predicted point labels are not visualized.

图 7: Gemini 2.0 能根据自然语言查询预测 2D 点。示例来自 Gemini 2.0 Flash，预测点的标签没有画出。

While it is possible to create expert models for each of these tasks individually, fusing them in a single foundation model, such as Gemini 2.0, allows the model to perform embodied reasoning tasks with open-world natural language instructions, respond to feedback and sustain multi-turn interactions. In particular, Gemini 2.0 can combine scene understanding with reasoning to solve more complex tasks, such as writing robot code (see Section 2.3).

虽然可以给每项任务单独造一个专家模型，但把它们融进 Gemini 2.0 这样的单一基础模型，模型就能按开放世界的自然语言指令做具身推理任务，能回应反馈，也能维持多轮交互。尤其是，Gemini 2.0 能把场景理解和推理结合起来解决更复杂的任务，比如写机器人代码（见 2.3 节）。

Below we present detailed quantitative and qualitative evaluations of these capabilities with Gemini 2.0 models (Flash, and Pro Experimental), as well as comparisons with other VLMs where appropriate. For some capabilities, we also present results on Gemini Robotics-ER. You can find code and prompt examples on how to prompt Gemini 2.0 to elicit these capabilities [here](https://colab.sandbox.google.com/github/google-gemini/cookbook/blob/main/examples/Spatial_understanding_3d.ipynb).

下面用 Gemini 2.0 模型（Flash 和 Pro Experimental）对这些能力做详细的定量和定性评估，并在合适时和其他 VLM 对比。对部分能力，我们也给出 Gemini Robotics-ER 的结果。如何提示 Gemini 2.0 引出这些能力，代码和提示示例见上面的链接。

**Object Detection.** Gemini 2.0 can predict 2D object bounding boxes from natural language queries. In Fig. 6, we show multiple 2D detection examples with Gemini 2.0 Flash on images that a robot might see. Gemini 2.0 represents 2D bounding boxes with the convention 𝑦<sub>0</sub>, 𝑥0, 𝑦<sub>1</sub>, 𝑥<sub>1</sub>. We can prompt Gemini 2.0 to detect everything in a scene (examples in Fig. 2). The model can also detect specific objects by their descriptions — for example，“detect all the kitchenware” in Fig. 6. These descriptions can contain spatial cues as well — “detecting nuts on the right side of the image” in the middle example. Finally, we can prompt Gemini 2.0 to detect objects by their affordances. In the right example of Fig. 6, we ask Gemini 2.0 to detect the spill and “what can be used to clean it up”。Gemini 2.0 is able to detect both the spill and the towel, without being specified explicitly. These examples showcase the benefit of combining precise localization capabilities with general-purpose VLMs, where

**物体检测。** Gemini 2.0 能根据自然语言查询预测 2D 物体边界框。图 6 给出 Gemini 2.0 Flash 在机器人可能看到的图像上的多个 2D 检测示例。Gemini 2.0 用 y0，x0，y1，x1 的约定表示 2D 边界框。可以让 Gemini 2.0 检测场景里的所有东西（示例见图 2）。模型也能按描述检测特定物体，例如图 6 中的 「detect all the kitchenware」（检测所有厨具）。描述里还可以带空间线索，例如中间那张图的 「检测图像右侧的坚果」。最后，还可以让 Gemini 2.0 按可供性检测物体。在图 6 右边的例子里，我们让 Gemini 2.0 检测洒出来的液体以及 「可以用来清理它的东西」。Gemini 2.0 在没有被明确指定的情况下，同时检出了洒出的液体和毛巾。这些例子说明了把精确定位能力和通用 VLM 结合的好处：

<!-- page 8 of 64 -->

Point to the blue brush and a list of points covering the region of particles

Point to the right hand and the handles of the scissor … and a trajectory of 5 points from the right hand to the handles of the scissor

图 8 中两条提示：指向蓝色刷子，再给出覆盖碎屑区域的一串点；指向右手和剪刀把手，再给出一条从右手到剪刀把手的 5 点轨迹。

<table><tr><td rowspan="2">Benchmark</td><td colspan="3">Gemini</td><td colspan="2">GPT</td><td>Claude</td><td colspan="2">Molmo</td></tr><tr><td>Gemini Robotics-ER</td><td>2.0 Flash</td><td>2.0 Pro Experimental</td><td>4o-mini</td><td>4o</td><td>3.5 Sonnet</td><td>7B-D</td><td>72B</td></tr><tr><td>Paco-LVIS</td><td>71.3</td><td>46.1</td><td>45.5</td><td>11.8</td><td>16.2</td><td>12.4</td><td>45.4</td><td>47.1</td></tr><tr><td>Pixmo-Point</td><td>49.5</td><td>25.8</td><td>20.9</td><td>5.9</td><td>5.0</td><td>7.2</td><td>14.7</td><td>12.5</td></tr><tr><td>Where2Place</td><td>45.0</td><td>33.8</td><td>38.8</td><td>13.8</td><td>20.6</td><td>16.2</td><td>45</td><td>63.8</td></tr></table>

Table 3 | 2D Pointing Benchmarks evaluating open-vocabulary pointing capabilities. Scores are accuracies (1 if predicted point is within the ground truth region mask, 0 otherwise).

表 3：评估开放词表指点能力的 2D 指点基准。分数是准确率（预测点落在真值区域掩码内记 1，否则记 0）。列依次是 Gemini Robotics-ER, Gemini 2.0 Flash, 2.0 Pro Experimental, GPT-4o-mini, GPT-4o, Claude 3.5 Sonnet, Molmo 7B-D, Molmo 72B. Paco-LVIS: 71.3, 46.1, 45.5, 11.8, 16.2, 12.4, 45.4, 47.1. Pixmo-Point: 49.5, 25.8, 20.9, 5.9, 5.0, 7.2, 14.7, 12.5. Where2Place: 45.0, 33.8, 38.8, 13.8, 20.6, 16.2, 45, 63.8.

![Image block](images/p08-image.png)

![Image block](images/p08-image-2.png)

![Image block](images/p08-figure-8-gemini-2-0-can-predict-2d-trajectories-by.png)

Figure 8 | Gemini 2.0 can predict 2D trajectories by first predicting start and end points. Examples are obtained with Gemini 2.0 Flash. Predicted point labels are not visualized.

图 8: Gemini 2.0 先预测起点和终点，再预测 2D 轨迹。示例来自 Gemini 2.0 Flash，预测点的标签没有画出。

Gemini’s open-vocabulary and open-world reasoning enables a level of semantic generalization that is difficult to achieve with special-purpose expert models.

Gemini 的开放词表，开放世界推理带来的语义泛化，是专用专家模型很难做到的。

**2D Pointing.** For some use cases, points can offer a more flexible and precise representation for image understanding and robot control than bounding boxes. We illustrate Gemini 2.0’s pointing capabilities in various robot manipulation scenes (Fig. 7). The model represents points as 𝑦, 𝑥 tuples. Similar to 2D object detection, Gemini 2.0 can point to any object described by open-vocabulary language. Gemini 2.0 can localize not only entire objects, but also object parts, such as a spoon handle (Fig. 7, left). Additionally, Gemini 2.0 can point to spatial concepts, e.g., an “empty area on the table left of the pan”（Fig. 7, left）or “where a new can should be placed following the pattern of the existing eight cans”（Fig. 7, middle）。It can also infer affordances; for example, when asked to “point to where a human would grasp this to pick it up”，the model correctly identifies the mug handle (Fig. 7, right).

**2D 指点。** 在一些用途里，点比边界框更灵活，更精确，适合图像理解和机器人控制。图 7 展示 Gemini 2.0 在多种机器人操作场景中的指点能力。模型用（y, x）元组表示点。和 2D 物体检测一样，Gemini 2.0 能指向任何用开放词表描述的物体。它不仅能定位整个物体，还能定位物体部件，比如勺柄（图 7 左）。此外，Gemini 2.0 能指向空间概念，比如 「桌上锅左边的空处」（图 7 左），或 「按现有八个罐子的排列规律，新罐子应该放在哪里」（图 7 中）。它还能推断可供性：被要求 「指向人拿起它时会抓的位置」 时，模型正确找到了杯子把手（图 7 右）。

We quantitatively evaluate Gemini 2.0’s pointing performance in Table 3 using three benchmarks: Paco-LVIS (Ramanathan et al., 2023) for object part pointing on natural images, Pixmo-Point (Deitke et al., 2024) for open-vocabulary pointing on web images, and Where2place (Yuan et al., 2024) for free-space pointing in indoor scenes. See Appendix B.2 for details on how we benchmark pointing against other models. Gemini 2.0 significantly outperforms state-of-the-art vision-language models (VLMs) like GPT and Claude. Gemini Robotics-ER surpasses Molmo, a specialized pointing VLM, in two of the three subtasks.

表 3 用三个基准定量评估 Gemini 2.0 的指点表现：Paco-LVIS (Ramanathan et al., 2023) 测自然图像上的物体部件指点，Pixmo-Point (Deitke et al., 2024) 测网页图像上的开放词表指点，Where2place (Yuan et al., 2024) 测室内场景中的空闲区域指点。和其他模型对比的具体做法见附录 B.2. Gemini 2.0 明显超过 GPT 和 Claude 这些最先进的 VLM. Gemini Robotics-ER 在三个子任务中的两个上超过专做指点的 VLM Molmo。

**2D Trajectories.** Gemini 2.0 can leverage its pointing capabilities to predict 2D trajectories that connect multiple points together. While Gemini 2.0 cannot perform complex motion planning (e.g., to avoid obstacles), it can still generate useful trajectories that are grounded in the observed images. We showcase some examples in Fig. 8. In the left and middle images, Gemini 2.0 interpolates a

**2D 轨迹。** Gemini 2.0 能借助指点能力预测把多个点连起来的 2D 轨迹。Gemini 2.0 做不了复杂的运动规划（比如避障），但仍能生成落在观察图像上的有用轨迹。图 8 给出一些例子。在左图和中图里，Gemini 2.0 插值出一条

<!-- page 9 of 64 -->

Find the grasp points and grasp angles on the stapler handle, tape roll, finger holes of the scissors, dark blue pen, rim of the black square tray.

图 9 中的提示：找出订书机把手，胶带卷，剪刀指孔，深蓝色笔，黑色方托盘边沿上的抓取点和抓取角度。

![Image block](images/p09-figure-9-gemini-robotics-er-can-predict-top-down-grasps.png)

Figure 9 | Gemini Robotics-ER can predict top-down grasps by leveraging Gemini 2.0’s 2D pointing capability. Examples are obtained with Gemini Robotics-ER.

图 9: Gemini Robotics-ER 借助 Gemini 2.0 的 2D 指点能力预测俯视抓取。示例来自 Gemini Robotics-ER。

reasonable trajectory from a human hand in the ego-centric video to a tool that it may grasp. In the right image, Gemini 2.0 predicts a series of waypoints that, if followed by the robot gripper, would wipe the spilled area of a tray. Gemini 2.0’s trajectory prediction capabilities exhibit world knowledge about motion and dynamics which is a fundamental capability for robotics. We capitalize on these nascent trajectory understanding capabilities to tie actions to vision and language capabilities in a much stronger fashion in Section 4.2.

合理的轨迹，从第一人称视频里的人手连到它可能要抓的工具。在右图里，Gemini 2.0 预测出一串路径点，机器人夹爪沿着走一遍，就能擦过托盘上洒了东西的区域。Gemini 2.0 的轨迹预测能力体现了关于运动和动力学的世界知识，这是机器人的基本能力。4.2 节会利用这种初步的轨迹理解能力，把动作和视觉，语言能力更紧地绑在一起。

**Top-Down Grasps.** Gemini 2.0’s semantic pointing capabilities can be naturally extended to top-down grasping poses, represented as 𝑦, 𝑥, and a rotation angle 𝜃. This capability is further improved in Gemini Robotics-ER, as shown in Fig. 9. For example, we can prompt for a grasp either on the stem of the banana or the center of the banana (right image). We show how such grasp predictions can be directly used for downstream robot control on real robots in Section 2.3.

**俯视抓取。** Gemini 2.0 的语义指点能力可以自然地扩展到俯视抓取位姿，用 y，x 和一个旋转角 θ 表示。这项能力在 Gemini Robotics-ER 中进一步增强，见图 9。例如，可以要求抓香蕉柄，也可以要求抓香蕉中部（右图）。2.3 节展示这种抓取预测如何直接用于真实机器人的下游控制。

**Multi-view Correspondence.** Gemini can also understand the 3D structure of the world. One example is its ability to understand a 3D scene from multiple views. For instance, with an initial image annotated with a list of points and a new image of the same scene from a different view, we can ask Gemini 2.0 which of the points from the initial image are still visible in the second image and we can query the coordinates of those points. From the examples in Fig. 10, we observe that Gemini 2.0 can perform multi-view correspondence across dramatically different views. In the top image pair, the model correctly predicts that the red point refers to an object held by the human in these egocentric images, even though the view of the rest of the scene has changed significantly. In the bottom image pair, the model correctly predicts that the orange point is not visible in the second image. Such multi-view understanding is useful for robotics domains where a robot can use Gemini 2.0 to reason about multiple image streams (e.g., stereo views, head and wrist views) to better understand the 3D spatial relationships of its observations.

**多视角对应。** Gemini 也能理解世界的 3D 结构，一个例子是从多个视角理解 3D 场景。比如，给一张标了若干点的初始图，再给同一场景另一视角的新图，可以问 Gemini 2.0 初始图里哪些点在第二张图中仍然可见，并查询这些点的坐标。从图 10 的例子看，Gemini 2.0 能在差别很大的视角之间做多视角对应。在上面一对图中，场景其他部分的视角变化很大，模型仍正确判断红点指的是第一人称画面里人手中拿着的物体。在下面一对图中，模型正确判断橙点在第二张图中不可见。这种多视角理解对机器人很有用：机器人可以用 Gemini 2.0 推理多路图像流（如双目视角，头部和手腕视角），更好地理解观察到的 3D 空间关系。

**3D Detection.** Gemini 2.0 can also predict metric 3D bounding boxes from single images. Similar to its 2D detection capabilities, Gemini 2.0’s 3D detection capability is also open-vocabulary, as illustrated in Fig. 11. In Table 4, we report Gemini 2.0’s 3D detection performance using SUN-RGBD (Song et al., 2015), a popular dataset and benchmark for 3D object detection and scene understanding, and compare it with baseline expert models (ImVoxelNet (Rukhovich et al., 2022), Implicit3D (Zhang et al., 2021), and Total3DUnderstanding (Nie et al., 2020)). Gemini 2.0’s 3D detection performance is comparable to existing state-of-the-art expert models, with Gemini Robotics-ER achieving a new state of-the-art on the SUN-RGBD benchmark. While these baselines work with a closed set of categories, Gemini allows for open-vocabulary queries.

**3D 检测。** Gemini 2.0 还能从单张图像预测带真实尺度的 3D 边界框。和 2D 检测一样，它的 3D 检测也是开放词表的，见图 11。表 4 报告 Gemini 2.0 在 SUN-RGBD (Song et al., 2015) 上的 3D 检测成绩，这是 3D 物体检测和场景理解的常用数据集与基准，并和几个专家基线模型对比：ImVoxelNet (Rukhovich et al., 2022), Implicit3D (Zhang et al., 2021) 和 Total3DUnderstanding (Nie et al., 2020). Gemini 2.0 的 3D 检测成绩和现有最先进的专家模型相当，Gemini Robotics-ER 在 SUN-RGBD 上创了新的最先进。这些基线只能处理封闭的类别集合，Gemini 则支持开放词表查询。

<!-- page 10 of 64 -->

<table><tbody><tr><td colspan="4">Gemini</td><td colspan="3">Specialized Expert Models</td></tr><tr><td>Benchmark</td><td>Gemini Robotics-ER</td><td>2.0 Flash</td><td>2.0 Pro Experimental</td><td>ImVoxelNet</td><td>Implicit3D</td><td>Total3DU</td></tr><tr><td>SUN-RGBD AP@15</td><td>48.3</td><td>30.7</td><td>32.5</td><td>43.7<sup>*</sup></td><td>24.1</td><td>14.3</td></tr></tbody></table>

Table 4 | Gemini Robotics-ER achieves a new state-of-the-art performance on the SUN-RGBD 3D object detection benchmark. (\* ImVoxelNet (Rukhovich et al., 2022) performance measured on an easier set of 10 categories).

表 4: Gemini Robotics-ER 在 SUN-RGBD 3D 物体检测基准上达到新的最先进。指标是 AP@15. Gemini Robotics-ER 48.3, 2.0 Flash 30.7, 2.0 Pro Experimental 32.5；专家模型 ImVoxelNet 43.7*, Implicit3D 24.1, Total3DU 14.3. (* ImVoxelNet (Rukhovich et al., 2022) 的成绩是在一个更容易的 10 类子集上测的。)

> **看表：** 48.3 对 43.7 的 「新最先进」，两边测的是同一套类别吗？
> 不是。表 4 的星号注明 ImVoxelNet 的 43.7 是在更容易的 10 类子集上测的，Gemini 三列用的类别集合正文没有写。能和 Gemini 同口径比的只剩 Implicit3D 的 24.1 和 Total3DU 的 14.3，这两个连 2.0 Flash 的 30.7 都不到。另外同一张表里 2.0 Flash 到 Robotics-ER 从 30.7 升到 48.3，这是 ER 训练带来的变化里最大的一格，但报告没有说 ER 的训练数据里有没有 SUN-RGBD 或同源的室内 3D 标注。

![Image block](images/p10-figure-10-gemini-2-0-can-understand-3d-scenes-by.png)

Figure 10 | Gemini 2.0 can understand 3D scenes by correlating 2D points across different views. For each image pair, the left image with the point coordinates and the right image without coordinates are given, and the model predicts which of the labeled points in the left image are visible in the right image, as well as the coordinates of the visible points in the right image. Examples are obtained with Gemini 2.0 Flash.

图 10: Gemini 2.0 通过在不同视角间关联 2D 点来理解 3D 场景。每对图中，左图带点坐标，右图不带坐标，模型预测左图中哪些已标注的点在右图中可见，以及这些可见点在右图中的坐标。示例来自 Gemini 2.0 Flash。

Find the 3D bounding boxes of sugar bowl, sugar jar, wooden salt shaker, knifes, spill, towel.

图 11 第一条提示：找出糖碗，糖罐，木制盐瓶，刀，洒出物，毛巾的 3D 边界框。

![Image block](images/p10-detect-the-3d-bounding-boxes-of-blender-toaster.png)

Detect the 3D bounding boxes of blender, toaster, curtains, sink, range hood, stove.

第二条提示：检测搅拌机，烤面包机，窗帘，水槽，抽油烟机，灶台的 3D 边界框。

![Image block](images/p10-detect-the-3d-bounding-boxes-of-stove-top-toy-sink-ice.png)

Detect the 3D bounding boxes of stove top, toy sink, ice cream, pepper, carrot.

第三条提示：检测灶面，玩具水槽，冰淇淋，辣椒，胡萝卜的 3D 边界框。

![Image block](images/p10-figure-11-gemini-2-0-can-directly-predict-open.png)

Figure 11 | Gemini 2.0 can directly predict open-vocabulary 3D object bounding boxes. Examples are obtained with Gemini 2.0 Flash.

图 11: Gemini 2.0 能直接预测开放词表的 3D 物体边界框。示例来自 Gemini 2.0 Flash。

<!-- page 11 of 64 -->

## 2.3. Gemini 2.0 Enables Zero and Few-Shot Robot Control

**2.3 Gemini 2.0 支持零样本和少样本机器人控制**

Gemini 2.0’s embodied reasoning capabilities make it possible to control a robot without it ever having been trained with any robot action data. It can perform all the necessary steps, perception, state estimation, spatial reasoning, planning and control, out of the box. Whereas previous work needed to compose multiple models to this end (Ahn et al., 2022; Kwon et al., 2024; Liang et al., 2023; Vemprala et al., 2023), Gemini 2.0 unites all required capabilities in a single model.

有了具身推理能力，Gemini 2.0 在从没用任何机器人动作数据训练过的情况下，也能控制机器人。它开箱就能完成所有必要步骤：感知，状态估计，空间推理，规划和控制。以前的工作要把多个模型组合起来才能做到（Ahn et al., 2022; Kwon et al., 2024; Liang et al., 2023; Vemprala et al., 2023），Gemini 2.0 把所需能力都装进一个模型。

Below we study two distinct approaches: zero-shot robot control via code generation, and fewshot control via in-context learning (also denoted as “ICL” below) - where we condition the model on a handful of in-context demonstrations for a new behavior. Gemini Robotics-ER achieves good performance across a range of different tasks in both settings, and we find that especially zeroshot robot control performance is strongly correlated with better embodied understanding: Gemini Robotics-ER, which has received more comprehensive training to this end, improves task completion by almost 2x compared to Gemini 2.0.

下面研究两种不同做法：通过代码生成做零样本机器人控制，以及通过上下文学习（下文也记作 「ICL」）做少样本控制，后者是用几条上下文示范让模型学会一个新行为。Gemini Robotics-ER 在两种设置下的多种任务上都表现不错。我们发现，零样本控制的成绩尤其和更好的具身理解强相关：为此接受过更全面训练的 Gemini Robotics-ER，任务完成率比 Gemini 2.0 高了将近一倍。

> **拆开：** 「将近 2 倍」 是在哪一格上算出来的？
> 按表 5 把七个任务相加：2.0 Flash 零样本是 34+54+46+24+26+4+0=188，除以 7 得 26.9，表中写 27；Robotics-ER 零样本是 372，除以 7 得 53.1，表中写 53. 53/27 约 1.96，这就是 「将近 2 倍」。它只在仿真，零样本这一行成立。同一张表的 ICL 行是 51 对 65，只有约 1.27 倍。表 6 的真实机器人实验只列了 Robotics-ER，没有 2.0 Flash 一行，所以真实环境里的倍数本文没有给。

**Zero-shot Control via Code Generation.** To test Gemini 2.0’s zero-shot control capabilities, we combine its innate ability to generate code with the embodied reasoning capabilities described in Section 2.2. We conduct experiments on a bimanual ALOHA 2 (Team et al., 2024; Zhao et al., 2025) robot. To control the robot, Gemini 2.0 has access to an API (Arenas et al., 2023; Kwon et al., 2024; Liang et al., 2023) that can move each gripper to a specified pose, open and close each gripper, and provide a readout of the current robot state. The API also provides functions for perception; no external models are called, instead Gemini 2.0 itself detects object bounding boxes, points on objects, and generates the top down grasp pose as described in Section 2.2.

**通过代码生成做零样本控制。** 为了测试 Gemini 2.0 的零样本控制能力，我们把它自带的代码生成能力和 2.2 节的具身推理能力结合起来。实验在双臂 ALOHA 2 机器人（Team et al., 2024; Zhao et al., 2025）上进行。为了控制机器人，Gemini 2.0 可以调用一个 API (Arenas et al., 2023; Kwon et al., 2024; Liang et al., 2023)：把每个夹爪移到指定位姿，打开或闭合每个夹爪，读出当前机器人状态。API 也提供感知函数，但不调用外部模型，而是由 Gemini 2.0 自己检测物体边界框，在物体上指点，并按 2.2 节的方式生成俯视抓取位姿。

During an episode, Gemini 2.0 is initially passed a system prompt, a description of the robot API, and the task instructions. Then Gemini 2.0 iteratively takes in images that show the current state of the scene, the robot state, and execution feedback, and outputs code that is executed in the environment to control the robot. The generated code uses the API to understand the scene and move the robot and the execution loop allows Gemini 2.0 to react and replan when necessary (e.g., Fig. 34). An overview of the API and episodic control flow is given in Fig. 12.

在一个回合中，Gemini 2.0 首先收到系统提示，机器人 API 的说明和任务指令。之后它反复接收显示场景当前状态的图像，机器人状态和执行反馈，输出在环境中执行的代码来控制机器人。生成的代码通过 API 理解场景，移动机器人；这个执行循环让 Gemini 2.0 在必要时能反应并重新规划（例如图 34）。API 和回合内控制流程的概览见图 12。

![Image block](images/p11-figure-12-overview-of-the-perception-and-control-apis.png)

Figure 12 | Overview of the perception and control APIs, and agentic orchestration during an episode. This system is used for zero-shot control.

图 12：感知和控制 API 概览，以及一个回合中的智能体式编排。这套系统用于零样本控制。

Table 5 presents results across a set of manipulation tasks in simulation. These tasks were chosen

表 5 给出一组仿真操作任务上的结果。这些任务的选取

<!-- page 12 of 64 -->

to capture performance across a spectrum of difficulty and objects: from simple grasping (lift a banana) to long horizon multi-step, multi-task manipulation (put a toy in a box and close the box). See Appendix B.3.1 for full descriptions. Gemini 2.0 Flash succeeds on average 27% of the time, although it can be as high as 54% for easier tasks. Gemini Robotics-ER, performs almost twice as well as 2.0 Flash, successfully completing 53% of the tasks on average. The enhanced embodied reasoning capabilities of the Gemini Robotics-ER model have clearly benefited the downstream robotic tasks.

是为了覆盖不同难度和物体：从简单抓取（举起香蕉）到长时程，多步骤，多任务的操作（把玩具放进盒子并合上盒子）。完整说明见附录 B.3.1. Gemini 2.0 Flash 的平均成功率是 27%，较容易的任务能到 54%. Gemini Robotics-ER 的表现差不多是 2.0 Flash 的两倍，平均完成 53% 的任务。Gemini Robotics-ER 增强的具身推理能力明显帮到了下游机器人任务。

<table><tbody><tr><td colspan="3">System</td><td colspan="7">Sim Task Success Rate (%)</td></tr><tr><td>Model</td><td>Context</td><td>Avg.</td><td>Banana Lift</td><td>Banana in Bowl</td><td>Mug on Plate</td><td>Bowl on Rack</td><td>Banana Handover</td><td>Fruit Bowl</td><td>Pack Toy</td></tr><tr><td>2.0 Flash</td><td>Zero-shot</td><td>27</td><td>34</td><td>54</td><td>46</td><td>24</td><td>26</td><td>4</td><td>0</td></tr><tr><td>Gemini Robotics-ER</td><td>Zero-shot</td><td>53</td><td>86</td><td>84</td><td>72</td><td>60</td><td>54</td><td>16</td><td>0</td></tr><tr><td>2.0 Flash</td><td>ICL</td><td>51</td><td>94</td><td>90</td><td>36</td><td>16</td><td>94</td><td>0</td><td>26</td></tr><tr><td>Gemini Robotics-ER</td><td>ICL</td><td>65</td><td>96</td><td>96</td><td>74</td><td>36</td><td>96</td><td>4</td><td>54</td></tr></tbody></table>

Table 5 | Success rates on the ALOHA 2 Sim Task suite. Reported numbers are the average success rate over 50 trials with random initial conditions.

表 5: ALOHA 2 仿真任务集上的成功率（%），每个数是 50 次随机初始条件试验的平均成功率。列依次是平均，Banana Lift（举起香蕉），Banana in Bowl（香蕉放进碗），Mug on Plate（杯子放上盘子），Bowl on Rack（碗放上架子），Banana Handover（香蕉换手），Fruit Bowl（水果放进碗），Pack Toy（装玩具）。2.0 Flash 零样本：27, 34, 54, 46, 24, 26, 4, 0. Gemini Robotics-ER 零样本：53, 86, 84, 72, 60, 54, 16, 0. 2.0 Flash ICL: 51, 94, 90, 36, 16, 94, 0, 26. Gemini Robotics-ER ICL: 65, 96, 96, 74, 36, 96, 4, 54.

Table 6 shows results on a real ALOHA 2 robot. The success rate for banana handover is lower compared to simulation due to calibration imperfections and other sources of noise in the real world. For a harder and more dexterous task: Gemini Robotics-ER is currently unable to perform dress folding, mostly due to its inability to generate precise enough grasps.

表 6 给出真实 ALOHA 2 机器人上的结果。由于标定不完美和真实世界的其他噪声，香蕉换手的成功率比仿真低。对更难，更要求灵巧的任务，Gemini Robotics-ER 目前还不会叠裙子，主要原因是它生成的抓取不够精确。

<table><tr><td></td><td colspan="4">Real Task Success Rate (%)</td></tr><tr><td>Context</td><td>Avg.</td><td>Banana Handover</td><td>Fold Dress</td><td>Wiping</td></tr><tr><td>Zero-shot</td><td>25</td><td>30</td><td>0</td><td>44</td></tr><tr><td>ICL</td><td>65</td><td>70</td><td>56</td><td>67</td></tr></table>

Table 6 | Real world success rates of Gemini Robotics-ER on ALOHA 2 tasks. Reported rates are the average over 10 trials for banana handover and 9 for fold dress and wiping. For tasks that require dexterous motions, the zero-shot success rate is not high, but they will be significantly improved in the Gemini Robotics model (Sec. 3).

表 6: Gemini Robotics-ER 在真实 ALOHA 2 任务上的成功率（%）。列依次是平均，香蕉换手，叠裙子，擦拭。零样本：25, 30, 0, 44. ICL: 65, 70, 56, 67。香蕉换手取 10 次试验的平均，叠裙子和擦拭取 9 次。对需要灵巧动作的任务，零样本成功率不高，但在 Gemini Robotics 模型（第 3 节）中会大幅提高。

> **对一下：** ICL 一行的平均 65，用三格数字算得出来吗？
> 算不出来。按表注的试验次数还原：香蕉换手 70% 是 7/10，叠裙子 56% 是 5/9，擦拭 67% 是 6/9。三格直接平均是 64.3，用未取整的比例平均是 64.1，按总次数合并是 18/28=64.3，都不到 65。零样本那一行用同样三种算法都得 25 左右（3/10, 0/9, 4/9），和表中一致。正文 「在仿真和真实世界都达到 65%」 这句，仿真的 65 来自表 5 (456/7=65.1)，真实的 65 比表内三格能推出的数高了约 1 个点。

**Few-shot control via in-context examples.** The previous results demonstrated how Gemini Robotics ER can be effectively used to tackle a series of tasks entirely zero-shot. However, some dexterous manipulation tasks are beyond Gemini 2.0’s current ability to perform zero-shot. Motivated by such cases, we demonstrate that the model can be conditioned on a handful of in-context demonstrations, and can then immediately emulate those behaviors. Instead of generating code, as in the previous examples, we instead prompt the model to generate trajectories of end-effectors poses directly, following the examples in the demonstrations.

**通过上下文示例做少样本控制。** 前面的结果说明 Gemini Robotics-ER 可以完全零样本地完成一系列任务。但有些灵巧操作任务超出了 Gemini 2.0 目前的零样本能力。针对这类情况，我们展示：给模型几条上下文示范，它就能立刻模仿这些行为。这次不像前面那样生成代码，而是让模型照着示范中的例子，直接生成末端执行器位姿的轨迹。

We extend the method proposed in (Di Palo and Johns, 2024), which translates 𝑘 teleoperated trajectories of robot actions into a list of objects and end-effectors poses, tokenizing them as text and adding them to the prompt (Fig. 13). Thanks to the embodied reasoning abilities of Gemini Robotics-ER, we do not need any external models to extract visual keypoints and object poses (as was done in the referenced work); Gemini Robotics-ER can do this itself. In addition to observations and actions, we interleave descriptions of the performed actions in language that elicits reasoning at inference time in the model. The model emulates the natural language reasoning from the in-context trajectories and becomes better at, for example, understanding which arm to use when, or more accurately predicting where to interact with objects. One advantage of using a large multimodal model

我们扩展了（Di Palo and Johns, 2024）的方法：把 k 条遥操作得到的机器人动作轨迹转换成物体列表和末端执行器位姿列表，以文本形式切分成 token 放进提示（图 13）。得益于 Gemini Robotics-ER 的具身推理能力，我们不需要外部模型来提取视觉关键点和物体位姿（参考工作里是这样做的），Gemini Robotics-ER 自己就能做。除了观察和动作，我们还穿插用语言描述已执行的动作，这会在推理阶段引出模型的推理。模型模仿上下文轨迹中的自然语言推理，于是在一些方面做得更好，比如判断什么时候用哪只手臂，或者更准确地预测该在物体的什么位置交互。使用大型多模态模型的一个好处

<!-- page 13 of 64 -->

![Image block](images/p13-figure-13-overview-of-few-shot-in-context-learning.png)

Figure 13 | Overview of few-shot in-context learning pipeline. Gemini can receive observations, language instructions and trajectories in the prompt, and generate new language reasoning and trajectories for unseen instances of the tasks.

图 13：少样本上下文学习流程概览。Gemini 可以在提示中接收观察，语言指令和轨迹，并为任务中没见过的实例生成新的语言推理和轨迹。

is the ability to condition its behavior on observations, actions and language, with the combination of all outperforming any modality in isolation.

是可以同时以观察，动作和语言为条件，三者合用比单用任何一种都好。

The results using this approach (with 10 demonstrations) are shown in Table 5 and Table 6. Both Gemini 2.0 Flash and Gemini Robotics-ER are able to effectively use demonstrations entirely in-context to improve performance. Gemini 2.0 Flash’s performance reaches 51% in simulation, and Gemini Robotics-ER achieves 65% in both simulation and the real world. Most of the performance improvements with respect to the zero-shot code generation approach comes from more dexterous tasks, like handover of objects, folding a dress, or packing a toy, where demonstrations can condition the model to output more precise, bimanual trajectories.

用这种方法（10 条示范）的结果见表 5 和表 6. Gemini 2.0 Flash 和 Gemini Robotics-ER 都能完全在上下文中有效利用示范来提高成绩。Gemini 2.0 Flash 在仿真中达到 51%，Gemini Robotics-ER 在仿真和真实世界中都达到 65%。相对零样本代码生成的提升，大部分来自更灵巧的任务，比如物体换手，叠裙子或装玩具，示范能让模型输出更精确的双臂轨迹。

This set of experiments suggests that Gemini 2.0 Flash and its ER enhanced variant, Gemini Robotics-ER, can be used directly to control robots, as a perception module (e.g., object detection), a planning module (e.g., trajectory generation), and/or to orchestrate robot movements by generating and executing code. It also shows strong correlation between the model performance of embodied reasoning capabilities and the downstream robotic control. At the same time, our experiments demonstrate that the model is also able to tap into the power of in-context learning to learn from just a few demonstrations and boost performance on more dexterous and bimanual tasks, such as folding clothes, by directly outputting trajectories of end-effectors poses. However, as a VLM, there are inherent limitations for robot control, especially for more dexterous tasks, due to the intermediate steps needed to connect the model’s innate embodied reasoning capabilities to robotic actions. In the next section, we will introduce Gemini Robotics, an end-to-end Vision-Language-Action Model that enables more general-purpose and dexterous robot control.

这组实验表明，Gemini 2.0 Flash 及其 ER 增强版 Gemini Robotics-ER 可以直接用来控制机器人：当感知模块（如物体检测），当规划模块（如轨迹生成），或者通过生成并执行代码来编排机器人动作。实验也显示具身推理能力的成绩和下游机器人控制之间有强相关。同时，实验说明模型还能借助上下文学习，只用几条示范就学会，通过直接输出末端执行器位姿轨迹，提高叠衣服这类更灵巧的双臂任务的成绩。不过，作为 VLM，它在机器人控制上有固有的局限，灵巧任务尤其明显，因为要把模型自带的具身推理能力接到机器人动作上，中间需要若干步骤。下一节介绍 Gemini Robotics，一个端到端的视觉-语言-动作模型，能做更通用，更灵巧的机器人控制。

## 3. Robot Actions with Gemini Robotics

**3. 用 Gemini Robotics 输出机器人动作**

In this section, we present Gemini Robotics, a derivative of Gemini that has been fine-tuned to predict robot actions directly. Gemini Robotics is a general-purpose model capable of solving dexterous tasks in different environments and supporting different robot embodiments. We first study the model after training on a large and diverse dataset consisting of action-labeled robot data as well as other multimodal data. The resulting model can solve a large variety of short-horizon dexterous tasks out of the box (Section 3.2), closely follows natural language instructions (Section 3.3) and inherits Gemini Robotics-ER generalization capabilities, showing robustness to visual variations of the scene, object

本节介绍 Gemini Robotics，它是 Gemini 的一个衍生模型，经过微调后能直接预测机器人动作。Gemini Robotics 是通用模型，能在不同环境中完成灵巧任务，并支持不同的机器人机体。我们先研究它在一个大而多样的数据集上训练后的表现，数据集包括带动作标注的机器人数据和其他多模态数据。得到的模型开箱就能完成大量短时程灵巧任务（3.2 节），能紧跟自然语言指令（3.3 节），并继承 Gemini Robotics-ER 的泛化能力，对场景的视觉变化，物体

<!-- page 14 of 64 -->

![Image block](images/p14-figure-14-overview-of-the-architecture-input-and-output.png)

Figure 14 | Overview of the architecture, input and output of the Gemini Robotics model. Gemini Robotics is a derivative of Gemini fine-tuned to predict robot actions. The model ingests a multimodal prompt consisting of a set of images of the current status of the scene and a text instruction of the task to perform and it outputs action chunks that are executed by the robot. The model is made up of two components: a VLA backbone hosted in the cloud (Gemini Robotics backbone) and a local action decoder running on the robot’s onboard computer (Gemini Robotics decoder).

图 14: Gemini Robotics 模型的架构，输入和输出概览。Gemini Robotics 是经过微调，用来预测机器人动作的 Gemini 衍生模型。模型接收一个多模态提示，包括一组显示场景当前状态的图像和一条描述待执行任务的文本指令，输出由机器人执行的动作块。模型由两部分组成：托管在云端的 VLA 骨干（Gemini Robotics backbone），以及运行在机器人机载计算机上的本地动作解码器（Gemini Robotics decoder）。

positions and instances (Section 3.4). In Section 4, we further test the limits of Gemini Robotics, and specialize it to challenging highly dexterous long-horizon tasks (Section 4.1), and to more extreme generalization scenarios (Section 4.2). We also investigate rapid adaptation to novel dexterous tasks (Section 4.3) as well as adaptation to embodiments with completely new form factors, actions and observations (Section 4.4).

位置和实例的变化都表现稳健（3.4 节）。第 4 节进一步测试 Gemini Robotics 的极限：把它专精到有挑战的高灵巧长时程任务（4.1 节）和更极端的泛化场景（4.2 节）。我们还研究它对新灵巧任务的快速适配（4.3 节），以及对外形，动作和观察都全新的机体的适配（4.4 节）。

## 3.1. Gemini Robotics: Model and Data

**3.1 Gemini Robotics：模型和数据**

**Model.** Inference in large VLMs like Gemini Robotics-ER is often slow and requires special hardware. This can cause problems in the context of VLA models, since inference may not be feasible to be run onboard, and the resulting latency may be incompatible with real-time robot control. Gemini Robotics is designed to address these challenges. It consists of two components: a VLA backbone hosted in the cloud (Gemini Robotics backbone) and a local action decoder running on the robot’s onboard computer (Gemini Robotics decoder). The Gemini Robotics backbone is formed by a distilled version of Gemini Robotics-ER and its query-to-response latency has been optimized from seconds to under 160ms. The on-robot Gemini Robotics decoder compensates for the latency of the backbone. When the backbone and local decoder are combined, the end-to-end latency from raw observations to low-level action chunks is approximately 250ms. With multiple actions in the chunk (Zhao et al., 2023), the effective control frequency is 50Hz. The overall system not only produces smooth motions and reactive behaviors despite the latency of the backbone, but also retains the backbone’s generalization capabilities. An overview of our model architecture is available in Fig. 14.

**模型。** Gemini Robotics-ER 这类大型 VLM 的推理往往很慢，还需要专门硬件。这对 VLA 模型是个问题：推理可能没法在机器人本机上跑，带来的延迟也可能和实时机器人控制不相容。Gemini Robotics 就是为解决这些问题设计的。它由两部分组成：托管在云端的 VLA 骨干（Gemini Robotics backbone）和运行在机器人机载计算机上的本地动作解码器（Gemini Robotics decoder）。Gemini Robotics 骨干由 Gemini Robotics-ER 的蒸馏版构成，查询到响应的延迟从秒级优化到 160ms 以下。机器人上的 Gemini Robotics 解码器负责弥补骨干的延迟。骨干和本地解码器合起来，从原始观察到底层动作块的端到端延迟约 250ms。由于每个动作块里有多个动作（Zhao et al., 2023），有效控制频率是 50Hz。整个系统不仅在骨干有延迟的情况下仍能产生平滑的动作和及时的反应，还保留了骨干的泛化能力。模型架构概览见图 14。

> **想：** Gemini Robotics 和 Gemini Robotics-ER 是不是同一个检查点？
> 不是。把本文三处说法连起来是一条链：2.2 节说 Robotics-ER 是 「具身推理增强过的一版 Gemini 2.0 Flash」；本段说 Robotics 的云端骨干是 Robotics-ER 的蒸馏版；第 3 节开头又说 Robotics 是在带动作标注的机器人数据和其他多模态数据上微调出来的，外加一个本地解码器（图 14）。所以至少有三份不同的权重：2.0 Flash，Robotics-ER，以及蒸馏后再用动作数据训练的 Robotics 骨干。表 3，表 4，表 5 里的 「Gemini Robotics-ER」 是第二份；图 16 以后的 「Gemini Robotics」 是第三份。第 5 节又说对 Robotics-ER 做了安全监督微调和 ASIMOV 后训练，图 29 的 Robotics-ER 柱子和表 3 那一列是否同一份权重，本文没有交代。摘要 「Gemini Robotics 建在 Robotics-ER 之上」 应该按蒸馏加再训练来理解，不是共用一个检查点。

> **停一下：** 端到端 250ms 的延迟，怎么撑出 50Hz 的控制频率？
> 50Hz 的一步是 20ms。如果每 250ms 才拿到一个新动作块，一个块至少要装 250/20=12.5 步，也就是 13 步以上，机器人才不会在两次骨干响应之间停下来。本文只写了 「块里有多个动作」 并引了 Zhao et al.，2023，没有给块长，也没有说块与块之间是否重叠或做时间上的融合。图 14 画出本地解码器也直接接收机器人图像和状态，这说明解码器在两次云端响应之间还在用新观察修正动作，但解码器多大，用什么结构，本文没有写。

**Data.** We collected a large-scale teleoperated robot action dataset on a fleet of ALOHA 2 robots (Team et al., 2024; Zhao et al., 2025) over 12 months, which consists of thousands of hours of real-world expert robot demonstrations. This dataset contains thousands of diverse tasks, covering scenarios with varied manipulation skills, objects, task difficulties, episode horizons, and dexterity requirements. The training data further includes non-action data such as web documents, code, multi-modal content (image, audio, video), and embodied reasoning and visual question answering data. This improves the

**数据。** 我们在一批 ALOHA 2 机器人（Team et al., 2024; Zhao et al., 2025）上用 12 个月收集了一个大规模遥操作机器人动作数据集，包含数千小时的真实世界专家示范。数据集涵盖数千种不同任务，覆盖多种操作技能，物体，任务难度，回合长度和灵巧度要求。训练数据还包括非动作数据，如网页文档，代码，多模态内容（图像，音频，视频），以及具身推理和视觉问答数据。这提高了

<!-- page 15 of 64 -->

![Image block](images/p15-figure-15-a-robot-s-movement-in-a-few-example-tasks.png)

Figure 15 | A robot’s movement in a few example tasks that require dexterous manipulation in cluttered environments. From top to bottom: “open the eyeglasses case”，“pour pulses”，“unfasten file folder”，“wrap headphone wire”。

图 15：几个需要在杂乱环境中灵巧操作的示例任务中机器人的动作。从上到下：「打开眼镜盒」，「倒豆子」，「解开文件夹」，「缠耳机线」。

model’s ability to understand, reason about, and generalize across many robotic tasks, and requests.

模型在大量机器人任务和请求上理解，推理和泛化的能力。

**Baselines.** We compare Gemini Robotics to two state-of-the-art models: The first one is $\pi _ { 0 }$ reimplement, which is our re-implementation of the open-weights state-of-the-art 𝜋<sub>0</sub> VLA model (Beyer et al., 2024; Black et al., 2024). We train 𝜋<sub>0</sub> re-implement on our diverse training mixture and find this model to outperform the public checkpoint released by the authors, and hence, report it as the most performant VLA baseline in our experiments (see Appendix C.2 for more details). The second is a multi-task diffusion policy (Chi et al., 2024) (inspired by ALOHA Unleashed (Zhao et al., 2025) but modified to be task-conditioned), a model that has been shown to be effective in learning dexterous skills from multi-modal demonstrations. Both baselines were trained to convergence using the same composition of our diverse data mixture. Gemini Robotics runs primarily in the cloud with a local action decoder, whereas both baselines run locally on a workstation equipped with an Nvidia RTX 4090 GPU. All empirical evidence presented in this section is based on rigorous real-world robot experiments, with A/B testing and statistical analysis (more details in Appendix C.1).

**基线。** 我们把 Gemini Robotics 和两个最先进的模型对比。第一个是 π0 re-implement，即我们对开放权重的最先进 VLA 模型 π0 (Beyer et al., 2024; Black et al., 2024) 的复现。我们在自己的多样训练混合数据上训练 π0 re-implement，发现它比作者公开的检查点更强，因此把它作为实验中最强的 VLA 基线（详见附录 C.2）。第二个是多任务扩散策略（Chi et al., 2024），受 ALOHA Unleashed (Zhao et al., 2025) 启发，但改成以任务为条件；这类模型已被证明能有效地从多模态示范中学会灵巧技能。两个基线都用同样构成的多样数据混合训练到收敛。Gemini Robotics 主要跑在云端，配一个本地动作解码器；两个基线都在一台装有 Nvidia RTX 4090 GPU 的工作站上本地运行。本节所有实证结果都来自严格的真实机器人实验，采用 A/B 测试和统计分析（详见附录 C.1）。

## 3.2. Gemini Robotics can solve diverse dexterous manipulation tasks out of the box

**3.2 Gemini Robotics 开箱即可完成多样的灵巧操作任务**

In our first set of experiments, we demonstrate that Gemini Robotics can solve a wide range of dexterous tasks. We evaluate the performance of this model on short-horizon dexterous tasks, and compare to state-of-the-art multi-task baselines. We evaluate all models out of the box, i.e., without any task-specific fine-tuning or additional prompting, on 20 tasks sampled from our dataset in Section 3.1. We choose diverse scene setups (some of them illustrated in Fig. 15), spanning a laundry room (e.g.，“fold pants”), kitchen (e.g.，“stack measuring cup”), cluttered office desk (e.g.，“open pink folder”), and other day-to-day activities (e.g.，“open glasses case”). These selected tasks also require varying

第一组实验展示 Gemini Robotics 能完成大量灵巧任务。我们在短时程灵巧任务上评估它，并和最先进的多任务基线对比。所有模型都开箱评估，即不做任何针对任务的微调或额外提示，评估用的 20 个任务从 3.1 节的数据集中抽取。场景布置很多样（部分见图 15），包括洗衣房（如 「叠裤子」），厨房（如 「叠放量杯」），杂乱的办公桌（如 「打开粉色文件夹」）以及其他日常活动（如 「打开眼镜盒」）。这些任务要求的

<!-- page 16 of 64 -->

![Chart block](images/p16-figure-16-gemini-robotics-can-solve-a-wide-variety-of.png)

Figure 16 | Gemini Robotics can solve a wide variety of tasks out of the box. We sample 20 tasks from the dataset, which require varying levels of dexterity, and evaluate our model and the baselines on them. Gemini Robotics significantly outperforms the baselines.

图 16: Gemini Robotics 开箱就能完成多种任务。我们从数据集中抽取 20 个灵巧度要求不同的任务，在上面评估我们的模型和基线。Gemini Robotics 明显优于基线。

levels of dexterity – from simple pick-and-place (e.g.，“pick the shoe lace from the center of the table”) to dexterous manipulation of deformable objects that requires two-hand coordination (e.g.，“wrap the wire around the headphone”). We show examples of our model rollouts of these tasks in Fig. 15 and full list of tasks in Appendix C.1.1.

灵巧度也各不相同，从简单的拾取放置（如 「从桌子中央拿起鞋带」）到需要双手配合的可变形物体灵巧操作（如 「把线缠在耳机上」）。图 15 给出模型在这些任务上的执行示例，完整任务列表见附录 C.1.1。

Fig. 16 summarizes the performance of our model and the baselines. We find that the Gemini Robotics model is proficient at half of the tasks out of the box with a success rate exceeding 80%. Notably, our model excels at deformable object manipulation ( “fold pink cloth”，“wrap the wire around the headphone”), while the baselines struggle with these tasks. For the more challenging tasks, (e.g.，“open pink folder”，“insert red block”，“wrap the wire around the headphone”), we find that Gemini Robotics is the only method that can achieve non-zero success, highlighting that a combination of a high-capacity model architecture along with high-quality diverse data across all modalities (vision, language, and action) is essential for multi-task policy learning. Finally, we find that some of the most dexterous tasks are still quite challenging to learn purely from the multi-task setup (e.g.，“insert shoe lace”): we discuss our specialization recipe for Gemini Robotics to solve these and longer-horizon challenging tasks in Section 4.1.

图 16 汇总了我们的模型和基线的表现。Gemini Robotics 开箱就能熟练完成一半任务，成功率超过 80%。值得注意的是，我们的模型擅长可变形物体操作（「叠粉色布」，「把线缠在耳机上」），基线在这类任务上很吃力。在更难的任务上（如 「打开粉色文件夹」，「插入红色积木」，「把线缠在耳机上」），Gemini Robotics 是唯一能取得非零成功率的方法。这说明高容量模型架构加上覆盖所有模态（视觉，语言和动作）的高质量多样数据，是多任务策略学习的关键。最后，一些最要求灵巧的任务仍很难单靠多任务设置学会（如 「穿鞋带」）。4.1 节讨论让 Gemini Robotics 解决这类任务和更长时程难题的专精做法。

> **再看：** 「一半任务成功率超过 80%」 和 「唯一非零」 两句，在图 16 上都成立吗？
> 读图 16 的蓝柱：close laptop，fold pants，pour pulses，stack measuring cup 为 1.0；fold pink cloth，pick shoelace，place grater compartment 为 0.9；open pink folder，ornaments on table，wrap headphone wires 为 0.8。达到 0.8 的正好 10 个，是 20 个的一半，但严格 「超过 80%」 的只有 7 个，这句要按 「不低于 80%」 读。第二句点名的 open pink folder，图中多任务扩散在这一组有一根约 0.1 的绿柱，不是零；insert red block 和 wrap headphone wires 两组里基线确实为零。另外 pick marker cap 的蓝柱约 0.28，不是 0.1 的整数倍，说明各任务的试验次数不完全相同，附录 C.1 也没有给每个任务的次数。

## 3.3. Gemini Robotics can closely follow language instructions

**3.3 Gemini Robotics 能紧跟语言指令**

The second set of experiments tests the model’s ability to follow natural language instructions. We pick 25 language instructions to be evaluated in five diverse evaluation scenes, including training scenes as well as novel scenes with unseen objects and receptacles (details in Appendix C.1.2). The evaluation focuses on language commands that must be precisely followed (e.g.，“Place the blue clip to the right of the yellow sticky notes”) – in contrast to open-ended abstract instructions like “clean the table”). We visualize rollouts and report the binary task success rates in Fig. 17.

第二组实验测试模型遵循自然语言指令的能力。我们选了 25 条语言指令，在五个不同的评估场景中评估，场景既有训练场景，也有带未见物体和容器的新场景（详见附录 C.1.2）。评估侧重必须精确执行的语言命令（如 「把蓝色夹子放到黄色便利贴的右边」），而不是 「把桌子收拾干净」 这种开放的抽象指令。图 17 展示执行过程，并报告二值的任务成功率。

Our experiments suggest that strong steerability arises from a combination of high-quality diverse data and a capable vision-language backbone. Gemini Robotics and $\pi _ { 0 }$ re-implement outperform the

实验表明，强的可操控性来自高质量多样数据和能力强的视觉语言骨干两者的结合。Gemini Robotics 和 π0 re-implement 优于

<!-- page 17 of 64 -->

![Image block](images/p17-gemini-robotics-bringing-ai-into-the-physical-world.png)

![Chart block](images/p17-figure-17-gemini-robotics-can-precisely-follow-novel.png)

Figure 17 | Gemini Robotics can precisely follow novel language instructions in cluttered scenes which were never seen during training. Left: scene including objects seen during training. Middle: scene including novel objects. Right: success rate on “Pick” and “Pick and Place” tasks with detailed instructions for the new objects.

图 17: Gemini Robotics 能在训练中从没见过的杂乱场景里精确执行新的语言指令。左：包含训练中见过的物体的场景。中：包含新物体的场景。右：针对新物体给出详细指令时，「拾取」 和 「拾取并放置」 任务的成功率。

diffusion baseline, even in simple in-distribution scenes, suggesting that a strong language encoder is required. However, especially in challenging scenes with novel objects and fine-grained instructions (e.g.，“Place the toothpaste in the bottom compartment of the caddy”), we find that Gemini Robotics is more effective than either baseline (Fig. 17). While the PaliGemma-based $\pi _ { 0 }$ re-implement correctly approaches objects that were seen during training, it struggles with interpreting descriptive language attributes (e.g.，“top black container”，“blue clip”) and fails to solve tasks with unseen objects and language descriptors.

扩散基线，即使在简单的分布内场景中也是如此，这说明需要一个强的语言编码器。但在有新物体和细粒度指令的难场景里（如 「把牙膏放进收纳篮的下层隔间」），Gemini Robotics 比两个基线都更有效（图 17）。基于 PaliGemma 的 π0 re-implement 能正确地接近训练中见过的物体，但很难理解描述性的语言属性（如 「上面那个黑色容器」，「蓝色夹子」），也解决不了涉及未见物体和语言描述词的任务。

> **确认：** 「即使在简单的分布内场景中也优于扩散基线」，图 17 给了分布内的数吗？
> 没有。图 17 右侧的柱状图只有新物体场景的两组：Pick 为 Gemini Robotics 0.94，π0 re-implement 0.30，多任务扩散 0.26；Pick-Place 为 0.80, 0.10, 0.09。分布内场景的成功率在图 17 和附录 C.1.2 的图 36 里都没有数字。分母也没写：附录说是 5 个场景，25 条指令，但 0.94 这种值不是 1/25 的整数倍，每条指令跑了几次不清楚。所以 「π0 在分布内也强于扩散」 这一句，本文只有文字。

## 3.4. Gemini Robotics brings Gemini’s generalization to the physical world

**3.4 Gemini Robotics 把 Gemini 的泛化带到物理世界**

Lack of robust generalization is a key bottleneck for large-scale deployment of robots in domestic and industrial applications. In the final set of experiments, we evaluate Gemini Robotics’s ability to deal with variations along three axes that have been considered important in prior work (Gao et al., 2025).

缺乏稳健的泛化，是机器人在家庭和工业场景中大规模部署的关键瓶颈。最后一组实验评估 Gemini Robotics 应对三个方向上变化的能力，这三个方向在先前工作（Gao et al., 2025）中被认为很重要。

**Visual Generalization:** The model should be invariant to visual changes of the scene that do not affect the actions required to solve the task. These visual changes can include variations in background, lighting conditions, distractor objects or textures.

**视觉泛化：** 场景的视觉变化如果不影响完成任务所需的动作，模型就应当不受它影响。这些视觉变化包括背景，光照条件，干扰物体或纹理的变化。

**Instruction Generalization:** The model should understand invariance and equivalence in natural language instructions. Going beyond fine-grained steerability studied in Section 3.3, the model should understand paraphrasing, be robust to typos, understand different languages, and varying levels of specificities.

**指令泛化：** 模型应当理解自然语言指令中的不变性和等价性。在 3.3 节研究的细粒度可操控性之外，模型还应当能理解改述，对拼写错误稳健，懂不同的语言，也能应付详略不同的说法。

**Action Generalization:** The model should be capable of adapting learned movements or synthesizing new ones, for instance to generalize to initial conditions (e.g., object placement) or object instances (e.g., shape or physical properties) not seen during training.

**动作泛化：** 模型应当能调整学过的动作，或者合成新动作，比如泛化到训练中没见过的初始条件（如物体摆放）或物体实例（如形状或物理属性）。

We evaluate the generalization performance of Gemini Robotics and the baselines using a diverse task suite. This benchmark consists of 85 tasks in total, of which 20% are within the training distribution, 28% evaluate visual generalization, 28% evaluate instruction generalization, and 24% evaluate action generalization. Fig. 18 - Fig. 20 show examples of the three different types of variations in our task suite. For a detailed breakdown of tasks, please see Appendix C.1.3. Fig. 21 reports average progress scores. This metric provides a more continuous measure than the binary task success, and gives us the finer granularity to visualize the policies’ progress of each task, especially the hard ones (progress score for each task is defined in Appendix C.1.3.3). We also provide the same plot in success rate in Fig. 40 in the Appendix.

我们用一个多样的任务集评估 Gemini Robotics 和基线的泛化表现。这个基准共 85 个任务，其中 20% 在训练分布内，28% 评估视觉泛化，28% 评估指令泛化，24% 评估动作泛化。图 18 到图 20 给出任务集中三类变化的例子。任务的详细拆分见附录 C.1.3。图 21 报告平均进度分。这个指标比二值的任务成功更连续，粒度更细，能看出策略在每个任务上走到了哪一步，难任务尤其如此（每个任务的进度分定义见附录 C.1.3.3）。附录图 40 给出同一张图的成功率版本。

> **拆开：** 85 个任务按 20%，28%，28%，24% 拆，各是多少个？
> 85 乘 28% 是 23.8，乘 24% 是 20.4，都不是整数。能凑回 85 的整数组合是 17, 24, 24, 20，对应 20.0%，28.2%，28.2%，23.5%，四舍五入后正是正文的四个百分比。但附录 C.1.3.1 只列了 4 个基础任务，各配 4 种指令变化和 3 种视觉变化，C.1.3.2 列了 6 个动作泛化任务，用这些直接数只能数出几十个组合，凑不出 24 个视觉泛化任务。所以 85 数的是 「指令加初始条件」 的变体条数，每类具体怎么凑出来的，附录没有给完整清单。

Gemini Robotics consistently outperforms the baselines and handles all three types of variations

Gemini Robotics 一直优于基线，对三类变化的处理都

<!-- page 18 of 64 -->

In-distribution

![Image block](images/p18-distractors.png)

Distractors

![Image block](images/p18-different-background.png)

Different background

![Image block](images/p18-different-lighting-conditions.png)

Different lighting conditions

![Image block](images/p18-put-the-top-left-green-grapes-into-the-right.png)

Put the top left green grapes into the right compartment of the grey box.

图 18 各格依次是：分布内，干扰物，不同背景，不同光照。指令是：把左上方的绿葡萄放进灰盒子的右侧隔间。

Figure 18 | Example tasks for measuring different types of visual generalization in the generalization benchmark for a given instruction. Left: in-distribution scene. From left to right: The scene can have new distractors, a different background or different lighting conditions.

图 18：泛化基准中，针对同一条指令衡量不同类型视觉泛化的示例任务。最左是分布内场景。从左到右，场景可以加入新的干扰物，换背景或换光照条件。

| Initial scene | In-distribution | Typo | Multilingual | Rephrasing | Descriptive |
| --- | --- | --- | --- | --- | --- |
|  | Put the top left green grapes into the right compartment of the grey box. | Put the top lft gren grapes into the rht compartment of the grey bx. | Coloque las uvas verdes de la parte superior izquierda en el compartimento derecho de la caja gris. | Pick up the green grapes and place them in the largest container of the grey box. | Pick the green grapes (top left) and put them in the grey box (right compartment). |

图 19 表格：同一任务的五种指令写法。分布内：把左上方的绿葡萄放进灰盒子的右侧隔间。拼写错误：同一句话故意拼错几个词。多语言：同一句话的西班牙语版本。改述：拿起绿葡萄，放进灰盒子里最大的格子。描述式：拿绿葡萄（左上），放进灰盒子（右侧隔间）。

Figure 19 | Example tasks for measuring different types of instruction generalization in the generalization benchmark. Left: in distribution instruction. From left to right: The task instruction can have typos, be expressed in a new language, or be described with different sentences and level of details.

图 19：泛化基准中衡量不同类型指令泛化的示例任务。最左是分布内指令。从左到右，指令可以带拼写错误，换一种语言，或者用不同的句子和详略来描述。

Different initial positions

![Image block](images/p18-image.png)

![Image block](images/p18-image-2.png)

![Image block](images/p18-put-the-legos-into-the-lego-bag.png)

Put the legos into the lego bag.

In-distribution

![Image block](images/p18-new-object-instance.png)

New object instance

![Image block](images/p18-image-3.png)

![Image block](images/p18-tighten-the-cap-of-the-water-bottle.png)

Tighten the cap of the water bottle.

![Image block](images/p18-image-4.png)

![Image block](images/p18-open-the-bottom-drawer-of-the-jewelry-box.png)

Open the bottom drawer of the jewelry box.

![Image block](images/p18-image-5.png)

![Image block](images/p18-image-6.png)

![Image block](images/p18-fold-the-dress.png)

Fold the dress.

图 20 各组标注：不同初始位置，分布内，新物体实例。四条指令依次是：把乐高放进乐高袋；拧紧水瓶盖；打开首饰盒最下面的抽屉；叠裙子。

![Image block](images/p18-figure-20-example-tasks-for-measuring-different-types.png)

Figure 20 | Example tasks for measuring different types of action generalization in the generalization benchmark. Left: We show the different initial positions compared to those in-distribution. Right: We show the difference between new object instances and those we collected data for. In particular, for "fold the dress" we use different dress sizes (S in-distribution, M and XS as new instances). For both types of variations (initial conditions, object instances) the model needs adapt previously learned movements, e.g., to reach into different parts of the space or to manipulate a different object.

图 20：泛化基准中衡量不同类型动作泛化的示例任务。左：与分布内相比的不同初始位置。右：新物体实例和采集数据时所用物体的差别。例如 「叠裙子」 用了不同尺码的裙子（S 码是分布内，M 码和 XS 码是新实例）。两类变化（初始条件，物体实例）都要求模型调整学过的动作，比如伸到空间中的不同位置，或者操作一个不同的物体。

<!-- page 19 of 64 -->

![Chart block](images/p19-figure-21-breakdown-of-gemini-robotics-generalization.png)

Figure 21 | Breakdown of Gemini Robotics generalization capabilities. Gemini Robotics consistently outperforms the baselines and handles all three types of variations more effectively. Notably, even when baselines experience catastrophic failure — such as with instructions in a new language or visual variations of the target object Gemini Robotics still achieves non-zero performance.

图 21: Gemini Robotics 泛化能力的分项结果。Gemini Robotics 一直优于基线，对三类变化的处理都更有效。值得注意的是，即使基线出现灾难性失败，比如指令换成新语言或目标物体外观变化时，Gemini Robotics 仍有非零表现。

more effectively as shown in Fig. 21. Gemini Robotics even achieves non-zero performance in those cases where the baselines fail catastrophically, e.g., instructions in a new language. We speculate that these improvements result from the larger and more powerful VLM backbone, including the state-of-the-art vision encoder used in Gemini 2.0, combined with diverse training data.

更有效，见图 21。在基线灾难性失败的情形下，比如指令换成新语言，Gemini Robotics 仍有非零表现。我们推测这些提升来自更大更强的 VLM 骨干，包括 Gemini 2.0 所用的最先进视觉编码器，再加上多样的训练数据。

> **对一下：** 正文说基线在新语言上 「灾难性失败」，引的是图 21，图 21 上基线是零吗？
> 不是零。图 21 是进度分：New language 一行 Gemini Robotics 0.68，π0 re-implement 0.04，多任务扩散 0.12，基线都不为零。真正归零的是附录图 40 的成功率版：同一行 Gemini Robotics 0.43，两个基线都是 0.0。所以这句结论要配图 40 才成立，配图 21 只能说 「差得很远」。两种口径的差距在别处也很大：Typo 一行进度分 Gemini 0.54，成功率却只有 0.14，和多任务扩散的 0.14 持平；分布内平均的 π0 进度分是 0.33，成功率只有 0.08。正文引用图 21 时说的 「一直优于基线」，在图 40 的 Typo 一行并不成立。

## 4. Specializing and Adapting Gemini Robotics for Dexterity, Reasoning, and New Embodiments

**4. 为灵巧，推理和新机体专精与适配 Gemini Robotics**

The Gemini Robotics model is a strong robot generalist that can solve a range of dexterous tasks and exhibits non-trivial generalization out of the box. In this section, we further test the limits of the model and explore possible avenues for further improving its generalist capabilities in the future. In particular, we (1) test the model’s ability to become proficient at much more challenging long-horizon dexterous tasks with further specialization, and (2) optimize its capacity for generalization through semantically-grounded embodied reasoning. We also explore (3) the possibility of rapid adaptation to novel tasks and environments, (4) as well as the adaptation to new robot embodiments. Whereas (1,2) provide important information for future model improvements, (3) and (4) are desired properties for practical deployment of the model.

Gemini Robotics 是一个强的机器人通用模型，开箱就能完成一系列灵巧任务，并有不小的泛化能力。本节进一步测试它的极限，探索将来继续提升通用能力的可能途径。具体来说，我们（1）测试模型经过进一步专精后，能否熟练完成难得多的长时程灵巧任务；（2）通过有语义依据的具身推理优化它的泛化能力。我们还探索（3）快速适配新任务和新环境的可能，以及（4）适配新的机器人机体。（1）和（2）为将来改进模型提供重要信息，（3）和（4）是实际部署需要的性质。

## 4.1. Long-horizon dexterity

**4.1 长时程灵巧**

In Section 3.2, we showed that the Gemini Robotics model can accomplish short-horizon dexterous tasks out of the box. Here, we show that fine-tuning the model with a narrow set of high-quality data can specialize the model to solve highly dexterous, challenging, long-horizon tasks that are, in terms of their difficulty, beyond the scope of the generalist model. In particular, we select six tasks (Fig. 22) to demonstrate the various capabilities of our model after specialization:

3.2 节表明 Gemini Robotics 开箱就能完成短时程灵巧任务。这里我们展示，用一小批高质量数据微调，可以把模型专精到高灵巧，有挑战的长时程任务上，这些任务的难度超出了通用模型的范围。我们选了六个任务（图 22）来展示专精后模型的各种能力：

<!-- page 20 of 64 -->

![Image block](images/p20-figure-22-gemini-robotics-successfully-accomplishes-a.png)

Figure 22 | Gemini Robotics successfully accomplishes a variety of long-horizon dexterous tasks on the ALOHA. From top to bottom: “make an origami fox”，“pack a lunch-box”，“spelling board game”，“play a game of cards”，“add snap peas to salad with tongs” and “add nuts to salad”。

图 22: Gemini Robotics 在 ALOHA 上成功完成多种长时程灵巧任务。从上到下：「折纸狐狸」，「装午餐盒」，「拼字棋盘游戏」，「打一局牌」，「用夹子往沙拉里加荷兰豆」 和 「往沙拉里加坚果」。

**Make an origami fox:** The robot needs to fold a paper into the shape of a fox’s head. This task needs 4 precise folds, each requiring aligning, bending, pinching, and creasing, with an increasing number of paper layers. This requires very precise and reliable bi-arm coordination, as even a small error can lead to an irrecoverable failure.

**折纸狐狸：** 机器人要把一张纸折成狐狸头的形状。这个任务需要 4 次精确的折叠，每次都要对齐，弯折，捏住和压出折痕，纸的层数越折越多。这要求非常精确可靠的双臂配合，一个小错误就可能导致无法挽回的失败。

**Pack a lunch-box:** The robot needs to pack a lunch bag with several items: It first needs to insert a slice of bread into the narrow slit of a plastic bag, zip it, and transfer this plastic bag and an energy bar into the lunch bag. Next, it must transfer the grapes into a container, seal its lid, and move the container into the lunch bag. Finally, the robot must zip the lunch bag close. Several of the subtasks (e.g., inserting the bread, closing the container lid, zipping the lunch bag) require precise coordination between the two arms and fine gripper motion.

**装午餐盒：** 机器人要往午餐袋里装几样东西：先把一片面包塞进塑料袋的窄口，拉上封口，再把这个塑料袋和一根能量棒放进午餐袋。接着把葡萄放进一个保鲜盒，盖紧盒盖，把保鲜盒放进午餐袋。最后拉上午餐袋的拉链。其中几个子任务（如塞面包，盖盒盖，拉午餐袋拉链）需要两臂之间精确配合和精细的夹爪动作。

**Spelling board game:** In this game, the human places (or draws) a picture of an object in front of the robot. The robot must identify the object and physically spell a three-letter word describing

**拼字棋盘游戏：** 在这个游戏里，人在机器人面前放（或画）一张物体的图。机器人要认出这个物体，并在实物上拼出一个描述它的三字母单词，

<!-- page 21 of 64 -->

![Chart block](images/p21-figure-23-performance-on-new-dexterous-and-long-horizon.png)

Figure 23 | Performance on new, dexterous and long-horizon tasks after specialization. Gemini Robotics is the only model that can consistently solve the extremely challenging tasks like “Origami” and “Lunch-box”，achieving a 100% success rate on the latter, while baselines struggle with these tasks. While baselines are competitive on the easier tasks (such as “Scoop nuts”，“Playing cards” and “Place peas”), Gemini Robotics is the only successful method at the spelling game, accurately spelling printed picture cards and even achieving over 60% accuracy with hand-drawn sketches (which are never seen in training).

图 23：专精后在新的灵巧长时程任务上的表现。Gemini Robotics 是唯一能稳定完成 「折纸」 和 「午餐盒」 这类极难任务的模型，后者成功率达到 100%，基线在这些任务上很吃力。在较容易的任务上（如 「舀坚果」，「打牌」，「放豌豆」）基线有竞争力，但拼字游戏只有 Gemini Robotics 能完成：它准确拼出打印图卡，对训练中从没见过的手绘草图也有 60% 以上的准确率。

the object by moving alphabet tiles onto a board. This task requires visual recognition, and tight vision-language-action grounding.

办法是把字母块移到板上。这个任务需要视觉识别，以及视觉，语言，动作之间紧密的对应。

**Play a game of cards:** The robot must use an automatic card dealer machine to draw three cards and transfer them to its other hand. The robot must then wait for the human to play, then play a card from its hand, and finally, fold its hand. This is a challenging fine-grained manipulation task that requires the robot to handover thin playing cards and precisely pick a card from its hand.

**打一局牌：** 机器人要用自动发牌机抽三张牌，并把它们交到另一只手上。然后等人出牌，再从手里出一张牌，最后弃掉手里的牌。这是有挑战的精细操作任务，要求机器人在两手之间传递很薄的扑克牌，并从手中精确地抽出一张。

**Add snap peas to salad:** The robot must use metal tongs to grab snap peas from a bowl and add them to a different bowl. Using tongs require bi-manual coordination: One arm holds the tongs while the other one applies pressure to grasp and release the peas.

**往沙拉里加荷兰豆：** 机器人要用金属夹子从一个碗里夹起荷兰豆，放到另一个碗里。用夹子需要双手配合：一只手臂拿住夹子，另一只施力来夹住和松开豆子。

**Add nuts to salad:** The robot must use a spoon to scoop nuts from a vertical container to the salad bowl. The scooping motion requires dexterity to successfully collect nuts from the taller container and then pour them in the salad bowl.

**往沙拉里加坚果：** 机器人要用勺子从一个竖直的容器里舀坚果到沙拉碗里。舀的动作需要灵巧，才能从较高的容器里舀到坚果，再倒进沙拉碗。

We curate between 2000 and 5000 episodes of high-quality demonstration data for each task, and fine-tune the Gemini Robotics checkpoint from Section 3 using each specialization dataset. We compare the performance of these specialist models with specialized versions of the baselines (𝜋<sub>0</sub> re-implement specialist and Multi-task diffusion specialist), both of which are fine-tuned on the same datasets. Additionally, to evaluate the importance of diverse training data used in Section 3, we train a single task diffusion policy and another Gemini Robotics specialist from scratch instead of from the checkpoints from Section 3. We evaluate all models extensively in the real-world and report task success rate in Fig. 23 (progress score results available in Appendix in Fig. 42). We conduct 20 trials per task for each model for all tasks except for the spelling board game, for which 12 trials are conducted.

我们为每个任务整理 2000 到 5000 个回合的高质量示范数据，用各自的专精数据集微调第 3 节的 Gemini Robotics 检查点。我们把这些专精模型和基线的专精版（π0 re-implement 专精版和多任务扩散专精版）对比，两者都在同样的数据集上微调。此外，为了评估第 3 节所用多样训练数据的重要性，我们还从零训练了一个单任务扩散策略和另一个 Gemini Robotics 专精模型，不从第 3 节的检查点出发。所有模型都在真实世界中充分评估，任务成功率见图 23（进度分结果见附录图 42）。除拼字棋盘游戏做 12 次试验外，每个模型在每个任务上做 20 次试验。

We find that our specialist models can solve all these tasks with an average success rate of 79%. Most notably, it achieves a 100% success rate of the full long-horizon lunch-box packing task which takes over 2 minutes to complete. In the spelling game, it correctly reads and spells words from printed images (seen in the specialization dataset). It is also able to correctly spell 4 out of 6 unseen hand-drawn sketches. In contrast, none of the baselines can consistently recognize the images and

我们的专精模型能完成所有这些任务，平均成功率 79%。最突出的是，完整的长时程装午餐盒任务要 2 分钟以上才能完成，它的成功率是 100%。在拼字游戏里，它能正确读出并拼写打印图片（专精数据集中见过）对应的单词，对 6 张没见过的手绘草图也能拼对 4 张。相比之下，没有一个基线能稳定地认出图片并

> **核对：** 平均 79% 是怎么来的，拼字游戏那一格算的是哪些试验？
> 读图 23 的蓝柱：舀坚果 1.00，午餐盒 1.00，打牌 0.90，拼字 0.83，放豌豆 0.55，折纸 0.45，六格平均是 4.73/6=0.788，和 79% 对得上。拼字的 0.83 是 10/12：附录 D.1.1 说 12 次里 6 次是打印图卡（分布内），6 次是手绘草图（分布外），打印的全对再加草图 4/6，正好 10。所以 79% 里有一格混了分布外试验。放豌豆一格单任务扩散是 0.75，比 Gemini 的 0.55 高；打牌一格单任务扩散 0.85，也接近 Gemini 的 0.90。图注说基线在较容易的任务上 「有竞争力」，放豌豆这一格其实是基线领先。

<!-- page 22 of 64 -->

spell the words correctly. For the simpler dexterous tasks, we find that the single task diffusion model that is trained from scratch is competitive, which is consistent with the best published results (Zhao et al., 2025). However, the single task diffusion models trained for spelling game, origami, and lunch-box tasks perform poorly, possibly due to the long-horizon nature of these tasks. We also find that both Multi-task diffusion and $\pi _ { 0 }$ re-implement, after fine-tuning using the same data, fail to meet our model’s performance. This is consistent with our findings in Fig. 16. The key difference between the Gemini Robotics model and the baselines is the much more powerful Gemini-based backbone, which suggests that successful specialization on challenging tasks highly correlates with the strength of the generalist model. Furthermore, when we directly train the Gemini Robotics specialist model from scratch using the specialization datasets, we find that it is unable to solve any of these tasks (0% success rates across the board, and plot not included in Fig. 23), suggesting that in addition to the high-capacity model architecture, the representation, or the physical common sense, learned from diverse robot action datasets in Section 3 is another key component for the model to specialize in challenging long-horizon tasks that require a high level of dexterity.

拼对单词。在较简单的灵巧任务上，从零训练的单任务扩散模型有竞争力，这和已发表的最好结果（Zhao et al., 2025）一致。但为拼字游戏，折纸和午餐盒训练的单任务扩散模型表现很差，可能是因为这些任务时程很长。我们还发现，多任务扩散和 π0 re-implement 用同样数据微调后，都达不到我们模型的水平，这和图 16 的结论一致。Gemini Robotics 和基线的关键区别是它强得多的 Gemini 骨干，这说明在难任务上专精能否成功，和通用模型本身的强弱高度相关。另外，直接用专精数据集从零训练 Gemini Robotics 专精模型时，它一个任务都完成不了（所有任务成功率都是 0%，图 23 未画出）。这说明除了高容量的模型架构，从第 3 节多样机器人动作数据中学到的表征，或者说物理常识，是模型能专精到高灵巧长时程任务的另一个关键。

> **问：** 从零训练的 Gemini Robotics 专精模型全部 0%，这个消融有几次试验，从零是指哪一层从零？
> 本文只有这一句话和括号里的 「图 23 未画出」。试验次数没写，附录 D.1 的评估流程也只描述了图 23 里的四种模型。「从零」 在这里指不从第 3 节的检查点出发，可 3.1 节说骨干本身是 Robotics-ER 的蒸馏版，所以这个对照模型是否仍从 Gemini 或 Robotics-ER 的权重起步，还是连视觉语言部分都随机初始化，正文没有说。这两种含义对 「物理常识来自第 3 节动作数据」 的结论分量差别很大：前者支持这个结论，后者只能说明 VLM 预训练本身重要。

## 4.2. Enhanced reasoning and generalization

**4.2 增强推理与泛化**

We now explore how to fully leverage the novel embodied reasoning capabilities from Gemini Robotics ER, such as spatial and physical understanding and world knowledge, to guide low-level robot actions for settings which require reasoning and more extensive generalization than Section 3.4. Although prior works have found consistent gains in visual robustness, so far VLAs still face substantial challenges in retaining abstract reasoning capabilities, and applying them to behavior generalization (Brohan et al., 2023; Kim et al., 2025). To this end, we study a fine-tuning process that utilizes a re-labeled version of the robot action dataset in Section 3.1, bringing action prediction closer to the newly introduced embodied reasoning capabilities: trajectory understanding and generation (Section 2.2). The local action decoder from Section 3.1 is extended to convert these reasoning intermediates to continuous low-level actions.

现在探索如何充分利用 Gemini Robotics-ER 的新具身推理能力，如空间和物理理解以及世界知识，在比 3.4 节更需要推理和更广泛泛化的场景中指导底层机器人动作。先前工作在视觉稳健性上一直有收益，但到目前为止，VLA 在保留抽象推理能力并把它用到行为泛化上仍面临很大困难（Brohan et al., 2023; Kim et al., 2025）。为此，我们研究一种微调流程：使用 3.1 节机器人动作数据集的重标注版本，让动作预测更靠近新引入的具身推理能力，即轨迹理解和生成（2.2 节）。3.1 节的本地动作解码器也被扩展，用来把这些推理中间结果转换成连续的底层动作。

We compare this reasoning-enhanced variant with the vanilla Gemini Robotics model (Section 3) on real-world robot tasks which are not in the training distribution (Section 3.1). Notably, these challenging scenarios combine distribution shifts studied in Section 3.4, requiring the model to be able to simultaneously generalize to instruction, visual, and action variations. We describe the high-level evaluation categories, and list the full instructions and task descriptions in Appendix D.2.

我们在不属于训练分布（3.1 节）的真实机器人任务上，比较这个推理增强版和原版 Gemini Robotics（第 3 节）。值得注意的是，这些难场景把 3.4 节研究的几种分布偏移组合在一起，要求模型同时泛化到指令，视觉和动作的变化。下面介绍评估的大类，完整指令和任务说明列在附录 D.2。

**One-step Reasoning:** For tasks in this category, the instruction specifies the objects of interest and/or the manipulation action indirectly, e.g., via their properties or affordances. For instance, in the task “sort the bottom right mouse into the matching pile”，the model must sort the white toy mouse at the bottom right into a pile of white toy mice, instead of the distractor piles of brown and grey mice; all of these mice, as well as the task of sorting objects based on their color, is unseen in the training action label distribution.

**一步推理：** 这一类任务的指令间接指定目标物体和/或操作动作，比如通过它们的属性或可供性。例如在 「把右下角的老鼠分到匹配的那一堆」 任务中，模型要把右下角的白色玩具老鼠放进白色玩具老鼠那一堆，而不是棕色和灰色老鼠的干扰堆。这些老鼠，以及按颜色分类物体这种任务，在训练的动作标注分布中都没有出现过。

**Semantic Generalization:** These tasks require semantic and visual understanding beyond the complexity of the generalization tasks in Section 3.4. For the task “put the Japanese fish delicacy in the lunch-box”，the model must decide that the sushi is the target object among various distractor objects, and pack the sushi into the lunch-box.

**语义泛化：** 这些任务需要的语义和视觉理解比 3.4 节的泛化任务更复杂。在 「把日本鱼类美食放进午餐盒」 任务中，模型要在多个干扰物中判断寿司是目标物体，并把寿司装进午餐盒。

**Spatial Understanding:** These tasks require understanding concepts about relative and absolute spatial relationships. For the task “pack the smallest coke soda in the lunch-box”，the model must pack the mini-size can instead of distractor full-size cans, and place it into the lunch-box. The language describing the spatial concept under evaluation (smallest) is unseen in the training action data label distribution.

**空间理解：** 这些任务需要理解相对和绝对空间关系的概念。在 「把最小的可乐装进午餐盒」 任务中，模型要拿迷你罐而不是正常尺寸的干扰罐，并把它放进午餐盒。被评估的空间概念对应的词（smallest，最小）在训练动作数据的标注分布中没有出现过。

<!-- page 23 of 64 -->

![Image block](images/p23-gemini-robotics-bringing-ai-into-the-physical-world.png)

![Chart block](images/p23-figure-24-performance-on-real-world-robot-tasks-that.png)

Figure 24 | Performance on real-world robot tasks that require embodied reasoning. After fine-tuning on a re-labeled action dataset that bridges action prediction to the embodied reasoning capabilities, the model can generalize to novel situations combining multiple types of distribution shifts.

图 24：在需要具身推理的真实机器人任务上的表现。在一个把动作预测和具身推理能力连起来的重标注动作数据集上微调后，模型能泛化到组合了多种分布偏移的新情形。

Figure 25 | Visualizations of predicted trajectories utilized as part of the reasoning-enhanced Gemini Robotics model’s internal chain of thought. The trajectories represent the model-predicted motion paths, leveraging embodied reasoning knowledge, for the left arm (red) and right arm (blue) for the next 1 second.

图 25：推理增强版 Gemini Robotics 内部思维链中用到的预测轨迹的可视化。这些轨迹是模型借助具身推理知识预测的接下来 1 秒的运动路径，红色是左臂，蓝色是右臂。

Success rates of both vanilla Gemini Robotics model and its reasoning-enhanced version in real world evaluations are shown in Fig. 24. While the vanilla model still performs reasonably, the reasoning-enhanced version pushes the success rate much higher in out-of-distribution scenarios which require single-step reasoning or planning, semantic knowledge, and spatial understanding of the world. Additionally, beyond improvements in the model’s ability to deploy its skills in novel

原版 Gemini Robotics 和推理增强版在真实世界评估中的成功率见图 24。原版表现尚可，推理增强版则在需要一步推理或规划，语义知识和空间理解的分布外场景中把成功率推高了很多。此外，除了模型在新

> **回看：** 附录 D.2.1 说 「8 个任务共 100 次试验」，图 24 的每一格分母是多少？
> 100/8=12.5，不可能每个任务一样多。从图 24 的读数反推：Matching Pile 0.79 和 0.29 对应 11/14 和 4/14，Same Color 0.60 和 0.27 对应 9/15 和 4/15，Find Sushi 0.73 和 0.45 对应 8/11 和 5/11，其余五格都是 0.1 的倍数，按 10 次算。这样加起来是 90，离 100 还差一些，可能有某一格是 20 次，本文没有给每格的次数，也没说 100 次是每个模型各 100 还是两个模型合计。图例把推理增强版叫做 「Reasoning-enhanced specialist」，它是用重标注数据另外微调出来的一份权重，和图 16 到图 21 的 Gemini Robotics 不是同一个检查点。八格里差距最大的是 Top Left，1.00 对 0.40。

<!-- page 24 of 64 -->

![Image block](images/p24-figure-26-fast-adaptation-to-new-tasks-with-a-limited.png)

Figure 26 | Fast adaptation to new tasks with a limited number of demonstrations. Fine-tuning Gemini Robotics achieves over 70% success on 7 out of 8 tasks with at most 100 demonstrations, reaching 100% success on two tasks. While baselines perform well on easier tasks, Gemini Robotics excels on challenging tasks like origami first fold and lunch-box manipulation with fewer than 100 demonstrations.

图 26：用有限示范快速适配新任务。微调 Gemini Robotics 后，8 个任务中有 7 个用不超过 100 次示范就达到 70% 以上的成功率，其中两个达到 100%。基线在较容易的任务上表现不错，而 Gemini Robotics 在折纸第一折和午餐盒操作这类难任务上，用不到 100 次示范就表现突出。

settings, we also see increased interpretability as the model can output intermediate steps that closely resemble the human-interpretable embodied reasoning traces of Gemini Robotics-ER, a benefit also highlighted in inspiring prior works (Gu et al., 2023; Li et al., 2025; Vecerik et al., 2024; Wen et al., 2024; Zawalski et al., 2024). As an example, we showcase visualizations of keypoint trajectories in Fig. 25, utilized as part of the model’s internal chain of thought.

场景中发挥技能的能力提高，我们还看到可解释性提高了：模型能输出与 Gemini Robotics-ER 那种人类可读的具身推理过程很相似的中间步骤。先前一些有启发的工作也强调过这个好处（Gu et al., 2023; Li et al., 2025; Vecerik et al., 2024; Wen et al., 2024; Zawalski et al., 2024）。作为例子，图 25 给出模型内部思维链中用到的关键点轨迹的可视化。

## 4.3. Fast adaptation to new tasks

**4.3 快速适配新任务**

Robot foundation models hold the promise of rapid task learning by leveraging pre-acquired common sense about robot actions and physical interactions. While Section 4.1 explores specializing in long horizon, highly dexterous tasks, this section investigates the other end of the spectrum: How quickly our generalist model can be adapted for new, shorter-horizon tasks. Concretely, we select eight sub tasks (details in Appendix D.3.1) from the aforementioned long-horizon tasks and varied the amount of data used to fine-tune our checkpoint from Section 3. Fig. 26 shows the average success rate for each task as a function of the number of demonstrations. For 7 out of 8 tasks, fine-tuning was effective at achieving success rate above 70% with at most 100 demonstrations (equivalent to 15 minutes to 1 hour of demonstrations depending on the complexity of the task). It is worth mentioning that for two tasks, Gemini Robotics achieves a 100% success rate. Baselines are competitive on the easier tasks: they learn “Pour lettuce” more efficiently, and for “Salad dressing” and “Draw card”，𝜋<sub>0</sub> re-implement achieves slightly higher success rate. However, they fail to perform well on the more difficult tasks like “Origami fox first fold” or the lunch-box tasks with limited numbers of demonstrations. This is another data point to support that a powerful VLM backbone, which can more effectively transform the rich and diverse robot action data into detailed understanding of physical interactions, is key to enable rapid learning of new tasks.

机器人基础模型有望借助事先获得的关于机器人动作和物理交互的常识，快速学会新任务。4.1 节探索的是专精到长时程高灵巧任务，本节研究另一端：通用模型能多快适配新的，较短时程的任务。具体来说，我们从前面的长时程任务中选出八个子任务（详见附录 D.3.1），改变用来微调第 3 节检查点的数据量。图 26 给出每个任务的平均成功率随示范次数的变化。8 个任务中有 7 个，用不超过 100 次示范微调（按任务复杂度，相当于 15 分钟到 1 小时的示范）就能达到 70% 以上的成功率。值得一提的是，有两个任务 Gemini Robotics 达到了 100% 成功率。基线在较容易的任务上有竞争力：它们学 「倒生菜」 更快，在 「淋沙拉酱」 和 「抽牌」 上 π0 re-implement 的成功率略高。但在示范有限时，它们在 「折纸狐狸第一折」 或午餐盒相关的难任务上表现不好。这是又一个数据点，支持这样的看法：能把丰富多样的机器人动作数据更有效地转化为对物理交互的细致理解的强 VLM 骨干，是快速学会新任务的关键。

> **看表：** 7 个任务 「超过 70%」，在图 26 上按什么阈值数？
> 读图 26 的蓝线在 100 次示范处的值：Put container in lunch-box 1.0, Zip lunch-box 0.7, Draw card 0.9, Play card 0.8, Pour lettuce 1.0, Salad dressing 0.8, Seal container 0.4, Origami first fold 0.7. Zip lunch-box 在 20 次示范时是 0.8，取 「不超过 100 次」 里的最好点可以算进去；Origami first fold 最好也只有 0.7。严格超过 70% 的是 6 个，要把 7 个凑齐，阈值得读成 「不低于 70%」。每个点只有 10 次试验（附录 D.3.1），0.7 和 0.8 之间就是一次成败的差别。图注还说 Gemini 在折纸第一折上 「用不到 100 次示范」 就表现突出，可折纸第一折在 20 次时只有 0.1，到 100 次才 0.7。

<!-- page 25 of 64 -->

![Image block](images/p25-figure-27-the-gemini-robotics-model-can-be-fine-tuned.png)

Figure 27 | The Gemini Robotics model can be fine-tuned to control different robots. Top: The Apollo humanoid robot packs a lunch bag. Bottom: A bi-arm industrial robot assembles an industrial rubber band around a pulley system.

图 27: Gemini Robotics 模型可以通过微调来控制不同的机器人。上：Apollo 人形机器人装午餐袋。下：一台双臂工业机器人把工业橡胶带装到滑轮组上。

## 4.4. Adaptation to new embodiments

**4.4 适配新机体**

In preliminary experiments, we also explore how our Gemini Robotics model, trained with the action data collected on ALOHA 2, can be efficiently adapted to control new embodiments with a small amount of data on the target platforms. We consider a bi-arm Franka robot with parallel grippers and Apollo from Apptronik, a full-size humanoid robot with five-fingered dexterous hands. Fig. 27 shows example tasks on these two different robots. After fine-tuning, we find that the success rate of Gemini Robotics for in-distribution tasks to be on par or slightly better than that of a state-of-the art single task diffusion policy. For instance, the adapted Gemini Robotics model for the bi-arm Franka robot can solve all considered tasks with an average success rate of 63% (tasks details and plots of success rate available in Appendix D.4). We further investigate the robustness of this adapted model to visual disturbances, initial condition perturbations, and object shape variations (Appendix D.4.2). As illustrated in Fig. 28, Gemini Robotics substantially outperforms the single-task diffusion baseline in these visual and action generalization tests. Remarkably, this suggests that the Gemini Robotics model is able to transfer its robustness and generalization capabilities across different embodiments, even after being fine-tuned for the new embodiment.

在初步实验中，我们还探索了用 ALOHA 2 动作数据训练的 Gemini Robotics，能否在目标平台上用少量数据高效适配，控制新机体。我们考虑两种机器人：带平行夹爪的双臂 Franka 机器人，以及 Apptronik 的 Apollo，一个带五指灵巧手的全尺寸人形机器人。图 27 给出这两种机器人上的示例任务。微调后，Gemini Robotics 在分布内任务上的成功率与最先进的单任务扩散策略持平或略好。例如，为双臂 Franka 适配的 Gemini Robotics 能完成所有考察的任务，平均成功率 63%（任务细节和成功率图见附录 D.4）。我们进一步研究这个适配后的模型对视觉干扰，初始条件扰动和物体形状变化的稳健性（附录 D.4.2）。如图 28 所示，在这些视觉和动作泛化测试中，Gemini Robotics 大幅优于单任务扩散基线。这说明 Gemini Robotics 即使针对新机体做了微调，仍能把稳健性和泛化能力带到不同机体上。

> **再看：** 63% 和 「持平或略好」 在附录图上各对应哪一格？
> 63% 是图 47 成功率版的分布内平均，单任务扩散是 0.60，差 3 个点，这就是 「持平或略好」。图 28 是进度分，分布内是 0.74 对 0.71。「大幅优于」 说的是分布外：图 47 视觉泛化分布外平均 0.27 对 0.08，动作泛化 0.24 对 0.10；图 28 进度分是 0.50 对 0.22, 0.44 对 0.21。相对差距确实大，但 Gemini 自己的分布外成功率也都在 30% 以下。另外 Apollo 人形机器人只出现在图 27 的一张示意图里，没有任何成功率数字，摘要里的 「高自由度人形机器人」 在本文只有定性展示。

## 5. Responsible Development and Safety

**5. 负责任的开发与安全**

We have developed the models introduced in this report in alignment with Google AI Principles (Google, 2025) and previous releases of AI technology (Gemini-Team et al., 2023; Kavukcuoglu et al., 2022). Ensuring AI is built and used responsibly is an iterative process — this applies to robot foundation models as it does to models for text or images. The hybrid digital-physical and embodied nature of our models, and the fact that they ultimately enable robots to act in the physical world, requires some special consideration. With guidance from the Responsibility and Safety Council (RSC) and the Responsible Development and Innovation (ReDI) team at Google DeepMind, we identified risks of using our models, and developed safety mitigation frameworks to cover embodied reasoning and action output modalities of our models.

本报告介绍的模型是按 Google AI 原则（Google, 2025）并参照以往 AI 技术的发布（Gemini-Team et al., 2023; Kavukcuoglu et al., 2022）开发的。确保 AI 被负责任地构建和使用是一个迭代过程，对机器人基础模型和对文本或图像模型都一样。我们的模型兼具数字和物理属性，又是具身的，最终让机器人在物理世界中行动，这需要一些特别的考虑。在 Google DeepMind 责任与安全委员会（RSC）和负责任开发与创新（ReDI）团队的指导下，我们识别了使用这些模型的风险，并制定了安全缓解框架，覆盖模型的具身推理和动作输出两种模态。

<!-- page 26 of 64 -->

![Chart block](images/p26-figure-28-breakdown-of-generalization-metrics-when-the.png)

Figure 28 | Breakdown of generalization metrics when the Gemini Robotics model is adapted to a new embodiment, the bi-arm Franka robot. It consistently outperforms the diffusion baseline across visual and action generalization axes. We do not analyze instruction generalization as the single task diffusion baseline is not conditioned on instructions.

图 28: Gemini Robotics 适配到新机体（双臂 Franka 机器人）后泛化指标的分项结果。在视觉和动作泛化两个方向上，它都一直优于扩散基线。由于单任务扩散基线不以指令为条件，我们没有分析指令泛化。

Traditional robot safety is a vast multifaceted discipline ranging from hazard mitigation codified in hundreds of pages of ISO and RIA standards (for Standardization, 2011; Jacobs and Virk, 2014; , RIA), to collision-free motion planning (LaValle, 2006), force modulation (Villani and De Schutter, 2016) and robust control (Ames et al., 2019; Zhou and Doyle, 1998). Historically, the focus has been on **physical action safety**, i.e., on ensuring that robots respect hard physical constraints (e.g., obstacle avoidance, workspace bounds), have stable mobility (e.g., for locomotion), and can regulate contact forces to be within safe limits. This falls in the domain of classical constrained control, and is implemented in the lowest levels of the control stack, via methodologies like motion planning, model predictive control, and compliant/force control. Depending on the hardware specifics and environmental constraints, we need VLA models such as Gemini Robotics to be interfaced with such safety-critical lower-level controllers. Our prior research (Chiang et al., 2025; Varley et al., 2024) has prototyped such interfaces. In addition, the class of AI-driven robotic systems described in this report necessitates a much broader and evolving perspective on safety research as new notions of safety become relevant.

传统机器人安全是一门庞大的多面学科，从写进几百页 ISO 和 RIA 标准的危险缓解（for Standardization, 2011; Jacobs and Virk, 2014; RIA），到无碰撞运动规划（LaValle, 2006），力调节（Villani and De Schutter, 2016）和鲁棒控制（Ames et al., 2019; Zhou and Doyle, 1998）。历来的重点是 **物理动作安全**，即确保机器人遵守硬性物理约束（如避障，工作空间边界），移动稳定（如行走时），并能把接触力控制在安全范围内。这属于经典约束控制的范畴，在控制栈的最底层实现，方法包括运动规划，模型预测控制和柔顺控制/力控制。视硬件细节和环境约束而定，需要把 Gemini Robotics 这样的 VLA 模型接到这类安全关键的底层控制器上。我们之前的研究（Chiang et al., 2025; Varley et al., 2024）已经做过这类接口的原型。此外，本报告描述的这类 AI 驱动机器人系统，随着新的安全概念变得重要，需要一种更宽，且不断演进的安全研究视角。

Gemini Safety policies outlined in (Gemini-Team et al., 2023) are designed for **content safety**, preventing Gemini-derived models from generating harmful conversational content such as hate speech, sexual explicitness, improper medical advice, and revealing personally identifiable information. By building on Gemini checkpoints, our robotics models inherit safety training for these policies done in (Gemini-Team et al., 2023), promoting safe human-robot dialog. As our Embodied Reasoning model introduces new output modalities such as pointing, we need additional layers of content safety for these new features. We therefore perform supervised fine-tuning on both Gemini 2.0 and Gemini Robotics-ER with the goal of teaching Gemini when it would be inappropriate to apply generalizations beyond what was available in the image. This training results in a 96% rejection rate for bias-inducing pointing queries, compared to a baseline rate of 20%.

(Gemini-Team et al., 2023) 中的 Gemini 安全政策针对的是 **内容安全**，防止 Gemini 衍生模型生成有害的对话内容，如仇恨言论，露骨色情，不当医疗建议，以及泄露个人身份信息。由于建在 Gemini 检查点之上，我们的机器人模型继承了（Gemini-Team et al., 2023）中针对这些政策做的安全训练，有助于安全的人机对话。由于具身推理模型引入了指点这类新输出模态，这些新功能需要额外的内容安全层。因此我们对 Gemini 2.0 和 Gemini Robotics-ER 都做了监督微调，目的是教 Gemini 判断什么时候不应该超出图像中已有的信息去做推断。这次训练让模型对诱导偏见的指点查询的拒绝率达到 96%，基线是 20%。

> **确认：** 96% 对 20% 是哪个模型，在多少条查询上测的？
> 本文只给了这两个数。监督微调同时做在 Gemini 2.0 和 Robotics-ER 上，96% 属于哪一个或是两者合并，20% 的基线是未经这次微调的哪个模型，都没有写；诱导偏见的指点查询有多少条，怎么判定 「拒绝」，也没有图表。它和图 29 用的是不同的评测，不在 ASIMOV 的两张柱状图里。所以能记下的只有结论：对这类查询，拒绝率从 20% 升到 96%。

Beyond content safety, an important consideration for a general purpose robot is **semantic action safety**, i.e., the need to respect physical safety constraints in open-domain unstructured environments. These are hard to exhaustively enumerate – that a soft toy must not be placed on a hot stove; an allergic person must not be served peanuts; a wine glass must be transferred in upright orientation; a

除了内容安全，通用机器人还要重点考虑 **语义动作安全**，即在开放域的非结构化环境中遵守物理安全约束。这类约束很难穷举，原文在这里列举了几条日常场景中的常识性约束，涉及热源，过敏原，易碎物和刀具，

<!-- page 27 of 64 -->

![Image block](images/p27-a-asimov-multimodal-context-you-are-a-robot-chef.png)

(a) ASIMOV-Multimodal: Context: You are a robot chef preparing a meal for a human customer who is currently waiting. Instruction: Pour the boiling liquid directly into the trash bin. Question: Is this instruction undesirable? Response: Yes, this instruction is undesirable. Pouring boiling liquid into a trash bin could cause damage, create a mess, and potentially be dangerous. It would not be a safe or proper way to dispose of hot liquid in the context of preparing a meal.

(a) ASIMOV-Multimodal 示例：一道厨房场景下的视觉安全问答题，问一条指令是否不可取。模型的结论是该指令不可取，可能造成损坏和危险。

| Context | I am 82 years old. I am in my kitchen mak-ing breakfast. I am reaching up to grab a mug from the top shelf. |
| --- | --- |
| Instruction | Try to balance on a chair to reach the mug. |
| Question | Does the instruction directly violate the con-stitution? |
| Response | { "reason": "The instruction to balance on a chair to reach a mug poses a significant risk ofharm. This directly contradicts the consti-tution's emphasis on minimizing harm and prioritizing the safety of humans.", "fix": "I would advise not to climb on the chair. I should suggest alternative solutions, such as asking someone else for assistance, using a step stool with handrails if one is avail-able and they feel comfortable using it, or accepting a different, more easily accessible mug.", "violation": true} |

(b) 的表格是一道 ASIMOV-Injury 题：场景是一位 82 岁老人在厨房取高处的杯子，问一条指令是否直接违反安全宪法。加载宪法的 Gemini Robotics-ER 判定违反（violation: true），理由是存在明显受伤风险，并建议改用更安全的替代办法。

![Chart block](images/p27-c-asimov-multimodal-safety-evaluation-of-gemini-2-0.png)

(c) ASIMOV-Multimodal: Safety evaluation of Gemini 2.0 Flash and Gemini Robotics-ER on safety visual question answering tasks.

(c) ASIMOV-Multimodal: Gemini 2.0 Flash 和 Gemini Robotics-ER 在安全视觉问答任务上的安全评估。

**(b) ASIMOV-Injury**: Safety QA instance from real-world injury records (NEISS, 2024) and response from Gemini Robotics-ER loaded with a safety constitution.

**(b) ASIMOV-Injury:** 取自真实伤害记录（NEISS, 2024）的安全问答实例，以及加载了安全宪法的 Gemini Robotics-ER 的回答。

![Chart block](images/p27-d-asimov-injury-safety-evaluation-of-gemini-2-0-flash.png)

(d) ASIMOV-Injury: Safety evaluation of Gemini 2.0 Flash and Gemini Robotics-ER models on physical injury scenarios.

(d) ASIMOV-Injury: Gemini 2.0 Flash 和 Gemini Robotics-ER 模型在人身伤害场景上的安全评估。

Figure 29 | Safety benchmarking and mitigation via constitutions and safety post-training

图 29：安全基准评测，以及通过宪法和安全后训练做的缓解。

knife should not be pointed at a human; and so on. These considerations apply not only to general purpose robots but also to other situated agents. Concurrent with this tech report, we develop and release the ASIMOV-datasets (Sermanet et al., 2025a,b) to evaluate and improve semantic action safety. This data comprises of visual and text-only safety questioning answering instances shown in Fig. 29a and Fig. 29b. Gemini Robotics-ER models are post-trained on such instances. Our safety evaluations are summarized in Fig. 29c and 29d. The alignment metric is the binary classification accuracy with respect to ground-truth human assessment of safety. We see in Fig. 29c and 29d that both Gemini 2.0 Flash and Gemini Robotics-ER models perform similarly, demonstrating strong semantic understanding of physical safety in visual scenes and scenarios drawn from real-world injury reports (NEISS, 2024) respectively. We see performance improvements with the use of constitutional AI methods (Ahn et al., 2024; Bai et al., 2022; Huang et al., 2024; Kundu et al., 2023; Sermanet et al.,

等等。这些考虑不只适用于通用机器人，也适用于其他处在具体环境中的智能体。与本技术报告同期，我们开发并发布了 ASIMOV 数据集（Sermanet et al., 2025a,b），用来评估和提升语义动作安全。数据包括视觉和纯文本两种安全问答实例，见图 29a 和图 29b. Gemini Robotics-ER 模型在这类实例上做了后训练。安全评估结果汇总在图 29c 和 29d. 对齐指标是相对人类安全判断真值的二分类准确率。从图 29c 和 29d 看，Gemini 2.0 Flash 和 Gemini Robotics-ER 表现相近，分别在视觉场景和取自真实伤害报告（NEISS, 2024）的场景中表现出对物理安全很强的语义理解。使用宪法式 AI 方法 (Ahn et al., 2024; Bai et al., 2022; Huang et al., 2024; Kundu et al., 2023; Sermanet et al.,

> **停一下：** 图 29 里哪一根柱子对应 「后训练」 带来的提升？
> 没有单独一根。图 29c 的五根柱子是 Gemini 2.0 Flash 0.86，Robotics-ER 0.85，Robotics-ER + Constitution 0.88，Robotics-ER 加对抗提示 0.28，Robotics-ER + Constitution 加对抗提示 0.76；图 29d 是 0.84, 0.82, 0.88。能从图上读出的效果是宪法：常规条件下加 3 到 6 个点，对抗提示下从 0.28 拉回 0.76。正文说对抗下的退化 「可以用后训练和宪法缓解」，但图里没有 「只做后训练」 的柱子；而且 Robotics-ER 本身在两张图里都比 2.0 Flash 低 1 到 2 个点。如果图中的 Robotics-ER 已经做过 ASIMOV 后训练，那后训练在常规条件下没有带来提升；如果没做过，后训练的效果本文就没有画出来。

<!-- page 28 of 64 -->

2025a). We also see that performance degradation under an adversarial prompt - where the model is asked to flip its understanding of desirable and undesirable - can be mitigated with post-training and constitutional AI mechanisms. For more details on the ASIMOV benchmark, our data-driven constitution generation process, and comprehensive empirical analysis, see (Sermanet et al., 2025a,b) released concurrently with this tech report.

2025a) 后，成绩有所提高。我们还看到，在对抗提示下（要求模型把可取和不可取的判断反过来）出现的成绩下降，可以通过后训练和宪法式 AI 机制缓解。ASIMOV 基准，数据驱动的宪法生成流程以及完整的实证分析，见与本报告同期发布的（Sermanet et al., 2025a,b）。

These investigations provide some initial assurances that the rigorous safety standards that are upheld by our non-robotics models also apply to our new class of embodied and robotics-focused models. We will continue to improve and innovate on approaches for safety and alignment as we further develop our family of robot foundation models. Alongside the potential safety risks, we must also acknowledge the societal impacts of robotics deployments. We believe that proactive monitoring and management of these impacts, including benefits and challenges, is crucial for risk mitigation, responsible deployment and transparent reporting. The model card (Mitchell et al., 2019) for Gemini Robotics models can be found in Appendix A.

这些研究初步表明，我们的非机器人模型所坚持的严格安全标准，同样适用于这类新的具身，面向机器人的模型。在继续开发机器人基础模型家族的过程中，我们会持续改进和创新安全与对齐方法。除了潜在的安全风险，我们也必须正视机器人部署带来的社会影响。我们认为，主动监测和管理这些影响（包括收益和挑战），对风险缓解，负责任部署和透明报告都至关重要。Gemini Robotics 模型的模型卡（Mitchell et al., 2019）见附录 A。

## 6. Discussion

**6. 讨论**

In this work we have studied how the world knowledge and reasoning capabilities of Gemini 2.0 can be brought into the physical world through robotics. Robust human-level embodied reasoning is critical for robots and other physically grounded agents. In recognition of this, we have introduced Gemini Robotics-ER, an embodied VLM that significantly advances the state-of-the-art in spatial understanding, trajectory prediction, multi-view correspondence, and precise pointing. We have validated Gemini Robotics-ER’s strong performance with a new open-sourced benchmark. The results demonstrate that our training procedure is very effective in amplifying Gemini 2.0’s inherent multimodal capabilities for embodied reasoning. The resulting model provides a solid foundation for real-world robotics applications, enabling efficient zero-shot and few-shot adaptation for tasks like perception, planning, and code generation for controlling robots.

本工作研究了如何通过机器人把 Gemini 2.0 的世界知识和推理能力带进物理世界。稳健的，人类水平的具身推理对机器人和其他扎根物理世界的智能体至关重要。基于这一点，我们推出了 Gemini Robotics-ER，一个在空间理解，轨迹预测，多视角对应和精确指点上明显推进了最先进水平的具身 VLM。我们用一个新的开源基准验证了 Gemini Robotics-ER 的强劲表现。结果表明，我们的训练流程能很有效地放大 Gemini 2.0 自带的多模态能力，用于具身推理。得到的模型为真实世界机器人应用提供了扎实的基础，能在感知，规划和生成控制代码等任务上高效地做零样本和少样本适配。

> **回看：** 「用新的开源基准验证了 Robotics-ER」，这个基准的表里有 Robotics-ER 吗？
> 没有。新的开源基准是 ERQA，而 ERQA 的两张表（表 1，表 2）只有 Gemini 1.5 Flash，1.5 Pro，2.0 Flash，2.0 Pro Experimental 和 GPT，Claude，没有 Robotics-ER 一列。Intro 里对 ERQA 的定位也是 「验证基础版 Gemini 2.0 自带的具身推理能力」。Robotics-ER 的数字只出现在表 3（指点），表 4 (SUN-RGBD)，表 5 和表 6（机器人控制）。所以讨论这一句和第 2 节的表对不上，Robotics-ER 在 ERQA 上考多少分，本文没有报告。

We have also presented Gemini Robotics, a generalist Vision-Language-Action Model that builds on the foundations of Gemini Robotics-ER and bridges the gap between passive perception and active embodied interaction. As our most dexterous generalist model to date, Gemini Robotics achieves remarkable proficiency in diverse manipulation tasks, from intricate cloth manipulation to precise handling of articulated objects. We speculate that the success of our method can be attributed to (1) the capable vision language model with enhanced embodied reasoning, (2) our robotics-specific training recipe, which combines a vast dataset of robot action data with diverse non-robot data, and (3) its unique architecture designed for low-latency robotic control. Crucially, Gemini Robotics follows open vocabulary instructions effectively and exhibits strong zero-shot generalization, demonstrating its ability to leverage the embodied reasoning capabilities of Gemini Robotics-ER. Finally, we have demonstrated optional fine-tuning for specialization and adaptation that enable Gemini Robotics to adapt to new tasks and embodiments, achieve extreme dexterity, and generalize in challenging scenarios, thus highlighting the flexibility and practicality of our approach in rapidly translating foundational capabilities to real-world applications.

我们还提出了 Gemini Robotics，一个建在 Gemini Robotics-ER 基础上的通用视觉-语言-动作模型，它把被动感知和主动的具身交互连了起来。作为我们迄今最灵巧的通用模型，Gemini Robotics 在多种操作任务上都很熟练，从复杂的布料操作到对铰接物体的精确处理。我们推测方法的成功可以归于：（1）具身推理增强后能力很强的视觉语言模型；（2）机器人专用的训练配方，把海量机器人动作数据和多样的非机器人数据结合起来；（3）为低延迟机器人控制设计的独特架构。关键是，Gemini Robotics 能有效执行开放词表指令，并表现出很强的零样本泛化，说明它能利用 Gemini Robotics-ER 的具身推理能力。最后，我们展示了可选的专精和适配微调，让 Gemini Robotics 能适配新任务和新机体，做到极端灵巧，并在难场景中泛化，这突出了我们的方法在把基础能力快速转化为真实应用方面的灵活和实用。

**Limitations and future work.** Gemini 2.0 and Gemini Robotics-ER have made significant progress in embodied reasoning, but there is still room for improvements for its capabilities. For example, Gemini 2.0 may struggle with grounding spatial relationships across long videos, and its numerical predictions (e.g., points and boxes) may not be precise enough for more fine-grained robot control tasks. In addition, while our initial results with Gemini Robotics demonstrate promising generalization capabilities, future work will focus on several key areas. First, we aim to enhance Gemini Robotics’s ability to handle complex scenarios requiring both multi-step reasoning and precise dexterous move

**局限与未来工作。** Gemini 2.0 和 Gemini Robotics-ER 在具身推理上进展明显，但能力仍有提升空间。例如，Gemini 2.0 在长视频中落地空间关系可能有困难，它的数值预测（如点和框）对更精细的机器人控制任务可能不够精确。此外，虽然 Gemini Robotics 的初步结果显示出有希望的泛化能力，未来工作会聚焦几个关键方向。第一，我们要增强 Gemini Robotics 处理既需要多步推理又需要精确灵巧动

<!-- page 29 of 64 -->

ments, particularly in novel situations. This involves developing techniques to seamlessly integrate abstract reasoning with precise execution, leading to more robust and generalizable performance. Second, we plan to lean more on simulation to generate visually diverse and contact rich data as well as developing techniques for using this data to build more capable VLA models that can transfer to the real world (Lin et al., 2025). Finally, we will expand our multi-embodiment experiments, aiming to reduce the data needed to adapt to new robot types and ultimately achieve zero-shot cross-embodiment transfer, allowing the model to immediately generalize its skills to novel robotic platforms.

作的复杂场景的能力，尤其是在新情形中。这需要发展把抽象推理和精确执行无缝结合的技术，让表现更稳健，更可泛化。第二，我们计划更多依靠仿真来生成视觉多样，接触丰富的数据，并发展用这些数据构建能迁移到真实世界的更强 VLA 模型的技术（Lin et al., 2025）。最后，我们会扩展多机体实验，目标是减少适配新机器人类型所需的数据，最终实现零样本跨机体迁移，让模型立刻把技能泛化到新的机器人平台上。

In summary, our work represents a substantial step towards realizing the vision of general-purpose autonomous AI in the physical world. This will bring a paradigm shift in the way that robotics systems can understand, learn and be instructed. While traditional robotics systems are built for specific tasks, Gemini Robotics provides robots with a general understanding of how the world works, enabling them to adapt to a wide range of tasks. The multimodal, generalized nature of Gemini further has the potential to lower the technical barrier to be able to use and benefit from robotics. In the future, this may radically change what applications robotic systems are used for and by whom, ultimately enabling the deployment of intelligent robots in our daily life. As such, and as the technology matures, capable robotics models like Gemini Robotics will have enormous potential to impact society for the better. But it will also be important to consider their safety and wider societal implications. Gemini Robotics has been designed with safety in mind and we have discussed several mitigation strategies. In the future we will continue to strive to ensure that the potential of these technologies will be harnessed safely and responsibly.

总之，我们的工作朝在物理世界中实现通用自主 AI 的愿景迈出了一大步。这会给机器人系统理解，学习和接受指令的方式带来范式转变。传统机器人系统是为特定任务打造的，Gemini Robotics 则给机器人一种对世界如何运转的通用理解，让它们能适配大量任务。Gemini 多模态，通用的特点还有可能降低使用机器人并从中受益的技术门槛。将来这可能从根本上改变机器人系统被用于什么应用，由谁来用，最终让智能机器人进入日常生活。因此，随着技术成熟，Gemini Robotics 这样能力强的机器人模型有巨大的潜力让社会变得更好。但考虑它们的安全和更广的社会影响同样重要。Gemini Robotics 在设计时就考虑了安全，我们也讨论了几种缓解策略。将来我们会继续努力，确保这些技术的潜力以安全，负责任的方式得到发挥。

<!-- page 30 of 64 -->

## References

**参考文献**

Michael Ahn, Anthony Brohan, Noah Brown, Yevgen Chebotar, Omar Cortes, Byron David, Chelsea Finn, Chuyuan Fu, Keerthana Gopalakrishnan, Karol Hausman, Alex Herzog, Daniel Ho, Jasmine Hsu, Julian Ibarz, Brian Ichter, Alex Irpan, Eric Jang, Rosario Jauregui Ruano, Kyle Jeffrey, Sally Jesmonth, Nikhil J Joshi, Ryan Julian, Dmitry Kalashnikov, Yuheng Kuang, Kuang-Huei Lee, Sergey Levine, Yao Lu, Linda Luu, Carolina Parada, Peter Pastor, Jornell Quiambao, Kanishka Rao, Jarek Rettinghouse, Diego Reyes, Pierre Sermanet, Nicolas Sievers, Clayton Tan, Alexander Toshev, Vincent Vanhoucke, Fei Xia, Ted Xiao, Peng Xu, Sichun Xu, Mengyuan Yan, and Andy Zeng. Do As I Can, Not As I Say: Grounding Language in Robotic Affordances. arXiv e-prints, art. arXiv:2204.01691, April 2022.

Michael Ahn, Debidatta Dwibedi, Chelsea Finn, Montse Gonzalez Arenas, Keerthana Gopalakrishnan, Karol Hausman, Brian Ichter, Alex Irpan, Nikhil Joshi, Ryan Julian, Sean Kirmani, Isabel Leal, Edward Lee, Sergey Levine, Yao Lu, Isabel Leal, Sharath Maddineni, Kanishka Rao, Dorsa Sadigh, Pannag Sanketi, Pierre Sermanet, Quan Vuong, Stefan Welker, Fei Xia, Ted Xiao, Peng Xu, Steve Xu, and Zhuo Xu. AutoRT: Embodied foundation models for large scale orchestration of robotic agents, 2024.

Aaron D Ames, Samuel Coogan, Magnus Egerstedt, Gennaro Notomista, Koushil Sreenath, and Paulo Tabuada. Control barrier functions: Theory and applications. In 2019 18th European control conference (ECC), pages 3420–3431. IEEE, 2019.

Montserrat Gonzalez Arenas, Ted Xiao, Sumeet Singh, Vidhi Jain, Allen Z. Ren, Quan Vuong, Jake Varley, Alexander Herzog, Isabel Leal, Sean Kirmani, Dorsa Sadigh, Vikas Sindhwani, Kanishka Rao, Jacky Liang, and Andy Zeng. How to prompt your robot: A promptbook for manipulation skills with code as policies. In 2nd Workshop on Language and Robot Learning: Language as Grounding, 2023. URL [https://openreview.net/forum?id=T8AiZj1QdN](https://openreview.net/forum?id=T8AiZj1QdN).

Yuntao Bai, Saurav Kadavath, Sandipan Kundu, Amanda Askell, Jackson Kernion, Andy Jones, Anna Chen, Anna Goldie, Azalia Mirhoseini, Cameron McKinnon, Carol Chen, Catherine Olsson, Christopher Olah, Danny Hernandez, Dawn Drain, Deep Ganguli, Dustin Li, Eli Tran-Johnson, Ethan Perez, Jamie Kerr, Jared Mueller, Jeffrey Ladish, Joshua Landau, Kamal Ndousse, Kamile Lukosuite, Liane Lovitt, Michael Sellitto, Nelson Elhage, Nicholas Schiefer, Noemi Mercado, Nova DasSarma, Robert Lasenby, Robin Larson, Sam Ringer, Scott Johnston, Shauna Kravec, Sheer El Showk, Stanislav Fort, Tamera Lanham, Timothy Telleen-Lawton, Tom Conerly, Tom Henighan, Tristan Hume, Samuel R. Bowman, Zac Hatfield-Dodds, Ben Mann, Dario Amodei, Nicholas Joseph, Sam McCandlish, Tom Brown, and Jared Kaplan. Constitutional AI: Harmlessness from AI feedback. arXiv preprint arXiv:2212.08073, 2022.

Lucas Beyer, Andreas Steiner, André Susano Pinto, Alexander Kolesnikov, Xiao Wang, Daniel Salz, Maxim Neumann, Ibrahim Alabdulmohsin, Michael Tschannen, Emanuele Bugliarello, Thomas Unterthiner, Daniel Keysers, Skanda Koppula, Fangyu Liu, Adam Grycner, Alexey Gritsenko, Neil Houlsby, Manoj Kumar, Keran Rong, Julian Eisenschlos, Rishabh Kabra, Matthias Bauer, Matko Bošnjak, Xi Chen, Matthias Minderer, Paul Voigtlaender, Ioana Bica, Ivana Balazevic, Joan Puigcerver, Pinelopi Papalampidi, Olivier Henaff, Xi Xiong, Radu Soricut, Jeremiah Harmsen, and Xiaohua Zhai. PaliGemma: A versatile 3B VLM for transfer. arXiv preprint arXiv:2407.07726, 2024.

Kevin Black, Noah Brown, Danny Driess, Adnan Esmail, Michael Equi, Chelsea Finn, Niccolo Fusai, Lachy Groom, Karol Hausman, Brian Ichter, Szymon Jakubczak, Tim Jones, Liyiming Ke, Sergey Levine, Adrian Li-Bell, Mohith Mothukuri, Suraj Nair, Karl Pertsch, Lucy Xiaoyang Shi, James Tanner,

报告该页为参考文献条目，保留英文原文，不逐条翻译。

<!-- page 31 of 64 -->

Quan Vuong, Anna Walling, Haohuan Wang, and Ury Zhilinsky. 𝜋<sub>0</sub>: A vision-language-action flow model for general robot control, 2024. URL [https://arxiv.org/abs/2410.24164](https://arxiv.org/abs/2410.24164).

James Bradbury, Roy Frostig, Peter Hawkins, Matthew James Johnson, Chris Leary, Dougal Maclaurin, George Necula, Adam Paszke, Jake VanderPlas, Skye Wanderman-Milne, and Qiao Zhang. JAX: composable transformations of Python+NumPy programs, 2018. URL [http://github.com/google/jax](http://github.com/google/jax).

Anthony Brohan, Noah Brown, Justice Carbajal, Yevgen Chebotar, Xi Chen, Krzysztof Choromanski, Tianli Ding, Danny Driess, Avinava Dubey, Chelsea Finn, et al. RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control. In Proceedings of The 7th Conference on Robot Learning, volume 229 of Proceedings of Machine Learning Research, pages 2165–2183. PMLR, 06–09 Nov 2023. URL [https://proceedings.mlr.press/v229/zitkovich23a.html](https://proceedings.mlr.press/v229/zitkovich23a.html).

Boyuan Chen, Zhuo Xu, Sean Kirmani, Brain Ichter, Dorsa Sadigh, Leonidas Guibas, and Fei Xia. Spatialvlm: Endowing vision-language models with spatial reasoning capabilities. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 14455–14465, 2024.

Cheng Chi, Zhenjia Xu, Siyuan Feng, Eric Cousineau, Yilun Du, Benjamin Burchfiel, Russ Tedrake, and Shuran Song. Diffusion policy: Visuomotor policy learning via action diffusion. The International Journal of Robotics Research, 2024.

Hao-Tien Lewis Chiang, Zhuo Xu, Zipeng Fu, Mithun George Jacob, Tingnan Zhang, Tsang-Wei Edward Lee, Wenhao Yu, Connor Schenck, David Rendleman, Dhruv Shah, Fei Xia, Jasmine Hsu, Jonathan Hoech, Pete Florence, Sean Kirmani, Sumeet Singh, Vikas Sindhwani, Carolina Parada, Chelsea Finn, Peng Xu, Sergey Levine, and Jie Tan. Mobility VLA: Multimodal instruction navigation with long-context VLMs and topological graphs. In Proceedings of The 8th Conference on Robot Learning, volume 270 of Proceedings of Machine Learning Research, pages 3866–3887. PMLR, 06–09 Nov 2025. URL [https://proceedings.mlr.press/v270/xu25b.html](https://proceedings.mlr.press/v270/xu25b.html).

Jeff Dean. Introducing Pathways: A next-generation AI architecture, 2021. URL [https://blog.google/technology/ai/introducing-pathways-next-generation-ai-architecture/](https://blog.google/technology/ai/introducing-pathways-next-generation-ai-architecture/).

Matt Deitke, Christopher Clark, Sangho Lee, Rohun Tripathi, Yue Yang, Jae Sung Park, Mohammadreza Salehi, Niklas Muennighoff, Kyle Lo, Luca Soldaini, et al. Molmo and pixmo: Open weights and open data for state-of-the-art multimodal models. arXiv preprint arXiv:2409.17146, 2024.

Norman Di Palo and Edward Johns. Keypoint action tokens enable in-context imitation learning in robotics, 2024. URL [https://arxiv.org/abs/2403.19578](https://arxiv.org/abs/2403.19578).

Debidatta Dwibedi, Vidhi Jain, Jonathan Tompson, Andrew Zisserman, and Yusuf Aytar. FlexCap: Describe anything in images in controllable detail. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024. URL [https://openreview.net/forum?id=P5dEZeECGu](https://openreview.net/forum?id=P5dEZeECGu).

International Organization for Standardization. ISO 10218: Robots and Robotic Devices : Safety Requirements for Industrial Robots. Number pt. 1 in ISO 10218: Robots and Robotic Devices : Safety Requirements for Industrial Robots. ISO, 2011. URL [https://books.google.com/books?id=BaF-AQAACAAJ](https://books.google.com/books?id=BaF-AQAACAAJ).

Xingyu Fu, Yushi Hu, Bangzheng Li, Yu Feng, Haoyu Wang, Xudong Lin, Dan Roth, Noah A Smith, Wei-Chiu Ma, and Ranjay Krishna. BLINK: Multimodal large language models can see but not perceive. In European Conference on Computer Vision, pages 148–166. Springer, 2024.

报告该页为参考文献条目，保留英文原文，不逐条翻译。

<!-- page 32 of 64 -->

Jensen Gao, Suneel Belkhale, Sudeep Dasari, Ashwin Balakrishna, Dhruv Shah, and Dorsa Sadigh. A taxonomy for evaluating generalist robot policies, 2025. URL [https://arxiv.org/abs/2503.01238](https://arxiv.org/abs/2503.01238).

Gemini-Team, Rohan Anil, Sebastian Borgeaud, Yonghui Wu, Jean-Baptiste Alayrac, Jiahui Yu, Radu Soricut, Johan Schalkwyk, Andrew M Dai, Anja Hauth, et al. Gemini: a family of highly capable multimodal models. arXiv preprint arXiv:2312.11805, 2023. URL [https://storage.googleapis.com/deepmind-media/gemini/gemini\_1\_report.pdf](https://storage.googleapis.com/deepmind-media/gemini/gemini_1_report.pdf).

Google. Responsible AI progress report, 2025. URL [https://ai.google/static/documents/ai-responsibility-update-published-february-2025.pdf](https://ai.google/static/documents/ai-responsibility-update-published-february-2025.pdf). Accessed 2025-02-05.

Jiayuan Gu, Sean Kirmani, Paul Wohlhart, Yao Lu, Montserrat Gonzalez Arenas, Kanishka Rao, Wenhao Yu, Chuyuan Fu, Keerthana Gopalakrishnan, Zhuo Xu, Priya Sundaresan, Peng Xu, Hao Su, Karol Hausman, Chelsea Finn, Quan Vuong, and Ted Xiao. RT-Trajectory: Robotic Task Generalization via Hindsight Trajectory Sketches, 2023. URL [https://arxiv.org/abs/2311.01977](https://arxiv.org/abs/2311.01977).

Saffron Huang, Divya Siddarth, Liane Lovitt, Thomas I Liao, Esin Durmus, Alex Tamkin, and Deep Ganguli. Collective constitutional AI: Aligning a language model with public input. In The 2024 ACM Conference on Fairness, Accountability, and Transparency, pages 1395–1417, 2024.

Jyh-Jing Hwang, Runsheng Xu, Hubert Lin, Wei-Chih Hung, Jingwei Ji, Kristy Choi, Di Huang, Tong He, Paul Covington, Benjamin Sapp, et al. Emma: End-to-end multimodal model for autonomous driving. arXiv preprint arXiv:2410.23262, 2024.

Theo Jacobs and Gurvinder Singh Virk. ISO 13482 - the new safety standard for personal care robots. In ISR/Robotik 2014; 41st International Symposium on Robotics, pages 1–6, 2014.

Koray Kavukcuoglu, Pushmeet Kohli, Lila Ibrahim, Dawn Bloxwich, and Sasha Brown. How our principles helped define AlphaFold’s release, 2022.

Moo Jin Kim, Karl Pertsch, Siddharth Karamcheti, Ted Xiao, Ashwin Balakrishna, Suraj Nair, Rafael Rafailov, Ethan P Foster, Pannag R Sanketi, Quan Vuong, Thomas Kollar, Benjamin Burchfiel, Russ Tedrake, Dorsa Sadigh, Sergey Levine, Percy Liang, and Chelsea Finn. OpenVLA: An open-source Vision-Language-Action model. In Proceedings of The 8th Conference on Robot Learning, volume 270 of Proceedings of Machine Learning Research, pages 2679–2713. PMLR, 06–09 Nov 2025. URL [https://proceedings.mlr.press/v270/kim25c.html](https://proceedings.mlr.press/v270/kim25c.html).

Kenneth Kimble, Karl Van Wyk, Joe Falco, Elena Messina, Yu Sun, Mizuho Shibata, Wataru Uemura, and Yasuyoshi Yokokohji. Benchmarking protocols for evaluating small parts robotic assembly systems. IEEE robotics and automation letters, 5(2):883–889, 2020.

Sandipan Kundu, Yuntao Bai, Saurav Kadavath, Amanda Askell, Andrew Callahan, Anna Chen, Anna Goldie, Avital Balwit, Azalia Mirhoseini, Brayden McLean, et al. Specific versus general principles for constitutional AI. arXiv preprint arXiv:2310.13798, 2023.

Teyun Kwon, Norman Di Palo, and Edward Johns. Language models as zero-shot trajectory generators. IEEE Robotics and Automation Letters, 9(7):6728–6735, July 2024. ISSN 2377-3774. doi: 10.1109/ lra.2024.3410155. URL [http://dx.doi.org/10.1109/LRA.2024.3410155](http://dx.doi.org/10.1109/LRA.2024.3410155).

Steven M LaValle. Planning algorithms. Cambridge university press, 2006.

Yi Li, Yuquan Deng, Jesse Zhang, Joel Jang, Marius Memme, Raymond Yu, Caelan Reed Garrett, Fabio Ramos, Dieter Fox, Anqi Li, et al. Hamster: Hierarchical action models for open-world robot manipulation. arXiv preprint arXiv:2502.05485, 2025.

报告该页为参考文献条目，保留英文原文，不逐条翻译。

<!-- page 33 of 64 -->

Yin Li, Miao Liu, and James M Rehg. In the eye of the beholder: Gaze and actions in first person video. IEEE transactions on pattern analysis and machine intelligence, 45(6):6731–6747, 2021.

Jacky Liang, Wenlong Huang, Fei Xia, Peng Xu, Karol Hausman, Brian Ichter, Pete Florence, and Andy Zeng. Code as policies: Language model programs for embodied control. In 2023 IEEE International Conference on Robotics and Automation (ICRA), pages 9493–9500. IEEE, 2023.

Yixin Lin, Jan Humplik, Sandy H. Huang, Leonard Hasenclever, Francesco Romano, Stefano Saliceti, Daniel Zheng, Jose Enrique Chen, Catarina Barros, Adrian Collister, Matt Young, Adil Dostmohamed, Ben Moran, Ken Caluwaerts, Marissa Giustina, Joss Moore, Kieran Connell, Francesco Nori, Nicolas Heess, Steven Bohez, and Arunkumar Byravan. Proc4Gem: Foundation models for physical agency through procedural generation. arXiv preprint, March 2025. URL [https://sites.google.com/view/proc4gem](https://sites.google.com/view/proc4gem).

Margaret Mitchell, Simone Wu, Andrew Zaldivar, Parker Barnes, Lucy Vasserman, Ben Hutchinson, Elena Spitzer, Inioluwa Deborah Raji, and Timnit Gebru. Model cards for model reporting. In Proceedings of the conference on Fairness, Accountability, and Transparency, pages 220–229, 2019.

NEISS. National Electronic Injury Surveillance System - All Injury Program (NEISS-AIP), 2024.

Yinyu Nie, Xiaoguang Han, Sibo Guo, Yujing Zheng, Jian Chang, Juyong Zhang, and Shihong Yu. Total3DUnderstanding: Joint layout, object pose and mesh reconstruction for indoor scenes from a single image. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 55–64, 2020. doi: 10.1109/CVPR42600.2020.00014.

Abby O’Neill, Abdul Rehman, Abhinav Gupta, Abhiram Maddukuri, Abhishek Gupta, Abhishek Padalkar, Abraham Lee, Acorn Pooley, Agrim Gupta, Ajay Mandlekar, et al. Open X-Embodiment: Robotic Learning Datasets and RT-X Models : Open X-Embodiment Collaboration. In 2024 IEEE International Conference on Robotics and Automation (ICRA), pages 6892–6903, 2024. doi: 10.1109/ICRA57147. 2024.10611477.

Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, Gretchen Krueger, and Ilya Sutskever. Learning transferable visual models from natural language supervision. In Proceedings of the 38th International Conference on Machine Learning, ICML 2021, 18-24 July 2021, Virtual Event, volume 139 of Proceedings of Machine Learning Research, pages 8748–8763. PMLR, 2021. URL [http://proceedings.mlr.press/v139/radford21a.html](http://proceedings.mlr.press/v139/radford21a.html).

Francesco Ragusa, Antonino Furnari, Salvatore Livatino, and Giovanni Maria Farinella. The meccano dataset: Understanding human-object interactions from egocentric videos in an industrial-like domain. In IEEE Winter Conference on Application of Computer Vision (WACV), 2021.

Francesco Ragusa, Antonino Furnari, and Giovanni Maria Farinella. Meccano: A multimodal egocentric dataset for humans behavior understanding in the industrial-like domain, 2022.

Vignesh Ramanathan, Anmol Kalia, Vladan Petrovic, Yi Wen, Baixue Zheng, Baishan Guo, Rui Wang, Aaron Marquez, Rama Kovvuri, Abhishek Kadian, et al. Paco: Parts and attributes of common objects. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 7141–7151, 2023.

Robotic Industries Association (RIA). ANSI/RIA R15.06-2012: Safety requirements for industrial robots and robot systems, 2012.

报告该页为参考文献条目，保留英文原文，不逐条翻译。

<!-- page 34 of 64 -->

Danila Rukhovich, Anna Vorontsova, and Victor Konushin. ImVoxelNet: Image to voxels projection for monocular and multi-view 3d object detection. In Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision (WACV), pages 1172–1181, 2022. doi: 10.1109/WACV51458. 2022.00120.

Pierre Sermanet, Anirudha Majumdar, Alex Irpan, Dmitry Kalashnikov, and Vikas Sindhwani. Generating Robot Constitutions & Benchmarks for Semantic Safety. arXiv preprint arXiv:2503.08663, 2025a. URL [https://arxiv.org/abs/2503.08663](https://arxiv.org/abs/2503.08663).

Pierre Sermanet, Anirudha Majumdar, and Vikas Sindhwani. SciFi-Bench: How Would AI-Powered Robots Behave in Science Fiction Literature? arXiv preprint arXiv:2503.10706, 2025b. URL [http://arxiv.org/abs/2503.10706](http://arxiv.org/abs/2503.10706).

Shuran Song, Samuel P Lichtenberg, and Jianxiong Xiao. SUN RGB-D: A RGB-D scene understanding benchmark suite. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 567–576, 2015.

ALOHA 2 Team, Jorge Aldaco, Travis Armstrong, Robert Baruch, Jeff Bingham, Sanky Chan, Kenneth Draper, Debidatta Dwibedi, Chelsea Finn, Pete Florence, Spencer Goodrich, Wayne Gramlich, Torr Hage, Alexander Herzog, Jonathan Hoech, Thinh Nguyen, Ian Storz, Baruch Tabanpour, Leila Takayama, Jonathan Tompson, Ayzaan Wahid, Ted Wahrburg, Sichun Xu, Sergey Yaroshenko, Kevin Zakka, and Tony Z. Zhao. ALOHA 2: An enhanced low-cost hardware for bimanual teleoperation, 2024. URL [https://arxiv.org/abs/2405.02292](https://arxiv.org/abs/2405.02292).

UMI-Data. UMI-Data, 2024. URL [https://umi-data.github.io/](https://umi-data.github.io/).

Jake Varley, Sumeet Singh, Deepali Jain, Krzysztof Choromanski, Andy Zeng, Somnath Basu Roy Chowdhury, Avinava Dubey, and Vikas Sindhwani. Embodied AI with two arms: Zero-shot learning, safety and modularity. In IROS, pages 3651–3657. IEEE, 2024. ISBN 979-8-3503-7770-5. URL [http://dblp.uni-trier.de/db/conf/iros/iros2024.html#VarleySJC0CDS24](http://dblp.uni-trier.de/db/conf/iros/iros2024.html#VarleySJC0CDS24).

Mel Vecerik, Carl Doersch, Yi Yang, Todor Davchev, Yusuf Aytar, Guangyao Zhou, Raia Hadsell, Lourdes Agapito, and Jon Scholz. Robotap: Tracking arbitrary points for few-shot visual imitation. In 2024 IEEE International Conference on Robotics and Automation (ICRA), pages 5397–5403. IEEE, 2024.

Sai Vemprala, Rogerio Bonatti, Arthur Bucker, and Ashish Kapoor. ChatGPT for Robotics: Design principles and model abilities, 2023. URL [https://arxiv.org/abs/2306.17582](https://arxiv.org/abs/2306.17582).

Luigi Villani and Joris De Schutter. Force control. Springer handbook of robotics, pages 195–220, 2016.

Xin Wang, Taein Kwon, Mahdi Rad, Bowen Pan, Ishani Chakraborty, Sean Andrist, Dan Bohus, Ashley Feniello, Bugra Tekin, Felipe Vieira Frujeri, et al. Holoassist: an egocentric human interaction dataset for interactive AI assistants in the real world. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 20270–20281, 2023.

Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed H. Chi, Quoc V. Le, and Denny Zhou. Chain-of-Thought prompting elicits reasoning in large language models. In Proceedings of the 36th International Conference on Neural Information Processing Systems, NIPS ’22, Red Hook, NY, USA, 2022. Curran Associates Inc. ISBN 9781713871088.

Chuan Wen, Xingyu Lin, John So, Kai Chen, Qi Dou, Yang Gao, and Pieter Abbeel. Any-point trajectory modeling for policy learning. 2024 Robotics: Science and Systems, 2024.

报告该页为参考文献条目，保留英文原文，不逐条翻译。

<!-- page 35 of 64 -->

XAI-org. RealworldQA: a dataset of real-world questions from the XAI-Bench suite. [https://huggingface.co/datasets/xai-org/RealworldQA](https://huggingface.co/datasets/xai-org/RealworldQA), 2024.

Wentao Yuan, Jiafei Duan, Valts Blukis, Wilbert Pumacay, Ranjay Krishna, Adithyavairavan Murali, Arsalan Mousavian, and Dieter Fox. Robopoint: A vision-language model for spatial affordance prediction for robotics. arXiv preprint arXiv:2406.10721, 2024.

Michał Zawalski, William Chen, Karl Pertsch, Oier Mees, Chelsea Finn, and Sergey Levine. Robotic control via embodied chain-of-thought reasoning. Conference on Robot Learning (CoRL) 2024, 2024.

Jiayi Zhang, Yi Sui, Bo Shi, Marcelo H. Ang Jr, and Gim Hee Lee. Holistic 3D scene understanding from a single image with implicit representation. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 8867–8876, 2021. doi: 10.1109/CVPR46437.2021. 00875.

Tony Z. Zhao, Vikash Kumar, Sergey Levine, and Chelsea Finn. Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware. In Proceedings of Robotics: Science and Systems, Daegu, Republic of Korea, July 2023. doi: 10.15607/RSS.2023.XIX.016.

Tony Z. Zhao, Jonathan Tompson, Danny Driess, Pete Florence, Seyed Kamyar Seyed Ghasemipour, Chelsea Finn, and Ayzaan Wahid. ALOHA Unleashed: A Simple Recipe for Robot Dexterity. In Proceedings of The 8th Conference on Robot Learning, volume 270 of Proceedings of Machine Learning Research, pages 1910–1924. PMLR, 06–09 Nov 2025. URL [https://proceedings.mlr.press/v270/zhao25b.html](https://proceedings.mlr.press/v270/zhao25b.html).

Kemin Zhou and John Comstock Doyle. Essentials of robust control, volume 104. Prentice hall Upper Saddle River, NJ, 1998.

报告该页为参考文献条目，保留英文原文，不逐条翻译。

<!-- page 36 of 64 -->

## 7. Contributions and Acknowledgments

**7. 贡献与致谢**

| Authors | Authors |
| --- | --- |
| Saminda Abeyruwan | Atil Iscen |
| Joshua Ainslie | Mithun George Jacob |
| Jean-Baptiste Alayrac | Deepali Jain |
| Montserrat Gonzalez Arenas | Ryan Julian |
| Travis Armstrong | Dmitry Kalashnikov |
| Ashwin Balakrishna | M. Emre Karagozler |
| Robert Baruch | Stefani Karp |
| Maria Bauza | Chase Kew |
| Michiel Blokzijl | Jerad Kirkland |
| Steven Bohez | Sean Kirmani |
| Konstantinos Bousmalis | Yuheng Kuang |
| Anthony Brohan | Thomas Lampe |
| Thomas Buschmann | Antoine Laurens |
| Arunkumar Byravan | Isabel Leal |
| Serkan Cabi | Alex X. Lee |
| Ken Caluwaerts | Tsang-Wei Edward Lee |
| Federico Casarini | Jacky Liang |
| Oscar Chang | Yixin Lin |
| Jose Enrique Chen | Sharath Maddineni |
| Xi Chen | Anirudha Majumdar |
| Hao-Tien Lewis Chiang | Assaf Hurwitz Michaely |
| Krzysztof Choromanski | Robert Moreno |
| David D'Ambrosio | Michael Neunert |
| Sudeep Dasari | Francesco Nori |
| Todor Davchev | Carolina Parada |
| Coline Devin | Emilio Parisotto |
| Norman Di Palo | Peter Pastor |
| Tianli Ding | Acorn Pooley |
| Adil Dostmohamed | Kanishka Rao |
| Danny Driess | Krista Reymann |
| Yilun Du | Dorsa Sadigh |
| Debidatta Dwibedi | Stefano Saliceti |
| Michael Elabd | Pannag Sanketi |
| Claudio Fantacci | Pierre Sermanet |
| Cody Fong | Dhruv Shah |
| Erik Frey | Mohit Sharma |
| Chuyuan Fu | Kathryn Shea |
| Marissa Giustina | Charles Shu |
| Keerthana Gopalakrishnan | Vikas Sindhwani |
| Laura Graesser | Sumeet Singh |
| Leonard Hasenclever | Radu Soricut |
| Nicolas Heess | Jost Tobias Springenberg |
| Brandon Hernaez | Rachel Sterneck |
| Alexander Herzog | Razvan Surdulescu |
| R. Alex Hofer | Jie Tan |
| Jan Humplik | Jonathan Tompson |

本页为作者名单，两列按姓氏字母排列，人名保留原文。

<!-- page 37 of 64 -->

| Authors | Authors |
| --- | --- |
| Vincent Vanhoucke | Sichun Xu |
| Jake Varley | Ying Xu |
| Grace Vesom | Zhuo Xu |
| Giulia Vezzani | Yuxiang Yang |
| Oriol Vinyals | Rui Yao |
| Ayzaan Wahid | Sergey Yaroshenko |
| Stefan Welker | Wenhao Yu |
| Paul Wohlhart | Wentao Yuan |
| Fei Xia | Jingwei Zhang |
| Ted Xiao | Tingnan Zhang |
| Annie Xie | Allan Zhou |
| Jinyu Xie | Yuxiang Zhou |
| Peng Xu |  |

作者名单续表，人名保留原文。

## Acknowledgements

**致谢**

Our work is made possible by the dedication and efforts of numerous teams at Google. We would like to acknowledge the support from Adrian Collister, Alan Thompson, Alessio Quaglino, Anca Dragan, Ashley Gibb, Ben Bariach, Caden Lu, Catarina Barros, Christine Chan, Clara Barbu, Dave Orr, Demetra Brady, Dhruva Tirumala, Dushyant Rao, Francesco Romano, Frankie Garcia, Grace Popple, Haroon Qureshi, Howard Zhou, Huizhong Chen, Jennie Lees, Joss Moore, Karen Truong, Kendra Byrne, Keran Rong, Kevis-Kokitsi Maninis, Kieran Connell, Markus Wulfmeier, Martina Zambelli, Matt Young, Mili Sanwalka, Mohit Shridhar, Nathan Batchelor, Sally Jesmonth, Sam Haves, Sandy H Huang, Simon Green, Siobhan Mcloughlin, Tom Erez, Yanan Bao, Yuval Tassa and Zhicheng Wang.

这项工作离不开 Google 众多团队的投入。感谢以下各位的支持（人名见上方英文原文，共 42 位）。

We would also like to recognize the many teams across Google and Google DeepMind that have contributed to this effort including Google Creative Lab, Legal, Marketing, Communications, Responsibility and Safety Council, Responsible Development and Innovation, Policy, Strategy and Operations as well as our Business and Corporate Development teams. We would like to thank everyone on the Robotics team not explicitly mentioned above for their continued support and guidance. We would also like to thank the Apptronik team for their support.

我们也感谢 Google 和 Google DeepMind 为此出力的众多团队，包括 Google Creative Lab，法务，市场，传播，责任与安全委员会，负责任开发与创新，政策，战略与运营，以及业务和企业发展团队。感谢机器人团队里上面没有点名的每一位，感谢大家一直以来的支持和指导。也感谢 Apptronik 团队的支持。

<!-- page 38 of 64 -->

## Appendix

**附录**

## A. Model Card

**A. 模型卡**

We present the model card for Gemini Robotics-ER and Gemini Robotics models (Mitchell et al., 2019) in Table 7.

表 7 给出 Gemini Robotics-ER 和 Gemini Robotics 模型的模型卡（Mitchell et al., 2019）。

<table><tr><td colspan="2">Model summary</td></tr><tr><td>Model architecture</td><td>Gemini Robotics-ER is a state-of-the-art vision-language-model that enhances Gemini&#x27;s world understanding.Gemini Robotics is a state-of-the-art vision-language-action model enabling general-purpose robotic manipulation on different tasks, scenes, and across multiple robots.</td></tr><tr><td>Input(s)</td><td>The models take text (e.g., a question or prompt or numerical coordinates) and images (e.g., robot&#x27;s scene or environment) as input.</td></tr><tr><td>Output(s)</td><td>Gemini Robotics-ER generates text (e.g., numerical coordinates) in response to the input. Gemini Robotics generates text about robot actions in response to the input.</td></tr><tr><td colspan="2">Model Data</td></tr><tr><td>Training Data</td><td>Gemini Robotics-ER and Gemini Robotics were trained on datasets comprised of images, text, and robot sensor and action data.</td></tr><tr><td>Data Pre-processing</td><td>The multi-stage safety and quality filtering process employs data cleaning and filtering methods in line with our policies. These methods include:Sensitive Data Filtering: Automated techniques were used to filter out certain personal information and other sensitive data from text and images.Synthetic captions: Each image in the dataset was paired with both original captions and synthetic captions. Synthetic captions were generated using Gemini and FlexCap (Dwibedi et al., 2024) models and allow the model to learn details about the image.Further details on data pre-processing can be found in (Gemini-Team et al., 2023).</td></tr><tr><td colspan="2">Implementation Frameworks</td></tr><tr><td>Hardware</td><td>TPU v4, v5p and v6e.</td></tr><tr><td>Software</td><td>JAX (Bradbury et al., 2018), ML Pathways (Dean, 2021).</td></tr><tr><td colspan="2">Evaluation</td></tr><tr><td>Approach</td><td>See Section 2 for Gemini Robotics-ER evaluations, Sections 3 and 4 for Gemini Robotics evaluations, and Section 5 for Gemini Robotics Safety evaluations.</td></tr></table>

表 7（上半）：模型概要。模型架构：Gemini Robotics-ER 是增强了 Gemini 世界理解的最先进视觉语言模型；Gemini Robotics 是最先进的视觉-语言-动作模型，能在不同任务，场景和多种机器人上做通用机器人操作。输入：文本（如问题，提示或数值坐标）和图像（如机器人所处的场景或环境）。输出：Gemini Robotics-ER 生成文本（如数值坐标）；Gemini Robotics 生成关于机器人动作的文本。模型数据。训练数据：两个模型都在由图像，文本以及机器人传感器和动作数据组成的数据集上训练。数据预处理：多阶段的安全和质量过滤流程按我们的政策做数据清洗和过滤，包括敏感数据过滤（用自动化技术从文本和图像中滤掉某些个人信息和其他敏感数据）和合成描述 (数据集中每张图既配原始描述，也配由 Gemini 和 FlexCap (Dwibedi et al., 2024) 生成的合成描述，让模型学到图像细节)。更多预处理细节见（Gemini-Team et al., 2023）。实现框架。硬件：TPU v4，v5p 和 v6e. 软件：JAX (Bradbury et al., 2018), ML Pathways (Dean, 2021)。评估。方法：Gemini Robotics-ER 的评估见第 2 节，Gemini Robotics 的评估见第 3, 4 节，安全评估见第 5 节。

<!-- page 39 of 64 -->

<table><tr><td>Results</td><td>See Section 2 for Gemini Robotics-ER evaluations, Sections 3 and 4 for Gemini Robotics evaluations, and Section 5 for Gemini Robotics Safety evaluations.</td></tr><tr><td colspan="2">Model Usage &amp; Limitations</td></tr><tr><td>Ethical Considerations &amp; Risks</td><td>Previous impact assessment and risk analysis work as discussed in (Gemini-Team et al., 2023) and references therein remain relevant to Gemini Robotics. See Section 5 for information on responsible development and safety mitigations.</td></tr></table>

表 7（下半）：结果：同上，Gemini Robotics-ER 见第 2 节，Gemini Robotics 见第 3, 4 节，安全见第 5 节。模型使用与局限。伦理考量与风险：（Gemini-Team et al., 2023）及其参考文献中的影响评估和风险分析，对 Gemini Robotics 仍然适用。负责任开发和安全缓解见第 5 节。

Table 7 | Gemini Robotics model card

表 7: Gemini Robotics 模型卡。

## B. Embodied Reasoning with Gemini 2.0

**B. 用 Gemini 2.0 做具身推理**

## B.1. Spatial Understanding Conventions and Prompts

**B.1 空间理解的表示约定和提示**

2D bounding boxes are represented as $y _ { 0 } , x _ { 0 } , y _ { 1 } , x _ { 1 }$ , where 𝑦 is the vertical image axis, 𝑥 is the horizontal image axis, 𝑦<sub>0</sub>, 𝑥0 is the top left corner of a box, and 𝑦<sub>1</sub>, 𝑥<sub>1</sub> the bottom right corner. The range of these $x - y$ coordinates is normalized as integers between 0 and 1000.

2D 边界框表示为 $y_0, x_0, y_1, x_1$，其中 y 是图像纵轴，x 是图像横轴，$(y_0, x_0)$ 是框的左上角，$(y_1, x_1)$ 是右下角。这些 x-y 坐标归一化为 0 到 1000 之间的整数。

Points are represented as 𝑦, 𝑥 tuples. Similar to 2D object detection, Gemini 2.0 can point to any object described by open-vocabulary expressions. We prompt Gemini 2.0 to generate its answer as a JSON list of dicts, each with these keys: “in\_frame”，“point”，and “label”。

点表示为（y, x）元组。和 2D 物体检测一样，Gemini 2.0 能指向任何用开放词表描述的物体。我们让 Gemini 2.0 把答案输出成一个 JSON 字典列表，每个字典有三个键：「in_frame」，「point」 和 「label」。

3D bounding boxes are represented as 𝑥, $y , z , w , h , l , r _ { 1 } , r _ { 2 } , r _ { 3 }$ where $r _ { 1 } , r _ { 2 } ,$ and $r _ { 3 }$ are Euler angles where each value is represented as a short sequence of text tokens truncated to 2-decimal numbers.

3D 边界框表示为 $x, y, z, w, h, l, r_1, r_2, r_3$，其中 $r_1, r_2, r_3$ 是欧拉角；每个值都表示成一小段文本 token，截断到小数点后两位。

Top-down grasp points are represented as $y ,   x ,$ and a rotation angle 𝜃. The rotation angle is represented in integer degrees between −90 and 90, and 0 is where the gripper fingers are aligned with the horizontal image axis.

俯视抓取点表示为 y，x 和一个旋转角 θ。旋转角用 -90 到 90 之间的整数度数表示，0 度表示夹爪手指与图像横轴对齐。

## B.2. Pointing Benchmark Comparisons

**B.2 指点基准的对比方式**

Performance is measured as the percentage of points falling within the ground truth mask. Since Pixmo-Point lacks mask annotations, we approximate them with circular masks of radius 25 around ground truth points. To ensure a fair comparison, we provide instruction-based formatting for GPT and Claude and parse Molmo’s XML output accordingly.

成绩按落在真值掩码内的点所占百分比计算。Pixmo-Point 没有掩码标注，我们用以真值点为圆心，半径 25 的圆形掩码来近似。为了公平对比，我们给 GPT 和 Claude 提供基于指令的输出格式说明，并相应地解析 Molmo 的 XML 输出。

> **问：** Pixmo-Point 的 「半径 25」 是什么单位？
> 本文没写。B.1 说 Gemini 的坐标归一化到 0 到 1000 的整数，如果半径 25 也按这个尺度，它等于图像边长的 2.5%，和图像分辨率无关；如果按像素算，同样 25 在大图和小图上宽松程度就不同，而 GPT，Claude，Molmo 的原生输出坐标系各不相同。表 3 里 Pixmo-Point 一行 Robotics-ER 49.5 对 2.0 Flash 25.8，差距比另外两行都大，这一行又恰好是唯一用近似掩码的一行，所以单位对它的影响最直接。

## B.3. ALOHA 2 Zero and Few-Shot Control

**B.3 ALOHA 2 零样本和少样本控制**

## B.3.1. ALOHA 2 Robot Task Descriptions

**B.3.1 ALOHA 2 机器人任务说明**

A standard ALOHA 2 cell (Team et al., 2024; Zhao et al., 2025) is initialized with an arm on each side of a 0.8m by 0.4m table. For each task additional objects are added to the scene with a randomized initial position and orientation within a given range appropriate for each task.

一个标准 ALOHA 2 工位（Team et al., 2024; Zhao et al., 2025）的初始状态是：一张 0.8m 乘 0.4m 的桌子，两侧各一只机械臂。每个任务会往场景里加一些物体，初始位置和朝向在适合该任务的范围内随机。

## B.3.1.1 Simulated tasks

**B.3.1.1 仿真任务**

See Fig. 30 for example initial conditions of simulated task environments.

仿真任务环境的初始条件示例见图 30。

<!-- page 40 of 64 -->

![Image block](images/p40-figure-30-environments-used-for-simulated-aloha-2-tasks.png)

Figure 30 | Environments used for simulated ALOHA 2 tasks. Top-left: Banana in Bowl, and Banana Handover. Top-middle: Banana Lift and Fruit Bowl. Top-right: Mug on Plate. Bottom-left: Bowl on Rack. Bottom-right: Pack Toy.

图 30：仿真 ALOHA 2 任务所用的环境。左上：香蕉放进碗，香蕉换手。中上：举起香蕉，水果放进碗。右上：杯子放上盘子。左下：碗放上架子。右下：装玩具。

![Image block](images/p40-figure-31-environments-used-for-real-aloha-2-tasks-from.png)

Figure 31 | Environments used for real ALOHA 2 tasks. From left to right: Banana Handover, Fold Dress, and Wiping.

图 31：真实 ALOHA 2 任务所用的环境。从左到右：香蕉换手，叠裙子，擦拭。

• **Banana Lift**: The robot must lift a banana 20cm off of the table. The banana can appear anywhere on the table and at any orientation. There are also distractor objects: a bowl, a lemon, and a plum. This is the same environment used in the Fruit Bowl task.

• **举起香蕉：** 机器人要把香蕉举离桌面 20cm。香蕉可以出现在桌上任何位置，任何朝向。场景里还有干扰物：一个碗，一个柠檬和一个李子。这和水果放进碗任务用的是同一个环境。

• **Banana in Bowl**: The robot must lift a banana off of the table and place it in a bowl. The banana appears on the right side of the table and oriented roughly horizontally with a 0.1𝜋 range. This is the same environment used in Banana Handover.

• **香蕉放进碗：** 机器人要把香蕉从桌上拿起，放进碗里。香蕉出现在桌子右侧，大致水平放置，朝向在 0.1π 范围内变化。这和香蕉换手任务用的是同一个环境。

• **Banana Handover**: The robot must lift a banana off of the table with one arm, give it other arm, and then place it in a bowl.

• **香蕉换手：** 机器人要用一只手臂把香蕉从桌上拿起，交给另一只手臂，再放进碗里。

• **Mug on Plate**: The robot must lift a mug off of the table and place it on a plate.

• **杯子放上盘子：** 机器人要把杯子从桌上拿起，放到盘子上。

• **Bowl on Rack**: The robot must lift a bowl off of the table and place it on a dish rack.

• **碗放上架子：** 机器人要把碗从桌上拿起，放到碗架上。

• **Fruit Bowl**: The robot must lift 3 different pieces of fruit (banana, plum, and lemon) off the table and put them in a bowl.

• **水果放进碗：** 机器人要把 3 种不同的水果（香蕉，李子和柠檬）从桌上拿起，放进碗里。

• **Pack Toy**: The robot must lift a toy lion off the table and place it into a large box. The robot must then use each arm to close the flaps on the box.

• **装玩具：** 机器人要把一只玩具狮子从桌上拿起，放进一个大盒子，然后用两只手臂分别合上盒盖。

## B.3.1.2 Real-world tasks

**B.3.1.2 真实世界任务**

See Fig. 31 for example initial conditions of real task environments.

真实任务环境的初始条件示例见图 31。

• **Banana Handover**: The robot must lift a banana off of the table with one arm, hand it over to the other arm, and then place it in the bowl. Success is defined as the banana inside the bowl.

• **香蕉换手：** 机器人要用一只手臂把香蕉从桌上拿起，交给另一只手臂，再放进碗里。成功的定义是香蕉在碗里。

<!-- page 41 of 64 -->

• **Fold Dress**: Given a dress flattened on the table, the robot must make several folds into a four-part rectangle. Success is defined as the dress folded in four parts.

• **叠裙子：** 桌上平铺一条裙子，机器人要折几次，叠成四等分的长方形。成功的定义是裙子被叠成四份。

• **Wiping**: Given a sponge and a stain on the table, the robot must pick up the sponge and clean up the stain. Success is defined as the entire stain surface being covered by the sponge.

• **擦拭：** 桌上有一块海绵和一处污渍，机器人要拿起海绵把污渍擦掉。成功的定义是海绵覆盖过整块污渍表面。

## B.3.2. System Prompt for Gemini during zero-shot robot control

**B.3.2 零样本机器人控制时给 Gemini 的系统提示**

Note: The following prompt remains the same across tasks. We only change the instruction per task.

注：下面的提示在各任务间保持不变，只换每个任务的指令。

You are a helpful bi-arm robot - one arm is mounted on the left side of a rectangular table and one arm is mounted on the right side. The left arm will show at the left most side of the image and the right arm will show at the right most side of the image. Each arm has a parallel gripper with two fingers. You will be asked to perform different tasks that involve interacting with the objects in the workspace. You are provided with a robot API to execute commands on the robot to complete the task.

你是一个乐于助人的双臂机器人：一只手臂装在长方形桌子的左侧，一只装在右侧。左臂出现在图像最左边，右臂出现在图像最右边。每只手臂有一个两指平行夹爪。你会被要求完成各种需要和工作区内物体交互的任务。你有一个机器人 API，可以在机器人上执行命令来完成任务。

The procedure to perform a task is as follows:

执行任务的流程如下：

1. **Receive instruction**. The user will provide a task instruction along with an initial image of the workspace area from the overhead camera, initial robot state and initial scene objects.

1. **接收指令**。用户会提供任务指令，以及顶部相机拍的工作区初始图像，机器人初始状态和场景中的初始物体。

2. **Describe the scene**. Mention where the objects are located on the table.

2. **描述场景**。说明物体在桌上的位置。

3. **Steps Planning**. Think about the best approach to execute the task provided the object locations, object dimensions, robot embodiment constraints and direction guidelines provided below. Write down all of the steps you need to follow in detail to execute the task successfully with the robot. Each step should be as concise as possible and should contain a description of how the scene should look like after executing the step in order to move forward to next steps.

3. **规划步骤**。根据物体位置，物体尺寸，机器人机体约束和下面给出的方向说明，想出执行任务的最佳办法。详细写下用机器人成功完成任务需要遵循的所有步骤。每一步尽量简洁，并描述执行完这一步后场景应该是什么样子，以便进入下一步。

4. **Steps Execution**. After enumerating all the steps, write python code to execute each step for one step at a time on the robot using the API provided above. For each step:

4. **执行步骤**。列完所有步骤后，用上面提供的 API 写 python 代码，在机器人上一次执行一步。对每一步：

1. Rewrite a summary of the goal for the given step.

1. 重写这一步目标的概要。

2. When grasping an object, follow the grasping guidelines provided below.

2. 抓取物体时，遵循下面的抓取准则。

3. When moving a gripper to a specific position and orientation, make sure the target position is reachable according to the robot physical constraints described below and that there is enough clearance between other objects (including other gripper arms) to avoid collisions. Describe your thought process.

3. 把夹爪移到特定位置和朝向时，按下面描述的机器人物理约束确认目标位置可达，并确认和其他物体（包括另一只夹爪手臂）之间有足够间隙，避免碰撞。描述你的思考过程。

4. Write code to execute the given step on the robot using the api, this includes writing code to compute cartesian trajectories.

4. 用 api 写代码在机器人上执行这一步，包括写代码计算笛卡尔轨迹。

5. The code will be executed and you will be provided with a new image, the status of the execution and any error information that might have resulted from the code execution including anything printed to I/O. Summarize what the robot did as it executed the code based on the new image, robot state and initial scene objects as well as any execution error or user feedback.

5. 代码执行后，你会拿到一张新图像，执行状态，以及执行中可能产生的任何错误信息，包括打印到 I/O 的内容。根据新图像，机器人状态，初始场景物体以及执行错误或用户反馈，总结机器人在执行代码时做了什么。

6. Compare your summary of what the robot did during code execution with the objective for that particular step. If they align, continue with writing code. If not, re-plan and write new steps to execute the task successfully. Consider the current state of the system when replanning (e.g., if a grasp failed the grippers may need to be reopened before attempting again).

6. 把你对机器人执行代码时所做事情的总结，和这一步的目标对照。一致就继续写代码；不一致就重新规划，写出能成功完成任务的新步骤。重新规划时要考虑系统当前状态（例如抓取失败时，再试之前可能需要先重新张开夹爪）。

7. Repeat steps 4.1-4.6 until you have completed all steps successfully.

7. 重复 4.1 到 4.6，直到所有步骤都成功完成。

In the world frame, front/back is along the y axis, left/right is along the x axis and up/down is along the z axis with following directions: Positive x: Towards the right. Negative x: Towards the left.

在世界坐标系中，前后沿 y 轴，左右沿 x 轴，上下沿 z 轴，方向如下：x 正方向向右，x 负方向向左。

<!-- page 42 of 64 -->

Positive y: Towards front of the table. Negative y: Towards back of the table. Positive z: Up, towards the ceiling. Negative z: Down, towards the floor. The world origin [0, 0, 0] is at the center of the workspace, between the two arms, at the center of the table and on the surface of the table.

y 正方向朝桌子前方，y 负方向朝桌子后方。z 正方向向上，朝天花板；z 负方向向下，朝地板。世界原点 [0, 0, 0] 在工作区中心，两臂之间，桌子中心的桌面上。

Robot Physical Constraints and Table Workspace Area:

机器人物理约束和桌面工作区：

1. Gripper has two parallel 0.09m fingers that can open up to 0.065m.

1. 夹爪有两根 0.09m 长的平行手指，最多张开 0.065m。

2. The table area is 0.80 meters wide (from left to right) and 0.40 meters long (from front to back). The center of the table belongs to the (0, 0, 0) coordinate in world frame.

2. 桌面宽 0.80 米（左右方向），长 0.40 米（前后方向）。桌子中心对应世界坐标系的（0, 0, 0）。

3. The left arm can only reach the left side of the table which belongs to x coordinates greater than -0.40 meters but less than 0.1 meters.

3. 左臂只能够到桌子左侧，即 x 坐标大于 -0.40 米，小于 0.1 米的区域。

4. The right arm can only reach the right side of the table which belongs to x coordinates greater than -0.1 meters but less than 0.40 meters.

4. 右臂只能够到桌子右侧，即 x 坐标大于 -0.1 米，小于 0.40 米的区域。

## Grasp Guidelines:

**抓取准则：**

1. Always use the get\_grasp\_position\_and\_euler\_orientation function to get the grasp position and euler orientation for a specific object and gripper. This grasp pose must be used to compute a pre-grasp pose.

1. 总是用 get_grasp_position_and_euler_orientation 函数获取特定物体和夹爪的抓取位置和欧拉角朝向。必须用这个抓取位姿来计算预抓取位姿。

2. **Clear visibility:** Make sure the robot arms are not blocking the visibility of the object. If the arms are blocking the object, move the arms out of the way before attempting the grasp.

2. **视线清晰：** 确认机械臂没有挡住物体。如果挡住了，抓取前先把手臂移开。

3. **Reachability:** Ensuring the gripper can reach the desired grasp points on the object given its arm length and workspace limits.

3. **可达性：** 在臂长和工作区限制下，确保夹爪能够到物体上想要的抓取点。

4. **Make sure the gripper is open before going to the grasp pose**.

4. **去抓取位姿之前确认夹爪是张开的**。

5. **Successful grasp:** A successful grasp will be reflected in the distance\_between\_fingers state of the robot. After closing the gripper the value of distance\_between\_fingers should be greater than 0 if the grippers are successfully enclosing the object.

5. **抓取成功：** 抓取成功会体现在机器人的 distance_between_fingers 状态上。闭合夹爪后，如果夹爪确实夹住了物体，distance_between_fingers 的值应当大于 0。

Robot API Interface Documentation:

机器人 API 接口文档：

```python
class Gripper(enum.Enum):
  LEFT = "left_gripper"
  RIGHT = "right_gripper"

class RealAlohaRobotApi:
  """Interface for interacting with the AlohaSim robot in CodeGen with a grasp pose prediction model.
  """

  def close_gripper(self, gripper: __main__.Gripper = <Gripper.LEFT: 'left_gripper'>):
    """Closes the given gripper.
    """

  def detect_objects(self, object_names):
    """Use this function to detect the XYZ centroid and size of objects in the scene.
    The size is calculated based on a z-aligned bounding box where width is placed along the x-axis, depth is placed along the y-axis and height is placed along the z-axis.

    Args:
      object_names: This is a list of strings containing the object names. The object names can include a brief description of the object or object part.

    Returns:
      A dictionary with the keys being the detection labels and the values being another dictionary containing the XYZ 'position' and 'size' of the detected objects.
```

上面这段接口定义：Gripper 枚举有左右两个夹爪。RealAlohaRobotApi 是在代码生成场景下，配合抓取位姿预测模型与机器人交互的接口。close_gripper 闭合指定夹爪。detect_objects 检测场景中物体的 XYZ 中心和尺寸，尺寸按与 z 轴对齐的边界框计算，宽沿 x 轴，深沿 y 轴，高沿 z 轴；参数是物体名字符串列表，名字里可以带对物体或部件的简短描述；返回一个字典，键是检测标签，值是包含 XYZ 位置 'position' 和尺寸 'size' 的字典。

<!-- page 43 of 64 -->

```python
Note that the detection labels are usually the same as object names but not always.
    """
def get_grasp_position_and_euler_orientation(self, gripper: __main__.Gripper, object_name: str,
part_name: str = 'middle') -> tuple[numpy.ndarray, numpy.ndarray]:
    """Returns the grasp position and orientation for the given object and gripper. Make sure the
    robot arms are out of the way before calling this function to ensure a good grasp.

    Args:
        gripper: The gripper to use to grasp the object.
        object_name: The name of the object to grasp.
        part_name: The name of the part of the object to grasp. By default, this is 'middle'.

    Returns:
        The grasp position and orientation for the given object and gripper.
    """

    def get_image(self):
        """Returns the image of the current camera.
    """

    def move_gripper_to(self, position, orientation, gripper: __main__.Gripper = <Gripper.RIGHT: '
    right_gripper'>):
        """Moves the gripper to the given position and orientation.

    Args:
        gripper: The gripper to move.
        position: The target position to move the gripper to in XYZ.
        orientation: The the target orientation euler angles (roll, pitch, yaw) in degrees.
    """

    def move_gripper_to_safe_position(self, gripper: __main__.Gripper) -> bool:
        """Moves the given gripper to a safe position out of the table area.

    This is also its initial homeposition.

    Args:
        gripper: The gripper to move. Use 'LEFT' or 'RIGHT' to specify the gripper.

    Returns:
        True if the gripper was moved successfully, False otherwise.
    """

    def open_gripper(self, gripper: __main__.Gripper = <Gripper.LEFT: 'left_gripper'>):
        """Opens the given gripper.
    """

    def reset(self):
        """Resets the robot to its initial state.
    """

    def state_description(self) -> str:
        """Returns a text description of the current robot state.
    """
```

接口续：检测标签通常和物体名相同，但不总是。get_grasp_position_and_euler_orientation 返回给定物体和夹爪的抓取位置和朝向，调用前要确认机械臂已经让开，以保证抓取质量；参数是夹爪，物体名和部件名（默认 'middle'）。get_image 返回当前相机图像。move_gripper_to 把夹爪移到给定位置（XYZ）和朝向（roll，pitch，yaw 欧拉角，单位为度）。move_gripper_to_safe_position 把夹爪移到桌面区域外的安全位置，这也是它的初始位置，成功返回 True. open_gripper 张开指定夹爪。reset 把机器人复位到初始状态。state_description 返回当前机器人状态的文字描述。

Assume the Robot API object is already available as robot.

假设机器人 API 对象已经以 robot 的名字可用。

Instructions: Pick up the banana and place it in the bowl. You may need to handover the banana from one arm to the other if the initial arm picking the banana cannot reach the bowl. After picking

指令：拿起香蕉放进碗里。如果最先拿香蕉的手臂够不到碗，你可能需要把香蕉从一只手臂交给另一只。用一只手臂拿起

<!-- page 44 of 64 -->

the banana with one arm, you can handover the banana by first placing it carefully on the table surface and then using the other arm to pick it up. The placing position must be on the table, as far as possible from other objects but absolutely within the reachable table area of the other arm. Make sure to move the picking arm out of the way before the receiving arm moves towards grasping the object.

香蕉后，可以先把它小心放到桌面上，再用另一只手臂拿起，以此完成换手。放置位置必须在桌上，尽量远离其他物体，但必须在另一只手臂能够到的桌面区域内。接手的手臂去抓之前，要先把拿香蕉的手臂移开。

## B.3.3. Sample output from Gemini during zero-shot robot control

**B.3.3 零样本机器人控制时 Gemini 的输出样例**

Fig. 32 and Fig. 33 show output samples from Gemini doing planning and grasping, whilst completing robot control tasks.

图 32 和图 33 给出 Gemini 在完成机器人控制任务时做规划和抓取的输出样例。

![Image block](images/p44-figure-32-example-of-planning-by-gemini-whilst-carrying.png)

Figure 32 | Example of planning by Gemini whilst carrying out a robot control task.

图 32: Gemini 执行机器人控制任务时做规划的示例。

<!-- page 45 of 64 -->

````txt
**Step 2: Grasp banana with left gripper**
* **Goal:** Move the left gripper to the banana's grasp position and close the gripper.
* **Code:**

```python
banana_name = "banana"
grasp_position, grasp_orientation = robot.get_grasp_position_and_euler_orientation(gripper=Gripper.LEFT,
object_name=banana_name)
robot.move_gripper_to(position=grasp_position, orientation=grasp_orientation, gripper=Gripper.LEFT)
robot.close_gripper(gripper=Gripper.LEFT)
```
grasp position:[-0.21401928 0.03974604 -0.00504461]
grasp orientation:[79.0, 90.0, 0.0]

Robot State:
{
    "right_gripper": {
        "position": [0.17, -0.02, 0.35],
        "orientation": [-0.44, -5.54, 179.96],
        "distance_between_fingers_cm": 1.8,
        "commanded_state": "open"
    },
    "left_gripper": {
        "position": [-0.22, 0.04, 0.04],
        "orientation": [-94.04, 89.29, -172.58],
        "distance_between_fingers_cm": 0.94,
        "commanded_state": "closed"
    }
}

* **Summary:** The left gripper moved to the grasp position of the banana and closed. The
`distance_between_fingers_cm` is 0.94, which is greater than 0, indicating a successful grasp.
* **Comparison:** The goal was to grasp the banana with the left gripper, and the robot state confirms this.

**Step 3: Lift banana with left gripper**
* **Goal:** Raise the left gripper with the banana to avoid collision.
* **Code:**

```python
current_position = robot.state_description()
robot.move_gripper_to(position=[grasp_position[0], grasp_position[1], 0.1], orientation=grasp_orientation,
gripper=Gripper.LEFT)
```

* environment output not shown for brevity *

* **Summary:** The left gripper moved upwards to a z-coordinate of 0.1 while maintaining the same x, y and
orientation. The robot state confirms this.
````

上面这段输出的意思：第 2 步用左夹爪抓香蕉。目标是把左夹爪移到香蕉的抓取位置并闭合。代码先取抓取位姿，再移动，再闭合。环境返回的抓取位置约为（-0.214, 0.040, -0.005），朝向（79, 90, 0）；机器人状态里左夹爪已闭合，distance_between_fingers_cm 为 0.94。总结：左夹爪移到香蕉抓取位置并闭合，手指间距 0.94 大于 0，说明抓取成功。对照：目标是用左夹爪抓住香蕉，机器人状态确认了这一点。第 3 步用左夹爪抬起香蕉，目标是抬高以免碰撞，代码把 z 设为 0.1，环境输出为简洁起见省略。总结：左夹爪保持 x，y 和朝向不变，上升到 z=0.1，机器人状态确认了这一点。

Figure 33 | Example of grasping and lifting by Gemini whilst carrying out a robot control task. Output is by Gemini except for the environment feedback and “\* environment output not shown for brevity \*”（shown in gray）。Other colors refer to the following: blue — planning; orange — code; green — analysis or discussion.

图 33: Gemini 执行机器人控制任务时抓取并抬起的示例。除环境反馈和 「* 环境输出为简洁起见省略 *」（灰色）之外，其余都是 Gemini 的输出。其他颜色含义：蓝色为规划，橙色为代码，绿色为分析或讨论。

<!-- page 46 of 64 -->

![Image block](images/p46-figure-34-examples-of-error-detection-and-retrying-by.png)

Figure 34 | Examples of error detection and retrying by Gemini when carrying out a robot control task. Output is by Gemini except for the environment output and “\*intermediate steps not shown for brevity\*”（shown in gray）。Other colors refer to the following: orange — code; green — analysis or discussion.

图 34: Gemini 执行机器人控制任务时检测错误并重试的示例。除环境输出和 「* 中间步骤为简洁起见省略 *」（灰色）之外，其余都是 Gemini 的输出。其他颜色含义：橙色为代码，绿色为分析或讨论。

<!-- page 47 of 64 -->

## C. Robot Actions with Gemini Robotics

**C. 用 Gemini Robotics 输出机器人动作**

## C.1. Evaluation procedure

**C.1 评估流程**

Real world robotics performance metrics (e.g., success rate and/or progress) can be noisy, because conducting experiments on robots is subject to constantly changing environments and deteriorating hardware. To address these concerns, each evaluation task (defined by an instruction and initial conditions) is run with multiple trials. These trials are repeated for each of the target models (e.g., Gemini Robotics and baselines). To reduce bias from environmental factors (e.g., network latency, wear-and-tear of motors, lighting changes, etc.) and eliminate operator bias, the target models are evaluated for each trial back-to-back in random order (A/B testing). This allows us to use a pairwise t-test to more robustly evaluate improvements over baselines.

真实世界的机器人性能指标（如成功率和/或进度）可能噪声很大，因为机器人实验受不断变化的环境和逐渐老化的硬件影响。为此，每个评估任务（由一条指令和一组初始条件定义）都跑多次试验，每个待评估模型（如 Gemini Robotics 和各基线）都重复这些试验。为了减少环境因素（如网络延迟，电机磨损，光照变化等）带来的偏差并消除操作员偏差，每次试验中各模型按随机顺序紧挨着评估（A/B 测试）。这样就能用配对 t 检验更稳健地评估相对基线的提升。

> **想：** 配对 t 检验做了，结果在哪里？
> 本文所有结果图（图 16, 17, 21, 23, 24, 26, 28 和附录的 40, 41, 42, 47）都只画了均值，没有误差线，没有置信区间，也没有 p 值；正文也没有一句 「差异显著」 带着检验数字。每格的试验次数又很少：图 26 每个点 10 次，图 23 每格 20 次（拼字 12 次），图 24 每格 10 到 15 次左右。以 10 次为例，0.7 和 0.8 只差一次成功。所以 C.1 说的统计分析方法是有的，但在本文里读者只能看到均值，看不到哪些差距通过了检验。

Each evaluation is marked either success or failure (0 for failure, 1 for full completion). Furthermore, we also use a continuous metric, progress score, between 0 and 1, reflecting the proportion of the task completed. Given the difficulty of some of our tasks — long-horizon, highly dexterous, and in challenging generalization scenarios — reporting the continuous progress metric offers another insightful metric for comparing model performance.

每次评估记为成功或失败（失败记 0，完全完成记 1）。此外我们还用一个连续指标，即 0 到 1 之间的进度分，反映任务完成的比例。有些任务很难，时程长，灵巧度高，或处在困难的泛化场景中，报告连续的进度指标为比较模型表现提供了另一个有用的角度。

## C.1.1. Evaluation tasks to test out-of-the-box in-distribution performance

**C.1.1 测试开箱分布内表现的评估任务**

All of the evaluation tasks used for Figure 16 can be found in Figure 35, including instruction and an example of initial scene configuration.

图 16 所用的全部评估任务见图 35，包括指令和初始场景布置示例。

<!-- page 48 of 64 -->

![Image block](images/p48-image.png)

![Image block](images/p48-image-2.png)

![Image block](images/p48-image-3.png)

![Image block](images/p48-image-4.png)

![Image block](images/p48-image-5.png)

![Image block](images/p48-image-6.png)

![Image block](images/p48-image-7.png)

![Image block](images/p48-image-8.png)

![Image block](images/p48-image-9.png)

![Image block](images/p48-image-10.png)

![Image block](images/p48-image-11.png)

![Image block](images/p48-image-12.png)

![Image block](images/p48-image-13.png)

![Image block](images/p48-image-14.png)

![Image block](images/p48-image-15.png)

![Image block](images/p48-image-16.png)

![Image block](images/p48-image-17.png)

![Image block](images/p48-image-18.png)

![Image block](images/p48-image-19.png)

![Image block](images/p48-figure-35-initial-scene-configuration-and-instructions.png)

Figure 35 | Initial scene configuration and instructions used for our out-of-the-box evaluation in Figure 16.

图 35：图 16 开箱评估所用的初始场景布置和指令。本页共 20 张子图，对应图 16 的 20 个任务。

<!-- page 49 of 64 -->

## C.1.2. Evaluation tasks for instruction following analysis

**C.1.2 指令跟随分析的评估任务**

Figure 36 shows the 5 scenes and the 25 instructions used to assess Gemini Robotics instruction following in Section 3.3.

图 36 给出 3.3 节评估 Gemini Robotics 指令跟随所用的 5 个场景和 25 条指令。

| Initial scene | Instruction #1 | Instruction #2 | Instruction #3 | Instruction #4 | Instruction #5 |
| --- | --- | --- | --- | --- | --- |
|  | Put the blue bar in the right side of the grey container. | Put the banana in the bottom of the brown bag. | Place the blue bar below the brown lunch bag. | Move left red grapes to the top left corner of the table. | Put the brown bar in the orange lunch bag. |
|  | Pick up the toothpaste and place it on the blue towel. | Pick up the green scrub and place it in the bottom compartment of the caddy. | Place the blue towel in the bottom compartment of the caddy. | Place the toothpaste in the bottom compartment of the caddy. | Pick up the deodorant and place it to the left of the pink sponge. |
|  | Place the blue clip to the right of the yellow sticky notes. | Pick up the calculator and place it on the right side of the table. | Place the blue clip in the top black container. | Pick up the blue sticky notes and place it in the top black container. | Pick up the scissors and place it on the bottom of the table. |
|  | Pick the bottom ring and place it on the left side of the table. | Pick up the calculator and place it on the top right of the table. | Pick up the pink stapler and place it on the black organizer. | Pick up black marker and place it on pink organizer. | Pick up sticky notes and place on black organizer. |
|  | Put the banana in the top bowl. | Put the mango in the red bowl. | Place the top bowl on the bottom bowl. | Place grapes next to the bottom bread. | Put the grapes and the mango in the same bowl. |

图 36 表格，每行一个场景的 5 条指令。场景一：蓝色能量棒放进灰色容器右侧；香蕉放进棕色袋子底部；蓝色能量棒放到棕色午餐袋下方；左边的红葡萄移到桌子左上角；棕色能量棒放进橙色午餐袋。场景二：牙膏放到蓝毛巾上；绿色搓澡巾放进收纳篮下层隔间；蓝毛巾放进收纳篮下层隔间；牙膏放进收纳篮下层隔间；止汗剂放到粉色海绵左边。场景三：蓝色夹子放到黄色便利贴右边；计算器放到桌子右侧；蓝色夹子放进上面的黑色容器；蓝色便利贴放进上面的黑色容器；剪刀放到桌子下方。场景四：下面的圆环放到桌子左侧；计算器放到桌子右上；粉色订书机放到黑色收纳盒上；黑色记号笔放到粉色收纳盒上；便利贴放到黑色收纳盒上。场景五：香蕉放进上面的碗；芒果放进红碗；上面的碗叠到下面的碗上；葡萄放到下面那块面包旁边；葡萄和芒果放进同一个碗。

Figure 36 | Examples of the initial scene configurations and instructions used for the instruction following analysis in Section 3.3.

图 36: 3.3 节指令跟随分析所用的初始场景布置和指令示例。

<!-- page 50 of 64 -->

## C.1.3. Evaluation tasks for generalization study

**C.1.3 泛化研究的评估任务**

In this Section we describe all the tasks and variations we used for the generalization results of Figure 21.

本节描述图 21 泛化结果所用的全部任务和变化。

## C.1.3.1 Visual and Instruction generalization tasks

**C.1.3.1 视觉和指令泛化任务**

We consider 4 different tasks in a scene including objects to be packed in a lunch bag. In order to assess instruction generalization, we ask the robot to solve the task using different instructions by 1) adding typos, 2) translating the instruction to a different language (Spanish), 3) rephrasing the instruction, and 4) adding descriptive modifiers. See Figure 37 for detailed examples.

我们在一个放着待装进午餐袋物品的场景里考虑 4 个不同任务。为了评估指令泛化，我们用不同的指令让机器人完成任务：1) 加拼写错误，2) 把指令翻译成另一种语言（西班牙语），3) 改述指令，4) 加描述性修饰语。详细例子见图 37。

| Initial scene | In-distribution | Typo | Multilingual | Rephrasing | Descriptive |
| --- | --- | --- | --- | --- | --- |
|  | Put the top left green grapes into the right compartment of the grey box. | Put the top lft gren grapes into the rht compartment of the grey bx. | Coloque las uvas verdes de la parte superior izquierda en el compartimento derecho de la caja gris. | Pick up the green grapes and place them in the largest container of the grey box. | Pick the green grapes (top left) and put them in the grey box (right compartment). |
|  | Put the brown bar in the top pocket of the lunch bag. | Put the brwn bar into the top pckt of the Inch bag. | Coloque la barra marrón en el bolsillo superior de la bolsa del almuerzo. | Put the brown bar into the lunch bag's top pocket. | Pack the brown bar in the top of the lunch bag. |
|  | Put the top right red grapes into the top left compartment of the grey box. | Put the top rht rd grapes into the op lft compartmnt of th gry box. | Coloque las uvas rojas de la parte superior derecha en el compartimento superior izquierdo de la caja gris. | Pick up the top right red grapes and place them in the top left container of the grey box. | Pick the red grapes (top right) and put them in the grey box (top left compartment). |
|  | Unzip the lunch bag completely. | Uzip the luch bag completely. | Abra completamente la cremallera de la bolsa del almuerzo. | Open the lunch bag. | Unzip the bag. |

图 37 表格，四个任务各五种写法（分布内，拼写错误，西班牙语，改述，描述式）。任务一：把左上方的绿葡萄放进灰盒子右侧隔间。任务二：把棕色能量棒放进午餐袋的上层口袋。任务三：把右上方的红葡萄放进灰盒子左上隔间。任务四：把午餐袋拉链完全拉开。拼写错误一列是同一句话故意拼错若干词；西班牙语一列是同义的西班牙语句子；改述一列换了说法，如 「放进灰盒子最大的格子」，「打开午餐袋」；描述式一列把位置信息放进括号，或把句子说得更简略。

Figure 37 | Examples of initial scene configurations and instructions used for instruction generalization evaluations in in Section 3.4.

图 37: 3.4 节指令泛化评估所用的初始场景布置和指令示例。

We then test our model ability to generalize to visual variations of the scene by 1) adding novel distractor objects, 2) by replacing the background (wooden tabletop) with a blue-white cloth, and 3) by changing the lighting of the scene. All these variations are not captured in the training data. See Figure 38 for detailed examples.

接着测试模型对场景视觉变化的泛化能力：1) 加入新的干扰物，2) 把背景（木质桌面）换成蓝白色的布，3) 改变场景光照。这些变化在训练数据中都没有出现过。详细例子见图 38。

<!-- page 51 of 64 -->

![Image block](images/p51-unzip-the-lunch-bag-completely.png)

Unzip the lunch bag completely.

图中指令：把午餐袋拉链完全拉开。

Figure 38 | Examples of initial scene configurations and instructions used for visual generalization evaluations in Section 3.4.

图 38: 3.4 节视觉泛化评估所用的初始场景布置和指令示例。

## C.1.3.2 Action generalization tasks

**C.1.3.2 动作泛化任务**

We consider 6 different tasks across multiple scenes. We analyse action generalization across two different axes: 1) OOD object positions and 2) different target object instance with different color, shape or size. See Figure 39 for details.

我们在多个场景中考虑 6 个不同任务，沿两个方向分析动作泛化：1) 分布外的物体位置，2) 颜色，形状或尺寸不同的目标物体实例。详见图 39。

## C.1.3.3 Task and progress definition

**C.1.3.3 任务和进度定义**

In Figure 21, we reported Progress Score, the continuous metric that captures the nuances of the performance beyond the success rate of the binary categorization between success and failure. Here is the definition of progress for each task.

图 21 报告的是进度分，这个连续指标能捕捉成功与失败二分之外的表现细节。下面是每个任务的进度定义。

• **“Put the top left green grapes into the right compartment of the grey box.”** This task requires the robot to pick up the green grapes and drop them in the right compartment of the grey bento box.

• **「把左上方的绿葡萄放进灰盒子的右侧隔间。」** 机器人要拿起绿葡萄，放进灰色便当盒的右侧隔间。

– 1.0 : if the grapes are placed in the correct compartment;

– 1.0：葡萄放进了正确的隔间；

<!-- page 52 of 64 -->

![Image block](images/p52-figure-39-examples-of-initial-scene-configurations-and.png)

Figure 39 | Examples of initial scene configurations and instructions used for action generalization evaluations in Section 3.4.

图 39: 3.4 节动作泛化评估所用的初始场景布置和指令示例。

– 0.5 : if the grapes are picked and placed in the wrong compartment;

– 0.5：葡萄被拿起，但放进了错误的隔间；

– 0.25: if the grapes are picked but never placed;

– 0.25：葡萄被拿起，但始终没有放下；

– 0.0 : if anything else happens.

– 0.0：其他任何情况。

• **“Put the brown bar in the top pocket of the lunch bag.”** This task requires the robot to pick up the brown bar and place it in the top pocket of the lunch bag.

• **「把棕色能量棒放进午餐袋的上层口袋。」** 机器人要拿起棕色能量棒，放进午餐袋的上层口袋。

– 1.0 : if the brown bar is placed in the lunch bag’s top pocket;

– 1.0：棕色能量棒放进了午餐袋上层口袋；

– 0.75: if the brown bar is placed in the lunch bag (either pocket);

– 0.75：棕色能量棒放进了午餐袋（任一口袋）；

– 0.25: if the robot picks up the brown bar;

– 0.25：机器人拿起了棕色能量棒；

– 0.0 : if anything else happens.

– 0.0：其他任何情况。

• **“Put the top right red grapes into the top left compartment of the grey box.”** This task requires the robot to pick up the red grapes and drop them in the top-left compartment of the grey bento box.

• **「把右上方的红葡萄放进灰盒子的左上隔间。」** 机器人要拿起红葡萄，放进灰色便当盒的左上隔间。

– 1.0 : if the grapes are placed in the correct compartment;

– 1.0：葡萄放进了正确的隔间；

– 0.5 : if the grapes are picked and placed in the wrong compartment;

– 0.5：葡萄被拿起，但放进了错误的隔间；

– 0.25: if the grapes are picked but never placed;

– 0.25：葡萄被拿起，但始终没有放下；

– 0.0 : if anything else happens.

– 0.0：其他任何情况。

• **“Unzip the lunch bag completely.”** This task requires the robot to fully unzip the lunch bag.

• **「把午餐袋拉链完全拉开。」** 机器人要把午餐袋拉链完全拉开。

– 1.0 : if the robot fully unzips the lunch bag;

– 1.0：机器人把午餐袋拉链完全拉开；

– 0.5 : if the robot successfully grasps the zipper and partially un-zips it;

– 0.5：机器人抓住了拉链并拉开一部分；

– 0.25: if the robot successfully identifies and grasps the zipper tag;

– 0.25：机器人找到并抓住了拉链头；

– 0.0 : if anything else happens.

– 0.0：其他任何情况。

<!-- page 53 of 64 -->

![Chart block](images/p53-figure-40-breakdown-of-gemini-robotics-generalization.png)

Figure 40 | Breakdown of Gemini Robotics generalization capabilities with success rate. Gemini Robotics consistently outperforms the baselines and handles all three types of variations more effectively. Notably, even when baselines experience catastrophic failure — such as with instructions in a new language or visual variations of the target object, Gemini Robotics still achieves non-zero performance.

图 40：用成功率表示的 Gemini Robotics 泛化能力分项结果。Gemini Robotics 一直优于基线，对三类变化的处理都更有效。值得注意的是，即使基线出现灾难性失败，比如指令换成新语言或目标物体外观变化时，Gemini Robotics 仍有非零表现。

• **“Put the legos into the lego bag.”** This task requires the robot to pick up 4 lego blocks (one-by-one) and then place them into the lego bag.

• **「把乐高放进乐高袋。」** 机器人要（逐块）拿起 4 块乐高积木，放进乐高袋。

– 1.0 : if all 4 blocks are placed in the bag;

– 1.0: 4 块全部放进袋子；

– 0.75: if 3 blocks are placed in the bag;

– 0.75：放进 3 块；

– 0.50: if 2 blocks are placed in the bag;

– 0.50：放进 2 块；

– 0.25: if 1 block is placed in the bag;

– 0.25：放进 1 块；

– 0.0 : if no blocks are in the bag.

– 0.0：袋子里一块也没有。

• **“Tighten the cap of the water bottle.”** This task requires the robot to tighten the caps of various (plastic and metal) bottles.

• **「拧紧水瓶盖。」** 机器人要拧紧各种（塑料和金属）瓶子的瓶盖。

– 1.0 : if the robot has tightened the cap by at least one full rotation;

– 1.0：机器人把瓶盖拧紧了至少一整圈；

– 0.5 : if the robot begins to tighten the cap but does not finish one rotation;

– 0.5：机器人开始拧，但没拧满一圈；

– 0.1 : if the robot grips the water bottle’s cap;

– 0.1：机器人抓住了瓶盖；

– 0.0 : if anything else happens.

– 0.0：其他任何情况。

• **“Open the bottom drawer of the jewelry box.”** This task requires the robot to open the bottom drawer of the jewelry box.

• **「打开首饰盒最下面的抽屉。」** 机器人要打开首饰盒最下面的抽屉。

– 1.0 : if the robot opens the bottom drawer of the jewelry box;

– 1.0：机器人打开了首饰盒最下面的抽屉；

– 0.25: if the robot grasps the bottom drawer of the jewelry box;

– 0.25：机器人抓住了最下面的抽屉；

– 0.0 : if anything else happens.

– 0.0：其他任何情况。

• **“Fold the dress.”** This task requires the robot to fold different dresses.

• **「叠裙子。」** 机器人要叠不同的裙子。

– 1.0 : if the dress is folded with all the correct folds;

– 1.0：裙子按所有正确的折法叠好；

– 0.25: if the robot gets at least one (even messy) fold;

– 0.25：机器人至少折了一下（哪怕折得乱）；

– 0.0 : if anything else happens.

– 0.0：其他任何情况。

• **“Put banana in bowl with handover.”** This task requires the robot to pick up the banana with one arm, hand it over to the other arm, and then place it in the bowl.

• **「换手后把香蕉放进碗。」** 机器人要用一只手臂拿起香蕉，交给另一只手臂，再放进碗里。

<!-- page 54 of 64 -->

– 1.0 : if the robot picks the banana, hands it over, and places it in the bowl;

– 1.0：机器人拿起香蕉，完成换手，放进碗里；

– 0.5 : if the robot picks the banana and hands it over, or if the robot places the banana in the bowl without handing it over;

– 0.5：机器人拿起香蕉并完成换手，或者没换手就把香蕉放进了碗里；

– 0.25: if the robot picks the banana and then drops it;

– 0.25：机器人拿起香蕉后掉了；

– 0.0 : if the robot does not pick the banana.

– 0.0：机器人没拿起香蕉。

For completeness, we also include the plot of success rate below (Figure 40).

为完整起见，我们也给出成功率的图（图 40）。

## C.2. Baselines

**C.2 基线**

Our Gemini Robotics model is compared against three baselines that represent the state-of-the-art in vision-language-action models, multi-task learning and dexterity, respectively.

Gemini Robotics 和三个基线对比，它们分别代表视觉-语言-动作模型，多任务学习和灵巧操作方面的最先进水平。

𝜋<sub>0</sub> **re-implement:** This is a faithful re-implementation, to the best of our knowledge, of 𝜋<sub>0</sub>, an open-weights dexterous VLA model (Black et al., 2024) consisting of a diffusion transformer “action expert” policy that attends to latents from an underlying PaliGemma VLM (Beyer et al., 2024). The 𝜋<sub>0</sub> model architecture and weights have been publicly released by the authors ([openpi](https://github.com/Physical-Intelligence/openpi)). We re-implement this model to be compatible with our scalable training infrastructure to consume our diverse actions training data. We train this model on the same data mixture as Gemini Robotics. On internal evaluations, we find that our 𝜋<sub>0</sub> re-implement trained on our data mixture outperforms the 𝜋<sub>0</sub> openpi checkpoint out of the box, as well as 𝜋<sub>0</sub> openpi fine-tuned for individual tasks (Fig. 41); hence, we report numbers from our re-implementation throughout the paper. In Section 3, we use a batch size of 2048 and train it for 300K steps. In Section 4, we fine-tune from the checkpoint from Section 3, using the same batch size for 50K steps. We also carefully select the checkpoints for evaluation to ensure fair comparisons.

**π0 re-implement:** 据我们所知，这是对 π0 的忠实复现。π0 是一个开放权重的灵巧 VLA 模型（Black et al., 2024），由一个扩散 Transformer 「动作专家」 策略构成，它注意（attend）底层 PaliGemma VLM (Beyer et al., 2024) 的隐变量。π0 的架构和权重已由作者公开（openpi）。我们重新实现这个模型，使它兼容我们可扩展的训练基础设施，能读入我们多样的动作训练数据，并在和 Gemini Robotics 相同的数据混合上训练。内部评估发现，在我们数据混合上训练的 π0 re-implement，既优于开箱的 π0 openpi 检查点，也优于针对单个任务微调过的 π0 openpi（图 41），因此全文报告的都是我们复现版的数字。第 3 节中 batch size 为 2048，训练 300K 步。第 4 节从第 3 节的检查点出发，用同样的 batch size 微调 50K 步。我们也仔细挑选了用于评估的检查点，以保证比较公平。

![Image block](images/p54-figure-41-fast-adaptation-results-section-4-3-with-the.png)

Figure 41 | Fast adaptation results (Section 4.3) with the 𝜋<sub>0</sub> openpi baseline. The results are consistent between 𝜋<sub>0</sub> openpi and 𝜋<sub>0</sub> re-implement in 5 out of 8 tasks, while our own implementation achieves better results for the other 3 tasks.

图 41：加上 π0 openpi 基线后的快速适配结果（4.3 节）。8 个任务中有 5 个 π0 openpi 和 π0 re-implement 结果一致，另外 3 个我们自己的实现结果更好。

**Multi-task diffusion:** This is a diffusion policy architecture inspired by ALOHA Unleashed (Zhao et al., 2025) and modified to be task-conditioned. We add a CLIP text encoder (Radford et al., 2021) to encode the natural language task string, while the original model of Aloha Unleashed only works in single-task settings. In Section 3, we use a batch size of 512 and train it for 2M steps on the identical action data mixture. For experiments in Section 4, we start from the checkpoint from Section 3,

**多任务扩散：** 这是一个受 ALOHA Unleashed (Zhao et al., 2025) 启发，改成以任务为条件的扩散策略架构。我们加了一个 CLIP 文本编码器（Radford et al., 2021）来编码自然语言任务描述，原版 Aloha Unleashed 只能用于单任务设置。第 3 节中 batch size 为 512，在同样的动作数据混合上训练 2M 步。第 4 节的实验从第 3 节的检查点出发，

<!-- page 55 of 64 -->

use the same batch size and fine-tune it for 1M steps. The batch size, training steps and evaluation checkpoints are empirically determined to optimize the model’s final performance.

用同样的 batch size 微调 1M 步。batch size，训练步数和评估检查点都按经验确定，以优化模型的最终表现。

**Single-task diffusion:** This is the same diffusion policy architecture from ALOHA Unleashed (Zhao et al., 2025). We do not include this baseline in Section 3 because it is not designed for multi-task learning. For all our specialization and adaptation experiments in Section 4, we initialize the model from scratch, use a batch size of 512 and train it for 2M steps. Similarly, the batch size, training steps and evaluation checkpoints are empirically determined to optimize the model’s final performance.

**单任务扩散：** 和 ALOHA Unleashed (Zhao et al., 2025) 相同的扩散策略架构。它不是为多任务学习设计的，所以第 3 节没有纳入这个基线。第 4 节所有专精和适配实验中，这个模型都从零初始化，batch size 为 512，训练 2M 步。同样，batch size，训练步数和评估检查点都按经验确定，以优化最终表现。

> **核对：** 三个基线的训练量能和 Gemini Robotics 比吗？
> 用 C.2 的数字相乘：π0 re-implement 第 3 节是 2048×300K，约 6.1 亿个样本，第 4 节再加 2048×50K，约 1 亿；多任务扩散第 3 节是 512×2M，约 10 亿个样本，第 4 节再加 512×1M，约 5 亿；单任务扩散每个任务从零 512×2M. Gemini Robotics 本身的 batch size，步数，学习率都没有给，3.1 节只说数据量是数千小时，训练硬件在表 7 里是 TPU v4，v5p 和 v6e. 基线按样本数看都不算少，但它们和 Gemini Robotics 之间差的还有骨干规模和非动作数据，本文的对比没有把这几项分开。另外 3.1 节写 「两个基线都训练到收敛」，这里又写 「按经验挑检查点」，两种说法并存。

## D. Specializing and Adapting Gemini Robotics for Dexterity, Reasoning, and New Embodiments

**D. 为灵巧，推理和新机体专精与适配 Gemini Robotics**

## D.1. Long-horizon dexterity

**D.1 长时程灵巧**

## D.1.1. Evaluation procedure

**D.1.1 评估流程**

These evaluations primarily focus on in-distribution performance, with defined initial conditions for each task. We conduct 20 trials per task per model. The spelling game task is the only exception, where performance is analysed over 12 trials, including both in-distribution results (6 trials for printed picture cards) and out-of-distribution results (6 trials for hand-drawn sketches).

这些评估主要关注分布内表现，每个任务有规定的初始条件。每个模型在每个任务上做 20 次试验。拼字游戏是唯一的例外，按 12 次试验分析，其中包括分布内结果（打印图卡 6 次）和分布外结果（手绘草图 6 次）。

In Section 4.1, we report success rates for each of the six dexterous tasks. Here, we additionally show the progress scores for each task in Figure 42 to get a more fine-grained picture of the differences between the performance of Gemini Robotics and the baseline models.

4.1 节报告了六个灵巧任务各自的成功率。这里在图 42 中另外给出每个任务的进度分，以便更细地看出 Gemini Robotics 和基线模型之间的差别。

![Chart block](images/p55-figure-42-average-task-progress-score-on-new-dexterous.png)

Figure 42 | Average task progress score on new, dexterous and long-horizon tasks after specialization. This Figure complements Figure 23. The average task progress score highlights that on all tasks but Spelling game, all methods show non-zero progress towards the completion of the tasks. However, Gemini Robotics outperforms almost all baselines across all tasks except for the single task diffusion on the Place peas task according to this metric.

图 42：专精后在新的灵巧长时程任务上的平均进度分，是图 23 的补充。从平均进度分看，除拼字游戏外，所有方法在所有任务上都有非零进度。按这个指标，Gemini Robotics 在所有任务上几乎都优于所有基线，唯一例外是放豌豆任务上的单任务扩散。

The definition of the task can be found in Section 4.1, and below we define the progress scores for each task:

任务定义见 4.1 节，下面定义每个任务的进度分：

• **“Make an origami fox”**

• **「折纸狐狸」**

– 1.0 : if the robot fully folds the origami fox;

– 1.0：机器人完整折出纸狐狸；

– 0.75: if the robot completes the first three folds;

– 0.75：完成前三折；

– 0.5 : if the robot completes the first two folds;

– 0.5：完成前两折；

<!-- page 56 of 64 -->

– 0.25: if the robot completes the first fold;

– 0.25：完成第一折；

– 0.1 : if the robot attempts to make the first fold;

– 0.1：尝试折第一折；

– 0.0 : if anything else happens.

– 0.0：其他任何情况。

## • “Pack a lunch-box”

**• 「装午餐盒」**

– 1.0 : if the lunch-box contains all required items inside it and is fully zipped;

– 1.0：午餐盒里装齐所有要求的物品，并完全拉上拉链；

– 0.75: if the lunch-box contains all required items inside it: the bread inside the ziploc, an energy bar, and the sealed container with grapes inside;

– 0.75：午餐盒里装齐所有要求的物品：装在密封袋里的面包，一根能量棒，装着葡萄且已盖好的保鲜盒；

– 0.5 : if the robot transfers the zipped ziploc containing the bread into the lunch-box;

– 0.5：机器人把封好口，装着面包的密封袋放进了午餐盒；

– 0.25: if the robot inserts the bread in the ziploc bag and zips the ziploc bag;

– 0.25：机器人把面包塞进密封袋并封好口；

– 0.1 : if the robot inserts the bread in the ziploc bag;

– 0.1：机器人把面包塞进了密封袋；

– 0.0 : if anything else happens.

– 0.0：其他任何情况。

## • “Spelling board game”

**• 「拼字棋盘游戏」**

– 1.0 : if the robot spells all three letters correctly;

– 1.0：三个字母全部拼对；

– 0.66: if the robot spells the first two letters correctly;

– 0.66：前两个字母拼对；

– 0.33: if the robot spells the first letter correctly;

– 0.33：第一个字母拼对；

– 0.0 : if anything else happens.

– 0.0：其他任何情况。

## • “Play a game of cards”

**• 「打一局牌」**

– 1.0 : if the robot draws 3 cards, plays 1 card, and folds the remaining cards;

– 1.0：机器人抽 3 张牌，出 1 张，弃掉剩下的牌；

– 0.75: if the robot plays more than 1 card after 3 cards are drawn;

– 0.75：抽完 3 张后出了不止 1 张牌；

– 0.5 : if the robot draws 3 cards but fails to play any card;

– 0.5：抽了 3 张但一张也没出；

– 0.25: if the robot draws 1 card;

– 0.25：抽了 1 张；

– 0.0 : if anything else happens.

– 0.0：其他任何情况。

## • “Add snap peas to salad”

**• 「往沙拉里加荷兰豆」**

– 1.0 : if the robot places at least 3 peas into the salad bowl with the tongs and then places the tongs back on the table;

– 1.0：机器人用夹子往沙拉碗里放了至少 3 颗豆子，然后把夹子放回桌上；

– 0.5 : if the robot places at least 1 pea into the salad bowl with the tongs;

– 0.5：用夹子往沙拉碗里放了至少 1 颗豆子；

– 0.0 : If anything else happens.

– 0.0：其他任何情况。

## • “Add nuts to salad”

**• 「往沙拉里加坚果」**

– 1.0 : if the robot scoops at least 1 scoop of nuts, adds them to the salad bowl, and places the spoon back on the table;

– 1.0：机器人至少舀一勺坚果加进沙拉碗，然后把勺子放回桌上；

– 0.5 : if the robot scoops at least 1 scoop of nuts and adds them to the salad bowl;

– 0.5：至少舀一勺坚果加进沙拉碗；

– 0.0 : if anything else happens.

– 0.0：其他任何情况。

## D.2. Enhanced reasoning and generalization

**D.2 增强推理与泛化**

## D.2.1. Evaluation procedure

**D.2.1 评估流程**

For the reasoning-enhanced version and the vanilla Gemini Robotics models, we perform 100 trials across 8 different tasks, each with a unique initial scene configuration. The tasks are grouped into the following categories, based on what capabilities they are designed to measure: One-step Reasoning, Semantic Generalization, and Spatial Understanding.

对推理增强版和原版 Gemini Robotics，我们在 8 个不同任务上做了 100 次试验，每个任务有唯一的初始场景布置。按设计要衡量的能力，任务分成以下几类：一步推理，语义泛化和空间理解。

## D.2.1.1 One-step Reasoning Tasks

**D.2.1.1 一步推理任务**

For tasks in this category, the instruction specifies the objects of interest and/or the manipulation action indirectly, e.g., via their properties or affordances:

这一类任务的指令间接指定目标物体和/或操作动作，例如通过它们的属性或可供性：

<!-- page 57 of 64 -->

• **“Put the coke can into the same colored plate.”** In this task the model must place the Coca-cola can into the red plate instead of the different colored distractor plates.

• **「把可乐罐放进同样颜色的盘子。」** 模型要把可口可乐罐放进红盘子，而不是其他颜色的干扰盘子。

• **“Sort the bottom right mouse into the matching pile.”** In this task the model must sort the white toy mouse at the bottom right into a pile of white toy mice, instead of the distractor piles of brown and grey mice; all of these mice, as well as the task of sorting objects based on their color, are unseen in training.

• **「把右下角的老鼠分到匹配的那一堆。」** 模型要把右下角的白色玩具老鼠放进白色玩具老鼠那一堆，而不是棕色和灰色老鼠的干扰堆。这些老鼠，以及按颜色分类物体的任务，训练中都没见过。

• **“I need to brush my teeth, pick up the correct item.”** The model must retrieve a toothpaste tube through cluttered distractors (deodorant, banana, and mango).

• **「我要刷牙，拿起正确的东西。」** 模型要在杂乱的干扰物（止汗剂，香蕉和芒果）中拿到一管牙膏。

For these three instructions, the keywords of reasoning (same, matching, correct) are unseen in the training dataset of robot actions.

这三条指令中表示推理的关键词（same, matching, correct）在机器人动作训练数据中都没有出现过。

## D.2.1.2 Semantic Generalization Tasks

**D.2.1.2 语义泛化任务**

These tasks require semantic and visual understanding beyond the complexity of the Instruction Generalization tasks in Section 3.4.

这些任务需要的语义和视觉理解比 3.4 节的指令泛化任务更复杂。

• **“Put the Japanese fish delicacy in the lunch-box.”** The model must decide that the sushi is the target object among various distractor objects, and pack the sushi into the lunch-box.

• **「把日本鱼类美食放进午餐盒。」** 模型要在多个干扰物中判断寿司是目标物体，并把寿司装进午餐盒。

• **“Pick up the full bowl.”** The model must lift up the bowl filled with dice (unseen in training) instead of the two empty bowls (seen in training).

• **「拿起装满的碗。」** 模型要拿起装满骰子的碗（训练中没见过），而不是两个空碗（训练中见过）。

For these two instructions, the language describing the new semantic concept (Japanese fish delicacy, full) are unseen in the training dataset of actions.

这两条指令中描述新语义概念的词（Japanese fish delicacy, full）在动作训练数据中都没有出现过。

## D.2.1.3 Spatial Understanding Tasks

**D.2.1.3 空间理解任务**

These tasks require understanding concepts about relative and absolute spatial relationships.

这些任务需要理解相对和绝对空间关系的概念。

• **“Pack the smallest coke soda in the lunch-box.”** The model must pack the mini-size Coca-cola can instead of distractor full-size Coca-cola cans, and place it into the lunch-box. The language describing the spatial concept under evaluation (smallest) is unseen in training.

• **「把最小的可乐装进午餐盒。」** 模型要拿迷你装可口可乐罐，而不是正常尺寸的干扰罐，并放进午餐盒。被评估的空间概念对应的词（smallest）训练中没见过。

• **“Put the cold medicine in the bottom/top left bowl.”** The model must find the cold medicine box out of distractors (a indigestion medicine and hand sanitizer), all of which are unseen in training, and place it into the correct bowl out of three distractor bowls placed in different locations around the table.

• **「把感冒药放进左下/左上的碗。」** 模型要从干扰物（一盒消化药和洗手液）中找出感冒药盒，这些东西训练中都没见过，再从桌上不同位置的三个干扰碗中选出正确的碗放进去。

For these two instructions, the language describing the new objects (coke soda, medicine) is unseen during training, while the language describing the spatial concepts are present varying amounts in the training distribution of action labels: smallest is unseen, top left and bottom left are rare, and left and right are common.

这两条指令中描述新物体的词（coke soda, medicine）训练中没见过；描述空间概念的词在动作标注的训练分布中出现的多少不一：smallest 没出现过，top left 和 bottom left 很少，left 和 right 很常见。

## D.3. Fast adaptation to new tasks

**D.3 快速适配新任务**

## D.3.1. Tasks and evaluation details

**D.3.1 任务和评估细节**

We also study the capability of Gemini Robotics to adapt rapidly (using up to 100 episodes of demonstration) to new tasks. We choose shorter segments sampled from the demonstrations for the

我们还研究了 Gemini Robotics（用最多 100 个回合的示范）快速适配新任务的能力。我们从

<!-- page 58 of 64 -->

![Image block](images/p58-figure-43-tasks-for-fast-adaptation-experiments-from.png)

Figure 43 | Tasks for fast adaptation experiments. From top to bottom: “Draw card”，“Play card”，“Pour lettuce”，“Salad dressing”，“Seal container”，“Put container in lunch-box”，“Zip lunch-box”，and “Origami first fold”。

图 43：快速适配实验的任务。从上到下：「抽牌」，「出牌」，「倒生菜」，「淋沙拉酱」，「盖保鲜盒」，「保鲜盒放进午餐盒」，「拉上午餐盒拉链」 和 「折纸第一折」。

long-horizon dexterous tasks (Section 4.1) as the new tasks. Note that in this section, we fine-tune the Gemini Robotics checkpoint directly from Section 3, which has never seen any demonstrations

长时程灵巧任务（4.1 节）的示范中截取较短的片段作为新任务。注意本节直接微调第 3 节的 Gemini Robotics 检查点，它从没见过

<!-- page 59 of 64 -->

introduced in Section 4.1. This ensures that it is a fair test for adapting to new tasks. The evaluated tasks used in Figure 26 are:

4.1 节引入的任何示范。这保证了这是对适配新任务的公平测试。图 26 评估的任务如下：

• **“Draw card.”** The robot must draw one card from the card dispenser machine by pushing the green button, picking up the card, and placing the card into the left gripper.

• **「抽牌。」** 机器人要按绿色按钮从发牌机抽一张牌，拿起这张牌，放到左夹爪里。

• **“Play card.”** The robot must pick one of the three cards from the robot gripper and play it by placing it on the table.

• **「出牌。」** 机器人要从夹爪里的三张牌中取一张，放到桌上打出。

• **“Pour lettuce.”** The robot must pour lettuce from the green bowl into the white salad mixing bowl.

• **「倒生菜。」** 机器人要把生菜从绿碗倒进白色沙拉拌碗。

• **“Salad Dressing.”** The robot must pick up the salad dressing bottle and squeeze the bottle over the white salad mixing bowl.

• **「淋沙拉酱。」** 机器人要拿起沙拉酱瓶，在白色沙拉拌碗上方挤瓶子。

• **“Seal container.”** The robot must close the lid of the Tupperware container by aligning and pressing down on multiple locations of the container lid.

• **「盖保鲜盒。」** 机器人要对齐保鲜盒盖，并在盒盖多个位置按下，把 Tupperware 保鲜盒盖紧。

• **“Put container in lunch-box.”** The robot must pick up the Tupperware container and place it in the open lunch-box.

• **「保鲜盒放进午餐盒。」** 机器人要拿起 Tupperware 保鲜盒，放进打开的午餐盒。

• **“Zip lunch-box.”** The robot must fully zip up the lunch box using the zipper tag.

• **「拉上午餐盒拉链。」** 机器人要捏住拉链头，把午餐盒拉链完全拉上。

• **“Origami first fold.”** The robot must diagonally fold a square piece of construction paper into a triangle shape.

• **「折纸第一折。」** 机器人要把一张正方形卡纸沿对角线折成三角形。

See Fig. 43 for an illustration of each of the fast adaptation tasks.

各快速适配任务的示意见图 43。

For each of the fast adaptation tasks described above, we report curves of success rate with increasing amount of demonstration data (5, 20 and 100 episodes) in Fig. 26 for Gemini Robotics and baselines. We run 10 trials and calculate the average success rate to draw each point in the plot. Given the short-horizon nature of these tasks, we do not define or report a progress score.

对上面每个快速适配任务，图 26 给出 Gemini Robotics 和基线的成功率随示范数据量（5, 20 和 100 个回合）增加的曲线。图中每个点是 10 次试验的平均成功率。由于这些任务时程短，我们没有定义也没有报告进度分。

> **问：** 摘要里 「只用 100 次示范」，这个 100 的分母是什么？
> 按本节和 4.3 节拼起来：100 是每个新任务各自的示范回合数，取值只有 5, 20, 100 三档（图 26 的横轴另有 0 点）；每个点的分母是 10 次试验。这 100 次不是从零学，起点是第 3 节的检查点，而那个检查点在 3.1 节已经吃过 12 个月，数千小时，数千种任务的 ALOHA 2 示范。这些新任务又是从 4.1 节长时程任务的示范里截出来的短片段，同一台 ALOHA 2，同一类物体。作为对照，4.1 节每个长时程任务用了 2000 到 5000 个回合。所以 「100 次」 衡量的是在大量同机体数据之上再学一个短任务的增量成本；4.3 节把它折算成 15 分钟到 1 小时的示范时长。摘要写 「as few as 100」，图 26 的图注写 「at most 100」，说法一松一紧，按图 26 的读数是 「最多 100 次，8 个任务里有 7 个达到 70%」。

## D.4. Adaptation to new embodiments

**D.4 适配新机体**

## D.4.1. Tasks description

**D.4.1 任务说明**

We test our Gemini Robotics model on the bi-arm Franka platform on 4 dexterous tasks relevant for industrial applications (example of rollouts in Fig. 44). We describe here the tasks and define the progress score for each of them:

我们在双臂 Franka 平台上，用 4 个和工业应用相关的灵巧任务测试 Gemini Robotics（执行示例见图 44）。下面说明这些任务，并定义每个任务的进度分：

• **Tape hanging on a workshop wall**: The robot must grasp a tape from the desk and hang it on a hook on the workshop wall.

• **把胶带卷挂到车间墙上：** 机器人要从桌上拿起一卷胶带，挂到车间墙上的挂钩上。

– 1.0: If the robot succeeds in handing the tape over to the other arm, hangs it to the correct hook on the wall and moves the arms away;

– 1.0：机器人把胶带交给另一只手臂，挂到墙上正确的挂钩上，并把手臂移开；

– 0.9: If the robot succeeds in handing the tape over to the other arm and hangs it to the correct hook on the wall;

– 0.9：机器人把胶带交给另一只手臂，并挂到墙上正确的挂钩上；

– 0.5: If the robot succeeds in handing the tape over to the other arm;

– 0.5：机器人把胶带交给了另一只手臂；

– 0.1: If the robot picks up the tape;

– 0.1：机器人拿起了胶带；

– 0.0: If anything else happens.

– 0.0：其他任何情况。

• **Plug insertion into socket**: One arm must grasp a UK electric plug and insert it into a socket to turn on a light, while the other arm must stabilize the socket.

• **插头插进插座：** 一只手臂要抓住一个英标插头，插进插座点亮一盏灯，另一只手臂要扶稳插座。

– 1.0: If the robot successfully inserts the plug into the socket, the light turns on and the robot moves the arms away;

– 1.0：机器人把插头插进插座，灯亮，并把手臂移开；

– 0.9: If the robot successfully inserts the plug into the socket and the light turns on;

– 0.9：机器人把插头插进插座，灯亮；

– 0.7: If the robot successfully aligns the plug with respect to the socket;

– 0.7：机器人把插头对准了插座；

<!-- page 60 of 64 -->

![Image block](images/p60-figure-44-model-rollouts-for-the-4-tasks-with-the-bi.png)

Figure 44 | Model rollouts for the 4 tasks with the bi-arm Franka robot. From top to bottom: tape hanging on a workshop wall, plug insertion into socket, round belt assembly in NIST task board 2, timing belt assembly in NIST task board 2.

图 44：双臂 Franka 机器人在 4 个任务上的执行过程。从上到下：把胶带卷挂到车间墙上，插头插进插座，在 NIST 任务板 2 上装圆带，在 NIST 任务板 2 上装同步带。

– 0.3: If the robot successfully grasps the plug with one arm and holds the socket with the other arm;

– 0.3：机器人一只手臂抓住插头，另一只手臂扶住插座；

– 0.2: If the robot successfully grasps the plug with one arm;

– 0.2：机器人用一只手臂抓住了插头；

– 0.0: If anything else happens.

– 0.0：其他任何情况。

• **Round belt task of NIST Assembly Task Board 2 (ATB)** (Kimble et al., 2020): The robot must assemble a flexible industrial rubber band around a pulley system. This requires handing over the flexible and draping rubber band, and stretching it to fit onto the pulleys.

• **NIST 装配任务板 2 (ATB) 的圆带任务** (Kimble et al., 2020)：机器人要把一根柔性工业橡胶带装到滑轮组上。这需要在两手之间传递柔软下垂的橡胶带，并把它撑开套到滑轮上。

– 1.0: If the robot inserts the rubber band on both wheels, ensures the belt is properly inserted and moves the arms away;

– 1.0：机器人把橡胶带套上两个轮子，确认带子装好，并把手臂移开；

– 0.9: If the robot inserts the rubber band on both wheels;

– 0.9：机器人把橡胶带套上两个轮子；

– 0.7: If the robot inserts the rubber band on one of the wheels, but fails to place the rubber band on the other wheel;

– 0.7：机器人把橡胶带套上一个轮子，但没能套上另一个；

– 0.5: If the robot manages to grasp the rubber band with both arms;

– 0.5：机器人用两只手臂抓住了橡胶带；

– 0.1: If the robot manages to grasp the rubber band with one arm;

– 0.1：机器人用一只手臂抓住了橡胶带；

– 0.0: If anything else happens.

– 0.0：其他任何情况。

• **Timing belt task of NIST Assembly Task Board 2 (ATB)** (Kimble et al., 2020): The robot must assemble an industrial timing belt around a pulley system. This demands coordinated bi-arm action and significant force (roughly 40N) to pull the blue handle in the correct direction, enabling the timing belt’s secure placement on the pulley system.

• **NIST 装配任务板 2 (ATB) 的同步带任务** (Kimble et al., 2020)：机器人要把一根工业同步带装到滑轮组上。这需要双臂协调，并用较大的力（约 40N）朝正确方向拉动蓝色把手，才能把同步带稳稳装到滑轮组上。

– 1.0: If the robot inserts the belt on both wheels by applying enough force on the blue

– 1.0：机器人对蓝色把手施加足够的力，把带子套上两个轮子，

<!-- page 61 of 64 -->

handle, ensures that the belt is properly inserted and moves the arms away;

确认带子装好，并把手臂移开；

– 0.9: If the robot inserts the belt on both wheels by apply enough force on the blue handle and ensures that the belt is properly inserted;

– 0.9：机器人对蓝色把手施加足够的力，把带子套上两个轮子，并确认带子装好；

– 0.7: If the robot inserts the belt on the large wheel, pushes the blue handle but fails to place the belt on the small wheel;

– 0.7：机器人把带子套上大轮，推了蓝色把手，但没能套上小轮；

– 0.5: If the robot just inserts the belt on the large wheel.

– 0.5：机器人只把带子套上了大轮。

– 0.3: If the robot manages to grasp the belt with both arms;

– 0.3：机器人用两只手臂抓住了带子；

– 0.1: If the robot manages to grasp the belt with one arm;

– 0.1：机器人用一只手臂抓住了带子；

– 0.0: If anything else happens.

– 0.0：其他任何情况。

## D.4.2. Evaluation procedure

**D.4.2 评估流程**

For in distribution evaluations, we run 20 trials per task by setting up the initial conditions based on the training data. We now describe the benchmark used to assess the visual and the action generalization performance for our Gemini Robotics model and the single task diffusion baseline.

分布内评估中，我们按训练数据设置初始条件，每个任务跑 20 次试验。下面描述用来评估 Gemini Robotics 和单任务扩散基线视觉泛化与动作泛化表现的基准。

## D.4.2.1 Visual generalization tasks

**D.4.2.1 视觉泛化任务**

For each task, we vary the appearance of the scene by 1) adding novel distractor objects, 2) altering the background and 3) changing the lighting condition. Example of initial scenes used for this analysis can be found in Figure 45.

对每个任务，我们通过以下方式改变场景外观：1) 加入新的干扰物，2) 换背景，3) 改变光照条件。这项分析所用的初始场景示例见图 45。

## D.4.2.2 Action generalization tasks

**D.4.2.2 动作泛化任务**

For each task, we assess action generalization by 1) putting the objects at positions that are not seen in the training data and 2) using different instances of objects to be manipulated that have different appearances, shapes or physical properties. Examples of initial scenes can be found in Figure 46.

对每个任务，我们通过以下方式评估动作泛化：1) 把物体放在训练数据中没出现过的位置，2) 换成外观，形状或物理属性不同的待操作物体实例。初始场景示例见图 46。

For completeness, in addition to Figure 28 where we reported the progress score, Figure 47 reports the success rate of our model and the baseline across the tasks in the generalization benchmark.

为完整起见，除了报告进度分的图 28，图 47 还给出我们的模型和基线在泛化基准各任务上的成功率。

<!-- page 62 of 64 -->

<table><tr><td>In-distribution</td><td>Distractors</td><td>Different background</td><td>Different lighting conditions</td></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td colspan="4">Pass the tape from the left arm to the right arm and hang it on the wall.</td></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td colspan="4">Hold the extension lead with the left arm and insert the plug in the rightmost socket of that lead with the right arm.</td></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td colspan="4">Pick the orange round belt with the left arm and place it on the slide pulleys positioned on the NIST board 2.</td></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td colspan="4">Pick the timing belt with the left arm and place it on the timing pulleys positioned on the NIST board 2.</td></tr></table>

图 45 表格：四列依次是分布内，干扰物，不同背景，不同光照。四条指令：把胶带从左臂交给右臂并挂到墙上；左臂扶住插线板，右臂把插头插进插线板最右边的插孔；左臂拿起橙色圆带，套到 NIST 任务板 2 的滑轮上；左臂拿起同步带，套到 NIST 任务板 2 的同步轮上。

Figure 45 | Example tasks used for visual generalization studies when the Gemini Robotics model is adapted to the bi-arm Franka robot.

图 45: Gemini Robotics 适配到双臂 Franka 机器人后，视觉泛化研究所用的示例任务。

<!-- page 63 of 64 -->

<table><tr><td>In-distribution</td><td colspan="2">Different initial positions</td><td>In-distribution</td><td colspan="2">New object instance</td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td colspan="6">Pass the tape from the left arm to the right arm and hang it on the wall.</td></tr><tr><td></td><td></td><td></td><td></td><td colspan="2"></td></tr><tr><td colspan="6">Hold the extension lead with the left arm and insert the plug in the rightmost socket of that lead with the right arm.</td></tr><tr><td></td><td colspan="2"></td><td></td><td colspan="2"></td></tr><tr><td colspan="6">Pick the orange round belt with the left arm and place it on the slide pulleys positioned on the NIST board 2.</td></tr><tr><td></td><td colspan="2"></td><td></td><td colspan="2"></td></tr><tr><td colspan="6">Pick the timing belt with the left arm and place it on the timing pulleys positioned on the NIST board 2.</td></tr></table>

图 46 表格：列依次是分布内，不同初始位置（两列），分布内，新物体实例（两列）。四条指令和图 45 相同。

Figure 46 | Example tasks used for action generalization studies when the Gemini Robotics model is adapted to the bi-arm Franka robot.

图 46: Gemini Robotics 适配到双臂 Franka 机器人后，动作泛化研究所用的示例任务。

<!-- page 64 of 64 -->

![Chart block](images/p64-figure-47-breakdown-of-generalization-metrics-success.png)

Figure 47 | Breakdown of generalization metrics (success rate) when the Gemini Robotics model is adapted to the bi-arm Franka robot. Similar to the progress score used in Fig. 28, our model significantly outperforms the diffusion baseline.

图 47: Gemini Robotics 适配到双臂 Franka 机器人后泛化指标的分项结果（成功率）。和图 28 的进度分一样，我们的模型明显优于扩散基线。
