<!-- page 1 of 32 -->

[Kimi Code Docs](https://www. kimi. com/code/docs/en/)



[Kimi Code Docs](https://www. kimi. com/code/docs/en/)

Menu



菜单

On this page



本页目录

# What's New # 更新了什么

A record of new features and key fixes across Kimi Code products - focused on the changes most worth knowing about.



记录 Kimi Code 各产品线的新功能与关键修复, 只收最值得知道的改动.

Latest



最新

Fullscreen mode (experimental)



全屏模式(实验性)

KIMI CODE CLI



KIMI CODE CLI

v2.1.0



v2.1.0

September 23, 2026



2026 年 9 月 23 日

A new experimental fullscreen interface: the transcript scrolls independently, text can be selected with the mouse, fold blocks expand or collapse on click, and a clickable "Jump to bottom" indicator sits at the bottom. Enable it under /settings → TUI mode, or set tui\_mode = "fullscreen" in \~/. kimi-code/tui. toml then restart Kimi Code. → [tui. toml](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#tuitoml)



新的实验性全屏界面: 对话记录可独立滚动, 可用鼠标选中文字, 折叠块可点击展开或收起, 底部有可点击的「Jump to bottom」指示. 在 /settings → TUI mode 开启, 或在 \~/. kimi-code/tui. toml 里设 tui\_mode = 「fullscreen」 后重启 Kimi Code. → [tui. toml](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#tuitoml)

Faster startup, lower memory



启动更快, 内存更低

Shorter CLI startup time and reduced memory usage - first paint arrives noticeably sooner in large projects.



CLI 启动时间缩短, 内存占用下降; 大项目里首屏出现会明显更快.

File watching is now off by default



文件监视默认关闭

Filesystem watching for config and workspace files no longer runs by default; to hot-reload AGENTS.md, skills, or MCP config, set [watch] enabled = true or KIMI\_CODE\_WATCH=1 . → [watch](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#watch)



配置与工作区文件的文件系统监视默认不再运行; 若要热重载 AGENTS.md, skills 或 MCP 配置, 设 [watch] enabled = true 或 KIMI\_CODE\_WATCH=1. → [watch](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#watch)

Also in this release: hardened workspace trust boundaries - file tools can no longer reach outside the working directory through symbolic links, and project-local config only takes effect after the workspace is trusted; new auto\_session\_title config to turn off automatic session title generation by clients. → [Config files](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#top-level-fields)



本版还有: 收紧工作区信任边界, 文件工具不能再经符号链接摸到工作目录外, 项目本地配置只在工作区受信任后生效; 新增 auto\_session\_title, 可关掉客户端自动生成会话标题. → [Config files](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#top-level-fields)

<!-- page 2 of 32 -->

KIMI CODE DESKTOP
Kimi Code Desktop is here
September 17, 2026



KIMI CODE DESKTOP
Kimi Code Desktop 上线
2026 年 9 月 17 日

The Kimi Code desktop client is officially available: it carries the Agent core of Kimi Code CLI into a graphical interface, where you open a project, talk to the Agent, and ship changes in one window. Available now for macOS (Apple Silicon / Intel) and Windows. → [Quick Start](https://www. kimi. com/code/docs/en/kimi-code-desktop/getting-started. html)



Kimi Code 桌面客户端正式可用: 把 Kimi Code CLI 的 Agent 内核搬进图形界面, 在同一窗口打开项目, 与 Agent 对话并交付改动. 现已支持 macOS(Apple Silicon / Intel)与 Windows. → [Quick Start](https://www. kimi. com/code/docs/en/kimi-code-desktop/getting-started. html)

Every step stays visible Tool calls, thinking, and the files changed in each turn are all presented in the interface; sensitive operations raise approval prompts, and three permission modes (Always Ask / Ask When Needed / Never Ask) keep you in control. → [Handle approvals](https://www. kimi. com/code/docs/en/kimi-code-desktop/task-execution-and-review. html#approvals-and-permissions)



每一步都看得见: 工具调用, thinking, 每轮改动的文件都呈现在界面里; 敏感操作会弹出审批, 三种权限模式(Always Ask / Ask When Needed / Never Ask)让你握着控制权. → [Handle approvals](https://www. kimi. com/code/docs/en/kimi-code-desktop/task-execution-and-review. html#approvals-and-permissions)

A complete workflow from conversation to delivery Goal mode keeps long-running objectives moving and can be paused, resumed, or cancelled; plan mode proposes an approach before touching files, and the plan can be reviewed and refined; long tasks can move to the background, where you can check progress or stop them at any time. → [Choose a task mode](https://www. kimi. com/code/docs/en/kimi-code-desktop/task-execution-and-review. html#task-modes)



从对话到交付的完整流程: Goal 模式推动长目标, 可暂停, 恢复或取消; plan 模式在动文件前先提方案, 方案可审可改; 长任务可转后台, 随时查看进度或停下. → [Choose a task mode](https://www. kimi. com/code/docs/en/kimi-code-desktop/task-execution-and-review. html#task-modes)

## Built-in browser and visual annotation ## 内置浏览器与可视化批注

The browser lives in the right panel, with tabs that stay with the session and page context shared with the Agent; screenshot annotation, text selection comments, file mentions, and element picking on web pages tell the Agent exactly what to change. → [Verify in the terminal](https://www. kimi. com/code/docs/en/kimi-code-desktop/task-execution-and-review. html#built-in-terminal)



浏览器用右栏承载, 标签页跟会话走, 页面上下文与 Agent 共享; 截图批注, 选中文字评论, 文件提及, 网页元素拾取, 都能把「改哪里」准确交给 Agent. → [Verify in the terminal](https://www. kimi. com/code/docs/en/kimi-code-desktop/task-execution-and-review. html#built-in-terminal)

Download: [macOS . Apple Silicon](https://code. kimi. com/kimi-code/desktop/download/KimiCode-mac-arm64. dmg) . [macOS . Intel](https://code. kimi. com/kimi-code/desktop/download/KimiCode-mac-x64. dmg) . [Windows](https://code. kimi. com/kimi-code/desktop/download/KimiCode-win-x64. exe)



下载: [macOS . Apple Silicon](https://code. kimi. com/kimi-code/desktop/download/KimiCode-mac-arm64. dmg) . [macOS . Intel](https://code. kimi. com/kimi-code/desktop/download/KimiCode-mac-x64. dmg) . [Windows](https://code. kimi. com/kimi-code/desktop/download/KimiCode-win-x64. exe)

v2.0.0 September 17, 2026



v2.0.0 2026 年 9 月 17 日

New /desktop command The new /desktop slash command (alias /install-desktop ) and the kimi install-desktop subcommand open the desktop app page in



新增 /desktop 命令: 新的 /desktop slash(别名 /install-desktop)与 kimi install-desktop 子命令会打开桌面应用页面,

<!-- page 3 of 32 -->

your browser, so you can download and install the desktop client without leaving the terminal. → [kimi install-desktop](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-install-desktop)



在浏览器里继续, 从而不用离开终端就能下载安装桌面客户端. → [kimi install-desktop](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-install-desktop)

## Mermaid diagrams in the terminal ## 终端里的 Mermaid 图

Mermaid code blocks now render as diagrams in the terminal; turn this off under /settings → Mermaid diagrams, or set mermaid "off" in the [markdown] section of tui. toml.



Mermaid 代码块会在终端里渲染成图; 可在 /settings → Mermaid diagrams 关掉, 或在 tui. toml 的 [markdown] 段设 mermaid 「off」.

Also in this release: the built-in browser plugin is renamed to Kimi Browser Extension; when accumulated media in a session exceeds 20 MB, the oldest images and videos are omitted from requests with a warning → [Paste images and videos](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#paste-images-and-videos). Since v2.0.1, a provider's API key can be read from a named environment variable via api\_key\_env instead of being written into the config file → [Config files](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#providers).



本版还有: 内置浏览器插件改名为 Kimi Browser Extension; 会话累计媒体超过 20 MB 时, 最旧的图片与视频会从请求里省略并给出警告 → [Paste images and videos](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#paste-images-and-videos). 自 v2.0.1 起, provider 的 API key 可通过 api\_key\_env 从命名环境变量读取, 而不必写进配置文件 → [Config files](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#providers).

<!-- page 4 of 32 -->

KIMI CODE CLI v0.43.0 September 14, 2026



KIMI CODE CLI v0.43.0 2026 年 9 月 14 日

MODEL RELEASE K2.8 Preview September 11, 2026



模型发布 K2.8 Preview 2026 年 9 月 11 日

## AI session titles in Web, on by default ## Web 端 AI 会话标题, 默认开启

A title is generated automatically after the first turn, and you can regenerate it from the rename box - no more naming sessions by hand.



首轮结束后自动生成标题, 也可在重命名框里重新生成, 不必再手工给会话起名.

## Delete sessions from the session selector ## 在会话选择器里删除会话

Select a session in the session selector, press Ctrl-X then to confirm - cleaning up old sessions is much easier.



在会话选择器里选中会话, 按 Ctrl-X 再确认, 清理旧会话容易多了.

## Fairer time budgets in Goal Mode ## Goal Mode 更公平的时间预算

Time budgets no longer count the time while a session is closed, and the 24-hour cap is gone, so long-running goals no longer burn budget while you are away. → [Goal mode](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#goal-mode)



时间预算不再计入会话关闭期间, 24 小时上限也取消了, 长跑目标不会在你离开时空烧预算. → [Goal mode](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#goal-mode)

Also in this release: kimi upgrade (alias kimi update ) gains a -y, yes flag to skip the confirmation prompt; the new



本版还有: kimi upgrade(别名 kimi update)增加 -y / yes, 可跳过确认提示; 新增

KIMI\_CODE\_PERMISSION\_MODE\_REMINDER environment variable (set to 0 stops injecting auto-permission-mode reminders into the model context. v0.43.1 fixes pressing Ctrl-C while a subagent is running quitting the entire CLI - it now only interrupts the running subagent.



环境变量 KIMI\_CODE\_PERMISSION\_MODE\_REMINDER(设为 0 则停止把自动权限模式提醒注入模型上下文). v0.43.1 修复: 子 agent 运行时按 Ctrl-C 会退出整个 CLI, 现在只中断正在跑的子 agent.

🎉 K2.8 Preview is now fully rolled out in Kimi Code! The Model ID is unchanged - still kimi-for-coding - so clients and third-party tools work with no configuration changes. → [Model configuration](https://www. kimi. com/code/docs/en/kimi-code/models. html)



🎉 K2.8 Preview 已在 Kimi Code 全量上线! Model ID 未变, 仍是 kimi-for-coding, 客户端与第三方工具无需改配置. → [Model configuration](https://www. kimi. com/code/docs/en/kimi-code/models. html)

Performance close to K3, with more efficient thinking Coding and agent capabilities are improved across the board, with significantly more efficient thinking than K2.7 Code.



表现接近 K3, thinking 更省: 编码与 agent 能力全面提升, thinking 效率明显高于 K2.7 Code.

Adjustable thinking effort



可调 thinking effort

<!-- page 5 of 32 -->

Same thinking levels as K3: low high max (default max ). With thinking turned off, requests to the K3 series and K2.8 Preview are served by K2.8 Preview (no thinking).



与 K3 相同的 thinking 档位: low high max(默认 max). 关掉 thinking 时, 对 K3 系列与 K2.8 Preview 的请求由 K2.8 Preview(无 thinking)承接.

1M ultra-long context A context window of up to 1M is available across all membership tiers.



1M 超长上下文: 所有会员档都可用最高 1M 的上下文窗口.

## KIMI CODE CLI Remote Control is now generally available ## KIMI CODE CLI Remote Control 正式可用

v0.42.0 Remote Control is out of the experimental stage - no experimental September 9, 2026 flag needed. Take over a local session from your phone or another computer, anywhere. → [Remote Control](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/remote-control. html)



v0.42.0 2026 年 9 月 9 日: Remote Control 走出实验阶段, 无需再开 experimental 开关. 可用手机或其他电脑从任意地点接管本地会话. → [Remote Control](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/remote-control. html)

Sortable media preview bar in the Web input box Attachments appear in a sortable preview bar, so you can reference images and videos inline in your text, and previews survive queuing and sending. HEIC, HEIF, and BMP images are now supported too. → [Pasting images and video](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#pasting-images-and-video)



Web 输入框可排序的媒体预览条: 附件出现在可排序预览条里, 可在正文内联引用图片与视频, 排队与发送后预览仍在. 现也支持 HEIC, HEIF, BMP. → [Pasting images and video](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#pasting-images-and-video)

## Completed tool calls collapse into summaries ## 完成的工具调用折叠成摘要

Finished tool calls now collapse into a title plus a one-line result summary, keeping the transcript clean - press Ctrl-O to expand the full output. → [Keyboard shortcuts](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/keyboard. html#tool-output)



已完成的工具调用会折叠成标题加一行结果摘要, 对话记录更干净, 按 Ctrl-O 展开完整输出. → [Keyboard shortcuts](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/keyboard. html#tool-output)

Also in this release: the /btw side-chat subagent gains read-only tools; the subagent model pool ( [secondary\_model] ) is now always on and its experimental flag has been removed.



本版还有: /btw 旁路聊天子 agent 获得只读工具; 子 agent 模型池([secondary\_model])现默认常开, 实验开关已移除.

KIMI CODE CLI Tower multi-agent collaboration in Web v0.41.0 The web version adds an experimental tower multi-agent mode - September 4, 2026 enable it with the /tower command or the plus menu in the input box, and set the base branch with /tower &lt; base-branch&gt;



KIMI CODE CLI Web 端 Tower 多智能体协作 v0.41.0: Web 版增加实验性 tower 多智能体模式, 2026 年 9 月 4 日; 用 /tower 或输入框加号菜单开启, 用 /tower &lt; base-branch&gt; 设基线分支.

Text selection annotations in Web



Web 端文本选区批注

<!-- page 6 of 32 -->

Select text in messages, file previews, diff and per-turn change panels, or the terminal to add a comment or quote it into the conversation.



在消息, 文件预览, diff 与每轮改动面板, 或终端里选中文字, 可加评论或引用进对话.

## Dangerous commands no longer blocked



## Dangerous commands no longer blocked ## 危险命令不再一律拦截

Auto permission mode no longer blocks dangerous commands or commands that cannot be statically analyzed. → [The three permission modes](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#the-three-permission-modes)



Auto 权限模式不再拦截危险命令或无法静态分析的命令. → [The three permission modes](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#the-three-permission-modes)

Also in this release: a new session rating prompt (can be disabled in config); answers to background questions are now delivered directly to the agent instead of through an output file.



本版还有: 新增会话评分提示(可在配置里关掉); 后台问题的回答现在直接交给 agent, 不再经输出文件中转.

Renamed permission modes and a new dangerous-command guard The former YOLO / Auto modes are now Ask When Needed ( /askwhen-needed ) and Never Ask ( /never-ask ); Manual is Always Ask. A built-in dangerous-command guard also ships in this release: commands such as shutdown reboot , or rm -rf are blocked outright in Never Ask mode and always require your confirmation in the other modes; disable it with [permission] dangerous\_command\_guard = false . → [Interaction & input](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#the-three-permission-modes)



权限模式更名并新增危险命令护栏: 原 YOLO / Auto 现为 Ask When Needed(/askwhen-needed)与 Never Ask(/never-ask); Manual 现为 Always Ask. 本版还内置危险命令护栏: 如 shutdown, reboot 或 rm -rf, 在 Never Ask 下直接拦截, 其他模式始终要你确认; 可用 [permission] dangerous\_command\_guard = false 关掉. → [Interaction & input](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#the-three-permission-modes)

## Subagent model pool graduates from experimental ## 子 agent 模型池走出实验

The [secondary\_model] subagent settings are now generally available and enabled by default in every launch mode; you can still opt out with KIMI\_CODE\_EXPERIMENTAL\_SECONDARY\_MODEL=0 or [experimental] secondary-model = false . → [Config files](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#secondary-model)



[secondary\_model] 子 agent 设置现已正式可用, 并在每种启动模式下默认开启; 仍可用 KIMI\_CODE\_EXPERIMENTAL\_SECONDARY\_MODEL=0 或 [experimental] secondary-model = false 退出. → [Config files](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#secondary-model)

## Plugins panel in web settings ## Web 设置里的 Plugins 面板

The web settings now include a Plugins panel for browsing the plugin marketplace and installing, enabling, disabling, or removing plugins.



Web 设置现含 Plugins 面板, 可浏览插件市场并安装, 启用, 禁用或移除插件.

→ [Plugins](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html)



→ [Plugins](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html)

Also in this release: Tower mode (experimental) no longer starts on its own - turn it on explicitly with /tower on or /tower &lt; base-branch&gt;



本版还有: Tower 模式(实验性)不再自行启动, 须用 /tower on 或 /tower &lt; base-branch&gt; 显式打开.

<!-- page 7 of 32 -->

KIMI CODE CLI



KIMI CODE CLI

v0.39.0



v0.39.0

August 27, 2026



2026 年 8 月 27 日

the new kimi session list command lists sessions from the command line. v0.40.1 fixes the kimi-cli migration prompt reappearing after the migration had completed or been dismissed.



新增 kimi session list, 可从命令行列出会话. v0.40.1 修复迁移已完成或已关闭后, kimi-cli 迁移提示仍反复出现.

Remote control for local web sessions



本地 Web 会话的远程控制

```javascript
Set KIMI_CODE_EXPERIMENTAL_REMOTE_CONTROL=1 , then run kimi rc , kimi web --remote-control , or /remote-control to access a local web session remotely. → Remote control
```



```javascript
设 KIMI_CODE_EXPERIMENTAL_REMOTE_CONTROL=1, 再运行 kimi rc, kimi web --remote-control 或 /remote-control, 即可远程访问本地 Web 会话. → Remote control
```

Experimental Tower multi-agent orchestration



实验性 Tower 多智能体编排

```txt
Set KIMI_CODE_EXPERIMENTAL_TOWER=1 , then use /tower on and /tower <objective> to start Tower mode and coordinate multiple agents toward an objective.
```



```txt
设 KIMI_CODE_EXPERIMENTAL_TOWER=1, 再用 /tower on 与 /tower <objective> 启动 Tower 模式, 协调多个 agent 奔同一目标.
```

Fork subagents from the current conversation



从当前对话 fork 子 agent

```txt
Set KIMI_CODE_EXPERIMENTAL_SUBAGENT_FORK=1 , or subagent_fork = true under [experimental] , to let the subagent and swarm tools use fork to start from a snapshot of the calling agent's conversation history. → Agents and subagents
```



```txt
设 KIMI_CODE_EXPERIMENTAL_SUBAGENT_FORK=1, 或在 [experimental] 下设 subagent_fork = true, 让 subagent 与 swarm 工具用 fork 从调用方对话历史快照起步. → Agents and subagents
```

Also in this release: Configure an independent AgentSwarm timeout



本版还有: 可为 AgentSwarm 单独配置超时

with [swarm] timeout\_ms or KIMI\_CODE\_SWARM\_TIMEOUT\_MS ; file tools and Shell now resolve Git Bash paths correctly on Windows. v0.39.1 fixes the web permission mode leaking across sessions, the first typed character being swallowed in an empty composer, and startup hanging on "Connecting." with many workspaces, and adds a file mode to the OpenIn menu.



用 [swarm] timeout\_ms 或 KIMI\_CODE\_SWARM\_TIMEOUT\_MS; Windows 上文件工具与 Shell 现能正确解析 Git Bash 路径. v0.39.1 修复 Web 权限模式跨会话泄漏, 空输入框吞掉首字符, 多工作区启动卡在「Connecting.」, 并为 OpenIn 菜单增加 file 模式.

The agent can now wait for a background task to finish within the current turn - no need to end the turn and get woken up again. → [Background Tasks](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/tools. html#background-tasks)



Agent 现可在当前回合内等待后台任务结束, 不必结束回合再被叫醒. → [Background Tasks](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/tools. html#background-tasks)

<!-- page 8 of 32 -->

August 18, 2026



2026 年 8 月 18 日

## 13 new data sources in Kimi Datasource ## Kimi Datasource 新增 13 个数据源

The official data plugin adds Chinese government data (NDA/NBS) and standards (GB/HB/DB/TT), eight international organization datasets (WHO, FAO, UNSD, ECB, Eurostat, UNICEF, OECD, FRED), Xinhua Finance, and Caixin. Update the plugin from the Official tab in /plugins → [Kimi Datasource](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#kimi-datasource)



官方数据插件加入中国政府数据(NDA/NBS)与标准(GB/HB/DB/TT), 八个国际组织数据集(WHO, FAO, UNSD, ECB, Eurostat, UNICEF, OECD, FRED), 新华财经与财新. 在 /plugins 的 Official 页签更新插件 → [Kimi Datasource](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#kimi-datasource)

Also in this release: Edit and Write now require reading an existing file before modifying it; overly long ! shell command output is collapsed automatically - press ctrl+o to expand it together with tool output.



本版还有: Edit 与 Write 修改前必须先读已有文件; 过长的 ! shell 命令输出会自动折叠, 按 ctrl+o 可与工具输出一并展开.

KIMI CODE CLI



KIMI CODE CLI

v0.37.0



v0.37.0

## Activate multiple skills in one prompt ## 一条提示激活多个 skill

Type / after whitespace in the input to insert a skill tag - a single prompt can now activate multiple skills. Skill slash commands typed while the agent is busy are also queued instead of rejected. → [Invoking a Skill](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/skills. html#invoking-a-skill)



在输入空白后键入 / 可插入 skill 标签, 一条提示现可激活多个 skill. Agent 忙碌时输入的 skill slash 也会入队, 不再被拒. → [Invoking a Skill](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/skills. html#invoking-a-skill)

## Web session management upgrade ## Web 会话管理升级

The sidebar gains Open / Done / Workspaces tabs, sessions can be marked as Done, and there's a new dedicated session management page; the search dialog can now search workspaces and scrolls to the selected entry. → [Using Kimi Code in the browser](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/web. html)



侧栏新增 Open / Done / Workspaces 页签, 会话可标 Done, 并有独立会话管理页; 搜索对话框现可搜工作区并滚到所选条目. → [Using Kimi Code in the browser](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/web. html)

## Auto-update for the native Windows CLI ## 原生 Windows CLI 自动更新

The single-file Windows CLI now updates itself - no more manual downloads.



单文件 Windows CLI 现可自更新, 不必再手工下载.

Also in this release: @-mentioned files, folders, and skills in chat messages render as icon capsules, and the browser tab title shows the current workspace directory; the web Subagent panel is renamed to Background Agent; 0.37.1 fixes pasted images and videos failing to reach the model.



本版还有: 聊天里 @ 提及的文件, 文件夹与 skill 渲染成图标胶囊, 浏览器标签标题显示当前工作区目录; Web 的 Subagent 面板改名为 Background Agent; 0.37.1 修复粘贴的图片与视频到不了模型.

KIMI CODE CLI



KIMI CODE CLI

Subagent model pool



子 agent 模型池

<!-- page 9 of 32 -->

v0.36.0 August 13, 2026



v0.36.0 2026 年 8 月 13 日

KIMI CODE CLI v0.35.0 August 12, 2026



KIMI CODE CLI v0.35.0 2026 年 8 月 12 日

The experimental subagent model configuration is now a model pool: list candidate models with descriptions under [secondary\_model] , and the main agent picks one per spawn based on the task; you can also pin a default with /secondary-model or default\_model . Enable it with KIMI\_CODE\_EXPERIMENTAL\_SECONDARY\_MODEL=1 . → [Subagent model pool](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#subagent-model-pool)



实验性子 agent 模型配置现为模型池: 在 [secondary\_model] 下列候选模型与说明, 主 agent 每次 spawn 按任务挑选; 也可用 /secondary-model 或 default\_model 固定默认. 用 KIMI\_CODE\_EXPERIMENTAL\_SECONDARY\_MODEL=1 开启. → [Subagent model pool](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#subagent-model-pool)

## Experimental fullscreen TUI mode ## 实验性全屏 TUI 模式

Set KIMI\_CODE\_TUI\_FULL\_SCREEN=1 to switch to a fullscreen alternatescreen UI: scrollable transcript viewport, mouse text selection, clickable links, and Ctrl-Shift-F search. → [Environment Variables](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/env-vars. html)



设 KIMI\_CODE\_TUI\_FULL\_SCREEN=1 切换到全屏 alternate-screen UI: 可滚动对话视口, 鼠标选字, 可点链接, Ctrl-Shift-F 搜索. → [Environment Variables](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/env-vars. html)

## LaTeX math rendering ## LaTeX 数学渲染

The TUI now renders LaTeX math formulas ( \$. \$ \$\$. \$\$ ) in messages as Unicode formulas.



TUI 现把消息里的 LaTeX 数学公式(\$. \$ \$\$. \$\$)渲染成 Unicode 公式.

Also in this release: the workspace trust prompt now shows project MCP launch targets and defaults to declining trust, and untrusted workspaces can no longer plant same-named fd stty executables; fixed Ctrl+C being ignored during automatic retries of failed API requests.



本版还有: 工作区信任提示现展示项目 MCP 启动目标, 默认拒绝信任; 不受信工作区不能再植入同名 fd/stty 可执行文件; 修复 API 失败自动重试期间 Ctrl+C 被忽略.

## Modern Web Guidance plugin in the bundled marketplace ## 内置市场的 Modern Web Guidance 插件

Run /plugins and select Modern Web Guidance to install it and get modern web development guidance. → [Plugins](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html)



运行 /plugins 并选择 Modern Web Guidance 安装, 获得现代 Web 开发指引. → [Plugins](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html)

Live background-subagent progress in the /tasks panel The /tasks panel now shows the live work progress of background subagents, so you can follow along without waiting for them to finish. → [Slash Commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html)



/tasks 面板实时显示后台子 agent 进度, 不必等它们结束再看. → [Slash Commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html)

Also in this release: fixed the token counts reported after compaction reading far below the real context size - they now match the numbers shown while the session runs; fixed coder subagents spawning further subagents by default.



本版还有: 修复 compaction 后报告的 token 数远低于真实上下文, 现与会话运行时显示一致; 修复 coder 子 agent 默认继续 spawn 子 agent.

<!-- page 10 of 32 -->

KIMI CODE CLI v0.33.0 August 5, 2026



KIMI CODE CLI v0.33.0 2026 年 8 月 5 日

KIMI CODE CLI Kimi Computer Use comes to Windows v0.34.0 Kimi Computer Use now supports Windows x64 (Windows 10 1903+ / August 6, 2026 Windows 11) - install it from the Official tab in /plugins . → [Kimi Computer Use](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#kimi-computer-use)



KIMI CODE CLI Kimi Computer Use 登陆 Windows v0.34.0: 现支持 Windows x64(Windows 10 1903+ / 2026 年 8 月 6 日 Windows 11), 在 /plugins 的 Official 页签安装. → [Kimi Computer Use](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#kimi-computer-use)

## Cache-expiry reminder ## 缓存过期提醒

Resuming a long-idle session or sending a message after a long idle stretch now shows a reminder that the context cache may have expired, with options to compact or start a new session first; set [cache\_expiry\_hint](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#tui-toml) false to disable it.



恢复长时间空闲会话, 或空闲很久后再发消息, 会提醒上下文缓存可能已过期, 并可选先 compact 或开新会话; 设 [cache\_expiry\_hint](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#tui-toml) false 可关掉.

## kimi web stability and experience improvements ## kimi web 稳定性与体验改进

When a model request fails, a failure card now stays in the session with one-click resume; the sidebar session list adds a flat view; subagent tasks show the model and thinking level they use; and the working status shows retry progress (attempt N of M) during automatic retries.



模型请求失败时, 失败卡片留在会话里并可一键恢复; 侧栏会话列表增加平铺视图; 子 agent 任务显示所用模型与 thinking 档位; 自动重试时工作状态显示进度(attempt N of M).

Also in this release: browser extension links and activation steps are shown after installing Kimi WebBridge; UTF-16 text files can now be read; /feedback works for all signed-in users; fixed kimi -p exiting before background tasks and subagents finish; fixed removing an MCP server breaking open sessions (its tools stay visible, but calls fail with a removal notice).



本版还有: 安装 Kimi WebBridge 后展示扩展链接与激活步骤; 可读 UTF-16 文本; /feedback 对所有已登录用户可用; 修复 kimi -p 在后台任务与子 agent 结束前就退出; 修复移除 MCP server 破坏已打开会话(工具仍可见, 但调用会失败并提示已移除).

Official built-in plugins: Kimi Computer Use and Kimi WebBridge The Official tab of the /plugins marketplace now lists two official built-in capabilities - press Enter to deploy the managed runtime in one step, with retry after interrupted installs and automatic backup of legacy WebBridge skills on upgrade. → [Installation and Management](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#installation-and-management)



官方内置插件: Kimi Computer Use 与 Kimi WebBridge. /plugins 市场 Official 页签现列两项官方内置能力, 按 Enter 一步部署托管运行时, 安装中断可重试, 升级时自动备份旧 WebBridge skills. → [Installation and Management](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#installation-and-management)

## agent-core-v2 engine enabled by default ## agent-core-v2 引擎默认开启

The interactive TUI, kimi -p kimi acp and other CLI surfaces now run on the agent-core-v2 engine by default; set



交互式 TUI, kimi -p, kimi acp 及其他 CLI 面现默认跑在 agent-core-v2 引擎上; 设

<!-- page 11 of 32 -->

August 4, 2026



2026 年 8 月 4 日

KIMI\_CODE\_LEGACY\_FLAG=1 to fall back to the legacy engine if needed. → [Environment Variables](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/env-vars. html)



KIMI\_CODE\_LEGACY\_FLAG=1 可在需要时回退旧引擎. → [Environment Variables](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/env-vars. html)

## kimi web enhancements ## kimi web 增强

The web UI now supports adding and managing custom providers in settings, pinning sessions in the sidebar, setting emoji session titles, and viewing your signed-in account and plan usage.



Web UI 现可在设置里添加管理自定义 provider, 在侧栏固定会话, 设 emoji 会话标题, 并查看已登录账号与套餐用量.

Also in this release: new /bug command as an alias for /feedback startup now asks whether to trust the current folder; fixed MCP OAuth re-authorization always failing with Invalid redirect URI



本版还有: 新增 /bug 作为 /feedback 别名; 启动时询问是否信任当前文件夹; 修复 MCP OAuth 重新授权总因 Invalid redirect URI 失败.

KIMI CODE CLI



KIMI CODE CLI

## Four new hook events ## 四个新 hook 事件

v0.32.0



v0.32.0

Four new hook events - TurnStarted UserPromptQueued



四个新 hook 事件, TurnStarted, UserPromptQueued

TaskStarted and SessionHeartbeat - let you observe turn starts,



TaskStarted 与 SessionHeartbeat, 可观察回合开始,

[Reference](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/hooks. html#event-reference)



[Reference](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/hooks. html#event-reference)

## loop\_control config keys renamed ## loop\_control 配置键更名

```python
max_retries_per_step is now max_attempts_per_step , and
```



```python
max_retries_per_step 现为 max_attempts_per_step, 且
```

max\_steps\_per\_run is now max\_steps\_per\_turn The old keys no



max\_steps\_per\_run 现为 max\_steps\_per\_turn. 旧键不再

longer take effect - a rename warning is shown at startup, so update



生效, 启动时会显示更名警告, 请更新

your config. → [loop\_control](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#loop-control)



配置. → [loop\_control](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#loop-control)

## Local token-usage estimation ## 本地 token 用量估算

A new [token\_counting] config section: when the provider doesn't report token usage, the context-size display can switch to a local estimate. → [token\_counting](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#token-counting)



新增 [token\_counting] 配置段: provider 不报告 token 用量时, 上下文大小显示可改用本地估算. → [token\_counting](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#token-counting)

Also in this release: when the models. dev catalog is unreachable, Kimi Code falls back to a built-in snapshot so known third-party providers can still be imported offline; fixed auto-compaction retrying an oversized request until failure.



本版还有: models. dev 目录不可达时, Kimi Code 回退内置快照, 已知第三方 provider 仍可离线导入; 修复 auto-compaction 对过大请求重试到失败为止.

<!-- page 12 of 32 -->

KIMI CODE CLI v0.31.0 July 30, 2026



KIMI CODE CLI v0.31.0 2026 年 7 月 30 日

KIMI CODE CLI v0.30.0 July 29, 2026



KIMI CODE CLI v0.30.0 2026 年 7 月 29 日

## KIMI CODE CLI Plugins can contribute custom agents ## KIMI CODE CLI 插件可贡献自定义 agent

A plugin can now ship its own agents: declare directories in the manifest's agents field, or simply place an agents/ directory at the plugin root. The agent files are discovered automatically while the plugin is enabled and are available for sub-agent delegation. → [Plugin Agents](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#plugin-agents)



插件现可自带 agent: 在 manifest 的 agents 字段声明目录, 或在插件根放 agents/ 目录. 插件启用期间自动发现这些文件, 可供子 agent 委派. → [Plugin Agents](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#plugin-agents)

## Plugins can inject system-prompt instructions ## 插件可注入 system-prompt 指令

kimi. plugin. json gains systemPrompt and systemPromptPath fields, letting an enabled plugin contribute instructions to the agent's system prompt - effective in the TUI, kimi -p and kimi web . → <u>System</u>[prompt instructions](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#system-prompt-instructions)



kimi. plugin. json 增加 systemPrompt 与 systemPromptPath, 启用的插件可向 agent 的 system prompt 贡献指令, 在 TUI, kimi -p 与 kimi web 生效. → <u>System</u>[prompt instructions](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#system-prompt-instructions)

## Markdown-defined custom agents in the TUI ## TUI 里用 Markdown 定义自定义 agent

Markdown agent files, previously limited to kimi web , now work in the TUI as well: frontmatter declares the name, description, and tool permissions, and the body is the system prompt. → [Custom Agents](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/agents. html#custom-agents)



原先仅限 kimi web 的 Markdown agent 文件现也在 TUI 可用: frontmatter 声明名称, 描述与工具权限, 正文即 system prompt. → [Custom Agents](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/agents. html#custom-agents)

Also in this release: the new /secondary\_model slash command configures the secondary model used by sub-agents (experimental - enable it in /experiments first); TaskOutput is now always non-blocking, returning an immediate snapshot while completion still arrives via automatic notification.



本版还有: 新增 /secondary\_model slash, 配置子 agent 所用次级模型(实验性, 先在 /experiments 开启); TaskOutput 现始终非阻塞, 先回即时快照, 完成仍经自动通知到达.

## Customizable footer status line ## 可定制页脚状态行

tui. toml gains a [status\_line] section: arrange the built-in slots (mode, goal, model, tasks, git, and more) with items , or plug in your own status-line command with command → [Configuration files](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#tui-toml)



tui. toml 增加 [status\_line]: 用 items 排列内置槽位(mode, goal, model, tasks, git 等), 或用 command 挂自己的状态行命令 → [Configuration files](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#tui-toml)

Fail fast when quota runs out



额度用尽时快速失败

When your account quota or balance is exhausted, Kimi Code now errors immediately instead of silently retrying for about 3 minutes.



账号额度或余额耗尽时, Kimi Code 现立即报错, 不再默默重试约 3 分钟.

<!-- page 13 of 32 -->

KIMI CODE CLI
v0.29.1
July 24, 2026



KIMI CODE CLI
v0.29.1
2026 年 7 月 24 日

KIMI CODE CLI v0.29.0 July 22, 2026



KIMI CODE CLI v0.29.0 2026 年 7 月 22 日

Also in this release: installing an official plugin that bills against plan quota (like Kimi Datasource) now shows a quota note, and you're nudged to run /plugins when a plugin used in the session has an update; repeated invalid tool calls now stop the turn instead of retrying indefinitely.



本版还有: 安装会消耗套餐额度的官方插件(如 Kimi Datasource)会显示额度说明; 会话所用插件有更新时会提醒跑 /plugins; 重复无效工具调用现停止本回合, 不再无限重试.

## Web search and web fetch without OAuth ## 无 OAuth 的 Web search 与 web fetch

v0.29.1 adds KIMI\_WEB\_SEARCH\_\* and KIMI\_WEB\_FETCH\_\* environment variables so you can configure web search and web fetch services without OAuth login. → [Environment variables](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/env-vars. html#runtime-switches)



v0.29.1 增加 KIMI\_WEB\_SEARCH\_\* 与 KIMI\_WEB\_FETCH\_\* 环境变量, 可不经 OAuth 登录配置 web search 与 web fetch 服务. → [Environment variables](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/env-vars. html#runtime-switches)

config. toml and environment variables now support global default MCP server timeouts, so you don't have to set them per server. → [Configuration files](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#mcp)



config. toml 与环境变量现支持全局默认 MCP server 超时, 不必按 server 逐个设. → [Configuration files](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#mcp)

Also in this release: experimental secondary-model bindings for newly spawned subagents; fix loss of thinking content with OpenAIcompatible endpoints that return reasoning under a different field name.



本版还有: 新 spawn 子 agent 的实验性 secondary-model 绑定; 修复 OpenAI 兼容端点把 reasoning 写在不同字段名时 thinking 内容丢失.

## Web: Define agents with Markdown files ## Web: 用 Markdown 文件定义 agent

You can now define your own agents as Markdown files: frontmatter at the top declares name, description, and tool permissions, and the body is the system prompt. Custom agents are discovered automatically by the main agent and delegated alongside built-in subagents. → [Agents and Sub-Agents](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/agents. html#custom-agents)



现可用 Markdown 文件定义自己的 agent: 顶部 frontmatter 声明 name, description, 工具权限, 正文即 system prompt. 主 agent 自动发现, 并与内置子 agent 一并委派. → [Agents and Sub-Agents](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/agents. html#custom-agents)

Web: SYSTEM.md overrides the main agent's system prompt Write a plain Markdown \$KIMI\_CODE\_HOME/SYSTEM.md to permanently override the default main agent's system prompt without passing agent or -agent-file every launch; explicitly passed agent files still take precedence. → [Agents and Sub-Agents](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/agents. html#overriding-the-main-agent-s-system-prompt-with-system-md)



Web: SYSTEM.md 覆盖主 agent 的 system prompt. 写一份纯 Markdown \$KIMI\_CODE\_HOME/SYSTEM.md 即可永久覆盖默认主 agent system prompt, 不必每次启动传 agent 或 -agent-file; 显式传入的 agent 文件仍优先. → [Agents and Sub-Agents](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/agents. html#overriding-the-main-agent-s-system-prompt-with-system-md)

<!-- page 14 of 32 -->

KIMI CODE CLI
v0.28.0
July 20, 2026



KIMI CODE CLI
v0.28.0
2026 年 7 月 20 日

## Enable/disable tools globally in config. toml ## 在 config. toml 全局启用/禁用工具

A new [tools] table in config. toml lets you enable or disable specific tools across all sessions, so you don't have to adjust them manually each time. → [Configuration files](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#tools)



config. toml 新增 [tools] 表, 可跨所有会话启用或禁用特定工具, 不必每次手工调. → [Configuration files](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#tools)

Also in this release: videos attached to prompts are now delivered to the model with the prompt itself; the ACP client supports choosing thinking effort; v0.29.1 adds environment variables for web search and web fetch services without OAuth login, plus global default MCP server timeouts in config. toml



本版还有: 附件视频现随提示一并送达模型; ACP 客户端支持选择 thinking effort; v0.29.1 增加无 OAuth 的 web search / web fetch 环境变量, 以及 config. toml 全局默认 MCP 超时.

kimi web runs in the foreground, kimi server deprecated kimi web now runs in the current terminal foreground and opens the browser automatically; stop it with Ctrl+C . The old kimi server command tree is deprecated, its subcommands removed, with only kimi server kill retained as a fallback for stopping background services launched before v0.28.0. → [kimi web](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-web)



kimi web 前台运行, kimi server 弃用: kimi web 现于当前终端前台运行并自动打开浏览器; 用 Ctrl+C 停止. 旧 kimi server 命令树弃用, 子命令移除, 仅保留 kimi server kill, 用于停掉 v0.28.0 前启动的后台服务. → [kimi web](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-web)

## Thinking effort persists more conservatively ## Thinking effort 持久化更保守

Thinking effort is now persisted only for levels below a model's top tier ( max ), so switching models no longer leaves you with an empty or unresponsive effort picker when the old max setting isn't supported. → [Model configuration](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#models)



Thinking effort 现只对低于模型最高档(max)的级别持久化, 换模型时不会因旧 max 不被支持而导致 effort 选择器空或无响应. → [Model configuration](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#models)

Also in this release: the web model switcher now warns that switching models or thinking effort invalidates the existing prompt cache; the YOLO and Auto permission mode descriptions are corrected - YOLO auto-approves tool actions but may still ask questions, while Auto is fully autonomous and never asks.



本版还有: Web 模型切换器会警告换模型或 thinking effort 会使现有 prompt cache 失效; YOLO 与 Auto 权限模式说明已纠正, YOLO 自动批准工具动作但仍可能提问, Auto 完全自主且从不提问.

/copy for the last reply New /copy slash command copies the last assistant message to the clipboard - no more manually selecting long answers. → [Slash](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html)



/copy 复制上一条回复: 新 /copy slash 把最近一条助手消息拷到剪贴板, 不必再手工选长答案. → [Slash](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html)

<!-- page 15 of 32 -->

July 16, 2026



2026 年 7 月 16 日

[Commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html)



[Commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html)

## Auto-refresh of the model list for API key users ## API key 用户自动刷新模型列表

When calling Kimi coding models with an API key, Kimi Code now automatically fetches the latest model list, so new models are usable without manual config changes. → [Model configuration](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#models)



用 API key 调用 Kimi coding 模型时, Kimi Code 现自动拉取最新模型列表, 新模型无需改配置即可用. → [Model configuration](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#models)

Also in this release: OAuth connection failures now show the underlying network cause (DNS, refused connection, TLS, timeout) instead of a bare fetch failed ; the built-in URL fetch tool's network safeguards are hardened so crafted domains and redirect chains can no longer reach loopback or internal network services.



本版还有: OAuth 连接失败现展示底层网络原因(DNS, 连接拒绝, TLS, 超时), 不再只写 fetch failed; 内置 URL fetch 工具的网络安全加固, 精心构造的域名与重定向链不能再摸到 loopback 或内网服务.

## MODEL RELEASE ## 模型发布

Kimi K3, our most capable model to date, is now released and open-sourced, and available in Kimi Code.



迄今最强的 Kimi K3 现已发布并开源, 可在 Kimi Code 使用.

### Model scale & architecture ### 模型规模与架构

2.8 trillion parameters, built on KDA hybrid linear attention and Attention Residuals - the first open-source model at the 3-trillion-parameter scale.



2.8 万亿参数, 基于 KDA 混合线性注意力与 Attention Residuals, 首个开源级别约 3 万亿参数规模的模型.

### Long context & multimodal ### 长上下文与多模态

Native visual understanding with up to 1M-token context, handling large codebases and extended coherent reasoning.



原生视觉理解, 上下文最高 1M token, 可处理大型代码库与长程连贯推理.

### Coding & agent strengths ### 编码与 agent 强项

Excels at long-horizon programming, game dev / 3D, and knowledge work; sustains long engineering tasks with minimal human supervision across kernel optimization, GPU compilers, chip design, and scientific computing.



擅长长程编程, 游戏开发 / 3D 与知识工作; 在内核优化, GPU 编译器, 芯片设计与科学计算等长工程任务上, 以极少人工监督持续推进.

### Benchmark positioning ### 基准定位

A top-tier model that outperforms Opus 4.8, GPT 5.5, and other mainstream models; on challenging coding tasks such



顶尖模型, 表现优于 Opus 4.8, GPT 5.5 及其他主流模型; 在诸如

<!-- page 16 of 32 -->

as kernel optimization, it performs close to the strongest proprietary models.



内核优化等挑战性编码任务上, 表现接近最强的闭源模型.

### Membership ### 会员

Moderato members and above can use Kimi K3; Allegretto members and above unlock the 1M context window. K3 now supports low high max thinking effort levels, so you can pick the right intensity for each task. → [Model configuration](https://www. kimi. com/code/docs/en/kimi-code/models. html)



Moderato 及以上可用 Kimi K3; Allegretto 及以上解锁 1M 上下文. K3 现支持 low high max 三档 thinking effort, 可按任务选强度. → [Model configuration](https://www. kimi. com/code/docs/en/kimi-code/models. html)

### Usage tip ### 使用提示

Switching models invalidates the existing context cache, so consumption is higher right after switching; start a new session before using Kimi K3 for better results and lower consumption.



换模型会使现有上下文缓存失效, 切换后立刻用量更高; 用 Kimi K3 前开新会话, 效果更好, 消耗更低.

## KIMI CODE CLI Coder sub-agent capabilities aligned with the main agent ## KIMI CODE CLI Coder 子 agent 能力对齐主 agent

v0.26.0 The coder sub-agent now supports background tasks, todo lists, plan July 16, 2026 mode, skill invocation, and nested agents, so it can handle more complex coding workflows on its own. → [Agents and Sub-Agents](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/agents. html)



v0.26.0 2026 年 7 月 16 日: coder 子 agent 现支持后台任务, todo 列表, plan 模式, skill 调用与嵌套 agent, 可独自处理更复杂的编码工作流. → [Agents and Sub-Agents](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/agents. html)

Cache-invalidation hints in /model and /effort Switching the model or effort now warns that the existing prompt cache will be invalidated, and suggests using /new to avoid extra token costs. → [Slash Commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html)



/model 与 /effort 的缓存失效提示: 换模型或 effort 会警告现有 prompt cache 将失效, 并建议用 /new 避免额外 token 成本. → [Slash Commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html)

Also in this release: the context-size indicator no longer under-reports the model's actual context usage; a resumed session without new activity is no longer incorrectly marked as just updated.



本版还有: 上下文大小指示器不再低估模型实际上下文用量; 无新活动的恢复会话不再被误标为刚更新.

The built-in web UI now supports attaching files of any type in chat: drop a file anywhere on the window to send it, and files, images, and



内置 Web UI 现支持在聊天中附加任意类型文件: 把文件拖到窗口任意处即可发送, 文件, 图片与

<!-- page 17 of 32 -->

videos are shown as attachment tags in the message bubble. → [Using Kimi Code CLI in IDEs](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/ides. html)



视频在消息气泡里显示为附件标签. → [Using Kimi Code CLI in IDEs](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/ides. html)

v0.24.2 July 15, 2026



v0.24.2 2026 年 7 月 15 日

## Aligned Anthropic effort configuration ## 对齐 Anthropic effort 配置

Anthropic-compatible providers now apply the official effort configuration, with unknown models falling back to a 128k output limit and custom-named models getting correct thinking-strength controls for new sessions. → [Providers and models](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/providers. html)



Anthropic 兼容 provider 现应用官方 effort 配置; 未知模型回退 128k 输出上限, 自定义名模型在新会话获得正确的 thinking 强度控制. → [Providers and models](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/providers. html)

Also in this release: model request failures now show full diagnostics; two security issues were fixed - the web server's bearer-token check could be bypassed via percent-encoded API paths, and the session filesystem API could follow symlinks outside the workspace and access host files.



本版还有: 模型请求失败现展示完整诊断; 修复两处安全问题, Web 服务器的 bearer-token 校验可经百分号编码 API 路径绕过, 以及会话文件系统 API 可跟随符号链接到工作区外并访问主机文件.

KIMI CODE CLI



KIMI CODE CLI

## Built-in docs Q&A skill ## 内置文档问答 skill

A new built-in /check-kimi-code-docs answers Kimi Code product questions (CLI usage, configuration, membership, error codes) straight from the official docs, citing source links in its answers - so you no longer have to leave the terminal to look something up. → [Built-in Skill Commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#built-in-skill-commands)



新增内置 /check-kimi-code-docs, 直接按官方文档回答 Kimi Code 产品问题(CLI 用法, 配置, 会员, 错误码), 答案附来源链接, 不必离开终端去查. → [Built-in Skill Commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#built-in-skill-commands)

Also in this release: the per-step LLM retry cap has been raised from 3 to 10, so transient provider-side failures (429 / overload) are retried automatically before the whole turn fails; and print mode ( kimi -p ) no longer exits after a single turn - as long as background tasks are pending it stays alive and feeds each result back to the main agent ( print\_background\_mode now defaults to steer and background tasks and subagents no longer time out by default).



本版还有: 每步 LLM 重试上限从 3 提到 10, 瞬时 provider 失败(429 / overload)会自动重试再让整回合失败; print 模式(kimi -p)不再单回合就退出, 只要有后台任务待完成就保持存活并把结果回投主 agent(print\_background\_mode 现默认 steer, 后台任务与子 agent 默认不再超时).

## KIMI CODE CLI Session export ## KIMI CODE CLI 会话导出

The web UI can now export a session: run /export , or pick "Export session" from a session's overflow menu, to bundle the conversation



Web UI 现可导出会话: 运行 /export, 或从会话溢出菜单选「Export session」, 把对话

<!-- page 18 of 32 -->

KIMI CODE

HighSpeed & Extra Usage are live July 9, 2026



KIMI CODE

HighSpeed 与 Extra Usage 上线 2026 年 7 月 9 日

and troubleshooting logs into a downloadable ZIP (up to 64 MiB) - handy for archiving or filing a report. → [Exporting a session](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/sessions. html#exporting-a-session)



与排障日志打成可下载 ZIP(最大 64 MiB), 便于归档或提交报告. → [Exporting a session](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/sessions. html#exporting-a-session)

## Foreground commands background on timeout ## 前台命令超时转后台

When a foreground Bash command hits its timeout it is no longer killed - it moves to the background and keeps running, reporting its result when it finishes, so long-running commands are no longer lost



前台 Bash 命令触达超时时不再被杀掉, 转入后台继续跑, 结束后回报结果, 长命令不再丢失

[background] to restore the kill-on-timeout behavior. → [Built-in Tools . Shell](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/tools. html#shell)



用 [background] 可恢复超时即杀行为. → [Built-in Tools . Shell](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/tools. html#shell)

Also in this release: forking a session now fully preserves media attachments, plan files, background task output, and cron jobs, and a failed fork no longer leaves a partial copy behind; kimi web now defaults to the rebuilt agent engine.



本版还有: fork 会话现完整保留媒体附件, plan 文件, 后台任务输出与 cron; fork 失败不再留下残缺副本; kimi web 现默认用重建后的 agent 引擎.

## ⚡ HighSpeed is now available ## ⚡ HighSpeed 现已可用

Kimi Code now offers two tiers - Standard and HighSpeed - built on the same model with identical coding ability; HighSpeed delivers roughly 5–6× the output speed of Standard. Switch instantly with /model in the CLI, or set the model ID to kimi-for-coding-highspeed in third-party tools. HighSpeed requires an [Allegretto](https://www. kimi. com/membership/pricing? from=kfc_membership_topbar&track_id=a7764d49-73ad-4d08-b2f3-a8d7433917f8) plan or above. → [How to Switch Models](https://www. kimi. com/code/docs/en/kimi-code/models. html#switch-model)



Kimi Code 现提供两档, Standard 与 HighSpeed, 同一模型, 编码能力相同; HighSpeed 输出速度约 Standard 的 5–6×. CLI 用 /model 即时切换, 或在第三方工具把 model ID 设为 kimi-for-coding-highspeed. HighSpeed 需 [Allegretto](https://www. kimi. com/membership/pricing? from=kfc_membership_topbar&track_id=a7764d49-73ad-4d08-b2f3-a8d7433917f8) 及以上. → [How to Switch Models](https://www. kimi. com/code/docs/en/kimi-code/models. html#switch-model)

## Extra Usage is now available ## Extra Usage 现已可用

When your subscription quota runs out, keep making requests with your Extra Usage balance - it bypasses the monthly / weekly / hourly membership quota limits, works whenever any limit is reached, only deducts the Extra Usage balance, and doesn't affect your membership quota refresh. Only subscribed members can enable it, at Kimi homepage → Settings → Membership Plan → My Quota. → [About Extra Usage](https://www. kimi. com/code/docs/en/kimi-code/membership. html#extra-usage)



订阅额度用尽后, 可用 Extra Usage 余额继续请求, 绕过月 / 周 / 时会员额度上限, 任一限额触达时都可用, 只扣 Extra Usage 余额, 不影响会员额度刷新. 仅订阅会员可开, 入口在 Kimi 首页 → Settings → Membership Plan → My Quota. → [About Extra Usage](https://www. kimi. com/code/docs/en/kimi-code/membership. html#extra-usage)

<!-- page 19 of 32 -->

KIMI CODE CLI
v0.22.0
July 2, 2026



KIMI CODE CLI
v0.22.0
2026 年 7 月 2 日

## KIMI CODE CLI Archived sessions ## KIMI CODE CLI 已归档会话

The web UI adds an Archived sessions page where you can browse and restore archived sessions in one click - open Settings → Archived to view them.



Web UI 增加 Archived sessions 页, 可一键浏览并恢复已归档会话, 打开 Settings → Archived 查看.

## Reasoning preserved across turns ## 跨回合保留 reasoning

With Thinking enabled, Kimi models now keep their reasoning across turns by default so the model can build on its earlier thought; set [thinking] keep = "off" to disable it. → [Model configuration](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#thinking)



开启 Thinking 时, Kimi 模型默认跨回合保留 reasoning, 便于在先前思考上继续; 设 [thinking] keep = 「off」 可关. → [Model configuration](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#thinking)

## Compaction summary at a glance ## Compaction 摘要一览

After the context is compacted, the TUI shows a summary of what was compacted; press Ctrl-O to show or hide it within the compaction block - the same shortcut that collapses tool output. → [Interaction and input](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#during-streaming-output)



上下文 compaction 后, TUI 显示压缩了什么的摘要; 在 compaction 块内按 Ctrl-O 显隐, 与折叠工具输出同一快捷键. → [Interaction and input](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#during-streaming-output)

Also in this release: an experimental on-demand tool loader ( select\_tools ) - with the tool-select flag enabled, capable models load MCP tools on demand instead of sending them all on every request, preserving the provider's prompt cache; and sessions that existed on disk but were missing from the list or returned 404 on direct access are fixed, as the server now rebuilds the session index on startup.



本版还有: 实验性按需工具加载(select\_tools), 开启 tool-select 后, 有能力的模型按需加载 MCP 工具, 而非每次请求全量发送, 以保住 provider 的 prompt cache; 磁盘上存在但列表缺失或直达 404 的会话已修复, 服务器启动时重建会话索引.

## Automatic oversized-image compression ## 超大图片自动压缩

Images that exceed model limits are now automatically downsampled and re-encoded before reaching the model, cutting vision-token cost and avoiding provider image-size errors.



超过模型限制的图片会在送达模型前自动降采样并重编码, 降低 vision-token 成本并避免 provider 图片尺寸错误.

## Model configuration overrides ## 模型配置覆盖

A new [models."&lt; alias&gt;". overrides] table lets you override model metadata after provider-catalog refreshes - useful for pinning thinking-effort levels, default effort, and other fields so custom configs survive refreshes. → [Model configuration](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#model-overrides)



新增 [models.「&lt; alias&gt;」. overrides] 表, 可在 provider 目录刷新后覆盖模型元数据, 便于固定 thinking-effort 档位, 默认 effort 等字段, 使自定义配置在刷新后仍在. → [Model configuration](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#model-overrides)

<!-- page 20 of 32 -->

## New web UI design system ## 新的 Web UI 设计系统

The built-in web UI gets a refreshed design system with updated colors, typography, spacing, light and dark palettes, and subtler enter/exit and expand/collapse animations for a more consistent look and feel.



内置 Web UI 换了设计系统: 颜色, 字体, 间距, 浅/深色板更新, 进入/退出与展开/折叠动画更克制, 观感更统一.

Also in this release: a new Cmd/Ctrl+K session-search palette filters by title, workspace, and recent prompt; consecutive tool calls are now grouped into a collapsible stack with diff line counts and inline previews for image, video, and audio results.



本版还有: 新增 Cmd/Ctrl+K 会话搜索面板, 可按标题, 工作区与最近提示过滤; 连续工具调用收成可折叠栈, 带 diff 行数, 以及图片, 视频, 音频结果的内联预览.

## KIMI CODE CLI Plugins can provide slash commands ## KIMI CODE CLI 插件可提供 slash 命令

Plugins can now declare slash commands via a commands field in their manifest, registered as &lt; plugin&gt;: &lt; command&gt; and invoked with \ expansion - turning common workflows into commands with no extra setup. → [Plugin slash commands](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#plugin-slash-commands)



插件现可通过 manifest 的 commands 字段声明 slash, 注册为 &lt; plugin&gt;: &lt; command&gt;, 调用时展开 \, 常见工作流可变成命令, 无需额外配置. → [Plugin slash commands](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#plugin-slash-commands)

## Mermaid diagrams in web chat ## Web 聊天里的 Mermaid 图

Fenced mermaid blocks in assistant responses now render as diagrams in the built-in web UI, and KaTeX math and Mermaid parsing run in Web Workers to keep the UI responsive during live streaming.



助手回复里的 fenced mermaid 块现于内置 Web UI 渲染成图; KaTeX 数学与 Mermaid 解析跑在 Web Worker, 流式输出时界面仍响应.

## KIMI CODE CLI Video input and Anthropic-compatible protocol ## KIMI CODE CLI 视频输入与 Anthropic 兼容协议

Kimi Code now supports the Anthropic-compatible protocol, and the ReadMediaFile tool can send video to the model as multimodal content - availability follows the current model's image\_in video\_in capabilities. → [Built-in tools](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/tools. html#file-tools)



Kimi Code 现支持 Anthropic 兼容协议, ReadMediaFile 工具可把视频作为多模态内容送给模型, 是否可用跟随当前模型的 image\_in / video\_in 能力. → [Built-in tools](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/tools. html#file-tools)

## Web completion sound and notifications ## Web 完成音与通知

The built-in web UI gains a completion sound, a completion notification, and an issue notification, each with its own toggle in settings. Issue notifications are off by default; only after you opt in is the issue text pushed to the desktop.



内置 Web UI 增加完成音, 完成通知与 issue 通知, 设置里各自开关. Issue 通知默认关; 只有你选择后才把 issue 文案推到桌面.

<!-- page 21 of 32 -->

## Custom outbound request headers ## 自定义出站请求头

A new KIMI\_CODE\_CUSTOM\_HEADERS environment variable lets you customize headers on outbound LLM requests (one Name: Value per line), and a User-Agent header is now sent to non-Kimi providers.



新增环境变量 KIMI\_CODE\_CUSTOM\_HEADERS, 可自定义出站 LLM 请求头(每行一个 Name: Value); 对非 Kimi provider 现也会发送 User-Agent.

Also in this release: a provider 413 context overflow now recovers by compacting and retrying first, and compaction output is capped at 128k tokens by default to avoid provider max\_tokens errors.



本版还有: provider 返回 413 上下文溢出时, 先 compaction 再重试; compaction 输出默认封顶 128k token, 避免 provider max\_tokens 错误.

<!-- page 22 of 32 -->

KIMI CODE CLI
v0.20.0
June 26, 2026



KIMI CODE CLI
v0.20.0
2026 年 6 月 26 日

KIMI CODE CLI v0.19.0 June 22, 2026



KIMI CODE CLI v0.19.0 2026 年 6 月 22 日

## Shell mode ## Shell 模式

Type ! in the input box to enter shell mode and run terminal commands without leaving the conversation - output is written into the context for later turns. For long-running commands, press Ctrl+B to move them into the background. For example, run ! gh auth login to sign in to the GitHub CLI without opening a new terminal. → [Shell mode](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#shell-mode)



在输入框键入 ! 进入 shell 模式, 不用离开对话就能跑终端命令, 输出写入上下文供后续回合用. 长命令可按 Ctrl+B 转后台. 例如 ! gh auth login 登录 GitHub CLI, 不必新开终端. → [Shell mode](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#shell-mode)

## Expose the web server to the internet ## 把 Web 服务器暴露到公网

kimi web gains a --host option to expose the web server beyond your local machine, hardened with token authentication and rate limiting so you can reach the session UI from a remote box. → [kimi web](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-web)



kimi web 增加 --host, 可把 Web 服务器暴露到本机之外, 并用 token 认证与限流加固, 以便从远程机器打开会话 UI. → [kimi web](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-web)

## Redesigned plugin manager ## 重设计的插件管理器

/plugins is now a single tabbed panel: Installed to manage installed plugins, Official for the Kimi-maintained marketplace, Third-party for marketplace plugins from other publishers, and Custom to install from a GitHub URL, zip, or local path - switch tabs with Tab Shift-Tab A confirmation prompt now appears before installing third-party plugins. → [Plugins](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#installation-and-management)



/plugins 现为单一面板多页签: Installed 管理已装, Official 为 Kimi 官方市场, Third-party 为其他发行方市场, Custom 从 GitHub URL / zip / 本地路径安装, 用 Tab / Shift-Tab 切换. 安装第三方插件前会确认. → [Plugins](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#installation-and-management)

Also in this release: fixed a startup crash on Linux caused by a native clipboard error, and /reload now refreshes plugin Skills so plugin changes take effect in the current session without starting a new one.



本版还有: 修复 Linux 上原生剪贴板错误导致的启动崩溃; /reload 现刷新插件 Skills, 插件改动可在当前会话生效, 不必新开.

## Extra workspace directories ## 额外工作区目录

You can now add directories beyond your working directory to a session: use /add-dir &lt; path&gt; to add one to the current session, or kimi -add-dir &lt; path&gt; at startup. When you choose to remember a directory, the path is written to the project-level . kimicode/local. toml so it applies automatically in every session of that project. → [Project-local configuration](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#project-local-configuration)



现可为会话加入工作目录之外的目录: 用 /add-dir &lt; path&gt; 加到当前会话, 或启动时 kimi -add-dir &lt; path&gt;. 选择记住目录时, 路径写入项目级 . kimicode/local. toml, 该项目每次会话自动生效. → [Project-local configuration](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#project-local-configuration)

<!-- page 23 of 32 -->

KIMI CODE CLI
v0.18.0
June 18, 2026



KIMI CODE CLI
v0.18.0
2026 年 6 月 18 日

KIMI CODE CLI
v0.17.0
June 17, 2026



KIMI CODE CLI
v0.17.0
2026 年 6 月 17 日

## Background tasks ## 后台任务

Press Ctrl+B to move long-running foreground commands and subagents into the background, freeing up the session to continue, and view their status from the /tasks panel. → [Session Management](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#session-management)



按 Ctrl+B 把长跑前台命令与子 agent 转后台, 会话可继续, 状态在 /tasks 面板查看. → [Session Management](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#session-management)

Also in this release: provider safety-policy blocks are now surfaced instead of being silently treated as a completed turn, and the filemention experience is improved.



本版还有: provider 安全策略拦截现会显式展示, 不再静默当成已完成回合; 文件提及体验改进.

## KIMI CODE CLI Web session filtering and lazy loading ## KIMI CODE CLI Web 会话过滤与懒加载

The web sidebar gains a session filter that matches on title and the most recent user prompt, and the chat view lazy-loads earlier messages as you scroll up - making long sessions easier to browse. → [kimi web](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-web)



Web 侧栏增加按标题与最近用户提示匹配的会话过滤; 聊天视图上滚时懒加载更早消息, 长会话更好翻. → [kimi web](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-web)

## Cap AgentSwarm ramp-up concurrency ## 限制 AgentSwarm 启动并发

A new KIMI\_CODE\_AGENT\_SWARM\_MAX\_CONCURRENCY environment variable limits how many sub-agents AgentSwarm runs at once during its initial ramp-up, making large swarms less likely to hit provider rate limits. → [Runtime switches](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/env-vars. html#runtime-switches)



新增环境变量 KIMI\_CODE\_AGENT\_SWARM\_MAX\_CONCURRENCY, 限制 AgentSwarm 初始爬坡时同时跑多少子 agent, 降低大 swarm 撞 provider 限流的概率. → [Runtime switches](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/env-vars. html#runtime-switches)

Also in this release: the web app no longer loads only the 20 most recent sessions, and web settings now display the current version.



本版还有: Web 应用不再只加载最近 20 个会话; Web 设置现显示当前版本.

## KIMI CODE CLI Kimi Code Web Mode ## KIMI CODE CLI Kimi Code Web 模式

A new web mode you can launch with kimi web or the in-CLI /web continuing the current session in a browser chat interface. kimi web is an alias for kimi server run --open - it starts the local server in the background and opens the web UI automatically. → [kimi web](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-web)



可用 kimi web 或 CLI 内 /web 启动新的 Web 模式, 在浏览器聊天界面继续当前会话. kimi web 是 kimi server run --open 的别名, 后台起本地服务器并自动打开 Web UI. → [kimi web](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-web)

Also in this release: when an OAuth token refresh still fails after internal retries, the underlying connection error is shown instead of a



本版还有: OAuth token 刷新在内部重试后仍失败时, 展示底层连接错误, 而不再

<!-- page 24 of 32 -->

KIMI CODE CLI
v0.16.0
June 16, 2026



KIMI CODE CLI
v0.16.0
2026 年 6 月 16 日

v0.15.0
June 15, 2026



v0.15.0
2026 年 6 月 15 日

misleading re-login prompt; and kimi web failing to start in the background is fixed (v0.17.1).



误导性的重新登录提示; 并修复 kimi web 后台启动失败(v0.17.1).

## kimi vis session visualizer ## kimi vis 会话可视化

A new built-in kimi vis command launches the session visualizer in your browser, pointed at your local sessions, so you can see a whole session unfold at a glance. It supports --port --host --no-open and kimi vis &lt; sessionId&gt; to deep-link straight to a specific session. → [kimi vis](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-vis)



新增内置 kimi vis, 在浏览器打开会话可视化, 指向本地会话, 可一眼看整场会话展开. 支持 --port --host --no-open, 以及 kimi vis &lt; sessionId&gt; 直达指定会话. → [kimi vis](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-vis)

Also in this release: Anthropic-compatible providers no longer read ambient Anthropic shell credentials and custom headers, avoiding accidental credential leakage; and repeated compaction is fixed for cases where context stays over the blocking threshold.



本版还有: Anthropic 兼容 provider 不再读取环境里的 Anthropic shell 凭据与自定义头, 避免意外泄露; 上下文持续高于阻塞阈值时的反复 compaction 已修复.

KIMI CODE CLI



KIMI CODE CLI

## All-sessions picker ## 全会话选择器

A new all-sessions picker view lets you browse sessions across every working directory, search them by name, page through the list, and copy a ready-to-run resume command for sessions started elsewhere.



新的全会话选择器可跨所有工作目录浏览会话, 按名搜索, 翻页, 并复制可直接跑的 resume 命令(用于别处启动的会话).

## Reasoning follows your language ## Reasoning 跟随你的语言

The same-language rule now extends to the model's reasoning, so its thinking follows the language you use while keeping code and technical terms in their original form.



同语言规则现延伸到模型的 reasoning: 思考跟你用的语言走, 代码与技术术语仍保持原文形态.

Also in this release: MCP now supports legacy SSE servers alongside stdio and streamable HTTP transports (→ [connection methods](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/mcp. html#connection-methods)); and TUI components now wrap, compact, or truncate over-wide content to stay readable in narrow terminals.



本版还有: MCP 在 stdio 与 streamable HTTP 之外支持旧式 SSE 服务器(→ [connection methods](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/mcp. html#connection-methods)); TUI 组件对过宽内容换行, 压缩或截断, 窄终端仍可读.

<!-- page 25 of 32 -->

MODEL RELEASE Kimi K2.7 Code June 12, 2026



模型发布 Kimi K2.7 Code 2026 年 6 月 12 日

v0.14.0 June 10, 2026



v0.14.0 2026 年 6 月 10 日

Kimi K2.7 Code, our latest coding model, is now released and open-sourced - and available in Kimi For Coding. The new model takes effect only with Thinking On (thinking mode enabled).



最新编码模型 Kimi K2.7 Code 现已发布并开源, 可在 Kimi For Coding 使用. 新模型仅在 Thinking On(开启 thinking 模式)时生效.

Improved coding & agent performance over K2.6 +10.4% on Program-Bench, +11.4% on MCP Mark Verified, and +76.2% on SWE Marathon.



相对 K2.6 的编码与 agent 表现提升: Program-Bench +10.4%, MCP Mark Verified +11.4%, SWE Marathon +76.2%.

Reasoning efficiency Less overthinking, with 30% lower reasoning-token usage compared to K2.6.



推理效率: 更少 overthinking, 相对 K2.6 的 reasoning-token 用量低 30%.

Long-horizon coding Improved instruction following and higher end-to-end coding task success rates.



长程编码: 指令遵循更好, 端到端编码任务成功率更高.

⚡ Kimi K2.7 Code HighSpeed Edition (beta coming soon) The same model at roughly 5-6× the output speed.



⚡ Kimi K2.7 Code HighSpeed Edition(beta 即将推出): 同一模型, 输出速度约 5-6×.

KIMI CODE CLI



KIMI CODE CLI

## Interrupt hook event ## Interrupt hook 事件

When you interrupt a turn (for example by pressing Esc), hooks now receive a dedicated Interrupt event - it fires in place of Stop so external tooling no longer mistakes an interrupted turn for one that is still running. Programmatic interruptions such as timeouts don't trigger it. → [Event reference](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/hooks. html#event-reference)



中断回合时(例如按 Esc), hooks 现收到专用 Interrupt 事件, 替代 Stop 触发, 外部工具不会再把中断回合误当成仍在跑. 超时等程序性中断不触发它. → [Event reference](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/hooks. html#event-reference)

## Kimi Datasource adds legal data ## Kimi Datasource 增加法律数据

The official data plugin is now at v3.2.0, adding Chinese laws, regulations, and judicial cases - coverage now spans five data domains: stock market, macroeconomics, corporate registry, academic literature, and legal. → [Plugin overview](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#kimi-datasource)



官方数据插件现为 v3.2.0, 加入中国法律, 法规与司法案例, 覆盖五大域: 股市, 宏观, 企业注册, 学术文献, 法律. → [Plugin overview](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#kimi-datasource)

Also in this release: images in tool outputs are no longer dropped when using OpenAI-compatible Chat Completions; since v0.13.1,



本版还有: 使用 OpenAI 兼容 Chat Completions 时, 工具输出里的图片不再被丢弃; 自 v0.13.1 起,

<!-- page 26 of 32 -->

KIMI CODE CLI
v0.13.0
June 10, 2026



KIMI CODE CLI
v0.13.0
2026 年 6 月 10 日

v0.12.0 June 9, 2026



v0.12.0 2026 年 6 月 9 日

running /undo without a count opens an interactive picker for choosing which prompts to roll back (→ [Session management](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#session-management)).



无 count 运行 /undo 会打开交互选择器, 挑选要回滚的提示(→ [Session management](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#session-management)).

## KIMI CODE CLI Custom color themes ## KIMI CODE CLI 自定义配色主题

KIMI CODE CLI



KIMI CODE CLI

Beyond the built-in dark and light palettes, you can now define your own as a JSON file - override only the colors you care about, the rest fall back to a base palette, and the file name becomes the theme name. Or run /custom-theme and let Kimi pick colors with you and write the theme file into \~/. kimi-code/themes/ → [Custom themes](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/themes. html)



除内置深/浅色板外, 现可用 JSON 自定义, 只覆盖关心的颜色, 其余回退基色板, 文件名即主题名. 或跑 /custom-theme, 让 Kimi 一起选色并把主题写入 \~/. kimi-code/themes/ → [Custom themes](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/themes. html)

## /import-from-cc-codex one-step import ## /import-from-cc-codex 一步导入

Import selected instructions, Skills, and MCP settings from Claude Code and Codex - no need to reconfigure everything by hand when moving to Kimi Code. → [Built-in skill commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#built-in-skill-commands)



从 Claude Code 与 Codex 导入所选 instructions, Skills 与 MCP 设置, 迁到 Kimi Code 时不必全手工重配. → [Built-in skill commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#built-in-skill-commands)

Also in this release: the marketplace list now flags installed plugins that have updates available - select one and press Enter to upgrade (→ [Plugins](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#installation-and-management)); device login keeps the URL and code visible when the browser fails to open.



本版还有: 市场列表会标记已装且有更新的插件, 选中按 Enter 升级(→ [Plugins](https://www. kimi. com/code/docs/en/kimi-code-cli/customization/plugins. html#installation-and-management)); 浏览器打不开时, 设备登录仍保持 URL 与代码可见.

## /swarm multi-agent parallel tasks ## /swarm 多智能体并行任务

Use /swarm &lt; task&gt; to start swarm mode - multiple agents work on the same objective in parallel, with live progress display and ratelimit-aware automatic retries. Swarm mode exits automatically when the task completes. → [Slash commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#modes-run-control)



用 /swarm &lt; task&gt; 启动 swarm 模式, 多个 agent 并行攻同一目标, 实时进度显示, 并有感知限流的自动重试. 任务完成后 swarm 自动退出. → [Slash commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#modes-run-control)

## Proxy support ## 代理支持

The standard HTTP\_PROXY HTTPS\_PROXY ALL\_PROXY and NO\_PROXY environment variables are now fully honored, including SOCKS proxies ( socks5: // socks4: // , and similar schemes). Loopback addresses always bypass the proxy, so local MCP servers on localhost continue to work after setting one. → [Environment variables](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/env-vars. html)



标准 HTTP\_PROXY, HTTPS\_PROXY, ALL\_PROXY, NO\_PROXY 现被完整遵守, 含 SOCKS(socks5: //, socks4: // 等). loopback 地址始终绕过代理, 设代理后 localhost 上的本地 MCP 仍可用. → [Environment variables](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/env-vars. html)

<!-- page 27 of 32 -->

v0.11.0 June 5, 2026



v0.11.0 2026 年 6 月 5 日

Goals, background questions, and Sub-Skill discovery are now stable These three features no longer require experimental opt-ins and are available by default. Micro compaction is also enabled by default - it trims older oversized tool results to reduce context overhead. To opt out, set experimental. micro\_compaction = false in config. toml (Removed in v0.22.1.)



Goals, 后台问题与 Sub-Skill 发现现已稳定: 三者不再需要实验开关, 默认可用. Micro compaction 也默认开启, 修剪偏旧, 过大的工具结果以降低上下文开销. 退出可在 config. toml 设 experimental. micro\_compaction = false(已在 v0.22.1 移除).

Also in this release: Homebrew installations are detected and updated with brew upgrade kimi-code ; Skills and global agent instructions load from KIMI\_CODE\_HOME when set; long shell commands in approval prompts now wrap to show the full command; multiple goal mode and ACP routing fixes.



本版还有: 检测到 Homebrew 安装并用 brew upgrade kimi-code 更新; 设了 KIMI\_CODE\_HOME 时从该处加载 Skills 与全局 agent 指令; 审批提示里的长 shell 命令会换行显示完整命令; 多项 goal 模式与 ACP 路由修复.

Built-in Skills (such as update-config ) now appear directly in the slash command panel - no skill: prefix needed. Type and they show up immediately, grouped ahead of external Skills. → [Slash commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#skill-dynamic-commands)



内置 Skills(如 update-config)现直接出现在 slash 面板, 不必 skill: 前缀. 键入即现, 排在外部 Skills 前面. → [Slash commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#skill-dynamic-commands)

Sub-Skill discovery (experimental)



Sub-Skill 发现(实验性)

A new experimental Sub-Skill system ships built-in sub-skill. review (audit existing Skills) and sub-skill. consolidate (merge Skills into hierarchical groups). Enable with



新的实验性 Sub-Skill 系统内置 sub-skill. review(审计已有 Skills)与 sub-skill. consolidate(把 Skills 并成层级组). 启用方式:

`	xt
KIMI_CODE_EXPERIMENTAL_SUB_SKILL=1 . → Agent Skills
`



`	xt
KIMI_CODE_EXPERIMENTAL_SUB_SKILL=1 . → Agent Skills
`

Also in this release: YOLO mode now asks for confirmation before starting a goal and suggests switching to Auto for unattended work; sub-agents show resume instructions on timeout; multiple goal queue bug fixes.



本版还有: YOLO 模式启动 goal 前会确认, 并建议无人值守改用 Auto; 子 agent 超时显示 resume 说明; 多项 goal 队列修复.

Use /goal next &lt; objective&gt; to line up upcoming tasks - when the current goal completes, Kimi picks up the next one automatically, no



用 /goal next &lt; objective&gt; 排队后续任务, 当前 goal 完成后, Kimi 自动接下一个, 无需

<!-- page 28 of 32 -->

waiting, no manual trigger. Open /goal next manage to reorder the queue interactively. → [Using Goals](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#goal-mode)



等待, 无需手工触发. 打开 /goal next manage 可交互重排队列. → [Using Goals](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/interaction. html#goal-mode)

## Experimental features panel ( /experiments ) ## 实验功能面板(/experiments)

Type /experiments in the TUI to open a visual toggle panel - flip a switch, confirm, and Kimi writes the change to config. toml and reloads the session. No manual config editing needed.



在 TUI 键入 /experiments 打开可视化开关面板, 拨开关, 确认, Kimi 写入 config. toml 并重载会话. 不必手改配置.

## New built-in update-config Skill ## 新内置 update-config Skill

You can now ask Kimi to edit its own configuration files directly.



现可直接让 Kimi 改它自己的配置文件.

This release also includes: /reload to hot-reload the session after config changes (→ [Slash commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#account-configuration)); kimi doctor to validate config file syntax (→ [kimi doctor](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-doctor)); Windows now fails early when Git Bash is missing.



本版还包括: /reload 在配置变更后热重载会话(→ [Slash commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#account-configuration)); kimi doctor 校验配置语法(→ [kimi doctor](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-doctor)); Windows 缺 Git Bash 时尽早失败.

## KIMI CODE CLI kimi acp subcommand ## KIMI CODE CLI kimi acp 子命令

Connect the CLI to your IDE via the ACP (Agent Client Protocol) - Zed, JetBrains AI Chat, and other editors can directly drive Kimi's sessions and tool calls without switching to a browser or terminal. → [Use in IDEs](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/ides. html)



经 ACP(Agent Client Protocol)把 CLI 接到 IDE, Zed, JetBrains AI Chat 等编辑器可直接驱动 Kimi 会话与工具调用, 不必切到浏览器或终端. → [Use in IDEs](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/ides. html)

## /btw side-channel conversation ## /btw 旁路对话

Open a side conversation without interrupting the current main turn - ask a quick question or add context without affecting the Agent's main task. Entering /btw with no content opens the panel and waits for your input. → [Slash Commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#information-status)



开旁路对话而不打断当前主回合, 快速提问或补上下文, 不影响 Agent 主任务. 无内容进入 /btw 会打开面板等待输入. → [Slash Commands](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#information-status)

Also: fixed Ctrl-G external editor invocation on Windows; unified TUI dialog and selector interaction.



另: 修复 Windows 上 Ctrl-G 外部编辑器调用; 统一 TUI 对话框与选择器交互.

## Autonomous Goal mode (experimental) ## 自主 Goal 模式(实验性)

Start with /goal &lt; objective&gt; and Kimi will work toward that goal across multiple turns until it's done or hits a decision point that needs



用 /goal &lt; objective&gt; 启动, Kimi 跨多回合推进该目标, 直到完成或碰到需要

<!-- page 29 of 32 -->

you. → [Autonomous goal](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#autonomous-goal)



你做决定的点. → [Autonomous goal](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/slash-commands. html#autonomous-goal)

## Background structured questions ## 后台结构化问题

When the Agent needs a decision from you, it parks that question in the background and keeps working on other steps - no more blocking on a single small choice. → [AskUserQuestion](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/tools. html#collaboration-tools)



Agent 需要你决策时, 把问题停在后台, 继续做别的步骤, 不再卡在一个小选择上. → [AskUserQuestion](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/tools. html#collaboration-tools)

## kimi provider subcommand ## kimi provider 子命令

Add or remove providers directly from the terminal without entering the TUI - useful for scripts and CI. → [kimi provider](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-provider)



可直接在终端增删 provider, 不必进 TUI, 适合脚本与 CI. → [kimi provider](https://www. kimi. com/code/docs/en/kimi-code-cli/reference/kimi-command. html#kimi-provider)

Also: background auto-update is now on by default (disable in tui. toml ); context compaction ( [/compact](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/sessions. html#context-compression) ) now attaches the to-do list to the summary so the Agent doesn't forget where it left off.



另: 后台自动更新现默认开(可在 tui. toml 关); 上下文 compaction([/compact](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/sessions. html#context-compression))现把 to-do 列表附到摘要里, Agent 不会忘做到哪.

## KIMI CODE CLI /provider interactive provider manager ## KIMI CODE CLI /provider 交互式 provider 管理器

v0.7.0 Type /provider in the TUI to open a visual interface for viewing, June 2, 2026 adding, and removing providers - no more manually editing config files to switch models. → [Platforms & Models](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/providers. html#provider-%E2%80%94-interactive-provider-management)



v0.7.0 2026 年 6 月 2 日: 在 TUI 键入 /provider 打开可视化界面查看, 添加, 移除 provider, 换模型不必再手改配置文件. → [Platforms & Models](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/providers. html#provider-%E2%80%94-interactive-provider-management)

KIMI\_MODEL\_ADAPTIVE\_THINKING environment variable When connecting to a custom endpoint, force-specify whether adaptive thinking is enabled instead of relying on model-name inference. → [Model fields](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#models)



环境变量 KIMI\_MODEL\_ADAPTIVE\_THINKING: 连自定义端点时, 强制指定是否启用 adaptive thinking, 而不依赖模型名推断. → [Model fields](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/config-files. html#models)

Also: scheduled task trigger times now display in local timezone.



另: 定时任务触发时间现按本地时区显示.

KIMI CODE CLI KIMI\_MODEL\_\* environment variable channel v0.6.0 Set a few environment variables to temporarily switch models without May 29, 2026 touching config files - changes expire on restart, ideal for testing or CI. → [Define a model via environment variables](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/env-vars. html#define-a-model-from-environment-variables-kimi-model)



KIMI CODE CLI KIMI\_MODEL\_\* 环境变量通道 v0.6.0 2026 年 5 月 29 日: 设几个环境变量即可临时换模型, 不动配置文件, 重启失效, 适合测试或 CI. → [Define a model via environment variables](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/env-vars. html#define-a-model-from-environment-variables-kimi-model)

Install plugins directly from a GitHub URL



直接从 GitHub URL 安装插件

<!-- page 30 of 32 -->

|  | Paste a repo link to install community plugins, with support for pinning specific versions. The plugin manager labels each install with a trust level. →Installation &amp; ManagementRemoved default step limitThe per-turn 1000-step cap is gone - long tasks no longer get force-interrupted. →loop_control |
| --- | --- |
| KIMI CODE CLIv0.5.0May 28, 2026 | Scheduled tasksSet timed schedules or one-off reminders in natural language - Kimi executes automatically at the right time without you having to watch. →Scheduled Tasks/autopermission modeA more restrained automation mode than/yolo- tool approvals are handled automatically, but the Agent won't ask you questions. Good for unattended runs where you don't want to fully open the gates. →Interaction &amp; Input |
| KIMI CODE CLIv0.4.0May 27, 2026 | Plugin system launchedInstall plugin packages that bundle Skills and MCP servers. The official marketplace is live, with Kimi Datasource as the first published plugin. →PluginsSession exportExport conversation history as a Markdown file, or package it as a ZIP to submit feedback. →Sessions &amp; ContextPermission system redesignRead-only operations outside the working directory no longer trigger approval prompts - fewer unnecessary interruptions. →Permission config |



|  | 粘贴仓库链接安装社区插件, 支持指定版本. 插件管理器给每次安装标信任级别. →Installation &amp; Management移除默认步数上限每回合 1000 步封顶取消, 长任务不再被强制打断. →loop_control |
| --- | --- |
| KIMI CODE CLIv0.5.0 2026 年 5 月 28 日 | 定时任务用自然语言设定时计划或一次性提醒, Kimi 到点自动执行, 不必盯着. →Scheduled Tasks/auto 权限模式比 /yolo 更克制的自动化, 工具审批自动处理, 但 Agent 不会向你提问. 适合不想把门完全敞开的无人值守跑法. →Interaction &amp; Input |
| KIMI CODE CLIv0.4.0 2026 年 5 月 27 日 | 插件系统上线安装打包 Skills 与 MCP 服务器的插件包. 官方市场上线, 首发插件为 Kimi Datasource. →Plugins会话导出把对话历史导出为 Markdown, 或打成 ZIP 提交反馈. →Sessions &amp; Context权限系统重设计工作目录外的只读操作不再触发审批, 减少无谓打断. →Permission config |

<!-- page 31 of 32 -->

KIMI CODE CLI
v0.1.0
May 2026



KIMI CODE CLI
v0.1.0
2026 年 5 月

KIMI CODE CLI OpenAI-compatible reasoning models work out of the box v0.2.0 – v0.3.0 DeepSeek, Qwen, One API, and other models with thinking tokens May 26, 2026 need no extra configuration. → [openai provider](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/providers. html#openai)



KIMI CODE CLI OpenAI 兼容 reasoning 模型开箱即用 v0.2.0 – v0.3.0: DeepSeek, Qwen, One API 等带 thinking token 的模型在 2026 年 5 月 26 日无需额外配置. → [openai provider](https://www. kimi. com/code/docs/en/kimi-code-cli/configuration/providers. html#openai)

A provider picker now appears on logout to avoid accidentally logging out of the wrong provider.



登出时出现 provider 选择器, 避免误登出错误的 provider.

**/connect** command



**/connect** 命令

Search a public directory of providers and configure one in a single step - no need to write config files by hand. (Superseded by /provider in v0.7.0.)



搜索公开 provider 目录并一步配置, 不必手写配置文件. (在 v0.7.0 被 /provider 取代.)

Kimi Code CLI - initial release. The entire codebase has been rewritten from Python / uv to TypeScript / Node. js. This isn't an incremental update - it's a new foundation, with a redesigned architecture, installation flow, and configuration format.



Kimi Code CLI 初版发布. 整套代码库从 Python / uv 重写为 TypeScript / Node. js. 这是新底座, 不是增量更新: 架构, 安装流与配置格式都重做了.

Key differences from the legacy kimi-cli:



相对旧版 kimi-cli 的关键差异:

|  | Legacy kimi-cli | Kimi Code CLI |
| --- | --- | --- |
| Runtime | Python + uv | Node. js (no Python dependency) |
| Install | uv tool install | One-line curl script or npm install -g |
| Config file | ~/. kimi/config. toml | ~/. kimi-code/config. toml (incompatible format) |
| Terminal UI | Basic text output | Full TUI (chat view + status bar + approval panel) |



|  | 旧版 kimi-cli | Kimi Code CLI |
| --- | --- | --- |
| 运行时 | Python + uv | Node. js(无 Python 依赖) |
| 安装 | uv tool install | 一行 curl 脚本或 npm install -g |
| 配置文件 | ~/. kimi/config. toml | ~/. kimi-code/config. toml(格式不兼容) |
| 终端 UI | 基础文本输出 | 完整 TUI(聊天视图 + 状态栏 + 审批面板) |

<!-- page 32 of 32 -->

|  | Legacy kimi-cli | Kimi Code CLI |
| --- | --- | --- |
| Startup speed | Slower (Python cold start) | Faster (Node. js native binary) |
| Multi-provider | Limited | Built-in Anthropic / OpenAI / Gemini / Vertex, and more |
| Sub-agents | Not supported | Built-in coder / explore / plan sub-agents |
| Plugin system | Not supported | Supported (since v0.4.0) |
| Scheduled tasks | Not supported | Supported (since v0.5.0) |



|  | 旧版 kimi-cli | Kimi Code CLI |
| --- | --- | --- |
| 启动速度 | 较慢(Python 冷启动) | 更快(Node. js 原生二进制) |
| 多 provider | 有限 | 内置 Anthropic / OpenAI / Gemini / Vertex 等 |
| 子 agent | 不支持 | 内置 coder / explore / plan 子 agent |
| 插件系统 | 不支持 | 支持(自 v0.4.0) |
| 定时任务 | 不支持 | 支持(自 v0.5.0) |

Existing kimi-cli data (config, sessions, MCP declarations) can be migrated in one step with kimi migrate → [Version Upgrade](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/migration. html)



已有 kimi-cli 数据(配置, 会话, MCP 声明)可用 kimi migrate 一步迁移 → [Version Upgrade](https://www. kimi. com/code/docs/en/kimi-code-cli/guides/migration. html)

[Previous page Membership Benefits](https://www. kimi. com/code/docs/en/kimi-code/membership. html)



[上一页 Membership Benefits](https://www. kimi. com/code/docs/en/kimi-code/membership. html)

[Next page Community Guidelines](https://www. kimi. com/code/docs/en/kimi-code/community-guidelines. html)



[下一页 Community Guidelines](https://www. kimi. com/code/docs/en/kimi-code/community-guidelines. html)
