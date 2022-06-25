import localforage from 'localforage';
import {
    SerializedUserConfig,
    UserConfig,
    defaultUserConfig,
    deserializeUserConfig,
    serializedUserConfig,
} from '../../atoms/userConfigAtom/types';
import { tryParseJSON } from '../tryParseJSON';

const userConfigKey = (userUid: string) => `user@${userUid}`;

const tryGetUserConfig = async (userUid: string) => {
    const raw = await localforage.getItem(userConfigKey(userUid));
    if (typeof raw !== 'string') {
        return undefined;
    }
    const json = tryParseJSON(raw);
    const result = serializedUserConfig.decode(json);
    if (result._tag === 'Right') {
        return result.right;
    }
    return undefined;
};

export const getUserConfig = async (userUid: string): Promise<UserConfig> => {
    const result = await tryGetUserConfig(userUid);
    if (result == null) {
        return defaultUserConfig(userUid);
    }
    return deserializeUserConfig(result, userUid);
};

export const setUserConfig = async (value: UserConfig) => {
    // UserConfigを安全にSerializedUserConfigへ型変換できない場合、decodeができなくなってしまう。それを防ぐため、ここで安全に型変換できるかどうかチェックしている。
    const serializedValue: SerializedUserConfig = value;
    await localforage.setItem(userConfigKey(value.userUid), JSON.stringify(serializedValue));
};
