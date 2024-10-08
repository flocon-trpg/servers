import {
    both,
    chooseRecord,
    groupJoinMap,
    left,
    mapToRecord,
    recordForEach,
    recordToArray,
    recordToMap,
    right,
} from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { StringKeyRecord, isEmptyRecord } from './record';
import {
    RecordDownOperationElement,
    RecordTwoWayOperationElement,
    RecordUpOperationElement,
    mapRecordOperationElement,
    replace,
    update,
} from './recordOperationElement';
import { isValidKey } from './util/isValidKey';

type RecordOperationElement<TReplace, TUpdate> =
    | {
          type: typeof update;
          update: TUpdate;
      }
    | {
          type: typeof replace;
          replace: TReplace;
      };

type RecordOperation<TReplace, TUpdate> = Record<
    string,
    RecordOperationElement<TReplace, TUpdate> | undefined
>;

export type RecordDownOperation<TState, TOperation> = Record<
    string,
    RecordDownOperationElement<TState, TOperation> | undefined
>;
export type RecordUpOperation<TState, TOperation> = Record<
    string,
    RecordUpOperationElement<TState, TOperation> | undefined
>;
export type RecordTwoWayOperation<TState, TOperation> = Record<
    string,
    RecordTwoWayOperationElement<TState, TOperation> | undefined
>;

type RestoreResult<TState, TTwoWayOperation> = {
    prevState: TState;
    twoWayOperation: TTwoWayOperation | undefined;
};

export type ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> = {
    first?: TFirstOperation;
    second: TSecondOperation;
    prevState: TServerState;
    nextState: TServerState;
};

/**
 * trueを返すと、「TServerState全体がprivateであり編集不可能」とみなしてスキップします。ただし制限されるのはtransformのみであるため、読み取りなどは制限されません。
 *
 * 「ユーザーがprivateだと思っていたらその後すぐ変更があってprivateになった」というケースがあるので、trueでもエラーは返さず処理が続行されます。
 *
 *  関数ではなくundefinedを渡した場合、常にfalseを返す関数が渡されたときと同等の処理が行われます。
 */
export type CancellationPolicy<TKey, TServerState> = {
    cancelRemove?: (params: { key: TKey; state: TServerState }) => boolean;

    // cancelUpdateなしでもinnerTransformのほうで同等のことはできるが、プロテクト忘れを防ぎやくするために設けている。
    cancelUpdate?: (params: {
        key: TKey;
        prevState: TServerState;
        nextState: TServerState;
    }) => boolean;

    cancelCreate?: (params: { key: TKey; newState: TServerState }) => boolean;
};

/** Make sure `apply(prevState, source) = nextState` */
export const toClientState = <TSourceState, TClientState>({
    serverState,
    isPrivate,
    toClientState,
}: {
    serverState: StringKeyRecord<TSourceState> | undefined;

    // 対象となるユーザーの視点で、全体がprivateとなるときはtrueを返す。一部がprivateである、もしくはprivateである部分がないときはfalseを返す。
    isPrivate: (state: TSourceState, key: string) => boolean;

    // 全体がprivateになるケースについて書く必要はない。
    toClientState: (params: { state: TSourceState; key: string }) => TClientState;
}) => {
    if (serverState == null) {
        return undefined;
    }

    const result = new Map<string, TClientState>();

    recordForEach(serverState, (value, key) => {
        if (isPrivate(value, key)) {
            return;
        }
        result.set(key, toClientState({ state: value, key }));
    });

    return mapToRecord(result);
};

// composeDownOperationは、レコード内の同一キーを時系列順でremove→addしたものをcomposeすると、本来はupdateになるべきだが、replaceになってしまうという仕様がある。だが、このrestore関数ではそれをupdateに変換してくれる。その代わり、innerDiffはdownでなくtwoWayである必要がある。
export const restore = <TState, TDownOperation, TTwoWayOperation, TCustomError = string>({
    nextState,
    downOperation,
    innerRestore,
    innerDiff,
}: {
    nextState: StringKeyRecord<TState>;
    downOperation?: StringKeyRecord<RecordDownOperationElement<TState, TDownOperation>>;
    innerRestore: (params: {
        key: string;
        downOperation: TDownOperation;
        nextState: TState;
    }) => Result<RestoreResult<TState, TTwoWayOperation | undefined>, string | TCustomError>;
    innerDiff: (params: {
        key: string;
        prevState: TState;
        nextState: TState;
    }) => TTwoWayOperation | undefined;
}): Result<
    RestoreResult<StringKeyRecord<TState>, RecordTwoWayOperation<TState, TTwoWayOperation>>,
    string | TCustomError
> => {
    if (downOperation == null) {
        return Result.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }

    const prevState = recordToMap(nextState);
    const twoWayOperation = new Map<
        string,
        RecordTwoWayOperationElement<TState, TTwoWayOperation>
    >();

    for (const [key, value] of recordToMap(downOperation)) {
        switch (value.type) {
            case 'replace': {
                const oldValue = value.replace.oldValue;
                const newValue = nextState[key];
                if (oldValue === undefined) {
                    prevState.delete(key);
                } else {
                    prevState.set(key, oldValue);
                }
                if (oldValue === undefined) {
                    if (newValue === undefined) {
                        break;
                    }
                    twoWayOperation.set(key, {
                        type: 'replace',
                        replace: { oldValue, newValue },
                    });
                    break;
                }
                if (newValue === undefined) {
                    twoWayOperation.set(key, {
                        type: 'replace',
                        replace: { oldValue, newValue: undefined },
                    });
                    break;
                }
                const diff = innerDiff({
                    key,
                    prevState: oldValue,
                    nextState: newValue,
                });
                if (diff !== undefined) {
                    twoWayOperation.set(key, { type: 'update', update: diff });
                }
                break;
            }
            case 'update': {
                const nextStateElement = nextState[key];
                if (nextStateElement === undefined) {
                    return Result.error(
                        `tried to update "${key}", but nextState does not have such a key`,
                    );
                }
                const restored = innerRestore({
                    key,
                    downOperation: value.update,
                    nextState: nextStateElement,
                });
                if (restored.isError) {
                    return restored;
                }
                prevState.set(key, restored.value.prevState);
                if (restored.value.twoWayOperation !== undefined) {
                    twoWayOperation.set(key, {
                        type: 'update',
                        update: restored.value.twoWayOperation,
                    });
                }
                break;
            }
        }
    }

    return Result.ok({
        prevState: mapToRecord(prevState),
        twoWayOperation: twoWayOperation.size === 0 ? undefined : mapToRecord(twoWayOperation),
    });
};

// replace によって、存在しないキーを削除しようとしたり、すでに存在するキーに上書きするような operation は、現時点では許容している。だが、将来禁止するかもしれない。
export const apply = <TState, TOperation, TCustomError = string>({
    prevState,
    operation,
    innerApply,
}: {
    prevState: StringKeyRecord<TState>;
    operation?: StringKeyRecord<RecordUpOperationElement<TState, TOperation>>;
    innerApply: (params: {
        key: string;
        operation: TOperation;
        prevState: TState;
    }) => Result<TState, string | TCustomError>;
}): Result<StringKeyRecord<TState>, string | TCustomError> => {
    if (operation == null) {
        return Result.ok(prevState);
    }

    const nextState = recordToMap(prevState);

    for (const [key, value] of recordToMap(operation)) {
        switch (value.type) {
            case 'replace': {
                if (value.replace.newValue === undefined) {
                    nextState.delete(key);
                } else {
                    nextState.set(key, value.replace.newValue);
                }
                break;
            }
            case 'update': {
                const prevStateElement = prevState[key];
                if (prevStateElement === undefined) {
                    return Result.error(
                        `tried to update "${key}", but prevState does not have such a key`,
                    );
                }
                const newValue = innerApply({
                    key,
                    operation: value.update,
                    prevState: prevStateElement,
                });
                if (newValue.isError) {
                    return newValue;
                }
                nextState.set(key, newValue.value);
                break;
            }
        }
    }

    return Result.ok(mapToRecord(nextState));
};

// replace によって、存在しないキーを削除しようとしたり、すでに存在するキーに上書きするような operation は、現時点では許容している。だが、将来禁止するかもしれない。
export const applyBack = <TState, TDownOperation, TCustomError = string>({
    nextState,
    operation,
    innerApplyBack,
}: {
    nextState: StringKeyRecord<TState>;
    operation?: StringKeyRecord<RecordDownOperationElement<TState, TDownOperation>>;
    innerApplyBack: (params: {
        key: string;
        operation: TDownOperation;
        state: TState;
    }) => Result<TState, string | TCustomError>;
}): Result<StringKeyRecord<TState>, string | TCustomError> => {
    if (operation == null) {
        return Result.ok(nextState);
    }

    const prevState = recordToMap(nextState);

    for (const [key, value] of recordToMap(operation)) {
        switch (value.type) {
            case 'replace': {
                if (value.replace.oldValue === undefined) {
                    prevState.delete(key);
                } else {
                    prevState.set(key, value.replace.oldValue);
                }
                break;
            }
            case 'update': {
                const nextStateElement = nextState[key];
                if (nextStateElement === undefined) {
                    return Result.error(
                        `tried to update "${key}", but nextState does not have such a key`,
                    );
                }
                const oldValue = innerApplyBack({
                    key,
                    operation: value.update,
                    state: nextStateElement,
                });
                if (oldValue.isError) {
                    return oldValue;
                }
                prevState.set(key, oldValue.value);
                break;
            }
        }
    }

    return Result.ok(mapToRecord(prevState));
};

// stateが必要ないため処理を高速化&簡略化できるが、その代わり戻り値のreplaceにおいて oldValue === undefined && newValue === undefined もしくは oldValue !== undefined && newValue !== undefinedになるケースがある。
export const compose = <TReplace, TUpdate, TError>({
    first,
    second,
    composeReplaceReplace,
    composeReplaceUpdate,
    composeUpdateReplace,
    composeUpdateUpdate,
}: {
    first?: RecordOperation<TReplace, TUpdate>;
    second?: RecordOperation<TReplace, TUpdate>;
    composeReplaceReplace: (params: {
        first: TReplace;
        second: TReplace;
        key: string;
    }) => Result<TReplace | undefined, TError>;
    composeReplaceUpdate: (params: {
        first: TReplace;
        second: TUpdate;
        key: string;
    }) => Result<TReplace | undefined, TError>;
    composeUpdateReplace: (params: {
        first: TUpdate;
        second: TReplace;
        key: string;
    }) => Result<TReplace | undefined, TError>;
    composeUpdateUpdate: (params: {
        first: TUpdate;
        second: TUpdate;
        key: string;
    }) => Result<TUpdate | undefined, TError>;
}): Result<RecordOperation<TReplace, TUpdate> | undefined, TError> => {
    if (first == null) {
        return Result.ok(second == null || isEmptyRecord(second) ? undefined : second);
    }
    if (second == null) {
        return Result.ok(first == null || isEmptyRecord(first) ? undefined : first);
    }

    const result = new Map<string, RecordOperationElement<TReplace, TUpdate>>();

    for (const [key, groupJoined] of groupJoinMap(recordToMap(first), recordToMap(second))) {
        switch (groupJoined.type) {
            case left:
                switch (groupJoined.left.type) {
                    case 'replace':
                        result.set(key, {
                            type: 'replace',
                            replace: groupJoined.left.replace,
                        });
                        continue;
                    case 'update':
                        result.set(key, {
                            type: 'update',
                            update: groupJoined.left.update,
                        });
                        continue;
                }
                break;
            case right:
                switch (groupJoined.right.type) {
                    case 'replace':
                        result.set(key, {
                            type: 'replace',
                            replace: groupJoined.right.replace,
                        });
                        continue;
                    case 'update':
                        result.set(key, {
                            type: 'update',
                            update: groupJoined.right.update,
                        });
                        continue;
                }
                break;
            case both:
                switch (groupJoined.left.type) {
                    case 'replace':
                        switch (groupJoined.right.type) {
                            case 'replace': {
                                const composed = composeReplaceReplace({
                                    first: groupJoined.left.replace,
                                    second: groupJoined.right.replace,
                                    key,
                                });
                                if (composed.isError) {
                                    return composed;
                                }
                                if (composed.value === undefined) {
                                    continue;
                                }
                                result.set(key, {
                                    type: 'replace',
                                    replace: composed.value,
                                });
                                continue;
                            }
                            case 'update': {
                                const composed = composeReplaceUpdate({
                                    first: groupJoined.left.replace,
                                    second: groupJoined.right.update,
                                    key,
                                });
                                if (composed.isError) {
                                    return composed;
                                }
                                if (composed.value === undefined) {
                                    continue;
                                }
                                result.set(key, {
                                    type: 'replace',
                                    replace: composed.value,
                                });
                                continue;
                            }
                        }
                        continue;
                    case 'update':
                        switch (groupJoined.right.type) {
                            case 'replace': {
                                const composed = composeUpdateReplace({
                                    first: groupJoined.left.update,
                                    second: groupJoined.right.replace,
                                    key,
                                });
                                if (composed.isError) {
                                    return composed;
                                }
                                if (composed.value === undefined) {
                                    continue;
                                }
                                result.set(key, {
                                    type: 'replace',
                                    replace: composed.value,
                                });
                                continue;
                            }
                            case 'update': {
                                const composed = composeUpdateUpdate({
                                    first: groupJoined.left.update,
                                    second: groupJoined.right.update,
                                    key,
                                });
                                if (composed.isError) {
                                    return composed;
                                }
                                if (composed.value === undefined) {
                                    continue;
                                }
                                result.set(key, {
                                    type: 'update',
                                    update: composed.value,
                                });
                                continue;
                            }
                        }
                }
                break;
        }
    }
    return Result.ok(result.size === 0 ? undefined : mapToRecord(result));
};

export const composeDownOperation = <TState, TDownOperation, TCustomError = string>({
    first,
    second,
    innerApplyBack,
    innerCompose,
}: {
    first?: RecordDownOperation<TState, TDownOperation>;
    second?: RecordDownOperation<TState, TDownOperation>;
    innerApplyBack: (params: {
        key: string;
        operation: TDownOperation;
        state: TState;
    }) => Result<TState, string | TCustomError>;
    innerCompose: (params: {
        key: string;
        first: TDownOperation;
        second: TDownOperation;
    }) => Result<TDownOperation | undefined, string | TCustomError>;
}): Result<RecordDownOperation<TState, TDownOperation> | undefined, string | TCustomError> => {
    return compose<{ oldValue?: TState }, TDownOperation, string | TCustomError>({
        first,
        second,
        composeReplaceReplace: params => {
            return Result.ok(params.first);
        },
        composeReplaceUpdate: params => {
            return Result.ok(params.first);
        },
        composeUpdateReplace: params => {
            if (params.second.oldValue === undefined) {
                return Result.error(
                    `first is update, but second.oldValue is null. the key is "${params.key}".`,
                );
            }
            const firstOldValue = innerApplyBack({
                key: params.key,
                operation: params.first,
                state: params.second.oldValue,
            });
            if (firstOldValue.isError) {
                return firstOldValue;
            }
            return Result.ok({ oldValue: firstOldValue.value });
        },
        composeUpdateUpdate: params => {
            return innerCompose({
                key: params.key,
                first: params.first,
                second: params.second,
            });
        },
    });
};

type ServerTransformCoreParams<
    TServerState,
    TClientState,
    TFirstOperation,
    TSecondOperation,
    TCustomError,
> = {
    stateBeforeFirst: StringKeyRecord<TServerState>;
    stateAfterFirst: StringKeyRecord<TServerState>;
    first?: RecordUpOperation<TServerState, TFirstOperation>;
    second?: RecordUpOperation<TClientState, TSecondOperation>;
    /** `TClientState` を `TServerState` に変換します。`create` される値の変換を行っても構いません。 */
    toServerState: (state: TClientState, key: string) => TServerState;
    innerTransform: (
        params: ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> & {
            key: string;
        },
    ) => Result<TFirstOperation | undefined, string | TCustomError>;
    cancellationPolicy: CancellationPolicy<string, TServerState>;
};

/** Make sure `apply(stateBeforeFirst, first) = stateAfterFirst` */
const serverTransformWithoutValidation = <
    TServerState,
    TClientState,
    TFirstOperation,
    TSecondOperation,
    TCustomError = string,
>({
    first,
    second,
    stateBeforeFirst,
    stateAfterFirst,
    innerTransform,
    toServerState,
    cancellationPolicy,
}: ServerTransformCoreParams<
    TServerState,
    TClientState,
    TFirstOperation,
    TSecondOperation,
    TCustomError
>): Result<
    RecordTwoWayOperation<TServerState, TFirstOperation> | undefined,
    string | TCustomError
> => {
    // 現在のCharacterの全体Privateの仕組みだと、PrivateになっているCharacterをupdateもしくはremoveしようとしてもエラーは出ない（最新の状態でPrivateになっているかどうかはクライアント側はわからないので、代わりにエラーを返すのは問題がある）。だが、現在のこのtransformのコードだと、存在しないCharacterをupdateもしくはremoveしようとするとエラーを返す。このため、keyを Brute-force attackすることで、PrivateになっているCharacterが存在することを理論上は判別できてしまう。だが、中の値は見ることができないので、現状のままでも問題ないと考えている。

    if (second === undefined) {
        return Result.ok(undefined);
    }

    const result = new Map<string, RecordTwoWayOperationElement<TServerState, TFirstOperation>>();

    for (const [key, operation] of recordToMap(second)) {
        if (!isValidKey(key)) {
            return Result.error(`"${key}" is not a valid key.`);
        }

        switch (operation.type) {
            case replace: {
                const innerPrevState = stateBeforeFirst?.[key];
                const innerNextState = stateAfterFirst?.[key];

                /**** requested to remove ****/

                if (operation.replace.newValue === undefined) {
                    if (innerPrevState === undefined) {
                        return Result.error(
                            `"${key}" was not found at requested revision. It is not allowed to try to remove non-existing element.`,
                        );
                    }
                    if (innerNextState === undefined) {
                        // removeを試みたが、既に誰かによってremoveされているので何もする必要がない。よって終了。
                        break;
                    }

                    if (cancellationPolicy.cancelRemove) {
                        if (
                            cancellationPolicy.cancelRemove({
                                key,
                                state: innerNextState,
                            })
                        ) {
                            break;
                        }
                    }

                    result.set(key, {
                        type: replace,
                        replace: {
                            oldValue: innerNextState,
                            newValue: undefined,
                        },
                    });
                    break;
                }

                /**** requested to add ****/

                if (innerPrevState !== undefined) {
                    return Result.error(
                        `"${key}" was found at requested revision. When adding a state, old value must be empty.`,
                    );
                }

                if (innerNextState !== undefined) {
                    // addを試みたが、既に誰かによってaddされているので何もする必要がない。よって終了。
                    break;
                }

                const newValue = toServerState(operation.replace.newValue, key);
                if (cancellationPolicy.cancelCreate) {
                    if (cancellationPolicy.cancelCreate({ key, newState: newValue })) {
                        break;
                    }
                }

                result.set(key, {
                    type: replace,
                    replace: {
                        oldValue: undefined,
                        newValue,
                    },
                });
                break;
            }
            case update: {
                const innerPrevState = stateBeforeFirst?.[key];
                const innerNextState = stateAfterFirst?.[key];
                const innerFirst = first?.[key];
                if (innerPrevState === undefined) {
                    return Result.error(`tried to update "${key}", but not found.`);
                }
                if (innerNextState === undefined) {
                    // updateを試みたが、既に誰かによってremoveされているのでupdateは行われない。よって終了。
                    break;
                }
                // Type guard。事前条件が満たされていれば、innerPrevState !== undefinedかつinnerNextState !== undefinedならばこれは必ずfalseになるので、下のbreakには来ない。
                if (innerFirst !== undefined && innerFirst.type === replace) {
                    break;
                }
                if (cancellationPolicy.cancelUpdate) {
                    if (
                        cancellationPolicy.cancelUpdate({
                            key,
                            prevState: innerPrevState,
                            nextState: innerNextState,
                        })
                    ) {
                        break;
                    }
                }
                const transformed = innerTransform({
                    first: innerFirst?.update,
                    second: operation.update,
                    prevState: innerPrevState,
                    nextState: innerNextState,
                    key,
                });
                if (transformed.isError) {
                    return transformed;
                }
                const transformedUpdate = transformed.value;
                if (transformedUpdate !== undefined) {
                    result.set(key, {
                        type: update,
                        update: transformedUpdate,
                    });
                }
            }
        }
    }
    return Result.ok(result.size === 0 ? undefined : mapToRecord(result));
};

export type ServerTransformParams<
    TServerState,
    TClientState,
    TFirstOperation,
    TSecondOperation,
    TCustomError,
> = ServerTransformCoreParams<
    TServerState,
    TClientState,
    TFirstOperation,
    TSecondOperation,
    TCustomError
> & {
    /** 制限を設けることができます。指定した制限を満たさない場合は Result.error が返されます。 */
    validation?: {
        /** このRecordの名前です。エラーメッセージを生成する際に用いられます。 */
        recordName: string;

        /** Record の要素の数の最大値。要素の追加後に、要素の数がこれを超える場合はエラーとなります。追加以外の操作では無視されます。 */
        maxRecordLength?: number;
    };
};

/** Make sure `apply(stateBeforeFirst, first) = stateAfterFirst` */
export const serverTransform = <
    TServerState,
    TClientState,
    TFirstOperation,
    TSecondOperation,
    TCustomError = string,
>(
    params: ServerTransformParams<
        TServerState,
        TClientState,
        TFirstOperation,
        TSecondOperation,
        TCustomError
    >,
): Result<
    RecordTwoWayOperation<TServerState, TFirstOperation> | undefined,
    string | TCustomError
> => {
    const result = serverTransformWithoutValidation(params);
    if (result.isError) {
        return result;
    }
    if (result.value == null) {
        return result;
    }
    if (params.validation?.maxRecordLength != null) {
        const prevStateLength = recordToArray(params.stateAfterFirst).length;
        let nextStateLength = prevStateLength;
        recordForEach(result.value, operation => {
            if (operation.type === update) {
                return;
            }
            if (operation.replace.oldValue != null) {
                nextStateLength--;
            }
            if (operation.replace.newValue != null) {
                nextStateLength++;
            }
        });
        if (
            params.validation.maxRecordLength < nextStateLength &&
            prevStateLength < nextStateLength
        ) {
            return Result.error(
                `${params.validation.recordName} の要素の数が多すぎるため、これ以上追加することはできません。追加するには、不要な要素を削除してください。`,
            );
        }
    }
    return result;
};

type InnerClientTransform<TState, TFirstOperation, TSecondOperation, TError = string> = (params: {
    state: TState;
    first: TFirstOperation;
    second: TSecondOperation;
}) => Result<
    {
        firstPrime: TFirstOperation | undefined;
        secondPrime: TSecondOperation | undefined;
    },
    TError
>;

type Diff<TState, TOperation> = (params: {
    prevState: TState;
    nextState: TState;
}) => TOperation | undefined;

const transformElement = <TState, TFirstOperation, TSecondOperation, TError = string>({
    state,
    first,
    second,
    innerTransform,
    innerDiff,
    errorMessageOnStateNotFound,
}: {
    state: TState | undefined;
    first: RecordUpOperationElement<TState, TFirstOperation>;
    second: RecordUpOperationElement<TState, TSecondOperation>;
    innerTransform: InnerClientTransform<TState, TFirstOperation, TSecondOperation, TError>;
    innerDiff: Diff<TState, TFirstOperation>;
    errorMessageOnStateNotFound: string;
}): Result<
    {
        firstPrime: RecordUpOperationElement<TState, TFirstOperation> | undefined;
        secondPrime: RecordUpOperationElement<TState, TSecondOperation> | undefined;
    },
    string | TError
> => {
    switch (first.type) {
        case replace:
            switch (second.type) {
                case replace:
                    // 通常、片方がnon-undefinedならばもう片方もnon-undefined。
                    if (
                        first.replace.newValue !== undefined &&
                        second.replace.newValue !== undefined
                    ) {
                        const diffResult = innerDiff({
                            nextState: first.replace.newValue,
                            prevState: second.replace.newValue,
                        });
                        if (diffResult === undefined) {
                            return Result.ok({
                                firstPrime: undefined,
                                secondPrime: undefined,
                            });
                        }
                        return Result.ok({
                            firstPrime: { type: update, update: diffResult },
                            secondPrime: undefined,
                        });
                    }
                    // 通常、ここに来る場合は first.newValue === undefined && second.newValue === undefined
                    return Result.ok({
                        firstPrime: undefined,
                        secondPrime: undefined,
                    });
                case update:
                    return Result.ok({
                        firstPrime: first,
                        secondPrime: undefined,
                    });
            }
            break;
        case update:
            switch (second.type) {
                case replace: {
                    if (second.replace.newValue !== undefined) {
                        throw new Error(
                            'Tried to add an element, but already exists another value.',
                        );
                    }

                    return Result.ok({
                        firstPrime: undefined,
                        secondPrime: {
                            type: replace,
                            replace: {
                                newValue: undefined,
                            },
                        },
                    });
                }
                case update: {
                    if (state === undefined) {
                        return Result.error(errorMessageOnStateNotFound);
                    }
                    const xform = innerTransform({
                        state,
                        first: first.update,
                        second: second.update,
                    });
                    if (xform.isError) {
                        return xform;
                    }
                    return Result.ok({
                        firstPrime:
                            xform.value.firstPrime == null
                                ? undefined
                                : {
                                      type: update,
                                      update: xform.value.firstPrime,
                                  },
                        secondPrime:
                            xform.value.secondPrime == null
                                ? undefined
                                : {
                                      type: update,
                                      update: xform.value.secondPrime,
                                  },
                    });
                }
            }
            break;
    }
};

export const clientTransform = <TState, TOperation, TCustomError = string>({
    state,
    first,
    second,
    innerTransform,
    innerDiff,
}: {
    state: StringKeyRecord<TState>;
    first?: RecordUpOperation<TState, TOperation>;
    second?: RecordUpOperation<TState, TOperation>;
    innerTransform: InnerClientTransform<TState, TOperation, TOperation, TCustomError>;
    innerDiff: Diff<TState, TOperation>;
}): Result<
    {
        firstPrime: RecordUpOperation<TState, TOperation> | undefined;
        secondPrime: RecordUpOperation<TState, TOperation> | undefined;
    },
    string | TCustomError
> => {
    if (first == null || second == null) {
        return Result.ok({
            firstPrime: first == null || isEmptyRecord(first) ? undefined : first,
            secondPrime: second == null || isEmptyRecord(second) ? undefined : second,
        });
    }

    const firstPrime = new Map<string, RecordUpOperationElement<TState, TOperation>>();
    const secondPrime = new Map<string, RecordUpOperationElement<TState, TOperation>>();
    let error = undefined as { error: string | TCustomError } | undefined;

    groupJoinMap(recordToMap(first), recordToMap(second)).forEach((group, key) => {
        if (error != null) {
            return;
        }
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
                const xform = transformElement({
                    state: state[key],
                    first: group.left,
                    second: group.right,
                    innerTransform,
                    innerDiff,
                    errorMessageOnStateNotFound: `"${key}" is not found at RecordOperation.clientTransform.`,
                });
                if (xform.isError) {
                    error = { error: xform.error };
                    return;
                }
                if (xform.value.firstPrime !== undefined) {
                    firstPrime.set(key, xform.value.firstPrime);
                }
                if (xform.value.secondPrime !== undefined) {
                    secondPrime.set(key, xform.value.secondPrime);
                }
                return;
            }
        }
    });
    if (error != null) {
        return Result.error(error.error);
    }
    return Result.ok({
        firstPrime: firstPrime.size === 0 ? undefined : mapToRecord(firstPrime),
        secondPrime: secondPrime.size === 0 ? undefined : mapToRecord(secondPrime),
    });
};

export const diff = <TState, TOperation>({
    prevState,
    nextState,
    innerDiff,
}: {
    prevState: StringKeyRecord<TState>;
    nextState: StringKeyRecord<TState>;
    innerDiff: (params: {
        key: string;
        prevState: TState;
        nextState: TState;
    }) => TOperation | undefined;
}) => {
    const result = new Map<string, RecordTwoWayOperationElement<TState, TOperation>>();
    for (const [key, value] of groupJoinMap(recordToMap(prevState), recordToMap(nextState))) {
        switch (value.type) {
            case left:
                result.set(key, {
                    type: replace,
                    replace: { oldValue: value.left, newValue: undefined },
                });
                continue;
            case right: {
                result.set(key, {
                    type: replace,
                    replace: { oldValue: undefined, newValue: value.right },
                });
                continue;
            }
            case both: {
                const diffResult = innerDiff({
                    key,
                    prevState: value.left,
                    nextState: value.right,
                });
                if (diffResult === undefined) {
                    continue;
                }
                result.set(key, { type: update, update: diffResult });
                continue;
            }
        }
    }
    if (result.size === 0) {
        return undefined;
    }
    return mapToRecord(result);
};

export const mapRecordUpOperation = <TState1, TState2, TOperation1, TOperation2>({
    source,
    mapState,
    mapOperation,
}: {
    source: Record<string, RecordUpOperationElement<TState1, TOperation1> | undefined>;
    mapState: (state: TState1) => TState2;
    mapOperation: (operation: TOperation1) => TOperation2;
}): Record<string, RecordUpOperationElement<TState2, TOperation2>> => {
    return chooseRecord(source, element => {
        if (element.type === replace) {
            return {
                type: replace,
                replace: {
                    newValue:
                        element.replace.newValue == null
                            ? undefined
                            : mapState(element.replace.newValue),
                },
            };
        }
        return {
            type: update,
            update: mapOperation(element.update),
        };
    });
};

export const mapRecordDownOperation = <TState1, TState2, TOperation1, TOperation2>({
    source,
    mapState,
    mapOperation,
}: {
    source: Record<string, RecordDownOperationElement<TState1, TOperation1> | undefined>;
    mapState: (state: TState1) => TState2;
    mapOperation: (operation: TOperation1) => TOperation2;
}): Record<string, RecordDownOperationElement<TState2, TOperation2>> => {
    return chooseRecord(source, element => {
        if (element.type === replace) {
            return {
                type: replace,
                replace: {
                    oldValue:
                        element.replace.oldValue == null
                            ? undefined
                            : mapState(element.replace.oldValue),
                },
            };
        }
        return {
            type: update,
            update: mapOperation(element.update),
        };
    });
};

export const mapRecordOperation = <TReplace1, TReplace2, TUpdate1, TUpdate2>({
    source,
    mapReplace,
    mapUpdate,
}: {
    source: Record<
        string,
        | { type: typeof replace; replace: TReplace1 }
        | { type: typeof update; update: TUpdate1 }
        | undefined
    >;
    mapReplace: (state: TReplace1) => TReplace2;
    mapUpdate: (state: TUpdate1) => TUpdate2;
}): Record<
    string,
    { type: typeof replace; replace: TReplace2 } | { type: typeof update; update: TUpdate2 }
> => {
    return chooseRecord(source, element => {
        return mapRecordOperationElement({ source: element, mapReplace, mapOperation: mapUpdate });
    });
};
