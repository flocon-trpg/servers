import { Result, ResultModule } from '../../../@shared/Result';
import { ReplaceBooleanDownOperation, ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperation, ReplaceBooleanTwoWayOperationModule, ReplaceNumberDownOperation, ReplaceNumberDownOperationModule, ReplaceNumberTwoWayOperation, ReplaceNumberTwoWayOperationModule } from '../../Operations';
import * as $GraphQL from './graphql';
import * as $MikroORM from './mikro-orm';
import * as DualKeyMapOperations from '../../dualKeyMapOperations';
import { Collection } from '@mikro-orm/core';
import { CompositeKey, createStateMap, keyFactory, ReadonlyStateMap, StateMap } from '../../../@shared/StateMap';
import { RoomOp } from '../room/mikro-orm';
import { undefinedForAll } from '../../../utils/helpers';
import { CustomDualKeyMap, KeyFactory } from '../../../@shared/CustomDualKeyMap';
import { DualKeyMap, DualKeyMapSource } from '../../../@shared/DualKeyMap';

type FoobarStateType = {
    hoge: number;
    isPrivate: boolean;
}

type FoobarDownOperationType = {
    isPrivate?: ReplaceBooleanDownOperation;
    hoge?: ReplaceNumberDownOperation;
}

type FoobarTwoWayOperationType = {
    isPrivate?: ReplaceBooleanTwoWayOperation;
    hoge?: ReplaceNumberTwoWayOperation;
}

class FoobarState {
    private constructor(private readonly _object: FoobarStateType) {

    }

    public static createFromGraphQL(state: $GraphQL.FoobarValueState) {
        const result = new FoobarState(state);
        return result.clone();
    }

    public static createFromMikroORM(entity: $MikroORM.Foobar | $MikroORM.RemoveFoobarOp) {
        const entityObject: FoobarStateType = {
            isPrivate: entity.isPrivate,
            hoge: entity.hoge,
        };
        return new FoobarState(entityObject);
    }

    public static restore({ downOperation, nextState }: { downOperation?: FoobarDownOperation; nextState: FoobarState }): Result<RestoredFoobar> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredFoobar({ prevState: nextState, nextState }));
        }
        const prevState = nextState.clone();
        const twoWayOperationCore: FoobarTwoWayOperationType = {};

        if (downOperation.valueProps.isPrivate !== undefined) {
            prevState._object.isPrivate = downOperation.valueProps.isPrivate.oldValue;
            twoWayOperationCore.isPrivate = { ...downOperation.valueProps.isPrivate, newValue: nextState._object.isPrivate };
        }
        if (downOperation.valueProps.hoge !== undefined) {
            prevState._object.hoge = downOperation.valueProps.hoge.oldValue;
            twoWayOperationCore.hoge = { ...downOperation.valueProps.hoge, newValue: nextState._object.hoge };
        }

        return ResultModule.ok(new RestoredFoobar({ prevState, nextState, twoWayOperation: new FoobarTwoWayOperation({ valueProps: twoWayOperationCore }) }));
    }

    public get object(): Readonly<FoobarStateType> {
        return this._object;
    }

    public clone(): FoobarState {
        return new FoobarState({
            ...this._object,
        });
    }

    public applyBack(operation: FoobarDownOperation): FoobarState {
        const result = this.clone();
        if (operation.valueProps.isPrivate !== undefined) {
            result._object.isPrivate = operation.valueProps.isPrivate.oldValue;
        }
        if (operation.valueProps.hoge !== undefined) {
            result._object.hoge = operation.valueProps.hoge.oldValue;
        }
        return result;
    }

    private setToFoobarBase({
        foobarBase,
    }: {
        foobarBase: $MikroORM.FoobarBase;
    }) {
        foobarBase.isPrivate = this._object.isPrivate;
        foobarBase.hoge = this._object.hoge;
    }

    public toMikroORMState({
        createdBy,
        stateId,
    }: {
        createdBy: string;
        stateId: string;
    }): $MikroORM.Foobar {
        const result = new $MikroORM.Foobar({ ...this._object, stateId, createdBy });
        this.setToFoobarBase({ foobarBase: result });
        return result;
    }

    public toMikroORMRemoveOperation({
        createdBy,
        stateId,
    }: {
        createdBy: string;
        stateId: string;
    }): $MikroORM.RemoveFoobarOp {
        const result = new $MikroORM.RemoveFoobarOp({ ...this._object, stateId, createdBy });
        this.setToFoobarBase({ foobarBase: result });
        return result;
    }

    public toGraphQL({ id, createdBy, createdByMe }: { id: string; createdBy: string; createdByMe: boolean }): $GraphQL.FoobarState {
        // 全体がisPrivateのときの処理はtoGraphQLOperationで行われるため、ここでその判定を行う必要はない。個別の値（ここではhoge）がprivateになりうる場合、それらについては判定する必要がある。

        return {
            createdBy,
            id,
            value: {
                ...this.object,
            },
        };
    }
}

export class FoobarsState {
    public constructor(private readonly _readonlyStateMap: ReadonlyStateMap<FoobarState>) { }

    public static createFromMikroORM(source: ($MikroORM.Foobar | $MikroORM.RemoveFoobarOp)[]): FoobarsState {
        const core = createStateMap<FoobarState>();
        for (const elem of source) {
            core.set({ id: elem.stateId, createdBy: elem.createdBy }, FoobarState.createFromMikroORM(elem));
        }
        return new FoobarsState(core);
    }

    public static restore({ downOperation, nextState }: { downOperation?: FoobarsDownOperation; nextState: FoobarsState }): Result<RestoredFoobars> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredFoobars({ prevState: nextState, nextState }));
        }
        const restored = DualKeyMapOperations.restore({
            nextState: nextState.readonlyStateMap.dualKeyMap,
            downOperation: downOperation.readonlyStateMap,
            innerRestore: params => {
                const restored = FoobarState.restore(params);
                if (restored.isError) {
                    return restored;
                }
                return ResultModule.ok({ prevState: restored.value.prevState, twoWayOperation: restored.value.twoWayOperation });
            }
        });
        if (restored.isError) {
            return restored;
        }
        return ResultModule.ok(new RestoredFoobars({
            prevState: new FoobarsState(createStateMap(restored.value.prevState)),
            nextState: nextState,
            twoWayOperation: new FoobarsTwoWayOperation(restored.value.twoWayOperation),
        }));
    }

    public get readonlyStateMap(): ReadonlyStateMap<FoobarState> {
        return this._readonlyStateMap;
    }

    public clone(): FoobarsState {
        return new FoobarsState(this.readonlyStateMap.clone());
    }

    public toGraphQL({ deliverTo }: { deliverTo: string }): $GraphQL.FoobarState[] {
        return [...this._readonlyStateMap].flatMap(([key, state]) => {
            const result = state.toGraphQL({ id: key.id, createdBy: key.createdBy, createdByMe: key.createdBy === deliverTo });
            return result === undefined ? [] : [result];
        });
    }
}

class FoobarDownOperation {
    private constructor(private readonly object: FoobarDownOperationType) { }

    public static create(entity: $MikroORM.UpdateFoobarOp): Result<FoobarDownOperation> {
        const object: FoobarDownOperationType = {};

        object.isPrivate = entity.isPrivate === undefined ? undefined : { oldValue: entity.isPrivate };
        object.hoge = entity.hoge === undefined ? undefined : { oldValue: entity.hoge };

        return ResultModule.ok(new FoobarDownOperation(object));
    }

    public get valueProps(): Readonly<FoobarDownOperationType> {
        return this.object;
    }

    public compose(second: FoobarDownOperation): Result<FoobarDownOperation> {
        const valueProps: FoobarDownOperationType = {
            isPrivate: ReplaceBooleanDownOperationModule.compose(this.valueProps.isPrivate, second.valueProps.isPrivate),
            hoge: ReplaceNumberDownOperationModule.compose(this.valueProps.hoge, second.valueProps.hoge),
        };

        return ResultModule.ok(new FoobarDownOperation(valueProps));
    }
}

export class FoobarsDownOperation {
    private constructor(private readonly core: DualKeyMapOperations.DualKeyMapDownOperation<string, string, FoobarState, FoobarDownOperation>) { }

    public static async create({
        add,
        remove,
        update
    }: {
        add: Collection<$MikroORM.AddFoobarOp>;
        remove: Collection<$MikroORM.RemoveFoobarOp>;
        update: Collection<$MikroORM.UpdateFoobarOp>;
    }): Promise<Result<FoobarsDownOperation>> {
        const downOperation = await DualKeyMapOperations.createDownOperationFromMikroORM({
            toDualKey: state => ResultModule.ok({ first: state.createdBy, second: state.stateId }),
            add,
            remove,
            update,
            getState: async state => {
                const result = FoobarState.createFromMikroORM(state);
                return ResultModule.ok(result);
            },
            getOperation: async operation => {
                return FoobarDownOperation.create(operation);
            },
        });
        if (downOperation.isError) {
            return downOperation;
        }
        return ResultModule.ok(new FoobarsDownOperation(downOperation.value));
    }

    public compose(second: FoobarsDownOperation): Result<FoobarsDownOperation> {
        const composed = DualKeyMapOperations.composeDownOperation({
            first: this.core,
            second: second.core,
            innerApplyBack: ({ downOperation, nextState }) => {
                return ResultModule.ok(nextState.applyBack(downOperation));
            },
            innerCompose: ({ first, second }) => first.compose(second),
        });
        if (composed.isError) {
            return composed;
        }
        return ResultModule.ok(new FoobarsDownOperation(composed.value));
    }

    public get readonlyStateMap(): DualKeyMapOperations.ReadonlyDualKeyMapDownOperation<string, string, FoobarState, FoobarDownOperation> {
        return this.core;
    }
}

class FoobarTwoWayOperation {
    public constructor(private readonly params: { valueProps: FoobarTwoWayOperationType }) {

    }

    public get valueProps(): Readonly<FoobarTwoWayOperationType> {
        return this.params.valueProps;
    }

    public apply(entity: $MikroORM.Foobar) {
        if (this.params.valueProps.isPrivate !== undefined) {
            entity.isPrivate = this.params.valueProps.isPrivate.newValue;
        }
        if (this.params.valueProps.hoge !== undefined) {
            entity.hoge = this.params.valueProps.hoge.newValue;
        }
    }

    public toMikroORM({
        createdBy,
        stateId,
    }: {
        createdBy: string;
        stateId: string;
    }): $MikroORM.UpdateFoobarOp {
        const result = new $MikroORM.UpdateFoobarOp({ createdBy, stateId });

        if (this.valueProps.isPrivate !== undefined) {
            result.isPrivate = this.valueProps.isPrivate.oldValue;
        }
        if (this.valueProps.hoge !== undefined) {
            result.hoge = this.valueProps.hoge.oldValue;
        }

        return result;
    }
}

export class FoobarsTwoWayOperation {
    public constructor(private readonly operations: DualKeyMapOperations.ReadonlyDualKeyMapTwoWayOperation<string, string, FoobarState, FoobarTwoWayOperation>) {

    }

    public static createEmpty(): FoobarsTwoWayOperation {
        return new FoobarsTwoWayOperation(new DualKeyMap());
    }

    public get readonlyStateMap(): DualKeyMapOperations.ReadonlyDualKeyMapTwoWayOperation<string, string, FoobarState, FoobarTwoWayOperation> {
        return this.operations;
    }

    public get isId(): boolean {
        return this.readonlyStateMap.isEmpty;
    }

    public setToMikroORM(entity: RoomOp): void {
        this.readonlyStateMap.forEach((operation, key) => {
            if (operation.type === DualKeyMapOperations.update) {
                // const updateOperation = operation.operation.toMikroORM({
                //     createdBy: key.first,
                //     stateId: key.second,
                // });
                // entity.updateFoobarOps.add(updateOperation);
                return;
            }
            if (operation.operation.oldValue === undefined) {
                // const element = new $MikroORM.AddFoobarOp({ createdBy: key.first, stateId: key.second });
                // entity.addFoobarOps.add(element);
                return;
            }

            // const removeOperation = operation.operation.oldValue.toMikroORMRemoveOperation({
            //     createdBy: key.first,
            //     stateId: key.second,
            // });
            // entity.removeFoobarOps.add(removeOperation);
        });
    }

    public async apply({
        entity,
    }: {
        entity: Collection<$MikroORM.Foobar>;
    }): Promise<void> {
        await DualKeyMapOperations.apply({
            toDualKey: keyFactory.createDualKey,
            state: entity,
            operation: this.readonlyStateMap,
            create: async params => {
                return params.state.toMikroORMState({ createdBy: params.key.first, stateId: params.key.second });
            },
            update: async params => {
                params.operation.apply(params.state);
            },
            delete: async () => true,
        });
    }

    public toJSON(): string {
        return JSON.stringify(this.operations);
    }
}

class RestoredFoobar {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: FoobarState; nextState: FoobarState; twoWayOperation?: FoobarTwoWayOperation }) { }

    public transform({ clientOperation, createdByMe }: { clientOperation: $GraphQL.FoobarOperation; createdByMe: boolean }): Result<FoobarTwoWayOperation | undefined> {
        if (this.params.nextState.object.isPrivate && !createdByMe) {
            return ResultModule.ok(undefined);
        }

        const twoWayOperationCore: FoobarTwoWayOperationType = {};

        twoWayOperationCore.isPrivate = ReplaceBooleanTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.isPrivate,
            second: clientOperation.isPrivate,
            prevState: this.params.prevState.object.isPrivate,
        });
        twoWayOperationCore.hoge = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.hoge,
            second: clientOperation.hoge,
            prevState: this.params.prevState.object.hoge,
        });

        if (undefinedForAll(twoWayOperationCore)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(new FoobarTwoWayOperation({ valueProps: twoWayOperationCore }));
    }

    public get prevState(): FoobarState {
        return this.params.prevState;
    }

    public get nextState(): FoobarState {
        return this.params.nextState;
    }

    public get twoWayOperation(): FoobarTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }

    // prevStateとnextStateを必要としない場合、ここではなく代わりにFoobarOperationなどで定義してもよい。
    public toGraphQLOperation({ createdByMe }: { createdByMe: boolean }): $GraphQL.FoobarOperation | undefined {
        if (this.twoWayOperation === undefined) {
            return undefined;
        }
        return {
            ...this.twoWayOperation?.valueProps,
        };
    }
}

export class RestoredFoobars {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: FoobarsState; nextState: FoobarsState; twoWayOperation?: FoobarsTwoWayOperation }) { }

    public transform({ clientOperation, operatedBy }: { clientOperation: $GraphQL.FoobarsOperation; operatedBy: string }): Result<FoobarsTwoWayOperation> {
        const second = DualKeyMapOperations.createUpOperationFromGraphQL({
            replace: clientOperation.replace,
            update: clientOperation.update,
            getState: source => source.newValue,
            getOperation: source => source.operation,
            createDualKey: source => ResultModule.ok(keyFactory.createDualKey(source))
        });
        if (second.isError) {
            return second;
        }
        const transformed = DualKeyMapOperations.transform({
            first: this.params.twoWayOperation?.readonlyStateMap,
            second: second.value,
            prevState: this.params.prevState.readonlyStateMap.dualKeyMap,
            nextState: this.params.nextState.readonlyStateMap.dualKeyMap,
            innerTransform: params => {
                const restored = new RestoredFoobar({ ...params, twoWayOperation: params.first });
                return restored.transform({ clientOperation: params.second, createdByMe: operatedBy === params.key.first });
            },
            toServerState: clientState => {
                return FoobarState.createFromGraphQL(clientState);
            },
            protectedValuePolicy: {
                cancelRemove: ({ key, nextState }) => nextState.object.isPrivate && operatedBy !== key.first
            }
        });

        if (transformed.isError) {
            return transformed;
        }
        return ResultModule.ok(new FoobarsTwoWayOperation(transformed.value));
    }

    public get prevState(): FoobarsState {
        return this.params.prevState;
    }

    public get nextState(): FoobarsState {
        return this.params.nextState;
    }

    public get twoWayOperation(): FoobarsTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

// Make sure these:
// - apply(prevState, twoWayOperation.up) = nextState
// - apply(nextState, twoWayOperation.down) = prevState
export const toGraphQLOperation = (params: {
    prevState: FoobarsState;
    nextState: FoobarsState;
    twoWayOperation: FoobarsTwoWayOperation;
    createdByMe: boolean;
}): $GraphQL.FoobarsOperation => {
    return DualKeyMapOperations.toGraphQLWithState({
        source: params.twoWayOperation.readonlyStateMap,
        prevState: params.prevState.readonlyStateMap.dualKeyMap,
        nextState: params.nextState.readonlyStateMap.dualKeyMap,
        toReplaceOperation: ({ nextState, key }) => ({
            createdBy: key.first,
            id: key.second,
            newValue: nextState?.toGraphQL({ createdBy: key.first, id: key.second, createdByMe: params.createdByMe }).value
        }),
        toUpdateOperation: ({ prevState, nextState, operation, key }) => {
            const restored = new RestoredFoobar({ prevState, nextState, twoWayOperation: operation });
            const resultValue = restored.toGraphQLOperation({ createdByMe: params.createdByMe });
            if (resultValue === undefined) {
                return undefined;
            }
            return { createdBy: key.first, id: key.second, operation: resultValue };
        },
        isPrivate: state => !params.createdByMe && state.object.isPrivate,
    });
};