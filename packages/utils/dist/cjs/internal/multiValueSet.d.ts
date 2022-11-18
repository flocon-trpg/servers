/** 複数の値を使用できるSet */
export declare class MultiValueSet<T> {
    #private;
    add(key: readonly T[]): void;
    has(key: readonly T[]): boolean;
    delete(key: readonly T[]): void;
    get size(): number;
    toIterator(): Iterable<readonly T[]>;
    clone(): MultiValueSet<T>;
}
//# sourceMappingURL=multiValueSet.d.ts.map