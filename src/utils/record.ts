export const chooseRecord = <TSource, TResult>(source: Record<string, TSource>, chooser: (element: TSource) => TResult | undefined): Record<string, TResult> => {
    const result: Record<string, TResult> = {};
    for (const key in source) {
        const element = source[key];
        if (element !== undefined) {
            const newElement = chooser(element);
            if (newElement !== undefined) {
                result[key] = newElement;
            }
        }
    }
    return result;
};

export const recordToArray = <T>(source: Record<string, T>): { key: string; value: T }[] => {
    const result: { key: string; value: T }[] = [];
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            result.push({ key, value });
        }
    }
    return result;
};