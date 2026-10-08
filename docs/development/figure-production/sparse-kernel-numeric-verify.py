"""复算索引到 Kernel 的64K教学案例，不依赖GPU测速。"""
import math

dynamic_pages = 32 * 4 + 40 * 2 + 40
assert dynamic_pages == 248
total_pages = dynamic_pages + 16
assert total_pages == 256 + 16 - 8 == 264
tokens = total_pages * 16
tiles = 4 + 32 + 40 + 40
assert tokens == 4224 and tiles == 116
capacity = tiles * 64
assert capacity == 7424
assert round(100 * tokens / capacity, 2) == 56.90
assert capacity * 512 * 8 / 2**20 == 29
assert tokens * 512 * 8 / 2**20 == 16.5
assert 65536 * 512 * 8 / 2**20 == 256
assert round(256 / 29, 2) == 8.83
assert round(4 * capacity * 128 * 32 / 1e6, 1) == 121.6
assert tiles / 4 == 29
assert 4 * 32 * 128 * 4 == 65536
assert 4 * 32 * 2 * 4 == 1024
denominator = 12 * math.exp(-1) + 18 * math.exp(-2) + 10 + 20 * math.exp(-3)
assert round(denominator, 2) == 17.85
print({'pages': total_pages, 'tiles': tiles, 'capacity': capacity, 'merged_denominator': denominator, 'status': 'PASS'})

# 串行教学模型：T=1 GB，带宽单位GB/s，所得时间单位秒。
for reuse, expected_direct, expected_gather in [(1, .01, .012), (8, .08, .019)]:
    direct = reuse / 100
    gather = 1 / 100 + 1 / 1000 + reuse / 1000
    assert math.isclose(direct, expected_direct)
    assert math.isclose(gather, expected_gather)
print({'gather_cases': 2, 'status': 'PASS'})

selected = {1, 2, 63, 64, 65, 127}
blocks = {i // 64 for i in selected}
loaded = {i for block in blocks for i in range(block * 64, (block + 1) * 64)}
assert blocks == {0, 1} and len(loaded) == 128
# 全部logit为0；六个候选V为1，其余加载槽V为0。
# 仅加载不应改变定义；整块不加成员资格mask则把分母从6变成128。
reference = sum(1 for i in selected) / len(selected)
masked = sum(1 for i in loaded if i in selected) / sum(i in selected for i in loaded)
expanded = sum(i in selected for i in loaded) / len(loaded)
assert reference == masked == 1
assert expanded == 6 / 128 != reference
print({'selected': len(selected), 'loaded': len(loaded), 'masked_output': masked, 'expanded_output': expanded, 'status': 'PASS'})
