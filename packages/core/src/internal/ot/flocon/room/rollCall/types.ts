import { z } from 'zod';
import * as RollCallParticipant from './rollCallParticipant/types';
import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
} from '@/ot/generator';

// # 点呼機能と投票機能(未実装)の違いに関する考察
//
// 点呼機能は投票機能(複数の選択肢があってそこから選ぶ機能)も兼ねようと考えたが、次の点が異なるため、もし投票機能を実装する場合は分けたほうがいいと結論付けた。
// - 投票機能は、何らかのアクションの許可と関連付ける可能性がある。例えば、GMを変更する、デッキの内容を変更していいか確認をとるなど。対して点呼はそのような機能は必要なさそう。
// - 投票機能は、締め切られるまで他の人がどちらに投票したかわからないようにすると理想的(必須ではない)。対して点呼はそのような必要がない。
// - 点呼は全員が返事するかどうかが最も大事。投票はその限りではなく、もし多数決であれば無投票があっても問題ない。
// - 投票は複数が同時進行しても構わないが、点呼は基本的に1つまで。

const closeReason = z.object({
    closedBy: z.string(),

    /**
     * ユーザーが明示的に点呼を終了させたときは `Closed`。
     *
     * 現時点では `Closed` のみに対応していますが、将来、他の点呼が開始されたため自動終了したときの値として `Replaced` が追加される可能性があります。
     */
    reason: z.literal('Closed'),
});

/** 点呼の状況。 */
export const template = createObjectValueTemplate(
    {
        createdAt: createReplaceValueTemplate(z.number()),

        // Participant ID
        createdBy: createReplaceValueTemplate(z.string()),

        /**
         * 締め切られたかどうか。nullish ならば締め切られていないことを表します。原則として、締め切られていない点呼は、最大で1つまでしか存在できません。
         *
         * 締め切られていない場合、参加者は誰でも締め切ることができます(ただし、締め切るには GraphQL の Mutation から実行する必要があります)。すでに締め切られている場合は、再開させることはできません。
         */
        closeStatus: createReplaceValueTemplate(closeReason.optional()),

        /**
         * 各ユーザーの点呼の状況です。keyはParticipantのIDです。
         *
         * 原則として、`Spectator` もしくは存在しない Participant を追加すること、値を削除すること、すでに締め切られている場合に値を追加および変更することはできません。
         *
         * この Record に存在しない `Player` や `Master` も点呼に参加できます。
         */
        participants: createRecordValueTemplate(RollCallParticipant.template),
    },
    1,
    1
);
