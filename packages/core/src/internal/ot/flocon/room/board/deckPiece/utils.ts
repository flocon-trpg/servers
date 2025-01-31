import { recordForEach } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { shuffle as shuffleArray } from 'es-toolkit';
import { produce } from 'immer';
import { $index, arrayToIndexObjects, indexObjectsToArray } from '../../../../array';
import { State as S } from '../../../../generator/types';
import { template as boardTemplate } from '../types';

type BoardState = S<typeof boardTemplate>;
type IndexObject = { [$index]: number };

const shuffleDeckCore = <T extends IndexObject>(
    state: Record<string, T | undefined>,
): Result<Record<string, T | undefined>> => {
    const sourceArray = indexObjectsToArray(state);
    if (sourceArray.isError) {
        return sourceArray;
    }
    const shuffledArray = shuffleArray(sourceArray.value);
    return Result.ok(arrayToIndexObjects(shuffledArray));
};

/** 山札をシャッフルします。lodash.shuffle を使ってシャッフルされます。 */
export const shuffleDeck = ({
    state,
    deckPieceId,
    mode,
}: {
    state: BoardState;
    deckPieceId: string;
    mode: 'server' | 'client';
}): Result<BoardState> => {
    const result = produce(state as BoardState | string, state => {
        // draft以外を返すのは問題ないが、draftを変更してからdraft以外を返してはならないことに注意。
        // https://immerjs.github.io/immer/return

        if (typeof state === 'string') {
            throw new Error('This should not happen');
        }
        const deckPiece = state.deckPieces?.[deckPieceId];
        if (deckPiece?.cards == null) {
            return;
        }
        const shuffled = shuffleDeckCore(deckPiece.cards);
        if (shuffled.isError) {
            return shuffled.error;
        }
        deckPiece.cards = shuffled.value;
        if (mode === 'server') {
            recordForEach(deckPiece.cards, card => {
                card.revealStatus = { type: 'back' };
            });
        }
        return;
    });
    if (typeof result === 'string') {
        return Result.error(result);
    }
    return Result.ok(result);
};
