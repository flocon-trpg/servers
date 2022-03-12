export type CompositeKey = {
    id: string;
    createdBy: string;
};

export const stringToCompositeKey = (source: string): CompositeKey | null => {
    const array = source.split('@');
    if (array.length !== 2) {
        return null;
    }
    return { id: array[0]!, createdBy: array[1]! };
};

export const compositeKeyToJsonString = (source: CompositeKey): string => {
    return `{ id: ${source.id}, createdBy: ${source.createdBy} }`;
};

export const compositeKeyEquals = (x: CompositeKey, y: CompositeKey): boolean => {
    return x.createdBy === y.createdBy && x.id === y.id;
};
