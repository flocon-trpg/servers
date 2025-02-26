import {
    Collection,
    Entity,
    Index,
    ManyToMany,
    ManyToOne,
    PrimaryKey,
    Property,
    Ref,
    TextType,
} from '@mikro-orm/core';
import { FilePermissionType } from '../../../enums/FilePermissionType';
import { FileTag } from '../fileTag/entity';
import { User } from '../user/entity';

// 内蔵アップローダーのファイルを表す。Firebase Storageのファイルは対象外。
@Entity()
export class File {
    public constructor({
        createdBy,
        deletePermission,
        encoding,
        filename,
        filesize,
        listPermission,
        thumbFilename,
        mimetype,
        renamePermission,
        screenname,
        size,
    }: {
        createdBy: Ref<User>;
        deletePermission: FilePermissionType;
        encoding: string;
        filename: string;
        filesize: number;
        listPermission: FilePermissionType;
        thumbFilename: string | undefined;
        mimetype: string;
        renamePermission: FilePermissionType;
        screenname: string;
        size: number;
    }) {
        this.createdBy = createdBy;
        this.deletePermission = deletePermission;
        this.encoding = encoding;
        this.filename = filename;
        this.filesize = filesize;
        this.listPermission = listPermission;
        this.thumbFilename = thumbFilename;
        this.mimetype = mimetype;
        this.renamePermission = renamePermission;
        this.screenname = screenname;
        this.size = size;
    }

    // multerによってランダムに生成されたファイル名。ストレージに保存されるファイル名と一致する。
    @PrimaryKey()
    public filename: string;

    // ユーザーに表示するファイル名。変更（リネーム）可能。フォルダに入れることも可能で、その場合は / でパスの区切りを表す。
    // MySQLではtextにdefault値を設定できないのでnullable: trueにしているが、通常はnullishになることはない。
    @Property({ nullable: true, type: TextType })
    public screenname?: string;

    @Property({ type: Date, nullable: true, onCreate: () => new Date() })
    @Index()
    public createdAt?: Date;

    @Property()
    public encoding: string;

    @Property()
    public size: number;

    @Property({ nullable: true })
    @Index()
    public thumbFilename?: string;

    // 基本的にブラウザの自称であることに注意
    @Property()
    @Index()
    public mimetype: string;

    @Property()
    @Index()
    public filesize: number;

    // read permissionはPrivateにはできず、常にEntry。理由は、例えばボードに画像を表示するとき、Privateだったため自分以外には表示されなかったという事故を防ぐため。

    @Property({ type: 'string' })
    @Index()
    public listPermission: FilePermissionType;

    @Property({ type: 'string' })
    @Index()
    public renamePermission: FilePermissionType;

    @Property({ type: 'string' })
    @Index()
    public deletePermission: FilePermissionType;

    @ManyToOne(() => User, { ref: true })
    public createdBy!: Ref<User>;

    @ManyToMany(() => FileTag, x => x.files, { owner: true })
    public fileTags = new Collection<FileTag>(this);
}
