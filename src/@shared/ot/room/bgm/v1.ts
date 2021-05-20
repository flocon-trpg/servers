import * as t from 'io-ts';
import { ResultModule } from '../../../Result';
import * as ReplaceOperation from '../util/replaceOperation';
import { filePath } from '../../filePath/v1';
import { Apply, ClientTransform, Compose, Diff, Restore, ServerTransform, ToClientOperationParams } from '../util/type';
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

    files?: ReplaceOperation.ReplaceValueTwoWayOperation<t.TypeOf<typeof filePath>[]>;
    volume?: ReplaceOperation.ReplaceValueTwoWayOperation<number>;
}

export const toClientState = (source: State): State => source;

export const toClientOperation = ({ diff }: ToClientOperationParams<State, TwoWayOperation>): UpOperation => {
    return diff;
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return source;
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return source;
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

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result: State = { ...state };
    if (operation.files != null) {
        result.files = operation.files.oldValue;
    }
    if (operation.volume != null) {
        result.volume = operation.volume.oldValue;
    }
    return ResultModule.ok(result);
};

export const composeUpOperation: Compose<UpOperation> = ({ first, second }) => {
    const valueProps: UpOperation = {
        $version: 1,
        files: ReplaceOperation.composeUpOperation(first.files, second.files),
        volume: ReplaceOperation.composeUpOperation(first.volume, second.volume),
    };
    return ResultModule.ok(valueProps);
};

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
    const valueProps: DownOperation = {
        $version: 1,
        files: ReplaceOperation.composeDownOperation(first.files, second.files),
        volume: ReplaceOperation.composeDownOperation(first.volume, second.volume),
    };
    return ResultModule.ok(valueProps);
};

export const restore: Restore<State, DownOperation, TwoWayOperation> = ({ nextState, downOperation }) => {
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
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
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
    return resultType;
};

export const serverTransform: ServerTransform<State, TwoWayOperation, UpOperation> = ({ prevState, clientOperation, serverOperation }) => {
    const twoWayOperation: TwoWayOperation = { $version: 1 };

    twoWayOperation.files = ReplaceOperation.serverTransform({
        first: serverOperation?.files,
        second: clientOperation.files,
        prevState: prevState.files,
    });
    twoWayOperation.volume = ReplaceOperation.serverTransform({
        first: serverOperation?.volume,
        second: clientOperation.volume,
        prevState: prevState.volume,
    });

    if (isIdRecord(twoWayOperation)) {
        return ResultModule.ok(undefined);
    }

    return ResultModule.ok({ ...twoWayOperation });
};

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const files = ReplaceOperation.clientTransform({
        first: first.files,
        second: second.files,
    });
    const volume = ReplaceOperation.clientTransform({
        first: first.volume,
        second: second.volume,
    });

    const firstPrime: UpOperation = {
        $version: 1,
        files: files.firstPrime,
        volume: volume.firstPrime,
    };

    const secondPrime: UpOperation = {
        $version: 1,
        files: files.secondPrime,
        volume: volume.secondPrime,
    };

    return ResultModule.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};