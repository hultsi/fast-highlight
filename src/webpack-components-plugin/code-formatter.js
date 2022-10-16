const Enum = require("./Enum.js");
const { SPACE, LINE_BREAK, TokenFactory } = require("./TokenFactory.js");

const TOKEN_FACTORY = new TokenFactory();

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
    "COMMENT",
    "SINGLE_LINE_COMMENT",
    "MULTI_LINE_COMMENT",
    "KEYWORD",
    "RETURN",
    "LINE_BREAK",
    "SEMICOLON",
    "NULL",
    "UNDEFINED",
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
    const MAX_TOKEN_LENGTH = (() => {
        let maxLen = 1;
        for (const token of TOKEN_FACTORY.tokens) {
            if (token.length > maxLen) {
                maxLen = token.length;
            }
        }
        return maxLen;
    })();
    // Add three extra spaces to cmd to prevent segmentation fault in the loop (i + 3)
    // Though .substring handles that for us but it's good practice anyway
    cmd = cmd.replaceAll(/\r/g, '') + "   ";
    const tokenArr = new Array(cmd.length);
    for (let i = 0; i < tokenArr.length; ++i) {
        tokenArr[i] = { value: '', prefix: '', descriptor: new Set(), scope: 0 };
    }
    let prevWasToken = true;
    let pos = 0;
    let scope = 0;
    for (let i = 0; i < cmd.length; ++i) {
        let tokenMatchFound = true;
        for (let len = MAX_TOKEN_LENGTH; len > 0; --len) {
            const token = cmd.substring(i, i + len);
            if (TOKEN_FACTORY.tokens.has(token)) {
                // Can't use "token" variable for comment parsing
                if (cmd.substring(i, i + len) === TOKEN_FACTORY.singleLineComment) {
                    while (true) {
                        if (cmd[i] === LINE_BREAK) {
                            break;
                        }
                        tokenArr[pos].value += cmd[i];
                        ++i;
                    }
                    --i;
                } else if (cmd.substring(i, i + len) === TOKEN_FACTORY.multiLineCommentStart) {
                    while (true) {
                        if (cmd.substring(i, i + len) === TOKEN_FACTORY.multiLineCommentEnd) {
                            tokenArr[pos].value += cmd.substring(i, i + len);
                            break;
                        }
                        tokenArr[pos].value += cmd[i];
                        ++i;
                    }
                    ++i;
                } else {
                    if (!prevWasToken && (TOKEN_FACTORY.types.has(token) || TOKEN_FACTORY.keywords.has(token))) {
                        // types and keywords require a space after a _non_ token
                        continue;
                    }
                    if (token === SPACE) {
                        tokenArr[pos].prefix += SPACE;
                        prevWasToken = true;
                        --pos;
                        break;
                    }
                    if (token === TOKEN_FACTORY.scopeStart) {
                        ++scope;
                    } else if (token === TOKEN_FACTORY.scopeEnd) {
                        --scope;
                    }
                    tokenArr[pos].value = token;
                    i += len - 1;
                }

                tokenArr[pos].scope = scope;
                prevWasToken = true;
                break;
            } else {
                tokenMatchFound = len !== 1;
            }
        }

        if (!tokenMatchFound) {
            if (prevWasToken) {
                tokenArr[pos].value = cmd[i];
            } else {
                --pos;
                tokenArr[pos].value += cmd[i];
            }
            tokenArr[pos].scope = scope;
            prevWasToken = false;
        }
        ++pos;
    }
    // Todo: not the most efficient way to do this
    return tokenArr.filter(el => el.value !== '' && el.value !== SPACE);
}

const addDescriptors = function addDescriptors(tokenValues, lang) {
    // Need to know the language here
    return formatJavaScript(tokenValues);
}

const formatJavaScript = function formatJavascript(tokenValues) {
    // Todo: this should be cleaned up somehow
    const len = tokenValues.length;
    let prevWasVariable = false;
    for (let i = 0; i < len; ++i) {
        const token = tokenValues[i].value;
        if (TOKEN_FACTORY.types.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["TYPE"]);
            if (i > 0 && tokenValues[i - 1].value === "=") {
                if (tokenValues[i - 2].descriptor.has(DESCRIPTORS["VARIABLE"])) {
                    tokenValues[i - 2].descriptor.add(DESCRIPTORS["FUNCTION"]);
                }
            }
        } else if (TOKEN_FACTORY.keywords.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["KEYWORD"]);
        } else if (TOKEN_FACTORY.basicOperators.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["OPERATOR"]);
        } else if (TOKEN_FACTORY.comparisonOperators.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["OPERATOR"]);
        } else if (TOKEN_FACTORY.brackets.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["BRACKET"]);
            if (prevWasVariable && token === "(") {
                tokenValues[i - 1].descriptor.add(DESCRIPTORS["FUNCTION"]);
            }
        } else if (TOKEN_FACTORY.others.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["__UNDEF__"]);
        } else {
            const isComment = (() => {
                for (const commentToken of TOKEN_FACTORY.comments) {
                    const len = commentToken.length;
                    if (token.substring(0, len) === commentToken) {
                        return true;
                    }
                }
                return false;
            })();
            if (isComment) {
                tokenValues[i].descriptor.add(DESCRIPTORS["COMMENT"]);
                continue;
            }

            const num = Number(token[0]);
            if (Number.isNaN(num)) {
                tokenValues[i].descriptor.add(DESCRIPTORS["VARIABLE"]);
                prevWasVariable = true;
                continue;
            } else {
                tokenValues[i].descriptor.add(DESCRIPTORS["NUMBER"]);
            }
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

const formatContentToCodeblock = function formatContentToCodeblock(content, tokenSets, lang) {
    TOKEN_FACTORY.setTypes(tokenSets.types);
    TOKEN_FACTORY.setKeywords(tokenSets.keywords);
    TOKEN_FACTORY.setTokens();

    const tokens = (() => {
        const tokenValues = tokenize(content);
        return addDescriptors(tokenValues);
    })();

    return `${formatContent(tokens)}`;
}

module.exports = {
    LANGUAGES,
    formatContentToCodeblock,
}