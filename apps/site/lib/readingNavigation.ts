/** 静态目录只生成一份 DOM；手机按需移入原生弹窗，桌面仍是双侧栏。 */
export function enhanceReadingNavigation(content: HTMLElement): () => void {
  const layout = content.closest<HTMLElement>(".article-layout");
  const dialog = layout?.querySelector<HTMLDialogElement>(".reading-drawer");
  if (!layout || !dialog || layout.dataset.navigationReady || typeof dialog.showModal !== "function") return () => {};
  const mobile = matchMedia("(max-width: 900px)");
  const tabs = Array.from(dialog.querySelectorAll<HTMLButtonElement>("[data-navigation-tab]"));
  const openers = Array.from(layout.querySelectorAll<HTMLButtonElement>("[data-navigation-open]"));
  const panes = ["documents", "outline"].flatMap(kind => {
    const sidebar = layout.querySelector<HTMLElement>(kind === "documents" ? ".knowledge-tree" : ".article-toc");
    const host = dialog.querySelector<HTMLElement>(`[data-navigation-host="${kind}"]`);
    if (!sidebar || !host) return [];
    return [{ kind, sidebar, host, origin: document.createComment(`目录位置：${kind}`),
      panel: sidebar.querySelector<HTMLDetailsElement>(".navigation-panel"), wasOpen: true }];
  });
  let opener: HTMLElement | undefined;
  let restoreScroll: (() => void) | undefined;
  const select = (kind: string, focus = false) => {
    panes.forEach(pane => { pane.host.hidden = pane.kind !== kind; });
    tabs.forEach(tab => {
      const selected = tab.dataset.navigationTab === kind;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus({ preventScroll: true });
    });
    // 只滚动目录内部，不能把正在阅读的正文拉回页首。
    const pane = panes.find(item => item.kind === kind);
    const active = pane?.sidebar.querySelector<HTMLElement>('[aria-current="page"], [aria-current="location"]');
    if (pane && active) {
      const bounds = active.getBoundingClientRect();
      const viewport = dialog.querySelector<HTMLElement>(".drawer-content")!;
      const area = viewport.getBoundingClientRect();
      viewport.scrollTop += bounds.top - area.top - (area.height - bounds.height) / 2;
    }
  };
  const restore = () => {
    if (!restoreScroll) return;
    panes.forEach(pane => {
      pane.origin.replaceWith(pane.sidebar);
      if (pane.panel) pane.panel.open = pane.wasOpen;
    });
    restoreScroll();
    restoreScroll = undefined;
    openers.forEach(link => link.setAttribute("aria-expanded", "false"));
    opener?.focus({ preventScroll: true });
  };
  const close = () => { if (dialog.open) dialog.close(); restore(); };
  const onOpen = (event: Event) => {
    if (!mobile.matches) return;
    const link = event.currentTarget as HTMLButtonElement;
    const kind = link.dataset.navigationOpen!;
    if (!panes.some(pane => pane.kind === kind)) return;
    event.preventDefault();
    dialog.dataset.navigationSide = kind === "documents" ? "left" : "right";
    if (dialog.open) { select(kind, true); return; }
    restore();
    opener = link;
    const y = window.scrollY;
    const x = window.scrollX;
    const bodyStyle = document.body.getAttribute("style");
    const overflow = document.documentElement.style.overflow;
    panes.forEach(pane => {
      if (pane.panel) { pane.wasOpen = pane.panel.open; pane.panel.open = true; }
      pane.sidebar.replaceWith(pane.origin);
      pane.host.append(pane.sidebar);
    });
    // 固定正文保住移动浏览器的阅读位置；解锁与归位只在关闭转移点执行。
    document.body.style.position = "fixed";
    document.body.style.top = `${-y}px`;
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";
    restoreScroll = () => {
      if (bodyStyle === null) document.body.removeAttribute("style");
      else document.body.setAttribute("style", bodyStyle);
      document.documentElement.style.overflow = overflow;
      window.scrollTo({ left: x, top: y, behavior: "instant" });
    };
    link.setAttribute("aria-expanded", "true");
    dialog.showModal();
    select(kind, true);
  };
  const onDialogClick = (event: MouseEvent) => {
    const target = event.target as Element;
    const tab = target.closest<HTMLButtonElement>("[data-navigation-tab]");
    if (tab) { select(tab.dataset.navigationTab!, true); return; }
    if (target.closest("[data-navigation-close], a[href]")) { close(); return; }
    if (target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
    }
  };
  const onTabKey = (event: KeyboardEvent) => {
    const index = tabs.indexOf(event.target as HTMLButtonElement);
    if (index < 0 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    select(tabs[next].dataset.navigationTab!, true);
  };
  const onResize = () => { if (!mobile.matches) close(); };
  // 原生 close 事件可能晚于下一次打开；不能让上一轮事件关闭新面板。
  const onNativeClose = () => { if (!dialog.open) restore(); };
  // Escape 和按钮共用关闭转移点，正文归位不等待原生异步 close 事件。
  const onCancel = (event: Event) => { event.preventDefault(); close(); };
  openers.forEach(link => {
    link.addEventListener("click", onOpen);
  });
  dialog.addEventListener("click", onDialogClick);
  dialog.addEventListener("close", onNativeClose);
  dialog.addEventListener("cancel", onCancel);
  dialog.addEventListener("keydown", onTabKey);
  mobile.addEventListener("change", onResize);
  layout.dataset.navigationReady = "true";
  return () => {
    close();
    delete layout.dataset.navigationReady;
    openers.forEach(link => {
      link.removeEventListener("click", onOpen);
    });
    dialog.removeEventListener("click", onDialogClick);
    dialog.removeEventListener("close", onNativeClose);
    dialog.removeEventListener("cancel", onCancel);
    dialog.removeEventListener("keydown", onTabKey);
    mobile.removeEventListener("change", onResize);
  };
}
