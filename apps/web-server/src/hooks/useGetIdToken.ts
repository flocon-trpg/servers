import { roomNotificationsAtom, text } from '@/atoms/roomAtom/roomAtom';
import { firebaseAuthAtom, firebaseUserAtom } from '@/pages/_app';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { useLatest } from 'react-use';
import { useCallbackOne } from 'use-memo-one';

/** @returns getIdTokenを実行したときにnon-nullishな値が返ってくると予想される場合は、canGetIdTokenはtrueとなる。 */
export const useGetIdToken = () => {
    const setRoomNotification = useSetAtom(roomNotificationsAtom);
    const auth = useAtomValue(firebaseAuthAtom);
    const currentUserRef = useLatest(auth?.currentUser);
    const user = useAtomValue(firebaseUserAtom);

    const canGetIdToken = typeof user !== 'string';
    const getIdToken = useCallbackOne(async () => {
        const user = currentUserRef.current;
        if (user == null) {
            return null;
        }
        const result = await user.getIdToken().catch(err => {
            console.error('failed at getIdToken', err);
            setRoomNotification({
                type: text,
                notification: {
                    type: 'error',
                    message:
                        'Firebase AuthenticationでIdTokenの取得に失敗しました。ブラウザのコンソールにエラーの内容を出力しました。',
                    createdAt: new Date().getTime(),
                },
            });
            return null;
        });
        return result;
    }, [currentUserRef, setRoomNotification]);
    return React.useMemo(() => ({ canGetIdToken, getIdToken }), [canGetIdToken, getIdToken]);
};
