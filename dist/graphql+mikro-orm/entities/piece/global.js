"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalPiece = void 0;
const DualKeyMap_1 = require("../../../@shared/DualKeyMap");
const Result_1 = require("../../../@shared/Result");
const dualKeyMapOperations_1 = require("../../dualKeyMapOperations");
const Operations_1 = require("../../Operations");
const mikro_orm_1 = require("../room/character/piece/mikro-orm");
const mikro_orm_piece_1 = require("../room/participant/myValue/mikro-orm_piece");
const utils_1 = require("../../../@shared/utils");
var GlobalPiece;
(function (GlobalPiece) {
    let MikroORM;
    (function (MikroORM) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = (entity) => (Object.assign({}, entity));
            ToGlobal.stateMany = (entity, toDualKey) => {
                const result = new DualKeyMap_1.DualKeyMap();
                for (const elem of entity) {
                    result.set(toDualKey(elem), ToGlobal.state(elem));
                }
                return result;
            };
            ToGlobal.downOperationMany = async ({ add, update, remove, toDualKey, }) => {
                return await dualKeyMapOperations_1.createDownOperationFromMikroORM({
                    add,
                    update,
                    remove,
                    toDualKey: x => {
                        return Result_1.ResultModule.ok(toDualKey(x));
                    },
                    getState: async (x) => Result_1.ResultModule.ok(ToGlobal.state(x)),
                    getOperation: async (entity) => Result_1.ResultModule.ok({
                        cellH: entity.cellH == null ? undefined : { oldValue: entity.cellH },
                        cellW: entity.cellW == null ? undefined : { oldValue: entity.cellW },
                        cellX: entity.cellX == null ? undefined : { oldValue: entity.cellX },
                        cellY: entity.cellY == null ? undefined : { oldValue: entity.cellY },
                        h: entity.h == null ? undefined : { oldValue: entity.h },
                        isCellMode: entity.isCellMode == null ? undefined : { oldValue: entity.isCellMode },
                        isPrivate: entity.isPrivate == null ? undefined : { oldValue: entity.isPrivate },
                        w: entity.w == null ? undefined : { oldValue: entity.w },
                        x: entity.x == null ? undefined : { oldValue: entity.x },
                        y: entity.y == null ? undefined : { oldValue: entity.y },
                    })
                });
            };
        })(ToGlobal = MikroORM.ToGlobal || (MikroORM.ToGlobal = {}));
    })(MikroORM = GlobalPiece.MikroORM || (GlobalPiece.MikroORM = {}));
    let Global;
    (function (Global) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = ({ source, createdByMe }) => {
                if (!createdByMe && source.isPrivate) {
                    return undefined;
                }
                return source;
            };
            ToGraphQL.stateMany = ({ source, createdByMe }) => {
                const result = [];
                source.forEach((value, key) => {
                    const newState = ToGraphQL.state({ source: value, createdByMe });
                    if (newState != null) {
                        result.push({
                            boardCreatedBy: key.first,
                            boardId: key.second,
                            value: newState,
                        });
                    }
                });
                return result;
            };
            ToGraphQL.operation = ({ operation, prevState, nextState, createdByMe }) => {
                return dualKeyMapOperations_1.toGraphQLWithState({
                    source: operation,
                    prevState,
                    nextState,
                    isPrivate: state => !createdByMe && state.isPrivate,
                    toReplaceOperation: ({ nextState, key }) => ({
                        boardCreatedBy: key.first,
                        boardId: key.second,
                        newValue: nextState === undefined ? undefined : ToGraphQL.state({
                            source: nextState,
                            createdByMe,
                        })
                    }),
                    toUpdateOperation: ({ operation, key }) => ({
                        boardCreatedBy: key.first,
                        boardId: key.second,
                        operation: operation
                    }),
                });
            };
        })(ToGraphQL = Global.ToGraphQL || (Global.ToGraphQL = {}));
        const applyToCharaPieceEntity = ({ globalOperation, stateEntity, opEntity }) => {
            if (globalOperation.cellH != null) {
                stateEntity.cellH = globalOperation.cellH.newValue;
                opEntity.cellH = globalOperation.cellH.oldValue;
            }
            if (globalOperation.cellW != null) {
                stateEntity.cellW = globalOperation.cellW.newValue;
                opEntity.cellW = globalOperation.cellW.oldValue;
            }
            if (globalOperation.cellX != null) {
                stateEntity.cellX = globalOperation.cellX.newValue;
                opEntity.cellX = globalOperation.cellX.oldValue;
            }
            if (globalOperation.cellY != null) {
                stateEntity.cellY = globalOperation.cellY.newValue;
                opEntity.cellY = globalOperation.cellY.oldValue;
            }
            if (globalOperation.h != null) {
                stateEntity.h = globalOperation.h.newValue;
                opEntity.h = globalOperation.h.oldValue;
            }
            if (globalOperation.isCellMode != null) {
                stateEntity.isCellMode = globalOperation.isCellMode.newValue;
                opEntity.isCellMode = globalOperation.isCellMode.oldValue;
            }
            if (globalOperation.isPrivate != null) {
                stateEntity.isPrivate = globalOperation.isPrivate.newValue;
                opEntity.isPrivate = globalOperation.isPrivate.oldValue;
            }
            if (globalOperation.w != null) {
                stateEntity.w = globalOperation.w.newValue;
                opEntity.w = globalOperation.w.oldValue;
            }
            if (globalOperation.x != null) {
                stateEntity.x = globalOperation.x.newValue;
                opEntity.x = globalOperation.x.oldValue;
            }
            if (globalOperation.y != null) {
                stateEntity.y = globalOperation.y.newValue;
                opEntity.y = globalOperation.y.oldValue;
            }
        };
        Global.applyToCharaPiecesEntity = async ({ em, parent, parentOp, operation, }) => {
            for (const [key, value] of operation) {
                switch (value.type) {
                    case dualKeyMapOperations_1.replace: {
                        if (value.operation.newValue === undefined) {
                            if (value.operation.oldValue === undefined) {
                                console.warn('Replace: oldValue === newValue === undefined. This should be id.');
                                continue;
                            }
                            const toRemove = await em.findOneOrFail(mikro_orm_1.CharaPiece, { chara: { id: parent.id }, boardCreatedBy: key.first, boardId: key.second });
                            em.remove(toRemove);
                            const op = new mikro_orm_1.RemoveCharaPieceOp(Object.assign(Object.assign({}, value.operation.oldValue), { boardCreatedBy: key.first, boardId: key.second, updateCharaOp: parentOp }));
                            em.persist(op);
                            continue;
                        }
                        const toAdd = new mikro_orm_1.CharaPiece(Object.assign(Object.assign({}, value.operation.newValue), { boardCreatedBy: key.first, boardId: key.second, chara: parent }));
                        em.persist(toAdd);
                        const op = new mikro_orm_1.AddCharaPieceOp({ boardCreatedBy: key.first, boardId: key.second, updateCharaOp: parentOp });
                        em.persist(op);
                        continue;
                    }
                    case dualKeyMapOperations_1.update: {
                        const target = await em.findOneOrFail(mikro_orm_1.CharaPiece, { chara: { id: parent.id }, boardCreatedBy: key.first, boardId: key.second });
                        const op = new mikro_orm_1.UpdateCharaPieceOp({ boardCreatedBy: key.first, boardId: key.second, updateCharaOp: parentOp });
                        applyToCharaPieceEntity({ opEntity: op, stateEntity: target, globalOperation: value.operation });
                        em.persist(op);
                        continue;
                    }
                }
            }
        };
        Global.applyToMyValuePiecesEntity = async ({ em, parent, parentOp, operation, }) => {
            for (const [key, value] of operation) {
                switch (value.type) {
                    case dualKeyMapOperations_1.replace: {
                        if (value.operation.newValue === undefined) {
                            if (value.operation.oldValue === undefined) {
                                console.warn('Replace: oldValue === newValue === undefined. This should be id.');
                                continue;
                            }
                            const toRemove = await em.findOneOrFail(mikro_orm_piece_1.MyValuePiece, { myValue: { id: parent.id }, boardCreatedBy: key.first, boardId: key.second });
                            em.remove(toRemove);
                            const op = new mikro_orm_piece_1.RemoveMyValuePieceOp(Object.assign(Object.assign({}, value.operation.oldValue), { boardCreatedBy: key.first, boardId: key.second, updateMyValueOp: parentOp }));
                            em.persist(op);
                            continue;
                        }
                        const toAdd = new mikro_orm_piece_1.MyValuePiece(Object.assign(Object.assign({}, value.operation.newValue), { boardCreatedBy: key.first, boardId: key.second, myValue: parent }));
                        em.persist(toAdd);
                        const op = new mikro_orm_piece_1.AddMyValuePieceOp({ boardCreatedBy: key.first, boardId: key.second, updateMyValueOp: parentOp });
                        em.persist(op);
                        continue;
                    }
                    case dualKeyMapOperations_1.update: {
                        const target = await em.findOneOrFail(mikro_orm_piece_1.MyValuePiece, { myValue: { id: parent.id }, boardCreatedBy: key.first, boardId: key.second });
                        const op = new mikro_orm_piece_1.UpdateMyValuePieceOp({ boardCreatedBy: key.first, boardId: key.second, updateMyValueOp: parentOp });
                        applyToCharaPieceEntity({ opEntity: op, stateEntity: target, globalOperation: value.operation });
                        em.persist(op);
                        continue;
                    }
                }
            }
        };
    })(Global = GlobalPiece.Global || (GlobalPiece.Global = {}));
    let GraphQL;
    (function (GraphQL) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = (object) => object;
            ToGlobal.stateMany = (objects) => {
                const result = new DualKeyMap_1.DualKeyMap();
                objects.forEach(x => {
                    result.set({ first: x.boardCreatedBy, second: x.boardId }, ToGlobal.state(x.value));
                });
                return result;
            };
            ToGlobal.upOperationMany = (source) => {
                return dualKeyMapOperations_1.createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createDualKey: x => {
                        return Result_1.ResultModule.ok({ first: x.boardCreatedBy, second: x.boardId });
                    },
                    getState: x => x.newValue == null ? undefined : ToGlobal.state(x.newValue),
                    getOperation: x => Result_1.ResultModule.ok({
                        cellH: x.operation.cellH,
                        cellW: x.operation.cellW,
                        cellX: x.operation.cellX,
                        cellY: x.operation.cellY,
                        h: x.operation.h,
                        isCellMode: x.operation.isCellMode,
                        isPrivate: x.operation.isPrivate,
                        w: x.operation.w,
                        x: x.operation.x,
                        y: x.operation.y,
                    }),
                });
            };
        })(ToGlobal = GraphQL.ToGlobal || (GraphQL.ToGlobal = {}));
    })(GraphQL = GlobalPiece.GraphQL || (GlobalPiece.GraphQL = {}));
    GlobalPiece.transformerFactory = (createdByMe) => ({
        composeLoose: ({ first, second }) => {
            const valueProps = {
                cellH: Operations_1.ReplaceNumberDownOperationModule.compose(first.cellH, second.cellH),
                cellW: Operations_1.ReplaceNumberDownOperationModule.compose(first.cellW, second.cellW),
                cellX: Operations_1.ReplaceNumberDownOperationModule.compose(first.cellX, second.cellX),
                cellY: Operations_1.ReplaceNumberDownOperationModule.compose(first.cellY, second.cellY),
                h: Operations_1.ReplaceNumberDownOperationModule.compose(first.h, second.h),
                isCellMode: Operations_1.ReplaceBooleanDownOperationModule.compose(first.isCellMode, second.isCellMode),
                isPrivate: Operations_1.ReplaceBooleanDownOperationModule.compose(first.isPrivate, second.isPrivate),
                w: Operations_1.ReplaceNumberDownOperationModule.compose(first.w, second.w),
                x: Operations_1.ReplaceNumberDownOperationModule.compose(first.x, second.x),
                y: Operations_1.ReplaceNumberDownOperationModule.compose(first.y, second.y),
            };
            return Result_1.ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            if (downOperation === undefined) {
                return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }
            const prevState = Object.assign({}, nextState);
            const twoWayOperation = {};
            if (downOperation.cellH !== undefined) {
                prevState.cellH = downOperation.cellH.oldValue;
                twoWayOperation.cellH = Object.assign(Object.assign({}, downOperation.cellH), { newValue: nextState.cellH });
            }
            if (downOperation.cellW !== undefined) {
                prevState.cellW = downOperation.cellW.oldValue;
                twoWayOperation.cellW = Object.assign(Object.assign({}, downOperation.cellW), { newValue: nextState.cellW });
            }
            if (downOperation.cellX !== undefined) {
                prevState.cellX = downOperation.cellX.oldValue;
                twoWayOperation.cellX = Object.assign(Object.assign({}, downOperation.cellX), { newValue: nextState.cellX });
            }
            if (downOperation.cellY !== undefined) {
                prevState.cellY = downOperation.cellY.oldValue;
                twoWayOperation.cellY = Object.assign(Object.assign({}, downOperation.cellY), { newValue: nextState.cellY });
            }
            if (downOperation.h !== undefined) {
                prevState.h = downOperation.h.oldValue;
                twoWayOperation.h = Object.assign(Object.assign({}, downOperation.h), { newValue: nextState.h });
            }
            if (downOperation.isCellMode !== undefined) {
                prevState.isCellMode = downOperation.isCellMode.oldValue;
                twoWayOperation.isCellMode = Object.assign(Object.assign({}, downOperation.isCellMode), { newValue: nextState.isCellMode });
            }
            if (downOperation.isPrivate !== undefined) {
                prevState.isPrivate = downOperation.isPrivate.oldValue;
                twoWayOperation.isPrivate = Object.assign(Object.assign({}, downOperation.isPrivate), { newValue: nextState.isPrivate });
            }
            if (downOperation.w !== undefined) {
                prevState.w = downOperation.w.oldValue;
                twoWayOperation.w = Object.assign(Object.assign({}, downOperation.w), { newValue: nextState.w });
            }
            if (downOperation.x !== undefined) {
                prevState.x = downOperation.x.oldValue;
                twoWayOperation.x = Object.assign(Object.assign({}, downOperation.x), { newValue: nextState.x });
            }
            if (downOperation.y !== undefined) {
                prevState.y = downOperation.y.oldValue;
                twoWayOperation.y = Object.assign(Object.assign({}, downOperation.y), { newValue: nextState.y });
            }
            return Result_1.ResultModule.ok({ prevState, twoWayOperation });
        },
        transform: ({ prevState, clientOperation, serverOperation, currentState }) => {
            if (!createdByMe && currentState.isPrivate) {
                return Result_1.ResultModule.ok(undefined);
            }
            const twoWayOperation = {};
            twoWayOperation.cellH = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellH,
                second: clientOperation.cellH,
                prevState: prevState.cellH,
            });
            twoWayOperation.cellW = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellW,
                second: clientOperation.cellW,
                prevState: prevState.cellW,
            });
            twoWayOperation.cellX = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellX,
                second: clientOperation.cellX,
                prevState: prevState.cellX,
            });
            twoWayOperation.cellY = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellY,
                second: clientOperation.cellY,
                prevState: prevState.cellY,
            });
            twoWayOperation.h = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.h,
                second: clientOperation.h,
                prevState: prevState.h,
            });
            twoWayOperation.isCellMode = Operations_1.ReplaceBooleanTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isCellMode,
                second: clientOperation.isCellMode,
                prevState: prevState.isCellMode,
            });
            twoWayOperation.isPrivate = Operations_1.ReplaceBooleanTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isPrivate,
                second: clientOperation.isPrivate,
                prevState: prevState.isPrivate,
            });
            twoWayOperation.w = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.w,
                second: clientOperation.w,
                prevState: prevState.w,
            });
            twoWayOperation.x = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.x,
                second: clientOperation.x,
                prevState: prevState.x,
            });
            twoWayOperation.y = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.y,
                second: clientOperation.y,
                prevState: prevState.y,
            });
            if (utils_1.undefinedForAll(twoWayOperation)) {
                return Result_1.ResultModule.ok(undefined);
            }
            return Result_1.ResultModule.ok(twoWayOperation);
        },
        diff: ({ prevState, nextState }) => {
            const resultType = {};
            if (prevState.cellH !== nextState.cellH) {
                resultType.cellH = { oldValue: prevState.cellH, newValue: nextState.cellH };
            }
            if (prevState.cellW !== nextState.cellW) {
                resultType.cellW = { oldValue: prevState.cellW, newValue: nextState.cellW };
            }
            if (prevState.cellX !== nextState.cellX) {
                resultType.cellX = { oldValue: prevState.cellX, newValue: nextState.cellX };
            }
            if (prevState.cellY !== nextState.cellY) {
                resultType.cellY = { oldValue: prevState.cellY, newValue: nextState.cellY };
            }
            if (prevState.h !== nextState.h) {
                resultType.h = { oldValue: prevState.h, newValue: nextState.h };
            }
            if (prevState.isCellMode !== nextState.isCellMode) {
                resultType.isCellMode = { oldValue: prevState.isCellMode, newValue: nextState.isCellMode };
            }
            if (prevState.isPrivate !== nextState.isPrivate) {
                resultType.isPrivate = { oldValue: prevState.isPrivate, newValue: nextState.isPrivate };
            }
            if (prevState.w !== nextState.w) {
                resultType.w = { oldValue: prevState.w, newValue: nextState.w };
            }
            if (prevState.x !== nextState.x) {
                resultType.x = { oldValue: prevState.x, newValue: nextState.x };
            }
            if (prevState.y !== nextState.y) {
                resultType.y = { oldValue: prevState.y, newValue: nextState.y };
            }
            if (utils_1.undefinedForAll(resultType)) {
                return undefined;
            }
            return resultType;
        },
        applyBack: ({ downOperation, nextState }) => {
            const result = Object.assign({}, nextState);
            if (downOperation.cellH !== undefined) {
                result.cellH = downOperation.cellH.oldValue;
            }
            if (downOperation.cellW !== undefined) {
                result.cellW = downOperation.cellW.oldValue;
            }
            if (downOperation.cellX !== undefined) {
                result.cellX = downOperation.cellX.oldValue;
            }
            if (downOperation.cellY !== undefined) {
                result.cellY = downOperation.cellY.oldValue;
            }
            if (downOperation.h !== undefined) {
                result.h = downOperation.h.oldValue;
            }
            if (downOperation.isCellMode !== undefined) {
                result.isCellMode = downOperation.isCellMode.oldValue;
            }
            if (downOperation.isPrivate !== undefined) {
                result.isPrivate = downOperation.isPrivate.oldValue;
            }
            if (downOperation.w !== undefined) {
                result.w = downOperation.w.oldValue;
            }
            if (downOperation.x !== undefined) {
                result.x = downOperation.x.oldValue;
            }
            if (downOperation.y !== undefined) {
                result.y = downOperation.y.oldValue;
            }
            return Result_1.ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {
            cancelRemove: ({ nextState }) => !createdByMe && nextState.isPrivate,
        }
    });
})(GlobalPiece = exports.GlobalPiece || (exports.GlobalPiece = {}));
