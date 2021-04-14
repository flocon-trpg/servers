"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStateMap = exports.keyFactory = exports.equals = exports.toJSONString = exports.stringToCompositeKey = exports.compositeKeyToString = void 0;
const CustomDualKeyMap_1 = require("./CustomDualKeyMap");
const compositeKeyToString = (source) => {
    return `${source.id}@${source.createdBy}`;
};
exports.compositeKeyToString = compositeKeyToString;
const stringToCompositeKey = (source) => {
    const array = source.split('@');
    if (array.length !== 2) {
        return null;
    }
    return { id: array[0], createdBy: array[1] };
};
exports.stringToCompositeKey = stringToCompositeKey;
const toJSONString = (source) => {
    return `{ id: ${source.id}, createdBy: ${source.createdBy} }`;
};
exports.toJSONString = toJSONString;
const equals = (x, y) => {
    return x.createdBy === y.createdBy && x.id === y.id;
};
exports.equals = equals;
exports.keyFactory = {
    createDualKey: x => ({ first: x.createdBy, second: x.id }),
    createKey: x => ({ createdBy: x.first, id: x.second }),
};
const createStateMap = (source) => {
    return new CustomDualKeyMap_1.CustomDualKeyMap(Object.assign(Object.assign({}, exports.keyFactory), { sourceMap: source }));
};
exports.createStateMap = createStateMap;
