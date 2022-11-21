import { MaxLength100String, maxLength100String } from '@flocon-trpg/core';

export const convertToMaxLength100String = (source: string): MaxLength100String => {
    const parsed = maxLength100String.safeParse(source);
    if (parsed.success) {
        return parsed.data;
    }
    const sourceLengthIs100 = source.slice(0, 100);
    return maxLength100String.parse(sourceLengthIs100);
};
