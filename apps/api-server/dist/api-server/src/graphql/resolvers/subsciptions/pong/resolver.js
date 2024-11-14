'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var pong = require('../../../objects/pong.js');
var topics = require('./topics.js');

exports.PongResolver = class PongResolver {
    pong(payload) {
        return payload;
    }
};
tslib.__decorate([
    typeGraphql.Subscription(() => pong.Pong, {
        topics: topics.PONG,
        description: 'GraphQL の動作テストに用いられます。3rd-party の Web サーバーを作成する際は利用しなくて構いません。',
    }),
    tslib.__param(0, typeGraphql.Root()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [Object]),
    tslib.__metadata("design:returntype", pong.Pong)
], exports.PongResolver.prototype, "pong", null);
exports.PongResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.PongResolver);
//# sourceMappingURL=resolver.js.map
