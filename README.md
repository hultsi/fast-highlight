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

And you'd want this inserted to your html with proper color coding. With FastHighlight this can be done by just defining an html-like component <fhl-magic.js/> in the .html source file.

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

## First

Install the package with

```sh
npm install -D fast-highlight
```

## As a webpack plugin

To get started. In your webpack.config.js get the plugin and then initiate it under the "plugins" array

**The simplest approach**
```js
const { FastHighlightWebpackPlugin } = require("FastHighlight")
{ 
    // webpack struct starts here...
    plugins: [
        new FastHighlightWebpackPlugin({
            // Tells the plugin where to find the codeblocks <fhl-something.something/>
            components: [
                { in: "./where/to/look/for/code/snippets" }
            ],
            // Any source files that are needed. They are parsed & then copied to the webpack build folder
            sources: [
                { in: "./index.html", out: "./index.html" },
            ],
            fhlSettings: {
                // Where to save the predefined css
                css: { out: "./css/code-formatter.css" },
            }
        })
    ],
    // Webpack struct continues...
};
```

**A bit more thorough approach**

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
                // You can also copy your css (or any other files for that matter)
                // to the output build location
                { in: "./css", out: "./css/" }
            ],
            fhlSettings: {
                // Where to save the predefined css
                css: { out: "./css/code-formatter.css" },
                // These define the sets for the types/keywords/etc.
                formatting: {
                    /**
                     * The key here needs to match the file format abbreviation
                     * E.g., js/cpp/hpp/py/json/etc.
                     */
                    // You can redefine keysets here if you wish
                    // Many languages are already supported so for example this is not needed
                    // unless you want to change the color coding scheme
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
                    // Other arbitrary languages are fine as well though. The file ending
                    // must be .wow in this case
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

## As a standalone

Standalone usage differs only slightly. First create a js file and define the options like below.

```js
const { FastHighlight } = require("FastHighlight")

// Create the class
new FastHighlight({
    // Define the output build directory.
    output: __dirname + "/build",
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
    fhlSettings: {
        // Where to save the predefined css
        css: { out: "./css/code-formatter.css" },
        // These define the sets for the types/keywords/etc.
        formatting: {
            /**
             * The key here needs to match the file format abbreviation
             * E.g., js/cpp/hpp/py/json/etc.
             */
            // You can redefine keysets here if you wish
            // Many languages are already supported so for example this is not needed
            // unless you want to change the color coding scheme
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
            // Other arbitrary languages are fine as well though. The file ending
            // must be .wow in this case
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

Currently there is no native "watch" mode in the standalone version.

### And more

The package also reveals the core implementation FastHighlightCore but if you want to use that, I suggest reading the source code.

## Redefinable sets

The sets that can be redefined in the *fhlSettings.formatting* object are the following.

```js
fhlSettings: {
    formatting: {
        types: new Set(["const", "float", ...]),
        keywords: new Set(["if", "else", ...]),
        basicOperators: new Set(["=", "+", ...]),
        comparisonOperators: new Set(["==", "!=", ...]),
        brackets: new Set(["(", ")", ...]),
        classes: new Set(["MyClass", "SomeOtherClass", ...]),
        comments: {
            singleLine: "//",
            multiLineStart: "/*",
            multiLineEnd: "*/",
        },
        strings: {
            // These need to be in an array
            singleLine: ['"', "'"],
            multiLine: ["`"],
        },
    }
}
```

## Custom CSS

You can create a css file that looks like the following and change the styling to match your liking. Then instead of using the predefined css, in the settings object of FastHighlight, you can copy your css files with FastHighlight to whichever folder you want.

```css
/*
    The <pre> tag will also have a class named fhl-global-{file-extension}.
    E.g., for .cpp files .fhl-global-cpp
*/
.fhl-global {
    background-color: #000;
    color: #FFF;
    line-height: 1.2;
    font-size: 16px;
    padding-left: 5px;
    overflow-x: auto;
}

/*
    The <code> tag will also have a class named fhl-code-{file-extension}.
    E.g., for .cpp files .fhl-code-cpp
*/
.fhl-code {
    
}

.fhl-type {
    color: #3C79D1;
}

.fhl-keyword {
    color: #C586C0;
}

.fhl-variable {
    color: #9CDCFE;
}

.fhl-function {
    color: #DCDCAA;
}

.fhl-operator {
    color: #FFFFFF;
}

.fhl-number {
    color: #B5CEA8;
}

.fhl-comment {
    color: #41A70A;
}

.fhl-class {
    color: #4EC9B0;
}

.fhl-string {
    color: #CE9178;
}
```
