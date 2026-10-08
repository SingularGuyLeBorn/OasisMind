# d3LLM 多块推理配图来源

来源: https://arxiv.org/html/2601.07568v1/decoding.png , Figure 3 与 §3.2. 已实际查看原图, 原件保存为 `d3llm-source-figure3.png`, 正文副本为 images/fig-d3llm-multiblock-original-v1.png.

已核对原图四块:完成且已存KV;完成但稳定中未存KV;全激活;激活. 稳定块向之前的缓存回指刷新. 原图用于正文逐块解析, 不作为新生成图片或完整生命周期图验收结果.

中文生命周期展开已生成并在当前正文作为图3引用: `images/fig-d3llm-multiblock-kv-v4.png`. 提示词、历史候选与查看记录见 `d3llm-multiblock-kv-edits.md`. 图展开10%激活、95%保底、填满后1–2轮无缓存前向、历史刷新、当前块缓存写入及后续消费者. 原论文图作为图2保留, 与教学图承担不同作用. 原英文方框总览资产继续保留, 不批量删图. 本轮重新实际查看两张正文PNG, 配图保留判断不等于全文与站点最终验收.
