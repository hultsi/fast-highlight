const { HtmlCodeBlocks } = require("../../html-codeblocks/HtmlCodeBlocks.js")

new HtmlCodeBlocks({
    predefinedCss: true,
    optimizeHead: true,
    output: "./build",
    components: [
        { in: "./src/test-env" }
    ],
    sources: [
        { in: "./src/test-env/index.html", out: "./index.html" },
        { in: "./src/test-env/css", out: "./css/" }
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
