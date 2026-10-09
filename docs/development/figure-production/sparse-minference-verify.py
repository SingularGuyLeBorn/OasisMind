"""复算 MInference 图中的教学候选与块预算, 不代表实验结果."""

def a_shape(i):
    return {0} | set(range(max(0, i - 1), i + 1))

def vertical_slash(i):
    return ({1} if i >= 1 else set()) | {i} | ({i - 2} if i >= 2 else set())

def blocks(i):
    start = 2 * (i // 2)
    selected = set(range(start, i + 1))
    if i in (4, 5):
        selected |= {0, 1}
    if i in (6, 7):
        selected |= {2, 3}
    return selected

assert vertical_slash(6) == {1, 4, 6}
for method in (a_shape, vertical_slash, blocks):
    rows = [sorted(method(i)) for i in range(8)]
    assert all(0 <= j <= i for i, row in enumerate(rows) for j in row)
    print(method.__name__, rows, sum(map(len, rows)))

assert 128 * 64 * 5 * 8 == 327680
assert 128 * 64 * 5 * 64 == 2621440
assert (1024 - 0) + (1024 - 512) == 1536
print("教学候选、因果范围及预算通过")

# 只检查候选图, 不进行任何图像编辑. 坐标对应生成图的两个矩阵.
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        from PIL import Image
        image = Image.open(sys.argv[1]).convert("RGB")
        assert image.size == (1536, 1024)
        for name, origin_x, method in (("A", 84, a_shape), ("BS", 1082, blocks)):
            observed = []
            for i in range(8):
                row = set()
                for j in range(8):
                    color = image.getpixel((int(origin_x + (j + 0.5) * 26.3), int(363 + (i + 0.5) * 25.75)))
                    if j > i:
                        assert max(color) - min(color) < 35 and 100 < color[0] < 235, (name, i, j, color)
                    if color[2] - color[0] > 50 and color[0] < 120:
                        row.add(j)
                assert row == method(i), (name, i, row, method(i))
                observed.append(sorted(row))
            print(name, "像素格与公式一致", observed)
