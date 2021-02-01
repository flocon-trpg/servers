import { ReplaceBooleanDownOperation, ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperation, ReplaceBooleanTwoWayOperationModule, ReplaceNullableNumberDownOperation, ReplaceNullableNumberDownOperationModule, ReplaceNullableNumberTwoWayOperation, ReplaceNullableNumberTwoWayOperationModule, ReplaceNumberDownOperation, ReplaceNumberDownOperationModule, ReplaceNumberTwoWayOperation, ReplaceNumberTwoWayOperationModule, ReplaceStringDownOperationModule, ReplaceStringTwoWayOperation, ReplaceStringTwoWayOperationModule } from '../../../Operations';
import * as GraphQL from './graphql';
import * as $MikroORM from './mikro-orm';
import * as DualKeyMapOperations from '../../../dualKeyMapOperations';
import { undefinedForAll } from '../../../../utils/helpers';
import { Chara, UpdateCharaOp } from '../mikro-orm';
import { Collection, Reference } from '@mikro-orm/core';
import { Result, ResultModule } from '../../../../@shared/Result';
import { CompositeKey, createStateMap, keyFactory, ReadonlyStateMap, StateMap } from '../../../../@shared/StateMap';
import { CustomDualKeyMap, KeyFactory } from '../../../../@shared/CustomDualKeyMap';
import { DualKeyMap, DualKeyMapSource } from '../../../../@shared/DualKeyMap';

type PieceLocationStateType = {
    cellH: number;
    cellW: number;
    cellX: number;
    cellY: number;
    h: number;
    isCellMode: boolean;
    isPrivate: boolean;
    w: number;
    x: number;
    y: number;
}

type PieceLocationDownOperationType = {
    cellH?: ReplaceNumberDownOperation;
    cellW?: ReplaceNumberDownOperation;
    cellX?: ReplaceNumberDownOperation;
    cellY?: ReplaceNumberDownOperation;
    h?: ReplaceNumberDownOperation;
    isCellMode?: ReplaceBooleanDownOperation;
    isPrivate?: ReplaceBooleanDownOperation;
    w?: ReplaceNumberDownOperation;
    x?: ReplaceNumberDownOperation;
    y?: ReplaceNumberDownOperation;
}

type PieceLocationTwoWayOperationType = {
    cellH?: ReplaceNumberTwoWayOperation;
    cellW?: ReplaceNumberTwoWayOperation;
    cellX?: ReplaceNumberTwoWayOperation;
    cellY?: ReplaceNumberTwoWayOperation;
    h?: ReplaceNumberTwoWayOperation;
    isCellMode?: ReplaceBooleanTwoWayOperation;
    isPrivate?: ReplaceBooleanTwoWayOperation;
    w?: ReplaceNumberTwoWayOperation;
    x?: ReplaceNumberTwoWayOperation;
    y?: ReplaceNumberTwoWayOperation;
}

class PieceLocationState {
    private constructor(private readonly _object: PieceLocationStateType) {

    }

    public static createFromGraphQL(state: GraphQL.PieceLocationValueState) {
        const result = new PieceLocationState(state);
        return result.clone();
    }

    public static createFromMikroORM(entity: $MikroORM.PieceLocBase) {
        const entityObject: PieceLocationStateType = {
            ...entity,
        };
        return new PieceLocationState(entityObject);
    }

    public static restore({ downOperation, nextState }: { downOperation?: PieceLocationDownOperation; nextState: PieceLocationState }): Result<RestoredPieceLocation> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredPieceLocation({ prevState: nextState, nextState }));
        }
        const prevState = nextState.clone();
        const twoWayOperationCore: PieceLocationTwoWayOperationType = {};

        if (downOperation.valueProps.cellH !== undefined) {
            prevState._object.cellH = downOperation.valueProps.cellH.oldValue;
            twoWayOperationCore.cellH = { ...downOperation.valueProps.cellH, newValue: nextState._object.cellH };
        }

        if (downOperation.valueProps.cellW !== undefined) {
            prevState._object.cellW = downOperation.valueProps.cellW.oldValue;
            twoWayOperationCore.cellW = { ...downOperation.valueProps.cellW, newValue: nextState._object.cellW };
        }

        if (downOperation.valueProps.cellX !== undefined) {
            prevState._object.cellX = downOperation.valueProps.cellX.oldValue;
            twoWayOperationCore.cellX = { ...downOperation.valueProps.cellX, newValue: nextState._object.cellX };
        }

        if (downOperation.valueProps.cellY !== undefined) {
            prevState._object.cellY = downOperation.valueProps.cellY.oldValue;
            twoWayOperationCore.cellY = { ...downOperation.valueProps.cellY, newValue: nextState._object.cellY };
        }

        if (downOperation.valueProps.h !== undefined) {
            prevState._object.h = downOperation.valueProps.h.oldValue;
            twoWayOperationCore.h = { ...downOperation.valueProps.h, newValue: nextState._object.h };
        }

        if (downOperation.valueProps.isCellMode !== undefined) {
            prevState._object.isCellMode = downOperation.valueProps.isCellMode.oldValue;
            twoWayOperationCore.isCellMode = { ...downOperation.valueProps.isCellMode, newValue: nextState._object.isCellMode };
        }

        if (downOperation.valueProps.isPrivate !== undefined) {
            prevState._object.isPrivate = downOperation.valueProps.isPrivate.oldValue;
            twoWayOperationCore.isPrivate = { ...downOperation.valueProps.isPrivate, newValue: nextState._object.isPrivate };
        }

        if (downOperation.valueProps.w !== undefined) {
            prevState._object.w = downOperation.valueProps.w.oldValue;
            twoWayOperationCore.w = { ...downOperation.valueProps.w, newValue: nextState._object.w };
        }

        if (downOperation.valueProps.x !== undefined) {
            prevState._object.x = downOperation.valueProps.x.oldValue;
            twoWayOperationCore.x = { ...downOperation.valueProps.x, newValue: nextState._object.x };
        }

        if (downOperation.valueProps.y !== undefined) {
            prevState._object.y = downOperation.valueProps.y.oldValue;
            twoWayOperationCore.y = { ...downOperation.valueProps.y, newValue: nextState._object.y };
        }

        return ResultModule.ok(new RestoredPieceLocation({ prevState, nextState, twoWayOperation: new PieceLocationTwoWayOperation({ valueProps: twoWayOperationCore }) }));
    }

    public get object(): Readonly<PieceLocationStateType> {
        return this._object;
    }

    public clone(): PieceLocationState {
        return new PieceLocationState({
            ...this._object,
        });
    }

    public applyBack(operation: PieceLocationDownOperation): PieceLocationState {
        const result = this.clone();
        if (operation.valueProps.cellH !== undefined) {
            result._object.cellH = operation.valueProps.cellH.oldValue;
        }
        if (operation.valueProps.cellW !== undefined) {
            result._object.cellW = operation.valueProps.cellW.oldValue;
        }
        if (operation.valueProps.cellX !== undefined) {
            result._object.cellX = operation.valueProps.cellX.oldValue;
        }
        if (operation.valueProps.cellY !== undefined) {
            result._object.cellY = operation.valueProps.cellY.oldValue;
        }
        if (operation.valueProps.h !== undefined) {
            result._object.h = operation.valueProps.h.oldValue;
        }
        if (operation.valueProps.isCellMode !== undefined) {
            result._object.isCellMode = operation.valueProps.isCellMode.oldValue;
        }
        if (operation.valueProps.isPrivate !== undefined) {
            result._object.isPrivate = operation.valueProps.isPrivate.oldValue;
        }
        if (operation.valueProps.w !== undefined) {
            result._object.w = operation.valueProps.w.oldValue;
        }
        if (operation.valueProps.x !== undefined) {
            result._object.x = operation.valueProps.x.oldValue;
        }
        if (operation.valueProps.y !== undefined) {
            result._object.y = operation.valueProps.y.oldValue;
        }

        return result;
    }

    public toMikroORMPieceLocation({
        boardId,
        boardCreatedBy,
    }: {
        boardId: string;
        boardCreatedBy: string;
    }): $MikroORM.PieceLoc {
        const result = new $MikroORM.PieceLoc({ ...this._object, boardId, boardCreatedBy });

        return result;
    }

    public toMikroORMRemovePieceLocationOperation({
        boardId,
        boardCreatedBy,
    }: {
        boardId: string;
        boardCreatedBy: string;
    }): $MikroORM.RemovePieceLocOp {
        const result = new $MikroORM.RemovePieceLocOp({ ...this._object, boardId, boardCreatedBy });
        return result;
    }

    public toMikroORMRemovedPieceLocation({
        boardId,
        boardCreatedBy,
    }: {
        boardId: string;
        boardCreatedBy: string;
    }): $MikroORM.RemovedPieceLoc {
        const result = new $MikroORM.RemovedPieceLoc({ ...this._object, boardId, boardCreatedBy });
        return result;
    }

    public toGraphQL({ boardId, boardCreatedBy, createdByMe }: { boardId: string; boardCreatedBy: string; createdByMe: boolean }): GraphQL.PieceLocationState | undefined {
        if (!createdByMe && this.object.isPrivate) {
            return undefined;
        }
        return {
            boardId,
            boardCreatedBy,
            value: this.clone().object,
        };
    }
}

export class PieceLocationsState {
    public constructor(private readonly _readonlyStateMap: ReadonlyStateMap<PieceLocationState>) { }

    public static createFromGraphQL(source: GraphQL.PieceLocationState[]): PieceLocationsState {
        const core = new CustomDualKeyMap<CompositeKey, string, string, PieceLocationState>(keyFactory);
        for (const pieceLocation of source) {
            core.set({ createdBy: pieceLocation.boardCreatedBy, id: pieceLocation.boardId }, PieceLocationState.createFromGraphQL(pieceLocation.value));
        }
        return new PieceLocationsState(core);
    }

    public static createFromMikroORM(source: $MikroORM.PieceLocBase[]): PieceLocationsState {
        const core = new CustomDualKeyMap<CompositeKey, string, string, PieceLocationState>(keyFactory);
        for (const pieceLocation of source) {
            core.set({ createdBy: pieceLocation.boardCreatedBy, id: pieceLocation.boardId }, PieceLocationState.createFromMikroORM(pieceLocation));
        }
        return new PieceLocationsState(core);
    }

    public static restore({ downOperation, nextState }: { downOperation?: PieceLocationsDownOperation; nextState: PieceLocationsState }): Result<RestoredPieceLocations> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredPieceLocations({ prevState: nextState, nextState }));
        }
        const restored = DualKeyMapOperations.restore({
            nextState: nextState.readonlyStateMap.dualKeyMap,
            downOperation: downOperation.readonlyStateMap.dualKeyMap,
            innerRestore: params => {
                const restored = PieceLocationState.restore(params);
                if (restored.isError) {
                    return restored;
                }
                return ResultModule.ok({ prevState: restored.value.prevState, twoWayOperation: restored.value.twoWayOperation });
            }
        });
        if (restored.isError) {
            return restored;
        }
        return ResultModule.ok(new RestoredPieceLocations({
            prevState: new PieceLocationsState(createStateMap(restored.value.prevState)),
            nextState: nextState,
            twoWayOperation: new PieceLocationsTwoWayOperation(createStateMap(restored.value.twoWayOperation)),
        }));
    }

    public get readonlyStateMap(): ReadonlyStateMap<PieceLocationState> {
        return this._readonlyStateMap;
    }

    public clone(): PieceLocationsState {
        return new PieceLocationsState(this.readonlyStateMap.clone());
    }

    public toGraphQL({ createdByMe }: { createdByMe: boolean }): GraphQL.PieceLocationState[] {
        return [...this._readonlyStateMap].flatMap(([key, state]) => {
            const result = state.toGraphQL({ boardCreatedBy: key.createdBy, boardId: key.id, createdByMe });
            return result === undefined ? [] : [result];
        });
    }

    public applyBack(downOperation: PieceLocationsDownOperation): PieceLocationsState {
        const result = DualKeyMapOperations.applyBack({
            nextState: this.readonlyStateMap.dualKeyMap,
            downOperation: downOperation.readonlyStateMap.dualKeyMap,
            innerApplyBack: ({ nextState, downOperation }) => ResultModule.ok(nextState.applyBack(downOperation)),
        });
        if (result.isError) {
            throw result.isError;
        }
        return new PieceLocationsState(createStateMap(result.value));
    }
}

class PieceLocationDownOperation {
    private constructor(private readonly object: PieceLocationDownOperationType) { }

    public static create(entity: $MikroORM.UpdatePieceLocOp): PieceLocationDownOperation {
        const object: PieceLocationDownOperationType = {};

        object.cellH = entity.cellH === undefined ? undefined : { oldValue: entity.cellH };
        object.cellW = entity.cellW === undefined ? undefined : { oldValue: entity.cellW };
        object.cellX = entity.cellX === undefined ? undefined : { oldValue: entity.cellX };
        object.cellY = entity.cellY === undefined ? undefined : { oldValue: entity.cellY };
        object.h = entity.h === undefined ? undefined : { oldValue: entity.h };
        object.isCellMode = entity.isCellMode === undefined ? undefined : { oldValue: entity.isCellMode };
        object.isPrivate = entity.isPrivate === undefined ? undefined : { oldValue: entity.isPrivate };
        object.x = entity.x === undefined ? undefined : { oldValue: entity.x };
        object.w = entity.w === undefined ? undefined : { oldValue: entity.w };
        object.y = entity.y === undefined ? undefined : { oldValue: entity.y };

        return new PieceLocationDownOperation(object);
    }

    public get valueProps(): Readonly<PieceLocationDownOperationType> {
        return this.object;
    }

    public compose(second: PieceLocationDownOperation): Result<PieceLocationDownOperation> {
        const valueProps: PieceLocationDownOperationType = {
            cellH: ReplaceNumberDownOperationModule.compose(this.valueProps.cellH, second.valueProps.cellH),
            cellW: ReplaceNumberDownOperationModule.compose(this.valueProps.cellW, second.valueProps.cellW),
            cellX: ReplaceNumberDownOperationModule.compose(this.valueProps.cellX, second.valueProps.cellX),
            cellY: ReplaceNumberDownOperationModule.compose(this.valueProps.cellY, second.valueProps.cellY),
            h: ReplaceNumberDownOperationModule.compose(this.valueProps.h, second.valueProps.h),
            isCellMode: ReplaceBooleanDownOperationModule.compose(this.valueProps.isCellMode, second.valueProps.isCellMode),
            isPrivate: ReplaceBooleanDownOperationModule.compose(this.valueProps.isPrivate, second.valueProps.isPrivate),
            x: ReplaceNumberDownOperationModule.compose(this.valueProps.x, second.valueProps.x),
            w: ReplaceNumberDownOperationModule.compose(this.valueProps.w, second.valueProps.w),
            y: ReplaceNumberDownOperationModule.compose(this.valueProps.y, second.valueProps.y),
        };

        return ResultModule.ok(new PieceLocationDownOperation(valueProps));
    }
}

export class PieceLocationsDownOperation {
    private constructor(private readonly core: DualKeyMapOperations.ReadonlyStateMapDownOperation<PieceLocationState, PieceLocationDownOperation>) { }

    public static async create({
        add,
        remove,
        update
    }: {
        add: Collection<$MikroORM.AddPieceLocOp>;
        remove: Collection<$MikroORM.RemovePieceLocOp>;
        update: Collection<$MikroORM.UpdatePieceLocOp>;
    }): Promise<Result<PieceLocationsDownOperation>> {
        const downOperation = await DualKeyMapOperations.createDownOperationFromMikroORM({
            toDualKey: state => ResultModule.ok({ first: state.boardCreatedBy, second: state.boardId }),
            add,
            remove,
            update,
            getState: async state => ResultModule.ok(PieceLocationState.createFromMikroORM(state)),
            getOperation: async operation => ResultModule.ok(PieceLocationDownOperation.create(operation)),
        });
        if (downOperation.isError) {
            return downOperation;
        }
        return ResultModule.ok(new PieceLocationsDownOperation(createStateMap(downOperation.value)));
    }

    public compose(second: PieceLocationsDownOperation): Result<PieceLocationsDownOperation> {
        const composed = DualKeyMapOperations.composeDownOperation({
            first: this.core.dualKeyMap,
            second: second.core.dualKeyMap,
            innerApplyBack: ({ downOperation, nextState }) => {
                return ResultModule.ok(nextState.applyBack(downOperation));
            },
            innerCompose: ({ first, second }) => first.compose(second),
        });
        if (composed.isError) {
            return composed;
        }
        return ResultModule.ok(new PieceLocationsDownOperation(createStateMap(composed.value)));
    }

    public get readonlyStateMap(): DualKeyMapOperations.ReadonlyStateMapDownOperation<PieceLocationState, PieceLocationDownOperation> {
        return this.core;
    }
}

class PieceLocationTwoWayOperation {
    public constructor(private readonly params: { valueProps: PieceLocationTwoWayOperationType }) {

    }

    public get valueProps(): Readonly<PieceLocationTwoWayOperationType> {
        return this.params.valueProps;
    }

    public apply(entity: $MikroORM.PieceLoc) {
        if (this.params.valueProps.cellH !== undefined) {
            entity.cellH = this.params.valueProps.cellH.newValue;
        }
        if (this.params.valueProps.cellW !== undefined) {
            entity.cellW = this.params.valueProps.cellW.newValue;
        }
        if (this.params.valueProps.cellX !== undefined) {
            entity.cellX = this.params.valueProps.cellX.newValue;
        }
        if (this.params.valueProps.cellY !== undefined) {
            entity.cellY = this.params.valueProps.cellY.newValue;
        }
        if (this.params.valueProps.h !== undefined) {
            entity.h = this.params.valueProps.h.newValue;
        }
        if (this.params.valueProps.isCellMode !== undefined) {
            entity.isCellMode = this.params.valueProps.isCellMode.newValue;
        }
        if (this.params.valueProps.isPrivate !== undefined) {
            entity.isPrivate = this.params.valueProps.isPrivate.newValue;
        }
        if (this.params.valueProps.w !== undefined) {
            entity.w = this.params.valueProps.w.newValue;
        }
        if (this.params.valueProps.w !== undefined) {
            entity.w = this.params.valueProps.w.newValue;
        }
        if (this.params.valueProps.x !== undefined) {
            entity.x = this.params.valueProps.x.newValue;
        }
        if (this.params.valueProps.y !== undefined) {
            entity.y = this.params.valueProps.y.newValue;
        }
    }

    public toMikroORM({
        boardId,
        boardCreatedBy,
    }: {
        boardId: string;
        boardCreatedBy: string;
    }): $MikroORM.UpdatePieceLocOp {
        const result = new $MikroORM.UpdatePieceLocOp({ boardId, boardCreatedBy });
        if (this.valueProps.cellH !== undefined) {
            result.cellH = this.valueProps.cellH.oldValue;
        }
        if (this.valueProps.cellW !== undefined) {
            result.cellW = this.valueProps.cellW.oldValue;
        }
        if (this.valueProps.cellX !== undefined) {
            result.cellX = this.valueProps.cellX.oldValue;
        }
        if (this.valueProps.cellY !== undefined) {
            result.cellY = this.valueProps.cellY.oldValue;
        }
        if (this.valueProps.h !== undefined) {
            result.h = this.valueProps.h.oldValue;
        }
        if (this.valueProps.isCellMode !== undefined) {
            result.isCellMode = this.valueProps.isCellMode.oldValue;
        }
        if (this.valueProps.isPrivate !== undefined) {
            result.isPrivate = this.valueProps.isPrivate.oldValue;
        }
        if (this.valueProps.w !== undefined) {
            result.w = this.valueProps.w.oldValue;
        }
        if (this.valueProps.x !== undefined) {
            result.x = this.valueProps.x.oldValue;
        }
        if (this.valueProps.y !== undefined) {
            result.y = this.valueProps.y.oldValue;
        }
        return result;
    }

    public toGraphQL(): GraphQL.PieceLocationOperation {
        const result: GraphQL.PieceLocationOperation = {
            ...this.valueProps,
        };
        return result;
    }
}

export class PieceLocationsTwoWayOperation {
    public constructor(private readonly operations: DualKeyMapOperations.ReadonlyStateMapTwoWayOperation<PieceLocationState, PieceLocationTwoWayOperation>) {

    }

    public static createEmpty(): PieceLocationsTwoWayOperation {
        return new PieceLocationsTwoWayOperation(createStateMap());
    }

    public get readonlyStateMap(): DualKeyMapOperations.ReadonlyStateMapTwoWayOperation<PieceLocationState, PieceLocationTwoWayOperation> {
        return this.operations;
    }

    public get isId(): boolean {
        return this.readonlyStateMap.size === 0;
    }

    public setToMikroORM(entity: UpdateCharaOp): void {
        this.readonlyStateMap.forEach((operation, key) => {
            if (operation.type === DualKeyMapOperations.update) {
                const updateOperation = operation.operation.toMikroORM({
                    boardId: key.id,
                    boardCreatedBy: key.createdBy,
                });
                entity.updatePieceLocOps.add(updateOperation);
                return;
            }
            if (operation.operation.oldValue === undefined) {
                const element = new $MikroORM.AddPieceLocOp({ boardId: key.id, boardCreatedBy: key.createdBy });
                entity.addPieceLocOps.add(element);
                return;
            }

            const removeOperation = operation.operation.oldValue.toMikroORMRemovePieceLocationOperation({
                boardId: key.id,
                boardCreatedBy: key.createdBy,
            });
            entity.removePieceLocOps.add(removeOperation);
        });
    }

    public async apply({
        entity,
    }: {
        entity: Collection<$MikroORM.PieceLoc>;
    }): Promise<void> {
        await DualKeyMapOperations.apply({
            toDualKey: state => ({ second: state.boardId, first: state.boardCreatedBy }),
            state: entity,
            operation: this.readonlyStateMap.dualKeyMap,
            create: async params => {
                return params.state.toMikroORMPieceLocation({ boardId: params.key.second, boardCreatedBy: params.key.first });
            },
            update: async params => {
                params.operation.apply(params.state);
            },
            delete: async () => true,
        });
    }
}

class RestoredPieceLocation {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: PieceLocationState; nextState: PieceLocationState; twoWayOperation?: PieceLocationTwoWayOperation }) { }

    public transform({ clientOperation }: { clientOperation: GraphQL.PieceLocationOperation; createdByMe: boolean }): Result<PieceLocationTwoWayOperation | undefined> {
        const twoWayOperationCore: PieceLocationTwoWayOperationType = {};

        twoWayOperationCore.cellH = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.cellH,
            second: clientOperation.cellH,
            prevState: this.params.prevState.object.cellH,
        });
        twoWayOperationCore.cellW = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.cellW,
            second: clientOperation.cellW,
            prevState: this.params.prevState.object.cellW,
        });
        twoWayOperationCore.cellX = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.cellX,
            second: clientOperation.cellX,
            prevState: this.params.prevState.object.cellX,
        });
        twoWayOperationCore.cellY = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.cellY,
            second: clientOperation.cellY,
            prevState: this.params.prevState.object.cellY,
        });
        twoWayOperationCore.h = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.h,
            second: clientOperation.h,
            prevState: this.params.prevState.object.h,
        });
        twoWayOperationCore.isCellMode = ReplaceBooleanTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.isCellMode,
            second: clientOperation.isCellMode,
            prevState: this.params.prevState.object.isCellMode,
        });
        twoWayOperationCore.isPrivate = ReplaceBooleanTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.isPrivate,
            second: clientOperation.isPrivate,
            prevState: this.params.prevState.object.isPrivate,
        });
        twoWayOperationCore.w = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.w,
            second: clientOperation.w,
            prevState: this.params.prevState.object.w,
        });
        twoWayOperationCore.x = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.x,
            second: clientOperation.x,
            prevState: this.params.prevState.object.x,
        });
        twoWayOperationCore.y = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.y,
            second: clientOperation.y,
            prevState: this.params.prevState.object.y,
        });

        if (undefinedForAll(twoWayOperationCore)) {
            return ResultModule.ok(undefined);
        }

        return ResultModule.ok(new PieceLocationTwoWayOperation({ valueProps: twoWayOperationCore }));
    }

    public get prevState(): PieceLocationState {
        return this.params.prevState;
    }

    public get nextState(): PieceLocationState {
        return this.params.nextState;
    }

    public get twoWayOperation(): PieceLocationTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

export class RestoredPieceLocations {
    // Make sure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: PieceLocationsState; nextState: PieceLocationsState; twoWayOperation?: PieceLocationsTwoWayOperation }) { }

    public transform({ clientOperation, createdByMe }: { clientOperation: GraphQL.PieceLocationsOperation; createdByMe: boolean }): Result<PieceLocationsTwoWayOperation> {
        const second = DualKeyMapOperations.createUpOperationFromGraphQL({
            replace: clientOperation.replace,
            update: clientOperation.update,
            getState: source => source.newValue,
            getOperation: source => source.operation,
            createDualKey: source => ResultModule.ok({ first: source.boardCreatedBy, second: source.boardId }),
        });
        if (second.isError) {
            return second;
        }
        const transformed = DualKeyMapOperations.transform({
            first: this.params.twoWayOperation?.readonlyStateMap.dualKeyMap,
            second: second.value,
            prevState: this.params.prevState.readonlyStateMap.dualKeyMap,
            nextState: this.params.nextState.readonlyStateMap.dualKeyMap,
            innerTransform: params => {
                const restored = new RestoredPieceLocation(params);
                return restored.transform({ clientOperation: params.second, createdByMe });
            },
            toServerState: clientState => {
                return PieceLocationState.createFromGraphQL(clientState);
            },
            protectedValuePolicy: {}
        });

        if (transformed.isError) {
            return transformed;
        }
        return ResultModule.ok(new PieceLocationsTwoWayOperation(createStateMap(transformed.value)));
    }

    public get prevState(): PieceLocationsState {
        return this.params.prevState;
    }

    public get nextState(): PieceLocationsState {
        return this.params.nextState;
    }

    public get twoWayOperation(): PieceLocationsTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

// Make sure these:
// - apply(prevState, twoWayOperation.up) = nextState
// - apply(nextState, twoWayOperation.down) = prevState
export const toGraphQLOperation = (params: {
    prevState: PieceLocationsState;
    nextState: PieceLocationsState;
    twoWayOperation: PieceLocationsTwoWayOperation;
    createdByMe: boolean;
}): GraphQL.PieceLocationsOperation => {
    return DualKeyMapOperations.toGraphQLWithState({
        source: params.twoWayOperation.readonlyStateMap.dualKeyMap,
        prevState: params.prevState.readonlyStateMap.dualKeyMap,
        nextState: params.nextState.readonlyStateMap.dualKeyMap,
        isPrivate: state => !params.createdByMe && state.object.isPrivate,
        toReplaceOperation: ({ nextState, key }) => ({ boardCreatedBy: key.first, boardId: key.second, newValue: nextState?.toGraphQL({ boardCreatedBy: key.first, boardId: key.second, createdByMe: params.createdByMe })?.value }),
        toUpdateOperation: ({ operation, key }) => ({ boardCreatedBy: key.first, boardId: key.second, operation: operation.toGraphQL() }),
    });
};