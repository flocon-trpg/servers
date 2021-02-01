import { createUnionType, Field, InputType, ObjectType } from 'type-graphql';
import { ReplaceNullableStringUpOperation, ReplaceStringUpOperation } from '../../Operations';
import { BoardsOperation, BoardState } from '../board/graphql';
import { CharacterState, CharactersOperation } from '../character/graphql';
import { Participant } from '../participant/graphql';
import { RoomBgmsOperation, RoomBgmState } from './bgm/graphql';
import { ParamNamesOperation, ParamNameState } from './paramName/graphql';

@ObjectType()
export class RoomGetState {
    @Field()
    public revision!: number;

    @Field()
    public name!: string;

    @Field(() => [BoardState])
    public boards!: BoardState[];

    @Field(() => [CharacterState])
    public characters!: CharacterState[];

    @Field(() => [RoomBgmState])
    public bgms!: RoomBgmState[];

    @Field(() => [ParamNameState])
    public paramNames!: ParamNameState[];

    @Field(() => [Participant])
    public participants!: Participant[];
}

@ObjectType()
@InputType('RoomOperationValueInput')
export class RoomOperationValue {
    @Field()
    public boards!: BoardsOperation;

    @Field()
    public characters!: CharactersOperation;

    @Field()
    public bgms!: RoomBgmsOperation;

    @Field()
    public paramNames!: ParamNamesOperation;


    @Field({ nullable: true })
    public name?: ReplaceStringUpOperation;
}

@InputType()
export class RoomOperationInput {
    @Field()
    public value!: RoomOperationValue;
}

@ObjectType()
export class RoomOperation {
    @Field()
    public revisionTo!: number;

    @Field()
    public operatedBy!: string;

    @Field()
    public value!: RoomOperationValue;
}

@ObjectType()
export class DeleteRoomOperation {
    @Field()
    public deletedBy!: string;
}

export const RoomOperated = createUnionType({
    name: 'RoomOperated',
    types: () => [RoomOperation, DeleteRoomOperation] as const,
    resolveType: value => {
        if ('revisionTo' in value) {
            return RoomOperation;
        }
        if ('deletedBy' in value) {
            return DeleteRoomOperation;
        }
        return undefined;
    }
});