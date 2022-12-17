import { toOtError } from '@flocon-trpg/core';
import { loggerRef } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { produce } from 'immer';
import {
    Args,
    ArgsType,
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
import { ChangeParticipantNameFailureType } from '../../../../enums/ChangeParticipantNameFailureType';
import { ResolverContext } from '../../../../types';
import { convertToMaxLength100String } from '../../../../utils/convertToMaxLength100String';
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

@ArgsType()
class ChangeParticipantNameArgs {
    @Field()
    public roomId!: string;

    @Field()
    public newName!: string;
}

@ObjectType()
class ChangeParticipantNameResult {
    @Field(() => ChangeParticipantNameFailureType, { nullable: true })
    public failureType?: ChangeParticipantNameFailureType;
}

@Resolver()
export class ChangeParticipantNameResolver {
    @Mutation(() => ChangeParticipantNameResult)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async changeParticipantName(
        @Args() args: ChangeParticipantNameArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ChangeParticipantNameResult> {
        const em = context.em;
        const authorizedUserUid = ensureAuthorizedUser(context).userUid;
        const flushResult = await operateAsAdminAndFlush({
            em,
            operationType: 'state',
            operation: roomState => {
                const me = roomState.participants?.[authorizedUserUid];
                // me.role == nullのときは弾かないようにしてもいいかも？
                if (me == null || me.role == null) {
                    return Result.error(ChangeParticipantNameFailureType.NotParticipant);
                }
                const result = produce(roomState, roomState => {
                    const me = roomState.participants?.[authorizedUserUid];
                    if (me == null) {
                        return;
                    }
                    me.name = convertToMaxLength100String(args.newName);
                });
                return Result.ok(result);
            },
            roomId: args.roomId,
            roomHistCount: undefined,
        });
        if (flushResult.isError) {
            if (flushResult.error.type === 'custom') {
                return { failureType: flushResult.error.error };
            }
            throw toOtError(flushResult.error.error);
        }
        switch (flushResult.value) {
            case RoomNotFound:
                return { failureType: ChangeParticipantNameFailureType.NotFound };
            case IdOperation:
                loggerRef.debug(
                    'An operation in changeParticipantName is id. This should not happen.'
                );
                return { failureType: ChangeParticipantNameFailureType.NotParticipant };
            default:
                break;
        }
        await publishRoomEvent(pubSub, flushResult.value);
        return {
            failureType: undefined,
        };
    }
}
