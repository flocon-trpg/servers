import { Field, InputType } from 'type-graphql';

@InputType()
export class FilePathInput {
    @Field({ nullable: true })
    public path?: string;
}
