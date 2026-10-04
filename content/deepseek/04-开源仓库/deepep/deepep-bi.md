---
title: "DeepEP 文档对照译稿"
category: "开源仓库"
tags: ["DeepSeek", "对照译稿", "开源仓库"]
published: true
excerpt: "DeepEP 仓库 README 与 docs/ 下两份设计文档的逐段中英对照: V2.5 的 EPBuffer 接口, 环境变量与网络配置, V1 的 normal 与 low-latency kernel 性能表, 以及 NVSHMEM 安装指南."
---
# DeepEP 文档对照译稿

本稿对照三份文件: 仓库根目录的 `README.md` (V2.5, 对应提交 `93eb6eb`, 2026-09-30), 以及 V2 时期保留的 `docs/legacy.md` 与 `docs/nvshmem.md` (对应提交 `a56d615`, 2026-09-16). 后两份文档在 V2.5 里随 V1 一并删除, 但 V1 的 normal 与 low-latency kernel 设计只有这里有完整描述. 代码块, 表格, 命令与 bibtex 不译. 原文里指向仓库内文件的相对链接, 这里统一改成 GitHub 上的绝对链接.

## README.md

DeepEP (DeepEveryParallel) is a high-performance communication library for machine learning training and inference. It provides high-throughput and low-latency expert-parallel (EP) all-to-all GPU kernels for MoE dispatch and combine, including FP8 dispatch, and NVLink weight and gradient exchange for redundant experts. It also offers experimental primitives for pipeline parallelism (PP), context parallelism (CP), data parallelism (DP), and remote memory access (Engram). Communication kernels are compiled at runtime via [DeepJIT](https://github.com/deepseek-ai/DeepJIT), with the supporting extension built during installation.

DeepEP (DeepEveryParallel) 是面向机器学习训练与推理的高性能通信库. 它提供高吞吐与低延迟的专家并行 (EP) all-to-all GPU kernel, 用于 MoE 的 dispatch 与 combine, 包括 FP8 dispatch, 以及冗余专家在 NVLink 上的权重与梯度交换. 它还提供几种实验性原语: 流水并行 (PP), 上下文并行 (CP), 数据并行 (DP) 与远程内存访问 (Engram). 通信 kernel 由 [DeepJIT](https://github.com/deepseek-ai/DeepJIT) 在运行时编译, 配套的扩展在安装时构建.

### News

- **Ascend version release**
  - Same API and full performance on HUAWEI Ascend 950 NPUs
  - Check [DeepEP-Ascend](https://github.com/deepseek-ai/DeepEP-Ascend) for more details

- **V2.5 release**:
  - Split `ElasticBuffer` into `EPBuffer`, `EngramBuffer`, `PPBuffer`, and `BucketBuffer`, sharing the `BufferBase` lifecycle
  - Add `BufferAllocator` for planning symmetric tensor allocations before buffer construction
  - Add batched all-gather, reduce-scatter, and all-reduce through `BucketBuffer`, with sessions for ordinary PyTorch tensors
  - Add `EPBuffer.lb_prefetch_weights` and `EPBuffer.lb_reduce_grads` for dynamic redundant experts: prefetch expert weights and quantization scales over NVLink before expert computation, then accumulate redundant experts' FP32 gradients into the original experts during backward. These primitives support the expert-replication approach explored by [MoonEP](https://github.com/MoonshotAI/MoonEP) and [UltraEP](https://github.com/Dots-Infra/UltraEP); see [Expert load balancing](https://github.com/deepseek-ai/DeepEP/blob/main/README.md#expert-load-balancing) for the API and integration requirements
  - Support deferred EP epilogues, cached expanded layouts, and zero padding between experts
  - Support multi-layer Engram storage on GPU or CPU, with one wait hook per layer
  - Fully remove V1, including its APIs, NVSHMEM backend, and legacy documentation. NVSHMEM is no longer a dependency

- **V2 release**: A complete refactoring of expert parallelism, with support for larger scale-up and scale-out domains and the lightweight **NCCL Gin backend**.

动态. 昇腾版发布: 在华为 Ascend 950 NPU 上提供相同的 API 与完整性能, 详见 DeepEP-Ascend 仓库.

V2.5 发布, 改动有七项. 一是把 `ElasticBuffer` 拆成 `EPBuffer`, `EngramBuffer`, `PPBuffer` 与 `BucketBuffer`, 共用 `BufferBase` 的生命周期. 二是新增 `BufferAllocator`, 在构造 buffer 之前规划对称张量的分配. 三是经 `BucketBuffer` 提供批量的 all-gather, reduce-scatter 与 all-reduce, 并用 session 支持普通 PyTorch 张量. 四是为动态冗余专家新增 `EPBuffer.lb_prefetch_weights` 与 `EPBuffer.lb_reduce_grads`: 专家计算之前经 NVLink 预取专家权重与量化 scale, 反向时把冗余专家的 FP32 梯度累加回原专家; 这两个原语服务于 MoonEP 与 UltraEP 探索的专家复制方案, 接口与集成要求见「专家负载均衡」一节. 五是支持延后执行的 EP epilogue, 缓存的展开布局, 以及专家之间的零填充. 六是支持放在 GPU 或 CPU 上的多层 Engram 存储, 每层一个等待 hook. 七是彻底移除 V1, 包括其 API, NVSHMEM 后端与旧版文档, NVSHMEM 不再是依赖.

V2 发布: 对专家并行的完整重构, 支持更大的 scale-up 与 scale-out 域, 以及轻量的 **NCCL Gin 后端**.

#### New features

- **JIT-compiled communication kernels** via DeepJIT
- **NCCL Gin backend**
  - Lightweight device-side communication APIs
  - Able to reuse existing NCCL communicators
- **EPv2**
  - High-throughput and low-latency APIs unified into a single `EPBuffer` interface, with an expanded layout for grouped expert GEMMs
  - Larger scale-up & scale-out domain support
  - Analytical SM & QP count calculation — no more auto-tuning needed
  - Both hybrid & direct modes remain supported
- **Engram** (experimental, with RDMA)
- **PP** (experimental, with RDMA)
- **Bucket collectives** (experimental) for CP and DP (all-gather, reduce-scatter, and all-reduce)

新特性. 通信 kernel 经 DeepJIT 做 JIT 编译. NCCL Gin 后端提供轻量的设备侧通信 API, 并能复用已有的 NCCL communicator. EPv2 把高吞吐与低延迟两套 API 统一到一个 `EPBuffer` 接口里, 并为分组专家 GEMM 提供展开布局; 支持更大的 scale-up 与 scale-out 域; SM 数与 QP 数用解析方式算出, 不再需要自动调参; hybrid 与 direct 两种模式都保留. 另有三项实验特性: 基于 RDMA 的 Engram, 基于 RDMA 的 PP, 以及面向 CP 与 DP 的 bucket 集合通信 (all-gather, reduce-scatter 与 all-reduce).

#### Notes

- EP dispatch and combine require GPU SMs; zero-SM RDMA EP is not supported
- Bucket, Engram, and PP are experimental features
- Engram requires a NCCL build providing `ncclGinOptFlagsWarpGet`

注意事项: EP 的 dispatch 与 combine 需要占用 GPU SM, 不支持零 SM 的 RDMA EP; Bucket, Engram 与 PP 是实验特性; Engram 需要提供 `ncclGinOptFlagsWarpGet` 的 NCCL 构建.

> **核对:** V1 文档说 hook 式重叠「不占用任何 SM 资源」, 这里却写「不支持零 SM 的 RDMA EP」, 两处矛盾吗?
> 答: 不矛盾, 两句话说的是不同阶段. V1 的 low-latency kernel 在 [`csrc/deep_ep.cpp`](https://github.com/deepseek-ai/DeepEP/blob/567632d/csrc/deep_ep.cpp) 里拆成两次 launch: `return_recv_hook=true` 时只跑 `LOW_LATENCY_SEND_PHASE`, 接收阶段包成 `recv_hook` 留给调用方. 发送阶段要用 SM 做 FP8 转换并提交 IBGDA 请求, 这几微秒占满 SM; 提交之后数据在网卡上传输, 这段时间不占 SM, 「不占 SM」指的是这一段. V2.5 讲的是 dispatch 与 combine 整体: [`deep_ep/buffers/ep.py`](https://github.com/deepseek-ai/DeepEP/blob/main/deep_ep/buffers/ep.py) 的 `get_theoretical_num_sms` 把下限钉在 4 个 SM, 没有返回 0 的分支. 作者在 [issue 179](https://github.com/deepseek-ai/DeepEP/issues/179) 里也是这样回答的.

### Quick start

#### Requirements

- Linux
- Python 3.10 and above
- NVIDIA Hopper or newer GPUs
- CUDA Toolkit 13.1 and above for DeepJIT compilation, with support for the target GPU
- A C++20 compiler and standard library with `std::format` support
- PyTorch 2.10 and above, with CUDA support
- NCCL 2.32.3 and above
- NVLink for intranode communication
- RDMA network for internode communication

环境要求: Linux; Python 3.10 及以上; NVIDIA Hopper 或更新的 GPU; DeepJIT 编译需要 CUDA Toolkit 13.1 及以上, 且支持目标 GPU; 支持 `std::format` 的 C++20 编译器与标准库; 带 CUDA 的 PyTorch 2.10 及以上; NCCL 2.32.3 及以上; 节点内通信要有 NVLink; 跨节点通信要有 RDMA 网络.

Installation builds the host C++ extension against the CUDA and NCCL libraries. GPU kernels are compiled by DeepJIT for the current device at runtime, so installation does not require a visible GPU or `TORCH_CUDA_ARCH_LIST`. Keep the CUDA toolkit and host compiler available at runtime. Automatic bandwidth detection uses `nvidia-smi` and `ibstat`; `BucketBuffer` currently requires both NVLink and RDMA bandwidth to be detectable, even for a group using only one transport.

安装时只针对 CUDA 与 NCCL 库构建主机侧的 C++ 扩展. GPU kernel 在运行时由 DeepJIT 针对当前设备编译, 所以安装时不需要能看到 GPU, 也不需要 `TORCH_CUDA_ARCH_LIST`. 运行时要保证 CUDA toolkit 与主机编译器可用. 带宽自动探测用的是 `nvidia-smi` 与 `ibstat`; `BucketBuffer` 目前要求 NVLink 与 RDMA 两侧带宽都能探测到, 即使这个通信组只用其中一种传输.

#### Install NCCL dependency

Install the NCCL package matching your CUDA environment so DeepEP can locate its headers and library:

安装与 CUDA 环境匹配的 NCCL 包, 让 DeepEP 能找到它的头文件与库:

```bash
# CUDA 13.x
python -m pip install "nvidia-nccl-cu13>=2.32.3" --no-deps
# For CUDA 12.x, use nvidia-nccl-cu12 instead
```

For a custom NCCL installation, set `EP_NCCL_ROOT_DIR` to a directory containing `include/` and `lib/`. PyTorch and DeepEP must load the same NCCL shared library. Builds using NCCL headers older than 2.31 additionally require an exact compile-time/runtime NCCL version match.

如果是自行安装的 NCCL, 把 `EP_NCCL_ROOT_DIR` 设成包含 `include/` 与 `lib/` 的目录. PyTorch 与 DeepEP 必须加载同一个 NCCL 共享库. 用低于 2.31 的 NCCL 头文件构建时, 编译期与运行期的 NCCL 版本还必须完全一致.

#### Installation

```bash
# Initialize the DeepJIT submodule
git submodule update --init --recursive

# Build a wheel and install it into the current Python environment
bash install.sh
```

Then import `deep_ep` in your Python project.

之后在 Python 项目里 import `deep_ep` 即可.

#### Development and tests

```bash
# Build and link the extension into the source tree
bash develop.sh

# Run test cases
python tests/ep/test_ep.py
python tests/bucket/test_all_gather.py
python tests/bucket/test_reduce_scatter.py
python tests/bucket/test_all_reduce.py
python tests/buffer/test_allocation.py
python tests/ep/test_prefetch_weights.py
python tests/ep/test_reduce_grads.py
python tests/engram/test_engram.py
python tests/pp/test_pp.py
```

The test scripts require NumPy and spawn local GPU workers. For multi-node tests, launch the same script on each node with a shared `MASTER_ADDR` and `MASTER_PORT`, setting `WORLD_SIZE` to the number of nodes and `RANK` to the node index. These are the conventions of `init_dist` in [deep_ep/utils/envs.py](https://github.com/deepseek-ai/DeepEP/blob/main/deep_ep/utils/envs.py); adapt it to your cluster if needed. The tests default to `NCCL_IB_SL=1` and `EP_OVERRIDE_RDMA_SL=1` unless already set. Weight-prefetch and gradient-reduction tests use a single NVLink domain; PP tests require an RDMA-only group.

测试脚本需要 NumPy, 会在本机拉起 GPU worker 进程. 跑多节点测试, 要在每个节点上启动同一个脚本, 共用同一组 `MASTER_ADDR` 与 `MASTER_PORT`, `WORLD_SIZE` 设为节点数, `RANK` 设为节点序号. 这是 `deep_ep/utils/envs.py` 里 `init_dist` 的约定, 需要的话按自己的集群改. 如果没有预先设置, 测试默认用 `NCCL_IB_SL=1` 与 `EP_OVERRIDE_RDMA_SL=1`. 权重预取与梯度归约的测试只用一个 NVLink 域; PP 测试需要一个纯 RDMA 的通信组.

### Interfaces and examples

#### Buffer initialization

High-throughput and low-latency EP operations share a single `EPBuffer` interface. Initialize the buffer with MoE settings directly; SM and QP counts are estimated analytically and can be overridden per call.

高吞吐与低延迟两类 EP 操作共用一个 `EPBuffer` 接口. 直接用 MoE 配置初始化 buffer 即可; SM 数与 QP 数由解析公式估算, 每次调用时也可以覆盖.

Create and reuse a buffer for each EP group. All ranks must agree on `num_max_tokens_per_rank`; choose a common capacity covering the intended training, prefill, and decoding batches. The example below manages one EP group. Finish outstanding operations before replacing its buffer.

每个 EP 组建一个 buffer 并复用. 所有 rank 的 `num_max_tokens_per_rank` 必须一致, 取一个能覆盖训练, prefill 与 decode 各自批大小的公共容量. 下面的示例只管理一个 EP 组. 替换 buffer 之前, 先等进行中的操作完成.

```python
import torch.distributed as dist
from typing import Optional

from deep_ep import EPBuffer

# Communication buffer (will allocate at runtime)
_buffer: Optional[EPBuffer] = None

# Number of SMs to use for communication kernels (will be set at buffer creation)
_num_comm_sms: int = 0


def get_buffer(group: dist.ProcessGroup,
               num_max_tokens_per_rank: int,
               hidden: int,
               num_topk: int,
               num_experts: int,
               use_fp8_dispatch: bool = False) -> EPBuffer:
    """Initialize or retrieve the EPBuffer for EP communication."""
    global _buffer, _num_comm_sms

    # Check if we can reuse the existing buffer
    required_bytes = EPBuffer.get_buffer_size_hint(
        group, num_max_tokens_per_rank, hidden,
        num_topk=num_topk, use_fp8_dispatch=use_fp8_dispatch,
    )
    if _buffer is not None and _buffer.group == group and _buffer.num_bytes >= required_bytes:
        _num_comm_sms = _buffer.get_theoretical_num_sms(num_experts, num_topk)
        return _buffer

    # Allocate a new buffer with MoE settings
    _buffer = EPBuffer(
        group,
        num_max_tokens_per_rank=num_max_tokens_per_rank,
        hidden=hidden,
        num_topk=num_topk,
        use_fp8_dispatch=use_fp8_dispatch,
    )

    # Estimate the SM count from the topology and communication volume
    # You may also specify `num_sms` manually in dispatch/combine calls to override
    _num_comm_sms = _buffer.get_theoretical_num_sms(num_experts, num_topk)

    return _buffer
```

#### Example use in model training and inference

Training, inference prefilling, and inference decoding use the same `EPBuffer` dispatch and combine APIs. The example uses an expanded layout for grouped expert GEMMs and defers the forward epilogues until the framework waits for their results. Set `expert_alignment` to the grouped GEMM's token alignment; for DeepGEMM, use `deep_gemm.get_mk_alignment_for_contiguous_layout()`.

训练, 推理 prefill 与推理 decode 用的是同一套 `EPBuffer` dispatch 与 combine API. 示例为分组专家 GEMM 使用展开布局, 并把前向的 epilogue 延后到框架等待结果的时刻. `expert_alignment` 设成分组 GEMM 要求的 token 对齐; 用 DeepGEMM 的话取 `deep_gemm.get_mk_alignment_for_contiguous_layout()`.

`do_cpu_sync=True` obtains exact output sizes and CPU-side expert counts, commonly used for training and prefill. Set it to `False` when using GPU-side receive counts, as in decoding: outputs are allocated to the configured capacity, and the expert GEMMs must use `handle.psum_num_recv_tokens_per_expert` to identify valid expert ranges. A new routing decision needs a fresh dispatch; decoding alone does not make an old routing handle reusable.

`do_cpu_sync=True` 会拿到准确的输出大小与 CPU 侧的各专家计数, 训练与 prefill 通常这样用. 如果用 GPU 侧的接收计数, 比如 decode, 就设为 `False`: 输出按配置的容量分配, 专家 GEMM 必须用 `handle.psum_num_recv_tokens_per_expert` 确定每个专家的有效区间. 路由结果变了就要重新 dispatch; 处在 decode 阶段并不意味着旧的路由 handle 可以复用.

```python
import torch
from typing import Optional, Tuple, Union

from deep_ep import EPBuffer, EPHandle, EventHandle, EventOverlap


def dispatch_forward(x: Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]],
                     topk_idx: torch.Tensor, topk_weights: torch.Tensor,
                     num_experts: int,
                     num_max_tokens_per_rank: int,
                     expert_alignment: int = 1,
                     do_cpu_sync: bool = True,
                     previous_event: Optional[EventHandle] = None) -> EventOverlap:
    """
    MoE dispatch: route tokens to the corresponding experts across all ranks.
    Supports both BF16 and FP8 (x as a tuple of [data, scale_factors]) inputs.
    Wait on the returned event to obtain the expanded tensors and routing handle.
    """
    global _buffer, _num_comm_sms

    return _buffer.dispatch(
        x,
        topk_idx=topk_idx,
        topk_weights=topk_weights,
        num_experts=num_experts,
        num_max_tokens_per_rank=num_max_tokens_per_rank,
        expert_alignment=expert_alignment,
        num_sms=_num_comm_sms,
        previous_event=previous_event,
        async_with_compute_stream=True,
        allocate_on_comm_stream=previous_event is not None,
        do_cpu_sync=do_cpu_sync,
        do_expand=True,
        do_zero_padding=True,
        use_tma_aligned_col_major_sf=True,
        defer_epilogue=True,
    )


def dispatch_backward(grad_recv_x: torch.Tensor,
                      grad_recv_topk_weights: torch.Tensor,
                      handle: EPHandle,
                      bias: Optional[torch.Tensor] = None) -> Tuple[torch.Tensor, torch.Tensor, EventOverlap]:
    """The backward pass of MoE dispatch is actually a combine."""
    global _buffer, _num_comm_sms

    combined_grad_x, combined_grad_topk_weights, event = _buffer.combine(
        grad_recv_x,
        handle=handle,
        bias=bias,
        topk_weights=grad_recv_topk_weights,
        num_sms=_num_comm_sms,
        async_with_compute_stream=True,
    )

    return combined_grad_x, combined_grad_topk_weights, event


def combine_forward(x: torch.Tensor,
                    handle: EPHandle,
                    bias: Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]] = None,
                    previous_event: Optional[EventHandle] = None) -> EventOverlap:
    """MoE combine: reduce expert outputs back to their original ranks."""
    global _buffer, _num_comm_sms

    return _buffer.combine(
        x,
        handle=handle,
        bias=bias,
        num_sms=_num_comm_sms,
        previous_event=previous_event,
        async_with_compute_stream=True,
        allocate_on_comm_stream=previous_event is not None,
        defer_epilogue=True,
    )


def combine_backward(grad_combined_x: Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]],
                     handle: EPHandle) -> \
        Tuple[Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]], EventOverlap]:
    """The backward pass of MoE combine is actually a dispatch."""
    global _buffer, _num_comm_sms

    grad_x, _, _, _, event = _buffer.dispatch(
        grad_combined_x,
        handle=handle,
        num_sms=_num_comm_sms,
        async_with_compute_stream=True,
        do_expand=True,
        do_zero_padding=True,
        use_tma_aligned_col_major_sf=True,
    )

    return grad_x, event
```

For communication-computation overlap, launch communication first and wait at the point where the expert computation needs its results:

要做通信计算重叠, 先发起通信, 在专家计算需要结果的地方再等待:

```python
# Use do_cpu_sync=False for decoding with GPU-side expert counts
event = dispatch_forward(...)

# ... do some independent computation here ...

# Run the deferred dispatch epilogue and obtain its results
recv_x, _, recv_topk_weights, handle = event.current_stream_wait()

# ... run the expert GEMMs and apply recv_topk_weights to produce expert_output ...
event = combine_forward(expert_output, handle)

# ... do some independent computation here ...
combined_x, _ = event.current_stream_wait()
```

The expanded `recv_topk_weights` is one-dimensional, with one value per expert row. The expert computation applies these router weights before combine; combine sums the supplied expert outputs. Combine inputs must be BF16. `bias` can add the shared-expert output or residual during the combine epilogue.

展开后的 `recv_topk_weights` 是一维的, 每个专家行一个值. 专家计算要在 combine 之前乘上这些路由权重; combine 只对传入的专家输出求和. combine 的输入必须是 BF16. `bias` 可以在 combine 的 epilogue 里加上共享专家的输出或残差.

Training saves the forward `handle` for `combine_backward` and `dispatch_backward`. The backward helpers above return tensors and an event; wait on that event before using the tensors. Cached dispatch replays the saved expanded layout without another receive-count CPU synchronization. Keep the original `topk_idx` unchanged until all uses of the handle finish.

训练时要保存前向的 `handle`, 供 `combine_backward` 与 `dispatch_backward` 使用. 上面的反向辅助函数返回张量和一个 event, 使用张量之前先等这个 event. 缓存式 dispatch 会重放保存下来的展开布局, 不再为接收计数做一次 CPU 同步. 在 handle 的所有使用结束之前, 原始的 `topk_idx` 不能改.

#### Deferred epilogues

Dispatch and combine accept `defer_epilogue=True` together with `async_with_compute_stream=True`. In this mode, the call returns an `EventOverlap` directly. Calling `.wait()` runs the deferred epilogue on the current stream and returns `(recv_x, recv_topk_idx, recv_topk_weights, handle)` for dispatch, or `(combined_x, combined_topk_weights)` for combine.

dispatch 与 combine 接受 `defer_epilogue=True`, 需与 `async_with_compute_stream=True` 同时设置. 这种模式下调用直接返回一个 `EventOverlap`. 调 `.wait()` 时在当前 stream 上执行被延后的 epilogue, dispatch 返回 `(recv_x, recv_topk_idx, recv_topk_weights, handle)`, combine 返回 `(combined_x, combined_topk_weights)`.

The returned result is produced by the first wait, so retain it for the following computation. Without other work to overlap, call `.wait()` immediately. `do_zero_padding=True` clears alignment gaps between experts; in the no-CPU-sync mode, it does not make unused output capacity valid data.

结果由第一次 wait 产生, 要留着给后续计算用. 如果没有别的工作可以重叠, 就立刻调 `.wait()`. `do_zero_padding=True` 会把专家之间的对齐空隙清零; 在不做 CPU 同步的模式下, 它不会把输出里未用到的容量变成有效数据.

If independent computation is already queued before the communication call, capture the input-ready event with `_buffer.capture()` before enqueueing that computation and pass it as `previous_event`. The forward helpers set `allocate_on_comm_stream=True` in this case, as required by EP. The deferred epilogue still runs on the current stream at `.wait()`; this also allows a combine `bias` produced by the intervening computation to be consumed there.

如果通信调用之前已经排进了与之无关的计算, 要在排入那段计算之前用 `_buffer.capture()` 捕获「输入就绪」的 event, 再作为 `previous_event` 传入. 这种情况下前向辅助函数会按 EP 的要求设 `allocate_on_comm_stream=True`. 延后的 epilogue 仍在 `.wait()` 时于当前 stream 上执行; 这样一来, 中间那段计算产生的 combine `bias` 也能在这里被用上.

> **拆开:** `defer_epilogue` 把什么东西推迟了, 推迟的那部分为什么要跑在当前 stream 而不是通信 stream?
> 答: 推迟的是 kernel 收完数据之后的整理步骤. dispatch 一侧是把接收缓冲区里的 token 拷成按专家展开, 按 `expert_alignment` 对齐的布局, 并按需零填充, 对应 [`deep_ep/include/deep_ep/impls/ep/dispatch_copy_epilogue.cuh`](https://github.com/deepseek-ai/DeepEP/blob/main/deep_ep/include/deep_ep/impls/ep/dispatch_copy_epilogue.cuh); combine 一侧是对多份专家输出求和并加上 `bias`, 对应 [`deep_ep/include/deep_ep/impls/ep/combine_reduce_epilogue.cuh`](https://github.com/deepseek-ai/DeepEP/blob/main/deep_ep/include/deep_ep/impls/ep/combine_reduce_epilogue.cuh). 放在当前 stream 上有两层原因. 一是这一步的输出马上要被专家 GEMM 或下一层读, 在计算 stream 上执行就不用再插一次跨 stream 同步. 二是 combine 的 `bias` 常常是通信期间并行算出来的共享专家输出, 只有到 `.wait()` 那一刻它才确定已经算完.

#### Bucket collectives (experimental)

`BucketBuffer` provides batched `all_gather`, `reduce_scatter`, and `all_reduce` for CP and DP workloads. In normal usage, inputs must reside in the bucket's own storage. Use `BufferAllocator` to plan tensors before creating the buffer. The plan's meta tensors become CUDA views into the buffer when it is constructed.

`BucketBuffer` 为 CP 与 DP 负载提供批量的 `all_gather`, `reduce_scatter` 与 `all_reduce`. 常规用法下输入必须放在 bucket 自己的存储里. 创建 buffer 之前先用 `BufferAllocator` 规划张量; buffer 构造时, 规划里的 meta 张量会变成指向 buffer 内部的 CUDA 视图.

```python
import torch

from deep_ep import BufferAllocator, BucketBuffer

# group is an initialized CP or DP process group
allocation_plan = BufferAllocator()
x = allocation_plan.allocate((group.size(), 1024), torch.float32)
buffer = BucketBuffer(group, allocation_plan)

# Gather each rank's local shard into the registered tensor
x[group.rank()].fill_(group.rank())
gathered_x = buffer.all_gather(x[group.rank()]).wait()

# Reduce-scatter and all-reduce use FP32 tensors in the buffer
x.fill_(1)
shard = buffer.reduce_scatter(x).wait()
x.fill_(1)
reduced_x = buffer.all_reduce(x).wait()
```

All ranks must use the same allocation plan. Each collective also accepts a list of tensors, and `.wait()` returns the corresponding tensor or list of tensors. Results are views into the buffer; all-gather returns flattened views. Reduce-scatter and all-reduce accept FP32 inputs and sum contributions by default; use `scale` to scale the result. Reduce-scatter also supports `comm_precision="bf16"` for lower-precision communication while retaining FP32 input and output tensors.

所有 rank 必须用同一份分配规划. 每个集合通信也接受张量列表, `.wait()` 返回对应的张量或张量列表. 结果是 buffer 内部的视图, all-gather 返回的是展平后的视图. reduce-scatter 与 all-reduce 接受 FP32 输入, 默认对各方贡献求和, 用 `scale` 可以缩放结果. reduce-scatter 还支持 `comm_precision="bf16"`, 通信用低精度, 输入输出张量仍是 FP32.

To use tensors allocated outside the bucket, wrap the collective calls in a `buffer.session()`. The session manages temporary bucket storage and the required staging copies:

要用 bucket 之外分配的张量, 把集合通信调用包进 `buffer.session()`. session 负责临时的 bucket 存储和必要的中转拷贝:

```python
with buffer.session():
    reduced_x = buffer.all_reduce(external_x).wait()
    # Consume or copy reduced_x before reusing the session storage
```

The NVLink-only all-gather path also supports an external source with an explicitly supplied in-bucket `dsts`; use a session for general out-of-bucket inputs.

纯 NVLink 的 all-gather 路径还支持外部输入源, 前提是显式给出位于 bucket 内的 `dsts`; 一般的 bucket 外输入用 session.

All three collectives support NVLink, RDMA, and hybrid domains. NVLink reductions require NCCL multimem support. All-gather is driven by copy engines (`num_sms=0`); reduce-scatter and all-reduce use GPU SMs. See [the bucket tests](https://github.com/deepseek-ai/DeepEP/tree/main/tests/bucket) and [allocation tests](https://github.com/deepseek-ai/DeepEP/blob/main/tests/buffer/test_allocation.py) for examples, including registration with multiple communication groups.

三种集合通信都支持 NVLink, RDMA 与混合域. NVLink 上的归约需要 NCCL 的 multimem 支持. all-gather 由 copy engine 驱动 (`num_sms=0`); reduce-scatter 与 all-reduce 要用 GPU SM. 示例见 bucket 测试与分配测试, 其中包括向多个通信组注册的用法.

#### Expert load balancing

Dynamic expert replication spreads a heavily loaded expert's computation across additional GPUs. [MoonEP](https://github.com/MoonshotAI/MoonEP) explores online planning with dynamic redundant experts, weight prefetching, and gradient reduction. [UltraEP](https://github.com/Dots-Infra/UltraEP) ([paper](https://arxiv.org/abs/2606.04101)) plans replication and token rerouting from the current post-gating load, keeping expert replication within the NVLink domain. These works motivate the redundant-expert communication primitives exposed by `EPBuffer`.

动态专家复制把一个高负载专家的计算分摊到更多 GPU 上. MoonEP 探索了在线规划, 动态冗余专家, 权重预取与梯度归约的组合. UltraEP 根据门控之后的实时负载规划复制与 token 重路由, 并把专家复制限制在 NVLink 域内. `EPBuffer` 暴露的冗余专家通信原语就是受这两项工作启发.

- `lb_prefetch_weights(redundant_expert_weights, expert_weights, redundancy_mapping)` pushes original expert weights to the requested redundant slots before expert computation. It accepts one tensor or matching nonempty tensor sequences, so weights and quantization scales can be transferred together without dtype conversion.
- `lb_reduce_grads(redundant_expert_grads, expert_grads, redundancy_mapping)` reads the redundant experts' FP32 gradients over NVLink and adds them into the original experts' gradients in place. Use the same mapping as the forward pass and initialize `expert_grads` with the local contribution, or zeros, before reduction.

`lb_prefetch_weights` 在专家计算之前把原专家的权重推送到指定的冗余槽位. 它接受单个张量, 也接受一一对应的非空张量序列, 所以权重和量化 scale 可以一起传, 不做 dtype 转换. `lb_reduce_grads` 经 NVLink 读取冗余专家的 FP32 梯度, 原地加到原专家的梯度上. 映射要与前向一致, 归约之前 `expert_grads` 要先初始化为本地贡献或零.

The caller supplies the replication plan, reroutes tokens to the chosen expert instances, and manages the expert GEMMs. Both exchange operations are collective within each NVLink domain: every rank in that domain must call them, including ranks with no assigned redundant slots. They run asynchronously on the communication stream and return an `EventOverlap`; call `.wait()` before consuming their results. `previous_event` can specify when the inputs are ready, and `num_sms=0` selects an analytical SM estimate.

复制规划由调用方给出, 把 token 重路由到选定的专家实例, 以及管理专家 GEMM, 也都是调用方的事. 两个交换操作在每个 NVLink 域内都是集合操作: 域内每个 rank 都必须调用, 没有分到冗余槽位的 rank 也不例外. 它们在通信 stream 上异步执行, 返回 `EventOverlap`, 使用结果之前要调 `.wait()`. `previous_event` 可以指定输入何时就绪, `num_sms=0` 表示用解析公式估算 SM 数.

Reserve redundant weight and gradient storage with `lb_allocation_plan_or_num_bytes`, using a `BufferAllocator` plan or an aligned byte count. This LB region is separate from the EP dispatch/combine buffer. The redundant tensors must reside in it; original expert weights and gradients can use ordinary CUDA allocations. Plans must have the same shapes and allocation order on every rank in the NVLink domain.

冗余权重与梯度的存储用 `lb_allocation_plan_or_num_bytes` 预留, 传 `BufferAllocator` 规划或对齐过的字节数都可以. 这块 LB 区域与 EP 的 dispatch/combine buffer 是分开的. 冗余张量必须放在这块区域里, 原专家的权重和梯度用普通的 CUDA 分配即可. NVLink 域内每个 rank 的规划必须有相同的形状与分配顺序.

`redundancy_mapping` must be a contiguous CUDA int32 tensor of shape `[num_nvlink_ranks, num_redundant_experts]`, with identical contents on every rank in the domain. Entry `[r, c]` assigns an expert to redundant slot `c` on domain-local rank `r`, or is `-1` for an unused slot. Expert IDs are `owner_rank * num_local_experts + local_expert_idx`, using domain-local rank indices. Assign replicas to peers; a rank's own experts must not appear in its redundant slots. Unused slots are skipped.

`redundancy_mapping` 必须是连续的 CUDA int32 张量, 形状为 `[num_nvlink_ranks, num_redundant_experts]`, 域内每个 rank 上内容相同. 元素 `[r, c]` 表示把哪个专家放到域内第 `r` 个 rank 的第 `c` 个冗余槽位, `-1` 表示槽位不用. 专家 ID 的算法是 `owner_rank * num_local_experts + local_expert_idx`, rank 用域内序号. 副本要分给其他 rank, 一个 rank 自己的专家不能出现在它自己的冗余槽位里. 未使用的槽位会被跳过.

All weight and gradient tensors must be contiguous CUDA tensors. Weight tensors have leading dimension `num_local_experts` and redundant tensors `num_redundant_experts`; the trailing shapes may differ as long as each matching pair has the same byte count per expert, a multiple of `deep_ep.get_num_tma_alignment()` (32 bytes). All ranks in the domain must have the same `num_local_experts`. Gradient reduction takes two-dimensional FP32 tensors; flatten each expert's parameters into a row with the same byte alignment.

所有权重与梯度张量都必须是连续的 CUDA 张量. 原专家张量的首维是 `num_local_experts`, 冗余张量的首维是 `num_redundant_experts`; 后面的维度可以不同, 只要每对张量里每个专家的字节数相等, 且是 `deep_ep.get_num_tma_alignment()` (32 字节) 的整数倍. 域内所有 rank 的 `num_local_experts` 必须相同. 梯度归约只接受二维 FP32 张量, 每个专家的参数要展平成一行, 字节对齐要求相同.

```python
import torch

from deep_ep import BufferAllocator, EPBuffer

# Use the same plan on every rank; each example expert row is 1024 elements
lb_plan = BufferAllocator()
redundant_weights = lb_plan.allocate((num_redundant_experts, 1024), torch.bfloat16)
redundant_grads = lb_plan.allocate((num_redundant_experts, 1024), torch.float32)
buffer = EPBuffer(
    group,
    num_max_tokens_per_rank=num_max_tokens_per_rank,
    hidden=hidden,
    num_topk=num_topk,
    lb_allocation_plan_or_num_bytes=lb_plan,
)

# expert_weights: contiguous CUDA BF16 [num_local_experts, 1024]
# redundancy_mapping: supplied by the caller's replication planner
weights_ready = buffer.lb_prefetch_weights(
    redundant_weights, expert_weights, redundancy_mapping,
)
# ... independent computation can overlap the exchange ...
weights_ready.wait()
# ... run expert computation using the prefetched weights ...

# After backward has written redundant_grads and the local expert_grads:
grads_ready = buffer.lb_reduce_grads(
    redundant_grads, expert_grads, redundancy_mapping,
)
# ... independent backward computation can overlap the reduction ...
grads_ready.wait()
# expert_grads now includes contributions from all redundant instances
```

Keep the mapping and tensor storage valid until the corresponding exchange finishes. If redundant storage is reused across layers or microbatches, restore the required weights before backward computation and finish gradient reduction before reusing its inputs. Reduction does not clear redundant gradients; overwrite or zero them before the next accumulation. See [weight prefetch tests](https://github.com/deepseek-ai/DeepEP/blob/main/tests/ep/test_prefetch_weights.py) and [gradient reduction tests](https://github.com/deepseek-ai/DeepEP/blob/main/tests/ep/test_reduce_grads.py) for complete allocation and correctness examples.

在对应的交换完成之前, 映射和张量存储都要保持有效. 如果冗余存储在多层或多个 micro-batch 之间复用, 反向计算之前要把需要的权重恢复回来, 复用梯度输入之前要先完成梯度归约. 归约不会清空冗余梯度, 下一次累加之前要覆盖或清零. 完整的分配与正确性示例见权重预取测试与梯度归约测试.

#### Engram (experimental)

`EngramBuffer` supports GPU/CPU storage and multi-layer fetches over RDMA. Use `get_storage_size_hint` and `get_theoretical_config` to size the buffer and its QPs, then `set_config` and `write` to populate the layer tables.

`EngramBuffer` 支持放在 GPU 或 CPU 上的存储, 以及经 RDMA 的多层读取. 先用 `get_storage_size_hint` 与 `get_theoretical_config` 确定 buffer 大小和 QP 数, 再用 `set_config` 与 `write` 填充各层的表.

`fetch(indices)` takes an int32 tensor of shape `[num_layers, num_tokens, num_entries_per_token]` and returns one completion hook per layer. Call the corresponding hook before using that layer's fetched data. See [Engram tests](https://github.com/deepseek-ai/DeepEP/blob/main/tests/engram/test_engram.py) for BF16, FP8, and CPU storage examples.

`fetch(indices)` 接受形状为 `[num_layers, num_tokens, num_entries_per_token]` 的 int32 张量, 每层返回一个完成 hook. 使用某层读回的数据之前, 先调用该层对应的 hook. BF16, FP8 与 CPU 存储的示例见 Engram 测试.

#### Pipeline parallelism (experimental)

`PPBuffer` provides `send(x, dst_rank_idx)` and `recv(x, src_rank_idx)` between adjacent ranks in an RDMA-only pipeline group. Set `num_max_tensor_bytes` and `num_max_inflight_tensors` at construction to reserve the send/recv slots. Inputs and outputs must be contiguous CUDA tensors with 32-byte-aligned pointers and sizes. See [PP tests](https://github.com/deepseek-ai/DeepEP/blob/main/tests/pp/test_pp.py) for usage.

`PPBuffer` 在纯 RDMA 的流水线组里, 为相邻 rank 之间提供 `send(x, dst_rank_idx)` 与 `recv(x, src_rank_idx)`. 构造时设置 `num_max_tensor_bytes` 与 `num_max_inflight_tensors`, 预留收发槽位. 输入输出必须是连续的 CUDA 张量, 指针与大小都要 32 字节对齐. 用法见 PP 测试.

#### Environment variables

Set runtime variables before importing `deep_ep` and creating buffers. Flags use `0`/`1` unless noted. The defaults below assume no build-time defaults have been packaged.

运行时变量要在 import `deep_ep` 与创建 buffer 之前设置. 除非另有说明, 开关类变量取 `0` 或 `1`. 下表的默认值假设打包时没有写入构建期默认值.

**Runtime and networking**

| Variable | Default | Effect |
| --- | --- | --- |
| `EP_BUFFER_DEBUG` | Unset | Set to `1` to print initialization, topology, buffer-size, and SM-estimation diagnostics. Leave unset to disable all diagnostics; Python-side checks also treat the string `"0"` as enabled. |
| `EP_SUPPRESS_NCCL_CHECK` | `0` | Skip the import-time checks for duplicate NCCL libraries and binary equality with the selected installation. Does not bypass the C++ device-communicator compatibility checks. |
| `EP_AVOID_RECORD_STREAM` | `0` | For EP and bucket operations, retain tensors in the completion event instead of calling `record_stream`. Keep the event alive until communication has completed. |
| `EP_REUSE_NCCL_COMM` | `1` | Reuse the PyTorch process group's NCCL communicator when its backend exposes `_comm_ptr`; otherwise create a DeepEP-managed communicator. |
| `EP_DEFAULT_RDMA_SL` | Unset | Set the Gin traffic class/service level when the buffer's `sl_idx` is not supplied. If both are unset, use NCCL's default. |
| `EP_OVERRIDE_RDMA_SL` | Unset | Override both `EP_DEFAULT_RDMA_SL` and the buffer's `sl_idx`. |
| `EP_DISABLE_GIN` | `0` | Skip Gin initialization for NVLink-only use. RDMA operations require Gin; this flag does not select another RDMA backend. |
| `EP_NUM_MAX_LOCAL_RANKS` | `16` | Engram only: estimate registered storage for `NCCL_WIN_STRIDE` sizing in hybrid mode. This is a sizing estimate, not a rank-count limit. |

运行与网络类变量的要点: `EP_BUFFER_DEBUG` 设为 `1` 打印初始化, 拓扑, buffer 大小与 SM 估算的诊断信息, 要关掉就不设, 因为 Python 侧把字符串 `"0"` 也当作开启; `EP_SUPPRESS_NCCL_CHECK` 跳过 import 时对重复 NCCL 库与二进制一致性的检查, 但绕不过 C++ 设备 communicator 的兼容性检查; `EP_AVOID_RECORD_STREAM` 让 EP 与 bucket 操作把张量挂在完成 event 上, 不调 `record_stream`, 这时 event 要一直保留到通信结束; `EP_REUSE_NCCL_COMM` 默认复用 PyTorch 进程组暴露 `_comm_ptr` 的 NCCL communicator; `EP_DEFAULT_RDMA_SL` 与 `EP_OVERRIDE_RDMA_SL` 决定 Gin 的流量类别; `EP_DISABLE_GIN` 只适用于纯 NVLink 场景, 它不会切换到别的 RDMA 后端; `EP_NUM_MAX_LOCAL_RANKS` 只给 Engram 在 hybrid 模式下估算注册存储用, 不是 rank 数上限.

**JIT compilation**

DeepJIT reads `EP_JIT_*` first, then the corresponding `DJ_JIT_*` variable as a global fallback. Configure these before the first kernel compilation. An explicit `EP_JIT_*` value, including a packaged default, takes precedence over `DJ_JIT_*`.

DeepJIT 先读 `EP_JIT_*`, 再以对应的 `DJ_JIT_*` 作为全局回退. 这些变量要在第一次编译 kernel 之前设好. 显式给出的 `EP_JIT_*` 值 (包括打包进去的默认值) 优先于 `DJ_JIT_*`.

| Variable | Default | Effect |
| --- | --- | --- |
| `EP_JIT_DEBUG` | `0` | Enable compiler-command and kernel-load diagnostics, PTXAS output, source line information, and PTX/SASS dumps. |
| `EP_JIT_CACHE_DIR` | `$HOME/.dj` | Cache root or colon-separated list of roots. Search all roots in order and write newly compiled artifacts to the first. |
| `EP_JIT_NVCC_COMPILER` | Detected toolkit's `bin/nvcc` | Override the NVCC executable; a valid CUDA toolkit root must still be discoverable. |
| `EP_JIT_CPP_STANDARD` | `20` | C++ standard passed to NVCC. DeepEP requires C++20 or newer. |
| `EP_JIT_PRINT_COMPILER_COMMAND` | `0` | Print compiler and disassembler commands. |
| `EP_JIT_PRINT_LOAD_TIME` | `0` | Print kernel-binary loading time. |
| `EP_JIT_PTXAS_VERBOSE` | `0` | Enable and print detailed PTXAS output. |
| `EP_JIT_CHECK_NO_SPILLS` | `0` | Reject compiled kernels with register spills. |
| `EP_JIT_CHECK_NO_LOCAL_MEMORY` | `0` | Reject compiled kernels with local-memory usage. |
| `EP_JIT_WITH_LINEINFO` | `0` | Embed source line information for profiling. |
| `EP_JIT_DUMP_ASM` | `0` | Generate both PTX and SASS artifacts on a cache miss. |
| `EP_JIT_DUMP_PTX` | `0` | Generate PTX artifacts on a cache miss. |
| `EP_JIT_DUMP_SASS` | `0` | Generate SASS artifacts on a cache miss; requires the toolkit's `cuobjdump`. |
| `EP_GIN_GDAKI_DEBUG` | `0` | Compile JIT kernels with NCCL Gin GDAKI device debugging enabled. |

DeepJIT discovers the CUDA toolkit through `CUDA_HOME`, then `CUDA_PATH`, then `nvcc` on `PATH`, and finally `/usr/local/cuda`.

DeepJIT 查找 CUDA toolkit 的顺序是 `CUDA_HOME`, `CUDA_PATH`, `PATH` 上的 `nvcc`, 最后是 `/usr/local/cuda`.

**Build and dependency discovery**

| Variable | Default | Effect |
| --- | --- | --- |
| `EP_NCCL_ROOT_DIR` | Auto-detected | NCCL installation with `include/` and `lib/`, used at build and import time. Takes precedence over `NCCL_DIR`, then NVIDIA Python package discovery. |
| `EP_NUM_TOPK_IDX_BITS` | `64` | Build-time top-k index width (`32` or `64`). Use the exported `deep_ep.topk_idx_t` for routing indices. Changing this value requires rebuilding the extension. |

When set during a package build, these variables are stored as import-time defaults: `EP_JIT_CACHE_DIR`, `EP_JIT_PRINT_COMPILER_COMMAND`, `EP_JIT_CPP_STANDARD`, `EP_NUM_TOPK_IDX_BITS`, `EP_NCCL_ROOT_DIR`, `EP_DEFAULT_RDMA_SL`, and `EP_OVERRIDE_RDMA_SL`. Existing environment values take precedence at import. Overriding `EP_NUM_TOPK_IDX_BITS` at runtime does not change the compiled index type.

打包构建时若设置了 `EP_JIT_CACHE_DIR`, `EP_JIT_PRINT_COMPILER_COMMAND`, `EP_JIT_CPP_STANDARD`, `EP_NUM_TOPK_IDX_BITS`, `EP_NCCL_ROOT_DIR`, `EP_DEFAULT_RDMA_SL` 与 `EP_OVERRIDE_RDMA_SL`, 它们会被存成 import 时的默认值; import 时环境里已有的值优先. 运行时覆盖 `EP_NUM_TOPK_IDX_BITS` 不会改变已编译的索引类型.

**Test profiling**

These flags affect `bench_kineto` in [deep_ep/utils/testing.py](https://github.com/deepseek-ai/DeepEP/blob/main/deep_ep/utils/testing.py), not production communication:

下面两个开关只影响 `deep_ep/utils/testing.py` 里的 `bench_kineto`, 不影响生产环境的通信:

| Variable | Default | Effect |
| --- | --- | --- |
| `EP_USE_NVIDIA_TOOLS` | `0` | Skip the internal profiler when using Nsight or Compute Sanitizer. Reported internal timings are placeholders while this is enabled. |
| `EP_DISABLE_BARRIER_PROFILING` | `0` | Disable the barrier and delay inserted before each profiled iteration. |

`EP_USE_NVIDIA_TOOLS` 在用 Nsight 或 Compute Sanitizer 时跳过内部 profiler, 开启期间报出的内部计时只是占位值; `EP_DISABLE_BARRIER_PROFILING` 关掉每次被测迭代之前插入的 barrier 与延迟.

### Network configurations

DeepEP is fully tested with InfiniBand networks. However, it is theoretically compatible with RDMA over Converged Ethernet (RoCE) as well.

DeepEP 在 InfiniBand 网络上做过完整测试, 理论上也兼容 RoCE.

#### Traffic isolation

Traffic isolation is supported by InfiniBand through Virtual Lanes (VL).

To prevent interference between different types of traffic, we recommend segregating workloads across different virtual lanes as follows:

- expert-parallel workloads
- other workloads

InfiniBand 通过虚拟通道 (VL) 支持流量隔离. 为避免不同类型的流量互相干扰, 建议把专家并行负载与其余负载放到不同的虚拟通道.

Select the RDMA service level through the buffer's `sl_idx` argument. The precedence is `EP_OVERRIDE_RDMA_SL` > `sl_idx` > `EP_DEFAULT_RDMA_SL` > NCCL's default. The fabric's SL-to-VL mapping determines which virtual lane carries that traffic.

RDMA 服务等级通过 buffer 的 `sl_idx` 参数选择. 优先级是 `EP_OVERRIDE_RDMA_SL` 高于 `sl_idx`, 高于 `EP_DEFAULT_RDMA_SL`, 高于 NCCL 默认值. 流量最终走哪条虚拟通道, 由网络的 SL 到 VL 映射决定.

#### Adaptive routing

Adaptive routing is an advanced routing feature provided by InfiniBand switches that can evenly distribute traffic across multiple paths. Even though adaptive routing introduces additional latency, we still recommend enabling it under all network load conditions.

自适应路由是 InfiniBand 交换机提供的高级路由特性, 能把流量均匀铺到多条路径上. 尽管它会带来额外延迟, 仍建议在所有网络负载条件下都打开.

> **对一下:** 自适应路由这条建议在 V1 与 V2.5 两版文档里不一样, 以哪一版为准?
> 答: 以 V2.5 为准. V1 的 [`docs/legacy.md`](https://github.com/deepseek-ai/DeepEP/blob/a56d615/docs/legacy.md) 写的是重载环境打开, 轻载环境用静态路由; 当前 README 改成「所有负载条件下都打开」. 拥塞控制的说法也变了: V1 说生产环境没观察到明显拥塞所以关掉, V2.5 说先验证网络配置再关, 拥塞避不开时把这类负载放到低优先级的虚拟通道. 两版对应的代码路径也不同, V1 经 NVSHMEM 的 `NVSHMEM_IB_SL` 选服务等级, V2.5 经 [`csrc/kernels/comm/context.cpp`](https://github.com/deepseek-ai/DeepEP/blob/main/csrc/kernels/comm/context.cpp) 把 `sl_idx` 写进 NCCL 的 `ginTrafficClass`. 仓库里没有说明建议改变的原因.

#### Congestion control

For maximum-bandwidth workloads, we recommend disabling congestion control after validating the fabric configuration. If congestion is unavoidable, place those workloads on lower-priority virtual lanes. DeepEP does not configure congestion control on the fabric.

对追求最大带宽的负载, 建议在验证过网络配置之后关闭拥塞控制. 如果拥塞无法避免, 就把这类负载放到优先级较低的虚拟通道上. DeepEP 不会替网络配置拥塞控制.

#### PCI atomic mode

If the hardware supports it, we recommend using the following command to set the NIC's `PCI_ATOMIC_MODE` to improve RDMA atomic operation performance:

如果硬件支持, 建议用下面的命令设置网卡的 `PCI_ATOMIC_MODE`, 提升 RDMA 原子操作的性能:

```bash
# Replace mlx5_0 with the target NIC
sudo mlxconfig -y -d mlx5_0 set PCI_ATOMIC_MODE=4
```

### Experimental branches

The following links describe separate implementations and research branches. Their features and dependencies apply to those branches; consult each branch before integrating it with the current API.

下面这些链接指向独立的实现与研究分支. 其中的特性与依赖只适用于对应分支, 要与当前 API 集成, 先看各分支自己的说明.

- [Zero-copy](https://github.com/deepseek-ai/DeepEP/pull/453)
    - Removing the copy between PyTorch tensors and communication buffers, which reduces the SM usages significantly for normal kernels
    - This PR is authored by **Tencent Network Platform Department**
- [Eager](https://github.com/deepseek-ai/DeepEP/pull/437)
    - Using a low-latency protocol removes the extra RTT latency introduced by RDMA atomic OPs
- [Hybrid-EP](https://github.com/deepseek-ai/DeepEP/tree/hybrid-ep)
    - A new backend implementation using TMA instructions for minimal SM usage and larger NVLink domain support
    - Fine-grained communication-computation overlap for single-batch scenarios
    - PCIe kernel support for non-NVLink environments
    - NVFP4 data type support
- [AntGroup-Opt](https://github.com/deepseek-ai/DeepEP/tree/antgroup-opt)
    - This optimization series is authored by **AntGroup Network Platform Department**
    - [Normal-SMFree](https://github.com/deepseek-ai/DeepEP/pull/347) Eliminating SM from RDMA path by decoupling comm-kernel execution from NIC token transfer, freeing SMs for compute
    - [LL-SBO](https://github.com/deepseek-ai/DeepEP/pull/483) Overlapping Down GEMM computation with Combine Send communication via signaling mechanism to reduce end-to-end latency
    - [LL-Layered](https://github.com/deepseek-ai/DeepEP/pull/500) Optimizing cross-node LL operator communication using rail-optimized forwarding and data merging to reduce latency
- [Mori-EP](https://github.com/deepseek-ai/DeepEP/tree/mori-ep)
    - ROCm/AMD GPU support powered by [MORI](https://github.com/ROCm/mori) backend (low-latency mode)
- [nvDev](https://github.com/deepseek-ai/DeepEP/tree/nvDev)
    - V2-based branch with the latest CUDA features, such as Compute Fabric Transport (CFT) that brings better latency on small token sizes.

各分支的内容. Zero-copy 去掉 PyTorch 张量与通信缓冲区之间的拷贝, 明显降低 normal kernel 的 SM 占用, 作者是腾讯网络平台部. Eager 改用一种低延迟协议, 省掉 RDMA 原子操作带来的额外一次 RTT. Hybrid-EP 是一套新的后端实现, 用 TMA 指令把 SM 占用压到最低并支持更大的 NVLink 域, 提供单 batch 场景下的细粒度通信计算重叠, 为没有 NVLink 的环境提供 PCIe kernel, 并支持 NVFP4 数据类型. AntGroup-Opt 是蚂蚁集团网络平台部的优化系列: Normal-SMFree 把通信 kernel 的执行与网卡上的 token 传输解耦, 让 RDMA 路径不再占 SM, 把 SM 留给计算; LL-SBO 用信号机制把 Down GEMM 的计算与 combine 的发送重叠, 降低端到端延迟; LL-Layered 用按 rail 优化的转发与数据合并改进跨节点 LL 算子的通信, 降低延迟. Mori-EP 基于 MORI 后端提供 ROCm/AMD GPU 支持 (低延迟模式). nvDev 是基于 V2 的分支, 用上最新的 CUDA 特性, 比如在 token 数少时延迟更好的 Compute Fabric Transport (CFT).

### Community forks

- [uccl/uccl-ep](https://github.com/uccl-project/uccl/tree/main/ep) - Enables running DeepEP on heterogeneous GPUs (e.g., Nvidia, AMD) and NICs (e.g., EFA, Broadcom, CX7)
- [Infrawaves/DeepEP_ibrc_dual-ports_multiQP](https://github.com/Infrawaves/DeepEP_ibrc_dual-ports_multiQP) - Adds multi-QP solution and dual-port NIC support in IBRC transport
- [antgroup/DeepXTrace](https://github.com/antgroup/DeepXTrace) - A diagnostic analyzer for efficient and precise localization of slow ranks
- [ROCm/mori](https://github.com/ROCm/mori) - AMD's next-generation communication library for performance-critical AI workloads (e.g., Wide EP, KVCache transfer, Collectives)

社区分支. uccl-ep 让 DeepEP 能跑在异构 GPU (如 Nvidia, AMD) 与异构网卡 (如 EFA, Broadcom, CX7) 上. Infrawaves 的分支在 IBRC 传输里加入多 QP 方案与双口网卡支持. DeepXTrace 是一个诊断分析工具, 用来高效, 准确地定位慢 rank. ROCm/mori 是 AMD 面向性能敏感 AI 负载 (如 Wide EP, KVCache 传输, 集合通信) 的新一代通信库.

### Acknowledgement

DeepEP is built on top of the [NCCL](https://github.com/nvidia/nccl) Gin backend. Thanks to [@sjeaugey](https://github.com/sjeaugey), [@pakmarkthub](https://github.com/pakmarkthub), [@sb17v](https://github.com/sb17v), [@xiaofanl-nvidia](https://github.com/xiaofanl-nvidia), and the NCCL team for their support!

We also acknowledge [MoonEP](https://github.com/MoonshotAI/MoonEP) and [UltraEP](https://github.com/Dots-Infra/UltraEP) for their work on dynamic expert replication and the weight/gradient exchange that supports expert load balancing.

致谢. DeepEP 构建在 NCCL 的 Gin 后端之上, 感谢 NCCL 团队及几位成员的支持. 也感谢 MoonEP 与 UltraEP 在动态专家复制, 以及支撑专家负载均衡的权重与梯度交换上的工作.

### License

This code repository is released under [the MIT License](https://github.com/deepseek-ai/DeepEP/blob/main/LICENSE).

本仓库以 MIT 许可证发布.

### Citation

```bibtex
@misc{deepep2025,
      title={DeepEP: an efficient expert-parallel communication library},
      author={Chenggang Zhao and Shangyan Zhou and Liyue Zhang and Chengqi Deng and Zhean Xu and Yuxuan Liu and Kuai Yu and Jiashi Li and Liang Zhao},
      year={2025},
      publisher = {GitHub},
      howpublished = {\url{https://github.com/deepseek-ai/DeepEP}},
}
```

## docs/legacy.md

> **Note:** This is the archived documentation for DeepEP V1 (NVSHMEM-based). For the latest V2 documentation, see the [main README](https://github.com/deepseek-ai/DeepEP/blob/main/README.md).

> 说明: 这是 DeepEP V1 (基于 NVSHMEM) 的归档文档. 最新的 V2 文档见主 README.

DeepEP (DeepEveryParallel) V1 is the original high-performance communication library for modern machine learning, focused on expert parallelism (EP). It provides high-throughput and low-latency all-to-all GPU kernels, which are also known as MoE dispatch and combine. The library also supports low-precision operations, including FP8.

DeepEP (DeepEveryParallel) V1 是最初那版面向现代机器学习的高性能通信库, 聚焦专家并行 (EP). 它提供高吞吐, 低延迟的 all-to-all GPU kernel, 也就是通常说的 MoE dispatch 与 combine. 这个库也支持包括 FP8 在内的低精度操作.

To align with the group-limited gating algorithm proposed in the [DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-V3) paper, DeepEP V1 offers a set of kernels optimized for asymmetric-domain bandwidth forwarding, such as forwarding data from NVLink domain to RDMA domain. These kernels deliver high throughput, making them suitable for both training and inference prefilling tasks. Additionally, they support SM (Streaming Multiprocessors) number control.

为了配合 DeepSeek-V3 论文提出的组限制门控算法, DeepEP V1 提供了一组针对非对称域带宽转发优化的 kernel, 比如把数据从 NVLink 域转发到 RDMA 域. 这组 kernel 吞吐高, 适合训练与推理 prefill. 它们还支持控制 SM (Streaming Multiprocessor) 的数量.

For latency-sensitive inference decoding, DeepEP V1 includes a set of low-latency kernels with pure RDMA to minimize delays. The library also introduces a hook-based communication-computation overlapping method that does not occupy any SM resource.

对延迟敏感的推理 decode, DeepEP V1 提供了一组纯 RDMA 的低延迟 kernel, 把时延压到最小. 这个库还引入了一种基于 hook 的通信计算重叠方法, 不占用任何 SM 资源.

Notice: the implementation in this library may have some slight differences from the [DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-V3) paper.

注意: 本库的实现与 DeepSeek-V3 论文可能有一些细微差别.

### Performance (V1)

#### Normal kernels with NVLink and RDMA forwarding

We test normal kernels on H800 (~160 GB/s NVLink maximum bandwidth), with each connected to a CX7 InfiniBand 400 Gb/s RDMA network card (~50 GB/s maximum bandwidth). And we follow the DeepSeek-V3/R1 pretraining setting (4096 tokens per batch, 7168 hidden, top-4 groups, top-8 experts, FP8 dispatching and BF16 combining).

normal kernel 在 H800 上测试 (NVLink 最大带宽约 160 GB/s), 每张卡接一块 CX7 InfiniBand 400 Gb/s 的 RDMA 网卡 (最大带宽约 50 GB/s). 配置按 DeepSeek-V3/R1 的预训练设置: 每批 4096 个 token, hidden 7168, top-4 组, top-8 专家, FP8 dispatch 与 BF16 combine.

|   Type    | Dispatch #EP | Bottleneck bandwidth | Combine #EP | Bottleneck bandwidth |
|:---------:|:------------:|:--------------------:|:-----------:|:--------------------:|
| Intranode |      8       |  153 GB/s (NVLink)   |      8      |  158 GB/s (NVLink)   |
| Internode |      16      |    43 GB/s (RDMA)    |     16      |    43 GB/s (RDMA)    |
| Internode |      32      |    58 GB/s (RDMA)    |     32      |    57 GB/s (RDMA)    |
| Internode |      64      |    51 GB/s (RDMA)    |     64      |    50 GB/s (RDMA)    |

#### Low-latency kernels with pure RDMA

We test low-latency kernels on H800 with each connected to a CX7 InfiniBand 400 Gb/s RDMA network card (~50 GB/s maximum bandwidth). And we follow a typical DeepSeek-V3/R1 production setting (128 tokens per batch, 7168 hidden, top-8 experts, FP8 dispatching and BF16 combining).

低延迟 kernel 同样在 H800 上测试, 每张卡接一块 CX7 InfiniBand 400 Gb/s 的 RDMA 网卡 (最大带宽约 50 GB/s). 配置按 DeepSeek-V3/R1 的典型生产设置: 每批 128 个 token, hidden 7168, top-8 专家, FP8 dispatch 与 BF16 combine.

| Dispatch #EP | Latency | RDMA bandwidth | Combine #EP | Latency | RDMA bandwidth |
|:------------:|:-------:|:--------------:|:-----------:|:-------:|:--------------:|
|      8       |  77 us  |    98 GB/s     |      8      | 114 us  |    127 GB/s    |
|      16      | 118 us  |    63 GB/s     |     16      | 195 us  |    74 GB/s     |
|      32      | 155 us  |    48 GB/s     |     32      | 273 us  |    53 GB/s     |
|      64      | 173 us  |    43 GB/s     |     64      | 314 us  |    46 GB/s     |
|     128      | 192 us  |    39 GB/s     |     128     | 369 us  |    39 GB/s     |
|     256      | 194 us  |    39 GB/s     |     256     | 360 us  |    40 GB/s     |

> **看表:** 低延迟表里 EP=8 的 dispatch 写着 98 GB/s, combine 写着 127 GB/s, 都超过了网卡上限 50 GB/s, 这是怎么回事?
> 答: 表里的带宽是逻辑带宽, 不是网卡口径. [`tests/test_low_latency.py`](https://github.com/deepseek-ai/DeepEP/blob/567632d/tests/test_low_latency.py) 的算法是给每个 token 的每一个有效 top-k 选择都记一份消息字节 (dispatch 按 `hidden + hidden / 128 * 4 + 16`, combine 按 `hidden * 2`), 再除以 kernel 时间, 落在本卡和同节点的那部分也算在内. 2025-05-23 的提交 `aae9fa9` 又让 low-latency 默认走 NVLink: [`csrc/kernels/internode_ll.cu`](https://github.com/deepseek-ai/DeepEP/blob/567632d/csrc/kernels/internode_ll.cu) 里 `nvshmemi_get_p2p_ptr` 对同一 NVLink 域的目标返回非零指针, 走 `UNROLLED_WARP_COPY` 直接拷, 不发 RDMA. EP=8 时八个 rank 都在一台机器里, 这一行量到的基本是 NVLink 加本地拷贝. EP 越大, 同节点的占比越低, 到 EP=128 与 256 回落到 39 到 40 GB/s. 初版 README (提交 `ebfe47e`) 这一行是 46 GB/s, 当时还没有 NVLink 旁路. V2 的 README 把「logical bandwidth, 含本地 rank 流量」写进了表注, V1 的文档没写.

### Quick Start (V1)

#### Requirements

- Ampere (SM80), Hopper (SM90) GPUs, or other architectures with SM90 PTX ISA support
- Python 3.8 and above
- CUDA version
    - CUDA 11.0 and above for SM80 GPUs
    - CUDA 12.3 and above for SM90 GPUs
- PyTorch 2.1 and above
- NVLink for intranode communication
- RDMA network for internode communication

V1 的环境要求: Ampere (SM80), Hopper (SM90) 或其他支持 SM90 PTX ISA 的架构; Python 3.8 及以上; SM80 需要 CUDA 11.0 及以上, SM90 需要 CUDA 12.3 及以上; PyTorch 2.1 及以上; 节点内 NVLink; 跨节点 RDMA 网络.

#### Download and install NVSHMEM dependency

DeepEP V1 depends on NVSHMEM. Please refer to the NVSHMEM Installation Guide for instructions.

DeepEP V1 依赖 NVSHMEM, 安装方法见 NVSHMEM 安装指南.

#### Development

```bash
# Build and make symbolic links for SO files
NVSHMEM_DIR=/path/to/installed/nvshmem python setup.py build
# You may modify the specific SO names according to your own platform
ln -s build/lib.linux-x86_64-cpython-38/deep_ep_cpp.cpython-38-x86_64-linux-gnu.so

# Run test cases
# NOTES: you may modify the `init_dist` function in `tests/utils.py`
# according to your own cluster settings, and launch into multiple nodes
python tests/test_intranode.py
python tests/test_internode.py
python tests/test_low_latency.py
```

#### Installation

```bash
NVSHMEM_DIR=/path/to/installed/nvshmem python setup.py install
```

##### Installation environment variables

- `NVSHMEM_DIR`: the path to the NVSHMEM directory, disable all internode and low-latency features if not specified
- `DISABLE_SM90_FEATURES`: 0 or 1, whether to disable SM90 features, it is required for SM90 devices or CUDA 11
- `TORCH_CUDA_ARCH_LIST`: the list of target architectures, e.g. `TORCH_CUDA_ARCH_LIST="9.0"`
- `DISABLE_AGGRESSIVE_PTX_INSTRS`: 0 or 1, whether to disable aggressive load/store instructions, see [Undefined-behavior PTX usage](https://github.com/deepseek-ai/DeepEP/blob/a56d615/docs/legacy.md#undefined-behavior-ptx-usage) for more details

安装期环境变量的作用: `NVSHMEM_DIR` 指向 NVSHMEM 目录, 不指定就会关掉全部跨节点与低延迟特性; `DISABLE_SM90_FEATURES` 控制是否关闭 SM90 特性, 原文写「SM90 设备或 CUDA 11 需要它」 (见下方问答); `TORCH_CUDA_ARCH_LIST` 是目标架构列表; `DISABLE_AGGRESSIVE_PTX_INSTRS` 控制是否关掉激进的 load/store 指令, 细节见后面的未定义行为 PTX 一节.

> **问:** 「SM90 设备或 CUDA 11 需要关掉 SM90 特性」读起来不对, SM90 设备为什么要关 SM90 特性?
> 答: 原文这里写反了, 以代码为准. [`setup.py`](https://github.com/deepseek-ai/DeepEP/blob/567632d/setup.py) 里 `DISABLE_SM90_FEATURES=1` 的分支把 `TORCH_CUDA_ARCH_LIST` 默认设成 `8.0` (注释是 Prefer A100), 关掉 FP8, 新的 launch 方式与 TMA, 并断言 `disable_nvshmem`, 也就是同时关掉跨节点与 low-latency kernel; 不设这个变量时默认目标是 `9.0` (注释是 Prefer H800 series). 所以需要它的是非 SM90 设备 (A100 这类 SM80) 或 CUDA 11 环境, 而且这类环境下 V1 只剩节点内的 normal kernel, 与路线图里「A100 support (intranode only)」一致. 目标架构不是 `9.0` 时, `setup.py` 还会强制 `DISABLE_AGGRESSIVE_PTX_INSTRS=1`.

### Network Configurations (V1)

DeepEP is fully tested with InfiniBand networks. However, it is theoretically compatible with RDMA over Converged Ethernet (RoCE) as well.

DeepEP 在 InfiniBand 网络上做过完整测试, 理论上也兼容 RoCE.

#### Traffic isolation

Traffic isolation is supported by InfiniBand through Virtual Lanes (VL).

To prevent interference between different types of traffic, we recommend segregating workloads across different virtual lanes as follows:

- workloads using normal kernels
- workloads using low-latency kernels
- other workloads

InfiniBand 通过虚拟通道 (VL) 支持流量隔离. 为避免不同类型流量互相干扰, 建议把负载分成三类放到不同虚拟通道: 用 normal kernel 的负载, 用 low-latency kernel 的负载, 以及其余负载.

For DeepEP V1, you can control the virtual lane assignment by setting the `NVSHMEM_IB_SL` environment variable.

在 DeepEP V1 里, 用 `NVSHMEM_IB_SL` 环境变量控制虚拟通道的分配.

#### Adaptive routing

Adaptive routing is an advanced routing feature provided by InfiniBand switches that can evenly distribute traffic across multiple paths. Enabling adaptive routing can completely eliminate network congestion caused by routing conflicts, but it also introduces additional latency. We recommend the following configuration for optimal performance:

- enable adaptive routing in environments with heavy network loads
- use static routing in environments with light network loads

自适应路由是 InfiniBand 交换机提供的高级路由特性, 可以把流量均匀铺到多条路径上. 打开它能彻底消除路由冲突造成的网络拥塞, 但也会带来额外延迟. 为取得最佳性能, 建议重载环境打开自适应路由, 轻载环境改用静态路由.

#### Congestion control

Congestion control is disabled as we have not observed significant congestion in our production environment.

拥塞控制是关闭的, 因为在生产环境里没有观察到明显的拥塞.

### Interfaces and Examples (V1)

#### Example use in model training or inference prefilling

The normal kernels can be used in model training or the inference prefilling phase (without the backward part) as the below example code shows.

normal kernel 可以用在模型训练或推理 prefill 阶段 (prefill 不含反向), 用法见下面的示例代码.

```python
import torch
import torch.distributed as dist
from typing import List, Tuple, Optional, Union

from deep_ep import Buffer, EventOverlap

# Communication buffer (will allocate at runtime)
_buffer: Optional[Buffer] = None

# Set the number of SMs to use
# NOTES: this is a static variable
Buffer.set_num_sms(24)


# You may call this function at the framework initialization
def get_buffer(group: dist.ProcessGroup, hidden_bytes: int) -> Buffer:
    global _buffer

    # NOTES: you may also replace `get_*_config` with your auto-tuned results via all the tests
    num_nvl_bytes, num_rdma_bytes = 0, 0
    for config in (Buffer.get_dispatch_config(group.size()), Buffer.get_combine_config(group.size())):
        num_nvl_bytes = max(config.get_nvl_buffer_size_hint(hidden_bytes, group.size()), num_nvl_bytes)
        num_rdma_bytes = max(config.get_rdma_buffer_size_hint(hidden_bytes, group.size()), num_rdma_bytes)

    # Allocate a buffer if not existed or not enough buffer size
    if _buffer is None or _buffer.group != group or _buffer.num_nvl_bytes < num_nvl_bytes or _buffer.num_rdma_bytes < num_rdma_bytes:
        _buffer = Buffer(group, num_nvl_bytes, num_rdma_bytes)
    return _buffer


def get_hidden_bytes(x: torch.Tensor) -> int:
    t = x[0] if isinstance(x, tuple) else x
    return t.size(1) * max(t.element_size(), 2)


def dispatch_forward(x: Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]],
                     topk_idx: torch.Tensor, topk_weights: torch.Tensor,
                     num_experts: int, previous_event: Optional[EventOverlap] = None) -> \
        Tuple[Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]], torch.Tensor, torch.Tensor, List, Tuple, EventOverlap]:
    # NOTES: an optional `previous_event` means a CUDA event captured that you want to make it as a dependency
    # of the dispatch kernel, it may be useful with communication-computation overlap. For more information, please
    # refer to the docs of `Buffer.dispatch`
    global _buffer

    # Calculate layout before actual dispatch
    num_tokens_per_rank, num_tokens_per_rdma_rank, num_tokens_per_expert, is_token_in_rank, previous_event = \
        _buffer.get_dispatch_layout(topk_idx, num_experts,
                                    previous_event=previous_event, async_finish=True,
                                    allocate_on_comm_stream=previous_event is not None)
    # Do MoE dispatch
    # NOTES: the CPU will wait for GPU's signal to arrive, so this is not compatible with CUDA graph
    # Unless you specify `num_worst_tokens`, but this flag is for intranode only
    # For more advanced usages, please refer to the docs of the `dispatch` function
    recv_x, recv_topk_idx, recv_topk_weights, num_recv_tokens_per_expert_list, handle, event = \
        _buffer.dispatch(x, topk_idx=topk_idx, topk_weights=topk_weights,
                         num_tokens_per_rank=num_tokens_per_rank, num_tokens_per_rdma_rank=num_tokens_per_rdma_rank,
                         is_token_in_rank=is_token_in_rank, num_tokens_per_expert=num_tokens_per_expert,
                         previous_event=previous_event, async_finish=True,
                         allocate_on_comm_stream=True)
    # For event management, please refer to the docs of the `EventOverlap` class
    return recv_x, recv_topk_idx, recv_topk_weights, num_recv_tokens_per_expert_list, handle, event


def dispatch_backward(grad_recv_x: torch.Tensor, grad_recv_topk_weights: torch.Tensor, handle: Tuple) -> \
        Tuple[torch.Tensor, torch.Tensor, EventOverlap]:
    global _buffer

    # The backward process of MoE dispatch is actually a combine
    # For more advanced usages, please refer to the docs of the `combine` function
    combined_grad_x, combined_grad_recv_topk_weights, event = \
        _buffer.combine(grad_recv_x, handle, topk_weights=grad_recv_topk_weights, async_finish=True)

    # For event management, please refer to the docs of the `EventOverlap` class
    return combined_grad_x, combined_grad_recv_topk_weights, event


def combine_forward(x: torch.Tensor, handle: Tuple, previous_event: Optional[EventOverlap] = None) -> \
        Tuple[torch.Tensor, EventOverlap]:
    global _buffer

    # Do MoE combine
    # For more advanced usages, please refer to the docs of the `combine` function
    combined_x, _, event = _buffer.combine(x, handle, async_finish=True, previous_event=previous_event,
                                           allocate_on_comm_stream=previous_event is not None)

    # For event management, please refer to the docs of the `EventOverlap` class
    return combined_x, event


def combine_backward(grad_combined_x: Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]],
                     handle: Tuple, previous_event: Optional[EventOverlap] = None) -> \
        Tuple[Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]], EventOverlap]:
    global _buffer

    # The backward process of MoE combine is actually a dispatch
    # For more advanced usages, please refer to the docs of the `dispatch` function
    grad_x, _, _, _, _, event = _buffer.dispatch(grad_combined_x, handle=handle, async_finish=True,
                                                 previous_event=previous_event,
                                                 allocate_on_comm_stream=previous_event is not None)

    # For event management, please refer to the docs of the `EventOverlap` class
    return grad_x, event
```

Moreover, inside the dispatch function, we may not know how many tokens to receive for the current rank. So an implicit CPU wait for GPU received count signal will be involved, as the following figure shows.

另外, 在 dispatch 函数内部, 当前 rank 事先并不知道自己要收多少 token, 因此会隐式地让 CPU 等一个 GPU 发来的接收计数信号, 流程见仓库里的 [normal 示意图](https://github.com/deepseek-ai/DeepEP/blob/a56d615/figures/normal.png).

#### Example use in inference decoding

The low latency kernels can be used in the inference decoding phase as the below example code shows.

low-latency kernel 可以用在推理 decode 阶段, 用法见下面的示例代码.

```python
import torch
import torch.distributed as dist
from typing import Tuple, Optional

from deep_ep import Buffer

# Communication buffer (will allocate at runtime)
# NOTES: there is no SM control API for the low-latency kernels
_buffer: Optional[Buffer] = None


# You may call this function at the framework initialization
def get_buffer(group: dist.ProcessGroup, num_max_dispatch_tokens_per_rank: int, hidden: int, num_experts: int) -> Buffer:
    # NOTES: the low-latency mode will consume much more space than the normal mode
    # So we recommend that `num_max_dispatch_tokens_per_rank` (the actual batch size in the decoding engine) should be less than 256
    global _buffer
    num_rdma_bytes = Buffer.get_low_latency_rdma_size_hint(num_max_dispatch_tokens_per_rank, hidden, group.size(), num_experts)

    # Allocate a buffer if not existed or not enough buffer size
    if _buffer is None or _buffer.group != group or not _buffer.low_latency_mode or _buffer.num_rdma_bytes < num_rdma_bytes:
        # NOTES: for the best performance, the QP number **must** be equal to the number of the local experts
        assert num_experts % group.size() == 0
        _buffer = Buffer(group, 0, num_rdma_bytes, low_latency_mode=True, num_qps_per_rank=num_experts // group.size())
    return _buffer


def low_latency_dispatch(hidden_states: torch.Tensor, topk_idx: torch.Tensor, num_max_dispatch_tokens_per_rank: int, num_experts: int):
    global _buffer

    # Do MoE dispatch, compatible with CUDA graph (but you may restore some buffer status once you replay)
    recv_hidden_states, recv_expert_count, handle, event, hook = \
        _buffer.low_latency_dispatch(hidden_states, topk_idx, num_max_dispatch_tokens_per_rank, num_experts,
                                     async_finish=False, return_recv_hook=True)

    # NOTES: the actual tensor will not be received only if you call `hook()`,
    # it is useful for double-batch overlapping, but **without any SM occupation**
    # If you don't want to overlap, please set `return_recv_hook=False`
    # Later, you can use our GEMM library to do the computation with this specific format
    return recv_hidden_states, recv_expert_count, handle, event, hook


def low_latency_combine(hidden_states: torch.Tensor,
                        topk_idx: torch.Tensor, topk_weights: torch.Tensor, handle: Tuple):
    global _buffer

    # Do MoE combine, compatible with CUDA graph (but you may restore some buffer status once you replay)
    combined_hidden_states, event_overlap, hook = \
        _buffer.low_latency_combine(hidden_states, topk_idx, topk_weights, handle,
                                    async_finish=False, return_recv_hook=True)

    # NOTES: the same behavior as described in the dispatch kernel
    return combined_hidden_states, event_overlap, hook
```

For two-micro-batch overlapping, you can refer to the following figure. With our receiving hook interface, the RDMA network traffic is happening in the background, without costing any GPU SMs from the computation part. But notice, the overlapped parts can be adjusted, i.e., the 4 parts of attention/dispatch/MoE/combine may not have the exact same execution time. You may adjust the stage settings according to your workload.

双 micro-batch 重叠的做法见仓库里的 [low-latency 示意图](https://github.com/deepseek-ai/DeepEP/blob/a56d615/figures/low-latency.png). 有了接收 hook 接口, RDMA 的网络流量在后台进行, 不占用计算那一侧的任何 GPU SM. 但要注意重叠的分段是可以调的: attention, dispatch, MoE, combine 这四段的执行时间不一定完全相等, 可以按自己的负载调整分段设置.

### Roadmap (V1)

- [x] AR support
- [x] Refactor low-latency mode AR code
- [x] A100 support (intranode only)
- [x] Support BF16 for the low-latency dispatch kernel
- [x] Support NVLink protocol for intranode low-latency kernels
- [ ] TMA copy instead of LD/ST
    - [x] Intranode kernels
    - [ ] Internode kernels
    - [ ] Low-latency kernels
- [ ] SM-free kernels and refactors
- [ ] Fully remove undefined-behavior PTX instructions

V1 路线图里已完成的是: 自适应路由支持与低延迟模式下相关代码的重构, A100 的节点内支持, 低延迟 dispatch 的 BF16, 以及节点内低延迟 kernel 的 NVLink 协议. 未完成的是: 把 LD/ST 全换成 TMA 拷贝 (节点内已完成, 跨节点与低延迟未完成), 免 SM 的 kernel 与相应重构, 以及彻底去掉未定义行为的 PTX 指令.

### Notices (V1)

#### Easier potential overall design

The V1 implementation uses queues for communication buffers which save memory but introduce complexity and potential deadlocks. If you're implementing your own version based on DeepEP V1, consider using fixed-size buffers allocated to maximum capacity for simplicity and better performance. For a detailed discussion of this alternative approach, see https://github.com/deepseek-ai/DeepEP/issues/39.

V1 的实现用队列来管理通信 buffer, 省内存, 但带来了复杂度和潜在的死锁. 如果要基于 V1 自己实现一版, 可以考虑直接按最大容量分配定长 buffer, 更简单也更快. 这个替代方案的详细讨论见 issue 39.

#### Undefined-behavior PTX usage

- For extreme performance, we discover and use an undefined-behavior PTX usage: using read-only PTX `ld.global.nc.L1::no_allocate.L2::256B` to **read volatile data**. The PTX modifier `.nc` indicates that a non-coherent cache is used. But the correctness is tested to be guaranteed with `.L1::no_allocate` on Hopper architectures, and performance will be much better. The reason we guess may be: the non-coherent cache is unified with L1, and the L1 modifier is not just a hint but a strong option, so that the correctness can be guaranteed by no dirty data in L1.
- Initially, because NVCC could not automatically unroll volatile read PTX, we tried using `__ldg` (i.e., `ld.nc`). Even compared to manually unrolled volatile reads, it was significantly faster (likely due to additional compiler optimizations). However, the results could be incorrect or dirty. After consulting the PTX documentation, we discovered that L1 and non-coherent cache are unified on Hopper architectures. We speculated that `.L1::no_allocate` might resolve the issue, leading to this discovery.
- If you find kernels not working on some other platforms, you may add `DISABLE_AGGRESSIVE_PTX_INSTRS=1` to `setup.py` and disable this, or file an issue.

这一段讲的是一处未定义行为的 PTX 用法. 为了极致性能, 作者用只读的 `ld.global.nc.L1::no_allocate.L2::256B` 去**读 volatile 数据**. `.nc` 修饰符表示走非一致性缓存, 但在 Hopper 架构上配合 `.L1::no_allocate` 实测能保证正确性, 性能也好很多. 作者的猜测是: 非一致性缓存与 L1 是统一的, 而 L1 修饰符不只是提示而是强约束, L1 里不会有脏数据, 正确性因此得到保证.

起因是 NVCC 无法自动展开 volatile 读的 PTX, 于是改试 `__ldg` (即 `ld.nc`). 即便与手工展开的 volatile 读相比, 它也明显更快 (很可能来自额外的编译器优化), 但结果可能不正确或是脏数据. 查了 PTX 文档发现 Hopper 上 L1 与非一致性缓存统一, 推测 `.L1::no_allocate` 能解决问题, 于是有了这个发现. 如果在别的平台上 kernel 跑不通, 可以在 `setup.py` 里加 `DISABLE_AGGRESSIVE_PTX_INSTRS=1` 把它关掉, 或者提 issue.

#### Auto-tuning on your cluster

For better performance on your cluster, we recommend to run all the tests and use the best auto-tuned configuration. The default configurations are optimized on the DeepSeek's internal cluster.

为了在自己的集群上拿到更好的性能, 建议把所有测试跑一遍, 用自动调出来的最佳配置. 默认配置是在 DeepSeek 内部集群上调的.

> **回看:** V1 说要自动调参, V2 说「解析式算出 SM 与 QP 数, 不再需要自动调参」, 中间被换掉的是什么?
> 答: 被换掉的是 V1 [`deep_ep/buffer.py`](https://github.com/deepseek-ai/DeepEP/blob/567632d/deep_ep/buffer.py) 里 `get_dispatch_config` 与 `get_combine_config` 那两张按 EP 规模预设的表, 每项是一个 `Config`, 除 SM 数外给出 NVLink 与 RDMA 两侧的 chunk 发送与接收 token 数共四个参数, 从 EP2 一直列到 EP160. V2 的 [`deep_ep/buffers/ep.py`](https://github.com/deepseek-ai/DeepEP/blob/main/deep_ep/buffers/ep.py) 用 `get_theoretical_num_sms` 取代: 它先用组合数算出每个 token 期望命中的 scale-out 与 scale-up rank 数, 再按 RDMA 与 NVLink 的实测带宽 (由 `ibstat` 与 `nvidia-smi nvlink -s` 探测) 判断哪一侧是瓶颈, 最后用「每 SM 的读写带宽」把 SM 数解出来. QP 数由 `get_theoretical_num_qps` 给出: direct 模式取 `min(num_sms, 9)`, hybrid 模式取 `num_sms * 16 + 1`.

## docs/nvshmem.md

### Important notices

**This project is neither sponsored nor supported by NVIDIA.**

**Use of NVIDIA NVSHMEM is governed by the terms at [NVSHMEM Software License Agreement](https://docs.nvidia.com/nvshmem/api/sla.html).**

重要声明: 本项目既不由 NVIDIA 赞助, 也不由其提供支持. 使用 NVIDIA NVSHMEM 须遵守 NVSHMEM 软件许可协议的条款.

### Prerequisites

Hardware requirements:
   - GPUs inside one node needs to be connected by NVLink
   - GPUs across different nodes needs to be connected by RDMA devices, see [GPUDirect RDMA Documentation](https://docs.nvidia.com/cuda/gpudirect-rdma/)
   - InfiniBand GPUDirect Async (IBGDA) support, see [IBGDA Overview](https://developer.nvidia.com/blog/improving-network-performance-of-hpc-systems-using-nvidia-magnum-io-nvshmem-and-gpudirect-async/)
   - For more detailed requirements, see [NVSHMEM Hardware Specifications](https://docs.nvidia.com/nvshmem/release-notes-install-guide/install-guide/abstract.html#hardware-requirements)

Software requirements:
   - NVSHMEM v3.3.9 or later

硬件要求: 节点内 GPU 之间要有 NVLink; 跨节点 GPU 之间要有 RDMA 设备; 要支持 InfiniBand GPUDirect Async (IBGDA); 更详细的要求见 NVSHMEM 硬件规格文档. 软件要求是 NVSHMEM v3.3.9 或更新版本.

### Installation procedure

#### 1. Install NVSHMEM binaries

NVSHMEM 3.3.9 binaries are available in several formats:
   - Tarballs for  [x86_64](https://developer.download.nvidia.com/compute/nvshmem/redist/libnvshmem/linux-x86_64/libnvshmem-linux-x86_64-3.3.9_cuda12-archive.tar.xz) and [aarch64](https://developer.download.nvidia.com/compute/nvshmem/redist/libnvshmem/linux-sbsa/libnvshmem-linux-sbsa-3.3.9_cuda12-archive.tar.xz)
   - RPM and deb packages: instructions can be found on the [NVSHMEM installer page](https://developer.nvidia.com/nvshmem-downloads?target_os=Linux)
   - Conda packages through conda-forge
   - pip wheels through PyPI: `pip install nvidia-nvshmem-cu12`

DeepEP is compatible with upstream NVSHMEM 3.3.9 and later.

NVSHMEM 3.3.9 的二进制有几种形式: x86_64 与 aarch64 的 tarball; RPM 与 deb 包; conda-forge 上的 conda 包; PyPI 上的 pip wheel. DeepEP 与上游 NVSHMEM 3.3.9 及更新版本兼容.

#### 2. Enable NVSHMEM IBGDA support

NVSHMEM Supports two modes with different requirements. Either of the following methods can be used to enable IBGDA support.

NVSHMEM 支持两种要求不同的模式, 用下面任一种方法都能打开 IBGDA 支持.

##### 2.1 Configure NVIDIA driver

This configuration enables traditional IBGDA support.

Modify `/etc/modprobe.d/nvidia.conf`:

这种配置打开的是传统的 IBGDA 支持. 修改 `/etc/modprobe.d/nvidia.conf`:

```bash
options nvidia NVreg_EnableStreamMemOPs=1 NVreg_RegistryDwords="PeerMappingOverride=1;"
```

Update kernel configuration:

更新内核配置:

```bash
sudo update-initramfs -u
sudo reboot
```

##### 2.2 Install GDRCopy and load the gdrdrv kernel module

This configuration enables IBGDA through asynchronous post-send operations assisted by the CPU. More information about CPU-assisted IBGDA can be found in [this blog](https://developer.nvidia.com/blog/enhancing-application-portability-and-compatibility-across-new-platforms-using-nvidia-magnum-io-nvshmem-3-0/#cpu-assisted_infiniband_gpu_direct_async%C2%A0).
It comes with a small performance penalty, but can be used when modifying the driver regkeys is not an option.

这种配置靠 CPU 协助的异步 post-send 操作来打开 IBGDA, CPU 协助版 IBGDA 的更多信息见 NVIDIA 的博客. 它有一点性能损失, 但在不便改驱动注册键的环境下可以用.

Download GDRCopy. GDRCopy is available as prebuilt deb and rpm packages [here](https://developer.download.nvidia.com/compute/redist/gdrcopy/). or as source code on the [GDRCopy github repository](https://github.com/NVIDIA/gdrcopy).

Install GDRCopy following the instructions on the [GDRCopy github repository](https://github.com/NVIDIA/gdrcopy?tab=readme-ov-file#build-and-installation).

下载 GDRCopy: 既有预编译的 deb 与 rpm 包, 也可以从 GDRCopy 的 GitHub 仓库取源码. 按该仓库的说明安装.

### Post-installation configuration

When not installing NVSHMEM from RPM or deb packages, set the following environment variables in your shell configuration:

如果不是用 RPM 或 deb 包安装 NVSHMEM, 在 shell 配置里设好下面这些环境变量:

```bash
export NVSHMEM_DIR=/path/to/your/dir/to/install  # Use for DeepEP installation
export LD_LIBRARY_PATH="${NVSHMEM_DIR}/lib:$LD_LIBRARY_PATH"
export PATH="${NVSHMEM_DIR}/bin:$PATH"
```

### Verification

```bash
nvshmem-info -a # Should display details of nvshmem
```

安装完成后用 `nvshmem-info -a` 验证, 正常情况下会打印 NVSHMEM 的详细信息.

> **确认:** 这份安装文档要求配驱动的 `NVreg_EnableStreamMemOPs=1` 与 `PeerMappingOverride=1`, 这两项在 V2.5 之后还需要吗?
> 答: 不需要. V2.5 的发布说明写明「Fully remove V1, including its APIs, NVSHMEM backend, and legacy documentation. NVSHMEM is no longer a dependency」, 当前 README 的依赖列表里只剩 NCCL 2.32.3 及以上, 部署前置从「改驱动注册键并重启」变成「装一个与 CUDA 匹配的 NCCL 包」. QP 规划随之换了地方: [`deep_ep/buffers/ep.py`](https://github.com/deepseek-ai/DeepEP/blob/main/deep_ep/buffers/ep.py) 的 `EPBuffer` 在 `allow_hybrid_mode` 下默认分配 65 或 129 个 QP (取决于 `check_fast_rdma_atomic_support` 的结果), 关掉 hybrid 时分配 17 个; 这个数在 [`csrc/kernels/comm/context.cpp`](https://github.com/deepseek-ai/DeepEP/blob/main/csrc/kernels/comm/context.cpp) 里写进 NCCL 的 `ginContextCount`, 取代了 V1 通过 `NVSHMEM_IBGDA_NUM_RC_PER_PE` 环境变量传给 NVSHMEM 的做法.
