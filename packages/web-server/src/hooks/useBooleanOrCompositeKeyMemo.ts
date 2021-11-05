import { CompositeKey } from '@flocon-trpg/utils';
import React from 'react';

export const useBooleanOrCompositeKeyMemo = (
    source: boolean | CompositeKey
): boolean | CompositeKey => {
    const createdBy = source === true || source === false ? null : source.createdBy;
    const id = source === true || source === false ? null : source.id;
    const sourceAsBoolean = source === true || source === false ? source : null;

    return React.useMemo(() => {
        if (sourceAsBoolean != null) {
            return sourceAsBoolean;
        }
        if (createdBy == null || id == null) {
            throw new Error('this should not happen');
        }
        return {
            createdBy,
            id,
        };
    }, [createdBy, id, sourceAsBoolean]);
};
