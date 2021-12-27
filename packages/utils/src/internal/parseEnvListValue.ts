export const parseEnvListValue = (
    source: string | null | undefined
): string[] | null | undefined => {
    if (source == null) {
        return source;
    }
    return source.split(',').map(x => x.trim());
};
