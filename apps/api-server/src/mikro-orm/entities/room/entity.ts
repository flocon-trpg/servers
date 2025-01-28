import { DownOperation, State, roomDbTemplate, roomTemplate } from '@flocon-trpg/core';
import {
    Collection,
    Entity,
    JsonType,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryKey,
    Property,
    Ref,
    Unique,
} from '@mikro-orm/core';
import { v7 } from 'uuid';
import { EM } from '../../../types';
import { Participant } from '../participant/entity';
import {
    DicePieceLog as DicePieceLogEntity,
    RoomPrvMsg,
    RoomPubCh,
    RoomSe as RoomSe,
    StringPieceLog as StringPieceLogEntity,
} from '../roomMessage/entity';
import { User } from '../user/entity';

type DbState = State<typeof roomDbTemplate>;
type RoomDownOperation = DownOperation<typeof roomTemplate>;

// Roomは最新の状況を反映するが、RoomOperationを用いて1つ前の状態に戻せるのは一部のプロパティのみ。
// 例えばrevisionはRoomOperationをいくらapplyしても最新のまま。
@Entity()
export class Room {
    public constructor({
        createdBy,
        name,
        value,
    }: {
        createdBy: string;
        name: string;
        value: DbState;
    }) {
        this.createdBy = createdBy;
        this.name = name;
        this.value = value;
    }

    @PrimaryKey()
    public id: string = v7();

    @Property({ version: true, index: true })
    public version: number = 1;

    @Property({ type: Date, nullable: true, onCreate: () => new Date(), index: true })
    public createdAt?: Date;

    @Property({ type: Date, nullable: true, onUpdate: () => new Date(), index: true })
    public updatedAt?: Date;

    /** この部屋全体の最終更新日時。このentityだけでなく、メッセージの書き込みなども対象とした最終更新日時を表す。 */
    /* 
    mikro-ormのonUpdateによる日時更新はそのエンティティ以外の変更を検知しないため、例えば部屋のメッセージが追加されてもupdatedAtは更新されない。だが利用者の視点ではこれらも考慮してほしいと思われる。そのためこのプロパティを設けている。

    他の案として「RoomのupdatedAt、そのRoomのRoomPubMsgのMAX(updated_at)、RoomPubMsgのMAX(updated_at)…を取得してそれらの中で最も大きい値をこの部屋全体の最終更新日時とする」というのも考えられる。これはcompleteUpdatedAtの値を手動でセットしなくとも求まるというメリットはある。だが、例えば部屋全体の最終更新日時が新しい順に10件取得したい場合に、すべての部屋ごとに全体の最終更新日時を計算しなければならないためパフォーマンス上の懸念があるため不採用とした。

    Participantの増減（入退室）や名前変更などでもcompleteUpdatedAtは更新されるという仕様にしている。理由は、RoomのStateの変更によるcompleteUpdatedAtの更新は条件に関わらず常に行うとすることで規則を単純化し、コードをシンプルにするため。ただしこの仕様は後々変更するかもしれない。
    */
    @Property({ type: Date, nullable: true, index: true })
    public completeUpdatedAt?: Date;

    @Property({ nullable: true })
    public playerPasswordHash?: string;

    @Property({ nullable: true })
    public spectatorPasswordHash?: string;

    // userUid
    @Property({ index: true })
    public createdBy: string;

    @Property()
    public name: string;

    @Property({ type: JsonType })
    public value: DbState;

    @Property()
    public revision: number = 0;

    @OneToMany(() => Participant, x => x.room, { orphanRemoval: true })
    public participants = new Collection<Participant>(this);

    @OneToMany(() => RoomOp, x => x.room, { orphanRemoval: true })
    public roomOperations = new Collection<RoomOp>(this);

    @OneToMany(() => RoomPubCh, x => x.room, { orphanRemoval: true })
    public roomChatChs = new Collection<RoomPubCh>(this);

    @OneToMany(() => RoomPrvMsg, x => x.room, { orphanRemoval: true })
    public roomPrvMsgs = new Collection<RoomPrvMsg>(this);

    @OneToMany(() => DicePieceLogEntity, x => x.room, { orphanRemoval: true })
    public dicePieceLogs = new Collection<DicePieceLogEntity>(this);

    @OneToMany(() => StringPieceLogEntity, x => x.room, { orphanRemoval: true })
    public stringPieceLogs = new Collection<StringPieceLogEntity>(this);

    @OneToMany(() => RoomSe, x => x.room, { orphanRemoval: true })
    public roomSes = new Collection<RoomSe>(this);

    @ManyToMany(() => User, user => user.bookmarkedRooms)
    public bookmarkedBy = new Collection<User>(this);
}

@Entity()
@Unique({ properties: ['prevRevision', 'room'] })
export class RoomOp {
    public constructor({
        prevRevision,
        value,
    }: {
        prevRevision: number;
        value: RoomDownOperation;
    }) {
        this.prevRevision = prevRevision;
        this.value = value;
    }

    @PrimaryKey()
    public id: string = v7();

    @Property({
        type: Date,
        nullable: true,
        onCreate: () => new Date(),
        index: true,
        default: null,
    })
    public createdAt?: Date;

    @Property({ index: true })
    public prevRevision: number;

    @Property({ type: JsonType })
    public value: RoomDownOperation;

    @ManyToOne(() => Room, { ref: true })
    public room!: Ref<Room>;
}

// このメソッドではflushは行われない。flushのし忘れに注意。
export const deleteRoom = async (em: EM, room: Room): Promise<void> => {
    await room.roomOperations.init();
    room.roomOperations.getItems().forEach(x => em.remove(x));
    room.roomOperations.removeAll();

    for (const roomChatCh of await room.roomChatChs.loadItems()) {
        await roomChatCh.roomPubMsgs.init();
        roomChatCh.roomPubMsgs.getItems().forEach(x => em.remove(x));
        roomChatCh.roomPubMsgs.removeAll();
    }
    room.roomChatChs.getItems().forEach(x => em.remove(x));
    room.roomChatChs.removeAll();

    await room.roomPrvMsgs.init();
    room.roomPrvMsgs.getItems().forEach(x => em.remove(x));
    room.roomPrvMsgs.removeAll();

    await room.roomSes.init();
    room.roomSes.getItems().forEach(x => em.remove(x));
    room.roomSes.removeAll();

    await room.participants.init();
    room.participants.getItems().forEach(x => em.remove(x));
    room.participants.removeAll();

    await room.dicePieceLogs.init();
    room.dicePieceLogs.getItems().forEach(x => em.remove(x));
    room.dicePieceLogs.removeAll();

    await room.stringPieceLogs.init();
    room.stringPieceLogs.getItems().forEach(x => em.remove(x));
    room.stringPieceLogs.removeAll();

    em.remove(room);
};
