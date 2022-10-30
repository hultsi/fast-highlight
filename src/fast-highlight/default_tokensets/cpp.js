module.exports = {
    types: new Set([
        `const`, `char`, `int`, `float`, `double`, `long`,
        `short`, `nullptr`, `static`, `constexpr`, `volatile`,
        `mutable`, `static_cast`, `reinterpret_cast`, `const_cast`,
        `dynamic_cast`, `typeof`, `sizeof`, `enum`,
        `true`, `false`, `union`, `this`, `class`, `namespace`,

    ]),
    keywords: new Set([
        `for`, `while`, `return`, `do`, `break`,
        `if`, `else`, `new`, `delete`, `extern`,
        `#ifdef`, `#endif`, `#include`, `#pragma`,
        `try`, `catch`, `switch`, `case`, `break`,
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
        `vector`, `array`, `string`,
        `int8_t`, `int16_t`, `int32_t`,
        `uint8_t`, `uint16_t`, `uint32_t`
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