错了，拒采样不知道。主设定 CRITIC 没有这层泄漏，ChatGPT 三集 F1 仍高于 Self-Consistency 和 ReAct 的多数格子，HotpotQA 上 ReAct 的 50.2 F1 和 CRITIC 的 52.9 贴得近。多跳题上，搜索工具帮得有限，不要用 AmbigNQ 的 +10.6 F1 外推到所有 QA。

毒性表上，GPT-2 的 Self-Correct 概率 0.026，ChatGPT+CRITIC 0.040。前者训了独立 corrector，后者冻着 $M$ 只问 API。两套都不是「模型学会了安全」。PPO 0.044 也用 Perspective 当奖励。读「不训练就打平监督 SoTA」时，先看尺子是不是同一 API，再看基座是 GPT-2 还是 ChatGPT。换模型、换审核器，0.040 作废。

**读**：Verify–Correct、$T$ 三类、QA 500 题、$n=3/4$、ChatGPT F1 +7.7 与数学 +7.0、毒性概率 0.192→0.040、w/o Tool 的 −0.03 / +2.33 / 毒性变差、SVAMP davinci −3.3、Table 5 AUROC、HotpotQA 幻觉 36%→7% 与 FN 49%、GSM8k 错题修对 32.2%、Table 10 Self-Refine 26