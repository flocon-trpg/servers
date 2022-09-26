import truncate from 'truncate-utf8-bytes';

/*
Firebaseのファイル名には次のような制限がある。

Firebase Storageにおける制限とガイドライン
https://firebase.google.com/docs/storage/web/create-reference#limitations_on_references

Cloud Storageにおける制限とガイドライン
https://cloud.google.com/storage/docs/naming-objects

いっぽう内蔵アップローダーの場合は、ファイル名はデータベースで管理されるため文字列の長さ以外に制限はない。だが、混乱を招きかねない文字は望ましくないため、無効化したほうがいい。
*/

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

const toPathArray = (source: UploaderPathSource): readonly string[] => {
    let result: readonly string[];
    if (typeof source === 'string') {
        result = source.replace(/(^\/)|(\/$)/g, '').split('/');
    } else {
        result = source;
    }
    return result.filter(name => name !== '');
};

const replacement = '_';

const sanitizeCore = (input: string) => {
    /*
    npm の sanitize-filename(https://github.com/parshap/node-sanitize-filename/blob/209c39b914c8eb48ee27bcbde64b2c7822fdf3de/index.js ライセンスは WTFPL or ISC)を参考にしている。
    sanitize-filename  からの主な変更点は次の通り。

    - no-useless-escapeのwarningが出る\を消去。
    - windowsReservedReとwindowsTrailingReを消去。
    */
    const illegalRe = /[/?<>\\:*|"]/g;
    // eslint-disable-next-line no-control-regex
    const controlRe = /[\x00-\x1f\x80-\x9f]/g;
    const reservedRe = /^\.+$/;

    return input
        .replace(illegalRe, replacement)
        .replace(controlRe, replacement)
        .replace(reservedRe, replacement);
};

export const sanitizeFoldername = (input: string): string => {
    const sanitized = sanitizeCore(input);
    // 255という数値は、実用的な長さの中で最大値だとこちらで判断した値
    return truncate(sanitized, 255);
};

export const sanitizeFilename = (input: string): string | null => {
    const sanitized = sanitizeCore(input);
    // 255という数値は、実用的な長さの中で最大値だとこちらで判断した値
    const result = truncate(sanitized, 255);
    if (sanitized !== result) {
        // truncateが発生したファイル名をそのまま返すと、拡張子が消えて混乱を招くおそれがあるため代わりにnullを返している。
        return null;
    }
    return result;
};

const toResult = (path: UploaderPathSource): PathResult => {
    const arrayResult = toPathArray(path);
    return {
        string: arrayResult.join('/'),
        array: arrayResult,
    };
};

export const trySanitizePath = (path: UploaderPathSource): PathResult | null => {
    const pathArray = toPathArray(path);
    const sanitizedArray: string[] = [];
    for (const elem of pathArray) {
        const next = sanitizeCore(elem);
        sanitizedArray.push(next);
    }

    const result = toResult(sanitizedArray);

    if (result.string != null) {
        // Firebase および Cloud Storage には length 1-1024 bytes when UTF-8 encoded という制限があるので1024を指定している
        const truncated = truncate(result.string, 1024);

        if (result.string !== truncated) {
            // truncateが発生したファイルパスをそのまま返すと、末尾のほうのフォルダがなくなったり、拡張子が消えて混乱を招くおそれがあるため代わりにnullを返している。
            return null;
        }
    }

    return result;
};

/**
 *
 * @returns Sanitizeされていない値を返します。
 */
export const joinPath = (left: UploaderPathSource, ...right: UploaderPathSource[]): PathResult => {
    let source = toPathArray(left);
    for (const r of right) {
        const next = toPathArray(r);
        source = [...source, ...next];
    }
    return toResult(source);
};
