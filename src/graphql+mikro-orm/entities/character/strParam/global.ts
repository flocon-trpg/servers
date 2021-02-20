import { Result, ResultModule } from '../../../../@shared/Result';
import { ReplaceBooleanDownOperation, ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperation, ReplaceBooleanTwoWayOperationModule, ReplaceNullableBooleanDownOperation, ReplaceNullableBooleanDownOperationModule, ReplaceNullableBooleanTwoWayOperation, ReplaceNullableBooleanTwoWayOperationModule, TextDownOperation, TextDownOperationModule, TextTwoWayOperation, TextTwoWayOperationModule, TextUpOperationModule } from '../../../Operations';
import * as $GraphQL from './graphql';
import * as $MikroORM from './mikro-orm';
import * as ParamMapOperations from '../../../paramMapOperations';
import { Collection } from '@mikro-orm/core';
import { undefinedForAll } from '../../../../utils/helpers';
import { UpdateCharaOp } from '../mikro-orm';
import { isStrIndex100, StrIndex100 } from '../../../../@shared/indexes';

type StrParamStateType = {
    isValuePrivate: boolean;
    value: string;
}

type StrParamDownOperationType = {
    isValuePrivate?: ReplaceBooleanDownOperation;
    value?: TextDownOperation;
}

type StrParamTwoWayOperationType = {
    isValuePrivate?: ReplaceBooleanTwoWayOperation;
    value?: TextTwoWayOperation;
}

class StrParamState {
    public constructor(private readonly _object: StrParamStateType) {

    }

    public static createFromGraphQL(state: $GraphQL.StrParamValueState) {
        const result = new StrParamState(state);
        return result.clone();
    }

    public static createFromMikroORM(entity: $MikroORM.StrParamBase) {
        const entityObject: StrParamStateType = {
            isValuePrivate: entity.isValuePrivate,
            value: entity.value,
        };
        return new StrParamState(entityObject);
    }

    public static restore({ downOperation, nextState }: { downOperation?: StrParamDownOperation; nextState: StrParamState }): Result<RestoredStrParam> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredStrParam({ prevState: nextState, nextState }));
        }
        const prevState = nextState.clone();
        const twoWayOperationCore: StrParamTwoWayOperationType = {};

        if (downOperation.valueProps.isValuePrivate !== undefined) {
            prevState._object.isValuePrivate = downOperation.valueProps.isValuePrivate.oldValue;
            twoWayOperationCore.isValuePrivate = { ...downOperation.valueProps.isValuePrivate, newValue: nextState._object.isValuePrivate };
        }
        if (downOperation.valueProps.value !== undefined) {
            const result = TextDownOperationModule.applyBackAndRestore(nextState._object.value, downOperation.valueProps.value);
            if (result.isError) {
                return ResultModule.error(`TextDownOperationModule.applyBackAndRestore was failed: state: ${nextState._object.value}, operation: ${downOperation.valueProps.value}`);
            }
            prevState._object.value = result.value.prevState;
            twoWayOperationCore.value = result.value.restored;
        }

        return ResultModule.ok(new RestoredStrParam({ prevState, nextState, twoWayOperation: new StrParamTwoWayOperation({ valueProps: twoWayOperationCore }) }));
    }

    public get object(): Readonly<StrParamStateType> {
        return this._object;
    }

    public clone(): StrParamState {
        return new StrParamState({
            ...this._object,
        });
    }

    public applyBack(operation: StrParamDownOperation): StrParamState {
        const result = this.clone();
        if (operation.valueProps.isValuePrivate !== undefined) {
            result._object.isValuePrivate = operation.valueProps.isValuePrivate.oldValue;
        }
        if (operation.valueProps.value !== undefined) {
            const nextValue = TextDownOperationModule.applyBack(result._object.value, operation.valueProps.value);
            if (nextValue.isError) {
                throw `TextDownOperationModule.applyBack was failed: state: ${result._object.value}, operation: ${operation.valueProps.value}`;
            }
            result._object.value = nextValue.value;
        }
        return result;
    }

    public static diff({ prev, next }: { prev: StrParamState; next: StrParamState }): StrParamDownOperation | undefined {
        const resultType: StrParamDownOperationType = {};
        if (prev.object.isValuePrivate !== next.object.isValuePrivate) {
            resultType.isValuePrivate = { oldValue: prev.object.isValuePrivate };
        }
        if (prev.object.value !== next.object.value) {
            resultType.value = TextDownOperationModule.diff(prev.object.value, next.object.value);
        }

        const result = new StrParamDownOperation(resultType);
        if (result.isId) {
            return undefined;
        }
        return result;
    }

    private setToStrParamBase({
        numParamValueBase,
    }: {
        numParamValueBase: $MikroORM.StrParamBase;
    }) {
        numParamValueBase.isValuePrivate = this._object.isValuePrivate;
        numParamValueBase.value = this._object.value;
    }

    public toMikroORMState({
        key,
    }: {
        key: string;
    }): $MikroORM.StrParam {
        const result = new $MikroORM.StrParam({ ...this._object, key });
        this.setToStrParamBase({ numParamValueBase: result });
        return result;
    }

    public toGraphQL({ key, createdByMe }: { key: string; createdByMe: boolean }): $GraphQL.StrParamState {
        return {
            key,
            value: {
                ...this.object,
                value: !createdByMe && this.object.isValuePrivate ? ''/* (default value) */ : this.object.value,
            },
        };
    }
}

export class StrParamsState {
    public constructor(private readonly _readonlyMap: ReadonlyMap<StrIndex100, StrParamState>) { }

    public static createFromGraphQL(source: $GraphQL.StrParamState[]): StrParamsState {
        const core = new Map<StrIndex100, StrParamState>();
        for (const elem of source) {
            const index = elem.key;
            if (!isStrIndex100(index)) {
                throw 'index must be "1", or "2", or ..., or "100"';
            }
            core.set(index, StrParamState.createFromGraphQL(elem.value));
        }
        return new StrParamsState(core);
    }

    public static createFromMikroORM(source: ($MikroORM.StrParam | $MikroORM.RemovedStrParam)[]): StrParamsState {
        const core = new Map<StrIndex100, StrParamState>();
        for (const elem of source) {
            const index = elem.key;
            if (!isStrIndex100(index)) {
                throw 'index must be "1", or "2", or ..., or "100"';
            }
            core.set(index, StrParamState.createFromMikroORM(elem));
        }
        return new StrParamsState(core);
    }

    public static restore({ downOperation, nextState }: { downOperation?: StrParamsDownOperation; nextState: StrParamsState }): Result<RestoredStrParams> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredStrParams({ prevState: nextState, nextState }));
        }
        const restored = ParamMapOperations.restore({
            nextState: nextState.readonlyMap,
            downOperation: downOperation.readonlyMap,
            innerRestore: params => {
                const restored = StrParamState.restore(params);
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
        return ResultModule.ok(new RestoredStrParams({
            prevState: new StrParamsState(new Map(restored.value.prevState)),
            nextState: nextState,
            twoWayOperation: new StrParamsTwoWayOperation(restored.value.twoWayOperation),
        }));
    }

    public get readonlyMap(): ReadonlyMap<StrIndex100, StrParamState> {
        return this._readonlyMap;
    }

    public clone(): StrParamsState {
        return new StrParamsState(new Map(this.readonlyMap));
    }

    public toGraphQL({ createdByMe }: { createdByMe: boolean }): $GraphQL.StrParamState[] {
        return [...this._readonlyMap].flatMap(([key, state]) => {
            const result = state.toGraphQL({ key: key, createdByMe });
            return result === undefined ? [] : [result];
        });
    }

    public applyBack(downOperation: StrParamsDownOperation): StrParamsState {
        const result = ParamMapOperations.applyBack({
            nextState: this.readonlyMap,
            downOperation: downOperation.readonlyMap,
            innerApplyBack: ({ nextState, downOperation }) => ResultModule.ok(nextState.applyBack(downOperation)),
        });
        if (result.isError) {
            throw result.isError;
        }
        return new StrParamsState(result.value);
    }

    public static diff({ prev, next }: { prev: StrParamsState; next: StrParamsState }): StrParamsDownOperation {
        const result = ParamMapOperations.diff({
            prev: prev.readonlyMap,
            next: next.readonlyMap,
            innerDiff: ({ prev, next }) => StrParamState.diff({
                prev: prev ?? new StrParamState({ isValuePrivate: false, value: '' }),
                next: next ?? new StrParamState({ isValuePrivate: false, value: '' }),
            }),
        });
        return new StrParamsDownOperation(result);
    }
}

class StrParamDownOperation {
    public constructor(private readonly object: StrParamDownOperationType) { }

    public static create(entity: $MikroORM.UpdateStrParamOp): Result<StrParamDownOperation> {
        const object: StrParamDownOperationType = {};

        object.isValuePrivate = entity.isValuePrivate === undefined ? undefined : { oldValue: entity.isValuePrivate };
        object.value = TextDownOperationModule.ofUnitAndValidate(entity.value);

        return ResultModule.ok(new StrParamDownOperation(object));
    }

    public get isId() {
        return undefinedForAll(this.object);
    }

    public get valueProps(): Readonly<StrParamDownOperationType> {
        return this.object;
    }

    public compose(second: StrParamDownOperation): Result<StrParamDownOperation> {
        const valueProps: StrParamDownOperationType = {
            isValuePrivate: ReplaceBooleanDownOperationModule.compose(this.valueProps.isValuePrivate, second.valueProps.isValuePrivate),
            value: TextDownOperationModule.compose(this.valueProps.value, second.valueProps.value),
        };

        return ResultModule.ok(new StrParamDownOperation(valueProps));
    }
}

export class StrParamsDownOperation {
    public constructor(private readonly core: ReadonlyMap<StrIndex100, StrParamDownOperation>) { }

    public static async create({
        update
    }: {
        update: Collection<$MikroORM.UpdateStrParamOp>;
    }): Promise<Result<StrParamsDownOperation>> {
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
                return StrParamDownOperation.create(operation);
            },
        });
        if (downOperation.isError) {
            return downOperation;
        }
        return ResultModule.ok(new StrParamsDownOperation(downOperation.value));
    }

    public compose(second: StrParamsDownOperation): Result<StrParamsDownOperation> {
        const composed = ParamMapOperations.composeDownOperation({
            first: this.core,
            second: second.core,
            innerCompose: ({ first, second }) => first.compose(second),
        });
        if (composed.isError) {
            return composed;
        }
        return ResultModule.ok(new StrParamsDownOperation(composed.value));
    }

    public get readonlyMap(): ReadonlyMap<StrIndex100, StrParamDownOperation> {
        return this.core;
    }
}

class StrParamTwoWayOperation {
    public constructor(private readonly params: { valueProps: StrParamTwoWayOperationType }) {

    }

    public get valueProps(): Readonly<StrParamTwoWayOperationType> {
        return this.params.valueProps;
    }

    public apply(entity: $MikroORM.StrParam) {
        if (this.params.valueProps.isValuePrivate !== undefined) {
            entity.isValuePrivate = this.params.valueProps.isValuePrivate.newValue;
        }
        if (this.params.valueProps.value !== undefined) {
            const newValue = TextTwoWayOperationModule.apply(entity.value, this.params.valueProps.value);
            if (newValue.isError) {
                throw newValue.error;
            }
            entity.value = newValue.value;
        }
    }

    public toMikroORM({
        key,
    }: {
        key: string;
    }): $MikroORM.UpdateStrParamOp {
        const result = new $MikroORM.UpdateStrParamOp({ key });

        if (this.valueProps.isValuePrivate !== undefined) {
            result.isValuePrivate = this.valueProps.isValuePrivate.oldValue;
        }
        if (this.valueProps.value !== undefined) {
            result.value = TextTwoWayOperationModule.toDownUnit(this.valueProps.value);
        }

        return result;
    }
}

export class StrParamsTwoWayOperation {
    public constructor(private readonly operations: ReadonlyMap<StrIndex100, StrParamTwoWayOperation>) {

    }

    public static createEmpty(): StrParamsTwoWayOperation {
        return new StrParamsTwoWayOperation(new Map());
    }

    public get readonlyMap(): ReadonlyMap<StrIndex100, StrParamTwoWayOperation> {
        return this.operations;
    }

    public get readonlyMapAsStringKey(): ReadonlyMap<string, StrParamTwoWayOperation> {
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
            entity.updateStrParamOps.add(updateOperation);
        });
    }

    public async apply({
        entity,
    }: {
        entity: Collection<$MikroORM.StrParam>;
    }): Promise<void> {
        await ParamMapOperations.apply({
            toKey: x => x.key,
            state: entity,
            operation: this.readonlyMapAsStringKey,
            create: async params => {
                const result = new $MikroORM.StrParam({
                    key: params.key,
                    isValuePrivate: false,
                    value: '',
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

class RestoredStrParam {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: StrParamState; nextState: StrParamState; twoWayOperation?: StrParamTwoWayOperation }) { }

    public transform({ clientOperation, createdByMe }: { clientOperation: $GraphQL.StrParamOperation; createdByMe: boolean }): Result<StrParamTwoWayOperation | undefined> {
        const twoWayOperationCore: StrParamTwoWayOperationType = {};

        if (createdByMe) {
            twoWayOperationCore.isValuePrivate = ReplaceBooleanTwoWayOperationModule.transform({
                first: this.params.twoWayOperation?.valueProps.isValuePrivate,
                second: clientOperation.isValuePrivate,
                prevState: this.params.prevState.object.isValuePrivate,
            });
        }
        if (!this.params.nextState.object.isValuePrivate || createdByMe) {
            const valueFirst = this.params.twoWayOperation?.valueProps.value;
            const valueSecond = TextUpOperationModule.ofUnit(clientOperation.value);
            const value = TextTwoWayOperationModule.transform({
                first: valueFirst,
                second: valueSecond,
                prevState: this.params.prevState.object.value,
            });
            if (value.isError) {
                return ResultModule.error(`Invalid TextOperation: first: ${valueFirst}, second: ${valueSecond}`);
            }
            twoWayOperationCore.value = value.value.secondPrime;
        }

        if (undefinedForAll(twoWayOperationCore)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(new StrParamTwoWayOperation({ valueProps: twoWayOperationCore }));
    }

    public get prevState(): StrParamState {
        return this.params.prevState;
    }

    public get nextState(): StrParamState {
        return this.params.nextState;
    }

    public get twoWayOperation(): StrParamTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }

    public toGraphQLOperation(createdByMe: boolean): $GraphQL.StrParamOperation {
        const value = TextTwoWayOperationModule.toGraphQLOperation({
            valueOperation: {
                oldValue: this.prevState.object.value,
                newValue: this.nextState.object.value,
                operation: this.twoWayOperation?.valueProps.value,
            },
            isValuePrivateOperation: createdByMe ? undefined : this.twoWayOperation?.valueProps.isValuePrivate,
        });
        const result: $GraphQL.StrParamOperation = {
            isValuePrivate: this.twoWayOperation?.valueProps.isValuePrivate,
            value: value === undefined ? undefined : TextTwoWayOperationModule.toUpUnit(value),
        };
        return result;
    }
}

export class RestoredStrParams {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: StrParamsState; nextState: StrParamsState; twoWayOperation?: StrParamsTwoWayOperation }) { }

    public transform({ clientOperation, createdByMe }: { clientOperation: $GraphQL.StrParamsOperation; createdByMe: boolean }): Result<StrParamsTwoWayOperation> {
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
                const restored = new RestoredStrParam({
                    ...params,
                    twoWayOperation: params.first,
                    prevState: params.prevState ?? new StrParamState({ value: '', isValuePrivate: false }),
                    nextState: params.nextState ?? new StrParamState({ value: '', isValuePrivate: false }),
                });
                return restored.transform({ clientOperation: params.second, createdByMe });
            },
        });

        if (transformed.isError) {
            return transformed;
        }
        return ResultModule.ok(new StrParamsTwoWayOperation(transformed.value));
    }

    public get prevState(): StrParamsState {
        return this.params.prevState;
    }

    public get nextState(): StrParamsState {
        return this.params.nextState;
    }

    public get twoWayOperation(): StrParamsTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

// Make sure these:
// - apply(prevState, twoWayOperation.up) = nextState
// - apply(nextState, twoWayOperation.down) = prevState
export const toGraphQLOperation = (params: {
    prevState: StrParamsState;
    nextState: StrParamsState;
    twoWayOperation: StrParamsTwoWayOperation;
    createdByMe: boolean;
}): $GraphQL.StrParamsOperation => {
    const update = ParamMapOperations.toGraphQLWithState({
        source: params.twoWayOperation.readonlyMap,
        prevState: params.prevState.readonlyMap,
        nextState: params.nextState.readonlyMap,
        toUpdateOperation: ({ prevState, nextState, operation, key }) => {
            const restored = new RestoredStrParam({ prevState, nextState, twoWayOperation: operation });
            const result = restored.toGraphQLOperation(params.createdByMe);
            if (result === undefined) {
                return undefined;
            }
            return { key, operation: result };
        },
        defaultState: new StrParamState({ isValuePrivate: false, value: '' }),
    });
    return { update };
};