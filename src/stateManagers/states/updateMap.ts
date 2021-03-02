import { __ } from '../../@shared/collection';
import { groupJoin } from '../../@shared/Map';
import { both, left, right } from '../../@shared/Types';
import { Apply, Diff, Transform } from '../StateManager';
import { OperationElement, replace, update } from './types';
import * as $Map from './map';

export const apply = <TKey, TState, TOperation>({
    state,
    operation,
    inner
}: {
    state: ReadonlyMap<TKey, TState>;
    operation: ReadonlyMap<TKey, TOperation>;
    inner: Apply<TState, TOperation>;
}): Map<TKey, TState> => {
    return $Map.apply({
        state,
        operation: __(operation).toMap(([key, value]) => {
            return {
                key,
                value: {
                    type: update,
                    operation: value,
                }
            };
        }),
        inner,
    });
};

export const compose = <TKey, TState, TOperation>({
    state,
    first,
    second,
    innerCompose,
}: {
    state: ReadonlyMap<TKey, TState>;
    first: ReadonlyMap<TKey, TOperation>;
    second: ReadonlyMap<TKey, TOperation>;
    innerCompose: (params: { state: TState | undefined; first: TOperation; second: TOperation }) => TOperation;
}): Map<TKey, TOperation> => {
    const result = new Map<TKey, TOperation>();
    groupJoin(first, second).forEach((group, key) => {
        switch (group.type) {
            case left:
                result.set(key, group.left);
                return;
            case right:
                result.set(key, group.right);
                return;
            case both: {
                const composed = innerCompose({
                    state: state.get(key),
                    first: group.left,
                    second: group.right,
                });
                if (composed !== undefined) {
                    result.set(key, composed);
                }
                return;
            }
        }
    });
    return result;
};

const transformFirstElement = <TState, TFirstOperation, TSecondOperation>({
    first,
    second,
    inner,
}: {
    first: TFirstOperation;
    second: OperationElement<TState, TSecondOperation>;
    inner: Transform<TFirstOperation, TSecondOperation>;
}): { firstPrime: TFirstOperation | undefined; secondPrime: OperationElement<TState, TSecondOperation> | undefined } => {
    switch (second.type) {
        case replace: {
            if (second.newValue !== undefined) {
                throw 'Tried to add an element, but already exists another value.';
            }

            return {
                firstPrime: undefined,
                secondPrime: {
                    type: replace,
                    newValue: undefined
                },
            };
        }
        case update: {
            const xform = inner({ first, second: second.operation });
            return {
                firstPrime: xform.firstPrime,
                secondPrime: {
                    type: update,
                    operation: xform.secondPrime
                },
            };
        }
    }
};

export const transformFirst = <TKey, TState, TFirstOperation, TSecondOperation>({
    first,
    second,
    inner,
}: {
    first: ReadonlyMap<TKey, TFirstOperation>;
    second: ReadonlyMap<TKey, OperationElement<TState, TSecondOperation>>;
    inner: Transform<TFirstOperation, TSecondOperation>;
}): { firstPrime: ReadonlyMap<TKey, TFirstOperation>; secondPrime: ReadonlyMap<TKey, OperationElement<TState, TSecondOperation>> } => {
    const firstPrime = new Map<TKey, TFirstOperation>();
    const secondPrime = new Map<TKey, OperationElement<TState, TSecondOperation>>();
    
    groupJoin(first, second).forEach((group, key) => {
        switch (group.type) {
            case left: {
                firstPrime.set(key, group.left);
                return;
            }
            case right: {
                secondPrime.set(key, group.right);
                return;
            }
            case both: {
                const xform = transformFirstElement({ first: group.left, second: group.right, inner });
                if (xform.firstPrime !== undefined) {
                    firstPrime.set(key, xform.firstPrime);
                }
                if (xform.secondPrime !== undefined) {
                    secondPrime.set(key, xform.secondPrime);
                }
                return;
            }
        }
    });
    return { firstPrime, secondPrime };
};

const transformSecondElement = <TState, TFirstOperation, TSecondOperation>({
    first,
    second,
    inner,
}: {
    first: OperationElement<TState, TFirstOperation>;
    second: TSecondOperation;
    inner: Transform<TFirstOperation, TSecondOperation>;
}): { firstPrime: OperationElement<TState, TFirstOperation> | undefined; secondPrime: TSecondOperation | undefined } => {
    switch (first.type) {
        case replace:
            return {
                firstPrime: first,
                secondPrime: undefined,
            };
        case update: {
            const xform = inner({ first: first.operation, second });
            return {
                firstPrime: {
                    type: update,
                    operation: xform.firstPrime
                },
                secondPrime: xform.secondPrime,
            };
        }
    }
};

export const transformSecond = <TKey, TState, TFirstOperation, TSecondOperation>({
    first,
    second,
    inner,
}: {
    first: ReadonlyMap<TKey, OperationElement<TState, TFirstOperation>>;
    second: ReadonlyMap<TKey, TSecondOperation>;
    inner: Transform<TFirstOperation, TSecondOperation>;
}): { firstPrime: ReadonlyMap<TKey, OperationElement<TState, TFirstOperation>>; secondPrime: ReadonlyMap<TKey, TSecondOperation> } => {
    const firstPrime = new Map<TKey, OperationElement<TState, TFirstOperation>>();
    const secondPrime = new Map<TKey, TSecondOperation>();

    groupJoin(first, second).forEach((group, key) => {
        switch (group.type) {
            case left: {
                firstPrime.set(key, group.left);
                return;
            }
            case right: {
                secondPrime.set(key, group.right);
                return;
            }
            case both: {
                const xform = transformSecondElement({ first: group.left, second: group.right, inner });
                if (xform.firstPrime !== undefined) {
                    firstPrime.set(key, xform.firstPrime);
                }
                if (xform.secondPrime !== undefined) {
                    secondPrime.set(key, xform.secondPrime);
                }
                return;
            }
        }
    });
    return { firstPrime, secondPrime };
};