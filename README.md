# JsCodeBlocks

Allows easy inserting of code snippets to .html files. Currently works only as a webpack plugin but later on could be improved to work as a standalone package as well.

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

And you'd want this inserted to your html with proper color coding. With JsCodeBlocks this can be done by just defining an html-like component <jscodeblocks-magic.js/> in the .html source file.

**index.html**
```html
<!DOCTYPE HTML>
<html>
    <head>
    </head>
    <body>
        <div>I wrote this code:</div>
        <jscodeblocks-magic.js/>
    </body>
</html>
```

## Todo: