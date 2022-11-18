import { z } from 'zod';
export declare const maybe: <T extends z.ZodTypeAny>(source: T) => z.ZodUnion<[T, z.ZodUndefined]>;
export declare type Maybe<T> = T | undefined;
//# sourceMappingURL=maybe.d.ts.map