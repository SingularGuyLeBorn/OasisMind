const assert = require('node:assert/strict');

const pageA = [[3, -2], [-1, 1], [2, -1]];
const pageB = [[1, 4], [0, 2]];
function summary(keys) {
  return {
    min: keys[0].map((_, j) => Math.min(...keys.map(k => k[j]))),
    max: keys[0].map((_, j) => Math.max(...keys.map(k => k[j]))),
  };
}
function upper(query, keys) {
  const { min, max } = summary(keys);
  return query.reduce((sum, q, j) => sum + Math.max(q * min[j], q * max[j]), 0);
}
assert.deepEqual(summary(pageA), { min: [-1, -2], max: [3, 1] });
assert.deepEqual(summary(pageB), { min: [0, 2], max: [1, 4] });
assert.deepEqual([upper([2, -1], pageA), upper([2, -1], pageB)], [8, 0]);
const appendedB = [...pageB, [-2, 5]];
assert.deepEqual(summary(appendedB), { min: [-2, 2], max: [1, 5] });
assert.deepEqual([upper([0, 1], pageA), upper([0, 1], appendedB)], [1, 5]);
assert.equal(upper([0, 1], pageB), 4);
console.log('Quest 状态图: 摘要、两步页分数和未追加参照均通过');
