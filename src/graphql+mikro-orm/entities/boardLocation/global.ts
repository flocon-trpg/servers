import { Collection } from '@mikro-orm/core';
import { DualKey, DualKeyMap, ReadonlyDualKeyMap } from '../../../@shared/DualKeyMap';
import { Result, ResultModule } from '../../../@shared/Result';
import { EM } from '../../../utils/types';
import { createDownOperationFromMikroORM, createUpOperationFromGraphQL, ReadonlyDualKeyMapDownOperation, ReadonlyDualKeyMapTwoWayOperation, ReadonlyDualKeyMapUpOperation, replace, toGraphQLWithState, update } from '../../dualKeyMapOperations';
import { ReplaceBooleanDownOperation, ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperation, ReplaceBooleanTwoWayOperationModule, ReplaceBooleanUpOperation, ReplaceNumberDownOperation, ReplaceNumberDownOperationModule, ReplaceNumberTwoWayOperation, ReplaceNumberTwoWayOperationModule, ReplaceNumberUpOperation } from '../../Operations';
import { Chara, UpdateCharaOp } from '../room/character/mikro-orm';
import { TransformerFactory } from '../global';
import { BoardLocationsOperation, BoardLocationState, BoardLocationValueState } from './graphql';
import { AddTachieLocOp, RemoveTachieLocOp, TachieLoc, UpdateTachieLocOp } from '../room/character/tachie/mikro-orm';
import { undefinedForAll } from '../../../@shared/utils';

// Pieceからcell関係などを取り除いたもの。立ち絵などに用いる。
export namespace GlobalBoardLocation {
    export type StateType = {
        h: number;
        isPrivate: boolean;
        w: number;
        x: number;
        y: number;
    }

    export type StateEntityBase = StateType;

    export type DownOperationType = {
        h?: ReplaceNumberDownOperation;
        isPrivate?: ReplaceBooleanDownOperation;
        w?: ReplaceNumberDownOperation;
        x?: ReplaceNumberDownOperation;
        y?: ReplaceNumberDownOperation;
    }

    export type DownOperationEntityBase = {
        h?: number;
        isPrivate?: boolean;
        w?: number;
        x?: number;
        y?: number;
    }

    export type UpOperationType = {
        h?: ReplaceNumberUpOperation;
        isPrivate?: ReplaceBooleanUpOperation;
        w?: ReplaceNumberUpOperation;
        x?: ReplaceNumberUpOperation;
        y?: ReplaceNumberUpOperation;
    }

    export type TwoWayOperationType = {
        h?: ReplaceNumberTwoWayOperation;
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
                        h: entity.h == null ? undefined : { oldValue: entity.h },
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
            export const state = ({ source, createdByMe }: { source: StateType; createdByMe: boolean }): BoardLocationValueState | undefined => {
                if (!createdByMe && source.isPrivate) {
                    return undefined;
                }
                return source;
            };

            export const stateMany = ({ source, createdByMe }: { source: ReadonlyDualKeyMap<string, string, StateType>; createdByMe: boolean }): BoardLocationState[] => {
                const result: BoardLocationState[] = [];
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
            }): BoardLocationsOperation => {
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

        const applyToTachieLocBaseEntity = ({
            globalOperation,
            stateEntity,
            opEntity
        }: {
            globalOperation: TwoWayOperationType;
            stateEntity: StateEntityBase;
            opEntity: DownOperationEntityBase;
        }): void => {
            if (globalOperation.h != null) {
                stateEntity.h = globalOperation.h.newValue;
                opEntity.h = globalOperation.h.oldValue;
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

        export const applyToTachieLocsEntity = async ({
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
                            const toRemove = await em.findOneOrFail(TachieLoc, { chara: { id: parent.id }, boardCreatedBy: key.first, boardId: key.second });
                            em.remove(toRemove);

                            const op = new RemoveTachieLocOp({
                                ...value.operation.oldValue,
                                boardCreatedBy: key.first,
                                boardId: key.second,
                                updateCharaOp: parentOp,
                            });
                            em.persist(op);
                            continue;
                        }

                        const toAdd = new TachieLoc({
                            ...value.operation.newValue,
                            boardCreatedBy: key.first,
                            boardId: key.second,
                            chara: parent,
                        });
                        em.persist(toAdd);

                        const op = new AddTachieLocOp({ boardCreatedBy: key.first, boardId: key.second, updateCharaOp: parentOp });
                        em.persist(op);
                        continue;
                    }
                    case update: {
                        const target = await em.findOneOrFail(TachieLoc, { chara: { id: parent.id }, boardCreatedBy: key.first, boardId: key.second });
                        const op = new UpdateTachieLocOp({ boardCreatedBy: key.first, boardId: key.second, updateCharaOp: parentOp });

                        applyToTachieLocBaseEntity({ opEntity: op, stateEntity: target, globalOperation: value.operation });

                        em.persist(op);
                        continue;
                    }
                }
            }
        };
    }

    export namespace GraphQL {
        export namespace ToGlobal {
            export const state = (object: BoardLocationValueState): StateType => object;

            export const stateMany = (objects: ReadonlyArray<BoardLocationState>) => {
                const result = new DualKeyMap<string, string, StateType>();
                objects.forEach(x => {
                    result.set({ first: x.boardCreatedBy, second: x.boardId }, state(x.value));
                });
                return result;
            };

            export const upOperationMany = (source: BoardLocationsOperation): Result<ReadonlyDualKeyMapUpOperation<string, string, StateType, UpOperationType>> => {
                return createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createDualKey: x => {
                        return ResultModule.ok({ first: x.boardCreatedBy, second: x.boardId });
                    },
                    getState: x => x.newValue == null ? undefined : state(x.newValue),
                    getOperation: x => ResultModule.ok({
                        h: x.operation.h,
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
                h: ReplaceNumberDownOperationModule.compose(first.h, second.h),
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

            if (downOperation.h !== undefined) {
                prevState.h = downOperation.h.oldValue;
                twoWayOperation.h = { ...downOperation.h, newValue: nextState.h };
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

            twoWayOperation.h = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.h,
                second: clientOperation.h,
                prevState: prevState.h,
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
            if (prevState.h !== nextState.h) {
                resultType.h = { oldValue: prevState.h, newValue: nextState.h };
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

            if (downOperation.h !== undefined) {
                result.h = downOperation.h.oldValue;
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