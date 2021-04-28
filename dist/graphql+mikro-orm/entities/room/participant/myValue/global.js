"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalMyValue = void 0;
const collection_1 = require("../../../../../@shared/collection");
const DualKeyMap_1 = require("../../../../../@shared/DualKeyMap");
const Result_1 = require("../../../../../@shared/Result");
const MyValueLogType_1 = require("../../../../../enums/MyValueLogType");
const helpers_1 = require("../../../../../utils/helpers");
const mapOperations_1 = require("../../../../mapOperations");
const Operations_1 = require("../../../../Operations");
const global_1 = require("../../../global");
const global_2 = require("../../../piece/global");
const mikro_orm_1 = require("../../../roomMessage/mikro-orm");
const mikro_orm_piece_1 = require("./mikro-orm_piece");
const mikro_orm_value_1 = require("./mikro-orm_value");
const jsonType_1 = require("./number/jsonType");
var GlobalMyValue;
(function (GlobalMyValue) {
    let MikroORM;
    (function (MikroORM) {
        let ToGlobal;
        (function (ToGlobal) {
            const stateCore = (entity) => {
                var _a, _b;
                return {
                    isValuePrivate: entity.value.isValuePrivate,
                    valueRangeMin: (_a = entity.value.valueRangeMin) !== null && _a !== void 0 ? _a : undefined,
                    valueRangeMax: (_b = entity.value.valueRangeMax) !== null && _b !== void 0 ? _b : undefined,
                    value: entity.value.value,
                };
            };
            ToGlobal.state = async (entity) => {
                const pieces = global_2.GlobalPiece.MikroORM.ToGlobal.stateMany(await entity.myValuePieces.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));
                return Object.assign(Object.assign({}, stateCore(entity)), { pieces });
            };
            ToGlobal.stateMany = async (entity) => {
                const result = new Map();
                for (const elem of entity) {
                    const value = await ToGlobal.state(elem);
                    result.set(elem.stateId, value);
                }
                return result;
            };
            ToGlobal.stateFromRemoveMyValueOp = async (entity) => {
                const pieces = global_2.GlobalPiece.MikroORM.ToGlobal.stateMany(await entity.removedMyValuePieces.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));
                return Object.assign(Object.assign({}, stateCore(entity)), { pieces });
            };
            ToGlobal.stateManyFromRemoveMyValueOp = async (entity) => {
                const result = new Map();
                for (const elem of entity) {
                    const value = await ToGlobal.stateFromRemoveMyValueOp(elem);
                    result.set(elem.stateId, value);
                }
                return result;
            };
            ToGlobal.stateFromRemovedMyValueOp = async (entity) => {
                const pieces = global_2.GlobalPiece.MikroORM.ToGlobal.stateMany(await entity.removedMyValuePieces.loadItems(), x => ({ first: x.boardCreatedBy, second: x.boardId }));
                return Object.assign(Object.assign({}, stateCore(entity)), { pieces });
            };
            ToGlobal.stateManyFromRemovedMyValueOp = async (entity) => {
                const result = new Map();
                for (const elem of entity) {
                    const value = await ToGlobal.stateFromRemovedMyValueOp(elem);
                    result.set(elem.stateId, value);
                }
                return result;
            };
            ToGlobal.downOperationMany = async ({ add, update, remove, }) => {
                return await mapOperations_1.createDownOperationFromMikroORM({
                    add,
                    update,
                    remove,
                    toKey: x => {
                        return Result_1.ResultModule.ok(x.stateId);
                    },
                    getState: async (x) => Result_1.ResultModule.ok(await ToGlobal.stateFromRemoveMyValueOp(x)),
                    getOperation: async (entity) => {
                        var _a, _b, _c, _d;
                        const pieces = await global_2.GlobalPiece.MikroORM.ToGlobal.downOperationMany({
                            add: entity.addPieceOps,
                            remove: entity.removePieceOps,
                            update: entity.updatePieceOps,
                            toDualKey: x => ({ first: x.boardCreatedBy, second: x.boardId }),
                        });
                        if (pieces.isError) {
                            return pieces;
                        }
                        return Result_1.ResultModule.ok({
                            pieces: pieces.value,
                            isValuePrivate: (_a = entity.value.isValuePrivate) !== null && _a !== void 0 ? _a : undefined,
                            value: (_b = entity.value.value) !== null && _b !== void 0 ? _b : undefined,
                            valueRangeMax: (_c = entity.value.valueRangeMax) !== null && _c !== void 0 ? _c : undefined,
                            valueRangeMin: (_d = entity.value.valueRangeMin) !== null && _d !== void 0 ? _d : undefined,
                        });
                    },
                });
            };
        })(ToGlobal = MikroORM.ToGlobal || (MikroORM.ToGlobal = {}));
    })(MikroORM = GlobalMyValue.MikroORM || (GlobalMyValue.MikroORM = {}));
    let Global;
    (function (Global) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = ({ source, createdByMe }) => {
                var _a, _b;
                return Object.assign(Object.assign({}, source), { value: createdByMe || !source.isValuePrivate ? source.value : 0, valueRangeMax: (_a = source.valueRangeMax) !== null && _a !== void 0 ? _a : undefined, valueRangeMin: (_b = source.valueRangeMin) !== null && _b !== void 0 ? _b : undefined, pieces: global_2.GlobalPiece.Global.ToGraphQL.stateMany({ source: source.pieces, createdByMe }) });
            };
            ToGraphQL.stateMany = ({ source, createdByMe }) => {
                const result = [];
                source.forEach((value, key) => {
                    result.push({
                        stateId: key,
                        value: ToGraphQL.state({ source: value, createdByMe }),
                    });
                });
                return result;
            };
            ToGraphQL.operation = ({ operation, prevState, nextState, createdByMe, }) => {
                return mapOperations_1.toGraphQLWithState({
                    source: operation,
                    prevState,
                    nextState,
                    isPrivate: () => false,
                    toReplaceOperation: ({ nextState, key }) => ({
                        stateId: key,
                        newValue: nextState === undefined ? undefined : ToGraphQL.state({
                            source: nextState,
                            createdByMe,
                        })
                    }),
                    toUpdateOperation: ({ operation, prevState, nextState, key }) => {
                        var _a;
                        const pieces = global_2.GlobalPiece.Global.ToGraphQL.operation({
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
                                isValuePrivate: (_a = operation.isValuePrivate) !== null && _a !== void 0 ? _a : undefined,
                                value: (() => {
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
        })(ToGraphQL = Global.ToGraphQL || (Global.ToGraphQL = {}));
        Global.applyToEntity = async ({ em, parent, parentOp, operation, }) => {
            for (const [key, value] of operation) {
                switch (value.type) {
                    case mapOperations_1.replace: {
                        if (value.operation.newValue === undefined) {
                            if (value.operation.oldValue === undefined) {
                                console.warn('Replace: oldValue === newValue === undefined. This should be id.');
                                continue;
                            }
                            const toRemove = await em.findOneOrFail(mikro_orm_value_1.MyValue, { partici: { id: parent.id }, stateId: key });
                            em.remove(toRemove);
                            const op = new mikro_orm_value_1.RemoveMyValueOp({
                                stateId: key,
                                value: {
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
                                op.removedMyValuePieces.add(new mikro_orm_piece_1.RemovedMyValuePieceByMyValue(Object.assign(Object.assign({}, piece), { boardCreatedBy: key.first, boardId: key.second, removeMyValueOp: op })));
                            });
                            em.persist(op);
                            continue;
                        }
                        const toAdd = new mikro_orm_value_1.MyValue({
                            stateId: key,
                            value: {
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
                            const newPiece = new mikro_orm_piece_1.MyValuePiece(Object.assign(Object.assign({}, piece), { boardCreatedBy: key.first, boardId: key.second, myValue: toAdd }));
                            em.persist(newPiece);
                        });
                        const op = new mikro_orm_value_1.AddMyValueOp({ stateId: key, updateParticiOp: parentOp });
                        em.persist(op);
                        continue;
                    }
                    case mapOperations_1.update: {
                        const target = await em.findOneOrFail(mikro_orm_value_1.MyValue, { partici: { id: parent.id }, stateId: key });
                        const opJson = {
                            version: 1,
                            type: jsonType_1.numberOperation,
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
                        const op = new mikro_orm_value_1.UpdateMyValueOp({ stateId: key, value: opJson, updateParticiOp: parentOp });
                        await global_2.GlobalPiece.Global.applyToMyValuePiecesEntity({ em, parent: target, parentOp: op, operation: value.operation.pieces });
                        em.persist(op);
                        continue;
                    }
                }
            }
        };
        Global.toLogs = ({ operation, createdBy, }) => {
            const result = [];
            operation.forEach((value, key) => {
                switch (value.type) {
                    case mapOperations_1.update:
                        result.push(new mikro_orm_1.MyValueLog({
                            stateId: key,
                            createdBy,
                            myValueType: MyValueLogType_1.MyValueLogType.Num,
                            valueChanged: value.operation.value != null,
                            isValuePrivateChanged: value.operation.isValuePrivate != null,
                            movedPieces: collection_1.__(value.operation.pieces).compact(([key, value]) => {
                                if (value.type !== mapOperations_1.update) {
                                    return null;
                                }
                                if (value.operation.cellX == null && value.operation.cellY == null && value.operation.x == null && value.operation.y == null) {
                                    return null;
                                }
                                return { createdBy: key.first, stateId: key.second };
                            }).toArray(),
                            resizedPieces: collection_1.__(value.operation.pieces).compact(([key, value]) => {
                                if (value.type !== mapOperations_1.update) {
                                    return null;
                                }
                                if (value.operation.cellH == null && value.operation.cellW == null && value.operation.h == null && value.operation.w == null) {
                                    return null;
                                }
                                return { createdBy: key.first, stateId: key.second };
                            }).toArray(),
                            createdPieces: collection_1.__(value.operation.pieces).compact(([key, value]) => {
                                if (value.type !== mapOperations_1.replace) {
                                    return null;
                                }
                                if (value.operation.newValue == null) {
                                    return null;
                                }
                                return { createdBy: key.first, stateId: key.second };
                            }).toArray(),
                            deletedPieces: collection_1.__(value.operation.pieces).compact(([key, value]) => {
                                if (value.type !== mapOperations_1.replace) {
                                    return null;
                                }
                                if (value.operation.oldValue == null) {
                                    return null;
                                }
                                return { createdBy: key.first, stateId: key.second };
                            }).toArray(),
                        }));
                        break;
                    case mapOperations_1.replace:
                        result.push(new mikro_orm_1.MyValueLog({
                            stateId: key,
                            createdBy,
                            myValueType: MyValueLogType_1.MyValueLogType.Num,
                            valueChanged: false,
                            isValuePrivateChanged: false,
                            replaceType: (() => {
                                if (value.operation.oldValue == null) {
                                    return true;
                                }
                                if (value.operation.newValue == null) {
                                    return false;
                                }
                                return undefined;
                            })(),
                            movedPieces: [],
                            resizedPieces: [],
                            createdPieces: [],
                            deletedPieces: [],
                        }));
                        break;
                }
            });
            return result;
        };
    })(Global = GlobalMyValue.Global || (GlobalMyValue.Global = {}));
    let GraphQL;
    (function (GraphQL) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = (object) => {
                var _a;
                const pieces = global_2.GlobalPiece.GraphQL.ToGlobal.stateMany(object.pieces);
                return Object.assign(Object.assign({}, object), { value: (_a = object.value) !== null && _a !== void 0 ? _a : 0, pieces });
            };
            ToGlobal.stateMany = (objects) => {
                const result = new Map();
                objects.forEach(x => {
                    result.set(x.stateId, ToGlobal.state(x.value));
                });
                return result;
            };
            ToGlobal.upOperationMany = (source) => {
                return mapOperations_1.createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createKey: x => {
                        return Result_1.ResultModule.ok(x.stateId);
                    },
                    getState: x => x.newValue == null ? undefined : ToGlobal.state(x.newValue),
                    getOperation: x => {
                        const pieces = global_2.GlobalPiece.GraphQL.ToGlobal.upOperationMany(x.operation.pieces);
                        if (pieces.isError) {
                            return pieces;
                        }
                        return Result_1.ResultModule.ok(Object.assign(Object.assign({}, x.operation), { pieces: pieces.value }));
                    },
                });
            };
        })(ToGlobal = GraphQL.ToGlobal || (GraphQL.ToGlobal = {}));
    })(GraphQL = GlobalMyValue.GraphQL || (GlobalMyValue.GraphQL = {}));
    const createPieceTransformer = (createdByMe) => global_2.GlobalPiece.transformerFactory(createdByMe);
    const createPiecesTransformer = (createdByMe) => new global_1.DualKeyMapTransformer(createPieceTransformer(createdByMe));
    GlobalMyValue.transformerFactory = (createdByMe) => ({
        composeLoose: ({ first, second }) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const piecesTransformer = createPiecesTransformer(createdByMe);
            const pieces = piecesTransformer.composeLoose({
                first: first.pieces,
                second: second.pieces,
            });
            if (pieces.isError) {
                return pieces;
            }
            const valueProps = {
                isValuePrivate: Operations_1.ReplaceBooleanDownOperationModule.compose((_a = first.isValuePrivate) !== null && _a !== void 0 ? _a : undefined, (_b = second.isValuePrivate) !== null && _b !== void 0 ? _b : undefined),
                value: Operations_1.ReplaceNumberDownOperationModule.compose((_c = first.value) !== null && _c !== void 0 ? _c : undefined, (_d = second.value) !== null && _d !== void 0 ? _d : undefined),
                valueRangeMax: Operations_1.ReplaceNullableNumberDownOperationModule.compose((_e = first.valueRangeMax) !== null && _e !== void 0 ? _e : undefined, (_f = second.valueRangeMax) !== null && _f !== void 0 ? _f : undefined),
                valueRangeMin: Operations_1.ReplaceNullableNumberDownOperationModule.compose((_g = first.valueRangeMin) !== null && _g !== void 0 ? _g : undefined, (_h = second.valueRangeMin) !== null && _h !== void 0 ? _h : undefined),
                pieces: (_j = pieces.value) !== null && _j !== void 0 ? _j : new DualKeyMap_1.DualKeyMap(),
            };
            return Result_1.ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            var _a, _b, _c, _d, _e, _f;
            if (downOperation === undefined) {
                return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }
            const piecesTransformer = createPiecesTransformer(createdByMe);
            const pieces = piecesTransformer.restore({
                nextState: nextState.pieces,
                downOperation: downOperation.pieces,
            });
            if (pieces.isError) {
                return pieces;
            }
            const prevState = Object.assign(Object.assign({}, nextState), { pieces: pieces.value.prevState });
            const twoWayOperation = { pieces: pieces.value.twoWayOperation };
            if (downOperation.isValuePrivate != null) {
                prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
                twoWayOperation.isValuePrivate = Object.assign(Object.assign({}, downOperation.isValuePrivate), { newValue: nextState.isValuePrivate });
            }
            if (downOperation.value != null) {
                prevState.value = downOperation.value.oldValue;
                twoWayOperation.value = Object.assign(Object.assign({}, downOperation.value), { newValue: nextState.value });
            }
            if (downOperation.valueRangeMax != null) {
                prevState.valueRangeMax = (_a = downOperation.valueRangeMax.oldValue) !== null && _a !== void 0 ? _a : undefined;
                twoWayOperation.valueRangeMax = { oldValue: (_b = downOperation.valueRangeMax.oldValue) !== null && _b !== void 0 ? _b : undefined, newValue: (_c = nextState.valueRangeMax) !== null && _c !== void 0 ? _c : undefined };
            }
            if (downOperation.valueRangeMin != null) {
                prevState.valueRangeMin = (_d = downOperation.valueRangeMin.oldValue) !== null && _d !== void 0 ? _d : undefined;
                twoWayOperation.valueRangeMin = { oldValue: (_e = downOperation.valueRangeMin.oldValue) !== null && _e !== void 0 ? _e : undefined, newValue: (_f = nextState.valueRangeMin) !== null && _f !== void 0 ? _f : undefined };
            }
            return Result_1.ResultModule.ok({ prevState, nextState, twoWayOperation });
        },
        transform: ({ prevState, clientOperation, serverOperation, currentState }) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            if (!createdByMe) {
                return Result_1.ResultModule.ok(undefined);
            }
            const piecesTransformer = createPiecesTransformer(createdByMe);
            const pieces = piecesTransformer.transform({
                prevState: prevState.pieces,
                currentState: currentState.pieces,
                clientOperation: clientOperation.pieces,
                serverOperation: (_a = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.pieces) !== null && _a !== void 0 ? _a : new DualKeyMap_1.DualKeyMap(),
            });
            if (pieces.isError) {
                return pieces;
            }
            const twoWayOperation = { pieces: pieces.value };
            twoWayOperation.isValuePrivate = Operations_1.ReplaceBooleanTwoWayOperationModule.transform({
                first: (_b = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isValuePrivate) !== null && _b !== void 0 ? _b : undefined,
                second: (_c = clientOperation.isValuePrivate) !== null && _c !== void 0 ? _c : undefined,
                prevState: prevState.isValuePrivate,
            });
            twoWayOperation.value = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: (_d = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.value) !== null && _d !== void 0 ? _d : undefined,
                second: (_e = clientOperation.value) !== null && _e !== void 0 ? _e : undefined,
                prevState: prevState.value,
            });
            twoWayOperation.valueRangeMax = Operations_1.ReplaceNullableNumberTwoWayOperationModule.transform({
                first: (_f = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.valueRangeMax) !== null && _f !== void 0 ? _f : undefined,
                second: (_g = clientOperation.valueRangeMax) !== null && _g !== void 0 ? _g : undefined,
                prevState: (_h = prevState.valueRangeMax) !== null && _h !== void 0 ? _h : undefined,
            });
            twoWayOperation.valueRangeMin = Operations_1.ReplaceNullableNumberTwoWayOperationModule.transform({
                first: (_j = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.valueRangeMin) !== null && _j !== void 0 ? _j : undefined,
                second: (_k = clientOperation.valueRangeMin) !== null && _k !== void 0 ? _k : undefined,
                prevState: (_l = prevState.valueRangeMin) !== null && _l !== void 0 ? _l : undefined,
            });
            if (helpers_1.undefinedForAll(twoWayOperation)) {
                return Result_1.ResultModule.ok(undefined);
            }
            return Result_1.ResultModule.ok(Object.assign({}, twoWayOperation));
        },
        diff: ({ prevState, nextState }) => {
            const piecesTransformer = createPiecesTransformer(createdByMe);
            const pieces = piecesTransformer.diff({
                prevState: prevState.pieces,
                nextState: nextState.pieces,
            });
            const resultType = {
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
            if (helpers_1.undefinedForAll(resultType)) {
                return undefined;
            }
            return Object.assign({}, resultType);
        },
        applyBack: ({ downOperation, nextState }) => {
            var _a, _b;
            const piecesTransformer = createPiecesTransformer(createdByMe);
            const pieces = piecesTransformer.applyBack({
                downOperation: downOperation.pieces,
                nextState: nextState.pieces,
            });
            if (pieces.isError) {
                return pieces;
            }
            const result = Object.assign(Object.assign({}, nextState), { pieces: pieces.value });
            if (downOperation.isValuePrivate != null) {
                result.isValuePrivate = downOperation.isValuePrivate.oldValue;
            }
            if (downOperation.value != null) {
                result.value = downOperation.value.oldValue;
            }
            if (downOperation.valueRangeMin != null) {
                result.valueRangeMin = (_a = downOperation.valueRangeMin.oldValue) !== null && _a !== void 0 ? _a : undefined;
            }
            if (downOperation.valueRangeMax != null) {
                result.valueRangeMax = (_b = downOperation.valueRangeMax.oldValue) !== null && _b !== void 0 ? _b : undefined;
            }
            return Result_1.ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {
            cancelRemove: () => !createdByMe,
            cancelCreate: () => !createdByMe,
        },
    });
})(GlobalMyValue = exports.GlobalMyValue || (exports.GlobalMyValue = {}));
