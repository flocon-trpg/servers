import {
    Args,
    ArgsType,
    Authorized,
    Ctx,
    Field,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { GetRoomMessagesFailureType } from '../../../../enums/GetRoomMessagesFailureType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import {
    GetRoomMessagesFailureResultType,
    GetRoomMessagesResult,
} from '../../../objects/roomMessage';
import {
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    getRoomMessagesFromDb,
} from '../../utils/utils';

@ArgsType()
class GetMessagesArgs {
    @Field()
    public roomId!: string;
}

@Resolver()
export class GetRoomMessagesResolver {
    @Query(() => GetRoomMessagesResult)
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(10))
    public async getMessages(
        @Args() args: GetMessagesArgs,
        @Ctx() context: ResolverContext
    ): Promise<typeof GetRoomMessagesResult> {
        const em = context.em;
        const authorizedUserUid = ensureAuthorizedUser(context).userUid;
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId: args.roomId,
        });
        if (findResult == null) {
            return {
                __tstype: GetRoomMessagesFailureResultType,
                failureType: GetRoomMessagesFailureType.RoomNotFound,
            };
        }
        const { room, me } = findResult;
        if (me?.role === undefined) {
            return {
                __tstype: GetRoomMessagesFailureResultType,
                failureType: GetRoomMessagesFailureType.NotParticipant,
            };
        }

        const messages = await getRoomMessagesFromDb(room, authorizedUserUid, 'default');
        return messages;
    }
}
