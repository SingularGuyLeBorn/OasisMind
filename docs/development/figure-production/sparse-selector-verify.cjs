// 检查选择器训练页的数学教学关系, 不代表训练实验.
const assert = require('node:assert/strict');
const r = [0.7, -0.2, 1.1], p = [0.5, 0.3, 0.2], tau = 0.8;
function softmax(x) {
  const m = Math.max(...x), e = x.map(v => Math.exp(v - m));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map(v => v / sum);
}
function loss(scores) {
  const q = softmax(scores.map(x => x / tau));
  return p.reduce((sum, x, i) => sum + x * Math.log(x / q[i]), 0);
}
const q = softmax(r.map(x => x / tau));
for (let i = 0; i < r.length; i++) {
  const plus = [...r], minus = [...r], eps = 1e-6;
  plus[i] += eps; minus[i] -= eps;
  assert.ok(Math.abs((loss(plus) - loss(minus)) / (2 * eps) - (q[i] - p[i]) / tau) < 1e-8);
}
assert.ok(Math.abs(q.reduce((a, b) => a + b, 0) - 1) < 1e-12);
assert.equal(Math.max(0, q.reduce((a, b) => a + b, 0) - 2) ** 2, 0);
const cold = softmax([1, 2, 3].map(x => x / 0.001));
assert.deepEqual(cold, [0, 0, 1]);
const values = [2, -1, 4], output = p.reduce((sum, x, i) => sum + x * values[i], 0);
for (let j = 0; j < p.length; j++) {
  const removed = p.reduce((sum, x, i) => sum + (i === j ? 0 : x * values[i]), 0) / (1 - p[j]);
  assert.ok(Math.abs(removed - output - p[j] / (1 - p[j]) * (output - values[j])) < 1e-12);
}
console.log('KL学生温度梯度、softmax预算退化及单点删除恒等式通过');
