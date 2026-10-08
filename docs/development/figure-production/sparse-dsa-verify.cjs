const assert = require('node:assert/strict');
const relu = x => Math.max(x, 0);
const scores = [[2, -1], [1, 3], [-1, 4]].map(k => .75 * relu(k[0]) + .25 * relu(k[1]));
assert.deepEqual(scores, [1.5, 1.5, 1]);
// 实数权重可以让非负 ReLU 响应产生负贡献。
assert.equal(-2 * relu(3), -6);
const p1 = 1 / (1 + Math.exp(1)), p2 = 1 - p1;
assert.ok(Math.abs(2 * p1 - .538) < .001);
assert.ok(Math.abs(3 * p2 - 2.193) < .001);
let bounds = 0;
for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) {
  const p = [a / (a + b + 3), b / (a + b + 3), 3 / (a + b + 3)];
  for (let mask = 1; mask < 8; mask++) {
    const mass = p.reduce((s, x, i) => s + ((mask & (1 << i)) ? x : 0), 0);
    for (const values of [[-1, 0, 1], [1, -1, -1]]) {
      const dense = p.reduce((s, x, i) => s + x * values[i], 0);
      const sparse = p.reduce((s, x, i) => s + ((mask & (1 << i)) ? x * values[i] / mass : 0), 0);
      assert.ok(Math.abs(dense - sparse) <= 2 * (1 - mass) + 1e-12);
      bounds++;
    }
  }
}
for (let t = 0; t < 30; t++) for (const k of [1, 2, 8, 2048]) {
  const legal = Array.from({ length: t + 1 }, (_, s) => s);
  const selected = legal.slice(0, Math.min(k, t + 1));
  assert.equal(selected.length, Math.min(k, t + 1));
  assert.ok(selected.every(s => s >= 0 && s <= t));
}
console.log({ scores, mainOutput: [2 * p1, 3 * p2], bounds });
