import { Collection } from '@mikro-orm/core';
import { DualKey, DualKeyMap, ReadonlyDualKeyMap } from '../../../../@shared/DualKeyMap';
import { Result, ResultModule } from '../../../../@shared/Result';
import { undefinedForAll } from '../../../../@shared/utils';
import { EM } from '../../../../utils/types';
import { createDownOperationFromMikroORM, createUpOperationFromGraphQL, ReadonlyDualKeyMapDownOperation, ReadonlyDualKeyMapTwoWayOperation, ReadonlyDualKeyMapUpOperation, replace, update } from '../../../dualKeyMapOperations';
import { ReplaceNullableFilePathDownOperation, ReplaceNullableFilePathDownOperationModule, ReplaceNullableFilePathTwoWayOperation, ReplaceNullableFilePathTwoWayOperationModule, ReplaceNullableFilePathUpOperation, ReplaceNumberDownOperation, ReplaceNumberDownOperationModule, ReplaceNumberTwoWayOperation, ReplaceNumberTwoWayOperationModule, ReplaceNumberUpOperation, ReplaceStringDownOperation, ReplaceStringDownOperationModule, ReplaceStringTwoWayOperation, ReplaceStringTwoWayOperationModule, ReplaceStringUpOperation } from '../../../Operations';
import { FilePath } from '../../filePath/global';
import { TransformerFactory } from '../../global';
import { Room, RoomOp } from '../mikro-orm';
import { BoardsOperation, BoardState, BoardValueState, UpdateBoardOperation } from './graphql';
import { AddBoardOp, Board, BoardBase, RemoveBoardOp, UpdateBoardOp } from './mikro-orm';

export namespace GlobalBoard {
    export type StateType = {
        backgroundImage?: FilePath;
        backgroundImageZoom: number;
        cellColumnCount: number;
        cellHeight: number;
        cellOffsetX: number;
        cellOffsetY: number;
        cellRowCount: number;
        cellWidth: number;
        name: string;
    }

    export type DownOperationType = {
        backgroundImage?: ReplaceNullableFilePathDownOperation;
        backgroundImageZoom?: ReplaceNumberDownOperation;
        cellColumnCount?: ReplaceNumberDownOperation;
        cellHeight?: ReplaceNumberDownOperation;
        cellOffsetX?: ReplaceNumberDownOperation;
        cellOffsetY?: ReplaceNumberDownOperation;
        cellRowCount?: ReplaceNumberDownOperation;
        cellWidth?: ReplaceNumberDownOperation;
        name?: ReplaceStringDownOperation;
    }

    export type UpOperationType = {
        backgroundImage?: ReplaceNullableFilePathUpOperation;
        backgroundImageZoom?: ReplaceNumberUpOperation;
        cellColumnCount?: ReplaceNumberUpOperation;
        cellHeight?: ReplaceNumberUpOperation;
        cellOffsetX?: ReplaceNumberUpOperation;
        cellOffsetY?: ReplaceNumberUpOperation;
        cellRowCount?: ReplaceNumberUpOperation;
        cellWidth?: ReplaceNumberUpOperation;
        name?: ReplaceStringUpOperation;
    }

    export type TwoWayOperationType = {
        backgroundImage?: ReplaceNullableFilePathTwoWayOperation;
        backgroundImageZoom?: ReplaceNumberTwoWayOperation;
        cellColumnCount?: ReplaceNumberTwoWayOperation;
        cellHeight?: ReplaceNumberTwoWayOperation;
        cellOffsetX?: ReplaceNumberTwoWayOperation;
        cellOffsetY?: ReplaceNumberTwoWayOperation;
        cellRowCount?: ReplaceNumberTwoWayOperation;
        cellWidth?: ReplaceNumberTwoWayOperation;
        name?: ReplaceStringTwoWayOperation;
    }


    export namespace MikroORM {
        export namespace ToGlobal {
            export const state = (entity: BoardBase): StateType => {
                return {
                    ...entity,
                    backgroundImage: entity.backgroundImagePath != null && entity.backgroundImageSourceType != null ? {
                        path: entity.backgroundImagePath,
                        sourceType: entity.backgroundImageSourceType,
                    } : undefined,
                };
            };

            export const stateMany = (entity: ReadonlyArray<BoardBase>): ReadonlyDualKeyMap<string, string, StateType> => {
                const result = new DualKeyMap<string, string, StateType>();
                for (const elem of entity) {
                    result.set({ first: elem.createdBy, second: elem.stateId }, state(elem));
                }
                return result;
            };

            export const downOperationMany = async ({
                add,
                update,
                remove,
            }: {
                add: Collection<AddBoardOp>;
                update: Collection<UpdateBoardOp>;
                remove: Collection<RemoveBoardOp>;
            }): Promise<Result<ReadonlyDualKeyMapDownOperation<string, string, StateType, DownOperationType>>> => {
                return await createDownOperationFromMikroORM({
                    add,
                    update,
                    remove,
                    toDualKey: x => {
                        return ResultModule.ok({ first: x.createdBy, second: x.stateId });
                    },
                    getState: async x => ResultModule.ok(state(x)),
                    getOperation: async entity => ResultModule.ok({
                        backgroundImage: entity.backgroundImage == null ? undefined : entity.backgroundImage,
                        backgroundImageZoom: entity.backgroundImageZoom == null ? undefined : { oldValue: entity.backgroundImageZoom},
                        cellColumnCount: entity.cellColumnCount == null ? undefined : { oldValue: entity.cellColumnCount },
                        cellHeight: entity.cellHeight == null ? undefined : { oldValue: entity.cellHeight },
                        cellOffsetX: entity.cellOffsetX == null ? undefined : { oldValue: entity.cellOffsetX },
                        cellOffsetY: entity.cellOffsetY == null ? undefined : { oldValue: entity.cellOffsetY },
                        cellRowCount: entity.cellRowCount == null ? undefined : { oldValue: entity.cellRowCount },
                        cellWidth: entity.cellWidth == null ? undefined : { oldValue: entity.cellWidth },
                        name: entity.name == null ? undefined : { oldValue: entity.name },
                    })
                });
            };
        }
    }

    export namespace Global {
        export namespace ToGraphQL {
            export const state = ({ source }: { source: StateType }): BoardValueState => source;

            export const stateMany = ({ source }: { source: ReadonlyDualKeyMap<string, string, StateType> }): BoardState[] => {
                const result: BoardState[] = [];
                source.forEach((value, key) => {
                    result.push({
                        createdBy: key.first,
                        id: key.second,
                        value: state({ source: value }),
                    });
                });
                return result;
            };

            export const operation = ({ operation }: { operation: ReadonlyDualKeyMapTwoWayOperation<string, string, StateType, TwoWayOperationType> }): BoardsOperation => {
                const result: BoardsOperation = { replace: [], update: [] };
                for (const [key, value] of operation) {
                    switch (value.type) {
                        case replace: {
                            if (value.operation.newValue === undefined) {
                                result.replace.push({
                                    createdBy: key.first,
                                    id: key.second,
                                    newValue: undefined,
                                });
                                continue;
                            }
                            result.replace.push({
                                createdBy: key.first,
                                id: key.second,
                                newValue: value.operation.newValue,
                            });
                            continue;
                        }
                        case update: {
                            result.update.push({
                                createdBy: key.first,
                                id: key.second,
                                operation: value.operation,
                            });
                        }
                    }
                }
                return result;
            };
        }

        export const applyToEntity = async ({
            em,
            parent,
            parentOp,
            operation,
        }: {
            em: EM;
            parent: Room;
            parentOp: RoomOp;
            operation: ReadonlyDualKeyMapTwoWayOperation<string, string, StateType, TwoWayOperationType>;
        }) => {
            for (const [key, value] of operation) {
                switch (value.type) {
                    case replace: {
                        if (value.operation.newValue === undefined) {
                            if (value.operation.oldValue === undefined) {
                                console.warn('Replace: oldValue === newValue === undefined. This should be id.');
                                continue;
                            }
                            const toRemove = await em.findOneOrFail(Board, { room: { id: parent.id }, createdBy: key.first, stateId: key.second });
                            em.remove(toRemove);

                            const op = new RemoveBoardOp({
                                ...value.operation.oldValue,
                                createdBy: key.first,
                                stateId: key.second,
                                roomOp: parentOp,
                            });
                            op.backgroundImagePath = value.operation.oldValue.backgroundImage?.path;
                            op.backgroundImageSourceType = value.operation.oldValue.backgroundImage?.sourceType;
                            em.persist(op);
                            continue;
                        }

                        const toAdd = new Board({
                            ...value.operation.newValue,
                            createdBy: key.first,
                            stateId: key.second,
                            room: parent,
                        });
                        toAdd.backgroundImagePath = value.operation.newValue.backgroundImage?.path;
                        toAdd.backgroundImageSourceType = value.operation.newValue.backgroundImage?.sourceType;
                        em.persist(toAdd);

                        const op = new AddBoardOp({ createdBy: key.first, stateId: key.second, roomOp: parentOp });
                        em.persist(op);
                        continue;
                    }
                    case update: {
                        const target = await em.findOneOrFail(Board, { room: { id: parent.id }, createdBy: key.first, stateId: key.second });
                        const op = new UpdateBoardOp({ createdBy: key.first, stateId: key.second, roomOp: parentOp });

                        if (value.operation.backgroundImage != null) {
                            target.backgroundImagePath = value.operation.backgroundImage.newValue?.path;
                            target.backgroundImageSourceType = value.operation.backgroundImage.newValue?.sourceType;
                            op.backgroundImage = value.operation.backgroundImage;
                        }
                        if (value.operation.backgroundImageZoom != null) {
                            target.backgroundImageZoom = value.operation.backgroundImageZoom.newValue;
                            op.backgroundImageZoom = value.operation.backgroundImageZoom.oldValue;
                        }
                        if (value.operation.cellColumnCount != null) {
                            target.cellColumnCount = value.operation.cellColumnCount.newValue;
                            op.cellColumnCount = value.operation.cellColumnCount.oldValue;
                        }
                        if (value.operation.cellHeight != null) {
                            target.cellHeight = value.operation.cellHeight.newValue;
                            op.cellHeight = value.operation.cellHeight.oldValue;
                        }
                        if (value.operation.cellOffsetX != null) {
                            target.cellOffsetX = value.operation.cellOffsetX.newValue;
                            op.cellOffsetX = value.operation.cellOffsetX.oldValue;
                        }
                        if (value.operation.cellOffsetY != null) {
                            target.cellOffsetY = value.operation.cellOffsetY.newValue;
                            op.cellOffsetY = value.operation.cellOffsetY.oldValue;
                        }
                        if (value.operation.cellRowCount != null) {
                            target.cellRowCount = value.operation.cellRowCount.newValue;
                            op.cellRowCount = value.operation.cellRowCount.oldValue;
                        }
                        if (value.operation.cellWidth != null) {
                            target.cellWidth = value.operation.cellWidth.newValue;
                            op.cellWidth = value.operation.cellWidth.oldValue;
                        }
                        if (value.operation.name != null) {
                            target.name = value.operation.name.newValue;
                            op.name = value.operation.name.oldValue;
                        }

                        em.persist(op);
                        continue;
                    }
                }
            }
        };
    }

    export namespace GraphQL {
        export namespace ToGlobal {
            export const state = (object: BoardValueState): StateType => object;

            export const stateMany = (objects: ReadonlyArray<BoardState>) => {
                const result = new DualKeyMap<string, string, StateType>();
                objects.forEach(x => {
                    result.set({ first: x.createdBy, second: x.id }, state(x.value));
                });
                return result;
            };

            const operation = (source: UpdateBoardOperation): UpOperationType => {
                return {
                    backgroundImage: source.operation.backgroundImage,
                    backgroundImageZoom: source.operation.backgroundImageZoom,
                    cellColumnCount: source.operation.cellColumnCount,
                    cellHeight: source.operation.cellHeight,
                    cellOffsetX: source.operation.cellOffsetX,
                    cellOffsetY: source.operation.cellOffsetY,
                    cellRowCount: source.operation.cellRowCount,
                    cellWidth: source.operation.cellWidth,
                    name: source.operation.name,
                };
            };

            export const upOperationMany = (source: BoardsOperation): Result<ReadonlyDualKeyMapUpOperation<string, string, StateType, UpOperationType>> => {
                return createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createDualKey: x => {
                        return ResultModule.ok({ first: x.createdBy, second: x.id });
                    },
                    getState: x => x.newValue == null ? undefined : state(x.newValue),
                    getOperation: x => ResultModule.ok(operation(x)),
                });
            };
        }
    }

    export const transformerFactory: TransformerFactory<DualKey<string, string>, StateType, StateType, DownOperationType, UpOperationType, TwoWayOperationType> = ({
        composeLoose: ({ first, second }) => {
            const valueProps: DownOperationType = {
                backgroundImage: ReplaceNullableFilePathDownOperationModule.compose(first.backgroundImage, second.backgroundImage),
                backgroundImageZoom: ReplaceNumberDownOperationModule.compose(first.backgroundImageZoom, second.backgroundImageZoom),
                cellColumnCount: ReplaceNumberDownOperationModule.compose(first.cellColumnCount, second.cellColumnCount),
                cellHeight: ReplaceNumberDownOperationModule.compose(first.cellHeight, second.cellHeight),
                cellOffsetX: ReplaceNumberDownOperationModule.compose(first.cellOffsetX, second.cellOffsetX),
                cellOffsetY: ReplaceNumberDownOperationModule.compose(first.cellOffsetY, second.cellOffsetY),
                cellRowCount: ReplaceNumberDownOperationModule.compose(first.cellRowCount, second.cellRowCount),
                cellWidth: ReplaceNumberDownOperationModule.compose(first.cellWidth, second.cellWidth),
                name: ReplaceStringDownOperationModule.compose(first.name, second.name),
            };
            return ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            if (downOperation === undefined) {
                return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }

            const prevState: StateType = {
                ...nextState,
            };
            const twoWayOperation: TwoWayOperationType = {};

            if (downOperation.backgroundImage !== undefined) {
                prevState.backgroundImage = downOperation.backgroundImage.oldValue ?? undefined;
                twoWayOperation.backgroundImage = { oldValue: downOperation.backgroundImage.oldValue ?? undefined, newValue: nextState.backgroundImage };
            }
            if (downOperation.backgroundImageZoom !== undefined) {
                prevState.backgroundImageZoom = downOperation.backgroundImageZoom.oldValue;
                twoWayOperation.backgroundImageZoom = { ...downOperation.backgroundImageZoom, newValue: nextState.backgroundImageZoom };
            }
            if (downOperation.cellColumnCount !== undefined) {
                prevState.cellColumnCount = downOperation.cellColumnCount.oldValue;
                twoWayOperation.cellColumnCount = { ...downOperation.cellColumnCount, newValue: nextState.cellColumnCount };
            }
            if (downOperation.cellHeight !== undefined) {
                prevState.cellHeight = downOperation.cellHeight.oldValue;
                twoWayOperation.cellHeight = { ...downOperation.cellHeight, newValue: nextState.cellHeight };
            }
            if (downOperation.cellOffsetX !== undefined) {
                prevState.cellOffsetX = downOperation.cellOffsetX.oldValue;
                twoWayOperation.cellOffsetX = { ...downOperation.cellOffsetX, newValue: nextState.cellOffsetX };
            }
            if (downOperation.cellOffsetY !== undefined) {
                prevState.cellOffsetY = downOperation.cellOffsetY.oldValue;
                twoWayOperation.cellOffsetY = { ...downOperation.cellOffsetY, newValue: nextState.cellOffsetY };
            }
            if (downOperation.cellRowCount !== undefined) {
                prevState.cellRowCount = downOperation.cellRowCount.oldValue;
                twoWayOperation.cellRowCount = { ...downOperation.cellRowCount, newValue: nextState.cellRowCount };
            }
            if (downOperation.cellWidth !== undefined) {
                prevState.cellWidth = downOperation.cellWidth.oldValue;
                twoWayOperation.cellWidth = { ...downOperation.cellWidth, newValue: nextState.cellWidth };
            }
            if (downOperation.name !== undefined) {
                prevState.name = downOperation.name.oldValue;
                twoWayOperation.name = { ...downOperation.name, newValue: nextState.name };
            }

            return ResultModule.ok({ prevState, twoWayOperation });
        },
        transform: ({ prevState, clientOperation, serverOperation }) => {
            const twoWayOperation: TwoWayOperationType = {};

            twoWayOperation.backgroundImage = ReplaceNullableFilePathTwoWayOperationModule.transform({
                first: serverOperation?.backgroundImage,
                second: clientOperation.backgroundImage,
                prevState: prevState.backgroundImage,
            });
            twoWayOperation.backgroundImageZoom = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.backgroundImageZoom,
                second: clientOperation.backgroundImageZoom,
                prevState: prevState.backgroundImageZoom,
            });

            twoWayOperation.cellColumnCount = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.cellColumnCount,
                second: clientOperation.cellColumnCount,
                prevState: prevState.cellColumnCount,
            });
            twoWayOperation.cellHeight = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.cellHeight,
                second: clientOperation.cellHeight,
                prevState: prevState.cellHeight,
            });
            twoWayOperation.cellOffsetX = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.cellOffsetX,
                second: clientOperation.cellOffsetX,
                prevState: prevState.cellOffsetX,
            });
            twoWayOperation.cellOffsetY = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.cellOffsetY,
                second: clientOperation.cellOffsetY,
                prevState: prevState.cellOffsetY,
            });
            twoWayOperation.cellRowCount = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.cellRowCount,
                second: clientOperation.cellRowCount,
                prevState: prevState.cellRowCount,
            });
            twoWayOperation.cellWidth = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.cellWidth,
                second: clientOperation.cellWidth,
                prevState: prevState.cellWidth,
            });
            twoWayOperation.name = ReplaceStringTwoWayOperationModule.transform({
                first: serverOperation?.name,
                second: clientOperation.name,
                prevState: prevState.name,
            });

            if (undefinedForAll(twoWayOperation)) {
                return ResultModule.ok(undefined);
            }

            return ResultModule.ok(twoWayOperation);
        },
        diff: ({ prevState, nextState }) => {
            const resultType: TwoWayOperationType = {};
            if (prevState.backgroundImage !== nextState.backgroundImage) {
                resultType.backgroundImage = { oldValue: prevState.backgroundImage, newValue: nextState.backgroundImage };
            }
            if (prevState.backgroundImageZoom !== nextState.backgroundImageZoom) {
                resultType.backgroundImageZoom = { oldValue: prevState.backgroundImageZoom, newValue: nextState.backgroundImageZoom };
            }
            if (prevState.cellColumnCount !== nextState.cellColumnCount) {
                resultType.cellColumnCount = { oldValue: prevState.cellColumnCount, newValue: nextState.cellColumnCount };
            }
            if (prevState.cellHeight !== nextState.cellHeight) {
                resultType.cellHeight = { oldValue: prevState.cellHeight, newValue: nextState.cellHeight };
            }
            if (prevState.cellOffsetX !== nextState.cellOffsetX) {
                resultType.cellOffsetX = { oldValue: prevState.cellOffsetX, newValue: nextState.cellOffsetX };
            }
            if (prevState.cellOffsetY !== nextState.cellOffsetY) {
                resultType.cellOffsetY = { oldValue: prevState.cellOffsetY, newValue: nextState.cellOffsetY };
            }
            if (prevState.cellRowCount !== nextState.cellRowCount) {
                resultType.cellRowCount = { oldValue: prevState.cellRowCount, newValue: nextState.cellRowCount };
            }
            if (prevState.cellWidth !== nextState.cellWidth) {
                resultType.cellWidth = { oldValue: prevState.cellWidth, newValue: nextState.cellWidth };
            }
            if (prevState.name !== nextState.name) {
                resultType.name = { oldValue: prevState.name, newValue: nextState.name };
            }
            if (undefinedForAll(resultType)) {
                return undefined;
            }
            return resultType;
        },
        applyBack: ({ downOperation, nextState }) => {
            const result: StateType = {
                ...nextState,
            };

            if (downOperation.backgroundImage !== undefined) {
                result.backgroundImage = downOperation.backgroundImage.oldValue ?? undefined;
            }
            if (downOperation.backgroundImageZoom !== undefined) {
                result.backgroundImageZoom = downOperation.backgroundImageZoom.oldValue ?? undefined;
            }
            if (downOperation.cellColumnCount !== undefined) {
                result.cellColumnCount = downOperation.cellColumnCount.oldValue ?? undefined;
            }
            if (downOperation.cellHeight !== undefined) {
                result.cellHeight = downOperation.cellHeight.oldValue ?? undefined;
            }
            if (downOperation.cellOffsetX !== undefined) {
                result.cellOffsetX = downOperation.cellOffsetX.oldValue ?? undefined;
            }
            if (downOperation.cellOffsetY !== undefined) {
                result.cellOffsetY = downOperation.cellOffsetY.oldValue ?? undefined;
            }
            if (downOperation.cellRowCount !== undefined) {
                result.cellRowCount = downOperation.cellRowCount.oldValue ?? undefined;
            }
            if (downOperation.cellWidth !== undefined) {
                result.cellWidth = downOperation.cellWidth.oldValue ?? undefined;
            }
            if (downOperation.name !== undefined) {
                result.name = downOperation.name.oldValue;
            }

            return ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {
        }
    });
}