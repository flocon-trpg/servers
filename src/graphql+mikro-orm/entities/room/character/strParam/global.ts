import { Collection } from '@mikro-orm/core';
import { isStrIndex100, StrIndex100 } from '../../../../../@shared/indexes';
import { Result, ResultModule } from '../../../../../@shared/Result';
import { undefinedForAll } from '../../../../../utils/helpers';
import { EM } from '../../../../../utils/types';
import { ReplaceBooleanDownOperation, ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperation, ReplaceBooleanTwoWayOperationModule, ReplaceBooleanUpOperation, TextDownOperation, TextDownOperationModule, TextOperationErrorModule, TextTwoWayOperation, TextTwoWayOperationModule, TextUpOperation, TextUpOperationModule } from '../../../../Operations';
import { createDownOperationFromMikroORM, createUpOperationFromGraphQL } from '../../../../paramMapOperations';
import { ParamMapTransformerFactory, TransformerFactory } from '../../../global';
import { Chara, UpdateCharaOp } from '../mikro-orm';
import { StrParamsOperation, StrParamState, StrParamValueState } from './graphql';
import { StrParam, StrParamBase, UpdateStrParamOp } from './mikro-orm';

export namespace GlobalStrParam {
    export type StateType = {
        isValuePrivate: boolean;
        value: string;
    }

    export type DownOperationType = {
        isValuePrivate?: ReplaceBooleanDownOperation;
        value?: TextDownOperation;
    }

    export type UpOperationType = {
        isValuePrivate?: ReplaceBooleanUpOperation;
        value?: TextUpOperation;
    }

    export type TwoWayOperationType = {
        isValuePrivate?: ReplaceBooleanTwoWayOperation;
        value?: TextTwoWayOperation;
    }

    const createDefaultState = (): StateType => ({ isValuePrivate: false, value: '' });

    export namespace MikroORM {
        export namespace ToGlobal {
            export const state = (entity: StrParamBase): StateType => ({ ...entity });

            export const stateMany = (entity: ReadonlyArray<StrParamBase>): ReadonlyMap<StrIndex100, StateType> => {
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
                update: Collection<UpdateStrParamOp>;
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
                        value: TextDownOperationModule.ofUnitAndValidate(entity.value),
                    })
                });
            };
        }
    }

    export namespace Global {
        export namespace ToGraphQL {
            export const state = ({ source, createdByMe }: { source: StateType; createdByMe: boolean }): StrParamValueState => {
                if (source.isValuePrivate && !createdByMe) {
                    return {
                        ...source,
                        value: createDefaultState().value,
                    };
                }
                return source;
            };

            export const stateMany = ({ source, createdByMe }: { source: ReadonlyMap<StrIndex100, StateType>; createdByMe: boolean }): StrParamState[] => {
                const result: StrParamState[] = [];
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
            }): StrParamsOperation => {
                const result: StrParamsOperation = { update: [] };
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
                                    const operation = TextTwoWayOperationModule.diff('', nextState.get(key)?.value ?? createDefaultState().value);
                                    return TextTwoWayOperationModule.toUpUnit(operation);
                                }
                                if (isNextValuePrivate) {
                                    const operation = TextTwoWayOperationModule.diff(prevState.get(key)?.value ?? createDefaultState().value, '');
                                    return TextTwoWayOperationModule.toUpUnit(operation);
                                }
                                return value.value == null ? undefined : TextTwoWayOperationModule.toUpUnit(value.value);
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
                let target = await em.findOne(StrParam, { chara: { id: parent.id }, key });
                if (target == null) {
                    target = new StrParam({ key, isValuePrivate: false, value: '', chara: parent });
                    em.persist(target);
                }

                const op = new UpdateStrParamOp({ key, updateCharaOp: parentOp });

                if (value.isValuePrivate != null) {
                    target.isValuePrivate = value.isValuePrivate.newValue;
                    op.isValuePrivate = value.isValuePrivate.oldValue;
                }
                if (value.value != null) {
                    const newValue = TextTwoWayOperationModule.apply(target.value, value.value);
                    if (newValue.isError) {
                        return ResultModule.error(TextOperationErrorModule.toString(newValue.error));
                    }
                    target.value = newValue.value;
                    op.value = TextTwoWayOperationModule.toDownUnit(value.value);
                }

                em.persist(op);
                continue;
            }
        };
    }

    export namespace GraphQL {
        export namespace ToGlobal {
            export const state = (object: StrParamValueState): StateType => object;

            export const stateMany = (objects: ReadonlyArray<StrParamState>) => {
                const result = new Map<StrIndex100, StateType>();
                objects.forEach(x => {
                    if (!isStrIndex100(x.key)) {
                        return;
                    }
                    result.set(x.key, state(x.value));
                });
                return result;
            };

            export const upOperationMany = (source: StrParamsOperation): Result<ReadonlyMap<StrIndex100, UpOperationType>> => {
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
                        value: TextUpOperationModule.ofUnit(x.operation.value),
                    }),
                });
            };
        }
    }

    export const transformerFactory = (createdByMe: boolean): ParamMapTransformerFactory<StrIndex100, StateType, StateType, DownOperationType, UpOperationType, TwoWayOperationType> => ({
        composeLoose: ({ first, second }) => {
            const valueProps: DownOperationType = {
                isValuePrivate: ReplaceBooleanDownOperationModule.compose(first.isValuePrivate, second.isValuePrivate),
                value: TextDownOperationModule.compose(first.value, second.value),
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
                const restored = TextDownOperationModule.applyBackAndRestore(nextState.value ?? '', downOperation.value);
                if (restored.isError) {
                    return ResultModule.error(TextOperationErrorModule.toString(restored.error));
                }
                prevState.value = restored.value.prevState;
                twoWayOperation.value = restored.value.restored;
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
                const value = TextTwoWayOperationModule.transform({
                    first: serverOperation?.value,
                    second: clientOperation.value,
                    prevState: prevState.value ?? '',
                });
                if (value.isError) {
                    return ResultModule.error(TextOperationErrorModule.toString(value.error));
                }
                twoWayOperation.value = value.value.secondPrime;
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
                resultType.value = TextTwoWayOperationModule.diff(prevState.value ?? '', nextState.value ?? '');
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
                const applied = TextDownOperationModule.applyBack(nextState.value ?? '', downOperation.value);
                if (applied.isError) {
                    return ResultModule.error(TextOperationErrorModule.toString(applied.error));
                }
                result.value = applied.value;
            }

            return ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        createDefaultState,
    });
}