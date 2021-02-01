import { Entity, IdentifiedReference, Index, JsonType, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { TextDownOperationUnit } from '../../../Operations';
import { AddCharaOp, Chara, RemoveCharaOp, UpdateCharaOp } from '../mikro-orm';
import { Room, RoomOp } from '../../room/mikro-orm';

export abstract class StrParamBase {
    public constructor({
        key,
        isValuePrivate,
        value,
    }: {
        key: string;
        isValuePrivate: boolean;
        value: string;
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
    @Property()
    public value: string;
}

@Entity()
@Unique({ properties: ['chara', 'key'] })
export class StrParam extends StrParamBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => Chara, { wrappedReference: true })
    public chara!: IdentifiedReference<Chara>;
}

@Entity()
@Unique({ properties: ['removeCharaOp', 'key'] })
export class RemovedStrParam extends StrParamBase {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => RemoveCharaOp, { wrappedReference: true })
    public removeCharaOp!: IdentifiedReference<RemoveCharaOp>;
}

@Entity()
@Unique({ properties: ['updateCharaOp', 'key'] })
export class UpdateStrParamOp {
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
    public value?: TextDownOperationUnit[];


    @ManyToOne(() => UpdateCharaOp, { wrappedReference: true })
    public updateCharaOp!: IdentifiedReference<UpdateCharaOp>;
}