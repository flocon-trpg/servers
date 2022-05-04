import { Field, ID, ObjectType } from 'type-graphql';

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
}
