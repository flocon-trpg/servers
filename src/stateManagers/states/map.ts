import { DualKeyMap } from '../../@shared/DualKeyMap';
import { createStateMap, ReadonlyStateMap, StateMap } from '../../@shared/StateMap';
import { Apply, Diff, Transform } from '../StateManager';
import * as $DualKeyMap from './dualKeyMap';
import { OperationElement } from './types';

const dummyCreatedBy = '';

const toDualKeyMap = <TKey, TValue>(source: ReadonlyMap<TKey, TValue>) => {
    const mapSource = new Map<string, ReadonlyMap<TKey, TValue>>();
    mapSource.set(dummyCreatedBy, source);
    return new DualKeyMap(mapSource);
};

const toMap = <TKey, TValue>(source: DualKeyMap<string, TKey, TValue>) => {
    if (source.isEmpty) {
        return new Map<TKey, TValue>();
    }
    const result = source.getByFirst(dummyCreatedBy);
    if (result === undefined) {
        throw 'dummyCreatedBy not found';
    }
    return result;
};

export const apply = <TKey, TState, TOperation>({
    state,
    operation,
    inner
}: {
    state: ReadonlyMap<TKey, TState>;
    operation: ReadonlyMap<TKey, OperationElement<TState, TOperation>>;
    inner: Apply<TState, TOperation>;
}): Map<TKey, TState> => {
    const result = $DualKeyMap.apply({
        state: toDualKeyMap(state),
        operation: toDualKeyMap(operation),
        inner,
    });
    return toMap(result);
};

export const compose = <TKey, TState, TOperation>({
    first,
    second,
    innerApply,
    innerCompose,
}: {
    first: ReadonlyMap<TKey, OperationElement<TState, TOperation>>;
    second: ReadonlyMap<TKey, OperationElement<TState, TOperation>>;
    innerApply: (params: { state: TState; operation: TOperation }) => TState;
    innerCompose: (params: { first: TOperation; second: TOperation }) => TOperation;
}): Map<TKey, OperationElement<TState, TOperation>> => {
    const result = $DualKeyMap.compose({
        first: toDualKeyMap(first),
        second: toDualKeyMap(second),
        innerApply,
        innerCompose,
    });
    return toMap(result);
};

export const transform = <TKey, TState, TFirstOperation, TSecondOperation>({
    first,
    second,
    inner,
    diff
}: {
    first: ReadonlyMap<TKey, OperationElement<TState, TFirstOperation>>;
    second: ReadonlyMap<TKey, OperationElement<TState, TSecondOperation>>;
    inner: Transform<TFirstOperation, TSecondOperation>;
    diff: Diff<TState, TFirstOperation>;
}): { firstPrime: Map<TKey, OperationElement<TState, TFirstOperation>>; secondPrime: Map<TKey, OperationElement<TState, TSecondOperation>> } => {
    const result = $DualKeyMap.transform({
        first: toDualKeyMap(first),
        second: toDualKeyMap(second),
        inner,
        diff,
    });
    return {
        firstPrime: toMap(result.firstPrime),
        secondPrime: toMap(result.secondPrime),
    };
};

export const diff = <TKey, TState, TOperation>({
    prev,
    next,
    inner,
}: {
    prev: ReadonlyMap<TKey, TState>;
    next: ReadonlyMap<TKey, TState>;
    inner: Diff<TState, TOperation>;
}): Map<TKey, OperationElement<TState, TOperation>> => {
    const result = $DualKeyMap.diff({
        prev: toDualKeyMap(prev),
        next: toDualKeyMap(next),
        inner,
    });
    return toMap(result);
};

export type CollectionGetOperation<TState, TOperation> = {
    replace: {
        id: string;
        newValue?: TState | null | undefined;
    }[];
    update: {
        id: string;
        value: TOperation;
    }[];
}

export const ofGraphQLOperation = <TKey, TGraphQLReplace, TGraphQLUpdate, TState, TOperation>(params: {
    source: {
        replace: TGraphQLReplace[];
        update: TGraphQLUpdate[];
    };
    toKey: (source: TGraphQLReplace | TGraphQLUpdate) => TKey;
    getNewValue: (source: TGraphQLReplace) => TState | undefined;
    getOperation: (source: TGraphQLUpdate) => TOperation;
}): Map<TKey, OperationElement<TState, TOperation>> => {
    const result = $DualKeyMap.ofGraphQLOperation({
        ...params,
        toDualKey: x => ({ first: dummyCreatedBy, second: params.toKey(x) })
    });
    return toMap(result);
};