import { z } from 'zod';
export declare const dicePieceStrIndexes: readonly ["1", "2", "3", "4"];
export declare const template: {
    readonly type: "object";
    readonly $v: 2;
    readonly $r: 1;
    readonly value: {
        ownerCharacterId: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodOptional<z.ZodString>;
        };
        dice: import("@/ot/generator").RecordValueTemplate<{
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
                    readonly value: z.ZodOptional<z.ZodNumber>;
                };
            };
        }>;
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