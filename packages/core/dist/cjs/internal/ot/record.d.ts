import { z } from 'zod';
export declare const isEmptyRecord: (source: Record<string, unknown>) => boolean;
export declare const isIdRecord: (source: Record<string, unknown>) => boolean;
export declare const record: <Value extends z.ZodTypeAny>(value: Value) => z.ZodRecord<z.ZodString, z.ZodUnion<[Value, z.ZodUndefined]>>;
export type StringKeyRecord<T> = Record<string, T | undefined>;
//# sourceMappingURL=record.d.ts.map