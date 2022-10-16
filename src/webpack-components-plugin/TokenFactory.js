const SPACE = " ";
const TAB = "\t";
const LINE_BREAK = "\n";

class TokenFactory {
    constructor() {
        this.singleLineComment = "//";
        this.multiLineCommentStart = "/*";
        this.multiLineCommentEnd = "*/";
        this.scopeStart = "{";
        this.scopeEnd = "}";

        this.types = new Set([
            `let`, `const`, `var`, `function`,
            `static`, `null`,
        ]);
        this.keywords = new Set([
            `for`, `while`, `return`,
            `if`, `else`, `of`, `in`, `new`,
        ]);
        this.basicOperators = new Set([
            `+`, `-`, `*`, `/`, `=`,
            `++`, `--`, `-=`, `+=`, `**`,
            `&`, `|`, `&&`, `||`,
            `:`, `;`, `.`, `,`, `::`,
        ]);
        this.comparisonOperators = new Set([
            `==`, `!=`, `>=`, `<`, `>`,
            `<=`, `===`, `!==`,
        ]);
        this.brackets = new Set([
            `(`, `)`, `{`,
            `}`, `[`, `]`,
        ]);
        this.comments = new Set([
            this.singleLineComment,
            this.multiLineCommentStart,
            this.multiLineCommentEnd,
        ]);
        this.others = new Set([
            SPACE, TAB, LINE_BREAK,
        ]);
        this.classes = new Set([]);
        this.tokens = new Set([
            ...this.types,
            ...this.keywords,
            ...this.basicOperators,
            ...this.comparisonOperators,
            ...this.brackets,
            ...this.comments,
            ...this.others,
            ...this.classes,
        ]);
    }

    setTypes(tokens) {
        this.types.clear();
        for (const token of tokens) {
            this.types.add(token);
        }
    }

    setKeywords(tokens) {
        this.keywords.clear();
        for (const token of tokens) {
            this.keywords.add(token);
        }
    }

    setTokens() {
        this.tokens = new Set([
            ...this.types,
            ...this.keywords,
            ...this.basicOperators,
            ...this.comparisonOperators,
            ...this.brackets,
            ...this.comments,
            ...this.others,
            ...this.classes,
        ]);
    }
}

module.exports = {
    SPACE,
    TAB,
    LINE_BREAK,
    TokenFactory
};