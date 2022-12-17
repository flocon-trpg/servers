import { loggerRef } from '@flocon-trpg/utils';
import { useAtomValue } from 'jotai';
import React from 'react';
import { useLatest } from 'react-use';
import { useCallbackOne } from 'use-memo-one';
import { firebaseAuthAtom, firebaseUserAtom } from '@/pages/_app';

/** @returns getIdTokenResultを実行したときにnon-nullishな値が返ってくると予想される場合は、canGetIdTokenResultはtrueとなる。 */
export const useGetIdTokenResult = () => {
    const auth = useAtomValue(firebaseAuthAtom);
    const currentUserRef = useLatest(auth?.currentUser);
    const user = useAtomValue(firebaseUserAtom);

    const canGetIdTokenResult = typeof user !== 'string';
    const getIdTokenResult = useCallbackOne(async () => {
        const user = currentUserRef.current;
        if (user == null) {
            return null;
        }
        const result = await user.getIdTokenResult().catch(err => {
            loggerRef.error(err, 'failed at getIdToken');
            return null;
        });
        return result;
    }, [currentUserRef]);
    return React.useMemo(
        () => ({ canGetIdTokenResult, getIdTokenResult }),
        [canGetIdTokenResult, getIdTokenResult]
    );
};
