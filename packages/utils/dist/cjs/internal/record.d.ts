import { DualKey, DualKeyMap } from './dualKeyMap';
export declare const mapToRecord: <TValue>(source: Map<string, TValue>) => Record<string, TValue>;
export declare const chooseRecord: <TSource, TResult>(source: Record<string, TSource | undefined>, chooser: (element: TSource, key: string) => TResult | undefined) => Record<string, TResult>;
export declare const chooseDualKeyRecord: <TSource, TResult>(source: Record<string, Record<string, TSource | undefined> | undefined>, chooser: (element: TSource, key: DualKey<string, string>) => TResult | undefined) => Record<string, Record<string, TResult>>;
export declare const mapRecord: <TSource, TResult>(source: Record<string, TSource | undefined>, mapping: (element: TSource, key: string) => TResult) => Record<string, TResult>;
export declare const mapDualKeyRecord: <TSource, TResult>(source: Record<string, Record<string, TSource | undefined> | undefined>, mapping: (element: TSource, key: DualKey<string, string>) => TResult) => Record<string, Record<string, TResult>>;
export declare function recordToIterator<T>(source: Record<string, T | undefined>): IterableIterator<{
    key: string;
    value: T;
}>;
export declare const getExactlyOneKey: (record: Record<string, unknown>) => string;
export declare const recordToArray: <T>(source: Record<string, T | undefined>) => {
    key: string;
    value: T;
}[];
export declare const recordToMap: <T>(source: Record<string, T | undefined>) => Map<string, T>;
export declare const dualKeyRecordToDualKeyMap: <T>(source: Record<string, Record<string, T | undefined> | undefined>) => DualKeyMap<string, string, T>;
export declare const recordForEach: <T>(source: Record<string, T | undefined>, action: (value: T, key: string) => void) => void;
export declare const recordForEachAsync: <T>(source: Record<string, T | undefined>, action: (value: T, key: string) => Promise<void>) => Promise<void>;
export declare const isRecordEmpty: <T>(source: Record<string, T | undefined>) => boolean;
export declare const dualKeyRecordForEach: <T>(source: Record<string, Record<string, T | undefined> | undefined>, action: (value: T, key: DualKey<string, string>) => void) => void;
//# sourceMappingURL=record.d.ts.map