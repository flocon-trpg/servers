import { GetRoomMessagesFailureType } from '@flocon-trpg/typed-document-node-v0.7.8';
import { Result } from '@kizahasi/result';
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
import { ENTRY } from '../../../../utils/roles';
import { queueLimitReached } from '../../../../utils/promiseQueue';
import {
    GetRoomMessagesFailureResultType,
    GetRoomMessagesResult,
} from '../../../objects/roomMessage';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { serverTooBusyMessage } from '../../messages';
import {
    ensureAuthorizedUser,
    findRoomAndMyParticipant,
    getRoomMessagesFromDb,
} from '../../utils/utils';
import { ResolverContext } from '../../../../types';

@ArgsType()
class GetMessagesArgs {
    @Field()
    public roomId!: string;
}

@Resolver()
export class GetRoomMessagesResolver {
    @Query(() => GetRoomMessagesResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(10))
    public async getMessages(
        @Args() args: GetMessagesArgs,
        @Ctx() context: ResolverContext
    ): Promise<typeof GetRoomMessagesResult> {
        const queue = async (): Promise<Result<typeof GetRoomMessagesResult>> => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;
            const findResult = await findRoomAndMyParticipant({
                em,
                userUid: authorizedUserUid,
                roomId: args.roomId,
            });
            if (findResult == null) {
                return Result.ok({
                    __tstype: GetRoomMessagesFailureResultType,
                    failureType: GetRoomMessagesFailureType.RoomNotFound,
                });
            }
            const { room, me } = findResult;
            if (me?.role === undefined) {
                return Result.ok({
                    __tstype: GetRoomMessagesFailureResultType,
                    failureType: GetRoomMessagesFailureType.NotParticipant,
                });
            }

            const messages = await getRoomMessagesFromDb(room, authorizedUserUid, 'default');
            return Result.ok(messages);
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        if (result.value.isError) {
            throw result.value.error;
        }
        return result.value.value;
    }
}
