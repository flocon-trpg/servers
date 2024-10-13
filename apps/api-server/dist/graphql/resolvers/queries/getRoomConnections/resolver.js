'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var GetRoomConnectionFailureType = require('../../../../enums/GetRoomConnectionFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var utils = require('../../utils/utils.js');

const GetRoomConnectionSuccessResultType = 'GetRoomConnectionSuccessResultType';
let GetRoomConnectionsSuccessResult = class GetRoomConnectionsSuccessResult {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", Number)
], GetRoomConnectionsSuccessResult.prototype, "fetchedAt", void 0);
tslib.__decorate([
    typeGraphql.Field(() => [String]),
    tslib.__metadata("design:type", Array)
], GetRoomConnectionsSuccessResult.prototype, "connectedUserUids", void 0);
GetRoomConnectionsSuccessResult = tslib.__decorate([
    typeGraphql.ObjectType()
], GetRoomConnectionsSuccessResult);
const GetRoomConnectionFailureResultType = 'GetRoomConnectionFailureResultType';
let GetRoomConnectionsFailureResult = class GetRoomConnectionsFailureResult {
};
tslib.__decorate([
    typeGraphql.Field(() => GetRoomConnectionFailureType.GetRoomConnectionFailureType),
    tslib.__metadata("design:type", String)
], GetRoomConnectionsFailureResult.prototype, "failureType", void 0);
GetRoomConnectionsFailureResult = tslib.__decorate([
    typeGraphql.ObjectType()
], GetRoomConnectionsFailureResult);
const GetRoomConnectionsResult = typeGraphql.createUnionType({
    name: 'GetRoomConnectionsResult',
    types: () => [GetRoomConnectionsSuccessResult, GetRoomConnectionsFailureResult],
    resolveType: value => {
        switch (value.__tstype) {
            case GetRoomConnectionSuccessResultType:
                return GetRoomConnectionsSuccessResult;
            case GetRoomConnectionFailureResultType:
                return GetRoomConnectionsFailureResult;
        }
    },
});
exports.GetRoomConnectionsResolver = class GetRoomConnectionsResolver {
    async getRoomConnections(roomId, context) {
        const em = context.em;
        const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
        const findResult = await utils.findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId,
        });
        if (findResult == null) {
            return {
                __tstype: GetRoomConnectionFailureResultType,
                failureType: GetRoomConnectionFailureType.GetRoomConnectionFailureType.RoomNotFound,
            };
        }
        const { me } = findResult;
        if (me?.role === undefined) {
            return {
                __tstype: GetRoomConnectionFailureResultType,
                failureType: GetRoomConnectionFailureType.GetRoomConnectionFailureType.NotParticipant,
            };
        }
        return {
            __tstype: GetRoomConnectionSuccessResultType,
            connectedUserUids: [
                ...(await context.connectionManager.listRoomConnections({ roomId })),
            ]
                .filter(([, value]) => value > 0)
                .map(([key]) => key),
            fetchedAt: new Date().getTime(),
        };
    }
};
tslib.__decorate([
    typeGraphql.Query(() => GetRoomConnectionsResult, {
        description: '通常はこの Query を直接実行する必要はありません。@flocon-trpg/sdk を用いることで、リアルタイムに値を取得および自動更新できます。',
    }),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Arg('roomId')),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [String, Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.GetRoomConnectionsResolver.prototype, "getRoomConnections", null);
exports.GetRoomConnectionsResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.GetRoomConnectionsResolver);
//# sourceMappingURL=resolver.js.map
