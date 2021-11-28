import React from 'react';
import { recordForEach } from '@flocon-trpg/utils';
import { ImagePieceValueState } from '@flocon-trpg/core';
import _ from 'lodash';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomAtom } from '../../atoms/room/roomAtom';

export type ImagePieceValueElement = {
    id: string;
    value: ImagePieceValueState;
};

export const useImagePieceValues = (): ReadonlyArray<ImagePieceValueElement> | undefined => {
    const imagePieceValues = useAtomSelector(
        roomAtom,
        state => state.roomState?.state?.imagePieceValues
    );
    return React.useMemo(() => {
        const result: ImagePieceValueElement[] = [];
        recordForEach(imagePieceValues ?? {}, (value, id) => {
            result.push({
                id,
                value,
            });
        });
        return _(result)
            .sortBy(x => x.id)
            .value();
    }, [imagePieceValues]);
};
