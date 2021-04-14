"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionModule = void 0;
exports.OptionModule = {
    some: (value) => ({ hasValue: true, value }),
    none: ({ hasValue: false }),
    get: (source) => {
        if (!source.hasValue) {
            throw 'not hasValue';
        }
        return source.value;
    },
};
