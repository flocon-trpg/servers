"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalParamName = void 0;
const DualKeyMap_1 = require("../../../../@shared/DualKeyMap");
const indexes_1 = require("../../../../@shared/indexes");
const Result_1 = require("../../../../@shared/Result");
const helpers_1 = require("../../../../utils/helpers");
const dualKeyMapOperations_1 = require("../../../dualKeyMapOperations");
const Operations_1 = require("../../../Operations");
const mikro_orm_1 = require("./mikro-orm");
var GlobalParamName;
(function (GlobalParamName) {
    let MikroORM;
    (function (MikroORM) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = (entity) => (Object.assign({}, entity));
            ToGlobal.stateMany = (entity) => {
                const result = new DualKeyMap_1.DualKeyMap();
                for (const elem of entity) {
                    if (!indexes_1.isStrIndex100(elem.key)) {
                        continue;
                    }
                    result.set({ first: elem.type, second: elem.key }, ToGlobal.state(elem));
                }
                return result;
            };
            ToGlobal.downOperationMany = async ({ add, update, remove, }) => {
                return await dualKeyMapOperations_1.createDownOperationFromMikroORM({
                    add,
                    update,
                    remove,
                    toDualKey: x => {
                        if (!indexes_1.isStrIndex100(x.key)) {
                            throw 'key must be "1", or "2", or ..., or "100"';
                        }
                        return Result_1.ResultModule.ok({ first: x.type, second: x.key });
                    },
                    getState: async (x) => Result_1.ResultModule.ok(ToGlobal.state(x)),
                    getOperation: async (entity) => Result_1.ResultModule.ok({
                        name: entity.name == null ? undefined : { oldValue: entity.name },
                    })
                });
            };
        })(ToGlobal = MikroORM.ToGlobal || (MikroORM.ToGlobal = {}));
    })(MikroORM = GlobalParamName.MikroORM || (GlobalParamName.MikroORM = {}));
    let Global;
    (function (Global) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = ({ source }) => source;
            ToGraphQL.stateMany = ({ source }) => {
                const result = [];
                source.forEach((value, key) => {
                    result.push({
                        type: key.first,
                        key: key.second,
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
                        case dualKeyMapOperations_1.update: {
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
        })(ToGraphQL = Global.ToGraphQL || (Global.ToGraphQL = {}));
        Global.applyToEntity = async ({ em, parent, parentOp, operation, }) => {
            for (const [key, value] of operation) {
                switch (value.type) {
                    case dualKeyMapOperations_1.replace: {
                        if (value.operation.newValue === undefined) {
                            if (value.operation.oldValue === undefined) {
                                console.warn('Replace: oldValue === newValue === undefined. This should be id.');
                                continue;
                            }
                            const toRemove = await em.findOneOrFail(mikro_orm_1.ParamName, { room: { id: parent.id }, type: key.first, key: key.second });
                            em.remove(toRemove);
                            const op = new mikro_orm_1.RemoveParamNameOp({
                                type: key.first,
                                key: key.second,
                                name: value.operation.oldValue.name,
                                roomOp: parentOp,
                            });
                            em.persist(op);
                            continue;
                        }
                        const toAdd = new mikro_orm_1.ParamName({
                            type: key.first,
                            key: key.second,
                            name: value.operation.newValue.name,
                            room: parent,
                        });
                        em.persist(toAdd);
                        const op = new mikro_orm_1.AddParamNameOp({ type: key.first, key: key.second, roomOp: parentOp });
                        em.persist(op);
                        continue;
                    }
                    case dualKeyMapOperations_1.update: {
                        const target = await em.findOneOrFail(mikro_orm_1.ParamName, { room: { id: parent.id }, type: key.first, key: key.second });
                        const op = new mikro_orm_1.UpdateParamNameOp({ type: key.first, key: key.second, roomOp: parentOp });
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
    })(Global = GlobalParamName.Global || (GlobalParamName.Global = {}));
    let GraphQL;
    (function (GraphQL) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = (entity) => (Object.assign({}, entity));
            ToGlobal.upOperationMany = (source) => {
                return dualKeyMapOperations_1.createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createDualKey: x => {
                        if (!indexes_1.isStrIndex100(x.key)) {
                            return Result_1.ResultModule.error('key must be "1", or "2", or ..., or "100"');
                        }
                        return Result_1.ResultModule.ok({ first: x.type, second: x.key });
                    },
                    getState: x => x.newValue == null ? undefined : ToGlobal.state(x.newValue),
                    getOperation: x => Result_1.ResultModule.ok({
                        name: x.operation.name,
                    }),
                });
            };
        })(ToGlobal = GraphQL.ToGlobal || (GraphQL.ToGlobal = {}));
    })(GraphQL = GlobalParamName.GraphQL || (GlobalParamName.GraphQL = {}));
    GlobalParamName.transformerFactory = ({
        composeLoose: ({ first, second }) => {
            const valueProps = {
                name: Operations_1.ReplaceStringDownOperationModule.compose(first.name, second.name),
            };
            return Result_1.ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            if (downOperation === undefined) {
                return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }
            const prevState = Object.assign({}, nextState);
            const twoWayOperation = {};
            if (downOperation.name !== undefined) {
                prevState.name = downOperation.name.oldValue;
                twoWayOperation.name = Object.assign(Object.assign({}, downOperation.name), { newValue: nextState.name });
            }
            return Result_1.ResultModule.ok({ prevState, twoWayOperation });
        },
        transform: ({ prevState, clientOperation, serverOperation }) => {
            const twoWayOperation = {};
            twoWayOperation.name = Operations_1.ReplaceStringTwoWayOperationModule.transform({
                first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.name,
                second: clientOperation.name,
                prevState: prevState.name,
            });
            if (helpers_1.undefinedForAll(twoWayOperation)) {
                return Result_1.ResultModule.ok(undefined);
            }
            return Result_1.ResultModule.ok(Object.assign({}, twoWayOperation));
        },
        diff: ({ prevState, nextState }) => {
            const resultType = {};
            if (prevState.name !== nextState.name) {
                resultType.name = { oldValue: prevState.name, newValue: nextState.name };
            }
            if (helpers_1.undefinedForAll(resultType)) {
                return undefined;
            }
            return Object.assign({}, resultType);
        },
        applyBack: ({ downOperation, nextState }) => {
            const result = Object.assign({}, nextState);
            if (downOperation.name !== undefined) {
                result.name = downOperation.name.oldValue;
            }
            return Result_1.ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {}
    });
})(GlobalParamName = exports.GlobalParamName || (exports.GlobalParamName = {}));
