import { defineConfig } from "vitest/config";

// [OM-FREEPLAY] 性能实验单独运行，避免普通测试受机器负载影响；复用已有隔离库。
// 与普通 Server 测试共享 test.db，因此两者必须顺序执行。
export default defineConfig({
  test: {
    include: ["src/__tests__/performance/*.scenario.ts"],
    globalSetup: ["./src/__tests__/globalSetup.ts"],
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 30_000,
  },
});
