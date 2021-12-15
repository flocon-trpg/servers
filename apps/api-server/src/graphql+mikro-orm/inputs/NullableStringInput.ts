import { Field, InputType } from 'type-graphql';

@InputType()
export class NullableStringInput {
    @Field({ nullable: true })
    public value?: string;
}
