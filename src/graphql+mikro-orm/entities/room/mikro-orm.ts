import { DbState, DownOperation } from '@kizahasi/flocon-core';
import {
    Collection,
    Entity,
    IdentifiedReference,
    JsonType,
    ManyToOne,
    OneToMany,
    PrimaryKey,
    Property,
    Unique,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { easyFlake } from '../../../utils/easyFlake';
import { EM } from '../../../utils/types';
import {
    DicePieceValueLog as DicePieceValueLogEntity,
    NumberPieceValueLog as NumberPieceValueLogEntity,
    RoomPrvMsg,
    RoomPubCh,
    RoomSe as RoomSe,
} from '../roomMessage/mikro-orm';

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
    public id: string = easyFlake();

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true, index: true })
    public version: number = 1;

    @Property({ type: Date, nullable: true, onUpdate: () => new Date(), index: true })
    public updatedAt?: Date;

    @Property({ nullable: true })
    public joinAsPlayerPhrase?: string;

    @Property({ nullable: true })
    public joinAsSpectatorPhrase?: string;

    // userUid
    @Property({ index: true })
    public createdBy: string;

    @Property()
    public name: string;

    @Property({ type: JsonType })
    public value: DbState;

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property()
    public revision: number = 0;

    @OneToMany(() => RoomOp, x => x.room, { orphanRemoval: true })
    public roomOperations = new Collection<RoomOp>(this);

    @OneToMany(() => RoomPubCh, x => x.room, { orphanRemoval: true })
    public roomChatChs = new Collection<RoomPubCh>(this);

    @OneToMany(() => RoomPrvMsg, x => x.room, { orphanRemoval: true })
    public roomPrvMsgs = new Collection<RoomPrvMsg>(this);

    @OneToMany(() => DicePieceValueLogEntity, x => x.room, { orphanRemoval: true })
    public dicePieceValueLogs = new Collection<DicePieceValueLogEntity>(this);

    @OneToMany(() => NumberPieceValueLogEntity, x => x.room, { orphanRemoval: true })
    public numberPieceValueLogs = new Collection<NumberPieceValueLogEntity>(this);

    @OneToMany(() => RoomSe, x => x.room, { orphanRemoval: true })
    public roomSes = new Collection<RoomSe>(this);
}

@Entity()
@Unique({ properties: ['prevRevision', 'room'] })
export class RoomOp {
    public constructor({ prevRevision, value }: { prevRevision: number; value: DownOperation }) {
        this.prevRevision = prevRevision;
        this.value = value;
    }

    @PrimaryKey()
    public id: string = v4();

    @Property({ index: true })
    public prevRevision: number;

    @Property({ type: JsonType })
    public value: DownOperation;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room!: IdentifiedReference<Room>;
}

// このメソッドではflushは行われない。flushのし忘れに注意。
export const deleteRoom = async (em: EM, room: Room): Promise<void> => {
    await room.roomOperations.init();
    room.roomOperations.removeAll();

    for (const roomChatCh of await room.roomChatChs.loadItems()) {
        await roomChatCh.roomPubMsgs.init();
        roomChatCh.roomPubMsgs.removeAll();
    }
    room.roomChatChs.removeAll();

    await room.roomPrvMsgs.init();
    room.roomPrvMsgs.removeAll();

    await room.roomSes.init();
    room.roomSes.removeAll();

    em.remove(room);
};
