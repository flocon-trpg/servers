"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalCharacter = void 0;
const DualKeyMap_1 = require("../../../../@shared/DualKeyMap");
const Result_1 = require("../../../../@shared/Result");
const helpers_1 = require("../../../../utils/helpers");
const dualKeyMapOperations_1 = require("../../../dualKeyMapOperations");
const Operations_1 = require("../../../Operations");
const global_1 = require("../../global");
const global_2 = require("../../piece/global");
const global_3 = require("./boolParam/global");
const mikro_orm_1 = require("./mikro-orm");
const global_4 = require("./numParam/global");
const global_5 = require("./strParam/global");
const Types_1 = require("../../../Types");
const global_6 = require("../../boardLocation/global");
var GlobalCharacter;
(function (GlobalCharacter) {
    let MikroORM;
    (function (MikroORM) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = async (entity) => {
                const boolParams = global_3.GlobalBoolParam.MikroORM.ToGlobal.stateMany(await entity.boolParams.loadItems());
                const numParams = global_4.GlobalNumParam.MikroORM.ToGlobal.stateMany(await entity.numParams.loadItems());
                const numMaxParams = global_4.GlobalNumParam.MikroORM.ToGlobal.stateMany(await entity.numMaxParams.loadItems());
                const strParams = global_5.GlobalStrParam.MikroORM.ToGlobal.stateMany(await entity.strParams.loadItems());
                const pieces = global_2.GlobalPiece.MikroORM.ToGlobal.stateMany(await entity.charaPieces.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));
                const tachieLocations = global_6.GlobalBoardLocation.MikroORM.ToGlobal.stateMany(await entity.tachieLocs.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));
                return Object.assign(Object.assign({}, entity), { image: entity.imagePath == null || entity.imageSourceType == null ? undefined : {
                        path: entity.imagePath,
                        sourceType: entity.imageSourceType,
                    }, tachieImage: entity.tachieImagePath == null || entity.tachieImageSourceType == null ? undefined : {
                        path: entity.tachieImagePath,
                        sourceType: entity.tachieImageSourceType,
                    }, boolParams,
                    numParams,
                    numMaxParams,
                    strParams,
                    pieces,
                    tachieLocations });
            };
            ToGlobal.stateMany = async (entity) => {
                const result = new DualKeyMap_1.DualKeyMap();
                for (const elem of entity) {
                    result.set({ first: elem.createdBy, second: elem.stateId }, await ToGlobal.state(elem));
                }
                return result;
            };
            ToGlobal.stateFromRemoveCharaOp = async (entity) => {
                const boolParams = global_3.GlobalBoolParam.MikroORM.ToGlobal.stateMany(await entity.removedBoolParam.loadItems());
                const numParams = global_4.GlobalNumParam.MikroORM.ToGlobal.stateMany(await entity.removedNumParam.loadItems());
                const numMaxParams = global_4.GlobalNumParam.MikroORM.ToGlobal.stateMany(await entity.removedNumParam.loadItems());
                const strParams = global_5.GlobalStrParam.MikroORM.ToGlobal.stateMany(await entity.removedStrParam.loadItems());
                const pieces = global_2.GlobalPiece.MikroORM.ToGlobal.stateMany(await entity.removedCharaPieces.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));
                const tachieLocations = global_6.GlobalBoardLocation.MikroORM.ToGlobal.stateMany(await entity.removedTachieLocs.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));
                return Object.assign(Object.assign({}, entity), { image: entity.imagePath == null || entity.imageSourceType == null ? undefined : {
                        path: entity.imagePath,
                        sourceType: entity.imageSourceType,
                    }, tachieImage: entity.tachieImagePath == null || entity.tachieImageSourceType == null ? undefined : {
                        path: entity.tachieImagePath,
                        sourceType: entity.tachieImageSourceType,
                    }, boolParams,
                    numParams,
                    numMaxParams,
                    strParams,
                    pieces,
                    tachieLocations });
            };
            ToGlobal.stateManyFromRemoveCharaOp = async (entity) => {
                const result = new DualKeyMap_1.DualKeyMap();
                for (const elem of entity) {
                    result.set({ first: elem.createdBy, second: elem.stateId }, await ToGlobal.stateFromRemoveCharaOp(elem));
                }
                return result;
            };
            ToGlobal.downOperationMany = async ({ add, update, remove, }) => {
                return await dualKeyMapOperations_1.createDownOperationFromMikroORM({
                    add,
                    update,
                    remove,
                    toDualKey: x => {
                        return Result_1.ResultModule.ok({ first: x.createdBy, second: x.stateId });
                    },
                    getState: async (x) => Result_1.ResultModule.ok(await ToGlobal.stateFromRemoveCharaOp(x)),
                    getOperation: async (entity) => {
                        const boolParams = await global_3.GlobalBoolParam.MikroORM.ToGlobal.downOperationMany({ update: entity.updateBoolParamOps });
                        if (boolParams.isError) {
                            return boolParams;
                        }
                        const numParams = await global_4.GlobalNumParam.MikroORM.ToGlobal.downOperationMany({ update: entity.updateNumParamOps });
                        if (numParams.isError) {
                            return numParams;
                        }
                        const numMaxParams = await global_4.GlobalNumParam.MikroORM.ToGlobal.downOperationMany({ update: entity.updateNumMaxParamOps });
                        if (numMaxParams.isError) {
                            return numMaxParams;
                        }
                        const strParams = await global_5.GlobalStrParam.MikroORM.ToGlobal.downOperationMany({ update: entity.updateStrParamOps });
                        if (strParams.isError) {
                            return strParams;
                        }
                        const pieces = await global_2.GlobalPiece.MikroORM.ToGlobal.downOperationMany({
                            add: entity.addCharaPieceOps,
                            remove: entity.removeCharaPieceOps,
                            update: entity.updateCharaPieceOps,
                            toDualKey: x => ({ first: x.boardCreatedBy, second: x.boardId }),
                        });
                        if (pieces.isError) {
                            return pieces;
                        }
                        const tachieLocations = await global_6.GlobalBoardLocation.MikroORM.ToGlobal.downOperationMany({
                            add: entity.addTachieLocOps,
                            remove: entity.removeTachieLocOps,
                            update: entity.updateTachieLocOps,
                            toDualKey: x => ({ first: x.boardCreatedBy, second: x.boardId }),
                        });
                        if (tachieLocations.isError) {
                            return tachieLocations;
                        }
                        return Result_1.ResultModule.ok({
                            boolParams: boolParams.value,
                            numParams: numParams.value,
                            numMaxParams: numMaxParams.value,
                            strParams: strParams.value,
                            pieces: pieces.value,
                            tachieLocations: tachieLocations.value,
                            isPrivate: entity.isPrivate == null ? undefined : { oldValue: entity.isPrivate },
                            name: entity.name == null ? undefined : { oldValue: entity.name },
                            image: entity.image,
                            tachieImage: entity.tachieImage
                        });
                    },
                });
            };
        })(ToGlobal = MikroORM.ToGlobal || (MikroORM.ToGlobal = {}));
    })(MikroORM = GlobalCharacter.MikroORM || (GlobalCharacter.MikroORM = {}));
    let Global;
    (function (Global) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = ({ source, createdByMe }) => {
                if (!createdByMe && source.isPrivate) {
                    return undefined;
                }
                return Object.assign(Object.assign({}, source), { boolParams: global_3.GlobalBoolParam.Global.ToGraphQL.stateMany({ source: source.boolParams, createdByMe }), numParams: global_4.GlobalNumParam.Global.ToGraphQL.stateMany({ source: source.numParams, createdByMe }), numMaxParams: global_4.GlobalNumParam.Global.ToGraphQL.stateMany({ source: source.numMaxParams, createdByMe }), strParams: global_5.GlobalStrParam.Global.ToGraphQL.stateMany({ source: source.strParams, createdByMe }), pieces: global_2.GlobalPiece.Global.ToGraphQL.stateMany({ source: source.pieces, createdByMe }), tachieLocations: global_6.GlobalBoardLocation.Global.ToGraphQL.stateMany({ source: source.tachieLocations, createdByMe }) });
            };
            ToGraphQL.stateMany = ({ source, requestedBy }) => {
                const result = [];
                source.forEach((value, key) => {
                    const newState = ToGraphQL.state({
                        source: value,
                        createdByMe: Types_1.RequestedBy.createdByMe({ requestedBy, userUid: key.first }),
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
            ToGraphQL.operation = ({ operation, prevState, nextState, requestedBy, }) => {
                return dualKeyMapOperations_1.toGraphQLWithState({
                    source: operation,
                    prevState,
                    nextState,
                    isPrivate: (state, key) => !Types_1.RequestedBy.createdByMe({ requestedBy, userUid: key.first }) && state.isPrivate,
                    toReplaceOperation: ({ nextState, key }) => ({
                        createdBy: key.first,
                        id: key.second,
                        newValue: nextState === undefined ? undefined : ToGraphQL.state({
                            source: nextState,
                            createdByMe: Types_1.RequestedBy.createdByMe({ requestedBy, userUid: key.first }),
                        })
                    }),
                    toUpdateOperation: ({ operation, prevState, nextState, key }) => {
                        const createdByMe = Types_1.RequestedBy.createdByMe({ requestedBy, userUid: key.first });
                        const boolParams = global_3.GlobalBoolParam.Global.ToGraphQL.operation({
                            operation: operation.boolParams,
                            prevState: prevState.boolParams,
                            nextState: nextState.boolParams,
                            createdByMe
                        });
                        const numParams = global_4.GlobalNumParam.Global.ToGraphQL.operation({
                            operation: operation.numParams,
                            prevState: prevState.numParams,
                            nextState: nextState.numParams,
                            createdByMe
                        });
                        const numMaxParams = global_4.GlobalNumParam.Global.ToGraphQL.operation({
                            operation: operation.numMaxParams,
                            prevState: prevState.numMaxParams,
                            nextState: nextState.numMaxParams,
                            createdByMe
                        });
                        const strParams = global_5.GlobalStrParam.Global.ToGraphQL.operation({
                            operation: operation.strParams,
                            prevState: prevState.strParams,
                            nextState: nextState.strParams,
                            createdByMe
                        });
                        const pieces = global_2.GlobalPiece.Global.ToGraphQL.operation({
                            operation: operation.pieces,
                            prevState: prevState.pieces,
                            nextState: nextState.pieces,
                            createdByMe
                        });
                        const tachieLocations = global_6.GlobalBoardLocation.Global.ToGraphQL.operation({
                            operation: operation.tachieLocations,
                            prevState: prevState.tachieLocations,
                            nextState: nextState.tachieLocations,
                            createdByMe
                        });
                        return {
                            createdBy: key.first,
                            id: key.second,
                            operation: Object.assign(Object.assign({}, operation), { boolParams,
                                numParams,
                                numMaxParams,
                                strParams,
                                pieces,
                                tachieLocations }),
                        };
                    },
                });
            };
        })(ToGraphQL = Global.ToGraphQL || (Global.ToGraphQL = {}));
        Global.applyToEntity = async ({ em, parent, parentOp, operation, }) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            for (const [key, value] of operation) {
                switch (value.type) {
                    case dualKeyMapOperations_1.replace: {
                        if (value.operation.newValue === undefined) {
                            if (value.operation.oldValue === undefined) {
                                console.warn('Replace: oldValue === newValue === undefined. This should be id.');
                                continue;
                            }
                            const toRemove = await em.findOneOrFail(mikro_orm_1.Chara, { room: { id: parent.id }, createdBy: key.first, stateId: key.second });
                            em.remove(toRemove);
                            const op = new mikro_orm_1.RemoveCharaOp(Object.assign(Object.assign({}, value.operation.oldValue), { createdBy: key.first, stateId: key.second, roomOp: parentOp }));
                            op.imagePath = (_a = value.operation.oldValue.image) === null || _a === void 0 ? void 0 : _a.path;
                            op.imageSourceType = (_b = value.operation.oldValue.image) === null || _b === void 0 ? void 0 : _b.sourceType;
                            op.tachieImagePath = (_c = value.operation.oldValue.tachieImage) === null || _c === void 0 ? void 0 : _c.path;
                            op.tachieImageSourceType = (_d = value.operation.oldValue.tachieImage) === null || _d === void 0 ? void 0 : _d.sourceType;
                            em.persist(op);
                            continue;
                        }
                        const toAdd = new mikro_orm_1.Chara(Object.assign(Object.assign({}, value.operation.newValue), { createdBy: key.first, stateId: key.second, room: parent }));
                        toAdd.imagePath = (_e = value.operation.newValue.image) === null || _e === void 0 ? void 0 : _e.path;
                        toAdd.imageSourceType = (_f = value.operation.newValue.image) === null || _f === void 0 ? void 0 : _f.sourceType;
                        toAdd.tachieImagePath = (_g = value.operation.newValue.tachieImage) === null || _g === void 0 ? void 0 : _g.path;
                        toAdd.tachieImageSourceType = (_h = value.operation.newValue.tachieImage) === null || _h === void 0 ? void 0 : _h.sourceType;
                        em.persist(toAdd);
                        const op = new mikro_orm_1.AddCharaOp({ createdBy: key.first, stateId: key.second, roomOp: parentOp });
                        em.persist(op);
                        continue;
                    }
                    case dualKeyMapOperations_1.update: {
                        const target = await em.findOneOrFail(mikro_orm_1.Chara, { room: { id: parent.id }, createdBy: key.first, stateId: key.second });
                        const op = new mikro_orm_1.UpdateCharaOp({ createdBy: key.first, stateId: key.second, roomOp: parentOp });
                        await global_3.GlobalBoolParam.Global.applyToEntity({ em, parent: target, parentOp: op, operation: value.operation.boolParams });
                        await global_4.GlobalNumParam.Global.applyToEntity({ em, parent: target, parentOp: op, operation: value.operation.numParams, type: 'default' });
                        await global_4.GlobalNumParam.Global.applyToEntity({ em, parent: target, parentOp: op, operation: value.operation.numMaxParams, type: 'max' });
                        await global_5.GlobalStrParam.Global.applyToEntity({ em, parent: target, parentOp: op, operation: value.operation.strParams });
                        await global_2.GlobalPiece.Global.applyToCharaPiecesEntity({ em, parent: target, parentOp: op, operation: value.operation.pieces });
                        await global_6.GlobalBoardLocation.Global.applyToTachieLocsEntity({ em, parent: target, parentOp: op, operation: value.operation.tachieLocations });
                        if (value.operation.image != null) {
                            target.imagePath = (_j = value.operation.image.newValue) === null || _j === void 0 ? void 0 : _j.path;
                            target.imageSourceType = (_k = value.operation.image.newValue) === null || _k === void 0 ? void 0 : _k.sourceType;
                            op.image = value.operation.image;
                        }
                        if (value.operation.tachieImage != null) {
                            target.tachieImagePath = (_l = value.operation.tachieImage.newValue) === null || _l === void 0 ? void 0 : _l.path;
                            target.tachieImageSourceType = (_m = value.operation.tachieImage.newValue) === null || _m === void 0 ? void 0 : _m.sourceType;
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
                        em.persist(op);
                        continue;
                    }
                }
            }
        };
    })(Global = GlobalCharacter.Global || (GlobalCharacter.Global = {}));
    let GraphQL;
    (function (GraphQL) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = (object) => {
                const boolParams = global_3.GlobalBoolParam.GraphQL.ToGlobal.stateMany(object.boolParams);
                const numParams = global_4.GlobalNumParam.GraphQL.ToGlobal.stateMany(object.numParams);
                const numMaxParams = global_4.GlobalNumParam.GraphQL.ToGlobal.stateMany(object.numMaxParams);
                const strParams = global_5.GlobalStrParam.GraphQL.ToGlobal.stateMany(object.strParams);
                const pieces = global_2.GlobalPiece.GraphQL.ToGlobal.stateMany(object.pieces);
                const tachieLocations = global_6.GlobalBoardLocation.GraphQL.ToGlobal.stateMany(object.tachieLocations);
                return Object.assign(Object.assign({}, object), { boolParams,
                    numParams,
                    numMaxParams,
                    strParams,
                    pieces,
                    tachieLocations });
            };
            ToGlobal.upOperationMany = (source) => {
                return dualKeyMapOperations_1.createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createDualKey: x => {
                        return Result_1.ResultModule.ok({ first: x.createdBy, second: x.id });
                    },
                    getState: x => x.newValue == null ? undefined : ToGlobal.state(x.newValue),
                    getOperation: x => {
                        const boolParams = global_3.GlobalBoolParam.GraphQL.ToGlobal.upOperationMany(x.operation.boolParams);
                        if (boolParams.isError) {
                            return boolParams;
                        }
                        const numParams = global_4.GlobalNumParam.GraphQL.ToGlobal.upOperationMany(x.operation.numParams);
                        if (numParams.isError) {
                            return numParams;
                        }
                        const numMaxParams = global_4.GlobalNumParam.GraphQL.ToGlobal.upOperationMany(x.operation.numMaxParams);
                        if (numMaxParams.isError) {
                            return numMaxParams;
                        }
                        const strParams = global_5.GlobalStrParam.GraphQL.ToGlobal.upOperationMany(x.operation.strParams);
                        if (strParams.isError) {
                            return strParams;
                        }
                        const pieces = global_2.GlobalPiece.GraphQL.ToGlobal.upOperationMany(x.operation.pieces);
                        if (pieces.isError) {
                            return pieces;
                        }
                        const tachieLocations = global_6.GlobalBoardLocation.GraphQL.ToGlobal.upOperationMany(x.operation.tachieLocations);
                        if (tachieLocations.isError) {
                            return tachieLocations;
                        }
                        return Result_1.ResultModule.ok(Object.assign(Object.assign({}, x.operation), { boolParams: boolParams.value, numParams: numParams.value, numMaxParams: numMaxParams.value, strParams: strParams.value, pieces: pieces.value, tachieLocations: tachieLocations.value }));
                    },
                });
            };
        })(ToGlobal = GraphQL.ToGlobal || (GraphQL.ToGlobal = {}));
    })(GraphQL = GlobalCharacter.GraphQL || (GlobalCharacter.GraphQL = {}));
    const createBoolParamTransformer = (createdByMe) => global_3.GlobalBoolParam.transformerFactory(createdByMe);
    const createBoolParamsTransformer = (createdByMe) => new global_1.ParamMapTransformer(createBoolParamTransformer(createdByMe));
    const createNumParamTransformer = (createdByMe) => global_4.GlobalNumParam.transformerFactory(createdByMe);
    const createNumParamsTransformer = (createdByMe) => new global_1.ParamMapTransformer(createNumParamTransformer(createdByMe));
    const createStrParamTransformer = (createdByMe) => global_5.GlobalStrParam.transformerFactory(createdByMe);
    const createStrParamsTransformer = (createdByMe) => new global_1.ParamMapTransformer(createStrParamTransformer(createdByMe));
    const createPieceTransformer = (createdByMe) => global_2.GlobalPiece.transformerFactory(createdByMe);
    const createPiecesTransformer = (createdByMe) => new global_1.DualKeyMapTransformer(createPieceTransformer(createdByMe));
    const createTachieLocationTransformer = (createdByMe) => global_6.GlobalBoardLocation.transformerFactory(createdByMe);
    const createTachieLocationsTransformer = (createdByMe) => new global_1.DualKeyMapTransformer(createTachieLocationTransformer(createdByMe));
    GlobalCharacter.transformerFactory = (operatedBy) => ({
        composeLoose: ({ key, first, second }) => {
            var _a, _b, _c, _d, _e, _f;
            const boolParamsTransformer = createBoolParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const boolParams = boolParamsTransformer.compose({
                first: first.boolParams,
                second: second.boolParams,
            });
            if (boolParams.isError) {
                return boolParams;
            }
            const numParamsTransformer = createNumParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
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
            const strParamsTransformer = createStrParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const strParams = strParamsTransformer.compose({
                first: first.strParams,
                second: second.strParams,
            });
            if (strParams.isError) {
                return strParams;
            }
            const piecesTransformer = createPiecesTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const pieces = piecesTransformer.composeLoose({
                first: first.pieces,
                second: second.pieces,
            });
            if (pieces.isError) {
                return pieces;
            }
            const tachieLocationsTransformer = createTachieLocationsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const tachieLocations = tachieLocationsTransformer.composeLoose({
                first: first.tachieLocations,
                second: second.tachieLocations,
            });
            if (tachieLocations.isError) {
                return tachieLocations;
            }
            const valueProps = {
                isPrivate: Operations_1.ReplaceBooleanDownOperationModule.compose(first.isPrivate, second.isPrivate),
                name: Operations_1.ReplaceStringDownOperationModule.compose(first.name, second.name),
                image: Operations_1.ReplaceNullableFilePathDownOperationModule.compose(first.image, second.image),
                tachieImage: Operations_1.ReplaceNullableFilePathDownOperationModule.compose(first.tachieImage, second.tachieImage),
                boolParams: (_a = boolParams.value) !== null && _a !== void 0 ? _a : new Map(),
                numParams: (_b = numParams.value) !== null && _b !== void 0 ? _b : new Map(),
                numMaxParams: (_c = numMaxParams.value) !== null && _c !== void 0 ? _c : new Map(),
                strParams: (_d = strParams.value) !== null && _d !== void 0 ? _d : new Map(),
                pieces: (_e = pieces.value) !== null && _e !== void 0 ? _e : new DualKeyMap_1.DualKeyMap(),
                tachieLocations: (_f = tachieLocations.value) !== null && _f !== void 0 ? _f : new DualKeyMap_1.DualKeyMap(),
            };
            return Result_1.ResultModule.ok(valueProps);
        },
        restore: ({ key, nextState, downOperation }) => {
            var _a, _b, _c, _d;
            if (downOperation === undefined) {
                return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }
            const boolParamsTransformer = createBoolParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const boolParams = boolParamsTransformer.restore({
                nextState: nextState.boolParams,
                downOperation: downOperation.boolParams,
            });
            if (boolParams.isError) {
                return boolParams;
            }
            const numParamsTransformer = createNumParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
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
            const strParamsTransformer = createStrParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const strParams = strParamsTransformer.restore({
                nextState: nextState.strParams,
                downOperation: downOperation.strParams,
            });
            if (strParams.isError) {
                return strParams;
            }
            const piecesTransformer = createPiecesTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const pieces = piecesTransformer.restore({
                nextState: nextState.pieces,
                downOperation: downOperation.pieces,
            });
            if (pieces.isError) {
                return pieces;
            }
            const tachieLocationsTransformer = createTachieLocationsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const tachieLocations = tachieLocationsTransformer.restore({
                nextState: nextState.tachieLocations,
                downOperation: downOperation.tachieLocations,
            });
            if (tachieLocations.isError) {
                return tachieLocations;
            }
            const prevState = Object.assign(Object.assign({}, nextState), { boolParams: boolParams.value.prevState, numParams: numParams.value.prevState, numMaxParams: numMaxParams.value.prevState, strParams: strParams.value.prevState, pieces: pieces.value.prevState, tachieLocations: tachieLocations.value.prevState });
            const twoWayOperation = {
                boolParams: boolParams.value.twoWayOperation,
                numParams: numParams.value.twoWayOperation,
                numMaxParams: numMaxParams.value.twoWayOperation,
                strParams: strParams.value.twoWayOperation,
                pieces: pieces.value.twoWayOperation,
                tachieLocations: tachieLocations.value.twoWayOperation,
            };
            if (downOperation.image !== undefined) {
                prevState.image = (_a = downOperation.image.oldValue) !== null && _a !== void 0 ? _a : undefined;
                twoWayOperation.image = { oldValue: (_b = downOperation.image.oldValue) !== null && _b !== void 0 ? _b : undefined, newValue: nextState.image };
            }
            if (downOperation.tachieImage !== undefined) {
                prevState.tachieImage = (_c = downOperation.tachieImage.oldValue) !== null && _c !== void 0 ? _c : undefined;
                twoWayOperation.tachieImage = { oldValue: (_d = downOperation.tachieImage.oldValue) !== null && _d !== void 0 ? _d : undefined, newValue: nextState.tachieImage };
            }
            if (downOperation.isPrivate !== undefined) {
                prevState.isPrivate = downOperation.isPrivate.oldValue;
                twoWayOperation.isPrivate = Object.assign(Object.assign({}, downOperation.isPrivate), { newValue: nextState.isPrivate });
            }
            if (downOperation.name !== undefined) {
                prevState.name = downOperation.name.oldValue;
                twoWayOperation.name = Object.assign(Object.assign({}, downOperation.name), { newValue: nextState.name });
            }
            return Result_1.ResultModule.ok({ prevState, twoWayOperation });
        },
        transform: ({ key, prevState, currentState, clientOperation, serverOperation }) => {
            var _a, _b, _c, _d, _e, _f;
            if (!Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }) && currentState.isPrivate) {
                return Result_1.ResultModule.ok(undefined);
            }
            const boolParamsTransformer = createBoolParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const boolParams = boolParamsTransformer.transform({
                prevState: prevState.boolParams,
                currentState: currentState.boolParams,
                clientOperation: clientOperation.boolParams,
                serverOperation: (_a = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.boolParams) !== null && _a !== void 0 ? _a : new Map(),
            });
            if (boolParams.isError) {
                return boolParams;
            }
            const numParamsTransformer = createNumParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const numParams = numParamsTransformer.transform({
                prevState: prevState.numParams,
                currentState: currentState.numParams,
                clientOperation: clientOperation.numParams,
                serverOperation: (_b = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.numParams) !== null && _b !== void 0 ? _b : new Map(),
            });
            if (numParams.isError) {
                return numParams;
            }
            const numMaxParams = numParamsTransformer.transform({
                prevState: prevState.numMaxParams,
                currentState: currentState.numMaxParams,
                clientOperation: clientOperation.numMaxParams,
                serverOperation: (_c = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.numMaxParams) !== null && _c !== void 0 ? _c : new Map(),
            });
            if (numMaxParams.isError) {
                return numMaxParams;
            }
            const strParamsTransformer = createStrParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const strParams = strParamsTransformer.transform({
                prevState: prevState.strParams,
                currentState: currentState.strParams,
                clientOperation: clientOperation.strParams,
                serverOperation: (_d = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.strParams) !== null && _d !== void 0 ? _d : new Map(),
            });
            if (strParams.isError) {
                return strParams;
            }
            const piecesTransformer = createPiecesTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const pieces = piecesTransformer.transform({
                prevState: prevState.pieces,
                currentState: currentState.pieces,
                clientOperation: clientOperation.pieces,
                serverOperation: (_e = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.pieces) !== null && _e !== void 0 ? _e : new DualKeyMap_1.DualKeyMap(),
            });
            if (pieces.isError) {
                return pieces;
            }
            const tachieLocationsTransformer = createTachieLocationsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const tachieLocations = tachieLocationsTransformer.transform({
                prevState: prevState.tachieLocations,
                currentState: currentState.tachieLocations,
                clientOperation: clientOperation.tachieLocations,
                serverOperation: (_f = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.tachieLocations) !== null && _f !== void 0 ? _f : new DualKeyMap_1.DualKeyMap(),
            });
            if (tachieLocations.isError) {
                return tachieLocations;
            }
            const twoWayOperation = {};
            twoWayOperation.image = Operations_1.ReplaceNullableFilePathTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.image,
                second: clientOperation.image,
                prevState: prevState.image,
            });
            twoWayOperation.tachieImage = Operations_1.ReplaceNullableFilePathTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.tachieImage,
                second: clientOperation.tachieImage,
                prevState: prevState.tachieImage,
            });
            twoWayOperation.isPrivate = Operations_1.ReplaceBooleanTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isPrivate,
                second: clientOperation.isPrivate,
                prevState: prevState.isPrivate,
            });
            twoWayOperation.name = Operations_1.ReplaceStringTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.name,
                second: clientOperation.name,
                prevState: prevState.name,
            });
            if (helpers_1.undefinedForAll(twoWayOperation) && boolParams.value.size === 0 && numParams.value.size === 0 && numMaxParams.value.size === 0 && strParams.value.size === 0 && pieces.value.isEmpty && tachieLocations.value.isEmpty) {
                return Result_1.ResultModule.ok(undefined);
            }
            return Result_1.ResultModule.ok(Object.assign(Object.assign({}, twoWayOperation), { boolParams: boolParams.value, numParams: numParams.value, numMaxParams: numMaxParams.value, strParams: strParams.value, pieces: pieces.value, tachieLocations: tachieLocations.value }));
        },
        diff: ({ key, prevState, nextState }) => {
            const boolParamsTransformer = createBoolParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const boolParams = boolParamsTransformer.diff({
                prevState: prevState.boolParams,
                nextState: nextState.boolParams,
            });
            const numParamsTransformer = createNumParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const numParams = numParamsTransformer.diff({
                prevState: prevState.numParams,
                nextState: nextState.numParams,
            });
            const numMaxParams = numParamsTransformer.diff({
                prevState: prevState.numMaxParams,
                nextState: nextState.numMaxParams,
            });
            const strParamsTransformer = createStrParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const strParams = strParamsTransformer.diff({
                prevState: prevState.strParams,
                nextState: nextState.strParams,
            });
            const piecesTransformer = createPiecesTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const pieces = piecesTransformer.diff({
                prevState: prevState.pieces,
                nextState: nextState.pieces,
            });
            const tachieLocationsTransformer = createTachieLocationsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const tachieLocations = tachieLocationsTransformer.diff({
                prevState: prevState.tachieLocations,
                nextState: nextState.tachieLocations,
            });
            const resultType = {};
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
            if (helpers_1.undefinedForAll(resultType) && boolParams.size === 0 && numParams.size === 0 && numMaxParams.size === 0 && strParams.size === 0 && pieces.isEmpty && tachieLocations.isEmpty) {
                return undefined;
            }
            return Object.assign(Object.assign({}, resultType), { boolParams, numParams, numMaxParams, strParams, pieces, tachieLocations });
        },
        applyBack: ({ key, downOperation, nextState }) => {
            var _a, _b;
            const boolParamsTransformer = createBoolParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const boolParams = boolParamsTransformer.applyBack({
                downOperation: downOperation.boolParams,
                nextState: nextState.boolParams,
            });
            if (boolParams.isError) {
                return boolParams;
            }
            const numParamsTransformer = createNumParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
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
            const strParamsTransformer = createStrParamsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const strParams = strParamsTransformer.applyBack({
                downOperation: downOperation.strParams,
                nextState: nextState.strParams,
            });
            if (strParams.isError) {
                return strParams;
            }
            const piecesTransformer = createPiecesTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const pieces = piecesTransformer.applyBack({
                downOperation: downOperation.pieces,
                nextState: nextState.pieces,
            });
            if (pieces.isError) {
                return pieces;
            }
            const tachieLocationsTransformer = createTachieLocationsTransformer(Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }));
            const tachieLocations = tachieLocationsTransformer.applyBack({
                downOperation: downOperation.tachieLocations,
                nextState: nextState.tachieLocations,
            });
            if (tachieLocations.isError) {
                return tachieLocations;
            }
            const result = Object.assign(Object.assign({}, nextState), { boolParams: boolParams.value, numParams: numParams.value, numMaxParams: numMaxParams.value, strParams: strParams.value, pieces: pieces.value, tachieLocations: tachieLocations.value });
            if (downOperation.image !== undefined) {
                result.image = (_a = downOperation.image.oldValue) !== null && _a !== void 0 ? _a : undefined;
            }
            if (downOperation.tachieImage !== undefined) {
                result.tachieImage = (_b = downOperation.tachieImage.oldValue) !== null && _b !== void 0 ? _b : undefined;
            }
            if (downOperation.isPrivate !== undefined) {
                result.isPrivate = downOperation.isPrivate.oldValue;
            }
            if (downOperation.name !== undefined) {
                result.name = downOperation.name.oldValue;
            }
            return Result_1.ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {
            cancelRemove: ({ key, nextState }) => !Types_1.RequestedBy.createdByMe({ requestedBy: operatedBy, userUid: key.first }) && nextState.isPrivate,
        }
    });
})(GlobalCharacter = exports.GlobalCharacter || (exports.GlobalCharacter = {}));
