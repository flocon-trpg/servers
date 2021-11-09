import { useAtom } from 'jotai';
import { useImmerAtom } from 'jotai/immer';
import React from 'react';
import { useDispatch } from 'react-redux';
import { roomAtom } from '../atoms/room/roomAtom';
import { writeonlyAtom } from '../atoms/writeonlyAtom';
import { ConfigContext } from '../contexts/ConfigContext';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import { fileModule } from '../modules/fileModule';
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

    return React.useCallback(async () => {
        if (auth == null) {
            return false;
        }
        await auth.signOut();
        // 前にログインしていたユーザーの部屋やファイル一覧などといったデータの閲覧を防いでいる
        setRoom(roomAtom.init);
        dispatch(fileModule.actions.reset());
        dispatch(roomDrawerAndPopoverAndModalModule.actions.reset());
        firebaseStorageUrlCacheContextRef.current?.clear();
        return true;
    }, [auth, dispatch, firebaseStorageUrlCacheContextRef, setRoom]);
}
