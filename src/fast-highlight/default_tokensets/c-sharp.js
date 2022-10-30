module.exports = {
    types: new Set([
        `char`, `int`, `float`, `double`, `long`,
        `static`, `void`, `bool`, `class`, `string`,
        `namespace`,
    ]),
    keywords: new Set([
        `for`, `while`, `return`, `do`, `using`,
        `if`, `else`,
    ]),
    basicOperators: new Set([
        `+`, `-`, `*`, `/`, `=`,
        `++`, `--`, `-=`, `+=`,
        `&`, `|`, `&&`, `||`,
        `:`, `;`, `.`, `,`, `::`,
        `<<`, `>>`,
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
        `System`,
    ]),
    strings: {
        singleLine: [`"`, `'`],
    },
    comments: {
        singleLine: `//`,
        multiLineStart: `/*`,
        multiLineEnd: `*/`,
    }
};