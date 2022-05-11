import localforage from 'localforage';
import {
    RoomConfig,
    SerializedRoomConfig,
    defaultRoomConfig,
    deserializeRoomConfig,
    serializedRoomConfig,
} from '../../atoms/roomConfig/types/roomConfig';
import { tryParseJSON } from '../tryParseJSON';

const roomConfigKey = (roomId: string) => `room@${roomId}`;

const tryGetRoomConfig = async (roomId: string) => {
    const raw = await localforage.getItem(roomConfigKey(roomId));
    if (typeof raw !== 'string') {
        return undefined;
    }
    const json = tryParseJSON(raw);
    const result = serializedRoomConfig.decode(json);
    if (result._tag === 'Right') {
        return result.right;
    }
    return undefined;
};

export const getRoomConfig = async (roomId: string): Promise<RoomConfig> => {
    const result = await tryGetRoomConfig(roomId);
    if (result == null) {
        return defaultRoomConfig(roomId);
    }
    return deserializeRoomConfig(result, roomId);
};

export const setRoomConfig = async (value: RoomConfig) => {
    // RoomConfigを安全にSerializedRoomConfigへ型変換できない場合、decodeができなくなってしまう。それを防ぐため、ここで安全に型変換できるかどうかチェックしている。
    const serializedValue: SerializedRoomConfig = value;
    await localforage.setItem(roomConfigKey(value.roomId), JSON.stringify(serializedValue));
};
