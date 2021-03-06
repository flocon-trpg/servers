import { Entity, Enum, IdentifiedReference, Index, JsonType, ManyToOne, PrimaryKey, Property, Reference, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { RoomParameterNameType } from '../../../../enums/RoomParameterNameType';
import { TextDownOperationUnit } from '../../../Operations';
import { Room, RoomOp } from '../mikro-orm';

type ParamNameBaseParams = {
    type: RoomParameterNameType;
    key: string;
    name: string;
}

// 例えば (key, type) = ('1', Str) のとき、そのRoomのすべてのCharacterは'1'というkeyで文字列のパラメーターを設定できるようになる。
export abstract class ParamNameBase {
    public constructor({
        type,
        key,
        name,
    }: ParamNameBaseParams) {
        this.type = type;
        this.key = key;
        this.name = name;
    }

    @PrimaryKey()
    public id: string = v4();


    // 現在は'1'～'100'が使用可能ということにしている。
    @Property()
    @Index()
    public key: string;

    @Enum({ items: () => RoomParameterNameType })
    @Index()
    public type: RoomParameterNameType;


    @Property()
    public name: string;
}

@Entity()
@Unique({ properties: ['room', 'type', 'key'] })
export class ParamName extends ParamNameBase {
    public constructor(params: ParamNameBaseParams & { room: Room }) {
        super(params);
        this.room = Reference.create(params.room);
    }

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room: IdentifiedReference<Room>;
}

@Entity()
@Unique({ properties: ['roomOp', 'type', 'key'] })
export class AddParamNameOp {
    public constructor({
        type,
        key,
        roomOp,
    }: {
        type: RoomParameterNameType;
        key: string;
        roomOp: RoomOp;
    }) {
        this.type = type;
        this.key = key;
        this.roomOp = Reference.create(roomOp);
    }

    @PrimaryKey()
    public id: string = v4();


    @Enum({ items: () => RoomParameterNameType })
    @Index()
    public type: RoomParameterNameType;

    // 現在は'1'～'100'が使用可能ということにしている。
    @Property()
    @Index()
    public key: string;


    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp: IdentifiedReference<RoomOp>;
}

@Entity()
@Unique({ properties: ['roomOp', 'type', 'key'] })
export class RemoveParamNameOp extends ParamNameBase {
    public constructor(params: ParamNameBaseParams & { roomOp: RoomOp }) {
        super(params);
        this.roomOp = Reference.create(params.roomOp);
    }

    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp: IdentifiedReference<RoomOp>;
}

@Entity()
@Unique({ properties: ['roomOp', 'type', 'key'] })
export class UpdateParamNameOp {
    public constructor({
        type,
        key,
        roomOp,
    }: {
        type: RoomParameterNameType;
        key: string;
        roomOp: RoomOp;
    }) {
        this.type = type;
        this.key = key;
        this.roomOp = Reference.create(roomOp);
    }

    @PrimaryKey()
    public id: string = v4();


    @Enum({ items: () => RoomParameterNameType })
    @Index()
    public type: RoomParameterNameType;

    // 現在は'1'～'100'が使用可能ということにしている。
    @Property()
    @Index()
    public key: string;


    @Property({ nullable: true })
    public name?: string;


    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp: IdentifiedReference<RoomOp>;
}
