import * as ReplaceOperation from '../../../../util/replaceOperation';
import * as RecordOperation from '../../../../util/recordOperation';
import { ServerTransform } from '../../../../util/type';
import { isIdRecord } from '../../../../util/record';
import { Result } from '@kizahasi/result';
import * as BoardPosition from '../../../boardPosition/functions';
import {
    RequestedBy,
    anyValue,
    canChangeOwnerParticipantId,
    isOwner,
} from '../../../../util/requestedBy';
import { template } from './types';
import { State, TwoWayOperation, UpOperation } from '../../../../generator';
import * as Shape from '../../../shape/functions';

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
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const isAuthorized = isOwner({
            requestedBy,
            ownerParticipantId: currentState.ownerParticipantId ?? anyValue,
        });
        if (!isAuthorized) {
            // 自分以外はどのプロパティも編集できない。
            return Result.ok(undefined);
        }

        const piece = BoardPosition.serverTransform({
            prevState: { ...prevState, $v: undefined, $r: undefined },
            currentState: { ...currentState, $v: undefined, $r: undefined },
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
                currentOwnerParticipant: currentState,
            })
        ) {
            twoWayOperation.ownerParticipantId = ReplaceOperation.serverTransform({
                first: serverOperation?.ownerParticipantId,
                second: clientOperation.ownerParticipantId,
                prevState: prevState.ownerParticipantId,
            });
        }

        twoWayOperation.isPrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isPrivate,
            second: clientOperation.isPrivate,
            prevState: prevState.isPrivate,
        });

        const shapes = RecordOperation.serverTransform({
            first: serverOperation?.shapes,
            second: clientOperation.shapes,
            prevState: prevState.shapes,
            nextState: currentState.shapes,
            innerTransform: ({ prevState, nextState, first, second }) =>
                Shape.serverTransform({
                    prevState,
                    currentState: nextState,
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
