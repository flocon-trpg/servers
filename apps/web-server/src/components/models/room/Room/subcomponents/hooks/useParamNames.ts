import { State, paramNameTemplate } from '@flocon-trpg/core';
import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { roomAtom } from '../../../../../../atoms/roomAtom/roomAtom';
import { useAtomSelector } from '../../../../../../hooks/useAtomSelector';

const emptyRecord = {};

type ParamNameState = State<typeof paramNameTemplate>;

export const useBoolParamNames = (): ReadonlyMap<string, ParamNameState> | undefined => {
    const boolParamNames = useAtomSelector(roomAtom, state => {
        if (state.roomState?.state == null) {
            return undefined;
        }
        return state.roomState.state.boolParamNames ?? emptyRecord;
    });
    return React.useMemo(() => {
        if (boolParamNames == null) {
            return undefined;
        }
        return recordToMap(boolParamNames);
    }, [boolParamNames]);
};

export const useNumParamNames = (): ReadonlyMap<string, ParamNameState> | undefined => {
    const numParamNames = useAtomSelector(roomAtom, state => {
        if (state.roomState?.state == null) {
            return undefined;
        }
        return state.roomState.state.numParamNames ?? emptyRecord;
    });
    return React.useMemo(() => {
        if (numParamNames == null) {
            return undefined;
        }
        return recordToMap(numParamNames);
    }, [numParamNames]);
};

export const useStrParamNames = (): ReadonlyMap<string, ParamNameState> | undefined => {
    const strParamNames = useAtomSelector(roomAtom, state => {
        if (state.roomState?.state == null) {
            return undefined;
        }
        return state.roomState.state.strParamNames ?? emptyRecord;
    });
    return React.useMemo(() => {
        if (strParamNames == null) {
            return undefined;
        }
        return recordToMap(strParamNames);
    }, [strParamNames]);
};
