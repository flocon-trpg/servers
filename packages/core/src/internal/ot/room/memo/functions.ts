import { Result } from '@kizahasi/result';
import { isIdRecord } from '../../util/record';
import * as ReplaceOperation from '../../util/replaceOperation';
import * as TextOperation from '../../util/textOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    DownError,
    Restore,
    ServerTransform,
} from '../../util/type';
import { DownOperation, State, TwoWayOperation, UpOperation } from './types';

export const toClientState = (source: State): State => source;

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        name: source.name == null ? undefined : TextOperation.toDownOperation(source.name),
        text: source.text == null ? undefined : TextOperation.toDownOperation(source.text),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        name: source.name == null ? undefined : TextOperation.toUpOperation(source.name),
        text: source.text == null ? undefined : TextOperation.toUpOperation(source.text),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state };

    if (operation.dir != null) {
        result.dir = operation.dir.newValue;
    }
    if (operation.name != null) {
        const applied = TextOperation.apply(state.name, operation.name);
        if (applied.isError) {
            return applied;
        }
        result.name = applied.value;
    }
    if (operation.text != null) {
        const applied = TextOperation.apply(state.text, operation.text);
        if (applied.isError) {
            return applied;
        }
        result.text = applied.value;
    }
    if (operation.textType != null) {
        result.textType = operation.textType.newValue;
    }

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result = { ...state };

    if (operation.dir !== undefined) {
        result.dir = operation.dir.oldValue;
    }
    if (operation.name != null) {
        const applied = TextOperation.applyBack(state.name, operation.name);
        if (applied.isError) {
            return applied;
        }
        result.name = applied.value;
    }
    if (operation.text != null) {
        const applied = TextOperation.applyBack(state.text, operation.text);
        if (applied.isError) {
            return applied;
        }
        result.text = applied.value;
    }
    if (operation.textType !== undefined) {
        result.textType = operation.textType.oldValue;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation, DownError> = ({ first, second }) => {
    const name = TextOperation.composeDownOperation(first.name, second.name);
    if (name.isError) {
        return name;
    }
    const text = TextOperation.composeDownOperation(first.text, second.text);
    if (text.isError) {
        return text;
    }
    const valueProps: DownOperation = {
        $v: 1,
        $r: 1,
        dir: ReplaceOperation.composeDownOperation(first.dir, second.dir),
        name: name.value,
        text: text.value,
        textType: ReplaceOperation.composeDownOperation(first.textType, second.textType),
    };
    return Result.ok(valueProps);
};

export const restore: Restore<State, DownOperation, TwoWayOperation> = ({
    nextState,
    downOperation,
}) => {
    if (downOperation === undefined) {
        return Result.ok({ prevState: nextState, twoWayOperation: undefined });
    }

    const prevState: State = { ...nextState };
    const twoWayOperation: TwoWayOperation = { $v: 1, $r: 1 };

    if (downOperation.dir !== undefined) {
        prevState.dir = downOperation.dir.oldValue;
        twoWayOperation.dir = {
            ...downOperation.dir,
            newValue: nextState.dir,
        };
    }
    if (downOperation.name !== undefined) {
        const restored = TextOperation.restore({
            nextState: nextState.name,
            downOperation: downOperation.name,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.name = restored.value.prevState;
        twoWayOperation.name = restored.value.twoWayOperation;
    }
    if (downOperation.text !== undefined) {
        const restored = TextOperation.restore({
            nextState: nextState.text,
            downOperation: downOperation.text,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.text = restored.value.prevState;
        twoWayOperation.text = restored.value.twoWayOperation;
    }
    if (downOperation.textType !== undefined) {
        prevState.textType = downOperation.textType.oldValue;
        twoWayOperation.textType = {
            ...downOperation.textType,
            newValue: nextState.textType,
        };
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const resultType: TwoWayOperation = { $v: 1, $r: 1 };

    if (prevState.dir !== nextState.dir) {
        resultType.dir = {
            oldValue: prevState.dir,
            newValue: nextState.dir,
        };
    }
    if (prevState.name !== nextState.name) {
        resultType.name = TextOperation.diff({ prev: prevState.name, next: nextState.name });
    }
    if (prevState.text !== nextState.text) {
        resultType.text = TextOperation.diff({ prev: prevState.text, next: nextState.text });
    }
    if (prevState.textType !== nextState.textType) {
        resultType.textType = {
            oldValue: prevState.textType,
            newValue: nextState.textType,
        };
    }

    if (isIdRecord(resultType)) {
        return undefined;
    }
    return resultType;
};

export const serverTransform: ServerTransform<State, TwoWayOperation, UpOperation> = ({
    prevState,
    clientOperation,
    serverOperation,
}) => {
    const twoWayOperation: TwoWayOperation = { $v: 1, $r: 1 };

    // 暫定的にディレクトリの深さは1までとしている
    if ((clientOperation.dir?.newValue.length ?? 0) <= 1) {
        twoWayOperation.dir = ReplaceOperation.serverTransform({
            first: serverOperation?.dir,
            second: clientOperation.dir,
            prevState: prevState.dir,
        });
    }

    const name = TextOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: prevState.name,
    });
    if (name.isError) {
        return name;
    }
    twoWayOperation.name = name.value.secondPrime;

    const text = TextOperation.serverTransform({
        first: serverOperation?.text,
        second: clientOperation.text,
        prevState: prevState.text,
    });
    if (text.isError) {
        return text;
    }
    twoWayOperation.text = text.value.secondPrime;

    twoWayOperation.textType = ReplaceOperation.serverTransform({
        first: serverOperation?.textType,
        second: clientOperation.textType,
        prevState: prevState.textType,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok({ ...twoWayOperation });
};

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const dir = ReplaceOperation.clientTransform({
        first: first.dir,
        second: second.dir,
    });

    const name = TextOperation.clientTransform({
        first: first.name,
        second: second.name,
    });
    if (name.isError) {
        return name;
    }

    const text = TextOperation.clientTransform({
        first: first.text,
        second: second.text,
    });
    if (text.isError) {
        return text;
    }

    const textType = ReplaceOperation.clientTransform({
        first: first.textType,
        second: second.textType,
    });

    const firstPrime: UpOperation = {
        $v: 1,
        $r: 1,
        name: name.value.firstPrime,
        dir: dir.firstPrime,
        text: text.value.firstPrime,
        textType: textType.firstPrime,
    };

    const secondPrime: UpOperation = {
        $v: 1,
        $r: 1,
        name: name.value.secondPrime,
        dir: dir.secondPrime,
        text: text.value.secondPrime,
        textType: textType.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
