"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToMaxLength100String = void 0;
const flocon_core_1 = require("@kizahasi/flocon-core");
const convertToMaxLength100String = (source) => {
    if (flocon_core_1.maxLength100String.is(source)) {
        return source;
    }
    const max100String = source.slice(0, 100);
    if (flocon_core_1.maxLength100String.is(max100String)) {
        return max100String;
    }
    throw new Error('this should not happen');
};
exports.convertToMaxLength100String = convertToMaxLength100String;
