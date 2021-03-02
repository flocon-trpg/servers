import { Entity, IdentifiedReference, Index, JsonType, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { AddCharaOp, Chara, RemoveCharaOp, UpdateCharaOp } from '../mikro-orm';
import { Room, RoomOp } from '../../mikro-orm';
import { ReplaceNullableBooleanDownOperation } from '../../../../Operations';

export abstract class BoolParamBase {
    public constructor({
        key,
        isValuePrivate,
        value,
    }: {
        key: string;
        isValuePrivate: boolean;
        value?: boolean;
    }) {
        this.key = key;
        this.isValuePrivate = isValuePrivate;
        this.value = value;
    }

    @PrimaryKey()
    public id: string = v4();


    @Property()
    @Index()
    public key: string;


    @Property()
    public isValuePrivate: boolean;
    @Property({ nullable: true })
    public value?: boolean;
}

@Entity()
@Unique({ properties: ['chara', 'key'] })
export class BoolParam extends BoolParamBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => Chara, { wrappedReference: true })
    public chara!: IdentifiedReference<Chara>;
}

@Entity()
@Unique({ properties: ['removeCharaOp', 'key'] })
export class RemovedBoolParam extends BoolParamBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => RemoveCharaOp, { wrappedReference: true })
    public removeCharaOp!: IdentifiedReference<RemoveCharaOp>;
}

@Entity()
@Unique({ properties: ['updateCharaOp', 'key'] })
export class UpdateBoolParamOp {
    public constructor({
        key,
    }: {
        key: string;
    }) {
        this.key = key;
    }

    @PrimaryKey()
    public id: string = v4();


    @Property()
    @Index()
    public key: string;


    @Property({ nullable: true })
    public isValuePrivate?: boolean;

    @Property({ type: JsonType, nullable: true })
    public value?: ReplaceNullableBooleanDownOperation;


    @ManyToOne(() => UpdateCharaOp, { wrappedReference: true })
    public updateCharaOp!: IdentifiedReference<UpdateCharaOp>;
}