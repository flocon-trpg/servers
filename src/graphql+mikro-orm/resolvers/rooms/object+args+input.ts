import { MaxLength } from 'class-validator';
import { ArgsType, createUnionType, Field, InputType, Int, ObjectType } from 'type-graphql';
import { GetRoomConnectionFailureType } from '../../../enums/GetRoomConnectionFailureType';
import { WritingMessageStatusInputType } from '../../../enums/WritingMessageStatusInputType';
import { WritingMessageStatusType } from '../../../enums/WritingMessageStatusType';
import { FilePath } from '../../entities/filePath/graphql';
import {
    DeleteRoomOperation,
    RoomOperation,
    RoomOperationInput,
} from '../../entities/room/graphql';
import { RoomMessageEvent } from '../../entities/roomMessage/graphql';

@InputType()
export class CreateRoomInput {
    @Field()
    public roomName!: string;

    @Field()
    public participantName!: string;

    @Field({ nullable: true })
    public joinAsPlayerPhrase?: string;

    @Field({ nullable: true })
    public joinAsSpectatorPhrase?: string;
}

@ArgsType()
export class DeleteRoomArgs {
    @Field()
    public id!: string;
}

@ArgsType()
export class JoinRoomArgs {
    @Field()
    public id!: string;

    @Field()
    public name!: string;

    @Field({ nullable: true })
    public phrase?: string;
}

@ArgsType()
export class PromoteArgs {
    @Field()
    public roomId!: string;

    @Field({ nullable: true })
    public phrase?: string;
}

@ArgsType()
export class ChangeParticipantNameArgs {
    @Field()
    public roomId!: string;

    @Field()
    public newName!: string;
}

@ArgsType()
export class OperateArgs {
    @Field()
    public id!: string;

    @Field(() => Int)
    public prevRevision!: number;

    @Field(() => RoomOperationInput)
    public operation!: RoomOperationInput;

    @Field()
    @MaxLength(10)
    public requestId!: string;
}

@ArgsType()
export class GetRoomArgs {
    @Field()
    public id!: string;
}

@ArgsType()
export class WritePublicMessageArgs {
    @Field()
    public roomId!: string;

    @Field()
    @MaxLength(10_000)
    public text!: string;

    @Field({ nullable: true })
    @MaxLength(50)
    public textColor?: string;

    @Field()
    public channelKey!: string;

    @Field({ nullable: true })
    public characterStateId?: string;

    @Field({ nullable: true })
    @MaxLength(1_000)
    public customName?: string;

    @Field({ nullable: true, description: 'BCDiceのgameType。' })
    public gameType?: string;
}

@ArgsType()
export class WritePrivateMessageArgs {
    @Field()
    public roomId!: string;

    @Field(() => [String])
    public visibleTo!: string[];

    @Field()
    @MaxLength(10_000)
    public text!: string;

    @Field({ nullable: true })
    @MaxLength(10)
    public textColor?: string;

    @Field({ nullable: true })
    public characterStateId?: string;

    @Field({ nullable: true })
    @MaxLength(1_000)
    public customName?: string;

    @Field({ nullable: true, description: 'BCDiceのgameType。' })
    public gameType?: string;
}

@ArgsType()
export class WriteRoomSoundEffectArgs {
    @Field()
    public roomId!: string;

    @Field()
    public file!: FilePath;

    @Field()
    public volume!: number;
}

@ArgsType()
export class MessageIdArgs {
    @Field()
    public roomId!: string;

    @Field()
    public messageId!: string;
}

@ArgsType()
export class EditMessageArgs {
    @Field()
    public roomId!: string;

    @Field()
    public messageId!: string;

    @Field()
    public text!: string;
}

@ArgsType()
export class GetMessagesArgs {
    @Field()
    public roomId!: string;
}

@ArgsType()
export class GetLogArgs {
    @Field()
    public roomId!: string;
}

@ArgsType()
export class UpdateWritingMessageStateArgs {
    @Field()
    public roomId!: string;

    @Field(() => WritingMessageStatusInputType)
    public newStatus!: WritingMessageStatusInputType;
}

export const GetRoomConnectionSuccessResultType = 'GetRoomConnectionSuccessResultType';

@ObjectType()
export class GetRoomConnectionsSuccessResult {
    public __tstype!: typeof GetRoomConnectionSuccessResultType;

    @Field()
    public fetchedAt!: number;

    @Field(() => [String])
    public connectedUserUids!: string[];
}

export const GetRoomConnectionFailureResultType = 'GetRoomConnectionFailureResultType';

@ObjectType()
export class GetRoomConnectionsFailureResult {
    public __tstype!: typeof GetRoomConnectionFailureResultType;

    @Field(() => GetRoomConnectionFailureType)
    public failureType!: GetRoomConnectionFailureType;
}

export const GetRoomConnectionsResult = createUnionType({
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

@ObjectType()
export class RoomConnectionEvent {
    @Field()
    public userUid!: string;

    @Field()
    public isConnected!: boolean;

    @Field()
    public updatedAt!: number;
}

@ObjectType()
export class WritingMessageStatus {
    @Field()
    public userUid!: string;

    @Field(() => WritingMessageStatusType)
    public status!: WritingMessageStatusType;

    @Field()
    public updatedAt!: number;
}

@ObjectType()
export class RoomEvent {
    // 現状は、2つ以上同時にnon-nullishになることはない。

    @Field(() => RoomOperation, { nullable: true })
    public roomOperation?: RoomOperation;

    @Field(() => DeleteRoomOperation, { nullable: true })
    public deleteRoomOperation?: DeleteRoomOperation;

    @Field(() => RoomMessageEvent, { nullable: true })
    public roomMessageEvent?: typeof RoomMessageEvent;

    @Field(() => RoomConnectionEvent, { nullable: true })
    public roomConnectionEvent?: RoomConnectionEvent;

    @Field(() => WritingMessageStatus, { nullable: true })
    public writingMessageStatus?: WritingMessageStatus;
}
