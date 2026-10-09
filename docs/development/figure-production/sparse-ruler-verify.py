"""复算RULER教学图与层序反例, 不是论文实验结果."""
from collections import Counter
from itertools import product

counts = Counter('a a b c a b b d a a b e'.split())
assert counts == {'a': 5, 'b': 4, 'c': 1, 'd': 1, 'e': 1}
assert [w for w, _ in counts.most_common(2)] == ['a', 'b']
values = {'X1': 12345, 'Y1': 54321}
values['X2'] = values['X1']
values['X3'] = values['X2']
assert [k for k, v in values.items() if v == 12345] == ['X1', 'X2', 'X3']
layers = [{2, 4}, {1, 5}, {6}]
assert not (min(layers[0]) < min(layers[1]) < min(layers[2]))
assert any(a < b < c for a, b, c in product(*layers))
print('PASS: 词频、变量别名、首次命中逆序但后续层序可行')
