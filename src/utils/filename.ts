export const fileName = (fullPath: string): string => {
    const split = fullPath.split('/');
    const result = split[split.length - 1];
    if (result == null) {
        return fullPath;
    }
    return result;
};