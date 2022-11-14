import { recordToArray } from '@flocon-trpg/utils';
import produce from 'immer';
import shuffleArray from 'lodash.shuffle';
import { template as boardTemplate } from '../types';
import { template } from './types';
import { State as S, TwoWayOperation as T, apply, diff, toUpOperation } from '@/ot/generator';
import { simpleId } from '@/simpleId';

type BoardState = S<typeof boardTemplate>;
type DeckPieceState = S<typeof template>;
type DeckPieceTwoWayOperation = T<typeof template>;
type CardsState = NonNullable<DeckPieceState['cards']>;

const compareStringGlobal = (x: string, y: string) => {
    /*
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare によると、

    In implementations that support the Intl.Collator API, these parameters correspond exactly to the Intl.Collator() constructor's parameters. Implementations without Intl.Collator support are asked to ignore both parameters, making the comparison result returned entirely implementation-dependent — it's only required to be consistent.

    とあるので、第2引数を指定して implementation-independent になるようにしている。ただし、このページの Browser compatibility によると一部のブラウザは第2引数以降をサポートしていないため、これらのブラウザでは他の一般的なブラウザと異なる挙動となる可能性がある。
    */
    return x.localeCompare(y, 'en');
};

/** 山札を、順序を保った状態で配列に変換します。最初の要素が山札の一番上、その次の要素が山札の上から二番目…といった順になります。 */
export const cardRecordToArray = (cards: CardsState) => {
    const cardsArray = recordToArray(cards);
    return cardsArray.sort(({ value: x }, { value: y }) => {
        const firstCompare = x.sortKey - y.sortKey;
        if (firstCompare !== 0) {
            return firstCompare;
        }
        return compareStringGlobal(x.subSortKey, y.subSortKey);
    });
};

// Number.MAX_SAFE_INTEGER は 9,007,199,254,740,991 なので、9,007,199,254 枚までのカードに対応できる
const createSortKeyFromIndex = (index: number): number => index * 1_000_000;

const optimizeSortKey = (cards: CardsState) => {
    return produce(cards, draft => {
        cardRecordToArray(cards).forEach(({ key }, i) => {
            const draftValue = draft[key];
            if (draftValue == null) {
                throw new Error('This should not happen');
            }
            draftValue.sortKey = createSortKeyFromIndex(i);
        });
    });
};

const shouldOptimizeSortKey = (cards: CardsState): boolean => {
    let prevSortKey: number | null = null;
    for (const { value } of cardRecordToArray(cards)) {
        if (prevSortKey == null) {
            prevSortKey = value.sortKey;
            continue;
        }
        // 現在はとりあえず差が2以内のときのみにtrueを返すようにしているが、10という値は暫定的な数であり、これが妥当かどうかの検証は現時点では不十分。
        if (value.sortKey - prevSortKey <= 2) {
            return true;
        }
        prevSortKey = value.sortKey;
    }
    return false;
};

/** `Cards` の `sortKey` を自動的に調整します。
 *
 * serverTransform で用いられることを想定しているため、TwoWayOperation を受け取って TwoWayOperation を返す関数となっています。
 */
export const autoOptimizeSortKey = (
    prevState: DeckPieceState,
    unoptimizedOperation: DeckPieceTwoWayOperation['cards']
): DeckPieceTwoWayOperation['cards'] => {
    const unoptimizedNextState = apply(template)({
        state: prevState,
        operation: toUpOperation(template)({ $v: 1, $r: 1, cards: unoptimizedOperation }),
    });
    if (unoptimizedNextState.isError) {
        throw new Error('Could not apply operation.');
    }
    if (unoptimizedNextState.value.cards == null) {
        return unoptimizedOperation;
    }
    const nextStateCards = unoptimizedNextState.value.cards;
    if (!shouldOptimizeSortKey(nextStateCards)) {
        return unoptimizedOperation;
    }
    const optimizedNextState = produce(unoptimizedNextState.value, draft => {
        draft.cards = optimizeSortKey(nextStateCards);
    });
    const diffResult = diff(template)({ prevState, nextState: optimizedNextState });
    return diffResult?.cards;
};

const shuffleDeckCore = (state: CardsState): CardsState => {
    const result: CardsState = {};
    shuffleArray(recordToArray(state).map(({ value }) => value)).forEach((card, i) => {
        result[simpleId()] = {
            ...card,
            sortKey: createSortKeyFromIndex(i),
            subSortKey: simpleId(),
        };
    });
    return result;
};

/** 山札をシャッフルします。lodash.shuffle を使ってシャッフルされます。 */
export const shuffleDeck = ({
    state,
    deckPieceId,
}: {
    state: BoardState;
    deckPieceId: string;
}): BoardState => {
    return produce(state, state => {
        const deckPiece = state.deckPieces?.[deckPieceId];
        if (deckPiece?.cards == null) {
            return;
        }
        deckPiece.cards = shuffleDeckCore(deckPiece.cards);
    });
};
