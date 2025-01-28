/** ファイルもしくはフォルダのパスを表します。
 *
 * stringの場合は、半角スラッシュでパスの区切りを表します。半角スラッシュをエスケープすることはできません。2つ以上続く半角スラッシュは1つとして扱われます。
 *
 * 配列の場合は、要素のstringに半角スラッシュが含まれていた場合、それらは区切りとしてみなされず保持されます。`''`の要素は存在しないものとして扱われます。
 */
export type UploaderPathSource = string | readonly string[];
type PathResult = {
    /** パスを1つの文字列で表します。区切り文字は`/`です。先頭および末尾に`/`は付きません。 `''`の場合はルートフォルダを表します。 */
    string: string;
    /** `[]`の場合はルートフォルダを表します。 */
    array: readonly string[];
};
export declare const sanitizeFoldername: (input: string) => string;
export declare const sanitizeFilename: (input: string) => string | null;
export declare const trySanitizePath: (path: UploaderPathSource) => PathResult | null;
/**
 *
 * @returns Sanitizeされていない値を返します。
 */
export declare const joinPath: (left: UploaderPathSource, ...right: UploaderPathSource[]) => PathResult;
export {};
//# sourceMappingURL=uploaderPath.d.ts.map