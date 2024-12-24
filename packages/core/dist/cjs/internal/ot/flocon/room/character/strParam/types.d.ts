import { z } from 'zod';
export declare const template: {
    readonly type: "object";
    readonly $v: 2;
    readonly $r: 1;
    readonly value: {
        isValuePrivate: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        value: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        overriddenParameterName: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
    };
};
//# sourceMappingURL=types.d.ts.map