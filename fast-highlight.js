const { FastHighlight } = require("./src/FastHighlight.js")

new FastHighlight({
    predefinedCss: true,
    output: __dirname + "/build",
    components: [
        { in: __dirname + "/tests" }
    ],
    sources: [
        { in: __dirname + "/tests/index.html", out: "./index.html" },
        { in: __dirname + "/tests/css", out: "./css/" }
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
}).run();
