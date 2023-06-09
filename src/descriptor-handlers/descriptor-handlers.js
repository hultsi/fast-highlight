const addDefaultDescriptors = require("./default-handler.js");
const addCppDescriptors = require("./cpp-handler.js");
const addCmakeDescriptors = require("./cmake-handler.js");

module.exports = {
    addDefaultDescriptors,
    addCppDescriptors,
    addCmakeDescriptors,
};