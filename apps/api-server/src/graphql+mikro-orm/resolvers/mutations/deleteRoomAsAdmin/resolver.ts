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
import { ADMIN } from '../../../../roles';
import { queueLimitReached } from '../../../../utils/promiseQueue';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ResolverContext } from '../../../utils/Contexts';
import { serverTooBusyMessage } from '../../messages';
import * as Room$MikroORM from '../../../entities/room/mikro-orm';
import { RoomEventPayload } from '../../subsciptions/roomEvent/payload';
import { SendTo, all } from '../../types';
import { ensureAuthorizedUser, publishRoomEvent } from '../../utils';
import { DeleteRoomAsAdminFailureType } from '../../../../enums/DeleteRoomAsAdminFailureType';

@ArgsType()
class DeleteRoomAsAdminInput {
    @Field()
    public id!: string;
}

@ObjectType()
class DeleteRoomAsAdminResult {
    @Field(() => DeleteRoomAsAdminFailureType, { nullable: true })
    public failureType?: DeleteRoomAsAdminFailureType;
}

@Resolver()
export class DeleteRoomAsAdminResolver {
    @Mutation(() => DeleteRoomAsAdminResult, { description: 'since v0.7.2' })
    @Authorized(ADMIN)
    @UseMiddleware(RateLimitMiddleware(2))
    public async deleteRoomAsAdmin(
        @Args() args: DeleteRoomAsAdminInput,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<DeleteRoomAsAdminResult> {
        const queue = async (): Promise<{
            result: DeleteRoomAsAdminResult;
            payload: (RoomEventPayload & SendTo) | undefined;
        }> => {
            const em = context.em;
            const authorizedUserUid = ensureAuthorizedUser(context).userUid;

            const room = await em.findOne(Room$MikroORM.Room, { id: args.id });
            if (room == null) {
                return {
                    result: { failureType: DeleteRoomAsAdminFailureType.NotFound },
                    payload: undefined,
                };
            }
            const roomId = room.id;
            await Room$MikroORM.deleteRoom(em, room);
            await em.flush();
            return {
                result: { failureType: undefined },
                payload: {
                    type: 'deleteRoomPayload',
                    sendTo: all,
                    roomId,
                    deletedBy: authorizedUserUid,
                    deletedByAdmin: true,
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
