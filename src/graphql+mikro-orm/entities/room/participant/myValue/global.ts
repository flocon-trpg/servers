import { Collection } from '@mikro-orm/core';
import { number } from 'yargs';
import { DualKey, DualKeyMap, ReadonlyDualKeyMap } from '../../../../../@shared/DualKeyMap';
import { Result, ResultModule } from '../../../../../@shared/Result';
import { ReadonlyStateMap } from '../../../../../@shared/StateMap';
import { undefinedForAll } from '../../../../../utils/helpers';
import { EM } from '../../../../../utils/types';
import { ReadonlyDualKeyMapDownOperation, ReadonlyDualKeyMapTwoWayOperation, ReadonlyDualKeyMapUpOperation } from '../../../../dualKeyMapOperations';
import { createDownOperationFromMikroORM, createUpOperationFromGraphQL, ReadonlyMapDownOperation, ReadonlyMapTwoWayOperation, ReadonlyMapUpOperation, replace, toGraphQLWithState, update } from '../../../../mapOperations';
import { ReplaceBooleanDownOperation, ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperation, ReplaceBooleanTwoWayOperationModule, ReplaceBooleanUpOperation, ReplaceNullableNumberDownOperation, ReplaceNullableNumberDownOperationModule, ReplaceNullableNumberTwoWayOperation, ReplaceNullableNumberTwoWayOperationModule, ReplaceNullableNumberUpOperation, ReplaceNumberDownOperation, ReplaceNumberDownOperationModule, ReplaceNumberTwoWayOperation, ReplaceNumberTwoWayOperationModule, ReplaceNumberUpOperation } from '../../../../Operations';
import { DualKeyMapTransformer, TransformerFactory } from '../../../global';
import { GlobalPiece } from '../../../piece/global';
import { Partici, UpdateParticiOp } from '../mikro-orm';
import { MyValuePiece, RemovedMyValuePieceByMyValue } from './mikro-orm_piece';
import { AddMyValueOp, MyValue, MyValueBase, RemovedMyValue, RemoveMyValueOp, UpdateMyValueOp } from './mikro-orm_value';
import { MyNumberValuesOperation, MyNumberValueState, MyNumberValueStateValue } from './number/graphql';
import { isNumberValueStateJsonType, numberOperation, NumberValueOperationJsonType, NumberValueStateJsonType } from './number/jsonType';

export namespace GlobalMyValue {
    type StateTypeValue = {
        isValuePrivate: boolean;
        valueRangeMin?: number;
        valueRangeMax?: number;
        value: number;
    };

    export type StateType = StateTypeValue & {
        pieces: ReadonlyDualKeyMap<string, string, GlobalPiece.StateType>;
    }

    type DownOperationTypeValue = {
        isValuePrivate?: ReplaceBooleanDownOperation;
        valueRangeMin?: ReplaceNullableNumberDownOperation;
        valueRangeMax?: ReplaceNullableNumberDownOperation;
        value?: ReplaceNumberDownOperation;
    };

    export type DownOperationType = DownOperationTypeValue & {
        pieces: ReadonlyDualKeyMapDownOperation<string, string, GlobalPiece.StateType, GlobalPiece.DownOperationType>;
    }

    type UpOperationTypeValue = {
        isValuePrivate?: ReplaceBooleanUpOperation;
        value?: ReplaceNumberUpOperation;
        valueRangeMax?: ReplaceNullableNumberUpOperation;
        valueRangeMin?: ReplaceNullableNumberUpOperation;
    }

    export type UpOperationType = UpOperationTypeValue & {
        pieces: ReadonlyDualKeyMapUpOperation<string, string, GlobalPiece.StateType, GlobalPiece.UpOperationType>;
    }

    type TwoWayOperationTypeValue = {
        isValuePrivate?: ReplaceBooleanTwoWayOperation;
        value?: ReplaceNumberTwoWayOperation;
        valueRangeMax?: ReplaceNullableNumberTwoWayOperation;
        valueRangeMin?: ReplaceNullableNumberTwoWayOperation;
    }

    export type TwoWayOperationType = TwoWayOperationTypeValue & {
        pieces: ReadonlyDualKeyMapTwoWayOperation<string, string, GlobalPiece.StateType, GlobalPiece.TwoWayOperationType>;
    }

    export namespace MikroORM {
        export namespace ToGlobal {
            const stateCore = (entity: MyValueBase): StateTypeValue => {
                return {
                    // mikro-ormにより生成されたJSONを用いるのは避けたほうがいい気がする（具体的な根拠なし）ので、新しいオブジェクトを生成している。

                    isValuePrivate: entity.value.isValuePrivate,
                    valueRangeMin: entity.value.valueRangeMin ?? undefined,
                    valueRangeMax: entity.value.valueRangeMax ?? undefined,
                    value: entity.value.value,
                };
            };

            export const state = async (entity: MyValue): Promise<StateType> => {
                const pieces = GlobalPiece.MikroORM.ToGlobal.stateMany(await entity.myValuePieces.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));

                return {
                    ...stateCore(entity),
                    pieces,
                };
            };

            export const stateMany = async (entity: ReadonlyArray<MyValue>): Promise<ReadonlyMap<string, StateType>> => {
                const result = new Map<string, StateType>();
                for (const elem of entity) {
                    const value = await state(elem);
                    result.set(elem.stateId, value);
                }
                return result;
            };

            export const stateFromRemoveMyValueOp = async (entity: RemoveMyValueOp): Promise<StateType> => {
                const pieces = GlobalPiece.MikroORM.ToGlobal.stateMany(await entity.removedMyValuePieces.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));
                return {
                    ...stateCore(entity),
                    pieces,
                };
            };

            export const stateManyFromRemoveMyValueOp = async (entity: ReadonlyArray<RemoveMyValueOp>): Promise<ReadonlyMap<string, StateType>> => {
                const result = new Map<string, StateType>();
                for (const elem of entity) {
                    const value = await stateFromRemoveMyValueOp(elem);
                    result.set(elem.stateId, value);
                }
                return result;
            };

            export const stateFromRemovedMyValueOp = async (entity: RemovedMyValue): Promise<StateType> => {
                const pieces = GlobalPiece.MikroORM.ToGlobal.stateMany(await entity.removedMyValuePieces.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));
                return {
                    ...stateCore(entity),
                    pieces,
                };
            };

            export const stateManyFromRemovedMyValueOp = async (entity: ReadonlyArray<RemovedMyValue>): Promise<ReadonlyMap<string, StateType>> => {
                const result = new Map<string, StateType>();
                for (const elem of entity) {
                    const value = await stateFromRemovedMyValueOp(elem);
                    result.set(elem.stateId, value);
                }
                return result;
            };

            export const downOperationMany = async ({
                add,
                update,
                remove,
            }: {
                add: Collection<AddMyValueOp>;
                update: Collection<UpdateMyValueOp>;
                remove: Collection<RemoveMyValueOp>;
            }): Promise<Result<ReadonlyMapDownOperation<string, StateType, DownOperationType>>> => {
                return await createDownOperationFromMikroORM({
                    add,
                    update,
                    remove,
                    toKey: x => {
                        return ResultModule.ok(x.stateId);
                    },
                    getState: async x => ResultModule.ok(await stateFromRemoveMyValueOp(x)),
                    getOperation: async entity => {
                        const pieces = await GlobalPiece.MikroORM.ToGlobal.downOperationMany({
                            add: entity.addPieceOps,
                            remove: entity.removePieceOps,
                            update: entity.updatePieceOps,
                            toDualKey: x => ({ first: x.boardCreatedBy, second: x.boardId }),
                        });
                        if (pieces.isError) {
                            return pieces;
                        }

                        return ResultModule.ok({
                            pieces: pieces.value,
                            isValuePrivate: entity.value.isValuePrivate ?? undefined,
                            value: entity.value.value ?? undefined,
                            valueRangeMax: entity.value.valueRangeMax ?? undefined,
                            valueRangeMin: entity.value.valueRangeMin ?? undefined,
                        });
                    },
                });
            };
        }
    }

    export namespace Global {
        export namespace ToGraphQL {
            export const state = ({ source, createdByMe }: { source: StateType; createdByMe: boolean }): MyNumberValueStateValue => {
                return {
                    ...source,
                    value: createdByMe || !source.isValuePrivate ? source.value : 0,
                    valueRangeMax: source.valueRangeMax ?? undefined,
                    valueRangeMin: source.valueRangeMin ?? undefined,
                    pieces: GlobalPiece.Global.ToGraphQL.stateMany({ source: source.pieces, createdByMe }),
                };
            };

            export const stateMany = ({ source, createdByMe }: { source: ReadonlyMap<string, StateType>; createdByMe: boolean }): MyNumberValueState[] => {
                const result: MyNumberValueState[] = [];
                source.forEach((value, key) => {
                    result.push({
                        stateId: key,
                        value: state({ source: value, createdByMe }),
                    });
                });
                return result;
            };

            export const operation = ({
                operation,
                prevState,
                nextState,
                createdByMe,
            }: {
                operation: ReadonlyMapTwoWayOperation<string, StateType, TwoWayOperationType>;
                prevState: ReadonlyMap<string, StateType>;
                nextState: ReadonlyMap<string, StateType>;
                createdByMe: boolean;
            }): MyNumberValuesOperation => {
                return toGraphQLWithState({
                    source: operation,
                    prevState,
                    nextState,
                    isPrivate: () => false,
                    toReplaceOperation: ({ nextState, key }) => ({
                        stateId: key,
                        newValue: nextState === undefined ? undefined : state({
                            source: nextState,
                            createdByMe,
                        })
                    }),
                    toUpdateOperation: ({ operation, prevState, nextState, key }) => {
                        const pieces = GlobalPiece.Global.ToGraphQL.operation({
                            operation: operation.pieces,
                            prevState: prevState.pieces,
                            nextState: nextState.pieces,
                            createdByMe,
                        });
                        const isPrevValuePrivate = prevState.isValuePrivate && !createdByMe;
                        const isNextValuePrivate = nextState.isValuePrivate && !createdByMe;
                        return {
                            stateId: key,
                            operation: {
                                isValuePrivate: operation.isValuePrivate ?? undefined,
                                value: ((): ReplaceNumberTwoWayOperation | undefined => {
                                    if (isPrevValuePrivate) {
                                        if (isNextValuePrivate) {
                                            return undefined;
                                        }
                                        return { oldValue: 0, newValue: nextState.value };
                                    }
                                    if (isNextValuePrivate) {
                                        return { oldValue: prevState.value, newValue: 0 };
                                    }
                                    return operation.value;
                                })(),
                                valueRangeMax: operation.valueRangeMax,
                                valueRangeMin: operation.valueRangeMin,
                                pieces,
                            },
                        };
                    },
                });
            };
        }

        export const applyToEntity = async ({
            em,
            parent,
            parentOp,
            operation,
        }: {
            em: EM;
            parent: Partici;
            parentOp: UpdateParticiOp;
            operation: ReadonlyMapTwoWayOperation<string, StateType, TwoWayOperationType>;
        }) => {
            for (const [key, value] of operation) {
                switch (value.type) {
                    case replace: {
                        if (value.operation.newValue === undefined) {
                            if (value.operation.oldValue === undefined) {
                                console.warn('Replace: oldValue === newValue === undefined. This should be id.');
                                continue;
                            }
                            const toRemove = await em.findOneOrFail(MyValue, { partici: { id: parent.id }, stateId: key });
                            em.remove(toRemove);

                            const op = new RemoveMyValueOp({
                                stateId: key,
                                value: {
                                    // spread syntaxを使うと余計な値がJSONとして保存されるので、それを避けるため全て列挙して記述している。

                                    version: 1,
                                    type: 'number',
                                    isValuePrivate: value.operation.oldValue.isValuePrivate,
                                    value: value.operation.oldValue.value,
                                    valueRangeMax: value.operation.oldValue.valueRangeMax,
                                    valueRangeMin: value.operation.oldValue.valueRangeMin,
                                },
                                updateParticiOp: parentOp,
                            });
                            value.operation.oldValue.pieces.forEach((piece, key) => {
                                op.removedMyValuePieces.add(new RemovedMyValuePieceByMyValue({
                                    ...piece,
                                    boardCreatedBy: key.first,
                                    boardId: key.second,
                                    removeMyValueOp: op,
                                }));
                            });
                            em.persist(op);
                            continue;
                        }

                        const toAdd = new MyValue({
                            stateId: key,
                            value: {
                                // spread syntaxを使うと余計な値がJSONとして保存されるので、それを避けるため全て列挙して記述している。

                                version: 1,
                                type: 'number',
                                isValuePrivate: value.operation.newValue.isValuePrivate,
                                value: value.operation.newValue.value,
                                valueRangeMax: value.operation.newValue.valueRangeMax,
                                valueRangeMin: value.operation.newValue.valueRangeMin,
                            },
                            partici: parent,
                        });
                        parent.myValues.add(toAdd);
                        value.operation.newValue.pieces.forEach((piece, key) => {
                            const newPiece = new MyValuePiece({
                                ...piece,
                                boardCreatedBy: key.first,
                                boardId: key.second,
                                myValue: toAdd,
                            });
                            em.persist(newPiece);
                        });

                        const op = new AddMyValueOp({ stateId: key, updateParticiOp: parentOp });
                        em.persist(op);

                        continue;
                    }
                    case update: {
                        const target = await em.findOneOrFail(MyValue, { partici: { id: parent.id }, stateId: key });

                        const opJson: NumberValueOperationJsonType = {
                            version: 1,
                            type: numberOperation,
                        };

                        if (value.operation.isValuePrivate != null) {
                            target.value.isValuePrivate = value.operation.isValuePrivate.newValue;
                            opJson.isValuePrivate = value.operation.isValuePrivate;
                        }
                        if (value.operation.value != null) {
                            target.value.value = value.operation.value.newValue;
                            opJson.value = value.operation.value;
                        }
                        if (value.operation.valueRangeMax != null) {
                            target.value.valueRangeMax = value.operation.valueRangeMax.newValue;
                            opJson.valueRangeMax = value.operation.valueRangeMax;
                        }
                        if (value.operation.valueRangeMin != null) {
                            target.value.valueRangeMin = value.operation.valueRangeMin.newValue;
                            opJson.valueRangeMin = value.operation.valueRangeMin;
                        }

                        const op = new UpdateMyValueOp({ stateId: key, value: opJson, updateParticiOp: parentOp });

                        await GlobalPiece.Global.applyToMyValuePiecesEntity({ em, parent: target, parentOp: op, operation: value.operation.pieces });

                        em.persist(op);
                        continue;
                    }
                }
            }
        };

    }

    export namespace GraphQL {
        export namespace ToGlobal {
            export const state = (object: MyNumberValueStateValue): StateType => {
                const pieces = GlobalPiece.GraphQL.ToGlobal.stateMany(object.pieces);

                return {
                    ...object,
                    value: object.value ?? 0,
                    pieces,
                };
            };

            export const stateMany = (objects: ReadonlyArray<MyNumberValueState>) => {
                const result = new Map<string, StateType>();
                objects.forEach(x => {
                    result.set(x.stateId, state(x.value));
                });
                return result;
            };

            export const upOperationMany = (source: MyNumberValuesOperation): Result<ReadonlyMapUpOperation<string, StateType, UpOperationType>> => {
                return createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createKey: x => {
                        return ResultModule.ok(x.stateId);
                    },
                    getState: x => x.newValue == null ? undefined : state(x.newValue),
                    getOperation: x => {
                        const pieces = GlobalPiece.GraphQL.ToGlobal.upOperationMany(x.operation.pieces);
                        if (pieces.isError) {
                            return pieces;
                        }
                        return ResultModule.ok({
                            ...x.operation,
                            pieces: pieces.value,
                        });
                    },
                });
            };
        }
    }

    const createPieceTransformer = (createdByMe: boolean) => GlobalPiece.transformerFactory<DualKey<string, string>>(createdByMe);
    const createPiecesTransformer = (createdByMe: boolean) => new DualKeyMapTransformer(createPieceTransformer(createdByMe));

    export const transformerFactory = (createdByMe: boolean): TransformerFactory<string, StateType, StateType, DownOperationType, UpOperationType, TwoWayOperationType> => ({
        composeLoose: ({ first, second }) => {
            const piecesTransformer = createPiecesTransformer(createdByMe);
            const pieces = piecesTransformer.composeLoose({
                first: first.pieces,
                second: second.pieces,
            });
            if (pieces.isError) {
                return pieces;
            }

            const valueProps: DownOperationType = {
                isValuePrivate: ReplaceBooleanDownOperationModule.compose(first.isValuePrivate ?? undefined, second.isValuePrivate ?? undefined),
                value: ReplaceNumberDownOperationModule.compose(first.value ?? undefined, second.value ?? undefined),
                valueRangeMax: ReplaceNullableNumberDownOperationModule.compose(first.valueRangeMax ?? undefined, second.valueRangeMax ?? undefined),
                valueRangeMin: ReplaceNullableNumberDownOperationModule.compose(first.valueRangeMin ?? undefined, second.valueRangeMin ?? undefined),
                pieces: pieces.value ?? new DualKeyMap(),
            };
            return ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            if (downOperation === undefined) {
                return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }

            const piecesTransformer = createPiecesTransformer(createdByMe);
            const pieces = piecesTransformer.restore({
                nextState: nextState.pieces,
                downOperation: downOperation.pieces,
            });
            if (pieces.isError) {
                return pieces;
            }

            const prevState: StateType = { ...nextState, pieces: pieces.value.prevState, };
            const twoWayOperation: TwoWayOperationType = { pieces: pieces.value.twoWayOperation };

            if (downOperation.isValuePrivate != null) {
                prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
                twoWayOperation.isValuePrivate = { ...downOperation.isValuePrivate, newValue: nextState.isValuePrivate };
            }
            if (downOperation.value != null) {
                prevState.value = downOperation.value.oldValue;
                twoWayOperation.value = { ...downOperation.value, newValue: nextState.value };
            }
            if (downOperation.valueRangeMax != null) {
                prevState.valueRangeMax = downOperation.valueRangeMax.oldValue ?? undefined;
                twoWayOperation.valueRangeMax = { oldValue: downOperation.valueRangeMax.oldValue ?? undefined, newValue: nextState.valueRangeMax ?? undefined };
            }
            if (downOperation.valueRangeMin != null) {
                prevState.valueRangeMin = downOperation.valueRangeMin.oldValue ?? undefined;
                twoWayOperation.valueRangeMin = { oldValue: downOperation.valueRangeMin.oldValue ?? undefined, newValue: nextState.valueRangeMin ?? undefined };
            }

            return ResultModule.ok({ prevState, nextState, twoWayOperation });
        },
        transform: ({ prevState, clientOperation, serverOperation, currentState }) => {
            if (!createdByMe) {
                // 自分以外はどのプロパティも編集できない。
                return ResultModule.ok(undefined);
            }

            const piecesTransformer = createPiecesTransformer(createdByMe);
            const pieces = piecesTransformer.transform({
                prevState: prevState.pieces,
                currentState: currentState.pieces,
                clientOperation: clientOperation.pieces,
                serverOperation: serverOperation?.pieces ?? new DualKeyMap(),
            });
            if (pieces.isError) {
                return pieces;
            }

            const twoWayOperation: TwoWayOperationType = { pieces: pieces.value };

            twoWayOperation.isValuePrivate = ReplaceBooleanTwoWayOperationModule.transform({
                first: serverOperation?.isValuePrivate ?? undefined,
                second: clientOperation.isValuePrivate ?? undefined,
                prevState: prevState.isValuePrivate,
            });
            // !createdByMe の場合は最初の方ですべて弾いているため、isValuePrivateのチェックをする必要はない。
            twoWayOperation.value = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.value ?? undefined,
                second: clientOperation.value ?? undefined,
                prevState: prevState.value,
            });
            twoWayOperation.valueRangeMax = ReplaceNullableNumberTwoWayOperationModule.transform({
                first: serverOperation?.valueRangeMax ?? undefined,
                second: clientOperation.valueRangeMax ?? undefined,
                prevState: prevState.valueRangeMax ?? undefined,
            });
            twoWayOperation.valueRangeMin = ReplaceNullableNumberTwoWayOperationModule.transform({
                first: serverOperation?.valueRangeMin ?? undefined,
                second: clientOperation.valueRangeMin ?? undefined,
                prevState: prevState.valueRangeMin ?? undefined,
            });

            if (undefinedForAll(twoWayOperation)) {
                return ResultModule.ok(undefined);
            }

            return ResultModule.ok({ ...twoWayOperation });
        },
        diff: ({ prevState, nextState }) => {
            const piecesTransformer = createPiecesTransformer(createdByMe);
            const pieces = piecesTransformer.diff({
                prevState: prevState.pieces,
                nextState: nextState.pieces,
            });
            const resultType: TwoWayOperationType = {
                pieces,
            };
            if (prevState.isValuePrivate !== nextState.isValuePrivate) {
                resultType.isValuePrivate = { oldValue: prevState.isValuePrivate, newValue: nextState.isValuePrivate };
            }
            if (prevState.value !== nextState.value) {
                resultType.value = { oldValue: prevState.value, newValue: nextState.value };
            }
            if (prevState.valueRangeMax != nextState.valueRangeMax) {
                resultType.valueRangeMax = { oldValue: prevState.valueRangeMax, newValue: nextState.valueRangeMax };
            }
            if (prevState.valueRangeMin != nextState.valueRangeMin) {
                resultType.valueRangeMin = { oldValue: prevState.valueRangeMin, newValue: nextState.valueRangeMin };
            }
            if (undefinedForAll(resultType)) {
                return undefined;
            }
            return { ...resultType };
        },
        applyBack: ({ downOperation, nextState }) => {
            const piecesTransformer = createPiecesTransformer(createdByMe);
            const pieces = piecesTransformer.applyBack({
                downOperation: downOperation.pieces,
                nextState: nextState.pieces,
            });
            if (pieces.isError) {
                return pieces;
            }

            const result: StateType = { ...nextState, pieces: pieces.value };

            if (downOperation.isValuePrivate != null) {
                result.isValuePrivate = downOperation.isValuePrivate.oldValue;
            }
            if (downOperation.value != null) {
                result.value = downOperation.value.oldValue;
            }
            if (downOperation.valueRangeMin != null) {
                result.valueRangeMin = downOperation.valueRangeMin.oldValue ?? undefined;
            }
            if (downOperation.valueRangeMax != null) {
                result.valueRangeMax = downOperation.valueRangeMax.oldValue ?? undefined;
            }

            return ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {
            cancelRemove: () => !createdByMe,
            cancelCreate: () => !createdByMe,
        },
    });
}