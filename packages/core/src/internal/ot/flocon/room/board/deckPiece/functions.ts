import { chooseRecord } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../../generator';
import * as NullableTextOperation from '../../../../nullableTextOperation';
import { isIdRecord } from '../../../../record';
import * as RecordOperation from '../../../../recordOperation';
import { RequestedBy, admin } from '../../../../requestedBy';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { ServerTransform } from '../../../../util/type';
import * as Piece from '../../../piece/functions';
import * as Card from './card/functions';
import { template } from './types';
import { autoOptimizeSortKey } from './utils';
import { simpleId } from '@/simpleId';

export const toClientState =
    (requestedBy: RequestedBy) =>
    (source: State<typeof template>): State<typeof template> => {
        return {
            ...source,
            cards:
                source.cards == null
                    ? undefined
                    : chooseRecord(source.cards, state =>
                          Card.toClientState(requestedBy, source)(state)
                      ),
        };
    };

export const serverTransform =
    (
        requestedBy: RequestedBy
    ): ServerTransform<
        State<typeof template>,
        TwoWayOperation<typeof template>,
        UpOperation<typeof template>
    > =>
    ({
        stateBeforeServerOperation,
        stateAfterServerOperation,
        clientOperation,
        serverOperation,
    }) => {
        const isAdmin = requestedBy.type === admin;

        const piece = Piece.serverTransform({
            stateBeforeServerOperation: {
                ...stateBeforeServerOperation,
                $v: undefined,
                $r: undefined,
            },
            stateAfterServerOperation: {
                ...stateAfterServerOperation,
                $v: undefined,
                $r: undefined,
            },
            clientOperation: { ...clientOperation, $v: undefined, $r: undefined },
            serverOperation: { ...serverOperation, $v: undefined, $r: undefined },
        });
        if (piece.isError) {
            return piece;
        }

        const twoWayOperation: TwoWayOperation<typeof template> = {
            $v: 1,
            $r: 1,
            ...piece.value,
        };

        const cards = RecordOperation.serverTransform({
            first: serverOperation?.cards,
            second: clientOperation.cards,
            stateBeforeFirst: stateBeforeServerOperation.cards ?? {},
            stateAfterFirst: stateAfterServerOperation.cards ?? {},
            toServerState: state => {
                return { ...state, subSortKey: simpleId() };
            },
            innerTransform: params =>
                Card.serverTransform(requestedBy)({
                    stateBeforeServerOperation: params.prevState,
                    stateAfterServerOperation: params.nextState,
                    serverOperation: params.first,
                    clientOperation: params.second,
                }),
            cancellationPolicy: {},
            validation: {
                recordName: 'cards',
                maxRecordLength: 1000,
            },
        });
        if (cards.isError) {
            return cards;
        }
        // 意図的に他と近い sortKey を指定する攻撃(例: 3枚のカードがあってそれらの sortKey が [1000, 2000, 3000] の状態で 3000 のカードを1つ前に移動するとき、[1000, 1500, 2000] などとするのではなく [1000, 1001, 3000] などのようにする行為)への対策を、autoOptimizeSortKey によって行っている。そのような攻撃があった場合は、すべての sortKey を見直して、適切な間隔で割り当てなおす。
        // 割り当てが行われた際は、他の sortKey も変更される可能性がある。そのため、他のユーザーがほぼ同じタイミングでカードを移動したときに予期しない位置に来る可能性がある。ただし、多くの sortKey を単純に変更することでも同様の現象を起こせるため、現時点ではこれ以上の対策は意味がない。
        twoWayOperation.cards = autoOptimizeSortKey(stateBeforeServerOperation, cards.value);

        if (isAdmin) {
            twoWayOperation.revealedTo = ReplaceOperation.serverTransform({
                first: serverOperation?.revealedTo,
                second: clientOperation.revealedTo,
                prevState: stateBeforeServerOperation.revealedTo,
            });
        }

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
