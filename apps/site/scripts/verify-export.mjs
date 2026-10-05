/**
 * 公开站静态导出验收。
 *
 * 只读检查 apps/site/out：确认首页、404、索引、搜索和至少一篇文章的 JSON/Markdown/页面
 * 都存在；随后用最小静态文件服务器验证 GET/HEAD/OPTIONS 与 404，并明确拒绝四种写方法。
 * 服务器仅用于本机验收，不是生产运行时，公开部署仍应直接托管 out 目录。
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(siteRoot, "out");
const readOnlyMethods = new Set(["GET", "HEAD", "OPTIONS"]);

function fail(message) {
  throw new Error(`公开站导出验收失败：${message}`);
}

function requireFile(relativePath) {
  const absolute = path.join(outDir, relativePath);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) fail(`缺少 ${relativePath}`);
  return absolute;
}

function exportedPagePath(pathname) {
  if (pathname === "/") return "index.html";
  // Next 静态导出在磁盘使用解码后的 Unicode 文件名，URL 仍保持逐段编码。
  const relative = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, "");
  const html = `${relative}.html`;
  if (fs.existsSync(path.join(outDir, html))) return html;
  return path.join(relative, "index.html");
}

requireFile("index.html");
requireFile("404.html");
requireFile("api/v1/index.json");
requireFile("api/v1/search.json");
requireFile("_headers");

const manifest = JSON.parse(fs.readFileSync(path.join(outDir, "api/v1/index.json"), "utf8"));
if (!Number.isInteger(manifest.schemaVersion) || !Array.isArray(manifest.posts) || manifest.posts.length === 0) {
  fail("index.json 没有稳定 schemaVersion 或公开文章");
}
const sample = manifest.posts[0];
requireFile(`api/v1/posts/${sample.garden}/${sample.slug}.json`);
requireFile(`api/v1/posts/${sample.garden}/${sample.slug}.md`);
const articlePath = `/articles/${encodeURIComponent(sample.garden)}/${sample.slug
  .split("/")
  .map(encodeURIComponent)
  .join("/")}`;
requireFile(exportedPagePath(articlePath));

const jsFiles = [];
const walkJs = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walkJs(absolute);
    else if (entry.isFile() && entry.name.endsWith(".js")) jsFiles.push(absolute);
  }
};
walkJs(path.join(outDir, "_next"));
const runtimeSource = jsFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
for (const forbidden of ["api/trpc", "localhost:3010", "postAnnotationRouter", "SessionStreamHub", "PrismaClient"]) {
  if (runtimeSource.includes(forbidden)) fail(`浏览器脚本泄漏本地运行时标识：${forbidden}`);
}

const server = http.createServer((request, response) => {
  const method = request.method ?? "GET";
  response.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  if (!readOnlyMethods.has(method)) {
    response.statusCode = 405;
    response.setHeader("Allow", "GET, HEAD, OPTIONS");
    response.end("Method Not Allowed");
    return;
  }
  if (method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }

  const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
  const decoded = decodeURIComponent(pathname).replace(/^\/+/, "");
  const candidates = pathname === "/"
    ? ["index.html"]
    : [decoded, `${decoded}.html`, path.join(decoded, "index.html")];
  const relative = candidates.find((candidate) => {
    const absolute = path.resolve(outDir, candidate);
    return absolute.startsWith(`${outDir}${path.sep}`) && fs.existsSync(absolute) && fs.statSync(absolute).isFile();
  });
  if (!relative) {
    response.statusCode = 404;
    response.end(method === "HEAD" ? undefined : fs.readFileSync(path.join(outDir, "404.html")));
    return;
  }
  const body = fs.readFileSync(path.join(outDir, relative));
  response.statusCode = 200;
  response.setHeader("Content-Length", body.length);
  response.end(method === "HEAD" ? undefined : body);
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

try {
  const address = server.address();
  if (!address || typeof address === "string") fail("无法取得本机验收端口");
  const base = `http://127.0.0.1:${address.port}`;
  const cases = [
    ["GET", "/", 200],
    ["HEAD", "/api/v1/index.json", 200],
    ["OPTIONS", "/api/v1/index.json", 204],
    ["GET", "/api/v1/search.json", 200],
    ["GET", sample.apiPath, 200],
    ["GET", sample.markdownPath, 200],
    ["GET", articlePath, 200],
    ["GET", "/api/v1/posts/not-found.json", 404],
    ["POST", sample.apiPath, 405],
    ["PUT", sample.apiPath, 405],
    ["PATCH", sample.apiPath, 405],
    ["DELETE", sample.apiPath, 405],
  ];
  for (const [method, pathname, expectedStatus] of cases) {
    const response = await fetch(`${base}${pathname}`, { method });
    if (response.status !== expectedStatus) fail(`${method} ${pathname} 返回 ${response.status}，期望 ${expectedStatus}`);
  }
  console.log(`公开站导出验收通过：${cases.length} 个 HTTP 契约，示例文章 ${sample.id}。`);
} finally {
  await new Promise((resolve) => server.close(resolve));
}
