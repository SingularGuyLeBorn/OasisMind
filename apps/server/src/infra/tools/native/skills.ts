/**
 * Native Skills 域 — Hermes 式渐进披露 + skill_manage
 * skills_list / skill_view / skill_manage
 */
import fs from "fs";
import path from "path";
import { z } from "zod";
import { zodParams } from "./zodParams.js";
import type { NativeToolContext, NativeToolDefinition, NativeToolHandler } from "./types.js";
import { registerNativeDomain } from "./registerDomain.js";
import { agentParamError, TOOL_CORRECT_EXAMPLES } from "./agentToolError.js";
import {
  archiveSkillPackage,
  inferKindFromScanPath,
  listSkillLinkedFiles,
  parseSkillKind,
  readSkillSupportFile,
  sanitizeSkillName,
  skillMdPath,
  skillPackageDir,
  truncateSkillDescription,
  writeSkillSupportFile,
  type SkillKind,
} from "../../skillPackage.js";
import {
  bumpSkillPatch,
  bumpSkillView,
  markSkillAgentCreated,
  markSkillArchived,
} from "../../skillUsage.js";
import { scanSkillPackage } from "../../skillScan.js";
import { compareByHighValueTags, hasHighValueTag, parseTags } from "@oasismind/shared";

function skillsRoot(ctx: NativeToolContext): string {
  return ctx.config.configPaths.skills;
}

function parseMeta(metaJson?: string | null): Record<string, unknown> {
  if (!metaJson) return {};
  try {
    return JSON.parse(metaJson) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function skillsListTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const keyword = args.keyword ? String(args.keyword) : "";
  const tag = args.tag ? String(args.tag).trim() : "";
  const includeDisabled = args.includeDisabled === true;
  const list = await ctx.services.skill.list({
    page: 1,
    pageSize: 200,
    enabled: includeDisabled ? undefined : true,
    keyword: keyword || undefined,
    tag: tag || undefined,
  });
  type Row = {
    name: string;
    description: string;
    trigger: string | null;
    kind: string;
    enabled: boolean;
    tags: string[];
    useful: boolean;
  };
  const skills = list.items
    .map((s): Row | null => {
      const kind = parseSkillKind(s.metaJson, "executable");
      if (kind === "reference") return null;
      const tags = Array.isArray(s.tags) ? s.tags : parseTags(s.tags);
      const desc = truncateSkillDescription(s.description || "", 60);
      return {
        name: s.name,
        description: desc,
        trigger: s.trigger,
        kind,
        enabled: s.enabled,
        tags,
        useful: hasHighValueTag(tags),
      };
    })
    .filter((x): x is Row => x != null)
    .sort((a, b) => compareByHighValueTags(a, b, (x) => x.tags, (x) => x.name));
  return {
    count: skills.length,
    skills,
    hint: "带 tags「非常有用/必装」的 Skill 优先考虑。可用 tag 参数筛选。需要全文时用 skill_view(name)；程序记忆用 skill_manage 维护。",
  };
}

async function skillViewTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const name = String(args.name || "").trim();
  if (!name) {
    return agentParamError({
      reason:
        "参数 name 无效：skill_view 必填 name。请先 skills_list 查看可用 Skill，再填入返回的精确 name（小写连字符）。",
      got: args.name,
      correctExample: { ...TOOL_CORRECT_EXAMPLES.skill_view },
      code: "INVALID_SKILL_NAME",
    });
  }
  const filePath = args.file_path ? String(args.file_path) : args.filePath ? String(args.filePath) : "";
  const list = await ctx.services.skill.list({ page: 1, pageSize: 200, keyword: name });
  const skill = list.items.find((s) => s.name === name || sanitizeSkillName(s.name) === sanitizeSkillName(name));
  if (!skill) {
    return {
      error: `Skill「${name}」不存在。下一步：调用 skills_list 核对精确 name（大小写与连字符必须一致），不要编造名称。`,
    };
  }

  const kind = parseSkillKind(skill.metaJson, "executable");
  const root = skillsRoot(ctx);

  if (filePath) {
    if (kind !== "procedural") {
      return {
        error:
          `Skill「${skill.name}」的 kind=${kind}，不是 procedural 包，不能传 file_path。` +
          "下一步：省略 file_path，只读主正文；若需要附属文件，先 skills_list / skill_view 确认 kind=procedural。",
      };
    }
    const read = readSkillSupportFile(root, skill.name, filePath);
    if (!read.ok) return { error: read.error };
    bumpSkillView(skill.name, root);
    return {
      name: skill.name,
      kind,
      file_path: filePath,
      content: read.content,
    };
  }

  bumpSkillView(skill.name, root);
  const linked = kind === "procedural" ? listSkillLinkedFiles(root, skill.name) : undefined;
  const tags = Array.isArray(skill.tags) ? skill.tags : parseTags(skill.tags);
  return {
    name: skill.name,
    id: skill.id,
    description: skill.description,
    trigger: skill.trigger,
    kind,
    enabled: skill.enabled,
    tags,
    useful: hasHighValueTag(tags),
    content: skill.code,
    linked_files: linked,
    hint: linked
      ? "可用 skill_view(name, file_path='references/...') 加载附属文件。"
      : undefined,
  };
}

function buildProceduralFrontmatter(opts: {
  name: string;
  description: string;
  version?: string;
}): string {
  const desc = truncateSkillDescription(opts.description || "Procedural skill.", 60);
  return [
    "---",
    `name: "${opts.name.replace(/"/g, '\\"')}"`,
    `description: "${desc.replace(/"/g, '\\"')}"`,
    `kind: procedural`,
    `enabled: true`,
    `version: "${opts.version || "0.1.0"}"`,
    `author: "OasisMind"`,
    "---",
    "",
  ].join("\n");
}

function splitSkillMd(raw: string): { frontmatter: string; body: string; full: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) {
    return { frontmatter: "", body: raw, full: raw };
  }
  return { frontmatter: m[1]!, body: m[2]!, full: raw };
}

/** 从 SKILL.md frontmatter 解析 tags（YAML 列表或逗号串） */
function parseTagsFromSkillMd(fullMd: string): string[] {
  const { frontmatter } = splitSkillMd(fullMd);
  if (!frontmatter) return [];
  const block = frontmatter.match(/^tags:\s*\n((?:[ \t]*-[ \t]*.+\n?)*)/m);
  if (block?.[1]) {
    return parseTags(
      block[1]
        .split("\n")
        .map((line) => line.replace(/^\s*-\s*/, "").replace(/^["']|["']$/g, "").trim())
        .filter(Boolean),
    );
  }
  const inline = frontmatter.match(/^tags:\s*\[([^\]]*)\]\s*$/m);
  if (inline?.[1]) return parseTags(inline[1]);
  const csv = frontmatter.match(/^tags:\s*["']?(.+?)["']?\s*$/m);
  if (csv?.[1] && !csv[1].startsWith("-") && csv[1] !== "[]") return parseTags(csv[1]);
  return [];
}

async function upsertProceduralSkill(
  ctx: NativeToolContext,
  name: string,
  fullMd: string,
  opts?: { agentCreated?: boolean },
) {
  const safe = sanitizeSkillName(name);
  if (!safe) {
    return {
      error:
        "参数 name 无效：须为小写英文字母/数字/连字符（例 daily-fragments-workspace）。" +
        "禁止中文、空格、下划线堆砌、PR 号、今日任务名。请改名后重试。",
    };
  }
  const { body } = splitSkillMd(fullMd);
  const descMatch = fullMd.match(/^description:\s*["']?(.+?)["']?\s*$/m);
  const description = truncateSkillDescription(descMatch?.[1] || safe, 60);
  const tags = parseTagsFromSkillMd(fullMd);
  const root = skillsRoot(ctx);
  const dir = skillPackageDir(root, safe);
  fs.mkdirSync(dir, { recursive: true });
  const mdPath = path.join(dir, "SKILL.md");
  const content = fullMd.includes("---")
    ? fullMd
    : buildProceduralFrontmatter({ name: safe, description }) + body;
  fs.writeFileSync(mdPath, content.endsWith("\n") ? content : content + "\n", "utf-8");

  const metaJson = JSON.stringify({
    kind: "procedural" satisfies SkillKind,
    version: "0.1.0",
    agentCreated: opts?.agentCreated === true,
    package: true,
  });

  const existing = await ctx.services.skill.list({ page: 1, pageSize: 50, keyword: safe });
  const hit = existing.items.find((s) => sanitizeSkillName(s.name) === safe);
  if (hit) {
    const updated = await ctx.services.skill.update({
      id: hit.id,
      name: safe,
      description,
      code: splitSkillMd(content).body.trim(),
      enabled: true,
      tags,
      metaJson,
    } as never);
    if (!updated.success) {
      return {
        error:
          `更新 Skill「${safe}」失败：${updated.error?.message ?? "未知原因"}。` +
          "下一步：skills_list 确认名称未冲突；patch 时先 skill_view 核对 old_string 与原文完全一致。",
      };
    }
    return { success: true, skillId: hit.id, name: safe, action: "updated" as const };
  }

  const created = await ctx.services.skill.create({
    name: safe,
    description,
    code: splitSkillMd(content).body.trim(),
    icon: "Sparkles",
    enabled: true,
    tags,
    metaJson,
  } as never);
  if (!created.success || !created.data) {
    return {
      error:
        `创建 Skill「${safe}」失败：${created.error?.message ?? "未知原因"}。` +
        "下一步：skills_list 检查是否重名；name 用小写连字符；content 须含合法 frontmatter。",
    };
  }
  // 强制写包路径（Service 默认可能写扁平文件）
  const flat = skillMdPath(root, safe, "executable");
  if (fs.existsSync(flat) && flat !== mdPath) {
    try {
      fs.unlinkSync(flat);
    } catch {
      /* ignore */
    }
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(mdPath, content.endsWith("\n") ? content : content + "\n", "utf-8");
  await ctx.services.skill.update({
    id: created.data.id,
    metaJson,
  } as never).catch((err) => { console.warn("[skills.ts] best-effort failed:", err instanceof Error ? err.message : err); });
  if (opts?.agentCreated) markSkillAgentCreated(safe, root);
  return { success: true, skillId: created.data.id, name: safe, action: "created" as const };
}

async function skillManageTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const action = String(args.action || "");
  const name = sanitizeSkillName(String(args.name || ""));
  if (!name) return { error: "skill_manage 需要合法 name（小写连字符）" };
  const root = skillsRoot(ctx);
  const agentCreatedOrigin = ctx.agentSnapshot?.id
    ? String((ctx as { memoryWriteOrigin?: string }).memoryWriteOrigin || "") === "background_review" ||
      Boolean((ctx as { skillReviewOrigin?: boolean }).skillReviewOrigin)
    : false;

  if (action === "create") {
    const content = String(args.content || "");
    if (!content.trim()) return { error: "create 需要完整 SKILL.md content（frontmatter + body）" };
    const result = await upsertProceduralSkill(ctx, name, content, { agentCreated: agentCreatedOrigin || true });
    if ("error" in result && result.error) return result;
    markSkillAgentCreated(name, root);
    const pkgDir = skillPackageDir(root, name);
    const scan = scanSkillPackage(fs.existsSync(pkgDir) ? pkgDir : skillMdPath(root, name, "procedural"));
    if (!scan.ok) {
      return {
        ...result,
        securityScan: scan,
        error: `Skill「${name}」已写入但安全扫描未通过（critical）：${scan.findings
          .filter((f) => f.severity === "critical")
          .map((f) => `${f.rule}@${f.path}`)
          .join("; ")}。请 patch 后重试。`,
      };
    }
    return {
      ...result,
      securityScan: scan,
      message: `Skill「${name}」已创建（procedural 包）。用 skills_list / skill_view 加载。`,
    };
  }

  if (action === "edit") {
    const content = String(args.content || "");
    if (!content.trim()) return { error: "edit 需要完整 SKILL.md content" };
    const result = await upsertProceduralSkill(ctx, name, content);
    if ("error" in result && result.error) return result;
    bumpSkillPatch(name, root);
    return { ...result, message: `Skill「${name}」已全文重写。` };
  }

  if (action === "patch") {
    const oldString = String(args.old_string ?? args.oldString ?? "");
    const newString = String(args.new_string ?? args.newString ?? "");
    if (!oldString) return { error: "patch 需要 old_string" };
    const filePath = args.file_path ? String(args.file_path) : args.filePath ? String(args.filePath) : "";
    if (filePath) {
      const read = readSkillSupportFile(root, name, filePath);
      if (!read.ok) return { error: read.error };
      if (!read.content.includes(oldString)) {
        return { error: "old_string 未在目标文件中找到（请先 skill_view）" };
      }
      const replaceAll = args.replace_all === true || args.replaceAll === true;
      const next = replaceAll
        ? read.content.split(oldString).join(newString)
        : read.content.replace(oldString, newString);
      const written = writeSkillSupportFile(root, name, filePath, next);
      if (!written.ok) return { error: written.error };
      bumpSkillPatch(name, root);
      return { success: true, name, file_path: filePath, message: "附属文件已 patch。" };
    }
    const list = await ctx.services.skill.list({ page: 1, pageSize: 50, keyword: name });
    const skill = list.items.find((s) => sanitizeSkillName(s.name) === name);
    if (!skill) {
    return {
      error: `Skill「${name}」不存在。下一步：调用 skills_list 核对精确 name（大小写与连字符必须一致），不要编造名称。`,
    };
  }
    const kind = parseSkillKind(skill.metaJson, "executable");
    const mdPath = skillMdPath(root, name, kind === "procedural" ? "procedural" : "executable");
    let raw = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, "utf-8") : skill.code;
    if (!raw.includes(oldString) && !skill.code.includes(oldString)) {
      return { error: "old_string 未找到。请先 skill_view 再 patch。" };
    }
    const replaceAll = args.replace_all === true || args.replaceAll === true;
    const target = raw.includes(oldString) ? raw : skill.code;
    const next = replaceAll ? target.split(oldString).join(newString) : target.replace(oldString, newString);
    if (kind === "procedural" || fs.existsSync(path.join(skillPackageDir(root, name), "SKILL.md"))) {
      const full = next.startsWith("---")
        ? next
        : buildProceduralFrontmatter({ name, description: skill.description }) + next;
      fs.mkdirSync(skillPackageDir(root, name), { recursive: true });
      fs.writeFileSync(path.join(skillPackageDir(root, name), "SKILL.md"), full, "utf-8");
      await ctx.services.skill.update({
        id: skill.id,
        code: splitSkillMd(full).body.trim(),
        tags: parseTagsFromSkillMd(full),
      } as never);
    } else {
      await ctx.services.skill.update({
        id: skill.id,
        code: next,
        ...(next.startsWith("---") ? { tags: parseTagsFromSkillMd(next) } : {}),
      } as never);
    }
    bumpSkillPatch(name, root);
    return { success: true, name, message: "SKILL.md 已 patch。" };
  }

  if (action === "write_file") {
    const filePath = String(args.file_path ?? args.filePath ?? "");
    const fileContent = String(args.file_content ?? args.fileContent ?? "");
    if (!filePath) return { error: "write_file 需要 file_path" };
    const written = writeSkillSupportFile(root, name, filePath, fileContent);
    if (!written.ok) return { error: written.error };
    bumpSkillPatch(name, root);
    const scan = scanSkillPackage(skillPackageDir(root, name));
    if (!scan.ok) {
      return {
        success: true,
        name,
        file_path: filePath,
        securityScan: scan,
        error: `文件已写入但安全扫描未通过：${scan.findings
          .filter((f) => f.severity === "critical")
          .map((f) => `${f.rule}@${f.path}`)
          .join("; ")}`,
      };
    }
    return {
      success: true,
      name,
      file_path: filePath,
      securityScan: scan,
      message: "附属文件已写入。",
    };
  }

  if (action === "remove_file") {
    const filePath = String(args.file_path ?? args.filePath ?? "");
    const read = readSkillSupportFile(root, name, filePath);
    if (!read.ok) return { error: read.error };
    fs.unlinkSync(read.absPath);
    bumpSkillPatch(name, root);
    return { success: true, name, file_path: filePath, message: "附属文件已删除。" };
  }

  if (action === "delete") {
    const list = await ctx.services.skill.list({ page: 1, pageSize: 50, keyword: name });
    const skill = list.items.find((s) => sanitizeSkillName(s.name) === name);
    if (!skill) {
    return {
      error: `Skill「${name}」不存在。下一步：调用 skills_list 核对精确 name（大小写与连字符必须一致），不要编造名称。`,
    };
  }
    const kind = parseSkillKind(skill.metaJson, "executable");
    const archived = archiveSkillPackage(root, name, kind === "procedural" ? "procedural" : "executable");
    if (!archived.ok) return { error: archived.error };
    // DB：禁用并标记归档，不硬删（可恢复）
    const meta = parseMeta(skill.metaJson);
    meta.archived = true;
    meta.archivedTo = archived.archivedTo;
    meta.kind = kind;
    await ctx.services.skill.update({
      id: skill.id,
      enabled: false,
      metaJson: JSON.stringify(meta),
    } as never);
    markSkillArchived(name, root);
    return {
      success: true,
      name,
      archived: true,
      archivedTo: archived.archivedTo,
      message: `Skill「${name}」已归档（非硬删），可用文件恢复。`,
    };
  }

  return {
    error: `未知 action「${action}」。可用: create, patch, edit, write_file, remove_file, delete`,
  };
}

const SKILLS_DEFS: NativeToolDefinition[] = [
  {
    name: "skills_list",
    description:
      "列出可用 Skill 元数据（渐进披露第 1 层）。返回 name/短 description/kind/tags；「非常有用」「必装」优先。需要正文时用 skill_view。",
    parameters: zodParams(
      z.object({
        keyword: z.string().describe("可选关键词过滤").optional(),
        tag: z.string().describe("按统一标签筛选，如「非常有用」").optional(),
        includeDisabled: z.boolean().describe("是否包含未启用").optional(),
      }),
    ),
  },
  {
    name: "skill_view",
    description:
      "加载 Skill 正文（渐进披露第 2 层）。" +
      "【必填】name=skills_list 返回的精确名称。" +
      "【默认】不传 file_path：返回该 Skill 主正文（SKILL.md / code）。" +
      "【仅当】kind=procedural 且要读包内附属文件时，再传 file_path（必须以 references/、templates/、scripts/、assets/ 之一开头）。" +
      "executable / reference 不要传 file_path。禁止用 skill__* 旁路代替本工具读 procedural 手册。",
    parameters: zodParams(
      z.object({
        name: z
          .string()
          .describe(
            "【必填】Skill 精确名称，例 \"daily-fragments-workspace\"。大小写与连字符必须与 skills_list 一致。",
          ),
        file_path: z
          .string()
          .describe(
            "【可选】仅 procedural 包。相对 Skill 包内路径，例 \"references/api.md\"。" +
              "省略=读主正文。禁止 \"..\" 与绝对路径。",
          )
          .optional(),
      }),
    ),
  },
  {
    name: "skill_manage",
    description:
      "管理 Skill。必填 action+name。action=create|patch|edit|write_file|remove_file|delete。" +
      "create/edit 要 content；patch 要 old/new_string；write_file 要 path+content。name 用小写连字符。",
    parameters: zodParams(
      z.object({
        action: z
          .enum(["create", "patch", "edit", "write_file", "remove_file", "delete"])
          .describe("【必填】create|patch|edit|write_file|remove_file|delete，小写字面量。"),
        name: z
          .string()
          .describe("【必填】小写连字符 skill 名，例 \"daily-fragments-workspace\"。"),
        content: z
          .string()
          .describe("【create/edit 必填】完整 SKILL.md（含 frontmatter）。其它 action 省略。")
          .optional(),
        old_string: z
          .string()
          .describe("【patch 必填】被替换的旧片段，必须与文件中原文完全一致。")
          .optional(),
        new_string: z
          .string()
          .describe("【patch 必填】替换后的新片段；可为空字符串表示删除该段。")
          .optional(),
        replace_all: z
          .boolean()
          .describe("【可选】patch 时是否替换全部匹配；默认 false 只替换第一处。")
          .optional(),
        file_path: z
          .string()
          .describe(
            "【write_file/remove_file 必填】包内相对路径，例 \"references/notes.md\"。" +
              "必须以 references/、templates/、scripts/、assets/ 之一开头。",
          )
          .optional(),
        file_content: z
          .string()
          .describe("【write_file 必填】要写入附属文件的完整文本。")
          .optional(),
      }),
    ),
  },
];

const SKILLS_HANDLERS: Record<string, NativeToolHandler> = {
  skills_list: skillsListTool,
  skill_view: skillViewTool,
  skill_manage: skillManageTool,
};

export function registerSkillsTools(): void {
  registerNativeDomain(SKILLS_DEFS, SKILLS_HANDLERS);
}

export { inferKindFromScanPath };
