import { toOtError } from '@flocon-trpg/core';
import { loggerRef } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { Args, ArgsType, Field, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { produce } from 'immer';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { ChangeParticipantNameFailureType } from '../../../../enums/ChangeParticipantNameFailureType';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { PubSubService } from '../../../../pub-sub/pub-sub.service';
import { lockByRoomId } from '../../../../utils/asyncLock';
import { convertToMaxLength100String } from '../../../../utils/convertToMaxLength100String';
import { IdOperation, RoomNotFound, operateAsAdminAndFlush } from '../../utils/utils';

@ArgsType()
class ChangeParticipantNameArgs {
    @Field()
    public roomId!: string;

    @Field()
    public newName!: string;
}

@ObjectType()
class ChangeParticipantNameResult {
    @Field(() => ChangeParticipantNameFailureType, { nullable: true })
    public failureType?: ChangeParticipantNameFailureType;
}

@Resolver(() => ChangeParticipantNameResult)
export class ChangeParticipantNameResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly pubSubService: PubSubService,
    ) {}

    async #changeParticipantNameCore(
        args: ChangeParticipantNameArgs,
        auth: AuthDataType,
    ): Promise<ChangeParticipantNameResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUserUid = auth.user.userUid;
        const flushResult = await operateAsAdminAndFlush({
            em,
            operationType: 'state',
            operation: roomState => {
                const me = roomState.participants?.[authorizedUserUid];
                // me.role == nullのときは弾かないようにしてもいいかも？
                if (me == null || me.role == null) {
                    return Result.error(ChangeParticipantNameFailureType.NotParticipant);
                }
                const result = produce(roomState, roomState => {
                    const me = roomState.participants?.[authorizedUserUid];
                    if (me == null) {
                        return;
                    }
                    me.name = convertToMaxLength100String(args.newName);
                });
                return Result.ok(result);
            },
            roomId: args.roomId,
            roomHistCount: undefined,
        });
        if (flushResult.isError) {
            if (flushResult.error.type === 'custom') {
                return { failureType: flushResult.error.error };
            }
            throw toOtError(flushResult.error.error);
        }
        switch (flushResult.value) {
            case RoomNotFound:
                return { failureType: ChangeParticipantNameFailureType.NotFound };
            case IdOperation:
                loggerRef.debug(
                    'An operation in changeParticipantName is id. This should not happen.',
                );
                return { failureType: ChangeParticipantNameFailureType.NotParticipant };
            default:
                break;
        }
        this.pubSubService.roomEvent.next(flushResult.value);
        return {
            failureType: undefined,
        };
    }

    @Mutation(() => ChangeParticipantNameResult)
    @Auth(ENTRY)
    public async changeParticipantName(
        @Args() args: ChangeParticipantNameArgs,
        @AuthData() auth: AuthDataType,
    ): Promise<ChangeParticipantNameResult> {
        return await lockByRoomId(args.roomId, async () => {
            return await this.#changeParticipantNameCore(args, auth);
        });
    }
}
