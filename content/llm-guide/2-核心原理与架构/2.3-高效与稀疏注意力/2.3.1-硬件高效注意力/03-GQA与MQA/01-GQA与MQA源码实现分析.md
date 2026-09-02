---
title: "01 · GQA与MQA源码实现分析"
date: 2026-08-30
tags: [GQA, MQA, MHA, KV Cache, SDPA, PyTorch, 性能优化]
as_of: 2026-08-30
---

# 01 · GQA与MQA源码实现分析

矩阵式,组映射 $g(h)$,KV Cache 字节公式在 [03-GQA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/03-GQA-在性能与缓存之间折中/03-GQA-在性能与缓存之间折中.md) 与 [02-MQA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/02-MQA-共享KeyValue的极致压缩/02-MQA-共享KeyValue的极致压缩.md).本文只对照 **PyTorch SDPA 的张量形状**,`unsqueeze`/`expand`/`reshape`(俗称 `repeat_kv`)以及非连续 stride 的失效模式.不重推 MHA 式.

---

## 1. 形状:Query 头多,KV 头少

记号沿用 2.2.2:$H_q$ 个 Query 头,$H_{kv}$ 个 KV 头,组大小 $g=H_q/H_{kv}$(整除).SDPA 约定布局 `[B, H, S, D]`:

| 张量 | MHA | GQA | MQA |
|------|-----|-----|-----|
| `query` | `[B, H_q, S, D]` | `[B, H_q, S, D]` | `[B, H_q, S, D]` |
| `key` / `value` | `[B, H_q, S, D]` | `[B, H_{kv}, S, D]` | `[B, 1, S, D]` |

数学上第 $i$ 个 Query 头读 `map(i)=\lceil i/g\rceil` 那一路 KV.实现上多数融合核 **并不真的复制** KV `g` 遍,而是用 stride 广播;只有 math 后端会先展开成 `H_q` 头再走普通注意力.

Llama-3-70B 一类配置常见 $H_q=64$,$H_{kv}=8$($g=8$).缓存体积相对 MHA 按 $H_{kv}/H_q$ 缩小,字节公式见 2.2.2.

---

## 2. `repeat_kv`:unsqueeze → expand → reshape

![GQA 组映射与 SDPA 形状广播](./images/redrawn-fig-gqa-repeat-kv-group-map.png)

> 图 1:左 $H_q=8$,$H_{kv}=2$,$g=4$,Q0–Q3 共享 KV0,Q4–Q7 共享 KV1.右:`[B, H_kv, S, D]` 经 `unsqueeze(2)` 得到 `[B, H_kv, 1, S, D]`,`expand` 到 `[B, H_kv, g, S, D]`,再 `reshape` 成 `[B, H_q, S, D]`.

**图 1 解析**

- **左栏**:组是静态的,不是路由网络.组内 Query 仍各有 $W_Q$,只是 $K,V$ 投影变窄.
- **右栏 `expand`**:PyTorch 的 expand 改 stride,**不分配** $g$ 倍显存.若后续 kernel 按连续 `[B, H_q, S, D]` 读,会变成非合并访存.
- **生产路径**:FlashAttention-2 / SDPA 的 FLASH 后端直接吃 `H_q != H_kv`,跳过物理 `repeat`.math 后端才走这条展开.

HuggingFace 里同名辅助函数(示意):

```python
def repeat_kv(hidden_states: torch.Tensor, n_rep: int) -> torch.Tensor:
    # hidden_states: [B, H_kv, S, D]
    if n_rep == 1:
        return hidden_states
    b, h, s, d = hidden_states.shape
    return (
        hidden_states[:, :, None, :, :]
        .expand(b, h, n_rep, s, d)
        .reshape(b, h * n_rep, s, d)
    )
```

---

## 3. SDPA 接口与 C++ math 后端

```python
def scaled_dot_product_attention(
    query, key, value, *, attn_mask=None, dropout_p=0.0,
    is_causal=False, scale=None, enable_gqa=False,
) -> Tensor: ...
```

`enable_gqa=True`(或新版本按 `query.size(1) != key.size(1)` 自动判断)时,FLASH/MEM_EFF 后端在核内做组广播;CPU/math 路径则显式展开:

```cpp
int64_t group_size = H_q / H_kv;
if (group_size > 1) {
    k_expanded = key.unsqueeze(2)
                    .expand({B, H_kv, group_size, S, D})
                    .reshape({B, H_q, S, D});
    v_expanded = value.unsqueeze(2)
                      .expand({B, H_kv, group_size, S, D})
                      .reshape({B, H_q, S, D});
}
return sdp_math_cpu(query_acc, k_expanded, v_expanded, scale, is_causal);
```

这只是 **形状对齐**,不是把 GQA 变成另一套注意力公式.展开后的 math 路径会短暂按 MHA 体积碰 KV,失去 GQA 的带宽优势--所以训练/推理应走融合核.

---

## 4. 失效模式

| 现象 | 原因 | 怎么处理 |
|------|------|----------|
| `H_q % H_kv != 0` | 组大小必须整除 | 配置阶段就拒绝;不要在 kernel 里静默截断 |
| expand 后变慢 | lazy stride,未优化的 kernel 非合并读 | `.contiguous()` 或改用 FA-2 / SDPA FLASH |
| 组过大质量掉 | $H_{kv}$ 太小,表达力靠近 MQA | 质量数字回 2.2.2 / GQA 论文,不在本篇估百分数 |
| 当成 MLA | GQA 仍缓存完整 $d_h$ 的 $K,V$ | MLA 的潜在压缩见 [2.2.2/04-MLA 主文](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与矩阵吸收/04-MLA-低秩潜变量与矩阵吸收.md) |

## 5. 参考文献

- Ainslie, J., et al. (2023). "GQA: Training Generalized Grouped-Query Attention for Distributed Large Language Models." arXiv:2305.13245.公式与实验以本库 2.2.2/03 为准.
- Shazeer, N. (2019). "Fast Transformer Decoding: One Write-Head is All You Need." arXiv:1911.02150.
- PyTorch `torch.nn.functional.scaled_dot_product_attention`(`enable_gqa` / 头数不等时的后端派发).

