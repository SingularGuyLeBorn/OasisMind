---
title: 1234 过文 · batch 02（2.1.1 叶子 → 2.2 节首页）
date: 2026-08-30
published: false
---

# 重派（2026-08-30）

上一跑 Connection stalled。从磁盘现状接着改，不要整篇重写已经浅色、已经无修订的段落。

- **禁止改** `2.1.1-前馈网络FFN与激活函数.md`（batch 01 第 10 项 + 监工等 02/03/04）。
- **禁止改** `02-激活函数谱系-…` / `03-GLU家族-…` / `04-PowLU-…`（若夹还不存在也不要 mkdir）。
- SiTU 只改 `01-SiTU-GLU/01-SiTU-GLU.md`（同名夹）。可补邻居链 03/04，夹不存在也先写下相对路径。
- `2.1` 节首页是 batch 01 第 9 项，不要改。
- 2.2 节首页可以改（本批第 10 项）。

# batch 02 · 监工点评

硬规则同 batch 01：成文、浅色新图、旧深色文件不删、禁止 Delete / commit / 改 live、禁止抄飞书。飞书对照：`1.4 FFN & Add & LN`、`1.5 Positional Encoding`、`1.3 Attention`。**路径：** 派工时 `01-SiTU-GLU.md` 是夹根散文件（违规）。现已收成 `01-SiTU-GLU/01-SiTU-GLU.md`。过文以新夹为准；不要再写回散文件路径。

## 1. `2.1.1/.../01-SiTU-GLU/01-SiTU-GLU.md`（73 行，1 图）

- 优点：公式与 β 超参对。
- 缺点：派工时误判「已有专文夹」——当时是 `{N.N.N}/01-SiTU-GLU.md` 散文件。太薄；图需核浅色。
- 改：在**已收好的同名夹**里补完整专文（问题→门控差在哪→公式→边界→来源）；浅色 `fig-situ-glu.png`；不要标题下一句话。

## 2. `2.1.2-归一化层/2.1.2-归一化层.md`（271 行，5 图）

- 优点：LN/RMSNorm 该在这。
- 缺点：图主题未核。
- 改：打开每张图，深色则换浅色 `fig-ln-*.png` / `fig-rmsnorm-*.png`；成文；Pre-LN vs Post-LN 一张浅色对照即可。

## 3. `2.1.3-残差连接/2.1.3-残差连接.md`（239 行，3 图，有修订）

- 优点：节地图。
- 缺点：修订双轨。
- 改：折修订；深色换浅色；链 01-mHC / 02-xHC / 03-Gated-Residual。

## 4. `2.1.3/.../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md`（185 行，0 图，有修订）

- 改：折修订；**至少一张**浅色 mHC 流图；数字回报告/论文，不要编。

## 5. `2.1.3/.../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md`（154 行，1 图）

- 改：核图是否深色；浅色补一张扩展连接示意；来源台账回传。

## 6. `2.1.3/.../03-Gated-Residual/03-Gated-Residual.md`（112 行，0 图）

- 改：补浅色门控残差图；写成完整节，链 mHC/xHC「不是」。

## 7. `2.1.4-位置编码/2.1.4-位置编码.md`（230 行，2 图）

- 改：节地图；深色换浅色；本体在 01-RoPE，这里不要第二份长推导。

## 8. `2.1.4/.../01-RoPE本体-旋转位置编码/01-RoPE本体-旋转位置编码.md`（177 行，3 图）

- 优点：金样本之一。
- 改：打开 3 图，深则换；成文；相对位置在点积里出现要一眼能读。

## 9. `2.1.4/.../02-RoPE扩展-长上下文、多模态与工程实现/02-RoPE扩展-长上下文、多模态与工程实现.md`（205 行，0 图）

- 改：**至少一张**浅色长上下文/NTK/YaRN 示意（不要假坐标曲线）；链 01 本体。

## 10. `2.2-基础注意力机制/2.2-基础注意力机制.md`（254 行，1 图）

- 改：节地图 + 浅色 QKV 总图（若现图深色则换）；链 2.2.1 / 2.2.2；不要抄 MHA 专文。

---

# 回传（2026-08-30 重派完工）

未 commit / 未 push / 未 `git add -A`。未改 live 三份、Skill、apps、节首页 `2.1.1-前馈网络FFN与激活函数.md`、`2.1-深度学习基础组件.md`、02/03/04 激活专文。

| 路径 | `2026-08 修订` 次数（改后） | 图 |
|------|---------------------------|----|
| `01-SiTU-GLU/01-SiTU-GLU.md` | 0 | 核浅色已有 `images/fig-situ-glu-vs-swiglu.png`，不重画 |
| `2.1.2-归一化层.md` | 0 | **新** `images/fig-ln-opt-landscape.png`（替深色 `image_1.png`，旧文件不删）、**新** `images/fig-preln-vs-postln.png`；浅色 `image_3`/`image_4`/`fig-norm-diagnostics`/`fig-layernorm-vs-rmsnorm` 不重画 |
| `2.1.3-残差连接.md` | **1→0**（折进文首+前瞻） | 三张 `fig-residual-*.png` 已浅色，不重画 |
| `01-Hyper-Connections与mHC.md` | **1→0**（GLM-5.3-Flash 捆法进 §6） | **新** `images/fig-mhc-stream-mix.png`；数字：HC 1.8×/+6 ARC；mHC $n=4$、6.7%、27B Table 4、Amax ~3000→~1.6、$t_{\max}=20$ |
| `02-xHC-Expanded-Hyper-Connections.md` | 0 | 核浅色已有 `fig-xhc-dense-read-sparse-write.png`；**新** `images/fig-xhc-expanded-streams.png`。来源仍 arXiv:2607.14530 |
| `03-Gated-Residual.md` | 0 | **新** `images/fig-gated-residual.png`；「不是」mHC/xHC/$H_{\mathrm{res}}$ |
| `2.1.4-位置编码.md` | 0 | 两张 `fig-pe-four-methods` / `fig-rope-complex-plane` 已浅色；RoPE 长推导改链 01 |
| `01-RoPE本体-旋转位置编码.md` | 0 | 三张 `fig-rope-*` 已浅色，补图解析（点积相对相位） |
| `02-RoPE扩展-….md` | 0 | **新** `images/fig-rope-ntk-yarn.png`（相位绕圈/NTK/YaRN/PI，非假曲线） |
| `2.2-基础注意力机制.md` | 0 | **新** `images/fig-ch22-attention-overview.png`（原稿引用缺失）；节地图链 2.2.1 / 2.2.2 |

SiTU 已写成问题→门控差在哪→式 (12)→$\ell_\infty\le 100$→不是 PowLU / 不是 V3–V4 clamp；邻居链 03/04（夹已在磁盘，本批未改那些文件）。
