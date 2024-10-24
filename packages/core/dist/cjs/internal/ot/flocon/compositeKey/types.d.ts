import { z } from 'zod';
export declare const compositeKey: {
    readonly type: "atomic";
    readonly mode: "replace";
    readonly value: z.ZodObject<{
        createdBy: z.ZodString;
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        createdBy: string;
        id: string;
    }, {
        createdBy: string;
        id: string;
    }>;
};
//# sourceMappingURL=types.d.ts.map