export const isTruthyString = (source: string | null | undefined): boolean => {
    if (source == null) {
        return false;
    }
    const trimmed = source.trim();
    return trimmed.toLowerCase() === 'true';
};
