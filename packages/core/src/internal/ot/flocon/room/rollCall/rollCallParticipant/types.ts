import { z } from 'zod';
import { createObjectValueTemplate, createReplaceValueTemplate } from '@/ot/generator';

export const template = createObjectValueTemplate(
    {
        /** 点呼に返事したかどうか。`number` の場合は返事をしたことを表し、値は返事した日時となります。 `undefined` の場合は返事をしていないことを表します。`number` から `undefined` に戻すことで返事を撤回することもできます。また、`number` から `number` に変更することで、返事をした時間を更新することもできます。 */
        answeredAt: createReplaceValueTemplate(z.number().optional()),
    },
    1,
    1
);
