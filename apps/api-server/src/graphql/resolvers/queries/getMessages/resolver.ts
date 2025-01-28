import { Args, ArgsType, Field, Query, Resolver } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { GetRoomMessagesFailureType } from '../../../../enums/GetRoomMessagesFailureType';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { lockByRoomId } from '../../../../utils/asyncLock';
import {
    GetRoomMessagesFailureResultType,
    GetRoomMessagesResult,
} from '../../../objects/roomMessage';
import { findRoomAndMyParticipant, getRoomMessagesFromDb } from '../../utils/utils';

@ArgsType()
class GetMessagesArgs {
    @Field()
    public roomId!: string;
}

@Resolver()
export class GetRoomMessagesResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
    ) {}

    async #getMessagesCore(
        args: GetMessagesArgs,
        auth: AuthDataType,
    ): Promise<typeof GetRoomMessagesResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUserUid = auth.user.userUid;
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

    @Query(() => GetRoomMessagesResult)
    @Auth(ENTRY)
    public async getMessages(
        @Args() args: GetMessagesArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<typeof GetRoomMessagesResult> {
        // lock が必要かどうかは微妙
        return await lockByRoomId(args.roomId, async () => {
            return await this.#getMessagesCore(args, auth);
        });
    }
}
