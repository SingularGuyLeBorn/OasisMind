# QQ / 微信远程通道运维

本文说明如何确认 QQ、微信、截图和附件发送链路是否就绪。这里只记录安全的检查方式；真实消息仍由已授权的本地 Agent 发送。

## 1. 边界

- QQ 使用官方开放平台 Bot；微信使用 ClawBot / iLink。
- 两个通道共用 `ChannelAttachment`、传输台账和五类附件：文本、图片、视频、语音、普通文件。
- 通道附件上限为 25 MB。MIME、文件名、大小和 SHA-256 在进入适配器前统一校验。
- 访问本机文件或桌面还要同时开启 `hostAccess.enabled`，并给 Agent 授予 `native:host_access`。
- 群聊永远不能读取主机目录、截桌面或操控窗口；这些能力只允许私聊。
- `.env`、微信会话、传输台账和截图不进 Git。公开个人站不包含任何通道代码或运行数据。

## 2. 配置

从 `.env.example` 复制需要的键到本机 `.env`，不要提交真实值。

QQ 至少需要：

```dotenv
QQ_BOT_APP_ID=
QQ_BOT_SECRET=
QQ_BOT_ALLOWED_OPENIDS=
QQ_BOT_WS=true
```

`QQ_BOT_ALLOWED_OPENIDS` 为空时拒绝所有入站用户。`*` 会放开所有用户，只适合短时排查。

微信首次启动后进入 `/channels` 扫码。会话保存在 `data/weixin-clawbot/session.json`。不配置 `WEIXIN_CLAWBOT_ALLOWED_USER_IDS` 时，首次私聊用户会成为绑定用户；也可以显式写用户 id。

## 3. 体检命令

只检查本地配置，不访问平台：

```bash
pnpm channel:probe
pnpm channel:probe -- --channel qq
pnpm channel:probe -- --channel weixin --json
```

执行不发送消息的真实平台探测：

```bash
pnpm channel:probe -- --channel qq --live
pnpm channel:probe -- --channel weixin --live
pnpm channel:probe -- --channel all --live --json
```

QQ 的真实探测只获取 access token 并读取 gateway 地址。微信未扫码时只检查二维码端点；已有会话时只申请一个 1 字节测试上传槽，不上传文件，也不调用 `sendmessage`。报告会去掉 token、secret、openid、context token 和上传参数。

退出码：

| 退出码 | 含义 |
|---|---|
| `0` | 请求的通道全部就绪 |
| `1` | 配置存在，但平台鉴权或网络探测失败 |
| `2` | 尚未配置 QQ 凭据，或微信尚未扫码绑定 |

JSON 输出带 `schemaVersion: 1`，适合 Agent 和脚本读取。

## 4. 截图回传

统一工具 `capture_screenshot` 有四种模式：

```json
{"mode":"web_viewport","url":"https://example.com"}
{"mode":"web_fullpage","url":"https://example.com"}
{"mode":"desktop","display":0}
{"mode":"window","windowTitle":"Visual Studio Code"}
```

结果中的 `attachment.localPath` 已经是受控 PNG 附件。QQ 和微信分别这样发送：

```json
{"file":"{{result.attachment.localPath}}","kind":"answer"}
```

上面的参数分别交给 `send_qq_image` 或 `send_weixin_image`。工具返回 `transfer.status=sent` 才算送达。不要只把本机路径写进回复文字。

指定窗口截图按完整标题优先匹配；标题片段只能唯一命中。多个窗口同名时会报错，不会随机截图。最小化窗口先恢复再截。

## 5. 传输状态

| 状态 | 处理方式 |
|---|---|
| `pending` / `uploading` | 等平台调用结束；管理页会收到推送，并有短轮询兜底 |
| `sent` | 平台确认发送成功；同一幂等键不会重复发送 |
| `failed` | 查看 `error`；只有 `retrySafe=true` 才能调用重试 |
| `uncertain` | 请求可能已到平台。先在 QQ / 微信核对，禁止盲重发 |

`/channels` 显示适配器状态、能力矩阵、最近传输和安全重试入口。传输台账在 `data/channel-transfers/`，服务重启后仍能查询。

## 6. 常见故障

### QQ token 或 gateway 失败

先运行：

```bash
pnpm channel:probe -- --channel qq --live
```

检查 App ID、Secret、机器人权限和本机网络。体检不会把凭据打印出来。连接成功但收不到消息时，再检查用户和群白名单。

### 微信显示未绑定

打开 `/channels` 重新扫码，然后让主人先发一条私聊消息。微信发送附件需要绑定用户；文本与附件都不能凭空发给没有上下文的用户。

### 图片只返回路径，没有到手机

截图只是生成附件，还要调用对应的发送工具。检查最近传输；若状态是 `uncertain`，先在手机端核对。

### 文件被拒绝

确认文件在 Agent Workspace、`content/uploads` 或 `hostAccess.roots` 内。图片和视频必须通过文件魔数验证，HTML 错误页即使扩展名是 `.jpg` 也会被拒绝。

## 7. 回归命令

```bash
pnpm --filter @oasismind/server exec vitest run \
  src/__tests__/channelDiagnostics.test.ts \
  src/__tests__/qqInboundMedia.test.ts \
  src/__tests__/qqNativeTools.test.ts \
  src/__tests__/weixinIlink.test.ts \
  src/__tests__/weixinNativeTools.test.ts \
  src/__tests__/channelTransferLedgerV2.test.ts \
  src/__tests__/browserScreenshot.test.ts
```

真实发送会给外部联系人产生可见消息，不属于自动回归。要做人工验收时，在 QQ / 微信私聊分别发送一张网页截图和一张桌面或窗口截图，再确认传输台账为 `sent`。

