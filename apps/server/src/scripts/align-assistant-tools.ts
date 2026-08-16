/**
 * 把默认 assistant 的 tools 对齐为 ASSISTANT_DEFAULT_TOOLS（DB + Markdown），
 * 消掉 /agents「配置偏移」横幅。
 *
 * 用法：pnpm --filter @oasismind/server exec tsx src/scripts/align-assistant-tools.ts
 */
import { ASSISTANT_DEFAULT_TOOLS } from "@oasismind/shared";
import { PrismaClient } from "@prisma/client";
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const agent = await prisma.agent.findFirst({
    where: { name: "assistant", deletedAt: null },
  });
  if (!agent) {
    console.log("未找到 name=assistant 的 Agent，无需对齐。");
    return;
  }

  const prev = agent.tools
    ? agent.tools.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const next = [...ASSISTANT_DEFAULT_TOOLS];
  const missing = next.filter((t) => !prev.includes(t));
  const removed = prev.filter((t) => !next.includes(t));

  if (missing.length === 0 && removed.length === 0) {
    console.log(`assistant (${agent.id}) DB 已一致（${next.length}）。`);
  } else {
    await prisma.agent.update({
      where: { id: agent.id },
      data: { tools: next.join(",") },
    });
    console.log(
      JSON.stringify(
        { id: agent.id, before: prev.length, after: next.length, added: missing, removed },
        null,
        2,
      ),
    );
  }

  // 同步 Markdown，避免 db:sync 把旧 tools 写回
  const rewrite = path.join(__dirname, "rewrite-assistant-md-tools.ts");
  const r = spawnSync(process.execPath, ["--import", "tsx", rewrite], {
    stdio: "inherit",
    cwd: path.resolve(__dirname, "../.."),
    env: process.env,
  });
  if (r.status !== 0) {
    throw new Error("rewrite-assistant-md-tools 失败");
  }

  const exact = await prisma.agent.findUniqueOrThrow({ where: { id: agent.id } });
  const tools = exact.tools.split(",").map((t) => t.trim()).filter(Boolean);
  const stillMissing = ASSISTANT_DEFAULT_TOOLS.filter((t) => !tools.includes(t));
  console.log(
    "drift tools missing:",
    stillMissing.length === 0 ? "[]（干净）" : stillMissing,
  );
  console.log("刷新 /agents（或等 60s stale）横幅应消失。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
