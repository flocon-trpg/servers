export const undefinedForAll = (source: Record<string, unknown>): boolean => {
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            return false;
        }
    }
    return true;
};