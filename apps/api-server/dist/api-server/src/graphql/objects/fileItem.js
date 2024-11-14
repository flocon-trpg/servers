'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var FileListType = require('../../enums/FileListType.js');

exports.FileItem = class FileItem {
};
tslib.__decorate([
    typeGraphql.Field(() => typeGraphql.ID, {
        description: 'サーバーで管理されているファイル名。axiosなどでファイルを取得する際はこれを用いる。ソートするとアップロードした時系列順になる。',
    }),
    tslib.__metadata("design:type", String)
], exports.FileItem.prototype, "filename", void 0);
tslib.__decorate([
    typeGraphql.Field({
        nullable: true,
        description: 'サムネイル画像のファイル名。axiosなどを用いてファイルを取得する。',
    }),
    tslib.__metadata("design:type", String)
], exports.FileItem.prototype, "thumbFilename", void 0);
tslib.__decorate([
    typeGraphql.Field({ description: 'ユーザーが名付けたファイル名。' }),
    tslib.__metadata("design:type", String)
], exports.FileItem.prototype, "screenname", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", Number)
], exports.FileItem.prototype, "createdAt", void 0);
tslib.__decorate([
    typeGraphql.Field({
        description: 'ファイルをアップロードしたユーザー。Firebase AuthenticationのUserUidで表現される。',
    }),
    tslib.__metadata("design:type", String)
], exports.FileItem.prototype, "createdBy", void 0);
tslib.__decorate([
    typeGraphql.Field(() => FileListType.FileListType),
    tslib.__metadata("design:type", String)
], exports.FileItem.prototype, "listType", void 0);
exports.FileItem = tslib.__decorate([
    typeGraphql.ObjectType()
], exports.FileItem);
//# sourceMappingURL=fileItem.js.map
