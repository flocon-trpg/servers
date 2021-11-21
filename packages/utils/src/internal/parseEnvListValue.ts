export const parseEnvListValue = (source: string | null | undefined): string[] => {
    if (source == null) {
        return [];
    }
    return source.split(',').map(x => x.trim());
};
