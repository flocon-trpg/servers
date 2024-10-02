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
import * as Room$MikroORM from '../../../../entities/room/entity';
import { DeleteRoomAsAdminFailureType } from '../../../../enums/DeleteRoomAsAdminFailureType';
import { ResolverContext } from '../../../../types';
import { ADMIN } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { all } from '../../types';
import { ensureAuthorizedUser, publishRoomEvent } from '../../utils/utils';

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
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async deleteRoomAsAdmin(
        @Args() args: DeleteRoomAsAdminInput,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine,
    ): Promise<DeleteRoomAsAdminResult> {
        const em = context.em;
        const authorizedUserUid = ensureAuthorizedUser(context).userUid;

        const room = await em.findOne(Room$MikroORM.Room, { id: args.id });
        if (room == null) {
            return {
                failureType: DeleteRoomAsAdminFailureType.NotFound,
            };
        }
        const roomId = room.id;
        await Room$MikroORM.deleteRoom(em, room);
        await em.flush();
        await publishRoomEvent(pubSub, {
            type: 'deleteRoomPayload',
            sendTo: all,
            roomId,
            deletedBy: authorizedUserUid,
            deletedByAdmin: true,
        });
        return {};
    }
}
