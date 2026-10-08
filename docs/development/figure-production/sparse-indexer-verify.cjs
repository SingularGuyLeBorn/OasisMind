const assert = require('node:assert/strict');
const relu = x => Math.max(0, x);
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
let decompositions = 0;
for (let a = -5; a <= 5; a++) {
  for (let b = -5; b <= 5; b++) {
    for (let w = -3; w <= 3; w++) {
      const q = [[a, 1], [b, -2]], weights = [1, w], key = [2, -1];
      const score = q.reduce((s, h, i) => s + weights[i] * relu(dot(h, key)), 0);
      const fused = [0, 1].map(d => q.reduce((s, h, i) => s + weights[i] * h[d], 0));
      const residual = q.reduce((s, h, i) => s + weights[i] * relu(-dot(h, key)), 0);
      assert.equal(score, dot(fused, key) + residual);
      decompositions++;
    }
  }
}
// 正文的一维两头例子：融合线性项4.5，残差1.5，原分数6。
assert.equal((2 - 0.5) * 3, 4.5);
assert.equal(0.5 * relu(3), 1.5);
assert.equal(relu(6) + 0.5 * relu(-3), 6);
// 坐标box上界可能不被真实token达到；它仍必须覆盖所有合法key。
const q = [1, -2], keys = [[-1, 0], [3, 4]];
const lower = [-1, 0], upper = [3, 4];
const bound = q.reduce((s, x, d) => s - Math.max(x, 0) * lower[d] + Math.max(-x, 0) * upper[d], 0);
assert.equal(bound, 9);
assert.deepEqual(keys.map(k => -dot(q, k)), [1, 5]);
for (let x = -1; x <= 3; x++) for (let y = 0; y <= 4; y++) assert.ok(-dot(q, [x, y]) <= bound);
const N = 131072, H = 64, M = 8192, G = 4;
assert.equal(N * H, 8388608);
assert.equal(N * 8, 1048576);
assert.equal(N + M * H, 655360);
assert.equal(N / G + M * H, 557056);
// 单位置误差小于margin仍可能翻转，必须同时控制边界两侧。
assert.ok(0.06 < 1 - 0.9);
assert.ok(1 - 0.06 < 0.9 + 0.06);
let routeCases = 0;
for (const weights of [[1, -2, 0.5], [-1, 2, -3]]) {
  const queries = [[1, -2], [-2, 1], [3, 1]];
  const bounds = queries.map((h, i) => Math.abs(weights[i]) * relu(h.reduce((s, x, d) => s - Math.max(x, 0) * lower[d] + Math.max(-x, 0) * upper[d], 0)));
  for (let budget = 0; budget <= queries.length; budget++) {
    const routed = bounds.map((_, i) => i).sort((a, b) => bounds[b] - bounds[a] || a - b).slice(0, budget);
    const omittedBound = bounds.reduce((s, x, i) => s + (routed.includes(i) ? 0 : x), 0);
    for (let mask = 0; mask < 8; mask++) {
      const subset = queries.map((_, i) => i).filter(i => mask & (1 << i));
      if (subset.length !== budget) continue;
      const alternative = bounds.reduce((s, x, i) => s + (subset.includes(i) ? 0 : x), 0);
      assert.ok(omittedBound <= alternative);
    }
    for (let x = -1; x <= 3; x++) {
      for (let y = 0; y <= 4; y++) {
        const key = [x, y];
        const omitted = queries.reduce((s, h, i) => s + (routed.includes(i) ? 0 : weights[i] * relu(-dot(h, key))), 0);
        assert.ok(Math.abs(omitted) <= omittedBound);
        routeCases++;
      }
    }
  }
}
console.log({ decompositions, routeCases, original: 6, linear: 4.5, residual: 1.5, boxBound: bound, sharedPoolDots: N / G + M * H });
