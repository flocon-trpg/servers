import { z } from 'zod';
import { indexObjectTemplateValue } from '../../../../../array';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../../../generator/types';
import { client } from '../../../../../requestedBy';
import { cardImageValue } from '../../../../cardImage/types';

export const face = 'face';
export const back = 'back';
// ユーザーが sortKey を変更、つまりカードを移動したときに、他のユーザーと競合したり autoOptimizeSortKey が実行されることによって想定と異なる位置にカードが移動することがある。そのため、backButRevealedOnce が定義されていないと想定外の位置に移動していないかどうかをチェックできない。一回も表面になったことのないカードの場合はもし想定外の位置に移動しても問題ないためチェックする必要がない(faceとbackButRevealedOnceのカードをチェックするだけでよい)。
/**
 * いったん表向きになったものの、その後裏面になった状態。この状態の場合は、表面は誰でも見ることができます。
 *
 * シャッフル等によりカードの key が変更された場合は `back` になり、表面も再び非公開に戻ります。
 */
export const backButRevealedOnce = 'backButRevealedOnce';
export const revealedAtCreate = 'revealedAtCreate';

// 最初に公開されたユーザーを表す。2回目以降に公開したユーザーは記録されない。
const revealedBy = z.union([
    z.object({ type: z.literal(client), userUid: z.string() }),
    z.object({ type: z.literal(revealedAtCreate) }),
]);

export const revealStatus = z.union([
    z.object({ type: z.literal(face), revealedBy }),
    z.object({ type: z.literal(back) }),
    z.object({ type: z.literal(backButRevealedOnce), revealedBy }),
]);

export const areRevealedByEqual = (
    x: z.TypeOf<typeof revealedBy>,
    y: z.TypeOf<typeof revealedBy>,
): boolean => {
    if (x.type !== y.type) {
        return false;
    }
    if (x.type === client) {
        if (y.type !== client) {
            return false;
        }
        return x.userUid === y.userUid;
    }
    return true;
};

export const statTemplateValue = {
    /**
     * カードの表面。
     *
     * サーバー側では原則として常に nullish 以外の値となります。
     *
     * クライアント側では、裏向きなどの理由で表面が何かわからないときに nullish となり、表面にアクセスできないことを表します。
     */
    face: createReplaceValueTemplate(cardImageValue.optional()),

    /** カードが属するグループです。これを利用することで、同じグループとみなされるカードのみを抽出したり、意図せず異なる種類のカードが混ざらないようにすることができます(抽出機能や混ざらないようにする機能の実装の有無および内容はクライアントに任せています)。nullish の場合はどのグループにも属さないカードとみなされます。後から groupId を変更することは可能としています。 */
    groupId: createReplaceValueTemplate(z.string().optional()),

    /** カードの表面の名前。セットは任意です。 */
    name: createTextValueTemplate(true),

    /** カードの表面の説明文。セットは任意です。 */
    description: createTextValueTemplate(true),

    /**
     * 表向きになっているかどうかを表します。表向きの場合は全員に公開されます。
     *
     * `face` の場合は、表向きになっていることを表します。`back` の場合は、裏向きでありなおかつ1回も表向きになっていないことを表します。`backButRevealedOnce` の場合は、現在は裏向きですが表向きになったことがあることを表します。`backButRevealedOnce` のカードは、シャッフルなどによって `back` に変わります。`back` のとき、クライアントには face の値を nullish にして渡されます(ただし `revealTo` で指定されたユーザーは nullish になりません)。
     */
    revealStatus: createReplaceValueTemplate(revealStatus),
};

export const templateValue = {
    ...statTemplateValue,
    ...indexObjectTemplateValue,
};

export const statTemplate = createObjectValueTemplate(statTemplateValue, 1, 1);
export const template = createObjectValueTemplate(templateValue, 1, 1);
