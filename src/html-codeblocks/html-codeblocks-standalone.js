const fs = require("fs");
const nodePath = require("path");
const {
    relativeToAbsolutePath,
    findFilesWithExtRecursive,
} = require("./filesystem.js");
const HtmlCodeBlocksCore = require("./html-codeblocks-core.js");

class HtmlCodeBlocks extends HtmlCodeBlocksCore {
    constructor(args) {
        super(args);
    }

    run = function run() {
        for (let fileInd = 0; fileInd < this.files.length; ++fileInd) {
            this.hasCodeblocks = false;

            const [filesWithExt, isDir] = (() => {
                if (!fs.statSync(this.files[fileInd].in).isDirectory()) {
                    return [this.files[fileInd].in, false];
                } else {
                    return [findFilesWithExtRecursive(this.files[fileInd].in), true];
                }
            })();

            const filesAbs = (() => {
                const paths = relativeToAbsolutePath(filesWithExt);
                if (Array.isArray(paths)) {
                    return paths;
                }
                return [paths];
            })();

            // Parse html files                
            for (let i = 0; i < filesAbs.length; ++i) {
                const file = fs.readFileSync(filesAbs[i], { encoding: "utf8" });
                const [parsedContent, componentPaths] = (() => {
                    const splitted = filesAbs[i].split(".");
                    if (splitted[splitted.length - 1] === "html") {
                        const [htmlComponentsReplaced, htmlComponents] = this.replaceHtmlComponents(file);
                        const [codeComponentsReplaced, codeComponents] = this.replaceCodeComponents(htmlComponentsReplaced);

                        if (this.optimizeHead) {
                            return [this.optimizeHeader(codeComponentsReplaced), [...htmlComponents, ...codeComponents]];
                        }
                        return [codeComponentsReplaced, [...htmlComponents, ...codeComponents]];
                    } else {
                        // Not an .html, just return as is
                        return [file, new Array(0)];
                    }
                })();

                // Finally emit assets
                if (!isDir) {
                    const path = nodePath.join(this.root, this.files[fileInd].out);
                    fs.mkdirSync(nodePath.dirname(path), { recursive: true });
                    fs.writeFileSync(path, parsedContent);
                } else {
                    const fileName = (() => {
                        const splitted = filesAbs[i].split("/");
                        return splitted[splitted.length - 1];
                    })();
                    const path = nodePath.join(this.root, this.files[fileInd].out, "/", fileName);
                    fs.mkdirSync(nodePath.dirname(path), { recursive: true });
                    fs.writeFileSync(path, parsedContent);
                }

                this.beingWatched = [...this.beingWatched, filesAbs[i], ...componentPaths];
            }

            if (this.hasCodeblocks && this.predefinedCss) {
                const cbCss = fs.readFileSync(nodePath.join(__dirname, "/", "code-formatter.css"), { encoding: "utf8" });
                const path = nodePath.join(this.root, this.codeblockCssPath);
                fs.mkdirSync(nodePath.dirname(path), { recursive: true });
                fs.writeFileSync(path, cbCss);
            }
        }
    }
}

module.exports = HtmlCodeBlocks;