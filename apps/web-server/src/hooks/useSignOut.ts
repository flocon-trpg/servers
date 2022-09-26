import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { useQueryClient } from 'react-query';
import { hideAllOverlayActionAtom } from '../atoms/hideAllOverlayActionAtom/hideAllOverlayActionAtom';
import { roomAtom } from '../atoms/roomAtom/roomAtom';
import { firebaseAuthAtom } from '../pages/_app';

export function useSignOut() {
    const setRoom = useUpdateAtom(roomAtom);
    const auth = useAtomValue(firebaseAuthAtom);
    const queryClient = useQueryClient();
    const hideAllOverlay = useUpdateAtom(hideAllOverlayActionAtom);

    return React.useCallback(async () => {
        if (auth == null) {
            return false;
        }
        await auth.signOut();
        // 前にログインしていたユーザーの部屋やファイル一覧などといったデータの閲覧を防いでいる
        setRoom(roomAtom.init);
        // ユーザーに依存しないキャッシュは削除しなくても構わないが、コードを単純にするため全て削除している。
        queryClient.resetQueries();
        hideAllOverlay();
        return true;
    }, [auth, hideAllOverlay, queryClient, setRoom]);
}
