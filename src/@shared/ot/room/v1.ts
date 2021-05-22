import * as t from 'io-ts';
import { ResultModule } from '../../Result';
import * as Bgm from './bgm/v1';
import * as ParamNames from './paramName/v1';
import * as Participant from './participant/v1';
import * as RecordOperation from './util/recordOperation';
import { mapRecordOperationElement, recordDownOperationElementFactory, recordUpOperationElementFactory } from './util/recordOperationElement';
import * as ReplaceOperation from './util/replaceOperation';
import { Apply, ClientTransform, Compose, Diff, RequestedBy, Restore, ServerTransform, ToClientOperationParams } from './util/type';
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
    createdBy: t.string,
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
    name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    numParamNames?: RecordOperation.RecordTwoWayOperation<ParamNames.State, ParamNames.TwoWayOperation>;
    participants?: RecordOperation.RecordTwoWayOperation<Participant.State, Participant.TwoWayOperation>;
    publicChannel1Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel2Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel3Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel4Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel5Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel6Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel7Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel8Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel9Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    publicChannel10Name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
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

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        bgms: source.bgms == null ? undefined : chooseRecord(source.bgms, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Bgm.toDownOperation,
        })),
        boolParamNames: source.boolParamNames == null ? undefined : chooseRecord(source.boolParamNames, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toDownOperation,
        })),
        numParamNames: source.numParamNames == null ? undefined : chooseRecord(source.numParamNames, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toDownOperation,
        })),
        participants: source.participants == null ? undefined : chooseRecord(source.participants, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Participant.toDownOperation,
        })),
        strParamNames: source.strParamNames == null ? undefined : chooseRecord(source.strParamNames, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toDownOperation,
        })),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        bgms: source.bgms == null ? undefined : chooseRecord(source.bgms, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Bgm.toUpOperation,
        })),
        boolParamNames: source.boolParamNames == null ? undefined : chooseRecord(source.boolParamNames, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toUpOperation,
        })),
        numParamNames: source.numParamNames == null ? undefined : chooseRecord(source.numParamNames, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toUpOperation,
        })),
        participants: source.participants == null ? undefined : chooseRecord(source.participants, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: Participant.toUpOperation,
        })),
        strParamNames: source.strParamNames == null ? undefined : chooseRecord(source.strParamNames, operation => mapRecordOperationElement({
            source: operation,
            mapReplace: x => x,
            mapOperation: ParamNames.toUpOperation,
        })),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    const bgms = RecordOperation.apply<Bgm.State, Bgm.UpOperation | Bgm.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.bgms, operation: operation.bgms, innerApply: ({ prevState, operation }) => {
            return Bgm.apply({ state: prevState, operation });
        }
    });
    if (bgms.isError) {
        return bgms;
    }
    result.bgms = bgms.value;

    const boolParamNames = RecordOperation.apply<ParamNames.State, ParamNames.UpOperation | ParamNames.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
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

    const numParamNames = RecordOperation.apply<ParamNames.State, ParamNames.UpOperation | ParamNames.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.numParamNames, operation: operation.numParamNames, innerApply: ({ prevState, operation }) => {
            return ParamNames.apply({ state: prevState, operation });
        }
    });
    if (numParamNames.isError) {
        return numParamNames;
    }
    result.numParamNames = numParamNames.value;

    const participants = RecordOperation.apply<Participant.State, Participant.UpOperation | Participant.TwoWayOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: state.participants, operation: operation.participants, innerApply: ({ prevState, operation }) => {
            return Participant.apply({ state: prevState, operation });
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
        prevState: state.strParamNames, operation: operation.strParamNames, innerApply: ({ prevState, operation }) => {
            return ParamNames.apply({ state: prevState, operation });
        }
    });
    if (strParamNames.isError) {
        return strParamNames;
    }
    result.strParamNames = strParamNames.value;

    return ResultModule.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    const bgms = RecordOperation.applyBack<Bgm.State, Bgm.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: state.bgms, operation: operation.bgms, innerApplyBack: ({ state, operation }) => {
            return Bgm.applyBack({ state, operation });
        }
    });
    if (bgms.isError) {
        return bgms;
    }
    result.bgms = bgms.value;

    const boolParamNames = RecordOperation.applyBack<ParamNames.State, ParamNames.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
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

    const numParamNames = RecordOperation.applyBack<ParamNames.State, ParamNames.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: state.numParamNames, operation: operation.numParamNames, innerApplyBack: ({ state, operation }) => {
            return ParamNames.applyBack({ state, operation });
        }
    });
    if (numParamNames.isError) {
        return numParamNames;
    }
    result.numParamNames = numParamNames.value;

    const participants = RecordOperation.applyBack<Participant.State, Participant.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: state.participants, operation: operation.participants, innerApplyBack: ({ state, operation }) => {
            return Participant.applyBack({ state, operation });
        }
    });
    if (participants.isError) {
        return participants;
    }
    result.participants = participants.value;

    ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).forEach(i => {
        const operationElement = operation[`publicChannel${i}Name` as const];
        if (operationElement != null) {
            result[`publicChannel${i}Name` as const] = operationElement.oldValue;
        }
    });

    const strParamNames = RecordOperation.applyBack<ParamNames.State, ParamNames.DownOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        nextState: state.strParamNames, operation: operation.strParamNames, innerApplyBack: ({ state, operation }) => {
            return ParamNames.applyBack({ state, operation });
        }
    });
    if (strParamNames.isError) {
        return strParamNames;
    }
    result.strParamNames = strParamNames.value;

    return ResultModule.ok(result);
};

export const composeUpOperation: Compose<UpOperation> = ({ first, second }) => {
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

    const valueProps: UpOperation = {
        $version: 1,
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
    return ResultModule.ok(valueProps);
};

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
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

    const valueProps: DownOperation = {
        $version: 1,
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
    return ResultModule.ok(valueProps);
};

export const restore: Restore<State, DownOperation, TwoWayOperation> = ({ nextState, downOperation }) => {
    if (downOperation === undefined) {
        return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
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
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
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
};

export const serverTransform = (requestedBy: RequestedBy): ServerTransform<State, TwoWayOperation, UpOperation> => ({ prevState, currentState, clientOperation, serverOperation }) => {
    const bgms = RecordOperation.serverTransform<Bgm.State, Bgm.State, Bgm.TwoWayOperation, Bgm.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: prevState.bgms,
        nextState: currentState.bgms,
        first: serverOperation?.bgms,
        second: clientOperation.bgms,
        innerTransform: ({ prevState, nextState, first, second }) => Bgm.serverTransform({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        protectedValuePolicy: {
        },
    });
    if (bgms.isError) {
        return bgms;
    }

    const boolParamNames = RecordOperation.serverTransform<ParamNames.State, ParamNames.State, ParamNames.TwoWayOperation, ParamNames.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: prevState.boolParamNames,
        nextState: currentState.boolParamNames,
        first: serverOperation?.boolParamNames,
        second: clientOperation.boolParamNames,
        innerTransform: ({ prevState, nextState, first, second }) => ParamNames.serverTransform({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        protectedValuePolicy: {
        },
    });
    if (boolParamNames.isError) {
        return boolParamNames;
    }

    const numParamNames = RecordOperation.serverTransform<ParamNames.State, ParamNames.State, ParamNames.TwoWayOperation, ParamNames.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: prevState.numParamNames,
        nextState: currentState.numParamNames,
        first: serverOperation?.numParamNames,
        second: clientOperation.numParamNames,
        innerTransform: ({ prevState, nextState, first, second }) => ParamNames.serverTransform({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        protectedValuePolicy: {
        },
    });
    if (numParamNames.isError) {
        return numParamNames;
    }

    const strParamNames = RecordOperation.serverTransform<ParamNames.State, ParamNames.State, ParamNames.TwoWayOperation, ParamNames.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: prevState.strParamNames,
        nextState: currentState.strParamNames,
        first: serverOperation?.strParamNames,
        second: clientOperation.strParamNames,
        innerTransform: ({ prevState, nextState, first, second }) => ParamNames.serverTransform({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        protectedValuePolicy: {
        },
    });
    if (strParamNames.isError) {
        return strParamNames;
    }

    const participants = RecordOperation.serverTransform<Participant.State, Participant.State, Participant.TwoWayOperation, Participant.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
        prevState: prevState.participants,
        nextState: currentState.participants,
        first: serverOperation?.participants,
        second: clientOperation.participants,
        innerTransform: ({ prevState, nextState, first, second, key }) => Participant.serverTransform(requestedBy, key)({
            prevState,
            currentState: nextState,
            serverOperation: first,
            clientOperation: second,
        }),
        toServerState: state => state,
        protectedValuePolicy: {
        },
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

    twoWayOperation.name = ReplaceOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: prevState.name,
    });

    ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).forEach(i => {
        const key = `publicChannel${i}Name` as const;
        twoWayOperation[key] = ReplaceOperation.serverTransform({
            first: serverOperation == null ? undefined : serverOperation[key],
            second: clientOperation[key],
            prevState: prevState[key],
        });
    });

    if (isIdRecord(twoWayOperation)) {
        return ResultModule.ok(undefined);
    }

    return ResultModule.ok(twoWayOperation);
};

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const bgms = RecordOperation.clientTransform<Bgm.State, Bgm.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
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

    const boolParamNames = RecordOperation.clientTransform<ParamNames.State, ParamNames.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
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

    const numParamNames = RecordOperation.clientTransform<ParamNames.State, ParamNames.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
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

    const strParamNames = RecordOperation.clientTransform<ParamNames.State, ParamNames.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
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

    const participants = RecordOperation.clientTransform<Participant.State, Participant.UpOperation, string | ApplyError<PositiveInt> | ComposeAndTransformError>({
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

    const firstPrime: UpOperation = {
        $version: 1,
        bgms: bgms.value.firstPrime,
        boolParamNames: boolParamNames.value.firstPrime,
        numParamNames: numParamNames.value.firstPrime,
        strParamNames: strParamNames.value.firstPrime,
        participants: participants.value.firstPrime,
        name: name.firstPrime,
    };

    const secondPrime: UpOperation = {
        $version: 1,
        bgms: bgms.value.secondPrime,
        boolParamNames: boolParamNames.value.secondPrime,
        numParamNames: numParamNames.value.secondPrime,
        strParamNames: strParamNames.value.secondPrime,
        participants: participants.value.secondPrime,
        name: name.secondPrime,
    };

    ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).forEach(i => {
        const key = `publicChannel${i}Name` as const;
        const operation = ReplaceOperation.clientTransform({
            first: first[key],
            second: second[key],
        });
        firstPrime[key] = operation.firstPrime;
        secondPrime[key] = operation.secondPrime;
    });

    return ResultModule.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};