import * as t from 'io-ts';
import { ResultModule } from '../../../Result';
import { operation } from '../util/operation';
import { isIdRecord } from '../util/record';
import * as ReplaceValueOperation from '../util/replaceOperation';
import { TransformerFactory } from '../util/transformerFactory';
import { Apply, ToClientOperationParams, } from '../util/type';

export const state = t.type({
    $version: t.literal(1),

    name: t.string,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = operation(1, {
    name: t.type({ oldValue: t.string }),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = operation(1, {
    name: t.type({ newValue: t.string }),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $version: 1;

    name?: ReplaceValueOperation.ReplaceValueTwoWayOperation<string>;
}

export const toClientState = (source: State): State => source;

export const toServerOperation = (source: TwoWayOperation): DownOperation => {
    return source;
};

export const toClientOperation = ({ diff }: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return diff;
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.name != null) {
        result.name = operation.name.newValue;
    }
    return ResultModule.ok(result);
};

export const transformerFactory: TransformerFactory<string, State, State, DownOperation, UpOperation, TwoWayOperation> = ({
    composeLoose: ({ first, second }) => {
        const valueProps: DownOperation = {
            $version: 1,
            name: ReplaceValueOperation.composeDownOperation(first.name, second.name),
        };
        return ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }

        const prevState: State = { ...nextState };
        const twoWayOperation: TwoWayOperation = { $version: 1 };

        if (downOperation.name !== undefined) {
            prevState.name = downOperation.name.oldValue;
            twoWayOperation.name = { ...downOperation.name, newValue: nextState.name };
        }

        return ResultModule.ok({ prevState, twoWayOperation });
    },
    transform: ({ prevState, clientOperation, serverOperation }) => {
        const twoWayOperation: TwoWayOperation = { $version: 1 };

        twoWayOperation.name = ReplaceValueOperation.transform({
            first: serverOperation?.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });

        if (isIdRecord(twoWayOperation)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok({ ...twoWayOperation });
    },
    diff: ({ prevState, nextState }) => {
        const resultType: TwoWayOperation = { $version: 1 };
        if (prevState.name !== nextState.name) {
            resultType.name = { oldValue: prevState.name, newValue: nextState.name };
        }
        if (isIdRecord(resultType)) {
            return undefined;
        }
        return { ...resultType };
    },
    applyBack: ({ downOperation, nextState }) => {
        const result = { ...nextState };

        if (downOperation.name !== undefined) {
            result.name = downOperation.name.oldValue;
        }

        return ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {
    }
});