const fs = require("fs");
const nodePath = require("path");
const {
    relativeToAbsolutePath,
    findFilesWithExtRecursive,
} = require("./filesystem.js");
const FastHighlightCore = require("./fhl-core.js");

class FastHighlight extends FastHighlightCore {
    constructor(args) {
        console.log("\n  Finding fhl matches...\n")
        console.time("  Writing file after");
        super(args);
        if (!this.root) throw "Please define 'output' parameter";
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
                        return this.replaceCodeComponents(file);
                    } else {
                        // Not an .html, just return as is
                        return [file, new Array(0)];
                    }
                })();

                // Finally emit assets
                if (!isDir) {
                    const path = nodePath.join(this.root, this.files[fileInd].out);
                    fs.mkdirSync(nodePath.dirname(path), { recursive: true });
                    console.timeLog(`  Writing file after`, `\t\x1b[32m${path}\x1b[0m`);
                    fs.writeFileSync(path, parsedContent);
                } else {
                    const fileName = (() => {
                        const splitted = filesAbs[i].split("/");
                        return splitted[splitted.length - 1];
                    })();
                    const path = nodePath.join(this.root, this.files[fileInd].out, "/", fileName);
                    fs.mkdirSync(nodePath.dirname(path), { recursive: true });
                    console.timeLog(`  Writing file after`, `\t\x1b[32m${path}\x1b[0m`);
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
        console.log("");
    }
}

module.exports = FastHighlight;