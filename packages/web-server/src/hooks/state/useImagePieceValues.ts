import React from 'react';
import { keyNames, recordForEach } from '@flocon-trpg/utils';
import { ImagePieceValueState } from '@flocon-trpg/core';
import { useParticipants } from './useParticipants';
import _ from 'lodash';

export type ImagePieceValueElement = {
    participantKey: string;
    valueId: string;
    value: ImagePieceValueState;
};

export const useImagePieceValues = (): ReadonlyArray<ImagePieceValueElement> | undefined => {
    const participants = useParticipants();
    return React.useMemo(() => {
        if (participants == null) {
            return undefined;
        }
        const result: ImagePieceValueElement[] = [];
        participants.forEach((participant, participantKey) => {
            recordForEach(participant.imagePieceValues, (value, key) => {
                result.push({
                    participantKey,
                    valueId: key,
                    value,
                });
            });
        });
        return _(result)
            .sortBy(x => keyNames(x.participantKey, x.valueId))
            .value();
    }, [participants]);
};
