import React, { createContext, memo, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";
import katex from "katex";
import {
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  NodeResizeControl,
  Position,
  ResizeControlVariant,
  useNodes,
  useEdges,
  useReactFlow,
  useStoreApi,
  type Edge,
  type EdgeProps,
  type ConnectionLineComponentProps,
  type Node,
  type InternalNode,
  type XYPosition,
} from "@xyflow/react";

export type EditableEdgeData = {
  labelTex?: string;
  waypoints?: XYPosition[];
  color?: string;
  sourceAnchor?: BoundaryAnchor;
  targetAnchor?: BoundaryAnchor;
  labelPosition?: number;
};

export type BoundaryAnchor = { side: Position; offset: number };
export type BoundaryConnection = { nodeId: string; anchor: BoundaryAnchor };

// [OM-FREEPLAY] 24 屏幕像素作为边缘吸附距离，缩放后仍保持相同的鼠标容差。
const BOUNDARY_SNAP_RADIUS = 24;

export function findBoundaryConnection(
  scope: HTMLElement,
  pointer: XYPosition,
  excludedNode?: string,
  preferred?: { nodeId: string; side: Position },
): BoundaryConnection | null {
  const candidates: Array<BoundaryConnection & { distance: number; area: number }> = [];
  for (const element of Array.from(scope.querySelectorAll<HTMLElement>('.react-flow__node'))) {
    const nodeId = element.dataset.id;
    if (!nodeId || nodeId === excludedNode || !element.querySelector('[data-boundary-connectable="true"]')) continue;
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const sides = preferred && preferred.nodeId === nodeId ? [preferred.side] : [Position.Top, Position.Right, Position.Bottom, Position.Left];
    for (const side of sides) {
      const horizontal = side === Position.Top || side === Position.Bottom;
      const offset = Math.max(0, Math.min(1, horizontal ? (pointer.x - rect.left) / rect.width : (pointer.y - rect.top) / rect.height));
      const x = horizontal ? rect.left + offset * rect.width : side === Position.Left ? rect.left : rect.right;
      const y = horizontal ? side === Position.Top ? rect.top : rect.bottom : rect.top + offset * rect.height;
      const distance = Math.hypot(pointer.x - x, pointer.y - y);
      if (distance <= BOUNDARY_SNAP_RADIUS) candidates.push({ nodeId, anchor: { side, offset }, distance, area: rect.width * rect.height });
    }
  }
  candidates.sort((a, b) => a.distance - b.distance || a.area - b.area);
  return candidates[0] ?? null;
}

export type EditableEdge = Edge<EditableEdgeData, "editable-orthogonal">;

type EditHistoryContextValue = {
  beginHistory: () => void;
  commitHistory: () => void;
};

const EditHistoryContext = createContext<EditHistoryContextValue | null>(null);

export function EditHistoryProvider({ value, children }: { value: EditHistoryContextValue; children: ReactNode }) {
  return <EditHistoryContext.Provider value={value}>{children}</EditHistoryContext.Provider>;
}

export function ConnectionGestureControl({ resetRef }: { resetRef: RefObject<(() => void) | null> }) {
  const store = useStoreApi();
  useEffect(() => {
    resetRef.current = () => {
      store.setState({ connectionClickStartHandle: null });
      store.getState().cancelConnection();
    };
    return () => { resetRef.current = null; };
  }, [resetRef, store]);
  return null;
}

const RESIZE_POSITIONS = [
  "top-left",
  "top",
  "top-right",
  "right",
  "bottom-right",
  "bottom",
  "bottom-left",
  "left",
] as const;

const PORTS = [
  { id: "top-left", position: Position.Top, style: { left: "20%" } },
  { id: "top", position: Position.Top, style: { left: "40%" } },
  { id: "top-60", position: Position.Top, style: { left: "60%" } },
  { id: "top-right", position: Position.Top, style: { left: "80%" } },
  { id: "right-20", position: Position.Right, style: { top: "20%" } },
  { id: "right", position: Position.Right, style: { top: "40%" } },
  { id: "right-60", position: Position.Right, style: { top: "60%" } },
  { id: "right-80", position: Position.Right, style: { top: "80%" } },
  { id: "bottom-right", position: Position.Bottom, style: { left: "80%" } },
  { id: "bottom", position: Position.Bottom, style: { left: "60%" } },
  { id: "bottom-40", position: Position.Bottom, style: { left: "40%" } },
  { id: "bottom-left", position: Position.Bottom, style: { left: "20%" } },
  { id: "left-20", position: Position.Left, style: { top: "20%" } },
  { id: "left-40", position: Position.Left, style: { top: "40%" } },
  { id: "left", position: Position.Left, style: { top: "60%" } },
  { id: "left-80", position: Position.Left, style: { top: "80%" } },
] as const;

const resizeHandleStyle: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 3,
  border: "1.5px solid #fffefa",
  background: "#37685a",
};

export function EightResizeHandles({
  minWidth,
  minHeight,
}: {
  minWidth: number;
  minHeight: number;
}) {
  return <>
    {(["top", "right", "bottom", "left"] as const).map(position => (
      <NodeResizeControl
        key={`edge-${position}`}
        position={position}
        variant={ResizeControlVariant.Line}
        className="architecture-resize-edge"
        minWidth={minWidth}
        minHeight={minHeight}
        style={{ border: 0, background: "transparent", zIndex: 3, ...(position === "top" || position === "bottom" ? { height: 8 } : { width: 8 }) }}
      />
    ))}
    {RESIZE_POSITIONS.map((position) => (
      <NodeResizeControl
        key={position}
        position={position}
        variant={ResizeControlVariant.Handle}
        className="architecture-resize-handle"
        minWidth={minWidth}
        minHeight={minHeight}
        style={{ ...resizeHandleStyle, opacity: 0, zIndex: 4 }}
      />
    ))}
  </>;
}

function DelayedConnectionPort({ id, position, style, color }: { id: string; position: Position; style: CSSProperties; color: string }) {
  const [ready, setReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };
  useEffect(() => cancelTimer, []);
  return <Handle
    id={`port-${id}`}
    type="source"
    position={position}
    aria-label={`在 ${id} 边界位置新增连线`}
    onPointerEnter={() => {
      cancelTimer();
      timerRef.current = setTimeout(() => setReady(true), 500);
    }}
    onPointerLeave={() => {
      cancelTimer();
      setReady(false);
    }}
    style={{
      width: 18,
      height: 18,
      border: 0,
      background: "transparent",
      display: "grid",
      placeItems: "center",
      ...style,
      [position]: 0,
    }}
  >
    <span aria-hidden style={{
      width: 16,
      height: 16,
      borderRadius: "50%",
      border: `1.5px solid ${color}`,
      background: "#fffefa",
      color,
      display: "grid",
      placeItems: "center",
      fontSize: 14,
      fontWeight: 900,
      lineHeight: 1,
      opacity: ready ? 1 : 0,
      transform: ready ? "scale(1)" : "scale(.7)",
      transition: "opacity 120ms ease, transform 120ms ease",
      pointerEvents: "none",
      boxShadow: "0 1px 5px rgba(42,41,36,.18)",
    }}>+</span>
  </Handle>;
}

export function EightConnectionPorts({ color = "#37685a" }: { color?: string }) {
  return <>
    {PORTS.map((port) => (
      <DelayedConnectionPort
        key={port.id}
        id={port.id}
        position={port.position}
        style={port.style}
        color={color}
      />
    ))}
  </>;
}

export function EditableConnectionLine({ fromX, fromY, toX, toY }: ConnectionLineComponentProps) {
  return <g>
    <defs>
      <marker id="editable-connection-arrow" viewBox="0 -6 12 12" refX="11" refY="0" markerWidth="10" markerHeight="10" orient="auto">
        <path d="M 1 -5 L 11 0 L 1 5" fill="none" stroke="#37685a" strokeWidth="1.8" strokeLinejoin="round" />
      </marker>
    </defs>
    <path d={`M ${fromX} ${fromY} L ${toX} ${toY}`} fill="none" stroke="#37685a" strokeWidth="2.2" markerEnd="url(#editable-connection-arrow)" />
  </g>;
}

function latexHtml(tex: string) {
  return katex.renderToString(tex, {
    displayMode: false,
    throwOnError: false,
    strict: false,
  });
}

type Obstacle = { left: number; top: number; right: number; bottom: number };
type ReservedSegment = { start: XYPosition; end: XYPosition };

// [OM-FREEPLAY] 用户要求自动线不得贴框；24px 引出段与 28px 障碍外扩可在当前最窄并列间距内同时成立。
const EDGE_PORT_LEAD = 24;
const EDGE_NODE_CLEARANCE = 28;
// [OM-FREEPLAY] 相邻自动线路保留 16px 的中心线间距，兼顾开放箭头和短公式标签。
const EDGE_LANE_GAP = 16;

export function architectureFanoutGap(branches: number) {
  return 2 * EDGE_PORT_LEAD + Math.max(0, branches - 1) * EDGE_LANE_GAP + EDGE_NODE_CLEARANCE;
}

function segmentCrossesObstacle(start: XYPosition, end: XYPosition, obstacle: Obstacle) {
  if (Math.abs(start.x - end.x) < .5) {
    const low = Math.min(start.y, end.y);
    const high = Math.max(start.y, end.y);
    return start.x > obstacle.left && start.x < obstacle.right && high > obstacle.top && low < obstacle.bottom;
  }
  if (Math.abs(start.y - end.y) < .5) {
    const low = Math.min(start.x, end.x);
    const high = Math.max(start.x, end.x);
    return start.y > obstacle.top && start.y < obstacle.bottom && high > obstacle.left && low < obstacle.right;
  }
  return true;
}

function simplifyOrthogonalPoints(points: XYPosition[]) {
  return points.filter((point, index) => {
    if (index === 0 || index === points.length - 1) return true;
    const before = points[index - 1];
    const after = points[index + 1];
    if (point.x === before.x && point.y === before.y) return false;
    return !((before.x === point.x && point.x === after.x) || (before.y === point.y && point.y === after.y));
  });
}

export function sharedRouteLength(first: XYPosition[], second: XYPosition[]) {
  let total = 0;
  for (let a = 0; a < first.length - 1; a += 1) for (let b = 0; b < second.length - 1; b += 1) {
    const p = first[a], q = first[a + 1], r = second[b], s = second[b + 1];
    if (p.y === q.y && r.y === s.y && Math.abs(p.y - r.y) < .5) total += Math.max(0, Math.min(Math.max(p.x, q.x), Math.max(r.x, s.x)) - Math.max(Math.min(p.x, q.x), Math.min(r.x, s.x)));
    if (p.x === q.x && r.x === s.x && Math.abs(p.x - r.x) < .5) total += Math.max(0, Math.min(Math.max(p.y, q.y), Math.max(r.y, s.y)) - Math.max(Math.min(p.y, q.y), Math.min(r.y, s.y)));
  }
  return total;
}

function routeScore(points: XYPosition[], obstacles: Obstacle[], reserved: ReservedSegment[]) {
  let crossings = 0;
  let crowding = 0;
  let length = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    length += Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
    crossings += obstacles.filter((obstacle) => segmentCrossesObstacle(start, end, obstacle)).length;
    const horizontal = start.y === end.y;
    for (const segment of reserved) {
      const otherHorizontal = segment.start.y === segment.end.y;
      if (horizontal === otherHorizontal) {
        const separation = Math.abs(horizontal ? start.y - segment.start.y : start.x - segment.start.x);
        const overlap = horizontal
          ? Math.min(Math.max(start.x, end.x), Math.max(segment.start.x, segment.end.x)) - Math.max(Math.min(start.x, end.x), Math.min(segment.start.x, segment.end.x))
          : Math.min(Math.max(start.y, end.y), Math.max(segment.start.y, segment.end.y)) - Math.max(Math.min(start.y, end.y), Math.min(segment.start.y, segment.end.y));
        if (overlap > 0 && separation < EDGE_LANE_GAP) crowding += overlap * (EDGE_LANE_GAP - separation) * 100;
      } else if (segmentCrossesObstacle(start, end, {
        left: Math.min(segment.start.x, segment.end.x) - .1, right: Math.max(segment.start.x, segment.end.x) + .1,
        top: Math.min(segment.start.y, segment.end.y) - .1, bottom: Math.max(segment.start.y, segment.end.y) + .1,
      })) crowding += 800;
    }
  }
  return crossings * 100_000_000 + crowding + length + points.length * 8;
}

function defaultOrthogonalPoints(sourceX: number, sourceY: number, targetX: number, targetY: number, obstacles: Obstacle[], reserved: ReservedSegment[]) {
  const middleY = sourceY + (targetY - sourceY) / 2;
  const middleX = sourceX + (targetX - sourceX) / 2;
  const clearance = EDGE_NODE_CLEARANCE;
  const nearby = obstacles.filter((obstacle) => obstacle.right >= Math.min(sourceX, targetX) - clearance
    && obstacle.left <= Math.max(sourceX, targetX) + clearance
    && obstacle.bottom >= Math.min(sourceY, targetY) - clearance
    && obstacle.top <= Math.max(sourceY, targetY) + clearance);
  const top = Math.min(sourceY, targetY, ...nearby.map((item) => item.top)) - clearance;
  const bottom = Math.max(sourceY, targetY, ...nearby.map((item) => item.bottom)) + clearance;
  const left = Math.min(sourceX, targetX, ...nearby.map((item) => item.left)) - clearance;
  const right = Math.max(sourceX, targetX, ...nearby.map((item) => item.right)) + clearance;
  const laneOffsets = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map(value => value * EDGE_LANE_GAP);
  const horizontalChannels = [...new Set([top, bottom, ...laneOffsets.map(offset => middleY + offset), ...nearby.flatMap((item) => [item.top, item.bottom]), ...reserved.filter(segment => segment.start.y === segment.end.y).flatMap(segment => [segment.start.y - EDGE_LANE_GAP, segment.start.y + EDGE_LANE_GAP])])];
  const verticalChannels = [...new Set([left, right, ...laneOffsets.map(offset => middleX + offset), ...nearby.flatMap((item) => [item.left, item.right]), ...reserved.filter(segment => segment.start.x === segment.end.x).flatMap(segment => [segment.start.x - EDGE_LANE_GAP, segment.start.x + EDGE_LANE_GAP])])];
  const candidates: XYPosition[][] = [
    [
      { x: sourceX, y: sourceY },
      { x: sourceX, y: middleY },
      { x: targetX, y: middleY },
      { x: targetX, y: targetY },
    ],
    [
      { x: sourceX, y: sourceY },
      { x: middleX, y: sourceY },
      { x: middleX, y: targetY },
      { x: targetX, y: targetY },
    ],
    ...horizontalChannels.map((channelY) => [
      { x: sourceX, y: sourceY },
      { x: sourceX, y: channelY },
      { x: targetX, y: channelY },
      { x: targetX, y: targetY },
    ]),
    ...verticalChannels.map((channelX) => [
      { x: sourceX, y: sourceY },
      { x: channelX, y: sourceY },
      { x: channelX, y: targetY },
      { x: targetX, y: targetY },
    ]),
  ];
  // 起终点附近的窄通道不能被中点附近的候选挤掉。
  const nearChannels = (channels: number[], start: number, end: number) => [...new Set(
    [start, (start + end) / 2, end].flatMap(center => channels
      .filter(value => value >= Math.min(start, end) - clearance && value <= Math.max(start, end) + clearance)
      .sort((a, b) => Math.abs(a - center) - Math.abs(b - center)).slice(0, 10)),
  )];
  const nearX = nearChannels(verticalChannels, sourceX, targetX);
  const nearY = nearChannels(horizontalChannels, sourceY, targetY);
  for (const x of nearX) for (const y of nearY) candidates.push(
    [{ x: sourceX, y: sourceY }, { x: sourceX, y }, { x, y }, { x, y: targetY }, { x: targetX, y: targetY }],
    [{ x: sourceX, y: sourceY }, { x, y: sourceY }, { x, y }, { x: targetX, y }, { x: targetX, y: targetY }],
  );
  return candidates
    .map(simplifyOrthogonalPoints)
    .map(points => ({ points, score: routeScore(points, obstacles, reserved) }))
    .sort((a, b) => a.score - b.score)[0]?.points ?? [
    { x: sourceX, y: sourceY },
    { x: sourceX, y: middleY },
    { x: targetX, y: middleY },
    { x: targetX, y: targetY },
  ];
}

function pointsWithAnchoredEndpoints(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  waypoints: XYPosition[],
) {
  const adjusted = waypoints.map((point) => ({ ...point }));
  if (adjusted.length === 1) {
    adjusted[0] = { x: sourceX, y: adjusted[0].y };
    adjusted.push({ x: targetX, y: adjusted[0].y });
  } else if (adjusted.length >= 2) {
    const first = adjusted[0];
    const second = adjusted[1];
    const firstOutgoingHorizontal = Math.abs(second.x - first.x) >= Math.abs(second.y - first.y);
    adjusted[0] = firstOutgoingHorizontal
      ? { x: sourceX, y: first.y }
      : { x: first.x, y: sourceY };

    const lastIndex = adjusted.length - 1;
    const beforeLast = adjusted[lastIndex - 1];
    const last = adjusted[lastIndex];
    const lastIncomingHorizontal = Math.abs(last.x - beforeLast.x) >= Math.abs(last.y - beforeLast.y);
    adjusted[lastIndex] = lastIncomingHorizontal
      ? { x: targetX, y: last.y }
      : { x: last.x, y: targetY };
  }
  return [{ x: sourceX, y: sourceY }, ...adjusted, { x: targetX, y: targetY }];
}

function pointsWithDirectedTarget(
  points: XYPosition[],
  targetX: number,
  targetY: number,
  targetPosition: Position,
) {
  const lead = EDGE_PORT_LEAD;
  const approach = targetPosition === Position.Top
    ? { x: targetX, y: targetY - lead }
    : targetPosition === Position.Bottom
      ? { x: targetX, y: targetY + lead }
      : targetPosition === Position.Left
        ? { x: targetX - lead, y: targetY }
        : { x: targetX + lead, y: targetY };
  const body = points.slice(0, -1);
  while (body.length > 1 && body.at(-1)?.x === targetX && body.at(-1)?.y === targetY) body.pop();
  const previous = body.at(-1) ?? points[0];
  const elbow = targetPosition === Position.Top || targetPosition === Position.Bottom
    ? { x: previous.x, y: approach.y }
    : { x: approach.x, y: previous.y };
  return simplifyOrthogonalPoints([...body, elbow, approach, { x: targetX, y: targetY }]);
}

function pointsWithDirectedSource(
  points: XYPosition[],
  sourceX: number,
  sourceY: number,
  sourcePosition: Position,
) {
  const lead = EDGE_PORT_LEAD;
  const departure = sourcePosition === Position.Top
    ? { x: sourceX, y: sourceY - lead }
    : sourcePosition === Position.Bottom
      ? { x: sourceX, y: sourceY + lead }
      : sourcePosition === Position.Left
        ? { x: sourceX - lead, y: sourceY }
        : { x: sourceX + lead, y: sourceY };
  const body = points.slice(1);
  while (body.length > 1 && body[0]?.x === sourceX && body[0]?.y === sourceY) body.shift();
  const next = body[0] ?? points.at(-1) ?? departure;
  const elbow = sourcePosition === Position.Top || sourcePosition === Position.Bottom
    ? { x: next.x, y: departure.y }
    : { x: departure.x, y: next.y };
  return simplifyOrthogonalPoints([{ x: sourceX, y: sourceY }, departure, elbow, ...body]);
}

function portLeadPoint(x: number, y: number, position: Position) {
  if (position === Position.Top) return { x, y: y - EDGE_PORT_LEAD };
  if (position === Position.Bottom) return { x, y: y + EDGE_PORT_LEAD };
  if (position === Position.Left) return { x: x - EDGE_PORT_LEAD, y };
  return { x: x + EDGE_PORT_LEAD, y };
}

export function automaticOrthogonalPoints(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: Position,
  targetPosition: Position,
  obstacles: Obstacle[],
  reserved: ReservedSegment[] = [],
) {
  const departure = portLeadPoint(sourceX, sourceY, sourcePosition);
  const approach = portLeadPoint(targetX, targetY, targetPosition);
  const routedBody = defaultOrthogonalPoints(departure.x, departure.y, approach.x, approach.y, obstacles, reserved);
  return simplifyOrthogonalPoints([
    { x: sourceX, y: sourceY },
    ...routedBody,
    { x: targetX, y: targetY },
  ]);
}

function pathFromPoints(points: XYPosition[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function longestSegmentCenter(points: XYPosition[]) {
  let best = { x: points[0].x, y: points[0].y, length: -1 };
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const length = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
    if (length > best.length) {
      best = {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2,
        length,
      };
    }
  }
  return best;
}

export function projectLabelOntoPath(points: XYPosition[], pointer: XYPosition) {
  const lengths = points.slice(1).map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let passed = 0;
  let best = { ...points[0], fraction: 0, distance: Infinity };
  lengths.forEach((length, index) => {
    if (!length) return;
    const start = points[index];
    const end = points[index + 1];
    const ratio = Math.max(0, Math.min(1, ((pointer.x - start.x) * (end.x - start.x) + (pointer.y - start.y) * (end.y - start.y)) / (length * length)));
    const x = start.x + ratio * (end.x - start.x);
    const y = start.y + ratio * (end.y - start.y);
    const distance = Math.hypot(pointer.x - x, pointer.y - y);
    if (distance < best.distance) best = { x, y, fraction: (passed + length * ratio) / total, distance };
    passed += length;
  });
  return best;
}

export function labelPointOnPath(points: XYPosition[], fraction: number): XYPosition {
  const lengths = points.slice(1).map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
  let remaining = lengths.reduce((sum, length) => sum + length, 0) * Math.max(0, Math.min(1, fraction));
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index];
    if (!length) continue;
    if (remaining <= length) return { x: points[index].x + (points[index + 1].x - points[index].x) * remaining / length, y: points[index].y + (points[index + 1].y - points[index].y) * remaining / length };
    remaining -= length;
  }
  return points.at(-1) ?? { x: 0, y: 0 };
}

function moveSegment(
  points: XYPosition[],
  segmentIndex: number,
  pointer: XYPosition,
) {
  const next = points.map((point) => ({ ...point }));
  let startIndex = segmentIndex;
  let endIndex = segmentIndex + 1;
  const start = next[startIndex];
  const end = next[endIndex];
  const horizontal = Math.abs(end.x - start.x) >= Math.abs(end.y - start.y);

  if (startIndex === 0) {
    next.splice(1, 0, horizontal
      ? { x: start.x, y: pointer.y }
      : { x: pointer.x, y: start.y });
    startIndex = 1;
    endIndex += 1;
  }
  if (endIndex === next.length - 1) {
    const target = next[endIndex];
    next.splice(endIndex, 0, horizontal
      ? { x: target.x, y: pointer.y }
      : { x: pointer.x, y: target.y });
  }

  if (horizontal) {
    next[startIndex] = { ...next[startIndex], y: pointer.y };
    next[startIndex + 1] = { ...next[startIndex + 1], y: pointer.y };
  } else {
    next[startIndex] = { ...next[startIndex], x: pointer.x };
    next[startIndex + 1] = { ...next[startIndex + 1], x: pointer.x };
  }
  return next.slice(1, -1);
}

const routingCache = new WeakMap<Node[], { signature: string; routes: Map<string, XYPosition[]> }>();

function planArchitectureRoutes(nodes: Node[], edges: EditableEdge[], getInternalNode: (id: string) => InternalNode<Node> | undefined) {
  const signature = JSON.stringify(edges.map(edge => [edge.id, edge.source, edge.target, edge.sourceHandle, edge.targetHandle, edge.data?.sourceAnchor, edge.data?.targetAnchor, edge.data?.waypoints]));
  const cached = routingCache.get(nodes);
  if (cached?.signature === signature) return cached.routes;
  const routes = new Map<string, XYPosition[]>();
  const reserved: ReservedSegment[] = [];
  const endpoint = (edge: EditableEdge, kind: "source" | "target") => {
    const node = getInternalNode(edge[kind]);
    const position = node?.internals.positionAbsolute;
    const width = node?.measured.width, height = node?.measured.height;
    if (!node || !position || !width || !height) return null;
    const handleId = kind === "source" ? edge.sourceHandle : edge.targetHandle;
    const handles = node.internals.handleBounds;
    const handle = handles?.[kind]?.find(item => item.id === handleId) ?? handles?.source?.find(item => item.id === handleId);
    const anchor = kind === "source" ? edge.data?.sourceAnchor : edge.data?.targetAnchor;
    const side = anchor?.side ?? handle?.position;
    if (!side) return null;
    const offset = anchor?.offset ?? (side === Position.Top || side === Position.Bottom ? ((handle?.x ?? width / 2) + (handle?.width ?? 0) / 2) / width : ((handle?.y ?? height / 2) + (handle?.height ?? 0) / 2) / height);
    return { x: position.x + (side === Position.Left ? 0 : side === Position.Right ? width : width * offset), y: position.y + (side === Position.Top ? 0 : side === Position.Bottom ? height : height * offset), side };
  };
  const items = edges.flatMap(edge => {
    const source = endpoint(edge, "source"), target = endpoint(edge, "target");
    return source && target ? [{ edge, source, target }] : [];
  }).sort((a, b) => Number(Boolean(b.edge.data?.waypoints?.length)) - Number(Boolean(a.edge.data?.waypoints?.length)) || a.source.y - b.source.y || a.source.x - b.source.x || a.edge.id.localeCompare(b.edge.id));
  for (const { edge, source, target } of items) {
    const excluded = new Set([edge.source, edge.target]);
    for (const id of [edge.source, edge.target]) {
      let node = nodes.find(item => item.id === id);
      while (node?.parentId) { excluded.add(node.parentId); node = nodes.find(item => item.id === node?.parentId); }
    }
    const obstacles = nodes.flatMap(node => {
      const internal = getInternalNode(node.id);
      const position = internal?.internals.positionAbsolute;
      const width = internal?.measured.width, height = internal?.measured.height;
      if (!position || !width || !height || node.hidden) return [];
      if (excluded.has(node.id) && node.id !== edge.source && node.id !== edge.target) return [];
      const padding = node.id === edge.source || node.id === edge.target ? 8 : EDGE_NODE_CLEARANCE;
      return [{ left: position.x - padding, top: position.y - padding, right: position.x + width + padding, bottom: position.y + height + padding }];
    });
    const waypoints = edge.data?.waypoints;
    const points = waypoints?.length
      ? pointsWithDirectedTarget(pointsWithDirectedSource(pointsWithAnchoredEndpoints(source.x, source.y, target.x, target.y, waypoints), source.x, source.y, source.side), target.x, target.y, target.side)
      : automaticOrthogonalPoints(source.x, source.y, target.x, target.y, source.side, target.side, obstacles, reserved);
    routes.set(edge.id, points);
    for (let index = 0; index < points.length - 1; index += 1) reserved.push({ start: points[index], end: points[index + 1] });
  }
  routingCache.set(nodes, { signature, routes });
  return routes;
}

function EditableOrthogonalEdgeView({
  id,
  sourceX: handleSourceX,
  sourceY: handleSourceY,
  targetX: handleTargetX,
  targetY: handleTargetY,
  targetPosition: handleTargetPosition,
  sourcePosition: handleSourcePosition,
  source,
  target,
  markerEnd,
  selected,
  data,
  style,
}: EdgeProps<EditableEdge>) {
  const { screenToFlowPosition, getZoom, setEdges, getInternalNode } = useReactFlow<Node, EditableEdge>();
  const flowNodes = useNodes<Node>();
  const flowEdges = useEdges<EditableEdge>();
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const history = useContext(EditHistoryContext);
  const anchorPoint = (nodeId: string, anchor: BoundaryAnchor | undefined, fallback: XYPosition, handleSide: Position) => {
    const node = getInternalNode(nodeId);
    const absolute = node?.internals.positionAbsolute;
    const width = node?.measured.width;
    const height = node?.measured.height;
    if (!absolute || !width || !height) return fallback;
    const side = anchor?.side ?? handleSide;
    const offset = anchor?.offset ?? Math.max(0, Math.min(1, side === Position.Top || side === Position.Bottom ? (fallback.x - absolute.x) / width : (fallback.y - absolute.y) / height));
    return {
      x: absolute.x + (side === Position.Left ? 0 : side === Position.Right ? width : width * offset),
      y: absolute.y + (side === Position.Top ? 0 : side === Position.Bottom ? height : height * offset),
    };
  };
  const { x: sourceX, y: sourceY } = anchorPoint(source, data?.sourceAnchor, { x: handleSourceX, y: handleSourceY }, handleSourcePosition);
  const { x: targetX, y: targetY } = anchorPoint(target, data?.targetAnchor, { x: handleTargetX, y: handleTargetY }, handleTargetPosition);
  const sourcePosition = data?.sourceAnchor?.side ?? handleSourcePosition;
  const targetPosition = data?.targetAnchor?.side ?? handleTargetPosition;
  const routes = useMemo(() => planArchitectureRoutes(flowNodes, flowEdges, getInternalNode), [flowNodes, flowEdges, getInternalNode]);
  const points = routes.get(id) ?? automaticOrthogonalPoints(sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, []);
  const path = pathFromPoints(points);
  const labelCenter = data?.labelPosition === undefined ? longestSegmentCenter(points) : labelPointOnPath(points, data.labelPosition);
  const color = data?.color ?? String(style?.stroke ?? "#37685a");
  useEffect(() => {
    if (!selected) return;
    const hover = (event: PointerEvent) => {
      const pointer = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const radius = 14 / getZoom();
      let nearest: number | null = null;
      let distance = radius;
      for (let index = 0; index < points.length - 1; index += 1) {
        const start = points[index];
        const end = points[index + 1];
        const x = Math.max(Math.min(start.x, end.x), Math.min(Math.max(start.x, end.x), pointer.x));
        const y = Math.max(Math.min(start.y, end.y), Math.min(Math.max(start.y, end.y), pointer.y));
        const nextDistance = Math.hypot(pointer.x - x, pointer.y - y);
        if (nextDistance < distance) { distance = nextDistance; nearest = index; }
      }
      setHoveredSegment(nearest);
    };
    window.addEventListener("pointermove", hover);
    return () => window.removeEventListener("pointermove", hover);
  }, [getZoom, points, screenToFlowPosition, selected]);

  const startEndpointDrag = (event: ReactPointerEvent<HTMLButtonElement>, endpoint: "source" | "target") => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus({ preventScroll: true });
    const scope = event.currentTarget.closest<HTMLElement>('.react-flow');
    if (!scope) return;
    const nodeId = endpoint === "source" ? source : target;
    const side = endpoint === "source" ? sourcePosition : targetPosition;
    let hit: BoundaryConnection | null = null;
    let moved = false;
    let changed = false;
    const start = { x: event.clientX, y: event.clientY };
    const move = (pointerEvent: PointerEvent) => {
      if (Math.hypot(pointerEvent.clientX - start.x, pointerEvent.clientY - start.y) < 3 && !moved) return;
      moved = true;
      hit = findBoundaryConnection(scope, { x: pointerEvent.clientX, y: pointerEvent.clientY }, endpoint === "source" ? target : source, { nodeId, side });
      if (!hit) return;
      if (!changed) history?.beginHistory();
      changed = true;
      const connection = hit;
      setEdges(current => current.map(edge => edge.id === id ? {
        ...edge,
        [endpoint]: connection.nodeId,
        [`${endpoint}Handle`]: `port-${connection.anchor.side}`,
        data: { ...edge.data, [`${endpoint}Anchor`]: connection.anchor, waypoints: undefined },
      } : edge));
    };
    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      if (changed) history?.commitHistory();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish, { once: true });
    window.addEventListener("pointercancel", finish, { once: true });
  };

  const startSegmentDrag = (event: ReactPointerEvent<HTMLButtonElement>, segmentIndex: number) => {
    event.preventDefault();
    event.stopPropagation();
    history?.beginHistory();
    const move = (pointerEvent: PointerEvent) => {
      const pointer = screenToFlowPosition({ x: pointerEvent.clientX, y: pointerEvent.clientY });
      const waypoints = moveSegment(points, segmentIndex, pointer);
      setEdges((current) => current.map((edge) => edge.id === id
        ? { ...edge, data: { ...edge.data, waypoints } }
        : edge));
    };
    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      history?.commitHistory();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish, { once: true });
    window.addEventListener("pointercancel", finish, { once: true });
  };

  const startLabelDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus({ preventScroll: true });
    setEdges(current => current.map(edge => ({ ...edge, selected: edge.id === id })));
    let changed = false;
    const move = (pointerEvent: PointerEvent) => {
      if (!changed) history?.beginHistory();
      changed = true;
      const pointer = screenToFlowPosition({ x: pointerEvent.clientX, y: pointerEvent.clientY });
      const { fraction } = projectLabelOntoPath(points, pointer);
      setEdges(current => current.map(edge => edge.id === id ? { ...edge, data: { ...edge.data, labelPosition: fraction } } : edge));
    };
    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      if (changed) history?.commitHistory();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish, { once: true });
    window.addEventListener("pointercancel", finish, { once: true });
  };

  return <>
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      interactionWidth={28}
      style={{
        ...style,
        stroke: color,
        strokeWidth: selected ? 3.4 : Number(style?.strokeWidth ?? 2.2),
      }}
    />
    <EdgeLabelRenderer>
      {(["source", "target"] as const).map(endpoint => <button
        key={endpoint}
        type="button"
        className="nodrag nopan architecture-edge-endpoint"
        aria-label={`拖动连线${endpoint === "source" ? "起点" : "箭头"}`}
        data-edge-id={id}
        data-endpoint={endpoint}
        data-selected={Boolean(selected)}
        onPointerDown={event => startEndpointDrag(event, endpoint)}
        style={{ position: "absolute", left: endpoint === "source" ? sourceX : targetX, top: endpoint === "source" ? sourceY : targetY, width: 24, height: 24, padding: 7, transform: "translate(-50%,-50%)", border: 0, background: "transparent", pointerEvents: "all", cursor: (endpoint === "source" ? sourcePosition : targetPosition) === Position.Top || (endpoint === "source" ? sourcePosition : targetPosition) === Position.Bottom ? "ew-resize" : "ns-resize" }}
      ><span style={{ display: "block", width: 10, height: 10, borderRadius: "50%", border: "2px solid #fffefa", background: color, pointerEvents: "none" }} /></button>)}
      {data?.labelTex && (
        <div
          className="nodrag nopan"
          data-edge-label={id}
          role="button"
          tabIndex={0}
          aria-label={data.labelTex}
          onPointerDown={startLabelDrag}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelCenter.x}px,${labelCenter.y}px)`,
            padding: "3px 7px",
            borderRadius: 5,
            background: "rgba(247,245,240,.96)",
            color: "#716d63",
            fontSize: 12,
            fontWeight: 700,
            pointerEvents: "all",
            cursor: "grab",
            userSelect: "none",
          }}
          dangerouslySetInnerHTML={{ __html: latexHtml(data.labelTex) }}
        />
      )}
      {selected && points.slice(0, -1).map((point, index) => {
        if (index !== hoveredSegment) return null;
        const end = points[index + 1];
        const horizontal = Math.abs(end.x - point.x) >= Math.abs(end.y - point.y);
        return (
          <button
            key={`${id}-segment-${index}`}
            type="button"
            className="nodrag nopan"
            aria-label={`拖动第 ${index + 1} 段折线`}
            onPointerDown={(event) => startSegmentDrag(event, index)}
            style={{
              position: "absolute",
              left: (point.x + end.x) / 2,
              top: (point.y + end.y) / 2,
              width: 12,
              height: 12,
              padding: 0,
              transform: "translate(-50%, -50%)",
              border: "2px solid #fffefa",
              borderRadius: 3,
              background: color,
              boxShadow: "0 1px 4px rgba(42,41,36,.25)",
              cursor: horizontal ? "ns-resize" : "ew-resize",
              pointerEvents: "all",
            }}
          />
        );
      })}
    </EdgeLabelRenderer>
  </>;
}

export const EditableOrthogonalEdge = memo(EditableOrthogonalEdgeView);
