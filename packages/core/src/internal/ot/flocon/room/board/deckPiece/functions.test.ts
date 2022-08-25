import { serverTransform } from './functions';
import { template } from './types';
import { template as pieceTemplate } from '@/ot/flocon/piece/types';
import { State } from '@/ot/generator';
import { admin } from '@/ot/requestedBy';

type DeckPieceState = State<typeof template>;

const pieceState: State<typeof pieceTemplate> = {
    $v: undefined,
    $r: undefined,
    x: 10,
    y: 20,
    w: 30,
    h: 40,
    cellX: 1,
    cellY: 2,
    cellW: 3,
    cellH: 4,
    isCellMode: false,
    isPositionLocked: false,
    memo: undefined,
    name: undefined,
    opacity: undefined,
};

describe('serverTransform', () => {
    it('', () => {
        const state: DeckPieceState = {
            ...pieceState,
            $v: 1,
            $r: 1,
            revealedTo: [],
            cards: {},
        };
        aaaa;
        const actual = serverTransform({ type: admin })({
            stateBeforeServerOperation: state,
            stateAfterServerOperation: state,
            serverOperation: undefined,
            clientOperation: { $v: 1, $r: 1 },
        });
    });
});
