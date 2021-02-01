import { Cascade, Collection, Entity, Enum, IdentifiedReference, Index, JsonType, ManyToOne, OneToMany, PrimaryKey, PrimaryKeyType, Property, Reference, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { FileSourceType } from '../../../enums/FileSourceType';
import { ReplaceNullableBooleanDownOperation, ReplaceNullableFilePathDownOperation, ReplaceNullableNumberDownOperation, ReplaceNullableStringDownOperation, TextDownOperationUnit } from '../../Operations';
import { BoolParam, RemovedBoolParam, UpdateBoolParamOp } from './boolParam/mikro-orm';
import { AddNumParamOp, NumMaxParam, NumParam, RemovedNumMaxParam, RemovedNumParam, UpdateNumMaxParamOp, UpdateNumParamOp } from './numParam/mikro-orm';
import { AddPieceLocOp, PieceLoc, RemovedPieceLoc, RemovePieceLocOp, UpdatePieceLocOp } from './pieceLocation/mikro-orm';
import { Room, RoomOp } from '../room/mikro-orm';
import { RemovedStrParam, StrParam, UpdateStrParamOp } from './strParam/mikro-orm';
import { RoomPrvMsg, RoomPubMsg } from '../roomMessage/mikro-orm';

// TODO: @Unique

// Chara = Character

export abstract class CharaBase {
    public constructor({
        createdBy,
        stateId,
        isPrivate,
        name,
    }: {
        createdBy: string;
        stateId: string;
        isPrivate: boolean;
        name: string;
    }) {
        this.createdBy = createdBy;
        this.stateId = stateId;
        this.isPrivate = isPrivate;
        this.name = name;
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
    public isPrivate: boolean;

    @Property()
    public name: string;

    // CONSIDER: デフォルトではPostgreSQLの場合varchar(255)になるため、lengthを設定している。値は適当（MySQLの最大値）。
    @Property({ nullable: true, length: 65535 })
    public imagePath?: string;

    @Enum({ items: () => FileSourceType, nullable: true })
    public imageSourceType?: FileSourceType;
}

@Entity()
@Unique({ properties: ['createdBy', 'stateId'] })
export class Chara extends CharaBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @OneToMany(() => BoolParam, x => x.chara, { orphanRemoval: true })
    public boolParams = new Collection<BoolParam>(this);

    @OneToMany(() => NumParam, x => x.chara, { orphanRemoval: true })
    public numParams = new Collection<NumParam>(this);

    @OneToMany(() => NumMaxParam, x => x.chara, { orphanRemoval: true })
    public numMaxParams = new Collection<NumMaxParam>(this);

    @OneToMany(() => StrParam, x => x.chara, { orphanRemoval: true })
    public strParams = new Collection<StrParam>(this);

    @OneToMany(() => PieceLoc, x => x.chara, { orphanRemoval: true })
    public pieceLocs = new Collection<PieceLoc>(this);

    @ManyToOne(() => Room, { wrappedReference: true })
    public room!: IdentifiedReference<Room>;
}

// DBにはDownOperationとして保存されるため、AddCharaOpはCharaの情報を持たない。
@Entity()
export class AddCharaOp {
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
export class RemoveCharaOp extends CharaBase {
    @OneToMany(() => RemovedBoolParam, x => x.removeCharaOp, { orphanRemoval: true })
    public removedBoolParam = new Collection<RemovedBoolParam>(this);

    @OneToMany(() => RemovedNumParam, x => x.removeCharaOp, { orphanRemoval: true })
    public removedNumParam = new Collection<RemovedNumParam>(this);

    @OneToMany(() => RemovedNumMaxParam, x => x.removeCharaOp, { orphanRemoval: true })
    public removedNumMaxParam = new Collection<RemovedNumMaxParam>(this);

    @OneToMany(() => RemovedStrParam, x => x.removeCharaOp, { orphanRemoval: true })
    public removedStrParam = new Collection<RemovedStrParam>(this);

    @OneToMany(() => RemovedPieceLoc, x => x.removeCharaOp, { orphanRemoval: true })
    public removedPieceLoc = new Collection<RemovedPieceLoc>(this);

    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp!: IdentifiedReference<RoomOp>;
}

@Entity()
export class UpdateCharaOp {
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
    public isPrivate?: boolean;

    @Property({ nullable: true })
    public name?: string;

    @Property({ type: JsonType, nullable: true })
    public image?: ReplaceNullableFilePathDownOperation;


    @OneToMany(() => UpdateBoolParamOp, x => x.updateCharaOp, { orphanRemoval: true })
    public updateBoolParamOps = new Collection<UpdateBoolParamOp>(this);

    @OneToMany(() => AddNumParamOp, x => x.updateCharaOp, { orphanRemoval: true })
    public addNumParamOps = new Collection<AddNumParamOp>(this);
    @OneToMany(() => UpdateNumParamOp, x => x.updateCharaOp, { orphanRemoval: true })
    public updateNumParamOps = new Collection<UpdateNumParamOp>(this);

    @OneToMany(() => UpdateNumMaxParamOp, x => x.updateCharaOp, { orphanRemoval: true })
    public updateNumMaxParamOps = new Collection<UpdateNumMaxParamOp>(this);

    @OneToMany(() => UpdateStrParamOp, x => x.updateCharaOp, { orphanRemoval: true })
    public updateStrParamOps = new Collection<UpdateStrParamOp>(this);

    @OneToMany(() => AddPieceLocOp, x => x.updateCharaOp, { orphanRemoval: true })
    public addPieceLocOps = new Collection<AddPieceLocOp>(this);
    @OneToMany(() => RemovePieceLocOp, x => x.updateCharaOp, { orphanRemoval: true })
    public removePieceLocOps = new Collection<RemovePieceLocOp>(this);
    @OneToMany(() => UpdatePieceLocOp, x => x.updateCharaOp, { orphanRemoval: true })
    public updatePieceLocOps = new Collection<UpdatePieceLocOp>(this);


    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp!: IdentifiedReference<RoomOp>;
}