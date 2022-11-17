'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var typeGraphql = require('type-graphql');
var room$1 = require('../../../../entities-graphql/room.js');
var roomAsListItem = require('../../../../entities-graphql/roomAsListItem.js');
var isBookmarked = require('../../../../entities/room/isBookmarked.js');
var role = require('../../../../entities/room/role.js');
var GetRoomFailureType = require('../../../../enums/GetRoomFailureType.js');
var ParticipantRoleType = require('../../../../enums/ParticipantRoleType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var room = require('../../../objects/room.js');
var utils = require('../../utils/utils.js');

let GetRoomArgs = class GetRoomArgs {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], GetRoomArgs.prototype, "id", void 0);
GetRoomArgs = tslib.__decorate([
    typeGraphql.ArgsType()
], GetRoomArgs);
let GetJoinedRoomResult = class GetJoinedRoomResult {
};
tslib.__decorate([
    typeGraphql.Field(() => ParticipantRoleType.ParticipantRoleType, {
        description: '自分の現在のParticipantRoleType。room.roleと同じ値をとる。',
    }),
    tslib.__metadata("design:type", String)
], GetJoinedRoomResult.prototype, "role", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", room.RoomGetState)
], GetJoinedRoomResult.prototype, "room", void 0);
GetJoinedRoomResult = tslib.__decorate([
    typeGraphql.ObjectType()
], GetJoinedRoomResult);
let GetNonJoinedRoomResult = class GetNonJoinedRoomResult {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", room.RoomAsListItem)
], GetNonJoinedRoomResult.prototype, "roomAsListItem", void 0);
GetNonJoinedRoomResult = tslib.__decorate([
    typeGraphql.ObjectType()
], GetNonJoinedRoomResult);
let GetRoomFailureResult = class GetRoomFailureResult {
};
tslib.__decorate([
    typeGraphql.Field(() => GetRoomFailureType.GetRoomFailureType),
    tslib.__metadata("design:type", String)
], GetRoomFailureResult.prototype, "failureType", void 0);
GetRoomFailureResult = tslib.__decorate([
    typeGraphql.ObjectType()
], GetRoomFailureResult);
const GetRoomResult = typeGraphql.createUnionType({
    name: 'GetRoomResult',
    types: () => [GetJoinedRoomResult, GetNonJoinedRoomResult, GetRoomFailureResult],
    resolveType: value => {
        if ('room' in value) {
            return GetJoinedRoomResult;
        }
        if ('roomAsListItem' in value) {
            return GetNonJoinedRoomResult;
        }
        if ('failureType' in value) {
            return GetRoomFailureResult;
        }
        return undefined;
    },
});
exports.GetRoomResolver = class GetRoomResolver {
    async getRoom(args, context) {
        const em = context.em;
        const authorizedUserUid = utils.ensureAuthorizedUser(context).userUid;
        const findResult = await utils.findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.id,
        });
        if (findResult == null) {
            return {
                failureType: GetRoomFailureType.GetRoomFailureType.NotFound,
            };
        }
        const { room, me } = findResult;
        if (me?.role == null) {
            return {
                roomAsListItem: await roomAsListItem.stateToGraphQL({
                    roomEntity: room,
                    myUserUid: authorizedUserUid,
                }),
            };
        }
        const roomState = await room$1.GlobalRoom.MikroORM.ToGlobal.state(room, em);
        return {
            role: ParticipantRoleType.stringToParticipantRoleType(me.role),
            room: {
                ...room$1.GlobalRoom.Global.ToGraphQL.state({
                    source: roomState,
                    requestedBy: { type: FilePathModule.client, userUid: authorizedUserUid },
                }),
                revision: room.revision,
                createdBy: room.createdBy,
                createdAt: room.createdAt?.getTime(),
                updatedAt: room.completeUpdatedAt?.getTime(),
                role: await role.role({
                    roomEntity: room,
                    myUserUid: authorizedUserUid,
                }),
                isBookmarked: await isBookmarked.isBookmarked({
                    roomEntity: room,
                    myUserUid: authorizedUserUid,
                }),
            },
        };
    }
};
tslib.__decorate([
    typeGraphql.Query(() => GetRoomResult, {
        description: '通常はこの Query を直接実行する必要はありません。@flocon-trpg/sdk を用いることで、リアルタイムに Room を取得および自動更新できます。',
    }),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Args()),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [GetRoomArgs, Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.GetRoomResolver.prototype, "getRoom", null);
exports.GetRoomResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.GetRoomResolver);
//# sourceMappingURL=resolver.js.map
