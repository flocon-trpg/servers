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
import { ENTRY } from '../../../../roles';
import { queueLimitReached } from '../../../../utils/promiseQueue';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ResolverContext } from '../../../utils/Contexts';
import { serverTooBusyMessage } from '../../messages';
import { RoomEventPayload } from '../../subsciptions/roomEvent/payload';
import {
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    operateParticipantAndFlush,
    publishRoomEvent,
} from '../../utils';
import { convertToMaxLength100String } from '../../../../utils/convertToMaxLength100String';
import { ChangeParticipantNameFailureType } from '../../../../enums/ChangeParticipantNameFailureType';

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
    @UseMiddleware(RateLimitMiddleware(2))
    public async changeParticipantName(
        @Args() args: ChangeParticipantNameArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ChangeParticipantNameResult> {
        const queue = async (): Promise<{
            result: ChangeParticipantNameResult;
            payload: RoomEventPayload | undefined;
        }> => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;
            const findResult = await findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return {
                    result: {
                        failureType: ChangeParticipantNameFailureType.NotFound,
                    },
                    payload: undefined,
                };
            }
            const { room, me } = findResult;
            const participantUserUids = findResult.participantIds();
            // me.role == nullのときは弾かないようにしてもいいかも？
            if (me == null || me.role == null) {
                return {
                    result: {
                        failureType: ChangeParticipantNameFailureType.NotParticipant,
                    },
                    payload: undefined,
                };
            }

            const { payload } = await operateParticipantAndFlush({
                em,
                myUserUid: authorizedUserUid,
                update: {
                    name: { newValue: convertToMaxLength100String(args.newName) },
                },
                room,
                roomHistCount: context.serverConfig.roomHistCount,
                participantUserUids,
            });

            return {
                result: {
                    failureType: undefined,
                },
                payload: payload,
            };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.payload != null) {
            await publishRoomEvent(pubSub, result.value.payload);
        }
        return result.value.result;
    }
}
