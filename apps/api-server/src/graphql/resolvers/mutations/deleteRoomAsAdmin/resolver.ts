import { Args, ArgsType, Field, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { ADMIN, Auth } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { DeleteRoomAsAdminFailureType } from '../../../../enums/DeleteRoomAsAdminFailureType';
import * as Room$MikroORM from '../../../../mikro-orm/entities/room/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { lockByRoomId } from '../../../../utils/asyncLock';
import { all } from '../../types';

@ArgsType()
class DeleteRoomAsAdminInput {
    @Field()
    public roomId!: string;
}

@ObjectType()
class DeleteRoomAsAdminResult {
    @Field(() => DeleteRoomAsAdminFailureType, { nullable: true })
    public failureType?: DeleteRoomAsAdminFailureType;
}

@Resolver(() => DeleteRoomAsAdminResult)
export class DeleteRoomAsAdminResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
    ) {}

    async #deleteRoomAsAdminCore(
        args: DeleteRoomAsAdminInput,
        auth: AuthDataType,
    ): Promise<DeleteRoomAsAdminResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUserUid = auth.user.userUid;

        const room = await em.findOne(Room$MikroORM.Room, { id: args.roomId });
        if (room == null) {
            return {
                failureType: DeleteRoomAsAdminFailureType.NotFound,
            };
        }
        const roomId = room.id;
        await Room$MikroORM.deleteRoom(em, room);
        await em.flush();
        this.pubSubService.roomEvent.next({
            type: 'deleteRoomPayload',
            sendTo: all,
            roomId,
            deletedBy: authorizedUserUid,
            deletedByAdmin: true,
        });
        return {};
    }

    @Mutation(() => DeleteRoomAsAdminResult)
    @Auth(ADMIN)
    public async deleteRoomAsAdmin(
        @Args() args: DeleteRoomAsAdminInput,
        @AuthData() auth: AuthDataType,
    ): Promise<DeleteRoomAsAdminResult> {
        return await lockByRoomId(args.roomId, async () => {
            return await this.#deleteRoomAsAdminCore(args, auth);
        });
    }
}
