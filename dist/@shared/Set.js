"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupJoin = void 0;
const groupJoin = (left, right) => {
    const result = new Map();
    const rightClone = new Set(right);
    left.forEach(leftElement => {
        const existsInRight = rightClone.has(leftElement);
        rightClone.delete(leftElement);
        if (existsInRight) {
            result.set(leftElement, 'both');
            return;
        }
        result.set(leftElement, 'left');
    });
    rightClone.forEach(rightElement => {
        result.set(rightElement, 'right');
    });
    return result;
};
exports.groupJoin = groupJoin;
