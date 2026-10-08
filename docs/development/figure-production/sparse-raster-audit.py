"""只读核验 SparseAttention 位图;不替代缺失的原 img_audit.py 全库审计."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[3] / 'content/SparseAttention'
expected = {'.png': 'PNG', '.jpg': 'JPEG', '.jpeg': 'JPEG', '.webp': 'WEBP', '.gif': 'GIF'}
counts = {'zero': 0, 'bad_magic': 0, 'partial_zero_head': 0, 'wrong_ext': 0}
files = [p for p in root.rglob('*') if p.is_file() and p.suffix.lower() in expected]
for path in files:
    with path.open('rb') as stream:
        head = stream.read(64)
    if not head:
        counts['zero'] += 1
        continue
    # 本脚本定义:文件开头至少16字节全零,并非对整幅图黑色像素的判定.
    if head[:16] == bytes(16):
        counts['partial_zero_head'] += 1
    try:
        with Image.open(path) as bitmap:
            if bitmap.format != expected[path.suffix.lower()]:
                counts['wrong_ext'] += 1
            bitmap.verify()
    except Exception as error:
        counts['bad_magic'] += 1
        print(path, type(error).__name__)
print({'scope': str(root), 'files': len(files), **counts})
raise SystemExit(any(counts.values()))
