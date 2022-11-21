import { z } from 'zod';
export declare const templateValue: {
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
    /**
     * @description To 3rd-party developers: Please always set undefined to this if it is CharacterPiece or PortraitPiece.
     */
    memo: {
        readonly type: "atomic";
        readonly mode: "ot";
        readonly nullable: true;
    };
    /**
     * @description To 3rd-party developers: Please always set undefined to this if it is CharacterPiece or PortraitPiece.
     */
    name: {
        readonly type: "atomic";
        readonly mode: "ot";
        readonly nullable: true;
    };
    /**
     * @description To 3rd-party developers: Please always set undefined to this because it is not implemented yet in the official web-server.
     */
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
        /**
         * @description To 3rd-party developers: Please always set undefined to this if it is CharacterPiece or PortraitPiece.
         */
        memo: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        /**
         * @description To 3rd-party developers: Please always set undefined to this if it is CharacterPiece or PortraitPiece.
         */
        name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        /**
         * @description To 3rd-party developers: Please always set undefined to this because it is not implemented yet in the official web-server.
         */
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