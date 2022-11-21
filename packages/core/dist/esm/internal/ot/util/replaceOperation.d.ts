type ServerTransformParameters<T> = {
    first: {
        oldValue: T;
        newValue: T;
    } | undefined;
    second: {
        newValue: T;
    } | undefined;
    prevState: T;
};
type ServerTransformResult<T> = {
    oldValue: T;
    newValue: T;
} | undefined;
export declare const serverTransform: <T>({ first, second, prevState, }: ServerTransformParameters<T>) => ServerTransformResult<T>;
export {};
//# sourceMappingURL=replaceOperation.d.ts.map