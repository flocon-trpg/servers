import { Result } from '@kizahasi/result';
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
import { ENTRY } from '../../../../roles';
import { queueLimitReached } from '../../../../utils/promiseQueue';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ResolverContext } from '../../../utils/Contexts';
import { serverTooBusyMessage } from '../../messages';
import { LeaveRoomFailureType } from '../../../../enums/LeaveRoomFailureType';
import { RoomEventPayload } from '../../subsciptions/roomEvent/payload';
import {
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    operateParticipantAndFlush,
    publishRoomEvent,
} from '../../utils';

@ObjectType()
class LeaveRoomResult {
    @Field(() => LeaveRoomFailureType, { nullable: true })
    public failureType?: LeaveRoomFailureType;
}

@Resolver()
export class LeaveRoomResolver {
    @Mutation(() => LeaveRoomResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async leaveRoom(
        @Arg('id') id: string,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<LeaveRoomResult> {
        const queue = async (): Promise<
            Result<{ result: LeaveRoomResult; payload: RoomEventPayload | undefined }>
        > => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;
            // entryしていなくても呼べる
            const findResult = await findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: id,
            });
            if (findResult == null) {
                return Result.ok({
                    result: { failureType: LeaveRoomFailureType.NotFound },
                    payload: undefined,
                });
            }
            const { me, room } = findResult;
            const participantUserUids = findResult.participantIds();
            if (me === undefined || me.role == null) {
                return Result.ok({
                    result: { failureType: LeaveRoomFailureType.NotParticipant },
                    payload: undefined,
                });
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
            return Result.ok({
                result: {},
                payload: payload,
            });
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        if (result.value.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.value.payload);
        }
        return result.value.value.result;
    }
}
