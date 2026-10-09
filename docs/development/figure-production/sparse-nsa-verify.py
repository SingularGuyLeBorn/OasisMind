"""NSA教学成本与窗口计数复算, 不代表运行模型实验."""
def windows(length, block=32, stride=16):
    return list(range(1, length - block + 2, stride))

assert windows(31) == []
assert windows(32) == [1]
assert windows(128) == [1, 17, 33, 49, 65, 81, 97]
assert len(windows(65536)) == 4095
total = 4095 + 16 * 64 + 512
assert total == 5631
assert 4 * 64 * 128 * total == 184516608
assert 4 * 64 * 128 * 65536 == 2147483648
assert abs(total * 2048 / 2**20 - 10.998046875) < 1e-12
assert 65536 * 2048 / 2**20 == 128
assert len(windows(2048)) + 1024 + 512 == 1663
assert all(start + 31 <= 70 for start in windows(70))
assert windows(70) == [1, 17, 33]
print('PASS: full-window boundaries, FLOPs, KV bytes and causal prefix')
