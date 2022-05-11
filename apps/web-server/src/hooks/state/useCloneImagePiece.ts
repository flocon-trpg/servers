import { simpleId } from '@flocon-trpg/core';
import produce from 'immer';
import React from 'react';
import { useMyUserUid } from '../useMyUserUid';
import { useSetRoomState } from '../useSetRoomState';

export const useCloneImagePiece = () => {
    const setRoomState = useSetRoomState();
    const myUserUid = useMyUserUid();

    return React.useCallback(
        ({ boardId, pieceId }: { boardId: string; pieceId: string }) => {
            setRoomState(room => {
                if (myUserUid == null) {
                    return room;
                }

                const board = room.boards?.[boardId];
                if (board == null) {
                    return room;
                }

                const imagePiece = board.imagePieces?.[pieceId];
                if (imagePiece == null) {
                    return room;
                }

                const newImagePieceValue = produce(imagePiece, imagePiece => {
                    imagePiece.x += 20;
                    imagePiece.y += 20;
                });
                newImagePieceValue.ownerParticipantId = myUserUid;

                return produce(room, room => {
                    const board = room.boards?.[boardId];
                    if (board == null) {
                        return;
                    }
                    const newId = simpleId();
                    if (board.imagePieces == null) {
                        board.imagePieces = {};
                    }
                    board.imagePieces[newId] = newImagePieceValue;
                });
            });
        },
        [myUserUid, setRoomState]
    );
};
