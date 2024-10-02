import React from 'react';
import { useCallbackOne } from 'use-memo-one';
import { useGetIdTokenResult } from './useGetIdTokenResult';

/** @returns getIdTokenを実行したときにnon-nullishな値が返ってくると予想される場合は、canGetIdTokenはtrueとなる。 */
export const useGetIdToken = () => {
    const { canGetIdTokenResult, getIdTokenResult } = useGetIdTokenResult();
    const getIdToken = useCallbackOne(async () => {
        const idTokenResult = await getIdTokenResult();
        if (idTokenResult == null) {
            return idTokenResult;
        }
        return idTokenResult.token;
    }, [getIdTokenResult]);
    return React.useMemo(
        () => ({ canGetIdToken: canGetIdTokenResult, getIdToken }),
        [canGetIdTokenResult, getIdToken],
    );
};
