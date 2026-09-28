<!-- page 1 of 10 -->

2025-12-08 · Research

# GLM-4.6V: Open Source Multimodal Models with Native Tool Use

Z [Try it at Z.ai](https://z.ai/) [Call it at Z.ai](https://docs.z.ai/guides/llm/glm-4.6) [GitHub](https://github.com/zai-org/GLM-V) S [HuggingFace](https://huggingface.co/zai-org/GLM-4.6V) [📄 Tech Report](https://arxiv.org/abs/2507.01006)

Today, we officially introduce and open-source the GLM-4.6V series—our latest iteration in multimodal large language models. The release includes two versions: **GLM-4.6V (106B)**, a foundation model designed for cloud and high-performance cluster scenarios, and **GLM-4.6V-Flash (9B)**, a lightweight model optimized for local deployment and low-latency applications.

GLM-4.6V scales its context window to 128k tokens in training, and achieves SoTA performance in visual understanding and reasoning among models of similar parameter scales. Crucially, we integrate native **Function Calling** capabilities for the first time. This effectively bridges the gap between "visual perception" and "executable action," providing a unified technical foundation for multimodal agents in real-world business scenarios.

## Native Multimodal Tool Use

Traditional tool use in LLMs often relies on pure text, requiring multiple intermediate conversions when dealing with images, videos, or complex documents—a process that potentially leads to information loss and increases system complexity.

GLM-4.6V is equipped with native multimodal tool calling capability:

<!-- page 2 of 10 -->

**Multimodal Input:** Images, screenshots, and document pages can be passed directly as tool parameters without being converted to textual descriptions in advance, thus avoiding information loss and largely simplifying pipeline.

**Multimodal Output:** The model can visually comprehend results returned by tools—such as searching results, statistical charts, rendered web screenshots, or retrieved product images— and incorporate them into subsequent reasoning chain, as well as final output.

This native support allows GLM-4.6V to close the loop from perception to understanding to execution, enabling complex tasks, such as rich-text content creation and visual web search.

## Capabilities & Scenarios

## 1. Rich-Text Content Understanding and Creation

GLM-4.6V can accept multimodal inputs of various types—papers, reports, or slides—and automatically generate high-quality, structured image-text interleaved content, in an end-to-end way.

**Complex Document Understanding:** Accurately understands multimodal information from documents that contains text, charts, figures, tables, and formulas.

**Visual Tool Invoking:** During generation, the model can autonomously call tools to crop key visuals from the source multimodal context.

**Visual Audit & Composing:** The model performs "visual audit" on candidate images to assess relevance and quality, filetering out noises and composing all relevant textual and visual content elaborately to produce structured, image-text interleaved articles, which are ready for social medias or knowledge bases.

<!-- page 3 of 10 -->

![Image block](images/p03-2-visual-web-search.png)

## 2. Visual Web Search

GLM-4.6V delivers an end-to-end multimodal search-and-analysis workflow, enabling the model to move seamlessly from visual perception to online retrieval, to reasoning, and to final answer.

**Intent Recognition & Search Planning:** GLM-4.6V identifies the user’s search intent and determines what information is needed. It then autonomously triggers the appropriate search tools (e.g., text-to-image search, image-to-text search) to retrieve relevant information.

**Multimodal Comprehension & Alignment:** The model reviews the mixed visual and textual information returned by the search tools, identifies the parts most relevant to the query, and fuses them to support the subsequent reasoning process.

**Reasoning & Answering:** Leveraging relevant visual and textual cues retrieved from the search phase, the model performs necessary reasoning steps and gives the final answer, which is also a structured, visually-rich report.

<!-- page 4 of 10 -->

![Image block](images/p04-3-frontend-replication-visual-interaction.png)

## 3. Frontend Replication & Visual Interaction

We have optimized GLM-4.6V for frontend development, significantly shortening the "design to code" cycle.

**Pixel-Level Replication:** By uploading a screenshot or design file, the model identifies layouts, components, and color schemes and generates high-fidelity HTML/CSS/JS code.

**Interactive Editing:** Users can circle an area on a generated page screenshot and give natural language instructions (e.g., "Move this button left and make it dark blue"). The model automatically locates and modifies the corresponding code snippet.

<!-- page 5 of 10 -->

![Image block](images/p05-4-long-context-understanding.png)

## 4. Long-Context Understanding

GLM-4.6V aligns its visual encoder with a 128K context length, giving the model a massive memory capacity. In practice, this equates to processing \~150 pages of complex documents, 200 slide pages, or a one-hour-long video in a single inference pass.

**Financial Report Analysis:** In this case, GLM-4.6V successfully processed financial reports from four different public companies simultaneously, extracting core metrics across documents and synthesizing a comparative analysis table without losing key details.

<!-- page 6 of 10 -->

![Image block](images/p06-video-understanding-the-model-can-perform-global.png)

**Video Understanding:** The model can perform global summarization on long videos while retaining the ability to perform fine-grained reasoning on temporal clues, such as summarizing goal events and timestamps in a full football match.

![Image block](images/p06-overall-performance.png)

## Overall Performance

<!-- page 7 of 10 -->

We have evaluated GLM-4.6V on over 20 mainstream multimodal benchmarks, including **MMBench**, **MathVista**, and **OCRBench**. The model achieves SOTA performance among open-source models of comparable scale in key capabilities such as multimodal understanding, logical reasoning, and long-context understanding.

<table><tr><td></td><td>Open-source LLMs Benchmarks</td><td>GLM-4.6V</td><td>GLM-4.6V-Flash</td><td>GLM-4.5V</td><td>GLM-4.1V-9B-Thinking</td><td>Qwen3-VL-8B-Thinking</td><td>Qwen3-VL-235B-A22B-Thinking</td><td>Kimi-VL-A3B-Thinking-2506</td><td>Step3 321B</td></tr><tr><td></td><td></td><td>106B (A12B)</td><td>9B</td><td>106B (A12B)</td><td>9B</td><td>8B</td><td>235B (A22B)</td><td>16B (A3B)</td><td>321B (A38B)</td></tr><tr><td rowspan="5">General VQA</td><td>MMBench V1.1</td><td>88.8</td><td>86.9</td><td>88.2</td><td>85.8</td><td>84.3*</td><td>90.6</td><td>84.4</td><td>81.1*</td></tr><tr><td>MMBench V1.1 (CN)</td><td>88.2</td><td>85.9</td><td>88.3</td><td>84.7</td><td>83.3*</td><td>87.2*</td><td>80.7*</td><td>81.5*</td></tr><tr><td>MMStar</td><td>75.9</td><td>74.7</td><td>75.3</td><td>72.9</td><td>75.3</td><td>78.7</td><td>70.4</td><td>69.0*</td></tr><tr><td>BLINK (Val)</td><td>65.5</td><td>65.5</td><td>65.3</td><td>65.1</td><td>64.7</td><td>67.1</td><td>53.5*</td><td>62.7*</td></tr><tr><td>MUIRBENCH</td><td>77.1</td><td>75.7</td><td>75.3</td><td>74.7</td><td>76.8</td><td>80.1</td><td>63.8*</td><td>75.0*</td></tr><tr><td rowspan="8">Multimodal Reasoning</td><td>MMMU (Val)</td><td>76.0</td><td>71.1</td><td>75.4</td><td>68.0</td><td>74.1</td><td>80.6</td><td>64.0</td><td>74.2</td></tr><tr><td>MMMU_Pro</td><td>66.0</td><td>60.6</td><td>65.2</td><td>57.1</td><td>60.4</td><td>69.3</td><td>46.3</td><td>58.6</td></tr><tr><td>VideoMMMU</td><td>74.7</td><td>70.1</td><td>72.4</td><td>61.0</td><td>72.8</td><td>80.0</td><td>65.2</td><td>/</td></tr><tr><td>MathVista</td><td>85.2</td><td>82.7</td><td>84.6</td><td>80.7</td><td>81.4</td><td>85.8</td><td>80.1</td><td>79.2*</td></tr><tr><td>AI2D</td><td>88.8</td><td>89.2</td><td>88.1</td><td>87.9</td><td>84.9</td><td>89.2</td><td>81.9*</td><td>83.7*</td></tr><tr><td>DynaMath</td><td>54.5</td><td>43.7</td><td>53.9</td><td>42.5</td><td>41.1*</td><td>56.5*</td><td>28.1*</td><td>50.1</td></tr><tr><td>WeMath</td><td>69.8</td><td>60.0</td><td>68.8</td><td>63.8</td><td>66.5*</td><td>74.5*</td><td>42.0*</td><td>59.8</td></tr><tr><td>ZeroBench (sub)</td><td>25.8</td><td>22.5</td><td>23.4</td><td>19.2</td><td>-</td><td>27.7</td><td>16.2*</td><td>23.0</td></tr><tr><td rowspan="8">Multimodal Agentic</td><td>MMBrowseComp</td><td>7.6</td><td>7.1</td><td>/</td><td>/</td><td>6.9*</td><td>6.7*</td><td>/</td><td>/</td></tr><tr><td>Design2Code</td><td>88.6</td><td>69.8</td><td>82.2</td><td>64.7</td><td>56.6*</td><td>93.4</td><td>38.8*</td><td>34.1*</td></tr><tr><td>Flame-React-Eval</td><td>86.3</td><td>78.8</td><td>82.5</td><td>72.5</td><td>56.3*</td><td>73.8*</td><td>36.3*</td><td>63.8*</td></tr><tr><td>OSWorld</td><td>37.2</td><td>21.1</td><td>35.8</td><td>14.9</td><td>33.9</td><td>38.1</td><td>8.2</td><td>/</td></tr><tr><td>AndroidWorld</td><td>57.0</td><td>42.7</td><td>57.0</td><td>41.7</td><td>50.0</td><td>/</td><td>/</td><td>/</td></tr><tr><td>WebVoyager</td><td>81.0</td><td>71.8</td><td>84.4</td><td>69.0</td><td>47.7*</td><td>30.4*</td><td>/</td><td>/</td></tr><tr><td>Webquest-SingleQA</td><td>79.5</td><td>75.1</td><td>76.9</td><td>72.1</td><td>70.7*</td><td>76.4*</td><td>35.6*</td><td>58.7*</td></tr><tr><td>Webquest-MultiQA</td><td>59.0</td><td>53.4</td><td>60.6</td><td>54.7</td><td>60.3*</td><td>17.3*</td><td>11.1*</td><td>52.8*</td></tr><tr><td rowspan="3">Multimodal Long Context</td><td>MMLongBench-Doc</td><td>54.9</td><td>53.0</td><td>44.7</td><td>42.4</td><td>48.0</td><td>56.2</td><td>42.1</td><td>31.8*</td></tr><tr><td>MMLongBench-128K</td><td>64.1</td><td>63.4</td><td>/</td><td>/</td><td>49.5*</td><td>61.8*</td><td>/</td><td>/</td></tr><tr><td>LVBench</td><td>59.5</td><td>49.5</td><td>53.8</td><td>44.0</td><td>55.8</td><td>63.6</td><td>47.6*</td><td>/</td></tr><tr><td rowspan="6">OCR &amp; Chart</td><td>OCRBench</td><td>86.5</td><td>84.7</td><td>86.5</td><td>84.2</td><td>81.9</td><td>87.5</td><td>86.9</td><td>83.7*</td></tr><tr><td>OCR-Bench_v2 (EN)</td><td>65.1</td><td>63.5</td><td>60.8</td><td>57.4</td><td>63.9</td><td>66.8</td><td>/</td><td>/</td></tr><tr><td>OCR-Bench_v2 (CN)</td><td>59.6</td><td>59.5</td><td>59.0</td><td>54.6</td><td>59.2</td><td>63.5</td><td>/</td><td>/</td></tr><tr><td>ChartQAPro</td><td>65.5</td><td>62.6</td><td>64.0</td><td>59.5</td><td>58.4*</td><td>63.6*</td><td>23.7*</td><td>56.4*</td></tr><tr><td>ChartMuseum</td><td>58.4</td><td>49.8</td><td>55.3</td><td>48.8</td><td>46.7*</td><td>/</td><td>33.6*</td><td>40.0*</td></tr><tr><td>CharXiv_Val-Reasoning</td><td>63.2</td><td>59.6</td><td>58.4</td><td>55.0</td><td>53.0</td><td>66.1</td><td>39.6*</td><td>/</td></tr><tr><td rowspan="4">Spatial &amp; Grounding</td><td>OmniSpatial</td><td>52.0</td><td>50.6</td><td>51.0</td><td>47.7</td><td>51.3*</td><td>-</td><td>37.3*</td><td>47.0*</td></tr><tr><td>RefCOCO-avg (val)</td><td>88.6</td><td>85.6</td><td>91.3</td><td>85.3</td><td>89.3*</td><td>92.4</td><td>33.6*</td><td>20.2*</td></tr><tr><td>TreeBench</td><td>51.4</td><td>45.7</td><td>50.1</td><td>37.5</td><td>34.3*</td><td>50.9</td><td>41.5*</td><td>41.3*</td></tr><tr><td>Ref-L4-test</td><td>88.9</td><td>87.7</td><td>89.5</td><td>86.8</td><td>88.6*</td><td>90.4</td><td>51.3*</td><td>12.2*</td></tr></table>

## Techniques

## Model Architecture & Long Sequence Modeling

GLM-4.6V extends the training context window to 128K tokens, enabling effective cross-modal dependency modeling in high-information-density scenarios. To unlock this potential, we perform systematic Continual Pre-training on massive long-context image-text data. Drawing on the visuallanguage compression alignment ideas from Glyph, we further enhance the synergy between visual encoding and linguistic semantics using large-scale interleaved corpora.

## World Knowledge Enhancement

<!-- page 8 of 10 -->

We introduce a billion-scale multimodal perception and world knowledge dataset during pre-training. This covers a multi-layered conceptual system (encyclopedic knowledge), which not only improves basic visual perception but also significantly boosts accuracy and completeness in cross-modal QA tasks.

## Agentic Data Synthesis & MCP Extension

GLM-4.6V utilizes large-scale synthetic data for agentic training. To support complex multimodal scenarios, we extend the widely-used Model Context Protocol (MCP):

**URL-based Multimodal Handling:** We use URLs to identify multimodal content passed to and from tools, resolving limitations in file size and format. This allows precise manipulation of specific images in multi-image contexts.

**Interleaved Output:** We implemented an end-to-end mechanism for mixed text-image output. The model employs a "Draft → Image Selection → Final Polish" framework, autonomously calling image cropping or search tools to insert relevant visuals into the generated text, ensuring high relevance and readability.

## RL for Multimodal Agents

We incorporated tool invocation behaviors into the general Reinforcement Learning (RL) objective. This aligns the model's ability to plan tasks, follow instructions, and adhere to formats within complex tool chains. Furthermore, we explored a "Visual Feedback Loop" (inspired by our UI2Code^N work), where the model uses visual rendering results to self-correct and refine its code or actions, verifying the potential of self-improving multimodal agents.

## Chat with GLM-4.6V on Z.ai

Experience the model's multimodal understanding and tool usage capabilities directly on the [Z.ai](https://z.ai/) platform or via the Zhipu Qingyan App. GLM-4.6 is accessible through [Z.ai](https://z.ai/) by selecting the GLM-4.6 model option.

## Call GLM-4.6V API

Integrate GLM-4.6V into your applications using our OpenAI-compatible API.

## Serve Locally

<!-- page 9 of 10 -->

Model weights are available on [HuggingFace](https://huggingface.co/collections/zai-org/glm-46v) and [ModelScope](https://modelscope.cn/collections/GLM-46V-37fabc27818446). We support high-throughput inference frameworks including vLLM and SGLang.

If you find GLM-4.6V useful, please cite the following paper:

```txt
@misc{vteam2025glm45vglm41vthinkingversatilemultimodal,
```

```txt
title={GLM-4.5V and GLM-4.1V-Thinking: Towards Versatile Multimodal
```

```txt
Reasoning with Scalable Reinforcement Learning},
```

author={V Team and Wenyi Hong and Wenmeng Yu and Xiaotao Gu and Guo Wang and Guobing Gan and Haomiao Tang and Jiale Cheng and Ji Qi and Junhui Ji and Lihang Pan and Shuaiqi Duan and Weihan Wang and Yan Wang and Yean Cheng and Zehai He and Zhe Su and Zhen Yang and Ziyang Pan and Aohan Zeng and Baoxu Wang and Bin Chen and Boyan Shi and Changyu Pang and Chenhui Zhang and Da Yin and Fan Yang and Guoqing Chen and Jiazheng Xu and Jiale Zhu and Jiali Chen and Jing Chen and Jinhao Chen and Jinghao Lin and Jinjiang Wang and Junjie Chen and Leqi Lei and Letian Gong and Leyi Pan and Mingdao Liu and Mingde Xu and Mingzhi Zhang and Qinkai Zheng and Sheng Yang and Shi Zhong and Shiyu Huang and Shuyuan Zhao and Siyan Xue and Shangqin Tu and Shengbiao Meng and Tianshu Zhang and Tianwei Luo and Tianxiang Hao and Tianyu Tong and Wenkai Li and Wei Jia and Xiao Liu and Xiaohan Zhang and Xin Lyu and Xinyue Fan and Xuancheng Huang and Yanling Wang and Yadong Xue and Yanfeng Wang and Yanzi Wang and Yifan An and Yifan Du and Yiming Shi and Yiheng Huang and Yilin Niu and Yuan Wang and Yuanchang Yue and Yuchen Li and Yutao Zhang and Yuting Wang and Yu Wang and Yuxuan Zhang and Zhao Xue and Zhenyu Hou and Zhengxiao Du and Zihan Wang and Peng Zhang and Debing Liu and Bin Xu and Juanzi Li and Minlie Huang and Yuxiao Dong and Jie Tang},

```javascript
year={2025},
eprint={2507.01006},
archivePrefix={arXiv},
primaryClass={cs.CV},
url={https://arxiv.org/abs/2507.01006},
```

![Image block](images/p09-legal.png)

Legal

[Privacy Policy](https://chat.z.ai/legal-agreement/privacy-policy)

<!-- page 10 of 10 -->

[Terms of Service](https://chat.z.ai/legal-agreement/terms-of-service)

© 2026 [Z.ai](https://chat.z.ai/) Inc.