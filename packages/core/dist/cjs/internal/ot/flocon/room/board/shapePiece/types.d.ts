import { z } from 'zod';
export declare const template: {
    readonly type: "object";
    readonly $v: 1;
    readonly $r: 1;
    readonly value: {
        ownerParticipantId: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodOptional<z.ZodString>;
        };
        isPrivate: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        /**
         * keyは`'1'`から`'9'`の9個のみをサポートしています。詳細は`./functions.ts`を参照してください。
         *
         * ShapeのPath.dataは、widthとheightがともに100pxの正方形として記述します。コマなどの大きさに応じて自動的にscaleされます。
         * */
        shapes: import("../../../../generator/types").RecordValueTemplate<{
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
                    readonly value: z.ZodOptional<z.ZodString>;
                };
                stroke: {
                    readonly type: "atomic";
                    readonly mode: "replace";
                    readonly value: z.ZodOptional<z.ZodString>;
                };
                strokeWidth: {
                    readonly type: "atomic";
                    readonly mode: "replace";
                    readonly value: z.ZodOptional<z.ZodNumber>;
                }; /**
                 * keyは`'1'`から`'9'`の9個のみをサポートしています。詳細は`./functions.ts`を参照してください。
                 *
                 * ShapeのPath.dataは、widthとheightがともに100pxの正方形として記述します。コマなどの大きさに応じて自動的にscaleされます。
                 * */
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