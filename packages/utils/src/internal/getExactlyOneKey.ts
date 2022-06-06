export const getExactlyOneKey = (record: Record<string, unknown>): string => {
    const keys = [];
    for (const key in record) {
        keys.push(key);
    }
    if (keys.length === 1) {
        return keys[0]!;
    }
    throw new Error();
};
