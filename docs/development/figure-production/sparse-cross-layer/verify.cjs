const assert = require('node:assert/strict');
const top = (s, k) => s.map((v, i) => [v, i + 1]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).slice(0, k).map(x => x[1]).sort((a, b) => a - b);
const a = [10, 9, 1, 0], b = [10, 1, 9.5, 0];
assert.deepEqual(top(a, 2), [1, 2]);
assert.deepEqual(top(b, 2), [1, 3]);
assert.deepEqual(top(a, 3), [1, 2, 3]);
assert.deepEqual(top(b.slice(0, 3), 2), [1, 3]);
const margin = 1e-9, epsilon = 1e-6, drift = 1e-8;
assert.ok(2 * drift / (margin + epsilon) < 1);
assert.ok(2 * drift >= margin);
assert.notDeepEqual(top([1, 1 - margin], 1), top([1 - drift, 1 - margin + drift], 1));
console.log('四位置集合及 epsilon 稳定性反例通过');
// 覆盖不同长度、预算和可复现扰动，核对正文充分条件。
let cases = 0;
for (let n = 2; n <= 24; n++) {
  for (let k = 1; k < n; k++) {
    const scores = Array.from({ length: n }, (_, i) => (n - i) * 2);
    for (let trial = 0; trial < 20; trial++) {
      const perturbed = scores.map((v, i) => v + 0.9 * Math.sin(17 * i + trial));
      assert.deepEqual(top(scores, k), top(perturbed, k));
      cases++;
    }
  }
}
console.log(`正 margin 扰动充分条件 ${cases} 例通过`);
