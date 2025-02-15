import { recordToArray } from '@flocon-trpg/utils';
import { State } from '../../../generator/types';
import * as Card from '../board/deckPiece/card/types';
import * as Room from '../types';
import * as Stats from './types';

export const create = (
    source: Omit<State<typeof Room.template>, 'stats'>,
): State<typeof Stats.template> => {
    let boards: State<typeof Stats.template>['boards'] | undefined = undefined;
    for (const board of recordToArray(source.boards ?? {})) {
        const cards: Record<string, State<typeof Card.statTemplate>> = {};
        for (const { value: deckPiece } of recordToArray(board.value.deckPieces ?? {})) {
            for (const card of recordToArray(deckPiece.cards ?? {})) {
                cards[card.key] = {
                    $v: 1,
                    $r: 1,
                    face: card.value.face,
                    isRevealed: card.value.isRevealed,
                    groupId: card.value.groupId,
                    name: card.value.name,
                    description: card.value.description,
                };
            }
        }
        if (boards == null) {
            boards = {};
        }
        boards[board.key] = { $v: 1, $r: 1, cards };
    }
    return { $v: 1, $r: 1, boards };
};
