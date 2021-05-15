"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPrivateClientOperation = exports.transform = exports.composeDownOperation = void 0;
const composeDownOperation = (first, second) => {
    if (first === undefined) {
        return second;
    }
    if (second === undefined) {
        return first;
    }
    return { oldValue: first.oldValue };
};
exports.composeDownOperation = composeDownOperation;
const transform = ({ first, second, prevState }) => {
    if (first === undefined && second !== undefined) {
        const newOperation = { oldValue: prevState, newValue: second.newValue };
        if (newOperation.oldValue !== newOperation.newValue) {
            return { oldValue: prevState, newValue: second.newValue };
        }
    }
    return undefined;
};
exports.transform = transform;
const toPrivateClientOperation = ({ oldValue, newValue, defaultState, createdByMe, }) => {
    if (oldValue.isValuePrivate && !createdByMe) {
        if (newValue.isValuePrivate && !createdByMe) {
            return undefined;
        }
        return {
            newValue: newValue.value,
        };
    }
    if (newValue.isValuePrivate && !createdByMe) {
        return {
            newValue: defaultState,
        };
    }
    return {
        newValue: newValue.value,
    };
};
exports.toPrivateClientOperation = toPrivateClientOperation;
