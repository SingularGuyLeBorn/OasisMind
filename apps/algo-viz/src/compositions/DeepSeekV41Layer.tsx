import React, { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import katex from "katex";
import {
  Background,
  ConnectionMode,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  EditableOrthogonalEdge,
  EditableConnectionLine,
  ConnectionGestureControl,
  EditHistoryProvider,
  EightConnectionPorts,
  EightResizeHandles,
  findBoundaryConnection,
  architectureFanoutGap,
  type BoundaryAnchor,
  type EditableEdge,
  type EditableEdgeData,
} from "../components/EditableArchitectureGraph";

type LayerMode = "swa" | "full" | "reindex" | "reuse";
type NodeKind =
  | "tensor"
  | "norm1"
  | "projection-q"
  | "projection-kv"
  | "swa-window"
  | "swa-output"
  | "compressor"
  | "indexer"
  | "global-select"
  | "kv-merge"
  | "heads"
  | "concat"
  | "add1"
  | "state1"
  | "norm2"
  | "moe-input"
  | "router"
  | "scores"
  | "experts"
  | "aggregate"
  | "moe-sum"
  | "moe-output"
  | "add2"
  | "output"
  | "structure"
  | "structure-group"
  | "structure-operator";

type DiagramTone = "neutral" | "green" | "amber" | "blue";
type DiagramData = {
  kind: NodeKind;
  layer: number;
  mode: LayerMode;
  title?: string;
  tex?: string;
  subtitle?: string;
  tone?: DiagramTone;
  matrixRows?: string[];
  matrixRowCells?: string[][];
  vectorCells?: string[];
  columnVectors?: boolean;
  matrixSelectedRow?: number;
};
type DiagramNode = Node<DiagramData>;
type Props = { initialLayer?: number };

const COLORS = {
  paper: "#f7f5f0",
  card: "#fffefa",
  ink: "#2a2924",
  muted: "#716d63",
  faint: "#a39e92",
  line: "#d9d4c8",
  green: "#37685a",
  greenSoft: "#e6efeb",
  amber: "#a87335",
  amberSoft: "#f4ecdf",
  blue: "#667c96",
  blueSoft: "#e9edf2",
  rose: "#9a625d",
};

// [OM-FREEPLAY] 数值仅展示 Router 排序、选择与加权关系，不代表真实 token 的输出。
const ROUTED_EXPERTS = [
  { id: 7, score: ".91" },
  { id: 31, score: ".86" },
  { id: 96, score: ".79" },
  { id: 142, score: ".73" },
  { id: 228, score: ".69" },
  { id: 351, score: ".64" },
] as const;

// [OM-FREEPLAY] 按共享专家的完整单行公式预留组宽；端口位置由同一组布局参数推导。
const EXPERTS_WIDTH = 2700;
const EXPERTS_PADDING = 12;
const SHARED_GROUP_WIDTH = 360;
const EXPERT_GROUP_GAP = 18;
const EXPERT_GROUP_INSET = 11;
const EXPERT_CARD_GAP = 8;
const ROUTED_CONTENT_START = EXPERTS_PADDING + SHARED_GROUP_WIDTH + EXPERT_GROUP_GAP + EXPERT_GROUP_INSET;
const ROUTED_CONTENT_WIDTH = EXPERTS_WIDTH - 2 * EXPERTS_PADDING - SHARED_GROUP_WIDTH - EXPERT_GROUP_GAP - 2 * EXPERT_GROUP_INSET;
const EXPERT_CARD_WIDTH = (ROUTED_CONTENT_WIDTH - (ROUTED_EXPERTS.length - 1) * EXPERT_CARD_GAP) / ROUTED_EXPERTS.length;
const ROUTED_HANDLE_LEFT = ROUTED_EXPERTS.map((_, index) => 100 * (ROUTED_CONTENT_START + index * (EXPERT_CARD_WIDTH + EXPERT_CARD_GAP) + EXPERT_CARD_WIDTH / 2) / EXPERTS_WIDTH);
const SHARED_HANDLE_LEFT = 100 * (EXPERTS_PADDING + SHARED_GROUP_WIDTH / 2) / EXPERTS_WIDTH;
const ROUTER_SCORE_COLUMNS = [1, 2, 3, null, 7, null, 31, null, 96, null, 142, null, 228, null, 351, null, 384] as const;

const panel: CSSProperties = {
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  border: `2px solid ${COLORS.line}`,
  borderRadius: 16,
  background: COLORS.card,
  color: COLORS.ink,
  boxShadow: "0 7px 20px rgba(42,41,36,.07)",
  overflow: "hidden",
};

const handle: CSSProperties = {
  width: 10,
  height: 10,
  border: `2px solid ${COLORS.card}`,
  background: COLORS.green,
};

const FIT_VIEW_OPTIONS = { padding: .025, minZoom: .18, maxZoom: 1 } as const;
const EDIT_DELETE_KEYS = ["Backspace", "Delete"];

function MathFormula({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: false }),
    [display, tex],
  );
  return <span aria-label={tex} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Box({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "blue" }) {
  const color = tone === "green" ? COLORS.green : tone === "amber" ? COLORS.amber : tone === "blue" ? COLORS.blue : COLORS.line;
  const background = tone === "green" ? COLORS.greenSoft : tone === "amber" ? COLORS.amberSoft : tone === "blue" ? COLORS.blueSoft : COLORS.card;
  return <div style={{ minWidth: 0, border: `1.5px solid ${color}`, borderRadius: 8, padding: "7px 8px", background, textAlign: "center", overflow: "hidden" }}>{children}</div>;
}

function Arrow({ vertical = false }: { vertical?: boolean }) {
  return <span aria-hidden style={vertical ? { width: 2, height: 12, justifySelf: "center" } : { minWidth: 12, minHeight: 2 }} />;
}

function Operator({ tex }: { tex: string }) {
  return <span style={{ color: COLORS.green, fontSize: 18, fontWeight: 900, textAlign: "center" }}><MathFormula tex={tex} /></span>;
}

function modeForLayer(layer: number): LayerMode {
  if (layer <= 2) return "swa";
  if ([3, 9, 15, 21].includes(layer)) return "full";
  if ([25, 29, 33, 37].includes(layer)) return "reindex";
  return "reuse";
}

function modeLabel(mode: LayerMode) {
  if (mode === "swa") return "SWA-only";
  if (mode === "full") return "Full";
  if (mode === "reindex") return "Reindex";
  return "Reuse";
}

function globalKvSourceLayer(layer: number) {
  if (layer < 3) return null;
  if (layer < 9) return 3;
  if (layer < 15) return 9;
  if (layer < 21) return 15;
  return 21;
}

function globalIndexSourceLayer(layer: number) {
  if (layer < 3) return null;
  if (layer < 9) return 3;
  if (layer < 15) return 9;
  if (layer < 21) return 15;
  if (layer < 25) return 21;
  if (layer < 29) return 25;
  if (layer < 33) return 29;
  if (layer < 37) return 33;
  return 37;
}

function compressionRatioForLayer(layer: number) {
  return layer <= 20 ? 2 : 1;
}

function Title({ children }: { children: ReactNode }) {
  return <div style={{ padding: "10px 14px 9px", borderBottom: `1px solid ${COLORS.line}`, fontSize: 15, fontWeight: 800 }}>{children}</div>;
}

function tonePalette(tone: "neutral" | "blue" | "green" | "amber") {
  return tone === "green"
    ? { color: COLORS.green, background: COLORS.greenSoft }
    : tone === "amber"
      ? { color: COLORS.amber, background: COLORS.amberSoft }
      : tone === "blue"
        ? { color: COLORS.blue, background: COLORS.blueSoft }
        : { color: COLORS.line, background: COLORS.card };
}

function VectorStrip({
  name,
  length,
  elementTex,
  tone = "neutral",
  compact = false,
  selected = false,
  columns: displayedColumns,
  nameWidth,
  outlineSelection = true,
}: {
  name: string;
  length: string;
  elementTex: (column: string) => string;
  tone?: "neutral" | "blue" | "green" | "amber";
  compact?: boolean;
  selected?: boolean;
  columns?: string[];
  nameWidth?: number;
  outlineSelection?: boolean;
}) {
  const palette = tonePalette(selected ? "amber" : tone);
  const columns = displayedColumns ?? ["1", "2", "\\cdots", length];
  return <div data-vector-elements data-vector-selected={selected || undefined} style={{ minWidth: 0, display: "grid", gridTemplateColumns: `${nameWidth ?? (compact ? 52 : 92)}px minmax(0,1fr)`, gap: 5, alignItems: "center", padding: compact ? 2 : 5, fontSize: compact ? 9 : 10.5, lineHeight: 1.2, outline: selected && outlineSelection ? `1px dashed ${palette.color}` : undefined, borderRadius: 4 }}>
    <div style={{ minWidth: 0, textAlign: "center", color: palette.color, fontSize: compact ? 9 : 10.5, fontWeight: 800, overflow: "hidden" }}><MathFormula tex={name} /></div>
    <div style={{ minWidth: 0, display: "grid", gridTemplateColumns: columns.map(column => column === "\\cdots" ? ".55fr" : "minmax(0,1fr)").join(" "), gap: 3 }}>
      {columns.map((column, index) => column === "\\cdots"
        ? <span key={`${column}-${index}`} style={{ display: "grid", placeItems: "center", color: COLORS.muted }}><MathFormula tex="\cdots" /></span>
        : <span key={`${column}-${index}`} style={{ minWidth: 0, padding: compact ? "2px 3px" : "4px 3px", border: `1px solid ${palette.color}`, borderRadius: 4, background: palette.background, textAlign: "center", fontSize: compact ? 8.5 : 9.5, overflow: "hidden" }}><MathFormula tex={elementTex(column)} /></span>)}
    </div>
  </div>;
}

function Matrix({ tex, shape, rowTex, elementTex, tone = "blue", vectorLength = "5120" }: { tex: string; shape: string; rowTex: (row: string) => string; elementTex: (row: string, column: string) => string; tone?: "blue" | "green" | "amber"; vectorLength?: string }) {
  const rows = ["1", "2", "\\vdots", "N"];
  const palette = tonePalette(tone);
  return (
    <div style={{ border: `1.5px solid ${palette.color}`, borderRadius: 9, overflow: "hidden" }}>
      <div style={{ padding: "6px 9px", background: palette.background, display: "flex", justifyContent: "space-between", gap: 8 }}>
        <MathFormula tex={tex} /><MathFormula tex={shape} />
      </div>
      <div style={{ padding: 6, display: "grid", gap: 3, borderTop: `1px solid ${COLORS.line}`, fontSize: 9.5 }}>
        {rows.map((row, index) => row === "\\vdots"
          ? <div key={`${row}-${index}`} style={{ minHeight: 22, display: "grid", placeItems: "center" }}><MathFormula tex="\vdots" /></div>
          : <VectorStrip key={`${row}-${index}`} name={rowTex(row)} length={vectorLength} columns={["1", "2", "3", "\\cdots", vectorLength]} elementTex={(column) => elementTex(row, column)} tone={tone} compact />)}
      </div>
    </div>
  );
}

function RowMatrix({ tex, shape, rows, selected, tone = "green", rowLength, elementTex, elementColumns }: { tex: string; shape: string; rows: string[]; selected?: number; tone?: "blue" | "green"; rowLength?: string; elementTex?: (rowIndex: number, column: string) => string; elementColumns?: string[] }) {
  const palette = tonePalette(tone);
  return <div style={{ minWidth: 0, padding: 6, border: `1.3px solid ${palette.color}`, borderRadius: 7, background: palette.background, display: "grid", gap: 5 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 4, fontSize: 10 }}><MathFormula tex={tex} /><MathFormula tex={shape} /></div>
    <div style={{ display: "grid", gap: 3 }}>{rows.map((row, index) => row === "\\vdots" ? <div key={index} style={{ textAlign: "center", fontSize: 9 }}><MathFormula tex={row} /></div> : elementTex && rowLength ? <VectorStrip key={index} name={row} length={rowLength} columns={elementColumns} elementTex={column => elementTex(index, column)} tone={tone} selected={selected === index} compact /> : <div key={index} style={{ border: `1px solid ${selected === index ? COLORS.amber : palette.color}`, borderRadius: 4, background: selected === index ? COLORS.amberSoft : palette.background, padding: "4px 2px", textAlign: "center", fontSize: 10 }}><MathFormula tex={row} /></div>)}</div>
  </div>;
}

function QueryProjection({ layer }: { layer: number }) {
  return (
    <div style={panel}>
      <Title>Layer {layer} · Query</Title>
      <div style={{ position: "absolute", left: 28, top: 47, color: COLORS.blue, fontSize: 10.5, fontWeight: 800 }}>① 5120 → 1280</div>
      <div style={{ position: "absolute", left: 28, top: 250, color: COLORS.blue, fontSize: 10.5, fontWeight: 800 }}>② 1280 → 64 × 512</div>
      <div style={{ position: "absolute", left: 28, top: 510, color: COLORS.green, fontSize: 10.5, fontWeight: 800 }}>③ 高亮第 t 行，按每 512 个元素分成一个 Head</div>
    </div>
  );
}

function LocalKvProjection({ layer }: { layer: number }) {
  return (
    <div style={panel}>
      <Handle id="main-in" type="target" position={Position.Top} style={handle} />
      <Handle id="swa" type="source" position={Position.Bottom} style={handle} />
      <Title>Layer {layer} · 本层独立 KV</Title>
      <div style={{ padding: 9, display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 18px 1.15fr 18px 1fr", gap: 4, alignItems: "center" }}>
          <RowMatrix tex={`X_{${layer}}`} shape="N\times5120" rows={[`\\mathbf x_{${layer},1}`, `\\mathbf x_{${layer},2}`, "\\vdots", `\\mathbf x_{${layer},N}`]} tone="blue" />
          <Operator tex="\times" />
          <div style={{ padding: 5, border: `1.3px solid ${COLORS.amber}`, borderRadius: 7, background: COLORS.amberSoft, display: "grid", gap: 5, fontSize: 9, minWidth: 0, textAlign: "center" }}>
            <MathFormula tex={`W_{${layer}}^{KV,\\mathrm{SWA}}`} /><MathFormula tex="5120\times512" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr .4fr 1fr", gap: 3, alignItems: "center" }}>
              {["1", "2", "\\cdots", "512"].map(column => column === "\\cdots" ? <MathFormula key={column} tex={column} /> : <div key={column} style={{ border: `1px solid ${COLORS.amber}`, borderRadius: 4, padding: "20px 0" }}><MathFormula tex={`\\mathbf w_{${layer},${column}}`} /></div>)}
            </div>
          </div>
          <Operator tex="=" />
          <RowMatrix tex={`\\widehat U_{${layer}}`} shape="N\times512" rows={[`\\widehat{\\mathbf u}_{${layer},1}`, `\\widehat{\\mathbf u}_{${layer},2}`, "\\vdots", `\\widehat{\\mathbf u}_{${layer},N}`]} />
        </div>
        <div style={{ textAlign: "center", fontSize: 13 }}><MathFormula tex={`U_{${layer}}=\\operatorname{RoPE}(\\operatorname{RMSNorm}(\\widehat U_{${layer}}))`} /></div>
        <RowMatrix tex={`U_{${layer}}`} shape="N\times512" rows={[`\\mathbf u_{${layer},1}`, `\\mathbf u_{${layer},2}`, `\\mathbf u_{${layer},3}`, "\\vdots", `\\mathbf u_{${layer},N}`]} rowLength="512" elementColumns={["1", "2", "3", "4", "\\cdots", "512"]} elementTex={(row, column) => `u_{${layer},${["1", "2", "3", "", "N"][row]},${column}}`} />
      </div>
    </div>
  );
}

type MatrixRowSpec = { row: string; selected?: boolean; ellipsis?: boolean };

function RingCache({ layer }: { layer: number }) {
  const slots = ["t-127", "t-126", "t-125", "\\cdots", "t-3", "t-2", "t-1", "t"];
  return <div data-ring-cache style={{ width: "100%", maxWidth: 240, aspectRatio: "1", position: "relative", justifySelf: "center" }}>
    <svg aria-hidden viewBox="0 0 240 240" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <defs><marker id={`cache-write-${layer}`} viewBox="0 -5 10 10" refX="9" refY="0" markerWidth="8" markerHeight="8" orient="auto"><path d="M 1 -4 L 9 0 L 1 4" fill="none" stroke={COLORS.amber} strokeWidth="1.5" /></marker></defs>
      <circle cx="120" cy="120" r="81.6" fill="none" stroke={COLORS.green} strokeWidth="2" />
      <path d="M 120 95 L 120 56" fill="none" stroke={COLORS.amber} strokeWidth="2" markerEnd={`url(#cache-write-${layer})`} />
    </svg>
    {slots.map((row, index) => {
      const angle = (-90 + index * 45) * Math.PI / 180;
      const oldest = index === 0;
      return <div key={index} data-cache-slot={row} style={{ position: "absolute", left: `${50 + 34 * Math.cos(angle)}%`, top: `${50 + 34 * Math.sin(angle)}%`, transform: "translate(-50%,-50%)", width: 72, minHeight: 28, display: "grid", placeItems: "center", border: row === "\\cdots" ? "none" : `1.5px solid ${oldest ? COLORS.amber : COLORS.green}`, borderRadius: 6, background: oldest ? COLORS.amberSoft : COLORS.greenSoft, color: COLORS.green, fontSize: 10 }}>
        <MathFormula tex={row === "\\cdots" ? row : `\\mathbf u_{${layer},${row}}`} />
      </div>;
    })}
    <div style={{ position: "absolute", left: "50%", top: "52%", width: 100, transform: "translate(-50%,-50%)", display: "grid", gap: 4, textAlign: "center", color: COLORS.green, fontSize: 10 }}><strong>128 槽</strong><MathFormula tex={`\\mathbf u_{${layer},t+1}`} /><span style={{ color: COLORS.amber }}>覆盖最旧槽</span></div>
    <strong style={{ position: "absolute", bottom: 0, width: "100%", textAlign: "center", fontSize: 11, color: COLORS.green }}>Decode 环形 cache</strong>
  </div>;
}

function MatrixBracket({ layer, rows, compact = false }: { layer: number; rows: MatrixRowSpec[]; compact?: boolean }) {
  const firstSelected = rows.findIndex(row => row.selected && !row.ellipsis);
  const lastSelected = rows.reduce((last, row, index) => row.selected && !row.ellipsis ? index : last, -1);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "8px minmax(0,1fr) 8px", gap: 4, alignItems: "stretch", minWidth: 0 }}>
      <span aria-hidden style={{ borderLeft: `2px solid ${COLORS.ink}`, borderTop: `2px solid ${COLORS.ink}`, borderBottom: `2px solid ${COLORS.ink}` }} />
      <div style={{ display: "grid", gap: compact ? 2 : 3, minWidth: 0 }}>
        {firstSelected >= 0 && <div data-selection-window aria-hidden style={{ gridColumn: 1, gridRow: `${firstSelected + 1} / ${lastSelected + 2}`, border: `1px dashed ${COLORS.amber}`, borderRadius: 4, margin: -1, pointerEvents: "none" }} />}
        {rows.map((item, index) => (
          <div
            key={`${item.row}-${index}`}
            data-matrix-ellipsis={item.ellipsis || undefined}
            style={{
              minWidth: 0,
              gridColumn: 1,
              gridRow: index + 1,
              minHeight: compact ? (item.ellipsis ? 14 : 20) : 22,
              display: "grid",
              gridTemplateColumns: "1fr",
              alignItems: "center",
              gap: 3,
              padding: compact ? 0 : item.ellipsis ? "1px 4px" : "2px 4px",
              borderRadius: 5,
              border: "none",
              background: "transparent",
              color: COLORS.ink,
              fontSize: compact ? 9 : 9.5,
              textAlign: "center",
            }}
          >
            {item.ellipsis
              ? <MathFormula tex="\vdots" />
              : <VectorStrip name={`\\mathbf u_{${layer},${item.row}}`} length="512" elementTex={(column) => `u_{${layer},${item.row},${column}}`} tone="green" selected={item.selected} outlineSelection={false} compact />}
          </div>
        ))}
      </div>
      <span aria-hidden style={{ borderRight: `2px solid ${COLORS.ink}`, borderTop: `2px solid ${COLORS.ink}`, borderBottom: `2px solid ${COLORS.ink}` }} />
    </div>
  );
}

function Head({ index, layer }: { index: number; layer: number }) {
  const attendedKv = `\\mathrm{KV}_{${layer},t}`;
  const queryRow = `\\mathbf q_{${layer},${index},t}`;
  return (
    <div style={{ position: "relative", border: `1.5px solid ${COLORS.green}`, borderRadius: 10, padding: 8, display: "grid", gap: 5, background: COLORS.card }}>
      <strong style={{ color: COLORS.green, textAlign: "center", fontSize: 12 }}>Layer {layer} · Head {index}</strong>
      <div data-head-layout={index} style={{ display: "grid", gridTemplateColumns: "minmax(280px,1.1fr) 24px minmax(250px,1fr)", gap: 6, alignItems: "center" }}>
        <div data-head-calculation style={{ minWidth: 0, display: "grid", gap: 6 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 5 }}><Box tone="blue"><MathFormula tex={`${queryRow}\\in\\mathbb R^{1\\times512}`} /></Box><Box tone="green"><MathFormula tex={attendedKv} /></Box></div>
          <Box tone="green"><MathFormula tex={`\\mathbf z_{${layer},${index},t}=${queryRow}(${attendedKv})^{\\mathsf T}/\\sqrt{512}`} /><br /><MathFormula tex={`\\mathbf a_{${layer},${index},t}=\\operatorname{softmax}(\\mathbf z_{${layer},${index},t})`} /></Box>
          <Box tone="amber"><MathFormula tex={`\\mathbf o_{${layer},${index},t}=\\mathbf a_{${layer},${index},t}\\,${attendedKv}`} /><br /><MathFormula tex="1\times512" /></Box>
        </div>
        <Operator tex="\to" />
        <div data-head-output style={{ minWidth: 0, display: "grid", gap: 4 }}>
          <span style={{ fontSize: 10, color: COLORS.green, textAlign: "center" }}>每个 token 的输出占一行</span>
          <RowMatrix tex={`O_{${layer},${index}}`} shape="N\times512" rows={[
            `\\mathbf o_{${layer},${index},1}`, `\\mathbf o_{${layer},${index},2}`, `\\mathbf o_{${layer},${index},3}`, "\\vdots",
            `\\mathbf o_{${layer},${index},t}`, "\\vdots", `\\mathbf o_{${layer},${index},N}`,
          ]} selected={4} rowLength="512" elementTex={(row, column) => `o_{${layer},${index},${["1", "2", "3", "", "t", "", "N"][row]},${column}}`} />
        </div>
      </div>
    </div>
  );
}

function Expert({ layer, index, score, shared = false }: { layer: number; index?: number; score?: string; shared?: boolean }) {
  const expertIndex = shared ? "\\mathrm{shared}" : `${index}`;
  const expertTex = `E_{${layer},${expertIndex}}`;
  const weightIndex = shared ? "\\mathrm{shared}" : `${index}`;
  return (
    <div data-expert={shared ? "shared" : index} style={{ border: `1.5px solid ${shared ? COLORS.blue : COLORS.amber}`, borderRadius: 9, padding: 9, display: "grid", gap: 7, background: COLORS.card, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: shared ? COLORS.blue : COLORS.amber, fontWeight: 800, fontSize: 11 }}><span>{shared ? `Layer ${layer} · Shared` : `Layer ${layer} · Expert ${index}`}</span><span>{shared ? "权重 1" : <MathFormula tex={`g_{${layer},${index}}=${score}`} />}</span></div>
      <Box tone="blue"><MathFormula tex={`Y_{${layer}}`} /></Box>
      <Box><MathFormula tex={`a_{${layer},${expertIndex}}=\\operatorname{SiLU}(Y_{${layer}}W_{${layer},${weightIndex}}^{\\mathrm{gate}})`} /></Box>
      <Box><MathFormula tex={`b_{${layer},${expertIndex}}=Y_{${layer}}W_{${layer},${weightIndex}}^{\\mathrm{up}}`} /></Box>
      <Box tone="amber"><MathFormula tex={`c_{${layer},${expertIndex}}=a_{${layer},${expertIndex}}\\odot b_{${layer},${expertIndex}}`} /></Box>
      <div style={{ position: "relative", minWidth: 0, padding: "22px 7px 8px", border: `1.5px solid ${shared ? COLORS.blue : COLORS.amber}`, borderRadius: 8, background: shared ? COLORS.blueSoft : COLORS.amberSoft, textAlign: "center" }}>
        <span style={{ position: "absolute", top: 4, right: 7, fontSize: 10 }}><MathFormula tex="N\times5120" /></span>
        <MathFormula tex={`${expertTex}(Y_{${layer}})=c_{${layer},${expertIndex}}W_{${layer},${weightIndex}}^{\\mathrm{down}}`} />
      </div>
    </div>
  );
}

function SelectedGlobalRows({ kvSource, indexSource }: { kvSource: number; indexSource: number }) {
  const rows = [
    { label: "1", selected: false },
    { label: `i_{${indexSource},t,1}`, selected: true },
    { label: `i_{${indexSource},t,2}`, selected: true },
    { label: "\\vdots", selected: true, ellipsis: true },
    { label: `i_{${indexSource},t,K_{${indexSource},t}}`, selected: true },
    { label: "M", selected: false },
  ];
  return <div style={{ display: "grid", gap: 5, minWidth: 0 }}>
    <div style={{ display: "grid", gridTemplateColumns: "44px 8px minmax(0,1fr) 8px", gap: 4, minWidth: 0 }}>
      <div style={{ display: "grid", gridTemplateRows: `repeat(${rows.length},1fr)`, gap: 3, color: COLORS.muted, fontSize: 10, textAlign: "right", alignItems: "center" }}>{rows.map((row, index) => <span key={`${row.label}-${index}`} style={{ color: row.selected ? COLORS.amber : COLORS.muted, fontWeight: row.selected ? 800 : 500 }}><MathFormula tex={row.label} /></span>)}</div>
      <span aria-hidden style={{ borderLeft: `2px solid ${COLORS.ink}`, borderTop: `2px solid ${COLORS.ink}`, borderBottom: `2px solid ${COLORS.ink}` }} />
      <div style={{ display: "grid", gap: 3, minWidth: 0 }}>{rows.map((row, rowIndex) => <div key={`${row.label}-values-${rowIndex}`} style={{ minWidth: 0, minHeight: 28, padding: 2, textAlign: "center", fontSize: 9.5 }}>{row.ellipsis ? <MathFormula tex="\vdots" /> : <VectorStrip name={`\\mathbf g_{${kvSource},${row.label}}`} length="512" nameWidth={76} elementTex={column => `g_{${kvSource},${row.label},${column}}`} tone="green" selected={row.selected} compact />}</div>)}</div>
      <span aria-hidden style={{ borderRight: `2px solid ${COLORS.ink}`, borderTop: `2px solid ${COLORS.ink}`, borderBottom: `2px solid ${COLORS.ink}` }} />
    </div>
    <div style={{ paddingLeft: 52, color: COLORS.amber, fontSize: 10.5, fontWeight: 800, textAlign: "center" }}>虚线范围内的整行元素共同选中</div>
  </div>;
}

function DiagramNodeContent({ data }: { data: DiagramData }) {
  const { kind, layer, mode } = data;
  const both = <><Handle id="main-in" type="target" position={Position.Top} style={handle} /><Handle id="main-out" type="source" position={Position.Bottom} style={handle} /></>;

  if (kind === "structure-group") {
    return <div style={{ ...panel, borderColor: data.tone === "green" ? COLORS.green : COLORS.blue, boxShadow: "none", background: "rgba(255,254,250,.66)" }}>
      <Title>{data.tex && <><MathFormula tex={data.tex} /> · </>}{data.title}</Title>
    </div>;
  }

  if (kind === "structure-operator") {
    return <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: COLORS.green, fontSize: 22, fontWeight: 900 }}>
      <MathFormula tex={data.tex ?? ""} />
    </div>;
  }

  if (kind === "structure") {
    const tone = data.tone ?? "neutral";
    const color = tone === "green" ? COLORS.green : tone === "amber" ? COLORS.amber : tone === "blue" ? COLORS.blue : COLORS.line;
    const background = tone === "green" ? COLORS.greenSoft : tone === "amber" ? COLORS.amberSoft : tone === "blue" ? COLORS.blueSoft : COLORS.card;
    return <div style={{ ...panel, borderColor: color, borderRadius: 10, background, boxShadow: "0 3px 10px rgba(42,41,36,.06)", display: "grid", gridTemplateRows: data.title ? "auto 1fr" : "1fr" }}>
      {data.title && <div style={{ padding: "6px 9px", borderBottom: `1px solid ${COLORS.line}`, fontSize: 10.5, fontWeight: 800, color, lineHeight: 1.2 }}>{data.title}</div>}
      <div style={{ padding: 4, display: "grid", placeItems: "center", alignContent: "center", gap: 4, minWidth: 0, textAlign: "center", lineHeight: 1.2 }}>
        {data.matrixRows?.length ? (
          <div style={{ width: "100%", display: "grid", gap: 5 }}>
            {data.tex && <div style={{ color, fontWeight: 800 }}><MathFormula tex={data.tex} /></div>}
            <div style={{ display: "grid", gridTemplateColumns: "7px minmax(0,1fr) 7px", gap: 4 }}>
              <span aria-hidden style={{ borderLeft: `2px solid ${COLORS.ink}`, borderTop: `2px solid ${COLORS.ink}`, borderBottom: `2px solid ${COLORS.ink}` }} />
              <div style={{ display: "grid", gap: 3 }}>{data.matrixRows.map((row, index) => <div key={`${row}-${index}`} style={{ minHeight: 18, border: `1px solid ${data.matrixSelectedRow === index ? COLORS.amber : color}`, borderRadius: 5, background: data.matrixSelectedRow === index ? COLORS.amberSoft : background, display: "grid", gridTemplateColumns: data.matrixRowCells?.[index] ? "70px minmax(0,1fr)" : "1fr", alignItems: "center", gap: 3, padding: 2, fontSize: 9.5 }}>
                <MathFormula tex={row} />
                {data.matrixRowCells?.[index] && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr .5fr 1fr", gap: 2 }}>{data.matrixRowCells[index].map((cell, cellIndex) => cell === "\\cdots" ? <span key={`${cell}-${cellIndex}`} style={{ display: "grid", placeItems: "center" }}><MathFormula tex={cell} /></span> : <span key={`${cell}-${cellIndex}`} style={{ padding: "2px 1px", border: `1px solid ${color}`, borderRadius: 3, background, textAlign: "center", overflow: "hidden" }}><MathFormula tex={cell} /></span>)}</div>}
              </div>)}</div>
              <span aria-hidden style={{ borderRight: `2px solid ${COLORS.ink}`, borderTop: `2px solid ${COLORS.ink}`, borderBottom: `2px solid ${COLORS.ink}` }} />
            </div>
          </div>
        ) : data.vectorCells?.length ? <div style={{ width: "100%", display: "grid", gridTemplateColumns: data.columnVectors ? "1fr" : "minmax(48px,.7fr) minmax(0,1.8fr)", alignItems: "center", gap: 4 }}>
          <MathFormula tex={data.tex ?? ""} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr .55fr 1fr", gap: 3 }}>{data.vectorCells.map((cell, index) => cell === "\\cdots" ? <span key={`${cell}-${index}`} style={{ display: "grid", placeItems: "center" }}><MathFormula tex={cell} /></span> : <span key={`${cell}-${index}`} style={{ minHeight: data.columnVectors ? 60 : undefined, display: "grid", placeItems: "center", padding: "3px 2px", border: `1px solid ${color}`, borderRadius: 4, background, fontSize: 9 }}><MathFormula tex={cell} /></span>)}</div>
        </div> : <MathFormula tex={data.tex ?? ""} />}
        {data.subtitle && <span style={{ color: COLORS.muted, fontSize: 10.5 }}>{data.subtitle}</span>}
      </div>
    </div>;
  }

  if (kind === "tensor" || kind === "output") {
    const output = kind === "output";
    return <div style={panel}>{output ? both : <><Handle id="main" type="source" position={Position.Bottom} style={handle} /><Handle id="residual" type="source" position={Position.Left} style={{ ...handle, background: COLORS.amber }} /></>}<Title><MathFormula tex={output ? `H_{${layer}}^{\\mathrm{out}}=H_{${layer}}'+O_{${layer}}^{\\mathrm{FFN}}` : `H_{${layer}}^{\\mathrm{in}}`} /></Title><div style={{ padding: 10 }}><Matrix tex={output ? `H_{${layer}}^{\\mathrm{out}}` : `H_{${layer}}^{\\mathrm{in}}`} shape="N\times5120" rowTex={(row) => output ? `\\mathbf h_{${layer},${row}}^{\\mathrm{out}}` : `\\mathbf h_{${layer},${row}}^{\\mathrm{in}}`} elementTex={(row, column) => output ? `h_{${layer},${row},${column}}^{\\mathrm{out}}` : `h_{${layer},${row},${column}}^{\\mathrm{in}}`} tone={output ? "green" : "blue"} /></div></div>;
  }

  if (kind === "norm1") {
    return <div style={{ ...panel, display: "grid", placeItems: "center", fontSize: 17, fontWeight: 750 }}>
      <Handle id="main-in" type="target" position={Position.Top} style={handle} />
      <Handle id="query" type="source" position={Position.Bottom} style={{ ...handle, left: "25%", background: COLORS.blue }} />
      <Handle id="local-kv" type="source" position={Position.Bottom} style={{ ...handle, left: "60%" }} />
      <Handle id="global-kv" type="source" position={Position.Bottom} style={{ ...handle, left: "85%", background: COLORS.amber }} />
      <MathFormula tex={`X_{${layer}}=\\operatorname{RMSNorm}(H_{${layer}}^{\\mathrm{in}};\\gamma_{${layer},1})`} />
    </div>;
  }

  if (kind === "norm2") {
    return <div style={{ ...panel, display: "grid", placeItems: "center", fontSize: 17, fontWeight: 750 }}>{both}<MathFormula tex={`Y_{${layer}}=\\operatorname{RMSNorm}(H_{${layer}}';\\gamma_{${layer},2})`} /></div>;
  }

  if (kind === "projection-q") return <QueryProjection layer={layer} />;
  if (kind === "projection-kv") return <LocalKvProjection layer={layer} />;

  if (kind === "swa-window") {
    return <div style={{ ...panel, borderColor: COLORS.green }}>
      <Handle id="projected-kv" type="target" position={Position.Top} style={{ ...handle, left: mode === "swa" ? "50%" : "90%" }} />
      <Title>Layer {layer} 本地 SWA cache · 本层独立拥有，<MathFormula tex="t" /> 是当前 token 行号</Title>
      <div style={{ padding: 10, display: "grid", gap: 8, minWidth: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 20px .9fr", alignItems: "start", gap: 8, minWidth: 0 }}>
        <div style={{ minWidth: 0, display: "grid", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}><strong>完整 KV 潜向量矩阵</strong><MathFormula tex={`U_{${layer}}\\in\\mathbb{R}^{N\\times512}`} /></div>
          <MatrixBracket layer={layer} rows={[
            { row: "1" },
            { row: "", ellipsis: true },
            { row: "r-1" },
            { row: "r", selected: true },
            { row: "r+1", selected: true },
            { row: "", ellipsis: true },
            { row: "t", selected: true },
            { row: "t+1" },
            { row: "N" },
          ]} compact />
        </div>
        <span />
        <div style={{ minWidth: 0, display: "grid", gap: 8 }}>
          <div data-window-start style={{ minWidth: 0, width: "fit-content", maxWidth: "100%", boxSizing: "border-box", justifySelf: "center", border: `1.5px solid ${COLORS.amber}`, borderRadius: 8, padding: 6, background: COLORS.amberSoft, display: "grid", gap: 4, fontSize: 11, lineHeight: 1.2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 5 }}><strong>窗口起点 r</strong><span style={{ fontSize: 8.5 }}><MathFormula tex="\min(128,t)\times512" /></span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px", alignItems: "center", textAlign: "center" }}>
              <MathFormula tex="t\le128" /><MathFormula tex="r=1" />
              <MathFormula tex="t>128" /><MathFormula tex="r=t-127" />
            </div>
            <div style={{ borderTop: `1px solid ${COLORS.amber}`, paddingTop: 4, display: "grid", gap: 4 }}>
              <span style={{ fontSize: 10 }}>行号示例 · 含起点和终点</span>
              {/* [OM-FREEPLAY] 用 6 与 130 两个位置举例，分别展示未满窗口和滑动后的窗口。 */}
              {[{ t: 6, r: 1, rows: ["1", "2", "3", "\\ldots", "6"] }, { t: 130, r: 3, rows: ["3", "4", "5", "\\ldots", "130"] }].map(example => <div key={example.t} data-window-example={example.t} style={{ display: "grid", gridTemplateColumns: "max-content max-content", gap: 7, alignItems: "center", fontSize: 9 }}>
                <MathFormula tex={`t=${example.t},\\;r=${example.r}`} />
                <div style={{ display: "flex", gap: 3 }}>{example.rows.map(row => <span key={row} style={{ padding: "1px 3px", border: row === "\\ldots" ? "none" : `1px solid ${COLORS.amber}`, borderRadius: 3 }}><MathFormula tex={row} /></span>)}</div>
              </div>)}
            </div>
          </div>
          <RingCache layer={layer} />
        </div>
      </div>
      </div>
      <div data-window-extraction style={{ position: "absolute", left: 10, top: 371, width: "calc((100% - 56px) * .653846)", display: "grid", justifyItems: "center", gap: 1, color: COLORS.amber, fontSize: 11 }}><span>取出虚线内第 r～t 行 · 保留全部 512 列</span><Operator tex="\downarrow" /></div>
    </div>;
  }

  if (kind === "swa-output") {
    return <div data-swa-result style={{ ...panel, borderColor: COLORS.amber, background: COLORS.greenSoft, padding: 9, display: "grid", gap: 6 }}>
      <Handle id="local-window" type="source" position={Position.Bottom} style={{ ...handle, background: COLORS.amber }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}><MathFormula tex={`U_{${layer},t}^{\\mathrm{SWA}}`} /><span style={{ fontSize: 10 }}><MathFormula tex="\min(128,t)\times512" /></span></div>
      <span style={{ fontSize: 11, color: COLORS.green }}>窗口 KV · 送往下方 KV 拼接</span>
    </div>;
  }

  if (kind === "compressor") {
    const kvSource = globalKvSourceLayer(layer)!;
    const ratio = compressionRatioForLayer(kvSource);
    const writesKv = mode === "full";
    return <div style={{ ...panel, borderColor: COLORS.green }}>
      <Handle id="input" type="target" position={Position.Top} style={handle} />
      <Handle id="to-indexer" type="source" position={Position.Bottom} style={handle} />
      <Title>{writesKv ? <>全局 KV 生成 · Layer {layer} Compressor</> : <>读取 Layer {kvSource} 已生成的全局 KV</>}</Title>
      <div style={{ padding: 10, display: "grid", gap: 7, fontSize: 11, minWidth: 0 }}>
        {writesKv ? <>
          <div style={{ display: "grid", gap: 7 }}>
            <div style={{ border: `1.2px solid ${COLORS.green}`, borderRadius: 8, padding: 6, display: "grid", gap: 5, background: COLORS.greenSoft }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}><MathFormula tex={`W_{${layer}}^{KV,c}`} /><MathFormula tex="5120\times512" /></div>
              <VectorStrip name={`\\mathbf x_{${layer},t}`} length="5120" elementTex={(column) => `x_{${layer},t,${column}}`} tone="blue" compact />
              <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 28px 1.35fr", gap: 4, alignItems: "center" }}><Operator tex="\times" /><Box><MathFormula tex={`\\mathbf w_{${layer},:,j}^{KV,c}`} /></Box><Operator tex="=" /><VectorStrip name={`\\mathbf v_{${layer},t}^{c}`} length="512" elementTex={(column) => `v_{${layer},t,${column}}^c`} tone="green" compact /></div>
            </div>
            {ratio === 2 && <div style={{ border: `1.2px solid ${COLORS.amber}`, borderRadius: 8, padding: 6, display: "grid", gap: 5, background: COLORS.amberSoft }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}><MathFormula tex={`W_{${layer}}^{\\mathrm{gate}}`} /><MathFormula tex="5120\times512" /></div>
              <VectorStrip name={`\\mathbf x_{${layer},t}`} length="5120" elementTex={(column) => `x_{${layer},t,${column}}`} tone="blue" compact />
              <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 28px 1.35fr", gap: 4, alignItems: "center" }}><Operator tex="\times" /><Box><MathFormula tex={`\\mathbf w_{${layer},:,j}^{\\mathrm{gate}}`} /></Box><Operator tex="=" /><VectorStrip name={`\\mathbf a_{${layer},t}^{\\mathrm{gate}}`} length="512" elementTex={(column) => `a_{${layer},t,${column}}^{\\mathrm{gate}}`} tone="amber" compact /></div>
            </div>}
          </div>
          <Arrow vertical />
          {ratio === 2 ? <div style={{ display: "grid", gap: 7 }}>
            <Box tone="amber"><strong>每连续 2 行生成两组逐元素权重</strong><br /><MathFormula tex={`[\\boldsymbol\\alpha_{${layer},i,1};\\boldsymbol\\alpha_{${layer},i,2}]=\\operatorname{softmax}_{\\mathrm{row}}([\\mathbf a_{${layer},2i-1};\\mathbf a_{${layer},2i}])`} /></Box>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 22px 1fr 42px 1fr", alignItems: "center", gap: 5 }}>
              <Box><MathFormula tex={`\\mathbf v_{${layer},2i-1}^c\\in\\mathbb{R}^{512}`} /></Box><Operator tex="\odot" /><Box tone="amber"><MathFormula tex={`\\boldsymbol\\alpha_{${layer},i,1}\\in\\mathbb{R}^{512}`} /></Box><Operator tex="+" /><Box><MathFormula tex={`\\boldsymbol\\alpha_{${layer},i,2}\\odot\\mathbf v_{${layer},2i}^c`} /></Box>
            </div>
            <Arrow vertical />
            <Box tone="green"><MathFormula tex={`\\mathbf g_{${layer},i}=\\operatorname{RMSNorm}(\\boldsymbol\\alpha_{${layer},i,1}\\odot\\mathbf v_{${layer},2i-1}^c+\\boldsymbol\\alpha_{${layer},i,2}\\odot\\mathbf v_{${layer},2i}^c)\\in\\mathbb{R}^{512}`} /></Box>
          </div> : <Box tone="amber"><strong>压缩比 1 · 逐行归一化</strong><br /><MathFormula tex={`\\mathbf g_{${layer},i}=\\operatorname{RMSNorm}(\\mathbf v_{${layer},i}^c)`} /></Box>}
        </> : <Box tone="blue"><strong>读取源层输出矩阵</strong></Box>}
        <Matrix tex={`G_{${kvSource}}`} shape={`M\\times512,\\;M=\\lfloor N/${ratio}\\rfloor`} rowTex={(row) => `\\mathbf g_{${kvSource},${row}}`} elementTex={(row, column) => `g_{${kvSource},${row},${column}}`} vectorLength="512" tone="green" />
      </div>
    </div>;
  }

  if (kind === "indexer") {
    const kvSource = globalKvSourceLayer(layer)!;
    const indexSource = globalIndexSourceLayer(layer)!;
    const writesIndex = mode === "full" || mode === "reindex";
    return <div style={{ ...panel, borderColor: COLORS.amber }}>
      <Handle id="query" type="target" position={Position.Top} style={{ ...handle, left: "30%", background: COLORS.blue }} />
      <Handle id="global-matrix" type="target" position={Position.Top} style={{ ...handle, left: "70%" }} />
      <Handle id="matrix" type="source" position={Position.Bottom} style={{ ...handle, left: "30%" }} />
      <Handle id="indices" type="source" position={Position.Bottom} style={{ ...handle, left: "70%", background: COLORS.amber }} />
      <Title>{writesIndex ? <>Top-512 行选择 · Layer {layer} Indexer</> : <>复用 Layer {indexSource} 已算出的 Top-512 行号</>}</Title>
      <div style={{ padding: 10, display: "grid", gap: 7, fontSize: 11, minWidth: 0 }}>
        {writesIndex ? <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}><Box tone="blue"><MathFormula tex={`Q_{${layer}}^r\\in\\mathbb{R}^{N\\times1280}`} /></Box><Box tone="blue"><MathFormula tex={`X_{${layer}}\\in\\mathbb{R}^{N\\times5120}`} /></Box><Box tone="green"><MathFormula tex={`G_{${kvSource}}\\in\\mathbb{R}^{M\\times512}`} /></Box></div>
          <Arrow vertical />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}><Box><MathFormula tex={`Q_{${layer}}^I=Q_{${layer}}^rW_{${layer}}^{IQ}`} /><br /><MathFormula tex="N\times32\times128" /></Box><Box><MathFormula tex={`\\omega_{${layer}}=X_{${layer}}W_{${layer}}^{IW}`} /><br /><MathFormula tex="N\times32" /></Box><Box><MathFormula tex={`K_{${kvSource}}^I=G_{${kvSource}}W_{${kvSource}}^{IK}`} /><br /><MathFormula tex="M\times128" /></Box></div>
          <Arrow vertical />
          <Box tone="amber"><MathFormula tex={`S_{${layer}}=\\sum_{h=1}^{32}\\omega_{${layer},h}\\operatorname{ReLU}(Q_{${layer},h}^I(K_{${kvSource}}^I)^{\\mathsf T}/\\sqrt{128})\\in\\mathbb{R}^{N\\times M}`} /></Box>
        </> : <Box tone="blue"><strong>复用 Layer {indexSource} 得分矩阵</strong><br /><MathFormula tex={`S_{${indexSource}}\\in\\mathbb{R}^{N\\times M}`} /></Box>}
        <Arrow vertical />
        <Box tone="amber"><MathFormula tex={`K_{${indexSource},t}=\\min(512,\\lfloor t/${compressionRatioForLayer(kvSource)}\\rfloor)`} /><br /><MathFormula tex={`I_{${indexSource},t}=\\operatorname{TopK}(S_{${indexSource}}[t,:],K_{${indexSource},t})\\in\\mathbb{N}^{K_{${indexSource},t}}`} /><br />输出：最多 512 个行号</Box>
      </div>
    </div>;
  }

  if (kind === "global-select") {
    const kvSource = globalKvSourceLayer(layer)!;
    const indexSource = globalIndexSourceLayer(layer)!;
    return <div style={{ ...panel, borderColor: COLORS.green }}>
      <Handle id="matrix" type="target" position={Position.Top} style={{ ...handle, left: "30%" }} />
      <Handle id="indices" type="target" position={Position.Top} style={{ ...handle, left: "70%", background: COLORS.amber }} />
      <Handle id="selected" type="source" position={Position.Bottom} style={handle} />
      <Title>把 <MathFormula tex={`I_{${indexSource},t}`} /> 中的 <MathFormula tex={`K_{${indexSource},t}\\le512`} /> 个行号，在 <MathFormula tex={`G_{${kvSource}}\\in\\mathbb{R}^{M\\times512}`} /> 中逐行高亮</Title>
      <div style={{ padding: 10, display: "grid", gridTemplateColumns: "1.55fr 34px .8fr", alignItems: "center", gap: 10, minWidth: 0 }}>
        <SelectedGlobalRows kvSource={kvSource} indexSource={indexSource} />
        <Arrow />
        <div style={{ minWidth: 0, display: "grid", gap: 9 }}>
          <Box tone="green"><MathFormula tex={`G_{${kvSource},t}^{\\mathrm{selected}}`} /><span style={{ display: "block", fontSize: 10 }}><MathFormula tex={`K_{${indexSource},t}\\times512`} /></span></Box>
          {/* [OM-FREEPLAY] 3、7、12 是说明索引与行向量对应关系的示例行号。 */}
          <div data-selection-example style={{ display: "grid", gap: 5, fontSize: 10, color: COLORS.green }}>
            <strong>例：选中行号 3、7、12</strong>
            {[3, 7, 12].map(row => <VectorStrip key={row} name={`\\mathbf g_{${kvSource},${row}}`} length="512" nameWidth={42} elementTex={column => `g_{${kvSource},${row},${column}}`} tone="green" selected compact />)}
          </div>
        </div>
      </div>
    </div>;
  }

  if (kind === "kv-merge") {
    const kvSource = globalKvSourceLayer(layer);
    const indexSource = globalIndexSourceLayer(layer);
    const hasGlobal = kvSource !== null && indexSource !== null;
    return <div style={{ ...panel, borderColor: COLORS.green }}>
      <Handle id="local" type="target" position={Position.Top} style={{ ...handle, left: hasGlobal ? "30%" : "50%" }} />
      {hasGlobal && <Handle id="global" type="target" position={Position.Top} style={{ ...handle, left: "70%" }} />}
      <Handle id="kv" type="source" position={Position.Bottom} style={handle} />
      <Title>{hasGlobal ? "沿 KV 行维拼接：本地窗口 + 选中的全局行" : "SWA-only：Head 只读取本地窗口"}</Title>
      <div style={{ padding: 10, display: "grid", gridTemplateColumns: hasGlobal ? "1fr 30px 1fr 30px 1.3fr" : "1fr 30px 1.3fr", alignItems: "center", gap: 6, minWidth: 0 }}>
        <Box tone="green"><MathFormula tex={`U_{${layer},t}^{\\mathrm{SWA}}`} /><br /><MathFormula tex="\min(128,t)\times512" /></Box><Arrow />
        {hasGlobal && <><Box tone="green"><MathFormula tex={`G_{${kvSource},t}^{\\mathrm{selected}}`} /><br /><MathFormula tex={`K_{${indexSource},t}\\times512`} /></Box><Arrow /></>}
        <Box tone="green"><MathFormula tex={hasGlobal ? `\\mathrm{KV}_{${layer},t}=[U_{${layer},t}^{\\mathrm{SWA}};G_{${kvSource},t}^{\\mathrm{selected}}]` : `\\mathrm{KV}_{${layer},t}=U_{${layer},t}^{\\mathrm{SWA}}`} /><br />{hasGlobal && <MathFormula tex={`(\\min(128,t)+K_{${indexSource},t})\\times512`} />}</Box>
      </div>
    </div>;
  }

  if (kind === "heads") {
    return <div style={panel}><Handle id="query" type="target" position={Position.Top} style={{ ...handle, left: "30%", background: COLORS.blue }} /><Handle id="kv" type="target" position={Position.Top} style={{ ...handle, left: "70%" }} /><Handle id="main-out" type="source" position={Position.Bottom} style={handle} /><Title>Layer {layer} · 64 Heads · <MathFormula tex={`\\mathbf q_{${layer},h,t}`} /> + <MathFormula tex={`\\mathrm{KV}_{${layer},t}`} /></Title><div style={{ padding: 10, display: "grid", gridTemplateColumns: "1fr 1fr 64px 1fr", gap: 8 }}><Head index={1} layer={layer} /><Head index={2} layer={layer} /><div style={{ display: "grid", placeItems: "center", color: COLORS.faint, fontSize: 26 }}>⋯</div><Head index={64} layer={layer} /></div></div>;
  }

  if (kind === "concat") {
    return <div style={panel}>{both}<Title>Layer {layer} · 沿列拼接 64 个 Head 的输出矩阵，再投影到 5120 维</Title>
      <div style={{ padding: 9, display: "grid", gridTemplateColumns: "2.2fr 26px .85fr 26px 1.05fr", alignItems: "center", gap: 6 }}>
        <div style={{ border: `1.4px solid ${COLORS.green}`, borderRadius: 8, padding: 6, background: COLORS.greenSoft, display: "grid", gap: 5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}><MathFormula tex={`O_{${layer}}^{\\mathrm{cat}}`} /><MathFormula tex="N\times(64\cdot512)" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr .45fr 1fr", gap: 4 }}>
            {[1, 2].map(head => <RowMatrix key={head} tex={`O_{${layer},${head}}`} shape="N\times512" rows={[`\\mathbf o_{${layer},${head},1}`, `\\mathbf o_{${layer},${head},2}`, "\\vdots", `\\mathbf o_{${layer},${head},N}`]} />)}<span style={{ display: "grid", placeItems: "center" }}><MathFormula tex="\cdots" /></span><RowMatrix tex={`O_{${layer},64}`} shape="N\times512" rows={[`\\mathbf o_{${layer},64,1}`, `\\mathbf o_{${layer},64,2}`, "\\vdots", `\\mathbf o_{${layer},64,N}`]} />
          </div>
        </div>
        <Operator tex="\times" />
        <div data-output-projection-weight style={{ minWidth: 0, border: `1.2px solid ${COLORS.blue}`, borderRadius: 7, padding: 6, background: COLORS.blueSoft, display: "grid", gap: 7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 5 }}><MathFormula tex={`W_{${layer}}^O`} /><span style={{ fontSize: 9 }}><MathFormula tex="(64\cdot512)\times5120" /></span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr .45fr 1fr", gap: 4, alignItems: "center", textAlign: "center", fontSize: 10 }}>
            {["1", "2", "\\cdots", "5120"].map(column => column === "\\cdots" ? <MathFormula key={column} tex={column} /> : <div key={column} data-weight-column={column} style={{ minWidth: 0, padding: "24px 2px", border: `1px solid ${COLORS.blue}`, borderRadius: 4, background: COLORS.blueSoft }}><MathFormula tex={`\\mathbf w_{${layer},${column}}^O`} /></div>)}
          </div>
        </div>
        <Operator tex="=" />
        <RowMatrix tex={`O_{${layer}}`} shape="N\times5120" rows={[`\\mathbf o_{${layer},1}`, `\\mathbf o_{${layer},2}`, "\\vdots", `\\mathbf o_{${layer},N}`]} rowLength="5120" elementTex={(row, column) => `o_{${layer},${["1", "2", "", "N"][row]},${column}}`} />
      </div>
    </div>;
  }

  if (kind === "add1" || kind === "add2") {
    return <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: `3px solid ${COLORS.amber}`, background: COLORS.amberSoft, display: "grid", placeItems: "center", fontSize: 28, color: COLORS.amber, fontWeight: 900 }}><Handle id="main-in" type="target" position={Position.Top} style={handle} /><Handle id="skip" type="target" position={Position.Left} style={{ ...handle, background: COLORS.amber }} /><Handle id="main-out" type="source" position={Position.Bottom} style={handle} />+</div>;
  }

  if (kind === "state1") {
    return <div style={{ ...panel, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 800 }}><Handle id="main-in" type="target" position={Position.Top} style={handle} /><Handle id="main" type="source" position={Position.Bottom} style={handle} /><Handle id="residual" type="source" position={Position.Left} style={{ ...handle, background: COLORS.amber }} /><MathFormula tex={`H_{${layer}}'=H_{${layer}}^{\\mathrm{in}}+O_{${layer}}`} /></div>;
  }

  if (kind === "moe-input") {
    return <div style={{ ...panel, display: "grid", placeItems: "center", borderColor: COLORS.blue, background: COLORS.blueSoft, fontSize: 20, fontWeight: 800 }}><Handle id="main-in" type="target" position={Position.Top} style={handle} /><Handle id="router" type="source" position={Position.Bottom} style={handle} /><Handle id="shared" type="source" position={Position.Left} style={{ ...handle, background: COLORS.blue }} /><MathFormula tex={`Y_{${layer}}`} /></div>;
  }

  if (kind === "router") {
    return <div style={panel}>
      <Handle id="main-in" type="target" position={Position.Top} style={handle} />
      <Handle id="main-out" type="source" position={Position.Bottom} style={{ ...handle, background: COLORS.amber }} />
      <Title>Layer {layer} Router · 只选择 routed experts</Title>
      <div style={{ padding: 10, display: "grid", gridTemplateColumns: "1.2fr 26px 1.4fr 26px .8fr", alignItems: "center", gap: 7 }}>
        <RowMatrix tex={`Y_{${layer}}`} shape="N\times5120" rows={[`\\mathbf y_{${layer},1}`, `\\mathbf y_{${layer},2}`, "\\vdots", `\\mathbf y_{${layer},N}`]} tone="blue" rowLength="5120" elementTex={(row, column) => `y_{${layer},${["1", "2", "", "N"][row]},${column}}`} />
        <Operator tex="\times" />
        <div style={{ minWidth: 0, border: `1.3px solid ${COLORS.amber}`, background: COLORS.amberSoft, borderRadius: 7, padding: 7, display: "grid", gap: 6, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}><MathFormula tex={`W_{${layer}}^R`} /><span style={{ fontSize: 10 }}><MathFormula tex="5120\times384" /></span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr .45fr 1fr", gap: 5, fontSize: 10, alignItems: "center" }}>
            {["1", "2", "\\cdots", "384"].map(expert => expert === "\\cdots" ? <MathFormula key={expert} tex={expert} /> : <div key={expert} style={{ border: `1px solid ${COLORS.amber}`, borderRadius: 4, padding: "22px 2px" }}><MathFormula tex={`\\mathbf w_{${layer},${expert}}^R`} /></div>)}
          </div>
        </div>
        <Operator tex="=" />
        <div style={{ position: "relative", minWidth: 0, minHeight: 64, display: "grid", placeItems: "center", padding: "18px 7px 7px", border: `1.3px solid ${COLORS.green}`, borderRadius: 7, background: COLORS.greenSoft }}>
          <span style={{ position: "absolute", top: 5, right: 6, fontSize: 9 }}><MathFormula tex="N\times384" /></span>
          <MathFormula tex={`S_{${layer}}`} />
        </div>
      </div>
    </div>;
  }

  if (kind === "scores") {
    const scoreCell = (column: number, row: string) => {
      const expert = row === "t" ? ROUTED_EXPERTS.find(item => item.id === column) : undefined;
      const columnIndex = ROUTER_SCORE_COLUMNS.indexOf(column as typeof ROUTER_SCORE_COLUMNS[number]);
      // [OM-FREEPLAY] 未选分数沿用原矩阵示意，均低于第六名 .64。
      const dimScore = [".12", ".23", ".35", ".18"][columnIndex % 4];
      return <div data-topk-selected={Boolean(expert)} data-expert-column={column} data-token-row={row} style={{ position: "relative", width: "100%", maxWidth: 100, boxSizing: "border-box", padding: "5px 2px", border: `1px solid ${expert ? COLORS.amber : COLORS.blue}`, borderRadius: 4, background: expert ? COLORS.amberSoft : COLORS.blueSoft, color: expert ? COLORS.amber : COLORS.muted, opacity: expert ? 1 : .4, fontWeight: expert ? 800 : 400 }}>
        <MathFormula tex={row === "t" ? expert?.score ?? dimScore : `s_{${layer},${row},${column}}`} />
        {expert && <Handle id={`score-${expert.id}`} type="source" position={Position.Bottom} style={{ ...handle, bottom: 5, background: COLORS.amber }} />}
      </div>;
    };
    return <div style={{ ...panel, borderColor: COLORS.amber }}>
      <Handle id="main-in" type="target" position={Position.Top} style={{ ...handle, background: COLORS.amber }} />
      <Title>Router 得分矩阵 · 第 <MathFormula tex="t" /> 行 Top-6 高亮 · 数值为示意</Title>
      <div data-router-score-matrix style={{ padding: "7px 0", borderTop: `1px solid ${COLORS.blue}`, borderBottom: `1px solid ${COLORS.blue}`, background: COLORS.blueSoft, display: "grid", gap: 4 }}>
        <div style={{ padding: "0 10px", display: "flex", justifyContent: "space-between", fontSize: 11 }}><MathFormula tex={`S_{${layer}}`} /><MathFormula tex="N\times384" /></div>
        {["", "1", "2", "\\vdots", "t", "\\vdots", "N"].map((row, rowIndex) => row === "\\vdots" ? <div key={rowIndex} style={{ textAlign: "center", fontSize: 9 }}><MathFormula tex="\vdots" /></div> : <div key={rowIndex} style={{ padding: `0 ${EXPERTS_PADDING}px`, display: "grid", gridTemplateColumns: `${SHARED_GROUP_WIDTH}px minmax(0,1fr)`, gap: EXPERT_GROUP_GAP, alignItems: "center", textAlign: "center", fontSize: 9 }}>
          <div style={{ display: "grid", gridTemplateColumns: "32px repeat(3,minmax(0,1fr)) 24px", gap: 8, alignItems: "center" }}>
            <MathFormula tex={row} />{[1, 2, 3].map(column => <React.Fragment key={column}>{row ? scoreCell(column, row) : column}</React.Fragment>)}<MathFormula tex="\cdots" />
          </div>
          <div style={{ padding: `0 ${EXPERT_GROUP_INSET}px`, display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: EXPERT_CARD_GAP }}>
            {ROUTED_EXPERTS.map((expert, index) => <div key={expert.id} style={{ position: "relative", display: "grid", justifyItems: "center", minWidth: 0 }}>
              {row ? scoreCell(expert.id, row) : expert.id}
              {index < ROUTED_EXPERTS.length - 1 ? <span style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}><MathFormula tex="\cdots" /></span> : <div style={{ position: "absolute", right: 0, top: "50%", width: 68, transform: "translateY(-50%)" }}>{row ? scoreCell(384, row) : 384}</div>}
            </div>)}
          </div>
        </div>)}
      </div>
    </div>;
  }

  if (kind === "experts") {
    return <div style={panel}>
      {ROUTED_EXPERTS.map((expert, index) => <Handle key={expert.id} id={`expert-${expert.id}`} type="target" position={Position.Top} style={{ ...handle, left: `${ROUTED_HANDLE_LEFT[index]}%`, background: COLORS.amber }} />)}
      <Handle id="shared" type="target" position={Position.Left} style={{ ...handle, top: "50%", background: COLORS.blue }} />
      <Handle id="shared-out" type="source" position={Position.Bottom} style={{ ...handle, left: `${SHARED_HANDLE_LEFT}%`, background: COLORS.blue }} />
      {ROUTED_EXPERTS.map((expert, index) => <Handle key={expert.id} id={`expert-out-${expert.id}`} type="source" position={Position.Bottom} style={{ ...handle, left: `${ROUTED_HANDLE_LEFT[index]}%`, background: COLORS.amber }} />)}
      <Title>Layer {layer} · 专家层 · 得分为示意</Title>
      <div style={{ padding: EXPERTS_PADDING, display: "grid", gridTemplateColumns: `${SHARED_GROUP_WIDTH}px minmax(0,1fr)`, gap: EXPERT_GROUP_GAP, alignItems: "start" }}>
        <section data-expert-group="shared" style={{ minWidth: 0, display: "grid", gap: 10 }}>
          <strong style={{ color: COLORS.blue, fontSize: 14 }}>共享专家 · 直接接收 <MathFormula tex={`Y_{${layer}}`} /></strong>
          <Expert layer={layer} shared />
        </section>
        <section data-expert-group="routed" style={{ minWidth: 0, padding: EXPERT_GROUP_INSET - 1, border: `1px solid ${COLORS.amber}`, borderRadius: 10, display: "grid", gap: 10 }}>
          <strong style={{ color: COLORS.amber, fontSize: 14 }}>非共享专家 · Router Top-6</strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: EXPERT_CARD_GAP }}>{ROUTED_EXPERTS.map(expert => <Expert key={expert.id} layer={layer} index={expert.id} score={expert.score} />)}</div>
          <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 8, display: "grid", gridTemplateColumns: "260px repeat(3,minmax(0,1fr)) 50px minmax(0,1fr)", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: COLORS.muted }}>其余 378 个专家<br />分数较低 · 本次跳过</span>
            {/* [OM-FREEPLAY] 未选专家沿用得分矩阵中的示意值，均低于本次第六名 .64。 */}
            {[{ id: 1, score: ".12" }, { id: 2, score: ".23" }, { id: 3, score: ".35" }, { id: 384, score: ".12" }].map((expert, index) => <React.Fragment key={expert.id}>
              {index === 3 && <span style={{ textAlign: "center", color: COLORS.faint }}>⋯</span>}
              <div data-inactive-expert={expert.id} aria-label={`Expert ${expert.id} 未选中，本次跳过`} style={{ opacity: .45, border: `1px solid ${COLORS.muted}`, background: COLORS.blueSoft, borderRadius: 7, padding: "8px 12px", display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12 }}><span>Expert {expert.id}</span><MathFormula tex={`s_{${layer},${expert.id}}=${expert.score}`} /></div>
            </React.Fragment>)}
          </div>
        </section>
      </div>
    </div>;
  }

  if (kind === "aggregate") {
    return <div style={panel}>
      <Handle id="shared" type="target" position={Position.Top} style={{ ...handle, left: `${SHARED_HANDLE_LEFT}%`, background: COLORS.blue }} />
      {ROUTED_EXPERTS.map((expert, index) => <Handle key={expert.id} id={`weighted-${expert.id}`} type="target" position={Position.Top} style={{ ...handle, left: `${ROUTED_HANDLE_LEFT[index]}%`, background: COLORS.amber }} />)}
      <Handle id="main-out" type="source" position={Position.Bottom} style={handle} />
      <Title>各专家输出向量分别加权</Title><div style={{ padding: EXPERTS_PADDING, display: "grid", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: `${SHARED_GROUP_WIDTH}px minmax(0,1fr)`, gap: EXPERT_GROUP_GAP }}>
        <Box tone="blue"><MathFormula tex={`1\\cdot E_{${layer},\\mathrm{shared}}(Y_{${layer}})`} /></Box>
        <div style={{ padding: `0 ${EXPERT_GROUP_INSET}px`, display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: EXPERT_CARD_GAP }}>{ROUTED_EXPERTS.map(expert => <Box key={expert.id} tone="amber"><MathFormula tex={`g_{${layer},${expert.id}}\\cdot E_{${layer},${expert.id}}(Y_{${layer}})`} /></Box>)}</div>
      </div>
    </div></div>;
  }

  if (kind === "moe-sum") {
    return <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: `3px solid ${COLORS.green}`, background: COLORS.greenSoft, display: "grid", placeItems: "center", fontSize: 22, color: COLORS.green, fontWeight: 900 }}><Handle id="main-in" type="target" position={Position.Top} style={handle} /><Handle id="main-out" type="source" position={Position.Bottom} style={handle} /><MathFormula tex="\sum" /></div>;
  }

  if (kind === "moe-output") {
    return <div style={{ ...panel, display: "grid", placeItems: "center", borderColor: COLORS.green, background: COLORS.greenSoft, fontSize: 16, fontWeight: 800 }}><Handle id="main-in" type="target" position={Position.Top} style={handle} /><Handle id="main-out" type="source" position={Position.Bottom} style={handle} /><MathFormula tex={`O_{${layer}}^{\\mathrm{FFN}}\\in\\mathbb{R}^{N\\times5120}`} /></div>;
  }

  return <div style={panel}>{both}<Title><MathFormula tex={`H_{${layer}}^{\\mathrm{out}}`} /></Title></div>;
}

function DiagramNodeView({ data, selected }: NodeProps<DiagramNode>) {
  const compact = data.kind === "add1" || data.kind === "add2" || data.kind === "moe-sum";
  const portColor = data.tone === "amber" ? COLORS.amber : data.tone === "blue" ? COLORS.blue : COLORS.green;
  const minimumWidth = compact ? 60 : data.kind === "structure-operator" ? 36 : 100;
  const minimumHeight = compact
    ? 60
    : data.matrixRows?.length
      ? 180
      : data.kind === "structure-group"
        ? 120
        : data.title
          ? 96
          : 40;
  return <div data-boundary-connectable={data.kind !== "structure-operator"} data-frame-selected={Boolean(selected)} style={{ width: "100%", height: "100%", position: "relative", borderRadius: compact ? "50%" : 12, outline: selected ? `3px solid ${COLORS.blue}` : undefined, outlineOffset: 2, boxShadow: selected ? "0 0 0 6px rgba(102,124,150,.16)" : undefined }}>
    <EightResizeHandles minWidth={minimumWidth} minHeight={minimumHeight} />
    <EightConnectionPorts color={portColor} />
    <DiagramNodeContent data={data} />
  </div>;
}

const NodeView = memo(DiagramNodeView);
const nodeTypes = { diagram: NodeView };
const edgeTypes = { "editable-orthogonal": EditableOrthogonalEdge };

function node(id: string, kind: NodeKind, layer: number, mode: LayerMode, x: number, y: number, width: number, height: number): DiagramNode {
  return { id, type: "diagram", position: { x, y }, data: { kind, layer, mode }, style: { width, height }, deletable: false };
}

function structureNode({
  id,
  parentId,
  layer,
  mode,
  x,
  y,
  width,
  height,
  kind = "structure",
  ...data
}: {
  id: string;
  parentId: string;
  layer: number;
  mode: LayerMode;
  x: number;
  y: number;
  width: number;
  height: number;
  kind?: "structure" | "structure-group" | "structure-operator";
  title?: string;
  tex?: string;
  subtitle?: string;
  tone?: DiagramTone;
  matrixRows?: string[];
  matrixRowCells?: string[][];
  vectorCells?: string[];
  columnVectors?: boolean;
  matrixSelectedRow?: number;
}): DiagramNode {
  return {
    id,
    type: "diagram",
    parentId,
    extent: "parent",
    expandParent: true,
    position: { x, y },
    data: { kind, layer, mode, ...data },
    style: { width, height },
    deletable: false,
  };
}

function buildGraph(layer: number): { nodes: DiagramNode[]; edges: EditableEdge[] } {
  const mode = modeForLayer(layer);
  const hasGlobal = mode !== "swa";
  const mainGap = architectureFanoutGap(3);
  const inputY = 0;
  const tensorHeight = 270;
  const norm1Y = inputY + tensorHeight + 55;
  const projectionY = norm1Y + 72 + mainGap;
  const queryProjectionHeight = 670;
  const localKvProjectionHeight = 440;
  const swaHeight = 530;
  const compressorHeight = mode === "full" && compressionRatioForLayer(layer) === 2 ? 720 : 450;
  const indexerHeight = 450;
  const globalSelectHeight = 330;
  const sourceRowHeight = hasGlobal
    ? Math.max(queryProjectionHeight, localKvProjectionHeight, compressorHeight)
    : Math.max(queryProjectionHeight, localKvProjectionHeight);
  const swaY = projectionY + sourceRowHeight + mainGap;
  const globalSelectY = swaY + indexerHeight + mainGap;
  const mergeY = hasGlobal ? Math.max(swaY + swaHeight, globalSelectY + globalSelectHeight) + mainGap : swaY + swaHeight + mainGap;
  const mergeHeight = 200;
  const headsY = mergeY + mergeHeight + mainGap;
  const headsHeight = 374;
  const concatY = headsY + headsHeight + mainGap;
  const concatHeight = 260;
  const add1Y = concatY + concatHeight + mainGap;
  const state1Y = add1Y + 70 + mainGap;
  const norm2Y = state1Y + 72 + mainGap;
  const moeInputY = norm2Y + 72 + mainGap;
  const routerY = moeInputY + 80 + mainGap;
  const routerHeight = 240;
  const scoresY = routerY + routerHeight + mainGap;
  const scoresHeight = 320;
  const expertsY = scoresY + scoresHeight + mainGap;
  const expertsHeight = 520;
  const aggregateY = expertsY + expertsHeight + mainGap;
  const moeSumY = aggregateY + 125 + mainGap;
  const moeOutputY = moeSumY + 70 + mainGap;
  const add2Y = moeOutputY + 72 + mainGap;
  const outputY = add2Y + 70 + mainGap;
  const nodes: DiagramNode[] = [
    node("input", "tensor", layer, mode, 610, inputY, 380, tensorHeight),
    node("norm1", "norm1", layer, mode, 620, norm1Y, 360, 72),
    node("q", "projection-q", layer, mode, 20, projectionY, 800, queryProjectionHeight),
    node("kv", "projection-kv", layer, mode, 920, projectionY, 500, localKvProjectionHeight),
    node("swa-window", "swa-window", layer, mode, hasGlobal ? 40 : 350, swaY, hasGlobal ? 780 : 900, swaHeight),
    node("kv-merge", "kv-merge", layer, mode, hasGlobal ? 300 : 400, mergeY, hasGlobal ? 1000 : 800, mergeHeight),
    node("heads", "heads", layer, mode, 40, headsY, 1900, headsHeight),
    node("concat", "concat", layer, mode, 190, concatY, 1140, concatHeight),
    node("add1", "add1", layer, mode, 765, add1Y, 70, 70),
    node("state1", "state1", layer, mode, 620, state1Y, 360, 72),
    node("norm2", "norm2", layer, mode, 620, norm2Y, 360, 72),
    node("moe-input", "moe-input", layer, mode, 715, moeInputY, 170, 80),
    node("router", "router", layer, mode, 380, routerY, 840, routerHeight),
    node("scores", "scores", layer, mode, 70, scoresY, EXPERTS_WIDTH, scoresHeight),
    node("experts", "experts", layer, mode, 70, expertsY, EXPERTS_WIDTH, expertsHeight),
    node("aggregate", "aggregate", layer, mode, 70, aggregateY, EXPERTS_WIDTH, 125),
    node("moe-sum", "moe-sum", layer, mode, 765, moeSumY, 70, 70),
    node("moe-output", "moe-output", layer, mode, 620, moeOutputY, 360, 72),
    node("add2", "add2", layer, mode, 765, add2Y, 70, 70),
    node("output", "output", layer, mode, 610, outputY, 380, tensorHeight),
  ];
  nodes.push(
    { ...node("swa-result", "swa-output", layer, mode, 10, 414, ((hasGlobal ? 780 : 900) - 56) * 1.7 / 2.6, 82), parentId: "swa-window", extent: "parent" },
    structureNode({ id: "q-x", parentId: "q", layer, mode, x: 28, y: 68, width: 200, height: 170, title: "输入矩阵", tex: `X_{${layer}}\\in\\mathbb R^{N\\times5120}`, matrixRows: [`\\mathbf x_{${layer},1}`, `\\mathbf x_{${layer},2}`, "\\vdots", `\\mathbf x_{${layer},N}`], tone: "blue" }),
    structureNode({ id: "q-mul-down", parentId: "q", layer, mode, x: 236, y: 131, width: 36, height: 44, kind: "structure-operator", tex: "\\times" }),
    structureNode({ id: "q-wdown", parentId: "q", layer, mode, x: 280, y: 89, width: 230, height: 128, title: "5120 × 1280 · 列向量", tex: `W_{${layer}}^{Q\\downarrow}`, columnVectors: true, vectorCells: [`\\mathbf w_{${layer},1}^{Q\\downarrow}`, `\\mathbf w_{${layer},2}^{Q\\downarrow}`, "\\cdots", `\\mathbf w_{${layer},1280}^{Q\\downarrow}`], tone: "amber" }),
    structureNode({ id: "q-equals-down", parentId: "q", layer, mode, x: 518, y: 131, width: 36, height: 44, kind: "structure-operator", tex: "=" }),
    structureNode({ id: "q-low-rank", parentId: "q", layer, mode, x: 562, y: 68, width: 210, height: 174, title: "低秩矩阵", tex: `Q_{${layer}}^{r}\\in\\mathbb R^{N\\times1280}`, matrixRows: [`\\mathbf q_{${layer},1}^{r}`, `\\mathbf q_{${layer},2}^{r}`, "\\vdots", `\\mathbf q_{${layer},N}^{r}`], tone: "green" }),
    structureNode({ id: "q-low-rank-up", parentId: "q", layer, mode, x: 28, y: 274, width: 200, height: 174, title: "同一低秩矩阵", tex: `Q_{${layer}}^{r}`, matrixRows: [`\\mathbf q_{${layer},1}^{r}`, `\\mathbf q_{${layer},2}^{r}`, "\\vdots", `\\mathbf q_{${layer},N}^{r}`], tone: "green" }),
    structureNode({ id: "q-mul-up", parentId: "q", layer, mode, x: 236, y: 337, width: 36, height: 44, kind: "structure-operator", tex: "\\times" }),
    structureNode({ id: "q-wup", parentId: "q", layer, mode, x: 280, y: 295, width: 230, height: 128, title: "1280 × (64 · 512) · 列向量", tex: `W_{${layer}}^{Q\\uparrow}`, columnVectors: true, vectorCells: [`\\mathbf w_{${layer},1}^{Q\\uparrow}`, `\\mathbf w_{${layer},2}^{Q\\uparrow}`, "\\cdots", `\\mathbf w_{${layer},64\\cdot512}^{Q\\uparrow}`], tone: "amber" }),
    structureNode({ id: "q-equals-up", parentId: "q", layer, mode, x: 518, y: 337, width: 36, height: 44, kind: "structure-operator", tex: "=" }),
    structureNode({
      id: "q-wide-matrix",
      parentId: "q",
      layer,
      mode,
      x: 562,
      y: 274,
      width: 210,
      height: 220,
      title: "升维输出矩阵",
      tex: `\\widetilde Q_{${layer}}\\in\\mathbb R^{N\\times(64\\cdot512)}`,
      tone: "green",
      matrixRows: [`\\mathbf{\\widetilde q}_{${layer},1}`, `\\mathbf{\\widetilde q}_{${layer},2}`, "\\vdots", `t\\quad\\mathbf{\\widetilde q}_{${layer},t}`, "\\vdots", `\\mathbf{\\widetilde q}_{${layer},N}`],
      matrixSelectedRow: 3,
    }),
    structureNode({ id: "q-head-slice", parentId: "q", layer, mode, x: 28, y: 534, width: 744, height: 120, kind: "structure-group", tex: `\\mathbf{\\widetilde q}_{${layer},t}`, title: "64 个连续分块 · 每块 512 维", tone: "green" }),
    structureNode({ id: "q-head-1", parentId: "q-head-slice", layer, mode, x: 12, y: 42, width: 210, height: 64, title: "Head 1 · 元素 1–512", tex: `\\mathbf q_{${layer},1,t}`, tone: "green" }),
    structureNode({ id: "q-head-2", parentId: "q-head-slice", layer, mode, x: 234, y: 42, width: 210, height: 64, title: "Head 2 · 元素 513–1024", tex: `\\mathbf q_{${layer},2,t}`, tone: "green" }),
    structureNode({ id: "q-head-more", parentId: "q-head-slice", layer, mode, x: 451, y: 52, width: 36, height: 44, kind: "structure-operator", tex: "\\cdots" }),
    structureNode({ id: "q-head-64", parentId: "q-head-slice", layer, mode, x: 496, y: 42, width: 234, height: 64, title: "Head 64 · 元素 32257–32768", tex: `\\mathbf q_{${layer},64,t}`, tone: "green" }),
  );
  if (hasGlobal) {
    nodes.push(node("compressor", "compressor", layer, mode, 1450, projectionY, 480, compressorHeight));
    nodes.push(node("indexer", "indexer", layer, mode, 1160, swaY, 700, indexerHeight));
    nodes.push(node("global-select", "global-select", layer, mode, 1160, globalSelectY, 700, globalSelectHeight));
  }

  const makeEdge = (id: string, source: string, target: string, labelTex?: string, extra?: Partial<EditableEdge>): EditableEdge => {
    const base: EditableEdge = {
      id,
      source,
      target,
      sourceHandle: "main-out",
      targetHandle: "main-in",
      type: "editable-orthogonal",
      reconnectable: true,
      markerEnd: { type: MarkerType.Arrow, width: 22, height: 22, color: COLORS.green },
      style: { stroke: COLORS.green, strokeWidth: 2.2 },
      data: { labelTex },
    };
    return {
      ...base,
      ...extra,
      type: "editable-orthogonal",
      style: { ...base.style, ...extra?.style },
      data: { ...base.data, ...extra?.data },
    };
  };
  const mathEdge = (id: string, source: string, target: string, tex: string, extra?: Partial<EditableEdge>) => makeEdge(id, source, target, tex, extra);
  const inputResidualWaypoints = [{ x: -30, y: inputY + tensorHeight / 2 }, { x: -30, y: add1Y + 35 }];
  const ffnResidualWaypoints = [{ x: 30, y: state1Y + 36 }, { x: 30, y: add2Y + 35 }];
  const skipStyle = { style: { stroke: COLORS.amber, strokeWidth: 2.2 }, data: { color: COLORS.amber }, markerEnd: { type: MarkerType.Arrow, width: 22, height: 22, color: COLORS.amber } } as Partial<EditableEdge>;

  const edges: EditableEdge[] = [
    makeEdge("input-norm", "input", "norm1", undefined, { sourceHandle: "main" }),
    mathEdge("norm-q", "norm1", "q", `X_{${layer}}`, { sourceHandle: "query", targetHandle: "port-top" }),
    mathEdge("norm-kv", "norm1", "kv", `X_{${layer}}`, { sourceHandle: "local-kv" }),
    mathEdge("q-heads", "q", "heads", `\\mathbf q_{${layer},h,t}`, { sourceHandle: "port-bottom", targetHandle: "query" }),
    mathEdge("kv-swa", "kv", "swa-window", `U_{${layer}}\\in\\mathbb{R}^{N\\times512}`, { sourceHandle: "swa", targetHandle: "projected-kv" }),
    mathEdge("swa-merge", "swa-result", "kv-merge", `U_{${layer},t}^{\\mathrm{SWA}}`, { sourceHandle: "local-window", targetHandle: "local" }),
    mathEdge("merge-heads", "kv-merge", "heads", `\\mathrm{KV}_{${layer},t}`, { sourceHandle: "kv", targetHandle: "kv" }),
    makeEdge("heads-concat", "heads", "concat"),
    mathEdge("concat-add1", "concat", "add1", `O_{${layer}}`),
    mathEdge("input-add1", "input", "add1", `H_{${layer}}^{\\mathrm{in}}`, { sourceHandle: "residual", targetHandle: "skip", ...skipStyle, data: { ...skipStyle.data, waypoints: inputResidualWaypoints } }),
    makeEdge("add1-state", "add1", "state1"),
    makeEdge("state-norm2", "state1", "norm2", undefined, { sourceHandle: "main" }),
    makeEdge("norm2-moe-input", "norm2", "moe-input"),
    makeEdge("moe-input-router", "moe-input", "router", undefined, { sourceHandle: "router" }),
    mathEdge("router-scores", "router", "scores", `S_{${layer}}`),
    makeEdge("moe-input-shared", "moe-input", "experts", undefined, { sourceHandle: "shared", targetHandle: "shared", style: { stroke: COLORS.blue, strokeWidth: 2.2 }, markerEnd: { type: MarkerType.Arrow, width: 22, height: 22, color: COLORS.blue } }),
    makeEdge("aggregate-sum", "aggregate", "moe-sum"),
    makeEdge("sum-moe-output", "moe-sum", "moe-output"),
    mathEdge("moe-output-add2", "moe-output", "add2", `O_{${layer}}^{\\mathrm{FFN}}`),
    mathEdge("state1-add2", "state1", "add2", `H_{${layer}}'`, { sourceHandle: "residual", targetHandle: "skip", ...skipStyle, data: { ...skipStyle.data, waypoints: ffnResidualWaypoints } }),
    makeEdge("add2-output", "add2", "output"),
  ];
  for (const expert of ROUTED_EXPERTS) {
    edges.push(makeEdge(`score-expert-${expert.id}`, "scores", "experts", `g_{${layer},${expert.id}}=${expert.score}`, { sourceHandle: `score-${expert.id}`, targetHandle: `expert-${expert.id}`, style: { stroke: COLORS.amber, strokeWidth: 2 }, markerEnd: { type: MarkerType.Arrow, width: 20, height: 20, color: COLORS.amber } }));
    edges.push(makeEdge(`expert-weight-${expert.id}`, "experts", "aggregate", undefined, { sourceHandle: `expert-out-${expert.id}`, targetHandle: `weighted-${expert.id}`, style: { stroke: COLORS.amber, strokeWidth: 2 }, markerEnd: { type: MarkerType.Arrow, width: 20, height: 20, color: COLORS.amber } }));
  }
  edges.push(makeEdge("shared-weight", "experts", "aggregate", undefined, { sourceHandle: "shared-out", targetHandle: "shared", style: { stroke: COLORS.blue, strokeWidth: 2 }, markerEnd: { type: MarkerType.Arrow, width: 20, height: 20, color: COLORS.blue } }));
  if (hasGlobal) {
    const kvSource = globalKvSourceLayer(layer)!;
    const indexSource = globalIndexSourceLayer(layer)!;
    if (mode === "full") edges.push(mathEdge("norm-compressor", "norm1", "compressor", `X_{${layer}}`, { sourceHandle: "global-kv", targetHandle: "input" }));
    if (mode === "full" || mode === "reindex") edges.push(mathEdge("q-low-rank-indexer", "q-low-rank", "indexer", `Q_{${layer}}^r`, { sourceHandle: "port-right", targetHandle: "query" }));
    edges.push(mathEdge("compressor-indexer", "compressor", "indexer", `G_{${kvSource}}\\in\\mathbb{R}^{M\\times512}`, { sourceHandle: "to-indexer", targetHandle: "global-matrix" }));
    edges.push(mathEdge("indexer-matrix", "indexer", "global-select", `G_{${kvSource}}\\in\\mathbb{R}^{M\\times512}`, { sourceHandle: "matrix", targetHandle: "matrix" }));
    edges.push(mathEdge("indexer-select", "indexer", "global-select", `I_{${indexSource},t}\\in\\mathbb{N}^{K_{${indexSource},t}}`, { sourceHandle: "indices", targetHandle: "indices", style: { stroke: COLORS.amber, strokeWidth: 2.2 }, markerEnd: { type: MarkerType.Arrow, width: 22, height: 22, color: COLORS.amber } }));
    edges.push(mathEdge("select-merge", "global-select", "kv-merge", `G_{${kvSource},t}^{\\mathrm{selected}}`, { sourceHandle: "selected", targetHandle: "global" }));
  }
  return { nodes, edges };
}

type SavedDiagramLayout = {
  nodes: Array<{ id: string; x: number; y: number; width?: number; height?: number }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    data?: EditableEdgeData;
  }>;
};

type DiagramSnapshot = {
  nodes: DiagramNode[];
  edges: EditableEdge[];
};

function cloneSnapshot(nodes: DiagramNode[], edges: EditableEdge[]): DiagramSnapshot {
  return {
    nodes: nodes.map((item) => ({
      ...item,
      position: { ...item.position },
      style: item.style ? { ...item.style } : undefined,
      data: {
        ...item.data,
        matrixRows: item.data.matrixRows ? [...item.data.matrixRows] : undefined,
        matrixRowCells: item.data.matrixRowCells?.map((row) => [...row]),
        vectorCells: item.data.vectorCells ? [...item.data.vectorCells] : undefined,
      },
    })),
    edges: edges.map((item) => ({
      ...item,
      style: item.style ? { ...item.style } : undefined,
      data: item.data ? {
        ...item.data,
        waypoints: item.data.waypoints?.map((point) => ({ ...point })),
      } : undefined,
    })),
  };
}

const editorButton: CSSProperties = {
  border: `1px solid ${COLORS.line}`,
  borderRadius: 7,
  background: COLORS.card,
  color: COLORS.ink,
  padding: "6px 9px",
  fontSize: 11,
  fontWeight: 750,
  cursor: "pointer",
};

function storedDimension(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function applySavedLayout(graph: { nodes: DiagramNode[]; edges: EditableEdge[] }, saved: SavedDiagramLayout) {
  const nodeLayouts = new Map(saved.nodes.map((item) => [item.id, item]));
  const nodes = graph.nodes.map((item) => {
    const layout = nodeLayouts.get(item.id);
    if (!layout) return item;
    return {
      ...item,
      position: { x: layout.x, y: layout.y },
      style: { ...item.style, ...(layout.width ? { width: layout.width } : {}), ...(layout.height ? { height: layout.height } : {}) },
    };
  });
  const baselineEdges = new Map(graph.edges.map((item) => [item.id, item]));
  const nodeIds = new Set(nodes.map((item) => item.id));
  const edges = saved.edges
    .filter((item) => nodeIds.has(item.source) && nodeIds.has(item.target))
    .map((item) => {
      const baseline = baselineEdges.get(item.id);
      return {
        ...(baseline ?? {
          id: item.id,
          type: "editable-orthogonal" as const,
          markerEnd: { type: MarkerType.Arrow, width: 22, height: 22, color: COLORS.green },
          style: { stroke: COLORS.green, strokeWidth: 2.2 },
          reconnectable: true,
        }),
        ...item,
        type: "editable-orthogonal" as const,
        sourceHandle: item.sourceHandle ?? baseline?.sourceHandle ?? "main-out",
        targetHandle: item.targetHandle ?? baseline?.targetHandle ?? "main-in",
        data: { ...baseline?.data, ...item.data },
      } satisfies EditableEdge;
    });
  return { nodes, edges };
}

function DiagramCanvas({ layer }: { layer: number }) {
  const initialGraph = useMemo(() => buildGraph(layer), [layer]);
  const [nodes, setNodes, onNodesChange] = useNodesState<DiagramNode>(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EditableEdge>(initialGraph.edges);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [historyRevision, setHistoryRevision] = useState(0);
  const [clickConnectionPreview, setClickConnectionPreview] = useState<{ fromX: number; fromY: number; toX: number; toY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const pastRef = useRef<DiagramSnapshot[]>([]);
  const futureRef = useRef<DiagramSnapshot[]>([]);
  const pendingHistoryRef = useRef<DiagramSnapshot | null>(null);
  const resizeHistoryActiveRef = useRef(false);
  const connectionGestureRef = useRef<{ nodeId: string; handleId: string | null; x: number; y: number } | null>(null);
  const resetConnectionRef = useRef<(() => void) | null>(null);
  const completedConnectionRef = useRef(false);
  const storageKey = `oasismind:deepseek-v41-layer-layout:v7:${layer}`;

  nodesRef.current = nodes;
  edgesRef.current = edges;

  const beginHistory = useCallback(() => {
    if (pendingHistoryRef.current) return;
    pendingHistoryRef.current = cloneSnapshot(nodesRef.current, edgesRef.current);
  }, []);

  const commitHistory = useCallback(() => {
    const before = pendingHistoryRef.current;
    if (!before) return;
    pastRef.current = [...pastRef.current.slice(-79), before];
    futureRef.current = [];
    pendingHistoryRef.current = null;
    setHistoryRevision((value) => value + 1);
    setSaveState("idle");
  }, []);

  const restoreSnapshot = useCallback((snapshot: DiagramSnapshot) => {
    const cloned = cloneSnapshot(snapshot.nodes, snapshot.edges);
    setNodes(cloned.nodes);
    setEdges(cloned.edges);
    setSelectedEdgeIds([]);
    setSaveState("idle");
  }, [setEdges, setNodes]);

  const undo = useCallback(() => {
    const previous = pastRef.current.at(-1);
    if (!previous) return;
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [...futureRef.current.slice(-79), cloneSnapshot(nodesRef.current, edgesRef.current)];
    pendingHistoryRef.current = null;
    restoreSnapshot(previous);
    setHistoryRevision((value) => value + 1);
  }, [restoreSnapshot]);

  const redo = useCallback(() => {
    const next = futureRef.current.at(-1);
    if (!next) return;
    futureRef.current = futureRef.current.slice(0, -1);
    pastRef.current = [...pastRef.current.slice(-79), cloneSnapshot(nodesRef.current, edgesRef.current)];
    pendingHistoryRef.current = null;
    restoreSnapshot(next);
    setHistoryRevision((value) => value + 1);
  }, [restoreSnapshot]);

  useEffect(() => {
    let graph = initialGraph;
    // [OM-FREEPLAY] 用户要求能自行微调；显式保存到浏览器本机，避免刷新后丢失，同时不改文章事实源。
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) graph = applySavedLayout(initialGraph, JSON.parse(raw) as SavedDiagramLayout);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
    setNodes(graph.nodes);
    setEdges(graph.edges);
    setSelectedEdgeIds([]);
    setSaveState("idle");
    pastRef.current = [];
    futureRef.current = [];
    pendingHistoryRef.current = null;
    setHistoryRevision((value) => value + 1);
  }, [initialGraph, storageKey]);

  const onConnect = useCallback((connection: Connection, targetAnchor?: BoundaryAnchor) => {
    beginHistory();
    setEdges((current) => [...current, {
      ...connection,
      id: `manual-${Date.now()}`,
      type: "editable-orthogonal",
      reconnectable: true,
      markerEnd: { type: MarkerType.Arrow, width: 22, height: 22, color: COLORS.green },
      style: { stroke: COLORS.green, strokeWidth: 2.2 },
      data: { labelTex: "", targetAnchor },
    }]);
    commitHistory();
  }, [beginHistory, commitHistory, setEdges]);

  const finishConnection = useCallback((event: MouseEvent | TouchEvent) => {
    const gesture = connectionGestureRef.current;
    const scope = canvasRef.current;
    if (!gesture || !scope) return;
    const pointer = "touches" in event ? event.changedTouches[0] : event;
    if (!pointer) return;
    const hit = findBoundaryConnection(scope, { x: pointer.clientX, y: pointer.clientY }, gesture.nodeId);
    if (!hit) return;
    connectionGestureRef.current = null;
    completedConnectionRef.current = true;
    resetConnectionRef.current?.();
    setClickConnectionPreview(null);
    onConnect({ source: gesture.nodeId, sourceHandle: gesture.handleId, target: hit.nodeId, targetHandle: `port-${hit.anchor.side}` }, hit.anchor);
  }, [onConnect]);

  const saveLayout = useCallback(() => {
    const payload: SavedDiagramLayout = {
      nodes: nodes.map((item) => ({
        id: item.id,
        x: item.position.x,
        y: item.position.y,
        width: storedDimension(item.style?.width) ?? storedDimension(item.measured?.width),
        height: storedDimension(item.style?.height) ?? storedDimension(item.measured?.height),
      })),
      edges: edges.map((item) => ({
        id: item.id,
        source: item.source,
        target: item.target,
        sourceHandle: item.sourceHandle,
        targetHandle: item.targetHandle,
        data: item.data,
      })),
    };
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }, [edges, nodes, storageKey]);

  const resetLayout = useCallback(() => {
    beginHistory();
    window.localStorage.removeItem(storageKey);
    setNodes(initialGraph.nodes);
    setEdges(initialGraph.edges);
    setSelectedEdgeIds([]);
    commitHistory();
  }, [beginHistory, commitHistory, initialGraph, setEdges, setNodes, storageKey]);

  const deleteSelectedEdges = useCallback(() => {
    if (selectedEdgeIds.length === 0) return;
    beginHistory();
    const selected = new Set(selectedEdgeIds);
    setEdges((current) => current.filter((item) => !selected.has(item.id)));
    setSelectedEdgeIds([]);
    commitHistory();
  }, [beginHistory, commitHistory, selectedEdgeIds, setEdges]);

  const handleNodesChange = useCallback((changes: Parameters<typeof onNodesChange>[0]) => {
    const resizeChanges = changes.filter((change) => change.type === "dimensions");
    const resizing = resizeChanges.some((change) => "resizing" in change && change.resizing === true);
    const resizeFinished = resizeChanges.some((change) => "resizing" in change && change.resizing === false);
    if (resizing && !resizeHistoryActiveRef.current) {
      resizeHistoryActiveRef.current = true;
      beginHistory();
    }
    onNodesChange(changes);
    if (resizeFinished && resizeHistoryActiveRef.current) {
      resizeHistoryActiveRef.current = false;
      commitHistory();
    }
    setSaveState("idle");
  }, [beginHistory, commitHistory, onNodesChange]);

  const handleEdgesChange = useCallback((changes: Parameters<typeof onEdgesChange>[0]) => {
    const removesEdge = changes.some((change) => change.type === "remove");
    if (removesEdge) beginHistory();
    onEdgesChange(changes);
    if (removesEdge) commitHistory();
    setSaveState("idle");
  }, [beginHistory, commitHistory, onEdgesChange]);

  const handleSelectionChange = useCallback(({ edges: selectedEdges }: { edges: EditableEdge[] }) => {
    setSelectedEdgeIds(selectedEdges.map((item) => item.id));
  }, []);

  const selectedEdge = selectedEdgeIds.length === 1
    ? edges.find((item) => item.id === selectedEdgeIds[0])
    : undefined;

  const updateSelectedEdgeLabel = useCallback((labelTex: string) => {
    if (!selectedEdge) return;
    setEdges((current) => current.map((item) => item.id === selectedEdge.id
      ? { ...item, data: { ...item.data, labelTex } }
      : item));
  }, [selectedEdge, setEdges]);

  const handleCanvasKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.matches("input, textarea, [contenteditable='true']")) return;
    if (!event.ctrlKey && !event.metaKey) return;
    if (event.key.toLowerCase() === "z" && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      undo();
      return;
    }
    if (event.key.toLowerCase() === "y" || (event.key.toLowerCase() === "z" && event.shiftKey)) {
      event.preventDefault();
      event.stopPropagation();
      redo();
    }
  }, [redo, undo]);

  useEffect(() => {
    setSaveState("idle");
  }, [edges]);

  const canUndo = historyRevision >= 0 && pastRef.current.length > 0;
  const canRedo = historyRevision >= 0 && futureRef.current.length > 0;
  const historyContext = { beginHistory, commitHistory };

  const pointerInCanvas = useCallback((clientX: number, clientY: number) => {
    const bounds = canvasRef.current?.getBoundingClientRect();
    return bounds ? { x: clientX - bounds.left, y: clientY - bounds.top } : { x: clientX, y: clientY };
  }, []);

  return <div
    ref={canvasRef}
    style={{ width: "100%", height: "100%", position: "relative" }}
    onKeyDown={handleCanvasKeyDown}
    onClickCapture={event => {
      if (!completedConnectionRef.current) return;
      completedConnectionRef.current = false;
      event.stopPropagation();
    }}
    onPointerUp={event => finishConnection(event.nativeEvent)}
    onPointerMove={(event) => {
      if (!clickConnectionPreview) return;
      const point = pointerInCanvas(event.clientX, event.clientY);
      setClickConnectionPreview((current) => current ? { ...current, toX: point.x, toY: point.y } : null);
    }}
  >
    <style>{`
      .architecture-flow .react-flow__handle-top { top: 0; }
      .architecture-flow .react-flow__handle-bottom { bottom: 0; }
      .architecture-flow .react-flow__handle-left { left: 0; }
      .architecture-flow .react-flow__handle-right { right: 0; }
      .architecture-flow .react-flow__handle { opacity: 0; }
      .architecture-flow .react-flow__handle { z-index: 6; }
      .architecture-flow .react-flow__handle:hover { opacity: 1; }
      .architecture-flow .architecture-resize-handle:hover { opacity: 1 !important; }
      .architecture-flow .architecture-edge-endpoint { opacity: 0; }
      .architecture-flow .architecture-edge-endpoint:hover { opacity: 1; }
      .architecture-flow .architecture-edge-endpoint[data-selected="true"] { opacity: 1; }
      .architecture-flow .architecture-edge-endpoint { z-index: 1001; }
    `}</style>
    <div style={{ position: "absolute", top: 12, right: 16, zIndex: 8, display: "flex", alignItems: "center", gap: 6, padding: 7, border: `1px solid ${COLORS.line}`, borderRadius: 9, background: "rgba(255,254,250,.96)", boxShadow: "0 4px 14px rgba(42,41,36,.08)" }}>
      <button type="button" onClick={saveLayout} style={{ ...editorButton, color: saveState === "error" ? COLORS.rose : COLORS.ink }}>{saveState === "saved" ? "已保存到本机" : saveState === "error" ? "保存失败，请重试" : "保存到本机"}</button>
      <button type="button" onClick={undo} disabled={!canUndo} title="Ctrl+Z" style={{ ...editorButton, opacity: canUndo ? 1 : .45, cursor: canUndo ? "pointer" : "default" }}>撤销</button>
      <button type="button" onClick={redo} disabled={!canRedo} title="Ctrl+Y" style={{ ...editorButton, opacity: canRedo ? 1 : .45, cursor: canRedo ? "pointer" : "default" }}>重做</button>
      <button type="button" onClick={deleteSelectedEdges} disabled={selectedEdgeIds.length === 0} style={{ ...editorButton, opacity: selectedEdgeIds.length ? 1 : .45, cursor: selectedEdgeIds.length ? "pointer" : "default" }}>删除选中连线</button>
      <button type="button" onClick={resetLayout} style={editorButton}>恢复自动布局</button>
      {selectedEdge && <label style={{ display: "flex", alignItems: "center", gap: 5, color: COLORS.muted, fontSize: 10.5 }}>
        线条文字（LaTeX）
        <input
          className="nodrag nopan"
          value={selectedEdge.data?.labelTex ?? ""}
          onFocus={beginHistory}
          onChange={(event) => updateSelectedEdgeLabel(event.target.value)}
          onBlur={commitHistory}
          placeholder="例如 Q_{3,1}"
          style={{ width: 150, border: `1px solid ${COLORS.line}`, borderRadius: 6, padding: "5px 7px", background: COLORS.card, color: COLORS.ink, fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace", fontSize: 10.5 }}
        />
      </label>}
      <span style={{ color: COLORS.muted, fontSize: 10.5 }}>选中节点拖缩放点 · 边界悬停 0.5 秒显示 + · 端点自动吸附 · Ctrl+Z / Ctrl+Y</span>
    </div>
    <EditHistoryProvider value={historyContext}>
    <ReactFlow
      className="architecture-flow"
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionLineComponent={EditableConnectionLine}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnectStart={(event, params) => {
        if (!params.nodeId) return;
        const pointer = "touches" in event ? event.touches[0] ?? event.changedTouches[0] : event;
        connectionGestureRef.current = { nodeId: params.nodeId, handleId: params.handleId, x: pointer.clientX, y: pointer.clientY };
      }}
      onConnectEnd={event => {
        finishConnection(event);
        const gesture = connectionGestureRef.current;
        const pointer = "touches" in event ? event.changedTouches[0] : event;
        if (gesture && pointer && Math.hypot(pointer.clientX - gesture.x, pointer.clientY - gesture.y) > 4) connectionGestureRef.current = null;
      }}
      onClickConnectStart={(event, params) => {
        if (!params.nodeId) return;
        const pointer = "touches" in event ? event.touches[0] ?? event.changedTouches[0] : event;
        connectionGestureRef.current = { nodeId: params.nodeId, handleId: params.handleId, x: pointer.clientX, y: pointer.clientY };
        const point = pointerInCanvas(pointer.clientX, pointer.clientY);
        setClickConnectionPreview({ fromX: point.x, fromY: point.y, toX: point.x, toY: point.y });
      }}
      onClickConnectEnd={event => { finishConnection(event); setClickConnectionPreview(null); }}
      onNodeDragStart={beginHistory}
      onNodeDragStop={commitHistory}
      onSelectionDragStart={beginHistory}
      onSelectionDragStop={commitHistory}
      onSelectionChange={handleSelectionChange}
      fitView
      fitViewOptions={FIT_VIEW_OPTIONS}
      minZoom={.18}
      maxZoom={1.5}
      nodesDraggable
      nodesConnectable
      // [OM-FREEPLAY] 吸附时保持目标边框静止，避免靠近画布边缘时自动平移使落点漂移。
      autoPanOnConnect={false}
      connectOnClick
      nodesFocusable
      edgesFocusable
      edgesReconnectable={false}
      connectionRadius={1}
      connectionMode={ConnectionMode.Loose}
      elementsSelectable
      deleteKeyCode={EDIT_DELETE_KEYS}
      panOnDrag
      zoomOnScroll={false}
      zoomOnPinch
      zoomOnDoubleClick
      preventScrolling={false}
      proOptions={{ hideAttribution: true }}
    >
      <ConnectionGestureControl resetRef={resetConnectionRef} />
      <Background color="#d7d2c7" gap={28} size={1} />
      <Controls showInteractive={false} position="top-left" />
    </ReactFlow>
    </EditHistoryProvider>
    {clickConnectionPreview && <svg aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 7, pointerEvents: "none", overflow: "visible" }}>
      <defs>
        <marker id="click-connection-arrow" viewBox="0 -6 12 12" refX="11" refY="0" markerWidth="10" markerHeight="10" orient="auto">
          <path d="M 1 -5 L 11 0 L 1 5" fill="none" stroke={COLORS.green} strokeWidth="1.8" strokeLinejoin="round" />
        </marker>
      </defs>
      <path d={`M ${clickConnectionPreview.fromX} ${clickConnectionPreview.fromY} L ${clickConnectionPreview.toX} ${clickConnectionPreview.toY}`} fill="none" stroke={COLORS.green} strokeWidth="2.2" markerEnd="url(#click-connection-arrow)" />
    </svg>}
  </div>;
}

export const DeepSeekV41Layer: React.FC<Props> = ({ initialLayer = 1 }) => {
  const [layer, setLayer] = useState(() => Math.min(40, Math.max(1, Math.round(initialLayer))));
  const mode = modeForLayer(layer);
  return <div style={{ width: "100%", height: "100%", background: COLORS.paper, fontFamily: "Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif", position: "relative" }}>
    <div style={{ position: "absolute", inset: "0 0 auto 0", zIndex: 10, minHeight: 122, padding: "18px 22px 14px", background: "rgba(247,245,240,.97)", borderBottom: `1px solid ${COLORS.line}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, marginBottom: 12 }}><div><strong style={{ fontSize: 21 }}>DeepSeek V4.1-Flash · Layer {layer}</strong><span style={{ marginLeft: 12, color: mode === "full" ? COLORS.green : mode === "reindex" ? COLORS.amber : mode === "reuse" ? COLORS.blue : COLORS.rose, fontWeight: 800 }}>{modeLabel(mode)}</span></div><span style={{ color: COLORS.muted, fontSize: 12 }}>随时平移缩放、拖框、改尺寸、增删连线；与文章编辑状态无关</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(20,1fr)", gap: 4 }}>{Array.from({ length: 40 }, (_, i) => i + 1).map((value) => { const valueMode = modeForLayer(value); const active = value === layer; const color = valueMode === "full" ? COLORS.green : valueMode === "reindex" ? COLORS.amber : valueMode === "reuse" ? COLORS.blue : COLORS.rose; return <button key={value} type="button" onClick={() => setLayer(value)} aria-pressed={active} style={{ border: `1px solid ${active ? color : COLORS.line}`, background: active ? color : COLORS.card, color: active ? "white" : color, borderRadius: 5, padding: "4px 0", fontWeight: 750, fontSize: 10.5, cursor: "pointer" }}>{value}</button>; })}</div>
    </div>
    <div style={{ position: "absolute", inset: "122px 0 0" }}><DiagramCanvas key={layer} layer={layer} /></div>
  </div>;
};
