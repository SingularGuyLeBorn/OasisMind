/**
 * SQLite 缺列自愈：只 ADD 可选标量列，绝不 DROP / 重建（db push 会误删 FTS）。
 *
 * 根因：`pnpm dev` 只 prisma generate，schema 加了列但 live dev.db 没跟上，
 * 每次 Run.create 就报 `The column X does not exist`。
 */

import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

export type EnsureColumnField = {
  name: string;
  kind: "scalar" | "enum" | "object" | string;
  type: string;
  isRequired: boolean;
  isList?: boolean;
};

export type EnsureColumnModel = {
  name: string;
  dbName?: string | null;
  fields: EnsureColumnField[];
};

export function sqliteTypeForPrismaField(field: EnsureColumnField): string | null {
  if (field.kind === "object" || field.isList) return null;
  if (field.kind === "enum") return "TEXT";
  switch (field.type) {
    case "Int":
    case "BigInt":
    case "Boolean":
      return "INTEGER";
    case "Float":
      return "REAL";
    case "Bytes":
      return "BLOB";
    case "String":
    case "Json":
    case "Decimal":
    case "DateTime":
      return "TEXT";
    default:
      return field.kind === "scalar" ? "TEXT" : null;
  }
}

function quoteIdent(name: string): string {
  if (!IDENT.test(name)) throw new Error(`非法 SQLite 标识符: ${name}`);
  return `"${name}"`;
}

export function listMissingOptionalColumns(
  existingNames: string[],
  fields: EnsureColumnField[],
): Array<{ name: string; sqliteType: string }> {
  const have = new Set(existingNames.map((n) => n.toLowerCase()));
  const missing: Array<{ name: string; sqliteType: string }> = [];
  for (const field of fields) {
    if (field.isRequired) continue;
    const sqliteType = sqliteTypeForPrismaField(field);
    if (!sqliteType) continue;
    if (have.has(field.name.toLowerCase())) continue;
    missing.push({ name: field.name, sqliteType });
  }
  return missing;
}

export async function ensureSqliteColumnsForModels(
  prisma: PrismaClient,
  models: EnsureColumnModel[],
): Promise<string[]> {
  const added: string[] = [];
  for (const model of models) {
    const table = model.dbName || model.name;
    if (!IDENT.test(table)) continue;
    let rows: Array<{ name: string }> = [];
    try {
      rows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
        `PRAGMA table_info(${quoteIdent(table)})`,
      );
    } catch {
      continue;
    }
    if (!rows.length) continue;
    const missing = listMissingOptionalColumns(
      rows.map((r) => r.name),
      model.fields,
    );
    for (const col of missing) {
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE ${quoteIdent(table)} ADD COLUMN ${quoteIdent(col.name)} ${col.sqliteType}`,
        );
        added.push(`${table}.${col.name}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (/duplicate column/i.test(msg)) continue;
        console.warn(
          `[ensureSqliteColumns] 加列失败 ${table}.${col.name}:`,
          msg,
        );
      }
    }
  }
  return added;
}

export async function ensureSqliteColumns(prisma: PrismaClient): Promise<string[]> {
  const url = process.env.DATABASE_URL ?? "";
  if (url && !url.startsWith("file:") && !/sqlite/i.test(url)) return [];
  const models = Prisma.dmmf.datamodel.models.map((m) => ({
    name: m.name,
    dbName: m.dbName,
    fields: m.fields.map((f) => ({
      name: f.dbName ?? f.name,
      kind: f.kind,
      type: f.type,
      isRequired: f.isRequired,
      isList: f.isList,
    })),
  }));
  const added = await ensureSqliteColumnsForModels(prisma, models);
  if (added.length > 0) {
    console.log(`  🔧 [sqlite] 已补缺列：${added.join(", ")}`);
  }
  return added;
}
