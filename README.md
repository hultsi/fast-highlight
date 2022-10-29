# This is probably not up to date... to be updated

# Fast Highlight

Allows easy inserting of code snippets to .html files directly from source files. The highlighted code is inserted during build phase which means no extra js needed on the client side. Works alone or as a webpack plugin.

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

And you'd want this inserted to your html with proper color coding. With JsCodeBlocks this can be done by just defining an html-like component <fhl-magic.js/> in the .html source file.

**index.html**
```html
<!DOCTYPE HTML>
<html>
    <head>
    </head>
    <body>
        <div>I wrote this code:</div>
        <fhl-magic.js/>
    </body>
</html>
```

FastHighlight can then check the index.html for any codeblocks and replace them with the corresponding files and color code them accordingly.

## How to

### As a webpack plugin

To get started. In your webpack.config.js get the plugin and then initiate it under the "plugins" array

```js
const { FastHighlightWebpackPlugin } = require("FastHighlight")
{ 
    // webpack struct starts here...

    plugins: [
        new FastHighlightWebpackPlugin({
            // Includes the predefined css file for the snippets
            predefinedCss: true,
            // Tells the plugin where to find the codeblocks <fhl-something.something/>
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
                    /**
                     * The key here needs to match the file format abbreviation
                     * E.g., js/cpp/hpp/py/json/etc.
                     */
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
    ],

    // Webpack struct continues...
};

```

### As a standalone

Standalone usage differs only slightly. First create a js file and define the options like below.

```js
const { FastHighlight } = require("FastHighlight")

// Create the class
new FastHighlight({
    // Define the output build directory
    output: "./build",
    // Includes the predefined css file for the snippets
    predefinedCss: true,
    // Tells the plugin where to find the codeblocks <fhl-something.something/>
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
            /**
             * The key here needs to match the file format abbreviation
             * E.g., js/cpp/hpp/py/json/etc.
             */
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
}).run(); // And call .run()
```

Then run the script with node.

Currently there is no "watch" mode in the standalone version.

### And more

The package also reveals the core implementation FastHighlightCore but if you want to use that, I suggest reading the source code.