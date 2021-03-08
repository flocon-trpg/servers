import { Collection } from '@mikro-orm/core';
import { DualKey, DualKeyMap, ReadonlyDualKeyMap } from '../../../../@shared/DualKeyMap';
import { isStrIndex100, StrIndex100 } from '../../../../@shared/indexes';
import { Result, ResultModule } from '../../../../@shared/Result';
import { RoomParameterNameType } from '../../../../enums/RoomParameterNameType';
import { undefinedForAll } from '../../../../utils/helpers';
import { EM } from '../../../../utils/types';
import { createDownOperationFromMikroORM, createUpOperationFromGraphQL, ReadonlyDualKeyMapDownOperation, ReadonlyDualKeyMapTwoWayOperation, ReadonlyDualKeyMapUpOperation, replace, update } from '../../../dualKeyMapOperations';
import { ReplaceStringDownOperation, ReplaceStringDownOperationModule, ReplaceStringTwoWayOperation, ReplaceStringTwoWayOperationModule, ReplaceStringUpOperation } from '../../../Operations';
import { TransformerFactory } from '../../global';
import { Room, RoomOp } from '../mikro-orm';
import { ParamNamesOperation, ParamNameState, ParamNameValueState } from './graphql';
import { AddParamNameOp, ParamName, ParamNameBase, RemoveParamNameOp, UpdateParamNameOp } from './mikro-orm';

export namespace GlobalParamName {
    export type StateType = {
        name: string;
    }

    export type DownOperationType = {
        name?: ReplaceStringDownOperation;
    }

    export type UpOperationType = {
        name?: ReplaceStringUpOperation;
    }

    export type TwoWayOperationType = {
        name?: ReplaceStringTwoWayOperation;
    }

    export namespace MikroORM {
        export namespace ToGlobal {
            export const state = (entity: ParamNameBase): StateType => ({ ...entity });

            export const stateMany = (entity: ReadonlyArray<ParamNameBase>): ReadonlyDualKeyMap<RoomParameterNameType, StrIndex100, StateType> => {
                const result = new DualKeyMap<RoomParameterNameType, StrIndex100, StateType>();
                for (const elem of entity) {
                    if (!isStrIndex100(elem.key)) {
                        continue;
                    }
                    result.set({ first: elem.type, second: elem.key }, state(elem));
                }
                return result;
            };

            export const downOperationMany = async ({
                add,
                update,
                remove,
            }: {
                add: Collection<AddParamNameOp>;
                update: Collection<UpdateParamNameOp>;
                remove: Collection<RemoveParamNameOp>;
            }): Promise<Result<ReadonlyDualKeyMapDownOperation<RoomParameterNameType, StrIndex100, StateType, DownOperationType>>> => {
                return await createDownOperationFromMikroORM({
                    add,
                    update,
                    remove,
                    toDualKey: x => {
                        if (!isStrIndex100(x.key)) {
                            throw 'key must be "1", or "2", or ..., or "100"';
                        }
                        return ResultModule.ok({ first: x.type, second: x.key });
                    },
                    getState: async x => ResultModule.ok(state(x)),
                    getOperation: async entity => ResultModule.ok({
                        name: entity.name == null ? undefined : { oldValue: entity.name },
                    })
                });
            };
        }
    }

    export namespace Global {
        export namespace ToGraphQL {
            export const state = ({ source }: { source: StateType }): ParamNameValueState => source;

            export const stateMany = ({ source }: { source: ReadonlyDualKeyMap<RoomParameterNameType, StrIndex100, StateType> }): ParamNameState[] => {
                const result: ParamNameState[] = [];
                source.forEach((value, key) => {
                    result.push({
                        type: key.first,
                        key: key.second,
                        value: state({ source: value }),
                    });
                });
                return result;
            };

            export const operation = ({ operation }: { operation: ReadonlyDualKeyMapTwoWayOperation<RoomParameterNameType, StrIndex100, StateType, TwoWayOperationType> }): ParamNamesOperation => {
                const result: ParamNamesOperation = { replace: [], update: [] };
                for (const [key, value] of operation) {
                    switch (value.type) {
                        case replace: {
                            if (value.operation.newValue === undefined) {
                                result.replace.push({
                                    type: key.first,
                                    key: key.second,
                                    newValue: undefined,
                                });
                                continue;
                            }
                            result.replace.push({
                                type: key.first,
                                key: key.second,
                                newValue: value.operation.newValue,
                            });
                            continue;
                        }
                        case update: {
                            result.update.push({
                                type: key.first,
                                key: key.second,
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
            operation: ReadonlyDualKeyMapTwoWayOperation<RoomParameterNameType, StrIndex100, StateType, TwoWayOperationType>;
        }) => {
            for (const [key, value] of operation) {
                switch (value.type) {
                    case replace: {
                        if (value.operation.newValue === undefined) {
                            if (value.operation.oldValue === undefined) {
                                console.warn('Replace: oldValue === newValue === undefined. This should be id.');
                                continue;
                            }
                            const toRemove = await em.findOneOrFail(ParamName, { room: { id: parent.id }, type: key.first, key: key.second });
                            em.remove(toRemove);

                            const op = new RemoveParamNameOp({
                                type: key.first,
                                key: key.second,
                                name: value.operation.oldValue.name,
                                roomOp: parentOp,
                            });
                            em.persist(op);
                            continue;
                        }

                        const toAdd = new ParamName({
                            type: key.first,
                            key: key.second,
                            name: value.operation.newValue.name,
                            room: parent,
                        });
                        em.persist(toAdd);

                        const op = new AddParamNameOp({ type: key.first, key: key.second, roomOp: parentOp });
                        em.persist(op);
                        continue;
                    }
                    case update: {
                        const target = await em.findOneOrFail(ParamName, { room: { id: parent.id }, type: key.first, key: key.second });
                        const op = new UpdateParamNameOp({ type: key.first, key: key.second, roomOp: parentOp  });

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
            export const state = (entity: ParamNameValueState): StateType => ({ ...entity });

            export const upOperationMany = (source: ParamNamesOperation): Result<ReadonlyDualKeyMapUpOperation<RoomParameterNameType, StrIndex100, StateType, UpOperationType>> => {
                return createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createDualKey: x => {
                        if (!isStrIndex100(x.key)) {
                            return ResultModule.error('key must be "1", or "2", or ..., or "100"');
                        }
                        return ResultModule.ok({ first: x.type, second: x.key });
                    },
                    getState: x => x.newValue == null ? undefined : state(x.newValue),
                    getOperation: x => ResultModule.ok({
                        name: x.operation.name,
                    }),
                });
            };
        }
    }

    export const transformerFactory: TransformerFactory<DualKey<RoomParameterNameType, StrIndex100>, StateType, StateType, DownOperationType, UpOperationType, TwoWayOperationType> = ({
        composeLoose: ({ first, second }) => {
            const valueProps: DownOperationType = {
                name: ReplaceStringDownOperationModule.compose(first.name, second.name),
            };
            return ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            if (downOperation === undefined) {
                return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }

            const prevState: StateType = { ...nextState };
            const twoWayOperation: TwoWayOperationType = {};

            if (downOperation.name !== undefined) {
                prevState.name = downOperation.name.oldValue;
                twoWayOperation.name = { ...downOperation.name, newValue: nextState.name };
            }

            return ResultModule.ok({ prevState, twoWayOperation });
        },
        transform: ({ prevState, clientOperation, serverOperation }) => {
            const twoWayOperation: TwoWayOperationType = {};

            twoWayOperation.name = ReplaceStringTwoWayOperationModule.transform({
                first: serverOperation?.name,
                second: clientOperation.name,
                prevState: prevState.name,
            });

            if (undefinedForAll(twoWayOperation)) {
                return ResultModule.ok(undefined);
            }

            return ResultModule.ok({ ...twoWayOperation });
        },
        diff: ({ prevState, nextState }) => {
            const resultType: TwoWayOperationType = {};
            if (prevState.name !== nextState.name) {
                resultType.name = { oldValue: prevState.name, newValue: nextState.name };
            }
            if (undefinedForAll(resultType)) {
                return undefined;
            }
            return { ...resultType };
        },
        applyBack: ({ downOperation, nextState }) => {
            const result = { ...nextState };

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