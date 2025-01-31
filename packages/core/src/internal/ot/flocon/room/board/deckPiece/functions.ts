import { chooseRecord } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import * as Array from '../../../../array';
import { State, TwoWayOperation, UpOperation } from '../../../../generator/types';
import { isIdRecord } from '../../../../record';
import { RequestedBy, admin } from '../../../../requestedBy';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { ServerTransform } from '../../../../util/type';
import * as Piece from '../../../piece/functions';
import * as Card from './card/functions';
import { template } from './types';

export const toClientState =
    (requestedBy: RequestedBy) =>
    (source: State<typeof template>): State<typeof template> => {
        return {
            ...source,
            cards:
                source.cards == null
                    ? undefined
                    : chooseRecord(source.cards, state =>
                          Card.toClientState(requestedBy, source)(state),
                      ),
        };
    };

export const serverTransform =
    (
        requestedBy: RequestedBy,
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

        const cards = Array.serverTransform({
            first: serverOperation?.cards,
            second: clientOperation.cards,
            stateBeforeFirst: stateBeforeServerOperation.cards ?? {},
            stateAfterFirst: stateAfterServerOperation.cards ?? {},
            toServerState: state => state,
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
            mapOperation: operation => ({ ...operation, $v: 1, $r: 1 }) as const,
        });
        if (cards.isError) {
            return cards;
        }
        twoWayOperation.cards = cards.value;

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
