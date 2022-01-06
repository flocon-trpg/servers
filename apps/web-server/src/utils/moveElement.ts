export const moveElement = <T>(
    source: T[],
    getKey: (elem: T) => string,
    action: { from: string; to: string }
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

    const elementToMove = source[fromIndex];
    if (elementToMove == null) {
        throw new Error('This should not happen');
    }
    source.splice(fromIndex, 1);
    if (toIndex < fromIndex) {
        source.splice(toIndex, 0, elementToMove);
        return source;
    }
    source.splice(toIndex + 1, 0, elementToMove);
    return source;
};
