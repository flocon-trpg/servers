import { Collection, Entity, Enum, IdentifiedReference, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { FileSourceType } from '../../../enums/FileSourceType';
import { Chara } from '../character/mikro-orm';
import { Participant } from '../participant/mikro-orm';
import { Room } from '../room/mikro-orm';
import { User } from '../user/mikro-orm';

// createdByやvisibleToがParticipantではなくUserである理由:
// - 退室してParticipantでなくなった後、再びParticipantになったときに同一人物であるとみなしたい
// - 現在、GraphQLでブラウザに渡すのはParticipantのIdではなくUserUidなので、UserにするほうがDBへのアクセス数を少なくできる

/*
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

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535 })
    public commandResult?: string;

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

    // 後から該当するcharacterが削除されたときでも、nameは簡単に取得できるようにするために定義している。
    @Property({ nullable: true })
    public charaName?: string;

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

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535 })
    public commandResult?: string;

    // CONSIDER: 理想としてはTEXTなどのほうが良い。lengthは適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535 })
    public altTextToSecret?: string;

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property()
    public isSecret: boolean = true;

    // 発言がキャラクターに紐付いているときはnon-nullish、PLとして発言もしくはcreatedByがnullishの場合はnullishという想定。
    // キャラクターが削除/削除をUndoされるケースを考慮して、リレーションにはしていない。
    @Property({ nullable: true })
    public charaStateId?: string;

    // 後から該当するcharacterが削除されたときでも、nameは簡単に取得できるようにするために定義している。
    @Property({ nullable: true })
    public charaName?: string;

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