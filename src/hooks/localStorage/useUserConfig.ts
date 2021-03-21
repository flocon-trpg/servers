import React from 'react';
import { getUserConfig } from '../../utils/localStorage/userConfig';
import userConfigModule from '../../modules/userConfigModule';
import { Dispatch } from '@reduxjs/toolkit';

// localForageを用いてRoomConfigを読み込み、ReduxのStateと紐付ける。
// Userが変わるたびに、useUserConfigが更新される必要がある。_app.tsxなどどこか一箇所でuseUserConfigを呼び出すだけでよい。
// _app.tsxではProviderの範囲外なのでuseDispatchが使えないため、引数として受け取る形にしている。
const useUserConfig = (userUid: string | null, dispatch: Dispatch<any>): void => {
    React.useEffect(() => {
        let unmounted = false;
        const main = async () => {
            dispatch(userConfigModule.actions.setUserConfig(null));
            if (userUid == null) {
                return;
            }
            const userConfig = await getUserConfig(userUid);
            if (unmounted) {
                return;
            }
            dispatch(userConfigModule.actions.setUserConfig(userConfig));
        };
        main();
        return () => {
            unmounted = true;
        };
    }, [userUid, dispatch]);
};

export default useUserConfig;