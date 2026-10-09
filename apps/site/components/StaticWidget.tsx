import type { ReactNode } from "react";

/** 仅交互控件需要水合。正文和目录保持普通 HTML，不进入浏览器组件树。 */
export function StaticWidget({ kind, props, children }: {
  kind: "posts" | "search" | "reader"; props?: unknown; children?: ReactNode;
}) {
  const json = JSON.stringify(props ?? {}).replace(/</g, "\\u003c");
  return <div data-public-widget={kind}>
    <div data-widget-root>{children}</div>
    <script type="application/json" data-widget-props dangerouslySetInnerHTML={{ __html: json }} />
  </div>;
}
