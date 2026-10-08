"""核对静态掩码图的单元格与正文手算；只读图片。"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
image = Image.open(ROOT / 'content/SparseAttention/1-基础/images/static-mask-flow-v2.png').convert('RGB')
assert image.size == (1536, 1024)
expected_counts = [64, 22, 32]
for panel, (left, width) in enumerate([(112, 339), (600, 330), (1042, 313)]):
    total = 0
    for i in range(8):
        for j in range(8):
            x = round(left + (j + .5) * width / 8)
            y = round(184 + (i + .5) * 324 / 8)
            r, g, b = image.getpixel((x, y))
            filled = min(r, g, b) < 220
            expected = panel == 0 or abs(i - j) <= 1 or (panel == 2 and (i == 3 or j == 3))
            assert filled == expected, (panel, i + 1, j + 1, (r, g, b))
            total += filled
    assert total == expected_counts[panel]

cases = 0
for n in range(1, 40):
    for radius in range(n):
        actual = sum(abs(i-j) <= radius for i in range(n) for j in range(n))
        assert actual == n * (2 * radius + 1) - radius * (radius + 1)
        cases += 1
assert 1 + 32 * (4096 - 1) == 131041
assert 8192 * 151 == 1236992
print({'mask_cells': 192, 'edge_count_cases': cases, 'counts': expected_counts, 'status': '通过'})
