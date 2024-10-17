import { z } from 'zod';

export const record = <Value extends z.ZodTypeAny>(value: Value) =>
    z.record(z.union([value, z.undefined()]));
