/**
 * P2-1：内部 mini Harness-Bench 的 CLI 薄壳
 *
 * 核心逻辑已迁移到 `apps/server/src/infra/harnessBenchRunner.ts`。
 * 本文件只负责：解析 CLI 参数 → 构造 HarnessDeps → 调用 runHarnessBench → 控制台输出。
 *
 * 用法：
 *   pnpm test:bench                                    # mock 模式（CI 零成本，链路冒烟）
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

// tsx 环境下可直接 import .ts
import { runHarnessBench } from "../../apps/server/src/infra/harnessBenchRunner.ts";
import { prisma } from "../../apps/server/src/db.ts";
import { getAppConfig } from "../../apps/server/src/infra/config.ts";
import { getServiceContainer } from "../../apps/server/src/infra/serviceContainer.ts";
import { getEventBus } from "../../apps/server/src/infra/eventBus.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const opts = {
    only: null,
    timeoutMs: 60_000,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--case") {
      opts.only = new Set(String(argv[++i]).split(",").map((s) => s.trim()));
    } else if (a === "--timeout-ms") {
      opts.timeoutMs = Number(argv[++i]);
    } else if (a === "--live") {
      throw new Error("run-harness-bench 已改为仅 mock 模式；--live 不再支持");
    }
  }
  return opts;
}

function fmtUsd(n) {
  return n < 0.0001 ? "$0" : `$${n.toFixed(4)}`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const config = getAppConfig();
  const eventBus = getEventBus();
  const services = getServiceContainer(prisma, eventBus, config);

  const result = await runHarnessBench(
    { prisma, services, config },
    {
      onlyTaskIds: opts.only ? [...opts.only] : undefined,
      timeoutMs: opts.timeoutMs,
    },
  );

  const reportPathAbs = path.resolve(config.projectRoot, result.reportPath);

  console.log(`mini Harness-Bench：${result.total} 题 · mode=mock · model=mock-bench · variant=baseline`);
  console.log(`\n== 汇总 ==`);
  console.log(`通过率: ${result.passedCount}/${result.total} (${(result.passRate * 100).toFixed(1)}%)`);
  console.log(`报告已落盘: ${path.relative(process.cwd(), reportPathAbs)}`);

  if (!result.passed) {
    console.error(`失败题: ${result.failedTaskIds.join(", ")}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
