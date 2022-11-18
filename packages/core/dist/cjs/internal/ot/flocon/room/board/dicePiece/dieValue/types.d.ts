import { z } from 'zod';
export declare const D4 = "D4";
export declare const D6 = "D6";
export declare const dieType: z.ZodUnion<[z.ZodLiteral<"D4">, z.ZodLiteral<"D6">]>;
export declare type DieType = z.TypeOf<typeof dieType>;
export declare const template: {
    readonly type: "object";
    readonly $v: 1;
    readonly $r: 1;
    readonly value: {
        dieType: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodUnion<[z.ZodLiteral<"D4">, z.ZodLiteral<"D6">]>;
        };
        isValuePrivate: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        value: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodUnion<[z.ZodNumber, z.ZodUndefined]>;
        };
    };
};
//# sourceMappingURL=types.d.ts.map