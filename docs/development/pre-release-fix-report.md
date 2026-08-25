# 发布前审计整改报告（2026-08-26 执行）

## 总览

| 项 | 状态 | commit | 验证 |
|---|---|---|---|
| F1 崩溃中断 ≠ 用户手停 | done | 8dd65ff3 | server lint 绿；startupRecovery/sessionResume/asyncDeliveryQueueB4/superiorQueueDrain/session-subagent 绿 |
| F2 read_file 读路径收口 | done | d9af3c61 | server lint 绿；writePolicy 13 测试全绿 |
| F3 hostAccess 默认关闸 | in_progress | - | - |
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
  - `packages/shared/src/schemas.ts`：`sessionStatusSchema` 加 `interrupted`。
  - `apps/server/prisma/schema.prisma`：状态注释同步。
  - `apps/server/src/infra/asyncJobs/recovery.ts`：动作 2 `running → interrupted`；结果字段改名 `zombieSessionsInterrupted`；广播状态同步。
  - `apps/server/src/infra/tools/native/swarm/sendMessage.ts`：仅 `paused` 走暂停分支，`interrupted` 落入 else 正常续跑。
  - `apps/server/src/infra/tools/native/swarm/superiorDrain.ts`：`requeueOrphanedSuperiorDrains` 跳过 `paused`。
  - `apps/server/src/infra/sessionStreamHub.ts`：`CLAIM_RUNNING_FROM` 与 `stop()` 状态列表加 `interrupted`。
  - `apps/server/src/infra/entityServices/sessionService.ts`：`resume` 条件写从 `paused` 扩为 `in:[paused,interrupted]`。
  - `apps/server/src/infra/swarmBus.ts`、`redisSwarmBus.ts`、`agentStream/persist.ts`：状态集合加 `interrupted`。
  - `apps/server/src/infra/swarmHealth.ts`、`apps/web/components/swarmHealthPanel.tsx`、`apps/web/app/subagents/page.tsx`、`apps/web/components/chatHoverMonitor.tsx`、`apps/web/components/chatCenterPane.tsx`、`apps/web/components/subsessionPanel.tsx`、`apps/web/app/cron/page.tsx`、`packages/shared/src/toolResultHint.ts`：UI/摘要映射加 `interrupted`。
  - `apps/server/src/infra/trpcRouters/sessionRouter.ts`、`apps/server/src/index.ts`：注释与日志同步。
  - 测试：`startupRecovery.test.ts`（断言改 interrupted、加 C4 负向用例）、`sessionResume.test.ts`（加 T13 interrupted 可 resume）、`asyncDeliveryQueueB4.test.ts`（同步字段名）。
- 设计决定与理由（含每处 paused 触点的改/不改）：
  - `recovery.ts` 动作 2：`running → interrupted`（改）——崩溃尸体必须与用户手停区分。
  - `sendMessage.ts`：`mainSession.status === "paused"` 才走暂停分支（改）——interrupted 必须能正常起流。
  - `sessionStreamHub.ts` `CLAIM_RUNNING_FROM` / `stop()` 状态列表（改）——允许 interrupted 直接续聊/被 stop。
  - `sessionService.ts` `resume`（改）——interrupted 也可手动 resume。
  - `superiorDrain.ts`（改）——跳过 paused，避免空转循环；interrupted 的 pending 项仍重注册。
  - `asyncJobs/execute.ts:243`（不改）——async 任务子会话被 abort 后标 paused 是「运行被用户/系统停止」，非崩溃尸体，与用户手停同恢复语义；不在 F1 范围内。
  - `goalLoop.ts:340` / `intentContract.ts:108`（不改）——那是 `sessionGoalStatusSchema` 的 `paused`，与会话生命周期无关。
  - `agentCronEngine.ts:148`（不改）——cron 跳过 paused/failed，interrupted 对 cron 无意义（cron 会话不会自然产生 interrupted）。
- [OM-FREEPLAY] 清单：
  - `STATUS_COLOR.interrupted` 用 `bg-orange-400`（警示色），`chatHoverMonitor` 把 interrupted 与 failed/paused 同列红系展示——用户未指定颜色与分类，保守选择「需要关注」。
- 验证命令与结果：
  - `pnpm --filter @oasismind/server lint`：绿（tsc --noEmit 退出码 0）。
  - `pnpm --filter @oasismind/server test -- startupRecovery sessionResume asyncDeliveryQueueB4 session-subagent superiorQueueDrain`：startupRecovery 4 绿、sessionResume 11 绿、asyncDeliveryQueueB4/superiorQueueDrain/session-subagent 全绿。命令因同时命中其它测试而整体退出码 1（F4 agentEvolutionOptimize 红），与本项无关。
- 遇到的问题：
  - 无。

## F2 read_file 读路径收口

- 根因复述：`data/` 目录只禁写、读全放行；`workspaces/` 按 projectRoot 解析、不校验当前 Agent 的 Workspace 归属。于是 `read_file("data/cookies/feishu_oauth.json")`、`read_file("workspaces/别人/secret.txt")` 都能读。
- 成功标准：`data/` 读改默认拒绝 + 白名单；`workspaces/` 仅当前 Agent 自己的 Workspace 可读；super tier 不开口子。
- 改动文件：
  - `apps/server/src/infra/writePolicy.ts`：新增 `DATA_READ_ALLOWLIST`；`data/` 读分支校验白名单；`workspaces/` 分支查当前 Agent 的 `Workspace.path` 并断言目标落在其内；`describePolicy()` 文案同步。
  - `apps/server/src/__tests__/writePolicy.test.ts`：新增 13 条测试覆盖允许/拒绝路径。
- 设计决定与理由：
  - 白名单只放 `data/tool-results/`、`data/webpages/`、`data/workspace/`——这是 Agent 回读链路的完整扫描结论：`toolResultOffload` 写 `data/tool-results/{session}/` 后 `read_file` 读回；`save_webpage` 落 `data/webpages/` 后提示用户 `read_file` 读回；`data/workspace/` 是无 Workspace 记录时的回退工作区。
  - `cookies`、`credentials`、`db`、`git`、`approvals`、`logs`、`sessions`、`messages` 不在白名单，读取会被拒绝。
  - `workspaces/` 用 `ctx.agentSnapshot?.workspaceId` 查 `Workspace.path`，再用 `isAbsInside`（Windows 大小写不敏感）比较；无 Workspace 全拒；裸扫 `workspaces/` 根也拒。
  - super tier 不额外开洞：审计未授权 super 读别人 Workspace，统一走 Workspace 归属校验。
- [OM-FREEPLAY] 清单：
  - 无（白名单子目录与报错文案均按审计要求实现，无自行猜测的默认）。
- 验证命令与结果：
  - `pnpm --filter @oasismind/server lint`：绿。
  - `pnpm --filter @oasismind/server test -- writePolicy.test`：`writePolicy.test.ts` 13 测试全绿；整体退出码 1 来自 F4 `agentEvolutionOptimize.test.ts`，与本项无关。
- 遇到的问题：
  - 无。

## F3 hostAccess 默认关闸、去本机盘符

- 根因复述：`HostAccessYamlSchema` 的 `enabled` 默认 `true`，`roots` 默认包含本机盘符 `"D:/ALL IN AI"`；`config.yaml` 中 `enabled: true` 与注释「总闸：enabled=false」相反，导致主机访问默认敞开且携带不可移植路径。
- 成功标准：`enabled` 默认 `false`；默认 roots 只保留 `%USERPROFILE%` 下的可移植目录；`config.yaml` 注释与值一致；测试验证空对象解析为关闸；全仓默认配置/ schema 不再含 `D:/ALL IN AI`。
- 改动文件：
  - `apps/server/src/infra/config.ts`：`enabled: z.boolean().default(false)`；`roots` 默认值删掉 `"D:/ALL IN AI"`，保留 `%USERPROFILE%/Desktop/Documents/Downloads`。
  - `config.yaml`：`hostAccess.enabled: false`；删 `"D:/ALL IN AI"` 行；注释同步。
  - `apps/server/src/infra/hostAccess.ts`：新增模块（随本项一起入库）。
  - `apps/server/src/__tests__/hostAccess.test.ts`：新增空对象默认 off / 显式 true 仍可用两条用例；将测试里的示例盘符改成 `D:/example`。
  - `config/agents/weixin-bot.md`、`config/agents/qq-bot.md`：把示例路径 `D:/ALL IN AI` 改成占位写法 `D:/你的项目`。
  - `config/mcp/windows-mcp.yaml`：随本项一起入库（无密钥，仅配置说明）。
- 设计决定与理由：
  - `%USERPROFILE%` 保留：它们是可移植的用户目录，不是某台机器的绝对路径，且对应默认 roots 的三个常见用户文件夹。
  - `weixin-bot.md` / `qq-bot.md` 的 `D:/ALL IN AI` 只是 prompt 示例，不属于 schema/默认配置，但按「示例出现要改成占位写法」同步替换，避免 grep 误报。
  - `hostAccess.ts` 与 `windows-mcp.yaml` 是用户未跟踪的新文件，已审阅无密钥后随 F3 入库，避免遗留未提交文件。
- [OM-FREEPLAY] 清单：
  - 无（默认值、roots 清单、占位写法均按审计要求执行）。
- 验证命令与结果：
  - `pnpm --filter @oasismind/server exec vitest run src/__tests__/hostAccess.test.ts`：17 测试全绿，退出码 0。
- 遇到的问题：
  - 无。

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
