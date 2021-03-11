import { User } from '../../user/mikro-orm';
import { Collection, Entity, Enum, IdentifiedReference, Index, JsonType, ManyToOne, OneToMany, OneToOne, PrimaryKey, PrimaryKeyType, Property, Reference, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Room, RoomOp } from '../mikro-orm';
import { ParticipantRoleOperation } from '../../../../enums/ParticipantRoleOperation';
import { ParticipantRole } from '../../../../enums/ParticipantRole';
import { AddMyValueOp, MyValue, RemovedMyValue, RemoveMyValueOp, UpdateMyValueOp } from './myValue/mikro-orm_value';

type ParticiBaseParams = {
    role: ParticipantRole | undefined;
    name: string;
}

export class ParticiBase {
    public constructor({
        role,
        name,
    }: ParticiBaseParams) {
        this.role = role;
        this.name = name;
    }

    @PrimaryKey()
    public id: string = v4();

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;

    // firebase authのdisplayNameを用いずにnameを定義している理由は下の通り。
    // 1. firebase authのdisplayNameは string|undefined なので、もしかしたら存在しないケースがあるのかもしれない。
    // 2. 部屋ごとに名前を変えたいケースもあるかもしれない？
    @Property()
    public name: string;

    // 入室したあとに退室すると、Participantエンティティが削除されるのではなくnullishになる。理由は、作成したキャラクターやメッセージなどを残すため。
    @Enum({ items: () => ParticipantRole, nullable: true })
    public role?: ParticipantRole;
}

@Entity()
@Unique({ properties: ['user', 'room'] })
export class Partici extends ParticiBase {
    public constructor(params: {
        role: ParticipantRole | undefined;
        name: string;
        user: User;
        room: Room;
    }) {
        super(params);
        this.user = Reference.create<User, 'userUid'>(params.user);
        this.room = Reference.create(params.room);
    }

    @ManyToOne(() => User, { wrappedReference: true })
    public user: IdentifiedReference<User, 'userUid'>;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room: IdentifiedReference<Room>;

    @OneToMany(() => MyValue, x => x.partici, { orphanRemoval: true })
    public myValues = new Collection<MyValue>(this);
}

// 削除はroleをundefinedにすることによって表現されるが、もしRemoveParticiOpが存在しないと入退室を繰り返すことで不必要なParticipantがデータベース内に大量に残ってしまうことになるため、一応削除手段を設けるという意味でRemoveParticiOpを定義している。
@Entity()
@Unique({ properties: ['roomOp', 'user'] })
export class RemoveParticiOp extends ParticiBase {
    public constructor(params: {
        role: ParticipantRole | undefined;
        name: string;
        user: User;
        roomOp: RoomOp;
    }) {
        super(params);
        this.user = Reference.create<User, 'userUid'>(params.user);
        this.roomOp = Reference.create(params.roomOp);
    }

    @ManyToOne(() => User, { wrappedReference: true })
    public user: IdentifiedReference<User, 'userUid'>;

    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp: IdentifiedReference<RoomOp>;

    @OneToMany(() => RemovedMyValue, x => x.removeParticiOp, { orphanRemoval: true })
    public removedMyValues = new Collection<RemovedMyValue>(this);
}

@Entity()
@Unique({ properties: ['roomOp', 'user'] })
export class AddParticiOp {
    public constructor(params: {
        user: User;
        roomOp: RoomOp;
    }) {
        this.user = Reference.create<User, 'userUid'>(params.user);
        this.roomOp = Reference.create(params.roomOp);
    }

    @PrimaryKey()
    public id: string = v4();


    @ManyToOne(() => User, { wrappedReference: true })
    public user: IdentifiedReference<User, 'userUid'>;


    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp: IdentifiedReference<RoomOp>;
}

@Entity()
@Unique({ properties: ['roomOp', 'user'] })
export class UpdateParticiOp {
    public constructor(params: {
        user: User;
        roomOp: RoomOp;
    }) {
        this.user = Reference.create<User, 'userUid'>(params.user);
        this.roomOp = Reference.create(params.roomOp);
    }

    @PrimaryKey()
    public id: string = v4();

    @Property({ nullable: true })
    public name?: string;

    @Enum({ items: () => ParticipantRoleOperation, nullable: true })
    public role?: ParticipantRoleOperation;


    @ManyToOne(() => User, { wrappedReference: true })
    public user: IdentifiedReference<User, 'userUid'>;

    @ManyToOne(() => RoomOp, { wrappedReference: true })
    public roomOp: IdentifiedReference<RoomOp>;


    @OneToMany(() => AddMyValueOp, x => x.updateParticiOp, { orphanRemoval: true })
    public addMyValueOps = new Collection<AddMyValueOp>(this);

    @OneToMany(() => UpdateMyValueOp, x => x.updateParticiOp, { orphanRemoval: true })
    public updateMyValueOps = new Collection<UpdateMyValueOp>(this);

    @OneToMany(() => RemoveMyValueOp, x => x.updateParticiOp, { orphanRemoval: true })
    public removeMyValueOps = new Collection<RemoveMyValueOp>(this);
}