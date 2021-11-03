import * as Bgm from './bgm/functions';
import * as BgmTypes from './bgm/types';
import * as Memo from './memo/functions';
import * as MemoTypes from './memo/types';
import * as ParamNames from './paramName/functions';
import * as ParamNamesTypes from './paramName/types';
import * as Participant from './participant/functions';
import * as ParticipantTypes from './participant/types';
import * as RecordOperation from '../util/recordOperation';
import { mapRecordOperationElement } from '../util/recordOperationElement';
import * as ReplaceOperation from '../util/replaceOperation';
import * as TextOperation from '../util/textOperation';
import {
    Apply,
    client,
    ClientTransform,
    Compose,
    Diff,
    RequestedBy,
    Restore,
    ServerTransform,
} from '../util/type';
import { isIdRecord } from '../util/record';
import { Result } from '@kizahasi/result';
import { ApplyError, PositiveInt, ComposeAndTransformError } from '@kizahasi/ot-string';
import { chooseRecord } from '@kizahasi/util';
import { isStrIndex20, isStrIndex5 } from '../../indexes';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';

export const toClientState =
    (requestedBy: RequestedBy) =>
    (source: State): State => {
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
            memos: RecordOperation.toClientState({
                serverState: source.memos,
                isPrivate: () => false,
                toClientState: ({ state }) => Memo.toClientState(state),
            }),
            numParamNames: RecordOperation.toClientState({
                serverState: source.numParamNames,
                isPrivate: () => false,
                toClientState: ({ state }) => ParamNames.toClientState(state),
            }),
            participants: RecordOperation.toClientState({
                serverState: source.participants,
                isPrivate: () => false,
                toClientState: ({ state, key }) =>
                    Participant.toClientState(
                        requestedBy,
                        key,
                        source.activeBoardKey ?? null
                    )(state),
            }),
            strParamNames: RecordOperation.toClientState({
                serverState: source.strParamNames,
                isPrivate: () => false,
                toClientState: ({ state }) => ParamNames.toClientState(state),
            }),
        };
    };

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        bgms:
            source.bgms == null
                ? undefined
                : chooseRecord(source.bgms, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Bgm.toDownOperation,
                      })
                  ),
        boolParamNames:
            source.boolParamNames == null
                ? undefined
                : chooseRecord(source.boolParamNames, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: ParamNames.toDownOperation,
                      })
                  ),
        memos:
            source.memos == null
                ? undefined
                : chooseRecord(source.memos, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Memo.toDownOperation,
                      })
                  ),
        name: source.name == null ? undefined : TextOperation.toDownOperation(source.name),
        numParamNames:
            source.numParamNames == null
                ? undefined
                : chooseRecord(source.numParamNames, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: ParamNames.toDownOperation,
                      })
                  ),
        participants:
            source.participants == null
                ? undefined
                : chooseRecord(source.participants, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Participant.toDownOperation,
                      })
                  ),
        publicChannel1Name:
            source.publicChannel1Name == null
                ? undefined
                : TextOperation.toDownOperation(source.publicChannel1Name),
        publicChannel2Name:
            source.publicChannel2Name == null
                ? undefined
                : TextOperation.toDownOperation(source.publicChannel2Name),
        publicChannel3Name:
            source.publicChannel3Name == null
                ? undefined
                : TextOperation.toDownOperation(source.publicChannel3Name),
        publicChannel4Name:
            source.publicChannel4Name == null
                ? undefined
                : TextOperation.toDownOperation(source.publicChannel4Name),
        publicChannel5Name:
            source.publicChannel5Name == null
                ? undefined
                : TextOperation.toDownOperation(source.publicChannel5Name),
        publicChannel6Name:
            source.publicChannel6Name == null
                ? undefined
                : TextOperation.toDownOperation(source.publicChannel6Name),
        publicChannel7Name:
            source.publicChannel7Name == null
                ? undefined
                : TextOperation.toDownOperation(source.publicChannel7Name),
        publicChannel8Name:
            source.publicChannel8Name == null
                ? undefined
                : TextOperation.toDownOperation(source.publicChannel8Name),
        publicChannel9Name:
            source.publicChannel9Name == null
                ? undefined
                : TextOperation.toDownOperation(source.publicChannel9Name),
        publicChannel10Name:
            source.publicChannel10Name == null
                ? undefined
                : TextOperation.toDownOperation(source.publicChannel10Name),
        strParamNames:
            source.strParamNames == null
                ? undefined
                : chooseRecord(source.strParamNames, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: ParamNames.toDownOperation,
                      })
                  ),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        bgms:
            source.bgms == null
                ? undefined
                : chooseRecord(source.bgms, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Bgm.toUpOperation,
                      })
                  ),
        boolParamNames:
            source.boolParamNames == null
                ? undefined
                : chooseRecord(source.boolParamNames, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: ParamNames.toUpOperation,
                      })
                  ),
        memos:
            source.memos == null
                ? undefined
                : chooseRecord(source.memos, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Memo.toUpOperation,
                      })
                  ),
        name: source.name == null ? undefined : TextOperation.toUpOperation(source.name),
        numParamNames:
            source.numParamNames == null
                ? undefined
                : chooseRecord(source.numParamNames, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: ParamNames.toUpOperation,
                      })
                  ),
        participants:
            source.participants == null
                ? undefined
                : chooseRecord(source.participants, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Participant.toUpOperation,
                      })
                  ),
        publicChannel1Name:
            source.publicChannel1Name == null
                ? undefined
                : TextOperation.toUpOperation(source.publicChannel1Name),
        publicChannel2Name:
            source.publicChannel2Name == null
                ? undefined
                : TextOperation.toUpOperation(source.publicChannel2Name),
        publicChannel3Name:
            source.publicChannel3Name == null
                ? undefined
                : TextOperation.toUpOperation(source.publicChannel3Name),
        publicChannel4Name:
            source.publicChannel4Name == null
                ? undefined
                : TextOperation.toUpOperation(source.publicChannel4Name),
        publicChannel5Name:
            source.publicChannel5Name == null
                ? undefined
                : TextOperation.toUpOperation(source.publicChannel5Name),
        publicChannel6Name:
            source.publicChannel6Name == null
                ? undefined
                : TextOperation.toUpOperation(source.publicChannel6Name),
        publicChannel7Name:
            source.publicChannel7Name == null
                ? undefined
                : TextOperation.toUpOperation(source.publicChannel7Name),
        publicChannel8Name:
            source.publicChannel8Name == null
                ? undefined
                : TextOperation.toUpOperation(source.publicChannel8Name),
        publicChannel9Name:
            source.publicChannel9Name == null
                ? undefined
                : TextOperation.toUpOperation(source.publicChannel9Name),
        publicChannel10Name:
            source.publicChannel10Name == null
                ? undefined
                : TextOperation.toUpOperation(source.publicChannel10Name),
        strParamNames:
            source.strParamNames == null
                ? undefined
                : chooseRecord(source.strParamNames, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: ParamNames.toUpOperation,
                      })
                  ),
    };
};

export const apply: Apply<State, UpOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    if (operation.activeBoardKey != null) {
        result.activeBoardKey = operation.activeBoardKey.newValue;
    }

    const bgms = RecordOperation.apply<
        BgmTypes.State,
        BgmTypes.UpOperation | BgmTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.bgms,
        operation: operation.bgms,
        innerApply: ({ prevState, operation }) => {
            return Bgm.apply({ state: prevState, operation });
        },
    });
    if (bgms.isError) {
        return bgms;
    }
    result.bgms = bgms.value;

    const boolParamNames = RecordOperation.apply<
        ParamNamesTypes.State,
        ParamNamesTypes.UpOperation | ParamNamesTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.boolParamNames,
        operation: operation.boolParamNames,
        innerApply: ({ prevState, operation }) => {
            return ParamNames.apply({ state: prevState, operation });
        },
    });
    if (boolParamNames.isError) {
        return boolParamNames;
    }
    result.boolParamNames = boolParamNames.value;

    if (operation.name != null) {
        const applied = TextOperation.apply(state.name, operation.name);
        if (applied.isError) {
            return applied;
        }
        result.name = applied.value;
    }

    const numParamNames = RecordOperation.apply<
        ParamNamesTypes.State,
        ParamNamesTypes.UpOperation | ParamNamesTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.numParamNames,
        operation: operation.numParamNames,
        innerApply: ({ prevState, operation }) => {
            return ParamNames.apply({ state: prevState, operation });
        },
    });
    if (numParamNames.isError) {
        return numParamNames;
    }
    result.numParamNames = numParamNames.value;

    const memo = RecordOperation.apply<
        MemoTypes.State,
        MemoTypes.UpOperation | MemoTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.memos,
        operation: operation.memos,
        innerApply: ({ prevState, operation }) => {
            return Memo.apply({ state: prevState, operation });
        },
    });
    if (memo.isError) {
        return memo;
    }
    result.memos = memo.value;

    const participants = RecordOperation.apply<
        ParticipantTypes.State,
        ParticipantTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.participants,
        operation: operation.participants,
        innerApply: ({ prevState, operation }) => {
            return Participant.apply({ state: prevState, operation });
        },
    });
    if (participants.isError) {
        return participants;
    }
    result.participants = participants.value;

    for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
        const key = `publicChannel${i}Name` as const;
        const operationElement = operation[key];
        if (operationElement != null) {
            const applied = TextOperation.apply(state[key], operationElement);
            if (applied.isError) {
                return applied;
            }
            result[key] = applied.value;
        }
    }

    const strParamNames = RecordOperation.apply<
        ParamNamesTypes.State,
        ParamNamesTypes.UpOperation | ParamNamesTypes.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.strParamNames,
        operation: operation.strParamNames,
        innerApply: ({ prevState, operation }) => {
            return ParamNames.apply({ state: prevState, operation });
        },
    });
    if (strParamNames.isError) {
        return strParamNames;
    }
    result.strParamNames = strParamNames.value;

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    if (operation.activeBoardKey != null) {
        result.activeBoardKey = operation.activeBoardKey.oldValue;
    }

    const bgms = RecordOperation.applyBack<
        BgmTypes.State,
        BgmTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.bgms,
        operation: operation.bgms,
        innerApplyBack: ({ state, operation }) => {
            return Bgm.applyBack({ state, operation });
        },
    });
    if (bgms.isError) {
        return bgms;
    }
    result.bgms = bgms.value;

    const boolParamNames = RecordOperation.applyBack<
        ParamNamesTypes.State,
        ParamNamesTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.boolParamNames,
        operation: operation.boolParamNames,
        innerApplyBack: ({ state, operation }) => {
            return ParamNames.applyBack({ state, operation });
        },
    });
    if (boolParamNames.isError) {
        return boolParamNames;
    }
    result.boolParamNames = boolParamNames.value;

    if (operation.name != null) {
        const applied = TextOperation.applyBack(state.name, operation.name);
        if (applied.isError) {
            return applied;
        }
        result.name = applied.value;
    }

    const numParamNames = RecordOperation.applyBack<
        ParamNamesTypes.State,
        ParamNamesTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.numParamNames,
        operation: operation.numParamNames,
        innerApplyBack: ({ state, operation }) => {
            return ParamNames.applyBack({ state, operation });
        },
    });
    if (numParamNames.isError) {
        return numParamNames;
    }
    result.numParamNames = numParamNames.value;

    const memo = RecordOperation.applyBack<
        MemoTypes.State,
        MemoTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.memos,
        operation: operation.memos,
        innerApplyBack: ({ state, operation }) => {
            return Memo.applyBack({ state, operation });
        },
    });
    if (memo.isError) {
        return memo;
    }
    result.memos = memo.value;

    const participants = RecordOperation.applyBack<
        ParticipantTypes.State,
        ParticipantTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.participants,
        operation: operation.participants,
        innerApplyBack: ({ state, operation }) => {
            return Participant.applyBack({ state, operation });
        },
    });
    if (participants.isError) {
        return participants;
    }
    result.participants = participants.value;

    for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
        const key = `publicChannel${i}Name` as const;
        const operationElement = operation[key];
        if (operationElement != null) {
            const applied = TextOperation.applyBack(state[key], operationElement);
            if (applied.isError) {
                return applied;
            }
            result[key] = applied.value;
        }
    }

    const strParamNames = RecordOperation.applyBack<
        ParamNamesTypes.State,
        ParamNamesTypes.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.strParamNames,
        operation: operation.strParamNames,
        innerApplyBack: ({ state, operation }) => {
            return ParamNames.applyBack({ state, operation });
        },
    });
    if (strParamNames.isError) {
        return strParamNames;
    }
    result.strParamNames = strParamNames.value;

    return Result.ok(result);
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

    const memo = RecordOperation.composeDownOperation({
        first: first.memos,
        second: second.memos,
        innerApplyBack: params => Memo.applyBack(params),
        innerCompose: params => Memo.composeDownOperation(params),
    });
    if (memo.isError) {
        return memo;
    }

    const name = TextOperation.composeDownOperation(first.name, second.name);
    if (name.isError) {
        return name;
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
        $v: 1,
        $r: 2,
        activeBoardKey: ReplaceOperation.composeDownOperation(
            first.activeBoardKey,
            second.activeBoardKey
        ),
        name: name.value,
        bgms: bgms.value,
        boolParamNames: boolParamNames.value,
        memos: memo.value,
        numParamNames: numParamNames.value,
        strParamNames: strParamNames.value,
        participants: participants.value,
    };

    for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
        const key = `publicChannel${i}Name` as const;
        const composed = TextOperation.composeDownOperation(first[key], second[key]);
        if (composed.isError) {
            return composed;
        }
        valueProps[key] = composed.value;
    }
    return Result.ok(valueProps);
};

export const restore: Restore<State, DownOperation, TwoWayOperation> = ({
    nextState,
    downOperation,
}) => {
    if (downOperation === undefined) {
        return Result.ok({ prevState: nextState, twoWayOperation: undefined });
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

    const memo = RecordOperation.restore({
        nextState: nextState.memos,
        downOperation: downOperation.memos,
        innerDiff: params => Memo.diff(params),
        innerRestore: params => Memo.restore(params),
    });
    if (memo.isError) {
        return memo;
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
        memos: memo.value.prevState,
        numParamNames: numParamNames.value.prevState,
        strParamNames: strParamNames.value.prevState,
        participants: participants.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $v: 1,
        $r: 2,
        bgms: bgms.value.twoWayOperation,
        boolParamNames: boolParamNames.value.twoWayOperation,
        memos: memo.value.twoWayOperation,
        numParamNames: numParamNames.value.twoWayOperation,
        strParamNames: strParamNames.value.twoWayOperation,
        participants: participants.value.twoWayOperation,
    };

    if (downOperation.activeBoardKey !== undefined) {
        prevState.activeBoardKey = downOperation.activeBoardKey.oldValue;
        twoWayOperation.activeBoardKey = {
            ...downOperation.activeBoardKey,
            newValue: nextState.activeBoardKey,
        };
    }

    if (downOperation.name !== undefined) {
        const restored = TextOperation.restore({
            nextState: nextState.name,
            downOperation: downOperation.name,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.name = restored.value.prevState;
        twoWayOperation.name = restored.value.twoWayOperation;
    }

    for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
        const key = `publicChannel${i}Name` as const;
        const downOperationValue = downOperation[key];
        if (downOperationValue !== undefined) {
            const restored = TextOperation.restore({
                nextState: nextState[key],
                downOperation: downOperationValue,
            });
            if (restored.isError) {
                return restored;
            }
            prevState[key] = restored.value.prevState;
            twoWayOperation[key] = restored.value.twoWayOperation;
        }
    }

    return Result.ok({ prevState, twoWayOperation });
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
    const memo = RecordOperation.diff({
        prevState: prevState.memos,
        nextState: nextState.memos,
        innerDiff: params => Memo.diff(params),
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
        $v: 1,
        $r: 2,
        bgms,
        boolParamNames,
        memos: memo,
        numParamNames,
        strParamNames,
        participants,
    };
    if (
        prevState.activeBoardKey?.createdBy !== nextState.activeBoardKey?.createdBy ||
        prevState.activeBoardKey?.id !== nextState.activeBoardKey?.id
    ) {
        result.activeBoardKey = {
            oldValue: prevState.activeBoardKey,
            newValue: nextState.activeBoardKey,
        };
    }
    if (prevState.name !== nextState.name) {
        result.name = TextOperation.diff({ prev: prevState.name, next: nextState.name });
    }
    for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
        const key = `publicChannel${i}Name` as const;
        if (prevState[key] !== nextState[key]) {
            result[key] = TextOperation.diff({ prev: prevState[key], next: nextState[key] });
        }
    }
    if (isIdRecord(result)) {
        return undefined;
    }
    return result;
};

export const serverTransform =
    (requestedBy: RequestedBy): ServerTransform<State, TwoWayOperation, UpOperation> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        if (requestedBy.type === client) {
            const me = currentState.participants[requestedBy.userUid];
            if (me == null || me.role == null || me.role === ParticipantTypes.Spectator) {
                // エラーを返すべきかもしれない
                return Result.ok(undefined);
            }
        }

        const currentActiveBoardKey = currentState.activeBoardKey;

        const bgms = RecordOperation.serverTransform<
            BgmTypes.State,
            BgmTypes.State,
            BgmTypes.TwoWayOperation,
            BgmTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            prevState: prevState.bgms,
            nextState: currentState.bgms,
            first: serverOperation?.bgms,
            second: clientOperation.bgms,
            innerTransform: ({ prevState, nextState, first, second }) =>
                Bgm.serverTransform({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ key }) => !isStrIndex5(key),
            },
        });
        if (bgms.isError) {
            return bgms;
        }

        const boolParamNames = RecordOperation.serverTransform<
            ParamNamesTypes.State,
            ParamNamesTypes.State,
            ParamNamesTypes.TwoWayOperation,
            ParamNamesTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            prevState: prevState.boolParamNames,
            nextState: currentState.boolParamNames,
            first: serverOperation?.boolParamNames,
            second: clientOperation.boolParamNames,
            innerTransform: ({ prevState, nextState, first, second }) =>
                ParamNames.serverTransform({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ key }) => !isStrIndex20(key),
            },
        });
        if (boolParamNames.isError) {
            return boolParamNames;
        }

        // TODO: ファイルサイズが巨大になりそうなときに拒否する機能
        const memos = RecordOperation.serverTransform<
            MemoTypes.State,
            MemoTypes.State,
            MemoTypes.TwoWayOperation,
            MemoTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            prevState: prevState.memos,
            nextState: currentState.memos,
            first: serverOperation?.memos,
            second: clientOperation.memos,
            innerTransform: ({ prevState, nextState, first, second }) =>
                Memo.serverTransform({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {},
        });
        if (memos.isError) {
            return memos;
        }

        const numParamNames = RecordOperation.serverTransform<
            ParamNamesTypes.State,
            ParamNamesTypes.State,
            ParamNamesTypes.TwoWayOperation,
            ParamNamesTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            prevState: prevState.numParamNames,
            nextState: currentState.numParamNames,
            first: serverOperation?.numParamNames,
            second: clientOperation.numParamNames,
            innerTransform: ({ prevState, nextState, first, second }) =>
                ParamNames.serverTransform({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ key }) => !isStrIndex20(key),
            },
        });
        if (numParamNames.isError) {
            return numParamNames;
        }

        const strParamNames = RecordOperation.serverTransform<
            ParamNamesTypes.State,
            ParamNamesTypes.State,
            ParamNamesTypes.TwoWayOperation,
            ParamNamesTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            prevState: prevState.strParamNames,
            nextState: currentState.strParamNames,
            first: serverOperation?.strParamNames,
            second: clientOperation.strParamNames,
            innerTransform: ({ prevState, nextState, first, second }) =>
                ParamNames.serverTransform({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ key }) => !isStrIndex20(key),
            },
        });
        if (strParamNames.isError) {
            return strParamNames;
        }

        const participants = RecordOperation.serverTransform<
            ParticipantTypes.State,
            ParticipantTypes.State,
            ParticipantTypes.TwoWayOperation,
            ParticipantTypes.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            prevState: prevState.participants,
            nextState: currentState.participants,
            first: serverOperation?.participants,
            second: clientOperation.participants,
            innerTransform: ({ prevState, nextState, first, second, key }) =>
                Participant.serverTransform({
                    requestedBy,
                    participantKey: key,
                    activeBoardKey: currentActiveBoardKey ?? null,
                })({
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

        const twoWayOperation: TwoWayOperation = {
            $v: 1,
            $r: 2,
            bgms: bgms.value,
            boolParamNames: boolParamNames.value,
            memos: memos.value,
            numParamNames: numParamNames.value,
            strParamNames: strParamNames.value,
            participants: participants.value,
        };

        // activeBoardKeyには、自分が作成したBoardしか設定できない。ただし、nullishにするのは誰でもできる。
        if (clientOperation.activeBoardKey != null) {
            if (
                clientOperation.activeBoardKey.newValue == null ||
                RequestedBy.isAuthorized({
                    requestedBy,
                    userUid: clientOperation.activeBoardKey.newValue.createdBy,
                })
            ) {
                twoWayOperation.activeBoardKey = ReplaceOperation.serverTransform({
                    first: serverOperation?.activeBoardKey,
                    second: clientOperation.activeBoardKey,
                    prevState: prevState.activeBoardKey,
                });
            }
        }

        const name = TextOperation.serverTransform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });
        if (name.isError) {
            return name;
        }
        twoWayOperation.name = name.value.secondPrime;

        for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
            const key = `publicChannel${i}Name` as const;
            const transformed = TextOperation.serverTransform({
                first: serverOperation?.[key],
                second: clientOperation[key],
                prevState: prevState[key],
            });
            if (transformed.isError) {
                return transformed;
            }
            twoWayOperation[key] = transformed.value.secondPrime;
        }

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const activeBoardKey = ReplaceOperation.clientTransform({
        first: first.activeBoardKey,
        second: second.activeBoardKey,
    });

    const bgms = RecordOperation.clientTransform<
        BgmTypes.State,
        BgmTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
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

    const boolParamNames = RecordOperation.clientTransform<
        ParamNamesTypes.State,
        ParamNamesTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
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

    const memos = RecordOperation.clientTransform<
        MemoTypes.State,
        MemoTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.memos,
        second: second.memos,
        innerTransform: params => Memo.clientTransform(params),
        innerDiff: params => {
            const diff = Memo.diff(params);
            if (diff == null) {
                return diff;
            }
            return Memo.toUpOperation(diff);
        },
    });
    if (memos.isError) {
        return memos;
    }

    const numParamNames = RecordOperation.clientTransform<
        ParamNamesTypes.State,
        ParamNamesTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
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

    const strParamNames = RecordOperation.clientTransform<
        ParamNamesTypes.State,
        ParamNamesTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
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

    const participants = RecordOperation.clientTransform<
        ParticipantTypes.State,
        ParticipantTypes.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
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

    const name = TextOperation.clientTransform({
        first: first.name,
        second: second.name,
    });
    if (name.isError) {
        return name;
    }

    const firstPrime: UpOperation = {
        $v: 1,
        $r: 2,
        activeBoardKey: activeBoardKey.firstPrime,
        bgms: bgms.value.firstPrime,
        boolParamNames: boolParamNames.value.firstPrime,
        memos: memos.value.firstPrime,
        numParamNames: numParamNames.value.firstPrime,
        strParamNames: strParamNames.value.firstPrime,
        participants: participants.value.firstPrime,
        name: name.value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 1,
        $r: 2,
        activeBoardKey: activeBoardKey.secondPrime,
        bgms: bgms.value.secondPrime,
        boolParamNames: boolParamNames.value.secondPrime,
        memos: memos.value.secondPrime,
        numParamNames: numParamNames.value.secondPrime,
        strParamNames: strParamNames.value.secondPrime,
        participants: participants.value.secondPrime,
        name: name.value.secondPrime,
    };

    for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
        const key = `publicChannel${i}Name` as const;
        const operation = TextOperation.clientTransform({
            first: first[key],
            second: second[key],
        });
        if (operation.isError) {
            return operation;
        }
        firstPrime[key] = operation.value.firstPrime;
        secondPrime[key] = operation.value.secondPrime;
    }

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
