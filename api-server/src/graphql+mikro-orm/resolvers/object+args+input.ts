import { Field, InputType, ObjectType } from 'type-graphql';

@InputType()
export class GetFilesInput {
    @Field(() => [String], {
        description:
            'FileTagのidを指定することで、指定したタグが付いているファイルのみを抽出して表示する。例えばidがx,yの3つのタグが付いているファイルは、[]や[x]や[x,y]と指定した場合にマッチするが、[x,y,z]と指定された場合は除外される。',
    })
    public fileTagIds!: string[];
}

// addとremoveは、fileTagのidを指定することでそのタグが追加/削除される。
@InputType()
export class EditFileTagActionInput {
    @Field()
    public filename!: string;

    @Field(() => [String])
    public add!: string[];

    @Field(() => [String])
    public remove!: string[];
}

@InputType()
export class EditFileTagsInput {
    @Field(() => [EditFileTagActionInput])
    public actions!: EditFileTagActionInput[];
}

@ObjectType()
export class FileTag {
    @Field()
    public id!: string;

    @Field()
    public name!: string;
}
