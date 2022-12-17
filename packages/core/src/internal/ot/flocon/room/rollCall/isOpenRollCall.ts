import { getOpenRollCall } from './getOpenRollCall';
import { template } from './types';
import { State } from '@/ot/generator';

export const isOpenRollCall = (source: State<typeof template>): boolean => {
    // キーは何でもいいので、適当なキーを指定している。
    const r = getOpenRollCall({ key: source });
    return r != null;
};
