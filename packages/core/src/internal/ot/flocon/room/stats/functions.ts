import { State } from '../../../generator/types';
import { template } from './types';

export const toClientState = (source: State<typeof template>): State<typeof template> => {
    return source;
};

// stats は常に DbTemplate から自動生成される state であるため、serverTransform による改変はできない。
