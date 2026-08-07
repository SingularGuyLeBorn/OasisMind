---
name: qq-onebot-messaging
description: "NapCat OneBot QQ 渠道完整手册：自动回发 vs 主动工具、目标解析、白名单、群 @、思考/正文分条、5s 限速、图片/文件/语音、撤回与禁止事项"
kind: procedural
enabled: true
version: "1.0.0"
author: OasisMind
trigger: "/qq"
icon: "MessageCircle"
---

# qq-onebot-messaging — QQ（NapCat OneBot）发消息完整手册

先执行：`skill_view(name="qq-onebot-messaging")`，再动手调用任何 `send_qq_*` / `delete_qq_message`。

本 Skill 是 **OasisMind ↔ QQ** 的唯一操作规范。违反「自动回发 vs 主动工具」边界会导致用户收到重复气泡、触发风控、或把不同 QQ 用户的会话搅在一起。

---

## 0. 一句话心智模型

| 场景 | 你该做什么 |
|------|------------|
| 用户从 **QQ 私聊/群聊** 发来一句话，你在本轮跑完 | **写好最终 assistant 正文（+ 正常 thinking）即可**。系统会自动回发，最多 2 条：思考 + 正式回复。 |
| 要在最终回复里带图 | 在 Markdown 里写 `![说明](content/uploads/xxx.png)`，系统随正文一条发出。 |
| 要额外主动推送（进度、提醒、额外媒体） | 用 `send_qq_*` 工具；**不要**把同一段正式答案再用 `send_qq_text` 发一遍。 |
| 发错了要撤回 | `delete_qq_message(messageId=...)`（来自工具返回的 `message_id`）。 |
| 当前会话不是 QQ 绑定会话（例如 Web Chat） | 必须显式传 `userId`（私聊）或 `groupId`（群聊）。 |

---

## 1. 架构：谁在发消息？

```
QQ 用户 → NapCat HTTP → MessageGateway
  → ChannelBinding 找到/创建 ChatSession（按 channel×peerId×chatId 隔离）
  → Agent 跑 ReAct（你）
  → 结束时 ChannelReplyChunk(finish=true)
  → OneBot.reply → planOneBotReply → 出站队列（限速）→ NapCat → QQ
```

**额外通道（你主动调用）：**

```
你调用 native:send_qq_* / delete_qq_message
  → 从 session 反查 ChannelBinding，或用你传入的 userId/groupId
  → 同一出站限速队列 → NapCat → QQ
```

要点：

1. **权威在服务端**。你没有「本地假装已发送」；工具返回 `ok`/`error` 才是真相。
2. **自动回发只看最终 finish 的 reply**；流式中间 chunk **不会**刷屏到 QQ。
3. **同一限速队列**：自动回发与工具主动发共用 `ONEBOT_SEND_MIN_INTERVAL_MS`（默认 **5000ms**）。连发会被排队等待，不是失败。

---

## 2. 何时必须加载本 Skill

- 用户说：发 QQ、发群、推图到 QQ、发语音、发文件、撤回 QQ 消息
- 当前会话标题/上下文显示 `onebot` / QQ / ChannelBinding
- 你准备调用任何 `send_qq_*` 或 `delete_qq_message`
- 用户抱怨「重复收到两遍」「只收到思考没正文」「群里没反应」

---

## 3. 工具清单（闭集，禁止臆造）

| 工具名 | 必填参数 | 可选参数 | 破坏性 |
|--------|----------|----------|--------|
| `send_qq_text` | `text`（非空纯文本） | `userId` / `groupId`（见 §6） | 否 |
| `send_qq_image` | `file`（本机相对路径优先；仅本机无文件时用 http(s) URL） | `caption`、`userId`/`groupId` | 否 |
| `send_qq_video` | `file`（同上） | `caption`、`userId`/`groupId` | 否 |
| `send_qq_file` | `file`（**只接受本机路径**，禁止 URL） | `name`、`userId`/`groupId` | 否 |
| `send_qq_voice` | `file`（本机音频路径，推荐 `content/uploads/tts/*.mp3`） | `userId`/`groupId` | 否 |
| `delete_qq_message` | `messageId`（来自 send_qq_* 的 `result.data.message_id`，纯数字） | 无 | **是** |

**不存在**的名字（禁止调用）：`send_qq_msg`、`qq_send`、`napcat_send`、`invoke_api`（已下线）。

格式约定：

- `userId` / `groupId` / `messageId`：纯数字字符串（例 `"2635495642"`），不要空格、不要 `QQ:` 前缀、不要 `@`。
- 路径：相对项目根，正斜杠 `/`，大小写与磁盘一致（Windows 通常不敏感，仍建议照实填）。
- 工具返回的 `error` 已是完整中文原因+下一步；**以 error 为准**，不要只读 `code`。
- 若因参数/格式失败：返回里会有「正确示例」和 `correctExample` 字段——**照抄改参后只重试一次**，禁止无改动连打。

---

## 4. 自动回发规则（最重要，先背熟）

系统对 QQ 入站会话的最终回复调用 `planOneBotReply`：

### 4.1 最多两条

1. **思考过程**（若本轮有 reasoning）
   - 短（默认 ≤ `ONEBOT_THINKING_TXT_CHARS`，**1200** 字）：一条文本，前缀 `【思考过程】`
   - 长：写成 `content/uploads/qq-text/thinking-*.txt`，以**文件**发出（不占第二条正文名额的「文本条」，但仍占一次出站）
2. **正式回复**（必有）
   - Markdown → 纯文本（去图片语法后的正文）
   - 正文里的 `![](url或本地路径)` 抽成图片 segment，与正文**同一条**消息发出
   - 过长（默认 > `ONEBOT_ANSWER_MAX_CHARS`，**4500**）会截断并标注

无思考时：只发正式回复一条。

### 4.2 你该怎么写最终答案

**正确：**

```markdown
这里是结论……

![截图说明](content/uploads/screenshots/demo.jpg)
```

系统：思考（可选）+ 一条「纯文本结论 + 图片」。

**错误：**

1. 最终答案写完后，再 `send_qq_text` 把同一段话发一遍 → **重复**。
2. 把思考内容抄进最终正文（用户会看到两遍思考）。
3. 用多个 `send_qq_image` 代替 Markdown 配图 → 多占限速槽，且与最终回复拆开，体验差。
4. 在最终答案里用复杂 Markdown（表格/代码高亮）指望 QQ 渲染 → **QQ 不渲染 Markdown**；系统会 `mdToPlain`。需要格式时用换行与简单符号，长文改发 `send_qq_file`。

### 4.3 群聊自动回发

- 群消息通常带 `reply` 段引用用户原消息。
- 群默认需要 **@ 本 Bot**（`ONEBOT_GROUP_REQUIRE_AT=true`）才响应。
- 发送者必须仍在 `ONEBOT_ALLOWED_USERS`；群号在 `ONEBOT_ALLOWED_GROUPS`。

---

## 5. 主动工具详解

### 5.1 `send_qq_text`

```json
{
  "text": "任务已完成，报告见下一条文件。",
  "userId": "2635495642"
}
```

- **适用**：进度通知、与最终答案分离的短提醒、Web 会话主动推给主人 QQ。
- **禁止**：重复发送即将作为「正式回复」的同一段文字。
- QQ 侧纯文本；不要塞 `**bold**` 指望加粗。

### 5.2 `send_qq_image`

```json
{
  "file": "content/uploads/screenshots/desk.jpg",
  "caption": "主屏截图"
}
```

- `file`：相对项目根的路径，或 `http(s)://` URL。
- **体积**：NapCat 对大图易 Timeout；桌面原图数 MB 常失败。先压到 **约 <1.5MB**（可用 piclite-compress Skill / 本机压图），再发。
- `caption`：图片发出后**再发一条文本**（占第二次限速间隔）。若马上还有最终自动回复，用户会连续收到多条——尽量把说明写进最终 Markdown，少用 caption。

**优先策略：**

1. 最终回复 Markdown 配图（推荐）
2. 仅当需要「现在立刻推一张、且本轮还没结束」时用本工具

### 5.3 `send_qq_video`

```json
{
  "file": "content/uploads/demo.mp4",
  "caption": "可选说明"
}
```

短视频优先；过大易超时。失败时压缩/切片后再试，不要死循环重试。

### 5.4 `send_qq_file`

```json
{
  "file": "content/uploads/qq-text/report.txt",
  "name": "调研报告.txt"
}
```

- 私聊：`upload_private_file`；群：`upload_group_file`；失败会降级 file segment。
- `name`：用户看到的文件名；缺省用 basename。
- 长思考系统已可能自动发 txt；你主动发报告/PDF/zip 用本工具。

### 5.5 `send_qq_voice`

```json
{
  "file": "content/uploads/tts/qq-voice-xxxx.mp3"
}
```

- 本地音频路径；NapCat 负责转 silk。
- 仓库若无独立 TTS 工具：用已有音频文件，或先用其它能力生成到 `content/uploads/tts/` 再发。
- **不要**把超长文章整段念完当语音（体验差、体积大）；短确认/摘要更合适。

### 5.6 `delete_qq_message`

```json
{
  "messageId": 1234567890
}
```

- `messageId` 来自 `send_*` 返回的 `result.data.message_id`（字段名以实际返回为准）。
- 一般只能撤 **本 Bot** 发出的消息，且有平台时限。
- **撤回不占用**发送限速间隔。
- 撤错/过期会返回 error；向用户说明即可，不要无限重试。

---

## 6. 目标解析（发给谁？）— 按优先级执行，不要猜

1. **当前会话已绑定 QQ（ChannelBinding.channel=onebot）**  
   → `userId` 与 `groupId` **都不要传**。系统自动填目标。群聊发群、私聊发私聊。

2. **当前不是 QQ 会话，要发私聊**  
   → **只传** `userId`，值为对方 QQ 号数字字符串，例 `"2635495642"`。

3. **当前不是 QQ 会话，要发群**  
   → **只传** `groupId`，值为群号数字字符串，例 `"1098299609"`。

4. **同时传了 userId 与 groupId**  
   → 一律按**群聊**发送（只用 `groupId`），`userId` 被忽略。

5. **两者都缺且无 QQ 绑定**  
   → 工具返回明确错误；先问用户要私聊还是群聊，再按 2/3 填。禁止瞎猜陌生 QQ。

会话隔离铁律：`(channel="onebot", peerId=发送者QQ, chatId=群号或空)`。不同 QQ / 同群不同人 = 不同会话，禁止串发。

---

## 7. 白名单与群规则（发不出时先自查）

| 配置 | 含义 |
|------|------|
| `ONEBOT_ENABLED` | 为 false 则适配器关闭 |
| `ONEBOT_HTTP_URL` | NapCat HTTP，如 `http://127.0.0.1:3001` |
| `ONEBOT_ALLOWED_USERS` | 允许私聊/群内触发的 QQ 号列表 |
| `ONEBOT_ALLOWED_GROUPS` | 允许的群；空=拒所有群；`*`=所有群 |
| `ONEBOT_GROUP_REQUIRE_AT` | 默认 true：群内须 @ Bot |
| `ONEBOT_GROUP_MESSAGE_TYPES` | 默认含 text；可扩 image/at/reply |
| `ONEBOT_QQ_ACCOUNT` | 本 Bot 账号；self_id 不匹配则忽略入站 |

工具返回「适配器未注册」→ 服务未启用 OneBot 或未重启加载 env。  
工具返回 retcode 非 0 → 看 `message`/`wording`；常见：对方非好友、文件过大、Timeout。

**代理注意：** 全局 HTTP 代理不得劫持 `127.0.0.1`（本地 NapCat）。若出现 HTTP 502 / fetch failed，属于运维问题，不是你「再试一次参数」能修的——如实告诉用户检查代理与 NapCat。

---

## 8. 限速与节奏

- 默认两条出站间隔 ≥ **5 秒**（`ONEBOT_SEND_MIN_INTERVAL_MS`）。
- 串行队列：后发的会等前一条。
- 规划消息数时心里要有数：
  - 自动：思考 + 正文 = 最多 2 次出站（长思考文件算 1 次）
  - 每多一次 `send_qq_*`（含 caption 第二条文本）再 +1
  - 用户体感延迟 ≈ `(条数-1) × 5s`
- **禁止**为「显得勤快」连发多条进度；合并成一条或等最终回复。

---

## 9. 推荐工作流（按场景）

### 场景 A：QQ 用户问问题（默认）

1. 正常推理（thinking 交给系统，不要复制进正文）。
2. 最终 Markdown 写清楚答案；需要图就 `![](path)`。
3. **不要**调用 `send_qq_text` 重复答案。
4. 结束。

### 场景 B：QQ 用户要「发张截图/文件」

1. 生成/准备文件到 `content/uploads/...`（大图先压）。
2. **优先**放进最终回复 Markdown；或 `send_qq_image` / `send_qq_file` 一次。
3. 最终正文可一句说明，避免 caption + 正文双重说明。

### 场景 C：Web 里主人说「推一条到我 QQ」

1. 确认目标 QQ（`userId`）。
2. `send_qq_text` / `send_qq_image` / `send_qq_file`。
3. 在 Web 会话用文字确认「已推送到 QQ xxxx」。

### 场景 D：发错撤回

1. 从刚才工具结果取 `message_id`。
2. `delete_qq_message`。
3. 必要时再发正确内容（注意限速）。

### 场景 E：长报告

1. 正文落盘（Workspace 或 uploads）。
2. `send_qq_file` 发文件。
3. 最终/主动文本只发短摘要 + 文件名，不要把万字糊进气泡。

---

## 10. 路径与媒体约定

| 类型 | 建议路径 |
|------|----------|
| 上传图/截图 | `content/uploads/`、`content/uploads/screenshots/` |
| 思考/导出 txt | `content/uploads/qq-text/`（系统也会写这里） |
| 语音 | `content/uploads/tts/` |
| Agent 草稿 | 当前 Workspace（`write_file`），发 QQ 前复制/引用到可访问路径 |

- 路径相对**项目根**；Windows 反斜杠也可，适配器会规范化。
- `content/posts/` 文章请走 `post_*`，不要用 QQ 工具当知识库写入通道。
- HTTP URL 作 `file` 可以，但本地路径更稳（不依赖外网）。

---

## 11. 与 ask_user / 其它渠道

- 在 QQ 会话里 `ask_user`：用户从 QQ 回复即可继续（走同一 ChannelBinding）。
- **禁止**假设用户会去打开 Web 才能回答你在 QQ 里的提问（除非用户人就在 Web）。
- 邮件 `send_email` 与 QQ 是不同通道；不要混用「已发邮件」当作「已发 QQ」。

---

## 12. 禁止事项（检查清单）

- [ ] 禁止用 `send_qq_text` 重复最终正式回复
- [ ] 禁止把思考过程再粘进正式答案
- [ ] 禁止未压缩的超大图/视频狂重试
- [ ] 禁止跨 peer 乱填 `userId`（串会话）
- [ ] 禁止编造不存在的 QQ 工具名
- [ ] 禁止教用户「刷新一下」当修复（渠道问题应查 NapCat/白名单/代理）
- [ ] 禁止为刷存在感连发 >3 条无信息增量的气泡
- [ ] 禁止在群里未确认 @/白名单时断言「已发出」——以工具返回为准

---

## 13. 故障对照表

| 现象 | 可能原因 | 你怎么做 |
|------|----------|----------|
| 用户说收得到你的回复但重复 | 自动回发 + 你又 `send_qq_text` | 道歉；下次只保留自动回发 |
| 只有思考没有正文 | 极少见；检查是否空答案 | 确保最终 content 非空 |
| 工具报缺少 userId/groupId | 非 OneBot 会话且未传参 | 补 `userId`/`groupId` |
| 适配器未注册 | OneBot 未启用 | 告知用户检查 env 并重启服务 |
| HTTP 502 / fetch failed | 代理劫持本机或 NapCat 挂了 | 告知检查 NO_PROXY / NapCat |
| Timeout 发图 | 文件太大 | 压缩后再 `send_qq_image` |
| 群里完全没反应 | 未 @ / 群不在白名单 / 发送者不在用户白名单 | 说明规则，请用户 @ Bot 或找主人加白名单 |
| 撤回失败 | 超时限或非自己的消息 | 说明无法撤，改发更正 |

---

## 14. 环境变量速查（只读认知，勿在对话里泄露密钥）

```
ONEBOT_ENABLED
ONEBOT_HTTP_URL
ONEBOT_ACCESS_TOKEN / ONEBOT_SECRET
ONEBOT_QQ_ACCOUNT / ONEBOT_QQ_OWNER
ONEBOT_ALLOWED_USERS / ONEBOT_ALLOWED_GROUPS
ONEBOT_GROUP_REQUIRE_AT / ONEBOT_GROUP_MESSAGE_TYPES
ONEBOT_THINKING_TXT_CHARS   # 默认 1200
ONEBOT_ANSWER_MAX_CHARS     # 默认 4500
ONEBOT_SEND_MIN_INTERVAL_MS # 默认 5000
```

改 env 后必须**整栈重启**才能生效（tsx watch 不会重载全部 env）。

---

## 15. 极简决策树

```
用户从 QQ 来？
├─ 是 → 写好最终答案（配图用 Markdown）→ 结束
│        └─ 需要额外媒体/进度？→ 少量 send_qq_*（勿重复答案）
└─ 否（Web 等）→ 用户要推 QQ？
         ├─ 是 → 确认 userId/groupId → send_qq_*
         └─ 否 → 不要调用本 Skill 工具
```

---

## 16. 自检（调用前默念）

1. 这条内容会不会被**自动回发**再发一遍？会 → 删掉主动发送。
2. 目标对吗？（当前 binding / 显式 id）
3. 媒体体积是否合理？
4. 这条是否值得占用一次 5s 限速槽？
5. 我是否刚 `skill_view` 过本手册？（首次处理 QQ 发送任务时必须）

---

**版本**：1.0.0 · 与 `apps/server/src/infra/tools/native/qq.ts` + `channels/onebotBot.ts` 对齐。工具签名变更时同步改本文件。
