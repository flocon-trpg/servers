import { Result } from '@kizahasi/result';
import { atom } from 'jotai';
import { useAtomValue } from 'jotai/react';
import { webConfigAtom } from '../atoms/webConfigAtom/webConfigAtom';
import { MockableWebConfig } from '@/configType';

const resultAtom = atom(async get => {
    const webConfig = await get(webConfigAtom);
    if (webConfig.isError) {
        return webConfig;
    }
    return Result.ok(webConfig.value.value);
});

export const useWebConfig = (): Result<MockableWebConfig> => {
    return useAtomValue(resultAtom);
};
