import { z } from 'zod';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../../generator/types';

export const Plain = 'Plain';
export const Markdown = 'Markdown';

/**
 * @description To 3rd-party developers: Please always set 'Plain' to this because 'Markdown' is not implemented yet in the official web-server.
 */
const textType = z.union([z.literal(Plain), z.literal(Markdown)]);

// メモのパスは、/を区切りとして例えば グループ1/グループ2/メモ であれば dir=['グループ1', 'グループ2'], name='メモ' とする。
export const template = createObjectValueTemplate(
    {
        name: createTextValueTemplate(false),
        dir: createReplaceValueTemplate(z.array(z.string())),
        text: createTextValueTemplate(false),

        /**
         * @description To 3rd-party developers: Please always set 'Plain' to this because 'Markdown' is not implemented yet in the official web-server.
         */
        textType: createReplaceValueTemplate(textType),
    },
    1,
    1,
);
