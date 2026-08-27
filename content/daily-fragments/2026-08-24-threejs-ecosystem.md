---
title: 每日碎片：2026-08-24 Three.js 生态五连（漫游/特效/调试/粒子/地形）
category: 每日碎片
published: true
excerpt: >-
  今天刷到的五条 Three.js 生态碎片：SpaceRoam 三维漫游交付平台、achrefelouafi 三个游戏特效开源项目、中国山脉 3D
  交互学习地图、场景调试四件套、three.quarks 粒子特效库。
tags:
  - 每日碎片
  - Three.js
  - WebGL
  - 3D可视化
  - 开源项目
---
# 每日碎片：2026-08-24 Three.js 生态五连

今天刷到的五条 Three.js 生态碎片，先沉淀再慢慢整理。

## 1. SpaceRoam：三维模型沉浸式漫游交付平台

微信《三维模型做好了，然后呢？》（所遇非良人）。个人项目 SpaceRoam（https://sm.deerblock.cn）：把 GLB/GLTF 三维模型上传，配置环境/灯光/初始视角，给节点挂弹窗/跳转/问答/音频事件，一键发布成免登录链接，访客第一人称沉浸式漫游（PC 点击移动、手机双摇杆横屏）。

- 解决痛点：「模型交付文件打不开、专业软件门槛、截图讲不清空间关系」，把「交付文件」变成「交付体验」
- 适用场景：城市园区展示、工厂设备讲解、展厅导览、教育培训
- 限制：仅 GLB/GLTF、单文件 200MB 以内、单人编辑无协同、无多版本管理、无物理引擎

## 2. achrefelouafi 三个 Three.js 游戏特效开源项目

微信《Three.js 游戏特效天花板》（柳杉前端，2026-08-19）。三个项目都是角色施法，思路完全不同：

**① AvatarCastingAbilitiesThreeJS**（受《最后的气宗》启发）
- 手势绘制路径，火水土气四种能力沿样条曲线传播并在终点引爆
- 体积渲染火焰：相机向密度场发射射线，26 采样/960x540 约 1.3ms；水面/空气全是着色器程序化，无精灵纹理
- 行走模式：角色「骑乘」手势路径，弧长参数化，旅行速度是真实米/秒，与帧率无关

**② LinearAbiltyCastingThreeJS**（贴近 MOBA 动作游戏）
- 5 元素技能：Q 寒霜矛、E 风暴矛、R 炽焰陨石、F 新星光束、V 闪电陷阱+寒气侵袭
- 938 个实时滑块参数，暂停时也生效，预设可导出 JSON 共享
- 性能：288 冰晶 3 个 draw calls，四技能同时仅约 186 个

**③ SamuraiThirdPersonTemplateThreeJS**（完整第三人称动作模板）
- 256x256 查找表程序化高度场替代 snoise，保证 GPU/JS 计算一致防陷地
- 运动变形攻击、无物理引擎布娃娃、影子/审判/飞行三能力
- 燃烧武士刀：体积瞄准 + 黑体辐射，装备工作室加条目零代码

## 3. 中国山脉 地形区 3D 交互学习地图

微信《AI助学，把中国地形"搬"进浏览器》（不止DILI，2026-08-21）。自制单文件网页工具，基于 Three.js 真实海拔分层设色，离线可用不联网：

- 覆盖三级阶梯、四大高原/四大盆地/三大平原/主要丘陵、五大走向山脉、主要水系
- 左键旋转+滚轮缩放+悬停显省名；点击条目视角飞行定位展开详情
- 右下角图层开关/自动旋转/复位视角，右上角海拔图例（6000m 以上雪山深绿到 200m 以下平原浅灰）
- 适合学生自学、教师投屏、备考复习

## 4. Three.js 3D 场景调试全套方案

微信（前端琛哥、吴大维，2026-07-08）。Vite+TS 集成四大调试工具：
- **AxesHelper**：红X绿Y蓝Z三色坐标轴，判断物体朝向与空间位置
- **GridHelper**：网格地板，看高度/距离/公转轨道半径
- **dat.GUI**：悬浮可视化面板，拖拽/下拉实时改参，无需刷新页面
- **Stats**：悬浮帧率面板，实时 FPS，用于性能排查

`npm i dat.gui stats` + `npm i -D @types/dat.gui @types/stats.js`

## 5. three.quarks 粒子特效库

微信《Three.js 粒子特效库 three.quarks (附HTML示例)》（我要当个大英雄）。基于 Three.js+TS 的高性能粒子/VFX 库，工作流接近 Unity Shuriken：

- 仓库 github.com/Alchemist0823/three.quarks，官网 quarks.art（含可视化编辑器 quarks.art/create，JSON 导出），v0.17.1 MIT
- 核心：GPU instancing + interleaved buffer，BatchedRenderer 合并同材质系统，单次 draw call
- 4 渲染器（Billboard/Stretched Billboard/Mesh/Trail）+ 7 发射器（Point/Sphere/Cone/Circle/Hemisphere/MeshSurface/Grid）+ 丰富 Behavior（Size/Color/Speed/Rotation/Force/Orbit/Noise/Collision）
- Monorepo 三包：three.quarks / quarks.core（零依赖）/ quarks.r3f（React Three Fiber 声明式集成）
- 踩坑：只发 ESM 无 UMD，必须用 import map 把 three/three.quarks/quarks.core 都映射到 CDN，**勿用 +esm 后缀**（会把 three 重解析成两个实例，导致 instanceof 失败、粒子渲染异常）

## 小结

五条都指向同一个方向：Three.js 生态从「会渲染」走向「能交付、能调试、能做游戏级特效」。SpaceRoam 做交付层、调试四件套做开发层、quarks 做特效库、achrefelouafi 三件套做高端样板、地形地图做教学场景，可以作为后续 3D 可视化方向「项目+工具+教程」资源清单的素材。
