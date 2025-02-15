import { z } from 'zod';
import { indexObjectTemplateValue } from '../../../../../array';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../../../generator/types';
import { cardImageValue } from '../../../../cardImage/types';

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
     */
    // 当初は boolean ではなく `face` と `back` と `backButRevealed` という 3 つの状態を持たせて、`face` と `backButRevealed` のときは誰が表向きにしたかどうかの情報を持たせるようにすることも考えた。この 3 状態の方法だと不正検知がしやすいというメリットがある。だが、`revealedTo` による一部ユーザーに対する公開に関しては同様の不正検知機能は持っていない（ログを使わずに単純なやり方で持たせる方法も思いつかない）ため、片方だけに不正検知機能を持たせるのではなく両方ともログ等の別の方法を用いて不正検知を行うことにした。
    isRevealed: createReplaceValueTemplate(z.boolean()),
};

export const templateValue = {
    ...statTemplateValue,
    ...indexObjectTemplateValue,
};

export const statTemplate = createObjectValueTemplate(statTemplateValue, 1, 1);
export const template = createObjectValueTemplate(templateValue, 1, 1);
