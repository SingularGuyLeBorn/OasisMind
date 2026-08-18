import { Prisma } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../db.js";
import {
  ensureSqliteColumns,
  ensureSqliteColumnsForModels,
  listMissingOptionalColumns,
  sqliteTypeForPrismaField,
} from "../infra/ensureSqliteColumns.js";

describe("ensureSqliteColumns", () => {
  it("可选标量列映射 + 缺列检测", () => {
    expect(
      sqliteTypeForPrismaField({
        name: "systemPrompt",
        kind: "scalar",
        type: "String",
        isRequired: false,
      }),
    ).toBe("TEXT");
    expect(
      listMissingOptionalColumns(["id", "status"], [
        { name: "id", kind: "scalar", type: "String", isRequired: true },
        { name: "status", kind: "scalar", type: "String", isRequired: true },
        { name: "systemPrompt", kind: "scalar", type: "String", isRequired: false },
        { name: "agent", kind: "object", type: "Agent", isRequired: false },
      ]),
    ).toEqual([{ name: "systemPrompt", sqliteType: "TEXT" }]);
  });

  it("对真实 SQLite 表只 ADD 缺的可选列，不重建", async () => {
    const table = "_om_ensure_col_test";
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}"`);
    await prisma.$executeRawUnsafe(`CREATE TABLE "${table}" (id TEXT)`);
    try {
      const added = await ensureSqliteColumnsForModels(prisma, [
        {
          name: table,
          fields: [
            { name: "id", kind: "scalar", type: "String", isRequired: true },
            { name: "systemPrompt", kind: "scalar", type: "String", isRequired: false },
          ],
        },
      ]);
      expect(added).toEqual([`${table}.systemPrompt`]);
      const again = await ensureSqliteColumnsForModels(prisma, [
        {
          name: table,
          fields: [
            { name: "id", kind: "scalar", type: "String", isRequired: true },
            { name: "systemPrompt", kind: "scalar", type: "String", isRequired: false },
          ],
        },
      ]);
      expect(again).toEqual([]);
      const rows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
        `PRAGMA table_info("${table}")`,
      );
      expect(rows.map((r) => r.name)).toContain("systemPrompt");
    } finally {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}"`);
    }
  });

  it("Prisma DMMF 含 Run.systemPrompt，对齐后的库 ensure 为零补列", async () => {
    const run = Prisma.dmmf.datamodel.models.find((m) => m.name === "Run");
    expect(run?.fields.some((f) => f.name === "systemPrompt" && !f.isRequired)).toBe(true);
    const added = await ensureSqliteColumns(prisma);
    expect(added).toEqual([]);
    const cols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Run")`);
    expect(cols.map((c) => c.name)).toContain("systemPrompt");
  });

  it("Run.create 带 systemPrompt 不再因缺列失败", async () => {
    const run = await prisma.run.create({
      data: { status: "running", systemPrompt: "snap" },
    });
    try {
      expect(run.systemPrompt).toBe("snap");
    } finally {
      await prisma.run.delete({ where: { id: run.id } }).catch(() => undefined);
    }
  });
});

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "_om_ensure_col_test"`).catch(() => undefined);
});
