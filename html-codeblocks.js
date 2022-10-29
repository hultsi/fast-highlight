const { HtmlCodeBlocks } = require("./src/html-codeblocks/HtmlCodeBlocks.js")

new HtmlCodeBlocks({
    predefinedCss: true,
    output: __dirname + "/build",
    components: [
        { in: "./src/test-environment" }
    ],
    sources: [
        { in: "./src/test-environment/index.html", out: "./index.html" },
        { in: "./src/test-environment/css", out: "./css/" }
    ],
    codeblockSettings: {
        css: { out: "./css/code-formatter.css" },
        formatting: {
            js: {
                types: new Set([
                    `let`, `const`, `var`, `function`,
                    `static`, `null`,
                ]),
                keywords: new Set([
                    `for`, `while`, `return`,
                    `if`, `else`, `of`, `in`, `new`,
                ]),
            },
            cpp: {
                types: new Set([
                    `const`, `float`, `static`, `nullptr`,
                ]),
            },
            asd: {
                types: new Set([
                    `my_type`,
                ]),
                keywords: new Set([
                    `loop`
                ]),
                comments: {
                    singleLine: `$`,
                }
            }
        }
    }
}).run();
