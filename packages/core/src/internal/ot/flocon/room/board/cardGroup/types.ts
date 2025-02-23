import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../../generator/types';
import { cardImageValue } from '../../../cardImage/types';

export const template = createObjectValueTemplate(
    {
        /** このグループに属するカードの裏面を表します。 */
        // 裏面の画像情報を保持するプロパティは、グループに定義する方法とカードごとに定義する方法の2通りが考えられるが、前者を採用した。後者の方法だと1つのデッキに異なる裏面のカードを混ぜることができるが、そのような TRPG はほぼなさそう（シャッフルするときに裏面の配置がある程度わかってしまいそうだし）。もしそのようなケースがある場合でも、カードのオブジェクトに裏面画像を上書きできるプロパティを設ければよさそう。こっそり少し異なる裏面画像を特定のカードにセットする不正も起こりうるし、オブジェクトサイズも肥大化するというデメリットもあるため、後者の方法は採用しないことにした。
        back: createReplaceValueTemplate(cardImageValue),
        name: createTextValueTemplate(false),
    },
    1,
    1,
);
