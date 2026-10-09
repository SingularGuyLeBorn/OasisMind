import fs from "node:fs";
import path from "node:path";
const root = path.resolve(".reading");
const errors = new Map();
let files = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith(".json")) {
      files++;
      const { html, excerptHtml } = JSON.parse(fs.readFileSync(file, "utf8"));
      for (const match of `${html ?? ""}${excerptHtml ?? ""}`.matchAll(/class="katex-error"[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/span>/g)) {
        const key = match[1];
        const group = errors.get(key) ?? { count: 0, sample: path.relative(root, file), formula: match[2].slice(0, 180) };
        group.count++;
        errors.set(key, group);
      }
    }
  }
}
walk(root);
console.log(JSON.stringify({ files, errors: [...errors.entries()].map(([error, detail]) => ({ error, ...detail })) }, null, 2));
