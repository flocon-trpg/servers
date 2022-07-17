import * as t from 'io-ts';
import {
    createObjectValueTemplate,
    createOtValueTemplate,
    createReplaceValueTemplate,
} from '../../../generator';

export const Plain = 'Plain';
export const Markdown = 'Markdown';

/**
 * @description To 3rd-party developers: Please always set 'Plain' to this because 'Markdown' is not implemented yet in the official web-server.
 */
const textType = t.union([t.literal(Plain), t.literal(Markdown)]);

// メモのパスは、/を区切りとして例えば グループ1/グループ2/メモ であれば dir=['グループ1', 'グループ2'], name='メモ' とする。
export const template = createObjectValueTemplate(
    {
        name: createOtValueTemplate(false),
        dir: createReplaceValueTemplate(t.array(t.string)),
        text: createOtValueTemplate(false),

        /**
         * @description To 3rd-party developers: Please always set 'Plain' to this because 'Markdown' is not implemented yet in the official web-server.
         */
        textType: createReplaceValueTemplate(textType),
    },
    1,
    1
);
