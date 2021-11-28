import React from 'react';
import { recordForEach } from '@flocon-trpg/utils';
import { StringPieceValueState } from '@flocon-trpg/core';
import _ from 'lodash';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomAtom } from '../../atoms/room/roomAtom';

export type StringPieceValueElement = {
    id: string;
    value: StringPieceValueState;
};

export const useStringPieceValues = (): ReadonlyArray<StringPieceValueElement> | undefined => {
    const stringPieceValues = useAtomSelector(
        roomAtom,
        state => state.roomState?.state?.stringPieceValues
    );
    return React.useMemo(() => {
        const result: StringPieceValueElement[] = [];
        recordForEach(stringPieceValues ?? {}, (value, id) => {
            result.push({
                id,
                value,
            });
        });
        return _(result)
            .sortBy(x => x.id)
            .value();
    }, [stringPieceValues]);
};
