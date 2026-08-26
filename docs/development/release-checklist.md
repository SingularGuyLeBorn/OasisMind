# OasisMind 发布硬约束检查单

> 本清单在每次准备对外发布（含通过 Cloudflare Tunnel 暴露到公网）前执行。未全部通过不得发布。

## 1. 安全基线

- [ ] `AUTH_MODE` 必须设为 `password`（或更强的鉴权模式）。`none` 只允许本机开发。
- [ ] `hostAccess.enabled` 默认为 `false`；如业务需要开启，必须在私有/可信网络且强密码保护下。
- [ ] `run_shell` 工具描述与相关文档已明确：命令在主机上以当前 OS 用户权限直接执行，不是沙箱隔离；destructive 操作需审批。
- [ ] 不提交 `.env`、`*.db`、`data/cookies`、`data/credentials` 等到 Git。

## 2. 代码与构建

- [ ] `pnpm lint` 全绿（0 errors，warnings 需逐条确认非发布阻断）。
- [ ] `pnpm test` 全绿（含 `@oasismind/web`、`@oasismind/server`、`@oasismind/shared`）。
- [ ] `pnpm build` 全绿（web + server）。
- [ ] `pnpm test:e2e:mock` 不劣于审计基线（当前基线 7/7）；环境性失败需重跑并记录。
- [ ] `pnpm test:bench` 通过率 100%（B17 必须过）。

## 3. 工作树与依赖

- [ ] `git status` 无本次工作遗留的已跟踪未提交文件（`.env`、`*.db`、忽略项除外）。
- [ ] `pnpm audit` 已复跑评估；高危漏洞需修复或有明确记录的风险接受说明。
- [ ] 未引入未经审批的新依赖。

## 4. 部署验证

- [ ] Docker 镜像与 `docker-compose.yml` 需在有 Docker daemon 的环境构建并启动验证。
  - 注：部分开发机 Docker daemon 不可用，可在发布前换到支持 Docker 的机器补验。
- [ ] Tunnel / 公网暴露后，使用外部网络访问登录页并验证 `AUTH_MODE=password` 生效。
- [ ] 核心主路径冒烟：Chat 发送消息、子 Agent 委派、后台任务查询、文章发布与渲染。

## 5. 文档

- [ ] `docs/development/pre-release-fix-report.md`（或等效发布审计报告）已按模板填完并提交。
- [ ] `docs/development/README.md` 模块图与当前 apps/packages 一致。
- [ ] 若本次发布有用户可见行为变化，`docs/development/design-decisions.md` 已记录决策。
