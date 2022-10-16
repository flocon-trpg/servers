import {
    Arg,
    Authorized,
    Ctx,
    Field,
    Mutation,
    ObjectType,
    PubSub,
    PubSubEngine,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { ENTRY } from '../../../../utils/roles';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { LeaveRoomFailureType } from '../../../../enums/LeaveRoomFailureType';
import {
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    operateParticipantAndFlush,
    publishRoomEvent,
} from '../../utils/utils';
import { ResolverContext } from '../../../../types';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';

@ObjectType()
class LeaveRoomResult {
    @Field(() => LeaveRoomFailureType, { nullable: true })
    public failureType?: LeaveRoomFailureType;
}

@Resolver()
export class LeaveRoomResolver {
    @Mutation(() => LeaveRoomResult)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async leaveRoom(
        @Arg('id') id: string,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<LeaveRoomResult> {
        const em = context.em;
        const authorizedUserUid = ensureAuthorizedUser(context).userUid;
        // entryしていなくても呼べる
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: id,
        });
        if (findResult == null) {
            return {
                failureType: LeaveRoomFailureType.NotFound,
            };
        }
        const { me, room } = findResult;
        const participantUserUids = findResult.participantIds();
        if (me === undefined || me.role == null) {
            return {
                failureType: LeaveRoomFailureType.NotParticipant,
            };
        }
        const { payload } = await operateParticipantAndFlush({
            em,
            myUserUid: authorizedUserUid,
            update: {
                role: { newValue: undefined },
            },
            room,
            roomHistCount: context.serverConfig.roomHistCount,
            participantUserUids,
        });
        if (payload != null) {
            await publishRoomEvent(pubSub, payload);
        }
        return {};
    }
}
