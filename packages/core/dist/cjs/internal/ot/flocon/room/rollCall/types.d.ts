import { z } from 'zod';
/** 点呼の状況。 */
export declare const template: {
    readonly type: "object";
    readonly $v: 1;
    readonly $r: 1;
    readonly value: {
        createdAt: {
            readonly type: "atomic"; /** 点呼開始時に流す SE。 */
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        createdBy: {
            readonly type: "atomic"; /** 点呼開始時に流す SE。 */
            readonly mode: "replace";
            readonly value: z.ZodString;
        };
        /**
         * 締め切られたかどうか。nullish ならば締め切られていないことを表します。原則として、締め切られていない点呼は、最大で1つまでしか存在できません。
         *
         * 締め切られていない場合、参加者は誰でも締め切ることができます(ただし、締め切るには GraphQL の Mutation から実行する必要があります)。すでに締め切られている場合は、再開させることはできません。
         */
        closeStatus: {
            readonly type: "atomic"; /** 点呼開始時に流す SE。 */
            readonly mode: "replace";
            readonly value: z.ZodOptional<z.ZodObject<{
                closedBy: z.ZodString;
                /**
                 * ユーザーが明示的に点呼を終了させたときは `Closed`。
                 *
                 * 現時点では `Closed` のみに対応していますが、将来、他の点呼が開始されたため自動終了したときの値として `Replaced` が追加される可能性があります。
                 */
                reason: z.ZodLiteral<"Closed">;
            }, "strip", z.ZodTypeAny, {
                closedBy: string;
                reason: "Closed";
            }, {
                closedBy: string;
                reason: "Closed";
            }>>;
        };
        /**
         * 各ユーザーの点呼の状況です。keyはParticipantのIDです。
         *
         * 原則として、`Spectator` もしくは存在しない Participant を追加すること、値を削除すること、すでに締め切られている場合に値を追加および変更することはできません。
         *
         * この Record に存在しない `Player` や `Master` も点呼に参加できます。
         */
        participants: import("../../../generator").RecordValueTemplate<{
            readonly type: "object";
            readonly $v: 1;
            readonly $r: 1;
            readonly value: {
                answeredAt: {
                    readonly type: "atomic"; /** 点呼開始時に流す SE。 */
                    readonly mode: "replace";
                    readonly value: z.ZodOptional<z.ZodNumber>;
                };
            };
        }>;
        /** 点呼開始時に流す SE。 */
        soundEffect: {
            readonly type: "atomic"; /** 点呼開始時に流す SE。 */
            readonly mode: "replace";
            readonly value: z.ZodOptional<z.ZodObject<{
                file: z.ZodObject<{
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
                }>;
                volume: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                volume: number;
                file: {
                    path: string;
                    $v: 1;
                    $r: 1;
                    sourceType: "Default" | "Uploader" | "FirebaseStorage";
                };
            }, {
                volume: number;
                file: {
                    path: string;
                    $v: 1;
                    $r: 1;
                    sourceType: "Default" | "Uploader" | "FirebaseStorage";
                };
            }>>;
        };
    };
};
//# sourceMappingURL=types.d.ts.map