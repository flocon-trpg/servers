"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalBoolParam = void 0;
const indexes_1 = require("../../../../../@shared/indexes");
const Result_1 = require("../../../../../@shared/Result");
const helpers_1 = require("../../../../../utils/helpers");
const Operations_1 = require("../../../../Operations");
const paramMapOperations_1 = require("../../../../paramMapOperations");
const mikro_orm_1 = require("./mikro-orm");
var GlobalBoolParam;
(function (GlobalBoolParam) {
    const createDefaultState = () => ({ isValuePrivate: false });
    let MikroORM;
    (function (MikroORM) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = (entity) => (Object.assign({}, entity));
            ToGlobal.stateMany = (entity) => {
                const result = new Map();
                for (const elem of entity) {
                    if (!indexes_1.isStrIndex100(elem.key)) {
                        continue;
                    }
                    result.set(elem.key, ToGlobal.state(elem));
                }
                return result;
            };
            ToGlobal.downOperationMany = async ({ update, }) => {
                return await paramMapOperations_1.createDownOperationFromMikroORM({
                    update,
                    toKey: x => {
                        if (!indexes_1.isStrIndex100(x.key)) {
                            throw 'key must be "1", or "2", or ..., or "100"';
                        }
                        return Result_1.ResultModule.ok(x.key);
                    },
                    getOperation: async (entity) => Result_1.ResultModule.ok({
                        isValuePrivate: entity.isValuePrivate == null ? undefined : { oldValue: entity.isValuePrivate },
                        value: entity.value,
                    })
                });
            };
        })(ToGlobal = MikroORM.ToGlobal || (MikroORM.ToGlobal = {}));
    })(MikroORM = GlobalBoolParam.MikroORM || (GlobalBoolParam.MikroORM = {}));
    let Global;
    (function (Global) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = ({ source, createdByMe }) => {
                if (source.isValuePrivate && !createdByMe) {
                    return Object.assign(Object.assign({}, source), { value: undefined });
                }
                return source;
            };
            ToGraphQL.stateMany = ({ source, createdByMe }) => {
                const result = [];
                source.forEach((value, key) => {
                    result.push({
                        key,
                        value: ToGraphQL.state({ source: value, createdByMe }),
                    });
                });
                return result;
            };
            ToGraphQL.operation = ({ operation, prevState, nextState, createdByMe }) => {
                var _a, _b, _c, _d;
                const result = { update: [] };
                for (const [key, value] of operation) {
                    const isPrevValuePrivate = !createdByMe && ((_b = (_a = prevState.get(key)) === null || _a === void 0 ? void 0 : _a.isValuePrivate) !== null && _b !== void 0 ? _b : createDefaultState().isValuePrivate);
                    const isNextValuePrivate = !createdByMe && ((_d = (_c = nextState.get(key)) === null || _c === void 0 ? void 0 : _c.isValuePrivate) !== null && _d !== void 0 ? _d : createDefaultState().isValuePrivate);
                    result.update.push({
                        key,
                        operation: {
                            isValuePrivate: value.isValuePrivate,
                            value: (() => {
                                var _a, _b, _c, _d;
                                if (isPrevValuePrivate) {
                                    if (isNextValuePrivate) {
                                        return undefined;
                                    }
                                    return { oldValue: undefined, newValue: (_b = (_a = nextState.get(key)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : createDefaultState().value };
                                }
                                if (isNextValuePrivate) {
                                    return { oldValue: (_d = (_c = prevState.get(key)) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : createDefaultState().value, newValue: undefined };
                                }
                                return value.value;
                            })(),
                        },
                    });
                }
                return result;
            };
        })(ToGraphQL = Global.ToGraphQL || (Global.ToGraphQL = {}));
        Global.applyToEntity = async ({ em, parent, parentOp, operation, }) => {
            for (const [key, value] of operation) {
                let target = await em.findOne(mikro_orm_1.BoolParam, { chara: { id: parent.id }, key });
                if (target == null) {
                    target = new mikro_orm_1.BoolParam({ key, isValuePrivate: false, chara: parent });
                }
                const op = new mikro_orm_1.UpdateBoolParamOp({ key, updateCharaOp: parentOp });
                if (value.isValuePrivate != null) {
                    target.isValuePrivate = value.isValuePrivate.newValue;
                    op.isValuePrivate = value.isValuePrivate.oldValue;
                }
                if (value.value != null) {
                    target.value = value.value.newValue;
                    op.value = value.value;
                }
                em.persist(op);
                continue;
            }
        };
    })(Global = GlobalBoolParam.Global || (GlobalBoolParam.Global = {}));
    let GraphQL;
    (function (GraphQL) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = (object) => object;
            ToGlobal.stateMany = (objects) => {
                const result = new Map();
                objects.forEach(x => {
                    if (!indexes_1.isStrIndex100(x.key)) {
                        return;
                    }
                    result.set(x.key, ToGlobal.state(x.value));
                });
                return result;
            };
            ToGlobal.upOperationMany = (source) => {
                return paramMapOperations_1.createUpOperationFromGraphQL({
                    update: source.update,
                    createKey: x => {
                        if (!indexes_1.isStrIndex100(x.key)) {
                            return Result_1.ResultModule.error('key must be "1", or "2", or ..., or "100"');
                        }
                        return Result_1.ResultModule.ok(x.key);
                    },
                    getOperation: x => ({
                        isValuePrivate: x.operation.isValuePrivate,
                        value: x.operation.value,
                    }),
                });
            };
        })(ToGlobal = GraphQL.ToGlobal || (GraphQL.ToGlobal = {}));
    })(GraphQL = GlobalBoolParam.GraphQL || (GlobalBoolParam.GraphQL = {}));
    GlobalBoolParam.transformerFactory = (createdByMe) => ({
        composeLoose: ({ first, second }) => {
            const valueProps = {
                isValuePrivate: Operations_1.ReplaceBooleanDownOperationModule.compose(first.isValuePrivate, second.isValuePrivate),
                value: Operations_1.ReplaceNullableBooleanDownOperationModule.compose(first.value, second.value),
            };
            return Result_1.ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            var _a, _b;
            if (downOperation === undefined) {
                return Result_1.ResultModule.ok({ prevState: nextState, nextState, twoWayOperation: undefined });
            }
            const prevState = Object.assign({}, nextState);
            const twoWayOperation = {};
            if (downOperation.isValuePrivate !== undefined) {
                prevState.isValuePrivate = downOperation.isValuePrivate.oldValue;
                twoWayOperation.isValuePrivate = Object.assign(Object.assign({}, downOperation.isValuePrivate), { newValue: nextState.isValuePrivate });
            }
            if (downOperation.value !== undefined) {
                prevState.value = (_a = downOperation.value.oldValue) !== null && _a !== void 0 ? _a : undefined;
                twoWayOperation.value = { oldValue: (_b = downOperation.value.oldValue) !== null && _b !== void 0 ? _b : undefined, newValue: nextState.value };
            }
            return Result_1.ResultModule.ok({ prevState, nextState, twoWayOperation });
        },
        transform: ({ prevState, currentState, clientOperation, serverOperation }) => {
            const twoWayOperation = {};
            if (createdByMe) {
                twoWayOperation.isValuePrivate = Operations_1.ReplaceBooleanTwoWayOperationModule.transform({
                    first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isValuePrivate,
                    second: clientOperation.isValuePrivate,
                    prevState: prevState.isValuePrivate,
                });
            }
            if (createdByMe || !currentState.isValuePrivate) {
                twoWayOperation.value = Operations_1.ReplaceNullableBooleanTwoWayOperationModule.transform({
                    first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.value,
                    second: clientOperation.value,
                    prevState: prevState.value,
                });
            }
            if (helpers_1.undefinedForAll(twoWayOperation)) {
                return Result_1.ResultModule.ok(undefined);
            }
            return Result_1.ResultModule.ok(Object.assign({}, twoWayOperation));
        },
        diff: ({ prevState, nextState }) => {
            const resultType = {};
            if (prevState.isValuePrivate !== nextState.isValuePrivate) {
                resultType.isValuePrivate = { oldValue: prevState.isValuePrivate, newValue: nextState.isValuePrivate };
            }
            if (prevState.value !== nextState.value) {
                resultType.value = { oldValue: prevState.value, newValue: nextState.value };
            }
            if (helpers_1.undefinedForAll(resultType)) {
                return undefined;
            }
            return Object.assign({}, resultType);
        },
        applyBack: ({ downOperation, nextState }) => {
            var _a;
            const result = Object.assign({}, nextState);
            if (downOperation.isValuePrivate !== undefined) {
                result.isValuePrivate = downOperation.isValuePrivate.oldValue;
            }
            if (downOperation.value !== undefined) {
                result.value = (_a = downOperation.value.oldValue) !== null && _a !== void 0 ? _a : undefined;
            }
            return Result_1.ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        createDefaultState,
    });
})(GlobalBoolParam = exports.GlobalBoolParam || (exports.GlobalBoolParam = {}));
