import * as ReplaceOperation from '../../../../../util/replaceOperation';
import { ServerTransform } from '../../../../../util/type';
import { isIdRecord } from '../../../../../util/record';
import { Result } from '@kizahasi/result';
import { template } from './types';
import { State, UpOperation, TwoWayOperation } from '../../../../../generator';

export const toClientState =
    (isAuthorized: boolean) =>
    (source: State<typeof template>): State<typeof template> => {
        return {
            ...source,
            value: source.isValuePrivate && !isAuthorized ? undefined : source.value,
        };
    };

export const serverTransform =
    (
        isAuthorized: boolean
    ): ServerTransform<
        State<typeof template>,
        TwoWayOperation<typeof template>,
        UpOperation<typeof template>
    > =>
    ({ prevState, clientOperation, serverOperation }) => {
        if (!isAuthorized) {
            // 自分以外はどのプロパティも編集できない。
            return Result.ok(undefined);
        }

        const twoWayOperation: TwoWayOperation<typeof template> = {
            $v: 1,
            $r: 1,
        };

        twoWayOperation.dieType = ReplaceOperation.serverTransform({
            first: serverOperation?.dieType ?? undefined,
            second: clientOperation.dieType ?? undefined,
            prevState: prevState.dieType,
        });
        twoWayOperation.isValuePrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isValuePrivate ?? undefined,
            second: clientOperation.isValuePrivate ?? undefined,
            prevState: prevState.isValuePrivate,
        });
        // !isAuthorized の場合は最初の方ですべて弾いているため、isValuePrivateのチェックをする必要はない。
        twoWayOperation.value = ReplaceOperation.serverTransform({
            first: serverOperation?.value ?? undefined,
            second: clientOperation.value ?? undefined,
            prevState: prevState.value,
        });

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok({ ...twoWayOperation });
    };
