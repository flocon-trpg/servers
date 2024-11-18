import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ParticipantRoleType } from '../../enums/ParticipantRoleType';

@ObjectType()
export class RoomGetState {
    @Field({
        description:
            'Current revision of Room. Whenever Room is updated, this value is incremented by 1. This value is required when you apply RoomOperation. / Roomの現在のリビジョン。Roomが更新されるたび、この値は1増加する。RoomOperationを適用する際に必要となる。',
    })
    public revision!: number;

    @Field({ description: 'この部屋の作成者。Firebase AuthenticationのUserUidで表現される。' })
    public createdBy!: string;

    @Field({ description: 'since v0.7.2', nullable: true })
    public createdAt?: number;

    @Field({
        description: `データベースのRoomエンティティが最後に更新された日時。Roomエンティティのみが対象であるため、例えばメッセージの投稿などは反映されないことに注意。
since v0.7.2`,
        nullable: true,
    })
    public updatedAt?: number;

    @Field({ description: 'room.state をJSON化したもの' })
    public stateJson!: string;

    @Field({ description: 'since v0.7.2' })
    public isBookmarked!: boolean;

    // Participantでない場合はnullish
    @Field(() => ParticipantRoleType, { description: 'since v0.7.2', nullable: true })
    public role?: ParticipantRoleType | undefined;
}

@ObjectType()
class OperatedBy {
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

    @Field(() => OperatedBy, {
        nullable: true,
        description: 'operateRoomを呼んだ人物。promoteなどの結果の場合はnullishになる。',
    })
    public operatedBy?: OperatedBy;

    @Field({ description: 'room.upOperationをJSONにしたもの。idならばnullish。' })
    public valueJson!: string;
}

@ObjectType()
export class RoomAsListItem {
    @Field(() => ID)
    public id!: string;

    @Field()
    public name!: string;

    @Field({ description: 'since v0.7.2', nullable: true })
    public createdAt?: number;

    @Field({
        description: `データベースのRoomエンティティが最後に更新された日時。Roomエンティティのみが対象であるため、例えばメッセージの投稿などは反映されないことに注意。
since v0.7.2`,
        nullable: true,
    })
    public updatedAt?: number;

    @Field({ description: 'この部屋の作成者。Firebase AuthenticationのUserUidで表現される。' })
    public createdBy!: string;

    @Field()
    public requiresPlayerPassword!: boolean;

    @Field()
    public requiresSpectatorPassword!: boolean;

    @Field({ description: 'since v0.7.2' })
    public isBookmarked!: boolean;

    // Participantでない場合はnullish
    @Field(() => ParticipantRoleType, { description: 'since v0.7.2', nullable: true })
    public role?: ParticipantRoleType | undefined;
}
