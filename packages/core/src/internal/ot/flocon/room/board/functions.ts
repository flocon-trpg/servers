import * as ReplaceOperation from '../../../util/replaceOperation';
import * as RecordOperation from '../../../util/recordOperation';
import * as TextOperation from '../../../util/textOperation';
import { ServerTransform, TwoWayError } from '../../../util/type';
import { isIdRecord } from '../../../util/record';
import { Result } from '@kizahasi/result';
import {
    RequestedBy,
    anyValue,
    canChangeOwnerParticipantId,
    isCharacterOwner,
    isOwner,
    none,
} from '../../../util/requestedBy';
import * as DicePieceTypes from './dicePiece/types';
import * as DicePiece from './dicePiece/functions';
import * as ImagePieceTypes from './imagePiece/types';
import * as ImagePiece from './imagePiece/functions';
import * as ShapePiece from './shapePiece/functions';
import * as ShapePieceTypes from './shapePiece/types';
import * as StringPieceTypes from './stringPiece/types';
import * as StringPiece from './stringPiece/functions';
import * as Room from '../types';
import { template } from './types';
import { State, TwoWayOperation, UpOperation } from '../../../generator';

export const toClientState =
    (requestedBy: RequestedBy, currentRoomState: State<typeof Room.template>) =>
    (source: State<typeof template>): State<typeof template> => {
        return {
            ...source,
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
        currentRoomState: State<typeof Room.template>
    ): ServerTransform<
        State<typeof template>,
        TwoWayOperation<typeof template>,
        UpOperation<typeof template>
    > =>
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const cancellationPolicyOfCharacterPieces: RecordOperation.CancellationPolicy<
            string,
            { ownerCharacterId: string | undefined }
        > = {
            cancelCreate: ({ newState }) =>
                !isCharacterOwner({
                    requestedBy,
                    characterId: newState.ownerCharacterId ?? none,
                    currentRoomState,
                }),
            cancelRemove: ({ state }) =>
                !isCharacterOwner({
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

        const dicePieces = RecordOperation.serverTransform<
            State<typeof DicePieceTypes.template>,
            State<typeof DicePieceTypes.template>,
            TwoWayOperation<typeof DicePieceTypes.template>,
            UpOperation<typeof DicePieceTypes.template>,
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
            prevState: prevState.shapePieces,
            nextState: currentState.shapePieces,
            innerTransform: ({ first, second, prevState, nextState }) =>
                ShapePiece.serverTransform(requestedBy)({
                    prevState,
                    currentState: nextState,
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
            cancellationPolicy: cancellationPolicyOfCharacterPieces,
        });
        if (stringPieces.isError) {
            return stringPieces;
        }

        const twoWayOperation: TwoWayOperation<typeof template> = {
            $v: 2,
            $r: 1,
            dicePieces: dicePieces.value,
            imagePieces: imagePieces.value,
            shapePieces: shapePieces.value,
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
