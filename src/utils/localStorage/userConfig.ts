import localforage from 'localforage';
import { castToPartialUserConfig, defaultUserConfig, toCompleteUserConfig, UserConfig } from '../../states/UserConfig';

const userConfigKey = (userUid: string) => `user@${userUid}`;

export const getUserConfig = async (userUid: string): Promise<UserConfig> => {
    const raw = await localforage.getItem(userConfigKey(userUid));
    const partial = castToPartialUserConfig(raw);
    if (partial == null) {
        return defaultUserConfig(userUid);
    }
    const complete = toCompleteUserConfig(partial, userUid);
    if (complete === undefined) {
        throw 'incorrect config version';
    }
    return complete;
};

export const setUserConfig = async (value: UserConfig): Promise<UserConfig> => {
    return await localforage.setItem(userConfigKey(value.userUid), value);
};