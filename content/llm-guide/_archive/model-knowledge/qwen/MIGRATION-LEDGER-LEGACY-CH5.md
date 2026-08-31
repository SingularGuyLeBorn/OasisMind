# Qwen 旧第 5 章迁移账本

> 本账本记录旧公共树 `5-主流模型全解/5.2-国内大模型/` 的逐文件去向。迁移只改变路径，不改正文与附件字节；普通公共正本统一回到 `05-模型家族与选型/5.3-模型家族/`。

## 汇总

- 原文件：6（Markdown 3，附件 3），总字节：922175。
- 去向：来源层 0，归档层 6。
- 完整性标识：Git LFS OID 3，raw SHA-256 3。
- 完整性规则：LFS 文件以对象 OID 和声明 size 为准，并已与迁移后工作树文件的 SHA-256/字节复核；raw 文件以工作树 SHA-256/字节复核。
- 本批不把任何旧稿继续公开，也不创建 `published: false` 兼容页。

## 逐文件映射

| 旧路径 | 新路径 | 动作 | 字节 | LFS OID / raw SHA-256 | 后续融合主题 |
|---|---|---|---:|---|---|
| `content/llm-guide/5-主流模型全解/5.2-国内大模型/阿里通义千问-Qwen/01-Qwen预训练与对齐技术详解.md` | `content/llm-guide/_archive/model-knowledge/qwen/legacy-ch5/01-Qwen预训练与对齐技术详解.md` | 移入归档层：二次解读、新闻或笔记 | 4170 | `raw:sha256:68849330d0e46662e2b8b50bbdde79a5b80bec64d34d03ccb941fb6e53e002ea` | Qwen 预训练/对齐官方证据边界与虚构超参数清理 |
| `content/llm-guide/5-主流模型全解/5.2-国内大模型/阿里通义千问-Qwen/02-Qwen3系列技术全解.md` | `content/llm-guide/_archive/model-knowledge/qwen/legacy-ch5/02-Qwen3系列技术全解.md` | 移入归档层：二次教程含未核实推演 | 88084 | `raw:sha256:906aed8c50068ed72d451a5f3ff9e33608b43c2ecf3671ef7778cdec9afbcf54` | Qwen3 与 Omni 身份拆分、thinking 边界、OPD 事实核验及预测型号清理 |
| `content/llm-guide/5-主流模型全解/5.2-国内大模型/阿里通义千问-Qwen/阿里通义千问-Qwen.md` | `content/llm-guide/_archive/model-knowledge/qwen/legacy-ch5/阿里通义千问-Qwen.md` | 移入归档层：重复家族首页 | 4715 | `raw:sha256:7693a73969fe7693720b812de531a30a768f95a0a0d4ec700f8c308b51a81439` | Qwen 家族时间线与新 05 身份索引 |
| `content/llm-guide/5-主流模型全解/5.2-国内大模型/阿里通义千问-Qwen/images/qwen_arch_compare.png` | `content/llm-guide/_archive/model-knowledge/qwen/legacy-ch5/images/qwen_arch_compare.png` | 随所属归档稿保全附件 | 311323 | `lfs:sha256:68919a80fbb3a712239fa0376b31fcfe866db88d486faee5ad8b80c117ddc599` | Qwen3 推演稿配图，随所属稿归档并保留来源链 |
| `content/llm-guide/5-主流模型全解/5.2-国内大模型/阿里通义千问-Qwen/images/qwen_arch_detailed.png` | `content/llm-guide/_archive/model-knowledge/qwen/legacy-ch5/images/qwen_arch_detailed.png` | 随所属归档稿保全附件 | 262246 | `lfs:sha256:c4f919a0ac5940771748090948e18274b33824821a0ef0f4d33a830592a5afe5` | Qwen3 推演稿配图，随所属稿归档并保留来源链 |
| `content/llm-guide/5-主流模型全解/5.2-国内大模型/阿里通义千问-Qwen/images/qwen_s_curve.png` | `content/llm-guide/_archive/model-knowledge/qwen/legacy-ch5/images/qwen_s_curve.png` | 随所属归档稿保全附件 | 251637 | `lfs:sha256:4ae86b6b45264c7d05b12890cff13cbeaaff0e622ae039bd6d401d705dc9ebe4` | Qwen3 推演稿配图，随所属稿归档并保留来源链 |
