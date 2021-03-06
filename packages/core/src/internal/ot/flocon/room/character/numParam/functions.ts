import { ServerTransform } from '../../../../util/type';
import * as ReplaceValueOperation from '../../../../util/replaceOperation';
import { isIdRecord } from '../../../../util/record';
import { Result } from '@kizahasi/result';
import * as NullableTextOperation from '../../../../util/nullableTextOperation';
import { State, TwoWayOperation, UpOperation } from '../../../../generator';
import { template } from './types';

export const toClientState =
    (isAuthorized: boolean, defaultValue: number | undefined) =>
    (source: State<typeof template>): State<typeof template> => {
        return {
            ...source,
            value: source.isValuePrivate && !isAuthorized ? defaultValue : source.value,
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
    ({ prevState, currentState, clientOperation, serverOperation }) => {
        const twoWayOperation: TwoWayOperation<typeof template> = { $v: 2, $r: 1 };

        if (isAuthorized) {
            twoWayOperation.isValuePrivate = ReplaceValueOperation.serverTransform({
                first: serverOperation?.isValuePrivate,
                second: clientOperation.isValuePrivate,
                prevState: prevState.isValuePrivate,
            });
        }
        if (isAuthorized || !currentState.isValuePrivate) {
            twoWayOperation.value = ReplaceValueOperation.serverTransform({
                first: serverOperation?.value,
                second: clientOperation.value,
                prevState: prevState.value,
            });
        }
        {
            const xformResult = NullableTextOperation.serverTransform({
                first: serverOperation?.overriddenParameterName,
                second: clientOperation.overriddenParameterName,
                prevState: prevState.overriddenParameterName,
            });
            if (xformResult.isError) {
                return xformResult;
            }
            twoWayOperation.overriddenParameterName = xformResult.value;
        }

        if (isIdRecord(twoWayOperation)) {
            return Result.ok(undefined);
        }

        return Result.ok({ ...twoWayOperation });
    };
