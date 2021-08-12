import React from 'react';
import { CompositeKey, dualKeyRecordToDualKeyMap, keyNames, recordForEach } from '@kizahasi/util';
import { ImagePieceValueState, PieceState } from '@kizahasi/flocon-core';
import { useParticipants } from './useParticipants';
import _ from 'lodash';

export type ImagePieceValueElement = {
    participantKey: string;
    valueId: string;
    value: ImagePieceValueState;

    // useImagePiecesに渡したboardKeyがundefined ⇔ これがundefined
    piece: PieceState | undefined;
};

export const useImagePieceValues = (
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
        return _(result)
            .sortBy(x => keyNames(x.participantKey, x.valueId))
            .value();
    }, [participants, boardKey?.createdBy, boardKey?.id]);
};
