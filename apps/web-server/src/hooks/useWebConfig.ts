import { useAtomValue } from 'jotai/react';
import { webConfigAtom } from '../atoms/webConfigAtom/webConfigAtom';

export const useWebConfig = () => {
    return useAtomValue(webConfigAtom);
};
