module.exports = {
    types: new Set([
        `html`, `head`, `body`, `span`,
        `div`, `DOCTYPE`, `ul`, `ol`, `li`,
        `br`,
    ]),
    keywords: new Set([

    ]),
    basicOperators: new Set([
        `=`, `/`, `!`
    ]),
    comparisonOperators: new Set([

    ]),
    brackets: new Set([
        `<`, `>`
    ]),
    classes: new Set([
        `class`, `id`, `lang`,
    ]),
    strings: {
        singleLine: [`"`, `'`],
    },
    comments: {
        singleLine: ``,
        multiLineStart: `<!--`,
        multiLineEnd: `-->`,
    }
};