import { Collection } from '@mikro-orm/core';
import { DualKey, DualKeyMap, ReadonlyDualKeyMap } from '../../../@shared/DualKeyMap';
import { Result, ResultModule } from '../../../@shared/Result';
import { EM } from '../../../utils/types';
import { createDownOperationFromMikroORM, createUpOperationFromGraphQL, ReadonlyDualKeyMapDownOperation, ReadonlyDualKeyMapTwoWayOperation, ReadonlyDualKeyMapUpOperation, replace, toGraphQLWithState, update } from '../../dualKeyMapOperations';
import { ReplaceBooleanDownOperation, ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperation, ReplaceBooleanTwoWayOperationModule, ReplaceBooleanUpOperation, ReplaceNumberDownOperation, ReplaceNumberDownOperationModule, ReplaceNumberTwoWayOperation, ReplaceNumberTwoWayOperationModule, ReplaceNumberUpOperation } from '../../Operations';
import { Chara, UpdateCharaOp } from '../room/character/mikro-orm';
import { AddCharaPieceOp, CharaPiece, RemoveCharaPieceOp, UpdateCharaPieceOp } from '../room/character/piece/mikro-orm';
import { TransformerFactory } from '../global';
import { AddMyValuePieceOp, MyValuePiece, RemoveMyValuePieceOp, UpdateMyValuePieceOp } from '../room/participant/myValue/mikro-orm_piece';
import { MyValue, UpdateMyValueOp } from '../room/participant/myValue/mikro-orm_value';
import { PiecesOperation, PieceState, PieceValueState } from './graphql';
import { undefinedForAll } from '../../../@shared/utils';

export namespace GlobalPiece {
    export type StateType = {
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

    export type StateEntityBase = StateType;

    export type DownOperationType = {
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

    export type DownOperationEntityBase = {
        cellH?: number;
        cellW?: number;
        cellX?: number;
        cellY?: number;
        h?: number;
        isCellMode?: boolean;
        isPrivate?: boolean;
        w?: number;
        x?: number;
        y?: number;
    }

    export type UpOperationType = {
        cellH?: ReplaceNumberUpOperation;
        cellW?: ReplaceNumberUpOperation;
        cellX?: ReplaceNumberUpOperation;
        cellY?: ReplaceNumberUpOperation;
        h?: ReplaceNumberUpOperation;
        isCellMode?: ReplaceBooleanUpOperation;
        isPrivate?: ReplaceBooleanUpOperation;
        w?: ReplaceNumberUpOperation;
        x?: ReplaceNumberUpOperation;
        y?: ReplaceNumberUpOperation;
    }

    export type TwoWayOperationType = {
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

    export namespace MikroORM {
        export namespace ToGlobal {
            export const state = (entity: StateType): StateType => ({ ...entity });

            export const stateMany = <T extends StateType>(entity: ReadonlyArray<T>, toDualKey: (source: T) => DualKey<string, string>): ReadonlyDualKeyMap<string, string, StateType> => {
                const result = new DualKeyMap<string, string, StateType>();
                for (const elem of entity) {
                    result.set(toDualKey(elem), state(elem));
                }
                return result;
            };

            export const downOperationMany = async <TAdd, TRemove extends StateType, TUpdate extends DownOperationEntityBase>({
                add,
                update,
                remove,
                toDualKey,
            }: {
                add: Collection<TAdd>;
                update: Collection<TUpdate>;
                remove: Collection<TRemove>;
                toDualKey: (source: TAdd | TUpdate | TRemove) => DualKey<string, string>;
            }): Promise<Result<ReadonlyDualKeyMapDownOperation<string, string, StateType, DownOperationType>>> => {
                return await createDownOperationFromMikroORM({
                    add,
                    update,
                    remove,
                    toDualKey: x => {
                        return ResultModule.ok(toDualKey(x));
                    },
                    getState: async x => ResultModule.ok(state(x)),
                    getOperation: async entity => ResultModule.ok({
                        cellH: entity.cellH == null ? undefined : { oldValue: entity.cellH },
                        cellW: entity.cellW == null ? undefined : { oldValue: entity.cellW },
                        cellX: entity.cellX == null ? undefined : { oldValue: entity.cellX },
                        cellY: entity.cellY == null ? undefined : { oldValue: entity.cellY },
                        h: entity.h == null ? undefined : { oldValue: entity.h },
                        isCellMode: entity.isCellMode == null ? undefined : { oldValue: entity.isCellMode },
                        isPrivate: entity.isPrivate == null ? undefined : { oldValue: entity.isPrivate },
                        w: entity.w == null ? undefined : { oldValue: entity.w },
                        x: entity.x == null ? undefined : { oldValue: entity.x },
                        y: entity.y == null ? undefined : { oldValue: entity.y },
                    })
                });
            };
        }
    }

    export namespace Global {
        export namespace ToGraphQL {
            export const state = ({ source, createdByMe }: { source: StateType; createdByMe: boolean }): PieceValueState | undefined => {
                if (!createdByMe && source.isPrivate) {
                    return undefined;
                }
                return source;
            };

            export const stateMany = ({ source, createdByMe }: { source: ReadonlyDualKeyMap<string, string, StateType>; createdByMe: boolean }): PieceState[] => {
                const result: PieceState[] = [];
                source.forEach((value, key) => {
                    const newState = state({ source: value, createdByMe });
                    if (newState != null) {
                        result.push({
                            boardCreatedBy: key.first,
                            boardId: key.second,
                            value: newState,
                        });
                    }
                });
                return result;
            };

            export const operation = ({
                operation,
                prevState,
                nextState,
                createdByMe
            }: {
                operation: ReadonlyDualKeyMapTwoWayOperation<string, string, StateType, TwoWayOperationType>;
                prevState: ReadonlyDualKeyMap<string, string, StateType>;
                nextState: ReadonlyDualKeyMap<string, string, StateType>;
                createdByMe: boolean;
            }): PiecesOperation => {
                return toGraphQLWithState({
                    source: operation,
                    prevState,
                    nextState,
                    isPrivate: state => !createdByMe && state.isPrivate,
                    toReplaceOperation: ({ nextState, key }) => ({
                        boardCreatedBy: key.first,
                        boardId: key.second,
                        newValue: nextState === undefined ? undefined : state({
                            source: nextState,
                            createdByMe,
                        })
                    }),
                    toUpdateOperation: ({ operation, key }) => ({
                        boardCreatedBy: key.first,
                        boardId: key.second,
                        operation: operation
                    }),
                });
            };
        }

        const applyToCharaPieceEntity = ({
            globalOperation,
            stateEntity,
            opEntity
        }: {
            globalOperation: TwoWayOperationType;
            stateEntity: StateEntityBase;
            opEntity: DownOperationEntityBase;
        }): void => {
            if (globalOperation.cellH != null) {
                stateEntity.cellH = globalOperation.cellH.newValue;
                opEntity.cellH = globalOperation.cellH.oldValue;
            }
            if (globalOperation.cellW != null) {
                stateEntity.cellW = globalOperation.cellW.newValue;
                opEntity.cellW = globalOperation.cellW.oldValue;
            }
            if (globalOperation.cellX != null) {
                stateEntity.cellX = globalOperation.cellX.newValue;
                opEntity.cellX = globalOperation.cellX.oldValue;
            }
            if (globalOperation.cellY != null) {
                stateEntity.cellY = globalOperation.cellY.newValue;
                opEntity.cellY = globalOperation.cellY.oldValue;
            }
            if (globalOperation.h != null) {
                stateEntity.h = globalOperation.h.newValue;
                opEntity.h = globalOperation.h.oldValue;
            }
            if (globalOperation.isCellMode != null) {
                stateEntity.isCellMode = globalOperation.isCellMode.newValue;
                opEntity.isCellMode = globalOperation.isCellMode.oldValue;
            }
            if (globalOperation.isPrivate != null) {
                stateEntity.isPrivate = globalOperation.isPrivate.newValue;
                opEntity.isPrivate = globalOperation.isPrivate.oldValue;
            }
            if (globalOperation.w != null) {
                stateEntity.w = globalOperation.w.newValue;
                opEntity.w = globalOperation.w.oldValue;
            }
            if (globalOperation.x != null) {
                stateEntity.x = globalOperation.x.newValue;
                opEntity.x = globalOperation.x.oldValue;
            }
            if (globalOperation.y != null) {
                stateEntity.y = globalOperation.y.newValue;
                opEntity.y = globalOperation.y.oldValue;
            }
        };

        export const applyToCharaPiecesEntity = async ({
            em,
            parent,
            parentOp,
            operation,
        }: {
            em: EM;
            parent: Chara;
            parentOp: UpdateCharaOp;
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
                            const toRemove = await em.findOneOrFail(CharaPiece, { chara: { id: parent.id }, boardCreatedBy: key.first, boardId: key.second });
                            em.remove(toRemove);

                            const op = new RemoveCharaPieceOp({
                                ...value.operation.oldValue,
                                boardCreatedBy: key.first,
                                boardId: key.second,
                                updateCharaOp: parentOp,
                            });
                            em.persist(op);
                            continue;
                        }

                        const toAdd = new CharaPiece({
                            ...value.operation.newValue,
                            boardCreatedBy: key.first,
                            boardId: key.second,
                            chara: parent,
                        });
                        em.persist(toAdd);

                        const op = new AddCharaPieceOp({ boardCreatedBy: key.first, boardId: key.second, updateCharaOp: parentOp });
                        em.persist(op);
                        continue;
                    }
                    case update: {
                        const target = await em.findOneOrFail(CharaPiece, { chara: { id: parent.id }, boardCreatedBy: key.first, boardId: key.second });
                        const op = new UpdateCharaPieceOp({ boardCreatedBy: key.first, boardId: key.second, updateCharaOp: parentOp });

                        applyToCharaPieceEntity({ opEntity: op, stateEntity: target, globalOperation: value.operation });

                        em.persist(op);
                        continue;
                    }
                }
            }
        };

        export const applyToMyValuePiecesEntity = async ({
            em,
            parent,
            parentOp,
            operation,
        }: {
            em: EM;
            parent: MyValue;
            parentOp: UpdateMyValueOp;
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
                            const toRemove = await em.findOneOrFail(MyValuePiece, { myValue: { id: parent.id }, boardCreatedBy: key.first, boardId: key.second });
                            em.remove(toRemove);

                            const op = new RemoveMyValuePieceOp({
                                ...value.operation.oldValue,
                                boardCreatedBy: key.first,
                                boardId: key.second,
                                updateMyValueOp: parentOp,
                            });
                            em.persist(op);
                            continue;
                        }

                        const toAdd = new MyValuePiece({
                            ...value.operation.newValue,
                            boardCreatedBy: key.first,
                            boardId: key.second,
                            myValue: parent,
                        });
                        em.persist(toAdd);

                        const op = new AddMyValuePieceOp({ boardCreatedBy: key.first, boardId: key.second, updateMyValueOp: parentOp });
                        em.persist(op);
                        continue;
                    }
                    case update: {
                        const target = await em.findOneOrFail(MyValuePiece, { myValue: { id: parent.id }, boardCreatedBy: key.first, boardId: key.second });
                        const op = new UpdateMyValuePieceOp({ boardCreatedBy: key.first, boardId: key.second, updateMyValueOp: parentOp });

                        applyToCharaPieceEntity({ opEntity: op, stateEntity: target, globalOperation: value.operation });

                        em.persist(op);
                        continue;
                    }
                }
            }
        };
    }

    export namespace GraphQL {
        export namespace ToGlobal {
            export const state = (object: PieceValueState): StateType => object;

            export const stateMany = (objects: ReadonlyArray<PieceState>) => {
                const result = new DualKeyMap<string, string, StateType>();
                objects.forEach(x => {
                    result.set({ first: x.boardCreatedBy, second: x.boardId }, state(x.value));
                });
                return result;
            };

            export const upOperationMany = (source: PiecesOperation): Result<ReadonlyDualKeyMapUpOperation<string, string, StateType, UpOperationType>> => {
                return createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createDualKey: x => {
                        return ResultModule.ok({ first: x.boardCreatedBy, second: x.boardId });
                    },
                    getState: x => x.newValue == null ? undefined : state(x.newValue),
                    getOperation: x => ResultModule.ok({
                        cellH: x.operation.cellH,
                        cellW: x.operation.cellW,
                        cellX: x.operation.cellX,
                        cellY: x.operation.cellY,
                        h: x.operation.h,
                        isCellMode: x.operation.isCellMode,
                        isPrivate: x.operation.isPrivate,
                        w: x.operation.w,
                        x: x.operation.x,
                        y: x.operation.y,
                    }),
                });
            };
        }
    }

    export const transformerFactory = <TKey>(createdByMe: boolean): TransformerFactory<TKey, StateType, StateType, DownOperationType, UpOperationType, TwoWayOperationType> => ({
        composeLoose: ({ first, second }) => {
            const valueProps: DownOperationType = {
                cellH: ReplaceNumberDownOperationModule.compose(first.cellH, second.cellH),
                cellW: ReplaceNumberDownOperationModule.compose(first.cellW, second.cellW),
                cellX: ReplaceNumberDownOperationModule.compose(first.cellX, second.cellX),
                cellY: ReplaceNumberDownOperationModule.compose(first.cellY, second.cellY),
                h: ReplaceNumberDownOperationModule.compose(first.h, second.h),
                isCellMode: ReplaceBooleanDownOperationModule.compose(first.isCellMode, second.isCellMode),
                isPrivate: ReplaceBooleanDownOperationModule.compose(first.isPrivate, second.isPrivate),
                w: ReplaceNumberDownOperationModule.compose(first.w, second.w),
                x: ReplaceNumberDownOperationModule.compose(first.x, second.x),
                y: ReplaceNumberDownOperationModule.compose(first.y, second.y),
            };
            return ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            if (downOperation === undefined) {
                return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }
            const prevState = { ...nextState };
            const twoWayOperation: TwoWayOperationType = {};

            if (downOperation.cellH !== undefined) {
                prevState.cellH = downOperation.cellH.oldValue;
                twoWayOperation.cellH = { ...downOperation.cellH, newValue: nextState.cellH };
            }
            if (downOperation.cellW !== undefined) {
                prevState.cellW = downOperation.cellW.oldValue;
                twoWayOperation.cellW = { ...downOperation.cellW, newValue: nextState.cellW };
            }
            if (downOperation.cellX !== undefined) {
                prevState.cellX = downOperation.cellX.oldValue;
                twoWayOperation.cellX = { ...downOperation.cellX, newValue: nextState.cellX };
            }
            if (downOperation.cellY !== undefined) {
                prevState.cellY = downOperation.cellY.oldValue;
                twoWayOperation.cellY = { ...downOperation.cellY, newValue: nextState.cellY };
            }
            if (downOperation.h !== undefined) {
                prevState.h = downOperation.h.oldValue;
                twoWayOperation.h = { ...downOperation.h, newValue: nextState.h };
            }
            if (downOperation.isCellMode !== undefined) {
                prevState.isCellMode = downOperation.isCellMode.oldValue;
                twoWayOperation.isCellMode = { ...downOperation.isCellMode, newValue: nextState.isCellMode };
            }
            if (downOperation.isPrivate !== undefined) {
                prevState.isPrivate = downOperation.isPrivate.oldValue;
                twoWayOperation.isPrivate = { ...downOperation.isPrivate, newValue: nextState.isPrivate };
            }
            if (downOperation.w !== undefined) {
                prevState.w = downOperation.w.oldValue;
                twoWayOperation.w = { ...downOperation.w, newValue: nextState.w };
            }
            if (downOperation.x !== undefined) {
                prevState.x = downOperation.x.oldValue;
                twoWayOperation.x = { ...downOperation.x, newValue: nextState.x };
            }
            if (downOperation.y !== undefined) {
                prevState.y = downOperation.y.oldValue;
                twoWayOperation.y = { ...downOperation.y, newValue: nextState.y };
            }

            return ResultModule.ok({ prevState, twoWayOperation });
        },
        transform: ({ prevState, clientOperation, serverOperation, currentState }) => {
            if (!createdByMe && currentState.isPrivate) {
                return ResultModule.ok(undefined);
            }

            const twoWayOperation: TwoWayOperationType = {};

            twoWayOperation.cellH = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.cellH,
                second: clientOperation.cellH,
                prevState: prevState.cellH,
            });
            twoWayOperation.cellW = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.cellW,
                second: clientOperation.cellW,
                prevState: prevState.cellW,
            });
            twoWayOperation.cellX = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.cellX,
                second: clientOperation.cellX,
                prevState: prevState.cellX,
            });
            twoWayOperation.cellY = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.cellY,
                second: clientOperation.cellY,
                prevState: prevState.cellY,
            });
            twoWayOperation.h = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.h,
                second: clientOperation.h,
                prevState: prevState.h,
            });
            twoWayOperation.isCellMode = ReplaceBooleanTwoWayOperationModule.transform({
                first: serverOperation?.isCellMode,
                second: clientOperation.isCellMode,
                prevState: prevState.isCellMode,
            });
            twoWayOperation.isPrivate = ReplaceBooleanTwoWayOperationModule.transform({
                first: serverOperation?.isPrivate,
                second: clientOperation.isPrivate,
                prevState: prevState.isPrivate,
            });
            twoWayOperation.w = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.w,
                second: clientOperation.w,
                prevState: prevState.w,
            });
            twoWayOperation.x = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.x,
                second: clientOperation.x,
                prevState: prevState.x,
            });
            twoWayOperation.y = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.y,
                second: clientOperation.y,
                prevState: prevState.y,
            });

            if (undefinedForAll(twoWayOperation)) {
                return ResultModule.ok(undefined);
            }

            return ResultModule.ok(twoWayOperation);
        },
        diff: ({ prevState, nextState }) => {
            const resultType: TwoWayOperationType = {};
            if (prevState.cellH !== nextState.cellH) {
                resultType.cellH = { oldValue: prevState.cellH, newValue: nextState.cellH };
            }
            if (prevState.cellW !== nextState.cellW) {
                resultType.cellW = { oldValue: prevState.cellW, newValue: nextState.cellW };
            }
            if (prevState.cellX !== nextState.cellX) {
                resultType.cellX = { oldValue: prevState.cellX, newValue: nextState.cellX };
            }
            if (prevState.cellY !== nextState.cellY) {
                resultType.cellY = { oldValue: prevState.cellY, newValue: nextState.cellY };
            }
            if (prevState.h !== nextState.h) {
                resultType.h = { oldValue: prevState.h, newValue: nextState.h };
            }
            if (prevState.isCellMode !== nextState.isCellMode) {
                resultType.isCellMode = { oldValue: prevState.isCellMode, newValue: nextState.isCellMode };
            }
            if (prevState.isPrivate !== nextState.isPrivate) {
                resultType.isPrivate = { oldValue: prevState.isPrivate, newValue: nextState.isPrivate };
            }
            if (prevState.w !== nextState.w) {
                resultType.w = { oldValue: prevState.w, newValue: nextState.w };
            }
            if (prevState.x !== nextState.x) {
                resultType.x = { oldValue: prevState.x, newValue: nextState.x };
            }
            if (prevState.y !== nextState.y) {
                resultType.y = { oldValue: prevState.y, newValue: nextState.y };
            }
            if (undefinedForAll(resultType)) {
                return undefined;
            }
            return resultType;
        },
        applyBack: ({ downOperation, nextState }) => {
            const result = { ...nextState };

            if (downOperation.cellH !== undefined) {
                result.cellH = downOperation.cellH.oldValue;
            }
            if (downOperation.cellW !== undefined) {
                result.cellW = downOperation.cellW.oldValue;
            }
            if (downOperation.cellX !== undefined) {
                result.cellX = downOperation.cellX.oldValue;
            }
            if (downOperation.cellY !== undefined) {
                result.cellY = downOperation.cellY.oldValue;
            }
            if (downOperation.h !== undefined) {
                result.h = downOperation.h.oldValue;
            }
            if (downOperation.isCellMode !== undefined) {
                result.isCellMode = downOperation.isCellMode.oldValue;
            }
            if (downOperation.isPrivate !== undefined) {
                result.isPrivate = downOperation.isPrivate.oldValue;
            }
            if (downOperation.w !== undefined) {
                result.w = downOperation.w.oldValue;
            }
            if (downOperation.x !== undefined) {
                result.x = downOperation.x.oldValue;
            }
            if (downOperation.y !== undefined) {
                result.y = downOperation.y.oldValue;
            }

            return ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {
            cancelRemove: ({ nextState }) => !createdByMe && nextState.isPrivate,
        }
    });
}