import { Cascade, Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Partici } from '../participant/mikro-orm';
import { RoomPrvMsg, RoomPubMsg, RoomSe } from '../roomMessage/mikro-orm';

// ユーザーがアカウント登録した時点では作られず、初めてentryなどをしたときに作られる。
@Entity()
export class User {
    public constructor({
        userUid
    }: {
        userUid: string;
    }) {
        this.userUid = userUid;
    }

    @PrimaryKey()
    public userUid: string;

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property()
    public isEntry: boolean = false;

    @OneToMany(() => Partici, x => x.user, { orphanRemoval: true })
    public particis = new Collection<Partici>(this);

    @OneToMany(() => RoomPubMsg, x => x.createdBy, { orphanRemoval: true })
    public roomPubMsgs = new Collection<RoomPubMsg>(this);

    @OneToMany(() => RoomPrvMsg, x => x.createdBy, { orphanRemoval: true })
    public roomPrvMsgs = new Collection<RoomPrvMsg>(this);

    @OneToMany(() => RoomPrvMsg, x => x.createdBy, { orphanRemoval: true })
    public roomSEs = new Collection<RoomSe>(this);

    @ManyToMany(() => RoomPrvMsg, x => x.visibleTo, { owner: true })
    public visibleRoomPrvMsgs = new Collection<RoomPrvMsg>(this);
}