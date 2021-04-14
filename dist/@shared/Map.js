"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupJoin = void 0;
const groupJoin = (left, right) => {
    const result = new Map();
    const rightClone = new Map(right);
    left.forEach((leftElement, key) => {
        const rightElement = rightClone.get(key);
        rightClone.delete(key);
        if (rightElement === undefined) {
            result.set(key, { type: 'left', left: leftElement });
            return;
        }
        result.set(key, { type: 'both', left: leftElement, right: rightElement });
    });
    rightClone.forEach((rightElement, key) => {
        result.set(key, { type: 'right', right: rightElement });
    });
    return result;
};
exports.groupJoin = groupJoin;
