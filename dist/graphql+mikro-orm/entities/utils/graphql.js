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
exports.StateIdStringPairOperation = exports.StateIdStringPairReplaceOperation = exports.StateIdStringPair = void 0;
const type_graphql_1 = require("type-graphql");
const Operations_1 = require("../../Operations");
let StateIdStringPair = class StateIdStringPair {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], StateIdStringPair.prototype, "stateId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], StateIdStringPair.prototype, "value", void 0);
StateIdStringPair = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('StateIdStringPairInput')
], StateIdStringPair);
exports.StateIdStringPair = StateIdStringPair;
let StateIdStringPairReplaceOperation = class StateIdStringPairReplaceOperation {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], StateIdStringPairReplaceOperation.prototype, "newValue", void 0);
StateIdStringPairReplaceOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('StateIdStringPairReplaceOperationInput')
], StateIdStringPairReplaceOperation);
exports.StateIdStringPairReplaceOperation = StateIdStringPairReplaceOperation;
let StateIdStringPairOperation = class StateIdStringPairOperation {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], StateIdStringPairOperation.prototype, "stateId", void 0);
__decorate([
    type_graphql_1.Field(() => [Operations_1.TextUpOperationUnit], { nullable: true }),
    __metadata("design:type", Array)
], StateIdStringPairOperation.prototype, "update", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", StateIdStringPairReplaceOperation)
], StateIdStringPairOperation.prototype, "replace", void 0);
StateIdStringPairOperation = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.InputType('StateIdStringPairOperationInput')
], StateIdStringPairOperation);
exports.StateIdStringPairOperation = StateIdStringPairOperation;
