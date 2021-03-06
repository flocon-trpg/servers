import { MaxLength100String, maxLength100String } from './maxLengthString';

export const forceMaxLength100String = (source: string): MaxLength100String => {
    if (maxLength100String.is(source)) {
        return source;
    }
    throw new Error('source.length > 100');
};
