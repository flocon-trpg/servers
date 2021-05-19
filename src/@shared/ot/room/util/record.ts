export const isIdRecord = (source: Record<string, unknown>): boolean => {
    for (const key in source) {
        if (key === '$version') {
            continue;
        }
        const value = source[key];
        if (value !== undefined) {
            return false;
        }
    }
    return true;
};