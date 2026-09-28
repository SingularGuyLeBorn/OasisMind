d WritingBench, we apply a presence penalty of 1.5 to encourage the generation of more diverse content. For Qwen3 models in the non-thinking mode, we configure the sampling hyperparameters with temperature = 0.7, top-p = 0.8, top-k = 20, and presence penalty = 1.5. For both the thinking and non-thinking modes, we set the max output length to 32,768 tokens, except AIME'24 and AIME'25 where we extend this length to 38,912 tokens to provide sufficient thinking space.

对于所有思考模式下的 Qwen3 模型，采样温度设为 0.6，top-p 为 0.95，top-k 为 20。此外，对于 Creative Writing v3 和 WritingBench，应用 presence penalty 为 1.5 以鼓励生成更多样化的内容。对于非思考模式下的 Qwen3 模型，采样超参数配置为 temperature = 0.7，top-p = 0.8，top-k = 20，presence penalty = 1.5。两种模式下最大输出长度均设为 32,768 token，AIME'24 和 AIME'25 除外，其长度扩展至 38,912 token 以提供充足的思考空间。

**Summary of Evaluation Results** From the evaluation results, we summarize several key conclusions of the finalized Qwen3 models as follows:

**评估结果总结** 从评估结果中，我们总结出最终 Qwen3 模型的几个关键结论：

(1) Our flagship model, Qwen3-235B-A22B, demonstrates the state-of-the-art overall performance among open-source models in both the thinking and non-thinking modes, surpassing strong baselines such as DeepSeek-R1 and DeepSeek-V3. Qwen3-235B-A22B is also highly competitive to closed-source leading models, such as OpenAI-o1, Gemini2.5-Pro, and GPT-4o, showcasing its profound reasoning capabilities and comprehensive general abilities.

(1) 我们的旗舰模型 Qwen3-235B-A22B 在思考模式和非思考模式下均展现出开源模型中最先进的整体性能，超越了 DeepSeek-R1 和 DeepSeek-V3 等强基线。Qwen3-235B-A22B 与 OpenAI-o1、Gemini2.5-Pro 和 GPT-4o 等闭源领先模型也极具竞争力，展现了其深厚的推理能力和全面的通用能力。

(2) Our flagship dense model, Qwen3-32B, outperforms our previous strongest reasoning model, QwQ-32B, in most of the benchmarks, and performs comparably to the closed-source OpenAI-o3-mini, indicating its compelling reasoning capabilities. Qwen3-32B is also remarkably performant in the non-thinking mode and surpasses our previous flagship non-reasoning dense model, Qwen2.5-72B-Instruct.

(2) 我们的旗舰 Dense 模型 Qwen3-32B 在大多数基准上超越了此前最强的推理模型 QwQ-32B，并与闭源的 OpenAI-o3-mini 表现相当，表明其强大的推理能力。Qwen3-32B 在非思考模式下也表现出色，超越了我们此前的旗舰非推理 Dense 模型 Qwen2.5-72B-Instruct。

(3) Our lightweight models, including Qwen3-30B-A3B, Qwen3-14B, and other smaller dense ones, possess consistently superior performance to the open-source models with a close or larger amount of parameters, proving the success of our Strong-to-Weak Distillation approach.

(3) 我们的轻量级模型，包括 Qwen3-30B-A3B、Qwen3-14B 和其他更小的 Dense 模型，性能持续优于参数量相近或更大的开源模型，证明了我们强到弱蒸馏方法的成功。

The detailed results are as follows.

详细结果如下。

**Qwen3-235B-A22B** For our flagship model Qwen3-235B-A22B, we compare it with the leading reasoning and non-reasoning models. For the thinking mode, we take OpenAI-o1 (OpenAI, 2024), DeepSeek-R1 (Guo et al., 2025), Grok-3-Beta (Think) (xAI, 2025), and Gemini2.5-Pro (DeepMind, 2025) as the reasoning baselines. For the non-thinking mode, we take GPT-4o-2024-11-20 (OpenAI, 2024), DeepSeek-V3 (Liu et al., 2024a), Qwen2.5-72B-Instruct (Yang et al., 2024b), and LLaMA-4-Maverick (Meta-AI, 2025) as the non-reasoning baselines. We present the evaluation results in Table 11 and 12.

**Qwen3-235B-A22B**：对于旗舰模型 Qwen3-235B-A22B，我们将其与领先的推理和非推理模型进行对比。思考模式的基线包括 OpenAI-o1、DeepSeek-R1、Grok-3-Beta (Think) 和 Gemini2.5-Pro; 非思考模式的基线包括 GPT-4o-2024-11-20、DeepSeek-V3、Qwen2.5-72B-Instruct 和 LLaMA-4-Maverick。评估结果见表 11 和表 12。

(1) From Table 11, with only 60% activated and 35% total parameters, Qwen3-235B-A22B (Thinking) outperforms DeepSeek-R1 on 17/23 the benchmarks, particularly on the reasoning-demanded tasks (e.g., mathematics, agent, and coding), demonstrating the state-of-the-art reasoning capabilities of Qwen3-235B-A22B among open-source models. Moreover, Qwen3-235B-A22B (Thinking) is also highly competitive to the closed-source OpenAI-o1, Grok-3-Beta (Think), and Gemini2.5-Pro, substantially narrowing the gap in the reasoning capabilities between open-source and close-source models.

(1) 从表 11 可见，Qwen3-235B-A22B(思考模式)仅以 60% 的激活参数和 35% 的总参数量，在 23 个基准中的 17 个上超越 DeepSeek-R1，尤其在需要推理的任务(如数学、Agent 和代码)上表现突出，展现了 Qwen3-235B-A22B 在开源模型中最先进的推理能力。此外，Qwen3-235B-A22B(思考模式)与闭源的 OpenAI-o1、Grok-3-Beta (Think) 和 Gemini2.5-Pro 也极具竞争力，大幅缩小了开源与闭源模型在推理能力上的差距。

(2) From Table 12, Qwen3-235B-A22B (Non-thinking) exceeds the other leading open-source models, including DeepSeek-V3, LLaMA-4-Maverick, and our previous flagship model Qwen2.5-72B-Instruct, and also surpasses the closed-source GPT-4o-2024-11-20 in 18/23 the benchmarks, indicating its inherent strong capabilities even when not enhanced with the deliberate thinking process.

(2) 从表 12 可见，Qwen3-235B-A22B(非思考模式)超越了其他领先开源模型(包括 DeepSeek-V3、LLaMA-4-Maverick 和此前的旗舰模型 Qwen2.5-72B-Instruct)，并在 23 个基准中的 18 个上超越闭源的 GPT-4o-2024-11-20，表明即使不借助刻意的思考过程，它也具备固有的强大能力。

**Qwen3-32B** For our flagship dense model, Qwen3-32B, we take DeepSeek-R1-Distill-Llama-70B, OpenAI-o3-mini (medium), and our previous strongest reasoning model, QwQ-32B (Qwen Team, 2025), as the baselines in the thinking mode. We also take GPT-4o-mini-2024-07-18, LLaMA-4-Scout, and our previous flagship model, Qwen2.5-72B-Instruct, as the baselines in the non-thinking mode. We present the evaluation results in Table 13 and 14.

**Qwen3-32B**：对于旗舰 Dense 模型 Qwen3-32B，思考模式的基线包括 DeepSeek-R1-Distill-Llama-70B、OpenAI-o3-mini (medium) 和此前最强的推理模型 QwQ-32B; 非思考模式的基线包括 GPT-4o-mini-2024-07-18、LLaMA-4-Scout 和此前的旗舰模型 Qwen2.5-72B-Instruct。评估结果见表 13 和表 14。

(1) From Table 13, Qwen3-32B (Thinking) outperforms QwQ-32B on 17/23 the benchmarks, making it the new state-of-the-art reasoning model at the sweet size of 32B. Moreover, Qwen3-32B (Thinking) also competes with the closed-source OpenAI-o3-mini (medium) with better alignment and multilingual performance.

(1) 从表 13 可见，Qwen3-32B(思考模式)在 23 个基准中的 17 个上超越 QwQ-32B，成为 32B 这一黄金尺寸上新的最先进推理模型。此外，Qwen3-32B(思考模式)在对齐和多语言性能更好的情况下与闭源的 OpenA