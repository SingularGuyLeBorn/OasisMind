/**
 * 把飞书 Wiki 可访问子树导出到本地 Markdown + 图片。
 * 默认落点 data/feishu-wiki-export/（gitignore，不入库）。
 *
 * pnpm --filter @oasismind/server feishu:export-wiki -- --root <nodeToken>
 */
import fs from "node:fs";
import path from "node:path";
import { loadRootEnv, getAppConfig } from "../infra/config.js";
import { prisma } from "../db.js";
import { feishuApi, getUserAccessToken } from "../infra/feishuClient.js";

loadRootEnv();
const config = getAppConfig();

const FEISHU_BASE = "https://open.feishu.cn/open-apis";
const DEFAULT_ROOT = "NeAQwqst2iWgXyk6C1QcaEAUnEc";
const DEFAULT_SPACE = "7486731068910190620";
/** [OM-FREEPLAY] 保守间隔，避开飞书频控 */
const GAP_MS = 80;

type WikiNode = {
  title?: string;
  node_token?: string;
  obj_token?: string;
  obj_type?: string;
  has_child?: boolean;
  parent_node_token?: string;
  space_id?: string;
};

type FeishuBlock = {
  block_id?: string;
  parent_id?: string;
  block_type?: number;
  children?: string[];
  [key: string]: unknown;
};

type ManifestDoc = {
  title: string;
  node_token: string;
  obj_token?: string;
  obj_type?: string;
  relDir: string;
  chars?: number;
  images?: number;
  ok: boolean;
  error?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs(argv: string[]): { root: string; space: string; out?: string } {
  const rest = argv.slice(2);
  let root = DEFAULT_ROOT;
  let space = DEFAULT_SPACE;
  let out: string | undefined;
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i] ?? "";
    if (a === "--root") root = String(rest[++i] ?? root);
    else if (a === "--space") space = String(rest[++i] ?? space);
    else if (a === "--out") out = String(rest[++i] ?? "");
    else if (a === "-h" || a === "--help") {
      console.log(
        "pnpm --filter @oasismind/server feishu:export-wiki -- [--root nodeToken] [--space spaceId] [--out dir]",
      );
      process.exit(0);
    }
  }
  return { root, space, out };
}

function safeName(title: string, fallback: string): string {
  const base = title
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return base || fallback.slice(0, 12);
}

function extFromContentType(ct: string | null, url: string): string {
  const c = (ct || "").split(";")[0]?.trim().toLowerCase() || "";
  if (c === "image/png") return ".png";
  if (c === "image/jpeg" || c === "image/jpg") return ".jpg";
  if (c === "image/gif") return ".gif";
  if (c === "image/webp") return ".webp";
  if (c === "image/svg+xml") return ".svg";
  if (c === "application/pdf") return ".pdf";
  const m = url.match(/\.(png|jpe?g|gif|webp|svg|pdf)(?:\?|$)/i);
  if (m) return `.${m[1]!.toLowerCase().replace("jpeg", "jpg")}`;
  return ".bin";
}

type TextEl = {
  text_run?: {
    content?: string;
    text_element_style?: {
      bold?: boolean;
      italic?: boolean;
      strikethrough?: boolean;
      underline?: boolean;
      inline_code?: boolean;
      link?: { url?: string };
    };
  };
  equation?: { content?: string };
  mention_doc?: { title?: string; url?: string };
};

function elementsToMd(elements: TextEl[] | undefined): string {
  if (!elements?.length) return "";
  let out = "";
  for (const el of elements) {
    if (el.equation?.content) {
      out += `$${el.equation.content}$`;
      continue;
    }
    if (el.mention_doc) {
      const t = el.mention_doc.title || "文档";
      out += el.mention_doc.url ? `[${t}](${el.mention_doc.url})` : t;
      continue;
    }
    const run = el.text_run;
    if (!run) continue;
    let t = run.content ?? "";
    const st = run.text_element_style ?? {};
    if (st.inline_code) t = `\`${t}\``;
    else {
      if (st.bold) t = `**${t}**`;
      if (st.italic) t = `*${t}*`;
      if (st.strikethrough) t = `~~${t}~~`;
    }
    if (st.link?.url) {
      try {
        t = `[${t}](${decodeURIComponent(st.link.url)})`;
      } catch {
        t = `[${t}](${st.link.url})`;
      }
    }
    out += t;
  }
  return out;
}

function blockText(block: FeishuBlock | undefined): string {
  if (!block || block.block_type == null) return "";
  const type = block.block_type;
  const keys = [
    "page",
    "text",
    "heading1",
    "heading2",
    "heading3",
    "heading4",
    "heading5",
    "heading6",
    "heading7",
    "heading8",
    "heading9",
    "bullet",
    "ordered",
    "code",
    "quote",
    "todo",
    "callout",
    "equation",
  ];
  for (const k of keys) {
    const v = block[k] as { elements?: TextEl[] } | undefined;
    if (v && Array.isArray(v.elements)) return elementsToMd(v.elements);
  }
  if (type >= 3 && type <= 11) {
    const k = `heading${type - 2}`;
    const v = block[k] as { elements?: TextEl[] } | undefined;
    return elementsToMd(v?.elements);
  }
  return "";
}

async function getNode(token: string): Promise<WikiNode> {
  const data = (await feishuApi(
    "/wiki/v2/spaces/get_node",
    { query: { token }, useUserToken: true },
    prisma,
    config,
  )) as { node?: WikiNode };
  return data.node ?? {};
}

async function listChildren(spaceId: string, parent: string): Promise<WikiNode[]> {
  const items: WikiNode[] = [];
  let pageToken = "";
  for (let i = 0; i < 40; i++) {
    await sleep(GAP_MS);
    const page = (await feishuApi(
      `/wiki/v2/spaces/${encodeURIComponent(spaceId)}/nodes`,
      {
        query: {
          parent_node_token: parent,
          page_size: 50,
          page_token: pageToken || undefined,
        },
        useUserToken: true,
      },
      prisma,
      config,
    )) as { items?: WikiNode[]; page_token?: string; has_more?: boolean };
    items.push(...(page.items ?? []));
    if (!page.has_more || !page.page_token) break;
    pageToken = page.page_token;
  }
  return items;
}

async function listAllBlocks(documentId: string): Promise<Map<string, FeishuBlock>> {
  const map = new Map<string, FeishuBlock>();
  let pageToken: string | undefined;
  for (let i = 0; i < 80; i++) {
    const page = (await feishuApi(
      `/docx/v1/documents/${encodeURIComponent(documentId)}/blocks`,
      {
        query: { page_size: 500, page_token: pageToken },
        useUserToken: true,
      },
      prisma,
      config,
    )) as { items?: FeishuBlock[]; page_token?: string; has_more?: boolean };
    for (const b of page.items ?? []) {
      if (b.block_id) map.set(b.block_id, b);
    }
    if (!page.has_more || !page.page_token) break;
    pageToken = page.page_token;
  }
  return map;
}

async function rawContent(documentId: string): Promise<string> {
  const raw = (await feishuApi(
    `/docx/v1/documents/${encodeURIComponent(documentId)}/raw_content`,
    { useUserToken: true },
    prisma,
    config,
  )) as { content?: string };
  return raw.content ?? "";
}

type ImageJob = { token: string; extra?: string; caption: string };

function collectImages(block: FeishuBlock): ImageJob[] {
  const jobs: ImageJob[] = [];
  if (block.block_type === 27) {
    const img = block.image as { token?: string; extra?: string; caption?: { text?: { elements?: TextEl[] } } } | undefined;
    if (img?.token) {
      jobs.push({
        token: img.token,
        extra: img.extra,
        caption: elementsToMd(img.caption?.text?.elements) || "image",
      });
    }
  }
  if (block.block_type === 23) {
    const file = block.file as { token?: string; name?: string } | undefined;
    if (file?.token && /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name || "")) {
      jobs.push({ token: file.token, caption: file.name || "file" });
    }
  }
  return jobs;
}

async function tmpDownloadUrl(fileToken: string): Promise<string | undefined> {
  const data = (await feishuApi(
    "/drive/v1/medias/batch_get_tmp_download_url",
    {
      method: "POST",
      body: { file_tokens: [fileToken] },
      useUserToken: true,
    },
    prisma,
    config,
  )) as { tmp_download_urls?: Array<{ file_token?: string; tmp_download_url?: string }> };
  return data.tmp_download_urls?.find((x) => x.file_token === fileToken)?.tmp_download_url;
}

async function downloadFileToken(
  fileToken: string,
  extra: string | undefined,
  destNoExt: string,
): Promise<string | null> {
  const token = await getUserAccessToken(prisma, config);
  if (!token) throw new Error("无 user_access_token");

  const trySave = async (buf: Buffer, contentType: string | null, srcUrl: string): Promise<string> => {
    const ext = extFromContentType(contentType, srcUrl);
    const dest = destNoExt + ext;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    return dest;
  };

  try {
    const tmp = await tmpDownloadUrl(fileToken);
    if (tmp) {
      const res = await fetch(tmp);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 0) return trySave(buf, res.headers.get("content-type"), tmp);
      }
    }
  } catch {
    /* 走直下 */
  }

  const url = new URL(`${FEISHU_BASE}/drive/v1/medias/${encodeURIComponent(fileToken)}/download`);
  if (extra) url.searchParams.set("extra", extra);
  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) return null;
  return trySave(buf, res.headers.get("content-type"), url.toString());
}

function renderBlocks(
  rootId: string,
  blocks: Map<string, FeishuBlock>,
  imageRel: Map<string, string>,
): string {
  const seen = new Set<string>();

  const cellText = (cellId: string): string => {
    const cell = blocks.get(cellId);
    if (!cell) return "";
    const parts: string[] = [];
    for (const cid of cell.children ?? []) {
      const line = walk(cid, 0).trim();
      if (line) parts.push(line.replace(/\n+/g, "<br>"));
    }
    return parts.join("<br>").replace(/\|/g, "\\|");
  };

  const walk = (id: string, depth: number): string => {
    if (seen.has(id)) return "";
    seen.add(id);
    const b = blocks.get(id);
    if (!b) return "";
    const type = b.block_type ?? 0;
    const indent = "  ".repeat(Math.max(0, depth));

    if (type === 32 || type === 25) return "";

    if (type === 1) {
      return (b.children ?? []).map((c) => walk(c, depth)).join("");
    }
    if (type === 22) return `\n---\n\n`;
    if (type >= 3 && type <= 11) {
      const level = type - 2;
      return `${"#".repeat(level)} ${blockText(b)}\n\n`;
    }
    if (type === 2) {
      const t = blockText(b);
      const nested = (b.children ?? []).map((c) => walk(c, depth)).join("");
      return t ? `${t}\n\n${nested}` : nested;
    }
    if (type === 12) {
      const t = blockText(b);
      const nested = (b.children ?? []).map((c) => walk(c, depth + 1)).join("");
      return `${indent}- ${t}\n${nested}`;
    }
    if (type === 13) {
      const t = blockText(b);
      const nested = (b.children ?? []).map((c) => walk(c, depth + 1)).join("");
      return `${indent}1. ${t}\n${nested}`;
    }
    if (type === 17) {
      const todo = b.todo as { style?: { done?: boolean }; elements?: TextEl[] } | undefined;
      const done = todo?.style?.done ? "x" : " ";
      const nested = (b.children ?? []).map((c) => walk(c, depth + 1)).join("");
      return `${indent}- [${done}] ${blockText(b)}\n${nested}`;
    }
    if (type === 14) {
      const code = b.code as { style?: { language?: number | string }; language?: string } | undefined;
      const lang = String(code?.language ?? code?.style?.language ?? "").replace(/^\d+$/, "");
      return `\`\`\`${lang}\n${blockText(b)}\n\`\`\`\n\n`;
    }
    if (type === 15 || type === 34) {
      const t = blockText(b);
      const nested = (b.children ?? []).map((c) => walk(c, depth)).join("");
      const quoted = t ? t.split("\n").map((l) => `> ${l}`).join("\n") + "\n\n" : "";
      return quoted + nested;
    }
    if (type === 19) {
      const t = blockText(b);
      const nested = (b.children ?? []).map((c) => walk(c, depth)).join("");
      return `> ${t}\n\n${nested}`;
    }
    if (type === 27 || type === 23 || type === 43) {
      return (b.children ?? []).map((c) => walk(c, depth)).join("");
    }
    if (type === 31) {
      const table = b.table as {
        cells?: string[];
        property?: { row_size?: number; column_size?: number };
      } | undefined;
      const cells = table?.cells ?? [];
      const rows = table?.property?.row_size ?? 0;
      const cols = table?.property?.column_size ?? 0;
      if (!rows || !cols || cells.length < rows * cols) {
        return (b.children ?? []).map((c) => walk(c, depth)).join("");
      }
      const lines: string[] = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          row.push(cellText(cells[r * cols + c] ?? "") || " ");
        }
        lines.push(`| ${row.join(" | ")} |`);
        if (r === 0) lines.push(`| ${row.map(() => "---").join(" | ")} |`);
      }
      return `\n${lines.join("\n")}\n\n`;
    }
    if (type === 26) {
      const iframe = b.iframe as { component?: { url?: string } } | undefined;
      const url = iframe?.component?.url;
      return url ? `[嵌入](${url})\n\n` : "";
    }
    if (type === 24) {
      return (b.children ?? []).map((c) => walk(c, depth)).join("");
    }
    const t = blockText(b);
    const nested = (b.children ?? []).map((c) => walk(c, depth)).join("");
    return t ? `${t}\n\n${nested}` : nested;
  };

  return walk(rootId, 0);
}

type TreeNode = WikiNode & { children: TreeNode[] };

async function walkTree(spaceId: string, token: string): Promise<TreeNode> {
  await sleep(GAP_MS);
  let meta: WikiNode;
  try {
    meta = await getNode(token);
  } catch (e) {
    meta = { node_token: token, title: token };
    console.warn("get_node 失败，用 token 占位:", token, e instanceof Error ? e.message : e);
  }
  const node: TreeNode = { ...meta, node_token: meta.node_token || token, children: [] };
  if (meta.has_child && node.node_token) {
    try {
      const kids = await listChildren(spaceId, node.node_token);
      for (const k of kids) {
        if (!k.node_token) continue;
        node.children.push(await walkTree(spaceId, k.node_token));
      }
    } catch (e) {
      console.warn("list children 失败:", node.title, e instanceof Error ? e.message : e);
    }
  }
  return node;
}

function flatten(n: TreeNode, acc: TreeNode[] = []): TreeNode[] {
  acc.push(n);
  for (const c of n.children) flatten(c, acc);
  return acc;
}

function uniqueChildDir(parentAbs: string, title: string, token: string, used: Set<string>): string {
  let name = safeName(title, token);
  if (used.has(name.toLowerCase())) name = `${safeName(title, token)}-${token.slice(0, 6)}`;
  used.add(name.toLowerCase());
  return path.join(parentAbs, name);
}

function assignDirs(root: TreeNode, absRoot: string, map: Map<string, string>): void {
  map.set(root.node_token || "", absRoot);
  const used = new Set<string>();
  for (const c of root.children) {
    const dir = uniqueChildDir(absRoot, c.title || "", c.node_token || "x", used);
    assignDirs(c, dir, map);
  }
}

async function exportDoc(
  node: TreeNode,
  absDir: string,
  wikiHost: string,
): Promise<ManifestDoc> {
  const nodeToken = node.node_token || "";
  const rec: ManifestDoc = {
    title: node.title || nodeToken,
    node_token: nodeToken,
    obj_token: node.obj_token,
    obj_type: node.obj_type,
    relDir: absDir,
    ok: false,
  };
  fs.mkdirSync(absDir, { recursive: true });
  const mdPath = path.join(absDir, "index.md");
  const source = `${wikiHost}/wiki/${nodeToken}`;
  const fm = [
    "---",
    `title: ${JSON.stringify(node.title || "")}`,
    `node_token: ${nodeToken}`,
    `obj_token: ${node.obj_token || ""}`,
    `obj_type: ${node.obj_type || ""}`,
    `source: ${source}`,
    `exported_at: ${new Date().toISOString()}`,
    "---",
    "",
    `# ${node.title || nodeToken}`,
    "",
  ].join("\n");

  if (node.obj_type && node.obj_type !== "docx") {
    const body = `${fm}\n> 非 docx（${node.obj_type}），未展开正文。obj_token=${node.obj_token}\n`;
    fs.writeFileSync(mdPath, body, "utf8");
    rec.ok = true;
    rec.chars = body.length;
    rec.images = 0;
    return rec;
  }
  if (!node.obj_token) {
    fs.writeFileSync(mdPath, `${fm}\n> 无 obj_token\n`, "utf8");
    rec.ok = true;
    rec.chars = 0;
    rec.images = 0;
    return rec;
  }

  try {
    await sleep(GAP_MS);
    const blocks = await listAllBlocks(node.obj_token);
    const imageRel = new Map<string, string>();

    const rootId = blocks.has(node.obj_token)
      ? node.obj_token
      : ([...blocks.values()].find((b) => b.block_type === 1)?.block_id ?? node.obj_token);
    let body = renderBlocks(rootId, blocks, imageRel).trim();
    if (!body) {
      body = (await rawContent(node.obj_token)).trim();
    }
    const md = `${fm}${body}\n`;
    fs.writeFileSync(mdPath, md, "utf8");
    rec.ok = true;
    rec.chars = body.length;
    rec.images = 0;
    return rec;
  } catch (e) {
    rec.error = e instanceof Error ? e.message : String(e);
    try {
      const body = await rawContent(node.obj_token);
      fs.writeFileSync(mdPath, `${fm}${body}\n\n> 块解析失败，已回退 raw_content：${rec.error}\n`, "utf8");
      rec.ok = true;
      rec.chars = body.length;
      rec.images = 0;
    } catch (e2) {
      rec.error = `${rec.error} | raw: ${e2 instanceof Error ? e2.message : e2}`;
      fs.writeFileSync(mdPath, `${fm}\n> 导出失败：${rec.error}\n`, "utf8");
    }
    return rec;
  }
}

function writeToc(root: TreeNode, dirMap: Map<string, string>, outRoot: string, lines: string[] = [], prefix = ""): string[] {
  const abs = dirMap.get(root.node_token || "") || outRoot;
  const rel = path.relative(outRoot, abs).replace(/\\/g, "/");
  const href = rel ? `${rel}/index.md` : "index.md";
  lines.push(`${prefix}- [${root.title}](${href})`);
  for (const c of root.children) writeToc(c, dirMap, outRoot, lines, prefix + "  ");
  return lines;
}

const args = parseArgs(process.argv);
const wikiHost = "https://kcnd4kn8i6ap.feishu.cn";

try {
  console.log("walk", args.root);
  const tree = await walkTree(args.space, args.root);
  const all = flatten(tree);
  console.log(`nodes=${all.length} title=${tree.title}`);

  const outRoot = path.resolve(
    args.out || path.join(config.dataDir, "feishu-wiki-export", safeName(tree.title || "wiki", args.root)),
  );
  fs.mkdirSync(outRoot, { recursive: true });

  const dirMap = new Map<string, string>();
  assignDirs(tree, outRoot, dirMap);

  const docs: ManifestDoc[] = [];
  let i = 0;
  for (const n of all) {
    i += 1;
    const dir = dirMap.get(n.node_token || "") || outRoot;
    console.log(`[${i}/${all.length}] ${n.title} (${n.obj_type})`);
    const existing = path.join(dir, "index.md");
    if (fs.existsSync(existing) && fs.statSync(existing).size > 80) {
      const chars = fs.readFileSync(existing, "utf8").length;
      const rec: ManifestDoc = {
        title: n.title || "",
        node_token: n.node_token || "",
        obj_token: n.obj_token,
        obj_type: n.obj_type,
        relDir: path.relative(outRoot, dir).replace(/\\/g, "/") || ".",
        chars,
        images: 0,
        ok: true,
      };
      docs.push(rec);
      console.log(`  -> skip exists chars=${chars}`);
      continue;
    }
    const rec = await exportDoc(n, dir, wikiHost);
    rec.relDir = path.relative(outRoot, dir).replace(/\\/g, "/") || ".";
    docs.push(rec);
    console.log(
      `  -> ok=${rec.ok} chars=${rec.chars ?? 0} images=${rec.images ?? 0}${rec.error ? " err=" + rec.error : ""}`,
    );
  }

  const toc = [`# ${tree.title}`, "", `导出时间：${new Date().toISOString()}`, "", ...writeToc(tree, dirMap, outRoot)].join("\n");
  fs.writeFileSync(path.join(outRoot, "README.md"), `${toc}\n`, "utf8");
  const ok = docs.filter((d) => d.ok).length;
  const imgs = docs.reduce((s, d) => s + (d.images ?? 0), 0);
  const chars = docs.reduce((s, d) => s + (d.chars ?? 0), 0);
  fs.writeFileSync(
    path.join(outRoot, "_manifest.json"),
    JSON.stringify(
      {
        root: args.root,
        space: args.space,
        outRoot,
        nodes: all.length,
        ok,
        images: imgs,
        chars,
        docs,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(`\nDONE out=${outRoot}`);
  console.log(`docs ${ok}/${all.length}  images=${imgs}  chars=${chars}`);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect().catch(() => undefined);
}
