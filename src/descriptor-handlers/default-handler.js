const {
    TOKENS,
} = require("../Tokens.js");
const DESCRIPTORS = require("./descriptors.js");

const addDefaultDescriptors = function addDefaultDescriptors(tokenValues, lang) {
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
        } else if (TOKENS.comparisonOperators.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["OPERATOR"]);
        } else if (TOKENS.brackets.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["BRACKET"]);
            if (prevWasVariable && token === "(") {
                tokenValues[i - 1].descriptor.clear();
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

module.exports = addDefaultDescriptors