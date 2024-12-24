export declare class SortedArray<T> {
    #private;
    readonly createSortKey: (value: T) => number;
    constructor(createSortKey: (value: T) => number, init?: readonly T[]);
    clone(): SortedArray<T>;
    add(newValue: T): void;
    updateLast(update: (oldValue: T) => T | undefined): {
        oldValue: T;
        newValue: T;
    } | undefined;
    toArray<T2>(mapFilter: (value: T) => T2 | undefined): T2[];
    clear(): void;
    createFiltered(filter: (value: T) => boolean): FilteredSortedArray<T>;
}
export declare class FilteredSortedArray<T> {
    private readonly filter;
    private readonly base;
    private constructor();
    clone(): FilteredSortedArray<T>;
    static ofArray<T>(base: readonly T[], filter: (value: T) => boolean, createSortKey: (value: T) => number): FilteredSortedArray<T>;
    static ofSortedKey<T>(base: SortedArray<T>, filter: (value: T) => boolean): FilteredSortedArray<T>;
    toArray<T2>(mapFilter: (value: T) => T2 | undefined): T2[];
    clear(): void;
    add(newValue: T): boolean;
    updateLast(update: (oldValue: T) => T | undefined): {
        oldValue: T | undefined;
        newValue: T | undefined;
    } | undefined;
}
//# sourceMappingURL=filteredArray.d.ts.map