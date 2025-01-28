import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';
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
