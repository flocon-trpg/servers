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

let GetRoomsListSuccessResult = class GetRoomsListSuccessResult {
};
tslib.__decorate([
    typeGraphql.Field(() => [room.RoomAsListItem]),
    tslib.__metadata("design:type", Array)
], GetRoomsListSuccessResult.prototype, "rooms", void 0);
GetRoomsListSuccessResult = tslib.__decorate([
    typeGraphql.ObjectType()
], GetRoomsListSuccessResult);
let GetRoomsListFailureResult = class GetRoomsListFailureResult {
};
tslib.__decorate([
    typeGraphql.Field(() => GetRoomFailureType.GetRoomFailureType),
    tslib.__metadata("design:type", String)
], GetRoomsListFailureResult.prototype, "failureType", void 0);
GetRoomsListFailureResult = tslib.__decorate([
    typeGraphql.ObjectType()
], GetRoomsListFailureResult);
const GetRoomsListResult = typeGraphql.createUnionType({
    name: 'GetRoomsListResult',
    types: () => [GetRoomsListSuccessResult, GetRoomsListFailureResult],
    resolveType: value => {
        if ('rooms' in value) {
            return GetRoomsListSuccessResult;
        }
        if ('failureType' in value) {
            return GetRoomsListFailureResult;
        }
        return undefined;
    },
});
exports.GetRoomsListResolver = class GetRoomsListResolver {
    async getRoomsList(context) {
        const em = context.em;
        const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
        const roomModels = await em.find(entity.Room, {});
        const rooms = [];
        for (const model of roomModels) {
            rooms.push(await roomAsListItem.stateToGraphQL({
                roomEntity: model,
                myUserUid: authorizedUserUid,
            }));
        }
        return {
            rooms,
        };
    }
};
tslib.__decorate([
    typeGraphql.Query(() => GetRoomsListResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.GetRoomsListResolver.prototype, "getRoomsList", null);
exports.GetRoomsListResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.GetRoomsListResolver);
//# sourceMappingURL=resolver.js.map
