import { z } from 'zod';
import { createObjectValueTemplate, createReplaceValueTemplate } from '../../../generator';
import { filePathValue } from '../../filePath/types';

export const template = createObjectValueTemplate(
    {
        isPaused: createReplaceValueTemplate(z.boolean()),
        files: createReplaceValueTemplate(z.array(filePathValue)),
        volume: createReplaceValueTemplate(z.number()),
    },
    1,
    1
);
