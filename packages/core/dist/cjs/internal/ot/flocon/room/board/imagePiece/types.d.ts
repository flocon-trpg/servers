import { z } from 'zod';
export declare const template: {
    readonly type: "object";
    readonly $v: 2;
    readonly $r: 1;
    readonly value: {
        ownerParticipantId: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodOptional<z.ZodString>;
        };
        image: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodOptional<z.ZodObject<{
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
            }>>;
        };
        isPrivate: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        cellH: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        cellW: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        cellX: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        cellY: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        isCellMode: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        h: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        isPositionLocked: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        memo: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        opacity: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodOptional<z.ZodNumber>;
        };
        w: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        x: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        y: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
    };
};
//# sourceMappingURL=types.d.ts.map