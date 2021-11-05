export const extname = (fileName: string): string | null => {
    const split = fileName.split('.');
    const result = split[split.length - 1];
    if (result == null) {
        return null;
    }
    return result;
};
