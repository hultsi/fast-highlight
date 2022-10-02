const fs = require("fs");
const nodePath = require("path");

class WebpackComponentsPlugin {
    constructor() {
        this.root = "";
    }

    apply(compiler) {
        const pluginName = WebpackComponentsPlugin.name;
        const { webpack } = compiler;
        const { RawSource } = webpack.sources;
        console.log(RawSource)
        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            this.root = compilation.options.context;
            console.log(this.root);
            compilation.emitAsset(
                "./index.html",
                new RawSource(`
                    <html>
                        <style>
                        @font-face {
                            font-family: "testFont";
                            src: url('logo.ttf') format('truetype');
                        }
                        </style>
                        <body>
                            <div style="font-family:'testFont';">Hello</div>
                        </body>
                    </html>
                `)
            );

            // const f = fs.readFileSync("path/to/logo.ttf");
            // compilation.emitAsset(
            //     "./logo.ttf",
            //     new RawSource(f)
            // );
        });
    }
}

module.exports = WebpackComponentsPlugin;