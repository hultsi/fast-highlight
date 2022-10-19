module.exports = {
    types: new Set([
        `let`, `const`, `var`, `function`,
        `static`, `null`,
    ]),
    keywords: new Set([
        `for`, `while`, `return`,
        `if`, `else`, `of`, `in`, `new`,
    ]),
    basicOperators: new Set([
        `+`, `-`, `*`, `/`, `=`,
        `++`, `--`, `-=`, `+=`, `**`,
        `&`, `|`, `&&`, `||`,
        `:`, `;`, `.`, `,`,
        `<<`, `>>`,
    ]),
    comparisonOperators: new Set([
        `==`, `!=`, `>=`, `<`, `>`,
        `<=`, `===`, `!==`,
    ]),
    brackets: new Set([
        `(`, `)`, `{`,
        `}`, `[`, `]`,
    ]),
    classes: new Set([
        `Date`, `Math`, `Set`, `Object`,
        `Array`, `Number`,
    ]),
    strings: {
        singleLine: [`"`, `'`],
        multiLine: [`\``],
    },
    comments: {
        singleLine: `//`,
        multiLineStart: `/*`,
        multiLineEnd: `*/`,
    }
};