import { Collection } from '@mikro-orm/core';
import { DualKey, DualKeyMap, ReadonlyDualKeyMap } from '../../../../@shared/DualKeyMap';
import { StrIndex100 } from '../../../../@shared/indexes';
import { Result, ResultModule } from '../../../../@shared/Result';
import { undefinedForAll } from '../../../../utils/helpers';
import { EM } from '../../../../utils/types';
import { createDownOperationFromMikroORM, createUpOperationFromGraphQL, ReadonlyDualKeyMapDownOperation, ReadonlyDualKeyMapTwoWayOperation, ReadonlyDualKeyMapUpOperation, replace, toGraphQLWithState, update } from '../../../dualKeyMapOperations';
import { ReplaceBooleanDownOperation, ReplaceBooleanDownOperationModule, ReplaceBooleanTwoWayOperation, ReplaceBooleanTwoWayOperationModule, ReplaceBooleanUpOperation, ReplaceNullableFilePathDownOperation, ReplaceNullableFilePathDownOperationModule, ReplaceNullableFilePathTwoWayOperation, ReplaceNullableFilePathTwoWayOperationModule, ReplaceNullableFilePathUpOperation, ReplaceStringDownOperation, ReplaceStringDownOperationModule, ReplaceStringTwoWayOperation, ReplaceStringTwoWayOperationModule, ReplaceStringUpOperation } from '../../../Operations';
import { FilePath } from '../../filePath/global';
import { DualKeyMapTransformer, ParamMapTransformer, TransformerFactory } from '../../global';
import { GlobalPiece } from '../../piece/global';
import { Room, RoomOp } from '../mikro-orm';
import { GlobalBoolParam } from './boolParam/global';
import { CharactersOperation, CharacterState, CharacterValueState } from './graphql';
import { AddCharaOp, Chara, RemoveCharaOp, UpdateCharaOp } from './mikro-orm';
import { GlobalNumParam } from './numParam/global';
import { GlobalStrParam } from './strParam/global';
import { RequestedBy } from '../../../Types';
import { GlobalBoardLocation } from '../../boardLocation/global';

export namespace GlobalCharacter {
    type StateTypeValue = {
        isPrivate: boolean;
        name: string;
        privateVarToml?: string;
        image?: FilePath;
        tachieImage?: FilePath;
    }

    export type StateType = StateTypeValue & {
        boolParams: ReadonlyMap<StrIndex100, GlobalBoolParam.StateType>;
        numParams: ReadonlyMap<StrIndex100, GlobalNumParam.StateType>;
        numMaxParams: ReadonlyMap<StrIndex100, GlobalNumParam.StateType>;
        strParams: ReadonlyMap<StrIndex100, GlobalStrParam.StateType>;
        pieces: ReadonlyDualKeyMap<string, string, GlobalPiece.StateType>;
        tachieLocations: ReadonlyDualKeyMap<string, string, GlobalBoardLocation.StateType>;
    }

    type DownOperationTypeValue = {
        isPrivate?: ReplaceBooleanDownOperation;
        name?: ReplaceStringDownOperation;
        privateVarToml?: ReplaceStringDownOperation;
        image?: ReplaceNullableFilePathDownOperation;
        tachieImage?: ReplaceNullableFilePathDownOperation;
    }

    export type DownOperationType = DownOperationTypeValue & {
        boolParams: ReadonlyMap<StrIndex100, GlobalBoolParam.DownOperationType>;
        numParams: ReadonlyMap<StrIndex100, GlobalNumParam.DownOperationType>;
        numMaxParams: ReadonlyMap<StrIndex100, GlobalNumParam.DownOperationType>;
        strParams: ReadonlyMap<StrIndex100, GlobalStrParam.DownOperationType>;
        pieces: ReadonlyDualKeyMapDownOperation<string, string, GlobalPiece.StateType, GlobalPiece.DownOperationType>;
        tachieLocations: ReadonlyDualKeyMapDownOperation<string, string, GlobalBoardLocation.StateType, GlobalBoardLocation.DownOperationType>;
    }

    type UpOperationTypeValue = {
        isPrivate?: ReplaceBooleanUpOperation;
        name?: ReplaceStringUpOperation;
        privateVarToml?: ReplaceStringUpOperation;
        image?: ReplaceNullableFilePathUpOperation;
        tachieImage?: ReplaceNullableFilePathUpOperation;
    }

    export type UpOperationType = UpOperationTypeValue & {
        boolParams: ReadonlyMap<StrIndex100, GlobalBoolParam.UpOperationType>;
        numParams: ReadonlyMap<StrIndex100, GlobalNumParam.UpOperationType>;
        numMaxParams: ReadonlyMap<StrIndex100, GlobalNumParam.UpOperationType>;
        strParams: ReadonlyMap<StrIndex100, GlobalStrParam.UpOperationType>;
        pieces: ReadonlyDualKeyMapUpOperation<string, string, GlobalPiece.StateType, GlobalPiece.UpOperationType>;
        tachieLocations: ReadonlyDualKeyMapUpOperation<string, string, GlobalBoardLocation.StateType, GlobalBoardLocation.UpOperationType>;
    }

    type TwoWayOperationTypeValue = {
        isPrivate?: ReplaceBooleanTwoWayOperation;
        name?: ReplaceStringTwoWayOperation;
        privateVarToml?: ReplaceStringTwoWayOperation;
        image?: ReplaceNullableFilePathTwoWayOperation;
        tachieImage?: ReplaceNullableFilePathTwoWayOperation;
    }

    export type TwoWayOperationType = TwoWayOperationTypeValue & {
        boolParams: ReadonlyMap<StrIndex100, GlobalBoolParam.TwoWayOperationType>;
        numParams: ReadonlyMap<StrIndex100, GlobalNumParam.TwoWayOperationType>;
        numMaxParams: ReadonlyMap<StrIndex100, GlobalNumParam.TwoWayOperationType>;
        strParams: ReadonlyMap<StrIndex100, GlobalStrParam.TwoWayOperationType>;
        pieces: ReadonlyDualKeyMapTwoWayOperation<string, string, GlobalPiece.StateType, GlobalPiece.TwoWayOperationType>;
        tachieLocations: ReadonlyDualKeyMapTwoWayOperation<string, string, GlobalBoardLocation.StateType, GlobalBoardLocation.TwoWayOperationType>;
    }

    export namespace MikroORM {
        export namespace ToGlobal {
            export const state = async (entity: Chara): Promise<StateType> => {
                const boolParams = GlobalBoolParam.MikroORM.ToGlobal.stateMany(await entity.boolParams.loadItems());
                const numParams = GlobalNumParam.MikroORM.ToGlobal.stateMany(await entity.numParams.loadItems());
                const numMaxParams = GlobalNumParam.MikroORM.ToGlobal.stateMany(await entity.numMaxParams.loadItems());
                const strParams = GlobalStrParam.MikroORM.ToGlobal.stateMany(await entity.strParams.loadItems());
                const pieces = GlobalPiece.MikroORM.ToGlobal.stateMany(await entity.charaPieces.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));
                const tachieLocations = GlobalBoardLocation.MikroORM.ToGlobal.stateMany(await entity.tachieLocs.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));

                return {
                    ...entity,
                    image: entity.imagePath == null || entity.imageSourceType == null ? undefined : {
                        path: entity.imagePath,
                        sourceType: entity.imageSourceType,
                    },
                    tachieImage: entity.tachieImagePath == null || entity.tachieImageSourceType == null ? undefined : {
                        path: entity.tachieImagePath,
                        sourceType: entity.tachieImageSourceType,
                    },
                    boolParams,
                    numParams,
                    numMaxParams,
                    strParams,
                    pieces,
                    tachieLocations,
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
                const tachieLocations = GlobalBoardLocation.MikroORM.ToGlobal.stateMany(await entity.removedTachieLocs.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));

                return {
                    ...entity,
                    image: entity.imagePath == null || entity.imageSourceType == null ? undefined : {
                        path: entity.imagePath,
                        sourceType: entity.imageSourceType,
                    },
                    tachieImage: entity.tachieImagePath == null || entity.tachieImageSourceType == null ? undefined : {
                        path: entity.tachieImagePath,
                        sourceType: entity.tachieImageSourceType,
                    },
                    boolParams,
                    numParams,
                    numMaxParams,
                    strParams,
                    pieces,
                    tachieLocations,
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
                        const tachieLocations = await GlobalBoardLocation.MikroORM.ToGlobal.downOperationMany({
                            add: entity.addTachieLocOps,
                            remove: entity.removeTachieLocOps,
                            update: entity.updateTachieLocOps,
                            toDualKey: x => ({ first: x.boardCreatedBy, second: x.boardId }),
                        });
                        if (tachieLocations.isError) {
                            return tachieLocations;
                        }

                        return ResultModule.ok({
                            boolParams: boolParams.value,
                            numParams: numParams.value,
                            numMaxParams: numMaxParams.value,
                            strParams: strParams.value,
                            pieces: pieces.value,
                            tachieLocations: tachieLocations.value,
                            isPrivate: entity.isPrivate == null ? undefined : { oldValue: entity.isPrivate },
                            name: entity.name == null ? undefined : { oldValue: entity.name },
                            privateVarToml: entity.privateVarToml == null ? undefined : { oldValue: entity.privateVarToml },
                            image: entity.image,
                            tachieImage: entity.tachieImage
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
                    privateVarToml: createdByMe ? source.privateVarToml : undefined,
                    boolParams: GlobalBoolParam.Global.ToGraphQL.stateMany({ source: source.boolParams, createdByMe }),
                    numParams: GlobalNumParam.Global.ToGraphQL.stateMany({ source: source.numParams, createdByMe }),
                    numMaxParams: GlobalNumParam.Global.ToGraphQL.stateMany({ source: source.numMaxParams, createdByMe }),
                    strParams: GlobalStrParam.Global.ToGraphQL.stateMany({ source: source.strParams, createdByMe }),
                    pieces: GlobalPiece.Global.ToGraphQL.stateMany({ source: source.pieces, createdByMe }),
                    tachieLocations: GlobalBoardLocation.Global.ToGraphQL.stateMany({ source: source.tachieLocations, createdByMe }),
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
                        const boolParams = GlobalBoolParam.Global.ToGraphQL.operation({
                            operation: operation.boolParams,
                            prevState: prevState.boolParams,
                            nextState: nextState.boolParams,
                            createdByMe
                        });
                        const numParams = GlobalNumParam.Global.ToGraphQL.operation({
                            operation: operation.numParams,
                            prevState: prevState.numParams,
                            nextState: nextState.numParams,
                            createdByMe
                        });
                        const numMaxParams = GlobalNumParam.Global.ToGraphQL.operation({
                            operation: operation.numMaxParams,
                            prevState: prevState.numMaxParams,
                            nextState: nextState.numMaxParams,
                            createdByMe
                        });
                        const strParams = GlobalStrParam.Global.ToGraphQL.operation({
                            operation: operation.strParams,
                            prevState: prevState.strParams,
                            nextState: nextState.strParams,
                            createdByMe
                        });
                        const pieces = GlobalPiece.Global.ToGraphQL.operation({
                            operation: operation.pieces,
                            prevState: prevState.pieces,
                            nextState: nextState.pieces,
                            createdByMe
                        });
                        const tachieLocations = GlobalBoardLocation.Global.ToGraphQL.operation({
                            operation: operation.tachieLocations,
                            prevState: prevState.tachieLocations,
                            nextState: nextState.tachieLocations,
                            createdByMe
                        });
                        return {
                            createdBy: key.first,
                            id: key.second,
                            operation: {
                                ...operation,
                                privateVarToml: RequestedBy.createdByMe({ requestedBy, userUid: key.first }) ? operation.privateVarToml : undefined,
                                boolParams,
                                numParams,
                                numMaxParams,
                                strParams,
                                pieces,
                                tachieLocations,
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
                                roomOp: parentOp,
                            });
                            op.imagePath = value.operation.oldValue.image?.path;
                            op.imageSourceType = value.operation.oldValue.image?.sourceType;
                            op.tachieImagePath = value.operation.oldValue.tachieImage?.path;
                            op.tachieImageSourceType = value.operation.oldValue.tachieImage?.sourceType;
                            em.persist(op);
                            continue;
                        }

                        const toAdd = new Chara({
                            ...value.operation.newValue,
                            createdBy: key.first,
                            stateId: key.second,
                            room: parent,
                        });
                        toAdd.imagePath = value.operation.newValue.image?.path;
                        toAdd.imageSourceType = value.operation.newValue.image?.sourceType;
                        toAdd.tachieImagePath = value.operation.newValue.tachieImage?.path;
                        toAdd.tachieImageSourceType = value.operation.newValue.tachieImage?.sourceType;
                        em.persist(toAdd);

                        const op = new AddCharaOp({ createdBy: key.first, stateId: key.second, roomOp: parentOp });
                        em.persist(op);
                        continue;
                    }
                    case update: {
                        const target = await em.findOneOrFail(Chara, { room: { id: parent.id }, createdBy: key.first, stateId: key.second });
                        const op = new UpdateCharaOp({ createdBy: key.first, stateId: key.second, roomOp: parentOp });

                        await GlobalBoolParam.Global.applyToEntity({ em, parent: target, parentOp: op, operation: value.operation.boolParams });
                        await GlobalNumParam.Global.applyToEntity({ em, parent: target, parentOp: op, operation: value.operation.numParams, type: 'default' });
                        await GlobalNumParam.Global.applyToEntity({ em, parent: target, parentOp: op, operation: value.operation.numMaxParams, type: 'max' });
                        await GlobalStrParam.Global.applyToEntity({ em, parent: target, parentOp: op, operation: value.operation.strParams });
                        await GlobalPiece.Global.applyToCharaPiecesEntity({ em, parent: target, parentOp: op, operation: value.operation.pieces });
                        await GlobalBoardLocation.Global.applyToTachieLocsEntity({ em, parent: target, parentOp: op, operation: value.operation.tachieLocations });

                        if (value.operation.image != null) {
                            target.imagePath = value.operation.image.newValue?.path;
                            target.imageSourceType = value.operation.image.newValue?.sourceType;
                            op.image = value.operation.image;
                        }
                        if (value.operation.tachieImage != null) {
                            target.tachieImagePath = value.operation.tachieImage.newValue?.path;
                            target.tachieImageSourceType = value.operation.tachieImage.newValue?.sourceType;
                            op.tachieImage = value.operation.tachieImage;
                        }
                        if (value.operation.isPrivate != null) {
                            target.isPrivate = value.operation.isPrivate.newValue;
                            op.isPrivate = value.operation.isPrivate.oldValue;
                        }
                        if (value.operation.name != null) {
                            target.name = value.operation.name.newValue;
                            op.name = value.operation.name.oldValue;
                        }
                        if (value.operation.privateVarToml != null) {
                            target.privateVarToml= value.operation.privateVarToml.newValue;
                            op.privateVarToml = value.operation.privateVarToml.oldValue;
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
            export const state = (object: CharacterValueState): StateType => {
                const boolParams = GlobalBoolParam.GraphQL.ToGlobal.stateMany(object.boolParams);
                const numParams = GlobalNumParam.GraphQL.ToGlobal.stateMany(object.numParams);
                const numMaxParams = GlobalNumParam.GraphQL.ToGlobal.stateMany(object.numMaxParams);
                const strParams = GlobalStrParam.GraphQL.ToGlobal.stateMany(object.strParams);
                const pieces = GlobalPiece.GraphQL.ToGlobal.stateMany(object.pieces);
                const tachieLocations = GlobalBoardLocation.GraphQL.ToGlobal.stateMany(object.tachieLocations);

                return {
                    ...object,
                    boolParams,
                    numParams,
                    numMaxParams,
                    strParams,
                    pieces,
                    tachieLocations,
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
                        const tachieLocations = GlobalBoardLocation.GraphQL.ToGlobal.upOperationMany(x.operation.tachieLocations);
                        if (tachieLocations.isError) {
                            return tachieLocations;
                        }
                        return ResultModule.ok({
                            ...x.operation,
                            boolParams: boolParams.value,
                            numParams: numParams.value,
                            numMaxParams: numMaxParams.value,
                            strParams: strParams.value,
                            pieces: pieces.value,
                            tachieLocations: tachieLocations.value,
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
    const createTachieLocationTransformer = (createdByMe: boolean) => GlobalBoardLocation.transformerFactory<DualKey<string, string>>(createdByMe);
    const createTachieLocationsTransformer = (createdByMe: boolean) => new DualKeyMapTransformer(createTachieLocationTransformer(createdByMe));

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

            const tachieLocationsTransformer = createTachieLocationsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const tachieLocations = tachieLocationsTransformer.composeLoose({
                first: first.tachieLocations,
                second: second.tachieLocations,
            });
            if (tachieLocations.isError) {
                return tachieLocations;
            }

            const valueProps: DownOperationType = {
                isPrivate: ReplaceBooleanDownOperationModule.compose(first.isPrivate, second.isPrivate),
                name: ReplaceStringDownOperationModule.compose(first.name, second.name),
                privateVarToml: ReplaceStringDownOperationModule.compose(first.privateVarToml, second.privateVarToml),
                image: ReplaceNullableFilePathDownOperationModule.compose(first.image, second.image),
                tachieImage: ReplaceNullableFilePathDownOperationModule.compose(first.tachieImage, second.tachieImage),
                boolParams: boolParams.value ?? new Map(),
                numParams: numParams.value ?? new Map(),
                numMaxParams: numMaxParams.value ?? new Map(),
                strParams: strParams.value ?? new Map(),
                pieces: pieces.value ?? new DualKeyMap(),
                tachieLocations: tachieLocations.value ?? new DualKeyMap(),
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

            const tachieLocationsTransformer = createTachieLocationsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const tachieLocations = tachieLocationsTransformer.restore({
                nextState: nextState.tachieLocations,
                downOperation: downOperation.tachieLocations,
            });
            if (tachieLocations.isError) {
                return tachieLocations;
            }

            const prevState: StateType = {
                ...nextState,
                boolParams: boolParams.value.prevState,
                numParams: numParams.value.prevState,
                numMaxParams: numMaxParams.value.prevState,
                strParams: strParams.value.prevState,
                pieces: pieces.value.prevState,
                tachieLocations: tachieLocations.value.prevState,
            };
            const twoWayOperation: TwoWayOperationType = {
                boolParams: boolParams.value.twoWayOperation,
                numParams: numParams.value.twoWayOperation,
                numMaxParams: numMaxParams.value.twoWayOperation,
                strParams: strParams.value.twoWayOperation,
                pieces: pieces.value.twoWayOperation,
                tachieLocations: tachieLocations.value.twoWayOperation,
            };

            if (downOperation.image !== undefined) {
                prevState.image = downOperation.image.oldValue ?? undefined;
                twoWayOperation.image = { oldValue: downOperation.image.oldValue ?? undefined, newValue: nextState.image };
            }
            if (downOperation.tachieImage !== undefined) {
                prevState.tachieImage = downOperation.tachieImage.oldValue ?? undefined;
                twoWayOperation.tachieImage = { oldValue: downOperation.tachieImage.oldValue ?? undefined, newValue: nextState.tachieImage };
            }
            if (downOperation.isPrivate !== undefined) {
                prevState.isPrivate = downOperation.isPrivate.oldValue;
                twoWayOperation.isPrivate = { ...downOperation.isPrivate, newValue: nextState.isPrivate };
            }
            if (downOperation.name !== undefined) {
                prevState.name = downOperation.name.oldValue;
                twoWayOperation.name = { ...downOperation.name, newValue: nextState.name };
            }
            if (downOperation.privateVarToml !== undefined) {
                prevState.privateVarToml = downOperation.privateVarToml.oldValue;
                twoWayOperation.privateVarToml = { ...downOperation.privateVarToml, newValue: nextState.privateVarToml ?? '' };
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

            const tachieLocationsTransformer = createTachieLocationsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const tachieLocations = tachieLocationsTransformer.transform({
                prevState: prevState.tachieLocations,
                currentState: currentState.tachieLocations,
                clientOperation: clientOperation.tachieLocations,
                serverOperation: serverOperation?.tachieLocations ?? new DualKeyMap(),
            });
            if (tachieLocations.isError) {
                return tachieLocations;
            }

            const twoWayOperation: TwoWayOperationTypeValue = {};

            twoWayOperation.image = ReplaceNullableFilePathTwoWayOperationModule.transform({
                first: serverOperation?.image,
                second: clientOperation.image,
                prevState: prevState.image,
            });
            twoWayOperation.tachieImage = ReplaceNullableFilePathTwoWayOperationModule.transform({
                first: serverOperation?.tachieImage,
                second: clientOperation.tachieImage,
                prevState: prevState.tachieImage,
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
            if (RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first })) {
                twoWayOperation.privateVarToml = ReplaceStringTwoWayOperationModule.transform({
                    first: serverOperation?.privateVarToml,
                    second: clientOperation.privateVarToml,
                    prevState: prevState.privateVarToml ?? '',
                });
            }

            if (undefinedForAll(twoWayOperation) && boolParams.value.size === 0 && numParams.value.size === 0 && numMaxParams.value.size === 0 && strParams.value.size === 0 && pieces.value.isEmpty && tachieLocations.value.isEmpty) {
                return ResultModule.ok(undefined);
            }

            return ResultModule.ok({
                ...twoWayOperation,
                boolParams: boolParams.value,
                numParams: numParams.value,
                numMaxParams: numMaxParams.value,
                strParams: strParams.value,
                pieces: pieces.value,
                tachieLocations: tachieLocations.value,
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
            const tachieLocationsTransformer = createTachieLocationsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const tachieLocations = tachieLocationsTransformer.diff({
                prevState: prevState.tachieLocations,
                nextState: nextState.tachieLocations,
            });
            const resultType: TwoWayOperationTypeValue = {};
            if (prevState.image !== nextState.image) {
                resultType.image = { oldValue: prevState.image, newValue: nextState.image };
            }
            if (prevState.tachieImage !== nextState.tachieImage) {
                resultType.tachieImage = { oldValue: prevState.tachieImage, newValue: nextState.tachieImage };
            }
            if (prevState.isPrivate !== nextState.isPrivate) {
                resultType.isPrivate = { oldValue: prevState.isPrivate, newValue: nextState.isPrivate };
            }
            if (prevState.name !== nextState.name) {
                resultType.name = { oldValue: prevState.name, newValue: nextState.name };
            }
            if (prevState.privateVarToml !== nextState.privateVarToml) {
                resultType.privateVarToml = { oldValue: prevState.privateVarToml ?? '', newValue: nextState.privateVarToml ?? '' };
            }
            if (undefinedForAll(resultType) && boolParams.size === 0 && numParams.size === 0 && numMaxParams.size === 0 && strParams.size === 0 && pieces.isEmpty && tachieLocations.isEmpty) {
                return undefined;
            }
            return { ...resultType, boolParams, numParams, numMaxParams, strParams, pieces, tachieLocations };
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

            const tachieLocationsTransformer = createTachieLocationsTransformer(RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const tachieLocations = tachieLocationsTransformer.applyBack({
                downOperation: downOperation.tachieLocations,
                nextState: nextState.tachieLocations,
            });
            if (tachieLocations.isError) {
                return tachieLocations;
            }

            const result: StateType = {
                ...nextState,
                boolParams: boolParams.value,
                numParams: numParams.value,
                numMaxParams: numMaxParams.value,
                strParams: strParams.value,
                pieces: pieces.value,
                tachieLocations: tachieLocations.value,
            };

            if (downOperation.image !== undefined) {
                result.image = downOperation.image.oldValue ?? undefined;
            }
            if (downOperation.tachieImage !== undefined) {
                result.tachieImage = downOperation.tachieImage.oldValue ?? undefined;
            }
            if (downOperation.isPrivate !== undefined) {
                result.isPrivate = downOperation.isPrivate.oldValue;
            }
            if (downOperation.name !== undefined) {
                result.name = downOperation.name.oldValue;
            }
            if (downOperation.privateVarToml !== undefined) {
                result.privateVarToml = downOperation.privateVarToml.oldValue;
            }

            return ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {
            cancelRemove: ({ key, nextState }) => !RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }) && nextState.isPrivate,
        }
    });
}