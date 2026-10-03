---
title: "MiniCPM-o 2.6 · 源文"
category: "模型库"
tags: ["MiniCPM", "源文"]
published: true
excerpt: "MiniCPM-o 2.6 公开材料的 MinerU 抓取原文。"
---
<!-- page 1 of 27 -->

![Image block](images/p01-image.png)

![Image block](images/p01-s.png)

S

Search models, datasets, users...

## [openbmb](https://huggingface.co/openbmb)/[MiniCPM-o-2\_6](https://huggingface.co/openbmb/MiniCPM-o-2_6)

Like

1.3k

Follow OpenBMB

5.36k

[Any-to-Any](https://huggingface.co/models?pipeline_tag=any-to-any)

[Transformers](https://huggingface.co/models?library=transformers)

[Safetensors](https://huggingface.co/models?library=safetensors)

openbmb/RLAIF-V-Dataset

[minicpmo](https://huggingface.co/models?other=minicpmo)

[feature-extraction](https://huggingface.co/models?other=feature-extraction)

[minicpm-o](https://huggingface.co/models?other=minicpm-o)

[custom\_code](https://huggingface.co/models?other=custom_code)

[audio](https://huggingface.co/models?other=audio)

[speech](https://huggingface.co/models?other=speech)

arxiv:2405.17220

arxiv:2408.01800

License: apache-2.0

Deploy

Copy to bucket **NEW**

Use this model

[**Model card**](https://huggingface.co/openbmb/MiniCPM-o-2_6)

[Files](https://huggingface.co/openbmb/MiniCPM-o-2_6/tree/main)

[**xet**](https://huggingface.co/openbmb/MiniCPM-o-2_6/tree/main)

![Image block](images/p01-community.png)

Community

![Image block](images/p01-downloads-last-month.png)

## Downloads last month

## 355,098

![Image block](images/p01-safetensors.png)

## Safetensors

Model size

9B params

Tensor type

BF16

<u>Chat template</u>

<u>Files info</u>

## Inference Providers [NEW](https://huggingface.co/docs/inference-providers)

[Any-to-Any](https://huggingface.co/tasks/any-to-any)

This model isn't deployed by any Inference Provider.

5 Ask for provider support

## Model tree for openbmb/MiniCPM-o-2\_6

**Adapters** [3 models](https://huggingface.co/models?other=base_model:adapter:openbmb/MiniCPM-o-2_6)

**Finetunes** [8 models](https://huggingface.co/models?other=base_model:finetune:openbmb/MiniCPM-o-2_6)

**Quantizations** [9 models](https://huggingface.co/models?other=base_model:quantized:openbmb/MiniCPM-o-2_6)

## Dataset used to train openbmb/MiniCPM-o-2\_6

<!-- page 2 of 27 -->

```txt
MiniCPM-V: A GPT-4V Level MLLM on Your Phone
Paper • 2408.01800 • Published Aug 3, 2024 • △ 95

RLAIF-V: Aligning MLLMs through Open-Source AI Feedback for Super GPT-4V Trustwor...
Paper • 2405.17220 • Published May 27, 2024 • △ 1
```

```txt
openbmb/RLAIF-V-Dataset
Viewer · Updated Oct 14, 2025 · ⌘ 83.1k · ↓ 1.87k · ♥ 219
```

**Spaces using openbmb/MiniCPM-o-2\_6** 15

```txt
eduagarcia/multilingual-tokenizer-leaderboard baryonlabs/open-ko-s2s-leaderboard
jrpaul08/Reading-Buddy baryonlabs/open-ko-s2s-insights Staticaliza/Sense + 10 Spaces
```

品 **Collections including openbmb/MiniCPM-o-2\_6**

```txt
MiniCPM Collection
The MiniCPM family of LLMs and VLLMs. • 33 items • Updated 10 days ago • △ 78
```

```txt
MiniCPM-o & MiniCPM-V Collection
Multimodal models with leading perform... • 32 items • Updated 10 days ago • △ 86
```

**Papers for openbmb/MiniCPM-o-2\_6**

## A GPT-4o Level MLLM for Vision, Speech and Multimodal Live Streaming on Your Phone

```txt
GitHub | MiniCPM Wiki(Chinese). | Online Demo | Technical Blog | Join Us
```

**News**

[2025.06.20] ⭐️ ⭐️ ⭐️ Our official [ollama repository](https://ollama.com/openbmb) is released. Try our latest models with [one click](https://ollama.com/openbmb/minicpm-o2.6)！

<!-- page 3 of 27 -->

[2025.03.01] 🚀 RLAIF-V, which is the alignment technique of MiniCPM-o, is accepted by CVPR 2025！The [code](https://github.com/RLHF-V/RLAIF-V), [dataset](https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset), [paper](https://arxiv.org/abs/2405.17220) are open-sourced!

[2025.01.24] 📢📢📢 MiniCPM-o 2.6 technical report is released! [See Here](https://openbmb.notion.site/MiniCPM-o-2-6-A-GPT-4o-Level-MLLM-for-Vision-Speech-and-Multimodal-Live-Streaming-on-Your-Phone-185ede1b7a558042b5d5e45e6b237da9).

[2025.01.19] ⭐️ ⭐️ ⭐️ MiniCPM-o tops GitHub Trending and reaches top-2 on Hugging Face Trending!

## MiniCPM-o 2.6

**MiniCPM-o 2.6** is the latest and most capable model in the MiniCPM-o series. The model is built in an end-to-end fashion based on SigLip-400M, Whisper-medium-300M, ChatTTS-200M, and Qwen2.5-7B with a total of 8B parameters. It exhibits a significant performance improvement over MiniCPM-V 2.6, and introduces new features for realtime speech conversation and multimodal live streaming. Notable features of MiniCPMo 2.6 include:

🔥 **Leading Visual Capability.** MiniCPM-o 2.6 achieves an average score of 70.2 on OpenCompass, a comprehensive evaluation over 8 popular benchmarks. **With only 8B parameters, it surpasses widely used proprietary models like GPT-4o-202405, Gemini 1.5 Pro, and Claude 3.5 Sonnet** for single image understanding. It also **outperforms GPT-4V and Claude 3.5 Sonnet** in mutli-image and video understanding, and shows promising in-context learning capability.

🎙 **State-of-the-art Speech Capability.** MiniCPM-o 2.6 supports **bilingual realtime speech conversation with configurable voices** in English and Chinese. It **outperforms GPT-4o-realtime on audio understanding tasks** such as ASR and STT translation, and shows **state-of-the-art performance on speech conversation in both semantic and acoustic evaluations in the open-source community**. It also allows for fun features such as emotion/speed/style control, end-to-end voice cloning, role play, etc.

🎬 **Strong Multimodal Live Streaming Capability.** As a new feature, MiniCPM-o 2.6 can **accept continous video and audio streams independent of user queries,**

<!-- page 4 of 27 -->

**and support real-time speech interaction**. It **outperforms GPT-4o-202408 and Claude 3.5 Sonnet and shows state-of-art performance in open-source community on StreamingBench**, a comprehensive benchmark for real-time video understanding, omni-source (video & audio) understanding, and multimodal contextual understanding.

💪 **Strong OCR Capability and Others.** Advancing popular visual capabilites from MiniCPM-V series, MiniCPM-o 2.6 can process images with any aspect ratio and up to 1.8 million pixels (e.g., 1344x1344). It achieves **state-of-the-art performance on OCRBench for models under 25B, surpassing proprietary models such as GPT-4o-202405**. Based on the the latest [RLAIF-V](https://github.com/RLHF-V/RLAIF-V/) and [VisCPM](https://github.com/OpenBMB/VisCPM) techniques, it features **trustworthy behaviors**, outperforming GPT-4o and Claude 3.5 Sonnet on MMHal-Bench, and supports **multilingual capabilities** on more than 30 languages.

**Superior Efficiency.** In addition to its friendly size, MiniCPM-o 2.6 also shows **state-of-the-art token density** (i.e., number of pixels encoded into each visual token). **It produces only 640 tokens when processing a 1.8M pixel image, which is 75% fewer than most models**. This directly improves the inference speed, firsttoken latency, memory usage, and power consumption. As a result, MiniCPM-o 2.6 can efficiently support **multimodal live streaming** on end-side devices such as iPad.

💫 **Easy Usage.** MiniCPM-o 2.6 can be easily used in various ways: (1) [llama.cpp](https://github.com/OpenBMB/llama.cpp/blob/minicpm-omni/examples/llava/README-minicpmo2.6.md) support for efficient CPU inference on local devices, (2) [int4](https://huggingface.co/openbmb/MiniCPM-o-2_6-int4) and [GGUF](https://huggingface.co/openbmb/MiniCPM-o-2_6-gguf) format quantized models in 16 sizes, (3) vLLM support for high-throughput and memoryefficient inference, (4) fine-tuning on new domains and tasks with [LLaMA-Factory](https://huggingface.co/openbmb/MiniCPM-o-2_6/blob/main/docs/llamafactory_train.md), (5) quick local WebUI demo setup with <u>Gradio</u>, and (6) online web demo on [server](https://minicpm-omni-webdemo-us.modelbest.cn/).

## Model Architecture.

**End-to-end Omni-modal Architecture.** Different modality encoder/decoders are connected and trained in an **end-to-end** fashion to fully exploit rich multimodal knowledge.

<!-- page 5 of 27 -->

**Omni-modal Live Streaming Mechanism.** (1) We change the offline modality encoder/decoders into online ones for **streaminig inputs/outputs.** (2) We devise a **time-division multiplexing (TDM) mechanism** for omni-modality streaminig processing in the LLM backbone. It divides parallel omni-modality streams into sequential info within small periodic time slices.

**Configurable Speech Modeling Design.** We devise a multimodal system prompt, including traditional text system prompt, and **a new audio system prompt to determine the assistant voice**. This enables flexible voice configurations in inference time, and also facilitates end-to-end voice cloning and descriptionbased voice creation.

![Image block](images/p05-evaluation.png)

## Evaluation

<!-- page 6 of 27 -->

![Image block](images/p06-mathcal-q-visual-understanding-results.png)

$\mathcal { Q }$ Visual understanding results

Image Understanding:

|  |  | Token |  |  | MathVista |  |
| --- | --- | --- | --- | --- | --- | --- |
| Model | Size | Density+ | OpenCompass | OCRBench | mini | ChartQA |
| Proprietary |  |  |  |  |  |  |
| GPT-4o-20240513 | - | 1088 | 69.9 | 736 | 61.3 | 85.7 |
| Claude3.5-Sonnet | - | 750 | 67.9 | 788 | 61.6 | 90.8 |
| Gemini1.5Pro | - | - | 64.4 | 754 | 57.7 | 81.3 |
| GPT-4o-mini-20240718 | - | 1088 | 64.1 | 785 | 52.4 | - |
| OpenSource |  |  |  |  |  |  |
| Cambrian-34B | 34B | 1820 | 58.3 | 591 | 50.3 | 75.6 |
| GLM-4V-9B | 13B | 784 | 59.1 | 776 | 51.1 | - |
| Pixtral-12B | 12B | 256 | 61.0 | 685 | 56.9 | 81.8 |

<!-- page 7 of 27 -->

|  |  | Token |  |  | MathVista |  |
| --- | --- | --- | --- | --- | --- | --- |
| Model | Size | Density+ | OpenCompass | OCRBench | mini | ChartQA |
| DeepSeek-VL2-27B(4B) | 27B | 672 | 66.4 | 809 | 63.9 | 86.0 |
| Qwen2-VL-7B | 8B | 784 | 67.1 | 866 | 58.2 | 83.0 |
| LLaVA-OneVision-72B | 72B | 182 | 68.1 | 741 | 67.5 | 83.7 |
| InternVL2.5-8B | 8B | 706 | 68.3 | 822 | 64.4 | 84.8 |
| MiniCPM-V2.6 | 8B | 2822 | 65.2 | 852* | 60.6 | 79.4 |
| MiniCPM-o2.6 | 8B | 2822 | 70.2 | 897* | 71.9* | 86.9* |

\* We evaluate this benchmark using chain-of-thought prompting. Specifically, for MME, we used this technique only for the Cognition set.

Token Density: number of pixels encoded into each visual token at maximum+ resolution, i.e., # pixels at maximum resolution / # visual tokens.

Note: For proprietary models, we calculate token density based on the image encoding charging strategy defined in the official API documentation, which provides an upperbound estimation.

**Multi-image and Video Understanding:**

click to view

**Audio understanding and speech conversation results.**

**Audio Understanding:**

<!-- page 8 of 27 -->

<table><tr><td>Task</td><td>Size</td><td colspan="3">ASR (zh)</td><td colspan="2">ASR (en)</td></tr><tr><td>Metric</td><td></td><td colspan="3">CER↓</td><td colspan="2">WER↓</td></tr><tr><td>Dataset</td><td></td><td>AISHELL-1</td><td>Fleurs zh</td><td>WenetSpeech test-net</td><td>LibriSpeech test-clean</td><td>GigaSpee</td></tr><tr><td colspan="7">Proprietary</td></tr><tr><td>GPT-4o-Realtime</td><td>-</td><td>7.3*</td><td>5.4*</td><td>28.9*</td><td>2.6*</td><td>12.9*</td></tr><tr><td>Gemini 1.5 Pro</td><td>-</td><td>4.5*</td><td>5.9*</td><td>14.3*</td><td>2.9*</td><td>10.6*</td></tr><tr><td colspan="7">Open-Source</td></tr><tr><td>Qwen2-Audio-7B</td><td>8B</td><td>-</td><td>7.5</td><td>-</td><td>1.6</td><td>-</td></tr><tr><td>Qwen2-Audio-7B-Instruct</td><td>8B</td><td>2.6*</td><td>6.9*</td><td>10.3*</td><td>3.1*</td><td>9.7*</td></tr><tr><td>GLM-4-Voice-Base</td><td>9B</td><td>2.5</td><td>-</td><td>-</td><td>2.8</td><td>-</td></tr><tr><td>MiniCPM-o 2.6</td><td>8B</td><td>1.6</td><td>4.4</td><td>6.9</td><td>1.7</td><td>8.7</td></tr></table>

\* We evaluate officially released checkpoints by ourselves.

## Speech Generation:

<table><tbody><tr><td>Task</td><td>Size</td><td colspan="7">SpeechQA</td></tr><tr><td>Metric</td><td></td><td colspan="3">ACC↑</td><td>G-Eval(10point)↑</td><td>Semantic ELO score↑</td><td>Acoustic ELO score↑</td><td>Ov E sc</td></tr><tr><td>Dataset</td><td></td><td>Speech Llama Q.</td><td>Speech WebQ.</td><td>Speech Trivia QA</td><td>Speech AlpacaEval</td><td colspan="3">AudioA</td></tr><tr><td colspan="9">Proprietary</td></tr><tr><td>GPT-4o-Realtime</td><td></td><td>71.7</td><td>51.6</td><td>69.7</td><td>7.4</td><td>1157</td><td>1203</td><td>12</td></tr></tbody></table>

<!-- page 9 of 27 -->

<table><tr><td>Task</td><td>Size</td><td colspan="7">SpeechQA</td></tr><tr><td>Metric</td><td></td><td colspan="3">ACC↑</td><td>G-Eval (10 point)↑</td><td>Semantic ELO score↑</td><td>Acoustic ELO score↑</td><td>OvE sc</td></tr><tr><td>Dataset</td><td></td><td>Speech Llama Q.</td><td>Speech Web Q.</td><td>Speech Trivia QA</td><td>Speech AlpacaEval</td><td colspan="3">Audio</td></tr><tr><td colspan="9">Open-Source</td></tr><tr><td>GLM-4-Voice</td><td>9B</td><td>50.0</td><td>32.0</td><td>36.4</td><td>5.1</td><td>999</td><td>1147</td><td>10</td></tr><tr><td>Llama-Omni</td><td>8B</td><td>45.3</td><td>22.9</td><td>10.7</td><td>3.9</td><td>960</td><td>878</td><td>89</td></tr><tr><td>Moshi</td><td>7B</td><td>43.7</td><td>23.8</td><td>16.7</td><td>2.4</td><td>871</td><td>808</td><td>87</td></tr><tr><td>Mini-Omni</td><td>1B</td><td>22.0</td><td>12.8</td><td>6.9</td><td>2.5</td><td>926</td><td>803</td><td>86</td></tr><tr><td>MiniCPM-o 2.6</td><td>8B</td><td>61.0</td><td>40.0</td><td>40.2</td><td>5.1</td><td>1088</td><td>1163</td><td>11</td></tr></table>

All results are from AudioEvals, and the evaluation methods along with further details can be found in [UltraEval-Audio](https://github.com/OpenBMB/UltraEval-Audio).

End-to-end Voice Cloning

<table><tbody><tr><td rowspan="2">Task</td><td rowspan="2" colspan="2">Voicecloning</td></tr><tr></tr><tr><td>Metric</td><td>SIMO↑</td><td>SIMO↑</td></tr><tr><td>Dataset</td><td>Seed-TTStest-zh</td><td>Seed-TTStest-en</td></tr><tr><td>F5-TTS</td><td>76</td><td>67</td></tr><tr><td rowspan="2">CosyVoice</td><td rowspan="2">75</td><td rowspan="2">64</td></tr><tr></tr><tr><td>FireRedTTS</td><td>63</td><td>46</td></tr><tr><td rowspan="2">MiniCPM-o2.6</td><td rowspan="2">57</td><td rowspan="2">47</td></tr><tr></tr></tbody></table>

<!-- page 10 of 27 -->

Multimodal live streaming results.

## Multimodal Live Streaming: results on StreamingBench

| Model | Size | Real-Time Video Understanding | Omni-Source Understanding | Contextual Understanding | Overall |
| --- | --- | --- | --- | --- | --- |
| Proprietary |  |  |  |  |  |
| Gemini1.5Pro | - | 77.4 | 67.8 | 51.1 | 70.3 |
| GPT-4o-202408 | - | 74.5 | 51.0 | 48.0 | 64.1 |
| Claude-3.5-Sonnet | - | 74.0 | 41.4 | 37.8 | 59.7 |
| Open-source |  |  |  |  |  |
| VILA-1.5 | 8B | 61.5 | 37.5 | 26.7 | 49.5 |
| LongVA | 7B | 63.1 | 35.9 | 30.2 | 50.7 |
| LLaVA-Next-Video-34B | 34B | 69.8 | 41.7 | 34.3 | 56.7 |
| Qwen2-VL-7B | 8B | 71.2 | 40.7 | 33.1 | 57.0 |
| InternVL2-8B | 8B | 70.1 | 42.7 | 34.1 | 57.0 |
| VITA-1.5 | 8B | 70.9 | 40.8 | 35.8 | 57.4 |
| LLaVA-OneVision-7B | 8B | 74.3 | 40.8 | 31.0 | 58.4 |
| InternLM-XC2.5-OL-7B | 8B | 75.4 | 46.2 | 33.6 | 60.8 |
| MiniCPM-V2.6 | 8B | 72.4 | 40.2 | 33.4 | 57.7 |
| MiniCPM-o2.6 | 8B | 79.9 | 53.4 | 38.5 | 66.0 |

## Examples

We deploy MiniCPM-o 2.6 on end devices. The demo video is the raw-speed recording on an iPad Pro and a Web demo.

<!-- page 11 of 27 -->

![Image block](images/p11-image.png)

![Image block](images/p11-image-2.png)

![Image block](images/p11-what-are-the-coordinates-of-the-intersection-point-of.png)

What are the coordinates of the intersection point of the two functions in the graph? You need to find all the intersection points.

## MiniCPM-o 2.6

To find the intersection points of two functions, we need to solve for x in the equation where both functions are equal. The given functions are:

$$
2. g (x) = x ^ {2} + x + 1
$$

$$
1. f (x) = x ^ {3} + 3 x ^ {2} - 2 x + 1
$$

Firstly, set them equal:

$$
\left. x ^ {3} + 3 x ^ {2} - 2 x + 1 = x ^ {2} + x + 1 \right|
$$

Simplify by combining like terms:

$$
x ^ {3} + 3 x ^ {2} \cdot 2 x + 1 \cdot x ^ {2} \cdot x - 1 = 0
$$

$$
x ^ {3} + 2 x ^ {2} - 3 x = 0
$$

Factor out an x :

$$
x (x ^ {2} + 2 x \cdot 3) = 0
$$

This gives us three potential solutions:

$$
\begin{array}{c} x = 0 \\ x ^ {2} + 2 x \cdot 3 = 0 \end{array}
$$

Solve the quadratic equation using the quadratic formula:

$$
\begin{array}{l} \text {a = 1,b = 2,c = -3} \end{array}
$$

$$
x = \frac {- b \pm \sqrt {b ^ {2} - 4 a c}}{}
$$

This results in:

$$
x = 1
$$

$$
x = - 3
$$

For each value ${ \mathfrak { o f } } \thinspace x ,$ plug it back into either function to get the corresponding y-values.

For x = 0 :

$$
\begin{array}{c} f (0) = (0) ^ {3} + 3 (0) ^ {2} - 2 (0) + 1 = 1 \\ g (0) = (0) ^ {2} + (0) + 1 = 1 \end{array}
$$

For x = 1:

$$
\begin{array}{r} f (1) = (1) ^ {3} + 3 (1) ^ {2} - 2 (1) + 1 \\ = 1 + 3 - 2 + 1 = 3 \end{array}
$$

$$
g (1) = (1) ^ {2} + (1) + 1 = 1 + 1 + 1 = 3
$$

$$
\begin{array}{c} \text {For} x = - 3: \\ f (- 3) = (- 3) ^ {3} + 3 (- 3) ^ {2} - 2 (- 3) + 1 \\ = - 2 7 + 2 7 + 6 + 1 = 7 \\ g (- 3) = (- 3) ^ {2} + (- 3) + 1 = 9 - 3 + 1 = 7 \end{array}
$$

Thus, the coordinates of the intersection points are:

1. (0, 1)

2. (1,3)

3. $(-3,7)$

<!-- page 12 of 27 -->

Do

![Image block](images/p12-analyze-all-info-shown-in-this-image-in-detail.png)

Analyze all info shown in this image in detail.

![Image block](images/p12-minicpm-o-2-6.png)

## MiniCPM-o 2.6

The image displays a neural network training interface with three main sections, each detailing different steps in the process of training a neural network. Below is a detailed analysis of each section:

1. Choose Input Dataset

This section allows the user to select a training dataset. There are four scatter plots shown, each representing different data distributions:

• The first plot shows a dataset with red and blue points clustered together.

The second plot shows a dataset with red and blue points spread out more evenly.

The third plot shows a dataset with red and blue points forming a circular pattern.

The fourth plot shows a dataset with red and blue points spread out more evenly.

Below the scatter plots, there is a legend that details the color scheme for labels and the values of weights/gradient:

Label/Prediction: A color bar ranging from 0 to 1, indicating the range of label or prediction values.

Weight/Gradient: A color bar ranging from negative (neg) to positive (pos), indicating the range of weight or gradient values.

• Node Type: Different types of nodes are indicated by symbols:

• Black circle: Input

• Orange circle: ReLU

• Green circle: Sigmoid

2. Choose Initialization Method

• Zero

• Too small

This section allows the user to select an initialization method for the values of neural network parameters. The options available are:

• Appropriate (selected)

• Too large

Below this, there is a visual representation of a neural network with various nodes and connections. The nodes are represented by circles of different colors, indicating their type (input, ReLU, Sigmoid). The connections between nodes are represented by lines, showing the flow of information through the network. At the bottom of this section, there is a checkbox to select whether to visualize the weights or gradients of the network:

• Weight (selected)

• Gradient

3.Train the Network

This section provides feedback on the training process. It includes:

A graph showing the cost function over epochs. The x-axis represents the number of epochs, and the y-axis represents the cost function value. The graph shows a downward trend, indicating that the cost function is decreasing as the number of epochs increases.

• A play button to start training the network.

• A stop button to stop the training process.

A decision boundary plot on the right side, which shows how the network separates the red and blue points into two distinct clusters. The decision boundary is represented by a gradient color change from red to blue, indicating the classification of the data points.

## Summary

The image illustrates a step-by-step process for training a neural network, including selecting the input dataset, choosing the initialization method, and observing the training progress. Each section provides visual aids and interactive elements to guide the user through the training process.

D

![Image block](images/p12-round-1.png)

Round 1

Can you help me to lower my bike seat?

![Image block](images/p12-minicpm-o-2-6-2.png)

## MiniCPM-o 2.6

Sure, I can help you lower your bike seat. Here's a general guide on how to do it:

1. Safety First

Remove Traffic: Make sure the area is clear of any obstacles or traffic.

Use Proper Tools: If needed, use appropriate tools like an Allen wrench (hex key) for specific adjustments.

2. Locate the Seat Post Clamp

The clamp holds the saddle in place and usually has two bolts: one near the top and another at the bottom.

3. Loosen the Bolts

Use an Allen wrench to loosen both bolts evenly until they are just loose enough that the saddle moves freely but isn't falling off completely.

4. Lower the Saddle

Carefully slide the saddle down along its rails as far as possible without hitting the frame or ground.

Ensure there's space between the saddle and the rear wheel when lowered; this prevents damage from pedaling through the gears if using clipless pedals.

5. Tighten the Bolts Again

Once adjusted to your desired height, tighten each bolt securely by hand first, then with an Allen wrench again after checking alignment.

## 6. Check Alignment & Comfort

Ensure the saddle aligns correctly over the centerline of the crankset when viewed headon.

Adjust fore/aft position so that your knee doesn't extend too much outward during pedal stroke.

## Tips:

Test ride slowly before riding long distances to ensure comfort and proper fitment.

Regularly check and adjust based on muscle changes due to training intensity.

Remember, every bicycle model may have slightly different procedures depending on design specifics Always refer to your owner manual for precise instructions tailored to your particular make and model.

o

![Image block](images/p12-round-2.png)

Round 2

Is this the bolt you mentioned?

![Image block](images/p12-minicpm-o-2-6-3.png)

## MiniCPM-o 2.6

Yes, the circled area in the image shows a bolt or screw that is used to secure the seat post on your bicycle. This component holds the saddle (seat) at its desired height and position relative to the bike frame.

D

![Image block](images/p12-image.png)

![Image block](images/p12-round-3.png)

Round 3

Here is my manual and tool box, do I have the right tool?

![Image block](images/p12-minicpm-o-2-6-4.png)

## MiniCPM-o 2.6

To determine if you have the right tool, let's compare your manual and toolbox:

1. Manual :

The seat post clamp (seat collar) requires a 4mm hex key or Allen wrench.

Various other components require different sizes of sockets or wrenches.

2. Toolbox :

Your toolbox appears to be well-equipped with various sizes of hex keys (Allen wrenches), sockets, ratchets, and extensions.

• Specifically look for:

A 4mm hex key or Allen wrench: This should match what is needed for the seat collar.

Other necessary sizes from the manual are also present in the toolbox.

## Conclusion:

You do indeed have the right tools for adjusting your bicycle seat height from your current toolbox setup. Make sure to select and use the appropriate 4mm hex key or Allen wrench to avoid damaging any components while lowering your bike seat.

<!-- page 13 of 27 -->

## Online Demo

Click here to try the online demo of [MiniCPM-o 2.6](https://minicpm-omni-webdemo-us.modelbest.cn/).

## Usage

Inference using Huggingface transformers on NVIDIA GPUs. Please ensure that **transformers==4.44.2** is installed, as other versions may have compatibility issues. We are investigating this issue. Requirements tested on python 3.10:

```txt
Pillow==10.1.0
torch==2.3.1
torchaudio==2.3.1
torchvision==0.18.1
transformers==4.44.2
librosa==0.9.0
soundfile==0.12.1
vector-quantize-pytorch==1.18.5
vocos==0.1.0
decord
moviepy
```

## Model initialization

```python
import torch
from PIL import Image
from transformers import AutoModel, AutoTokenizer

# load omni model default, the default init_vision/init_audio/init_tts
# if load vision-only model, please set init_audio=False and init_tts=
# if load audio-only model, please set init_vision=False
model = AutoModel.from_pretrained(
    'openbmb/MiniCPM-o-2_6',
    trust_remote_code=True,
    attn_implementation='sdpa', # sdpa or flash_attention_2
```

<!-- page 14 of 27 -->

```txt
Chat inference
```

```python
torch_dtype=torch.bfloat16,
    init_vision=True,
    init_audio=True,
    init_tts=True
)

model = model.eval().cuda()
tokenizer = AutoTokenizer.from_pretrained('openbmb/MiniCPM-o-2_6', trus

# In addition to vision-only mode, tts processor and vocos also needs
model.init_tts()
```

If you are using an older version of PyTorch, you might encounter this issue

**"weight\_norm\_fwd\_first\_dim\_kernel" not implemented for 'BFloat16'**, Please convert the TTS to float32 type.

```txt
model.tts.float()
```

## Omni mode

We provide two inference modes: chat and streaming

```python
import math
import numpy as np
from PIL import Image
from moviepy.editor import VideoFileClip
import tempfile
import librosa
import soundfile as sf

def get_video_chunk_content(video_path, flatten=True):
    video = VideoFileClip(video_path)
```

<!-- page 15 of 27 -->

```txt
print('video_duration:', video.duration)

with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as temp_audio_file_path = temp_audio_file.name
    video.audio.write_audiofile(temp_audio_file_path, codec="pcm_s:audio_np, sr = librosa.load(temp_audio_file_path, sr=16000, mono Audio_np, sr = librosa.load(temp_audio_file_path, sr=16000, mono Audio_np, sr = librosa.load(temp_audio_file_path, sr=16000, mono Audio_np, sr = librosa.load(temp_audio_file_path, sr=16000, mono Audio_np, sr = librosa.load(temp_audio_file_path, sr=16000, mono Audio_np, sr = librosa.load(temp_audio_file_path, sr=16000, mono Audio_np, sr = librosa.load(temp_audio_file_path, sr=16000, mono Audio_np, sr = librosa.load(temp_audio_file_path, sr=16000, mono Audio_np, sr = librosa.load(temp_audio_file_path, sr=16000, mono Audio_np, sr = librosa.load(temp_audio_file_path, sr=16000, mono Audio_np, sr = librosa.load(temp_audio_file_path, sr=16000, mono Audio_np, sr = librosa.load(temp_audio_file_path, sr=16000, mono Audio_np, sr = librosa.load(temp_audio_file_path, sr=16000, mono Audio_np, sr = librosa.load(temp.audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file_path, sr=16000, mono Audio_file
```

<!-- page 16 of 27 -->

```python
msgs=news,
    tokenizer=tokenizer,
    sampling=True,
    temperature=0.5,
    max_new_tokens=4096,
    omni_input=True, # please set omni_input=True when omni inference
    use_tts_template=True,
    generate_audio=generate_audio,
    output_audio_path=output_audio_path,
    max_slice_nums=1,
    use_image_id=False,
    return_dict=True
)
print(res)

## You will get the answer: The person in the picture is skiing down a
# import IPython
# IPython.display.Audio('output.wav')
```

## Streaming inference

```python
# a new conversation need reset session first, it will reset the kv-ca
model.reset_session()

contents = get_video_chunk_content(video_path, flatten=False)
session_id = '123'
generate_audio = True

# 1. prefill system prompt
res = model.streaming_prefill(
    session_id=session_id,
    msgs=[sys_msg],
    tokenizer=tokenizer
)

# 2. prefill video/audio chunks
for content in contents:
```

<!-- page 17 of 27 -->

```python
msgs = [{"role":"user", "content": content}]
    res = model.streaming_prefill(
        session_id=session_id,
        msgs=news,
        tokenizer=tokenizer
    )

# 3. generate
res = model.streaming_generate(
    session_id=session_id,
    tokenizer=tokenizer,
    temperature=0.5,
    generate_audio=generate_audio
)

audios = []
text = ""

if generate_audio:
    for r in res:
        audio_wav = r.audio_wav
        sampling_rate = r.sampling_rate
        txt = r.text

        audios.append(audio_wav)
        text += txt

    res = np.concatenate(audios)
    sf.write("output.wav", res, samplerate=sampling_rate)
    print("text:", text)
    print("audio saved to output.wav")
else:
    for r in res:
        text += r['text']
    print("text:", text)
```

## Speech and Audio Mode

<!-- page 18 of 27 -->

```txt
Model initialization
```

```python
import torch
import librosa
from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained('openbmb/MiniCPM-o-2_6', trust_remote)
    attn_implementation='sdpa', torch_dtype=torch.bfloat16) # sdpa or a
model = model.eval().cuda()
tokenizer = AutoTokenizer.from_pretrained('openbmb/MiniCPM-o-2_6', trus

model.init_tts()
model.tts.float()
```

## Mimick

**Mimick** task reflects a model's end-to-end speech modeling capability. The model takes audio input, and outputs an ASR transcription and subsequently reconstructs the original audio with high similarity. The higher the similarity between the reconstructed audio and the original audio, the stronger the model's foundational capability in endto-end speech modeling.

```python
mimick_prompt = "Please repeat each user's speech, including voice sty:
audio_input, _ = librosa.load('./assets/input_examples/Trump_WEF_2018_2

# can also try './assets/input_examples/cxk_original.wav',
# './assets/input_examples/fast-pace.wav',
# './assets/input_examples/chi-english-1.wav'
# './assets/input_examples/exciting-emotion.wav'
# for different aspects of speech-centric features.

msgs = [{'role': 'user', 'content': [mimick_prompt, audio_input]}]
res = model.chat(
```

<!-- page 19 of 27 -->

```python
msgs=news,
    tokenizer=tokenizer,
    sampling=True,
    max_new_tokens=128,
    use_tts_template=True,
    temperature=0.3,
    generate_audio=True,
    output_audio_path='output_mimick.wav', # save the tts result to out
```

## General Speech Conversation with Configurable Voices

A general usage scenario of **MiniCPM-o-2.6** is role-playing a specific character based on the audio prompt. It will mimic the voice of the character to some extent and act like the character in text, including language style. In this mode, **MiniCPM-o-2.6** sounds **more natural and human-like**. Self-defined audio prompts can be used to customize the voice of the character in an end-to-end manner.

```python
ref_audio, _ = librosa.load('./assets/input_examples/icl_20.wav', sr=16
sys_prompt = model.get_sys_prompt(ref_audio=ref_audio, mode='audio_role')
# round one
user_question = {'role': 'user', 'content': [librosa.load('xxx.wav', s:
msgs = [sys_prompt, user_question]
res = model.chat(
    msgs=new_tokens,
    tokenizer=tokenizer,
    sampling=True,
    max_new_tokens=128,
    use_tts_template=True,
    generate_audio=True,
    temperature=0.3,
    output_audio_path='result_roleplay_round_1.wav',
```

<!-- page 20 of 27 -->

```python
)

# round two
history = msgs.append({'role': 'assistant', 'content': res})
user_question = {'role': 'user', 'content': [librosa.load('xxx.wav', s:
msgs = history.append(user_question)
res = model.chat(
    msgs=new,\$,
    tokenizer=tokenizer,
    sampling=True,
    max_new_tokens=128,
    use_tts_template=True,
    generate_audio=True,
    temperature=0.3,
    output_audio_path='result_roleplay_round_2.wav',
)

print(res)
```

## Speech Conversation as an AI Assistant

An enhanced feature of **MiniCPM-o-2.6** is to act as an AI assistant, but only with limited choice of voices. In this mode, **MiniCPM-o-2.6** is **less human-like and more like a voice assistant**. In this mode, the model is more instruction-following. For demo, you are suggested to use **assistant\_female\_voice**, **assistant\_male\_voice**, and **assistant\_default\_female\_voice**. Other voices may work but not as stable as the default voices.

**Please note that, assistant\_ female\_voice and assistant\_male\_voice are more stable but sounds like robots, while assistant\_default\_ female\_voice is more**

```txt
human alike but not stable, its voice often changes in multiple turns. We suggest you to try stable voices assistant_female_voice and assistant_male_voice.
```

<!-- page 21 of 27 -->

```python
ref_audio, _ = librosa.load('./assets/input_examples/assistant_female \
sys_prompt = model.get_sys_prompt(ref_audio=ref_audio, mode='audio_ass:
user_question = {'role': 'user', 'content': [librosa.load('xxx.wav', s:
# round one
msgs = [sys_prompt, user_question]
res = model.chat(
    msgs=news,
    tokenizer=tokenizer,
    sampling=True,
    max_new_tokens=128,
    use_tts_template=True,
    generate_audio=True,
    temperature=0.3,
    output_audio_path='result_assistant_round_1.wav',
)

# round two
history = msgs.append({'role': 'assistant', 'content': res})
user_question = {'role': 'user', 'content': [librosa.load('xxx.wav', s:
msgs = history.append(user_question)
res = model.chat(
    msgs=news,
    tokenizer=tokenizer,
    sampling=True,
    max_new_tokens=128,
    use_tts_template=True,
    generate_audio=True,
    temperature=0.3,
    output_audio_path='result_assistant_round_2.wav',
)
print(res)
```

Instruction-to-Speech

<!-- page 22 of 27 -->

**MiniCPM-o-2.6** can also do Instruction-to-Speech, aka **Voice Creation**. You can describe a voice in detail, and the model will generate a voice that matches the description. For more Instruction-to-Speech sample instructions, you can refer to [https://voxinstruct.github.io/VoxInstruct/](https://voxinstruct.github.io/VoxInstruct/).

```python
instruction = 'Speak like a male charming superstar,

msgs = [{'role': 'user', 'content': [instruction]}]

res = model.chat(
    msgs=news,
    tokenizer=tokenizer,
    sampling=True,
    max_new_tokens=128,
    use_tts_template=True,
    generate_audio=True,
    temperature=0.3,
    output_audio_path='result_voice_creation.wav',
)
```

## Voice Cloning

**MiniCPM-o-2.6** can also do zero-shot text-to-speech, aka **Voice Cloning**. With this mode, model will act like a TTS model.

```python
ref_audio, _ = librosa.load('./assets/input_examples/icl_20.wav', sr=16
sys_prompt = model.get_sys_prompt(ref_audio=ref_audio, mode='voice_clor
text_prompt = f"Please read the text below."
user_question = {'role': 'user', 'content': [text_prompt, "content that

msgs = [sys_prompt, user_question]
res = model.chat(
    msgs=news,
```

<!-- page 23 of 27 -->

```python
tokenizer=tokenizer,
sampling=True,
max_new_tokens=128,
use_tts_template=True,
generate_audio=True,
temperature=0.3,
output_audio_path='result_voice_cloning.wav',
```

## Addressing Various Audio Understanding Tasks

**MiniCPM-o-2.6** can also be used to address various audio understanding tasks, such as ASR, speaker analysis, general audio captioning, and sound scene tagging.

For audio-to-text tasks, you can use the following prompts:

ASR with ZH(same as AST en2zh): **请仔细听这段音频片段，并将其内容逐字记录。**

ASR with EN(same as AST zh2en): **Please listen to the audio snippet carefully and transcribe the content.**

Speaker Analysis: **Based on the speaker's content, speculate on their gender, condition, age range, and health status.**

General Audio Caption: **Summarize the main content of the audio.**

General Sound Scene Tagging: **Utilize one keyword to convey the audio's content or the associated scene.**

```python
task_prompt = "Please listen to the audio snippet carefully and transc:
audio_input, _ = librosa.load('./assets/input_examples/audio_understand

msgs = [{'role': 'user', 'content': [task_prompt, audio_input]}]

res = model.chat(
```

<!-- page 24 of 27 -->

```python
msgs=new,
    tokenizer=tokenizer,
    sampling=True,
    max_new_tokens=128,
    use_tts_template=True,
    generate_audio=True,
    temperature=0.3,
    output_audio_path='result_audio_understanding.wav',
)
print(res)
```

## Vision-Only mode

**MiniCPM-o-2\_6** has the same inference methods as **MiniCPM-V-2\_6**

## Chat with single image

```python
# test.py
image = Image.open('xx.jpg').convert('RGB')
question = 'What is in the image?' 
msgs = [{'role': 'user', 'content': [image, question]]}
res = model.chat(
    image=None,
    msgs=news,
    tokenizer=tokenizer
)
print(res)

## if you want to use streaming, please make sure sampling=True and st
## the model.chat will return a generator
res = model.chat(
    msgs=news,
    tokenizer=tokenizer,
    sampling=True,
    stream=True
)
generated_text = ""
```

<!-- page 25 of 27 -->

```python
for new_text in res:
    generated_text += new_text
    print(new_text, flush=True, end='')
```

**Chat with multiple images**

Click to show Python code running MiniCPM-o 2.6 with multiple images input.

**In-context few-shot learning**

Click to view Python code running MiniCPM-o 2.6 with few-shot input.

**Chat with video**

Click to view Python code running MiniCPM-o 2.6 with video input.

Please look at [GitHub](https://github.com/OpenBMB/MiniCPM-o) for more detail about usage.

## Inference with llama.cpp

MiniCPM-o 2.6 (vision-only mode) can run with llama.cpp. See our fork of [llama.cpp](https://github.com/OpenBMB/llama.cpp/tree/minicpm-omni) and [readme](https://github.com/OpenBMB/llama.cpp/blob/minicpm-omni/examples/llava/README-minicpmo2.6.md) for more detail.

## Int4 quantized version

Download the int4 quantized version for lower GPU memory (7GB) usage: [MiniCPM-o-2\_6-int4](https://huggingface.co/openbmb/MiniCPM-o-2_6-int4).

**License**

**Model License**

The MiniCPM-o/V model weights and code are open-sourced under the [Apache-2.0](https://github.com/OpenBMB/MiniCPM-V/blob/main/LICENSE) license.

<!-- page 26 of 27 -->

![Image block](images/p26-to-help-us-better-understand-and-support-our-users-we.png)

To help us better understand and support our users, we would deeply appreciate it if you could consider optionally filling out a brief registration ["questionnaire"](https://modelbest.feishu.cn/share/base/form/shrcnpV5ZT9EJ6xYjh3Kx0J6v8g).

## Statement

As an LMM, MiniCPM-o 2.6 generates contents by learning a large mount of multimodal corpora, but it cannot comprehend, express personal opinions or make value judgement. Anything generated by MiniCPM-o 2.6 does not represent the views and positions of the model developers

We will not be liable for any problems arising from the use of the MinCPM-V models, including but not limited to data security issues, risk of public opinion, or any risks and problems arising from the misdirection, misuse, dissemination or misuse of the model.

## Key Techniques and Other Multimodal Projects

👏 Welcome to explore key techniques of MiniCPM-o 2.6 and other multimodal projects of our team:

```txt
VisCPM | RLHF-V | LLaVA-UHD | RLAIF-V
```

## Citation

If you find our work helpful, please consider citing our papers 📝 and liking this project

```bib
@article{yao2024minicpm,
  title={MiniCPM-V: A GPT-4V Level MLLM on Your Phone},
  author={Yao, Yuan and Yu, Tianyu and Zhang, Ao and Wang, Chongyi and journal={arXiv preprint arXiv:2408.01800},
  year={2024}
}
```

<!-- page 27 of 27 -->

System theme

## Company

[TOS](https://huggingface.co/terms-of-service)

[Privacy](https://huggingface.co/privacy)

[About](https://huggingface.co/huggingface)

[Careers](https://apply.workable.com/huggingface/)

**Website**

[Models](https://huggingface.co/models)

[Datasets](https://huggingface.co/datasets)

[Spaces](https://huggingface.co/spaces)

[Pricing](https://huggingface.co/pricing)

[Docs](https://huggingface.co/docs)

![Image block](images/p27-image.png)