/**
 * 管理页 PUSH：BroadcastChannel 与 Chat SSE 转发同源。
 * 无 Chat 开着时，测试里直接往频道推，证明开着的 /cron /approvals 会自己拉。
 */
import type { Page } from "@playwright/test";
import { UI_STATE_CHANNEL, type UiStateChannelMessage } from "../../lib/uiStateChannel";
import {
  APPROVAL_REFETCH_PENDING_MS,
  CRON_REFETCH_IDLE_MS,
} from "../../lib/adminPullIntervals";

export { APPROVAL_REFETCH_PENDING_MS, CRON_REFETCH_IDLE_MS };

export async function pushAdminUiState(
  page: Page,
  msg: Pick<UiStateChannelMessage, "type"> & Record<string, unknown>,
): Promise<void> {
  await page.evaluate(
    ({ channel, payload }) => {
      const bc = new BroadcastChannel(channel);
      bc.postMessage(payload);
      bc.close();
    },
    { channel: UI_STATE_CHANNEL, payload: msg },
  );
}
