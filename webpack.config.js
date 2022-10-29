const path = require('path');
const { HtmlCodeBlocksWebpackPlugin } = require("./src/html-codeblocks/HtmlCodeBlocks.js")

module.exports = {
    mode: "development",
    entry: "./src/test-environment/main.js",
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "main.js",
        uniqueName: "webpack-components-plugin",
    },

    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },

    plugins: [
        new HtmlCodeBlocksWebpackPlugin({
            predefinedCss: true,
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
        })
    ]
};