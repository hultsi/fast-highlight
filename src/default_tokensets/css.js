module.exports = {
    types: new Set([

    ]),
    keywords: new Set([
        `html`, `head`, `body`, `span`,
        `div`, `ul`, `ol`, `li`,
        `br`, `pre`, `code`, `root`
    ]),
    basicOperators: new Set([
        `;`, `:`,
    ]),
    comparisonOperators: new Set([

    ]),
    brackets: new Set([
        `(`, `)`, `{`, `}`,
    ]),
    classes: new Set([

    ]),
    strings: {
        singleLine: [`"`, `'`],
    },
    comments: {
        singleLine: ``,
        multiLineStart: `/*`,
        multiLineEnd: `*/`,
    },
    styleOverrides: new Set([
        { token: `absolute`, style: "STRING" },
        { token: `fixed`, style: "STRING" },
        { token: `inherit`, style: "STRING" },
        { token: `initial`, style: "STRING" },
        { token: `relative`, style: "STRING" },
        { token: `revert`, style: "STRING" },
        { token: `revert-layer`, style: "STRING" },
        { token: `static`, style: "STRING" },
        { token: `sticky`, style: "STRING" },
        { token: `inline`, style: "STRING" },
        { token: `inline-block`, style: "STRING" },
        { token: `block`, style: "STRING" },
        { token: `none`, style: "STRING" },
    ])
};