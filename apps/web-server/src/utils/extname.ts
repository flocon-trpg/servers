type Result = {
    /** ファイル名。拡張子がある場合は拡張子の部分を取り除いて返します。 */
    fileName: string;

    /** ファイルの拡張子 */
    fileExtension: string | null;
};

export const extname = (fileName: string): Result => {
    const fileNameArray = fileName.split('.');
    const last = fileNameArray.pop();
    if (last == null) {
        throw new Error('This should not happen');
    }
    const secondLast = fileNameArray.pop();
    if (secondLast == null || secondLast === '') {
        return {
            fileName: last,
            fileExtension: null,
        };
    }
    return {
        fileName: secondLast,
        fileExtension: last,
    };
};
