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
import { DeleteRoomFailureType } from '../../../../enums/DeleteRoomFailureType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { all } from '../../types';
import { ensureAuthorizedUser, publishRoomEvent } from '../../utils/utils';

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
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async deleteRoom(
        @Args() args: DeleteRoomArgs,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<DeleteRoomResult> {
        const em = context.em;
        const authorizedUserUid = ensureAuthorizedUser(context).userUid;

        // そのRoomのParticipantでない場合でも削除できるようになっている。ただし、もしキック機能が実装されて部屋作成者がキックされた場合は再考の余地があるか。

        const room = await em.findOne(Room$MikroORM.Room, { id: args.id });
        if (room == null) {
            return {
                failureType: DeleteRoomFailureType.NotFound,
            };
        }
        const roomId = room.id;
        if (room.createdBy !== authorizedUserUid) {
            return {
                failureType: DeleteRoomFailureType.NotCreatedByYou,
            };
        }
        await Room$MikroORM.deleteRoom(em, room);
        await em.flush();
        await publishRoomEvent(pubSub, {
            type: 'deleteRoomPayload',
            roomId,
            deletedBy: authorizedUserUid,
            deletedByAdmin: false,
            sendTo: all,
        });
        return {};
    }
}
