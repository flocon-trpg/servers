import { toOtError } from '@flocon-trpg/core';
import { loggerRef } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { Args, Field, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { produce } from 'immer';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { LeaveRoomFailureType } from '../../../../enums/LeaveRoomFailureType';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { ServerConfigService } from '../../../../server-config/server-config.service';
import { lockByRoomId } from '../../../../utils/asyncLock';
import { IdOperation, RoomNotFound, operateAsAdminAndFlush } from '../../utils/utils';

@ObjectType()
class LeaveRoomResult {
    @Field(() => LeaveRoomFailureType, { nullable: true })
    public failureType?: LeaveRoomFailureType;
}

@Resolver(() => LeaveRoomResult)
export class LeaveRoomResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
        private readonly serverConfigService: ServerConfigService,
    ) {}

    async #leaveRoomCore(id: string, auth: AuthDataType): Promise<LeaveRoomResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUserUid = auth.user.userUid;

        const flushResult = await operateAsAdminAndFlush({
            em,
            roomId: id,
            roomHistCount: this.serverConfigService.getValueForce().roomHistCount,
            operationType: 'state',
            operation: async roomState => {
                if (roomState.participants?.[authorizedUserUid] == null) {
                    return Result.error(LeaveRoomFailureType.NotParticipant);
                }
                const nextRoomState = produce(roomState, roomState => {
                    delete roomState.participants?.[authorizedUserUid];
                });
                return Result.ok(nextRoomState);
            },
        });
        if (flushResult.isError) {
            if (flushResult.error.type === 'custom') {
                return { failureType: LeaveRoomFailureType.NotParticipant };
            }
            throw toOtError(flushResult.error.error);
        }
        switch (flushResult.value) {
            case RoomNotFound:
                return {
                    failureType: LeaveRoomFailureType.NotFound,
                };
            case IdOperation:
                loggerRef.debug('An operation in leaveRoom is id. This should not happen.');
                return { failureType: LeaveRoomFailureType.NotParticipant };
            default:
                break;
        }
        this.pubSubService.roomEvent.next(flushResult.value);
        return {};
    }

    @Mutation(() => LeaveRoomResult)
    @Auth(ENTRY)
    public async leaveRoom(
        @Args('roomId') roomId: string,
        @AuthData() auth: AuthDataType,
    ): Promise<LeaveRoomResult> {
        return await lockByRoomId(roomId, async () => await this.#leaveRoomCore(roomId, auth));
    }
}
