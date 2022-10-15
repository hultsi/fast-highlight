const Enum = require("./Enum.js");

/**
 * All of these will be tokenized on
 * top of variables (e.g., letter combinations without spaces)
 */
const TOKENS = new Set([
    '+', '-', '*', '/', '=',
    '<', '>', '(', ')', '{',
    '}', "[", "]", ":", ";", ".",
    "++", "--", "-=", "+=", "==",
    ">=", "<=", "::", "//", "/*",
    "*/", "===", "!==",
    " ", "\t", "\n",
]);
const SPACE = " ";
const TAB = "\t";
const LINE_BREAK = "\n";
const SCOPE_START = "{";
const SCOPE_END = "}";

const DESCRIPTORS = new Enum().erate([
    "__UNDEF__",
    "NUMBER",
    "VARIABLE",
    "NUMBER",
    "FUNCTION",
    "OPERATOR",
    "TYPE",
    "COMMA",
    "BRACKET",
    "CURLY_BRACKET",
    "SQUARE_BRACKET",
    "KEYWORD",
    "RETURN",
    "LINE_BREAK",
    "SEMICOLON",
    "NULL",
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
        tokenArr[i] = { value: "", prefix: "", descriptor: "", scope: 0 };
    }
    let prevWasOperator = true;
    let pos = 0;
    let scope = 0;
    for (let i = 0; i < cmd.length; ++i) {
        if (TOKENS.has(cmd.substring(i, i + 3))) {
            tokenArr[pos].value = cmd.substring(i, i + 3);
            tokenArr[pos].scope = scope;
            prevWasOperator = true;
            i += 2;
        } else if (TOKENS.has(cmd.substring(i, i + 2))) {
            tokenArr[pos].value = cmd.substring(i, i + 2);
            tokenArr[pos].scope = scope;
            prevWasOperator = true;
            i += 1;
        } else if (TOKENS.has(cmd[i])) {
            if (cmd[i] === SCOPE_START) {
                ++scope;
            } else if (cmd[i] === SCOPE_END) {
                --scope;
            }
            if (cmd[i] === SPACE || cmd[i] === TAB) {
                tokenArr[pos].prefix += cmd[i];
                prevWasOperator = true;
                continue;
            }
            tokenArr[pos].scope = scope;
            tokenArr[pos].value = cmd[i];
            prevWasOperator = true;
        } else if (isValidChar(cmd[i])) {
            if (prevWasOperator) {
                tokenArr[pos].value = cmd[i];
            } else {
                --pos;
                tokenArr[pos].value += cmd[i];
            }
            tokenArr[pos].scope = scope;
            prevWasOperator = false;
        } else {
            if (cmd[i] !== " " && !prevWasOperator) {
                tokenArr[pos].value = cmd[i];
            } else {
                --pos;
            }
            tokenArr[pos].scope = scope;
            prevWasOperator = true;
        }
        ++pos;
    }
    // Todo: not the most efficient way to do this
    return tokenArr.filter(el => el.value !== '' && el.value !== ' ');
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
    const len = tokenValues.length;
    let prevWasVariable = false;
    for (let i = 0; i < len; ++i) {
        switch (tokenValues[i].value) {
            case "const":
            case "let":
                tokenValues[i].descriptor = DESCRIPTORS["TYPE"];
                break;
            case "null":
                tokenValues[i].descriptor = DESCRIPTORS["NULL"];
                break;
            case "function":
                // Need to do a bit more complex stuff here
                // to color code functions properly
                tokenValues[i].descriptor = DESCRIPTORS["TYPE"];
                if (tokenValues[i - 1].value === "=") {
                    if (tokenValues[i - 2].descriptor === DESCRIPTORS["VARIABLE"]) {
                        tokenValues[i - 2].descriptor = DESCRIPTORS["FUNCTION"];
                    }
                }
                break;
            case "=":
            case "+":
            case "-":
            case "*":
            case "/":
            case "**":
            case "++":
            case "--":
            case "+=":
            case "-=":
            case "==":
            case "!=":
            case "<":
            case ">":
            case ">=":
            case "<=":
            case "===":
            case "!==":
                tokenValues[i].descriptor = DESCRIPTORS["OPERATOR"];
                break;
            case ",":
                tokenValues[i].descriptor = DESCRIPTORS["COMMA"];
                break;
            case ";":
                tokenValues[i].descriptor = DESCRIPTORS["SEMICOLON"];
                break;
            case "\n":
                tokenValues[i].descriptor = DESCRIPTORS["LINE_BREAK"];
                break;
            case "(":
                if (prevWasVariable) {
                    tokenValues[i - 1].descriptor = DESCRIPTORS["FUNCTION"];
                }
            /* FALLTHROUGH */
            case ")":
                tokenValues[i].descriptor = DESCRIPTORS["BRACKET"];
                break;
            case "{":
            case "}":
                tokenValues[i].descriptor = DESCRIPTORS["CURLY_BRACKET"];
                break;
            case "[":
            case "]":
                tokenValues[i].descriptor = DESCRIPTORS["SQUARE_BRACKET"];
                break;
            case "if":
            case "do":
            case "for":
            case "while":
                tokenValues[i].descriptor = DESCRIPTORS["KEYWORD"];
                break;
            case "return":
                tokenValues[i].descriptor = DESCRIPTORS["RETURN"];
                break;
            default:
                /* Here we could have a variable _or_ number */
                const num = Number(tokenValues[i].value[0]);
                if (Number.isNaN(num)) {
                    tokenValues[i].descriptor = DESCRIPTORS["VARIABLE"];
                    prevWasVariable = true;
                    continue;
                } else {
                    tokenValues[i].descriptor = DESCRIPTORS["NUMBER"];
                }
                break;
        }
        prevWasVariable = false;
    }
    return tokenValues;
}

const formatContent = function formatContent(tokens, lang) {
    let formattedContent = "";
    for (let i = 0; i < tokens.length; ++i) {
        formattedContent += `${tokens[i].prefix}`;
        switch (tokens[i].descriptor) {
            case DESCRIPTORS["LINE_BREAK"]:
                formattedContent += `${tokens[i].value}`;
                continue;
            case DESCRIPTORS["TYPE"]:
            case DESCRIPTORS["NULL"]:
                formattedContent += `<span class="wcb-global wcb-js-type">`;
                break;
            case DESCRIPTORS["FUNCTION"]:
                formattedContent += `<span class="wcb-global wcb-js-function">`;
                break;
            case DESCRIPTORS["KEYWORD"]:
                formattedContent += `<span class="wcb-global wcb-js-keyword">`;
                break;
            case DESCRIPTORS["RETURN"]:
                formattedContent += `<span class="wcb-global wcb-js-keyword">`;
                break;
            case DESCRIPTORS["VARIABLE"]:
                formattedContent += `<span class="wcb-global wcb-js-variable">`;
                break;
            case DESCRIPTORS["NUMBER"]:
                formattedContent += `<span class="wcb-global wcb-js-number">`;
                break;
            default:
                formattedContent += `<span>`;
                break;
        }
        formattedContent += `${tokens[i].value}`;
        formattedContent += `</span>`;
    }
    return formattedContent;
}

const formatContentToCodeblock = function formatContentToCodeblock(content, lang) {
    const tokens = (() => {
        const tokenValues = tokenize(content);
        return addDescriptors(tokenValues, lang);
    })();
    return `<pre class="wcb-global"><code>\n${formatContent(tokens, lang)}\n</code>\n</pre>`;
}

module.exports = {
    LANGUAGES,
    formatContentToCodeblock,
}