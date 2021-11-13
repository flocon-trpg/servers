import { useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { useDispatch } from 'react-redux';
import { publicFilesAtom } from '../atoms/firebaseStorage/publicFilesAtom';
import { unlistedFilesAtom } from '../atoms/firebaseStorage/unlistedFilesAtom';
import { roomAtom } from '../atoms/room/roomAtom';
import { writeonlyAtom } from '../atoms/writeonlyAtom';
import { ConfigContext } from '../contexts/ConfigContext';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import { roomDrawerAndPopoverAndModalModule } from '../modules/roomDrawerAndPopoverAndModalModule';
import { getAuth } from '../utils/firebaseHelpers';
import { useReadonlyRef } from './useReadonlyRef';

const writeonlyRoomAtom = writeonlyAtom(roomAtom);

export function useSignOut() {
    const [, setRoom] = useAtom(writeonlyRoomAtom);
    const dispatch = useDispatch();
    const firebaseStorageUrlCacheContext = React.useContext(FirebaseStorageUrlCacheContext);
    const config = React.useContext(ConfigContext);
    const auth = getAuth(config);
    const firebaseStorageUrlCacheContextRef = useReadonlyRef(firebaseStorageUrlCacheContext);
    const setPublicFiles = useUpdateAtom(publicFilesAtom);
    const setUnlistedFiles = useUpdateAtom(unlistedFilesAtom);

    return React.useCallback(async () => {
        if (auth == null) {
            return false;
        }
        await auth.signOut();
        // 前にログインしていたユーザーの部屋やファイル一覧などといったデータの閲覧を防いでいる
        setRoom(roomAtom.init);
        setPublicFiles([]);
        setUnlistedFiles([]);
        dispatch(roomDrawerAndPopoverAndModalModule.actions.reset());
        firebaseStorageUrlCacheContextRef.current?.clear();
        return true;
    }, [
        auth,
        dispatch,
        firebaseStorageUrlCacheContextRef,
        setPublicFiles,
        setRoom,
        setUnlistedFiles,
    ]);
}
