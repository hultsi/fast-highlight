module.exports = {
    types: new Set([
        `def`, `True`, `False`,
    ]),
    keywords: new Set([
        `for`, `while`, `return`, `do`,
        `if`, `else`, `elif`,
        `and`, `not`, `or`, `in`,
        `import`
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