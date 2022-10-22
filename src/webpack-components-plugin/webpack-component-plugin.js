const fs = require("fs");
const nodePath = require("path");
const { formatContentToCodeblock } = require("./code-formatter.js");
const { LANGUAGES } = require("./TokenFactory.js");

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
    constructor(args) {
        this.root = "";
        this.beingWatched = [];
        this.hasCodeblocks = false;

        const componentPaths = (() => {
            const paths = new Array(args.components.length);
            for (let i = 0; i < args.components.length; ++i) {
                paths[i] = relativeToAbsolutePath(args.components[i].in);
            }
            return paths;
        })();

        this.components = [];
        if (Array.isArray(componentPaths)) {
            for (let i = 0; i < componentPaths.length; ++i) {
                this.components = [...this.components, ...findFilesWithExtRecursive(componentPaths[i])];
            }
        } else {
            this.components = findFilesWithExtRecursive(componentPaths);
        }

        this.files = new Array(args.sources.length);
        for (let i = 0; i < this.files.length; ++i) {
            this.files[i] = { in: relativeToAbsolutePath(args.sources[i].in), out: args.sources[i].out };
        }

        this.codeblockCssPath = args.codeblockSettings.css.out;
        this.codeblockFormatting = {
            js: {},
            cpp: {},
            py: {},
        };
        for (const [key, val] of Object.entries(args.codeblockSettings.formatting)) {
            this.codeblockFormatting[key] = val;
        }
    }

    isIncludedInBuild = function isIncludedInBuild(path) {
        // TODO: this is probably not needed
        // for (let i = 0; i < this.files.length; ++i) {
        //     if (this.files[i].in === path) {
        //         return true;
        //     }
        // }
        return true;
    }

    getOutputPath = function getOutputPath(path) {
        for (let i = 0; i < this.files.length; ++i) {
            if (this.files[i].in === path) {
                return this.files[i].out;
            }
        }
        return null;
    }

    getComponentPath = function getComponentPath(fileName) {
        // Find the component from "this.components" and parse body content from it
        const componentPath = this.components.find(el => {
            const splittedPath = el.split("/");
            return splittedPath[splittedPath.length - 1] === fileName;
        });
        if (componentPath === undefined) {
            genericError();
        }
        return componentPath;
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

    getMetaTags = function getMetaTags(contentInsideHeadTags) {
        let out = [];
        let copiedContent = contentInsideHeadTags; // Todo: probably don't need a copy here since it's a string
        while (true) {
            const metaTagBeginPointer = copiedContent.search(/<meta.*?>/);
            if (metaTagBeginPointer === -1) {
                break;
            }
            copiedContent = copiedContent.substring(metaTagBeginPointer);

            const metaTagEndPointer = copiedContent.search(">");
            const fullmetaTagString = (() => {
                const metaTagString = copiedContent.substring(0, metaTagEndPointer + 1);
                // Todo: this might be useless if the head is cleaned up at some point anyway
                if (metaTagString[metaTagString.length - 1] !== `\n`) {
                    return metaTagString + `\n`;
                }
                return metaTagString;
            })();

            out = [...out, fullmetaTagString];
            copiedContent = copiedContent.substring(metaTagEndPointer);
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
        let componentPathsArr = [];
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

            const componentPath = this.getComponentPath(fileName);
            const componentContent = fs.readFileSync(componentPath, { encoding: "utf-8" });
            componentPathsArr = [...componentPathsArr, componentPath];

            const contentInsideBodyTags = (() => {
                const upToFirstBodyTagSliced = componentContent.split(/<body>/)[1]; // No spaces in tags currently allowed!
                return upToFirstBodyTagSliced.split(/<\/body>/)[0];
            })();

            // Finally add the content and "move copiedContent pointer"
            parsedContent += contentInsideBodyTags;
            copiedContent = copiedContent.substring(theActualParsedTag.length);

            // Then handle <head> tags
            const contentInsideHeadTags = (() => {
                const upToFirstHeadTagSliced = componentContent.split(/<head>/)[1]; // No spaces in tags currently allowed!
                return upToFirstHeadTagSliced.split(/<\/head>/)[0].trim();
            })();
            // <link> tagas
            const linkTagsIncludedAlready = this.getLinkTags(copiedContentHead);
            const linkTagsToInclude = this.getLinkTags(contentInsideHeadTags);
            for (let i = 0; i < linkTagsToInclude.length; ++i) {
                if (linkTagsIncludedAlready.findIndex(el => el.resolvedHref === linkTagsToInclude[i].resolvedHref) === -1) {
                    copiedContentHead += linkTagsToInclude[i].fullLinkTagString;
                }
            }
            // <meta> tags
            const metaTagsIncludedAlready = this.getMetaTags(copiedContentHead);
            const metaTagsToInclude = this.getMetaTags(contentInsideHeadTags);
            for (let i = 0; i < metaTagsToInclude.length; ++i) {
                if (metaTagsIncludedAlready.findIndex(el => el === metaTagsToInclude[i]) === -1) {
                    copiedContentHead += metaTagsToInclude[i];
                }
            }
        }
        return [parsedContent.replace(`${HEAD_TEMPORARY_HASH}`, copiedContentHead), componentPathsArr];
    }

    replaceCodeComponents = function replaceCodeComponents(fileContent) {
        const fileExt = "(.{1,5})";
        const componentTag = new RegExp(`(<component-)(.*)([.]${fileExt}/>)`);
        const componentTagEnd = new RegExp(`/>`);

        let copiedContent = fileContent;
        let parsedContent = "";
        let componentPathsArr = [];
        while (true) {
            const ind = copiedContent.search(componentTag);
            if (ind < 0) {
                parsedContent += copiedContent;
                break;
            }
            this.hasCodeblocks = true;

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

            const componentPath = this.getComponentPath(fileName);
            const componentContent = fs.readFileSync(componentPath, { encoding: "utf-8" });
            componentPathsArr = [...componentPathsArr, componentPath];

            const lang = (() => {
                const splittedFileName = fileName.split(".");
                const len = splittedFileName.length;
                const lang = splittedFileName[len - 1];
                return lang;
            })();
            // Finally add the content and "move copiedContent pointer"
            parsedContent += formatContentToCodeblock(componentContent, this.codeblockFormatting[lang], LANGUAGES[lang]);
            copiedContent = copiedContent.substring(theActualParsedTag.length);
        }

        // Finally add the link tag to the html file
        const linkTag = `<link rel="stylesheet" href="${this.codeblockCssPath}">`;
        if (!this.hasCodeblocks || parsedContent.search(linkTag) > -1) {
            // Don't add the link tag if it is there already
            return parsedContent;
        }
        // Otherwise add the link tag to the end of head
        const ind = parsedContent.search(/<\/head>/);
        if (ind > -1) {
            parsedContent = `
                ${parsedContent.substring(0, ind)}
                ${linkTag}
                ${parsedContent.substring(ind)}
            `;
        }
        return [parsedContent, componentPathsArr];
    }

    apply(compiler) {
        const pluginName = WebpackComponentsPlugin.name;
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
                    if (!this.isIncludedInBuild(filesAbs[i])) {
                        continue;
                    }
                    const file = fs.readFileSync(filesAbs[i], { encoding: "utf8" });
                    const [parsedContent, componentPaths] = (() => {
                        const splitted = filesAbs[i].split(".");
                        if (splitted[splitted.length - 1] === "html") {
                            const [htmlComponentsReplaced, htmlComponents] = this.replaceHtmlComponents(file);
                            const [codeComponentsReplaced, codeComponents] = this.replaceCodeComponents(htmlComponentsReplaced);
                            return [codeComponentsReplaced, [...htmlComponents, ...codeComponents]];
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

                if (this.hasCodeblocks) {
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
                // console.log(path);
                compilation.fileDependencies.add(path.replaceAll("/", "\\"));
            }
            callback();
        });
    }
}

module.exports = WebpackComponentsPlugin;