import React from 'react';
import { CompositeKey, dualKeyRecordToDualKeyMap, recordForEach } from '@kizahasi/util';
import { ImagePieceValueState, PieceState } from '@kizahasi/flocon-core';
import { useParticipants } from './useParticipants';

export type ImagePieceValueElement = {
    participantKey: string;
    valueId: string;
    value: ImagePieceValueState;

    // useImagePiecesに渡したboardKeyがundefined ⇔ これがundefined
    piece: PieceState | undefined;
};

export const useImagePieces = (
    boardKey?: CompositeKey
): ReadonlyArray<ImagePieceValueElement> | undefined => {
    const participants = useParticipants();
    return React.useMemo(() => {
        if (participants == null) {
            return undefined;
        }
        const result: ImagePieceValueElement[] = [];
        participants.forEach((participant, participantKey) => {
            recordForEach(participant.imagePieceValues ?? {}, (value, pieceKey) => {
                let piece: PieceState | undefined;
                if (boardKey?.createdBy != null && boardKey.id != null) {
                    piece = dualKeyRecordToDualKeyMap<PieceState>(value.pieces).get({
                        first: boardKey.createdBy,
                        second: boardKey.id,
                    });
                    if (piece == null) {
                        return;
                    }
                } else {
                    piece = undefined;
                }
                result.push({
                    participantKey,
                    valueId: pieceKey,
                    value,
                    piece,
                });
            });
        });
        return result;
    }, [participants, boardKey?.createdBy, boardKey?.id]);
};
