import {
    DicePieceLog as DicePieceLogState,
    StringPieceLog as StringPieceLogState,
} from '@flocon-trpg/core';
import {
    Collection,
    DateType,
    Entity,
    IdentifiedReference,
    JsonType,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryKey,
    Property,
    Reference,
    TextType,
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

## initTextSourceについて

変数展開が行われ、bcdiceの処理が行われる前の文字列はDBのinitTextに入る。変数展開が行われる前の文字列はDBのinitTextSourceに入る（initText === initTextSourceになるときは、容量節約のためにinitTextSourceにはnullishが代入されることもありうる）。


# initText, initTextSource, updatedText, textUpdatedAt, commandResult, altTextToSecret, isSecretについて

initTextとinitTextSourceは、投稿時のメッセージ。編集や削除されても残る。

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
        this.initTextSource = initText === initTextSource ? undefined : initTextSource;
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

    @Property({ nullable: true, type: TextType, default: null })
    public initTextSource?: string;

    // MySQLではtextにdefault値を設定できないのでnullable: trueにしているが、通常はinitTextがnullishになることはない。
    // もしinitTextがnullishの場合は''として処理する。
    @Property({ nullable: true, type: TextType, default: null })
    public initText?: string;

    @Property({ nullable: true, type: TextType })
    public updatedText?: string;

    /** @deprecated Do not set values to this. Set to textUpdatedAt2 instead. */
    @Property({ nullable: true, default: null })
    public textUpdatedAt?: number;

    @Property({ type: DateType, nullable: true, default: null })
    public textUpdatedAt2?: Date;

    @Property({ persist: false })
    public get textUpdatedAtValue() {
        if (this.textUpdatedAt2 != null) {
            return this.textUpdatedAt2.getTime();
        }
        return this.textUpdatedAt;
    }

    // フォーマットは#nnnnnn。
    // nullishの場合はwhite
    @Property({ nullable: true })
    public textColor?: string;

    @Property({ nullable: true, type: TextType })
    public commandResult?: string;

    // 成功判定のあるコマンドの場合、成功したかどうかを表す。
    @Property({ nullable: true, default: null, index: true })
    public commandIsSuccess?: boolean;

    @Property({ nullable: true, type: TextType })
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
    @Property({ nullable: true, type: TextType, default: null })
    public charaImagePath?: string;

    // 「書き込んだとき」のCharaのimageSourceType
    @Property({ nullable: true, type: TextType, default: null })
    public charaImageSourceType?: FileSourceType;

    // 「書き込んだとき」のCharaのimagePath
    @Property({ nullable: true, type: TextType, default: null })
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
        this.initTextSource = initText === initTextSource ? undefined : initTextSource;
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

    @Property({ nullable: true, type: TextType, default: null })
    public initTextSource?: string;

    // MySQLではtextにdefault値を設定できないのでnullable: trueにしているが、通常はinitTextがnullishになることはない。
    // もしinitTextがnullishの場合は''として処理する。
    @Property({ nullable: true, type: TextType, default: null })
    public initText?: string;

    @Property({ nullable: true, type: TextType })
    public updatedText?: string;

    /** @deprecated Do not set values to this. Set to textUpdatedAt2 instead. */
    @Property({ nullable: true, default: null })
    public textUpdatedAt?: number;

    @Property({ type: DateType, nullable: true, default: null })
    public textUpdatedAt2?: Date;

    @Property({ persist: false })
    public get textUpdatedAtValue() {
        if (this.textUpdatedAt2 != null) {
            return this.textUpdatedAt2.getTime();
        }
        return this.textUpdatedAt;
    }

    // フォーマットは#nnnnnn。
    // nullishの場合はwhite
    @Property({ nullable: true })
    public textColor?: string;

    @Property({ nullable: true, type: TextType })
    public commandResult?: string;

    // 成功判定のあるコマンドの場合、成功したかどうかを表す。
    @Property({ nullable: true, default: null })
    public commandIsSuccess?: boolean;

    @Property({ nullable: true, type: TextType })
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
    @Property({ nullable: true, type: TextType, default: null })
    public charaImagePath?: string;

    // 「書き込んだとき」のCharaのimageSourceType
    @Property({ type: () => FileSourceType, nullable: true, default: null })
    public charaImageSourceType?: FileSourceType;

    // 「書き込んだとき」のCharaのimagePath
    @Property({ nullable: true, type: TextType, default: null })
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
export class DicePieceLog {
    public constructor({
        room,
        stateId,
        value,
    }: {
        room: Room;
        stateId: string;
        value: DicePieceLogState;
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
    public value?: DicePieceLogState;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room: IdentifiedReference<Room>;
}

@Entity()
export class StringPieceLog {
    public constructor({
        room,
        stateId,
        value,
    }: {
        room: Room;
        stateId: string;
        value: StringPieceLogState;
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
    public value?: StringPieceLogState;

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
