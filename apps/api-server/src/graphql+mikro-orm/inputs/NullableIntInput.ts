import { Field, InputType, Int } from 'type-graphql';

@InputType()
export class NullableIntInput {
    @Field(() => Int, { nullable: true })
    public value?: number;
}
