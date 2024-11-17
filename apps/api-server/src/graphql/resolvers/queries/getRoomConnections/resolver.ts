import {
    Arg,
    Authorized,
    Ctx,
    Field,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
    createUnionType,
} from 'type-graphql';
import { GetRoomConnectionFailureType } from '../../../../enums/GetRoomConnectionFailureType';
import { ResolverContext } from '../../../../types';
import { ENTRY } from '../../../../utils/roles';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { ensureAuthorizedUser, findRoomAndMyParticipant } from '../../utils/utils';

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
        switch (value.__tstype) {
            case GetRoomConnectionSuccessResultType:
                return GetRoomConnectionsSuccessResult;
            case GetRoomConnectionFailureResultType:
                return GetRoomConnectionsFailureResult;
        }
    },
});

@Resolver()
export class GetRoomConnectionsResolver {
    @Query(() => GetRoomConnectionsResult, {
        description:
            '通常はこの Query を直接実行する必要はありません。@flocon-trpg/sdk を用いることで、リアルタイムに値を取得および自動更新できます。',
    })
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
    public async getRoomConnections(
        @Arg('roomId') roomId: string,
        @Ctx() context: ResolverContext,
    ): Promise<typeof GetRoomConnectionsResult> {
        const em = context.em;
        const authorizedUserUid = ensureAuthorizedUser(context).userUid;
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
                ...(await context.connectionManager.listRoomConnections({ roomId })),
            ]
                .filter(([, value]) => value > 0)
                .map(([key]) => key),
            fetchedAt: new Date().getTime(),
        };
    }
}
