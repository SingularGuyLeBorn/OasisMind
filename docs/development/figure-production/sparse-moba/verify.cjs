const assert = require('node:assert/strict');

// 教学示例: 单 head, d=1, B=2, k=2, 当前 query 位置5.
const keys = [2, 0, 4, 2, 1, 9];
const values = [0, 0, 10, 20, 30, 99];
const means = [(keys[0] + keys[1]) / 2, (keys[2] + keys[3]) / 2];
assert.deepEqual(means, [1, 3]);
const candidatePositions = [3, 4, 5];
assert(candidatePositions.every(p => p <= 5));
const logits = candidatePositions.map(p => keys[p - 1]);
const exp = logits.map(z => Math.exp(z - 4));
const denominator = exp.reduce((a, b) => a + b, 0);
const weights = exp.map(x => x / denominator);
const direct = weights.reduce((sum, w, i) => sum + w * values[candidatePositions[i] - 1], 0);
const lh = 1 + Math.exp(-2);
const uh = 10 + 20 * Math.exp(-2);
const ls = 1;
const us = 30;
const combined = (uh + Math.exp(-3) * us) / (lh + Math.exp(-3) * ls);
assert(Math.abs(direct - combined) < 1e-12);
assert(Math.abs(weights.reduce((a, b) => a + b, 0) - 1) < 1e-12);
assert.equal(direct.toFixed(4), '11.9822');
assert.deepEqual(weights.map(x => x.toFixed(4)), ['0.8438', '0.1142', '0.0420']);
console.log(JSON.stringify({means, candidatePositions, weights, direct, combined}, null, 2));
