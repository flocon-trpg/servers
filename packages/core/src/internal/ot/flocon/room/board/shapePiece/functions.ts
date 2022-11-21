import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../../generator';
import { isIdRecord } from '../../../../record';
import * as RecordOperation from '../../../../recordOperation';
import { RequestedBy, canChangeOwnerParticipantId } from '../../../../requestedBy';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { ServerTransform } from '../../../../util/type';
import * as Piece from '../../../piece/functions';
import * as Shape from '../../../shape/functions';
import { template } from './types';

// 現時点では、Webサーバー側ではshapeを最大でも1個までしかセットしていないため、1～9の9個のkeyだけ許可している。
const validateShapeKey = (key: string) => {
    const regex = /^[1-9]$/;
    return regex.test(key);
};

export const toClientState = (source: State<typeof template>): State<typeof template> => {
    return source;
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

        if (
            canChangeOwnerParticipantId({
                requestedBy,
                currentOwnerParticipant: stateAfterServerOperation,
            })
        ) {
            twoWayOperation.ownerParticipantId = ReplaceOperation.serverTransform({
                first: serverOperation?.ownerParticipantId,
                second: clientOperation.ownerParticipantId,
                prevState: stateBeforeServerOperation.ownerParticipantId,
            });
        }

        twoWayOperation.isPrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isPrivate,
            second: clientOperation.isPrivate,
            prevState: stateBeforeServerOperation.isPrivate,
        });

        const shapes = RecordOperation.serverTransform({
            first: serverOperation?.shapes,
            second: clientOperation.shapes,
            stateBeforeFirst: stateBeforeServerOperation.shapes ?? {},
            stateAfterFirst: stateAfterServerOperation.shapes ?? {},
            innerTransform: ({ prevState, nextState, first, second }) =>
                Shape.serverTransform({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: nextState,
                    serverOperation: first,
                    clientOperation: second,
                }),
            toServerState: state => state,
            cancellationPolicy: {
                // shapeが大量に作られるのを防ぐための保険的対策を行っている
                cancelCreate: ({ key }) => !validateShapeKey(key),
            },
        });
        if (shapes.isError) {
            return shapes;
        }
        twoWayOperation.shapes = shapes.value;

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok(twoWayOperation);
    };
