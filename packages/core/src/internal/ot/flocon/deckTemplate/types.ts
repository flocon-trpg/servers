import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../generator/types';
import { cardImageValue } from '../cardImage/types';
import * as Card from './card/types';

export const FilePath = 'FilePath';

const templateValue = {
    cards: createRecordValueTemplate(Card.template),

    name: createTextValueTemplate(true),

    description: createTextValueTemplate(true),

    // 仕様の上ではいちおうカードごとに異なる裏面画像を設定できるが、需要がなく直観的でもなさそうなので、テンプレート1つにつき1つの裏面画像しか設定できないようにした。ユーザーは裏面画像の設定を後回しにしたり裏面画像はデッキ作成ごとに異なる画像を設定したいケースもあるため optional としている。
    back: createReplaceValueTemplate(cardImageValue.optional()),
};

export const template = createObjectValueTemplate(templateValue, 1, 1);
