import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Pong {
    @Field()
    public value!: number;

    @Field({ nullable: true })
    public createdBy?: string;
}