"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalBoard = void 0;
const DualKeyMap_1 = require("../../../../@shared/DualKeyMap");
const Result_1 = require("../../../../@shared/Result");
const helpers_1 = require("../../../../utils/helpers");
const dualKeyMapOperations_1 = require("../../../dualKeyMapOperations");
const Operations_1 = require("../../../Operations");
const mikro_orm_1 = require("./mikro-orm");
var GlobalBoard;
(function (GlobalBoard) {
    let MikroORM;
    (function (MikroORM) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = (entity) => {
                return Object.assign(Object.assign({}, entity), { backgroundImage: entity.backgroundImagePath != null && entity.backgroundImageSourceType != null ? {
                        path: entity.backgroundImagePath,
                        sourceType: entity.backgroundImageSourceType,
                    } : undefined });
            };
            ToGlobal.stateMany = (entity) => {
                const result = new DualKeyMap_1.DualKeyMap();
                for (const elem of entity) {
                    result.set({ first: elem.createdBy, second: elem.stateId }, ToGlobal.state(elem));
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
                    getState: async (x) => Result_1.ResultModule.ok(ToGlobal.state(x)),
                    getOperation: async (entity) => Result_1.ResultModule.ok({
                        backgroundImage: entity.backgroundImage == null ? undefined : entity.backgroundImage,
                        backgroundImageZoom: entity.backgroundImageZoom == null ? undefined : { oldValue: entity.backgroundImageZoom },
                        cellColumnCount: entity.cellColumnCount == null ? undefined : { oldValue: entity.cellColumnCount },
                        cellHeight: entity.cellHeight == null ? undefined : { oldValue: entity.cellHeight },
                        cellOffsetX: entity.cellOffsetX == null ? undefined : { oldValue: entity.cellOffsetX },
                        cellOffsetY: entity.cellOffsetY == null ? undefined : { oldValue: entity.cellOffsetY },
                        cellRowCount: entity.cellRowCount == null ? undefined : { oldValue: entity.cellRowCount },
                        cellWidth: entity.cellWidth == null ? undefined : { oldValue: entity.cellWidth },
                        name: entity.name == null ? undefined : { oldValue: entity.name },
                    })
                });
            };
        })(ToGlobal = MikroORM.ToGlobal || (MikroORM.ToGlobal = {}));
    })(MikroORM = GlobalBoard.MikroORM || (GlobalBoard.MikroORM = {}));
    let Global;
    (function (Global) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = ({ source }) => source;
            ToGraphQL.stateMany = ({ source }) => {
                const result = [];
                source.forEach((value, key) => {
                    result.push({
                        createdBy: key.first,
                        id: key.second,
                        value: ToGraphQL.state({ source: value }),
                    });
                });
                return result;
            };
            ToGraphQL.operation = ({ operation }) => {
                const result = { replace: [], update: [] };
                for (const [key, value] of operation) {
                    switch (value.type) {
                        case dualKeyMapOperations_1.replace: {
                            if (value.operation.newValue === undefined) {
                                result.replace.push({
                                    createdBy: key.first,
                                    id: key.second,
                                    newValue: undefined,
                                });
                                continue;
                            }
                            result.replace.push({
                                createdBy: key.first,
                                id: key.second,
                                newValue: value.operation.newValue,
                            });
                            continue;
                        }
                        case dualKeyMapOperations_1.update: {
                            result.update.push({
                                createdBy: key.first,
                                id: key.second,
                                operation: value.operation,
                            });
                        }
                    }
                }
                return result;
            };
        })(ToGraphQL = Global.ToGraphQL || (Global.ToGraphQL = {}));
        Global.applyToEntity = async ({ em, parent, parentOp, operation, }) => {
            var _a, _b, _c, _d, _e, _f;
            for (const [key, value] of operation) {
                switch (value.type) {
                    case dualKeyMapOperations_1.replace: {
                        if (value.operation.newValue === undefined) {
                            if (value.operation.oldValue === undefined) {
                                console.warn('Replace: oldValue === newValue === undefined. This should be id.');
                                continue;
                            }
                            const toRemove = await em.findOneOrFail(mikro_orm_1.Board, { room: { id: parent.id }, createdBy: key.first, stateId: key.second });
                            em.remove(toRemove);
                            const op = new mikro_orm_1.RemoveBoardOp(Object.assign(Object.assign({}, value.operation.oldValue), { createdBy: key.first, stateId: key.second, roomOp: parentOp }));
                            op.backgroundImagePath = (_a = value.operation.oldValue.backgroundImage) === null || _a === void 0 ? void 0 : _a.path;
                            op.backgroundImageSourceType = (_b = value.operation.oldValue.backgroundImage) === null || _b === void 0 ? void 0 : _b.sourceType;
                            em.persist(op);
                            continue;
                        }
                        const toAdd = new mikro_orm_1.Board(Object.assign(Object.assign({}, value.operation.newValue), { createdBy: key.first, stateId: key.second, room: parent }));
                        toAdd.backgroundImagePath = (_c = value.operation.newValue.backgroundImage) === null || _c === void 0 ? void 0 : _c.path;
                        toAdd.backgroundImageSourceType = (_d = value.operation.newValue.backgroundImage) === null || _d === void 0 ? void 0 : _d.sourceType;
                        em.persist(toAdd);
                        const op = new mikro_orm_1.AddBoardOp({ createdBy: key.first, stateId: key.second, roomOp: parentOp });
                        em.persist(op);
                        continue;
                    }
                    case dualKeyMapOperations_1.update: {
                        const target = await em.findOneOrFail(mikro_orm_1.Board, { room: { id: parent.id }, createdBy: key.first, stateId: key.second });
                        const op = new mikro_orm_1.UpdateBoardOp({ createdBy: key.first, stateId: key.second, roomOp: parentOp });
                        if (value.operation.backgroundImage != null) {
                            target.backgroundImagePath = (_e = value.operation.backgroundImage.newValue) === null || _e === void 0 ? void 0 : _e.path;
                            target.backgroundImageSourceType = (_f = value.operation.backgroundImage.newValue) === null || _f === void 0 ? void 0 : _f.sourceType;
                            op.backgroundImage = value.operation.backgroundImage;
                        }
                        if (value.operation.backgroundImageZoom != null) {
                            target.backgroundImageZoom = value.operation.backgroundImageZoom.newValue;
                            op.backgroundImageZoom = value.operation.backgroundImageZoom.oldValue;
                        }
                        if (value.operation.cellColumnCount != null) {
                            target.cellColumnCount = value.operation.cellColumnCount.newValue;
                            op.cellColumnCount = value.operation.cellColumnCount.oldValue;
                        }
                        if (value.operation.cellHeight != null) {
                            target.cellHeight = value.operation.cellHeight.newValue;
                            op.cellHeight = value.operation.cellHeight.oldValue;
                        }
                        if (value.operation.cellOffsetX != null) {
                            target.cellOffsetX = value.operation.cellOffsetX.newValue;
                            op.cellOffsetX = value.operation.cellOffsetX.oldValue;
                        }
                        if (value.operation.cellOffsetY != null) {
                            target.cellOffsetY = value.operation.cellOffsetY.newValue;
                            op.cellOffsetY = value.operation.cellOffsetY.oldValue;
                        }
                        if (value.operation.cellRowCount != null) {
                            target.cellRowCount = value.operation.cellRowCount.newValue;
                            op.cellRowCount = value.operation.cellRowCount.oldValue;
                        }
                        if (value.operation.cellWidth != null) {
                            target.cellWidth = value.operation.cellWidth.newValue;
                            op.cellWidth = value.operation.cellWidth.oldValue;
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
    })(Global = GlobalBoard.Global || (GlobalBoard.Global = {}));
    let GraphQL;
    (function (GraphQL) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = (object) => object;
            ToGlobal.stateMany = (objects) => {
                const result = new DualKeyMap_1.DualKeyMap();
                objects.forEach(x => {
                    result.set({ first: x.createdBy, second: x.id }, ToGlobal.state(x.value));
                });
                return result;
            };
            const operation = (source) => {
                return {
                    backgroundImage: source.operation.backgroundImage,
                    backgroundImageZoom: source.operation.backgroundImageZoom,
                    cellColumnCount: source.operation.cellColumnCount,
                    cellHeight: source.operation.cellHeight,
                    cellOffsetX: source.operation.cellOffsetX,
                    cellOffsetY: source.operation.cellOffsetY,
                    cellRowCount: source.operation.cellRowCount,
                    cellWidth: source.operation.cellWidth,
                    name: source.operation.name,
                };
            };
            ToGlobal.upOperationMany = (source) => {
                return dualKeyMapOperations_1.createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createDualKey: x => {
                        return Result_1.ResultModule.ok({ first: x.createdBy, second: x.id });
                    },
                    getState: x => x.newValue == null ? undefined : ToGlobal.state(x.newValue),
                    getOperation: x => Result_1.ResultModule.ok(operation(x)),
                });
            };
        })(ToGlobal = GraphQL.ToGlobal || (GraphQL.ToGlobal = {}));
    })(GraphQL = GlobalBoard.GraphQL || (GlobalBoard.GraphQL = {}));
    GlobalBoard.transformerFactory = ({
        composeLoose: ({ first, second }) => {
            const valueProps = {
                backgroundImage: Operations_1.ReplaceNullableFilePathDownOperationModule.compose(first.backgroundImage, second.backgroundImage),
                backgroundImageZoom: Operations_1.ReplaceNumberDownOperationModule.compose(first.backgroundImageZoom, second.backgroundImageZoom),
                cellColumnCount: Operations_1.ReplaceNumberDownOperationModule.compose(first.cellColumnCount, second.cellColumnCount),
                cellHeight: Operations_1.ReplaceNumberDownOperationModule.compose(first.cellHeight, second.cellHeight),
                cellOffsetX: Operations_1.ReplaceNumberDownOperationModule.compose(first.cellOffsetX, second.cellOffsetX),
                cellOffsetY: Operations_1.ReplaceNumberDownOperationModule.compose(first.cellOffsetY, second.cellOffsetY),
                cellRowCount: Operations_1.ReplaceNumberDownOperationModule.compose(first.cellRowCount, second.cellRowCount),
                cellWidth: Operations_1.ReplaceNumberDownOperationModule.compose(first.cellWidth, second.cellWidth),
                name: Operations_1.ReplaceStringDownOperationModule.compose(first.name, second.name),
            };
            return Result_1.ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            var _a, _b;
            if (downOperation === undefined) {
                return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }
            const prevState = Object.assign({}, nextState);
            const twoWayOperation = {};
            if (downOperation.backgroundImage !== undefined) {
                prevState.backgroundImage = (_a = downOperation.backgroundImage.oldValue) !== null && _a !== void 0 ? _a : undefined;
                twoWayOperation.backgroundImage = { oldValue: (_b = downOperation.backgroundImage.oldValue) !== null && _b !== void 0 ? _b : undefined, newValue: nextState.backgroundImage };
            }
            if (downOperation.backgroundImageZoom !== undefined) {
                prevState.backgroundImageZoom = downOperation.backgroundImageZoom.oldValue;
                twoWayOperation.backgroundImageZoom = Object.assign(Object.assign({}, downOperation.backgroundImageZoom), { newValue: nextState.backgroundImageZoom });
            }
            if (downOperation.cellColumnCount !== undefined) {
                prevState.cellColumnCount = downOperation.cellColumnCount.oldValue;
                twoWayOperation.cellColumnCount = Object.assign(Object.assign({}, downOperation.cellColumnCount), { newValue: nextState.cellColumnCount });
            }
            if (downOperation.cellHeight !== undefined) {
                prevState.cellHeight = downOperation.cellHeight.oldValue;
                twoWayOperation.cellHeight = Object.assign(Object.assign({}, downOperation.cellHeight), { newValue: nextState.cellHeight });
            }
            if (downOperation.cellOffsetX !== undefined) {
                prevState.cellOffsetX = downOperation.cellOffsetX.oldValue;
                twoWayOperation.cellOffsetX = Object.assign(Object.assign({}, downOperation.cellOffsetX), { newValue: nextState.cellOffsetX });
            }
            if (downOperation.cellOffsetY !== undefined) {
                prevState.cellOffsetY = downOperation.cellOffsetY.oldValue;
                twoWayOperation.cellOffsetY = Object.assign(Object.assign({}, downOperation.cellOffsetY), { newValue: nextState.cellOffsetY });
            }
            if (downOperation.cellRowCount !== undefined) {
                prevState.cellRowCount = downOperation.cellRowCount.oldValue;
                twoWayOperation.cellRowCount = Object.assign(Object.assign({}, downOperation.cellRowCount), { newValue: nextState.cellRowCount });
            }
            if (downOperation.cellWidth !== undefined) {
                prevState.cellWidth = downOperation.cellWidth.oldValue;
                twoWayOperation.cellWidth = Object.assign(Object.assign({}, downOperation.cellWidth), { newValue: nextState.cellWidth });
            }
            if (downOperation.name !== undefined) {
                prevState.name = downOperation.name.oldValue;
                twoWayOperation.name = Object.assign(Object.assign({}, downOperation.name), { newValue: nextState.name });
            }
            return Result_1.ResultModule.ok({ prevState, twoWayOperation });
        },
        transform: ({ prevState, clientOperation, serverOperation }) => {
            const twoWayOperation = {};
            twoWayOperation.backgroundImage = Operations_1.ReplaceNullableFilePathTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.backgroundImage,
                second: clientOperation.backgroundImage,
                prevState: prevState.backgroundImage,
            });
            twoWayOperation.backgroundImageZoom = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.backgroundImageZoom,
                second: clientOperation.backgroundImageZoom,
                prevState: prevState.backgroundImageZoom,
            });
            twoWayOperation.cellColumnCount = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellColumnCount,
                second: clientOperation.cellColumnCount,
                prevState: prevState.cellColumnCount,
            });
            twoWayOperation.cellHeight = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellHeight,
                second: clientOperation.cellHeight,
                prevState: prevState.cellHeight,
            });
            twoWayOperation.cellOffsetX = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellOffsetX,
                second: clientOperation.cellOffsetX,
                prevState: prevState.cellOffsetX,
            });
            twoWayOperation.cellOffsetY = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellOffsetY,
                second: clientOperation.cellOffsetY,
                prevState: prevState.cellOffsetY,
            });
            twoWayOperation.cellRowCount = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellRowCount,
                second: clientOperation.cellRowCount,
                prevState: prevState.cellRowCount,
            });
            twoWayOperation.cellWidth = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellWidth,
                second: clientOperation.cellWidth,
                prevState: prevState.cellWidth,
            });
            twoWayOperation.name = Operations_1.ReplaceStringTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.name,
                second: clientOperation.name,
                prevState: prevState.name,
            });
            if (helpers_1.undefinedForAll(twoWayOperation)) {
                return Result_1.ResultModule.ok(undefined);
            }
            return Result_1.ResultModule.ok(twoWayOperation);
        },
        diff: ({ prevState, nextState }) => {
            const resultType = {};
            if (prevState.backgroundImage !== nextState.backgroundImage) {
                resultType.backgroundImage = { oldValue: prevState.backgroundImage, newValue: nextState.backgroundImage };
            }
            if (prevState.backgroundImageZoom !== nextState.backgroundImageZoom) {
                resultType.backgroundImageZoom = { oldValue: prevState.backgroundImageZoom, newValue: nextState.backgroundImageZoom };
            }
            if (prevState.cellColumnCount !== nextState.cellColumnCount) {
                resultType.cellColumnCount = { oldValue: prevState.cellColumnCount, newValue: nextState.cellColumnCount };
            }
            if (prevState.cellHeight !== nextState.cellHeight) {
                resultType.cellHeight = { oldValue: prevState.cellHeight, newValue: nextState.cellHeight };
            }
            if (prevState.cellOffsetX !== nextState.cellOffsetX) {
                resultType.cellOffsetX = { oldValue: prevState.cellOffsetX, newValue: nextState.cellOffsetX };
            }
            if (prevState.cellOffsetY !== nextState.cellOffsetY) {
                resultType.cellOffsetY = { oldValue: prevState.cellOffsetY, newValue: nextState.cellOffsetY };
            }
            if (prevState.cellRowCount !== nextState.cellRowCount) {
                resultType.cellRowCount = { oldValue: prevState.cellRowCount, newValue: nextState.cellRowCount };
            }
            if (prevState.cellWidth !== nextState.cellWidth) {
                resultType.cellWidth = { oldValue: prevState.cellWidth, newValue: nextState.cellWidth };
            }
            if (prevState.name !== nextState.name) {
                resultType.name = { oldValue: prevState.name, newValue: nextState.name };
            }
            if (helpers_1.undefinedForAll(resultType)) {
                return undefined;
            }
            return resultType;
        },
        applyBack: ({ downOperation, nextState }) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const result = Object.assign({}, nextState);
            if (downOperation.backgroundImage !== undefined) {
                result.backgroundImage = (_a = downOperation.backgroundImage.oldValue) !== null && _a !== void 0 ? _a : undefined;
            }
            if (downOperation.backgroundImageZoom !== undefined) {
                result.backgroundImageZoom = (_b = downOperation.backgroundImageZoom.oldValue) !== null && _b !== void 0 ? _b : undefined;
            }
            if (downOperation.cellColumnCount !== undefined) {
                result.cellColumnCount = (_c = downOperation.cellColumnCount.oldValue) !== null && _c !== void 0 ? _c : undefined;
            }
            if (downOperation.cellHeight !== undefined) {
                result.cellHeight = (_d = downOperation.cellHeight.oldValue) !== null && _d !== void 0 ? _d : undefined;
            }
            if (downOperation.cellOffsetX !== undefined) {
                result.cellOffsetX = (_e = downOperation.cellOffsetX.oldValue) !== null && _e !== void 0 ? _e : undefined;
            }
            if (downOperation.cellOffsetY !== undefined) {
                result.cellOffsetY = (_f = downOperation.cellOffsetY.oldValue) !== null && _f !== void 0 ? _f : undefined;
            }
            if (downOperation.cellRowCount !== undefined) {
                result.cellRowCount = (_g = downOperation.cellRowCount.oldValue) !== null && _g !== void 0 ? _g : undefined;
            }
            if (downOperation.cellWidth !== undefined) {
                result.cellWidth = (_h = downOperation.cellWidth.oldValue) !== null && _h !== void 0 ? _h : undefined;
            }
            if (downOperation.name !== undefined) {
                result.name = downOperation.name.oldValue;
            }
            return Result_1.ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {}
    });
})(GlobalBoard = exports.GlobalBoard || (exports.GlobalBoard = {}));
