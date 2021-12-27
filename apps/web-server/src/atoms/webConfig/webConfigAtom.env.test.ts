import {
    email,
    google,
    NEXT_PUBLIC_API_HTTP,
    NEXT_PUBLIC_API_WS,
    NEXT_PUBLIC_AUTH_PROVIDERS,
    NEXT_PUBLIC_FIREBASE_CONFIG,
    NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED,
} from '../../env';
import { fakeFirebaseConfig1 } from '@flocon-trpg/core';

const envFile = {
    [NEXT_PUBLIC_API_HTTP]: 'https://processenv.example.com/',
    [NEXT_PUBLIC_API_WS]: 'wss://processenv.example.com/',
    [NEXT_PUBLIC_AUTH_PROVIDERS]: 'google,email',
    [NEXT_PUBLIC_FIREBASE_CONFIG]: fakeFirebaseConfig1[1],
    [NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED]: 'true',
} as const;
const envFileAsRecord: Record<string, string | undefined> = envFile;

// webConfigAtomはprocess.envを読み込んでから初期化されるため、webConfigAtomをimportする前にprocess.envをセットしなければならない
for (const key in envFileAsRecord) {
    process.env[key] = envFileAsRecord[key];
}

import { renderHook, act } from '@testing-library/react-hooks';
import { useAtom } from 'jotai';
import { publicEnvTxtAtom, webConfigAtom } from './webConfigAtom';
import { fakeEnvText } from './fakeEnvText';

describe('webConfigAtom (process.env exists)', () => {
    it('tests env.txt is not fetched', () => {
        const { result: webConfigAtomResult } = renderHook(() => useAtom(webConfigAtom));

        expect(webConfigAtomResult.current[0]?.value).toBeUndefined();
    });

    it('tests with empty env.txt', () => {
        const { result: webConfigAtomResult } = renderHook(() => useAtom(webConfigAtom));
        const { result: publicEnvTxtAtomResult } = renderHook(() => useAtom(publicEnvTxtAtom));

        act(() => {
            publicEnvTxtAtomResult.current[1]({ fetched: true, value: null });
        });

        expect(webConfigAtomResult.current[0]?.value?.http).toEqual(envFile[NEXT_PUBLIC_API_HTTP]);
        expect(webConfigAtomResult.current[0]?.value?.ws).toEqual(envFile[NEXT_PUBLIC_API_WS]);
        expect(webConfigAtomResult.current[0]?.value?.authProviders.sort()).toEqual(
            [email, google].sort()
        );
        expect(webConfigAtomResult.current[0]?.value?.firebaseConfig).toEqual(
            fakeFirebaseConfig1[0]
        );
        expect(webConfigAtomResult.current[0]?.value?.isUnlistedFirebaseStorageEnabled).toBe(true);
    });

    it('tests with non-empty env.txt', () => {
        const { result: webConfigAtomResult } = renderHook(() => useAtom(webConfigAtom));
        const { result: publicEnvTxtAtomResult } = renderHook(() => useAtom(publicEnvTxtAtom));

        act(() => {
            publicEnvTxtAtomResult.current[1]({ fetched: true, value: fakeEnvText });
        });

        expect(webConfigAtomResult.current[0]?.value?.http).toEqual(envFile[NEXT_PUBLIC_API_HTTP]);
        expect(webConfigAtomResult.current[0]?.value?.ws).toEqual(envFile[NEXT_PUBLIC_API_WS]);
        expect(webConfigAtomResult.current[0]?.value?.authProviders.sort()).toEqual(
            [email, google].sort()
        );
        expect(webConfigAtomResult.current[0]?.value?.firebaseConfig).toEqual(
            fakeFirebaseConfig1[0]
        );
        expect(webConfigAtomResult.current[0]?.value?.isUnlistedFirebaseStorageEnabled).toBe(true);
    });
});
