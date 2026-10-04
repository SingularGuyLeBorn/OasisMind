/**
 * 把密钥/Token 加密写入 Credential 凭据保险库（不落 .env 明文）。
 * 用法：pnpm --filter @oasismind/server store-credential -- <scope> <name> <value>
 * 例：  pnpm --filter @oasismind/server store-credential -- zhihu_openapi access_secret <Access Secret>
 *
 * 写入即 upsert（同 name 覆盖值并合并 scope）；回读只打印是否命中，永不打印明文。
 */

import { prisma } from "../db.js";
import { encryptCredentialValue } from "../infra/credentialVault.js";

async function main(): Promise<void> {
  const [scope, name, value] = process.argv.slice(2);
  if (!scope || !name || !value) {
    throw new Error("用法: store-credential <scope> <name> <value>");
  }
  const encrypted = encryptCredentialValue(value);
  const existing = await prisma.credential.findFirst({ where: { name } });
  if (existing) {
    const scopes = new Set(existing.scope.split(",").map((s) => s.trim()).filter(Boolean));
    scopes.add(scope);
    await prisma.credential.update({
      where: { id: existing.id },
      data: { value: encrypted, scope: Array.from(scopes).join(","), type: "api_key" },
    });
    console.log(JSON.stringify({ ok: true, mode: "updated", id: existing.id, scope: Array.from(scopes) }));
  } else {
    const created = await prisma.credential.create({
      data: {
        name,
        type: "api_key",
        value: encrypted,
        scope,
        metadata: JSON.stringify({ via: "store-credential" }),
      },
    });
    console.log(JSON.stringify({ ok: true, mode: "created", id: created.id, scope: [scope] }));
  }
  // 回读验证（不打印明文）
  const { getCredentialValue } = await import("../infra/credentialVault.js");
  const resolved = await getCredentialValue(prisma, scope, name);
  console.log(JSON.stringify({ verify: resolved === value }));
}

main()
  .catch((err) => {
    console.error("❌", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch(() => undefined);
  });
