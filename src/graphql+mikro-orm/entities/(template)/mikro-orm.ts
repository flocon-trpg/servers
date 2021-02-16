import { Entity, IdentifiedReference, Index, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Room, RoomOp } from '../room/mikro-orm';

export abstract class FoobarBase {
    public constructor({
        createdBy,
        stateId,
        isPrivate,
        hoge,
    }: {
        createdBy: string;
        stateId: string;
        isPrivate: boolean;
        hoge: number;
    }) {
        this.createdBy = createdBy;
        this.stateId = stateId;
        this.isPrivate = isPrivate;
        this.hoge = hoge;
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
    public hoge: number;
}

@Entity()
@Unique({ properties: ['room', 'createdBy', 'stateId'] })
export class Foobar extends FoobarBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room!: IdentifiedReference<Room>;
}

@Entity()
@Unique({ properties: ['roomOp', 'createdBy', 'stateId'] })
export class AddFoobarOp {
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
export class RemoveFoobarOp extends FoobarBase {
    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp!: IdentifiedReference<RoomOp>;
}

@Entity()
@Unique({ properties: ['roomOp', 'createdBy', 'stateId'] })
export class UpdateFoobarOp {
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
    public hoge?: number;


    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp!: IdentifiedReference<RoomOp>;
}
