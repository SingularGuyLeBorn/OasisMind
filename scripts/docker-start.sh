#!/bin/sh
# 容器内前台拉起 server + web：任一进程退出则容器退出（禁止把 server 丢后台孤儿化）
set -eu

pnpm --filter @oasismind/server exec prisma db push --skip-generate --accept-data-loss
pnpm db:sync

pnpm --filter @oasismind/server start &
server_pid=$!
pnpm --filter @oasismind/web start -p 3000 &
web_pid=$!

term() {
  kill "$server_pid" "$web_pid" 2>/dev/null || true
  wait "$server_pid" "$web_pid" 2>/dev/null || true
}
trap term INT TERM

wait "$server_pid" "$web_pid"
