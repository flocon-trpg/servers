import { act, renderHook } from '@testing-library/react';
import { useAtom } from 'jotai';
import { fakeEnvText, fakeEnvTextSource } from './fakeEnvText';
import { publicEnvTxtAtom, webConfigAtom } from './webConfigAtom';

describe('webConfigAtom (process.env does not exist)', () => {
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

        expect(webConfigAtomResult.current[0]?.value).toBeUndefined();
    });

    it('tests with non-empty env.txt', () => {
        const { result: webConfigAtomResult } = renderHook(() => useAtom(webConfigAtom));
        const { result: publicEnvTxtAtomResult } = renderHook(() => useAtom(publicEnvTxtAtom));

        act(() => {
            publicEnvTxtAtomResult.current[1]({ fetched: true, value: fakeEnvText });
        });

        expect(webConfigAtomResult.current[0]?.value?.http).toEqual(
            fakeEnvTextSource.NEXT_PUBLIC_API_HTTP
        );
        expect(webConfigAtomResult.current[0]?.value?.ws).toEqual(
            fakeEnvTextSource.NEXT_PUBLIC_API_WS
        );
        expect(webConfigAtomResult.current[0]?.value?.authProviders?.sort()).toEqual(
            [...fakeEnvTextSource.NEXT_PUBLIC_AUTH_PROVIDERS].sort()
        );
        expect(webConfigAtomResult.current[0]?.value?.firebaseConfig).toEqual(
            fakeEnvTextSource.NEXT_PUBLIC_FIREBASE_CONFIG
        );
        expect(webConfigAtomResult.current[0]?.value?.isUnlistedFirebaseStorageEnabled).toBe(
            fakeEnvTextSource.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED
        );
    });
});
