module.exports = {
    types: new Set([

    ]),
    keywords: new Set([

    ]),
    basicOperators: new Set([

    ]),
    comparisonOperators: new Set([
        `==`, `!=`, `>=`, `<`, `>`,
        `<=`,
    ]),
    brackets: new Set([
        `(`, `)`, `{`,
        `}`, `[`, `]`,
    ]),
    classes: new Set([

    ]),
    strings: {
        singleLine: [],
    },
    comments: {
        singleLine: `#`,
        multiLineStart: ``,
        multiLineEnd: ``,
    }
};