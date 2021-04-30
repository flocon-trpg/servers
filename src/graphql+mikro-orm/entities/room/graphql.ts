import { createUnionType, Field, InputType, ObjectType } from 'type-graphql';
import { ReplaceNullableStringUpOperation, ReplaceStringUpOperation } from '../../Operations';
import { BoardsOperation, BoardState } from './board/graphql';
import { CharacterState, CharactersOperation } from './character/graphql';
import { ParticipantsOperation, ParticipantsOperationInput, ParticipantState } from './participant/graphql';
import { RoomBgmsOperation, RoomBgmState } from './bgm/graphql';
import { ParamNamesOperation, ParamNameState } from './paramName/graphql';
import { MaxLength } from 'class-validator';
import { MyValueLog, MyValueLogType, RoomPrivateMessage, RoomPrivateMessageType, RoomPrivateMessageUpdate, RoomPrivateMessageUpdateType, RoomPublicChannel, RoomPublicChannelType, RoomPublicChannelUpdate, RoomPublicChannelUpdateType, RoomPublicMessage, RoomPublicMessageType, RoomPublicMessageUpdate, RoomPublicMessageUpdateType, RoomSoundEffect, RoomSoundEffectType } from '../roomMessage/graphql';

@ObjectType()
export class RoomGetState {
    @Field({ description: 'Current revision of Room. Whenever Room is updated, this value is incremented by 1. This value is required when you apply RoomOperation. / Roomの現在のリビジョン。Roomが更新されるたび、この値は1増加する。RoomOperationを適用する際に必要となる。' })
    public revision!: number;


    @Field({ description: 'この部屋の作成者。Firebase AuthenticationのUserUidで表現される。' })
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

    @Field()
    public publicChannel1Name!: string;
    @Field()
    public publicChannel2Name!: string;
    @Field()
    public publicChannel3Name!: string;
    @Field()
    public publicChannel4Name!: string;
    @Field()
    public publicChannel5Name!: string;
    @Field()
    public publicChannel6Name!: string;
    @Field()
    public publicChannel7Name!: string;
    @Field()
    public publicChannel8Name!: string;
    @Field()
    public publicChannel9Name!: string;
    @Field()
    public publicChannel10Name!: string;
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

    @Field({ nullable: true })
    public publicChannel1Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel2Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel3Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel4Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel5Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel6Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel7Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel8Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel9Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel10Name?: ReplaceStringUpOperation;
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

    @Field({ nullable: true })
    public publicChannel1Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel2Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel3Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel4Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel5Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel6Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel7Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel8Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel9Name?: ReplaceStringUpOperation;
    @Field({ nullable: true })
    public publicChannel10Name?: ReplaceStringUpOperation;
}

@ObjectType()
export class OperatedBy {
    @Field()
    public userUid!: string;

    @Field()
    public clientId!: string;
}

export const roomOperation = 'RoomOperation';

@ObjectType()
export class RoomOperation {
    public __tstype!: typeof roomOperation;

    @Field()
    public revisionTo!: number;

    @Field(() => OperatedBy, { nullable: true, description: 'operateRoomを呼んだ人物。promoteなどの結果の場合はnullishになる。' })
    public operatedBy?: OperatedBy;

    @Field()
    public value!: RoomOperationValue;
}

@InputType()
export class RoomOperationInput {
    @Field()
    public value!: RoomOperationValueInput;

    @Field({ description: 'クライアントを識別するID。適当なIDをクライアント側で生成して渡す。Operationごとに変える必要はない' /* createdByのみで判定するのは、同一ユーザーが複数タブを開くなどして同時に操作したときに問題が生じるので、このようにoperationIdも定義する必要がある。*/ })
    @MaxLength(10)
    public clientId!: string;
}

export const deleteRoomOperation = 'DeleteRoomOperation';

@ObjectType()
export class DeleteRoomOperation {
    public __tstype!: typeof deleteRoomOperation;

    @Field()
    public deletedBy!: string;
}
