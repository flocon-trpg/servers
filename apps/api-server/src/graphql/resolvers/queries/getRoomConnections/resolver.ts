import { Args, Field, ObjectType, Query, Resolver, createUnionType } from '@nestjs/graphql';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { ConnectionManagerService } from '../../../../connection-manager/connection-manager.service';
import { GetRoomConnectionFailureType } from '../../../../enums/GetRoomConnectionFailureType';
import { tsTypeObject } from '../../../../graphql/tsTypeObject';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { findRoomAndMyParticipant } from '../../utils/utils';

const GetRoomConnectionSuccessResultType = 'GetRoomConnectionSuccessResultType';

@ObjectType()
class GetRoomConnectionsSuccessResult {
    public __tstype!: typeof GetRoomConnectionSuccessResultType;

    @Field()
    public fetchedAt!: number;

    @Field(() => [String])
    public connectedUserUids!: string[];
}

const GetRoomConnectionFailureResultType = 'GetRoomConnectionFailureResultType';

@ObjectType()
class GetRoomConnectionsFailureResult {
    public __tstype!: typeof GetRoomConnectionFailureResultType;

    @Field(() => GetRoomConnectionFailureType)
    public failureType!: GetRoomConnectionFailureType;
}

const GetRoomConnectionsResult = createUnionType({
    name: 'GetRoomConnectionsResult',
    types: () => [GetRoomConnectionsSuccessResult, GetRoomConnectionsFailureResult] as const,
    resolveType: value => {
        switch (tsTypeObject.parse(value).__tstype) {
            case GetRoomConnectionSuccessResultType:
                return GetRoomConnectionsSuccessResult;
            case GetRoomConnectionFailureResultType:
                return GetRoomConnectionsFailureResult;
        }
    },
});

@Resolver()
export class GetRoomConnectionsResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly connectionManagerService: ConnectionManagerService,
    ) {}

    @Query(() => GetRoomConnectionsResult, {
        description:
            '通常はこの Query を直接実行する必要はありません。@flocon-trpg/sdk を用いることで、リアルタイムに値を取得および自動更新できます。',
    })
    @Auth(ENTRY)
    public async getRoomConnections(
        @Args('roomId') roomId: string,
        @AuthData() auth: AuthDataType,
    ): Promise<typeof GetRoomConnectionsResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUserUid = auth.user.userUid;
        const findResult = await findRoomAndMyParticipant({
            em,
            userUid: authorizedUserUid,
            roomId,
        });
        if (findResult == null) {
            return {
                __tstype: GetRoomConnectionFailureResultType,
                failureType: GetRoomConnectionFailureType.RoomNotFound,
            };
        }
        const { me } = findResult;
        if (me?.role === undefined) {
            return {
                __tstype: GetRoomConnectionFailureResultType,
                failureType: GetRoomConnectionFailureType.NotParticipant,
            };
        }

        return {
            __tstype: GetRoomConnectionSuccessResultType,
            connectedUserUids: [
                ...(await this.connectionManagerService.value.listRoomConnections({ roomId })),
            ]
                .filter(([, value]) => value > 0)
                .map(([key]) => key),
            fetchedAt: new Date().getTime(),
        };
    }
}
