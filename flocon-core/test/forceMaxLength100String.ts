import { maxLength100String, MaxLength100String } from '../src';

export const forceMaxLength100String = (source: string): MaxLength100String => {
    if (maxLength100String.is(source)) {
        return source;
    }
    throw new Error('source.length > 100');
};
