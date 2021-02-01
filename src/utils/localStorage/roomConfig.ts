import localforage from 'localforage';
import { castToPartialRoomConfig, defaultRoomConfig, RoomConfig, toCompleteRoomConfig } from '../../states/RoomConfig';
import * as Room from '../../stateManagers/states/room';

const roomConfigKey = (roomId: string) => `room@${roomId}`;

export const getRoomConfig = async (roomId: string): Promise<RoomConfig> => {
    const raw = await localforage.getItem(roomConfigKey(roomId));
    const partial = castToPartialRoomConfig(raw);
    if (partial == null) {
        return defaultRoomConfig(roomId);
    }
    const complete = toCompleteRoomConfig(partial, roomId);
    if (complete === undefined) {
        throw 'incorrect config version';
    }
    return complete;
};

export const setRoomConfig = async (value: RoomConfig): Promise<RoomConfig> => {
    return await localforage.setItem(roomConfigKey(value.roomId), value);
};