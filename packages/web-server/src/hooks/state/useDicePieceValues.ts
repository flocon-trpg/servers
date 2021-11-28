import React from 'react';
import { recordForEach } from '@flocon-trpg/utils';
import { DicePieceValueState } from '@flocon-trpg/core';
import _ from 'lodash';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomAtom } from '../../atoms/room/roomAtom';

export type DicePieceValueElement = {
    id: string;
    value: DicePieceValueState;
};

export const useDicePieceValues = (): ReadonlyArray<DicePieceValueElement> | undefined => {
    const dicePieceValues = useAtomSelector(
        roomAtom,
        state => state.roomState?.state?.dicePieceValues
    );
    return React.useMemo(() => {
        const result: DicePieceValueElement[] = [];
        recordForEach(dicePieceValues ?? {}, (value, id) => {
            result.push({
                id,
                value,
            });
        });
        return _(result)
            .sortBy(x => x.id)
            .value();
    }, [dicePieceValues]);
};
