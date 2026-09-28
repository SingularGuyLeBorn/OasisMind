23 B<=AA AA>12"))

    prints::

        [['B', '=', '12'], ['AA', '=', '23'], ['B', '<=', 'AA'], ['AA', '>', '12']]
    """
    asKeyword = asKeyword or as_keyword
    useRegex = useRegex and use_regex

    if (
        isinstance(caseless, str_type)
        and __diag__.warn_on_multiple_string_args_to_oneof
    ):
        warnings.warn(
            "More than one string argument passed to one_of, pass"
            " choices as a list or space-delimited string",
            stacklevel=2,
        )

    if caseless:
        isequal = lambda a, b: a.upper() == b.upper()
        masks = lambda a, b: b.upper().startswith(a.upper())
        parseElementClass = CaselessKeyword if asKeyword else CaselessLiteral
    else:
        isequal = lambda a, b: a == b
        masks = lambda a, b: b.startswith(a)
        parseElementClass = Keyword if asKeyword else Literal

    symbols: List[str] = []
    if isinstance(strs, str_type):
        symbols = strs.split()
    elif isinstance(strs, Iterable):
        symbols = list(strs)
    else:
        raise TypeError("Invalid argument to one_of, expected string or iterable")
    if not symbols:
        return NoMatch()

    # reorder given symbols to take care to avoid masking longer choices with shorter ones
    # (but only if the given symbols are not just single characters)
    if any(len(sym) > 1 for sym in symbols):
        i = 0
        while i < len(symbols) - 1:
            cur = symbols[i]
            for j, other in enumerate(symbols[i + 1 :]):
                if isequal(other, cur):
                    del symbols[i + j + 1]
                    break
                elif masks(cur, other):
                    del symbols[i + j + 1]
                    symbols.insert(i, other)
                    break
            else:
                i += 1

    if useRegex:
        re_flags: int = re.IGNORECASE if caseless else 0

        try:
            if all(len(sym) == 1 for sym in symbols):
                # symbols are just single characters, create range regex pattern
                patt = "[{}]".format(
                    "".join(_escape_regex_range_chars(sym) for sym in symbols)
                )
            else:
                patt = "|".join(re.escape(sym) for sym in symbols)

            # wrap with \b word break markers if defining as keywords
            if asKeyword:
                patt = r"\b(?:{})\b".format(patt)

            ret = Regex(patt, flags=re_flags).set_name(" | ".join(symbols))

            if caseless:
                # add parse action to return symbols as specified, not in random
                # casing as found in input string
                symbol_map = {sym.lower(): sym for sym in symbols}
                ret.add_parse_action(lambda s, l, t: symbol_map[t[0].lower()])

            return ret

        except re.error:
            warnings.warn(
                "Exception creating Regex for one_of, building MatchFirst", stacklevel=2
            )

    # last resort, just use MatchFirst
    return MatchFirst(parseElementClass(sym) for sym in symbols).set_name(
        " | ".join(symbols)
    )


def dict_of(key: ParserElement, value: ParserElement) -> ParserElement:
    """Helper to easily and clearly define a dictionary by specifying
    the respective patterns for the key and value.  Takes care of
    defining the :class:`Dict`, :class:`ZeroOrMore`, and
    :class:`Group` tokens in the proper order.  The key pattern
    can include delimiting markers or punctuation, as long as they are
    suppressed, thereby leaving the significant key text.  The value
    pattern can include named results, so that the :class:`Dict` results
    can include named token fields.

    Example::

        text = "shape: SQUARE posn: upper left color: light blue texture: burlap"
        attr_expr = (label + Suppress(':') + OneOrMore(data_word, stop_on=label).set_parse_action(' '.join))
        print(attr_expr[1, ...].parse_string(text).dump())

        attr_label = label
        attr_value = Suppress(':') + OneOrMore(data_word, stop_on=label).set_parse_action(' '.join)

        # similar to Dict, but simpler call format
        result = dict_of(attr_label, attr_value).parse_string(text)
        print(result.dump())
        print(result['shape'])
        print(result.shape)  # object attribute access works too
        print(result.as_dict())

    prints::

        [['shape', 'SQUARE'], ['posn', 'upper left'], ['color', 'light blue'], ['texture', 'burlap']]
        - color: 'light blue'
        - posn: 'upper left'
        - shape: 'SQUARE'
        - texture: 'burlap'
        SQUARE
        SQUARE
        {'color': 'light blue', 'shape': 'SQUARE', 'posn': 'upper left', 'texture': 'burlap'}
    """
    return Dict(OneOrMore(Group(key + value)))


def original_text_for(
    expr: ParserElement, as_string: bool = True, *, asString: bool = True
) -> ParserElement:
    """Helper to return the original, untokenized text for a given
    expression.  Useful to restore the parsed fields of an HTML start
    tag into the raw tag text itself, or to revert separate tokens with
    intervening whitespace back to the original matching input text. By
    default, returns astring containing the original parsed text.

    If the optional ``as_string`` argument is passed as
    ``False``, then the return value is
    a :class:`ParseResults` containing any results names that
    were originally matched, and a single token containing the original
    matched text from the input string.  So if the expression passed to
    :class:`original_text_for` contains expressions with defined
    results names, you must set ``as_string`` to ``False`` if you
    want to preserve those results name values.

    The ``asString`` pre-PEP8 argument is retained for compatibility,
    but will be removed in a future release.

    Example::

        src = "this is test <b> bold <i>text</i> </b> normal text "
        for tag in ("b", "i"):
            opener, closer = make_html_tags(tag)
            patt = original_text_for(opener + SkipTo(closer) + closer)
            print(patt.search_string(src)[0])

    prints::

        ['<b> bold <i>text</i> </b>']
        ['<i>text</i>']
    """
    asString = asString and as_string

    locMarker = Empty().set_parse_action(lambda s, loc, t: loc)
    endlocMarker = locMarker.copy()
    endlocMarker.callPreparse = False
    matchExpr = locMarker("_original_start") + expr + endlocMarker("_original_end")
    if asString:
        extractText = lambda s, l, t: s[t._original_start : t._original_end]
    else:

        def extractText(s, l, t):
            t[:] = [s[t.pop("_original_start") : t.pop("_original_end")]]

    matchExpr.set_parse_action(extractText)
    matchExpr.ignoreExprs = expr.ignoreExprs
    matchExpr.suppress_warning(Diagnostics.warn_ungrouped_named_tokens_in_collection)
    return matchExpr


def ungroup(expr: ParserElement) -> ParserElement:
    """Helper to undo pyparsing's default grouping of And expressions,
    even if all but one are non-empty.
    """
    return TokenConverter(expr).add_parse_action(lambda t: t[0])


def locatedExpr(expr: ParserElement) -> ParserElement:
    """
    (DEPRECATED - future code should use the Located class)
    Helper to decorate a returned token with its starting and ending
    locations in the input string.

    This helper adds the following results names:

    - ``locn_start`` - location where matched expression begins
    - ``locn_end`` - location where matched expression ends
    - ``value`` - the actual parsed results

    Be careful if the input text contains ``<TAB>`` characters, you
    may want to call :class:`ParserElement.parseWithTabs`

    Example::

        wd = Word(alphas)
        for match in locatedExpr(wd).searchString("ljsdf123lksdjjf123lkkjj1222"):
            print(match)

    prints::

        [[0, 'ljsdf', 5]]
        [[8, 'lksdjjf', 15]]
        [[18, 'lkkjj', 23]]
    """
    locator = Empty().set_parse_action(lambda ss, ll, tt: ll)
    return Group(
        locator("locn_start")
        + expr("value")
        + locator.copy().leaveWhitespace()("locn_end")
    )


def nested_expr(
    opener: Union[str, ParserElement] = "(",
    closer: Union[str, ParserElement] = ")",
    content: typing.Optional[ParserElement] = None,
    ignore_expr: ParserElement = quoted_string(),
    *,
    ignoreExpr: ParserElement = quoted_string(),
) -> ParserElement:
    """Helper method for defining nested lists enclosed in opening and
    closing delimiters (``"("`` and ``")"`` are the default).

    Parameters:
    - ``opener`` - opening character for a nested list
      (default= ``"("``); can also be a pyparsing expression
    - ``closer`` - closing character for a nested list
      (default= ``")"``); can also be a pyparsing expression
    - ``content`` - expression for items within the nested lists
      (default= ``None``)
    - ``ignore_expr`` - expression for ignoring opening and closing delimiters
      (default= :class:`quoted_string`)
    - ``ignoreExpr`` - this pre-PEP8 argument is retained for compatibility
      but will be removed in a future release

    If an expression is not provided for the content argument, the
    nested expression will capture all whitespace-delimited content
    between delimiters as a list of separate values.

    Use the ``ignore_expr`` argument to define expressions that may
    contain opening or closing characters that should not be treated as
    opening or closing characters for nesting, such as quoted_string or
    a comment expression.  Specify multiple expressions using an
    :class:`Or` or :class:`MatchFirst`. The default is
    :class:`quoted_string`, but if no expressions are to be ignored, then
    pass ``None`` for this argument.

    Example::

        data_type = one_of("void int short long char float double")
        decl_data_type = Combine(data_type + Opt(Word('*')))
        ident = Word(alphas+'_', alphanums+'_')
        number = pyparsing_common.number
        arg = Group(decl_data_type + ident)
        LPAR, RPAR = map(Suppress, "()")

        code_body = nested_expr('{', '}', ignore_expr=(quoted_string | c_style_comment))

        c_function = (decl_data_type("type")
                      + ident("name")
                      + LPAR + Opt(delimited_list(arg), [])("args") + RPAR
                      + code_body("body"))
        c_function.ignore(c_style_comment)

        source_code = '''
            int is_odd(int x) {
                return (x%2);
            }

            int dec_to_hex(char hchar) {
                if (hchar >= '0' && hchar <= '9') {
                    return (ord(hchar)-ord('0'));
                } else {
                    return (10+ord(hchar)-ord('A'));
                }
            }
        '''
        for func in c_function.search_string(source_code):
            print("%(name)s (%(type)s) args: %(args)s" % func)


    prints::

        is_odd (int) args: [['int', 'x']]
        dec_to_hex (int) args: [['char', 'hchar']]
    """
    if ignoreExpr != ignore_expr:
        ignoreExpr = ignore_expr if ignoreExpr == quoted_string() else ignoreExpr
    if opener == closer:
        raise ValueError("opening and closing strings cannot be the same")
    if content is None:
        if isinstance(opener, str_type) and isinstance(closer, str_type):
            if len(opener) == 1 and len(closer) == 1:
                if ignoreExpr is not None:
                    content = Combine(
                        OneOrMore(
                            ~ignoreExpr
                            + CharsNotIn(
                                opener + closer + ParserElement.DEFAULT_WHITE_CHARS,
                                exact=1,
                            )
                        )
                    ).set_parse_action(lambda t: t[0].strip())
                else:
                    content = empty.copy() + CharsNotIn(
                        opener + closer + ParserElement.DEFAULT_WHITE_CHARS
                    ).set_parse_action(lambda t: t[0].strip())
            else:
                if ignoreExpr is not None:
                    content = Combine(
                        OneOrMore(
                            ~ignoreExpr
                            + ~Literal(opener)
                            + ~Literal(closer)
                            + CharsNotIn(ParserElement.DEFAULT_WHITE_CHARS, exact=1)
                        )
                    ).set_parse_action(lambda t: t[0].strip())
                else:
                    content = Combine(
                        OneOrMore(
                            ~Literal(opener)
                            + ~Literal(closer)
                            + CharsNotIn(ParserElement.DEFAULT_WHITE_CHARS, exact=1)
                        )
                    ).set_parse_action(lambda t: t[0].strip())
        else:
            raise ValueError(
                "opening and closing arguments must be strings if no content expression is given"
            )
    ret = Forward()
    if ignoreExpr is not None:
        ret <<= Group(
            Suppress(opener) + ZeroOrMore(ignoreExpr | ret | content) + Suppress(closer)
        )
    else:
        ret <<= Group(Suppress(opener) + ZeroOrMore(ret | content) + Suppress(closer))
    ret.set_name("nested %s%s expression" % (opener, closer))
    return ret


def _makeTags(tagStr, xml, suppress_LT=Suppress("<"), suppress_GT=Suppress(">")):
    """Internal helper to construct opening and closing tag expressions, given a tag name"""
    if isinstance(tagStr, str_type):
        resname = tagStr
        tagStr = Keyword(tagStr, caseless=not xml)
    else:
        resname = tagStr.name

    tagAttrName = Word(alphas, alphanums + "_-:")
    if xml:
        tagAttrValue = dbl_quoted_string.copy().set_parse_action(remove_quotes)
        openTag = (
            suppress_LT
            + tagStr("tag")
            + Dict(ZeroOrMore(Group(tagAttrName + Suppress("=") + tagAttrValue)))
            + Opt("/", default=[False])("empty").set_parse_action(
                lambda s, l, t: t[0] == "/"
            )
            + suppress_GT
        )
    else:
        tagAttrValue = quoted_string.copy().set_parse_action(remove_quotes) | Word(
            printables, exclude_chars=">"
        )
        openTag = (
            suppress_LT
            + tagStr("tag")
            + Dict(
                ZeroOrMore(
                    Group(
                        tagAttrName.set_parse_action(lambda t: t[0].lower())
                        + Opt(Suppress("=") + tagAttrValue)
                    )
                )
            )
            + Opt("/", default=[False])("empty").set_parse_action(
                lambda s, l, t: t[0] == "/"
            )
            + suppress_GT
        )
    closeTag = Combine(Literal("</") + tagStr + ">", adjacent=False)

    openTag.set_name("<%s>" % resname)
    # add start<tagname> results name in parse action now that ungrouped names are not reported at two levels
    openTag.add_parse_action(
        lambda t: t.__setitem__(
            "start" + "".join(resname.replace(":", " ").title().split()), t.copy()
        )
    )
    closeTag = closeTag(
        "end" + "".join(resname.replace(":", " ").title().split())
    ).set_name("</%s>" % resname)
    openTag.tag = resname
    closeTag.tag = resname
    openTag.tag_body = SkipTo(closeTag())
    return openTag, closeTag


def make_html_tags(
    tag_str: Union[str, ParserElement]
) -> Tuple[ParserElement, ParserElement]:
    """Helper to construct opening and closing tag expressions for HTML,
    given a tag name. Matches tags in either upper or lower case,
    attributes with namespaces and with quoted or unquoted values.

    Example::

        text = '<td>More info at the <a href="https://github.com/pyparsing/pyparsing/wiki">pyparsing</a> wiki page</td>'
        # make_html_tags returns pyparsing expressions for the opening and
        # closing tags as a 2-tuple
        a, a_end = make_html_tags("A")
        link_expr = a + SkipTo(a_end)("link_text") + a_end

        for link in link_expr.search_string(text):
            # attributes in the <A> tag (like "href" shown here) are
            # also accessible as named results
            print(link.link_text, '->', link.href)

    prints::

        pyparsing -> https://github.com/pyparsing/pyparsing/wiki
    """
    return _makeTags(tag_str, False)


def make_xml_tags(
    tag_str: Union[str, ParserElement]
) -> Tuple[ParserElement, ParserElement]:
    """Helper to construct opening and closing tag expressions for XML,
    given a tag name. Matches tags only in the given upper/lower case.

    Example: similar to :class:`make_html_tags`
    """
    return _makeTags(tag_str, True)


any_open_tag: ParserElement
any_close_tag: ParserElement
any_open_tag, any_close_tag = make_html_tags(
    Word(alphas, alphanums + "_:").set_name("any tag")
)

_htmlEntityMap = {k.rstrip(";"): v for k, v in html.entities.html5.items()}
common_html_entity = Regex("&(?P<entity>" + "|".join(_htmlEntityMap) + ");").set_name(
    "common HTML entity"
)


def replace_html_entity(t):
    """Helper parser action to replace common HTML entities with their special characters"""
    return _htmlEntityMap.get(t.entity)


class OpAssoc(Enum):
    LEFT = 1
    RIGHT = 2


InfixNotationOperatorArgType = Union[
    ParserElement, str, Tuple[Union[ParserElement, str], Union[ParserElement, str]]
]
InfixNotationOperatorSpec = Union[
    Tuple[
        InfixNotationOperatorArgType,
        int,
        OpAssoc,
        typing.Optional[ParseAction],
    ],
    Tuple[
        InfixNotationOperatorArgType,
        int,
        OpAssoc,
    ],
]


def infix_notation(
    base_expr: ParserElement,
    op_list: List[InfixNotationOperatorSpec],
    lpar: Union[str, ParserElement] = Suppress("("),
    rpar: Union[str, ParserElement] = Suppress(")"),
) -> ParserElement:
    """Helper method for constructing grammars of expressions made up of
    operators working in a precedence hierarchy.  Operators may be unary
    or binary, left- or right-associative.  Parse actions can also be
    attached to operator expressions. The generated parser will also
    recognize the use of parentheses to override operator precedences
    (see example below).

    Note: if you define a deep operator list, you may see performance
    issues when using infix_notation. See
    :class:`ParserElement.enable_packrat` for a mechanism to potentially
    improve your parser performance.

    Parameters:
    - ``base_expr`` - expression representing the most basic operand to
      be used in the expression
    - ``op_list`` - list of tuples, one for each operator precedence level
      in the expression grammar; each tuple is of the form ``(op_expr,
      num_operands, right_left_assoc, (optional)parse_action)``, where:

      - ``op_expr`` is the pyparsing expression for the operator; may also
        be a string, which will be converted to a Literal; if ``num_operands``
        is 3, ``op_expr`` is a tuple of two expressions, for the two
        operators separating the 3 terms
      - ``num_operands`` is the number of terms for this operator (must be 1,
        2, or 3)
      - ``right_left_assoc`` is the indicator whether the operator is right
        or left associative, using the pyparsing-defined constants
        ``OpAssoc.RIGHT`` and ``OpAssoc.LEFT``.
      - ``parse_action`` is the parse action to be associated with
        expressions matching this operator expression (the parse action
        tuple member may be omitted); if the parse action is passed
        a tuple or list of functions, this is equivalent to calling
        ``set_parse_action(*fn)``
        (:class:`ParserElement.set_parse_action`)
    - ``lpar`` - expression for matching left-parentheses; if passed as a
      str, then will be parsed as Suppress(lpar). If lpar is passed as
      an expression (such as ``Literal('(')``), then it will be kept in
      the parsed results, and grouped with them. (default= ``Suppress('(')``)
    - ``rpar`` - expression for matching right-parentheses; if passed as a
      str, then will be parsed as Suppress(rpar). If rpar is passed as
      an expression (such as ``Literal(')')``), then it will be kept in
      the parsed results, and grouped with them. (default= ``Suppress(')')``)

    Example::

        # simple example of four-function arithmetic with ints and
        # variable names
        integer = pyparsing_common.signed_integer
        varname = pyparsing_common.identifier

        arith_expr = infix_notation(integer | varname,
            [
            ('-', 1, OpAssoc.RIGHT),
            (one_of('* /'), 2, OpAssoc.LEFT),
            (one_of('+ -'), 2, OpAssoc.LEFT),
            ])

        arith_expr.run_tests('''
            5+3*6
            (5+3)*6
            -2--11
            ''', full_dump=False)

    prints::

        5+3*6
        [[5, '+', [3, '*', 6]]]

        (5+3)*6
        [[[5, '+', 3], '*', 6]]

        -2--11
        [[['-', 2], '-', ['-', 11]]]
    """
    # captive version of FollowedBy that does not do parse actions or capture results names
    class _FB(FollowedBy):
        def parseImpl(self, instring, loc, doActions=True):
            self.expr.try_parse(instring, loc)
            return loc, []

    _FB.__name__ = "FollowedBy>"

    ret = Forward()
    if isinstance(lpar, str):
        lpar = Suppress(lpar)
    if isinstance(rpar, str):
        rpar = Suppress(rpar)

    # if lpar and rpar are not suppressed, wrap in group
    if not (isinstance(rpar, Suppress) and isinstance(rpar, Suppress)):
        lastExpr = base_expr | Group(lpar + ret + rpar)
    else:
        lastExpr = base_expr | (lpar + ret + rpar)

    for i, operDef in enumerate(op_list):
        opExpr, arity, rightLeftAssoc, pa = (operDef + (None,))[:4]
        if isinstance(opExpr, str_type):
            opExpr = ParserElement._literalStringClass(opExpr)
        if arity == 3:
            if not isinstance(opExpr, (tuple, list)) or len(opExpr) != 2:
                raise ValueError(
                    "if numterms=3, opExpr must be a tuple or list of two expressions"
                )
            opExpr1, opExpr2 = opExpr
            term_name = "{}{} term".format(opExpr1, opExpr2)
        else:
            term_name = "{} term".format(opExpr)

        if not 1 <= arity <= 3:
            raise ValueError("operator must be unary (1), binary (2), or ternary (3)")

        if rightLeftAssoc not in (OpAssoc.LEFT, OpAssoc.RIGHT):
            raise ValueError("operator must indicate right or left associativity")

        thisExpr: Forward = Forward().set_name(term_name)
        if rightLeftAssoc is OpAssoc.LEFT:
            if arity == 1:
                matchExpr = _FB(lastExpr + opExpr) + Group(lastExpr + opExpr[1, ...])
            elif arity == 2:
                if opExpr is not None:
                    matchExpr = _FB(lastExpr + opExpr + lastExpr) + Group(
                        lastExpr + (opExpr + lastExpr)[1, ...]
                    )
                else:
                    matchExpr = _FB(lastExpr + lastExpr) + Group(lastExpr[2, ...])
            elif arity == 3:
                matchExpr = _FB(
                    lastExpr + opExpr1 + lastExpr + opExpr2 + lastExpr
                ) + Group(lastExpr + OneOrMore(opExpr1 + lastExpr + opExpr2 + lastExpr))
        elif rightLeftAssoc is OpAssoc.RIGHT:
            if arity == 1:
                # try to avoid LR with this extra test
                if not isinstance(opExpr, Opt):
                    opExpr = Opt(opExpr)
                matchExpr = _FB(opExpr.expr + thisExpr) + Group(opExpr + thisExpr)
            elif arity == 2:
                if opExpr is not None:
                    matchExpr = _FB(lastExpr + opExpr + thisExpr) + Group(
                        lastExpr + (opExpr + thisExpr)[1, ...]
                    )
                else:
                    matchExpr = _FB(lastExpr + thisExpr) + Group(
                        lastExpr + thisExpr[1, ...]
                    )
            elif arity == 3:
                matchExpr = _FB(
                    lastExpr + opExpr1 + thisExpr + opExpr2 + thisExpr
                ) + Group(lastExpr + opExpr1 + thisExpr + opExpr2 + thisExpr)
        if pa:
            if isinstance(pa, (tuple, list)):
                matchExpr.set_parse_action(*pa)
            else:
                matchExpr.set_parse_action(pa)
        thisExpr <<= (matchExpr | lastExpr).setName(term_name)
        lastExpr = thisExpr
    ret <<= lastExpr
    return ret


def indentedBlock(blockStatementExpr, indentStack, indent=True, backup_stacks=[]):
    """
    (DEPRECATED - use IndentedBlock class instead)
    Helper method for defining space-delimited indentation blocks,
    such as those used to define block statements in Python source code.

    Parameters:

    - ``blockStatementExpr`` - expression defining syntax of statement that
      is repeated within the indented block
    - ``indentStack`` - list created by caller to manage indentation stack
      (multiple ``statementWithIndentedBlock`` expressions within a single
      grammar should share a common ``indentStack``)
    - ``indent`` - boolean indicating whether block must be indented beyond
      the current level; set to ``False`` for block of left-most statements
      (default= ``True``)

    A valid block must contain at least one ``blockStatement``.

    (Note that indentedBlock uses internal parse actions which make it
    incompatible with packrat parsing.)

    Example::

        data = '''
        def A(z):
          A1
          B = 100
          G = A2
          A2
          A3
        B
        def BB(a,b,c):
          BB1
          def BBA():
            bba1
            bba2
            bba3
        C
        D
        def spam(x,y):
             def eggs(z):
                 pass
        '''


        indentStack = [1]
        stmt = Forward()

        identifier = Word(alphas, alphanums)
        funcDecl = ("def" + identifier + Group("(" + Opt(delimitedList(identifier)) + ")") + ":")
        func_body = indentedBlock(stmt, indentStack)
        funcDef = Group(funcDecl + func_body)

        rvalue = Forward()
        funcCall = Group(identifier + "(" + Opt(delimitedList(rvalue)) + ")")
        rvalue << (funcCall | identifier | Word(nums))
        assignment = Group(identifier + "=" + rvalue)
        stmt << (funcDef | assignment | identifier)

        module_body = stmt[1, ...]

        parseTree = module_body.parseString(data)
        parseTree.pprint()

    prints::

        [['def',
          'A',
          ['(', 'z', ')'],
          ':',
          [['A1'], [['B', '=', '100']], [['G', '=', 'A2']], ['A2'], ['A3']]],
         'B',
         ['def',
          'BB',
          ['(', 'a', 'b', 'c', ')'],
          ':',
          [['BB1'], [['def', 'BBA', ['(', ')'], ':', [['bba1'], ['bba2'], ['bba3']]]]]],
         'C',
         'D',
         ['def',
          'spam',
          ['(', 'x', 'y', ')'],
          ':',
          [[['def', 'eggs', ['(', 'z', ')'], ':', [['pass']]]]]]]
    """
    backup_stacks.append(indentStack[:])

    def reset_stack():
        indentStack[:] = backup_stacks[-1]

    def checkPeerIndent(s, l, t):
        if l >= len(s):
            return
        curCol = col(l, s)
        if curCol != indentStack[-1]:
            if curCol > indentStack[-1]:
                raise ParseException(s, l, "illegal nesting")
            raise ParseException(s, l, "not a peer entry")

    def checkSubIndent(s, l, t):
        curCol = col(l, s)
        if curCol > indentStack[-1]:
            indentStack.append(curCol)
        else:
            raise ParseException(s, l, "not a subentry")

    def checkUnindent(s, l, t):
        if l >= len(s):
            return
        curCol = col(l, s)
        if not (indentStack and curCol in indentStack):
            raise ParseException(s, l, "not an unindent")
        if curCol < indentStack[-1]:
            indentStack.pop()

    NL = OneOrMore(LineEnd().set_whitespace_chars("\t ").suppress())
    INDENT = (Empty() + Empty().set_parse_action(checkSubIndent)).set_name("INDENT")
    PEER = Empty().set_parse_action(checkPeerIndent).set_name("")
    UNDENT = Empty().set_parse_action(checkUnindent).set_name("UNINDENT")
    if indent:
        smExpr = Group(
            Opt(NL)
            + INDENT
            + OneOrMore(PEER + Group(blockStatementExpr) + Opt(NL))
            + UNDENT
        )
    else:
        smExpr = Group(
            Opt(NL)
            + OneOrMore(PEER + Group(blockStatementExpr) + Opt(NL))
            + Opt(UNDENT)
        )

    # add a parse action to remove backup_stack from list of backups
    smExpr.add_parse_action(
        lambda: backup_stacks.pop(-1) and None if backup_stacks else None
    )
    smExpr.set_fail_action(lambda a, b, c, d: reset_stack())
    blockStatementExpr.ignore(_bslash + LineEnd())
    return smExpr.set_name("indented block")


# it's easy to get these comment structures wrong - they're very common, so may as well make them available
c_style_comment = Combine(Regex(r"/\*(?:[^*]|\*(?!/))*") + "*/").set_name(
    "C style comment"
)
"Comment of the form ``/* ... */``"

html_comment = Regex(r"<!--[\s\S]*?-->").set_name("HTML comment")
"Comment of the form ``<!-- ... -->``"

rest_of_line = Regex(r".*").leave_whitespace().set_name("rest of line")
dbl_slash_comment = Regex(r"//(?:\\\n|[^\n])*").set_name("// comment")
"Comment of the form ``// ... (to end of line)``"

cpp_style_comment = Combine(
    Regex(r"/\*(?:[^*]|\*(?!/))*") + "*/" | dbl_slash_comment
).set_name("C++ style comment")
"Comment of either form :class:`c_style_comment` or :class:`dbl_slash_comment`"

java_style_comment = cpp_style_comment
"Same as :class:`cpp_style_comment`"

python_style_comment = Regex(r"#.*").set_name("Python style comment")
"Comment of the form ``# ... (to end of line)``"


# build list of built-in expressions, for future reference if a global default value
# gets updated
_builtin_exprs: List[ParserElement] = [
    v for v in vars().values() if isinstance(v, ParserElement)
]


# pre-PEP8 compatible names
delimitedList = delimited_list
countedArray = counted_array
matchPreviousLiteral = match_previous_literal
matchPreviousExpr = match_previous_expr
oneOf = one_of
dictOf = dict_of
originalTextFor = original_text_for
nestedExpr = nested_expr
makeHTMLTags = make_html_tags
makeXMLTags = make_xml_tags
anyOpenTag, anyCloseTag = any_open_tag, any_close_tag
commonHTMLEntity = common_html_entity
replaceHTMLEntity = replace_html_entity
opAssoc = OpAssoc
infixNotation = infix_notation
cStyle