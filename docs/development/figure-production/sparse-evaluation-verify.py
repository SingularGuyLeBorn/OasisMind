"""复算教师质量排序与稳定长度定义的教学反例。"""
probabilities = [0.6, 0.3, 0.1]
values = [0.0, 0.0, 10.0]
full = sum(p * v for p, v in zip(probabilities, values))
teacher_top1 = values[0]
alternative_top1 = values[2]
assert full == 1.0
# 目标为0时稀疏输出更准；目标为10时教师最大质量候选并非最优。
assert abs(teacher_top1 - 0.0) < abs(full - 0.0)
assert abs(alternative_top1 - 10.0) < abs(teacher_top1 - 10.0)
lengths = [8, 16, 32]
accuracy = {8: 1.0, 16: 0.5, 32: 0.99}
threshold = 0.95
prefix = [n for n in lengths if all(accuracy[m] >= threshold for m in lengths if m <= n)]
assert max(prefix) == 8
assert max(n for n in lengths if accuracy[n] >= threshold) == 32
print({'full': full, 'teacher_top1': teacher_top1, 'alternative_top1': alternative_top1, 'stable_length': max(prefix), 'status': 'PASS'})
