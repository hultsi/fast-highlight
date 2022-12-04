const {
    TOKENS,
} = require("../Tokens.js");
const DESCRIPTORS = require("./descriptors.js");

const addCppDescriptors = function addCppDescriptors(tokenValues) {
    /**
     * TODO: userDefinedClasses probably should be map instead since
     * for completeness the scope of the class/struct/namespace
     * should be known as well. For now this is fine.
     */
    const userDefinedClasses = new Set();
    const len = tokenValues.length;
    let prevWasVariable = false;
    for (let i = 0; i < len; ++i) {
        const token = tokenValues[i].value;
        if (TOKENS.types.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["TYPE"]);
        } else if (TOKENS.keywords.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["KEYWORD"]);
        } else if (TOKENS.basicOperators.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["OPERATOR"]);

            if (token === `::`) {
                // C/C++ specific condition
                tokenValues[i - 1].descriptor.add(DESCRIPTORS["CLASS"]);
            }
        } else if (TOKENS.comparisonOperators.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["OPERATOR"]);
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
        } else if (TOKENS.brackets.has(token)) {
            tokenValues[i].descriptor.add(DESCRIPTORS["BRACKET"]);
            if (prevWasVariable && token === "(") {
                tokenValues[i - 1].descriptor.add(DESCRIPTORS["FUNCTION"]);
            }
        } else if (TOKENS.classes.has(token) || userDefinedClasses.has(token)) {
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
                if (i > 0 && (tokenValues[i - 1].value === "class" || tokenValues[i - 1].value === "namespace" || tokenValues[i - 1].value === "struct")) {
                    tokenValues[i].descriptor.add(DESCRIPTORS["CLASS"]);
                    userDefinedClasses.add(tokenValues[i].value);
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

module.exports = addCppDescriptors;