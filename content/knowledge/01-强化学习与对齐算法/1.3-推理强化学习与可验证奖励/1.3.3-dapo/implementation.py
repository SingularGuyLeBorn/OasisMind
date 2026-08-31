"""
# 实现状态：最小可运行；公式级张量与采样控制实现，不是论文训练复现。

算法名称: DAPO (Decoupled Clip and Dynamic Sampling Policy Optimization)
论文: DAPO: An Open-Source LLM Reinforcement Learning System at Scale
作者: ByteDance Seed Team
年份: 2025
arXiv: 2503.14476

核心创新:
1. Clip-Higher: 解耦裁剪，正负优势使用不同边界
2. Dynamic Sampling: 排除组内奖励完全相同、无法形成相对优势的 prompts
3. Token-Level Loss: 用全局有效 token 数统一归约策略梯度损失
4. Overlong Reward Shaping: 过长回复的奖励塑造

参考实现:
- verl: https://github.com/volcengine/verl
- 官方: https://dapo-sia.github.io/
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, Dict, List, Optional
from dataclasses import dataclass, field
import numpy as np

# ============================================
# 第一部分: 配置类
# ============================================

@dataclass
class DAPOConfig:
    """DAPO算法超参数配置

    Attributes:
        clip_eps_high: 正优势时的上界 (大于标准0.2)
        clip_eps_low: 负优势时的下界
        group_size: 每prompt采样数
        dynamic_sampling: 是否启用动态采样
        valid_batch_size: 动态采样要求保留的有效 prompt 数；None 表示初始批大小
        use_token_level: 是否使用Token级损失
        overlong_cache: 最大长度前的软惩罚窗口
        max_length: 最大回复长度
    """
    # DAPO特有参数
    clip_eps_high: float = 0.28      # Clip-Higher: 正优势上界
    clip_eps_low: float = 0.2        # 负优势下界

    # 采样参数
    group_size: int = 8
    dynamic_sampling: bool = True
    valid_batch_size: Optional[int] = None

    # 损失参数
    use_token_level: bool = True

    # 过长处理
    overlong_cache: int = 4096
    max_length: int = 16384

    # 训练参数
    use_std_norm: bool = True
    # DAPO 论文目标不含 KL 项；非零值表示显式采用论文外扩展。
    kl_coef: float = 0.0
    learning_rate: float = 1e-6

# ============================================
# 第二部分: 核心 - 解耦裁剪 (Clip-Higher)
# ============================================

def dapo_clip(
    ratio: torch.Tensor,
    advantages: torch.Tensor,
    eps_high: float = 0.28,
    eps_low: float = 0.2
) -> torch.Tensor:
    """
    DAPO解耦裁剪 (Clip-Higher)

    数学公式:
    - 正优势 (A > 0): clip(r, max=1+ε_high) → 只裁上界
    - 负优势 (A < 0): clip(r, min=1-ε_low)  → 只裁下界

    为什么有效:
    - 正优势时: 放宽上界允许更多探索
    - 负优势时: 保持约束防止过度惩罚

    Args:
        ratio: 概率比 r_t = π_θ / π_old [B, T]
        advantages: 优势值 [B] (会广播)
        eps_high: 正优势时的上界
        eps_low: 负优势时的下界

    Returns:
        clipped_ratio: 裁剪后的概率比 [B, T]
    """
    # 扩展advantages到token维度 [B] -> [B, 1]
    if advantages.dim() == 1:
        adv_expanded = advantages.unsqueeze(-1)
    else:
        adv_expanded = advantages

    # 解耦裁剪
    clipped = torch.where(
        adv_expanded > 0,
        torch.clamp(ratio, max=1.0 + eps_high),   # 正优势: 只裁上界
        torch.clamp(ratio, min=1.0 - eps_low)     # 负优势: 只裁下界
    )

    return clipped

# ============================================
# 第三部分: Token级损失
# ============================================

def compute_dapo_loss(
    policy_log_probs: torch.Tensor,    # [B, T] 当前策略
    old_log_probs: torch.Tensor,       # [B, T] 旧策略
    advantages: torch.Tensor,          # [B] 优势
    response_mask: torch.Tensor,       # [B, T] 仅回答 token 为 1
    config: DAPOConfig
) -> Tuple[torch.Tensor, Dict[str, torch.Tensor]]:
    """
    DAPO损失函数 (Token级 + 解耦裁剪)

    公式:
    L = -1/Σ_i|y_i| Σ_iΣ_t min(r_{i,t}A_i, clip(r_{i,t})A_i)

    Args:
        policy_log_probs: 当前策略的token级log概率 [B, T]
        old_log_probs: 旧策略的token级log概率 [B, T]
        advantages: 序列级优势值 [B]
        response_mask: 回答区间掩码 [B, T]；不能直接使用包含 prompt 的普通 attention mask
        config: DAPO配置

    Returns:
        loss: 标量损失
        metrics: 调试指标
    """
    if policy_log_probs.shape != old_log_probs.shape or policy_log_probs.shape != response_mask.shape:
        raise ValueError("log-probs and response_mask must share shape [B,T]")
    if advantages.shape != policy_log_probs.shape[:-1]:
        raise ValueError("advantages must have shape [B]")

    # 计算token级概率比
    log_ratio = policy_log_probs - old_log_probs.detach()
    ratio = torch.exp(log_ratio)  # [B, T]

    # 解耦裁剪
    clipped_ratio = dapo_clip(
        ratio, advantages, config.clip_eps_high, config.clip_eps_low
    )

    # Token级损失
    # 每个token乘以序列优势
    advantages_expanded = advantages.unsqueeze(-1)  # [B, 1]
    unclipped_surrogate = ratio * advantages_expanded
    clipped_surrogate = clipped_ratio * advantages_expanded
    per_token_loss = -torch.minimum(unclipped_surrogate, clipped_surrogate)

    # 应用掩码并求和
    valid = response_mask.to(per_token_loss.dtype)
    masked_loss = per_token_loss * valid
    valid_tokens = valid.sum().clamp_min(1)
    loss = masked_loss.sum() / valid_tokens

    # 指标
    with torch.no_grad():
        valid_bool = response_mask.bool()
        clip_frac_high = (((ratio > 1 + config.clip_eps_high) & (advantages.unsqueeze(-1) > 0)) & valid_bool).sum() / valid_tokens
        clip_frac_low = (((ratio < 1 - config.clip_eps_low) & (advantages.unsqueeze(-1) < 0)) & valid_bool).sum() / valid_tokens

    metrics = {
        "dapo_loss": loss.detach(),
        "mean_ratio": ((ratio * valid).sum() / valid_tokens).detach(),
        "clip_frac_high": clip_frac_high.detach(),
        "clip_frac_low": clip_frac_low.detach(),
        "mean_advantage": advantages.mean().detach(),
    }

    return loss, metrics

# ============================================
# 第四部分: 动态采样
# ============================================

def filter_informative_prompts(
    rewards: torch.Tensor,
    group_size: int
) -> torch.Tensor:
    """
    保留组内奖励并非全部相同、因而能形成相对优势的 prompts。

    这与奖励的具体编码无关：全 0、全 1、全 -1 或任意常数组都应排除。

    Args:
        rewards: [B] 所有response的奖励
        group_size: 每个prompt的response数量

    Returns:
        valid_mask: [num_prompts] 有效prompt的掩码
    """
    num_prompts = rewards.shape[0] // group_size
    rewards_grouped = rewards.view(num_prompts, group_size)

    return rewards_grouped.amax(dim=1) > rewards_grouped.amin(dim=1)

class DynamicSampler:
    """
    动态采样器

    功能:
    1. 排除组内奖励全部相同的 prompts
    2. 动态补充新prompts
    3. 补采样到固定有效 prompt 批大小
    """
    def __init__(self, prompt_pool: List, config: DAPOConfig):
        self.prompt_pool = prompt_pool
        self.config = config
        self.pool_idx = 0

    def get_next_prompts(self, count: int) -> List:
        """从池中获取新prompts"""
        if not self.prompt_pool:
            raise ValueError("prompt_pool 不能为空")
        prompts = []
        for _ in range(count):
            prompts.append(self.prompt_pool[self.pool_idx % len(self.prompt_pool)])
            self.pool_idx += 1
        return prompts

    def sample_until_valid(
        self,
        initial_prompts: List,
        sample_fn,      # 采样函数
        reward_fn,      # 奖励函数
        max_iterations: int = 10
    ) -> Tuple[List, torch.Tensor, torch.Tensor]:
        """
        动态采样直到获得足够有效样本

        Returns:
            valid_prompts: 有效prompts
            valid_responses: 对应responses
            valid_rewards: 对应rewards
        """
        valid_prompts = []
        valid_responses = []
        valid_rewards = []

        target_count = self.config.valid_batch_size or len(initial_prompts)
        if target_count <= 0:
            raise ValueError("valid_batch_size 必须为正数")
        current_prompts = initial_prompts

        for _ in range(max_iterations):
            # 采样responses
            responses = sample_fn(current_prompts, self.config.group_size)
            rewards = reward_fn(responses)

            # 过滤有效prompts
            valid_mask = filter_informative_prompts(rewards, self.config.group_size)

            for i, is_valid in enumerate(valid_mask):
                if is_valid:
                    start_idx = i * self.config.group_size
                    end_idx = start_idx + self.config.group_size

                    valid_prompts.append(current_prompts[i])
                    valid_responses.extend(responses[start_idx:end_idx])
                    valid_rewards.append(rewards[start_idx:end_idx])

            if len(valid_prompts) >= target_count:
                break

            # 补充新prompts
            need = target_count - len(valid_prompts)
            current_prompts = self.get_next_prompts(need)

        if len(valid_prompts) < target_count:
            raise RuntimeError(
                f"在 {max_iterations} 轮内仅获得 {len(valid_prompts)} 个有效 prompt，"
                f"目标为 {target_count}"
            )

        valid_prompts = valid_prompts[:target_count]
        valid_responses = valid_responses[: target_count * self.config.group_size]
        rewards_tensor = torch.cat(valid_rewards)[: target_count * self.config.group_size]
        return valid_prompts, valid_responses, rewards_tensor

# ============================================
# 第五部分: 过长奖励塑造
# ============================================

def overlong_reward_shaping(
    rewards: torch.Tensor,
    response_lengths: torch.Tensor,
    max_length: int,
    cache_length: int
) -> torch.Tensor:
    """
    过长回复的奖励塑造

    DAPO Eq. (13) 的长度奖励：
    - |y| <= L_max-L_cache: 0
    - L_max-L_cache < |y| <= L_max: (L_max-L_cache-|y|)/L_cache
    - |y| > L_max: -1

    Args:
        rewards: 原始奖励 [B]
        response_lengths: 回复长度 [B]
        max_length: 最大长度
        cache_length: 最大长度前的软惩罚窗口

    Returns:
        shaped_rewards: 塑造后的奖励 [B]
    """
    if cache_length <= 0 or cache_length > max_length:
        raise ValueError("cache_length 必须位于 (0, max_length] 内")

    start = max_length - cache_length
    lengths = response_lengths.to(dtype=rewards.dtype)
    soft_penalty = (start - lengths) / cache_length
    length_reward = torch.where(
        lengths <= start,
        torch.zeros_like(lengths),
        torch.where(lengths <= max_length, soft_penalty, -torch.ones_like(lengths)),
    )
    return rewards + length_reward

# ============================================
# 第六部分: 优势计算 (继承自GRPO)
# ============================================

def compute_advantages(
    rewards: torch.Tensor,
    group_size: int,
    use_std_norm: bool = True,
    eps: float = 1e-5
) -> torch.Tensor:
    """
    计算标准 DAPO 组相对优势；默认使用组内标准差归一化。

    A_i = (R_i - mean(R)) / (std(R) + eps)  # 默认；可显式关闭标准差归一化
    """
    if group_size <= 0 or rewards.shape[0] % group_size != 0:
        raise ValueError("reward batch must be divisible by a positive group_size")
    num_prompts = rewards.shape[0] // group_size
    rewards = rewards.view(num_prompts, group_size)

    mean_rewards = rewards.mean(dim=1, keepdim=True)
    advantages = rewards - mean_rewards

    if use_std_norm:
        std_rewards = rewards.std(dim=1, keepdim=True, correction=0)
        advantages = torch.where(
            std_rewards > eps,
            advantages / std_rewards.clamp_min(eps),
            torch.zeros_like(advantages),
        )

    return advantages.view(-1)

# ============================================
# 第七部分: 完整DAPO训练步骤
# ============================================

def dapo_train_step(
    model: nn.Module,
    ref_model: Optional[nn.Module],
    optimizer: torch.optim.Optimizer,
    input_ids: torch.Tensor,
    attention_mask: torch.Tensor,
    response_mask: torch.Tensor,
    rewards: torch.Tensor,
    response_lengths: torch.Tensor,
    rollout_log_probs: torch.Tensor,
    config: DAPOConfig
) -> Dict[str, float]:
    """
    DAPO 单个优化批次的教学步骤。

    ``attention_mask`` 只控制模型前向；``response_mask`` 只选择回答 token。
    ``rollout_log_probs`` 必须由生成回答时的行为策略保存。若在更新前用当前
    模型临时重算，重要性比会恒为 1，无法展示离策略裁剪。
    """
    model.train()

    # 1. 过长奖励塑造
    shaped_rewards = overlong_reward_shaping(
        rewards, response_lengths, config.max_length, config.overlong_cache
    )

    # 2. 计算优势
    advantages = compute_advantages(
        shaped_rewards, config.group_size, use_std_norm=config.use_std_norm
    )

    # 3. 当前策略 log-prob；旧策略 log-prob 来自 rollout 快照。
    if rollout_log_probs.shape != response_mask.shape:
        raise ValueError("rollout_log_probs and response_mask must share shape [B,T]")
    outputs = model(input_ids, attention_mask=attention_mask)
    policy_log_probs = compute_token_log_probs(
        outputs.logits, input_ids, attention_mask
    )

    # 4. DAPO损失
    loss, metrics = compute_dapo_loss(
        policy_log_probs, rollout_log_probs, advantages, response_mask, config
    )

    # 5. 可选KL惩罚
    total_loss = loss
    if ref_model is not None and config.kl_coef != 0:
        with torch.no_grad():
            ref_outputs = ref_model(input_ids, attention_mask=attention_mask)
            ref_log_probs = compute_token_log_probs(
                ref_outputs.logits, input_ids, attention_mask
            )
        valid = response_mask.to(policy_log_probs.dtype)
        log_ratio_to_ref = policy_log_probs - ref_log_probs
        per_token_kl = torch.exp(-log_ratio_to_ref) + log_ratio_to_ref - 1
        kl_div = (per_token_kl * valid).sum() / valid.sum().clamp_min(1.0)
        total_loss = loss + config.kl_coef * kl_div
        metrics["kl_div"] = kl_div.detach()

    # 6. 梯度更新
    optimizer.zero_grad()
    total_loss.backward()
    optimizer.step()

    metrics["total_loss"] = total_loss.detach()

    return {k: v.item() if torch.is_tensor(v) else v for k, v in metrics.items()}

# ============================================
# 辅助函数
# ============================================

def compute_token_log_probs(logits, labels, attention_mask):
    shift_logits = logits[:, :-1, :].contiguous()
    shift_labels = labels[:, 1:].contiguous()

    log_probs = F.log_softmax(shift_logits, dim=-1)
    per_token_logps = torch.gather(
        log_probs, dim=2, index=shift_labels.unsqueeze(-1)
    ).squeeze(-1)

    return F.pad(per_token_logps, (1, 0), value=0.0)

# ============================================
# 使用示例
# ============================================

if __name__ == "__main__":
    print("=" * 60)
    print("DAPO (Decoupled Clip + Dynamic Sampling) 演示")
    print("=" * 60)

    config = DAPOConfig(
        clip_eps_high=0.28,
        clip_eps_low=0.2,
        group_size=4
    )

    # 模拟解耦裁剪
    print("\n1. 解耦裁剪演示")
    print("-" * 40)

    ratio = torch.tensor([[1.5], [0.7], [1.5], [0.7]])  # [B,T]
    advantages = torch.tensor([1.0, 1.0, -1.0, -1.0])  # 正/负优势

    clipped = dapo_clip(ratio, advantages, 0.28, 0.2)

    print(f"概率比 r:     {ratio.squeeze(-1).tolist()}")
    print(f"优势 A:       {advantages.tolist()}")
    print(f"裁剪后:       {clipped.squeeze(-1).tolist()}")
    print()
    print("解读:")
    print("  - r=1.5, A>0: 裁剪到1.28；r=0.7, A>0 不触发下界裁剪")
    print("  - r=0.7, A<0: 裁剪到0.8；r=1.5, A<0 不触发上界裁剪")

    # 模拟动态采样过滤
    print("\n2. 动态采样过滤演示")
    print("-" * 40)

    rewards = torch.tensor([
        1.0, 0.0, 0.5, 0.5,  # Prompt 1: 有非零 ✓
        0.0, 0.0, 0.0, 0.0,  # Prompt 2: 全零 ✗
        0.0, 0.0, 1.0, 1.0   # Prompt 3: 有非零 ✓
    ])

    valid_mask = filter_informative_prompts(rewards, group_size=4)
    print(f"奖励: {rewards.tolist()}")
    print(f"有效prompts: {valid_mask.tolist()}")
    assert valid_mask.tolist() == [True, False, True]
    print("结果: Prompt 2 因组内奖励全同而被过滤")

    shaped = overlong_reward_shaping(
        torch.zeros(4), torch.tensor([12000, 14000, 16384, 17000]), 16384, 4096
    )
    expected = torch.tensor([0.0, -1712 / 4096, -1.0, -1.0])
    assert torch.allclose(shaped, expected, atol=1e-6)

    print("\n" + "=" * 60)
    print("DAPO核心技术:")
    print("  1. Clip-Higher: ε_high=0.28 > ε_low=0.2")
    print("  2. Dynamic Sampling: 排除组内奖励全同并补足固定有效批")
    print("  3. Token-Level Loss: 逐 token 比率、全局有效 token 归约")
    print("  4. Overlong Shaping: 在最大长度前窗口内线性软惩罚")
    print("=" * 60)
