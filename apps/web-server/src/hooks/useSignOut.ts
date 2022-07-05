import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { publicFilesAtom } from '../atoms/publicFilesAtom/publicFilesAtom';
import { unlistedFilesAtom } from '../atoms/unlistedFilesAtom/unlistedFilesAtom';
import { hideAllOverlayActionAtom } from '../atoms/hideAllOverlayActionAtom/hideAllOverlayActionAtom';
import { roomAtom } from '../atoms/roomAtom/roomAtom';
import { firebaseAuthAtom } from '../pages/_app';

export function useSignOut() {
    const setRoom = useUpdateAtom(roomAtom);
    const auth = useAtomValue(firebaseAuthAtom);
    const setPublicFiles = useUpdateAtom(publicFilesAtom);
    const setUnlistedFiles = useUpdateAtom(unlistedFilesAtom);
    const hideAllOverlay = useUpdateAtom(hideAllOverlayActionAtom);

    return React.useCallback(async () => {
        if (auth == null) {
            return false;
        }
        await auth.signOut();
        // 前にログインしていたユーザーの部屋やファイル一覧などといったデータの閲覧を防いでいる
        setRoom(roomAtom.init);
        setPublicFiles([]);
        setUnlistedFiles([]);
        hideAllOverlay();
        return true;
    }, [auth, hideAllOverlay, setPublicFiles, setRoom, setUnlistedFiles]);
}
