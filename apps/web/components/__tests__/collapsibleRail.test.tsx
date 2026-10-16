import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { CollapsibleRail } from "../layout/CollapsibleRail";

it("收起栏预览真实内容，导航后隐藏且固定偏好不变", async () => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  function Demo() {
    const [pinned, setPinned] = useState(false);
    return <CollapsibleRail side="left" label="导航" pinned={pinned} onPinnedChange={setPinned}>
      {({ onNavigate }) => <button data-destination onClick={onNavigate}>跳转</button>}
    </CollapsibleRail>;
  }
  await act(async () => root.render(<Demo />));
  const rail = host.querySelector("[data-collapsible-rail]")!;
  const trigger = host.querySelector("button")!;
  await act(async () => trigger.dispatchEvent(new MouseEvent("mouseover", { bubbles: true })));
  expect(rail.getAttribute("data-preview")).toBe("true");
  await act(async () => host.querySelector<HTMLButtonElement>("[data-destination]")!.click());
  expect(rail.getAttribute("data-expanded")).toBe("false");
  await act(async () => trigger.click());
  await act(async () => host.querySelector<HTMLButtonElement>("[data-destination]")!.click());
  expect(rail.getAttribute("data-expanded")).toBe("true");
  expect(rail.getAttribute("data-preview")).toBe("false");
  await act(async () => root.unmount());
  host.remove();
});
