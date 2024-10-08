import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../../../generator/types';
import * as NullableTextOperation from '../../../../nullableTextOperation';
import { isIdRecord } from '../../../../record';
import * as ReplaceOperation from '../../../../util/replaceOperation';
import { ServerTransform } from '../../../../util/type';
import { template } from './types';

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
        isAuthorized: boolean,
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
        const twoWayOperation: TwoWayOperation<typeof template> = { $v: 2, $r: 1 };

        if (isAuthorized) {
            twoWayOperation.isValuePrivate = ReplaceOperation.serverTransform({
                first: serverOperation?.isValuePrivate,
                second: clientOperation.isValuePrivate,
                prevState: stateBeforeServerOperation.isValuePrivate,
            });
        }
        if (isAuthorized || !stateAfterServerOperation.isValuePrivate) {
            const transformed = NullableTextOperation.serverTransform({
                first: serverOperation?.value,
                second: clientOperation.value,
                prevState: stateBeforeServerOperation.value,
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
                prevState: stateBeforeServerOperation.overriddenParameterName,
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
