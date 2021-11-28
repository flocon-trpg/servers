import {
    DicePieceValueLog as DicePieceValueLogState,
    StringPieceValueLog as StringPieceValueLogState,
} from '@flocon-trpg/core';
import {
    Collection,
    Entity,
    IdentifiedReference,
    JsonType,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryKey,
    Property,
    Reference,
    Unique,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { FileSourceType } from '../../../enums/FileSourceType';
import { easyFlake } from '../../../utils/easyFlake';
import { Room } from '../room/mikro-orm';
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

initTextとinitTextSourceは、投稿時のメッセージ。編集や削除されても残る。本来ならばinitTextやinitTextSourceという名前にしたほうが良さそうだが、マイグレーションでデータが損失するのを防ぐために今の名前になっている。

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
    @Property({ version: true, index: true })
    public version: number = 1;

    @Property({ type: Date, nullable: true, onUpdate: () => new Date(), index: true })
    public updatedAt?: Date;

    @Property({ index: true })
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
    public constructor({
        initText,
        initTextSource,
    }: {
        initText: string;
        initTextSource: string | undefined;
    }) {
        this.initText = initText;
        this.initTextSource = initTextSource;
    }

    @PrimaryKey()
    public id: string = easyFlake();

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true, index: true })
    public version: number = 1;

    @Property({ type: Date, onCreate: () => new Date(), index: true })
    public createdAt: Date = new Date();

    @Property({ type: Date, nullable: true, onUpdate: () => new Date(), index: true })
    public updatedAt?: Date;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535, default: '' })
    public initTextSource?: string;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ length: 65535, default: '' })
    public initText!: string;

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
    @Property({ nullable: true, default: null, index: true })
    public commandIsSuccess?: boolean;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535 })
    public altTextToSecret?: string;

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ index: true })
    public isSecret: boolean = false;

    // 発言がキャラクターに紐付いているときはnon-nullish、PLとして発言もしくはcreatedByがnullishの場合はnullishという想定。
    // キャラクターが削除/削除をUndoされるケースを考慮して、リレーションは付けていない。
    @Property({ nullable: true, index: true })
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
    @Property({ type: 'string', nullable: true, default: null })
    public charaImageSourceType?: FileSourceType;

    // 「書き込んだとき」のCharaのimagePath
    // CONSIDER: デフォルトではPostgreSQLの場合varchar(255)になるため、lengthを設定している。値は適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535, default: null })
    public charaPortraitImagePath?: string;

    // 「書き込んだとき」のCharaのimageSourceType
    @Property({ type: 'string', nullable: true, default: null })
    public charaPortraitImageSourceType?: FileSourceType;

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
    public constructor({
        initText,
        initTextSource,
    }: {
        initText: string;
        initTextSource: string | undefined;
    }) {
        this.initText = initText;
        this.initTextSource = initTextSource;
    }

    @PrimaryKey()
    public id: string = easyFlake();

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true, index: true })
    public version: number = 1;

    @Property({ type: Date, onCreate: () => new Date(), index: true })
    public createdAt: Date = new Date();

    @Property({ type: Date, nullable: true, onUpdate: () => new Date(), index: true })
    public updatedAt?: Date;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535, default: '' })
    public initTextSource?: string;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ length: 65535, default: '' })
    public initText!: string;

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
    @Property({ index: true })
    public isSecret: boolean = false;

    // 発言がキャラクターに紐付いているときはnon-nullish、PLとして発言もしくはcreatedByがnullishの場合はnullishという想定。
    // キャラクターが削除/削除をUndoされるケースを考慮して、リレーションにはしていない。
    @Property({ nullable: true, index: true })
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
    @Property({ type: () => FileSourceType, nullable: true, default: null })
    public charaImageSourceType?: FileSourceType;

    // 「書き込んだとき」のCharaのimagePath
    // CONSIDER: デフォルトではPostgreSQLの場合varchar(255)になるため、lengthを設定している。値は適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535, default: null })
    public charaPortraitImagePath?: string;

    // 「書き込んだとき」のCharaのimageSourceType
    @Property({ type: 'string', nullable: true, default: null })
    public charaPortraitImageSourceType?: FileSourceType;

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
export class DicePieceValueLog {
    public constructor({
        room,
        stateId,
        value,
    }: {
        room: Room;
        stateId: string;
        value: DicePieceValueLogState;
    }) {
        this.room = Reference.create(room);
        this.stateId = stateId;
        this.value = value;
    }

    @PrimaryKey()
    public id: string = easyFlake();

    @Property({ type: Date, onCreate: () => new Date() })
    public createdAt: Date = new Date();

    @Property({ index: true })
    public stateId: string;

    @Property({ type: JsonType, nullable: true })
    public value?: DicePieceValueLogState;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room: IdentifiedReference<Room>;
}

@Entity()
export class StringPieceValueLog {
    public constructor({
        room,
        stateId,
        value,
    }: {
        room: Room;
        stateId: string;
        value: StringPieceValueLogState;
    }) {
        this.room = Reference.create(room);
        this.stateId = stateId;
        this.value = value;
    }

    @PrimaryKey()
    public id: string = easyFlake();

    @Property({ type: Date, onCreate: () => new Date() })
    public createdAt: Date = new Date();

    @Property({ index: true })
    public stateId: string;

    @Property({ type: JsonType, nullable: true })
    public value?: StringPieceValueLogState;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room: IdentifiedReference<Room>;
}

// RoomSoundEffect
@Entity()
export class RoomSe {
    public constructor({
        filePath,
        fileSourceType,
        volume,
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
    public id: string = easyFlake();

    @Property({ type: Date, onCreate: () => new Date() })
    public createdAt: Date = new Date();

    @Property()
    public filePath: string;

    @Property({ type: 'string' })
    public fileSourceType!: FileSourceType;

    @Property()
    public volume: number;

    @ManyToOne(() => User, { nullable: true, wrappedReference: true })
    public createdBy?: IdentifiedReference<User, 'userUid'>;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room!: IdentifiedReference<Room>;
}
