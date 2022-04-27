import { isFalsyStringOrNullish } from './isFalsyStringOrNullish';

export const isFalsyString = (source: string | null | undefined): boolean => {
    return isFalsyStringOrNullish(source) ?? false;
};
