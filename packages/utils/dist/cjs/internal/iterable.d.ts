import { Option } from '@kizahasi/option';
export declare function map<T1, T2>(source: Iterable<T1>, mapping: (source: T1) => T2): Generator<T2, void, unknown>;
export declare function choose<T1, T2>(source: Iterable<T1>, mapping: (source: T1) => Option<T2>): Generator<T2, void, unknown>;
//# sourceMappingURL=iterable.d.ts.map