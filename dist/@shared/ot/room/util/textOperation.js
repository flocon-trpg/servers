"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPrivateClientOperation = exports.toDownOperation = exports.toUpOperation = exports.diff = exports.transform = exports.restore = exports.composeDownOperation = exports.applyBack = exports.apply = exports.upOperation = exports.downOperation = void 0;
const t = __importStar(require("io-ts"));
const Result_1 = require("../../../Result");
const TextOperationCore = __importStar(require("../../../textOperation"));
const retain = 'retain';
const insert = 'insert';
const delete$ = 'delete';
const downOperationUnit = t.union([
    t.type({
        type: t.literal(retain),
        retain: t.number,
    }),
    t.type({
        type: t.literal(insert),
        insert: t.number,
    }),
    t.type({
        type: t.literal(delete$),
        delete: t.string,
    }),
]);
exports.downOperation = t.array(downOperationUnit);
const upOperationUnit = t.union([
    t.type({
        type: t.literal(retain),
        retain: t.number,
    }),
    t.type({
        type: t.literal(insert),
        insert: t.string,
    }),
    t.type({
        type: t.literal(delete$),
        delete: t.number,
    }),
]);
exports.upOperation = t.array(upOperationUnit);
const apply = (state, action) => {
    const action$ = TextOperationCore.TextUpOperation.ofUnit(action);
    if (action$ == null) {
        return Result_1.ResultModule.ok(state);
    }
    return TextOperationCore.TextUpOperation.apply({ prevState: state, action: action$ });
};
exports.apply = apply;
const applyBack = (state, action) => {
    const action$ = TextOperationCore.TextDownOperation.ofUnit(action);
    if (action$ == null) {
        return Result_1.ResultModule.ok(state);
    }
    return TextOperationCore.TextDownOperation.applyBack({ nextState: state, action: action$ });
};
exports.applyBack = applyBack;
const composeDownOperation = (first, second) => {
    const first$ = first == null ? undefined : TextOperationCore.TextDownOperation.ofUnit(first);
    const second$ = second == null ? undefined : TextOperationCore.TextDownOperation.ofUnit(second);
    if (first$ == null) {
        return Result_1.ResultModule.ok(second);
    }
    if (second$ == null) {
        return Result_1.ResultModule.ok(first);
    }
    const result = TextOperationCore.TextDownOperation.compose({ first: first$, second: second$ });
    if (result.isError) {
        return result;
    }
    return Result_1.ResultModule.ok(TextOperationCore.TextDownOperation.toUnit(result.value));
};
exports.composeDownOperation = composeDownOperation;
const restore = ({ nextState, downOperation }) => {
    const downOperation$ = downOperation == null ? undefined : TextOperationCore.TextDownOperation.ofUnit(downOperation);
    if (downOperation$ == null) {
        return Result_1.ResultModule.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }
    const result = TextOperationCore.TextDownOperation.applyBackAndRestore({ nextState, action: downOperation$ });
    if (result.isError) {
        return result;
    }
    return Result_1.ResultModule.ok({
        prevState: result.value.prevState,
        twoWayOperation: TextOperationCore.TextTwoWayOperation.toUnit(result.value.restored),
    });
};
exports.restore = restore;
const transform = ({ first, second, prevState, }) => {
    const first$ = first == null ? undefined : TextOperationCore.TextTwoWayOperation.ofUnit(first);
    if (first$ === undefined) {
        const second$ = second == null ? undefined : TextOperationCore.TextUpOperation.ofUnit(second);
        if (second$ === undefined) {
            return Result_1.ResultModule.ok({
                firstPrime: undefined,
                secondPrime: undefined,
            });
        }
        const restoreResult = TextOperationCore.TextUpOperation.applyAndRestore({ prevState, action: second$ });
        if (restoreResult.isError) {
            return restoreResult;
        }
        return Result_1.ResultModule.ok({
            firstPrime: undefined,
            secondPrime: TextOperationCore.TextTwoWayOperation.toUnit(restoreResult.value.restored),
        });
    }
    const second$ = second == null ? undefined : TextOperationCore.TextUpOperation.ofUnit(second);
    if (second$ === undefined) {
        return Result_1.ResultModule.ok({
            firstPrime: first$,
            secondPrime: undefined
        });
    }
    const secondResult = TextOperationCore.TextUpOperation.applyAndRestore({ prevState, action: second$ });
    if (secondResult.isError) {
        return secondResult;
    }
    const result = TextOperationCore.TextTwoWayOperation.transform({ first: first$, second: secondResult.value.restored });
    if (result.isError) {
        return result;
    }
    return Result_1.ResultModule.ok({
        firstPrime: TextOperationCore.TextTwoWayOperation.toUnit(result.value.firstPrime),
        secondPrime: TextOperationCore.TextTwoWayOperation.toUnit(result.value.secondPrime),
    });
};
exports.transform = transform;
const diff = ({ prev, next }) => {
    return TextOperationCore.TextTwoWayOperation.toUnit(TextOperationCore.TextTwoWayOperation.diff({ first: prev, second: next }));
};
exports.diff = diff;
const diffToUpOperation = ({ prev, next }) => {
    const twoWayOperation = TextOperationCore.TextTwoWayOperation.diff({ first: prev, second: next });
    const upOperation = TextOperationCore.TextTwoWayOperation.toUpOperation(twoWayOperation);
    return TextOperationCore.TextUpOperation.toUnit(upOperation);
};
const toUpOperation = (source) => {
    const twoWayOperation = TextOperationCore.TextTwoWayOperation.ofUnit(source);
    if (twoWayOperation == null) {
        throw new Error('This should not happen');
    }
    const upOperation = TextOperationCore.TextTwoWayOperation.toUpOperation(twoWayOperation);
    return TextOperationCore.TextUpOperation.toUnit(upOperation);
};
exports.toUpOperation = toUpOperation;
const toDownOperation = (source) => {
    const twoWayOperation = TextOperationCore.TextTwoWayOperation.ofUnit(source);
    if (twoWayOperation == null) {
        throw new Error('This should not happen');
    }
    const downOperation = TextOperationCore.TextTwoWayOperation.toDownOperation(twoWayOperation);
    return TextOperationCore.TextDownOperation.toUnit(downOperation);
};
exports.toDownOperation = toDownOperation;
const toPrivateClientOperation = ({ oldValue, newValue, diff, createdByMe, }) => {
    if (oldValue.isValuePrivate && !createdByMe) {
        if (newValue.isValuePrivate && !createdByMe) {
            return undefined;
        }
        return diffToUpOperation({ prev: '', next: newValue.value });
    }
    if (newValue.isValuePrivate && !createdByMe) {
        return diffToUpOperation({ prev: oldValue.value, next: '' });
    }
    if (diff == null) {
        return undefined;
    }
    return exports.toUpOperation(diff);
};
exports.toPrivateClientOperation = toPrivateClientOperation;
