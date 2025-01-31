import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OperatedBy {
    @Field()
    public userUid!: string;

    @Field()
    public clientId!: string;
}
