module.exports = {
    types: new Set([
        `$`, `True`, `False`, `true`, `false`
    ]),
    keywords: new Set([
        `if`, `endif`, `elseif`, `else`,
    ]),
    basicOperators: new Set([

    ]),
    comparisonOperators: new Set([
        `==`, `!=`, `>=`, `<`, `>`,
        `<=`,
    ]),
    brackets: new Set([
        `{`, `}`,`(`, `)`, `[`, `]`,
    ]),
    classes: new Set([
        `VERSION`, `DESCRIPTION`, `PUBLIC`, `PRIVATE`, `INTERFACE`,
        `version`, `description`, `public`, `private`, `interface`,
    ]),
    strings: {
        singleLine: [],
    },
    comments: {
        singleLine: `#`,
        multiLineStart: ``,
        multiLineEnd: ``,
    },
    styleOverrides: new Set([
        { token: `{`, style: "KEYWORD" },
        { token: `}`, style: "KEYWORD" },
    ])
};