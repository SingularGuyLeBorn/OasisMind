# qwen4-pred 回传

租约：`content/llm-guide/14-主流开源模型全景解析与技术报告精读/14.2-Qwen/14-Qwen4-架构预测/` + 本文件。未改 `13-Qwen3.8-Flash-Next/`、`14.2-Qwen.md`、QSA/GR/Engram/2.4.8 正文、`GOAL.md`/`PLAN.md`/`PROCESS.md`、Skill、`apps/`。未 commit / push / `git add -A`。未 Delete。未 `move_agent_to_root`。未为 `qwen3.8-flash` mkdir。

## 改了哪些路径

- `content/llm-guide/14-主流开源模型全景解析与技术报告精读/14.2-Qwen/14-Qwen4-架构预测/14-Qwen4-架构预测.md`（新建）
- `.../14-Qwen4-架构预测/images/fig-qwen4-gdn-qsa-stack.png`（浅色，3:1 宏块）
- `.../14-Qwen4-架构预测/images/fig-qwen4-param-ledgers.png`（浅色，三本账）
- `.../14-Qwen4-架构预测/images/fig-qwen4-muon-adamw.png`（浅色，Muon vs AdamW）
- `content/llm-guide/notes/live/inbox/qwen4-pred.md`（本回传）

`ls 14.2-Qwen` 时 01–13 未动；新夹序号 14，与 13 并列。

## 读了哪些 URL

一手（数字只认这些）：

- https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf （raw 下载到 `%TEMP%\qwen38-flash-next\tech_report.pdf`，2 366 146 bytes，PyMuPDF 28 页；**PDF 未入库**）
- https://github.com/QwenLM/Qwen3.8-Flash-Next （README：https://raw.githubusercontent.com/QwenLM/Qwen3.8-Flash-Next/main/README.md）
- https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501
- https://qwen.ai/blog?id=qwen3.8-flash-next （WebFetch 空页；口径以阿里云镜像 + 官方知乎专栏核对）
- https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- https://huggingface.co/Qwen/Qwen3.8-Flash-Next/raw/main/config.json
- https://arxiv.org/abs/2601.07372 （Cheng et al. 2026；报告参考文献点名，PDF 无字符串 `Engram`）
- https://qwen.ai/blog?id=qwen3-next （角色类比，未当 Flash-Next 数字源）
- https://github.com/QwenLM/FlashQLA （报告点名的 GDN 训练核）

讲法（知乎 CLI，不当数字源）：

- search：`Qwen3.8-Flash-Next QSA Gated Residual`
- https://zhuanlan.zhihu.com/p/2076052218705461635 （千问大模型专栏，与博文同构）
- https://www.zhihu.com/question/2075957645354033219/answer/2076286824494928858 （刘聪NLP：512 块展开仍是 2048 token）

明确未当数字源：The Decoder / InferenceX / OrcaRouter / Local AI Zone 等二手。

## 质检员该看哪一段

1. **预测边界**：文首 + §1。没有 Qwen4 报告/权重；`qwen4_exp` 是检查点代码名；不编发布日。
2. **三本账**：§2 表 + 图 1。125B/6B、51B Host、HF 卡片 4B MTP 分列；51B 不进 6B；查表 Layer 2。
3. **512 块 ≠ 512 专家**：§4。$r=4,K=2048\Rightarrow K_B=512$ 是 indexer 块预算（报告 Implementation + HF Budget 行）。专家 $n=512$、$K=10$ routed + 1 shared 来自 **HF 卡片**（`config.json` 印证），**报告无公开整数**。写明是 Flash-Next 这一只，不是 Qwen4 旗舰一定 512。
4. **加速比**：§6。Fig. 6 kernel 7.6×/4.9× vs 博文 90% 前缀缓存 8.6×，两套分母。
5. **不重推**：§3/§5 链 QSA (12)–(20)、GR (29)–(34)、2.4.8 哈希；PDF 无 `Engram`、博文点名 DeepSeek Engram。
6. **图**：图 1/2/3 各有「图 N 解析」；浅色；无假坐标曲线。

失效表在 §8。

## 汉字计数

去掉 YAML 后 `[\u4e00-\u9fff]`：**4305**。禁止注水词未出现。

## 51B / 6B 是否分开

**分开。** 账 A 125B 总 / 6B 激活；账 B 51B 不进 6B、不进矩阵乘；账 C MTP 4B 仅 HF 卡片、不加进 6B。HF「180B params」只解释为 125+51+4 存盘，不当激活。

## $n$ / $K$ 来自哪份一手

| 符号 | 含义 | 一手 | 报告里有没有 |
|------|------|------|----------------|
| QSA $K=2048$，$r=4$，$K_B=512$ | indexer 块预算 | 报告 §2.1.2 Implementation；HF Budget 行；`indexer_budget` / `indexer_compress_ratio` | **有**（512 完整块） |
| MoE $n=512$ | 专家总数 | **HF 卡片**「Number of Experts: 512」+ `config.json` `num_experts: 512` | **无整数** |
| MoE 每 token $K=10$ routed + 1 shared | 激活专家 | **HF 卡片**「10 Routed + 1 Shared」+ `num_experts_per_tok: 10` | 仅「routed and shared experts」文字；博文「少量 routed + 一个共享专家」 |

13 文「报告未找到 $n$、$K$」仍然成立；本篇补的是卡片，不是二手媒体。
