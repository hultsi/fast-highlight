const SIMPLE_OPERATORS = new Set([
    '+',
    '-',
    '*',
    '/',
    '=',
    '<',
    '>',
    '(',
    ')',
    '{',
    '}',
    ":",
    ";",
    ".",
    "++",
    "--",
    "-=",
    "+=",
    "==",
    ">=",
    "<=",
    "::",
    "//",
    "/*",
    "*/",
    "===",
    "!==",
]);

// Todo: set or map maybe?
// const FORMATTING_RULES = {};

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
    cmd = cmd.replaceAll(/\r/g, '') + "   ";
    let len = 0;
    const tokenArr = new Array(len).fill("");
    let prevWasOperator = true;
    let pos = 0;
    for (let i = 0; i < cmd.length; ++i) {
        if (SIMPLE_OPERATORS.has(cmd.substring(i, i + 3))) {
            tokenArr[pos] = cmd.substring(i, i + 3);
            prevWasOperator = true;
            i += 2;
        } else if (SIMPLE_OPERATORS.has(cmd.substring(i, i + 2))) {
            tokenArr[pos] = cmd.substring(i, i + 2);
            prevWasOperator = true;
            i += 1;
        } else if (SIMPLE_OPERATORS.has(cmd.substring(i, i + 1))) {
            tokenArr[pos] = cmd[i];
            prevWasOperator = true;
        } else if (isValidChar(cmd[i])) {
            if (prevWasOperator) {
                tokenArr[pos] = cmd[i];
            } else {
                --pos;
                tokenArr[pos] += cmd[i];
            }
            prevWasOperator = false;
        } else {
            if (cmd[i] !== " " && !prevWasOperator) {
                tokenArr[pos] = cmd[i];
            } else {
                --pos;
            }
            prevWasOperator = true;
        }
        ++pos;
    }
    return tokenArr;
}

const formatContentToCodeblock = function formatContentToCodeblock(content) {
    const tokens = tokenize(content);
    console.log(tokens);
}

module.exports = {
    formatContentToCodeblock,
}