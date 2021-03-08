import { Entity, IdentifiedReference, Index, JsonType, ManyToOne, PrimaryKey, Property, Reference, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { FilePath } from '../../filePath/global';
import { Room, RoomOp } from '../mikro-orm';

type RoomBgmBaseParams = {
    channelKey: string;
    files: FilePath[];
    volume: number;
};

@Entity()
export abstract class RoomBgmBase {
    public constructor({
        channelKey,
        files,
        volume,
    }: RoomBgmBaseParams) {
        this.channelKey = channelKey;
        this.files = files;
        this.volume = volume;
    }

    @PrimaryKey()
    public id: string = v4();

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;


    // 現在は'1'～'5'が使用可能ということにしている。
    @Property()
    @Index()
    public channelKey: string;

    @Property({ type: JsonType })
    public files: FilePath[];

    @Property()
    public volume: number;
}

@Entity()
@Unique({ properties: ['room', 'channelKey'] })
export class RoomBgm extends RoomBgmBase {
    public constructor(params: RoomBgmBaseParams & {room: Room}) {
        super(params);
        this.room = Reference.create(params.room);
    }

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room: IdentifiedReference<Room>;
}

@Entity()
@Unique({ properties: ['roomOp', 'channelKey'] })
export class AddRoomBgmOp {
    public constructor({
        channelKey,
        roomOp,
    }: {
        channelKey: string;
        roomOp: RoomOp;
    }) {
        this.channelKey = channelKey;
        this.roomOp = Reference.create(roomOp);
    }

    @PrimaryKey()
    public id: string = v4();


    @Property()
    @Index()
    public channelKey: string;


    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp: IdentifiedReference<RoomOp>;
}

@Entity()
@Unique({ properties: ['roomOp', 'channelKey'] })
export class RemoveRoomBgmOp extends RoomBgmBase {
    public constructor(params: RoomBgmBaseParams & { roomOp: RoomOp }) {
        super(params);
        this.roomOp = Reference.create(params.roomOp);
    }

    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp: IdentifiedReference<RoomOp>;
}

@Entity()
@Unique({ properties: ['roomOp', 'channelKey'] })
export class UpdateRoomBgmOp {
    public constructor({
        channelKey,
        roomOp,
    }: {
        channelKey: string;
        roomOp: RoomOp;
    }) {
        this.channelKey = channelKey;
        this.roomOp = Reference.create(roomOp);
    }

    @PrimaryKey()
    public id: string = v4();


    // 現在は'1'～'5'が使用可能ということにしている。
    @Property()
    @Index()
    public channelKey: string;


    @Property({ type: JsonType, nullable: true })
    public files?: FilePath[];

    @Property({ nullable: true })
    public volume?: number;


    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp: IdentifiedReference<RoomOp>;
}
