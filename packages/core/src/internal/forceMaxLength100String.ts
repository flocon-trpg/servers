import { MaxLength100String, maxLength100String } from './maxLengthString';

export const forceMaxLength100String = (source: string): MaxLength100String => {
    return maxLength100String.parse(source);
};
