import { ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperationModule, ReplaceFilePathDownOperation, ReplaceNullableFilePathDownOperation, ReplaceNullableFilePathDownOperationModule, ReplaceNullableFilePathTwoWayOperation, ReplaceNullableFilePathTwoWayOperationModule, ReplaceNullableNumberDownOperation, ReplaceNullableNumberDownOperationModule, ReplaceNullableNumberTwoWayOperation, ReplaceNullableNumberTwoWayOperationModule, ReplaceNumberDownOperation, ReplaceNumberDownOperationModule, ReplaceNumberTwoWayOperation, ReplaceNumberTwoWayOperationModule, ReplaceStringDownOperation, ReplaceStringDownOperationModule, ReplaceStringTwoWayOperation, ReplaceStringTwoWayOperationModule } from '../../Operations';
import * as $MikroORM from './mikro-orm';
import * as GraphQL from './graphql';
import * as DualKeyMapOperations from '../../dualKeyMapOperations';
import { CompositeKey, ReadonlyStateMap, StateMap } from '../../../@shared/StateMap';
import { undefinedForAll } from '../../../utils/helpers';
import { FilePath } from '../filePath/global';
import { Collection, Reference } from '@mikro-orm/core';
import { Room, RoomOp } from '../room/mikro-orm';
import { Result, ResultModule } from '../../../@shared/Result';
import { DualKeyMap, DualKeyMapSource } from '../../../@shared/DualKeyMap';
import { CustomDualKeyMap, KeyFactory } from '../../../@shared/CustomDualKeyMap';

type BoardStateType = {
    name: string;
    cellWidth: number;
    cellHeight: number;
    cellRowCount: number;
    cellColumnCount: number;
    cellOffsetX: number;
    cellOffsetY: number;
    backgroundImage?: FilePath;
    backgroundImageZoom: number;
}

type BoardDownOperationType = {
    name?: ReplaceStringDownOperation;
    cellHeight?: ReplaceNumberDownOperation;
    cellWidth?: ReplaceNumberDownOperation;
    cellRowCount?: ReplaceNumberDownOperation;
    cellColumnCount?: ReplaceNumberDownOperation;
    cellOffsetX?: ReplaceNumberDownOperation;
    cellOffsetY?: ReplaceNumberDownOperation;
    backgroundImage?: ReplaceNullableFilePathDownOperation;
    backgroundImageZoom?: ReplaceNumberDownOperation;
}

type BoardTwoWayOperationType = {
    name?: ReplaceStringTwoWayOperation;
    cellWidth?: ReplaceNumberTwoWayOperation;
    cellHeight?: ReplaceNumberTwoWayOperation;
    cellRowCount?: ReplaceNumberTwoWayOperation;
    cellColumnCount?: ReplaceNumberTwoWayOperation;
    cellOffsetX?: ReplaceNumberTwoWayOperation;
    cellOffsetY?: ReplaceNumberTwoWayOperation;
    backgroundImage?: ReplaceNullableFilePathTwoWayOperation;
    backgroundImageZoom?: ReplaceNumberTwoWayOperation;
}

const keyFactory: KeyFactory<CompositeKey, string, string> = {
    createDualKey: key => ({ first: key.createdBy, second: key.id }),
    createKey: key => ({ createdBy: key.first, id: key.second }),
};

const createStateMap = <T>(source?: DualKeyMapSource<string, string, T> | DualKeyMap<string, string, T>) => {
    return new CustomDualKeyMap<CompositeKey, string, string, T>({ ...keyFactory, sourceMap: source });
};

class BoardState {
    private constructor(private readonly _object: BoardStateType) {

    }

    public static createFromGraphQL(state: GraphQL.BoardValueState) {
        const result = new BoardState(state);
        return result.clone();
    }

    public static createFromMikroORM(entity: $MikroORM.BoardBase) {
        const backgroundImage: FilePath | undefined = (() => {
            if (entity.backgroundImagePath != null && entity.backgroundImageSourceType != null) {
                return { path: entity.backgroundImagePath, sourceType: entity.backgroundImageSourceType };
            }
            return undefined;
        })();
        const entityObject: BoardStateType = {
            ...entity,
            backgroundImage,
        };
        return new BoardState(entityObject);
    }

    public static restore({ downOperation, nextState }: { downOperation?: BoardDownOperation; nextState: BoardState }): Result<RestoredBoard> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredBoard({ prevState: nextState, nextState }));
        }
        const prevState = nextState.clone();
        const twoWayOperationCore: BoardTwoWayOperationType = {};

        if (downOperation.valueProps.backgroundImage !== undefined) {
            prevState._object.backgroundImage = downOperation.valueProps.backgroundImage.oldValue ?? undefined;
            twoWayOperationCore.backgroundImage = { oldValue: downOperation.valueProps.backgroundImage.oldValue ?? undefined, newValue: nextState._object.backgroundImage };
        }

        if (downOperation.valueProps.backgroundImageZoom !== undefined) {
            prevState._object.backgroundImageZoom = downOperation.valueProps.backgroundImageZoom.oldValue;
            twoWayOperationCore.backgroundImageZoom = { ...downOperation.valueProps.backgroundImageZoom, newValue: nextState._object.backgroundImageZoom };
        }

        if (downOperation.valueProps.cellColumnCount !== undefined) {
            prevState._object.cellColumnCount = downOperation.valueProps.cellColumnCount.oldValue;
            twoWayOperationCore.cellColumnCount = { ...downOperation.valueProps.cellColumnCount, newValue: nextState._object.cellColumnCount };
        }

        if (downOperation.valueProps.cellHeight !== undefined) {
            prevState._object.cellHeight = downOperation.valueProps.cellHeight.oldValue;
            twoWayOperationCore.cellHeight = { ...downOperation.valueProps.cellHeight, newValue: nextState._object.cellHeight };
        }

        if (downOperation.valueProps.cellOffsetX !== undefined) {
            prevState._object.cellOffsetX = downOperation.valueProps.cellOffsetX.oldValue;
            twoWayOperationCore.cellOffsetX = { ...downOperation.valueProps.cellOffsetX, newValue: nextState._object.cellOffsetX };
        }

        if (downOperation.valueProps.cellOffsetY !== undefined) {
            prevState._object.cellOffsetY = downOperation.valueProps.cellOffsetY.oldValue;
            twoWayOperationCore.cellOffsetY = { ...downOperation.valueProps.cellOffsetY, newValue: nextState._object.cellOffsetY };
        }

        if (downOperation.valueProps.cellRowCount !== undefined) {
            prevState._object.cellRowCount = downOperation.valueProps.cellRowCount.oldValue;
            twoWayOperationCore.cellRowCount = { ...downOperation.valueProps.cellRowCount, newValue: nextState._object.cellRowCount };
        }

        if (downOperation.valueProps.cellWidth !== undefined) {
            prevState._object.cellWidth = downOperation.valueProps.cellWidth.oldValue;
            twoWayOperationCore.cellWidth = { ...downOperation.valueProps.cellWidth, newValue: nextState._object.cellWidth };
        }

        if (downOperation.valueProps.name !== undefined) {
            prevState._object.name = downOperation.valueProps.name.oldValue;
            twoWayOperationCore.name = { ...downOperation.valueProps.name, newValue: nextState._object.name };
        }

        return ResultModule.ok(new RestoredBoard({ prevState, nextState, twoWayOperation: new BoardTwoWayOperation({ valueProps: twoWayOperationCore }) }));
    }

    public get object(): Readonly<BoardStateType> {
        return this._object;
    }

    public clone(): BoardState {
        return new BoardState({
            ...this._object,
            backgroundImage: this._object.backgroundImage === undefined ? undefined : { ...this._object.backgroundImage }
        });
    }

    public applyBack(operation: BoardDownOperation): BoardState {
        const result = this.clone();
        if (operation.valueProps.backgroundImage !== undefined) {
            result._object.backgroundImage = operation.valueProps.backgroundImage.oldValue ?? undefined;
        }
        if (operation.valueProps.backgroundImageZoom !== undefined) {
            result._object.backgroundImageZoom = operation.valueProps.backgroundImageZoom.oldValue ?? undefined;
        }
        if (operation.valueProps.cellColumnCount !== undefined) {
            result._object.cellColumnCount = operation.valueProps.cellColumnCount.oldValue;
        }
        if (operation.valueProps.cellHeight !== undefined) {
            result._object.cellHeight = operation.valueProps.cellHeight.oldValue;
        }
        if (operation.valueProps.cellOffsetX !== undefined) {
            result._object.cellOffsetX = operation.valueProps.cellOffsetX.oldValue;
        }
        if (operation.valueProps.cellOffsetY !== undefined) {
            result._object.cellOffsetY = operation.valueProps.cellOffsetY.oldValue;
        }
        if (operation.valueProps.cellRowCount !== undefined) {
            result._object.cellRowCount = operation.valueProps.cellRowCount.oldValue;
        }
        if (operation.valueProps.cellWidth !== undefined) {
            result._object.cellWidth = operation.valueProps.cellWidth.oldValue;
        }
        if (operation.valueProps.name !== undefined) {
            result._object.name = operation.valueProps.name.oldValue;
        }
        return result;
    }

    public static diff({ prev, next }: { prev: BoardState; next: BoardState }): BoardDownOperation | undefined {
        const resultType: BoardDownOperationType = {};
        if (prev.object.backgroundImage !== next.object.backgroundImage) {
            resultType.backgroundImage = { oldValue: prev.object.backgroundImage };
        }
        if (prev.object.backgroundImageZoom !== next.object.backgroundImageZoom) {
            resultType.backgroundImageZoom = { oldValue: prev.object.backgroundImageZoom };
        }
        if (prev.object.cellColumnCount !== next.object.cellColumnCount) {
            resultType.cellColumnCount = { oldValue: prev.object.cellColumnCount };
        }
        if (prev.object.cellHeight !== next.object.cellHeight) {
            resultType.cellHeight = { oldValue: prev.object.cellHeight };
        }
        if (prev.object.cellOffsetX !== next.object.cellOffsetX) {
            resultType.cellOffsetX = { oldValue: prev.object.cellOffsetX };
        }
        if (prev.object.cellOffsetY !== next.object.cellOffsetY) {
            resultType.cellOffsetY = { oldValue: prev.object.cellOffsetY };
        }
        if (prev.object.cellRowCount !== next.object.cellRowCount) {
            resultType.cellRowCount = { oldValue: prev.object.cellRowCount };
        }
        if (prev.object.cellWidth !== next.object.cellWidth) {
            resultType.cellWidth = { oldValue: prev.object.cellWidth };
        }
        if (prev.object.name !== next.object.name) {
            resultType.name = { oldValue: prev.object.name };
        }
        const result = new BoardDownOperation(resultType);
        if (result.isId) {
            return undefined;
        }
        return result;
    }

    private setToBoardBase({
        boardBase,
    }: {
        boardBase: $MikroORM.BoardBase;
    }) {
        boardBase.backgroundImagePath = this._object.backgroundImage?.path;
        boardBase.backgroundImageSourceType = this._object.backgroundImage?.sourceType;
        boardBase.backgroundImageZoom = this._object.backgroundImageZoom;
        boardBase.cellHeight = this._object.cellHeight;
        boardBase.cellWidth = this._object.cellWidth;
        boardBase.cellColumnCount = this._object.cellColumnCount;
        boardBase.cellRowCount = this._object.cellRowCount;
        boardBase.cellOffsetX = this._object.cellOffsetX;
        boardBase.cellOffsetY = this._object.cellOffsetY;
        boardBase.name = this._object.name;
    }

    public toMikroORMBoard({
        createdBy,
        stateId,
    }: {
        createdBy: string;
        stateId: string;
    }): $MikroORM.Board {
        const result = new $MikroORM.Board({ ...this._object, createdBy, stateId });
        this.setToBoardBase({ boardBase: result });

        return result;
    }

    public toMikroORMRemoveBoardOperation({
        createdBy,
        stateId,
    }: {
        createdBy: string;
        stateId: string;
    }): $MikroORM.RemoveBoardOp {
        const result = new $MikroORM.RemoveBoardOp({ ...this._object, createdBy, stateId });
        this.setToBoardBase({ boardBase: result });
        return result;
    }

    public toGraphQL({ id, createdBy }: { id: string; createdBy: string }): GraphQL.BoardState {
        return {
            id,
            createdBy,
            value: this.clone()._object,
        };
    }
}

export class BoardsState {
    public constructor(private readonly _readonlyStateMap: ReadonlyStateMap<BoardState>) { }

    public static create(source: $MikroORM.BoardBase[]): BoardsState {
        const core = createStateMap<BoardState>();
        for (const board of source) {
            const key = { createdBy: board.createdBy, id: board.stateId };
            core.set(key, BoardState.createFromMikroORM(board));
        }
        return new BoardsState(core);
    }

    public static restore({ downOperation, nextState }: { downOperation?: BoardsDownOperation; nextState: BoardsState }): Result<RestoredBoards> {
        if (downOperation === undefined) {
            return ResultModule.ok(new RestoredBoards({ prevState: nextState, nextState }));
        }
        const restored = DualKeyMapOperations.restore({
            nextState: nextState.readonlyStateMap.dualKeyMap,
            downOperation: downOperation.readonlyStateMap.dualKeyMap,
            innerRestore: params => {
                const restored = BoardState.restore(params);
                if (restored.isError) {
                    return restored;
                }
                return ResultModule.ok({ prevState: restored.value.prevState, twoWayOperation: restored.value.ftwoWayOperation });
            }
        });
        if (restored.isError) {
            return restored;
        }
        return ResultModule.ok(new RestoredBoards({
            prevState: new BoardsState(createStateMap(restored.value.prevState)),
            nextState: nextState,
            twoWayOperation: new BoardsTwoWayOperation(createStateMap(restored.value.twoWayOperation)),
        }));
    }

    public get readonlyStateMap(): ReadonlyStateMap<BoardState> {
        return this._readonlyStateMap;
    }

    public clone(): BoardsState {
        return new BoardsState(this.readonlyStateMap.clone());
    }

    public toGraphQL(): GraphQL.BoardState[] {
        return this._readonlyStateMap.toArray().map(([key, state]) => {
            return state.toGraphQL(key);
        });
    }
}

class BoardDownOperation {
    public constructor(private readonly object: BoardDownOperationType) { }

    public static create(entity: $MikroORM.UpdateBoardOp): BoardDownOperation {
        const object: BoardDownOperationType = {};

        object.backgroundImage = ReplaceNullableFilePathDownOperationModule.validate(entity.backgroundImage);
        object.backgroundImageZoom = entity.backgroundImageZoom === undefined ? undefined : { oldValue: entity.backgroundImageZoom };
        object.cellHeight = entity.cellHeight === undefined ? undefined : { oldValue: entity.cellHeight };
        object.cellWidth = entity.cellWidth === undefined ? undefined : { oldValue: entity.cellWidth };
        object.cellHeight = entity.cellHeight === undefined ? undefined : { oldValue: entity.cellHeight };
        object.cellWidth = entity.cellWidth === undefined ? undefined : { oldValue: entity.cellWidth };
        object.cellColumnCount = entity.cellColumnCount === undefined ? undefined : { oldValue: entity.cellColumnCount };
        object.cellRowCount = entity.cellRowCount === undefined ? undefined : { oldValue: entity.cellRowCount };
        object.cellOffsetX = entity.cellOffsetX === undefined ? undefined : { oldValue: entity.cellOffsetX };
        object.cellOffsetY = entity.cellOffsetY === undefined ? undefined : { oldValue: entity.cellOffsetY };
        object.name = entity.name === undefined ? undefined : { oldValue: entity.name };

        return new BoardDownOperation(object);
    }

    public get isId() {
        return undefinedForAll(this.object);
    }

    public get valueProps(): Readonly<BoardDownOperationType> {
        return this.object;
    }

    public compose(second: BoardDownOperation): Result<BoardDownOperation> {
        const object: BoardDownOperationType = {
            backgroundImage: ReplaceNullableFilePathDownOperationModule.compose(this.valueProps.backgroundImage, second.valueProps.backgroundImage),
            backgroundImageZoom: ReplaceNumberDownOperationModule.compose(this.valueProps.backgroundImageZoom, second.valueProps.backgroundImageZoom),
            cellColumnCount: ReplaceNumberDownOperationModule.compose(this.valueProps.cellColumnCount, second.valueProps.cellColumnCount),
            cellHeight: ReplaceNumberDownOperationModule.compose(this.valueProps.cellHeight, second.valueProps.cellHeight),
            cellOffsetX: ReplaceNumberDownOperationModule.compose(this.valueProps.cellOffsetX, second.valueProps.cellOffsetX),
            cellOffsetY: ReplaceNumberDownOperationModule.compose(this.valueProps.cellOffsetY, second.valueProps.cellOffsetY),
            cellRowCount: ReplaceNumberDownOperationModule.compose(this.valueProps.cellRowCount, second.valueProps.cellRowCount),
            cellWidth: ReplaceNumberDownOperationModule.compose(this.valueProps.cellWidth, second.valueProps.cellWidth),
            name: ReplaceStringDownOperationModule.compose(this.valueProps.name, second.valueProps.name),
        };

        return ResultModule.ok(new BoardDownOperation(object));
    }
}

export class BoardsDownOperation {
    private constructor(private readonly core: DualKeyMapOperations.StateMapDownOperation<BoardState, BoardDownOperation>) { }

    public static async create({
        add,
        remove,
        update
    }: {
        add: Collection<$MikroORM.AddBoardOp>;
        remove: Collection<$MikroORM.RemoveBoardOp>;
        update: Collection<$MikroORM.UpdateBoardOp>;
    }): Promise<Result<BoardsDownOperation>> {
        const downOperation = await DualKeyMapOperations.createDownOperationFromMikroORM({
            toDualKey: source => ResultModule.ok(keyFactory.createDualKey({ createdBy: source.createdBy, id: source.stateId })),
            add,
            remove,
            update,
            getState: async state => ResultModule.ok(BoardState.createFromMikroORM(state)),
            getOperation: async operation => ResultModule.ok(BoardDownOperation.create(operation)),
        });
        if (downOperation.isError) {
            return downOperation;
        }
        return ResultModule.ok(new BoardsDownOperation(createStateMap(downOperation.value)));
    }

    public compose(second: BoardsDownOperation, state: BoardsState): Result<BoardsDownOperation> {
        const composed = DualKeyMapOperations.composeDownOperation({
            state: state.readonlyStateMap.dualKeyMap,
            first: this.core.dualKeyMap,
            second: second.core.dualKeyMap,
            innerApplyBack: ({ downOperation, nextState }) => {
                return ResultModule.ok(nextState.applyBack(downOperation));
            },
            innerCompose: ({ first, second }) => first.compose(second),
            innerDiff: BoardState.diff,
        });
        if (composed.isError) {
            return composed;
        }
        return ResultModule.ok(new BoardsDownOperation(createStateMap(composed.value)));
    }

    public get readonlyStateMap(): DualKeyMapOperations.ReadonlyStateMapDownOperation<BoardState, BoardDownOperation> {
        return this.core;
    }
}

class BoardTwoWayOperation {
    public constructor(private readonly params: { valueProps: BoardTwoWayOperationType }) {

    }

    public get valueProps(): Readonly<BoardTwoWayOperationType> {
        return this.params.valueProps;
    }

    public apply(entity: $MikroORM.Board) {
        if (this.params.valueProps.backgroundImage !== undefined) {
            entity.backgroundImagePath = this.params.valueProps.backgroundImage.newValue?.path;
            entity.backgroundImageSourceType = this.params.valueProps.backgroundImage.newValue?.sourceType;
        }
        if (this.params.valueProps.backgroundImageZoom !== undefined) {
            entity.backgroundImageZoom = this.params.valueProps.backgroundImageZoom.newValue;
        }
        if (this.params.valueProps.cellColumnCount !== undefined) {
            entity.cellColumnCount = this.params.valueProps.cellColumnCount.newValue;
        }
        if (this.params.valueProps.cellHeight !== undefined) {
            entity.cellHeight = this.params.valueProps.cellHeight.newValue;
        }
        if (this.params.valueProps.cellOffsetX !== undefined) {
            entity.cellOffsetX = this.params.valueProps.cellOffsetX.newValue;
        }
        if (this.params.valueProps.cellOffsetY !== undefined) {
            entity.cellOffsetY = this.params.valueProps.cellOffsetY.newValue;
        }
        if (this.params.valueProps.cellRowCount !== undefined) {
            entity.cellRowCount = this.params.valueProps.cellRowCount.newValue;
        }
        if (this.params.valueProps.cellWidth !== undefined) {
            entity.cellWidth = this.params.valueProps.cellWidth.newValue;
        }
        if (this.params.valueProps.name !== undefined) {
            entity.name = this.params.valueProps.name.newValue;
        }
    }

    public toMikroORM({
        createdBy,
        stateId,
    }: {
        createdBy: string;
        stateId: string;
    }): $MikroORM.UpdateBoardOp {
        const result = new $MikroORM.UpdateBoardOp({ createdBy, stateId });
        if (this.valueProps.backgroundImage !== undefined) {
            result.backgroundImage = this.valueProps.backgroundImage;
        }
        if (this.valueProps.backgroundImageZoom !== undefined) {
            result.backgroundImageZoom = this.valueProps.backgroundImageZoom.oldValue;
        }
        if (this.valueProps.cellColumnCount !== undefined) {
            result.cellColumnCount = this.valueProps.cellColumnCount.oldValue;
        }
        if (this.valueProps.cellHeight !== undefined) {
            result.cellHeight = this.valueProps.cellHeight.oldValue;
        }
        if (this.valueProps.cellOffsetX !== undefined) {
            result.cellOffsetX = this.valueProps.cellOffsetX.oldValue;
        }
        if (this.valueProps.cellOffsetY !== undefined) {
            result.cellOffsetY = this.valueProps.cellOffsetY.oldValue;
        }
        if (this.valueProps.cellRowCount !== undefined) {
            result.cellRowCount = this.valueProps.cellRowCount.oldValue;
        }
        if (this.valueProps.cellWidth !== undefined) {
            result.cellWidth = this.valueProps.cellWidth.oldValue;
        }
        if (this.valueProps.name !== undefined) {
            result.name = this.valueProps.name.oldValue;
        }
        return result;
    }

    public toGraphQL(): GraphQL.BoardOperation {
        return {
            ...this.valueProps,
        };
    }
}

export class BoardsTwoWayOperation {
    public constructor(private readonly operations: DualKeyMapOperations.ReadonlyStateMapTwoWayOperation<BoardState, BoardTwoWayOperation>) {

    }

    public static createEmpty(): BoardsTwoWayOperation {
        return new BoardsTwoWayOperation(createStateMap());
    }

    public get readonlyStateMap(): DualKeyMapOperations.ReadonlyStateMapTwoWayOperation<BoardState, BoardTwoWayOperation> {
        return this.operations;
    }

    public get isId(): boolean {
        return this.readonlyStateMap.isEmpty;
    }

    public setToMikroORM(entity: RoomOp): void {
        this.readonlyStateMap.forEach((operation, key) => {
            if (operation.type === DualKeyMapOperations.update) {
                const updateOperation = operation.operation.toMikroORM({
                    createdBy: key.createdBy,
                    stateId: key.id,
                });
                entity.updateBoardOps.add(updateOperation);
                return;
            }
            if (operation.operation.oldValue === undefined) {
                const element = new $MikroORM.AddBoardOp({ createdBy: key.createdBy, stateId: key.id });
                entity.addBoardOps.add(element);
                return;
            }

            const removeOperation = operation.operation.oldValue.toMikroORMRemoveBoardOperation({
                createdBy: key.createdBy,
                stateId: key.id,
            });
            entity.removeBoardOps.add(removeOperation);
        });
    }

    public async apply({
        entity,
    }: {
        entity: Collection<$MikroORM.Board>;
    }): Promise<void> {
        await DualKeyMapOperations.apply({
            toDualKey: state => keyFactory.createDualKey({ createdBy: state.createdBy, id: state.stateId }),
            state: entity,
            operation: this.readonlyStateMap.dualKeyMap,
            create: async params => {
                return params.state.toMikroORMBoard({ stateId: params.key.second, createdBy: params.key.first });
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

class RestoredBoard {
    // Ensure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: BoardState; nextState: BoardState; twoWayOperation?: BoardTwoWayOperation }) { }

    public transform({ clientOperation }: { clientOperation: GraphQL.BoardOperation }): Result<BoardTwoWayOperation | undefined> {
        const twoWayOperationCore: BoardTwoWayOperationType = {};

        twoWayOperationCore.backgroundImage = ReplaceNullableFilePathTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.backgroundImage,
            second: clientOperation.backgroundImage === undefined ? undefined : { newValue: clientOperation.backgroundImage.newValue },
            prevState: this.params.prevState.object.backgroundImage,
        });
        twoWayOperationCore.backgroundImageZoom = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.backgroundImageZoom,
            second: clientOperation.backgroundImageZoom,
            prevState: this.params.prevState.object.backgroundImageZoom,
        });
        twoWayOperationCore.cellColumnCount = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.cellColumnCount,
            second: clientOperation.cellColumnCount,
            prevState: this.params.prevState.object.cellColumnCount,
        });
        twoWayOperationCore.cellHeight = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.cellHeight,
            second: clientOperation.cellHeight,
            prevState: this.params.prevState.object.cellHeight,
        });
        twoWayOperationCore.cellOffsetX = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.cellOffsetX,
            second: clientOperation.cellOffsetX,
            prevState: this.params.prevState.object.cellOffsetX,
        });
        twoWayOperationCore.cellOffsetY = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.cellOffsetY,
            second: clientOperation.cellOffsetY,
            prevState: this.params.prevState.object.cellOffsetY,
        });
        twoWayOperationCore.cellRowCount = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.cellRowCount,
            second: clientOperation.cellRowCount,
            prevState: this.params.prevState.object.cellRowCount,
        });
        twoWayOperationCore.cellWidth = ReplaceNumberTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.cellWidth,
            second: clientOperation.cellWidth,
            prevState: this.params.prevState.object.cellWidth,
        });
        twoWayOperationCore.name = ReplaceStringTwoWayOperationModule.transform({
            first: this.params.twoWayOperation?.valueProps.name,
            second: clientOperation.name,
            prevState: this.params.prevState.object.name,
        });

        if (undefinedForAll(twoWayOperationCore)) {
            return ResultModule.ok(undefined);
        }
        return ResultModule.ok(new BoardTwoWayOperation({ valueProps: twoWayOperationCore }));
    }

    public get prevState(): BoardState {
        return this.params.prevState;
    }

    public get nextState(): BoardState {
        return this.params.nextState;
    }

    public get ftwoWayOperation(): BoardTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

export class RestoredBoards {
    // Ensure these:
    // - apply(prevState, twoWayOperation.up) = nextState
    // - apply(nextState, twoWayOperation.down) = prevState
    public constructor(private readonly params: { prevState: BoardsState; nextState: BoardsState; twoWayOperation?: BoardsTwoWayOperation }) { }

    public transform({ clientOperation }: { clientOperation: GraphQL.BoardsOperation }): Result<BoardsTwoWayOperation> {
        const second = DualKeyMapOperations.createUpOperationFromGraphQL({
            replace: clientOperation.replace,
            update: clientOperation.update,
            getState: source => source.newValue,
            getOperation: source => source.operation,
            createDualKey: source => ResultModule.ok(keyFactory.createDualKey({ createdBy: source.createdBy, id: source.id })),
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
                const restored = new RestoredBoard({ ...params, twoWayOperation: params.first });
                return restored.transform({ clientOperation: params.second });
            },
            toServerState: clientState => {
                return BoardState.createFromGraphQL(clientState);
            },
            protectedValuePolicy: {}
        });

        if (transformed.isError) {
            return transformed;
        }
        return ResultModule.ok(new BoardsTwoWayOperation(createStateMap(transformed.value)));
    }

    public get prevState(): BoardsState {
        return this.params.prevState;
    }

    public get nextState(): BoardsState {
        return this.params.nextState;
    }

    public get twoWayOperation(): BoardsTwoWayOperation | undefined {
        return this.params.twoWayOperation;
    }
}

// Make sure these:
// - apply(prevState, twoWayOperation.up) = nextState
// - apply(nextState, twoWayOperation.down) = prevState
export const toGraphQLOperation = (params: { prevState: BoardsState; nextState: BoardsState; twoWayOperation: BoardsTwoWayOperation }): GraphQL.BoardsOperation => {
    return DualKeyMapOperations.toGraphQL({
        source: params.twoWayOperation.readonlyStateMap.dualKeyMap,
        toReplaceOperation: ({ nextState, key }) => ({ ...keyFactory.createKey(key), newValue: nextState?.toGraphQL(keyFactory.createKey(key)).value }),
        toUpdateOperation: ({ operation, key }) => ({ ...keyFactory.createKey(key), operation: operation.toGraphQL() }),
    });
};