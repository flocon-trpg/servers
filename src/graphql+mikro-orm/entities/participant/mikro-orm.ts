import { User } from '../user/mikro-orm';
import { Collection, Entity, Enum, IdentifiedReference, Index, JsonType, ManyToOne, OneToMany, OneToOne, PrimaryKey, PrimaryKeyType, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { FileSourceType } from '../../../enums/FileSourceType';
import { ReplaceNullableFilePathDownOperation, ReplaceNullableNumberDownOperation } from '../../Operations';
import { Room, RoomOp } from '../room/mikro-orm';
import { ParticipantRoleOperation } from '../../../enums/ParticipantRoleOperation';
import { ParticipantRole } from '../../../enums/ParticipantRole';

// Removeは存在しない（削除はroleをundefinedにすることによって表現される）ため、RemoveParticiOpは存在しない。

@Entity()
@Unique({ properties: ['user', 'room'] })
export class Partici {
    public constructor({
        role,
        name,
    }: {
    role: ParticipantRole | undefined;
    name: string;
}) {
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

    @ManyToOne(() => User, { wrappedReference: true })
    public user!: IdentifiedReference<User, 'userUid'>;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room!: IdentifiedReference<Room>;
}

@Entity()
@Unique({ properties: ['particiOp', 'user'] })
export class AddParticiOp {
    @PrimaryKey()
    public id: string = v4();


    @ManyToOne(() => User, { wrappedReference: true })
    public user!: IdentifiedReference<User, 'userUid'>;


    @ManyToOne(() => ParticiOp, { wrappedReference: true })
    public particiOp!: IdentifiedReference<ParticiOp>;
}

@Entity()
@Unique({ properties: ['particiOp', 'user'] })
export class UpdateParticiOp {
    @PrimaryKey()
    public id: string = v4();

    @Property({nullable: true})
    public name?: string;

    @Enum({ items: () => ParticipantRoleOperation, nullable: true })
    public role?: ParticipantRoleOperation;


    @ManyToOne(() => User, { wrappedReference: true })
    public user!: IdentifiedReference<User, 'userUid'>;

    @ManyToOne(() => ParticiOp, { wrappedReference: true })
    public particiOp!: IdentifiedReference<ParticiOp>;
}

@Entity()
@Unique({ properties: ['prevRevision', 'room'] })
export class ParticiOp {
    public constructor({
        prevRevision,
    }: {
        prevRevision: number;
    }) {
        this.prevRevision = prevRevision;
    }


    @PrimaryKey()
    public id: string = v4();


    @Property()
    public prevRevision: number;


    @ManyToOne(() => Room, { wrappedReference: true })
    public room!: IdentifiedReference<Room>;


    @OneToMany(() => AddParticiOp, x => x.particiOp, { orphanRemoval: true })
    public addParticiOps = new Collection<AddParticiOp>(this);

    @OneToMany(() => UpdateParticiOp, x => x.particiOp, { orphanRemoval: true })
    public updateParticiOps = new Collection<UpdateParticiOp>(this);
}