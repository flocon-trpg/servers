import { Result, ResultModule } from '../../../../@shared/Result';
import { ReplaceBooleanDownOperation, ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperation, ReplaceBooleanTwoWayOperationModule, ReplaceNullableBooleanDownOperation, ReplaceNullableBooleanDownOperationModule, ReplaceNullableBooleanTwoWayOperation, ReplaceNullableBooleanTwoWayOperationModule } from '../../../Operations';
import * as $GraphQL from './graphql';
import * as $MikroORM from './mikro-orm';
import * as ParamMapOperations from '../../../paramMapOperations';
import { Collection } from '@mikro-orm/core';
import { undefinedForAll } from '../../../../utils/helpers';
import { UpdateCharaOp } from '../mikro-orm';
import { isStrIndex100, StrIndex100 } from '../../../../@shared/indexes';

type BoolParamStateType = {
    isValuePrivate: boolean;
    value?: boolean;
}

type BoolParamDownOperationType = {
    isValuePrivate?: ReplaceBooleanDownOperation;
    value?: ReplaceNullableBooleanDownOperation;
}

type BoolParamTwoWayOperationType = {
    isValuePrivate?: ReplaceBooleanTwoWayOperation;
    value?: ReplaceNullableBooleanTwoWayOperation;
}

class BoolParamState {
    public constructor(private readonly _object: BoolParamStateType) {

    }

    public static createFromGraphQL(state: $GraphQL.BoolParamValueState) {
        const result = new BoolParamState(state);
        return result.clone();
    }

    public static createFromMikroORM(entity: $MikroORM.BoolParamBase) {
        const entityObject: BoolParamStateType = {
            isValuePrivate: entity.isValuePrivate,
            value: entity.value,
        };
        return new BoolParamState(entityObject);
    }

    public static restore({ downOperation, nextState }: { downOperation?: BoolParamDownOperation; nextState: BoolParamState }): Result<RestoredBoolParam> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredBoolParam({ prevState: nextState, nextState }));
        }
        const prevState = nextState.clone();
        const twoWayOperationCore: BoolParamTwoWayOperationType = {};

        if (downOperation.valueProps.isValuePrivate !== undefined) {
            prevState._object.isValuePrivate = downOperation.valueProps.isValuePrivate.oldValue;
            twoWayOperationCore.isValuePrivate = { ...downOperation.valueProps.isValuePrivate, newValue: nextState._object.isValuePrivate };
        }
        if (downOperation.valueProps.value !== undefined) {
            prevState._object.value = downOperation.valueProps.value.oldValue;
            twoWayOperationCore.value = { ...downOperation.valueProps.value, newValue: nextState._object.value };
        }

        return ResultModule.ok(new RestoredBoolParam({ prevState, nextState, twoWayOperation: new BoolParamTwoWayOperation({ valueProps: twoWayOperationCore }) }));
    }

    public get object(): Readonly<BoolParamStateType> {
        return this._object;
    }

    public clone(): BoolParamState {
        return new BoolParamState({
            ...this._object,
        });
    }

    public applyBack(operation: BoolParamDownOperation): BoolParamState {
        const result = this.clone();
        if (operation.valueProps.isValuePrivate !== undefined) {
            result._object.isValuePrivate = operation.valueProps.isValuePrivate.oldValue;
        }
        if (operation.valueProps.value !== undefined) {
            result._object.value = operation.valueProps.value.oldValue;
        }
        return result;
    }

    private setToBoolParamBase({
        numParamValueBase,
    }: {
        numParamValueBase: $MikroORM.BoolParamBase;
    }) {
        numParamValueBase.isValuePrivate = this._object.isValuePrivate;
        numParamValueBase.value = this._object.value;
    }

    public toMikroORMState({
        key,
    }: {
        key: string;
    }): $MikroORM.BoolParam {
        const result = new $MikroORM.BoolParam({ ...this._object, key });
        this.setToBoolParamBase({ numParamValueBase: result });
        return result;
    }

    public toGraphQL({ key, createdByMe }: { key: string; createdByMe: boolean }): $GraphQL.BoolParamState {
        return {
            key,
            value: {
                ...this.object,
                value: !createdByMe && this.object.isValuePrivate ? undefined/* (default value) */ : this.object.value,
            },
        };
    }
}

export class BoolParamsState {
    public constructor(private readonly _readonlyMap: ReadonlyMap<StrIndex100, BoolParamState>) { }

    public static createFromGraphQL(source: $GraphQL.BoolParamState[]): BoolParamsState {
        const core = new Map<StrIndex100, BoolParamState>();
        for (const elem of source) {
            const index = elem.key;
            if (!isStrIndex100(index)) {
                throw 'index must be "1", or "2", or ..., or "100"';
            }
            core.set(index, BoolParamState.createFromGraphQL(elem.value));
        }
        return new BoolParamsState(core);
    }

    public static createFromMikroORM(source: ($MikroORM.BoolParam | $MikroORM.RemovedBoolParam)[]): BoolParamsState {
        const core = new Map<StrIndex100, BoolParamState>();
        for (const elem of source) {
            const index = elem.key;
            if (!isStrIndex100(index)) {
                throw 'index must be "1", or "2", or ..., or "100"';
            }
            core.set(index, BoolParamState.createFromMikroORM(elem));
        }
        return new BoolParamsState(core);
    }

    public static restore({ downOperation, nextState }: { downOperation?: BoolParamsDownOperation; nextState: BoolParamsState }): Result<RestoredBoolParams> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredBoolParams({ prevState: nextState, nextState }));
        }
        const restored = ParamMapOperations.restore({
            nextState: nextState.readonlyMap,
            downOperation: downOperation.readonlyMap,
            innerRestore: params => {
                const restored = BoolParamState.restore(params);
                if (restored.isError) {
                    return restored;
                }
                if (restored.value.twoWayOperation === undefined) {
                    return ResultModule.ok(undefined);
                }
                return ResultModule.ok({ prevState: restored.value.prevState, twoWayOperation: restored.value.twoWayOperation });
            }
        });
        if (restored.isError) {
            return restored;
        }
        return ResultModule.ok(new RestoredBoolParams({
            prevState: new BoolParamsState(new Map(restored.value.prevState)),
            nextState: nextState,
            twoWayOperation: new BoolParamsTwoWayOperation(restored.value.twoWayOperation),
        }));
    }

    public get readonlyMap(): ReadonlyMap<StrIndex100, BoolParamState> {
        return this._readonlyMap;
    }

    public clone(): BoolParamsState {
        return new BoolParamsState(new Map(this.readonlyMap));
    }

    public toGraphQL({ createdByMe }: { createdByMe: boolean }): $GraphQL.BoolParamState[] {
        return [...this._readonlyMap].flatMap(([key, state]) => {
            const result = state.toGraphQL({ key: key, createdByMe });
            return result === undefined ? [] : [result];
        });
    }

    public applyBack(downOperation: BoolParamsDownOperation): BoolParamsState {
        const result = ParamMapOperations.applyBack({
            nextState: this.readonlyMap,
            downOperation: downOperation.readonlyMap,
            innerApplyBack: ({ nextState, downOperation }) => ResultModule.ok(nextState.applyBack(downOperation)),
        });
        if (result.isError) {
            throw result.isError;
        }
        return new BoolParamsState(result.value);
    }
}

class BoolParamDownOperation {
    private constructor(private readonly object: BoolParamDownOperationType) { }

    public static create(entity: $MikroORM.UpdateBoolParamOp): Result<BoolParamDownOperation> {
        const object: BoolParamDownOperationType = {};

        object.isValuePrivate = entity.isValuePrivate === undefined ? undefined : { oldValue: entity.isValuePrivate };
        object.value = entity.value;

        return ResultModule.ok(new BoolParamDownOperation(object));
    }

    public get valueProps(): Readonly<BoolParamDownOperationType> {
        return this.object;
    }

    public compose(second: BoolParamDownOperation): Result<BoolParamDownOperation> {
        const valueProps: BoolParamDownOperationType = {
            isValuePrivate: ReplaceBooleanDownOperationModule.compose(this.valueProps.isValuePrivate, second.valueProps.isValuePrivate),
            value: ReplaceNullableBooleanDownOperationModule.compose(this.valueProps.value, second.valueProps.value),
        };

        return ResultModule.ok(new BoolParamDownOperation(valueProps));
    }
}

export class BoolParamsDownOperation {
    private constructor(private readonly core: ReadonlyMap<StrIndex100, BoolParamDownOperation>) { }

    public static async create({
        update
    }: {
        update: Collection<$MikroORM.UpdateBoolParamOp>;
    }): Promise<Result<BoolParamsDownOperation>> {
        const downOperation = await ParamMapOperations.createDownOperationFromMikroORM({
            toKey: state => {
                const index = state.key;
                if (!isStrIndex100(index)) {
                    return ResultModule.error('index must be "1", or "2", or ..., or "5"');
                }
                return ResultModule.ok(index);
            },
            update,
            getOperation: async operation => {
                return BoolParamDownOperation.create(operation);
            },
        });
        if (downOperation.isError) {
            return downOperation;
        }
        return ResultModule.ok(new BoolParamsDownOperation(downOperation.value));
    }

    public compose(second: BoolParamsDownOperation): Result<BoolParamsDownOperation> {
        const composed = ParamMapOperations.composeDownOperation({
            first: this.core,
            second: second.core,
            innerCompose: ({ first, second }) => first.compose(second),
        });
        if (composed.isError) {
            return composed;
        }
        return ResultModule.ok(new BoolParamsDownOperation(composed.value));
    }

    public get readonlyMap(): ReadonlyMap<StrIndex100, BoolParamDownOperation> {
        return this.core;
    }
}

class BoolParamTwoWayOperation {
    public constructor(private readonly params: { valueProps: BoolParamTwoWayOperationType }) {

    }

    public get valueProps(): Readonly<BoolParamTwoWayOperationType> {
        return this.params.valueProps;
    }

    public apply(entity: $MikroORM.BoolParam) {
        if (this.params.valueProps.isValuePrivate !== undefined) {
            entity.isValuePrivate = this.params.valueProps.isValuePrivate.newValue;
        }
        if (this.params.valueProps.value !== undefined) {
            entity.value = this.params.valueProps.value.newValue;
        }
    }

    public toMikroORM({
        key,
    }: {
        key: string;
    }): $MikroORM.UpdateBoolParamOp {
        const result = new $MikroORM.UpdateBoolParamOp({ key });

        if (this.valueProps.isValuePrivate !== undefined) {
            result.isValuePrivate = this.valueProps.isValuePrivate.oldValue;
        }
        if (this.valueProps.value !== undefined) {
            result.value = this.valueProps.value;
        }

        return result;
    }

    public toGraphQL(createdByMe: boolean): $GraphQL.BoolParamOperation {
        const result: $GraphQL.BoolParamOperation = {
            isValuePrivate: this.valueProps.isValuePrivate,
            value: ReplaceNullableBooleanTwoWayOperationModule.toGraphQLOperation({
                valueOperation: this.valueProps.value,
                isValuePrivateOpeartion: createdByMe ? undefined : this.valueProps.isValuePrivate,
            }),
        };
        return result;
    }
}

export class BoolParamsTwoWayOperation {
    public constructor(private readonly operations: ReadonlyMap<StrIndex100, BoolParamTwoWayOperation>) {

    }

    public static createEmpty(): BoolParamsTwoWayOperation {
        return new BoolParamsTwoWayOperation(new Map());
    }

    public get readonlyMap(): ReadonlyMap<StrIndex100, BoolParamTwoWayOperation> {
        return this.operations;
    }

    public get readonlyMapAsStringKey(): ReadonlyMap<string, BoolParamTwoWayOperation> {
        return this.operations;
    }

    public get isId(): boolean {
        return this.readonlyMap.size === 0;
    }

    public setToMikroORM(entity: UpdateCharaOp): void {
        this.readonlyMap.forEach((operation, key) => {
            const updateOperation = operation.toMikroORM({
                key: key
            });
            entity.updateBoolParamOps.add(updateOperation);
        });
    }

    public async apply({
        entity,
    }: {
        entity: Collection<$MikroORM.BoolParam>;
    }): Promise<void> {
        await ParamMapOperations.apply({
            toKey: x => x.key,
            state: entity,
            operation: this.readonlyMapAsStringKey,
            create: async params => {
                const result = new $MikroORM.BoolParam({
                    key: params.key,
                    isValuePrivate: false,
                });
                params.operation.apply(result);
                return result;
            },
            update: async params => {
                params.operation.apply(params.state);
            },
        });
    }

    public toJSON(): string {
        return JSON.stringify(this.operations);
    }
}

class RestoredBoolParam {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: BoolParamState; nextState: BoolParamState; twoWayOperation?: BoolParamTwoWayOperation }) { }

    public transform({ clientOperation, createdByMe }: { clientOperation: $GraphQL.BoolParamOperation; createdByMe: boolean }): Result<BoolParamTwoWayOperation | undefined> {
        const twoWayOperationCore: BoolParamTwoWayOperationType = {};

        if (createdByMe) {
            twoWayOperationCore.isValuePrivate = ReplaceBooleanTwoWayOperationModule.transform({
                first: this.params.twoWayOperation?.valueProps.isValuePrivate,
                second: clientOperation.isValuePrivate,
                prevState: this.params.prevState.object.isValuePrivate,
            });
        }
        if (!this.params.nextState.object.isValuePrivate || createdByMe) {
            twoWayOperationCore.value = ReplaceNullableBooleanTwoWayOperationModule.transform({
                first: this.params.twoWayOperation?.valueProps.value,
                second: clientOperation.value,
                prevState: this.params.prevState.object.value,
            });
        }

        if (undefinedForAll(twoWayOperationCore)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(new BoolParamTwoWayOperation({ valueProps: twoWayOperationCore }));
    }

    public get prevState(): BoolParamState {
        return this.params.prevState;
    }

    public get nextState(): BoolParamState {
        return this.params.nextState;
    }

    public get twoWayOperation(): BoolParamTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

export class RestoredBoolParams {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: BoolParamsState; nextState: BoolParamsState; twoWayOperation?: BoolParamsTwoWayOperation }) { }

    public transform({ clientOperation, createdByMe }: { clientOperation: $GraphQL.BoolParamsOperation; createdByMe: boolean }): Result<BoolParamsTwoWayOperation> {
        const second = ParamMapOperations.createUpOperationFromGraphQL({
            update: clientOperation.update,
            getOperation: x => x.operation,
            createKey: x => {
                const index = x.key;
                if (!isStrIndex100(index)) {
                    throw 'index must be "1", or "2", or ..., or "100"';
                }
                return ResultModule.ok(index);
            },
        });
        if (second.isError) {
            return second;
        }
        const transformed = ParamMapOperations.transform({
            first: this.params.twoWayOperation?.readonlyMap,
            second: second.value,
            prevState: this.params.prevState.readonlyMap,
            nextState: this.params.nextState.readonlyMap,
            innerTransform: params => {
                const restored = new RestoredBoolParam({
                    ...params,
                    twoWayOperation: params.first,
                    prevState: params.prevState ?? new BoolParamState({ isValuePrivate: false }),
                    nextState: params.nextState ?? new BoolParamState({ isValuePrivate: false }),
                });
                return restored.transform({ clientOperation: params.second, createdByMe });
            },
        });

        if (transformed.isError) {
            return transformed;
        }
        return ResultModule.ok(new BoolParamsTwoWayOperation(transformed.value));
    }

    public get prevState(): BoolParamsState {
        return this.params.prevState;
    }

    public get nextState(): BoolParamsState {
        return this.params.nextState;
    }

    public get twoWayOperation(): BoolParamsTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

// Make sure these:
// - apply(prevState, twoWayOperation.up) = nextState
// - apply(nextState, twoWayOperation.down) = prevState
export const toGraphQLOperation = (params: {
    prevState: BoolParamsState;
    nextState: BoolParamsState;
    twoWayOperation: BoolParamsTwoWayOperation;
    createdByMe: boolean;
}): $GraphQL.BoolParamsOperation => {
    const update = ParamMapOperations.toGraphQLWithState({
        source: params.twoWayOperation.readonlyMap,
        prevState: params.prevState.readonlyMap,
        nextState: params.nextState.readonlyMap,
        toUpdateOperation: ({ operation, key }) => ({ key, operation: operation.toGraphQL(params.createdByMe) }),
    });
    return { update };
};