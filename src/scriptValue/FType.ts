export namespace FType {
    export const Boolean = 'Boolean';
    export const Number = 'Number';
    export const String = 'String';

    // 通常のJavaScriptではtypeofで'array'が返されることはないが、このライブラリではArray.isArrayの判定に用いている
    export const Array = 'Array';

    export const Object = 'Object';
    export const Function = 'Function';
}
