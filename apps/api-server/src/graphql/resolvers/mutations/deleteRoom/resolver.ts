import { Args, ArgsType, Field, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { DeleteRoomFailureType } from '../../../../enums/DeleteRoomFailureType';
import * as Room$MikroORM from '../../../../mikro-orm/entities/room/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { all } from '../../types';

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

@Resolver(() => DeleteRoomResult)
export class DeleteRoomResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
    ) {}

    @Mutation(() => DeleteRoomResult)
    @Auth(ENTRY)
    public async deleteRoom(
        @Args() args: DeleteRoomArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<DeleteRoomResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUserUid = auth.user.userUid;

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
        this.pubSubService.roomEvent.next({
            type: 'deleteRoomPayload',
            roomId,
            deletedBy: authorizedUserUid,
            deletedByAdmin: false,
            sendTo: all,
        });
        return {};
    }
}
