const fs = require("fs");
const nodePath = require("path");

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
    if (typeof(dirPath) !== "string" || typeof(ext) !== "string") {
        throw("Invalid input types."); // Todo: fix this to be a bit better
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
    constructor() {
        this.root = "";
    }

    apply(compiler) {
        const pluginName = WebpackComponentsPlugin.name;
        const { webpack } = compiler;
        const { RawSource } = webpack.sources;
        console.log(RawSource)
        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            this.root = compilation.options.context;
            const filesWithExt = findFilesWithExtRecursive(nodePath.join(this.root, "/src"), "js");
            const filesAbs = relativeToAbsolutePath(filesWithExt);
            
            // Parse files

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