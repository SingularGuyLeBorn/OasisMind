/**
 * 公开文章的浏览器本地批注 UI。按文章动态加载，不启动 React/工作台；所有笔记
 * 只读写当前浏览器的 IndexedDB，正文仍是构建时生成的静态 HTML。
 */
import {
  buildArticleTextIndex,
  createLocalAnnotationAnchor,
  rangeFromLocalAnnotationAnchor,
  type ArticleTextIndex,
  type LocalAnnotationAnchor,
} from "../lib/localAnnotationAnchor";
import {
  deleteLocalAnnotation,
  importLocalAnnotationBackup,
  listAllAnnotations,
  listArticleAnnotations,
  MAX_BACKUP_BYTES,
  parseLocalAnnotationBackup,
  saveLocalAnnotation,
  serializeLocalAnnotationBackup,
  type LocalAnnotation,
  type LocalAnnotationStyle,
} from "../lib/localAnnotationStore";

const HIGHLIGHT_NAMES: Record<LocalAnnotationStyle, string> = {
  highlight: "om-local-note-highlight",
  underline: "om-local-note-underline",
  wavy: "om-local-note-wavy",
};

interface HighlightRegistryLike {
  set(name: string, highlight: unknown): void;
  delete(name: string): boolean;
}

function highlightApi(): { registry: HighlightRegistryLike; HighlightClass: new (...ranges: Range[]) => unknown } | null {
  if (typeof CSS === "undefined") return null;
  const registry = (CSS as unknown as { highlights?: HighlightRegistryLike }).highlights;
  const HighlightClass = (window as unknown as { Highlight?: new (...ranges: Range[]) => unknown }).Highlight;
  return registry && HighlightClass ? { registry, HighlightClass } : null;
}

function clearHighlights(): void {
  const api = highlightApi();
  if (api) Object.values(HIGHLIGHT_NAMES).forEach((name) => api.registry.delete(name));
}

function make<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, label?: string): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (label !== undefined) element.textContent = label;
  return element;
}

function makeButton(label: string, className?: string): HTMLButtonElement {
  const button = make("button", className, label);
  button.type = "button";
  return button;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "浏览器本地批注操作失败，请重试。";
}

function styleLabel(style: LocalAnnotationStyle): string {
  return style === "underline" ? "下划线" : style === "wavy" ? "波浪线" : "高亮";
}

/** 动态入口只在文章根节点存在时调用；库首页、About 与无脚本阅读不加载本模块。 */
export function enhanceLocalAnnotations(article: HTMLElement): void {
  const root = article.querySelector<HTMLElement>("[data-reading-content]");
  const articleId = article.dataset.localAnnotationArticle;
  const contentHash = article.dataset.localAnnotationHash;
  if (!root || !articleId || !contentHash) return;

  let annotations: LocalAnnotation[] = [];
  let fingerprint: string | null = null;
  let index: ArticleTextIndex | null = null;
  let selectedRange: Range | null = null;
  let editing: LocalAnnotation | null = null;
  let reanchorId: string | null = null;
  let draftAnchor: LocalAnnotationAnchor | null = null;
  // [OM-FREEPLAY] 新建批注先预选高亮；用户仍可在保存前切换另外两种划线。
  let draftStyle: LocalAnnotationStyle = "highlight";
  let storageError: string | null = null;
  let selectionScheduled = false;
  let persistenceRequested = false;
  let backupUrl: string | null = null;
  const located = new Map<string, Range>();

  const ensureIndex = (): ArticleTextIndex => {
    index ??= buildArticleTextIndex(root);
    return index;
  };

  // 与本地工作台相同：高亮伪元素运行时注入，避免构建器误报，同时不改正文节点。
  if (highlightApi()) {
    const highlightStyle = make("style");
    highlightStyle.textContent = `
::highlight(om-local-note-highlight) { color: inherit; background-color: rgb(254 240 138 / .7); }
::highlight(om-local-note-underline) { color: inherit; text-decoration: underline 2px rgb(37 99 235 / .85); }
::highlight(om-local-note-wavy) { color: inherit; text-decoration: underline wavy 1.5px rgb(244 63 94 / .85); }`;
    document.head.append(highlightStyle);
  }

  const openButton = makeButton("我的笔记", "local-notes-open");
  openButton.setAttribute("aria-label", "我的笔记，仅此浏览器");
  document.body.append(openButton);

  const selectionBar = make("div", "local-notes-selection");
  selectionBar.hidden = true;
  selectionBar.setAttribute("role", "toolbar");
  selectionBar.setAttribute("aria-label", "为所选文字添加批注");
  document.body.append(selectionBar);

  const panel = make("dialog", "local-notes-panel");
  panel.setAttribute("aria-label", "我的本地笔记");
  const panelHead = make("header", "local-notes-panel-head");
  const panelTitle = make("h2", undefined, "我的笔记");
  const closePanel = makeButton("关闭", "local-notes-close");
  closePanel.addEventListener("click", () => panel.close());
  panelHead.append(panelTitle, closePanel);
  const privacy = make("p", "local-notes-privacy", "仅保存在此浏览器；不会云同步或公开。清理浏览器数据前，请导出备份到系统文件。\n在其他设备或域名打开本站，需手动导入备份。");
  const panelStatus = make("p", "local-notes-status");
  panelStatus.setAttribute("role", "status");
  const supportNotice = make("p", "local-notes-support");
  if (!highlightApi()) supportNotice.textContent = "当前浏览器不支持正文彩色划线，笔记仍会保存并显示在这里。";
  const panelList = make("div", "local-notes-list");
  const backupActions = make("div", "local-notes-backup");
  // [OM-FREEPLAY] 先准备、再由用户直接点下载链接，保留手机浏览器下载所需的用户手势。
  const exportButton = makeButton("准备全部笔记 JSON");
  const exportLink = make("a", "local-notes-download", "下载备份文件");
  exportLink.hidden = true;
  const importButton = makeButton("导入笔记 JSON");
  const importInput = make("input");
  importInput.type = "file";
  importInput.accept = ".json,application/json";
  importInput.hidden = true;
  backupActions.append(exportButton, exportLink, importButton, importInput);
  panel.append(panelHead, privacy, supportNotice, panelStatus, panelList, backupActions);
  document.body.append(panel);

  const composer = make("dialog", "local-notes-composer");
  composer.setAttribute("aria-label", "编辑本地批注");
  const composeTitle = make("h2");
  const composeQuote = make("blockquote", "local-notes-quote");
  const composeStyles = make("fieldset", "local-notes-styles");
  const legend = make("legend", undefined, "划线样式");
  composeStyles.append(legend);
  const styleInputs = new Map<LocalAnnotationStyle, HTMLInputElement>();
  for (const style of ["highlight", "underline", "wavy"] as const) {
    const label = make("label");
    const input = make("input");
    input.type = "radio";
    input.name = "local-annotation-style";
    input.value = style;
    label.append(input, document.createTextNode(styleLabel(style)));
    composeStyles.append(label);
    styleInputs.set(style, input);
  }
  const commentLabel = make("label", "local-notes-comment-label", "文字笔记（可留空）");
  const comment = make("textarea");
  comment.rows = 5;
  comment.maxLength = 5_000;
  comment.placeholder = "写下你的理解、疑问或联想";
  commentLabel.append(comment);
  const composeError = make("p", "local-notes-error");
  composeError.setAttribute("role", "alert");
  const composeActions = make("div", "local-notes-compose-actions");
  const cancelCompose = makeButton("取消");
  const saveCompose = makeButton("保存到此浏览器", "local-notes-save");
  cancelCompose.addEventListener("click", () => composer.close());
  composeActions.append(cancelCompose, saveCompose);
  composer.append(composeTitle, composeQuote, composeStyles, commentLabel, composeError, composeActions);
  document.body.append(composer);

  function setPanelStatus(message: string, isError = false): void {
    panelStatus.textContent = message;
    panelStatus.dataset.error = isError ? "true" : "false";
  }

  function invalidatePreparedBackup(): void {
    if (backupUrl) URL.revokeObjectURL(backupUrl);
    backupUrl = null;
    exportLink.hidden = true;
    exportLink.removeAttribute("href");
  }

  function updateOpenButton(): void {
    openButton.textContent = reanchorId ? "请选择新引文" : annotations.length ? `我的笔记 ${annotations.length}` : "我的笔记";
    openButton.hidden = !selectionBar.hidden;
  }

  function hideSelectionBar(): void {
    selectedRange = null;
    selectionBar.hidden = true;
    updateOpenButton();
  }

  function renderHighlights(): void {
    clearHighlights();
    located.clear();
    if (annotations.length === 0) return;
    const textIndex = ensureIndex();
    const grouped: Record<LocalAnnotationStyle, Range[]> = { highlight: [], underline: [], wavy: [] };
    for (const annotation of annotations) {
      const range = rangeFromLocalAnnotationAnchor(textIndex, annotation.anchor, annotation.contentHash !== contentHash);
      if (!range) continue;
      located.set(annotation.id, range);
      grouped[annotation.style].push(range);
    }
    const api = highlightApi();
    if (!api) return;
    for (const style of ["highlight", "underline", "wavy"] as const) {
      if (grouped[style].length) api.registry.set(HIGHLIGHT_NAMES[style], new api.HighlightClass(...grouped[style]));
    }
  }

  function renderList(): void {
    panelList.replaceChildren();
    if (storageError) setPanelStatus(storageError, true);
    panelTitle.textContent = `我的笔记 · 本篇 ${annotations.length}`;
    updateOpenButton();
    if (annotations.length === 0) {
      panelList.append(make("p", "local-notes-empty", "选中正文后可划线，并写下仅此浏览器可见的笔记。"));
      return;
    }
    for (const annotation of annotations) {
      const card = make("article", "local-notes-card");
      const meta = make("p", "local-notes-card-meta", `${styleLabel(annotation.style)} · ${new Date(annotation.updatedAt).toLocaleString("zh-CN")}`);
      const quote = make("blockquote", "local-notes-card-quote", annotation.anchor.exact);
      const note = make("p", "local-notes-card-comment", annotation.comment || "仅划线，没有文字笔记。");
      const actions = make("div", "local-notes-card-actions");
      const range = located.get(annotation.id);
      if (!range) card.append(make("p", "local-notes-unmatched", "正文已变化，暂未定位；笔记仍保存在此浏览器。"));
      const locateButton = makeButton("定位原文");
      locateButton.disabled = !range;
      locateButton.addEventListener("click", () => {
        const target = located.get(annotation.id)?.startContainer.parentElement;
        panel.close();
        target?.scrollIntoView({ block: "center", behavior: "auto" });
      });
      const editButton = makeButton("编辑");
      editButton.addEventListener("click", () => {
        panel.close();
        openComposer(annotation.anchor, annotation.style, annotation);
      });
      const deleteButton = makeButton("删除");
      deleteButton.addEventListener("click", async () => {
        // [OM-FREEPLAY] 删除没有服务器回收站，二次确认防止手机误触。
        if (!window.confirm("删除这条本地批注？导出过的备份不受影响。")) return;
        deleteButton.disabled = true;
        try {
          await deleteLocalAnnotation(annotation.id, annotation.updatedAt);
          annotations = annotations.filter((item) => item.id !== annotation.id);
          fingerprint = annotationFingerprint(annotations);
          invalidatePreparedBackup();
          renderHighlights();
          renderList();
          announceChange();
          setPanelStatus("已从此浏览器删除；旧导出文件仍含原批注。");
        } catch (error) {
          deleteButton.disabled = false;
          refresh(true).catch(() => {});
          setPanelStatus(`删除失败：${errorText(error)}`, true);
        }
      });
      actions.append(locateButton, editButton);
      if (!range) {
        const bindButton = makeButton("重新绑定");
        bindButton.addEventListener("click", () => {
          reanchorId = annotation.id;
          panel.close();
          hideSelectionBar();
          updateOpenButton();
        });
        actions.append(bindButton);
      }
      actions.append(deleteButton);
      card.append(meta, quote, note, actions);
      panelList.append(card);
    }
  }

  function annotationFingerprint(items: LocalAnnotation[]): string {
    return JSON.stringify(items);
  }

  function render(): void {
    renderHighlights();
    renderList();
  }

  async function refresh(force = false): Promise<void> {
    const loaded = await listArticleAnnotations(articleId!);
    const hadStorageError = storageError !== null;
    storageError = null;
    if (hadStorageError) setPanelStatus("笔记已重新读取。");
    const nextFingerprint = annotationFingerprint(loaded);
    if (!force && nextFingerprint === fingerprint) return;
    annotations = loaded;
    fingerprint = nextFingerprint;
    invalidatePreparedBackup();
    render();
  }

  // [OM-FREEPLAY] 同一浏览器不同标签页的本机笔记改动即时通知；不等于跨设备或云同步。
  let channel: BroadcastChannel | null = null;
  function announceChange(all = false): void {
    channel?.postMessage({ articleId, all });
  }
  function onChannelMessage(event: MessageEvent<{ articleId?: string; all?: boolean }>): void {
    invalidatePreparedBackup();
    if (event.data?.all || event.data?.articleId === articleId) refresh().catch((error: unknown) => {
      storageError = `重新读取批注失败：${errorText(error)}`;
      renderList();
    });
  }
  function connectChannel(): void {
    if (channel || typeof BroadcastChannel !== "function") return;
    channel = new BroadcastChannel("oasismind-public-local-annotations");
    channel.addEventListener("message", onChannelMessage);
  }
  connectChannel();
  window.addEventListener("focus", () => refresh().catch((error: unknown) => {
    storageError = `重新读取批注失败：${errorText(error)}`;
    renderList();
  }));
  window.addEventListener("pagehide", () => {
    channel?.close();
    channel = null;
    invalidatePreparedBackup();
    clearHighlights();
  });
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    connectChannel();
    refresh(true).catch((error: unknown) => {
      storageError = `重新读取批注失败：${errorText(error)}`;
      renderList();
    });
  });

  function openComposer(anchor: LocalAnnotationAnchor, style: LocalAnnotationStyle, existing: LocalAnnotation | null = null): void {
    draftAnchor = anchor;
    draftStyle = style;
    editing = existing;
    composeTitle.textContent = existing ? "修改本地批注" : "新建本地批注";
    composeQuote.textContent = `“${anchor.exact}”`;
    comment.value = existing?.comment ?? "";
    styleInputs.get(style)!.checked = true;
    composeError.textContent = "";
    composer.showModal();
    comment.focus();
  }

  async function requestPersistence(): Promise<void> {
    if (persistenceRequested) return;
    persistenceRequested = true;
    // [OM-FREEPLAY] 能力存在时申请抗自动逐出；拒绝也不阻断保存，更不能代替导出文件。
    if (navigator.storage?.persist) await navigator.storage.persist().catch(() => false);
  }

  saveCompose.addEventListener("click", async () => {
    if (!draftAnchor || saveCompose.disabled) return;
    const selectedStyle = (["highlight", "underline", "wavy"] as const).find((style) => styleInputs.get(style)?.checked) ?? draftStyle;
    const now = new Date(Math.max(Date.now(), editing ? Date.parse(editing.updatedAt) + 1 : 0)).toISOString();
    const item: LocalAnnotation = editing ? {
      ...editing,
      anchor: draftAnchor,
      contentHash: reanchorId === editing.id ? contentHash : editing.contentHash,
      style: selectedStyle,
      comment: comment.value.trim(),
      updatedAt: now,
    } : {
      id: crypto.randomUUID(), articleId, contentHash, anchor: draftAnchor,
      style: selectedStyle, comment: comment.value.trim(), createdAt: now, updatedAt: now,
    };
    saveCompose.disabled = true;
    composeError.textContent = "";
    try {
      await saveLocalAnnotation(item, editing?.updatedAt ?? null);
      annotations = [...annotations.filter((annotation) => annotation.id !== item.id), item]
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      fingerprint = annotationFingerprint(annotations);
      invalidatePreparedBackup();
      reanchorId = null;
      render();
      announceChange();
      composer.close();
      window.getSelection()?.removeAllRanges();
      hideSelectionBar();
      requestPersistence().catch(() => {});
      setPanelStatus("已保存到此浏览器。建议定期导出全部笔记到系统文件。");
    } catch (error) {
      composeError.textContent = `保存失败，内容仍在编辑框：${errorText(error)}`;
      refresh(true).catch(() => {});
    } finally {
      saveCompose.disabled = false;
    }
  });

  function beginSelectionAnnotation(style: LocalAnnotationStyle): void {
    const range = selectedRange?.cloneRange();
    if (!range) return;
    const anchor = createLocalAnnotationAnchor(root!, ensureIndex(), range);
    if (!anchor) {
      setPanelStatus("选区无效或超过 2000 字，请重新选择正文。", true);
      panel.showModal();
      hideSelectionBar();
      return;
    }
    const existing = reanchorId ? annotations.find((item) => item.id === reanchorId) ?? null : null;
    selectionBar.hidden = true;
    updateOpenButton();
    openComposer(anchor, style, existing);
  }

  for (const style of ["highlight", "underline", "wavy"] as const) {
    const button = makeButton(styleLabel(style));
    button.addEventListener("click", () => beginSelectionAnnotation(style));
    selectionBar.append(button);
  }

  function captureSelection(): void {
    if (panel.open || composer.open) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    if (!root!.contains(range.startContainer) || !root!.contains(range.endContainer)) return;
    if (!range.toString().trim()) return;
    selectedRange = range.cloneRange();
    selectionBar.hidden = false;
    updateOpenButton();
  }

  document.addEventListener("selectionchange", () => {
    if (selectionScheduled) return;
    selectionScheduled = true;
    requestAnimationFrame(() => {
      selectionScheduled = false;
      captureSelection();
    });
  });
  document.addEventListener("pointerdown", (event) => {
    const target = event.target as Node;
    if (selectionBar.contains(target) || panel.contains(target) || composer.contains(target)) return;
    hideSelectionBar();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.open && !composer.open) hideSelectionBar();
  });

  openButton.addEventListener("click", () => {
    setPanelStatus(storageError ?? "", Boolean(storageError));
    panel.showModal();
  });
  exportButton.addEventListener("click", async () => {
    exportButton.disabled = true;
    try {
      const all = await listAllAnnotations();
      const json = serializeLocalAnnotationBackup(all);
      invalidatePreparedBackup();
      backupUrl = URL.createObjectURL(new Blob([json], { type: "application/json;charset=utf-8" }));
      exportLink.href = backupUrl;
      exportLink.download = `oasismind-notes-${new Date().toISOString().slice(0, 10)}.json`;
      exportLink.hidden = false;
      setPanelStatus(`已准备 ${all.length} 条笔记。请再点“下载备份文件”，并确认文件已保存到浏览器站点数据之外。`);
    } catch (error) { setPanelStatus(`导出失败：${errorText(error)}`, true); }
    finally { exportButton.disabled = false; }
  });
  importButton.addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", async () => {
    const file = importInput.files?.[0];
    importInput.value = "";
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) {
      setPanelStatus("备份文件过大，未导入。", true);
      return;
    }
    importButton.disabled = true;
    try {
      const backup = parseLocalAnnotationBackup(await file.text());
      const count = await importLocalAnnotationBackup(backup);
      invalidatePreparedBackup();
      await refresh(true);
      announceChange(true);
      setPanelStatus(`导入完成：新增 ${count} 条，重复项未覆盖。仅此浏览器可见。`);
    } catch (error) { setPanelStatus(`导入失败：${errorText(error)}`, true); }
    finally { importButton.disabled = false; }
  });

  refresh(true).catch((error: unknown) => {
    storageError = `读取此浏览器的笔记失败：${errorText(error)}`;
    renderList();
  });
}
