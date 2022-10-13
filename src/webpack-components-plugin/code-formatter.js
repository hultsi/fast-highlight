/**
 * All of these will be tokenized on
 * top of variables (e.g., letter combinations without spaces)
 */
const SIMPLE_OPERATORS = new Set([
    '+', '-', '*', '/', '=',
    '<', '>', '(', ')', '{',
    '}', ":", ";", ".",
    "\n", "\t", " ",// Todo: <--- move these to their own Set? (Also, spaces?)
    "++", "--", "-=", "+=", "==",
    ">=", "<=", "::", "//", "/*",
    "*/", "===", "!==",
]);

const FORMATTING_RULES = {
    "JavaScript": {
        "function": "<span>function</span>",
        "const": "<span class='wcb-js-const'>const</span>",
        "let": "<span>let</span>",
        "while": "<span>while</span>",
        "for": "<span>for</span>",
        "===": "<span>===</span>",
        "!==": "<span>!==</span>",
        "==": "<span>==</span>",
        "!=": "<span>!=</span>",
        "=": "<span>=</span>",
        "+": "<span>+</span>",
        "-": "<span>-</span>",
        "*": "<span>*</span>",
        "/": "<span>/</span>",
    }
};

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
    const tokenArr = new Array(cmd.length).fill("");
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
    // Todo: not the most efficient way to do this
    return tokenArr.filter(el => el !== '');
}

const formatContentToCodeblock = function formatContentToCodeblock(content) {
    const tokens = tokenize(content);
    // Todo: Include other than js only
    for (let i = 0; i < tokens.length; ++i) {
        tokens[i] = FORMATTING_RULES["JavaScript"][tokens[i]] ?? tokens[i];
    }
    return `
        <pre>
            <code>\n${tokens.join("")}\n</code>
        </pre>
    `;
}

module.exports = {
    formatContentToCodeblock,
}