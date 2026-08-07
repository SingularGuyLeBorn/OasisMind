/**
 * 通知通道探测：pnpm email:test [可选收件人]
 * 路径含空格时不能把绝对路径塞进 pnpm exec argv，故用 server package script。
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const to = process.argv[2] || "";
const r = spawnSync(
  "pnpm",
  ["--filter", "@knowpilot/server", "run", "email:test", ...(to ? ["--", to] : [])],
  { cwd: root, stdio: "inherit", shell: true, env: process.env },
);
process.exit(r.status ?? 1);
