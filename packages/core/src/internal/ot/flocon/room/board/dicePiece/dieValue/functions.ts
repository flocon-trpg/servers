import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../../../generator/types';
import { isIdRecord } from '../../../../../record';
import * as ReplaceOperation from '../../../../../util/replaceOperation';
import { ServerTransform } from '../../../../../util/type';
import { template } from './types';

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
        isAuthorized: boolean,
    ): ServerTransform<
        State<typeof template>,
        TwoWayOperation<typeof template>,
        UpOperation<typeof template>
    > =>
    ({ stateBeforeServerOperation, clientOperation, serverOperation }) => {
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
            prevState: stateBeforeServerOperation.dieType,
        });
        twoWayOperation.isValuePrivate = ReplaceOperation.serverTransform({
            first: serverOperation?.isValuePrivate ?? undefined,
            second: clientOperation.isValuePrivate ?? undefined,
            prevState: stateBeforeServerOperation.isValuePrivate,
        });
        // !isAuthorized の場合は最初の方ですべて弾いているため、isValuePrivateのチェックをする必要はない。
        twoWayOperation.value = ReplaceOperation.serverTransform({
            first: serverOperation?.value ?? undefined,
            second: clientOperation.value ?? undefined,
            prevState: stateBeforeServerOperation.value,
        });

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok({ ...twoWayOperation });
    };
