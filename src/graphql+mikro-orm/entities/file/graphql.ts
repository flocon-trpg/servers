import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export class FileItem {
    @Field(() => ID, {
        description:
            'サーバーで管理されているファイル名。axiosなどでファイルを取得する際はこれを用いる。',
    })
    public filename!: string;

    @Field({ description: 'ユーザーが名付けたファイル名。' })
    public screenname!: string;

    @Field({
        description:
            'ファイルをアップロードしたユーザー。Firebase AuthenticationのUserUidで表現される。',
    })
    public createdBy!: string;
}
