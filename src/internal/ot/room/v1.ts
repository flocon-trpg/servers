import * as t from 'io-ts';
import * as Bgm from './bgm/v1';
import * as Board from './board/v1';
import * as Character from './character/v1';
import * as MyNumberValue from './myNumberValue/v1';
import * as ParamNames from './paramName/v1';
import * as Participant from './participant/v1';
import * as RecordOperation from './util/recordOperation';
import * as DualKeyRecordOperation from './util/dualKeyRecordOperation';
import {
    mapRecordOperationElement,
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from './util/recordOperationElement';
import * as ReplaceOperation from './util/replaceOperation';
import {
    Apply,
    client,
    ClientTransform,
    Compose,
    Diff,
    RequestedBy,
    Restore,
    server,
    ServerTransform,
    ToClientOperationParams,
} from './util/type';
import { operation } from './util/operation';
import { isIdRecord } from './util/record';
import { CompositeKey, compositeKey } from '../compositeKey/v1';
import { Result } from '@kizahasi/result';
import { ApplyError, PositiveInt, ComposeAndTransformError } from '@kizahasi/ot-string';
import {
    chooseRecord,
    chooseDualKeyRecord,
    isStrIndex20,
    isStrIndex5,
    Maybe,
    maybe,
    recordToDualKeyMap,
    dualKeyRecordFind,
} from '@kizahasi/util';

const replaceStringDownOperation = t.type({ oldValue: t.string });
const replaceStringUpOperation = t.type({ newValue: t.string });

export const dbState = t.type({
    $version: t.literal(1),

    activeBoardKey: maybe(compositeKey),
    bgms: t.record(t.string, Bgm.state),
    boards: t.record(t.string, t.record(t.string, Board.state)),
    boolParamNames: t.record(t.string, ParamNames.state),
    characters: t.record(t.string, t.record(t.string, Character.state)),
    myNumberValues: t.record(t.string, t.record(t.string, MyNumberValue.state)),
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

export const state = t.intersection([
    dbState,
    t.type({
        createdBy: t.string,
        name: t.string,
    }),
]);

// nameはDBから頻繁に取得されると思われる値なので独立させている。
export type State = t.TypeOf<typeof state>;

export const downOperation = operation(1, {
    activeBoardKey: t.type({ oldValue: maybe(compositeKey) }),
    bgms: t.record(t.string, recordDownOperationElementFactory(Bgm.state, Bgm.downOperation)),
    boards: t.record(
        t.string,
        t.record(t.string, recordDownOperationElementFactory(Board.state, Board.downOperation))
    ),
    boolParamNames: t.record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
    ),
    characters: t.record(
        t.string,
        t.record(
            t.string,
            recordDownOperationElementFactory(Character.state, Character.downOperation)
        )
    ),
    myNumberValues: t.record(
        t.string,
        t.record(
            t.string,
            recordDownOperationElementFactory(MyNumberValue.state, MyNumberValue.downOperation)
        )
    ),
    name: replaceStringDownOperation,
    numParamNames: t.record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
    ),
    participants: t.record(
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
    strParamNames: t.record(
        t.string,
        recordDownOperationElementFactory(ParamNames.state, ParamNames.downOperation)
    ),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = operation(1, {
    activeBoardKey: t.type({ newValue: maybe(compositeKey) }),
    bgms: t.record(t.string, recordUpOperationElementFactory(Bgm.state, Bgm.upOperation)),
    boards: t.record(
        t.string,
        t.record(t.string, recordUpOperationElementFactory(Board.state, Board.upOperation))
    ),
    boolParamNames: t.record(
        t.string,
        recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)
    ),
    characters: t.record(
        t.string,
        t.record(t.string, recordUpOperationElementFactory(Character.state, Character.upOperation))
    ),
    name: replaceStringUpOperation,
    myNumberValues: t.record(
        t.string,
        t.record(
            t.string,
            recordUpOperationElementFactory(MyNumberValue.state, MyNumberValue.upOperation)
        )
    ),
    numParamNames: t.record(
        t.string,
        recordUpOperationElementFactory(ParamNames.state, ParamNames.upOperation)
    ),
    participants: t.record(
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
    strParamNames: t.record(
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
    myNumberValues?: DualKeyRecordOperation.DualKeyRecordTwoWayOperation<
        MyNumberValue.State,
        MyNumberValue.TwoWayOperation
    >;
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

export const toClientState = (requestedBy: RequestedBy) => (source: State): State => {
    return {
        ...source,
        bgms: RecordOperation.toClientState({
            serverState: source.bgms,
            isPrivate: () => false,
            toClientState: ({ state }) => Bgm.toClientState(state),
        }),
        boards: DualKeyRecordOperation.toClientState<Board.State, Board.State>({
            serverState: source.boards,
            isPrivate: (state, key) => {
                if (
                    RequestedBy.createdByMe({
                        requestedBy,
                        userUid: key.first,
                    })
                ) {
                    return false;
                }
                if (key.second !== source.activeBoardKey?.id) {
                    return true;
                }
                return false;
            },
            toClientState: ({ state }) => Board.toClientState(state),
        }),
        boolParamNames: RecordOperation.toClientState({
            serverState: source.boolParamNames,
            isPrivate: () => false,
            toClientState: ({ state }) => ParamNames.toClientState(state),
        }),
        characters: DualKeyRecordOperation.toClientState<Character.State, Character.State>({
            serverState: source.characters,
            isPrivate: () => false,
            toClientState: ({ state, key }) =>
                Character.toClientState(
                    RequestedBy.createdByMe({ requestedBy, userUid: key.first })
                )(state),
        }),
        myNumberValues: DualKeyRecordOperation.toClientState<
            MyNumberValue.State,
            MyNumberValue.State
        >({
            serverState: source.myNumberValues,
            isPrivate: () => false,
            toClientState: ({ state, key }) =>
                MyNumberValue.toClientState(
                    RequestedBy.createdByMe({ requestedBy, userUid: key.first })
                )(state),
        }),
        numParamNames: RecordOperation.toClientState({
            serverState: source.numParamNames,
            isPrivate: () => false,
            toClientState: ({ state }) => ParamNames.toClientState(state),
        }),
        participants: RecordOperation.toClientState({
            serverState: source.participants,
            isPrivate: () => false,
            toClientState: ({ state }) => Participant.toClientState(state),
        }),
        strParamNames: RecordOperation.toClientState({
            serverState: source.strParamNames,
            isPrivate: () => false,
            toClientState: ({ state }) => ParamNames.toClientState(state),
        }),
    };
};

// boardsは原則として自分が作ったものしか取得できない。ただし、activeBoardKeyに設定されているboardは例外として誰でも閲覧できる、という仕様。
// これは  DualKeyRecordOperation.toClientOperation だけでは実現できない(isPrivateによるチェックはdiffに含まれているもののみに行われる)。そのため、独自の処理を行う必要がある。
const boardsToClientOperation = (requestedBy: RequestedBy) => ({
    prevState,
    nextState,
}: {
    prevState: State;
    nextState: State;
}) => {
    const prevBoardsMap = recordToDualKeyMap<Board.State>(
        requestedBy.type === server
            ? prevState.boards
            : {
                  [requestedBy.userUid]: prevState.boards[requestedBy.userUid] ?? {},
              }
    );
    if (requestedBy.type === client && prevState.activeBoardKey != null) {
        const prevActiveBoard = dualKeyRecordFind<Board.State>(prevState.boards, {
            first: prevState.activeBoardKey.createdBy,
            second: prevState.activeBoardKey.id,
        });
        if (prevActiveBoard != null) {
            prevBoardsMap.set(
                {
                    first: prevState.activeBoardKey.createdBy,
                    second: prevState.activeBoardKey.id,
                },
                prevActiveBoard
            );
        }
    }

    const nextBoardsMap = recordToDualKeyMap<Board.State>(
        requestedBy.type === server
            ? nextState.boards
            : {
                  [requestedBy.userUid]: nextState.boards[requestedBy.userUid] ?? {},
              }
    );
    if (requestedBy.type === client && nextState.activeBoardKey != null) {
        const nextActiveBoard = dualKeyRecordFind<Board.State>(nextState.boards, {
            first: nextState.activeBoardKey.createdBy,
            second: nextState.activeBoardKey.id,
        });
        if (nextActiveBoard != null) {
            nextBoardsMap.set(
                {
                    first: nextState.activeBoardKey.createdBy,
                    second: nextState.activeBoardKey.id,
                },
                nextActiveBoard
            );
        }
    }

    const prevBoards = prevBoardsMap.toStringRecord(
        x => x,
        x => x
    );
    const nextBoards = nextBoardsMap.toStringRecord(
        x => x,
        x => x
    );
    const diff = DualKeyRecordOperation.diff<Board.State, Board.TwoWayOperation>({
        prevState: prevBoards,
        nextState: nextBoards,
        innerDiff: params => Board.diff(params),
    });

    return DualKeyRecordOperation.toClientOperation({
        diff,
        prevState: prevBoards,
        nextState: nextBoards,
        toClientState: ({ nextState }) => Board.toClientState(nextState),
        toClientOperation: params => Board.toClientOperation(params),
        isPrivate: () => false,
    });
};

export const toClientOperation = (requestedBy: RequestedBy) => ({
    prevState,
    nextState,
    diff,
}: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return {
        ...diff,
        bgms:
            diff.bgms == null
                ? undefined
                : RecordOperation.toClientOperation({
                      diff: diff.bgms,
                      prevState: prevState.bgms,
                      nextState: nextState.bgms,
                      toClientState: ({ nextState }) => Bgm.toClientState(nextState),
                      toClientOperation: params => Bgm.toClientOperation(params),
                      isPrivate: () => false,
                  }),
        boards: boardsToClientOperation(requestedBy)({
            prevState,
            nextState,
        }),
        boolParamNames:
            diff.boolParamNames == null
                ? undefined
                : RecordOperation.toClientOperation({
                      diff: diff.boolParamNames,
                      prevState: prevState.boolParamNames,
                      nextState: nextState.boolParamNames,
                      toClientState: ({ nextState }) => ParamNames.toClientState(nextState),
                      toClientOperation: params => ParamNames.toClientOperation(params),
                      isPrivate: () => false,
                  }),
        characters:
            diff.characters == null
                ? undefined
                : DualKeyRecordOperation.toClientOperation({
                      diff: diff.characters,
                      prevState: prevState.characters,
                      nextState: nextState.characters,
                      toClientState: ({ nextState, key }) =>
                          Character.toClientState(
                              RequestedBy.createdByMe({
                                  requestedBy,
                                  userUid: key.first,
                              })
                          )(nextState),
                      toClientOperation: params =>
                          Character.toClientOperation(
                              RequestedBy.createdByMe({
                                  requestedBy,
                                  userUid: params.key.first,
                              })
                          )(params),
                      isPrivate: (state, key) =>
                          !RequestedBy.createdByMe({
                              requestedBy,
                              userUid: key.first,
                          }) && state.isPrivate,
                  }),
        myNumberValues:
            diff.myNumberValues == null
                ? undefined
                : DualKeyRecordOperation.toClientOperation({
                      diff: diff.myNumberValues,
                      prevState: prevState.myNumberValues,
                      nextState: nextState.myNumberValues,
                      toClientState: ({ nextState, key }) =>
                          MyNumberValue.toClientState(
                              RequestedBy.createdByMe({
                                  requestedBy,
                                  userUid: key.first,
                              })
                          )(nextState),
                      toClientOperation: params =>
                          MyNumberValue.toClientOperation(
                              RequestedBy.createdByMe({
                                  requestedBy,
                                  userUid: params.key.first,
                              })
                          )(params),
                      isPrivate: () => false,
                  }),
        numParamNames:
            diff.numParamNames == null
                ? undefined
                : RecordOperation.toClientOperation({
                      diff: diff.numParamNames,
                      prevState: prevState.numParamNames,
                      nextState: nextState.numParamNames,
                      toClientState: ({ nextState }) => ParamNames.toClientState(nextState),
                      toClientOperation: params => ParamNames.toClientOperation(params),
                      isPrivate: () => false,
                  }),
        participants:
            diff.participants == null
                ? undefined
                : RecordOperation.toClientOperation({
                      diff: diff.participants,
                      prevState: prevState.participants,
                      nextState: nextState.participants,
                      toClientState: ({ nextState, key }) => Participant.toClientState(nextState),
                      toClientOperation: params => Participant.toClientOperation(params),
                      isPrivate: () => false,
                  }),
        strParamNames:
            diff.strParamNames == null
                ? undefined
                : RecordOperation.toClientOperation({
                      diff: diff.strParamNames,
                      prevState: prevState.strParamNames,
                      nextState: nextState.strParamNames,
                      toClientState: ({ nextState }) => ParamNames.toClientState(nextState),
                      toClientOperation: params => ParamNames.toClientOperation(params),
                      isPrivate: () => false,
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
        myNumberValues:
            source.myNumberValues == null
                ? undefined
                : chooseDualKeyRecord(source.myNumberValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: MyNumberValue.toDownOperation,
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
        myNumberValues:
            source.myNumberValues == null
                ? undefined
                : chooseDualKeyRecord(source.myNumberValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: MyNumberValue.toUpOperation,
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

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    if (operation.activeBoardKey != null) {
        result.activeBoardKey = operation.activeBoardKey.newValue;
    }

    const boards = DualKeyRecordOperation.apply<
        Board.State,
        Board.UpOperation | Board.TwoWayOperation,
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

    const myNumberValues = DualKeyRecordOperation.apply<
        MyNumberValue.State,
        MyNumberValue.UpOperation | MyNumberValue.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        prevState: state.myNumberValues,
        operation: operation.myNumberValues,
        innerApply: ({ prevState, operation: upOperation }) => {
            return MyNumberValue.apply({
                state: prevState,
                operation: upOperation,
            });
        },
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }
    result.myNumberValues = myNumberValues.value;

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

    const myNumberValues = DualKeyRecordOperation.applyBack<
        MyNumberValue.State,
        MyNumberValue.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: state.myNumberValues,
        operation: operation.myNumberValues,
        innerApplyBack: ({ state, operation }) => {
            return MyNumberValue.applyBack({ state, operation });
        },
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }
    result.myNumberValues = myNumberValues.value;

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

export const composeUpOperation: Compose<UpOperation> = ({ first, second }) => {
    const boards = DualKeyRecordOperation.composeUpOperation<
        Board.State,
        Board.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.boards,
        second: second.boards,
        innerApply: params => Board.apply(params),
        innerCompose: params => Board.composeUpOperation(params),
    });
    if (boards.isError) {
        return boards;
    }

    const characters = DualKeyRecordOperation.composeUpOperation<
        Character.State,
        Character.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.characters,
        second: second.characters,
        innerApply: params => Character.apply(params),
        innerCompose: params => Character.composeUpOperation(params),
    });
    if (characters.isError) {
        return characters;
    }

    const myNumberValues = DualKeyRecordOperation.composeUpOperation<
        MyNumberValue.State,
        MyNumberValue.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.myNumberValues,
        second: second.myNumberValues,
        innerApply: params => MyNumberValue.apply(params),
        innerCompose: params => MyNumberValue.composeUpOperation(params),
    });
    if (myNumberValues.isError) {
        return myNumberValues;
    }

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
        activeBoardKey: ReplaceOperation.composeUpOperation(
            first.activeBoardKey,
            second.activeBoardKey
        ),
        name: ReplaceOperation.composeUpOperation(first.name, second.name),
        publicChannel1Name: ReplaceOperation.composeUpOperation(
            first.publicChannel1Name,
            second.publicChannel1Name
        ),
        publicChannel2Name: ReplaceOperation.composeUpOperation(
            first.publicChannel2Name,
            second.publicChannel2Name
        ),
        publicChannel3Name: ReplaceOperation.composeUpOperation(
            first.publicChannel3Name,
            second.publicChannel3Name
        ),
        publicChannel4Name: ReplaceOperation.composeUpOperation(
            first.publicChannel4Name,
            second.publicChannel4Name
        ),
        publicChannel5Name: ReplaceOperation.composeUpOperation(
            first.publicChannel5Name,
            second.publicChannel5Name
        ),
        publicChannel6Name: ReplaceOperation.composeUpOperation(
            first.publicChannel6Name,
            second.publicChannel6Name
        ),
        publicChannel7Name: ReplaceOperation.composeUpOperation(
            first.publicChannel7Name,
            second.publicChannel7Name
        ),
        publicChannel8Name: ReplaceOperation.composeUpOperation(
            first.publicChannel8Name,
            second.publicChannel8Name
        ),
        publicChannel9Name: ReplaceOperation.composeUpOperation(
            first.publicChannel9Name,
            second.publicChannel9Name
        ),
        publicChannel10Name: ReplaceOperation.composeUpOperation(
            first.publicChannel10Name,
            second.publicChannel10Name
        ),
        bgms: bgms.value,
        boards: boards.value,
        boolParamNames: boolParamNames.value,
        characters: characters.value,
        myNumberValues: myNumberValues.value,
        numParamNames: numParamNames.value,
        strParamNames: strParamNames.value,
        participants: participants.value,
    };
    return Result.ok(valueProps);
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

    const myNumberValues = DualKeyRecordOperation.composeDownOperation<
        MyNumberValue.State,
        MyNumberValue.DownOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.myNumberValues,
        second: second.myNumberValues,
        innerApplyBack: params => MyNumberValue.applyBack(params),
        innerCompose: params => MyNumberValue.composeDownOperation(params),
    });
    if (myNumberValues.isError) {
        return myNumberValues;
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
        myNumberValues: myNumberValues.value,
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

    const myNumberValues = DualKeyRecordOperation.restore<
        MyNumberValue.State,
        MyNumberValue.DownOperation,
        MyNumberValue.TwoWayOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        nextState: nextState.myNumberValues,
        downOperation: downOperation.myNumberValues,
        innerDiff: params => MyNumberValue.diff(params),
        innerRestore: params => MyNumberValue.restore(params),
    });
    if (myNumberValues.isError) {
        return myNumberValues;
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
        boards: boards.value.prevState,
        boolParamNames: boolParamNames.value.prevState,
        characters: characters.value.prevState,
        myNumberValues: myNumberValues.value.prevState,
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
        myNumberValues: myNumberValues.value.twoWayOperation,
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
    const myNumberValues = DualKeyRecordOperation.diff<
        MyNumberValue.State,
        MyNumberValue.TwoWayOperation
    >({
        prevState: prevState.myNumberValues,
        nextState: nextState.myNumberValues,
        innerDiff: params => MyNumberValue.diff(params),
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
        myNumberValues,
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

export const serverTransform = (
    requestedBy: RequestedBy
): ServerTransform<State, TwoWayOperation, UpOperation> => ({
    prevState,
    currentState,
    clientOperation,
    serverOperation,
}) => {
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
            Board.serverTransform({
                prevState,
                currentState: nextState,
                serverOperation: first,
                clientOperation: second,
            }),
        toServerState: state => state,
        cancellationPolicy: {
            cancelCreate: ({ key }) =>
                !RequestedBy.createdByMe({
                    requestedBy,
                    userUid: key.first,
                }),
            cancelUpdate: ({ key }) => {
                if (
                    RequestedBy.createdByMe({
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
                !RequestedBy.createdByMe({
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
                RequestedBy.createdByMe({
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
        cancellationPolicy: {},
    });
    if (characters.isError) {
        return characters;
    }

    const myNumberValues = DualKeyRecordOperation.serverTransform<
        MyNumberValue.State,
        MyNumberValue.State,
        MyNumberValue.TwoWayOperation,
        MyNumberValue.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: serverOperation?.myNumberValues,
        second: clientOperation.myNumberValues,
        prevState: prevState.myNumberValues,
        nextState: currentState.myNumberValues,
        innerTransform: ({ first, second, prevState, nextState, key }) =>
            MyNumberValue.serverTransform(
                RequestedBy.createdByMe({
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
        cancellationPolicy: {},
    });
    if (myNumberValues.isError) {
        return myNumberValues;
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
        myNumberValues: myNumberValues.value,
        numParamNames: numParamNames.value,
        strParamNames: strParamNames.value,
        participants: participants.value,
    };

    // activeBoardKeyには、自分が作成したBoardしか設定できない。ただし、nullishにするのは誰でもできる。
    if (clientOperation.activeBoardKey != null) {
        if (
            clientOperation.activeBoardKey.newValue == null ||
            RequestedBy.createdByMe({
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

    const myNumberValues = DualKeyRecordOperation.clientTransform<
        MyNumberValue.State,
        MyNumberValue.UpOperation,
        string | ApplyError<PositiveInt> | ComposeAndTransformError
    >({
        first: first.myNumberValues,
        second: second.myNumberValues,
        innerTransform: params => MyNumberValue.clientTransform(params),
        innerDiff: params => {
            const diff = MyNumberValue.diff(params);
            if (diff == null) {
                return diff;
            }
            return MyNumberValue.toUpOperation(diff);
        },
    });
    if (myNumberValues.isError) {
        return myNumberValues;
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
        myNumberValues: myNumberValues.value.firstPrime,
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
        myNumberValues: myNumberValues.value.secondPrime,
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
