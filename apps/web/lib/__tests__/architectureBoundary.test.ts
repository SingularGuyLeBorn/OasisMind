import { afterEach, describe, expect, it } from "vitest";
import { Position } from "@xyflow/react";
import { findBoundaryConnection } from "../../../algo-viz/src/components/EditableArchitectureGraph";

function addFrame(id: string, left: number, top: number, width: number, height: number) {
  const node = document.createElement("div");
  node.className = "react-flow__node";
  node.dataset.id = id;
  const content = document.createElement("div");
  content.dataset.boundaryConnectable = "true";
  node.append(content);
  node.getBoundingClientRect = () => ({ left, top, right: left + width, bottom: top + height, width, height, x: left, y: top, toJSON: () => ({}) });
  document.body.append(node);
  return node;
}

afterEach(() => document.body.replaceChildren());

describe("架构图连续边缘吸附", () => {
  it("靠近边缘任意位置即可落线，不要求对准固定起线点", () => {
    addFrame("matrix", 100, 100, 400, 200);
    expect(findBoundaryConnection(document.body, { x: 394, y: 88 })).toMatchObject({ nodeId: "matrix", anchor: { side: Position.Top, offset: .735 } });
    expect(findBoundaryConnection(document.body, { x: 508, y: 246 })).toMatchObject({ nodeId: "matrix", anchor: { side: Position.Right, offset: .73 } });
  });

  it("沿原边拖动时固定边方向，并允许滑至角落", () => {
    addFrame("matrix", 100, 100, 400, 200);
    expect(findBoundaryConnection(document.body, { x: 104, y: 103 }, undefined, { nodeId: "matrix", side: Position.Top })).toMatchObject({ anchor: { side: Position.Top, offset: .01 } });
    expect(findBoundaryConnection(document.body, { x: 95, y: 99 }, undefined, { nodeId: "matrix", side: Position.Top })).toMatchObject({ anchor: { side: Position.Top, offset: 0 } });
  });

  it("可以改连另一个框，远离所有边缘时不误连", () => {
    addFrame("old", 100, 100, 400, 200);
    addFrame("next", 600, 100, 200, 400);
    expect(findBoundaryConnection(document.body, { x: 590, y: 380 }, undefined, { nodeId: "old", side: Position.Top })).toMatchObject({ nodeId: "next", anchor: { side: Position.Left, offset: .7 } });
    expect(findBoundaryConnection(document.body, { x: 350, y: 200 })).toBeNull();
  });

  it("不会吸附回被排除的另一端节点，重叠边界优先内部小框", () => {
    addFrame("outer", 100, 100, 400, 200);
    addFrame("inner", 100, 140, 100, 80);
    expect(findBoundaryConnection(document.body, { x: 98, y: 180 })).toMatchObject({ nodeId: "inner" });
    expect(findBoundaryConnection(document.body, { x: 98, y: 180 }, "inner")).toMatchObject({ nodeId: "outer" });
  });
});
