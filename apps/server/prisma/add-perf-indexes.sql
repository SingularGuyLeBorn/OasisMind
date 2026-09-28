length=6)"""
            assert result == expected

    def test_rjust(self):
        n = 1000
        ci = pd.CategoricalIndex(list("a" * n) + (["abc"] * n))
        dti = pd.date_range("2000-01-01", freq="s", periods=n * 2)
        mi = MultiIndex.from_arrays([ci, ci.codes + 9, dti], names=["a", "b", "dti"])
        result = mi[:1].__repr__()
        expected = """\
MultiIndex([('a', 9, '2000-01-01 00:00:00')],
           names=['a', 'b', 'dti'])"""
        assert result == expected

        result = mi[::500].__repr__()
        expected = """\
MultiIndex([(  'a',  9, '2000-01-01 00:00:00'),
            (  'a',  9, '2000-01-01 00:08:20'),
            ('abc', 10, '2000-01-01 00:16:40'),
            ('abc', 10, '2000-01-01 00:25:00')],
           names=['a', 'b', 'dti'])"""
        assert result == expected

        result = mi.__repr__()
        expected = """\
MultiIndex([(  'a',  9, '2000-01-01 00:00:00'),
            (  