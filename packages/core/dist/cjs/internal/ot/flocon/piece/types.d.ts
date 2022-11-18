import { z } from 'zod';
export declare const templateValue: {
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
        readonly value: z.ZodUnion<[z.ZodNumber, z.ZodUndefined]>;
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
export declare const template: {
    readonly type: "object";
    readonly $v: undefined;
    readonly $r: undefined;
    readonly value: {
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
            readonly value: z.ZodUnion<[z.ZodNumber, z.ZodUndefined]>;
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