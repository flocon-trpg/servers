"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.undefinedForAll = void 0;
const undefinedForAll = (source) => {
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            return false;
        }
    }
    return true;
};
exports.undefinedForAll = undefinedForAll;
