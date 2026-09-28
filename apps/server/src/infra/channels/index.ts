/**
 * IM 通道启动入口：注册 QQ / 飞书 Adapter 并挂到 MessageGateway。
 */

import type { PrismaClient } from "@prisma/client";
import type { AppConfig } from "../config.js";
import type { ServiceContainer } from "../serviceContainer.js";
import {
  initMessageGateway,
  registerChannelAdapter,
  startAllChannelAdapters,
  stopAllChannelAdapters,
} from "../messageGateway.js";
import { createQqOfficialBotAdapter, loadQqBotConfigFromEnv } from "./qqOfficialBot.js";
import { createFeishuBotAdapter, loadFeishuBotConfigFromEnv } from "./feishuBot.js";
import { createWeixinClawBotAdapter, loadWeixinClawBotConfigFromEnv } from "./weixinClawBot.js";

export async function bootstrapMessageChannels(opts: {
  prisma: PrismaClient;
  services: ServiceContainer;
  config: AppConfig;
}): Promise<void> {
  initMessageGateway(opts);
  const { initImChannelDrain } = await import("../imChannelDrain.js");
  initImChannelDrain(opts);
  // NapCat/OneBot 已退役：只注册官方 QQ Bot + 飞书
  registerChannelAdapter(createQqOfficialBotAdapter(loadQqBotConfigFromEnv()));
  registerChannelAdapter(createFeishuBotAdapter(loadFeishuBotConfigFromEnv()));
  registerChannelAdapter(createWeixinClawBotAdapter(loadWeixinClawBotConfigFromEnv(opts.config.dataDir)));
  await startAllChannelAdapters();
}

export async function stopMessageChannels(): Promise<void> {
  const { stopImChannelDrain } = await import("../imChannelDrain.js");
  stopImChannelDrain();
  await stopAllChannelAdapters();
}

export { stopAllChannelAdapters };
