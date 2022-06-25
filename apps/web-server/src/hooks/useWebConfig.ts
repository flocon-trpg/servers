import { useAtomValue } from 'jotai/utils';
import { webConfigAtom } from '../atoms/webConfigAtom/webConfigAtom';

export const useWebConfig = () => {
    return useAtomValue(webConfigAtom);
};
