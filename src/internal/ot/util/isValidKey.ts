// (不正な|悪意のある)キーが混入するおそれがあるのはserverTransformのときのみなので、serverTransform以外では使わなくてよい
export const isValidKey = (key: string): boolean => {
    // Firebase Authenticationのuidは28文字のようなので、最低でもその文字数は許容しなければならない
    if (key.length >= 40) {
        return false;
    }
    return key.match(/^([0-9a-zA-Z]|-|_)+$/g) != null;
};
