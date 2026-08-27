#!/usr/bin/env node
/**
 * 一次性导入：账号计划 content/03-papers → 见微 classic-papers 花园。
 * Ilya 27 篇用 extended.md；HiPPO 用 post.md。不拷 PDF / prompts / _legacy / 空 images。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = "D:\\ALL IN AI\\账号计划\\content\\03-papers";
const DEST = path.join(ROOT, "content", "classic-papers");
const ILYA_DIR = path.join(DEST, "ilya-30");

const CATEGORY = (n) => {
  if (n <= 5) return "信息论与复杂度";
  if (n <= 10) return "CNN与视觉";
  if (n <= 13) return "RNN与序列";
  if (n <= 16) return "Attention与Transformer";
  if (n <= 22) return "结构记忆与推理";
  return "训练规模与生成";
};

const GROUP_TITLES = [
  [1, 5, "信息论、复杂度与智能的边界"],
  [6, 10, "CNN 与视觉基础"],
  [11, 13, "RNN 与序列建模"],
  [14, 16, "Attention 与 Transformer"],
  [17, 22, "结构、记忆与推理"],
  [23, 27, "训练、规模与生成"],
];

/** Ilya 原文清单顺序 → 账号计划系列编号 */
const ORIGINAL_TO_SERIES = [
  16, 1, 11, 12, 13, 23, 17, 6, 18, 24, 7, 9, 21, 15, 14, 8, 19, 27, 20, 2, 22, 25, 26, 3, 4, 5, 10,
];

function parseFrontmatter(raw) {
  const text = String(raw ?? "").replace(/^\uFEFF/, "");
  if (!text.startsWith("---")) return { data: {}, body: text };
  const end = text.indexOf("\n---", 3);
  if (end < 0) return { data: {}, body: text };
  const yaml = text.slice(4, end);
  const body = text.slice(end + 4).replace(/^\r?\n/, "");
  const data = {};
  const titleM = yaml.match(/^title:\s*(.+)$/m);
  if (titleM) {
    let t = titleM[1].trim();
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
      t = t.slice(1, -1);
    }
    data.title = t;
  }
  const tagsM = yaml.match(/^tags:\s*\[([^\]]*)\]/m);
  if (tagsM) {
    data.tags = tagsM[1]
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  return { data, body };
}

function collapseWs(s) {
  return String(s).replace(/\s+/g, " ").trim();
}

function excerptFromPost(postBody) {
  const inline = postBody.match(/^摘要[：:]\s*(.+)$/m);
  if (inline?.[1] && inline[1].trim().length > 20) return collapseWs(inline[1]);
  const block = postBody.match(/^摘要\s*$[\r\n]+([\s\S]+?)(?=^[\d]+\.\s|^##\s)/m);
  if (block) {
    const t = collapseWs(block[1].replace(/!\[[^\]]*\]\([^)]+\)/g, ""));
    if (t.length > 20) return t;
  }
  return "";
}

function excerptFromBody(body) {
  for (const line of body.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    if (
      t.startsWith("#") ||
      t.startsWith(">") ||
      t.startsWith("|") ||
      t.startsWith("!") ||
      t.startsWith("-") ||
      t.startsWith("*") ||
      t.startsWith("**全文") ||
      t.startsWith("封面") ||
      t.startsWith("短文标题") ||
      t.startsWith("长文标题") ||
      /^摘要/.test(t)
    ) {
      continue;
    }
    return collapseWs(t.replace(/\*\*/g, ""));
  }
  return "";
}

function stripBrokenImages(body) {
  return body
    .replace(/!\[[^\]]*\]\(images\/[^)]+\)\r?\n?/g, "")
    .replace(/^上图展示了/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

/** prompts.md「配图」段：文件名 → prompt；封面不要。 */
function parseFigurePrompts(md) {
  const cut = String(md).search(/^##\s*封面/m);
  const body = cut >= 0 ? md.slice(0, cut) : String(md);
  const map = new Map();
  const re = /^###\s+(\S+\.(?:png|jpe?g|webp))\s*$/gim;
  const hits = [...body.matchAll(re)];
  for (let i = 0; i < hits.length; i++) {
    const name = hits[i][1];
    const start = hits[i].index + hits[i][0].length;
    const end = i + 1 < hits.length ? hits[i + 1].index : body.length;
    const prompt = body.slice(start, end).replace(/^\s+|\s+$/g, "");
    if (prompt.length >= 40) map.set(name, prompt);
  }
  return map;
}

/** 碎掉的 ![](images/…) 拿掉；有 prompt 就写在原位置下面，方便以后生成。 */
function replaceImagesWithPrompts(articleBody, prompts) {
  return articleBody.replace(/!\[([^\]]*)\]\(images\/([^)]+)\)/g, (_m, alt, file) => {
    const name = String(file).split("?")[0];
    const prompt = prompts.get(name);
    const heading = alt ? `**${alt}**` : "";
    if (!prompt) return heading;
    return `${heading ? `${heading}\n\n` : ""}\`\`\`text\n${prompt.trim()}\n\`\`\``;
  });
}

function titleFromH1(body) {
  const m = body.match(/^#\s+(.+)$/m);
  if (!m) return "";
  const h = m[1].trim();
  const cut = h.indexOf(": ");
  return (cut > 0 ? h.slice(0, cut) : h).trim();
}

function looksLikeKebabTitle(t) {
  return /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+$/.test(t);
}

function humanizeFolder(dir) {
  return dir.replace(/^\d{2}-/, "").replace(/-/g, " ");
}

function cleanAccountPostBody(body) {
  const cutShort = body.search(/^短正文\s*$/m);
  if (cutShort >= 0) body = body.slice(0, cutShort);
  const cutTag = body.search(/^Tag\s*$/m);
  if (cutTag >= 0) body = body.slice(0, cutTag);
  return body
    .replace(/^封面标题:.*$/gm, "")
    .replace(/^短文标题:.*$/gm, "")
    .replace(/^长文标题:.*$/gm, "")
    .replace(/^摘要\s*$/m, "")
    .replace(/^(\d+)\.\s+(\S.*)$/gm, "## $1. $2")
    .replace(/^\s*\n+/, "")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}

function wrapExcerpt(s) {
  const t = collapseWs(s).slice(0, 280);
  const lines = [];
  let cur = "";
  for (const w of t.split(" ")) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > 76 && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return ["excerpt: >-", ...lines.map((l) => `  ${l}`)].join("\n");
}

function uniqTags(tags) {
  const seen = new Set();
  const out = [];
  for (const t of tags) {
    const x = String(t).trim();
    if (!x || seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}

function serializePost({ title, category, excerpt, tags }) {
  return [
    "---",
    `title: ${JSON.stringify(title)}`,
    `category: ${category}`,
    "published: true",
    wrapExcerpt(excerpt || title),
    "tags:",
    ...tags.map((t) => `  - ${t}`),
    "---",
    "",
  ].join("\n");
}

function writePost(filePath, fm, body) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const text = serializePost(fm) + body.replace(/^\uFEFF/, "").replace(/^\r?\n+/, "");
  fs.writeFileSync(filePath, text.endsWith("\n") ? text : `${text}\n`, "utf8");
}

function copyArticleImages(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return 0;
  const files = fs.readdirSync(srcDir).filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f));
  if (files.length === 0) return 0;
  fs.mkdirSync(destDir, { recursive: true });
  for (const f of files) fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
  return files.length;
}

function mdLink(title, slug) {
  return `[${title}](${slug})`;
}

const ilyaSrcRoot = path.join(SRC, "02-Ilya-推荐30篇论文");
const dirs = fs
  .readdirSync(ilyaSrcRoot)
  .filter((d) => /^\d{2}-/.test(d) && fs.statSync(path.join(ilyaSrcRoot, d)).isDirectory())
  .sort();

if (dirs.length !== 27) {
  throw new Error(`期望 27 个论文目录，实际 ${dirs.length}`);
}

fs.mkdirSync(ILYA_DIR, { recursive: true });

const ilyaItems = [];

for (const dir of dirs) {
  const n = Number(dir.slice(0, 2));
  const extPath = path.join(ilyaSrcRoot, dir, "extended.md");
  const postPath = path.join(ilyaSrcRoot, dir, "post.md");
  if (!fs.existsSync(extPath)) throw new Error(`缺少 extended.md: ${dir}`);
  const { data, body } = parseFrontmatter(fs.readFileSync(extPath, "utf8"));
  const postRaw = fs.existsSync(postPath) ? fs.readFileSync(postPath, "utf8") : "";
  const { data: postFm, body: postBody } = postRaw
    ? parseFrontmatter(postRaw)
    : { data: {}, body: "" };
  let title = String(postFm.title || data.title || titleFromH1(body) || humanizeFolder(dir))
    .replace(/\s*\(Extended\)\s*$/i, "")
    .trim();
  if (looksLikeKebabTitle(title)) {
    title = String(postFm.title || titleFromH1(body) || humanizeFolder(dir)).trim();
  }
  const excerpt = excerptFromPost(postBody) || excerptFromBody(body) || title;
  const tags = uniqTags([...(data.tags || []), ...(postFm.tags || []), "Ilya推荐30篇", "经典论文"]);
  const leaf = dir.toLowerCase();
  // 一文一目录：{leaf}/{leaf}.md + {leaf}/images/，否则 27 篇会抢 ilya-30/images/
  const slug = `ilya-30/${leaf}/${leaf}`;
  if (slug.length > 200) throw new Error(`slug 超长: ${slug} (${slug.length})`);
  const promptsPath = path.join(ilyaSrcRoot, dir, "prompts.md");
  const prompts = fs.existsSync(promptsPath)
    ? parseFigurePrompts(fs.readFileSync(promptsPath, "utf8"))
    : new Map();
  writePost(
    path.join(DEST, "ilya-30", leaf, `${leaf}.md`),
    { title, category: CATEGORY(n), excerpt, tags },
    replaceImagesWithPrompts(body, prompts),
  );
  copyArticleImages(path.join(ilyaSrcRoot, dir, "images"), path.join(DEST, "ilya-30", leaf, "images"));
  const staleFlat = path.join(DEST, "ilya-30", `${leaf}.md`);
  if (fs.existsSync(staleFlat)) fs.unlinkSync(staleFlat);
  ilyaItems.push({ n, slug, title, excerpt });
  console.log(`  ✓ ${slug}`);
}

const byN = new Map(ilyaItems.map((x) => [x.n, x]));

const hippoDir = fs.readdirSync(SRC).find((d) => d.startsWith("01-HiPPO"));
if (!hippoDir) throw new Error("找不到 HiPPO 目录");
const hippoPost = path.join(SRC, hippoDir, "post.md");
const { data: hippoData, body: hippoBody } = parseFrontmatter(fs.readFileSync(hippoPost, "utf8"));
const hippoTitle = String(hippoData.title || "HiPPO: 最优多项式投影记忆").trim();
const hippoExcerpt = excerptFromPost(hippoBody) || excerptFromBody(hippoBody) || hippoTitle;
const hippoSlug = "hippo-最优多项式投影记忆";
writePost(
  path.join(DEST, `${hippoSlug}.md`),
  {
    title: hippoTitle,
    category: "状态空间模型",
    excerpt: hippoExcerpt,
    tags: uniqTags([...(hippoData.tags || []), "经典论文", "沧海遗珠"]),
  },
  `# ${hippoTitle}\n\n${stripBrokenImages(cleanAccountPostBody(hippoBody))}`,
);
console.log(`  ✓ ${hippoSlug}`);

function groupedList() {
  const chunks = [];
  for (const [from, to, heading] of GROUP_TITLES) {
    chunks.push(`### ${heading}`);
    for (let n = from; n <= to; n++) {
      const item = byN.get(n);
      chunks.push(`${n}. ${mdLink(item.title, item.slug)}`);
    }
    chunks.push("");
  }
  return chunks.join("\n").trimEnd();
}

const gardenMd = `---
title: 经典论文
description: 经典论文库：Ilya 推荐 27 篇完整精读为基座，叠加 HiPPO、MoE 等技术路线
---
# 经典论文 Classic Papers

经典论文专题库。基座是 Ilya Sutskever 给 John Carmack 的推荐阅读（权威清单 **27 项**，不是自媒体加戏的「30 篇」），每篇都有完整精读。另收沧海遗珠（HiPPO）与各技术路线经典（MoE 等）。

## 怎么读

1. 先看 [${"Ilya Sutskever 推荐阅读清单"}](ilya-30-papers-reading-list) 了解原文顺序与主题分布。
2. 按下面主题分组逐篇精读（01–05 先建立复杂度/信息论元框架，再 CNN → RNN → Attention，最后结构记忆与规模化）。
3. HiPPO 与 MoE 是清单之外、但今天架构绕不开的补充。

## 基座索引

- [Ilya Sutskever 推荐阅读：约 30 篇深度学习论文清单](ilya-30-papers-reading-list) — 「学会这些就掌握今天 90% 的重要知识」

## Ilya 推荐 27 篇 · 逐篇精读

${groupedList()}

## 沧海遗珠

- [${hippoTitle}](${hippoSlug}) — 连续记忆的最优多项式投影，S4 / Mamba 的理论起点

## 用户贡献：MoE 技术路线

- [MoE 经典（一）：Outrageously Large Neural Networks（Shazeer et al. 2017）](moe-classic-1-sparsely-gated) — 稀疏门控 MoE 层、137B 参数、容量涨 1000 倍
- [MoE 经典（二）：Switch Transformer（Fedus et al. 2021）](moe-classic-2-switch-transformer) — top-1 门控、7 倍加速、万亿参数
`;

fs.writeFileSync(path.join(DEST, "_garden.md"), gardenMd.endsWith("\n") ? gardenMd : `${gardenMd}\n`, "utf8");

const originalLines = [
  ["The Annotated Transformer", "Sasha Rush 等（Blog + Code，注释版 Transformer 教程）"],
  ["The First Law of Complexodynamics", "Scott Aaronson（Blog）"],
  ["The Unreasonable Effectiveness of Recurrent Neural Networks", "Andrej Karpathy（Blog + Code）"],
  ["Understanding LSTM Networks", "Christopher Olah（Blog）"],
  ["Recurrent Neural Network Regularization", "Wojciech Zaremba 等（arXiv）"],
  ["Keeping Neural Networks Simple by Minimizing the Description Length of the Weights", "Geoffrey Hinton & Drew van Camp"],
  ["Pointer Networks", "Oriol Vinyals 等"],
  ["ImageNet Classification with Deep Convolutional Neural Networks", "（AlexNet）— Alex Krizhevsky 等"],
  ["Order Matters: Sequence to Sequence for Sets", "Oriol Vinyals 等"],
  ["GPipe: Easy Scaling with Micro-Batch Pipeline Parallelism", "Yanping Huang 等"],
  ["Deep Residual Learning for Image Recognition", "（ResNet）— Kaiming He 等"],
  ["Multi-Scale Context Aggregation by Dilated Convolutions", "Fisher Yu & Vladlen Koltun"],
  ["Neural Message Passing for Quantum Chemistry", "Justin Gilmer 等"],
  ["Attention Is All You Need", "（Transformer）— Ashish Vaswani 等"],
  ["Neural Machine Translation by Jointly Learning to Align and Translate", "（Bahdanau Attention）— Dzmitry Bahdanau 等"],
  ["Identity Mappings in Deep Residual Networks", "Kaiming He 等"],
  ["A Simple Neural Network Module for Relational Reasoning", "Adam Santoro 等"],
  ["Variational Lossy Autoencoder", "Xi Chen 等"],
  ["Relational Recurrent Neural Networks", "Adam Santoro 等"],
  ["Quantifying the Rise and Fall of Complexity in Closed Systems: The Coffee Automaton", "Scott Aaronson 等"],
  ["Neural Turing Machines", "Alex Graves 等"],
  ["Deep Speech 2: End-to-End Speech Recognition in English and Mandarin", "Dario Amodei 等"],
  ["Scaling Laws for Neural Language Models", "Jared Kaplan 等"],
  ["A Tutorial Introduction to the Minimum Description Length Principle", "Peter Grunwald"],
  ["Machine Super Intelligence", "Shane Legg"],
  ["Kolmogorov Complexity and Algorithmic Randomness", "A. Shen, V. A. Uspensky, N. Vereshchagin"],
  ["CS231n: Convolutional Neural Networks for Visual Recognition", "Stanford 课程"],
];

const originalMd = originalLines
  .map(([title, rest], i) => {
    const series = ORIGINAL_TO_SERIES[i];
    const item = byN.get(series);
    return `${i + 1}. **${title}** — ${rest} · [精读](${item.slug})`;
  })
  .join("\n");

const indexMd = `---
title: "Ilya Sutskever 推荐阅读：约 30 篇深度学习论文清单"
category: 索引
published: true
excerpt: >-
  Ilya Sutskever 给 John Carmack 的约 30 篇深度学习推荐阅读清单全文（镜像
  github.com/dzyim/ilya-sutskever-recommended-reading）+ 主题归类 + 27 篇完整精读入口。
tags:
  - Ilya Sutskever
  - 阅读清单
  - 经典论文
  - 深度学习
  - John Carmack
  - Ilya推荐30篇
---
# Ilya Sutskever 推荐阅读：约 30 篇深度学习论文清单

> 经典论文库基座。来源：Ilya Sutskever 给 John Carmack 的推荐阅读清单（约 30 篇），GitHub 镜像：github.com/dzyim/ilya-sutskever-recommended-reading。Ilya 原话：「If you really learn all of these, you'll know 90% of what matters today.」（真把这些都学会，你就掌握了今天 90% 的重要知识。）
>
> 篇数说明：Ilya 原话是 approx 30。社区公认最完整版本是上述 GitHub 仓库，**共 27 项**。中文互联网多出来的 Multi-token Prediction、DPR、RAG 等是自媒体加戏，不在原始清单里。下面每条都链到库内完整精读。

## 清单全文（按原文顺序）

${originalMd}

## 按主题精读（建议阅读顺序）

先 01–05 建立复杂度 / 信息论 / 智能的元框架，再 CNN → RNN → Attention，然后结构记忆，最后规模与生成。

${groupedList()}

## 主题分布（我的归类）

- **序列建模**：原文 #1-5、9、15、19、21（Transformer 前夜的 RNN/注意力生态）
- **CNN 与视觉**：原文 #8、11、12、16、27（AlexNet → ResNet → dilated conv → CS231n）
- **规模化与并行**：原文 #10（GPipe）、#23（Scaling Laws）
- **表示与推理**：原文 #7（Pointer）、#13（消息传递）、#17（关系推理）、#18（VLAE）
- **理论基石**：原文 #2、6、20、24、25、26（复杂度、MDL、Kolmogorov、超级智能）

## 与库内其他内容的关联

- Transformer/Attention（精读 14–16）→ 是扩散 LLM 库、llm-guide 的前置
- Scaling Laws（精读 26）→ 直接支撑 RSI 库「预训练终结」叙事的背景
- Hinton MDL（精读 23）+ Kolmogorov（精读 05）→ 深度学习的描述长度视角，与 RSI 库「模仿学习 vs RL」互文
- Shane Legg（精读 04）→ 智能的定义（与通用智能的度量相关）
- HiPPO（清单外）→ [最优多项式投影记忆](${hippoSlug})，S4 / Mamba 的连续记忆起点
`;

fs.writeFileSync(
  path.join(DEST, "ilya-30-papers-reading-list.md"),
  indexMd.endsWith("\n") ? indexMd : `${indexMd}\n`,
  "utf8",
);

console.log(`\n导入完成：Ilya ${ilyaItems.length} 篇 + HiPPO 1 篇 → ${DEST}`);
