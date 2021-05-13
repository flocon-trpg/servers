"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalBgm = void 0;
const indexes_1 = require("../../../../@shared/indexes");
const Result_1 = require("../../../../@shared/Result");
const utils_1 = require("../../../../@shared/utils");
const mapOperations_1 = require("../../../mapOperations");
const Operations_1 = require("../../../Operations");
const mikro_orm_1 = require("./mikro-orm");
var GlobalBgm;
(function (GlobalBgm) {
    let MikroORM;
    (function (MikroORM) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = (entity) => (Object.assign({}, entity));
            ToGlobal.stateMany = (entity) => {
                const result = new Map();
                for (const elem of entity) {
                    if (!indexes_1.isStrIndex5(elem.channelKey)) {
                        continue;
                    }
                    result.set(elem.channelKey, ToGlobal.state(elem));
                }
                return result;
            };
            ToGlobal.downOperationMany = async ({ add, update, remove, }) => {
                return await mapOperations_1.createDownOperationFromMikroORM({
                    add,
                    update,
                    remove,
                    toKey: x => {
                        if (!indexes_1.isStrIndex5(x.channelKey)) {
                            throw 'channelKey must be "1", or "2", or ..., or "5"';
                        }
                        return Result_1.ResultModule.ok(x.channelKey);
                    },
                    getState: async (x) => Result_1.ResultModule.ok(ToGlobal.state(x)),
                    getOperation: async (entity) => Result_1.ResultModule.ok({
                        files: entity.files == null ? undefined : { oldValue: entity.files },
                        volume: entity.volume == null ? undefined : { oldValue: entity.volume },
                    })
                });
            };
        })(ToGlobal = MikroORM.ToGlobal || (MikroORM.ToGlobal = {}));
    })(MikroORM = GlobalBgm.MikroORM || (GlobalBgm.MikroORM = {}));
    let Global;
    (function (Global) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = ({ source }) => source;
            ToGraphQL.stateMany = ({ source }) => {
                const result = [];
                source.forEach((value, key) => {
                    result.push({
                        channelKey: key,
                        value: ToGraphQL.state({ source: value }),
                    });
                });
                return result;
            };
            ToGraphQL.operation = ({ operation }) => {
                const result = { replace: [], update: [] };
                for (const [key, value] of operation) {
                    switch (value.type) {
                        case mapOperations_1.replace: {
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
                        case mapOperations_1.update: {
                            result.update.push({
                                channelKey: key,
                                operation: value.operation,
                            });
                        }
                    }
                }
                return result;
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
                            const toRemove = await em.findOneOrFail(mikro_orm_1.RoomBgm, { room: { id: parent.id }, channelKey: key });
                            em.remove(toRemove);
                            const op = new mikro_orm_1.RemoveRoomBgmOp({ channelKey: key, files: value.operation.oldValue.files, volume: value.operation.oldValue.volume, roomOp: parentOp });
                            em.persist(op);
                            continue;
                        }
                        const toAdd = new mikro_orm_1.RoomBgm({
                            channelKey: key,
                            files: value.operation.newValue.files,
                            volume: value.operation.newValue.volume,
                            room: parent,
                        });
                        em.persist(toAdd);
                        const op = new mikro_orm_1.AddRoomBgmOp({ channelKey: key, roomOp: parentOp });
                        em.persist(op);
                        continue;
                    }
                    case mapOperations_1.update: {
                        const target = await em.findOneOrFail(mikro_orm_1.RoomBgm, { room: { id: parent.id }, channelKey: key });
                        const op = new mikro_orm_1.UpdateRoomBgmOp({ channelKey: key, roomOp: parentOp });
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
    })(Global = GlobalBgm.Global || (GlobalBgm.Global = {}));
    let GraphQL;
    (function (GraphQL) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = (entity) => (Object.assign({}, entity));
            ToGlobal.upOperationMany = (source) => {
                return mapOperations_1.createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createKey: x => {
                        if (!indexes_1.isStrIndex5(x.channelKey)) {
                            return Result_1.ResultModule.error('channelKey must be "1", or "2", or ..., or "5"');
                        }
                        return Result_1.ResultModule.ok(x.channelKey);
                    },
                    getState: x => x.newValue == null ? undefined : ToGlobal.state(x.newValue),
                    getOperation: x => Result_1.ResultModule.ok({
                        files: x.operation.files,
                        volume: x.operation.volume,
                    }),
                });
            };
        })(ToGlobal = GraphQL.ToGlobal || (GraphQL.ToGlobal = {}));
    })(GraphQL = GlobalBgm.GraphQL || (GlobalBgm.GraphQL = {}));
    GlobalBgm.transformerFactory = ({
        composeLoose: ({ first, second }) => {
            const valueProps = {
                files: Operations_1.ReplaceFilePathArrayDownOperationModule.compose(first.files, second.files),
                volume: Operations_1.ReplaceNumberDownOperationModule.compose(first.volume, second.volume),
            };
            return Result_1.ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            if (downOperation === undefined) {
                return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }
            const prevState = Object.assign({}, nextState);
            const twoWayOperation = {};
            if (downOperation.files !== undefined) {
                prevState.files = downOperation.files.oldValue;
                twoWayOperation.files = Object.assign(Object.assign({}, downOperation.files), { newValue: nextState.files });
            }
            if (downOperation.volume !== undefined) {
                prevState.volume = downOperation.volume.oldValue;
                twoWayOperation.volume = Object.assign(Object.assign({}, downOperation.volume), { newValue: nextState.volume });
            }
            return Result_1.ResultModule.ok({ prevState, twoWayOperation });
        },
        transform: ({ prevState, clientOperation, serverOperation }) => {
            const twoWayOperation = {};
            twoWayOperation.files = Operations_1.ReplaceFilePathArrayTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.files,
                second: clientOperation.files,
                prevState: prevState.files,
            });
            twoWayOperation.volume = Operations_1.ReplaceNumberTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.volume,
                second: clientOperation.volume,
                prevState: prevState.volume,
            });
            if (utils_1.undefinedForAll(twoWayOperation)) {
                return Result_1.ResultModule.ok(undefined);
            }
            return Result_1.ResultModule.ok(Object.assign({}, twoWayOperation));
        },
        diff: ({ prevState, nextState }) => {
            const resultType = {};
            if (prevState.files !== nextState.files) {
                resultType.files = { oldValue: prevState.files, newValue: nextState.files };
            }
            if (prevState.volume !== nextState.volume) {
                resultType.volume = { oldValue: prevState.volume, newValue: nextState.volume };
            }
            if (utils_1.undefinedForAll(resultType)) {
                return undefined;
            }
            return Object.assign({}, resultType);
        },
        applyBack: ({ downOperation, nextState }) => {
            const result = Object.assign({}, nextState);
            if (downOperation.files !== undefined) {
                result.files = downOperation.files.oldValue;
            }
            if (downOperation.volume !== undefined) {
                result.volume = downOperation.volume.oldValue;
            }
            return Result_1.ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {}
    });
})(GlobalBgm = exports.GlobalBgm || (exports.GlobalBgm = {}));
