import { appConsole } from '../../utils/appConsole';
import { Apply, Diff, Transform } from '../StateManager';
import { left, right, both } from '../../@shared/Types';
import { OperationElement, replace, update } from './types';
import { DualKey, DualKeyMap, groupJoin, ReadonlyDualKeyMap, toJSONString } from '../../@shared/DualKeyMap';

export const apply = <TKey1, TKey2, TState, TOperation>({
    state,
    operation,
    inner
}: {
    state: ReadonlyDualKeyMap<TKey1, TKey2, TState>;
    operation: ReadonlyDualKeyMap<TKey1, TKey2, OperationElement<TState, TOperation>>;
    inner: Apply<TState, TOperation>;
}) => {
    const result = new DualKeyMap<TKey1, TKey2, TState>();
    groupJoin(state, operation).forEach((group, key) => {
        switch (group.type) {
            case left: {
                result.set(key, group.left);
                return;
            }
            case right: {
                if (group.right.type !== replace) {
                    throw `Tried to update element, but target is undefined. key: ${toJSONString(key)}`;
                }
                if (group.right.newValue === undefined) {
                    appConsole.warn(`Tried to remove element, but target is undefined. key: ${toJSONString(key)}`);
                    return;
                }
                result.set(key, group.right.newValue);
                return;
            }
            case both: {
                if (group.right.type === replace) {
                    if (group.right.newValue !== undefined) {
                        throw `Tried to add element, but already exists another value. key: ${toJSONString(key)}`;
                    }
                    return;
                }
                const newValue = inner({ state: group.left, operation: group.right.operation });
                result.set(key, newValue);
                return;
            }
        }
    });
    return result;
};

const composeElement = <TState, TOperation>({
    state,
    first,
    second,
    innerApply,
    innerCompose,
    innerDiff,
}: {
    state: TState | undefined;
    first: OperationElement<TState, TOperation>;
    second: OperationElement<TState, TOperation>;
    innerApply: (params: { state: TState; operation: TOperation }) => TState;
    innerCompose: (params: { state: TState | undefined; first: TOperation; second: TOperation }) => TOperation;
    innerDiff: Diff<TState, TOperation>;
}): OperationElement<TState, TOperation> | undefined => {
    switch (first.type) {
        case replace:
            switch (second.type) {
                case replace:
                    if (second.newValue !== undefined) {
                        if (first.newValue !== undefined) {
                            throw 'cannot compose (add, add)';
                        }

                        // (remove, add) なのでreplaceを表すため、これを表現するにはdiffを用いたupdateが必要になってくる。

                        if (state === undefined) {
                            throw 'state is undefined, but first is remove';
                        }
                        const diffResult = innerDiff({ prevState: state, nextState: second.newValue });
                        if (diffResult === undefined) {
                            return undefined;
                        }
                        return { type: update, operation: diffResult };
                    }
                    if (first.newValue === undefined) {
                        throw 'cannot compose (remove, remove)';
                    }
                    return { type: replace, newValue: second.newValue };
                case update:
                    if (first.newValue === undefined) {
                        throw 'cannot compose (replace, update)';
                    }
                    return { type: replace, newValue: innerApply({ state: first.newValue, operation: second.operation }) };
            }
            break;
        case update:
            switch (second.type) {
                case replace:
                    if (second.newValue !== undefined) {
                        throw 'cannot compose (update, add)';
                    }
                    return { type: replace, newValue: second.newValue };
                case update:
                    return { type: update, operation: innerCompose({ state, first: first.operation, second: second.operation }) };
            }
            break;
    }
};

export const compose = <TKey1, TKey2, TState, TOperation>({
    state,
    first,
    second,
    innerApply,
    innerCompose,
    innerDiff,
}: {
    state: ReadonlyDualKeyMap<TKey1, TKey2, TState>;
    first: ReadonlyDualKeyMap<TKey1, TKey2, OperationElement<TState, TOperation>>;
    second: ReadonlyDualKeyMap<TKey1, TKey2, OperationElement<TState, TOperation>>;
    innerApply: (params: { state: TState; operation: TOperation }) => TState;
    innerCompose: (params: { state: TState | undefined; first: TOperation; second: TOperation }) => TOperation;
    innerDiff: Diff<TState, TOperation>;
}) => {
    const result = new DualKeyMap<TKey1, TKey2, OperationElement<TState, TOperation>>();
    groupJoin(first, second).forEach((group, key) => {
        switch (group.type) {
            case left:
                result.set(key, group.left);
                return;
            case right:
                result.set(key, group.right);
                return;
            case both: {
                const composed = composeElement({ 
                    state: state.get(key), 
                    first: group.left,
                    second: group.right, 
                    innerApply, 
                    innerCompose,
                    innerDiff
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

const transformElement = <TState, TFirstOperation, TSecondOperation>({
    first,
    second,
    inner,
    diff
}: {
    first: OperationElement<TState, TFirstOperation>;
    second: OperationElement<TState, TSecondOperation>;
    inner: Transform<TFirstOperation, TSecondOperation>;
    diff: Diff<TState, TFirstOperation>;
}): { firstPrime: OperationElement<TState, TFirstOperation> | undefined; secondPrime: OperationElement<TState, TSecondOperation> | undefined } => {
    switch (first.type) {
        case replace:
            switch (second.type) {
                case replace:
                    // 通常、片方がnon-undefinedならばもう片方もnon-undefined。
                    if (first.newValue !== undefined && second.newValue !== undefined) {
                        const diffResult = diff({ nextState: first.newValue, prevState: second.newValue });
                        if (diffResult === undefined) {
                            return {
                                firstPrime: undefined,
                                secondPrime: undefined
                            };
                        }
                        return {
                            firstPrime: { type: update, operation: diffResult },
                            secondPrime: undefined
                        };
                    }
                    // 通常、ここに来る場合は first.newValue === undefined && second.newValue === undefined
                    return {
                        firstPrime: undefined,
                        secondPrime: undefined
                    };
                case update:
                    return {
                        firstPrime: first,
                        secondPrime: undefined,
                    };
            }
            break;
        case update:
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
                    const xform = inner({ first: first.operation, second: second.operation });
                    return {
                        firstPrime: {
                            type: update,
                            operation: xform.firstPrime
                        },
                        secondPrime: {
                            type: update,
                            operation: xform.secondPrime
                        },
                    };
                }
            }
            break;
    }
};

export const transform = <TKey1, TKey2, TState, TFirstOperation, TSecondOperation>({
    first,
    second,
    inner,
    diff
}: {
    first: ReadonlyDualKeyMap<TKey1, TKey2, OperationElement<TState, TFirstOperation>>;
    second: ReadonlyDualKeyMap<TKey1, TKey2, OperationElement<TState, TSecondOperation>>;
    inner: Transform<TFirstOperation, TSecondOperation>;
    diff: Diff<TState, TFirstOperation>;
}): { firstPrime: DualKeyMap<TKey1, TKey2, OperationElement<TState, TFirstOperation>>; secondPrime: DualKeyMap<TKey1, TKey2, OperationElement<TState, TSecondOperation>> } => {
    const firstPrime = new DualKeyMap<TKey1, TKey2, OperationElement<TState, TFirstOperation>>();
    const secondPrime = new DualKeyMap<TKey1, TKey2, OperationElement<TState, TSecondOperation>>();

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
                const xform = transformElement({ first: group.left, second: group.right, inner, diff });
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

export const diff = <TKey1, TKey2, TState, TOperation>({
    prev,
    next,
    inner,
}: {
    prev: ReadonlyDualKeyMap<TKey1, TKey2, TState>;
    next: ReadonlyDualKeyMap<TKey1, TKey2, TState>;
    inner: Diff<TState, TOperation>;
}) => {
    const result = new DualKeyMap<TKey1, TKey2, OperationElement<TState, TOperation>>();

    groupJoin(prev, next).forEach((group, key) => {
        switch (group.type) {
            case left: {
                result.set(key, { type: replace, newValue: undefined });
                return;
            }
            case right: {
                result.set(key, { type: replace, newValue: group.right });
                return;
            }
            case both: {
                const diff = inner({ prevState: group.left, nextState: group.right });
                if (diff === undefined) {
                    return;
                }
                result.set(key, { type: update, operation: diff });
                return;
            }
        }
    });

    return result;
};

export const ofGraphQLOperation = <TKey1, TKey2, TGraphQLReplace, TGraphQLUpdate, TState, TOperation>({
    source,
    toDualKey,
    getNewValue,
    getOperation,
}: {
    source: {
        replace: TGraphQLReplace[];
        update: TGraphQLUpdate[];
    };
    toDualKey: (source: TGraphQLReplace | TGraphQLUpdate) => DualKey<TKey1, TKey2>;
    getNewValue: (source: TGraphQLReplace) => TState | undefined;
    getOperation: (source: TGraphQLUpdate) => TOperation;
}) => {
    const result = new DualKeyMap<TKey1, TKey2, OperationElement<TState, TOperation>>();

    source.replace.forEach(replace => {
        const key = toDualKey(replace);
        result.set(key, { type: 'replace', newValue: getNewValue(replace) ?? undefined });
    });
    source.update.forEach(update => {
        const key = toDualKey(update);
        if (result.has(key)) {
            throw `A duplicate key, ${toJSONString(key)} was found at CollectionGetOperation. Probably there is a bug at the server app.`;
        }
        result.set(key, { type: 'update', operation: getOperation(update) });
    });
    return result;
};
