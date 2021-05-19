"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIdRecord = void 0;
const isIdRecord = (source) => {
    for (const key in source) {
        if (key === '$version') {
            continue;
        }
        const value = source[key];
        if (value !== undefined) {
            return false;
        }
    }
    return true;
};
exports.isIdRecord = isIdRecord;
