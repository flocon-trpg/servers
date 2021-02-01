import React from 'react';
import { RoomConfig } from '../../states/RoomConfig';
import { useDispatch } from 'react-redux';
import roomConfigModule from '../../modules/roomConfigModule';
import { getRoomConfig } from '../../utils/localStorage/roomConfig';
import * as Room from '../../stateManagers/states/room';

// localForageを用いてRoomConfigを読み込み、ReduxのStateと紐付ける。
// Roomが変わるたびに、useRoomConfigが更新される必要がある。RoomのComponentのどこか一箇所でuseRoomConfigを呼び出すだけでよい。
const useRoomConfig = (roomId: string): boolean => {
    const [result, setResult] = React.useState<boolean>(false);
    const dispatch = useDispatch();

    React.useEffect(() => {
        let unmounted = false;
        const main = async () => {
            dispatch(roomConfigModule.actions.setRoomConfig(null));
            const roomConfig = await getRoomConfig(roomId);
            if (unmounted) {
                return;
            }
            dispatch(roomConfigModule.actions.setRoomConfig(roomConfig));
            setResult(true);
        };
        main();
        return () => {
            unmounted = true;
        };
    }, [roomId, dispatch]);

    return result;
};

export default useRoomConfig;