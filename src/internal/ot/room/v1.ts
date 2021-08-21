import * as t from 'io-ts';
import * as Bgm from './bgm/v1';
import * as Board from './board/v1';
import * as Character from './character/v1';
import * as Memo from './memo/v1';
import * as ParamNames from './paramName/v1';
import * as Participant from './participant/v1';
import * as RecordOperation from '../util/recordOperation';
import * as DualKeyRecordOperation from '../util/dualKeyRecordOperation';
import {
    mapRecordOperationElement,
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../util/recordOperationElement';
import * as ReplaceOperation from '../util/replaceOperation';
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
import { createOperation } from '../util/createOperation';
import { DualStringKeyRecord, isIdRecord, record } from '../util/record';
import { CompositeKey, compositeKey } from '../compositeKey/v1';
import { Result } from '@kizahasi/result';
import { ApplyError, PositiveInt, ComposeAndTransformError } from '@kizahasi/ot-string';
import { chooseRecord, chooseDualKeyRecord, isStrIndex20, isStrIndex5 } from '@kizahasi/util';
import { Maybe, maybe } from '../../maybe';

const replaceStringDownOperation = t.type({ oldValue: t.string });
const replaceStringUpOperation = t.type({ newValue: t.string });

export const dbState = t.type({
    $version: t.literal(1),

    activeBoardKey: maybe(compositeKey),
    bgms: record(t.string, Bgm.state), // keyはStrIndex5
    boards: record(t.string, record(t.string, Board.state)),
    boolParamNames: record(t.string, ParamNames.state), //keyはStrIndex20
    characters: record(t.string, record(t.string, Character.state)),
    memos: record(t.string, Memo.state),
    numParamNames: record(t.string, ParamNames.state), //keyはStrIndex20
    participants: record(t.string, Participant.state),
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
    strParamNames: record(t.string, ParamNames.state), //keyはStrIndex20
});

export type DbState = t.TypeOf<typeof dbState>;

export const state = t.intersection([
    dbState,
    t.type({
        createdBy: t.string,
        name: t.string,
    }),
]);

// nameはDBから頻繁に取得されると思われる値なので独立させている。
export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    activeBoardKey: t.type({ oldValue: maybe(compositeKey) }),
    bgms: record(t.string, recordDownOperationElementFactory(Bgm.state, Bgm.downOperation)),
    boards: record(
        t.string,
        record(t.string, recordDownOperationElementFactory(Board.state, Board.downOperation))
    ),
    boolParamNames: record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
    ),
    characters: record(
        t.string,
        record(
            t.string,
            recordDownOperationElementFactory(Character.state, Character.downOperation)
        )
    ),
    memos: record(t.string, recordDownOperationElementFactory(Memo.state, Memo.downOperation)),
    name: replaceStringDownOperation,
    numParamNames: record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
    ),
    participants: record(
        t.string,
        recordDownOperationElementFactory(Participant.state, Participant.downOperation)
    ),
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
    strParamNames: record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    activeBoardKey: t.type({ newValue: maybe(compositeKey) }),
    bgms: record(t.string, recordUpOperationElementFactory(Bgm.state, Bgm.upOperation)),
    boards: record(
        t.string,
        record(t.string, recordUpOperationElementFactory(Board.state, Board.upOperation))
    ),
    boolParamNames: record(
        t.string,
        recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)
    ),
    characters: record(
        t.string,
        record(t.string, recordUpOperationElementFactory(Character.state, Character.upOperation))
    ),
    memos: record(t.string, recordUpOperationElementFactory(Memo.state, Memo.upOperation)),
    name: replaceStringUpOperation,
    numParamNames: record(
        t.string,
        recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)
    ),
    participants: record(
        t.string,
        recordUpOperationElementFactory(Participant.state, Participant.upOperation)
    ),
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
    strParamNames: record(
        t.string,
        recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)
    ),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $version: 1;

    activeBoardKey?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<CompositeKey>>;
    bgms?: RecordOperation.RecordTwoWayOperation<Bgm.State, Bgm.TwoWayOperation>;
    boards?: DualKeyRecordOperation.DualKeyRecordTwoWayOperation<
        Board.State,
        Board.TwoWayOperation
    >;
    boolParamNames?: RecordOperation.RecordTwoWayOperation<
        ParamNames.State,
        ParamNames.TwoWayOperation
    >;
    characters?: DualKeyRecordOperation.DualKeyRecordTwoWayOperation<
        Character.State,
        Character.TwoWayOperation
    >;
    memos?: RecordOperation.RecordTwoWayOperation<Memo.State, Memo.TwoWayOperation>;
    name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    numParamNames?: RecordOperation.RecordTwoWayOperation<
        ParamNames.State,
        ParamNames.TwoWayOperation
    >;
    participants?: RecordOperation.RecordTwoWayOperation<
        Participant.State,
        Participant.TwoWayOperation
    >;
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
    strParamNames?: RecordOperation.RecordTwoWayOperation<
        ParamNames.State,
        ParamNames.TwoWayOperation
    >;
};

const boardsToClientState =
    (requestedBy: RequestedBy, activeBoardKey: CompositeKey | null) =>
    (source: DualStringKeyRecord<Board.State>): DualStringKeyRecord<Board.State> => {
        return DualKeyRecordOperation.toClientState<Board.State, Board.State>({
            serverState: source,
            isPrivate: (state, key) => {
                if (
                    RequestedBy.isAuthorized({
                        requestedBy,
                        userUid: key.first,
                    })
                ) {
                    return false;
                }
                if (key.second !== activeBoardKey?.id) {
                    return true;
                }
                return false;
            },
            toClientState: ({ state }) => Board.toClientState(state),
        });
    };

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
            boards: boardsToClientState(requestedBy, source.activeBoardKey ?? null)(source.boards),
            boolParamNames: RecordOperation.toClientState({
                serverState: source.boolParamNames,
                isPrivate: () => false,
                toClientState: ({ state }) => ParamNames.toClientState(state),
            }),
            characters: DualKeyRecordOperation.toClientState<Character.State, Character.State>({
                serverState: source.characters,
                isPrivate: (state, key) =>
                    !RequestedBy.isAuthorized({
                        requestedBy,
                        userUid: key.first,
                    }) && state.isPrivate,
                toClientState: ({ state, key }) =>
                    Character.toClientState(
                        RequestedBy.isAuthorized({ requestedBy, userUid: key.first }),
                        requestedBy,
                        source.activeBoardKey ?? null
                    )(state),
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
        boards:
            source.boards == null
                ? undefined
                : chooseDualKeyRecord(source.boards, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Board.toDownOperation,
                      })
                  ),
        characters:
            source.characters == null
                ? undefined
                : chooseDualKeyRecord(source.characters, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Character.toDownOperation,
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
        boards:
            source.boards == null
                ? undefined
                : chooseDualKeyRecord(source.boards, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Board.toUpOperation,
                      })
                  ),
        characters:
            source.characters == null
                ? undefined
                : chooseDualKeyRecord(source.characters, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Character.toUpOperation,
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

    const boards = DualKeyRecordOperation.apply<
        Board.State,
        Board.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.boards,
        operation: operation.boards,
        innerApply: ({ prevState, operation: upOperation }) => {
            return Board.apply({ state: prevState, operation: upOperation });
        },
    });
    if (boards.isError) {
        return boards;
    }
    result.boards = boards.value;

    const characters = DualKeyRecordOperation.apply<
        Character.State,
        Character.UpOperation | Character.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.characters,
        operation: operation.characters,
        innerApply: ({ prevState, operation: upOperation }) => {
            return Character.apply({
                state: prevState,
                operation: upOperation,
            });
        },
    });
    if (characters.isError) {
        return characters;
    }
    result.characters = characters.value;

    const bgms = RecordOperation.apply<
        Bgm.State,
        Bgm.UpOperation | Bgm.TwoWayOperation,
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
        ParamNames.State,
        ParamNames.UpOperation | ParamNames.TwoWayOperation,
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
        result.name = operation.name.newValue;
    }

    const numParamNames = RecordOperation.apply<
        ParamNames.State,
        ParamNames.UpOperation | ParamNames.TwoWayOperation,
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
        Memo.State,
        Memo.UpOperation | Memo.TwoWayOperation,
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
        Participant.State,
        Participant.UpOperation | Participant.TwoWayOperation,
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

    ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).forEach(i => {
        const operationElement = operation[`publicChannel${i}Name` as const];
        if (operationElement != null) {
            result[`publicChannel${i}Name` as const] = operationElement.newValue;
        }
    });

    const strParamNames = RecordOperation.apply<
        ParamNames.State,
        ParamNames.UpOperation | ParamNames.TwoWayOperation,
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

    const boards = DualKeyRecordOperation.applyBack<
        Board.State,
        Board.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.boards,
        operation: operation.boards,
        innerApplyBack: ({ state, operation }) => {
            return Board.applyBack({ state, operation });
        },
    });
    if (boards.isError) {
        return boards;
    }
    result.boards = boards.value;

    const characters = DualKeyRecordOperation.applyBack<
        Character.State,
        Character.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.characters,
        operation: operation.characters,
        innerApplyBack: ({ state, operation }) => {
            return Character.applyBack({ state, operation });
        },
    });
    if (characters.isError) {
        return characters;
    }
    result.characters = characters.value;

    const bgms = RecordOperation.applyBack<
        Bgm.State,
        Bgm.DownOperation,
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
        ParamNames.State,
        ParamNames.DownOperation,
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
        result.name = operation.name.oldValue;
    }

    const numParamNames = RecordOperation.applyBack<
        ParamNames.State,
        ParamNames.DownOperation,
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
        Memo.State,
        Memo.DownOperation,
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
        Participant.State,
        Participant.DownOperation,
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

    ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).forEach(i => {
        const operationElement = operation[`publicChannel${i}Name` as const];
        if (operationElement != null) {
            result[`publicChannel${i}Name` as const] = operationElement.oldValue;
        }
    });

    const strParamNames = RecordOperation.applyBack<
        ParamNames.State,
        ParamNames.DownOperation,
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
    const boards = DualKeyRecordOperation.composeDownOperation<
        Board.State,
        Board.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.boards,
        second: second.boards,
        innerApplyBack: params => Board.applyBack(params),
        innerCompose: params => Board.composeDownOperation(params),
    });
    if (boards.isError) {
        return boards;
    }

    const characters = DualKeyRecordOperation.composeDownOperation<
        Character.State,
        Character.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.characters,
        second: second.characters,
        innerApplyBack: params => Character.applyBack(params),
        innerCompose: params => Character.composeDownOperation(params),
    });
    if (characters.isError) {
        return characters;
    }

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
        activeBoardKey: ReplaceOperation.composeDownOperation(
            first.activeBoardKey,
            second.activeBoardKey
        ),
        name: ReplaceOperation.composeDownOperation(first.name, second.name),
        publicChannel1Name: ReplaceOperation.composeDownOperation(
            first.publicChannel1Name,
            second.publicChannel1Name
        ),
        publicChannel2Name: ReplaceOperation.composeDownOperation(
            first.publicChannel2Name,
            second.publicChannel2Name
        ),
        publicChannel3Name: ReplaceOperation.composeDownOperation(
            first.publicChannel3Name,
            second.publicChannel3Name
        ),
        publicChannel4Name: ReplaceOperation.composeDownOperation(
            first.publicChannel4Name,
            second.publicChannel4Name
        ),
        publicChannel5Name: ReplaceOperation.composeDownOperation(
            first.publicChannel5Name,
            second.publicChannel5Name
        ),
        publicChannel6Name: ReplaceOperation.composeDownOperation(
            first.publicChannel6Name,
            second.publicChannel6Name
        ),
        publicChannel7Name: ReplaceOperation.composeDownOperation(
            first.publicChannel7Name,
            second.publicChannel7Name
        ),
        publicChannel8Name: ReplaceOperation.composeDownOperation(
            first.publicChannel8Name,
            second.publicChannel8Name
        ),
        publicChannel9Name: ReplaceOperation.composeDownOperation(
            first.publicChannel9Name,
            second.publicChannel9Name
        ),
        publicChannel10Name: ReplaceOperation.composeDownOperation(
            first.publicChannel10Name,
            second.publicChannel10Name
        ),
        bgms: bgms.value,
        boards: boards.value,
        boolParamNames: boolParamNames.value,
        characters: characters.value,
        memos: memo.value,
        numParamNames: numParamNames.value,
        strParamNames: strParamNames.value,
        participants: participants.value,
    };
    return Result.ok(valueProps);
};

export const restore: Restore<State, DownOperation, TwoWayOperation> = ({
    nextState,
    downOperation,
}) => {
    if (downOperation === undefined) {
        return Result.ok({ prevState: nextState, twoWayOperation: undefined });
    }

    const boards = DualKeyRecordOperation.restore<
        Board.State,
        Board.DownOperation,
        Board.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: nextState.boards,
        downOperation: downOperation.boards,
        innerDiff: params => Board.diff(params),
        innerRestore: params => Board.restore(params),
    });
    if (boards.isError) {
        return boards;
    }

    const characters = DualKeyRecordOperation.restore<
        Character.State,
        Character.DownOperation,
        Character.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: nextState.characters,
        downOperation: downOperation.characters,
        innerDiff: params => Character.diff(params),
        innerRestore: params => Character.restore(params),
    });
    if (characters.isError) {
        return characters;
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
        boards: boards.value.prevState,
        boolParamNames: boolParamNames.value.prevState,
        characters: characters.value.prevState,
        memos: memo.value.prevState,
        numParamNames: numParamNames.value.prevState,
        strParamNames: strParamNames.value.prevState,
        participants: participants.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $version: 1,
        bgms: bgms.value.twoWayOperation,
        boards: boards.value.twoWayOperation,
        boolParamNames: boolParamNames.value.twoWayOperation,
        characters: characters.value.twoWayOperation,
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
        prevState.name = downOperation.name.oldValue;
        twoWayOperation.name = {
            ...downOperation.name,
            newValue: nextState.name,
        };
    }

    ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).forEach(i => {
        const key = `publicChannel${i}Name` as const;
        const downOperationValue = downOperation[key];
        if (downOperationValue !== undefined) {
            prevState[key] = downOperationValue.oldValue;
            twoWayOperation[key] = {
                ...downOperationValue,
                newValue: nextState[key],
            };
        }
    });

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const boards = DualKeyRecordOperation.diff<Board.State, Board.TwoWayOperation>({
        prevState: prevState.boards,
        nextState: nextState.boards,
        innerDiff: params => Board.diff(params),
    });
    const characters = DualKeyRecordOperation.diff<Character.State, Character.TwoWayOperation>({
        prevState: prevState.characters,
        nextState: nextState.characters,
        innerDiff: params => Character.diff(params),
    });
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
        $version: 1,
        bgms,
        boards,
        boolParamNames,
        characters,
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
        result.name = { oldValue: prevState.name, newValue: nextState.name };
    }
    ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).forEach(i => {
        const key = `publicChannel${i}Name` as const;
        if (prevState[key] !== nextState[key]) {
            result[key] = {
                oldValue: prevState[key],
                newValue: nextState[key],
            };
        }
    });
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
            if (me == null || me.role == null || me.role === Participant.Spectator) {
                // エラーを返すべきかもしれない
                return Result.ok(undefined);
            }
        }

        const currentActiveBoardKey = currentState.activeBoardKey;

        const boards = DualKeyRecordOperation.serverTransform<
            Board.State,
            Board.State,
            Board.TwoWayOperation,
            Board.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            first: serverOperation?.boards,
            second: clientOperation.boards,
            prevState: prevState.boards,
            nextState: currentState.boards,
            innerTransform: ({ first, second, prevState, nextState }) =>
                Board.serverTransform(requestedBy)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ key }) =>
                    !RequestedBy.isAuthorized({
                        requestedBy,
                        userUid: key.first,
                    }),
                cancelUpdate: ({ key }) => {
                    if (
                        RequestedBy.isAuthorized({
                            requestedBy,
                            userUid: key.first,
                        })
                    ) {
                        return false;
                    }
                    if (key.second !== currentState.activeBoardKey?.id) {
                        return true;
                    }
                    return false;
                },
                cancelRemove: ({ key }) =>
                    !RequestedBy.isAuthorized({
                        requestedBy,
                        userUid: key.first,
                    }),
            },
        });
        if (boards.isError) {
            return boards;
        }

        const characters = DualKeyRecordOperation.serverTransform<
            Character.State,
            Character.State,
            Character.TwoWayOperation,
            Character.UpOperation,
            string | ApplyError<PositiveInt> | ComposeAndTransformError
        >({
            first: serverOperation?.characters,
            second: clientOperation.characters,
            prevState: prevState.characters,
            nextState: currentState.characters,
            innerTransform: ({ first, second, prevState, nextState, key }) =>
                Character.serverTransform(
                    RequestedBy.isAuthorized({
                        requestedBy,
                        userUid: key.first,
                    })
                )({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ key }) =>
                    !RequestedBy.isAuthorized({ requestedBy, userUid: key.first }),
                cancelUpdate: ({ key, nextState }) =>
                    !RequestedBy.isAuthorized({ requestedBy, userUid: key.first }) &&
                    nextState.isPrivate,
                cancelRemove: ({ key, nextState }) =>
                    !RequestedBy.isAuthorized({ requestedBy, userUid: key.first }) &&
                    nextState.isPrivate,
            },
        });
        if (characters.isError) {
            return characters;
        }

        const bgms = RecordOperation.serverTransform<
            Bgm.State,
            Bgm.State,
            Bgm.TwoWayOperation,
            Bgm.UpOperation,
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
            ParamNames.State,
            ParamNames.State,
            ParamNames.TwoWayOperation,
            ParamNames.UpOperation,
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
            Memo.State,
            Memo.State,
            Memo.TwoWayOperation,
            Memo.UpOperation,
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
            ParamNames.State,
            ParamNames.State,
            ParamNames.TwoWayOperation,
            ParamNames.UpOperation,
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
            ParamNames.State,
            ParamNames.State,
            ParamNames.TwoWayOperation,
            ParamNames.UpOperation,
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
            Participant.State,
            Participant.State,
            Participant.TwoWayOperation,
            Participant.UpOperation,
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
                    activeBoardSecondKey: currentActiveBoardKey?.id,
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
            $version: 1,
            bgms: bgms.value,
            boards: boards.value,
            boolParamNames: boolParamNames.value,
            characters: characters.value,
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
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const activeBoardKey = ReplaceOperation.clientTransform({
        first: first.activeBoardKey,
        second: second.activeBoardKey,
    });

    const boards = DualKeyRecordOperation.clientTransform<
        Board.State,
        Board.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.boards,
        second: second.boards,
        innerTransform: params => Board.clientTransform(params),
        innerDiff: params => {
            const diff = Board.diff(params);
            if (diff == null) {
                return diff;
            }
            return Board.toUpOperation(diff);
        },
    });
    if (boards.isError) {
        return boards;
    }

    const characters = DualKeyRecordOperation.clientTransform<
        Character.State,
        Character.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.characters,
        second: second.characters,
        innerTransform: params => Character.clientTransform(params),
        innerDiff: params => {
            const diff = Character.diff(params);
            if (diff == null) {
                return diff;
            }
            return Character.toUpOperation(diff);
        },
    });
    if (characters.isError) {
        return characters;
    }

    const bgms = RecordOperation.clientTransform<
        Bgm.State,
        Bgm.UpOperation,
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
        ParamNames.State,
        ParamNames.UpOperation,
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
        Memo.State,
        Memo.UpOperation,
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
        ParamNames.State,
        ParamNames.UpOperation,
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
        ParamNames.State,
        ParamNames.UpOperation,
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
        Participant.State,
        Participant.UpOperation,
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

    const name = ReplaceOperation.clientTransform({
        first: first.name,
        second: second.name,
    });

    const firstPrime: UpOperation = {
        $version: 1,
        activeBoardKey: activeBoardKey.firstPrime,
        bgms: bgms.value.firstPrime,
        boards: boards.value.firstPrime,
        boolParamNames: boolParamNames.value.firstPrime,
        characters: characters.value.firstPrime,
        memos: memos.value.firstPrime,
        numParamNames: numParamNames.value.firstPrime,
        strParamNames: strParamNames.value.firstPrime,
        participants: participants.value.firstPrime,
        name: name.firstPrime,
    };

    const secondPrime: UpOperation = {
        $version: 1,
        activeBoardKey: activeBoardKey.secondPrime,
        bgms: bgms.value.secondPrime,
        boards: boards.value.secondPrime,
        boolParamNames: boolParamNames.value.secondPrime,
        characters: characters.value.secondPrime,
        memos: memos.value.secondPrime,
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

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
