import React from 'react';
import { useDispatch } from 'react-redux';
import ConfigContext from '../contexts/ConfigContext';
import { FirebaseStorageUrlCacheContext } from '../contexts/FirebaseStorageUrlCacheContext';
import { fileModule } from '../modules/fileModule';
import { roomDrawerAndPopoverAndModalModule } from '../modules/roomDrawerAndPopoverAndModalModule';
import { roomModule } from '../modules/roomModule';
import { getAuth } from '../utils/firebaseHelpers';
import { useReadonlyRef } from './useReadonlyRef';

export function useSignOut() {
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
        dispatch(roomModule.actions.reset());
        dispatch(fileModule.actions.reset());
        dispatch(roomDrawerAndPopoverAndModalModule.actions.reset());
        firebaseStorageUrlCacheContextRef.current?.clear();
        return true;
    }, [auth, dispatch, firebaseStorageUrlCacheContextRef]);
}
