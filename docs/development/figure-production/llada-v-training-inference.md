# LLaDA-V 训练与生成机制图

## 正式第三版

第二版修正未计损失位置参与求和、条件落在标题与状态、提交选择旁支等问题, 但遗漏推理视觉条件连线. 第三版局部补线后实际查看通过, 正式图为 `content/DiffusionLanguageModels/3-模型谱系/images/fig-llada-v-training-v3.png`. 图中 v、p 分别表示投影视觉特征与文本提示;四位置、两次前向与置信度数字为教学例子. 损失是单次单轮样本的掩码位置加权和,不是对原论文多轮式 (1) 的逐字复刻. 图面与图注同步,旧图保留但文章采用新版.

### 第二版提示词

```text
Edit scientific diagram, preserve style and examples. Fix exactly these scientific connections. Top SigLIP2 must be regular rectangle. Delete image-to-clean-condition bypass line; delete clean-condition arrows into training/inference PANEL HEADINGS entirely. Keep top vision pathway and condition text as standalone summary. Each panel's repeated v,p inputs provide real model connections.
TRAINING: connect the entire noisy strip M B M D to model, not only masks. Keep v,p into model. Delete the downward grey arrows from '不计算损失 B可见' and '不计算损失 D可见' to loss sum. Only CE1 and CE3 feed sum. Define 't: 回答 token 的掩码概率; M: 掩码'. Add small target label on CE1 '目标 A' and CE3 '目标 C', no teacher-forcing target shortcut into model.
INFERENCE: delete v,p arrow into M M M M strip. Route v,p merged condition line directly into FIRST predictor right edge. Route same line separately into SECOND predictor right edge. Mask strip still independently flows into first predictor. Restructure candidates->selection->next state as single connected path: candidate strip A(.9),B(.4),C(.8),D(.3) -> rectangle '保留高置信; 低置信候选回到 M' -> next state A M C M. DELETE any candidate->next-state shortcut bypassing selection. Then next state->same predictor->rectangle '再次预测与选择'->final A B C D. This additional selection box is essential, no direct raw predictor to final committed state. Keep note candidates remasking not withdrawing old commits. Keep example confidence explicitly teaching numbers. No extra lines, no arrows into panel frames, no bilingual labels. Ensure good whitespace and clear arrows.
```

### 第三版提示词

```text
Minimal precise scientific edit. In RIGHT inference panel, visual features v (four blue rectangles) have no outgoing line. Add ONE teal line from bottom center of those visual rectangles, route right through blank space ABOVE the M M M M input strip, and join the existing teal text-prompt p vertical condition line on the right. Existing condition line then feeds BOTH predictors. Do not connect v to M strip. Change NO OTHER text, line, box, colors or formula. Both v and p must be visibly connected into same condition bus. Keep line away from labels.
```


## 来源与实际阅读

已下载 [v1 PDF](https://arxiv.org/pdf/2505.16933v1),用 PyMuPDF 只读渲染第 4 页并实际查看 Figure 2、图注与 §3.1–3.2. 原页保存为 `llada-v-source-page4.png`. 参考图实际传入内置生图接口,模型版本不可确认.

## 候选复核

`llada-v-candidate-v1.png` 已实际查看,暂不进入正文. 尚需修复:原图像意外直接进入条件支线;条件箭头落在面板标题和掩码状态,应进入预测器;未计损失的可见位置仍连到损失求和;选择提交框成为没有输出的旁支;四位置单轮例子的 t 未定义;SigLIP 模块无必要扭曲. 下一版改正上述连接,保留 masked-only 监督和候选重掩的区别.

## 提示词

```text
Scientific educational Chinese technical diagram, white background, navy text, teal clean conditions, amber masked positions, 1536x1024 landscape. Reference image is original LLaDA-V Figure 2 page; preserve science but draw only diffusion training and inference, expand vision pipeline. No source text, Figure numbers, cartoons or bilingual translations.
Top shared condition chain "图像" -> "SigLIP 2" -> "两层 MLP" -> "视觉特征 v"; alongside "文本提示 p". Label "干净条件: 不做回答掩码". These conditions feed BOTH training and inference models through clear branching arrows.
Left large training panel "训练: 只掩回答". Original four-answer tokens A B C D -> rectangle "按 t 随机掩码" -> corrupted strip M B M D -> "LLaDA 双向预测器" receiving v,p -> predicted four distributions aligned with response positions. Loss select ONLY position1 target A and position3 target C; visible B,D grey no loss. Formula "L = (CE_1 + CE_3)/t" label "四位置教学示例; 本次仅 1、3 被掩码". Do not show targets as predictor inputs. Original targets branch separately into CE boxes. Clear separation clean targets and noisy model input.
Right inference panel "生成: 预测后选择提交". State r_t = M M M M -> "同一预测器" receiving v,p -> candidates A B C D with confidence 0.9 0.4 0.8 0.3 -> "保留高置信; 低置信候选回到 M" -> next state r_s=A M C M -> next predictor round -> final A B C D. Label "s<t; 示例保留两格". Precise note "候选重掩不等于撤回此前已提交位置". Do not use fixed global count as paper schedule.
Bottom narrow note "复用视觉编码与投影特征; 全双向语言塔的前缀 KV 不自动具备跨轮精确复用条件." No model layer count, invented shapes or accuracy results. Every arrow originates and terminates at actual boxes or token strips, no dangling endpoints. Keep rectangles regular and no overlapping text. Definitions v,p,t local, t=掩码概率. Labels primarily Chinese with Q/KV common terms allowed. Separate training vs inference visually, no gradient arrows inference.
```
