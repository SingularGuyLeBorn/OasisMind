"""
# 实现状态：最小可运行；公式级张量实现，不是论文训练复现。

算法名称: Group Relative Policy Optimization (GRPO)
论文: DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models
作者: Zhihong Shao et al. (DeepSeek)
年份: 2024
arXiv: 2402.03300

核心创新:
1. 使用组内均值替代价值函数作为基线
2. 无需训练单独的价值网络
3. 组内归一化(可选，Dr. GRPO建议移除)

数学公式:
$$
A_i = \\frac{R_i - \\bar{R}}{\\sigma_R + \\epsilon}  \\quad \\text{(原始GRPO)}
$$
$$
A_i = R_i - \\bar{R}  \\quad \\text{(Dr. GRPO)}
$$
$$
L^{GRPO} = -\\mathbb{E}\\left[\\min(r_{i,t} A_i, \\text{clip}(r_{i,t}, 1-\\epsilon, 1+\\epsilon) A_i)\\right]
$$

参考实现:
- verl: https://github.com/volcengine/verl
- OpenRLHF: https://github.com/OpenLLMAI/OpenRLHF
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, Dict, List, Optional
from dataclasses import dataclass
import numpy as np

# ============================================
# 第一部分: 配置类
# ============================================

@dataclass
class GRPOConfig:
    """GRPO算法超参数配置

    Attributes:
        group_size: 每个prompt采样的response数量 G
        clip_epsilon: PPO裁剪范围
        kl_coef: KL惩罚系数
        use_std_norm: 是否使用标准差归一化 (Dr. GRPO建议False)
        eps: 数值稳定项
        use_ref_model: 是否使用参考模型计算KL
    """
    group_size: int = 8
    clip_epsilon: float = 0.2
    kl_coef: float = 0.01
    use_std_norm: bool = True   # 原始GRPO=True；Dr. GRPO=False
    eps: float = 1e-5
    use_ref_model: bool = True

    # 训练参数
    learning_rate: float = 1e-6
    num_epochs: int = 1  # 教学默认值；真实设置必须绑定具体训练配方

# ============================================
# 第二部分: 核心优势计算
# ============================================

def compute_grpo_advantages(
    rewards: torch.Tensor,
    group_size: int,
    use_std_norm: bool = True,
    eps: float = 1e-5
) -> torch.Tensor:
    """
    计算GRPO组相对优势

    数学公式:
    - 原始GRPO: A_i = (R_i - mean(R)) / (std(R) + ε)
    - Dr. GRPO:  A_i = R_i - mean(R)

    Args:
        rewards: [batch_size] 所有response的奖励
                 假设连续的group_size个元素属于同一个prompt
        group_size: 每个prompt的response数量 G
        use_std_norm: 是否除以标准差
        eps: 数值稳定项

    Returns:
        advantages: [batch_size] 优势值
    """
    batch_size = rewards.shape[0]
    if group_size <= 0 or batch_size % group_size != 0:
        raise ValueError("reward batch must be divisible by a positive group_size")
    num_prompts = batch_size // group_size

    # 重塑为 [num_prompts, group_size]
    rewards = rewards.view(num_prompts, group_size)

    # 计算组内均值作为基线
    mean_rewards = rewards.mean(dim=1, keepdim=True)  # [num_prompts, 1]

    # 计算优势
    advantages = rewards - mean_rewards

    # 可选: 标准差归一化
    if use_std_norm:
        std_rewards = rewards.std(dim=1, correction=0, keepdim=True)
        normalized = advantages / std_rewards.clamp_min(eps)
        advantages = torch.where(std_rewards > eps, normalized, torch.zeros_like(advantages))

    # 展平回 [batch_size]
    return advantages.view(-1)

# ============================================
# 第三部分: 核心损失函数
# ============================================

def compute_grpo_loss(
    policy_log_probs: torch.Tensor,   # [B, T] 当前策略log概率
    old_log_probs: torch.Tensor,      # [B, T] 旧策略log概率
    advantages: torch.Tensor,          # [B] 优势
    response_mask: torch.Tensor,       # [B, T] 仅回答 token 为 1
    clip_epsilon: float = 0.2,
    reduction: str = "grpo",
    generation_budget: Optional[int] = None,
) -> Tuple[torch.Tensor, Dict[str, torch.Tensor]]:
    """
    计算GRPO损失

    数学公式:
    L = -E[min(r(θ) * A, clip(r(θ), 1-ε, 1+ε) * A)]

    Args:
        policy_log_probs: 当前策略的token级log概率 [B, T]
        old_log_probs: 旧策略的token级log概率 [B, T]
        advantages: 优势值 [B]
        response_mask: 回答区间掩码 [B, T]；不能直接用包含 prompt 的普通 attention mask
        clip_epsilon: 裁剪范围

    Returns:
        loss: 标量损失
        metrics: 调试指标
    """
    if policy_log_probs.shape != old_log_probs.shape or policy_log_probs.shape != response_mask.shape:
        raise ValueError("log-probs and mask must share shape [B,T]")
    if advantages.shape != policy_log_probs.shape[:-1]:
        raise ValueError("advantages must have shape [B]")
    valid = response_mask.to(policy_log_probs.dtype)
    lengths = valid.sum(dim=-1)
    if torch.any(lengths <= 0):
        raise ValueError("each rollout needs at least one valid response token")

    # GRPO使用逐token ratio；旧策略属于rollout数据，必须停止梯度
    log_ratio = policy_log_probs - old_log_probs.detach()
    ratio = torch.exp(log_ratio)  # [B,T]

    # 裁剪
    clipped_ratio = torch.clamp(ratio, 1 - clip_epsilon, 1 + clip_epsilon)

    # PPO损失
    adv_token = advantages.unsqueeze(-1)
    surrogate = torch.minimum(ratio * adv_token, clipped_ratio * adv_token) * valid
    if reduction == "grpo":
        objective = (surrogate.sum(dim=-1) / lengths).mean()
    elif reduction == "dr_grpo":
        if generation_budget is None or generation_budget <= 0:
            raise ValueError("dr_grpo reduction requires positive generation_budget")
        objective = (surrogate.sum(dim=-1) / float(generation_budget)).mean()
    elif reduction == "token_mean":
        objective = surrogate.sum() / valid.sum()
    else:
        raise ValueError(f"unknown reduction: {reduction}")
    policy_loss = -objective

    # 指标
    with torch.no_grad():
        clip_frac = ((((ratio - 1).abs() > clip_epsilon).float() * valid).sum() / valid.sum())
        approx_kl = ((((ratio - 1) - log_ratio) * valid).sum() / valid.sum())

    metrics = {
        "policy_loss": policy_loss.detach(),
        "mean_ratio": ((ratio * valid).sum() / valid.sum()).detach(),
        "clip_fraction": clip_frac.detach(),
        "approx_kl": approx_kl.detach(),
        "mean_advantage": advantages.mean().detach(),
    }

    return policy_loss, metrics

# ============================================
# 第四部分: GRPO变体 (DAPO风格解耦裁剪)
# ============================================

def compute_dapo_loss(
    policy_log_probs: torch.Tensor,
    old_log_probs: torch.Tensor,
    advantages: torch.Tensor,
    response_mask: torch.Tensor,
    clip_low: float = 0.8,
    clip_high: float = 1.28  # DAPO论文使用更宽的上界
) -> Tuple[torch.Tensor, Dict[str, torch.Tensor]]:
    """
    DAPO损失 (解耦裁剪)

    核心区别: 对正负优势使用不同裁剪
    - 正优势: 只裁上界 (鼓励增加好动作概率)
    - 负优势: 只裁下界 (避免过度惩罚)

    Args:
        clip_low: 下界 (通常1-0.2=0.8)
        clip_high: 上界 (DAPO用1.28而不是1.2)
    """
    valid = response_mask.to(policy_log_probs.dtype)
    log_ratio = policy_log_probs - old_log_probs.detach()
    ratio = torch.exp(log_ratio)

    # 解耦裁剪
    clipped_ratio = torch.where(
        advantages.unsqueeze(-1) > 0,
        torch.clamp(ratio, max=clip_high),  # 正优势: 只裁上界
        torch.clamp(ratio, min=clip_low)    # 负优势: 只裁下界
    )

    adv_token = advantages.unsqueeze(-1)
    surrogate = torch.minimum(ratio * adv_token, clipped_ratio * adv_token) * valid
    loss = -surrogate.sum() / valid.sum().clamp_min(1.0)

    metrics = {
        "dapo_loss": loss.detach(),
        "mean_ratio": ((ratio * valid).sum() / valid.sum()).detach(),
    }

    return loss, metrics

# ============================================
# 第五部分: 完整训练步骤
# ============================================

def grpo_train_step(
    model: nn.Module,
    ref_model: Optional[nn.Module],
    optimizer: torch.optim.Optimizer,
    input_ids: torch.Tensor,       # [B, T]
    attention_mask: torch.Tensor,  # [B, T]
    response_mask: torch.Tensor,   # [B, T] 仅回答 token 为1
    rewards: torch.Tensor,         # [B]
    rollout_log_probs: torch.Tensor,  # [B, T] 采样策略在回答 token 上的log概率
    config: GRPOConfig
) -> Dict[str, float]:
    """
    GRPO完整训练步骤

    Args:
        model: 当前策略模型
        ref_model: 参考模型 (用于KL惩罚)
        optimizer: 优化器
        input_ids: 输入序列 [batch, seq_len]
        attention_mask: 模型前向的有效 token 掩码 [batch, seq_len]
        response_mask: 策略损失的回答区间掩码；prompt 与 padding 必须为 0
        rewards: 奖励 [batch]
        rollout_log_probs: 生成这些回答时保存的旧策略 token log-prob；不能在更新前临时重算当前模型来替代
        config: GRPO配置

    Returns:
        metrics: 训练指标
    """
    model.train()

    # 1. 计算组优势
    advantages = compute_grpo_advantages(
        rewards, config.group_size, config.use_std_norm, config.eps
    )

    if rollout_log_probs.shape != response_mask.shape:
        raise ValueError("rollout_log_probs and response_mask must share shape [B,T]")

    # 2. 获取当前策略log概率（有梯度）；旧策略概率来自 rollout 时保存的快照。
    outputs = model(input_ids, attention_mask=attention_mask)
    policy_log_probs = compute_token_log_probs(
        outputs.logits, input_ids, attention_mask
    )

    # 3. 计算GRPO损失
    policy_loss, metrics = compute_grpo_loss(
        policy_log_probs, rollout_log_probs, advantages, response_mask,
        config.clip_epsilon
    )

    # 4. 可选：DeepSeekMath 使用的逐 token 非负 KL 估计。
    total_loss = policy_loss
    if config.use_ref_model and ref_model is not None:
        with torch.no_grad():
            ref_outputs = ref_model(input_ids, attention_mask=attention_mask)
            ref_log_probs = compute_token_log_probs(
                ref_outputs.logits, input_ids, attention_mask
            )

        valid = response_mask.to(policy_log_probs.dtype)
        log_ratio_to_ref = policy_log_probs - ref_log_probs
        per_token_kl = torch.exp(-log_ratio_to_ref) + log_ratio_to_ref - 1
        kl_div = (per_token_kl * valid).sum() / valid.sum().clamp_min(1.0)
        total_loss = policy_loss + config.kl_coef * kl_div
        metrics["kl_div"] = kl_div.detach()

    # 5. 梯度更新
    optimizer.zero_grad()
    total_loss.backward()
    optimizer.step()

    metrics["total_loss"] = total_loss.detach()

    return {k: v.item() if torch.is_tensor(v) else v for k, v in metrics.items()}

# ============================================
# 第六部分: 辅助函数
# ============================================

def compute_token_log_probs(
    logits: torch.Tensor,          # [B, T, V]
    labels: torch.Tensor,          # [B, T]
    attention_mask: torch.Tensor   # [B, T]
) -> torch.Tensor:
    """
    计算token级log概率

    Returns:
        per_token_logps: [B, T] 每个位置的log概率
    """
    # 对齐
    shift_logits = logits[:, :-1, :].contiguous()
    shift_labels = labels[:, 1:].contiguous()
    shift_mask = attention_mask[:, 1:].contiguous()

    # Log softmax
    log_probs = F.log_softmax(shift_logits, dim=-1)

    # Gather目标token的log概率
    per_token_logps = torch.gather(
        log_probs, dim=2, index=shift_labels.unsqueeze(-1)
    ).squeeze(-1)

    # Pad回原始长度
    per_token_logps = F.pad(per_token_logps, (1, 0), value=0.0)

    return per_token_logps

# ============================================
# 第七部分: 简单模型用于测试
# ============================================

class SimpleGRPOModel(nn.Module):
    """简单模型用于测试GRPO"""
    def __init__(self, vocab_size=1000, hidden_size=64):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, hidden_size)
        self.lstm = nn.LSTM(hidden_size, hidden_size, batch_first=True)
        self.lm_head = nn.Linear(hidden_size, vocab_size)

    def forward(self, input_ids, attention_mask=None):
        x = self.embedding(input_ids)
        x, _ = self.lstm(x)
        logits = self.lm_head(x)

        class Output:
            def __init__(self, logits):
                self.logits = logits
        return Output(logits)

# ============================================
# 第八部分: 使用示例
# ============================================

if __name__ == "__main__":
    # 公式断言：ratio 必须保留 token 维，正优势上裁剪生效。
    _new = torch.log(torch.tensor([[1.5, 0.5]]))
    _old = torch.zeros_like(_new)
    _mask = torch.ones_like(_new)
    _loss, _ = compute_grpo_loss(
        _new, _old, torch.tensor([1.0]), _mask, clip_epsilon=0.2
    )
    assert torch.allclose(_loss, torch.tensor(-0.85)), _loss

    print("=" * 60)
    print("GRPO (Group Relative Policy Optimization) 演示")
    print("=" * 60)

    # 配置
    config = GRPOConfig(
        group_size=4,
        use_std_norm=False,  # Dr. GRPO推荐
        clip_epsilon=0.2
    )

    # 模拟数据: 2个prompt，每个4个response
    # Prompt 1: rewards = [1.0, 0.0, 0.5, 0.5] → mean = 0.5
    # Prompt 2: rewards = [0.0, 0.0, 1.0, 1.0] → mean = 0.5
    rewards = torch.tensor([1.0, 0.0, 0.5, 0.5, 0.0, 0.0, 1.0, 1.0])

    # 计算优势
    advantages = compute_grpo_advantages(
        rewards, config.group_size, config.use_std_norm
    )

    print(f"\n输入奖励: {rewards.tolist()}")
    print(f"组划分: [{rewards[:4].tolist()}] [{rewards[4:].tolist()}]")
    print(f"\n计算的优势: {advantages.tolist()}")

    print("\n解读:")
    print("- Prompt 1: mean=0.5, 奖励1.0→优势0.5, 奖励0.0→优势-0.5")
    print("- Prompt 2: mean=0.5, 奖励0.0→优势-0.5, 奖励1.0→优势0.5")

    # 测试Dr. GRPO vs 原始GRPO
    print("\n" + "=" * 60)
    print("Dr. GRPO vs 原始GRPO对比")
    print("=" * 60)

    test_rewards = torch.tensor([1.0, 1.0, 1.0, 1.01])  # 几乎相同的奖励

    advantages_original = compute_grpo_advantages(test_rewards, 4, use_std_norm=True)
    advantages_dr = compute_grpo_advantages(test_rewards, 4, use_std_norm=False)

    print(f"测试奖励: {test_rewards.tolist()}")
    print(f"原始GRPO优势 (归一化): {advantages_original.tolist()}")
    print(f"Dr. GRPO优势 (无归一化): {advantages_dr.tolist()}")
    print("\n注意: 当奖励几乎相同时,归一化会放大微小差异!")

    print("\n" + "=" * 60)
    print("GRPO核心公式:")
    print("  A_i = R_i - mean(R)  (Dr. GRPO)")
    print("  L = -E[min(r·A, clip(r)·A)]")
    print("=" * 60)
