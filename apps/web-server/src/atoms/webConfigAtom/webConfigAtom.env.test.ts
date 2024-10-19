// @vitest-environment jsdom

import { fakeFirebaseConfig1 } from '@flocon-trpg/core';
import { act, renderHook } from '@testing-library/react';
import { useAtom, useSetAtom } from 'jotai';
import {
    NEXT_PUBLIC_API_HTTP,
    NEXT_PUBLIC_API_WS,
    NEXT_PUBLIC_AUTH_PROVIDERS,
    NEXT_PUBLIC_FIREBASE_CONFIG,
    NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED,
    email,
    google,
} from '../../env';
import { fakeEnvText } from './fakeEnvText';
import { Option } from '@kizahasi/option';
import { it, expect, describe } from 'vitest';
import { mockProcessEnvAtom, mockPublicEnvTxtAtom, webConfigAtom } from './webConfigAtom';
import { delay } from '@flocon-trpg/utils';

const fakeEnvFile = {
    [NEXT_PUBLIC_API_HTTP]: 'https://processenv.example.com/',
    [NEXT_PUBLIC_API_WS]: 'wss://processenv.example.com/',
    [NEXT_PUBLIC_AUTH_PROVIDERS]: 'google,email',
    [NEXT_PUBLIC_FIREBASE_CONFIG]: fakeFirebaseConfig1[1],
    [NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED]: 'true',
} as const;

// webConfigAtom は async に値を取得する atom であるため、少し待つ必要がある。
const waitForWebConfig = async () => await delay(100);

describe('webConfigAtom (process.env exists)', () => {
    it('tests with empty env.txt', async () => {
        const { result: setMockProcessEnv } = renderHook(() => useSetAtom(mockProcessEnvAtom));
        act(() => setMockProcessEnv.current(fakeEnvFile));
        const { result: webConfigAtomResult } = renderHook(() => useAtom(webConfigAtom));
        const { result: setMockPublicEnvTxtAtom } = renderHook(() =>
            useSetAtom(mockPublicEnvTxtAtom),
        );

        act(() => {
            setMockPublicEnvTxtAtom.current(Option.some(null));
        });

        await waitForWebConfig();

        expect(webConfigAtomResult.current[0]?.value?.http).toEqual(
            fakeEnvFile[NEXT_PUBLIC_API_HTTP],
        );
        expect(webConfigAtomResult.current[0]?.value?.ws).toEqual(fakeEnvFile[NEXT_PUBLIC_API_WS]);
        expect(webConfigAtomResult.current[0]?.value?.authProviders?.sort()).toEqual(
            [email, google].sort(),
        );
        expect(webConfigAtomResult.current[0]?.value?.firebaseConfig).toEqual(
            fakeFirebaseConfig1[0],
        );
        expect(webConfigAtomResult.current[0]?.value?.isUnlistedFirebaseStorageEnabled).toBe(true);

        // cleanup
        act(() => setMockProcessEnv.current(null));
    });

    it('tests with non-empty env.txt', async () => {
        const { result: setMockProcessEnv } = renderHook(() => useSetAtom(mockProcessEnvAtom));
        act(() => setMockProcessEnv.current(fakeEnvFile));
        const { result: webConfigAtomResult } = renderHook(() => useAtom(webConfigAtom));
        const { result: setMockPublicEnvTxtAtom } = renderHook(() =>
            useSetAtom(mockPublicEnvTxtAtom),
        );

        act(() => {
            setMockPublicEnvTxtAtom.current(Option.some(fakeEnvText));
        });

        await waitForWebConfig();

        expect(webConfigAtomResult.current[0]?.value?.http).toEqual(
            fakeEnvFile[NEXT_PUBLIC_API_HTTP],
        );
        expect(webConfigAtomResult.current[0]?.value?.ws).toEqual(fakeEnvFile[NEXT_PUBLIC_API_WS]);
        expect(webConfigAtomResult.current[0]?.value?.authProviders?.sort()).toEqual(
            [email, google].sort(),
        );
        expect(webConfigAtomResult.current[0]?.value?.firebaseConfig).toEqual(
            fakeFirebaseConfig1[0],
        );
        expect(webConfigAtomResult.current[0]?.value?.isUnlistedFirebaseStorageEnabled).toBe(true);

        // cleanup
        act(() => setMockProcessEnv.current(null));
    });
});
