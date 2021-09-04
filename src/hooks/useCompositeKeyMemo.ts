import { CompositeKey } from '@kizahasi/util';
import React from 'react';

export const useCompositeKeyMemo = (source: CompositeKey): CompositeKey => {
    return React.useMemo(() => {
        return {
            createdBy: source.createdBy,
            id: source.id,
        };
    }, [source.createdBy, source.id]);
};
