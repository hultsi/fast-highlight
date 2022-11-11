module.exports = {
    types: new Set([

    ]),
    keywords: new Set([
        `html`, `head`, `body`, `span`,
        `div`, `ul`, `ol`, `li`,
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
    }
};