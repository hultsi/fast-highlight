const path = require('path');
const WebpackComponents = require("./src/webpack-components-plugin/webpack-component-plugin.js")

module.exports = {
    mode: "production",
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
        new WebpackComponents([
            { in: "./src/test-env/index.html", out: "./index.html" }
        ])
    ]
};