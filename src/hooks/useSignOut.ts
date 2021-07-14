import React from 'react';
import { useDispatch } from 'react-redux';
import ConfigContext from '../contexts/ConfigContext';
import { fileModule } from '../modules/fileModule';
import { roomDrawerAndPopoverModule } from '../modules/roomDrawerAndPopoverModule';
import roomModule from '../modules/roomModule';
import { getAuth } from '../utils/firebaseHelpers';

export function useSignOut() {
    const dispatch = useDispatch();
    const config = React.useContext(ConfigContext);
    const auth = getAuth(config);

    return React.useCallback(async () => {
        if (auth == null) {
            return false;
        }
        await auth.signOut();
        // 前にログインしていたユーザーの部屋やファイル一覧などといったデータの閲覧を防いでいる
        dispatch(roomModule.actions.reset());
        dispatch(fileModule.actions.reset());
        dispatch(roomDrawerAndPopoverModule.actions.reset());
        return true;
    }, [auth, dispatch]);
}
