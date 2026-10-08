// 教学图的块级可见性、间接读取与损失手算检查.
const mask = [[1, 0, 0, 0], [1, 1, 0, 0], [0, 0, 1, 0], [1, 0, 0, 1]];
const labels = ['C1', 'C2', 'N1', 'N2'];
const reach = mask.map(row => [...row]);
for (let k = 0; k < 4; k++) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) reach[i][j] ||= reach[i][k] && reach[k][j];
  }
}
if (JSON.stringify(reach) !== JSON.stringify(mask)) throw new Error('多层间接读取增加了未允许的边');
if (reach[2][0] || reach[3][1] || reach[3][2]) throw new Error('去噪块读取了错误的上下文');
const tokenMask = Array.from({ length: 8 }, (_, i) => Array.from({ length: 8 }, (_, j) => mask[Math.floor(i / 2)][Math.floor(j / 2)]));
if (tokenMask.flat().reduce((sum, x) => sum + x, 0) !== 24) throw new Error('块级到 token 级展开错误');
const t = 0.5;
const probabilityB = 0.25;
const probabilityC = 0.5;
const loss = -(Math.log(probabilityB) + Math.log(probabilityC)) / t;
if (Math.abs(loss - 4.1588830833596715) > 1e-12) throw new Error('损失手算错误');
console.log(JSON.stringify({ labels, mask, allowedTokenPairs: 24, loss, normalization: '两项求和, 未按块或 token 平均' }));
