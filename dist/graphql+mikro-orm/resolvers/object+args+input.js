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
exports.FileTag = exports.EditFileTagsInput = exports.EditFileTagActionInput = exports.ListFilesInput = void 0;
const type_graphql_1 = require("type-graphql");
let ListFilesInput = class ListFilesInput {
};
__decorate([
    type_graphql_1.Field(() => [String], {
        description: 'FileTagのidを指定することで、指定したタグが付いているファイルのみを抽出して表示する。例えばidがx,yの3つのタグが付いているファイルは、[]や[x]や[x,y]と指定した場合にマッチするが、[x,y,z]と指定された場合は除外される。',
    }),
    __metadata("design:type", Array)
], ListFilesInput.prototype, "fileTagIds", void 0);
ListFilesInput = __decorate([
    type_graphql_1.InputType()
], ListFilesInput);
exports.ListFilesInput = ListFilesInput;
let EditFileTagActionInput = class EditFileTagActionInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], EditFileTagActionInput.prototype, "filename", void 0);
__decorate([
    type_graphql_1.Field(() => [String]),
    __metadata("design:type", Array)
], EditFileTagActionInput.prototype, "add", void 0);
__decorate([
    type_graphql_1.Field(() => [String]),
    __metadata("design:type", Array)
], EditFileTagActionInput.prototype, "remove", void 0);
EditFileTagActionInput = __decorate([
    type_graphql_1.InputType()
], EditFileTagActionInput);
exports.EditFileTagActionInput = EditFileTagActionInput;
let EditFileTagsInput = class EditFileTagsInput {
};
__decorate([
    type_graphql_1.Field(() => [EditFileTagActionInput]),
    __metadata("design:type", Array)
], EditFileTagsInput.prototype, "actions", void 0);
EditFileTagsInput = __decorate([
    type_graphql_1.InputType()
], EditFileTagsInput);
exports.EditFileTagsInput = EditFileTagsInput;
let FileTag = class FileTag {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FileTag.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FileTag.prototype, "name", void 0);
FileTag = __decorate([
    type_graphql_1.ObjectType()
], FileTag);
exports.FileTag = FileTag;
