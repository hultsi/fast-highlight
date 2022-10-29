const path = require('path');
const { FastHighlightWebpackPlugin } = require("./src/fast-highlight/FastHighlight.js")

module.exports = {
    mode: "development",
    entry: "./src/test-environment/main.js",
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
                { in: "./src/test-environment" }
            ],
            sources: [
                { in: "./src/test-environment/index.html", out: "./index.html" },
                { in: "./src/test-environment/css", out: "./css/" }
            ],
            codeblockSettings: {
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