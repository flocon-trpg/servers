"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPrivateClientOperation = exports.clientTransform = exports.serverTransform = exports.composeUpOperation = exports.composeDownOperation = void 0;
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
const composeUpOperation = (first, second) => {
    if (first === undefined) {
        return second;
    }
    if (second === undefined) {
        return first;
    }
    return { newValue: second.newValue };
};
exports.composeUpOperation = composeUpOperation;
const serverTransform = ({ first, second, prevState }) => {
    if (first === undefined && second !== undefined) {
        const newOperation = { oldValue: prevState, newValue: second.newValue };
        if (newOperation.oldValue !== newOperation.newValue) {
            return { oldValue: prevState, newValue: second.newValue };
        }
    }
    return undefined;
};
exports.serverTransform = serverTransform;
const clientTransform = ({ first, second }) => {
    return {
        firstPrime: first,
        secondPrime: undefined,
    };
};
exports.clientTransform = clientTransform;
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
