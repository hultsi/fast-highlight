const path = require('path');
const WebpackComponents = require("./src/webpack-components-plugin/webpack-component-plugin.js")

module.exports = {
    mode: "development",
    entry: "./src/test-env/main.js",
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "main.js",
        uniqueName: "webpack-components-plugin",
    },

    // TODO: Come up with something better later on
    //       For now let's just increase the size limit warnings
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },

    plugins: [
        new WebpackComponents({
            optimizeHead: true,
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
        })
    ]
};