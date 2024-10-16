export const typescriptLibSource = `
declare type Array<T> = {
    filter<S extends T>(predicate: (value: T, index: number) => value is S): S[];
    filter(predicate: (value: T, index: number) => unknown): T[];

    find<S extends T>(predicate: (this: void, value: T, index: number) => value is S): S | undefined;
    find(predicate: (value: T, index: number) => unknown): T | undefined

    forEach(callbackfn: (value: T, index: number) => void): void;

    map<U>(callbackfn: (value: T, index: number) => U): U[];

    pop(): T | undefined;

    push(...items: T[]): number;

    shift(): T | undefined;

    unshift(...items: T[]): number;
}

declare type String = {
    toString(): string;
}

declare class Map<K, V> {
    constructor() { }
    clear(): void;
    // delete(key: K): boolean;
    // forEach(callbackfn: (value: V, key: K) => void): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
    // readonly size: number;
}
`;
