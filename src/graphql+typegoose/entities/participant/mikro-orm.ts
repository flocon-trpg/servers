import { Collection, Entity, Enum, IdentifiedReference, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { ParticipantRole } from '../../../enums/ParticipantRole';
import { Room } from '../room/mikro-orm';
import { User } from '../user/mikro-orm';

@Entity()
@Unique({ properties: ['user', 'room'] })
export class Participant {
    public constructor({
        role,
        name,
    }: {
        role: ParticipantRole;
        name: string;
    }) {
        this.role = role;
        this.name = name;
    }

    @PrimaryKey()
    public id: string = v4();

    // firebase authのdisplayNameを用いずにnameを定義している理由は下の通り。
    // 1. firebase authのdisplayNameは string|undefined なので、もしかしたら存在しないケースがあるのかもしれない。
    // 2. 部屋によっては匿名で入りたい場合もあるかもしれない？
    @Property()
    public name: string;

    // 入室したあとに退室すると、Participantエンティティが削除されるのではなくnullishになる。理由は、作成したキャラクターやメッセージなどを残すため。
    @Enum({ items: () => ParticipantRole, nullable: true })
    public role?: ParticipantRole;

    @ManyToOne(() => User, { wrappedReference: true })
    public user!: IdentifiedReference<User>;

    @ManyToOne(() => Room, { wrappedReference: true })
    public room!: IdentifiedReference<Room>;
}