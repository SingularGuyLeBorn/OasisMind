import React, { createContext, memo, useContext, useMemo, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import katex from "katex";
import {
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  NodeResizeControl,
  Position,
  ResizeControlVariant,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type XYPosition,
} from "@xyflow/react";

export type EditableEdgeData = {
  labelTex?: string;
  waypoints?: XYPosition[];
  color?: string;
};

export type EditableEdge = Edge<EditableEdgeData, "editable-orthogonal">;

type EditHistoryContextValue = {
  beginHistory: () => void;
  commitHistory: () => void;
};

const EditHistoryContext = createContext<EditHistoryContextValue | null>(null);

export function EditHistoryProvider({ value, children }: { value: EditHistoryContextValue; children: ReactNode }) {
  return <EditHistoryContext.Provider value={value}>{children}</EditHistoryContext.Provider>;
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
  { id: "top-left", position: Position.Top, style: { left: "0%" } },
  { id: "top", position: Position.Top, style: { left: "50%" } },
  { id: "top-right", position: Position.Top, style: { left: "100%" } },
  { id: "right", position: Position.Right, style: { top: "50%" } },
  { id: "bottom-right", position: Position.Bottom, style: { left: "100%" } },
  { id: "bottom", position: Position.Bottom, style: { left: "50%" } },
  { id: "bottom-left", position: Position.Bottom, style: { left: "0%" } },
  { id: "left", position: Position.Left, style: { top: "50%" } },
] as const;

const resizeHandleStyle: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 3,
  border: "1.5px solid #fffefa",
  background: "#37685a",
};

export function EightResizeHandles({
  visible,
  minWidth,
  minHeight,
}: {
  visible: boolean;
  minWidth: number;
  minHeight: number;
}) {
  if (!visible) return null;
  return <>
    {RESIZE_POSITIONS.map((position) => (
      <NodeResizeControl
        key={position}
        position={position}
        variant={ResizeControlVariant.Handle}
        minWidth={minWidth}
        minHeight={minHeight}
        style={resizeHandleStyle}
      />
    ))}
  </>;
}

export function EightConnectionPorts({ color = "#37685a", visible }: { color?: string; visible: boolean }) {
  return <>
    {PORTS.map((port) => (
      <Handle
        key={port.id}
        id={`port-${port.id}`}
        type="source"
        position={port.position}
        style={{
          width: 7,
          height: 7,
          border: "1.5px solid #fffefa",
          background: color,
          opacity: visible ? .78 : 0,
          transition: "opacity 120ms ease",
          ...port.style,
        }}
      />
    ))}
  </>;
}

function latexHtml(tex: string) {
  return katex.renderToString(tex, {
    displayMode: false,
    throwOnError: false,
    strict: false,
  });
}

type Obstacle = { left: number; top: number; right: number; bottom: number };

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

function routeScore(points: XYPosition[], obstacles: Obstacle[]) {
  let crossings = 0;
  let length = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    length += Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
    crossings += obstacles.filter((obstacle) => segmentCrossesObstacle(start, end, obstacle)).length;
  }
  return crossings * 1_000_000 + length;
}

function defaultOrthogonalPoints(sourceX: number, sourceY: number, targetX: number, targetY: number, obstacles: Obstacle[]) {
  const middleY = sourceY + (targetY - sourceY) / 2;
  const middleX = sourceX + (targetX - sourceX) / 2;
  const clearance = 26;
  const nearby = obstacles.filter((obstacle) => obstacle.right >= Math.min(sourceX, targetX) - clearance
    && obstacle.left <= Math.max(sourceX, targetX) + clearance
    && obstacle.bottom >= Math.min(sourceY, targetY) - clearance
    && obstacle.top <= Math.max(sourceY, targetY) + clearance);
  const top = Math.min(sourceY, targetY, ...nearby.map((item) => item.top)) - clearance;
  const bottom = Math.max(sourceY, targetY, ...nearby.map((item) => item.bottom)) + clearance;
  const left = Math.min(sourceX, targetX, ...nearby.map((item) => item.left)) - clearance;
  const right = Math.max(sourceX, targetX, ...nearby.map((item) => item.right)) + clearance;
  const candidates = [
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
    [{ x: sourceX, y: sourceY }, { x: sourceX, y: top }, { x: targetX, y: top }, { x: targetX, y: targetY }],
    [{ x: sourceX, y: sourceY }, { x: sourceX, y: bottom }, { x: targetX, y: bottom }, { x: targetX, y: targetY }],
    [{ x: sourceX, y: sourceY }, { x: left, y: sourceY }, { x: left, y: targetY }, { x: targetX, y: targetY }],
    [{ x: sourceX, y: sourceY }, { x: right, y: sourceY }, { x: right, y: targetY }, { x: targetX, y: targetY }],
  ];
  return candidates
    .map(simplifyOrthogonalPoints)
    .sort((a, b) => routeScore(a, obstacles) - routeScore(b, obstacles))[0] ?? [
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
  const lead = 18;
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

function EditableOrthogonalEdgeView({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  targetPosition,
  source,
  target,
  markerEnd,
  selected,
  data,
  style,
}: EdgeProps<EditableEdge>) {
  const { screenToFlowPosition, setEdges, getNodes, getInternalNode } = useReactFlow<Node, EditableEdge>();
  const history = useContext(EditHistoryContext);
  const obstacles = useMemo(() => {
    const excluded = new Set([source, target]);
    for (const nodeId of [source, target]) {
      let current = getNodes().find((item) => item.id === nodeId);
      while (current?.parentId) {
        excluded.add(current.parentId);
        current = getNodes().find((item) => item.id === current?.parentId);
      }
    }
    return getNodes().flatMap((node) => {
      if (excluded.has(node.id) || node.hidden) return [];
      const internal = getInternalNode(node.id);
      const position = internal?.internals.positionAbsolute;
      const width = internal?.measured.width;
      const height = internal?.measured.height;
      if (!position || !width || !height) return [];
      const padding = 14;
      return [{ left: position.x - padding, top: position.y - padding, right: position.x + width + padding, bottom: position.y + height + padding }];
    });
  }, [getInternalNode, getNodes, source, sourceX, sourceY, target, targetX, targetY]);
  const points = useMemo(() => {
    const rawPoints = data?.waypoints?.length
      ? pointsWithAnchoredEndpoints(sourceX, sourceY, targetX, targetY, data.waypoints)
      : defaultOrthogonalPoints(sourceX, sourceY, targetX, targetY, obstacles);
    return pointsWithDirectedTarget(rawPoints, targetX, targetY, targetPosition);
  }, [data?.waypoints, obstacles, sourceX, sourceY, targetPosition, targetX, targetY]);
  const path = pathFromPoints(points);
  const labelCenter = longestSegmentCenter(points);
  const color = data?.color ?? String(style?.stroke ?? "#37685a");

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
      {data?.labelTex && (
        <div
          className="nodrag nopan"
          aria-label={data.labelTex}
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
          }}
          dangerouslySetInnerHTML={{ __html: latexHtml(data.labelTex) }}
        />
      )}
      {selected && points.slice(0, -1).map((point, index) => {
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
