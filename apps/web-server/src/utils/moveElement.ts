export const moveElement = <T>(
    source: T[],
    getKey: (elem: T) => string,
    action: { from: string; to: string },
): T[] | null => {
    const fromIndex = source.findIndex(elem => getKey(elem) === action.from);
    if (fromIndex < 0) {
        return null;
    }
    const toIndex = source.findIndex(elem => getKey(elem) === action.to);
    if (toIndex < 0) {
        return null;
    }

    if (fromIndex === toIndex) {
        return source;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const elementToMove = source[fromIndex] as T;
    source.splice(fromIndex, 1);
    source.splice(toIndex, 0, elementToMove);
    return source;
};
