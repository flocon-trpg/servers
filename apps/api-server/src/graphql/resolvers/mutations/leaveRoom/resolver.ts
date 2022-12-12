import { toOtError } from '@flocon-trpg/core';
import { loggerRef } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import produce from 'immer';
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
import { LeaveRoomFailureType } from '../../../../enums/LeaveRoomFailureType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import {
    IdOperation,
    RoomNotFound,
    ensureAuthorizedUser,
    operateAsAdminAndFlush,
    publishRoomEvent,
} from '../../utils/utils';

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

        const flushResult = await operateAsAdminAndFlush({
            em,
            roomId: id,
            roomHistCount: context.serverConfig.roomHistCount,
            operationType: 'state',
            operation: async roomState => {
                if (roomState.participants?.[authorizedUserUid] == null) {
                    return Result.error(LeaveRoomFailureType.NotParticipant);
                }
                const nextRoomState = produce(roomState, roomState => {
                    delete roomState.participants?.[authorizedUserUid];
                });
                return Result.ok(nextRoomState);
            },
        });
        if (flushResult.isError) {
            if (flushResult.error.type === 'custom') {
                return { failureType: LeaveRoomFailureType.NotParticipant };
            }
            throw toOtError(flushResult.error.error);
        }
        switch (flushResult.value) {
            case RoomNotFound:
                return {
                    failureType: LeaveRoomFailureType.NotFound,
                };
            case IdOperation:
                loggerRef.debug('An operation in leaveRoom is id. This should not happen.');
                return { failureType: LeaveRoomFailureType.NotParticipant };
            default:
                break;
        }
        await publishRoomEvent(pubSub, flushResult.value);
        return {};
    }
}
