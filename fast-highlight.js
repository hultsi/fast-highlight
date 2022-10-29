const { FastHighlight } = require("./src/fast-highlight/FastHighlight.js")

new FastHighlight({
    predefinedCss: true,
    output: __dirname + "/build",
    components: [
        { in: __dirname + "/src/test-environment" }
    ],
    sources: [
        { in: __dirname + "/src/test-environment/index.html", out: "./index.html" },
        { in: __dirname + "/src/test-environment/css", out: "./css/" }
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
}).run();
