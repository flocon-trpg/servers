import { Collection, Entity, Enum, IdentifiedReference, JsonType, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property, Reference, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { FileSourceType } from '../../../enums/FileSourceType';
import { MyValueLogType } from '../../../enums/MyValueLogType';
import { Room } from '../room/mikro-orm';
import { Partici } from '../room/participant/mikro-orm';
import { User } from '../user/mikro-orm';


/*
# createdByやvisibleToがParticipantではなくUserである理由:

- 退室してParticipantでなくなった後、再びParticipantになったときに同一人物であるとみなしたい
- 現在、GraphQLでブラウザに渡すのはParticipantのIdではなくUserUidなので、UserにするほうがDBへのアクセス数を少なくできる


# text, commandResult, altTextToSecret, isSecretについて

## (text, altTextToSecret) = (nullish, nullish)
そのメッセージは削除されたことを表す。このときはcommandResultもnullish。

## (text, altTextToSecret) = (non-nullish, nullish)
常に公開されるメッセージを表す。

## (text, altTextToSecret) = (nullish, non-nullish)
未定義。この状態になることはない。

## (text, altTextToSecret) = (non-nullish, non-nullish)
Secret設定である。

## commandResult
コマンドの実行結果を表す文字列。textのほうは実行結果に関わらず投稿された文字列がそのまま入る。
コマンドでないとみなされていた場合はnullish。
公開条件はtextと同様。altCommandResultToSecretは、今のところ使える場面が思いつかないので定義していない。

## isSecret
Secret設定であり、本文が非公開の状態だとtrue。公開しているならばfalse。


# システムメッセージ

システムメッセージには主に二種類ある。1つはRoomPubMsgやRoomPrvMsgのcreatedByをnullishにしたものである。これは任意のチャンネルに対してメッセージを作成できるが、RoomPubMsgやRoomPrvMsgで表現不可能なメッセージは作成できない。もう1つは専用のエンティティであり、(任意のチャンネルに作成できるようにするのが面倒なので)$systemにしか作成できないが、自由度が高い。
*/

// RoomPublicChannel
@Entity()
@Unique({ properties: ['room', 'key'] })
export class RoomPubCh {
    public constructor({ key }: { key: string }) {
        this.key = key;
    }

    @PrimaryKey()
    public id: string = v4();

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @Property({ type: Date, nullable: true, onUpdate: () => new Date() })
    public updatedAt?: Date;

    @Property()
    public key: string;

    @Property({ nullable: true })
    public name?: string;

    @OneToMany(() => RoomPubMsg, x => x.roomPubCh, { orphanRemoval: true })
    public roomPubMsgs = new Collection<RoomPubMsg>(this);

    @ManyToOne(() => Room)
    public room!: IdentifiedReference<Room>;
}

// RoomPublicMessage
@Entity()
export class RoomPubMsg {
    @PrimaryKey()
    public id: string = v4();

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @Property({ type: Date, onCreate: () => new Date() })
    public createdAt: Date = new Date();

    @Property({ type: Date, nullable: true, onUpdate: () => new Date() })
    public updatedAt?: Date;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535 })
    public text?: string;

    @Property({ nullable: true, default: null })
    public textUpdatedAt?: number;

    // フォーマットは#nnnnnn。
    // nullishの場合はwhite
    @Property({ nullable: true })
    public textColor?: string;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535 })
    public commandResult?: string;

    // 成功判定のあるコマンドの場合、成功したかどうかを表す。
    @Property({ nullable: true, default: null })
    public commandIsSuccess?: boolean;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535 })
    public altTextToSecret?: string;

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property()
    public isSecret: boolean = false;

    // 発言がキャラクターに紐付いているときはnon-nullish、PLとして発言もしくはcreatedByがnullishの場合はnullishという想定。
    // キャラクターが削除/削除をUndoされるケースを考慮して、リレーションは付けていない。
    @Property({ nullable: true })
    public charaStateId?: string;

    // 「書き込んだとき」のCharaのname
    @Property({ nullable: true })
    public charaName?: string;

    // 「書き込んだとき」のCharaのisPrivate
    @Property({ nullable: true, default: null })
    public charaIsPrivate?: boolean;

    // 「書き込んだとき」のCharaのimagePath
    // CONSIDER: デフォルトではPostgreSQLの場合varchar(255)になるため、lengthを設定している。値は適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535, default: null })
    public charaImagePath?: string;

    // 「書き込んだとき」のCharaのimageSourceType
    @Enum({ items: () => FileSourceType, nullable: true, default: null })
    public charaImageSourceType?: FileSourceType;

    // 「書き込んだとき」のCharaのimagePath
    // CONSIDER: デフォルトではPostgreSQLの場合varchar(255)になるため、lengthを設定している。値は適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535, default: null })
    public charaTachieImagePath?: string;

    // 「書き込んだとき」のCharaのimageSourceType
    @Enum({ items: () => FileSourceType, nullable: true, default: null })
    public charaTachieImageSourceType?: FileSourceType;

    @Property({ nullable: true })
    public customName?: string;

    @ManyToOne(() => RoomPubCh, { wrappedReference: true })
    public roomPubCh!: IdentifiedReference<RoomPubCh>;

    @ManyToOne(() => User, { nullable: true, wrappedReference: true })
    public createdBy?: IdentifiedReference<User, 'userUid'>;
}

// RoomPrivateMessage
@Entity()
export class RoomPrvMsg {
    @PrimaryKey()
    public id: string = v4();

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @Property({ type: Date, onCreate: () => new Date() })
    public createdAt: Date = new Date();

    @Property({ type: Date, nullable: true, onUpdate: () => new Date() })
    public updatedAt?: Date;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535 })
    public text?: string;

    @Property({ nullable: true, default: null })
    public textUpdatedAt?: number;

    // フォーマットは#nnnnnn。
    // nullishの場合はwhite
    @Property({ nullable: true })
    public textColor?: string;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535 })
    public commandResult?: string;

    // 成功判定のあるコマンドの場合、成功したかどうかを表す。
    @Property({ nullable: true, default: null })
    public commandIsSuccess?: boolean;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535 })
    public altTextToSecret?: string;

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property()
    public isSecret: boolean = false;

    // 発言がキャラクターに紐付いているときはnon-nullish、PLとして発言もしくはcreatedByがnullishの場合はnullishという想定。
    // キャラクターが削除/削除をUndoされるケースを考慮して、リレーションにはしていない。
    @Property({ nullable: true })
    public charaStateId?: string;

    // 「書き込んだとき」のCharaのname
    @Property({ nullable: true })
    public charaName?: string;

    // 「書き込んだとき」のCharaのisPrivate
    @Property({ nullable: true, default: null })
    public charaIsPrivate?: boolean;

    // 「書き込んだとき」のCharaのimagePath
    // CONSIDER: デフォルトではPostgreSQLの場合varchar(255)になるため、lengthを設定している。値は適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535, default: null })
    public charaImagePath?: string;

    // 「書き込んだとき」のCharaのimageSourceType
    @Enum({ items: () => FileSourceType, nullable: true, default: null })
    public charaImageSourceType?: FileSourceType;

    // 「書き込んだとき」のCharaのimagePath
    // CONSIDER: デフォルトではPostgreSQLの場合varchar(255)になるため、lengthを設定している。値は適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535, default: null })
    public charaTachieImagePath?: string;

    // 「書き込んだとき」のCharaのimageSourceType
    @Enum({ items: () => FileSourceType, nullable: true, default: null })
    public charaTachieImageSourceType?: FileSourceType;

    @Property({ nullable: true })
    public customName?: string;

    @ManyToOne(() => User, { wrappedReference: true, nullable: true })
    public createdBy?: IdentifiedReference<User, 'userUid'>;

    // createdByと同じUserも含めなければならない。
    @ManyToMany(() => User, x => x.visibleRoomPrvMsgs)
    public visibleTo = new Collection<User>(this);

    @ManyToOne(() => Room, { wrappedReference: true })
    public room!: IdentifiedReference<Room>;
}

@Entity()
export class MyValueLog {
    public constructor({
        createdBy,
        stateId,
        myValueType,
        replaceType,
        valueChanged,
        createdPieces,
        deletedPieces,
        movedPieces,
        resizedPieces,
    }: {
        createdBy: Partici;
        stateId: string;
        myValueType: MyValueLogType;
        replaceType?: boolean;
        valueChanged: boolean;
        createdPieces: { createdBy: string; stateId: string }[];
        deletedPieces: { createdBy: string; stateId: string }[];
        movedPieces: { createdBy: string; stateId: string }[];
        resizedPieces: { createdBy: string; stateId: string }[];
    }) {
        this.createdBy = Reference.create(createdBy);
        this.stateId = stateId;
        this.myValueType = myValueType;
        this.replaceType = replaceType; 
        this.valueChanged = valueChanged;
        this.createdPieces = createdPieces;
        this.deletedPieces = deletedPieces;
        this.movedPieces = movedPieces;
        this.resizedPieces = resizedPieces;
    }

    @PrimaryKey()
    public id: string = v4();

    @Property({ type: Date, onCreate: () => new Date() })
    public createdAt: Date = new Date();

    @Property()
    public stateId: string;

    @Enum({ items: () => MyValueLogType })
    public myValueType: MyValueLogType;

    @Property()
    public valueChanged: boolean;

    // trueならば全体のcreate、falseならば全体のdelete。trueかfalseならば、pieceCreated～pieceResizeはすべて[]。
    @Property({ nullable: true })
    public replaceType?: boolean;

    // pieceCreated～pieceResizedのcreatedByとstateIdは、boardのものを表す
    @Property({ type: JsonType })
    public createdPieces: { createdBy: string; stateId: string }[];

    @Property({ type: JsonType })
    public deletedPieces: { createdBy: string; stateId: string }[];

    @Property({ type: JsonType })
    public movedPieces: { createdBy: string; stateId: string }[];

    @Property({ type: JsonType })
    public resizedPieces: { createdBy: string; stateId: string }[];

    // 対象となったmyValueの所有者を表す。ログの作成者ではない。
    @ManyToOne(() => Partici, { wrappedReference: true })
    public createdBy: IdentifiedReference<Partici>;
}

// RoomSoundEffect
@Entity()
export class RoomSe {
    public constructor({
        filePath,
        fileSourceType,
        volume
    }: {
        filePath: string;
        fileSourceType: FileSourceType;
        volume: number;
    }) {
        this.filePath = filePath;
        this.fileSourceType = fileSourceType;
        this.volume = volume;
    }

    @PrimaryKey()
    public id: string = v4();

    @Property({ type: Date, onCreate: () => new Date() })
    public createdAt: Date = new Date();

    @Property()
    public filePath: string;

    @Enum({ items: () => FileSourceType })
    public fileSourceType!: FileSourceType;

    @Property()
    public volume: number;

    @ManyToOne(() => User, { nullable: true, wrappedReference: true })
    public createdBy?: IdentifiedReference<User, 'userUid'>;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room!: IdentifiedReference<Room>;
}