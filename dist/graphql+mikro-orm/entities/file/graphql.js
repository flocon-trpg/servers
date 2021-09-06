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
exports.FileItem = void 0;
const type_graphql_1 = require("type-graphql");
let FileItem = class FileItem {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.ID, {
        description: 'サーバーで管理されているファイル名。axiosなどでファイルを取得する際はこれを用いる。ソートするとアップロードした時系列順になる。',
    }),
    __metadata("design:type", String)
], FileItem.prototype, "filename", void 0);
__decorate([
    type_graphql_1.Field({ description: 'ユーザーが名付けたファイル名。' }),
    __metadata("design:type", String)
], FileItem.prototype, "screenname", void 0);
__decorate([
    type_graphql_1.Field({
        description: 'ファイルをアップロードしたユーザー。Firebase AuthenticationのUserUidで表現される。',
    }),
    __metadata("design:type", String)
], FileItem.prototype, "createdBy", void 0);
FileItem = __decorate([
    type_graphql_1.ObjectType()
], FileItem);
exports.FileItem = FileItem;
