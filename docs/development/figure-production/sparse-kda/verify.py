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

# 教学图二维手算: 衰减状态、旧读数、纠错增量、更新状态与当前输出.
previous = np.array([[2., 0.], [0., 4.]])
decay = np.array([.5, 1.])
key = np.array([.6, .8])
value = np.array([3., 1.])
query = np.array([1., 0.])
rate = .5
decayed = decay[:, None] * previous
read = decayed.T @ key
error = value - read
increment = rate * np.outer(key, error)
updated = decayed + increment
np.testing.assert_allclose(read, [.6, 3.2])
np.testing.assert_allclose(error, [2.4, -2.2])
np.testing.assert_allclose(increment, [[.72, -.66], [.96, -.88]])
np.testing.assert_allclose(updated, [[1.72, -.66], [.96, 3.12]])
np.testing.assert_allclose(updated.T @ query, [1.72, -.66])
np.testing.assert_allclose(updated, (np.eye(2) - rate * np.outer(key, key)) @ np.diag(decay) @ previous + rate * np.outer(key, value))
# 核验式 (7) 的通用 DPLR 参数映射, 写入项必须包含 beta.
dplr_a = rate * key
dplr_b = key * decay
dplr_value = rate * value
np.testing.assert_allclose(updated, (np.diag(decay) - np.outer(dplr_a, dplr_b)) @ previous + np.outer(key, dplr_value))
print('教学图状态与输出手算通过')
