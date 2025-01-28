import { Entity, ManyToOne, PrimaryKey, Property, Ref, Unique } from '@mikro-orm/core';
import { v7 } from 'uuid';
import { ParticipantRoleType } from '../../../enums/ParticipantRoleType';
import { Room } from '../room/entity';
import { User } from '../user/entity';

// JSONにおいてParticipantのnameとroleはnullable（xというParticipantがいるとして、xが作者であるcharacterなどは存在するが、xがentityとして見つからなかったときに起こる）なので、entityでnullableをfalseにする意味もないと判断したためtrueにしている

@Entity()
@Unique({ properties: ['room', 'user'] })
export class Participant {
    @PrimaryKey()
    public id: string = v7();

    @Property({ type: 'string', index: true, nullable: true })
    public role?: ParticipantRoleType;

    @Property({ nullable: true })
    public name?: string;

    @ManyToOne(() => Room, { ref: true })
    public room!: Ref<Room>;

    @ManyToOne(() => User, { ref: true })
    public user!: Ref<User>;
}
