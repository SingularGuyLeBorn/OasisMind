// 核验文章的滑窗区间推导及教学图块分类, 不代表 GPU 内核测试.
const assert = require('node:assert/strict');
let cases = 0;
for (let n = 1; n <= 24; n++) {
  for (let bq = 1; bq <= 8; bq++) {
    for (let w = 1; w <= 24; w++) {
      for (let a = 0; a < n; a += bq) {
        const b = Math.min(n - 1, a + bq - 1);
        const union = [], intersection = [];
        for (let j = 0; j < n; j++) {
          const valid = Array.from({ length: b - a + 1 }, (_, r) => j <= a + r && j >= Math.max(0, a + r - w + 1));
          if (valid.some(Boolean)) union.push(j);
          if (valid.every(Boolean)) intersection.push(j);
        }
        const first = Math.max(0, a - w + 1);
        const common = Math.max(0, b - w + 1);
        assert.deepEqual(union, Array.from({ length: b - first + 1 }, (_, r) => first + r));
        assert.deepEqual(intersection, common > a ? [] : Array.from({ length: a - common + 1 }, (_, r) => common + r));
        cases++;
      }
    }
  }
}
// 8×8 因果窗口, W=4, query/key 块均为 2×2.
const matrix = Array.from({ length: 8 }, (_, i) => Array.from({ length: 8 }, (_, j) => Number(j <= i && i - j < 4)));
const blocks = Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) => {
  const count = matrix[2 * r][2 * c] + matrix[2 * r][2 * c + 1] + matrix[2 * r + 1][2 * c] + matrix[2 * r + 1][2 * c + 1];
  return count === 0 ? 'skip' : count === 4 ? 'full' : 'partial';
}));
assert.deepEqual(blocks, [
  ['partial', 'skip', 'skip', 'skip'],
  ['full', 'partial', 'skip', 'skip'],
  ['partial', 'full', 'partial', 'skip'],
  ['skip', 'partial', 'full', 'partial'],
]);
assert.equal(matrix.flat().reduce((a, b) => a + b, 0), 26);
assert.equal(blocks.flat().filter(x => x !== 'skip').length * 4, 36);
console.log(JSON.stringify({ cases, matrix, blocks, validEdges: 26, executedElements: 36, skippedBlocks: 7 }));
