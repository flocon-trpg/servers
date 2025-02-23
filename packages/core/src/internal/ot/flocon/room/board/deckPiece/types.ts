import { z } from 'zod';
import {
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
} from '../../../../generator/types';
import * as Piece from '../../../piece/types';
import * as Card from './card/types';

// カードの移動の際に一意に定まらないため、山札における共通の裏面を表すためのbackは実装していない。
const templateValue = {
    ...Piece.templateValue,

    /** カードの集合。operate の前後で、Record の key が等しければ同じカードです。ただし必ずしも逆は成り立ちません(例えばシャッフルされたとき。カードの位置が特定できないように、ランダムな key が再度割り当てられます)。他の DeckPiece にカードを移動することはできますが、その際は同じ key でセットする必要があります(異なる key を用いた場合、それは移動ではなく、カードの削除と追加を表します)。 */
    cards: createRecordValueTemplate(Card.template),

    /** 一部のユーザーのみが常に見られる状態の場合は、そのユーザーのIDからなる配列。手札の表現に用いられます。ただし、Card.isRevealedが`true`であるカードは、revealedToの値に関わらず全員に公開されます。 */
    revealedTo: createReplaceValueTemplate(z.array(z.string())),
};

export const template = createObjectValueTemplate(templateValue, 1, 1);
