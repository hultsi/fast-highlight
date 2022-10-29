const fs = require("fs");
const nodePath = require("path");
const {
    relativeToAbsolutePath,
    findFilesWithExtRecursive,
} = require("./filesystem.js");
const HtmlCodeBlocksCore = require("./html-codeblocks-core.js");

class HtmlCodeBlocksWebpackPlugin extends HtmlCodeBlocksCore {
    constructor(args) {
        super(args);
    }

    apply(compiler) {
        const pluginName = HtmlCodeBlocksWebpackPlugin.name;
        const { webpack } = compiler;
        const { RawSource } = webpack.sources;

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            this.root = compilation.options.context;
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
                            const [codeComponentsReplaced, codeComponents] = this.replaceCodeComponents(file);
                            if (this.optimizeHead) {
                                return [this.optimizeHeader(codeComponentsReplaced), codeComponents];
                            }
                            return [codeComponentsReplaced, codeComponents];
                        } else {
                            // Not an .html, just return as is
                            return [file, new Array(0)];
                        }
                    })();

                    // Finally emit assets
                    if (!isDir) {
                        compilation.emitAsset(
                            this.files[fileInd].out,
                            new RawSource(parsedContent)
                        );
                    } else {
                        const fileName = (() => {
                            const splitted = filesAbs[i].split("/");
                            return splitted[splitted.length - 1];
                        })();
                        compilation.emitAsset(
                            nodePath.join(this.files[fileInd].out, "/", fileName),
                            new RawSource(parsedContent)
                        );
                    }

                    this.beingWatched = [...this.beingWatched, filesAbs[i], ...componentPaths];
                }

                if (this.hasCodeblocks && this.predefinedCss) {
                    const cbCss = fs.readFileSync(nodePath.join(__dirname, "/", "code-formatter.css"), { encoding: "utf8" });
                    compilation.emitAsset(
                        this.codeblockCssPath,
                        new RawSource(cbCss)
                    )
                }
            }
        });

        compiler.hooks.afterCompile.tapAsync(pluginName, (compilation, callback) => {
            const beingWatchedSet = new Set([...this.beingWatched]); // Makes every element unique
            for (const path of beingWatchedSet) {
                // For some reason webpack doesn't understand forward slashes...?
                compilation.fileDependencies.add(path.replaceAll("/", "\\"));
            }
            callback();
        });
    }
}

module.exports = HtmlCodeBlocksWebpackPlugin;