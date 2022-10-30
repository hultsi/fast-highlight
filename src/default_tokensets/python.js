module.exports = {
    types: new Set([
        `def`, `True`, `False`, `class`,
    ]),
    keywords: new Set([
        `for`, `while`, `return`, `do`,
        `if`, `else`, `elif`, `is`,
        `and`, `not`, `or`, `in`,
        `import`, `assert`, `break`,
        `yield`, `as`, `try`, `except`,
        `finally`,  `continue`,
    ]),
    basicOperators: new Set([
        `+`, `-`, `*`, `/`, `=`,
        `-=`, `+=`, `**`,
        `:`, `;`, `.`, `,`, `::`
    ]),
    comparisonOperators: new Set([
        `==`, `!=`, `>=`, `<`, `>`,
        `<=`,
    ]),
    brackets: new Set([
        `(`, `)`, `{`,
        `}`, `[`, `]`,
    ]),
    classes: new Set([]),
    strings: {
        singleLine: [`"`, `'`],
    },
    comments: {
        singleLine: `#`,
    }
};