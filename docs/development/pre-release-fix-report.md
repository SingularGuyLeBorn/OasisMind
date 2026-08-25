# 发布前审计整改报告（2026-08-26 执行）

## 总览

| 项 | 状态 | commit | 验证 |
|---|---|---|---|
| F1 崩溃中断 ≠ 用户手停 | in_progress | - | - |
| F2 read_file 读路径收口 | pending | - | - |
| F3 hostAccess 默认关闸 | pending | - | - |
| F4 经验积累测例补 services.config | pending | - | - |
| F5 run_shell 真限制 + 文案诚实 | pending | - | - |
| F6 harness B17 查状态走错工具 | pending | - | - |
| F7 博客 HTML 渲染加 sanitize | pending | - | - |
| F8 删掉评论 tRPC delete | pending | - | - |
| F9 两处纪律清理 | pending | - | - |
| F10 文档债 + 发布清单 | pending | - | - |

## F1 崩溃中断 ≠ 用户手停

- 根因复述：服务重启后，崩溃遗留的 `running` ChatSession 与用户手动暂停共用 `paused` 状态。`recovery.ts` 把僵尸会话标为 `paused` 后，`prepareAgentRun` 见到 `paused` 只入队不起流；`requeueOrphanedSuperiorDrains` 又不区分状态重挂 drain，导致 pending 队列项被 consume 删除后又被 `prepareAgentRun` 幂等重建，user 消息永远无法进入 Chat，且有空转循环风险。
- 成功标准：引入 `interrupted` 状态表示崩溃尸体，`paused` 收窄为用户手停/运行错误暂停。崩溃会话恢复管道可自动接管，用户手停会话保持暂停直到用户 resume。
- 改动文件：
- 设计决定与理由（含每处 paused 触点的改/不改）：
- [OM-FREEPLAY] 清单：
- 验证命令与结果：
- 遇到的问题：

## F2 read_file 读路径收口

- 根因复述：
- 成功标准：
- 改动文件：
- 设计决定与理由：
- [OM-FREEPLAY] 清单：
- 验证命令与结果：
- 遇到的问题：

## F3 hostAccess 默认关闸、去本机盘符

- 根因复述：
- 成功标准：
- 改动文件：
- 设计决定与理由：
- [OM-FREEPLAY] 清单：
- 验证命令与结果：
- 遇到的问题：

## F4 经验积累测例补 services.config

- 根因复述：
- 成功标准：
- 改动文件：
- 设计决定与理由：
- [OM-FREEPLAY] 清单：
- 验证命令与结果：
- 遇到的问题：

## F5 run_shell 真限制 + 文案诚实

- 根因复述：
- 成功标准：
- 改动文件：
- 设计决定与理由：
- [OM-FREEPLAY] 清单：
- 验证命令与结果：
- 遇到的问题：

## F6 harness B17 查状态走错工具

- 根因复述：
- 成功标准：
- 改动文件：
- 设计决定与理由：
- [OM-FREEPLAY] 清单：
- 验证命令与结果：
- 遇到的问题：

## F7 博客 HTML 渲染加 sanitize

- 根因复述：
- 成功标准：
- 改动文件：
- 设计决定与理由：
- [OM-FREEPLAY] 清单：
- 验证命令与结果：
- 遇到的问题：

## F8 删掉评论 tRPC delete

- 根因复述：
- 成功标准：
- 改动文件：
- 设计决定与理由：
- [OM-FREEPLAY] 清单：
- 验证命令与结果：
- 遇到的问题：

## F9 两处纪律清理

- 根因复述：
- 成功标准：
- 改动文件：
- 设计决定与理由：
- [OM-FREEPLAY] 清单：
- 验证命令与结果：
- 遇到的问题：

## F10 文档债 + 发布清单

- 根因复述：
- 成功标准：
- 改动文件：
- 设计决定与理由：
- [OM-FREEPLAY] 清单：
- 验证命令与结果：
- 遇到的问题：

## 未验证 / 残留风险

## 全局门禁结果

- lint：
- test：
- build：
- e2e:mock：
- bench：
