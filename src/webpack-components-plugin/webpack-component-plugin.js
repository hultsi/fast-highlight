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
            path[i] = nodePath.resolve(path[i]).replace(/\\{1,2}/g, "/");
        }
        return path;
    }
    return nodePath.resolve(path).replace(/\\{1,2}/g, "/");
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
    
    for (let i = 0; i < arrayOfFiles.length; ++i) {
        arrayOfFiles[i] = arrayOfFiles[i].replace(/\\{1,2}/g, "/");
    }

    return arrayOfFiles;
}

class WebpackComponentsPlugin {
    constructor(files) {
        this.root = "";

        const componentPaths = relativeToAbsolutePath("./src/test-env"); // todo: make this user param
        this.components = [];
        if (Array.isArray(componentPaths)) {
            for (let i = 0; i < componentPaths.length; ++i) {
                this.components = [...this.components, ...findFilesWithExtRecursive(componentPaths[i])];
            }
        } else {
            this.components = findFilesWithExtRecursive(componentPaths);
        }

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

    replaceHtmlComponents = function replaceHtmlComponents(fileContent) {
        const fileExt = "html";
        const componentTag = new RegExp(`(<component-)(.*)([.]${fileExt}/>)`);
        const componentTagEnd = new RegExp(`/>`);
        let copiedContent = fileContent;
        let parsedContent = "";
        while (true) {
            const ind = copiedContent.search(componentTag);
            if (ind < 0) {
                parsedContent += copiedContent;
                break;
            }
            // Component found
            parsedContent += copiedContent.substring(0, ind);
            copiedContent = copiedContent.substring(ind); // Remove already parsed content

            const tagEnd = copiedContent.search(componentTagEnd) + "/>".length;
            const theActualParsedTag = copiedContent.substring(0, tagEnd); // E.g., <component-some-file-name-here.html/>
            const fileName = (() => {
                const theTagEnding = theActualParsedTag.split("component-")[1];
                return theTagEnding.split(`/>`)[0];
            })();

            const componentPath = this.components.find(el => {
                const splittedPath = el.split("/");
                return splittedPath[splittedPath.length - 1] === fileName;
            });
            const componentContent = fs.readFileSync(componentPath, { encoding: "utf-8" });
            const contentInsideBodyTags = (() => {
                const upToFirstBodyTagSliced = componentContent.split(/<body>/)[1]; // No spaces in tags currently allowed!
                return upToFirstBodyTagSliced.split(/<\/body>/)[0];
            })();

            // Oh dear lord... finally add the content and "move copiedContent pointer"
            parsedContent += contentInsideBodyTags;
            copiedContent = copiedContent.substring(theActualParsedTag.length)
        }
        return parsedContent;
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
                this.replaceHtmlComponents(file);
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