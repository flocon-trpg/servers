import { Field, InputType } from 'type-graphql';
import { FilePathInput } from '../FilePathInput';

@InputType()
export class BGMInput {
    @Field({ nullable: true })
    public path?: FilePathInput;

    @Field({ nullable: true })
    public volume?: number;

    @Field({ nullable: true })
    public loop?: boolean;
}