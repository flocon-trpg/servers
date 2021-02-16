import { Entity, IdentifiedReference, Index, JsonType, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { ReplaceFilePathArrayDownOperation } from '../../../Operations';
import { FilePath } from '../../filePath/global';
import { Room, RoomOp } from '../mikro-orm';

@Entity()
export abstract class RoomBgmBase {
    public constructor({
        channelKey,
        files,
        volume,
    }: {
        channelKey: string;
        files: FilePath[];
        volume: number;
    }) {
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


    @ManyToOne(() => Room, { wrappedReference: true })
    public room!: IdentifiedReference<Room>;
}

@Entity()
@Unique({ properties: ['room', 'channelKey'] })
export class RoomBgm extends RoomBgmBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room!: IdentifiedReference<Room>;
}

@Entity()
@Unique({ properties: ['roomOp', 'channelKey'] })
export class AddRoomBgmOp {
    public constructor({
        channelKey,
    }: {
            channelKey: string;
    }) {
        this.channelKey = channelKey;
    }

    @PrimaryKey()
    public id: string = v4();


    @Property()
    @Index()
    public channelKey: string;


    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp!: IdentifiedReference<RoomOp>;
}

@Entity()
@Unique({ properties: ['roomOp', 'channelKey'] })
export class RemoveRoomBgmOp extends RoomBgmBase {
    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp!: IdentifiedReference<RoomOp>;
}

@Entity()
@Unique({ properties: ['roomOp', 'channelKey'] })
export class UpdateRoomBgmOp {
    public constructor({
        channelKey,
    }: {
        channelKey: string;
    }) {
        this.channelKey = channelKey;
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
    public roomOp!: IdentifiedReference<RoomOp>;
}
