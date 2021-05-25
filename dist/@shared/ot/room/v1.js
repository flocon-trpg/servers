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
exports.clientTransform = exports.serverTransform = exports.diff = exports.restore = exports.composeDownOperation = exports.composeUpOperation = exports.applyBack = exports.apply = exports.toUpOperation = exports.toDownOperation = exports.toClientOperation = exports.toClientState = exports.upOperation = exports.downOperation = exports.state = exports.dbState = void 0;
const t = __importStar(require("io-ts"));
const Result_1 = require("../../Result");
const Bgm = __importStar(require("./bgm/v1"));
const ParamNames = __importStar(require("./paramName/v1"));
const Participant = __importStar(require("./participant/v1"));
const RecordOperation = __importStar(require("./util/recordOperation"));
const recordOperationElement_1 = require("./util/recordOperationElement");
const ReplaceOperation = __importStar(require("./util/replaceOperation"));
const type_1 = require("./util/type");
const utils_1 = require("../../utils");
const operation_1 = require("./util/operation");
const record_1 = require("./util/record");
const io_ts_1 = require("../../io-ts");
const v1_1 = require("../compositeKey/v1");
const indexes_1 = require("../../indexes");
const replaceStringDownOperation = t.type({ oldValue: t.string });
const replaceStringUpOperation = t.type({ newValue: t.string });
exports.dbState = t.type({
    $version: t.literal(1),
    activeBoardKey: io_ts_1.maybe(v1_1.compositeKey),
    bgms: t.record(t.string, Bgm.state),
    boolParamNames: t.record(t.string, ParamNames.state),
    numParamNames: t.record(t.string, ParamNames.state),
    participants: t.record(t.string, Participant.state),
    publicChannel1Name: t.string,
    publicChannel2Name: t.string,
    publicChannel3Name: t.string,
    publicChannel4Name: t.string,
    publicChannel5Name: t.string,
    publicChannel6Name: t.string,
    publicChannel7Name: t.string,
    publicChannel8Name: t.string,
    publicChannel9Name: t.string,
    publicChannel10Name: t.string,
    strParamNames: t.record(t.string, ParamNames.state),
});
exports.state = t.intersection([exports.dbState, t.type({
        createdBy: t.string,
        name: t.string,
    })]);
exports.downOperation = operation_1.operation(1, {
    activeBoardKey: t.type({ oldValue: io_ts_1.maybe(v1_1.compositeKey) }),
    bgms: t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(Bgm.state, Bgm.downOperation)),
    boolParamNames: t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)),
    name: replaceStringDownOperation,
    numParamNames: t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)),
    participants: t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(Participant.state, Participant.downOperation)),
    publicChannel1Name: replaceStringDownOperation,
    publicChannel2Name: replaceStringDownOperation,
    publicChannel3Name: replaceStringDownOperation,
    publicChannel4Name: replaceStringDownOperation,
    publicChannel5Name: replaceStringDownOperation,
    publicChannel6Name: replaceStringDownOperation,
    publicChannel7Name: replaceStringDownOperation,
    publicChannel8Name: replaceStringDownOperation,
    publicChannel9Name: replaceStringDownOperation,
    publicChannel10Name: replaceStringDownOperation,
    strParamNames: t.record(t.string, recordOperationElement_1.recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)),
});
exports.upOperation = operation_1.operation(1, {
    activeBoardKey: t.type({ newValue: io_ts_1.maybe(v1_1.compositeKey) }),
    bgms: t.record(t.string, recordOperationElement_1.recordUpOperationElementFactory(Bgm.state, Bgm.upOperation)),
    boolParamNames: t.record(t.string, recordOperationElement_1.recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)),
    name: replaceStringUpOperation,
    numParamNames: t.record(t.string, recordOperationElement_1.recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)),
    participants: t.record(t.string, recordOperationElement_1.recordUpOperationElementFactory(Participant.state, Participant.upOperation)),
    publicChannel1Name: replaceStringUpOperation,
    publicChannel2Name: replaceStringUpOperation,
    publicChannel3Name: replaceStringUpOperation,
    publicChannel4Name: replaceStringUpOperation,
    publicChannel5Name: replaceStringUpOperation,
    publicChannel6Name: replaceStringUpOperation,
    publicChannel7Name: replaceStringUpOperation,
    publicChannel8Name: replaceStringUpOperation,
    publicChannel9Name: replaceStringUpOperation,
    publicChannel10Name: replaceStringUpOperation,
    strParamNames: t.record(t.string, recordOperationElement_1.recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)),
});
const toClientState = (requestedBy) => (source) => {
    return Object.assign(Object.assign({}, source), { bgms: RecordOperation.toClientState({
            serverState: source.bgms,
            isPrivate: () => false,
            toClientState: ({ state }) => Bgm.toClientState(state),
        }), boolParamNames: RecordOperation.toClientState({
            serverState: source.boolParamNames,
            isPrivate: () => false,
            toClientState: ({ state }) => ParamNames.toClientState(state),
        }), numParamNames: RecordOperation.toClientState({
            serverState: source.numParamNames,
            isPrivate: () => false,
            toClientState: ({ state }) => ParamNames.toClientState(state),
        }), participants: RecordOperation.toClientState({
            serverState: source.participants,
            isPrivate: () => false,
            toClientState: ({ state, key }) => { var _a; return Participant.toClientState(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }), (_a = source.activeBoardKey) === null || _a === void 0 ? void 0 : _a.id)(state); },
        }), strParamNames: RecordOperation.toClientState({
            serverState: source.strParamNames,
            isPrivate: () => false,
            toClientState: ({ state }) => ParamNames.toClientState(state),
        }) });
};
exports.toClientState = toClientState;
const toClientOperation = (requestedBy) => ({ prevState, nextState, diff }) => {
    const nextActiveBoardKey = nextState.activeBoardKey;
    return Object.assign(Object.assign({}, diff), { bgms: diff.bgms == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.bgms,
            prevState: prevState.bgms,
            nextState: nextState.bgms,
            toClientState: ({ nextState }) => Bgm.toClientState(nextState),
            toClientOperation: (params) => Bgm.toClientOperation(params),
            isPrivate: () => false,
        }), boolParamNames: diff.boolParamNames == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.boolParamNames,
            prevState: prevState.boolParamNames,
            nextState: nextState.boolParamNames,
            toClientState: ({ nextState }) => ParamNames.toClientState(nextState),
            toClientOperation: (params) => ParamNames.toClientOperation(params),
            isPrivate: () => false,
        }), numParamNames: diff.numParamNames == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.numParamNames,
            prevState: prevState.numParamNames,
            nextState: nextState.numParamNames,
            toClientState: ({ nextState }) => ParamNames.toClientState(nextState),
            toClientOperation: (params) => ParamNames.toClientOperation(params),
            isPrivate: () => false,
        }), participants: diff.participants == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.participants,
            prevState: prevState.participants,
            nextState: nextState.participants,
            toClientState: ({ nextState, key }) => Participant.toClientState(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }), nextActiveBoardKey === null || nextActiveBoardKey === void 0 ? void 0 : nextActiveBoardKey.id)(nextState),
            toClientOperation: (params) => Participant.toClientOperation(type_1.RequestedBy.createdByMe({ requestedBy, userUid: params.key }), nextActiveBoardKey === null || nextActiveBoardKey === void 0 ? void 0 : nextActiveBoardKey.id)(params),
            isPrivate: () => false,
        }), strParamNames: diff.strParamNames == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.strParamNames,
            prevState: prevState.strParamNames,
            nextState: nextState.strParamNames,
            toClientState: ({ nextState }) => ParamNames.toClientState(nextState),
            toClientOperation: (params) => ParamNames.toClientOperation(params),
            isPrivate: () => false,
        }) });
};
exports.toClientOperation = toClientOperation;
const toDownOperation = (source) => {
    return Object.assign(Object.assign({}, source), { bgms: source.bgms == null ? undefined : utils_1.chooseRecord(source.bgms, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Bgm.toDownOperation,
        })), boolParamNames: source.boolParamNames == null ? undefined : utils_1.chooseRecord(source.boolParamNames, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toDownOperation,
        })), numParamNames: source.numParamNames == null ? undefined : utils_1.chooseRecord(source.numParamNames, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toDownOperation,
        })), participants: source.participants == null ? undefined : utils_1.chooseRecord(source.participants, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Participant.toDownOperation,
        })), strParamNames: source.strParamNames == null ? undefined : utils_1.chooseRecord(source.strParamNames, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toDownOperation,
        })) });
};
exports.toDownOperation = toDownOperation;
const toUpOperation = (source) => {
    return Object.assign(Object.assign({}, source), { bgms: source.bgms == null ? undefined : utils_1.chooseRecord(source.bgms, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Bgm.toUpOperation,
        })), boolParamNames: source.boolParamNames == null ? undefined : utils_1.chooseRecord(source.boolParamNames, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toUpOperation,
        })), numParamNames: source.numParamNames == null ? undefined : utils_1.chooseRecord(source.numParamNames, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toUpOperation,
        })), participants: source.participants == null ? undefined : utils_1.chooseRecord(source.participants, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Participant.toUpOperation,
        })), strParamNames: source.strParamNames == null ? undefined : utils_1.chooseRecord(source.strParamNames, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toUpOperation,
        })) });
};
exports.toUpOperation = toUpOperation;
const apply = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.activeBoardKey != null) {
        result.activeBoardKey = operation.activeBoardKey.newValue;
    }
    const bgms = RecordOperation.apply({
        prevState: state.bgms, operation: operation.bgms, innerApply: ({ prevState, operation }) => {
            return Bgm.apply({ state: prevState, operation });
        }
    });
    if (bgms.isError) {
        return bgms;
    }
    result.bgms = bgms.value;
    const boolParamNames = RecordOperation.apply({
        prevState: state.boolParamNames, operation: operation.boolParamNames, innerApply: ({ prevState, operation }) => {
            return ParamNames.apply({ state: prevState, operation });
        }
    });
    if (boolParamNames.isError) {
        return boolParamNames;
    }
    result.boolParamNames = boolParamNames.value;
    if (operation.name != null) {
        result.name = operation.name.newValue;
    }
    const numParamNames = RecordOperation.apply({
        prevState: state.numParamNames, operation: operation.numParamNames, innerApply: ({ prevState, operation }) => {
            return ParamNames.apply({ state: prevState, operation });
        }
    });
    if (numParamNames.isError) {
        return numParamNames;
    }
    result.numParamNames = numParamNames.value;
    const participants = RecordOperation.apply({
        prevState: state.participants, operation: operation.participants, innerApply: ({ prevState, operation }) => {
            return Participant.apply({ state: prevState, operation });
        }
    });
    if (participants.isError) {
        return participants;
    }
    result.participants = participants.value;
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
        const operationElement = operation[`publicChannel${i}Name`];
        if (operationElement != null) {
            result[`publicChannel${i}Name`] = operationElement.newValue;
        }
    });
    const strParamNames = RecordOperation.apply({
        prevState: state.strParamNames, operation: operation.strParamNames, innerApply: ({ prevState, operation }) => {
            return ParamNames.apply({ state: prevState, operation });
        }
    });
    if (strParamNames.isError) {
        return strParamNames;
    }
    result.strParamNames = strParamNames.value;
    return Result_1.ResultModule.ok(result);
};
exports.apply = apply;
const applyBack = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.activeBoardKey != null) {
        result.activeBoardKey = operation.activeBoardKey.oldValue;
    }
    const bgms = RecordOperation.applyBack({
        nextState: state.bgms, operation: operation.bgms, innerApplyBack: ({ state, operation }) => {
            return Bgm.applyBack({ state, operation });
        }
    });
    if (bgms.isError) {
        return bgms;
    }
    result.bgms = bgms.value;
    const boolParamNames = RecordOperation.applyBack({
        nextState: state.boolParamNames, operation: operation.boolParamNames, innerApplyBack: ({ state, operation }) => {
            return ParamNames.applyBack({ state, operation });
        }
    });
    if (boolParamNames.isError) {
        return boolParamNames;
    }
    result.boolParamNames = boolParamNames.value;
    if (operation.name != null) {
        result.name = operation.name.oldValue;
    }
    const numParamNames = RecordOperation.applyBack({
        nextState: state.numParamNames, operation: operation.numParamNames, innerApplyBack: ({ state, operation }) => {
            return ParamNames.applyBack({ state, operation });
        }
    });
    if (numParamNames.isError) {
        return numParamNames;
    }
    result.numParamNames = numParamNames.value;
    const participants = RecordOperation.applyBack({
        nextState: state.participants, operation: operation.participants, innerApplyBack: ({ state, operation }) => {
            return Participant.applyBack({ state, operation });
        }
    });
    if (participants.isError) {
        return participants;
    }
    result.participants = participants.value;
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
        const operationElement = operation[`publicChannel${i}Name`];
        if (operationElement != null) {
            result[`publicChannel${i}Name`] = operationElement.oldValue;
        }
    });
    const strParamNames = RecordOperation.applyBack({
        nextState: state.strParamNames, operation: operation.strParamNames, innerApplyBack: ({ state, operation }) => {
            return ParamNames.applyBack({ state, operation });
        }
    });
    if (strParamNames.isError) {
        return strParamNames;
    }
    result.strParamNames = strParamNames.value;
    return Result_1.ResultModule.ok(result);
};
exports.applyBack = applyBack;
const composeUpOperation = ({ first, second }) => {
    const bgms = RecordOperation.composeUpOperation({
        first: first.bgms,
        second: second.bgms,
        innerApply: params => Bgm.apply(params),
        innerCompose: params => Bgm.composeUpOperation(params),
    });
    if (bgms.isError) {
        return bgms;
    }
    const boolParamNames = RecordOperation.composeUpOperation({
        first: first.boolParamNames,
        second: second.boolParamNames,
        innerApply: params => ParamNames.apply(params),
        innerCompose: params => ParamNames.composeUpOperation(params),
    });
    if (boolParamNames.isError) {
        return boolParamNames;
    }
    const numParamNames = RecordOperation.composeUpOperation({
        first: first.numParamNames,
        second: second.numParamNames,
        innerApply: params => ParamNames.apply(params),
        innerCompose: params => ParamNames.composeUpOperation(params),
    });
    if (numParamNames.isError) {
        return numParamNames;
    }
    const strParamNames = RecordOperation.composeUpOperation({
        first: first.strParamNames,
        second: second.strParamNames,
        innerApply: params => ParamNames.apply(params),
        innerCompose: params => ParamNames.composeUpOperation(params),
    });
    if (strParamNames.isError) {
        return strParamNames;
    }
    const participants = RecordOperation.composeUpOperation({
        first: first.participants,
        second: second.participants,
        innerApply: params => Participant.apply(params),
        innerCompose: params => Participant.composeUpOperation(params),
    });
    if (participants.isError) {
        return participants;
    }
    const valueProps = {
        $version: 1,
        activeBoardKey: ReplaceOperation.composeUpOperation(first.activeBoardKey, second.activeBoardKey),
        name: ReplaceOperation.composeUpOperation(first.name, second.name),
        publicChannel1Name: ReplaceOperation.composeUpOperation(first.publicChannel1Name, second.publicChannel1Name),
        publicChannel2Name: ReplaceOperation.composeUpOperation(first.publicChannel2Name, second.publicChannel2Name),
        publicChannel3Name: ReplaceOperation.composeUpOperation(first.publicChannel3Name, second.publicChannel3Name),
        publicChannel4Name: ReplaceOperation.composeUpOperation(first.publicChannel4Name, second.publicChannel4Name),
        publicChannel5Name: ReplaceOperation.composeUpOperation(first.publicChannel5Name, second.publicChannel5Name),
        publicChannel6Name: ReplaceOperation.composeUpOperation(first.publicChannel6Name, second.publicChannel6Name),
        publicChannel7Name: ReplaceOperation.composeUpOperation(first.publicChannel7Name, second.publicChannel7Name),
        publicChannel8Name: ReplaceOperation.composeUpOperation(first.publicChannel8Name, second.publicChannel8Name),
        publicChannel9Name: ReplaceOperation.composeUpOperation(first.publicChannel9Name, second.publicChannel9Name),
        publicChannel10Name: ReplaceOperation.composeUpOperation(first.publicChannel10Name, second.publicChannel10Name),
        bgms: bgms.value,
        numParamNames: numParamNames.value,
        participants: participants.value,
    };
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeUpOperation = composeUpOperation;
const composeDownOperation = ({ first, second }) => {
    const bgms = RecordOperation.composeDownOperation({
        first: first.bgms,
        second: second.bgms,
        innerApplyBack: params => Bgm.applyBack(params),
        innerCompose: params => Bgm.composeDownOperation(params),
    });
    if (bgms.isError) {
        return bgms;
    }
    const boolParamNames = RecordOperation.composeDownOperation({
        first: first.boolParamNames,
        second: second.boolParamNames,
        innerApplyBack: params => ParamNames.applyBack(params),
        innerCompose: params => ParamNames.composeDownOperation(params),
    });
    if (boolParamNames.isError) {
        return boolParamNames;
    }
    const numParamNames = RecordOperation.composeDownOperation({
        first: first.numParamNames,
        second: second.numParamNames,
        innerApplyBack: params => ParamNames.applyBack(params),
        innerCompose: params => ParamNames.composeDownOperation(params),
    });
    if (numParamNames.isError) {
        return numParamNames;
    }
    const strParamNames = RecordOperation.composeDownOperation({
        first: first.strParamNames,
        second: second.strParamNames,
        innerApplyBack: params => ParamNames.applyBack(params),
        innerCompose: params => ParamNames.composeDownOperation(params),
    });
    if (strParamNames.isError) {
        return strParamNames;
    }
    const participants = RecordOperation.composeDownOperation({
        first: first.participants,
        second: second.participants,
        innerApplyBack: params => Participant.applyBack(params),
        innerCompose: params => Participant.composeDownOperation(params),
    });
    if (participants.isError) {
        return participants;
    }
    const valueProps = {
        $version: 1,
        activeBoardKey: ReplaceOperation.composeDownOperation(first.activeBoardKey, second.activeBoardKey),
        name: ReplaceOperation.composeDownOperation(first.name, second.name),
        publicChannel1Name: ReplaceOperation.composeDownOperation(first.publicChannel1Name, second.publicChannel1Name),
        publicChannel2Name: ReplaceOperation.composeDownOperation(first.publicChannel2Name, second.publicChannel2Name),
        publicChannel3Name: ReplaceOperation.composeDownOperation(first.publicChannel3Name, second.publicChannel3Name),
        publicChannel4Name: ReplaceOperation.composeDownOperation(first.publicChannel4Name, second.publicChannel4Name),
        publicChannel5Name: ReplaceOperation.composeDownOperation(first.publicChannel5Name, second.publicChannel5Name),
        publicChannel6Name: ReplaceOperation.composeDownOperation(first.publicChannel6Name, second.publicChannel6Name),
        publicChannel7Name: ReplaceOperation.composeDownOperation(first.publicChannel7Name, second.publicChannel7Name),
        publicChannel8Name: ReplaceOperation.composeDownOperation(first.publicChannel8Name, second.publicChannel8Name),
        publicChannel9Name: ReplaceOperation.composeDownOperation(first.publicChannel9Name, second.publicChannel9Name),
        publicChannel10Name: ReplaceOperation.composeDownOperation(first.publicChannel10Name, second.publicChannel10Name),
        bgms: bgms.value,
        numParamNames: numParamNames.value,
        participants: participants.value,
    };
    return Result_1.ResultModule.ok(valueProps);
};
exports.composeDownOperation = composeDownOperation;
const restore = ({ nextState, downOperation }) => {
    if (downOperation === undefined) {
        return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
    }
    const bgms = RecordOperation.restore({
        nextState: nextState.bgms,
        downOperation: downOperation.bgms,
        innerDiff: params => Bgm.diff(params),
        innerRestore: params => Bgm.restore(params),
    });
    if (bgms.isError) {
        return bgms;
    }
    const boolParamNames = RecordOperation.restore({
        nextState: nextState.boolParamNames,
        downOperation: downOperation.boolParamNames,
        innerDiff: params => ParamNames.diff(params),
        innerRestore: params => ParamNames.restore(params),
    });
    if (boolParamNames.isError) {
        return boolParamNames;
    }
    const numParamNames = RecordOperation.restore({
        nextState: nextState.numParamNames,
        downOperation: downOperation.numParamNames,
        innerDiff: params => ParamNames.diff(params),
        innerRestore: params => ParamNames.restore(params),
    });
    if (numParamNames.isError) {
        return numParamNames;
    }
    const strParamNames = RecordOperation.restore({
        nextState: nextState.strParamNames,
        downOperation: downOperation.strParamNames,
        innerDiff: params => ParamNames.diff(params),
        innerRestore: params => ParamNames.restore(params),
    });
    if (strParamNames.isError) {
        return strParamNames;
    }
    const participants = RecordOperation.restore({
        nextState: nextState.participants,
        downOperation: downOperation.participants,
        innerDiff: params => Participant.diff(params),
        innerRestore: params => Participant.restore(params),
    });
    if (participants.isError) {
        return participants;
    }
    const prevState = Object.assign(Object.assign({}, nextState), { bgms: bgms.value.prevState, boolParamNames: boolParamNames.value.prevState, numParamNames: numParamNames.value.prevState, strParamNames: strParamNames.value.prevState, participants: participants.value.prevState });
    const twoWayOperation = {
        $version: 1,
        bgms: bgms.value.twoWayOperation,
        boolParamNames: boolParamNames.value.twoWayOperation,
        numParamNames: numParamNames.value.twoWayOperation,
        strParamNames: strParamNames.value.twoWayOperation,
        participants: participants.value.twoWayOperation,
    };
    if (downOperation.activeBoardKey !== undefined) {
        prevState.activeBoardKey = downOperation.activeBoardKey.oldValue;
        twoWayOperation.activeBoardKey = Object.assign(Object.assign({}, downOperation.activeBoardKey), { newValue: nextState.activeBoardKey });
    }
    if (downOperation.name !== undefined) {
        prevState.name = downOperation.name.oldValue;
        twoWayOperation.name = Object.assign(Object.assign({}, downOperation.name), { newValue: nextState.name });
    }
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
        const key = `publicChannel${i}Name`;
        const downOperationValue = downOperation[key];
        if (downOperationValue !== undefined) {
            prevState[key] = downOperationValue.oldValue;
            twoWayOperation[key] = Object.assign(Object.assign({}, downOperationValue), { newValue: nextState[key] });
        }
    });
    return Result_1.ResultModule.ok({ prevState, twoWayOperation });
};
exports.restore = restore;
const diff = ({ prevState, nextState }) => {
    var _a, _b, _c, _d;
    const bgms = RecordOperation.diff({
        prevState: prevState.bgms,
        nextState: nextState.bgms,
        innerDiff: params => Bgm.diff(params),
    });
    const boolParamNames = RecordOperation.diff({
        prevState: prevState.boolParamNames,
        nextState: nextState.boolParamNames,
        innerDiff: params => ParamNames.diff(params),
    });
    const numParamNames = RecordOperation.diff({
        prevState: prevState.numParamNames,
        nextState: nextState.numParamNames,
        innerDiff: params => ParamNames.diff(params),
    });
    const strParamNames = RecordOperation.diff({
        prevState: prevState.strParamNames,
        nextState: nextState.strParamNames,
        innerDiff: params => ParamNames.diff(params),
    });
    const participants = RecordOperation.diff({
        prevState: prevState.participants,
        nextState: nextState.participants,
        innerDiff: params => Participant.diff(params),
    });
    const result = {
        $version: 1,
        bgms,
        boolParamNames,
        numParamNames,
        strParamNames,
        participants,
    };
    if (((_a = prevState.activeBoardKey) === null || _a === void 0 ? void 0 : _a.createdBy) !== ((_b = nextState.activeBoardKey) === null || _b === void 0 ? void 0 : _b.createdBy) || ((_c = prevState.activeBoardKey) === null || _c === void 0 ? void 0 : _c.id) !== ((_d = nextState.activeBoardKey) === null || _d === void 0 ? void 0 : _d.id)) {
        result.activeBoardKey = { oldValue: prevState.activeBoardKey, newValue: nextState.activeBoardKey };
    }
    if (prevState.name !== nextState.name) {
        result.name = { oldValue: prevState.name, newValue: nextState.name };
    }
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
        const key = `publicChannel${i}Name`;
        if (prevState[key] !== nextState[key]) {
            result[key] = { oldValue: prevState[key], newValue: nextState[key] };
        }
    });
    if (record_1.isIdRecord(result)) {
        return undefined;
    }
    return result;
};
exports.diff = diff;
const serverTransform = (requestedBy) => ({ prevState, currentState, clientOperation, serverOperation }) => {
    const currentActiveBoardKey = currentState.activeBoardKey;
    const bgms = RecordOperation.serverTransform({
        prevState: prevState.bgms,
        nextState: currentState.bgms,
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.bgms,
        second: clientOperation.bgms,
        innerTransform: ({ prevState, nextState, first, second }) => Bgm.serverTransform({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ key }) => !indexes_1.isStrIndex5(key),
        },
    });
    if (bgms.isError) {
        return bgms;
    }
    const boolParamNames = RecordOperation.serverTransform({
        prevState: prevState.boolParamNames,
        nextState: currentState.boolParamNames,
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.boolParamNames,
        second: clientOperation.boolParamNames,
        innerTransform: ({ prevState, nextState, first, second }) => ParamNames.serverTransform({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ key }) => !indexes_1.isStrIndex20(key),
        },
    });
    if (boolParamNames.isError) {
        return boolParamNames;
    }
    const numParamNames = RecordOperation.serverTransform({
        prevState: prevState.numParamNames,
        nextState: currentState.numParamNames,
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.numParamNames,
        second: clientOperation.numParamNames,
        innerTransform: ({ prevState, nextState, first, second }) => ParamNames.serverTransform({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ key }) => !indexes_1.isStrIndex20(key),
        },
    });
    if (numParamNames.isError) {
        return numParamNames;
    }
    const strParamNames = RecordOperation.serverTransform({
        prevState: prevState.strParamNames,
        nextState: currentState.strParamNames,
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.strParamNames,
        second: clientOperation.strParamNames,
        innerTransform: ({ prevState, nextState, first, second }) => ParamNames.serverTransform({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ key }) => !indexes_1.isStrIndex20(key),
        },
    });
    if (strParamNames.isError) {
        return strParamNames;
    }
    const participants = RecordOperation.serverTransform({
        prevState: prevState.participants,
        nextState: currentState.participants,
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.participants,
        second: clientOperation.participants,
        innerTransform: ({ prevState, nextState, first, second, key }) => Participant.serverTransform({ requestedBy, participantKey: key, activeBoardSecondKey: currentActiveBoardKey === null || currentActiveBoardKey === void 0 ? void 0 : currentActiveBoardKey.id })({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        cancellationPolicy: {},
    });
    if (participants.isError) {
        return participants;
    }
    const twoWayOperation = {
        $version: 1,
        bgms: bgms.value,
        boolParamNames: boolParamNames.value,
        numParamNames: numParamNames.value,
        strParamNames: strParamNames.value,
        participants: participants.value,
    };
    if (clientOperation.activeBoardKey != null) {
        if (clientOperation.activeBoardKey.newValue == null || type_1.RequestedBy.createdByMe({ requestedBy, userUid: clientOperation.activeBoardKey.newValue.createdBy })) {
            twoWayOperation.activeBoardKey = ReplaceOperation.serverTransform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.activeBoardKey,
                second: clientOperation.activeBoardKey,
                prevState: prevState.activeBoardKey,
            });
        }
    }
    twoWayOperation.name = ReplaceOperation.serverTransform({
        first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.name,
        second: clientOperation.name,
        prevState: prevState.name,
    });
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
        const key = `publicChannel${i}Name`;
        twoWayOperation[key] = ReplaceOperation.serverTransform({
            first: serverOperation == null ? undefined : serverOperation[key],
            second: clientOperation[key],
            prevState: prevState[key],
        });
    });
    if (record_1.isIdRecord(twoWayOperation)) {
        return Result_1.ResultModule.ok(undefined);
    }
    return Result_1.ResultModule.ok(twoWayOperation);
};
exports.serverTransform = serverTransform;
const clientTransform = ({ first, second }) => {
    const activeBoardKey = ReplaceOperation.clientTransform({
        first: first.activeBoardKey,
        second: second.activeBoardKey,
    });
    const bgms = RecordOperation.clientTransform({
        first: first.bgms,
        second: second.bgms,
        innerTransform: params => Bgm.clientTransform(params),
        innerDiff: params => {
            const diff = Bgm.diff(params);
            if (diff == null) {
                return diff;
            }
            return Bgm.toUpOperation(diff);
        },
    });
    if (bgms.isError) {
        return bgms;
    }
    const boolParamNames = RecordOperation.clientTransform({
        first: first.boolParamNames,
        second: second.boolParamNames,
        innerTransform: params => ParamNames.clientTransform(params),
        innerDiff: params => {
            const diff = ParamNames.diff(params);
            if (diff == null) {
                return diff;
            }
            return ParamNames.toUpOperation(diff);
        },
    });
    if (boolParamNames.isError) {
        return boolParamNames;
    }
    const numParamNames = RecordOperation.clientTransform({
        first: first.numParamNames,
        second: second.numParamNames,
        innerTransform: params => ParamNames.clientTransform(params),
        innerDiff: params => {
            const diff = ParamNames.diff(params);
            if (diff == null) {
                return diff;
            }
            return ParamNames.toUpOperation(diff);
        },
    });
    if (numParamNames.isError) {
        return numParamNames;
    }
    const strParamNames = RecordOperation.clientTransform({
        first: first.strParamNames,
        second: second.strParamNames,
        innerTransform: params => ParamNames.clientTransform(params),
        innerDiff: params => {
            const diff = ParamNames.diff(params);
            if (diff == null) {
                return diff;
            }
            return ParamNames.toUpOperation(diff);
        },
    });
    if (strParamNames.isError) {
        return strParamNames;
    }
    const participants = RecordOperation.clientTransform({
        first: first.participants,
        second: second.participants,
        innerTransform: params => Participant.clientTransform(params),
        innerDiff: params => {
            const diff = Participant.diff(params);
            if (diff == null) {
                return diff;
            }
            return Participant.toUpOperation(diff);
        },
    });
    if (participants.isError) {
        return participants;
    }
    const name = ReplaceOperation.clientTransform({
        first: first.name,
        second: second.name,
    });
    const firstPrime = {
        $version: 1,
        activeBoardKey: activeBoardKey.firstPrime,
        bgms: bgms.value.firstPrime,
        boolParamNames: boolParamNames.value.firstPrime,
        numParamNames: numParamNames.value.firstPrime,
        strParamNames: strParamNames.value.firstPrime,
        participants: participants.value.firstPrime,
        name: name.firstPrime,
    };
    const secondPrime = {
        $version: 1,
        activeBoardKey: activeBoardKey.secondPrime,
        boolParamNames: boolParamNames.value.secondPrime,
        numParamNames: numParamNames.value.secondPrime,
        strParamNames: strParamNames.value.secondPrime,
        participants: participants.value.secondPrime,
        name: name.secondPrime,
    };
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
        const key = `publicChannel${i}Name`;
        const operation = ReplaceOperation.clientTransform({
            first: first[key],
            second: second[key],
        });
        firstPrime[key] = operation.firstPrime;
        secondPrime[key] = operation.secondPrime;
    });
    return Result_1.ResultModule.ok({
        firstPrime: record_1.isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: record_1.isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
exports.clientTransform = clientTransform;
