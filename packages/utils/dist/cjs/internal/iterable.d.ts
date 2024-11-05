import { Option } from '@kizahasi/option';
export declare function mapIterable<T1, T2>(source: Iterable<T1>, mapping: (source: T1) => T2): Generator<T2, void, unknown>;
export declare function chooseIterable<T1, T2>(source: Iterable<T1>, mapping: (source: T1) => Option<T2>): Generator<T2, void, unknown>;
export declare function pairwiseIterable<T>(source: Iterable<T>): Generator<{
    prev: T | undefined;
    current: T;
}, void, unknown>;
//# sourceMappingURL=iterable.d.ts.map