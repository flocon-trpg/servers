import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class OperatedBy {
    @Field()
    public userUid!: string;

    @Field()
    public clientId!: string;
}
