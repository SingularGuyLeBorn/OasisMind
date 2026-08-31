"""KTO loss core — status: minimal-runnable, not an end-to-end trainer.

The caller must supply sequence log-probabilities for both the labelled pairs
and the cyclically mismatched pairs used by the paper's KL reference estimate.
"""
# 实现状态：教学骨架；未运行验证（未运行论文训练复现）。


import torch


def kto_loss(
    policy_logps: torch.Tensor,
    ref_logps: torch.Tensor,
    labels: torch.Tensor,
    mismatched_policy_logps: torch.Tensor,
    mismatched_ref_logps: torch.Tensor,
    *,
    beta: float = 0.1,
    desirable_weight: float = 1.0,
    undesirable_weight: float = 1.0,
) -> tuple[torch.Tensor, dict[str, torch.Tensor]]:
    """Return the paper-form KTO loss for binary desirable/undesirable data.

    `labels` is one for desirable and zero for undesirable. Log-probabilities
    are sums over the response tokens. The KL reference point is detached, as
    specified by the paper; it is not the mean reward of positive examples.
    """
    tensors = (policy_logps, ref_logps, labels, mismatched_policy_logps, mismatched_ref_logps)
    if any(t.shape != policy_logps.shape for t in tensors):
        raise ValueError("all inputs must have the same shape")

    log_ratio = policy_logps - ref_logps
    with torch.no_grad():
        z0 = torch.clamp((mismatched_policy_logps - mismatched_ref_logps).mean(), min=0.0)

    desirable_value = desirable_weight * torch.sigmoid(beta * (log_ratio - z0))
    undesirable_value = undesirable_weight * torch.sigmoid(beta * (z0 - log_ratio))
    per_example = torch.where(
        labels.to(torch.bool),
        desirable_weight - desirable_value,
        undesirable_weight - undesirable_value,
    )
    return per_example.mean(), {"reference_point": z0, "mean_log_ratio": log_ratio.mean().detach()}
