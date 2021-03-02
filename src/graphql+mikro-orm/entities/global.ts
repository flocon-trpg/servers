import { Result, ResultModule } from '../../@shared/Result';
import { ReadonlyMapDownOperation } from '../mapOperations';
import * as DualKeyMapOperations from '../dualKeyMapOperations';
import { ProtectedValuePolicy, ReadonlyDualKeyMapDownOperation, ReadonlyDualKeyMapTwoWayOperation } from '../dualKeyMapOperations';
import * as ParamMapOperations from '../paramMapOperations';
import { DualKey, DualKeyMap, ReadonlyDualKeyMap } from '../../@shared/DualKeyMap';
import { __ } from '../../@shared/collection';

// TransformerFactoryやそれに類するtypeのメリットは、Stateが実装すべき関数がわかりやすく示せること。問題点は、composeLooseなどのように編集権限がないものとtransformやprotectedValuePolicyなどのように編集権限のチェックが必要なものが混在しているため、例えばcomposeLooseだけ使いたいとなったときに少し困ること。
export type TransformerFactory<TKey, TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation> = {
    // stateが必要ないぶん処理を高速化&簡略化できる。
    // 一見、restoreを逐次実行していけば多少非効率なもののcomposeLooseは必要ないように思えるが、その場合はtransformも逐次実行していくかTTwoWayOperationをcomposeする必要性が出てくる。後者の場合はcomposeLooseを省略するというメリットが打ち消されるため却下。前者の場合は流石にパフォーマンスが気になってくるので却下したが、もしかすると問題ない可能性もある。
    composeLoose(params: { key: TKey; first: TDownOperation; second: TDownOperation }): Result<TDownOperation | undefined>;

    // Ensure these:
    // - applyUp(prevState, twoWayOperation) = nextState
    // - applyDown(nextState, twoWayOperation) = prevState
    restore(params: { key: TKey; nextState: TServerState; downOperation: TDownOperation }): Result<{ prevState: TServerState; twoWayOperation: TTwoWayOperation | undefined }>;

    // Ensure these:
    // - applyUp(prevState, twoWayOperation) = currentState
    // - applyDown(currentState, twoWayOperation) = prevState
    // - isPrivate関連の値の保護
    transform(params: { key: TKey; prevState: TServerState; currentState: TServerState; serverOperation: TTwoWayOperation | undefined; clientOperation: TUpOperation }): Result<TTwoWayOperation | undefined>;

    // stateなどなしでcomposeLooseを定義しているが、その代償としてdiffの戻り値はDownでなくTwoWayである必要がある。
    diff(params: { key: TKey; prevState: TServerState; nextState: TServerState }): TTwoWayOperation | undefined;

    applyBack(params: { key: TKey; downOperation: TDownOperation; nextState: TServerState }): Result<TServerState>;

    toServerState(params: { key: TKey; clientState: TClientState }): TServerState;

    protectedValuePolicy: ProtectedValuePolicy<TKey, TServerState>;
}

// 各メソッドはTransformerFactoryと同様の規則を満たす必要がある。
export type ParamMapTransformerFactory<TKey, TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation> = {
    composeLoose(params: { key: TKey; first: TDownOperation; second: TDownOperation }): Result<TDownOperation | undefined>;

    restore(params: { key: TKey; nextState: TServerState; downOperation: TDownOperation }): Result<{ prevState: TServerState; twoWayOperation: TTwoWayOperation | undefined }>;

    transform(params: { key: TKey; prevState: TServerState; currentState: TServerState; serverOperation: TTwoWayOperation | undefined; clientOperation: TUpOperation }): Result<TTwoWayOperation | undefined>;

    diff(params: { key: TKey; prevState: TServerState; nextState: TServerState }): TTwoWayOperation | undefined;

    applyBack(params: { key: TKey; downOperation: TDownOperation; nextState: TServerState }): Result<TServerState>;

    toServerState(params: { key: TKey; clientState: TClientState }): TServerState;

    createDefaultState: (params: {key: TKey}) => TServerState;
}

export class DualKeyMapTransformer<TKey1, TKey2, TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation> {
    public constructor(private readonly factory: TransformerFactory<DualKey<TKey1, TKey2>, TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation>) { }

    public composeLoose(params: { first: ReadonlyDualKeyMapDownOperation<TKey1, TKey2, TServerState, TDownOperation>; second: ReadonlyDualKeyMapDownOperation<TKey1, TKey2, TServerState, TDownOperation> }): Result<ReadonlyDualKeyMapDownOperation<TKey1, TKey2, TServerState, TDownOperation> | undefined> {
        return DualKeyMapOperations.composeDownOperationLoose({
            ...params,
            innerApplyBack: params => this.factory.applyBack(params),
            innerCompose: params => this.factory.composeLoose(params),
        });
    }

    public restore({
        downOperation,
        nextState,
    }: {
        downOperation: ReadonlyDualKeyMapDownOperation<TKey1, TKey2, TServerState, TDownOperation>;
        nextState: ReadonlyDualKeyMap<TKey1, TKey2, TServerState>;
    }): Result<{ prevState: ReadonlyDualKeyMap<TKey1, TKey2, TServerState>; twoWayOperation: ReadonlyDualKeyMapTwoWayOperation<TKey1, TKey2, TServerState, TTwoWayOperation> }> {
        return DualKeyMapOperations.restore({
            nextState,
            downOperation,
            innerRestore: params => this.factory.restore(params),
            innerDiff: params => this.factory.diff(params),
        });
    }

    public transform({
        prevState,
        currentState,
        serverOperation,
        clientOperation,
    }: {
        prevState: ReadonlyDualKeyMap<TKey1, TKey2, TServerState>;
        currentState: ReadonlyDualKeyMap<TKey1, TKey2, TServerState>;
        serverOperation: ReadonlyDualKeyMap<TKey1, TKey2, DualKeyMapOperations.DualKeyMapTwoWayOperationElementUnion<TServerState, TTwoWayOperation>>;
        clientOperation: ReadonlyDualKeyMap<TKey1, TKey2, DualKeyMapOperations.DualKeyMapUpOperationElementUnion<TClientState, TUpOperation>>;
    }): Result<ReadonlyDualKeyMap<TKey1, TKey2, DualKeyMapOperations.DualKeyMapTwoWayOperationElementUnion<TServerState, TTwoWayOperation>>> {
        return DualKeyMapOperations.transform({
            first: serverOperation,
            second: clientOperation,
            prevState: prevState,
            nextState: currentState,
            innerTransform: params => this.factory.transform({
                key: params.key,
                prevState: params.prevState,
                currentState: params.nextState,
                serverOperation: params.first,
                clientOperation: params.second,
            }),
            toServerState: (state, key) => this.factory.toServerState({
                key,
                clientState: state,
            }),
            protectedValuePolicy: this.factory.protectedValuePolicy,
        });
    }

    public restoreAndTransform({
        currentState,
        serverOperation,
        clientOperation,
    }: {
        currentState: ReadonlyDualKeyMap<TKey1, TKey2, TServerState>;
        serverOperation: ReadonlyDualKeyMap<TKey1, TKey2, DualKeyMapOperations.DualKeyMapDownOperationElementUnion<TServerState, TDownOperation>>;
        clientOperation: ReadonlyDualKeyMap<TKey1, TKey2, DualKeyMapOperations.DualKeyMapUpOperationElementUnion<TClientState, TUpOperation>>;
    }): Result<ReadonlyDualKeyMap<TKey1, TKey2, DualKeyMapOperations.DualKeyMapTwoWayOperationElementUnion<TServerState, TTwoWayOperation>>> {
        const restoreResult = this.restore({
            nextState: currentState,
            downOperation: serverOperation,
        });
        if (restoreResult.isError) {
            return restoreResult;
        }

        return this.transform({
            serverOperation: restoreResult.value.twoWayOperation,
            clientOperation,
            prevState: restoreResult.value.prevState,
            currentState,
        });
    }

    public diff({
        prevState,
        nextState,
    }: {
        prevState: ReadonlyDualKeyMap<TKey1, TKey2, TServerState>;
        nextState: ReadonlyDualKeyMap<TKey1, TKey2, TServerState>;
    }) {
        return DualKeyMapOperations.diff({
            prev: prevState,
            next: nextState,
            innerDiff: ({ prev, next, key }) => this.factory.diff({
                prevState: prev,
                nextState: next,
                key,
            }),
        });
    }

    public applyBack({
        downOperation,
        nextState,
    }: {
        downOperation: ReadonlyDualKeyMap<TKey1, TKey2, DualKeyMapOperations.DualKeyMapDownOperationElementUnion<TServerState, TDownOperation>>;
        nextState: ReadonlyDualKeyMap<TKey1, TKey2, TServerState>;
    }) {
        return DualKeyMapOperations.applyBack({
            nextState,
            downOperation,
            innerApplyBack: params => this.factory.applyBack(params),
        });
    }

    public toServerState({
        clientState,
    }: {
        clientState: ReadonlyDualKeyMap<TKey1, TKey2, TClientState>;
    }): ReadonlyDualKeyMap<TKey1, TKey2, TServerState> {
        return clientState.map((value, key) => this.factory.toServerState({ key, clientState: value }));
    }
}

const dummyFirstKey = '';

const toDualKeyMap = <TKey, TValue>(source: ReadonlyMap<TKey, TValue>): ReadonlyDualKeyMap<typeof dummyFirstKey, TKey, TValue> => {
    const sourceMap = new Map<typeof dummyFirstKey, ReadonlyMap<TKey, TValue>>();
    sourceMap.set(dummyFirstKey, source);
    return new DualKeyMap<typeof dummyFirstKey, TKey, TValue>(sourceMap);
};

const toMap = <TKey, TValue>(source: ReadonlyDualKeyMap<typeof dummyFirstKey, TKey, TValue>): ReadonlyMap<TKey, TValue> => {
    return source.getByFirst(dummyFirstKey) ?? new Map();
};

export class MapTransformer<TKey, TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation> {
    private readonly core: DualKeyMapTransformer<typeof dummyFirstKey, TKey, TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation>;

    public constructor(factory: TransformerFactory<TKey, TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation>) {
        const cancelRemove = factory.protectedValuePolicy.cancelRemove;
        this.core = new DualKeyMapTransformer({
            composeLoose: params => factory.composeLoose({
                key: params.key.second,
                first: params.first,
                second: params.second,
            }),
            restore: params => factory.restore({
                key: params.key.second,
                nextState: params.nextState,
                downOperation: params.downOperation,
            }),
            transform: params => factory.transform({
                key: params.key.second,
                prevState: params.prevState,
                currentState: params.currentState,
                serverOperation: params.serverOperation,
                clientOperation: params.clientOperation,
            }),
            diff: params => factory.diff({
                key: params.key.second,
                prevState: params.prevState,
                nextState: params.nextState,
            }),
            applyBack: params => factory.applyBack({
                key: params.key.second,
                downOperation: params.downOperation,
                nextState: params.nextState,
            }),
            toServerState: params => factory.toServerState({
                key: params.key.second,
                clientState: params.clientState,
            }),
            protectedValuePolicy: cancelRemove === undefined ? {} : {
                cancelRemove: params => cancelRemove({ key: params.key.second, nextState: params.nextState })
            },
        });
    }

    public composeLoose({
        first,
        second,
    }: {
        first: ReadonlyMapDownOperation<TKey, TServerState, TDownOperation>;
        second: ReadonlyMapDownOperation<TKey, TServerState, TDownOperation>;
    }): Result<ReadonlyMapDownOperation<TKey, TServerState, TDownOperation> | undefined> {
        const dualKeyMap = this.core.composeLoose({
            first: toDualKeyMap(first),
            second: toDualKeyMap(second),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return ResultModule.ok(dualKeyMap.value === undefined ? undefined : toMap(dualKeyMap.value));
    }

    public restore({
        downOperation,
        nextState,
    }: {
        downOperation: ReadonlyMapDownOperation<TKey, TServerState, TDownOperation>;
        nextState: ReadonlyMap<TKey, TServerState>;
    }) {
        const dualKeyMap = this.core.restore({
            downOperation: toDualKeyMap(downOperation),
            nextState: toDualKeyMap(nextState),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return ResultModule.ok({
            prevState: toMap(dualKeyMap.value.prevState),
            twoWayOperation: toMap(dualKeyMap.value.twoWayOperation),
        });
    }

    public transform({
        prevState,
        currentState,
        serverOperation,
        clientOperation,
    }: {
        prevState: ReadonlyMap<TKey, TServerState>;
        currentState: ReadonlyMap<TKey, TServerState>;
        serverOperation: ReadonlyMap<TKey, DualKeyMapOperations.DualKeyMapTwoWayOperationElementUnion<TServerState, TTwoWayOperation>>;
        clientOperation: ReadonlyMap<TKey, DualKeyMapOperations.DualKeyMapUpOperationElementUnion<TClientState, TUpOperation>>;
    }): Result<ReadonlyMap<TKey, DualKeyMapOperations.DualKeyMapTwoWayOperationElementUnion<TServerState, TTwoWayOperation>>> {
        const dualKeyMap = this.core.transform({
            prevState: toDualKeyMap(prevState),
            currentState: toDualKeyMap(currentState),
            serverOperation: toDualKeyMap(serverOperation),
            clientOperation: toDualKeyMap(clientOperation),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return ResultModule.ok(toMap(dualKeyMap.value));
    }

    public restoreAndTransform({
        currentState,
        serverOperation,
        clientOperation,
    }: {
        currentState: ReadonlyMap<TKey, TServerState>;
        serverOperation: ReadonlyMap<TKey, DualKeyMapOperations.DualKeyMapDownOperationElementUnion<TServerState, TDownOperation>>;
        clientOperation: ReadonlyMap<TKey, DualKeyMapOperations.DualKeyMapUpOperationElementUnion<TClientState, TUpOperation>>;
    }): Result<ReadonlyMap<TKey, DualKeyMapOperations.DualKeyMapTwoWayOperationElementUnion<TServerState, TTwoWayOperation>>> {
        const dualKeyMap = this.core.restoreAndTransform({
            currentState: toDualKeyMap(currentState),
            serverOperation: toDualKeyMap(serverOperation),
            clientOperation: toDualKeyMap(clientOperation),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return ResultModule.ok(toMap(dualKeyMap.value));
    }

    public diff({
        prevState,
        nextState,
    }: {
        prevState: ReadonlyMap<TKey, TServerState>;
        nextState: ReadonlyMap<TKey, TServerState>;
    }) {
        const dualKeyMap = this.core.diff({
            prevState: toDualKeyMap(prevState),
            nextState: toDualKeyMap(nextState),
        });
        return toMap(dualKeyMap);
    }

    public applyBack({
        downOperation,
        nextState,
    }: {
        downOperation: ReadonlyMap<TKey, DualKeyMapOperations.DualKeyMapDownOperationElementUnion<TServerState, TDownOperation>>;
        nextState: ReadonlyMap<TKey, TServerState>;
    }) {
        const dualKeyMap = this.core.applyBack({
            downOperation: toDualKeyMap(downOperation),
            nextState: toDualKeyMap(nextState),
        });
        if (dualKeyMap.isError) {
            return dualKeyMap;
        }
        return ResultModule.ok(toMap(dualKeyMap.value));
    }

    public toServerState({
        clientState,
    }: {
        clientState: ReadonlyMap<TKey, TClientState>;
    }): ReadonlyMap<TKey, TServerState> {
        const dualKeyMap = this.core.toServerState({
            clientState: toDualKeyMap(clientState),
        });
        return toMap(dualKeyMap);
    }
}

export class ParamMapTransformer<TKey, TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation> {
    public constructor(private readonly factory: ParamMapTransformerFactory<TKey, TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation>) { }

    public compose(params: { first: ReadonlyMap<TKey, TDownOperation>; second: ReadonlyMap<TKey, TDownOperation> }): Result<ReadonlyMap<TKey, TDownOperation> | undefined> {
        return ParamMapOperations.composeDownOperation({
            ...params,
            innerCompose: params => this.factory.composeLoose(params),
        });
    }

    public restore({
        downOperation,
        nextState,
    }: {
        downOperation: ReadonlyMap<TKey, TDownOperation>;
        nextState: ReadonlyMap<TKey, TServerState>;
    }): Result<{ prevState: ReadonlyMap<TKey, TServerState>; twoWayOperation: ReadonlyMap<TKey, TTwoWayOperation> }> {
        return ParamMapOperations.restore({
            nextState,
            downOperation,
            innerRestore: params => {
                const result = this.factory.restore(params);
                if (result.isError) {
                    return result;
                }
                if (result.value.twoWayOperation === undefined) {
                    return ResultModule.ok(undefined);
                }
                return ResultModule.ok({
                    prevState: result.value.prevState,
                    twoWayOperation: result.value.twoWayOperation,
                });
            },
        });
    }

    public transform({
        prevState,
        currentState,
        serverOperation,
        clientOperation,
    }: {
        prevState: ReadonlyMap<TKey, TServerState>;
        currentState: ReadonlyMap<TKey, TServerState>;
        serverOperation: ReadonlyMap<TKey, TTwoWayOperation>;
        clientOperation: ReadonlyMap<TKey, TUpOperation>;
    }): Result<ReadonlyMap<TKey, TTwoWayOperation>> {
        return ParamMapOperations.transform({
            first: serverOperation,
            second: clientOperation,
            prevState: prevState,
            nextState: currentState,
            innerTransform: params => this.factory.transform({
                key: params.key,
                prevState: params.prevState ?? this.factory.createDefaultState({key: params.key}),
                currentState: params.nextState ?? this.factory.createDefaultState({ key: params.key }),
                serverOperation: params.first,
                clientOperation: params.second,
            }),
        });
    }

    public restoreAndTransform({
        currentState,
        serverOperation,
        clientOperation,
    }: {
        currentState: ReadonlyMap<TKey, TServerState>;
        serverOperation: ReadonlyMap<TKey, TDownOperation>;
        clientOperation: ReadonlyMap<TKey, TUpOperation>;
    }): Result<ReadonlyMap<TKey, TTwoWayOperation>> {
        const restoreResult = this.restore({
            nextState: currentState,
            downOperation: serverOperation,
        });
        if (restoreResult.isError) {
            return restoreResult;
        }

        return this.transform({
            serverOperation: restoreResult.value.twoWayOperation,
            clientOperation,
            prevState: restoreResult.value.prevState,
            currentState,
        });
    }

    public diff({
        prevState,
        nextState,
    }: {
        prevState: ReadonlyMap<TKey, TServerState>;
        nextState: ReadonlyMap<TKey, TServerState>;
    }) {
        return ParamMapOperations.diff({
            prev: prevState,
            next: nextState,
            innerDiff: ({ prev, next, key }) => this.factory.diff({
                prevState: prev ?? this.factory.createDefaultState({ key }),
                nextState: next ?? this.factory.createDefaultState({ key }),
                key,
            }),
        });
    }

    public applyBack({
        downOperation,
        nextState,
    }: {
        downOperation: ReadonlyMap<TKey, TDownOperation>;
        nextState: ReadonlyMap<TKey, TServerState>;
    }) {
        return ParamMapOperations.applyBack({
            nextState,
            downOperation,
            innerApplyBack: params => this.factory.applyBack(params),
        });
    }

    public toServerState({
        clientState,
    }: {
        clientState: ReadonlyMap<TKey, TClientState>;
    }): ReadonlyMap<TKey, TServerState> {
        return __(clientState).toMap(([key, value]) => ({
            key,
            value: this.factory.toServerState({ key, clientState: value }),
        }));
    }
}