'use strict';

var tslib = require('tslib');
var FilePathModule = require('@flocon-trpg/core');
var bcrypt = require('bcrypt');
var typeGraphql = require('type-graphql');
var room$1 = require('../../../../entities-graphql/room.js');
var entity$1 = require('../../../../entities/participant/entity.js');
var entity = require('../../../../entities/room/entity.js');
var CreateRoomFailureType = require('../../../../enums/CreateRoomFailureType.js');
var ParticipantRoleType = require('../../../../enums/ParticipantRoleType.js');
var roles = require('../../../../utils/roles.js');
var QueueMiddleware = require('../../../middlewares/QueueMiddleware.js');
var RateLimitMiddleware = require('../../../middlewares/RateLimitMiddleware.js');
var room = require('../../../objects/room.js');
var utils = require('../../utils/utils.js');

const bcryptSaltRounds = 10;
let CreateRoomSuccessResult = class CreateRoomSuccessResult {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], CreateRoomSuccessResult.prototype, "id", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", room.RoomGetState)
], CreateRoomSuccessResult.prototype, "room", void 0);
CreateRoomSuccessResult = tslib.__decorate([
    typeGraphql.ObjectType()
], CreateRoomSuccessResult);
let CreateRoomFailureResult = class CreateRoomFailureResult {
};
tslib.__decorate([
    typeGraphql.Field(() => CreateRoomFailureType.CreateRoomFailureType),
    tslib.__metadata("design:type", String)
], CreateRoomFailureResult.prototype, "failureType", void 0);
CreateRoomFailureResult = tslib.__decorate([
    typeGraphql.ObjectType()
], CreateRoomFailureResult);
const CreateRoomResult = typeGraphql.createUnionType({
    name: 'CreateRoomResult',
    types: () => [CreateRoomSuccessResult, CreateRoomFailureResult],
    resolveType: value => {
        if ('room' in value) {
            return CreateRoomSuccessResult;
        }
        if ('failureType' in value) {
            return CreateRoomFailureResult;
        }
        return undefined;
    },
});
let CreateRoomInput = class CreateRoomInput {
};
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], CreateRoomInput.prototype, "roomName", void 0);
tslib.__decorate([
    typeGraphql.Field(),
    tslib.__metadata("design:type", String)
], CreateRoomInput.prototype, "participantName", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], CreateRoomInput.prototype, "playerPassword", void 0);
tslib.__decorate([
    typeGraphql.Field({ nullable: true }),
    tslib.__metadata("design:type", String)
], CreateRoomInput.prototype, "spectatorPassword", void 0);
CreateRoomInput = tslib.__decorate([
    typeGraphql.InputType()
], CreateRoomInput);
exports.CreateRoomResolver = class CreateRoomResolver {
    async createRoom(input, context) {
        const em = context.em;
        const authorizedUser = utils.ensureAuthorizedUser(context);
        const newRoom = new entity.Room({
            name: input.roomName,
            createdBy: authorizedUser.userUid,
            value: {
                $v: 2,
                $r: 1,
                activeBoardId: undefined,
                characterTag1Name: 'NPC',
                characterTag2Name: undefined,
                characterTag3Name: undefined,
                characterTag4Name: undefined,
                characterTag5Name: undefined,
                characterTag6Name: undefined,
                characterTag7Name: undefined,
                characterTag8Name: undefined,
                characterTag9Name: undefined,
                characterTag10Name: undefined,
                publicChannel1Name: 'メイン',
                publicChannel2Name: 'メイン2',
                publicChannel3Name: 'メイン3',
                publicChannel4Name: 'メイン4',
                publicChannel5Name: 'メイン5',
                publicChannel6Name: 'メイン6',
                publicChannel7Name: 'メイン7',
                publicChannel8Name: 'メイン8',
                publicChannel9Name: 'メイン9',
                publicChannel10Name: 'メイン10',
                bgms: {},
                boolParamNames: {},
                boards: {},
                characters: {},
                numParamNames: {},
                strParamNames: {},
                memos: {},
            },
        });
        const newParticipant = new entity$1.Participant();
        (newParticipant.name = input.participantName),
            (newParticipant.role = ParticipantRoleType.ParticipantRoleType.Master);
        em.persist(newParticipant);
        newRoom.participants.add(newParticipant);
        authorizedUser.participants.add(newParticipant);
        if (input.playerPassword != null) {
            newRoom.playerPasswordHash = await bcrypt.hash(input.playerPassword, bcryptSaltRounds);
        }
        if (input.spectatorPassword != null) {
            newRoom.spectatorPasswordHash = await bcrypt.hash(input.spectatorPassword, bcryptSaltRounds);
        }
        const revision = newRoom.revision;
        em.persist(newRoom);
        const roomState = await room$1.GlobalRoom.MikroORM.ToGlobal.state(newRoom, em);
        const graphqlState = room$1.GlobalRoom.Global.ToGraphQL.state({
            source: roomState,
            requestedBy: { type: FilePathModule.client, userUid: authorizedUser.userUid },
        });
        await em.flush();
        return {
            room: {
                ...graphqlState,
                revision,
                createdBy: authorizedUser.userUid,
                createdAt: newRoom.createdAt?.getTime(),
                updatedAt: newRoom.completeUpdatedAt?.getTime(),
                role: newParticipant.role,
                isBookmarked: false,
            },
            id: newRoom.id,
        };
    }
};
tslib.__decorate([
    typeGraphql.Mutation(() => CreateRoomResult),
    typeGraphql.Authorized(roles.ENTRY),
    typeGraphql.UseMiddleware(QueueMiddleware.QueueMiddleware, RateLimitMiddleware.RateLimitMiddleware(2)),
    tslib.__param(0, typeGraphql.Arg('input')),
    tslib.__param(1, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [CreateRoomInput, Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.CreateRoomResolver.prototype, "createRoom", null);
exports.CreateRoomResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.CreateRoomResolver);
//# sourceMappingURL=resolver.js.map
