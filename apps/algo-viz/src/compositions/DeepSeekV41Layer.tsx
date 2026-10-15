import React, { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
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
type ExecutionPhase = "prefill" | "decode";
const ExecutionContext = createContext<ExecutionPhase>("prefill");
// 当前计算的 token 轴与缓存的历史轴分别建模，Decode 的一行仍使用全局位置 t。
export function executionAxis(phase: ExecutionPhase) {
  return { count: phase === "prefill" ? "N" : "1", rows: phase === "prefill" ? ["1", "2", "\\vdots", "t", "\\vdots", "N"] : ["t"] };
}
function useExecutionAxis() {
  const phase = useContext(ExecutionContext);
  return { phase, ...executionAxis(phase) };
}
type NodeKind =
  | "tokenizer"
  | "embedding"
  | "prior-layers"
  | "execution-guide"
  | "query-row"
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
  | "expert-output"
  | "expert-weight"
  | "expert-scale"
  | "expert-weighted"
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
  expertId?: number;
  phase?: ExecutionPhase;
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
const VISIBLE_ROUTED_EXPERTS = [ROUTED_EXPERTS[0], ROUTED_EXPERTS[1], ROUTED_EXPERTS[5]] as const;
const EXPERT_GRID_COLUMNS = "minmax(0,1fr) minmax(0,1fr) 40px minmax(0,1fr)";

// [OM-FREEPLAY] 为专家内两列展开矩阵预留组宽；端口与得分列由同一组参数推导。
const EXPERTS_WIDTH = 2800;
const EXPERTS_PADDING = 12;
const SHARED_GROUP_WIDTH = 600;
const EXPERT_GROUP_GAP = 18;
const EXPERT_GROUP_INSET = 11;
const EXPERT_CARD_GAP = 8;
const ROUTED_CONTENT_START = EXPERTS_PADDING + SHARED_GROUP_WIDTH + EXPERT_GROUP_GAP + EXPERT_GROUP_INSET;
const ROUTED_CONTENT_WIDTH = EXPERTS_WIDTH - 2 * EXPERTS_PADDING - SHARED_GROUP_WIDTH - EXPERT_GROUP_GAP - 2 * EXPERT_GROUP_INSET;
const EXPERT_CARD_WIDTH = (ROUTED_CONTENT_WIDTH - 40 - 3 * EXPERT_CARD_GAP) / VISIBLE_ROUTED_EXPERTS.length;
const ROUTED_HANDLE_LEFT = VISIBLE_ROUTED_EXPERTS.map((_, index) => 100 * (ROUTED_CONTENT_START + index * (EXPERT_CARD_WIDTH + EXPERT_CARD_GAP) + (index === 2 ? 40 + EXPERT_CARD_GAP : 0) + EXPERT_CARD_WIDTH / 2) / EXPERTS_WIDTH);
const SHARED_HANDLE_LEFT = 100 * (EXPERTS_PADDING + SHARED_GROUP_WIDTH / 2) / EXPERTS_WIDTH;
const EXPERT_OUTPUT_BRANCHES = [
  { key: "shared", expertId: undefined, center: 70 + EXPERTS_WIDTH * SHARED_HANDLE_LEFT / 100, width: SHARED_GROUP_WIDTH - 24 },
  ...VISIBLE_ROUTED_EXPERTS.map((expert, index) => ({ key: String(expert.id), expertId: expert.id, center: 70 + EXPERTS_WIDTH * ROUTED_HANDLE_LEFT[index] / 100, width: EXPERT_CARD_WIDTH - 24 })),
];
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
const CONTENT_SIZED_KINDS = new Set<NodeKind>(["tokenizer", "embedding", "execution-guide", "projection-kv", "heads", "concat", "compressor", "indexer", "experts", "expert-output", "expert-weighted"]);

function MathFormula({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: false }),
    [display, tex],
  );
  // [OM-FREEPLAY] 小字号下限取 10.5px，放大矩阵元素而不缩小已有的大公式。
  return <span aria-label={tex} style={{ fontSize: "max(1em, 10.5px)" }} dangerouslySetInnerHTML={{ __html: html }} />;
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

function Matrix({ tex, shape, rowTex, elementTex, tone = "blue", vectorLength = "5120", lastRow = "N", rowIndices }: { tex: string; shape: string; rowTex: (row: string) => string; elementTex: (row: string, column: string) => string; tone?: "blue" | "green" | "amber"; vectorLength?: string; lastRow?: string; rowIndices?: string[] }) {
  const rows = rowIndices ?? ["1", "2", "\\vdots", lastRow];
  const palette = tonePalette(tone);
  return (
    <div style={{ border: `1.5px solid ${palette.color}`, borderRadius: 9, overflow: "hidden" }}>
      <div style={{ padding: "6px 9px", background: palette.background, display: "flex", justifyContent: "space-between", gap: 8 }}>
        <MathFormula tex={tex} /><MathFormula tex={shape} />
      </div>
      <div style={{ padding: 6, display: "grid", gap: 3, borderTop: `1px solid ${COLORS.line}`, fontSize: 9.5 }}>
        {rows.map((row, index) => row === "\\vdots"
          ? <div key={`${row}-${index}`} style={{ minHeight: 22, display: "grid", placeItems: "center" }}><MathFormula tex="\vdots" /></div>
          : <VectorStrip key={`${row}-${index}`} name={rowTex(row)} length={vectorLength} columns={["1", "2", "3", "\\cdots", vectorLength]} elementTex={(column) => elementTex(row, column)} selected={rowIndices !== undefined && row === "t"} tone={tone} compact />)}
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

function queryProjectionLayout(phase: ExecutionPhase) {
  const firstY = 68;
  const rowHeight = phase === "prefill" ? 174 : 128;
  const secondY = firstY + rowHeight + 32;
  const resultHeight = phase === "prefill" ? 232 : 128;
  return { firstY, rowHeight, secondY, resultHeight, height: secondY + resultHeight + 24 };
}

function QueryProjection({ layer }: { layer: number }) {
  const { phase } = useExecutionAxis();
  const layout = queryProjectionLayout(phase);
  return (
    <div style={panel}>
      <Title>Layer {layer} · Query · {phase === "prefill" ? "Prefill 整段投影" : "Decode 当前一行投影"}</Title>
      <div style={{ position: "absolute", left: 28, top: 47, color: COLORS.blue, fontSize: 10.5, fontWeight: 800 }}>① 5120 → 1280 · RMSNorm</div>
      <div style={{ position: "absolute", left: 28, top: layout.secondY - 24, color: COLORS.blue, fontSize: 10.5, fontWeight: 800 }}>② 1280 → 64 × 512</div>
    </div>
  );
}

// 图中的向量沿行展开；省略号不占元素格，也不着色。
function AttentionTensor({ tex, rows, columns, scalar, tone = "green" }: { tex: string; rows: string; columns: string; scalar: (row: string, column: string) => string; tone?: DiagramTone }) {
  const palette = tonePalette(tone);
  const { phase } = useExecutionAxis();
  const rowLabels = rows === "1" ? [phase === "decode" ? "t" : "1"] : ["1", "2", "3", "\\vdots", rows];
  return <div data-attention-tensor={tex} style={{ minWidth: 0, padding: 8, border: `1.5px solid ${palette.color}`, borderRadius: 8, background: palette.background, display: "grid", gap: 6 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline", fontSize: 13 }}><MathFormula tex={tex} /><span style={{ fontSize: 11 }}><MathFormula tex={`${rows}\\times ${columns}`} /></span></div>
    {rowLabels.map(row => <div key={row} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr .35fr 1fr", gap: 4, textAlign: "center", alignItems: "center", fontSize: 12 }}>
      {["1", "2", "3", "\\cdots", columns].map((column, index) => <span key={index} style={{ minWidth: 0, padding: "4px 1px", border: row === "\\vdots" || column === "\\cdots" ? undefined : `1px solid ${palette.color}`, borderRadius: 4 }}><MathFormula tex={row === "\\vdots" ? (index === 2 ? row : "") : column === "\\cdots" ? column : scalar(row, column)} /></span>)}
    </div>)}
  </div>;
}

function FlowStep({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: COLORS.green, fontSize: 12, padding: "2px 0" }}><Operator tex="\downarrow" /><span>{children}</span></div>;
}

// 模型特有的部分旋转、共享 KV、attention sink 和分组输出投影：
// https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/inference/model.py
// https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/inference/kernel.py
function RotaryProcess({ input, output, position, layer, inverse = false, dimension = 512 }: { input: string; output: string; position: string; layer: number; inverse?: boolean; dimension?: 128 | 512 }) {
  const compressed = modeForLayer(layer) !== "swa";
  const unchanged = dimension - 64;
  return <div data-rotary-process={inverse ? "inverse" : "forward"} style={{ border: `1px solid ${COLORS.amber}`, borderRadius: 9, padding: 10, display: "grid", gap: 9, fontSize: 12, minWidth: 0 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}><strong>{inverse ? "逆旋转 · 回到输出坐标系" : "RoPE · 相邻两个元素一起旋转"}</strong><MathFormula tex={`p=${position}`} /></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", alignItems: "center", gap: 6 }}><Box tone="blue"><MathFormula tex={input} /></Box><Operator tex="\to" /><Box tone="green"><MathFormula tex={output} /></Box></div>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span>元素 1–{unchanged}：原样传递</span><span>元素 {unchanged + 1}–{dimension}：32 对</span></div>
    <div data-rotary-pairs style={{ display: "grid", gridTemplateColumns: "1fr 1fr 24px 1fr", gap: 7, alignItems: "center" }}>
      {[0, 1, 31].map((pair, index) => <React.Fragment key={pair}>{index === 2 && <Operator tex="\cdots" />}<div style={{ display: "grid", gap: 5, textAlign: "center" }}>
        <span style={{ fontSize: 11 }}>第 {pair + 1} 对 · {unchanged + 1 + pair * 2}, {unchanged + 2 + pair * 2}</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>{["a", "b"].map(name => <Box key={name} tone="blue"><MathFormula tex={`${name}_{${pair}}`} /></Box>)}</div>
        <span><MathFormula tex={`\\downarrow\\; R(${inverse ? "-" : ""}p\\omega_{${pair}})`} /></span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>{["a'", "b'"].map(name => <Box key={name} tone="green"><MathFormula tex={`${name}_{${pair}}`} /></Box>)}</div>
      </div></React.Fragment>)}
    </div>
    <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 8, display: "grid", gap: 5 }}>
      <MathFormula tex={`\\phi=${inverse ? "-" : ""}p\\omega_j,\\qquad j=0,1,\\ldots,31`} />
      <div data-rotation-matrix style={{ display: "grid", gridTemplateColumns: "1fr 22px 1.6fr 22px 1fr", alignItems: "center", gap: 4, textAlign: "center" }}>
        <div style={{ display: "grid", gap: 3 }}><Box tone="green"><MathFormula tex="a'_j" /></Box><Box tone="green"><MathFormula tex="b'_j" /></Box></div><Operator tex="=" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, padding: 4, borderLeft: `2px solid ${COLORS.amber}`, borderRight: `2px solid ${COLORS.amber}` }}>{["\\cos\\phi", "-\\sin\\phi", "\\sin\\phi", "\\cos\\phi"].map((tex, cell) => <Box key={cell} tone="amber"><MathFormula tex={tex} /></Box>)}</div><Operator tex="\times" />
        <div style={{ display: "grid", gap: 3 }}><Box tone="blue"><MathFormula tex="a_j" /></Box><Box tone="blue"><MathFormula tex="b_j" /></Box></div>
      </div>
      {compressed ? <><MathFormula tex="\bar\omega_j=160000^{-2j/64}" /><span>本层频率由 YaRN 调整：高频保持，低频除以 16，中间平滑过渡。</span></> : <MathFormula tex="\omega_j=10000^{-2j/64}" />}
    </div>
    {/* [OM-FREEPLAY] 用第一对元素和位置 1 演示旋转，非真实模型激活值。 */}
    <div data-rope-example style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 6 }}>例：<MathFormula tex={`p=1,\\;(a_0,b_0)=(1,0)\\;\\longrightarrow\\;(0.5403,${inverse ? "-" : ""}0.8415)`} /></div>
  </div>;
}

function LocalKvProjection({ layer }: { layer: number }) {
  const { phase, count, rows } = useExecutionAxis();
  const rowNames = (prefix: string) => rows.map(s => s === "\\vdots" ? s : `${prefix}_{${layer},${s}}`);
  return (
    <div style={{ ...panel, height: "auto" }}>
      <Handle id="main-in" type="target" position={Position.Top} style={handle} />
      <Handle id="swa" type="source" position={Position.Bottom} style={handle} />
      <Title>Layer {layer} · 本层独立 KV</Title>
      <div style={{ padding: 9, display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 18px 1.15fr 18px 1fr", gap: 4, alignItems: "center" }}>
          <RowMatrix tex={`X_{${layer}}`} shape={`${count}\\times5120`} rows={rowNames("\\mathbf x")} tone="blue" />
          <Operator tex="\times" />
          <div style={{ padding: 5, border: `1.3px solid ${COLORS.amber}`, borderRadius: 7, background: COLORS.amberSoft, display: "grid", gap: 5, fontSize: 9, minWidth: 0, textAlign: "center" }}>
            <MathFormula tex={`W_{${layer}}^{KV,\\mathrm{SWA}}`} /><MathFormula tex="5120\times512" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr .4fr 1fr", gap: 3, alignItems: "center" }}>
              {["1", "2", "\\cdots", "512"].map(column => column === "\\cdots" ? <MathFormula key={column} tex={column} /> : <div key={column} style={{ border: `1px solid ${COLORS.amber}`, borderRadius: 4, padding: "20px 0" }}><MathFormula tex={`\\mathbf w_{${layer},${column}}`} /></div>)}
            </div>
          </div>
          <Operator tex="=" />
          <RowMatrix tex={`\\widehat U_{${layer}}`} shape={`${count}\\times512`} rows={rowNames("\\widehat{\\mathbf u}")} />
        </div>
        <FlowStep>逐行 RMSNorm → 每行按自身位置旋转</FlowStep>
        <RotaryProcess input={`\\operatorname{RMSNorm}(\\widehat{\\mathbf u}_{${layer},${phase === "prefill" ? "s" : "t"}})`} output={`\\mathbf u_{${layer},${phase === "prefill" ? "s" : "t"}}`} position={phase === "prefill" ? "s-1" : "t-1"} layer={layer} />
        <FlowStep>{phase === "prefill" ? "s = 1, 2, …, N：每行按自己的位置生成 KV" : "仅生成当前位置 t 的新 KV；下方写入历史窗口"}</FlowStep>
        <RowMatrix tex={`U_{${layer}}`} shape={`${count}\\times512`} rows={rowNames("\\mathbf u")} rowLength="512" elementColumns={["1", "2", "3", "4", "\\cdots", "512"]} elementTex={(row, column) => `u_{${layer},${rows[row]},${column}}`} />
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
      <circle cx="120" cy="120" r="87.6" fill="none" stroke={COLORS.green} strokeWidth="2" />
      <path d="M 120 95 L 120 56" fill="none" stroke={COLORS.amber} strokeWidth="2" markerEnd={`url(#cache-write-${layer})`} />
    </svg>
    {slots.map((row, index) => {
      const angle = (-90 + index * 45) * Math.PI / 180;
      const oldest = index === 0;
      return <div key={index} data-cache-slot={row} style={{ position: "absolute", left: `${50 + 36.5 * Math.cos(angle)}%`, top: `${50 + 36.5 * Math.sin(angle)}%`, transform: "translate(-50%,-50%)", width: "26.5%", height: "9%", boxSizing: "border-box", display: "grid", placeItems: "center", border: row === "\\cdots" ? "none" : `1.5px solid ${oldest ? COLORS.amber : COLORS.green}`, borderRadius: 6, background: row === "\\cdots" ? "transparent" : oldest ? COLORS.amberSoft : COLORS.greenSoft, color: COLORS.green, fontSize: 10, lineHeight: 1.2 }}>
        <MathFormula tex={row === "\\cdots" ? row : `\\mathbf u_{${layer},${row}}`} />
      </div>;
    })}
    <div data-cache-write-label style={{ position: "absolute", left: "50%", top: "52%", width: "40%", transform: "translate(-50%,-50%)", display: "grid", gap: 4, textAlign: "center", color: COLORS.green, fontSize: 10 }}><strong>128 槽</strong><MathFormula tex={`\\mathbf u_{${layer},t+1}`} /><span style={{ color: COLORS.amber }}>覆盖最旧槽</span></div>
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

function SwaSelectionConnector({ layer }: { layer: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [path, setPath] = useState("");
  useEffect(() => {
    const svg = svgRef.current;
    const frame = svg?.closest('.react-flow__node');
    const source = frame?.querySelector('[data-selection-window]');
    const target = frame?.closest('.react-flow')?.querySelector('[data-swa-result]');
    if (!svg || !source || !target) return;
    const measure = () => {
      const root = svg.getBoundingClientRect(), from = source.getBoundingClientRect(), to = target.getBoundingClientRect();
      if (!root.width || !root.height) return;
      const sx = svg.clientWidth / root.width, sy = svg.clientHeight / root.height;
      const x1 = (from.right - root.left) * sx, y1 = (from.top + from.height / 2 - root.top) * sy;
      const x2 = (to.left + to.width / 2 - root.left) * sx, y2 = (to.top - root.top) * sy;
      const channelX = Math.max(x1 + 24, x2 + 24), channelY = y2 - 18;
      setPath(`M ${x1} ${y1} H ${channelX} V ${channelY} H ${x2} V ${y2}`);
    };
    measure();
    const resize = new ResizeObserver(measure);
    [svg, source, target].forEach(element => resize.observe(element));
    const move = new MutationObserver(measure);
    for (const node of [frame, target.closest('.react-flow__node')]) if (node) move.observe(node, { attributes: true, attributeFilter: ["style"] });
    return () => { resize.disconnect(); move.disconnect(); };
  }, [layer]);
  return <svg ref={svgRef} data-swa-selection-connector aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
    <defs><marker id={`swa-pick-${layer}`} viewBox="0 -5 10 10" refX="9" refY="0" markerWidth="8" markerHeight="8" orient="auto"><path d="M 1 -4 L 9 0 L 1 4" fill="none" stroke={COLORS.amber} strokeWidth="1.5" /></marker></defs>
    <path d={path} fill="none" stroke={COLORS.amber} strokeWidth="1.5" markerEnd={`url(#swa-pick-${layer})`} />
  </svg>;
}

function Head({ index, layer }: { index: number; layer: number }) {
  const { phase, count, rows } = useExecutionAxis();
  const queryRow = `\\mathbf q_{${layer},${index},t}`;
  const rotatedQuery = `\\mathbf q'_{${layer},${index},t}`;
  return (
    <div data-head-layout={index} style={{ position: "relative", minWidth: 0, border: `1.5px solid ${COLORS.green}`, borderRadius: 10, padding: 12, display: "grid", gap: 10, alignContent: "start", background: COLORS.card, fontSize: 13 }}>
      <Handle id={`query-${index}`} type="target" position={Position.Top} style={{ ...handle, background: COLORS.blue }} />
      <strong style={{ color: COLORS.green, textAlign: "center", fontSize: 16 }}>Layer {layer} · Head {index} · {phase === "prefill" ? "放大第 t 行" : "当前唯一 Query · 位置 t"}</strong>
      <RotaryProcess input={queryRow} output={rotatedQuery} position="t-1" layer={layer} />
      <FlowStep>① 用旋转后的 Q，逐行与 K 做点积</FlowStep>
      <AttentionTensor tex={`Q=${rotatedQuery}`} rows="1" columns="512" scalar={(_, column) => `q'_{${column}}`} tone="blue" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", gap: 8, alignItems: "center" }}>
        <AttentionTensor tex="K" rows="L_t" columns="512" scalar={(row, column) => `k_{${row},${column}}`} />
        <Operator tex="=" />
        <AttentionTensor tex={`V=\\mathrm{KV}_{${layer},t}`} rows="L_t" columns="512" scalar={(row, column) => `v_{${row},${column}}`} />
      </div>
      <span style={{ color: COLORS.muted }}>同一份已旋转 KV：K 用于打分，V 用于加权；<MathFormula tex="L_t" /> 为当前可见 KV 行数。</span>
      <div data-attention-dot-products style={{ display: "grid", gridTemplateColumns: "1fr 1fr 22px 1fr", gap: 7, alignItems: "center" }}>{["1", "2", "L_t"].map((row, i) => <React.Fragment key={row}>{i === 2 && <Operator tex="\cdots" />}<div style={{ display: "grid", gap: 5, textAlign: "center" }}><MathFormula tex={`\\mathbf q'\\cdot\\mathbf k_{${row}}^{\\mathsf T}`} /><FlowStep><MathFormula tex="\div\sqrt{512}" /></FlowStep><Box tone="amber"><MathFormula tex={`z_{${row}}`} /></Box></div></React.Fragment>)}</div>
      <div style={{ textAlign: "center" }}><MathFormula tex="z_i=(q'_1k_{i,1}+q'_2k_{i,2}+\cdots+q'_{512}k_{i,512})/\sqrt{512}" /></div>
      <FlowStep>② softmax：指数 → 同一个分母 → 每行的权重</FlowStep>
      <AttentionTensor tex="\mathbf z" rows="1" columns="L_t" scalar={(_, column) => `z_{${column}}`} tone="amber" />
      <div data-attention-softmax style={{ display: "grid", gridTemplateColumns: "1fr 26px 1.6fr 26px 1fr", gap: 5, alignItems: "center" }}>
        <Box tone="amber"><MathFormula tex="e^{z_i}" /></Box><Operator tex="\div" />
        <div style={{ display: "grid", gap: 4, textAlign: "center" }}><Box tone="amber"><MathFormula tex={`D=e^{b_{${layer},${index}}}+\\sum_{j=1}^{L_t}e^{z_j}`} /></Box><span style={{ fontSize: 11 }}>可学习 sink 加入分母，值向量为 0</span></div>
        <Operator tex="=" /><Box tone="green"><MathFormula tex="a_i" /></Box>
      </div>
      <AttentionTensor tex="\mathbf a" rows="1" columns="L_t" scalar={(_, column) => `a_{${column}}`} />
      <FlowStep>③ 每个权重乘对应的 V 行，再逐列相加</FlowStep>
      <div data-attention-value-sum style={{ display: "grid", gap: 5 }}>{["1", "2", "L_t"].map((row, i) => <div key={row} style={{ display: "grid", gridTemplateColumns: "64px 70px 24px 1fr", gap: 6, alignItems: "center" }}><Operator tex={i === 0 ? "" : i === 2 ? "+\\cdots+" : "+"} /><Box tone="amber"><MathFormula tex={`a_{${row}}`} /></Box><Operator tex="\times" /><AttentionTensor tex={`\\mathbf v_{${row}}`} rows="1" columns="512" scalar={(_, column) => `v_{${row},${column}}`} /></div>)}</div>
      <FlowStep><MathFormula tex="\widetilde o_d=\sum_{i=1}^{L_t}a_i v_{i,d},\quad d=1,\ldots,512" /></FlowStep>
      <AttentionTensor tex={`\\widetilde{\\mathbf o}_{${layer},${index},t}`} rows="1" columns="512" scalar={(_, column) => `\\widetilde o_{${column}}`} tone="amber" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", gap: 10, alignItems: "center" }}>
        <div data-inverse-rotation style={{ minWidth: 0, display: "grid", gap: 8, fontSize: 12 }}>
          <strong>④ 输出逆旋转{phase === "prefill" ? "，再放回第 t 行" : "，得到当前行"}</strong>
          <span>前 448 维原样传递；后 64 维逐对旋转：</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", gap: 5, alignItems: "center" }}><Box tone="amber"><MathFormula tex="(\widetilde o_{449+2j},\widetilde o_{450+2j})" /></Box><Operator tex="\to" /><Box tone="green"><MathFormula tex="(o_{449+2j},o_{450+2j})" /></Box></div>
          <MathFormula tex="R(-(t-1)\omega_j),\quad j=0,1,\ldots,31" />
          <span>沿用上方 2×2 旋转矩阵，把角度取负。</span>
          {/* [OM-FREEPLAY] 仅用三行 KV 的玩具数值说明 sink 与逐列加权。 */}
          <div data-attention-example style={{ padding: 8, border: `1px dashed ${COLORS.amber}`, borderRadius: 6, display: "grid", gap: 6 }}><strong>三行 KV 的数值例子</strong><MathFormula tex="\mathbf z=(0,\ln2,0),\quad b=0" /><MathFormula tex="D=1+1+2+1=5" /><MathFormula tex="\mathbf a=(0.2,0.4,0.2),\quad a_{\rm sink}=0.2" /><MathFormula tex="(v_{1,1},v_{2,1},v_{3,1})=(2,4,6)" /><MathFormula tex="o_1=0.2\cdot2+0.4\cdot4+0.2\cdot6=3.2" /></div>
        </div>
        <Operator tex="\to" />
        <div data-head-output style={{ minWidth: 0, display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, color: COLORS.green, textAlign: "center" }}>{phase === "prefill" ? "每个位置并行得到一行输出" : "本步输出 1 行；下一步位置 t+1"}</span>
          <RowMatrix tex={`O_{${layer},${index}}`} shape={`${count}\\times512`} rows={rows.map(s => s === "\\vdots" ? s : `\\mathbf o_{${layer},${index},${s}}`)} selected={rows.indexOf("t")} rowLength="512" elementTex={(row, column) => `o_{${layer},${index},${rows[row]},${column}}`} />
        </div>
      </div>
    </div>
  );
}

export function Expert({ layer, index, score, shared = false }: { layer: number; index?: number; score?: string; shared?: boolean }) {
  const { count, phase } = useExecutionAxis();
  const expertIndex = shared ? "\\mathrm{shared}" : `${index}`;
  const expertTex = `E_{${layer},${expertIndex}}`;
  const weightIndex = shared ? "\\mathrm{shared}" : `${index}`;
  const color = shared ? COLORS.blue : COLORS.amber;
  const matrix = (tex: string, scalar: string, rows: string, columns: string, weight = false, multiplyInput = false) => <div data-expert-matrix={tex} style={{ minWidth: 0, padding: 5, border: `1px solid ${color}`, borderRadius: 6, background: weight ? COLORS.amberSoft : COLORS.greenSoft }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3, fontSize: 11 }}><MathFormula tex={multiplyInput ? `\\times ${tex}` : tex} /><span style={{ fontSize: 10 }}><MathFormula tex={`${rows}\\times ${columns}`} /></span></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr .35fr 1fr", gap: 1, alignItems: "center", fontSize: 10 }}>
      {(phase === "decode" && !weight ? ["t"] : ["1", "2", "3", "\\vdots", rows]).flatMap((row, r) => ["1", "2", "\\cdots", columns].map((column, c) => <div key={`${r}-${c}`} style={{ minWidth: 0, height: 24, boxSizing: "border-box", display: "grid", placeItems: "center", border: row === "\\vdots" || column === "\\cdots" ? undefined : `1px solid ${color}`, borderRadius: 2 }}><MathFormula tex={row === "\\vdots" ? (c === 1 ? "\\vdots" : "") : column === "\\cdots" ? "\\cdots" : `${scalar}_{${row},${column}}`} /></div>))}
    </div>
  </div>;
  // 连线放在相邻内容行之间；内容增高时由 Grid 推开，不再依赖矩阵的绝对纵坐标。
  const connector = (kind: "split" | "merge" | "down" | "left", height = 28) => <svg data-expert-connector={kind} aria-hidden viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ display: "block", width: "100%", height, color }}>
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path vectorEffect="non-scaling-stroke" d={kind === "split" ? `M50 0 V10 H25 V${height} M50 10 H75 V${height}` : kind === "merge" ? `M25 0 V10 H75 V0 M50 10 V${height}` : kind === "left" ? `M50 0 V10 H25 V${height}` : `M50 0 V${height}`} />
      {(kind === "split" ? [25, 75] : kind === "left" ? [25] : [50]).map(x => <path key={x} vectorEffect="non-scaling-stroke" d={`M${x - 1} ${height - 6} L${x} ${height} L${x + 1} ${height - 6}`} />)}
    </g>
  </svg>;
  const twoColumns: CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16, alignItems: "start" };
  return (
    <div data-expert={shared ? "shared" : index} style={{ border: `1.5px solid ${shared ? COLORS.blue : COLORS.amber}`, borderRadius: 9, padding: 9, display: "grid", gap: 7, background: COLORS.card, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: shared ? COLORS.blue : COLORS.amber, fontWeight: 800, fontSize: 11 }}><span>{shared ? `Layer ${layer} · Shared` : `Layer ${layer} · Expert ${index}`}</span><span>{shared ? "权重 1" : <MathFormula tex={`g_{${layer},${index}}=${score}`} />}</span></div>
      <div data-expert-structure style={{ display: "grid", minWidth: 0 }}>
        {matrix(`Y_{${layer}}`, "y", count, "5120")}
        {connector("split")}
        <div style={twoColumns}>
          {matrix(`W_{${layer},${weightIndex}}^{\\mathrm{gate}}`, "w^{\\mathrm{gate}}", "5120", "d_e", true, true)}
          {matrix(`W_{${layer},${weightIndex}}^{\\mathrm{up}}`, "w^{\\mathrm{up}}", "5120", "d_e", true, true)}
        </div>
        <div style={{ ...twoColumns, alignItems: "stretch" }}>
          <div style={{ minWidth: 0, display: "grid" }}>
            {connector("down")}
            {matrix(`Z_{${layer},${expertIndex}}`, "z", count, "d_e")}
            {connector("down")}
            <div data-expert-activation style={{ border: `1px solid ${color}`, borderRadius: 6, padding: 8, textAlign: "center", fontSize: 12 }}>
              <strong style={{ fontSize: 12 }}>SiLU · 对矩阵中每个元素</strong>
              <div data-silu-input style={{ marginTop: 8 }}><MathFormula tex="z" /></div>
              {connector("split", 24)}
              <div style={{ ...twoColumns, gap: 8, alignItems: "stretch" }}>{["z", "\\sigma(z)=\\frac1{1+e^{-z}}"].map(tex => <div key={tex} data-silu-operand style={{ border: `1px solid ${color}`, borderRadius: 4, padding: "7px 2px", display: "grid", placeItems: "center", minWidth: 0 }}><MathFormula tex={tex} /></div>)}</div>
              <div data-silu-multiply style={{ position: "relative", height: 44 }}>
                <svg aria-hidden viewBox="0 0 100 44" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}><g fill="none" stroke={color} strokeWidth="1.5">
                  <path data-silu-arrow="identity" vectorEffect="non-scaling-stroke" d="M25 0 V14 H44 M42 10 L44 14 L42 18" />
                  <path data-silu-arrow="sigmoid" vectorEffect="non-scaling-stroke" d="M75 0 V14 H56 M58 10 L56 14 L58 18" />
                  <path data-silu-arrow="output" vectorEffect="non-scaling-stroke" d="M50 25 V44 M49 38 L50 44 L51 38" />
                </g></svg>
                <span style={{ position: "absolute", top: 3, left: "44%", width: "12%", textAlign: "center" }}><MathFormula tex="\times" /></span>
              </div>
              <div data-silu-output><MathFormula tex="a=z\cdot\sigma(z)" /></div>
              {/* [OM-FREEPLAY] 用 z=2 演示一个元素的 SiLU，数值不代表模型输出。 */}
              <div data-silu-example style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 6, marginTop: 6, fontSize: 11 }}><MathFormula tex="z=2\;\Rightarrow\;a=2\times0.8808\approx1.7616" /></div>
            </div>
            {connector("down")}
          </div>
          <div data-expert-up-flow style={{ position: "relative", minHeight: 28 }}>
            <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}><path vectorEffect="non-scaling-stroke" d="M50 0 V100 M49 98 L50 100 L51 98" fill="none" stroke={color} strokeWidth="1.5" /></svg>
            <span style={{ position: "absolute", left: "55%", top: 20, fontSize: 11 }}>Up 分支</span>
          </div>
        </div>
        <div style={twoColumns}>
          {matrix(`A_{${layer},${expertIndex}}`, "a", count, "d_e")}
          {matrix(`B_{${layer},${expertIndex}}`, "b", count, "d_e")}
        </div>
        {connector("merge")}
        <div data-expert-product style={{ textAlign: "center", fontSize: 12 }}><MathFormula tex="\odot" /> 逐元素相乘</div>
        {connector("left")}
        <div data-expert-down-projection style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 24px minmax(0,1fr)", gridTemplateRows: "auto minmax(0,1fr)", columnGap: 6, alignItems: "start" }}>
          {matrix(`C_{${layer},${expertIndex}}`, "c", count, "d_e")}
          <div data-expert-down-multiply style={{ position: "relative", display: "grid", placeItems: "center", alignSelf: "stretch" }}><Operator tex="\times" /><svg aria-hidden viewBox="0 0 24 100" preserveAspectRatio="none" style={{ position: "absolute", top: "calc(50% + 13px)", width: "100%", height: "calc(50% - 13px)", display: "block" }}><path vectorEffect="non-scaling-stroke" d="M12 0 V100" fill="none" stroke={color} strokeWidth="1.5" /></svg></div>
          <div style={{ gridColumn: 3, gridRow: "1 / 3", minWidth: 0 }}>{matrix(`W_{${layer},${weightIndex}}^{\\mathrm{down}}`, "w^{\\mathrm{down}}", "d_e", "5120", true)}</div>
          <div aria-hidden style={{ gridColumn: 2, gridRow: 2, alignSelf: "stretch", position: "relative" }}><svg viewBox="0 0 24 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}><path vectorEffect="non-scaling-stroke" d="M12 0 V100" fill="none" stroke={color} strokeWidth="1.5" /></svg></div>
        </div>
        {connector("down")}
        {matrix(`${expertTex}(Y_{${layer}})`, "o", count, "5120")}
      </div>
      <span style={{ fontSize: 11, color: COLORS.muted }}><MathFormula tex="d_e" />：该专家的中间维度</span>
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
  const { phase, count, rows: tokenRows } = useExecutionAxis();
  const both = <><Handle id="main-in" type="target" position={Position.Top} style={handle} /><Handle id="main-out" type="source" position={Position.Bottom} style={handle} /></>;

  // [OM-FREEPLAY] 用 N=6、t=3 与 P=6 对照并行行数和 Decode 的全局位置，数值仅为教学示例。
  if (kind === "execution-guide") return <div data-execution-guide={phase} style={{ ...panel, height: "auto", borderColor: COLORS.blue }}><Title>{phase === "prefill" ? "Prefill · 整段 token 并行" : "Decode · 单个新 token"}</Title><div style={{ padding: 14, display: "grid", gap: 12, fontSize: 14 }}>
    <MathFormula tex={phase === "prefill" ? "N=\\text{本次输入的 token 数},\\quad t\\in\\{1,2,\\ldots,N\\}" : "t=P+k,\\quad k=1,2,\\ldots"} />
    <span>{phase === "prefill" ? "t 是序列位置。下方放大其中一行；所有位置都计算，各自只读因果可见的 KV。" : "P 是 prompt 的 token 数，k 是本次 Decode 步号。当前张量只有一行，它的全局位置仍是 t。"}</span>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr", alignItems: "center", gap: 8 }}><Box tone="blue"><MathFormula tex={phase === "prefill" ? "1,2,\\ldots,N" : "t=P+k"} /></Box><Operator tex="\to" /><Box tone="green"><MathFormula tex={`${count}\\text{ 行当前输入}`} /></Box></div>
    <span>{phase === "prefill" ? "示例：N=6 时，t=3 展示第 3 行；第 1、2、4、5、6 行同样参与计算。" : "示例：P=6，第一步 t=7；下一步 t=8。已算过的 KV 留在缓存，旧 Query 不重算。"}</span>
    <span style={{ color: COLORS.muted, fontSize: 12 }}>图采用单序列、5120 维单路张量视图；batch 与 Hyper-Connections 轴折叠。</span>
  </div></div>;

  if (kind === "tokenizer") return <div data-tokenizer={phase} style={{ ...panel, height: "auto" }}><Handle id="main-out" type="source" position={Position.Bottom} style={handle} /><Title>{phase === "prefill" ? "输入文本 → Tokenizer → Token IDs" : "Decode 输入来源 · 上一步生成的 Token ID"}</Title><div style={{ padding: 14, display: "grid", gap: 10 }}>
    {phase === "prefill" ? <><Box tone="blue">输入文本（含对话模板）</Box><FlowStep>Tokenizer 按词表编码；一个 token 可对应字、子词或标点</FlowStep></> : <><Box tone="blue">Prompt 已经 Tokenizer → Prefill</Box><FlowStep>上一位置的 logits → 采样 / argmax → 当前 ID</FlowStep></>}
    <div style={{ display: "grid", gridTemplateColumns: `76px repeat(${phase === "prefill" ? 6 : 1},minmax(0,1fr))`, alignItems: "center", gap: 8, textAlign: "center", fontSize: 13 }}>
      <strong>位置</strong>{tokenRows.map((s, i) => <MathFormula key={`p-${i}`} tex={s === "\\vdots" ? "\\cdots" : s} />)}
      <strong>Token ID</strong>{tokenRows.map((s, i) => s === "\\vdots" ? <MathFormula key={i} tex="\cdots" /> : <Box key={i} tone={s === "t" ? "amber" : "blue"}><MathFormula tex={`v_{${s}}`} /></Box>)}
    </div><span style={{ fontSize: 12, color: COLORS.muted }}>位置 t 与词表 ID <MathFormula tex="v_t" /> 分开：位置决定行号，同一个 ID 可以出现在多个位置。</span>
  </div></div>;

  if (kind === "embedding") return <div data-embedding style={{ ...panel, height: "auto", borderColor: COLORS.blue }}>{both}<Title>Embedding · 每个 Token ID 查词表中的一行</Title><div style={{ padding: 14, display: "grid", gap: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}><MathFormula tex="W^{\mathrm{emb}}" /><MathFormula tex="|\mathcal V|\times5120" /></div>
    {(phase === "prefill" ? ["1", "2", "t", "N"] : ["t"]).map(s => <div key={s} style={{ display: "grid", gridTemplateColumns: "65px 24px minmax(0,1fr) 24px 95px", gap: 6, alignItems: "center", fontSize: 12 }}><Box tone="amber"><MathFormula tex={`v_{${s}}`} /></Box><Operator tex="\to" /><VectorStrip name={`\\mathbf w^{\\mathrm{emb}}_{v_{${s}}}`} nameWidth={98} length="5120" elementTex={c => `w^{\\mathrm{emb}}_{v_{${s}},${c}}`} tone="blue" compact /><Operator tex="\to" /><MathFormula tex={`\\mathbf h_{1,${s}}^{\\mathrm{in}}`} /></div>)}
    <span style={{ fontSize: 12, color: COLORS.muted }}>按输入位置排成 {phase === "prefill" ? "N 行" : "1 行"}；词表参数共享，行号保持不变。</span>
  </div></div>;

  if (kind === "prior-layers") return <div style={{ ...panel, padding: 12, display: "grid", gap: 8, textAlign: "center", fontSize: 14 }}>{both}<strong>进入当前层之前</strong><MathFormula tex={`H_1^{\\mathrm{in}}\\;\\xrightarrow{\\mathrm{Layer}\\;1\\ldots${layer - 1}}\\;H_{${layer - 1}}^{\\mathrm{out}}=H_{${layer}}^{\\mathrm{in}}`} /><span>每层更新向量内容，token 位置 t 沿序列轴保留。</span></div>;

  if (kind === "query-row") return <div data-query-row={phase} style={{ ...panel, borderColor: COLORS.amber }}>{both}<Title>{phase === "prefill" ? "③ 展开完整矩阵中的第 t 行" : "③ 当前唯一一行 · 全局位置 t"}<span style={{ float: "right", fontSize: 11 }}><MathFormula tex="1\times(64\cdot512)" /></span></Title><div style={{ padding: 12, display: "grid", gap: 8 }}><VectorStrip name={`\\widetilde{\\mathbf q}_{${layer},t}`} length="32768" elementTex={c => `\\widetilde q_{${layer},t,${c}}`} tone="green" selected /><span style={{ fontSize: 12 }}>{phase === "prefill" ? "取行用于放大展示；并行计算仍覆盖 t=1,…,N。" : "本次没有其它 Query 行；历史 token 通过 KV 缓存参与注意力。"}</span></div></div>;

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
    return <div style={panel}>{output ? both : <><Handle id="main-in" type="target" position={Position.Top} style={handle} /><Handle id="main" type="source" position={Position.Bottom} style={handle} /><Handle id="residual" type="source" position={Position.Left} style={{ ...handle, background: COLORS.amber }} /></>}<Title><MathFormula tex={output ? `H_{${layer}}^{\\mathrm{out}}=H_{${layer}}'+O_{${layer}}^{\\mathrm{FFN}}` : `H_{${layer}}^{\\mathrm{in}}`} /></Title><div style={{ padding: 10 }}><Matrix rowIndices={tokenRows} tex={output ? `H_{${layer}}^{\\mathrm{out}}` : `H_{${layer}}^{\\mathrm{in}}`} shape={`${count}\\times5120`} rowTex={(row) => output ? `\\mathbf h_{${layer},${row}}^{\\mathrm{out}}` : `\\mathbf h_{${layer},${row}}^{\\mathrm{in}}`} elementTex={(row, column) => output ? `h_{${layer},${row},${column}}^{\\mathrm{out}}` : `h_{${layer},${row},${column}}^{\\mathrm{in}}`} tone={output ? "green" : "blue"} /></div></div>;
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
      <Title>Layer {layer} · {phase === "prefill" ? "Prefill：每个 Query 读取自己的因果窗口" : "Decode：新 KV 写入本层缓存，再读取当前窗口"}</Title>
      <div style={{ padding: 10, display: "grid", gap: 8, minWidth: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 20px .9fr", alignItems: "start", gap: 8, minWidth: 0 }}>
        <div style={{ minWidth: 0, display: "grid", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}><strong>{phase === "prefill" ? "完整 KV 潜向量矩阵" : "历史缓存 + 本步新行"}</strong><MathFormula tex={phase === "prefill" ? `U_{${layer}}\\in\\mathbb{R}^{N\\times512}` : `\\min(128,t)\\times512`} /></div>
          <MatrixBracket layer={layer} rows={phase === "decode" ? [{ row: "r", selected: true }, { row: "r+1", selected: true }, { row: "", ellipsis: true }, { row: "t-1", selected: true }, { row: "t", selected: true }] : [
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
          {phase === "decode" ? <><FlowStep><MathFormula tex={`\\mathbf u_{${layer},t}\\;\\to\\;\\text{当前槽位}`} /></FlowStep><RingCache layer={layer} /></> : <div data-prefill-causal style={{ display: "grid", gap: 6, padding: 6, fontSize: 11 }}><strong>例：N=6，各行只看自身及过去</strong><div style={{ display: "grid", gridTemplateColumns: "30px repeat(6,1fr)", gap: 3, textAlign: "center" }}><span>t ∖ KV</span>{[1, 2, 3, 4, 5, 6].map(s => <span key={`col-${s}`}>{s}</span>)}{[1, 2, 3, 4, 5, 6].map(t => <React.Fragment key={t}><span>{t}</span>{[1, 2, 3, 4, 5, 6].map(s => <span key={s} style={{ border: `1px solid ${s <= t ? COLORS.green : COLORS.line}`, background: s <= t ? COLORS.greenSoft : "transparent", color: s <= t ? COLORS.green : COLORS.faint }}>{s <= t ? "✓" : "—"}</span>)}</React.Fragment>)}</div><span>并行算各行 · 每行的可见 KV 不同</span></div>}
        </div>
      </div>
      </div>
      <SwaSelectionConnector layer={layer} />
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
    return <div style={{ ...panel, height: "auto", borderColor: COLORS.green }}>
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
          {phase === "decode" && ratio === 2 && <div data-compressor-pending style={{ display: "grid", gap: 7, padding: 8, border: `1px solid ${COLORS.amber}`, borderRadius: 7, fontSize: 12 }}><strong>跨步保留一组 KV 与 gate 分数</strong><div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", alignItems: "center", gap: 5 }}><Box tone="blue"><MathFormula tex="t=2i-1" /><br />第一行暂存</Box><Operator tex="\to" /><Box tone="amber"><MathFormula tex="t=2i" /><br />第二行到达，合并本组</Box></div><span>凑齐 2 行才新增压缩行；其余历史压缩行留在 G 缓存。</span></div>}
          {ratio === 2 ? <div style={{ display: "grid", gap: 7 }}>
            <Box tone="amber"><strong>每连续 2 行生成两组逐元素权重</strong><br /><MathFormula tex={`[\\boldsymbol\\alpha_{${layer},i,1};\\boldsymbol\\alpha_{${layer},i,2}]=\\operatorname{softmax}_{\\mathrm{row}}([\\mathbf a_{${layer},2i-1};\\mathbf a_{${layer},2i}])`} /></Box>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 22px 1fr 42px 1fr", alignItems: "center", gap: 5 }}>
              <Box><MathFormula tex={`\\mathbf v_{${layer},2i-1}^c\\in\\mathbb{R}^{512}`} /></Box><Operator tex="\odot" /><Box tone="amber"><MathFormula tex={`\\boldsymbol\\alpha_{${layer},i,1}\\in\\mathbb{R}^{512}`} /></Box><Operator tex="+" /><Box><MathFormula tex={`\\boldsymbol\\alpha_{${layer},i,2}\\odot\\mathbf v_{${layer},2i}^c`} /></Box>
            </div>
            <Arrow vertical />
            <Box tone="green"><MathFormula tex={`\\bar{\\mathbf g}_{${layer},i}=\\operatorname{RMSNorm}(\\boldsymbol\\alpha_{${layer},i,1}\\odot\\mathbf v_{${layer},2i-1}^c+\\boldsymbol\\alpha_{${layer},i,2}\\odot\\mathbf v_{${layer},2i}^c)`} /></Box>
          </div> : <Box tone="amber"><strong>压缩比 1 · 逐行归一化</strong><br /><MathFormula tex={`\\bar{\\mathbf g}_{${layer},i}=\\operatorname{RMSNorm}(\\mathbf v_{${layer},i}^c)`} /></Box>}
          <FlowStep><MathFormula tex={`\\bar G_{${layer}}`} /> 分支送入 Indexer；缓存分支按压缩组首 token 的位置旋转</FlowStep>
          <RotaryProcess input={`\\bar{\\mathbf g}_{${layer},i}`} output={`\\mathbf g_{${layer},i}`} position={`(i-1)\\cdot ${ratio}`} layer={layer} />
        </> : <Box tone="blue"><strong>读取源层输出矩阵</strong></Box>}
        <Matrix tex={`G_{${kvSource}}`} shape={`M\\times512,\\;M=\\lfloor ${phase === "prefill" ? "N" : "t"}/${ratio}\\rfloor`} rowTex={(row) => `\\mathbf g_{${kvSource},${row}}`} elementTex={(row, column) => `g_{${kvSource},${row},${column}}`} vectorLength="512" lastRow="M" tone="green" />
      </div>
    </div>;
  }

  if (kind === "indexer") {
    const kvSource = globalKvSourceLayer(layer)!;
    const indexSource = globalIndexSourceLayer(layer)!;
    const writesIndex = mode === "full" || mode === "reindex";
    return <div style={{ ...panel, height: "auto", borderColor: COLORS.amber }}>
      <Handle id="query" type="target" position={Position.Top} style={{ ...handle, left: "30%", background: COLORS.blue }} />
      <Handle id="global-matrix" type="target" position={Position.Top} style={{ ...handle, left: "70%" }} />
      <Handle id="matrix" type="source" position={Position.Bottom} style={{ ...handle, left: "30%" }} />
      <Handle id="indices" type="source" position={Position.Bottom} style={{ ...handle, left: "70%", background: COLORS.amber }} />
      <Title>{writesIndex ? <>Top-512 行选择 · Layer {layer} Indexer</> : <>复用 Layer {indexSource} 已算出的 Top-512 行号</>}</Title>
      <div style={{ padding: 10, display: "grid", gap: 7, fontSize: 11, minWidth: 0 }}>
        {writesIndex ? <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}><Box tone="blue"><MathFormula tex={`Q_{${layer}}^r\\in\\mathbb{R}^{${count}\\times1280}`} /></Box><Box tone="blue"><MathFormula tex={`X_{${layer}}\\in\\mathbb{R}^{${count}\\times5120}`} /></Box><Box tone="green"><MathFormula tex={`\\bar G_{${kvSource}}\\in\\mathbb{R}^{M\\times512}`} /></Box></div>
          <Arrow vertical />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}><Box><MathFormula tex={`Q_{${layer}}^I=Q_{${layer}}^rW_{${layer}}^{IQ}`} /><br /><MathFormula tex={`${count}\\times32\\times128`} /></Box><Box><MathFormula tex={`\\eta_{${layer}}=X_{${layer}}W_{${layer}}^{IW}/\\sqrt{32}`} /><br /><MathFormula tex={`${count}\\times32`} /></Box><Box><MathFormula tex={`\\widehat K_{${kvSource}}^I=\\bar G_{${kvSource}}W_{${kvSource}}^{IK}`} /><br /><MathFormula tex="M\times128" /></Box></div>
          <FlowStep>K 逐行 RMSNorm；Q 与 K 分别按各自位置旋转</FlowStep>
          <RotaryProcess input="\mathbf q^I_{h,t},\;\operatorname{RMSNorm}(\widehat{\mathbf k}^I_i)" output="\mathbf q^{I\prime}_{h,t},\;\mathbf k^{I\prime}_i" position={`t-1\\;(Q),\\quad (i-1)\\cdot ${compressionRatioForLayer(kvSource)}\\;(K)`} layer={layer} dimension={128} />
          <FlowStep>旋转后的 Q、K 计算索引得分；K 由源层缓存复用</FlowStep>
          <Box tone="amber"><MathFormula tex={`S_{${layer}}=\\sum_{h=1}^{32}\\eta_{${layer},h}\\operatorname{ReLU}(Q_{${layer},h}^{I\\prime}(K_{${kvSource}}^{I\\prime})^{\\mathsf T}/\\sqrt{128})\\in\\mathbb{R}^{${count}\\times M}`} /></Box>
        </> : <Box tone="blue"><strong>复用 Layer {indexSource} 得分矩阵</strong><br /><MathFormula tex={`S_{${indexSource}}\\in\\mathbb{R}^{${count}\\times M}`} /></Box>}
        <Arrow vertical />
        <Box tone="amber"><MathFormula tex={`K_{${indexSource},t}=\\min(512,\\lfloor t/${compressionRatioForLayer(kvSource)}\\rfloor)`} /><br /><MathFormula tex={`I_{${indexSource},t}=\\operatorname{TopK}(\\mathbf s_{${indexSource},t},K_{${indexSource},t})\\in\\mathbb{N}^{K_{${indexSource},t}}`} /><br />输出：当前位置 t 的最多 512 个行号</Box>
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
    if (!hasGlobal) return <div data-swa-only-kv style={{ ...panel, borderColor: COLORS.green }}>
      <Handle id="local" type="target" position={Position.Top} style={handle} />
      <Handle id="kv" type="source" position={Position.Bottom} style={handle} />
      <Title>SWA-only · 窗口 KV</Title>
      <div style={{ padding: 8 }}><RowMatrix tex={`\\mathrm{KV}_{${layer},t}=U_{${layer},t}^{\\mathrm{SWA}}`} shape="\min(128,t)\times512" rows={[`\\mathbf u_{${layer},r}`, `\\mathbf u_{${layer},r+1}`, "\\vdots", `\\mathbf u_{${layer},t}`]} rowLength="512" elementTex={(row, column) => `u_{${layer},${["r", "r+1", "", "t"][row]},${column}}`} /></div>
    </div>;
    return <div style={{ ...panel, borderColor: COLORS.green }}>
      <Handle id="local" type="target" position={Position.Top} style={{ ...handle, left: "30%" }} />
      <Handle id="global" type="target" position={Position.Top} style={{ ...handle, left: "70%" }} />
      <Handle id="kv" type="source" position={Position.Bottom} style={handle} />
      <Title>沿 KV 行维拼接：本地窗口 + 选中的全局行</Title>
      <div style={{ padding: 10, display: "grid", gridTemplateColumns: "1fr 30px 1fr 30px 1.3fr", alignItems: "center", gap: 6, minWidth: 0 }}>
        <Box tone="green"><MathFormula tex={`U_{${layer},t}^{\\mathrm{SWA}}`} /><br /><MathFormula tex="\min(128,t)\times512" /></Box><Arrow />
        <Box tone="green"><MathFormula tex={`G_{${kvSource},t}^{\\mathrm{selected}}`} /><br /><MathFormula tex={`K_{${indexSource},t}\\times512`} /></Box><Arrow />
        <Box tone="green"><MathFormula tex={`\\mathrm{KV}_{${layer},t}=[U_{${layer},t}^{\\mathrm{SWA}};G_{${kvSource},t}^{\\mathrm{selected}}]`} /><br /><MathFormula tex={`(\\min(128,t)+K_{${indexSource},t})\\times512`} /></Box>
      </div>
    </div>;
  }

  if (kind === "heads") {
    return <div style={{ ...panel, height: "auto" }}><Handle id="kv" type="target" position={Position.Top} style={{ ...handle, left: "70%" }} /><Handle id="main-out" type="source" position={Position.Bottom} style={handle} /><Title>Layer {layer} · 64 Heads · 第 t 行 Q → 位置旋转 → QK 打分 → softmax → V 加权 → 逆旋转 → O</Title><div style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr 40px 1fr", gap: 12 }}><Head index={1} layer={layer} /><Head index={2} layer={layer} /><div style={{ display: "grid", placeItems: "center", color: COLORS.faint, fontSize: 26 }}>⋯</div><Head index={64} layer={layer} /></div></div>;
  }

  if (kind === "concat") {
    return <div style={{ ...panel, height: "auto" }}>{both}<Title>Layer {layer} · 输出投影：64 Heads → 8 组低秩投影 → 5120 维</Title>
      <div data-output-projection-weight style={{ padding: 12, display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 30px 1fr", gap: 9 }}>{[1, 2, 8].map((group, index) => <React.Fragment key={group}>{index === 2 && <Operator tex="\cdots" />}<div data-output-group={group} style={{ minWidth: 0, display: "grid", gap: 6 }}>
          <strong style={{ fontSize: 12, color: COLORS.green }}>组 {group} · Head {(group - 1) * 8 + 1}–{group * 8} 沿列拼接</strong>
          <AttentionTensor tex={`C_{${group}}`} rows={count} columns="4096" scalar={(row, column) => `c^{(${group})}_{${row},${column}}`} />
          <FlowStep>每组独立投影</FlowStep>
          <AttentionTensor tex={`W^{OA}_{${layer},${group}}`} rows="4096" columns="1024" scalar={(row, column) => `w^A_{${row},${column}}`} tone="blue" />
          <FlowStep><MathFormula tex={`B_{${group}}=C_{${group}}W^{OA}_{${layer},${group}}`} /></FlowStep>
          <AttentionTensor tex={`B_{${group}}`} rows={count} columns="1024" scalar={(row, column) => `b^{(${group})}_{${row},${column}}`} />
        </div></React.Fragment>)}</div>
        <FlowStep>8 组沿列拼接 → 8192 维 → 最终线性投影</FlowStep>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 26px 1fr 26px 1fr", gap: 8, alignItems: "center" }}>
          <AttentionTensor tex="B=[B_1\mid B_2\mid\cdots\mid B_8]" rows={count} columns="8192" scalar={(row, column) => `b_{${row},${column}}`} />
          <Operator tex="\times" /><AttentionTensor tex={`W^{OB}_{${layer}}`} rows="8192" columns="5120" scalar={(row, column) => `w^B_{${row},${column}}`} tone="blue" />
          <Operator tex="=" /><AttentionTensor tex={`O_{${layer}}`} rows={count} columns="5120" scalar={(row, column) => `o_{${row},${column}}`} />
        </div>
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
        <RowMatrix tex={`Y_{${layer}}`} shape={`${count}\\times5120`} rows={(phase === "prefill" ? ["1", "2", "\\vdots", "N"] : tokenRows).map(s => s === "\\vdots" ? s : `\\mathbf y_{${layer},${s}}`)} tone="blue" rowLength="5120" elementTex={(row, column) => `y_{${layer},${(phase === "prefill" ? ["1", "2", "", "N"] : tokenRows)[row]},${column}}`} />
        <Operator tex="\times" />
        <div style={{ minWidth: 0, border: `1.3px solid ${COLORS.amber}`, background: COLORS.amberSoft, borderRadius: 7, padding: 7, display: "grid", gap: 6, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}><MathFormula tex={`W_{${layer}}^R`} /><span style={{ fontSize: 10 }}><MathFormula tex="5120\times384" /></span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr .45fr 1fr", gap: 5, fontSize: 10, alignItems: "center" }}>
            {["1", "2", "\\cdots", "384"].map(expert => expert === "\\cdots" ? <MathFormula key={expert} tex={expert} /> : <div key={expert} style={{ border: `1px solid ${COLORS.amber}`, borderRadius: 4, padding: "22px 2px" }}><MathFormula tex={`\\mathbf w_{${layer},${expert}}^R`} /></div>)}
          </div>
        </div>
        <Operator tex="=" />
        <div style={{ position: "relative", minWidth: 0, minHeight: 64, display: "grid", placeItems: "center", padding: "18px 7px 7px", border: `1.3px solid ${COLORS.green}`, borderRadius: 7, background: COLORS.greenSoft }}>
          <span style={{ position: "absolute", top: 5, right: 6, fontSize: 9 }}><MathFormula tex={`${count}\\times384`} /></span>
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
        <div style={{ padding: "0 10px", display: "flex", justifyContent: "space-between", fontSize: 11 }}><MathFormula tex={`S_{${layer}}`} /><MathFormula tex={`${count}\\times384`} /></div>
        {["", ...tokenRows].map((row, rowIndex) => row === "\\vdots" ? <div key={rowIndex} style={{ textAlign: "center", fontSize: 9 }}><MathFormula tex="\vdots" /></div> : <div key={rowIndex} style={{ padding: `0 ${EXPERTS_PADDING}px`, display: "grid", gridTemplateColumns: `${SHARED_GROUP_WIDTH}px minmax(0,1fr)`, gap: EXPERT_GROUP_GAP, alignItems: "center", textAlign: "center", fontSize: 9 }}>
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
    return <div style={{ ...panel, height: "auto" }}>
      {VISIBLE_ROUTED_EXPERTS.map((expert, index) => <Handle key={expert.id} id={`expert-${expert.id}`} type="target" position={Position.Top} style={{ ...handle, left: `${ROUTED_HANDLE_LEFT[index]}%`, background: COLORS.amber }} />)}
      <Handle id="shared" type="target" position={Position.Left} style={{ ...handle, top: "50%", background: COLORS.blue }} />
      <Handle id="shared-out" type="source" position={Position.Bottom} style={{ ...handle, left: `${SHARED_HANDLE_LEFT}%`, background: COLORS.blue }} />
      {VISIBLE_ROUTED_EXPERTS.map((expert, index) => <Handle key={expert.id} id={`expert-out-${expert.id}`} type="source" position={Position.Bottom} style={{ ...handle, left: `${ROUTED_HANDLE_LEFT[index]}%`, background: COLORS.amber }} />)}
      <Title>Layer {layer} · 专家层 · 得分为示意</Title>
      <div style={{ padding: EXPERTS_PADDING, display: "grid", gridTemplateColumns: `${SHARED_GROUP_WIDTH}px minmax(0,1fr)`, gap: EXPERT_GROUP_GAP, alignItems: "start" }}>
        <section data-expert-group="shared" style={{ minWidth: 0, display: "grid", gap: 10 }}>
          <strong style={{ color: COLORS.blue, fontSize: 14 }}>共享专家 · 直接接收 <MathFormula tex={`Y_{${layer}}`} /></strong>
          <Expert layer={layer} shared />
        </section>
        <section data-expert-group="routed" style={{ minWidth: 0, padding: EXPERT_GROUP_INSET - 1, border: `1px solid ${COLORS.amber}`, borderRadius: 10, display: "grid", gap: 10 }}>
          <strong style={{ color: COLORS.amber, fontSize: 14 }}>非共享专家 · Router Top-6</strong>
          <div style={{ display: "grid", gridTemplateColumns: EXPERT_GRID_COLUMNS, gap: EXPERT_CARD_GAP }}>{VISIBLE_ROUTED_EXPERTS.map((expert, index) => <React.Fragment key={expert.id}>{index === 2 && <div data-expert-ellipsis style={{ display: "grid", placeItems: "center", fontSize: 28 }}><MathFormula tex={"\\cdots"} /></div>}<Expert layer={layer} index={expert.id} score={expert.score} /></React.Fragment>)}</div>
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

  if (kind === "expert-output" || kind === "expert-weight" || kind === "expert-scale" || kind === "expert-weighted") {
    const expert = data.expertId === undefined ? "\\mathrm{shared}" : String(data.expertId);
    const shared = data.expertId === undefined;
    const color = shared ? COLORS.blue : COLORS.amber;
    if (kind === "expert-weight") return <div data-expert-weight={expert} style={{ ...panel, borderColor: color, display: "grid", placeContent: "center", gap: 4, textAlign: "center", fontSize: 14 }}>
      <Handle id="weight-out" type="source" position={Position.Right} style={{ ...handle, background: color }} />
      <span style={{ fontSize: 11 }}>{shared ? "共享权重" : "Router · 第 t 行权重"}</span><MathFormula tex={shared ? "1" : `g_{${layer},${expert},t}`} />
    </div>;
    if (kind === "expert-scale") return <div data-expert-scale={expert} style={{ width: "100%", height: "100%", borderRadius: "50%", border: `2px solid ${color}`, boxSizing: "border-box", display: "grid", placeItems: "center", background: COLORS.card }}>
      <Handle id="main-in" type="target" position={Position.Top} style={handle} /><Handle id="weight-in" type="target" position={Position.Left} style={{ ...handle, background: color }} /><Handle id="main-out" type="source" position={Position.Bottom} style={handle} /><Operator tex="\times" />
    </div>;
    if (kind === "expert-weighted") return <div data-expert-weighted={expert} style={{ ...panel, height: "auto", borderColor: color }}>{both}
      <Title><MathFormula tex={`\\mathbf r_{${layer},${expert},t}=${shared ? "1" : `g_{${layer},${expert},t}`}\\,\\mathbf e_{${layer},${expert},t}`} /><span style={{ float: "right", fontSize: 11 }}><MathFormula tex="1\times5120" /></span></Title>
      <div style={{ padding: 8 }}><VectorStrip name={`\\mathbf r_{${layer},${expert},t}`} nameWidth={110} length="5120" elementTex={column => `r_{${layer},${expert},t,${column}}`} tone={shared ? "blue" : "amber"} compact /></div>
    </div>;
    const rows = tokenRows;
    return <div data-expert-output={expert} style={{ ...panel, height: "auto", borderColor: color }}>{both}
      <Title>{shared ? "共享专家输出" : `Expert ${expert} 输出`} · <MathFormula tex={`E_{${layer},${expert}}(Y_{${layer}})`} /><span style={{ float: "right", fontSize: 11 }}><MathFormula tex={`${count}\\times5120`} /></span></Title>
      <div style={{ padding: 9, display: "grid", gap: 5 }}>{rows.map((row, index) => row === "\\vdots" ? <div key={index} style={{ textAlign: "center" }}><MathFormula tex={row} /></div> : <VectorStrip key={index} name={`\\mathbf e_{${layer},${expert},${row}}`} nameWidth={110} length="5120" elementTex={column => `e_{${layer},${expert},${row},${column}}`} tone={shared ? "blue" : "green"} selected={row === "t"} compact />)}</div>
    </div>;
  }

  if (kind === "moe-sum") {
    return <div data-moe-weighted-sum style={{ width: "100%", height: "100%", borderRadius: 24, border: `3px solid ${COLORS.green}`, boxSizing: "border-box", background: COLORS.greenSoft, display: "grid", placeContent: "center", textAlign: "center", gap: 3, color: COLORS.green }}>
      {EXPERT_OUTPUT_BRANCHES.map((branch, index) => <Handle key={branch.key} id={`term-${branch.key}`} type="target" position={Position.Top} style={{ ...handle, left: `${(index + 1) * 20}%` }} />)}
      <Handle id="main-out" type="source" position={Position.Bottom} style={handle} /><span style={{ fontSize: 23 }}><MathFormula tex="\sum" /></span><strong style={{ fontSize: 12 }}>逐元素相加 · 1 路共享 + Top-6</strong>
    </div>;
  }

  if (kind === "moe-output") {
    return <div style={{ ...panel, display: "grid", placeContent: "center", textAlign: "center", gap: 7, borderColor: COLORS.green, background: COLORS.greenSoft, fontSize: 14 }}><Handle id="main-in" type="target" position={Position.Top} style={handle} /><Handle id="main-out" type="source" position={Position.Bottom} style={handle} /><MathFormula tex={`\\mathbf o_{${layer},t}^{\\mathrm{FFN}}=\\mathbf r_{${layer},\\mathrm{shared},t}+\\sum_{i\\in I_{${layer},t}}\\mathbf r_{${layer},i,t}`} /><span style={{ fontSize: 11 }}>{phase === "prefill" ? "各 token 的结果按行组成 " : "当前一步的输出矩阵 "} <MathFormula tex={`O_{${layer}}^{\\mathrm{FFN}}\\in\\mathbb R^{${count}\\times5120}`} /></span></div>;
  }

  return <div style={panel}>{both}<Title><MathFormula tex={`H_{${layer}}^{\\mathrm{out}}`} /></Title></div>;
}

function DiagramNodeView({ data, selected }: NodeProps<DiagramNode>) {
  const compact = data.kind === "add1" || data.kind === "add2" || data.kind === "moe-sum" || data.kind === "expert-scale";
  const portColor = data.tone === "amber" ? COLORS.amber : data.tone === "blue" ? COLORS.blue : COLORS.green;
  // [OM-FREEPLAY] 求和器保留 320px 最小宽度，让四个入口之间有独立走线净空。
  const minimumWidth = data.kind === "moe-sum" ? 320 : compact ? 60 : data.kind === "structure-operator" ? 36 : 100;
  const minimumHeight = data.kind === "moe-sum" ? 100 : compact
    ? 60
    : data.matrixRows?.length
      ? 180
      : data.kind === "structure-group"
        ? 120
        : data.title
          ? 96
          : 40;
  return <div data-boundary-connectable={data.kind !== "structure-operator"} data-frame-selected={Boolean(selected)} style={{ width: "100%", height: CONTENT_SIZED_KINDS.has(data.kind) ? "auto" : "100%", ...(CONTENT_SIZED_KINDS.has(data.kind) ? { minHeight: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr)" } : {}), position: "relative", borderRadius: compact ? "50%" : 12 }}>
    <EightResizeHandles minWidth={minimumWidth} minHeight={minimumHeight} />
    <EightConnectionPorts color={portColor} />
    <ExecutionContext.Provider value={data.phase ?? "prefill"}><DiagramNodeContent data={data} /></ExecutionContext.Provider>
  </div>;
}

const NodeView = memo(DiagramNodeView);
const nodeTypes = { diagram: NodeView };
const edgeTypes = { "editable-orthogonal": EditableOrthogonalEdge };

function node(id: string, kind: NodeKind, layer: number, mode: LayerMode, x: number, y: number, width: number, height: number): DiagramNode {
  return { id, type: "diagram", position: { x, y }, data: { kind, layer, mode }, style: { width, ...(CONTENT_SIZED_KINDS.has(kind) ? { minHeight: "max-content" } : { height }) }, deletable: false };
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
  parentId?: string;
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
    extent: parentId ? "parent" : undefined,
    expandParent: Boolean(parentId),
    position: { x, y },
    data: { kind, layer, mode, ...data },
    style: { width, height },
    deletable: false,
  };
}

export function buildGraph(layer: number, contentHeights: ReadonlyMap<string, number> = new Map(), phase: ExecutionPhase = "prefill"): { nodes: DiagramNode[]; edges: EditableEdge[] } {
  const mode = modeForLayer(layer);
  const { count, rows } = executionAxis(phase);
  const matrixRows = (prefix: string) => (phase === "prefill" ? ["1", "2", "\\vdots", "N"] : rows).map(s => s === "\\vdots" ? s : `${prefix}_{${layer},${s}}`);
  const hasGlobal = mode !== "swa";
  const mainGap = architectureFanoutGap(3);
  const tokenizerHeight = contentHeights.get("tokenizer") ?? 260;
  const embeddingY = tokenizerHeight + mainGap;
  const embeddingHeight = contentHeights.get("embedding") ?? 260;
  const firstInputY = embeddingY + embeddingHeight + mainGap;
  const tensorHeight = phase === "prefill" ? 300 : 170;
  const priorLayersY = firstInputY + tensorHeight + mainGap;
  const inputY = layer === 1 ? firstInputY : priorLayersY + 120 + mainGap;
  const norm1Y = inputY + tensorHeight + 55;
  const projectionY = norm1Y + 72 + mainGap;
  const queryLayout = queryProjectionLayout(phase);
  const queryProjectionHeight = queryLayout.height;
  const queryRowY = projectionY + queryProjectionHeight + mainGap;
  const querySplitY = queryRowY + 160 + mainGap;
  const localKvProjectionHeight = contentHeights.get("kv") ?? 464;
  const swaHeight = 530;
  const compressorHeight = contentHeights.get("compressor") ?? (mode === "full" && compressionRatioForLayer(layer) === 2 ? 720 : 450);
  const indexerHeight = contentHeights.get("indexer") ?? 450;
  const globalSelectHeight = 330;
  const sourceRowHeight = hasGlobal
    ? Math.max(queryProjectionHeight, localKvProjectionHeight, compressorHeight)
    : Math.max(queryProjectionHeight, localKvProjectionHeight);
  const swaY = Math.max(projectionY + sourceRowHeight, querySplitY + 150) + mainGap;
  const globalSelectY = swaY + indexerHeight + mainGap;
  const mergeY = hasGlobal ? Math.max(swaY + swaHeight, globalSelectY + globalSelectHeight) + mainGap : swaY + swaHeight + mainGap;
  const mergeHeight = hasGlobal ? 200 : 220;
  const headsY = mergeY + mergeHeight + mainGap;
  const headsHeight = contentHeights.get("heads") ?? 374;
  const concatY = headsY + headsHeight + mainGap;
  const concatHeight = contentHeights.get("concat") ?? 276;
  const add1Y = concatY + concatHeight + mainGap;
  const state1Y = add1Y + 70 + mainGap;
  const norm2Y = state1Y + 72 + mainGap;
  const moeInputY = norm2Y + 72 + mainGap;
  const routerY = moeInputY + 80 + mainGap;
  const routerHeight = 240;
  const scoresY = routerY + routerHeight + mainGap;
  const scoresHeight = 320;
  const expertsY = scoresY + scoresHeight + mainGap;
  const expertsHeight = contentHeights.get("experts") ?? 1300;
  const expertOutputY = expertsY + expertsHeight + mainGap;
  const expertOutputHeight = Math.max(...EXPERT_OUTPUT_BRANCHES.map(branch => contentHeights.get(`expert-output-${branch.key}`) ?? 240));
  const expertScaleY = expertOutputY + expertOutputHeight + mainGap;
  const weightedY = expertScaleY + 70 + mainGap;
  const weightedHeight = Math.max(...EXPERT_OUTPUT_BRANCHES.map(branch => contentHeights.get(`expert-weighted-${branch.key}`) ?? 100));
  const moeSumY = weightedY + weightedHeight + architectureFanoutGap(EXPERT_OUTPUT_BRANCHES.length);
  const moeOutputY = moeSumY + 100 + mainGap;
  const add2Y = moeOutputY + 100 + mainGap;
  const outputY = add2Y + 70 + mainGap;
  const nodes: DiagramNode[] = [
    node("tokenizer", "tokenizer", layer, mode, 400, 0, 800, tokenizerHeight),
    node("execution-guide", "execution-guide", layer, mode, 1300, 0, 650, contentHeights.get("execution-guide") ?? 330),
    node("embedding", "embedding", layer, mode, 400, embeddingY, 800, embeddingHeight),
    node("input", "tensor", layer, mode, 450, inputY, 700, tensorHeight),
    node("norm1", "norm1", layer, mode, 620, norm1Y, 360, 72),
    node("q", "projection-q", layer, mode, 20, projectionY, 800, queryProjectionHeight),
    node("q-row", "query-row", layer, mode, 20, queryRowY, 800, 160),
    node("kv", "projection-kv", layer, mode, 920, projectionY, 500, localKvProjectionHeight),
    node("swa-window", "swa-window", layer, mode, hasGlobal ? 40 : 350, swaY, hasGlobal ? 780 : 900, swaHeight),
    node("kv-merge", "kv-merge", layer, mode, hasGlobal ? 300 : 480, mergeY, hasGlobal ? 1000 : 640, mergeHeight),
    // [OM-FREEPLAY] 三个 Head 展开后采用与专家区一致的 2800px 画布宽度。
    node("heads", "heads", layer, mode, 40, headsY, 2800, headsHeight),
    node("concat", "concat", layer, mode, 150, concatY, 1220, concatHeight),
    node("add1", "add1", layer, mode, 765, add1Y, 70, 70),
    node("state1", "state1", layer, mode, 620, state1Y, 360, 72),
    node("norm2", "norm2", layer, mode, 620, norm2Y, 360, 72),
    node("moe-input", "moe-input", layer, mode, 715, moeInputY, 170, 80),
    node("router", "router", layer, mode, 320, routerY, 960, routerHeight),
    node("scores", "scores", layer, mode, 70, scoresY, EXPERTS_WIDTH, scoresHeight),
    node("experts", "experts", layer, mode, 70, expertsY, EXPERTS_WIDTH, expertsHeight),
    node("moe-sum", "moe-sum", layer, mode, 70 + EXPERTS_WIDTH / 2 - 160, moeSumY, 320, 100),
    node("moe-output", "moe-output", layer, mode, 70 + EXPERTS_WIDTH / 2 - 320, moeOutputY, 640, 100),
    node("add2", "add2", layer, mode, 765, add2Y, 70, 70),
    node("output", "output", layer, mode, 450, outputY, 700, tensorHeight),
  ];
  if (layer > 1) {
    nodes.push(node("first-input", "tensor", 1, mode, 450, firstInputY, 700, tensorHeight));
    nodes.push(node("prior-layers", "prior-layers", layer, mode, 450, priorLayersY, 700, 120));
  }
  for (const branch of EXPERT_OUTPUT_BRANCHES) {
    for (const item of [
      node(`expert-output-${branch.key}`, "expert-output", layer, mode, branch.center - branch.width / 2, expertOutputY, branch.width, expertOutputHeight),
      node(`expert-weight-${branch.key}`, "expert-weight", layer, mode, branch.center - 265, expertScaleY, 145, 70),
      node(`expert-scale-${branch.key}`, "expert-scale", layer, mode, branch.center - 35, expertScaleY, 70, 70),
      node(`expert-weighted-${branch.key}`, "expert-weighted", layer, mode, branch.center - branch.width / 2, weightedY, branch.width, weightedHeight),
    ]) nodes.push({ ...item, data: { ...item.data, expertId: branch.expertId } });
  }
  const omittedX = (EXPERT_OUTPUT_BRANCHES[2].center + EXPERT_OUTPUT_BRANCHES[3].center) / 2;
  nodes.push({ ...node("weighted-expert-ellipsis", "structure-operator", layer, mode, omittedX - 20, weightedY + 25, 40, 40), data: { kind: "structure-operator", layer, mode, tex: "\\cdots" } });
  nodes.push(
    { ...node("swa-result", "swa-output", layer, mode, 10, 414, ((hasGlobal ? 780 : 900) - 56) * 1.7 / 2.6, 82), parentId: "swa-window", extent: "parent" },
    structureNode({ id: "q-x", parentId: "q", layer, mode, x: 28, y: queryLayout.firstY, width: 200, height: queryLayout.rowHeight, title: "输入矩阵", tex: `X_{${layer}}\\in\\mathbb R^{${count}\\times5120}`, matrixRows: matrixRows("\\mathbf x"), tone: "blue" }),
    structureNode({ id: "q-mul-down", parentId: "q", layer, mode, x: 236, y: queryLayout.firstY + (queryLayout.rowHeight - 44) / 2, width: 36, height: 44, kind: "structure-operator", tex: "\\times" }),
    structureNode({ id: "q-wdown", parentId: "q", layer, mode, x: 280, y: queryLayout.firstY + (queryLayout.rowHeight - 128) / 2, width: 230, height: 128, title: "5120 × 1280 · 列向量", tex: `W_{${layer}}^{Q\\downarrow}`, columnVectors: true, vectorCells: [`\\mathbf w_{${layer},1}^{Q\\downarrow}`, `\\mathbf w_{${layer},2}^{Q\\downarrow}`, "\\cdots", `\\mathbf w_{${layer},1280}^{Q\\downarrow}`], tone: "amber" }),
    structureNode({ id: "q-equals-down", parentId: "q", layer, mode, x: 518, y: queryLayout.firstY + (queryLayout.rowHeight - 44) / 2, width: 36, height: 44, kind: "structure-operator", tex: "=" }),
    structureNode({ id: "q-low-rank", parentId: "q", layer, mode, x: 562, y: queryLayout.firstY, width: 210, height: queryLayout.rowHeight, title: "低秩矩阵", tex: `Q_{${layer}}^{r}\\in\\mathbb R^{${count}\\times1280}`, matrixRows: matrixRows("\\mathbf q").map(s => s === "\\vdots" ? s : `${s}^{r}`), tone: "green" }),
    structureNode({ id: "q-low-rank-up", parentId: "q", layer, mode, x: 28, y: queryLayout.secondY, width: 200, height: queryLayout.rowHeight, title: "同一低秩矩阵", tex: `Q_{${layer}}^{r}`, matrixRows: matrixRows("\\mathbf q").map(s => s === "\\vdots" ? s : `${s}^{r}`), tone: "green" }),
    structureNode({ id: "q-mul-up", parentId: "q", layer, mode, x: 236, y: queryLayout.secondY + (queryLayout.rowHeight - 44) / 2, width: 36, height: 44, kind: "structure-operator", tex: "\\times" }),
    structureNode({ id: "q-wup", parentId: "q", layer, mode, x: 280, y: queryLayout.secondY + (queryLayout.rowHeight - 128) / 2, width: 230, height: 128, title: "1280 × (64 · 512) · 列向量", tex: `W_{${layer}}^{Q\\uparrow}`, columnVectors: true, vectorCells: [`\\mathbf w_{${layer},1}^{Q\\uparrow}`, `\\mathbf w_{${layer},2}^{Q\\uparrow}`, "\\cdots", `\\mathbf w_{${layer},64\\cdot512}^{Q\\uparrow}`], tone: "amber" }),
    structureNode({ id: "q-equals-up", parentId: "q", layer, mode, x: 518, y: queryLayout.secondY + (queryLayout.rowHeight - 44) / 2, width: 36, height: 44, kind: "structure-operator", tex: "=" }),
    structureNode({
      id: "q-wide-matrix",
      parentId: "q",
      layer,
      mode,
      x: 562,
      y: queryLayout.secondY,
      width: 210,
      height: queryLayout.resultHeight,
      title: "升维输出矩阵",
      tex: `\\widetilde Q_{${layer}}\\in\\mathbb R^{${count}\\times(64\\cdot512)}`,
      tone: "green",
      matrixRows: rows.map(s => s === "\\vdots" ? s : `\\widetilde{\\mathbf q}_{${layer},${s}}`),
      matrixSelectedRow: rows.indexOf("t"),
    }),
    structureNode({ id: "q-head-slice", layer, mode, x: 20, y: querySplitY, width: 800, height: 150, kind: "structure-group", tex: `\\widetilde{\\mathbf q}_{${layer},t}`, title: "④ 沿特征轴分 64 块 · token 位置 t 不变", tone: "green" }),
    structureNode({ id: "q-head-1", parentId: "q-head-slice", layer, mode, x: 12, y: 42, width: 210, height: 64, title: "Head 1 · 元素 1–512", tex: `\\mathbf q_{${layer},1,t}`, tone: "green" }),
    structureNode({ id: "q-head-2", parentId: "q-head-slice", layer, mode, x: 234, y: 42, width: 210, height: 64, title: "Head 2 · 元素 513–1024", tex: `\\mathbf q_{${layer},2,t}`, tone: "green" }),
    structureNode({ id: "q-head-more", parentId: "q-head-slice", layer, mode, x: 451, y: 52, width: 36, height: 44, kind: "structure-operator", tex: "\\cdots" }),
    structureNode({ id: "q-head-64", parentId: "q-head-slice", layer, mode, x: 496, y: 42, width: 234, height: 64, title: "Head 64 · 元素 32257–32768", tex: `\\mathbf q_{${layer},64,t}`, tone: "green" }),
  );
  if (hasGlobal) {
    nodes.push(node("compressor", "compressor", layer, mode, 1450, projectionY, 480, compressorHeight));
    nodes.push(node("indexer", "indexer", layer, mode, 1160, swaY, 700, indexerHeight));
    nodes.push(node("global-select", "global-select", layer, mode, 1160, globalSelectY, 820, globalSelectHeight));
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
    makeEdge("tokenizer-embedding", "tokenizer", "embedding"),
    makeEdge("embedding-first-input", "embedding", layer === 1 ? "input" : "first-input"),
    makeEdge("input-norm", "input", "norm1", undefined, { sourceHandle: "main" }),
    mathEdge("norm-q", "norm1", "q", `X_{${layer}}`, { sourceHandle: "query", targetHandle: "port-top" }),
    mathEdge("norm-kv", "norm1", "kv", `X_{${layer}}`, { sourceHandle: "local-kv" }),
    makeEdge("query-matrix-row", "q-wide-matrix", "q-row", undefined, { sourceHandle: "port-bottom" }),
    makeEdge("query-row-split", "q-row", "q-head-slice", undefined, { targetHandle: "port-top" }),
    mathEdge("kv-swa", "kv", "swa-window", phase === "prefill" ? `U_{${layer}}\\in\\mathbb{R}^{N\\times512}` : `\\mathbf u_{${layer},t}\\in\\mathbb{R}^{1\\times512}`, { sourceHandle: "swa", targetHandle: "projected-kv" }),
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
    makeEdge("sum-moe-output", "moe-sum", "moe-output"),
    mathEdge("moe-output-add2", "moe-output", "add2", `O_{${layer}}^{\\mathrm{FFN}}`),
    mathEdge("state1-add2", "state1", "add2", `H_{${layer}}'`, { sourceHandle: "residual", targetHandle: "skip", ...skipStyle, data: { ...skipStyle.data, waypoints: ffnResidualWaypoints } }),
    makeEdge("add2-output", "add2", "output"),
  ];
  if (layer > 1) edges.push(makeEdge("first-input-prior-layers", "first-input", "prior-layers", undefined, { sourceHandle: "main" }), makeEdge("prior-layers-input", "prior-layers", "input"));
  for (const head of [1, 2, 64]) edges.push(mathEdge(`query-head-${head}`, `q-head-${head}`, "heads", `\\mathbf q_{${layer},${head},t}`, { sourceHandle: "port-bottom", targetHandle: `query-${head}` }));
  for (const expert of VISIBLE_ROUTED_EXPERTS) {
    edges.push(makeEdge(`score-expert-${expert.id}`, "scores", "experts", `g_{${layer},${expert.id}}=${expert.score}`, { sourceHandle: `score-${expert.id}`, targetHandle: `expert-${expert.id}`, style: { stroke: COLORS.amber, strokeWidth: 2 }, markerEnd: { type: MarkerType.Arrow, width: 20, height: 20, color: COLORS.amber } }));
  }
  for (const branch of EXPERT_OUTPUT_BRANCHES) {
    const expert = branch.expertId === undefined ? "\\mathrm{shared}" : branch.key;
    const color = branch.expertId === undefined ? COLORS.blue : COLORS.amber;
    const branchStyle = { style: { stroke: color, strokeWidth: 2 }, markerEnd: { type: MarkerType.Arrow, width: 20, height: 20, color }, data: { color } };
    edges.push(makeEdge(`expert-result-${branch.key}`, "experts", `expert-output-${branch.key}`, undefined, { ...branchStyle, sourceHandle: branch.expertId === undefined ? "shared-out" : `expert-out-${branch.key}` }));
    edges.push(mathEdge(`expert-row-${branch.key}`, `expert-output-${branch.key}`, `expert-scale-${branch.key}`, `\\mathbf e_{${layer},${expert},t}`, branchStyle));
    edges.push(makeEdge(`expert-gate-${branch.key}`, `expert-weight-${branch.key}`, `expert-scale-${branch.key}`, undefined, { ...branchStyle, sourceHandle: "weight-out", targetHandle: "weight-in" }));
    edges.push(makeEdge(`expert-product-${branch.key}`, `expert-scale-${branch.key}`, `expert-weighted-${branch.key}`, undefined, branchStyle));
    edges.push(makeEdge(`expert-sum-${branch.key}`, `expert-weighted-${branch.key}`, "moe-sum", undefined, { ...branchStyle, targetHandle: `term-${branch.key}` }));
  }
  if (hasGlobal) {
    const kvSource = globalKvSourceLayer(layer)!;
    const indexSource = globalIndexSourceLayer(layer)!;
    if (mode === "full") edges.push(mathEdge("norm-compressor", "norm1", "compressor", `X_{${layer}}`, { sourceHandle: "global-kv", targetHandle: "input" }));
    if (mode === "full" || mode === "reindex") edges.push(mathEdge("q-low-rank-indexer", "q-low-rank", "indexer", `Q_{${layer}}^r`, { sourceHandle: "port-right", targetHandle: "query" }));
    edges.push(mathEdge("compressor-indexer", "compressor", "indexer", mode === "full" ? `\\bar G_{${kvSource}}` : `K_{${kvSource}}^{I\\prime}\\;\\mathrm{cache}`, { sourceHandle: "to-indexer", targetHandle: "global-matrix" }));
    edges.push(mathEdge("indexer-matrix", "compressor", "global-select", `G_{${kvSource}}`, { sourceHandle: "to-indexer", targetHandle: "matrix" }));
    edges.push(mathEdge("indexer-select", "indexer", "global-select", `I_{${indexSource},t}\\in\\mathbb{N}^{K_{${indexSource},t}}`, { sourceHandle: "indices", targetHandle: "indices", style: { stroke: COLORS.amber, strokeWidth: 2.2 }, markerEnd: { type: MarkerType.Arrow, width: 22, height: 22, color: COLORS.amber } }));
    edges.push(mathEdge("select-merge", "global-select", "kv-merge", `G_{${kvSource},t}^{\\mathrm{selected}}`, { sourceHandle: "selected", targetHandle: "global" }));
  }
  return { nodes: nodes.map(item => ({ ...item, data: { ...item.data, phase } })), edges };
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

export function applySavedLayout(graph: { nodes: DiagramNode[]; edges: EditableEdge[] }, saved: SavedDiagramLayout) {
  const nodeLayouts = new Map(saved.nodes.map((item) => [item.id, item]));
  // 插入新阶段后，从该阶段起重新排布；保留此前节点的手动位置。
  const insertedStageY = Math.min(...graph.nodes.filter(item => !item.parentId && !nodeLayouts.has(item.id)).map(item => item.position.y));
  const nodes = graph.nodes.map((item) => {
    const layout = nodeLayouts.get(item.id);
    if (!layout) return item;
    if (!item.parentId && item.position.y >= insertedStageY) return item;
    return {
      ...item,
      position: { x: layout.x, y: layout.y },
      style: { ...item.style, ...(layout.width ? { width: layout.width } : {}), ...(layout.height ? { height: layout.height } : {}) },
    };
  });
  const baselineEdges = new Map(graph.edges.map((item) => [item.id, item]));
  const nodeIds = new Set(nodes.map((item) => item.id));
  const edges: EditableEdge[] = saved.edges
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
  const restoredEdgeIds = new Set(edges.map(item => item.id));
  for (const edge of graph.edges) {
    if (!restoredEdgeIds.has(edge.id) && (!nodeLayouts.has(edge.source) || !nodeLayouts.has(edge.target))) edges.push(edge);
  }
  return { nodes, edges };
}

function DiagramCanvas({ layer, phase }: { layer: number; phase: ExecutionPhase }) {
  const initialGraph = useMemo(() => buildGraph(layer, new Map(), phase), [layer, phase]);
  const measuredLayoutRef = useRef(initialGraph);
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
  const storageKey = `oasismind:deepseek-v41-layer-layout:v8:${phase}:${layer}`;

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
    measuredLayoutRef.current = buildGraph(layer, new Map(cloned.nodes.filter(item => CONTENT_SIZED_KINDS.has(item.data.kind) && item.measured?.height).map(item => [item.id, item.measured!.height!])), phase);
    setNodes(cloned.nodes);
    setEdges(cloned.edges);
    setSelectedEdgeIds([]);
    setSaveState("idle");
  }, [layer, phase, setEdges, setNodes]);

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
    measuredLayoutRef.current = initialGraph;
    // [OM-FREEPLAY] 用户要求能自行微调；显式保存到浏览器本机，避免刷新后丢失，同时不改文章事实源。
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as SavedDiagramLayout;
        // 保存时的实测高度也是布局基线，避免水合后再次累加同一高度差。
        const sizedGraph = buildGraph(layer, new Map(saved.nodes.filter(item => item.height).map(item => [item.id, item.height!])), phase);
        measuredLayoutRef.current = sizedGraph;
        graph = applySavedLayout(sizedGraph, saved);
      }
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

  // 内容尺寸由 React Flow 的 ResizeObserver 测量；下游位置由同一布局函数推导。
  // 只移动自动布局基线的差值，保留用户拖动产生的偏移，不清除已保存的布局。
  useEffect(() => {
    if (nodes.some(item => item.id !== "first-input" && item.data.layer !== layer)) return;
    const heights = new Map(nodes.filter(item => CONTENT_SIZED_KINDS.has(item.data.kind) && item.measured?.height).map(item => [item.id, item.measured!.height!]));
    if (!heights.size) return;
    const previous = measuredLayoutRef.current;
    const next = buildGraph(layer, heights, phase);
    const oldPositions = new Map(previous.nodes.map(item => [item.id, item.position]));
    const deltas = new Map(next.nodes.map(item => [item.id, item.position.y - (oldPositions.get(item.id)?.y ?? item.position.y)]));
    if (![...deltas.values()].some(delta => Math.abs(delta) > .5)) return;
    measuredLayoutRef.current = next;
    setNodes(current => current.map(item => item.parentId || !deltas.get(item.id) ? item : { ...item, position: { ...item.position, y: item.position.y + deltas.get(item.id)! } }));
    const oldEdges = new Map(previous.edges.map(item => [item.id, item]));
    const newEdges = new Map(next.edges.map(item => [item.id, item]));
    setEdges(current => current.map(item => item.data?.waypoints && JSON.stringify(item.data.waypoints) === JSON.stringify(oldEdges.get(item.id)?.data?.waypoints)
      ? { ...item, data: { ...item.data, waypoints: newEdges.get(item.id)?.data?.waypoints } }
      : item));
  }, [layer, phase, nodes, setEdges, setNodes]);

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
    measuredLayoutRef.current = initialGraph;
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
      .architecture-flow [data-boundary-connectable="true"][data-frame-selected="true"] > :last-child { border-color: ${COLORS.blue} !important; box-shadow: inset 0 0 0 1px ${COLORS.blue} !important; }
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
  const [phase, setPhase] = useState<ExecutionPhase>("prefill");
  const mode = modeForLayer(layer);
  return <div style={{ width: "100%", height: "100%", background: COLORS.paper, fontFamily: "Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif", position: "relative" }}>
    <div style={{ position: "absolute", inset: "0 0 auto 0", zIndex: 10, minHeight: 122, padding: "18px 22px 14px", background: "rgba(247,245,240,.97)", borderBottom: `1px solid ${COLORS.line}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, marginBottom: 12 }}><div><strong style={{ fontSize: 21 }}>DeepSeek V4.1-Flash · Layer {layer}</strong><span style={{ marginLeft: 12, color: mode === "full" ? COLORS.green : mode === "reindex" ? COLORS.amber : mode === "reuse" ? COLORS.blue : COLORS.rose, fontWeight: 800 }}>{modeLabel(mode)}</span></div><span style={{ color: COLORS.muted, fontSize: 12 }}>随时平移缩放、拖框、改尺寸、增删连线；与文章编辑状态无关</span></div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>{(["prefill", "decode"] as const).map(value => <button key={value} type="button" aria-pressed={phase === value} onClick={() => setPhase(value)} style={{ ...editorButton, background: phase === value ? COLORS.green : COLORS.card, color: phase === value ? "white" : COLORS.ink }}>{value === "prefill" ? "Prefill · 整段矩阵" : "Decode · 单步一行"}</button>)}<span style={{ fontSize: 12, color: COLORS.muted }}>{phase === "prefill" ? "N 行并行 · t 是其中一个序列位置" : "当前 1 行 · t=P+k · 历史 KV 来自缓存"}</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(20,1fr)", gap: 4 }}>{Array.from({ length: 40 }, (_, i) => i + 1).map((value) => { const valueMode = modeForLayer(value); const active = value === layer; const color = valueMode === "full" ? COLORS.green : valueMode === "reindex" ? COLORS.amber : valueMode === "reuse" ? COLORS.blue : COLORS.rose; return <button key={value} type="button" onClick={() => setLayer(value)} aria-pressed={active} style={{ border: `1px solid ${active ? color : COLORS.line}`, background: active ? color : COLORS.card, color: active ? "white" : color, borderRadius: 5, padding: "4px 0", fontWeight: 750, fontSize: 10.5, cursor: "pointer" }}>{value}</button>; })}</div>
    </div>
    <div style={{ position: "absolute", inset: "174px 0 0" }}><DiagramCanvas key={`${phase}-${layer}`} layer={layer} phase={phase} /></div>
  </div>;
};
