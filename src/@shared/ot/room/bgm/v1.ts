import * as t from 'io-ts';
import { ResultModule } from '../../../Result';
import * as ReplaceValueOperation from '../util/replaceOperation';
import { filePath } from '../../filePath/v1';
import { TransformerFactory } from '../util/transformerFactory';
import { Apply, ToClientOperationParams } from '../util/type';
import { operation } from '../util/operation';
import { isIdRecord } from '../util/record';

export const state = t.type({
    $version: t.literal(1),

    files: t.array(filePath),
    volume: t.number,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = operation(1, {
    files: t.type({ oldValue: t.array(filePath) }),
    volume: t.type({ oldValue: t.number }),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = operation(1, {
    files: t.type({ newValue: t.array(filePath) }),
    volume: t.type({ newValue: t.number }),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $version: 1;

    files?: ReplaceValueOperation.ReplaceValueTwoWayOperation<t.TypeOf<typeof filePath>[]>;
    volume?: ReplaceValueOperation.ReplaceValueTwoWayOperation<number>;
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
    if (operation.files != null) {
        result.files = operation.files.newValue;
    }
    if (operation.volume != null) {
        result.volume = operation.volume.newValue;
    }
    return ResultModule.ok(result);
};

export const transformerFactory: TransformerFactory<string, State, State, DownOperation, UpOperation, TwoWayOperation> = ({
    composeLoose: ({ first, second }) => {
        const valueProps: DownOperation = {
            $version: 1,
            files: ReplaceValueOperation.composeDownOperation(first.files, second.files),
            volume: ReplaceValueOperation.composeDownOperation(first.volume, second.volume),
        };
        return ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        if (downOperation === undefined) {
            return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }

        const prevState: State = { ...nextState };
        const twoWayOperation: TwoWayOperation = { $version: 1 };

        if (downOperation.files !== undefined) {
            prevState.files = downOperation.files.oldValue;
            twoWayOperation.files = { ...downOperation.files, newValue: nextState.files };
        }
        if (downOperation.volume !== undefined) {
            prevState.volume = downOperation.volume.oldValue;
            twoWayOperation.volume = { ...downOperation.volume, newValue: nextState.volume };
        }

        return ResultModule.ok({ prevState, twoWayOperation: isIdRecord(twoWayOperation) ? undefined : twoWayOperation });
    },
    transform: ({ prevState, clientOperation, serverOperation }) => {
        const twoWayOperation: TwoWayOperation = { $version: 1 };

        twoWayOperation.files = ReplaceValueOperation.transform({
            first: serverOperation?.files,
            second: clientOperation.files,
            prevState: prevState.files,
        });
        twoWayOperation.volume = ReplaceValueOperation.transform({
            first: serverOperation?.volume,
            second: clientOperation.volume,
            prevState: prevState.volume,
        });

        if (isIdRecord(twoWayOperation)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok({ ...twoWayOperation });
    },
    diff: ({ prevState, nextState }) => {
        const resultType: TwoWayOperation = { $version: 1 };
        if (prevState.files !== nextState.files) {
            resultType.files = { oldValue: prevState.files, newValue: nextState.files };
        }
        if (prevState.volume !== nextState.volume) {
            resultType.volume = { oldValue: prevState.volume, newValue: nextState.volume };
        }
        if (isIdRecord(resultType)) {
            return undefined;
        }
        return { ...resultType };
    },
    applyBack: ({ downOperation, nextState }) => {
        const result = { ...nextState };

        if (downOperation.files !== undefined) {
            result.files = downOperation.files.oldValue;
        }
        if (downOperation.volume !== undefined) {
            result.volume = downOperation.volume.oldValue;
        }

        return ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {
    }
});