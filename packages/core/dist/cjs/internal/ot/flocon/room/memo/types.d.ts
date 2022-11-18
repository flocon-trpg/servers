import { z } from 'zod';
export declare const Plain = "Plain";
export declare const Markdown = "Markdown";
export declare const template: {
    readonly type: "object";
    readonly $v: 1;
    readonly $r: 1;
    readonly value: {
        name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        dir: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodArray<z.ZodString, "many">;
        };
        text: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        /**
         * @description To 3rd-party developers: Please always set 'Plain' to this because 'Markdown' is not implemented yet in the official web-server.
         */
        textType: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodUnion<[z.ZodLiteral<"Plain">, z.ZodLiteral<"Markdown">]>;
        };
    };
};
//# sourceMappingURL=types.d.ts.map