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
            // todo: Create exclude watch list here maybe.
            components: [
                { in: "./src/test-env" }
            ],
            sources: [
                { in: "./src/test-env/index.html", out: "./index.html" }
            ],
            codeblockCss: { out: "./css/code-formatter.css" }
        })
    ]
};