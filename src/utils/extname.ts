export const extname = (fileName: string): string | null => {
    const split = fileName.split('.');
    if (split.length === 0) {
        return null;
    }
    return split[split.length - 1];
};