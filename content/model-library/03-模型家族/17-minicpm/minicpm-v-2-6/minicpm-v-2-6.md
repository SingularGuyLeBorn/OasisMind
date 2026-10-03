---
title: "MiniCPM-V 2.6 · 源文"
category: "模型库"
tags: ["MiniCPM", "源文"]
published: true
excerpt: "MiniCPM-V 2.6 公开材料的 MinerU 抓取原文。"
---
<!-- page 1 of 14 -->

S

Search models, datasets, users...

## [openbmb](https://huggingface.co/openbmb)/[MiniCPM-V-2\_6](https://huggingface.co/openbmb/MiniCPM-V-2_6)

Like

1.06k

Follow <u>OpenBMB 5.36k</u>

[Image-Text-to-Text](https://huggingface.co/models?pipeline_tag=image-text-to-text)

![Image block](images/p01-transformers-https-huggingface-co-models-library.png)

[Transformers](https://huggingface.co/models?library=transformers)

[Safetensors](https://huggingface.co/models?library=safetensors)

openbmb/RLAIF-V-Dataset

[multilingual](https://huggingface.co/models?language=multilingual)

[minicpmv](https://huggingface.co/models?other=minicpmv)

[feature-extraction](https://huggingface.co/models?other=feature-extraction)

[minicpm-v](https://huggingface.co/models?other=minicpm-v)

[vision](https://huggingface.co/models?other=vision)

[multi-image](https://huggingface.co/models?other=multi-image)

[ocr](https://huggingface.co/models?other=ocr)

[video](https://huggingface.co/models?other=video)

[custom\_code](https://huggingface.co/models?other=custom_code)

[conversational](https://huggingface.co/models?other=conversational)

arxiv:2408.01800

Deploy

Copy to bucket **NEW**

Use this model

[**Model card**](https://huggingface.co/openbmb/MiniCPM-V-2_6)

[Files](https://huggingface.co/openbmb/MiniCPM-V-2_6/tree/main)

[**xet**](https://huggingface.co/openbmb/MiniCPM-V-2_6/tree/main)

![Image block](images/p01-community.png)

Community

![Image block](images/p01-downloads-last-month.png)

Downloads last month

**31,228**

![Image block](images/p01-safetensors.png)

## Safetensors

Model size

8B params

Tensor type

BF16

<u>Chat template</u>

<u>Files info</u>

## Inference Providers [NEW](https://huggingface.co/docs/inference-providers)

[Image-Text-to-Text](https://huggingface.co/tasks/image-text-to-text)

This model isn't deployed by any Inference Provider.

![Image block](images/p01-4-ask-for-provider-support.png)

4 Ask for provider support

## Model tree for openbmb/MiniCPM-V-2\_6

**Adapters** [24 models](https://huggingface.co/models?other=base_model:adapter:openbmb/MiniCPM-V-2_6)

**Finetunes** [14 models](https://huggingface.co/models?other=base_model:finetune:openbmb/MiniCPM-V-2_6)

**Quantizations** [14 models](https://huggingface.co/models?other=base_model:quantized:openbmb/MiniCPM-V-2_6)

## Dataset used to train openbmb/MiniCPM-V-2\_6

[**openbmb/RLAIF-V-Dataset**](https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset)

[Viewer • Updated Oct 14, 2025 • 83.1k • 1.87k • 219](https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset)

<!-- page 2 of 14 -->

```txt
MiniCPM-o & MiniCPM-V Collection
Multimodal models with leading perform... • 32 items • Updated 10 days ago • △ 86
```

```txt
MiniCPM-V: A GPT-4V Level MLLM on Your Phone
Paper • 2408.01800 • Published Aug 3, 2024 • △ 95
```

```txt
Paper for openbmb/MiniCPM-V-2_6
```

## Spaces using openbmb/MiniCPM-V-2\_6 45

```txt
KwabsHug/GameConfigIdea
```

```txt
build-small-hackathon/ai-video-generation
```

## 品 Collections including openbmb/MiniCPM-V-2\_6

```txt
MiniCPM Collection The MiniCPM family of LLMs and VLLMs. • 33 items • Updated 10 days ago • △ 78
```

## You need to agree to share your contact information to access this model

This repository is publicly accessible, but **you have to accept the conditions to access its files and content**.

[Log in](https://huggingface.co/login?next=/openbmb/MiniCPM-V-2_6)

to review the conditions and access this model content.

## A GPT-4V Level MLLM for Single Image, Multi Image and Video on Your Phone

[GitHub](https://github.com/OpenBMB/MiniCPM-V) | [Demo](http://120.92.209.146:8887/)

<!-- page 3 of 14 -->

## News

[2025.01.14] 🔥 We open source [**MiniCPM-o 2.6**](https://huggingface.co/openbmb/MiniCPM-o-2_6), with significant performance improvement over **MiniCPM-V 2.6**, and support real-time speech-to-speech conversation and multimodal live streaming. Try it now.

## MiniCPM-V 2.6

**MiniCPM-V 2.6** is the latest and most capable model in the MiniCPM-V series. The model is built on SigLip-400M and Qwen2-7B with a total of 8B parameters. It exhibits a significant performance improvement over MiniCPM-Llama3-V 2.5, and introduces new features for multi-image and video understanding. Notable features of MiniCPM-V 2.6 include:

🔥 **Leading Performance.** MiniCPM-V 2.6 achieves an average score of 65.2 on the latest version of OpenCompass, a comprehensive evaluation over 8 popular benchmarks. **With only 8B parameters, it surpasses widely used proprietary models like GPT-4o mini, GPT-4V, Gemini 1.5 Pro, and Claude 3.5 Sonnet** for single image understanding.

🖼 ️ **Multi Image Understanding and In-context Learning.** MiniCPM-V 2.6 can also perform **conversation and reasoning over multiple images**. It achieves **state-of-the-art performance** on popular multi-image benchmarks such as Mantis-Eval, BLINK, Mathverse mv and Sciverse mv, and also shows promising in-context learning capability.

🎬 **Video Understanding.** MiniCPM-V 2.6 can also **accept video inputs**, performing conversation and providing dense captions for spatial-temporal information. It outperforms **GPT-4V, Claude 3.5 Sonnet and LLaVA-NeXT-Video-34B** on Video-MME with/without subtitles.

💪 **Strong OCR Capability and Others.** MiniCPM-V 2.6 can process images with any aspect ratio and up to 1.8 million pixels (e.g., 1344x1344). It achieves **state-of-the-art performance on OCRBench, surpassing proprietary models such as GPT-4o, GPT-4V, and Gemini 1.5 Pro**. Based on the the latest [RLAIF-V](https://github.com/RLHF-V/RLAIF-V/) and [VisCPM](https://github.com/OpenBMB/VisCPM)

<!-- page 4 of 14 -->

techniques, it features **trustworthy behaviors**, with significantly lower hallucination rates than GPT-4o and GPT-4V on Object HalBench, and supports **multilingual capabilities** on English, Chinese, German, French, Italian, Korean, etc.

**Superior Efficiency.** In addition to its friendly size, MiniCPM-V 2.6 also shows **state-of-the-art token density** (i.e., number of pixels encoded into each visual token). **It produces only 640 tokens when processing a 1.8M pixel image, which is 75% fewer than most models**. This directly improves the inference speed, firsttoken latency, memory usage, and power consumption. As a result, MiniCPM-V 2.6 can efficiently support **real-time video understanding** on end-side devices such as iPad.

💫 **Easy Usage.** MiniCPM-V 2.6 can be easily used in various ways: (1) [llama.cpp](https://github.com/OpenBMB/llama.cpp/blob/minicpmv-main/examples/llava/README-minicpmv2.6.md) and [ollama](https://github.com/OpenBMB/ollama/tree/minicpm-v2.6) support for efficient CPU inference on local devices, (2) [int4](https://huggingface.co/openbmb/MiniCPM-V-2_6-int4) and [GGUF](https://huggingface.co/openbmb/MiniCPM-V-2_6-gguf) format quantized models in 16 sizes, (3) [vLLM](https://github.com/OpenBMB/MiniCPM-V/tree/main?tab=readme-ov-file#inference-with-vllm) support for high-throughput and memory-efficient inference, (4) fine-tuning on new domains and tasks, (5) quick local WebUI demo setup with [Gradio](https://github.com/OpenBMB/MiniCPM-V/tree/main?tab=readme-ov-file#chat-with-our-demo-on-gradio) and (6) online web [demo](http://120.92.209.146:8887/).

## Evaluation

![Image block](images/p04-single-image-results-on-opencompass-mme-mmvet-ocrbench.png)

Single image results on OpenCompass, MME, MMVet, OCRBench, MMMU, MathVista, MMB, AI2D, TextVQA, DocVQA, HallusionBench, Object HalBench:

<!-- page 5 of 14 -->

<table><tr><td>Model</td><td>Size</td><td>Token Density+</td><td>OpenCompass</td><td>MME</td><td>MMVet</td><td>OCRBench</td><td>MMMU val</td><td>MathVista mini</td><td>MMB1.1 test</td><td>AI2D</td><td>TextVQA val</td><td>DocVQA test</td><td>HallusionBench</td><td>Object HalBench</td></tr><tr><td colspan="15">Proprietary</td></tr><tr><td>GPT-4o</td><td>-</td><td>1088</td><td>69.9</td><td>2328.7</td><td>69.1</td><td>736</td><td>69.2</td><td>61.3</td><td>82.2</td><td>84.6</td><td>-</td><td>92.8</td><td>55.0</td><td>17.6</td></tr><tr><td>Claude 3.5 Sonnet</td><td>-</td><td>750</td><td>67.9</td><td>1920.0</td><td>66.0</td><td>788</td><td>65.9</td><td>61.6</td><td>78.5</td><td>80.2</td><td>-</td><td>95.2</td><td>49.9</td><td>13.8</td></tr><tr><td>Gemini 1.5 Pro</td><td>-</td><td>-</td><td>64.4</td><td>2110.6</td><td>64.0</td><td>754</td><td>60.6</td><td>57.7</td><td>73.9</td><td>79.1</td><td>73.5</td><td>86.5</td><td>45.6</td><td>-</td></tr><tr><td>GPT-4o mini</td><td>-</td><td>1088</td><td>64.1</td><td>2003.4</td><td>66.9</td><td>785</td><td>60.0</td><td>52.4</td><td>76.0</td><td>77.8</td><td>-</td><td>-</td><td>46.1</td><td>12.4</td></tr><tr><td>GPT-4V</td><td>-</td><td>1088</td><td>63.5</td><td>2070.2</td><td>67.5</td><td>656</td><td>61.7</td><td>54.7</td><td>79.8</td><td>78.6</td><td>78.0</td><td>87.2</td><td>43.9</td><td>14.2</td></tr><tr><td>Step-1V</td><td>-</td><td>-</td><td>59.5</td><td>2206.4</td><td>63.3</td><td>625</td><td>49.9</td><td>44.8</td><td>78.0</td><td>79.2</td><td>71.6</td><td>-</td><td>48.4</td><td>-</td></tr><tr><td>Qwen-VL-Max</td><td>-</td><td>784</td><td>58.3</td><td>2281.7</td><td>61.8</td><td>684</td><td>52.0</td><td>43.4</td><td>74.6</td><td>75.7</td><td>79.5</td><td>93.1</td><td>41.2</td><td>13.4</td></tr><tr><td colspan="15">Open-source</td></tr><tr><td>LLaVA-NeXT-Yi-34B</td><td>34B</td><td>157</td><td>55.0</td><td>2006.5</td><td>50.7</td><td>574</td><td>48.8</td><td>40.4</td><td>77.8</td><td>78.9</td><td>69.3</td><td>-</td><td>34.8</td><td>12.6</td></tr><tr><td>Mini-Gemini-HD-34B</td><td>34B</td><td>157</td><td>-</td><td>2141</td><td>59.3</td><td>518</td><td>48.0</td><td>43.3</td><td>-</td><td>80.5</td><td>74.1</td><td>78.9</td><td>-</td><td>-</td></tr><tr><td>Cambrian-34B</td><td>34B</td><td>1820</td><td>58.3</td><td>2049.9</td><td>53.2</td><td>591</td><td>50.4</td><td>50.3</td><td>77.8</td><td>79.5</td><td>76.7</td><td>75.5</td><td>41.6</td><td>14.7</td></tr><tr><td>GLM-4V-9B</td><td>13B</td><td>784</td><td>59.1</td><td>2018.8</td><td>58.0</td><td>776</td><td>46.9</td><td>51.1</td><td>67.9</td><td>71.2</td><td>-</td><td>-</td><td>45.0</td><td>-</td></tr><tr><td>InternVL2-8B</td><td>8B</td><td>706</td><td>64.1</td><td>2215.1</td><td>54.3</td><td>794</td><td>51.2</td><td>58.3</td><td>79.4</td><td>83.6</td><td>77.4</td><td>91.6</td><td>45.0</td><td>21.3</td></tr><tr><td>MiniCPM-Llama-V 2.5</td><td>8B</td><td>1882</td><td>58.8</td><td>2024.6</td><td>52.8</td><td>725</td><td>45.8</td><td>54.3</td><td>72.0</td><td>78.4</td><td>76.6</td><td>84.8</td><td>42.4</td><td>10.3</td></tr><tr><td>MiniCPM-V 2.6</td><td>8B</td><td>2822</td><td>65.2</td><td>2348.4*</td><td>60.0</td><td>852*</td><td>49.8*</td><td>60.6</td><td>78.0</td><td>82.1</td><td>80.1</td><td>90.8</td><td>48.1*</td><td>8.2</td></tr></table>

We evaluate this benchmark using chain-of-thought prompting.

\+ Token Density: number of pixels encoded into each visual token at maximum resolution, i.e., # pixels at maximum resolution / # visual tokens.

Note: For proprietary models, we calculate token density based on the image encoding charging strategy defined in the official API documentation, which provides an upperbound estimation.

Multi-image results on Mantis Eval, BLINK Val, Mathverse mv, Sciverse mv, MIRB:

<table><tr><td>Model</td><td>Size</td><td>Mantis Eval</td><td>BLINK val</td><td>Mathverse mv</td><td>Sciverse mv</td><td>MIRB</td></tr><tr><td colspan="6">Proprietary</td><td></td></tr><tr><td>GPT-4V</td><td>-</td><td>62.7</td><td>54.6</td><td>63.0</td><td>66.9</td><td>53.1</td></tr><tr><td>LLaVA-NeXT-Interleave-14B</td><td>14B</td><td>66.4</td><td>54.4</td><td>32.7</td><td>30.2</td><td>-</td></tr><tr><td colspan="6">Open-source</td><td></td></tr><tr><td>Emu2-Chat</td><td>37B</td><td>37.8</td><td>36.2</td><td>-</td><td>27.2</td><td>-</td></tr><tr><td>CogVLM</td><td>17B</td><td>45.2</td><td>41.1</td><td>-</td><td>-</td><td>-</td></tr><tr><td>VPG-C</td><td>7B</td><td>52.4</td><td>43.1</td><td>24.3</td><td>23.1</td><td>-</td></tr><tr><td>VILA 8B</td><td>8B</td><td>51.2</td><td>39.3</td><td>-</td><td>36.5</td><td>-</td></tr><tr><td>InternLM-XComposer-2.5</td><td>8B</td><td>53.1</td><td>48.9</td><td>32.1*</td><td>-</td><td>42.5</td></tr><tr><td>InternVL2-8B</td><td>8B</td><td>59.0*</td><td>50.9</td><td>30.5*</td><td>34.4*</td><td>56.9*</td></tr><tr><td>MiniCPM-V 2.6</td><td>8B</td><td>69.1</td><td>54.1</td><td>84.9</td><td>74.9</td><td>53.8</td></tr></table>

<!-- page 6 of 14 -->

We evaluate the officially released checkpoint by ourselves.

**Video results on Video-MME and Video-ChatGPT:**

<table><tr><td>Model</td><td>Size</td><td colspan="2">Video-MME</td><td colspan="5">Video-ChatGPT</td></tr><tr><td></td><td></td><td>w/o subs</td><td>w subs</td><td>Correctness</td><td>Detail</td><td>Context</td><td>Temporal</td><td>Consistency</td></tr><tr><td colspan="9">Proprietary</td></tr><tr><td>Claude 3.5 Sonnet</td><td>-</td><td>60.0</td><td>62.9</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>GPT-4V</td><td>-</td><td>59.9</td><td>63.3</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td colspan="9">Open-source</td></tr><tr><td>LLaVA-NeXT-7B</td><td>7B</td><td>-</td><td>-</td><td>3.39</td><td>3.29</td><td>3.92</td><td>2.60</td><td>3.12</td></tr><tr><td>LLaVA-NeXT-34B</td><td>34B</td><td>-</td><td>-</td><td>3.29</td><td>3.23</td><td>3.83</td><td>2.51</td><td>3.47</td></tr><tr><td>CogVLM2-Video</td><td>12B</td><td>-</td><td>-</td><td>3.49</td><td>3.46</td><td>3.23</td><td>2.98</td><td>3.64</td></tr><tr><td>LongVA</td><td>7B</td><td>52.4</td><td>54.3</td><td>3.05</td><td>3.09</td><td>3.77</td><td>2.44</td><td>3.64</td></tr><tr><td>InternVL2-8B</td><td>8B</td><td>54.0</td><td>56.9</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>InternLM-XComposer-2.5</td><td>8B</td><td>55.8</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>LLaVA-NeXT-Video</td><td>32B</td><td>60.2</td><td>63.0</td><td>3.48</td><td>3.37</td><td>3.95</td><td>2.64</td><td>3.28</td></tr><tr><td>MiniCPM-V 2.6</td><td>8B</td><td>60.9</td><td>63.6</td><td>3.59</td><td>3.28</td><td>3.93</td><td>2.73</td><td>3.62</td></tr></table>

Click to view few-shot results on TextVQA, VizWiz, VQAv2, OK-VQA.

**Examples**

<!-- page 7 of 14 -->

Oo

![Image block](images/p07-round-1.png)

Round 1

Help me lower my bike seat

![Image block](images/p07-minicpm-v-2-6.png)

## MiniCPM-V 2.6

To lower your bike seat, follow these steps: 1. Locate the seat post clamp: On the underside of the seat, you should see a clamp that holds the seat post in place.

2. Release the clamp: There is usually a quickrelease lever or a bolt that you can use to release the clamp. If it's a lever, pull it to unlock the seat post. If it's a bolt, loosen it slightly.

3. Lower the seat: Gently lower the seat until it reaches the desired height. Be careful not to lower it too far, as this could affect your riding position and comfort.

4. Secure the seat: Once you've reached the desired height, reattach the clamp. If it's a lever, push it back to lock the seat in place. If it's a bolt, tighten it until it's secure.

5. Test the seat: Give the seat a gentle push to ensure it's securely in place and doesn't wobble. Remember to adjust the seat height based on your comfort and the type of riding you'll be doing.

![Image block](images/p07-do.png)

Do

Do

![Image block](images/p07-round-2.png)

Round 2

Is this the lever or bolt?

![Image block](images/p07-minicpm-v-2-6-2.png)

## MiniCPM-V 2.6

The image shows a bolt, not a lever. This type of clamp is typically used to secure the seat post in place on a bicycle. To lower your bike seat using this mechanism, you would loosen or remove the bolt, adjust the seat height as needed, and then reattach or tighten the bolt to secure the seat.

![Image block](images/p07-image.png)

![Image block](images/p07-image-2.png)

![Image block](images/p07-how-much-should-i-pay-for-all-of-the-beer-on-the-table.png)

How much should I pay for all of the beer on the table according to the price on the menu?

![Image block](images/p07-round-3.png)

Round 3

Here is my manual and tool box, do I have the right tool?

![Image block](images/p07-minicpm-v-2-6-3.png)

## MiniCPM-V 2.6

To determine if you have the right tool for adjusting your bike seat, we need to identify the specific tools required based on the manual provided in the first image.

1. Identify the Tool Required:

\- According to the manual (the first image), to adjust the seat post clamp (item labeled 'J' which is the SEAT COLLAR), you would typically use a 4mm Allen key or hex wrench.

2. Check Your Tool Box:

\- In the second image, you have a comprehensive tool box with various sizes of Allen keys and hex wrenches.

3. Determine Availability:

\- Look through the set in the tool box to find a 4mm Allen key or hex wrench. The exact size may not be explicitly marked, but you should be able to identify it by its shape and size relative to other tools.

Conclusion:

Based on the information from the manual and the tool box, you should have the appropriate tool to lower your bike seat. Ensure that you select a 4mm Allen key or hex wrench from your tool box to proceed with the adjustment safely and effectively.

![Image block](images/p07-minicpm-v-2-6-4.png)

## MiniCPM-V 2.6

To calculate the total cost of the beer on the table according to the price on the menu, follow these steps: 1. Identify the beers on the table:

\- There are two bottles of Magna beer on the table.

2. Find the price of Magna beer on the menu:

\- According to the menu, Magna beer is priced at 6 units of currency.

3. Calculate the total cost:

\- Since there are two bottles of Magna beer, multiply the price per bottle by the number of bottles:

6 units/can × 2 cans = 12 units

Therefore, you should pay 12 units of currency for all of the beer on the table according to the price on the menu.

<!-- page 8 of 14 -->

![Image block](images/p08-d.png)

D

![Image block](images/p08-case-debug.png)

## CASE-DEBUG

main.py

user.py

```python
class User:
    def __init__(self, first_name, last_name, address, telephone):
        self._first_name = first_name
        self_lat_name = last_name
        self._address = address
        self_telephone = telephone

    def describe_user(self):
        print["("self_lat_name|self._first_name) lives in (self_address), telephone number: (self.telephone)")"]
    def greet_user(self):
        print["("Hello, (self_lat_name)|self._first_name)")"]
```

def \_\_init\_\_(self, privileges=['Add post', 'Delete post', 'Add user']): self.privileges = privileges

## main.py > ...

admins = Admin('Lili', 'Wang', 'China', '12345678')

admins.privileges.show\_privileges()

## TERMINAL

```python
( base ) → case-debug python main.py
Traceback (most recent call last):
  File "/Users">case-debug/main.py", line 2, in <module>
  from privilege import Privileges, Admin
  File "/Users">case-debug/privilege.py", line 8, in <module>
  class Admin(User):
  NameError: name 'User' is not defined
( base ) → case-debug
```

![Image block](images/p08-minicpm-v-2-6.png)

## MiniCPM-V 2.6

## The cause of the bug is that the User class is not defined in the

privilege.pymodule.When you importPrivilegesfrom privilege.py\`inmain.py, it expects the\`Userclass to be defined, but it is not.

To fix this bug, you need to define the User class in theprivilege. py module. Here is the corrected code for privilege. py\`:

## class User:

def describe\_user(self): print(f"{self.last\_name}{self.first\_name} lives in {self. address}, telephone number: {self.telephone}")

12class Privileges:

## 18 class Admin(User):

## In this corrected version, the Userclass is defined within the

privilege.pymodule. Now, when you import Privilegesfrom privilege.py inmain.py\`, the Userclass is available, and the show\_privileges()method can be called without raising a NameError.

## What is the cause of the bug? How to fix it?

![Image block](images/p08-shot-1.png)

## # Shot 1:

![Image block](images/p08-while-cooking.png)

while cooking.

But, he also wears gloves when accepting cash.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">\* The code blocks in the model's response have been rendered for ease of reading.</span></small>

![Image block](images/p08-shot-2.png)

## # Shot 2:

Yes, this is a reusable eco-friendly water bottle.

But, he buys bottled water and pours it inside.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">o o</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">鸟MiniCPM-V 2.6</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">Yes, he has a digital wallet with various cryptocurrencies. But the store only accepts cash.</span></small>

![Image block](images/p08-2008-2017-8-24-4.png)

## 由于存在闭幕后奖牌被取消的情况，下面的2008年北京奥运会奖牌榜实为截至2017年8月24日的奖牌榜。以下根据题标列举数目：[4]

奖牌榜

| 名次 | 国家/地区 | 金牌 | 领牌 | 铜牌 | 奖牌总数 |
| --- | --- | --- | --- | --- | --- |
| 1 | 中国（CHN） | 48 | 22 | 30 | 100 |
| 2 | 美国（USA） | 36 | 39 | 37 | 112 |
| 3 | 俄罗斯（RUS） | 24 | 13 | 23 | 60 |
| 4 | 英国（GBR） | 19 | 13 | 19 | 51 |
| 5 | 德国（GER） | 16 | 11 | 14 | 41 |
| 6 | 澳大利亚（AUS） | 14 | 15 | 17 | 46 |
| 7 | 韩国（KOR） | 13 | 11 | 8 | 32 |
| 8 | 日本（JPN） | 9 | 8 | 8 | 25 |
| 9 | 意大利（ITA） | 8 | 9 | 10 | 27 |
| 10 | 法国（FRA） | 7 | 16 | 20 | 43 |
| 11 | 荷兰（NED） | 7 | 5 | 4 | 16 |
| 12 | 乌克兰（UKR） | 7 | 4 | 11 | 22 |
| 13 | 肯尼亚（KEN） | 6 | 4 | 6 | 16 |
| 14 | 西班牙（ESP） | 5 | 11 | 3 | 19 |
| 15 | 牙买加（JAM） | 5 | 4 | 2 | 11 |

## 2008年奥运会获得金牌数最多的3个国家一共获得了多少枚金牌？请逐步分析

(English Translation)

How many gold medals did the top three countries with the most gold medals at the 2008 Olympics win in total? Please analyze step by step.

## Click to view more cases.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">MiniCPM-V 2.6</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">根据图像中的奖牌榜信息，2008年奥运会获得金牌数最多的3个国家分别是：</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">1。中国（CHN）：48枚金牌</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">2。美国(USA）：36枚金牌</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">3。俄罗斯（RUS）：24枚金牌</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">要计算这3个国家一共获得了多少枚金牌，我们需要将它们的金牌数相加：</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">48（中国）+ 36（美国）+ 24（俄罗斯）= 108</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">因此，2008年奥运会获得金牌数最多的3个国家一共获得了108枚金牌。</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">(English Translation) According to the medal table information in the image, the top three countries with the most gold medals at the 2008 Olympics are:</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">China (CHN): 48 gold medals</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">United States (USA): 36 gold medals</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">Russia (RUS): 24 gold medals</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">To calculate the total number of gold medals won by these three countries, we need to add their gold medal counts:</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">48 (China) + 36 (USA) + 24 (Russia) = 108</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">Therefore, the top three countries with the most gold medals at the 2008 Olympics won a total of 108 gold medals.</span></small>

<!-- page 9 of 14 -->

We deploy MiniCPM-V 2.6 on end devices. The demo video is the raw screen recording on a iPad Pro without edition.

![Image block](images/p09-image.png)

<!-- page 10 of 14 -->

![Image block](images/p10-image.png)

![Image block](images/p10-demo.png)

**Demo**

Click here to try the Demo of [MiniCPM-V 2.6](http://120.92.209.146:8887/).

**Usage**

Inference using Huggingface transformers on NVIDIA GPUs. Requirements tested on python 3.10:

```txt
Pillow==10.1.0
torch==2.1.2
torchvision==0.16.2
transformers==4.40.0
sentencepiece==0.1.99
decord

# test.py
import torch
```

<!-- page 11 of 14 -->

```python
from PIL import Image
from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained('openbmb/MiniCPM-V-2_6', trust_remote)
    attn_implementation='sdpa', torch_dtype=torch.bfloat16) # sdpa or i
model = model.eval().cuda()
tokenizer = AutoTokenizer.from_pretrained('openbmb/MiniCPM-V-2_6', trus

image = Image.open('xx.jpg').convert('RGB')
question = 'What is in the image?' 
msgs = [{'role': 'user', 'content': [image, question]]}

res = model.chat(
    image=None,
    msgs=news,
    tokenizer=newizer
)
print(res)

## if you want to use streaming, please make sure sampling=True and st
## the model.chat will return a generator
res = model.chat(
    image=None,
    msgs=news,
    tokenizer=newizer,
    sampling=True,
    stream=True
)

generated_text = ""
for new_text in res:
    generated_text += new_text
    print(new_text, flush=True, end='')
```

**Chat with multiple images**

Click to show Python code running MiniCPM-V 2.6 with multiple images input.

<!-- page 12 of 14 -->

## In-context few-shot learning

Click to view Python code running MiniCPM-V 2.6 with few-shot input.

## Chat with video

Click to view Python code running MiniCPM-V 2.6 with video input.

Please look at [GitHub](https://github.com/OpenBMB/MiniCPM-V) for more detail about usage.

## Inference with llama.cpp

MiniCPM-V 2.6 can run with llama.cpp. See our fork of [llama.cpp](https://github.com/OpenBMB/llama.cpp/tree/minicpm-v2.5/examples/minicpmv) for more detail.

## Int4 quantized version

Download the int4 quantized version for lower GPU memory (7GB) usage: [MiniCPM-V-2\_6-int4](https://huggingface.co/openbmb/MiniCPM-V-2_6-int4).

**License**

## Model License

The code in this repo is released under the [Apache-2.0](https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE) License.

The usage of MiniCPM-V series model weights must strictly follow [MiniCPM Model License.md](https://github.com/OpenBMB/MiniCPM/blob/main/MiniCPM%20Model%20License.md).

The models and weights of MiniCPM are completely free for academic research. After filling out a ["questionnaire"](https://modelbest.feishu.cn/share/base/form/shrcnpV5ZT9EJ6xYjh3Kx0J6v8g) for registration, MiniCPM-V 2.6 weights are also available for free commercial use.

## Statement

As an LMM, MiniCPM-V 2.6 generates contents by learning a large mount of multimodal corpora, but it cannot comprehend, express personal opinions or

<!-- page 13 of 14 -->

make value judgement. Anything generated by MiniCPM-V 2.6 does not represent the views and positions of the model developers

We will not be liable for any problems arising from the use of the MinCPM-V models, including but not limited to data security issues, risk of public opinion, or any risks and problems arising from the misdirection, misuse, dissemination or misuse of the model.

## Key Techniques and Other Multimodal Projects

👏 Welcome to explore key techniques of MiniCPM-V 2.6 and other multimodal projects of our team:

```txt
VisCPM | RLHF-V | LLaVA-UHD | RLAIF-V
```

## Citation

If you find our work helpful, please consider citing our papers 📝 and liking this project ❤️

```bib
@article{yao2024minicpm,
  title={MiniCPM-V: A GPT-4V Level MLLM on Your Phone},
  author={Yao, Yuan and Yu, Tianyu and Zhang, Ao and Wang, Chongyi and journal={arXiv preprint arXiv:2408.01800},
  year={2024}
}
```

## Company

<!-- page 14 of 14 -->

## Website

![Image block](images/p14-image.png)