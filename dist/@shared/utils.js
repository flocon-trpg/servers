"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dualKeyRecordFind = exports.recordCompact = exports.dualKeyRecordForEach = exports.recordForEachAsync = exports.recordForEach = exports.mapToRecord = exports.recordToMap = exports.recordToArray = exports.chooseDualKeyRecord = exports.chooseRecord = exports.undefinedForAll = void 0;
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
const chooseRecord = (source, chooser) => {
    const result = {};
    for (const key in source) {
        const element = source[key];
        if (element !== undefined) {
            const newElement = chooser(element);
            if (newElement !== undefined) {
                result[key] = newElement;
            }
        }
    }
    return result;
};
exports.chooseRecord = chooseRecord;
const chooseDualKeyRecord = (source, chooser) => {
    const result = {};
    for (const key in source) {
        const element = source[key];
        if (element !== undefined) {
            result[key] = exports.chooseRecord(element, chooser);
        }
    }
    return result;
};
exports.chooseDualKeyRecord = chooseDualKeyRecord;
const recordToArray = (source) => {
    const result = [];
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            result.push({ key, value });
        }
    }
    return result;
};
exports.recordToArray = recordToArray;
const recordToMap = (source) => {
    const result = new Map();
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            result.set(key, value);
        }
    }
    return result;
};
exports.recordToMap = recordToMap;
const mapToRecord = (source) => {
    const result = {};
    source.forEach((value, key) => {
        result[key] = value;
    });
    return result;
};
exports.mapToRecord = mapToRecord;
const recordForEach = (source, action) => {
    for (const key in source) {
        const value = source[key];
        if (value === undefined) {
            continue;
        }
        action(value, key);
    }
};
exports.recordForEach = recordForEach;
const recordForEachAsync = async (source, action) => {
    for (const key in source) {
        const value = source[key];
        if (value === undefined) {
            continue;
        }
        await action(value, key);
    }
};
exports.recordForEachAsync = recordForEachAsync;
const dualKeyRecordForEach = (source, action) => {
    for (const first in source) {
        const inner = source[first];
        if (inner === undefined) {
            continue;
        }
        for (const second in inner) {
            const value = inner[second];
            if (value === undefined) {
                continue;
            }
            action(value, { first, second });
        }
    }
};
exports.dualKeyRecordForEach = dualKeyRecordForEach;
const recordCompact = (source, mapping) => {
    const result = {};
    for (const key in source) {
        const prevValue = source[key];
        if (prevValue === undefined) {
            continue;
        }
        const nextValue = mapping(prevValue, key);
        if (nextValue === undefined) {
            continue;
        }
        result[key] = nextValue;
    }
    return result;
};
exports.recordCompact = recordCompact;
const dualKeyRecordFind = (source, key) => {
    const inner = source[key.first];
    if (inner === undefined) {
        return undefined;
    }
    return inner[key.second];
};
exports.dualKeyRecordFind = dualKeyRecordFind;
