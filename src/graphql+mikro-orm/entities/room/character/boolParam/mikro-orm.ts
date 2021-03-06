import { Entity, IdentifiedReference, Index, JsonType, ManyToOne, PrimaryKey, Property, Reference, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { AddCharaOp, Chara, RemoveCharaOp, UpdateCharaOp } from '../mikro-orm';
import { Room, RoomOp } from '../../mikro-orm';
import { ReplaceNullableBooleanDownOperation } from '../../../../Operations';

type BoolParamBaseParams = {
    key: string;
    isValuePrivate: boolean;
    value?: boolean;
}

export abstract class BoolParamBase {
    public constructor({
        key,
        isValuePrivate,
        value,
    }: BoolParamBaseParams) {
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
    public constructor(params: BoolParamBaseParams & {chara: Chara}) {
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
@Unique({ properties: ['removeCharaOp', 'key'] })
export class RemovedBoolParam extends BoolParamBase {
    public constructor(params: BoolParamBaseParams & { removeCharaOp: RemoveCharaOp }) {
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
@Unique({ properties: ['updateCharaOp', 'key'] })
export class UpdateBoolParamOp {
    public constructor({
        key,
        updateCharaOp,
    }: {
        key: string;
        updateCharaOp: UpdateCharaOp;
    }) {
        this.key = key;
        this.updateCharaOp = Reference.create(updateCharaOp);
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
    public updateCharaOp: IdentifiedReference<UpdateCharaOp>;
}