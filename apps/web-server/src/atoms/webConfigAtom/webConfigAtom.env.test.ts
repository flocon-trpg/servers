// @vitest-environment jsdom

import { env, fakeFirebaseConfig1 } from '@flocon-trpg/core';
import { delay } from '@flocon-trpg/utils';
import { Option } from '@kizahasi/option';
import { act, renderHook } from '@testing-library/react';
import { useAtom, useSetAtom } from 'jotai';
import { describe, expect, it } from 'vitest';
import { fakeEnvText } from './fakeEnvText';
import { mockImportMetaEnvAtom, mockPublicEnvTxtAtom, webConfigAtom } from './webConfigAtom';

const fakeEnvFile = {
    [env.NEXT_PUBLIC_API_HTTP]: 'https://processenv.example.com/',
    [env.NEXT_PUBLIC_API_WS]: 'wss://processenv.example.com/',
    [env.NEXT_PUBLIC_AUTH_PROVIDERS]: 'google,email',
    [env.NEXT_PUBLIC_FIREBASE_CONFIG]: fakeFirebaseConfig1[1],
    [env.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED]: 'true',
} as const;

// webConfigAtom は async に値を取得する atom であるため、少し待つ必要がある。
const waitForWebConfig = async () => await delay(100);

describe('webConfigAtom (process.env exists)', () => {
    it('tests with empty env.txt', async () => {
        const { result: setMockImportMetaEnv } = renderHook(() =>
            useSetAtom(mockImportMetaEnvAtom),
        );
        act(() => setMockImportMetaEnv.current(fakeEnvFile));
        const { result: webConfigAtomResult } = renderHook(() => useAtom(webConfigAtom));
        const { result: setMockPublicEnvTxtAtom } = renderHook(() =>
            useSetAtom(mockPublicEnvTxtAtom),
        );

        act(() => {
            setMockPublicEnvTxtAtom.current(Option.some(null));
        });

        await waitForWebConfig();

        if (webConfigAtomResult.current[0]?.isMock === true) {
            throw new Error('Unexpected isMock');
        }

        expect(webConfigAtomResult.current[0].value.http).toEqual(
            fakeEnvFile[env.NEXT_PUBLIC_API_HTTP],
        );
        expect(webConfigAtomResult.current[0].value.ws).toEqual(
            fakeEnvFile[env.NEXT_PUBLIC_API_WS],
        );
        expect(webConfigAtomResult.current[0].value.authProviders?.sort()).toEqual(
            [env.authProviders.email, env.authProviders.google].sort(),
        );
        expect(webConfigAtomResult.current[0].value.firebaseConfig).toEqual(fakeFirebaseConfig1[0]);
        expect(webConfigAtomResult.current[0].value.isUnlistedFirebaseStorageEnabled).toBe(true);

        // cleanup
        act(() => setMockImportMetaEnv.current(null));
    });

    it('tests with non-empty env.txt', async () => {
        const { result: setImportMetaEnv } = renderHook(() => useSetAtom(mockImportMetaEnvAtom));
        act(() => setImportMetaEnv.current(fakeEnvFile));
        const { result: webConfigAtomResult } = renderHook(() => useAtom(webConfigAtom));
        const { result: setMockPublicEnvTxtAtom } = renderHook(() =>
            useSetAtom(mockPublicEnvTxtAtom),
        );

        act(() => {
            setMockPublicEnvTxtAtom.current(Option.some(fakeEnvText));
        });

        await waitForWebConfig();

        if (webConfigAtomResult.current[0]?.isMock === true) {
            throw new Error('Unexpected isMock');
        }

        expect(webConfigAtomResult.current[0].value.http).toEqual(
            fakeEnvFile[env.NEXT_PUBLIC_API_HTTP],
        );
        expect(webConfigAtomResult.current[0].value.ws).toEqual(
            fakeEnvFile[env.NEXT_PUBLIC_API_WS],
        );
        expect(webConfigAtomResult.current[0].value.authProviders?.sort()).toEqual(
            [env.authProviders.email, env.authProviders.google].sort(),
        );
        expect(webConfigAtomResult.current[0].value.firebaseConfig).toEqual(fakeFirebaseConfig1[0]);
        expect(webConfigAtomResult.current[0].value.isUnlistedFirebaseStorageEnabled).toBe(true);

        // cleanup
        act(() => setImportMetaEnv.current(null));
    });
});
