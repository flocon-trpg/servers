import { useAtomValue } from 'jotai/utils';
import { webConfigAtom } from '../atoms/webConfig/webConfigAtom';

export const useWebConfig = () => {
    return useAtomValue(webConfigAtom);
};
