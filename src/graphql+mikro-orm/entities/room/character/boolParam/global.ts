import { Collection } from '@mikro-orm/core';
import { isStrIndex100, StrIndex100 } from '../../../../../@shared/indexes';
import { Result, ResultModule } from '../../../../../@shared/Result';
import { undefinedForAll } from '../../../../../@shared/utils';
import { EM } from '../../../../../utils/types';
import { ReplaceBooleanDownOperation, ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperation, ReplaceBooleanTwoWayOperationModule, ReplaceBooleanUpOperation, ReplaceNullableBooleanDownOperation, ReplaceNullableBooleanDownOperationModule, ReplaceNullableBooleanTwoWayOperation, ReplaceNullableBooleanTwoWayOperationModule, ReplaceNullableBooleanUpOperation } from '../../../../Operations';
import { createDownOperationFromMikroORM, createUpOperationFromGraphQL } from '../../../../paramMapOperations';
import { ParamMapTransformerFactory, TransformerFactory } from '../../../global';
import { Chara, UpdateCharaOp } from '../mikro-orm';
import { BoolParamsOperation, BoolParamState, BoolParamValueState } from './graphql';
import { BoolParam, BoolParamBase, UpdateBoolParamOp } from './mikro-orm';

export namespace GlobalBoolParam {
    export type StateType = {
        isValuePrivate: boolean;
        value?: boolean;
    }

    export type DownOperationType = {
        isValuePrivate?: ReplaceBooleanDownOperation;
        value?: ReplaceNullableBooleanDownOperation;
    }

    export type UpOperationType = {
        isValuePrivate?: ReplaceBooleanUpOperation;
        value?: ReplaceNullableBooleanUpOperation;
    }

    export type TwoWayOperationType = {
        isValuePrivate?: ReplaceBooleanTwoWayOperation;
        value?: ReplaceNullableBooleanTwoWayOperation;
    }

    const createDefaultState = (): StateType => ({ isValuePrivate: false });

    export namespace MikroORM {
        export namespace ToGlobal {
            export const state = (entity: BoolParamBase): StateType => ({ ...entity });

            export const stateMany = (entity: ReadonlyArray<BoolParamBase>): ReadonlyMap<StrIndex100, StateType> => {
                const result = new Map<StrIndex100, StateType>();
                for (const elem of entity) {
                    if (!isStrIndex100(elem.key)) {
                        continue;
                    }
                    result.set(elem.key, state(elem));
                }
                return result;
            };

            export const downOperationMany = async ({
                update,
            }: {
                update: Collection<UpdateBoolParamOp>;
            }): Promise<Result<ReadonlyMap<StrIndex100, DownOperationType>>> => {
                return await createDownOperationFromMikroORM({
                    update,
                    toKey: x => {
                        if (!isStrIndex100(x.key)) {
                            throw 'key must be "1", or "2", or ..., or "100"';
                        }
                        return ResultModule.ok(x.key);
                    },
                    getOperation: async entity => ResultModule.ok({
                        isValuePrivate: entity.isValuePrivate == null ? undefined : { oldValue: entity.isValuePrivate },
                        value: entity.value,
                    })
                });
            };
        }
    }

    export namespace Global {
        export namespace ToGraphQL {
            export const state = ({ source, createdByMe }: { source: StateType; createdByMe: boolean }): BoolParamValueState => {
                if (source.isValuePrivate && !createdByMe) {
                    return {
                        ...source,
                        value: undefined,
                    };
                }
                return source;
            };

            export const stateMany = ({ source, createdByMe }: { source: ReadonlyMap<StrIndex100, StateType>; createdByMe: boolean }): BoolParamState[] => {
                const result: BoolParamState[] = [];
                source.forEach((value, key) => {
                    result.push({
                        key,
                        value: state({ source: value, createdByMe }),
                    });
                });
                return result;
            };

            export const operation = ({
                operation,
                prevState,
                nextState,
                createdByMe
            }: {
                operation: ReadonlyMap<StrIndex100, TwoWayOperationType>;
                prevState: ReadonlyMap<StrIndex100, StateType>;
                nextState: ReadonlyMap<StrIndex100, StateType>;
                createdByMe: boolean;
            }): BoolParamsOperation => {
                const result: BoolParamsOperation = { update: [] };
                for (const [key, value] of operation) {
                    const isPrevValuePrivate = !createdByMe && (prevState.get(key)?.isValuePrivate ?? createDefaultState().isValuePrivate);
                    const isNextValuePrivate = !createdByMe && (nextState.get(key)?.isValuePrivate ?? createDefaultState().isValuePrivate);
                    result.update.push({
                        key,
                        operation: {
                            isValuePrivate: value.isValuePrivate,
                            value: (() => {
                                if (isPrevValuePrivate) {
                                    if (isNextValuePrivate) {
                                        return undefined;
                                    }
                                    return { oldValue: undefined, newValue: nextState.get(key)?.value ?? createDefaultState().value };
                                }
                                if (isNextValuePrivate) {
                                    return { oldValue: prevState.get(key)?.value ?? createDefaultState().value, newValue: undefined };
                                }
                                return value.value;
                            })(),
                        },
                    });
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
            parent: Chara;
            parentOp: UpdateCharaOp;
            operation: ReadonlyMap<StrIndex100, TwoWayOperationType>;
        }) => {
            for (const [key, value] of operation) {
                let target = await em.findOne(BoolParam, { chara: { id: parent.id }, key });
                if (target == null) {
                    target = new BoolParam({ key, isValuePrivate: false, chara: parent });
                }

                const op = new UpdateBoolParamOp({ key, updateCharaOp: parentOp });

                if (value.isValuePrivate != null) {
                    target.isValuePrivate = value.isValuePrivate.newValue;
                    op.isValuePrivate = value.isValuePrivate.oldValue;
                }
                if (value.value != null) {
                    target.value = value.value.newValue;
                    op.value = value.value;
                }

                em.persist(op);
                continue;
            }
        };
    }

    export namespace GraphQL {
        export namespace ToGlobal {
            export const state = (object: BoolParamValueState): StateType => object;

            export const stateMany = (objects: ReadonlyArray<BoolParamState>) => {
                const result = new Map<StrIndex100, StateType>();
                objects.forEach(x => {
                    if (!isStrIndex100(x.key)) {
                        return;
                    }
                    result.set(x.key, state(x.value));
                });
                return result;
            };

            export const upOperationMany = (source: BoolParamsOperation): Result<ReadonlyMap<StrIndex100, UpOperationType>> => {
                return createUpOperationFromGraphQL({
                    update: source.update,
                    createKey: x => {
                        if (!isStrIndex100(x.key)) {
                            return ResultModule.error('key must be "1", or "2", or ..., or "100"');
                        }
                        return ResultModule.ok(x.key);
                    },
                    getOperation: x => ({
                        isValuePrivate: x.operation.isValuePrivate,
                        value: x.operation.value,
                    }),
                });
            };
        }
    }

    export const transformerFactory = (createdByMe: boolean): ParamMapTransformerFactory<StrIndex100, StateType, StateType, DownOperationType, UpOperationType, TwoWayOperationType> => ({
        composeLoose: ({ first, second }) => {
            const valueProps: DownOperationType = {
                isValuePrivate: ReplaceBooleanDownOperationModule.compose(first.isValuePrivate, second.isValuePrivate),
                value: ReplaceNullableBooleanDownOperationModule.compose(first.value, second.value),
            };
            return ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            if (downOperation === undefined) {
                return ResultModule.ok({ prevState: nextState, nextState, twoWayOperation: undefined });
            }

            const prevState: StateType = { ...nextState };
            const twoWayOperation: TwoWayOperationType = {};

            if (downOperation.isValuePrivate !== undefined) {
                prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
                twoWayOperation.isValuePrivate = { ...downOperation.isValuePrivate, newValue: nextState.isValuePrivate };
            }
            if (downOperation.value !== undefined) {
                prevState.value = downOperation.value.oldValue ?? undefined;
                twoWayOperation.value = { oldValue: downOperation.value.oldValue ?? undefined, newValue: nextState.value };
            }

            return ResultModule.ok({ prevState, nextState, twoWayOperation });
        },
        transform: ({ prevState, currentState, clientOperation, serverOperation }) => {
            const twoWayOperation: TwoWayOperationType = {};

            if (createdByMe) {
                twoWayOperation.isValuePrivate = ReplaceBooleanTwoWayOperationModule.transform({
                    first: serverOperation?.isValuePrivate,
                    second: clientOperation.isValuePrivate,
                    prevState: prevState.isValuePrivate,
                });
            }
            if (createdByMe || !currentState.isValuePrivate) {
                twoWayOperation.value = ReplaceNullableBooleanTwoWayOperationModule.transform({
                    first: serverOperation?.value,
                    second: clientOperation.value,
                    prevState: prevState.value,
                });
            }

            if (undefinedForAll(twoWayOperation)) {
                return ResultModule.ok(undefined);
            }

            return ResultModule.ok({ ...twoWayOperation });
        },
        diff: ({ prevState, nextState }) => {
            const resultType: TwoWayOperationType = {};
            if (prevState.isValuePrivate !== nextState.isValuePrivate) {
                resultType.isValuePrivate = { oldValue: prevState.isValuePrivate, newValue: nextState.isValuePrivate };
            }
            if (prevState.value !== nextState.value) {
                resultType.value = { oldValue: prevState.value, newValue: nextState.value };
            }
            if (undefinedForAll(resultType)) {
                return undefined;
            }
            return { ...resultType };
        },
        applyBack: ({ downOperation, nextState }) => {
            const result = { ...nextState };

            if (downOperation.isValuePrivate !== undefined) {
                result.isValuePrivate = downOperation.isValuePrivate.oldValue;
            }
            if (downOperation.value !== undefined) {
                result.value = downOperation.value.oldValue ?? undefined;
            }

            return ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        createDefaultState,
    });
}