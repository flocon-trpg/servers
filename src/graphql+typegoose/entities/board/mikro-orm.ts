import { Entity, Enum, IdentifiedReference, Index, JsonType, ManyToOne, PrimaryKey, PrimaryKeyType, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { FileSourceType } from '../../../enums/FileSourceType';
import { ReplaceNullableFilePathDownOperation, ReplaceNullableNumberDownOperation } from '../../Operations';
import { Room, RoomOp } from '../room/mikro-orm';

export abstract class BoardBase {
    public constructor({
        createdBy,
        stateId,
        name,
        cellWidth,
        cellHeight,
        cellRowCount,
        cellColumnCount,
        cellOffsetX,
        cellOffsetY,
    }: {
        createdBy: string;
        stateId: string;
        name: string;
        cellWidth: number;
        cellHeight: number;
        cellRowCount: number;
        cellColumnCount: number;
        cellOffsetX: number;
        cellOffsetY: number;
    }) {
        this.createdBy = createdBy;
        this.stateId = stateId;
        this.name = name;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.cellRowCount = cellRowCount;
        this.cellColumnCount = cellColumnCount;
        this.cellOffsetX = cellOffsetX;
        this.cellOffsetY = cellOffsetY;
    }

    @PrimaryKey()
    public id: string = v4();


    @Property()
    @Index()
    public createdBy: string;

    @Property()
    @Index()
    public stateId: string;


    @Property()
    public name: string;

    @Property()
    public cellWidth: number;

    @Property()
    public cellHeight: number;

    @Property()
    public cellRowCount: number;

    @Property()
    public cellColumnCount: number;

    @Property()
    public cellOffsetX: number;

    @Property()
    public cellOffsetY: number;

    // CONSIDER: デフォルトではPostgreSQLの場合varchar(255)になるため、lengthを設定している。値は適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535 })
    public backgroundImagePath?: string;

    @Enum({ items: () => FileSourceType, nullable: true })
    public backgroundImageSourceType?: FileSourceType;
}

@Entity()
@Unique({ properties: ['createdBy', 'stateId'] })
export class Board extends BoardBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room!: IdentifiedReference<Room>;
}

// DBにはDownOperationとして保存されるため、AddBoardOpはBoardの情報を持たない。
@Entity()
@Unique({ properties: ['roomOp', 'createdBy', 'stateId'] })
export class AddBoardOp {
    public constructor({
        createdBy,
        stateId,
    }: {
        createdBy: string;
        stateId: string;
    }) {
        this.createdBy = createdBy;
        this.stateId = stateId;
    }

    @PrimaryKey()
    public id: string = v4();


    @Property()
    @Index()
    public createdBy: string;

    @Property()
    @Index()
    public stateId: string;


    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp!: IdentifiedReference<RoomOp>;
}

@Entity()
@Unique({ properties: ['roomOp', 'createdBy', 'stateId'] })
export class RemoveBoardOp extends BoardBase {
    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp!: IdentifiedReference<RoomOp>;
}

@Entity()
@Unique({ properties: ['roomOp', 'createdBy', 'stateId'] })
export class UpdateBoardOp {
    public constructor({
        createdBy,
        stateId,
    }: {
        createdBy: string;
        stateId: string;
    }) {
        this.createdBy = createdBy;
        this.stateId = stateId;
    }

    @PrimaryKey()
    public id: string = v4();


    @Property()
    @Index()
    public createdBy: string;

    @Property()
    @Index()
    public stateId: string;


    @Property({ nullable: true })
    public name?: string;

    @Property({ nullable: true })
    public cellWidth?: number;

    @Property({ nullable: true })
    public cellHeight?: number;

    @Property({ nullable: true })
    public cellRowCount?: number;

    @Property({ nullable: true })
    public cellColumnCount?: number;

    @Property({ nullable: true })
    public cellOffsetX?: number;

    @Property({ nullable: true })
    public cellOffsetY?: number;

    @Property({ type: JsonType, nullable: true })
    public backgroundImage?: ReplaceNullableFilePathDownOperation;


    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp!: IdentifiedReference<RoomOp>;
}
