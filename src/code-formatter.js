const {
    SPACE,
    LINE_BREAK,
    TOKENS,
    LANGUAGES,
} = require("./Tokens.js");
const DESCRIPTORS = require("./descriptor-handlers/descriptors.js");
const descriptorParsers = require("./descriptor-handlers/descriptor-handlers.js");

const isChar = function isChar(c) {
    if (c.length > 1)
        return false;
    return (c[0].charCodeAt(0) >= 65 && c[0].charCodeAt(0) <= 90) ||
        (c[0].charCodeAt(0) >= 97 && c[0].charCodeAt(0) <= 122);
}

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
                if (TOKENS.strings.has(cmd.substring(i, i + len))) {
                    // Parse string
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
                    // Parse comment
                    const isSingleLine = TOKENS.commentHolder.singleLine === token;
                    const multiLineEndLen = TOKENS.commentHolder.multiLineEnd.length;
                    while (true) {
                        tokenArr[pos].value += cmd[i];
                        ++i;
                        if (cmd[i] === LINE_BREAK && isSingleLine) {
                            --i; // Todo: this might need to take into account the comment token length
                            break;
                        } else if (cmd.substring(i, i + multiLineEndLen) === TOKENS.commentHolder.multiLineEnd && !isSingleLine) {
                            tokenArr[pos].value += cmd.substring(i, i + multiLineEndLen);
                            i += multiLineEndLen - 1;
                            break;
                        }
                    }
                } else {
                    if (!prevWasToken && (TOKENS.types.has(token) || TOKENS.keywords.has(token))) {
                        // types and keywords require a space after a _non_ token
                        continue;
                    }

                    if (isChar(cmd[i]) && isChar(cmd[i + 1])) {
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
    // First add descriptors
    const tokens = (() => {
        switch (lang) {
            case LANGUAGES["cpp"]:
            case LANGUAGES["hpp"]:
            case LANGUAGES["c"]:
            case LANGUAGES["h"]:
                return descriptorParsers.addCppDescriptors(tokenValues);
            case LANGUAGES["cmake"]:
                return descriptorParsers.addCmakeDescriptors(tokenValues);
            default:
                return descriptorParsers.addDefaultDescriptors(tokenValues, lang);
        }
    })();

    // Then override styling if so defined
    for (let i = 0; i < tokens.length; ++i) {
        const t = tokens[i].value;
        for (const item of TOKENS.styleOverrides.values()) {
            if (item.token === t) {
                tokens[i].descriptor.clear();
                tokens[i].descriptor.add(DESCRIPTORS[item.style.toUpperCase()]);
            }

            if (tokens[i].descriptor.has(DESCRIPTORS[item.descriptor])) {
                tokens[i].descriptor.clear();
                tokens[i].descriptor.add(DESCRIPTORS[item.style.toUpperCase()]);
            }
        }
    }
    return tokens;
}

const formatContent = function formatContent(tokens, lang = ``) {
    let formattedContent = `<pre class="fhl-global fhl-global-${lang}"><code class="fhl-code fhl-code-${lang}">\n`; // Open pre-code
    // Add styled span around tokens
    formattedContent += `<span class="fhl-code-line">`;
    for (let i = 0; i < tokens.length; ++i) {
        if (tokens[i].value === "\n") {
            formattedContent += `</span>`;
        }
        
        formattedContent += `${tokens[i].prefix}`;

        formattedContent += createSpanOpenTag(tokens[i].descriptor);

        formattedContent += `${tokens[i].value}`;
        formattedContent += `</span>`;

        if (tokens[i].value === "\n") {
            formattedContent += `<span class="fhl-code-line">`;
        }
    }
    formattedContent += `</span>`;
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
    TOKENS.resetTokens(tokenSets, LANGUAGES[lang]);

    const tokens = (() => {
        const tokenValues = tokenize(content);
        return addDescriptors(tokenValues, LANGUAGES[lang]);
    })();
    
    return `${formatContent(tokens, lang)}`;
}

module.exports = {
    formatContentToCodeblock,
}