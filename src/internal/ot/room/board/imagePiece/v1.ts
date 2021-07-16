import * as t from 'io-ts';
import * as ReplaceOperation from '../../../util/replaceOperation';
import {
    Apply,
    ClientTransform,
    Compose,
    Diff,
    Restore,
    ServerTransform,
} from '../../../util/type';
import { createOperation } from '../../../util/createOperation';
import { isIdRecord } from '../../../util/record';
import { Result } from '@kizahasi/result';
import { Maybe, maybe } from '@kizahasi/util';
import { FilePath, filePath } from '../../../filePath/v1';
import * as TextOperation from '../../../util/textOperation';
import * as Piece from '../../../piece/v1';

const numberDownOperation = t.type({ oldValue: t.number });
const booleanDownOperation = t.type({ oldValue: t.boolean });
const numberUpOperation = t.type({ newValue: t.number });
const booleanUpOperation = t.type({ newValue: t.boolean });

export const state = t.type({
    // Pieceと一致するプロパティ
    $version: t.literal(1),
    cellH: t.number,
    cellW: t.number,
    cellX: t.number,
    cellY: t.number,
    h: t.number,
    isCellMode: t.boolean,
    isPrivate: t.boolean,
    w: t.number,
    x: t.number,
    y: t.number,

    // Pieceと一致しないプロパティ
    image: maybe(filePath),
    memo: t.string,
    name: t.string,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    // Pieceと一致するプロパティ
    cellH: numberDownOperation,
    cellW: numberDownOperation,
    cellX: numberDownOperation,
    cellY: numberDownOperation,
    h: numberDownOperation,
    isCellMode: booleanDownOperation,
    isPrivate: booleanDownOperation,
    w: numberDownOperation,
    x: numberDownOperation,
    y: numberDownOperation,

    // Pieceと一致しないプロパティ
    image: t.type({ oldValue: maybe(filePath) }),
    memo: TextOperation.downOperation,
    name: t.type({ oldValue: t.string }),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    // Pieceと一致するプロパティ
    cellH: numberUpOperation,
    cellW: numberUpOperation,
    cellX: numberUpOperation,
    cellY: numberUpOperation,
    h: numberUpOperation,
    isCellMode: booleanUpOperation,
    isPrivate: booleanUpOperation,
    w: numberUpOperation,
    x: numberUpOperation,
    y: numberUpOperation,

    // Pieceと一致しないプロパティ
    image: t.type({ newValue: maybe(filePath) }),
    memo: TextOperation.upOperation,
    name: t.type({ newValue: t.string }),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $version: 1;
    image?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<FilePath>>;
    isPrivate?: ReplaceOperation.ReplaceValueTwoWayOperation<boolean>;
    memo?: TextOperation.TwoWayOperation;
    name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
};

export const toClientState = (source: State): State => {
    return {
        ...source,
    };
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    return {
        ...source,
        memo: source.memo == null ? undefined : TextOperation.toDownOperation(source.memo),
    };
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    return {
        ...source,
        memo: source.memo == null ? undefined : TextOperation.toUpOperation(source.memo),
    };
};

export const apply: Apply<State, UpOperation | TwoWayOperation> = ({ state, operation }) => {
    const result: State = { ...state, ...Piece.apply({ state, operation }) };
    if (operation.image != null) {
        result.image = operation.image.newValue;
    }
    if (operation.memo != null) {
        const valueResult = TextOperation.apply(state.memo, operation.memo);
        if (valueResult.isError) {
            return valueResult;
        }
        result.memo = valueResult.value;
    }
    if (operation.name != null) {
        result.name = operation.name.newValue;
    }

    return Result.ok(result);
};

export const applyBack: Apply<State, DownOperation> = ({ state, operation }) => {
    const result: State = { ...state, ...Piece.applyBack({ state, operation }) };
    if (operation.image != null) {
        result.image = operation.image.oldValue;
    }
    if (operation.memo != null) {
        const valueResult = TextOperation.applyBack(state.memo, operation.memo);
        if (valueResult.isError) {
            return valueResult;
        }
        result.memo = valueResult.value;
    }
    if (operation.name != null) {
        result.name = operation.name.oldValue;
    }

    return Result.ok(result);
};

export const composeDownOperation: Compose<DownOperation> = ({ first, second }) => {
    const piece = Piece.composeDownOperation({ first, second });
    if (piece.isError) {
        return piece;
    }

    const memo = TextOperation.composeDownOperation(first.memo, second.memo);
    if (memo.isError) {
        return memo;
    }

    const valueProps: DownOperation = {
        ...piece.value,

        $version: 1,
        memo: memo.value,
        name: ReplaceOperation.composeDownOperation(first.name, second.name),
        image: ReplaceOperation.composeDownOperation(first.image, second.image),
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
    const piece = Piece.restore({ nextState, downOperation });
    if (piece.isError) {
        return piece;
    }

    const prevState: State = {
        ...nextState,
        ...piece.value.prevState,
    };
    const twoWayOperation: TwoWayOperation = {
        ...piece.value.twoWayOperation,
        $version: 1,
    };

    if (downOperation.image !== undefined) {
        prevState.image = downOperation.image.oldValue ?? undefined;
        twoWayOperation.image = {
            oldValue: downOperation.image.oldValue ?? undefined,
            newValue: nextState.image,
        };
    }
    if (downOperation.memo !== undefined) {
        const restored = TextOperation.restore({
            nextState: nextState.memo,
            downOperation: downOperation.memo,
        });
        if (restored.isError) {
            return restored;
        }
        prevState.memo = restored.value.prevState;
        twoWayOperation.memo = restored.value.twoWayOperation;
    }
    if (downOperation.name !== undefined) {
        prevState.name = downOperation.name.oldValue;
        twoWayOperation.name = {
            ...downOperation.name,
            newValue: nextState.name,
        };
    }

    return Result.ok({ prevState, twoWayOperation });
};

export const diff: Diff<State, TwoWayOperation> = ({ prevState, nextState }) => {
    const result: TwoWayOperation = {
        ...Piece.diff({ prevState, nextState }),
        $version: 1,
    };
    if (prevState.image !== nextState.image) {
        result.image = { oldValue: prevState.image, newValue: nextState.image };
    }
    if (prevState.memo !== nextState.memo) {
        result.memo = TextOperation.diff({
            prev: prevState.memo,
            next: nextState.memo,
        });
    }
    if (prevState.name !== nextState.name) {
        result.name = { oldValue: prevState.name, newValue: nextState.name };
    }
    if (isIdRecord(result)) {
        return undefined;
    }
    return result;
};

export const serverTransform: ServerTransform<State, TwoWayOperation, UpOperation> = ({
    prevState,
    currentState,
    clientOperation,
    serverOperation,
}) => {
    const piece = Piece.serverTransform({
        prevState,
        currentState,
        clientOperation,
        serverOperation,
    });
    if (piece.isError) {
        return piece;
    }

    const twoWayOperation: TwoWayOperation = {
        ...piece.value,
        $version: 1,
    };

    twoWayOperation.image = ReplaceOperation.serverTransform({
        first: serverOperation?.image,
        second: clientOperation.image,
        prevState: prevState.image,
    });
    const transformedMemo = TextOperation.serverTransform({
        first: serverOperation?.memo,
        second: clientOperation.memo,
        prevState: prevState.memo,
    });
    if (transformedMemo.isError) {
        return transformedMemo;
    }
    twoWayOperation.memo = transformedMemo.value.secondPrime;
    twoWayOperation.name = ReplaceOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: prevState.name,
    });

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};

export const clientTransform: ClientTransform<UpOperation> = ({ first, second }) => {
    const piece = Piece.clientTransform({ first, second });
    if (piece.isError) {
        return piece;
    }

    const image = ReplaceOperation.clientTransform({
        first: first.image,
        second: second.image,
    });

    const memo = TextOperation.clientTransform({
        first: first.memo,
        second: second.memo,
    });
    if (memo.isError) {
        return memo;
    }

    const name = ReplaceOperation.clientTransform({
        first: first.name,
        second: second.name,
    });

    const firstPrime: UpOperation = {
        ...piece.value.firstPrime,
        $version: 1,
        image: image.firstPrime,
        memo: memo.value.firstPrime,
        name: name.firstPrime,
    };
    const secondPrime: UpOperation = {
        ...piece.value.secondPrime,
        $version: 1,
        image: image.secondPrime,
        memo: memo.value.firstPrime,
        name: name.secondPrime,
    };

    return Result.ok({
        firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
        secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
    });
};
