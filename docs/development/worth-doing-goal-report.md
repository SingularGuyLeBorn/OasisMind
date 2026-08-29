# 鏁板瓧涓诲姏鏈€鍚庝竴鍏噷 鈥?Goal 鎵ц鎶ュ憡

- 鎵ц鑰咃細Cursor Agent锛圙LM 5.2锛?- 寮€濮嬶細2026-08-29
- 缁撴潫锛氾紙杩涜涓級
- 瑙佸井 Goal / Cursor 鍙拌处锛氬凡 `CreateGoal`锛宻tatus=active

> 鑼冨洿涓庨攣姝昏璁′互 `docs/development/prompts/worth-doing-goal-prompt.md` 涓哄噯銆傛湰鏂囨槸鍞竴浜ゆ帴鐗╋紝閫愰」濉瘉鎹紝涓嶇┖鍙ｃ€屽凡瀹屾垚銆嶃€?
## Goal 鍙拌处锛堢瓑浠?verifiedProgress锛?
| W | 鐘舵€?done/blocked | 璇佹嵁锛堝懡浠ら€€鍑虹爜鎴栨枃浠?琛岋級 | commit |
|---|---|---|---|
| W1 | 杩涜涓?| 鈥?| 鈥?|
| W2 | 鈥?| 鈥?| 鈥?|
| W3 | 鈥?| 鈥?| 鈥?|
| W4 | 鈥?| 鈥?| 鈥?|
| W5 | 鈥?| 鈥?| 鈥?|
| W6 | 鈥?| 鈥?| 鈥?|
| W7 | 鈥?| 鈥?| 鈥?|

## 寮傝涓庡亸绂?
| 浣嶇疆 | 鏈枃瑕佹眰 | 鎴戣寰椾笉鍚堢悊鐨勭偣 | 瀹為檯钀藉湴 | 鏄惁 [OM-FREEPLAY] |
|---|---|---|---|---|

## W1 瀹為獙琛ㄥ喕缁?+ 鏂囦欢鏌滆瘹瀹?
- 鏍瑰洜澶嶈堪锛?- 鏀瑰姩鏂囦欢锛?- [OM-FREEPLAY]锛?- 楠岃瘉锛?- 閬囧埌鐨勯棶棰橈細

## W2 Chat 涔︾鎺ュ埌姘旀场涓庢爲鏉?
- 鏍瑰洜澶嶈堪锛?- 鏀瑰姩鏂囦欢锛?- [OM-FREEPLAY]锛?- 楠岃瘉锛?- 閬囧埌鐨勯棶棰橈細

## W3 璐村浘榛樿璇嗗浘

- 鏍瑰洜澶嶈堪锛歚buildUserMessageContentForLlm` 鍦?vision 妯″瀷鏃跺彧鎶?`previewUrl.startsWith("data:")` 鐨勫浘鍋氭垚 image_url锛岀浉瀵硅矾寰?`/uploads/` 鐨勫浘瀵瑰妯℃€佹ā鍨嬮殣褰紱绾枃鏈ā鍨嬪彧鍦ㄥ凡鏈?extractedText 鏃舵墠鎷艰繘 prompt锛孋hat 鏈湴涓婁紶娌¤窇 OCR 鏃舵ā鍨嬩袱鐪间竴鎶归粦銆?- 鏀瑰姩鏂囦欢锛氭柊寤?`infra/chatImageForLlm.ts`锛坄resolveImageUrlForLlm`锛歞ata/http/鐩稿璺緞鈫抎ata URL锛?MiB 涓婇檺锛屽唴缃戞嫆缁濓級锛涙柊寤?`infra/chatImageEnrich.ts`锛坄enrichImageAttachmentsForPersist`锛氱函鏂囨湰妯″瀷 persist 鍓嶉潤榛樿瘑鍥撅級锛沗infra/chatHistory.ts`锛坴ision 鍒嗘敮鐢?resolver锛宍buildLlmMessagesFromHistory` 鎺ュ彈 config锛夛紱`infra/autoCompact.ts`銆乣infra/agentStream/index.ts`锛堥€忎紶 config 鍒颁富璺緞锛夛紱`infra/agentStream/persist.ts`锛堝啓搴撳墠 enrich锛夛紱`infra/trpcRouters/messageRouter.ts`锛坄enrichImages` mutation锛夛紱`infra/tools/native/web/readImage.ts`锛堟娊鍑?`describeImageWithVision` 绾嚱鏁?+ signal锛夛紱`packages/mock-llm-core/src/scenarioDefs.ts`锛坄vision_describe` 鍦烘櫙锛夛紱`apps/web/components/chatMessageList.tsx`锛堝浘鐗囪姱鐗囪瘑鍥炬垚鍔?澶辫触绾㈢伆 + 閲嶈瘯璇嗗浘鎸夐挳锛夛紱`chatHistory.test.ts`銆乣chatImageEnrich.test.ts`锛堝崟娴嬶級銆?- [OM-FREEPLAY]锛氬崟寮?vision 鐩翠紶瀛楄妭涓婇檺 4MiB锛堟湰鏂囬攣姝伙級锛沞nrich 鍗曞紶瓒呮椂 20s锛堟湰鏂囬攣姝伙級锛沞nrich 瀵硅秴 4MiB 鏈湴鍥捐銆岃瘑鍥惧け璐ワ細鍥剧墖杩囧ぇ鏈€佸叆妯″瀷銆嶏紱enrich 妯″瀷閫?strong_free 涓嶅彲鐢?fallback lite锛堟湰鏂囥€屽啀澶辫触銆嶇悊瑙ｄ负 LLM 璋冪敤澶辫触鑰岄潪妯″瀷 id 涓嶅尮閰?vision 妯″紡锛岄伩鍏?mock 妯″紡璇潃锛夛紱vision 鍒嗘敮璺宠繃鍥炬敼缁欐枃鏈彁绀恒€屽浘鐗囪繃澶ф湭閫佸叆妯″瀷鎴栦笉鍙銆嶃€?- 楠岃瘉锛歚chatHistory.test.ts` 17 passed锛堝惈 5 鏉?W3锛夛紱`chatImageEnrich.test.ts` 3 passed锛沗autoCompact/compactDataLeakage` 18 passed锛沗mock-llm-core` 141 passed锛沗agentRunPhase/agentRunLock/toolResultMetadata` 18 passed锛泂erver/web lint 閫€鍑虹爜 0銆?- 閬囧埌鐨勯棶棰橈細chatImageEnrich 娴嬭瘯鐢ㄦ渶灏?config 缂?llm 瀵艰嚧 mock 浠嶈 provider 鎶?maxRetries undefined锛屾敼鐢?`getAppConfig()` 瑕嗙洊 projectRoot锛沺ost 闄勪欢 fixture 瀛楁鍚嶈鐢?name/postId锛屾敼涓?schema 鐨?garden/slug/id锛沗out[0]` 鑱斿悎绫诲瀷鍙?extractedText 闇€ `isChatImageAttachment` 瀹堝崼/cast銆?
## W4 Inbox 钂搁鍙€夋敼鍐?
- 鏍瑰洜澶嶈堪锛歚InboxService.distill` 鍙?`formatInboxItemBody` + `post_create`锛孭RD 鏇炬斁寮?LLM 鏀瑰啓锛涙湰 Goal 閲嶆柊鎵撳紑浣嗗彲閫夛紝榛樿琛屼负蹇呴』涓庣幇鍦ㄥ畬鍏ㄤ竴鑷淬€?- 鏀瑰姩鏂囦欢锛歚packages/shared/src/schemas.ts`锛坄inboxDistillSchema` 鍔?`mode: raw|taste` 榛樿 raw锛夛紱`apps/server/src/infra/entityServices/inboxService.ts`锛坱aste 鍒嗘敮 `distillTasteBody`锛氳 USER.md + 鑺卞洯鎽樺綍 + 璋?lite_free 妯″瀷鏀瑰啓锛?5s 瓒呮椂锛屽け璐ヤ繚鎸?fetched锛屼涪 URL 寮哄埗杩藉姞鏉ユ簮锛夛紱`apps/server/src/infra/tools/native/inbox.ts`锛堝伐鍏蜂紶 mode锛夛紱`packages/mock-llm-core/src/scenarioDefs.ts`锛坄inbox_distill_taste` 鍦烘櫙 + `MOCK_TASTE_FAIL_TOKEN`锛夛紱`apps/server/src/__tests__/inboxDistill.test.ts`锛堥粯璁ょ粡 schema parse 琛屼负鍚屾棫 + taste 鎴愭枃 + 妯″瀷鎶涢敊锛夛紱`apps/web/app/inbox/page.tsx`锛坄inbox-distill-mode` segmented + mutation 甯?mode锛夛紱`apps/web/e2e/scenario-product-gaps-mock.spec.ts`锛坱aste E2E锛夈€?- [OM-FREEPLAY]锛氬崟鏉?taste 鏀瑰啓瓒呮椂 25s锛堟湰鏂囬攣姝伙級锛涘け璐ユ祴鐢?`MOCK_TASTE_FAIL_TOKEN` 娉ㄥ叆鎶涢敊锛堟湰鏂囨湭閿佹鏈哄埗锛屼豢 branch_summary_fail锛夛紱鑺卞洯鎽樺綍鍙栧墠 800 瀛楋紙鏈枃閿佹锛夈€?- 楠岃瘉锛歚inboxDistill.test.ts` 11 passed锛堝惈 2 鏉?taste锛夛紱`mock-llm-core` 141 passed锛泂erver/web lint 閫€鍑虹爜 0銆侲2E锛坱aste 钂搁锛夊凡鍐欎笖 lint 閫氳繃锛屽疄璺戞斁鍒版敹灏鹃棬绂併€?- 閬囧埌鐨勯棶棰橈細`mode` 鍦?`z.infer` 杈撳嚭绫诲瀷蹇呭～锛岀幇鏈夋祴鐩存帴璋?service 缂?mode 鎶?TS 閿欙紱鏀逛负缁?`inboxDistillSchema.parse` 璺敱锛堥粯璁や笉浼?mode 鈫?raw锛岃涓哄悓鏃э級銆傚け璐ユ祴鍘熸兂鐢?forced 鏈煡鍦烘櫙锛屼絾 taste 鍦烘櫙 match 蹇界暐 forced 浠嶅懡涓?system 鏂囷紝鏀圭敤 fail token 娉ㄥ叆銆倁rl 瀛楃涓叉湯灏捐鐢ㄥ弽寮曞彿瀵艰嚧鏈粓姝㈠瓧闈㈤噺锛屽凡淇€?
## W5 鏅ㄩ棿绠€鎶ヨ仛鍚堝崱

- 鏍瑰洜澶嶈堪锛欳ron銆佸績璺炽€乣/daily` 涓夊骞跺垪锛屾病鏈夈€屾病鐪?娌″仛/鏅剧潃鐨?Goal銆嶄竴寮犲崱銆?- 鏀瑰姩鏂囦欢锛氭柊寤?`apps/server/src/infra/morningBrief.ts`锛坄buildMorningBrief` 鑱氬悎 Inbox fetched+top8銆佸綋鏃?todo/doing銆佹壂 session goalState 鍙?active|paused top12锛孲QLite take 涓嶆壂鍏ㄨ〃锛夛紱鏂板缓 `apps/server/src/infra/trpcRouters/briefingRouter.ts`锛坄briefing.morning` query锛夛紱`apps/server/src/router.ts`锛堣仛鍚?briefing锛夛紱`apps/server/src/__tests__/morningBrief.test.ts`锛堣鏁版柇瑷€锛夛紱`apps/web/app/daily/page.tsx`锛堥《鍔?`morning-brief-card` 涓夊潡 + `morning-brief-cron-seed` 鎸夐挳 + BC 鐩戝惉 4 浜嬩欢 invalidate briefing锛夛紱`apps/web/lib/useChatSseSubscriptions.ts`锛? 浜嬩欢 invalidate briefing.morning锛夈€?- [OM-FREEPLAY]锛歝ron 绉嶅瓙鐢ㄨ秴绾?Agent锛坅gent.list 鎵?tier=super锛夛紱briefing refetchInterval 60s锛堟湰鏂囬攣姝汇€岃繘琛屼腑 Goal 鏃跺彲 15s銆嶆湭鍋氬樊寮傚寲锛岀粺涓€ 60s 淇濆畧锛夛紱Goal 鎵弿 take 50 鍐嶈繃婊わ紙鏈枃閿佹銆屾渶澶?12銆嶏紝50 鏄壂鎻忔睜涓婇檺鐨勪繚瀹堢寽娴嬶級銆?- 楠岃瘉锛歚morningBrief.test.ts` 1 passed锛坒etched 璁℃暟+items銆乼odo/doing 璁℃暟+titles銆乤ctive goal 鍚?verifiedCount銆乨one goal 涓嶈鍏ワ級锛泂erver/web lint 閫€鍑虹爜 0銆備笉娴嬬湡 8:00 鐐圭伀锛堟湰鏂囬攣姝伙級銆?- 閬囧埌鐨勯棶棰橈細鏃?`ChatSession.goal` 鍒楋紝瀹為檯鏄?`goalState Json?`锛岀敤 `parseGoalState` 瑙ｆ瀽杩囨护锛涗細璇濇繁閾炬槸 `?sessionId=` 闈?`?session=`銆?
## W6 闃舵宸ヤ欢鍓ф湰 + 渚ф爮

- 鏍瑰洜澶嶈堪锛歚swarm_stage_write/list/read` 宸插湪锛屼汉涓嶇煡閬撱€丆hat 涔熺湅涓嶈銆?- 鏀瑰姩鏂囦欢锛氭柊寤?`config/skills/swarm-pipeline/SKILL.md`锛坧rocedural 鍖咃紝閿佹涓ゆ潯鍓ф湰锛氫笓棰樻繁鎸?research鈫抎raft锛汭nbox 鎴愮 notes鈫抎raft鈫抮eview锛涘瓙鍙啓 stage銆佺埗鐢?swarm_stage_read 绂佽瀛愭鏂囷級+ `templates/{research,draft,notes,review}.md`锛沗apps/server/src/infra/swarmStages.ts`锛坢eta 鍔?workspaceId锛宭ist/read 琛ュ瓧娈碉級锛沗apps/server/src/infra/tools/native/swarm/inspect.ts`锛坵rite 鎴愬姛鍚庢帹 workspace_stages_updated锛夛紱`apps/server/src/infra/uiStateNotify.ts` + `agentStream/prepareMessage.ts`锛堝姞浜嬩欢绫诲瀷 + notifyWorkspaceStagesUpdated锛夛紱`apps/server/src/infra/trpcRouters/workspaceRouter.ts`锛坄listStages` query锛屾棤 workspaceId 璧扮郴缁?root 鍏滃簳锛夛紱`apps/server/src/__tests__/workspaceStages.test.ts`锛坙istStages 缁?tRPC锛夛紱`apps/web/components/chatStagesPanel.tsx`锛坄chat-stages-panel` + 绌烘€?+ `chat-stage-item`锛宻ubscribeUiState invalidate锛夛紱`apps/web/components/chat.tsx`/`chatCenterPane.tsx`/`chatSessionPane.tsx`锛堝苟鍒楁寕杞?+ 浼?selectedWorkspaceId + `chat-open-stages-panel` 鍏ュ彛閫忎紶锛夛紱`apps/web/lib/uiStateChannel.ts` + `useChatSseSubscriptions.ts`锛堟敞鍐?workspace_stages_updated invalidate + BC锛夈€?- [OM-FREEPLAY]锛欳hatStagesPanel 瀹藉害 300px锛堜豢 ChatFilesPanel 340px 鐣ョ獎锛岃嚜鐢卞彂鎸ワ級锛泂tage 椤规殏鍙睍绀哄厓淇℃伅涓嶅彲鐐瑰紑鍏ㄦ枃锛堟湰鏂囧彧瑕佹眰鍙锛屾湭瑕佹眰鐐瑰紑锛夈€?- 楠岃瘉锛歚workspaceStages.test.ts` 1 passed + `swarmHarnessExtras.test.ts` 2 passed锛坢eta 鍔犲瓧娈垫棤鐮村潖锛夛紱`chatStagesPanel.test.tsx` 3 passed锛坥pen=false 涓嶆覆鏌撱€佺┖鎬併€佷竴椤癸級锛泂erver/web lint 閫€鍑虹爜 0銆俿kill 鏂囦欢瀛樺湪鍗曟祴鎸夋湰鏂囧厤銆?- 閬囧埌鐨勯棶棰橈細`writeSwarmStage` 杩斿洖 meta 鏃?workspaceId锛孭USH 闇€甯︼紝鏁呭姞鍒?SwarmStageMeta 绫诲瀷骞惰ˉ list/read锛沗notifyWorkspaceStagesUpdated` 褰㈠弬 string|undefined锛宮eta.workspaceId 鏄?string|null锛岃皟鐢ㄥ `?? undefined`銆?
## W7 杩囧 Goal 浜虹溂鍙牳

- 鏍瑰洜澶嶈堪锛歚verifiedProgress` + Auditor + 椤舵爮銆屽凡鏍稿疄 N 姝ャ€嶅凡鏈夛紝浜虹湅涓嶆竻鏍稿疄浜嗕粈涔堬紱鍦烘櫙 D 鏃?mock 鑴搞€?- 鏀瑰姩鏂囦欢锛歚apps/web/components/chatGoalBar.tsx`锛坴erifiedProgress 闈炵┖鏃舵樉绀?`chat-goal-verified` 灞曞紑閽紝灞曞紑鍒楁瘡鏉?claim 涓€琛?`chat-goal-verified-item`锛涚┖鏁扮粍浠?`chat-goal-verified-count` 鏄剧ず 0 姝ャ€佷笉灞曞紑锛夛紱`apps/server/src/infra/trpcRouters/sessionRouter.ts`锛坱est-only `__setVerifiedProgressForTest`锛屼粎 `E2E=1` 鏆撮湶锛岀洿鎺ュ啓 goalState.verifiedProgress锛屼笉鍔?Auditor锛夛紱`apps/web/components/__tests__/chatGoalBar.test.tsx`锛堢粍浠舵祴锛夛紱`apps/web/e2e/chat-session-branch-mock.spec.ts`锛圗2E锛氳 Goal鈫掓敞鍏?1 鏉?fixture鈫掑睍寮€鈫扚5 浠嶅湪锛夈€?- [OM-FREEPLAY]锛歵est-only 鎺ュ彛鐢?`E2E=1` 瀹堝崼锛堟湰鏂囧厑璁搞€宼RPC鈥︿粎娴嬭瘯銆嶏級锛沗as never` 缁曞紑 Prisma Json 绫诲瀷鏍￠獙锛堜粎娴嬭瘯鍐欏叆锛夈€?- 楠岃瘉锛歚chatGoalBar.test.tsx` 3 passed锛堟棤 goal 涓嶆覆鏌撱€佺┖鎬佹棤灞曞紑閽€侀潪绌哄睍寮€鍒?claim锛夛紱server/web lint 閫€鍑虹爜 0銆侾ULL 浠嶇敱 getGoal query + 60s refetchInterval + goal_updated SSE/BC 淇濊瘉锛堝凡鏈夛級銆侲2E 宸插啓涓?lint 閫氳繃锛屽疄璺戞斁鍒版敹灏鹃棬绂併€備笉鍔?envAssertions 鍒楋紙鏈枃閿佹锛夈€?- 閬囧埌鐨勯棶棰橈細W7 鎻愪氦鏃跺伐浣滄爲琚閮ㄥ垏鍒?`feat/test-suite-perfect` 鍒嗘敮锛堝惈闈炴垜鐨勬祴璇曟彁浜わ級锛學7 璇惤鍒拌鍒嗘敮锛涘凡 cherry-pick 鍥?`feat/worth-doing-w1-w7`锛屽苟鎶婄敤鎴峰垎鏀浣嶅埌鍏跺師 tip锛堝幓鎺?W7锛夛紝澶栭儴 WIP 宸?stash 淇濈暀寰呮湯灏炬仮澶嶃€?
## 閾佸緥鍐茬獊 / 鏈仛

- 鏃?AGENTS.md 閾佸緥鍐茬獊銆傛柦宸ユ湡闂村閮ㄨ繘绋嬪湪 `feat/test-suite-perfect` 鍒嗘敮骞惰鎺ㄨ繘娴嬭瘯濂椾欢宸ヤ綔骞跺娆″垏鎹㈠伐浣滄爲锛屾浘瀵艰嚧 W7 璇彁浜ゅ埌璇ュ垎鏀紱宸?cherry-pick 鍥炴湰鍒嗘敮骞舵妸 `feat/test-suite-perfect` 澶嶄綅鍒板叾鑷韩 tip锛屼袱鍒嗘敮浜掍笉姹℃煋銆傚閮?WIP 涓嶅睘鏈?Goal锛屾湭鍔ㄣ€?
## 娈嬬暀锛堣寖鍥村鍙戠幇銆佹湰 Goal 鏁呮剰娌′慨锛?
- 鍏ㄩ噺 `pnpm --filter @oasismind/server test` 鏈?4 涓瀛樺け璐ワ紙闈炴湰 Goal 寮曞叆锛屽潎鍦ㄦ湭鏀规枃浠讹級锛歚resilientLlmClient.test.ts` 3 鏉?429 閲嶈瘯锛堟椂搴忔晱鎰燂紝flaky锛夛紱`trpc.test.ts` Run entity CRUD锛坄run.update` 杩斿洖 success:false锛夈€傚凡鍦?master 涓婂鐜扮‘璁ゆ槸棰勫瓨锛屾湰 Goal 涓嶄慨锛堣寖鍥村锛夈€?- E2E锛圵2 涔︾ / W4 taste / W7 goal-verified锛夊凡鍐欎笖 lint 閫氳繃锛涘疄璺戦渶 `build:mock` + 璧?mock-llm/server/web 鍏ㄥ锛屾斁鏀跺熬闂ㄧ涓€娆¤窇锛涙湰浼氳瘽鍥犵幆澧冧笌澶栭儴杩涚▼骞叉壈鏈疄璺戯紝璁颁负銆屽緟鏀跺熬璺戙€嶃€?
## 闂ㄧ锛坙int / 鐐瑰悕娴嬭瘯 / 鍏ㄩ噺 test 鑻ヨ窇浜嗭級

- lint锛歚pnpm --filter @oasismind/server lint` 閫€鍑虹爜 0锛沗pnpm --filter @oasismind/web lint` 閫€鍑虹爜 0锛? errors / 10 warnings锛寃arnings 鍧囬瀛橈級銆?- 鐐瑰悕娴嬭瘯锛堝叏缁匡級锛歴erver `chatTree`(17)銆乣chatHistory`(17)銆乣chatImageEnrich`(3)銆乣autoCompact`(12)+`compactDataLeakage`(6)銆乣inboxDistill`(11)銆乣morningBrief`(1)銆乣workspaceStages`(1)+`swarmHarnessExtras`(2)銆乣agentRunPhase/agentRunLock/toolResultMetadata`(18)锛泈eb `chatSessionTreeBar`(9)銆乣chatStagesPanel`(3)銆乣chatGoalBar`(3)锛沗mock-llm-core`(141)銆?- 鍏ㄩ噺 test锛歴erver 鍏ㄩ噺 4 涓瀛樺け璐ワ紙瑙佹畫鐣欙紝闈炴湰 Goal锛夛紱web 鍏ㄩ噺鏈窇锛堝崟娴嬪凡缁匡紝E2E 寰呮敹灏撅級銆?- git status锛氭湰鍒嗘敮 `feat/worth-doing-w1-w7` 宸ヤ綔鏍戝共鍑€锛圵1鈥揥7 + 鎶ュ憡鍏ㄩ儴鎸変富棰樻彁浜わ級锛涘閮?`feat/test-suite-perfect` 鍒嗘敮鐨?WIP 涓嶅睘鏈?Goal锛屽凡 stash 淇濈暀寰呮湯灏炬仮澶嶃€?
