import { produce } from 'immer';
import { atomFamily } from 'jotai/utils';
import { atom } from 'jotai/vanilla';
import localforage from 'localforage';
import { atomWithDebounceStorage } from '../atomWithDebounceStorage/atomWithDebounceStorage';
import {
    SerializedUserConfig,
    UserConfig,
    defaultUserConfig,
    deserializeUserConfig,
    serializedUserConfig,
} from './types';
import { tryParseJSON } from '@/utils/tryParseJSON';

const userConfigKey = (userUid: string) => `user@${userUid}`;

const tryGetUserConfig = async (userUid: string) => {
    const raw = await localforage.getItem(userConfigKey(userUid));
    if (typeof raw !== 'string') {
        return undefined;
    }
    const json = tryParseJSON(raw);
    const result = serializedUserConfig.passthrough().safeParse(json);
    if (result.success) {
        return result.data;
    }
    return undefined;
};

const getUserConfig = async (userUid: string): Promise<UserConfig> => {
    const result = await tryGetUserConfig(userUid);
    if (result == null) {
        return defaultUserConfig(userUid);
    }
    return deserializeUserConfig(result, userUid);
};

let mockUserConfig: UserConfig | null = null;
/** これを non-null にすると、`userConfigAtomFamily` が mock モードになり、userUid が何かに関わらず setMockUserConfig で渡した値が `userConfigAtomFamily` の子の atom の初期値になります。userUid によって異なる初期値にする機能は現時点で需要がないと思われるため実装していません。 */
export const setMockUserConfig = (value: UserConfig | null) => {
    mockUserConfig = value;
};

// userUid === undefined のときがどうしても存在するため、そのときは仮の UserConfig を用いた atom を渡すようにしている。
export const userConfigAtomFamily = atomFamily((userUid: string | undefined) => {
    const createGetAsyncAtom = (initUserConfig: UserConfig) => {
        const baseAtom = atom(initUserConfig);
        return atom(
            get => Promise.resolve(get(baseAtom)),
            (get, set, action: (prev: UserConfig) => UserConfig | void) => {
                set(baseAtom, produce(get(baseAtom), action));
            },
        );
    };
    if (mockUserConfig != null) {
        return createGetAsyncAtom(mockUserConfig);
    }
    if (userUid == null) {
        // CONSIDER: defaultUserConfig の引数は適当に `''` にしているが、これは適切な値かどうかは不明。
        return createGetAsyncAtom(defaultUserConfig(''));
    }
    return atomWithDebounceStorage({
        getItemFromStorage: () => getUserConfig(userUid),
        setItemToStorage: async (newValue: UserConfig) => {
            // UserConfigを安全にSerializedUserConfigへ型変換できない場合、decodeができなくなってしまう。それを防ぐため、ここで安全に型変換できるかどうかチェックしている。
            const serializedNewValue: SerializedUserConfig = newValue;
            await localforage.setItem(
                userConfigKey(newValue.userUid),
                JSON.stringify(serializedNewValue),
            );
        },
        atomSet: (prev, action: (prev: UserConfig) => UserConfig | void) => produce(prev, action),
    });
});
