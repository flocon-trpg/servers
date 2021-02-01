import { Result, ResultModule } from '../../../../@shared/Result';
import { ReplaceStringDownOperation, ReplaceStringDownOperationModule, ReplaceStringTwoWayOperation, ReplaceStringTwoWayOperationModule } from '../../../Operations';
import * as $GraphQL from './graphql';
import * as $MikroORM from './mikro-orm';
import * as DualKeyMapOperations from '../../../dualKeyMapOperations';
import { Collection } from '@mikro-orm/core';
import { RoomOp } from '../../room/mikro-orm';
import { undefinedForAll } from '../../../../utils/helpers';
import { RoomParameterNameType } from '../../../../enums/RoomParameterNameType';
import { CustomDualKeyMap, KeyFactory, ReadonlyCustomDualKeyMap } from '../../../../@shared/CustomDualKeyMap';
import { DualKeyMap, DualKeyMapSource } from '../../../../@shared/DualKeyMap';
import { isStrIndex100, StrIndex100 } from '../../../../@shared/indexes';

type ParamNameStateType = {
    name: string;
}

type ParamNameDownOperationType = {
    name?: ReplaceStringDownOperation;
}

type ParamNameTwoWayOperationType = {
    name?: ReplaceStringTwoWayOperation;
}

type Key = {
    key: StrIndex100;
    type: RoomParameterNameType;
}

const keyFactory: KeyFactory<Key, RoomParameterNameType, StrIndex100> = {
    createDualKey: key => ({ first: key.type, second: key.key }),
    createKey: key => ({ type: key.first, key: key.second }),
};

const createStateMap = <T>(source?: DualKeyMapSource<RoomParameterNameType, StrIndex100, T> | DualKeyMap<RoomParameterNameType, StrIndex100, T>) => {
    return new CustomDualKeyMap<Key, RoomParameterNameType, StrIndex100, T>({ ...keyFactory, sourceMap: source });
};

type ReadonlyStateMap = ReadonlyCustomDualKeyMap<Key, RoomParameterNameType, StrIndex100, ParamNameState>;

class ParamNameState {
    private constructor(private readonly _object: ParamNameStateType) {

    }

    public static createFromGraphQL(state: $GraphQL.ParamNameValueState) {
        const result = new ParamNameState(state);
        return result.clone();
    }

    public static createFromMikroORM(entity: $MikroORM.ParamName | $MikroORM.RemoveParamNameOp) {
        const entityObject: ParamNameStateType = {
            name: entity.name,
        };
        return new ParamNameState(entityObject);
    }

    public static restore({ downOperation, nextState }: { downOperation?: ParamNameDownOperation; nextState: ParamNameState }): Result<RestoredParamName> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredParamName({ prevState: nextState, nextState }));
        }
        const prevState = nextState.clone();
        const twoWayOperationCore: ParamNameTwoWayOperationType = {};

        if (downOperation.valueProps.name !== undefined) {
            prevState._object.name = downOperation.valueProps.name.oldValue;
            twoWayOperationCore.name = { ...downOperation.valueProps.name, newValue: nextState._object.name };
        }

        return ResultModule.ok(new RestoredParamName({ prevState, nextState, twoWayOperation: new ParamNameTwoWayOperation({ valueProps: twoWayOperationCore }) }));
    }

    public get object(): Readonly<ParamNameStateType> {
        return this._object;
    }

    public clone(): ParamNameState {
        return new ParamNameState({
            ...this._object,
        });
    }

    public applyBack(operation: ParamNameDownOperation): ParamNameState {
        const result = this.clone();
        if (operation.valueProps.name !== undefined) {
            result._object.name = operation.valueProps.name.oldValue;
        }
        return result;
    }

    private setToParamNameBase({
        paramNameBase,
    }: {
        paramNameBase: $MikroORM.ParamNameBase;
    }) {
        paramNameBase.name = this._object.name;
    }

    public toMikroORMState({
        key,
        type,
    }: {
        key: string;
        type: RoomParameterNameType;
    }): $MikroORM.ParamName {
        const result = new $MikroORM.ParamName({ ...this._object, key, type });
        this.setToParamNameBase({ paramNameBase: result });
        return result;
    }

    public toMikroORMRemoveOperation({
        key,
        type,
    }: {
        key: string;
        type: RoomParameterNameType;
    }): $MikroORM.RemoveParamNameOp {
        const result = new $MikroORM.RemoveParamNameOp({ ...this._object, key, type });
        this.setToParamNameBase({ paramNameBase: result });
        return result;
    }

    public toGraphQL({ key, type }: { key: string; type: RoomParameterNameType }): $GraphQL.ParamNameState {
        return {
            key,
            type,
            value: {
                ...this.object,
            },
        };
    }
}

export class ParamNamesState {
    public constructor(private readonly _readonlyStateMap: ReadonlyStateMap) { }

    public static create(source: ($MikroORM.ParamName | $MikroORM.RemoveParamNameOp)[]): ParamNamesState {
        const core = new DualKeyMap<RoomParameterNameType, StrIndex100, ParamNameState>();
        for (const elem of source) {
            const key = elem.key;
            if (!isStrIndex100(key)) {
                throw 'key must be "1", or "2", or ..., or "100"';
            }
            core.set(keyFactory.createDualKey({ type: elem.type, key }), ParamNameState.createFromMikroORM(elem));
        }
        return new ParamNamesState(createStateMap(core));
    }

    public static restore({ downOperation, nextState }: { downOperation?: ParamNamesDownOperation; nextState: ParamNamesState }): Result<RestoredParamNames> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredParamNames({ prevState: nextState, nextState }));
        }
        const restored = DualKeyMapOperations.restore({
            nextState: nextState.readonlyStateMap.dualKeyMap,
            downOperation: downOperation.readonlyStateMap,
            innerRestore: params => {
                const restored = ParamNameState.restore(params);
                if (restored.isError) {
                    return restored;
                }
                return ResultModule.ok({ prevState: restored.value.prevState, twoWayOperation: restored.value.twoWayOperation });
            }
        });
        if (restored.isError) {
            return restored;
        }
        return ResultModule.ok(new RestoredParamNames({
            prevState: new ParamNamesState(createStateMap(restored.value.prevState)),
            nextState: nextState,
            twoWayOperation: new ParamNamesTwoWayOperation(restored.value.twoWayOperation),
        }));
    }

    public get readonlyStateMap(): ReadonlyStateMap {
        return this._readonlyStateMap;
    }

    public clone(): ParamNamesState {
        return new ParamNamesState(this.readonlyStateMap.clone());
    }

    public toGraphQL(): $GraphQL.ParamNameState[] {
        return this._readonlyStateMap.toArray().map(([key, state]) => {
            return state.toGraphQL(key);
        });
    }
}

class ParamNameDownOperation {
    private constructor(private readonly object: ParamNameDownOperationType) { }

    public static create(entity: $MikroORM.UpdateParamNameOp): Result<ParamNameDownOperation> {
        const object: ParamNameDownOperationType = {};

        object.name = entity.name === undefined ? undefined : { oldValue: entity.name };

        return ResultModule.ok(new ParamNameDownOperation(object));
    }

    public get valueProps(): Readonly<ParamNameDownOperationType> {
        return this.object;
    }

    public compose(second: ParamNameDownOperation): Result<ParamNameDownOperation> {
        const valueProps: ParamNameDownOperationType = {
            name: ReplaceStringDownOperationModule.compose(this.valueProps.name, second.valueProps.name),
        };

        return ResultModule.ok(new ParamNameDownOperation(valueProps));
    }
}

export class ParamNamesDownOperation {
    private constructor(private readonly core: DualKeyMapOperations.ReadonlyDualKeyMapDownOperation<RoomParameterNameType, StrIndex100, ParamNameState, ParamNameDownOperation>) { }

    public static async create({
        add,
        remove,
        update
    }: {
        add: Collection<$MikroORM.AddParamNameOp>;
        remove: Collection<$MikroORM.RemoveParamNameOp>;
        update: Collection<$MikroORM.UpdateParamNameOp>;
    }): Promise<Result<ParamNamesDownOperation>> {
        const downOperation = await DualKeyMapOperations.createDownOperationFromMikroORM({
            toDualKey: state => {
                const key = state.key;
                if (!isStrIndex100(key)) {
                    return ResultModule.error('key must be "1", or "2", or ..., or "100"');
                }
                return ResultModule.ok(keyFactory.createDualKey({ key, type: state.type }));
            },
            add,
            remove,
            update,
            getState: async state => {
                const result = ParamNameState.createFromMikroORM(state);
                return ResultModule.ok(result);
            },
            getOperation: async operation => {
                return ParamNameDownOperation.create(operation);
            },
        });
        if (downOperation.isError) {
            return downOperation;
        }
        return ResultModule.ok(new ParamNamesDownOperation(downOperation.value));
    }

    public compose(second: ParamNamesDownOperation): Result<ParamNamesDownOperation> {
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
        return ResultModule.ok(new ParamNamesDownOperation(composed.value));
    }

    public get readonlyStateMap(): DualKeyMapOperations.ReadonlyDualKeyMapDownOperation<RoomParameterNameType, StrIndex100, ParamNameState, ParamNameDownOperation> {
        return this.core;
    }
}

class ParamNameTwoWayOperation {
    public constructor(private readonly params: { valueProps: ParamNameTwoWayOperationType }) {

    }

    public get valueProps(): Readonly<ParamNameTwoWayOperationType> {
        return this.params.valueProps;
    }

    public apply(entity: $MikroORM.ParamName) {
        if (this.params.valueProps.name !== undefined) {
            entity.name = this.params.valueProps.name.newValue;
        }
    }

    public toMikroORM({
        key,
        type,
    }: {
        key: StrIndex100;
        type: RoomParameterNameType;
    }): $MikroORM.UpdateParamNameOp {
        const result = new $MikroORM.UpdateParamNameOp({ key, type });

        if (this.valueProps.name !== undefined) {
            result.name = this.valueProps.name.oldValue;
        }

        return result;
    }

    public toGraphQL(): $GraphQL.ParamNameOperation {
        return {
            ...this.valueProps,
        };
    }
}

export class ParamNamesTwoWayOperation {
    public constructor(private readonly operations: DualKeyMapOperations.ReadonlyDualKeyMapTwoWayOperation<RoomParameterNameType, StrIndex100, ParamNameState, ParamNameTwoWayOperation>) {

    }

    public static createEmpty(): ParamNamesTwoWayOperation {
        return new ParamNamesTwoWayOperation(new DualKeyMap());
    }

    public get readonlyStateMap(): DualKeyMapOperations.ReadonlyDualKeyMapTwoWayOperation<RoomParameterNameType, StrIndex100, ParamNameState, ParamNameTwoWayOperation> {
        return this.operations;
    }

    public get readonlyStateMapAsStringKey(): DualKeyMapOperations.ReadonlyDualKeyMapTwoWayOperation<RoomParameterNameType, string, ParamNameState, ParamNameTwoWayOperation> {
        return this.operations;
    }

    public get isId(): boolean {
        return this.readonlyStateMap.size === 0;
    }

    public setToMikroORM(entity: RoomOp): void {
        this.readonlyStateMap.forEach((operation, key) => {
            if (operation.type === DualKeyMapOperations.update) {
                const updateOperation = operation.operation.toMikroORM({
                    type: key.first,
                    key: key.second,
                });
                entity.updateParamNameOps.add(updateOperation);
                return;
            }
            if (operation.operation.oldValue === undefined) {
                const element = new $MikroORM.AddParamNameOp({
                    type: key.first,
                    key: key.second
                });
                entity.addParamNameOps.add(element);
                return;
            }

            const removeOperation = operation.operation.oldValue.toMikroORMRemoveOperation({
                type: key.first,
                key: key.second
            });
            entity.removeParamNameOps.add(removeOperation);
        });
    }

    public async apply({
        entity,
    }: {
        entity: Collection<$MikroORM.ParamName>;
    }): Promise<void> {
        await DualKeyMapOperations.apply({
            toDualKey: state => ({ second: state.key, first: state.type }),
            state: entity,
            operation: this.readonlyStateMapAsStringKey,
            create: async params => {
                return params.state.toMikroORMState({ key: params.key.second, type: params.key.first });
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

class RestoredParamName {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: ParamNameState; nextState: ParamNameState; twoWayOperation?: ParamNameTwoWayOperation }) { }

    public transform({ clientOperation }: { clientOperation: $GraphQL.ParamNameOperation }): Result<ParamNameTwoWayOperation | undefined> {
        const twoWayOperationCore: ParamNameTwoWayOperationType = {};

        twoWayOperationCore.name = ReplaceStringTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.name,
            second: clientOperation.name,
            prevState: this.params.prevState.object.name,
        });

        if (undefinedForAll(twoWayOperationCore)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(new ParamNameTwoWayOperation({ valueProps: twoWayOperationCore }));
    }

    public get prevState(): ParamNameState {
        return this.params.prevState;
    }

    public get nextState(): ParamNameState {
        return this.params.nextState;
    }

    public get twoWayOperation(): ParamNameTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

export class RestoredParamNames {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: ParamNamesState; nextState: ParamNamesState; twoWayOperation?: ParamNamesTwoWayOperation }) { }

    public transform({ clientOperation }: { clientOperation: $GraphQL.ParamNamesOperation }): Result<ParamNamesTwoWayOperation> {
        const second = DualKeyMapOperations.createUpOperationFromGraphQL({
            replace: clientOperation.replace,
            update: clientOperation.update,
            getState: source => source.newValue,
            getOperation: source => source.operation,
            createDualKey: source => {
                const key = source.key;
                if (!isStrIndex100(key)) {
                    throw 'key must be "1", or "2", or ..., or "100"';
                }
                return ResultModule.ok(keyFactory.createDualKey({ key, type: source.type }));
            }
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
                const restored = new RestoredParamName({ ...params, twoWayOperation: params.first });
                return restored.transform({ clientOperation: params.second });
            },
            toServerState: clientState => {
                return ParamNameState.createFromGraphQL(clientState);
            },
            protectedValuePolicy: {}
        });

        if (transformed.isError) {
            return transformed;
        }
        return ResultModule.ok(new ParamNamesTwoWayOperation(transformed.value));
    }

    public get prevState(): ParamNamesState {
        return this.params.prevState;
    }

    public get nextState(): ParamNamesState {
        return this.params.nextState;
    }

    public get twoWayOperation(): ParamNamesTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

// Make sure these:
// - apply(prevState, twoWayOperation.up) = nextState
// - apply(nextState, twoWayOperation.down) = prevState
export const toGraphQLOperation = (params: { prevState: ParamNamesState; nextState: ParamNamesState; twoWayOperation: ParamNamesTwoWayOperation }): $GraphQL.ParamNamesOperation => {
    return DualKeyMapOperations.toGraphQL({
        source: params.twoWayOperation.readonlyStateMap,
        toReplaceOperation: ({ nextState, key }) => ({ ...keyFactory.createKey(key), newValue: nextState?.toGraphQL(keyFactory.createKey(key)).value }),
        toUpdateOperation: ({ operation, key }) => ({ ...keyFactory.createKey(key), operation: operation.toGraphQL() }),
    });
};