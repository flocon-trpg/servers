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
            readonly value: z.ZodOptional<z.ZodBranded<z.ZodString, "MaxLength100String">>;
        };
        role: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"Player">, z.ZodLiteral<"Spectator">, z.ZodLiteral<"Master">]>>;
        };
    };
};
export {};
//# sourceMappingURL=types.d.ts.map