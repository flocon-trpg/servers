import { loggerRef, mapRecord, recordToArray, recordToMap } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { produce } from 'immer';
import { groupBy } from 'lodash';
import { z } from 'zod';
import { apply, diff } from './generator/functions';
import { OmitVersion } from './generator/omitVersion';
import {
    State,
    TwoWayOperation,
    UpOperation,
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
} from './generator/types';
import { toOtError } from './otError';
import { StringKeyRecord, isIdRecord } from './record';
import * as RecordOperation from './recordOperation';
import { update } from './recordOperationElement';
import { transform } from './util/array/arrayTransform';

// サーバーとクライアントで書き換え可能だが特殊な値であるため、他のプロパティとの衝突を避ける目的で文字列の頭に $ を頭に付けている。
export const $index = '$index';

/**
 * Record を 配列とみなすときに、その要素として必要な値が入った template を作成する際に用いる値。
 *
 * @example
 * ```
 * const indexObjectTemplate = createRecordValueTemplate(
 *     createObjectValueTemplate(
 *         {
 *             ...indexObjectTemplateValue,
 *
 *             // add more properies...
 *         },
 *         1,
 *         1
 *     )
 * );
 * ```
 */
/*
配列の表現方法には { $key: string, ...otherProperties }[] と Record<string, { $index: number; ...otherProperties }> の2種類が考えられたが、後者を採用している。
前者はデータをエクスポートした際にテキストエディタで比較的編集しやすいというメリットがある。ただし、replace と update の2種類だけでは、要素が移動した際に要素を丸ごと delete と insert する必要があるため Operation の容量がかさばるという問題点がある。move のような Operation も定義すれば解決すると思われるが、手間がかかる。いっぽう、後者の方法だと $index を変更するだけで済むため容量がかさばる問題は存在せず、既存の Record の Operational Transformation のシステムに乗っかれるというメリットがある。よって単純化を重視して後者を採用した。
*/
export const indexObjectTemplateValue = {
    /**
     * 自身の要素のインデックス。一般的な配列と同様に、0 から始まります。
     *
     * インデックスが他の要素と重複してはなりません。また、0 から順に連続的に割り当てる必要があります。
     */
    [$index]: createReplaceValueTemplate(z.number().nonnegative().int()),
};

const dummyVersion = undefined;

const indexObjectTemplate = createObjectValueTemplate(
    indexObjectTemplateValue,
    dummyVersion,
    dummyVersion,
);

type IndexObjectState = OmitVersion<State<typeof indexObjectTemplate>>;
export type IndexObject = IndexObjectState;
type IndexObjectUpOperation = OmitVersion<UpOperation<typeof indexObjectTemplate>>;
type IndexObjectTwoWayOperation = OmitVersion<TwoWayOperation<typeof indexObjectTemplate>>;

type OtArray<T> = {
    key: string;
    value: T;
}[];

type ReadonlyOtArray<T> = Readonly<OtArray<T>>;

export const indexObjectsToArray = <T extends IndexObjectState>(
    record: Record<string, T | undefined>,
): Result<OtArray<T>> => {
    const groupBy$index = recordToMap(
        groupBy(recordToArray(record), ({ value }) => value[$index].toString()),
    );

    const result: OtArray<T> = [];
    for (let i = 0; groupBy$index.size >= 1; i++) {
        const groupValue = groupBy$index.get(i.toString());
        groupBy$index.delete(i.toString());
        if (groupValue == null || groupValue.length !== 1) {
            return Result.error(
                `Just one element where index is ${i} should exist, but there are ${
                    groupValue?.length ?? 0
                } such elements.`,
            );
        }
        const element = groupValue[0]!;
        result.push(element);
    }

    return Result.ok(result);
};

/**
 * 配列を Record に変換します。
 *
 * 引数に渡された `$index` は誤っていてもエラーにはならず、自動的かつ非破壊的に調整されます。
 */
export const arrayToIndexObjects = <T extends IndexObjectState>(array: ReadonlyOtArray<T>) => {
    const result: Record<string, T | undefined> = {};
    array.forEach((element, index) => {
        if (result[element.key] !== undefined) {
            throw new Error(`"${element.key}" key is duplicated.`);
        }
        result[element.key] = produce(element.value, value => {
            value[$index] = index;
        });
    });
    return result;
};

const generateArrayDiff = <TOperation>({
    prevState,
    nextState,
    mapOperation,
}: {
    prevState: StringKeyRecord<IndexObjectState>;
    nextState: StringKeyRecord<IndexObjectState>;
    mapOperation: (operation: IndexObjectTwoWayOperation) => TOperation;
}) => {
    const execDiff = diff(createRecordValueTemplate(indexObjectTemplate));

    const diffResult = execDiff({
        prevState: mapRecord(prevState, ({ $index }) => ({
            $v: dummyVersion,
            $r: dummyVersion,
            $index,
        })),
        nextState: mapRecord(nextState, ({ $index }) => ({
            $v: dummyVersion,
            $r: dummyVersion,
            $index,
        })),
    });

    // replaceは存在しないので、updateだけ抽出する
    return mapRecord(diffResult ?? {}, x =>
        x.type === update
            ? {
                  ...x,
                  // RecordOperation.compose で型エラーを起こさないためだけに行っている変換。
                  update: mapOperation(x.update),
              }
            : undefined,
    );
};

/**
 * 配列に対して serverTransform を行い、secondPrime を返します。
 *
 * 通常の Record の serverTransform の処理（つまり、`$index` 以外のプロパティの処理など）も内部で行われるため、通常の Record の serverTransform を別途実行することは避けてください。
 */
export const serverTransform = <
    TServerState extends IndexObjectState,
    TClientState extends IndexObjectState,
    TFirstOperation extends IndexObjectTwoWayOperation,
    TSecondOperation extends IndexObjectUpOperation,
    TCustomError = string,
>(
    params: RecordOperation.ServerTransformParams<
        TServerState,
        TClientState,
        TFirstOperation,
        TSecondOperation,
        TCustomError
    > & {
        /** Operation の型を変換して、TFirstOperation にします。通常は、単に `$v` と `$r` を付与するだけで構いません。 */
        mapOperation: (operation: IndexObjectTwoWayOperation) => TFirstOperation;
    },
): Result<
    RecordOperation.RecordTwoWayOperation<TServerState, TFirstOperation> | undefined,
    string | TCustomError
> => {
    // いったん通常のRecordOperation.serverTransformを行い、エラーがないかどうか確かめる。
    // Operationの内容に問題がなくともresultFirstの時点では不正な$indexが存在する可能性があるが、この後のresultSecondをcomposeすることで正常になる。
    const resultFirst = RecordOperation.serverTransform(params);
    if (resultFirst.isError) {
        return resultFirst;
    }

    const execApply = apply(createRecordValueTemplate(indexObjectTemplate));

    const arrayObjectAfterSecond = execApply({
        state: mapRecord(params.stateBeforeFirst, ({ $index }) => ({
            $v: dummyVersion,
            $r: dummyVersion,
            $index,
        })),
        operation: RecordOperation.mapRecordUpOperation({
            source: params.second ?? {},
            mapState: ({ $index }) => ({ $v: dummyVersion, $r: dummyVersion, $index }),
            mapOperation: ({ $index }) => ({ $v: dummyVersion, $r: dummyVersion, $index }),
        }),
    });

    if (arrayObjectAfterSecond.isError) {
        // ここに来るということは、クライアントから受け取った Operation が不正(存在しない State に対して update しようとしたなど)であることを示す。だが、その場合は上のRecordOperation.serverTransformですでに弾かれているので、ここには来ないはず。
        return Result.error(
            'Error at applying an array operation. This is probablly a bug. Message: ' +
                toOtError(arrayObjectAfterSecond.error).message,
        );
    }

    const arrayAfterSecond = indexObjectsToArray(arrayObjectAfterSecond.value ?? {});
    if (arrayAfterSecond.isError) {
        return Result.error(
            'Cannot create a valid array from requested operation. This is probably a bug. Message: ' +
                arrayAfterSecond.error,
        );
    }

    const arrayBeforeFirst = indexObjectsToArray(
        mapRecord(params.stateBeforeFirst, ({ $index }) => ({ $index })),
    );
    const arrayAfterFirst = indexObjectsToArray(
        mapRecord(params.stateAfterFirst, ({ $index }) => ({ $index })),
    );

    let finalArray: ReadonlyOtArray<IndexObjectState>;
    if (arrayAfterFirst.isError) {
        loggerRef.error(
            '`stateAfterFirst` is invalid as an array. This is probablly a bug or caused by database issues. The order of this array will be rearranged automatically. Message: ' +
                arrayAfterFirst.error,
        );
        finalArray = recordToArray(params.stateAfterFirst).sort((x, y) =>
            x.key.localeCompare(y.key),
        );
    } else if (arrayBeforeFirst.isError) {
        loggerRef.error(
            '`stateBeforeFirst` is invalid as an array. This is probablly a bug or caused by database issues. The operation to change the order of this array will be ignored. Message: ' +
                arrayBeforeFirst.error,
        );
        finalArray = arrayAfterFirst.value;
    } else {
        const finalArrayResult = transform(
            arrayBeforeFirst.value,
            arrayAfterFirst.value,
            arrayAfterSecond.value,
            x => x.key,
        );
        if (finalArrayResult.isError) {
            // 配列のtransformでエラーが発生することは通常はない。
            return Result.error(
                'Error at transforming an array operation. This is probablly a bug. Message: ' +
                    JSON.stringify(finalArrayResult.error),
            );
        }
        finalArray = finalArrayResult.value;
    }

    const finalStateBeforeIndexRearrangement = RecordOperation.apply({
        prevState: params.stateAfterFirst,
        operation: resultFirst.value,
        innerApply: ({ prevState, operation }): Result<TServerState> =>
            Result.ok(
                produce(prevState, prevState => {
                    if (operation[$index] === undefined) {
                        return;
                    }
                    prevState[$index] = operation[$index].newValue;
                }),
            ),
    });
    if (finalStateBeforeIndexRearrangement.isError) {
        throw new Error(
            'This should not happen. Message: ' + finalStateBeforeIndexRearrangement.error,
        );
    }

    const resultSecond = generateArrayDiff({
        prevState: finalStateBeforeIndexRearrangement.value,
        nextState: arrayToIndexObjects(finalArray),
        mapOperation: params.mapOperation,
    });

    const composed = RecordOperation.compose({
        first: resultFirst.value,
        second: resultSecond,
        composeReplaceUpdate: ({ first, second }) => {
            if (first.newValue === undefined) {
                // 通常はここには来ない
                return Result.ok(first);
            }
            return Result.ok(
                produce(first, first => {
                    if (second.$index === undefined) {
                        return;
                    }
                    if (first.newValue === undefined) {
                        return;
                    }
                    first.newValue.$index = second.$index.newValue;
                }),
            );
        },
        composeUpdateUpdate: ({ first, second }) => {
            let composed$indexOperation: { oldValue: number; newValue: number } | undefined;
            if (first[$index] === undefined) {
                composed$indexOperation = second[$index];
            } else {
                if (second[$index] === undefined) {
                    composed$indexOperation = first[$index];
                } else {
                    if (first[$index].oldValue === second[$index].newValue) {
                        composed$indexOperation = undefined;
                    } else {
                        composed$indexOperation = {
                            oldValue: first[$index].oldValue,
                            newValue: second[$index].newValue,
                        };
                    }
                }
            }
            const result = produce(first, first => {
                first.$index = composed$indexOperation;
            });
            return Result.ok(isIdRecord(result) ? undefined : result);
        },
        composeReplaceReplace: () => {
            throw new Error('This should not happen.');
        },
        composeUpdateReplace: () => {
            throw new Error('This should not happen.');
        },
    });

    if (composed.isError) {
        // RecordOperation.compose で Error を返していないので、ここには来ない
        throw new Error('This should not happen.');
    }

    return Result.ok(composed.value);
};

/**
 * 配列に対して clientTransform を行います。
 *
 * 通常の Record の serverTransform の処理（つまり、`$index` 以外のプロパティの処理など）も内部で行われるため、通常の Record の serverTransform を別途実行することは避けてください。
 */
export const clientTransform = <
    TState extends IndexObjectState,
    TOperation extends IndexObjectUpOperation,
    TCustomError = string,
>(
    params: Parameters<
        typeof RecordOperation.clientTransform<TState, TOperation, TCustomError>
    >[0] & {
        innerApply: (params: {
            prevState: TState;
            operation: TOperation;
        }) => Result<TState, string | TCustomError>;
    },
): Result<
    {
        firstPrime?: RecordOperation.RecordUpOperation<TState, TOperation | IndexObjectUpOperation>;
        secondPrime?: RecordOperation.RecordUpOperation<
            TState,
            TOperation | IndexObjectUpOperation
        >;
    },
    string | TCustomError
> => {
    // いったん通常のRecordOperation.clientTransformを行い、エラーがないかどうか確かめる。
    // Operationの内容に問題がなくともresultFirstの時点では不正な$indexが存在する可能性があるが、この後のresultSecondをcomposeすることで正常になる。
    const recordOperationTransformResult = RecordOperation.clientTransform(params);
    if (recordOperationTransformResult.isError) {
        return recordOperationTransformResult;
    }

    const execApply = apply(createRecordValueTemplate(indexObjectTemplate));

    const arrayObjectAfterFirst = execApply({
        state: mapRecord(params.state, ({ $index }) => ({
            $v: dummyVersion,
            $r: dummyVersion,
            $index,
        })),
        operation: RecordOperation.mapRecordUpOperation({
            source: params.first ?? {},
            mapState: ({ $index }) => ({ $v: dummyVersion, $r: dummyVersion, $index }),
            mapOperation: ({ $index }) => ({ $v: dummyVersion, $r: dummyVersion, $index }),
        }),
    });
    if (arrayObjectAfterFirst.isError) {
        // ここに来るということは、クライアントから受け取った Operation が不正(存在しない State に対して update しようとしたなど)であることを示す。だが、その場合は上のRecordOperation.clientTransformですでに弾かれているので、ここには来ないはず。
        return Result.error(
            'Error at applying first as an array operation. This is probablly a bug. Message: ' +
                toOtError(arrayObjectAfterFirst.error).message,
        );
    }

    const arrayObjectAfterSecond = execApply({
        state: mapRecord(params.state, ({ $index }) => ({
            $v: dummyVersion,
            $r: dummyVersion,
            $index,
        })),
        operation: RecordOperation.mapRecordUpOperation({
            source: params.second ?? {},
            mapState: ({ $index }) => ({ $v: dummyVersion, $r: dummyVersion, $index }),
            mapOperation: ({ $index }) => ({ $v: dummyVersion, $r: dummyVersion, $index }),
        }),
    });
    if (arrayObjectAfterSecond.isError) {
        // ここに来るということは、クライアントから受け取った Operation が不正(存在しない State に対して update しようとしたなど)であることを示す。だが、その場合は上のRecordOperation.clientTransformですでに弾かれているので、ここには来ないはず。
        return Result.error(
            'Error at applying second as an array operation. This is probablly a bug. Message: ' +
                toOtError(arrayObjectAfterSecond.error).message,
        );
    }

    const baseArray = indexObjectsToArray(mapRecord(params.state, ({ $index }) => ({ $index })));
    if (baseArray.isError) {
        return Result.error('state is invalid as an array. Message: ' + baseArray.error);
    }
    const arrayAfterFirst = indexObjectsToArray(
        mapRecord(arrayObjectAfterFirst.value ?? {}, ({ $index }) => ({ $index })),
    );
    if (arrayAfterFirst.isError) {
        return Result.error(
            'state applied first is invalid as an array. Message: ' + arrayAfterFirst.error,
        );
    }
    const arrayAfterSecond = indexObjectsToArray(
        mapRecord(arrayObjectAfterSecond.value ?? {}, ({ $index }) => ({ $index })),
    );
    if (arrayAfterSecond.isError) {
        return Result.error(
            'state applied second is invalid as an array. Message: ' + arrayAfterFirst.error,
        );
    }

    const finalArrayResult = transform(
        baseArray.value,
        arrayAfterFirst.value,
        arrayAfterSecond.value,
        x => x.key,
    );
    if (finalArrayResult.isError) {
        // 配列のtransformでエラーが発生することは通常はない。
        return Result.error(
            'Error at transforming an array operation. This is probablly a bug. Message: ' +
                JSON.stringify(finalArrayResult.error),
        );
    }

    const stateAfterFirst = RecordOperation.apply({
        prevState: params.state,
        operation: params.first ?? {},
        innerApply: ({ prevState, operation }) => params.innerApply({ prevState, operation }),
    });

    if (stateAfterFirst.isError) {
        throw new Error('This should not happen. Message: ' + stateAfterFirst.error);
    }

    const finalStateBeforeIndexRearrangement = RecordOperation.apply({
        prevState: stateAfterFirst.value,
        operation: recordOperationTransformResult.value.secondPrime,
        innerApply: ({ prevState, operation }) => params.innerApply({ prevState, operation }),
    });
    if (finalStateBeforeIndexRearrangement.isError) {
        throw new Error(
            'This should not happen. Message: ' + finalStateBeforeIndexRearrangement.error,
        );
    }

    const resultSecond = generateArrayDiff({
        prevState: finalStateBeforeIndexRearrangement.value,
        nextState: arrayToIndexObjects(finalArrayResult.value),
        mapOperation: x => ({
            [$index]: x[$index] == null ? undefined : { newValue: x[$index].newValue },
        }),
    });

    const compose = (first: RecordOperation.RecordUpOperation<TState, TOperation>) =>
        RecordOperation.compose<
            { newValue?: TState | undefined },
            TOperation | IndexObjectUpOperation,
            TCustomError
        >({
            first,
            second: resultSecond,
            composeReplaceUpdate: ({ first, second }) => {
                if (first.newValue === undefined) {
                    // 通常はここには来ない
                    return Result.ok(first);
                }
                return Result.ok(
                    produce(first, first => {
                        if (second.$index === undefined) {
                            return;
                        }
                        if (first.newValue === undefined) {
                            return;
                        }
                        first.newValue.$index = second.$index.newValue;
                    }),
                );
            },
            composeUpdateUpdate: ({ first, second }) => {
                let composed$indexOperation: { newValue: number } | undefined;
                if (second[$index] === undefined) {
                    composed$indexOperation = first[$index];
                } else {
                    composed$indexOperation = second[$index];
                }
                const result = produce(first, first => {
                    first.$index = composed$indexOperation;
                });
                return Result.ok(isIdRecord(result) ? undefined : result);
            },
            composeReplaceReplace: () => {
                throw new Error('This should not happen.');
            },
            composeUpdateReplace: () => {
                throw new Error('This should not happen.');
            },
        });

    const firstPrime = compose(recordOperationTransformResult.value.firstPrime ?? {});
    if (firstPrime.isError) {
        return firstPrime;
    }
    const secondPrime = compose(recordOperationTransformResult.value.secondPrime ?? {});
    if (secondPrime.isError) {
        return secondPrime;
    }

    return Result.ok({
        firstPrime: isIdRecord(firstPrime.value ?? {}) ? undefined : firstPrime.value,
        secondPrime: isIdRecord(secondPrime.value ?? {}) ? undefined : secondPrime.value,
    });
};
