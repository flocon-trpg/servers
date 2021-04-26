import { MaxLength } from "class-validator";
import { ArgsType, Field, InputType, Int } from "type-graphql";
import { FilePath } from "../../entities/filePath/graphql";
import { RoomOperationInput } from "../../entities/room/graphql";

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
    public text!: string;

    @Field({ nullable: true })
    @MaxLength(10)
    public textColor?: string;

    @Field()
    public channelKey!: string;

    @Field({ nullable: true })
    public characterStateId?: string;

    @Field({ nullable: true })
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
    public text!: string;

    @Field({ nullable: true })
    @MaxLength(10)
    public textColor?: string;

    @Field({ nullable: true })
    public characterStateId?: string;

    @Field({ nullable: true })
    public customName?: string;
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