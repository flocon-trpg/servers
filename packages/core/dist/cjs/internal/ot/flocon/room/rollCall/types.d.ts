import { z } from 'zod';
export declare const template: {
    readonly type: "object";
    readonly $v: 1;
    readonly $r: 1;
    readonly value: {
        createdAt: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        createdBy: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodString;
        };
        participants: {
            readonly type: "record";
            readonly value: {
                readonly type: "object";
                readonly $v: 1;
                readonly $r: 1;
                readonly value: {
                    answeredAt: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodUnion<[z.ZodNumber, z.ZodUndefined]>;
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=types.d.ts.map