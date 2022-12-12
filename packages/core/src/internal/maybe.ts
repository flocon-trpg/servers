import { z } from 'zod';

/** @deprecated Use `optional` method in zod. */
export const maybe = <T extends z.ZodTypeAny>(source: T) => source.optional();
export type Maybe<T> = T | undefined;
