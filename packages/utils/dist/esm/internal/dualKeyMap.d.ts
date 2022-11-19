import { Option } from '@kizahasi/option';
import { GroupJoinResult } from './types';
export declare type DualKey<T1, T2> = {
    readonly first: T1;
    readonly second: T2;
};
export declare const toJsonString: <T1, T2>(source: DualKey<T1, T2>) => string;
export declare type DualKeyMapSource<TKey1, TKey2, TValue> = Map<TKey1, Map<TKey2, TValue>> | Map<TKey1, ReadonlyMap<TKey2, TValue>> | ReadonlyMap<TKey1, Map<TKey2, TValue>> | ReadonlyMap<TKey1, ReadonlyMap<TKey2, TValue>>;
declare type RecordKey = string | number | symbol;
export declare class DualKeyMap<TKey1, TKey2, TValue> {
    private _core;
    constructor(sourceMap?: DualKeyMapSource<TKey1, TKey2, TValue>);
    private static chooseMap;
    private static create;
    static ofRecord<TKey1 extends RecordKey, TKey2 extends RecordKey, TValue>(source: Record<TKey1, Record<TKey2, TValue | undefined> | undefined>): DualKeyMap<TKey1, TKey2, TValue>;
    map<TResult>(mapping: (source: TValue, key: DualKey<TKey1, TKey2>) => TResult): DualKeyMap<TKey1, TKey2, TResult>;
    choose<TResult>(chooser: (source: TValue, key: DualKey<TKey1, TKey2>) => Option<TResult>): DualKeyMap<TKey1, TKey2, TResult>;
    clone(): DualKeyMap<TKey1, TKey2, TValue>;
    get({ first, second }: DualKey<TKey1, TKey2>): TValue | undefined;
    getByFirst(first: TKey1): ReadonlyMap<TKey2, TValue>;
    set({ first, second }: DualKey<TKey1, TKey2>, value: TValue): DualKeyMap<TKey1, TKey2, TValue>;
    delete({ first, second }: DualKey<TKey1, TKey2>): boolean;
    has(key: DualKey<TKey1, TKey2>): boolean;
    [Symbol.iterator](): IterableIterator<readonly [DualKey<TKey1, TKey2>, TValue]>;
    toArray(): (readonly [DualKey<TKey1, TKey2>, TValue])[];
    toMap(): Map<TKey1, Map<TKey2, TValue>>;
    toStringRecord(createStringKey1: (first: TKey1) => string, createStringKey2: (second: TKey2) => string): Record<string, Record<string, TValue>>;
    get size(): number;
    get isEmpty(): boolean;
    forEach(action: (value: TValue, key: DualKey<TKey1, TKey2>) => void): void;
    reduce<TResult>(reducer: (seed: TResult, element: TValue, key: DualKey<TKey1, TKey2>) => TResult, seed: TResult): TResult;
    toJSON(valueToString?: (value: TValue) => string): string;
}
export declare type ReadonlyDualKeyMap<TKey1, TKey2, TValue> = Omit<Readonly<DualKeyMap<TKey1, TKey2, TValue>>, 'set' | 'delete' | 'getByFirst'> & {
    [Symbol.iterator](): IterableIterator<readonly [DualKey<TKey1, TKey2>, TValue]>;
    getByFirst(key: TKey1): ReadonlyMap<TKey2, TValue> | undefined;
};
export declare const groupJoinDualKeyMap: <TKey1, TKey2, TLeft, TRight>(left: ReadonlyDualKeyMap<TKey1, TKey2, TLeft>, right: ReadonlyDualKeyMap<TKey1, TKey2, TRight>) => DualKeyMap<TKey1, TKey2, GroupJoinResult<TLeft, TRight>>;
export declare const groupJoin3DualKeyMap: <TKey1, TKey2, T1, T2, T3>(source1: ReadonlyDualKeyMap<TKey1, TKey2, T1>, source2: ReadonlyDualKeyMap<TKey1, TKey2, T2>, source3: ReadonlyDualKeyMap<TKey1, TKey2, T3>) => DualKeyMap<TKey1, TKey2, readonly [T1 | undefined, T2 | undefined, T3 | undefined]>;
export declare const groupJoin4DualKeyMap: <TKey1, TKey2, T1, T2, T3, T4>(source1: ReadonlyDualKeyMap<TKey1, TKey2, T1>, source2: ReadonlyDualKeyMap<TKey1, TKey2, T2>, source3: ReadonlyDualKeyMap<TKey1, TKey2, T3>, source4: ReadonlyDualKeyMap<TKey1, TKey2, T4>) => DualKeyMap<TKey1, TKey2, readonly [T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined]>;
export {};
//# sourceMappingURL=dualKeyMap.d.ts.map