---
title: 切片 · Muse Spark 公开材料加深
date: 2026-08-30
published: false
status: running
---

# muse-spark-d2 · 监工点评

只准改：`content/llm-guide/14-主流开源模型全景解析与技术报告精读/14.3-LLaMA/05-Muse-Spark/` 已有 md + images，以及本 inbox。

禁止：mkdir `06-Muse-Spark-1.1` 这类平行 SKU；编造总参/MoE/MLA 表；改 14.3 首页、live、commit、Delete。

## 要写什么

现有 01 只读了 2026-05-26 安全报告，太薄。补读：

- Safety：https://ai.meta.com/static-resource/muse-spark-safety-and-preparedness-report （arXiv:2606.12429）
- 1.1 评测：https://research.meta.ai/static/muse-spark-1-1-evaluation-report
- 1.2 + Muse Code 博文：https://research.meta.ai/blog/introducing-muse-code-and-muse-spark-1-2
- 产品页：https://developer.meta.com/ai/models/muse-spark/
- 准备度框架：报告里链的 Meta Advanced AI Scaling Framework

必须：

1. 1.0 / 1.1 / 1.2 写在**同一夹**当代际，不要三个空文件夹。
2. 没有架构论文就明确写「公开材料没有层数/MoE 表」。1.2 博文里若出现 KDA/MLA kernel 实验，那是 **agent 评测任务**，不是「Muse 用了 KDA」。
3. 安全：缓解前 Chem/Bio 不能排除 high；发布阈值 moderate or lower。对照表只抄报告里点名的型号，不 mkdir。
4. 浅色图：准备度阶梯、1.1→1.2 编码/工具链（无假坐标）。LIGHT THEME ONLY 整段。
5. 成文。A 档。`as_of: 2026-08-30`。
