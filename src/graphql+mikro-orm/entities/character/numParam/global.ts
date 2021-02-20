import { Result, ResultModule } from '../../../../@shared/Result';
import { ReplaceBooleanDownOperation, ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperation, ReplaceBooleanTwoWayOperationModule, ReplaceNullableBooleanDownOperation, ReplaceNullableBooleanDownOperationModule, ReplaceNullableBooleanTwoWayOperation, ReplaceNullableBooleanTwoWayOperationModule, ReplaceNullableNumberDownOperation, ReplaceNullableNumberDownOperationModule, ReplaceNullableNumberTwoWayOperation, ReplaceNullableNumberTwoWayOperationModule } from '../../../Operations';
import * as $GraphQL from './graphql';
import * as $MikroORM from './mikro-orm';
import * as ParamMapOperations from '../../../paramMapOperations';
import { Collection } from '@mikro-orm/core';
import { undefinedForAll } from '../../../../utils/helpers';
import { UpdateCharaOp } from '../mikro-orm';
import { isStrIndex100, StrIndex100 } from '../../../../@shared/indexes';

type NumParamStateType = {
    isValuePrivate: boolean;
    value?: number;
}

type NumParamDownOperationType = {
    isValuePrivate?: ReplaceBooleanDownOperation;
    value?: ReplaceNullableNumberDownOperation;
}

type NumParamTwoWayOperationType = {
    isValuePrivate?: ReplaceBooleanTwoWayOperation;
    value?: ReplaceNullableNumberTwoWayOperation;
}

class NumParamState {
    public constructor(private readonly _object: NumParamStateType) {

    }

    public static createFromGraphQL(state: $GraphQL.NumParamValueState) {
        const result = new NumParamState(state);
        return result.clone();
    }

    public static createFromMikroORM(entity: $MikroORM.NumParamBase) {
        const entityObject: NumParamStateType = {
            isValuePrivate: entity.isValuePrivate,
            value: entity.value,
        };
        return new NumParamState(entityObject);
    }

    public static restore({ downOperation, nextState }: { downOperation?: NumParamDownOperation; nextState: NumParamState }): Result<RestoredNumParam> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredNumParam({ prevState: nextState, nextState }));
        }
        const prevState = nextState.clone();
        const twoWayOperationCore: NumParamTwoWayOperationType = {};

        if (downOperation.valueProps.isValuePrivate !== undefined) {
            prevState._object.isValuePrivate = downOperation.valueProps.isValuePrivate.oldValue;
            twoWayOperationCore.isValuePrivate = { ...downOperation.valueProps.isValuePrivate, newValue: nextState._object.isValuePrivate };
        }
        if (downOperation.valueProps.value !== undefined) {
            prevState._object.value = downOperation.valueProps.value.oldValue ?? undefined;
            twoWayOperationCore.value = { oldValue: downOperation.valueProps.value.oldValue ?? undefined, newValue: nextState._object.value };
        }

        return ResultModule.ok(new RestoredNumParam({ prevState, nextState, twoWayOperation: new NumParamTwoWayOperation({ valueProps: twoWayOperationCore }) }));
    }

    public get object(): Readonly<NumParamStateType> {
        return this._object;
    }

    public clone(): NumParamState {
        return new NumParamState({
            ...this._object,
        });
    }

    public applyBack(operation: NumParamDownOperation): NumParamState {
        const result = this.clone();
        if (operation.valueProps.isValuePrivate !== undefined) {
            result._object.isValuePrivate = operation.valueProps.isValuePrivate.oldValue;
        }
        if (operation.valueProps.value !== undefined) {
            result._object.value = operation.valueProps.value.oldValue ?? undefined;
        }
        return result;
    }

    public static diff({ prev, next }: { prev: NumParamState; next: NumParamState }): NumParamDownOperation | undefined {
        const resultType: NumParamDownOperationType = {};
        if (prev.object.isValuePrivate !== next.object.isValuePrivate) {
            resultType.isValuePrivate = { oldValue: prev.object.isValuePrivate };
        }
        if (prev.object.value !== next.object.value) {
            resultType.value = { oldValue: prev.object.value };
        }
        
        const result = new NumParamDownOperation(resultType);
        if (result.isId) {
            return undefined;
        }
        return result;
    }

    public toGraphQL({ key, createdByMe }: { key: string; createdByMe: boolean }): $GraphQL.NumParamState {
        return {
            key,
            value: {
                ...this.object,
                value: !createdByMe && this.object.isValuePrivate ? undefined/* (default value) */ : this.object.value,
            },
        };
    }
}

export class NumParamsState {
    public constructor(private readonly _readonlyMap: ReadonlyMap<StrIndex100, NumParamState>) { }

    public static createFromGraphQL(source: $GraphQL.NumParamState[]): NumParamsState {
        const core = new Map<StrIndex100, NumParamState>();
        for (const elem of source) {
            const index = elem.key;
            if (!isStrIndex100(index)) {
                throw 'index must be "1", or "2", or ..., or "100"';
            }
            core.set(index, NumParamState.createFromGraphQL(elem.value));
        }
        return new NumParamsState(core);
    }

    public static createFromMikroORM(source: ($MikroORM.NumParam | $MikroORM.RemovedNumParam | $MikroORM.NumMaxParam | $MikroORM.RemovedNumMaxParam)[]): NumParamsState {
        const core = new Map<StrIndex100, NumParamState>();
        for (const elem of source) {
            const index = elem.key;
            if (!isStrIndex100(index)) {
                throw 'index must be "1", or "2", or ..., or "100"';
            }
            core.set(index, NumParamState.createFromMikroORM(elem));
        }
        return new NumParamsState(core);
    }

    public static restore({ downOperation, nextState }: { downOperation?: NumParamsDownOperation; nextState: NumParamsState }): Result<RestoredNumParams> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredNumParams({ prevState: nextState, nextState }));
        }
        const restored = ParamMapOperations.restore({
            nextState: nextState.readonlyMap,
            downOperation: downOperation.readonlyMap,
            innerRestore: params => {
                const restored = NumParamState.restore(params);
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
        return ResultModule.ok(new RestoredNumParams({
            prevState: new NumParamsState(new Map(restored.value.prevState)),
            nextState: nextState,
            twoWayOperation: new NumParamsTwoWayOperation(restored.value.twoWayOperation),
        }));
    }

    public get readonlyMap(): ReadonlyMap<StrIndex100, NumParamState> {
        return this._readonlyMap;
    }

    public clone(): NumParamsState {
        return new NumParamsState(new Map(this.readonlyMap));
    }

    public toGraphQL({ createdByMe }: { createdByMe: boolean }): $GraphQL.NumParamState[] {
        return [...this._readonlyMap].flatMap(([key, state]) => {
            const result = state.toGraphQL({ key: key, createdByMe });
            return result === undefined ? [] : [result];
        });
    }

    public applyBack(downOperation: NumParamsDownOperation): NumParamsState {
        const result = ParamMapOperations.applyBack({
            nextState: this.readonlyMap,
            downOperation: downOperation.readonlyMap,
            innerApplyBack: ({ nextState, downOperation }) => ResultModule.ok(nextState.applyBack(downOperation)),
        });
        if (result.isError) {
            throw result.isError;
        }
        return new NumParamsState(result.value);
    }

    public static diff({ prev, next }: { prev: NumParamsState; next: NumParamsState }): NumParamsDownOperation {
        const result = ParamMapOperations.diff({
            prev: prev.readonlyMap,
            next: next.readonlyMap,
            innerDiff: ({ prev, next }) => NumParamState.diff({
                prev: prev ?? new NumParamState({ isValuePrivate: false }),
                next: next ?? new NumParamState({ isValuePrivate: false }),
            }),
        });
        return new NumParamsDownOperation(result);
    }
}

class NumParamDownOperation {
    public constructor(private readonly object: NumParamDownOperationType) { }

    public static create(entity: $MikroORM.UpdateNumParamOp): Result<NumParamDownOperation> {
        const object: NumParamDownOperationType = {};

        object.isValuePrivate = entity.isValuePrivate === undefined ? undefined : { oldValue: entity.isValuePrivate };
        object.value = entity.value;

        return ResultModule.ok(new NumParamDownOperation(object));
    }

    public get isId() {
        return undefinedForAll(this.object);
    }
    
    public get valueProps(): Readonly<NumParamDownOperationType> {
        return this.object;
    }

    public compose(second: NumParamDownOperation): Result<NumParamDownOperation> {
        const valueProps: NumParamDownOperationType = {
            isValuePrivate: ReplaceBooleanDownOperationModule.compose(this.valueProps.isValuePrivate, second.valueProps.isValuePrivate),
            value: ReplaceNullableNumberDownOperationModule.compose(this.valueProps.value, second.valueProps.value),
        };

        return ResultModule.ok(new NumParamDownOperation(valueProps));
    }
}

export class NumParamsDownOperation {
    public constructor(private readonly core: ReadonlyMap<StrIndex100, NumParamDownOperation>) { }

    public static async create({
        update
    }: {
        update: Collection<$MikroORM.UpdateNumParamOp | $MikroORM.UpdateNumMaxParamOp>;
    }): Promise<Result<NumParamsDownOperation>> {
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
                return NumParamDownOperation.create(operation);
            },
        });
        if (downOperation.isError) {
            return downOperation;
        }
        return ResultModule.ok(new NumParamsDownOperation(downOperation.value));
    }

    public compose(second: NumParamsDownOperation): Result<NumParamsDownOperation> {
        const composed = ParamMapOperations.composeDownOperation({
            first: this.core,
            second: second.core,
            innerCompose: ({ first, second }) => first.compose(second),
        });
        if (composed.isError) {
            return composed;
        }
        return ResultModule.ok(new NumParamsDownOperation(composed.value));
    }

    public get readonlyMap(): ReadonlyMap<StrIndex100, NumParamDownOperation> {
        return this.core;
    }
}

class NumParamTwoWayOperation {
    public constructor(private readonly params: { valueProps: NumParamTwoWayOperationType }) {

    }

    public get valueProps(): Readonly<NumParamTwoWayOperationType> {
        return this.params.valueProps;
    }

    public apply(entity: $MikroORM.NumParamBase) {
        if (this.params.valueProps.isValuePrivate !== undefined) {
            entity.isValuePrivate = this.params.valueProps.isValuePrivate.newValue;
        }
        if (this.params.valueProps.value !== undefined) {
            entity.value = this.params.valueProps.value.newValue;
        }
    }

    private setToMikroORMBase(target: $MikroORM.UpdateNumParamOp | $MikroORM.UpdateNumMaxParamOp) {
        if (this.valueProps.isValuePrivate !== undefined) {
            target.isValuePrivate = this.valueProps.isValuePrivate.oldValue;
        }
        if (this.valueProps.value !== undefined) {
            target.value = this.valueProps.value;
        }
    }

    public toNumParamMikroORM({
        key,
    }: {
        key: string;
    }): $MikroORM.UpdateNumParamOp {
        const result = new $MikroORM.UpdateNumParamOp({ key });

        this.setToMikroORMBase(result);

        return result;
    }

    public toNumMaxParamMikroORM({
        key,
    }: {
        key: string;
    }): $MikroORM.UpdateNumParamOp {
        const result = new $MikroORM.UpdateNumMaxParamOp({ key });

        this.setToMikroORMBase(result);

        return result;
    }

    public toGraphQL(createdByMe: boolean): $GraphQL.NumParamOperation {
        const result: $GraphQL.NumParamOperation = {
            isValuePrivate: this.valueProps.isValuePrivate,
            value: ReplaceNullableNumberTwoWayOperationModule.toGraphQLOperation({
                valueOperation: this.valueProps.value,
                isValuePrivateOpeartion: createdByMe ? undefined : this.valueProps.isValuePrivate,
            }),
        };
        return result;
    }
}

export class NumParamsTwoWayOperation {
    public constructor(private readonly operations: ReadonlyMap<StrIndex100, NumParamTwoWayOperation>) {

    }

    public static createEmpty(): NumParamsTwoWayOperation {
        return new NumParamsTwoWayOperation(new Map());
    }

    public get readonlyMap(): ReadonlyMap<StrIndex100, NumParamTwoWayOperation> {
        return this.operations;
    }

    public get readonlyMapAsStringKey(): ReadonlyMap<string, NumParamTwoWayOperation> {
        return this.operations;
    }

    public get isId(): boolean {
        return this.readonlyMap.size === 0;
    }

    public setToMikroORM(entity: UpdateCharaOp): void {
        this.readonlyMap.forEach((operation, key) => {
            const updateOperation = operation.toNumParamMikroORM({
                key: key
            });
            entity.updateNumParamOps.add(updateOperation);
        });
    }

    public setMaxValueToMikroORM(entity: UpdateCharaOp): void {
        this.readonlyMap.forEach((operation, key) => {
            const updateOperation = operation.toNumMaxParamMikroORM({
                key: key
            });
            entity.updateNumMaxParamOps.add(updateOperation);
        });
    }

    public async apply({
        entity,
    }: {
        entity: Collection<$MikroORM.NumParam>;
    }): Promise<void> {
        await ParamMapOperations.apply({
            toKey: x => x.key,
            state: entity,
            operation: this.readonlyMapAsStringKey,
            create: async params => {
                const result = new $MikroORM.NumParam({
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

class RestoredNumParam {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: NumParamState; nextState: NumParamState; twoWayOperation?: NumParamTwoWayOperation }) { }

    public transform({ clientOperation, createdByMe }: { clientOperation: $GraphQL.NumParamOperation; createdByMe: boolean }): Result<NumParamTwoWayOperation | undefined> {
        const twoWayOperationCore: NumParamTwoWayOperationType = {};

        if (createdByMe) {
            twoWayOperationCore.isValuePrivate = ReplaceBooleanTwoWayOperationModule.transform({
                first: this.params.twoWayOperation?.valueProps.isValuePrivate,
                second: clientOperation.isValuePrivate,
                prevState: this.params.prevState.object.isValuePrivate,
            });
        }
        if (!this.params.nextState.object.isValuePrivate || createdByMe) {
            twoWayOperationCore.value = ReplaceNullableNumberTwoWayOperationModule.transform({
                first: this.params.twoWayOperation?.valueProps.value,
                second: clientOperation.value === undefined ? undefined : { newValue: clientOperation.value.newValue },
                prevState: this.params.prevState.object.value,
            });
        }

        if (undefinedForAll(twoWayOperationCore)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(new NumParamTwoWayOperation({ valueProps: twoWayOperationCore }));
    }

    public get prevState(): NumParamState {
        return this.params.prevState;
    }

    public get nextState(): NumParamState {
        return this.params.nextState;
    }

    public get twoWayOperation(): NumParamTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

export class RestoredNumParams {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: NumParamsState; nextState: NumParamsState; twoWayOperation?: NumParamsTwoWayOperation }) { }

    public transform({ clientOperation, createdByMe }: { clientOperation: $GraphQL.NumParamsOperation; createdByMe: boolean }): Result<NumParamsTwoWayOperation> {
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
                const restored = new RestoredNumParam({
                    ...params,
                    twoWayOperation: params.first,
                    prevState: params.prevState ?? new NumParamState({ isValuePrivate: false }),
                    nextState: params.nextState ?? new NumParamState({ isValuePrivate: false }),
                });
                return restored.transform({ clientOperation: params.second, createdByMe });
            },
        });

        if (transformed.isError) {
            return transformed;
        }
        return ResultModule.ok(new NumParamsTwoWayOperation(transformed.value));
    }

    public get prevState(): NumParamsState {
        return this.params.prevState;
    }

    public get nextState(): NumParamsState {
        return this.params.nextState;
    }

    public get twoWayOperation(): NumParamsTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

// Make sure these:
// - apply(prevState, twoWayOperation.up) = nextState
// - apply(nextState, twoWayOperation.down) = prevState
export const toGraphQLOperation = (params: {
    prevState: NumParamsState;
    nextState: NumParamsState;
    twoWayOperation: NumParamsTwoWayOperation;
    createdByMe: boolean;
}): $GraphQL.NumParamsOperation => {
    const update = ParamMapOperations.toGraphQLWithState({
        source: params.twoWayOperation.readonlyMap,
        prevState: params.prevState.readonlyMap,
        nextState: params.nextState.readonlyMap,
        toUpdateOperation: ({ operation, key }) => ({ key, operation: operation.toGraphQL(params.createdByMe) }),
        defaultState: new NumParamState({ isValuePrivate: false }),
    });
    return { update };
};