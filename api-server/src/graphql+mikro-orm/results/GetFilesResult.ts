import { Field, ObjectType } from 'type-graphql';
import { FileItem } from '../entities/file/graphql';

@ObjectType()
export class GetFilesResult {
    @Field(() => [FileItem])
    public files!: FileItem[];
}
