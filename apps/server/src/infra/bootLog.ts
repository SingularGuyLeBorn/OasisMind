/**
 * 启动/运行期控制台噪音控制。
 *
 * 默认只打必要信息（监听地址、安全告警、真实失败、IM/邮件一行摘要）。
 * 细节排障：OM_VERBOSE_BOOT=1
 */

export function isVerboseBoot(): boolean {
  const v = (process.env.OM_VERBOSE_BOOT || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** 仅在 OM_VERBOSE_BOOT=1 时输出（白名单细则、预热成功、同步过程等） */
export function bootDetail(...args: unknown[]): void {
  if (isVerboseBoot()) console.log(...args);
}

/** 与 bootDetail 对称的 warn（例如预期内的远程 404 回退本地） */
export function bootDetailWarn(...args: unknown[]): void {
  if (isVerboseBoot()) console.warn(...args);
}
