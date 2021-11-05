import { maxLength100String, MaxLength100String } from '@flocon-trpg/core';

export const convertToMaxLength100String = (source: string): MaxLength100String => {
    if (maxLength100String.is(source)) {
        return source;
    }
    const max100String = source.slice(0, 100);
    if (maxLength100String.is(max100String)) {
        return max100String;
    }
    throw new Error('this should not happen');
};
