import { z } from 'zod';
import { maybe } from '../../../maybe';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../generator/types';

export const templateValue = {
    h: createReplaceValueTemplate(z.number()),
    isPositionLocked: createReplaceValueTemplate(z.boolean()),

    /**
     * @description To 3rd-party developers: Please always set undefined to this if it is CharacterPiece or PortraitPiece.
     */
    memo: createTextValueTemplate(true),

    /**
     * @description To 3rd-party developers: Please always set undefined to this if it is CharacterPiece or PortraitPiece.
     */
    name: createTextValueTemplate(true),

    /**
     * @description To 3rd-party developers: Please always set undefined to this because it is not implemented yet in the official web-server.
     */
    opacity: createReplaceValueTemplate(maybe(z.number())),

    w: createReplaceValueTemplate(z.number()),
    x: createReplaceValueTemplate(z.number()),
    y: createReplaceValueTemplate(z.number()),
};

export const template = createObjectValueTemplate(templateValue, undefined, undefined);
