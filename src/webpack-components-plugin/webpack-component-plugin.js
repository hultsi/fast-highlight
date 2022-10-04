const assert = require("assert");
const fs = require("fs");
const nodePath = require("path");

const genericError = function genericError() {
    const e = new Error();
    const s = e.stack.split("\n").slice(2);
    for (let i = 0; i < s.length; ++i) {
        s[i] = s[i].trim();
    }
    console.log(`Error stack from ${s[0].split(" ")[1]}(...)`)
    console.log(s);
    throw `Something bad happened and brought you here.`;
}

const relativeToAbsolutePath = function relativeToAbsolutePath(path) {
    if (Array.isArray(path)) {
        for (let i = 0; i < path.length; ++i) {
            path[i] = nodePath.resolve(path[i]);
        }
        return path;
    }
    return nodePath.resolve(path);
}

const findFilesWithExtRecursive = function findFilesWithExtRecursive(dirPath, ext = "") {
    if (typeof (dirPath) !== "string" || typeof (ext) !== "string") {
        genericError();
    }
    const files = fs.readdirSync(dirPath);
    let arrayOfFiles = [];
    for (let i = 0; i < files.length; ++i) {
        const file = files[i];
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            fileList = findFilesWithExtRecursive(dirPath + "/" + file, ext);
            arrayOfFiles = [...arrayOfFiles, ...fileList];
        } else {
            if (ext.length > 0) {
                const checkExtension = file.split(".");
                if (checkExtension[checkExtension.length - 1] == ext) {
                    arrayOfFiles.push(nodePath.join(dirPath, "/", file));
                }
            } else {
                arrayOfFiles.push(nodePath.join(dirPath, "/", file));
            }
        }
    }

    return arrayOfFiles;
}

class WebpackComponentsPlugin {
    constructor(files) {
        this.root = "";
        this.files = new Array(files.length);
        for (let i = 0; i < this.files.length; ++i) {
            this.files[i] = { in: relativeToAbsolutePath(files[i].in), out: files[i].out };
        }
    }

    isIncludedInBuild = function isIncludedInBuild(path) {
        for (let i = 0; i < this.files.length; ++i) {
            if (this.files[i].in === path) {
                return true;
            }
        }
        return false;
    }

    apply(compiler) {
        const pluginName = WebpackComponentsPlugin.name;
        const { webpack } = compiler;
        const { RawSource } = webpack.sources;

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            this.root = compilation.options.context;
            const filesWithExt = findFilesWithExtRecursive(nodePath.join(this.root, "/src"), "html");
            const filesAbs = relativeToAbsolutePath(filesWithExt);

            // Parse html files
            for (let i = 0; i < filesAbs.length; ++i) {
                if (!this.isIncludedInBuild(filesAbs[i])) {
                    continue;
                }
                const file = fs.readFileSync(filesAbs[i], { encoding: "utf8" });
                console.log(file);
                // this.replaceHtmlComponents(file);
            }

            // Combine component references

            // Add .css references (Make sure duplicates are ignored)

            // Add meta tags as well? (Warn about duplicate meta tags?)

            // Add code snippet components

            // Emit assets?
            compilation.emitAsset(
                "./index.html",
                new RawSource("")
            );

            // Anything else?
        });
    }
}

module.exports = WebpackComponentsPlugin;