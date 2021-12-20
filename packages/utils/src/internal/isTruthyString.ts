import { isTruthyStringOrNullish } from './isTruthyStringOrNullish';

export const isTruthyString = (source: string | null | undefined): boolean => {
    return isTruthyStringOrNullish(source) ?? false;
};
