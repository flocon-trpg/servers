// @vitest-environment jsdom

// このファイルのテストは、Flocon の設定が書かれた .env ファイルなどが存在すると失敗します。

import { delay } from '@flocon-trpg/utils';
import { Option } from '@kizahasi/option';
import { act, renderHook } from '@testing-library/react';
import { useAtom, useSetAtom } from 'jotai';
import { describe, expect, it } from 'vitest';
import { fakeEnvText, fakeEnvTextSource } from './fakeEnvText';
import { mockImportMetaEnvAtom, mockPublicEnvTxtAtom, webConfigAtom } from './webConfigAtom';

// これを実行しないと、OSに設定されている環境変数や .env ファイルが読み込まれてしまう。実行するタイミングはどこでも構わないはず。
const preventUsingImportMetaEnv = () => {
    const { result: setMockImportMetaEnv } = renderHook(() => useSetAtom(mockImportMetaEnvAtom));

    act(() => {
        setMockImportMetaEnv.current({});
    });
};

// webConfigAtom は async に値を取得する atom であるため、少し待つ必要がある。
const waitForWebConfig = async () => await delay(100);

describe('webConfigAtom (process.env does not exist)', () => {
    it('tests with empty env.txt', async () => {
        preventUsingImportMetaEnv();

        const { result: webConfigAtomResult } = renderHook(() => useAtom(webConfigAtom));
        const { result: setMockPublicEnvTxtAtom } = renderHook(() =>
            useSetAtom(mockPublicEnvTxtAtom),
        );

        act(() => {
            setMockPublicEnvTxtAtom.current(Option.some(null));
        });
        await waitForWebConfig();

        expect(webConfigAtomResult.current[0]?.value).toBeUndefined();
    });

    it('tests with non-empty env.txt', async () => {
        preventUsingImportMetaEnv();

        const { result: webConfigAtomResult } = renderHook(() => useAtom(webConfigAtom));
        const { result: setMockPublicEnvTxtAtom } = renderHook(() =>
            useSetAtom(mockPublicEnvTxtAtom),
        );

        act(() => {
            setMockPublicEnvTxtAtom.current(Option.some(fakeEnvText));
        });
        await waitForWebConfig();

        if (webConfigAtomResult.current[0]?.value?.isMock === true) {
            throw new Error('Unexpected isMock');
        }

        expect(webConfigAtomResult.current[0].value?.value.http).toEqual(
            fakeEnvTextSource.NEXT_PUBLIC_API_HTTP,
        );
        expect(webConfigAtomResult.current[0].value?.value.ws).toEqual(
            fakeEnvTextSource.NEXT_PUBLIC_API_WS,
        );
        expect(webConfigAtomResult.current[0].value?.value.authProviders?.sort()).toEqual(
            [...fakeEnvTextSource.NEXT_PUBLIC_AUTH_PROVIDERS].sort(),
        );
        expect(webConfigAtomResult.current[0].value?.value.firebaseConfig).toEqual(
            fakeEnvTextSource.NEXT_PUBLIC_FIREBASE_CONFIG,
        );
        expect(webConfigAtomResult.current[0].value?.value.isUnlistedFirebaseStorageEnabled).toBe(
            fakeEnvTextSource.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED,
        );
    });
});
