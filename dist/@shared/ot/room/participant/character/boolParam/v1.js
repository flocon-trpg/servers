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
exports.createTransformerFactory = exports.apply = exports.toClientOperation = exports.toServerOperation = exports.toClientState = exports.upOperation = exports.downOperation = exports.state = void 0;
const t = __importStar(require("io-ts"));
const io_ts_1 = require("../../../../../io-ts");
const paramRecordOperation_1 = require("../../../util/paramRecordOperation");
const ReplaceOperation = __importStar(require("../../../util/replaceOperation"));
const Result_1 = require("../../../../../Result");
const operation_1 = require("../../../util/operation");
exports.state = t.type({
    $version: t.literal(1),
    isValuePrivate: t.boolean,
    value: io_ts_1.maybe(t.boolean),
});
exports.downOperation = operation_1.operation(1, {
    isValuePrivate: t.type({ oldValue: t.boolean }),
    value: t.type({ oldValue: io_ts_1.maybe(t.boolean) }),
});
exports.upOperation = operation_1.operation(1, {
    isValuePrivate: t.type({ newValue: t.boolean }),
    value: t.type({ newValue: io_ts_1.maybe(t.boolean) }),
});
const toClientState = (createdByMe) => (source) => {
    return Object.assign(Object.assign({}, source), { value: source.isValuePrivate && !createdByMe ? undefined : source.value });
};
exports.toClientState = toClientState;
const toServerOperation = (source) => {
    return source;
};
exports.toServerOperation = toServerOperation;
const toClientOperation = (createdByMe) => ({ prevState, nextState, diff }) => {
    return Object.assign(Object.assign({}, diff), { value: ReplaceOperation.toPrivateClientOperation({
            oldValue: {
                value: prevState.value,
                isValuePrivate: prevState.isValuePrivate,
            },
            newValue: {
                value: nextState.value,
                isValuePrivate: nextState.isValuePrivate,
            },
            defaultState: undefined,
            createdByMe,
        }) });
};
exports.toClientOperation = toClientOperation;
const apply = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.isValuePrivate != null) {
        result.isValuePrivate = operation.isValuePrivate.newValue;
    }
    if (operation.value != null) {
        result.value = operation.value.newValue;
    }
    return Result_1.ResultModule.ok(result);
};
exports.apply = apply;
const createTransformerFactory = (createdByMe) => paramRecordOperation_1.createParamTransformerFactory(createdByMe);
exports.createTransformerFactory = createTransformerFactory;
