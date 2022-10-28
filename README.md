# Html CodeBlocks

Allows easy inserting of code snippets to .html files. Works alone or as a webpack plugin.

## Example

Suppose you have the following looking piece of javascript code

**magic.js**
```js
const a = 123;
const b = 321;
const magicFunction = function magicFunction(first, second) {
    if (first < second) {
        return 1;
    }
    return first + second;
}
```

And you'd want this inserted to your html with proper color coding. With JsCodeBlocks this can be done by just defining an html-like component <htmlcodeblocks-magic.js/> in the .html source file.

**index.html**
```html
<!DOCTYPE HTML>
<html>
    <head>
    </head>
    <body>
        <div>I wrote this code:</div>
        <htmlcodeblocks-magic.js/>
    </body>
</html>
```

HtmlCodeBlocks can then check the index.html for any codeblocks and replace them with the corresponding files and color code them accordingly.

## How to

### As a webpack plugin

To get started. In your webpack.config.js get the plugin and then initiate it under the "plugins" array

```js
const { HtmlCodeBlocksWebpackPlugin } = require("HtmlCodeBlocks")

plugins: [
    new HtmlCodeBlocksWebpackPlugin({
        // Includes the predefined css file for the snippets
        predefinedCss: true,
        // This removes unnecessary spaces and line changes from <head>
        optimizeHead: true,
        // Tells the plugin where to find the codeblocks <htmlcodeblocks-something.something/>
        components: [
            { in: "./where/to/look/for/code/snippets" }
        ],
        // Any source files that are needed. They are parsed & then copied to the webpack build folder
        sources: [
            { in: "./index.html", out: "./index.html" },
            { in: "./css", out: "./css/" }
        ],
        codeblockSettings: {
            // Where to save the predefined css
            css: { out: "./css/code-formatter.css" },
            // These define the sets for the types/keywords/etc.
            formatting: {
                // Js has predefined sets already so not necessarily needed
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
                // Cpp has predefined sets already so not necessarily needed
                cpp: {
                    types: new Set([
                        `const`, `float`, `static`, `nullptr`,
                    ]),
                },
                // Other arbitrary languages are fine as well though
                wow: {
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


```

### As a standalone

Todo: