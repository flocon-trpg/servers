import { indexObjectTemplateValue } from '../../../array';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../generator/types';
import { cardImageValue } from '../../cardImage/types';

const templateValue = {
    ...indexObjectTemplateValue,

    /** カードの表面。画像のセットを後回しにしてサーバーに一時的に保存できるようにするため、optional にしています。 */
    face: createReplaceValueTemplate(cardImageValue.optional()),

    /** カードの裏面。画像のセットを後回しにしてサーバーに一時的に保存できるようにするため、optional にしています。 */
    back: createReplaceValueTemplate(cardImageValue.optional()),

    /** カードの表面の名前。セットは任意です。 */
    name: createTextValueTemplate(true),

    /** カードの表面の説明文。セットは任意です。 */
    description: createTextValueTemplate(true),
};

export const template = createObjectValueTemplate(templateValue, 1, 1);
