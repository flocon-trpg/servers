import { z } from 'zod';
import { indexObjectTemplateValue } from '../../../../../array';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../../../generator/types';
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
const revealStatus = z.union([z.literal(face), z.literal(back), z.literal(backButRevealedOnce)]);

export const statTemplateValue = {
    /**
     * カードの表面。
     *
     * サーバー側では原則として常に nullish 以外の値となります。
     *
     * クライアント側では、裏向きなどの理由で表面が何かわからないときに nullish となり、表面にアクセスできないことを表します。
     */
    face: createReplaceValueTemplate(cardImageValue.optional()),

    /** カードの裏面。サーバー側とクライアント側で同じ値になります。 */
    /*
    この値を optional にして、なおかつ DeckPiece にデフォルトの裏面画像プロパティを用意することで、nullish のときはそのデフォルトの画像を使う方針も考えられるが採用していない。optional にする主なメリットは state のサイズを軽量化できることであり、optional にしない主なメリットは state 周りの実装が単純になることである。悩んだが、開発スピードの向上を優先して optional にする方針は採用しないことにした。
    optional にする場合は、「1つのコマに複数の異なるカードを混ぜることは一切できないようにする」作戦と、「混ぜることは一切できるようにする」作戦の2つに大別できる。前者の作戦は有力だが、山札を分割して片方だけ背景画像を変更したときに、実際には片方しか変わらないが両方とも変わると勘違いするユーザーが出るおそれがあるのと、それら2つの山札は背景画像を同じにしない限り再統合できないため少し混乱を招く可能性があるので見送った。後者の作戦は、実装が複雑になるおそれがあるため、採用しないことにした。
    */
    back: createReplaceValueTemplate(cardImageValue),

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
