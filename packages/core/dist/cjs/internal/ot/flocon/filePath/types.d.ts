import { z } from 'zod';
export declare const Default = "Default";
export declare const Uploader = "Uploader";
export declare const FirebaseStorage = "FirebaseStorage";
export declare const filePathValue: z.ZodObject<{
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
}>;
export declare const filePathTemplate: {
    readonly type: "atomic";
    readonly mode: "replace";
    readonly value: z.ZodObject<{
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
    }>;
};
//# sourceMappingURL=types.d.ts.map