/***
* Updates all necessary version tags to match
* package.json "version"
***/
const fs = require("fs");
const { readFile, writeFile } = require("node:fs/promises");
const nodePath = require("path");

const VERSION = fs.readFileSync(nodePath.resolve(__dirname, "../VERSION.txt"), { encoding: "utf-8" });
const TARBALL_REGEX = new RegExp(`fast-highlight-[0-9]{1,2}[.][0-9]{1,2}[.][0-9]{1,2}[.]tgz`, "g");

console.log(`Current version: ${VERSION}`);

// Update package.json
(async () => {
    const packageJson = JSON.parse(fs.readFileSync(nodePath.resolve(__dirname, "../package.json"), { encoding: "utf-8" }));
    packageJson.version = packageJson.version.replaceAll(TARBALL_REGEX, `fast-highlight-${VERSION}.tgz`);
    for (const [key, val] of Object.entries(packageJson.scripts)) {
        packageJson.scripts[key] = val.replaceAll(TARBALL_REGEX, `fast-highlight-${VERSION}.tgz`);
    }
    const outputFile = nodePath.resolve(__dirname, `../package.json`);
    await writeFile(outputFile, JSON.stringify(packageJson, null, `\t`));
    console.log(`Updated --> \t\x1b[32m${outputFile}\x1b[0m`);
})();

// Update build yaml
(async () => {
    const outputFile = nodePath.resolve(__dirname, `../.github/workflows/build-and-install.yaml`);
    const buildYaml = await readFile(outputFile, { encoding: "utf-8" });

    const buildYamlOut = buildYaml.replaceAll(TARBALL_REGEX, `fast-highlight-${VERSION}.tgz`);
    await writeFile(outputFile, buildYamlOut);
    console.log(`Updated --> \t\x1b[32m${outputFile}\x1b[0m`);
})();

// Update build sh
(async () => {
    const outputFile = nodePath.resolve(__dirname, `./build.sh`);
    const buildSh = await readFile(outputFile, { encoding: "utf-8" });

    const buildShOut = buildSh.replaceAll(TARBALL_REGEX, `fast-highlight-${VERSION}.tgz`);
    await writeFile(outputFile, buildShOut);
    console.log(`Updated --> \t\x1b[32m${outputFile}\x1b[0m`);
})();