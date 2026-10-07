/**
 * content/ 知识库体检：
 * 1. files       只允许知识库文件类型（md / 图片 / pdf / 归档 html，及 uploads 素材、rl 教学附件）
 * 2. links       正文里的相对链接与图片必须在磁盘上真实存在
 * 3. frontmatter 入库的 md 必须有 frontmatter 且含 title（om-sync 缺 title 时会拿路径当标题）
 * 4. markers     读者可见正文不得残留审稿批注
 * 5. structure   正文标题数量与单节跨度不得退化成扩写内容堆在末节
 * 6. tree        一级、二级知识节点必须使用同名目录与同名首页，三级才允许成为叶子
 *
 * 用法：node scripts/content-check.mjs [files|links|frontmatter|markers|structure|tree ...] [--garden=opd] [--list]
 * 不带检查名 = 常规全文检查；tree 是结构迁移专项，可用 --garden 限定单库。--list 打印每条问题，否则只打印汇总与前 20 条。有问题时退出码 1。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content");

const ALLOWED_EXT = new Set([".md", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".pdf", ".html"]);
const RL_ATTACHMENTS = new Set(["implementation.py", "pipeline_skeleton.py", "experiment.ipynb"]);
/** 不入库成文章的目录（与 om-sync ignore_dirs 一致）及无 _garden 的素材区 */
const NON_POST_TOP = new Set(["uploads", "about"]);
const NON_POST_DIRS = new Set(["images", "public", "assets", ".trash"]);
const TREE_EXCLUDED_GARDENS = new Set(["model-library", "daily-fragments"]);
let gardenFilter = null;
const MARKERS = [
  /[(（]估算[)）]/,
  /[(（]推断[)）]/,
  /纯猜/,
  /为什么还估算/,
  /重新写这一?段/,
  /\bTODO[:：(]|\[TODO\]/,
  /待补(?!全)/,
  /\bFIXME\b/,
];

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === ".trash") continue;
      walk(full, out);
    } else if (ent.isFile()) {
      out.push(full);
    }
  }
  return out;
}

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, "/");

const blank = (m) => m.replace(/[^\n]/g, " ");

/** 去掉围栏代码块、行内代码与数学公式，保留行号 */
function stripCode(text) {
  return text
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank)
    .replace(/`[^`\n]+`/g, blank)
    .replace(/\$\$[\s\S]*?\$\$/g, blank)
    .replace(/(?<![\\$])\$(?!\s)[^$\n]+?(?<!\s)\$/g, blank);
}

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

function checkFiles(files) {
  const issues = [];
  for (const f of files) {
    const r = path.relative(CONTENT, f).replace(/\\/g, "/");
    const name = path.basename(f);
    const ext = path.extname(name).toLowerCase();
    if (r.startsWith("uploads/") || name === ".gitkeep") continue;
    if (r.startsWith("rl/") && RL_ATTACHMENTS.has(name)) continue;
    if (!ALLOWED_EXT.has(ext)) issues.push(`${rel(f)}  不允许的文件类型`);
  }
  return issues;
}

const LINK_RE = /!?\[(?:[^\]\n]|\\\])*\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)|<img\b[^>]*?\bsrc=["']([^"']+)["']/g;

const SPACED_LINK_RE = /\]\((\.{1,2}\/[^)<>\n"']*? [^)<>\n"']*?\.(?:md|png|jpe?g|gif|webp|svg|pdf))\)/gi;

function checkLinks(mdFiles) {
  const issues = [];
  for (const f of mdFiles) {
    const raw = fs.readFileSync(f, "utf8");
    const text = stripCode(raw);
    for (const m of text.matchAll(LINK_RE)) {
      const href = m[1] ?? m[2];
      if (!href || /^([a-z][a-z0-9+.-]*:|\/\/|#|\/)/i.test(href)) continue;
      // 「[^10](LwF)」「[118](不…)」这类脚注 / 引文后紧跟的括号注释不是路径
      if (!/[/.]/.test(href) || /^\.+$/.test(href)) continue;
      let target = href.split("#")[0].split("?")[0];
      if (!target) continue;
      try {
        target = decodeURIComponent(target);
      } catch {
        /* 保留原样 */
      }
      const abs = path.resolve(path.dirname(f), target);
      if (fs.existsSync(abs) || fs.existsSync(`${abs}.md`)) continue;
      issues.push(`${rel(f)}:${lineOf(text, m.index)}  ${href}`);
    }
    // 路径里有裸空格时 Markdown 不认它是链接，LINK_RE 也匹配不到，单独报
    for (const m of text.matchAll(SPACED_LINK_RE)) {
      issues.push(`${rel(f)}:${lineOf(text, m.index)}  ${m[1]}  路径含未转义空格`);
    }
  }
  return issues;
}

function isPostFile(f) {
  const r = path.relative(CONTENT, f).replace(/\\/g, "/");
  const parts = r.split("/");
  if (NON_POST_TOP.has(parts[0])) return false;
  if (parts.slice(0, -1).some((p) => p.startsWith("_") || p.startsWith(".") || NON_POST_DIRS.has(p))) return false;
  return !path.basename(f).startsWith("_");
}

function checkFrontmatter(mdFiles) {
  const issues = [];
  for (const f of mdFiles) {
    if (!isPostFile(f)) continue;
    const head = fs.readFileSync(f, "utf8").replace(/^\uFEFF/, "");
    const m = head.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) issues.push(`${rel(f)}  缺 frontmatter`);
    else if (!/^title:\s*\S/m.test(m[1])) issues.push(`${rel(f)}  frontmatter 缺 title`);
  }
  return issues;
}

function checkMarkers(mdFiles) {
  const issues = [];
  for (const f of mdFiles) {
    const text = stripCode(fs.readFileSync(f, "utf8"));
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      const hit = MARKERS.find((re) => re.test(line));
      if (hit) issues.push(`${rel(f)}:${i + 1}  ${line.trim().slice(0, 80)}`);
    });
  }
  return issues;
}

function checkStructure(mdFiles) {
  const issues = [];
  for (const f of mdFiles) {
    const r = path.relative(CONTENT, f).replace(/\\/g, "/");
    if (r.startsWith("model-library/") || r.endsWith("-bi.md")) continue;

    const lines = stripCode(fs.readFileSync(f, "utf8")).split(/\r?\n/);
    const headings = [];
    lines.forEach((line, index) => {
      const m = line.match(/^(#{2,4})\s+(.+)/);
      if (m) headings.push({ index, level: m[1].length, title: m[2].trim() });
    });

    const h2 = headings.filter((h) => h.level === 2).length;
    const h3 = headings.filter((h) => h.level === 3).length;
    const h4 = headings.filter((h) => h.level === 4).length;
    if (h2 > 7) issues.push(`${rel(f)}  二级标题 ${h2} 个，超过 7 个`);
    if (h3 > 16) issues.push(`${rel(f)}  三级标题 ${h3} 个，超过 16 个`);
    if (h4) issues.push(`${rel(f)}  含 ${h4} 个四级标题，请改为同一论证节内的段落路标`);

    headings.forEach((heading, i) => {
      if (heading.level !== 3) return;
      const next = headings.slice(i + 1).find((h) => h.level <= 3);
      const body = lines.slice(heading.index + 1, next?.index ?? lines.length);
      const nonEmpty = body.filter((line) => line.trim()).length;
      const chars = body.join("\n").length;
      if (nonEmpty >= 80 && chars >= 7000) {
        issues.push(
          `${rel(f)}:${heading.index + 1}  「${heading.title}」下有 ${nonEmpty} 个非空行、${chars} 字符`,
        );
      }
    });
  }
  return issues;
}

const FIRST_NODE_RE = /^\d+-/;
const SECOND_NODE_RE = /^\d+\.\d+-/;
const THIRD_NODE_RE = /^\d+\.\d+\.\d+-/;

function checkTree() {
  const issues = [];
  const gardens = fs.readdirSync(CONTENT, { withFileTypes: true }).filter((ent) => {
    if (!ent.isDirectory() || NON_POST_TOP.has(ent.name) || TREE_EXCLUDED_GARDENS.has(ent.name)) return false;
    if (gardenFilter && ent.name !== gardenFilter) return false;
    return fs.existsSync(path.join(CONTENT, ent.name, "_garden.md"));
  });

  for (const garden of gardens) {
    const gardenDir = path.join(CONTENT, garden.name);
    const firstEntries = fs.readdirSync(gardenDir, { withFileTypes: true });
    for (const ent of firstEntries) {
      if (ent.isFile() && ent.name.endsWith(".md") && ent.name !== "_garden.md" && FIRST_NODE_RE.test(ent.name)) {
        issues.push(`${rel(path.join(gardenDir, ent.name))}  TREE_L1_FILE 一级节点必须放入同名目录`);
      }
      if (!ent.isDirectory() || !FIRST_NODE_RE.test(ent.name)) continue;

      const firstDir = path.join(gardenDir, ent.name);
      const firstIndex = path.join(firstDir, `${ent.name}.md`);
      if (!fs.existsSync(firstIndex)) issues.push(`${rel(firstDir)}  TREE_NO_INDEX 一级目录缺同名首页 ${ent.name}.md`);

      const secondEntries = fs.readdirSync(firstDir, { withFileTypes: true });
      let secondNodeCount = 0;
      for (const child of secondEntries) {
        if (child.isFile() && child.name.endsWith(".md") && SECOND_NODE_RE.test(child.name)) {
          issues.push(`${rel(path.join(firstDir, child.name))}  TREE_L2_FILE 二级节点必须放入同名目录`);
        }
        if (!child.isDirectory() || !SECOND_NODE_RE.test(child.name)) continue;
        secondNodeCount += 1;
        const secondDir = path.join(firstDir, child.name);
        const secondIndex = path.join(secondDir, `${child.name}.md`);
        if (!fs.existsSync(secondIndex)) {
          issues.push(`${rel(secondDir)}  TREE_NO_INDEX 二级目录缺同名首页 ${child.name}.md`);
        }
        const thirdEntries = fs.readdirSync(secondDir, { withFileTypes: true });
        const thirdNodeCount = thirdEntries.filter(
          (item) =>
            THIRD_NODE_RE.test(item.name) &&
            (item.isDirectory() || (item.isFile() && item.name.endsWith(".md"))),
        ).length;
        if (!thirdNodeCount) issues.push(`${rel(secondDir)}  TREE_NO_LEAF 二级目录至少需要一个三级主题`);
      }
      if (!secondNodeCount) issues.push(`${rel(firstDir)}  TREE_NO_ROUTE 一级目录至少需要一个二级路线`);
    }
  }
  return issues;
}

const CHECKS = {
  files: checkFiles,
  links: checkLinks,
  frontmatter: checkFrontmatter,
  markers: checkMarkers,
  structure: checkStructure,
  tree: checkTree,
};

const DEFAULT_CHECKS = ["files", "links", "frontmatter", "markers", "structure"];

function main() {
  const args = process.argv.slice(2);
  const listAll = args.includes("--list");
  const gardenArg = args.find((a) => a.startsWith("--garden="));
  gardenFilter = gardenArg?.slice("--garden=".length) || null;
  const selected = args.filter((a) => !a.startsWith("--"));
  const names = selected.length ? selected : DEFAULT_CHECKS;
  for (const n of names) {
    if (!CHECKS[n]) {
      console.error(`未知检查项「${n}」，可选：${Object.keys(CHECKS).join(" / ")}`);
      process.exit(2);
    }
  }

  const files = walk(CONTENT);
  const mdFiles = files.filter((f) => f.toLowerCase().endsWith(".md"));
  let failed = false;
  for (const n of names) {
    const issues = CHECKS[n](n === "files" ? files : mdFiles);
    console.log(`[${n}] ${issues.length ? `${issues.length} 处问题` : "通过"}`);
    for (const line of listAll ? issues : issues.slice(0, 20)) console.log(`  ${line}`);
    if (!listAll && issues.length > 20) console.log(`  ……其余 ${issues.length - 20} 处用 --list 查看`);
    if (issues.length) failed = true;
  }
  process.exit(failed ? 1 : 0);
}

main();
