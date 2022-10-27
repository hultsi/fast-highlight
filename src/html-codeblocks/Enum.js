class Enum {
    constructor(start = 0) {
        this.use_enumerate_function_instead_of_this = (function* () {
            let i = start;
            while (true) yield i++;
        })();
    }

    erate = function erate(obj) {
        let out = {};
        if (Array.isArray(obj)) {
            // Array input
            for (let i = 0; i < obj.length; ++i) {
                out[obj[i]] = this.use_enumerate_function_instead_of_this.next().value;
            }
        } else if (typeof (obj) === "object") {
            // Object input
            for (const [key, value] of Object.entries(obj)) {
                if (value === null) {
                    out[key] = this.use_enumerate_function_instead_of_this.next().value;
                } else {
                    // todo
                }
            }
        } else {
            return null
        }
        return out;
    }
}

module.exports = Enum;