import { Collection } from '@mikro-orm/core';
import { DualKey, DualKeyMap, ReadonlyDualKeyMap } from '../../../../@shared/DualKeyMap';
import { StrIndex100 } from '../../../../@shared/indexes';
import { Result, ResultModule } from '../../../../@shared/Result';
import { undefinedForAll } from '../../../../utils/helpers';
import { EM } from '../../../../utils/types';
import { createDownOperationFromMikroORM, createUpOperationFromGraphQL, ReadonlyDualKeyMapDownOperation, ReadonlyDualKeyMapTwoWayOperation, ReadonlyDualKeyMapUpOperation, replace, toGraphQLWithState, update } from '../../../dualKeyMapOperations';
import { ReadonlyMapDownOperation, ReadonlyMapTwoWayOperation, ReadonlyMapUpOperation } from '../../../mapOperations';
import { ReplaceBooleanDownOperation, ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperation, ReplaceBooleanTwoWayOperationModule, ReplaceBooleanUpOperation, ReplaceNullableFilePathDownOperation, ReplaceNullableFilePathDownOperationModule, ReplaceNullableFilePathTwoWayOperation, ReplaceNullableFilePathTwoWayOperationModule, ReplaceNullableFilePathUpOperation, ReplaceStringDownOperation, ReplaceStringDownOperationModule, ReplaceStringTwoWayOperation, ReplaceStringTwoWayOperationModule, ReplaceStringUpOperation } from '../../../Operations';
import { toGraphQL } from '../../../paramMapOperations';
import { FilePath } from '../../filePath/global';
import { DualKeyMapTransformer, MapTransformer, ParamMapTransformer, TransformerFactory } from '../../global';
import { GlobalPiece } from '../../piece/global';
import { Room, RoomOp } from '../mikro-orm';
import { stateToGraphQL } from '../../roomAsListItem/global';
import { GlobalBoolParam } from './boolParam/global';
import { CharactersOperation, CharacterState, CharacterValueState } from './graphql';
import { AddCharaOp, Chara, CharaBase, RemoveCharaOp, UpdateCharaOp } from './mikro-orm';
import { GlobalNumParam } from './numParam/global';
import { GlobalStrParam } from './strParam/global';
import { RequestedBy, server } from '../../../Types';

export namespace GlobalCharacter {
    type StateTypeValue = {
        isPrivate: boolean;
        name: string;
        image?: FilePath;
    }

    export type StateType = StateTypeValue & {
        boolParams: ReadonlyMap<StrIndex100, GlobalBoolParam.StateType>;
        numParams: ReadonlyMap<StrIndex100, GlobalNumParam.StateType>;
        numMaxParams: ReadonlyMap<StrIndex100, GlobalNumParam.StateType>;
        strParams: ReadonlyMap<StrIndex100, GlobalStrParam.StateType>;
        pieces: ReadonlyDualKeyMap<string, string, GlobalPiece.StateType>;
    }

    type DownOperationTypeValue = {
        isPrivate?: ReplaceBooleanDownOperation;
        name?: ReplaceStringDownOperation;
        image?: ReplaceNullableFilePathDownOperation;
    }

    export type DownOperationType = DownOperationTypeValue & {
        boolParams: ReadonlyMap<StrIndex100, GlobalBoolParam.DownOperationType>;
        numParams: ReadonlyMap<StrIndex100, GlobalNumParam.DownOperationType>;
        numMaxParams: ReadonlyMap<StrIndex100, GlobalNumParam.DownOperationType>;
        strParams: ReadonlyMap<StrIndex100, GlobalStrParam.DownOperationType>;
        pieces: ReadonlyDualKeyMapDownOperation<string, string, GlobalPiece.StateType, GlobalPiece.DownOperationType>;
    }

    type UpOperationTypeValue = {
        isPrivate?: ReplaceBooleanUpOperation;
        name?: ReplaceStringUpOperation;
        image?: ReplaceNullableFilePathUpOperation;
    }

    export type UpOperationType = UpOperationTypeValue & {
        boolParams: ReadonlyMap<StrIndex100, GlobalBoolParam.UpOperationType>;
        numParams: ReadonlyMap<StrIndex100, GlobalNumParam.UpOperationType>;
        numMaxParams: ReadonlyMap<StrIndex100, GlobalNumParam.UpOperationType>;
        strParams: ReadonlyMap<StrIndex100, GlobalStrParam.UpOperationType>;
        pieces: ReadonlyDualKeyMapUpOperation<string, string, GlobalPiece.StateType, GlobalPiece.UpOperationType>;
    }

    type TwoWayOperationTypeValue = {
        isPrivate?: ReplaceBooleanTwoWayOperation;
        name?: ReplaceStringTwoWayOperation;
        image?: ReplaceNullableFilePathTwoWayOperation;
    }

    export type TwoWayOperationType = TwoWayOperationTypeValue & {
        boolParams: ReadonlyMap<StrIndex100, GlobalBoolParam.TwoWayOperationType>;
        numParams: ReadonlyMap<StrIndex100, GlobalNumParam.TwoWayOperationType>;
        numMaxParams: ReadonlyMap<StrIndex100, GlobalNumParam.TwoWayOperationType>;
        strParams: ReadonlyMap<StrIndex100, GlobalStrParam.TwoWayOperationType>;
        pieces: ReadonlyDualKeyMapTwoWayOperation<string, string, GlobalPiece.StateType, GlobalPiece.TwoWayOperationType>;
    }

    export namespace MikroORM {
        export namespace ToGlobal {
            export const state = async (entity: Chara): Promise<StateType> => {
                const boolParams = GlobalBoolParam.MikroORM.ToGlobal.stateMany(await entity.boolParams.loadItems());
                const numParams = GlobalNumParam.MikroORM.ToGlobal.stateMany(await entity.numParams.loadItems());
                const numMaxParams = GlobalNumParam.MikroORM.ToGlobal.stateMany(await entity.numMaxParams.loadItems());
                const strParams = GlobalStrParam.MikroORM.ToGlobal.stateMany(await entity.strParams.loadItems());
                const pieces = GlobalPiece.MikroORM.ToGlobal.stateMany(await entity.charaPieces.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));

                return {
                    ...entity,
                    boolParams,
                    numParams,
                    numMaxParams,
                    strParams,
                    pieces,
                };
            };

            export const stateMany = async (entity: ReadonlyArray<Chara>): Promise<ReadonlyDualKeyMap<string, string, StateType>> => {
                const result = new DualKeyMap<string, string, StateType>();
                for (const elem of entity) {
                    result.set({ first: elem.createdBy, second: elem.stateId }, await state(elem));
                }
                return result;
            };

            export const stateFromRemoveCharaOp = async (entity: RemoveCharaOp): Promise<StateType> => {
                const boolParams = GlobalBoolParam.MikroORM.ToGlobal.stateMany(await entity.removedBoolParam.loadItems());
                const numParams = GlobalNumParam.MikroORM.ToGlobal.stateMany(await entity.removedNumParam.loadItems());
                const numMaxParams = GlobalNumParam.MikroORM.ToGlobal.stateMany(await entity.removedNumParam.loadItems());
                const strParams = GlobalStrParam.MikroORM.ToGlobal.stateMany(await entity.removedStrParam.loadItems());
                const pieces = GlobalPiece.MikroORM.ToGlobal.stateMany(await entity.removedCharaPieces.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));

                return {
                    ...entity,
                    boolParams,
                    numParams,
                    numMaxParams,
                    strParams,
                    pieces,
                };
            };

            export const stateManyFromRemoveCharaOp = async (entity: ReadonlyArray<RemoveCharaOp>): Promise<ReadonlyDualKeyMap<string, string, StateType>> => {
                const result = new DualKeyMap<string, string, StateType>();
                for (const elem of entity) {
                    result.set({ first: elem.createdBy, second: elem.stateId }, await stateFromRemoveCharaOp(elem));
                }
                return result;
            };

            export const downOperationMany = async ({
                add,
                update,
                remove,
            }: {
                add: Collection<AddCharaOp>;
                update: Collection<UpdateCharaOp>;
                remove: Collection<RemoveCharaOp>;
            }): Promise<Result<ReadonlyDualKeyMapDownOperation<string, string, StateType, DownOperationType>>> => {
                return await createDownOperationFromMikroORM({
                    add,
                    update,
                    remove,
                    toDualKey: x => {
                        return ResultModule.ok({ first: x.createdBy, second: x.stateId });
                    },
                    getState: async x => ResultModule.ok(await stateFromRemoveCharaOp(x)),
                    getOperation: async entity => {
                        const boolParams = await GlobalBoolParam.MikroORM.ToGlobal.downOperationMany({ update: entity.updateBoolParamOps });
                        if (boolParams.isError) {
                            return boolParams;
                        }
                        const numParams = await GlobalNumParam.MikroORM.ToGlobal.downOperationMany({ update: entity.updateNumParamOps });
                        if (numParams.isError) {
                            return numParams;
                        }
                        const numMaxParams = await GlobalNumParam.MikroORM.ToGlobal.downOperationMany({ update: entity.updateNumMaxParamOps });
                        if (numMaxParams.isError) {
                            return numMaxParams;
                        }
                        const strParams = await GlobalStrParam.MikroORM.ToGlobal.downOperationMany({ update: entity.updateStrParamOps });
                        if (strParams.isError) {
                            return strParams;
                        }
                        const pieces = await GlobalPiece.MikroORM.ToGlobal.downOperationMany({
                            add: entity.addCharaPieceOps,
                            remove: entity.removeCharaPieceOps,
                            update: entity.updateCharaPieceOps,
                            toDualKey: x => ({ first: x.boardCreatedBy, second: x.boardId }),
                        });
                        if (pieces.isError) {
                            return pieces;
                        }

                        return ResultModule.ok({
                            boolParams: boolParams.value,
                            numParams: numParams.value,
                            numMaxParams: numMaxParams.value,
                            strParams: strParams.value,
                            pieces: pieces.value,
                            isPrivate: entity.isPrivate == null ? undefined : { oldValue: entity.isPrivate },
                            name: entity.name == null ? undefined : { oldValue: entity.name },
                            image: entity.image == null ? undefined : entity.image,
                        });
                    },
                });
            };
        }
    }

    export namespace Global {
        export namespace ToGraphQL {
            export const state = ({ source, createdByMe }: { source: StateType; createdByMe: boolean }): CharacterValueState | undefined => {
                if (!createdByMe && source.isPrivate) {
                    return undefined;
                }
                return {
                    ...source,
                    boolParams: GlobalBoolParam.Global.ToGraphQL.stateMany({ source: source.boolParams, createdByMe }),
                    numParams: GlobalNumParam.Global.ToGraphQL.stateMany({ source: source.numParams, createdByMe }),
                    numMaxParams: GlobalNumParam.Global.ToGraphQL.stateMany({ source: source.numMaxParams, createdByMe }),
                    strParams: GlobalStrParam.Global.ToGraphQL.stateMany({ source: source.strParams, createdByMe }),
                    pieces: GlobalPiece.Global.ToGraphQL.stateMany({ source: source.pieces, createdByMe }),
                };
            };

            export const stateMany = ({ source, requestedBy }: { source: ReadonlyDualKeyMap<string, string, StateType>; requestedBy: RequestedBy }): CharacterState[] => {
                const result: CharacterState[] = [];
                source.forEach((value, key) => {
                    const newState = state({
                        source: value,
                        createdByMe: RequestedBy.createdByMe({ requestedBy, userUid: key.first }),
                    });
                    if (newState != null) {
                        result.push({
                            createdBy: key.first,
                            id: key.second,
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
                requestedBy,
            }: {
                operation: ReadonlyDualKeyMapTwoWayOperation<string, string, StateType, TwoWayOperationType>;
                prevState: ReadonlyDualKeyMap<string, string, StateType>;
                nextState: ReadonlyDualKeyMap<string, string, StateType>;
                requestedBy: RequestedBy;
            }): CharactersOperation => {
                return toGraphQLWithState({
                    source: operation,
                    prevState,
                    nextState,
                    isPrivate: (state, key) => !RequestedBy.createdByMe({ requestedBy, userUid: key.first }) && state.isPrivate,
                    toReplaceOperation: ({ nextState, key }) => ({
                        createdBy: key.first,
                        id: key.second,
                        newValue: nextState === undefined ? undefined : state({
                            source: nextState,
                            createdByMe: RequestedBy.createdByMe({ requestedBy, userUid: key.first }),
                        })
                    }),
                    toUpdateOperation: ({ operation, prevState, nextState, key }) => {
                        const createdByMe = RequestedBy.createdByMe({ requestedBy, userUid: key.first });
                        const boolParams = GlobalBoolParam.Global.ToGraphQL.operation({ operation: operation.boolParams, nextState: nextState.boolParams, createdByMe });
                        const numParams = GlobalNumParam.Global.ToGraphQL.operation({ operation: operation.numParams, nextState: nextState.numParams, createdByMe });
                        const numMaxParams = GlobalNumParam.Global.ToGraphQL.operation({ operation: operation.numMaxParams, nextState: nextState.numMaxParams, createdByMe });
                        const strParams = GlobalStrParam.Global.ToGraphQL.operation({ operation: operation.strParams, nextState: nextState.strParams, createdByMe });
                        const pieces = GlobalPiece.Global.ToGraphQL.operation({ operation: operation.pieces, prevState: prevState.pieces, nextState: nextState.pieces, createdByMe });
                        return {
                            createdBy: key.first,
                            id: key.second,
                            operation: {
                                ...operation,
                                boolParams,
                                numParams,
                                numMaxParams,
                                strParams,
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
                            const toRemove = await em.findOneOrFail(Chara, { room: { id: parent.id }, createdBy: key.first, stateId: key.second });
                            em.remove(toRemove);

                            const op = new RemoveCharaOp({
                                ...value.operation.oldValue,
                                createdBy: key.first,
                                stateId: key.second,
                            });
                            parentOp.removeCharacterOps.add(op);
                            continue;
                        }

                        const toAdd = new Chara({
                            ...value.operation.newValue,
                            createdBy: key.first,
                            stateId: key.second,
                        });
                        parent.characters.add(toAdd);

                        const op = new AddCharaOp({ createdBy: key.first, stateId: key.second });
                        parentOp.addCharacterOps.add(op);
                        continue;
                    }
                    case update: {
                        const target = await em.findOneOrFail(Chara, { room: { id: parent.id }, createdBy: key.first, stateId: key.second });
                        const op = new UpdateCharaOp({ createdBy: key.first, stateId: key.second });

                        await GlobalBoolParam.Global.applyToEntity({ em, parent: target, parentOp: op, operation: value.operation.boolParams });
                        await GlobalNumParam.Global.applyToEntity({ em, parent: target, parentOp: op, operation: value.operation.numParams, type: 'default' });
                        await GlobalNumParam.Global.applyToEntity({ em, parent: target, parentOp: op, operation: value.operation.numMaxParams, type: 'max' });
                        await GlobalStrParam.Global.applyToEntity({ em, parent: target, parentOp: op, operation: value.operation.strParams });
                        await GlobalPiece.Global.applyToCharaPiecesEntity({ em, parent: target, parentOp: op, operation: value.operation.pieces });

                        if (value.operation.image != null) {
                            target.imagePath = value.operation.image.newValue?.path;
                            target.imageSourceType = value.operation.image.newValue?.sourceType;
                            op.image = value.operation.image;
                        }
                        if (value.operation.isPrivate != null) {
                            target.isPrivate = value.operation.isPrivate.newValue;
                            op.isPrivate = value.operation.isPrivate.oldValue;
                        }
                        if (value.operation.name != null) {
                            target.name = value.operation.name.newValue;
                            op.name = value.operation.name.oldValue;
                        }

                        parentOp.updateCharacterOps.add(op);
                        continue;
                    }
                }
            }
        };

    }

    export namespace GraphQL {
        export namespace ToGlobal {
            export const state = (object: CharacterValueState): StateType => {
                const boolParams = GlobalBoolParam.GraphQL.ToGlobal.stateMany(object.boolParams);
                const numParams = GlobalNumParam.GraphQL.ToGlobal.stateMany(object.numParams);
                const numMaxParams = GlobalNumParam.GraphQL.ToGlobal.stateMany(object.numMaxParams);
                const strParams = GlobalStrParam.GraphQL.ToGlobal.stateMany(object.strParams);
                const pieces = GlobalPiece.GraphQL.ToGlobal.stateMany(object.pieces);

                return {
                    ...object,
                    boolParams,
                    numParams,
                    numMaxParams,
                    strParams,
                    pieces,
                };
            };

            export const upOperationMany = (source: CharactersOperation): Result<ReadonlyDualKeyMapUpOperation<string, string, StateType, UpOperationType>> => {
                return createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createDualKey: x => {
                        return ResultModule.ok({ first: x.createdBy, second: x.id });
                    },
                    getState: x => x.newValue == null ? undefined : state(x.newValue),
                    getOperation: x => {
                        const boolParams = GlobalBoolParam.GraphQL.ToGlobal.upOperationMany(x.operation.boolParams);
                        if (boolParams.isError) {
                            return boolParams;
                        }
                        const numParams = GlobalNumParam.GraphQL.ToGlobal.upOperationMany(x.operation.numParams);
                        if (numParams.isError) {
                            return numParams;
                        }
                        const numMaxParams = GlobalNumParam.GraphQL.ToGlobal.upOperationMany(x.operation.numMaxParams);
                        if (numMaxParams.isError) {
                            return numMaxParams;
                        }
                        const strParams = GlobalStrParam.GraphQL.ToGlobal.upOperationMany(x.operation.strParams);
                        if (strParams.isError) {
                            return strParams;
                        }
                        const pieces = GlobalPiece.GraphQL.ToGlobal.upOperationMany(x.operation.pieces);
                        if (pieces.isError) {
                            return pieces;
                        }
                        return ResultModule.ok({
                            ...x.operation,
                            boolParams: boolParams.value,
                            numParams: numParams.value,
                            numMaxParams: numMaxParams.value,
                            strParams: strParams.value,
                            pieces: pieces.value,
                        });
                    },
                });
            };
        }
    }

    const createBoolParamTransformer = (createdByMe: boolean) => GlobalBoolParam.transformerFactory(createdByMe);
    const createBoolParamsTransformer = (createdByMe: boolean) => new ParamMapTransformer(createBoolParamTransformer(createdByMe));
    const createNumParamTransformer = (createdByMe: boolean) => GlobalNumParam.transformerFactory(createdByMe);
    const createNumParamsTransformer = (createdByMe: boolean) => new ParamMapTransformer(createNumParamTransformer(createdByMe));
    const createStrParamTransformer = (createdByMe: boolean) => GlobalStrParam.transformerFactory(createdByMe);
    const createStrParamsTransformer = (createdByMe: boolean) => new ParamMapTransformer(createStrParamTransformer(createdByMe));
    const createPieceTransformer = (createdByMe: boolean) => GlobalPiece.transformerFactory<DualKey<string, string>>(createdByMe);
    const createPiecesTransformer = (createdByMe: boolean) => new DualKeyMapTransformer(createPieceTransformer(createdByMe));

    export const transformerFactory = (operatedBy: RequestedBy): TransformerFactory<DualKey<string, string>, StateType, StateType, DownOperationType, UpOperationType, TwoWayOperationType> => ({
        composeLoose: ({ key, first, second }) => {
            const boolParamsTransformer = createBoolParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const boolParams = boolParamsTransformer.compose({
                first: first.boolParams,
                second: second.boolParams,
            });
            if (boolParams.isError) {
                return boolParams;
            }

            const numParamsTransformer = createNumParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const numParams = numParamsTransformer.compose({
                first: first.numParams,
                second: second.numParams,
            });
            if (numParams.isError) {
                return numParams;
            }

            const numMaxParams = numParamsTransformer.compose({
                first: first.numMaxParams,
                second: second.numMaxParams,
            });
            if (numMaxParams.isError) {
                return numMaxParams;
            }

            const strParamsTransformer = createStrParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const strParams = strParamsTransformer.compose({
                first: first.strParams,
                second: second.strParams,
            });
            if (strParams.isError) {
                return strParams;
            }

            const piecesTransformer = createPiecesTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const pieces = piecesTransformer.composeLoose({
                first: first.pieces,
                second: second.pieces,
            });
            if (pieces.isError) {
                return pieces;
            }

            const valueProps: DownOperationType = {
                isPrivate: ReplaceBooleanDownOperationModule.compose(first.isPrivate, second.isPrivate),
                name: ReplaceStringDownOperationModule.compose(first.name, second.name),
                image: ReplaceNullableFilePathDownOperationModule.compose(first.image, second.image),
                boolParams: boolParams.value ?? new Map(),
                numParams: numParams.value ?? new Map(),
                numMaxParams: numMaxParams.value ?? new Map(),
                strParams: strParams.value ?? new Map(),
                pieces: pieces.value ?? new DualKeyMap(),
            };
            return ResultModule.ok(valueProps);
        },
        restore: ({ key, nextState, downOperation }) => {
            if (downOperation === undefined) {
                return ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }

            const boolParamsTransformer = createBoolParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const boolParams = boolParamsTransformer.restore({
                nextState: nextState.boolParams,
                downOperation: downOperation.boolParams,
            });
            if (boolParams.isError) {
                return boolParams;
            }

            const numParamsTransformer = createNumParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const numParams = numParamsTransformer.restore({
                nextState: nextState.numParams,
                downOperation: downOperation.numParams,
            });
            if (numParams.isError) {
                return numParams;
            }

            const numMaxParams = numParamsTransformer.restore({
                nextState: nextState.numMaxParams,
                downOperation: downOperation.numMaxParams,
            });
            if (numMaxParams.isError) {
                return numMaxParams;
            }

            const strParamsTransformer = createStrParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const strParams = strParamsTransformer.restore({
                nextState: nextState.strParams,
                downOperation: downOperation.strParams,
            });
            if (strParams.isError) {
                return strParams;
            }

            const piecesTransformer = createPiecesTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const pieces = piecesTransformer.restore({
                nextState: nextState.pieces,
                downOperation: downOperation.pieces,
            });
            if (pieces.isError) {
                return pieces;
            }

            const prevState: StateType = {
                ...nextState,
                boolParams: boolParams.value.prevState,
                numParams: numParams.value.prevState,
                numMaxParams: numMaxParams.value.prevState,
                strParams: strParams.value.prevState,
                pieces: pieces.value.prevState,
            };
            const twoWayOperation: TwoWayOperationType = {
                boolParams: boolParams.value.twoWayOperation,
                numParams: numParams.value.twoWayOperation,
                numMaxParams: numMaxParams.value.twoWayOperation,
                strParams: strParams.value.twoWayOperation,
                pieces: pieces.value.twoWayOperation
            };

            if (downOperation.image !== undefined) {
                prevState.image = downOperation.image.oldValue ?? undefined;
                twoWayOperation.image = { oldValue: downOperation.image.oldValue ?? undefined, newValue: nextState.image };
            }
            if (downOperation.isPrivate !== undefined) {
                prevState.isPrivate = downOperation.isPrivate.oldValue;
                twoWayOperation.isPrivate = { ...downOperation.isPrivate, newValue: nextState.isPrivate };
            }
            if (downOperation.name !== undefined) {
                prevState.name = downOperation.name.oldValue;
                twoWayOperation.name = { ...downOperation.name, newValue: nextState.name };
            }

            return ResultModule.ok({ prevState, twoWayOperation });
        },
        transform: ({ key, prevState, currentState, clientOperation, serverOperation }) => {
            if (!RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }) && currentState.isPrivate) {
                return ResultModule.ok(undefined);
            }

            const boolParamsTransformer = createBoolParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const boolParams = boolParamsTransformer.transform({
                prevState: prevState.boolParams,
                currentState: currentState.boolParams,
                clientOperation: clientOperation.boolParams,
                serverOperation: serverOperation?.boolParams ?? new Map(),
            });
            if (boolParams.isError) {
                return boolParams;
            }

            const numParamsTransformer = createNumParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const numParams = numParamsTransformer.transform({
                prevState: prevState.numParams,
                currentState: currentState.numParams,
                clientOperation: clientOperation.numParams,
                serverOperation: serverOperation?.numParams ?? new Map(),
            });
            if (numParams.isError) {
                return numParams;
            }

            const numMaxParams = numParamsTransformer.transform({
                prevState: prevState.numMaxParams,
                currentState: currentState.numMaxParams,
                clientOperation: clientOperation.numMaxParams,
                serverOperation: serverOperation?.numMaxParams ?? new Map(),
            });
            if (numMaxParams.isError) {
                return numMaxParams;
            }

            const strParamsTransformer = createStrParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const strParams = strParamsTransformer.transform({
                prevState: prevState.strParams,
                currentState: currentState.strParams,
                clientOperation: clientOperation.strParams,
                serverOperation: serverOperation?.strParams ?? new Map(),
            });
            if (strParams.isError) {
                return strParams;
            }

            const piecesTransformer = createPiecesTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const pieces = piecesTransformer.transform({
                prevState: prevState.pieces,
                currentState: currentState.pieces,
                clientOperation: clientOperation.pieces,
                serverOperation: serverOperation?.pieces ?? new DualKeyMap(),
            });
            if (pieces.isError) {
                return pieces;
            }

            const twoWayOperation: TwoWayOperationTypeValue = {};

            twoWayOperation.image = ReplaceNullableFilePathTwoWayOperationModule.transform({
                first: serverOperation?.image,
                second: clientOperation.image,
                prevState: prevState.image,
            });
            twoWayOperation.isPrivate = ReplaceBooleanTwoWayOperationModule.transform({
                first: serverOperation?.isPrivate,
                second: clientOperation.isPrivate,
                prevState: prevState.isPrivate,
            });
            twoWayOperation.name = ReplaceStringTwoWayOperationModule.transform({
                first: serverOperation?.name,
                second: clientOperation.name,
                prevState: prevState.name,
            });

            if (undefinedForAll(twoWayOperation) && boolParams.value.size === 0 && numParams.value.size === 0 && numMaxParams.value.size === 0 && strParams.value.size === 0 && pieces.value.isEmpty) {
                return ResultModule.ok(undefined);
            }

            return ResultModule.ok({
                ...twoWayOperation,
                boolParams: boolParams.value,
                numParams: numParams.value,
                numMaxParams: numMaxParams.value,
                strParams: strParams.value,
                pieces: pieces.value
            });
        },
        diff: ({ key, prevState, nextState }): TwoWayOperationType | undefined => {
            const boolParamsTransformer = createBoolParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const boolParams = boolParamsTransformer.diff({
                prevState: prevState.boolParams,
                nextState: nextState.boolParams,
            });
            const numParamsTransformer = createNumParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const numParams = numParamsTransformer.diff({
                prevState: prevState.numParams,
                nextState: nextState.numParams,
            });
            const numMaxParams = numParamsTransformer.diff({
                prevState: prevState.numMaxParams,
                nextState: nextState.numMaxParams,
            });
            const strParamsTransformer = createStrParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const strParams = strParamsTransformer.diff({
                prevState: prevState.strParams,
                nextState: nextState.strParams,
            });
            const piecesTransformer = createPiecesTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const pieces = piecesTransformer.diff({
                prevState: prevState.pieces,
                nextState: nextState.pieces,
            });
            const resultType: TwoWayOperationTypeValue = {};
            if (prevState.image !== nextState.image) {
                resultType.image = { oldValue: prevState.image, newValue: nextState.image };
            }
            if (prevState.isPrivate !== nextState.isPrivate) {
                resultType.isPrivate = { oldValue: prevState.isPrivate, newValue: nextState.isPrivate };
            }
            if (prevState.name !== nextState.name) {
                resultType.name = { oldValue: prevState.name, newValue: nextState.name };
            }
            if (undefinedForAll(resultType) && boolParams.size === 0 && numParams.size === 0 && numMaxParams.size === 0 && strParams.size === 0 && pieces.isEmpty) {
                return undefined;
            }
            return { ...resultType, boolParams, numParams, numMaxParams, strParams, pieces };
        },
        applyBack: ({ key, downOperation, nextState }) => {
            const boolParamsTransformer = createBoolParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const boolParams = boolParamsTransformer.applyBack({
                downOperation: downOperation.boolParams,
                nextState: nextState.boolParams,
            });
            if (boolParams.isError) {
                return boolParams;
            }

            const numParamsTransformer = createNumParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const numParams = numParamsTransformer.applyBack({
                downOperation: downOperation.numParams,
                nextState: nextState.numParams,
            });
            if (numParams.isError) {
                return numParams;
            }

            const numMaxParams = numParamsTransformer.applyBack({
                downOperation: downOperation.numMaxParams,
                nextState: nextState.numMaxParams,
            });
            if (numMaxParams.isError) {
                return numMaxParams;
            }

            const strParamsTransformer = createStrParamsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const strParams = strParamsTransformer.applyBack({
                downOperation: downOperation.strParams,
                nextState: nextState.strParams,
            });
            if (strParams.isError) {
                return strParams;
            }

            const piecesTransformer = createPiecesTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const pieces = piecesTransformer.applyBack({
                downOperation: downOperation.pieces,
                nextState: nextState.pieces,
            });
            if (pieces.isError) {
                return pieces;
            }

            const result: StateType = {
                ...nextState,
                boolParams: boolParams.value,
                numParams: numParams.value,
                numMaxParams: numMaxParams.value,
                strParams: strParams.value,
                pieces: pieces.value
            };

            if (downOperation.image !== undefined) {
                result.image = downOperation.image.oldValue ?? undefined;
            }
            if (downOperation.isPrivate !== undefined) {
                result.isPrivate = downOperation.isPrivate.oldValue;
            }
            if (downOperation.name !== undefined) {
                result.name = downOperation.name.oldValue;
            }

            return ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {
            cancelRemove: ({ key, nextState }) => !RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }) && nextState.isPrivate,
        }
    });
}