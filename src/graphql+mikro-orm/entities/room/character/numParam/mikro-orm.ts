import { Entity, IdentifiedReference, Index, JsonType, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { AddCharaOp, Chara, RemoveCharaOp, UpdateCharaOp } from '../mikro-orm';
import { Room, RoomOp } from '../../mikro-orm';
import { ReplaceNullableNumberDownOperation } from '../../../../Operations';

// ****main value****

export abstract class NumParamBase {
    public constructor({
        key,
        isValuePrivate,
        value,
    }: {
        key: string;
        isValuePrivate: boolean;
        value?: number;
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
    public value?: number;
}

@Entity()
@Unique({ properties: ['chara', 'key'] })
export class NumParam extends NumParamBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => Chara, { wrappedReference: true })
    public chara!: IdentifiedReference<Chara>;
}

@Entity()
@Unique({ properties: ['removeCharaOp', 'key'] })
export class RemovedNumParam extends NumParamBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => RemoveCharaOp, { wrappedReference: true })
    public removeCharaOp!: IdentifiedReference<RemoveCharaOp>;
}

@Entity()
@Unique({ properties: ['updateCharaOp', 'key'] })
export class UpdateNumParamOp {
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
    public value?: ReplaceNullableNumberDownOperation;


    @ManyToOne(() => UpdateCharaOp, { wrappedReference: true })
    public updateCharaOp!: IdentifiedReference<UpdateCharaOp>;
}

// ****max value****

export abstract class NumMaxParamBase {
    public constructor({
        key,
        isValuePrivate,
        value,
    }: {
        key: string;
        isValuePrivate: boolean;
        value?: number;
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
    public value?: number;
}

@Entity()
@Unique({ properties: ['chara', 'key'] })
export class NumMaxParam extends NumMaxParamBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => Chara, { wrappedReference: true })
    public chara!: IdentifiedReference<Chara>;
}

@Entity()
@Unique({ properties: ['removeCharaOp', 'key'] })
export class RemovedNumMaxParam extends NumMaxParamBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => RemoveCharaOp, { wrappedReference: true })
    public removeCharaOp!: IdentifiedReference<RemoveCharaOp>;
}

@Entity()
@Unique({ properties: ['updateCharaOp', 'key'] })
export class UpdateNumMaxParamOp {
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
    public value?: ReplaceNullableNumberDownOperation;


    @ManyToOne(() => UpdateCharaOp, { wrappedReference: true })
    public updateCharaOp!: IdentifiedReference<UpdateCharaOp>;
}