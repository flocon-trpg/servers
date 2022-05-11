import * as t from 'io-ts';
import { filePathValue } from '../../filePath/types';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../../generator';

export const template = createObjectValueTemplate(
    {
        isPaused: createReplaceValueTemplate(t.boolean),
        files: createReplaceValueTemplate(t.array(filePathValue)),
        volume: createReplaceValueTemplate(t.number),
    },
    1,
    1
);
