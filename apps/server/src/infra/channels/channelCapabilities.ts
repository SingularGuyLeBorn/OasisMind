/**
 * QQ / 微信共享的多模态能力契约。
 *
 * 适配器、管理页和体检命令必须从这里读取同一份五类附件与大小上限，避免 UI 宣称
 * 支持、发送层却拒绝的漂移。平台特有差异通过明确参数表达；不支持的类型由统一出站
 * 入口显式报错，能力表本身不访问平台、不读取凭据，也不负责猜测降级格式。
 */
import type { ChannelCapability } from "../messageGateway.js";
import { CHANNEL_ATTACHMENT_MAX_BYTES } from "./channelAttachment.js";

export function createMultimodalChannelCapabilities(opts: {
  supportsQuote: boolean;
}): ChannelCapability {
  return {
    inbound: ["text", "image", "video", "audio", "file"],
    outbound: ["text", "image", "video", "audio", "file"],
    maxBytes: CHANNEL_ATTACHMENT_MAX_BYTES,
    supportsCaption: true,
    supportsQuote: opts.supportsQuote,
  };
}
