'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var entity = require('../../../../entities/room/entity.js');
var roomAsListItem = require('../../../../entities-graphql/roomAsListItem.js');
var GetRoomFailureType = require('../../../../enums/GetRoomFailureType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var room = require('../../../objects/room.js');
var utils = require('../../utils/utils.js');

let GetRoomAsListItemSuccessResult = class GetRoomAsListItemSuccessResult {
};
tslib.__decorate([
    typeGraphql.Field(() => room.RoomAsListItem),
    tslib.__metadata("design:type", room.RoomAsListItem)
], GetRoomAsListItemSuccessResult.prototype, "room", void 0);
GetRoomAsListItemSuccessResult = tslib.__decorate([
    typeGraphql.ObjectType()
], GetRoomAsListItemSuccessResult);
let GetRoomAsListItemFailureResult = class GetRoomAsListItemFailureResult {
};
tslib.__decorate([
    typeGraphql.Field(() => GetRoomFailureType.GetRoomFailureType),
    tslib.__metadata("design:type", String)
], GetRoomAsListItemFailureResult.prototype, "failureType", void 0);
GetRoomAsListItemFailureResult = tslib.__decorate([
    typeGraphql.ObjectType()
], GetRoomAsListItemFailureResult);
const GetRoomAsListItemResult = typeGraphql.createUnionType({
    name: 'GetRoomAsListItemResult',
    types: () => [GetRoomAsListItemSuccessResult, GetRoomAsListItemFailureResult],
    resolveType: value => {
        if ('room' in value) {
            return GetRoomAsListItemSuccessResult;
        }
        if ('failureType' in value) {
            return GetRoomAsListItemFailureResult;
        }
        return undefined;
    },
});
exports.GetRoomAsListItemResolver = class GetRoomAsListItemResolver {
    async getRoomAsListItem(roomId, context) {
        const em = context.em;
        const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
        const roomEntity = await em.findOne(entity.Room, { id: roomId });
        if (roomEntity == null) {
            return {
                failureType: GetRoomFailureType.GetRoomFailureType.NotFound,
            };
        }
        const room = await roomAsListItem.stateToGraphQL({
            roomEntity: roomEntity,
            myUserUid: authorizedUserUid,
        });
        return { room };
    }
};
tslib.__decorate([
    typeGraphql.Query(() => GetRoomAsListItemResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(1)),
    tslib.__param(0, typeGraphql.Arg('roomId')),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [String, Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.GetRoomAsListItemResolver.prototype, "getRoomAsListItem", null);
exports.GetRoomAsListItemResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.GetRoomAsListItemResolver);
//# sourceMappingURL=resolver.js.map
