import * as t from 'io-ts';
import { maybe } from '../../../maybe';
import {
    createObjectValueTemplate,
    createReplaceValueTemplate,
    createTextValueTemplate,
} from '../../generator';

export const templateValue = {
    h: createReplaceValueTemplate(t.number),
    isPositionLocked: createReplaceValueTemplate(t.boolean),

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
    opacity: createReplaceValueTemplate(maybe(t.number)),

    w: createReplaceValueTemplate(t.number),
    x: createReplaceValueTemplate(t.number),
    y: createReplaceValueTemplate(t.number),
};

export const template = createObjectValueTemplate(templateValue, undefined, undefined);
