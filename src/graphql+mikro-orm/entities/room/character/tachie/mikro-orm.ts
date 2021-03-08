import { Entity, IdentifiedReference, Index, ManyToOne, PrimaryKey, Property, Reference, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { GlobalBoardLocation } from '../../../boardLocation/global';
import { Chara, RemoveCharaOp, UpdateCharaOp } from '../mikro-orm';

type TachieLocationBaseParams = {
    boardId: string;
    boardCreatedBy: string;
    isPrivate: boolean;
    x: number;
    y: number;
    w: number;
    h: number;
}

// TachieLocation → TachieLoc

// もしBoardが削除されたときに強制的に該当するPieceLocationが削除されるとOperational transformationの際に困ったことになりそうなので、Boardとのリレーションはない。JOINに相当する処理はブラウザ側で行う。

export abstract class TachieLocBase implements GlobalBoardLocation.StateEntityBase {
    public constructor({
        boardId,
        boardCreatedBy,
        isPrivate,
        x,
        y,
        w,
        h,
    }: TachieLocationBaseParams) {
        this.boardId = boardId;
        this.boardCreatedBy = boardCreatedBy;
        this.isPrivate = isPrivate;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
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
    public x: number;

    @Property()
    public y: number;

    @Property()
    public w: number;

    @Property()
    public h: number;
}

@Entity()
@Unique({ properties: ['chara', 'boardCreatedBy', 'boardId']})
export class TachieLoc extends TachieLocBase {
    public constructor(params: TachieLocationBaseParams & { chara: Chara}) {
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
@Unique({ properties: ['removeCharaOp', 'boardCreatedBy', 'boardId'] })
export class RemovedTachieLoc extends TachieLocBase {
    public constructor(params: TachieLocationBaseParams & { removeCharaOp: RemoveCharaOp }) {
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
@Unique({ properties: ['updateCharaOp', 'boardCreatedBy', 'boardId'] })
export class AddTachieLocOp {
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
@Unique({ properties: ['updateCharaOp', 'boardCreatedBy', 'boardId'] })
export class RemoveTachieLocOp extends TachieLocBase {
    public constructor(params: TachieLocationBaseParams & { updateCharaOp: UpdateCharaOp }) {
        super(params);
        this.updateCharaOp = Reference.create(params.updateCharaOp);
    }

    @ManyToOne(() => UpdateCharaOp, { wrappedReference: true })
    public updateCharaOp: IdentifiedReference<UpdateCharaOp>;
}

@Entity()
@Unique({ properties: ['updateCharaOp', 'boardCreatedBy', 'boardId'] })
export class UpdateTachieLocOp implements GlobalBoardLocation.DownOperationEntityBase {
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
    public x?: number;

    @Property({ nullable: true })
    public y?: number;

    @Property({ nullable: true })
    public w?: number;

    @Property({ nullable: true })
    public h?: number;


    @ManyToOne(() => UpdateCharaOp, { wrappedReference: true })
    public updateCharaOp: IdentifiedReference<UpdateCharaOp>;
}
