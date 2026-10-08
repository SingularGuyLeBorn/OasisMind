const assert = require('node:assert/strict');

// 用户要求复算教学数值；toy 使用零起点位置，正文集合使用一起点。
function select(scores, windowSize, globalBudget) {
  const start = Math.max(0, scores.length - windowSize);
  const local = Array.from({ length: scores.length - start }, (_, i) => start + i);
  const global = Array.from({ length: start }, (_, i) => i)
    .sort((a, b) => scores[b] - scores[a] || a - b)
    .slice(0, globalBudget);
  return { local, global, all: [...global, ...local] };
}

const toy = select([7, 1, 9, 2, 8, 0, 100, 99], 2, 3);
assert.deepEqual(toy.local, [6, 7]);
assert.deepEqual(toy.global, [2, 4, 0]);
assert.equal(new Set(toy.all).size, 5);
assert.deepEqual(select([2], 128, 1024), { local: [0], global: [], all: [0] });
assert.deepEqual(select([3, 3, 3, 4], 1, 2).global, [0, 1]);
let cases = 0;
for (let n = 0; n < 80; n++) {
  for (let w = 0; w < 12; w++) {
    for (let k = 0; k < 12; k++) {
      const result = select(Array.from({ length: n }, (_, i) => (i * 17) % 23), w, k);
      assert.equal(new Set(result.all).size, result.all.length);
      assert.equal(result.all.length, Math.min(n, w + k));
      assert.ok(result.global.every(i => i < Math.max(0, n - w)));
      cases++;
    }
  }
}
assert.equal(1152 / 1048576 * 100, 0.10986328125);
assert.equal(128 / 16 + 1024, 1032);
assert.equal(1152 / 16, 72);
console.log({ cases, toy, coveragePercent: 1152 / 1048576 * 100 });
