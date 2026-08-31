---
title: Awesome-Self-Evolving-Agents：自进化 Agent 资源全景清单
category: 综述
published: false
excerpt: >-
  XMUDeepLIT 维护的 Awesome-Self-Evolving-Agents 清单精读：三篇综述 + 三类自进化论文（推理时/训练式/协同进化）+
  基准与开源库 + 应用方向，作为 RSI 库的论文索引补充。
tags:
  - RSI
  - Self-Evolving Agents
  - Awesome List
  - 综述
  - 论文索引
---
# Awesome-Self-Evolving-Agents：自进化 Agent 资源全景清单

> 2026-08-12 整理。核心资源：github.com/XMUDeepLIT/Awesome-Self-Evolving-Agents（XMU DeepLIT 维护的 awesome 清单，收录综述/论文/基准/开源项目）。

## 相关综述论文

- **A Survey on Self-Evolution of Large Language Models**（TMLR 2026）
- **A Survey of Self-Evolving Agents: What, When, How, and Where to Evolve on the Path to ASI**（arXiv 2025）
- **A Comprehensive Survey of Self-Evolving AI Agents: A New Paradigm Bridging Foundation Models and Lifelong Agentic Systems**（arXiv 2026，与库内 2508.07407 互补）
- **Safety in Embodied AI: A Survey of Risks, Attacks, and Defenses**

## 分类框架（Model-Centric / Experience-Driven / Co-Evolution）

### 1. Inference-Based Evolution（推理时进化）
- Self-Consistency（ICLR'23）、LLM-Blender（ACL'23）、SelfCheckGPT（EMNLP'23）
- Self-Refine（NeurIPS'23）、Reflexion（ICLR'24）、CRITIC（arXiv'25）
- Evolving Deeper LLM Thinking（arXiv'25）、Meta CoT（ICLR'25）
- Stream of Search / SoS（NeurIPS'24）、AlphaZero-like Tree Search（arXiv'24）、LATS（ICLR'24）、ToT（ICML'24）

### 2. Training-Based Evolution（训练式进化）
- **Offline Self-Evolving**：Beyond Human Data（TMLR'24）、Self-Instruct（ACL'23）、SPIN Self-Play（ICML'24）、STaR（NeurIPS'22）、Self-Improve（EMNLP'23）、Agent-R（ACL'23）、REST-MCTS*（ICML'25）、ARC-AGI 程序合成（NeurIPS'25）、Sirius（arXiv'25）、RAGEN（EMNLP'25）、SAMULE（EMNLP'25）
- **Online Self-Evolving**：SyncLoop（ECCV'26）等

### 3. Co-Evolution（协同进化：环境/多智能体/课程）
- Multi-Agent Policy Co-Evolution、Adaptive Curriculum Evolution、Scalable Environment Evolution

## 基准与开源库

- **Benchmarks**：RSIBench 系列、自进化 Agent 专用评测（详见库内 rsibench-data 笔记）
- **Open Source Libraries**：Avalanche（持续学习）、Mammoth（回放方法复现）等

## 应用方向

- Automated Scientific Discovery（自动科学发现）
- Autonomous Software Engineering（自主软件工程）
- Open-World Simulation（开放世界模拟）

## 给本库的启示

这份清单与库内既有笔记互补：2508.07407 综述偏理论框架，周星星分类法偏产业全景，本清单则是一份"可点名的论文索引"——写 RSI 相关文章时可直接引用其中条目。
