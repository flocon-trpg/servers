import { Field, ObjectType } from 'type-graphql';
import { FileItem } from '../entities/file/graphql';

@ObjectType()
export class ListFilesResult {
    @Field(() => [FileItem])
    public files!: FileItem[];
}
