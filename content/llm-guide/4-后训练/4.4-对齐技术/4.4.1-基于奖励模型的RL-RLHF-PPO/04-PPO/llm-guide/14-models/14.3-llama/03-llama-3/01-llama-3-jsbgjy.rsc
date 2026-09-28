ly lags behind a "spike" in gradient norm by a few training steps. Such spikes are usually caused by the embedding layer's abnormal gradients, as we observe that its gradient norm is often several magnitude larger that those of other layers in GLM-130B's early stage training. In addition, it tends to fluctuate dramatically in the early training.

**嵌入层梯度收缩(EGS)。** 我们的经验搜索发现梯度范数可以作为训练崩溃的信息性指标。具体而言,我们发现训练崩溃通常滞后于梯度范数的"尖峰"几个训练步骤。这种尖峰通常由嵌入层的异常梯度引起,因为我们观察到在 GLM-130B 早期训练阶段,其梯度范数通常比其他层大几个数量级。此外,它在早期训练中倾向于剧烈波动。

Finally, we find the gradient shrink on embedding layers could overcome loss spikes and thus stabilize GLM-130B's training. It is first used in the multi-modal transformer CogView (Ding et al., 2021). Let $\alpha$ be the shrinking factor, the strategy can be easily implemented via $\text{word\_embedding} = \text{word\_embedding} * \alpha + \text{word\_embedding.detach()} * (1 - \alpha)$. Figure 4 (b) suggests that empirically, setting $\alpha = 0.1$ wipes out most spikes we would have met, with negligible latency.

最终,我们发现嵌入层上的梯度收缩可以克服损失尖峰从而稳定 GLM-130B 的训练。它首次在多模态 Transformer CogView (Ding et al., 2021) 中使用。令 $\alpha$ 为收缩因子,该策略可以通过 $\text{word\_embedding} = \text{word\_embedding} * \alpha + \text{word\_embedding.detach()} * (1 - \alpha)$ 轻松实现。图 4(b) 表明,经验上设置 $\alpha = 0.1$ 可以消除我们遇到的大多数尖峰,且延迟可忽略不计。

In fact, the final GLM-130B training run only experiences three late-stage loss divergence cases, though it fails numerous times due to hardware failures. For the three unexpected spikes, it turns out further shrinking the embedding gradient can still help stabilize the GLM-130B training.

事实上,最终的 GLM-130B 训练运行仅经历了三次后期损失发散案例,尽管由于硬件故障失败了许多次。对于三次意外的尖峰,进一步缩小嵌入梯度仍然有助于稳定 GLM-130B 训练。

> 译者注(工程细节): EGS 是本文解决训练稳定性问题的核心技巧之一。1) 公式中的 `.detach()` 是关键: 它切断了梯度回传,使得嵌入层只接收缩小的梯度($\alpha = 0.1$ 意味着梯度缩小为原来的 10%),而其他层正常回传;2) 这一发现的经验基础是"嵌入层梯度范数比其他层大几个数量级" -- 这可能是因为嵌入层连接输入和模型主干,任何输入分布的异常都会首先在这里放大;3) 有趣的是,BLOOM-176B 选择了 BF16 来解决类似问题,而 GLM-130B 坚持使用 FP16 + EGS,原因是 BF16 不支持 V100 等平台且内存开销更大;4) 这一经验为后续模型提供了重要参考: 在 100B+ 模型训练中,嵌入层的梯度管理是稳定性的关键瓶颈之一。

## 4 GLM-130B INFERENCE ON RTX 2080 TI
### GLM-130B 在 RTX 2080 TI 上的推理

One of the major goals of GLM-130B is to lower the hardware requirements for accessing 100B-scale LLMs without efficiency and effectiveness disadvantages. As mentioned, the model size of 130B is determined for running the full GLM-130B model on a single A100 (40Gx8) server, rather than the high-end A100 (80Gx8) machine required by OPT-175B and BLOOM-176B. To accelerate GLM-130B inference, we also leverage FasterTransformer (Timonin et al., 2022) to implement GLM-130B in C++. Compared to the PyTorch implementation of BLOOM-176B in Huggingface, GLM-130B's decoding inference is 7-8.4x faster on the same single A100 server.

GLM-130B 的主要目标之一是降低访问 100B 规模 LLM 的硬件要求,同时不牺牲效率和效果。如前所述,130B 的模型大小是为了在单个 A100 (40Gx8) 服务器上运行完整的 GLM-130B 模型,而非 OPT-175B 和 BLOOM-176B 所需的高端 A100 (80Gx8) 机器。为加速 GLM-130B 推理,我们还利用 FasterTransformer (Timonin et al., 2022) 以 C++ 实现 GLM-130B。与 Huggingface 中 BLOOM-176B 的 PyTorch 实现相比,GLM-130B 的解码推理在相同的单台 A100 服务器上快 7-8.4 倍。

**INT4 Quantization for RTX 3090s/2080s.** To further support popularized GPUs, we attempt to compress GLM-130B as much as possible while maintaining performance superiority, particularly via quantization (Zafrir et al., 2019; Shen et al., 2020; Tao et al., 2022), which introduces little task-agnostic performance drops for generative language models.

**RTX 3090/2080 的 INT4 量化。** 为进一步支持普及型 GPU,我们尝试在保持性能优势的同时尽可能压缩 GLM-130B,特别是通过量化(Zafrir et al., 2019; Shen et al., 2020; Tao et al., 2022),这对生成式语言模型引入的与任务无关的性能下降很小。

Typically, the practice is to quantize both model weights and activations to INT8. However, our analysis suggests that LLMs' activations may contain extreme outliers. Concurrently, the emergent outliers in OPT-175B and BLOOM-176B are also discovered (Dettmers et al., 2022), which influence only about 0.1% feature dimensions and are thus solved by matrix multiplication decomposition for the outlying dimensions. Differently, there exist about 30% outliers in GLM-130B's activations, making the technique above far less efficient. Thus, we decide to focus on the quantization of model weights (i.e., mostly linear layers) while keeping the FP16 precision for activations.

通常的做法是将模型权重和激活都量化到 INT8。然而,我