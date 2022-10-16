const Enum = require("./Enum.js");

/**
 * All of these will be tokenized on
 * top of variables (e.g., letter combinations without spaces)
 */
const SPACE = " ";
const TAB = "\t";
const LINE_BREAK = "\n";
const SINGLE_LINE_COMMENT = "//";
const MULTI_LINE_COMMENT_START = "/*";
const MULTI_LINE_COMMENT_END = "*/";
// Todo: thanks to python, this is not this easy
const SCOPE_START = "{";
const SCOPE_END = "}";

// Todo: these might have to be language specific
const BASIC_OPERATORS = new Set([
    "+", "-", "*", "/", "=",
    "++", "--", "-=", "+=", "**",
    "&", "|", "&&", "||",
]);
const COMPARISON_OPERATORS = new Set([
    "==", "!=", ">=", '<', '>',
    "<=", "===", "!==",
]);
const BRACKETS = new Set([
    '(', ')', '{',
    '}', "[", "]",
]);
const COMMENTS = new Set([
    SINGLE_LINE_COMMENT,
    MULTI_LINE_COMMENT_START,
    MULTI_LINE_COMMENT_END,
]);
const OTHERS = new Set([
    ":", ";", ".",
    TAB, LINE_BREAK,
]);
const TOKENS = new Set([
    ...BASIC_OPERATORS,
    ...COMPARISON_OPERATORS,
    ...BRACKETS,
    ...COMMENTS,
    ...OTHERS,
]);
const MAX_TOKEN_LENGTH = (() => {
    let maxLen = 1;
    for (const token of TOKENS) {
        if (token.length > maxLen) {
            maxLen = token.length;
        }
    }
    return maxLen;
})();

const DESCRIPTORS = new Enum().erate([
    "__UNDEF__",
    "NUMBER",
    "VARIABLE",
    "FUNCTION",
    "OPERATOR",
    "TYPE",
    "COMMA",
    "BRACKET",
    "CURLY_BRACKET",
    "SQUARE_BRACKET",
    "SINGLE_LINE_COMMENT",
    "MULTI_LINE_COMMENT",
    "KEYWORD",
    "RETURN",
    "LINE_BREAK",
    "SEMICOLON",
    "NULL",
    "UNDEFINED",
    "COMMENT",
]);
const LANGUAGES = new Enum().erate([
    "JAVASCRIPT",
    "C++",
    "PYTHON",
]);

/**
 * Checks if give character at position 0 of the string is within
 * a...b or A...B or 0...9 and returns true if so, otherwise false.
 * @param {string} c 
 * @returns bool
 */
const isValidChar = function isValidChar(c) {
    return ((c[0].charCodeAt(0) >= 48 && c[0].charCodeAt(0) <= 57) ||
        (c[0].charCodeAt(0) >= 65 && c[0].charCodeAt(0) <= 90) ||
        (c[0].charCodeAt(0) >= 97 && c[0].charCodeAt(0) <= 122) ||
        c[0].charCodeAt(0) === 46)
}

/**
 * Takes in string and tokenizes it to an array based on 'OPERATORS'.
 * @param {string} cmd 
 * @returns array
 */
const tokenize = function tokenize(cmd) {
    // Add three extra spaces to cmd to prevent segmentation fault in the loop (i + 3)
    // Though .substring handles that for us but it's good practice anyway
    cmd = cmd.replaceAll(/\r/g, '') + "   ";
    const tokenArr = new Array(cmd.length);
    for (let i = 0; i < tokenArr.length; ++i) {
        tokenArr[i] = { value: "", prefix: "", descriptor: new Set(), scope: 0 };
    }
    let prevWasOperator = true;
    let pos = 0;
    let scope = 0;
    for (let i = 0; i < cmd.length; ++i) {
        if (cmd[i] === SPACE) {
            tokenArr[pos].prefix += SPACE;
            prevWasOperator = true;
            continue;
        }
        let tokenMatchFound = true;
        for (let len = MAX_TOKEN_LENGTH; len > 0; --len) {
            if (TOKENS.has(cmd.substring(i, i + len))) {
                if (cmd.substring(i, i + len) === SINGLE_LINE_COMMENT) {
                    while (true) {
                        if (cmd[i] === LINE_BREAK) {
                            break;
                        }
                        tokenArr[pos].value += cmd[i];
                        ++i;
                    }
                    --i;
                } else if (cmd.substring(i, i + len) === MULTI_LINE_COMMENT_START) {
                    while (true) {
                        if (cmd.substring(i, i + len) === MULTI_LINE_COMMENT_END) {
                            tokenArr[pos].value += cmd.substring(i, i + len);
                            break;
                        }
                        tokenArr[pos].value += cmd[i];
                        ++i;
                    }
                    ++i;
                } else {
                    if (cmd.substring(i, i + len) === SCOPE_START) {
                        ++scope;
                    } else if (cmd.substring(i, i + len) === SCOPE_END) {
                        --scope;
                    }

                    tokenArr[pos].value = cmd.substring(i, i + len);
                    i += len - 1;
                }

                tokenArr[pos].scope = scope;
                prevWasOperator = true;
                break;
            } else {
                tokenMatchFound = len !== 1;
            }
        }

        if (!tokenMatchFound) {
            if (prevWasOperator) {
                tokenArr[pos].value = cmd[i];
            } else {
                --pos;
                tokenArr[pos].value += cmd[i];
            }
            tokenArr[pos].scope = scope;
            prevWasOperator = false;
        }
        ++pos;
    }
    // Todo: not the most efficient way to do this
    return tokenArr.filter(el => el.value !== '' && el.value !== SPACE);
}

const addDescriptors = function addDescriptors(tokenValues, lang) {
    // Need to know the language here
    switch (lang) {
        case LANGUAGES["JAVASCRIPT"]:
            return formatJavaScript(tokenValues);
        default:
            return tokenValues;
    }
}

const formatJavaScript = function formatJavascript(tokenValues) {
    // Todo: this should be cleaned up somehow
    const len = tokenValues.length;
    let prevWasVariable = false;
    for (let i = 0; i < len; ++i) {
        switch (tokenValues[i].value) {
            case "const":
            case "let":
                tokenValues[i].descriptor.add(DESCRIPTORS["TYPE"]);
                break;
            case "undefined":
                tokenValues[i].descriptor.add(DESCRIPTORS["UNDEFINED"]);
                break;
            case "null":
                tokenValues[i].descriptor.add(DESCRIPTORS["NULL"]);
                break;
            case "function":
                // Need to do a bit more complex stuff here
                // to color code functions properly
                tokenValues[i].descriptor.add(DESCRIPTORS["TYPE"]);
                // TODO: this indexing is temp hack
                //       there doesn't need to be a space between
                //       variable = function
                if (tokenValues[i - 1].value === "=") {
                    if (tokenValues[i - 2].descriptor.has(DESCRIPTORS["VARIABLE"])) {
                        tokenValues[i - 2].descriptor.add(DESCRIPTORS["FUNCTION"]);
                    }
                }
                break;
            case ",":
                tokenValues[i].descriptor.add(DESCRIPTORS["COMMA"]);
                break;
            case ";":
                tokenValues[i].descriptor.add(DESCRIPTORS["SEMICOLON"]);
                break;
            case "\n":
                tokenValues[i].descriptor.add(DESCRIPTORS["LINE_BREAK"]);
                break;
            case "(":
                if (prevWasVariable) {
                    tokenValues[i - 1].descriptor.add(DESCRIPTORS["FUNCTION"]);
                }
            /* FALLTHROUGH */
            case ")":
                tokenValues[i].descriptor.add(DESCRIPTORS["BRACKET"]);
                break;
            case "{":
            case "}":
                tokenValues[i].descriptor.add(DESCRIPTORS["BRACKET"]);
                tokenValues[i].descriptor.add(DESCRIPTORS["CURLY_BRACKET"]);
                break;
            case "[":
            case "]":
                tokenValues[i].descriptor.add(DESCRIPTORS["BRACKET"]);
                tokenValues[i].descriptor.add(DESCRIPTORS["SQUARE_BRACKET"]);
                break;
            case "if":
            case "do":
            case "for":
            case "while":
                tokenValues[i].descriptor.add(DESCRIPTORS["KEYWORD"]);
                break;
            case "return":
                tokenValues[i].descriptor.add(DESCRIPTORS["KEYWORD"]);
                tokenValues[i].descriptor.add(DESCRIPTORS["RETURN"]);
                break;
            default:
                // Check for operators
                if (BASIC_OPERATORS.has(tokenValues[i].value) ||
                    COMPARISON_OPERATORS.has(tokenValues[i].value)
                ) {
                    tokenValues[i].descriptor.add(DESCRIPTORS["OPERATOR"]);
                    break;
                }

                // Check for comment
                if (COMMENTS.has(tokenValues[i].value.substring(0, 2))) {
                    tokenValues[i].descriptor.add(DESCRIPTORS["COMMENT"]);
                    break;
                }

                /* Check for variable _or_ number */
                const num = Number(tokenValues[i].value[0]);
                if (Number.isNaN(num)) {
                    tokenValues[i].descriptor.add(DESCRIPTORS["VARIABLE"]);
                    prevWasVariable = true;
                    continue;
                } else {
                    tokenValues[i].descriptor.add(DESCRIPTORS["NUMBER"]);
                }
                break;
        }
        prevWasVariable = false;
    }
    return tokenValues;
}

const formatContent = function formatContent(tokens) {
    let formattedContent = `<pre class="wcb-global"><code>\n`; // Open pre-code
    // Add styled span around tokens
    for (let i = 0; i < tokens.length; ++i) {
        formattedContent += `${tokens[i].prefix}`;

        formattedContent += createSpanOpenTag(tokens[i].descriptor);

        formattedContent += `${tokens[i].value}`;
        formattedContent += `</span>`;
    }
    formattedContent += `\n</code>\n</pre>`; // close pre-code

    return formattedContent;
}

const createSpanOpenTag = function createSpanOpenTag(descriptors) {
    let content = `<span class="`; // Open up span
    // Add styles
    for (const d of descriptors) {
        switch (d) {
            case DESCRIPTORS["LINE_BREAK"]:
                break;
            case DESCRIPTORS["TYPE"]:
            case DESCRIPTORS["NULL"]:
                content += `${SPACE}wcb-js-type`;
                break;
            case DESCRIPTORS["FUNCTION"]:
                content += `${SPACE}wcb-js-function`;
                break;
            case DESCRIPTORS["KEYWORD"]:
                content += `${SPACE}wcb-js-keyword`;
                break;
            case DESCRIPTORS["RETURN"]:
                content += `${SPACE}wcb-js-return`;
                break;
            case DESCRIPTORS["VARIABLE"]:
                content += `${SPACE}wcb-js-variable`;
                break;
            case DESCRIPTORS["NUMBER"]:
                content += `${SPACE}wcb-js-number`;
                break;
            case DESCRIPTORS["COMMENT"]:
                content += `${SPACE}wcb-js-comment`;
                break;
            default:
                break;
        }
    }
    return `${content}">`; // Close span
}

const formatContentToCodeblock = function formatContentToCodeblock(content, lang) {
    const tokens = (() => {
        const tokenValues = tokenize(content);
        return addDescriptors(tokenValues, lang);
    })();
    return `${formatContent(tokens)}`;
}

module.exports = {
    LANGUAGES,
    formatContentToCodeblock,
}