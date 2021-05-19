import { Field, InputType, ObjectType } from 'type-graphql';
import { MaxLength } from 'class-validator';

@ObjectType()
export class RoomGetState {
    @Field({ description: 'Current revision of Room. Whenever Room is updated, this value is incremented by 1. This value is required when you apply RoomOperation. / Roomの現在のリビジョン。Roomが更新されるたび、この値は1増加する。RoomOperationを適用する際に必要となる。' })
    public revision!: number;


    @Field({ description: 'この部屋の作成者。Firebase AuthenticationのUserUidで表現される。' })
    public createdBy!: string;

    @Field({ description: 'room.state をJSON化したもの' })
    public stateJson!: string;
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

    @Field({ description: 'room.upOperationをJSONにしたもの。idならばnullish。' })
    public valueJson!: string;
}

@InputType()
export class RoomOperationInput {
    @Field({ description: 'room.upOperationをJSONにしたもの' })
    public valueJson!: string;

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
