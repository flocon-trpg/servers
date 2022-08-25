import { maybe } from '../../../maybe';
import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../generator';
import * as Card from './card/types';

export const FilePath = 'FilePath';

// 将来、カスタム画像以外(例: 白背景、Floconに付属させたフリー画像など)にも対応できるように、unionに移行可能な形で定義している。

const templateValue = {
    /** カードのデフォルトの裏面。*/
    back: createReplaceValueTemplate(maybe(Card.back)),

    cards: createRecordValueTemplate(Card.template),

    name: createTextValueTemplate(true),

    description: createTextValueTemplate(true),
};

export const template = createObjectValueTemplate(templateValue, 1, 1);
