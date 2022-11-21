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
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    operateParticipantAndFlush,
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
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                failureType: ChangeParticipantNameFailureType.NotFound,
            };
        }
        const { room, me } = findResult;
        const participantUserUids = findResult.participantIds();
        // me.role == nullのときは弾かないようにしてもいいかも？
        if (me == null || me.role == null) {
            return {
                failureType: ChangeParticipantNameFailureType.NotParticipant,
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

        if (payload != null) {
            await publishRoomEvent(pubSub, payload);
        }
        return {
            failureType: undefined,
        };
    }
}
