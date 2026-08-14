# 模块化 + DSH §7 本回合备忘（未完成）

日期：2026-08-15

## 本回合已做

- **wipe 绿**（`2ba74296`）：`loadRootEnv` 隔离键不覆盖；setup 杀 PID 后再删 `test-e2e.db*`。
- **WP3b 绿**（`fafbb928`）：inbox/mediaStt 听 `ctx.signal`；负向测试 `inboxAbortSignal.test.ts`。
- **DSH-E2E-1 绿**：sub 误写 spawn 后 Chat 上是 `NOT_VISIBLE` 失败脸。根因是 mock 页 `3003` 直连 `3011` SSE，CORS 白名单只有 3000/3002，预检失败后前端卡在 Thinking。已放行本机 localhost 端口。

## 未完成（下一刀）

- **DSH-E2E-2**：`MOCK_NATIVE_TOOLS=true` 时 `spawn_subagent` 是假 handler，不会写 `toolInheritMask`、不会 `report_back`。要绿必须走真 spawn 或改 mock 真建子 + 投递回报正文。scenario 已预埋。
- DSH-E2E-3～6、Phase 1 god file 拆分：未开工。
- 已知债：inbound 第二句 user、QQ 回发 400 —— 未动。
