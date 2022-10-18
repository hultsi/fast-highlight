const Enum = require("./Enum.js");

const LANGUAGES = new Enum().erate([
    "JAVASCRIPT",
    "C++",
    "PYTHON",
]);

const SPACE = " ";
const TAB = "\t";
const LINE_BREAK = "\n";

const DEFAULT_TOKENSETS = (() => {
    const defaults = new Array(Object.keys(LANGUAGES).length);
    defaults[LANGUAGES["JAVASCRIPT"]] = {
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
            `Date`, `Math`,
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
    defaults[LANGUAGES["C++"]] = {
        types: new Set([
            `let`, `const`, `var`, `function`,
            `static`, `null`,
        ]),
        keywords: new Set([
            `for`, `while`, `return`, `do`,
            `if`, `else`, `new`, `delete`,
            `#ifdef`, `#endif`, `#include`, `#pragma`,
        ]),
        basicOperators: new Set([
            `+`, `-`, `*`, `/`, `=`,
            `++`, `--`, `-=`, `+=`,
            `&`, `|`, `&&`, `||`,
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
        classes: new Set([
            `std`, `string`, `iostream`,
            `vector`, `array`
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
    defaults[LANGUAGES["PYTHON"]] = {
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
    return defaults;
})();

class TokenFactory {
    constructor() {
        this.stringHolder = {};
        this.commentHolder = {};

        this.scopeStart = "{";
        this.scopeEnd = "}";

        this.types = new Set([]);
        this.keywords = new Set([]);
        this.basicOperators = new Set([]);
        this.comparisonOperators = new Set([]);
        this.brackets = new Set([]);
        this.classes = new Set([]);
        this.strings = new Set([]);
        this.comments = new Set([]);
        this.others = new Set([
            SPACE, TAB, LINE_BREAK,
        ]);
        this.tokens = new Set([
            ...this.types,
            ...this.keywords,
            ...this.basicOperators,
            ...this.comparisonOperators,
            ...this.brackets,
            ...this.strings,
            ...this.comments,
            ...this.others,
            ...this.classes,
        ]);
    }

    // todo: I'm not happy with this set of sets... fix this
    setTypes(types, lang) {
        this.types.clear();
        if (types) {
            for (const token of types) {
                this.types.add(token);
            }
        } else {
            for (const token of DEFAULT_TOKENSETS[lang].types) {
                this.types.add(token);
            }
        }
    }

    setKeywords(keywords, lang) {
        this.keywords.clear();
        if (keywords) {
            for (const token of keywords) {
                this.keywords.add(token);
            }
        } else {
            for (const token of DEFAULT_TOKENSETS[lang].keywords) {
                this.keywords.add(token);
            }
        }
    }

    setBasicOperators(basicOperators, lang) {
        this.basicOperators.clear();
        if (basicOperators) {
            for (const token of basicOperators) {
                this.basicOperators.add(token);
            }
        } else {
            for (const token of DEFAULT_TOKENSETS[lang].basicOperators) {
                this.basicOperators.add(token);
            }
        }
    }

    setComparisonOperators(comparisonOperators, lang) {
        this.comparisonOperators.clear();
        if (comparisonOperators) {
            for (const token of comparisonOperators) {
                this.comparisonOperators.add(token);
            }
        } else {
            for (const token of DEFAULT_TOKENSETS[lang].comparisonOperators) {
                this.comparisonOperators.add(token);
            }
        }
    }

    setBrackets(brackets, lang) {
        this.brackets.clear();
        if (brackets) {
            for (const token of brackets) {
                this.brackets.add(token);
            }
        } else {
            for (const token of DEFAULT_TOKENSETS[lang].brackets) {
                this.brackets.add(token);
            }
        }
    }

    setClasses(classes, lang) {
        this.classes.clear();
        if (classes) {
            for (const token of classes) {
                this.classes.add(token);
            }
        } else {
            for (const token of DEFAULT_TOKENSETS[lang].classes) {
                this.classes.add(token);
            }
        }
    }

    setStrings(strings, lang) {
        this.strings.clear();
        this.stringHolder.singleLine = [];
        this.stringHolder.multiLine = [];
        if (strings) {
            for (const key of Object.keys(strings)) {
                for (let i = 0; i < strings[key].length; ++i) {
                    this.stringHolder[key] = [...this.stringHolder[key], strings[key][i] || ``];
                }
            }
        } else {
            for (const key of Object.keys(DEFAULT_TOKENSETS[lang].strings)) {
                for (let i = 0; i < DEFAULT_TOKENSETS[lang].strings[key].length; ++i) {
                    this.stringHolder[key] = [...this.stringHolder[key], DEFAULT_TOKENSETS[lang].strings[key][i] || ``];
                }
            }
        }
        for (const s of Object.values(this.stringHolder)) {
            for (let i = 0; i < s.length; ++i) {
                this.strings.add(s[i]);
            }
        }
    }

    setComments(comments, lang) {
        this.comments.clear();
        if (comments) {
            for (const key of Object.keys(this.comments)) {
                this.commentHolder[key] = comments[key] || ``;
            }
        } else {
            for (const key of Object.keys(DEFAULT_TOKENSETS[lang].comments)) {
                this.commentHolder[key] = DEFAULT_TOKENSETS[lang].comments[key] || ``;
            }
        }
        this.comments.add(this.commentHolder.singleLine);
        this.comments.add(this.commentHolder.multiLineStart);
        this.comments.add(this.commentHolder.multiLineEnd);
    }

    setTokens() {
        this.tokens = new Set([
            ...this.types,
            ...this.keywords,
            ...this.basicOperators,
            ...this.comparisonOperators,
            ...this.brackets,
            ...this.classes,
            ...this.strings,
            ...this.comments,
            ...this.others,
        ]);
    }
}

module.exports = {
    LANGUAGES,
    SPACE,
    TAB,
    LINE_BREAK,
    TokenFactory
};