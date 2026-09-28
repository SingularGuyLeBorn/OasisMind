# 范文（公式写法）

Self-Attention 为何除以 $\sqrt{d_k}$：若 $q,k\sim\mathcal{N}(0,1)$，则 $\mathrm{Var}(q\cdot k)=d_k$，故

$$
\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\left(\frac{QK^{T}}{\sqrt{d_k}}\right)V
$$

**禁止**：Self-Attention 除以 √d_k / Var(q·k)=d_k（无 `$` 定界）。
