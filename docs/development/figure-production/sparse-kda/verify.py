"""复算文章式 (4)、(5) 及分块代码, 为后续状态机制图提供数值依据."""
from pathlib import Path
import re
import numpy as np

root = Path(__file__).resolve().parents[4]
article = root / 'content/SparseAttention/1-基础/1.2-固定与混合连接/1.2.3-KDA与混合线性注意力.md'
code = re.search(r'```python\n(.*?)\n```', article.read_text(encoding='utf-8'), re.S).group(1)
namespace = {}
exec(compile(code, str(article), 'exec'), namespace)
np.testing.assert_allclose(namespace['o_rec'], namespace['o_chk'], atol=1e-12, rtol=1e-12)
np.testing.assert_allclose(namespace['S_rec'], namespace['S'], atol=1e-12, rtol=1e-12)

q, k, v, alpha, beta = [namespace[key] for key in ['q', 'k', 'v', 'alpha', 'beta']]
T, dk = k.shape
transitions = [(np.eye(dk) - beta[t] * np.outer(k[t], k[t])) @ np.diag(alpha[t]) for t in range(T)]
expanded = np.zeros_like(namespace['o_rec'])
for t in range(T):
    for i in range(t + 1):
        propagation = np.eye(dk)
        for j in range(i + 1, t + 1):
            propagation = transitions[j] @ propagation
        expanded[t] += beta[i] * (q[t] @ propagation @ k[i]) * v[i]
np.testing.assert_allclose(expanded, namespace['o_rec'], atol=1e-12, rtol=1e-12)
print('逐步递推、时间有序展开、分块计算一致; 最大输出误差:', np.max(np.abs(expanded - namespace['o_rec'])))
