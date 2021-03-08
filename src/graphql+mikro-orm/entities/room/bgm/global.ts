import { Collection } from '@mikro-orm/core';
import { __ } from '../../../../@shared/collection';
import { isStrIndex5, StrIndex5 } from '../../../../@shared/indexes';
import { Result, ResultModule } from '../../../../@shared/Result';
import { undefinedForAll } from '../../../../utils/helpers';
import { EM } from '../../../../utils/types';
import { createDownOperationFromMikroORM, createUpOperationFromGraphQL, ReadonlyMapDownOperation, ReadonlyMapTwoWayOperation, ReadonlyMapUpOperation, replace, update } from '../../../mapOperations';
import { ReplaceFilePathArrayDownOperation, ReplaceFilePathArrayDownOperationModule, ReplaceFilePathArrayTwoWayOperation, ReplaceFilePathArrayTwoWayOperationModule, ReplaceFilePathArrayUpOperation, ReplaceNumberDownOperation, ReplaceNumberDownOperationModule, ReplaceNumberTwoWayOperation, ReplaceNumberTwoWayOperationModule, ReplaceNumberUpOperation } from '../../../Operations';
import { FilePath } from '../../filePath/global';
import { TransformerFactory } from '../../global';
import { Room, RoomOp } from '../mikro-orm';
import { RoomBgmsOperation, RoomBgmState, RoomBgmValueState } from './graphql';
import { AddRoomBgmOp, RemoveRoomBgmOp, RoomBgm, RoomBgmBase, UpdateRoomBgmOp } from './mikro-orm';

export namespace GlobalBgm {
    export type StateType = {
        files: FilePath[];
        volume: number;
    }

    export type DownOperationType = {
        files?: ReplaceFilePathArrayDownOperation;
        volume?: ReplaceNumberDownOperation;
    }

    export type UpOperationType = {
        files?: ReplaceFilePathArrayUpOperation;
        volume?: ReplaceNumberUpOperation;
    }

    export type TwoWayOperationType = {
        files?: ReplaceFilePathArrayTwoWayOperation;
        volume?: ReplaceNumberTwoWayOperation;
    }

    export namespace MikroORM {
        export namespace ToGlobal {
            export const state = (entity: RoomBgmBase): StateType => ({ ...entity });

            export const stateMany = (entity: ReadonlyArray<RoomBgmBase>): ReadonlyMap<StrIndex5, StateType> => {
                const result = new Map<StrIndex5, StateType>();
                for (const elem of entity) {
                    if (!isStrIndex5(elem.channelKey)) {
                        continue;
                    }
                    result.set(elem.channelKey, state(elem));
                }
                return result;
            };

            export const downOperationMany = async ({
                add,
                update,
                remove,
            }: {
                add: Collection<AddRoomBgmOp>;
                update: Collection<UpdateRoomBgmOp>;
                remove: Collection<RemoveRoomBgmOp>;
            }): Promise<Result<ReadonlyMapDownOperation<StrIndex5, StateType, DownOperationType>>> => {
                return await createDownOperationFromMikroORM({
                    add,
                    update,
                    remove,
                    toKey: x => {
                        if (!isStrIndex5(x.channelKey)) {
                            throw 'channelKey must be "1", or "2", or ..., or "5"';
                        }
                        return ResultModule.ok(x.channelKey);
                    },
                    getState: async x => ResultModule.ok(state(x)),
                    getOperation: async entity => ResultModule.ok({
                        files: entity.files == null ? undefined : { oldValue: entity.files },
                        volume: entity.volume == null ? undefined : { oldValue: entity.volume },
                    })
                });
            };
        }
    }

    export namespace Global {
        export namespace ToGraphQL {
            export const state = ({ source }: { source: StateType }): RoomBgmValueState => source;

            export const stateMany = ({ source }: { source: ReadonlyMap<StrIndex5, StateType> }): RoomBgmState[] => {
                const result: RoomBgmState[] = [];
                source.forEach((value, key) => {
                    result.push({
                        channelKey: key,
                        value: state({ source: value }),
                    });
                });
                return result;
            };

            export const operation = ({ operation }: { operation: ReadonlyMapTwoWayOperation<StrIndex5, StateType, TwoWayOperationType> }): RoomBgmsOperation => {
                const result: RoomBgmsOperation = { replace: [], update: [] };
                for (const [key, value] of operation) {
                    switch (value.type) {
                        case replace: {
                            if (value.operation.newValue === undefined) {
                                result.replace.push({
                                    channelKey: key,
                                    newValue: undefined,
                                });
                                continue;
                            }
                            result.replace.push({
                                channelKey: key,
                                newValue: value.operation.newValue,
                            });
                            continue;
                        }
                        case update: {
                            result.update.push({
                                channelKey: key,
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
            operation: ReadonlyMapTwoWayOperation<StrIndex5, StateType, TwoWayOperationType>;
        }) => {
            for (const [key, value] of operation) {
                switch (value.type) {
                    case replace: {
                        if (value.operation.newValue === undefined) {
                            if (value.operation.oldValue === undefined) {
                                console.warn('Replace: oldValue === newValue === undefined. This should be id.');
                                continue;
                            }
                            const toRemove = await em.findOneOrFail(RoomBgm, { room: { id: parent.id }, channelKey: key });
                            em.remove(toRemove);

                            const op = new RemoveRoomBgmOp({ channelKey: key, files: value.operation.oldValue.files, volume: value.operation.oldValue.volume, roomOp: parentOp });
                            em.persist(op);
                            continue;
                        }

                        const toAdd = new RoomBgm({
                            channelKey: key,
                            files: value.operation.newValue.files,
                            volume: value.operation.newValue.volume,
                            room: parent,
                        });
                        em.persist(toAdd);

                        const op = new AddRoomBgmOp({ channelKey: key, roomOp: parentOp });
                        em.persist(op);
                        continue;
                    }
                    case update: {
                        const target = await em.findOneOrFail(RoomBgm, { room: { id: parent.id }, channelKey: key });
                        const op = new UpdateRoomBgmOp({ channelKey: key, roomOp: parentOp });

                        if (value.operation.files != null) {
                            target.files = value.operation.files.newValue;
                            op.files = value.operation.files.oldValue;
                        }
                        if (value.operation.volume != null) {
                            target.volume = value.operation.volume.newValue;
                            op.volume = value.operation.volume.oldValue;
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
            export const state = (entity: RoomBgmValueState): StateType => entity;

            export const upOperationMany = (source: RoomBgmsOperation): Result<ReadonlyMapUpOperation<StrIndex5, StateType, UpOperationType>> => {
                return createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createKey: x => {
                        if (!isStrIndex5(x.channelKey)) {
                            return ResultModule.error('channelKey must be "1", or "2", or ..., or "5"');
                        }
                        return ResultModule.ok(x.channelKey);
                    },
                    getState: x => x.newValue == null ? undefined : state(x.newValue),
                    getOperation: x => ResultModule.ok({
                        files: x.operation.files,
                        volume: x.operation.volume,
                    }),
                });
            };
        }
    }

    export const transformerFactory: TransformerFactory<StrIndex5, StateType, StateType, DownOperationType, UpOperationType, TwoWayOperationType> = ({
        composeLoose: ({ first, second }) => {
            const valueProps: DownOperationType = {
                files: ReplaceFilePathArrayDownOperationModule.compose(first.files, second.files),
                volume: ReplaceNumberDownOperationModule.compose(first.volume, second.volume),
            };
            return ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            if (downOperation === undefined) {
                return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }

            const prevState: StateType = { ...nextState };
            const twoWayOperation: TwoWayOperationType = {};

            if (downOperation.files !== undefined) {
                prevState.files = downOperation.files.oldValue;
                twoWayOperation.files = { ...downOperation.files, newValue: nextState.files };
            }
            if (downOperation.volume !== undefined) {
                prevState.volume = downOperation.volume.oldValue;
                twoWayOperation.volume = { ...downOperation.volume, newValue: nextState.volume };
            }

            return ResultModule.ok({ prevState, twoWayOperation });
        },
        transform: ({ prevState, clientOperation, serverOperation }) => {
            const twoWayOperation: TwoWayOperationType = {};

            twoWayOperation.files = ReplaceFilePathArrayTwoWayOperationModule.transform({
                first: serverOperation?.files,
                second: clientOperation.files,
                prevState: prevState.files,
            });
            twoWayOperation.volume = ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation?.volume,
                second: clientOperation.volume,
                prevState: prevState.volume,
            });

            if (undefinedForAll(twoWayOperation)) {
                return ResultModule.ok(undefined);
            }

            return ResultModule.ok({ ...twoWayOperation });
        },
        diff: ({ prevState, nextState }) => {
            const resultType: TwoWayOperationType = {};
            if (prevState.files !== nextState.files) {
                resultType.files = { oldValue: prevState.files, newValue: nextState.files };
            }
            if (prevState.volume !== nextState.volume) {
                resultType.volume = { oldValue: prevState.volume, newValue: nextState.volume };
            }
            if (undefinedForAll(resultType)) {
                return undefined;
            }
            return { ...resultType };
        },
        applyBack: ({ downOperation, nextState }) => {
            const result = { ...nextState };

            if (downOperation.files !== undefined) {
                result.files = downOperation.files.oldValue;
            }
            if (downOperation.volume !== undefined) {
                result.volume = downOperation.volume.oldValue;
            }

            return ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {
        }
    });
}