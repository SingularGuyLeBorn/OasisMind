---
title: "bilibili2skill：B 站教程视频蒸馏为 Agent Skill"
category: "工具 · Skill 生产"
published: true
excerpt: "bilibili2skill 把 B 站视频（或本地 mp4）蒸馏为 Agent 可调用的 Skill 包：CC 字幕/Whisper + crv 场景挑帧，支持 DeepSeek 文本、Claude 画面、Gemini 视频三种后端；格式兼容微软 Resource2Skill，国内 B 站链路跑通。"
tags: ["bilibili2skill", "Skill 蒸馏", "B站", "Resource2Skill", "视频教程"]
---
# bilibili2skill：B 站教程视频蒸馏为 Agent Skill

> **仓库**：[Lambenthan/bilibili2skill](https://github.com/Lambenthan/bilibili2skill)（GPL-3.0）
> **README**：[bilibili2skill.md](../../uploads/github-readme/bilibili2skill.md)
> **上游格式**：[microsoft/Resource2Skill](https://github.com/microsoft/Resource2Skill)（MIT）

## 原文精读

### 动机

微软 Resource2Skill 验证了「教程视频 → 可执行 skill」路径，但绑定 YouTube + Gemini，国内难跑。B 站有大量软件实操/研究方法/编程教学，缺对应蒸馏工具。项目主张：**Claude Code 本身是多模态模型——画面级蒸馏不必再配外部视觉 API**。

### 三种蒸馏模式

| 模式 | 执行者 | 成本/速度 | 适用 |
|---|---|---|---|
| **A（默认）** | 任意文本 LLM 读 CC 字幕 | ~1 min/视频 | 讲解型、批量 |
| **B ⭐** | Claude Code 看关键帧 + 字幕 | ~1 min 素材 + Claude 阅读 | 操作型、质量优先 |
| **C** | Gemini 读视频文件 | 需 GEMINI_API_KEY | 备用 |

模式 A 的 `--backend` 支持 OpenAI 兼容端点（DeepSeek/Kimi/通义/智谱/Ollama 等）、`deepseek` 预设、`anthropic` 协议网关。

### 帧选取：crv 技术

采用 [claude-real-video](https://github.com/HUANGCHIHHUNGLeo/claude-real-video)：**场景切换检测 + 滑动窗口去重**，录屏教程从上千帧压到几十帧，token 约为 Gemini 固定 1 FPS 的 **~1/6**。

### 产出结构

```text
skills_wiki/<domain>/<skill_id>/
├── meta.json            # BV、UP、时长、播放量、license
├── text/overview.md     # 模式提取 → 技术分解 → 复现手册
├── code/skill.py        # 可执行脚本（若有）
└── visual/              # thumbnail + frame_XX.jpg
```

`skill_id = 技能名 + 链接哈希`，同链接重复跑**覆盖不重复**。

### 源层国内适配

- **B 站 API**：搜索/元数据/CC 字幕（`bilibili-api-python`）
- **BBDown**：下载（含合集 `-p` 锁单集）
- **BILIBILI_SESSDATA**：登录态（F12 Console 取 cookie）
- 无 CC 时可 `--transcribe` 回退本地 Whisper

### 与 Resource2Skill 关系

- **继承**：wiki 条目四件套、蒸馏模板、部分管线
- **不含**：原版 Azure OpenAI agent **运行时**——本项目只做「视频 → skill」生产端，产出格式兼容

## 方法/架构解析

### 四层管线

```text
源层（B 站）     bilibili-api + BBDown
    ↓
素材层           crv 挑帧 + CC/Whisper 字幕
    ↓
蒸馏层           DeepSeek / Claude视觉 / Gemini
    ↓
组装层           wiki 四件套 + index.json
```

**模式 B 在 Claude Code 内的标准流程**：

1. `video2skill.py ... --prepare-only` → `prep.json`（帧+字幕）
2. Claude 读素材写 `skill_analysis.md`
3. `video2skill.py --assemble prep.json --analysis skill_analysis.md`

把「看」和「写 skill 文档」放在同一多模态 agent 会话，避免二次 API 视觉计费。

### 常用 CLI

```bash
# 模式 A 全自动
python tools/video2skill.py "https://www.bilibili.com/video/BVxxxx?p=1" --domain blender

# 内置 domain 模板：blender / excel / ppt / web / reaper；其它走通用模板
```

参数：`--max-frames`（默认 ~1帧/15s，40–100）、`--adaptive`（crv 自适应慢渐变镜头）。

### 合规与边界

README **免责声明**：仅对有权使用的视频运行；著作权归 UP 主；批量下载再分发可能侵权。GPL-3.0 来自 bilibili-api 依赖链。

### 与见微 Skill 体系的衔接

蒸馏产物可直接落入 `config/skills/` 或 Agent 可读 wiki；与 Stanford CS329A Skill 的「workflow 数据包」、Polaris skill marketplace 形成 **「内容 → skill 工厂 → agent 消费」** 链路。B 站教程是中文域高价值源，bilibili2skill 补上了 Resource2Skill 在国内的缺口。

### 依赖与环境清单

- Python 3.11+、ffmpeg、BBDown 二进制（`tools/install_bbdown.sh`）
- `.env`：`DEEPSEEK_API_KEY` / OpenAI 兼容 trio、`BILIBILI_SESSDATA`（高码率/CC 字幕/风控）
- Skill 目录：复制 `skills/bilibili2skill/` 到 `~/.claude/skills/` 或项目 `.agents/skills/` 启用模式 B

### domain 模板策略

内置 `blender/excel/ppt/web/reaper` 走专用蒸馏模板（步骤提取更贴软件 UI）；任意新 domain 名走通用模板，仍产出四件套，但 `overview.md` 结构更偏「操作清单 + 注意事项」。批量跑建议先用模式 A 筛库，对高价值操作类视频再模式 B 精修。

对见微知识库维护者，推荐工作流：B 站收藏夹 → bilibili2skill 批量蒸馏 → 人工抽查 `overview.md` 与关键帧 → 迁入 `config/skills/` 或链到 `content/resources/` 索引。模式 B 在 Claude Code 内闭环，适合「边观看边让 Agent 写 skill」；模式 A 适合 overnight 批处理 UP 主系列课。注意 GPL-3.0 与上游 MIT Resource2Skill 的许可证组合，再分发 skill 包时需保留 NOTICE。

## 方法/架构解析（续）

从见微视角，bilibili2skill 解决的是 **中文教程资产无法被 Agent 结构化消费** 的缺口：UP 主视频里的大量「点击哪、快捷键是什么、踩坑是什么」在纯字幕里往往缺失，模式 B 用关键帧补齐。与 `video_transcript` 工具的分工：后者给 Agent 运行时转写文本；前者离线把系列课沉淀为可版本化 skill 目录。维护者应为每个 domain 保留 index 与 license 字段，避免 Agent 把侵权再分发当作工具输出。

蒸馏管线把「观看成本」前移到一次性批处理：运营者只需维护 BV 列表与 domain 标签，Agent 侧检索 skill_id 即可获得可执行步骤与关键帧。对系列课（数十集 Blender/Excel）而言，模式 A overnight 跑通索引，人工仅复核 Top 失败条目，整体 ROI 高于逐集手工写 Markdown 教程。建议同一 UP 主系列使用固定 domain，并在 meta.json 记录 BV 与 license，方便日后合规审计与 Agent 引用溯源。见微可将本工具纳入「资源 → 工具」索引，与 `video_transcript` 运行时能力并列：一个管在线转写，一个管离线 skill 工厂。GPL 许可要求再分发时保留源码与 NOTICE，内部使用蒸馏产物一般无妨，但公开托管 skill 包前需法务扫一遍 UP 主授权范围。

---

> 见微改进对照见 [OasisMind 2026-08 Harness 波改进清单](../../essays/oasis-improvements-2026-08-harness-wave.md)。
