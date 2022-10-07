import { MaxLength } from 'class-validator';
import { Field, InputType, ObjectType } from 'type-graphql';
import { FileSourceType } from '../../enums/FileSourceType';

@ObjectType()
@InputType('FilePathInput')
export class FilePath {
    @Field()
    @MaxLength(10_000)
    public path!: string;

    @Field(() => FileSourceType)
    public sourceType!: FileSourceType;
}
