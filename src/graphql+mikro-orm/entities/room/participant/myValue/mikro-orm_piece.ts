import { Entity, IdentifiedReference, Index, ManyToOne, PrimaryKey, Property, Reference, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { RemoveParticiOp } from '../mikro-orm';
import { RemoveMyValueOp, MyValue, UpdateMyValueOp, RemovedMyValue } from './mikro-orm_value';

type MyValuePieceBaseParams = {
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
}

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
    }: MyValuePieceBaseParams) {
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
@Unique({ properties: ['myValue', 'boardId', 'boardCreatedBy'], name: 'my_value_piece_unique' })
export class MyValuePiece extends MyValuePieceBase {
    public constructor(params: MyValuePieceBaseParams & { myValue: MyValue }) {
        super(params);
        this.myValue = Reference.create(params.myValue);
    }

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => MyValue, { wrappedReference: true })
    public myValue: IdentifiedReference<MyValue>;
}

@Entity()
@Unique({ properties: ['boardId', 'boardCreatedBy', 'removedMyValue'], name: 'removed_my_value_piece_by_partici_unique'})
export class RemovedMyValuePieceByPartici extends MyValuePieceBase {
    public constructor(params: MyValuePieceBaseParams & { removedMyValue: RemovedMyValue }) {
        super(params);
        this.removedMyValue = Reference.create(params.removedMyValue);
    }

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => RemovedMyValue, { wrappedReference: true })
    public removedMyValue: IdentifiedReference<RemovedMyValue>;
}

@Entity()
@Unique({ properties: ['boardId', 'boardCreatedBy', 'removeMyValueOp'], name: 'removed_my_value_piece_by_my_value_unique' })
export class RemovedMyValuePieceByMyValue extends MyValuePieceBase {
    public constructor(params: MyValuePieceBaseParams & { removeMyValueOp: RemoveMyValueOp }) {
        super(params);
        this.removeMyValueOp = Reference.create(params.removeMyValueOp);
    }

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => RemoveMyValueOp, { wrappedReference: true })
    public removeMyValueOp: IdentifiedReference<RemoveMyValueOp>;
}

@Entity()
@Unique({ properties: ['boardId', 'boardCreatedBy', 'updateMyValueOp'], name: 'add_my_value_piece_op_unique' })
export class AddMyValuePieceOp {
    public constructor({
        boardId,
        boardCreatedBy,
        updateMyValueOp,
    }: {
        boardId: string;
        boardCreatedBy: string;
        updateMyValueOp: UpdateMyValueOp;
    }) {
        this.boardId = boardId;
        this.boardCreatedBy = boardCreatedBy;
        this.updateMyValueOp = Reference.create(updateMyValueOp);
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
    public updateMyValueOp: IdentifiedReference<UpdateMyValueOp>;
}

@Entity()
@Unique({ properties: ['boardId', 'boardCreatedBy', 'updateMyValueOp'], name: 'remove_my_value_piece_op_unique' })
export class RemoveMyValuePieceOp extends MyValuePieceBase {
    public constructor(params: MyValuePieceBaseParams & { updateMyValueOp: UpdateMyValueOp }) {
        super(params);
        this.updateMyValueOp = Reference.create(params.updateMyValueOp);
    }

    @ManyToOne(() => UpdateMyValueOp, { wrappedReference: true })
    public updateMyValueOp: IdentifiedReference<UpdateMyValueOp>;
}

@Entity()
@Unique({ properties: ['boardId', 'boardCreatedBy', 'updateMyValueOp'], name: 'update_my_value_piece_op_unique' })
export class UpdateMyValuePieceOp {
    public constructor({
        boardId,
        boardCreatedBy,
        updateMyValueOp,
    }: {
        boardId: string;
        boardCreatedBy: string;
        updateMyValueOp: UpdateMyValueOp;
    }) {
        this.boardId = boardId;
        this.boardCreatedBy = boardCreatedBy;
        this.updateMyValueOp = Reference.create(updateMyValueOp);
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
    public updateMyValueOp: IdentifiedReference<UpdateMyValueOp>;
}
