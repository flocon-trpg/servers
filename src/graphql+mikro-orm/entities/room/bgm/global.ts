import { Result, ResultModule } from '../../../../@shared/Result';
import { ReplaceBooleanDownOperation, ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperation, ReplaceBooleanTwoWayOperationModule, ReplaceFilePathArrayDownOperation, ReplaceFilePathArrayDownOperationModule, ReplaceFilePathArrayTwoWayOperation, ReplaceFilePathArrayTwoWayOperationModule, ReplaceNumberDownOperation, ReplaceNumberDownOperationModule, ReplaceNumberTwoWayOperation, ReplaceNumberTwoWayOperationModule } from '../../../Operations';
import * as $GraphQL from './graphql';
import * as $MikroORM from './mikro-orm';
import { Collection } from '@mikro-orm/core';
import { FilePath as GlobalFilePath } from '../../filePath/graphql';
import * as MapOperations from '../../../mapOperations';
import { RoomOp } from '../mikro-orm';
import { undefinedForAll } from '../../../../utils/helpers';
import { isStrIndex5, StrIndex5 } from '../../../../@shared/indexes';
import { __ } from '../../../../@shared/collection';

type RoomBgmStateType = {
    files: GlobalFilePath[];
    volume: number;
}

type RoomBgmDownOperationType = {
    files?: ReplaceFilePathArrayDownOperation;
    volume?: ReplaceNumberDownOperation;
}

type RoomBgmTwoWayOperationType = {
    files?: ReplaceFilePathArrayTwoWayOperation;
    volume?: ReplaceNumberTwoWayOperation;
}

class RoomBgmState {
    private constructor(private readonly _object: RoomBgmStateType) {

    }

    public static createFromGraphQL(state: $GraphQL.RoomBgmValueState) {
        const result = new RoomBgmState(state);
        return result.clone();
    }

    public static createFromMikroORM(entity: $MikroORM.RoomBgm | $MikroORM.RemoveRoomBgmOp) {
        const entityObject: RoomBgmStateType = {
            files: [...entity.files],
            volume: entity.volume,
        };
        return new RoomBgmState(entityObject);
    }

    public static restore({ downOperation, nextState }: { downOperation?: RoomBgmDownOperation; nextState: RoomBgmState }): Result<RestoredRoomBgm> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredRoomBgm({ prevState: nextState, nextState }));
        }
        const prevState = nextState.clone();
        const twoWayOperationCore: RoomBgmTwoWayOperationType = {};

        if (downOperation.valueProps.files !== undefined) {
            prevState._object.files = downOperation.valueProps.files.oldValue;
            twoWayOperationCore.files = { oldValue: [...downOperation.valueProps.files.oldValue], newValue: [...nextState._object.files] };
        }

        if (downOperation.valueProps.volume !== undefined) {
            prevState._object.volume = downOperation.valueProps.volume.oldValue;
            twoWayOperationCore.volume = { ...downOperation.valueProps.volume, newValue: nextState._object.volume };
        }

        return ResultModule.ok(new RestoredRoomBgm({ prevState, nextState, twoWayOperation: new RoomBgmTwoWayOperation({ valueProps: twoWayOperationCore }) }));
    }

    public get object(): Readonly<RoomBgmStateType> {
        return this._object;
    }

    public clone(): RoomBgmState {
        return new RoomBgmState({
            ...this._object,
        });
    }

    public applyBack(operation: RoomBgmDownOperation): RoomBgmState {
        const result = this.clone();
        if (operation.valueProps.files !== undefined) {
            result._object.files = [...operation.valueProps.files.oldValue];
        }
        if (operation.valueProps.volume !== undefined) {
            result._object.volume = operation.valueProps.volume.oldValue;
        }
        return result;
    }

    public static diff({ prev, next }: { prev: RoomBgmState; next: RoomBgmState }): RoomBgmDownOperation | undefined {
        const resultType: RoomBgmDownOperationType = {};
        if (prev.object.files !== next.object.files) {
            resultType.files = { oldValue: prev.object.files };
        }
        if (prev.object.volume !== next.object.volume) {
            resultType.volume = { oldValue: prev.object.volume };
        }
        const result = new RoomBgmDownOperation(resultType);
        if (result.isId) {
            return undefined;
        }
        return result;
    }

    private setToRoomBgmBase({
        roomBgmBase,
    }: {
        roomBgmBase: $MikroORM.RoomBgmBase;
    }) {
        roomBgmBase.files = [...this._object.files];
        roomBgmBase.volume = this._object.volume;
    }

    public toMikroORMState({
        channelKey,
    }: {
        channelKey: string;
    }): $MikroORM.RoomBgm {
        const result = new $MikroORM.RoomBgm({ ...this._object, channelKey });
        this.setToRoomBgmBase({ roomBgmBase: result });
        return result;
    }

    public toMikroORMRemoveOperation({
        channelKey,
    }: {
        channelKey: string;
    }): $MikroORM.RemoveRoomBgmOp {
        const result = new $MikroORM.RemoveRoomBgmOp({ ...this._object, channelKey });
        this.setToRoomBgmBase({ roomBgmBase: result });
        return result;
    }

    public toGraphQL({ channelKey }: { channelKey: StrIndex5 }): $GraphQL.RoomBgmState {
        return {
            channelKey,
            value: {
                ...this.object,
            },
        };
    }
}

export class RoomBgmsState {
    public constructor(private readonly _readonlyMap: ReadonlyMap<StrIndex5, RoomBgmState>) { }

    public static create(source: ($MikroORM.RoomBgm | $MikroORM.RemoveRoomBgmOp)[]): RoomBgmsState {
        const core = new Map<StrIndex5, RoomBgmState>();
        for (const elem of source) {
            const channelKey = elem.channelKey;
            if (!isStrIndex5(channelKey)) {
                throw 'channelKey must be "1", or "2", or ..., or "5"';
            }
            core.set(channelKey, RoomBgmState.createFromMikroORM(elem));
        }
        return new RoomBgmsState(core);
    }

    public static restore({ downOperation, nextState }: { downOperation?: RoomBgmsDownOperation; nextState: RoomBgmsState }): Result<RestoredRoomBgms> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredRoomBgms({ prevState: nextState, nextState }));
        }
        const restored = MapOperations.restore({
            nextState: nextState.readonlyMap,
            downOperation: downOperation.readonlyMap,
            innerRestore: params => {
                const restored = RoomBgmState.restore(params);
                if (restored.isError) {
                    return restored;
                }
                return ResultModule.ok({ prevState: restored.value.prevState, twoWayOperation: restored.value.twoWayOperation });
            }
        });
        if (restored.isError) {
            return restored;
        }
        return ResultModule.ok(new RestoredRoomBgms({
            prevState: new RoomBgmsState(restored.value.prevState),
            nextState: nextState,
            twoWayOperation: new RoomBgmsTwoWayOperation(restored.value.twoWayOperation),
        }));
    }

    public get readonlyMap(): ReadonlyMap<StrIndex5, RoomBgmState> {
        return this._readonlyMap;
    }

    public clone(): RoomBgmsState {
        return new RoomBgmsState(new Map(this.readonlyMap));
    }

    public toGraphQL(): $GraphQL.RoomBgmState[] {
        return __(this.readonlyMap).map(([key, state]) => {
            return state.toGraphQL({ channelKey: key });
        }).toArray();
    }
}

class RoomBgmDownOperation {
    public constructor(private readonly object: RoomBgmDownOperationType) { }

    public static create(entity: $MikroORM.UpdateRoomBgmOp): Result<RoomBgmDownOperation> {
        const object: RoomBgmDownOperationType = {};

        object.files = entity.files === undefined ? undefined : { oldValue: [...entity.files] };
        object.volume = entity.volume === undefined ? undefined : { oldValue: entity.volume };

        return ResultModule.ok(new RoomBgmDownOperation(object));
    }

    public get isId() {
        return undefinedForAll(this.object);
    }

    public get valueProps(): Readonly<RoomBgmDownOperationType> {
        return this.object;
    }

    public compose(second: RoomBgmDownOperation): Result<RoomBgmDownOperation> {
        const valueProps: RoomBgmDownOperationType = {
            files: ReplaceFilePathArrayDownOperationModule.compose(this.valueProps.files, second.valueProps.files),
            volume: ReplaceNumberDownOperationModule.compose(this.valueProps.volume, second.valueProps.volume),
        };

        return ResultModule.ok(new RoomBgmDownOperation(valueProps));
    }
}

export class RoomBgmsDownOperation {
    private constructor(private readonly core: MapOperations.MapDownOperation<StrIndex5, RoomBgmState, RoomBgmDownOperation>) { }

    public static async create({
        add,
        remove,
        update
    }: {
        add: Collection<$MikroORM.AddRoomBgmOp>;
        remove: Collection<$MikroORM.RemoveRoomBgmOp>;
        update: Collection<$MikroORM.UpdateRoomBgmOp>;
    }): Promise<Result<RoomBgmsDownOperation>> {
        const downOperation = await MapOperations.createDownOperationFromMikroORM({
            toKey: state => {
                const channelKey = state.channelKey;
                if (!isStrIndex5(channelKey)) {
                    return ResultModule.error('channelKey must be "1", or "2", or ..., or "5"');
                }
                return ResultModule.ok(channelKey);
            },
            add,
            remove,
            update,
            getState: async state => {
                const result = RoomBgmState.createFromMikroORM(state);
                return ResultModule.ok(result);
            },
            getOperation: async operation => {
                return RoomBgmDownOperation.create(operation);
            },
        });
        if (downOperation.isError) {
            return downOperation;
        }
        return ResultModule.ok(new RoomBgmsDownOperation(downOperation.value));
    }

    public compose(second: RoomBgmsDownOperation, state: RoomBgmsState): Result<RoomBgmsDownOperation> {
        const composed = MapOperations.composeDownOperation({
            state: state.readonlyMap,
            first: this.core,
            second: second.core,
            innerApplyBack: ({ downOperation, nextState }) => {
                return ResultModule.ok(nextState.applyBack(downOperation));
            },
            innerCompose: ({ first, second }) => first.compose(second),
            innerDiff: RoomBgmState.diff,
        });
        if (composed.isError) {
            return composed;
        }
        return ResultModule.ok(new RoomBgmsDownOperation(composed.value));
    }

    public get readonlyMap(): MapOperations.ReadonlyMapDownOperation<StrIndex5, RoomBgmState, RoomBgmDownOperation> {
        return this.core;
    }
}

class RoomBgmTwoWayOperation {
    public constructor(private readonly params: { valueProps: RoomBgmTwoWayOperationType }) {

    }

    public get valueProps(): Readonly<RoomBgmTwoWayOperationType> {
        return this.params.valueProps;
    }

    public apply(entity: $MikroORM.RoomBgm) {
        if (this.params.valueProps.files !== undefined) {
            entity.files = [...this.params.valueProps.files.newValue];
        }
        if (this.params.valueProps.volume !== undefined) {
            entity.volume = this.params.valueProps.volume.newValue;
        }
    }

    public toMikroORM({
        channelKey,
    }: {
        channelKey: string;
    }): $MikroORM.UpdateRoomBgmOp {
        const result = new $MikroORM.UpdateRoomBgmOp({ channelKey });

        if (this.valueProps.files !== undefined) {
            result.files = [...this.valueProps.files.oldValue];
        }
        if (this.valueProps.volume !== undefined) {
            result.volume = this.valueProps.volume.oldValue;
        }

        return result;
    }

    public toGraphQL(): $GraphQL.RoomBgmOperation {
        return {
            ...this.valueProps,
        };
    }
}

export class RoomBgmsTwoWayOperation {
    public constructor(private readonly operations: MapOperations.ReadonlyMapTwoWayOperation<StrIndex5, RoomBgmState, RoomBgmTwoWayOperation>) {

    }

    public static createEmpty(): RoomBgmsTwoWayOperation {
        return new RoomBgmsTwoWayOperation(new Map());
    }

    public get readonlyMap(): MapOperations.ReadonlyMapTwoWayOperation<StrIndex5, RoomBgmState, RoomBgmTwoWayOperation> {
        return this.operations;
    }

    public get readonlyMapAsStringKey(): MapOperations.ReadonlyMapTwoWayOperation<string, RoomBgmState, RoomBgmTwoWayOperation> {
        return this.operations;
    }

    public get isId(): boolean {
        return this.readonlyMap.size === 0;
    }

    public setToMikroORM(entity: RoomOp): void {
        this.readonlyMap.forEach((operation, key) => {
            if (operation.type === MapOperations.update) {
                const updateOperation = operation.operation.toMikroORM({ channelKey: key, });
                entity.updateRoomBgmOps.add(updateOperation);
                return;
            }
            if (operation.operation.oldValue === undefined) {
                const element = new $MikroORM.AddRoomBgmOp({ channelKey: key, });
                entity.addRoomBgmOps.add(element);
                return;
            }

            const removeOperation = operation.operation.oldValue.toMikroORMRemoveOperation({
                channelKey: key,
            });
            entity.removeRoomBgmOps.add(removeOperation);
        });
    }

    public async apply({
        entity,
    }: {
        entity: Collection<$MikroORM.RoomBgm>;
    }): Promise<void> {
        await MapOperations.apply({
            toKey: state => state.channelKey,
            state: entity,
            operation: this.readonlyMapAsStringKey,
            create: async params => {
                return params.state.toMikroORMState({ channelKey: params.key });
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

class RestoredRoomBgm {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: RoomBgmState; nextState: RoomBgmState; twoWayOperation?: RoomBgmTwoWayOperation }) { }

    public transform({ clientOperation, id }: { clientOperation: $GraphQL.RoomBgmOperation; id: string }): Result<RoomBgmTwoWayOperation | undefined> {
        if (!isStrIndex5(id)) {
            return ResultModule.error('id must be "1", or "2", or ..., or "5');
        }

        const twoWayOperationCore: RoomBgmTwoWayOperationType = {};

        twoWayOperationCore.files = ReplaceFilePathArrayTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.files,
            second: clientOperation.files,
            prevState: this.params.prevState.object.files,
        });
        twoWayOperationCore.volume = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.volume,
            second: clientOperation.volume,
            prevState: this.params.prevState.object.volume,
        });

        if (undefinedForAll(twoWayOperationCore)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(new RoomBgmTwoWayOperation({ valueProps: twoWayOperationCore }));
    }

    public get prevState(): RoomBgmState {
        return this.params.prevState;
    }

    public get nextState(): RoomBgmState {
        return this.params.nextState;
    }

    public get twoWayOperation(): RoomBgmTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

export class RestoredRoomBgms {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: RoomBgmsState; nextState: RoomBgmsState; twoWayOperation?: RoomBgmsTwoWayOperation }) { }

    public transform({ clientOperation }: { clientOperation: $GraphQL.RoomBgmsOperation }): Result<RoomBgmsTwoWayOperation> {
        const second = MapOperations.createUpOperationFromGraphQL({
            replace: clientOperation.replace,
            update: clientOperation.update,
            getState: x => x.newValue,
            getOperation: x => x.operation,
            createKey: x => {
                const key = x.channelKey;
                if (!isStrIndex5(key)) {
                    throw 'key must be "1", or "2", or ..., or "5"';
                }
                return ResultModule.ok(key);
            },
        });
        if (second.isError) {
            return second;
        }
        const transformed = MapOperations.transform({
            first: this.params.twoWayOperation?.readonlyMap,
            second: second.value,
            prevState: this.params.prevState.readonlyMap,
            nextState: this.params.nextState.readonlyMap,
            innerTransform: params => {
                const restored = new RestoredRoomBgm({ ...params, twoWayOperation: params.first });
                return restored.transform({ clientOperation: params.second, id: params.key });
            },
            toServerState: clientState => {
                return RoomBgmState.createFromGraphQL(clientState);
            },
            protectedValuePolicy: {}
        });

        if (transformed.isError) {
            return transformed;
        }
        return ResultModule.ok(new RoomBgmsTwoWayOperation(transformed.value));
    }

    public get prevState(): RoomBgmsState {
        return this.params.prevState;
    }

    public get nextState(): RoomBgmsState {
        return this.params.nextState;
    }

    public get twoWayOperation(): RoomBgmsTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

// Make sure these:
// - apply(prevState, twoWayOperation.up) = nextState
// - apply(nextState, twoWayOperation.down) = prevState
export const toGraphQLOperation = (params: { prevState: RoomBgmsState; nextState: RoomBgmsState; twoWayOperation: RoomBgmsTwoWayOperation }): $GraphQL.RoomBgmsOperation => {
    return MapOperations.toGraphQL({
        source: params.twoWayOperation.readonlyMap,
        toReplaceOperation: ({ nextState, key }) => ({ channelKey: key, newValue: nextState?.toGraphQL({ channelKey: key }).value }),
        toUpdateOperation: ({ operation, key }) => ({ channelKey: key, operation: operation.toGraphQL() }),
    });
};