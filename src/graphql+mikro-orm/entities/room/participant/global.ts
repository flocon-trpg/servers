import { Collection, Reference } from '@mikro-orm/core';
import { DualKey } from '../../../../@shared/DualKeyMap';
import { Result, ResultModule } from '../../../../@shared/Result';
import { ParticipantRole } from '../../../../enums/ParticipantRole';
import { ParticipantRoleOperation } from '../../../../enums/ParticipantRoleOperation';
import { undefinedForAll } from '../../../../utils/helpers';
import { EM } from '../../../../utils/types';
import { createDownOperationFromMikroORM, createUpOperationFromGraphQL, ReadonlyMapDownOperation, ReadonlyMapTwoWayOperation, ReadonlyMapUpOperation, replace, toGraphQLWithState, update } from '../../../mapOperations';
import { ReplaceNullableParticipantRoleDownOperation, ReplaceNullableParticipantRoleDownOperationModule, ReplaceNullableParticipantRoleTwoWayOperationModule, ReplaceNullableParticipantRoleUpOperation, ReplaceStringDownOperation, ReplaceStringDownOperationModule, ReplaceStringTwoWayOperation, ReplaceStringTwoWayOperationModule, ReplaceStringUpOperation } from '../../../Operations';
import { MapTransformer, TransformerFactory } from '../../global';
import { RoomGetState } from '../graphql';
import { Room, RoomOp } from '../mikro-orm';
import { User } from '../../user/mikro-orm';
import { ParticipantsOperation, ParticipantsOperationInput, ParticipantState, ParticipantValueState } from './graphql';
import { AddParticiOp, Partici, ParticiBase, RemoveParticiOp, UpdateParticiOp } from './mikro-orm';
import { GlobalMyValue } from './myValue/global';
import { RequestedBy, server } from '../../../Types';

export namespace GlobalParticipant {
    type StateTypeValue = {
        name: string;
        role?: ParticipantRole;
    }

    export type StateType = StateTypeValue & {
        myNumberValues: ReadonlyMap<string, GlobalMyValue.StateType>;
    }

    type DownOperationTypeValue = {
        name?: ReplaceStringDownOperation;
        role?: ReplaceNullableParticipantRoleDownOperation;
    }

    export type DownOperationType = DownOperationTypeValue & {
        myNumberValues: ReadonlyMapDownOperation<string, GlobalMyValue.StateType, GlobalMyValue.DownOperationType>;
    }

    type UpOperationTypeValue = {
        name?: ReplaceStringUpOperation;
        role?: ReplaceNullableParticipantRoleUpOperation;
    }

    export type UpOperationType = UpOperationTypeValue & {
        myNumberValues: ReadonlyMapUpOperation<string, GlobalMyValue.StateType, GlobalMyValue.UpOperationType>;
    }

    type ReplaceNullableParticipantRoleTwoWayOperation = {
        oldValue?: ParticipantRole;
        newValue?: ParticipantRole;
    }

    type TwoWayOperationTypeValue = {
        name?: ReplaceStringTwoWayOperation;
        role?: ReplaceNullableParticipantRoleTwoWayOperation;
    }

    export type TwoWayOperationType = TwoWayOperationTypeValue & {
        myNumberValues: ReadonlyMapTwoWayOperation<string, GlobalMyValue.StateType, GlobalMyValue.TwoWayOperationType>;
    }

    export namespace MikroORM {
        export namespace ToGlobal {
            export const state = async (entity: Partici): Promise<StateType> => {
                const myNumberValues = await GlobalMyValue.MikroORM.ToGlobal.stateMany(await entity.myValues.loadItems());

                return {
                    ...entity,
                    myNumberValues,
                };
            };

            export const stateMany = async (entity: ReadonlyArray<Partici>): Promise<ReadonlyMap<string, StateType>> => {
                const result = new Map<string, StateType>();
                for (const elem of entity) {
                    result.set(elem.user.userUid, await state(elem));
                }
                return result;
            };

            export const stateFromRemoveParticiOp = async (entity: RemoveParticiOp): Promise<StateType> => {
                const myNumberValues = await GlobalMyValue.MikroORM.ToGlobal.stateManyFromRemovedMyValueOp(await entity.removedMyValues.loadItems());

                return {
                    ...entity,
                    myNumberValues,
                };
            };

            export const stateManyFromRemoveParticiOp = async (entity: ReadonlyArray<RemoveParticiOp>): Promise<ReadonlyMap<string, StateType>> => {
                const result = new Map<string, StateType>();
                for (const elem of entity) {
                    result.set(elem.user.userUid, await stateFromRemoveParticiOp(elem));
                }
                return result;
            };

            export const downOperationMany = async ({
                add,
                update,
                remove,
            }: {
                add: Collection<AddParticiOp>;
                update: Collection<UpdateParticiOp>;
                remove: Collection<RemoveParticiOp>;
            }): Promise<Result<ReadonlyMapDownOperation<string, StateType, DownOperationType>>> => {
                return await createDownOperationFromMikroORM({
                    add,
                    update,
                    remove,
                    toKey: x => {
                        return ResultModule.ok(x.user.userUid);
                    },
                    getState: async x => ResultModule.ok(await stateFromRemoveParticiOp(x)),
                    getOperation: async entity => {
                        const myNumberValues = await GlobalMyValue.MikroORM.ToGlobal.downOperationMany({
                            add: entity.addMyValueOps,
                            remove: entity.removeMyValueOps,
                            update: entity.updateMyValueOps,
                        });
                        if (myNumberValues.isError) {
                            return myNumberValues;
                        }

                        const role = (() => {
                            switch (entity.role) {
                                case undefined:
                                    return undefined;
                                case ParticipantRoleOperation.Left:
                                    return { oldValue: undefined };
                                case ParticipantRoleOperation.Master:
                                    return { oldValue: ParticipantRole.Master };
                                case ParticipantRoleOperation.Player:
                                    return { oldValue: ParticipantRole.Player };
                                case ParticipantRoleOperation.Spectator:
                                    return { oldValue: ParticipantRole.Spectator };
                            }
                        })();
                        return ResultModule.ok({
                            myNumberValues: myNumberValues.value,
                            name: entity.name == null ? undefined : { oldValue: entity.name },
                            role,
                        });
                    },
                });
            };
        }
    }

    export namespace Global {
        export namespace ToGraphQL {
            export const state = ({ source, createdByMe }: { source: StateType; createdByMe: boolean }): ParticipantValueState => {
                return {
                    ...source,
                    myNumberValues: GlobalMyValue.Global.ToGraphQL.stateMany({ source: source.myNumberValues, createdByMe }),
                };
            };

            export const stateMany = ({ source, requestedBy }: { source: ReadonlyMap<string, StateType>; requestedBy: RequestedBy }): ParticipantState[] => {
                const result: ParticipantState[] = [];
                source.forEach((value, key) => {
                    result.push({
                        userUid: key,
                        value: state({
                            source: value,
                            createdByMe: RequestedBy.createdByMe({ requestedBy, userUid: key }),
                        }),
                    });
                });
                return result;
            };

            export const operation = ({
                operation,
                prevState,
                nextState,
                requestedBy,
            }: {
                operation: ReadonlyMapTwoWayOperation<string, StateType, TwoWayOperationType>;
                prevState: ReadonlyMap<string, StateType>;
                nextState: ReadonlyMap<string, StateType>;
                requestedBy: RequestedBy;
            }): ParticipantsOperation => {
                return toGraphQLWithState({
                    source: operation,
                    prevState,
                    nextState,
                    isPrivate: () => false,
                    toReplaceOperation: ({ nextState, key }) => ({
                        userUid: key,
                        newValue: nextState === undefined ? undefined : state({
                            source: nextState,
                            createdByMe: RequestedBy.createdByMe({ requestedBy, userUid: key }),
                        })
                    }),
                    toUpdateOperation: ({ operation, prevState, nextState, key }) => {
                        const createdByMe = RequestedBy.createdByMe({ requestedBy, userUid: key });
                        const myNumberValues = GlobalMyValue.Global.ToGraphQL.operation({
                            operation: operation.myNumberValues,
                            prevState: prevState.myNumberValues,
                            nextState: nextState.myNumberValues,
                            createdByMe,
                        });
                        return {
                            userUid: key,
                            operation: {
                                name: operation.name,
                                role: operation.role,
                                myNumberValues,
                            },
                        };
                    },
                });
            };
        }

        export const emptyTwoWayOperation = (): Readonly<TwoWayOperationType> => ({
            myNumberValues: new Map(),
        });

        export const applyToEntity = async ({
            em,
            parent,
            parentOp,
            operation,
        }: {
            em: EM;
            parent: Room;
            parentOp: RoomOp;
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

                            const user = await em.findOneOrFail(User, { userUid: key });

                            const toRemove = await em.findOneOrFail(Partici, { room: { id: parent.id }, user: { userUid: key } });
                            em.remove(toRemove);

                            const op = new RemoveParticiOp({
                                name: value.operation.oldValue.name,
                                role: value.operation.oldValue.role,
                                user,
                                roomOp: parentOp,
                            });
                            em.persist(op);
                            continue;
                        }

                        const user = await em.findOneOrFail(User, { userUid: key });

                        const toAdd = new Partici({
                            name: value.operation.newValue.name,
                            role: value.operation.newValue.role,
                            user,
                            room: parent,
                        });
                        em.persist(toAdd);

                        const op = new AddParticiOp({ roomOp: parentOp, user });
                        em.persist(op);
                        continue;
                    }
                    case update: {
                        const user = await em.findOneOrFail(User, { userUid: key });

                        const target = await em.findOneOrFail(Partici, { room: { id: parent.id }, user: { userUid: key } });
                        const op = new UpdateParticiOp({roomOp: parentOp, user});

                        await GlobalMyValue.Global.applyToEntity({ em, parent: target, parentOp: op, operation: value.operation.myNumberValues });

                        if (value.operation.name != null) {
                            target.name = value.operation.name.newValue;
                            op.name = value.operation.name.oldValue;
                        }
                        if (value.operation.role != null) {
                            target.role = value.operation.role.newValue;
                            op.role = (() => {
                                switch (value.operation.role.oldValue) {
                                    case undefined:
                                        return ParticipantRoleOperation.Left;
                                    case ParticipantRole.Master:
                                        return ParticipantRoleOperation.Master;
                                    case ParticipantRole.Player:
                                        return ParticipantRoleOperation.Player;
                                    case ParticipantRole.Spectator:
                                        return ParticipantRoleOperation.Spectator;
                                }
                            })();
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
            export const state = (object: ParticipantValueState): StateType => {
                const myNumberValues = GlobalMyValue.GraphQL.ToGlobal.stateMany(object.myNumberValues);

                return {
                    ...object,
                    myNumberValues,
                };
            };

            export const stateMany = (objects: ReadonlyArray<ParticipantState>) => {
                const result = new Map<string, StateType>();
                objects.forEach(x => {
                    result.set(x.userUid, state(x.value));
                });
                return result;
            };

            export const upOperationMany = (source: ParticipantsOperation): Result<ReadonlyMapUpOperation<string, StateType, UpOperationType>> => {
                return createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createKey: x => {
                        return ResultModule.ok(x.userUid);
                    },
                    getState: x => x.newValue == null ? undefined : state(x.newValue),
                    getOperation: x => {
                        const myNumberValues = GlobalMyValue.GraphQL.ToGlobal.upOperationMany(x.operation.myNumberValues);
                        if (myNumberValues.isError) {
                            return myNumberValues;
                        }
                        return ResultModule.ok({
                            name: x.operation.name,
                            role: x.operation.role,
                            myNumberValues: myNumberValues.value,
                        });
                    },
                });
            };

            export const upOperationManyFromInput = (source: ParticipantsOperationInput): Result<ReadonlyMapUpOperation<string, StateType, UpOperationType>> => {
                return createUpOperationFromGraphQL({
                    replace: [],
                    update: source.update,
                    createKey: x => {
                        return ResultModule.ok(x.userUid);
                    },
                    getState: () => {
                        throw 'This should not happen';
                    },
                    getOperation: x => {
                        const myNumberValues = GlobalMyValue.GraphQL.ToGlobal.upOperationMany(x.operation.myNumberValues);
                        if (myNumberValues.isError) {
                            return myNumberValues;
                        }
                        return ResultModule.ok({
                            myNumberValues: myNumberValues.value,
                        });
                    },
                });
            };
        }
    }

    const createMyNumberValueTransformer = (createdByMe: boolean) => GlobalMyValue.transformerFactory(createdByMe);
    const createMyNumberValuesTransformer = (createdByMe: boolean) => new MapTransformer(createMyNumberValueTransformer(createdByMe));

    export const transformerFactory = (requestedBy: RequestedBy): TransformerFactory<string, StateType, StateType, DownOperationType, UpOperationType, TwoWayOperationType> => ({
        composeLoose: ({ key, first, second }) => {
            const myNumberValuesTransformer = createMyNumberValuesTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
            const myNumberValues = myNumberValuesTransformer.composeLoose({
                first: first.myNumberValues,
                second: second.myNumberValues,
            });
            if (myNumberValues.isError) {
                return myNumberValues;
            }

            const valueProps: DownOperationType = {
                name: ReplaceStringDownOperationModule.compose(first.name ?? undefined, second.name ?? undefined),
                role: ReplaceNullableParticipantRoleDownOperationModule.compose(first.role ?? undefined, second.role ?? undefined),
                myNumberValues: myNumberValues.value ?? new Map(),
            };
            return ResultModule.ok(valueProps);
        },
        restore: ({ key, nextState, downOperation }) => {
            if (downOperation === undefined) {
                return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }

            const myNumberValuesTransformer = createMyNumberValuesTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
            const myNumberValues = myNumberValuesTransformer.restore({
                nextState: nextState.myNumberValues,
                downOperation: downOperation.myNumberValues,
            });
            if (myNumberValues.isError) {
                return myNumberValues;
            }

            const prevState: StateType = {
                ...nextState,
                myNumberValues: myNumberValues.value.prevState,
            };
            const twoWayOperation: TwoWayOperationType = {
                myNumberValues: myNumberValues.value.twoWayOperation,
            };

            if (downOperation.name != null) {
                prevState.name = downOperation.name.oldValue;
                twoWayOperation.name = { ...downOperation.name, newValue: nextState.name };
            }
            if (downOperation.role != null) {
                prevState.role = downOperation.role.oldValue ?? undefined;
                twoWayOperation.role = { oldValue: downOperation.role.oldValue ?? undefined, newValue: nextState.role };
            }

            return ResultModule.ok({ prevState, twoWayOperation });
        },
        transform: ({ key, prevState, currentState, clientOperation, serverOperation }) => {
            const myNumberValuesTransformer = createMyNumberValuesTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
            const myNumberValues = myNumberValuesTransformer.transform({
                prevState: prevState.myNumberValues,
                currentState: currentState.myNumberValues,
                clientOperation: clientOperation.myNumberValues,
                serverOperation: serverOperation?.myNumberValues ?? new Map(),
            });
            if (myNumberValues.isError) {
                return myNumberValues;
            }

            const twoWayOperation: TwoWayOperationTypeValue = {};

            twoWayOperation.name = ReplaceStringTwoWayOperationModule.transform({
                first: serverOperation?.name ?? undefined,
                second: clientOperation.name ?? undefined,
                prevState: prevState.name,
            });
            twoWayOperation.role = ReplaceNullableParticipantRoleTwoWayOperationModule.transform({
                first: serverOperation?.role ?? undefined,
                second: clientOperation.role ?? undefined,
                prevState: prevState.role,
            });

            if (undefinedForAll(twoWayOperation) && myNumberValues.value.size === 0) {
                return ResultModule.ok(undefined);
            }

            return ResultModule.ok({
                ...twoWayOperation,
                myNumberValues: myNumberValues.value,
            });
        },
        diff: ({ key, prevState, nextState }) => {
            const myNumberValuesTransformer = createMyNumberValuesTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
            const myNumberValues = myNumberValuesTransformer.diff({
                prevState: prevState.myNumberValues,
                nextState: nextState.myNumberValues,
            });
            const resultType: TwoWayOperationTypeValue = {};
            if (prevState.name != nextState.name) {
                resultType.name = { oldValue: prevState.name, newValue: nextState.name };
            }
            if (prevState.role != nextState.role) {
                resultType.role = { oldValue: prevState.role, newValue: nextState.role };
            }
            if (undefinedForAll(resultType) && myNumberValues.size === 0) {
                return undefined;
            }
            return { ...resultType, myNumberValues };
        },
        applyBack: ({ key, downOperation, nextState }) => {
            const myNumberValuesTransformer = createMyNumberValuesTransformer(RequestedBy.createdByMe({ requestedBy, userUid: key }));
            const myNumberValues = myNumberValuesTransformer.applyBack({
                downOperation: downOperation.myNumberValues,
                nextState: nextState.myNumberValues,
            });
            if (myNumberValues.isError) {
                return myNumberValues;
            }

            const result: StateType = {
                ...nextState,
                myNumberValues: myNumberValues.value,
            };

            if (downOperation.name !== undefined) {
                result.name = downOperation.name.oldValue ?? undefined;
            }
            if (downOperation.role !== undefined) {
                result.role = downOperation.role.oldValue ?? undefined;
            }

            return ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {}
    });
}