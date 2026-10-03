#!/usr/bin/env python
# 扫描模型库 bi 文件的正文未翻译缺口。
# 用法: python scripts/scan-untranslated.py [model-library根目录]
# 输出: docs/development/untranslated-scan.txt, 并打印摘要。
# 判定: 连续英文散文积累 >200 字符, 之后中文字数 < 10 即缺口。
# 已排除: 图表题注(Figure/Table/图N/表N 开头), 目录(省略号+页码), 引用块, 标题,
#         纯链接行, 含$/<的公式与HTML行, References/Acknowledgements/致谢 节。
# 2026-09-27 修正: 含 >=4 汉字的行一律计为中文(译文里 URL/配置项/专名等拉丁 token 很多,
#         旧的 han*3>=latin 判据把整段译文误判为英文, 造成大面积假阳性);
#         zh 累计改为汉字数, 阈值降为 10 (真缺口的后续中文 ≈ 0-5 字)。
import re, os, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else 'content/model-library/03-模型家族'
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'docs/development/untranslated-scan.txt')

CAP = re.compile(r'^(Figure|Table|Fig\.|图\s?\d|表\s?\d|\*\*Figure|\*\*Table)')
TOC = re.compile(r'\.{3,}\s*\d*\s*$')
AUTHOR = re.compile(r'(\b[A-Z][a-z]+\s+[A-Z]\.?[\s,])')
NAMELIST = re.compile(r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b')

def prose_kind(line):
    if TOC.search(line): return None
    if line.startswith(('<!--', '![', '>', '#', '|')): return None
    if re.match(r'^\[[^]]*\]\([^)]*\)$', line): return None  # 纯链接行豁免 (严格: 整行恰一个链接)
    if len(AUTHOR.findall(line)) >= 8: return None  # 作者名单行豁免
    if len(NAMELIST.findall(line)) >= 6: return None  # 西文姓名列表 (Jinze Bai, Shuai Bai, ...) 豁免
    han = sum(1 for c in line if '\u4e00' <= c <= '\u9fff')
    if han >= 4: return ('ZH', han)  # 含中文的图表行视为浓缩译文 (本库题注常带中文对照)
    if CAP.match(line): return None
    latin = sum(1 for c in line if c.isascii() and c.isalpha())
    if latin >= 30 and len(line) >= 60 and '$' not in line and '<' not in line: return ('EN', len(line))
    return None

report = {}
fams = sorted(os.listdir(ROOT))
for fam in fams:
    fdir = os.path.join(ROOT, fam)
    if not os.path.isdir(fdir) or not os.path.isfile(os.path.join(fdir, '_index.md')): continue
    for slug in [l[2:].strip().rstrip('/') for l in open(os.path.join(fdir, '_index.md'), encoding='utf-8') if l.startswith('- ')]:
        bi = os.path.join(fdir, slug, slug + '-bi.md')
        if not os.path.isfile(bi): continue
        in_skip = False
        in_code = False
        st = {'en': 0, 'zh': 0, 'start': 0, 'first': '', 'gaps': []}
        def flush(end):
            if st['en'] > 200 and st['zh'] < 10:
                st['gaps'].append((st['start'], end, st['en'], st['zh'], st['first'][:60]))
            st['en'] = 0; st['zh'] = 0
        for n, raw in enumerate(open(bi, encoding='utf-8'), 1):
            line = raw.strip()
            if not line: continue
            if line.startswith('```'):
                in_code = not in_code; continue
            if in_code: continue  # 代码块内部不计入散文
            if line.startswith('#'):
                in_skip = bool(re.search(r'References|参考文献|Acknowledg|致谢', line, re.I))
                flush(n - 1); continue
            if in_skip: continue
            r = prose_kind(line)
            if r is None: continue
            k, amount = r
            if k == 'EN':
                if st['en'] == 0 and st['zh'] == 0: st['start'] = n; st['first'] = line
                elif st['en'] == 0 and st['zh'] > 0: flush(n - 1); st['start'] = n; st['first'] = line
                st['en'] += amount
            elif k == 'ZH':
                st['zh'] += amount
        flush('EOF')
        if st['gaps']:
            report[f'{fam}/{slug}'] = st['gaps']

lines = []
for k, v in sorted(report.items()):
    total = sum(g[2] for g in v)
    lines.append(f'== {k} ({len(v)}处/{total}字符)')
    for s, e, en, zh, first in v:
        lines.append(f'   行{s}-{e} (EN{en}字符/ZH{zh}字符): {first}')
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write('# 正文散文未翻译扫描 (判定: EN积累>200字符且之后中文<max(50,6%))\n# 由 scripts/scan-untranslated.py 生成, 行号为 bi 文件内行号\n\n' + '\n'.join(lines) + '\n')
total = sum(sum(g[2] for g in v) for v in report.values())
print(f'涉及文件: {len(report)}, 总缺口: {total}字符, 明细: {OUT}')
for k, v in sorted(report.items(), key=lambda x: -sum(g[2] for g in x[1]))[:20]:
    print(f'{k}: {sum(g[2] for g in v)}字符/{len(v)}处')
