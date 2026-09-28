import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "db",
          include: ["src/__tests__/**/*.test.ts"],
          exclude: ["src/__tests__/pure/**"],
          globalSetup: ["./src/__tests__/globalSetup.ts"],
          setupFiles: ["./src/__tests__/setupPrismaIsolation.ts"],
          // SQLite 是文件级单写锁：并行多 worker 各自 PrismaClient 会争文件锁。
          pool: "forks",
          poolOptions: { forks: { singleFork: true } },
          testTimeout: 30_000,
        },
      },
      {
        test: {
          name: "pure",
          include: ["src/__tests__/pure/**/*.test.ts"],
          pool: "threads",
          testTimeout: 15_000,
        },
      },
    ],
  },
});
