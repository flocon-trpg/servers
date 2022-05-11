export const isFalsyStringOrNullish = (
    source: string | null | undefined
): boolean | null | undefined => {
    if (source == null) {
        return source;
    }
    const trimmed = source.trim();
    const lowered = trimmed.toLowerCase();
    return lowered === 'false' || lowered === '0';
};
