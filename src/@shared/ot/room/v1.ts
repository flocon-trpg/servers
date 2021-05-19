import * as t from 'io-ts';
import { ResultModule } from '../../Result';
import * as Bgm from './bgm/v1';
import * as ParamNames from './paramName/v1';
import * as Participant from './participant/v1';
import * as RecordOperation from './util/recordOperation';
import { mapRecordOperationElement, recordDownOperationElementFactory, recordUpOperationElementFactory } from './util/recordOperationElement';
import * as ReplaceValueOperation from './util/replaceOperation';
import { TransformerFactory } from './util/transformerFactory';
import { Apply, RequestedBy, ToClientOperationParams } from './util/type';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '../../textOperation';
import { chooseRecord } from '../../utils';
import { operation } from './util/operation';
import { isIdRecord } from './util/record';

const replaceStringDownOperation = t.type({ oldValue: t.string });
const replaceStringUpOperation = t.type({ newValue: t.string });

export const dbState = t.type({
    $version: t.literal(1),

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

export type DbState = t.TypeOf<typeof dbState>;

export const state = t.intersection([dbState, t.type({
    name: t.string,
})]);

// nameはDBから頻繁に取得されると思われる値なので独立させている。
export type State = t.TypeOf<typeof state>;

export const downOperation = operation(1, {
    bgms: t.record(t.string, recordDownOperationElementFactory(Bgm.state, Bgm.downOperation)),
    boolParamNames: t.record(t.string, recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)),
    name: replaceStringDownOperation,
    numParamNames: t.record(t.string, recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)),
    participants: t.record(t.string, recordDownOperationElementFactory(Participant.state, Participant.downOperation)),
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
    strParamNames: t.record(t.string, recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)),
});

export type DownOperation = t.TypeOf<typeof downOperation>

export const upOperation = operation(1, {
    bgms: t.record(t.string, recordUpOperationElementFactory(Bgm.state, Bgm.upOperation)),
    boolParamNames: t.record(t.string, recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)),
    name: replaceStringUpOperation,
    numParamNames: t.record(t.string, recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)),
    participants: t.record(t.string, recordUpOperationElementFactory(Participant.state, Participant.upOperation)),
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
    strParamNames: t.record(t.string, recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)),
});

export type UpOperation = t.TypeOf<typeof upOperation>

export type TwoWayOperation = {
    $version: 1;

    bgms?: RecordOperation.RecordTwoWayOperation<Bgm.State, Bgm.TwoWayOperation>;
    boolParamNames?: RecordOperation.RecordTwoWayOperation<ParamNames.State, ParamNames.TwoWayOperation>;
    name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
    numParamNames?: RecordOperation.RecordTwoWayOperation<ParamNames.State, ParamNames.TwoWayOperation>;
    participants?: RecordOperation.RecordTwoWayOperation<Participant.State, Participant.TwoWayOperation>;
    publicChannel1Name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel2Name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel3Name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel4Name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel5Name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel6Name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel7Name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel8Name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel9Name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel10Name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
    strParamNames?: RecordOperation.RecordTwoWayOperation<ParamNames.State, ParamNames.TwoWayOperation>;
}

export const toClientState = (requestedBy: RequestedBy) => (source: State): State => {
    return {
        ...source,
        bgms: RecordOperation.toClientState({
            serverState: source.bgms,
            isPrivate: () => false,
            toClientState: ({ state }) => Bgm.toClientState(state),
        }),
        boolParamNames: RecordOperation.toClientState({
            serverState: source.boolParamNames,
            isPrivate: () => false,
            toClientState: ({ state }) => ParamNames.toClientState(state),
        }),
        numParamNames: RecordOperation.toClientState({
            serverState: source.numParamNames,
            isPrivate: () => false,
            toClientState: ({ state }) => ParamNames.toClientState(state),
        }),
        participants: RecordOperation.toClientState({
            serverState: source.participants,
            isPrivate: () => false,
            toClientState: ({ state, key }) => Participant.toClientState(RequestedBy.createdByMe({ requestedBy, userUid: key }))(state),
        }),
        strParamNames: RecordOperation.toClientState({
            serverState: source.strParamNames,
            isPrivate: () => false,
            toClientState: ({ state }) => ParamNames.toClientState(state),
        }),
    };
};

export const toServerOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        bgms: source.bgms == null ? undefined : chooseRecord(source.bgms, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Bgm.toServerOperation,
        })),
        boolParamNames: source.boolParamNames == null ? undefined : chooseRecord(source.boolParamNames, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toServerOperation,
        })),
        numParamNames: source.numParamNames == null ? undefined : chooseRecord(source.numParamNames, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toServerOperation,
        })),
        participants: source.participants == null ? undefined : chooseRecord(source.participants, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Participant.toServerOperation,
        })),
        strParamNames: source.strParamNames == null ? undefined : chooseRecord(source.strParamNames, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toServerOperation,
        })),
    };
};

export const toClientOperation = (requestedBy: RequestedBy) => ({ prevState, nextState, diff }: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return {
        ...diff,
        bgms: diff.bgms == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.bgms,
            prevState: prevState.bgms,
            nextState: nextState.bgms,
            toClientState: ({ nextState }) => Bgm.toClientState(nextState),
            toClientOperation: (params) => Bgm.toClientOperation(params),
            isPrivate: () => false,
        }),
        boolParamNames: diff.boolParamNames == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.boolParamNames,
            prevState: prevState.boolParamNames,
            nextState: nextState.boolParamNames,
            toClientState: ({ nextState }) => ParamNames.toClientState(nextState),
            toClientOperation: (params) => ParamNames.toClientOperation(params),
            isPrivate: () => false,
        }),
        numParamNames: diff.numParamNames == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.numParamNames,
            prevState: prevState.numParamNames,
            nextState: nextState.numParamNames,
            toClientState: ({ nextState }) => ParamNames.toClientState(nextState),
            toClientOperation: (params) => ParamNames.toClientOperation(params),
            isPrivate: () => false,
        }),
        participants: diff.participants == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.participants,
            prevState: prevState.participants,
            nextState: nextState.participants,
            toClientState: ({ nextState, key }) => Participant.toClientState(RequestedBy.createdByMe({ requestedBy, userUid: key }))(nextState),
            toClientOperation: (params) => Participant.toClientOperation(RequestedBy.createdByMe({ requestedBy, userUid: params.key }))(params),
            isPrivate: () => false,
        }),
        strParamNames: diff.strParamNames == null ? undefined : RecordOperation.toClientOperation({
            diff: diff.strParamNames,
            prevState: prevState.strParamNames,
            nextState: nextState.strParamNames,
            toClientState: ({ nextState }) => ParamNames.toClientState(nextState),
            toClientOperation: (params) => ParamNames.toClientOperation(params),
            isPrivate: () => false,
        }),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    const bgms = RecordOperation.apply<Bgm.State, Bgm.UpOperation | Bgm.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.bgms, operation: operation.bgms, innerApply: ({ prevState, operation: upOperation }) => {
            return Bgm.apply({ state: prevState, operation: upOperation });
        }
    });
    if (bgms.isError) {
        return bgms;
    }
    result.bgms = bgms.value;

    const boolParamNames = RecordOperation.apply<ParamNames.State, ParamNames.UpOperation | ParamNames.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
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

    const numParamNames = RecordOperation.apply<ParamNames.State, ParamNames.UpOperation | ParamNames.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.numParamNames, operation: operation.numParamNames, innerApply: ({ prevState, operation: upOperation }) => {
            return ParamNames.apply({ state: prevState, operation: upOperation });
        }
    });
    if (numParamNames.isError) {
        return numParamNames;
    }
    result.numParamNames = numParamNames.value;

    const participants = RecordOperation.apply<Participant.State, Participant.UpOperation | Participant.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.participants, operation: operation.participants, innerApply: ({ prevState, operation: upOperation }) => {
            return Participant.apply({ state: prevState, operation: upOperation });
        }
    });
    if (participants.isError) {
        return participants;
    }
    result.participants = participants.value;

    ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).forEach(i => {
        const operationElement = operation[`publicChannel${i}Name` as const];
        if (operationElement != null) {
            result[`publicChannel${i}Name` as const] = operationElement.newValue;
        }
    });

    const strParamNames = RecordOperation.apply<ParamNames.State, ParamNames.UpOperation | ParamNames.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.strParamNames, operation: operation.strParamNames, innerApply: ({ prevState, operation: upOperation }) => {
            return ParamNames.apply({ state: prevState, operation: upOperation });
        }
    });
    if (strParamNames.isError) {
        return strParamNames;
    }
    result.strParamNames = strParamNames.value;

    return ResultModule.ok(result);
};

const bgmTransformer = Bgm.transformerFactory;
const bgmsTransformer = new RecordOperation.RecordTransformer(bgmTransformer);
const paramNameTransformer = ParamNames.transformerFactory;
const paramNamesTransformer = new RecordOperation.RecordTransformer(paramNameTransformer);
const createParticipantTransformer = (operatedBy: RequestedBy) => Participant.transformerFactory(operatedBy);
const createParticipantsTransformer = (operatedBy: RequestedBy) => new RecordOperation.RecordTransformer(createParticipantTransformer(operatedBy));

export const transformerFactory = (operatedBy: RequestedBy): TransformerFactory<null, State, State, DownOperation, UpOperation, TwoWayOperation, ApplyError<PositiveInt> | ComposeAndTransformError> => ({
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

        const valueProps: DownOperation = {
            $version: 1,
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
        return ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
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

        const prevState: State = {
            ...nextState,
            bgms: bgms.value.prevState,
            boolParamNames: boolParamNames.value.prevState,
            numParamNames: numParamNames.value.prevState,
            strParamNames: strParamNames.value.prevState,
            participants: participants.value.prevState,
        };
        const twoWayOperation: TwoWayOperation = {
            $version: 1,
            bgms: bgms.value.twoWayOperation,
            boolParamNames: boolParamNames.value.twoWayOperation,
            numParamNames: numParamNames.value.twoWayOperation,
            strParamNames: strParamNames.value.twoWayOperation,
            participants: participants.value.twoWayOperation,
        };

        if (downOperation.name !== undefined) {
            prevState.name = downOperation.name.oldValue;
            twoWayOperation.name = { ...downOperation.name, newValue: nextState.name };
        }

        ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).forEach(i => {
            const key = `publicChannel${i}Name` as const;
            const downOperationValue = downOperation[key];
            if (downOperationValue !== undefined) {
                prevState[key] = downOperationValue.oldValue;
                twoWayOperation[key] = { ...downOperationValue, newValue: nextState[key] };
            }
        });

        return ResultModule.ok({ prevState, twoWayOperation });
    },
    transform: ({ prevState, currentState, clientOperation, serverOperation }) => {
        const bgms = bgmsTransformer.transform({
            prevState: prevState.bgms,
            currentState: currentState.bgms,
            clientOperation: clientOperation.bgms,
            serverOperation: serverOperation?.bgms,
        });
        if (bgms.isError) {
            return bgms;
        }

        const boolParamNames = paramNamesTransformer.transform({
            prevState: prevState.boolParamNames,
            currentState: currentState.boolParamNames,
            clientOperation: clientOperation.boolParamNames,
            serverOperation: serverOperation?.boolParamNames,
        });
        if (boolParamNames.isError) {
            return boolParamNames;
        }

        const numParamNames = paramNamesTransformer.transform({
            prevState: prevState.numParamNames,
            currentState: currentState.numParamNames,
            clientOperation: clientOperation.numParamNames,
            serverOperation: serverOperation?.numParamNames,
        });
        if (numParamNames.isError) {
            return numParamNames;
        }

        const strParamNames = paramNamesTransformer.transform({
            prevState: prevState.strParamNames,
            currentState: currentState.strParamNames,
            clientOperation: clientOperation.strParamNames,
            serverOperation: serverOperation?.strParamNames,
        });
        if (strParamNames.isError) {
            return strParamNames;
        }

        const participants = createParticipantsTransformer(operatedBy).transform({
            prevState: prevState.participants,
            currentState: currentState.participants,
            clientOperation: clientOperation.participants,
            serverOperation: serverOperation?.participants,
        });
        if (participants.isError) {
            return participants;
        }

        const twoWayOperation: TwoWayOperation = {
            $version: 1,
            bgms: bgms.value,
            boolParamNames: boolParamNames.value,
            numParamNames: numParamNames.value,
            strParamNames: strParamNames.value,
            participants: participants.value,
        };

        twoWayOperation.name = ReplaceValueOperation.transform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });

        ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).forEach(i => {
            const key = `publicChannel${i}Name` as const;
            twoWayOperation[key] = ReplaceValueOperation.transform({
                first: serverOperation == null ? undefined : serverOperation[key],
                second: clientOperation[key],
                prevState: prevState[key],
            });
        });

        if (isIdRecord(twoWayOperation)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(twoWayOperation);
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
        const result: TwoWayOperation = {
            $version: 1,
            bgms,
            boolParamNames,
            numParamNames,
            strParamNames,
            participants,
        };
        if (prevState.name !== nextState.name) {
            result.name = { oldValue: prevState.name, newValue: nextState.name };
        }
        ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).forEach(i => {
            const key = `publicChannel${i}Name` as const;
            if (prevState[key] !== nextState[key]) {
                result[key] = { oldValue: prevState[key], newValue: nextState[key] };
            }
        });
        if (isIdRecord(result)) {
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

        const result: State = {
            ...nextState,
            bgms: bgms.value,
            boolParamNames: boolParamNames.value,
            numParamNames: numParamNames.value,
            strParamNames: strParamNames.value,
            participants: participants.value,
        };

        if (downOperation.name !== undefined) {
            result.name = downOperation.name.oldValue;
        }

        ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).forEach(i => {
            const key = `publicChannel${i}Name` as const;
            const downOperationValue = downOperation[key];
            if (downOperationValue !== undefined) {
                result[key] = downOperationValue.oldValue;
            }
        });

        return ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {}
});