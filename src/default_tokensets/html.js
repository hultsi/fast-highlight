module.exports = {
    types: new Set([
        `html`, `span`, `div`, `DOCTYPE`,
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
        `class`, `id`
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