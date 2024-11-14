'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var pong = require('../../../objects/pong.js');
var topics = require('../../subsciptions/pong/topics.js');

exports.PingResolver = class PingResolver {
    async ping(value, context, pubSub) {
        const createdBy = context.decodedIdToken?.isError === false
            ? context.decodedIdToken.value.uid
            : undefined;
        const payload = { value, createdBy };
        await pubSub.publish(topics.PONG, payload);
        return payload;
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => pong.Pong, {
        description: 'GraphQL の動作テストに用いられます。3rd-party の Web サーバーを作成する際は利用しなくて構いません。',
    }),
    tslib.__param(0, typeGraphql.Arg('value')),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__param(2, typeGraphql.PubSub()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [Number, Object, typeGraphql.PubSubEngine]),
    tslib.__metadata("design:returntype", Promise)
], exports.PingResolver.prototype, "ping", null);
exports.PingResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.PingResolver);
//# sourceMappingURL=resolver.js.map
