const path = require('path');
const { FastHighlightWebpackPlugin } = require("./src/FastHighlight.js")

module.exports = {
    mode: "development",
    entry: "./tests/main.js",
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "main.js",
        uniqueName: "fast-highlight-plugin",
    },

    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },

    plugins: [
        new FastHighlightWebpackPlugin({
            predefinedCss: true,
            components: [
                { in: "./tests" }
            ],
            sources: [
                { in: "./tests/index.html", out: "./index.html" },
                { in: "./tests/css", out: "./css/" }
            ],
            fhlSettings: {
                css: { out: "./css/code-formatter.css" },
                formatting: {
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