import { Collection, Entity, Enum, IdentifiedReference, JsonType, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property, Reference, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { FileSourceType } from '../../../enums/FileSourceType';
import { MyValueLogType } from '../../../enums/MyValueLogType';
import { Room } from '../room/mikro-orm';
import { Partici } from '../room/participant/mikro-orm';
import { User } from '../user/mikro-orm';

/*
# 変数展開（仮称）の仕様

「今のHPは{HP}です」というメッセージで、{HP}のように{}でくくることでHPという変数を自動的に探して取得し、その文字に置き換えられる。例えばHPが10ならば「今のHPは10です」というメッセージになる。変数の型は、string, number, booleanのいずれでもOKである。
このように、変数を自動的に代入する仕組みを変数展開（仮称）という。
変数が見つからなかったときの処理の定義は曖昧。今の所「undefined」を代入して正常に処理されるようにしている。

変数展開が行われてから、bcdiceの処理が行われる。そのため、例えば「1d{HP}<{MP}」や「{memo}1d100」（memoに"s"という文字列が入っているときは、s1d100になる）のようなこともできる。

## textSourceについて

変数展開が行われ、bcdiceの処理が行われる前の文字列はDBのtextに入る。変数展開が行われる前の文字列はDBのtextSourceに入る（text === textSourceになるときは、容量節約のためにtextSourceにはnullishが代入されることもありうる）。


# text, textSource, updatedText, textUpdatedAt, commandResult, altTextToSecret, isSecretについて

textとtextSourceは、投稿時のメッセージ。編集や削除されても残る。本来ならばinitTextやinitTextSourceという名前にしたほうが良さそうだが、マイグレーションでデータが損失するのを防ぐために今の名前になっている。
TODO: ↑正式リリースまでにinitTextなどに変えたほうがいいか

各プロパティの詳細な関係は、./state-table.mdを参照。

## commandResult
コマンドの実行結果を表す文字列。textのほうは実行結果に関わらず投稿された文字列がそのまま入る。
コマンドでないとみなされていた場合はnullish。
公開条件はtextと同様。altCommandResultToSecretは、今のところ使える場面が思いつかないので定義していない。


# createdByやvisibleToがParticipantではなくUserである理由

- 退室してParticipantでなくなった後、再びParticipantになったときに同一人物であるとみなしたい
- 現在、GraphQLでブラウザに渡すのはParticipantのIdではなくUserUidなので、UserにするほうがDBへのアクセス数を少なくできる


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
    public constructor({ text, textSource }: { text: string; textSource: string | undefined }) {
        this.text = text;
        this.textSource = textSource;
    }

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
    @Property({ nullable: true, length: 65535, default: '' })
    public textSource?: string;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ length: 65535, default: '' })
    public text!: string;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535 })
    public updatedText?: string;

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
    public constructor({ text, textSource }: { text: string; textSource: string | undefined }) {
        this.text = text;
        this.textSource = textSource;
    }

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
    @Property({ nullable: true, length: 65535, default: '' })
    public textSource?: string;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ length: 65535, default: '' })
    public text!: string;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535 })
    public updatedText?: string;

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
        isValuePrivateChanged,
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
        isValuePrivateChanged: boolean;
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
        this.isValuePrivateChanged = isValuePrivateChanged;
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

    @Property({ default: false })
    public isValuePrivateChanged: boolean

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