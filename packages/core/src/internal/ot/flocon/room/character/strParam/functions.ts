import * as NullableTextOperation from '../../../../util/nullableTextOperation';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { ServerTransform } from '../../../../util/type';
import { isIdRecord } from '../../../../util/record';
import { Result } from '@kizahasi/result';
import { template } from './types';
import { State, TwoWayOperation, UpOperation } from '../../../../generator';

export const toClientState =
    (isAuthorized: boolean) =>
    (source: State<typeof template>): State<typeof template> => {
        return {
            ...source,
            value: source.isValuePrivate && !isAuthorized ? '' : source.value,
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
            twoWayOperation.isValuePrivate = ReplaceOperation.serverTransform({
                first: serverOperation?.isValuePrivate,
                second: clientOperation.isValuePrivate,
                prevState: prevState.isValuePrivate,
            });
        }
        if (isAuthorized || !currentState.isValuePrivate) {
            const transformed = NullableTextOperation.serverTransform({
                first: serverOperation?.value,
                second: clientOperation.value,
                prevState: prevState.value,
            });
            if (transformed.isError) {
                return transformed;
            }
            twoWayOperation.value = transformed.value;
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

        return Result.ok(twoWayOperation);
    };
