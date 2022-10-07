import { Field, ID, ObjectType } from 'type-graphql';
import { FileListType } from '../../enums/FileListType';

@ObjectType()
export class FileItem {
    @Field(() => ID, {
        description:
            'サーバーで管理されているファイル名。axiosなどでファイルを取得する際はこれを用いる。ソートするとアップロードした時系列順になる。',
    })
    public filename!: string;

    @Field({
        nullable: true,
        description: 'サムネイル画像のファイル名。axiosなどを用いてファイルを取得する。',
    })
    public thumbFilename?: string;

    @Field({ description: 'ユーザーが名付けたファイル名。' })
    public screenname!: string;

    @Field({ nullable: true })
    public createdAt?: number;

    @Field({
        description:
            'ファイルをアップロードしたユーザー。Firebase AuthenticationのUserUidで表現される。',
    })
    public createdBy!: string;

    @Field(() => FileListType)
    public listType!: FileListType;
}
