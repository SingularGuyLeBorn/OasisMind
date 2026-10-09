/** 办公室漫游：预设机位 + 可走范围 */

export type OfficeViewId = "overview" | "desk" | "board" | "server" | "shelf" | "walk";

export const OFFICE_VIEWS: Record<
  Exclude<OfficeViewId, "walk">,
  {
    label: string;
    position: [number, number, number];
    target: [number, number, number];
  }
> = {
  overview: {
    label: "全景",
    position: [6.2, 4.5, 7.6],
    target: [0, 1.25, -0.5],
  },
  desk: {
    label: "工位",
    position: [0, 2.35, 3.9],
    target: [0, 1.4, -0.8],
  },
  board: {
    label: "架构",
    position: [-1.25, 1.9, 1.6],
    target: [-1.86, 1.65, -0.87],
  },
  server: {
    label: "机架",
    position: [2.8, 2, 1.4],
    target: [3.8, 1.4, -1.7],
  },
  shelf: {
    label: "书架",
    position: [-2.7, 2, .4],
    target: [-3.6, 1.4, -2.65],
  },
};

/** 房间可行走边界（与新工作室围墙尺寸对齐） */
export const WALK_BOUNDS = {
  minX: -4.2,
  maxX: 4.2,
  minZ: -3.6,
  maxZ: 3.8,
  y: 1.55,
};
