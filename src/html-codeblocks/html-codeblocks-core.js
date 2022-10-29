const fs = require("fs");
const nodePath = require("path");
const crypto = require("crypto");
const { formatContentToCodeblock } = require("./code-formatter.js");
const { LANGUAGES } = require("./Tokens.js");
const {
    genericError,
    relativeToAbsolutePath,
    findFilesWithExtRecursive,
} = require("./filesystem.js");

class HtmlCodeBlocksCore {
    constructor(args) {
        this.root = args.output;
        this.beingWatched = [];
        this.hasCodeblocks = false;
        this.predefinedCss = (args.predefinedCss !== undefined ? args.predefinedCss : true);

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
        const fileExt = "(.{1,5})";
        const componentTag = new RegExp(`(<html-codeblocks-)(.*)([.]${fileExt}/>)`);
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
            const theActualParsedTag = copiedContent.substring(0, tagEnd); // E.g., <html-codeblocks-some-file-name-here.html/>
            const fileName = (() => {
                const theTagEnding = theActualParsedTag.split("html-codeblocks-")[1];
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
}

module.exports = HtmlCodeBlocksCore;