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
exports.transformerFactory = exports.apply = exports.toClientOperation = exports.toServerOperation = exports.toClientState = exports.upOperation = exports.downOperation = exports.state = exports.dbState = void 0;
const t = __importStar(require("io-ts"));
const Result_1 = require("../../Result");
const Bgm = __importStar(require("./bgm/v1"));
const ParamNames = __importStar(require("./paramName/v1"));
const Participant = __importStar(require("./participant/v1"));
const RecordOperation = __importStar(require("./util/recordOperation"));
const recordOperationElement_1 = require("./util/recordOperationElement");
const ReplaceValueOperation = __importStar(require("./util/replaceOperation"));
const type_1 = require("./util/type");
const utils_1 = require("../../utils");
const replaceStringDownOperation = t.type({ oldValue: t.string });
const replaceStringUpOperation = t.type({ newValue: t.string });
exports.dbState = t.type({
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
        name: t.string,
    })]);
exports.downOperation = t.partial({
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
exports.upOperation = t.partial({
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
            toClientState: ({ state, key }) => Participant.toClientState(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }))(state),
        }), strParamNames: RecordOperation.toClientState({
            serverState: source.strParamNames,
            isPrivate: () => false,
            toClientState: ({ state }) => ParamNames.toClientState(state),
        }) });
};
exports.toClientState = toClientState;
const toServerOperation = (source) => {
    return Object.assign(Object.assign({}, source), { bgms: source.bgms == null ? undefined : utils_1.chooseRecord(source.bgms, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Bgm.toServerOperation,
        })), boolParamNames: source.boolParamNames == null ? undefined : utils_1.chooseRecord(source.boolParamNames, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toServerOperation,
        })), numParamNames: source.numParamNames == null ? undefined : utils_1.chooseRecord(source.numParamNames, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toServerOperation,
        })), participants: source.participants == null ? undefined : utils_1.chooseRecord(source.participants, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Participant.toServerOperation,
        })), strParamNames: source.strParamNames == null ? undefined : utils_1.chooseRecord(source.strParamNames, operation => recordOperationElement_1.mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toServerOperation,
        })) });
};
exports.toServerOperation = toServerOperation;
const toClientOperation = (requestedBy) => ({ prevState, nextState, diff }) => {
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
            toClientState: ({ nextState, key }) => Participant.toClientState(type_1.RequestedBy.createdByMe({ requestedBy, userUid: key }))(nextState),
            toClientOperation: (params) => Participant.toClientOperation(type_1.RequestedBy.createdByMe({ requestedBy, userUid: params.key }))(params),
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
const apply = ({ state, operation }) => {
    const result = Object.assign({}, state);
    const bgms = RecordOperation.apply({
        prevState: state.bgms, operation: operation.bgms, innerApply: ({ prevState, operation: upOperation }) => {
            return Bgm.apply({ state: prevState, operation: upOperation });
        }
    });
    if (bgms.isError) {
        return bgms;
    }
    result.bgms = bgms.value;
    const boolParamNames = RecordOperation.apply({
        prevState: state.boolParamNames, operation: operation.boolParamNames, innerApply: ({ prevState, operation: upOperation }) => {
            return ParamNames.apply({ state: prevState, operation: upOperation });
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
        prevState: state.numParamNames, operation: operation.numParamNames, innerApply: ({ prevState, operation: upOperation }) => {
            return ParamNames.apply({ state: prevState, operation: upOperation });
        }
    });
    if (numParamNames.isError) {
        return numParamNames;
    }
    result.numParamNames = numParamNames.value;
    const participants = RecordOperation.apply({
        prevState: state.participants, operation: operation.participants, innerApply: ({ prevState, operation: upOperation }) => {
            return Participant.apply({ state: prevState, operation: upOperation });
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
        prevState: state.strParamNames, operation: operation.strParamNames, innerApply: ({ prevState, operation: upOperation }) => {
            return ParamNames.apply({ state: prevState, operation: upOperation });
        }
    });
    if (strParamNames.isError) {
        return strParamNames;
    }
    result.strParamNames = strParamNames.value;
    return Result_1.ResultModule.ok(result);
};
exports.apply = apply;
const bgmTransformer = Bgm.transformerFactory;
const bgmsTransformer = new RecordOperation.RecordTransformer(bgmTransformer);
const paramNameTransformer = ParamNames.transformerFactory;
const paramNamesTransformer = new RecordOperation.RecordTransformer(paramNameTransformer);
const createParticipantTransformer = (operatedBy) => Participant.transformerFactory(operatedBy);
const createParticipantsTransformer = (operatedBy) => new RecordOperation.RecordTransformer(createParticipantTransformer(operatedBy));
const transformerFactory = (operatedBy) => ({
    composeLoose: ({ first, second }) => {
        const bgms = bgmsTransformer.composeLoose({
            first: first.bgms,
            second: second.bgms,
        });
        if (bgms.isError) {
            return bgms;
        }
        const boolParamNames = paramNamesTransformer.composeLoose({
            first: first.boolParamNames,
            second: second.boolParamNames,
        });
        if (boolParamNames.isError) {
            return boolParamNames;
        }
        const numParamNames = paramNamesTransformer.composeLoose({
            first: first.numParamNames,
            second: second.numParamNames,
        });
        if (numParamNames.isError) {
            return numParamNames;
        }
        const strParamNames = paramNamesTransformer.composeLoose({
            first: first.strParamNames,
            second: second.strParamNames,
        });
        if (strParamNames.isError) {
            return strParamNames;
        }
        const participants = createParticipantsTransformer(operatedBy).composeLoose({
            first: first.participants,
            second: second.participants,
        });
        if (participants.isError) {
            return participants;
        }
        const valueProps = {
            name: ReplaceValueOperation.composeDownOperation(first.name, second.name),
            publicChannel1Name: ReplaceValueOperation.composeDownOperation(first.publicChannel1Name, second.publicChannel1Name),
            publicChannel2Name: ReplaceValueOperation.composeDownOperation(first.publicChannel2Name, second.publicChannel2Name),
            publicChannel3Name: ReplaceValueOperation.composeDownOperation(first.publicChannel3Name, second.publicChannel3Name),
            publicChannel4Name: ReplaceValueOperation.composeDownOperation(first.publicChannel4Name, second.publicChannel4Name),
            publicChannel5Name: ReplaceValueOperation.composeDownOperation(first.publicChannel5Name, second.publicChannel5Name),
            publicChannel6Name: ReplaceValueOperation.composeDownOperation(first.publicChannel6Name, second.publicChannel6Name),
            publicChannel7Name: ReplaceValueOperation.composeDownOperation(first.publicChannel7Name, second.publicChannel7Name),
            publicChannel8Name: ReplaceValueOperation.composeDownOperation(first.publicChannel8Name, second.publicChannel8Name),
            publicChannel9Name: ReplaceValueOperation.composeDownOperation(first.publicChannel9Name, second.publicChannel9Name),
            publicChannel10Name: ReplaceValueOperation.composeDownOperation(first.publicChannel10Name, second.publicChannel10Name),
            bgms: bgms.value,
            numParamNames: numParamNames.value,
            participants: participants.value,
        };
        return Result_1.ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }
        const bgms = bgmsTransformer.restore({
            nextState: nextState.bgms,
            downOperation: downOperation.bgms,
        });
        if (bgms.isError) {
            return bgms;
        }
        const boolParamNames = paramNamesTransformer.restore({
            nextState: nextState.boolParamNames,
            downOperation: downOperation.boolParamNames,
        });
        if (boolParamNames.isError) {
            return boolParamNames;
        }
        const numParamNames = paramNamesTransformer.restore({
            nextState: nextState.numParamNames,
            downOperation: downOperation.numParamNames,
        });
        if (numParamNames.isError) {
            return numParamNames;
        }
        const strParamNames = paramNamesTransformer.restore({
            nextState: nextState.strParamNames,
            downOperation: downOperation.strParamNames,
        });
        if (strParamNames.isError) {
            return strParamNames;
        }
        const participants = createParticipantsTransformer(operatedBy).restore({
            nextState: nextState.participants,
            downOperation: downOperation.participants,
        });
        if (participants.isError) {
            return participants;
        }
        const prevState = Object.assign(Object.assign({}, nextState), { bgms: bgms.value.prevState, boolParamNames: boolParamNames.value.prevState, numParamNames: numParamNames.value.prevState, strParamNames: strParamNames.value.prevState, participants: participants.value.prevState });
        const twoWayOperation = {
            bgms: bgms.value.twoWayOperation,
            boolParamNames: boolParamNames.value.twoWayOperation,
            numParamNames: numParamNames.value.twoWayOperation,
            strParamNames: strParamNames.value.twoWayOperation,
            participants: participants.value.twoWayOperation,
        };
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
    },
    transform: ({ prevState, currentState, clientOperation, serverOperation }) => {
        const bgms = bgmsTransformer.transform({
            prevState: prevState.bgms,
            currentState: currentState.bgms,
            clientOperation: clientOperation.bgms,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.bgms,
        });
        if (bgms.isError) {
            return bgms;
        }
        const boolParamNames = paramNamesTransformer.transform({
            prevState: prevState.boolParamNames,
            currentState: currentState.boolParamNames,
            clientOperation: clientOperation.boolParamNames,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.boolParamNames,
        });
        if (boolParamNames.isError) {
            return boolParamNames;
        }
        const numParamNames = paramNamesTransformer.transform({
            prevState: prevState.numParamNames,
            currentState: currentState.numParamNames,
            clientOperation: clientOperation.numParamNames,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.numParamNames,
        });
        if (numParamNames.isError) {
            return numParamNames;
        }
        const strParamNames = paramNamesTransformer.transform({
            prevState: prevState.strParamNames,
            currentState: currentState.strParamNames,
            clientOperation: clientOperation.strParamNames,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.strParamNames,
        });
        if (strParamNames.isError) {
            return strParamNames;
        }
        const participants = createParticipantsTransformer(operatedBy).transform({
            prevState: prevState.participants,
            currentState: currentState.participants,
            clientOperation: clientOperation.participants,
            serverOperation: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.participants,
        });
        if (participants.isError) {
            return participants;
        }
        const twoWayOperation = {
            bgms: bgms.value,
            boolParamNames: boolParamNames.value,
            numParamNames: numParamNames.value,
            strParamNames: strParamNames.value,
            participants: participants.value,
        };
        twoWayOperation.name = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
            const key = `publicChannel${i}Name`;
            twoWayOperation[key] = ReplaceValueOperation.transform({
                first: serverOperation == null ? undefined : serverOperation[key],
                second: clientOperation[key],
                prevState: prevState[key],
            });
        });
        if (utils_1.undefinedForAll(twoWayOperation)) {
            return Result_1.ResultModule.ok(undefined);
        }
        return Result_1.ResultModule.ok(twoWayOperation);
    },
    diff: ({ prevState, nextState }) => {
        const bgms = bgmsTransformer.diff({
            prevState: prevState.bgms,
            nextState: nextState.bgms,
        });
        const boolParamNames = paramNamesTransformer.diff({
            prevState: prevState.boolParamNames,
            nextState: nextState.boolParamNames,
        });
        const numParamNames = paramNamesTransformer.diff({
            prevState: prevState.numParamNames,
            nextState: nextState.numParamNames,
        });
        const strParamNames = paramNamesTransformer.diff({
            prevState: prevState.strParamNames,
            nextState: nextState.strParamNames,
        });
        const participants = createParticipantsTransformer(operatedBy).diff({
            prevState: prevState.participants,
            nextState: nextState.participants,
        });
        const result = {
            bgms,
            boolParamNames,
            numParamNames,
            strParamNames,
            participants,
        };
        if (prevState.name !== nextState.name) {
            result.name = { oldValue: prevState.name, newValue: nextState.name };
        }
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
            const key = `publicChannel${i}Name`;
            if (prevState[key] !== nextState[key]) {
                result[key] = { oldValue: prevState[key], newValue: nextState[key] };
            }
        });
        if (utils_1.undefinedForAll(result)) {
            return undefined;
        }
        return result;
    },
    applyBack: ({ downOperation, nextState }) => {
        const bgms = bgmsTransformer.applyBack({
            downOperation: downOperation.bgms,
            nextState: nextState.bgms,
        });
        if (bgms.isError) {
            return bgms;
        }
        const boolParamNames = paramNamesTransformer.applyBack({
            downOperation: downOperation.boolParamNames,
            nextState: nextState.boolParamNames,
        });
        if (boolParamNames.isError) {
            return boolParamNames;
        }
        const numParamNames = paramNamesTransformer.applyBack({
            downOperation: downOperation.numParamNames,
            nextState: nextState.numParamNames,
        });
        if (numParamNames.isError) {
            return numParamNames;
        }
        const strParamNames = paramNamesTransformer.applyBack({
            downOperation: downOperation.strParamNames,
            nextState: nextState.strParamNames,
        });
        if (strParamNames.isError) {
            return strParamNames;
        }
        const participants = createParticipantsTransformer(operatedBy).applyBack({
            downOperation: downOperation.participants,
            nextState: nextState.participants,
        });
        if (participants.isError) {
            return participants;
        }
        const result = Object.assign(Object.assign({}, nextState), { bgms: bgms.value, boolParamNames: boolParamNames.value, numParamNames: numParamNames.value, strParamNames: strParamNames.value, participants: participants.value });
        if (downOperation.name !== undefined) {
            result.name = downOperation.name.oldValue;
        }
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
            const key = `publicChannel${i}Name`;
            const downOperationValue = downOperation[key];
            if (downOperationValue !== undefined) {
                result[key] = downOperationValue.oldValue;
            }
        });
        return Result_1.ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {}
});
exports.transformerFactory = transformerFactory;
