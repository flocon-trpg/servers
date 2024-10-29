import { atom } from 'jotai';
import { useAtomValue } from 'jotai/react';
import { webConfigAtom } from '../atoms/webConfigAtom/webConfigAtom';
import { MockableWebConfig } from '@/configType';

const resultAtom = atom(async get => {
    const webConfig = await get(webConfigAtom);
    return webConfig.value;
});

// 元々、get(webConfigAtom) の戻り値は Result<WebConfigReturnType> であり WebConfigReturnType['value'] を1行で安全に取得できるようにこの atom が作られたが、戻り値が WebConfigReturnType になったため、この hook の存在価値は薄い。
export const useWebConfig = (): MockableWebConfig => {
    return useAtomValue(resultAtom);
};
