import { Collection, Entity, IdentifiedReference, Index, JsonType, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Partici, RemoveParticiOp, UpdateParticiOp } from '../mikro-orm';
import { MyValueOperationJsonType, MyValueStateJsonType } from './jsonType';
import { AddMyValuePieceOp, MyValuePiece, RemovedMyValuePieceByPartici, RemovedMyValuePieceByMyValue, RemoveMyValuePieceOp, UpdateMyValuePieceOp } from './mikro-orm_piece';
import { NumberValueOperationJsonType } from './number/jsonType';

export abstract class MyValueBase {
    public constructor({
        stateId,
        value,
    }: {
        stateId: string;
        value: MyValueStateJsonType;
    }) {
        this.stateId = stateId;
        this.value = value;
    }

    @PrimaryKey()
    public id: string = v4();


    @Property()
    @Index()
    public stateId: string;


    @Property({ type: JsonType })
    public value: MyValueStateJsonType;
}

@Entity()
@Unique({ properties: ['partici', 'stateId'] })
export class MyValue extends MyValueBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @OneToMany(() => MyValuePiece, x => x.myValue, { orphanRemoval: true })
    public myValuePieces = new Collection<MyValuePiece>(this);

    @ManyToOne(() => Partici, { wrappedReference: true })
    public partici!: IdentifiedReference<Partici>;
}

@Entity()
@Unique({ properties: ['updateParticiOp', 'stateId'] })
export class RemoveMyValueOp extends MyValueBase {
    @OneToMany(() => RemovedMyValuePieceByMyValue, x => x.removeMyValueOp, { orphanRemoval: true })
    public removedMyValuePieces = new Collection<RemovedMyValuePieceByMyValue>(this);

    @ManyToOne(() => UpdateParticiOp, { wrappedReference: true })
    public updateParticiOp!: IdentifiedReference<UpdateParticiOp>;
}

@Entity()
@Unique({ properties: ['removeParticiOp', 'stateId'] })
export class RemovedMyValue extends MyValueBase {
    @OneToMany(() => RemovedMyValuePieceByPartici, x => x.removedMyValue, { orphanRemoval: true })
    public removedMyValuePieces = new Collection<RemovedMyValuePieceByPartici>(this);

    @ManyToOne(() => RemoveParticiOp, { wrappedReference: true })
    public removeParticiOp!: IdentifiedReference<RemoveParticiOp>;
}

// DBにはDownOperationとして保存されるため、AddMyValueOpはMyValueの情報を持たない。
@Entity()
@Unique({ properties: ['updateParticiOp', 'stateId'] })
export class AddMyValueOp {
    public constructor({
        stateId,
    }: {
        stateId: string;
    }) {
        this.stateId = stateId;
    }

    @PrimaryKey()
    public id: string = v4();


    @Property()
    @Index()
    public stateId: string;


    @ManyToOne(() => UpdateParticiOp, { wrappedReference: true })
    public updateParticiOp!: IdentifiedReference<UpdateParticiOp>;
}

@Entity()
@Unique({ properties: ['updateParticiOp', 'stateId'] })
export class UpdateMyValueOp {
    public constructor({
        stateId,
        value,
    }: {
        stateId: string;
        value: NumberValueOperationJsonType;
    }) {
        this.stateId = stateId;
        this.value = value;
    }

    @PrimaryKey()
    public id: string = v4();


    @Property()
    @Index()
    public stateId: string;


    @Property({ type: JsonType })
    public value: MyValueOperationJsonType;


    @OneToMany(() => AddMyValuePieceOp, x => x.updateMyValueOp, { orphanRemoval: true })
    public addPieceOps = new Collection<AddMyValuePieceOp>(this);
    @OneToMany(() => RemoveMyValuePieceOp, x => x.updateMyValueOp, { orphanRemoval: true })
    public removePieceOps = new Collection<RemoveMyValuePieceOp>(this);
    @OneToMany(() => UpdateMyValuePieceOp, x => x.updateMyValueOp, { orphanRemoval: true })
    public updatePieceOps = new Collection<UpdateMyValuePieceOp>(this);


    @ManyToOne(() => UpdateParticiOp, { wrappedReference: true })
    public updateParticiOp!: IdentifiedReference<UpdateParticiOp>;
}