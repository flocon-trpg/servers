import { State, paramNameTemplate } from '@flocon-trpg/core';
import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';

const emptyRecord = {};

type ParamNameState = State<typeof paramNameTemplate>;

export const useBoolParamNames = (): ReadonlyMap<string, ParamNameState> | undefined => {
    const boolParamNames = useRoomStateValueSelector(state => {
        return state.boolParamNames ?? emptyRecord;
    });
    return React.useMemo(() => {
        if (boolParamNames == null) {
            return undefined;
        }
        return recordToMap(boolParamNames);
    }, [boolParamNames]);
};

export const useNumParamNames = (): ReadonlyMap<string, ParamNameState> | undefined => {
    const numParamNames = useRoomStateValueSelector(state => {
        return state.numParamNames ?? emptyRecord;
    });
    return React.useMemo(() => {
        if (numParamNames == null) {
            return undefined;
        }
        return recordToMap(numParamNames);
    }, [numParamNames]);
};

export const useStrParamNames = (): ReadonlyMap<string, ParamNameState> | undefined => {
    const strParamNames = useRoomStateValueSelector(state => {
        return state.strParamNames ?? emptyRecord;
    });
    return React.useMemo(() => {
        if (strParamNames == null) {
            return undefined;
        }
        return recordToMap(strParamNames);
    }, [strParamNames]);
};
