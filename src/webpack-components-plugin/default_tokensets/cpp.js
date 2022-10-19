module.exports = {
    types: new Set([
        `char`, `int`, `float`, `double`, `long`,
        `nullptr`, `static`, `constexpr`, `volatile`,
        `mutable`,
    ]),
    keywords: new Set([
        `for`, `while`, `return`, `do`,
        `if`, `else`, `new`, `delete`, `extern`,
        `#ifdef`, `#endif`, `#include`, `#pragma`,
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
        `std`,
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