import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../generator/types';
import { isIdRecord } from '../../../record';
import * as RecordOperation from '../../../recordOperation';
import {
    RequestedBy,
    admin,
    anyValue,
    canChangeCharacterValue,
    canChangeOwnerParticipantId,
    isOwner,
    none,
} from '../../../requestedBy';
import * as TextOperation from '../../../textOperation';
import * as ReplaceOperation from '../../../util/replaceOperation';
import { ServerTransform, TwoWayError } from '../../../util/type';
import * as Room from '../types';
import * as DeckPiece from './deckPiece/functions';
import * as DeckPieceTypes from './deckPiece/types';
import * as DicePiece from './dicePiece/functions';
import * as DicePieceTypes from './dicePiece/types';
import * as ImagePiece from './imagePiece/functions';
import * as ImagePieceTypes from './imagePiece/types';
import * as ShapePiece from './shapePiece/functions';
import * as ShapePieceTypes from './shapePiece/types';
import * as StringPiece from './stringPiece/functions';
import * as StringPieceTypes from './stringPiece/types';
import { template } from './types';

export const toClientState =
    (requestedBy: RequestedBy, currentRoomState: State<typeof Room.template>) =>
    (source: State<typeof template>): State<typeof template> => {
        return {
            ...source,
            deckPieces: RecordOperation.toClientState<
                State<typeof DeckPieceTypes.template>,
                State<typeof DeckPieceTypes.template>
            >({
                serverState: source.deckPieces,
                isPrivate: () => false,
                toClientState: ({ state }) => DeckPiece.toClientState(requestedBy)(state),
            }),
            dicePieces: RecordOperation.toClientState<
                State<typeof DicePieceTypes.template>,
                State<typeof DicePieceTypes.template>
            >({
                serverState: source.dicePieces,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    DicePiece.toClientState(requestedBy, currentRoomState)(state),
            }),
            imagePieces: RecordOperation.toClientState<
                State<typeof ImagePieceTypes.template>,
                State<typeof ImagePieceTypes.template>
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
            shapePieces: RecordOperation.toClientState<
                State<typeof ShapePieceTypes.template>,
                State<typeof ShapePieceTypes.template>
            >({
                serverState: source.shapePieces,
                isPrivate: state =>
                    state.isPrivate &&
                    !isOwner({
                        requestedBy,
                        ownerParticipantId: state.ownerParticipantId ?? anyValue,
                    }),
                toClientState: ({ state }) => ShapePiece.toClientState(state),
            }),
            stringPieces: RecordOperation.toClientState<
                State<typeof StringPieceTypes.template>,
                State<typeof StringPieceTypes.template>
            >({
                serverState: source.stringPieces,
                isPrivate: () => false,
                toClientState: ({ state }) =>
                    StringPiece.toClientState(requestedBy, currentRoomState)(state),
            }),
        };
    };

export const serverTransform =
    (
        requestedBy: RequestedBy,
        currentRoomState: State<typeof Room.template>,
    ): ServerTransform<
        State<typeof template>,
        TwoWayOperation<typeof template>,
        UpOperation<typeof template>
    > =>
    ({
        stateBeforeServerOperation,
        stateAfterServerOperation,
        clientOperation,
        serverOperation,
    }) => {
        const cancellationPolicyOfCharacterPieces: RecordOperation.CancellationPolicy<
            string,
            { ownerCharacterId: string | undefined }
        > = {
            cancelCreate: ({ newState }) =>
                !canChangeCharacterValue({
                    requestedBy,
                    characterId: newState.ownerCharacterId ?? none,
                    currentRoomState,
                }),
            cancelRemove: ({ state }) =>
                !canChangeCharacterValue({
                    requestedBy,
                    characterId: state.ownerCharacterId ?? anyValue,
                    currentRoomState,
                }),
        };
        const cancellationPolicyOfParticipantPieces: RecordOperation.CancellationPolicy<
            string,
            { ownerParticipantId: string | undefined }
        > = {
            cancelCreate: ({ newState }) =>
                !isOwner({
                    requestedBy,
                    ownerParticipantId: newState.ownerParticipantId ?? none,
                }),
            cancelRemove: ({ state }) =>
                !isOwner({
                    requestedBy,
                    ownerParticipantId: state.ownerParticipantId ?? anyValue,
                }),
        };

        const deckPieces = RecordOperation.serverTransform<
            State<typeof DeckPieceTypes.template>,
            State<typeof DeckPieceTypes.template>,
            TwoWayOperation<typeof DeckPieceTypes.template>,
            UpOperation<typeof DeckPieceTypes.template>,
            TwoWayError
        >({
            first: serverOperation?.deckPieces,
            second: clientOperation.deckPieces,
            stateBeforeFirst: stateBeforeServerOperation.deckPieces ?? {},
            stateAfterFirst: stateAfterServerOperation.deckPieces ?? {},
            innerTransform: ({ first, second, prevState, nextState }) =>
                DeckPiece.serverTransform(requestedBy)({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                cancelCreate: () => requestedBy.type !== admin,
                cancelRemove: () => requestedBy.type !== admin,
            },
        });
        if (deckPieces.isError) {
            return deckPieces;
        }

        const dicePieces = RecordOperation.serverTransform<
            State<typeof DicePieceTypes.template>,
            State<typeof DicePieceTypes.template>,
            TwoWayOperation<typeof DicePieceTypes.template>,
            UpOperation<typeof DicePieceTypes.template>,
            TwoWayError
        >({
            first: serverOperation?.dicePieces,
            second: clientOperation.dicePieces,
            stateBeforeFirst: stateBeforeServerOperation.dicePieces ?? {},
            stateAfterFirst: stateAfterServerOperation.dicePieces ?? {},
            innerTransform: ({ first, second, prevState, nextState }) =>
                DicePiece.serverTransform(
                    requestedBy,
                    currentRoomState,
                )({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: cancellationPolicyOfCharacterPieces,
        });
        if (dicePieces.isError) {
            return dicePieces;
        }

        const imagePieces = RecordOperation.serverTransform<
            State<typeof ImagePieceTypes.template>,
            State<typeof ImagePieceTypes.template>,
            TwoWayOperation<typeof ImagePieceTypes.template>,
            UpOperation<typeof ImagePieceTypes.template>,
            TwoWayError
        >({
            first: serverOperation?.imagePieces,
            second: clientOperation.imagePieces,
            stateBeforeFirst: stateBeforeServerOperation.imagePieces ?? {},
            stateAfterFirst: stateAfterServerOperation.imagePieces ?? {},
            innerTransform: ({ first, second, prevState, nextState }) =>
                ImagePiece.serverTransform(requestedBy)({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: cancellationPolicyOfParticipantPieces,
        });
        if (imagePieces.isError) {
            return imagePieces;
        }

        const shapePieces = RecordOperation.serverTransform<
            State<typeof ShapePieceTypes.template>,
            State<typeof ShapePieceTypes.template>,
            TwoWayOperation<typeof ShapePieceTypes.template>,
            UpOperation<typeof ShapePieceTypes.template>,
            TwoWayError
        >({
            first: serverOperation?.shapePieces,
            second: clientOperation.shapePieces,
            stateBeforeFirst: stateBeforeServerOperation.shapePieces ?? {},
            stateAfterFirst: stateAfterServerOperation.shapePieces ?? {},
            innerTransform: ({ first, second, prevState, nextState }) =>
                ShapePiece.serverTransform(requestedBy)({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: cancellationPolicyOfParticipantPieces,
        });
        if (shapePieces.isError) {
            return shapePieces;
        }

        const stringPieces = RecordOperation.serverTransform<
            State<typeof StringPieceTypes.template>,
            State<typeof StringPieceTypes.template>,
            TwoWayOperation<typeof StringPieceTypes.template>,
            UpOperation<typeof StringPieceTypes.template>,
            TwoWayError
        >({
            first: serverOperation?.stringPieces,
            second: clientOperation.stringPieces,
            stateBeforeFirst: stateBeforeServerOperation.stringPieces ?? {},
            stateAfterFirst: stateAfterServerOperation.stringPieces ?? {},
            innerTransform: ({ first, second, prevState, nextState }) =>
                StringPiece.serverTransform(
                    requestedBy,
                    currentRoomState,
                )({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: cancellationPolicyOfCharacterPieces,
        });
        if (stringPieces.isError) {
            return stringPieces;
        }

        const twoWayOperation: TwoWayOperation<typeof template> = {
            $v: 2,
            $r: 1,
            deckPieces: deckPieces.value,
            dicePieces: dicePieces.value,
            imagePieces: imagePieces.value,
            shapePieces: shapePieces.value,
            stringPieces: stringPieces.value,
        };

        twoWayOperation.backgroundImage = ReplaceOperation.serverTransform({
            first: serverOperation?.backgroundImage,
            second: clientOperation.backgroundImage,
            prevState: stateBeforeServerOperation.backgroundImage,
        });
        twoWayOperation.backgroundImageZoom = ReplaceOperation.serverTransform({
            first: serverOperation?.backgroundImageZoom,
            second: clientOperation.backgroundImageZoom,
            prevState: stateBeforeServerOperation.backgroundImageZoom,
        });
        twoWayOperation.cellColumnCount = ReplaceOperation.serverTransform({
            first: serverOperation?.cellColumnCount,
            second: clientOperation.cellColumnCount,
            prevState: stateBeforeServerOperation.cellColumnCount,
        });
        twoWayOperation.cellHeight = ReplaceOperation.serverTransform({
            first: serverOperation?.cellHeight,
            second: clientOperation.cellHeight,
            prevState: stateBeforeServerOperation.cellHeight,
        });
        twoWayOperation.cellOffsetX = ReplaceOperation.serverTransform({
            first: serverOperation?.cellOffsetX,
            second: clientOperation.cellOffsetX,
            prevState: stateBeforeServerOperation.cellOffsetX,
        });
        twoWayOperation.cellOffsetY = ReplaceOperation.serverTransform({
            first: serverOperation?.cellOffsetY,
            second: clientOperation.cellOffsetY,
            prevState: stateBeforeServerOperation.cellOffsetY,
        });
        twoWayOperation.cellRowCount = ReplaceOperation.serverTransform({
            first: serverOperation?.cellRowCount,
            second: clientOperation.cellRowCount,
            prevState: stateBeforeServerOperation.cellRowCount,
        });
        twoWayOperation.cellWidth = ReplaceOperation.serverTransform({
            first: serverOperation?.cellWidth,
            second: clientOperation.cellWidth,
            prevState: stateBeforeServerOperation.cellWidth,
        });
        const name = TextOperation.serverTransform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: stateBeforeServerOperation.name,
        });
        if (name.isError) {
            return name;
        }
        twoWayOperation.name = name.value;

        if (
            canChangeOwnerParticipantId({
                requestedBy,
                currentOwnerParticipant: stateAfterServerOperation,
            })
        ) {
            twoWayOperation.ownerParticipantId = ReplaceOperation.serverTransform({
                first: serverOperation?.ownerParticipantId,
                second: clientOperation.ownerParticipantId,
                prevState: stateBeforeServerOperation.ownerParticipantId,
            });
        }

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
