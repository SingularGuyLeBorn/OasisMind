/**
 * WYSIWYG：键入 @agent 唤起编辑器 Agent 补全（不切源码）。
 * handler 用世代号登记：旧实例卸载不得把新实例的回调清掉。
 */

import { Plugin, PluginKey } from "@milkdown/prose/state";
import type { EditorView } from "@milkdown/prose/view";
import { $prose } from "@milkdown/utils";
import { detectEditorAgentAtTrigger } from "@/lib/editorCompleteContext";
import { saveMilkdownSelectionRange } from "@/components/editor/milkdownSelectionApi";

export type MilkdownAtAgentHit = {
  query: string;
};

type Handler = (hit: MilkdownAtAgentHit) => void;

let handler: Handler | null = null;
let handlerGen = 0;
let lastFiredAt = 0;
let lastFiredKey = "";

export function registerMilkdownAtAgentHandler(next: Handler): number {
  handlerGen += 1;
  handler = next;
  return handlerGen;
}

export function unregisterMilkdownAtAgentHandler(gen: number) {
  if (gen === handlerGen) handler = null;
}

export function textBeforeCursor(view: EditorView): { text: string; from: number } {
  const { $from } = view.state.selection;
  const parentStart = $from.start();
  const text = view.state.doc.textBetween(parentStart, $from.end(), "\n", "\n");
  return { text, from: parentStart };
}

export function tryFireMilkdownAtAgent(view: EditorView): boolean {
  if (!handler) return false;
  const { from, to, $from } = view.state.selection;
  if (from !== to || !$from) return false;

  const { text, from: blockFrom } = textBeforeCursor(view);
  const cursorInBlock = Math.max(0, from - blockFrom);
  const hit = detectEditorAgentAtTrigger(text, cursorInBlock);
  if (!hit) return false;

  const key = `${blockFrom}:${hit.tokenStart}:${hit.token}`;
  const now = Date.now();
  if (key === lastFiredKey && now - lastFiredAt < 800) return false;
  lastFiredAt = now;
  lastFiredKey = key;

  const delFrom = blockFrom + hit.tokenStart;
  const delTo = Math.min(blockFrom + hit.tokenStart + hit.token.length, view.state.doc.content.size);
  if (delTo > delFrom) {
    view.dispatch(view.state.tr.delete(delFrom, delTo));
  }
  saveMilkdownSelectionRange();
  handler({ query: hit.query });
  return true;
}

function maybeFire(view: EditorView, event?: Event) {
  if (event && "isComposing" in event && (event as InputEvent).isComposing) return;
  tryFireMilkdownAtAgent(view);
}

export const milkdownAtAgent = $prose(
  () =>
    new Plugin({
      key: new PluginKey("om-milkdown-at-agent"),
      props: {
        handleDOMEvents: {
          compositionend(view) {
            queueMicrotask(() => {
              tryFireMilkdownAtAgent(view);
            });
            return false;
          },
          input(view, event) {
            maybeFire(view, event);
            return false;
          },
          keyup(view, event) {
            const key = event.key;
            if (key.length === 1 || key === "Process" || key === "Unidentified") {
              maybeFire(view, event);
            }
            return false;
          },
        },
      },
      view() {
        return {
          update(view, prevState) {
            if (
              prevState &&
              view.state.doc.eq(prevState.doc) &&
              view.state.selection.eq(prevState.selection)
            ) {
              return;
            }
            tryFireMilkdownAtAgent(view);
          },
        };
      },
    }),
);
