import { client } from '@flocon-trpg/core';
import {
    Args,
    Field,
    InputType,
    Mutation,
    ObjectType,
    Resolver,
    createUnionType,
} from '@nestjs/graphql';
import { hash } from 'bcrypt';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { GlobalRoom } from '../../../../entities-graphql/room';
import { CreateRoomFailureType } from '../../../../enums/CreateRoomFailureType';
import { ParticipantRoleType } from '../../../../enums/ParticipantRoleType';
import * as Participant$MikroORM from '../../../../mikro-orm/entities/participant/entity';
import * as Room$MikroORM from '../../../../mikro-orm/entities/room/entity';
import { User } from '../../../../mikro-orm/entities/user/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { RoomGetState } from '../../../objects/room';

const bcryptSaltRounds = 10;

@ObjectType()
class CreateRoomSuccessResult {
    @Field()
    public roomId!: string;

    @Field()
    public room!: RoomGetState;
}

@ObjectType()
class CreateRoomFailureResult {
    @Field(() => CreateRoomFailureType)
    public failureType!: CreateRoomFailureType;
}

const CreateRoomResult = createUnionType({
    name: 'CreateRoomResult',
    types: () => [CreateRoomSuccessResult, CreateRoomFailureResult] as const,
    resolveType: value => {
        if ('room' in value) {
            return CreateRoomSuccessResult;
        }
        if ('failureType' in value) {
            return CreateRoomFailureResult;
        }
        return undefined;
    },
});

@InputType()
class CreateRoomInput {
    @Field()
    public roomName!: string;

    @Field()
    public participantName!: string;

    @Field({ nullable: true })
    public playerPassword?: string;

    @Field({ nullable: true })
    public spectatorPassword?: string;
}

@Resolver(() => CreateRoomResult)
export class CreateRoomResolver {
    public constructor(private readonly mikroOrmService: MikroOrmService) {}

    @Mutation(() => CreateRoomResult)
    @Auth(ENTRY)
    public async createRoom(
        @Args('input') input: CreateRoomInput,
        @AuthData() auth: AuthDataType,
    ): Promise<typeof CreateRoomResult> {
        const em = await this.mikroOrmService.forkEmForMain();
        const authorizedUser = await em.findOneOrFail(User, { userUid: auth.user.userUid });

        const newRoom = new Room$MikroORM.Room({
            name: input.roomName,
            createdBy: authorizedUser.userUid,
            value: {
                $v: 2,
                $r: 1,
                activeBoardId: undefined,
                characterTag1Name: 'NPC',
                characterTag2Name: undefined,
                characterTag3Name: undefined,
                characterTag4Name: undefined,
                characterTag5Name: undefined,
                characterTag6Name: undefined,
                characterTag7Name: undefined,
                characterTag8Name: undefined,
                characterTag9Name: undefined,
                characterTag10Name: undefined,
                publicChannel1Name: 'メイン',
                publicChannel2Name: 'メイン2',
                publicChannel3Name: 'メイン3',
                publicChannel4Name: 'メイン4',
                publicChannel5Name: 'メイン5',
                publicChannel6Name: 'メイン6',
                publicChannel7Name: 'メイン7',
                publicChannel8Name: 'メイン8',
                publicChannel9Name: 'メイン9',
                publicChannel10Name: 'メイン10',
                bgms: {},
                boolParamNames: {},
                boards: {},
                characters: {},
                numParamNames: {},
                rollCalls: {},
                strParamNames: {},
                memos: {},
            },
        });

        const newParticipant = new Participant$MikroORM.Participant();
        newParticipant.name = input.participantName;
        newParticipant.role = ParticipantRoleType.Master;
        em.persist(newParticipant);
        newRoom.participants.add(newParticipant);
        authorizedUser.participants.add(newParticipant);

        // このRoomのroomOperatedを購読しているユーザーはいないので、roomOperatedは実行する必要がない。
        if (input.playerPassword != null) {
            newRoom.playerPasswordHash = await hash(input.playerPassword, bcryptSaltRounds);
        }
        if (input.spectatorPassword != null) {
            newRoom.spectatorPasswordHash = await hash(input.spectatorPassword, bcryptSaltRounds);
        }
        const revision = newRoom.revision;
        em.persist(newRoom);

        const roomState = await GlobalRoom.MikroORM.ToGlobal.state(newRoom, em);
        const graphqlState = GlobalRoom.Global.ToGraphQL.state({
            source: roomState,
            requestedBy: { type: client, userUid: authorizedUser.userUid },
        });
        await em.flush();
        return {
            room: {
                ...graphqlState,
                revision,
                createdBy: authorizedUser.userUid,

                // CONSIDER: entityから取得するのではなく、new Date() の結果を返してもいいかもしれない
                createdAt: newRoom.createdAt?.getTime(),
                updatedAt: newRoom.completeUpdatedAt?.getTime(),
                role: newParticipant.role,
                isBookmarked: false,
            },
            roomId: newRoom.id,
        };
    }
}
