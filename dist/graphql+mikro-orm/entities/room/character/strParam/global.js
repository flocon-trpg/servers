"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalStrParam = void 0;
const indexes_1 = require("../../../../../@shared/indexes");
const Result_1 = require("../../../../../@shared/Result");
const utils_1 = require("../../../../../@shared/utils");
const Operations_1 = require("../../../../Operations");
const paramMapOperations_1 = require("../../../../paramMapOperations");
const mikro_orm_1 = require("./mikro-orm");
var GlobalStrParam;
(function (GlobalStrParam) {
    const createDefaultState = () => ({ isValuePrivate: false, value: '' });
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
                        value: Operations_1.TextDownOperationModule.ofUnitAndValidate(entity.value),
                    })
                });
            };
        })(ToGlobal = MikroORM.ToGlobal || (MikroORM.ToGlobal = {}));
    })(MikroORM = GlobalStrParam.MikroORM || (GlobalStrParam.MikroORM = {}));
    let Global;
    (function (Global) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = ({ source, createdByMe }) => {
                if (source.isValuePrivate && !createdByMe) {
                    return Object.assign(Object.assign({}, source), { value: createDefaultState().value });
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
                                    const operation = Operations_1.TextTwoWayOperationModule.diff('', (_b = (_a = nextState.get(key)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : createDefaultState().value);
                                    return Operations_1.TextTwoWayOperationModule.toUpUnit(operation);
                                }
                                if (isNextValuePrivate) {
                                    const operation = Operations_1.TextTwoWayOperationModule.diff((_d = (_c = prevState.get(key)) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : createDefaultState().value, '');
                                    return Operations_1.TextTwoWayOperationModule.toUpUnit(operation);
                                }
                                return value.value == null ? undefined : Operations_1.TextTwoWayOperationModule.toUpUnit(value.value);
                            })(),
                        },
                    });
                }
                return result;
            };
        })(ToGraphQL = Global.ToGraphQL || (Global.ToGraphQL = {}));
        Global.applyToEntity = async ({ em, parent, parentOp, operation, }) => {
            for (const [key, value] of operation) {
                let target = await em.findOne(mikro_orm_1.StrParam, { chara: { id: parent.id }, key });
                if (target == null) {
                    target = new mikro_orm_1.StrParam({ key, isValuePrivate: false, value: '', chara: parent });
                    em.persist(target);
                }
                const op = new mikro_orm_1.UpdateStrParamOp({ key, updateCharaOp: parentOp });
                if (value.isValuePrivate != null) {
                    target.isValuePrivate = value.isValuePrivate.newValue;
                    op.isValuePrivate = value.isValuePrivate.oldValue;
                }
                if (value.value != null) {
                    const newValue = Operations_1.TextTwoWayOperationModule.apply(target.value, value.value);
                    if (newValue.isError) {
                        return Result_1.ResultModule.error(Operations_1.TextOperationErrorModule.toString(newValue.error));
                    }
                    target.value = newValue.value;
                    op.value = Operations_1.TextTwoWayOperationModule.toDownUnit(value.value);
                }
                em.persist(op);
                continue;
            }
        };
    })(Global = GlobalStrParam.Global || (GlobalStrParam.Global = {}));
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
                        value: Operations_1.TextUpOperationModule.ofUnit(x.operation.value),
                    }),
                });
            };
        })(ToGlobal = GraphQL.ToGlobal || (GraphQL.ToGlobal = {}));
    })(GraphQL = GlobalStrParam.GraphQL || (GlobalStrParam.GraphQL = {}));
    GlobalStrParam.transformerFactory = (createdByMe) => ({
        composeLoose: ({ first, second }) => {
            const valueProps = {
                isValuePrivate: Operations_1.ReplaceBooleanDownOperationModule.compose(first.isValuePrivate, second.isValuePrivate),
                value: Operations_1.TextDownOperationModule.compose(first.value, second.value),
            };
            return Result_1.ResultModule.ok(valueProps);
        },
        restore: ({ nextState, downOperation }) => {
            var _a;
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
                const restored = Operations_1.TextDownOperationModule.applyBackAndRestore((_a = nextState.value) !== null && _a !== void 0 ? _a : '', downOperation.value);
                if (restored.isError) {
                    return Result_1.ResultModule.error(Operations_1.TextOperationErrorModule.toString(restored.error));
                }
                prevState.value = restored.value.prevState;
                twoWayOperation.value = restored.value.restored;
            }
            return Result_1.ResultModule.ok({ prevState, nextState, twoWayOperation });
        },
        transform: ({ prevState, currentState, clientOperation, serverOperation }) => {
            var _a;
            const twoWayOperation = {};
            if (createdByMe) {
                twoWayOperation.isValuePrivate = Operations_1.ReplaceBooleanTwoWayOperationModule.transform({
                    first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.isValuePrivate,
                    second: clientOperation.isValuePrivate,
                    prevState: prevState.isValuePrivate,
                });
            }
            if (createdByMe || !currentState.isValuePrivate) {
                const value = Operations_1.TextTwoWayOperationModule.transform({
                    first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.value,
                    second: clientOperation.value,
                    prevState: (_a = prevState.value) !== null && _a !== void 0 ? _a : '',
                });
                if (value.isError) {
                    return Result_1.ResultModule.error(Operations_1.TextOperationErrorModule.toString(value.error));
                }
                twoWayOperation.value = value.value.secondPrime;
            }
            if (utils_1.undefinedForAll(twoWayOperation)) {
                return Result_1.ResultModule.ok(undefined);
            }
            return Result_1.ResultModule.ok(Object.assign({}, twoWayOperation));
        },
        diff: ({ prevState, nextState }) => {
            var _a, _b;
            const resultType = {};
            if (prevState.isValuePrivate !== nextState.isValuePrivate) {
                resultType.isValuePrivate = { oldValue: prevState.isValuePrivate, newValue: nextState.isValuePrivate };
            }
            if (prevState.value !== nextState.value) {
                resultType.value = Operations_1.TextTwoWayOperationModule.diff((_a = prevState.value) !== null && _a !== void 0 ? _a : '', (_b = nextState.value) !== null && _b !== void 0 ? _b : '');
            }
            if (utils_1.undefinedForAll(resultType)) {
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
                const applied = Operations_1.TextDownOperationModule.applyBack((_a = nextState.value) !== null && _a !== void 0 ? _a : '', downOperation.value);
                if (applied.isError) {
                    return Result_1.ResultModule.error(Operations_1.TextOperationErrorModule.toString(applied.error));
                }
                result.value = applied.value;
            }
            return Result_1.ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        createDefaultState,
    });
})(GlobalStrParam = exports.GlobalStrParam || (exports.GlobalStrParam = {}));
