import { ParamNameState } from '@flocon-trpg/core';
import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { useSelector } from '../../store';

export const useBoolParamNames = (): ReadonlyMap<string, ParamNameState> | undefined => {
    const boolParamNames = useSelector(state => state.roomModule.roomState?.state?.boolParamNames);
    return React.useMemo(() => {
        if (boolParamNames == null) {
            return undefined;
        }
        return recordToMap(boolParamNames);
    }, [boolParamNames]);
};

export const useNumParamNames = (): ReadonlyMap<string, ParamNameState> | undefined => {
    const numParamNames = useSelector(state => state.roomModule.roomState?.state?.numParamNames);
    return React.useMemo(() => {
        if (numParamNames == null) {
            return undefined;
        }
        return recordToMap(numParamNames);
    }, [numParamNames]);
};

export const useStrParamNames = (): ReadonlyMap<string, ParamNameState> | undefined => {
    const strParamNames = useSelector(state => state.roomModule.roomState?.state?.strParamNames);
    return React.useMemo(() => {
        if (strParamNames == null) {
            return undefined;
        }
        return recordToMap(strParamNames);
    }, [strParamNames]);
};
