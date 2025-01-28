import { z } from 'zod';

// TODO: z.unknown().optional() の部分は、大丈夫であれば z.string() や z.string().optional() 等に変更する
export const tsTypeObject = z.object({ __tstype: z.unknown().optional() });
