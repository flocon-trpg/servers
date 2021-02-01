import { Field, ObjectType, InputType } from 'type-graphql';
import { ReplaceBooleanUpOperation, ReplaceFilePathArrayUpOperation, ReplaceNumberUpOperation } from '../../../Operations';
import { FilePath } from '../../filePath/graphql';

@ObjectType()
@InputType('RoomBgmValueStateInput')
export class RoomBgmValueState {
    @Field(() => [FilePath])
    public files!: FilePath[];

    @Field()
    public volume!: number;
}

@ObjectType()
export class RoomBgmState {
    @Field()
    public channelKey!: string

    @Field()
    public value!: RoomBgmValueState
}

@ObjectType()
@InputType('RoomBgmOperationInput')
export class RoomBgmOperation {
    @Field({ nullable: true })
    public files?: ReplaceFilePathArrayUpOperation;

    @Field({ nullable: true })
    public volume?: ReplaceNumberUpOperation;
}

@ObjectType()
@InputType('ReplaceRoomBgmOperationInput')
export class ReplaceRoomBgmOperation {
    @Field()
    public channelKey!: string;

    @Field({ nullable: true })
    public newValue?: RoomBgmValueState;
}

@ObjectType()
@InputType('UpdateRoomBgmOperationInput')
export class UpdateRoomBgmOperation {
    @Field()
    public channelKey!: string;

    @Field()
    public operation!: RoomBgmOperation;
}

@ObjectType()
@InputType('RoomBgmsOperationInput')
export class RoomBgmsOperation {
    @Field(() => [ReplaceRoomBgmOperation])
    public replace!: ReplaceRoomBgmOperation[];

    @Field(() => [UpdateRoomBgmOperation])
    public update!: UpdateRoomBgmOperation[];
}