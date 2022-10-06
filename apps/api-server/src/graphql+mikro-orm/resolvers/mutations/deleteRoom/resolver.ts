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
import * as Room$MikroORM from '../../../entities/room/mikro-orm';
import { DeleteRoomFailureType } from '../../../../enums/DeleteRoomFailureType';
import { RoomEventPayload } from '../../subsciptions/roomEvent/payload';
import { all } from '../../types';
import { ensureAuthorizedUser, publishRoomEvent } from '../../utils';

@ArgsType()
class DeleteRoomArgs {
    @Field()
    public id!: string;
}

@ObjectType()
class DeleteRoomResult {
    @Field(() => DeleteRoomFailureType, { nullable: true })
    public failureType?: DeleteRoomFailureType;
}

@Resolver()
export class DeleteRoomResolver {
    @Mutation(() => DeleteRoomResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async deleteRoom(
        @Args() args: DeleteRoomArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<DeleteRoomResult> {
        const queue = async (): Promise<{
            result: DeleteRoomResult;
            payload: RoomEventPayload | undefined;
        }> => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;

            // そのRoomのParticipantでない場合でも削除できるようになっている。ただし、もしキック機能が実装されて部屋作成者がキックされた場合は再考の余地があるか。

            const room = await em.findOne(Room$MikroORM.Room, { id: args.id });
            if (room == null) {
                return {
                    result: { failureType: DeleteRoomFailureType.NotFound },
                    payload: undefined,
                };
            }
            const roomId = room.id;
            if (room.createdBy !== authorizedUserUid) {
                return {
                    result: { failureType: DeleteRoomFailureType.NotCreatedByYou },
                    payload: undefined,
                };
            }
            await Room$MikroORM.deleteRoom(em, room);
            await em.flush();
            return {
                result: { failureType: undefined },
                payload: {
                    type: 'deleteRoomPayload',
                    roomId,
                    deletedBy: authorizedUserUid,
                    deletedByAdmin: false,
                    sendTo: all,
                },
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
