module.exports = {
    types: new Set([
        `let`, `const`, `var`, `function`,
        `static`, `null`, `typepof`, `true`, `false`,
        `this`, `delete`
    ]),
    keywords: new Set([
        `for`, `while`, `return`, `try`, `catch`,
        `if`, `else`, `of`, `in`, `new`,
        `async`, `await`, `with`, `yield`,
        `switch`, `case`, `break`,
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
        `super`, `Date`, `Math`, `Set`,
        `Object`, `Array`, `Number`,
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