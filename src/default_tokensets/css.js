module.exports = {
    types: new Set([

    ]),
    keywords: new Set([
        `body`, `html`, `div`, `span`
    ]),
    basicOperators: new Set([

    ]),
    comparisonOperators: new Set([

    ]),
    brackets: new Set([
        `(`, `)`, `{`, `}`,
    ]),
    classes: new Set([
        `class`, `id`
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