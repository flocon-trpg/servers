import * as ReplaceOperation from '../../util/replaceOperation';
import * as RecordOperation from '../../util/recordOperation';
import * as TextOperation from '../../util/textOperation';
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
} from '../../util/type';
import { isIdRecord } from '../../util/record';
import { Result } from '@kizahasi/result';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';
import {
    RequestedBy,
    canChangeOwnerParticipantId,
    isOwner,
    anyValue,
    none,
    isCharacterOwner,
} from '../../util/requestedBy';
import * as DicePieceTypes from './dicePiece/types';
import * as DicePiece from './dicePiece/functions';
import * as ImagePieceTypes from './imagePiece/types';
import * as ImagePiece from './imagePiece/functions';
import * as StringPieceTypes from './stringPiece/types';
import * as StringPiece from './stringPiece/functions';
import * as Room from '../types';
import { chooseRecord } from '@flocon-trpg/utils';
import { mapRecordOperationElement } from '../../util/recordOperationElement';

export const toClientState =
    (requestedBy: RequestedBy, currentRoomState: Room.State) =>
    (source: State): State => {
        return {
            ...source,
            dicePieces: RecordOperation.toClientState<DicePieceTypes.State, DicePieceTypes.State>({
                serverState: source.dicePieces,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    DicePiece.toClientState(requestedBy, currentRoomState)(state),
            }),
            imagePieces: RecordOperation.toClientState<
                ImagePieceTypes.State,
                ImagePieceTypes.State
            >({
                serverState: source.imagePieces,
                isPrivate: state =>
                    state.isPrivate &&
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: state.ownerParticipantId ?? anyValue,
                    }),
                toClientState: ({ state }) => ImagePiece.toClientState(state),
            }),
            stringPieces: RecordOperation.toClientState<
                StringPieceTypes.State,
                StringPieceTypes.State
            >({
                serverState: source.stringPieces,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    StringPiece.toClientState(requestedBy, currentRoomState)(state),
            }),
        };
    };

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        name: source.name == null ? undefined : TextOperation.toDownOperation(source.name),
        dicePieces:
            source.dicePieces == null
                ? undefined
                : chooseRecord(source.dicePieces, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: DicePiece.toDownOperation,
                      })
                  ),
        imagePieces:
            source.imagePieces == null
                ? undefined
                : chooseRecord(source.imagePieces, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: ImagePiece.toDownOperation,
                      })
                  ),
        stringPieces:
            source.stringPieces == null
                ? undefined
                : chooseRecord(source.stringPieces, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: StringPiece.toDownOperation,
                      })
                  ),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        name: source.name == null ? undefined : TextOperation.toUpOperation(source.name),
        dicePieces:
            source.dicePieces == null
                ? undefined
                : chooseRecord(source.dicePieces, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: DicePiece.toUpOperation,
                      })
                  ),
        imagePieces:
            source.imagePieces == null
                ? undefined
                : chooseRecord(source.imagePieces, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: ImagePiece.toUpOperation,
                      })
                  ),
        stringPieces:
            source.stringPieces == null
                ? undefined
                : chooseRecord(source.stringPieces, operation =>
                      mapRecordOperationElement({
                          source: operation,
                          mapReplace: x => x,
                          mapOperation: StringPiece.toUpOperation,
                      })
                  ),
    };
};

export const apply: Apply<State, UpOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    if (operation.backgroundImage != null) {
        result.backgroundImage = operation.backgroundImage.newValue;
    }

    if (operation.backgroundImageZoom != null) {
        result.backgroundImageZoom = operation.backgroundImageZoom.newValue;
    }

    if (operation.cellColumnCount != null) {
        result.cellColumnCount = operation.cellColumnCount.newValue;
    }

    if (operation.cellHeight != null) {
        result.cellHeight = operation.cellHeight.newValue;
    }

    if (operation.cellOffsetX != null) {
        result.cellOffsetX = operation.cellOffsetX.newValue;
    }

    if (operation.cellOffsetY != null) {
        result.cellOffsetY = operation.cellOffsetY.newValue;
    }

    if (operation.cellRowCount != null) {
        result.cellRowCount = operation.cellRowCount.newValue;
    }

    if (operation.cellWidth != null) {
        result.cellWidth = operation.cellWidth.newValue;
    }

    const dicePieces = RecordOperation.apply<
        DicePieceTypes.State,
        DicePieceTypes.UpOperation,
        ScalarError
    >({
        prevState: state.dicePieces,
        operation: operation.dicePieces,
        innerApply: ({ prevState, operation }) => {
            return DicePiece.apply({
                state: prevState,
                operation,
            });
        },
    });
    if (dicePieces.isError) {
        return dicePieces;
    }
    result.dicePieces = dicePieces.value;

    const imagePieces = RecordOperation.apply<
        ImagePieceTypes.State,
        ImagePieceTypes.UpOperation,
        ScalarError
    >({
        prevState: state.imagePieces,
        operation: operation.imagePieces,
        innerApply: ({ prevState, operation }) => {
            return ImagePiece.apply({
                state: prevState,
                operation,
            });
        },
    });
    if (imagePieces.isError) {
        return imagePieces;
    }
    result.imagePieces = imagePieces.value;

    if (operation.name != null) {
        const applied = TextOperation.apply(state.name, operation.name);
        if (applied.isError) {
            return applied;
        }
        result.name = applied.value;
    }

    if (operation.ownerParticipantId != null) {
        result.ownerParticipantId = operation.ownerParticipantId.newValue;
    }

    const stringPieces = RecordOperation.apply<
        StringPieceTypes.State,
        StringPieceTypes.UpOperation,
        ScalarError
    >({
        prevState: state.stringPieces,
        operation: operation.stringPieces,
        innerApply: ({ prevState, operation }) => {
            return StringPiece.apply({
                state: prevState,
                operation,
            });
        },
    });
    if (stringPieces.isError) {
        return stringPieces;
    }
    result.stringPieces = stringPieces.value;

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result: State = {
        ...state,
    };

    if (operation.backgroundImage !== undefined) {
        result.backgroundImage = operation.backgroundImage.oldValue ?? undefined;
    }

    if (operation.backgroundImageZoom !== undefined) {
        result.backgroundImageZoom = operation.backgroundImageZoom.oldValue ?? undefined;
    }

    if (operation.cellColumnCount !== undefined) {
        result.cellColumnCount = operation.cellColumnCount.oldValue ?? undefined;
    }

    if (operation.cellHeight !== undefined) {
        result.cellHeight = operation.cellHeight.oldValue ?? undefined;
    }

    if (operation.cellOffsetX !== undefined) {
        result.cellOffsetX = operation.cellOffsetX.oldValue ?? undefined;
    }

    if (operation.cellOffsetY !== undefined) {
        result.cellOffsetY = operation.cellOffsetY.oldValue ?? undefined;
    }

    if (operation.cellRowCount !== undefined) {
        result.cellRowCount = operation.cellRowCount.oldValue ?? undefined;
    }

    if (operation.cellWidth !== undefined) {
        result.cellWidth = operation.cellWidth.oldValue ?? undefined;
    }

    const dicePieces = RecordOperation.applyBack<
        DicePieceTypes.State,
        DicePieceTypes.DownOperation,
        ScalarError
    >({
        nextState: state.dicePieces,
        operation: operation.dicePieces,
        innerApplyBack: ({ state, operation }) => {
            return DicePiece.applyBack({
                state,
                operation,
            });
        },
    });
    if (dicePieces.isError) {
        return dicePieces;
    }
    result.dicePieces = dicePieces.value;

    const imagePieces = RecordOperation.applyBack<
        ImagePieceTypes.State,
        ImagePieceTypes.DownOperation,
        ScalarError
    >({
        nextState: state.imagePieces,
        operation: operation.imagePieces,
        innerApplyBack: ({ state, operation }) => {
            return ImagePiece.applyBack({
                state,
                operation,
            });
        },
    });
    if (imagePieces.isError) {
        return imagePieces;
    }
    result.imagePieces = imagePieces.value;

    const stringPieces = RecordOperation.applyBack<
        StringPieceTypes.State,
        StringPieceTypes.DownOperation,
        ScalarError
    >({
        nextState: state.stringPieces,
        operation: operation.stringPieces,
        innerApplyBack: ({ state, operation }) => {
            return StringPiece.applyBack({
                state,
                operation,
            });
        },
    });
    if (stringPieces.isError) {
        return stringPieces;
    }
    result.stringPieces = stringPieces.value;

    if (operation.name != null) {
        const applied = TextOperation.applyBack(state.name, operation.name);
        if (applied.isError) {
            return applied;
        }
        result.name = applied.value;
    }

    if (operation.ownerParticipantId !== undefined) {
        result.ownerParticipantId = operation.ownerParticipantId.oldValue ?? undefined;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
    const dicePieces = RecordOperation.composeDownOperation<
        DicePieceTypes.State,
        DicePieceTypes.DownOperation,
        DownError
    >({
        first: first.dicePieces,
        second: second.dicePieces,
        innerApplyBack: params => DicePiece.applyBack(params),
        innerCompose: params => DicePiece.composeDownOperation(params),
    });
    if (dicePieces.isError) {
        return dicePieces;
    }

    const imagePieces = RecordOperation.composeDownOperation<
        ImagePieceTypes.State,
        ImagePieceTypes.DownOperation,
        DownError
    >({
        first: first.imagePieces,
        second: second.imagePieces,
        innerApplyBack: params => ImagePiece.applyBack(params),
        innerCompose: params => ImagePiece.composeDownOperation(params),
    });
    if (imagePieces.isError) {
        return imagePieces;
    }

    const stringPieces = RecordOperation.composeDownOperation<
        StringPieceTypes.State,
        StringPieceTypes.DownOperation,
        DownError
    >({
        first: first.stringPieces,
        second: second.stringPieces,
        innerApplyBack: params => StringPiece.applyBack(params),
        innerCompose: params => StringPiece.composeDownOperation(params),
    });
    if (stringPieces.isError) {
        return stringPieces;
    }

    const name = TextOperation.composeDownOperation(first.name, second.name);
    if (name.isError) {
        return name;
    }

    const valueProps: DownOperation = {
        $v: 2,
        $r: 1,

        backgroundImage: ReplaceOperation.composeDownOperation(
            first.backgroundImage,
            second.backgroundImage
        ),
        backgroundImageZoom: ReplaceOperation.composeDownOperation(
            first.backgroundImageZoom,
            second.backgroundImageZoom
        ),
        cellColumnCount: ReplaceOperation.composeDownOperation(
            first.cellColumnCount,
            second.cellColumnCount
        ),
        cellHeight: ReplaceOperation.composeDownOperation(first.cellHeight, second.cellHeight),
        cellOffsetX: ReplaceOperation.composeDownOperation(first.cellOffsetX, second.cellOffsetX),
        cellOffsetY: ReplaceOperation.composeDownOperation(first.cellOffsetY, second.cellOffsetY),
        cellRowCount: ReplaceOperation.composeDownOperation(
            first.cellRowCount,
            second.cellRowCount
        ),
        cellWidth: ReplaceOperation.composeDownOperation(first.cellWidth, second.cellWidth),
        dicePieces: dicePieces.value,
        imagePieces: imagePieces.value,
        name: name.value,
        ownerParticipantId: ReplaceOperation.composeDownOperation(
            first.ownerParticipantId,
            second.ownerParticipantId
        ),
        stringPieces: stringPieces.value,
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

    const dicePieces = RecordOperation.restore<
        DicePieceTypes.State,
        DicePieceTypes.DownOperation,
        DicePieceTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: nextState.dicePieces,
        downOperation: downOperation.dicePieces,
        innerDiff: params => DicePiece.diff(params),
        innerRestore: params => DicePiece.restore(params),
    });
    if (dicePieces.isError) {
        return dicePieces;
    }

    const imagePieces = RecordOperation.restore<
        ImagePieceTypes.State,
        ImagePieceTypes.DownOperation,
        ImagePieceTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: nextState.imagePieces,
        downOperation: downOperation.imagePieces,
        innerDiff: params => ImagePiece.diff(params),
        innerRestore: params => ImagePiece.restore(params),
    });
    if (imagePieces.isError) {
        return imagePieces;
    }

    const stringPieces = RecordOperation.restore<
        StringPieceTypes.State,
        StringPieceTypes.DownOperation,
        StringPieceTypes.TwoWayOperation,
        ScalarError
    >({
        nextState: nextState.stringPieces,
        downOperation: downOperation.stringPieces,
        innerDiff: params => StringPiece.diff(params),
        innerRestore: params => StringPiece.restore(params),
    });
    if (stringPieces.isError) {
        return stringPieces;
    }

    const prevState: State = {
        ...nextState,
        dicePieces: dicePieces.value.prevState,
        imagePieces: imagePieces.value.prevState,
        stringPieces: stringPieces.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        $v: 2,
        $r: 1,
        dicePieces: dicePieces.value.twoWayOperation,
        imagePieces: imagePieces.value.twoWayOperation,
        stringPieces: stringPieces.value.twoWayOperation,
    };

    if (downOperation.backgroundImage !== undefined) {
        prevState.backgroundImage = downOperation.backgroundImage.oldValue ?? undefined;
        twoWayOperation.backgroundImage = {
            oldValue: downOperation.backgroundImage.oldValue ?? undefined,
            newValue: nextState.backgroundImage ?? undefined,
        };
    }
    if (downOperation.backgroundImageZoom !== undefined) {
        prevState.backgroundImageZoom = downOperation.backgroundImageZoom.oldValue;
        twoWayOperation.backgroundImageZoom = {
            ...downOperation.backgroundImageZoom,
            newValue: nextState.backgroundImageZoom,
        };
    }
    if (downOperation.cellColumnCount !== undefined) {
        prevState.cellColumnCount = downOperation.cellColumnCount.oldValue;
        twoWayOperation.cellColumnCount = {
            ...downOperation.cellColumnCount,
            newValue: nextState.cellColumnCount,
        };
    }
    if (downOperation.cellHeight !== undefined) {
        prevState.cellHeight = downOperation.cellHeight.oldValue;
        twoWayOperation.cellHeight = {
            ...downOperation.cellHeight,
            newValue: nextState.cellHeight,
        };
    }
    if (downOperation.cellOffsetX !== undefined) {
        prevState.cellOffsetX = downOperation.cellOffsetX.oldValue;
        twoWayOperation.cellOffsetX = {
            ...downOperation.cellOffsetX,
            newValue: nextState.cellOffsetX,
        };
    }
    if (downOperation.cellOffsetY !== undefined) {
        prevState.cellOffsetY = downOperation.cellOffsetY.oldValue;
        twoWayOperation.cellOffsetY = {
            ...downOperation.cellOffsetY,
            newValue: nextState.cellOffsetY,
        };
    }
    if (downOperation.cellRowCount !== undefined) {
        prevState.cellRowCount = downOperation.cellRowCount.oldValue;
        twoWayOperation.cellRowCount = {
            ...downOperation.cellRowCount,
            newValue: nextState.cellRowCount,
        };
    }
    if (downOperation.cellWidth !== undefined) {
        prevState.cellWidth = downOperation.cellWidth.oldValue;
        twoWayOperation.cellWidth = {
            ...downOperation.cellWidth,
            newValue: nextState.cellWidth,
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
    if (downOperation.ownerParticipantId !== undefined) {
        prevState.ownerParticipantId = downOperation.ownerParticipantId.oldValue;
        twoWayOperation.ownerParticipantId = {
            ...downOperation.ownerParticipantId,
            newValue: nextState.ownerParticipantId,
        };
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const dicePieces = RecordOperation.diff<DicePieceTypes.State, DicePieceTypes.TwoWayOperation>({
        prevState: prevState.dicePieces,
        nextState: nextState.dicePieces,
        innerDiff: params => DicePiece.diff(params),
    });
    const imagePieces = RecordOperation.diff<
        ImagePieceTypes.State,
        ImagePieceTypes.TwoWayOperation
    >({
        prevState: prevState.imagePieces,
        nextState: nextState.imagePieces,
        innerDiff: params => ImagePiece.diff(params),
    });
    const stringPieces = RecordOperation.diff<
        StringPieceTypes.State,
        StringPieceTypes.TwoWayOperation
    >({
        prevState: prevState.stringPieces,
        nextState: nextState.stringPieces,
        innerDiff: params => StringPiece.diff(params),
    });

    const resultType: TwoWayOperation = { $v: 2, $r: 1, dicePieces, imagePieces, stringPieces };

    if (prevState.backgroundImage !== nextState.backgroundImage) {
        resultType.backgroundImage = {
            oldValue: prevState.backgroundImage,
            newValue: nextState.backgroundImage,
        };
    }

    if (prevState.backgroundImageZoom !== nextState.backgroundImageZoom) {
        resultType.backgroundImageZoom = {
            oldValue: prevState.backgroundImageZoom,
            newValue: nextState.backgroundImageZoom,
        };
    }

    if (prevState.cellColumnCount !== nextState.cellColumnCount) {
        resultType.cellColumnCount = {
            oldValue: prevState.cellColumnCount,
            newValue: nextState.cellColumnCount,
        };
    }

    if (prevState.cellHeight !== nextState.cellHeight) {
        resultType.cellHeight = {
            oldValue: prevState.cellHeight,
            newValue: nextState.cellHeight,
        };
    }

    if (prevState.cellOffsetX !== nextState.cellOffsetX) {
        resultType.cellOffsetX = {
            oldValue: prevState.cellOffsetX,
            newValue: nextState.cellOffsetX,
        };
    }

    if (prevState.cellOffsetY !== nextState.cellOffsetY) {
        resultType.cellOffsetY = {
            oldValue: prevState.cellOffsetY,
            newValue: nextState.cellOffsetY,
        };
    }

    if (prevState.cellRowCount !== nextState.cellRowCount) {
        resultType.cellRowCount = {
            oldValue: prevState.cellRowCount,
            newValue: nextState.cellRowCount,
        };
    }

    if (prevState.cellWidth !== nextState.cellWidth) {
        resultType.cellWidth = {
            oldValue: prevState.cellWidth,
            newValue: nextState.cellWidth,
        };
    }

    if (prevState.name !== nextState.name) {
        resultType.name = TextOperation.diff({ prev: prevState.name, next: nextState.name });
    }

    if (prevState.ownerParticipantId !== nextState.ownerParticipantId) {
        resultType.ownerParticipantId = {
            oldValue: prevState.ownerParticipantId,
            newValue: nextState.ownerParticipantId,
        };
    }

    if (isIdRecord(resultType)) {
        return undefined;
    }
    return resultType;
};

export const serverTransform =
    (
        requestedBy: RequestedBy,
        currentRoomState: Room.State
    ): ServerTransform<State, TwoWayOperation, UpOperation> =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const dicePieces = RecordOperation.serverTransform<
            DicePieceTypes.State,
            DicePieceTypes.State,
            DicePieceTypes.TwoWayOperation,
            DicePieceTypes.UpOperation,
            TwoWayError
        >({
            first: serverOperation?.dicePieces,
            second: clientOperation.dicePieces,
            prevState: prevState.dicePieces,
            nextState: currentState.dicePieces,
            innerTransform: ({ first, second, prevState, nextState }) =>
                DicePiece.serverTransform(
                    requestedBy,
                    currentRoomState
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
                        currentRoomState,
                    }),
                cancelUpdate: ({ nextState }) =>
                    !isCharacterOwner({
                        requestedBy,
                        characterId: nextState.ownerCharacterId ?? anyValue,
                        currentRoomState,
                    }),
                cancelRemove: ({ state }) =>
                    !isCharacterOwner({
                        requestedBy,
                        characterId: state.ownerCharacterId ?? anyValue,
                        currentRoomState,
                    }),
            },
        });
        if (dicePieces.isError) {
            return dicePieces;
        }

        const imagePieces = RecordOperation.serverTransform<
            ImagePieceTypes.State,
            ImagePieceTypes.State,
            ImagePieceTypes.TwoWayOperation,
            ImagePieceTypes.UpOperation,
            TwoWayError
        >({
            first: serverOperation?.imagePieces,
            second: clientOperation.imagePieces,
            prevState: prevState.imagePieces,
            nextState: currentState.imagePieces,
            innerTransform: ({ first, second, prevState, nextState }) =>
                ImagePiece.serverTransform(requestedBy)({
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
        if (imagePieces.isError) {
            return imagePieces;
        }

        const stringPieces = RecordOperation.serverTransform<
            StringPieceTypes.State,
            StringPieceTypes.State,
            StringPieceTypes.TwoWayOperation,
            StringPieceTypes.UpOperation,
            TwoWayError
        >({
            first: serverOperation?.stringPieces,
            second: clientOperation.stringPieces,
            prevState: prevState.stringPieces,
            nextState: currentState.stringPieces,
            innerTransform: ({ first, second, prevState, nextState }) =>
                StringPiece.serverTransform(
                    requestedBy,
                    currentRoomState
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
                        currentRoomState,
                    }),
                cancelUpdate: ({ nextState }) =>
                    !isCharacterOwner({
                        requestedBy,
                        characterId: nextState.ownerCharacterId ?? anyValue,
                        currentRoomState,
                    }),
                cancelRemove: ({ state }) =>
                    !isCharacterOwner({
                        requestedBy,
                        characterId: state.ownerCharacterId ?? anyValue,
                        currentRoomState,
                    }),
            },
        });
        if (stringPieces.isError) {
            return stringPieces;
        }

        const twoWayOperation: TwoWayOperation = {
            $v: 2,
            $r: 1,
            dicePieces: dicePieces.value,
            imagePieces: imagePieces.value,
            stringPieces: stringPieces.value,
        };

        twoWayOperation.backgroundImage = ReplaceOperation.serverTransform({
            first: serverOperation?.backgroundImage,
            second: clientOperation.backgroundImage,
            prevState: prevState.backgroundImage,
        });
        twoWayOperation.backgroundImageZoom = ReplaceOperation.serverTransform({
            first: serverOperation?.backgroundImageZoom,
            second: clientOperation.backgroundImageZoom,
            prevState: prevState.backgroundImageZoom,
        });
        twoWayOperation.cellColumnCount = ReplaceOperation.serverTransform({
            first: serverOperation?.cellColumnCount,
            second: clientOperation.cellColumnCount,
            prevState: prevState.cellColumnCount,
        });
        twoWayOperation.cellHeight = ReplaceOperation.serverTransform({
            first: serverOperation?.cellHeight,
            second: clientOperation.cellHeight,
            prevState: prevState.cellHeight,
        });
        twoWayOperation.cellOffsetX = ReplaceOperation.serverTransform({
            first: serverOperation?.cellOffsetX,
            second: clientOperation.cellOffsetX,
            prevState: prevState.cellOffsetX,
        });
        twoWayOperation.cellOffsetY = ReplaceOperation.serverTransform({
            first: serverOperation?.cellOffsetY,
            second: clientOperation.cellOffsetY,
            prevState: prevState.cellOffsetY,
        });
        twoWayOperation.cellRowCount = ReplaceOperation.serverTransform({
            first: serverOperation?.cellRowCount,
            second: clientOperation.cellRowCount,
            prevState: prevState.cellRowCount,
        });
        twoWayOperation.cellWidth = ReplaceOperation.serverTransform({
            first: serverOperation?.cellWidth,
            second: clientOperation.cellWidth,
            prevState: prevState.cellWidth,
        });
        const name = TextOperation.serverTransform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });
        if (name.isError) {
            return name;
        }
        twoWayOperation.name = name.value;

        if (
            canChangeOwnerParticipantId({
                requestedBy,
                currentOwnerParticipant: currentState,
            })
        ) {
            twoWayOperation.ownerParticipantId = ReplaceOperation.serverTransform({
                first: serverOperation?.ownerParticipantId,
                second: clientOperation.ownerParticipantId,
                prevState: prevState.ownerParticipantId,
            });
        }

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const backgroundImage = ReplaceOperation.clientTransform({
        first: first.backgroundImage,
        second: second.backgroundImage,
    });

    const backgroundImageZoom = ReplaceOperation.clientTransform({
        first: first.backgroundImageZoom,
        second: second.backgroundImageZoom,
    });

    const cellColumnCount = ReplaceOperation.clientTransform({
        first: first.cellColumnCount,
        second: second.cellColumnCount,
    });

    const cellHeight = ReplaceOperation.clientTransform({
        first: first.cellHeight,
        second: second.cellHeight,
    });

    const cellOffsetX = ReplaceOperation.clientTransform({
        first: first.cellOffsetX,
        second: second.cellOffsetX,
    });

    const cellOffsetY = ReplaceOperation.clientTransform({
        first: first.cellOffsetY,
        second: second.cellOffsetY,
    });

    const cellRowCount = ReplaceOperation.clientTransform({
        first: first.cellRowCount,
        second: second.cellRowCount,
    });

    const cellWidth = ReplaceOperation.clientTransform({
        first: first.cellWidth,
        second: second.cellWidth,
    });

    const dicePieces = RecordOperation.clientTransform<
        DicePieceTypes.State,
        DicePieceTypes.UpOperation,
        UpError
    >({
        first: first.dicePieces,
        second: second.dicePieces,
        innerTransform: params => DicePiece.clientTransform(params),
        innerDiff: params => {
            const diff = DicePiece.diff(params);
            if (diff == null) {
                return diff;
            }
            return DicePiece.toUpOperation(diff);
        },
    });
    if (dicePieces.isError) {
        return dicePieces;
    }

    const imagePieces = RecordOperation.clientTransform<
        ImagePieceTypes.State,
        ImagePieceTypes.UpOperation,
        UpError
    >({
        first: first.imagePieces,
        second: second.imagePieces,
        innerTransform: params => ImagePiece.clientTransform(params),
        innerDiff: params => {
            const diff = ImagePiece.diff(params);
            if (diff == null) {
                return diff;
            }
            return ImagePiece.toUpOperation(diff);
        },
    });
    if (imagePieces.isError) {
        return imagePieces;
    }

    const name = TextOperation.clientTransform({
        first: first.name,
        second: second.name,
    });
    if (name.isError) {
        return name;
    }

    const ownerParticipantId = ReplaceOperation.clientTransform({
        first: first.ownerParticipantId,
        second: second.ownerParticipantId,
    });

    const stringPieces = RecordOperation.clientTransform<
        StringPieceTypes.State,
        StringPieceTypes.UpOperation,
        UpError
    >({
        first: first.stringPieces,
        second: second.stringPieces,
        innerTransform: params => StringPiece.clientTransform(params),
        innerDiff: params => {
            const diff = StringPiece.diff(params);
            if (diff == null) {
                return diff;
            }
            return StringPiece.toUpOperation(diff);
        },
    });
    if (stringPieces.isError) {
        return stringPieces;
    }

    const firstPrime: UpOperation = {
        $v: 2,
        $r: 1,
        backgroundImage: backgroundImage.firstPrime,
        backgroundImageZoom: backgroundImageZoom.firstPrime,
        cellColumnCount: cellColumnCount.firstPrime,
        cellHeight: cellHeight.firstPrime,
        cellOffsetX: cellOffsetX.firstPrime,
        cellOffsetY: cellOffsetY.firstPrime,
        cellRowCount: cellRowCount.firstPrime,
        cellWidth: cellWidth.firstPrime,
        dicePieces: dicePieces.value.firstPrime,
        imagePieces: imagePieces.value.firstPrime,
        name: name.value.firstPrime,
        ownerParticipantId: ownerParticipantId.firstPrime,
        stringPieces: stringPieces.value.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 2,
        $r: 1,
        backgroundImage: backgroundImage.secondPrime,
        backgroundImageZoom: backgroundImageZoom.secondPrime,
        cellColumnCount: cellColumnCount.secondPrime,
        cellHeight: cellHeight.secondPrime,
        cellOffsetX: cellOffsetX.secondPrime,
        cellOffsetY: cellOffsetY.secondPrime,
        cellRowCount: cellRowCount.secondPrime,
        cellWidth: cellWidth.secondPrime,
        dicePieces: dicePieces.value.secondPrime,
        imagePieces: imagePieces.value.secondPrime,
        name: name.value.secondPrime,
        ownerParticipantId: ownerParticipantId.secondPrime,
        stringPieces: stringPieces.value.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
