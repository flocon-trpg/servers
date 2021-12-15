import { ParamNameState } from '@flocon-trpg/core';
import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { roomAtom } from '../../atoms/room/roomAtom';
import { useAtomSelector } from '../../atoms/useAtomSelector';

export const useBoolParamNames = (): ReadonlyMap<string, ParamNameState> | undefined => {
    const boolParamNames = useAtomSelector(
        roomAtom,
        state => state.roomState?.state?.boolParamNames
    );
    return React.useMemo(() => {
        if (boolParamNames == null) {
            return undefined;
        }
        return recordToMap(boolParamNames);
    }, [boolParamNames]);
};

export const useNumParamNames = (): ReadonlyMap<string, ParamNameState> | undefined => {
    const numParamNames = useAtomSelector(roomAtom, state => state.roomState?.state?.numParamNames);
    return React.useMemo(() => {
        if (numParamNames == null) {
            return undefined;
        }
        return recordToMap(numParamNames);
    }, [numParamNames]);
};

export const useStrParamNames = (): ReadonlyMap<string, ParamNameState> | undefined => {
    const strParamNames = useAtomSelector(roomAtom, state => state.roomState?.state?.strParamNames);
    return React.useMemo(() => {
        if (strParamNames == null) {
            return undefined;
        }
        return recordToMap(strParamNames);
    }, [strParamNames]);
};
