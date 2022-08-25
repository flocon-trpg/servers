import * as t from 'io-ts';
import { maybe } from '../../../../maybe';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../generator';
import { filePathValue } from '../../filePath/types';

export const FilePath = 'FilePath';

// 将来、カスタム画像以外(例: Floconに付属させたフリー画像など)にも対応できるように、unionに移行可能な形で定義している。
export const face = t.type({
    type: t.literal(FilePath),
    filePath: filePathValue,
});

export const back = t.type({
    type: t.literal(FilePath),
    filePath: filePathValue,
});

const templateValue = {
    /** カードの表面の説明文。セットは任意です。 */
    description: createTextValueTemplate(true),

    /** カードの表面。画像のセットを後回しにしてサーバーに一時的に保存できるようにするため、maybeを付けています。 */
    face: createReplaceValueTemplate(maybe(face)),

    /** カードの裏面。undefined の場合は、DeckTemplate.back が使われます。 */
    back: createReplaceValueTemplate(maybe(back)),

    /** カードの表面の名前。セットは任意です。 */
    name: createTextValueTemplate(true),
};

export const template = createObjectValueTemplate(templateValue, 1, 1);
