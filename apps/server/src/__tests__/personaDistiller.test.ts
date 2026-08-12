/**
 * L3 Persona 蒸馏管线（TencentDB 分层记忆思想落地）：
 * 1. 素材不足 → no_material
 * 2. 首次蒸馏 → 写入 type=persona 记忆（global scope，不衰减）
 * 3. 已有画像 + force → 整体重写，旧版走 supersede 软版本链
 * 4. 防抖：间隔内且素材无新增 → skipped
 * 5. LLM 失败 → skipped，现有画像不动
 * 6. buildPersonaHint：有画像注入块 / 无画像空串；动态检索不重复注入 persona
 * 7. persona 衰减豁免（getMemoryDecayFactor=1.0）+ 不可由 Agent 直接创建
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  MEMORY_TYPES,
  MEMORY_SCOPE_GLOBAL,
  MEMORY_USER_CREATABLE_TYPES,
  getMemoryDecayFactor,
} from "@knowpilot/shared";
import { createContextInner } from "../trpc/context.js";
import { distillPersona } from "../infra/personaDistiller.js";
import { buildPersonaHint, buildMemoryContext } from "../infra/promptBuilder.js";
import type { LlmTransport } from "../infra/loop/types.js";
import type { ServiceContainer } from "../infra/serviceContainer.js";

const PERSONA_MARKDOWN = `## 偏好与习惯
- 回复用简体中文，代码标识符用英文
## 长期目标与项目
- 在维护本地优先的知识管理平台
## 工作模式
- 偏好先给结论再展开
## 禁忌与边界
- 不要推送远程仓库`;

// 画像内容必须用例级唯一：repo.write 有 2s 同 contentHash 防抖（recentMemoryWrites 模块级 Map 跨用例残留），
// 全量跑时 6 个用例在 2s 窗口内，同内容会命中防抖返回已清理的旧行而不落库
let caseSeq = 0;

function okTransport(content?: string): LlmTransport {
  const body = content ?? `${PERSONA_MARKDOWN}\n- case:${++caseSeq}`;
  return {
    complete: async () => ({
      content: body,
      toolCalls: [],
      model: "test-model",
      provider: "test",
    }),
  };
}

function failTransport(): LlmTransport {
  return {
    complete: async () => {
      throw new Error("LLM 不可用");
    },
  };
}

async function seedSources(services: ServiceContainer, count: number, tag: string) {
  for (let i = 0; i < count; i++) {
    const r = await services.memory.create({
      content: `用户偏好事实 ${tag}-${i}：喜欢简洁的回复风格`,
      type: "preference",
      strength: 1,
      keywords: [tag],
      tags: [],
    });
    if (!r.success) throw new Error(`seed 失败: ${r.error?.message}`);
  }
}

async function cleanup(services: ServiceContainer, tag: string) {
  // 物理删除本测试写入的记忆（含 persona 及其 superseded 旧版）
  await services.prisma.memory.deleteMany({
    where: {
      OR: [
        { keywords: { contains: tag } },
        { type: MEMORY_TYPES.PERSONA },
      ],
    },
  });
}

describe("personaDistiller（L3 画像蒸馏）", () => {
  const tag = `pd${Date.now().toString(36)}`;
  let services: ServiceContainer;
  let config: Awaited<ReturnType<typeof createContextInner>>["config"];

  beforeEach(async () => {
    const ctx = await createContextInner();
    services = ctx.services as ServiceContainer;
    config = ctx.config;
  });

  afterEach(async () => {
    await cleanup(services, tag);
  });

  it("素材不足 → no_material", async () => {
    await seedSources(services, 1, tag);
    const r = await distillPersona({ services, config, force: true, transport: okTransport() });
    expect(r.status).toBe("no_material");
  });

  it("首次蒸馏写入 persona 记忆（global / 不衰减 / 不可直接创建）", async () => {
    await seedSources(services, 4, tag);
    const r = await distillPersona({ services, config, force: true, transport: okTransport() });
    expect(r.status).toBe("distilled");
    expect(r.personaId).toBeTruthy();

    const row = await services.prisma.memory.findUnique({ where: { id: r.personaId! } });
    expect(row).toBeTruthy();
    expect(row!.type).toBe("persona");
    expect(row!.scope).toBe(MEMORY_SCOPE_GLOBAL);
    expect(row!.status).toBe("active");
    expect(row!.content).toContain("偏好与习惯");

    // 类型常量层：不衰减 + 不在用户可创建清单
    expect(getMemoryDecayFactor(MEMORY_TYPES.PERSONA)).toBe(1.0);
    expect(MEMORY_USER_CREATABLE_TYPES).not.toContain("persona");
  });

  it("已有画像 + force → 整体重写，旧版 superseded", async () => {
    await seedSources(services, 4, tag);
    const first = await distillPersona({ services, config, force: true, transport: okTransport() });
    expect(first.status).toBe("distilled");

    const second = await distillPersona({
      services,
      config,
      force: true,
      transport: okTransport("## 偏好与习惯\n- 新版画像：偏好表格化输出"),
    });
    expect(second.status).toBe("distilled");
    expect(second.previousId).toBe(first.personaId);

    const old = await services.prisma.memory.findUnique({ where: { id: first.personaId! } });
    expect(old!.status).toBe("superseded");
    expect(old!.supersededBy).toBe(second.personaId);

    // 全局 active 画像仍只有一条
    const actives = await services.prisma.memory.count({
      where: { type: MEMORY_TYPES.PERSONA, status: "active" },
    });
    expect(actives).toBe(1);
  });

  it("防抖：间隔内且素材无新增 → skipped；有新增 → 重新蒸馏", async () => {
    await seedSources(services, 4, tag);
    const first = await distillPersona({ services, config, force: true, transport: okTransport() });
    expect(first.status).toBe("distilled");

    // 非 force 且素材无新增 → skipped
    const second = await distillPersona({ services, config, transport: okTransport() });
    expect(second.status).toBe("skipped");

    // 新增一条素材 → 非 force 也会重新蒸馏
    await seedSources(services, 1, `${tag}-fresh`);
    const third = await distillPersona({ services, config, transport: okTransport() });
    expect(third.status).toBe("distilled");
  });

  it("LLM 失败 → skipped，现有画像不动", async () => {
    await seedSources(services, 4, tag);
    const first = await distillPersona({ services, config, force: true, transport: okTransport() });
    expect(first.status).toBe("distilled");

    const failed = await distillPersona({ services, config, force: true, transport: failTransport() });
    expect(failed.status).toBe("skipped");

    const row = await services.prisma.memory.findUnique({ where: { id: first.personaId! } });
    expect(row!.status).toBe("active"); // 未被破坏
  });

  it("buildPersonaHint 注入画像块；buildMemoryContext 动态检索不重复注入 persona", async () => {
    // 无画像 → 空串
    expect(await buildPersonaHint(services)).toBe("");

    await seedSources(services, 4, tag);
    const r = await distillPersona({ services, config, force: true, transport: okTransport() });
    expect(r.status).toBe("distilled");

    const hint = await buildPersonaHint(services);
    expect(hint).toContain("用户画像（长期）");
    expect(hint).toContain("偏好与习惯");

    // 动态检索（关键词命中 persona 内容）不应再把 persona 灌进 buildMemoryContext
    const dynamic = await buildMemoryContext(services, "偏好与习惯 回复风格", {});
    expect(dynamic).not.toContain("用户画像（长期）");
  });
});
