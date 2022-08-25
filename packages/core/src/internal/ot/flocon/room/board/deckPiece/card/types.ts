import * as t from 'io-ts';
import { maybe } from '@/maybe';
import { back as backTemplate, face as faceTemplate } from '@/ot/flocon/deckTemplate/card/types';
import { createObjectValueTemplate, createReplaceValueTemplate } from '@/ot/generator';

export const face = 'face';
export const back = 'back';
export const backButRevealedOnce = 'backButRevealedOnce';
const revealStatus = t.union([t.literal(face), t.literal(back), t.literal(backButRevealedOnce)]);

export const templateValue = {
    /**
     * カードの表面。
     *
     * サーバー側では原則として常に nullish 以外の値となります。
     *
     * クライアント側では、裏向きなどの理由で表面が何かわからないときに nullish となり、表面にアクセスできないことを表します。
     */
    face: createReplaceValueTemplate(maybe(faceTemplate)),

    /** カードの裏面。undefined の場合は、DeckTemplate.back が使われます。 */
    back: createReplaceValueTemplate(maybe(backTemplate)),

    /**
     * 表向きになっているかどうかを表します。表向きの場合は全員に公開されます。
     *
     * `face` の場合は、表向きになっていることを表します。`back` の場合は、裏向きでありなおかつ1回も表向きになっていないことを表します。`backButRevealedOnce` の場合は、現在は裏向きですが表向きになったことがあることを表します。`backButRevealedOnce` のカードは、シャッフルなどによって `back` に変わります。`back` のとき、クライアントには face の値を nullish にして渡されます(ただし `revealTo` で指定されたユーザーは nullish になりません)。
     */
    revealStatus: createReplaceValueTemplate(revealStatus),

    /**
     * カードをソートする際に用いられるキーの1つ。数値が低いほど山札の上にあることを表します。
     *
     * 0 以上の整数を用いてください。0 以上の整数以外も現時点ではサポートされていますが、将来利用不可能になる可能性があります。
     *
     * まず `sortKey` でソートして、`sortKey` が等しいカード同士は `subSortKey` でソートします。`sortKey` はクライアント側で自由に変更できますが、`subSortKey` はクライアント側では変更できません。`subSortKey` は、万が一 `sortKey` が衝突した時でも確実に全ての環境で等しくソートできるようにするために存在する値です。
     */
    sortKey: createReplaceValueTemplate(t.number),

    /**
     * カードをソートする際に用いられるキーの1つ。ソートして最初に来る値ほど山札の上にあることを表します。
     *
     * Please see also `sortKey`.
     */
    subSortKey: createReplaceValueTemplate(t.string),
};

export const template = createObjectValueTemplate(templateValue, 1, 1);
