'use strict';

var tslib = require('tslib');
var classValidator = require('class-validator');
var typeGraphql = require('type-graphql');
var FileSourceType = require('../../enums/FileSourceType.js');

exports.FilePath = class FilePath {
};
tslib.__decorate([
    typeGraphql.Field(),
    classValidator.MaxLength(10000),
    tslib.__metadata("design:type", String)
], exports.FilePath.prototype, "path", void 0);
tslib.__decorate([
    typeGraphql.Field(() => FileSourceType.FileSourceType),
    tslib.__metadata("design:type", String)
], exports.FilePath.prototype, "sourceType", void 0);
exports.FilePath = tslib.__decorate([
    typeGraphql.ObjectType(),
    typeGraphql.InputType('FilePathInput')
], exports.FilePath);
//# sourceMappingURL=filePath.js.map
