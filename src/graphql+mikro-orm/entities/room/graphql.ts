import { createUnionType, Field, InputType, ObjectType } from 'type-graphql';
import { ReplaceNullableStringUpOperation, ReplaceStringUpOperation } from '../../Operations';
import { BoardsOperation, BoardState } from './board/graphql';
import { CharacterState, CharactersOperation } from './character/graphql';
import { ParticipantsOperation, ParticipantsOperationInput, ParticipantState } from './participant/graphql';
import { RoomBgmsOperation, RoomBgmState } from './bgm/graphql';
import { ParamNamesOperation, ParamNameState } from './paramName/graphql';

@ObjectType()
export class RoomGetState {
    @Field({ description: 'Current revision of Room. Whenever Room is updated, this value is incremented by 1. This value is required when you apply RoomOperation. / Roomの現在のリビジョン。Roomが更新されるたび、この値は1増加する。RoomOperationを適用する際に必要となる。' })
    public revision!: number;


    @Field({description: 'この部屋の作成者。Firebase AuthenticationのUserUidで表現される。'})
    public createdBy!: string;

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

    @Field(() => [ParticipantState])
    public participants!: ParticipantState[];
}

@ObjectType()
export class RoomOperationValue {
    @Field()
    public boards!: BoardsOperation;

    @Field()
    public characters!: CharactersOperation;

    @Field()
    public bgms!: RoomBgmsOperation;

    @Field()
    public paramNames!: ParamNamesOperation;

    @Field()
    public participants!: ParticipantsOperation;

    @Field({ nullable: true })
    public name?: ReplaceStringUpOperation;
}

@InputType()
export class RoomOperationValueInput {
    @Field()
    public boards!: BoardsOperation;

    @Field()
    public characters!: CharactersOperation;

    @Field()
    public bgms!: RoomBgmsOperation;

    @Field()
    public paramNames!: ParamNamesOperation;

    @Field()
    public participants!: ParticipantsOperationInput;

    @Field({ nullable: true })
    public name?: ReplaceStringUpOperation;
}

export const roomOperation = 'RoomOperation';

@ObjectType()
export class RoomOperation {
    public __tstype!: typeof roomOperation;

    @Field()
    public revisionTo!: number;

    @Field()
    public operatedBy!: string;

    @Field()
    public value!: RoomOperationValue;
}

@InputType()
export class RoomOperationInput {
    @Field()
    public value!: RoomOperationValueInput;
}

export const deleteRoomOperation = 'DeleteRoomOperation';

@ObjectType()
export class DeleteRoomOperation {
    public __tstype!: typeof deleteRoomOperation;

    @Field()
    public deletedBy!: string;
}

export const RoomOperated = createUnionType({
    name: 'RoomOperated',
    types: () => [RoomOperation, DeleteRoomOperation] as const,
    resolveType: value => {
        switch(value.__tstype) {
            case roomOperation:
                return RoomOperation;
            case deleteRoomOperation:
                return DeleteRoomOperation;
        }
    }
});