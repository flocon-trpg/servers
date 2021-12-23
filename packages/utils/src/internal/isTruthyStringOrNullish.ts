export const isTruthyStringOrNullish = (
    source: string | null | undefined
): boolean | null | undefined => {
    if (source == null) {
        return source;
    }
    const trimmed = source.trim();
    return trimmed.toLowerCase() === 'true';
};
