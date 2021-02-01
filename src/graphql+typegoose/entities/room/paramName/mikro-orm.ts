import { Entity, Enum, IdentifiedReference, Index, JsonType, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { RoomParameterNameType } from '../../../../enums/RoomParameterNameType';
import { TextDownOperationUnit } from '../../../Operations';
import { Room, RoomOp } from '../../room/mikro-orm';

// 例えば (key, type) = ('1', Str) のとき、そのRoomのすべてのCharacterは'1'というkeyで文字列のパラメーターを設定できるようになる。
export abstract class ParamNameBase {
    public constructor({
        type,
        key,
        name,
    }: {
        type: RoomParameterNameType;
        key: string;
        name: string;
    }) {
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
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room!: IdentifiedReference<Room>;
}

@Entity()
@Unique({ properties: ['roomOp', 'type', 'key'] })
export class AddParamNameOp {
    public constructor({
        type,
        key,
    }: {
        type: RoomParameterNameType;
        key: string;
    }) {
        this.type = type;
        this.key = key;
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
    public roomOp!: IdentifiedReference<RoomOp>;
}

@Entity()
@Unique({ properties: ['roomOp', 'type', 'key'] })
export class RemoveParamNameOp extends ParamNameBase {
    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp!: IdentifiedReference<RoomOp>;
}

@Entity()
@Unique({ properties: ['roomOp', 'type', 'key'] })
export class UpdateParamNameOp {
    public constructor({
        type,
        key,
    }: {
        type: RoomParameterNameType;
        key: string;
    }) {
        this.type = type;
        this.key = key;
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
    public roomOp!: IdentifiedReference<RoomOp>;
}
