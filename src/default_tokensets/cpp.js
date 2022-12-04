module.exports = {
    types: new Set([
        `const`, `char`, `int`, `float`, `double`, `long`,
        `short`, `nullptr`, `static`, `constexpr`, `volatile`,
        `mutable`, `static_cast`, `reinterpret_cast`, `const_cast`,
        `dynamic_cast`, `typeof`, `sizeof`, `enum`, `void`,
        `true`, `false`, `union`, `this`, `class`, `namespace`,
        `bool`, `unsigned`, `public`, `private`, `protected`,
        `inline`, `struct`, `template`, `typename`,
    ]),
    keywords: new Set([
        `for`, `while`, `return`, `do`, `using`,
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
        `uint8_t`, `uint16_t`, `uint32_t`,
        `random_device`, `uniform_real_distribution`,
        `mt19937`, `uniform_int_distribution`, `ifstream`,
        `ofstream`,
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