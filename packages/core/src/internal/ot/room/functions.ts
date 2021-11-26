import * as Bgm from './bgm/functions';
import * as BgmTypes from './bgm/types';
import * as Board from './board/functions';
import * as BoardTypes from './board/types';
import * as Character from './character/functions';
import * as CharacterTypes from './character/types';
import * as DicePieceValue from './dicePieceValue/functions';
import * as DicePieceValueTypes from './dicePieceValue/types';
import * as ImagePieceValue from './imagePieceValue/functions';
import * as ImagePieceValueTypes from './imagePieceValue/types';
import * as Memo from './memo/functions';
import * as MemoTypes from './memo/types';
import * as NullableTextOperation from '../util/nullableTextOperation';
import * as ParamNames from './paramName/functions';
import * as ParamNamesTypes from './paramName/types';
import * as Participant from './participant/functions';
import * as ParticipantTypes from './participant/types';
import * as RecordOperation from '../util/recordOperation';
import { mapRecordOperationElement } from '../util/recordOperationElement';
import * as ReplaceOperation from '../util/replaceOperation';
import * as RollCall from './rollCall/functions';
import * as RollCallTypes from './rollCall/types';
import * as StringPieceValue from './stringPieceValue/functions';
import * as StringPieceValueTypes from './stringPieceValue/types';
import * as TextOperation from '../util/textOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    DownError,
    Restore,
    ScalarError,
    ServerTransform,
    TwoWayError,
    UpError,
} from '../util/type';
import { isIdRecord } from '../util/record';
import { Result } from '@kizahasi/result';
import { chooseRecord } from '@flocon-trpg/utils';
import { isStrIndex20, isStrIndex5 } from '../../indexes';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';
import {
    client,
    RequestedBy,
    isBoardVisible,
    isOwner,
    anyValue,
    none,
    isCharacterOwner,
    isBoardOwner,
    admin,
} from '../util/requestedBy';

const oneToTenArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

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
            boards: RecordOperation.toClientState({
                serverState: source.boards,
                isPrivate: (_, boardId) =>
                    !isBoardVisible({
                        boardId,
                        requestedBy,
                        currentRoomState: source,
                    }),
                toClientState: ({ state }) => Board.toClientState(state),
            }),
            characters: RecordOperation.toClientState<CharacterTypes.State, CharacterTypes.State>({
                serverState: source.characters,
                isPrivate: state =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: state.ownerParticipantId ?? anyValue,
                    }) && state.isPrivate,
                toClientState: ({ state }) =>
                    Character.toClientState(
                        isOwner({
                            requestedBy,
                            ownerParticipantId: state.ownerParticipantId ?? anyValue,
                        }),
                        requestedBy,
                        source
                    )(state),
            }),
            dicePieceValues: RecordOperation.toClientState<
                DicePieceValueTypes.State,
                DicePieceValueTypes.State
            >({
                serverState: source.dicePieceValues,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    DicePieceValue.toClientState(requestedBy, source)(state),
            }),
            imagePieceValues: RecordOperation.toClientState<
                ImagePieceValueTypes.State,
                ImagePieceValueTypes.State
            >({
                serverState: source.imagePieceValues,
                isPrivate: state =>
                    state.isPrivate &&
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: state.ownerParticipantId ?? anyValue,
                    }),
                toClientState: ({ state }) =>
                    ImagePieceValue.toClientState(requestedBy, source)(state),
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
                toClientState: ({ state }) => Participant.toClientState(state),
            }),
            rollCalls: RecordOperation.toClientState<RollCallTypes.State, RollCallTypes.State>({
                serverState: source.rollCalls,
                isPrivate: () => false,
                toClientState: ({ state }) => RollCall.toClientState(state),
            }),
            stringPieceValues: RecordOperation.toClientState<
                StringPieceValueTypes.State,
                StringPieceValueTypes.State
            >({
                serverState: source.stringPieceValues,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    StringPieceValue.toClientState(requestedBy, source)(state),
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
        boards:
            source.boards == null
                ? undefined
                : chooseRecord(source.boards, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Board.toDownOperation,
                      })
                  ),
        characters:
            source.characters == null
                ? undefined
                : chooseRecord(source.characters, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Character.toDownOperation,
                      })
                  ),
        characterTag1Name:
            source.characterTag1Name == null
                ? undefined
                : NullableTextOperation.toDownOperation(source.characterTag1Name),
        characterTag2Name:
            source.characterTag2Name == null
                ? undefined
                : NullableTextOperation.toDownOperation(source.characterTag2Name),
        characterTag3Name:
            source.characterTag3Name == null
                ? undefined
                : NullableTextOperation.toDownOperation(source.characterTag3Name),
        characterTag4Name:
            source.characterTag4Name == null
                ? undefined
                : NullableTextOperation.toDownOperation(source.characterTag4Name),
        characterTag5Name:
            source.characterTag5Name == null
                ? undefined
                : NullableTextOperation.toDownOperation(source.characterTag5Name),
        characterTag6Name:
            source.characterTag6Name == null
                ? undefined
                : NullableTextOperation.toDownOperation(source.characterTag6Name),
        characterTag7Name:
            source.characterTag7Name == null
                ? undefined
                : NullableTextOperation.toDownOperation(source.characterTag7Name),
        characterTag8Name:
            source.characterTag8Name == null
                ? undefined
                : NullableTextOperation.toDownOperation(source.characterTag8Name),
        characterTag9Name:
            source.characterTag9Name == null
                ? undefined
                : NullableTextOperation.toDownOperation(source.characterTag9Name),
        characterTag10Name:
            source.characterTag10Name == null
                ? undefined
                : NullableTextOperation.toDownOperation(source.characterTag10Name),
        dicePieceValues:
            source.dicePieceValues == null
                ? undefined
                : chooseRecord(source.dicePieceValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: DicePieceValue.toDownOperation,
                      })
                  ),
        imagePieceValues:
            source.imagePieceValues == null
                ? undefined
                : chooseRecord(source.imagePieceValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: ImagePieceValue.toDownOperation,
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
        rollCalls:
            source.rollCalls == null
                ? undefined
                : chooseRecord(source.rollCalls, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: RollCall.toDownOperation,
                      })
                  ),
        stringPieceValues:
            source.stringPieceValues == null
                ? undefined
                : chooseRecord(source.stringPieceValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: StringPieceValue.toDownOperation,
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
        boards:
            source.boards == null
                ? undefined
                : chooseRecord(source.boards, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Board.toUpOperation,
                      })
                  ),
        characters:
            source.characters == null
                ? undefined
                : chooseRecord(source.characters, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: Character.toUpOperation,
                      })
                  ),
        characterTag1Name:
            source.characterTag1Name == null
                ? undefined
                : NullableTextOperation.toUpOperation(source.characterTag1Name),
        characterTag2Name:
            source.characterTag2Name == null
                ? undefined
                : NullableTextOperation.toUpOperation(source.characterTag2Name),
        characterTag3Name:
            source.characterTag3Name == null
                ? undefined
                : NullableTextOperation.toUpOperation(source.characterTag3Name),
        characterTag4Name:
            source.characterTag4Name == null
                ? undefined
                : NullableTextOperation.toUpOperation(source.characterTag4Name),
        characterTag5Name:
            source.characterTag5Name == null
                ? undefined
                : NullableTextOperation.toUpOperation(source.characterTag5Name),
        characterTag6Name:
            source.characterTag6Name == null
                ? undefined
                : NullableTextOperation.toUpOperation(source.characterTag6Name),
        characterTag7Name:
            source.characterTag7Name == null
                ? undefined
                : NullableTextOperation.toUpOperation(source.characterTag7Name),
        characterTag8Name:
            source.characterTag8Name == null
                ? undefined
                : NullableTextOperation.toUpOperation(source.characterTag8Name),
        characterTag9Name:
            source.characterTag9Name == null
                ? undefined
                : NullableTextOperation.toUpOperation(source.characterTag9Name),
        characterTag10Name:
            source.characterTag10Name == null
                ? undefined
                : NullableTextOperation.toUpOperation(source.characterTag10Name),
        dicePieceValues:
            source.dicePieceValues == null
                ? undefined
                : chooseRecord(source.dicePieceValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: DicePieceValue.toUpOperation,
                      })
                  ),
        imagePieceValues:
            source.imagePieceValues == null
                ? undefined
                : chooseRecord(source.imagePieceValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: ImagePieceValue.toUpOperation,
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
        rollCalls:
            source.rollCalls == null
                ? undefined
                : chooseRecord(source.rollCalls, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: RollCall.toUpOperation,
                      })
                  ),
        stringPieceValues:
            source.stringPieceValues == null
                ? undefined
                : chooseRecord(source.stringPieceValues, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: StringPieceValue.toUpOperation,
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

    if (operation.activeBoardId != null) {
        result.activeBoardId = operation.activeBoardId.newValue;
    }

    const bgms = RecordOperation.apply<
        BgmTypes.State,
        BgmTypes.UpOperation | BgmTypes.TwoWayOperation,
        ScalarError
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
        ScalarError
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

    const boards = RecordOperation.apply<BoardTypes.State, BoardTypes.UpOperation, ScalarError>({
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

    const characters = RecordOperation.apply<
        CharacterTypes.State,
        CharacterTypes.UpOperation | CharacterTypes.TwoWayOperation,
        ScalarError
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

    for (const i of oneToTenArray) {
        const key = `characterTag${i}Name` as const;
        const operationElement = operation[key];
        if (operationElement != null) {
            const applied = NullableTextOperation.apply(state[key], operationElement);
            if (applied.isError) {
                return applied;
            }
            result[key] = applied.value;
        }
    }

    const dicePieceValues = RecordOperation.apply<
        DicePieceValueTypes.State,
        DicePieceValueTypes.UpOperation | DicePieceValueTypes.TwoWayOperation,
        ScalarError
    >({
        prevState: state.dicePieceValues,
        operation: operation.dicePieceValues,
        innerApply: ({ prevState, operation: upOperation }) => {
            return DicePieceValue.apply({
                state: prevState,
                operation: upOperation,
            });
        },
    });
    if (dicePieceValues.isError) {
        return dicePieceValues;
    }
    result.dicePieceValues = dicePieceValues.value;

    const imagePieceValues = RecordOperation.apply<
        ImagePieceValueTypes.State,
        ImagePieceValueTypes.UpOperation | ImagePieceValueTypes.TwoWayOperation,
        ScalarError
    >({
        prevState: state.imagePieceValues,
        operation: operation.imagePieceValues,
        innerApply: ({ prevState, operation: upOperation }) => {
            return ImagePieceValue.apply({
                state: prevState,
                operation: upOperation,
            });
        },
    });
    if (imagePieceValues.isError) {
        return imagePieceValues;
    }
    result.imagePieceValues = imagePieceValues.value;

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
        ScalarError
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
        ScalarError
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
        ScalarError
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

    for (const i of oneToTenArray) {
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

    const rollCalls = RecordOperation.apply<
        RollCallTypes.State,
        RollCallTypes.UpOperation | RollCallTypes.TwoWayOperation,
        ScalarError
    >({
        prevState: state.rollCalls,
        operation: operation.rollCalls,
        innerApply: ({ prevState, operation: upOperation }) => {
            return RollCall.apply({
                state: prevState,
                operation: upOperation,
            });
        },
    });
    if (rollCalls.isError) {
        return rollCalls;
    }
    result.rollCalls = rollCalls.value;

    const stringPieceValues = RecordOperation.apply<
        StringPieceValueTypes.State,
        StringPieceValueTypes.UpOperation | StringPieceValueTypes.TwoWayOperation,
        ScalarError
    >({
        prevState: state.stringPieceValues,
        operation: operation.stringPieceValues,
        innerApply: ({ prevState, operation: upOperation }) => {
            return StringPieceValue.apply({
                state: prevState,
                operation: upOperation,
            });
        },
    });
    if (stringPieceValues.isError) {
        return stringPieceValues;
    }
    result.stringPieceValues = stringPieceValues.value;

    const strParamNames = RecordOperation.apply<
        ParamNamesTypes.State,
        ParamNamesTypes.UpOperation | ParamNamesTypes.TwoWayOperation,
        ScalarError
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

    if (operation.activeBoardId != null) {
        result.activeBoardId = operation.activeBoardId.oldValue;
    }

    const bgms = RecordOperation.applyBack<BgmTypes.State, BgmTypes.DownOperation, ScalarError>({
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
        ScalarError
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

    const boards = RecordOperation.applyBack<
        BoardTypes.State,
        BoardTypes.DownOperation,
        ScalarError
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

    const characters = RecordOperation.applyBack<
        CharacterTypes.State,
        CharacterTypes.DownOperation,
        ScalarError
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

    for (const i of oneToTenArray) {
        const key = `characterTag${i}Name` as const;
        const operationElement = operation[key];
        if (operationElement != null) {
            const applied = NullableTextOperation.applyBack(state[key], operationElement);
            if (applied.isError) {
                return applied;
            }
            result[key] = applied.value;
        }
    }

    const dicePieceValues = RecordOperation.applyBack<
        DicePieceValueTypes.State,
        DicePieceValueTypes.DownOperation,
        ScalarError
    >({
        nextState: state.dicePieceValues,
        operation: operation.dicePieceValues,
        innerApplyBack: ({ state, operation }) => {
            return DicePieceValue.applyBack({ state, operation });
        },
    });
    if (dicePieceValues.isError) {
        return dicePieceValues;
    }
    result.dicePieceValues = dicePieceValues.value;

    if (operation.name != null) {
        const applied = TextOperation.applyBack(state.name, operation.name);
        if (applied.isError) {
            return applied;
        }
        result.name = applied.value;
    }

    const imagePieceValues = RecordOperation.applyBack<
        ImagePieceValueTypes.State,
        ImagePieceValueTypes.DownOperation,
        ScalarError
    >({
        nextState: state.imagePieceValues,
        operation: operation.imagePieceValues,
        innerApplyBack: ({ state, operation }) => {
            return ImagePieceValue.applyBack({
                state,
                operation,
            });
        },
    });
    if (imagePieceValues.isError) {
        return imagePieceValues;
    }
    result.imagePieceValues = imagePieceValues.value;

    const numParamNames = RecordOperation.applyBack<
        ParamNamesTypes.State,
        ParamNamesTypes.DownOperation,
        ScalarError
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

    const memo = RecordOperation.applyBack<MemoTypes.State, MemoTypes.DownOperation, ScalarError>({
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
        ScalarError
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

    for (const i of oneToTenArray) {
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

    const rollCalls = RecordOperation.applyBack<
        RollCallTypes.State,
        RollCallTypes.DownOperation | RollCallTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: state.rollCalls,
        operation: operation.rollCalls,
        innerApplyBack: ({ state, operation }) => {
            return RollCall.applyBack({
                state,
                operation,
            });
        },
    });
    if (rollCalls.isError) {
        return rollCalls;
    }
    result.rollCalls = rollCalls.value;

    const stringPieceValues = RecordOperation.applyBack<
        StringPieceValueTypes.State,
        StringPieceValueTypes.DownOperation,
        ScalarError
    >({
        nextState: state.stringPieceValues,
        operation: operation.stringPieceValues,
        innerApplyBack: ({ state, operation }) => {
            return StringPieceValue.applyBack({ state, operation });
        },
    });
    if (stringPieceValues.isError) {
        return stringPieceValues;
    }
    result.stringPieceValues = stringPieceValues.value;

    const strParamNames = RecordOperation.applyBack<
        ParamNamesTypes.State,
        ParamNamesTypes.DownOperation,
        ScalarError
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

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
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

    const boards = RecordOperation.composeDownOperation<
        BoardTypes.State,
        BoardTypes.DownOperation,
        DownError
    >({
        first: first.boards,
        second: second.boards,
        innerApplyBack: params => Board.applyBack(params),
        innerCompose: params => Board.composeDownOperation(params),
    });
    if (boards.isError) {
        return boards;
    }

    const characters = RecordOperation.composeDownOperation<
        CharacterTypes.State,
        CharacterTypes.DownOperation,
        DownError
    >({
        first: first.characters,
        second: second.characters,
        innerApplyBack: params => Character.applyBack(params),
        innerCompose: params => Character.composeDownOperation(params),
    });
    if (characters.isError) {
        return characters;
    }

    const dicePieceValues = RecordOperation.composeDownOperation<
        DicePieceValueTypes.State,
        DicePieceValueTypes.DownOperation,
        DownError
    >({
        first: first.dicePieceValues,
        second: second.dicePieceValues,
        innerApplyBack: params => DicePieceValue.applyBack(params),
        innerCompose: params => DicePieceValue.composeDownOperation(params),
    });
    if (dicePieceValues.isError) {
        return dicePieceValues;
    }

    const imagePieceValues = RecordOperation.composeDownOperation<
        ImagePieceValueTypes.State,
        ImagePieceValueTypes.DownOperation,
        DownError
    >({
        first: first.imagePieceValues,
        second: second.imagePieceValues,
        innerApplyBack: params => ImagePieceValue.applyBack(params),
        innerCompose: params => ImagePieceValue.composeDownOperation(params),
    });
    if (imagePieceValues.isError) {
        return imagePieceValues;
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

    const stringPieceValues = RecordOperation.composeDownOperation<
        StringPieceValueTypes.State,
        StringPieceValueTypes.DownOperation,
        DownError
    >({
        first: first.stringPieceValues,
        second: second.stringPieceValues,
        innerApplyBack: params => StringPieceValue.applyBack(params),
        innerCompose: params => StringPieceValue.composeDownOperation(params),
    });
    if (stringPieceValues.isError) {
        return stringPieceValues;
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

    const rollCalls = RecordOperation.composeDownOperation({
        first: first.rollCalls,
        second: second.rollCalls,
        innerApplyBack: params => RollCall.applyBack(params),
        innerCompose: params => RollCall.composeDownOperation(params),
    });
    if (rollCalls.isError) {
        return rollCalls;
    }

    const valueProps: DownOperation = {
        $v: 2,
        $r: 1,
        activeBoardId: ReplaceOperation.composeDownOperation(
            first.activeBoardId,
            second.activeBoardId
        ),
        name: name.value,
        bgms: bgms.value,
        boolParamNames: boolParamNames.value,
        boards: boards.value,
        characters: characters.value,
        dicePieceValues: dicePieceValues.value,
        imagePieceValues: imagePieceValues.value,
        memos: memo.value,
        numParamNames: numParamNames.value,
        stringPieceValues: stringPieceValues.value,
        strParamNames: strParamNames.value,
        participants: participants.value,
        rollCalls: rollCalls.value,
    };

    for (const i of oneToTenArray) {
        const key = `characterTag${i}Name` as const;
        const composed = NullableTextOperation.composeDownOperation(first[key], second[key]);
        if (composed.isError) {
            return composed;
        }
        valueProps[key] = composed.value;
    }

    for (const i of oneToTenArray) {
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

    const boards = RecordOperation.restore<
        BoardTypes.State,
        BoardTypes.DownOperation,
        BoardTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: nextState.boards,
        downOperation: downOperation.boards,
        innerDiff: params => Board.diff(params),
        innerRestore: params => Board.restore(params),
    });
    if (boards.isError) {
        return boards;
    }

    const characters = RecordOperation.restore<
        CharacterTypes.State,
        CharacterTypes.DownOperation,
        CharacterTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: nextState.characters,
        downOperation: downOperation.characters,
        innerDiff: params => Character.diff(params),
        innerRestore: params => Character.restore(params),
    });
    if (characters.isError) {
        return characters;
    }

    const dicePieceValues = RecordOperation.restore<
        DicePieceValueTypes.State,
        DicePieceValueTypes.DownOperation,
        DicePieceValueTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: nextState.dicePieceValues,
        downOperation: downOperation.dicePieceValues,
        innerDiff: params => DicePieceValue.diff(params),
        innerRestore: params => DicePieceValue.restore(params),
    });
    if (dicePieceValues.isError) {
        return dicePieceValues;
    }

    const imagePieceValues = RecordOperation.restore<
        ImagePieceValueTypes.State,
        ImagePieceValueTypes.DownOperation,
        ImagePieceValueTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: nextState.imagePieceValues,
        downOperation: downOperation.imagePieceValues,
        innerDiff: params => ImagePieceValue.diff(params),
        innerRestore: params => ImagePieceValue.restore(params),
    });
    if (imagePieceValues.isError) {
        return imagePieceValues;
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

    const stringPieceValues = RecordOperation.restore<
        StringPieceValueTypes.State,
        StringPieceValueTypes.DownOperation,
        StringPieceValueTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: nextState.stringPieceValues,
        downOperation: downOperation.stringPieceValues,
        innerDiff: params => StringPieceValue.diff(params),
        innerRestore: params => StringPieceValue.restore(params),
    });
    if (stringPieceValues.isError) {
        return stringPieceValues;
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

    const rollCalls = RecordOperation.restore({
        nextState: nextState.rollCalls,
        downOperation: downOperation.rollCalls,
        innerDiff: params => RollCall.diff(params),
        innerRestore: params => RollCall.restore(params),
    });
    if (rollCalls.isError) {
        return rollCalls;
    }

    const prevState: State = {
        ...nextState,
        bgms: bgms.value.prevState,
        boards: boards.value.prevState,
        boolParamNames: boolParamNames.value.prevState,
        characters: characters.value.prevState,
        dicePieceValues: dicePieceValues.value.prevState,
        imagePieceValues: imagePieceValues.value.prevState,
        memos: memo.value.prevState,
        numParamNames: numParamNames.value.prevState,
        stringPieceValues: stringPieceValues.value.prevState,
        strParamNames: strParamNames.value.prevState,
        participants: participants.value.prevState,
        rollCalls: rollCalls.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $v: 2,
        $r: 1,
        bgms: bgms.value.twoWayOperation,
        boards: boards.value.twoWayOperation,
        boolParamNames: boolParamNames.value.twoWayOperation,
        characters: characters.value.twoWayOperation,
        dicePieceValues: dicePieceValues.value.twoWayOperation,
        imagePieceValues: imagePieceValues.value.twoWayOperation,
        memos: memo.value.twoWayOperation,
        numParamNames: numParamNames.value.twoWayOperation,
        stringPieceValues: stringPieceValues.value.twoWayOperation,
        strParamNames: strParamNames.value.twoWayOperation,
        participants: participants.value.twoWayOperation,
        rollCalls: rollCalls.value.twoWayOperation,
    };

    if (downOperation.activeBoardId !== undefined) {
        prevState.activeBoardId = downOperation.activeBoardId.oldValue;
        twoWayOperation.activeBoardId = {
            ...downOperation.activeBoardId,
            newValue: nextState.activeBoardId,
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

    for (const i of oneToTenArray) {
        const key = `characterTag${i}Name` as const;
        const downOperationValue = downOperation[key];
        if (downOperationValue !== undefined) {
            const restored = NullableTextOperation.restore({
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

    for (const i of oneToTenArray) {
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
    const boards = RecordOperation.diff<BoardTypes.State, BoardTypes.TwoWayOperation>({
        prevState: prevState.boards,
        nextState: nextState.boards,
        innerDiff: params => Board.diff(params),
    });
    const boolParamNames = RecordOperation.diff({
        prevState: prevState.boolParamNames,
        nextState: nextState.boolParamNames,
        innerDiff: params => ParamNames.diff(params),
    });
    const characters = RecordOperation.diff<CharacterTypes.State, CharacterTypes.TwoWayOperation>({
        prevState: prevState.characters,
        nextState: nextState.characters,
        innerDiff: params => Character.diff(params),
    });
    const dicePieceValues = RecordOperation.diff<
        DicePieceValueTypes.State,
        DicePieceValueTypes.TwoWayOperation
    >({
        prevState: prevState.dicePieceValues,
        nextState: nextState.dicePieceValues,
        innerDiff: params => DicePieceValue.diff(params),
    });
    const imagePieceValues = RecordOperation.diff<
        ImagePieceValueTypes.State,
        ImagePieceValueTypes.TwoWayOperation
    >({
        prevState: prevState.imagePieceValues,
        nextState: nextState.imagePieceValues,
        innerDiff: params => ImagePieceValue.diff(params),
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
    const stringPieceValues = RecordOperation.diff<
        StringPieceValueTypes.State,
        StringPieceValueTypes.TwoWayOperation
    >({
        prevState: prevState.stringPieceValues,
        nextState: nextState.stringPieceValues,
        innerDiff: params => StringPieceValue.diff(params),
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
    const rollCalls = RecordOperation.diff({
        prevState: prevState.rollCalls,
        nextState: nextState.rollCalls,
        innerDiff: params => RollCall.diff(params),
    });
    const result: TwoWayOperation = {
        $v: 2,
        $r: 1,
        bgms,
        boards,
        boolParamNames,
        characters,
        dicePieceValues,
        imagePieceValues,
        memos: memo,
        numParamNames,
        participants,
        rollCalls,
        stringPieceValues,
        strParamNames,
    };
    if (prevState.activeBoardId !== nextState.activeBoardId) {
        result.activeBoardId = {
            oldValue: prevState.activeBoardId,
            newValue: nextState.activeBoardId,
        };
    }
    if (prevState.name !== nextState.name) {
        result.name = TextOperation.diff({ prev: prevState.name, next: nextState.name });
    }
    for (const i of oneToTenArray) {
        const key = `characterTag${i}Name` as const;
        if (prevState[key] !== nextState[key]) {
            result[key] = NullableTextOperation.diff({
                prev: prevState[key],
                next: nextState[key],
            });
        }
    }
    for (const i of oneToTenArray) {
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

        const bgms = RecordOperation.serverTransform<
            BgmTypes.State,
            BgmTypes.State,
            BgmTypes.TwoWayOperation,
            BgmTypes.UpOperation,
            TwoWayError
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
            TwoWayError
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

        const boards = RecordOperation.serverTransform<
            BoardTypes.State,
            BoardTypes.State,
            BoardTypes.TwoWayOperation,
            BoardTypes.UpOperation,
            TwoWayError
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
                cancelCreate: ({ newState }) =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: newState.ownerParticipantId ?? none,
                    }),
                cancelUpdate: ({ key }) => {
                    return !isBoardVisible({
                        boardId: key,
                        currentRoomState: currentState,
                        requestedBy,
                    });
                },
                cancelRemove: ({ state }) =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: state.ownerParticipantId ?? anyValue,
                    }),
            },
        });
        if (boards.isError) {
            return boards;
        }

        const characters = RecordOperation.serverTransform<
            CharacterTypes.State,
            CharacterTypes.State,
            CharacterTypes.TwoWayOperation,
            CharacterTypes.UpOperation,
            TwoWayError
        >({
            first: serverOperation?.characters,
            second: clientOperation.characters,
            prevState: prevState.characters,
            nextState: currentState.characters,
            innerTransform: ({ first, second, prevState, nextState }) =>
                Character.serverTransform(
                    isOwner({
                        requestedBy,
                        ownerParticipantId: nextState.ownerParticipantId ?? anyValue,
                    }),
                    requestedBy,
                    currentState
                )({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ newState }) =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: newState.ownerParticipantId ?? none,
                    }),
                cancelUpdate: ({ nextState }) =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: nextState.ownerParticipantId ?? anyValue,
                    }) && nextState.isPrivate,
                cancelRemove: ({ state }) =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: state.ownerParticipantId ?? anyValue,
                    }) && state.isPrivate,
            },
        });
        if (characters.isError) {
            return characters;
        }

        const dicePieceValues = RecordOperation.serverTransform<
            DicePieceValueTypes.State,
            DicePieceValueTypes.State,
            DicePieceValueTypes.TwoWayOperation,
            DicePieceValueTypes.UpOperation,
            TwoWayError
        >({
            first: serverOperation?.dicePieceValues,
            second: clientOperation.dicePieceValues,
            prevState: prevState.dicePieceValues,
            nextState: currentState.dicePieceValues,
            innerTransform: ({ first, second, prevState, nextState }) =>
                DicePieceValue.serverTransform(
                    requestedBy,
                    currentState
                )({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ newState }) =>
                    !isCharacterOwner({
                        requestedBy,
                        characterId: newState.ownerCharacterId ?? none,
                        currentRoomState: currentState,
                    }),
                cancelUpdate: ({ nextState }) =>
                    !isCharacterOwner({
                        requestedBy,
                        characterId: nextState.ownerCharacterId ?? anyValue,
                        currentRoomState: currentState,
                    }),
                cancelRemove: ({ state }) =>
                    !isCharacterOwner({
                        requestedBy,
                        characterId: state.ownerCharacterId ?? anyValue,
                        currentRoomState: currentState,
                    }),
            },
        });
        if (dicePieceValues.isError) {
            return dicePieceValues;
        }

        const imagePieceValues = RecordOperation.serverTransform<
            ImagePieceValueTypes.State,
            ImagePieceValueTypes.State,
            ImagePieceValueTypes.TwoWayOperation,
            ImagePieceValueTypes.UpOperation,
            TwoWayError
        >({
            first: serverOperation?.imagePieceValues,
            second: clientOperation.imagePieceValues,
            prevState: prevState.imagePieceValues,
            nextState: currentState.imagePieceValues,
            innerTransform: ({ first, second, prevState, nextState }) =>
                ImagePieceValue.serverTransform(requestedBy)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ newState }) =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: newState.ownerParticipantId ?? none,
                    }),
                cancelUpdate: ({ nextState }) =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: nextState.ownerParticipantId ?? anyValue,
                    }) && nextState.isPrivate,
                cancelRemove: ({ state }) =>
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: state.ownerParticipantId ?? anyValue,
                    }) && state.isPrivate,
            },
        });
        if (imagePieceValues.isError) {
            return imagePieceValues;
        }

        // TODO: ファイルサイズが巨大になりそうなときに拒否する機能
        const memos = RecordOperation.serverTransform<
            MemoTypes.State,
            MemoTypes.State,
            MemoTypes.TwoWayOperation,
            MemoTypes.UpOperation,
            TwoWayError
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
            TwoWayError
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

        const rollCalls = RecordOperation.serverTransform<
            RollCallTypes.State,
            RollCallTypes.State,
            RollCallTypes.TwoWayOperation,
            RollCallTypes.UpOperation,
            TwoWayError
        >({
            first: serverOperation?.rollCalls,
            second: clientOperation.rollCalls,
            prevState: prevState.rollCalls,
            nextState: currentState.rollCalls,
            innerTransform: ({ first, second, prevState, nextState }) =>
                RollCall.serverTransform({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: () => requestedBy.type !== admin,
                cancelUpdate: () => requestedBy.type !== admin,
                cancelRemove: () => requestedBy.type !== admin,
            },
        });
        if (rollCalls.isError) {
            return rollCalls;
        }

        const stringPieceValues = RecordOperation.serverTransform<
            StringPieceValueTypes.State,
            StringPieceValueTypes.State,
            StringPieceValueTypes.TwoWayOperation,
            StringPieceValueTypes.UpOperation,
            TwoWayError
        >({
            first: serverOperation?.stringPieceValues,
            second: clientOperation.stringPieceValues,
            prevState: prevState.stringPieceValues,
            nextState: currentState.stringPieceValues,
            innerTransform: ({ first, second, prevState, nextState }) =>
                StringPieceValue.serverTransform(
                    requestedBy,
                    currentState
                )({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ newState }) =>
                    !isCharacterOwner({
                        requestedBy,
                        characterId: newState.ownerCharacterId ?? none,
                        currentRoomState: currentState,
                    }),
                cancelUpdate: ({ nextState }) =>
                    !isCharacterOwner({
                        requestedBy,
                        characterId: nextState.ownerCharacterId ?? anyValue,
                        currentRoomState: currentState,
                    }),
                cancelRemove: ({ state }) =>
                    !isCharacterOwner({
                        requestedBy,
                        characterId: state.ownerCharacterId ?? anyValue,
                        currentRoomState: currentState,
                    }),
            },
        });
        if (stringPieceValues.isError) {
            return stringPieceValues;
        }

        const strParamNames = RecordOperation.serverTransform<
            ParamNamesTypes.State,
            ParamNamesTypes.State,
            ParamNamesTypes.TwoWayOperation,
            ParamNamesTypes.UpOperation,
            TwoWayError
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
            TwoWayError
        >({
            prevState: prevState.participants,
            nextState: currentState.participants,
            first: serverOperation?.participants,
            second: clientOperation.participants,
            innerTransform: ({ prevState, nextState, first, second, key }) =>
                Participant.serverTransform({
                    requestedBy,
                    participantKey: key,
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
            $v: 2,
            $r: 1,
            bgms: bgms.value,
            boards: boards.value,
            characters: characters.value,
            boolParamNames: boolParamNames.value,
            dicePieceValues: dicePieceValues.value,
            imagePieceValues: imagePieceValues.value,
            memos: memos.value,
            numParamNames: numParamNames.value,
            stringPieceValues: stringPieceValues.value,
            strParamNames: strParamNames.value,
            participants: participants.value,
            rollCalls: rollCalls.value,
        };

        // activeBoardIdには、自分が作成したBoardしか設定できない。ただし、nullishにするのは誰でもできる。
        if (clientOperation.activeBoardId != null) {
            if (
                clientOperation.activeBoardId.newValue == null ||
                isBoardOwner({
                    requestedBy,
                    boardId: clientOperation.activeBoardId.newValue,
                    currentRoomState: currentState,
                }) === true
            ) {
                twoWayOperation.activeBoardId = ReplaceOperation.serverTransform({
                    first: serverOperation?.activeBoardId,
                    second: clientOperation.activeBoardId,
                    prevState: prevState.activeBoardId,
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
        twoWayOperation.name = name.value;

        for (const i of oneToTenArray) {
            const key = `characterTag${i}Name` as const;
            const transformed = NullableTextOperation.serverTransform({
                first: serverOperation?.[key],
                second: clientOperation[key],
                prevState: prevState[key],
            });
            if (transformed.isError) {
                return transformed;
            }
            twoWayOperation[key] = transformed.value;
        }

        for (const i of oneToTenArray) {
            const key = `publicChannel${i}Name` as const;
            const transformed = TextOperation.serverTransform({
                first: serverOperation?.[key],
                second: clientOperation[key],
                prevState: prevState[key],
            });
            if (transformed.isError) {
                return transformed;
            }
            twoWayOperation[key] = transformed.value;
        }

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const activeBoardId = ReplaceOperation.clientTransform({
        first: first.activeBoardId,
        second: second.activeBoardId,
    });

    const bgms = RecordOperation.clientTransform<BgmTypes.State, BgmTypes.UpOperation, UpError>({
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
        UpError
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

    const boards = RecordOperation.clientTransform<
        BoardTypes.State,
        BoardTypes.UpOperation,
        UpError
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

    const characters = RecordOperation.clientTransform<
        CharacterTypes.State,
        CharacterTypes.UpOperation,
        UpError
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

    const dicePieceValues = RecordOperation.clientTransform<
        DicePieceValueTypes.State,
        DicePieceValueTypes.UpOperation,
        UpError
    >({
        first: first.dicePieceValues,
        second: second.dicePieceValues,
        innerTransform: params => DicePieceValue.clientTransform(params),
        innerDiff: params => {
            const diff = DicePieceValue.diff(params);
            if (diff == null) {
                return diff;
            }
            return DicePieceValue.toUpOperation(diff);
        },
    });
    if (dicePieceValues.isError) {
        return dicePieceValues;
    }

    const imagePieceValues = RecordOperation.clientTransform<
        ImagePieceValueTypes.State,
        ImagePieceValueTypes.UpOperation,
        UpError
    >({
        first: first.imagePieceValues,
        second: second.imagePieceValues,
        innerTransform: params => ImagePieceValue.clientTransform(params),
        innerDiff: params => {
            const diff = ImagePieceValue.diff(params);
            if (diff == null) {
                return diff;
            }
            return ImagePieceValue.toUpOperation(diff);
        },
    });
    if (imagePieceValues.isError) {
        return imagePieceValues;
    }

    const memos = RecordOperation.clientTransform<MemoTypes.State, MemoTypes.UpOperation, UpError>({
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
        UpError
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

    const rollCalls = RecordOperation.clientTransform<
        RollCallTypes.State,
        RollCallTypes.UpOperation,
        UpError
    >({
        first: first.rollCalls,
        second: second.rollCalls,
        innerTransform: params => RollCall.clientTransform(params),
        innerDiff: params => {
            const diff = RollCall.diff(params);
            if (diff == null) {
                return diff;
            }
            return RollCall.toUpOperation(diff);
        },
    });
    if (rollCalls.isError) {
        return rollCalls;
    }

    const stringPieceValues = RecordOperation.clientTransform<
        StringPieceValueTypes.State,
        StringPieceValueTypes.UpOperation,
        UpError
    >({
        first: first.stringPieceValues,
        second: second.stringPieceValues,
        innerTransform: params => StringPieceValue.clientTransform(params),
        innerDiff: params => {
            const diff = StringPieceValue.diff(params);
            if (diff == null) {
                return diff;
            }
            return StringPieceValue.toUpOperation(diff);
        },
    });
    if (stringPieceValues.isError) {
        return stringPieceValues;
    }

    const strParamNames = RecordOperation.clientTransform<
        ParamNamesTypes.State,
        ParamNamesTypes.UpOperation,
        UpError
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
        UpError
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
        $v: 2,
        $r: 1,
        activeBoardId: activeBoardId.firstPrime,
        bgms: bgms.value.firstPrime,
        boards: boards.value.firstPrime,
        boolParamNames: boolParamNames.value.firstPrime,
        characters: characters.value.firstPrime,
        dicePieceValues: dicePieceValues.value.firstPrime,
        imagePieceValues: imagePieceValues.value.firstPrime,
        memos: memos.value.firstPrime,
        numParamNames: numParamNames.value.firstPrime,
        stringPieceValues: stringPieceValues.value.firstPrime,
        strParamNames: strParamNames.value.firstPrime,
        participants: participants.value.firstPrime,
        rollCalls: rollCalls.value.firstPrime,
        name: name.value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 2,
        $r: 1,
        activeBoardId: activeBoardId.secondPrime,
        bgms: bgms.value.secondPrime,
        boards: boards.value.secondPrime,
        boolParamNames: boolParamNames.value.secondPrime,
        characters: characters.value.secondPrime,
        dicePieceValues: dicePieceValues.value.secondPrime,
        imagePieceValues: imagePieceValues.value.secondPrime,
        memos: memos.value.secondPrime,
        numParamNames: numParamNames.value.secondPrime,
        stringPieceValues: stringPieceValues.value.secondPrime,
        strParamNames: strParamNames.value.secondPrime,
        participants: participants.value.secondPrime,
        rollCalls: rollCalls.value.secondPrime,
        name: name.value.secondPrime,
    };

    for (const i of oneToTenArray) {
        const key = `characterTag${i}Name` as const;
        const operation = NullableTextOperation.clientTransform({
            first: first[key],
            second: second[key],
        });
        if (operation.isError) {
            return operation;
        }
        firstPrime[key] = operation.value.firstPrime;
        secondPrime[key] = operation.value.secondPrime;
    }

    for (const i of oneToTenArray) {
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
