import { FilePathFragment } from '../../generated/graphql';

export const filePathEquals = (
    x: FilePathFragment | null | undefined,
    y: FilePathFragment | null | undefined
): boolean => {
    if (x == null) {
        return y == null;
    }
    if (y == null) {
        return false;
    }
    if (x.path !== y.path) {
        return false;
    }
    if (x.sourceType !== y.sourceType) {
        return false;
    }
    return true;
};
