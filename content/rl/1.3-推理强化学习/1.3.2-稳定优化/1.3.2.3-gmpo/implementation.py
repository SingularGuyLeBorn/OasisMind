"""GMPO surrogate core — status: minimal-runnable, not a paper reproduction."""

import torch


def gmpo_loss(
    new_log_probs: torch.Tensor,
    old_log_probs: torch.Tensor,
    mask: torch.Tensor,
    advantage: torch.Tensor,
    *,
    epsilon: float = 0.4,
) -> tuple[torch.Tensor, torch.Tensor]:
    """Implement Algorithm 1 using token-level clipping and log-space GM.

    Shapes: log-probs and mask are [batch, response_tokens]; advantage is
    [batch]. `old_log_probs` is detached because it belongs to the rollout
    policy. The returned ratio is the per-sequence geometric mean.
"""
# 实现状态：教学骨架；未运行验证（未运行论文训练复现）。

    if new_log_probs.shape != old_log_probs.shape or new_log_probs.shape != mask.shape:
        raise ValueError("new_log_probs, old_log_probs, and mask must share shape")
    if advantage.shape != new_log_probs.shape[:-1]:
        raise ValueError("advantage must have one value per rollout")

    valid = mask.to(new_log_probs.dtype)
    token_count = valid.sum(dim=-1)
    if torch.any(token_count <= 0):
        raise ValueError("each rollout needs at least one valid response token")

    log_ratio = new_log_probs - old_log_probs.detach()
    sign = torch.where(advantage >= 0, 1.0, -1.0).unsqueeze(-1)
    signed_log_ratio = sign * log_ratio
    signed_clipped = torch.clamp(signed_log_ratio, -epsilon, epsilon)
    selected = torch.minimum(signed_log_ratio, signed_clipped)
    selected_log_ratio = sign * selected

    mean_log_ratio = (selected_log_ratio * valid).sum(dim=-1) / token_count
    geometric_mean_ratio = torch.exp(mean_log_ratio)
    loss = -(advantage * geometric_mean_ratio).mean()
    return loss, geometric_mean_ratio.detach()
