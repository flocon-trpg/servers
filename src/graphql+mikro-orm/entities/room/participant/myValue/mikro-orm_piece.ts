import { Entity, IdentifiedReference, Index, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { RemoveParticiOp } from '../mikro-orm';
import { RemoveMyValueOp, MyValue, UpdateMyValueOp, RemovedMyValue } from './mikro-orm_value';

// もしBoardが削除されたときに強制的に該当するPieceLocationが削除されるとOperational transformationの際に困ったことになりそうなので、Boardとのリレーションはない。JOINに相当する処理はブラウザ側で行う。

abstract class MyValuePieceBase {
    public constructor({
        boardId,
        boardCreatedBy,
        isPrivate,
        isCellMode,
        x,
        y,
        w,
        h,
        cellX,
        cellY,
        cellW,
        cellH,
    }: {
        boardId: string;
        boardCreatedBy: string;
        isPrivate: boolean;
        isCellMode: boolean;
        x: number;
        y: number;
        w: number;
        h: number;
        cellX: number;
        cellY: number;
        cellW: number;
        cellH: number;
    }) {
        this.boardId = boardId;
        this.boardCreatedBy = boardCreatedBy;
        this.isPrivate = isPrivate;
        this.isCellMode = isCellMode;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.cellX = cellX;
        this.cellY = cellY;
        this.cellW = cellW;
        this.cellH = cellH;
    }

    @PrimaryKey()
    public id: string = v4();

    @Property()
    @Index()
    public boardId: string;

    @Property()
    @Index()
    public boardCreatedBy: string;


    @Property()
    public isPrivate: boolean;


    @Property()
    public isCellMode: boolean;


    @Property()
    public x: number;

    @Property()
    public y: number;

    @Property()
    public w: number;

    @Property()
    public h: number;


    @Property()
    public cellX: number;

    @Property()
    public cellY: number;

    @Property()
    public cellW: number;

    @Property()
    public cellH: number;
}

@Entity()
@Unique({ properties: ['boardId', 'boardCreatedBy'] })
export class MyValuePiece extends MyValuePieceBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => MyValue, { wrappedReference: true })
    public myValue!: IdentifiedReference<MyValue>;
}

@Entity()
@Unique({ properties: ['boardId', 'boardCreatedBy', 'removedMyValue'] })
export class RemovedMyValuePieceByPartici extends MyValuePieceBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => RemovedMyValue, { wrappedReference: true })
    public removedMyValue!: IdentifiedReference<RemovedMyValue>;
}

@Entity()
@Unique({ properties: ['boardId', 'boardCreatedBy', 'removeMyValueOp'] })
export class RemovedMyValuePieceByMyValue extends MyValuePieceBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => RemoveMyValueOp, { wrappedReference: true })
    public removeMyValueOp!: IdentifiedReference<RemoveMyValueOp>;
}

@Entity()
@Unique({ properties: ['boardId', 'boardCreatedBy', 'updateMyValueOp'] })
export class AddMyValuePieceOp {
    public constructor({
        boardId,
        boardCreatedBy,
    }: {
        boardId: string;
        boardCreatedBy: string;
    }) {
        this.boardId = boardId;
        this.boardCreatedBy = boardCreatedBy;
    }

    @PrimaryKey()
    public id: string = v4();

    @Property()
    @Index()
    public boardId: string;

    @Property()
    @Index()
    public boardCreatedBy: string;


    @ManyToOne(() => UpdateMyValueOp, { wrappedReference: true })
    public updateMyValueOp!: IdentifiedReference<UpdateMyValueOp>;
}

@Entity()
@Unique({ properties: ['boardId', 'boardCreatedBy', 'updateMyValueOp'] })
export class RemoveMyValuePieceOp extends MyValuePieceBase {
    @ManyToOne(() => UpdateMyValueOp, { wrappedReference: true })
    public updateMyValueOp!: IdentifiedReference<UpdateMyValueOp>;
}

@Entity()
@Unique({ properties: ['boardId', 'boardCreatedBy', 'updateMyValueOp'] })
export class UpdateMyValuePieceOp {
    public constructor({
        boardId,
        boardCreatedBy,
    }: {
        boardId: string;
        boardCreatedBy: string;
    }) {
        this.boardId = boardId;
        this.boardCreatedBy = boardCreatedBy;
    }

    @PrimaryKey()
    public id: string = v4();

    @Property()
    @Index()
    public boardId: string;

    @Property()
    @Index()
    public boardCreatedBy: string;


    @Property({ nullable: true })
    public isPrivate?: boolean;

    @Property({ nullable: true })
    public isCellMode?: boolean;

    @Property({ nullable: true })
    public x?: number;

    @Property({ nullable: true })
    public y?: number;

    @Property({ nullable: true })
    public w?: number;

    @Property({ nullable: true })
    public h?: number;

    @Property({ nullable: true })
    public cellX?: number;

    @Property({ nullable: true })
    public cellY?: number;

    @Property({ nullable: true })
    public cellW?: number;

    @Property({ nullable: true })
    public cellH?: number;


    @ManyToOne(() => UpdateMyValueOp, { wrappedReference: true })
    public updateMyValueOp!: IdentifiedReference<UpdateMyValueOp>;
}
