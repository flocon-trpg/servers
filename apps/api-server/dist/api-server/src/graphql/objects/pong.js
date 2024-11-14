'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');

exports.Pong = class Pong {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], exports.Pong.prototype, "value", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.Pong.prototype, "createdBy", void 0);
exports.Pong = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.Pong);
//# sourceMappingURL=pong.js.map
