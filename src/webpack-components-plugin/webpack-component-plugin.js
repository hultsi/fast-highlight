const fs = require("fs");
const nodePath = require("path");

const genericError = function genericError() {
    const e = new Error();
    const s = e.stack.split("\n").slice(2);
    for (let i = 0; i < s.length; ++i) {
        s[i] = s[i].trim();
    }

    const functionName = (() => {
        const name = `${s[0].split(" ")[1]}`;
        if (name === "new") {
            const className = `${s[0].split(" ")[2]}`;
            return `${name} ${className}`;
        }
        return name;
    })();

    console.log(`Error stack from ${functionName}(...)`)
    console.log(s);
    throw `Something bad happened and brought you here. Check the functions stack above.`;
}

const relativeToAbsolutePath = function relativeToAbsolutePath(path) {
    if (Array.isArray(path)) {
        for (let i = 0; i < path.length; ++i) {
            if (typeof (path[i]) !== "string") {
                genericError();
            }
            path[i] = nodePath.resolve(path[i]).replace(/\\{1,2}/g, "/");
        }
        return path;
    }
    if (typeof (path) !== "string") {
        genericError();
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

    getComponentContent = function getComponentContent(fileName) {
        // Find the component from "this.components" and parse body content from it
        const componentPath = this.components.find(el => {
            const splittedPath = el.split("/");
            return splittedPath[splittedPath.length - 1] === fileName;
        });
        if (componentPath === undefined) {
            genericError();
        }
        return fs.readFileSync(componentPath, { encoding: "utf-8" });
    }

    getLinkTags = function getLinkTags(contentInsideHeadTags) {
        let out = [];
        let copiedContent = contentInsideHeadTags; // Todo: probably don't need a copy here since it's a string
        while (true) {
            const linkTagBeginPointer = copiedContent.search(/<link.*?>/);
            if (linkTagBeginPointer === -1) {
                break;
            }
            copiedContent = copiedContent.substring(linkTagBeginPointer);

            const linkTagEndPointer = copiedContent.search(">");
            const fullLinkTagString = copiedContent.substring(0, linkTagEndPointer + 1);
            const href = (() => {
                // TODO: is there a bit shorter way for this?
                const hrefStart = copiedContent.search(/href=.*\.css/);
                const hrefStartContent = copiedContent.substring(hrefStart);
                const hrefEnd = hrefStartContent.search(/\.css/); // Todo: What if we have href="asd.css " <-- notice space
                const beginning = "href=\"";
                const end = ".css";
                return hrefStartContent.substring(beginning.length, hrefEnd + end.length)
            })();
            const resolvedHref = nodePath.resolve(href); // resolve the path for easier matching
            out = [...out, { resolvedHref, fullLinkTagString }];
            copiedContent = copiedContent.substring(linkTagEndPointer);
        }
        return out;
    }

    replaceHtmlComponents = function replaceHtmlComponents(fileContent) {
        const fileExt = "html";
        const componentTag = new RegExp(`(<component-)(.*)([.]${fileExt}/>)`);
        const componentTagEnd = new RegExp(`/>`);
        const HEAD_TEMPORARY_HASH = `[TODO_THIS_COULD_BE_A_LONG_HASH_FOR_EXAMPLE]`;

        let copiedContentHead = (() => {
            const upToFirstHeadTagSliced = fileContent.split(/<head>/)[1]; // No spaces in tags currently allowed!
            return upToFirstHeadTagSliced.split(/<\/head>/)[0];
        })();
        let copiedContent = (() => {
            const upToFirstHeadTagSliced = fileContent.split(/<head>/)[0]; // No spaces in tags currently allowed!
            const beginningWithHash = `${upToFirstHeadTagSliced}<head>${HEAD_TEMPORARY_HASH}</head>`;
            return beginningWithHash + fileContent.split(/<\/head>/)[1];
        })();
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

            // Parse the whole component tag and then the file name from it
            const tagEnd = copiedContent.search(componentTagEnd) + "/>".length;
            const theActualParsedTag = copiedContent.substring(0, tagEnd); // E.g., <component-some-file-name-here.html/>
            const fileName = (() => {
                const theTagEnding = theActualParsedTag.split("component-")[1];
                return theTagEnding.split(`/>`)[0];
            })();

            const componentContent = this.getComponentContent(fileName);
            const contentInsideBodyTags = (() => {
                const upToFirstBodyTagSliced = componentContent.split(/<body>/)[1]; // No spaces in tags currently allowed!
                return upToFirstBodyTagSliced.split(/<\/body>/)[0];
            })();

            // Finally add the content and "move copiedContent pointer"
            parsedContent += contentInsideBodyTags;
            copiedContent = copiedContent.substring(theActualParsedTag.length)

            // Then handle <head> tags
            // Todo: no need to do this multiple times for the same component
            const contentInsideHeadTags = (() => {
                const upToFirstHeadTagSliced = componentContent.split(/<head>/)[1]; // No spaces in tags currently allowed!
                return upToFirstHeadTagSliced.split(/<\/head>/)[0].trim();
            })();
            const linkTagsIncludedAlready = this.getLinkTags(copiedContentHead);
            const linkTagsToInclude = this.getLinkTags(contentInsideHeadTags);
            for (let i = 0; i < linkTagsToInclude.length; ++i) {
                if (linkTagsIncludedAlready.findIndex(el => el.resolvedHref === linkTagsToInclude[i].resolvedHref) === -1) {
                    copiedContentHead += linkTagsToInclude[i].fullLinkTagString;
                }
            }
        }
        parsedContent = parsedContent.replace(`${HEAD_TEMPORARY_HASH}`, copiedContentHead);
        return parsedContent;
    }

    apply(compiler) {
        const pluginName = WebpackComponentsPlugin.name;
        const { webpack } = compiler;
        const { RawSource } = webpack.sources;

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            this.root = compilation.options.context;
            const filesWithExt = findFilesWithExtRecursive(nodePath.join(this.root, "/src"), "html"); // TODO: these should be user defined?
            const filesAbs = relativeToAbsolutePath(filesWithExt);

            // Parse html files
            for (let i = 0; i < filesAbs.length; ++i) {
                if (!this.isIncludedInBuild(filesAbs[i])) {
                    continue;
                }
                const file = fs.readFileSync(filesAbs[i], { encoding: "utf8" });
                const parsedContent = this.replaceHtmlComponents(file);

                // Emit assets?
                compilation.emitAsset(
                    "./index.html",
                    new RawSource(parsedContent)
                );
            }

            // Add meta tags as well? (Warn about duplicate meta tags?)

            // Add code snippet components

            // Anything else?
        });
    }
}

module.exports = WebpackComponentsPlugin;