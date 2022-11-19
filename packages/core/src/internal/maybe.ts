import { z } from 'zod';

export const maybe = <T extends z.ZodTypeAny>(source: T) => z.union([source, z.undefined()]);
export type Maybe<T> = T | undefined;
