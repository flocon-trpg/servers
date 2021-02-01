import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export class RoomAsListItem {
    @Field(() => ID)
    public id!: string;
    
    @Field()
    public name!: string;

    @Field()
    public requiresPhraseToJoinAsPlayer!: boolean;

    @Field()
    public requiresPhraseToJoinAsSpectator!: boolean;
}