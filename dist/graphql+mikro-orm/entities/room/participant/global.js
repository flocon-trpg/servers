"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalParticipant = void 0;
const Result_1 = require("../../../../@shared/Result");
const ParticipantRole_1 = require("../../../../enums/ParticipantRole");
const ParticipantRoleOperation_1 = require("../../../../enums/ParticipantRoleOperation");
const helpers_1 = require("../../../../utils/helpers");
const mapOperations_1 = require("../../../mapOperations");
const Operations_1 = require("../../../Operations");
const global_1 = require("../../global");
const mikro_orm_1 = require("../../user/mikro-orm");
const mikro_orm_2 = require("./mikro-orm");
const global_2 = require("./myValue/global");
const Types_1 = require("../../../Types");
var GlobalParticipant;
(function (GlobalParticipant) {
    let MikroORM;
    (function (MikroORM) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = async (entity) => {
                const myNumberValues = await global_2.GlobalMyValue.MikroORM.ToGlobal.stateMany(await entity.myValues.loadItems());
                return Object.assign(Object.assign({}, entity), { myNumberValues });
            };
            ToGlobal.stateMany = async (entity) => {
                const result = new Map();
                for (const elem of entity) {
                    result.set(elem.user.userUid, await ToGlobal.state(elem));
                }
                return result;
            };
            ToGlobal.stateFromRemoveParticiOp = async (entity) => {
                const myNumberValues = await global_2.GlobalMyValue.MikroORM.ToGlobal.stateManyFromRemovedMyValueOp(await entity.removedMyValues.loadItems());
                return Object.assign(Object.assign({}, entity), { myNumberValues });
            };
            ToGlobal.stateManyFromRemoveParticiOp = async (entity) => {
                const result = new Map();
                for (const elem of entity) {
                    result.set(elem.user.userUid, await ToGlobal.stateFromRemoveParticiOp(elem));
                }
                return result;
            };
            ToGlobal.downOperationMany = async ({ add, update, remove, }) => {
                return await mapOperations_1.createDownOperationFromMikroORM({
                    add,
                    update,
                    remove,
                    toKey: x => {
                        return Result_1.ResultModule.ok(x.user.userUid);
                    },
                    getState: async (x) => Result_1.ResultModule.ok(await ToGlobal.stateFromRemoveParticiOp(x)),
                    getOperation: async (entity) => {
                        const myNumberValues = await global_2.GlobalMyValue.MikroORM.ToGlobal.downOperationMany({
                            add: entity.addMyValueOps,
                            remove: entity.removeMyValueOps,
                            update: entity.updateMyValueOps,
                        });
                        if (myNumberValues.isError) {
                            return myNumberValues;
                        }
                        const role = (() => {
                            switch (entity.role) {
                                case undefined:
                                    return undefined;
                                case ParticipantRoleOperation_1.ParticipantRoleOperation.Left:
                                    return { oldValue: undefined };
                                case ParticipantRoleOperation_1.ParticipantRoleOperation.Master:
                                    return { oldValue: ParticipantRole_1.ParticipantRole.Master };
                                case ParticipantRoleOperation_1.ParticipantRoleOperation.Player:
                                    return { oldValue: ParticipantRole_1.ParticipantRole.Player };
                                case ParticipantRoleOperation_1.ParticipantRoleOperation.Spectator:
                                    return { oldValue: ParticipantRole_1.ParticipantRole.Spectator };
                            }
                        })();
                        return Result_1.ResultModule.ok({
                            myNumberValues: myNumberValues.value,
                            name: entity.name == null ? undefined : { oldValue: entity.name },
                            role,
                        });
                    },
                });
            };
        })(ToGlobal = MikroORM.ToGlobal || (MikroORM.ToGlobal = {}));
    })(MikroORM = GlobalParticipant.MikroORM || (GlobalParticipant.MikroORM = {}));
    let Global;
    (function (Global) {
        let ToGraphQL;
        (function (ToGraphQL) {
            ToGraphQL.state = ({ source, createdByMe }) => {
                return Object.assign(Object.assign({}, source), { myNumberValues: global_2.GlobalMyValue.Global.ToGraphQL.stateMany({ source: source.myNumberValues, createdByMe }) });
            };
            ToGraphQL.stateMany = ({ source, requestedBy }) => {
                const result = [];
                source.forEach((value, key) => {
                    result.push({
                        userUid: key,
                        value: ToGraphQL.state({
                            source: value,
                            createdByMe: Types_1.RequestedBy.createdByMe({ requestedBy, userUid: key }),
                        }),
                    });
                });
                return result;
            };
            ToGraphQL.operation = ({ operation, prevState, nextState, requestedBy, }) => {
                return mapOperations_1.toGraphQLWithState({
                    source: operation,
                    prevState,
                    nextState,
                    isPrivate: () => false,
                    toReplaceOperation: ({ nextState, key }) => ({
                        userUid: key,
                        newValue: nextState === undefined ? undefined : ToGraphQL.state({
                            source: nextState,
                            createdByMe: Types_1.RequestedBy.createdByMe({ requestedBy, userUid: key }),
                        })
                    }),
                    toUpdateOperation: ({ operation, prevState, nextState, key }) => {
                        const createdByMe = Types_1.RequestedBy.createdByMe({ requestedBy, userUid: key });
                        const myNumberValues = global_2.GlobalMyValue.Global.ToGraphQL.operation({
                            operation: operation.myNumberValues,
                            prevState: prevState.myNumberValues,
                            nextState: nextState.myNumberValues,
                            createdByMe,
                        });
                        return {
                            userUid: key,
                            operation: {
                                name: operation.name,
                                role: operation.role,
                                myNumberValues,
                            },
                        };
                    },
                });
            };
        })(ToGraphQL = Global.ToGraphQL || (Global.ToGraphQL = {}));
        Global.emptyTwoWayOperation = () => ({
            myNumberValues: new Map(),
        });
        Global.applyToEntity = async ({ em, parent, parentOp, operation, }) => {
            for (const [key, value] of operation) {
                switch (value.type) {
                    case mapOperations_1.replace: {
                        if (value.operation.newValue === undefined) {
                            if (value.operation.oldValue === undefined) {
                                console.warn('Replace: oldValue === newValue === undefined. This should be id.');
                                continue;
                            }
                            const user = await em.findOneOrFail(mikro_orm_1.User, { userUid: key });
                            const toRemove = await em.findOneOrFail(mikro_orm_2.Partici, { room: { id: parent.id }, user: { userUid: key } });
                            em.remove(toRemove);
                            const op = new mikro_orm_2.RemoveParticiOp({
                                name: value.operation.oldValue.name,
                                role: value.operation.oldValue.role,
                                user,
                                roomOp: parentOp,
                            });
                            em.persist(op);
                            continue;
                        }
                        const user = await em.findOneOrFail(mikro_orm_1.User, { userUid: key });
                        const toAdd = new mikro_orm_2.Partici({
                            name: value.operation.newValue.name,
                            role: value.operation.newValue.role,
                            user,
                            room: parent,
                        });
                        em.persist(toAdd);
                        const op = new mikro_orm_2.AddParticiOp({ roomOp: parentOp, user });
                        em.persist(op);
                        continue;
                    }
                    case mapOperations_1.update: {
                        const user = await em.findOneOrFail(mikro_orm_1.User, { userUid: key });
                        const target = await em.findOneOrFail(mikro_orm_2.Partici, { room: { id: parent.id }, user: { userUid: key } });
                        const op = new mikro_orm_2.UpdateParticiOp({ roomOp: parentOp, user });
                        await global_2.GlobalMyValue.Global.applyToEntity({ em, parent: target, parentOp: op, operation: value.operation.myNumberValues });
                        if (value.operation.name != null) {
                            target.name = value.operation.name.newValue;
                            op.name = value.operation.name.oldValue;
                        }
                        if (value.operation.role != null) {
                            target.role = value.operation.role.newValue;
                            op.role = (() => {
                                switch (value.operation.role.oldValue) {
                                    case undefined:
                                        return ParticipantRoleOperation_1.ParticipantRoleOperation.Left;
                                    case ParticipantRole_1.ParticipantRole.Master:
                                        return ParticipantRoleOperation_1.ParticipantRoleOperation.Master;
                                    case ParticipantRole_1.ParticipantRole.Player:
                                        return ParticipantRoleOperation_1.ParticipantRoleOperation.Player;
                                    case ParticipantRole_1.ParticipantRole.Spectator:
                                        return ParticipantRoleOperation_1.ParticipantRoleOperation.Spectator;
                                }
                            })();
                        }
                        em.persist(op);
                        continue;
                    }
                }
            }
        };
    })(Global = GlobalParticipant.Global || (GlobalParticipant.Global = {}));
    let GraphQL;
    (function (GraphQL) {
        let ToGlobal;
        (function (ToGlobal) {
            ToGlobal.state = (object) => {
                const myNumberValues = global_2.GlobalMyValue.GraphQL.ToGlobal.stateMany(object.myNumberValues);
                return Object.assign(Object.assign({}, object), { myNumberValues });
            };
            ToGlobal.stateMany = (objects) => {
                const result = new Map();
                objects.forEach(x => {
                    result.set(x.userUid, ToGlobal.state(x.value));
                });
                return result;
            };
            ToGlobal.upOperationMany = (source) => {
                return mapOperations_1.createUpOperationFromGraphQL({
                    replace: source.replace,
                    update: source.update,
                    createKey: x => {
                        return Result_1.ResultModule.ok(x.userUid);
                    },
                    getState: x => x.newValue == null ? undefined : ToGlobal.state(x.newValue),
                    getOperation: x => {
                        const myNumberValues = global_2.GlobalMyValue.GraphQL.ToGlobal.upOperationMany(x.operation.myNumberValues);
                        if (myNumberValues.isError) {
                            return myNumberValues;
                        }
                        return Result_1.ResultModule.ok({
                            name: x.operation.name,
                            role: x.operation.role,
                            myNumberValues: myNumberValues.value,
                        });
                    },
                });
            };
            ToGlobal.upOperationManyFromInput = (source) => {
                return mapOperations_1.createUpOperationFromGraphQL({
                    replace: [],
                    update: source.update,
                    createKey: x => {
                        return Result_1.ResultModule.ok(x.userUid);
                    },
                    getState: () => {
                        throw 'This should not happen';
                    },
                    getOperation: x => {
                        const myNumberValues = global_2.GlobalMyValue.GraphQL.ToGlobal.upOperationMany(x.operation.myNumberValues);
                        if (myNumberValues.isError) {
                            return myNumberValues;
                        }
                        return Result_1.ResultModule.ok({
                            myNumberValues: myNumberValues.value,
                        });
                    },
                });
            };
        })(ToGlobal = GraphQL.ToGlobal || (GraphQL.ToGlobal = {}));
    })(GraphQL = GlobalParticipant.GraphQL || (GlobalParticipant.GraphQL = {}));
    const createMyNumberValueTransformer = (createdByMe) => global_2.GlobalMyValue.transformerFactory(createdByMe);
    const createMyNumberValuesTransformer = (createdByMe) => new global_1.MapTransformer(createMyNumberValueTransformer(createdByMe));
    GlobalParticipant.transformerFactory = (requestedBy) => ({
        composeLoose: ({ key, first, second }) => {
            var _a, _b, _c, _d, _e;
            const myNumberValuesTransformer = createMyNumberValuesTransformer(Types_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
            const myNumberValues = myNumberValuesTransformer.composeLoose({
                first: first.myNumberValues,
                second: second.myNumberValues,
            });
            if (myNumberValues.isError) {
                return myNumberValues;
            }
            const valueProps = {
                name: Operations_1.ReplaceStringDownOperationModule.compose((_a = first.name) !== null && _a !== void 0 ? _a : undefined, (_b = second.name) !== null && _b !== void 0 ? _b : undefined),
                role: Operations_1.ReplaceNullableParticipantRoleDownOperationModule.compose((_c = first.role) !== null && _c !== void 0 ? _c : undefined, (_d = second.role) !== null && _d !== void 0 ? _d : undefined),
                myNumberValues: (_e = myNumberValues.value) !== null && _e !== void 0 ? _e : new Map(),
            };
            return Result_1.ResultModule.ok(valueProps);
        },
        restore: ({ key, nextState, downOperation }) => {
            var _a, _b;
            if (downOperation === undefined) {
                return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
            }
            const myNumberValuesTransformer = createMyNumberValuesTransformer(Types_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
            const myNumberValues = myNumberValuesTransformer.restore({
                nextState: nextState.myNumberValues,
                downOperation: downOperation.myNumberValues,
            });
            if (myNumberValues.isError) {
                return myNumberValues;
            }
            const prevState = Object.assign(Object.assign({}, nextState), { myNumberValues: myNumberValues.value.prevState });
            const twoWayOperation = {
                myNumberValues: myNumberValues.value.twoWayOperation,
            };
            if (downOperation.name != null) {
                prevState.name = downOperation.name.oldValue;
                twoWayOperation.name = Object.assign(Object.assign({}, downOperation.name), { newValue: nextState.name });
            }
            if (downOperation.role != null) {
                prevState.role = (_a = downOperation.role.oldValue) !== null && _a !== void 0 ? _a : undefined;
                twoWayOperation.role = { oldValue: (_b = downOperation.role.oldValue) !== null && _b !== void 0 ? _b : undefined, newValue: nextState.role };
            }
            return Result_1.ResultModule.ok({ prevState, twoWayOperation });
        },
        transform: ({ key, prevState, currentState, clientOperation, serverOperation }) => {
            var _a, _b, _c, _d, _e;
            const myNumberValuesTransformer = createMyNumberValuesTransformer(Types_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
            const myNumberValues = myNumberValuesTransformer.transform({
                prevState: prevState.myNumberValues,
                currentState: currentState.myNumberValues,
                clientOperation: clientOperation.myNumberValues,
                serverOperation: (_a = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.myNumberValues) !== null && _a !== void 0 ? _a : new Map(),
            });
            if (myNumberValues.isError) {
                return myNumberValues;
            }
            const twoWayOperation = {};
            twoWayOperation.name = Operations_1.ReplaceStringTwoWayOperationModule.transform({
                first: (_b = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.name) !== null && _b !== void 0 ? _b : undefined,
                second: (_c = clientOperation.name) !== null && _c !== void 0 ? _c : undefined,
                prevState: prevState.name,
            });
            twoWayOperation.role = Operations_1.ReplaceNullableParticipantRoleTwoWayOperationModule.transform({
                first: (_d = serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.role) !== null && _d !== void 0 ? _d : undefined,
                second: (_e = clientOperation.role) !== null && _e !== void 0 ? _e : undefined,
                prevState: prevState.role,
            });
            if (helpers_1.undefinedForAll(twoWayOperation) && myNumberValues.value.size === 0) {
                return Result_1.ResultModule.ok(undefined);
            }
            return Result_1.ResultModule.ok(Object.assign(Object.assign({}, twoWayOperation), { myNumberValues: myNumberValues.value }));
        },
        diff: ({ key, prevState, nextState }) => {
            const myNumberValuesTransformer = createMyNumberValuesTransformer(Types_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
            const myNumberValues = myNumberValuesTransformer.diff({
                prevState: prevState.myNumberValues,
                nextState: nextState.myNumberValues,
            });
            const resultType = {};
            if (prevState.name != nextState.name) {
                resultType.name = { oldValue: prevState.name, newValue: nextState.name };
            }
            if (prevState.role != nextState.role) {
                resultType.role = { oldValue: prevState.role, newValue: nextState.role };
            }
            if (helpers_1.undefinedForAll(resultType) && myNumberValues.size === 0) {
                return undefined;
            }
            return Object.assign(Object.assign({}, resultType), { myNumberValues });
        },
        applyBack: ({ key, downOperation, nextState }) => {
            var _a, _b;
            const myNumberValuesTransformer = createMyNumberValuesTransformer(Types_1.RequestedBy.createdByMe({ requestedBy, userUid: key }));
            const myNumberValues = myNumberValuesTransformer.applyBack({
                downOperation: downOperation.myNumberValues,
                nextState: nextState.myNumberValues,
            });
            if (myNumberValues.isError) {
                return myNumberValues;
            }
            const result = Object.assign(Object.assign({}, nextState), { myNumberValues: myNumberValues.value });
            if (downOperation.name !== undefined) {
                result.name = (_a = downOperation.name.oldValue) !== null && _a !== void 0 ? _a : undefined;
            }
            if (downOperation.role !== undefined) {
                result.role = (_b = downOperation.role.oldValue) !== null && _b !== void 0 ? _b : undefined;
            }
            return Result_1.ResultModule.ok(result);
        },
        toServerState: ({ clientState }) => clientState,
        protectedValuePolicy: {}
    });
})(GlobalParticipant = exports.GlobalParticipant || (exports.GlobalParticipant = {}));
