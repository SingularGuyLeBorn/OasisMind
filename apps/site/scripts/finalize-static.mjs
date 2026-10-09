/**
 * 公开版是 React 组件生成的静态 HTML，浏览器仅水合显式的小控件。
 * 不初始化 Next 路由运行时；删去它的脚本和未使用路由副本，不删正文、配图或公开 API。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { finalizeReadingHtml } from "./static-html.mjs";

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.join(site, "out");
const basePath = (process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "").replace(/\/$/, "");
const result = await build({
  entryPoints: [path.join(site, "scripts/reading-widgets.tsx")],
  outdir: path.join(root, "_reading"),
  entryNames: "[name]-[hash]", chunkNames: "chunks/[name]-[hash]",
  bundle: true, splitting: true, format: "esm", minify: true, metafile: true,
  jsx: "automatic", tsconfig: path.join(site, "tsconfig.json"),
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_SITE_BASE_PATH": JSON.stringify(basePath),
    "process.env.NEXT_PUBLIC_SITE_URL": JSON.stringify(process.env.NEXT_PUBLIC_SITE_URL ?? ""),
  },
});
const entry = Object.entries(result.metafile.outputs).find(([, value]) => value.entryPoint?.endsWith("reading-widgets.tsx"))?.[0];
if (!entry) throw new Error("缺少公开阅读控件入口");
const scriptUrl = basePath + "/" + path.relative(root, path.resolve(entry)).replace(/\\/g, "/");
let removed = 0;
let pages = 0;
function remove(file) {
  const resolved = path.resolve(file);
  if (!resolved.startsWith(root + path.sep)) throw new Error("静态产物清理越界");
  removed += fs.statSync(resolved).size;
  fs.unlinkSync(resolved);
}
function walk(directory, inNextSegment = false) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    const relative = path.relative(root, file).replace(/\\/g, "/");
    if (relative === "api" || relative === "_reading") continue;
    const segment = inNextSegment || item.name.startsWith("__next.");
    if (item.isDirectory()) { walk(file, segment); continue; }
    if (item.name.endsWith(".txt") && (segment || fs.existsSync(file.slice(0, -4) + ".html"))) {
      remove(file); continue;
    }
    if (!item.name.endsWith(".html")) continue;
    const original = fs.readFileSync(file, "utf8");
    const html = finalizeReadingHtml(original, scriptUrl);
    fs.writeFileSync(file, html);
    removed += Buffer.byteLength(original) - Buffer.byteLength(html);
    pages += 1;
  }
}
walk(root);
console.log(`静态阅读发布：${pages} 页，去掉 ${(removed / 1024 / 1024).toFixed(1)} MiB 框架副本，正文与 API 保留。`);
