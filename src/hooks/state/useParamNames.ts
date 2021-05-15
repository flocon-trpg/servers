import React from 'react';
import { recordToMap } from '../../@shared/utils';
import * as ParamName from '../../@shared/ot/room/paramName/v1';
import { __ } from '../../@shared/collection';
import { useSelector } from '../../store';

export const useBoolParamNames = (): ReadonlyMap<string, ParamName.State> | undefined => {
    const boolParamNames = useSelector(state => state.roomModule.roomState?.state?.boolParamNames);
    return React.useMemo(() => {
        if (boolParamNames == null) {
            return undefined;
        }
        return recordToMap(boolParamNames);
    }, [boolParamNames]);
};

export const useNumParamNames = (): ReadonlyMap<string, ParamName.State> | undefined => {
    const numParamNames = useSelector(state => state.roomModule.roomState?.state?.numParamNames);
    return React.useMemo(() => {
        if (numParamNames == null) {
            return undefined;
        }
        return recordToMap(numParamNames);
    }, [numParamNames]);
};

export const useStrParamNames = (): ReadonlyMap<string, ParamName.State> | undefined => {
    const strParamNames = useSelector(state => state.roomModule.roomState?.state?.strParamNames);
    return React.useMemo(() => {
        if (strParamNames == null) {
            return undefined;
        }
        return recordToMap(strParamNames);
    }, [strParamNames]);
};