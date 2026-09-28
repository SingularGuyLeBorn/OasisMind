# Prisma migrations（已归档，不是运行时路径）

本仓库 SQLite 是缓存层，随时可重建。**运行时与 CI 只走 `prisma db push`**，不要 `migrate deploy`。

这个目录里的历史 SQL 只作对照存档（早期实验 / 手工补丁），**不会被启动脚本执行**。改表结构请改 `schema.prisma` 后 `pnpm db:push`。

手工一次性补丁若仍需要，见 `apps/server/prisma/migrations-manual/`（同样不挂启动路径）。
