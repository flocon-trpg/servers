import { z } from 'zod';
export declare const template: {
    readonly type: "object";
    readonly $v: 1;
    readonly $r: 1;
    readonly value: {
        shape: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodObject<{
                type: z.ZodLiteral<"path">;
                data: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "path";
                data: string;
            }, {
                type: "path";
                data: string;
            }>;
        };
        fill: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
        };
        stroke: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
        };
        strokeWidth: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodUnion<[z.ZodNumber, z.ZodUndefined]>;
        };
    };
};
//# sourceMappingURL=types.d.ts.map