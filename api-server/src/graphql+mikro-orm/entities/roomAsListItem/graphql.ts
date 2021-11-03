import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export class RoomAsListItem {
    @Field(() => ID)
    public id!: string;

    @Field()
    public name!: string;

    @Field({ description: 'この部屋の作成者。Firebase AuthenticationのUserUidで表現される。' })
    public createdBy!: string;

    @Field()
    public requiresPhraseToJoinAsPlayer!: boolean;

    @Field()
    public requiresPhraseToJoinAsSpectator!: boolean;
}
