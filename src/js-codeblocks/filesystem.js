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

module.exports = {
    genericError,
    relativeToAbsolutePath,
    findFilesWithExtRecursive,
};