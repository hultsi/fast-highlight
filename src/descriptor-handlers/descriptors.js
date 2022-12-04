const Enum = require("../Enum.js");
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

module.exports = DESCRIPTORS;