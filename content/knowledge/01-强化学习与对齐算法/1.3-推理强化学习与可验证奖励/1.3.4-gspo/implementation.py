"""
# 实现状态：最小可运行；公式级张量实现，不是论文训练复现。

算法名称: GSPO (Group Sequence Policy Optimization)
论文: Group Sequence Policy Optimization
作者: Qwen Team, Alibaba Inc.
年份: 2025
arXiv: 2507.18071

核心创新:
1. 长度归一的序列级重要性比率
2. 序列级裁剪
3. 论文在其 Qwen3 MoE 训练设置中报告了更稳定的训练行为

数学公式:
$$
s_i = exp(mean_t(log pi_theta - log pi_old))
$$
$$
L^{GSPO} = -\\mathbb{E}\\left[\\min(r \\cdot A, \\text{clip}(r, 1-\\epsilon, 1+\\epsilon) \\cdot A)\\right]
$$

参考实现:
- verl: https://github.com/volcengine/verl
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, Dict, Optional
from dataclasses import dataclass

# ============================================
# 第一部分: 配置类
# ============================================

@dataclass
class GSPOConfig:
    """GSPO算法超参数配置

    Attributes:
        clip_low/clip_high: 序列级裁剪的下、上偏移
        group_size: 每prompt采样数
        use_std_norm: 是否使用优势标准化
    """
    # GSPO论文实验设置为[1-3e-4, 1+4e-4]；换任务必须重新校准。
    clip_low: float = 3e-4
    clip_high: float = 4e-4
    group_size: int = 8
    use_std_norm: bool = True   # GSPO Eq.6 默认标准化组优势
    eps: float = 1e-5

    # 训练参数
    learning_rate: float = 1e-6

# ============================================
# 第二部分: 序列级log概率计算
# ============================================

def compute_sequence_log_probs(
    logits: torch.Tensor,          # [B, T, V]
    labels: torch.Tensor,          # [B, T]
    response_mask: torch.Tensor    # [B, T] 仅回答 token 为 1
) -> torch.Tensor:
    """
    计算每条回答的平均 token log-prob

    公式:
    mean_logp = Σ_t mask_t log P(y_t|prefix) / Σ_t mask_t

    Args:
        logits: 语言模型logits [batch, seq_len, vocab_size]
        labels: 目标token序列 [batch, seq_len]
        response_mask: 回答区间掩码 [batch, seq_len]；prompt 与 padding 必须为 0

    Returns:
        seq_log_probs: 序列log概率 [batch]
    """
    # 对齐
    shift_logits = logits[:, :-1, :].contiguous()
    shift_labels = labels[:, 1:].contiguous()
    shift_mask = response_mask[:, 1:].contiguous()

    # 计算每个位置的log概率
    log_probs = F.log_softmax(shift_logits, dim=-1)

    # 提取目标token的log概率
    per_token_logp = torch.gather(
        log_probs, dim=2, index=shift_labels.unsqueeze(-1)
    ).squeeze(-1)  # [B, T-1]

    token_count = shift_mask.sum(dim=-1)
    if torch.any(token_count <= 0):
        raise ValueError("each rollout needs at least one valid response token")
    seq_log_probs = (per_token_logp * shift_mask).sum(dim=-1) / token_count

    return seq_log_probs

# ============================================
# 第三部分: 序列级比率计算
# ============================================

def compute_sequence_ratio(
    policy_seq_logp: torch.Tensor,    # [B]
    old_seq_logp: torch.Tensor        # [B]
) -> torch.Tensor:
    """
    计算序列级重要性比率 (GSPO的核心区别)

    公式:
    s = exp(mean_logp_θ(y) - mean_logp_old(y))

    GRPO直接使用逐token ratio；GSPO才构造回答级的长度归一比率。
    """
    log_ratio = policy_seq_logp - old_seq_logp.detach()
    ratio = torch.exp(log_ratio)
    return ratio

# ============================================
# 第四部分: GSPO损失函数
# ============================================

def compute_gspo_loss(
    policy_seq_logp: torch.Tensor,    # [B]
    old_seq_logp: torch.Tensor,       # [B]
    advantages: torch.Tensor,          # [B]
    clip_low: float = 3e-4,
    clip_high: float = 4e-4,
) -> Tuple[torch.Tensor, Dict[str, torch.Tensor]]:
    """
    GSPO损失函数 (序列级裁剪)

    公式:
    L = -E[min(r · A, clip(r, 1-ε, 1+ε) · A)]

    关键区别: 裁剪作用于序列级比率r，而非token级r_t

    Args:
        policy_seq_logp: 当前策略的序列log概率 [B]
        old_seq_logp: 旧策略的序列log概率 [B]
        advantages: 优势值 [B]
        clip_low/clip_high: 比率下、上边界相对1的偏移

    Returns:
        loss: 标量损失
        metrics: 调试指标
    """
    if policy_seq_logp.shape != old_seq_logp.shape or policy_seq_logp.shape != advantages.shape:
        raise ValueError("policy, rollout and advantage tensors must share shape [B]")

    # 序列级比率
    ratio = compute_sequence_ratio(policy_seq_logp, old_seq_logp)

    # 序列级裁剪 (GSPO的关键!)
    clipped_ratio = torch.clamp(ratio, 1 - clip_low, 1 + clip_high)

    # PPO目标
    surr1 = ratio * advantages
    surr2 = clipped_ratio * advantages
    loss = -torch.min(surr1, surr2).mean()

    # 指标
    with torch.no_grad():
        clip_frac = ((ratio < 1 - clip_low) | (ratio > 1 + clip_high)).float().mean()
        log_ratio = policy_seq_logp - old_seq_logp.detach()
        approx_kl = ((ratio - 1) - log_ratio).mean()

    metrics = {
        "gspo_loss": loss.detach(),
        "mean_ratio": ratio.mean().detach(),
        "max_ratio": ratio.max().detach(),
        "min_ratio": ratio.min().detach(),
        "clip_fraction": clip_frac.detach(),
        "approx_kl": approx_kl.detach(),
    }

    return loss, metrics

# ============================================
# 第五部分: 优势计算 (继承自GRPO)
# ============================================

def compute_advantages(
    rewards: torch.Tensor,
    group_size: int,
    use_std_norm: bool = True,
    eps: float = 1e-5
) -> torch.Tensor:
    """计算组相对优势；默认对应GSPO Eq.6。"""
    if group_size <= 0 or rewards.shape[0] % group_size != 0:
        raise ValueError("reward batch must be divisible by a positive group_size")
    num_prompts = rewards.shape[0] // group_size
    rewards = rewards.view(num_prompts, group_size)

    mean_rewards = rewards.mean(dim=1, keepdim=True)
    advantages = rewards - mean_rewards

    if use_std_norm:
        std_rewards = rewards.std(dim=1, correction=0, keepdim=True)
        normalized = advantages / std_rewards.clamp_min(eps)
        advantages = torch.where(std_rewards > eps, normalized, torch.zeros_like(advantages))

    return advantages.view(-1)

# ============================================
# 第六部分: 完整GSPO训练步骤
# ============================================

def gspo_train_step(
    model: nn.Module,
    optimizer: torch.optim.Optimizer,
    input_ids: torch.Tensor,
    attention_mask: torch.Tensor,
    response_mask: torch.Tensor,
    rewards: torch.Tensor,
    rollout_mean_log_probs: torch.Tensor,
    config: GSPOConfig
) -> Dict[str, float]:
    """
    GSPO 单个优化批次的教学步骤。

    ``rollout_mean_log_probs`` 是生成回答时保存的旧策略平均 token log-prob；
    不能在更新前用当前模型临时重算，否则序列重要性比会恒为 1。
    """
    model.train()

    # 1. 计算优势
    advantages = compute_advantages(
        rewards, config.group_size, config.use_std_norm, config.eps
    )

    if rollout_mean_log_probs.shape != rewards.shape:
        raise ValueError("rollout_mean_log_probs and rewards must share shape [B]")

    # 2. 获取当前策略的回答区间平均 token log-prob。
    logits = model(input_ids, attention_mask=attention_mask).logits
    policy_seq_logp = compute_sequence_log_probs(logits, input_ids, response_mask)

    # 3. GSPO损失
    loss, metrics = compute_gspo_loss(
        policy_seq_logp, rollout_mean_log_probs, advantages,
        config.clip_low, config.clip_high
    )

    # 4. 梯度更新。论文正文 Eq.5--7 的核心目标在此不额外加入参考模型项；
    # 若实验采用 KL 正则，必须单独说明估计器、系数和归约方式。
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    metrics["total_loss"] = loss.detach()

    return {k: v.item() if torch.is_tensor(v) else v for k, v in metrics.items()}

# ============================================
# 第七部分: GSPO vs GRPO 对比演示
# ============================================

def demo_ratio_stability():
    """演示GSPO的数值稳定性优势"""
    torch.manual_seed(42)

    # 模拟长序列场景
    T = 100  # 100个tokens
    B = 4

    # 模拟token级log比率 (微小波动)
    token_log_ratios = torch.randn(B, T) * 0.1  # 均值0，方差0.01

    # GRPO保留每个token ratio；这里只展示其形状
    grpo_ratio = torch.exp(token_log_ratios)

    # GSPO: 长度归一的序列级比率
    gspo_ratio = torch.exp(token_log_ratios.mean(dim=-1))

    print("数值稳定性对比 (T=100 tokens)")
    print("=" * 50)
    print(f"Token log_ratio 统计: mean={token_log_ratios.mean():.4f}, std={token_log_ratios.std():.4f}")
    print()
    print("GRPO (逐token ratio):")
    print(f"  ratio范围: [{grpo_ratio.min():.2e}, {grpo_ratio.max():.2e}]")
    print()
    print("GSPO (长度归一序列级):")
    print(f"  ratio范围: [{gspo_ratio.min():.4f}, {gspo_ratio.max():.4f}]")
    print()
    print("结论: GSPO的ratio范围更可控!")

    return grpo_ratio, gspo_ratio

# ============================================
# 使用示例
# ============================================

if __name__ == "__main__":
    print("=" * 60)
    print("GSPO (Group Sequence Policy Optimization) 演示")
    print("=" * 60)

    # 1. 数值稳定性对比
    print("\n1. 数值稳定性对比")
    print("-" * 40)
    demo_ratio_stability()

    # 2. 序列级比率计算
    print("\n2. 序列级比率计算")
    print("-" * 40)

    policy_seq_logp = torch.tensor([-50.0, -52.0, -48.0, -55.0])
    old_seq_logp = torch.tensor([-51.0, -51.0, -51.0, -51.0])

    ratio = compute_sequence_ratio(policy_seq_logp, old_seq_logp)
    print(f"策略序列log概率: {policy_seq_logp.tolist()}")
    print(f"旧策略序列log概率: {old_seq_logp.tolist()}")
    print(f"序列级比率: {ratio.tolist()}")

    # 3. GSPO损失
    print("\n3. GSPO损失计算")
    print("-" * 40)

    advantages = torch.tensor([0.5, -0.5, 0.3, -0.3])
    loss, metrics = compute_gspo_loss(
        policy_seq_logp, old_seq_logp, advantages, clip_low=3e-4, clip_high=4e-4
    )

    print(f"优势: {advantages.tolist()}")
    print(f"GSPO损失: {loss.item():.4f}")
    print(f"裁剪比例: {metrics['clip_fraction'].item():.2%}")

    print("\n" + "=" * 60)
    print("GSPO核心公式:")
    print("  s = exp(mean_t(log π_θ - log π_old))  [长度归一序列级]")
    print("  L = -E[min(r·A, clip(r)·A)]")
    print("=" * 60)
