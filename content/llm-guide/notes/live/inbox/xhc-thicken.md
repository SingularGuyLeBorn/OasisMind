# xhc-thicken 回传

租约：`2.1.3/02-xHC-Expanded-Hyper-Connections/` + 本文件。
禁止改 live 三份（GOAL / PLAN / PROCESS）。

## 改了什么

- 加厚 `02-xHC-Expanded-Hyper-Connections.md`（不推倒）：钉 XHC/xHC = Expanded Hyper-Connections（上交 / 小红书 Dots），站在 mHC 上把 $N$ 从 4 扩到 16。
- $\mathcal{H}^{pre}/\mathcal{H}^{post}/\mathcal{H}^{res}$ 职责链 01，mHC 公式不重推。
- 「不是」Sparse Sinkhorn Attention（2002.11296）、Gated Residual（丢掉 $H_{res}$）、AttnRes（深度维）。AttnRes 仍用旧相对路径。
- 数字只抄 xHC 论文表/式：Table 1/2/3/4/5/6/7/9–12，式 (1)(3)–(15)(17)–(19)。未把手绘曲线当数据。
- 旧浅色图保留；新增 `images/fig-xhc-writeback-aug.png`、`images/fig-xhc-flash-block.png`。
- 未改 `01-Hyper-Connections与mHC/`、`03-Gated-Residual/`、节首页。

## 打开过的 URL

| 日期 | 题目 | URL | 写进哪 | 摘录 |
|------|------|-----|--------|------|
| 2026-08-30 | xHC abs | https://arxiv.org/abs/2607.14530 | 02 文首 / 来源 | Zhang et al. 2026；上交 / Dots |
| 2026-08-30 | xHC HTML | https://arxiv.org/html/2607.14530 | 02 全文表号 | Table 1 18B 44.8→48.8；N=16 k=4；Flash 73.5C→40C |
| 2026-08-30 | xHC GitHub | https://github.com/aHapBean/xHC | 02 §9 | 项目页 |
| 2026-08-30 | HC | https://arxiv.org/abs/2409.19606 | 来源 2 | 前作 |
| 2026-08-30 | mHC | https://arxiv.org/abs/2512.24880 | 来源 3 / 链 01 | Manifold-Constrained；Table 4 不抄进 xHC |
| 2026-08-30 | Sparse Sinkhorn Attention | https://arxiv.org/abs/2002.11296 | §1 / §7 「不是」 | 注意力块置换，不是 $H_{res}$ |
| 2026-08-30 | He 2016 ResNet | https://arxiv.org/abs/1512.03385 | 来源 4 | 单流残差 |
| 2026-08-30 | 知乎（作者侧讲法） | https://zhuanlan.zhihu.com/p/2063300859472221420 | 只学拆法：写回一份 out / 三次方 / 密读稀写 | 不当事实源 |
| 2026-08-30 | 知乎专栏 | https://zhuanlan.zhihu.com/p/2064367105248703530 | 讲法 | 时序增强 + 稀疏写回 |
| 2026-08-30 | 知乎（检索命中，未当数字源） | https://zhuanlan.zhihu.com/p/2072063651930968165 | — | AttnRes vs 多流记忆分界线索 |
| 2026-08-30 | 知乎（检索命中） | https://www.zhihu.com/question/1990084005744362243/answer/1991235646556235412 | — | mHC 流程口播，数字回 01 |
| 2026-08-30 | 知乎（检索命中） | https://zhuanlan.zhihu.com/p/2062869046270353592 | — | 2607.14530 笔记 |

## 质检

- 汉字（去 YAML 后 `[\u4e00-\u9fff]`）：**4200**（≥4000）。
- $N=16$（xHC 记忆宽度）与 mHC $N=4$、xHC 活跃带宽 $k=4$ 已分清。
- mHC Table 4 的 MATH 26.0 vs HC 26.4 **未当作 xHC 数字**；只在文首/失效里写「不要抄」。
- 旧图 2 张保留；新图 2 张浅色。
