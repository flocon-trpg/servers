import { Field, InputType, ObjectType } from 'type-graphql';
import { FileSourceType } from '../../../enums/FileSourceType';

@ObjectType()
@InputType('FilePathInput')
export class FilePath {
    @Field()
    public path!: string;

    @Field(() => FileSourceType)
    public sourceType!: FileSourceType;
}