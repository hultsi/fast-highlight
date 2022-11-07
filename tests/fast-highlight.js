const { FastHighlight } = require("fast-highlight")

new FastHighlight({
    predefinedCss: true,
    output: __dirname + "/build",
    components: [
        { in: __dirname + "/test-src/codeblocks/codeblock.cpp" }
    ],
    sources: [
        { in: __dirname + "/test-src/html/index.html", out: "./index.html" },
        { in: __dirname + "/test-src/css", out: "./css/" }
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
