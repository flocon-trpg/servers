import { z } from 'zod';
export declare const Player = "Player";
export declare const Spectator = "Spectator";
export declare const Master = "Master";
declare const participantRole: z.ZodUnion<[z.ZodLiteral<"Player">, z.ZodLiteral<"Spectator">, z.ZodLiteral<"Master">]>;
export type ParticipantRole = z.TypeOf<typeof participantRole>;
export declare const template: {
    readonly type: "object";
    readonly $v: 2;
    readonly $r: 1;
    readonly value: {
        name: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodUnion<[z.ZodBranded<z.ZodString, "MaxLength100String">, z.ZodUndefined]>;
        };
        role: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodUnion<[z.ZodUnion<[z.ZodLiteral<"Player">, z.ZodLiteral<"Spectator">, z.ZodLiteral<"Master">]>, z.ZodUndefined]>;
        };
    };
};
export {};
//# sourceMappingURL=types.d.ts.map