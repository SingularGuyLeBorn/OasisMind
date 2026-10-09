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
candidate_tokens = 266 * 16
tile_tokens = 190 * 64
bytes_per_token = 2 * 128 * 2 * 8
mib = 1024 ** 2
assert candidate_tokens == 4256
assert candidate_tokens * bytes_per_token / mib == 16.625
assert tile_tokens * bytes_per_token / mib == 47.5
assert 65536 * bytes_per_token / mib == 256
assert 256 / 50 == 5.12
assert 526 + 26 + 9 + 39 == 600
assert 526 + 26 == 552 and 526 + 9 == 535
assert 18 + 5 + 3 == 26
assert 820 + 64 * 18 == 1972
assert 480 + 64 * 13 == 1312
assert 65 + 38 + 290 + 87 == 480
assert 480 - 290 == 190
# 点估计达标不蕴含置信下界达标。
assert -0.8 > -1.0 and -1.4 < -1.0
print({'candidate_mib': 16.625, 'full_tile_mib': 47.5, 'hypothetical_hbm_mib': 50, 'status': 'PASS'})
