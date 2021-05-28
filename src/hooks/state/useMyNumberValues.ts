import React from 'react';
import { createStateMap, dualKeyRecordForEach, ReadonlyStateMap } from '@kizahasi/util';
import { MyNumberValueState } from '@kizahasi/flocon-core';
import { useSelector } from '../../store';

export const useMyNumberValues = (): ReadonlyStateMap<MyNumberValueState> | undefined => {
    const myNumberValues = useSelector(state => state.roomModule.roomState?.state?.myNumberValues);
    return React.useMemo(() => {
        if (myNumberValues == null) {
            return undefined;
        }
        const result = createStateMap<MyNumberValueState>();
        dualKeyRecordForEach<MyNumberValueState>(myNumberValues, (value, key) => {
            result.set({ createdBy: key.first, id: key.second }, value);
        });
        return result;
    }, [myNumberValues]);
};