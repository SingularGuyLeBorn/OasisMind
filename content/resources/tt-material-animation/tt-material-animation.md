---
title: "tt-material-animation：材质动画 Prompt Skill"
category: "Skill · 视频 Prompt"
published: true
excerpt: "pbwheel/tt-design 的 material-animation skill：三段式确认（材质工艺 → 视觉隐喻 → 自包含首尾帧 Prompt），覆盖软陶、纸拼贴、孔版、水墨、毛毡、沙画等；npx skills add pbwheel/tt-design 安装。"
tags: ["Skill", "材质动画", "Prompt", "pbwheel", "tt-design"]
---
# tt-material-animation：材质动画 Prompt Skill

> **安装**：`npx skills add pbwheel/tt-design`（或复制 skill 到 `~/.agents/skills/`）
> **来源**：DCSkills / pbwheel / t-design 社区分享

## 原文精读

主打「**材质动画**」创意小视频：把用户指定的实体材质或传统物理媒介，转成**具体工艺 + 视觉隐喻 + 可复制首尾帧/视频 Prompt**；会话内有 image_gen 且用户同意时可生成端点静帧。

**三段式确认**（每步等用户点头）：

1. **材质工艺**：7 材质族 / 9 工艺中推荐 3 候选（跨族）或族内候选；含理由、色彩方向、运动语言。
2. **视觉隐喻**：2–3 方向，各含开场/结尾状态与核心变化动作。
3. **交付**：自包含【图片 Prompt】+【视频 Prompt】+【建议上传图清单】；内嵌 Avoid；**不生成视频**、不建项目目录。

边界：以 Prompt 设计为主；模型无关。

## 方法/架构解析

「**首尾帧思维**」——先锁定起止视觉状态再写变化动作，天然适配 Runway/Kling 等图生视频。与 Minimal Zine Poster（静态编辑）互补：一个管 motion language，一个管 still editorial。

见微若做创意类 Agent tool，可把三段式确认收进 skill workflow，避免一次性堆 Prompt 导致用户失控。

### 材质族示例（README 口径）

软陶定格、半调纸拼贴、孔版印刷、水墨晕染、毛毡、沙画等——Skill 在 Step 1 从 **7 族 9 工艺** 中匹配运动语言（如定格 = 逐帧位移、水墨 = 晕染扩散）。Step 2 隐喻必须可拍成「开场帧/结尾帧」，Step 3 才把光影/构图/Avoid 写进自包含 Prompt。

### 安装与触发

```bash
npx skills add pbwheel/tt-design
```

自然语言亦可触发（「用材质动画 skill 做沙画主题短片 prompt」）。与 bilibili2skill 串联：视频教程 → skill 文档 → tt-material-animation 生成该教程风格的 motion prompt。

材质动画 Skill 的核心价值是**把物理媒介的运动语法翻译进视频模型能执行的 Prompt**——例如毛毡的纤维边缘、孔版的叠色错位。三段确认防止 Agent 一次吐出过长 Prompt 导致用户无法调整工艺选择。适合作为「创意类 subagent」的单项 Skill，而非通用 coding skill。

## 方法/架构解析（续）

pbwheel/tt-design 技能包说明 Agent Skill 生态正在分化为 **工程向**（Stanford CS329A、bilibili2skill）与 **创意向**（本 Skill、Minimal Zine）。安装命令 `npx skills add pbwheel/tt-design` 会把 skill 注册到兼容目录，见微侧无需改 server。运营上建议创意 Skill 与内容审核策略绑定：生成 Prompt 不含真人肖像指令、不含未授权商标，避免下游视频模型误用。三段式确认尤其适合非设计背景用户，避免一次生成不可控的长 Prompt。可与 bilibili2skill 产出的操作类 skill 联用：教程蒸馏负责步骤，本 Skill 负责把步骤主题转成可传播短片 Prompt。

---

> 见微改进对照见 [OasisMind 2026-08 Harness 波改进清单](../../essays/oasis-improvements-2026-08-harness-wave.md)。
