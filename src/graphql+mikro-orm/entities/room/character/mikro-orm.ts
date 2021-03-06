import { Collection, Entity, Enum, IdentifiedReference, Index, JsonType, ManyToOne, OneToMany, PrimaryKey, Property, Reference, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { FileSourceType } from '../../../../enums/FileSourceType';
import { ReplaceNullableFilePathDownOperation } from '../../../Operations';
import { BoolParam, RemovedBoolParam, UpdateBoolParamOp } from './boolParam/mikro-orm';
import { NumMaxParam, NumParam, RemovedNumMaxParam, RemovedNumParam, UpdateNumMaxParamOp, UpdateNumParamOp } from './numParam/mikro-orm';
import { AddCharaPieceOp, CharaPiece, RemovedCharaPiece, RemoveCharaPieceOp, UpdateCharaPieceOp } from './piece/mikro-orm';
import { Room, RoomOp } from '../mikro-orm';
import { RemovedStrParam, StrParam, UpdateStrParamOp } from './strParam/mikro-orm';

type CharaBaseParams = {
    createdBy: string;
    stateId: string;
    isPrivate: boolean;
    name: string;
}

// Chara = Character

export abstract class CharaBase {
    public constructor({
        createdBy,
        stateId,
        isPrivate,
        name,
    }: CharaBaseParams) {
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
    public constructor(params: CharaBaseParams & { room: Room }) {
        super(params);
        this.room = Reference.create(params.room);
    }

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

    @OneToMany(() => CharaPiece, x => x.chara, { orphanRemoval: true })
    public charaPieces = new Collection<CharaPiece>(this);

    @ManyToOne(() => Room, { wrappedReference: true })
    public room: IdentifiedReference<Room>;
}

// DBにはDownOperationとして保存されるため、AddCharaOpはCharaの情報を持たない。
@Entity()
@Unique({ properties: ['roomOp', 'createdBy', 'stateId'] })
export class AddCharaOp {
    public constructor({
        createdBy,
        stateId,
        roomOp,
    }: {
        createdBy: string;
        stateId: string;
        roomOp: RoomOp;
    }) {
        this.createdBy = createdBy;
        this.stateId = stateId;
        this.roomOp = Reference.create(roomOp);
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
    public roomOp: IdentifiedReference<RoomOp>;
}

@Entity()
@Unique({ properties: ['roomOp', 'createdBy', 'stateId'] })
export class RemoveCharaOp extends CharaBase {
    public constructor(params: CharaBaseParams & { roomOp: RoomOp }) {
        super(params);
        this.roomOp = Reference.create(params.roomOp);
    }

    @OneToMany(() => RemovedBoolParam, x => x.removeCharaOp, { orphanRemoval: true })
    public removedBoolParam = new Collection<RemovedBoolParam>(this);

    @OneToMany(() => RemovedNumParam, x => x.removeCharaOp, { orphanRemoval: true })
    public removedNumParam = new Collection<RemovedNumParam>(this);

    @OneToMany(() => RemovedNumMaxParam, x => x.removeCharaOp, { orphanRemoval: true })
    public removedNumMaxParam = new Collection<RemovedNumMaxParam>(this);

    @OneToMany(() => RemovedStrParam, x => x.removeCharaOp, { orphanRemoval: true })
    public removedStrParam = new Collection<RemovedStrParam>(this);

    @OneToMany(() => RemovedCharaPiece, x => x.removeCharaOp, { orphanRemoval: true })
    public removedCharaPieces = new Collection<RemovedCharaPiece>(this);

    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp: IdentifiedReference<RoomOp>;
}

@Entity()
@Unique({ properties: ['roomOp', 'createdBy', 'stateId'] })
export class UpdateCharaOp {
    public constructor({
        createdBy,
        stateId,
        roomOp,
    }: {
        createdBy: string;
        stateId: string;
        roomOp: RoomOp;
    }) {
        this.createdBy = createdBy;
        this.stateId = stateId;
        this.roomOp = Reference.create(roomOp);
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

    @OneToMany(() => UpdateNumParamOp, x => x.updateCharaOp, { orphanRemoval: true })
    public updateNumParamOps = new Collection<UpdateNumParamOp>(this);

    @OneToMany(() => UpdateNumMaxParamOp, x => x.updateCharaOp, { orphanRemoval: true })
    public updateNumMaxParamOps = new Collection<UpdateNumMaxParamOp>(this);

    @OneToMany(() => UpdateStrParamOp, x => x.updateCharaOp, { orphanRemoval: true })
    public updateStrParamOps = new Collection<UpdateStrParamOp>(this);

    @OneToMany(() => AddCharaPieceOp, x => x.updateCharaOp, { orphanRemoval: true })
    public addCharaPieceOps = new Collection<AddCharaPieceOp>(this);
    @OneToMany(() => RemoveCharaPieceOp, x => x.updateCharaOp, { orphanRemoval: true })
    public removeCharaPieceOps = new Collection<RemoveCharaPieceOp>(this);
    @OneToMany(() => UpdateCharaPieceOp, x => x.updateCharaOp, { orphanRemoval: true })
    public updateCharaPieceOps = new Collection<UpdateCharaPieceOp>(this);


    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp: IdentifiedReference<RoomOp>;
}