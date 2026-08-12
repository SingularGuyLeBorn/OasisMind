---
name: voice-clone
description: "CosyVoice 克隆/合成 + QQ 发声；默认希卡利日文音色"
kind: procedural
enabled: true
version: "1.1.0"
---

# voice-clone

QQ 里「用某音色说话 / 克隆」时先 `skill_view` 本包。这是 TTS，不是 STT。

## 铁律

1. 克隆与合成同一模型（默认 `cosyvoice-v3-flash`）；语气需 flash/v3.5，勿用 v3-plus 复刻 + instruction。
2. `language=ja|zh|en`，禁止 `ja-JP`。
3. 发 QQ 用 `send_qq_voice`；只落盘用 `voice_synthesize`。
4. 短句；`voice_delete` 前先 `voice_list`。

## 常用

```text
# 已有音色
send_qq_voice({ provider:"cosyvoice", text:"…", language:"ja", tone:"gentle" })

# 新克隆
voice_clone({ prefix:"hikari", file:"…wav", language:"ja", target_model:"cosyvoice-v3-flash" })
→ send_qq_voice({ provider:"cosyvoice", voice: voice_id, text:"…", language:"ja" })
```

默认音色看 `.env` `TTS_VOICE`；绑定 QQ 会话可省略目标。
