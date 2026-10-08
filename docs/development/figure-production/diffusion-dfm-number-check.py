"""复算 DFM 教学图的行生成矩阵、一步转移与校正通量, 对应正文式 (7)、(8)、(17)."""

import math


def row_product(probability, matrix):
    """shape: (3,) @ (3, 3), 行是出发状态, 列是到达状态."""
    assert len(probability) == len(matrix) == 3
    assert all(len(row) == 3 for row in matrix)
    return [sum(probability[i] * matrix[i][j] for i in range(3)) for j in range(3)]


probability = [0.5, 0.3, 0.2]
generator = [[-2.0, 1.2, 0.8], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]]
step = 0.1
transition = [
    [float(i == j) + step * generator[i][j] for j in range(3)]
    for i in range(3)
]
correction = [[-0.12, 0.12, 0.0], [0.20, -0.20, 0.0], [0.0, 0.0, 0.0]]

assert all(math.isclose(sum(row), 0.0, abs_tol=1e-12) for row in generator)
assert all(math.isclose(sum(row), 0.0, abs_tol=1e-12) for row in correction)
assert all(math.isclose(sum(row), 1.0) for row in transition)
assert all(value >= 0.0 for row in transition for value in row)
updated = row_product(probability, transition)
assert all(math.isclose(a, b) for a, b in zip(updated, [0.4, 0.36, 0.24]))
assert all(math.isclose(x, 0.0, abs_tol=1e-12) for x in row_product(probability, correction))
assert math.isclose(probability[0] * correction[0][1], 0.06)
assert math.isclose(probability[1] * correction[1][0], 0.06)
print("DFM 教学数值通过: pP=(0.4,0.36,0.24), pRc=0, 双向通量均为 0.06")
