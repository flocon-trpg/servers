import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { publicFilesAtom } from '../atoms/firebaseStorage/publicFilesAtom';
import { unlistedFilesAtom } from '../atoms/firebaseStorage/unlistedFilesAtom';
import { hideAllOverlayActionAtom } from '../atoms/overlay/hideAllOverlayActionAtom';
import { roomAtom } from '../atoms/room/roomAtom';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import { firebaseAuthAtom } from '../pages/_app';
import { useReadonlyRef } from './useReadonlyRef';

export function useSignOut() {
    const setRoom = useUpdateAtom(roomAtom);
    const firebaseStorageUrlCacheContext = React.useContext(FirebaseStorageUrlCacheContext);
    const auth = useAtomValue(firebaseAuthAtom);
    const firebaseStorageUrlCacheContextRef = useReadonlyRef(firebaseStorageUrlCacheContext);
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
        firebaseStorageUrlCacheContextRef.current?.clear();
        return true;
    }, [
        auth,
        firebaseStorageUrlCacheContextRef,
        hideAllOverlay,
        setPublicFiles,
        setRoom,
        setUnlistedFiles,
    ]);
}
