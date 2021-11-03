import {
    Collection,
    Entity,
    IdentifiedReference,
    Index,
    ManyToMany,
    ManyToOne,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { FilePermissionType } from '../../../enums/FilePermissionType';
import { FileTag } from '../fileTag/mikro-orm';
import { User } from '../user/mikro-orm';

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
        createdBy: IdentifiedReference<User, 'userUid'>;
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

    // ユーザーに表示するファイル名。変更（リネーム）可能。
    @Property()
    @Index()
    public screenname: string;

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

    @ManyToOne(() => User)
    public createdBy!: IdentifiedReference<User, 'userUid'>;

    @ManyToMany(() => FileTag, x => x.files, { owner: true })
    public fileTags = new Collection<FileTag>(this);
}
