import {
    Entity,
    IdentifiedReference,
    ManyToOne,
    PrimaryKey,
    Property,
    Unique,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { ParticipantRoleType } from '../../../enums/ParticipantRoleType';
import { Room } from '../room/mikro-orm';
import { User } from '../user/mikro-orm';

// JSONにおいてParticipantのnameとroleはnullable（xというParticipantがいるとして、xが作者であるcharacterなどは存在するが、xがentityとして見つからなかったときに起こる）なので、entityでnullableをfalseにする意味もないと判断したためtrueにしている

@Entity()
@Unique({ properties: ['room', 'user'] })
export class Participant {
    @PrimaryKey()
    public id: string = v4();

    @Property({ type: 'string', index: true, nullable: true })
    public role?: ParticipantRoleType;

    @Property({ nullable: true })
    public name?: string;

    @ManyToOne(() => Room)
    public room!: IdentifiedReference<Room>;

    @ManyToOne(() => User)
    public user!: IdentifiedReference<User, 'userUid'>;
}
