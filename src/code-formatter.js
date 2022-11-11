const Enum = require("./Enum.js");
const {
    SPACE,
    LINE_BREAK,
    Tokens,
    LANGUAGES,
} = require("./Tokens.js");

const TOKENS = new Tokens();

const DESCRIPTORS = new Enum().erate([
    "__UNDEF__",
    "NUMBER",
    "VARIABLE",
    "FUNCTION",
    "CLASS",
    "OPERATOR",
    "TYPE",
    "STRING",
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

/**
 * Takes in string and tokenizes it to an array based on 'OPERATORS'.
 * @param {string} cmd 
 * @returns array
 */
const tokenize = function tokenize(cmd) {
    const MAX_TOKEN_LENGTH = (() => {
        let maxLen = 1;
        for (const token of TOKENS.tokens) {
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
            if (TOKENS.tokens.has(token)) {
                // Can't use "token" variable for comment parsing
                if (TOKENS.strings.has(cmd.substring(i, i + len))) {
                    const isSingleLine = TOKENS.stringHolder.singleLine.some(el => el === token);
                    while (true) {
                        tokenArr[pos].value += cmd[i];
                        ++i;
                        if (cmd[i] === token) {
                            tokenArr[pos].value += cmd[i];
                            break;
                        } else if (cmd[i] === LINE_BREAK && isSingleLine) {
                            break;
                        }
                    }
                } else if (cmd.substring(i, i + len) === TOKENS.commentHolder.singleLine ||
                    cmd.substring(i, i + len) === TOKENS.commentHolder.multiLineStart) {
                    const isSingleLine = TOKENS.commentHolder.singleLine === token;
                    const multiLineEndLen = TOKENS.commentHolder.multiLineEnd.length;
                    while (true) {
                        tokenArr[pos].value += cmd[i];
                        ++i;
                        if (cmd[i] === LINE_BREAK && isSingleLine) {
                            --i;
                            break;
                        } else if (cmd.substring(i, i + multiLineEndLen) === TOKENS.commentHolder.multiLineEnd && !isSingleLine) {
                            tokenArr[pos].value += cmd.substring(i, i + multiLineEndLen);
                            ++i;
                            break;
                        }
                    }
                } else {
                    if (!prevWasToken && (TOKENS.types.has(token) || TOKENS.keywords.has(token))) {
                        // types and keywords require a space after a _non_ token
                        continue;
                    }
                    if (token === SPACE) {
                        tokenArr[pos].prefix += SPACE;
                        prevWasToken = true;
                        --pos;
                        break;
                    }
                    if (token === TOKENS.scopeStart) {
                        ++scope;
                    } else if (token === TOKENS.scopeEnd) {
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
    // Todo: this should be cleaned up somehow
    const len = tokenValues.length;
    let prevWasVariable = false;
    for (let i = 0; i < len; ++i) {
        const token = tokenValues[i].value;
        if (TOKENS.types.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["TYPE"]);
            if (i > 0 && tokenValues[i - 1].value === "=") {
                if (tokenValues[i - 2].descriptor.has(DESCRIPTORS["VARIABLE"])) {
                    tokenValues[i - 2].descriptor.add(DESCRIPTORS["FUNCTION"]);
                }
            }
        } else if (TOKENS.keywords.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["KEYWORD"]);
        } else if (TOKENS.basicOperators.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["OPERATOR"]);
            if (lang === LANGUAGES["cpp"] || lang === LANGUAGES["hpp"] ||
                lang === LANGUAGES["c"] || lang === LANGUAGES["h"]) {
                if (token === `::`) {
                    // C/C++ specific condition
                    tokenValues[i - 1].descriptor.add(DESCRIPTORS["CLASS"]);
                }
            }
        } else if (TOKENS.comparisonOperators.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["OPERATOR"]);
            if (lang === LANGUAGES["cpp"] || lang === LANGUAGES["hpp"] ||
                lang === LANGUAGES["c"] || lang === LANGUAGES["h"]) {
                if (token !== `>` && i <= 2) continue;
                // C/C++ specific condition for #includes
                if ((tokenValues[i - 1].descriptor.has(DESCRIPTORS["VARIABLE"]) ||
                    tokenValues[i - 1].descriptor.has(DESCRIPTORS["CLASS"])) &&
                    tokenValues[i - 2].value === `<` &&
                    tokenValues[i - 3].value === `#include`) {
                    // And finally...
                    tokenValues[i].descriptor.add(DESCRIPTORS["STRING"]);
                    tokenValues[i - 1].descriptor.add(DESCRIPTORS["STRING"]);
                    tokenValues[i - 2].descriptor.add(DESCRIPTORS["STRING"]);
                }
            }
        } else if (TOKENS.brackets.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["BRACKET"]);
            if (prevWasVariable && token === "(") {
                tokenValues[i - 1].descriptor.add(DESCRIPTORS["FUNCTION"]);
            }
        } else if (TOKENS.classes.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["CLASS"]);
        } else if (TOKENS.others.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["__UNDEF__"]);
        } else {
            // String?
            const isString = TOKENS.strings.has(token[0]);
            if (isString) {
                tokenValues[i].descriptor.add(DESCRIPTORS["STRING"]);
                continue;
            }

            // Comment?
            const isComment = (() => {
                for (const commentToken of TOKENS.comments) {
                    const len = commentToken.length;
                    if (len > 0 && token.substring(0, len) === commentToken) {
                        return true;
                    }
                }
                return false;
            })();
            if (isComment) {
                tokenValues[i].descriptor.add(DESCRIPTORS["COMMENT"]);
                continue;
            }

            // Variable or number?
            const num = Number(token[0]);
            if (Number.isNaN(num)) {
                if (i > 0 && (tokenValues[i - 1].value === "class" || tokenValues[i - 1].value === "namespace")) {
                    tokenValues[i].descriptor.add(DESCRIPTORS["CLASS"]);
                    continue;
                }
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
    let formattedContent = `<pre class="fhl-global"><code>\n`; // Open pre-code
    // Add styled span around tokens
    for (let i = 0; i < tokens.length; ++i) {
        formattedContent += `${tokens[i].prefix}`;

        formattedContent += createSpanOpenTag(tokens[i].descriptor);

        formattedContent += `${tokens[i].value}`;
        formattedContent += `</span>`;
    }
    formattedContent += `\n</code>\n</pre>`; // close pre-code

    const emptyClassesRemoved = formattedContent.replaceAll(/\s{0,1}?class=""/g, ``);
    const onlySpacesSpansRemoved = emptyClassesRemoved.replaceAll(/(<span>)(\s{0,}?)(<\/span>)/g, `$2`);
    return onlySpacesSpansRemoved.replaceAll(/class="\s/g, `class="`);
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
                content += `${SPACE}fhl-type`;
                break;
            case DESCRIPTORS["FUNCTION"]:
                content += `${SPACE}fhl-function`;
                break;
            case DESCRIPTORS["KEYWORD"]:
                content += `${SPACE}fhl-keyword`;
                break;
            case DESCRIPTORS["OPERATOR"]:
                content += `${SPACE}fhl-operator`;
                break;
            case DESCRIPTORS["RETURN"]:
                content += `${SPACE}fhl-return`;
                break;
            case DESCRIPTORS["VARIABLE"]:
                content += `${SPACE}fhl-variable`;
                break;
            case DESCRIPTORS["STRING"]:
                content += `${SPACE}fhl-string`;
                break;
            case DESCRIPTORS["CLASS"]:
                content += `${SPACE}fhl-class`;
                break;
            case DESCRIPTORS["NUMBER"]:
                content += `${SPACE}fhl-number`;
                break;
            case DESCRIPTORS["COMMENT"]:
                content += `${SPACE}fhl-comment`;
                break;
            default:
                break;
        }
    }
    return `${content}">`; // Close span
}

const formatContentToCodeblock = function formatContentToCodeblock(content, tokenSets, lang) {
    TOKENS.resetTokens(tokenSets, lang);

    const tokens = (() => {
        const tokenValues = tokenize(content);
        return addDescriptors(tokenValues, lang);
    })();

    return `${formatContent(tokens)}`;
}

module.exports = {
    formatContentToCodeblock,
}