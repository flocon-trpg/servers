import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../generator';
import { isIdRecord } from '../../../record';
import * as RecordOperation from '../../../recordOperation';
import {
    RequestedBy,
    canChangeOwnerParticipantId,
    isBoardVisible,
    isOwner,
    none,
} from '../../../requestedBy';
import * as TextOperation from '../../../textOperation';
import * as ParamRecordOperation from '../../../util/paramRecordOperation';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { ServerTransform, TwoWayError } from '../../../util/type';
import * as Room from '../types';
import * as BoolParam from './boolParam/functions';
import * as CharacterPiece from './characterPiece/functions';
import * as CharacterPieceTypes from './characterPiece/types';
import * as Command from './command/functions';
import * as CommandTypes from './command/types';
import * as NumParam from './numParam/functions';
import * as PortraitPiece from './portraitPiece/functions';
import * as PortraitPieceTypes from './portraitPiece/types';
import * as StrParam from './strParam/functions';
import {
    defaultBoolParamState,
    defaultNumParamState,
    defaultStrParamState,
    template,
} from './types';

const oneToTenArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export const toClientState =
    (
        isAuthorized: boolean,
        requestedBy: RequestedBy,
        currentRoomState: State<typeof Room.template>
    ) =>
    (source: State<typeof template>): State<typeof template> => {
        return {
            ...source,
            chatPalette: isAuthorized ? source.chatPalette : '',
            privateVarToml: isAuthorized ? source.privateVarToml : '',
            boolParams: RecordOperation.toClientState({
                serverState: source.boolParams,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    BoolParam.toClientState(isAuthorized, undefined)(state),
            }),
            numParams: RecordOperation.toClientState({
                serverState: source.numParams,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    NumParam.toClientState(isAuthorized, undefined)(state),
            }),
            numMaxParams: RecordOperation.toClientState({
                serverState: source.numMaxParams,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    NumParam.toClientState(isAuthorized, undefined)(state),
            }),
            strParams: RecordOperation.toClientState({
                serverState: source.strParams,
                isPrivate: () => false,
                toClientState: ({ state }) => StrParam.toClientState(isAuthorized)(state),
            }),
            pieces: RecordOperation.toClientState<
                State<typeof CharacterPieceTypes.template>,
                State<typeof CharacterPieceTypes.template>
            >({
                serverState: source.pieces,
                isPrivate: state =>
                    !isBoardVisible({
                        requestedBy,
                        boardId: state.boardId,
                        currentRoomState,
                    }),
                toClientState: ({ state }) => CharacterPiece.toClientState(state),
            }),
            privateCommands: RecordOperation.toClientState<
                State<typeof CommandTypes.template>,
                State<typeof CommandTypes.template>
            >({
                serverState: source.privateCommands,
                isPrivate: () => !isAuthorized,
                toClientState: ({ state }) => Command.toClientState(state),
            }),
            portraitPieces: RecordOperation.toClientState<
                State<typeof PortraitPieceTypes.template>,
                State<typeof PortraitPieceTypes.template>
            >({
                serverState: source.portraitPieces,
                isPrivate: state =>
                    !isBoardVisible({
                        requestedBy,
                        boardId: state.boardId,
                        currentRoomState,
                    }),
                toClientState: ({ state }) => PortraitPiece.toClientState(state),
            }),
        };
    };

export const serverTransform =
    (
        isAuthorized: boolean,
        requestedBy: RequestedBy,
        currentRoomState: State<typeof Room.template>
    ): ServerTransform<
        State<typeof template>,
        TwoWayOperation<typeof template>,
        UpOperation<typeof template>
    > =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        if (!isAuthorized && currentState.isPrivate) {
            return Result.ok(undefined);
        }

        const boolParams = ParamRecordOperation.serverTransform({
            prevState: prevState.boolParams ?? {},
            nextState: currentState.boolParams ?? {},
            first: serverOperation?.boolParams,
            second: clientOperation.boolParams,
            innerTransform: ({ prevState, nextState, first, second }) =>
                BoolParam.serverTransform(isAuthorized)({
                    prevState,
                    currentState: nextState,
                    serverOperation: { ...first, $v: 2, $r: 1 },
                    clientOperation: { ...second, $v: 2, $r: 1 },
                }),
            defaultState: defaultBoolParamState,
        });
        if (boolParams.isError) {
            return boolParams;
        }

        const numParams = ParamRecordOperation.serverTransform({
            prevState: prevState.numParams ?? {},
            nextState: currentState.numParams ?? {},
            first: serverOperation?.numParams,
            second: clientOperation.numParams,
            innerTransform: ({ prevState, nextState, first, second }) =>
                NumParam.serverTransform(isAuthorized)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            defaultState: defaultNumParamState,
        });
        if (numParams.isError) {
            return numParams;
        }

        const numMaxParams = ParamRecordOperation.serverTransform({
            prevState: prevState.numMaxParams ?? {},
            nextState: currentState.numMaxParams ?? {},
            first: serverOperation?.numMaxParams,
            second: clientOperation.numMaxParams,
            innerTransform: ({ prevState, nextState, first, second }) =>
                NumParam.serverTransform(isAuthorized)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            defaultState: defaultNumParamState,
        });
        if (numMaxParams.isError) {
            return numMaxParams;
        }

        const strParams = ParamRecordOperation.serverTransform({
            prevState: prevState.strParams ?? {},
            nextState: currentState.strParams ?? {},
            first: serverOperation?.strParams,
            second: clientOperation.strParams,
            innerTransform: ({ prevState, nextState, first, second }) =>
                StrParam.serverTransform(isAuthorized)({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            defaultState: defaultStrParamState,
        });
        if (strParams.isError) {
            return strParams;
        }

        const pieces = RecordOperation.serverTransform<
            State<typeof CharacterPieceTypes.template>,
            State<typeof CharacterPieceTypes.template>,
            TwoWayOperation<typeof CharacterPieceTypes.template>,
            UpOperation<typeof CharacterPieceTypes.template>,
            TwoWayError
        >({
            prevState: prevState.pieces,
            nextState: currentState.pieces,
            first: serverOperation?.pieces,
            second: clientOperation.pieces,
            innerTransform: ({ prevState, nextState, first, second }) =>
                CharacterPiece.serverTransform({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ newState }) =>
                    !isBoardVisible({
                        requestedBy,
                        currentRoomState,
                        boardId: newState.boardId,
                    }) ||
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: currentState.ownerParticipantId ?? none,
                    }),
                cancelRemove: params => {
                    if (
                        !isBoardVisible({
                            requestedBy,
                            currentRoomState,
                            boardId: params.state.boardId,
                        })
                    ) {
                        return true;
                    }
                    return !isAuthorized && params.state.isPrivate;
                },
                cancelUpdate: params => {
                    if (
                        !isBoardVisible({
                            requestedBy,
                            currentRoomState,
                            boardId: params.nextState.boardId,
                        })
                    ) {
                        return true;
                    }
                    return !isAuthorized && params.nextState.isPrivate;
                },
            },
        });
        if (pieces.isError) {
            return pieces;
        }

        const privateCommands = RecordOperation.serverTransform<
            State<typeof CommandTypes.template>,
            State<typeof CommandTypes.template>,
            TwoWayOperation<typeof CommandTypes.template>,
            UpOperation<typeof CommandTypes.template>,
            TwoWayError
        >({
            prevState: prevState.privateCommands,
            nextState: currentState.privateCommands,
            first: serverOperation?.privateCommands,
            second: clientOperation.privateCommands,
            innerTransform: ({ prevState, nextState, first, second }) =>
                Command.serverTransform({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: () => !isAuthorized,
                cancelRemove: () => !isAuthorized,
                cancelUpdate: () => !isAuthorized,
            },
        });
        if (privateCommands.isError) {
            return privateCommands;
        }

        const portraitPositions = RecordOperation.serverTransform<
            State<typeof PortraitPieceTypes.template>,
            State<typeof PortraitPieceTypes.template>,
            TwoWayOperation<typeof PortraitPieceTypes.template>,
            UpOperation<typeof PortraitPieceTypes.template>,
            TwoWayError
        >({
            prevState: prevState.portraitPieces,
            nextState: currentState.portraitPieces,
            first: serverOperation?.portraitPieces,
            second: clientOperation.portraitPieces,
            innerTransform: ({ prevState, nextState, first, second }) =>
                PortraitPiece.serverTransform({
                    prevState,
                    currentState: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: ({ newState }) =>
                    !isBoardVisible({
                        requestedBy,
                        currentRoomState,
                        boardId: newState.boardId,
                    }) ||
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: currentState.ownerParticipantId ?? none,
                    }),
                cancelRemove: params => {
                    if (
                        !isBoardVisible({
                            requestedBy,
                            currentRoomState,
                            boardId: params.state.boardId,
                        })
                    ) {
                        return true;
                    }
                    return !isAuthorized && params.state.isPrivate;
                },
                cancelUpdate: params => {
                    if (
                        !isBoardVisible({
                            requestedBy,
                            currentRoomState,
                            boardId: params.nextState.boardId,
                        })
                    ) {
                        return true;
                    }
                    return !isAuthorized && params.nextState.isPrivate;
                },
            },
        });
        if (portraitPositions.isError) {
            return portraitPositions;
        }

        const twoWayOperation: TwoWayOperation<typeof template> = {
            $v: 2,
            $r: 1,
            boolParams: boolParams.value,
            numParams: numParams.value,
            numMaxParams: numMaxParams.value,
            strParams: strParams.value,
            pieces: pieces.value,
            privateCommands: privateCommands.value,
            portraitPieces: portraitPositions.value,
        };

        if (canChangeOwnerParticipantId({ requestedBy, currentOwnerParticipant: currentState })) {
            twoWayOperation.ownerParticipantId = ReplaceOperation.serverTransform({
                first: serverOperation?.ownerParticipantId,
                second: clientOperation.ownerParticipantId,
                prevState: prevState.ownerParticipantId,
            });
        }
        twoWayOperation.image = ReplaceOperation.serverTransform({
            first: serverOperation?.image,
            second: clientOperation.image,
            prevState: prevState.image,
        });
        twoWayOperation.portraitImage = ReplaceOperation.serverTransform({
            first: serverOperation?.portraitImage,
            second: clientOperation.portraitImage,
            prevState: prevState.portraitImage,
        });
        twoWayOperation.isPrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isPrivate,
            second: clientOperation.isPrivate,
            prevState: prevState.isPrivate,
        });
        for (const index of oneToTenArray) {
            const key = `hasTag${index}` as const;
            twoWayOperation[key] = ReplaceOperation.serverTransform({
                first: serverOperation?.[key],
                second: clientOperation[key],
                prevState: prevState[key],
            });
        }
        const transformedMemo = TextOperation.serverTransform({
            first: serverOperation?.memo,
            second: clientOperation.memo,
            prevState: prevState.memo,
        });
        if (transformedMemo.isError) {
            return transformedMemo;
        }
        twoWayOperation.memo = transformedMemo.value;
        const transformedName = TextOperation.serverTransform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });
        if (transformedName.isError) {
            return transformedName;
        }
        twoWayOperation.name = transformedName.value;
        if (isAuthorized) {
            const transformedChatPalette = TextOperation.serverTransform({
                first: serverOperation?.chatPalette,
                second: clientOperation.chatPalette,
                prevState: prevState.chatPalette,
            });
            if (transformedChatPalette.isError) {
                return transformedChatPalette;
            }
            twoWayOperation.chatPalette = transformedChatPalette.value;
        }
        if (isAuthorized) {
            const transformed = TextOperation.serverTransform({
                first: serverOperation?.privateVarToml,
                second: clientOperation.privateVarToml,
                prevState: prevState.privateVarToml,
            });
            if (transformed.isError) {
                return transformed;
            }
            twoWayOperation.privateVarToml = transformed.value;
        }

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
