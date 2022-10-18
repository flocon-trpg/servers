import * as t from 'io-ts';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../../generator';
import { filePathValue } from '../../filePath/types';

export const template = createObjectValueTemplate(
    {
        isPaused: createReplaceValueTemplate(t.boolean),
        files: createReplaceValueTemplate(t.array(filePathValue)),
        volume: createReplaceValueTemplate(t.number),
    },
    1,
    1
);
