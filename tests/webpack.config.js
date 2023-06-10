const path = require('path');
// const { FastHighlightWebpackPlugin } = require("fast-highlight")
const { FastHighlightWebpackPlugin } = require("../src/FastHighlight.js");

module.exports = {
    mode: "development",
    entry: "./test-src/js/main.js",
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
            includeFileName: true,
            predefinedCss: true,
            components: [
                { in: "./test-src/codeblocks" }
            ],
            sources: [
                { in: "./test-src/html/index.html", out: "./index.html" },
                { in: "./test-src/css", out: "./css/" }
            ],
            fhlSettings: {
                css: { out: "./css/code-formatter.css" },
            }
        })
    ]
};