const fs = require("fs");
const nodePath = require("path");
const { formatContentToCodeblock } = require("./code-formatter.js");
const { DEFAULT_SUPPORTED_FILES } = require("./Tokens.js");
const {
    relativeToAbsolutePath,
    findFilesWithExtRecursive,
} = require("./filesystem.js");

class FastHighlightCore {
    constructor(args) {
        this.root = args.output;
        this.beingWatched = [];
        this.hasCodeblocks = false;
        this.predefinedCss = (args.predefinedCss !== undefined ? args.predefinedCss : true);
        this.includeFileName = (args.includeFileName !== undefined ? args.includeFileName : true);

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

        const settings = args.fhlSettings;
        if (!settings || typeof(settings) !== "object") {
            // Just early return if no settings are present
            return;
        }
        this.codeblockCssPath = settings.css?.out;
        this.codeblockFormatting = (() => {
            let out = {};
            for (let i = 0; i < DEFAULT_SUPPORTED_FILES.length; ++i) {
                out[DEFAULT_SUPPORTED_FILES[i]] = {};
            }
            return out;
        })();
        if (settings.formatting) {
            for (const [key, val] of Object.entries(settings.formatting)) {
                this.codeblockFormatting[key] = val;
            }
        }
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
            return "";
        }
        return componentPath;
    }

    getLinkTags = function getLinkTags(contentInsideHeadTags) {
        let out = [];
        while (true) {
            const linkTagBeginPointer = contentInsideHeadTags.search(/<link.*?>/);
            if (linkTagBeginPointer === -1) {
                break;
            }
            contentInsideHeadTags = contentInsideHeadTags.substring(linkTagBeginPointer);

            const linkTagEndPointer = contentInsideHeadTags.search(">");
            const fullLinkTagString = contentInsideHeadTags.substring(0, linkTagEndPointer + 1);
            const href = (() => {
                const hrefStart = contentInsideHeadTags.search(/href=.*\.css/);
                const hrefStartContent = contentInsideHeadTags.substring(hrefStart);
                const hrefEnd = hrefStartContent.search(/\.css/);
                const beginning = "href=\"";
                const end = ".css";
                return hrefStartContent.substring(beginning.length, hrefEnd + end.length)
            })();
            const resolvedHref = nodePath.resolve(href); // resolve the path for easier matching
            out = [...out, { resolvedHref, fullLinkTagString }];
            contentInsideHeadTags = contentInsideHeadTags.substring(linkTagEndPointer);
        }
        return out;
    }

    getMetaTags = function getMetaTags(contentInsideHeadTags) {
        let out = [];
        while (true) {
            const metaTagBeginPointer = contentInsideHeadTags.search(/<meta.*?>/);
            if (metaTagBeginPointer === -1) {
                break;
            }
            contentInsideHeadTags = contentInsideHeadTags.substring(metaTagBeginPointer);

            const metaTagEndPointer = contentInsideHeadTags.search(">");
            const fullmetaTagString = (() => {
                const metaTagString = contentInsideHeadTags.substring(0, metaTagEndPointer + 1);
                // Todo: this might be useless if the head is cleaned up at some point anyway
                if (metaTagString[metaTagString.length - 1] !== `\n`) {
                    return metaTagString + `\n`;
                }
                return metaTagString;
            })();

            out = [...out, fullmetaTagString];
            contentInsideHeadTags = contentInsideHeadTags.substring(metaTagEndPointer);
        }
        return out;
    }

    replaceCodeComponents = function replaceCodeComponents(fileContent) {
        const fileExt = "(.{1,6})";
        const componentTag = new RegExp(`(<fhl-)(.*)([.]${fileExt}/>)`);
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
            const theActualParsedTag = copiedContent.substring(0, tagEnd); // E.g., <fhl-some-file-name-here.html/>
            const fileName = (() => {
                const theTagEnding = theActualParsedTag.split("fhl-")[1];
                return theTagEnding.split(`/>`)[0];
            })();

            const componentPath = this.getComponentPath(fileName);
            if (componentPath === "") {
                // Component not found
                console.warn(" - Couldn't find the component", theActualParsedTag)
                parsedContent += theActualParsedTag;
            } else {
                const componentContent = fs.readFileSync(componentPath, { encoding: "utf-8" });
                componentPathsArr = [...componentPathsArr, componentPath];

                const lang = (() => {
                    const splittedFileName = fileName.split(".");
                    const len = splittedFileName.length;
                    const lang = splittedFileName[len - 1];
                    if (lang === "txt") {
                        if (splittedFileName[0] === "CMakeLists") {
                            return "cmake";
                        }
                    }
                    return lang;
                })();

                // Finally add the content and "move copiedContent pointer"
                const settings = {
                    lang: lang,
                    fileName: fileName,
                    includeFileName: this.includeFileName,
                };
                parsedContent += formatContentToCodeblock(componentContent, this.codeblockFormatting[lang], settings);
            }
            copiedContent = copiedContent.substring(theActualParsedTag.length);
        }
        // Finally add the link tag to the html file
        const linkTag = `<link rel="stylesheet" href="${this.codeblockCssPath}">`;
        if (!this.hasCodeblocks || parsedContent.search(linkTag) > -1) {
            // Don't add the link tag if it is there already
            return [parsedContent, componentPathsArr];
        }
        // Otherwise add the link tag to the end of head
        const ind = parsedContent.search(/<\/head>/);
        if (ind > -1) {
            const beginning = parsedContent.substring(0, ind).trim();
            const ending = parsedContent.substring(ind);
            parsedContent = `${beginning}${linkTag.trim()}${ending}`;
        }
        return [parsedContent, componentPathsArr];
    }
}

module.exports = FastHighlightCore;