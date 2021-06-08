export const fileName = (fullPath: string): string => {
    const split = fullPath.split('/');
    if (split.length === 0) {
        return fullPath;
    }
    return split[split.length - 1];
};