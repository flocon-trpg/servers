import { Entity, IdentifiedReference, Index, ManyToOne, PrimaryKey, Property, Reference, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { GlobalPiece } from '../../../piece/global';
import { Chara, RemoveCharaOp, UpdateCharaOp } from '../mikro-orm';

type CharaPieceBaseParams = {
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

export abstract class CharaPieceBase implements GlobalPiece.StateEntityBase {
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
    }: CharaPieceBaseParams) {
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
@Unique({ properties: ['chara', 'boardCreatedBy', 'boardId'], name: 'chara_piece_unique' })
export class CharaPiece extends CharaPieceBase {
    public constructor(params: CharaPieceBaseParams & { chara: Chara }) {
        super(params);
        this.chara = Reference.create(params.chara);
    }

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => Chara, { wrappedReference: true })
    public chara: IdentifiedReference<Chara>;
}

@Entity()
@Unique({ properties: ['removeCharaOp', 'boardCreatedBy', 'boardId'], name: 'removed_chara_piece_unique' })
export class RemovedCharaPiece extends CharaPieceBase {
    public constructor(params: CharaPieceBaseParams & { removeCharaOp: RemoveCharaOp }) {
        super(params);
        this.removeCharaOp = Reference.create(params.removeCharaOp);
    }

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => RemoveCharaOp, { wrappedReference: true })
    public removeCharaOp: IdentifiedReference<RemoveCharaOp>;
}

@Entity()
@Unique({ properties: ['updateCharaOp', 'boardCreatedBy', 'boardId'], name: 'add_chara_piece_op_unique' })
export class AddCharaPieceOp {
    public constructor({
        boardId,
        boardCreatedBy,
        updateCharaOp,
    }: {
        boardId: string;
        boardCreatedBy: string;
        updateCharaOp: UpdateCharaOp;
    }) {
        this.boardId = boardId;
        this.boardCreatedBy = boardCreatedBy;
        this.updateCharaOp = Reference.create(updateCharaOp);
    }

    @PrimaryKey()
    public id: string = v4();

    @Property()
    @Index()
    public boardId: string;

    @Property()
    @Index()
    public boardCreatedBy: string;


    @ManyToOne(() => UpdateCharaOp, { wrappedReference: true })
    public updateCharaOp: IdentifiedReference<UpdateCharaOp>;
}

@Entity()
@Unique({ properties: ['updateCharaOp', 'boardCreatedBy', 'boardId'], name: 'remove_chara_piece_op_unique' })
export class RemoveCharaPieceOp extends CharaPieceBase {
    public constructor(params: CharaPieceBaseParams & { updateCharaOp: UpdateCharaOp }) {
        super(params);
        this.updateCharaOp = Reference.create(params.updateCharaOp);
    }

    @ManyToOne(() => UpdateCharaOp, { wrappedReference: true })
    public updateCharaOp: IdentifiedReference<UpdateCharaOp>;
}

@Entity()
@Unique({ properties: ['updateCharaOp', 'boardCreatedBy', 'boardId'], name: 'update_chara_piece_op_unique' })
export class UpdateCharaPieceOp implements GlobalPiece.DownOperationEntityBase {
    public constructor({
        boardId,
        boardCreatedBy,
        updateCharaOp,
    }: {
        boardId: string;
        boardCreatedBy: string;
        updateCharaOp: UpdateCharaOp;
    }) {
        this.boardId = boardId;
        this.boardCreatedBy = boardCreatedBy;
        this.updateCharaOp = Reference.create(updateCharaOp);
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


    @ManyToOne(() => UpdateCharaOp, { wrappedReference: true })
    public updateCharaOp: IdentifiedReference<UpdateCharaOp>;
}
