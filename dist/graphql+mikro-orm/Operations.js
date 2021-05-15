"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextOperationErrorModule = exports.TextTwoWayOperationModule = exports.TextDownOperationModule = exports.TextUpOperationModule = exports.TextUpOperationUnit = exports.ReplaceStringTwoWayOperationModule = exports.ReplaceStringDownOperationModule = exports.ReplaceStringUpOperation = exports.ReplaceNumberTwoWayOperationModule = exports.ReplaceNumberDownOperationModule = exports.ReplaceNumberUpOperation = exports.ReplaceNullableStringTwoWayOperationModule = exports.ReplaceNullableStringDownOperationModule = exports.ReplaceNullableStringUpOperation = exports.ReplaceNullableParticipantRoleTwoWayOperationModule = exports.ReplaceNullableParticipantRoleDownOperationModule = exports.ReplaceNullableParticipantRoleUpOperation = exports.ReplaceNullableNumberTwoWayOperationModule = exports.ReplaceNullableNumberDownOperationModule = exports.ReplaceNullableNumberUpOperation = exports.ReplaceNullableFilePathTwoWayOperationModule = exports.ReplaceNullableFilePathDownOperationModule = exports.ReplaceNullableFilePathUpOperation = exports.ReplaceNullableBooleanTwoWayOperationModule = exports.ReplaceNullableBooleanDownOperationModule = exports.ReplaceNullableBooleanUpOperation = exports.ReplaceFilePathTwoWayOperationModule = exports.ReplaceFilePathDownOperationModule = exports.ReplaceFilePathUpOperation = exports.ReplaceFilePathArrayTwoWayOperationModule = exports.ReplaceFilePathArrayDownOperationModule = exports.ReplaceFilePathArrayUpOperation = exports.ReplaceBooleanTwoWayOperationModule = exports.ReplaceBooleanDownOperationModule = exports.ReplaceBooleanUpOperation = void 0;
const type_graphql_1 = require("type-graphql");
const FileSourceType_1 = require("../enums/FileSourceType");
const graphql_1 = require("./entities/filePath/graphql");
const textOperation_1 = require("../@shared/textOperation");
const Result_1 = require("../@shared/Result");
const collection_1 = require("../@shared/collection");
const ParticipantRole_1 = require("../enums/ParticipantRole");
const mapOperations_1 = require("./mapOperations");
const validateFilePath = (source) => {
    if (typeof source.path !== 'string') {
        throw 'FilePath.path is not string.';
    }
    if (!Object.values(FileSourceType_1.FileSourceType).includes(source.sourceType)) {
        throw 'FilePath.sourceType is not FileSourceType.';
    }
};
const validateFilePathArray = (source) => {
    if (!Array.isArray(source)) {
        throw 'source is not Array';
    }
};
const ReplaceValueOperationModule = {
    compose(first, second) {
        if (first === undefined) {
            return second;
        }
        if (second === undefined) {
            return first;
        }
        return { oldValue: first.oldValue };
    },
    transform({ first, second, prevState }) {
        if (first === undefined && second !== undefined) {
            const newOperation = { oldValue: prevState, newValue: second.newValue };
            if (newOperation.oldValue !== newOperation.newValue) {
                return { oldValue: prevState, newValue: second.newValue };
            }
        }
        return undefined;
    },
    toGraphQLOperation({ valueOperation, isValuePrivateOperation, defaultValue, }) {
        if (valueOperation === undefined) {
            return undefined;
        }
        if (!isValuePrivateOperation) {
            return valueOperation;
        }
        if (isValuePrivateOperation.oldValue) {
            if (isValuePrivateOperation.newValue) {
                return undefined;
            }
            return { oldValue: defaultValue, newValue: valueOperation.newValue };
        }
        if (isValuePrivateOperation.newValue) {
            return { oldValue: valueOperation.oldValue, newValue: defaultValue };
        }
        return valueOperation;
    },
};
const ReplaceNullableValueOperationModule = {
    compose(first, second) {
        if (first === undefined) {
            return second;
        }
        if (second === undefined) {
            return first;
        }
        return { oldValue: first.oldValue };
    },
    transform({ first, second, prevState }) {
        var _a, _b;
        if (first === undefined && second !== undefined) {
            const newOperation = { oldValue: prevState, newValue: (_a = second.newValue) !== null && _a !== void 0 ? _a : undefined };
            if (newOperation.oldValue !== newOperation.newValue) {
                return { oldValue: prevState, newValue: (_b = second.newValue) !== null && _b !== void 0 ? _b : undefined };
            }
        }
        return undefined;
    },
    toGraphQLOperation({ valueOperation, isValuePrivateOperation, }) {
        if (valueOperation === undefined) {
            return undefined;
        }
        if (!isValuePrivateOperation) {
            return valueOperation;
        }
        if (isValuePrivateOperation.oldValue) {
            if (isValuePrivateOperation.newValue) {
                return undefined;
            }
            return { newValue: valueOperation.newValue };
        }
        if (isValuePrivateOperation.newValue) {
            return { oldValue: valueOperation.oldValue };
        }
        return valueOperation;
    },
};
let ReplaceBooleanUpOperation = class ReplaceBooleanUpOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], ReplaceBooleanUpOperation.prototype, "newValue", void 0);
ReplaceBooleanUpOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceBooleanUpOperationInput')
], ReplaceBooleanUpOperation);
exports.ReplaceBooleanUpOperation = ReplaceBooleanUpOperation;
exports.ReplaceBooleanDownOperationModule = {
    compose: (first, second) => ReplaceValueOperationModule.compose(first, second)
};
exports.ReplaceBooleanTwoWayOperationModule = {
    transform: (params) => ReplaceValueOperationModule.transform(params),
    toGraphQLOperation: (params) => ReplaceValueOperationModule.toGraphQLOperation(Object.assign(Object.assign({}, params), { defaultValue: false })),
};
let ReplaceFilePathArrayUpOperation = class ReplaceFilePathArrayUpOperation {
};
__decorate([
    type_graphql_1.Field(() => [graphql_1.FilePath]),
    __metadata("design:type", Array)
], ReplaceFilePathArrayUpOperation.prototype, "newValue", void 0);
ReplaceFilePathArrayUpOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceFilePathArrayUpOperationInput')
], ReplaceFilePathArrayUpOperation);
exports.ReplaceFilePathArrayUpOperation = ReplaceFilePathArrayUpOperation;
exports.ReplaceFilePathArrayDownOperationModule = {
    validate: (source) => {
        if (source === undefined) {
            return undefined;
        }
        validateFilePathArray(source.oldValue);
        return source;
    },
    compose: (first, second) => {
        const result = ReplaceValueOperationModule.compose(first, second);
        if (result === undefined) {
            return undefined;
        }
        return {
            oldValue: [...result.oldValue],
        };
    }
};
exports.ReplaceFilePathArrayTwoWayOperationModule = {
    transform: (params) => {
        const result = ReplaceValueOperationModule.transform(params);
        if (result === undefined) {
            return result;
        }
        return { oldValue: [...result.oldValue], newValue: [...result.newValue] };
    },
    toGraphQLOperation: (params) => {
        const result = ReplaceValueOperationModule.toGraphQLOperation(Object.assign(Object.assign({}, params), { defaultValue: [] }));
        if (result === undefined) {
            return result;
        }
        return { oldValue: [...result.oldValue], newValue: [...result.newValue] };
    },
};
let ReplaceFilePathUpOperation = class ReplaceFilePathUpOperation {
};
__decorate([
    type_graphql_1.Field(() => graphql_1.FilePath),
    __metadata("design:type", graphql_1.FilePath)
], ReplaceFilePathUpOperation.prototype, "newValue", void 0);
ReplaceFilePathUpOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceFilePathUpOperationInput')
], ReplaceFilePathUpOperation);
exports.ReplaceFilePathUpOperation = ReplaceFilePathUpOperation;
exports.ReplaceFilePathDownOperationModule = {
    validate: (source) => {
        if (source === undefined) {
            return undefined;
        }
        validateFilePath(source.oldValue);
        return source;
    },
    compose: (first, second) => ReplaceValueOperationModule.compose(first, second)
};
exports.ReplaceFilePathTwoWayOperationModule = {
    transform: (params) => ReplaceValueOperationModule.transform(params),
    toGraphQLOperation: (params) => {
        const result = ReplaceNullableValueOperationModule.toGraphQLOperation(params);
        if (result === undefined) {
            return result;
        }
        return {
            oldValue: Object.assign({}, result.oldValue),
            newValue: Object.assign({}, result.newValue),
        };
    },
};
let ReplaceNullableBooleanUpOperation = class ReplaceNullableBooleanUpOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Boolean)
], ReplaceNullableBooleanUpOperation.prototype, "newValue", void 0);
ReplaceNullableBooleanUpOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceNullableBooleanUpOperationInput')
], ReplaceNullableBooleanUpOperation);
exports.ReplaceNullableBooleanUpOperation = ReplaceNullableBooleanUpOperation;
exports.ReplaceNullableBooleanDownOperationModule = {
    validate: (source) => {
        var _a;
        if (source == null) {
            return undefined;
        }
        if (source.oldValue == null) {
            return undefined;
        }
        if (typeof source.oldValue !== 'boolean') {
            throw 'source.oldValue is not boolean';
        }
        return { oldValue: (_a = source.oldValue) !== null && _a !== void 0 ? _a : undefined };
    },
    compose: (first, second) => ReplaceNullableValueOperationModule.compose(first, second)
};
exports.ReplaceNullableBooleanTwoWayOperationModule = {
    transform: (params) => ReplaceNullableValueOperationModule.transform(params),
    toGraphQLOperation: (params) => ReplaceNullableValueOperationModule.toGraphQLOperation(params),
};
let ReplaceNullableFilePathUpOperation = class ReplaceNullableFilePathUpOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", graphql_1.FilePath)
], ReplaceNullableFilePathUpOperation.prototype, "newValue", void 0);
ReplaceNullableFilePathUpOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceNullableFilePathUpOperationInput')
], ReplaceNullableFilePathUpOperation);
exports.ReplaceNullableFilePathUpOperation = ReplaceNullableFilePathUpOperation;
exports.ReplaceNullableFilePathDownOperationModule = {
    validate: (source) => {
        var _a;
        if (source == null) {
            return undefined;
        }
        if (source.oldValue == null) {
            return undefined;
        }
        validateFilePath(source.oldValue);
        return { oldValue: (_a = source.oldValue) !== null && _a !== void 0 ? _a : undefined };
    },
    create: (setPath, setSourceType, useSet) => {
        if (setPath !== undefined && setSourceType !== undefined) {
            return { oldValue: { path: setPath, sourceType: setSourceType } };
        }
        if (useSet) {
            return { oldValue: undefined };
        }
        return undefined;
    },
    compose: (first, second) => ReplaceNullableValueOperationModule.compose(first, second)
};
exports.ReplaceNullableFilePathTwoWayOperationModule = {
    transform: (params) => ReplaceNullableValueOperationModule.transform(params),
    toGraphQLOperation: (params) => ReplaceNullableValueOperationModule.toGraphQLOperation(params),
};
let ReplaceNullableNumberUpOperation = class ReplaceNullableNumberUpOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], ReplaceNullableNumberUpOperation.prototype, "newValue", void 0);
ReplaceNullableNumberUpOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceNullableNumberUpOperationInput')
], ReplaceNullableNumberUpOperation);
exports.ReplaceNullableNumberUpOperation = ReplaceNullableNumberUpOperation;
exports.ReplaceNullableNumberDownOperationModule = {
    validate: (source) => {
        var _a;
        if (source == null) {
            return undefined;
        }
        if (source.oldValue == null) {
            return undefined;
        }
        if (typeof source.oldValue !== 'number') {
            throw 'source.oldValue is not number';
        }
        return { oldValue: (_a = source.oldValue) !== null && _a !== void 0 ? _a : undefined };
    },
    compose: (first, second) => ReplaceNullableValueOperationModule.compose(first, second)
};
exports.ReplaceNullableNumberTwoWayOperationModule = {
    transform: (params) => ReplaceNullableValueOperationModule.transform(params),
    toGraphQLOperation: (params) => ReplaceNullableValueOperationModule.toGraphQLOperation(params),
};
let ReplaceNullableParticipantRoleUpOperation = class ReplaceNullableParticipantRoleUpOperation {
};
__decorate([
    type_graphql_1.Field(() => ParticipantRole_1.ParticipantRole, { nullable: true }),
    __metadata("design:type", String)
], ReplaceNullableParticipantRoleUpOperation.prototype, "newValue", void 0);
ReplaceNullableParticipantRoleUpOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceNullableParticipantRoleUpOperationInput')
], ReplaceNullableParticipantRoleUpOperation);
exports.ReplaceNullableParticipantRoleUpOperation = ReplaceNullableParticipantRoleUpOperation;
exports.ReplaceNullableParticipantRoleDownOperationModule = {
    validate: (source) => {
        var _a;
        if (source == null) {
            return undefined;
        }
        if (source.oldValue == null) {
            return undefined;
        }
        return { oldValue: (_a = source.oldValue) !== null && _a !== void 0 ? _a : undefined };
    },
    compose: (first, second) => ReplaceNullableValueOperationModule.compose(first, second)
};
exports.ReplaceNullableParticipantRoleTwoWayOperationModule = {
    transform: (params) => ReplaceNullableValueOperationModule.transform(params),
    toGraphQLOperation: (params) => ReplaceNullableValueOperationModule.toGraphQLOperation(params),
};
let ReplaceNullableStringUpOperation = class ReplaceNullableStringUpOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], ReplaceNullableStringUpOperation.prototype, "newValue", void 0);
ReplaceNullableStringUpOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceNullableStringUpOperationInput')
], ReplaceNullableStringUpOperation);
exports.ReplaceNullableStringUpOperation = ReplaceNullableStringUpOperation;
exports.ReplaceNullableStringDownOperationModule = {
    validate: (source) => {
        var _a;
        if (source == null) {
            return undefined;
        }
        if (source.oldValue == null) {
            return undefined;
        }
        if (typeof source.oldValue !== 'string') {
            throw 'source.oldValue is not string';
        }
        return { oldValue: (_a = source.oldValue) !== null && _a !== void 0 ? _a : undefined };
    },
    compose: (first, second) => ReplaceNullableValueOperationModule.compose(first, second)
};
exports.ReplaceNullableStringTwoWayOperationModule = {
    transform: (params) => ReplaceNullableValueOperationModule.transform(params),
    toGraphQLOperation: (params) => ReplaceNullableValueOperationModule.toGraphQLOperation(params),
};
let ReplaceNumberUpOperation = class ReplaceNumberUpOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], ReplaceNumberUpOperation.prototype, "newValue", void 0);
ReplaceNumberUpOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceNumberUpOperationInput')
], ReplaceNumberUpOperation);
exports.ReplaceNumberUpOperation = ReplaceNumberUpOperation;
exports.ReplaceNumberDownOperationModule = {
    create: (set) => {
        return set === undefined ? undefined : { oldValue: set };
    },
    compose: (first, second) => ReplaceValueOperationModule.compose(first, second)
};
exports.ReplaceNumberTwoWayOperationModule = {
    transform: (params) => ReplaceValueOperationModule.transform(params),
    toGraphQLOperation: (params) => ReplaceValueOperationModule.toGraphQLOperation(Object.assign(Object.assign({}, params), { defaultValue: 0 })),
};
let ReplaceStringUpOperation = class ReplaceStringUpOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ReplaceStringUpOperation.prototype, "newValue", void 0);
ReplaceStringUpOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('ReplaceStringUpOperationInput')
], ReplaceStringUpOperation);
exports.ReplaceStringUpOperation = ReplaceStringUpOperation;
exports.ReplaceStringDownOperationModule = {
    create: (set) => {
        return set === undefined ? undefined : { oldValue: set };
    },
    compose: (first, second) => ReplaceValueOperationModule.compose(first, second)
};
exports.ReplaceStringTwoWayOperationModule = {
    transform: (params) => ReplaceValueOperationModule.transform(params),
    toGraphQLOperation: (params) => ReplaceValueOperationModule.toGraphQLOperation(Object.assign(Object.assign({}, params), { defaultValue: '' })),
};
let TextUpOperationUnit = class TextUpOperationUnit {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], TextUpOperationUnit.prototype, "retain", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], TextUpOperationUnit.prototype, "insert", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], TextUpOperationUnit.prototype, "delete", void 0);
TextUpOperationUnit = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('TextUpOperationUnitInput')
], TextUpOperationUnit);
exports.TextUpOperationUnit = TextUpOperationUnit;
exports.TextUpOperationModule = {
    ofUnit: (source) => {
        if (source == null) {
            return undefined;
        }
        const unit = collection_1.__(source).compact(unit => {
            if (unit.delete !== undefined) {
                return {
                    type: textOperation_1.delete$,
                    delete: unit.delete,
                };
            }
            if (unit.insert !== undefined) {
                return {
                    type: textOperation_1.insert$,
                    insert: unit.insert,
                };
            }
            if (unit.retain !== undefined) {
                return {
                    type: textOperation_1.retain,
                    retain: unit.retain,
                };
            }
            return null;
        }).toArray();
        return textOperation_1.TextUpOperation.ofUnit(unit);
    },
};
exports.TextDownOperationModule = {
    ofUnitAndValidate: (source) => {
        if (source == null) {
            return undefined;
        }
        if (!Array.isArray(source)) {
            return undefined;
        }
        const unit = collection_1.__(source).compact(unit => {
            if (unit.delete !== undefined) {
                return {
                    type: textOperation_1.delete$,
                    delete: unit.delete,
                };
            }
            if (unit.insert !== undefined) {
                return {
                    type: textOperation_1.insert$,
                    insert: unit.insert,
                };
            }
            if (unit.retain !== undefined) {
                return {
                    type: textOperation_1.retain,
                    retain: unit.retain,
                };
            }
            return null;
        }).toArray();
        return textOperation_1.TextDownOperation.ofUnit(unit);
    },
    ofUnitAndValidateMany: ({ updates, removes }) => {
        const result = new Map();
        updates.forEach((value, key) => {
            if (value == null) {
                return;
            }
            const newValue = exports.TextDownOperationModule.ofUnitAndValidate(value);
            if (newValue == null) {
                return;
            }
            result.set(key, { type: mapOperations_1.update, operation: newValue });
        });
        removes.forEach((value, key) => {
            if (value == null) {
                return;
            }
            result.set(key, { type: mapOperations_1.replace, operation: { oldValue: value } });
        });
        return result;
    },
    applyBack: (nextState, action) => {
        return textOperation_1.TextDownOperation.applyBack({ nextState, action });
    },
    applyBackMany: (nextState, action) => {
        return mapOperations_1.applyBack({
            nextState, downOperation: action, innerApplyBack: ({ nextState, downOperation }) => {
                return exports.TextDownOperationModule.applyBack(nextState, downOperation);
            }
        });
    },
    applyBackAndRestore: (nextState, action) => {
        return textOperation_1.TextDownOperation.applyBackAndRestore({ nextState, action });
    },
    applyBackAndRestoreMany: (nextState, action) => {
        return mapOperations_1.restore({
            nextState,
            downOperation: action,
            innerRestore: ({ nextState, downOperation }) => {
                const result = exports.TextDownOperationModule.applyBackAndRestore(nextState, downOperation);
                if (result.isError) {
                    return result;
                }
                return Result_1.ResultModule.ok({ prevState: result.value.prevState, twoWayOperation: result.value.restored });
            },
            innerDiff: ({ prevState, nextState }) => {
                return exports.TextTwoWayOperationModule.diff(prevState, nextState);
            },
        });
    },
    compose: (first, second) => {
        if (first === undefined) {
            return second;
        }
        if (second === undefined) {
            return first;
        }
        const result = textOperation_1.TextDownOperation.compose({ first, second });
        if (result.isError) {
            throw result.error;
        }
        return result.value;
    },
    diff: (prev, next) => {
        return textOperation_1.TextDownOperation.diff({ first: prev, second: next });
    }
};
exports.TextTwoWayOperationModule = {
    apply: (prevState, operation) => {
        return textOperation_1.TextUpOperation.apply({ prevState, action: textOperation_1.TextTwoWayOperation.toUpOperation(operation) });
    },
    toUpUnit: (source) => {
        const upOperation = textOperation_1.TextTwoWayOperation.toUpOperation(source);
        return textOperation_1.TextUpOperation.toUnit(upOperation).map(unit => {
            switch (unit.type) {
                case textOperation_1.retain:
                    return { retain: unit.retain };
                case textOperation_1.insert$:
                    return { insert: unit.insert };
                case textOperation_1.delete$:
                    return { delete: unit.delete };
            }
        });
    },
    toDownUnit: (source) => {
        const downOperation = textOperation_1.TextTwoWayOperation.toDownOperation(source);
        return textOperation_1.TextDownOperation.toUnit(downOperation).map(unit => {
            switch (unit.type) {
                case textOperation_1.retain:
                    return { retain: unit.retain };
                case textOperation_1.insert$:
                    return { insert: unit.insert };
                case textOperation_1.delete$:
                    return { delete: unit.delete };
            }
        });
    },
    toFullUnit: (source) => {
        return textOperation_1.TextTwoWayOperation.toUnit(source).map(unit => {
            switch (unit.type) {
                case textOperation_1.retain:
                    return { retain: unit.retain };
                case textOperation_1.insert$:
                    return { insert: unit.insert };
                case textOperation_1.delete$:
                    return { delete: unit.delete };
            }
        });
    },
    transform: ({ first, second, prevState, }) => {
        if (first === undefined) {
            if (second === undefined) {
                return Result_1.ResultModule.ok({});
            }
            const restoreResult = textOperation_1.TextUpOperation.applyAndRestore({ prevState, action: second });
            if (restoreResult.isError) {
                return restoreResult;
            }
            return Result_1.ResultModule.ok({ secondPrime: restoreResult.value.restored });
        }
        if (second === undefined) {
            return Result_1.ResultModule.ok({ firstPrime: first });
        }
        const secondResult = textOperation_1.TextUpOperation.applyAndRestore({ prevState, action: second });
        if (secondResult.isError) {
            return secondResult;
        }
        return textOperation_1.TextTwoWayOperation.transform({ first, second: secondResult.value.restored });
    },
    toGraphQLOperation({ valueOperation, isValuePrivateOperation, }) {
        if (valueOperation === undefined || valueOperation.operation === undefined) {
            return undefined;
        }
        if (!isValuePrivateOperation) {
            return valueOperation.operation;
        }
        if (isValuePrivateOperation.oldValue) {
            if (isValuePrivateOperation.newValue) {
                return undefined;
            }
            const del = textOperation_1.NonEmptyString.tryCreate(valueOperation.oldValue);
            if (del === undefined) {
                return undefined;
            }
            return {
                headEdit: {
                    type: textOperation_1.delete$,
                    delete: del,
                },
                body: [],
            };
        }
        if (isValuePrivateOperation.newValue) {
            const ins = textOperation_1.NonEmptyString.tryCreate(valueOperation.newValue);
            if (ins === undefined) {
                return undefined;
            }
            return {
                headEdit: {
                    type: textOperation_1.insert$,
                    insert: ins,
                },
                body: [],
            };
        }
        return valueOperation.operation;
    },
    diff: (prev, next) => {
        return textOperation_1.TextTwoWayOperation.diff({ first: prev, second: next });
    },
};
exports.TextOperationErrorModule = {
    toString: (error) => {
        return error.type;
    },
};
