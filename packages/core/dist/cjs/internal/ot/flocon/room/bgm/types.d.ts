import { z } from 'zod';
export declare const template: {
    readonly type: "object";
    readonly $v: 1;
    readonly $r: 1;
    readonly value: {
        isPaused: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        files: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodArray<z.ZodObject<{
                $v: z.ZodLiteral<1>;
                $r: z.ZodLiteral<1>;
                path: z.ZodString;
                sourceType: z.ZodUnion<[z.ZodLiteral<"Default">, z.ZodLiteral<"Uploader">, z.ZodLiteral<"FirebaseStorage">]>;
            }, "strip", z.ZodTypeAny, {
                path: string;
                $v: 1;
                $r: 1;
                sourceType: "Default" | "Uploader" | "FirebaseStorage";
            }, {
                path: string;
                $v: 1;
                $r: 1;
                sourceType: "Default" | "Uploader" | "FirebaseStorage";
            }>, "many">;
        };
        volume: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
    };
};
//# sourceMappingURL=types.d.ts.map