const Enum = require("./Enum.js");
const jsTokens = require("./default_tokensets/javascript.js");
const cppTokens = require("./default_tokensets/cpp.js");
const pythonTokens = require("./default_tokensets/python.js");

const LANGUAGES = new Enum().erate([
    "js",
    "cpp",
    "py",
]);

const SPACE = " ";
const TAB = "\t";
const LINE_BREAK = "\n";

const DEFAULT_TOKENSETS = (() => {
    const defaults = new Array(Object.keys(LANGUAGES).length);
    defaults[LANGUAGES["js"]] = jsTokens;
    defaults[LANGUAGES["cpp"]] = cppTokens;
    defaults[LANGUAGES["py"]] = pythonTokens;
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

    /**
     * Call reset tokens and not this
     */
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

    /**
     * Call reset tokens and not this
     */
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

    resetTokens(tokenSets, lang) {
        if (lang === undefined) {
            lang = LANGUAGES["JAVASCRIPT"];
        }
        for (const set of Object.keys(DEFAULT_TOKENSETS[lang])) {
            this[set].clear();
            if (set == "strings") {
                this.setStrings(tokenSets[set], lang);
                continue;
            } else if (set == "comments") {
                this.setComments(tokenSets[set], lang);
                continue;
            }
            if (tokenSets[set]) {
                for (const token of tokenSets[set]) {
                    this[set].add(token);
                }
            } else {
                for (const token of DEFAULT_TOKENSETS[lang][set]) {
                    this[set].add(token);
                }
            }
        }

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